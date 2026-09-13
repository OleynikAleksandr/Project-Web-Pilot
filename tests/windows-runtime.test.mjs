import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { WindowsRuntimeBootstrap, WINDOWS_RUNTIME_SHA256, WINDOWS_CONTEXT_PACKET_SOURCE, patchWindowsBridgeSource, sha256File, windowsRuntimePaths, windowsRuntimeStateDirectory, windowsCommandFailureText, windowsExpandInvocation, windowsSetupInvocation } from '../src/windows-runtime.mjs';
import { bundledWindowsRuntimeFolder } from '../src/platform.mjs';
import { extractionCommand, NODE_ARCHIVE, NODE_SHA256, windowsRuntimeSourceCandidates, windowsToolchainPaths } from '../scripts/prepare-windows-toolchain.mjs';

test('Windows runtime paths stay in writable userData and use Windows venv layout', () => {
  const p = windowsRuntimePaths('C:\\Users\\Alex\\AppData\\Roaming\\Project Web Pilot', 'C:\\Program Files\\Project Web Pilot\\resources\\windows-runtime\\runtime.zip');
  assert.equal(p.folder, 'C:\\Users\\Alex\\AppData\\Roaming\\Project Web Pilot\\runtime\\Windows-Codex-Local');
  assert.equal(p.python, p.folder + '\\.venv\\Scripts\\python.exe');
  assert.equal(p.control, p.folder + '\\control.py');
  assert.equal(bundledWindowsRuntimeFolder('C:\\Data\\Pilot', 'win32'), 'C:\\Data\\Pilot\\runtime\\Windows-Codex-Local');
  assert.equal(bundledWindowsRuntimeFolder('/tmp/pilot', 'darwin'), null);
});

test('Windows runtime state path and command errors preserve useful setup diagnostics', () => {
  assert.equal(windowsRuntimeStateDirectory({ LOCALAPPDATA: 'C:\\Users\\Alex\\AppData\\Local' }), 'C:\\Users\\Alex\\AppData\\Local\\CodexLocalWindows');
  assert.equal(windowsCommandFailureText({ stdout: 'Extracting...\nERROR: Port 17842 is in use.\n', stderr: '' }), 'Extracting...\nERROR: Port 17842 is in use.');
});

test('Windows bootstrap adopts an existing compatible Codex Local instead of installing bundled payload', { skip: process.platform !== 'win32' }, async t => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'web-pilot-existing-runtime-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const external = path.join(root, 'Codex Local Windows');
  const stateDir = path.join(root, 'state');
  await fs.mkdir(path.join(external, '.venv', 'Scripts'), { recursive: true });
  await fs.mkdir(path.join(external, '.runtime'), { recursive: true });
  await fs.mkdir(path.join(external, 'mcp'), { recursive: true });
  await fs.mkdir(path.join(external, 'server'), { recursive: true });
  await fs.mkdir(stateDir, { recursive: true });
  await fs.writeFile(path.join(external, 'control.py'), '# fixture\n');
  await fs.writeFile(path.join(external, '.venv', 'Scripts', 'python.exe'), 'fixture');
  await fs.writeFile(path.join(external, '.runtime', 'locations.json'), '{}\n');
  const bridge = `from windows_computer import WindowsComputer  # noqa: E402\n\ndef create_server():\n    mcp = FastMCP(\"Codex Local Windows\")\n    turn_watchdog = TurnWatchdog()\n    @mcp.tool()\n    def bridge_status(repository: str = \"\"):\n        status = {}\n        return status\n\n    @mcp.tool(\n        title=\"Computer status\",\n    )\n    def computer_status():\n        return {}\n`;
  await fs.writeFile(path.join(external, 'mcp', 'bridge_mcp.py'), bridge);
  await fs.writeFile(path.join(stateDir, 'mcp.pid.json'), JSON.stringify({ package_root: external }));
  const calls = [];
  const service = { package_root: external, mcp: { owned: false, running: false, ready: false },
    tunnel: { owned: false, running: false, ready: false, configured: true }, mcp_url: 'http://127.0.0.1:17842/mcp' };
  const execute = async (file, args) => {
    calls.push({ file, args: [...args] });
    if (args.at(-1) === 'status') return { stdout: JSON.stringify(service), stderr: '' };
    throw new Error('bundled setup must not run');
  };
  const bootstrap = new WindowsRuntimeBootstrap({ payloadFile: path.join(root, 'missing-payload.zip'), dataDir: path.join(root, 'pilot'),
    execute, environment: {}, platform: 'win32', stateDir });
  const inspected = await bootstrap.inspect();
  assert.equal(inspected.source, 'external');
  assert.equal(inspected.folder, external);
  const result = await bootstrap.ensure(root);
  assert.equal(result.adopted, true);
  assert.equal(result.reused, true);
  assert.ok(calls.every(call => call.args.at(-1) === 'status'), JSON.stringify(calls));
  assert.match(await fs.readFile(path.join(external, 'mcp', 'bridge_mcp.py'), 'utf8'), /workflow_context_recover/);
  assert.equal(await fs.readFile(path.join(external, 'server', 'context_packet.py'), 'utf8'), WINDOWS_CONTEXT_PACKET_SOURCE);
});


