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
  await writeFile(probe, `import json, os, sys, tempfile
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
