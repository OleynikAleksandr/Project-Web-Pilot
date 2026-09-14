import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { ContextSession, packetMatchesProject, startupMessage } from '../src/context-session.mjs';

const project={workspace:'/Projects/Мой проект',projectId:'id-1',name:'Мой проект',planRevision:7,scopeId:'scope-1',
  scopeStatus:'ACTIVE',deliveryStatus:'IN_PROGRESS',nextTaskId:'T001',nextTaskTitle:'Read',sessionId:'session-1', experience:'chat',
  chatUrl:'https://chatgpt.com/c/aaaaaaaa',attempt:null,receipt:null};
const facts={project_id:project.projectId,project_name:project.name,plan_revision:7,scope_id:'scope-1',
  execution_scope_status:'ACTIVE',delivery_status:'IN_PROGRESS',task_id:'T001',task_title:'Read'};
const now=2000000;
function packet(){
  const context='ПОЛНЫЙ КОНТЕКСТ\nОписание проекта\nПлан\n\nНезавершённые изменения\nКОНЕЦ';
  return {delivery_protocol:'inline-context-v1',ack_required:false,status:'ready',completeness:'COMPLETE',workspace:project.workspace,
    context,context_bytes:Buffer.byteLength(context),context_sha256:createHash('sha256').update(context).digest('hex'),
    generated_at_ms:now,signature:'signature',head:'head',facts:{...facts}};
}
function controllerFixture({ savedAttempt=null, chatUrl=project.chatUrl }={}){
  let saved={...structuredClone(project),chatUrl,attempt:savedAttempt};let sends=0,loads=0;
  let info={...project};let inspection={url:chatUrl??'https://chatgpt.com/',editorAvailable:true,writable:true,draftLength:0,busy:false,login:false,messageSeen:false};
  const stateLog=[];
  const store={selected:()=>structuredClone(saved),project:()=>structuredClone(saved),inspect:async()=>{
    const {sessionId,experience,chatUrl,attempt,receipt,...result}=info;return structuredClone(result);},
    updateSession:async(_w,_s,patch)=>{saved={...saved,...structuredClone(patch)};return structuredClone(saved);},
    bindChat:async(_w,_s,url)=>{saved.chatUrl=url;return structuredClone(saved);}};
  const runtime={ensure:async()=>({}),loadContext:async()=>{loads++;return packet();}};
  const composer={inspect:async()=>({...inspection}),contents:{getURL:()=>inspection.url},deliver:async options=>{
    assert.equal(saved.attempt.state,'prepared');assert.ok(options.text.includes(packet().context));
    if(!options.canContinue())return {state:'cancelled'};
    await options.onBeforeSend();if(!options.canContinue())return {state:'cancelled'};
    assert.equal(saved.attempt.state,'sending');sends++;inspection.messageSeen=true;
    inspection.url=project.chatUrl;return {state:'sent'};
  }};
  const controller=new ContextSession({store,runtime,composer,onChange:s=>stateLog.push(s),now:()=>now,uuid:()=> 'test-request'});
  controller.attach(saved);
  return {controller,store,runtime,composer,stateLog,sends:()=>sends,loads:()=>loads,get saved(){return saved;},inspection,info};
}

test('the first message contains the exact complete packet and asks for a short project reply without tools',()=>{
  const p=packet(), text=startupMessage(project,'unique-request',p);
  assert.ok(text.includes('\n'+p.context+'\n'));
  for(const item of ['"/Projects/Мой проект"','session-1','unique-request','коротко подтверди','опиши назначение проекта','не вызывай инструменты'])assert.ok(text.includes(item));
  for(const name of ['workflow_context_recover','workflow_context_ack','workflow_context_hook'])assert.ok(!text.includes(name));
  assert.equal(packetMatchesProject(p,project),true);
  assert.equal(packetMatchesProject(p,{...project,planRevision:8}),false);
});

test('loads once, saves full message before send, and reopens the same chat without another recovery or send',async()=>{
  const f=controllerFixture({chatUrl:null});await f.controller.tick();assert.equal(f.sends(),1);assert.equal(f.loads(),1);
  assert.equal(f.saved.attempt.state,'sent');await f.controller.tick();assert.equal(f.controller.state.phase,'delivered');
  assert.equal(f.saved.chatUrl,project.chatUrl);assert.equal(f.controller.state.delivery.contextBytes,packet().context_bytes);
  f.controller.attach(f.saved);await f.controller.tick();assert.equal(f.sends(),1);assert.equal(f.loads(),1);
});

test('unknown send after restart only observes, including explicit retry, then recognizes the late message',async()=>{
  const f=controllerFixture();await f.controller.tick();
  const unknown={...f.saved.attempt,state:'unknown'};await f.store.updateSession('', '',{attempt:unknown});f.inspection.messageSeen=false;
  f.controller.attach(f.saved);await f.controller.tick();assert.equal(f.controller.state.phase,'send-unknown');
  await f.controller.retry();assert.equal(f.sends(),1);assert.equal(f.loads(),1);
  f.inspection.messageSeen=true;await f.controller.tick();assert.equal(f.controller.state.phase,'delivered');
});

test('legacy sessions stay bound and only explicit refresh sends the new protocol',async()=>{
  const f=controllerFixture({savedAttempt:{requestId:'old',text:'old startup',state:'acknowledged',sendStartedAtMs:now-1000}});
  await f.controller.tick();assert.equal(f.controller.state.phase,'legacy-session');assert.equal(f.loads(),0);assert.equal(f.sends(),0);
  await f.controller.retry();await f.controller.tick();assert.equal(f.controller.state.phase,'delivered');assert.equal(f.sends(),1);
  assert.equal(f.saved.attempt.protocol,'inline-context-v1');
});

