import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { ContextCache } from '../src/context-cache.mjs';
import { contextInputKey } from '../src/context-inputs.mjs';

function packet(workspace, context = 'полный пакет') {
  return { delivery_protocol: 'inline-context-v1', ack_required: false, status: 'ready', completeness: 'COMPLETE',
    workspace, context, signature: 'signature', head: 'a'.repeat(40), generated_at_ms: 1,
    facts: {project_id:'p',project_name:'Project',plan_revision:1,scope_id:'scope',execution_scope_status:'ACTIVE',
      delivery_status:'IN_PROGRESS',task_id:'T001',task_title:'Task'},
    context_bytes:Buffer.byteLength(context),context_sha256:createHash('sha256').update(context).digest('hex') };
}
test('complete packet is reused across sessions and age; input changes rebuild it', async () => {
  let key='a', loads=0;
  const cache=new ContextCache({inputKey:async()=>key,load:async w=>{loads++;return packet(w,key);}});
  const first=await cache.load('/project');assert.equal(first.preparation.cacheHit,false);
  const second=await cache.load('/project');assert.equal(second.preparation.cacheHit,true);
  assert.equal(second.context,first.context);assert.equal(second.generated_at_ms,1);assert.equal(loads,1);
  second.facts.project_name='mutated';
  assert.equal((await cache.load('/project')).facts.project_name,'Project');
  key='b';assert.equal(await cache.isCurrent('/project',first.preparation.inputKey),false);
  assert.equal((await cache.load('/project')).context,'b');assert.equal(loads,2);
  await cache.load('/other');assert.equal(loads,3);
});
test('concurrent callers share one build, bounded entries and clear invalidate', async () => {
  let loads=0, release;
  const cache=new ContextCache({inputKey:async()=> 'key',load:async w=>{loads++;await new Promise(r=>release=r);return packet(w);},limit:2});
  const first=cache.load('/a'),second=cache.load('/a');
  while(!release) await new Promise(r=>setImmediate(r));
  release();await Promise.all([first,second]);assert.equal(loads,1);
  cache.loadPacket=async w=>{loads++;return packet(w);};
  await cache.load('/b');await cache.load('/c');assert.equal(cache.entries.size,2);
  assert.equal(cache.entries.has('/a'),false);
  cache.clear();assert.equal(cache.entries.size,0);
});
test('changing inputs during build are retried; unstable build is never cached',async()=>{
  let key='a', loads=0;
  const cache=new ContextCache({inputKey:async()=>key,load:async w=>{loads++;const p=packet(w,key);if(loads===1) key='b';return p;}});
  assert.equal((await cache.load('/p')).context,'b');assert.equal(loads,2);
  cache.clear();cache.loadPacket=async w=>{key+='x';return packet(w);};
  await assert.rejects(cache.load('/p'),{code:'CONTEXT_CHANGED'});assert.equal(cache.entries.size,0);
});
test('unavailable inputs defer warm; foreground falls back; corrupt packets fail',async()=>{
  let loads=0;
  const cache=new ContextCache({inputKey:async()=>{throw Error('unavailable');},load:async w=>{loads++;return packet(w);}});
  await cache.warm('/p');assert.equal(loads,0);
  assert.equal((await cache.load('/p')).preparation.inputKey,undefined);
  assert.equal(await cache.isCurrent('/p','key'),false);
  cache.inputKey=async()=> 'key';cache.loadPacket=async w=>({...packet(w),context:'corrupt'});
  await assert.rejects(cache.load('/p'),{code:'MCP_CONTEXT_DAMAGED'});
});

