import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { install } from '../resources/workflow-kit/lib/installer.mjs';
import { inspectProject, repairProject } from '../resources/project-doctor/core.mjs';
import { backupAndWrite, readFile } from '../resources/project-doctor/files.mjs';
import { WorkspaceSetup } from '../src/workspace-setup.mjs';
import { gitPath } from '../resources/workflow-kit/lib/git.mjs';
const env = { ...process.env, GIT_AUTHOR_NAME: 'Doctor Test', GIT_AUTHOR_EMAIL: 'doctor@example.invalid', GIT_COMMITTER_NAME: 'Doctor Test', GIT_COMMITTER_EMAIL: 'doctor@example.invalid' };
function fixture(t) {
  const parent = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'web-pilot-doctor-test-')));
  t.after(() => fs.rmSync(parent, { recursive: true, force: true }));
  const root = path.join(parent, 'Проект'); fs.mkdirSync(root);
  execFileSync('git', ['init','-b','main'], { cwd: root, env });
  execFileSync('git', ['config','user.name','Doctor Test'], { cwd: root });
  execFileSync('git', ['config','user.email','doctor@example.invalid'], { cwd: root });
  install({ project: root, mode: 'existing' });
  return root;
}
const text = (root, name) => fs.readFileSync(path.join(root,name),'utf8');
function stale(root) {
  const file = path.join(root,'.harness/kit-manifest.json'), data=JSON.parse(fs.readFileSync(file));
  data.version='1.2.0'; for(const e of data.files.filter(e=>e.kind==='owned'))e.hash='0'.repeat(64);
  fs.writeFileSync(file,JSON.stringify(data,null,2)+'\n'); return fs.readFileSync(file);
}
test('stale manifest repaired from trusted complete kit, backup and user staging preserved, repeat is no-op', async t => {
  const root=fixture(t), original=stale(root), plan=text(root,'.harness/plans/todo-plan.md');
  fs.writeFileSync(path.join(root,'user.txt'),'user work');execFileSync('git',['add','user.txt'],{cwd:root});
  const index=fs.readFileSync(gitPath(root,'index')), head=execFileSync('git',['rev-parse','HEAD'],{cwd:root});
  const before=inspectProject(root);assert.equal(before.issues.length,0,JSON.stringify(before.issues));assert.ok(before.repairs.length);
  assert.deepEqual(fs.readFileSync(path.join(root,'.harness/kit-manifest.json')),original);
  const repaired=repairProject(root,before.fingerprint);assert.equal(repaired.issues.length,0);assert.ok(repaired.backupPath);
  const journal=JSON.parse(fs.readFileSync(path.join(repaired.backupPath,'repair.json')));
  const backup=journal.entries.find(e=>e.file.endsWith('kit-manifest.json'));
  assert.deepEqual(fs.readFileSync(path.join(repaired.backupPath,backup.backup)),original);
  assert.deepEqual(fs.readFileSync(gitPath(root,'index')),index);assert.deepEqual(execFileSync('git',['rev-parse','HEAD'],{cwd:root}),head);
  assert.equal(text(root,'.harness/plans/todo-plan.md'),plan);assert.equal(text(root,'user.txt'),'user work');
  assert.equal((await new WorkspaceSetup({environment:env}).preview({mode:'existing',workspace:root})).ready,true);
  assert.equal(repairProject(root).repaired,false);
});
test('missing owned file and hooks restored, command permissions repaired', async t=>{
  const root=fixture(t);fs.unlinkSync(path.join(root,'.harness/kit/lib/recovery.mjs'));fs.unlinkSync(gitPath(root,'hooks/pre-commit'));
  if(process.platform!=='win32')fs.chmodSync(path.join(root,'scripts/workflow'),0o644);
  const result=repairProject(root);assert.equal(result.issues.length,0,JSON.stringify(result.issues));assert.ok(result.repairs.length>=2);
  assert.equal((await new WorkspaceSetup({environment:env}).preview({mode:'existing',workspace:root})).ready,true);
});
test('unknown modification blocks all writes even with stale manifest', t=>{
  const root=fixture(t), original=stale(root), file=path.join(root,'.harness/kit/lib/common.mjs');fs.appendFileSync(file,'\n// unknown change\n');
  const content=fs.readFileSync(file);const r=repairProject(root);assert.ok(r.issues.length);assert.equal(r.backupPath,undefined);
  assert.deepEqual(fs.readFileSync(file),content);assert.deepEqual(fs.readFileSync(path.join(root,'.harness/kit-manifest.json')),original);
});
test('unknown extra runtime file blocks reconciliation',t=>{
  const root=fixture(t);stale(root);fs.writeFileSync(path.join(root,'.harness/kit/extra.mjs'),'throw Error("never execute")');
  assert.ok(repairProject(root).issues.some(e=>e.path.includes('extra.mjs')));
});
test('broken manifest and semantic plan do not get guessed',t=>{
  const root=fixture(t), mf=path.join(root,'.harness/kit-manifest.json'),original=fs.readFileSync(mf);
  fs.writeFileSync(mf,'{');assert.ok(repairProject(root).issues.length);assert.equal(fs.readFileSync(mf,'utf8'),'{');
  fs.writeFileSync(mf,original);fs.writeFileSync(path.join(root,'.harness/plans/todo-plan.md'),'lost plan');assert.ok(repairProject(root).issues.length);
});
test('readable projection rebuilt from valid canonical plan only',t=>{
  const root=fixture(t),file=path.join(root,'.harness/plans/todo-plan.md'),original=fs.readFileSync(file,'utf8');
  fs.writeFileSync(file,original+'\nwrong projection\n');const r=repairProject(root);assert.equal(r.issues.length,0,JSON.stringify(r.issues));assert.equal(fs.readFileSync(file,'utf8'),original);
});
test('changed snapshot rejected and modified hook preserved',t=>{
  const root=fixture(t);stale(root);const before=inspectProject(root);fs.appendFileSync(path.join(root,'docs/PRODUCT.md'),'\nnew user text');
  assert.throws(()=>repairProject(root,before.fingerprint),{code:'DOCTOR_CHANGED'});
  const hook=gitPath(root,'hooks/pre-commit');fs.writeFileSync(hook,fs.readFileSync(hook,'utf8').replace('git-hook pre-commit','git-hook changed'));
  assert.ok(repairProject(root).issues.some(e=>e.path==='Git/pre-commit'));
});
test('symlink target never read or overwritten', {skip:process.platform==='win32'},t=>{
  const root=fixture(t),file=path.join(root,'.harness/kit/lib/common.mjs'),outside=path.join(path.dirname(root),'outside');fs.writeFileSync(outside,'PRIVATE');fs.unlinkSync(file);fs.symlinkSync(outside,file);
  assert.ok(repairProject(root).issues.some(e=>e.code==='DOCTOR_SYMLINK'));assert.equal(fs.readFileSync(outside,'utf8'),'PRIVATE');
});
test('write failure rolls back already written files and leaves recovery backup',t=>{
  const root=fixture(t),first=path.join(root,'first.txt'),second=path.join(root,'second.txt');fs.writeFileSync(first,'original');fs.writeFileSync(second,'keep');
  // A late invalid mode makes the second atomic write fail after the first succeeded.
  assert.throws(()=>backupAndWrite(root,[{file:first,content:'changed',mode:0o644,label:'one'},{file:second,content:'change',mode:-1,label:'two'}]));
  assert.equal(readFile(first).content.toString(),'original');assert.equal(readFile(second).content.toString(),'keep');
});
