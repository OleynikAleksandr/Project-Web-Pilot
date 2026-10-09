import { randomUUID } from 'node:crypto';
import { parallelTasksCompatible } from '@webpilot/workflow-kit/lib/plan';
import { validateParallelSettings } from './parallel-settings.mjs';

const fail=(code,message)=>Object.assign(new Error(message),{code});
const issue=e=>({code:e.code??'PARALLEL_FAILED',message:String(e.message??e).slice(0,1000)});
export function executionOrigin(plan,lookup) {
  if(plan.execution_strategy!=='parallel')return null;
  const id=plan.execution_origin_session_id,origin=id&&lookup(id);
  if(!origin?.executionSnapshot||origin.sessionId!==id||origin.assignmentId||origin.archivedAt||origin.sessionArchivedAt)
    throw fail('EXECUTION_ORIGIN_UNKNOWN','Не найден сохранённый снимок основной сессии этого плана.');
  const snapshot=validateParallelSettings(origin.executionSnapshot);
  if(!snapshot.parallel_allowed||snapshot.max_workers<2||plan.parallel_allowed!==snapshot.parallel_allowed||plan.max_workers!==snapshot.max_workers)
    throw fail('EXECUTION_POLICY_MISMATCH','Параметры плана не совпадают с разрешением основной сессии.');
  return origin;
}
export function availableTasks(plan,assignments,workers) {
  const unfinished=assignments.filter(a=>a.status!=='INTEGRATED');
  const occupied=unfinished.filter(a=>a.status!=='READY_FOR_INTEGRATION'||!workers(a).stopped).length;
  let slots=Math.max(0,plan.max_workers-occupied);const chosen=[];
  const activeTasks=unfinished.map(a=>plan.tasks.find(t=>t.id===a.parent_task_id)).filter(Boolean);
  for(const task of plan.tasks) {
    if(task.commit_status==='DONE')continue;
    const assigned=assignments.some(a=>a.parent_task_id===task.id);
    const ready=task.implementation_status==='TODO'&&task.dependencies.every(id=>plan.tasks.find(t=>t.id===id)?.commit_status==='DONE');
    if(!task.parallel_safe) {
      if(!assigned&&ready&&!unfinished.length&&!chosen.length&&slots)chosen.push(task);
      break; // An exclusive task is also a barrier for later tasks.
    }
    if(assigned||!ready||!slots)continue;
    if([...activeTasks,...chosen].every(other=>parallelTasksCompatible(task,other))) {chosen.push(task);slots--;}
  }
  return chosen;
}

