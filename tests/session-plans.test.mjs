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
