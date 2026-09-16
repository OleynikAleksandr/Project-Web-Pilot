import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { emptyPlan, writePlan, readPlan, FINAL_DOCUMENTATION_TASK_TITLE } from '../resources/workflow-kit/lib/plan.mjs';
import { defaultConfig } from '../resources/workflow-kit/lib/validate.mjs';
import { createScope, startTask, applyPlan, archive } from '../resources/workflow-kit/lib/actions.mjs';
import { commitTask } from '../resources/workflow-kit/lib/transaction.mjs';
import { recover } from '../resources/workflow-kit/lib/recovery.mjs';

const env = { ...process.env, GIT_AUTHOR_NAME: 'Workflow Test', GIT_AUTHOR_EMAIL: 'workflow@example.invalid',
  GIT_COMMITTER_NAME: 'Workflow Test', GIT_COMMITTER_EMAIL: 'workflow@example.invalid' };
function git(root, ...args) { return execFileSync('git', args, { cwd: root, env, encoding: 'utf8' }).trim(); }

async function fixture(t) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'workflow-recovery-v2-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  await fs.mkdir(path.join(root, '.harness/plans'), { recursive: true });
  await fs.mkdir(path.join(root, '.harness/kit'), { recursive: true });
  await fs.mkdir(path.join(root, 'docs/modules'), { recursive: true });
  await fs.mkdir(path.join(root, 'docs/architecture'), { recursive: true });
  await fs.mkdir(path.join(root, 'src'), { recursive: true });
  await fs.copyFile(new URL('../resources/workflow-kit/WORKFLOW.md', import.meta.url), path.join(root, '.harness/kit/WORKFLOW.md'));
  await fs.writeFile(path.join(root, '.harness/workflow.json'), JSON.stringify(defaultConfig(), null, 2) + '\n');
  writePlan(root, emptyPlan('Recovery Fixture'));
  await fs.writeFile(path.join(root, 'docs/architecture/OVERVIEW.md'), '# Краткая архитектура проекта\n\nOVERVIEW_REQUIRED\n');
  await fs.writeFile(path.join(root, 'docs/MODULES.md'), '# Модули проекта\n\nFixture module map.\n');
  await fs.writeFile(path.join(root, 'docs/modules/module.md'), '# Module Specification — Fixture\n\nMODULE_REQUIRED\n');
  await fs.writeFile(path.join(root, 'docs/optional.md'), '# Optional\n\nOPTIONAL_SECRET_BODY_SHOULD_NOT_BE_COPIED\n');
  await fs.writeFile(path.join(root, 'docs/notes.md'), '# Notes\n\ninitial\n');
  await fs.writeFile(path.join(root, 'docs/DOCUMENTATION_INDEX.md'), '# Каталог документации\n\ndocs/architecture/OVERVIEW.md\ndocs/MODULES.md\ndocs/modules/module.md\ndocs/optional.md\ndocs/notes.md\n');
  await fs.writeFile(path.join(root, 'src/module.mjs'), 'export const value = 1;\n');
  git(root, 'init', '-b', 'main'); git(root, 'config', 'user.name', 'Workflow Test'); git(root, 'config', 'user.email', 'workflow@example.invalid');
  git(root, 'add', '.'); git(root, 'commit', '-m', 'baseline');
  return root;
}
function scopeInput(valid = true) {
  return {
    scope_id: 'module-change-001', objective: 'Изменить fixture module', approval_note: 'Пользователь согласовал контракт fixture module.',
    acceptance_criteria: ['Контракт реализован'],
    approved_scope: { functional_paths: ['src/module.mjs'], documentation_paths: ['docs/modules/module.md', 'docs/notes.md'], max_functional_files_per_task: 3 },
    context_pack: { documents: valid ? [
      { path: 'docs/architecture/OVERVIEW.md', heading_path: ['Краткая архитектура проекта'], required: true, revision: 'WORKTREE' },
      { path: 'docs/modules/module.md', heading_path: ['Module Specification — Fixture'], required: true, revision: 'WORKTREE' },
      { path: 'docs/optional.md', heading_path: ['Optional'], required: false, revision: 'WORKTREE' },
    ] : [], include_last_completed_task: false, dependency_task_ids: [] },
    tasks: [
      { id: 'T001', title: 'Уточнить specification', why: 'Подготовить контракт', dependencies: [], functional_paths: [], documentation_paths: ['docs/modules/module.md'], acceptance_criteria: ['Specification уточнена'], verification_ids: [], expected_commit_message: 'docs: уточнить specification' },
      { id: 'T002', title: 'Записать независимую заметку', why: 'Создать более поздний unrelated commit', dependencies: ['T001'], functional_paths: [], documentation_paths: ['docs/notes.md'], acceptance_criteria: ['Заметка записана'], verification_ids: [], expected_commit_message: 'docs: записать заметку' },
      { id: 'T003', title: 'Реализовать модуль', why: 'Реализовать согласованный контракт', dependencies: ['T001'], functional_paths: ['src/module.mjs'], documentation_paths: ['docs/modules/module.md'], acceptance_criteria: ['Код соответствует specification'], verification_ids: [], expected_commit_message: 'feat: реализовать модуль' },
    ],
  };
}
function continuityScopeInput() {
  return {
    scope_id: 'continuity-acceptance-001', objective: 'Проверить lifecycle универсального проекта',
    approval_note: 'Пользователь согласовал проверку continuity lifecycle.', acceptance_criteria: ['Этап проходит через DOCS и пользовательскую приёмку'],
    approved_scope: { functional_paths: [], documentation_paths: ['docs/notes.md'], max_functional_files_per_task: 3 },
    context_pack: { documents: [], include_last_completed_task: false, dependency_task_ids: [] },
    tasks: [{ id: 'T001', title: 'Подготовить результат этапа', why: 'Создать проверяемое изменение проекта', dependencies: [],
      functional_paths: [], documentation_paths: ['docs/notes.md'], acceptance_criteria: ['Результат подготовлен'], verification_ids: [], expected_commit_message: 'docs: подготовить результат этапа' }],
  };
}

