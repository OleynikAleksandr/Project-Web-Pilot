import test from 'node:test';
import assert from 'node:assert/strict';
import { PlanReviewClient } from '../src/plan-review.mjs';
import { AutomationSendState } from '../src/automation-send-state.mjs';
import { ReviewContinuation } from '../src/review-continuation.mjs';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn, execFileSync } from 'node:child_process';
import { once } from 'node:events';

test('Review indicator distinguishes active work, waiting, success and attention; watchdog is bounded',()=>{
  let state={enabled:true,stage:'RUNNING',runner_pid:process.pid,started_at:new Date(0).toISOString()},now=0,readCount=0;
  const timers=new Map();let seq=0;
  const client=new PlanReviewClient({selected:()=>({workspace:'/fixture'}),supports:()=>true,
    read:()=>{readCount++;return state;},now:()=>now,
    schedule:(fn,ms)=>{const id=++seq;timers.set(id,{fn,ms});return id;},cancel:id=>timers.delete(id)});
  client.observeSelection();assert.equal(client.view().indicator,'working');assert.equal(timers.size,1);
  assert.equal([...timers.values()][0].ms,15000);
  now=905000;[...timers.values()][0].fn();timers.delete(seq);
  assert.equal(client.view().indicator,'attention');assert.equal(client.timer,null);
  for(const [stage,indicator] of [['PREPARED','waiting'],['AUTHOR_PENDING','waiting'],['AGREED','success'],
    ['PUBLISHED','success'],['NEEDS_USER','attention'],['STALE','attention'],['IDLE','none'],['CANCELLED','none'],['PUBLISHING','working']]){
    state={enabled:true,stage};client.refresh();
    assert.equal(client.view().indicator,indicator,stage);assert.equal(client.timer,null,stage);
  }
  state={enabled:true,stage:'RUNNING'};client.refresh();assert.equal(client.view().indicator,'attention','no PID is not verified work');
  state={enabled:false,stage:'RUNNING',runner_pid:process.pid,started_at:new Date(now).toISOString()};
  client.refresh();assert.equal(client.view().indicator,'none');assert.equal(client.timer,null);
  state={enabled:true,stage:'RUNNING',runner_pid:process.pid,started_at:new Date(now).toISOString()};client.refresh();
  assert.notEqual(client.timer,null);client.dispose();assert.equal(client.timer,null);
  const before=readCount;client.refresh();assert.equal(readCount,before,'disposed client never restarts watchdog');
});

test('Review refresh/watchdog detects a terminated real runner and restart keeps static attention',async t=>{
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'review-runner-ui-'));
  const child=spawn(process.execPath,['-e','setTimeout(()=>{},60000)'],{stdio:'ignore'});
  const exited=once(child,'exit');
  let client;
  t.after(()=>{client?.dispose();child.kill();fs.rmSync(root,{recursive:true,force:true});});
  await once(child,'spawn');
  execFileSync('git',['init','--quiet',root]);
  const dir=path.join(root,'.harness/runtime/plan-review');fs.mkdirSync(dir,{recursive:true});
  const file=path.join(dir,'state.json');
  fs.writeFileSync(file,JSON.stringify({version:1,enabled:true,stage:'RUNNING',generation:1,run_id:'fixture',
    launch_id:'launch',round:1,runner_pid:child.pid,started_at:new Date().toISOString()}));
  let watchdog;
  const options={selected:()=>({workspace:root}),supports:()=>true,schedule:fn=>{watchdog=fn;return 1;},cancel:()=>{}};
  client=new PlanReviewClient(options);client.observeSelection();assert.equal(client.view().indicator,'working');
  child.kill();await exited;watchdog();
  assert.equal(client.view().stage,'NEEDS_USER');assert.equal(client.view().indicator,'attention');assert.equal(client.timer,null);
  assert.equal(JSON.parse(fs.readFileSync(file)).error.code,'REVIEW_INTERRUPTED');
  client.dispose();client=new PlanReviewClient(options);client.observeSelection();
  assert.equal(client.view().enabled,true);assert.equal(client.view().indicator,'attention');assert.equal(client.timer,null);
});

test('Review policy belongs to checkout, survives selection changes and rejects a stale IPC target',()=>{
  const states=new Map();let selected={workspace:'/project-a'},changed=0;
  const client=new PlanReviewClient({selected:()=>selected,onChange:()=>changed++,supports:()=>true,
    read:r=>states.get(r)??{enabled:false,stage:'IDLE'},write:(r,enabled)=>states.set(r,{...states.get(r),enabled,stage:'IDLE'})});
  client.observeSelection();assert.equal(client.view().enabled,false);
  client.setEnabled({workspace:'/project-a',enabled:true});assert.equal(client.view().enabled,true);
  selected={workspace:'/project-b'};client.observeSelection();assert.equal(client.view().enabled,false);
  assert.throws(()=>client.setEnabled({workspace:'/project-a',enabled:false}),{code:'REVIEW_SELECTION_CHANGED'});
  selected={workspace:'/project-a'};client.observeSelection();assert.equal(client.view().enabled,true);
  const before=changed;client.refresh();assert.equal(changed,before,'same state must not loop publish');
  const restored=new PlanReviewClient({selected:()=>selected,supports:()=>true,read:r=>states.get(r)});
  restored.observeSelection();assert.equal(restored.view().enabled,true);
  states.set('/project-a',{enabled:true,stage:'NEEDS_USER',round:4,max_rounds:4,error:{message:'Остался спор'}});
  client.refresh();assert.match(client.view().message,/Раунд 4 из 4/);assert.match(client.view().message,/Остался спор/);
  client.setEnabled({workspace:'/project-a',enabled:false});assert.equal(client.view().message,'');
});

