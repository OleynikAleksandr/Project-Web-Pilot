import { sha256File } from '../src/common.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import net from 'node:net';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { WindowsExecutorBootstrap, WINDOWS_RUNTIME_SHA256, WINDOWS_CONTEXT_PACKET_SOURCE, WINDOWS_REMOVED_TOOLS, WINDOWS_SKILL_DESKTOP_SECTION,
  WINDOWS_VENDOR_TOOLS, patchWindowsBridgeSource, patchWindowsSkillSource, retireLegacyWindowsRuntime, windowsCommandFailureText,
  windowsExecutorPaths, windowsWorkflowEnvironment } from '../src/windows-runtime.mjs';
import { ZipError, bufferReader, extractZip, zipEntries, zipEntryData } from '../src/zip-archive.mjs';
import zlib from 'node:zlib';
const execute = promisify(execFile);
const windowsControl = fileURLToPath(new URL('../resources/runtime-control/windows-control.py', import.meta.url));

import { BUNDLED_NODE_VERSION, defaultRuntimeFolder, legacyWindowsStateFolder } from '../src/platform.mjs';
import { ensureWindowsRuntimePayload, extractionCommand, NODE_ARCHIVE, NODE_SHA256, WINDOWS_RUNTIME_URL, windowsRuntimeSourceCandidates, windowsToolchainPaths } from '../scripts/prepare-windows-toolchain.mjs';
import { createHash } from 'node:crypto';

// A small bridge with the same shape as the pinned Windows-Codex-Local snapshot: every tool is one
// "@mcp.tool(" block, the twelve computer_* tools follow bridge_status and list_drives comes after them.
const WINDOWS_COMPUTER_TOOLS = [
  ['Computer status', 'computer_status'], ['List visible Windows application windows', 'computer_list_windows'],
  ['Activate a Windows application window', 'computer_activate_window'], ['Capture the Windows desktop', 'computer_capture_screen'],
  ['Capture a Windows application window', 'computer_capture_window'], ['Move the Windows mouse pointer', 'computer_move_mouse'],
  ['Click the Windows mouse', 'computer_click'], ['Scroll the Windows mouse wheel', 'computer_scroll'],
  ['Type Unicode text into Windows', 'computer_type_text'], ['Press a Windows keyboard key', 'computer_key_press'],
  ['Press a Windows keyboard shortcut', 'computer_hotkey'], ['Release Windows input state', 'computer_release_inputs'],
];
const WINDOWS_OBSERVATION_TOOLS = ['computer_list_windows', 'computer_capture_screen', 'computer_capture_window'];
function windowsBridgeFixture() {
  const tool = ([title, name]) => `    @mcp.tool(\n        title="${title}",\n    )\n    def ${name}():\n        return {}\n\n`;
  return 'from windows_computer import WindowsComputer  # noqa: E402\n\ndef create_server():\n'
    + '    mcp = FastMCP("Codex Local Windows")\n    computer = WindowsComputer()\n    turn_watchdog = TurnWatchdog()\n'
    + '    @mcp.tool(\n        title="Bridge status",\n    )\n    def bridge_status(repository: str = ""):\n        status = {}\n'
    + '        status["computer_use"] = computer.status()\n        return status\n\n'
    + WINDOWS_COMPUTER_TOOLS.map(tool).join('')
    + tool(['List local drives', 'list_drives']) + '    return mcp\n';
}
const WINDOWS_SKILL_FIXTURE = '---\nname: local-computer\ndescription: "Work on the connected Windows PC: files, Git, PowerShell/CMD, background processes and desktop actions requested in ChatGPT."\n---\n'
  + '# Codex Local Windows\n\n## Files and commands\n\nCall bridge_status when starting local work.\n\n'
  + '## Desktop\n\nCall computer_status and inspect computer_list_windows before interacting.\n\n'
  + '## Turn notifications\n\nCall turn_watchdog.\n';
const toolCount = source => source.split('    @mcp.tool(').length - 1;

// A ZIP writer for fixtures: entries are [name, content, { method, crc }]; a name ending with "/" is a folder.
function buildZip(files, { method = 8 } = {}) {
  const parts = [], directory = [];
  let offset = 0;
  for (const [name, content = '', options = {}] of files) {
    const data = Buffer.from(content), nameBytes = Buffer.from(name);
    const used = name.endsWith('/') ? 0 : options.method ?? method;
    const body = used === 8 ? zlib.deflateRawSync(data) : data;
    const crc = options.crc ?? zlib.crc32(data);
    const local = Buffer.alloc(30), entry = Buffer.alloc(46);
    local.writeUInt32LE(0x04034b50, 0); local.writeUInt16LE(20, 4); local.writeUInt16LE(0x800, 6); local.writeUInt16LE(used, 8);
    local.writeUInt32LE(crc, 14); local.writeUInt32LE(body.length, 18); local.writeUInt32LE(data.length, 22); local.writeUInt16LE(nameBytes.length, 26);
    entry.writeUInt32LE(0x02014b50, 0); entry.writeUInt16LE(20, 4); entry.writeUInt16LE(20, 6); entry.writeUInt16LE(0x800, 8); entry.writeUInt16LE(used, 10);
    entry.writeUInt32LE(crc, 16); entry.writeUInt32LE(body.length, 20); entry.writeUInt32LE(data.length, 24); entry.writeUInt16LE(nameBytes.length, 28);
    entry.writeUInt32LE(offset, 42);
    parts.push(local, nameBytes, body); directory.push(entry, nameBytes);
    offset += 30 + nameBytes.length + body.length;
  }
  const central = Buffer.concat(directory), end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(files.length, 8); end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(central.length, 12); end.writeUInt32LE(offset, 16);
  return Buffer.concat([...parts, central, end]);
}
const sha256 = data => createHash('sha256').update(data).digest('hex');
const present = file => fs.access(file).then(() => true, () => false);

