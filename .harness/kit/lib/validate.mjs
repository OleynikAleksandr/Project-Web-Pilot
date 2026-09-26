import fs from 'node:fs';
import path from 'node:path';
import { check, CONFIG, PLAN, planPath, INDEX, readJSON, textFile, hash, contextPath, relativePath } from './common.mjs';
import { readPlan, parsePlan, renderPlan } from './plan.mjs';
import { commitHistory, commitPaths, areAncestors, git, head, localPath } from './git.mjs';

export function defaultConfig() {
  return { schema_version: 1, profile: 'DISCOVERY', stack: null, checks: [],
    budget: { soft_tokens: 16000, hard_tokens: 90000, hard_bytes: 180000 },
    documentation: { index: INDEX, mappings: [] } };
}
export function validateConfig(c) {
  check(c?.schema_version === 1, 'CONFIG_SCHEMA', 'Неподдерживаемая схема настройки workflow.');
  check(['DISCOVERY', 'DEVELOPMENT'].includes(c.profile), 'CONFIG_SCHEMA', 'Профиль должен быть DISCOVERY или DEVELOPMENT.');
  check(Array.isArray(c.checks), 'CONFIG_SCHEMA', 'checks должен быть массивом.');
  const ids = new Set();
  for (const test of c.checks) {
    check(typeof test.id === 'string' && test.id && !ids.has(test.id), 'CONFIG_SCHEMA', 'Нужны уникальные ID проверок.'); ids.add(test.id);
    check(typeof test.executable === 'string' && test.executable && Array.isArray(test.args) && test.args.every(a => typeof a === 'string'), 'CONFIG_SCHEMA', 'Проверка задаётся исполняемым файлом и массивом аргументов.');
    check(typeof test.required === 'boolean' && Number.isInteger(test.timeout_ms) && test.timeout_ms > 0 && test.timeout_ms <= 600000, 'CONFIG_SCHEMA', 'У проверки нужны required и timeout_ms до 600000.');
    check(test.kind === undefined || ['syntax','test','package','installed'].includes(test.kind), 'CONFIG_SCHEMA', 'kind проверки: syntax, test, package или installed.');
    if (['package','installed'].includes(test.kind)) check(typeof test.evidence === 'string' && test.evidence.trim(), 'CONFIG_SCHEMA', 'Для package/installed опишите проверяемый артефакт и сценарий в evidence.', {field:'checks.'+test.id+'.evidence'});
    if (test.cwd && test.cwd !== '.') relativePath(test.cwd);
    check(!test.stage || ['commit', 'push'].includes(test.stage), 'CONFIG_SCHEMA', 'Неизвестный этап проверки.');
  }
  check(c.budget && ['soft_tokens', 'hard_tokens', 'hard_bytes'].every(f => Number.isSafeInteger(c.budget[f]) && c.budget[f] > 0), 'CONFIG_SCHEMA', 'Некорректный бюджет контекста.');
  check(c.budget.soft_tokens <= c.budget.hard_tokens && c.budget.hard_bytes <= 1024 * 1024, 'CONFIG_SCHEMA', 'Некорректные границы бюджета.');
  check(c.documentation && Array.isArray(c.documentation.mappings), 'CONFIG_SCHEMA', 'Нужна карта документации.');
  relativePath(c.documentation.index);
  for (const m of c.documentation.mappings) {
    check(typeof m.code === 'string' && m.code.length > 0 && !m.code.startsWith('/') && !m.code.includes('..'), 'CONFIG_SCHEMA', 'Некорректный селектор документации.');
    check(Array.isArray(m.documents), 'CONFIG_SCHEMA', 'Нужен список документов.'); m.documents.forEach(relativePath);
  }
  if (c.profile === 'DEVELOPMENT') check(typeof c.stack === 'string' && c.stack.trim(), 'CONFIG_SCHEMA', 'Укажите выбранный стек.');
  return c;
}
export const readConfig = root => validateConfig(readJSON(path.join(root, CONFIG)));
export const journal = root => fs.existsSync(localPath(root, 'transaction.json')) ? readJSON(localPath(root, 'transaction.json')) : null;
export function matches(pattern, value) {
  const pieces = pattern.split('**').map(p => p.split('*').map(v => v.replace(/[|\\{}()[\]^$+?.]/g, '\\$&')).join('[^/]*'));
  return new RegExp('^' + pieces.join('.*') + '$').test(value);
}
export function validateDocs(root, changed, task, config, reader = p => textFile(root, p)) {
  const PLAN = planPath(root);
  // Required context documents are validated by recovery; documentation mappings
  // are guidance, not an obligation to manufacture a text edit for every commit.
  for (const document of (task.context_pack?.documents ?? []).filter(d=>d.required)) reader(document.path);

  return true;
}
export function taskChecks(task, config, stage = 'commit') {
  for (const key of task.verification_ids) check(config.checks.some(c => c.id === key), 'NOT_CONFIGURED', 'Проверка ещё не настроена: ' + key);
  const checks = config.checks.filter(c => (c.stage ?? 'commit') === stage && (stage === 'push' ? c.required : task.verification_ids.includes(c.id)));
  const actual = task.actual_files ?? task.functional_paths;
  const functional = actual.filter(p => !p.endsWith('.md'));
  const ignoreOnly = functional.length > 0 && functional.every(p => p === '.gitignore' || p.endsWith('/.gitignore'));
  if (functional.length && !ignoreOnly && stage === 'commit') {
    check(config.profile === 'DEVELOPMENT', 'STACK_NOT_CONFIGURED', 'Укажите выбранный стек и подключите применимые проверки через config:apply или plan:create.');
    check(checks.length > 0, 'NOT_CONFIGURED', 'Для изменения функционального кода нужна хотя бы одна настроенная проверка.');
  }
  if (stage === 'commit' && task.verification_kind && task.verification_kind !== 'code') {
    check(checks.some(c=>c.kind===task.verification_kind), 'VERIFICATION_KIND', 'Нужна проверка '+task.verification_kind+'; синтаксис не подтверждает готовность артефакта.', {task_id:task.id,field:'checks',expected:task.verification_kind,received:checks.map(c=>({id:c.id,kind:c.kind??'unspecified'})),next_action:'Настройте соответствующую проверку через config:apply и добавьте её через task:update.'});
  }
  if (stage === 'commit' && ignoreOnly && checks.length === 0) return [{id:'gitignore-format',kind:'code',executable:'git',args:['diff','--cached','--check'],timeout_ms:10000}];
  return checks;
}
function commitIteration(commit) {
  const values = commit.trailers['Workflow-Iteration'];
  if (!values?.length) return 1;
  check(values.length === 1 && /^[1-9][0-9]*$/.test(values[0]), 'AMBIGUOUS_COMMIT', 'Некорректный Workflow-Iteration: ' + commit.sha);
  return Number(values[0]);
}
export function resolveReferences(root, p, pending = journal(root)) {
  const PLAN = planPath(root);
  const history = p.scope_id ? commitHistory(root, p.baseline_commit) : [];
  const resolved = {};
  for (const task of p.tasks) {
    const targetIteration = task.commit_ref?.iteration ?? 1;
    check(Number.isSafeInteger(targetIteration) && targetIteration > 0, 'PLAN_SCHEMA', 'commit_ref.iteration должна быть положительным целым: ' + task.id);
    const taskHistory = history.filter(c => c.trailers['Workflow-Scope']?.includes(p.scope_id) && c.trailers['Workflow-Task']?.includes(task.id) && c.trailers['Workflow-Role']?.includes('implementation'));
    for (const c of taskHistory) for (const key of ['Workflow-Scope', 'Workflow-Task', 'Workflow-Role']) check(c.trailers[key]?.length === 1, 'AMBIGUOUS_COMMIT', 'Дублированные trailers: ' + c.sha);
    const candidates = taskHistory.filter(c => commitIteration(c) === targetIteration);
    check(candidates.length <= 1, 'AMBIGUOUS_COMMIT', 'Найдено несколько коммитов задачи ' + task.id + ' iteration ' + targetIteration);
    if (!candidates.length) {
      const inTransaction = pending?.scope_id === p.scope_id && (pending.plan_path ?? '.harness/plans/todo-plan.md') === PLAN && pending?.task_id === task.id && pending.before_head === head(root) && pending.candidate_hash === hash(renderPlan(p));
      check(task.commit_status !== 'DONE' || inTransaction, 'PLAN_COMMIT_MISMATCH', 'Задача ' + task.id + ' отмечена DONE, но коммит не найден.');
      if (inTransaction) resolved[task.id] = { pending: true };
      continue;
    }
    const c = candidates[0];
    check(task.commit_status === 'DONE', 'PLAN_COMMIT_MISMATCH', 'Коммит уже существует, а задача не закрыта: ' + task.id);
    check(c.parents.length === 1, 'HISTORY_NOT_LINEAR', 'Коммит микрозадачи должен иметь одного родителя.');
    const changed = commitPaths(root, c.sha);
    // Historical task commits predate adoption; inspect the path in THAT commit.
    const planCandidates = [...new Set([PLAN, '.harness/plans/todo-plan.md'])].filter(file => changed.includes(file))
      .map(file => { const result = git(root, ['show', c.sha + ':' + file], { allowFailure: true });
        return result.status === 0 ? { file, plan: parsePlan(result.stdout) } : null; })
      .filter(record => record?.plan.scope_id === p.scope_id);
    check(planCandidates.length === 1, 'COMMIT_PLAN_MISMATCH', 'Коммит не содержит однозначный план этой задачи.');
    const committedPath = planCandidates[0].file;
    const allowed = new Set([...task.functional_paths, ...task.documentation_paths, committedPath]);
    check(changed.every(f => allowed.has(f)), 'COMMIT_SCOPE_MISMATCH', 'Состав коммита не соответствует задаче ' + task.id, { sha: c.sha, changed });
    const committed = planCandidates[0].plan;
    const record = committed.tasks.find(t => t.id === task.id);
    check(committed.scope_id === p.scope_id && record?.commit_status === 'DONE', 'COMMIT_PLAN_MISMATCH', 'Коммит не содержит завершение нужной задачи.');
    const dependencyCommits = task.dependencies.map(dep => {
      const depTask = p.tasks.find(item => item.id === dep);
      const depIteration = depTask?.commit_ref?.iteration ?? 1;
      const earlier = history.find(h => h.trailers['Workflow-Scope']?.[0] === p.scope_id && h.trailers['Workflow-Task']?.[0] === dep
        && h.trailers['Workflow-Role']?.[0] === 'implementation' && commitIteration(h) === depIteration);
      check(earlier, 'DEPENDENCY_ORDER', 'Зависимость не предшествует задаче ' + task.id);
      return earlier.sha;
    });
    check(areAncestors(root, dependencyCommits, c.parents[0]), 'DEPENDENCY_ORDER', 'Зависимость не предшествует задаче ' + task.id);
    resolved[task.id] = { sha: c.sha, parent: c.parents[0], paths: changed };
  }
  return resolved;
}
export function validatePlanConfiguration(root, plan, config) {
  validateConfig(config);
  for (const task of plan.tasks) {
    for (const p of [...task.functional_paths, ...task.documentation_paths]) contextPath(root, p);
    for (const test of task.verification_ids) check(config.checks.some(c => c.id === test), 'NOT_CONFIGURED', 'Нет конфигурации проверки ' + test);
  }
}
export function validate(root, candidateConfig) {
  const plan = readPlan(root); const config = candidateConfig ?? readConfig(root); const pendingJournal = journal(root);
  const pending = pendingJournal && (pendingJournal.plan_path ?? '.harness/plans/todo-plan.md') === planPath(root) ? pendingJournal : null;
  const resolved = resolveReferences(root, plan, pending);
  for (const task of plan.tasks) {
    for (const p of [...task.functional_paths, ...task.documentation_paths]) contextPath(root, p);
    if (task.implementation_status === 'IN_PROGRESS') check(task.dependencies.every(d => plan.tasks.find(t => t.id === d).commit_status === 'DONE'), 'DEPENDENCY_PENDING', 'Зависимости текущей задачи не выполнены.');
    for (const test of task.verification_ids) check(config.checks.some(c => c.id === test), 'NOT_CONFIGURED', 'Нет конфигурации проверки ' + test);
  }
  return { plan, config, resolved, transaction: pending };
}
