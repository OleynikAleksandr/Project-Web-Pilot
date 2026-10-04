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

    const localRoot = path.join(root, 'local-runtime');
    const localPython = path.join(root, 'local-python');
    const localControl = path.join(root, 'local-control.py');
    await mkdir(localRoot, { recursive: true });
    await writeFile(localPython, '#!/bin/sh\n');
    await writeFile(localControl, '# control\n');
    const selected = await runPython(control, [
      'configure-selector',
      '--mode', 'local',
      '--mcp-url', 'http://127.0.0.1:27842/mcp',
      '--local-python', localPython,
      '--local-control', localControl,
      '--local-root', localRoot,
      '--local-state', state,
    ], env);
    assert.equal(selected.code, 0, selected.stderr || selected.stdout);
    assert.equal(JSON.parse(selected.stdout).mode, 'local');
    const retargetedProfile = await (await import('node:fs/promises')).readFile(profilePath, 'utf8');
    const selector = JSON.parse(await (await import('node:fs/promises')).readFile(path.join(state, 'private', 'selector.json'), 'utf8'));
    assert.match(retargetedProfile, /127\.0\.0\.1:27842\/mcp/);
    assert.equal(selector.mode, 'local');
    assert.equal(selector.mcp_url, 'http://127.0.0.1:27842/mcp');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('stable selector adopts an existing local tunnel without exposing its key', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'web-pilot-stable-tunnel-adopt-'));
  const state = path.join(root, 'app-state');
  const localState = path.join(root, 'local-state');
  const localPrivate = path.join(localState, 'private');
  const localProfileDir = path.join(localPrivate, 'tunnel-profile');
  const localRoot = path.join(root, 'local-runtime');
  const localPython = path.join(localRoot, '.venv', 'bin', 'python3');
  const localControl = path.join(localRoot, 'control.py');
  const control = path.join(repoRoot, 'tools', 'codex-app-server-mcp', 'control.py');
  const secret = 'stable-local-key-abcdefghijklmnop';
  await mkdir(localProfileDir, { recursive: true });
  await mkdir(path.dirname(localPython), { recursive: true });
  await writeFile(localPython, '#!/bin/sh\n');
  await writeFile(localControl, '# control\n');
  await writeFile(path.join(localPrivate, 'tunnel-key'), secret + '\n');
  await writeFile(path.join(localProfileDir, 'mac-local.yaml'), JSON.stringify({
    config_version: 1,
    control_plane: { base_url: 'https://api.openai.com', tunnel_id: 'tunnel_abcdefghijklmnop', api_key: 'env:LOCAL_KEY' },
    health: { listen_addr: '127.0.0.1:17843' },
    mcp: { server_urls: [{ channel: 'main', url: 'http://127.0.0.1:17842/mcp' }] },
  }, null, 2));
  try {
    const result = await runPython(control, [
      'configure-selector',
      '--mode', 'local',
      '--mcp-url', 'http://127.0.0.1:17842/mcp',
      '--local-python', localPython,
      '--local-control', localControl,
      '--local-root', localRoot,
      '--local-state', localState,
    ], {
      WEB_PILOT_CODEX_EXECUTOR_STATE_DIR: state,
      WEB_PILOT_CODEX_EXECUTOR_PORT: '27852',
      WEB_PILOT_CODEX_EXECUTOR_TUNNEL_PORT: '27853',
    });
    assert.equal(result.code, 0, result.stderr || result.stdout);
    const data = JSON.parse(result.stdout);
    assert.equal(data.adopted_tunnel, true);
    assert.equal(data.mcp_url, 'http://127.0.0.1:17842/mcp');
    assert.equal(result.stdout.includes(secret), false);
    const copiedKey = await (await import('node:fs/promises')).readFile(path.join(state, 'private', 'tunnel-key'), 'utf8');
    const profile = await (await import('node:fs/promises')).readFile(path.join(state, 'private', 'tunnel-profile', 'codex-executor.yaml'), 'utf8');
    assert.equal(copiedKey.trim(), secret);
    assert.match(profile, /tunnel_abcdefghijklmnop/);
    assert.match(profile, /127\.0\.0\.1:17842\/mcp/);
    assert.doesNotMatch(profile, new RegExp(secret));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

async function runCommand(command, args, env = {}) {
  return await new Promise((resolve, reject) => {
    const child = spawn(command, args, { env: { ...process.env, ...env }, stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    child.stdout.on('data', chunk => { stdout += chunk; });
    child.on('error', reject);
    child.on('close', code => code === 0 ? resolve(stdout.trim()) : reject(new Error(command + ' exited ' + code)));
  });
}

// A real process group recorded as if control.py had launched it.
async function fakeService(state, name) {
  const child = spawn('/bin/sleep', ['60'], { detached: true, stdio: 'ignore' });
  const exited = new Promise(resolve => child.once('exit', () => resolve(true)));
  await new Promise(resolve => setTimeout(resolve, 150));
  const identity = await runCommand('/bin/ps', ['-p', String(child.pid), '-o', 'lstart=', '-o', 'command='], { LC_ALL: 'C', LANG: 'C' });
  await mkdir(state, { recursive: true });
  await writeFile(path.join(state, name + '.pid.json'), JSON.stringify({ pid: child.pid, identity }));
  return { child, exited };
}

test('ChatGPT channel vps keeps tunnel-client stopped at login and survives backend switches', { timeout: 30_000 }, async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'web-pilot-chatgpt-channel-'));
  const state = path.join(root, 'state');
  const control = path.join(clientDir, 'control.py');
  const env = {
    WEB_PILOT_CODEX_EXECUTOR_STATE_DIR: state,
    WEB_PILOT_CODEX_EXECUTOR_PORT: '27852',
    WEB_PILOT_CODEX_EXECUTOR_TUNNEL_PORT: '27853',
  };
  const localRoot = path.join(root, 'local-runtime');
  const localControl = path.join(root, 'local-control.py');
  const services = [];
  await mkdir(localRoot, { recursive: true });
  await writeFile(localControl, `import json, sys
if sys.argv[1] == "start":
    print(json.dumps({"mcp": {"ready": True, "owned": True}, "mcp_url": "http://127.0.0.1:27842/mcp"}))
else:
    print(json.dumps({"ok": True}))
`);
  const python = await runCommand('python3', ['-c', 'import sys; print(sys.executable)']);
  const json = result => JSON.parse(result.stdout);
  const selectorFile = path.join(state, 'private', 'selector.json');
  const readSelector = async () => JSON.parse(await (await import('node:fs/promises')).readFile(selectorFile, 'utf8'));
  const configureSelector = mcpUrl => runPython(control, ['configure-selector', '--mode', 'local', '--mcp-url', mcpUrl,
    '--local-python', python, '--local-control', localControl, '--local-root', localRoot, '--local-state', state], env);
  try {
    const configured = await new Promise((resolve, reject) => {
      const child = spawn('python3', [control, 'configure-tunnel', '--tunnel-id', 'tunnel_abcdefghijklmnop', '--key-stdin'],
        { cwd: repoRoot, env: { ...process.env, ...env }, stdio: ['pipe', 'pipe', 'pipe'] });
      let stdout = '';
      child.stdout.on('data', chunk => { stdout += chunk; });
      child.on('error', reject);
      child.on('close', code => resolve({ code, stdout }));
      child.stdin.end('0123456789abcdefghijklmnop\n');
    });
    assert.equal(configured.code, 0, configured.stdout);

    const selected = await configureSelector('http://127.0.0.1:27842/mcp');
    assert.equal(selected.code, 0, selected.stdout);
    assert.equal(json(selected).chatgpt_channel, 'secure-tunnel');
    assert.equal(json(await runPython(control, ['status'], env)).selector.chatgpt_channel, 'secure-tunnel');

    // Secure Tunnel at login still starts tunnel-client (missing here, so the attempt is visible).
    const secureLogin = await runPython(control, ['selector-start'], env);
    assert.equal(secureLogin.code, 1);
    assert.match(json(secureLogin).error, /tunnel-client is missing/);

    const invalid = await runPython(control, ['configure-channel', '--channel', 'public'], env);
    assert.notEqual(invalid.code, 0);
    assert.equal((await readSelector()).chatgpt_channel, 'secure-tunnel');

    const vps = await runPython(control, ['configure-channel', '--channel', 'vps'], env);
    assert.equal(vps.code, 0, vps.stdout);
    assert.deepEqual(json(vps), { ok: true, configured: true, chatgpt_channel: 'vps' });
    assert.equal((await readSelector()).chatgpt_channel, 'vps');

    // stop --tunnel-only stops tunnel-client and leaves MCP running.
    const tunnel = await fakeService(state, 'tunnel'); services.push(tunnel.child);
    const mcp = await fakeService(state, 'mcp'); services.push(mcp.child);
    const stopped = await runPython(control, ['stop', '--tunnel-only'], env);
    assert.equal(stopped.code, 0, stopped.stdout);
    assert.deepEqual(json(stopped).services.map(service => service.service), ['tunnel']);
    assert.equal(await tunnel.exited, true);
    assert.equal(existsSync(path.join(state, 'tunnel.pid.json')), false);
    assert.equal(existsSync(path.join(state, 'mcp.pid.json')), true);
    assert.equal(mcp.child.exitCode, null);

    // Login in vps mode stops a running tunnel-client and never starts it.
    const loginTunnel = await fakeService(state, 'tunnel'); services.push(loginTunnel.child);
    const vpsLogin = await runPython(control, ['selector-start'], env);
    assert.equal(vpsLogin.code, 0, vpsLogin.stdout);
    const login = json(vpsLogin);
    assert.equal(login.tunnel.running, false);
    assert.equal(login.selected_backend.mcp_url, 'http://127.0.0.1:27842/mcp');
    assert.equal(login.selector.chatgpt_channel, 'vps');
    assert.equal(await loginTunnel.exited, true);
    assert.equal(existsSync(path.join(state, 'tunnel.pid.json')), false);

    // A runtime switch rewrites the backend but keeps the ChatGPT channel.
    const switched = await configureSelector('http://127.0.0.1:27852/mcp');
    assert.equal(switched.code, 0, switched.stdout);
    assert.equal(json(switched).chatgpt_channel, 'vps');
    assert.equal((await readSelector()).mcp_url, 'http://127.0.0.1:27852/mcp');
    assert.equal((await readSelector()).chatgpt_channel, 'vps');
  } finally {
    for (const child of services) if (child.exitCode === null && child.signalCode === null) {
      try { process.kill(-child.pid, 'SIGKILL'); } catch { /* already gone */ }
    }
    await rm(root, { recursive: true, force: true });
  }
});

