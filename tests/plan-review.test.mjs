import test from 'node:test';
import assert from 'node:assert/strict';
import { PlanReviewClient } from '../src/plan-review.mjs';

test('Review policy belongs to checkout, survives selection changes and rejects a stale IPC target',()=>{
  const states=new Map();let selected={workspace:'/project-a'},changed=0;
  const client=new PlanReviewClient({selected:()=>selected,onChange:()=>changed++,supports:()=>true,
    read:r=>states.get(r)??{enabled:false,stage:'IDLE'},write:(r,enabled)=>states.set(r,{...states.get(r),enabled,stage:'IDLE'})});
  client.observeSelection();assert.equal(client.view().enabled,false);
  client.setEnabled({workspace:'/project-a',enabled:true});assert.equal(client.view().enabled,true);
  selected={workspace:'/project-b'};client.observeSelection();assert.equal(client.view().enabled,false);
  assert.throws(()=>client.setEnabled({workspace:'/project-a',enabled:false}),{code:'REVIEW_SELECTION_CHANGED'});
  selected={workspace:'/project-a'};client.observeSelection();assert.equal(client.view().enabled,true);
  const before=changed;client.refresh();assert.equal(changed,before,'same state must not loop publish');
  const restored=new PlanReviewClient({selected:()=>selected,supports:()=>true,read:r=>states.get(r)});
  restored.observeSelection();assert.equal(restored.view().enabled,true);
  states.set('/project-a',{enabled:true,stage:'NEEDS_USER',round:4,max_rounds:4,error:{message:'Остался спор'}});
  client.refresh();assert.match(client.view().message,/Раунд 4 из 4/);assert.match(client.view().message,/Остался спор/);
  client.setEnabled({workspace:'/project-a',enabled:false});assert.equal(client.view().message,'');
});

test('old Kit and unreadable state are visible errors, not silently disabled review',()=>{
  const selected=()=>({workspace:'/fixture'});
  const old=new PlanReviewClient({selected,supports:()=>false});old.observeSelection();
  assert.match(old.view().error,/обновите Workflow Kit/);assert.equal(old.view().supported,false);
  const broken=new PlanReviewClient({selected,supports:()=>true,read:()=>{throw Error('Unreadable state');}});broken.observeSelection();
  assert.equal(broken.view().error,'Unreadable state');
  assert.throws(()=>broken.setEnabled({workspace:'/fixture',enabled:false}),{code:'REVIEW_UNAVAILABLE'});
});
