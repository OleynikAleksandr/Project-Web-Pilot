#!/usr/bin/env python3
from __future__ import annotations

import argparse
import asyncio
import hashlib
import json
import os
import shutil
import subprocess
import threading
import time
import uuid
from pathlib import Path
from typing import Annotated, Any, Literal

from mcp.server.fastmcp import FastMCP, Image
from mcp.types import ToolAnnotations
from pydantic import Field

from app_server_client import AppServerClient


READ_ONLY = ToolAnnotations(
    readOnlyHint=True, destructiveHint=False, idempotentHint=True, openWorldHint=False
)
ARBITRARY_COMMAND = ToolAnnotations(
    readOnlyHint=False, destructiveHint=True, idempotentHint=False, openWorldHint=True
)
LOCAL_NOTIFICATION = ToolAnnotations(
    readOnlyHint=False, destructiveHint=False, idempotentHint=False, openWorldHint=False
)

MAX_VIEW_IMAGE_BYTES = 20_000_000
MAX_PATCH_BYTES = 1_000_000
MAX_OUTPUT = 120_000
STDIN_CLOSED_MESSAGE = "stdin is closed for this session; rerun exec_command with tty=true to keep stdin open"
PREEXECUTION_RETRY_RULE = "If OpenAI blocked the call before execution, retry the same call once unchanged; change or split it only if the retry is blocked too."
# ChatGPT shows a model roughly 10 000 tokens of one tool result; a text-only part of 28 000 bytes
# is about 7 000 tokens of Russian text.
CONTEXT_PART_BYTES = 28_000
SESSION_RULES_FILE = Path(__file__).resolve().parent / "session-rules.md"
ACTIVE_WORKSPACE_FILE = "active-workspace.json"
CODEX_TOOLS_LOCK_FILE = Path(__file__).resolve().parent / "codex-tools.lock.json"

SENSITIVE_NAMES = {
    ".env", ".npmrc", ".pypirc", ".netrc", "credentials", "credentials.json",
    "id_rsa", "id_ed25519", "bridge_config.json", "tunnel-key.dpapi",
}
SENSITIVE_SUFFIXES = {".pem", ".key", ".pfx", ".p12"}
SENSITIVE_DIRS = {".ssh", ".gnupg", "keychains", "credentials", "wallets"}
SENSITIVE_FRAGMENTS = [
    ("library", "safari"),
    ("library", "accounts"),
    ("google", "chrome", "user data"),
    ("microsoft", "edge", "user data"),
    ("mozilla", "firefox", "profiles"),
    ("codexlocalmac", "private"),
    ("webpilotcodexexecutor", "private"),
]

def clamp(text: str, limit: int = MAX_OUTPUT) -> str:
    return text if len(text) <= limit else text[:limit] + f"\n\n[TRUNCATED: {len(text)-limit} chars omitted]"


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def is_sensitive(path: Path) -> bool:
    parts = tuple(part.lower() for part in path.parts)
    name = path.name.lower()
    if name in SENSITIVE_NAMES or name.startswith(".env.") or path.suffix.lower() in SENSITIVE_SUFFIXES:
        return True
    if any(part in SENSITIVE_DIRS for part in parts):
        return True
    for fragment in SENSITIVE_FRAGMENTS:
        width = len(fragment)
        if any(parts[i:i+width] == fragment for i in range(len(parts)-width+1)):
            return True
    return False


