import test from 'node:test';
import assert from 'node:assert/strict';
import { ParallelExecution,executionOrigin,availableTasks } from '../src/parallel-execution.mjs';
import { startupMessage } from '../src/context-session.mjs';
import { executorPageState } from '../src/executor-session.mjs';

const task=(id,dependencies=[])=>({id,title:id,dependencies,parallel_safe:true,implementation_status:'TODO',commit_status:'PENDING',
  functional_paths:['src/'+id+'.mjs'],documentation_paths:[]});
function fixture(t) {
  const origin={workspace:'/main',sessionId:'author',experience:'work',executionSnapshot:{parallel_allowed:true,max_workers:2}};
  const state={workspace:'/main',head:'base',confirmed:true,mainClean:true,commandActive:false,integration:{status:'IDLE'},assignments:[],
    plan:{scope_id:'scope',execution_scope_status:'ACTIVE',plan_revision:4,parallel_allowed:true,max_workers:2,
      execution_strategy:'parallel',execution_origin_session_id:'author',tasks:[task('A'),task('B'),task('C',['A'])]}};
  const pages=new Map(),calls={created:[],opened:[],merged:[],saved:[],corrections:[]};let sequence=0;
  const kit={read:async()=>structuredClone(state),
    create:async(workspace,plan,task,id,base)=>{
      calls.created.push({workspace,id,task:task.id,base});
      const a={id,worktree:'/trees/'+id,parent_task_id:task.id,parent_scope_id:plan.scope_id,parent_root:workspace,status:'READY'};
      state.assignments.push(a);return a;
    },setupAssignment:async()=>{throw Error('not needed');},
    integrate:async(workspace,a)=>{
      calls.merged.push(a.id);state.assignments.find(x=>x.id===a.id).status='INTEGRATED';
      state.plan.tasks.find(x=>x.id===a.parent_task_id).commit_status='DONE';state.head+='-merge';state.plan.plan_revision++;
      return {status:'INTEGRATED'};
    }};
  const runtime=new ParallelExecution({kit,origin:(_w,id)=>id==='author'?origin:null,
    openWorker:async a=>{calls.opened.push(a);pages.set(a.id,{stopped:false});return {sessionId:'session-'+a.id};},
    workerState:a=>pages.get(a.id)??{stopped:false},mainState:()=>({stopped:true,canSend:true}),
    save:async data=>calls.saved.push(data),uuid:()=>String(++sequence),now:()=>sequence,
    sendCorrection:async(_origin,text,ready,before)=>{assert.ok(ready());assert.ok(await before());calls.corrections.push(text);return {state:'sent'};}});
  t.after(()=>runtime.dispose());
  const finish=id=>{const a=state.assignments.find(x=>x.parent_task_id===id);a.status='READY_FOR_INTEGRATION';a.source_commit='source-'+id;pages.set(a.id,{stopped:true});return a;};
  return {runtime,state,kit,calls,origin,pages,finish};
}

test('origin is exact immutable session metadata; unknown/OFF/mismatched policy fails closed',()=>{
  const plan={execution_strategy:'parallel',execution_origin_session_id:'author',parallel_allowed:true,max_workers:2};
  const origin={sessionId:'author',executionSnapshot:{parallel_allowed:true,max_workers:2}};
  assert.equal(executionOrigin(plan,id=>id==='author'?origin:null),origin);
  for(const saved of [null,{...origin,sessionId:'selected-other'},{...origin,executionSnapshot:undefined},{...origin,assignmentId:'child'}])
    assert.throws(()=>executionOrigin(plan,()=>saved),{code:'EXECUTION_ORIGIN_UNKNOWN'});
  for(const executionSnapshot of [{parallel_allowed:false,max_workers:2},{parallel_allowed:true,max_workers:1},{parallel_allowed:true,max_workers:3}])
    assert.throws(()=>executionOrigin(plan,()=>({...origin,executionSnapshot})),{code:'EXECUTION_POLICY_MISMATCH'});
  assert.equal(executionOrigin({...plan,execution_strategy:'sequential'},()=>null),null);
});

test('manual group is bounded, duplicate events/clicks do not clone worktrees or chats, OFF launches no next group',async t=>{
  const f=fixture(t);
  await Promise.all([f.runtime.launch('/main'),f.runtime.launch('/main'),f.runtime.signal('/main')]);
  assert.deepEqual(f.calls.created.map(x=>x.task),['A','B']);assert.equal(f.calls.opened.length,2);
  assert.equal(new Set(f.calls.created.map(x=>x.id)).size,2);
  const a=f.finish('A');await f.runtime.signal('/main');
  assert.deepEqual(f.calls.merged,[a.id]);assert.equal(f.calls.created.length,2);
  await f.runtime.launch('/main');assert.equal(f.calls.created.at(-1).task,'C');
  assert.equal(f.calls.created.at(-1).base,'base-merge');
});

test('ON starts subsequent ready tasks only from the integrated base; a busy or active-command source never merges',async t=>{
  const f=fixture(t);f.runtime.setEnabled(true);await f.runtime.launch('/main');
  const a=f.finish('A');f.pages.set(a.id,{stopped:false});await f.runtime.signal('/main');assert.equal(f.calls.merged.length,0);
  f.pages.set(a.id,{stopped:true});a.commandActive=true;await f.runtime.signal('/main');assert.equal(f.calls.merged.length,0);
  a.commandActive=false;a.dirty=true;await f.runtime.signal('/main');assert.equal(f.calls.merged.length,0);
  a.dirty=false;await f.runtime.signal('/main');assert.equal(f.calls.merged.length,1);
  assert.deepEqual(f.calls.created.map(x=>[x.task,x.base]),[['A','base'],['B','base'],['C','base-merge']]);
});

