import test from 'node:test';
import assert from 'node:assert/strict';
import { AutoPlan, CONTINUE_TEXT } from '../src/auto-plan.mjs';
import { readAutoPlanState } from '../src/auto-plan-state.mjs';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
const settle = async () => { for (let i = 0; i < 12; i++) await new Promise(r => setImmediate(r)); };
function fixture() {
  let selected = { workspace: '/project', sessionId: 'chat', scopeId: 'scope', chatUrl: 'https://chatgpt.com/c/abcdefgh' };
  const plan = { confirmed: true, scopeId: 'scope', scopeStatus: 'ACTIVE', planRevision: 7,
    planView: { tasks: [{ id: 'T001', status: 'done' }, { id: 'T002', status: 'current' }, { id: 'DOCS', status: 'pending' }] } };
  const timers = new Map(), sends = [], events = []; let timerId = 0, sendResult = { state: 'sent' }, gate = null;
  const flow = new AutoPlan({ selected: () => selected, inspectPlan: async () => structuredClone(plan),
    log: (event, fields) => events.push({ event, ...fields }),
    send: async (text, current, before) => { if (gate) await gate(); if (!current() || !await before()) return { state: 'cancelled' }; if (sendResult.state !== 'deferred') sends.push(text); return sendResult; },
    schedule: (fn, ms) => { timers.set(++timerId, { fn, ms }); return timerId; }, cancel: id => timers.delete(id) });
  let state = { url: selected.chatUrl, editorAvailable: true, busy: false, assistantRevision: 0,
    manualStopRevision: 0, manualInputRevision: 0, manualSendRevision: 0, turnSignal: null };
  const observe = patch => { Object.assign(state, patch); flow.observe({ state: { ...state }, documentId: 'document-1111' }); };
  observe({});
  const drain = async () => { const callbacks = [...timers.entries()].filter(([, value]) => value.ms < 1000); callbacks.forEach(([id, value]) => { timers.delete(id); value.fn(); }); await settle(); };
  const finish = async (signal = 'continue') => {
    observe({ busy: true, turnSignal: null });
    observe({ busy: false, assistantRevision: ++state.assistantRevision, turnSignal: signal });
    await drain();
  };
  return { flow, plan, sends, observe, drain, finish, timers, events,
    setResult: value => { sendResult = value; }, setGate: value => { gate = value; },
    changeSelection: () => { selected = { ...selected, sessionId: 'other' }; } };
}
test('startup instruction reserves user wait for necessary decisions and allows technical recovery', async () => {
  const f = fixture(); await f.flow.start();
  const instruction = f.sends[0];
  assert.match(instruction, /не более одной микрозадачи с её проверкой и коммитом/);
  assert.match(instruction, /Web Pilot автоматически отправит «Продолжай»/);
  assert.match(instruction, /только когда без информации, выбора или решения пользователя корректно продолжать невозможно/);
  assert.match(instruction, /Техническая ошибка, упавший тест, проблема сборки, Git\/MCP или совместимости сами по себе не требуют ответа пользователя/);
  assert.match(instruction, /«Готов продолжать\.».*самостоятельную диагностику, исправление ошибки или проверку фонового процесса/);
  assert.doesNotMatch(instruction, /если есть вопрос, ошибка/);
});
test('partial baseline skips old DONE; current task can continue without a new commit; all DONE ends', async () => {
  const f = fixture(); await f.flow.start();
  assert.deepEqual(f.flow.run.completedAtStart, ['T001']); assert.equal(f.sends.length, 1);
  await f.drain(); assert.equal(f.sends.length, 1, 'initial snapshot is not a completed turn');
  await f.finish(); assert.equal(f.sends[1], CONTINUE_TEXT); assert.equal(f.sends[1], 'Продолжай');
  f.observe({ busy: false }); await f.drain(); assert.equal(f.sends.length, 2, 'no duplicate from the same idle');
  f.plan.planView.tasks.forEach(t => { t.status = 'done'; });
  await f.finish(); assert.equal(f.flow.view().phase, 'complete'); assert.equal(f.sends.length, 2);
});
test('already complete, empty, blocked and prepared plans never send', async () => {
  for (const kind of ['done', 'empty', 'blocked', 'prepared']) {
    const f = fixture();
    if (kind === 'done') f.plan.planView.tasks.forEach(t => { t.status = 'done'; });
    if (kind === 'empty') f.plan.planView.tasks = [];
    if (kind === 'blocked') f.plan.scopeStatus = 'BLOCKED';
    if (kind === 'prepared') f.plan.confirmed = false;
    await f.flow.start(); assert.equal(f.sends.length, 0, kind);
  }
});
test('question, native Stop, typing, navigation, error, unknown send and no progress pause', async () => {
  for (const reason of ['question', 'stop', 'input', 'navigation', 'error', 'unknown', 'no-progress']) {
    const f = fixture(); if (reason === 'unknown') f.setResult({ state: 'unknown' });
    await f.flow.start();
    if (reason === 'question') await f.finish('wait');
    if (reason === 'stop') f.observe({ manualStopRevision: 1 });
    if (reason === 'input') f.observe({ manualInputRevision: 1 });
    if (reason === 'navigation') f.flow.observe({ reset: true });
    if (reason === 'error') f.observe({ connectionError: 'stream-interrupted' });
    if (reason === 'no-progress') { await f.finish(); await f.finish(); await f.finish(); }
    assert.equal(f.flow.view().phase, 'paused', reason);
    const count = f.sends.length; await f.drain(); assert.equal(f.sends.length, count);
  }
});
test('completion or selection change during pre-Send cancels dispatch', async () => {
  for (const reason of ['complete', 'selection', 'stop']) {
    const f = fixture();
    f.setGate(async () => {
      if (reason === 'complete') f.plan.planView.tasks.forEach(t => { t.status = 'done'; });
      if (reason === 'selection') f.changeSelection();
      if (reason === 'stop') f.observe({ manualStopRevision: 1 });
    });
    await f.flow.start(); assert.equal(f.sends.length, 0, reason);
  }
});
test('checkpoint reader distinguishes working task, prepared DONE and committed DONE', async t => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'auto-plan-proof-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const git = args => execFileSync('git', args, { cwd: root, encoding: 'utf8' });
  git(['init','-b','main']); git(['config','user.name','Fixture']); git(['config','user.email','fixture@example.invalid']);
  await fs.mkdir(path.join(root,'.harness/plans'),{ recursive: true }); await fs.mkdir(path.join(root,'scripts'));
  await fs.writeFile(path.join(root,'scripts/workflow.mjs'),'');
  const p = { schema_version: 1, project_id: 'fixture', project_name: 'Fixture', plan_revision: 1, scope_id: 'scope',
    execution_scope_status: 'ACTIVE', delivery_status: 'IN_PROGRESS',
    tasks: [{ id: 'DOCS', title: 'Docs', implementation_status: 'IN_PROGRESS', commit_status: 'PENDING' }] };
  const write = () => fs.writeFile(path.join(root,'.harness/plans/todo-plan.md'),
    '<!-- workflow-state:begin -->\n\x60\x60\x60json\n' + JSON.stringify(p) + '\n\x60\x60\x60\n<!-- workflow-state:end -->');
  await write(); git(['add','.']); git(['commit','-m','fixture']);
  const bundledGit = execFileSync('/usr/bin/which', ['git'], { encoding: 'utf8' }).trim();
  assert.equal((await readAutoPlanState({ workspace: root }, { ...process.env, PATH: '/unavailable', WORKFLOW_GIT_BIN: bundledGit })).confirmed, true);
  p.plan_revision++; await write();
  assert.equal((await readAutoPlanState({ workspace: root })).confirmed, true, 'in-progress dirty plan may continue');
  p.tasks[0].implementation_status = 'DONE'; p.tasks[0].commit_status = 'DONE'; await write();
  assert.equal((await readAutoPlanState({ workspace: root })).confirmed, false, 'uncommitted DONE is not final');
  git(['add','.']); git(['commit','-m','completed']);
  await fs.mkdir(path.join(root,'.git/workflow-kit'));
  await fs.writeFile(path.join(root,'.git/workflow-kit/transaction.json'),'{}');
  assert.equal((await readAutoPlanState({ workspace: root })).confirmed, false);
  await fs.unlink(path.join(root,'.git/workflow-kit/transaction.json'));
  assert.equal((await readAutoPlanState({ workspace: root })).confirmed, true);
});

