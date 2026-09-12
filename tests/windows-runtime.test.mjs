import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { WINDOWS_RUNTIME_SHA256, WINDOWS_CONTEXT_PACKET_SOURCE, patchWindowsBridgeSource, sha256File, windowsRuntimePaths, windowsExpandInvocation, windowsSetupInvocation } from '../src/windows-runtime.mjs';
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
  assert.equal(candidates[1], path.resolve('/repo/Project Web Pilot', '..', 'Codex Local Mac', 'Windows-Codex-Local-2026-09-10.zip'));
});
