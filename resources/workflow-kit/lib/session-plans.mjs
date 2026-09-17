import fs from 'node:fs';
import path from 'node:path';
import { PLAN, check, safePath, textFile, withPlanFile, currentPlanSelection } from './common.mjs';
import { parsePlan, emptyPlan } from './plan.mjs';

export const PLANS_DIRECTORY = '.harness/plans/by-id';
export const validIdentity = (value, label = 'ID') => {
  check(typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9._-]{0,180}$/.test(value), 'PLAN_ID', 'Некорректный ' + label);
  return value;
};
export const ownedPlanPath = planId => PLANS_DIRECTORY + '/' + validIdentity(planId, 'planId') + '.md';
export function listPlans(root) {
  const files = fs.existsSync(safePath(root, PLAN)) ? [PLAN] : [];
  const directory = safePath(root, PLANS_DIRECTORY);
  if (fs.existsSync(directory)) for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    check(!entry.isSymbolicLink(), 'SYMLINK_PATH', 'Планы не могут быть символическими ссылками.');
    if (entry.isFile() && entry.name.endsWith('.md')) files.push(PLANS_DIRECTORY + '/' + entry.name);
  }
  const result = files.map(file => ({ file, plan: parsePlan(textFile(root, file)) }));
  const ids = result.filter(r => r.plan.scope_id).map(r => r.plan.scope_id);
  const owners = result.filter(r => r.plan.owner_session_id).map(r => r.plan.owner_session_id);
  check(new Set(ids).size === ids.length && new Set(owners).size === owners.length, 'PLAN_OWNERSHIP_CONFLICT', 'Обнаружена неоднозначная принадлежность плана. Данные сохранены.');
  return result;
}
export function selectPlan(root, { sessionId, planId, allowDraft = false, legacy = false } = {}) {
  if (sessionId !== undefined && sessionId !== null) validIdentity(sessionId, 'sessionId');
  if (planId !== undefined && planId !== null) validIdentity(planId, 'planId');
  const plans = listPlans(root);
  const base = plans.find(r => r.file === PLAN)?.plan;
  check(base, 'MISSING_FILE', 'Отсутствует навигационный план проекта.');
  const addressed = plans.some(r => r.plan.owner_session_id || r.plan.prepared_in_session_id);
  if (!sessionId && !planId) {
    check(legacy || !addressed, 'SESSION_REQUIRED', 'Укажите --session из контекста этого чата. Выбор в интерфейсе не адресует команды.');
    return { file: PLAN, plan: base, sessionId: null };
  }
  let selected = planId ? plans.find(r => r.plan.scope_id === planId)
    : plans.find(r => r.plan.owner_session_id === sessionId);
  if (planId) check(selected, 'PLAN_NOT_FOUND', 'План не найден: ' + planId);
  if (selected) {
    if (sessionId) check(selected.plan.owner_session_id === sessionId
      || (allowDraft && selected.plan.prepared_in_session_id === sessionId), 'PLAN_OWNER_MISMATCH', 'Этот план не принадлежит данной сессии.');
    return { ...selected, sessionId: sessionId ?? selected.plan.owner_session_id ?? null };
  }
  const plan = { ...emptyPlan(base.project_name), project_id: base.project_id, owner_session_id: sessionId };
  return { file: '.harness/plans/by-session/' + sessionId + '.md', plan, sessionId, virtual: true };
}
export function withSessionPlan(root, selector, fn) {
  const selected = selectPlan(root, selector);
  return withPlanFile(root, selected.file, { sessionId: selected.sessionId, virtualPlan: selected.virtual ? selected.plan : null }, () => fn(selected));
}
export function sessionPlanView(root, sessionId) {
  const own = selectPlan(root, { sessionId });
  const prepared = listPlans(root).filter(r => r.plan.prepared_in_session_id === sessionId);
  return { ok: true, session_id: sessionId, plan_id: own.plan.scope_id, plan_path: own.virtual ? null : own.file,
    plan: own.plan, prepared: prepared.map(r => ({ plan_id: r.plan.scope_id, plan_path: r.file, plan: r.plan })),
    unassigned: listPlans(root).filter(r => r.plan.scope_id && !r.plan.owner_session_id && !r.plan.prepared_in_session_id)
      .map(r => ({ plan_id: r.plan.scope_id, objective: r.plan.objective, plan_path: r.file })) };
}
export function assertSingleWriter(root, targetFile) {
  const busy = listPlans(root).find(r => r.file !== targetFile && r.plan.current_task_id);
  check(!busy, 'PLAN_WRITER_BUSY', 'Сначала завершите начатую микрозадачу другого плана.', { plan_id: busy?.plan.scope_id, task_id: busy?.plan.current_task_id });
}
export function assertSelectionOwner(plan) {
  const selection = currentPlanSelection();
  if (selection?.sessionId && plan.owner_session_id)
    check(plan.owner_session_id === selection.sessionId, 'PLAN_OWNER_MISMATCH', 'Владелец плана изменился; перечитайте контекст.');
}
