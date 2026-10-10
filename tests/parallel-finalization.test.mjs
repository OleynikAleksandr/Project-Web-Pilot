import test from 'node:test';
import assert from 'node:assert/strict';
import {ParallelExecution} from '../src/parallel-execution.mjs';
import {ProjectAutoPlan} from '../src/project-auto-plan.mjs';
import {AutomationSendState} from '../src/automation-send-state.mjs';

function fixture(t) {
 const origin={workspace:'/main',sessionId:'origin',projectId:'project',chatUrl:'https://chatgpt.com/c/main',executionSnapshot:{parallel_allowed:true,max_workers:2}};
 const state={head:'head',confirmed:true,mainClean:true,commandActive:false,integration:{status:'IDLE'},
  plan:{project_id:'project',scope_id:'scope',execution_scope_status:'ACTIVE',execution_strategy:'parallel',
   execution_origin_session_id:'origin',parallel_allowed:true,max_workers:2,tasks:[{id:'T001',commit_status:'PENDING',dependencies:[],parallel_safe:false}]},
  assignments:[{id:'a',parent_task_id:'T001',status:'READY_FOR_INTEGRATION',source_commit:'source',worktree:'/worker'}]};
 const ledger={workspace:'/main',scope:'scope',projectId:'project',originSessionId:'origin',started:true,assignments:{a:{id:'a',taskId:'T001',sessionId:'worker'}},corrections:{}};
 const page={stopped:true,canSend:true,canContinueSend:true,pauseKey:'before',manualSendRevision:0};
 const auth=new ProjectAutoPlan();auth.set('/main','scope',true,'origin');
 const calls={sent:0,merged:0,saved:[]};
 const kit={read:async()=>structuredClone(state),integrate:async()=>{
  calls.merged++;state.plan.tasks[0].commit_status='DONE';state.assignments[0].status='INTEGRATED';return {status:'INTEGRATED'};
 }};
 const runtime=new ParallelExecution({kit,origin:()=>origin,book:{[JSON.stringify(['/main','scope'])]:ledger},
  workerState:()=>({stopped:true}),mainState:()=>page,save:async book=>calls.saved.push(structuredClone(book)),
  isEnabled:(w,s)=>auth.enabled(w,s),canFinalize:(w,s)=>auth.finalizationAllowed(w,s),
  onComplete:(w,s)=>auth.sync(w,s,{complete:true,confirmed:true}),restoreWorker:async()=>({sessionId:'worker'}),
  sendFinalization:async(o,text,ready,before)=>{
   assert.equal(o.sessionId,'origin');assert.match(text,/source/);assert.match(text,/провер/i);
   assert.ok(ready());assert.ok(await before());calls.sent++;return {state:'sent'};
  }});
 t.after(()=>runtime.dispose());return {origin,state,ledger,page,auth,calls,kit,runtime};
}
test('final READY returns control before DONE, then observes a distinct main reply without replay',async t=>{
 const f=fixture(t);await f.runtime.signal('/main');
 assert.equal(f.calls.sent,1);assert.equal(f.calls.merged,0);assert.equal(f.ledger.finalization.status,'sent');
 f.page.busy=true;f.page.stopped=false;await f.runtime.signal('/main');
 f.state.plan.tasks[0].commit_status='DONE';f.state.assignments[0].status='INTEGRATED';
 f.page.busy=false;f.page.stopped=true;f.page.pauseKey='after';
 await f.runtime.signal('/main');await f.runtime.signal('/main');
 assert.equal(f.auth.enabled('/main','scope'),false);assert.equal(f.ledger.finalization.status,'reply-observed');assert.equal(f.calls.sent,1);
});
test('pending draft permits verified integration, persists through completion OFF, and later sends once',async t=>{
 const f=fixture(t);f.page.canSend=false;await f.runtime.signal('/main');
 assert.equal(f.calls.merged,1);assert.equal(f.calls.sent,0);assert.equal(f.auth.enabled('/main','scope'),false);
 assert.equal(f.ledger.finalization.status,'pending');
 f.page.canSend=true;await f.runtime.signal('/main');assert.equal(f.calls.sent,1);
});
test('manual OFF revokes pending finalization despite already-completed main',async t=>{
 const f=fixture(t);f.page.canSend=false;await f.runtime.signal('/main');f.auth.set('/main','scope',false);
 f.page.canSend=true;await f.runtime.signal('/main');assert.equal(f.calls.sent,0);
});
test('restart sending/unknown states never repeat and cannot be mistaken for a main reply',async t=>{
 for(const status of ['sending','unknown']){
  const f=fixture(t);f.ledger.finalization={status,projectId:'project',scope:'scope',sessionId:'origin'};
  await f.runtime.signal('/main');assert.equal(f.calls.sent+f.calls.merged,0);assert.equal(f.ledger.finalization.status,status);
 }
});
test('last boundary rejects a changed scope or command and an unused cancelled attempt stays pending',async t=>{
 const f=fixture(t);f.runtime.sendFinalization=async(_o,_text,_ready,before)=>{
  f.state.commandActive=true;assert.equal(await before(),false);return {state:'cancelled'};
 };
 await f.runtime.signal('/main');assert.equal(f.calls.sent,0);assert.equal(f.ledger.finalization.status,'pending');
});
test('consumed automation pause does not become UNKNOWN Send',async t=>{
 const f=fixture(t);f.runtime.sendFinalization=async()=>({state:'unknown',reason:'PAUSE_CONSUMED'});
 await f.runtime.signal('/main');assert.equal(f.ledger.finalization.status,'pending');
});
test('a user Stop is persisted across restore, then cleared only by a new user message',async()=>{
 const selected={workspace:'/main',sessionId:'s',chatUrl:'https://chatgpt.com/c/s',scopeId:'scope'};
 let checkpoint;const automation=new AutomationSendState({save:async x=>{checkpoint=x;}});
 automation.observe(selected,{documentId:'doc',state:{url:selected.chatUrl,userTurnId:'u1',manualStopRevision:1}});
 await automation.stopSave;assert.equal(automation.blocked(selected),true);
 const restored=new AutomationSendState();restored.restore(checkpoint);assert.equal(restored.blocked(selected),true);
 let sent=0;const attempt=()=>restored.send({selected,page:{turnId:'t'},ready:()=>true,perform:async()=>{sent++;return {state:'sent'};}});
 assert.equal((await attempt()).reason,'MANUAL_STOP');assert.equal(sent,0);
 restored.observe(selected,{documentId:'newdoc',state:{url:selected.chatUrl,userTurnId:'u2',manualStopRevision:0}});
 await attempt();assert.equal(sent,1);
});
test('authorization keeps completion OFF distinct from manual OFF after restart and between projects',()=>{
 const auth=new ProjectAutoPlan();auth.set('/a','one',true);auth.set('/b','two',true);
 auth.sync('/a','one',{complete:true,confirmed:true});
 const restored=new ProjectAutoPlan({saved:auth.snapshot()});
 assert.equal(restored.finalizationAllowed('/a','one'),true);assert.equal(restored.enabled('/b','two'),true);
 restored.set('/a','one',false);assert.equal(restored.finalizationAllowed('/a','one'),false);
 restored.sync('/a','new');assert.equal(restored.finalizationAllowed('/a','new'),false);
});
