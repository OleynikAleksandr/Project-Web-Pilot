import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { install, upgradeFrom } from '@webpilot/workflow-kit/lib/installer';
import { VERSION } from '@webpilot/workflow-kit/lib/common';
import { readPlan } from '@webpilot/workflow-kit/lib/plan';
import { resolveReferences } from '@webpilot/workflow-kit/lib/validate';

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
