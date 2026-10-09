import test from 'node:test';
import assert from 'node:assert/strict';
import { ParallelExecution } from '../src/parallel-execution.mjs';

function fixture(t) {
  const origin={workspace:'/main',sessionId:'origin',executionSnapshot:{parallel_allowed:true,max_workers:2}};
  const task=id=>({id,title:id,dependencies:[],parallel_safe:true,implementation_status:'TODO',commit_status:'PENDING',functional_paths:[id],documentation_paths:[]});
  const state={head:'main',confirmed:true,mainClean:true,commandActive:false,integration:{status:'IDLE'},assignments:[],
    plan:{scope_id:'scope',execution_scope_status:'ACTIVE',execution_strategy:'parallel',execution_origin_session_id:'origin',parallel_allowed:true,max_workers:2,tasks:[task('A'),task('B')]}};
  const ledger={workspace:'/main',scope:'scope',started:true,assignments:{},corrections:{}};
  const calls={created:0,opened:0,merged:0,continued:0,restored:[]};
  const kit={read:async()=>structuredClone(state),create:async()=>{calls.created++;throw Error('unexpected creation');},
    integrate:async()=>{calls.merged++;throw Error('unexpected merge');},continueIntegration:async()=>{calls.continued++;state.integration={status:'IDLE'};}};
  const runtime=new ParallelExecution({kit,book:{[JSON.stringify(['/main','scope'])]:ledger},origin:()=>origin,
    mainState:()=>({stopped:true}),workerState:()=>({stopped:true}),save:async()=>{},
    openWorker:async()=>{calls.opened++;return {sessionId:'saved-session'};},
    restoreWorker:async a=>{calls.restored.push(a.id);return {sessionId:'saved-session'};}});
  t.after(()=>runtime.dispose());
  const assignment=(id='a',taskId='A',status='READY_FOR_INTEGRATION')=>{
    const a={id,parent_root:'/main',parent_scope_id:'scope',parent_task_id:taskId,worktree:'/trees/'+id,status};
    state.assignments.push(a);ledger.assignments[id]={id,taskId,worktree:a.worktree,phase:'running',sessionId:'saved-session'};return a;
  };
  return {state,ledger,calls,kit,runtime,assignment};
}

test('reserved identities missing in Kit retain capacity and visible uncertainty after restart',async t=>{
  const f=fixture(t);
  f.ledger.assignments.a={id:'a',taskId:'A',phase:'creating'};
  f.ledger.assignments.b={id:'b',taskId:'B',phase:'creating'};
  await f.runtime.launch('/main');await f.runtime.signal('/main');
  assert.equal(f.calls.created,0);assert.equal(f.calls.opened,0);
  assert.equal(f.runtime.view('/main').assignments.length,2);
  assert.equal(f.runtime.view('/main').error.code,'ASSIGNMENT_UNKNOWN');
});

test('verified main commit reconciles an unknown merge without repeating source or merge',async t=>{
  const f=fixture(t);f.assignment('a','A','INTEGRATED');
  f.state.plan.tasks[0].commit_status='DONE';f.ledger.assignments.a.integration='unknown';
  await f.runtime.signal('/main');
  assert.equal(f.ledger.assignments.a.integration,'done');assert.equal(f.calls.merged,0);assert.equal(f.calls.opened,0);
});

test('committed Kit journal is finalized once even with no observable main page',async t=>{
  const f=fixture(t);f.assignment('a','A','INTEGRATED');f.state.plan.tasks[0].commit_status='DONE';
  f.state.integration={status:'CHECKING',operation_id:'integration-a',task_id:'A',committed:true};
  f.runtime.restoreOrigin=async()=>{throw Error('page unavailable');};
  await f.runtime.signal('/main');await f.runtime.signal('/main');
  assert.equal(f.calls.continued,1);assert.equal(f.calls.merged,0);assert.equal(f.calls.opened,0);
});

test('unknown merge or active command never replays integration continuation',async t=>{
  const f=fixture(t);f.assignment();
  for(const [status,committed,commandActive] of [['UNKNOWN',false,false],['CHECKING',true,true]]) {
    f.state.integration={status,committed,operation_id:'integration-a'};f.state.commandActive=commandActive;
    await f.runtime.signal('/main');assert.equal(f.calls.continued,0);assert.equal(f.calls.merged,0);
  }
});

test('missing or mismatched saved chat blocks its source, while an independent source remains available',async t=>{
  const f=fixture(t);f.assignment();f.runtime.restoreWorker=async()=>{throw Object.assign(Error('wrong chat'),{code:'EXECUTOR_SESSION_MISMATCH'});};
  await f.runtime.signal('/main');assert.equal(f.calls.merged,0);
  assert.equal(f.runtime.view('/main').assignments[0].error.code,'EXECUTOR_SESSION_MISMATCH');
  assert.equal(f.runtime.view('/main').error.code,'EXECUTOR_SESSION_MISMATCH');
});

test('known unfinished setup resumes only explicitly or with AutoPlan, retaining assignment identity',async t=>{
  const f=fixture(t);const a=f.assignment('a','A','NEEDS_SETUP');delete f.ledger.assignments.a.sessionId;
  f.ledger.assignments.a.phase='attention';f.runtime.restoreWorker=async()=>null;
  let setups=0;f.kit.setupAssignment=async()=>{setups++;a.status='READY';return a;};
  f.state.plan.tasks[1].commit_status='DONE';
  await f.runtime.signal('/main');assert.equal(setups,0);
  await f.runtime.launch('/main');assert.equal(setups,1);assert.equal(f.calls.opened,1);assert.equal(f.calls.created,0);
});

test('malformed ledger fails closed before any assignment or chat operation',async t=>{
  const f=fixture(t);f.ledger.assignments={a:null};
  await f.runtime.launch('/main');assert.equal(f.runtime.view('/main').error.code,'EXECUTION_LEDGER_INVALID');
  assert.equal(f.calls.created+f.calls.opened+f.calls.merged,0);
});

test('explicit recheck resumes a known Kit journal only when its own source and main have stopped',async t=>{
  const f=fixture(t);f.assignment();f.state.integration={status:'CHECKING',operation_id:'integration-a',assignment_id:'a'};
  await f.runtime.signal('/main');assert.equal(f.calls.continued,0);
  f.runtime.workerState=()=>({stopped:false});await f.runtime.recheck('/main');assert.equal(f.calls.continued,0);
  f.runtime.workerState=()=>({stopped:true});f.kit.continueIntegration=async()=>{f.calls.continued++;f.state.integration={status:'CONFLICT'};};
  await f.runtime.recheck('/main');assert.equal(f.calls.continued,1);assert.equal(f.calls.opened,0);assert.equal(f.calls.created,0);
});