test('Windows bootstrap restarts the same running external runtime when first applying the overlay', { skip: process.platform !== 'win32' }, async t => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'web-pilot-running-runtime-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const external = path.join(root, 'Codex Local Windows');
  const stateDir = path.join(root, 'state');
  for (const dir of [path.join(external, '.venv', 'Scripts'), path.join(external, '.runtime'), path.join(external, 'mcp'), path.join(external, 'server'), stateDir]) {
    await fs.mkdir(dir, { recursive: true });
  }
  await fs.writeFile(path.join(external, 'control.py'), '# fixture\n');
  await fs.writeFile(path.join(external, '.venv', 'Scripts', 'python.exe'), 'fixture');
  await fs.writeFile(path.join(external, '.runtime', 'locations.json'), '{}\n');
  const bridge = `from windows_computer import WindowsComputer  # noqa: E402\n\ndef create_server():\n    mcp = FastMCP(\"Codex Local Windows\")\n    turn_watchdog = TurnWatchdog()\n    @mcp.tool()\n    def bridge_status(repository: str = \"\"):\n        status = {}\n        return status\n\n    @mcp.tool(\n        title=\"Computer status\",\n    )\n    def computer_status():\n        return {}\n`;
  await fs.writeFile(path.join(external, 'mcp', 'bridge_mcp.py'), bridge);
  await fs.writeFile(path.join(stateDir, 'mcp.pid.json'), JSON.stringify({ package_root: external }));
  await fs.writeFile(path.join(stateDir, 'tunnel.pid.json'), JSON.stringify({ package_root: external }));
  const calls = [];
  const service = { package_root: external, mcp: { owned: true, running: true, ready: true },
    tunnel: { owned: true, running: true, ready: true, configured: true }, mcp_url: 'http://127.0.0.1:17842/mcp' };
  const execute = async (_file, args) => {
    const command = args[2]; calls.push(command);
    if (command === 'status') return { stdout: JSON.stringify(service), stderr: '' };
    if (command === 'stop' || command === 'start') return { stdout: '{}', stderr: '' };
    throw new Error('unexpected command ' + command);
  };
  const bootstrap = new WindowsRuntimeBootstrap({ payloadFile: path.join(root, 'missing-payload.zip'), dataDir: path.join(root, 'pilot'),
    execute, environment: {}, platform: 'win32', stateDir });
  const result = await bootstrap.ensure(root);
  assert.equal(result.adopted, true);
  assert.ok(calls.includes('stop'), JSON.stringify(calls));
  assert.ok(calls.includes('start'), JSON.stringify(calls));
  assert.ok(!calls.includes(undefined), JSON.stringify(calls));
});

test('Windows bootstrap command plans pass paths through env/argv instead of shell interpolation', () => {
  const expand = windowsExpandInvocation('C:\\Payload Dir\\runtime.zip', 'C:\\User Data\\staging');
  assert.equal(expand.executable, 'powershell.exe');
  assert.equal(expand.environment.WEB_PILOT_RUNTIME_ARCHIVE, 'C:\\Payload Dir\\runtime.zip');
  assert.equal(expand.environment.WEB_PILOT_RUNTIME_DESTINATION, 'C:\\User Data\\staging');
  assert.ok(!expand.args.join(' ').includes('Payload Dir'));
  const setup = windowsSetupInvocation('C:\\Runtime\\scripts\\setup.ps1', 'D:\\Projects\\Тест');
  assert.deepEqual(setup.args.slice(-4), ['-File', 'C:\\Runtime\\scripts\\setup.ps1', '-Workspace', 'D:\\Projects\\Тест']);
});

