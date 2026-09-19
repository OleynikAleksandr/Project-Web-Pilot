import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, mkdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir, homedir } from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { spawn } from 'node:child_process';

const repoRoot = path.resolve(import.meta.dirname, '..');
const clientDir = path.join(repoRoot, 'tools', 'codex-app-server-mcp');
const userCodex = path.join(homedir(), '.npm-global', 'bin', 'codex');

function tomlString(value) {
  return JSON.stringify(String(value));
}

async function runPython(script, args = [], env = {}) {
  return await new Promise((resolve, reject) => {
    const child = spawn('python3', [script, ...args], {
      cwd: repoRoot,
      env: { ...process.env, ...env },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', chunk => { stdout += chunk; });
    child.stderr.on('data', chunk => { stderr += chunk; });
    child.on('error', reject);
    child.on('close', code => resolve({ code, stdout, stderr }));
  });
}

test('Codex App Server client executes directly without a model turn', { timeout: 60_000 }, async t => {
  if (process.platform !== 'darwin' || !existsSync(userCodex)) {
    t.skip('real Codex App Server probe requires the local macOS Codex binary');
    return;
  }

  const root = await mkdtemp(path.join(tmpdir(), 'web-pilot-codex-app-server-'));
  const codexHome = path.join(root, 'codex-home');
  await mkdir(codexHome, { recursive: true });

  let modelRequests = 0;
  const modelServer = http.createServer((_request, response) => {
    modelRequests += 1;
    response.statusCode = 503;
    response.end('model endpoint intentionally unavailable');
  });
  await new Promise(resolve => modelServer.listen(0, '127.0.0.1', resolve));
  const modelPort = modelServer.address().port;

  const fakeMcp = path.join(root, 'fake_mcp.py');
  await writeFile(fakeMcp, `#!/usr/bin/env python3
import json, sys
for raw in sys.stdin:
    try:
        msg = json.loads(raw)
    except Exception:
        continue
    method = msg.get("method")
    ident = msg.get("id")
    if ident is None:
        continue
    if method == "initialize":
        result = {
            "protocolVersion": msg.get("params", {}).get("protocolVersion", "2025-06-18"),
            "capabilities": {"tools": {"listChanged": False}},
            "serverInfo": {"name": "webpilot-fake-local", "version": "1.0"}
        }
    elif method == "tools/list":
        result = {"tools": [{
            "name": "add",
            "description": "Add two integers",
            "inputSchema": {
                "type": "object",
                "properties": {"a": {"type": "integer"}, "b": {"type": "integer"}},
                "required": ["a", "b"]
            },
            "annotations": {"readOnlyHint": True}
        }]}
    elif method == "tools/call":
        args = msg.get("params", {}).get("arguments", {})
        result = {"content": [{"type": "text", "text": json.dumps({"sum": args.get("a", 0) + args.get("b", 0)})}], "isError": False}
    elif method == "ping":
        result = {}
    else:
        sys.stdout.write(json.dumps({"jsonrpc":"2.0","id":ident,"error":{"code":-32601,"message":"unsupported"}}) + "\\n")
        sys.stdout.flush()
        continue
    sys.stdout.write(json.dumps({"jsonrpc":"2.0","id":ident,"result":result}) + "\\n")
    sys.stdout.flush()
`);

  const config = `
model_provider = "blocked"
model = "probe-model"
[analytics]
enabled = false
[model_providers.blocked]
name = "Blocked local model endpoint"
base_url = ${tomlString(`http://127.0.0.1:${modelPort}/v1`)}
wire_api = "responses"
requires_openai_auth = false
[mcp_servers.arithmetic_probe]
command = ${tomlString('python3')}
args = [${tomlString(fakeMcp)}]
startup_timeout_sec = 8
tool_timeout_sec = 5
`.trimStart();
  await writeFile(path.join(codexHome, 'config.toml'), config);

  const probe = path.join(root, 'probe.py');
  await writeFile(probe, `import json, os, sys, tempfile, time
sys.path.insert(0, ${JSON.stringify(clientDir)})
from app_server_client import AppServerClient, AppServerError

codex, root = sys.argv[1], sys.argv[2]
target = os.path.join(root, "data.txt")
c = AppServerClient(binary=codex, cwd=root, environment={"CODEX_HOME": os.environ["CODEX_HOME"]}, request_timeout=20)
c.start()
before = c.status()
cmd = c.command_exec(["/bin/echo", "APP_SERVER_DIRECT_OK"], sandbox_policy={"type":"readOnly"}, timeout_ms=5000)
c.fs_write_file(target, b"hello-from-app-server")
readback = c.fs_read_file(target).decode("utf-8")
listing = c.fs_read_directory(root)
git_init = c.command_exec(["/usr/bin/git", "init", "-q"], cwd=root, sandbox_policy={"type":"dangerFullAccess"}, timeout_ms=5000)
git_status = c.command_exec(["/usr/bin/git", "status", "--short"], cwd=root, sandbox_policy={"type":"dangerFullAccess"}, timeout_ms=5000)
process = c.start_command(["/bin/sh", "-c", "printf PROCESS_START; sleep 10; printf PROCESS_END"], cwd=root, sandbox_policy={"type":"dangerFullAccess"})
chunk = c.read_process_output(process["process_id"], wait_ms=2000)
stopped = c.stop_process(process["process_id"])
forbidden = False
try:
    c.request("turn/start", {})
except AppServerError:
    forbidden = True
thread_id = c.ensure_mcp_thread()
servers = c.mcp_status_list()
probe_server = next(item for item in servers if item.get("name") == "arithmetic_probe")
call = c.mcp_tool_call("arithmetic_probe", "add", {"a": 17, "b": 25})
old_generation = c.generation
c._process.kill()
c._process.wait(timeout=3)
read_after_restart = c.fs_read_file(target).decode("utf-8")
after = c.status()
c.close()
print(json.dumps({
    "before": before,
    "stdout": cmd.get("stdout"),
    "exitCode": cmd.get("exitCode"),
    "readback": readback,
    "directoryHasData": any((entry.get("fileName") == "data.txt") for entry in listing.get("entries", [])),
    "gitInit": git_init.get("exitCode"),
    "gitStatus": git_status.get("exitCode"),
    "processChunk": chunk.get("stdout"),
    "processStopped": not stopped.get("running", True),
    "forbidden": forbidden,
    "thread": bool(thread_id),
    "mcpStatus": probe_server.get("runtimeStatus"),
    "mcpCall": call,
    "restartGenerationAdvanced": after["generation"] > old_generation,
    "readAfterRestart": read_after_restart,
}, ensure_ascii=False))
`);

  try {
    const result = await runPython(probe, [userCodex, root], { CODEX_HOME: codexHome });
    assert.equal(result.code, 0, result.stderr || result.stdout);
    const lines = result.stdout.trim().split(/\n/);
    const data = JSON.parse(lines.at(-1));
    assert.equal(data.exitCode, 0);
    assert.match(data.stdout, /APP_SERVER_DIRECT_OK/);
    assert.equal(data.readback, 'hello-from-app-server');
    assert.equal(data.directoryHasData, true);
    assert.equal(data.gitInit, 0);
    assert.equal(data.gitStatus, 0);
    assert.match(data.processChunk, /PROCESS_START/);
    assert.equal(data.processStopped, true);
    assert.equal(data.forbidden, true);
    assert.equal(data.thread, true);
    assert.equal(data.mcpStatus, 'connected');
    assert.match(JSON.stringify(data.mcpCall), /42/);
    assert.equal(data.restartGenerationAdvanced, true);
    assert.equal(data.readAfterRestart, 'hello-from-app-server');
    assert.equal(modelRequests, 0, 'executor path must not call the configured model endpoint');
  } finally {
    await new Promise(resolve => modelServer.close(resolve));
    await rm(root, { recursive: true, force: true });
  }
});

test('Codex App Server MCP facade exposes local parity and excludes cloud duplicates', async () => {
  const { readFile } = await import('node:fs/promises');
  const source = await readFile(path.join(repoRoot, 'tools', 'codex-app-server-mcp', 'server.py'), 'utf8');

  const required = [
    'bridge_status', 'workflow_context_recover',
    'computer_status', 'computer_list_windows', 'computer_activate_window',
    'computer_capture_screen', 'computer_capture_window', 'computer_move_mouse',
    'computer_click', 'computer_scroll', 'computer_type_text', 'computer_key_press',
    'computer_hotkey', 'computer_release_inputs',
    'list_drives', 'file_info', 'list_directory', 'read_file', 'read_binary',
    'search_files', 'search_text', 'make_directory', 'write_file', 'write_binary',
    'patch_binary', 'replace_text', 'apply_patch', 'copy_path', 'move_path',
    'delete_path', 'list_trash', 'restore_trash',
    'run_command', 'run_command_batch', 'start_process', 'process_status',
    'read_process_output', 'list_processes', 'stop_process',
    'list_repository_tree', 'read_repository_file', 'search_repository',
    'git_status', 'git_diff', 'git_log', 'git_show',
  ];
  for (const name of required) {
    assert.match(source, new RegExp(`def ${name}\\(`), `missing local tool ${name}`);
  }

  assert.match(source, /node_repl/);
  assert.match(source, /@oai\/sky/);
  for (const duplicate of ['openaiDeveloperDocs', 'codex_apps', 'playwright']) {
    assert.doesNotMatch(source, new RegExp(`def ${duplicate}\\(`));
  }
});

test('experimental lifecycle keeps independent state, ports and tunnel credentials', { timeout: 20_000 }, async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'web-pilot-codex-control-'));
  const state = path.join(root, 'state');
  const control = path.join(repoRoot, 'tools', 'codex-app-server-mcp', 'control.py');
  const env = {
    WEB_PILOT_CODEX_EXECUTOR_STATE_DIR: state,
    WEB_PILOT_CODEX_EXECUTOR_PORT: '27852',
    WEB_PILOT_CODEX_EXECUTOR_TUNNEL_PORT: '27853',
  };

  try {
    const status = await runPython(control, ['status'], env);
    assert.equal(status.code, 0, status.stderr || status.stdout);
    const statusJson = JSON.parse(status.stdout);
    assert.equal(statusJson.ok, true);
    assert.equal(statusJson.mcp_url, 'http://127.0.0.1:27852/mcp');
    assert.equal(statusJson.tunnel.ready, false);
    assert.equal(statusJson.production_runtime_touched, false);

    const configured = await new Promise((resolve, reject) => {
      const child = spawn(
        'python3',
        [control, 'configure-tunnel', '--tunnel-id', 'tunnel_abcdefghijklmnop', '--key-stdin'],
        { cwd: repoRoot, env: { ...process.env, ...env }, stdio: ['pipe', 'pipe', 'pipe'] },
      );
      let stdout = '';
      let stderr = '';
      child.stdout.on('data', chunk => { stdout += chunk; });
      child.stderr.on('data', chunk => { stderr += chunk; });
      child.on('error', reject);
      child.on('close', code => resolve({ code, stdout, stderr }));
      child.stdin.end('0123456789abcdefghijklmnop\n');
    });
    assert.equal(configured.code, 0, configured.stderr || configured.stdout);
    assert.equal(JSON.parse(configured.stdout).configured, true);

    const profilePath = path.join(state, 'private', 'tunnel-profile', 'codex-executor.yaml');
    const keyPath = path.join(state, 'private', 'tunnel-key');
    const profile = await (await import('node:fs/promises')).readFile(profilePath, 'utf8');
    const key = await (await import('node:fs/promises')).readFile(keyPath, 'utf8');
    const keyMode = (await (await import('node:fs/promises')).stat(keyPath)).mode & 0o777;

    assert.match(profile, /127\.0\.0\.1:27852\/mcp/);
    assert.match(profile, /127\.0\.0\.1:27853/);
    assert.match(profile, /WEB_PILOT_CODEX_EXECUTOR_TUNNEL_API_KEY/);
    assert.doesNotMatch(profile, /0123456789abcdefghijklmnop/);
    assert.equal(key.trim(), '0123456789abcdefghijklmnop');
    assert.equal(keyMode, 0o600);
    assert.equal(profile.includes('17842'), false);
    assert.equal(profile.includes('17843'), false);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('pid identity forces C locale for stable Terminal ownership checks', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'web-pilot-codex-identity-'));
  const probe = path.join(root, 'probe.py');
  const control = path.join(repoRoot, 'tools', 'codex-app-server-mcp', 'control.py');
  await writeFile(probe, `import importlib.util, json, sys
spec=importlib.util.spec_from_file_location("ctl", sys.argv[1])
ctl=importlib.util.module_from_spec(spec); spec.loader.exec_module(ctl)
seen={}
class Result:
    returncode=0
    stdout="Sat Sep 19 13:39:39 2026     /tmp/fake-process\\n"
def fake_run(*args, **kwargs):
    seen.update(kwargs.get("env") or {})
    return Result()
ctl.subprocess.run=fake_run
identity=ctl.pid_identity(123)
print(json.dumps({"identity":identity,"LC_ALL":seen.get("LC_ALL"),"LANG":seen.get("LANG")}))
`);
  try {
    const result = await runPython(probe, [control], { LANG: 'ru_RU.UTF-8', LC_ALL: 'ru_RU.UTF-8' });
    assert.equal(result.code, 0, result.stderr || result.stdout);
    const data = JSON.parse(result.stdout.trim());
    assert.equal(data.LC_ALL, 'C');
    assert.equal(data.LANG, 'C');
    assert.match(data.identity, /^Sat Sep 19/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});



test('Computer Use actions route through Sky instead of Swift CGEvent', async () => {
  const { readFile } = await import('node:fs/promises');
  const source = await readFile(path.join(repoRoot, 'tools', 'codex-app-server-mcp', 'server.py'), 'utf8');
  const start = source.indexOf('    def computer_click(');
  const end = source.indexOf('    def _window(', start);
  const actions = source.slice(start, end);
  assert.ok(start > 0 && end > start);
  assert.match(source, /self\._active_app_id: str \| None = None/);
  assert.match(actions, /sky\.click/);
  assert.match(actions, /sky\.scroll/);
  assert.match(actions, /sky\.paste/);
  assert.match(actions, /sky\.press_key/);
  assert.match(actions, /node_repl -> @oai\/sky/);
  assert.doesNotMatch(actions, /self\._swift/);
});