test('busy watchdog warns without stopping the run and later progress continues automatically', async () => {
  const f = fixture(); await f.flow.start();
  f.observe({ busy: true });
  const run = f.flow.run, epoch = f.flow.epoch, first = f.flow.watchdog;
  f.observe({ busy: true, visibility: 'hidden' });
  assert.equal(f.flow.watchdog, first, 'cosmetic events do not reset the deadline');
  f.observe({ busy: true, assistantRevision: 2 });
  assert.notEqual(f.flow.watchdog, first);
  const expire = () => {
    const id = f.flow.watchdog, timeout = f.timers.get(id);
    f.timers.delete(id); timeout.fn();
  };
  expire();
  assert.equal(f.flow.view().phase, 'running');
  assert.equal(f.flow.view().enabled, true);
  assert.equal(f.flow.view().warning, 'STALL_WARNING');
  assert.equal(f.flow.run, run);
  assert.equal(f.flow.epoch, epoch);
  assert.equal(f.flow.watchdog, null, 'one warning waits for actual progress');
  assert.equal(f.sends.length, 1, 'the watchdog never repeats Send');
  assert.equal(f.events.find(e => e.event === 'progress-timeout').reason, 'STALL_WARNING');
  f.observe({ visibility: 'visible' });
  assert.equal(f.flow.view().warning, 'STALL_WARNING', 'cosmetic events do not clear a warning');
  f.observe({ assistantRevision: 3 });
  assert.equal(f.flow.view().warning, null);
  assert.doesNotMatch(f.flow.view().message, /Три минуты/);
  assert.equal(f.flow.run, run);
  assert.notEqual(f.flow.watchdog, null);
  expire();
  assert.equal(f.flow.view().warning, 'STALL_WARNING');
  f.plan.planRevision++;
  await f.finish();
  assert.equal(f.sends.length, 2);
  assert.equal(f.sends.at(-1), 'Продолжай');
  assert.equal(f.flow.view().warning, null);
  assert.equal(f.flow.run, run, 'completion after a warning uses the same run');
  f.observe({ busy: false }); await f.drain();
  assert.equal(f.sends.length, 2, 'the same idle event cannot send twice');
});