// The shape of the pinned archive: a top folder, the old bridge, and vendor/ with a manifest and four inner archives.
function vendorArchive({ damage = null } = {}) {
  const inner = {
    uv: ['uv-x86_64-pc-windows-msvc.zip', 'uv.exe', buildZip([['uv.exe', 'UV'], ['uvx.exe', 'UVX']])],
    'tunnel-client': ['tunnel-client-v0.0.14-windows-amd64.zip', 'tunnel-client.exe', buildZip([['tunnel-client.exe', 'TUNNEL'], ['cloudflared.exe', 'CLOUDFLARED']])],
    ripgrep: ['ripgrep-15.2.0-x86_64-pc-windows-msvc.zip', 'ripgrep-15.2.0-x86_64-pc-windows-msvc/rg.exe',
      buildZip([['ripgrep-15.2.0-x86_64-pc-windows-msvc/'], ['ripgrep-15.2.0-x86_64-pc-windows-msvc/rg.exe', 'RG']])],
    git: ['MinGit-2.55.0.5-64-bit.zip', 'cmd/git.exe', buildZip([['cmd/git.exe', 'GIT'], ['usr/'], ['usr/bin/'], ['usr/bin/sh.exe', 'SH', { method: 0 }]])],
  };
  const tools = Object.entries(inner).map(([id, [file, executable, data]]) => ({ id, file, executable,
    sha256: damage === 'inner-sha' && id === 'ripgrep' ? '0'.repeat(64) : sha256(data) }));
  if (damage === 'no-git') tools.pop();
  if (damage === 'executable') tools[0].executable = 'missing.exe';
  const manifest = damage === 'manifest' ? '{broken' : JSON.stringify({ schema_version: damage === 'schema' ? 2 : 1, target: 'windows-x64', tools });
  return buildZip([
    ['Windows-Codex-Local/'], ['Windows-Codex-Local/mcp/bridge_mcp.py', 'print("the old bridge")'], ['Windows-Codex-Local/vendor/'],
    ['Windows-Codex-Local/vendor/manifest.json', manifest, { method: 8 }],
    ...Object.values(inner).map(([file, , data]) => ['Windows-Codex-Local/vendor/' + file, data]),
  ], { method: 0 });
}

test('ZIP reader: stored and deflated entries of a real archiver, UTF-8 names, CRC-32 and names that would leave the folder', async t => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'web-pilot-zip-'));
  t.after(() => fs.rm(dir, { recursive: true, force: true }));
  const archive = path.join(dir, 'made-by-python.zip');
  await execute('python3', ['-c', `import sys, zipfile
with zipfile.ZipFile(sys.argv[1], 'w') as z:
    z.writestr(zipfile.ZipInfo('cmd/'), '')
    z.writestr('cmd/git.exe', b'GIT' * 5000, compress_type=zipfile.ZIP_DEFLATED)
    z.writestr('stored.bin', bytes(range(256)), compress_type=zipfile.ZIP_STORED)
    z.writestr('папка/файл.txt', 'привет', compress_type=zipfile.ZIP_DEFLATED)
    z.writestr('empty.txt', b'', compress_type=zipfile.ZIP_DEFLATED)
`, archive]);
  const buffer = await fs.readFile(archive);
  const entries = await zipEntries(bufferReader(buffer));
  assert.deepEqual(entries.map(entry => [entry.name, entry.method, entry.size, entry.directory]),
    [['cmd/', 0, 0, true], ['cmd/git.exe', 8, 15000, false], ['stored.bin', 0, 256, false], ['папка/файл.txt', 8, 12, false], ['empty.txt', 8, 0, false]]);
  const files = await extractZip(buffer, path.join(dir, 'out'));
  assert.deepEqual(files, ['cmd/git.exe', 'stored.bin', 'папка/файл.txt', 'empty.txt']);
  assert.equal((await fs.readFile(path.join(dir, 'out', 'cmd', 'git.exe'))).equals(Buffer.from('GIT'.repeat(5000))), true);
  assert.equal((await fs.readFile(path.join(dir, 'out', 'stored.bin'))).equals(Buffer.from(Array.from({ length: 256 }, (_, index) => index))), true);
  assert.equal(await fs.readFile(path.join(dir, 'out', 'папка', 'файл.txt'), 'utf8'), 'привет');
  assert.equal((await fs.stat(path.join(dir, 'out', 'empty.txt'))).size, 0);

  // The fixture writer and the reader agree with the real archiver.
  const own = buildZip([['a/'], ['a/b.txt', 'text'], ['c.bin', 'stored', { method: 0 }]]);
  await fs.writeFile(path.join(dir, 'own.zip'), own);
  await execute('python3', ['-c', 'import sys, zipfile; z = zipfile.ZipFile(sys.argv[1]); assert z.testzip() is None; assert z.read("a/b.txt") == b"text"', path.join(dir, 'own.zip')]);

  const reader = bufferReader(buildZip([['bad.txt', 'content', { crc: 1 }]]));
  await assert.rejects(zipEntryData(reader, (await zipEntries(reader))[0]), error => error instanceof ZipError && /bad\.txt/.test(error.message));
  const longer = buildZip([['grows.txt', 'x'.repeat(100)]]);
  longer.writeUInt32LE(10, longer.length - 22 - 46 - 'grows.txt'.length + 24);
  const grown = bufferReader(longer);
  await assert.rejects(zipEntryData(grown, (await zipEntries(grown))[0]), ZipError, 'more data than the directory declares is refused');
  for (const name of ['../outside.txt', 'a/../../outside.txt', '/absolute.txt', 'C:/drive.txt', 'back\\slash.txt', 'a//b.txt', './dot.txt']) {
    await assert.rejects(extractZip(buildZip([[name, 'x']]), path.join(dir, 'unsafe')), error => error instanceof ZipError && /unsafe name/.test(error.message), name);
  }
  assert.equal(await present(path.join(dir, 'outside.txt')), false);
  await assert.rejects(zipEntries(bufferReader(Buffer.from('not a zip archive at all, only text'))), ZipError);
  await assert.rejects(zipEntries(bufferReader(Buffer.alloc(5))), ZipError);
  const zip64 = buildZip([['a.txt', 'x']]); zip64.writeUInt16LE(0xffff, zip64.length - 22 + 10);
  await assert.rejects(zipEntries(bufferReader(zip64)), /ZIP64/);
  const encrypted = buildZip([['a.txt', 'x']]); encrypted.writeUInt16LE(0x801, encrypted.length - 22 - 46 - 'a.txt'.length + 8);
  await assert.rejects(zipEntries(bufferReader(encrypted)), /Encrypted/);
});

