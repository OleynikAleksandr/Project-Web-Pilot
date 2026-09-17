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
  return { document, api, calls, emit, settle: () => new Promise(r => setImmediate(r)) };
}
test('new account route is explicit and cannot pass as authenticated guest chat', async t => {
  const f = await fixture(t);
  assert.equal(f.document.querySelector('#startup-panel').hidden, false);
  const signup = f.document.querySelector('[data-startup=signup]');
  assert.match(signup.textContent, /нет аккаунта/); signup.click(); await f.settle();
  assert.deepEqual(f.calls, [], 'explaining registration must not reload an already visible login page');
  assert.equal(f.document.querySelector('#startup-signup-help').hidden, false);
  assert.equal(f.document.querySelector('#startup-continue').disabled, true);
  assert.equal(f.document.querySelector('#startup-project-body').hidden, true);
});
test('pending first connection cannot be restarted but final failure can be retried', async t => {
  const f = await fixture(t, { page: 'slow', busy: true, account: 'unknown' });
  assert.match(f.document.querySelector('#startup-account-status').textContent, /двух минут/);
  const button = f.document.querySelector('[data-startup=chat]');
  assert.equal(button.disabled, true); button.click(); await f.settle();
  assert.deepEqual(f.calls, []);
  assert.equal(f.document.querySelector('#startup-copy-diagnostics').disabled, false);
  f.emit({ page: 'failed', pageError: 'PAGE_RESPONSE_TIMEOUT' });
  assert.match(f.document.querySelector('#startup-account-status').textContent, /не ответил за две минуты/);
  assert.equal(button.disabled, false); button.click(); await f.settle();
  assert.deepEqual(f.calls, ['chat']);
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

test('blank pages never direct the user to missing login controls and expose a copyable report', async t => {
  const f = await fixture(t, { page: 'loading', account: 'unknown' });
  for (const page of ['idle', 'loading', 'slow', 'failed', 'loaded']) {
    f.emit({ page, account: 'unknown' });
    assert.equal(f.document.querySelector('#startup-account-instructions').hidden, true);
    assert.equal(f.document.querySelector('#startup-signup').hidden, true);
    assert.equal(f.document.querySelector('#startup-account-check').hidden, true);
  }
  const copy = f.document.querySelector('#startup-copy-diagnostics');
  assert.equal(copy.hidden, false); assert.equal(copy.disabled, false);
  copy.click(); await f.settle();
  assert.deepEqual(f.calls, ['copy-diagnostics']);
  assert.equal(f.document.querySelector('#startup-diagnostics-copied').hidden, false);
  f.emit({ page: 'loaded', account: 'signed-out' });
  assert.equal(f.document.querySelector('#startup-account-instructions').hidden, false);
  assert.equal(f.document.querySelector('#startup-signup').hidden, false);
  assert.equal(f.document.querySelector('#startup-account-check').hidden, false);
  assert.equal(copy.hidden, false, 'success must still allow copying the first-request report');
});
test('specific browser error is explained and report failures never claim successful copying', async t => {
  const f = await fixture(t, { page: 'failed', account: 'unknown', pageError: 'ERR_NAME_NOT_RESOLVED' });
  assert.match(f.document.querySelector('#startup-account-status').textContent, /Не удалось найти адрес/);
  f.api.startup = async () => ({ ok: false, error: { message: 'Не удалось прочитать журнал.' } });
  f.document.querySelector('#startup-copy-diagnostics').click(); await f.settle();
  assert.equal(f.document.querySelector('#startup-diagnostics-copied').hidden, true);
  assert.match(f.document.querySelector('#startup-error').textContent, /Не удалось прочитать журнал/);
});
test('diagnostics stay available while retry is waiting for a network response', async t => {
  const f = await fixture(t, { page: 'failed', account: 'unknown' });
  let finish;
  f.api.startup = action => action === 'chat' ? new Promise(resolve => { finish = resolve; }) : Promise.resolve({ ok: true });
  f.document.querySelector('#startup-open-chat').click();
  const copy = f.document.querySelector('#startup-copy-diagnostics');
  assert.equal(copy.disabled, false); copy.click(); await f.settle();
  assert.equal(f.document.querySelector('#startup-diagnostics-copied').hidden, false);
  finish({ ok: true }); await f.settle();
});

test('loading copy remains available and a loaded unknown screen is not described as absent', async t => {
  const f = await fixture(t, { page: 'loading', account: 'unknown' });
  assert.equal(f.document.querySelector('#startup-copy-diagnostics').hidden, false);
  assert.equal(f.document.querySelector('#startup-open-chat').disabled, true);
  f.emit({ page: 'loaded' });
  assert.match(f.document.querySelector('#startup-account-status').textContent, /Страница открыта/);
  assert.equal(f.document.querySelector('#startup-open-chat').disabled, false);
});