test('idle watchdog keeps the safe pause when no answer or checkpoint appears', async () => {
  const f = fixture(); await f.flow.start();
  const id = f.flow.watchdog, timeout = f.timers.get(id);
  f.timers.delete(id); timeout.fn();
  assert.equal(f.flow.view().phase, 'paused');
  assert.equal(f.flow.view().warning, null);
  assert.equal(f.events.find(e => e.event === 'progress-timeout').reason, 'NO_CHECKPOINT');
  assert.equal(f.sends.length, 1);
});

test('a stall warning preserves real wait, Stop, connection error and plan completion safeguards', async () => {
  for (const reason of ['wait', 'stop', 'connection', 'done']) {
    const f = fixture(); await f.flow.start(); f.observe({ busy: true });
    const id = f.flow.watchdog, timeout = f.timers.get(id);
    f.timers.delete(id); timeout.fn();
    assert.equal(f.flow.view().warning, 'STALL_WARNING');
    if (reason === 'wait') await f.finish('wait');
    if (reason === 'stop') f.observe({ manualStopRevision: 1 });
    if (reason === 'connection') f.observe({ connectionError: 'stream-interrupted' });
    if (reason === 'done') {
      f.plan.planView.tasks.forEach(t => { t.status = 'done'; });
      await f.finish('done');
    }
    assert.equal(f.flow.view().phase, reason === 'done' ? 'complete' : 'paused', reason);
    assert.equal(f.flow.view().warning, null, reason);
    assert.equal(f.sends.length, 1, reason);
  }
});

