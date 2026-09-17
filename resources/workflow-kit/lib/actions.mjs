import fs from 'node:fs';
import path from 'node:path';
import { VERSION, PLAN, planPath, CONFIG, MANIFEST, check, readJSON, atomic, json, hash, id, textFile, currentPlanSelection, withPlanFile } from './common.mjs';
import { emptyPlan, readPlan, parsePlan, renderPlan, writePlan, validatePlan, nextTask, projectContextPack, projectContextPaths,
  FINAL_DOCUMENTATION_TASK_ID, FINAL_DOCUMENTATION_TASK_TITLE, isDocumentationFinalizationTask } from './plan.mjs';
import { validate, validateConfig, journal, resolveReferences, taskChecks } from './validate.mjs';
import { git, head, localPath, allChanges, identityReady, paths, gitPath } from './git.mjs';
import { locked, commitCandidate, completedTransaction, finishTransaction } from './transaction.mjs';
import { recover } from './recovery.mjs';
import { ownedPlanPath, listPlans, assertSingleWriter, validIdentity, selectPlan } from './session-plans.mjs';

const noTransaction = root => check(!journal(root), 'TRANSACTION_PENDING', 'Сначала завершите текущую транзакцию commit/repair.');
const acknowledgementsPath = root => path.join(root, '.harness/runtime/worktrees', hash(gitPath(root, 'index')).slice(0, 20), 'hook-acknowledgements.json');
const revision = (p, value) => { if (value !== undefined) check(p.plan_revision === Number(value), 'REVISION_CHANGED', 'Revision плана изменилась. Сначала обновите status.'); };
const requiredDocuments = pack => (pack?.documents ?? []).filter(d => d.required);
function requireModuleContext(planLike) {
  if (!(planLike.tasks ?? []).some(t => (t.functional_paths ?? []).length)) return;
  const docs = requiredDocuments(planLike.context_pack);
  check(docs.some(d => d.path === 'docs/architecture/OVERVIEW.md'), 'MODULE_CONTEXT_REQUIRED', 'Функциональному scope нужен required compact project overview: docs/architecture/OVERVIEW.md.');
  check(docs.some(d => /^docs\/modules\/.+\.md$/i.test(d.path)), 'MODULE_CONTEXT_REQUIRED', 'Функциональному scope нужна required module specification в docs/modules/. Сначала согласуйте контракт модуля.');
}
function normalizeCompletionContract(plan) {
  const foundation = projectContextPaths();
  plan.context_pack = projectContextPack(plan.context_pack);
  plan.approved_scope = { ...plan.approved_scope,
    documentation_paths: [...new Set([...(plan.approved_scope?.documentation_paths ?? []), ...foundation])] };
  const existing = plan.tasks.filter(task => task.id === FINAL_DOCUMENTATION_TASK_ID || task.title === FINAL_DOCUMENTATION_TASK_TITLE);
  check(existing.length <= 1, 'DOCUMENTATION_FINAL_TASK', 'В scope должна быть одна финальная задача актуализации документации.');
  let finalTask = existing[0];
  const ordinary = plan.tasks.filter(task => task !== finalTask);
  if (!finalTask) {
    finalTask = {
      id: FINAL_DOCUMENTATION_TASK_ID, title: FINAL_DOCUMENTATION_TASK_TITLE,
      why: 'Проверить весь действующий комплект документации по docs/DOCUMENTATION_INDEX.md и обновить только устаревшие сведения после выполнения scope.',
      dependencies: [], functional_paths: [], documentation_paths: foundation,
      acceptance_criteria: ['Все документы из индекса проверены; устаревшие сведения и ссылки исправлены; после этого результат готов только к пользовательской приёмке.'],
      verification_ids: [], expected_commit_message: 'docs: актуализировать документацию проекта',
    };
  }
  check(finalTask.id === FINAL_DOCUMENTATION_TASK_ID && finalTask.title === FINAL_DOCUMENTATION_TASK_TITLE,
    'DOCUMENTATION_FINAL_TASK', 'Зарезервированный пункт DOCS должен называться «' + FINAL_DOCUMENTATION_TASK_TITLE + '».');
  check(finalTask.commit_status !== 'DONE' || ordinary.every(task => task.commit_status === 'DONE'),
    'DOCUMENTATION_FINAL_TASK', 'Завершённую DOCS-задачу нельзя ставить перед незавершёнными задачами.');
  finalTask = { ...finalTask, dependencies: ordinary.map(task => task.id), functional_paths: [],
    documentation_paths: [...new Set([...(finalTask.documentation_paths ?? []), ...foundation])] };
  plan.tasks = [...ordinary, finalTask];
  return plan;
}
function service(root, plan, role, selected, message) {
  return commitCandidate(root, { plan, role, selected, message, beforeHead: head(root) });
}
export function createScope(root, input, expectedRevision) {
  const selection = currentPlanSelection();
  if (selection?.sessionId && !selection.newPlan) {
    const previous = readPlan(root);
    check(previous.execution_scope_status === 'NONE', 'SCOPE_EXISTS', 'У этой сессии уже есть план; используйте plan:apply или plan:prepare.');
    const scopeId = input.scope_id || 'scope-' + id();
    check(!listPlans(root).some(r => r.plan.scope_id === scopeId), 'SCOPE_EXISTS', 'Идентификатор плана уже занят.');
    return withPlanFile(root, ownedPlanPath(scopeId), { ...selection, newPlan: true, virtualPlan: previous }, () => createScope(root, { ...input, scope_id: scopeId }, expectedRevision));
  }
  const PLAN = planPath(root);
  return locked(root, () => {
    noTransaction(root); assertSingleWriter(root, PLAN); const { plan: previous } = validate(root); revision(previous, expectedRevision);
    check(previous.execution_scope_status === 'NONE', 'SCOPE_EXISTS', 'Текущий scope ещё не закрыт пользователем.');
    check(head(root), 'NO_BASELINE', 'Сначала завершите bootstrap-коммит установки.');
    check(typeof input.approval_note === 'string' && input.approval_note.trim().length >= 10, 'SCOPE_APPROVAL', 'Запишите согласованное пользователем содержание scope в approval_note.');
    const plan = { ...emptyPlan(previous.project_name), ...input, schema_version: 1, project_id: previous.project_id,
      project_name: previous.project_name, plan_revision: previous.plan_revision + 1, scope_id: input.scope_id || 'scope-' + id(),
      execution_scope_status: 'ACTIVE', delivery_status: 'IN_PROGRESS', baseline_commit: head(root), current_task_id: null, blocked_reason: null };
    delete plan.approval_note;
    if (selection?.sessionId) {
      plan.owner_session_id = selection.draft ? null : selection.sessionId;
      plan.prepared_in_session_id = selection.draft ? selection.sessionId : null;
    }
    check(Array.isArray(input.tasks), 'PLAN_SCHEMA', 'Нужен список микрозадач.');
    plan.tasks = input.tasks.map((t, i) => {
      check(!t.implementation_status || t.implementation_status === 'TODO', 'PLAN_SCHEMA', 'Новый scope не может начинаться с завершённых задач.');
      const taskId = t.id || 'T' + String(i + 1).padStart(3, '0');
      return { dependencies: [], functional_paths: [], documentation_paths: [], verification_ids: [], ...t, id: taskId,
        implementation_status: 'TODO', commit_status: 'PENDING', commit_ref: { scope_id: plan.scope_id, task_id: taskId, role: 'implementation' } };
    });
    normalizeCompletionContract(plan);
    plan.tasks = plan.tasks.map(task => ({ implementation_status: 'TODO', commit_status: 'PENDING',
      commit_ref: { scope_id: plan.scope_id, task_id: task.id, role: 'implementation' }, ...task }));
    requireModuleContext(plan);
    plan.user_decisions = [...(input.user_decisions ?? []), { id: id(), text: input.approval_note, recorded_at: new Date().toISOString() }];
    validatePlan(plan);
    const selected = [PLAN, ...allChanges(root).filter(p => plan.approved_scope.documentation_paths.includes(p))];
    const result = service(root, plan, 'scope-plan', selected, 'docs: согласовать scope ' + plan.scope_id);
    return { ...result, state: recover(root) };
  });
}
export function startTask(root, taskId, expectedRevision) {
  const PLAN = planPath(root);
  return locked(root, () => {
    noTransaction(root); assertSingleWriter(root, PLAN); const { plan, config } = validate(root); revision(plan, expectedRevision);
    check(plan.execution_scope_status === 'ACTIVE', 'SCOPE_NOT_ACTIVE', 'Реализация разрешена только в ACTIVE scope.');
    const task = plan.tasks.find(t => t.id === taskId);
    check(task, 'UNKNOWN_TASK', 'Задача не найдена: ' + taskId);
    if (plan.current_task_id === taskId) return recover(root);
    check(plan.current_task_id === null && task.implementation_status === 'TODO', 'TASK_ALREADY_ACTIVE', 'Другую или завершённую задачу начать нельзя.');
    check(task.dependencies.every(d => plan.tasks.find(t => t.id === d)?.commit_status === 'DONE'), 'DEPENDENCY_PENDING', 'Зависимости задачи ещё не завершены.');
    taskChecks(task, config);
    task.implementation_status = 'IN_PROGRESS'; plan.current_task_id = taskId; plan.plan_revision++;
    writePlan(root, plan); return recover(root);
  });
}
export function applyPlan(root, input, expectedRevision) {
  const PLAN = planPath(root);
  return locked(root, () => {
    noTransaction(root); const { plan: original } = validate(root);
    check(expectedRevision !== undefined, 'EXPECTED_REVISION_REQUIRED', 'Укажите --expected-revision из status.'); revision(original, expectedRevision);
    const permitted = ['objective', 'acceptance_criteria', 'approved_scope', 'context_pack', 'tasks', 'user_decisions', 'execution_scope_status', 'blocked_reason'];
    check(Object.keys(input).every(k => permitted.includes(k)), 'MANAGED_FIELDS', 'Служебные поля плана не меняются через plan:apply.');
    const plan = { ...structuredClone(original), ...input, plan_revision: original.plan_revision + 1 };
    check(['ACTIVE', 'BLOCKED'].includes(plan.execution_scope_status) && original.execution_scope_status !== 'NONE', 'SCOPE_LIFECYCLE', 'Создание/архивирование scope выполняются отдельными командами.');
    const added = plan.tasks.filter(t => !original.tasks.some(old => old.id === t.id));
    const originalFinal = original.tasks.find(isDocumentationFinalizationTask);
    const correctionRound = original.execution_scope_status === 'ACTIVE' && original.delivery_status === 'READY_FOR_ACCEPTANCE'
      && original.current_task_id === null && originalFinal?.commit_status === 'DONE' && added.length > 0;
    for (const old of original.tasks) {
      const current = plan.tasks.find(t => t.id === old.id);
      check(current, 'TASK_REMOVAL', 'Существующие задачи не удаляются из активного scope.');
      if (old.commit_status === 'DONE') {
        if (correctionRound && isDocumentationFinalizationTask(old))
          check(JSON.stringify(current) === JSON.stringify(old), 'COMPLETED_TASK_IMMUTABLE', 'Перед повторным открытием DOCS её запись не меняется вручную.');
        else check(JSON.stringify(current) === JSON.stringify(old), 'COMPLETED_TASK_IMMUTABLE', 'Запись завершённой задачи неизменяема.');
      } else {
        check(current.implementation_status === old.implementation_status && current.commit_status === old.commit_status && JSON.stringify(current.commit_ref) === JSON.stringify(old.commit_ref), 'MANAGED_FIELDS', 'Статусы и references меняются командами task:start/commit.');
      }
    }
    for (const t of added) check(t.implementation_status === 'TODO' && t.commit_status === 'PENDING', 'MANAGED_FIELDS', 'Новая задача должна быть TODO/PENDING.');
    if (correctionRound) {
      const currentFinal = plan.tasks.find(isDocumentationFinalizationTask);
      const iteration = currentFinal.commit_ref?.iteration ?? 1;
      currentFinal.implementation_status = 'TODO'; currentFinal.commit_status = 'PENDING';
      currentFinal.commit_ref = { ...currentFinal.commit_ref, iteration: iteration + 1 };
      normalizeCompletionContract(plan);
    } else if (originalFinal?.commit_status !== 'DONE' || (!originalFinal && added.length)) normalizeCompletionContract(plan);
    if (added.some(t => t.functional_paths.length) || (input.context_pack && plan.tasks.some(t => t.functional_paths.length && t.commit_status !== 'DONE'))) requireModuleContext(plan);
    plan.delivery_status = plan.tasks.length && plan.tasks.every(t => t.commit_status === 'DONE') ? 'READY_FOR_ACCEPTANCE' : 'IN_PROGRESS';
    validatePlan(plan); resolveReferences(root, plan);
    if (plan.current_task_id) writePlan(root, plan);
    else service(root, plan, 'plan-adjustment', [PLAN], 'docs: уточнить план ' + plan.scope_id);
    return recover(root);
  });
}
export function applyConfig(root, input) {
  const PLAN = planPath(root);
  return locked(root, () => {
    noTransaction(root); const { plan } = validate(root);
    check(plan.current_task_id === null, 'TASK_ACTIVE', 'Настройку стека фиксируйте между микрозадачами.');
    const config = validateConfig(input); const before = fs.readFileSync(path.join(root, CONFIG), 'utf8');
    check(paths(root, 'staged').every(p => p === CONFIG), 'FOREIGN_STAGED', 'Сначала отделите посторонние staged-изменения.');
    atomic(path.join(root, CONFIG), json(config)); plan.plan_revision++;
    try { return service(root, plan, 'plan-adjustment', [CONFIG, PLAN], 'chore: настроить профиль разработки'); }
    catch (e) { if (!journal(root)) atomic(path.join(root, CONFIG), before); throw e; }
  });
}
export function archive(root, scope, approvalNote) {
  const PLAN = planPath(root);
  return locked(root, () => {
    noTransaction(root); const { plan } = validate(root);
    check(scope && plan.scope_id === scope, 'SCOPE_ID', 'Укажите точный --scope.');
    check(typeof approvalNote === 'string' && approvalNote.trim().length >= 10, 'USER_CLOSE_REQUIRED', 'Нужна отдельная команда пользователя на закрытие, записанная в --approval-note. Приёмка сама по себе не закрывает scope.');
    check(plan.tasks.every(t => t.commit_status === 'DONE'), 'SCOPE_UNFINISHED', 'В scope остались незавершённые задачи; обычное архивирование отклонено.');
    check(allChanges(root).length === 0, 'DIRTY_WORKTREE', 'Архивирование требует чистого рабочего дерева.');
    const destination = '.harness/plans/archive/' + scope + '.md';
    check(!fs.existsSync(path.join(root, destination)), 'ARCHIVE_EXISTS', 'Архив с таким ID уже существует.');
    atomic(path.join(root, destination), renderPlan(plan));
    const empty = emptyPlan(plan.project_name); empty.project_id = plan.project_id; empty.plan_revision = plan.plan_revision + 1;
    empty.owner_session_id = plan.owner_session_id ?? null; empty.prepared_in_session_id = plan.prepared_in_session_id ?? null;
    empty.archived_scope_id = scope; empty.user_decisions = [{ id: id(), text: approvalNote, recorded_at: new Date().toISOString() }];
    return service(root, empty, 'archive', [PLAN, destination], 'docs: архивировать scope ' + scope);
  });
}
export function repair(root, applyId) {
  const PLAN = planPath(root);
  const pending = journal(root); const raw = textFile(root, PLAN); let operation;
  if (pending) {
    const completed = completedTransaction(root, pending);
    operation = { kind: completed ? 'finish-commit' : 'retry-commit', sha: completed, message: completed ? 'Завершить технический журнал подтверждённого коммита.' : 'Повторить управляемую транзакцию с сохранением изменений.' };
  } else {
    const p = parsePlan(raw, { projection: false }); resolveReferences(root, p);
    operation = { kind: renderPlan(p) === raw ? 'none' : 'projection', message: renderPlan(p) === raw ? 'Повреждение не обнаружено.' : 'Восстановить читаемую проекцию из канонического JSON.' };
  }
  const repairId = hash(json({ operation, head: head(root), raw, pending })).slice(0, 24);
  if (!applyId) return { ok: true, repair_id: repairId, ...operation, dry_run: true };
  check(repairId === applyId, 'REPAIR_CHANGED', 'Состояние изменилось. Повторите repair --dry-run.');
  return locked(root, () => {
    if (operation.kind === 'finish-commit') return finishTransaction(root, pending, operation.sha);
    if (operation.kind === 'retry-commit') return commitCandidate(root, { plan: readPlan(root), role: pending.role, task: pending.task, selected: pending.selected, message: pending.message, checks: pending.checks, beforeHead: pending.before_head });
    if (operation.kind === 'projection') { const p = parsePlan(raw, { projection: false }); writePlan(root, p); return { ok: true, message: 'Проекция восстановлена. Изменения не коммитились автоматически.' }; }
    return { ok: true, message: operation.message };
  });
}
export function acknowledgeHook(root, marker, client = 'Codex') {
  const receipt = readJSON(localPath(root, 'recovery.json'));
  check(receipt.marker && receipt.marker === marker && receipt.reason !== 'manual', 'HOOK_MARKER', 'Маркер не соответствует последнему lifecycle-событию.');
  const hooksHash = hash(fs.readFileSync(path.join(root, '.codex/hooks.json')));
  const file = acknowledgementsPath(root);
  const records = fs.existsSync(file) ? readJSON(file) : {};
  records[receipt.reason] = { marker, client, kit_version: VERSION, hooks_hash: hooksHash, at: new Date().toISOString(), signature: receipt.signature, plan_revision: receipt.plan_revision };
  atomic(file, json(records)); return { ok: true, message: 'Получение контекста агентом отмечено для события ' + receipt.reason + '.' };
}
export function status(root) {
  const { plan, config, resolved, transaction } = validate(root);
  const receiptFile = localPath(root, 'recovery.json'); const ackFile = acknowledgementsPath(root);
  const hooksFile = path.join(root, '.codex/hooks.json'); const hooksHash = fs.existsSync(hooksFile) ? hash(fs.readFileSync(hooksFile)) : null;
  const receipts = fs.existsSync(ackFile) ? readJSON(ackFile) : {};
  const acknowledged = Object.fromEntries(Object.entries(receipts).filter(([, r]) => r.hooks_hash === hooksHash && r.kit_version === VERSION));
  const recovery = recover(root);
  return { ok: true, project_path: root, project_name: plan.project_name, version: VERSION, project_id: plan.project_id,
    scope_status: plan.execution_scope_status, delivery_status: plan.delivery_status, scope_id: plan.scope_id, objective: plan.objective,
    current_task_id: plan.current_task_id, next_task_id: nextTask(plan)?.id ?? null, plan_revision: plan.plan_revision,
    tasks_done: plan.tasks.filter(t => t.commit_status === 'DONE').length, tasks_total: plan.tasks.length,
    profile: config.profile, stack: config.stack, head: head(root), changes: allChanges(root), resolved,
    transaction: transaction ? { id: transaction.id, phase: transaction.phase, task: transaction.task_id } : null,
    integration_status: !hooksHash ? 'HOOK_MISSING' : acknowledged.startup ? 'HOOK_VERIFIED' : 'HOOK_TRUST_PENDING',
    hook_events: acknowledged, auto_compact_status: 'AUTO_COMPACT_UNVERIFIED',
    last_hook_execution: fs.existsSync(receiptFile) ? readJSON(receiptFile) : null,
    recovery_size: recovery.size, recovery_text: recovery.text,
    git_identity_ready: identityReady(root), manifest_present: fs.existsSync(path.join(root, MANIFEST)) };
}

