import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { WorkspaceSessions } from '../src/workspace-session.mjs';
import { WorkspaceDeletion } from '../src/workspace-deletion.mjs';

async function fixture(t) {
  const root = await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(), 'web-pilot-delete-test-')));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const store = new WorkspaceSessions(path.join(root, 'app/workspaces.json'));
  const service = new WorkspaceDeletion({ store, journalDir: path.join(root, 'app/deletions') });
  const project = async name => {
    const folder = path.join(root, name);
    await fs.mkdir(path.join(folder, '.harness/plans'), { recursive: true }); await fs.mkdir(path.join(folder, 'scripts'));
    const plan = { schema_version: 1, project_id: name, project_name: name, plan_revision: 1, tasks: [] };
    await fs.writeFile(path.join(folder, '.harness/plans/todo-plan.md'), '<!-- workflow-state:begin -->\n```json\n' + JSON.stringify(plan) + '\n```\n<!-- workflow-state:end -->');
    await fs.writeFile(path.join(folder, 'scripts/workflow.mjs'), ''); await fs.writeFile(path.join(folder, 'my-file.txt'), 'keep until confirmed');
    await store.select(folder); return folder;
  };
  return { root, store, service, project };
}

test('confirmed archive deletion removes files, all local sessions and backup references, preserving outside symlink targets', async t => {
  const { root, store, service, project } = await fixture(t); const a = await project('Удаляемый'), b = await project('Соседний');
  await store.newChat(a); await store.bindChat(a, store.project(a).sessionId, 'https://chatgpt.com/c/keep-cloud-chat');
  await fs.symlink(b, path.join(a, 'outside-link'));
  await fs.writeFile(store.file + '.v2-backup', JSON.stringify(store.snapshot()));
  await fs.writeFile(path.join(root, 'app/diagnostics.jsonl'), [a, b].map(workspace => JSON.stringify({ workspace })).join('\n') + '\n');
  await store.setArchived(a, true); const p = await service.preview(a);
  assert.equal(p.sessionCount, 2); assert.ok(p.bytes > 0); assert.equal(await fs.readFile(path.join(a, 'my-file.txt'), 'utf8'), 'keep until confirmed');
  await assert.rejects(service.apply(p.token, 'wrong'), { code: 'DELETE_CONFIRMATION' });
  await service.apply(p.token, 'Удаляемый');
  await assert.rejects(fs.stat(a), { code: 'ENOENT' }); assert.ok(await fs.stat(b)); assert.equal(store.project(a), null);
  assert.equal(store.selected().workspace, b); assert.equal((await fs.readdir(service.journalDir)).length, 0);
  assert.equal(JSON.parse(await fs.readFile(store.file + '.v2-backup')).projects.length, 1);
  assert.deepEqual(JSON.parse((await fs.readFile(path.join(root, 'app/diagnostics.jsonl'), 'utf8')).trim()), { workspace: b });
});

test('active, protected, nested, replaced and symlink roots cannot be deleted', async t => {
  const { root, store, service, project } = await fixture(t); const a = await project('A');
  await assert.rejects(service.preview(a), { code: 'PROJECT_NOT_ARCHIVED' }); await store.setArchived(a, true);
  service.protectedPaths = [path.join(a, 'scripts')]; await assert.rejects(service.preview(a), { code: 'DELETE_PROTECTED' }); service.protectedPaths = [];
  const b = await project('B'); const item = store.data.projects.find(p => p.workspace === b); item.workspace = path.join(a, 'nested');
  await assert.rejects(service.preview(a), { code: 'DELETE_NESTED_PROJECT' }); item.workspace = b;
  const planFile = path.join(a, '.harness/plans/todo-plan.md'); const plan = await fs.readFile(planFile, 'utf8');
  await fs.writeFile(planFile, plan.replace('"project_id":"A"', '"project_id":"replacement"'));
  await assert.rejects(service.preview(a), { code: 'PROJECT_REPLACED' }); await fs.writeFile(planFile, plan);
  await fs.rename(a, path.join(root, 'original')); await fs.symlink(b, a);
  await assert.rejects(service.preview(a), { code: 'DELETE_PATH_CHANGED' }); assert.ok(await fs.stat(b));
});

test('cancelled and stale confirmations cannot delete changed files or a replacement folder', async t => {
  const { root, store, service, project } = await fixture(t); const a = await project('A'); await store.setArchived(a, true);
  let p = await service.preview(a); service.clear(); await assert.rejects(service.apply(p.token, p.name), { code: 'DELETE_PREVIEW_EXPIRED' });
  p = await service.preview(a); await fs.writeFile(path.join(a, 'new.txt'), 'new work');
  await assert.rejects(service.apply(p.token, p.name), { code: 'DELETE_PREVIEW_CHANGED' });
  p = await service.preview(a); await fs.rename(a, path.join(root, 'saved-original')); await fs.mkdir(a);
  await assert.rejects(service.apply(p.token, p.name)); assert.ok(await fs.stat(a)); assert.ok(await fs.stat(path.join(root, 'saved-original')));
});

test('interrupted local metadata cleanup resumes without deleting a replacement at the old path', async t => {
  const { store, service, project } = await fixture(t); const a = await project('A'); await store.setArchived(a, true);
  const original = store.forgetArchived.bind(store); store.forgetArchived = async () => { throw new Error('disk failure'); };
  const p = await service.preview(a); await assert.rejects(service.apply(p.token, p.name), /disk failure/);
  assert.equal(service.isPending(a), true); await assert.rejects(fs.stat(a), { code: 'ENOENT' }); assert.ok(store.project(a).archivedAt);
  await fs.mkdir(a); await fs.writeFile(path.join(a, 'replacement.txt'), 'preserve'); store.forgetArchived = original;
  const restarted = new WorkspaceDeletion({ store, journalDir: service.journalDir }); assert.deepEqual(await restarted.recover(), []);
  assert.equal(store.project(a), null); assert.equal(await fs.readFile(path.join(a, 'replacement.txt'), 'utf8'), 'preserve');
});

test('an already missing archived folder requires explicit confirmation to clear local history', async t => {
  const { store, service, project } = await fixture(t); const a = await project('A'); await store.setArchived(a, true); await fs.rm(a, { recursive: true });
  const p = await service.preview(a); assert.equal(p.missing, true); assert.ok(store.project(a));
  await service.apply(p.token, p.name); assert.equal(store.project(a), null);
});

test('recovery completes a confirmed rename interrupted before recording removal stage', async t => {
  const { store, service, project } = await fixture(t); const a = await project('A'); await store.setArchived(a, true);
  service.saveJob = async () => { throw new Error('interrupted'); };
  const p = await service.preview(a); await assert.rejects(service.apply(p.token, p.name), /interrupted/);
  const journal = JSON.parse(await fs.readFile(path.join(service.journalDir, (await fs.readdir(service.journalDir))[0])));
  assert.equal(journal.stage, 'confirmed'); assert.ok(await fs.stat(journal.quarantine));
  const restarted = new WorkspaceDeletion({ store, journalDir: service.journalDir }); assert.deepEqual(await restarted.recover(), []);
  await assert.rejects(fs.stat(journal.quarantine), { code: 'ENOENT' }); assert.equal(store.project(a), null);
});