test('new user message resumes Stop, typing and question without an extra Send', async () => {
  for (const reason of ['stop', 'typing', 'question']) {
    const f = fixture(); await f.flow.start();
    if (reason === 'stop') f.observe({ manualStopRevision: 1 });
    if (reason === 'typing') f.observe({ manualInputRevision: 1 });
    if (reason === 'question') await f.finish('wait');
    assert.equal(f.flow.view().enabled, true);
    const before = f.sends.length;
    f.observe({ userMessageCount: 10 }); await f.drain();
    assert.equal(f.flow.view().phase, 'paused', 'DOM count alone does not impersonate user Send');
    f.observe({ manualSendRevision: 1, busy: true }); await f.drain();
    assert.equal(f.flow.view().phase, 'running', reason);
    assert.equal(f.sends.length, before, 'user has already sent their message');
    await f.finish();
    assert.equal(f.sends.length, before + 1);
    assert.equal(f.sends.at(-1), 'Продолжай');
  }
});
test('draft defers startup and continuation without disabling mode or resending after user Send', async () => {
  for (const stage of ['startup', 'continuation']) {
    const f = fixture();
    if (stage === 'continuation') await f.flow.start();
    const before = f.sends.length;
    f.setResult({ state: 'deferred', reason: 'DRAFT_PRESENT' });
    if (stage === 'startup') await f.flow.start(); else await f.finish();
    assert.equal(f.flow.view().phase, 'paused', stage);
    assert.equal(f.flow.view().enabled, true, stage);
    assert.ok(f.flow.suspended, stage);
    assert.ok(f.events.some(e => e.event === 'wait' && e.reason === 'DRAFT_PRESENT'));
    assert.equal(f.sends.length, before);
    f.observe({ userMessageCount: 10 }); await f.drain();
    assert.equal(f.flow.view().phase, 'paused', 'only actual manual Send resumes the run');
    f.setResult({ state: 'sent' });
    f.observe({ manualSendRevision: 1, busy: true }); await f.drain();
    assert.equal(f.flow.view().phase, 'running', stage);
    assert.equal(f.sends.length, before, 'the user message is not followed by an automatic Send');
    await f.finish();
    assert.equal(f.sends.length, before + 1);
    assert.equal(f.sends.at(-1), 'Продолжай');
  }
});

test('manual Send observed while draft inspection is pending is not lost', async () => {
  const f = fixture();
  f.setResult({ state: 'deferred', reason: 'DRAFT_PRESENT' });
  f.setGate(async () => { f.observe({ manualSendRevision: 1, busy: true }); });
  await f.flow.start(); await f.drain();
  assert.equal(f.flow.view().phase, 'running');
  assert.equal(f.sends.length, 0);
  f.setGate(null); f.setResult({ state: 'sent' });
  await f.finish();
  assert.equal(f.sends.length, 1);
  assert.equal(f.sends[0], 'Продолжай');
});