// One serialized, event-driven queue per main checkout. The persisted book is a
// delivery ledger, never a replacement for Kit's plan, assignments or Git proofs.
export class ParallelExecution {
  constructor({kit,origin,openWorker,workerState,mainState,save,book={},onChange=()=>{},watch=()=>()=>{},
    sendCorrection,restoreWorker=async()=>null,restoreOrigin=async()=>{},now=Date.now,uuid=randomUUID}) {
    Object.assign(this,{kit,origin,openWorker,workerState,mainState,save,book,onChange,watch,sendCorrection,restoreWorker,restoreOrigin,now,uuid});
    this.queues=new Map();this.states=new Map();this.unwatch=new Map();this.correcting=new Set();this.enabled=false;this.closed=false;
  }
  view(workspace){return this.states.get(workspace)??{phase:'idle',assignments:[],error:null};}
  publish(workspace,patch){this.states.set(workspace,{...this.view(workspace),...patch});this.onChange();}
  ledger(workspace,scope) {
    const key=JSON.stringify([workspace,scope]);
    const ledger=this.book[key]??= {workspace,scope,started:false,assignments:{},corrections:{}};
    if(ledger.workspace!==workspace||ledger.scope!==scope||!ledger.assignments||Array.isArray(ledger.assignments)
      ||!ledger.corrections||Array.isArray(ledger.corrections)||Object.entries(ledger.assignments).some(([id,a])=>!a||a.id!==id||typeof a.taskId!=='string'))
      throw fail('EXECUTION_LEDGER_INVALID','Журнал исполнения повреждён. Проверьте назначения Kit; новые отправки остановлены.');
    return ledger;
  }
  persist(){return this.save(structuredClone(this.book));}
  observe(workspace) {
    if(!this.unwatch.has(workspace))this.unwatch.set(workspace,this.watch(workspace,()=>this.signal(workspace)));
  }
  setEnabled(value) {
    this.enabled=value===true;
    if(this.enabled)for(const workspace of this.unwatch.keys())void this.signal(workspace);
  }
  launch(workspace) {this.observe(workspace);return this.enqueue(workspace,true);}
  signal(workspace) {return this.enqueue(workspace,false);}
  recheck(workspace) {this.observe(workspace);return this.enqueue(workspace,false,true);}
  enqueue(workspace,manual,recovery=false) {
    if(this.closed)return Promise.resolve();
    if(this.correcting.has(workspace))return Promise.resolve(this.view(workspace));
    let queue=this.queues.get(workspace);
    if(queue){queue.again=true;queue.manual||=manual;queue.recovery||=recovery;return queue.promise;}
    queue={again:true,manual,recovery};this.queues.set(workspace,queue);
    queue.promise=Promise.resolve().then(async()=>{
      do {queue.again=false;const requested=queue.manual,recover=queue.recovery;queue.manual=false;queue.recovery=false;
        try {await this.reconcile(workspace,requested,recover);}
        catch(error){this.publish(workspace,{phase:'attention',error:issue(error)});}
      }while(queue.again&&!this.closed);
      return this.view(workspace);
    }).finally(()=>this.queues.delete(workspace));
    return queue.promise;
  }
  async reconcile(workspace,manual,recovery=false) {
    const state=await this.kit.read(workspace),{plan}=state;
    if(plan.execution_strategy!=='parallel') {this.publish(workspace,{phase:'sequential',assignments:[],error:null});return;}
    const origin=executionOrigin(plan,id=>this.origin(workspace,id));
    const ledger=this.ledger(workspace,plan.scope_id);
    const assignments=state.assignments.map(a=>({...a,...(ledger.assignments[a.id]?.readyAt?{readyAt:ledger.assignments[a.id].readyAt}:{})}));
    for(const entry of Object.values(ledger.assignments))if(!assignments.some(a=>a.id===entry.id))
      assignments.push({id:entry.id,parent_task_id:entry.taskId,worktree:entry.worktree,status:'UNKNOWN',
        error:entry.error??issue(fail('ASSIGNMENT_UNKNOWN','Назначение не подтверждено Kit. Повторите сверку; повторного создания нет.'))});
    let recoveryError=null;
    if(ledger.started||manual) {
      try {await this.restoreOrigin(origin);}catch(error){recoveryError=issue(error);}
      for(const a of assignments) {
        if(a.status==='INTEGRATED') {
          const entry=ledger.assignments[a.id];
          if(entry&&entry.integration!=='done'){entry.integration='done';entry.error=null;await this.persist();}
          continue;
        }
        if(a.status==='UNKNOWN'){recoveryError??=a.error;continue;}
        try {
          const restored=await this.restoreWorker(a,origin,ledger.assignments[a.id],recovery);
          if(restored) {
            const entry=ledger.assignments[a.id]??={id:a.id,taskId:a.parent_task_id,worktree:a.worktree};
            if(entry.sessionId!==restored.sessionId){entry.sessionId=restored.sessionId;entry.phase='running';await this.persist();}
          }
        }catch(error){a.error=issue(error);recoveryError??=a.error;}
      }
    }
    this.publish(workspace,{phase:'waiting',scopeId:plan.scope_id,originSessionId:origin.sessionId,
      objective:plan.objective,planView:{state:plan.tasks.every(t=>t.commit_status==='DONE')?'awaiting-acceptance':'working',
        completed:plan.tasks.filter(t=>t.commit_status==='DONE').length,total:plan.tasks.length,
        tasks:plan.tasks.map(t=>({id:t.id,title:t.title,status:t.commit_status==='DONE'?'done':assignments.some(a=>a.parent_task_id===t.id)?'current':'pending'}))},
      assignments,integration:state.integration,correctionStatus:ledger.corrections[state.integration.operation_id]??null,
      canCorrect:!state.commandActive&&this.mainState(origin).stopped&&this.mainState(origin).canSend,
      error:recoveryError,maxWorkers:plan.max_workers});
    // A pending integration owns main. Only its explicit correction action may send to the main agent.
    if(state.integration.status!=='IDLE') {
      const operation=state.integration;
      // Resume only Kit's existing journal, never start another merge after an ambiguous call.
      const signature=JSON.stringify([operation.operation_id,operation.status,state.head]);
      const source=assignments.find(a=>a.id===operation.assignment_id);
      const resumeKnown=recovery&&['PREPARED','MERGING','RESOLVING','CHECKING'].includes(operation.status)
        &&source&&!source.error&&!source.commandActive&&!source.transaction_pending&&!source.dirty
        &&this.workerState(source,ledger.assignments[source.id]).stopped&&this.mainState(origin).stopped;
      if(!state.commandActive&&this.kit.continueIntegration&&(resumeKnown||operation.committed&&ledger.recoveryAttempt!==signature)) {
        ledger.recoveryAttempt=signature;await this.persist();
        await this.kit.continueIntegration(workspace,operation.operation_id);
        this.queues.get(workspace).again=true;return;
      }
      this.publish(workspace,{phase:'integration',error:operation.error?{code:'INTEGRATION_PENDING',message:operation.error}:recoveryError??{
        code:'INTEGRATION_PENDING',message:operation.status==='UNKNOWN'?'Исход слияния неизвестен. Проверьте основной чат и integration:status; повторный merge запрещён.'
          :'Сохранена незавершённая интеграция. Дождитесь остановки чатов и повторите сверку либо откройте основной чат для исправления.'}});return;
    }
    if(!state.confirmed||plan.execution_scope_status!=='ACTIVE'||state.commandActive)
      throw fail('PLAN_NOT_READY','Ждём опубликованный план и завершение текущей команды Kit.');
    if(plan.tasks.length&&plan.tasks.every(t=>t.commit_status==='DONE')) {this.publish(workspace,{phase:'complete'});return;}
    if(manual){ledger.started=true;ledger.manualRequested=true;await this.persist();}
    if(!ledger.started)return;
    const stopped=a=>{const page=this.workerState(a,ledger.assignments[a.id]);return {...page,stopped:page.stopped&&!a.error&&!a.commandActive&&!a.transaction_pending&&!a.dirty};};
    for(const a of assignments) {
      const entry=ledger.assignments[a.id];
      if(entry&&a.status==='READY_FOR_INTEGRATION'&&stopped(a).stopped&&!entry.readyAt) {entry.readyAt=this.now();await this.persist();}
    }
    const ready=assignments.filter(a=>a.status==='READY_FOR_INTEGRATION'&&stopped(a).stopped&&ledger.assignments[a.id]?.readyAt)
      .sort((a,b)=>ledger.assignments[a.id].readyAt-ledger.assignments[b.id].readyAt
        ||plan.tasks.findIndex(t=>t.id===a.parent_task_id)-plan.tasks.findIndex(t=>t.id===b.parent_task_id));
    if(ready.length&&state.mainClean&&this.mainState(origin).stopped) {
      const a=ready[0],entry=ledger.assignments[a.id];
      if(entry.integration==='starting'||entry.integration==='unknown')
        throw fail('INTEGRATION_UNKNOWN','Исход предыдущего запуска слияния требует сверки; автоматического повтора нет.');
      entry.integration='starting';await this.persist();this.publish(workspace,{phase:'merging'});
      try {const result=await this.kit.integrate(workspace,a);entry.integration=result.status==='INTEGRATED'?'done':'pending';await this.persist();}
      catch(error){entry.integration='unknown';await this.persist();throw error;}
      this.queues.get(workspace).again=true;return;
    }
    const requested=manual||ledger.manualRequested===true;
    if(!requested&&!this.enabled)return;
    if(!state.mainClean||!this.mainState(origin).stopped)return;
    if(ledger.manualRequested){ledger.manualRequested=false;await this.persist();}
    // A known, never-opened assignment may finish setup under the same identity.
    for(const a of assignments) {
      const entry=ledger.assignments[a.id];
      if(!entry||entry.sessionId||a.error||!['READY','NEEDS_SETUP'].includes(a.status)||a.commandActive||a.transaction_pending)continue;
      if(entry.phase==='opening')continue; // Crash during session creation is reconciled from the session store above.
      try {
        let prepared=a;
        if(a.status==='NEEDS_SETUP')prepared=await this.kit.setupAssignment(workspace,a.id);
        if(prepared.status!=='READY')continue;
        entry.phase='opening';await this.persist();
        const session=await this.openWorker({...a,...prepared,title:plan.tasks.find(t=>t.id===a.parent_task_id)?.title},origin);
        entry.sessionId=session.sessionId;entry.phase='running';entry.error=null;await this.persist();
      }catch(error){entry.error=issue(error);await this.persist();recoveryError??=entry.error;}
    }
    for(const task of availableTasks(plan,assignments,stopped)) {
      if(this.closed||!requested&&!this.enabled)break;
      // Persist identity before creating a worktree. An ambiguous result never gets a new ID.
      let entry=Object.values(ledger.assignments).find(a=>a.taskId===task.id);
      if(entry)continue;
      const id='wp-'+this.uuid();entry=ledger.assignments[id]={id,taskId:task.id,base:state.head,phase:'creating'};
      await this.persist();this.publish(workspace,{phase:'preparing'});
      try {
        let assignment=await this.kit.create(workspace,plan,task,id,state.head);
        entry.worktree=assignment.worktree;entry.phase=assignment.status;await this.persist();
        if(assignment.status==='NEEDS_SETUP')assignment=await this.kit.setupAssignment(workspace,id);
        entry.phase=assignment.status;await this.persist();
        if(assignment.status!=='READY')throw fail('NEEDS_SETUP','Окружение задания не готово. Повторите подготовку задания.');
        if(this.closed||!requested&&!this.enabled){entry.phase='ready';await this.persist();break;}
        entry.phase='opening';await this.persist();
        const session=await this.openWorker({...assignment,id,parent_root:workspace,parent_scope_id:plan.scope_id,
          parent_task_id:task.id,title:task.title},origin);
        entry.sessionId=session.sessionId;entry.phase='running';await this.persist();
      }catch(error){entry.error=issue(error);entry.phase='attention';await this.persist();throw error;}
    }
    const latest=await this.kit.read(workspace);
    this.publish(workspace,{phase:recoveryError?'attention':'waiting',assignments:latest.assignments.map(a=>({...a,
      ...(assignments.find(b=>b.id===a.id)?.error?{error:assignments.find(b=>b.id===a.id).error}:{})}))
      .concat(assignments.filter(a=>a.status==='UNKNOWN'&&!latest.assignments.some(b=>b.id===a.id))),error:recoveryError});
  }
  async correct(workspace) {
    if(this.correcting.has(workspace))throw fail('PARALLEL_BUSY','Дождитесь текущей операции.');
    this.correcting.add(workspace);
    try {
    await this.queues.get(workspace)?.promise;
    const state=await this.kit.read(workspace),operation=state.integration;
    if(!['CONFLICT','CHECKS_FAILED','RESOLVING'].includes(operation.status))throw fail('INTEGRATION_NOT_CORRECTABLE','Нет интеграции, ожидающей исправления.');
    const origin=executionOrigin(state.plan,id=>this.origin(workspace,id)),ledger=this.ledger(workspace,state.plan.scope_id);
    if(state.commandActive)throw fail('MAIN_NOT_READY','В main ещё выполняется команда или её завершение не подтверждено.');
    if(ledger.corrections[operation.operation_id])return {state:'unknown',reason:'CORRECTION_ALREADY_REQUESTED'};
    const initial=this.mainState(origin);
    if(this.closed||!initial.stopped||!initial.canSend)throw fail('MAIN_NOT_READY','Откройте основной чат и дождитесь готовности без черновика.');
    const ready=()=>{
      const page=this.mainState(origin);
      return !this.closed&&(page.canContinueSend??(page.stopped&&page.canSend));
    };
    ledger.corrections[operation.operation_id]='sending';await this.persist();
    this.publish(workspace,{correctionStatus:'sending'});
    const text=['Исправь незавершённую интеграцию Workflow Kit.',
      'Workspace: '+JSON.stringify(workspace),'Интеграция: '+operation.operation_id,
      'Задача: '+operation.task_id,'Конфликты: '+(operation.conflicts??[]).join(', '),
      'Исправь только область назначенной задачи, сохрани посторонние изменения. Не создавай обычный implementation-коммит.',
      'Проверь integration:status; после исправления выполни integration:continue --id '+operation.operation_id+'.',
      'Не запускай другие записи main; завершение этой интеграции выполняет Kit.'].join('\n');
    try {
      const result=await this.sendCorrection(origin,text,ready,async()=>{
        const latest=await this.kit.read(workspace);return ready()&&!latest.commandActive&&latest.integration.operation_id===operation.operation_id;
      });
      if(result.state==='sent')ledger.corrections[operation.operation_id]='sent';
      else if(result.state==='unknown')ledger.corrections[operation.operation_id]='unknown';
      else if(result.state!=='unknown')delete ledger.corrections[operation.operation_id];
      await this.persist();this.publish(workspace,{correctionStatus:ledger.corrections[operation.operation_id]??null});return result;
    }catch(error){ledger.corrections[operation.operation_id]='unknown';await this.persist();throw error;}
    }finally{this.correcting.delete(workspace);void this.signal(workspace);}
  }
  dispose(){this.closed=true;for(const stop of this.unwatch.values())stop();this.unwatch.clear();}
}
