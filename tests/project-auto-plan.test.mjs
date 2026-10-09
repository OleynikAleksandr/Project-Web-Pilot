import test from 'node:test';
import assert from 'node:assert/strict';
import { ProjectAutoPlan } from '../src/project-auto-plan.mjs';

test('project permission is OFF by default and never migrates legacy global ON',()=>{
 const a=new ProjectAutoPlan({saved:{autoPlanEnabled:true,autoPlanCheckpoint:{}}});
 assert.deepEqual(a.checkpoint('/unknown',undefined,'chat'),{});a.saveCheckpoint('/unknown',undefined,'chat',{});
 assert.equal(a.enabled('/a','one'),false);a.set('/a','one',true,'chat-a');
 assert.equal(a.enabled('/a','one'),true);assert.equal(a.enabled('/b','one'),false);
 a.set('/b','two',true,'chat-b');a.set('/a','one',false);
 assert.equal(a.enabled('/b','two'),true);
});
test('only confirmed completion disables that project; next scope and unknown plan are OFF',()=>{
 const a=new ProjectAutoPlan();a.set('/a','one',true,'chat');a.set('/b','two',true,'other');
 a.sync('/a','one',{complete:true,confirmed:false});assert.equal(a.enabled('/a','one'),true);
 a.sync('/a','one',{complete:true,confirmed:true});assert.equal(a.enabled('/a','one'),false);assert.equal(a.enabled('/b','two'),true);
 a.set('/a','one',true,'chat');a.sync('/a','next');assert.equal(a.enabled('/a','next'),false);
 a.set('/a','next',true,'chat');a.sync('/a',null);assert.equal(a.enabled('/a','next'),false);
});
test('restart preserves only the same unfinished scope and independent per-chat ledgers',()=>{
 const a=new ProjectAutoPlan();a.set('/a','one',true,'chat');
 a.saveCheckpoint('/a','one','chat',{autoPlanCheckpoint:{status:'sending'}});
 a.saveCheckpoint('/a','one','other',{autoPlanCheckpoint:{status:'sent'}});
 const b=new ProjectAutoPlan({saved:JSON.parse(JSON.stringify(a.snapshot()))});
 assert.equal(b.enabled('/a','one'),true);assert.equal(b.state('/a').sessionId,'chat');
 assert.equal(b.checkpoint('/a','one','chat').autoPlanCheckpoint.status,'sending');
 assert.equal(b.checkpoint('/a','one','other').autoPlanCheckpoint.status,'sent');
 assert.deepEqual(b.checkpoint('/b','one','chat'),{});
 b.sync('/a','next');b.saveCheckpoint('/a','one','chat',{autoPlanCheckpoint:{status:'stale'}});
 assert.deepEqual(b.checkpoint('/a','next','chat'),{});
});

test('two main chats continue independently while hidden; completion and OFF affect only their project',async t=>{
 const {configureProjectAutoPlan}=await import('../src/project-session-auto-plan.mjs');
 const fs=await import('node:fs/promises'),os=await import('node:os'),path=await import('node:path');
 const root=await fs.mkdtemp(path.join(os.tmpdir(),'project-auto-flows-'));t.after(()=>fs.rm(root,{recursive:true,force:true}));
 const auth=new ProjectAutoPlan(),projects=new Map(),plans=new Map(),records=[],sends=[];
 const settle=()=>new Promise(resolve=>setTimeout(resolve,30));
 for(const name of ['a','b']) {
  const workspace=path.join(root,name);await fs.mkdir(workspace);
  const project={workspace,projectId:name,sessionId:name,chatUrl:'https://chatgpt.com/c/'+name,scopeId:'scope-'+name};
  projects.set(workspace,project);plans.set(workspace,{...project,inspectedSessionId:name,scopeStatus:'ACTIVE',confirmed:true,planRevision:1,
    planView:{tasks:[{id:'T001',status:'pending'}]}});
  const record={identity:{workspace,sessionId:name},project:()=>project,ready:true,loading:false,cleanups:[],
    controller:{pending:false,state:{phase:'delivered'},projectChanged:()=>{}},composer:{inFlight:false,sendUserMessage:async({canContinue,onBeforeSend})=>{
      if(!canContinue()||!await onBeforeSend())return {state:'cancelled'};sends.push(name);return {state:'sent'};}}};
  auth.set(workspace,project.scopeId,true,name);
  configureProjectAutoPlan(record,{store:{inspect:async w=>structuredClone(plans.get(w))},authorization:auth,
    inspectPlan:async p=>structuredClone(plans.get(p.workspace)),onChange:()=>{}});records.push(record);
  t.after(()=>record.cleanups.forEach(fn=>fn()));
 }
 await settle();
 for(const record of records)record.primaryAutomation.observe({documentId:'doc',state:{url:record.project().chatUrl,busy:false,
   editorAvailable:true,writable:true,lastMessageRole:'assistant',turnId:'first',userTurnId:'user',draftPresent:false}});
 await settle();await Promise.all(records.map(r=>r.primaryAutomation.flow.reconcile()));
 assert.deepEqual(sends.sort(),['a','b']);
 const first=records[0],second=records[1];plans.get(first.project().workspace).planView.tasks[0].status='done';
 first.primaryAutomation.changed();await settle();
 assert.equal(auth.enabled(first.project().workspace,first.project().scopeId),false);
 assert.equal(auth.enabled(second.project().workspace,second.project().scopeId),true);
 auth.set(second.project().workspace,second.project().scopeId,false);second.primaryAutomation.update();
 second.primaryAutomation.observe({documentId:'doc',state:{url:second.project().chatUrl,busy:false,editorAvailable:true,writable:true,lastMessageRole:'assistant',turnId:'next'}});
 await settle();assert.equal(sends.length,2);
});
