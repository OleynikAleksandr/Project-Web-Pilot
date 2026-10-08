import fs from 'node:fs';
import path from 'node:path';
import { atomic, check, hash, id, json, safePath, textFile, contextPath, readJSON } from './common.mjs';
import { readPlan } from './plan.mjs';
import { head, git } from './git.mjs';
import { locked } from './transaction.mjs';
import { journal, readConfig } from './validate.mjs';
import { buildScopePlan, createScope } from './actions.mjs';

export const REVIEW_STATE = '.harness/runtime/plan-review/state.json';
export const REVIEW_DIRECTORY = '.harness/runtime/plan-review';
const stages = ['IDLE','PREPARED','RUNNING','AUTHOR_PENDING','AGREED','NEEDS_USER','STALE','CANCELLED','PUBLISHING','PUBLISHED'];
export function readReview(root) {
  const file = safePath(root, REVIEW_STATE);
  if (!fs.existsSync(file)) return { version:1, enabled:false, stage:'IDLE', generation:0, round:0 };
  const s = readJSON(file);
  check(s.version === 1 && typeof s.enabled === 'boolean' && stages.includes(s.stage)
    && Number.isSafeInteger(s.generation), 'REVIEW_STATE', 'Повреждено состояние Review. Не публикуйте план до исправления.');
  if (s.run_id) reviewDirectory(root, s.run_id);
  return s;
}
export function reviewDirectory(root, runId) {
  check(typeof runId === 'string' && /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,100}$/.test(runId), 'REVIEW_RUN', 'Некорректный run ID.');
  return safePath(root, REVIEW_DIRECTORY + '/' + runId);
}
// Call only while holding Kit's short operation lock. The CLI runner never holds it while waiting.
export function saveReview(root, state) {
  const next = {...state, generation:(state.generation ?? 0)+1};
  atomic(safePath(root, REVIEW_STATE), json(next));
  return next;
}
export function setReviewEnabled(root, enabled) {
  check(typeof enabled === 'boolean', 'REVIEW_POLICY', 'enabled должен быть boolean.');
  return locked(root, () => {
    const s = readReview(root);
    return s.enabled === enabled ? s : saveReview(root, {...s, enabled});
  });
}
export function assertSimpleReview(root) {
  check(!readReview(root).enabled, 'REVIEW_REQUIRED', 'Review включён: подготовьте полную форму scope через review:prepare, затем review:run и review:publish. Конфигурация проверок не изменена.');
}
export function reviewPlanDigest(plan) {
  // Publication appends an approval decision; task statuses/commit records are otherwise identical.
  const {user_decisions, ...content} = plan;
  return hash(json(content));
}
function fingerprint(root, source) {
  return hash(fs.readFileSync(safePath(root,source)));
}
export function checkReviewInputs(root, s, {base = true} = {}) {
  check(s.run_id && Array.isArray(s.documents), 'REVIEW_REQUIRED', 'Нет подготовленной пары документов.');
  if (base) check(head(root) === s.base_head && readPlan(root).plan_revision === s.base_revision,
    'REVIEW_STALE', 'HEAD или revision изменились; подготовьте актуальные входы через review:prepare.');
  const dir = reviewDirectory(root, s.run_id);
  for (const d of s.documents) {
    check(fingerprint(root,d.source) === d.sha256 && hash(fs.readFileSync(safePath(dir,d.snapshot))) === d.sha256,
      'REVIEW_STALE', 'Спецификация изменена после подготовки: ' + d.source);
  }
  for (const [name, expected] of Object.entries(s.input_hashes)) {
    check(hash(fs.readFileSync(safePath(dir,name))) === expected, 'REVIEW_STALE', 'Вход ревью изменён: ' + name);
  }
  return dir;
}
export function prepareReview(root, input) {
  return locked(root, () => {
    check(!journal(root), 'TRANSACTION_PENDING', 'Сначала завершите commit/repair.');
    const old = readReview(root), previous = readPlan(root);
    check(old.enabled, 'REVIEW_DISABLED', 'Review выключен; используйте обычное создание плана.');
    check(previous.execution_scope_status === 'NONE', 'SCOPE_EXISTS', 'Ревью первой версии предназначено только для нового плана из NONE.');
    check(!['RUNNING','PUBLISHING','NEEDS_USER'].includes(old.stage), 'REVIEW_BUSY', 'Сначала завершите запуск или ответьте через review:resolve.');
    const scope = input.scope;
    check(scope?.scope_id && typeof scope.approval_note === 'string' && scope.approval_note.trim().length >= 10,
      'REVIEW_INPUT', 'Нужны scope с явным scope_id и approval_note.');
    check(Array.isArray(input.documents) && input.documents.length > 0, 'REVIEW_INPUT', 'Нужен documents: список рабочих спецификаций docs/planning/*.md.');
    check(new Set(input.documents).size === input.documents.length, 'REVIEW_INPUT', 'Документы повторяются.');
    const candidate = buildScopePlan(root, scope, previous);
    const limit = readConfig(root).budget?.document_bytes ?? 28000;
    const texts = input.documents.map(source => {
      check(/^docs\/planning\/.+\.md$/i.test(source), 'REVIEW_INPUT', 'Спецификация должна находиться в docs/planning.');
      contextPath(root,source);
      check(candidate.approved_scope.documentation_paths.includes(source)
        && candidate.context_pack.documents.some(d => d.path === source && d.required),
      'REVIEW_INPUT', 'Каждая часть спецификации нужна в documentation_paths и required context_pack: ' + source);
      return textFile(root, source, limit);
    });
    const continuing = old.run_id && !['CANCELLED','PUBLISHED','IDLE'].includes(old.stage);
    check(!continuing || old.scope_id === scope.scope_id,'REVIEW_BUSY','Продолжите существующий scope или отмените его через review:cancel.');
    const run_id = continuing ? old.run_id : id();
    const dir = reviewDirectory(root, run_id); fs.mkdirSync(dir, {recursive:true});
    const round = continuing ? old.round ?? 0 : 0;
    const prefix = 'input-' + (round+1) + '-' + id().slice(0,8);
    const scope_file = prefix+'-scope.json', plan_file = prefix+'-plan.json';
    atomic(safePath(dir,scope_file),json(scope)); atomic(safePath(dir,plan_file),json(candidate));
    const documents = input.documents.map((source,i) => {
      const snapshot = prefix+'-spec-'+(i+1)+'.md'; atomic(safePath(dir,snapshot),texts[i]);
      return {source,snapshot,sha256:hash(texts[i])};
    });
    const response_file = typeof input.response === 'string' && input.response.trim() ? prefix+'-author.txt' : null;
    if (continuing && round > 0) check(response_file, 'REVIEW_RESPONSE', 'После ревью укажите response: позицию автора и изменения.');
    if (response_file) atomic(safePath(dir,response_file),input.response);
    const files = [scope_file,plan_file,...(response_file?[response_file]:[])];
    const exhausted=continuing && round>=old.max_rounds;
    const s = saveReview(root, {version:1,enabled:old.enabled,generation:old.generation,stage:exhausted?'NEEDS_USER':'PREPARED',run_id,
      scope_id:scope.scope_id,round,max_rounds:continuing?old.max_rounds:4,claude_session_id:continuing?old.claude_session_id:null,
      base_head:head(root),base_revision:previous.plan_revision,documents,scope_file,plan_file,response_file,
      error:exhausted?{code:'REVIEW_ROUND_LIMIT',message:'Лимит раундов. Спросите пользователя о продолжении.'}:null,
      plan_digest:reviewPlanDigest(candidate),input_hashes:Object.fromEntries(files.map(f=>[f,hash(fs.readFileSync(safePath(dir,f)))]))});
    return {ok:true,...s,run_directory:dir,next_action:exhausted?'Спросить пользователя; review:resolve':'review:run'};
  });
}
export function resolveReview(root, action, note) {
  return locked(root, () => {
    const s = readReview(root);
    check(s.stage === 'NEEDS_USER', 'REVIEW_RESOLUTION', 'Решение ожидается только в NEEDS_USER.');
    check(['retry','publish','cancel'].includes(action) && typeof note === 'string' && note.trim().length >= 3,
      'REVIEW_RESOLUTION', 'Укажите action retry|publish|cancel и note с решением пользователя.');
    if (action !== 'cancel') checkReviewInputs(root,s);
    const stage = action === 'cancel' ? 'CANCELLED' : action === 'publish' ? 'AGREED' : 'PREPARED';
    return {ok:true,...saveReview(root,{...s,stage,user_decision:{action,note},error:null,notification_handled:false,
      max_rounds:action==='retry'?Math.max(s.max_rounds,s.round+1):s.max_rounds})};
  });
}
export function reviewStatus(root) {
  const s=readReview(root);
  if(s.stage!=='RUNNING' || !Number.isSafeInteger(s.runner_pid) || s.runner_pid<=0)return {ok:true,...s};
  try{process.kill(s.runner_pid,0);return {ok:true,...s};}
  catch(e){
    if(e.code!=='ESRCH')return {ok:true,...s};
    return locked(root,()=>{
      const current=readReview(root);
      if(current.stage!=='RUNNING' || current.launch_id!==s.launch_id)return {ok:true,...current};
      return {ok:true,...saveReview(root,{...current,stage:'NEEDS_USER',runner_pid:null,notification_handled:false,
        error:{code:'REVIEW_INTERRUPTED',message:'Процесс ожидания потерян. Проверьте результат раунда и спросите пользователя; автоматический повтор запрещён.'}})};
    });
  }
}
export function cancelReview(root, note) {
  return locked(root,()=>{
    const s=readReview(root);
    check(!['RUNNING','PUBLISHING','PUBLISHED'].includes(s.stage),'REVIEW_BUSY','Сначала установите результат текущего запуска/публикации.');
    check(typeof note==='string' && note.trim().length>=3,'REVIEW_RESOLUTION','Укажите решение пользователя.');
    return {ok:true,...saveReview(root,{...s,stage:'CANCELLED',user_decision:{action:'cancel',note}})};
  });
}
// Called by createScope under its lock, not just by the review CLI facade.
export function assertReviewPublication(root, candidate) {
  const s = readReview(root);
  if (!s.enabled) return null;
  check(s.stage === 'AGREED', 'REVIEW_REQUIRED', 'Нужно согласование последней пары; выполните review:status.');
  checkReviewInputs(root,s);
  check(reviewPlanDigest(candidate) === s.plan_digest, 'REVIEW_STALE', 'Публикуемый план отличается от согласованного.');
  saveReview(root,{...s,stage:'PUBLISHING'});
  return s;
}
export function finishReviewPublication(root, plan, sha) {
  const s = readReview(root);
  if (!s.run_id || s.scope_id !== plan.scope_id) return;
  if (s.enabled) {
    for (const d of s.documents) check(hash(git(root,['show',sha+':'+d.source]).stdout) === d.sha256,
      'REVIEW_PUBLICATION', 'Закоммиченная спецификация отличается от одобренной.');
  }
  saveReview(root,{...s,stage:'PUBLISHED',published_scope:plan.scope_id,published_commit:sha,notification_handled:true});
}
export function publishReview(root) {
  let s = readReview(root);
  if(s.stage==='PUBLISHING' && !journal(root) && readPlan(root).execution_scope_status==='NONE') {
    s=locked(root,()=>{
      const latest=readReview(root);checkReviewInputs(root,latest);
      return saveReview(root,{...latest,stage:'AGREED'});
    });
  }
  if (['PUBLISHING','PUBLISHED'].includes(s.stage)) {
    return locked(root,()=>{
      check(!journal(root),'TRANSACTION_PENDING','Сначала status/repair, затем повтор review:publish.');
      const latest=readReview(root), p=readPlan(root);
      check(p.scope_id===latest.scope_id && p.baseline_commit===latest.base_head,'REVIEW_PUBLICATION','Исход публикации не подтверждён.');
      if(latest.stage==='PUBLISHING') {
        check(reviewPlanDigest(p)===latest.plan_digest,'REVIEW_PUBLICATION','План после прерывания отличается от кандидата.');
        finishReviewPublication(root,p,head(root));
      }
      return {ok:true,already_published:true,...readReview(root)};
    });
  }
  check(s.run_id, 'REVIEW_REQUIRED', 'Нет подготовленного плана.');
  const dir=reviewDirectory(root,s.run_id);
  // createScope repeats every check under the operation lock.
  return createScope(root,readJSON(safePath(dir,s.scope_file)),s.base_revision);
}
export function reviewSummary(root) {
  const s=readReview(root);
  const next = s.stage==='PREPARED'?'review:run':s.stage==='AGREED'?'review:publish':s.stage==='NEEDS_USER'?'Сообщить проблему, спросить пользователя; затем review:resolve':s.stage==='AUTHOR_PENDING'?'Прочитать ревью; review:prepare с исправлениями и response':'review:status';
  return 'Review: '+(s.enabled?'ON (пользователь разрешил рецензента Claude)':'OFF (обычная публикация без согласия Claude)')
    +'; стадия '+s.stage+'; раунд '+(s.round??0)+'. '+(s.enabled?next:'')
    +'\nДля нового плана при ON: review:prepare --help. Не меняйте enabled от имени агента. Память разрешена; свежие решения пользователя имеют приоритет.';
}