test('Windows executor paths and state folders live in the local profile', () => {
  const state = defaultRuntimeFolder('C:\\Users\\Alex', 'win32', { LOCALAPPDATA: 'C:\\Users\\Alex\\AppData\\Local' });
  assert.equal(state, 'C:\\Users\\Alex\\AppData\\Local\\WebPilotCodexExecutor');
  assert.equal(defaultRuntimeFolder('C:\\Users\\Alex', 'win32', {}), state, 'the usual location when LOCALAPPDATA is absent');
  assert.equal(legacyWindowsStateFolder({ LOCALAPPDATA: 'C:\\Users\\Alex\\AppData\\Local' }), 'C:\\Users\\Alex\\AppData\\Local\\CodexLocalWindows');
  assert.equal(legacyWindowsStateFolder({}), null);
  assert.deepEqual(windowsExecutorPaths(state, path.win32), {
    runtime: state + '\\runtime', tools: state + '\\runtime\\tools', marker: state + '\\runtime\\tools.json',
    staging: state + '\\runtime\\tools.staging', venv: state + '\\runtime\\venv', python: state + '\\runtime\\venv\\Scripts\\python.exe' });
  assert.deepEqual(WINDOWS_VENDOR_TOOLS, { uv: 'uv', 'tunnel-client': 'tunnel_client', ripgrep: 'rg', git: 'git' });
  assert.equal(windowsCommandFailureText({ stdout: 'Extracting...\nERROR: no network.\n', stderr: '' }), 'Extracting...\nERROR: no network.');
});

