import { test } from 'node:test';
import assert from 'node:assert/strict';
import { StartupReadiness, inspectMacGit } from '../src/startup-readiness.mjs';
const service = { mcp: { ready: true }, tunnel: { configured: true, ready: true } };
function fixture(overrides = {}) {
  const calls = [], updates = [];
  const flow = new StartupReadiness({
    probeNode: async () => '/bundled/node', probeGit: async () => true,
    inspectRuntime: async () => null, prepareRuntime: async () => { calls.push('prepare'); return service; },
    installGit: async () => { calls.push('install'); }, configureTunnel: async () => ({ cancelled: true }),
    onChange: state => updates.push(state), ...overrides,
  });
  return { flow, calls, updates };
}
test('inspection on a clean Mac never invokes the Git shim or installer', async () => {
  const calls = [];
  const ready = await inspectMacGit(async command => { calls.push(command); throw new Error('no developer directory'); });
  assert.equal(ready, false); assert.deepEqual(calls, ['/usr/bin/xcode-select']);
});
test('missing Git is actionable, retry prepares runtime and does not invent an account login', async () => {
  let installed = false;
  const f = fixture({ probeGit: async () => installed });
  await f.flow.check({ prepare: true });
  assert.equal(f.flow.snapshot().phase, 'git'); assert.deepEqual(f.calls, []);
  await f.flow.install(); assert.deepEqual(f.calls, ['install']);
  assert.equal(f.flow.snapshot().phase, 'git-installing');
  installed = true; await f.flow.check({ prepare: true });
  assert.deepEqual(f.calls, ['install', 'prepare']);
  assert.equal(f.flow.snapshot().phase, 'connected');
  assert.equal(f.flow.snapshot().account, 'unknown');
});
test('cancelled tunnel setup never starts or configures a tunnel', async () => {
  const f = fixture();
  await f.flow.configure();
  assert.equal(f.flow.snapshot().phase, 'tunnel'); assert.deepEqual(f.calls, []);
});
test('page timeout and stale completion are distinct from component readiness', () => {
  let timeout;
  const f = fixture({ schedule: fn => { timeout = fn; return 1; }, cancel: () => {} });
  f.flow.beginPage(1); timeout(); assert.equal(f.flow.snapshot().page, 'slow');
  f.flow.beginPage(2); f.flow.finishPage(1, 'ERR_FAILED');
  assert.equal(f.flow.snapshot().page, 'loading');
  f.flow.finishPage(2); f.flow.observe(2, { login: true, authenticated: false });
  assert.equal(f.flow.snapshot().account, 'signed-out');
  f.flow.observe(1, { authenticated: true }); assert.equal(f.flow.snapshot().account, 'signed-out');
  f.flow.dispose();
});
test('parallel clicks share one operation; late results after disposal are ignored', async () => {
  let resolve;
  const f = fixture({ prepareRuntime: () => new Promise(r => { resolve = r; }) });
  const a = f.flow.check({ prepare: true });
  const b = f.flow.check({ prepare: true });
  await new Promise(r => setImmediate(r));
  f.flow.dispose(); const n = f.updates.length;
  resolve(service); await Promise.all([a, b]);
  assert.equal(f.updates.length, n);
  assert.equal(f.flow.snapshot().runtime, false);
});
test('raw runtime errors never leak commands or secrets into public state', async () => {
  const f = fixture({ inspectRuntime: async () => { throw new Error('secret command sk-example-value'); } });
  await f.flow.check(); assert.equal(f.flow.snapshot().phase, 'error');
  assert.doesNotMatch(JSON.stringify(f.flow.snapshot()), /sk-example-value/);
});
