import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { EventEmitter } from 'node:events';
import { install } from '../src/lib/installer.mjs';
import { readReview, setReviewEnabled, prepareReview, saveReview, publishReview, resolveReview, cancelReview } from '../src/lib/plan-review.mjs';
import { createScope, repair, startTask } from '../src/lib/actions.mjs';
import { createSimplePlan } from '../src/lib/simple-workflow.mjs';
import { readPlan } from '../src/lib/plan.mjs';
import { locked } from '../src/lib/transaction.mjs';
import { localPath } from '../src/lib/git.mjs';
import { runReview, parseVerdict, REVIEW_MODEL } from '../src/lib/claude-review.mjs';
const roots=[];
const git=(r,...args)=>execFileSync('git',args,{cwd:r,encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
const write=(r,p,v)=>{fs.mkdirSync(path.dirname(path.join(r,p)),{recursive:true});fs.writeFileSync(path.join(r,p),v);};
function fixture() {
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'kit-review-'));roots.push(root);
  git(root,'init','-b','main');git(root,'config','user.name','Review Test');git(root,'config','user.email','review@test.local');
  write(root,'README.md','# Test\n');git(root,'add','README.md');git(root,'commit','-m','baseline');
  install({project:root,mode:'existing'});
  write(root,'docs/planning/review.md','# Review fixture\n');
  const scope={scope_id:'review-fixture',objective:'Test reviewed publication',approval_note:'User requests fixture plan',acceptance_criteria:['Correct plan'],
    approved_scope:{functional_paths:[],documentation_paths:['docs/planning/review.md','README.md']},
    context_pack:{documents:[{path:'docs/planning/review.md',required:true}],include_last_completed_task:false,dependency_task_ids:[]},
    tasks:[{id:'T001',title:'Update documentation',why:'Test task',functional_paths:[],documentation_paths:['README.md'],verification_ids:[],acceptance_criteria:['Done'],expected_commit_message:'docs: fixture'}]};
  return {root,scope,input:{scope,documents:['docs/planning/review.md']}};
}
const expect=(code,fn)=>assert.throws(fn,e=>e.code===code);
const state=(r,changes)=>locked(r,()=>saveReview(r,{...readReview(r),...changes}));
try {
  {
    const {root,scope,input}=fixture();
    assert.equal(readReview(root).enabled,false);
    setReviewEnabled(root,true);
    const config=fs.readFileSync(path.join(root,'.harness/workflow.json'),'utf8');
    expect('REVIEW_REQUIRED',()=>createSimplePlan(root,{id:'simple',spec:'docs/planning/review.md',checks:[],tasks:[]}));
    assert.equal(fs.readFileSync(path.join(root,'.harness/workflow.json'),'utf8'),config);
    expect('REVIEW_REQUIRED',()=>createScope(root,scope));
    const prepared=prepareReview(root,input);assert.equal(prepared.stage,'PREPARED');
    assert.equal(prepareReview(root,input).run_id,prepared.run_id);
    write(root,'README.md','# Unrelated dirty documentation\n');
    state(root,{stage:'AGREED'});
    const result=publishReview(root);assert.equal(result.ok,true);
    assert.equal(readReview(root).stage,'PUBLISHED');
    assert.equal(readPlan(root).scope_id,scope.scope_id);
    assert.equal(git(root,'show','HEAD:README.md'),'# Test');
    assert.equal(git(root,'show','HEAD:docs/planning/review.md'),'# Review fixture');
    assert.equal(fs.readFileSync(path.join(root,'.harness/workflow.json'),'utf8'),config);
    assert.equal(publishReview(root).already_published,true);
  }
  for (const mode of ['normal','already-removed','symlink','off']) {
    const {root,scope,input}=fixture();setReviewEnabled(root,true);
    const prepared=prepareReview(root,input), dir=path.join(root,'.harness/runtime/plan-review',prepared.run_id);
    state(root,{stage:mode==='off'?'NEEDS_USER':'AGREED'});
    if(mode==='off'){setReviewEnabled(root,false);createScope(root,scope);}else publishReview(root);
    const sibling=path.join(root,'.harness/runtime/plan-review/old-experiment');fs.mkdirSync(sibling);
    fs.writeFileSync(path.join(sibling,'keep.txt'),'keep');
    assert.ok(fs.existsSync(dir),'publication retains review');
    if(mode==='already-removed')fs.rmSync(dir,{recursive:true});
    if(mode==='symlink')fs.symlinkSync(sibling,path.join(dir,'foreign'));
    const result=startTask(root,'T001');
    assert.equal(readPlan(root).current_task_id,'T001');
    if(mode==='symlink'){
      assert.equal(readReview(root).cleanup_status,'failed');assert.ok(result.facts.review_cleanup_error);
      assert.ok(fs.existsSync(path.join(sibling,'keep.txt')));
      fs.unlinkSync(path.join(dir,'foreign'));
    }
    startTask(root,'T001');
    assert.equal(readReview(root).cleanup_status,'done');assert.equal(fs.existsSync(dir),false);
    assert.ok(fs.existsSync(path.join(sibling,'keep.txt')));
    assert.ok(fs.existsSync(path.join(root,'docs/planning/review.md')));
    assert.equal(readReview(root).documents,undefined,'no retained review archive');
  }
  {
    const {root,input}=fixture();setReviewEnabled(root,true);prepareReview(root,input);state(root,{stage:'AGREED'});
    write(root,'docs/planning/review.md','# Changed after agreement\n');
    expect('REVIEW_STALE',()=>publishReview(root));assert.equal(readPlan(root).execution_scope_status,'NONE');
    state(root,{stage:'NEEDS_USER'});expect('REVIEW_RESOLUTION',()=>resolveReview(root,'publish',''));
    resolveReview(root,'cancel','User cancels');assert.equal(readReview(root).stage,'CANCELLED');
    prepareReview(root,input);state(root,{stage:'NEEDS_USER'});resolveReview(root,'retry','User requests retry');
    assert.equal(readReview(root).stage,'PREPARED');cancelReview(root,'User cancels again');
  }
  {
    const {root,scope,input}=fixture();setReviewEnabled(root,true);prepareReview(root,input);state(root,{stage:'NEEDS_USER'});
    setReviewEnabled(root,false);
    assert.equal(createScope(root,scope).ok,true,'OFF frees even a disputed plan');
    assert.equal(readReview(root).stage,'PUBLISHED');
  }
  {
    const {root,input}=fixture();setReviewEnabled(root,true);prepareReview(root,input);state(root,{stage:'AGREED'});
    process.env.WORKFLOW_TEST_FAILPOINT='committed';
    try {expect('TEST_INTERRUPTION',()=>publishReview(root));}finally{delete process.env.WORKFLOW_TEST_FAILPOINT;}
    expect('TRANSACTION_PENDING',()=>publishReview(root));
    repair(root,repair(root).repair_id);assert.equal(publishReview(root).already_published,true);
    assert.equal(readReview(root).stage,'PUBLISHED');
  }
  {
    const {root,input}=fixture();setReviewEnabled(root,true);prepareReview(root,input);state(root,{stage:'AGREED'});
    write(root,'README.md','# staged foreign\n');git(root,'add','README.md');
    expect('FOREIGN_STAGED',()=>publishReview(root));
    git(root,'reset','HEAD','--','README.md');
    assert.equal(publishReview(root).ok,true,'retry after pre-transaction failure');
  }
  {
    const {root,input}=fixture();setReviewEnabled(root,true);prepareReview(root,input);
    const calls=[];
    const fake=(verdict,{timeout=false,badSession=false}={})=>(command,args,options)=>{
      assert.equal(fs.existsSync(localPath(root,'operation.lock')),false,'Claude spawn must not hold Kit lock');
      assert.equal(options.shell,false);assert.equal(options.cwd,root);
      calls.push(args);
      const child=new EventEmitter();child.stdin=new EventEmitter();
      child.kill=()=>queueMicrotask(()=>child.emit('close',null));
      child.stdin.end=request=>{
        assert.match(request,/Нормализованный to-do plan/);
        if(timeout)return;
        queueMicrotask(()=>{
          const i=args.indexOf('--resume')>=0?args.indexOf('--resume'):args.indexOf('--session-id');
          fs.writeSync(options.stdio[1],JSON.stringify({subtype:'success',is_error:false,session_id:badSession?'wrong':args[i+1],modelUsage:{[REVIEW_MODEL]:{}},structured_output:verdict}));
          child.emit('close',0);
        });
      };
      return child;
    };
    const changes={verdict:'changes_requested',summary:'Исправить зависимость',findings:[{id:'F1',severity:'major',status:'open',reason:'Задача использует ещё не созданный файл.'}]};
    const approval={verdict:'approved',summary:'Согласовано',findings:[]};
    const first=await runReview(root,{}, {spawn:fake(changes)});
    assert.equal(first.stage,'AUTHOR_PENDING');assert.equal(first.round,1);
    assert.ok(calls[0].includes('--session-id'));
    assert.equal(fs.readFileSync(path.join(first.run_directory,first.review_file),'utf8').includes('F1'),true);
    prepareReview(root,{...input,response:'Согласен, зависимость уточнена.'});
    const second=await runReview(root,{}, {spawn:fake(approval)});
    assert.equal(second.stage,'AGREED');assert.equal(second.claude_session_id,first.claude_session_id);
    assert.equal(calls[1][calls[1].indexOf('--resume')+1],first.claude_session_id);
    prepareReview(root,{...input,response:'Дополнительная проверка.'});
    const third=await runReview(root,{}, {spawn:fake(approval,{badSession:true})});
    assert.equal(third.stage,'NEEDS_USER');assert.equal(third.error.code,'REVIEW_SESSION');
    resolveReview(root,'retry','Пользователь разрешил повтор');
    const fourth=await runReview(root,{timeoutMs:100}, {spawn:fake(approval,{timeout:true})});
    assert.equal(fourth.stage,'NEEDS_USER');assert.equal(fourth.error.code,'REVIEW_TIMEOUT');
    resolveReview(root,'retry','Ещё один раунд по решению пользователя');
    const fifth=await runReview(root,{}, {spawn:fake(changes)});
    assert.equal(fifth.stage,'NEEDS_USER');assert.equal(fifth.error.code,'REVIEW_ROUND_LIMIT');
    assert.equal(fs.existsSync(localPath(root,'operation.lock')),false);
    expect('REVIEW_FORMAT',()=>parseVerdict({structured_output:{...approval,findings:changes.findings}}));
  }
  console.log('Plan review fixtures: publication, OFF, SHA, retry, cancellation, crash recovery, foreign changes passed.');
} finally {for(const root of roots)fs.rmSync(root,{recursive:true,force:true});}
