import fs from 'node:fs';
import path from 'node:path';
import { check, CONFIG, PLAN, INDEX, readJSON, textFile, hash, contextPath, relativePath } from './common.mjs';
import { readPlan, parsePlan, renderPlan } from './plan.mjs';
import { commitHistory, commitPaths, git, head, localPath } from './git.mjs';

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
  if (c.profile === 'DEVELOPMENT') check(typeof c.stack === 'string' && c.stack.trim(), 'CONFIG_SCHEMA', 'Укажите согласованный стек.');
  return c;
}
export const readConfig = root => validateConfig(readJSON(path.join(root, CONFIG)));
export const journal = root => fs.existsSync(localPath(root, 'transaction.json')) ? readJSON(localPath(root, 'transaction.json')) : null;
export function matches(pattern, value) {
  const pieces = pattern.split('**').map(p => p.split('*').map(v => v.replace(/[|\\{}()[\]^$+?.]/g, '\\$&')).join('[^/]*'));
  return new RegExp('^' + pieces.join('.*') + '$').test(value);
}
export function validateDocs(root, changed, task, config, reader = p => textFile(root, p)) {
  const docsChanged = changed.filter(p => /\.(md|markdown)$/.test(p) && p !== PLAN);
  const codeChanged = changed.filter(p => task.functional_paths.includes(p));
  if (codeChanged.length) {
    check(docsChanged.length > 0 || (typeof task.documentation_exception === 'string' && task.documentation_exception.trim().length >= 15), 'DOCS_SYNC', 'Изменение кода требует связанных документов в том же коммите или обоснования documentation_exception.');
    if (!task.documentation_exception) for (const p of codeChanged) {
      for (const mapping of config.documentation.mappings.filter(m => matches(m.code, p))) for (const doc of mapping.documents) {
        check(changed.includes(doc), 'DOCS_SYNC', 'Обновите связанный документ: ' + doc, { code: p });
      }
    }
  }
  const index = reader(config.documentation.index);
  for (const p of [...task.documentation_paths, ...docsChanged]) {
    if (p === config.documentation.index) continue;
    if (fs.existsSync(path.join(root, p))) check(index.includes(p), 'DOCUMENTATION_INDEX', 'Документ отсутствует в каталоге: ' + p);
  }
  return true;
}
export function taskChecks(task, config, stage = 'commit') {
  for (const key of task.verification_ids) check(config.checks.some(c => c.id === key), 'NOT_CONFIGURED', 'Проверка ещё не настроена: ' + key);
  const checks = config.checks.filter(c => (c.stage ?? 'commit') === stage && (c.required || task.verification_ids.includes(c.id)));
  if (task.functional_paths.length && stage === 'commit') {
    check(config.profile === 'DEVELOPMENT', 'STACK_NOT_CONFIGURED', 'Сначала согласуйте стек и подключите проверки через config:apply.');
    check(checks.length > 0, 'NOT_CONFIGURED', 'Для изменения функционального кода нужна хотя бы одна настроенная проверка.');
  }
  return checks;
}
export function resolveReferences(root, p, pending = journal(root)) {
  const history = p.scope_id ? commitHistory(root, p.baseline_commit) : [];
  const resolved = {};
  for (const task of p.tasks) {
    const candidates = history.filter(c => c.trailers['Workflow-Scope']?.includes(p.scope_id) && c.trailers['Workflow-Task']?.includes(task.id) && c.trailers['Workflow-Role']?.includes('implementation'));
    for (const c of candidates) for (const key of ['Workflow-Scope', 'Workflow-Task', 'Workflow-Role']) check(c.trailers[key]?.length === 1, 'AMBIGUOUS_COMMIT', 'Дублированные trailers: ' + c.sha);
    check(candidates.length <= 1, 'AMBIGUOUS_COMMIT', 'Найдено несколько коммитов задачи ' + task.id);
    if (!candidates.length) {
      const inTransaction = pending?.task_id === task.id && pending.before_head === head(root) && pending.candidate_hash === hash(renderPlan(p));
      check(task.commit_status !== 'DONE' || inTransaction, 'PLAN_COMMIT_MISMATCH', 'Задача ' + task.id + ' отмечена DONE, но коммит не найден.');
      if (inTransaction) resolved[task.id] = { pending: true };
      continue;
    }
    const c = candidates[0];
    check(task.commit_status === 'DONE', 'PLAN_COMMIT_MISMATCH', 'Коммит уже существует, а задача не закрыта: ' + task.id);
    check(c.parents.length === 1, 'HISTORY_NOT_LINEAR', 'Коммит микрозадачи должен иметь одного родителя.');
    const changed = commitPaths(root, c.sha);
    const allowed = new Set([...task.functional_paths, ...task.documentation_paths, PLAN]);
    check(changed.includes(PLAN) && changed.every(f => allowed.has(f)), 'COMMIT_SCOPE_MISMATCH', 'Состав коммита не соответствует задаче ' + task.id, { sha: c.sha, changed });
    const committed = parsePlan(git(root, ['show', c.sha + ':' + PLAN]).stdout);
    const record = committed.tasks.find(t => t.id === task.id);
    check(committed.scope_id === p.scope_id && record?.commit_status === 'DONE', 'COMMIT_PLAN_MISMATCH', 'Коммит не содержит завершение нужной задачи.');
    for (const dep of task.dependencies) {
      const earlier = history.find(h => h.trailers['Workflow-Scope']?.[0] === p.scope_id && h.trailers['Workflow-Task']?.[0] === dep && h.trailers['Workflow-Role']?.[0] === 'implementation');
      check(earlier && git(root, ['merge-base', '--is-ancestor', earlier.sha, c.parents[0]], { allowFailure: true }).status === 0, 'DEPENDENCY_ORDER', 'Зависимость не предшествует задаче ' + task.id);
    }
    resolved[task.id] = { sha: c.sha, parent: c.parents[0], paths: changed };
  }
  return resolved;
}
export function validate(root) {
  const plan = readPlan(root); const config = readConfig(root); const pending = journal(root);
  const resolved = resolveReferences(root, plan, pending);
  for (const task of plan.tasks) {
    for (const p of [...task.functional_paths, ...task.documentation_paths]) contextPath(root, p);
    if (task.implementation_status === 'IN_PROGRESS') check(task.dependencies.every(d => plan.tasks.find(t => t.id === d).commit_status === 'DONE'), 'DEPENDENCY_PENDING', 'Зависимости текущей задачи не выполнены.');
    for (const test of task.verification_ids) check(config.checks.some(c => c.id === test), 'NOT_CONFIGURED', 'Нет конфигурации проверки ' + test);
  }
  return { plan, config, resolved, transaction: pending };
}