test('old Kit and unreadable state are visible errors, not silently disabled review',()=>{
  const selected=()=>({workspace:'/fixture'});
  const old=new PlanReviewClient({selected,supports:()=>false});old.observeSelection();
  assert.match(old.view().error,/обновите Workflow Kit/);assert.equal(old.view().supported,false);
  const broken=new PlanReviewClient({selected,supports:()=>true,read:()=>{throw Error('Unreadable state');}});broken.observeSelection();
  assert.equal(broken.view().error,'Unreadable state');
  assert.throws(()=>broken.setEnabled({workspace:'/fixture',enabled:false}),{code:'REVIEW_UNAVAILABLE'});
});

test('Review and AutoPlan share a conversation pause across scope change and restart',async()=>{
  let checkpoint;const gate=new AutomationSendState({save:async value=>{checkpoint=structuredClone(value);}});
  const selected={workspace:'/project',sessionId:'chat',chatUrl:'https://chatgpt.com/c/test',scopeId:null};
  const page={turnId:'pause-one'};let sends=0;
  const first=await gate.send({selected,page,kind:'review',ready:()=>true,perform:async()=>{sends++;return {state:'sent'};}});
  assert.equal(first.state,'sent');
  selected.scopeId='new-scope';
  const next=await gate.send({selected,page,ready:()=>true,perform:async()=>{sends++;return {state:'sent'};}});
  assert.equal(next.reason,'PAUSE_CONSUMED');assert.equal(sends,1);
  const restored=new AutomationSendState();restored.restore(checkpoint);
  assert.equal((await restored.send({selected,page,ready:()=>true,perform:async()=>{throw Error('duplicate');}})).state,'unknown');
  const unknown=await gate.send({selected,page:{turnId:'pause-two'},ready:()=>true,perform:async()=>({state:'unknown'})});
  assert.equal(unknown.state,'unknown');assert.equal(checkpoint.entries.at(-1).status,'sending');
});

test('Review continuation at NONE targets its recipient, asks once and respects draft and manual Stop',async()=>{
  const selected={workspace:'/project',sessionId:'chat',chatUrl:'https://chatgpt.com/c/test',scopeId:null};
  const client={state:{enabled:true,run_id:'run',stage:'PREPARED',round:0,generation:1,recipient_session_id:'chat'},refresh(){}};
  let saved;const sent=[];
  const flow=new ReviewContinuation({selected:()=>selected,client,available:()=>true,settleMs:0,
    status:()=>client.state,acknowledge:()=>{client.state={...client.state,notification_handled:true,generation:client.state.generation+1};},
    saveCheckpoint:async v=>{saved=structuredClone(v);},
    send:async(text,ready,before)=>{if(!ready()||!await before())return {state:'cancelled'};sent.push(text);return {state:'sent'};}});
  const page={url:selected.chatUrl,busy:false,editorAvailable:true,writable:true,lastMessageRole:'assistant',turnId:'a',userTurnId:'u',draftPresent:true,manualStopRevision:0,manualSendRevision:0};
  const observe=patch=>{Object.assign(page,patch);flow.observe({state:{...page},documentId:'doc'});};
  const drain=async()=>{await new Promise(r=>setTimeout(r,10));await flow.flow.reconcile();};
  try {
    observe({});flow.update();await drain();assert.equal(sent.length,0);
    observe({draftPresent:false});await drain();assert.equal(sent.length,1);assert.match(sent[0],/не разрешение выполнения задач/);
    client.state={...client.state,stage:'NEEDS_USER',generation:2,round:4};flow.update();observe({turnId:'b'});await drain();
    assert.equal(sent.length,2);assert.match(sent[1],/спроси, что делать/);
    observe({turnId:'c'});await drain();assert.equal(sent.length,2,'no repeat of the user question');
    client.state={...client.state,stage:'PREPARED',generation:4,notification_handled:false};flow.update();
    observe({busy:true,turnId:'d'});observe({busy:false,manualStopRevision:1});await drain();assert.equal(sent.length,2);
    assert.equal(saved.reviewStops.length,1);
    observe({manualSendRevision:1,userTurnId:'u2',lastMessageRole:'user'});await drain();assert.equal(sent.length,2);
    observe({busy:true});observe({busy:false,turnId:'e',lastMessageRole:'assistant'});await drain();assert.equal(sent.length,3);
    selected.sessionId='other';flow.update();observe({turnId:'f'});await drain();assert.equal(sent.length,3,'wrong recipient does not receive a review');
  } finally {flow.dispose();}
});

test('AutoPlan waits for confirmed reviewed publication, OFF and unrelated active plans remain ordinary',async()=>{
  const {reviewBlocksExecution}=await import('../src/auto-plan-state.mjs');
  for(const enabled of [false,true])for(const stage of ['PUBLISHING','PUBLISHED','NEEDS_USER']){
    const s={enabled,stage,scope_id:'new'};
    assert.equal(!!reviewBlocksExecution(s,'new'),enabled && stage!=='PUBLISHED');
    assert.equal(!!reviewBlocksExecution(s,'old'),false);
  }
});