test('unknown Send is not treated as a recoverable draft and deferred resume rechecks the plan', async () => {
  const unknown = fixture();
  unknown.setResult({ state: 'unknown', reason: 'DRAFT_PRESENT' });
  await unknown.flow.start();
  assert.equal(unknown.flow.view().enabled, true);
  assert.equal(unknown.flow.suspended, null);
  unknown.observe({ manualSendRevision: 1, busy: true }); await unknown.drain();
  assert.equal(unknown.sends.length, 1, 'an unknown Send is never repeated');
  for (const kind of ['transaction', 'completed']) {
    const f = fixture(); f.setResult({ state: 'deferred', reason: 'DRAFT_PRESENT' });
    await f.flow.start();
    if (kind === 'transaction') f.plan.confirmed = false;
    else f.plan.planView.tasks.forEach(t => { t.status = 'done'; });
    f.observe({ manualSendRevision: 1, busy: true }); await f.drain();
    assert.equal(f.flow.view().phase, kind === 'completed' ? 'complete' : 'paused');
    assert.equal(f.sends.length, 0);
  }
});
test('continuation counter records only confirmed automatic Continue and survives waits', async () => {
  const f = fixture(); await f.flow.start();
  assert.equal(f.flow.view().continuations, 0, 'startup instruction is not Continue');
  await f.finish();
  assert.equal(f.flow.view().continuations, 1);
  f.observe({ busy: false }); await f.drain();
  assert.equal(f.flow.view().continuations, 1);
  f.observe({ manualStopRevision: 1 });
  assert.equal(f.flow.view().continuations, 1, 'pause retains the last sent fact');
  assert.equal(f.flow.view().reason, 'MANUAL_STOP');
  f.observe({ manualSendRevision: 1, busy: true }); await f.drain();
  assert.equal(f.flow.view().continuations, 1, 'user Send is not an automatic continuation');
  f.plan.planRevision++; await f.finish();
  assert.equal(f.flow.view().continuations, 2);
  f.setResult({ state: 'unknown' }); f.plan.planRevision++; await f.finish();
  assert.equal(f.flow.view().continuations, 2, 'unknown Send cannot claim success');
  assert.equal(f.flow.view().reason, 'SEND_UNKNOWN');
  f.changeSelection(); f.flow.selectionChanged();
  assert.equal(f.flow.view().continuations, 0, 'another conversation never shows this counter');
});

test('pause and warning diagnostics identify causes without conversation contents', async () => {
  for (const reason of ['AGENT_WAIT','DRAFT_PRESENT','MANUAL_STOP','MANUAL_INPUT','CONNECTION_ERROR',
    'PLAN_CHANGED_OR_TRANSACTION','SEND_UNKNOWN','STALL_WARNING','NO_CHECKPOINT','MANUAL_OFF']) {
    const f = fixture();
    if (reason === 'DRAFT_PRESENT') f.setResult({ state: 'deferred', reason });
    if (reason === 'SEND_UNKNOWN') f.setResult({ state: 'unknown' });
    await f.flow.start();
    if (reason === 'AGENT_WAIT') await f.finish('wait');
    if (reason === 'MANUAL_STOP') f.observe({ manualStopRevision: 1 });
    if (reason === 'MANUAL_INPUT') f.observe({ manualInputRevision: 1 });
    if (reason === 'CONNECTION_ERROR') f.observe({ connectionError: 'private-secret-error' });
    if (reason === 'PLAN_CHANGED_OR_TRANSACTION') { f.plan.confirmed = false; await f.finish(); }
    if (reason === 'NO_CHECKPOINT') await f.finish(null);
    if (reason === 'MANUAL_OFF') f.flow.pause('private-user-text');
    if (reason === 'STALL_WARNING') {
      f.observe({ busy: true });
      const id = f.flow.watchdog, timeout = f.timers.get(id);
      f.timers.delete(id); timeout.fn();
    }
    assert.equal(f.flow.view().reason, reason);
    assert.ok(f.events.some(e => e.event === 'state' && e.reason === reason), reason);
    for (const event of f.events.filter(e => e.event === 'state' && e.phase === 'paused'))
      assert.match(event.reason, /^[A-Z_]+$/);
    assert.doesNotMatch(JSON.stringify(f.events), /private-secret-error|private-user-text|Готов продолжать|chatgpt\.com|\/project/);
  }
});
test('only explicit off clears the global choice; other interruptions never repeat Send', async () => {
  for (const reason of ['off','complete','selection','reload']) {
    const f = fixture(); await f.flow.start(); f.observe({ manualStopRevision: 1 });
    if (reason === 'off') f.flow.disable();
    if (reason === 'complete') f.plan.planView.tasks.forEach(t => { t.status = 'done'; });
    if (reason === 'selection') { f.changeSelection(); f.flow.selectionChanged(); }
    if (reason === 'reload') f.flow.observe({ reset: true });
    f.observe({ manualSendRevision: 1, busy: true }); await f.drain();
    assert.equal(f.flow.view().enabled, reason !== 'off', reason);
    assert.equal(f.sends.length, 1);
  }
});

