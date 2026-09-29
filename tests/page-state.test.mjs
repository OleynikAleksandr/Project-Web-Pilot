import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { JSDOM } from 'jsdom';
import { chatGPTDOMScript } from '../src/chatgpt-dom.mjs';
import { installPageObserver } from '../src/chatgpt-page-observer.mjs';
import { PageStateSource, PAGE_STATE_CHANNEL, normalizePageObservation } from '../src/page-state.mjs';
import { connectPageState } from '../src/page-state-bridge.mjs';

const turn = () => new Promise(resolve => setImmediate(resolve));
const observation = (seq = 1, documentId = 'document-1111', patch = {}) => ({ version: 1, seq, documentId,
  state: { url: 'https://chatgpt.com/', experience: 'chat', login: 'unknown', visibility: 'visible',
    editorAvailable: true, editorRevision: 1, writable: true, busy: false, sendEnabled: true,
    draftRevision: 1, userMessageCount: 0, userMessagesRevision: 0, ...patch } });

test('observer catches equal-length drafts, late user text, attributes and busy without frame scheduling', async () => {
  const dom = new JSDOM('<form><div id="prompt-textarea" contenteditable="true">aa</div><button data-testid="send-button">Send</button></form><article data-message-author-role="assistant"><span>stream</span></article>',
    { url: 'https://chatgpt.com/', runScripts: 'outside-only' });
  const w = dom.window;
  w.HTMLElement.prototype.getClientRects = function () { return this.hidden ? [] : [{}]; };
  w.requestAnimationFrame = () => { throw Error('Logic must work without frames'); };
  const messages = []; w.reportObservation = m => messages.push(m);
  const dispose = w.eval('(' + installPageObserver.toString() + ')(' + chatGPTDOMScript() + ', reportObservation)');
  await turn();
  const editor = w.document.querySelector('#prompt-textarea');
  const initial = messages.at(-1);
  assert.equal(initial.state.login, 'unknown', 'an editor alone does not prove authentication');
  editor.textContent = 'bb'; await turn();
  assert.ok(messages.at(-1).state.draftRevision > initial.state.draftRevision);
  let revision = messages.at(-1).state.draftRevision;
  editor.className = 'cosmetic'; await turn();
  assert.equal(messages.at(-1).state.draftRevision, revision);
  const user = w.document.createElement('article'); user.dataset.messageAuthorRole = 'user'; w.document.body.append(user); await turn();
  revision = messages.at(-1).state.userMessagesRevision;
  user.textContent = 'late requestId'; await turn();
  assert.equal(messages.at(-1).state.userMessageCount, 1);
  assert.ok(messages.at(-1).state.userMessagesRevision > revision);
  const count = messages.length;
  w.document.querySelector('article[data-message-author-role="assistant"] span').firstChild.data += ' token'; await turn();
  assert.equal(messages.length, count);
  const stop = w.document.createElement('button'); stop.dataset.testid = 'stop-button'; w.document.body.append(stop); await turn();
  assert.equal(messages.at(-1).state.busy, true);
  stop.remove(); await turn(); assert.equal(messages.at(-1).state.busy, false);
  dispose(); w.close();
});

test('source rejects stale documents/sequences and closes the check-subscribe gap', async () => {
  const source = new PageStateSource();
  source.accept(observation());
  const version = source.version;
  source.accept(observation(2, 'document-1111', { draftRevision: 2 }));
  assert.equal((await source.waitForChange(version)).changed, true);
  assert.equal(source.accept(observation()).accepted, false);
  const waiting = source.waitForChange(source.version);
  source.reset();
  assert.equal((await waiting).changed, true);
  assert.equal(source.accept(observation(3)).accepted, false);
  assert.equal(source.accept(observation(1, 'document-2222')).accepted, true);
  assert.throws(() => normalizePageObservation({ ...observation(), padding: 'x'.repeat(9000) }));
});

