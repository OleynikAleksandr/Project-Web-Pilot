import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { JSDOM } from 'jsdom';
import { createStartupView } from '../src/ui/startup.mjs';
async function fixture(t, startup = {}) {
  const html = await fs.readFile(new URL('../src/ui/index.html', import.meta.url), 'utf8');
  const dom = new JSDOM(html, { url: 'https://fixture.invalid/' });
  t.after(() => dom.window.close());
  const document = dom.window.document, calls = [];
  let state = { startup: { active: true, phase: 'git', node: true, git: false, runtime: false,
    tunnel: false, busy: false, account: 'signed-out', page: 'loaded', ...startup } };
  const api = {
    startup: async action => { calls.push(action); return { ok: true, state }; },
    beginCreate: async () => { calls.push('beginCreate'); return { ok: true, state: { ...state, setup: { phase: 'form' } } }; },
  };
  const view = createStartupView({ document, api });
  const emit = patch => { state = { ...state, startup: { ...state.startup, ...patch } }; view.render(state); };
  view.render(state);
  return { document, calls, emit, settle: () => new Promise(r => setImmediate(r)) };
}
test('new account route is explicit and cannot pass as authenticated guest chat', async t => {
  const f = await fixture(t);
  assert.equal(f.document.querySelector('#startup-panel').hidden, false);
  const signup = f.document.querySelector('[data-startup=signup]');
  assert.match(signup.textContent, /нет аккаунта/); signup.click(); await f.settle();
  assert.deepEqual(f.calls, ['signup']);
  assert.equal(f.document.querySelector('#startup-signup-help').hidden, false);
  assert.equal(f.document.querySelector('#startup-continue').disabled, true);
  assert.equal(f.document.querySelector('#startup-project-body').hidden, true);
});
test('slow or failed web load retains a working retry while runtime is busy', async t => {
  const f = await fixture(t, { page: 'slow', busy: true });
  assert.match(f.document.querySelector('#startup-account-status').textContent, /дольше обычного/);
  assert.equal(f.document.querySelector('[data-startup=chat]').disabled, false);
  f.document.querySelector('[data-startup=chat]').click(); await f.settle();
  assert.deepEqual(f.calls, ['chat']);
  f.emit({ page: 'failed' }); assert.match(f.document.querySelector('#startup-account-status').textContent, /не открылась/);
});
test('missing Apple component has one installation action and keeps later steps unavailable', async t => {
  const f = await fixture(t, { account: 'signed-in' });
  const install = f.document.querySelector('#startup-install-git');
  assert.equal(install.hidden, false); assert.equal(install.disabled, false);
  install.click(); await f.settle(); assert.deepEqual(f.calls, ['install-git']);
  assert.equal(f.document.querySelector('#startup-tunnel-body').hidden, true);
  f.emit({ phase: 'git-installing' });
  assert.equal(install.hidden, true, 'wait for system installation, then verify; do not reopen installer');
});
test('tunnel instructions include account access and never ask for a key in the renderer', async t => {
  const f = await fixture(t, { account: 'signed-in', git: true, runtime: true });
  assert.equal(f.document.querySelector('#startup-tunnel-body').hidden, false);
  assert.match(f.document.querySelector('#startup-tunnel-body').textContent, /завершите регистрацию/);
  assert.match(f.document.querySelector('#startup-tunnel-body').textContent, /Read.*Manage/);
  assert.equal(f.document.querySelectorAll('#startup-panel input').length, 0);
  f.document.querySelector('[data-startup=configure-tunnel]').click(); await f.settle();
  assert.deepEqual(f.calls, ['configure-tunnel']);
});
test('only confirmed login and local readiness expose the first project; transition preserves setup', async t => {
  const f = await fixture(t, { account: 'unknown', git: true, runtime: true, tunnel: true });
  assert.equal(f.document.querySelector('#startup-project-body').hidden, true);
  f.emit({ account: 'signed-in' });
  assert.equal(f.document.querySelector('#startup-project-body').hidden, false);
  f.document.querySelector('#startup-continue').click(); await f.settle();
  assert.deepEqual(f.calls, ['continue', 'beginCreate']);
  assert.equal(f.document.querySelector('#startup-panel').hidden, true);
});
