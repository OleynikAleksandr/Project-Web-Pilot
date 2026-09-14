import fs from 'node:fs';
import path from 'node:path';
import { VERSION, PLAN, CONFIG, check, contextPath, textFile, atomic, json, hash, id, errorResult } from './common.mjs';
import { validate } from './validate.mjs';
import { nextTask } from './plan.mjs';
import { snapshot, diff, git, localPath, head, fileFingerprint } from './git.mjs';

export const TRANSPORT_HARD_BYTES = 180000;

export function section(text, headings, file) {
  if (!headings?.length) return text;
  const lines = text.split('\n'); const found = []; const stack = [];
  let fenced = false;
  for (let i = 0; i < lines.length; i++) {
    if (/^\s*(```|~~~)/.test(lines[i])) { fenced = !fenced; continue; }
    if (fenced) continue;
    const match = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(lines[i]); if (!match) continue;
    const level = match[1].length;
    while (stack.length && stack.at(-1).level >= level) stack.pop();
    stack.push({ level, name: match[2] });
    if (JSON.stringify(stack.map(s => s.name)) === JSON.stringify(headings)) found.push({ start: i, level });
  }
  check(found.length === 1, 'CONTEXT_SECTION', 'Раздел отсутствует или неоднозначен: ' + file + ' → ' + headings.join(' / '));
  const { start, level } = found[0]; let end = lines.length; fenced = false;
  for (let i = start + 1; i < lines.length; i++) {
    if (/^\s*(```|~~~)/.test(lines[i])) { fenced = !fenced; continue; }
    const match = !fenced && /^(#{1,6})\s/.exec(lines[i]); if (match && match[1].length <= level) { end = i; break; }
  }
  return lines.slice(start, end).join('\n');
}

const dataBlock = (source, text) => '\n--- ДАННЫЕ: ' + source + ' ---\n' + text + '\n--- КОНЕЦ ДАННЫХ ---\n';
const measure = s => ({ bytes: Buffer.byteLength(s, 'utf8'), tokens: Math.ceil(Buffer.byteLength(s, 'utf8') / 2) });
const docKey = d => JSON.stringify([d.path, d.heading_path ?? [], Boolean(d.required)]);
function uniqueDocuments(list) {
  const seen = new Set(); const result = [];
  for (const doc of list) { const key = docKey(doc); if (!seen.has(key)) { seen.add(key); result.push(doc); } }
  return result;
}
function referenceLine(doc) { return '- ' + doc.path + (doc.heading_path?.length ? ' → ' + doc.heading_path.join(' / ') : ''); }
function sectionsForError(parts) {
  return parts.map(part => ({ label: part.label, ...measure(part.text) })).sort((a, b) => b.bytes - a.bytes).slice(0, 12);
}
function relevantEvidence(root, beforeHead, neededShas, transaction) {
  const file = localPath(root, 'last-verification.json');
  if (!fs.existsSync(file)) return null;
  try {
    const evidence = JSON.parse(fs.readFileSync(file, 'utf8'));
    const related = (evidence.commit && new Set([beforeHead, ...neededShas]).has(evidence.commit)) ||
      (transaction && evidence.transaction_id === transaction.id);
    if (!related) return null;
    return { commit: evidence.commit ?? null, candidate_tree: evidence.candidate_tree ?? null,
      checks: Array.isArray(evidence.checks) ? evidence.checks.map(c => ({ id: c.id, status: c.status, exit_code: c.exit_code, elapsed_ms: c.elapsed_ms })) : [],
      note: evidence.note ?? undefined };
  } catch { return null; }
}

export function recover(root, reason = 'manual', options = {}) {
  for (let attempt = 0; attempt < 2; attempt++) {
    const started = Date.now(); const marker = options.receipt ? id() : null;
    const initialHead = head(root);
    const initialPlan = fileFingerprint(root, PLAN);
    const initialConfig = fileFingerprint(root, CONFIG);
    const journalFile = localPath(root, 'transaction.json');
    const initialJournal = fs.existsSync(journalFile) ? hash(fs.readFileSync(journalFile)) : null;
    const { plan, config, resolved, transaction } = validate(root);
    const task = transaction?.task ?? nextTask(plan);
    const rulesPath = '.harness/kit/WORKFLOW.md';
    const documents = uniqueDocuments([...plan.context_pack.documents, ...(task?.context_pack?.documents ?? [])]);
    const mandatory = documents.filter(d => d.required); const references = documents.filter(d => !d.required);
    const existingRefs = references.filter(d => fs.existsSync(path.join(root, d.path)));
    const relevant = [PLAN, CONFIG, rulesPath, ...mandatory.map(d => d.path), ...existingRefs.map(d => d.path), ...(task ? [...task.functional_paths, ...task.documentation_paths] : [])];
    relevant.forEach(p => contextPath(root, p));
    const before = snapshot(root, relevant);
    if (before.head !== initialHead || before.files[PLAN] !== initialPlan || before.files[CONFIG] !== initialConfig) {
      if (attempt === 0) continue;
      check(false, 'CONCURRENT_CHANGE', 'HEAD, план или конфигурация меняются во время проверки ссылок.');
    }

    const core = section(textFile(root, rulesPath), ['Workflow', 'Workflow Core'], rulesPath);
    const neededIds = [...new Set([...plan.context_pack.dependency_task_ids, ...(task?.dependencies ?? [])])];
    const neededShas = [];
    const selected = task ? [...task.functional_paths, ...task.documentation_paths] : [];
    const selectedSet = new Set(selected);
    const foreign = [...new Set([...before.staged, ...before.unstaged, ...before.untracked])].filter(p => p !== PLAN && !selectedSet.has(p));
    const pending = transaction && !Object.values(resolved).some(r => r.sha && transaction.result_sha === r.sha);
    let continuation;
    if (transaction) continuation = 'Есть незавершённый журнал commit. Сначала status и повтор commit/repair; новую задачу не начинать.';
    else if (plan.execution_scope_status === 'NONE') continuation = 'Обсудить запрос пользователя, найти владельца в docs/MODULES.md и сначала согласовать module specification. После согласования ближайшего scope создать plan через scope:create.';
    else if (plan.execution_scope_status === 'BLOCKED') continuation = 'Разрешены обсуждение и диагностика. Причина: ' + plan.blocked_reason;
    else if (plan.delivery_status === 'READY_FOR_ACCEPTANCE') continuation = 'Все микрозадачи зафиксированы. Показать результат пользователю. Scope остаётся ACTIVE; архивирование требует отдельной прямой команды.';
    else continuation = (plan.current_task_id ? 'Продолжить ' : 'Начать через task:start ') + (task?.id ?? 'задачу после уточнения зависимостей') + '. Проверки и фиксация выполняются управляемой командой commit.';

    const parts = [];
    const add = (label, text) => parts.push({ label, text });
    add('header', 'WORKFLOW RECOVERY / schema 2 / kit ' + VERSION + (marker ? '\nDELIVERY-MARKER: ' + marker : ''));
    add('identity', 'Причина: ' + reason + '\nПроект: ' + plan.project_name + '\nProject ID: ' + plan.project_id + '\nScope: ' + (plan.scope_id ?? 'NONE') + '\nWorktree: ' + root);
    add('snapshot', 'HEAD: ' + (before.head ?? 'первого коммита ещё нет') + '\nPlan revision: ' + plan.plan_revision + '\nSnapshot: ' + before.fingerprint);
    add('state', 'Состояние: ' + plan.execution_scope_status + ' / ' + plan.delivery_status + (pending ? ' / COMMIT_PENDING' : ''));
    add('workflow-core', core);
    add('objective', 'ЦЕЛЬ\n' + (plan.objective || 'Сформулировать идею нового проекта.') + '\nКритерии:\n' + plan.acceptance_criteria.map(c => '- ' + c).join('\n'));
    add('user-decisions', 'РЕШЕНИЯ ПОЛЬЗОВАТЕЛЯ\n' + json(plan.user_decisions));
    add('current-task', 'ТЕКУЩАЯ ЗАДАЧА\n' + (task ? json(task) : 'Активной микрозадачи нет.'));
    add('progress', 'ПРОГРЕСС\n' + plan.tasks.map(t => t.id + ': ' + t.implementation_status + (resolved[t.id]?.sha ? ' / ' + resolved[t.id].sha : resolved[t.id]?.pending ? ' / COMMIT_PENDING' : '')).join('\n'));

    const included = [PLAN, CONFIG, rulesPath]; const omitted = [];
    for (const doc of mandatory) {
      contextPath(root, doc.path);
      const piece = dataBlock(doc.path, section(textFile(root, doc.path), doc.heading_path, doc.path));
      add('required:' + doc.path, piece); included.push(doc.path);
    }
    if (references.length) {
      add('reference-only', 'REFERENCE-ONLY ДОКУМЕНТЫ\n' + references.map(referenceLine).join('\n'));
      for (const doc of references) omitted.push({ path: doc.path, reason: fs.existsSync(path.join(root, doc.path)) ? 'REFERENCE_ONLY' : 'MISSING_REFERENCE' });
    }

    for (const taskId of neededIds) {
      const reference = resolved[taskId];
      check(reference?.sha, 'CONTEXT_COMMIT', 'Не разрешена обязательная зависимость контекста: ' + taskId);
      const patch = git(root, ['diff', '--no-ext-diff', '--no-textconv', '--no-renames', '--no-color', reference.parent, reference.sha, '--', ...reference.paths.filter(p => p !== PLAN)]).stdout;
      add('dependency:' + taskId, dataBlock('commit ' + reference.sha + ' / ' + taskId, patch)); included.push(reference.sha); neededShas.push(reference.sha);
    }

    for (const [kind, pathsKey] of [['staged', 'staged'], ['unstaged', 'unstaged']]) {
      const files = before[pathsKey].filter(p => selectedSet.has(p));
      add(kind + '-summary', kind.toUpperCase() + ': ' + (files.join(', ') || 'нет'));
      if (files.length) add(kind + '-diff', dataBlock(kind, diff(root, kind, files)));
    }
    for (const file of before.untracked.filter(p => selectedSet.has(p))) {
      contextPath(root, file);
      const bytes = fs.readFileSync(path.join(root, file));
      add('untracked:' + file, bytes.includes(0) ? dataBlock(file, 'Бинарный untracked: ' + bytes.length + ' байт. Нужен профильный просмотр.') : dataBlock('untracked: ' + file, textFile(root, file)));
    }
    add('foreign', 'ПОСТОРОННИЕ ИЗМЕНЕНИЯ\n' + (foreign.join('\n') || 'нет'));
    if (transaction) add('transaction', 'ТРАНЗАКЦИЯ\n' + json({ id: transaction.id, task: transaction.task_id, phase: transaction.phase, before_head: transaction.before_head }));
    const evidence = relevantEvidence(root, before.head, neededShas, transaction);
    add('verification', 'ПРОВЕРКИ\n' + (evidence ? json(evidence) : 'Нет verification evidence, относящейся к текущему snapshot/dependency. Это не означает PASSED.'));
    add('next-action', 'ПРОДОЛЖЕНИЕ\n' + continuation);

    let body = parts.map(p => p.text).join('\n\n');
    body += '\n\nПОЛНОТА: COMPLETE\nВключено: ' + included.join(', ') + '\nReference-only: ' + json(omitted);
    const size = measure(body);
    const effectiveBudget = { soft_tokens: config.budget.soft_tokens,
      hard_tokens: Math.min(config.budget.hard_tokens, Math.ceil(TRANSPORT_HARD_BYTES / 2)),
      hard_bytes: Math.min(config.budget.hard_bytes, TRANSPORT_HARD_BYTES), configured: config.budget };
    check(size.tokens <= effectiveBudget.hard_tokens && size.bytes <= effectiveBudget.hard_bytes,
      'CONTEXT_TOO_LARGE', 'Обязательный execution context превышает транспортный бюджет. Уменьшите required module/task context или разделите scope; данные не обрезаны.',
      { ...size, budget: effectiveBudget, largest_sections: sectionsForError(parts) });

    options.beforeRecheck?.(attempt);
    const after = snapshot(root, relevant);
    const finalJournal = fs.existsSync(journalFile) ? hash(fs.readFileSync(journalFile)) : null;
    if (after.fingerprint !== before.fingerprint || finalJournal !== initialJournal) {
      if (attempt === 0) continue;
      check(false, 'CONCURRENT_CHANGE', 'Проект меняется во время восстановления. Повторите после завершения другой операции.');
    }
    const packet = { ok: true, text: body, marker, signature: hash(body), completeness: 'COMPLETE', reason, head: before.head, plan_revision: plan.plan_revision,
      scope_id: plan.scope_id, task_id: plan.current_task_id, next_task_id: task?.id ?? null, included, omitted, size,
      budget: effectiveBudget, soft_exceeded: size.tokens > config.budget.soft_tokens,
      token_method: 'ceil(UTF-8 bytes / 2), conservative estimate', elapsed_ms: Date.now() - started };
    if (options.receipt) atomic(localPath(root, 'recovery.json'), json({ ...packet, text: undefined, worktree: root, created_at: new Date().toISOString() }));
    return packet;
  }
}

export function sessionStart(root, event) {
  try {
    check(event?.hook_event_name === 'SessionStart' && ['startup', 'resume', 'clear', 'compact'].includes(event.source), 'HOOK_INPUT', 'Некорректное событие SessionStart.');
    const result = recover(root, event.source, { receipt: true });
    return { continue: true, hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: result.text } };
  } catch (e) { const error = errorResult(e); return { continue: false, stopReason: error.code, systemMessage: error.message + ' Диагностика: ./scripts/workflow status' }; }
}
