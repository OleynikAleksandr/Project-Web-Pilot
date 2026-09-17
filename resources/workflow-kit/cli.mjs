#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { errorResult, check, readJSON, json, withPlanFile, PLAN } from './lib/common.mjs';
import { repoRoot } from './lib/git.mjs';
import { status, createScope, startTask, applyPlan, applyConfig, archive, repair, acknowledgeHook, preparePlan, bindPlan, adoptPlan } from './lib/actions.mjs';
import { journal } from './lib/validate.mjs';
import { withSessionPlan, sessionPlanView } from './lib/session-plans.mjs';
import { validate } from './lib/validate.mjs';
import { recover, sessionStart, contextPacket } from './lib/recovery.mjs';
import { commitTask } from './lib/transaction.mjs';
import { preCommit, commitMessage, postCommit, prePush } from './lib/git-hooks.mjs';

export function argumentsOf(argv) {
  const opts = {}; const args = [];
  for (let i = 0; i < argv.length; i++) {
    const value = argv[i];
    if (!value.startsWith('--')) { args.push(value); continue; }
    const key = value.slice(2);
    check(!Object.hasOwn(opts, key), 'ARGUMENTS', 'Параметр повторяется: ' + value);
    if (['json', 'dry-run', 'update'].includes(key)) opts[key] = true;
    else { check(i + 1 < argv.length && !argv[i + 1].startsWith('--'), 'ARGUMENTS', 'Не задано значение: ' + value); opts[key] = argv[++i]; }
  }
  return { opts, args };
}
export async function main(argv = process.argv.slice(2)) {
  let isHook = argv[0] === 'hook'; let opts = {};
  try {
    const parsed = argumentsOf(argv); opts = parsed.opts;
    const [raw = 'help', ...rest] = parsed.args;
    const aliases = { 'plan:status': 'status', 'plan:validate': 'validate', 'plan:commit': 'commit', 'plan:repair': 'repair', 'plan:archive': 'archive' };
    const command = aliases[raw] ?? raw;
    check(Number(process.versions.node.split('.')[0]) >= 22, 'NODE_VERSION', 'Требуется Node.js 22 или новее.');
    if (['install', 'install:commit', 'inspect', 'remove', 'doctor'].includes(command)) {
      const { installerCommand } = await import('./lib/installer.mjs');
      return { value: await installerCommand(command, opts), json: true };
    }
    if (command === 'help') return { value: 'Project Workflow Kit\n\nВсе команды плана: --session <sessionId>; другой план: --plan <planId>.\nplan:view / plan:prepare / plan:bind / plan:adopt — см. WORKFLOW.md.\n\n./scripts/workflow status\n./scripts/workflow recover --format text\n./scripts/workflow scope:create --input scope.json\n./scripts/workflow task:start T001\n./scripts/workflow commit --task T001\n./scripts/workflow plan:apply --input changes.json --expected-revision N\n./scripts/workflow config:apply --input config.json\n./scripts/workflow repair --dry-run\n./scripts/workflow archive --scope ID --approval-note "Прямая команда пользователя"\n\nПолный протокол: .harness/kit/WORKFLOW.md', json: false };
    let event; if (isHook) event = JSON.parse(fs.readFileSync(0, 'utf8'));
    const root = repoRoot(opts.project || event?.cwd || process.cwd());
    let result;
    const input = () => { check(opts.input, 'INPUT_REQUIRED', 'Укажите --input <JSON-файл>.'); return readJSON(path.resolve(opts.input)); };
    const execute = () => {
    switch (command) {
      case 'status': result = status(root); break;
      case 'validate': { const r = validate(root); result = { ok: true, message: 'План и Git согласованы.', plan_revision: r.plan.plan_revision, resolved: r.resolved, transaction_pending: !!r.transaction }; break; }
      case 'recover': { if (opts.format === 'packet') return { value: contextPacket(root), json: true }; const p = recover(root); return { value: opts.format === 'json' || opts.json ? p : p.text, json: opts.format === 'json' || !!opts.json }; }
      case 'plan:view': check(opts.session, 'SESSION_REQUIRED', 'Укажите --session.'); result = sessionPlanView(root, opts.session); break;
      case 'plan:prepare': result = preparePlan(root, input(), opts['expected-revision']); break;
      case 'plan:bind': result = bindPlan(root, opts['target-session'], opts.experience, opts['expected-revision']); break;
      case 'plan:adopt': result = adoptPlan(root, input(), opts['expected-revision']); break;
      case 'scope:create': result = createScope(root, input(), opts['expected-revision']); break;
      case 'task:start': result = startTask(root, rest[0], opts['expected-revision']); break;
      case 'plan:apply': result = applyPlan(root, input(), opts['expected-revision']); break;
      case 'config:apply': result = applyConfig(root, input()); break;
      case 'commit': { check(opts.task, 'TASK_REQUIRED', 'Укажите --task <id>.'); result = commitTask(root, opts.task); result.state = recover(root); break; }
      case 'repair': result = repair(root, opts.apply); break;
      case 'archive': result = archive(root, opts.scope, opts['approval-note']); break;
      case 'hook:ack': result = acknowledgeHook(root, opts.marker, opts.client); break;
      case 'hook': check(rest[0] === 'session-start', 'HOOK_COMMAND', 'Неизвестный hook.'); return { value: sessionStart(root, event), json: true };
      case 'git-hook': {
        const handlers = { 'pre-commit': preCommit, 'commit-msg': r => commitMessage(r, rest[1]), 'post-commit': postCommit, 'pre-push': prePush };
        check(handlers[rest[0]], 'HOOK_COMMAND', 'Неизвестный Git hook.'); result = handlers[rest[0]](root); break;
      }
      default: check(false, 'UNKNOWN_COMMAND', 'Неизвестная команда: ' + command);
    }
    return { value: result, json: true };
    };
    if (command === 'plan:view') return execute();
    if (command === 'git-hook') {
      const pending = journal(root);
      return withPlanFile(root, pending?.plan_path ?? PLAN, {}, execute);
    }
    const mutating = ['scope:create', 'task:start', 'plan:apply', 'commit', 'archive', 'repair', 'plan:prepare', 'plan:bind', 'plan:adopt', 'config:apply'].includes(command);
    if (mutating && opts.plan) check(opts.session, 'SESSION_REQUIRED', 'Запись требует явной --session.');
    return withSessionPlan(root, { sessionId: opts.session, planId: opts.plan,
      allowDraft: ['plan:bind', 'plan:apply'].includes(command), allowUnowned: command === 'plan:adopt' }, execute);
  } catch (e) {
    if (isHook) return { value: { continue: false, stopReason: e.code ?? 'HOOK_ERROR', systemMessage: e.message + ' Диагностика: ./scripts/workflow doctor' }, json: true };
    return { value: errorResult(e), json: true, exitCode: 1 };
  }
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = await main(); process.stdout.write(result.json ? json(result.value) : result.value + '\n'); process.exitCode = result.exitCode ?? 0;
}