class LocalFacade:
    def __init__(self, client: AppServerClient, state_root: Path) -> None:
        self.client = client
        self.state_root = state_root
        state_root.mkdir(parents=True, exist_ok=True, mode=0o700)
        try:
            # The recoverable-delete folder of 0.6.94 and earlier: rmdir removes it only when it is empty.
            (state_root / "trash").rmdir()
        except OSError:
            pass
        self._command_sessions: dict[str, tuple[int, bool]] = {}
        self._command_sessions_lock = threading.Lock()

    def resolve(self, path: str, *, must_exist: bool = False, allow_sensitive: bool = False) -> Path:
        candidate = Path(path).expanduser()
        if not candidate.is_absolute():
            candidate = Path(self.client.cwd) / candidate
        resolved = candidate.resolve(strict=False)
        if must_exist and not resolved.exists():
            raise ValueError(f"Path does not exist: {resolved}")
        if not allow_sensitive and is_sensitive(resolved):
            raise ValueError("Sensitive credential/private path is not available")
        return resolved

    def _command(
        self,
        argv: list[str],
        *,
        cwd: str | Path | None = None,
        timeout_ms: int = 30_000,
        write: bool = False,
        output_cap: int = 200_000,
    ) -> dict[str, Any]:
        result = self.client.command_exec(
            argv,
            cwd=str(cwd) if cwd else self.client.cwd,
            timeout_ms=timeout_ms,
            output_bytes_cap=output_cap,
            # Fixed internal argv are constrained by this facade; readOnly sandbox on macOS\n            # blocks harmless tool caches (notably /usr/bin/git via xcrun) and adds ~600 ms.\n            sandbox_policy={"type": "dangerFullAccess"},
        )
        return {
            "ok": result.get("exitCode") == 0,
            "exit_code": result.get("exitCode"),
            "stdout": clamp(str(result.get("stdout") or "")),
            "stderr": clamp(str(result.get("stderr") or "")),
        }

    def _codex_tools_status(self) -> dict[str, Any]:
        installed_text = str(self.client.binary.version)
        installed_version = next(
            (part for part in installed_text.replace(",", " ").split() if part[:1].isdigit() and part.count(".") >= 2),
            installed_text,
        )
        pinned_version = None
        pinned_tag = None
        lock_error = None
        try:
            lock = json.loads(CODEX_TOOLS_LOCK_FILE.read_text(encoding="utf-8"))
            pinned_version = lock.get("codex_version")
            pinned_tag = lock.get("tag")
        except Exception as exc:
            lock_error = str(exc)
        probe = self._command(["/usr/bin/which", "apply_patch"], timeout_ms=10_000)
        return {
            "pinned_version": pinned_version,
            "pinned_tag": pinned_tag,
            "installed_version": installed_version,
            "version_matches": bool(pinned_version and installed_version == pinned_version),
            "apply_patch_available": bool(probe["ok"] and probe["stdout"].strip()),
            **({"lock_error": lock_error} if lock_error else {}),
        }

    def status(self, repository: str = "") -> dict[str, Any]:
        data = {
            "executor": self.client.status(),
            "filesystem_scope": "local macOS filesystem with current user permissions",
            "repository_mode": "per-call",
            "state_root": str(self.state_root),
            "local_only": True,
            "model_turns": "forbidden",
            "codex_tools": self._codex_tools_status(),
        }
        if repository:
            repo = self.resolve(repository, must_exist=True, allow_sensitive=True)
            git = self._command(["git", "status", "--short", "--branch"], cwd=repo)
            data["repository"] = str(repo)
            data["git"] = git
        return data

    def workflow_recover(self, workspace: str, session_id: str = "") -> dict[str, Any]:
        root = self.resolve(workspace, must_exist=True, allow_sensitive=True)
        script = root / "scripts/workflow"
        plan_file = root / ".harness/plans/todo-plan.md"
        if not script.is_file() or not plan_file.is_file():
            raise ValueError("WORKFLOW_NOT_INSTALLED")
        before = self.client.fs_read_file(str(plan_file))
        argv = [str(script), "recover", "--format", "json"]
        if session_id:
            argv += ["--session", session_id]
        result = self._command(argv, cwd=root, timeout_ms=30_000, output_cap=400_000)
        if not result["ok"]:
            raise ValueError("RECOVERY_FAILED: " + result["stdout"][:2000] + result["stderr"][:1000])
        packet = json.loads(result["stdout"])
        after = self.client.fs_read_file(str(plan_file))
        if before != after:
            raise ValueError("RECOVERY_CHANGED")
        text = packet.get("text")
        if packet.get("ok") is not True or not isinstance(text, str) or not text.strip():
            raise ValueError("RECOVERY_INCOMPLETE")
        raw = text.encode("utf-8")
        return {
            "delivery_protocol": "inline-context-v1",
            "status": "ready",
            "completeness": packet.get("completeness"),
            "workspace": str(root),
            "head": packet.get("head"),
            "signature": packet.get("signature"),
            "context": text,
            "context_sha256": sha256_bytes(raw),
            "context_bytes": len(raw),
            "generated_at_ms": int(time.time() * 1000),
            "ack_required": False,
        }

    def active_workspace(self) -> str:
        """The project Web Pilot has open; Web Pilot writes it for calls without a workspace."""
        record = self.state_root / ACTIVE_WORKSPACE_FILE
        try:
            workspace = json.loads(record.read_text(encoding="utf-8")).get("workspace")
        except (OSError, ValueError, AttributeError):
            workspace = None
        if not isinstance(workspace, str) or not Path(workspace).is_absolute():
            raise ValueError("WORKSPACE_REQUIRED: no project is open in Web Pilot; ask the user for the absolute project folder path")
        return workspace

    def workflow_context(self, workspace: str = "", session_id: str = "", part: int = 0, after: str = "") -> dict[str, Any] | str:
        workspace = workspace.strip() or self.active_workspace()
        result = self.workflow_recover(workspace, session_id)
        return context_part(result, part, after) if part else result














    @staticmethod
    def _native_apply_patch_error(detail: str) -> ValueError:
        text = detail.strip() or "apply_patch failed"
        lowered = text.lower()
        unavailable = any(
            marker in lowered
            for marker in ("no such file or directory", "command not found", "not found in path", "failed to spawn")
        )
        if unavailable:
            return ValueError(f"Codex apply_patch command is unavailable: {text}")
        return ValueError(text)

    def apply_patch(self, patch: str, workdir: str) -> str:
        if not isinstance(patch, str) or not patch.strip():
            raise ValueError("patch is empty")
        data = patch.encode("utf-8")
        if len(data) > MAX_PATCH_BYTES:
            raise ValueError(f"patch is larger than {MAX_PATCH_BYTES} bytes")
        if not patch.lstrip().startswith("*** Begin Patch"):
            raise ValueError("patch must start with *** Begin Patch")
        cwd = self._command_workdir(workdir)
        started = self.client.start_command(
            ["apply_patch"],
            cwd=str(cwd),
            output_bytes_cap=1_000_000,
            sandbox_policy={"type": "dangerFullAccess"},
            stream_stdin=True,
        )
        process_id = str(started["process_id"])
        try:
            self.client.write_command_stdin(process_id, data, close_stdin=True)
        except Exception as exc:
            result = self.client.read_command_output(process_id, cursor=0, wait_ms=100)
            detail = str(result.get("error") or result.get("output") or exc)
            raise self._native_apply_patch_error(detail) from None
        result = self.client.read_command_output(process_id, cursor=0, wait_ms=60_000)
        if result.get("running"):
            result = self.client.read_command_output(process_id, cursor=0, wait_ms=60_000)
        if result.get("running"):
            try:
                self.client.request("command/exec/terminate", {"processId": process_id}, timeout=10.0)
            except Exception:
                pass
            raise ValueError("Codex apply_patch did not finish within 120 seconds")
        if result.get("error"):
            raise self._native_apply_patch_error(str(result["error"]))
        output = str(result.get("output") or "").strip()
        if result.get("exit_code") != 0:
            raise self._native_apply_patch_error(output or f"apply_patch exited with code {result.get('exit_code')}")
        return output or "Done!"

    def view_image(self, path: str) -> Any:
        target = self.resolve(path, must_exist=True)
        if not target.is_file():
            raise ValueError(f"Image path is not a file: {target}")
        size = target.stat().st_size
        if size > MAX_VIEW_IMAGE_BYTES:
            raise ValueError(f"Image is larger than {MAX_VIEW_IMAGE_BYTES} bytes")
        try:
            probe = subprocess.run(
                ["/usr/bin/file", "--mime-type", "-b", str(target)],
                capture_output=True,
                text=True,
                timeout=10,
                check=False,
            )
        except (OSError, subprocess.TimeoutExpired) as exc:
            raise ValueError(f"Image type check failed: {exc}") from None
        mime = (probe.stdout or "").strip().lower()
        if probe.returncode != 0 or not mime.startswith("image/"):
            raise ValueError("File is not an image")
        suffix = target.suffix if 0 < len(target.suffix) <= 16 else ".image"
        copy = self.state_root / f"view-image-{uuid.uuid4().hex}{suffix}"
        try:
            shutil.copyfile(target, copy)
            try:
                resized = subprocess.run(
                    ["/usr/bin/sips", "-Z", "1600", str(copy)],
                    capture_output=True,
                    text=True,
                    timeout=30,
                    check=False,
                )
            except (OSError, subprocess.TimeoutExpired) as exc:
                raise ValueError(f"Image resize failed: {exc}") from None
            if resized.returncode != 0:
                raise ValueError((resized.stderr or "").strip() or "Image format is not supported")
            data = copy.read_bytes()
            image_format = mime.split("/", 1)[1]
            return [{"source": str(target), "bytes": len(data)}, Image(data=data, format=image_format)]
        finally:
            try:
                copy.unlink()
            except OSError:
                pass

    @staticmethod
    def _command_limit(name: str, value: int, minimum: int, maximum: int) -> int:
        if type(value) is not int:
            raise ValueError(f"{name} must be an integer from {minimum} to {maximum}")
        return max(minimum, min(value, maximum))

    def _command_workdir(self, workdir: str) -> Path:
        if not isinstance(workdir, str) or not workdir.strip():
            raise ValueError("workdir is required")
        cwd = self.resolve(workdir, must_exist=True, allow_sensitive=True)
        if not cwd.is_dir():
            raise ValueError(f"workdir is not a directory: {cwd}")
        return cwd

    def _command_shell(self, shell: str) -> str:
        requested = shell.strip() if isinstance(shell, str) else ""
        if not requested:
            environment = getattr(self.client, "environment", {})
            requested = str(environment.get("SHELL") or os.environ.get("SHELL") or "/bin/zsh")
        if "/" not in requested:
            requested = shutil.which(requested) or f"/bin/{requested}"
        path = Path(requested).expanduser()
        if not path.is_absolute():
            raise ValueError("shell must name an executable shell")
        resolved = path.resolve(strict=False)
        if not resolved.is_file() or not os.access(resolved, os.X_OK):
            raise ValueError(f"shell is not executable: {resolved}")
        return str(resolved)

    @staticmethod
    def _truncate_command_output(output: str, max_output_tokens: int) -> tuple[str, int]:
        data = output.encode("utf-8")
        original_tokens = (len(data) + 3) // 4
        budget = max_output_tokens * 4
        if len(data) <= budget:
            return output, original_tokens
        marker = f"\n... {len(data) - budget} bytes omitted ...\n".encode("utf-8")
        usable = max(2, budget - len(marker))
        head = usable // 2
        tail = usable - head
        clipped = data[:head].decode("utf-8", errors="ignore") + marker.decode("utf-8") + data[-tail:].decode("utf-8", errors="ignore")
        return clipped, original_tokens

    @classmethod
    def _format_command_result(cls, result: dict[str, Any], max_output_tokens: int) -> str:
        output, original_tokens = cls._truncate_command_output(str(result.get("output") or ""), max_output_tokens)
        process_id = str(result["process_id"])
        duration = max(0.0, float(result.get("duration_ms") or 0) / 1000.0)
        if result.get("running"):
            state = f"Process running with session ID {process_id}"
        else:
            state = f"Process exited with code {result.get('exit_code')}"
        return (
            f"Chunk ID: {process_id[:8]}\n"
            f"Wall time: {duration:.3f} seconds\n"
            f"{state}\n"
            f"Original token count: {original_tokens}\n"
            f"Output:\n{output}"
        )

    def exec_command(
        self,
        cmd: str,
        workdir: str,
        shell: str = "",
        login: bool = True,
        tty: bool = False,
        yield_time_ms: int = 10_000,
        max_output_tokens: int = 8_000,
    ) -> str:
        if not isinstance(cmd, str) or not cmd.strip():
            raise ValueError("cmd must not be empty")
        cwd = self._command_workdir(workdir)
        executable = self._command_shell(shell)
        wait_ms = self._command_limit("yield_time_ms", yield_time_ms, 250, 30_000)
        token_limit = self._command_limit("max_output_tokens", max_output_tokens, 1, 8_000)
        if not isinstance(login, bool):
            raise ValueError("login must be true or false")
        if not isinstance(tty, bool):
            raise ValueError("tty must be true or false")
        started = self.client.start_command(
            [executable, "-lc" if login else "-c", cmd],
            cwd=str(cwd),
            output_bytes_cap=4_000_000,
            sandbox_policy={"type": "dangerFullAccess"},
            tty=tty,
            stream_stdin=tty,
        )
        process_id = str(started["process_id"])
        result = self.client.read_command_output(process_id, cursor=0, wait_ms=wait_ms)
        if result.get("error"):
            raise ValueError(str(result["error"]))
        if result.get("running"):
            with self._command_sessions_lock:
                self._command_sessions[process_id] = (int(result["cursor"]), tty)
        return self._format_command_result(result, token_limit)

    def write_stdin(
        self,
        session_id: str,
        chars: str = "",
        yield_time_ms: int = 250,
        max_output_tokens: int = 8_000,
    ) -> str:
        if not isinstance(session_id, str) or not session_id.strip():
            raise ValueError("session_id is required")
        if not isinstance(chars, str):
            raise ValueError("chars must be a string")
        wait_ms = self._command_limit(
            "yield_time_ms",
            yield_time_ms,
            250 if chars else 5_000,
            30_000 if chars else 60_000,
        )
        token_limit = self._command_limit("max_output_tokens", max_output_tokens, 1, 8_000)
        with self._command_sessions_lock:
            session = self._command_sessions.get(session_id)
        if session is None:
            raise ValueError(f"Unknown or finished command session: {session_id}")
        cursor, tty = session
        result = None
        if chars:
            status = self.client.read_command_output(session_id, cursor=cursor, wait_ms=0)
            if not status.get("running"):
                result = status
            else:
                try:
                    if not tty:
                        if chars != "\x03":
                            raise ValueError(STDIN_CLOSED_MESSAGE)
                        self.client.request(
                            "command/exec/terminate",
                            {"processId": session_id},
                            timeout=10.0,
                        )
                    else:
                        self.client.write_command_stdin(session_id, chars.encode("utf-8"))
                except ValueError:
                    raise
                except Exception:
                    status = self.client.read_command_output(session_id, cursor=cursor, wait_ms=0)
                    if status.get("running"):
                        raise
                    result = status
        interaction_started = time.monotonic()
        if result is None:
            result = self.client.read_command_output(session_id, cursor=cursor, wait_ms=wait_ms)
        result = dict(result)
        result["duration_ms"] = int((time.monotonic() - interaction_started) * 1000)
        if result.get("error"):
            with self._command_sessions_lock:
                self._command_sessions.pop(session_id, None)
            raise ValueError(str(result["error"]))
        with self._command_sessions_lock:
            if result.get("running"):
                self._command_sessions[session_id] = (int(result["cursor"]), tty)
            else:
                self._command_sessions.pop(session_id, None)
        return self._format_command_result(result, token_limit)





    # Observation only: this MCP lists windows and takes screenshots; it never drives the UI.
    # CoreGraphics through JXA needs neither Xcode tools nor Automation permission.
    # Options 1|16: on-screen windows only, no desktop elements; layer 0 is ordinary app windows.
    _WINDOW_LIST_JXA = (
        "ObjC.import('CoreGraphics');"
        "JSON.stringify((ObjC.deepUnwrap(ObjC.castRefToObject($.CGWindowListCopyWindowInfo(1|16,0)))||[])"
        ".filter(w=>w.kCGWindowLayer===0).map(w=>({window_id:w.kCGWindowNumber,"
        "application:w.kCGWindowOwnerName||'',pid:w.kCGWindowOwnerPID,"
        "title:w.kCGWindowName===undefined?null:w.kCGWindowName,bounds:w.kCGWindowBounds||null})))"
    )

    def computer_list_windows(self, title_contains: str = "", max_results: int = 200) -> dict[str, Any]:
        result = self._command(["/usr/bin/osascript", "-l", "JavaScript", "-e", self._WINDOW_LIST_JXA])
        if not result["ok"]:
            raise ValueError(result["stderr"] or "Window list is unavailable")
        try:
            windows = json.loads(result["stdout"])
        except json.JSONDecodeError:
            raise ValueError("Window list returned invalid data") from None
        if not isinstance(windows, list):
            raise ValueError("Window list returned invalid data")
        windows = [w for w in windows if isinstance(w, dict) and isinstance(w.get("window_id"), int)]
        needle = title_contains.lower().strip()
        limit = max(1, min(int(max_results), 500))
        rows = []
        for window in windows:
            title = window.get("title")
            application = str(window.get("application") or "")
            if needle and needle not in f"{title or ''} {application}".lower():
                continue
            bounds = window.get("bounds") if isinstance(window.get("bounds"), dict) else {}
            rows.append({
                "window_id": window["window_id"],
                "title": title,
                "application": application,
                "pid": window.get("pid"),
                "rect": {"x": bounds.get("X"), "y": bounds.get("Y"), "width": bounds.get("Width"), "height": bounds.get("Height")},
            })
            if len(rows) >= limit:
                break
        data: dict[str, Any] = {"windows": rows, "backend": "CoreGraphics window list"}
        if windows and all(w.get("title") is None for w in windows):
            # macOS hides window names from a process without Screen Recording permission.
            data["note"] = "Window titles are hidden: grant Screen Recording permission to Project Web Pilot."
        return data

    def _screenshot(self, options: list[str], max_dimension: int) -> bytes:
        path = self.state_root / f"screen-{uuid.uuid4().hex}.png"
        try:
            result = self._command(["/usr/sbin/screencapture", "-x", "-t", "png", *options, str(path)], write=True, timeout_ms=30_000)
            if not result["ok"]:
                raise ValueError(result["stderr"] or "Screen capture failed")
            if max_dimension > 0:
                self._command(["/usr/bin/sips", "-Z", str(max(100, min(int(max_dimension), 5000))), str(path)], write=True, timeout_ms=30_000)
            return self.client.fs_read_file(str(path))
        finally:
            try:
                path.unlink()
            except OSError:
                pass

    def computer_capture_screen(self, x: int | None = None, y: int | None = None, width: int | None = None, height: int | None = None, max_dimension: int = 1600, include_cursor: bool = True) -> Any:
        options = ["-C"] if include_cursor else []
        if None not in (x, y, width, height):
            options += ["-R", f"{int(x)},{int(y)},{int(width)},{int(height)}"]
        png = self._screenshot(options, max_dimension)
        return [{"source": "desktop", "bytes": len(png)}, Image(data=png, format="png")]

    def computer_capture_window(self, window_id: int, max_dimension: int = 1600) -> Any:
        if isinstance(window_id, bool) or not isinstance(window_id, int) or window_id <= 0:
            raise ValueError("window_id must be a positive integer from computer_list_windows")
        # -l captures that window even when another one covers it; -o leaves out the shadow.
        png = self._screenshot(["-o", "-l", str(window_id)], max_dimension)
        return [{"source": "window", "window_id": window_id, "bytes": len(png)}, Image(data=png, format="png")]


