import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { EventEmitter } from 'node:events';
import { execFileSync } from 'node:child_process';
import { install, upgradeFrom } from '@webpilot/workflow-kit/lib/installer';
import { VERSION } from '@webpilot/workflow-kit/lib/common';
import { readPlan } from '@webpilot/workflow-kit/lib/plan';
import { resolveReferences } from '@webpilot/workflow-kit/lib/validate';
import { runReview, REVIEW_MODEL } from '@webpilot/workflow-kit/lib/claude-review';

test('released 1.6.3 review survives upgrade and adopts author positions without guessing recipient', async t => {
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'kit-163-review-upgrade-'));
  t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
  const source=fileURLToPath(new URL('..',import.meta.url)), old=path.join(root,'old'), project=path.join(root,'project');
  fs.mkdirSync(old);fs.mkdirSync(project);
  const env={...process.env,GIT_AUTHOR_NAME:'Fixture',GIT_AUTHOR_EMAIL:'fixture@example.invalid',GIT_COMMITTER_NAME:'Fixture',GIT_COMMITTER_EMAIL:'fixture@example.invalid'};
  for(const key of ['GIT_DIR','GIT_INDEX_FILE','GIT_WORK_TREE','GIT_COMMON_DIR'])delete env[key];
  const archive=execFileSync('git',['archive','v0.6.102','.harness/kit'],{cwd:source,maxBuffer:8*1024*1024});
  execFileSync('tar',['-x','-C',old],{input:archive});
  const run=(exe,args)=>execFileSync(exe,args,{cwd:project,env,encoding:'utf8',maxBuffer:4*1024*1024});
  const cli=(...args)=>JSON.parse(run(process.execPath,['scripts/workflow.mjs',...args]));
  const write=(name,value)=>fs.writeFileSync(path.join(project,name),JSON.stringify(value));
  run('git',['init','-q','-b','main']);
  run(process.execPath,[path.join(old,'.harness/kit/install.mjs'),'--project',project]);cli('install:commit');
  assert.equal(cli('status').version,'1.6.3');
  fs.mkdirSync(path.join(project,'docs/planning'),{recursive:true});
  const spec='docs/planning/review.md';fs.writeFileSync(path.join(project,spec),'# Upgrade fixture\nСохранять получателя и позицию автора.\n');
  const input={recipient_session_id:'upgrade-fixture-chat',documents:[spec],scope:{scope_id:'upgrade-review',
    objective:'Preserve pending review across upgrade',approval_note:'User requests an upgrade fixture plan',acceptance_criteria:['Correct review'],
    approved_scope:{functional_paths:[],documentation_paths:[spec]},context_pack:{documents:[{path:spec,required:true}]},
    tasks:[{id:'T001',title:'Verify upgrade',why:'Continue review safely',functional_paths:[],documentation_paths:[spec],verification_ids:[],
      acceptance_criteria:['Correct review'],expected_commit_message:'docs: fixture'}]}};
  write('.harness/runtime/input.json',input);
  const oldReview=await import(pathToFileURL(path.join(old,'.harness/kit/lib/plan-review.mjs')).href);
  const oldRunner=await import(pathToFileURL(path.join(old,'.harness/kit/lib/claude-review.mjs')).href);
  oldReview.setReviewEnabled(project,true);cli('review:prepare','--input','.harness/runtime/input.json');
  const fake=(_command,args,options)=>{
    const child=new EventEmitter();child.stdin=new EventEmitter();child.stdin.end=()=>queueMicrotask(()=>{
      const flag=args.includes('--resume')?'--resume':'--session-id';
      fs.writeSync(options.stdio[1],JSON.stringify({subtype:'success',is_error:false,session_id:args[args.indexOf(flag)+1],
        modelUsage:{[REVIEW_MODEL]:{}},structured_output:{verdict:'approved',summary:'Fixture approved',findings:[]}}));
      child.emit('close',0);
    });return child;
  };
  await oldRunner.runReview(project,{}, {spawn:fake}); // simulated CLI, never live ChatGPT/Claude
  const stateFile=path.join(project,'.harness/runtime/plan-review/state.json'), before=fs.readFileSync(stateFile,'utf8');
  assert.equal(JSON.parse(before).review_history,undefined,'real released state has no new author metadata');
  assert(upgradeFrom.has('1.6.3'));
  assert.equal(install({project,update:true}).upgraded,true);
  assert.equal(fs.readFileSync(stateFile,'utf8'),before,'installer preserves policy, recipient, session and pending review');
  assert.equal(cli('status').version,VERSION);
  assert.throws(()=>cli('review:prepare','--input','.harness/runtime/input.json'),e=>String(e.stdout).includes('REVIEW_RESPONSE'));
  const position={round:1,disposition:'accept',position:'Принимаю согласие: получатель и позиция сохраняются согласно docs/planning/review.md. Новых решений и существенных разногласий нет.'};
  write('.harness/runtime/position.json',position);
  const author=cli('review:respond','--input','.harness/runtime/position.json');
  assert.equal(author.round,1);assert.equal(author.review_history.length,1);
  assert.throws(()=>cli('review:publish'),e=>String(e.stdout).includes('REVIEW_STALE'),'upgrade changed HEAD, so prior approval cannot silently publish');
  const prepared=cli('review:prepare','--input','.harness/runtime/input.json');
  assert.equal(prepared.recipient_session_id,input.recipient_session_id);
  const second=await runReview(project,{}, {spawn:fake});
  assert.equal(second.claude_session_id,JSON.parse(before).claude_session_id);assert.equal(second.round,2);
  write('.harness/runtime/position.json',{...position,round:2});cli('review:respond','--input','.harness/runtime/position.json');
  assert.equal(cli('review:publish').ok,true);
  cli('task:start','T001');assert.equal(cli('review:status').cleanup_status,'done');
  assert.equal(fs.existsSync(path.join(project,spec)),true);
});

