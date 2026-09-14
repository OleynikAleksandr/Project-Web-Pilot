import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { emptyPlan, writePlan } from '../resources/workflow-kit/lib/plan.mjs';
import { defaultConfig } from '../resources/workflow-kit/lib/validate.mjs';
import { createScope, startTask } from '../resources/workflow-kit/lib/actions.mjs';
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
  await fs.writeFile(path.join(root, 'docs/modules/module.md'), '# Module Specification — Fixture\n\nMODULE_REQUIRED\n');
  await fs.writeFile(path.join(root, 'docs/optional.md'), '# Optional\n\nOPTIONAL_SECRET_BODY_SHOULD_NOT_BE_COPIED\n');
  await fs.writeFile(path.join(root, 'docs/notes.md'), '# Notes\n\ninitial\n');
  await fs.writeFile(path.join(root, 'docs/DOCUMENTATION_INDEX.md'), '# Index\n\ndocs/architecture/OVERVIEW.md\ndocs/modules/module.md\ndocs/optional.md\ndocs/notes.md\n');
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
