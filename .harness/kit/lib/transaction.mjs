import fs from 'node:fs';
import path from 'node:path';
import { PLAN, check, hash, id, json, atomic, withLock, safePath } from './common.mjs';
import { readPlan, renderPlan, parsePlan } from './plan.mjs';
import { validate, journal, taskChecks } from './validate.mjs';
import { git, head, paths, localPath, gitPath, allChanges, ensureIdleGit, identityReady, snapshot } from './git.mjs';

export const saveJournal = (root, data) => atomic(localPath(root, 'transaction.json'), json(data));
export const messageFor = t => t.message + '\n\nWorkflow-Scope: ' + (t.scope_id ?? 'NONE') + '\nWorkflow-Task: ' + (t.task_id ?? t.id) + '\nWorkflow-Role: ' + t.role + '\nWorkflow-Transaction: ' + t.id;
export const locked = (root, fn) => withLock(localPath(root, 'operation.lock'), fn);
export function checkServicePaths(role, files) {
  const patterns = {
    'scope-plan': p => p === PLAN || p.startsWith('docs/') && /\.(md|markdown)$/.test(p),
    'plan-adjustment': p => p === PLAN || p === '.harness/workflow.json' || p.startsWith('docs/') && /\.(md|markdown)$/.test(p),
    repair: p => p === PLAN,
    archive: p => p === PLAN || p.startsWith('.harness/plans/archive/') && p.endsWith('.md'),
    bootstrap: p => p.startsWith('.harness/') || p.startsWith('docs/') || ['AGENTS.md', 'AGENTS.override.md', '.gitignore', '.gitattributes', '.codex/hooks.json', 'scripts/workflow', 'scripts/workflow.mjs', 'scripts/workflow.cmd'].includes(p) || p.startsWith('.husky/'),
    'kit-update': p => p === PLAN || p.startsWith('.harness/kit/') || ['.harness/kit-manifest.json', '.harness/plans/todo-plan.template.md', 'scripts/workflow', 'scripts/workflow.mjs', 'scripts/workflow.cmd', 'AGENTS.md', 'AGENTS.override.md', 'docs/DOCUMENTATION_INDEX.md', 'docs/MODULES.md', 'docs/architecture/OVERVIEW.md'].includes(p),
  };
  check(patterns[role], 'SERVICE_ROLE', 'Недопустимая служебная роль.');
  check(files.every(patterns[role]), 'SERVICE_SCOPE', 'Служебный коммит содержит недопустимые пути.', { files, role });
}
export function completedTransaction(root, t) {
  const now = head(root); if (!now || now === t.before_head) return null;
  const message = git(root, ['log', '-1', '--format=%B']).stdout;
  const trailers = git(root, ['interpret-trailers', '--parse'], { input: message }).stdout;
  if (!trailers.split('\n').includes('Workflow-Transaction: ' + t.id)) return null;
  const parent = git(root, ['rev-parse', 'HEAD^'], { allowFailure: true });
  check((t.before_head === null && parent.status !== 0) || parent.stdout.trim() === t.before_head, 'TRANSACTION_PARENT', 'Родитель коммита не соответствует транзакции.');
  check(git(root, ['rev-parse', 'HEAD^{tree}']).stdout.trim() === t.candidate_tree, 'TRANSACTION_TREE', 'Содержимое коммита отличается от проверенного кандидата.');
  check(message.trim() === messageFor(t).trim(), 'TRANSACTION_MESSAGE', 'Идентичность созданного коммита изменилась.');
  return now;
}
export function finishTransaction(root, t, sha) {
  const evidenceFile = localPath(root, 'last-verification.json');
  if (fs.existsSync(evidenceFile)) {
    const evidence = JSON.parse(fs.readFileSync(evidenceFile, 'utf8'));
    if (evidence.transaction_id === t.id) { evidence.commit = sha; atomic(evidenceFile, json(evidence)); }
  }
  atomic(localPath(root, 'last-commit.json'), json({ sha, scope_id: t.scope_id, task_id: t.task_id, role: t.role, transaction_id: t.id }));
  for (const name of ['transaction.json', 'index-before']) {
    const file = localPath(root, name); if (fs.existsSync(file)) fs.unlinkSync(file);
  }
  return { ok: true, sha, task_id: t.task_id, role: t.role, message: 'Коммит создан и подтверждён.' };
}
export function commitCandidate(root, { plan, role, task = null, selected, message, beforeHead, checks = [] }) {
  ensureIdleGit(root); check(identityReady(root), 'GIT_IDENTITY', 'Git не знает автора. Настройте user.name и user.email; файлы сохранены.');
  let t = journal(root);
  if (t) {
    const existing = completedTransaction(root, t); if (existing) return finishTransaction(root, t, existing);
    check(t.role === role && t.task_id === (task?.id ?? null), 'TRANSACTION_PENDING', 'Сначала завершите предыдущую транзакцию.');
    check(head(root) === t.before_head, 'HEAD_CHANGED', 'HEAD изменён другим процессом; нужен repair --dry-run.');
    const currentHash = hash(fs.readFileSync(path.join(root, PLAN)));
    check([t.original_hash, t.candidate_hash].includes(currentHash), 'PLAN_CHANGED', 'План изменён во время незавершённого commit.');
  }
  const files = [...new Set([...selected, PLAN])].sort();
  for (const p of files) { const f = safePath(root, p); check(!fs.existsSync(f) || fs.statSync(f).isFile(), 'PATH_NOT_FILE', 'В задаче перечисляются файлы, а не каталоги: ' + p); }
  if (role !== 'implementation') checkServicePaths(role, files);
  const staged = paths(root, 'staged');
  check(staged.every(p => files.includes(p)), 'FOREIGN_STAGED', 'В index есть посторонние файлы. Они не будут включены и не будут сняты со staging.', { paths: staged.filter(p => !files.includes(p)) });
  if (role === 'implementation' && checks.length) {
    const foreign = allChanges(root).filter(p => !files.includes(p));
    check(foreign.length === 0, 'FOREIGN_CHANGES', 'Для проверки точного кандидата отделите посторонние изменения.', { paths: foreign });
  }
  const candidateText = renderPlan(plan);
  if (!t) {
    check(head(root) === beforeHead, 'HEAD_CHANGED', 'HEAD изменился перед подготовкой коммита.');
    const index = gitPath(root, 'index');
    if (fs.existsSync(index)) atomic(localPath(root, 'index-before'), fs.readFileSync(index), 0o600);
    const original = fs.readFileSync(path.join(root, PLAN), 'utf8');
    t = { schema_version: 1, id: id(), role, scope_id: role === 'archive' ? plan.archived_scope_id : plan.scope_id,
      task_id: task?.id ?? null, task, message, before_head: beforeHead, original_plan: original,
      original_hash: hash(original), candidate_hash: hash(candidateText), selected: files, checks, phase: 'PREPARING' };
    saveJournal(root, t);
  } else {
    check(hash(candidateText) === t.candidate_hash, 'CANDIDATE_CHANGED', 'Повтор commit не должен подменять план-кандидат.');
  }
  atomic(path.join(root, PLAN), candidateText);
  const changed = allChanges(root).filter(p => files.includes(p));
  check(changed.length > 0, 'NOTHING_TO_COMMIT', 'Нет изменений для фиксации.');
  if (role === 'implementation') check(changed.some(p => p !== PLAN), 'EMPTY_TASK', 'Микрозадача должна менять заявленные файлы.');
  check(head(root) === t.before_head, 'HEAD_CHANGED', 'HEAD изменился до staging.');
  git(root, ['add', '--', ...changed]);
  t.selected = files; t.candidate_tree = git(root, ['write-tree']).stdout.trim();
  t.snapshot = snapshot(root, files).fingerprint; t.phase = 'PREPARED'; saveJournal(root, t);
  // Explicit failpoints are only for deterministic crash tests in temporary repositories.
  if (process.env.WORKFLOW_TEST_FAILPOINT === 'prepared') check(false, 'TEST_INTERRUPTION', 'Тестовое прерывание после подготовки кандидата.');
  const result = git(root, ['commit', '-m', messageFor(t)], { allowFailure: true, timeout: 600000 });
  if (result.status !== 0) {
    t = journal(root) ?? t; t.phase = 'CHECKS_FAILED'; t.error = String(result.stderr || result.stdout).slice(-5000); saveJournal(root, t);
    check(false, 'COMMIT_FAILED', 'Коммит не создан. Изменения и журнал сохранены; исправьте причину и повторите commit.', { output: t.error });
  }
  const sha = completedTransaction(root, t);
  check(sha, 'COMMIT_NOT_CONFIRMED', 'Git завершился, но нужный коммит не подтверждён.');
  if (process.env.WORKFLOW_TEST_FAILPOINT === 'committed') check(false, 'TEST_INTERRUPTION', 'Тестовое прерывание после создания коммита.');
  return finishTransaction(root, t, sha);
}
export function commitTask(root, taskId) {
  return locked(root, () => {
    const pending = journal(root);
    if (pending) {
      check(pending.task_id === taskId, 'TRANSACTION_PENDING', 'Другая задача ожидает завершения commit.');
      const done = completedTransaction(root, pending); if (done) return finishTransaction(root, pending, done);
      const plan = parsePlan(pending.original_plan);
      const task = plan.tasks.find(t => t.id === taskId);
      task.implementation_status = 'DONE'; task.commit_status = 'DONE'; plan.current_task_id = null;
      plan.delivery_status = plan.tasks.every(t => t.commit_status === 'DONE') ? 'READY_FOR_ACCEPTANCE' : 'IN_PROGRESS'; plan.plan_revision++;
      return commitCandidate(root, { plan, role: 'implementation', task: pending.task, selected: pending.selected, message: pending.message, checks: pending.checks, beforeHead: pending.before_head });
    }
    const { plan, config, resolved } = validate(root);
    if (resolved[taskId]?.sha) return { ok: true, sha: resolved[taskId].sha, task_id: taskId, role: 'implementation', already_committed: true, message: 'Задача уже зафиксирована.' };
    check(plan.execution_scope_status === 'ACTIVE' && plan.current_task_id === taskId, 'TASK_NOT_ACTIVE', 'Сначала начните текущую задачу через task:start.');
    const task = plan.tasks.find(t => t.id === taskId); const taskInput = structuredClone(task);
    const checks = taskChecks(task, config);
    task.implementation_status = 'DONE'; task.commit_status = 'DONE'; plan.current_task_id = null; plan.plan_revision++;
    plan.delivery_status = plan.tasks.every(t => t.commit_status === 'DONE') ? 'READY_FOR_ACCEPTANCE' : 'IN_PROGRESS';
    return commitCandidate(root, { plan, role: 'implementation', task: taskInput, selected: [...task.functional_paths, ...task.documentation_paths], message: task.expected_commit_message, checks, beforeHead: head(root) });
  });
}
