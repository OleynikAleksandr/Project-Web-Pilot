#!/usr/bin/env python3
from __future__ import annotations

import base64
import json
import os
import queue
import shutil
import signal
import subprocess
import threading
import time
import uuid
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any


class AppServerError(RuntimeError):
    pass


@dataclass(frozen=True)
class CodexBinary:
    path: str
    version: str


@dataclass
class ProcessState:
    process_id: str
    request_id: int
    command: list[str]
    cwd: str | None
    started_at: float = field(default_factory=time.time)
    stdout: bytearray = field(default_factory=bytearray)
    stderr: bytearray = field(default_factory=bytearray)
    stdout_base: int = 0
    stderr_base: int = 0
    cap_reached: dict[str, bool] = field(default_factory=lambda: {"stdout": False, "stderr": False})
    done: threading.Event = field(default_factory=threading.Event)
    result: dict[str, Any] | None = None
    error: str | None = None


def _binary_version(path: str) -> str:
    try:
        result = subprocess.run(
            [path, "--version"],
            capture_output=True,
            text=True,
            timeout=5,
            check=False,
        )
    except (OSError, subprocess.TimeoutExpired) as exc:
        raise AppServerError(f"Cannot execute Codex binary: {path}: {exc}") from exc
    text = (result.stdout or result.stderr).strip()
    if result.returncode != 0 or not text:
        raise AppServerError(f"Codex version probe failed for {path}")
    return text


def discover_codex_binary(explicit: str | None = None) -> CodexBinary:
    candidates: list[str] = []
    requested = explicit or os.environ.get("CODEX_APP_SERVER_BIN")
    if requested:
        candidates.append(str(Path(requested).expanduser()))

    home = Path.home()
    candidates.extend(
        [
            str(home / ".npm-global/bin/codex"),
            str(home / ".local/bin/codex"),
        ]
    )
    from_path = shutil.which("codex")
    if from_path:
        candidates.append(from_path)
    candidates.append("/Applications/ChatGPT.app/Contents/Resources/codex")

    seen: set[str] = set()
    for candidate in candidates:
        if not candidate:
            continue
        path = str(Path(candidate).expanduser())
        if path in seen:
            continue
        seen.add(path)
        if not os.path.isfile(path) or not os.access(path, os.X_OK):
            continue
        try:
            return CodexBinary(path=path, version=_binary_version(path))
        except AppServerError:
            continue
    raise AppServerError("No compatible Codex binary was found")


