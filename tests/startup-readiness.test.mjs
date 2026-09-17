import { test } from 'node:test';
import assert from 'node:assert/strict';
import { StartupReadiness, inspectMacGit, installMacGit } from '../src/startup-readiness.mjs';
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

import { JSDOM } from 'jsdom';
import { accountObservation, offerMacInstallation } from '../src/startup-readiness.mjs';
test('guest composer is not proof of login; visible account marker is required', () => {
  const dom = new JSDOM('<textarea id="prompt-textarea"></textarea>', { runScripts: 'outside-only' });
  dom.window.HTMLElement.prototype.getClientRects = function() { return this.hidden ? [] : [{}]; };
  const inspect = () => JSON.parse(JSON.stringify(dom.window.eval('(' + accountObservation.toString() + ')()')));
  assert.deepEqual(inspect(), { login: false, authenticated: false });
  dom.window.document.body.insertAdjacentHTML('beforeend', '<button aria-label="Open Profile Menu"></button>');
  assert.equal(inspect().authenticated, true);
  dom.window.document.body.insertAdjacentHTML('beforeend', '<button data-testid="login-button"></button>');
  assert.equal(inspect().authenticated, false);
  dom.window.close();
});
test('existing profile and installation cancellation never move the app', async () => {
  let moved = 0, prompted = 0;
  const app = { isInApplicationsFolder: () => false, moveToApplicationsFolder: () => { moved++; return true; } };
  const dialog = { showMessageBox: async () => { prompted++; return { response: 1 }; } };
  assert.equal(await offerMacInstallation({ app, dialog, fresh: false }), false);
  assert.equal(prompted, 0);
  assert.equal(await offerMacInstallation({ app, dialog, fresh: true }), false);
  assert.equal(prompted, 1); assert.equal(moved, 0);
});
test('an installation conflict cannot silently replace another app', async () => {
  let replaced = false;
  const app = { isInApplicationsFolder: () => false, moveToApplicationsFolder: ({ conflictHandler }) => {
    replaced = conflictHandler('exists'); return replaced;
  } };
  const dialog = { showMessageBox: async () => ({ response: 0 }), showMessageBoxSync: () => 1 };
  assert.equal(await offerMacInstallation({ app, dialog, fresh: true }), false);
  assert.equal(replaced, false);
});

test('Apple installer is activated after launch; repeated clicks share the same handoff', async () => {
  let launched;
  const calls = [];
  const f = fixture({ probeGit: async () => false, installGit: () => installMacGit(async (command, args) => {
    calls.push({ command, args });
    if (command === '/usr/bin/xcode-select') await new Promise(resolve => { launched = resolve; });
  }) });
  await f.flow.check();
  const first = f.flow.install(), second = f.flow.install();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(calls.length, 1, 'do not activate the helper before the install request succeeds');
  assert.equal(f.flow.snapshot().busy, true);
  launched(); await Promise.all([first, second]);
  assert.deepEqual(calls, [
    { command: '/usr/bin/xcode-select', args: ['--install'] },
    { command: '/usr/bin/open', args: ['-a', '/System/Library/CoreServices/Install Command Line Developer Tools.app'] },
  ]);
  assert.equal(f.flow.snapshot().phase, 'git-installing');
  assert.equal(f.flow.snapshot().git, false, 'showing the installer is not proof of installation');
});
test('failed Apple installation request does not activate the helper', async () => {
  const calls = [];
  await assert.rejects(installMacGit(async command => {
    calls.push(command); throw new Error('private command details');
  }), error => /Не удалось открыть установку Apple/.test(error.publicMessage));
  assert.deepEqual(calls, ['/usr/bin/xcode-select']);
});
test('failed installer activation offers visible recovery and a fresh retry', async () => {
  let failed = true;
  const f = fixture({ probeGit: async () => false, installGit: () => installMacGit(async command => {
    if (command === '/usr/bin/open' && failed) throw new Error('private launch error');
  }) });
  await f.flow.check(); await f.flow.install();
  assert.equal(f.flow.snapshot().phase, 'error');
  assert.match(f.flow.snapshot().error, /Сверните Web Pilot жёлтой кнопкой/);
  assert.doesNotMatch(f.flow.snapshot().error, /private launch error/);
  assert.equal(f.flow.snapshot().git, false);
  failed = false; await f.flow.install();
  assert.equal(f.flow.snapshot().phase, 'git-installing');
  assert.equal(f.flow.snapshot().error, null);
});

test('known setup error explains the cause, preserves installed Git and supports retry without leaking stderr', async () => {
 let failed = true;
 const f = fixture({ inspectRuntime: async () => {
  if (failed) throw Object.assign(new Error('private sk-runtime-secret'), {code:'MAC_RUNTIME_EXTERNAL_MODIFIED',stderr:'private token'});
  return {mcp:{ready:true},tunnel:{ready:false,configured:false}};
 } });
 await f.flow.check();
 assert.equal(f.flow.snapshot().git,true);
 assert.equal(f.flow.snapshot().phase,'error');
 assert.match(f.flow.snapshot().error,/MAC_RUNTIME_EXTERNAL_MODIFIED/);
 assert.doesNotMatch(f.flow.snapshot().error,/интернет|private|sk-runtime/);
 failed=false;await f.flow.check();
 assert.equal(f.flow.snapshot().error,null);
 assert.equal(f.flow.snapshot().runtime,true);
 assert.equal(f.flow.snapshot().phase,'tunnel');
});
test('unknown preparation errors do not blame the network or publish an arbitrary error code', async () => {
 const f=fixture({inspectRuntime:async()=>{throw Object.assign(new Error('private error'),{code:'private-secret-code'});}});
 await f.flow.check();
 assert.match(f.flow.snapshot().error,/Проверить и продолжить/);
 assert.doesNotMatch(f.flow.snapshot().error,/private|интернет/);
});
