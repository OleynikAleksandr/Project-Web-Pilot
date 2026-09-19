import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MacRuntimeBootstrap } from '../src/mac-runtime.mjs';
import { WindowsRuntimeBootstrap, configureWindowsTunnel } from '../src/windows-runtime.mjs';
const identity = 'tunnel_fixture1234567890123456';
for (const platform of ['mac', 'windows']) test(`${platform}: ID dialog facade validates non-secret output and sanitizes failures`, async t => {
  let output = { tunnel_id: identity }, failure;
  const calls = [];
  const execute = async (file, args, options) => {
    calls.push({ file, args, options });
    assert.equal(args.at(-1), '--tunnel-id');
    assert.doesNotMatch(JSON.stringify({ args, options }), /sk-fixture|tunnel_fixture/);
    if (failure) throw failure;
    return { stdout: JSON.stringify(output) };
  };
  const executeInput = async () => { throw new Error('ID dialog must not pass credentials'); };
  let invoke;
  if (platform === 'mac') {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'pilot-id-runtime-'));
    t.after(() => fs.rm(root, { recursive: true, force: true }));
    const folder = path.join(root, 'runtime');
    const control = fileURLToPath(new URL('../resources/runtime-control/mac-control.py', import.meta.url));
    await fs.mkdir(path.join(folder, '.venv', 'bin'), { recursive: true });
    await fs.copyFile(control, path.join(folder, 'control.py'));
    await fs.writeFile(path.join(folder, '.venv', 'bin', 'python3'), 'fixture');
    const bootstrap = new MacRuntimeBootstrap({ payloadFile: path.join(root, 'unused.zip'), controlSourceFile: control,
      dataDir: path.join(root, 'app'), preferredFolder: folder, platform: 'darwin', environment: {}, execute, executeInput });
    invoke = () => bootstrap.promptTunnelId();
  } else {
    invoke = () => configureWindowsTunnel({ folder: 'C:\\Pilot', controlSourceFile: '/fixture/windows-control.py',
      environment: {}, idOnly: true, execute, executeInput });
    const bootstrap = new WindowsRuntimeBootstrap({ platform: 'win32', payloadFile: '/fixture/unused.zip', dataDir: '/fixture/app' });
    bootstrap.configureTunnel = (credentials, options) => { assert.equal(credentials, undefined); assert.deepEqual(options, { idOnly: true }); };
    bootstrap.promptTunnelId();
  }
  assert.deepEqual(await invoke(), { tunnelId: identity });
  output = { cancelled: true }; assert.deepEqual(await invoke(), { cancelled: true });
  for (const result of [{ configured: true }, { tunnel_id: 'sk-fixture-private' }, { tunnel_id: null }]) {
    output = result;
    await assert.rejects(invoke(), error => !error.message.includes('sk-fixture'));
  }
  failure = { stderr: JSON.stringify({ ok: false, code: platform.toUpperCase() + '_TUNNEL_ID_INVALID' }) };
  await assert.rejects(invoke(), error => /полный ID туннеля/.test(error.publicMessage));
  failure = { stderr: 'sk-fixture-private' };
  await assert.rejects(invoke(), error => !error.message.includes('sk-fixture'));
  assert.equal(calls.length, 7);
});
