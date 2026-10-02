import test from 'node:test';
import assert from 'node:assert/strict';
import { AutoPlan, CONTINUE_TEXT } from '../src/auto-plan.mjs';
import { readAutoPlanState } from '../src/auto-plan-state.mjs';
import { ChatGPTComposer } from '../src/chatgpt-composer.mjs';
import { PlanMonitor } from '../src/plan-monitor.mjs';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
const settle = async () => { for (let i = 0; i < 12; i++) await new Promise(r => setImmediate(r)); };

function fixture({ busy = false, scopeId = 'scope', turnId = 'a1234' } = {}) {
  let selected = { workspace: '/project', projectId: 'project-id', sessionId: 'chat', scopeId, chatUrl: 'https://chatgpt.com/c/abcdefgh' };
  const plan = { confirmed: true, scopeId, scopeStatus: scopeId ? 'ACTIVE' : 'NONE', planRevision: 7,
    planView: { tasks: scopeId ? [{ id: 'T001', status: 'done' }, { id: 'T002', status: 'current' }, { id: 'DOCS', status: 'pending' }] : [] } };
  const timers = new Map(), sends = [], events = [], saved = [];
  let timerId = 0, sendResult = { state: 'sent' }, gate = null, inspectGate = null, available = true, reads = 0;
  const flow = new AutoPlan({ selected: () => selected, available: () => available,
    inspectPlan: async () => { reads++; if (inspectGate) await inspectGate(); return structuredClone(plan); },
    log: (event, fields) => events.push({ event, ...fields }),
    saveCheckpoint: async checkpoint => { saved.push(structuredClone(checkpoint)); },
    send: async (text, current, before) => {
      if (gate) await gate();
      if (!current() || !await before()) return { state: 'cancelled' };
      if (sendResult.state !== 'deferred') sends.push(text);
      return sendResult;
    },
    schedule: (fn, ms) => { timers.set(++timerId, { fn, ms }); return timerId; }, cancel: id => timers.delete(id) });
  const state = { url: selected.chatUrl, editorAvailable: true, writable: true, busy, assistantRevision: 0,
    manualStopRevision: 0, manualInputRevision: 0, manualSendRevision: 0, userMessageCount: 1, turnId, draftPresent: false };
  const observe = patch => { Object.assign(state, patch); flow.observe({ state: { ...state }, documentId: 'document-1111' }); };
  observe({});
  const drain = async () => {
    for (let i = 0; i < 4; i++) {
      await settle();
      for (const [id, value] of [...timers.entries()].filter(([, value]) => value.ms < 1000)) {
        timers.delete(id); value.fn();
      }
    }
    await settle();
  };
  const finish = async () => {
    observe({ busy: true }); await settle();
    observe({ busy: false, assistantRevision: ++state.assistantRevision, turnId: state.assistantRevision.toString(16) });
    await drain();
  };
  return { flow, plan, sends, saved, observe, drain, finish, timers, events, state, selected: () => selected, reads: () => reads,
    setResult: value => { sendResult = value; }, setGate: value => { gate = value; },
    setInspectGate: value => { inspectGate = value; },
    setAvailable: value => { available = value; flow.availabilityChanged(); },
    setScope: value => { selected = { ...selected, scopeId: value }; },
    changeSelection: () => { selected = { ...selected, sessionId: 'other', chatUrl: 'https://chatgpt.com/c/otherchat' }; flow.selectionChanged(); } };
}