test('NONE plan keeps project navigation and scope:create appends the mandatory documentation finalizer', async t => {
  const root = await fixture(t);
  const none = readPlan(root);
  assert.equal(none.objective, 'Обсудите следующий этап проекта с пользователем.');
  assert.deepEqual(none.context_pack.documents.slice(0, 3).map(doc => doc.path), [
    'docs/architecture/OVERVIEW.md', 'docs/MODULES.md', 'docs/DOCUMENTATION_INDEX.md',
  ]);
  createScope(root, scopeInput(true));
  const active = readPlan(root);
  const finalTask = active.tasks.at(-1);
  assert.equal(finalTask.id, 'DOCS');
  assert.equal(finalTask.title, FINAL_DOCUMENTATION_TASK_TITLE);
  assert.deepEqual(finalTask.dependencies, ['T001', 'T002', 'T003']);
  assert.ok(finalTask.documentation_paths.includes('docs/DOCUMENTATION_INDEX.md'));
  for (const required of ['docs/architecture/OVERVIEW.md', 'docs/MODULES.md', 'docs/DOCUMENTATION_INDEX.md']) {
    assert.ok(active.context_pack.documents.some(doc => doc.path === required && doc.required));
  }
});

test('READY_FOR_ACCEPTANCE requires DOCS and archive returns a contextual NONE plan', async t => {
  const root = await fixture(t);
  createScope(root, continuityScopeInput());
  let plan = readPlan(root);
  assert.equal(plan.delivery_status, 'IN_PROGRESS');
  assert.equal(plan.tasks.at(-1).id, 'DOCS');
  assert.deepEqual(plan.tasks.at(-1).dependencies, ['T001']);

  startTask(root, 'T001');
  await fs.appendFile(path.join(root, 'docs/notes.md'), '\nRESULT_READY\n');
  const implementation = commitTask(root, 'T001');
  plan = readPlan(root);
  assert.equal(plan.delivery_status, 'IN_PROGRESS');
  assert.equal(plan.tasks.find(task => task.id === 'DOCS').commit_status, 'PENDING');

  startTask(root, 'DOCS');
  const docsPacket = recover(root, 'manual');
  assert.equal(docsPacket.included.includes(implementation.sha), false, 'DOCS ordering dependency is not copied as commit diff');
  assert.doesNotMatch(docsPacket.text, /RESULT_READY/, 'DOCS recovery does not replay completed implementation diff');
  commitTask(root, 'DOCS');
  plan = readPlan(root);
  assert.equal(plan.execution_scope_status, 'ACTIVE');
  assert.equal(plan.delivery_status, 'READY_FOR_ACCEPTANCE');
  assert.equal(git(root, 'status', '--porcelain'), '');
  assert.match(recover(root, 'manual').text, /Финальная актуализация документации завершена/);

  archive(root, plan.scope_id, 'Пользователь принял результат и поручил закрыть этот scope.');
  const none = readPlan(root);
  assert.equal(none.execution_scope_status, 'NONE');
  assert.equal(none.archived_scope_id, 'continuity-acceptance-001');
  assert.equal(none.objective, 'Обсудите следующий этап проекта с пользователем.');
  assert.deepEqual(none.tasks, []);
  for (const required of ['docs/architecture/OVERVIEW.md', 'docs/MODULES.md', 'docs/DOCUMENTATION_INDEX.md']) {
    assert.ok(none.context_pack.documents.some(doc => doc.path === required && doc.required));
  }
  const packet = recover(root, 'startup');
  assert.match(packet.text, /OVERVIEW_REQUIRED/);
  assert.match(packet.text, /Fixture module map/);
  assert.match(packet.text, /Обсудите следующий этап проекта с пользователем/);
  assert.equal(git(root, 'status', '--porcelain'), '');
});