export function preparePlan(root, input, expectedRevision) {
  const selected = currentPlanSelection();
  check(selected?.sessionId, 'SESSION_REQUIRED', 'Для подготовки укажите исходную --session.');
  const source = readPlan(root); revision(source, expectedRevision);
  check(expectedRevision !== undefined, 'EXPECTED_REVISION_REQUIRED', 'Укажите revision исходного плана.');
  const scopeId = input.scope_id || 'scope-' + id(); validIdentity(scopeId);
  const existing = listPlans(root).find(r => r.plan.scope_id === scopeId);
  if (existing) {
    check(existing.plan.prepared_in_session_id === selected.sessionId, 'SCOPE_EXISTS', 'Этот planId уже используется.');
    return { ok: true, plan_id: scopeId, already_prepared: true };
  }
  const empty = { ...emptyPlan(source.project_name), project_id: source.project_id };
  return withPlanFile(root, ownedPlanPath(scopeId), { sessionId: selected.sessionId, virtualPlan: empty, newPlan: true, draft: true },
    () => createScope(root, { ...input, scope_id: scopeId }, empty.plan_revision));
}
export function bindPlan(root, targetSession, experience, expectedRevision) {
  const PLAN = planPath(root), selected = currentPlanSelection();
  validIdentity(targetSession, 'sessionId');
  check(['chat', 'work'].includes(experience), 'SESSION_EXPERIENCE', 'Выберите Chat или Work.');
  return locked(root, () => {
    noTransaction(root); assertSingleWriter(root, PLAN);
    const { plan } = validate(root);
    check(plan.prepared_in_session_id === selected?.sessionId, 'PLAN_OWNER_MISMATCH', 'План подготовлен в другой сессии.');
    if (plan.owner_session_id) return { ok: true, session_id: plan.owner_session_id, experience: plan.session_experience, plan_id: plan.scope_id, already_bound: true };
    check(expectedRevision !== undefined, 'EXPECTED_REVISION_REQUIRED', 'Укажите revision подготовленного плана.'); revision(plan, expectedRevision);
    check(!listPlans(root).some(r => r.plan.owner_session_id === targetSession), 'SESSION_HAS_PLAN', 'У целевой сессии уже есть план.');
    check(targetSession !== selected.sessionId, 'SESSION_HAS_PLAN', 'Продолжению нужна новая сессия.');
    check(plan.current_task_id === null, 'TASK_ACTIVE', 'Нельзя привязать выполняемую задачу.');
    plan.owner_session_id = targetSession; plan.session_experience = experience; plan.plan_revision++;
    const result = service(root, plan, 'plan-adjustment', [PLAN], 'docs: привязать подготовленный план ' + plan.scope_id);
    return { ...result, session_id: targetSession, experience, plan_id: plan.scope_id };
  });
}
export function adoptPlan(root, evidence, expectedRevision) {
  const PLAN = planPath(root), selected = currentPlanSelection();
  return locked(root, () => {
    noTransaction(root); const { plan } = validate(root);
    check(selected?.sessionId && evidence?.session_id === selected.sessionId && evidence?.project_id === plan.project_id
      && evidence?.scope_id === plan.scope_id && typeof evidence.reason === 'string' && evidence.reason.trim().length >= 10,
      'PLAN_EVIDENCE_REQUIRED', 'Нужны доказанные session_id/project_id/scope_id и источник связи.');
    if (plan.owner_session_id === selected.sessionId) return { ok: true, already_adopted: true, plan_id: plan.scope_id };
    check(!plan.owner_session_id && !plan.prepared_in_session_id, 'PLAN_OWNER_MISMATCH', 'У плана уже есть принадлежность.');
    check(expectedRevision !== undefined, 'EXPECTED_REVISION_REQUIRED', 'Укажите revision исторического плана.'); revision(plan, expectedRevision);
    check(!listPlans(root).some(r => r.plan.owner_session_id === selected.sessionId), 'SESSION_HAS_PLAN', 'У сессии уже есть свой план.');
    check(plan.current_task_id === null, 'TASK_ACTIVE', 'Привязка legacy выполняется между микрозадачами.');
    plan.owner_session_id = selected.sessionId; plan.plan_revision++;
    plan.ownership_evidence = { reason: evidence.reason, recorded_at: new Date().toISOString() };
    return service(root, plan, 'plan-adjustment', [PLAN], 'docs: сохранить подтверждённую принадлежность плана ' + plan.scope_id);
  });
}
