import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ConversationRecovery } from '../src/conversation-recovery.mjs';

function fixture() {
  const project = { workspace: '/project', sessionId: 'one', chatUrl: 'https://chatgpt.com/c/conversation-one', attempt: { state: 'sent' } };
  const page = { url: project.chatUrl, editorAvailable: true, draftLength: 0, connectionError: 'stream-interrupted' };
  let selected = project, calls = 0, finish;
  const timers = new Map(); let n = 0;
  const recovery = new ConversationRecovery({ selected: () => selected, inspect: async () => page,
    reopen: async p => { assert.equal(p.chatUrl, project.chatUrl); calls++; return true; },
    schedule: fn => { timers.set(++n, fn); return n; }, cancel: id => timers.delete(id), now: () => 100 });
  return { recovery, project, page, timers, calls: () => calls, select: p => { selected = p; },
    fire: async () => { const [id, fn] = timers.entries().next().value; timers.delete(id); fn(); await new Promise(setImmediate); } };
}
test('terminal stream error reopens the same conversation once without retrying generation', async () => {
  const f = fixture(), phases = [];
  f.recovery.onChange = state => phases.push(state.phase);
  f.recovery.observe(f.page); await f.fire();
  assert.equal(f.calls(), 1); assert.equal(f.recovery.view().phase, 'restored');
  f.recovery.observe({ ...f.page, connectionError: null });
  assert.equal(f.recovery.view().phase, 'idle', 'a healthy observation clears the transient result');
  assert.deepEqual(phases.slice(-2), ['restored', 'idle'], 'subscribers observe success even between polling checks');
  f.recovery.observe(f.page);
  assert.equal(f.recovery.view().phase, 'failed'); assert.equal(f.timers.size, 0);
});
test('draft and uncertain Send block automatic and manual reloads', async () => {
  const f = fixture(); f.page.draftLength = 12; f.recovery.observe(f.page); await f.fire();
  assert.equal(f.calls(), 0); assert.equal(f.recovery.view().phase, 'blocked');
  assert.equal(await f.recovery.retry(), false);
  f.page.draftLength = 0; f.project.attempt.state = 'unknown';
  assert.equal(await f.recovery.retry(), false); assert.equal(f.calls(), 0);
  assert.equal(await f.recovery.requestRetry(), false); assert.equal(f.calls(), 0, 'the button handler cannot bypass uncertain Send');
  assert.match(f.recovery.view().message, /Отправка ещё не подтверждена/);
});
test('unchanging busy page and review waiting never infer a connection failure', () => {
  const f=fixture();
  for(const busy of [true,true,true,false]) {
    f.recovery.observe({...f.page,connectionError:null,busy,warning:'STALL_WARNING'});
    assert.deepEqual(f.recovery.view(),{phase:'idle',message:'',canRetry:false});
    assert.equal(f.timers.size,0);assert.equal(f.calls(),0);
  }
  f.recovery.observe(f.page);
  assert.equal(f.recovery.view().phase,'waiting');assert.equal(f.timers.size,1);
  assert.match(f.recovery.view().message,/обнаружена ошибка соединения/);
});
test('switching session during inspection discards delayed recovery', async () => {
  const f = fixture(); let finish;
  f.recovery.inspect = () => new Promise(r => { finish = r; });
  f.recovery.observe(f.page); const run = f.recovery.retry();
  f.select({ ...f.project, sessionId: 'other' }); f.recovery.reset(); finish(f.page); await run;
  assert.equal(f.calls(), 0); assert.equal(f.recovery.view().phase, 'idle');
});
test('429 cooldown stops automatic requests and only enables an explicit retry afterwards', async () => {
  const f = fixture(); f.recovery.observe(f.page); f.recovery.rateLimited('conversation-one', 120);
  assert.equal(f.recovery.view().phase, 'cooldown'); assert.equal(await f.recovery.retry(), false);
  assert.equal(await f.recovery.requestRetry(),false,'manual button respects rate limiting');
  await f.fire(); assert.equal(f.calls(), 0); assert.equal(f.recovery.view().canRetry, true);
});
test('no fallback to a new conversation when the URL has not been bound', () => {
  const f = fixture(); f.project.chatUrl = null; f.recovery.observe(f.page);
  assert.equal(f.recovery.view().phase, 'blocked'); assert.equal(f.timers.size, 0);
});

test('manual Stop suppresses automatic reopen through reset until a new user message', async () => {
  const f = fixture(); f.page.userMessageCount = 4;
  f.recovery.observe(f.page); assert.equal(f.timers.size, 1);
  f.recovery.manualStop(f.page); f.recovery.reset(); f.recovery.observe(f.page);
  assert.equal(f.timers.size, 0); assert.equal(f.calls(), 0);
  f.page.userMessageCount = 5; f.recovery.observe(f.page);
  await f.fire(); assert.equal(f.calls(), 1);
});
test('explicit recovery is available without a detected error and still protects drafts', async () => {
  const f = fixture(); f.page.connectionError = null; f.page.draftLength = 2;
  assert.equal(await f.recovery.requestRetry(), false); assert.equal(f.calls(), 0);
  f.page.draftLength = 0;
  assert.equal(await f.recovery.requestRetry(), true); assert.equal(f.calls(), 1);
});
