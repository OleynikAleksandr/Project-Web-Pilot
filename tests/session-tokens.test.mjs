import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { JSDOM } from 'jsdom';
import { estimateMessageTokens, readSessionMessages, SessionTokenCounter, validTokenEstimate } from '../src/session-tokens.mjs';
import { WorkspaceSessions } from '../src/workspace-session.mjs';

const user = { id: 'user:u1', text: 'hello world' };

test('count text once, replace streaming revisions, retain unmounted messages', async () => {
  const initial = await estimateMessageTokens([user]);
  assert.equal(initial.total, 2);
  assert.equal(validTokenEstimate(initial), true);
  assert.equal(await estimateMessageTokens([user, user], initial), null);
  const streamed = await estimateMessageTokens([{ id: 'assistant:a1', text: 'Hello' }], initial);
  assert.equal(streamed.total, 3);
  const completed = await estimateMessageTokens([{ id: 'assistant:a1', text: 'Hello world' }], streamed);
  assert.equal(completed.total, 4);
  assert.equal(Object.keys(completed.messages).length, 2);
  assert.equal(await estimateMessageTokens([user], completed), null, 'virtualized history must not erase prior observations');
  assert.equal(await estimateMessageTokens([], null), null, 'unavailable is not zero');
  assert.equal(JSON.stringify(completed).includes('hello world'), false);
  assert.equal(validTokenEstimate({ ...completed, total: 999 }), false);
});

test('Russian, code and literal special tokens are accepted as ordinary text', async () => {
  const result = await estimateMessageTokens([{ id: 'user:ru', text: 'Привет, Александр!\nconst answer = 42;\n<|endoftext|>' }]);
  assert.ok(result.total > 0);
  assert.equal(validTokenEstimate(result), true);
});

test('DOM reading excludes drafts/buttons, deduplicates nested messages and requires stable identity', () => {
  const dom = new JSDOM(`<article data-testid="conversation-turn-0">
    <div data-testid="user-message"><div data-message-author-role="user" data-message-id="u1">hello world</div></div>
    <div data-message-author-role="assistant" data-message-id="a1"><p>Hello world</p><button>Copy</button></div>
    </article><div data-message-author-role="assistant">No stable identity</div>
    <textarea id="prompt-textarea">PRIVATE DRAFT</textarea>`, { url: 'https://chatgpt.com/c/conversation-a', runScripts: 'outside-only' });
  const result = dom.window.eval('(' + readSessionMessages.toString() + ')()');
  assert.deepEqual(JSON.parse(JSON.stringify(result)), { url: 'https://chatgpt.com/c/conversation-a',
    messages: [{ id: 'user:u1', text: 'hello world' }, { id: 'assistant:a1', text: 'Hello world' }] });
  dom.window.close();
});

test('worker uses the packaged offline encoding', async t => {
  const counter = new SessionTokenCounter();
  t.after(() => counter.close());
  const estimate = await counter.estimate([user], null);
  assert.equal(estimate.total, 2);
  assert.equal(await counter.estimate([user], estimate), null);
});

test('per-session estimates survive restart/archive and reject stale writes', async t => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'pilot-tokens-'));
  t.after(() => fs.rm(dir, { recursive: true, force: true }));
  const file = path.join(dir, 'sessions.json');
  const inspect = async workspace => ({ workspace, name: 'Fixture', projectId: 'project-a' });
  let store = new WorkspaceSessions(file, { inspect });
  await store.load();
  await store.select(dir);
  const first = store.selected();
  await store.bindChat(dir, first.sessionId, 'https://chatgpt.com/c/conversation-a');
  const estimate = await estimateMessageTokens([user]);
  await store.setSessionTokenEstimate(dir, first.sessionId, 'https://chatgpt.com/c/conversation-a', estimate);
  await store.newSession(dir, 'work');
  const second = store.selected();
  assert.equal(second.tokenEstimate, null);
  await assert.rejects(store.setSessionTokenEstimate(dir, first.sessionId, 'https://chatgpt.com/c/conversation-a', estimate), { code: 'SESSION_CHANGED' });
  await store.setSessionArchived(dir, first.sessionId, true);
  store = new WorkspaceSessions(file, { inspect });
  await store.load();
  const saved = store.snapshot().projects[0].sessions.find(s => s.sessionId === first.sessionId);
  assert.deepEqual(saved.tokenEstimate, estimate);
  await store.setSessionArchived(dir, first.sessionId, false);
  await store.selectSession(dir, first.sessionId);
  await assert.rejects(store.setSessionTokenEstimate(dir, first.sessionId, 'https://chatgpt.com/c/conversation-b', estimate), { code: 'CHAT_CHANGED' });
  assert.equal(store.selected().tokenEstimate.total, 2);
  await store.selectSession(dir, second.sessionId);
  await store.setSessionArchived(dir, first.sessionId, true);
  await store.forgetArchivedSessions([{ workspace: dir, projectId: 'project-a', sessionId: first.sessionId }]);
  assert.equal((await fs.readFile(file, 'utf8')).includes(first.sessionId), false);
});