test('ready queue does not wait for an earlier unfinished independent task and remains serialized',async t=>{
  const f=fixture(t);await f.runtime.launch('/main');const b=f.finish('B');
  let release;const merge=f.kit.integrate;
  f.kit.integrate=async(...args)=>{await new Promise(resolve=>{release=resolve;});return merge(...args);};
  const pending=f.runtime.signal('/main');await new Promise(resolve=>setImmediate(resolve));
  const repeated=f.runtime.signal('/main');assert.equal(f.calls.merged.length,0);release();await Promise.all([pending,repeated]);
  assert.deepEqual(f.calls.merged,[b.id]);assert.equal(f.state.plan.tasks[0].commit_status,'PENDING');
});

test('exclusive barrier waits for all earlier assignments to integrate; overlap and unknown occupancy block a slot',()=>{
  const a=task('A'),b={...task('B'),parallel_safe:false},c=task('C');
  const plan={max_workers:2,tasks:[a,b,c]};
  assert.deepEqual(availableTasks(plan,[],()=>({stopped:false})).map(t=>t.id),['A']);
  assert.deepEqual(availableTasks(plan,[{parent_task_id:'A',status:'READY_FOR_INTEGRATION'}],()=>({stopped:true})),[]);
  a.commit_status='DONE';assert.deepEqual(availableTasks(plan,[{parent_task_id:'A',status:'INTEGRATED'}],()=>({stopped:true})).map(t=>t.id),['B']);
  const p={max_workers:1,tasks:[task('A'),task('B')]};
  assert.deepEqual(availableTasks(p,[{parent_task_id:'A',status:'UNKNOWN'}],()=>({stopped:false})),[]);
  p.max_workers=2;p.tasks[1].functional_paths=p.tasks[0].functional_paths;
  assert.deepEqual(availableTasks(p,[],()=>({stopped:false})).map(t=>t.id),['A']);
});

test('unpublished or Review-blocked plan, OFF origin and sequential strategy never create an assignment',async t=>{
  const f=fixture(t);f.state.confirmed=false;await f.runtime.launch('/main');
  assert.equal(f.runtime.view('/main').error.code,'PLAN_NOT_READY');assert.equal(f.calls.created.length,0);
  f.state.confirmed=true;f.origin.executionSnapshot.parallel_allowed=false;await f.runtime.launch('/main');
  assert.equal(f.runtime.view('/main').error.code,'EXECUTION_POLICY_MISMATCH');
  f.state.plan.execution_strategy='sequential';await f.runtime.launch('/main');assert.equal(f.calls.created.length,0);
});

test('unknown integration outcome is preserved without repeating merge or launching dependent work',async t=>{
  const f=fixture(t);await f.runtime.launch('/main');f.finish('A');let attempts=0;
  f.kit.integrate=async()=>{attempts++;throw Error('connection ended');};
  await f.runtime.signal('/main');await f.runtime.signal('/main');await f.runtime.launch('/main');
  assert.equal(attempts,1);assert.equal(f.runtime.view('/main').error.code,'INTEGRATION_UNKNOWN');
  assert.equal(f.calls.created.length,2);
});

test('conflict keeps main exclusive and explicit correction is delivered once; UNKNOWN cannot replay',async t=>{
  const f=fixture(t);await f.runtime.launch('/main');
  f.state.integration={status:'CONFLICT',operation_id:'integration-wp-1',task_id:'A',conflicts:['src/A.mjs']};
  await f.runtime.signal('/main');assert.equal(f.runtime.view('/main').phase,'integration');
  await f.runtime.correct('/main');await f.runtime.correct('/main');
  assert.equal(f.calls.corrections.length,1);assert.match(f.calls.corrections[0],/integration:continue --id integration-wp-1/);
  f.state.integration.operation_id='integration-wp-2';f.runtime.sendCorrection=async()=>({state:'unknown'});
  await f.runtime.correct('/main');assert.equal((await f.runtime.correct('/main')).reason,'CORRECTION_ALREADY_REQUESTED');
  assert.equal(f.calls.created.length,2);
});

test('assigned startup starts exactly its task, names worktree/main and does not ask for a second user instruction',()=>{
  const text=startupMessage({name:'Project',workspace:'/trees/a',sessionId:'worker',assignmentId:'a',taskId:'T002',
    parentWorkspace:'/main',executionSnapshot:{parallel_allowed:true,max_workers:2}},'request',{parts:[{}]});
  assert.match(text,/task:start T002/);assert.match(text,/commit --task T002/);assert.match(text,/"\/trees\/a"/);
  assert.match(text,/Основной checkout: "\/main"/);assert.match(text,/После коммита не бери следующую задачу/);
  assert.doesNotMatch(text,/Файлы проекта не меняй|Дальнейшую работу начнём/);
});

test('source needs an observed final assistant pause in the exact chat, with no outstanding delivery',()=>{
  const record={project:()=>({chatUrl:'https://chatgpt.com/c/abcdefgh'}),ready:true,controller:{pending:false},composer:{inFlight:false},
    pageState:{current:{state:{url:'https://chatgpt.com/c/abcdefgh',busy:false,lastMessageRole:'assistant',editorAvailable:true,writable:true}}}};
  assert.equal(executorPageState(record).stopped,true);
  for(const patch of [{busy:true},{lastMessageRole:'user'},{url:'https://chatgpt.com/c/other-chat'},{connectionError:'stream-interrupted'}]) {
    const state=record.pageState.current.state;record.pageState.current.state={...state,...patch};
    assert.equal(executorPageState(record).stopped,false);record.pageState.current.state=state;
  }
  record.controller.pending=true;assert.equal(executorPageState(record).stopped,false);
  assert.equal(executorPageState(null).stopped,false);
});
