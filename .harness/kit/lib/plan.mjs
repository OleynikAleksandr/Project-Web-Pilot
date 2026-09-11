import fs from 'node:fs';
import path from 'node:path';
import { PLAN, check, json, atomic, textFile, relativePath, id } from './common.mjs';

const BEGIN = '<!-- workflow-state:begin -->';
const END = '<!-- workflow-state:end -->';
const label = { TODO: 'Ожидает', IN_PROGRESS: 'В работе', DONE: 'Завершено', PENDING: 'Ожидает коммита' };
const string = (v, field) => check(typeof v === 'string' && v.trim().length > 0, 'PLAN_SCHEMA', 'Нужно непустое поле: ' + field);
const array = (v, field) => check(Array.isArray(v), 'PLAN_SCHEMA', 'Нужен массив: ' + field);
const unique = (values, field) => check(new Set(values).size === values.length, 'PLAN_SCHEMA', 'Повторяющиеся значения: ' + field);
export function emptyPlan(name) {
  return { schema_version: 1, plan_revision: 1, project_id: id(), project_name: name, scope_id: null,
    execution_scope_status: 'NONE', delivery_status: 'IN_PROGRESS', objective: '', acceptance_criteria: [],
    approved_scope: { functional_paths: [], documentation_paths: [], max_functional_files_per_task: 3 },
    baseline_commit: null, current_task_id: null, context_pack: { documents: [], include_last_completed_task: true, dependency_task_ids: [] },
    tasks: [], blocked_reason: null, user_decisions: [] };
}
export function validatePlan(p) {
  check(p && typeof p === 'object' && p.schema_version === 1, 'PLAN_SCHEMA', 'Неподдерживаемая схема плана.');
  check(Number.isSafeInteger(p.plan_revision) && p.plan_revision > 0, 'PLAN_SCHEMA', 'Некорректная revision.');
  string(p.project_id, 'project_id'); string(p.project_name, 'project_name');
  check(['NONE', 'ACTIVE', 'BLOCKED'].includes(p.execution_scope_status), 'PLAN_SCHEMA', 'Некорректное состояние scope.');
  check(['IN_PROGRESS', 'READY_FOR_ACCEPTANCE'].includes(p.delivery_status), 'PLAN_SCHEMA', 'Некорректная готовность результата.');
  for (const f of ['tasks', 'acceptance_criteria', 'user_decisions']) array(p[f], f);
  for (const f of ['functional_paths', 'documentation_paths']) {
    array(p.approved_scope?.[f], f); unique(p.approved_scope[f], f); p.approved_scope[f].forEach(relativePath);
  }
  check(Number.isInteger(p.approved_scope.max_functional_files_per_task) && p.approved_scope.max_functional_files_per_task > 0, 'PLAN_SCHEMA', 'Некорректный лимит файлов.');
  array(p.context_pack?.documents, 'context_pack.documents'); array(p.context_pack?.dependency_task_ids, 'context_pack.dependency_task_ids');
  const validateContext = pack => {
    if (!pack) return;
    array(pack.documents, 'context.documents');
    for (const doc of pack.documents) {
      relativePath(doc.path); check(typeof doc.required === 'boolean', 'PLAN_SCHEMA', 'required должен быть boolean.');
      check(doc.revision === undefined || doc.revision === 'WORKTREE', 'PLAN_SCHEMA', 'Первая версия читает документы текущего worktree.');
      if (doc.heading_path) { array(doc.heading_path, 'heading_path'); doc.heading_path.forEach(h => string(h, 'heading')); }
    }
  };
  validateContext(p.context_pack);
  if (p.execution_scope_status === 'NONE') {
    check(p.scope_id === null && p.current_task_id === null && p.tasks.length === 0, 'PLAN_SCHEMA', 'NONE не может содержать активные задачи.');
  } else {
    string(p.scope_id, 'scope_id'); string(p.objective, 'objective');
    check(/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(p.scope_id), 'PLAN_SCHEMA', 'scope_id: латинские буквы, цифры, точка, дефис, подчёркивание.');
    check(p.acceptance_criteria.length > 0 && p.tasks.length > 0, 'PLAN_SCHEMA', 'Активному scope нужны задачи и критерии.');
    check(typeof p.baseline_commit === 'string' && /^[0-9a-f]{40,64}$/.test(p.baseline_commit), 'PLAN_SCHEMA', 'Активному scope нужен реальный baseline.');
  }
  unique(p.tasks.map(t => t.id), 'task IDs');
  const byId = new Map(p.tasks.map(t => [t.id, t]));
  for (const t of p.tasks) {
    for (const f of ['id', 'title', 'why', 'expected_commit_message']) string(t[f], f);
    check(/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(t.id), 'PLAN_SCHEMA', 'Некорректный task ID.');
    check(!/[\r\n]/.test(t.expected_commit_message), 'PLAN_SCHEMA', 'Ожидаемое сообщение коммита должно занимать одну строку.');
    check(['TODO', 'IN_PROGRESS', 'DONE'].includes(t.implementation_status) && ['PENDING', 'DONE'].includes(t.commit_status), 'PLAN_SCHEMA', 'Некорректное состояние задачи.');
    check((t.implementation_status === 'DONE') === (t.commit_status === 'DONE'), 'PLAN_SCHEMA', 'Задача и запись коммита закрываются вместе.');
    for (const f of ['dependencies', 'functional_paths', 'documentation_paths', 'acceptance_criteria', 'verification_ids']) { array(t[f], f); unique(t[f], f); }
    check(t.acceptance_criteria.length > 0, 'PLAN_SCHEMA', 'У задачи нет критериев готовности.');
    for (const f of ['functional_paths', 'documentation_paths']) for (const file of t[f]) {
      relativePath(file); check(p.approved_scope[f].includes(file), 'OUT_OF_SCOPE', 'Путь не включён в scope: ' + file);
    }
    check(t.functional_paths.length + t.documentation_paths.length > 0, 'PLAN_SCHEMA', 'У задачи нет файлов.');
    check(!t.functional_paths.some(f => t.documentation_paths.includes(f)), 'PLAN_SCHEMA', 'Файл не может быть одновременно функциональным и документационным.');
    if (t.functional_paths.length > p.approved_scope.max_functional_files_per_task) string(t.file_limit_exception, 'file_limit_exception');
    for (const dep of t.dependencies) check(dep !== t.id && byId.has(dep), 'PLAN_SCHEMA', 'Неизвестная или циклическая зависимость: ' + dep);
    check(t.commit_ref?.scope_id === p.scope_id && t.commit_ref?.task_id === t.id && t.commit_ref?.role === 'implementation', 'PLAN_SCHEMA', 'Некорректная ссылка коммита: ' + t.id);
    validateContext(t.context_pack);
  }
  const visited = new Set(); const visiting = new Set();
  function visit(t) {
    check(!visiting.has(t.id), 'PLAN_CYCLE', 'Цикл зависимостей микрозадач.');
    if (visited.has(t.id)) return; visiting.add(t.id);
    t.dependencies.forEach(dep => visit(byId.get(dep))); visiting.delete(t.id); visited.add(t.id);
  }
  p.tasks.forEach(visit);
  for (const dep of p.context_pack.dependency_task_ids) check(byId.has(dep), 'PLAN_SCHEMA', 'Неизвестная контекстная зависимость: ' + dep);
  const current = p.tasks.filter(t => t.implementation_status === 'IN_PROGRESS');
  check(current.length <= 1 && (current[0]?.id ?? null) === p.current_task_id, 'PLAN_SCHEMA', 'current_task_id не соответствует текущей задаче.');
  check(p.execution_scope_status !== 'BLOCKED' || (typeof p.blocked_reason === 'string' && p.blocked_reason.trim()), 'PLAN_SCHEMA', 'BLOCKED требует причину.');
  check(p.delivery_status !== 'READY_FOR_ACCEPTANCE' || (p.tasks.length > 0 && p.tasks.every(t => t.commit_status === 'DONE')), 'PLAN_SCHEMA', 'Готовность к приёмке не подтверждается задачами.');
  return p;
}
export function renderPlan(p) {
  validatePlan(p);
  const lines = ['# Активный план — ' + p.project_name, '', BEGIN, '```json', JSON.stringify(p, null, 2), '```', END, '',
    '## Состояние', '', 'Execution Scope Status: ' + p.execution_scope_status, 'Delivery Status: ' + p.delivery_status,
    'Scope: ' + (p.scope_id ?? 'не создан'), 'Current Task: ' + (p.current_task_id ?? 'нет'), 'Revision: ' + p.plan_revision, '',
    '## Цель', '', p.objective || 'Обсудить идею проекта и согласовать ближайший scope. Стек пока не выбран.', '', '## Критерии приёмки', '', ...p.acceptance_criteria.map(c => '- ' + c), '', '## Микрозадачи', ''];
  for (const t of p.tasks) {
    lines.push('- [' + t.implementation_status + '] ' + t.id + ': ' + t.title + ' — ' + label[t.implementation_status],
      '  - Git Commit: [' + t.commit_status + '] ' + t.expected_commit_message,
      '  - Reference: ' + p.scope_id + ' / ' + t.id + ' / implementation',
      '  - Файлы: ' + [...t.functional_paths, ...t.documentation_paths].join(', '));
  }
  lines.push('', '## Context Pack For This Cycle', '', ...p.context_pack.documents.map(d => '- ' + d.path + (d.heading_path?.length ? ' → ' + d.heading_path.join(' / ') : '')),
    '', 'Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.', '');
  return lines.join('\n');
}
export function parsePlan(text, { projection = true } = {}) {
  check(text.split(BEGIN).length === 2 && text.split(END).length === 2, 'PLAN_MARKERS', 'В плане нужен ровно один блок workflow-state.');
  const fragment = text.split(BEGIN)[1].split(END)[0].trim();
  const match = /^```json\n([\s\S]+)\n```$/.exec(fragment);
  check(match, 'PLAN_MARKERS', 'Внутри workflow-state нужен один fenced JSON-блок.');
  let p; try { p = JSON.parse(match[1]); } catch { check(false, 'PLAN_JSON', 'Некорректный JSON в плане.'); }
  validatePlan(p);
  if (projection) check(renderPlan(p) === text, 'PLAN_PROJECTION', 'Читаемая проекция изменена вручную. Используйте repair --dry-run.');
  return p;
}
export const readPlan = root => parsePlan(textFile(root, PLAN));
export const writePlan = (root, p) => atomic(path.join(root, PLAN), renderPlan(p));
export function nextTask(p) { return p.tasks.find(t => t.id === p.current_task_id) ?? p.tasks.find(t => t.implementation_status === 'TODO' && t.dependencies.every(d => p.tasks.find(t2 => t2.id === d).commit_status === 'DONE')) ?? null; }
