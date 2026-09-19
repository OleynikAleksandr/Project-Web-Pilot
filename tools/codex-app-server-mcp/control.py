#!/usr/bin/env python3
from __future__ import annotations

import argparse
import asyncio
import contextlib
import fcntl
import getpass
import hashlib
import io
import json
import os
from pathlib import Path
import platform
import re
import secrets
import shutil
import signal
import socket
import subprocess
import sys
import time
import urllib.request
import zipfile

ROOT = Path(__file__).resolve().parent
STATE = Path(os.environ.get("WEB_PILOT_CODEX_EXECUTOR_STATE_DIR") or
             Path.home() / "Library/Application Support/WebPilotCodexExecutor")
PRIVATE = STATE / "private"
RUNTIME = STATE / "runtime"
VENV = RUNTIME / "venv"
PYTHON = VENV / "bin/python"
TUNNEL_CLIENT = RUNTIME / "tunnel-client"
PROFILE_DIR = PRIVATE / "tunnel-profile"
PROFILE_NAME = "codex-executor"
PROFILE = PROFILE_DIR / f"{PROFILE_NAME}.yaml"
KEY_FILE = PRIVATE / "tunnel-key"
MCP_PORT = int(os.environ.get("WEB_PILOT_CODEX_EXECUTOR_PORT", "17852"))
TUNNEL_PORT = int(os.environ.get("WEB_PILOT_CODEX_EXECUTOR_TUNNEL_PORT", "17853"))
TUNNEL_KEY_ENV = "WEB_PILOT_CODEX_EXECUTOR_TUNNEL_API_KEY"


def json_out(value: object) -> None:
    print(json.dumps(value, ensure_ascii=False, indent=2))