test('restored enabled choice adopts busy, waits for questions and drafts, and completes without Send', async () => {
  for (const kind of ['busy', 'question', 'draft', 'done', 'off']) {
    const f = fixture();
    f.observe({ busy: kind === 'busy', turnSignal: kind === 'question' ? 'wait' : 'continue',
      turnId: 'abc123', draftPresent: kind === 'draft' });
    if (kind === 'done') f.plan.planView.tasks.forEach(t => { t.status = 'done'; });
    f.flow.restore(kind !== 'off');
    await f.flow.recover(); await f.drain();
    assert.equal(f.flow.view().enabled, kind !== 'off', kind);
    assert.equal(f.sends.length, 0, kind);
    if (kind === 'question') assert.equal(f.flow.view().reason, 'AGENT_WAIT');
    if (kind === 'draft') assert.equal(f.flow.view().reason, 'DRAFT_PRESENT');
    if (kind === 'done') assert.equal(f.flow.view().phase, 'complete');
    if (kind === 'busy') {
      await f.finish();
      assert.deepEqual(f.sends, ['Продолжай']);
    }
  }
});
test('restored checkpoint sends once and a consumed or uncertain Send never retries on reload', async () => {
  for (const kind of ['new', 'consumed', 'unknown']) {
    const f = fixture();
    f.observe({ turnSignal: 'continue', turnId: 'abc123' });
    const owner = JSON.stringify(['/project', 'chat', 'scope', 'https://chatgpt.com/c/abcdefgh']);
    f.flow.restore(true, kind === 'new' ? null : { key: owner, turnId: 'abc123',
      status: kind === 'unknown' ? 'sending' : 'sent' });
    await f.flow.recover(); await f.drain();
    assert.equal(f.sends.length, kind === 'new' ? 1 : 0, kind);
    const checkpoint = f.flow.checkpoint;
    f.flow.observe({ reset: true });
    f.flow.observe({ state: { url: 'https://chatgpt.com/c/abcdefgh', editorAvailable: true,
      busy: false, assistantRevision: 1, turnSignal: 'continue', turnId: 'abc123' }, documentId: 'document-2222' });
    await f.flow.recover(); await f.drain();
    assert.equal(f.sends.length, kind === 'new' ? 1 : 0, 'reload does not repeat consumed Send');
    assert.deepEqual(f.flow.checkpoint, checkpoint);
    assert.equal(f.flow.view().enabled, true);
    if (kind === 'unknown') assert.equal(f.flow.view().reason, 'SEND_UNKNOWN');
  }
});
test('checkpoint is durably saved before Send; failed saving never dispatches', async () => {
  const order = [];
  const f = fixture();
  f.flow.saveCheckpoint = async checkpoint => { order.push(checkpoint.status); };
  const send = f.flow.send;
  f.flow.send = async (...args) => { order.push('Send'); return send(...args); };
  await f.flow.start();
  assert.deepEqual(order, ['sending', 'Send', 'sent']);
  const failed = fixture();
  failed.flow.saveCheckpoint = async () => { throw new Error('disk unavailable'); };
  await failed.flow.start();
  assert.equal(failed.sends.length, 0);
  assert.equal(failed.flow.view().enabled, true);
  assert.equal(failed.flow.view().reason, 'SEND_ERROR');
});
