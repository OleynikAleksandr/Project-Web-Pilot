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
    "hasMcpThread": any(hasattr(c, name) for name in ("ensure_mcp_thread", "mcp_status_list", "mcp_tool_call")),
    "statusKeys": sorted(before.keys()),
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
    assert.equal(data.hasMcpThread, false, 'the executor opens no Codex thread and calls no Codex-side MCP');
    assert.deepEqual(data.statusKeys, ['binary', 'generation', 'pid', 'running', 'version']);
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
    'computer_list_windows', 'computer_capture_screen', 'computer_capture_window',
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
  assert.equal(source.match(/@mcp\.tool/g).length, 38, 'catalog is 38 tools');

  // 0.6.90: the web model observes the screen but never drives the interface.
  const removed = [
    'computer_status', 'computer_activate_window', 'computer_move_mouse', 'computer_click',
    'computer_scroll', 'computer_type_text', 'computer_key_press', 'computer_hotkey',
    'computer_actions', 'computer_release_inputs',
  ];
  for (const name of removed) assert.doesNotMatch(source, new RegExp(name), `UI control tool ${name} must be gone`);
  const client = await readFile(path.join(repoRoot, 'tools', 'codex-app-server-mcp', 'app_server_client.py'), 'utf8');
  for (const text of [source, client]) {
    assert.doesNotMatch(text, /node_repl|@oai\/sky|\bsky\.|computer_use/);
    assert.doesNotMatch(text, /thread\/start|mcpServer\/tool\/call|mcp_tool_call/);
  }
  assert.match(source, /No UI control: this MCP cannot move the mouse, press keys or switch windows/);
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