test('toggle during busy sends nothing; ordinary idle replies send only exact Continue', async () => {
  const f = fixture({ busy: true, turnId: '' });
  await f.flow.start();
  assert.equal(f.reads(), 0, 'streaming progress does not read Git');
  assert.deepEqual(f.sends, []);
  await f.finish();
  assert.deepEqual(f.sends, [CONTINUE_TEXT]);
  await f.finish();
  assert.deepEqual(f.sends, ['Продолжай', 'Продолжай']);
});
test('existing idle replies and idle without any assistant turn are suitable pauses', async () => {
  for (const turnId of ['a1234', '']) {
    const f = fixture({ turnId }); await f.flow.start();
    assert.deepEqual(f.sends, [CONTINUE_TEXT]);
    assert.deepEqual(f.flow.run.completedAtStart, ['T001']);
    f.observe({ busy: false }); await f.flow.planChanged(); await f.drain();
    assert.equal(f.sends.length, 1);
    await f.finish();
    assert.equal(f.sends.length, 2, 'a task can continue without a new DONE or commit');
    f.plan.planView.tasks.forEach(t => { t.status = 'done'; });
    await f.flow.planChanged(); await f.drain();
    assert.equal(f.flow.view().phase, 'complete');
    assert.equal(f.flow.view().enabled, true);
    assert.equal(f.sends.length, 2);
  }
});
test('NONE becomes ACTIVE through PlanMonitor while an ordinary reply is busy', async () => {
  const f = fixture({ busy: true, scopeId: null, turnId: '' });
  const monitor = new PlanMonitor({
    selected: f.selected, retryDelays: [],
    inspect: async () => ({ ...structuredClone(f.plan), workspace: '/project', projectId: 'project-id', inspectedSessionId: 'chat' }),
    onChange: (info, meta) => { f.setScope(info.scopeId); if (meta.semanticChanged) void f.flow.planChanged(); },
  });
  await f.flow.start(); await monitor.tick(); await f.drain();
  assert.deepEqual(f.sends, []);
  f.plan.scopeId = 'scope'; f.plan.scopeStatus = 'ACTIVE'; f.plan.planRevision++;
  f.plan.planView.tasks = [{ id: 'T001', status: 'pending' }, { id: 'DOCS', status: 'pending' }];
  await monitor.tick(); await f.drain();
  assert.equal(f.reads(), 0);
  assert.deepEqual(f.sends, [], 'creating the plan never interrupts the current response');
  await f.finish();
  assert.deepEqual(f.sends, ['Продолжай']);
  f.plan.planView.tasks[0].status = 'done'; f.plan.planRevision++;
  await monitor.tick(); await f.finish();
  assert.deepEqual(f.sends, ['Продолжай', 'Продолжай']);
  monitor.close();
});
test('an enabled idle client wakes when its first plan appears', async () => {
  const f = fixture({ scopeId: null, turnId: '' }); await f.flow.start();
  assert.equal(f.flow.view().reason, 'PLAN_UNAVAILABLE');
  f.plan.scopeId = 'scope'; f.plan.scopeStatus = 'ACTIVE'; f.plan.planView.tasks = [{ id: 'T001', status: 'pending' }];
  f.setScope('scope'); await f.flow.planChanged(); await f.drain();
  assert.deepEqual(f.sends, ['Продолжай']);
});
test('completed, empty, inactive, unconfirmed, mismatched and OFF plans never send', async () => {
  for (const kind of ['done', 'empty', 'blocked', 'transaction', 'mismatch', 'off']) {
    const f = fixture();
    if (kind === 'done') f.plan.planView.tasks.forEach(t => { t.status = 'done'; });
    if (kind === 'empty') f.plan.planView.tasks = [];
    if (kind === 'blocked') f.plan.scopeStatus = 'BLOCKED';
    if (kind === 'transaction') f.plan.confirmed = false;
    if (kind === 'mismatch') f.plan.scopeId = 'another';
    if (kind !== 'off') await f.flow.start(); else await f.flow.planChanged();
    assert.deepEqual(f.sends, [], kind);
  }
});
test('unready pages wait and recover on their next relevant event', async () => {
  for (const kind of ['editor', 'writable', 'connection', 'url', 'availability']) {
    const f = fixture();
    if (kind === 'editor') f.observe({ editorAvailable: false });
    if (kind === 'writable') f.observe({ writable: false });
    if (kind === 'connection') f.observe({ connectionError: 'stream-interrupted' });
    if (kind === 'url') f.observe({ url: 'https://chatgpt.com/c/otherchat' });
    if (kind === 'availability') f.setAvailable(false);
    await f.flow.start();
    assert.deepEqual(f.sends, [], kind);
    f.observe({ editorAvailable: true, writable: true, connectionError: null, url: f.selected().chatUrl });
    f.setAvailable(true); await f.drain();
    assert.deepEqual(f.sends, ['Продолжай'], kind);
  }
});
test('a transaction or read error waits until a later plan event without a toggle', async () => {
  for (const kind of ['transaction', 'read-error']) {
    const f = fixture();
    if (kind === 'transaction') f.plan.confirmed = false;
    else f.setInspectGate(() => { throw Error('private-read-error'); });
    await f.flow.start();
    assert.deepEqual(f.sends, []);
    assert.equal(f.flow.view().enabled, true);
    f.plan.confirmed = true; f.setInspectGate(null);
    await f.flow.planChanged(); await f.drain();
    assert.deepEqual(f.sends, ['Продолжай']);
    assert.doesNotMatch(JSON.stringify(f.events), /private-read-error/);
  }
});
test('duplicate page and plan events serialize inspections and consume one pause', async () => {
  const f = fixture();
  let release, first = true, active = 0, max = 0;
  f.setInspectGate(async () => {
    active++; max = Math.max(max, active);
    if (first) { first = false; await new Promise(resolve => { release = resolve; }); }
    active--;
  });
  const start = f.flow.start(); await settle();
  f.observe({}); void f.flow.planChanged(); f.observe({}); void f.flow.recover();
  release(); await start; await f.drain();
  assert.equal(max, 1);
  assert.deepEqual(f.sends, ['Продолжай']);
});
test('page becomes busy during the plan read: do not send on stale idle', async () => {
  const f = fixture(); let first = true;
  f.setInspectGate(async () => { if (first) { first = false; f.observe({ busy: true }); } });
  await f.flow.start(); await f.drain();
  assert.deepEqual(f.sends, []);
  await f.finish(); assert.deepEqual(f.sends, ['Продолжай']);
});
test('simultaneous plan change and end of answer wait for settled idle and send once', async () => {
  const f = fixture({ busy: true }); await f.flow.start();
  f.observe({ busy: false, turnId: 'b1234', assistantRevision: 1 });
  f.plan.planRevision++; await f.flow.planChanged();
  assert.deepEqual(f.sends, [], 'settle timer gates all event sources');
  await f.drain(); assert.deepEqual(f.sends, ['Продолжай']);
});
test('disable, selection, completion and new busy during pre-Send cancel dispatch', async () => {
  for (const kind of ['off', 'selection', 'done', 'busy']) {
    const f = fixture();
    f.setGate(async () => {
      if (kind === 'off') f.flow.disable();
      if (kind === 'selection') f.changeSelection();
      if (kind === 'done') f.plan.planView.tasks.forEach(t => { t.status = 'done'; });
      if (kind === 'busy') f.observe({ busy: true });
    });
    await f.flow.start(); await f.drain();
    assert.deepEqual(f.sends, [], kind);
  }
});
test('draft waits without changing it; clearing the draft wakes the same pause', async () => {
  const f = fixture(); f.observe({ draftPresent: true }); await f.flow.start();
  assert.equal(f.flow.view().reason, 'DRAFT_PRESENT');
  assert.equal(f.state.draftPresent, true);
  assert.deepEqual(f.sends, []);
  f.observe({ draftPresent: false }); await f.drain();
  assert.deepEqual(f.sends, ['Продолжай']);
});
test('manual Send wins while continuation is being inspected and waits for a new reply', async () => {
  const f = fixture();
  f.setGate(async () => { f.observe({ manualSendRevision: 1, busy: true }); });
  await f.flow.start(); await f.drain();
  assert.deepEqual(f.sends, []);
  f.setGate(null); await f.finish();
  assert.deepEqual(f.sends, ['Продолжай']);
});
test('own composer insertion can change draft state while its guarded Send is in flight', async () => {
  const f = fixture();
  f.setGate(async () => { f.observe({ draftPresent: true }); });
  await f.flow.start();
  assert.deepEqual(f.sends, ['Продолжай']);
});
test('unknown Send never repeats the same pause on events, reload or toggle', async () => {
  const f = fixture(); f.setResult({ state: 'unknown' });
  await f.flow.start(); assert.equal(f.flow.view().reason, 'SEND_UNKNOWN');
  const checkpoint = f.flow.checkpoint;
  f.observe({}); await f.flow.planChanged(); await f.drain();
  f.flow.observe({ reset: true }); f.observe({}); await f.drain();
  f.flow.disable(); await f.flow.start();
  assert.deepEqual(f.sends, ['Продолжай']);
  assert.deepEqual(f.flow.checkpoint, checkpoint);
});
test('known deferred Send preserves the previous checkpoint and never claims delivery', async () => {
  const f = fixture(); f.setResult({ state: 'deferred', reason: 'DRAFT_PRESENT' });
  await f.flow.start();
  assert.deepEqual(f.sends, []);
  assert.equal(f.flow.checkpoint, null);
  assert.equal(f.flow.view().reason, 'DRAFT_PRESENT');
  assert.equal(f.flow.view().continuations, 0);
});
test('counter records confirmed automatic Continue and retains it across waits', async () => {
  const f = fixture(); await f.flow.start(); assert.equal(f.flow.view().continuations, 1);
  f.observe({ connectionError: 'stream-interrupted' }); await f.drain();
  assert.equal(f.flow.view().continuations, 1);
  f.observe({ connectionError: null }); await f.finish();
  assert.equal(f.flow.view().continuations, 2);
  f.setResult({ state: 'unknown' }); await f.finish();
  assert.equal(f.flow.view().continuations, 2);
  f.changeSelection(); await f.drain();
  assert.equal(f.flow.view().continuations, 0);
});
test('busy watchdog warns without stopping automation or reading Git', async () => {
  const f = fixture({ busy: true }); await f.flow.start();
  const first = f.flow.watchdog;
  f.observe({ visibility: 'hidden' }); await f.drain();
  assert.equal(f.flow.watchdog, first);
  f.observe({ assistantRevision: 2 }); await f.drain();
  assert.notEqual(f.flow.watchdog, first);
  const id = f.flow.watchdog, timeout = f.timers.get(id); f.timers.delete(id); timeout.fn();
  assert.equal(f.flow.view().warning, 'STALL_WARNING');
  assert.equal(f.flow.view().enabled, true);
  assert.equal(f.reads(), 0);
  assert.deepEqual(f.sends, []);
  f.observe({ assistantRevision: 3 }); await f.drain();
  assert.equal(f.flow.view().warning, null);
  await f.finish(); assert.deepEqual(f.sends, ['Продолжай']);
});
test('timers never poll an idle plan after a confirmed Send', async () => {
  const f = fixture(); await f.flow.start(); const reads = f.reads();
  for (const [id, value] of [...f.timers]) { f.timers.delete(id); value.fn(); }
  await settle();
  assert.equal(f.reads(), reads);
  assert.deepEqual(f.sends, ['Продолжай']);
});
test('persistent enabled choice resumes busy and consumed checkpoints without another Send', async () => {
  for (const kind of ['busy', 'draft', 'done', 'off', 'sent', 'sending']) {
    const f = fixture({ busy: kind === 'busy' });
    if (kind === 'draft') f.observe({ draftPresent: true });
    if (kind === 'done') f.plan.planView.tasks.forEach(t => { t.status = 'done'; });
    const checkpoint = ['sent', 'sending'].includes(kind) ? { key: JSON.stringify(['/project', 'chat', 'scope', f.selected().chatUrl]), turnId: 'a1234', status: kind } : null;
    f.flow.restore(kind !== 'off', checkpoint); await f.flow.recover(); await f.drain();
    assert.deepEqual(f.sends, [], kind);
    if (kind === 'busy') { await f.finish(); assert.deepEqual(f.sends, ['Продолжай']); }
    if (kind === 'sending') assert.equal(f.flow.view().reason, 'SEND_UNKNOWN');
  }
});
test('checkpoint is saved before Send and failed persistence never sends', async () => {
  const order = [], f = fixture();
  f.flow.saveCheckpoint = async checkpoint => { order.push(checkpoint.status); };
  const send = f.flow.send; f.flow.send = async (...args) => { order.push('Send'); return send(...args); };
  await f.flow.start();
  assert.deepEqual(order, ['sending', 'Send', 'sent']);
  const failed = fixture(); failed.flow.saveCheckpoint = async () => { throw Error('private-disk-error'); };
  await failed.flow.start(); assert.deepEqual(failed.sends, []);
  assert.equal(failed.flow.view().reason, 'SEND_ERROR');
  assert.equal(failed.flow.view().enabled, true);
  assert.doesNotMatch(JSON.stringify(failed.events), /private-disk-error/);
});
test('UI publication only wakes automation when availability changes', async () => {
  const f = fixture(); f.flow.onChange = () => f.flow.availabilityChanged();
  await f.flow.start(); const reads = f.reads();
  for (let i = 0; i < 10; i++) f.flow.availabilityChanged();
  await f.drain();
  assert.equal(f.reads(), reads);
  assert.deepEqual(f.sends, ['Продолжай']);
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
test('real Composer keeps the AutoPlan guard valid for its own insertion and inFlight', async () => {
  const f = fixture();
  const composer = new ChatGPTComposer({ getURL: () => f.selected().chatUrl }, { wait: async () => {} });
  f.flow.available = () => !composer.inFlight;
  let clicks = 0;
  composer.inspect = async ({ action = 'inspect' } = {}) => {
    const observation = { userMessageCount: 1, editorAvailable: true, writable: true, login: false,
      busy: false, sendEnabled: true, draftLength: f.state.draftPresent ? 1 : 0 };
    if (action === 'fill') { f.observe({ draftPresent: true }); return { ...observation, action: 'filled' }; }
    if (action === 'send') {
      clicks++; f.observe({ draftPresent: false, busy: true });
      return { ...observation, action: 'clicked' };
    }
    return observation;
  };
  f.flow.send = (text, canContinue, onBeforeSend) => composer.sendUserMessage({
    text, canContinue, onBeforeSend, waitForAcknowledgement: false });
  await f.flow.start(); await f.drain();
  assert.equal(clicks, 1);
  assert.equal(f.flow.view().continuations, 1);
  assert.equal(f.flow.checkpoint.status, 'sent');
});
test('a different idle turn arriving during inspection cannot reuse the previous pause', async () => {
  const f = fixture(); let first = true;
  f.setInspectGate(async () => { if (first) { first = false; f.observe({ turnId: 'b1234', assistantRevision: 1 }); } });
  await f.flow.start(); await f.drain();
  assert.deepEqual(f.sends, ['Продолжай']);
  assert.equal(f.flow.checkpoint.turnId, 'b1234');
});
