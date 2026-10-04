#!/usr/bin/env python3
from __future__ import annotations

import argparse
import asyncio
import base64
import hashlib
import json
import os
import shutil
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
MAX_BATCH = 16
MAX_OUTPUT = 120_000
# ChatGPT shows a model roughly 10 000 tokens of one tool result; a part of 20 000 bytes
# (about 5 000 tokens of Russian text) stays visible even if the client prints it twice.
CONTEXT_PART_BYTES = 20_000
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
        self._windows: dict[int, dict[str, Any]] = {}
        self._window_ids: dict[str, int] = {}
        self._next_window_id = 1
        self._window_lock = threading.Lock()
        self._active_app_id: str | None = None

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

    def workflow_context(self, workspace: str = "", session_id: str = "", part: int = 0) -> dict[str, Any] | str:
        workspace = workspace.strip() or self.active_workspace()
        result = self.workflow_recover(workspace, session_id)
        return context_part(result, part) if part else result

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

    def apply_patch(self, patch: str, working_directory: str = "", check_only: bool = False, reverse: bool = False) -> dict[str, Any]:
        if not patch.strip():
            raise ValueError("patch is empty")
        cwd = self.resolve(working_directory or self.client.cwd, must_exist=True, allow_sensitive=True)
        temp = self.state_root / f"patch-{uuid.uuid4().hex}.diff"
        self.client.fs_write_file(str(temp), patch.encode("utf-8"))
        argv = ["git", "apply", "--whitespace=nowarn"]
        if check_only:
            argv.append("--check")
        if reverse:
            argv.append("--reverse")
        argv.append(str(temp))
        try:
            return self._command(argv, cwd=cwd, write=not check_only, timeout_ms=120_000)
        finally:
            try:
                temp.unlink()
            except OSError:
                pass

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

    def _sky(self, javascript: str, title: str) -> dict[str, Any]:
        code = 'globalThis.sky=globalThis.sky??(await import("@oai/sky")).sky; ' + javascript
        result = self.client.mcp_tool_call("node_repl", "js", {"code": code, "title": title})
        if result.get("isError"):
            text = " ".join(str(item.get("text") or "") for item in result.get("content", []) if item.get("type") == "text")
            raise ValueError(text or "Computer Use failed")
        return result

    def _sky_json(self, expression: str, title: str) -> Any:
        result = self._sky(f"var __wp=({expression}); var __wpv=await __wp; nodeRepl.write(JSON.stringify(__wpv));", title)
        texts = [item.get("text") for item in result.get("content", []) if item.get("type") == "text"]
        if not texts:
            return None
        return json.loads(texts[-1])

    def computer_status(self) -> dict[str, Any]:
        apps = self._sky_json("sky.list_apps()", "Inspect Computer Use status")
        running = [a for a in (apps or []) if a.get("isRunning")]
        return {
            "backend": "Codex App Server -> node_repl -> @oai/sky",
            "target": "mac",
            "available": True,
            "apps": len(apps or []),
            "running_apps": len(running),
        }

    def computer_list_windows(self, title_contains: str = "", max_results: int = 200) -> dict[str, Any]:
        apps = self._sky_json("sky.list_apps()", "List local applications") or []
        needle = title_contains.lower().strip()
        rows = []
        with self._window_lock:
            for app in apps:
                name = str(app.get("displayName") or app.get("id") or "")
                if needle and needle not in name.lower():
                    continue
                app_id = str(app.get("id") or name)
                window_id = self._window_ids.get(app_id)
                if window_id is None:
                    window_id = self._next_window_id
                    self._next_window_id += 1
                    self._window_ids[app_id] = window_id
                record = {
                    "window_id": window_id,
                    "application": name,
                    "app_id": app_id,
                    "is_running": bool(app.get("isRunning")),
                    "last_used_date": app.get("lastUsedDate"),
                }
                self._windows[window_id] = record
                rows.append(record)
                if len(rows) >= max(1, min(int(max_results), 500)):
                    break
        return {"windows": rows, "backend": "sky.list_apps", "note": "Sky exposes applications rather than Quartz top-level window IDs."}

    def computer_activate_window(self, window_id: int, restore: bool = True) -> dict[str, Any]:
        record = self._window(window_id)
        result = self._command(["/usr/bin/open", "-b", record["app_id"]], write=True)
        if not result["ok"]:
            raise ValueError(result["stderr"])
        app_id = record["app_id"]
        self._sky(
            f"var s=await sky.get_app_state({{app:{json.dumps(app_id)},disableDiff:true}}); nodeRepl.write(JSON.stringify({{app:s.app}}));",
            "Activate local application",
        )
        self._active_app_id = app_id
        return {
            "window_id": window_id,
            "activated": True,
            "app_id": app_id,
            "restore": bool(restore),
            "backend": "Codex App Server -> node_repl -> @oai/sky",
        }

    def computer_capture_window(self, window_id: int) -> Any:
        record = self._window(window_id)
        app = json.dumps(record["app_id"])
        result = self._sky(
            f"var fs=await import(\"node:fs/promises\"); var u=await import(\"node:url\"); var s=await sky.get_app_state({{app:{app}}}); if(s.screenshot) await nodeRepl.emitImage({{bytes:await fs.readFile(u.fileURLToPath(s.screenshot.url)),mimeType:\"image/png\"}}); nodeRepl.write(JSON.stringify({{app:s.app,text:s.text}}));",
            "Capture local application",
        )
        output: list[Any] = []
        for item in result.get("content", []):
            if item.get("type") == "text":
                try:
                    output.append(json.loads(item.get("text") or "{}"))
                except json.JSONDecodeError:
                    output.append({"text": item.get("text")})
            elif item.get("type") == "image" and item.get("data"):
                output.append(Image(data=base64.b64decode(item["data"]), format="png"))
        return output or [{"window_id": window_id, "captured": False}]

    def computer_capture_screen(self, x: int | None = None, y: int | None = None, width: int | None = None, height: int | None = None, max_dimension: int = 1600, include_cursor: bool = True) -> Any:
        path = self.state_root / f"screen-{uuid.uuid4().hex}.png"
        argv = ["/usr/sbin/screencapture", "-x", "-t", "png"]
        if include_cursor:
            argv.append("-C")
        if None not in (x, y, width, height):
            argv += ["-R", f"{int(x)},{int(y)},{int(width)},{int(height)}"]
        argv.append(str(path))
        result = self._command(argv, write=True, timeout_ms=30_000)
        if not result["ok"]:
            raise ValueError(result["stderr"])
        if max_dimension > 0:
            self._command(["/usr/bin/sips", "-Z", str(max(100, min(int(max_dimension), 5000))), str(path)], write=True, timeout_ms=30_000)
        try:
            png = self.client.fs_read_file(str(path))
        finally:
            try:
                path.unlink()
            except OSError:
                pass
        return [{"source": "desktop", "bytes": len(png)}, Image(data=png, format="png")]

    def _swift(self, source: str) -> dict[str, Any]:
        result = self._command(["/usr/bin/swift", "-e", source], write=True, timeout_ms=30_000)
        if not result["ok"]:
            raise ValueError(result["stderr"])
        return result

    def computer_move_mouse(self, x: int, y: int, duration_ms: int = 0) -> dict[str, Any]:
        source = f'import CoreGraphics\nCGWarpMouseCursorPosition(CGPoint(x:{float(x)},y:{float(y)}))\n'
        self._swift(source)
        return {"x": x, "y": y, "duration_ms": max(0, int(duration_ms)), "backend": "Codex command/exec -> CoreGraphics"}

    def _active_app(self) -> str:
        if not self._active_app_id:
            raise ValueError("No active app; call computer_list_windows and computer_activate_window first")
        return self._active_app_id

    # Computer Use (sky) expects X11 key names; models naturally send the character itself.
    _SYMBOL_KEYS = {
        "*": "asterisk", "+": "plus", "-": "minus", "=": "equal", "/": "slash", "\\": "backslash",
        ".": "period", ",": "comma", ";": "semicolon", ":": "colon", "'": "apostrophe", '"': "quotedbl",
        "`": "grave", "~": "asciitilde", "!": "exclam", "@": "at", "#": "numbersign", "$": "dollar",
        "%": "percent", "^": "asciicircum", "&": "ampersand", "(": "parenleft", ")": "parenright",
        "[": "bracketleft", "]": "bracketright", "{": "braceleft", "}": "braceright", "<": "less",
        ">": "greater", "?": "question", "_": "underscore", "|": "bar", " ": "space",
    }
    _ACTION_LIMIT = 50

    @classmethod
    def _sky_key(cls, key: str) -> str:
        if key in cls._SYMBOL_KEYS:
            return cls._SYMBOL_KEYS[key]
        mapping = {
            "enter": "Return", "return": "Return", "escape": "Escape", "esc": "Escape",
            "tab": "Tab", "left": "Left", "right": "Right", "up": "Up", "down": "Down",
            "home": "Home", "end": "End", "pageup": "Page_Up", "pagedown": "Page_Down",
            "backspace": "BackSpace", "delete": "Delete", "space": "space",
        }
        return mapping.get(key.lower(), key)

    def computer_click(self, x: int | None = None, y: int | None = None, button: str = "left", clicks: int = 1, interval_ms: int = 100) -> dict[str, Any]:
        if x is None or y is None:
            raise ValueError("x and y are required by the Codex executor compatibility facade")
        button_map = {"left": "left", "right": "right", "middle": "middle"}
        if button not in button_map:
            raise ValueError("button must be left, right, or middle")
        count = max(1, min(int(clicks), 5))
        app = self._active_app()
        self._sky(
            f"await sky.click({{app:{json.dumps(app)},x:{int(x)},y:{int(y)},mouse_button:{json.dumps(button_map[button])},click_count:{count}}}); nodeRepl.write(JSON.stringify({{ok:true}}));",
            "Click local application",
        )
        return {"clicked": True, "x": x, "y": y, "button": button, "clicks": count, "backend": "node_repl -> @oai/sky"}

    def computer_scroll(self, delta: int, x: int | None = None, y: int | None = None, horizontal: bool = False) -> dict[str, Any]:
        value = int(delta)
        if value == 0:
            raise ValueError("delta must be non-zero")
        app = self._active_app()
        direction = ("right" if value > 0 else "left") if horizontal else ("up" if value > 0 else "down")
        pages = max(1, min(round(abs(value) / 120), 10))
        coords = ""
        if x is not None and y is not None:
            coords = f",x:{int(x)},y:{int(y)}"
        self._sky(
            f"await sky.scroll({{app:{json.dumps(app)},direction:{json.dumps(direction)},pages:{pages}{coords}}}); nodeRepl.write(JSON.stringify({{ok:true}}));",
            "Scroll local application",
        )
        return {"scrolled": True, "delta": value, "horizontal": horizontal, "x": x, "y": y, "backend": "node_repl -> @oai/sky"}

    def computer_type_text(self, text: str, interval_ms: int = 0) -> dict[str, Any]:
        if len(text) > 10000:
            raise ValueError("text is limited to 10000 characters")
        app = self._active_app()
        self._sky(
            f"await sky.paste({{app:{json.dumps(app)},text:{json.dumps(text)},format:\"text\"}}); nodeRepl.write(JSON.stringify({{ok:true}}));",
            "Type in local application",
        )
        return {
            "typed": True,
            "characters": len(text),
            "interval_ms": interval_ms,
            "backend": "node_repl -> @oai/sky",
            "mode": "paste",
        }

    def computer_key_press(self, key: str, presses: int = 1, interval_ms: int = 50) -> dict[str, Any]:
        count = max(1, min(int(presses), 100))
        app = self._active_app()
        sky_key = self._sky_key(key)
        self._sky(
            f"for(let i=0;i<{count};i++) await sky.press_key({{app:{json.dumps(app)},key:{json.dumps(sky_key)}}}); nodeRepl.write(JSON.stringify({{ok:true}}));",
            "Press key in local application",
        )
        return {"pressed": True, "key": key, "presses": count, "interval_ms": interval_ms, "backend": "node_repl -> @oai/sky"}

    @classmethod
    def _chord(cls, keys: list[str]) -> str:
        if not isinstance(keys, list) or len(keys) < 2 or len(keys) > 8 or not all(isinstance(k, str) and k for k in keys):
            raise ValueError("keys must contain 2-8 items")
        modifier_map = {
            "cmd": "super", "command": "super", "shift": "shift",
            "option": "alt", "alt": "alt", "control": "ctrl", "ctrl": "ctrl",
        }
        return "+".join(modifier_map.get(key.lower(), cls._sky_key(key)) for key in keys)

    def computer_hotkey(self, keys: list[str]) -> dict[str, Any]:
        chord = self._chord(keys)
        app = self._active_app()
        self._sky(
            f"await sky.press_key({{app:{json.dumps(app)},key:{json.dumps(chord)}}}); nodeRepl.write(JSON.stringify({{ok:true}}));",
            "Press shortcut in local application",
        )
        return {"pressed": True, "keys": keys, "sky_key": chord, "backend": "node_repl -> @oai/sky"}

    def _action_js(self, app: str, action: Any) -> tuple[str, dict[str, Any]]:
        """JavaScript for one batch action plus its public summary; validates the input."""
        if not isinstance(action, dict):
            raise ValueError("each action must be an object with a type")
        kind = action.get("type")
        target = json.dumps(app)
        if kind == "key":
            key = action.get("key")
            if not isinstance(key, str) or not key:
                raise ValueError("key action requires key")
            presses = max(1, min(int(action.get("presses", 1)), 100))
            sky_key = self._sky_key(key)
            return (f"for(let k=0;k<{presses};k++) await sky.press_key({{app:{target},key:{json.dumps(sky_key)}}});",
                    {"type": "key", "key": key, "sky_key": sky_key, "presses": presses})
        if kind == "hotkey":
            chord = self._chord(action.get("keys"))
            return (f"await sky.press_key({{app:{target},key:{json.dumps(chord)}}});", {"type": "hotkey", "sky_key": chord})
        if kind == "text":
            text = action.get("text")
            if not isinstance(text, str) or not text or len(text) > 10000:
                raise ValueError("text action requires text up to 10000 characters")
            return (f"await sky.paste({{app:{target},text:{json.dumps(text)},format:\"text\"}});",
                    {"type": "text", "characters": len(text), "mode": "paste"})
        if kind == "click":
            x, y = action.get("x"), action.get("y")
            if not isinstance(x, int) or not isinstance(y, int):
                raise ValueError("click action requires integer x and y")
            button = action.get("button", "left")
            if button not in ("left", "right", "middle"):
                raise ValueError("button must be left, right, or middle")
            clicks = max(1, min(int(action.get("clicks", 1)), 5))
            return (f"await sky.click({{app:{target},x:{x},y:{y},mouse_button:{json.dumps(button)},click_count:{clicks}}});",
                    {"type": "click", "x": x, "y": y, "button": button, "clicks": clicks})
        if kind == "scroll":
            value = int(action.get("delta", 0))
            if value == 0:
                raise ValueError("scroll action requires non-zero delta")
            horizontal = bool(action.get("horizontal", False))
            direction = ("right" if value > 0 else "left") if horizontal else ("up" if value > 0 else "down")
            pages = max(1, min(round(abs(value) / 120), 10))
            x, y = action.get("x"), action.get("y")
            coords = f",x:{int(x)},y:{int(y)}" if x is not None and y is not None else ""
            return (f"await sky.scroll({{app:{target},direction:{json.dumps(direction)},pages:{pages}{coords}}});",
                    {"type": "scroll", "direction": direction, "pages": pages})
        if kind == "wait":
            ms = int(action.get("ms", 0))
            if not 0 <= ms <= 5000:
                raise ValueError("wait action ms must be 0-5000")
            return (f"await new Promise(r=>setTimeout(r,{ms}));", {"type": "wait", "ms": ms})
        raise ValueError("unknown action type; use key, hotkey, text, click, scroll or wait")

    def computer_actions(self, actions: list[dict[str, Any]]) -> dict[str, Any]:
        if not isinstance(actions, list) or not actions:
            raise ValueError("actions must be a non-empty list")
        if len(actions) > self._ACTION_LIMIT:
            raise ValueError(f"actions is limited to {self._ACTION_LIMIT} items")
        app = self._active_app()
        built = [self._action_js(app, action) for action in actions]  # validate everything before acting
        steps = ",".join(f"async()=>{{{code}}}" for code, _ in built)
        result = self._sky(
            "var steps=[" + steps + "]; var results=[]; var t0=Date.now();"
            " for(let i=0;i<steps.length;i++){ var t=Date.now();"
            " try{ await steps[i](); results.push({ok:true,ms:Date.now()-t}); }"
            " catch(e){ results.push({ok:false,ms:Date.now()-t,error:String((e&&e.message)||e)}); break; } }"
            " nodeRepl.write(JSON.stringify({results,total_ms:Date.now()-t0}));",
            "Run actions in local application",
        )
        payload: dict[str, Any] = {}
        for item in result.get("content", []):
            if item.get("type") == "text":
                try:
                    payload = json.loads(item.get("text") or "{}")
                    break
                except json.JSONDecodeError:
                    continue
        outcomes = payload.get("results") if isinstance(payload.get("results"), list) else []
        rows = [{**summary, **outcome} for (_, summary), outcome in zip(built, outcomes)]
        failed = next((dict(row, index=i) for i, row in enumerate(rows) if not row.get("ok")), None)
        return {
            "completed": len(rows) == len(built) and failed is None,
            "app_id": app,
            "results": rows,
            "skipped": len(built) - len(rows),
            "failed": failed,
            "total_ms": payload.get("total_ms"),
            "backend": "node_repl -> @oai/sky (one call)",
        }

    def computer_release_inputs(self) -> dict[str, Any]:
        return {
            "released": True,
            "backend": "node_repl -> @oai/sky",
            "note": "Sky input actions are atomic and do not retain held key/button state.",
        }

    def _window(self, window_id: int) -> dict[str, Any]:
        with self._window_lock:
            record = self._windows.get(int(window_id))
        if record is None:
            raise ValueError("Unknown window_id; call computer_list_windows first")
        return record

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


