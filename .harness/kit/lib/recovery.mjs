import fs from 'node:fs';
import path from 'node:path';
import { VERSION, PLAN, CONFIG, check, contextPath, textFile, atomic, json, hash, id, errorResult } from './common.mjs';
import { validate } from './validate.mjs';
import { nextTask } from './plan.mjs';
import { snapshot, diff, git, localPath, head, fileFingerprint } from './git.mjs';

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
    const documents = [...plan.context_pack.documents, ...(task?.context_pack?.documents ?? [])];
    const mandatory = documents.filter(d => d.required); const optional = documents.filter(d => !d.required);
    const relevant = [PLAN, CONFIG, rulesPath, ...mandatory.map(d => d.path), ...optional.filter(d => fs.existsSync(path.join(root, d.path))).map(d => d.path), ...(task ? [...task.functional_paths, ...task.documentation_paths] : [])];
    relevant.forEach(p => contextPath(root, p));
    const before = snapshot(root, relevant);
    if (before.head !== initialHead || before.files[PLAN] !== initialPlan || before.files[CONFIG] !== initialConfig) { if (attempt === 0) continue; check(false, 'CONCURRENT_CHANGE', 'HEAD, план или конфигурация меняются во время проверки ссылок.'); }
    const rules = section(textFile(root, rulesPath), ['Workflow', 'Обязательные правила'], rulesPath);
    const done = plan.tasks.filter(t => resolved[t.id]?.sha);
    const neededIds = [...new Set([...(plan.context_pack.include_last_completed_task && done.length ? [done.at(-1).id] : []), ...plan.context_pack.dependency_task_ids, ...(task?.dependencies ?? [])])];
    const selected = task ? [...task.functional_paths, ...task.documentation_paths] : [];
    const selectedSet = new Set(selected);
    const foreign = [...new Set([...before.staged, ...before.unstaged, ...before.untracked])].filter(p => p !== PLAN && !selectedSet.has(p));
    const pending = transaction && !Object.values(resolved).some(r => r.sha && transaction.result_sha === r.sha);
    let continuation;
    if (transaction) continuation = 'Есть незавершённый журнал commit. Сначала status и повтор commit/repair; новую задачу не начинать.';
    else if (plan.execution_scope_status === 'NONE') continuation = 'Обсудить с пользователем идею и требования. Стек можно выбрать позже. После согласования ближайшего scope создать план командой scope:create. Существующий код без согласованной задачи не менять.';
    else if (plan.execution_scope_status === 'BLOCKED') continuation = 'Разрешены обсуждение и диагностика. Причина: ' + plan.blocked_reason;
    else if (plan.delivery_status === 'READY_FOR_ACCEPTANCE') continuation = 'Все микрозадачи зафиксированы. Показать результат пользователю. Scope остаётся ACTIVE; архивирование требует отдельной прямой команды.';
    else continuation = (plan.current_task_id ? 'Продолжить ' : 'Начать через task:start ') + (task?.id ?? 'задачу после уточнения зависимостей') + '. Проверки и фиксация выполняются управляемой командой commit.';
    const blocks = [
      'WORKFLOW RECOVERY / schema 1 / kit ' + VERSION + (marker ? '\nDELIVERY-MARKER: ' + marker : ''),
      'Причина: ' + reason + '\nПроект: ' + plan.project_name + '\nProject ID: ' + plan.project_id + '\nScope: ' + (plan.scope_id ?? 'NONE') + '\nWorktree: ' + root,
      'HEAD: ' + (before.head ?? 'первого коммита ещё нет') + '\nPlan revision: ' + plan.plan_revision + '\nSnapshot: ' + before.fingerprint,
      'Состояние: ' + plan.execution_scope_status + ' / ' + plan.delivery_status + (pending ? ' / COMMIT_PENDING' : ''),
      rules,
      'ЦЕЛЬ\n' + (plan.objective || 'Сформулировать идею нового проекта.') + '\nКритерии:\n' + plan.acceptance_criteria.map(c => '- ' + c).join('\n'),
      'РЕШЕНИЯ ПОЛЬЗОВАТЕЛЯ\n' + json(plan.user_decisions),
      'ТЕКУЩАЯ ЗАДАЧА\n' + (task ? json(task) : 'Активной микрозадачи нет.'),
      'ПРОГРЕСС\n' + plan.tasks.map(t => t.id + ': ' + t.implementation_status + (resolved[t.id]?.sha ? ' / ' + resolved[t.id].sha : resolved[t.id]?.pending ? ' / COMMIT_PENDING' : '')).join('\n'),
      'НАСТРОЙКИ ПРОВЕРОК\n' + json({ profile: config.profile, stack: config.stack, checks: config.checks }),
    ];
    const included = [PLAN, CONFIG, rulesPath]; const omitted = [];
    for (const doc of mandatory) {
      contextPath(root, doc.path);
      blocks.push(dataBlock(doc.path, section(textFile(root, doc.path), doc.heading_path, doc.path))); included.push(doc.path);
    }
    for (const taskId of neededIds) {
      const reference = resolved[taskId];
      check(reference?.sha, 'CONTEXT_COMMIT', 'Не разрешена обязательная зависимость контекста: ' + taskId);
      const patch = git(root, ['diff', '--no-ext-diff', '--no-textconv', '--no-renames', '--no-color', reference.parent, reference.sha, '--', ...reference.paths.filter(p => p !== PLAN)]).stdout;
      blocks.push(dataBlock('commit ' + reference.sha + ' / ' + taskId, patch)); included.push(reference.sha);
    }
    for (const [kind, pathsKey] of [['staged', 'staged'], ['unstaged', 'unstaged']]) {
      const files = before[pathsKey].filter(p => selectedSet.has(p));
      blocks.push(kind.toUpperCase() + ': ' + (files.join(', ') || 'нет'));
      if (files.length) blocks.push(dataBlock(kind, diff(root, kind, files)));
    }
    for (const file of before.untracked.filter(p => selectedSet.has(p))) {
      contextPath(root, file);
      const bytes = fs.readFileSync(path.join(root, file));
      blocks.push(bytes.includes(0) ? dataBlock(file, 'Бинарный untracked: ' + bytes.length + ' байт. Нужен профильный просмотр.') : dataBlock('untracked: ' + file, textFile(root, file)));
    }
    blocks.push('ПОСТОРОННИЕ ИЗМЕНЕНИЯ\n' + (foreign.join('\n') || 'нет'));
    if (transaction) blocks.push('ТРАНЗАКЦИЯ\n' + json({ id: transaction.id, task: transaction.task_id, phase: transaction.phase, before_head: transaction.before_head }));
    const evidenceFile = localPath(root, 'last-verification.json');
    blocks.push('ПРОВЕРКИ\n' + (fs.existsSync(evidenceFile) ? fs.readFileSync(evidenceFile, 'utf8') : 'Локальных результатов проверок нет. Это не означает PASSED.'));
    blocks.push('ПРОДОЛЖЕНИЕ\n' + continuation);
    const measure = s => ({ bytes: Buffer.byteLength(s, 'utf8'), tokens: Math.ceil(Buffer.byteLength(s, 'utf8') / 2) });
    let body = blocks.join('\n\n');
    for (const doc of optional) {
      try {
        contextPath(root, doc.path);
        const piece = dataBlock(doc.path, section(textFile(root, doc.path), doc.heading_path, doc.path));
        if (measure(body + piece).tokens <= config.budget.soft_tokens) { body += piece; included.push(doc.path); }
        else omitted.push({ path: doc.path, reason: 'SOFT_BUDGET' });
      } catch (e) { omitted.push({ path: doc.path, reason: e.code ?? e.message }); }
    }
    body += '\n\nПОЛНОТА: COMPLETE\nВключено: ' + included.join(', ') + '\nОпущено только необязательное: ' + json(omitted);
    const size = measure(body);
    check(size.tokens <= config.budget.hard_tokens && size.bytes <= config.budget.hard_bytes, 'CONTEXT_TOO_LARGE', 'Обязательный контекст превышает бюджет. Разделите микрозадачу или context pack; данные не обрезаны.', { ...size, budget: config.budget });
    options.beforeRecheck?.(attempt);
    const after = snapshot(root, relevant);
    const finalJournal = fs.existsSync(journalFile) ? hash(fs.readFileSync(journalFile)) : null;
    if (after.fingerprint !== before.fingerprint || finalJournal !== initialJournal) { if (attempt === 0) continue; check(false, 'CONCURRENT_CHANGE', 'Проект меняется во время восстановления. Повторите после завершения другой операции.'); }
    const packet = { ok: true, text: body, marker, signature: hash(body), completeness: 'COMPLETE', reason, head: before.head, plan_revision: plan.plan_revision,
      scope_id: plan.scope_id, task_id: plan.current_task_id, next_task_id: task?.id ?? null, included, omitted, size, token_method: 'ceil(UTF-8 bytes / 2), conservative estimate', elapsed_ms: Date.now() - started };
    if (options.receipt) atomic(localPath(root, 'recovery.json'), json({ ...packet, text: undefined, worktree: root, created_at: new Date().toISOString() }));
    return packet;
  }
}
export function sessionStart(root, event) {
  try {
    check(event?.hook_event_name === 'SessionStart' && ['startup', 'resume', 'clear', 'compact'].includes(event.source), 'HOOK_INPUT', 'Некорректное событие SessionStart.');
    const result = recover(root, event.source, { receipt: true });
    return { continue: true, hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: result.text } };
  } catch (e) { const error = errorResult(e); return { continue: false, stopReason: error.code, systemMessage: error.message + ' Диагностика: ./scripts/workflow status', }; }
}