test('App Server MCP answers a stale session id without initialize after a restart', { timeout: 60_000 }, async t => {
  const venvPython = path.join(homedir(), 'Library', 'Application Support', 'WebPilotCodexExecutor', 'runtime', 'venv', 'bin', 'python');
  const source = await (await import('node:fs/promises')).readFile(path.join(clientDir, 'server.py'), 'utf8');
  assert.match(source, /stateless_http=True/);
  if (!existsSync(venvPython)) { t.skip('Codex App Server runtime venv is not installed'); return; }
  const port = await new Promise((resolve, reject) => {
    const probe = http.createServer().listen(0, '127.0.0.1', () => { const { port } = probe.address(); probe.close(() => resolve(port)); });
    probe.on('error', reject);
  });
  const root = await mkdtemp(path.join(tmpdir(), 'web-pilot-stateless-'));
  const server = spawn(venvPython, ['-B', path.join(clientDir, 'server.py'), '--port', String(port), '--state-dir', root],
    { cwd: clientDir, env: { ...process.env, PYTHONDONTWRITEBYTECODE: '1' }, stdio: ['ignore', 'ignore', 'pipe'] });
  let stderr = '';
  server.stderr.on('data', chunk => { stderr += chunk; });
  t.after(async () => {
    if (server.exitCode === null) { server.kill('SIGTERM'); await new Promise(resolve => server.once('exit', resolve)); }
    await rm(root, { recursive: true, force: true });
  });
  // The id belongs to no process: exactly what ChatGPT sends after Web Pilot restarted the server.
  const call = () => fetch(`http://127.0.0.1:${port}/mcp`, { method: 'POST', headers: {
    'Content-Type': 'application/json', Accept: 'application/json, text/event-stream',
    'Mcp-Session-Id': '0123456789abcdef0123456789abcdef', 'MCP-Protocol-Version': '2025-06-18',
  }, body: JSON.stringify({ jsonrpc: '2.0', id: 7, method: 'tools/list', params: {} }) });
  let response;
  for (let attempt = 0; attempt < 100 && !response; attempt += 1) {
    try { response = await call(); } catch { await new Promise(resolve => setTimeout(resolve, 200)); }
    assert.equal(server.exitCode, null, stderr);
  }
  assert.ok(response, 'server did not start: ' + stderr);
  const text = await response.text();
  assert.equal(response.status, 200, text);
  assert.equal(response.headers.get('mcp-session-id'), null);
  const payload = text.trim().startsWith('{') ? text : text.split('\n').filter(line => line.startsWith('data:')).map(line => line.slice(5).trim()).at(-1);
  const message = JSON.parse(payload);
  assert.equal(message.id, 7);
  assert.ok(message.result.tools.some(tool => tool.name === 'run_command_batch'));
});