class AppServerClient:
    """Small JSON-RPC client for Codex App Server.

    It intentionally has no method that can launch a Codex model turn.
    """

    FORBIDDEN_METHODS = frozenset({"turn/start"})

    def __init__(
        self,
        *,
        binary: str | None = None,
        cwd: str | None = None,
        environment: dict[str, str] | None = None,
        request_timeout: float = 30.0,
        client_name: str = "web-pilot-codex-executor",
        client_version: str = "0.1",
    ) -> None:
        self.binary = discover_codex_binary(binary)
        self.cwd = str(Path(cwd or os.getcwd()).expanduser().resolve())
        self.environment = dict(os.environ)
        if environment:
            self.environment.update(environment)
        self.request_timeout = request_timeout
        self.client_name = client_name
        self.client_version = client_version

        self._process: subprocess.Popen[bytes] | None = None
        self._generation = 0
        self._request_id = 0
        self._request_lock = threading.Lock()
        self._write_lock = threading.Lock()
        self._lifecycle_lock = threading.RLock()
        self._pending: dict[int, queue.Queue[dict[str, Any]]] = {}
        self._pending_lock = threading.Lock()
        self._reader: threading.Thread | None = None
        self._stderr_reader: threading.Thread | None = None
        self._stderr_tail: list[str] = []
        self._stderr_lock = threading.Lock()
        self._processes: dict[str, ProcessState] = {}
        self._processes_lock = threading.Lock()
        self._thread_id: str | None = None

    @property
    def generation(self) -> int:
        return self._generation

    def status(self) -> dict[str, Any]:
        process = self._process
        return {
            "binary": self.binary.path,
            "version": self.binary.version,
            "generation": self._generation,
            "pid": process.pid if process and process.poll() is None else None,
            "running": bool(process and process.poll() is None),
            "mcp_thread_id": self._thread_id,
        }

    def start(self) -> dict[str, Any]:
        with self._lifecycle_lock:
            if self._process is not None and self._process.poll() is None:
                return self.status()
            self._terminate_process()
            try:
                self._process = subprocess.Popen(
                    [self.binary.path, "app-server", "--stdio"],
                    cwd=self.cwd,
                    env=self.environment,
                    stdin=subprocess.PIPE,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    shell=False,
                    start_new_session=True,
                    bufsize=0,
                )
            except OSError as exc:
                self._process = None
                raise AppServerError(f"Cannot start Codex App Server: {exc}") from exc

            self._generation += 1
            self._thread_id = None
            self._reader = threading.Thread(target=self._read_stdout, daemon=True)
            self._stderr_reader = threading.Thread(target=self._read_stderr, daemon=True)
            self._reader.start()
            self._stderr_reader.start()

            init = self._request_running(
                "initialize",
                {
                    "clientInfo": {
                        "name": self.client_name,
                        "version": self.client_version,
                    },
                    "capabilities": {"experimentalApi": True},
                },
                timeout=min(self.request_timeout, 15.0),
            )
            self._notify_running("initialized", {})
            if not isinstance(init, dict):
                raise AppServerError("Codex App Server returned invalid initialize result")
            return self.status()

    def close(self) -> None:
        with self._lifecycle_lock:
            self._terminate_process()

    def __enter__(self) -> "AppServerClient":
        self.start()
        return self

    def __exit__(self, _type: object, _value: object, _traceback: object) -> None:
        self.close()

    def request(
        self,
        method: str,
        params: dict[str, Any] | None = None,
        *,
        timeout: float | None = None,
    ) -> dict[str, Any]:
        if method in self.FORBIDDEN_METHODS:
            raise AppServerError(f"Forbidden App Server model method: {method}")
        self._ensure_running()
        return self._request_running(method, params or {}, timeout=timeout)

    def fs_read_file(self, path: str) -> bytes:
        result = self.request("fs/readFile", {"path": self._absolute(path)})
        encoded = result.get("dataBase64")
        if not isinstance(encoded, str):
            raise AppServerError("fs/readFile returned no dataBase64")
        return base64.b64decode(encoded)

    def fs_write_file(self, path: str, data: bytes) -> dict[str, Any]:
        return self.request(
            "fs/writeFile",
            {
                "path": self._absolute(path),
                "dataBase64": base64.b64encode(data).decode("ascii"),
            },
        )

    def fs_read_directory(self, path: str) -> dict[str, Any]:
        return self.request("fs/readDirectory", {"path": self._absolute(path)})

    def command_exec(
        self,
        command: list[str],
        *,
        cwd: str | None = None,
        timeout_ms: int | None = None,
        output_bytes_cap: int | None = 200_000,
        sandbox_policy: dict[str, Any] | None = None,
        environment: dict[str, str | None] | None = None,
    ) -> dict[str, Any]:
        if not command:
            raise ValueError("command must not be empty")
        params: dict[str, Any] = {
            "command": [str(item) for item in command],
            "cwd": self._absolute(cwd) if cwd else self.cwd,
        }
        if timeout_ms is not None:
            params["timeoutMs"] = int(timeout_ms)
        if output_bytes_cap is not None:
            params["outputBytesCap"] = int(output_bytes_cap)
        if sandbox_policy is not None:
            params["sandboxPolicy"] = sandbox_policy
        if environment:
            params["env"] = environment
        return self.request(
            "command/exec",
            params,
            timeout=max(
                self.request_timeout,
                (timeout_ms / 1000.0 + 5.0) if timeout_ms else self.request_timeout,
            ),
        )

    def start_command(
        self,
        command: list[str],
        *,
        cwd: str | None = None,
        timeout_ms: int | None = None,
        output_bytes_cap: int = 1_000_000,
        sandbox_policy: dict[str, Any] | None = None,
        environment: dict[str, str | None] | None = None,
    ) -> dict[str, Any]:
        if not command:
            raise ValueError("command must not be empty")
        self._ensure_running()
        process_id = uuid.uuid4().hex[:16]
        params: dict[str, Any] = {
            "command": [str(item) for item in command],
            "cwd": self._absolute(cwd) if cwd else self.cwd,
            "processId": process_id,
            "streamStdoutStderr": True,
            "outputBytesCap": int(output_bytes_cap),
        }
        if timeout_ms is not None:
            params["timeoutMs"] = int(timeout_ms)
        else:
            params["disableTimeout"] = True
        if sandbox_policy is not None:
            params["sandboxPolicy"] = sandbox_policy
        if environment:
            params["env"] = environment

        request_id, response_queue = self._send_request_running("command/exec", params)
        state = ProcessState(
            process_id=process_id,
            request_id=request_id,
            command=[str(item) for item in command],
            cwd=params["cwd"],
        )
        with self._processes_lock:
            self._processes[process_id] = state

        waiter = threading.Thread(
            target=self._finish_streaming_command,
            args=(state, response_queue),
            daemon=True,
        )
        waiter.start()
        return self.process_status(process_id, include_output=False)

    def process_status(self, process_id: str, *, include_output: bool = True) -> dict[str, Any]:
        state = self._get_process(process_id)
        result = state.result or {}
        response: dict[str, Any] = {
            "process_id": process_id,
            "running": not state.done.is_set(),
            "exit_code": result.get("exitCode") if state.done.is_set() else None,
            "duration_ms": int((time.time() - state.started_at) * 1000),
            "error": state.error,
            "cap_reached": dict(state.cap_reached),
        }
        if include_output:
            response["stdout"] = bytes(state.stdout).decode("utf-8", errors="replace")
            response["stderr"] = bytes(state.stderr).decode("utf-8", errors="replace")
        return response

    def read_process_output(
        self,
        process_id: str,
        *,
        stdout_cursor: int = 0,
        stderr_cursor: int = 0,
        wait_ms: int = 1000,
        max_bytes: int = 100_000,
    ) -> dict[str, Any]:
        state = self._get_process(process_id)
        wait_seconds = max(0.0, min(float(wait_ms) / 1000.0, 30.0))
        deadline = time.monotonic() + wait_seconds
        while time.monotonic() < deadline and not state.done.is_set():
            if (
                state.stdout_base + len(state.stdout) > stdout_cursor
                or state.stderr_base + len(state.stderr) > stderr_cursor
            ):
                break
            state.done.wait(min(0.05, deadline - time.monotonic()))

        out, out_next = self._slice_process_stream(
            state.stdout, state.stdout_base, stdout_cursor, max_bytes
        )
        err, err_next = self._slice_process_stream(
            state.stderr, state.stderr_base, stderr_cursor, max_bytes
        )
        result = state.result or {}
        return {
            "process_id": process_id,
            "running": not state.done.is_set(),
            "exit_code": result.get("exitCode") if state.done.is_set() else None,
            "stdout": out.decode("utf-8", errors="replace"),
            "stderr": err.decode("utf-8", errors="replace"),
            "stdout_cursor": out_next,
            "stderr_cursor": err_next,
            "more_output": (
                out_next < state.stdout_base + len(state.stdout)
                or err_next < state.stderr_base + len(state.stderr)
            ),
            "cap_reached": dict(state.cap_reached),
            "error": state.error,
        }

    def list_processes(self) -> dict[str, Any]:
        with self._processes_lock:
            ids = list(self._processes)
        return {
            "processes": [
                self.process_status(process_id, include_output=False)
                for process_id in ids
            ]
        }

    def stop_process(self, process_id: str) -> dict[str, Any]:
        state = self._get_process(process_id)
        if state.done.is_set():
            return self.process_status(process_id, include_output=False)
        self.request(
            "command/exec/terminate",
            {"processId": process_id},
            timeout=10.0,
        )
        state.done.wait(5.0)
        return self.process_status(process_id, include_output=False)

    def ensure_mcp_thread(self, *, cwd: str | None = None) -> str:
        self._ensure_running()
        if self._thread_id:
            return self._thread_id
        result = self.request(
            "thread/start",
            {
                "cwd": self._absolute(cwd) if cwd else self.cwd,
                "ephemeral": True,
                # The thread is never used for turn/start. Full local access is required so\n                # bundled Computer Use (node_repl -> @oai/sky) can inspect/control apps.\n                "sandbox": "danger-full-access",
            },
            timeout=max(self.request_timeout, 20.0),
        )
        thread_id = (result.get("thread") or {}).get("id")
        if not isinstance(thread_id, str) or not thread_id:
            raise AppServerError("thread/start returned no thread id")
        self._thread_id = thread_id
        return thread_id

    def mcp_status_list(self) -> list[dict[str, Any]]:
        thread_id = self.ensure_mcp_thread()
        result = self.request(
            "mcpServerStatus/list",
            {"threadId": thread_id, "detail": "toolsAndAuthOnly"},
            timeout=max(self.request_timeout, 30.0),
        )
        data = result.get("data")
        if not isinstance(data, list):
            raise AppServerError("mcpServerStatus/list returned invalid data")
        return data

    def mcp_tool_call(
        self,
        server: str,
        tool: str,
        arguments: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        thread_id = self.ensure_mcp_thread()
        return self.request(
            "mcpServer/tool/call",
            {
                "threadId": thread_id,
                "server": server,
                "tool": tool,
                "arguments": arguments or {},
            },
            timeout=max(self.request_timeout, 60.0),
        )

    def _ensure_running(self) -> None:
        process = self._process
        if process is None or process.poll() is not None:
            self.start()

    def _request_running(
        self,
        method: str,
        params: dict[str, Any],
        *,
        timeout: float | None = None,
    ) -> dict[str, Any]:
        request_id, response_queue = self._send_request_running(method, params)
        return self._await_response(request_id, response_queue, timeout)

    def _send_request_running(
        self,
        method: str,
        params: dict[str, Any],
    ) -> tuple[int, queue.Queue[dict[str, Any]]]:
        if method in self.FORBIDDEN_METHODS:
            raise AppServerError(f"Forbidden App Server model method: {method}")
        process = self._process
        if process is None or process.poll() is not None or process.stdin is None:
            raise AppServerError("Codex App Server is not running")
        with self._request_lock:
            self._request_id += 1
            request_id = self._request_id
        response_queue: queue.Queue[dict[str, Any]] = queue.Queue(maxsize=1)
        with self._pending_lock:
            self._pending[request_id] = response_queue
        message = {"id": request_id, "method": method, "params": params}
        self._write(message)
        return request_id, response_queue

    def _await_response(
        self,
        request_id: int,
        response_queue: queue.Queue[dict[str, Any]],
        timeout: float | None,
    ) -> dict[str, Any]:
        try:
            message = response_queue.get(
                timeout=self.request_timeout if timeout is None else timeout
            )
        except queue.Empty as exc:
            with self._pending_lock:
                self._pending.pop(request_id, None)
            raise AppServerError(f"App Server request timed out: id={request_id}") from exc
        if "error" in message:
            raise AppServerError(
                f"App Server error: {json.dumps(message['error'], ensure_ascii=False)}"
            )
        result = message.get("result")
        if not isinstance(result, dict):
            raise AppServerError("App Server returned invalid result")
        return result

    def _notify_running(self, method: str, params: dict[str, Any]) -> None:
        self._write({"method": method, "params": params})

    def _write(self, message: dict[str, Any]) -> None:
        process = self._process
        if process is None or process.stdin is None or process.poll() is not None:
            raise AppServerError("Codex App Server is not running")
        payload = (json.dumps(message, separators=(",", ":")) + "\n").encode("utf-8")
        with self._write_lock:
            try:
                process.stdin.write(payload)
                process.stdin.flush()
            except (BrokenPipeError, OSError) as exc:
                raise AppServerError("Codex App Server stdin closed") from exc

    def _read_stdout(self) -> None:
        process = self._process
        if process is None or process.stdout is None:
            return
        try:
            for raw in iter(process.stdout.readline, b""):
                if not raw:
                    break
                try:
                    message = json.loads(raw.decode("utf-8"))
                except (UnicodeDecodeError, json.JSONDecodeError):
                    continue
                request_id = message.get("id")
                if isinstance(request_id, int):
                    with self._pending_lock:
                        target = self._pending.pop(request_id, None)
                    if target is not None:
                        target.put(message)
                    continue
                method = message.get("method")
                params = message.get("params")
                if method == "command/exec/outputDelta" and isinstance(params, dict):
                    self._process_output_delta(params)
        finally:
            self._fail_pending("Codex App Server stdout closed")

    def _read_stderr(self) -> None:
        process = self._process
        if process is None or process.stderr is None:
            return
        for raw in iter(process.stderr.readline, b""):
            if not raw:
                break
            text = raw.decode("utf-8", errors="replace").rstrip()
            if not text:
                continue
            with self._stderr_lock:
                self._stderr_tail.append(text)
                del self._stderr_tail[:-50]

    def _process_output_delta(self, params: dict[str, Any]) -> None:
        process_id = params.get("processId")
        if not isinstance(process_id, str):
            return
        with self._processes_lock:
            state = self._processes.get(process_id)
        if state is None:
            return
        try:
            chunk = base64.b64decode(str(params.get("deltaBase64") or ""))
        except ValueError:
            return
        stream = params.get("stream")
        if stream == "stdout":
            state.stdout.extend(chunk)
        elif stream == "stderr":
            state.stderr.extend(chunk)
        if stream in state.cap_reached and params.get("capReached") is True:
            state.cap_reached[stream] = True

    def _finish_streaming_command(
        self,
        state: ProcessState,
        response_queue: queue.Queue[dict[str, Any]],
    ) -> None:
        try:
            result = self._await_response(
                state.request_id,
                response_queue,
                timeout=24 * 60 * 60,
            )
            state.result = result
        except AppServerError as exc:
            state.error = str(exc)
        finally:
            state.done.set()

    def _fail_pending(self, reason: str) -> None:
        with self._pending_lock:
            pending = list(self._pending.values())
            self._pending.clear()
        for target in pending:
            try:
                target.put_nowait({"error": {"message": reason}})
            except queue.Full:
                pass
        with self._processes_lock:
            processes = list(self._processes.values())
        for state in processes:
            if not state.done.is_set():
                state.error = reason
                state.done.set()

    def _terminate_process(self) -> None:
        process = self._process
        self._process = None
        self._thread_id = None
        if process is None:
            return
        if process.poll() is None:
            try:
                os.killpg(process.pid, signal.SIGTERM)
            except (ProcessLookupError, PermissionError):
                try:
                    process.terminate()
                except OSError:
                    pass
            try:
                process.wait(timeout=3)
            except subprocess.TimeoutExpired:
                try:
                    os.killpg(process.pid, signal.SIGKILL)
                except (ProcessLookupError, PermissionError):
                    try:
                        process.kill()
                    except OSError:
                        pass
                try:
                    process.wait(timeout=2)
                except subprocess.TimeoutExpired:
                    pass
        self._fail_pending("Codex App Server stopped")

    def _get_process(self, process_id: str) -> ProcessState:
        with self._processes_lock:
            state = self._processes.get(process_id)
        if state is None:
            raise AppServerError(f"Unknown process_id: {process_id}")
        return state

    @staticmethod
    def _slice_process_stream(
        data: bytearray,
        base: int,
        cursor: int,
        max_bytes: int,
    ) -> tuple[bytes, int]:
        start = max(0, int(cursor) - base)
        limit = max(1, min(int(max_bytes), 1_000_000))
        chunk = bytes(data[start : start + limit])
        return chunk, base + start + len(chunk)

    def _absolute(self, path: str | None) -> str:
        if not path:
            return self.cwd
        candidate = Path(path).expanduser()
        if not candidate.is_absolute():
            candidate = Path(self.cwd) / candidate
        return str(candidate.resolve(strict=False))
