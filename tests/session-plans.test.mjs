import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { emptyPlan, renderPlan, readPlan, writePlan } from '../resources/workflow-kit/lib/plan.mjs';
import { sessionPlanView, selectPlan, withSessionPlan, ownedPlanPath } from '../resources/workflow-kit/lib/session-plans.mjs';

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'session-plans-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.mkdirSync(path.join(root, '.harness/plans/by-id'), { recursive: true });
  const base = emptyPlan('Fixture');
  writePlan(root, base);
  const put = (id, owner, origin = null) => {
    const p = { ...base, scope_id: id, owner_session_id: owner, prepared_in_session_id: origin,
      execution_scope_status: 'ACTIVE', baseline_commit: 'a'.repeat(40), objective: id, acceptance_criteria: ['done'],
      approved_scope: { functional_paths: [], documentation_paths: ['docs/notes.md'], max_functional_files_per_task: 3 },
      tasks: [{ id: 'T1', title: id, why: 'fixture', dependencies: [], functional_paths: [], documentation_paths: ['docs/notes.md'],
        acceptance_criteria: ['done'], verification_ids: [], expected_commit_message: 'docs: ' + id,
        implementation_status: 'TODO', commit_status: 'PENDING', commit_ref: { scope_id: id, task_id: 'T1', role: 'implementation' } }] };
    fs.writeFileSync(path.join(root, ownedPlanPath(id)), renderPlan(p)); return p;
  };
  return { root, put, base };
}
test('returning to either session preserves its own unfinished plan and an empty session stays NONE', t => {
  const { root, put, base } = fixture(t);
  put('alpha', 'session-a'); put('beta', 'session-b');
  assert.equal(sessionPlanView(root, 'session-a').plan_id, 'alpha');
  assert.equal(sessionPlanView(root, 'session-b').plan_id, 'beta');
  const empty = sessionPlanView(root, 'session-new');
  assert.equal(empty.plan.scope_id, null); assert.equal(empty.plan.project_id, base.project_id);
  assert.equal(empty.plan.context_pack.documents.length, 3);
  assert.throws(() => selectPlan(root), { code: 'SESSION_REQUIRED' });
  assert.throws(() => selectPlan(root, { sessionId: 'session-a', planId: 'beta' }), { code: 'PLAN_OWNER_MISMATCH' });
});
test('a prepared continuation is one file and async readers cannot redirect each other', async t => {
  const { root, put } = fixture(t); put('alpha', 'session-a'); put('future', null, 'session-a');
  const view = sessionPlanView(root, 'session-a');
  assert.equal(view.prepared[0].plan_id, 'future');
  const values = await Promise.all([
    withSessionPlan(root, { sessionId: 'session-a' }, async () => { await Promise.resolve(); return readPlan(root).scope_id; }),
    withSessionPlan(root, { sessionId: 'empty' }, async () => { await Promise.resolve(); return readPlan(root).scope_id; }),
  ]);
  assert.deepEqual(values, ['alpha', null]);
  assert.equal(readPlan(root).scope_id, null);
  put('future', 'session-b', 'session-a');
  assert.equal(sessionPlanView(root, 'session-b').plan_id, 'future');
  assert.equal(sessionPlanView(root, 'session-a').prepared[0].plan.owner_session_id, 'session-b');
});
test('ambiguous ownership and path traversal fail without altering source plans', t => {
  const { root, put } = fixture(t);
  put('alpha', 'session-a'); put('beta', 'session-a');
  assert.throws(() => sessionPlanView(root, 'session-a'), { code: 'PLAN_OWNERSHIP_CONFLICT' });
  assert.throws(() => ownedPlanPath('../outside'), { code: 'PLAN_ID' });
});