test('SHA-256 verification uses the canonical digest contract', async t => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'web-pilot-win-runtime-'));
  t.after(() => fs.rm(dir, { recursive: true, force: true }));
  const file = path.join(dir, 'payload.zip');
  await fs.writeFile(file, 'fixture');
  assert.equal(await sha256File(file), 'f16d05ec6b29248d2c61adb1e9263f78e4f7bace1b955014a2d17872cfe4064d');
  assert.match(WINDOWS_RUNTIME_SHA256, /^[0-9a-f]{64}$/);
});


test('Windows MCP compatibility overlay adds Workflow Kit recovery exactly once', () => {
  const fixture = `from windows_computer import WindowsComputer  # noqa: E402\n\ndef create_server():\n    mcp = FastMCP(\"Codex Local Windows\")\n    turn_watchdog = TurnWatchdog()\n    @mcp.tool()\n    def bridge_status(repository: str = \"\"):\n        status = {}\n        return status\n\n    @mcp.tool(\n        title=\"Computer status\",\n    )\n    def computer_status():\n        return {}\n`;
  const patched = patchWindowsBridgeSource(fixture);
  assert.match(patched, /from context_packet import ContextPacket/);
  assert.match(patched, /context_packet = ContextPacket\(\)/);
  assert.match(patched, /def workflow_context_recover\(workspace: str\)/);
  assert.equal(patchWindowsBridgeSource(patched), patched, 'overlay is idempotent');
  assert.match(WINDOWS_CONTEXT_PACKET_SOURCE, /\.harness\/runtime\/node\.exe/);
  assert.match(WINDOWS_CONTEXT_PACKET_SOURCE, /inline-context-v1/);
  assert.ok(WINDOWS_CONTEXT_PACKET_SOURCE.includes(String.raw`r'json\s*\n(.*?)\n'`));
  assert.doesNotMatch(WINDOWS_CONTEXT_PACKET_SOURCE, /scripts\/workflow\.cmd/);
});


test('portable Node build payload has pinned Windows x64 layout and safe extraction plans', () => {
  assert.equal(NODE_ARCHIVE, 'node-v22.17.0-win-x64.zip');
  assert.equal(NODE_SHA256, '721ab118a3aac8584348b132767eadf51379e0616f0db802cc1e66d7f0d98f85');
  const p = windowsToolchainPaths('/repo');
  assert.match(p.nodeExe, /windows-node[\\/]node-v22\.17\.0-win-x64[\\/]node\.exe$/);
  const mac = extractionCommand('darwin', '/cache/node.zip', '/out');
  assert.deepEqual(mac, { executable: '/usr/bin/ditto', args: ['-x', '-k', '/cache/node.zip', '/out'], env: {} });
  const win = extractionCommand('win32', 'C:\\cache\\node.zip', 'C:\\out');
  assert.equal(win.executable, 'powershell.exe');
  assert.equal(win.env.WEB_PILOT_NODE_ARCHIVE, 'C:\\cache\\node.zip');
  assert.ok(!win.args.join(' ').includes('C:\\cache\\node.zip'), 'archive path is not interpolated into PowerShell source');
});


test('Windows build preflight can resolve the private runtime payload without hard-coding a user path', () => {
  const candidates = windowsRuntimeSourceCandidates('/repo/Project Web Pilot', { WEB_PILOT_WINDOWS_RUNTIME_ARCHIVE: 'D:\\cache\\runtime.zip' });
  assert.equal(candidates[0], 'D:\\cache\\runtime.zip');
  assert.equal(candidates[1], path.join('/repo/Project Web Pilot', 'windows-app', 'resources', 'windows-payload', 'Windows-Codex-Local-2026-09-10.zip'));
  assert.equal(candidates[2], path.resolve('/repo/Project Web Pilot', '..', 'Codex Local Mac', 'Windows-Codex-Local-2026-09-10.zip'));
});