class TurnWatchdog:
    def __init__(self, facade: LocalFacade) -> None:
        self.facade = facade
        self._lock = threading.Lock()
        self._items: dict[str, threading.Timer] = {}

    def _notify(self, title: str, message: str) -> bool:
        script = 'on run argv\n display notification (item 2 of argv) with title (item 1 of argv)\nend run'
        try:
            result = self.facade._command(["/usr/bin/osascript", "-e", script, title[:80], message[:240]], write=True, timeout_ms=5000)
            return bool(result["ok"])
        except Exception:
            return False

    def action(self, action: str, summary: str, token: str, timeout_seconds: int, notify_checkpoint: bool) -> dict[str, Any]:
        bounded = max(60, min(int(timeout_seconds), 600))
        if action == "start":
            new = uuid.uuid4().hex
            timer = threading.Timer(bounded, self._notify, args=("Codex executor: возможно, ответ прерван", summary))
            timer.daemon = True
            with self._lock:
                self._items[new] = timer
            timer.start()
            return {"status": "watching", "turn_token": new, "timeout_seconds": bounded}
        if not token:
            raise ValueError("turn_token is required")
        with self._lock:
            timer = self._items.pop(token, None)
        if timer is None:
            raise ValueError("Unknown or expired turn_token")
        timer.cancel()
        if action == "checkpoint":
            if notify_checkpoint:
                self._notify("Codex executor: работа продолжается", summary)
            new_timer = threading.Timer(bounded, self._notify, args=("Codex executor: возможно, ответ прерван", summary))
            new_timer.daemon = True
            with self._lock:
                self._items[token] = new_timer
            new_timer.start()
            return {"status": "watching", "turn_token": token, "timeout_seconds": bounded}
        if action == "complete":
            return {"status": "completed", "turn_token": token, "notification_requested": self._notify("Codex executor: ответ готов", summary)}
        raise ValueError("action must be start, checkpoint or complete")


