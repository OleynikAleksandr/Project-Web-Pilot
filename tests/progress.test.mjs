import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { operationLabel, createProgress } from '../src/ui/progress.mjs';
test('operations show stages; idle, errors and user input waits never spin',()=>{
  for(const phase of ['preparing','loading-context','preparing-message','sending','waiting-chat','send-unknown']) {
    assert.ok(operationLabel({context:{phase}}));
  }
  for(const phase of ['delivered','waiting-login','waiting-draft','prepared-stale','error','chat-changed']) {
    assert.equal(operationLabel({context:{phase}}),null);
  }
  assert.equal(operationLabel({pageLoading:true}),'Открываем ChatGPT');
  assert.equal(operationLabel({setup:{phase:'applying'}}),'Подготавливаем проект');
  assert.equal(operationLabel({context:{phase:'delivered'},contextPreparation:{busy:true}}),'Подготавливаем контекст заранее');
  assert.equal(operationLabel({context:{phase:'error'},contextPreparation:{busy:true}}),null);
  assert.equal(operationLabel({context:{phase:'delivered'},tokenHistory:{status:'loading'}}),'Загружаем и считаем всю историю');
  assert.equal(operationLabel({context:{phase:'delivered'},tokenHistory:{status:'error'}}),null);
  assert.equal(operationLabel({},'deleteSessions'),'Удаляем локальные сессии');
  assert.equal(operationLabel({},'restore'),'Восстанавливаем проекты');
  assert.equal(operationLabel({},'chooseParent'),null);
});
test('progress persists timer across re-renders and clears it on completion or disposal',()=>{
  const dom=new JSDOM('<div id="progress" role="status" aria-live="polite"></div>');
  const element=dom.window.document.getElementById('progress');
  let clock=0, tick, schedules=0,cancelled=0;
  const p=createProgress(element,{now:()=>clock,schedule:fn=>{tick=fn;schedules++;return 1;},cancel:()=>cancelled++});
  assert.equal(element.hidden,true);
  p.show('Подготавливаем контекст');assert.equal(element.hidden,false);assert.equal(schedules,1);
  clock=2400;tick();assert.equal(element.querySelector('.operation-elapsed').textContent,'2 с');
  p.show('Подготавливаем контекст');assert.equal(schedules,1);
  p.show('Отправляем контекст');assert.equal(cancelled,1);assert.equal(schedules,2);
  assert.equal(element.querySelector('.operation-elapsed').textContent,'0 с');
  p.show(null);assert.equal(element.hidden,true);assert.equal(cancelled,2);
  p.show('Проверяем папку');p.destroy();assert.equal(cancelled,3);assert.equal(element.hidden,true);
  dom.window.close();
});
