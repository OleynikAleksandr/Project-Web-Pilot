import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { extractFile } from '@electron/asar';
import { hashFile, sourceSnapshot, verifyPackagedSources } from './release-all.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const { version } = JSON.parse(await fs.readFile(path.join(root, 'package.json'), 'utf8'));
assert.equal(version, '0.6.73');
const delivery = path.join(os.homedir(), 'Downloads', 'WebPilot-' + version);
const manifest = JSON.parse(await fs.readFile(path.join(delivery, 'release-manifest.json'), 'utf8'));
assert.equal(manifest.version, version); assert.equal(manifest.packagedSourceMatches, true);
const sources = await sourceSnapshot(root);
const rootApp = path.join(root, 'Project Web Pilot.app');
const appsApp = '/Applications/Project Web Pilot.app';
const targets = [
  path.join(rootApp, 'Contents/Resources'),
  path.join(appsApp, 'Contents/Resources'),
  path.join(root, '.harness/runtime/build/Project Web Pilot-darwin-arm64/Project Web Pilot.app/Contents/Resources'),
  path.join(root, '.harness/runtime/build/Project Web Pilot-win32-x64/resources'),
];
for (const resources of targets) await verifyPackagedSources({ root, resources, version, sources });
for (const app of [rootApp, appsApp]) {
  assert.equal((await fs.lstat(app)).isSymbolicLink(), false);
  assert.equal(execFileSync('/usr/libexec/PlistBuddy', ['-c', 'Print :CFBundleShortVersionString', path.join(app, 'Contents/Info.plist')], { encoding: 'utf8' }).trim(), version);
}
const preflight = JSON.parse(await fs.readFile(path.join(root, '.harness/runtime/release-073-preflight.json'), 'utf8'));
const appsBefore = preflight.find(item => item.path === appsApp);
const appsAfter = await fs.stat(appsApp);
assert.equal(appsAfter.dev, appsBefore.device); assert.equal(appsAfter.ino, appsBefore.inode);
assert.equal(Object.keys(sources).length, manifest.sourceFiles);
const stat = await fs.stat(rootApp); assert.equal(stat.ino, manifest.identity.inode); assert.equal(stat.dev, manifest.identity.device);
for (const artifact of manifest.artifacts) {
  const zip = path.join(delivery, artifact.file);
  assert.equal(await hashFile(zip), artifact.sha256);
  const prefix = artifact.platform.startsWith('macOS')
    ? 'Project Web Pilot.app/Contents/Resources/' : 'Project Web Pilot-win32-x64/resources/';
  const preload = execFileSync('/usr/bin/unzip', ['-p', zip, prefix + 'resources/chatgpt-page-observer-preload.cjs'], { maxBuffer: 1024 * 1024 });
  assert.deepEqual(preload, await fs.readFile(path.join(targets[0], 'resources/chatgpt-page-observer-preload.cjs')));
}

for (const resources of [targets[0], targets[3]]) {
  const kit = path.join(resources,'resources/workflow-kit');
  const { install } = await import(pathToFileURL(path.join(kit,'lib/installer.mjs')).href);
  const { readPlan } = await import(pathToFileURL(path.join(kit,'lib/plan.mjs')).href);
  const fixture = await fs.mkdtemp(path.join(os.tmpdir(),'web-pilot-carryover-'));
  const run = (exe,args) => execFileSync(exe,args,{cwd:fixture,encoding:'utf8',timeout:30000});
  const cli = (...args) => {
    const result=JSON.parse(run(process.execPath,[path.join(fixture,'scripts/workflow.mjs'),...args]));
    assert.equal(result.ok,true,JSON.stringify(result));return result;
  };
  try {
    run('git',['init','-b','main']);run('git',['config','user.name','Installed Kit Test']);
    run('git',['config','user.email','test@example.invalid']);
    await fs.mkdir(path.join(fixture,'docs/planning'),{recursive:true});
    await fs.writeFile(path.join(fixture,'docs/planning/fixture.md'),'# Installed carryover\n');
    run('git',['add','docs/planning/fixture.md']);run('git',['commit','-m','fixture']);
    assert.equal(install({project:fixture,mode:'existing'}).version,'1.5.1');
    const file=path.join(fixture,'.harness/runtime/input.json');
    await fs.writeFile(file,JSON.stringify({id:'old',spec:'docs/planning/fixture.md',objective:'Installed carryover',
      tasks:[{id:'T001',title:'Remaining',files:['docs/planning/fixture.md'],acceptance:['Retained criterion']}]}));
    cli('plan:create','--input',file);
    const before=await fs.readFile(path.join(fixture,'.harness/plans/todo-plan.md'),'utf8');
    const revision=String(readPlan(fixture).plan_revision);
    await fs.writeFile(file,JSON.stringify({scope:'old',id:'new',approval_note:'Explicit installed test carryover'}));
    cli('plan:carryover','--input',file,'--expected-revision',revision);
    const after=readPlan(fixture);
    assert.deepEqual(after.tasks.map(t=>[t.id,t.implementation_status]),[['T001','TODO'],['DOCS','TODO']]);
    assert.equal(await fs.readFile(path.join(fixture,'.harness/plans/archive/old.md'),'utf8'),before);
    assert.deepEqual(after.tasks[0].acceptance_criteria,['Retained criterion']);
    assert.ok(after.context_pack.documents.some(d=>d.path==='docs/planning/fixture.md' && d.required));
    cli('validate');assert.equal(run('git',['status','--porcelain']).trim(),'');
  } finally {await fs.rm(fixture,{recursive:true,force:true});}
}

const temporary = await fs.mkdtemp(path.join(os.tmpdir(), 'web-pilot-installed-observer-'));
try {
  for (const file of ['page-state.mjs','page-state-bridge.mjs','chatgpt-dom.mjs','chatgpt-composer.mjs','auto-plan.mjs'])
    await fs.writeFile(path.join(temporary, file), extractFile(path.join(targets[0], 'app.asar'), 'src/' + file));
  await fs.writeFile(path.join(temporary, 'progress.mjs'), extractFile(path.join(targets[0], 'app.asar'), 'src/ui/progress.mjs'));
  const { operationLabel } = await import(pathToFileURL(path.join(temporary, 'progress.mjs')).href);
  for (const phase of ['waiting-chat', 'send-unknown'])
    assert.equal(operationLabel({ context: { phase }, contextPreparation: { busy: true } }), null,
      'installed UI has no post-Send progress indicator');
  const require = createRequire(import.meta.url);
  const environment = { ...process.env }; delete environment.ELECTRON_RUN_AS_NODE;
  const result = execFileSync(require('electron'), [path.join(root, 'tests/installed-observer-fixture.cjs'),
    targets[0], temporary, path.join(temporary, 'profile')], {
    encoding: 'utf8', timeout: 30000, maxBuffer: 2 * 1024 * 1024,
    env: environment,
  });
  process.stdout.write(result);
} finally { await fs.rm(temporary, { recursive: true, force: true }); }
console.log(JSON.stringify({ version, delivery, packagedSources: true, installedResourcesExecuted: true,
  nativeWindowsTested: false, liveChatGPT: false }));
