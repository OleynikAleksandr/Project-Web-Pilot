#!/usr/bin/env python3
from __future__ import annotations

import argparse
import asyncio
import base64
import hashlib
import json
import os
import shutil
import subprocess
import threading
import time
import uuid
from pathlib import Path
from typing import Any, Literal

from mcp.server.fastmcp import FastMCP, Image
from mcp.types import ToolAnnotations

from app_server_client import AppServerClient


READ_ONLY = ToolAnnotations(
    readOnlyHint=True, destructiveHint=False, idempotentHint=True, openWorldHint=False
)
LOCAL_WRITE = ToolAnnotations(
    readOnlyHint=False, destructiveHint=False, idempotentHint=False, openWorldHint=False
)
LOCAL_DESTRUCTIVE = ToolAnnotations(
    readOnlyHint=False, destructiveHint=True, idempotentHint=False, openWorldHint=False
)
ARBITRARY_COMMAND = ToolAnnotations(
    readOnlyHint=False, destructiveHint=True, idempotentHint=False, openWorldHint=True
)
LOCAL_NOTIFICATION = ToolAnnotations(
    readOnlyHint=False, destructiveHint=False, idempotentHint=False, openWorldHint=False
)

MAX_TEXT_BYTES = 10_000_000
MAX_BINARY_READ = 512_000
MAX_BINARY_WRITE = 10_000_000
MAX_VIEW_IMAGE_BYTES = 20_000_000
MAX_PATCH_BYTES = 1_000_000
MAX_BATCH = 16
MAX_OUTPUT = 120_000
# ChatGPT shows a model roughly 10 000 tokens of one tool result; a text-only part of 28 000 bytes
# is about 7 000 tokens of Russian text.
CONTEXT_PART_BYTES = 28_000
SESSION_RULES_FILE = Path(__file__).resolve().parent / "session-rules.md"
ACTIVE_WORKSPACE_FILE = "active-workspace.json"

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
SEARCH_EXCLUDES = [
    "!**/.git/**", "!**/.ssh/**", "!**/.gnupg/**", "!**/node_modules/**",
    "!**/.venv/**", "!**/venv/**", "!**/.env", "!**/.env.*",
    "!**/credentials.json", "!**/*.pem", "!**/*.key", "!**/*.pfx", "!**/*.p12",
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
        self.trash_root = state_root / "trash"
        self.trash_root.mkdir(parents=True, exist_ok=True, mode=0o700)
        self._command_sessions: dict[str, int] = {}
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

    def status(self, repository: str = "") -> dict[str, Any]:
        data = {
            "executor": self.client.status(),
            "filesystem_scope": "local macOS filesystem with current user permissions",
            "repository_mode": "per-call",
            "state_root": str(self.state_root),
            "local_only": True,
            "model_turns": "forbidden",
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

    def file_info(self, path: str) -> dict[str, Any]:
        target = self.resolve(path, must_exist=True)
        stat = target.stat()
        result: dict[str, Any] = {
            "path": str(target),
            "exists": True,
            "is_file": target.is_file(),
            "is_directory": target.is_dir(),
            "size_bytes": stat.st_size,
            "modified_at": stat.st_mtime,
        }
        if target.is_file() and stat.st_size <= MAX_TEXT_BYTES:
            result["sha256"] = sha256_bytes(self.client.fs_read_file(str(target)))
        return result

    def list_directory(self, path: str = "", max_depth: int = 1, max_entries: int = 1000) -> dict[str, Any]:
        root = self.resolve(path or self.client.cwd, must_exist=True, allow_sensitive=True)
        if not root.is_dir():
            raise ValueError("Path is not a directory")
        depth_limit = max(0, min(int(max_depth), 8))
        limit = max(1, min(int(max_entries), 5000))
        entries: list[dict[str, Any]] = []

        def visit(current: Path, depth: int) -> None:
            if len(entries) >= limit:
                return
            result = self.client.fs_read_directory(str(current))
            for item in result.get("entries", []):
                name = item.get("fileName")
                if not isinstance(name, str):
                    continue
                child = current / name
                if is_sensitive(child):
                    continue
                record = {
                    "path": str(child),
                    "name": name,
                    "is_file": bool(item.get("isFile")),
                    "is_directory": bool(item.get("isDirectory")),
                }
                entries.append(record)
                if len(entries) >= limit:
                    return
                if record["is_directory"] and depth < depth_limit:
                    visit(child, depth + 1)

        visit(root, 0)
        return {"root": str(root), "entries": entries, "truncated": len(entries) >= limit}

    def read_file(self, path: str, start_line: int = 1, end_line: int = 500, include_line_numbers: bool = True) -> dict[str, Any]:
        target = self.resolve(path, must_exist=True)
        data = self.client.fs_read_file(str(target))
        if len(data) > MAX_TEXT_BYTES:
            raise ValueError(f"File is larger than {MAX_TEXT_BYTES} bytes")
        text = data.decode("utf-8", errors="replace")
        lines = text.splitlines()
        start = max(1, int(start_line))
        end = max(start, min(int(end_line), start + 4999))
        selected = lines[start-1:end]
        content = "\n".join(
            f"{number}: {line}" for number, line in enumerate(selected, start=start)
        ) if include_line_numbers else "\n".join(selected)
        return {
            "path": str(target),
            "start_line": start,
            "end_line": min(end, len(lines)),
            "total_lines": len(lines),
            "sha256": sha256_bytes(data),
            "content": clamp(content),
        }

    def read_binary(self, path: str, offset: int = 0, length: int = 65536) -> dict[str, Any]:
        target = self.resolve(path, must_exist=True)
        data = self.client.fs_read_file(str(target))
        start = max(0, int(offset))
        if start > len(data):
            raise ValueError("offset is beyond end of file")
        count = max(1, min(int(length), MAX_BINARY_READ))
        chunk = data[start:start+count]
        return {
            "path": str(target),
            "offset": start,
            "bytes_read": len(chunk),
            "next_offset": start + len(chunk),
            "total_size_bytes": len(data),
            "end_of_file": start + len(chunk) >= len(data),
            "sha256": sha256_bytes(data),
            "data_base64": base64.b64encode(chunk).decode("ascii"),
            "hex_preview": chunk[:256].hex(" "),
        }

    def search_files(self, path: str = "", pattern: str = "*", max_results: int = 1000, include_hidden: bool = True) -> dict[str, Any]:
        root = self.resolve(path or self.client.cwd, must_exist=True, allow_sensitive=True)
        argv = ["rg", "--files"]
        if include_hidden:
            argv.append("--hidden")
        for rule in SEARCH_EXCLUDES:
            argv += ["--glob", rule]
        if pattern and pattern != "*":
            argv += ["--glob", pattern]
        argv.append(str(root))
        result = self._command(argv, cwd=self.client.cwd, timeout_ms=30_000)
        lines = [line for line in result["stdout"].splitlines() if line]
        limit = max(1, min(int(max_results), 10_000))
        return {**result, "stdout": "", "matches": lines[:limit], "truncated": len(lines) > limit}

    def search_text(self, query: str, path: str = "", fixed: bool = True, glob: str = "", max_results: int = 500) -> dict[str, Any]:
        if not query:
            raise ValueError("Query is empty")
        root = self.resolve(path or self.client.cwd, must_exist=True, allow_sensitive=True)
        argv = ["rg", "--line-number", "--column", "--no-heading", "--hidden"]
        for rule in SEARCH_EXCLUDES:
            argv += ["--glob", rule]
        if glob:
            argv += ["--glob", glob]
        if fixed:
            argv.append("--fixed-strings")
        argv += ["--", query, str(root)]
        result = self._command(argv, cwd=self.client.cwd, timeout_ms=30_000)
        if result["exit_code"] not in (0, 1):
            return {**result, "matches": [], "truncated": False}
        lines = [line for line in result["stdout"].splitlines() if line]
        limit = max(1, min(int(max_results), 5000))
        return {**result, "ok": True, "stdout": "", "matches": lines[:limit], "truncated": len(lines) > limit}

    def write_file(self, path: str, content: str, overwrite: bool = False, expected_sha256: str = "") -> dict[str, Any]:
        target = self.resolve(path)
        existed = target.exists()
        if existed and not overwrite:
            raise ValueError("File already exists; set overwrite=true")
        if existed and expected_sha256:
            current = self.client.fs_read_file(str(target))
            if sha256_bytes(current) != expected_sha256.lower():
                raise ValueError("expected_sha256 does not match")
        data = content.encode("utf-8")
        target.parent.mkdir(parents=True, exist_ok=True)
        self.client.fs_write_file(str(target), data)
        return {"path": str(target), "created": not existed, "overwritten": existed, "size_bytes": len(data), "sha256": sha256_bytes(data)}

    def write_binary(self, path: str, data_base64: str, overwrite: bool = False, expected_sha256: str = "") -> dict[str, Any]:
        data = base64.b64decode("".join(data_base64.split()), validate=True)
        if len(data) > MAX_BINARY_WRITE:
            raise ValueError("binary payload too large")
        target = self.resolve(path)
        existed = target.exists()
        if existed and not overwrite:
            raise ValueError("File already exists; set overwrite=true")
        if existed and expected_sha256 and sha256_bytes(self.client.fs_read_file(str(target))) != expected_sha256.lower():
            raise ValueError("expected_sha256 does not match")
        target.parent.mkdir(parents=True, exist_ok=True)
        self.client.fs_write_file(str(target), data)
        return {"path": str(target), "created": not existed, "overwritten": existed, "size_bytes": len(data), "sha256": sha256_bytes(data)}

    def replace_text(self, path: str, old_text: str, new_text: str, expected_replacements: int = 1, expected_sha256: str = "") -> dict[str, Any]:
        if not old_text:
            raise ValueError("old_text cannot be empty")
        target = self.resolve(path, must_exist=True)
        data = self.client.fs_read_file(str(target))
        if expected_sha256 and sha256_bytes(data) != expected_sha256.lower():
            raise ValueError("expected_sha256 does not match")
        text = data.decode("utf-8")
        count = text.count(old_text)
        expected = max(1, int(expected_replacements))
        if count != expected:
            raise ValueError(f"Expected {expected} replacements, found {count}")
        updated = text.replace(old_text, new_text).encode("utf-8")
        self.client.fs_write_file(str(target), updated)
        return {"path": str(target), "replacements": count, "size_bytes": len(updated), "sha256": sha256_bytes(updated)}

    def patch_binary(self, path: str, offset: int, data_base64: str, allow_extend: bool = False, expected_sha256: str = "") -> dict[str, Any]:
        target = self.resolve(path, must_exist=True)
        original = bytearray(self.client.fs_read_file(str(target)))
        if expected_sha256 and sha256_bytes(original) != expected_sha256.lower():
            raise ValueError("expected_sha256 does not match")
        patch = base64.b64decode("".join(data_base64.split()), validate=True)
        start = max(0, int(offset))
        if start > len(original) and not allow_extend:
            raise ValueError("offset beyond end of file")
        if start + len(patch) > len(original) and not allow_extend:
            raise ValueError("patch extends beyond end of file")
        if start > len(original):
            original.extend(b"\0" * (start - len(original)))
        if start + len(patch) > len(original):
            original.extend(b"\0" * (start + len(patch) - len(original)))
        original[start:start+len(patch)] = patch
        self.client.fs_write_file(str(target), bytes(original))
        return {"path": str(target), "offset": start, "bytes_written": len(patch), "size_bytes": len(original), "sha256": sha256_bytes(original)}

    def make_directory(self, path: str, parents: bool = True) -> dict[str, Any]:
        target = self.resolve(path)
        argv = ["/bin/mkdir"]
        if parents:
            argv.append("-p")
        argv.append(str(target))
        result = self._command(argv, write=True)
        if not result["ok"]:
            raise ValueError(result["stderr"])
        return {"path": str(target), "created": True}

    def copy_path(self, source: str, destination: str, overwrite: bool = False) -> dict[str, Any]:
        src = self.resolve(source, must_exist=True)
        dst = self.resolve(destination)
        if dst.exists() and not overwrite:
            raise ValueError("Destination exists; set overwrite=true")
        if dst.exists():
            self._command(["/bin/rm", "-rf", str(dst)], write=True)
        dst.parent.mkdir(parents=True, exist_ok=True)
        result = self._command(["/bin/cp", "-R", str(src), str(dst)], write=True, timeout_ms=120_000)
        if not result["ok"]:
            raise ValueError(result["stderr"])
        return {"source": str(src), "destination": str(dst), "copied": True}

    def move_path(self, source: str, destination: str, overwrite: bool = False) -> dict[str, Any]:
        src = self.resolve(source, must_exist=True)
        dst = self.resolve(destination)
        self._protect_delete(src)
        if dst.exists() and not overwrite:
            raise ValueError("Destination exists; set overwrite=true")
        if dst.exists():
            self._command(["/bin/rm", "-rf", str(dst)], write=True)
        dst.parent.mkdir(parents=True, exist_ok=True)
        result = self._command(["/bin/mv", str(src), str(dst)], write=True, timeout_ms=120_000)
        if not result["ok"]:
            raise ValueError(result["stderr"])
        return {"source": str(src), "destination": str(dst), "moved": True}

    def delete_path(self, path: str) -> dict[str, Any]:
        target = self.resolve(path, must_exist=True)
        self._protect_delete(target)
        trash_id = f"{time.strftime('%Y%m%d-%H%M%S')}-{uuid.uuid4().hex[:10]}"
        container = self.trash_root / trash_id
        payload = container / "payload"
        container.mkdir(parents=True, exist_ok=False)
        result = self._command(["/bin/mv", str(target), str(payload)], write=True, timeout_ms=120_000)
        if not result["ok"]:
            shutil.rmtree(container, ignore_errors=True)
            raise ValueError(result["stderr"])
        meta = {"trash_id": trash_id, "original_path": str(target), "deleted_at": time.time()}
        self.client.fs_write_file(str(container / "metadata.json"), json.dumps(meta, ensure_ascii=False, indent=2).encode())
        return {**meta, "recoverable": True}

    def list_trash(self) -> dict[str, Any]:
        items = []
        for metadata in sorted(self.trash_root.glob("*/metadata.json"), reverse=True):
            try:
                items.append(json.loads(self.client.fs_read_file(str(metadata))))
            except Exception:
                continue
        return {"items": items}

    def restore_trash(self, trash_id: str, destination: str = "", overwrite: bool = False) -> dict[str, Any]:
        if not trash_id or not all(ch.isalnum() or ch == "-" for ch in trash_id):
            raise ValueError("Invalid trash_id")
        container = self.trash_root / trash_id
        metadata = json.loads(self.client.fs_read_file(str(container / "metadata.json")))
        payload = container / "payload"
        target = self.resolve(destination or metadata["original_path"])
        if target.exists() and not overwrite:
            raise ValueError("Restore destination exists; set overwrite=true")
        if target.exists():
            self._command(["/bin/rm", "-rf", str(target)], write=True)
        target.parent.mkdir(parents=True, exist_ok=True)
        result = self._command(["/bin/mv", str(payload), str(target)], write=True)
        if not result["ok"]:
            raise ValueError(result["stderr"])
        shutil.rmtree(container, ignore_errors=True)
        return {"trash_id": trash_id, "restored_to": str(target)}

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
            self.client.stop_process(process_id)
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
        if isinstance(value, bool):
            raise ValueError(f"{name} must be an integer from {minimum} to {maximum}")
        try:
            number = int(value)
        except (TypeError, ValueError):
            raise ValueError(f"{name} must be an integer from {minimum} to {maximum}") from None
        if number < minimum or number > maximum:
            raise ValueError(f"{name} must be from {minimum} to {maximum}")
        return number

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
        max_output_tokens: int = 10_000,
    ) -> str:
        if not isinstance(cmd, str) or not cmd.strip():
            raise ValueError("cmd must not be empty")
        cwd = self._command_workdir(workdir)
        executable = self._command_shell(shell)
        wait_ms = self._command_limit("yield_time_ms", yield_time_ms, 250, 30_000)
        token_limit = self._command_limit("max_output_tokens", max_output_tokens, 1, 10_000)
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
            stream_stdin=True,
        )
        process_id = str(started["process_id"])
        result = self.client.read_command_output(process_id, cursor=0, wait_ms=wait_ms)
        if result.get("error"):
            raise ValueError(str(result["error"]))
        if result.get("running"):
            with self._command_sessions_lock:
                self._command_sessions[process_id] = int(result["cursor"])
        return self._format_command_result(result, token_limit)

    def write_stdin(
        self,
        session_id: str,
        chars: str = "",
        yield_time_ms: int = 10_000,
        max_output_tokens: int = 10_000,
    ) -> str:
        if not isinstance(session_id, str) or not session_id.strip():
            raise ValueError("session_id is required")
        wait_ms = self._command_limit("yield_time_ms", yield_time_ms, 5_000, 60_000)
        token_limit = self._command_limit("max_output_tokens", max_output_tokens, 1, 10_000)
        if not isinstance(chars, str):
            raise ValueError("chars must be a string")
        with self._command_sessions_lock:
            cursor = self._command_sessions.get(session_id)
        if cursor is None:
            raise ValueError(f"Unknown or finished command session: {session_id}")
        status = self.client.process_status(session_id, include_output=False)
        if chars:
            if not status.get("running"):
                with self._command_sessions_lock:
                    self._command_sessions.pop(session_id, None)
                raise ValueError(f"Command session is no longer running: {session_id}")
            self.client.write_command_stdin(session_id, chars.encode("utf-8"))
        result = self.client.read_command_output(session_id, cursor=cursor, wait_ms=wait_ms)
        if result.get("error"):
            with self._command_sessions_lock:
                self._command_sessions.pop(session_id, None)
            raise ValueError(str(result["error"]))
        with self._command_sessions_lock:
            if result.get("running"):
                self._command_sessions[session_id] = int(result["cursor"])
            else:
                self._command_sessions.pop(session_id, None)
        return self._format_command_result(result, token_limit)

    def run_shell(self, command: str, working_directory: str = "", shell: str = "zsh", timeout: int = 30) -> dict[str, Any]:
        if shell not in {"zsh", "bash"}:
            raise ValueError("shell must be zsh or bash")
        cwd = self.resolve(working_directory or self.client.cwd, must_exist=True, allow_sensitive=True)
        result = self.client.command_exec(
            [f"/bin/{shell}", "-c", command],
            cwd=str(cwd),
            timeout_ms=max(1, min(int(timeout), 120)) * 1000,
            output_bytes_cap=120_000,
            sandbox_policy={"type": "dangerFullAccess"},
        )
        return {
            "ok": result.get("exitCode") == 0,
            "exit_code": result.get("exitCode"),
            "stdout": clamp(str(result.get("stdout") or "")),
            "stderr": clamp(str(result.get("stderr") or "")),
        }

    async def run_batch(self, commands: list[str], working_directory: str = "", shell: str = "zsh", timeout: int = 30, parallel: bool = False, stop_on_error: bool = True) -> dict[str, Any]:
        if not commands or len(commands) > MAX_BATCH:
            raise ValueError(f"commands must contain 1-{MAX_BATCH} items")
        async def one(index: int, command: str) -> dict[str, Any]:
            started = time.perf_counter()
            result = await asyncio.to_thread(self.run_shell, command, working_directory, shell, timeout)
            return {"index": index, "duration_ms": int((time.perf_counter()-started)*1000), **result}
        if parallel:
            results = list(await asyncio.gather(*(one(i, cmd) for i, cmd in enumerate(commands))))
        else:
            results = []
            for i, cmd in enumerate(commands):
                item = await one(i, cmd)
                results.append(item)
                if stop_on_error and not item["ok"]:
                    break
        return {
            "ok": len(results) == len(commands) and all(x["ok"] for x in results),
            "requested": len(commands), "completed": len(results),
            "succeeded": sum(1 for x in results if x["ok"]),
            "failed": sum(1 for x in results if not x["ok"]),
            "stopped_early": len(results) < len(commands),
            "parallel": parallel, "results": results,
        }

    def start_shell_process(self, command: str, working_directory: str = "", shell: str = "zsh") -> dict[str, Any]:
        if shell not in {"zsh", "bash"}:
            raise ValueError("shell must be zsh or bash")
        cwd = self.resolve(working_directory or self.client.cwd, must_exist=True, allow_sensitive=True)
        return self.client.start_command(
            [f"/bin/{shell}", "-c", command],
            cwd=str(cwd),
            sandbox_policy={"type": "dangerFullAccess"},
        )

    def git(self, repository: str, args: list[str]) -> dict[str, Any]:
        repo = self.resolve(repository, must_exist=True, allow_sensitive=True)
        return self._command(["git", *args], cwd=repo, timeout_ms=60_000)

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

    def _protect_delete(self, target: Path) -> None:
        resolved = target.resolve(strict=False)
        protected = {
            Path("/"), Path.home().resolve(), self.state_root.resolve(),
            Path("/System"), Path("/Library"), Path("/Applications"), Path("/Users"),
            Path("/Volumes"), Path("/usr"), Path("/bin"), Path("/sbin"), Path("/private"),
        }
        if resolved in protected:
            raise ValueError("Protected path cannot be deleted/moved")


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
            "computer_list_windows, computer_capture_screen and computer_capture_window."
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
    def turn_watchdog(action: Literal["start","checkpoint","complete"], summary: str, turn_token: str = "", timeout_seconds: int = 150, notify_checkpoint: bool = False) -> dict[str, Any]:
        return watchdog.action(action, summary, turn_token, timeout_seconds, notify_checkpoint)

    @mcp.tool(annotations=READ_ONLY)
    def bridge_status(repository: str = "") -> dict[str, Any]:
        return facade.status(repository)

    # Text only: a structured copy would double what the client shows the model.
    @mcp.tool(annotations=READ_ONLY, structured_output=False)
    def workflow_context_recover(workspace: str = "", session_id: str = "", part: int = 0, after: str = "") -> dict[str, Any] | str:
        """Project context for Workflow Kit projects: working rules, current plan and project documents.
        One part per tool call: call part=1, then only the next part named at the end of the result with its after key.
        Never request several parts in one call, batch, parallel call or loop. workspace defaults to the project open
        in Web Pilot. part=0 returns the whole packet in one result."""
        return facade.workflow_context(workspace, session_id, part, after)

    @mcp.tool(annotations=READ_ONLY)
    def computer_list_windows(title_contains: str = "", max_results: int = 200) -> dict[str, Any]:
        """List visible on-screen windows (read-only): window_id, title, application, pid and rect. Pass window_id to computer_capture_window."""
        return facade.computer_list_windows(title_contains, max_results)

    @mcp.tool(annotations=READ_ONLY)
    def computer_capture_screen(x: int | None = None, y: int | None = None, width: int | None = None, height: int | None = None, max_dimension: int = 1600, include_cursor: bool = True) -> Any:
        return facade.computer_capture_screen(x,y,width,height,max_dimension,include_cursor)

    @mcp.tool(annotations=READ_ONLY)
    def computer_capture_window(window_id: int, max_dimension: int = 1600, include_cursor: bool = True) -> Any:
        """Capture one window from computer_list_windows as a PNG, even when another window covers it. include_cursor is ignored for windows."""
        return facade.computer_capture_window(window_id, max_dimension)

    @mcp.tool(annotations=READ_ONLY)
    def list_drives() -> dict[str, Any]:
        usage = shutil.disk_usage("/")
        roots = [{"path": "/", "total": usage.total, "used": usage.used, "free": usage.free}]
        volumes = Path("/Volumes")
        if volumes.exists():
            for volume in volumes.iterdir():
                try:
                    if volume.is_mount():
                        u = shutil.disk_usage(volume)
                        roots.append({"path": str(volume), "total": u.total, "used": u.used, "free": u.free})
                except OSError:
                    pass
        return {"drives": roots}

    @mcp.tool(annotations=READ_ONLY)
    def file_info(path: str) -> dict[str, Any]: return facade.file_info(path)

    @mcp.tool(annotations=READ_ONLY)
    def list_directory(path: str = "", max_depth: int = 1, max_entries: int = 1000) -> dict[str, Any]: return facade.list_directory(path,max_depth,max_entries)

    @mcp.tool(annotations=READ_ONLY)
    def read_file(path: str, start_line: int = 1, end_line: int = 500, include_line_numbers: bool = True) -> dict[str, Any]: return facade.read_file(path,start_line,end_line,include_line_numbers)

    @mcp.tool(annotations=READ_ONLY)
    def read_binary(path: str, offset: int = 0, length: int = 65536) -> dict[str, Any]: return facade.read_binary(path,offset,length)

    @mcp.tool(annotations=READ_ONLY)
    async def search_files(path: str = "", pattern: str = "*", max_results: int = 1000, include_hidden: bool = True) -> dict[str, Any]: return await asyncio.to_thread(facade.search_files,path,pattern,max_results,include_hidden)

    @mcp.tool(annotations=READ_ONLY)
    async def search_text(query: str, path: str = "", fixed: bool = True, glob: str = "", max_results: int = 500) -> dict[str, Any]: return await asyncio.to_thread(facade.search_text,query,path,fixed,glob,max_results)

    @mcp.tool(annotations=LOCAL_WRITE)
    def make_directory(path: str, parents: bool = True) -> dict[str, Any]: return facade.make_directory(path,parents)

    @mcp.tool(annotations=LOCAL_WRITE)
    def write_file(path: str, content: str, overwrite: bool = False, create_parent_directories: bool = True, expected_sha256: str = "", encoding: str = "utf-8") -> dict[str, Any]:
        if encoding.lower() != "utf-8": raise ValueError("only utf-8 is supported")
        if create_parent_directories: Path(path).expanduser().resolve(strict=False).parent.mkdir(parents=True,exist_ok=True)
        return facade.write_file(path,content,overwrite,expected_sha256)

    @mcp.tool(annotations=LOCAL_WRITE)
    def write_binary(path: str, data_base64: str, overwrite: bool = False, create_parent_directories: bool = True, expected_sha256: str = "") -> dict[str, Any]:
        if create_parent_directories: Path(path).expanduser().resolve(strict=False).parent.mkdir(parents=True,exist_ok=True)
        return facade.write_binary(path,data_base64,overwrite,expected_sha256)

    @mcp.tool(annotations=LOCAL_WRITE)
    def patch_binary(path: str, offset: int, data_base64: str, allow_extend: bool = False, expected_sha256: str = "") -> dict[str, Any]: return facade.patch_binary(path,offset,data_base64,allow_extend,expected_sha256)

    @mcp.tool(annotations=LOCAL_WRITE)
    def replace_text(path: str, old_text: str, new_text: str, expected_replacements: int = 1, expected_sha256: str = "") -> dict[str, Any]: return facade.replace_text(path,old_text,new_text,expected_replacements,expected_sha256)

    @mcp.tool(annotations=ARBITRARY_COMMAND)
    async def apply_patch(patch: str, workdir: str) -> str:
        """Apply a Codex patch in workdir. Format: *** Begin Patch, then Add/Delete/Update File operations, optional *** Move to, then *** End Patch."""
        return await asyncio.to_thread(facade.apply_patch,patch,workdir)

    @mcp.tool(annotations=READ_ONLY)
    def view_image(path: str) -> Any:
        """Display a local image, resized to at most 1600 points on its longest side."""
        return facade.view_image(path)

    @mcp.tool(annotations=LOCAL_WRITE)
    def copy_path(source: str, destination: str, overwrite: bool = False) -> dict[str, Any]: return facade.copy_path(source,destination,overwrite)

    @mcp.tool(annotations=LOCAL_DESTRUCTIVE)
    def move_path(source: str, destination: str, overwrite: bool = False) -> dict[str, Any]: return facade.move_path(source,destination,overwrite)

    @mcp.tool(annotations=LOCAL_DESTRUCTIVE)
    def delete_path(path: str) -> dict[str, Any]: return facade.delete_path(path)

    @mcp.tool(annotations=READ_ONLY)
    def list_trash() -> dict[str, Any]: return facade.list_trash()

    @mcp.tool(annotations=LOCAL_DESTRUCTIVE)
    def restore_trash(trash_id: str, destination: str = "", overwrite: bool = False) -> dict[str, Any]: return facade.restore_trash(trash_id,destination,overwrite)

    @mcp.tool(annotations=ARBITRARY_COMMAND)
    async def exec_command(cmd: str, workdir: str, shell: str = "", login: bool = True, tty: bool = False, yield_time_ms: int = 10_000, max_output_tokens: int = 10_000) -> str:
        return await asyncio.to_thread(facade.exec_command,cmd,workdir,shell,login,tty,yield_time_ms,max_output_tokens)

    @mcp.tool(annotations=ARBITRARY_COMMAND)
    async def write_stdin(session_id: str, chars: str = "", yield_time_ms: int = 10_000, max_output_tokens: int = 10_000) -> str:
        return await asyncio.to_thread(facade.write_stdin,session_id,chars,yield_time_ms,max_output_tokens)

    @mcp.tool(annotations=ARBITRARY_COMMAND)
    async def run_command(command: str, working_directory: str = "", shell: Literal["zsh","bash"] = "zsh", timeout: int = 30) -> dict[str, Any]: return await asyncio.to_thread(facade.run_shell,command,working_directory,shell,timeout)

    @mcp.tool(annotations=ARBITRARY_COMMAND)
    async def run_command_batch(commands: list[str], working_directory: str | None = None, shell: Literal["zsh","bash"] = "zsh", timeout: int = 30, parallel: bool = False, stop_on_error: bool = True) -> dict[str, Any]:
        return await facade.run_batch(commands,working_directory or "",shell,timeout,parallel,stop_on_error)

    @mcp.tool(annotations=ARBITRARY_COMMAND)
    def start_process(command: str, working_directory: str = "", shell: Literal["zsh","bash"] = "zsh") -> dict[str, Any]: return facade.start_shell_process(command,working_directory,shell)

    @mcp.tool(annotations=READ_ONLY)
    def process_status(process_id: str, output_tail_chars: int = 20000) -> dict[str, Any]:
        result = client.process_status(process_id,include_output=True)
        result["stdout"] = result.get("stdout","")[-max(100,int(output_tail_chars)):]
        result["stderr"] = result.get("stderr","")[-max(100,int(output_tail_chars)):]
        return result

    @mcp.tool(annotations=READ_ONLY)
    async def read_process_output(process_id: str, stdout_cursor: int = 0, stderr_cursor: int = 0, wait_ms: int = 1000, max_bytes: int = 100000) -> dict[str, Any]:
        return await asyncio.to_thread(client.read_process_output,process_id,stdout_cursor=stdout_cursor,stderr_cursor=stderr_cursor,wait_ms=wait_ms,max_bytes=max_bytes)

    @mcp.tool(annotations=READ_ONLY)
    def list_processes() -> dict[str, Any]: return client.list_processes()

    @mcp.tool(annotations=ARBITRARY_COMMAND)
    def stop_process(process_id: str, force: bool = False) -> dict[str, Any]: return client.stop_process(process_id)

    @mcp.tool(annotations=READ_ONLY)
    def list_repository_tree(repository: str, path: str = "", max_depth: int = 3, max_entries: int = 1000) -> dict[str, Any]:
        root = facade.resolve(str(Path(repository)/path),must_exist=True,allow_sensitive=True)
        return facade.list_directory(str(root),max_depth,max_entries)

    @mcp.tool(annotations=READ_ONLY)
    def read_repository_file(repository: str, path: str, start_line: int = 1, end_line: int = 400) -> dict[str, Any]:
        return facade.read_file(str(Path(repository)/path),start_line,end_line,True)

    @mcp.tool(annotations=READ_ONLY)
    def search_repository(repository: str, query: str, path: str = ".", fixed: bool = True, max_count: int = 200) -> dict[str, Any]:
        return facade.search_text(query,str(Path(repository)/path),fixed,"",max_count)

    @mcp.tool(annotations=READ_ONLY)
    def git_status(repository: str) -> dict[str, Any]: return facade.git(repository,["status","--short","--branch"])

    @mcp.tool(annotations=READ_ONLY)
    def git_diff(repository: str, path: str | None = None, staged: bool = False, context: int = 3) -> dict[str, Any]:
        args=["diff","--no-color",f"--unified={max(0,min(int(context),50))}"]
        if staged: args.append("--cached")
        if path: args += ["--",path]
        return facade.git(repository,args)

    @mcp.tool(annotations=READ_ONLY)
    def git_log(repository: str, count: int = 20, path: str | None = None) -> dict[str, Any]:
        args=["log",f"-n{max(1,min(int(count),200))}","--decorate","--oneline"]
        if path: args += ["--",path]
        return facade.git(repository,args)

    @mcp.tool(annotations=READ_ONLY)
    def git_show(repository: str, revision: str = "HEAD", path: str | None = None) -> dict[str, Any]:
        args=["show","--no-color","--stat","--patch",revision]
        if path: args += ["--",path]
        return facade.git(repository,args)

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