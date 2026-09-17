import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { openStartupPage } from '../src/browser-startup.mjs';

const url = 'https://chatgpt.com/';
function fixture(load) {
  const wc = new EventEmitter();
  wc.calls = []; wc.url = '';
  wc.getURL = () => wc.url;
  wc.stop = () => wc.calls.push('stop');
  wc.session = {
    closeAllConnections: async () => { wc.calls.push('connections'); },
    clearHostResolverCache: async () => { wc.calls.push('dns'); },
  };
  wc.loadURL = target => { wc.calls.push('load'); return load(wc, target); };
  return wc;
}
const options = { timeoutMs: 20, resetTimeoutMs: 20 };
function ready(wc) { wc.url = url; wc.emit('did-frame-navigate', {}, url, 200, 'OK', true); wc.emit('dom-ready'); }

test('first DOM is usable while resource loading remains pending', async () => {
  const wc = fixture(wc => { queueMicrotask(() => ready(wc)); return new Promise(() => {}); });
  assert.deepEqual(await openStartupPage(wc, url, options), { recovered: false });
  assert.deepEqual(wc.calls, ['load']);
  assert.equal(wc.listenerCount('dom-ready'), 0);
});

test('first response timeout resets only connections and DNS, then opens once', async () => {
  let count = 0, recoveries = 0;
  const wc = fixture(wc => { if (++count === 2) queueMicrotask(() => ready(wc)); return new Promise(() => {}); });
  assert.deepEqual(await openStartupPage(wc, url, { ...options, onRecovery: () => recoveries++ }), { recovered: true });
  assert.equal(recoveries, 1);
  assert.deepEqual(wc.calls, ['load', 'stop', 'connections', 'dns', 'load']);
});

test('permanent first response failure ends after one recovery', async () => {
  const wc = fixture(() => new Promise(() => {}));
  await assert.rejects(openStartupPage(wc, url, options), { code: 'PAGE_RESPONSE_TIMEOUT' });
  assert.deepEqual(wc.calls, ['load', 'stop', 'connections', 'dns', 'load', 'stop']);
  assert.equal(wc.listenerCount('dom-ready'), 0);
});

test('a committed document is not discarded if DOM preparation is slow', async () => {
  const wc = fixture(wc => {
    queueMicrotask(() => { wc.url = url; wc.emit('did-frame-navigate', {}, url, 200, 'OK', true); });
    return new Promise(() => {});
  });
  await assert.rejects(openStartupPage(wc, url, options), { code: 'PAGE_DOCUMENT_TIMEOUT' });
  assert.deepEqual(wc.calls, ['load']);
});

test('an immediate certificate error is returned without retry', async () => {
  const wc = fixture(() => Promise.reject(Object.assign(new Error('certificate'), { code: 'ERR_CERT_DATE_INVALID' })));
  await assert.rejects(openStartupPage(wc, url, options), { code: 'ERR_CERT_DATE_INVALID' });
  assert.deepEqual(wc.calls, ['load']);
});

test('superseded navigation leaves the new request untouched', async () => {
  let current = true;
  const wc = fixture(() => { queueMicrotask(() => { current = false; }); return new Promise(() => {}); });
  await assert.rejects(openStartupPage(wc, url, { ...options, isCurrent: () => current }), { code: 'NAVIGATION_SUPERSEDED' });
  assert.deepEqual(wc.calls, ['load']);
  assert.equal(wc.listenerCount('dom-ready'), 0);
});

test('superseded recovery does not clear DNS or start another navigation', async () => {
  let current = true;
  const wc = fixture(() => new Promise(() => {}));
  wc.session.closeAllConnections = async () => { wc.calls.push('connections'); current = false; };
  await assert.rejects(openStartupPage(wc, url, { ...options, isCurrent: () => current }), { code: 'NAVIGATION_SUPERSEDED' });
  assert.deepEqual(wc.calls, ['load', 'stop', 'connections']);
});

test('a stalled connection reset is bounded', async () => {
  const wc = fixture(() => new Promise(() => {}));
  wc.session.closeAllConnections = () => new Promise(() => {});
  await assert.rejects(openStartupPage(wc, url, options), { code: 'PAGE_CONNECTION_RESET_TIMEOUT' });
  assert.deepEqual(wc.calls, ['load', 'stop']);
});

test('initial about:blank DOM does not complete a remote opening', async () => {
  const wc = fixture(wc => {
    queueMicrotask(() => { wc.url = 'about:blank'; wc.emit('dom-ready'); });
    return new Promise(() => {});
  });
  await assert.rejects(openStartupPage(wc, url, options), { code: 'PAGE_RESPONSE_TIMEOUT' });
  assert.deepEqual(wc.calls, ['load']);
});

test('a late connection reset cannot continue after its timeout', async () => {
  let finishReset;
  const wc = fixture(() => new Promise(() => {}));
  wc.session.closeAllConnections = () => new Promise(resolve => { finishReset = resolve; });
  await assert.rejects(openStartupPage(wc, url, options), { code: 'PAGE_CONNECTION_RESET_TIMEOUT' });
  finishReset();
  await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(wc.calls, ['load', 'stop']);
});