def session_rules() -> str:
    return SESSION_RULES_FILE.read_text(encoding="utf-8").strip() + "\n\n"


def split_context(text: str, limit: int = CONTEXT_PART_BYTES) -> list[str]:
    """Split on line boundaries; a single longer line is cut by characters (at most 4 bytes each)."""
    pieces: list[str] = []
    for line in text.splitlines(keepends=True):
        if len(line.encode("utf-8")) <= limit:
            pieces.append(line)
        else:
            step = max(1, limit // 4)
            pieces.extend(line[i:i + step] for i in range(0, len(line), step))
    parts: list[str] = []
    current: list[str] = []
    size = 0
    for piece in pieces:
        n = len(piece.encode("utf-8"))
        if current and size + n > limit:
            parts.append("".join(current))
            current, size = [], 0
        current.append(piece)
        size += n
    if current:
        parts.append("".join(current))
    return parts or [""]


def part_key(sha: str, part: int) -> str:
    """Key printed only at the end of a part; the next part requires it, so parts cannot be fetched in one batch."""
    return hashlib.sha256(f"{sha}:{part}".encode("utf-8")).hexdigest()[:8]


def context_part(result: dict[str, Any], part: int, after: str = "") -> str:
    """One readable part of the session rules plus the complete recovery packet."""
    text = session_rules() + result["context"]
    parts = split_context(text)
    total = len(parts)
    if part < 1 or part > total:
        raise ValueError(f"PART_OUT_OF_RANGE: part must be 1..{total}")
    sha = sha256_bytes(text.encode("utf-8"))
    if part > 1 and after.strip() != part_key(sha, part - 1):
        # Short on purpose: a batched call must not fill the visible output.
        raise ValueError(f"PART_ORDER: part={part} needs the after key printed at the end of part {part - 1}. "
                         "Read the parts one per tool call; if the context changed, start again with part=1.")
    workspace = json.dumps(result["workspace"], ensure_ascii=False)
    head = f"ЧАСТЬ {part} ИЗ {total} контекста проекта {workspace}; sha256 {sha[:16]}.\n\n"
    tail = (f"\n[ПРОДОЛЖЕНИЕ] Контекст не закончен. Следующую часть вызывай отдельным последовательным вызовом, "
            f"не объединяя с другими частями: workflow_context_recover(workspace={workspace}, part={part + 1}, "
            f"after=\"{part_key(sha, part)}\").\n"
            if part < total else
            f"\n[КОНЕЦ ПАКЕТА] Получены все {total} части; sha256 {sha[:16]} совпадает во всех частях.\n")
    return head + parts[part - 1] + tail


def create_server(*, host: str, port: int, state_root: Path, codex_binary: str | None = None) -> FastMCP:
    client = AppServerClient(binary=codex_binary, cwd=str(Path.home()), request_timeout=30)
    facade = LocalFacade(client, state_root)
    watchdog = TurnWatchdog(facade)
    mcp = FastMCP(
        "Codex App Server Local Mac",
        instructions=(
            "Workflow Kit projects: before your first answer in a conversation about a local project, read its context "
            "with workflow_context_recover strictly sequentially, ONE PART PER TOOL CALL: call part=1, read it, then call "
            "only the next part named at its end with its after key, until [КОНЕЦ ПАКЕТА]. No batching, no parallel "
            "calls, no loops: one tool result is shown only up to about 10 000 tokens. If a result is truncated, repeat "
            "only that part. Read the context again only when the user asks to refresh it. All parts together are the "
            "complete project context and working rules: follow them; do not substitute reading project files for unread parts. "
            "Omit workspace to use the project open in Web Pilot, or pass the absolute project folder the user names "
            "or the path shown in the parts. "
            "Local-computer tools only. Use ChatGPT native web/cloud tools for public information. "
            "This MCP uses Codex App Server as an executor and never launches a Codex model turn. "
            "No UI control: this MCP cannot move the mouse, press keys or switch windows. Observation only: "
            "computer_list_windows, computer_capture_screen and computer_capture_window. "
            "Tool usage: search with rg through exec_command; edit text files with apply_patch and do not reread them "
            "after a successful patch. "
            + PREEXECUTION_RETRY_RULE
        ),
        host=host,
        port=port,
        log_level="WARNING",
        # No MCP sessions: Web Pilot restarts this server on every launch, and remote
        # clients (ChatGPT/Claude via the VPS) keep their old Mcp-Session-Id. A stateful
        # server answers 404 "Session not found" and ChatGPT does not reconnect. The tools
        # keep no per-session state and send no in-session notifications.
        stateless_http=True,
    )

    @mcp.tool(annotations=LOCAL_NOTIFICATION)
    def turn_watchdog(
        action: Annotated[Literal["start","checkpoint","complete"], Field(description="Watchdog action: start a timer, checkpoint and restart it, or complete the watched turn.")],
        summary: Annotated[str, Field(description="Short status text used in the macOS notification if the watchdog fires.")],
        turn_token: Annotated[str, Field(description="Token returned by start; required for checkpoint and complete.")] = "",
        timeout_seconds: Annotated[int, Field(description="Watchdog timeout in seconds; values are clamped to 60-600.")] = 150,
        notify_checkpoint: Annotated[bool, Field(description="When true, checkpoint also posts a 'work continues' notification.")] = False,
    ) -> dict[str, Any]:
        """Manage a local turn watchdog that can notify the user if a long response appears interrupted."""
        return watchdog.action(action, summary, turn_token, timeout_seconds, notify_checkpoint)

    @mcp.tool(annotations=READ_ONLY)
    def bridge_status(
        repository: Annotated[str, Field(description="Optional local repository path. When provided, include git status for that repository.")] = "",
    ) -> dict[str, Any]:
        """Report Codex App Server executor status, local filesystem scope, and pinned/installed Codex tool compatibility."""
        return facade.status(repository)

    # Text only: a structured copy would double what the client shows the model.
    @mcp.tool(annotations=READ_ONLY, structured_output=False)
    def workflow_context_recover(
        workspace: Annotated[str, Field(description="Absolute Workflow Kit project folder. Omit to use the project currently open in Web Pilot.")] = "",
        session_id: Annotated[str, Field(description="Optional legacy recovery session selector; normally leave empty for the checkout current plan.")] = "",
        part: Annotated[int, Field(description="Context part to read. Use 1 first and then the next part named at the end; 0 returns the whole packet for compatibility.")] = 0,
        after: Annotated[str, Field(description="Ordering key printed at the end of the previous part; required for part 2 and later.")] = "",
    ) -> dict[str, Any] | str:
        """Project context for Workflow Kit projects: working rules, current plan and project documents.
        One part per tool call: call part=1, then only the next part named at the end of the result with its after key.
        Never request several parts in one call, batch, parallel call or loop. workspace defaults to the project open
        in Web Pilot. part=0 returns the whole packet in one result."""
        return facade.workflow_context(workspace, session_id, part, after)

    @mcp.tool(annotations=READ_ONLY)
    def computer_list_windows(
        title_contains: Annotated[str, Field(description="Optional case-insensitive substring matched against window title and application name.")] = "",
        max_results: Annotated[int, Field(description="Maximum windows to return; values are clamped to 1-500.")] = 200,
    ) -> dict[str, Any]:
        """List visible on-screen windows (read-only): window_id, title, application, pid and rect. Pass window_id to computer_capture_window."""
        return facade.computer_list_windows(title_contains, max_results)

    @mcp.tool(annotations=READ_ONLY)
    def computer_capture_screen(
        x: Annotated[int | None, Field(description="Crop origin X in screen coordinates; used only when x, y, width and height are all provided.")] = None,
        y: Annotated[int | None, Field(description="Crop origin Y in screen coordinates; used only when x, y, width and height are all provided.")] = None,
        width: Annotated[int | None, Field(description="Crop width in screen points; used only when x, y, width and height are all provided.")] = None,
        height: Annotated[int | None, Field(description="Crop height in screen points; used only when x, y, width and height are all provided.")] = None,
        max_dimension: Annotated[int, Field(description="Resize the PNG so its longest side is at most this value; 0 disables resize, positive values are clamped to 100-5000.")] = 1600,
        include_cursor: Annotated[bool, Field(description="Include the mouse cursor in the desktop capture.")] = True,
    ) -> Any:
        """Capture the desktop or a rectangular screen region as PNG. Result contains a text block with JSON metadata and an image/png block. In ChatGPT tool-call scripts the blocks are in content_items; pass the image block to image()."""
        return facade.computer_capture_screen(x,y,width,height,max_dimension,include_cursor)

    @mcp.tool(annotations=READ_ONLY)
    def computer_capture_window(
        window_id: Annotated[int, Field(description="Positive window_id returned by computer_list_windows.")],
        max_dimension: Annotated[int, Field(description="Resize the PNG so its longest side is at most this value; 0 disables resize, positive values are clamped to 100-5000.")] = 1600,
        include_cursor: Annotated[bool, Field(description="Compatibility parameter; ignored for window captures.")] = True,
    ) -> Any:
        """Capture one window from computer_list_windows as a PNG, even when another window covers it. include_cursor is ignored for windows. Result contains a text block with JSON metadata and an image/png block. In ChatGPT tool-call scripts the blocks are in content_items; pass the image block to image()."""
        return facade.computer_capture_window(window_id, max_dimension)













    @mcp.tool(annotations=ARBITRARY_COMMAND)
    async def apply_patch(
        patch: Annotated[str, Field(description="Codex patch text: *** Begin Patch, then Add/Delete/Update File operations, optional *** Move to, then *** End Patch.")],
        workdir: Annotated[str, Field(description="Working directory in which to apply the patch. Required because this MCP has no turn cwd.")],
    ) -> str:
        """Use the Codex apply_patch format to edit files. This MCP carries the freeform Codex patch inside the patch string parameter."""
        return await asyncio.to_thread(facade.apply_patch,patch,workdir)

    @mcp.tool(annotations=READ_ONLY)
    def view_image(
        path: Annotated[str, Field(description="Local filesystem path to an image file.")],
    ) -> Any:
        """View a local image file from the filesystem when visual inspection is needed. Use this for images already available on disk. This MCP resizes to at most 1600 points on the longest side. Result contains a text block with JSON metadata and an image/png block. In ChatGPT tool-call scripts the blocks are in content_items; pass the image block to image()."""
        return facade.view_image(path)



    @mcp.tool(annotations=ARBITRARY_COMMAND)
    async def exec_command(
        cmd: Annotated[str, Field(description="Shell command to execute.")],
        workdir: Annotated[str, Field(description="Working directory for the command. Required because this MCP has no turn cwd.")],
        shell: Annotated[str, Field(description="Shell binary to launch. Defaults to the user's default shell.")] = "",
        login: Annotated[bool, Field(description="True runs the shell with -l/-i semantics; false disables them. Defaults to true.", strict=True)] = True,
        tty: Annotated[bool, Field(description="True allocates a PTY and keeps stdin open for write_stdin; false or omitted uses plain pipes with stdin closed. A single Ctrl-C write can still terminate a running non-TTY session.", strict=True)] = False,
        yield_time_ms: Annotated[int, Field(description="Wait before yielding output. Defaults to 10000 ms; values are clamped to the effective 250-30000 ms range.", strict=True)] = 10_000,
        max_output_tokens: Annotated[int, Field(description="Output token budget. Defaults to 8000 tokens; values are clamped to the MCP policy range of 1-8000.", strict=True)] = 8_000,
    ) -> str:
        """Runs a shell command, returning output or a session ID for ongoing interaction.

        If OpenAI blocked the call before execution, retry the same call once unchanged; change or split it only if the retry is blocked too. Output is capped at 8000 estimated tokens so ChatGPT does not truncate it a second time.
        """
        return await asyncio.to_thread(facade.exec_command,cmd,workdir,shell,login,tty,yield_time_ms,max_output_tokens)

    @mcp.tool(annotations=ARBITRARY_COMMAND)
    async def write_stdin(
        session_id: Annotated[str, Field(description="Identifier of the running exec_command session.")],
        chars: Annotated[str, Field(description="Characters to write to stdin. Empty polls without writing. stdin is writable only for tty=true sessions; for tty=false, a single Ctrl-C interrupts the process and any other non-empty input is rejected.")] = "",
        yield_time_ms: Annotated[int, Field(description="Wait before yielding output. Defaults to 250 ms; non-empty writes clamp to 250-30000 ms, while empty polls clamp to 5000-60000 ms in this MCP.", strict=True)] = 250,
        max_output_tokens: Annotated[int, Field(description="Output token budget. Defaults to 8000 tokens; values are clamped to the MCP policy range of 1-8000.", strict=True)] = 8_000,
    ) -> str:
        """Writes characters to an existing exec_command session and returns recent output. If OpenAI blocked the call before execution, retry the same call once unchanged; change or split it only if the retry is blocked too."""
        return await asyncio.to_thread(facade.write_stdin,session_id,chars,yield_time_ms,max_output_tokens)















    return mcp


def parse_args() -> argparse.Namespace:
    parser=argparse.ArgumentParser()
    parser.add_argument("--host",default="127.0.0.1",choices=["127.0.0.1"])
    parser.add_argument("--port",type=int,default=int(os.environ.get("WEB_PILOT_CODEX_EXECUTOR_PORT","17852")))
    parser.add_argument("--state-dir",default=os.environ.get("WEB_PILOT_CODEX_EXECUTOR_STATE_DIR",str(Path.home()/ "Library/Application Support/WebPilotCodexExecutor")))
    parser.add_argument("--codex-bin",default=os.environ.get("CODEX_APP_SERVER_BIN"))
    parser.add_argument("--transport",choices=["streamable-http","stdio"],default="streamable-http")
    return parser.parse_args()


def main() -> None:
    args=parse_args()
    state=Path(args.state_dir).expanduser()
    state.mkdir(parents=True,exist_ok=True,mode=0o700)
    server=create_server(host=args.host,port=args.port,state_root=state,codex_binary=args.codex_bin)
    server.run(transport=args.transport)


if __name__=="__main__":
    main()
