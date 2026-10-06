import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync, spawnSync} from 'node:child_process';
import {installer, plan as planApi} from '@webpilot/workflow-kit';

const root = fs.mkdtempSync(path.join(os.tmpdir(),'workflow-carryover-'));
const git = (...args) => execFileSync('git',args,{cwd:root,encoding:'utf8'}).trim();
function cli(args, expected=true, env={}) {
  const r=spawnSync(process.execPath,[path.join(root,'scripts/workflow.mjs'),...args],
    {cwd:root,encoding:'utf8',env:{...process.env,...env}});
  const value=JSON.parse(r.stdout);
  assert.equal(value.ok,expected,JSON.stringify(value));
  return value;
}
function input(name,value) {
  const file=path.join(root,'.harness/runtime',name+'.json');
  fs.writeFileSync(file,JSON.stringify(value));return file;
}
try {
  git('init','-b','main');git('config','user.name','Workflow Test');git('config','user.email','test@example.invalid');
  fs.mkdirSync(path.join(root,'docs/planning'),{recursive:true});
  fs.writeFileSync(path.join(root,'docs/planning/fixture.md'),'# Carryover fixture\n');
  fs.writeFileSync(path.join(root,'README.md'),'# Fixture\n');
  git('add','README.md','docs/planning/fixture.md');git('commit','-m','fixture');
  installer.install({project:root,mode:'existing'});
  cli(['plan:create','--input',input('plan',{id:'source',spec:'docs/planning/fixture.md',objective:'Carryover fixture',
    tasks:[{id:'T001',title:'Completed',files:['README.md']},
      {id:'T002',title:'Remaining one',files:['README.md'],dependencies:['T001'],acceptance:['Keep criteria']},
      {id:'T003',title:'Remaining two',files:['README.md'],dependencies:['T002']} ]})]);
  const payload=input('transfer',{scope:'source',id:'next',approval_note:'User explicitly requests carryover.'});
  cli(['task:start','T001']);
  let rev=planApi.readPlan(root).plan_revision;
  assert.equal(cli(['plan:carryover','--input',payload,'--expected-revision',String(rev)],false).code,'TASK_ALREADY_ACTIVE');
  fs.appendFileSync(path.join(root,'README.md'),'Done T001\n');cli(['commit','--task','T001']);
  const before=planApi.readPlan(root);
  rev=before.plan_revision;
  const beforeText=fs.readFileSync(path.join(root,'.harness/plans/todo-plan.md'),'utf8');
  const args=['plan:carryover','--input',payload,'--expected-revision',String(rev)];
  const archive=path.join(root,'.harness/plans/archive/source.md');
  const beforeHead=git('rev-parse','HEAD');
  assert.equal(cli([...args.slice(0,-1),String(rev-1)],false).code,'REVISION_CHANGED');
  const unauthorized=input('unauthorized',{scope:'source',id:'next',approval_note:''});
  assert.equal(cli(['plan:carryover','--input',unauthorized,'--expected-revision',String(rev)],false).code,'USER_CLOSE_REQUIRED');
  fs.appendFileSync(path.join(root,'README.md'),'Foreign edit\n');
  assert.equal(cli(args,false).code,'DIRTY_WORKTREE');
  fs.writeFileSync(path.join(root,'README.md'),git('show','HEAD:README.md')+'\n');
  fs.mkdirSync(path.dirname(archive),{recursive:true});fs.writeFileSync(archive,'Existing unrelated archive\n');
  assert.equal(cli(args,false).code,'ARCHIVE_EXISTS');assert.equal(fs.readFileSync(archive,'utf8'),'Existing unrelated archive\n');
  fs.unlinkSync(archive);
  assert.equal(git('rev-parse','HEAD'),beforeHead);
  assert.equal(fs.readFileSync(path.join(root,'.harness/plans/todo-plan.md'),'utf8'),beforeText);
  git('update-index','--refresh'); // Restored test bytes also need a refreshed Git stat cache.
  assert.equal(git('status','--porcelain'),'');
  assert.equal(cli(args,false,{WORKFLOW_TEST_FAILPOINT:'prepared'}).code,'TEST_INTERRUPTION');
  const repair=cli(['repair','--dry-run']);cli(['repair','--apply',repair.repair_id]);
  assert.equal(git('rev-list','--count',beforeHead+'..HEAD'),'1','archive and current use one commit');
  assert.equal(fs.readFileSync(archive,'utf8'),beforeText,'archive preserves exact source including TODO');
  const after=planApi.readPlan(root);
  assert.deepEqual(after.tasks.map(t=>t.id),['T002','T003','DOCS']);
  assert.deepEqual(after.tasks[0].acceptance_criteria,before.tasks[1].acceptance_criteria);
  assert.deepEqual(after.tasks[0].verification_ids,before.tasks[1].verification_ids);
  assert.deepEqual(after.tasks[0].documentation_paths,before.tasks[1].documentation_paths);
  assert.deepEqual(after.tasks[0].dependencies,[]);
  assert.deepEqual(after.tasks[1].dependencies,['T002']);
  assert.deepEqual(after.tasks[2].dependencies,['T002','T003']);
  assert.deepEqual(after.context_pack,before.context_pack);
  assert.deepEqual(after.carryover.completed_dependencies.T002,['T001']);
  assert.ok(after.tasks.every(t=>t.implementation_status==='TODO' && t.commit_ref.scope_id==='next'));
  const transferredHead=git('rev-parse','HEAD');
  assert.equal(cli(args).already_transferred,true);assert.equal(git('rev-parse','HEAD'),transferredHead);
  assert.equal(cli(['archive','--scope','next','--approval-note','Explicit close request'],false).code,'SCOPE_UNFINISHED');
  cli(['validate']);assert.equal(git('status','--porcelain'),'');
  cli(['task:start','T002']);fs.appendFileSync(path.join(root,'README.md'),'Done T002\n');cli(['commit','--task','T002']);
  const second=input('second',{scope:'next',id:'last',approval_note:'Second explicit carryover request.'});
  const secondArgs=['plan:carryover','--input',second,'--expected-revision',String(planApi.readPlan(root).plan_revision)];
  assert.equal(cli(secondArgs,false,{WORKFLOW_TEST_FAILPOINT:'committed'}).code,'TEST_INTERRUPTION');
  const finish=cli(['repair','--dry-run']);cli(['repair','--apply',finish.repair_id]);
  assert.equal(cli(secondArgs).already_transferred,true);
  assert.deepEqual(planApi.readPlan(root).tasks.map(t=>t.id),['T003','DOCS']);
  cli(['validate']);assert.equal(git('status','--porcelain'),'');
  console.log(JSON.stringify({ok:true,carryover:true,exactArchive:true,dependencies:true,guards:true,crashRecovery:true,idempotent:true}));
} finally {fs.rmSync(root,{recursive:true,force:true});}
