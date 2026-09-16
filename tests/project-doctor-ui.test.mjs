import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { JSDOM } from 'jsdom';
import { projectDoctorView } from '../src/ui/project-doctor.mjs';
import { workspaceSetupView } from '../src/ui/workspace-setup.mjs';
import { projectArchiveView } from '../src/ui/project-archive.mjs';
import { ProjectDoctor } from '../src/project-doctor.mjs';
async function fixture(t, factory=projectDoctorView) {
  const dom=new JSDOM(await fs.readFile(new URL('../src/ui/index.html',import.meta.url),'utf8'));
  const before=globalThis.document;globalThis.document=dom.window.document;
  t.after(()=>{globalThis.document=before;dom.window.close();});
  const calls=[], view=factory((...args)=>calls.push(args));
  return {view,calls,$:id=>dom.window.document.getElementById(id)};
}
const state=()=>({projects:[{workspace:'/one',name:'Первый'},{workspace:'/two',name:'Второй'}],selected:{workspace:'/one'},settings:{workspace:'/one'},context:{},archives:[]});
test('doctor waits for explicit action, selects exact project and reports successful recovery',async t=>{
  const f=await fixture(t);const s=state();f.view.render(s,false);assert.equal(f.calls.length,0);assert.equal(f.$('doctor-actions').hidden,true);
  f.$('doctor-run').click();assert.deepEqual(f.calls,[['runDoctor','/one']]);
  s.doctor={workspace:'/one',phase:'done',projectReady:true,servicesReady:true,issues:[],repairs:['Восстановлена установка'],checks:[{label:'Контекст',ok:true}],backupPath:'/backup'};
  f.view.render(s,false);assert.equal(f.$('doctor-actions').hidden,false);assert.equal(f.$('doctor-backup').hidden,false);
  f.$('doctor-work').click();assert.deepEqual(f.calls.at(-1),['continueDoctor','work']);
  s.doctor={workspace:'/two',phase:'idle'};f.view.render(s,false);assert.equal(f.$('doctor-actions').hidden,true);assert.equal(f.$('doctor-workspace').value,'/two');
});
test('busy run cannot be repeated and unready services never appear as success',async t=>{
  const f=await fixture(t),s=state();s.doctor={workspace:'/one',phase:'repairing'};f.view.render(s,false);
  assert.equal(f.$('doctor-run').disabled,true);assert.equal(f.$('doctor-workspace').disabled,true);
  s.doctor={workspace:'/one',phase:'done',projectReady:true,servicesReady:false,issues:[{path:'Подключение',reason:'<img onerror=alert(1)>'}]};f.view.render(s,false);
  assert.equal(f.$('doctor-actions').hidden,true);assert.equal(f.$('doctor-results').querySelector('img'),null);assert.match(f.$('doctor-results').textContent,/<img/);
});
test('setup offers doctor without a working session and settings remain available',async t=>{
  const f=await fixture(t,workspaceSetupView),s=state();s.setup={phase:'preview',installed:true,workspace:'/broken',issues:[{path:'file',reason:'broken'}]};
  f.view.render(s,false);assert.equal(f.$('setup-doctor').hidden,false);f.$('setup-doctor').click();assert.deepEqual(f.calls,[['openDoctor']]);
  const settings=projectArchiveView(()=>{});settings.render(s,false);assert.equal(f.$('open-settings').disabled,false);
});
function coordinator({worker,health={ready:true,checks:[],issues:[]},services=async()=>{}}={}) {
  const calls=[];const setup={preview:async()=>{calls.push('verify');return health;},apply:async()=>{calls.push('reconnect');return {ready:true,checks:[],issues:[]};}};
  const doctor=new ProjectDoctor({setup,ensureServices:services});doctor.worker=worker??(async workspace=>({workspace,checks:[],repairs:['fixed'],issues:[],backupPath:'/backup'}));return {doctor,calls};
}
test('coordinator rechecks project and connection independently, preserves backup on service failure',async()=>{
  const {doctor,calls}=coordinator({services:async()=>{throw Object.assign(new Error('Настройте подключение'),{code:'TUNNEL_NOT_CONFIGURED'});}});
  const phases=[],r=await doctor.run('/one',s=>phases.push(s.phase));assert.deepEqual(phases,['repairing','verifying','services']);assert.deepEqual(calls,['verify']);assert.equal(r.projectReady,true);assert.equal(r.servicesReady,false);assert.equal(r.backupPath,'/backup');assert.equal(r.issues[0].code,'TUNNEL_NOT_CONFIGURED');
});
test('coordinator never launches project verification after untrusted files, and unlocks on error',async()=>{
  const {doctor,calls}=coordinator({worker:async()=>({issues:[{reason:'unknown runtime'}]})});const r=await doctor.run('/one');assert.equal(r.projectReady,false);assert.deepEqual(calls,[]);assert.equal(doctor.running,false);
  doctor.worker=async()=>{throw new Error('Node missing');};assert.equal((await doctor.run('/one')).issues[0].reason,'Node missing');assert.equal(doctor.running,false);
});
test('coordinator reconnects missing local commands and rejects duplicate runs',async()=>{
  let release;const {doctor,calls}=coordinator({health:{ready:false,action:'reconnect'},worker:()=>new Promise(resolve=>{release=resolve;})});
  const first=doctor.run('/one');await assert.rejects(doctor.run('/one'),/уже работает/);release({workspace:'/one',repairs:[],issues:[]});const r=await first;assert.equal(r.projectReady,true);assert.equal(r.servicesReady,true);assert.deepEqual(calls,['verify','reconnect']);
});
