import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { JSDOM } from 'jsdom';
import { executorStatus,projectExecutors } from '../src/execution-projection.mjs';

test('status distinguishes observed work, unknown, source readiness and verified integration without inventing a user question',()=>{
  const record={pageState:{current:{state:{busy:true,lastMessageRole:'assistant'}}}};
  assert.equal(executorStatus({status:'RUNNING'},record).phase,'working');
  assert.match(executorStatus({status:'READY_FOR_INTEGRATION'},record).label,/ответ продолжается/);
  record.pageState.current.state.busy=false;
  assert.equal(executorStatus({status:'READY_FOR_INTEGRATION'},record).phase,'ready');
  assert.equal(executorStatus({status:'RUNNING'},record).label,'Пауза · задача не завершена');
  assert.equal(executorStatus({status:'INTEGRATED'},record).phase,'done');
  assert.equal(executorStatus({id:'a',status:'READY_FOR_INTEGRATION'},record,{assignment_id:'a',status:'CHECKING'}).phase,'merging');
  assert.equal(executorStatus({id:'a'},record,{assignment_id:'a',status:'CONFLICT'}).phase,'attention');
  assert.equal(executorStatus({status:'RUNNING'},null).phase,'unknown');
});

test('saved executor belongs to its original main session, keeps totals without a live page and never copies conversation text',()=>{
  const projects=[{workspace:'/tree',parentWorkspace:'/main',sessions:[{sessionId:'child',assignmentId:'a',taskId:'T1',
    executionOriginSessionId:'original',title:'Task',experience:'work',executionTime:{activeMs:10,waitingMs:20},attempt:{text:'PRIVATE'}}]}];
  const view=projectExecutors(projects,'/main',{assignments:[{id:'a',status:'READY_FOR_INTEGRATION'}]},()=>null);
  assert.equal(view.length,1);assert.equal(view[0].originSessionId,'original');assert.equal(view[0].phase,'unknown');
  assert.equal(view[0].time.activeMs,10);assert.equal(view[0].time.waitingMs,20);assert.equal(view[0].time.phase,'unknown');
  assert.ok(!JSON.stringify(view).includes('PRIVATE'));
});

test('real sidebar renders executor group, worktree/status/time, protected action names and parent completion',async t=>{
  const html=await fs.readFile(new URL('../src/ui/index.html',import.meta.url),'utf8');
  const source=await fs.readFile(new URL('../src/ui/sidebar.mjs',import.meta.url),'utf8');
  const dom=new JSDOM(html,{runScripts:'outside-only',pretendToBeVisual:true,url:'https://fixture.invalid/'});
  t.after(()=>dom.window.close());const {window}=dom,{document}=window,calls=[];
  const query=document.querySelectorAll.bind(document);
  document.querySelectorAll=selector=>query(selector.replaceAll(':popover-open','[data-test-open]'));
  let listener;
  const executor={workspace:'/tree',sessionId:'child',originSessionId:'author',taskId:'T1',title:'T1 — Worker',experience:'work',
    phase:'ready',label:'Готово к слиянию',time:{activeMs:2000,waitingMs:3000,phase:'unknown'}};
  let state={projects:[{workspace:'/main',name:'Main',expanded:true,sessions:[{sessionId:'author',title:'Планировщик',createdAt:1000}],executors:[executor]}],
    selected:{workspace:'/main',sessionId:'author',scopeId:'scope',planExecution:{execution_strategy:'parallel'},planView:{state:'working',completed:0,total:1,tasks:[{id:'T1',title:'Task',status:'current'}]}},
    execution:{phase:'waiting',scopeId:'scope',assignments:[],planView:{state:'working',completed:0,total:1,tasks:[{id:'T1',title:'Task',status:'current'}]}},context:{phase:'delivered'}};
  const action=name=>async(...args)=>{calls.push([name,...args]);return {state};};
  window.webPilot={getState:async()=>state,onState:fn=>{listener=fn;},
    correctIntegration:action('correctIntegration'),selectSession:action('selectSession')};
  window.eval('const createProgress=()=>({show(){},destroy(){}});const operationLabel=()=>"";const settingsPanelView=()=>({render(){}});const workspaceSetupView=()=>({render(){}});\n'+source.replace(/^import .*;\n/gm,''));
  const settle=()=>new Promise(resolve=>setTimeout(resolve,0));await settle();
  assert.match(document.querySelector('.executor-group summary').textContent,/Исполнители · Планировщик/);
  assert.match(document.querySelector('.executor-row').textContent,/worktree/);
  assert.match(document.querySelector('.executor-row').textContent,/Готово к слиянию/);
  assert.match(document.querySelector('[data-executor-time]').textContent,/Работа 00:02 · ожидание 00:03/);
  document.querySelector('.executor-row').click();await settle();assert.deepEqual(calls.pop(),['selectSession','/tree','child']);
  assert.match(document.getElementById('auto-plan-message').textContent,/Автовыполнение этого проекта выключено/);
  assert.equal(document.getElementById('execute-tasks'),null);assert.equal(document.getElementById('reconcile-execution'),null);
  state={...state,selected:{...state.selected,workspace:'/tree',parentWorkspace:'/main',assignmentId:'a',sessionId:'child',
    planView:{state:'awaiting-acceptance',completed:1,total:1,tasks:[{id:'T1',title:'Task',status:'done'}]}},
    execution:{...state.execution,phase:'integration',integration:{status:'CONFLICT'}}};
  listener(state);
  assert.equal(document.querySelector('.executor-row').getAttribute('aria-current'),'page');
  assert.match(document.getElementById('plan-status').textContent,/0 из 1/,'local DONE does not complete main');
  assert.equal(document.getElementById('correct-integration').hidden,false);
  document.getElementById('correct-integration').click();await settle();assert.deepEqual(calls.pop(),['correctIntegration','/main']);
});