def context_part(result: dict[str, Any], part: int) -> str:
    """One readable part of the session rules plus the complete recovery packet."""
    text = session_rules() + result["context"]
    parts = split_context(text)
    total = len(parts)
    if part < 1 or part > total:
        raise ValueError(f"PART_OUT_OF_RANGE: part must be 1..{total}")
    workspace = json.dumps(result["workspace"], ensure_ascii=False)
    sha = sha256_bytes(text.encode("utf-8"))[:16]
    nxt = (f"Следующая часть: workflow_context_recover(workspace={workspace}, part={part + 1})."
           if part < total else "Это последняя часть.")
    head = f"ЧАСТЬ {part} ИЗ {total} контекста проекта {workspace}; sha256 {sha}. {nxt}\n\n"
    tail = (f"\n[ПРОДОЛЖЕНИЕ] Контекст не закончен. До ответа пользователю вызови "
            f"workflow_context_recover(workspace={workspace}, part={part + 1}).\n"
            if part < total else
            f"\n[КОНЕЦ ПАКЕТА] Получены все {total} части. Если sha256 у частей различался, прочитай контекст заново с part=1.\n")
    return head + parts[part - 1] + tail


def create_server(*, host: str, port: int, state_root: Path, codex_binary: str | None = None) -> FastMCP:
    client = AppServerClient(binary=codex_binary, cwd=str(Path.home()), request_timeout=30)
    facade = LocalFacade(client, state_root)
    watchdog = TurnWatchdog(facade)
    mcp = FastMCP(
        "Codex App Server Local Mac",
        instructions=(
            "Workflow Kit projects: when a conversation concerns a local project, call "
            "workflow_context_recover(part=1) before your first answer in that conversation, then call it with "
            "each next part number the result names until the last part; repeat only when the user asks to refresh "
            "the project context. All parts together are the complete current project context and working rules: "
            "read all of them and follow them; do not substitute reading project files for unread parts. "
            "Omit workspace to use the project open in Web Pilot, or pass the absolute project folder the user names "
            "or the path shown in the parts. "
            "Local-computer tools only. Use ChatGPT native web/cloud tools for public information. "
            "This MCP uses Codex App Server as an executor and never launches a Codex model turn. "
            "Computer Use is routed through the local Codex/node_repl/@oai/sky stack where applicable."
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
        result = facade.status(repository)
        try:
            result["computer_use"] = facade.computer_status()
        except Exception as exc:
            result["computer_use"] = {"available": False, "error": str(exc)}
        return result

    # Text only: a structured copy would double what the client shows the model.
    @mcp.tool(annotations=READ_ONLY, structured_output=False)
    def workflow_context_recover(workspace: str = "", session_id: str = "", part: int = 0) -> dict[str, Any] | str:
        """Project context for Workflow Kit projects: working rules, current plan and project documents.
        Call with part=1, then with each next part number the result names, and read every part before answering.
        workspace defaults to the project open in Web Pilot. part=0 returns the whole packet in one result."""
        return facade.workflow_context(workspace, session_id, part)

    @mcp.tool(annotations=READ_ONLY)
    def computer_status() -> dict[str, Any]:
        return facade.computer_status()

    @mcp.tool(annotations=READ_ONLY)
    def computer_list_windows(title_contains: str = "", max_results: int = 200) -> dict[str, Any]:
        return facade.computer_list_windows(title_contains, max_results)

    @mcp.tool(annotations=ARBITRARY_COMMAND)
    def computer_activate_window(window_id: int, restore: bool = True) -> dict[str, Any]:
        return facade.computer_activate_window(window_id, restore)

    @mcp.tool(annotations=READ_ONLY)
    def computer_capture_screen(x: int | None = None, y: int | None = None, width: int | None = None, height: int | None = None, max_dimension: int = 1600, include_cursor: bool = True) -> Any:
        return facade.computer_capture_screen(x,y,width,height,max_dimension,include_cursor)

    @mcp.tool(annotations=READ_ONLY)
    def computer_capture_window(window_id: int, max_dimension: int = 1600, include_cursor: bool = True) -> Any:
        return facade.computer_capture_window(window_id)

    @mcp.tool(annotations=ARBITRARY_COMMAND)
    def computer_move_mouse(x: int, y: int, duration_ms: int = 0) -> dict[str, Any]:
        return facade.computer_move_mouse(x,y,duration_ms)

    @mcp.tool(annotations=ARBITRARY_COMMAND)
    def computer_click(x: int | None = None, y: int | None = None, button: str = "left", clicks: int = 1, interval_ms: int = 100) -> dict[str, Any]:
        return facade.computer_click(x,y,button,clicks,interval_ms)

    @mcp.tool(annotations=ARBITRARY_COMMAND)
    def computer_scroll(delta: int, x: int | None = None, y: int | None = None, horizontal: bool = False) -> dict[str, Any]:
        return facade.computer_scroll(delta,x,y,horizontal)

    @mcp.tool(annotations=ARBITRARY_COMMAND)
    def computer_type_text(text: str, interval_ms: int = 0) -> dict[str, Any]:
        return facade.computer_type_text(text,interval_ms)

    @mcp.tool(annotations=ARBITRARY_COMMAND)
    def computer_key_press(key: str, presses: int = 1, interval_ms: int = 50) -> dict[str, Any]:
        """Press a key in the app activated with computer_activate_window. Accepts characters ('*', '=') or X11 key names ('asterisk', 'Return', 'Escape', 'F5')."""
        return facade.computer_key_press(key,presses,interval_ms)

    @mcp.tool(annotations=ARBITRARY_COMMAND)
    def computer_hotkey(keys: list[str]) -> dict[str, Any]:
        """Press a shortcut in the active app, e.g. ["cmd","n"]. Modifiers: cmd, shift, option/alt, control/ctrl."""
        return facade.computer_hotkey(keys)

    @mcp.tool(annotations=ARBITRARY_COMMAND)
    def computer_actions(actions: list[dict[str, Any]]) -> dict[str, Any]:
        """Run up to 50 UI actions in the active app with ONE call (activate it first with computer_activate_window); much faster than one tool call per action. Each action is an object: {"type":"key","key":"1","presses":1}, {"type":"hotkey","keys":["cmd","n"]}, {"type":"text","text":"..."} (pasted, Unicode-safe), {"type":"click","x":100,"y":200,"button":"left","clicks":1}, {"type":"scroll","delta":-120,"x":100,"y":200,"horizontal":false}, {"type":"wait","ms":300}. Keys accept characters or X11 names. Stops at the first failure and reports each executed action."""
        return facade.computer_actions(actions)

    @mcp.tool(annotations=ARBITRARY_COMMAND)
    def computer_release_inputs() -> dict[str, Any]:
        return facade.computer_release_inputs()

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
    async def apply_patch(patch: str, working_directory: str = "", check_only: bool = False, reverse: bool = False) -> dict[str, Any]: return await asyncio.to_thread(facade.apply_patch,patch,working_directory,check_only,reverse)

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