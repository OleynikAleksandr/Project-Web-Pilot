import test from 'node:test';
import assert from 'node:assert/strict';
import {ParallelExecution} from '../src/parallel-execution.mjs';
import {ProjectAutoPlan} from '../src/project-auto-plan.mjs';
import {AutomationSendState} from '../src/automation-send-state.mjs';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {createFixture,planFixture,completeFixture} from '../packages/workflow-kit/scripts/check-parallel-execution-fixture.mjs';
import {createAssignment,setupAssignment,assignmentStatus} from '../packages/workflow-kit/src/lib/task-assignment.mjs';
import {readPlan} from '../packages/workflow-kit/src/lib/plan.mjs';
import {integrationStatus,startIntegration} from '../packages/workflow-kit/src/lib/task-integration.mjs';
import {validate} from '../packages/workflow-kit/src/lib/validate.mjs';
import {ParallelKit} from '../src/parallel-kit.mjs';
import {readCommandActivity} from '../src/command-activity.mjs';

const {startFixtureWriter}=createRequire(import.meta.url)('./parallel-execution-smoke-fixture.cjs');

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

test('F03 characterization: real last Git/Kit source followed by a live writable server blocks merge and final Send',async t=>{
 const directory=await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(),'web-pilot-last-writer-')));
 t.after(()=>fs.rm(directory,{recursive:true,force:true}));
 const root=createFixture(directory);
 planFixture(root,'origin');
 const git=(...args)=>execFileSync('git',args,{cwd:root,encoding:'utf8'}).trim();
 const assign=(id,task)=>{
  const created=createAssignment(root,{id,task_id:task,base_commit:git('rev-parse','HEAD'),
   worktree:path.join(directory,id)},readPlan(root).plan_revision);
  assert.equal(setupAssignment(root,id,{npmCi:true}).status,'READY');
  return created;
 };
 // These DONE records come from real Kit integrations, not overwritten flags.
 for(const [id,task] of [['first','T001'],['second','T002']]){
  const item=assign(id,task);completeFixture(item.worktree);
  const proof=assignmentStatus(root,id);assert.equal(proof.status,'READY_FOR_INTEGRATION');
  assert.equal(startIntegration(root,{id,source_commit:proof.source_commit}).status,'INTEGRATED');
 }
 assert.deepEqual(Object.keys(validate(root).resolved).sort(),['T001','T002']);
 const last=assign('last','T003');
 assert.equal(assignmentStatus(root,last.id).status,'READY','last source not yet committed');
 const lastMainHead=git('rev-parse','HEAD');
 completeFixture(last.worktree);
 const lastProof=assignmentStatus(root,last.id);
 assert.equal(lastProof.status,'READY_FOR_INTEGRATION');
 assert.equal(git('rev-parse','HEAD'),lastMainHead,'source commit does not change main');
 const source=lastProof.source_commit;
 const setup={node:async()=>process.execPath,environment:process.env};
 const plans={call:async(_workspace,command,args=[])=>{
  if(command==='integration:status')return integrationStatus(root);
  if(command==='validate')return validate(root);
  if(command==='assignment:status')return assignmentStatus(root,args[1]);
  throw Error('unexpected fixture Kit operation: '+command);
 }};
 const kit=new ParallelKit({setup,plans});
 let writer;
 try {
  // Writer starts AFTER source, and really can write in its temporary checkout.
  writer=await startFixtureWriter(last.worktree);
  assert.equal((await fetch(writer.url+'/write',{method:'POST'})).status,200);
  assert.match(await fs.readFile(path.join(last.worktree,'.harness/runtime/writer-proof.txt'),'utf8'),/fixture write/);
  const activity=await readCommandActivity(last.worktree);
  assert.equal(activity.commandActive,true);
  assert.equal(activity.commands.find(c=>c.id===writer.id)?.readOnly,false);
  const initial=await kit.read(root);
  assert.equal(initial.confirmed,true);
  assert.equal(initial.mainClean,true);
  const actual=initial.assignments.find(a=>a.id===last.id);
  assert.equal(actual.status,'READY_FOR_INTEGRATION');
  assert.equal(actual.source_commit,source);
  assert.equal(actual.commandActive,true);
  assert.equal(actual.dirty,false,'only ignored fixture-runtime files written');
  const auth=new ProjectAutoPlan();
  auth.set(root,'parallel-fixture',true,'origin');
  const origin={workspace:root,sessionId:'origin',projectId:initial.plan.project_id,
   chatUrl:'https://chatgpt.com/c/fixture',executionSnapshot:{parallel_allowed:true,max_workers:2}};
  const page={stopped:true,canSend:true,canContinueSend:true,pauseKey:'before',manualSendRevision:0};
  let sends=0,merges=0;
  const book={[JSON.stringify([root,'parallel-fixture'])]:{
   workspace:root,scope:'parallel-fixture',started:true,assignments:{},corrections:{}}};
  const runtime=new ParallelExecution({kit:{...kit,
    read:()=>kit.read(root),integrate:async(_workspace,a)=>{
     merges++;return startIntegration(root,{id:a.id,source_commit:a.source_commit});
    }},book,origin:()=>origin,mainState:()=>page,workerState:()=>({stopped:true}),
   restoreWorker:async()=>({sessionId:'fixture-worker'}),save:async()=>{},
   isEnabled:(workspace,scope)=>auth.enabled(workspace,scope),
   canFinalize:(workspace,scope)=>auth.finalizationAllowed(workspace,scope),
   onComplete:(workspace,scope)=>auth.sync(workspace,scope,{complete:true,confirmed:true}),
   sendFinalization:async()=>{sends++;return {state:'sent'};}});
  t.after(()=>runtime.dispose());
  // Green characterization of the old BUG: even with last source and a
  // finished worker reply, the writer produces NO diagnostic/Send/merge.
  await runtime.signal(root);await runtime.signal(root);
  assert.equal(sends,0,'F03 is red against the desired diagnostic handoff');
  assert.equal(merges,0,'writer correctly forbids unsafe integration');
  assert.equal(book[JSON.stringify([root,'parallel-fixture'])].finalization,undefined);
  assert.equal(runtime.view(root).assignments.find(a=>a.id===last.id)?.commandActive,true);
  assert.equal(git('rev-parse','HEAD'),lastMainHead);
  assert.deepEqual(Object.keys(validate(root).resolved).sort(),['T001','T002']);
  // A fixture-owned terminal event clears the marker; explicit reconciliation
  // tests the OLD happy path. Child-event wakeup itself belongs to T002.
  await writer.stop();writer=null;
  assert.equal((await readCommandActivity(last.worktree)).commandActive,false);
  await runtime.signal(root);
  assert.equal(sends,1);assert.equal(merges,0);
  assert.equal(book[JSON.stringify([root,'parallel-fixture'])].finalization.status,'sent');
  assert.equal(startIntegration(root,{id:last.id,source_commit:source}).status,'INTEGRATED');
  assert.deepEqual(Object.keys(validate(root).resolved).sort(),['T001','T002','T003']);
  page.busy=true;page.stopped=false;await runtime.signal(root);
  page.busy=false;page.stopped=true;page.pauseKey='after';await runtime.signal(root);
  assert.equal(book[JSON.stringify([root,'parallel-fixture'])].finalization.status,'reply-observed');
  assert.equal(auth.enabled(root,'parallel-fixture'),false);
  assert.equal(sends,1,'no duplicate final message');
 }finally{if(writer)await writer.stop();}
});
