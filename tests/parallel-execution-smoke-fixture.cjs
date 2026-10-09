const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const path=require('node:path');
const {execFile}=require('node:child_process');
const {promisify}=require('node:util');
const execute=promisify(execFile);

module.exports.run=async function({sidebar,store,workspaceSetup,snapshot,selectWorkspace,liveSessions,dataDir,waitFor}) {
  const node=await workspaceSetup.node(),script=path.resolve(__dirname,'../packages/workflow-kit/scripts/check-parallel-execution-fixture.mjs');
  const run=async(...args)=>JSON.parse((await execute(node,[script,...args],{env:workspaceSetup.environment,maxBuffer:4*1024*1024,timeout:120000})).stdout);
  const git=async(root,...args)=>(await execute('git',['-C',root,...args],{env:workspaceSetup.environment,encoding:'utf8'})).stdout.trim();
  const ipc=(name,...args)=>sidebar.executeJavaScript('window.webPilot.'+name+'('+args.map(a=>JSON.stringify(a)).join(',')+')');
  const wait=(predicate,name)=>waitFor(predicate,'parallel: '+name,()=>({...snapshot(),parallelRuntimes:[...liveSessions.records.values()]
    .filter(r=>r.identity?.assignmentId).map(r=>({identity:r.identity,ready:r.ready,loading:r.loading,
      phase:r.controller.state.phase,error:r.controller.state.error,runtimeError:r.error,url:r.view.webContents.getURL()}))}));
  const root=(await run('--create',path.join(dataDir+'-projects','parallel-e2e'))).root;
  await ipc('setAutoPlan',false);await ipc('openSettings');
  assert.equal((await ipc('setParallelExecution',{parallel_allowed:true,max_workers:2})).ok,true);
  await ipc('closeSettings');await selectWorkspace(root);
  await wait(()=>store.selected()?.workspace===root&&snapshot().context.phase==='delivered','main context delivery');
  const origin=store.selected();assert.deepEqual(origin.executionSnapshot,{parallel_allowed:true,max_workers:2});
  const record=(workspace,id)=>[...liveSessions.records.values()].find(r=>r.identity?.workspace===workspace&&(!id||r.identity.sessionId===id));
  const main=record(root,origin.sessionId);
  await main.view.webContents.executeJavaScript('window.fixtureAssistant("Планировщик готов")');
  await run('--plan',root,origin.sessionId);
  const base=await git(root,'rev-parse','HEAD');
  await wait(()=>main.pageState.current?.state.lastMessageRole==='assistant','main observed pause');
  await ipc('openSettings');await ipc('setParallelExecution',{parallel_allowed:false,max_workers:1});await ipc('closeSettings');
  assert.deepEqual(store.project(root,origin.sessionId).executionSnapshot,{parallel_allowed:true,max_workers:2});
  assert.equal((await ipc('executeTasks',root)).ok,true);
  await wait(()=>snapshot().execution.assignments.length===2,'two assigned worktrees');
  let assignments=snapshot().execution.assignments;
  const a=assignments.find(a=>a.parent_task_id==='T001'),b=assignments.find(a=>a.parent_task_id==='T002');
  assert.ok(a&&b);assert.notEqual(a.worktree,b.worktree);
  await wait(()=>[a,b].every(a=>store.project(a.worktree)?.chatUrl&&record(a.worktree)?.controller.state.phase==='delivered'),'independent delivered chats');
  const first=record(a.worktree),second=record(b.worktree);
  for(const item of [a,b]) {
    assert.equal(await fs.stat(path.join(item.worktree,'node_modules')).then(s=>s.isDirectory()),true);
    assert.deepEqual(store.project(item.worktree).executionSnapshot,origin.executionSnapshot);
  }
  const hold=record=>record.view.webContents.executeJavaScript('if(!document.getElementById("parallel-held")){const b=document.createElement("button");b.id="parallel-held";b.dataset.testid="stop-button";b.setAttribute("aria-label","Stop generating");document.body.append(b);}window.parallelMarker=71;');
  const finish=record=>record.view.webContents.executeJavaScript('document.getElementById("parallel-held")?.remove();window.fixtureAssistant("Задача завершена")');
  await hold(first);await hold(second);
  await wait(()=>first.pageState.current?.state.busy&&second.pageState.current?.state.busy,'both workers busy');
  await ipc('selectSession',a.worktree,store.project(a.worktree).sessionId);
  await ipc('selectSession',b.worktree,store.project(b.worktree).sessionId);
  assert.equal(first.pageState.current.state.busy,true);
  await ipc('selectSession',a.worktree,store.project(a.worktree).sessionId);
  assert.equal(await first.view.webContents.executeJavaScript('window.parallelMarker'),71);
  assert.equal(await git(root,'rev-parse','HEAD'),base);
  await run('--complete',a.worktree);await run('--complete',b.worktree);
  assert.equal(await git(root,'rev-parse','HEAD'),base,'local commits do not change main');
  assert.equal(await fs.readFile(path.join(root,'README.md'),'utf8'),'# Original\n');
  await run('--conflict',root);
  await finish(first);await ipc('reconcileExecution',root);
  await wait(()=>snapshot().execution.integration?.status==='CONFLICT','merge conflict retained in main');
  assert.equal(snapshot().execution.planView.completed,0);
  assert.equal(second.pageState.current.state.busy,true,'independent worker keeps its page during main conflict');
  const operation=snapshot().execution.integration.operation_id;
  await wait(()=>snapshot().execution.canCorrect===true,'main ready for explicit correction');
  const before=await main.view.webContents.executeJavaScript('window.fixtureMessages.length');
  const correction=await ipc('correctIntegration',root);
  assert.equal(correction.ok,true,JSON.stringify(correction.error));assert.equal(correction.result.state,'sent',JSON.stringify(correction.result));
  await wait(async()=>await main.view.webContents.executeJavaScript('window.fixtureMessages.length')===before+1,'correction in exact main chat');
  const message=await main.view.webContents.executeJavaScript('window.fixtureMessages.at(-1).text');
  assert.ok(message.includes(root)&&message.includes(operation)&&message.includes('integration:continue'));
  await ipc('correctIntegration',root);
  assert.equal(await main.view.webContents.executeJavaScript('window.fixtureMessages.length'),before+1,'no duplicate correction');
  await run('--correct',root,operation);await finish(main);await ipc('reconcileExecution',root);
  await wait(()=>snapshot().execution.assignments.find(x=>x.id===a.id)?.status==='INTEGRATED','corrected merge proof');
  await finish(second);await ipc('reconcileExecution',root);
  await wait(()=>snapshot().execution.planView.completed===2,'second integration');
  assert.equal(snapshot().execution.assignments.length,2,'AutoPlan OFF does not dispatch the dependent task');
  const combined=await git(root,'rev-parse','HEAD');
  assert.equal((await ipc('executeTasks',root)).ok,true);
  await wait(()=>snapshot().execution.assignments.length===3,'explicit dependent task');
  const c=snapshot().execution.assignments.find(x=>x.parent_task_id==='T003');assert.equal(c.base_commit,combined);
  assert.match(await fs.readFile(path.join(c.worktree,'README.md'),'utf8'),/worker-a/);
  assert.match(await fs.readFile(path.join(c.worktree,'SECOND.md'),'utf8'),/worker-b/);
  await wait(()=>record(c.worktree)?.controller.state.phase==='delivered','dependent context delivered');
  const third=record(c.worktree);await hold(third);await run('--complete',c.worktree);await finish(third);await ipc('reconcileExecution',root);
  await wait(()=>snapshot().execution.phase==='complete','three verified integrations');
  assert.equal(await git(root,'rev-list','--count','--merges',base+'..HEAD'),'3');
  for(const theme of ['dark','light']) {
    await ipc('setTheme',theme);
    const ui=await sidebar.executeJavaScript('({rows:document.querySelectorAll(".executor-row").length,text:document.querySelector(".executor-group")?.textContent,recheck:document.getElementById("reconcile-execution").textContent})');
    assert.equal(ui.rows,3);assert.match(ui.text,/Завершено · интеграция проверена/);assert.match(ui.text,/Работа/);assert.match(ui.recheck,/Повторить сверку/);
  }
  assert.equal(snapshot().execution.planView.completed,3);
  await fs.writeFile(path.join(dataDir,'parallel-execution-result.json'),JSON.stringify({mode:'isolated-fixture',realIpc:true,
    realDependency:true,workers:3,independentPages:true,conflictCorrectionMainChat:true,mergeCommits:3,liveChatGPT:false,nativeWindows:false,cleanOS:false},null,2));
  return true;
};