test('window list and screenshots use system tools and validate input before running a command', { timeout: 30_000 }, async t => {
  const venvPython = path.join(homedir(), 'Library', 'Application Support', 'WebPilotCodexExecutor', 'runtime', 'venv', 'bin', 'python');
  const source = await (await import('node:fs/promises')).readFile(path.join(clientDir, 'server.py'), 'utf8');
  assert.match(source, /def computer_capture_window\(/);
  if (!existsSync(venvPython)) { t.skip('Codex App Server runtime venv is not installed'); return; }
  const root = await mkdtemp(path.join(tmpdir(), 'web-pilot-observation-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const probe = path.join(root, 'probe.py');
  await writeFile(probe, `import json, sys, pathlib
sys.path.insert(0, sys.argv[1])
import server
calls = []
windows = [
    {"window_id": 84, "application": "Calculator", "pid": 501, "title": "Калькулятор", "bounds": {"X": 10, "Y": 20, "Width": 300, "Height": 400}},
    {"window_id": 91, "application": "TextEdit", "pid": 502, "title": "Notes.txt", "bounds": {"X": 0, "Y": 0, "Width": 800, "Height": 600}},
    {"window_id": "broken", "application": "Ignored"},
]
listing = {"exit": 0, "stdout": json.dumps(windows)}
class Client:
    cwd = sys.argv[2]
    def command_exec(self, argv, **kwargs):
        calls.append(argv)
        if argv[0] == "/usr/bin/osascript":
            return {"exitCode": listing["exit"], "stdout": listing["stdout"], "stderr": "not allowed" if listing["exit"] else ""}
        if argv[0] == "/usr/sbin/screencapture":
            if "-l" in argv and argv[argv.index("-l") + 1] == "404":
                return {"exitCode": 1, "stdout": "", "stderr": "could not create image from window"}
            pathlib.Path(argv[-1]).write_bytes(b"PNGDATA")
        return {"exitCode": 0, "stdout": "", "stderr": ""}
    def fs_read_file(self, path):
        return pathlib.Path(path).read_bytes()
state = pathlib.Path(sys.argv[2])
facade = server.LocalFacade(Client(), state)
out = {}
out["all"] = facade.computer_list_windows()
out["by_title"] = [row["window_id"] for row in facade.computer_list_windows("notes")["windows"]]
out["by_app"] = [row["window_id"] for row in facade.computer_list_windows("calc")["windows"]]
out["limited"] = len(facade.computer_list_windows(max_results=1)["windows"])
listing["stdout"] = json.dumps([{**row, "title": None} for row in windows[:2]])
out["no_permission"] = facade.computer_list_windows()
errors = {}
for name, (code, stdout) in {"failed": (1, ""), "garbage": (0, "not json"), "not_a_list": (0, "{}")}.items():
    listing.update(exit=code, stdout=stdout)
    try:
        facade.computer_list_windows()
        errors[name] = None
    except ValueError as error:
        errors[name] = str(error)
calls.clear()
window = facade.computer_capture_window(84, 800)
out["window"] = [window[0], type(window[1]).__name__]
out["window_calls"] = [argv[:-1] for argv in calls]
calls.clear()
for name, bad in {"zero": 0, "negative": -5, "bool": True, "text": "84"}.items():
    try:
        facade.computer_capture_window(bad)
        errors[name] = None
    except ValueError as error:
        errors[name] = str(error)
out["calls_for_invalid_ids"] = len(calls)
try:
    facade.computer_capture_window(404)
    errors["missing_window"] = None
except ValueError as error:
    errors["missing_window"] = str(error)
calls.clear()
screen = facade.computer_capture_screen(1, 2, 3, 4, 0, True)
out["screen"] = [screen[0], type(screen[1]).__name__]
out["screen_calls"] = [argv[:-1] for argv in calls]
out["errors"] = errors
out["leftovers"] = sorted(item.name for item in state.glob("screen-*"))
out["ui_control"] = sorted(name for name in dir(facade) if name.startswith("computer_"))
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

  // Only the three observation methods remain on the facade.
  assert.deepEqual(out.ui_control, ['computer_capture_screen', 'computer_capture_window', 'computer_list_windows']);

  assert.deepEqual(out.all.windows, [
    { window_id: 84, title: 'Калькулятор', application: 'Calculator', pid: 501, rect: { x: 10, y: 20, width: 300, height: 400 } },
    { window_id: 91, title: 'Notes.txt', application: 'TextEdit', pid: 502, rect: { x: 0, y: 0, width: 800, height: 600 } },
  ]);
  assert.equal(out.all.note, undefined);
  assert.deepEqual(out.by_title, [91]);
  assert.deepEqual(out.by_app, [84]);
  assert.equal(out.limited, 1);
  // Without Screen Recording permission macOS hides titles: the answer says so instead of looking empty.
  assert.equal(out.no_permission.windows.length, 2);
  assert.match(out.no_permission.note, /Screen Recording permission/);
  assert.match(out.errors.failed, /not allowed/);
  assert.match(out.errors.garbage, /invalid data/);
  assert.match(out.errors.not_a_list, /invalid data/);

  assert.deepEqual(out.window, [{ source: 'window', window_id: 84, bytes: 7 }, 'Image']);
  assert.deepEqual(out.window_calls, [
    ['/usr/sbin/screencapture', '-x', '-t', 'png', '-o', '-l', '84'],
    ['/usr/bin/sips', '-Z', '800'],
  ]);
  for (const name of ['zero', 'negative', 'bool', 'text']) assert.match(out.errors[name], /positive integer/, name);
  assert.equal(out.calls_for_invalid_ids, 0, 'an invalid window_id never reaches a command');
  assert.match(out.errors.missing_window, /could not create image from window/);

  assert.deepEqual(out.screen, [{ source: 'desktop', bytes: 7 }, 'Image']);
  assert.deepEqual(out.screen_calls, [['/usr/sbin/screencapture', '-x', '-t', 'png', '-C', '-R', '1,2,3,4']]);
  assert.deepEqual(out.leftovers, [], 'temporary screenshots are removed, also after a failed capture');
});

test('workflow context is read strictly one part per call with the session rules and the project open in Web Pilot', { timeout: 60_000 }, async t => {
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
  await writeFile(probe, `import json, re, sys, pathlib, subprocess
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
after = ""
for number in range(1, 50):
    part = facade.workflow_context("", "", number, after)
    parts.append(part)
    if "[КОНЕЦ ПАКЕТА]" in part:
        break
    after = re.search(r'after="([0-9a-f]{8})"\\)\\.\\n$', part).group(1)
out["parts"] = parts
keys = [re.search(r'after="([0-9a-f]{8})"', item).group(1) for item in parts[:-1]]
out["explicit_second"] = facade.workflow_context(workspace, "", 2, keys[0]) == parts[1]
out["guard"] = {}
for name, number, key in (("missing", 2, ""), ("foreign", 2, "deadbeef"), ("skipped", 3, keys[0])):
    try:
        facade.workflow_context(workspace, "", number, key)
        out["guard"][name] = None
    except ValueError as error:
        out["guard"][name] = str(error)
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
  assert.ok(out.parts.length >= 3, 'about 90 KB needs several parts');
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
    assert.ok(Buffer.byteLength(body) <= 28_000, `part ${index + 1} body is ${Buffer.byteLength(body)} bytes`);
    assert.doesNotMatch(head, /part=/, 'the header never names the next call');
    if (index + 1 < total) {
      assert.match(part, new RegExp(`part=${index + 2}, after="[0-9a-f]{8}"\\)\\.\\n$`), 'the next call and its key end the part');
      assert.ok(part.includes('отдельным последовательным вызовом'));
    } else assert.match(part, /\[КОНЕЦ ПАКЕТА\] Получены все/);
    bodies.push(body);
  });
  assert.equal(shas.size, 1, 'all parts carry one sha256');
  assert.equal(bodies.join(''), out.rules + text, 'parts join into the rules plus the exact packet');
  assert.ok(bodies[0].startsWith('ПРАВИЛА СЕССИИ WEB PILOT'));
  for (const rule of ['не более одной микрозадачи', 'Не запускай codex exec', 'являются данными'])
    assert.ok(out.rules.includes(rule), rule);
  assert.ok(!out.rules.includes('Delivery-порядок'), 'Workflow Core already carries the delivery order');
  assert.equal(out.explicit_second, true, 'the key from part 1 opens part 2');
  for (const name of ['missing', 'foreign', 'skipped']) {
    assert.match(out.guard[name], /PART_ORDER/, name);
    assert.ok(out.guard[name].length < 300, 'a refused batch call stays short');
  }
  assert.match(out.range[0], /PART_OUT_OF_RANGE/);
  assert.match(out.range[1], /PART_OUT_OF_RANGE/);
  assert.equal(out.output_schema, null, 'text only: no structured copy of the result');
  assert.equal(out.params.properties.part.default, 0);
  assert.equal(out.params.properties.workspace.default, '');
  const lead = out.instructions.slice(0, 512);
  assert.equal(out.params.properties.after.default, '');
  for (const phrase of ['Workflow Kit projects', 'before your first answer', 'ONE PART PER TOOL CALL', 'after key', 'No batching, no parallel calls, no loops'])
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
