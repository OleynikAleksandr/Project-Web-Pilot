import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { collectHistory, ConversationHistory, historyRequest } from '../src/conversation-history.mjs';

const message = (id, text = id) => ({ id, author: { role: 'user' }, content: { content_type: 'text', parts: [text] } });
const page = (messages, cursor = null) => ({ messages, page_info: { has_previous_page: cursor !== null, start_cursor: cursor } });
const url = 'https://chatgpt.com/c/conversation-a';
const endpoint = 'https://chatgpt.com/backend-api/conversations/conversation-a?num_turns=2';

test('load all pages, overlap once, include recovery and tool text absent from DOM', async () => {
  const progress = [];
  const result = await collectHistory(page([message('latest')], 'p2'), async cursor => {
    if (cursor === 'p2') return page([message('middle'), message('latest', 'stale overlap')], 'p1');
    assert.equal(cursor, 'p1');
    return page([message('first', 'recovery '.repeat(20000)), { id: 'tool', author: { role: 'tool' },
      content: { content_type: 'text', parts: ['tool result', { content_type: 'image_asset_pointer', asset_pointer: 'PRIVATE-URL' }] } }]);
  }, { onProgress: value => progress.push(value) });
  assert.equal(result.pages, 3);
  assert.equal(result.complete, true);
  assert.equal(result.messages.length, 4);
  assert.equal(result.messages.find(m => m.id === 'user:latest').text, 'latest');
  assert.equal(result.messages.find(m => m.id === 'user:first').text.length, 180000);
  assert.equal(JSON.stringify(result).includes('PRIVATE-URL'), false);
  assert.deepEqual(progress.map(p => p.messageCount), [1, 2, 4]);
});

test('unknown schema, missing cursor, loop, HTTP failure and cancellation never declare completeness', async () => {
  await assert.rejects(collectHistory({ messages: [] }, async () => {}), { code: 'HISTORY_SCHEMA' });
  await assert.rejects(collectHistory({ messages: [], page_info: { has_previous_page: true } }, async () => {}), { code: 'HISTORY_CURSOR' });
  await assert.rejects(collectHistory(page([], 'same'), async () => page([], 'same')), { code: 'HISTORY_CURSOR_LOOP' });
  await assert.rejects(collectHistory(page([], 'next'), async () => { throw Error('offline'); }), /offline/);
  const abort = new AbortController(); abort.abort();
  await assert.rejects(collectHistory(page([]), async () => {}, { signal: abort.signal }), { code: 'HISTORY_CANCELLED' });
});

test('history URL match is exact, same origin, same selected conversation', () => {
  assert.equal(historyRequest(endpoint, url).turns, 2);
  for (const wrong of [endpoint.replace('chatgpt.com', 'evil.test'), endpoint.replace('conversation-a', 'conversation-b'),
    endpoint.replace('?num_turns=2', '/messages'), 'https://chatgpt.com/backend-api/conversations']) {
    assert.equal(historyRequest(wrong, url), null);
  }
});

function fixture(fetch) {
  const debug = new EventEmitter();
  let active = url;
  debug.sendCommand = async () => ({ body: JSON.stringify(page([message('latest')], 'earlier')) });
  const contents = { debugger: debug, session: { fetch } };
  const history = new ConversationHistory(contents, { activeUrl: () => active });
  const emit = () => {
    debug.emit('message', {}, 'Network.requestWillBeSent', { requestId: 'r1', request: {
      method: 'GET', url: endpoint, headers: { Authorization: 'SECRET', Cookie: 'DO-NOT-COPY', 'Chatgpt-Account-Id': 'ACCOUNT' } } });
    debug.emit('message', {}, 'Network.responseReceived', { requestId: 'r1', response: { url: endpoint, status: 200, mimeType: 'application/json' } });
    debug.emit('message', {}, 'Network.loadingFinished', { requestId: 'r1' });
  };
  return { history, emit, change: () => { active = url.replace('-a', '-b'); history.reset(); } };
}
async function settled(history) {
  for (let i = 0; i < 100 && history.view().status === 'loading'; i++) await new Promise(resolve => setTimeout(resolve, 2));
}

test('native GET auth remains in memory; only same conversation pagination; snapshot consumed once', async t => {
  let count = 0;
  const f = fixture(async (raw, options) => {
    count++;
    const request = new URL(raw);
    assert.equal(request.origin, 'https://chatgpt.com');
    assert.equal(request.pathname, '/backend-api/conversations/conversation-a/messages');
    assert.equal(request.searchParams.get('before'), 'earlier');
    assert.equal(options.headers.Authorization, 'SECRET');
    assert.equal(options.headers.Cookie, undefined);
    assert.equal(options.redirect, 'error');
    return new Response(JSON.stringify(page([message('first')])), { status: 200 });
  });
  t.after(() => f.history.close());
  f.emit();
  await settled(f.history);
  assert.equal(f.history.view().status, 'ready');
  assert.equal(count, 1);
  assert.equal(f.history.pendingSnapshot().messages.length, 2);
  assert.equal(JSON.stringify(f.history.view()).includes('SECRET'), false);
  f.history.acknowledge(f.history.pendingSnapshot().revision);
  assert.equal(f.history.pendingSnapshot(), null);
});

test('switching conversations discards in-flight response, 401 stops without false result', async t => {
  let release;
  const f = fixture(() => new Promise(resolve => { release = resolve; }));
  t.after(() => f.history.close());
  f.emit();
  await new Promise(resolve => setTimeout(resolve, 5));
  f.change();
  release(new Response(JSON.stringify(page([message('first')]))));
  await new Promise(resolve => setTimeout(resolve, 5));
  assert.equal(f.history.pendingSnapshot(), null);
  const denied = fixture(async () => new Response('{}', { status: 401 }));
  t.after(() => denied.history.close());
  denied.emit();
  await settled(denied.history);
  assert.equal(denied.history.view().status, 'error');
  assert.equal(denied.history.view().error, 'HISTORY_HTTP_401');
  assert.equal(denied.history.pendingSnapshot(), null);
});

test('unsupported larger page size retries with observed native size', async t => {
  const sizes = [];
  const f = fixture(async raw => {
    const size = new URL(raw).searchParams.get('num_turns');
    sizes.push(size);
    return size === '50' ? new Response('{}', { status: 422 }) : new Response(JSON.stringify(page([message('first')])));
  });
  t.after(() => f.history.close()); f.emit(); await settled(f.history);
  assert.deepEqual(sizes, ['50', '2']);
  assert.equal(f.history.view().status, 'ready');
});

test('page centered on an old message cannot masquerade as the whole current branch', async () => {
  await assert.rejects(collectHistory({ ...page([message('older')]), current_node: 'latest' }, async () => {}),
    { code: 'HISTORY_BRANCH' });
});