test('Windows components: the four vendor tools are verified and unpacked, the private Python is created once, the old bridge is left in the archive', async t => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'web-pilot-win-components-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const payloadFile = path.join(root, 'payload.zip'), stateDir = path.join(root, 'Local', 'WebPilotCodexExecutor');
  const archive = vendorArchive();
  await fs.writeFile(payloadFile, archive);
  const paths = windowsExecutorPaths(stateDir), phases = [], calls = [];
  let venv = 'create';
  const execute = async (file, args, options) => {
    calls.push({ file, args, options });
    if (args[0] === 'venv') {
      if (venv === 'fail') throw Object.assign(new Error('exit 2'), { stderr: 'error: failed to download Python' });
      if (venv === 'create') { await fs.mkdir(path.dirname(paths.python), { recursive: true }); await fs.writeFile(paths.python, 'python'); }
      return { stdout: '', stderr: '' };
    }
    if (args[0] === '--version') return { stdout: 'git version 2.55.0.windows.5\n', stderr: '' };
    throw new Error('unexpected command');
  };
  const create = (extra = {}) => new WindowsExecutorBootstrap({ payloadFile, stateDir, platform: 'win32', expectedSha256: sha256(archive),
    environment: { Path: 'C:\\Windows\\System32' }, execute, onState: state => phases.push(state.phase), ...extra });
  const bootstrap = create();
  assert.deepEqual(bootstrap.snapshot(), { phase: 'embedded', installed: false, toolsReady: false, error: null });
  assert.deepEqual(await bootstrap.inspect(), { phase: 'embedded', installed: false, toolsReady: false, error: null });
  await assert.rejects(bootstrap.workflowEnvironment(), { code: 'WINDOWS_RUNTIME_NOT_INSTALLED' });

  const [tools, shared] = await Promise.all([bootstrap.ensureTools(), bootstrap.ensureTools()]);
  assert.equal(tools, shared, 'concurrent callers share one unpacking');
  assert.deepEqual(tools, { uv: path.join(paths.tools, 'uv', 'uv.exe'), tunnel_client: path.join(paths.tools, 'tunnel-client', 'tunnel-client.exe'),
    rg: path.join(paths.tools, 'ripgrep', 'ripgrep-15.2.0-x86_64-pc-windows-msvc', 'rg.exe'), git: path.join(paths.tools, 'git', 'cmd', 'git.exe') });
  for (const [file, content] of [[tools.uv, 'UV'], [tools.tunnel_client, 'TUNNEL'], [tools.rg, 'RG'], [tools.git, 'GIT'],
    [path.join(paths.tools, 'tunnel-client', 'cloudflared.exe'), 'CLOUDFLARED'], [path.join(paths.tools, 'git', 'usr', 'bin', 'sh.exe'), 'SH']]) {
    assert.equal(await fs.readFile(file, 'utf8'), content, file);
  }
  assert.deepEqual(JSON.parse(await fs.readFile(paths.marker, 'utf8')), { schema_version: 1, archive_sha256: sha256(archive), tools },
    'control.py of the executor reads the same record');
  assert.deepEqual((await fs.readdir(paths.runtime)).sort(), ['tools', 'tools.json'], 'no staging folder and no old bridge remain');
  assert.deepEqual(phases, ['verifying', 'extracting', 'embedded']);
  assert.deepEqual(await bootstrap.inspect(), { phase: 'embedded', installed: false, toolsReady: true, error: null }, 'Git is ready, the Python is not');
  assert.equal(calls.length, 0, 'unpacking runs no program');

  const environment = await bootstrap.workflowEnvironment();
  assert.deepEqual(environment, { WORKFLOW_GIT_BIN: tools.git, WORKFLOW_GIT_HOME: path.join(paths.tools, 'git'),
    Path: [path.join(paths.tools, 'git', 'cmd'), path.join(paths.tools, 'git', 'usr', 'bin'), 'C:\\Windows\\System32'].join(';') });
  assert.deepEqual([calls[0].file, calls[0].args, calls[0].options.windowsHide], [tools.git, ['--version'], true]);

  calls.length = 0;
  const [installed, again] = await Promise.all([bootstrap.ensure(), bootstrap.ensure()]);
  assert.equal(installed, again);
  assert.deepEqual(installed, { phase: 'installed', installed: true, toolsReady: true, error: null });
  assert.equal(calls.length, 1, 'one uv call for concurrent callers');
  assert.equal(calls[0].file, tools.uv);
  assert.deepEqual(calls[0].args, ['venv', '--clear', '--managed-python', '--python', '3.13', '--no-config', paths.venv]);
  assert.equal(calls[0].options.windowsHide, true);
  assert.equal(calls[0].options.env.UV_PYTHON_INSTALL_DIR, path.join(paths.runtime, 'python'));
  assert.equal(calls[0].options.env.UV_CACHE_DIR, path.join(paths.runtime, 'uv-cache'));
  assert.equal(calls[0].options.env.Path, 'C:\\Windows\\System32');
  const markerTime = (await fs.stat(paths.marker)).mtimeMs;
  calls.length = 0;
  await bootstrap.ensure(); await create().ensure();
  assert.equal(calls.length, 0, 'prepared components are not touched again');
  assert.equal((await fs.stat(paths.marker)).mtimeMs, markerTime);
  assert.deepEqual((await create().inspect()), { phase: 'installed', installed: true, toolsReady: true, error: null });

  // A record of another archive, a missing executable or a path outside the tools folder means: unpack again.
  for (const damage of [
    marker => ({ ...marker, archive_sha256: 'f'.repeat(64) }),
    marker => ({ ...marker, tools: { ...marker.tools, git: path.join(root, 'elsewhere', 'git.exe') } }),
    marker => ({ ...marker, tools: { ...marker.tools, rg: path.join(paths.tools, 'ripgrep', 'gone.exe') } }),
    () => 'not json',
  ]) {
    const marker = JSON.parse(await fs.readFile(paths.marker, 'utf8'));
    const next = damage(marker);
    await fs.writeFile(paths.marker, typeof next === 'string' ? next : JSON.stringify(next));
    assert.equal((await create().inspect()).toolsReady, false);
    assert.deepEqual(await create().ensureTools(), tools);
    assert.deepEqual(JSON.parse(await fs.readFile(paths.marker, 'utf8')).tools, tools);
  }
  assert.equal(await fs.readFile(paths.python, 'utf8'), 'python', 'unpacking the tools again keeps the Python');

  // Failures carry the codes the first-run wizard explains.
  await fs.rm(paths.python);
  venv = 'fail';
  const failing = create();
  await assert.rejects(failing.ensure(), error => error.code === 'WINDOWS_RUNTIME_SETUP_FAILED' && /failed to download Python/.test(error.message));
  assert.deepEqual(failing.snapshot(), { phase: 'error', installed: false, toolsReady: true, error: 'WINDOWS_RUNTIME_SETUP_FAILED' });
  assert.equal((await failing.inspect()).phase, 'error', 'an inspection does not hide the failure');
  venv = 'nothing';
  await assert.rejects(create().ensure(), { code: 'WINDOWS_RUNTIME_SETUP_INCOMPLETE' });
  venv = 'create';
  assert.equal((await failing.ensure()).phase, 'installed', 'the next attempt repeats the step');

  await fs.rm(paths.runtime, { recursive: true });
  await assert.rejects(create({ expectedSha256: 'a'.repeat(64) }).ensureTools(), { code: 'WINDOWS_RUNTIME_PAYLOAD_DAMAGED' });
  await assert.rejects(create({ payloadFile: path.join(root, 'absent.zip') }).ensure(), { code: 'WINDOWS_RUNTIME_PAYLOAD_MISSING' });
  for (const damage of ['inner-sha', 'no-git', 'executable', 'manifest', 'schema']) {
    const broken = vendorArchive({ damage });
    await fs.writeFile(path.join(root, damage + '.zip'), broken);
    const attempt = create({ payloadFile: path.join(root, damage + '.zip'), expectedSha256: sha256(broken) });
    await assert.rejects(attempt.ensureTools(), { code: 'WINDOWS_RUNTIME_ARCHIVE_INVALID' }, damage);
    assert.equal(attempt.snapshot().error, 'WINDOWS_RUNTIME_ARCHIVE_INVALID');
    assert.equal(await present(paths.marker), false, damage);
    assert.equal(await present(paths.staging), false, damage + ': nothing half-unpacked is left');
  }
  await fs.writeFile(path.join(root, 'text.zip'), 'this is not an archive');
  await assert.rejects(create({ payloadFile: path.join(root, 'text.zip'), expectedSha256: sha256('this is not an archive') }).ensureTools(),
    { code: 'WINDOWS_RUNTIME_ARCHIVE_INVALID' });
  const mac = create({ platform: 'darwin' });
  assert.equal(mac.snapshot().phase, 'unavailable');
  await assert.rejects(mac.ensure(), { code: 'WINDOWS_ONLY' });
  assert.throws(() => new WindowsExecutorBootstrap({ payloadFile }), TypeError);
});