import { execFileSync } from 'node:child_process';
import { WorkspaceSetup } from '../src/workspace-setup.mjs';
const environment = { ...process.env, GIT_AUTHOR_NAME: 'Plan Test', GIT_AUTHOR_EMAIL: 'plan@example.invalid', GIT_COMMITTER_NAME: 'Plan Test', GIT_COMMITTER_EMAIL: 'plan@example.invalid' };
for (const key of ['GIT_DIR', 'GIT_WORK_TREE', 'GIT_INDEX_FILE', 'GIT_COMMON_DIR', 'GIT_OBJECT_DIRECTORY', 'GIT_ALTERNATE_OBJECT_DIRECTORIES', 'GIT_PREFIX']) delete environment[key];
async function lifecycleFixture(t) {
  const parent = fs.mkdtempSync(path.join(os.tmpdir(), 'session-plan-lifecycle-'));
  t.after(() => fs.rmSync(parent, { recursive: true, force: true }));
  const setup = new WorkspaceSetup({ environment });
  const preview = await setup.preview({ mode: 'new', parent, name: 'Session fixture' });
  const result = await setup.apply(preview.token);
  assert.equal(result.ready, true, JSON.stringify(result));
  const root = result.workspace;
  let extraEnv = {};
  const cli = (...args) => {
    let stdout;
    try { stdout = execFileSync(process.execPath, ['scripts/workflow.mjs', ...args], { cwd: root, env: { ...environment, ...extraEnv }, encoding: 'utf8', maxBuffer: 4e6 }); }
    catch (error) { stdout = error.stdout; }
    return JSON.parse(stdout);
  };
  cli.setEnvironment = value => { extraEnv = value; };
  const input = value => { const p = path.join(root, '.harness/runtime/input.json'); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, JSON.stringify(value)); return p; };
  const scope = id => ({ scope_id: id, objective: id, approval_note: 'Пользователь согласовал эту проверку.', acceptance_criteria: ['Done'],
    approved_scope: { functional_paths: [], documentation_paths: ['docs/architecture/OVERVIEW.md'], max_functional_files_per_task: 3 },
    tasks: [{ id: 'T1', title: 'Result', why: 'Fixture', dependencies: [], functional_paths: [], documentation_paths: ['docs/architecture/OVERVIEW.md'],
      acceptance_criteria: ['Done'], verification_ids: [], expected_commit_message: 'docs: fixture result' }] });
  const ok = result => { assert.equal(result.ok, true, JSON.stringify(result)); return result; };
  return { root, cli, input, scope, ok };
}
test('addressed CLI prepares, binds once, commits with real hooks, and continues completed history', async t => {
  const { root, cli, input, scope, ok } = await lifecycleFixture(t);
  ok(cli('scope:create', '--session', 'a', '--input', input(scope('alpha')), '--expected-revision', '1'));
  let a = ok(cli('plan:view', '--session', 'a'));
  ok(cli('plan:prepare', '--session', 'a', '--input', input(scope('beta')), '--expected-revision', String(a.plan.plan_revision)));
  a = ok(cli('plan:view', '--session', 'a'));
  assert.equal(a.plan_id, 'alpha'); assert.equal(a.prepared.length, 1);
  let draft = a.prepared[0].plan;
  const bound = ok(cli('plan:bind', '--session', 'a', '--plan', 'beta', '--target-session', 'b', '--experience', 'work', '--expected-revision', String(draft.plan_revision)));
  assert.equal(bound.session_id, 'b');
  assert.equal(ok(cli('plan:bind', '--session', 'a', '--plan', 'beta', '--target-session', 'c', '--experience', 'chat', '--expected-revision', String(draft.plan_revision))).session_id, 'b');
  assert.equal(cli('task:start', 'T1', '--session', 'a', '--plan', 'beta').code, 'PLAN_OWNER_MISMATCH');
  assert.equal(cli('task:start', 'T1').code, 'SESSION_REQUIRED');
  ok(cli('task:start', 'T1', '--session', 'a'));
  assert.equal(cli('task:start', 'T1', '--session', 'b').code, 'PLAN_WRITER_BUSY');
  fs.appendFileSync(path.join(root, 'docs/architecture/OVERVIEW.md'), '\nA_RESULT\n');
  const first = ok(cli('commit', '--task', 'T1', '--session', 'a'));
  ok(cli('task:start', 'DOCS', '--session', 'a')); ok(cli('commit', '--task', 'DOCS', '--session', 'a'));
  a = ok(cli('plan:view', '--session', 'a'));
  assert.equal(a.plan.delivery_status, 'READY_FOR_ACCEPTANCE');
  const tasks = structuredClone(a.plan.tasks);
  tasks.splice(-1, 0, { ...tasks[0], id: 'T2', dependencies: ['T1'], implementation_status: 'TODO', commit_status: 'PENDING',
    commit_ref: { scope_id: 'alpha', task_id: 'T2', role: 'implementation' } });
  ok(cli('plan:apply', '--session', 'a', '--expected-revision', String(a.plan.plan_revision), '--input', input({ tasks })));
  const continued = ok(cli('plan:view', '--session', 'a')).plan;
  assert.equal(continued.tasks[0].commit_status, 'DONE'); assert.equal(continued.tasks.at(-1).commit_ref.iteration, 2);
  assert.equal(ok(cli('validate', '--session', 'a')).resolved.T1.sha, first.sha);
  assert.equal(ok(cli('plan:view', '--session', 'b')).plan.current_task_id, null);
  assert.equal(ok(cli('plan:view', '--session', 'new')).plan_id, null);
});


test('a failed transaction cannot be resumed by another owner and both failpoints recover exactly once', async t => {
  const { root, cli, input, scope, ok } = await lifecycleFixture(t);
  for (const session of ['a','b']) ok(cli('scope:create', '--session', session, '--input', input(scope(session)), '--expected-revision', '1'));
  assert.equal(cli('task:start','T1','--session','a','--expected-revision','999').code,'REVISION_CHANGED');
  ok(cli('task:start','T1','--session','a'));
  fs.appendFileSync(path.join(root,'docs/architecture/OVERVIEW.md'),'\nCRASH_FIXTURE\n');
  cli.setEnvironment({ WORKFLOW_TEST_FAILPOINT: 'prepared' });
  assert.equal(cli('commit','--task','T1','--session','a').code,'TEST_INTERRUPTION');
  cli.setEnvironment({});
  assert.equal(cli('commit','--task','T1','--session','b').code,'TRANSACTION_TARGET_MISMATCH');
  assert.equal(ok(cli('recover','--session','b','--format','json')).scope_id,'b');
  const committed=ok(cli('commit','--task','T1','--session','a'));
  assert.equal(ok(cli('commit','--task','T1','--session','a')).sha,committed.sha);
  ok(cli('task:start','DOCS','--session','a'));
  cli.setEnvironment({ WORKFLOW_TEST_FAILPOINT: 'committed' });
  assert.equal(cli('commit','--task','DOCS','--session','a').code,'TEST_INTERRUPTION');
  cli.setEnvironment({});
  const docs=ok(cli('commit','--task','DOCS','--session','a'));
  assert.equal(ok(cli('validate','--session','a')).resolved.DOCS.sha,docs.sha);
  assert.equal(ok(cli('plan:view','--session','b')).plan.tasks[0].commit_status,'PENDING');
  ok(cli('archive','--session','a','--scope','a','--approval-note','Пользователь явно поручил закрыть тестовый scope.'));
  const none=ok(cli('plan:view','--session','a'));
  assert.equal(none.plan_id,null);
  ok(cli('scope:create','--session','a','--input',input(scope('a-second')),'--expected-revision',String(none.plan.plan_revision)));
  assert.equal(ok(cli('plan:view','--session','a')).plan_id,'a-second');
});
