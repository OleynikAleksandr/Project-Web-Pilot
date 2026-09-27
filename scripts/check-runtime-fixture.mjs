import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { installer, sessionPlans, plan as planApi, VERSION } from '@webpilot/workflow-kit';

function run(executable, args, cwd) {
  return execFileSync(executable, args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

function git(root, ...args) {
  return run('git', args, root);
}

async function filesBelow(directory, prefix = '') {
  const result = [];
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const relative = prefix ? prefix + '/' + entry.name : entry.name;
    if (entry.isDirectory()) result.push(...await filesBelow(path.join(directory, entry.name), relative));
    else if (entry.isFile()) result.push(relative);
  }
  return result.sort();
}

async function digestFiles(root, files) {
  const digest = createHash('sha256');
  for (const file of files) {
    const text = (await fs.readFile(path.join(root, file), 'utf8')).replace(/\r\n/g, '\n');
    digest.update(file + '\0' + text + '\0');
  }
  return digest.digest('hex');
}

function workflow(root, ...args) {
  const output = run(process.execPath, [path.join(root, 'scripts/workflow.mjs'), ...args], root);
  const parsed = JSON.parse(output);
  assert.equal(parsed.ok, true, 'Workflow command failed: ' + output);
  return parsed;
}

function workflowFailure(root, ...args) {
  try {
    const output = run(process.execPath, [path.join(root, 'scripts/workflow.mjs'), ...args], root);
    const parsed = JSON.parse(output);
    assert.equal(parsed.ok, false, 'Workflow command unexpectedly succeeded: ' + output);
    return parsed;
  } catch (error) {
    const output = String(error.stdout || error.stderr || '').trim();
    const parsed = JSON.parse(output);
    assert.equal(parsed.ok, false, 'Workflow command unexpectedly succeeded: ' + output);
    return parsed;
  }
}

const root = await fs.mkdtemp(path.join(os.tmpdir(), 'workflow-kit-package-'));
try {
  git(root, 'init', '-b', 'main');
  git(root, 'config', 'user.name', 'Workflow Kit Test');
  git(root, 'config', 'user.email', 'workflow-kit@test.local');
  await fs.mkdir(path.join(root, 'docs/planning'), { recursive: true });
  await fs.writeFile(path.join(root, 'docs/planning/fixture.md'), '# Fixture plan\n\nRuntime package verification fixture.\n');
  await fs.writeFile(path.join(root, 'README.md'), '# Fixture\n');
  git(root, 'add', 'README.md', 'docs/planning/fixture.md');
  git(root, 'commit', '-m', 'test: fixture baseline');

  const installed = installer.install({ project: root, mode: 'existing' });
  assert.equal(installed.ok, true);
  assert.equal(installed.version, VERSION);

  const manifest = JSON.parse(await fs.readFile(path.join(root, '.harness/kit-manifest.json'), 'utf8'));
  assert.equal(manifest.version, VERSION);

  const runtimeRoot = path.join(root, '.harness/kit');
  const runtimeFiles = await filesBelow(runtimeRoot);
  const runtimeSha256 = await digestFiles(runtimeRoot, runtimeFiles);
  assert.ok(runtimeFiles.length > 0);
  assert.match(runtimeSha256, /^[a-f0-9]{64}$/);

  const inspected = installer.inspect({ project: root, mode: 'existing' });
  assert.equal(inspected.installed, true);
  assert.equal(inspected.compatible, true);
  assert.equal(inspected.conflicts.length, 0);

  const headBeforeReconnect = git(root, 'rev-parse', 'HEAD');
  const reconnected = installer.install({ project: root, mode: 'existing', update: true });
  assert.equal(reconnected.ok, true);
  assert.equal(git(root, 'rev-parse', 'HEAD'), headBeforeReconnect, 'same-version reconnect unexpectedly committed changes');

  const planInput = {
    id: 'fixture-current-plan',
    spec: 'docs/planning/fixture.md',
    objective: 'Verify checkout-scoped current plan and recovery through installed runtime',
    tasks: [{
      id: 'T001',
      title: 'Fixture task',
      files: ['README.md'],
      acceptance: ['Installed runtime uses one current checkout plan']
    }]
  };
  const inputFile = path.join(root, '.harness/runtime/fixture-plan.json');
  await fs.mkdir(path.dirname(inputFile), { recursive: true });
  await fs.writeFile(inputFile, JSON.stringify(planInput));

  const created = workflow(root, 'plan:create', '--input', inputFile);
  assert.equal(created.state?.scope_id, 'fixture-current-plan');

  const status = workflow(root, 'status');
  assert.equal(status.scope_id, 'fixture-current-plan');
  assert.equal(status.recovery_completeness, 'COMPLETE');

  const recovered = workflow(root, 'recover', '--format', 'json');
  assert.equal(recovered.completeness, 'COMPLETE');
  assert.equal(recovered.plan_id, 'fixture-current-plan');

  const compatA = workflow(root, 'status', '--session', 'legacy-session-a');
  const compatB = workflow(root, 'status', '--session', 'legacy-session-b');
  assert.equal(compatA.scope_id, status.scope_id);
  assert.equal(compatB.scope_id, status.scope_id);
  assert.equal(compatA.plan_revision, status.plan_revision);
  assert.equal(compatB.plan_revision, status.plan_revision);

  const viewA = workflow(root, 'plan:view', '--session', 'legacy-session-a');
  const viewB = sessionPlans.sessionPlanView(root, 'legacy-session-b');
  assert.equal(viewA.plan_id, 'fixture-current-plan');
  assert.equal(viewB.plan_id, 'fixture-current-plan');
  assert.deepEqual(viewA.prepared, []);
  assert.deepEqual(viewB.prepared, []);
  assert.equal(Object.hasOwn(viewA.plan, 'owner_session_id'), false);
  assert.equal(Object.hasOwn(viewA.plan, 'prepared_in_session_id'), false);

  // Legacy migration: valid todo-plan.md always wins, even when several old
  // session plans are ACTIVE. Historical size must not affect normal readiness.
  const planFile = path.join(root, '.harness/plans/todo-plan.md');
  const currentBeforeLegacy = planApi.readPlan(root);
  const ownedCurrent = structuredClone(currentBeforeLegacy);
  ownedCurrent.owner_session_id = 'legacy-current-owner';
  ownedCurrent.prepared_in_session_id = 'legacy-origin';
  ownedCurrent.session_experience = 'chat';
  await fs.writeFile(planFile, planApi.renderPlan(ownedCurrent));

  function legacyPlan(scopeId, owner, objective = 'Legacy unfinished session plan') {
    const candidate = structuredClone(currentBeforeLegacy);
    candidate.scope_id = scopeId;
    candidate.objective = objective;
    candidate.owner_session_id = owner;
    candidate.prepared_in_session_id = 'legacy-origin';
    candidate.session_experience = 'chat';
    for (const task of candidate.tasks) task.commit_ref.scope_id = scopeId;
    return planApi.renderPlan(candidate);
  }

  const bySession = path.join(root, '.harness/plans/by-session');
  const byId = path.join(root, '.harness/plans/by-id');
  await fs.mkdir(bySession, { recursive: true });
  await fs.mkdir(byId, { recursive: true });
  const legacyA = legacyPlan('legacy-active-a', 'legacy-session-a');
  const legacyB = legacyPlan('legacy-active-b', 'legacy-session-b');
  const oversizedHistory = legacyPlan('legacy-oversized', 'legacy-session-big', 'X'.repeat(190000));
  await fs.writeFile(path.join(bySession, 'session-a.md'), legacyA);
  await fs.writeFile(path.join(bySession, 'session-b.md'), legacyB);
  await fs.writeFile(path.join(byId, 'oversized.md'), oversizedHistory);

  const inspectedWithHistory = installer.inspect({ project: root, mode: 'existing' });
  assert.equal(inspectedWithHistory.state?.ok, true, 'historical plans unexpectedly block readiness');
  assert.equal(workflow(root, 'status').scope_id, 'fixture-current-plan');

  const migrated = sessionPlans.migrateLegacyPlans(root);
  assert.equal(migrated.archived.length, 3);
  assert.equal(migrated.current_normalized, true);
  const migratedCurrent = planApi.readPlan(root);
  assert.equal(migratedCurrent.scope_id, 'fixture-current-plan');
  assert.equal(migratedCurrent.plan_revision, ownedCurrent.plan_revision + 1);
  assert.equal(Object.hasOwn(migratedCurrent, 'owner_session_id'), false);
  assert.equal(Object.hasOwn(migratedCurrent, 'prepared_in_session_id'), false);
  for (const record of migrated.archived) {
    assert.equal(await fs.readFile(path.join(root, record.archive_path), 'utf8'),
      record.path.endsWith('session-a.md') ? legacyA : record.path.endsWith('session-b.md') ? legacyB : oversizedHistory);
    await assert.rejects(fs.access(path.join(root, record.path)));
  }

  const repeatedMigration = sessionPlans.migrateLegacyPlans(root);
  assert.equal(repeatedMigration.archived.length, 0);
  assert.deepEqual(repeatedMigration.changed_paths, []);

  // Invalid canonical current state is a hard stop before any legacy write.
  await fs.mkdir(bySession, { recursive: true });
  const preservedSource = path.join(bySession, 'must-stay.md');
  await fs.writeFile(preservedSource, legacyA);
  const validCurrentText = await fs.readFile(planFile, 'utf8');
  await fs.writeFile(planFile, '# broken current plan\n');
  assert.throws(() => sessionPlans.migrateLegacyPlans(root));
  assert.equal(await fs.readFile(preservedSource, 'utf8'), legacyA);
  await fs.writeFile(planFile, validCurrentText);
  const finalMigration = sessionPlans.migrateLegacyPlans(root);
  assert.equal(finalMigration.archived.length, 1);
  assert.equal(await fs.readFile(path.join(root, finalMigration.archived[0].archive_path), 'utf8'), legacyA);

  // The hard transport limit still applies to the current plan. History is
  // excluded, but an oversized current execution context must fail explicitly.
  const strictCurrent = planApi.readPlan(root);
  strictCurrent.objective = 'Y'.repeat(190000);
  await fs.writeFile(planFile, planApi.renderPlan(strictCurrent));
  const oversizedCurrent = workflowFailure(root, 'recover', '--format', 'json');
  assert.equal(oversizedCurrent.code, 'CONTEXT_TOO_LARGE');
  await fs.writeFile(planFile, validCurrentText);
  assert.equal(workflow(root, 'recover', '--format', 'json').completeness, 'COMPLETE');

  // A second Git worktree has an independent todo-plan.md filesystem state.
  const worktreePath = root + '-isolation-worktree';
  git(root, 'worktree', 'add', '-b', 'fixture-isolation', worktreePath);
  try {
    const mainRevision = planApi.readPlan(root).plan_revision;
    const isolatedPlan = planApi.readPlan(worktreePath);
    isolatedPlan.plan_revision += 100;
    await fs.writeFile(path.join(worktreePath, '.harness/plans/todo-plan.md'), planApi.renderPlan(isolatedPlan));
    const isolatedStatus = workflow(worktreePath, 'status');
    assert.equal(isolatedStatus.plan_revision, isolatedPlan.plan_revision);
    assert.equal(workflow(root, 'status').plan_revision, mainRevision);
  } finally {
    git(root, 'worktree', 'remove', '--force', worktreePath);
  }

  const removed = workflowFailure(root, 'plan:prepare', '--input', inputFile, '--session', 'legacy-session-a');
  assert.equal(removed.code, 'COMMAND_REMOVED');
  const wrongPlan = workflowFailure(root, 'status', '--plan', 'historical-plan');
  assert.equal(wrongPlan.code, 'PLAN_NOT_CURRENT');

  process.stdout.write(JSON.stringify({
    ok: true,
    version: VERSION,
    installedRuntimeFiles: runtimeFiles.length,
    installedRuntimeSha256: runtimeSha256,
    currentPlan: viewA.plan_id,
    recovery: recovered.completeness,
    compatibilitySessions: true,
    sessionOwnershipRemoved: true,
    reconnectHeadStable: true
  }, null, 2) + '\n');
} finally {
  await fs.rm(root, { recursive: true, force: true });
}
