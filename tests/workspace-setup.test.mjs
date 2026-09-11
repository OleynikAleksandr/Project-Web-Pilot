import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { WorkspaceSetup } from '../src/workspace-setup.mjs';
const environment = { ...process.env, GIT_AUTHOR_NAME: 'Web Pilot Test', GIT_AUTHOR_EMAIL: 'test@example.invalid', GIT_COMMITTER_NAME: 'Web Pilot Test', GIT_COMMITTER_EMAIL: 'test@example.invalid' };
for (const key of ['GIT_DIR', 'GIT_WORK_TREE', 'GIT_INDEX_FILE', 'GIT_COMMON_DIR', 'GIT_OBJECT_DIRECTORY', 'GIT_ALTERNATE_OBJECT_DIRECTORIES', 'GIT_PREFIX']) delete environment[key];
async function fixture(t) {
  const parent = await fs.mkdtemp(path.join(os.tmpdir(), 'web-pilot-setup-'));
  t.after(() => fs.rm(parent, { recursive: true, force: true }));
  return { parent, setup: new WorkspaceSetup({ environment }) };
}
async function create(t) {
  const f = await fixture(t);
  const preview = await f.setup.preview({ mode: 'new', parent: f.parent, name: 'Новый проект' });
  assert.equal(preview.action, 'install'); assert.equal(preview.installed, false);
  assert.ok(preview.files.some(f => f.path === '.harness/plans/todo-plan.md'));
  await assert.rejects(fs.stat(preview.workspace), { code: 'ENOENT' });
  const result = await f.setup.apply(preview.token);
  assert.equal(result.ready, true, JSON.stringify(result));
  return { ...f, workspace: result.workspace, result };
}
function git(cwd, ...args) { return execFileSync('git', args, { cwd, env: environment, encoding: 'utf8' }).trim(); }