test('drafts and generation delay packet preparation and do not overwrite user input',async()=>{
  for(const [patch,phase] of [[{draftLength:7,draftMatches:false},'waiting-draft'],[{busy:true},'waiting-generation']]){
    const f=controllerFixture();Object.assign(f.inspection,patch);await f.controller.tick();
    assert.equal(f.controller.state.phase,phase);assert.equal(f.sends(),0);assert.equal(f.loads(),0);
  }
});

test('incomplete or wrong-project packet and a changed plan fail before sending',async()=>{
  for(const mutate of [p=>p.workspace='/other',p=>p.completeness='PARTIAL',p=>p.facts.plan_revision=6]){
    const f=controllerFixture();f.runtime.loadContext=async()=>{const p=packet();mutate(p);return p;};await f.controller.tick();
    assert.equal(f.controller.state.phase,'error');assert.equal(f.sends(),0);assert.equal(f.saved.attempt,null);
  }
});

test('plan changes after filling cannot send an outdated packet',async()=>{
  const f=controllerFixture();const deliver=f.composer.deliver;
  f.composer.deliver=async options=>{f.info.planRevision=8;return deliver(options);};
  await f.controller.tick();assert.equal(f.controller.state.phase,'prepared-stale');assert.equal(f.sends(),0);
  assert.equal(f.saved.attempt.state,'prepared');assert.equal(f.saved.attempt.sendStartedAtMs,null);
});

test('switching workspace during context loading cancels before storing or sending',async()=>{
  const f=controllerFixture();let release;f.runtime.loadContext=()=>new Promise(r=>{release=r;});
  const running=f.controller.tick();await new Promise(r=>setImmediate(r));f.controller.cancel();release(packet());await running;
  assert.equal(f.sends(),0);assert.equal(f.saved.attempt,null);
});

test('a foreign chat opened before or during preparation is never used for Send',async()=>{
  const unbound=controllerFixture({chatUrl:null});unbound.inspection.url=project.chatUrl;
  await unbound.controller.tick();assert.equal(unbound.controller.state.phase,'chat-changed');assert.equal(unbound.loads(),0);
  const changed=controllerFixture({chatUrl:null});changed.runtime.loadContext=async()=>{changed.inspection.url=project.chatUrl;return packet();};
  await changed.controller.tick();assert.equal(changed.controller.state.phase,'chat-changed');assert.equal(changed.sends(),0);
});

test('changed plan after delivery is shown as stale and explicit refresh obtains the new packet',async()=>{
  const f=controllerFixture();await f.controller.tick();f.info.planRevision=8;await f.controller.tick();
  assert.equal(f.controller.state.phase,'stale');assert.equal(f.sends(),1);
  f.runtime.loadContext=async()=>{const p=packet();p.facts.plan_revision=8;return p;};
  await f.controller.retry();await f.controller.tick();assert.equal(f.controller.state.phase,'delivered');assert.equal(f.sends(),2);
});


test('Work session fails closed when ChatGPT is not in Work experience', async()=>{
  const f=controllerFixture({chatUrl:null});
  f.store.selected=()=>({...structuredClone(f.saved),experience:'work'});
  f.store.project=()=>({...structuredClone(f.saved),experience:'work'});
  f.inspection.url='https://chatgpt.com/';
  f.controller.attach({...f.saved,experience:'work'});
  await f.controller.tick();
  assert.equal(f.controller.state.phase,'error');
  assert.equal(f.controller.state.error.code,'CHATGPT_EXPERIENCE_MISMATCH');
  assert.equal(f.loads(),0); assert.equal(f.sends(),0);
});

test('unbound Work session accepts Work entrypoint before recovery', async()=>{
  const f=controllerFixture({chatUrl:null});
  f.store.selected=()=>({...structuredClone(f.saved),experience:'work'});
  f.store.project=()=>({...structuredClone(f.saved),experience:'work'});
  f.inspection.url='https://chatgpt.com/work/';
  f.composer.contents.getURL=()=>f.inspection.url;
  f.composer.deliver=async options=>{ assert.equal(options.canContinue(),true); return {state:'deferred',reason:'SEND_UNAVAILABLE'}; };
  f.controller.attach({...f.saved,experience:'work'});
  await f.controller.tick();
  assert.equal(f.loads(),1);
  assert.equal(f.controller.state.phase,'waiting-composer');
});


test('Work session keeps provenance when ChatGPT moves from /work/ to shared /c/<id>', async()=>{
  const f=controllerFixture({chatUrl:null});
  f.saved.experience='work';
  f.store.selected=()=>({...structuredClone(f.saved),experience:'work'});
  f.store.project=()=>({...structuredClone(f.saved),experience:'work'});
  f.inspection.url='https://chatgpt.com/work/';
  f.composer.contents.getURL=()=>f.inspection.url;
  f.composer.deliver=async options=>{
    assert.equal(options.canContinue(),true);
    await options.onBeforeSend();
    f.inspection.url='https://chatgpt.com/c/work-real-session';
    f.inspection.messageSeen=true;
    assert.equal(options.canContinue(),true,'same Work send may transition to shared conversation URL');
    return {state:'sent'};
  };
  f.controller.attach({...f.saved,experience:'work'});
  await f.controller.tick();
  assert.equal(f.loads(),1); assert.equal(f.controller.state.phase,'waiting-chat');
  await f.controller.tick();
  assert.equal(f.controller.state.phase,'delivered');
  assert.equal(f.saved.experience,'work');
  assert.equal(f.saved.chatUrl,'https://chatgpt.com/c/work-real-session');
  f.controller.attach(f.saved);
  await f.controller.tick();
  assert.equal(f.controller.state.phase,'delivered','bound Work /c URL is authoritative by exact match');
  assert.equal(f.loads(),1,'reopen does not reload recovery');
});
