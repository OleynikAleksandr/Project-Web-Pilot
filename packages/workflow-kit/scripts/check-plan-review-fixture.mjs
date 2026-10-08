import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { install } from '../src/lib/installer.mjs';
import { readReview, setReviewEnabled, prepareReview, saveReview, publishReview, resolveReview, cancelReview } from '../src/lib/plan-review.mjs';
import { createScope, repair } from '../src/lib/actions.mjs';
import { createSimplePlan } from '../src/lib/simple-workflow.mjs';
import { readPlan } from '../src/lib/plan.mjs';
import { locked } from '../src/lib/transaction.mjs';
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
  console.log('Plan review fixtures: publication, OFF, SHA, retry, cancellation, crash recovery, foreign changes passed.');
} finally {for(const root of roots)fs.rmSync(root,{recursive:true,force:true});}