test('Windows components unpack from the real pinned archive', { timeout: 120_000 }, async t => {
  const payloadFile = path.join(windowsToolchainPaths().cacheDir, 'Windows-Codex-Local-2026-09-10.zip');
  let digest = null;
  try { digest = await sha256File(payloadFile); } catch {}
  if (digest !== WINDOWS_RUNTIME_SHA256) { t.skip('pinned Windows archive is not in the local build cache'); return; }
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'web-pilot-win-real-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const stateDir = path.join(root, 'WebPilotCodexExecutor'), paths = windowsExecutorPaths(stateDir);
  const bootstrap = new WindowsExecutorBootstrap({ payloadFile, stateDir, platform: 'win32', environment: {},
    execute: async (file, args) => {
      if (args[0] === '--version') return { stdout: 'git version 2.55.0.windows.5\n', stderr: '' };
      throw new Error('unexpected command');
    } });
  const tools = await bootstrap.ensureTools();
  const size = async (...parts) => (await fs.stat(path.join(paths.tools, ...parts))).size;
  assert.equal(await size('uv', 'uv.exe'), 41455408);
  assert.equal(await size('tunnel-client', 'tunnel-client.exe'), 21826048);
  assert.equal(await size('tunnel-client', 'cloudflared.exe'), 39751680, 'tunnel-client keeps its companion next to it');
  assert.ok(await size('ripgrep', 'ripgrep-15.2.0-x86_64-pc-windows-msvc', 'rg.exe') > 1_000_000);
  assert.ok(await size('git', 'cmd', 'git.exe') > 10_000);
  assert.ok(await size('git', 'usr', 'bin', 'sh.exe') > 10_000);
  assert.equal(tools.git, path.join(paths.tools, 'git', 'cmd', 'git.exe'));
  assert.deepEqual((await fs.readdir(paths.tools)).sort(), ['git', 'ripgrep', 'tunnel-client', 'uv']);
  assert.equal((await bootstrap.workflowEnvironment()).WORKFLOW_GIT_BIN, tools.git);
  assert.equal(JSON.parse(await fs.readFile(paths.marker, 'utf8')).archive_sha256, WINDOWS_RUNTIME_SHA256);
});

