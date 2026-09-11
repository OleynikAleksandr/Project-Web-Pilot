import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ContextSession, receiptMatch, startupMessage } from '../src/context-session.mjs';

const project={workspace:'/Projects/Мой проект',projectId:'id-1',name:'Мой проект',planRevision:7,scopeId:'scope-1',
  scopeStatus:'ACTIVE',deliveryStatus:'IN_PROGRESS',nextTaskId:'T001',nextTaskTitle:'Read',sessionId:'session-1',
  chatUrl:'https://chatgpt.com/c/aaaaaaaa',attempt:null,receipt:null};
const facts={project_id:project.projectId,project_name:project.name,plan_revision:7,scope_id:'scope-1',
  execution_scope_status:'ACTIVE',delivery_status:'IN_PROGRESS',task_id:'T001',task_title:'Read'};
const now=2000000;
const attempt={requestId:'request',excludedProbeIds:['old'],sendStartedAtMs:now-1000,state:'sent'};
function evidence(overrides={}){
  return {workspace:project.workspace,session_id:project.sessionId,
    latest:{workspace:project.workspace,session_id:project.sessionId,probe_id:'new',source:'agent_request',issued_at:now/1000-.5,
      acknowledged_at:now/1000,acknowledged:true,facts:{...facts}},
    last_receipt:{workspace:project.workspace,probe_id:'new',source:'agent_request',status:'acknowledged',facts:{...facts},user_message:'Confirmed'},...overrides};
}

test('receipt requires a newly issued, same-project, same-session, acknowledged probe',()=>{
  assert.equal(receiptMatch(evidence(),project,attempt,now).kind,'confirmed');
  const mutations=[s=>{s.session_id='another';},s=>{s.latest.probe_id='old';s.last_receipt.probe_id='old';},
    s=>{s.latest.acknowledged=false;},s=>{s.latest.issued_at=1;},s=>{s.last_receipt.workspace='/another';},
    s=>{s.last_receipt.probe_id='other';},s=>{s.latest.source='startup';},s=>{s.latest.facts.plan_revision=2;}];
  for(const mutate of mutations){const value=evidence();mutate(value);assert.equal(receiptMatch(value,project,attempt,now).kind,'waiting');}
});

test('a changed plan or replaced acknowledgement cannot be presented as current',()=>{
  assert.equal(receiptMatch(evidence(),{...project,planRevision:8},attempt,now).kind,'stale');
  assert.equal(receiptMatch(evidence(),project,{...attempt,ackProbeId:'previous'},now).kind,'superseded');
});

test('startup message carries explicit identity and read-only recovery/ACK with no simulated hook',()=>{
  const text=startupMessage(project,'unique-request');
  for(const item of ['"/Projects/Мой проект"','session-1','unique-request','bridge_status','workflow_context_recover','workflow_context_ack','source="agent_request"','Файлы не менять'])assert.ok(text.includes(item));
  assert.ok(!text.includes('workflow_context_hook('));
});

function controllerFixture({ savedAttempt=null, statuses=[] }={}){
  let saved={...structuredClone(project),attempt:savedAttempt};let sends=0;let inspection={url:project.chatUrl,editorAvailable:true,writable:true,draftLength:0,busy:false,login:false,messageSeen:false};
  const stateLog=[];
  const store={selected:()=>structuredClone(saved),project:()=>structuredClone(saved),inspect:async()=>{const {sessionId,chatUrl,attempt,receipt,...info}=project;return structuredClone(info);},
    updateSession:async(_w,_s,patch)=>{saved={...saved,...structuredClone(patch)};return structuredClone(saved);},
    bindChat:async(_w,_s,url)=>{saved.chatUrl=url;return structuredClone(saved);}};
  const runtime={ensure:async()=>({}),contextStatus:async()=>statuses.shift()??{workspace:project.workspace,session_id:project.sessionId,latest:null,last_receipt:null}};
  const composer={inspect:async()=>({...inspection}),deliver:async options=>{
    assert.equal(saved.attempt.state,'prepared');await options.onBeforeSend();assert.equal(saved.attempt.state,'sending');
    sends++;inspection.messageSeen=true;return {state:'sent'};
  }};
  const controller=new ContextSession({store,runtime,composer,onChange:s=>stateLog.push(s),now:()=>now-1000,uuid:()=> 'test-request'});
  controller.attach(saved);
  return {controller,store,runtime,composer,stateLog,sends:()=>sends,get saved(){return saved;},inspection};
}

test('persists before sending, matches the actual status and reopens without duplicate messages',async()=>{
  const f=controllerFixture({statuses:[{workspace:project.workspace,session_id:project.sessionId,latest:{probe_id:'old'},last_receipt:null},evidence(),evidence()]});
  await f.controller.tick();assert.equal(f.sends(),1);assert.equal(f.saved.attempt.state,'sent');
  f.controller.now=()=>now;await f.controller.tick();assert.equal(f.controller.state.phase,'confirmed');
  f.controller.attach(f.saved);await f.controller.tick();assert.equal(f.sends(),1);assert.equal(f.controller.state.phase,'confirmed');
});

test('unknown outcome after restart only observes and never invokes deliver again',async()=>{
  const f=controllerFixture({savedAttempt:{...attempt,state:'sending',text:'old-message'}});
  await f.controller.tick();assert.equal(f.sends(),0);assert.equal(f.controller.state.phase,'send-unknown');
  await f.controller.retry();assert.equal(f.sends(),0);
});

test('an old receipt is baseline and cannot approve the next request',async()=>{
  const stale=evidence();stale.latest.probe_id='old';stale.last_receipt.probe_id='old';
  const f=controllerFixture({statuses:[stale,stale]});await f.controller.tick();await f.controller.tick();
  assert.equal(f.controller.state.phase,'waiting-ack');assert.equal(f.saved.receipt,null);
});

test('switching a workspace while MCP starts cancels before send',async()=>{
  const f=controllerFixture();let release;f.runtime.ensure=()=>new Promise(r=>{release=r;});
  const running=f.controller.tick();await new Promise(r=>setImmediate(r));f.controller.cancel();release();await running;
  assert.equal(f.sends(),0);assert.equal(f.saved.attempt,null);
});

test('an unbound workspace cannot adopt a manually opened existing chat before its own request',async()=>{
  const f=controllerFixture();const unbound={...f.saved,chatUrl:null};
  f.store.selected=()=>structuredClone(unbound);f.store.project=()=>structuredClone(unbound);
  f.controller.attach(unbound);await f.controller.tick();
  assert.equal(f.controller.state.phase,'chat-changed');assert.equal(f.sends(),0);
});