test('create a real empty Workflow Kit project and reopen without changes', async t => {
  const { setup, workspace } = await create(t);
  const config = JSON.parse(await fs.readFile(path.join(workspace, '.harness/workflow.json'), 'utf8'));
  const plan = JSON.parse((await fs.readFile(path.join(workspace, '.harness/plans/todo-plan.md'), 'utf8')).match(/```json\n([\s\S]*?)\n```/)[1]);
  assert.equal(config.profile, 'DISCOVERY'); assert.equal(plan.execution_scope_status, 'NONE'); assert.deepEqual(plan.tasks, []);
  const head = git(workspace, 'rev-parse', 'HEAD');
  const next = await setup.preview({ mode: 'existing', workspace });
  assert.equal(next.action, 'open'); assert.ok(next.checks.every(c => c.ok));
  assert.equal((await setup.apply(next.token)).ready, true);
  assert.equal(git(workspace, 'rev-parse', 'HEAD'), head); assert.equal(git(workspace, 'status', '--porcelain'), '');
});
test('existing contents, custom instructions and staged work survive setup', async t => {
  const { setup, parent } = await fixture(t); const workspace = path.join(parent, 'Existing'); await fs.mkdir(workspace);
  git(workspace, 'init', '-b', 'main'); await fs.writeFile(path.join(workspace, 'source.txt'), 'original\n');
  git(workspace, 'add', 'source.txt'); git(workspace, 'commit', '-m', 'original');
  await fs.writeFile(path.join(workspace, 'source.txt'), 'user work\n'); git(workspace, 'add', 'source.txt');
  await fs.writeFile(path.join(workspace, 'AGENTS.md'), '# My rules\n');
  await fs.mkdir(path.join(workspace, 'docs')); await fs.writeFile(path.join(workspace, 'docs/PRODUCT.md'), '# Existing product\n');
  const head = git(workspace, 'rev-parse', 'HEAD'), staged = git(workspace, 'diff', '--no-ext-diff', '--no-textconv', '--cached');
  const preview = await setup.preview({ mode: 'existing', workspace }); const result = await setup.apply(preview.token);
  assert.equal(result.ready, true, JSON.stringify(result)); assert.ok(result.warnings.length);
  assert.equal(git(workspace, 'rev-parse', 'HEAD'), head); assert.equal(git(workspace, 'diff', '--no-ext-diff', '--no-textconv', '--cached'), staged);
  assert.equal(await fs.readFile(path.join(workspace, 'source.txt'), 'utf8'), 'user work\n');
  assert.match(await fs.readFile(path.join(workspace, 'AGENTS.md'), 'utf8'), /^# My rules/);
  assert.equal(await fs.readFile(path.join(workspace, 'docs/PRODUCT.md'), 'utf8'), '# Existing product\n');
});
test('conflicting paths and changed preview block writes', async t => {
  const { setup, parent } = await fixture(t); const workspace = path.join(parent, 'Existing');
  await fs.mkdir(path.join(workspace, '.harness'), { recursive: true }); await fs.writeFile(path.join(workspace, '.harness/workflow.json'), 'user file');
  const conflict = await setup.preview({ mode: 'existing', workspace }); assert.equal(conflict.action, null); assert.ok(conflict.issues.length);
  await assert.rejects(setup.apply(conflict.token), { code: 'SETUP_BLOCKED' });
  assert.equal(await fs.readFile(path.join(workspace, '.harness/workflow.json'), 'utf8'), 'user file');
  const preview = await setup.preview({ mode: 'new', parent, name: 'Fresh' });
  await fs.mkdir(preview.workspace); await fs.writeFile(path.join(preview.workspace, 'arrived.txt'), 'new');
  await assert.rejects(setup.apply(preview.token), { code: 'FOLDER_NOT_EMPTY' });
  await assert.rejects(fs.stat(path.join(preview.workspace, '.git')), { code: 'ENOENT' });
});
test('missing local checks reconnect, changed core and missing documents never overwrite', async t => {
  const { setup, workspace } = await create(t);
  const hook = path.join(workspace, '.git/hooks/pre-commit'); await fs.unlink(hook);
  const preview = await setup.preview({ mode: 'existing', workspace }); assert.equal(preview.action, 'reconnect');
  assert.equal((await setup.apply(preview.token)).ready, true); assert.ok((await fs.stat(hook)).mode & 0o111);
  const source = path.join(workspace, '.harness/kit/lib/common.mjs'); await fs.appendFile(source, '\n// user change\n');
  const conflict = await setup.preview({ mode: 'existing', workspace }); assert.equal(conflict.action, null); assert.ok(conflict.issues.some(i => i.path.endsWith('common.mjs')));
  await fs.unlink(path.join(workspace, 'docs/WORKFLOW_START.md'));
  const docs = await setup.preview({ mode: 'existing', workspace }); assert.ok(docs.issues.some(i => i.path === 'docs/WORKFLOW_START.md'));
});
test('legacy compatible version opens unchanged and unsupported version is explicit', async t => {
  const { setup, workspace } = await create(t); const file = path.join(workspace, '.harness/kit-manifest.json');
  const m = JSON.parse(await fs.readFile(file, 'utf8')); m.version = '1.0.0'; await fs.writeFile(file, JSON.stringify(m));
  const old = await setup.preview({ mode: 'existing', workspace }); assert.equal(old.action, 'open');
  const before = await fs.readFile(file); await setup.apply(old.token); assert.deepEqual(await fs.readFile(file), before);
  m.version = '9.0.0'; await fs.writeFile(file, JSON.stringify(m));
  const unsupported = await setup.preview({ mode: 'existing', workspace }); assert.equal(unsupported.action, null); assert.match(unsupported.issues[0].reason, /9.0.0/);
});
test('Git subfolder resolves to project root and preview change prevents reopening', async t => {
  const { setup, workspace } = await create(t); const child = path.join(workspace, 'nested'); await fs.mkdir(child);
  const preview = await setup.preview({ mode: 'existing', workspace: child }); assert.equal(preview.workspace, workspace);
  await fs.writeFile(path.join(workspace, 'new.txt'), 'changed');
  await assert.rejects(setup.apply(preview.token), { code: 'PREVIEW_CHANGED' });
});
test('invalid names, expired tickets and missing Node do not create folders', async t => {
  const { setup, parent } = await fixture(t);
  for (const name of ['../outside', 'folder/name', '.', '.hidden', 'bad\nname']) await assert.rejects(setup.preview({ mode: 'new', parent, name }), { code: 'PROJECT_NAME' });
  await assert.rejects(setup.apply('forged'), { code: 'PREVIEW_REQUIRED' });
  const missing = new WorkspaceSetup({ nodeCandidates: ['/does/not/exist'] });
  await assert.rejects(missing.preview({ mode: 'new', parent, name: 'New' }), { code: 'NODE_MISSING' });
  assert.deepEqual(await fs.readdir(parent), []);
});
