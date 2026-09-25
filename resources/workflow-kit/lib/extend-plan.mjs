import fs from 'node:fs';
import path from 'node:path';
import {check,contextPath} from './common.mjs';
import {readPlan} from './plan.mjs';
import {readConfig,taskChecks} from './validate.mjs';
import {applyPlan} from './actions.mjs';

// Only new domain tasks enter here. applyPlan owns locking, revision and history.
export function extendPlan(root,input,expectedRevision) {
  check(input && typeof input==='object' && !Array.isArray(input),'PLAN_SCHEMA','Ожидается объект с tasks.');
  check(Object.keys(input).every(k=>['spec','tasks'].includes(k)),'PLAN_SCHEMA','plan:extend принимает только spec и tasks; прежний план копировать не нужно.');
  const plan=readPlan(root),config=readConfig(root);
  check(expectedRevision!==undefined,'EXPECTED_REVISION_REQUIRED','Укажите --expected-revision из status.');
  check(Number(expectedRevision)===plan.plan_revision,'REVISION_CONFLICT','План изменился. Прочитайте status и проверьте, не добавлены ли уже ваши задачи.',{expected:expectedRevision,actual:plan.plan_revision});
  check(plan.execution_scope_status==='ACTIVE','SCOPE_LIFECYCLE','Для plan:extend нужен активный сохранённый план. При NONE используйте plan:create.');
  check(Array.isArray(input.tasks)&&input.tasks.length>0,'PLAN_SCHEMA','tasks должен содержать новые задачи.');
  if(input.spec!==undefined){check(typeof input.spec==='string','SPEC_REQUIRED','spec должен быть путём к документу.');contextPath(root,input.spec);check(/^docs\/(planning|modules)\/.+\.md$/i.test(input.spec)&&fs.existsSync(path.join(root,input.spec)),'SPEC_REQUIRED','Укажите существующий документ docs/planning/ или docs/modules/.');}
  const used=new Set(plan.tasks.map(t=>t.id));
  for(const t of input.tasks)if(t?.id){check(t.id!=='DOCS'&&!used.has(t.id),'TASK_ID_CONFLICT','ID уже занят или зарезервирован: '+t.id,{task_id:t.id});used.add(t.id);}
  let next=1;
  const tasks=input.tasks.map((t,i)=>{
    const field='tasks['+i+']';
    check(t && typeof t==='object'&&!Array.isArray(t),'PLAN_SCHEMA',field+': ожидается объект.');
    check(Object.keys(t).every(k=>['id','title','why','files','checks','dependencies','acceptance','commit','verification_kind'].includes(k)),'PLAN_SCHEMA',field+': передавайте только id, title, why, files, checks, dependencies, acceptance, commit, verification_kind.');
    check(typeof t.title==='string'&&t.title.trim(),'PLAN_SCHEMA',field+'.title: нужен заголовок.');
    let id=t.id;
    if(!id){while(used.has('T'+String(next).padStart(3,'0')))next++;id='T'+String(next++).padStart(3,'0');used.add(id);}
    check(Array.isArray(t.files)&&t.files.length>0,'PLAN_SCHEMA',field+'.files: перечислите файлы новой задачи.');
    t.files.forEach(f=>contextPath(root,f));
    const task={id,title:t.title,why:t.why??t.title,dependencies:t.dependencies??[],functional_paths:t.files.filter(f=>!f.endsWith('.md')),documentation_paths:[...new Set([...(input.spec?[input.spec]:[]),...t.files.filter(f=>f.endsWith('.md'))])],verification_ids:t.checks??[],verification_kind:t.verification_kind??'code',acceptance_criteria:t.acceptance??[t.title],expected_commit_message:t.commit??'feat: '+t.title,implementation_status:'TODO',commit_status:'PENDING',commit_ref:{scope_id:plan.scope_id,task_id:id,role:'implementation'}};
    check(Array.isArray(task.verification_ids),'PLAN_SCHEMA',field+'.checks: нужен массив ID проверок.');
    try{taskChecks(task,config);}catch(error){error.message=field+'.checks ('+id+'): '+error.message;error.details={...error.details,task_id:id,field:field+'.checks',available_checks:config.checks.map(c=>c.id)};throw error;}
    return task;
  });
  const changes={tasks:[...plan.tasks.filter(t=>t.id!=='DOCS'),...tasks,...plan.tasks.filter(t=>t.id==='DOCS')],approved_scope:{...plan.approved_scope,functional_paths:[...new Set([...plan.approved_scope.functional_paths,...tasks.flatMap(t=>t.functional_paths)])],documentation_paths:[...new Set([...plan.approved_scope.documentation_paths,...tasks.flatMap(t=>t.documentation_paths)])]}};
  if(input.spec)changes.context_pack={...plan.context_pack,documents:[...plan.context_pack.documents.filter(d=>d.path!==input.spec),{path:input.spec,required:true}]};
  // The captured revision prevents a concurrent writer from being overwritten.
  return applyPlan(root,changes,expectedRevision);
}
