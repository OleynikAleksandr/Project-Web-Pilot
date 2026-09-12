import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { WINDOWS_RUNTIME_SHA256, sha256File, windowsRuntimePaths, windowsExpandInvocation, windowsSetupInvocation } from '../src/windows-runtime.mjs';
import { bundledWindowsRuntimeFolder } from '../src/platform.mjs';

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
