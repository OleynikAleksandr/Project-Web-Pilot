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

test('Codex App Server MCP exposes exactly the 13-tool macOS catalog', async () => {
  const { readFile } = await import('node:fs/promises');
  const source = await readFile(path.join(repoRoot, 'tools', 'codex-app-server-mcp', 'server.py'), 'utf8');

  const expected = [
    'exec_command', 'write_stdin', 'apply_patch', 'view_image',
    'workflow_context_recover', 'bridge_status', 'turn_watchdog',
    'computer_list_windows', 'computer_capture_screen', 'computer_capture_window',
    'delete_path', 'list_trash', 'restore_trash',
  ];
  for (const name of expected) {
    assert.match(source, new RegExp(`def ${name}\\(`), `missing local tool ${name}`);
  }
  assert.equal(source.match(/@mcp\.tool/g).length, 13, 'catalog is exactly 13 tools');

  const removedTools = [
    'list_drives', 'file_info', 'list_directory', 'read_file', 'read_binary',
    'search_files', 'search_text', 'make_directory', 'write_file', 'write_binary',
    'patch_binary', 'replace_text', 'copy_path', 'move_path',
    'run_command', 'run_command_batch', 'start_process', 'process_status',
    'read_process_output', 'list_processes', 'stop_process',
    'list_repository_tree', 'read_repository_file', 'search_repository',
    'git_status', 'git_diff', 'git_log', 'git_show',
  ];
  for (const name of removedTools) {
    assert.doesNotMatch(source, new RegExp(`\\b${name}\\b`), `removed tool name ${name} must be absent from server.py`);
  }
  for (const helper of ['run_shell', 'run_batch', 'start_shell_process']) {
    assert.doesNotMatch(source, new RegExp(`def ${helper}\\(`), `dead helper ${helper} must be gone`);
  }

  // 0.6.90: the web model observes the screen but never drives the interface.
  const removedUi = [
    'computer_status', 'computer_activate_window', 'computer_move_mouse', 'computer_click',
    'computer_scroll', 'computer_type_text', 'computer_key_press', 'computer_hotkey',
    'computer_actions', 'computer_release_inputs',
  ];
  for (const name of removedUi) assert.doesNotMatch(source, new RegExp(name), `UI control tool ${name} must be gone`);
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

const executorVenvPython = path.join(homedir(), 'Library', 'Application Support', 'WebPilotCodexExecutor', 'runtime', 'venv', 'bin', 'python');

test('bridge_status reports pinned and installed Codex tool compatibility', { timeout: 30_000 }, async t => {
  if (!existsSync(executorVenvPython)) { t.skip('Codex App Server runtime venv is not installed'); return; }
  const root = await mkdtemp(path.join(tmpdir(), 'web-pilot-codex-status-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const probe = path.join(root, 'probe.py');
  await writeFile(probe, `import json, pathlib, sys, types
sys.path.insert(0, sys.argv[1])
import server
class Client:
    cwd = sys.argv[2]
    binary = types.SimpleNamespace(version="codex-cli 0.160.0")
    def status(self):
        return {"version": self.binary.version}
    def command_exec(self, argv, **kwargs):
        if argv == ["/usr/bin/which", "apply_patch"]:
            return {"exitCode": 0, "stdout": "/codex/bin/apply_patch\\n", "stderr": ""}
        return {"exitCode": 1, "stdout": "", "stderr": "unexpected"}
facade = server.LocalFacade(Client(), pathlib.Path(sys.argv[2]) / "state")
print(json.dumps(facade.status()["codex_tools"]))
`);
  const run = await new Promise((resolve, reject) => {
    const child = spawn(executorVenvPython, ['-B', probe, clientDir, root], {
      cwd: root, env: { ...process.env, PYTHONDONTWRITEBYTECODE: '1' }, stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '', stderr = '';
    child.stdout.on('data', chunk => { stdout += chunk; });
    child.stderr.on('data', chunk => { stderr += chunk; });
    child.on('error', reject);
    child.on('close', code => resolve({ code, stdout, stderr }));
  });
  assert.equal(run.code, 0, run.stderr || run.stdout);
  const status = JSON.parse(run.stdout.trim());
  assert.deepEqual(status, {
    pinned_version: '0.160.0',
    pinned_tag: 'rust-v0.160.0',
    installed_version: '0.160.0',
    version_matches: true,
    apply_patch_available: true,
  });
});

test('Codex-form exec_command and write_stdin run through the real App Server', { timeout: 60_000 }, async t => {
  if (process.platform !== 'darwin' || !existsSync(userCodex) || !existsSync(executorVenvPython)) {
    t.skip('real Codex command-tool probe requires macOS, Codex, and the executor venv');
    return;
  }
  const root = await mkdtemp(path.join(tmpdir(), 'web-pilot-codex-command-tools-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const codexHome = path.join(root, 'codex-home');
  await mkdir(codexHome, { recursive: true });
  await writeFile(path.join(codexHome, 'config.toml'), '[analytics]\nenabled = false\n');
  await writeFile(path.join(root, 'not-a-directory.txt'), 'x');
  await writeFile(path.join(root, 'calc.py'), 'def add(a, b):\n    return a + b\n');

  const probe = path.join(root, 'probe.py');
  await writeFile(probe, [
    'import json, os, pathlib, re, subprocess, sys, time',
    'sys.path.insert(0, sys.argv[1])',
    'import server',
    'from app_server_client import AppServerClient',
    'codex, root, codex_home = sys.argv[2], sys.argv[3], sys.argv[4]',
    'client = AppServerClient(binary=codex, cwd=root, environment={"CODEX_HOME": codex_home}, request_timeout=20)',
    'facade = server.LocalFacade(client, pathlib.Path(root) / "state")',
    'def session_id(text):',
    '    match = re.search(r"Process running with session ID ([0-9a-f]+)", text)',
    '    if not match: raise RuntimeError(text)',
    '    return match.group(1)',
    'out = {}',
    'try:',
    '    out["short"] = facade.exec_command("printf SHORT_OK", root, "/bin/sh", False, False, 500, 10000)',
    '    out["nonzero"] = facade.exec_command("printf ERR >&2; exit 7", root, "/bin/sh", False, False, 500, 10000)',
    '    out["login_shell"] = facade.exec_command("printf SHELL_OK", root, "/bin/bash", True, False, 500, 10000)',
    '    out["truncated"] = facade.exec_command("printf BEGIN-; /usr/bin/yes x | /usr/bin/head -c 400; printf -- -END", root, "/bin/sh", False, False, 500, 20)',
    '    out["default_large"] = facade.exec_command("seq 1 60000", root, "/bin/sh", False, False, 1000)',
    '    out["rg"] = facade.exec_command("rg -n add", root, "/bin/zsh", True, False, 1000, 10000)',
    '    out["rg_sessions"] = len(facade._command_sessions)',
    '    out["cat"] = facade.exec_command("cat", root, "/bin/sh", False, False, 1000, 10000)',
    '    running = facade.exec_command("printf START; sleep 1; printf DONE", root, "/bin/sh", False, False, 250, 10000)',
    '    out["running"] = running',
    '    sid = session_id(running)',
    '    out["poll"] = facade.write_stdin(sid, "", 5000, 10000)',
    '    try:',
    '        facade.write_stdin(sid, "", 5000, 10000)',
    '        out["finished_error"] = None',
    '    except ValueError as error:',
    '        out["finished_error"] = str(error)',
    '    non_tty_waiting = facade.exec_command("sleep 20", root, "/bin/sh", False, False, 250, 10000)',
    '    non_tty_sid = session_id(non_tty_waiting)',
    '    try:',
    '        facade.write_stdin(non_tty_sid, "hello\\n", 5000, 10000)',
    '        out["non_tty_write_error"] = None',
    '    except ValueError as error:',
    '        out["non_tty_write_error"] = str(error)',
    '    time.sleep(2)',
    '    poll_started = time.monotonic()',
    '    out["non_tty_poll"] = facade.write_stdin(non_tty_sid, "", 1000, 10000)',
    '    out["non_tty_poll_elapsed"] = time.monotonic() - poll_started',
    '    out["non_tty_cleanup"] = facade.write_stdin(non_tty_sid, "\\x03", 5000, 10000)',
    '    marker = "web-pilot-nontty-" + str(os.getpid())',
    `    interrupt_waiting = facade.exec_command('python3 -c "import time; time.sleep(20)" ' + marker, root, "/bin/sh", False, False, 250, 10000)`,
    '    interrupt_sid = session_id(interrupt_waiting)',
    '    out["non_tty_interrupt"] = facade.write_stdin(interrupt_sid, "\\x03", 5000, 10000)',
    '    out["non_tty_interrupt_pgrep"] = subprocess.run(["pgrep", "-f", marker], capture_output=True).returncode',
    '    try:',
    '        facade.write_stdin(interrupt_sid, "again", 5000, 10000)',
    '        out["non_tty_interrupt_repeat"] = None',
    '    except ValueError as error:',
    '        out["non_tty_interrupt_repeat"] = str(error)',
    `    waiting = facade.exec_command('IFS= read -r line; printf "got:%s" "$line"', root, "/bin/sh", False, True, 250, 10000)`,
    '    input_sid = session_id(waiting)',
    '    stdin_started = time.monotonic()',
    '    out["stdin"] = facade.write_stdin(input_sid, "hello\\n")',
    '    out["stdin_elapsed"] = time.monotonic() - stdin_started',
    `    wall_waiting = facade.exec_command('printf WALL_READY; sleep 2.2; IFS= read -r line; printf "wall:%s" "$line"', root, "/bin/sh", False, True, 250, 10000)`,
    '    wall_sid = session_id(wall_waiting)',
    '    time.sleep(2.4)',
    '    out["wall_after_pause"] = facade.write_stdin(wall_sid, "hello\\n", 250, 10000)',
    '    finished_tty = facade.exec_command("printf BEFORE; sleep 0.4; printf LATE_TTY; exit 7", root, "/bin/sh", False, True, 250, 10000)',
    '    finished_tty_sid = session_id(finished_tty)',
    '    time.sleep(0.8)',
    '    out["finished_tty_write"] = facade.write_stdin(finished_tty_sid, "ignored\\n", 250, 10000)',
    '    try:',
    '        facade.write_stdin(finished_tty_sid, "again\\n", 250, 10000)',
    '        out["finished_tty_repeat"] = None',
    '    except ValueError as error:',
    '        out["finished_tty_repeat"] = str(error)',
    '    finished_non_tty = facade.exec_command("printf BEFORE; sleep 0.4; printf LATE_CTRL; exit 9", root, "/bin/sh", False, False, 250, 10000)',
    '    finished_non_tty_sid = session_id(finished_non_tty)',
    '    time.sleep(0.8)',
    '    out["finished_non_tty_ctrl_c"] = facade.write_stdin(finished_non_tty_sid, "\\x03", 250, 10000)',
    '    race_tty = facade.exec_command("sleep 0.6; printf TTY_RACE; exit 11", root, "/bin/sh", False, True, 250, 10000)',
    '    race_tty_sid = session_id(race_tty)',
    '    original_write = client.write_command_stdin',
    '    def delayed_write(*args, **kwargs):',
    '        time.sleep(0.5)',
    '        return original_write(*args, **kwargs)',
    '    client.write_command_stdin = delayed_write',
    '    try:',
    '        out["tty_write_race"] = facade.write_stdin(race_tty_sid, "ignored\\n", 250, 10000)',
    '    finally:',
    '        client.write_command_stdin = original_write',
    '    race_terminate = facade.exec_command("sleep 0.6; printf TERM_RACE; exit 12", root, "/bin/sh", False, False, 250, 10000)',
    '    race_terminate_sid = session_id(race_terminate)',
    '    original_request = client.request',
    '    def delayed_request(method, params=None, **kwargs):',
    '        if method == "command/exec/terminate": time.sleep(0.5)',
    '        return original_request(method, params, **kwargs)',
    '    client.request = delayed_request',
    '    try:',
    '        out["terminate_race"] = facade.write_stdin(race_terminate_sid, "\\x03", 250, 10000)',
    '    finally:',
    '        client.request = original_request',
    '    clamp_waiting = facade.exec_command("sleep 0.5; printf CLAMP_WRITE", root, "/bin/sh", False, False, 100, 10000)',
    '    clamp_sid = session_id(clamp_waiting)',
    '    out["write_clamp"] = facade.write_stdin(clamp_sid, "", 1000, 10000)',
    '    out["exec_clamp_low"] = facade.exec_command("printf CLAMP_LOW", root, "/bin/sh", False, False, 100, 10000)',
    '    out["exec_clamp_high"] = facade.exec_command("printf CLAMP_HIGH", root, "/bin/sh", False, False, 999999, 10000)',
    '    out["token_clamp"] = facade.exec_command("printf TOKEN_CLAMP", root, "/bin/sh", False, False, 500, 20000)',
    '    tty_waiting = facade.exec_command("printf READY; sleep 20", root, "/bin/sh", False, True, 250, 10000)',
    '    out["tty_start"] = tty_waiting',
    '    tty_sid = session_id(tty_waiting)',
    '    out["tty_signal"] = facade.write_stdin(tty_sid, "\\x03", 5000, 10000)',
    '    out["tty_done"] = facade.write_stdin(tty_sid, "", 5000, 10000) if "Process running" in out["tty_signal"] else out["tty_signal"]',
    '    errors = {}',
    '    for name, call in {',
    '        "empty_cmd": lambda: facade.exec_command(" ", root),',
    '        "empty_workdir": lambda: facade.exec_command("true", ""),',
    '        "missing_workdir": lambda: facade.exec_command("true", os.path.join(root, "missing")),',
    '        "file_workdir": lambda: facade.exec_command("true", os.path.join(root, "not-a-directory.txt")),',
    '        "string_yield": lambda: facade.exec_command("true", root, yield_time_ms="100"),',
    '        "string_tokens": lambda: facade.exec_command("true", root, max_output_tokens="20000"),',
    '        "string_write_yield": lambda: facade.write_stdin("deadbeef", "", "1000", 10000),',
    '        "unknown_session": lambda: facade.write_stdin("deadbeef", "", 5000, 10000),',
    '    }.items():',
    '        try:',
    '            call()',
    '            errors[name] = None',
    '        except Exception as error:',
    '            errors[name] = str(error)',
    '    out["errors"] = errors',
    'finally:',
    '    client.close()',
    'print(json.dumps(out))',
  ].join('\n'));

  const run = await new Promise((resolve, reject) => {
    const child = spawn(executorVenvPython, ['-B', probe, clientDir, userCodex, root, codexHome], {
      cwd: root,
      env: { ...process.env, PYTHONDONTWRITEBYTECODE: '1' },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '', stderr = '';
    child.stdout.on('data', chunk => { stdout += chunk; });
    child.stderr.on('data', chunk => { stderr += chunk; });
    child.on('error', reject);
    child.on('close', code => resolve({ code, stdout, stderr }));
  });
  assert.equal(run.code, 0, run.stderr || run.stdout);
  const out = JSON.parse(run.stdout.trim().split('\n').at(-1));

  for (const key of ['short', 'nonzero', 'login_shell', 'truncated', 'default_large', 'rg', 'cat', 'running', 'poll', 'non_tty_poll', 'non_tty_cleanup', 'non_tty_interrupt', 'stdin', 'wall_after_pause', 'finished_tty_write', 'finished_non_tty_ctrl_c', 'tty_write_race', 'terminate_race', 'write_clamp', 'exec_clamp_low', 'exec_clamp_high', 'token_clamp', 'tty_start', 'tty_signal', 'tty_done']) {
    assert.match(out[key], /^Chunk ID: [0-9a-f]{8}\nWall time: \d+\.\d{3} seconds\n/m, key);
    assert.match(out[key], /\nOriginal token count: \d+\nOutput:\n/, key);
  }
  assert.match(out.short, /Process exited with code 0/);
  assert.match(out.short, /SHORT_OK$/);
  assert.match(out.nonzero, /Process exited with code 7/);
  assert.match(out.nonzero, /ERR$/);
  assert.match(out.login_shell, /SHELL_OK$/);
  assert.match(out.truncated, /BEGIN-/);
  assert.match(out.truncated, /bytes omitted/);
  assert.match(out.truncated, /-END$/);
  const largeOutput = out.default_large.split('Output:\n')[1];
  assert.ok(Buffer.byteLength(largeOutput, 'utf8') <= 32_000, `default output was ${Buffer.byteLength(largeOutput, 'utf8')} bytes`);
  assert.equal((largeOutput.match(/bytes omitted/g) || []).length, 1);
  assert.match(largeOutput, /^1\n2\n3\n/);
  assert.match(largeOutput, /59999\n60000\n?$/);
  assert.ok(Number(out.default_large.match(/Original token count: (\d+)/)[1]) > 8_000);
  assert.match(out.rg, /Process exited with code 0/);
  assert.match(out.rg, /calc\.py:1:def add\(a, b\):/);
  assert.equal(out.rg_sessions, 0);
  assert.match(out.cat, /Process exited with code 0/);
  assert.match(out.running, /Process running with session ID [0-9a-f]+/);
  assert.match(out.poll, /Process exited with code 0/);
  assert.match(out.poll, /DONE$/);
  assert.match(out.finished_error, /Unknown or finished command session/);
  assert.equal(out.non_tty_write_error, 'stdin is closed for this session; rerun exec_command with tty=true to keep stdin open');
  assert.match(out.non_tty_poll, /Process running with session ID [0-9a-f]+/);
  assert.ok(out.non_tty_poll_elapsed >= 4.5, `empty poll lower clamp was ${out.non_tty_poll_elapsed}s`);
  const nonTtyPollWall = Number(out.non_tty_poll.match(/Wall time: ([0-9.]+) seconds/)[1]);
  assert.ok(Math.abs(nonTtyPollWall - out.non_tty_poll_elapsed) < 0.5, `poll wall time ${nonTtyPollWall}s did not match ${out.non_tty_poll_elapsed}s interaction`);
  assert.match(out.non_tty_cleanup, /Process exited with code /);
  assert.match(out.non_tty_interrupt, /Process exited with code /);
  assert.equal(out.non_tty_interrupt_pgrep, 1);
  assert.match(out.non_tty_interrupt_repeat, /Unknown or finished command session/);
  assert.match(out.stdin, /Process exited with code 0/);
  assert.match(out.stdin, /got:hello/);
  assert.ok(out.stdin_elapsed < 2, `tty write with default yield took ${out.stdin_elapsed}s`);
  const wallAfterPause = Number(out.wall_after_pause.match(/Wall time: ([0-9.]+) seconds/)[1]);
  assert.ok(wallAfterPause < 1, `write_stdin wall time used process age: ${wallAfterPause}s`);
  assert.match(out.wall_after_pause, /wall:hello/);
  assert.match(out.finished_tty_write, /Process exited with code 7/);
  assert.match(out.finished_tty_write, /LATE_TTY/);
  assert.match(out.finished_tty_repeat, /Unknown or finished command session/);
  assert.match(out.finished_non_tty_ctrl_c, /Process exited with code 9/);
  assert.match(out.finished_non_tty_ctrl_c, /LATE_CTRL/);
  assert.match(out.tty_write_race, /Process exited with code 11/);
  assert.match(out.tty_write_race, /TTY_RACE/);
  assert.match(out.terminate_race, /Process exited with code 12/);
  assert.match(out.terminate_race, /TERM_RACE/);
  assert.match(out.write_clamp, /Process exited with code 0/);
  assert.match(out.write_clamp, /CLAMP_WRITE$/);
  assert.match(out.exec_clamp_low, /CLAMP_LOW$/);
  assert.match(out.exec_clamp_high, /CLAMP_HIGH$/);
  assert.match(out.token_clamp, /TOKEN_CLAMP$/);
  assert.match(out.tty_start, /Process running with session ID [0-9a-f]+/);
  assert.match(out.tty_start, /READY/);
  assert.match(out.tty_signal, /\^C/);
  assert.match(out.tty_done, /Process exited with code /);
  assert.match(out.errors.empty_cmd, /cmd must not be empty/);
  assert.match(out.errors.empty_workdir, /workdir is required/);
  assert.match(out.errors.missing_workdir, /Path does not exist/);
  assert.match(out.errors.file_workdir, /workdir is not a directory/);
  assert.match(out.errors.string_yield, /yield_time_ms must be an integer from 250 to 30000/);
  assert.match(out.errors.string_tokens, /max_output_tokens must be an integer from 1 to 8000/);
  assert.equal(out.errors.string_write_yield, 'yield' + '_time_ms must be an integer from 5000 to 60000');
  assert.match(out.errors.unknown_session, /Unknown or finished command session/);
});


test('native Codex apply_patch and Codex-form view_image satisfy the macOS contract', { timeout: 60_000 }, async t => {
  if (process.platform !== 'darwin' || !existsSync(userCodex) || !existsSync(executorVenvPython)) {
    t.skip('patch/image probe requires macOS, Codex, and the executor venv');
    return;
  }
  const root = await mkdtemp(path.join(homedir(), 'Library', 'Caches', 'web-pilot-codex-patch-image-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const codexHome = path.join(root, 'codex-home');
  await mkdir(codexHome, { recursive: true });
  await writeFile(path.join(codexHome, 'config.toml'), '[analytics]\nenabled = false\n');

  const probe = path.join(root, 'probe.py');
  await writeFile(probe, [
    'import json, os, pathlib, struct, subprocess, sys, zlib',
    'sys.path.insert(0, sys.argv[1])',
    'import server',
    'from app_server_client import AppServerClient',
    'codex, root, codex_home = sys.argv[2], pathlib.Path(sys.argv[3]), sys.argv[4]',
    'client = AppServerClient(binary=codex, cwd=str(root), environment={"CODEX_HOME": codex_home}, request_timeout=20)',
    'facade = server.LocalFacade(client, root / "state")',
    'def patch(text): return "*** Begin Patch\\n" + text + "\\n*** End Patch"',
    'def png(width, height):',
    '    def chunk(kind, data):',
    '        return struct.pack(">I", len(data)) + kind + data + struct.pack(">I", zlib.crc32(kind + data) & 0xffffffff)',
    '    raw = b"".join(b"\\x00" + (b"\\xff\\x00\\x00\\xff" * width) for _ in range(height))',
    '    return b"\\x89PNG\\r\\n\\x1a\\n" + chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0)) + chunk(b"IDAT", zlib.compress(raw)) + chunk(b"IEND", b"")',
    'out = {}',
    'try:',
    '    out["add"] = facade.apply_patch(patch("*** Add File: alpha.txt\\n+one"), str(root))',
    '    out["after_add"] = (root / "alpha.txt").read_text()',
    '    out["update"] = facade.apply_patch(patch("*** Update File: alpha.txt\\n@@\\n-one\\n+two"), str(root))',
    '    out["after_update"] = (root / "alpha.txt").read_text()',
    '    out["move"] = facade.apply_patch(patch("*** Update File: alpha.txt\\n*** Move to: beta.txt\\n@@\\n-two\\n+three"), str(root))',
    '    out["after_move"] = [(root / "alpha.txt").exists(), (root / "beta.txt").read_text()]',
    '    out["delete"] = facade.apply_patch(patch("*** Delete File: beta.txt"), str(root))',
    '    out["after_delete"] = (root / "beta.txt").exists()',
    '    errors = {}',
    '    cases = {',
    '        "empty": lambda: facade.apply_patch("", str(root)),',
    '        "missing_header": lambda: facade.apply_patch("*** Add File: x.txt\\n+x", str(root)),',
    '        "too_large": lambda: facade.apply_patch("*** Begin Patch\\n" + ("x" * (server.MAX_PATCH_BYTES + 1)), str(root)),',
    '        "missing_workdir": lambda: facade.apply_patch(patch("*** Add File: x.txt\\n+x"), str(root / "missing")),',
    '        "invalid_native": lambda: facade.apply_patch(patch("*** Update File: absent.txt\\n@@\\n-old\\n+new"), str(root)),',
    '    }',
    '    for name, call in cases.items():',
    '        try:',
    '            call()',
    '            errors[name] = None',
    '        except Exception as error:',
    '            errors[name] = str(error)',
    '    out["errors"] = errors',
    '    missing = client.start_command(["webpilot-command-that-does-not-exist"], cwd=str(root), sandbox_policy={"type":"dangerFullAccess"})',
    '    missing_result = client.read_command_output(missing["process_id"], cursor=0, wait_ms=1000)',
    '    out["unavailable"] = str(facade._native_apply_patch_error(str(missing_result.get("error") or missing_result.get("output") or "")))',
    '    image = root / "wide.png"',
    '    image.write_bytes(png(2000, 10))',
    '    shown = facade.view_image(str(image))',
    '    rendered = root / "rendered.png"',
    '    rendered.write_bytes(shown[1].data)',
    '    dimensions = subprocess.run(["/usr/bin/sips", "-g", "pixelWidth", "-g", "pixelHeight", str(rendered)], capture_output=True, text=True, check=True).stdout',
    '    out["image_meta"] = shown[0]',
    '    out["image_type"] = type(shown[1]).__name__',
    '    out["dimensions"] = dimensions',
    '    text = root / "plain.txt"',
    '    text.write_text("not an image")',
    '    huge = root / "huge.png"',
    '    with huge.open("wb") as stream:',
    '        stream.seek(server.MAX_VIEW_IMAGE_BYTES)',
    '        stream.write(b"x")',
    '    secret_dir = root / ".ssh"',
    '    secret_dir.mkdir()',
    '    secret = secret_dir / "secret.png"',
    '    secret.write_bytes(image.read_bytes())',
    '    image_errors = {}',
    '    for name, value in {"missing": root / "missing.png", "text": text, "huge": huge, "secret": secret}.items():',
    '        try:',
    '            facade.view_image(str(value))',
    '            image_errors[name] = None',
    '        except Exception as error:',
    '            image_errors[name] = str(error)',
    '    out["image_errors"] = image_errors',
    '    out["leftovers"] = [item.name for item in (root / "state").glob("view-image-*")]',
    '    mcp = server.create_server(host="127.0.0.1", port=0, state_root=root / "schema-state", codex_binary=codex)',
    '    out["apply_params"] = mcp._tool_manager.get_tool("apply_patch").parameters',
    '    out["view_params"] = mcp._tool_manager.get_tool("view_image").parameters',
    'finally:',
    '    client.close()',
    'print(json.dumps(out))',
  ].join('\n'));

  const run = await new Promise((resolve, reject) => {
    const child = spawn(executorVenvPython, ['-B', probe, clientDir, userCodex, root, codexHome], {
      cwd: root,
      env: { ...process.env, PYTHONDONTWRITEBYTECODE: '1' },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '', stderr = '';
    child.stdout.on('data', chunk => { stdout += chunk; });
    child.stderr.on('data', chunk => { stderr += chunk; });
    child.on('error', reject);
    child.on('close', code => resolve({ code, stdout, stderr }));
  });
  assert.equal(run.code, 0, run.stderr || run.stdout);
  const out = JSON.parse(run.stdout.trim().split('\n').at(-1));

  for (const name of ['add', 'update', 'move', 'delete']) assert.match(out[name], /^Success\./);
  assert.equal(out.after_add, 'one\n');
  assert.equal(out.after_update, 'two\n');
  assert.deepEqual(out.after_move, [false, 'three\n']);
  assert.equal(out.after_delete, false);
  assert.match(out.errors.empty, /patch is empty/);
  assert.match(out.errors.missing_header, /must start with \*\*\* Begin Patch/);
  assert.match(out.errors.too_large, /larger than 1000000 bytes/);
  assert.match(out.errors.missing_workdir, /Path does not exist/);
  assert.ok(out.errors.invalid_native && out.errors.invalid_native.length > 0);
  assert.match(out.unavailable, /Codex apply_patch command is unavailable/);

  assert.equal(out.image_type, 'Image');
  assert.equal(out.image_meta.source, path.join(root, 'wide.png'));
  assert.ok(out.image_meta.bytes > 0);
  assert.match(out.dimensions, /pixelWidth:\s+1600/);
  assert.match(out.dimensions, /pixelHeight:\s+8/);
  assert.match(out.image_errors.missing, /Path does not exist/);
  assert.match(out.image_errors.text, /not an image/);
  assert.match(out.image_errors.huge, /larger than 20000000 bytes/);
  assert.match(out.image_errors.secret, /Sensitive credential\/private path/);
  assert.deepEqual(out.leftovers, []);

  assert.deepEqual(Object.keys(out.apply_params.properties).sort(), ['patch', 'workdir']);
  assert.deepEqual(out.apply_params.required.sort(), ['patch', 'workdir']);
  assert.deepEqual(Object.keys(out.view_params.properties), ['path']);
  assert.deepEqual(out.view_params.required, ['path']);
});

// Every control.py test runs on a temporary state and never reads the real state of the retired local runtime.
function controlEnvironment(root, extra = {}) {
  return {
    WEB_PILOT_CODEX_EXECUTOR_STATE_DIR: path.join(root, 'state'),
    WEB_PILOT_CODEX_EXECUTOR_PORT: '27852',
    WEB_PILOT_CODEX_EXECUTOR_TUNNEL_PORT: '27853',
    WEB_PILOT_LEGACY_LOCAL_STATE_DIR: path.join(root, 'no-legacy-state'),
    ...extra,
  };
}

function configureTunnel(control, env, key = '0123456789abcdefghijklmnop') {
  return new Promise((resolve, reject) => {
    const child = spawn('python3', [control, 'configure-tunnel', '--tunnel-id', 'tunnel_abcdefghijklmnop', '--key-stdin'],
      { cwd: repoRoot, env: { ...process.env, ...env }, stdio: ['pipe', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', chunk => { stdout += chunk; });
    child.stderr.on('data', chunk => { stderr += chunk; });
    child.on('error', reject);
    child.on('close', code => resolve({ code, stdout, stderr }));
    child.stdin.end(key + '\n');
  });
}

test('executor lifecycle keeps its own state, ports and tunnel credentials and needs no other runtime', { timeout: 20_000 }, async () => {
  const { readFile, stat } = await import('node:fs/promises');
  const root = await mkdtemp(path.join(tmpdir(), 'web-pilot-codex-control-'));
  const state = path.join(root, 'state');
  const control = path.join(repoRoot, 'tools', 'codex-app-server-mcp', 'control.py');
  const env = controlEnvironment(root);
  const selectorFile = path.join(state, 'private', 'selector.json');
  const profilePath = path.join(state, 'private', 'tunnel-profile', 'codex-executor.yaml');
  const keyPath = path.join(state, 'private', 'tunnel-key');

  try {
    const status = await runPython(control, ['status'], env);
    assert.equal(status.code, 0, status.stderr || status.stdout);
    const statusJson = JSON.parse(status.stdout);
    assert.equal(statusJson.ok, true);
    assert.equal(statusJson.mcp_url, 'http://127.0.0.1:27852/mcp');
    assert.equal(statusJson.tunnel.ready, false);
    assert.equal(statusJson.selector, null);

    // First run: there is no tunnel yet. The selector is written anyway and nothing is invented.
    const first = await runPython(control, ['configure-selector'], env);
    assert.equal(first.code, 0, first.stderr || first.stdout);
    assert.deepEqual(JSON.parse(first.stdout), { ok: true, configured: true, mode: 'app-server',
      mcp_url: 'http://127.0.0.1:27852/mcp', chatgpt_channel: 'secure-tunnel', adopted_tunnel: false });
    assert.deepEqual(JSON.parse(await readFile(selectorFile, 'utf8')),
      { schema_version: 1, mode: 'app-server', mcp_url: 'http://127.0.0.1:27852/mcp', chatgpt_channel: 'secure-tunnel' });
    assert.equal(existsSync(profilePath), false);
    assert.equal(existsSync(keyPath), false);

    const configured = await configureTunnel(control, env);
    assert.equal(configured.code, 0, configured.stderr || configured.stdout);
    assert.equal(JSON.parse(configured.stdout).configured, true);
    const profile = await readFile(profilePath, 'utf8');
    assert.match(profile, /127\.0\.0\.1:27852\/mcp/);
    assert.match(profile, /127\.0\.0\.1:27853/);
    assert.match(profile, /WEB_PILOT_CODEX_EXECUTOR_TUNNEL_API_KEY/);
    assert.doesNotMatch(profile, /0123456789abcdefghijklmnop/);
    assert.equal((await readFile(keyPath, 'utf8')).trim(), '0123456789abcdefghijklmnop');
    assert.equal((await stat(keyPath)).mode & 0o777, 0o600);
    assert.equal(profile.includes('17842'), false);
    assert.equal(profile.includes('17843'), false);

    // A selector left by 0.6.90 in the retired local mode is read as the only backend and rewritten without its block.
    await writeFile(selectorFile, JSON.stringify({ schema_version: 1, mode: 'local', mcp_url: 'http://127.0.0.1:27842/mcp', chatgpt_channel: 'vps',
      local: { python: '/gone/python3', control: '/gone/control.py', runtime_root: '/gone', state_directory: '/gone/state' } }));
    assert.deepEqual(JSON.parse((await runPython(control, ['status'], env)).stdout).selector,
      { mode: 'app-server', mcp_url: 'http://127.0.0.1:27842/mcp', chatgpt_channel: 'vps' });
    const selected = await runPython(control, ['configure-selector'], env);
    assert.equal(selected.code, 0, selected.stderr || selected.stdout);
    assert.deepEqual(JSON.parse(await readFile(selectorFile, 'utf8')),
      { schema_version: 1, mode: 'app-server', mcp_url: 'http://127.0.0.1:27852/mcp', chatgpt_channel: 'vps' });
    assert.match(await readFile(profilePath, 'utf8'), /127\.0\.0\.1:27852\/mcp/);

    // The old arguments are gone together with the second backend.
    const legacyCall = await runPython(control, ['configure-selector', '--mode', 'local', '--mcp-url', 'http://127.0.0.1:27842/mcp'], env);
    assert.notEqual(legacyCall.code, 0);
    const source = await readFile(control, 'utf8');
    for (const gone of ['run_local_control', '--local-python', 'Codex Local Mac', 'mac-codex-local']) assert.equal(source.includes(gone), false, gone);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('the tunnel of the retired local runtime is carried over once without exposing its key', async () => {
  const { readFile } = await import('node:fs/promises');
  const root = await mkdtemp(path.join(tmpdir(), 'web-pilot-stable-tunnel-adopt-'));
  const state = path.join(root, 'state');
  const legacyState = path.join(root, 'legacy-state');
  const legacyProfileDir = path.join(legacyState, 'private', 'tunnel-profile');
  const control = path.join(repoRoot, 'tools', 'codex-app-server-mcp', 'control.py');
  const secret = 'stable-local-key-abcdefghijklmnop';
  const env = controlEnvironment(root, { WEB_PILOT_LEGACY_LOCAL_STATE_DIR: legacyState });
  const keyPath = path.join(state, 'private', 'tunnel-key');
  await mkdir(legacyProfileDir, { recursive: true });
  await writeFile(path.join(legacyState, 'private', 'tunnel-key'), secret + '\n');
  try {
    // A damaged legacy profile is not carried over and does not stop the first run.
    await writeFile(path.join(legacyProfileDir, 'mac-local.yaml'), '{ broken');
    const damaged = await runPython(control, ['configure-selector'], env);
    assert.equal(damaged.code, 0, damaged.stderr || damaged.stdout);
    assert.equal(JSON.parse(damaged.stdout).adopted_tunnel, false);
    assert.equal(existsSync(keyPath), false);

    await writeFile(path.join(legacyProfileDir, 'mac-local.yaml'), JSON.stringify({
      config_version: 1,
      control_plane: { base_url: 'https://api.openai.com', tunnel_id: 'tunnel_abcdefghijklmnop', api_key: 'env:LOCAL_KEY' },
      health: { listen_addr: '127.0.0.1:17843' },
      mcp: { server_urls: [{ channel: 'main', url: 'http://127.0.0.1:17842/mcp' }] },
    }, null, 2));
    const result = await runPython(control, ['configure-selector'], env);
    assert.equal(result.code, 0, result.stderr || result.stdout);
    const data = JSON.parse(result.stdout);
    assert.equal(data.adopted_tunnel, true);
    assert.equal(data.mcp_url, 'http://127.0.0.1:27852/mcp');
    assert.equal((result.stdout + result.stderr).includes(secret), false);
    assert.equal((await readFile(keyPath, 'utf8')).trim(), secret);
    const profile = await readFile(path.join(state, 'private', 'tunnel-profile', 'codex-executor.yaml'), 'utf8');
    assert.match(profile, /tunnel_abcdefghijklmnop/);
    // The carried tunnel serves the executor's own MCP, not the port of the retired runtime.
    assert.match(profile, /127\.0\.0\.1:27852\/mcp/);
    assert.doesNotMatch(profile, /17842/);
    assert.doesNotMatch(profile, new RegExp(secret));
    // The legacy state is only read.
    assert.equal((await readFile(path.join(legacyState, 'private', 'tunnel-key'), 'utf8')).trim(), secret);

    const again = await runPython(control, ['configure-selector'], env);
    assert.equal(JSON.parse(again.stdout).adopted_tunnel, false);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('a missing Codex is reported by its own code before anything is installed or started', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'web-pilot-codex-missing-'));
  const probe = path.join(root, 'probe.py');
  const control = path.join(clientDir, 'control.py');
  await writeFile(probe, `import contextlib, importlib.util, io, json, os, sys
control_file, client_dir, scratch = sys.argv[1:4]
sys.path.insert(0, client_dir)
spec = importlib.util.spec_from_file_location("ctl", control_file)
ctl = importlib.util.module_from_spec(spec); spec.loader.exec_module(ctl)
import app_server_client
def missing(explicit=None):
    raise app_server_client.AppServerError("No compatible Codex binary was found")
app_server_client.discover_codex_binary = missing
out = {"path_before": os.environ.get("PATH")}
def run(command):
    sys.argv = ["control.py", *command]
    buffer = io.StringIO()
    with contextlib.redirect_stdout(buffer):
        code = ctl.main()
    return {"exit": code, **json.loads(buffer.getvalue())}
out["setup"] = run(["setup"])
out["start"] = run(["start", "--mcp-only"])
out["path_after"] = os.environ.get("PATH")
out["runtime_created"] = ctl.RUNTIME.exists()
os.environ["WEB_PILOT_UV"] = sys.executable
out["bundled_uv"] = ctl.find_uv() == sys.executable
os.environ["WEB_PILOT_UV"] = os.path.join(scratch, "no-such-uv")
out["missing_bundled_uv_ignored"] = ctl.find_uv() != os.environ["WEB_PILOT_UV"]
print(json.dumps(out))
`);
  try {
    // "start" reaches the Codex check only with an installed venv: borrow the real one read-only when it exists.
    const env = controlEnvironment(root);
    if (existsSync(executorVenvPython)) {
      await mkdir(path.join(root, 'state', 'runtime'), { recursive: true });
      await (await import('node:fs/promises')).symlink(path.dirname(path.dirname(executorVenvPython)), path.join(root, 'state', 'runtime', 'venv'));
    }
    const result = await runPython(probe, [control, clientDir, root], env);
    assert.equal(result.code, 0, result.stderr);
    const out = JSON.parse(result.stdout.trim().split('\n').at(-1));
    assert.deepEqual(out.setup, { exit: 1, ok: false, code: 'CODEX_NOT_FOUND',
      error: 'Codex is not installed: install the Codex CLI or the ChatGPT app and check again' });
    if (existsSync(executorVenvPython)) assert.equal(out.start.code, 'CODEX_NOT_FOUND');
    else assert.match(out.start.error, /setup first/);
    assert.equal(out.runtime_created, existsSync(executorVenvPython), 'setup stops before it creates the runtime folder');
    assert.equal(out.path_after, out.path_before, 'the search path of the caller is restored');
    assert.equal(out.bundled_uv, true);
    assert.equal(out.missing_bundled_uv_ignored, true);
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

test('ChatGPT channel is kept by the selector; login starts only the App Server MCP and obeys the channel', { timeout: 90_000 }, async t => {
  const { readFile, symlink } = await import('node:fs/promises');
  const root = await mkdtemp(path.join(tmpdir(), 'web-pilot-chatgpt-channel-'));
  const state = path.join(root, 'state');
  const control = path.join(clientDir, 'control.py');
  const env = controlEnvironment(root);
  const services = [];
  const json = result => JSON.parse(result.stdout);
  const selectorFile = path.join(state, 'private', 'selector.json');
  const readSelector = async () => JSON.parse(await readFile(selectorFile, 'utf8'));
  // Login starts the real MCP server: it needs the installed venv. The tunnel-client is deliberately absent here.
  const canStart = process.platform === 'darwin' && existsSync(executorVenvPython) && existsSync(userCodex);
  try {
    if (canStart) {
      await mkdir(path.join(state, 'runtime'), { recursive: true });
      await symlink(path.dirname(path.dirname(executorVenvPython)), path.join(state, 'runtime', 'venv'));
    }
    assert.equal((await runPython(control, ['configure-selector'], env)).code, 0);

    if (canStart) {
      // First run at login: no tunnel is configured yet. The MCP comes up and nothing fails.
      const firstLogin = await runPython(control, ['selector-start'], env);
      assert.equal(firstLogin.code, 0, firstLogin.stdout + firstLogin.stderr);
      assert.equal(json(firstLogin).mcp.ready, true);
      assert.equal(json(firstLogin).tunnel.configured, false);
      assert.equal(json(firstLogin).tunnel.running, false);
      assert.deepEqual(json(firstLogin).selected_backend.mode, 'app-server');
      assert.equal(json(await runPython(control, ['stop'], env)).ok, true);
    }

    const configured = await configureTunnel(control, env);
    assert.equal(configured.code, 0, configured.stdout);
    const selected = await runPython(control, ['configure-selector'], env);
    assert.equal(selected.code, 0, selected.stdout);
    assert.equal(json(selected).chatgpt_channel, 'secure-tunnel');
    assert.equal(json(await runPython(control, ['status'], env)).selector.chatgpt_channel, 'secure-tunnel');

    const invalid = await runPython(control, ['configure-channel', '--channel', 'public'], env);
    assert.notEqual(invalid.code, 0);
    assert.equal((await readSelector()).chatgpt_channel, 'secure-tunnel');

    const vps = await runPython(control, ['configure-channel', '--channel', 'vps'], env);
    assert.equal(vps.code, 0, vps.stdout);
    assert.deepEqual(json(vps), { ok: true, configured: true, chatgpt_channel: 'vps' });
    assert.deepEqual(await readSelector(), { schema_version: 1, mode: 'app-server', mcp_url: 'http://127.0.0.1:27852/mcp', chatgpt_channel: 'vps' });

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
    assert.equal(json(await runPython(control, ['stop'], env)).ok, true);
    assert.equal(await mcp.exited, true);

    // A reconfigured selector keeps the ChatGPT channel.
    const again = await runPython(control, ['configure-selector'], env);
    assert.equal(json(again).chatgpt_channel, 'vps');
    assert.equal((await readSelector()).chatgpt_channel, 'vps');

    if (!canStart) { t.diagnostic('login checks skipped: the executor venv or Codex is not installed'); return; }

    // Login in vps mode stops a running tunnel-client and never starts it.
    const loginTunnel = await fakeService(state, 'tunnel'); services.push(loginTunnel.child);
    const vpsLogin = await runPython(control, ['selector-start'], env);
    assert.equal(vpsLogin.code, 0, vpsLogin.stdout + vpsLogin.stderr);
    const login = json(vpsLogin);
    assert.equal(login.mcp.ready, true);
    assert.equal(login.tunnel.running, false);
    assert.deepEqual(login.selected_backend.mcp_url, 'http://127.0.0.1:27852/mcp');
    assert.equal(login.selector.chatgpt_channel, 'vps');
    assert.equal(await loginTunnel.exited, true);
    assert.equal(existsSync(path.join(state, 'tunnel.pid.json')), false);

    // Secure Tunnel at login still starts tunnel-client (missing here, so the attempt is visible).
    assert.equal((await runPython(control, ['configure-channel', '--channel', 'secure-tunnel'], env)).code, 0);
    const secureLogin = await runPython(control, ['selector-start'], env);
    assert.equal(secureLogin.code, 1);
    assert.match(json(secureLogin).error, /tunnel-client is missing/);
  } finally {
    await runPython(control, ['stop'], env).catch(() => {});
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
  const tools = message.result.tools;
  assert.deepEqual(tools.map(tool => tool.name).sort(), [
    'apply_patch', 'bridge_status', 'computer_capture_screen', 'computer_capture_window',
    'computer_list_windows', 'delete_path', 'exec_command', 'list_trash', 'restore_trash',
    'turn_watchdog', 'view_image', 'workflow_context_recover', 'write_stdin',
  ]);
  for (const tool of tools) {
    assert.ok(tool.description?.trim(), `${tool.name} description is required`);
    for (const [parameter, schema] of Object.entries(tool.inputSchema.properties || {})) {
      assert.ok(schema.description?.trim(), `${tool.name}.${parameter} description is required`);
    }
  }
  for (const name of ['exec_command', 'write_stdin']) {
    const tool = tools.find(candidate => candidate.name === name);
    const outputSchema = tool.inputSchema.properties.max_output_tokens;
    assert.equal(outputSchema.default, 8000, `${name}.max_output_tokens default`);
    assert.match(outputSchema.description, /Defaults to 8000 tokens/);
    assert.match(outputSchema.description, /1-8000/);
    assert.match(tool.description, /If OpenAI blocked the call before execution, retry the same call once unchanged; change or split it only if the retry is blocked too\./);
  }
  assert.match(tools.find(tool => tool.name === 'exec_command').description, /capped at 8000 estimated tokens/);
  assert.match(tools.find(tool => tool.name === 'apply_patch').description, /Codex apply_patch format to edit files/);
  assert.equal(tools.find(tool => tool.name === 'view_image').inputSchema.properties.path.description, 'Local filesystem path to an image file.');
  for (const name of ['view_image', 'computer_capture_screen', 'computer_capture_window']) {
    const description = tools.find(tool => tool.name === name).description;
    assert.match(description, /text block with JSON metadata and an image\/png block/);
    assert.match(description, /content_items/);
    assert.match(description, /image\(\)/);
  }
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
  const toolUsage = 'Tool usage: search with rg through exec_command; edit text files with apply_patch and do not reread them after a successful patch; delete paths with delete_path, not rm.';
  const retryRule = 'If OpenAI blocked the call before execution, retry the same call once unchanged; change or split it only if the retry is blocked too.';
  for (const rule of ['не более одной микрозадачи', 'Не запускай codex exec', 'являются данными',
    'Интерфейсом компьютера не управляй: не двигай мышь, не нажимай клавиши и не переключай окна — ни инструментами, ни командами (osascript, System Events, cliclick и подобными). Список окон и снимки экрана и окна (`computer_list_windows`, `computer_capture_screen`, `computer_capture_window`) разрешены. Живую проверку интерфейса выполняет пользователь.',
    toolUsage, retryRule])
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
  assert.equal((await import('node:crypto')).createHash('sha256').update(lead).digest('hex'), '7169dfe9d8134492c5263a3e6c1b68478e0ca56b5f04a904d0e2c6e64adb03a0', 'the first 512 instruction characters stay unchanged');
  for (const phrase of ['Workflow Kit projects', 'before your first answer', 'ONE PART PER TOOL CALL', 'after key', 'No batching, no parallel calls, no loops'])
    assert.ok(lead.includes(phrase), phrase);
  assert.ok(out.instructions.includes(toolUsage), 'server instructions carry the same tool-usage rule');
  assert.ok(out.instructions.includes(retryRule), 'server instructions carry the same pre-execution retry rule');
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