test('READY_FOR_ACCEPTANCE can reopen for corrections and rerun DOCS with an unambiguous iteration', async t => {
  const root = await fixture(t);
  createScope(root, continuityScopeInput());
  startTask(root, 'T001');
  await fs.appendFile(path.join(root, 'docs/notes.md'), '\nFIRST_RESULT\n');
  commitTask(root, 'T001');
  startTask(root, 'DOCS');
  const firstDocs = commitTask(root, 'DOCS');
  let plan = readPlan(root);
  assert.equal(plan.delivery_status, 'READY_FOR_ACCEPTANCE');
  assert.equal(plan.tasks.at(-1).commit_ref.iteration, undefined);

  const correction = { id: 'T002', title: 'Исправить результат после проверки', why: 'Учесть замечание пользователя',
    dependencies: ['T001'], functional_paths: [], documentation_paths: ['docs/notes.md'],
    acceptance_criteria: ['Исправление внесено'], verification_ids: [], expected_commit_message: 'docs: исправить результат',
    implementation_status: 'TODO', commit_status: 'PENDING',
    commit_ref: { scope_id: plan.scope_id, task_id: 'T002', role: 'implementation' } };
  applyPlan(root, { tasks: [...plan.tasks, correction] }, plan.plan_revision);
  plan = readPlan(root);
  assert.equal(plan.delivery_status, 'IN_PROGRESS');
  assert.equal(plan.tasks.at(-1).id, 'DOCS');
  assert.equal(plan.tasks.at(-1).commit_status, 'PENDING');
  assert.equal(plan.tasks.at(-1).commit_ref.iteration, 2);
  assert.deepEqual(plan.tasks.at(-1).dependencies, ['T001', 'T002']);

  startTask(root, 'T002');
  await fs.appendFile(path.join(root, 'docs/notes.md'), '\nCORRECTED_RESULT\n');
  commitTask(root, 'T002');
  startTask(root, 'DOCS');
  assert.doesNotThrow(() => recover(root, 'manual'));
  const secondDocs = commitTask(root, 'DOCS');
  plan = readPlan(root);
  assert.equal(plan.delivery_status, 'READY_FOR_ACCEPTANCE');
  assert.equal(plan.tasks.at(-1).commit_ref.iteration, 2);
  assert.notEqual(secondDocs.sha, firstDocs.sha);
  const log = git(root, 'log', '--format=%B', plan.baseline_commit + '..HEAD');
  assert.match(log, /Workflow-Task: DOCS[\s\S]*Workflow-Iteration: 2/);
  assert.equal((log.match(/Workflow-Task: DOCS/g) ?? []).length, 2);
  assert.doesNotThrow(() => recover(root, 'manual'));
});

test('functional scope requires compact overview and module specification', async t => {
  const root = await fixture(t);
  assert.throws(() => createScope(root, scopeInput(false)), error => error?.code === 'MODULE_CONTEXT_REQUIRED');
  assert.equal(git(root, 'status', '--porcelain'), '');
});

test('Recovery v2 sends required module context, references optional docs, and includes only direct dependency commits', async t => {
  const root = await fixture(t);
  createScope(root, scopeInput(true));
  startTask(root, 'T001');
  await fs.appendFile(path.join(root, 'docs/modules/module.md'), '\nT001_CHANGE\n');
  const first = commitTask(root, 'T001');
  startTask(root, 'T002');
  await fs.appendFile(path.join(root, 'docs/notes.md'), '\nT002_UNRELATED_CHANGE\n');
  const second = commitTask(root, 'T002');
  const packet = recover(root, 'startup');
  assert.equal(packet.next_task_id, 'T003');
  assert.equal(packet.soft_exceeded, packet.size.tokens > defaultConfig().budget.soft_tokens);
  assert.match(packet.text, /## Workflow Core/);
  assert.doesNotMatch(packet.text, /## Обязательные правила/);
  assert.match(packet.text, /OVERVIEW_REQUIRED/);
  assert.match(packet.text, /MODULE_REQUIRED/);
  assert.match(packet.text, /docs\/optional\.md → Optional/);
  assert.doesNotMatch(packet.text, /OPTIONAL_SECRET_BODY_SHOULD_NOT_BE_COPIED/);
  assert.match(packet.text, new RegExp(first.sha));
  assert.doesNotMatch(packet.text, new RegExp('ДАННЫЕ: commit ' + second.sha + ' / T002'));
  assert.doesNotMatch(packet.text, /T002_UNRELATED_CHANGE/);
  assert.ok(packet.size.bytes < 60000, `unexpected recovery size: ${packet.size.bytes}`);
});

test('Recovery v2 reports largest sections when required context exceeds transport budget', async t => {
  const root = await fixture(t);
  createScope(root, scopeInput(true));
  startTask(root, 'T001');
  await fs.appendFile(path.join(root, 'docs/modules/module.md'), '\n' + 'x'.repeat(190000));
  assert.throws(() => recover(root), error => {
    assert.equal(error?.code, 'CONTEXT_TOO_LARGE');
    assert.equal(error.details?.budget?.hard_bytes, 180000);
    assert.ok(error.details?.largest_sections?.[0]?.bytes > 180000);
    assert.ok(error.details.largest_sections.some(section => /required:docs\/modules\/module\.md/.test(section.label)));
    return true;
  });
});