test('real 1.5.6 task start survives kit-update and new-runtime task commit', t => {
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'kit-156-transition-'));
  t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
  const source=fileURLToPath(new URL('..',import.meta.url)), old=path.join(root,'old'), project=path.join(root,'project');
  fs.mkdirSync(old);fs.mkdirSync(project);
  const env={...process.env,GIT_AUTHOR_NAME:'Fixture',GIT_AUTHOR_EMAIL:'fixture@example.invalid',GIT_COMMITTER_NAME:'Fixture',GIT_COMMITTER_EMAIL:'fixture@example.invalid'};
  for(const key of ['GIT_DIR','GIT_INDEX_FILE','GIT_WORK_TREE','GIT_COMMON_DIR'])delete env[key];
  // Immutable released runtime, independent of the checkout's future installed Kit.
  const archive=execFileSync('git',['archive','ab6d3d99e5da577d45bfc3b78575f201817948b0','.harness/kit'],{cwd:source,maxBuffer:8*1024*1024});
  execFileSync('tar',['-x','-C',old],{input:archive});
  const run=(exe,args)=>execFileSync(exe,args,{cwd:project,env,encoding:'utf8',maxBuffer:4*1024*1024});
  run('git',['init','-q','-b','main']);
  const cli=(...args)=>{const value=JSON.parse(run(process.execPath,['scripts/workflow.mjs',...args]));assert.equal(value.ok,true);return value;};
  run(process.execPath,[path.join(old,'.harness/kit/install.mjs'),'--project',project]);cli('install:commit');
  assert.equal(JSON.parse(fs.readFileSync(path.join(project,'.harness/kit-manifest.json'))).version,'1.5.6');
  fs.mkdirSync(path.join(project,'docs/planning'),{recursive:true});
  fs.writeFileSync(path.join(project,'docs/planning/transition.md'),'# Transition\n');
  fs.writeFileSync(path.join(project,'.harness/runtime/input.json'),JSON.stringify({id:'upgrade-156',objective:'Upgrade active task',spec:'docs/planning/transition.md',tasks:[
    {id:'T006',title:'Upgrade',files:['docs/planning/transition.md'],commit:'docs: transition'},
    {id:'T007',title:'Continue',files:['docs/planning/transition.md'],dependencies:['T006'],commit:'docs: continue'}]}));
  cli('plan:create','--input','.harness/runtime/input.json');cli('task:start','T006');
  fs.appendFileSync(path.join(project,'docs/planning/transition.md'),'\nChange owned by T006 before upgrade.\n');
  assert(upgradeFrom.has('1.5.6'));
  assert(upgradeFrom.has('1.6.1'),'last released Kit remains upgradeable');
  assert.equal(install({project,update:true}).ok,true);
  assert.match(run('git',['log','-1','--format=%B']),/Workflow-Role: kit-update/);
  assert.equal(JSON.parse(fs.readFileSync(path.join(project,'.harness/kit-manifest.json'))).version,VERSION);
  cli('commit','--task','T006');
  const plan=readPlan(project), refs=resolveReferences(project,plan);
  assert.equal(plan.tasks.find(t=>t.id==='T006').commit_status,'DONE');
  assert.match(refs.T006.sha,/^[a-f0-9]{40}$/);
  assert(plan.tasks.find(t=>t.id==='T006').actual_files.includes('docs/planning/transition.md'));
  cli('task:start','T007');
  assert.equal(readPlan(project).current_task_id,'T007');
});

