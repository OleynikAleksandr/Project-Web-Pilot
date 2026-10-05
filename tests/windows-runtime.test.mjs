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
import { WindowsRuntimeBootstrap, WINDOWS_RUNTIME_SHA256, WINDOWS_CONTEXT_PACKET_SOURCE, WINDOWS_RUNTIME_CONTROL_CONTRACT, WINDOWS_LEGACY_CONTROL_SHA256, WINDOWS_REMOVED_TOOLS, WINDOWS_SKILL_DESKTOP_SECTION, patchWindowsBridgeSource, patchWindowsSkillSource, windowsRuntimePaths, windowsRuntimeStateDirectory, windowsCommandFailureText, windowsExpandInvocation, windowsSetupInvocation } from '../src/windows-runtime.mjs';
const execute = promisify(execFile);
const windowsControl = fileURLToPath(new URL('../resources/runtime-control/windows-control.py', import.meta.url));

import { BUNDLED_NODE_VERSION, bundledWindowsRuntimeFolder } from '../src/platform.mjs';
import { extractionCommand, NODE_ARCHIVE, NODE_SHA256, windowsRuntimeSourceCandidates, windowsToolchainPaths } from '../scripts/prepare-windows-toolchain.mjs';

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
  await fs.writeFile(path.join(external, 'mcp', 'bridge_mcp.py'), windowsBridgeFixture());
  await fs.mkdir(path.join(external, 'skills', 'local-computer'), { recursive: true });
  await fs.writeFile(path.join(external, 'skills', 'local-computer', 'SKILL.md'), WINDOWS_SKILL_FIXTURE);
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
  const adopted = await fs.readFile(path.join(external, 'mcp', 'bridge_mcp.py'), 'utf8');
  assert.match(adopted, /workflow_context_recover/);
  assert.doesNotMatch(adopted, /def computer_click\(/);
  assert.equal(await fs.readFile(path.join(external, 'server', 'context_packet.py'), 'utf8'), WINDOWS_CONTEXT_PACKET_SOURCE);
  assert.ok((await fs.readFile(path.join(external, 'skills', 'local-computer', 'SKILL.md'), 'utf8')).includes(WINDOWS_SKILL_DESKTOP_SECTION));
});

test('Windows bootstrap refreshes an installed bundled runtime in place when the overlay version changes', { skip: process.platform !== 'win32' }, async t => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'web-pilot-bundled-overlay-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const dataDir = path.join(root, 'pilot');
  const paths = windowsRuntimePaths(dataDir);
  const stateDir = path.join(root, 'state');
  for (const dir of [path.dirname(paths.python), path.dirname(paths.locations), path.join(paths.folder, 'mcp'), path.join(paths.folder, 'server'),
    path.join(paths.folder, 'skills', 'local-computer'), stateDir]) await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(paths.control, '# fixture\n');
  await fs.writeFile(paths.python, 'fixture');
  await fs.writeFile(paths.locations, '{}\n');
  const bridgeFile = path.join(paths.folder, 'mcp', 'bridge_mcp.py');
  const skillFile = path.join(paths.folder, 'skills', 'local-computer', 'SKILL.md');
  await fs.writeFile(bridgeFile, windowsBridgeFixture());
  await fs.writeFile(skillFile, WINDOWS_SKILL_FIXTURE);
  await fs.writeFile(paths.marker, JSON.stringify({ schemaVersion: 1, payloadSha256: WINDOWS_RUNTIME_SHA256, overlayVersion: 1, folder: paths.folder }));
  const calls = [];
  const service = { package_root: paths.folder, mcp: { owned: true, running: true, ready: true },
    tunnel: { owned: false, running: false, ready: false, configured: true }, mcp_url: 'http://127.0.0.1:17842/mcp' };
  const execute = async (_file, args) => {
    const command = args[2]; calls.push(args.slice(2).join(' '));
    if (command === 'status') return { stdout: JSON.stringify(service), stderr: '' };
    if (command === 'stop' || command === 'start') return { stdout: '{}', stderr: '' };
    throw new Error('the bundled payload must not be reinstalled: ' + command);
  };
  const bootstrap = new WindowsRuntimeBootstrap({ payloadFile: path.join(root, 'missing-payload.zip'), dataDir,
    execute, environment: {}, platform: 'win32', stateDir });
  assert.equal((await bootstrap.inspect()).overlayOutdated, true);
  const result = await bootstrap.ensure(root);
  assert.equal(result.reused, true);
  assert.equal(result.overlayOutdated, false);
  assert.deepEqual(calls, ['status', 'stop', 'start --mcp-only']);
  const bridge = await fs.readFile(bridgeFile, 'utf8');
  for (const name of WINDOWS_REMOVED_TOOLS) assert.doesNotMatch(bridge, new RegExp(`def ${name}\\(`));
  assert.match(bridge, /def workflow_context_recover\(/);
  assert.ok((await fs.readFile(skillFile, 'utf8')).includes(WINDOWS_SKILL_DESKTOP_SECTION));
  assert.equal(JSON.parse(await fs.readFile(paths.marker, 'utf8')).overlayVersion, 2);
  calls.length = 0;
  assert.equal((await bootstrap.ensure(root)).reused, true);
  assert.deepEqual(calls, [], 'a current overlay is not applied twice');
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
  await fs.writeFile(path.join(external, 'mcp', 'bridge_mcp.py'), windowsBridgeFixture());
  await fs.mkdir(path.join(external, 'skills', 'local-computer'), { recursive: true });
  await fs.writeFile(path.join(external, 'skills', 'local-computer', 'SKILL.md'), WINDOWS_SKILL_FIXTURE);
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
  assert.equal(candidates[2], path.resolve('/repo/Project Web Pilot', '..', 'Codex Local Mac', 'Windows-Codex-Local-2026-09-10.zip'));
});