def private_write(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
    path.parent.chmod(0o700)
    temp = path.with_name(path.name + "." + secrets.token_hex(8) + ".tmp")
    try:
        fd = os.open(temp, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
        with os.fdopen(fd, "w", encoding="utf-8") as handle:
            handle.write(content)
        os.replace(temp, path)
        path.chmod(0o600)
    finally:
        temp.unlink(missing_ok=True)


@contextlib.contextmanager
def operation_lock():
    STATE.mkdir(parents=True, exist_ok=True, mode=0o700)
    STATE.chmod(0o700)
    with (STATE / "control.lock").open("a") as handle:
        try:
            fcntl.flock(handle, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            raise RuntimeError("Another Codex executor lifecycle operation is still running") from None
        try:
            yield
        finally:
            fcntl.flock(handle, fcntl.LOCK_UN)


def environment() -> dict[str, str]:
    env = os.environ.copy()
    env["WEB_PILOT_CODEX_EXECUTOR_STATE_DIR"] = str(STATE)
    env["WEB_PILOT_CODEX_EXECUTOR_PORT"] = str(MCP_PORT)
    env["PYTHONDONTWRITEBYTECODE"] = "1"
    env["PATH"] = os.pathsep.join([
        str(VENV / "bin"),
        str(Path.home() / ".npm-global/bin"),
        "/opt/homebrew/bin", "/usr/local/bin",
        env.get("PATH", ""),
        "/usr/bin", "/bin", "/usr/sbin", "/sbin",
    ])
    return env


def download(url: str) -> bytes:
    request = urllib.request.Request(url, headers={"User-Agent": "WebPilotCodexExecutor/0.1"})
    with urllib.request.urlopen(request, timeout=60) as response:
        return response.read()


def _working_tunnel_candidate() -> Path | None:
    explicit = os.environ.get("WEB_PILOT_CODEX_TUNNEL_CLIENT")
    candidates = [
        Path(explicit).expanduser() if explicit else None,
        Path.home() / "VSCODE/Codex Local Mac/mac-codex-local/tools/tunnel-client",
    ]
    from_path = shutil.which("tunnel-client")
    if from_path:
        candidates.append(Path(from_path))
    for candidate in candidates:
        if candidate is None or not candidate.is_file() or not os.access(candidate, os.X_OK):
            continue
        result = subprocess.run([str(candidate), "--version"], capture_output=True, text=True, timeout=10)
        if result.returncode == 0:
            return candidate
    return None


def install_tunnel_client() -> str:
    RUNTIME.mkdir(parents=True, exist_ok=True, mode=0o700)
    if TUNNEL_CLIENT.is_file():
        result = subprocess.run([str(TUNNEL_CLIENT), "--version"], capture_output=True, text=True, timeout=10)
        if result.returncode == 0:
            return result.stdout.strip()

    existing = _working_tunnel_candidate()
    if existing is not None:
        shutil.copy2(existing, TUNNEL_CLIENT)
        TUNNEL_CLIENT.chmod(0o755)
        return subprocess.check_output([str(TUNNEL_CLIENT), "--version"], text=True, timeout=10).strip()

    release = json.loads(download("https://api.github.com/repos/openai/tunnel-client/releases/latest"))
    arch = {"arm64": "arm64", "x86_64": "amd64"}.get(platform.machine())
    if arch is None:
        raise RuntimeError("Unsupported macOS architecture")
    name = f"tunnel-client-{release['tag_name']}-darwin-{arch}.zip"
    assets = {item["name"]: item["browser_download_url"] for item in release["assets"]}
    for key in (name, "SHA256SUMS.txt"):
        if key not in assets or not assets[key].startswith("https://github.com/openai/tunnel-client/releases/download/"):
            raise RuntimeError("Official tunnel-client artifact was not found")
    archive = download(assets[name])
    expected = next(
        (line.split()[0].lower() for line in download(assets["SHA256SUMS.txt"]).decode().splitlines()
         if line.split()[-1].lstrip("*") == name),
        None,
    )
    digest = hashlib.sha256(archive).hexdigest()
    if expected is None or digest != expected:
        raise RuntimeError("tunnel-client archive SHA-256 mismatch")
    with zipfile.ZipFile(io.BytesIO(archive)) as package:
        member = next((entry for entry in package.namelist() if Path(entry).name == "tunnel-client"), None)
        if member is None:
            raise RuntimeError("tunnel-client executable missing from official archive")
        TUNNEL_CLIENT.write_bytes(package.read(member))
        TUNNEL_CLIENT.chmod(0o755)
    return subprocess.check_output([str(TUNNEL_CLIENT), "--version"], text=True, timeout=10).strip()


def setup() -> dict[str, object]:
    if sys.platform != "darwin":
        raise RuntimeError("This experimental runtime is macOS-only")
    RUNTIME.mkdir(parents=True, exist_ok=True, mode=0o700)
    uv = shutil.which("uv")
    if not PYTHON.is_file():
        if uv:
            subprocess.run([uv, "venv", "--python", "3.13", str(VENV)], check=True)
        else:
            subprocess.run([sys.executable, "-m", "venv", str(VENV)], check=True)
    installer = [uv, "pip", "install", "--python", str(PYTHON)] if uv else [str(PYTHON), "-m", "pip", "install"]
    subprocess.run([*installer, "-r", str(ROOT / "requirements.txt")], check=True)
    version = install_tunnel_client()
    STATE.mkdir(parents=True, exist_ok=True, mode=0o700)
    return {
        "installed": True,
        "python": str(PYTHON),
        "tunnel_client": str(TUNNEL_CLIENT),
        "tunnel_client_version": version,
        "mcp_url": f"http://127.0.0.1:{MCP_PORT}/mcp",
        "tunnel_health_url": f"http://127.0.0.1:{TUNNEL_PORT}/readyz",
        "state_directory": str(STATE),
    }


def configure_tunnel(tunnel_id: str, key: str) -> dict[str, object]:
    if not re.fullmatch(r"tunnel_[A-Za-z0-9_-]{16,100}", tunnel_id):
        raise ValueError("A valid OpenAI tunnel_id is required")
    if len(key) < 16 or any(character.isspace() for character in key):
        raise ValueError("Tunnel runtime key is invalid")
    if managed_process("tunnel")["running"]:
        raise RuntimeError("Stop this experimental tunnel before changing its configuration")
    profile = {
        "config_version": 1,
        "control_plane": {
            "base_url": "https://api.openai.com",
            "tunnel_id": tunnel_id,
            "api_key": f"env:{TUNNEL_KEY_ENV}",
        },
        "health": {"listen_addr": f"127.0.0.1:{TUNNEL_PORT}"},
        "admin_ui": {"open_browser": False},
        "log": {"level": "info", "format": "json"},
        "mcp": {
            "server_urls": [
                {"channel": "main", "url": f"http://127.0.0.1:{MCP_PORT}/mcp"}
            ]
        },
    }
    private_write(KEY_FILE, key + "\n")
    private_write(PROFILE, json.dumps(profile, ensure_ascii=False, indent=2) + "\n")
    return {
        "configured": True,
        "tunnel_id": tunnel_id,
        "profile": str(PROFILE),
        "key_stored": True,
    }


def pid_identity(pid: object) -> str | None:
    if not isinstance(pid, int) or pid <= 1:
        return None
    # `ps -o lstart` is locale-sensitive on macOS.  Persisted process identity
    # must compare identically whether control.py is called from Finder, Codex,
    # or a user's Terminal with another LANG/LC_* environment.
    stable_env = os.environ.copy()
    stable_env["LC_ALL"] = "C"
    stable_env["LANG"] = "C"
    result = subprocess.run(
        ["/bin/ps", "-p", str(pid), "-o", "lstart=", "-o", "command="],
        capture_output=True, text=True, timeout=3, env=stable_env,
    )
    return result.stdout.strip() if result.returncode == 0 and result.stdout.strip() else None


def managed_process(name: str) -> dict[str, object]:
    record = STATE / f"{name}.pid.json"
    if not record.is_file():
        return {"running": False, "owned": False, "pid": None}
    try:
        data = json.loads(record.read_text())
    except (OSError, json.JSONDecodeError):
        return {"running": False, "owned": False, "pid": None}
    actual = pid_identity(data.get("pid"))
    owned = bool(actual and actual == data.get("identity"))
    if actual is None:
        record.unlink(missing_ok=True)
    return {"running": bool(actual), "owned": owned, "pid": data.get("pid")}


def launch(name: str, argv: list[str], env: dict[str, str]) -> int:
    STATE.mkdir(parents=True, exist_ok=True, mode=0o700)
    stdout_path = STATE / f"{name}.out.log"
    stderr_path = STATE / f"{name}.err.log"
    for path in (stdout_path, stderr_path):
        path.touch(mode=0o600, exist_ok=True)
        path.chmod(0o600)
    with stdout_path.open("ab") as stdout, stderr_path.open("ab") as stderr:
        process = subprocess.Popen(
            argv, cwd=str(ROOT), env=env, stdin=subprocess.DEVNULL,
            stdout=stdout, stderr=stderr, start_new_session=True, close_fds=True,
        )
    identity = pid_identity(process.pid)
    if identity is None or process.poll() is not None:
        raise RuntimeError(f"{name} exited during startup; see {stderr_path}")
    private_write(
        STATE / f"{name}.pid.json",
        json.dumps({"pid": process.pid, "identity": identity}, indent=2) + "\n",
    )
    return process.pid


def port_open(port: int) -> bool:
    try:
        with socket.create_connection(("127.0.0.1", port), timeout=0.3):
            return True
    except OSError:
        return False


def mcp_ready() -> bool:
    if not port_open(MCP_PORT) or not PYTHON.is_file():
        return False
    probe = """import asyncio
from mcp import ClientSession
from mcp.client.streamable_http import streamablehttp_client
async def main():
    async with streamablehttp_client(%r) as (read, write, _):
        async with ClientSession(read, write) as session:
            result = await session.initialize()
            return result.serverInfo.name == 'Codex App Server Local Mac'
raise SystemExit(0 if asyncio.run(main()) else 3)
""" % (f"http://127.0.0.1:{MCP_PORT}/mcp",)
    try:
        result = subprocess.run(
            [str(PYTHON), "-B", "-c", probe],
            env=environment(),
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            timeout=5,
            check=False,
        )
        return result.returncode == 0
    except (OSError, subprocess.TimeoutExpired):
        return False


def tunnel_ready() -> bool:
    try:
        with urllib.request.urlopen(f"http://127.0.0.1:{TUNNEL_PORT}/readyz", timeout=1) as response:
            return response.status == 200 and response.read().decode().strip().strip('"') == "ready"
    except Exception:
        return False


def status() -> dict[str, object]:
    mcp = managed_process("mcp")
    tunnel = managed_process("tunnel")
    mcp["ready"] = bool(mcp["owned"] and PYTHON.is_file() and mcp_ready())
    tunnel["ready"] = bool(tunnel["owned"] and tunnel_ready())
    tunnel["configured"] = PROFILE.is_file() and KEY_FILE.is_file()
    return {
        "mcp": mcp,
        "tunnel": tunnel,
        "mcp_url": f"http://127.0.0.1:{MCP_PORT}/mcp",
        "tunnel_ui": f"http://127.0.0.1:{TUNNEL_PORT}/ui",
        "state_directory": str(STATE),
        "runtime_python": str(PYTHON),
        "tunnel_client": str(TUNNEL_CLIENT),
        "production_runtime_touched": False,
    }


def start(*, mcp_only: bool = False) -> dict[str, object]:
    if not PYTHON.is_file():
        raise RuntimeError("Run control.py setup first")
    env = environment()

    mcp = managed_process("mcp")
    if mcp["running"] and not mcp["owned"]:
        raise RuntimeError("Recorded MCP PID belongs to another process")
    if not mcp["owned"]:
        if port_open(MCP_PORT):
            raise RuntimeError(f"Port {MCP_PORT} belongs to another process; it will not be stopped")
        launch(
            "mcp",
            [
                str(PYTHON), "-B", str(ROOT / "server.py"),
                "--port", str(MCP_PORT), "--state-dir", str(STATE),
            ],
            env,
        )
    deadline = time.monotonic() + 25
    while not mcp_ready():
        if time.monotonic() > deadline or not managed_process("mcp")["owned"]:
            raise RuntimeError(f"MCP did not become ready; see {STATE / 'mcp.err.log'}")
        time.sleep(0.25)

    if mcp_only or not (PROFILE.is_file() and KEY_FILE.is_file()):
        result = status()
        result["next"] = (
            "Local MCP is ready; configure a separate OpenAI Secure MCP Tunnel."
            if not result["tunnel"]["configured"]
            else "Local MCP started without tunnel."
        )
        return result

    if not TUNNEL_CLIENT.is_file():
        raise RuntimeError("tunnel-client is missing; run setup again")
    tunnel = managed_process("tunnel")
    if tunnel["running"] and not tunnel["owned"]:
        raise RuntimeError("Recorded tunnel PID belongs to another process")
    if not tunnel["owned"]:
        if port_open(TUNNEL_PORT):
            raise RuntimeError(f"Port {TUNNEL_PORT} belongs to another process; it will not be stopped")
        env[TUNNEL_KEY_ENV] = KEY_FILE.read_text().strip()
        launch(
            "tunnel",
            [str(TUNNEL_CLIENT), "run", "--profile", PROFILE_NAME, "--profile-dir", str(PROFILE_DIR)],
            env,
        )
    deadline = time.monotonic() + 45
    while not tunnel_ready():
        if time.monotonic() > deadline or not managed_process("tunnel")["owned"]:
            raise RuntimeError(f"Tunnel did not become ready; see {STATE / 'tunnel.err.log'}")
        time.sleep(0.5)
    return status()


def stop_one(name: str) -> dict[str, object]:
    process = managed_process(name)
    if process["running"] and not process["owned"]:
        raise RuntimeError(f"Refusing to stop {name}: PID is not owned by this runtime")
    if process["owned"]:
        pid = int(process["pid"])
        record_path = STATE / f"{name}.pid.json"
        record = json.loads(record_path.read_text())
        if pid_identity(pid) != record["identity"]:
            raise RuntimeError(f"{name} process identity changed before stop")
        try:
            os.killpg(pid, signal.SIGTERM)
        except ProcessLookupError:
            pass
        deadline = time.monotonic() + 5
        while pid_identity(pid) == record["identity"] and time.monotonic() < deadline:
            time.sleep(0.1)
        if pid_identity(pid) == record["identity"]:
            os.killpg(pid, signal.SIGKILL)
    (STATE / f"{name}.pid.json").unlink(missing_ok=True)
    return {"service": name, "stopped": True}


def stop() -> dict[str, object]:
    return {"services": [stop_one("tunnel"), stop_one("mcp")]}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Lifecycle for the experimental Codex App Server MCP")
    sub = parser.add_subparsers(dest="command", required=True)
    sub.add_parser("setup")
    sub.add_parser("status")
    start_parser = sub.add_parser("start")
    start_parser.add_argument("--mcp-only", action="store_true")
    sub.add_parser("stop")
    configure = sub.add_parser("configure-tunnel")
    configure.add_argument("--tunnel-id")
    configure.add_argument(
        "--key-stdin", action="store_true",
        help="Read the runtime key from stdin instead of an interactive hidden prompt.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    try:
        with operation_lock():
            if args.command == "setup":
                result = setup()
            elif args.command == "status":
                result = status()
            elif args.command == "start":
                result = start(mcp_only=args.mcp_only)
            elif args.command == "stop":
                result = stop()
            elif args.command == "configure-tunnel":
                tunnel_id = args.tunnel_id or input("OpenAI tunnel_id: ").strip()
                key = (
                    sys.stdin.readline().strip()
                    if args.key_stdin
                    else getpass.getpass("Tunnel runtime key (hidden): ").strip()
                )
                result = configure_tunnel(tunnel_id, key)
            else:
                raise RuntimeError("Unsupported command")
        json_out({"ok": True, **result})
        return 0
    except Exception as exc:
        json_out({"ok": False, "error": str(exc)})
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
