import fs from 'node:fs';
import { PLAN, check, safePath, textFile, withPlanFile } from './common.mjs';
import { parsePlan } from './plan.mjs';

// Legacy locations are retained only as compatibility/migration constants.
// They are not part of normal runtime plan selection.
export const PLANS_DIRECTORY = '.harness/plans/by-id';
export const SESSION_PLANS_DIRECTORY = '.harness/plans/by-session';
export const PLAN_DIRECTORIES = [PLANS_DIRECTORY, SESSION_PLANS_DIRECTORY];

export const validIdentity = (value, label = 'ID') => {
  check(typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9._-]{0,180}$/.test(value), 'PLAN_ID', 'Некорректный ' + label);
  return value;
};

// Kept for legacy tooling that needs to identify the old path layout.
export const ownedPlanPath = planId => PLANS_DIRECTORY + '/' + validIdentity(planId, 'planId') + '.md';

function currentPlan(root, { projection = true } = {}) {
  const file = safePath(root, PLAN);
  check(fs.existsSync(file), 'MISSING_FILE', 'Отсутствует навигационный план проекта.');
  return { file: PLAN, plan: parsePlan(textFile(root, PLAN), { projection }) };
}

// Public compatibility: normal enumeration now exposes exactly one
// checkout-scoped current plan.
export function listPlans(root, options = {}) {
  return [currentPlan(root, options)];
}

export function selectPlan(root, { sessionId, planId } = {}) {
  if (sessionId !== undefined && sessionId !== null) validIdentity(sessionId, 'sessionId');
  if (planId !== undefined && planId !== null) validIdentity(planId, 'planId');
  const selected = currentPlan(root);
  if (planId !== undefined && planId !== null) {
    check(selected.plan.scope_id === planId, 'PLAN_NOT_CURRENT',
      'Указанный planId не является текущим plan этого checkout. Historical plans доступны только для чтения истории.',
      { requested_plan_id: planId, current_plan_id: selected.plan.scope_id });
  }
  return { ...selected, sessionId: sessionId ?? null };
}

// Transitional facade for old WebPilot callers. Session metadata is echoed
// but never selects or owns project state.
export function withSessionPlan(root, selector, fn) {
  const selected = selectPlan(root, selector);
  return withPlanFile(root, PLAN, { sessionId: selected.sessionId }, () => fn(selected));
}

export function sessionPlanView(root, sessionId) {
  if (sessionId !== undefined && sessionId !== null) validIdentity(sessionId, 'sessionId');
  const current = currentPlan(root);
  return {
    ok: true,
    session_id: sessionId ?? null,
    plan_id: current.plan.scope_id,
    plan_path: PLAN,
    plan: current.plan,
    prepared: [],
    unassigned: [],
  };
}

// Single current plan means there is no second runtime writer to arbitrate.
export function assertSingleWriter(_root, targetFile) {
  check(targetFile === PLAN, 'PLAN_NOT_CURRENT', 'Runtime operations may modify only the current checkout plan.');
}

// Ownership no longer exists. Kept as a no-op export for package consumers
// during the compatibility window.
export function assertSelectionOwner() {}