test('Windows lifecycle adapter declares contract v2 and recognizes pinned legacy source', async () => {
  assert.equal(WINDOWS_RUNTIME_CONTROL_CONTRACT, 2);
  assert.match(WINDOWS_LEGACY_CONTROL_SHA256, /^[0-9a-f]{64}$/);
  const source = await fs.readFile(windowsControl, 'utf8');
  assert.match(source, /RUNTIME_CONTRACT = 2/);
  assert.match(source, /WEB_PILOT_RUNTIME_ROOT/);
  assert.match(source, /runtime-endpoints\.json/);
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

// First-run worker boundaries are checked with fixture values only.
import { configureWindowsTunnel, windowsWorkflowEnvironment } from '../src/windows-runtime.mjs';
test('Windows first run passes credentials only over stdin and strips worker failures', async () => {
  const secret = 'sk-fixture_only_1234567890', id = 'tunnel_fixture1234567890123456';
  const calls = [];
  const options = { folder: 'C:\\Pilot\\runtime', controlSourceFile: '/fixture/windows-control.py', environment: {},
    credentials: { tunnelId: id, key: secret },
    executeInput: async (file, args, settings, input) => {
      calls.push({ file, args, settings });
      assert.deepEqual(JSON.parse(input), { tunnel_id: id, api_key: secret });
      assert.equal(settings.windowsHide, true);
      assert.equal(settings.env.PYTHONUTF8, '1');
      assert.equal(settings.env.PYTHONDONTWRITEBYTECODE, '1');
      assert.equal(settings.env.WEB_PILOT_RUNTIME_ROOT, 'C:\\Pilot\\runtime');
      return { stdout: '{"configured":true}' };
    } };
  assert.deepEqual(await configureWindowsTunnel(options), { configured: true });
  assert.doesNotMatch(JSON.stringify(calls), /sk-fixture|tunnel_fixture/);
  await assert.rejects(configureWindowsTunnel({ ...options, executeInput: async () => {
    throw { message: secret, stderr: secret, stdout: secret };
  } }), error => error.code === 'WINDOWS_TUNNEL_SETUP_FAILED' && !JSON.stringify(error).includes(secret));
  await assert.rejects(configureWindowsTunnel({ ...options, credentials: { tunnelId: 42 } }), { code: 'WINDOWS_TUNNEL_INVALID_DATA' });
});
test('Windows first run supports cancellation and manual key entry with an already copied ID', async () => {
  let inputs = 0;
  const base = { folder: 'C:\\Pilot', controlSourceFile: '/fixture/windows-control.py', environment: {},
    execute: async (file, args) => { assert.equal(args.includes('--stdin'), false); return { stdout: '{"cancelled":true}' }; },
    executeInput: async (file, args, settings, input) => {
      inputs++; assert.deepEqual(JSON.parse(input), { tunnel_id: 'tunnel_fixture1234567890123456' });
      return { stdout: '{"cancelled":true}' };
    } };
  assert.deepEqual(await configureWindowsTunnel(base), { cancelled: true });
  assert.deepEqual(await configureWindowsTunnel({ ...base, credentials: { tunnelId: 'tunnel_fixture1234567890123456' } }), { cancelled: true });
  assert.equal(inputs, 1);
});
test('Windows workflow receives a complete portable Git environment and rejects moved or foreign tools', () => {
  const folder = 'C:\\Users\\Pilot\\App Data\\runtime';
  const locations = { package_root: folder, git: folder + '\\tools\\git\\cmd\\git.exe' };
  const env = windowsWorkflowEnvironment(folder, locations, { Path: 'C:\\Windows\\System32' });
  assert.equal(env.WORKFLOW_GIT_BIN, locations.git);
  assert.equal(env.WORKFLOW_GIT_HOME, folder + '\\tools\\git');
  assert.equal(env.Path, `${folder}\\tools\\git\\cmd;${folder}\\tools\\git\\usr\\bin;C:\\Windows\\System32`);
  assert.throws(() => windowsWorkflowEnvironment(folder, { ...locations, git: 'C:\\foreign\\git.exe' }), { code: 'WINDOWS_GIT_LAYOUT_INVALID' });
  assert.throws(() => windowsWorkflowEnvironment(folder, { ...locations, package_root: 'D:\\Moved' }), { code: 'WINDOWS_GIT_LAYOUT_INVALID' });
});


test('Windows build launcher uses the canonical bundled Node folder', async () => {
  const launcher = await fs.readFile(new URL('../BUILD_WINDOWS.cmd', import.meta.url), 'utf8');
  const folder = windowsToolchainPaths('/repo').nodeFolder;
  assert.equal(path.basename(folder), 'node-v' + BUNDLED_NODE_VERSION + '-win-x64');
  assert.ok(launcher.includes('windows-node\\' + path.basename(folder)));
});