test('bridge rejects wrong senders, frames, origins and late hello from former document', async () => {
  const ipc = new EventEmitter(), contents = new EventEmitter(), source = new PageStateSource();
  const frame = { url: 'https://chatgpt.com/' };
  contents.mainFrame = frame; contents.getURL = () => frame.url; contents.isDestroyed = () => false;
  let liveId = 'document-1111', reads = 0;
  contents.executeJavaScriptInIsolatedWorld = async () => { reads++; return liveId; };
  const stop = connectPageState(contents, ipc, source);
  const emit = (message, patch = {}) => ipc.emit(PAGE_STATE_CHANNEL, { sender: contents, senderFrame: frame, ...patch }, message);
  emit(observation(), { sender: {} }); emit(observation(), { senderFrame: { url: frame.url } }); await turn();
  assert.equal(reads, 0);
  emit(observation()); await turn(); assert.equal(source.current.documentId, liveId);
  contents.emit('did-start-navigation', {}, frame.url, false, true);
  liveId = 'document-2222';
  emit(observation(2)); await turn(); assert.equal(source.current, null);
  emit(observation(1, liveId)); await turn(); assert.equal(source.current.documentId, liveId);
  const version = source.version;
  frame.url = 'https://evil.example/'; emit(observation(2, liveId)); await turn();
  assert.equal(source.version, version);
  stop(); assert.equal(ipc.listenerCount(PAGE_STATE_CHANNEL), 0);
});

for (const errorText of ['ChatGPT stream recovery polling timed out', 'Resume stream unavailable']) {
  for (const errorUI of ['alert', 'retry']) {
    test(errorText + ': ' + errorUI + ' UI signals an error, quoted prose does not', async () => {
      const dom = new JSDOM('<div id="prompt-textarea" contenteditable="true"></div>'
        + '<article data-message-author-role="user"><div role="alert">' + errorText + '</div></article>'
        + '<article data-message-author-role="assistant">' + errorText + '</article>'
        + '<pre><div role="alert">' + errorText + '</div></pre>'
        + '<blockquote><div role="alert">' + errorText + '</div></blockquote>',
        { url: 'https://chatgpt.com/c/one', runScripts: 'outside-only' });
      const w = dom.window; w.HTMLElement.prototype.getClientRects = function () { return this.hidden ? [] : [{}]; };
      const messages = []; w.reportObservation = m => messages.push(m);
      const dispose = w.eval('(' + installPageObserver.toString() + ')(' + chatGPTDOMScript() + ', reportObservation)');
      assert.equal(messages.at(-1).state.connectionError, null);
      const alert = w.document.createElement('div');
      if (errorUI === 'alert') alert.setAttribute('role', 'alert');
      alert.textContent = errorText;
      if (errorUI === 'retry') {
        const button = w.document.createElement('button'); button.textContent = 'Повторить'; alert.append(button);
      }
      w.document.body.append(alert); await turn();
      assert.equal(messages.at(-1).state.connectionError, 'stream-interrupted');
      alert.remove(); await turn(); assert.equal(messages.at(-1).state.connectionError, null);
      dispose(); w.close();
    });
  }
}

test('stream content progress is coalesced, decorative mutations do not count, final footer is observed', async () => {
  const dom = new JSDOM('<div id="prompt-textarea" contenteditable="true"></div><button data-testid="stop-button">Stop</button><article data-message-author-role="assistant"><span>start</span></article>',
    { url: 'https://chatgpt.com/c/fixture', runScripts: 'outside-only' });
  const w = dom.window; w.HTMLElement.prototype.getClientRects = () => [{}];
  const timers = new Map(); let id = 0, clock = 10000;
  w.Date.now = () => clock; w.setTimeout = fn => { timers.set(++id, fn); return id; }; w.clearTimeout = key => timers.delete(key);
  const messages = []; w.reportObservation = m => messages.push(m);
  const dispose = w.eval('(' + installPageObserver.toString() + ')(' + chatGPTDOMScript() + ', reportObservation)');
  const first = messages.at(-1).state.assistantRevision;
  const text = w.document.querySelector('article span').firstChild;
  for (let i = 0; i < 4; i++) { text.data += ' token'; await turn(); }
  assert.equal(timers.size, 1);
  clock += 5000; const callback = [...timers.values()][0]; timers.clear(); callback();
  assert.ok(messages.at(-1).state.assistantRevision > first);
  const progress = messages.at(-1).state.assistantRevision;
  w.document.querySelector('article').className = 'animated'; await turn();
  assert.equal(messages.at(-1).state.assistantRevision, progress);
  w.document.querySelector('button').remove(); text.data = 'Готов продолжать.'; await turn();
  assert.equal(messages.at(-1).state.turnSignal, 'continue');
  dispose(); assert.equal(timers.size, 0); w.close();
});
