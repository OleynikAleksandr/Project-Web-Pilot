import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {belongsToProject,removeProjectSettings,purgeProjectStateFiles} from '../src/project-state-cleanup.mjs';

test('project cleanup removes exact nested delivery owners, preserves neighbours and does not change input',()=>{
  const ids=[{workspace:'/projects/a',projectId:'id-a',sessionIds:['session-a']}];
  const deleted={key:JSON.stringify([JSON.stringify(['/projects/a','session-a','url']),'turn']),status:'sending'};
  const neighbour={key:JSON.stringify(['/projects/ab','other','url']),status:'sending'};
  const settings={theme:'dark',projectAutoPlan:{'/projects/a':{enabled:true},'/projects/ab':{enabled:true}},
    parallelExecutionBook:{a:{workspace:'/projects/a'},b:{workspace:'/projects/ab'}},
    reviewCheckpoint:{entries:[deleted,neighbour],cycles:[{key:JSON.stringify(['/projects/a','session-a'])}],reviewStops:[{key:JSON.stringify(['/projects/a','session-a'])}]},
    automationCheckpoint:{entries:[deleted,neighbour],cycles:[{sessionId:'session-a'}]}};
  const next=removeProjectSettings(settings,ids);
  assert.deepEqual(next.projectAutoPlan,{'/projects/ab':{enabled:true}});assert.deepEqual(next.parallelExecutionBook,{b:{workspace:'/projects/ab'}});
  assert.deepEqual(next.reviewCheckpoint.entries,[neighbour]);assert.deepEqual(next.reviewCheckpoint.cycles,[]);assert.deepEqual(next.reviewCheckpoint.reviewStops,[]);
  assert.deepEqual(next.automationCheckpoint.entries,[neighbour]);assert.deepEqual(next.automationCheckpoint.cycles,[]);
  assert.equal(next.theme,'dark');assert.equal(settings.reviewCheckpoint.entries.length,2);
  assert.equal(belongsToProject('/projects/a extra',ids),false);
});

test('durable cleanup includes settings migration copies, interrupted writes and diagnostic session IDs, preserving browser data',async t=>{
  const dir=await fs.mkdtemp(path.join(os.tmpdir(),'project-cleanup-'));t.after(()=>fs.rm(dir,{recursive:true,force:true}));
  const ids=[{workspace:'/projects/a',projectId:'id-a',sessionIds:['session-a']}];
  const settings={projectAutoPlan:{'/projects/a':{enabled:true},'/b':{enabled:false}},parallelExecutionBook:{a:{workspace:'/projects/a'}},theme:'light'};
  for(const f of ['settings.json','settings.json.v1-backup','settings.json.tmp'])await fs.writeFile(path.join(dir,f),JSON.stringify(settings));
  await fs.mkdir(path.join(dir,'diagnostics'));await fs.mkdir(path.join(dir,'Partitions'));
  await fs.writeFile(path.join(dir,'Partitions','keep'),'/projects/a');
  await fs.writeFile(path.join(dir,'diagnostics','chromium-events.jsonl'),[{sessionId:'session-a'},{sessionId:'other'}].map(JSON.stringify).join('\n')+'\n');
  await purgeProjectStateFiles(dir,ids);await purgeProjectStateFiles(dir,ids);
  assert.equal(JSON.parse(await fs.readFile(path.join(dir,'settings.json'))).projectAutoPlan['/projects/a'],undefined);
  assert.equal(JSON.parse(await fs.readFile(path.join(dir,'settings.json.v1-backup'))).projectAutoPlan['/b'].enabled,false);
  await assert.rejects(fs.stat(path.join(dir,'settings.json.tmp')),{code:'ENOENT'});
  assert.equal((await fs.readFile(path.join(dir,'diagnostics','chromium-events.jsonl'),'utf8')).trim(),JSON.stringify({sessionId:'other'}));
  assert.equal(await fs.readFile(path.join(dir,'Partitions','keep'),'utf8'),'/projects/a');
});

test('startup drops orphan state and delivery keys but retains archived projects and UNKNOWN for existing identities',async()=>{
 const {pruneOrphanProjectSettings}=await import('../src/project-state-cleanup.mjs');
 const saved={projectAutoPlan:{'/gone':{enabled:true},'/kept':{enabled:true,projectId:'kept'}},parallelExecutionBook:{a:{workspace:'/gone'},b:{workspace:'/kept',projectId:'kept',assignments:{a:{phase:'unknown'}}}},
  reviewCheckpoint:{entries:[{key:JSON.stringify(['/gone','s'])},{key:JSON.stringify(['/kept','old'])},{key:JSON.stringify(['/kept','s'])}]}};
 const next=pruneOrphanProjectSettings(saved,[{workspace:'/kept',projectId:'kept',archivedAt:1,sessions:[{sessionId:'s'}]}]);
 assert.deepEqual(Object.keys(next.projectAutoPlan),['/kept']);assert.deepEqual(Object.keys(next.parallelExecutionBook),['b']);assert.equal(next.parallelExecutionBook.b.assignments.a.phase,'unknown');assert.equal(next.reviewCheckpoint.entries.length,1);
});