async function repo(t) {
  const root=await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(),'pilot-context-cache-')));
  t.after(()=>fs.rm(root,{recursive:true,force:true}));
  const git=(...args)=>execFileSync('git',args,{cwd:root,encoding:'utf8',env:{...process.env,GIT_CONFIG_GLOBAL:os.devNull,GIT_CONFIG_NOSYSTEM:'1'}});
  git('init','-q');git('config','user.email','test@example.invalid');git('config','user.name','Test');
  for(const dir of ['.harness/plans','.harness/kit/lib','scripts','docs'])await fs.mkdir(path.join(root,dir),{recursive:true});
  const plan={schema_version:1,context_pack:{documents:[{path:'docs/module.md'},{path:'docs/missing.md'}]},
    tasks:[{functional_paths:['code.txt'],documentation_paths:[],context_pack:{documents:[]}}]};
  await fs.writeFile(path.join(root,'.harness/plans/todo-plan.md'),'<!-- workflow-state:begin -->\n```json\n'+JSON.stringify(plan)+'\n```');
  await fs.writeFile(path.join(root,'.harness/workflow.json'),JSON.stringify({documentation:{index:'docs/index.md'}}));
  for(const file of ['docs/module.md','docs/index.md','code.txt','.harness/kit/WORKFLOW.md','.harness/kit/lib/recovery.mjs','scripts/workflow.mjs'])await fs.writeFile(path.join(root,file),'original');
  git('add','.');git('commit','-qm','initial');return {root,git};
}
test('key covers same-size edits, ignored documents, index, HEAD, evidence, missing inputs and runtime',async t=>{
  const {root,git}=await repo(t);
  let previous=await contextInputKey(root);
  const changed=async action=>{await action();const next=await contextInputKey(root);assert.notEqual(next,previous);previous=next;};
  const file=path.join(root,'code.txt'),stat=await fs.stat(file);
  await changed(async()=>{await fs.writeFile(file,'modified');await fs.utimes(file,stat.atime,stat.mtime);});
  await changed(()=>git('add','code.txt'));
  await changed(()=>git('commit','-qm','change'));
  await changed(()=>fs.writeFile(path.join(root,'docs/missing.md'),'new'));
  await changed(()=>fs.rm(path.join(root,'docs/missing.md')));
  await changed(()=>fs.writeFile(path.join(root,'.git/info/exclude'),'docs/missing.md\n'));
  await changed(()=>fs.writeFile(path.join(root,'docs/missing.md'),'ignored but required'));
  await fs.mkdir(path.join(root,'.git/workflow-kit'),{recursive:true});
  await changed(()=>fs.writeFile(path.join(root,'.git/workflow-kit/last-verification.json'),'{}'));
  await changed(()=>fs.writeFile(path.join(root,'.harness/kit/lib/recovery.mjs'),'changed builder'));
  await fs.writeFile(path.join(root,'.git/workflow-kit/transaction.json'),'{}');
  await assert.rejects(contextInputKey(root),{code:'CONTEXT_INPUTS_UNAVAILABLE'});
});
test('worktree metadata is independent and symlink inputs disable reuse',async t=>{
  const {root,git}=await repo(t);
  const linked=root+'-linked';t.after(()=>fs.rm(linked,{recursive:true,force:true}));
  git('worktree','add','-qb','linked',linked);
  const canonical=await fs.realpath(linked),before=await contextInputKey(canonical);
  await fs.writeFile(path.join(canonical,'code.txt'),'modified');
  assert.notEqual(await contextInputKey(canonical),before);
  await fs.rm(path.join(canonical,'code.txt'));await fs.symlink(path.join(root,'code.txt'),path.join(canonical,'code.txt'));
  await assert.rejects(contextInputKey(canonical),{code:'CONTEXT_INPUTS_UNAVAILABLE'});
});

test('two sessions with identical revisions never share a packet or pending build', async () => {
  let loads=0;
  const cache=new ContextCache({inputKey:async()=> 'identical-revision',load:async(w,s)=>{
    loads++;return {...packet(w,s.sessionId),session_id:s.sessionId,plan_id:s.planId};
  }});
  const a={sessionId:'a',planId:'plan-a'},b={sessionId:'b',planId:'plan-b'};
  const [first,second]=await Promise.all([cache.load('/project',a),cache.load('/project',b)]);
  assert.equal(first.context,'a');assert.equal(second.context,'b');assert.equal(loads,2);
  assert.equal((await cache.load('/project',a)).preparation.cacheHit,true);
  cache.clear();cache.loadPacket=async w=>({...packet(w),session_id:'b',plan_id:'plan-b'});
  await assert.rejects(cache.load('/project',a),{code:'MCP_CONTEXT_SESSION_MISMATCH'});
});