test('Computer Use accepts key characters and runs a batch of actions in one node_repl call', { timeout: 30_000 }, async t => {
  const venvPython = path.join(homedir(), 'Library', 'Application Support', 'WebPilotCodexExecutor', 'runtime', 'venv', 'bin', 'python');
  const source = await (await import('node:fs/promises')).readFile(path.join(clientDir, 'server.py'), 'utf8');
  assert.match(source, /def computer_actions\(/);
  if (!existsSync(venvPython)) { t.skip('Codex App Server runtime venv is not installed'); return; }
  const root = await mkdtemp(path.join(tmpdir(), 'web-pilot-computer-actions-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const probe = path.join(root, 'probe.py');
  await writeFile(probe, `import json, sys, pathlib
sys.path.insert(0, sys.argv[1])
import server
calls = []
class Client:
    cwd = sys.argv[2]
    def mcp_tool_call(self, server_name, tool, args):
        calls.append({"server": server_name, "tool": tool, "code": args["code"]})
        if "var steps=" in args["code"]:
            return {"content": [{"type": "text", "text": json.dumps({"results": [{"ok": True, "ms": 3}, {"ok": True, "ms": 2}, {"ok": False, "ms": 1, "error": "boom"}], "total_ms": 9})}]}
        return {"content": [{"type": "text", "text": "{}"}]}
facade = server.LocalFacade(Client(), pathlib.Path(sys.argv[2]))
out = {}
try:
    facade.computer_key_press("*")
except ValueError as error:
    out["no_app"] = str(error)
facade._active_app_id = "com.apple.calculator"
out["key"] = facade.computer_key_press("*")
out["named"] = facade.computer_key_press("Return")
out["hotkey"] = facade.computer_hotkey(["cmd", "="])
out["batch"] = facade.computer_actions([{"type": "key", "key": "1"}, {"type": "key", "key": "*", "presses": 2}, {"type": "text", "text": "Привет"}, {"type": "wait", "ms": 10}])
errors = {}
cases = {"unknown": [{"type": "drag"}], "empty": [], "too_many": [{"type": "wait", "ms": 0}] * 51, "bad_click": [{"type": "click", "x": "1", "y": 2}]}
for name, actions in cases.items():
    try:
        facade.computer_actions(actions)
        errors[name] = None
    except ValueError as error:
        errors[name] = str(error)
out["errors"] = errors
out["calls"] = calls
print(json.dumps(out, ensure_ascii=False))
`);
  const run = await new Promise((resolve, reject) => {
    const child = spawn(venvPython, ['-B', probe, clientDir, root], { cwd: root, env: { ...process.env, PYTHONDONTWRITEBYTECODE: '1' }, stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '', stderr = '';
    child.stdout.on('data', chunk => { stdout += chunk; });
    child.stderr.on('data', chunk => { stderr += chunk; });
    child.on('error', reject);
    child.on('close', code => resolve({ code, stdout, stderr }));
  });
  assert.equal(run.code, 0, run.stderr);
  const out = JSON.parse(run.stdout.trim().split('\n').at(-1));
  assert.match(out.no_app, /No active app/);
  assert.equal(out.calls.length, 4, 'validation errors never reach Computer Use');
  assert.ok(out.calls.every(call => call.server === 'node_repl' && call.tool === 'js'));
  assert.match(out.calls[0].code, /key:"asterisk"/);
  assert.match(out.calls[1].code, /key:"Return"/);
  assert.match(out.calls[2].code, /key:"super\+equal"/);

  // Execute the generated batch script against a fake sky: one call, actions in order, stop at the first failure.
  const AsyncFunction = (async () => {}).constructor;
  const execute = async (failOn) => {
    const events = []; let written = '';
    globalThis.sky = {
      press_key: async ({ app, key }) => { events.push(['key', app, key]); if (key === failOn) throw new Error('keyNotFound(' + key + ')'); },
      paste: async ({ app, text, format }) => { events.push(['paste', app, text, format]); },
      click: async () => { events.push(['click']); }, scroll: async () => { events.push(['scroll']); },
    };
    try { await new AsyncFunction('nodeRepl', out.calls[3].code)({ write: value => { written = value; } }); }
    finally { delete globalThis.sky; }
    return { events, result: JSON.parse(written) };
  };
  const ok = await execute(null);
  assert.deepEqual(ok.events, [['key', 'com.apple.calculator', '1'], ['key', 'com.apple.calculator', 'asterisk'],
    ['key', 'com.apple.calculator', 'asterisk'], ['paste', 'com.apple.calculator', 'Привет', 'text']]);
  assert.deepEqual(ok.result.results.map(row => row.ok), [true, true, true, true]);
  const stopped = await execute('asterisk');
  assert.deepEqual(stopped.events, [['key', 'com.apple.calculator', '1'], ['key', 'com.apple.calculator', 'asterisk']]);
  assert.deepEqual(stopped.result.results.map(row => row.ok), [true, false]);
  assert.match(stopped.result.results[1].error, /keyNotFound/);

  // The facade maps per-action outcomes back to the actions it built.
  assert.equal(out.batch.completed, false);
  assert.equal(out.batch.skipped, 1);
  assert.equal(out.batch.failed.index, 2);
  assert.equal(out.batch.failed.error, 'boom');
  assert.equal(out.batch.results[1].sky_key, 'asterisk');
  assert.equal(out.batch.results[1].presses, 2);
  assert.equal(out.batch.results[2].mode, 'paste');
  assert.match(out.errors.unknown, /unknown action type/);
  assert.match(out.errors.empty, /non-empty/);
  assert.match(out.errors.too_many, /limited to 50/);
  assert.match(out.errors.bad_click, /integer x and y/);
});

test('workflow context is read in text parts with the session rules and the project open in Web Pilot', { timeout: 60_000 }, async t => {
  const venvPython = path.join(homedir(), 'Library', 'Application Support', 'WebPilotCodexExecutor', 'runtime', 'venv', 'bin', 'python');
  if (!existsSync(venvPython)) { t.skip('Codex App Server runtime venv is not installed'); return; }
  const { chmod } = await import('node:fs/promises');
  const root = await mkdtemp(path.join(tmpdir(), 'web-pilot-context-parts-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const workspace = path.join(root, 'Мой проект');
  await mkdir(path.join(workspace, 'scripts'), { recursive: true });
  await mkdir(path.join(workspace, '.harness', 'plans'), { recursive: true });
  await writeFile(path.join(workspace, '.harness', 'plans', 'todo-plan.md'), '# plan\n');
  // About 70 KB of Russian lines plus one line longer than a part.
  const lines = Array.from({ length: 900 }, (_, i) => `Строка ${i} контекста проекта: описание модулей и правил работы.`);
  lines.splice(450, 0, 'Длинная строка '.repeat(2000));
  const text = lines.join('\n') + '\nReference-only: []\n';
  await writeFile(path.join(workspace, 'packet.json'), JSON.stringify({ ok: true, text, completeness: 'COMPLETE', head: 'h', signature: 's' }));
  const script = path.join(workspace, 'scripts', 'workflow');
  await writeFile(script, '#!/bin/sh\ncat "$(dirname "$0")/../packet.json"\n');
  await chmod(script, 0o755);
  const probe = path.join(root, 'probe.py');
  await writeFile(probe, `import json, sys, pathlib, subprocess
sys.path.insert(0, sys.argv[1])
import server
root = pathlib.Path(sys.argv[2])
workspace = sys.argv[3]
class Client:
    cwd = str(root)
    def fs_read_file(self, path):
        return pathlib.Path(path).read_bytes()
    def command_exec(self, argv, cwd=None, timeout_ms=None, output_bytes_cap=None, **kwargs):
        run = subprocess.run(argv, cwd=cwd, capture_output=True, text=True)
        return {"exitCode": run.returncode, "stdout": run.stdout, "stderr": run.stderr}
state = root / "state"
state.mkdir()
facade = server.LocalFacade(Client(), state)
out = {}
try:
    facade.workflow_context("", "", 1)
except ValueError as error:
    out["no_active"] = str(error)
(state / "active-workspace.json").write_text(json.dumps({"workspace": workspace}), encoding="utf-8")
full = facade.workflow_context("", "", 0)
out["full_context"] = full["context"]
parts = []
for number in range(1, 50):
    part = facade.workflow_context("", "", number)
    parts.append(part)
    if "[КОНЕЦ ПАКЕТА]" in part:
        break
out["parts"] = parts
out["explicit_first"] = facade.workflow_context(workspace, "", 1) == parts[0]
out["range"] = []
for bad in (len(parts) + 1, -1):
    try:
        facade.workflow_context(workspace, "", bad)
        out["range"].append(None)
    except ValueError as error:
        out["range"].append(str(error))
out["rules"] = server.session_rules()
mcp = server.create_server(host="127.0.0.1", port=0, state_root=state)
tool = mcp._tool_manager.get_tool("workflow_context_recover")
out["output_schema"] = tool.fn_metadata.output_schema
out["params"] = tool.parameters
out["instructions"] = mcp.instructions
print(json.dumps(out, ensure_ascii=False))
`);
  const run = await new Promise((resolve, reject) => {
    const child = spawn(venvPython, ['-B', probe, clientDir, root, workspace], { cwd: root, env: { ...process.env, PYTHONDONTWRITEBYTECODE: '1' }, stdio: ['ignore', 'pipe', 'pipe'] });
    // Decode as one stream: a Cyrillic character may be split between two chunks.
    child.stdout.setEncoding('utf8'); child.stderr.setEncoding('utf8');
    let stdout = '', stderr = '';
    child.stdout.on('data', chunk => { stdout += chunk; });
    child.stderr.on('data', chunk => { stderr += chunk; });
    child.on('error', reject);
    child.on('close', code => resolve({ code, stdout, stderr }));
  });
  assert.equal(run.code, 0, run.stderr);
  const out = JSON.parse(run.stdout.trim().split('\n').at(-1));
  assert.match(out.no_active, /WORKSPACE_REQUIRED/);
  assert.equal(out.full_context, text, 'part=0 keeps the whole packet');
  assert.ok(out.parts.length >= 4, 'about 70 KB needs several parts');
  const total = out.parts.length;
  const resolvedWorkspace = await (await import('node:fs/promises')).realpath(workspace); // /var → /private/var on macOS
  const bodies = [], shas = new Set();
  out.parts.forEach((part, index) => {
    const head = part.slice(0, part.indexOf('\n\n'));
    assert.match(head, new RegExp(`^ЧАСТЬ ${index + 1} ИЗ ${total} контекста проекта `));
    assert.ok(head.includes(JSON.stringify(resolvedWorkspace)), 'every part names the project folder');
    shas.add(head.match(/sha256 ([0-9a-f]{16})/)[1]);
    const marker = index + 1 < total ? '\n[ПРОДОЛЖЕНИЕ]' : '\n[КОНЕЦ ПАКЕТА]';
    const body = part.slice(head.length + 2, part.lastIndexOf(marker));
    assert.ok(Buffer.byteLength(body) <= 20_000, `part ${index + 1} body is ${Buffer.byteLength(body)} bytes`);
    if (index + 1 < total) assert.ok(part.endsWith(`part=${index + 2}).\n`), 'the next call is named at the end');
    else assert.match(part, /Это последняя часть\./);
    bodies.push(body);
  });
  assert.equal(shas.size, 1, 'all parts carry one sha256');
  assert.equal(bodies.join(''), out.rules + text, 'parts join into the rules plus the exact packet');
  assert.ok(bodies[0].startsWith('ПРАВИЛА СЕССИИ WEB PILOT'));
  for (const rule of ['не более одной микрозадачи', 'Delivery-порядок', 'Не запускай codex exec', 'текущему checkout/worktree'])
    assert.ok(out.rules.includes(rule), rule);
  assert.equal(out.explicit_first, true);
  assert.match(out.range[0], /PART_OUT_OF_RANGE/);
  assert.match(out.range[1], /PART_OUT_OF_RANGE/);
  assert.equal(out.output_schema, null, 'text only: no structured copy of the result');
  assert.equal(out.params.properties.part.default, 0);
  assert.equal(out.params.properties.workspace.default, '');
  const lead = out.instructions.slice(0, 512);
  for (const phrase of ['Workflow Kit projects', 'workflow_context_recover(part=1)', 'until the last part', 'before your first answer'])
    assert.ok(lead.includes(phrase), phrase);
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