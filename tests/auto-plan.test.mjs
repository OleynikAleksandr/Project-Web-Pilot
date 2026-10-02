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
  const timers = new Map(), sends = []; let timerId = 0, sendResult = { state: 'sent' }, gate = null;
  const flow = new AutoPlan({ selected: () => selected, inspectPlan: async () => structuredClone(plan),
    send: async (text, current, before) => { if (gate) await gate(); if (!current() || !await before()) return { state: 'cancelled' }; sends.push(text); return sendResult; },
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
  return { flow, plan, sends, observe, drain, finish, timers,
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

test('watchdog uses content progress, ignores decorative updates, and never clicks Stop or sends again', async () => {
  const f = fixture(); await f.flow.start();
  f.observe({ busy: true });
  const first = f.flow.watchdog;
  f.observe({ busy: true, visibility: 'hidden' });
  assert.equal(f.flow.watchdog, first, 'cosmetic events do not reset the deadline');
  f.observe({ busy: true, assistantRevision: 2 });
  assert.notEqual(f.flow.watchdog, first);
  const timeout = f.timers.get(f.flow.watchdog);
  timeout.fn();
  assert.equal(f.flow.view().phase, 'paused');
  assert.match(f.flow.view().message, /Три минуты/);
  assert.equal(f.sends.length, 1);
  await f.finish(); assert.equal(f.sends.length, 1, 'late completion cannot restart a paused run');
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
test('explicit off, completed plan, different conversation and restart never resume implicitly', async () => {
  for (const reason of ['off','complete','selection','reload']) {
    const f = fixture(); await f.flow.start(); f.observe({ manualStopRevision: 1 });
    if (reason === 'off') f.flow.pause('off');
    if (reason === 'complete') f.plan.planView.tasks.forEach(t => { t.status = 'done'; });
    if (reason === 'selection') { f.changeSelection(); f.flow.selectionChanged(); }
    if (reason === 'reload') f.flow.observe({ reset: true });
    f.observe({ manualSendRevision: 1, busy: true }); await f.drain();
    assert.equal(f.flow.view().enabled, false, reason);
    assert.equal(f.sends.length, 1);
  }
});
