import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const execute = promisify(execFile);
const helper = fileURLToPath(new URL('../resources/runtime-control/mac-first-run.py', import.meta.url));
const control = fileURLToPath(new URL('../resources/runtime-control/mac-control.py', import.meta.url));
async function run(t, script) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'pilot-tunnel-gui-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  return execute('python3', ['-c', [
    'import runpy,json,pathlib,os',
    'h=runpy.run_path(' + JSON.stringify(helper) + ',run_name="helper_test")',
    'c=runpy.run_path(' + JSON.stringify(control) + ',run_name="control_test")',
    script,
  ].join('\n')], { env: { ...process.env, WEB_PILOT_RUNTIME_ROOT: root,
    CODEX_LOCAL_MAC_STATE_DIR: path.join(root, 'state'), PYTHONDONTWRITEBYTECODE: '1' }, timeout: 10000 });
}
test('cancelling native password entry changes no private configuration', async t => {
  const { stdout } = await run(t, [
    'def ask(message, hidden=False):',
    '    if hidden: raise h["Cancelled"]()',
    '    return "tunnel_fixture1234567890123456"',
    'try: h["configure"](c,ask)',
    'except h["Cancelled"]: pass',
    'print(json.dumps({"key":c["KEY_FILE"].exists(),"profile":c["PROFILE"].exists()}))',
  ].join('\n'));
  assert.deepEqual(JSON.parse(stdout), { key: false, profile: false });
});
test('native helper returns no key and writes it only to a private file', async t => {
  const { stdout, stderr } = await run(t, [
    'key="fixture-only-secret-value"',
    'def ask(message, hidden=False):',
    '    return key if hidden else "tunnel_fixture1234567890123456"',
    'result=h["configure"](c,ask)',
    'saved=c["KEY_FILE"].read_text().strip()==key',
    'mode=c["KEY_FILE"].stat().st_mode & 0o777',
    'profile=c["PROFILE"].read_text()',
    'print(json.dumps({"result":result,"saved":saved,"mode":mode,"profileHasSecret":key in profile}))',
  ].join('\n'));
  assert.deepEqual(JSON.parse(stdout), { result: { configured: true }, saved: true, mode: 0o600, profileHasSecret: false });
  assert.doesNotMatch(stdout + stderr, /fixture-only-secret-value/);
});
test('invalid tunnel identity does not leave a key behind', async t => {
  const { stdout } = await run(t, [
    'def ask(message, hidden=False):',
    '    return "fixture-only-secret-value" if hidden else "bad-id"',
    'try: h["configure"](c,ask)',
    'except ValueError: pass',
    'print(json.dumps({"key":c["KEY_FILE"].exists(),"profile":c["PROFILE"].exists()}))',
  ].join('\n'));
  assert.deepEqual(JSON.parse(stdout), { key: false, profile: false });
});