test('the bridge of earlier versions is stopped by its own lifecycle script and only the copy in the app data is removed', async t => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'web-pilot-win-legacy-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const dataDir = path.join(root, 'Roaming', 'Project Web Pilot'), installed = path.join(dataDir, 'runtime', 'Windows-Codex-Local');
  const chosen = path.join(root, 'Codex Local Windows'), recorded = path.join(root, 'Recorded Copy'), empty = path.join(root, 'No Python');
  const legacyStateDir = path.join(root, 'Local', 'CodexLocalWindows');
  const python = folder => path.join(folder, '.venv', 'Scripts', 'python.exe');
  for (const folder of [installed, chosen, recorded]) {
    await fs.mkdir(path.dirname(python(folder)), { recursive: true });
    await fs.writeFile(python(folder), 'python');
  }
  await fs.mkdir(empty, { recursive: true });
  await fs.mkdir(path.join(legacyStateDir, 'private'), { recursive: true });
  await fs.writeFile(path.join(legacyStateDir, 'private', 'tunnel-key.dpapi'), 'old key');
  await fs.writeFile(path.join(legacyStateDir, 'mcp.pid.json'), JSON.stringify({ package_root: recorded, identity: { pid: 4242 } }));
  await fs.writeFile(path.join(legacyStateDir, 'tunnel.pid.json'), 'damaged');
  await fs.mkdir(path.join(dataDir, 'runtime', '.windows-runtime-staging'), { recursive: true });
  await fs.writeFile(path.join(dataDir, 'runtime', 'windows-runtime.json'), '{}');
  await fs.writeFile(path.join(dataDir, 'settings.json'), '{}');
  const calls = [];
  let stopFails = null, regFails = false;
  const execute = async (file, args, options) => {
    calls.push([file, args, options]);
    if (args[0] === 'delete') { if (regFails) throw new Error('ERROR: The system was unable to find the specified registry value.'); return { stdout: '' }; }
    if (stopFails && options.cwd === stopFails) throw Object.assign(new Error('exit 1'), { stderr: '{"ok": false, "error": "mcp: not stopped"}' });
    return { stdout: '{"stopped": ["tunnel", "mcp"]}' };
  };
  const options = { dataDir, runtimeRoots: [chosen, empty, chosen, 'relative', null], legacyStateDir, controlFile: '/app/resources/runtime-control/windows-control.py',
    execute, environment: { SystemRoot: '/Windows', Path: 'C:\\x' } };

  stopFails = chosen;
  await assert.rejects(retireLegacyWindowsRuntime(options), /exit 1/);
  assert.equal(await present(installed), true, 'nothing is removed while a bridge may still be running');
  calls.length = 0; stopFails = null; regFails = true;
  const result = await retireLegacyWindowsRuntime(options);
  assert.deepEqual(result, { stopped: [installed, chosen, recorded], removed: installed });
  const stops = calls.filter(([, args]) => args.at(-1) === 'stop');
  assert.deepEqual(stops.map(([file, args, settings]) => [file, args, settings.cwd, settings.env.WEB_PILOT_RUNTIME_ROOT, settings.env.PYTHONUTF8, settings.windowsHide]),
    [installed, chosen, recorded].map(folder => [python(folder), ['-B', options.controlFile, 'stop'], folder, folder, '1', true]),
    'every folder is stopped with its own Python; a folder without one cannot be running');
  const reg = calls.find(([, args]) => args[0] === 'delete');
  assert.deepEqual([reg[0], reg[1]], [path.join('/Windows', 'System32', 'reg.exe'),
    ['delete', 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run', '/v', 'ProjectWebPilotMCP', '/f']], 'the old start at sign-in is removed; a missing value is not an error');
  for (const gone of [installed, path.join(dataDir, 'runtime', 'windows-runtime.json'), path.join(dataDir, 'runtime', '.windows-runtime-staging')])
    assert.equal(await present(gone), false, gone);
  for (const kept of [python(chosen), python(recorded), empty, path.join(legacyStateDir, 'private', 'tunnel-key.dpapi'), path.join(dataDir, 'settings.json')])
    assert.equal(await present(kept), true, 'folders of the user and the old tunnel key stay: ' + kept);
  calls.length = 0;
  assert.deepEqual((await retireLegacyWindowsRuntime({ ...options, runtimeRoots: [], legacyStateDir: null })).stopped, [], 'a second run finds nothing to stop');
  await assert.rejects(retireLegacyWindowsRuntime({ ...options, dataDir: 'relative' }), TypeError);
  await assert.rejects(retireLegacyWindowsRuntime({ ...options, controlFile: undefined }), TypeError);
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
  const fixture = windowsBridgeFixture();
  const patched = patchWindowsBridgeSource(fixture);
  assert.match(patched, /from context_packet import ContextPacket/);
  assert.match(patched, /context_packet = ContextPacket\(\)/);
  assert.equal(patched.split('def workflow_context_recover(workspace: str)').length - 1, 1);
  assert.equal(patchWindowsBridgeSource(patched), patched, 'overlay is idempotent');
  assert.match(WINDOWS_CONTEXT_PACKET_SOURCE, /\.harness\/runtime\/node\.exe/);
  assert.match(WINDOWS_CONTEXT_PACKET_SOURCE, /inline-context-v1/);
  assert.ok(WINDOWS_CONTEXT_PACKET_SOURCE.includes(String.raw`r'json\s*\n(.*?)\n'`));
  assert.doesNotMatch(WINDOWS_CONTEXT_PACKET_SOURCE, /scripts\/workflow\.cmd/);
});

test('Windows overlay removes UI control tools, keeps observation and fails closed on an unknown bridge', () => {
  const fixture = windowsBridgeFixture();
  assert.equal(toolCount(fixture), 14);
  const patched = patchWindowsBridgeSource(fixture);
  assert.equal(WINDOWS_REMOVED_TOOLS.length, 9);
  for (const name of WINDOWS_REMOVED_TOOLS) assert.doesNotMatch(patched, new RegExp(`def ${name}\\(`), name);
  for (const name of [...WINDOWS_OBSERVATION_TOOLS, 'bridge_status', 'workflow_context_recover', 'list_drives']) {
    assert.equal(patched.split(`def ${name}(`).length - 1, 1, name);
  }
  // 14 tools + workflow_context_recover - 9 UI control tools.
  assert.equal(toolCount(patched), 6);
  assert.doesNotMatch(patched, /computer_use/);
  assert.match(patched, /computer = WindowsComputer\(\)/, 'the capture tools still need the computer object');
  assert.ok(patched.endsWith('    return mcp\n'));

  // A runtime installed by 0.6.89 already has the context tool and still has every UI tool: one more pass removes them.
  const importAnchor = 'from windows_computer import WindowsComputer  # noqa: E402';
  const previousOverlay = fixture
    .replace(importAnchor, importAnchor + '\nfrom context_packet import ContextPacket  # noqa: E402')
    .replace('    turn_watchdog = TurnWatchdog()\n', '    turn_watchdog = TurnWatchdog()\n    context_packet = ContextPacket()\n')
    .replace('        return status\n\n', '        return status\n\n    @mcp.tool(\n        title="Read the selected project context",\n    )\n'
      + '    def workflow_context_recover(workspace: str) -> dict[str, Any]:\n        return context_packet.recover(workspace)\n\n');
  assert.equal(toolCount(previousOverlay), 15);
  const upgraded = patchWindowsBridgeSource(previousOverlay);
  assert.equal(toolCount(upgraded), 6);
  for (const name of WINDOWS_REMOVED_TOOLS) assert.doesNotMatch(upgraded, new RegExp(`def ${name}\\(`), name);
  assert.equal(upgraded.split('def workflow_context_recover(').length - 1, 1);

  // Fail closed: a bridge with only some of the UI tools is not a snapshot this overlay knows.
  const partial = patched.replace('    @mcp.tool(\n        title="List visible Windows application windows",',
    '    @mcp.tool(\n        title="Computer status",\n    )\n    def computer_status():\n        return {}\n\n    @mcp.tool(\n        title="List visible Windows application windows",');
  assert.throws(() => patchWindowsBridgeSource(partial), { code: 'WINDOWS_RUNTIME_BRIDGE_INVALID' });
  const withoutOne = fixture.replace('    @mcp.tool(\n        title="Click the Windows mouse",\n    )\n    def computer_click():\n        return {}\n\n', '');
  assert.throws(() => patchWindowsBridgeSource(withoutOne), { code: 'WINDOWS_RUNTIME_BRIDGE_INVALID' });
  const duplicated = fixture.replace('    def computer_scroll():', '    def computer_scroll():\n        return {}\n\n    @mcp.tool(\n        title="Twice",\n    )\n    def computer_scroll():');
  assert.throws(() => patchWindowsBridgeSource(duplicated), { code: 'WINDOWS_RUNTIME_BRIDGE_INVALID' });
  const withoutStatusLine = fixture.replace('        status["computer_use"] = computer.status()\n', '');
  assert.throws(() => patchWindowsBridgeSource(withoutStatusLine), { code: 'WINDOWS_RUNTIME_BRIDGE_INVALID' });
});

test('Windows skill instructions lose the Desktop control section exactly once', () => {
  const patched = patchWindowsSkillSource(WINDOWS_SKILL_FIXTURE);
  assert.ok(patched.includes(WINDOWS_SKILL_DESKTOP_SECTION + '## Turn notifications\n'));
  assert.doesNotMatch(patched, /Call computer_status/);
  assert.doesNotMatch(patched, /desktop actions requested in ChatGPT/);
  assert.match(patched, /## Files and commands\n\nCall bridge_status/);
  assert.equal(patchWindowsSkillSource(patched), patched, 'skill overlay is idempotent');
  for (const broken of [WINDOWS_SKILL_FIXTURE.replace('## Desktop\n', '## Screen\n'), WINDOWS_SKILL_FIXTURE.replace('## Turn notifications\n', ''),
    WINDOWS_SKILL_FIXTURE + '## Desktop\n', null]) {
    assert.throws(() => patchWindowsSkillSource(broken), { code: 'WINDOWS_RUNTIME_BRIDGE_INVALID' });
  }
});

test('Windows overlay leaves 38 tools in the real pinned bridge and valid Python', async t => {
  const archive = path.join(windowsToolchainPaths().cacheDir, 'Windows-Codex-Local-2026-09-10.zip');
  let digest = null;
  try { digest = await sha256File(archive); } catch {}
  if (process.platform === 'win32' || digest !== WINDOWS_RUNTIME_SHA256) { t.skip('pinned Windows runtime archive is not in the local build cache'); return; }
  const read = async member => (await execute('/usr/bin/unzip', ['-p', archive, 'Windows-Codex-Local/' + member], { maxBuffer: 4 * 1024 * 1024 })).stdout;
  const bridge = await read('mcp/bridge_mcp.py');
  assert.equal(toolCount(bridge), 46);
  const patched = patchWindowsBridgeSource(bridge);
  assert.equal(toolCount(patched), 38);
  for (const name of WINDOWS_REMOVED_TOOLS) assert.doesNotMatch(patched, new RegExp(`def ${name}\\(`), name);
  for (const name of [...WINDOWS_OBSERVATION_TOOLS, 'workflow_context_recover', 'list_drives', 'git_show']) {
    assert.equal(patched.split(`def ${name}(`).length - 1, 1, name);
  }
  assert.doesNotMatch(patched, /computer_use/);
  assert.equal(patchWindowsBridgeSource(patched), patched);
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'web-pilot-win-overlay-'));
  t.after(() => fs.rm(dir, { recursive: true, force: true }));
  await fs.writeFile(path.join(dir, 'bridge_mcp.py'), patched);
  await execute('python3', ['-m', 'py_compile', path.join(dir, 'bridge_mcp.py')]);

  const skill = await read('skills/local-computer/SKILL.md');
  assert.match(skill, /Call computer_status and inspect computer_list_windows/);
  const patchedSkill = patchWindowsSkillSource(skill);
  assert.ok(patchedSkill.includes(WINDOWS_SKILL_DESKTOP_SECTION + '## Turn notifications\n'));
  assert.doesNotMatch(patchedSkill, /Call computer_status|computer_release_inputs|desktop actions requested in ChatGPT/);
  assert.match(patchedSkill, /## Evidence and reconnection/);
  assert.equal(patchWindowsSkillSource(patchedSkill), patchedSkill);
});

test('portable Node build payload has pinned Windows x64 layout and safe extraction plans', () => {
  assert.equal(NODE_ARCHIVE, 'node-v24.21.0-win-x64.zip');
  assert.equal(NODE_SHA256, '158f7685b44de51f6c0df1d153526cbcd3e1bc739a8dfc607721cef75de9e541');
  const p = windowsToolchainPaths('/repo');
  assert.match(p.nodeExe, /windows-node[\\/]node-v24\.21\.0-win-x64[\\/]node\.exe$/);
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
  assert.equal(candidates.length, 2, 'the build no longer looks into a neighbouring private workspace');
});

test('Windows runtime payload comes from the build cache, a local copy or the release asset and is always verified', async t => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'web-pilot-win-payload-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const cacheDir = path.join(root, 'cache'), cached = path.join(cacheDir, 'Windows-Codex-Local-2026-09-10.zip');
  await fs.mkdir(cacheDir, { recursive: true });
  const good = Buffer.from('pinned runtime fixture');
  const expectedSha256 = createHash('sha256').update(good).digest('hex');
  const offline = async () => { throw new Error('HTTP 404'); };
  assert.equal(WINDOWS_RUNTIME_URL, 'https://github.com/OleynikAleksandr/Project-Web-Pilot/releases/latest/download/Windows-Codex-Local-2026-09-10.zip');

  // Empty cache and no local copy: the release asset is downloaded and verified.
  const fetched = [];
  let result = await ensureWindowsRuntimePayload(root, cacheDir, { environment: {}, expectedSha256,
    fetchArchive: async (url, destination) => { fetched.push(url); await fs.writeFile(destination, good); } });
  assert.deepEqual([result.file, result.downloaded, result.reused, fetched], [cached, true, false, [WINDOWS_RUNTIME_URL]]);

  // A verified cache needs no network.
  result = await ensureWindowsRuntimePayload(root, cacheDir, { environment: {}, expectedSha256, fetchArchive: offline });
  assert.deepEqual([result.downloaded, result.reused], [false, true]);

  // A local copy named by the environment is preferred to the download.
  await fs.rm(cached);
  const local = path.join(root, 'local.zip');
  await fs.writeFile(local, good);
  result = await ensureWindowsRuntimePayload(root, cacheDir, { environment: { WEB_PILOT_WINDOWS_RUNTIME_ARCHIVE: local }, expectedSha256, fetchArchive: offline });
  assert.deepEqual([result.downloaded, result.reused, await sha256File(cached)], [false, false, expectedSha256]);

  // A download with another digest is rejected and never stays in the cache; so does a damaged cache.
  await fs.writeFile(cached, 'damaged cache');
  await assert.rejects(ensureWindowsRuntimePayload(root, cacheDir, { environment: {}, expectedSha256,
    fetchArchive: async (_url, destination) => fs.writeFile(destination, 'tampered') }), /Downloaded Windows Codex Local payload has SHA-256 [0-9a-f]{64}, expected/);
  await assert.rejects(fs.access(cached));
  await assert.rejects(ensureWindowsRuntimePayload(root, cacheDir, { environment: {}, expectedSha256, fetchArchive: offline }),
    /download failed \(HTTP 404\)\. Put Windows-Codex-Local-2026-09-10\.zip at /);
  await assert.rejects(fs.access(cached));
});


test('the lifecycle script of the previous bridge stays in the package: 0.6.96 uses it once to stop that bridge', async () => {
  const source = await fs.readFile(windowsControl, 'utf8');
  assert.match(source, /RUNTIME_CONTRACT = 2/);
  assert.match(source, /WEB_PILOT_RUNTIME_ROOT/);
  assert.match(source, /def stop\(\) -> dict:/);
  assert.match(source, /stale_cleaned/);
});

function listenLocal(port=0){return new Promise((resolve,reject)=>{const server=net.createServer();server.once('error',reject);server.listen(port,'127.0.0.1',()=>resolve(server));});}
function closeLocal(server){return new Promise(resolve=>server.close(resolve));}
async function reserveLocalPort(){const server=await listenLocal();const port=server.address().port;await closeLocal(server);return port;}
async function pythonWithPsutilStub(t,state,runtime,args){
  const stub=path.join(state,'stubs');await fs.mkdir(stub,{recursive:true});
  await fs.writeFile(path.join(stub,'psutil.py'),`class NoSuchProcess(Exception): pass\nclass ZombieProcess(Exception): pass\nclass AccessDenied(Exception): pass\nclass Process:\n    def __init__(self,pid): raise NoSuchProcess(pid)\n`);
  return execute('python3',args,{env:{...process.env,PYTHONPATH:stub,CODEX_LOCAL_WINDOWS_STATE_DIR:state,WEB_PILOT_RUNTIME_ROOT:runtime,PYTHONDONTWRITEBYTECODE:'1'},timeout:10000});
}

test('Windows lifecycle adapter cleans stale PID and moves occupied persisted endpoints without WinAPI secrets', async t => {
  const state=await fs.mkdtemp(path.join(os.tmpdir(),'web-pilot-win-control-'));t.after(()=>fs.rm(state,{recursive:true,force:true}));
  const runtime=path.join(state,'runtime-root');await fs.mkdir(runtime,{recursive:true});
  const pidFile=path.join(state,'mcp.pid.json');await fs.writeFile(pidFile,JSON.stringify({package_root:runtime,identity:{pid:999999,created:0,exe:'foreign',cmdline:['foreign']}},null,2));
  const statusCode=`import importlib.util,json\ns=importlib.util.spec_from_file_location('c',${JSON.stringify(windowsControl)})\nm=importlib.util.module_from_spec(s);s.loader.exec_module(m)\nprint(json.dumps(m.status()))`;
  const first=JSON.parse((await pythonWithPsutilStub(t,state,runtime,['-c',statusCode])).stdout);
  assert.equal(first.runtime_contract,2);assert.equal(first.mcp.running,false);assert.equal(first.mcp.stale_cleaned,true);await assert.rejects(fs.stat(pidFile),{code:'ENOENT'});
  const priv=path.join(state,'private'),profileDir=path.join(priv,'tunnel-profile');await fs.mkdir(profileDir,{recursive:true});
  const preferredMcp=await reserveLocalPort(),preferredTunnel=await reserveLocalPort();
  await fs.writeFile(path.join(priv,'runtime-endpoints.json'),JSON.stringify({schema_version:1,mcp_port:preferredMcp,tunnel_port:preferredTunnel}));
  await fs.writeFile(path.join(priv,'bridge_config.json'),JSON.stringify({repo:'/tmp/project',token:'opaque',port:preferredMcp}));
  const profile={control_plane:{tunnel_id:'tunnel_fixture_1234567890',api_key:'env:CODEX_LOCAL_WINDOWS_TUNNEL_API_KEY'},health:{listen_addr:`127.0.0.1:${preferredTunnel}`},mcp:{server_urls:[{channel:'main',url:`http://127.0.0.1:${preferredMcp}/mcp`}]}};
  await fs.writeFile(path.join(profileDir,'windows-local.yaml'),JSON.stringify(profile));
  const a=await listenLocal(preferredMcp),b=await listenLocal(preferredTunnel);let ao=true,bo=true;t.after(async()=>{if(ao)await closeLocal(a).catch(()=>{});if(bo)await closeLocal(b).catch(()=>{});});
  const code=`import importlib.util,json\ns=importlib.util.spec_from_file_location('c',${JSON.stringify(windowsControl)})\nm=importlib.util.module_from_spec(s);s.loader.exec_module(m)\nprint(json.dumps(m.reconcile_endpoints()))`;
  const moved=JSON.parse((await pythonWithPsutilStub(t,state,runtime,['-c',code])).stdout);assert.notEqual(moved.mcp_port,preferredMcp);assert.notEqual(moved.tunnel_port,preferredTunnel);
  const updated=JSON.parse(await fs.readFile(path.join(profileDir,'windows-local.yaml'),'utf8'));assert.equal(updated.control_plane.tunnel_id,profile.control_plane.tunnel_id);assert.equal(updated.control_plane.api_key,profile.control_plane.api_key);assert.equal(updated.mcp.server_urls[0].url,`http://127.0.0.1:${moved.mcp_port}/mcp`);
  await closeLocal(a);ao=false;await closeLocal(b);bo=false;
});

test('Workflow Kit on Windows gets the MinGit of the package and refuses a Git from elsewhere', () => {
  const tools = 'C:\\Users\\Pilot\\AppData\\Local\\WebPilotCodexExecutor\\runtime\\tools';
  const git = tools + '\\git\\cmd\\git.exe';
  const env = windowsWorkflowEnvironment(tools, { git }, { Path: 'C:\\Windows\\System32' }, path.win32);
  assert.equal(env.WORKFLOW_GIT_BIN, git);
  assert.equal(env.WORKFLOW_GIT_HOME, tools + '\\git');
  assert.equal(env.Path, `${tools}\\git\\cmd;${tools}\\git\\usr\\bin;C:\\Windows\\System32`);
  assert.equal(windowsWorkflowEnvironment(tools, { git: git.toUpperCase() }, {}, path.win32).Path, `${tools}\\git\\cmd;${tools}\\git\\usr\\bin`);
  assert.throws(() => windowsWorkflowEnvironment(tools, { git: 'C:\\foreign\\git.exe' }, {}, path.win32), { code: 'WINDOWS_GIT_LAYOUT_INVALID' });
  assert.throws(() => windowsWorkflowEnvironment(tools, {}, {}, path.win32), { code: 'WINDOWS_GIT_LAYOUT_INVALID' });
});


test('Windows build launcher uses the canonical bundled Node folder', async () => {
  const launcher = await fs.readFile(new URL('../BUILD_WINDOWS.cmd', import.meta.url), 'utf8');
  const folder = windowsToolchainPaths('/repo').nodeFolder;
  assert.equal(path.basename(folder), 'node-v' + BUNDLED_NODE_VERSION + '-win-x64');
  assert.ok(launcher.includes('windows-node\\' + path.basename(folder)));
});