test('install --update refuses commit preconditions before writing runtime or manifest', t => {
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'kit-update-preflight-'));
  t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
  const source=fileURLToPath(new URL('..',import.meta.url)), old=path.join(root,'old'), project=path.join(root,'project');
  fs.mkdirSync(old);fs.mkdirSync(project);
  const env={...process.env,GIT_AUTHOR_NAME:'Fixture',GIT_AUTHOR_EMAIL:'fixture@example.invalid',GIT_COMMITTER_NAME:'Fixture',GIT_COMMITTER_EMAIL:'fixture@example.invalid'};
  for(const key of ['GIT_DIR','GIT_INDEX_FILE','GIT_WORK_TREE','GIT_COMMON_DIR'])delete env[key];
  const archive=execFileSync('git',['archive','ab6d3d99e5da577d45bfc3b78575f201817948b0','.harness/kit'],{cwd:source,maxBuffer:8*1024*1024});
  execFileSync('tar',['-x','-C',old],{input:archive});
  const run=(exe,args)=>execFileSync(exe,args,{cwd:project,env,encoding:'utf8',maxBuffer:4*1024*1024});
  run('git',['init','-q','-b','main']);
  run(process.execPath,[path.join(old,'.harness/kit/install.mjs'),'--project',project]);
  run(process.execPath,['scripts/workflow.mjs','install:commit']);
  const manifest=path.join(project,'.harness/kit-manifest.json'), core=path.join(project,'.harness/kit/WORKFLOW.md');
  const before={manifest:fs.readFileSync(manifest,'utf8'),core:fs.readFileSync(core,'utf8'),head:run('git',['rev-parse','HEAD'])};
  fs.writeFileSync(path.join(project,'foreign.txt'),'staged by the user\n');run('git',['add','foreign.txt']);
  assert.throws(()=>install({project,update:true}),{code:'FOREIGN_STAGED'});
  assert.equal(fs.readFileSync(manifest,'utf8'),before.manifest,'manifest is not written');
  assert.equal(fs.readFileSync(core,'utf8'),before.core,'runtime is not written');
  assert.equal(run('git',['rev-parse','HEAD']),before.head);
  run('git',['reset','-q','foreign.txt']);
  const upgraded=install({project,update:true});
  assert.equal(upgraded.upgraded,true);
  assert.equal(JSON.parse(fs.readFileSync(manifest,'utf8')).version,VERSION);
  assert.match(run('git',['log','-1','--format=%B']),/Workflow-Role: kit-update/);
});
