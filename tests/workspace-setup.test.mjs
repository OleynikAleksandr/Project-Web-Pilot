import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { WorkspaceSetup } from '../src/workspace-setup.mjs';
import { nodeExecutableCandidates } from '../src/platform.mjs';
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
const sha = value => createHash('sha256').update(value).digest('hex');

test('Node candidates are centralized for macOS and Windows', () => {
  assert.deepEqual(nodeExecutableCandidates({ platform: 'darwin', environment: {}, execPath: '/usr/bin/node', electron: true }), [
    '/opt/homebrew/bin/node', '/usr/local/bin/node',
  ]);
  assert.deepEqual(nodeExecutableCandidates({
    platform: 'win32',
    environment: { ProgramFiles: 'C:\\Program Files', 'ProgramFiles(x86)': 'C:\\Program Files (x86)' },
    execPath: 'C:\\Node\\node.exe',
    electron: true,
  }), [
    'C:\\Program Files\\nodejs\\node.exe',
    'C:\\Program Files (x86)\\nodejs\\node.exe',
    'node.exe',
  ]);
  const setupEnvironment = { ProgramFiles: 'C:\\Program Files' };
  const setup = new WorkspaceSetup({ platform: 'win32', environment: setupEnvironment });
  assert.deepEqual(setup.nodeCandidates, nodeExecutableCandidates({ platform: 'win32', environment: setupEnvironment,
    execPath: process.execPath, electron: Boolean(process.versions.electron) }));
});

test('create a real empty Workflow Kit project and reopen without changes', async t => {
  const { setup, workspace } = await create(t);
  const config = JSON.parse(await fs.readFile(path.join(workspace, '.harness/workflow.json'), 'utf8'));
  const plan = JSON.parse((await fs.readFile(path.join(workspace, '.harness/plans/todo-plan.md'), 'utf8')).match(/```json\n([\s\S]*?)\n```/)[1]);
  assert.equal(config.profile, 'DISCOVERY'); assert.equal(config.budget.hard_bytes, 180000); assert.equal(plan.execution_scope_status, 'NONE'); assert.deepEqual(plan.tasks, []);
  assert.equal(plan.context_pack.include_last_completed_task, false);
  await fs.stat(path.join(workspace, 'docs/MODULES.md')); await fs.stat(path.join(workspace, 'docs/architecture/OVERVIEW.md'));
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
  assert.equal((await setup.apply(preview.token)).ready, true);
  const hookStat = await fs.stat(hook); if (process.platform !== 'win32') assert.ok(hookStat.mode & 0o111);
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

test('compatible 1.2 NONE installation upgrades to 1.3 with project continuity and preserves user documents', async t => {
  const { setup, workspace } = await create(t);
  const manifestFile = path.join(workspace, '.harness/kit-manifest.json');
  const manifest = JSON.parse(await fs.readFile(manifestFile, 'utf8')); manifest.version = '1.2.0';
  const commonPath = path.join(workspace, '.harness/kit/lib/common.mjs');
  const legacyCommon = (await fs.readFile(commonPath, 'utf8')).replace("VERSION = '1.3.0'", "VERSION = '1.2.0'");
  await fs.writeFile(commonPath, legacyCommon);
  const commonEntry = manifest.files.find(entry => entry.path === '.harness/kit/lib/common.mjs'); commonEntry.hash = sha(legacyCommon);
  await fs.writeFile(manifestFile, JSON.stringify(manifest, null, 2) + '\n');

  const planFile = path.join(workspace, '.harness/plans/todo-plan.md');
  let planText = await fs.readFile(planFile, 'utf8');
  const block = planText.match(/<!-- workflow-state:begin -->\s*```json\s*([\s\S]*?)```\s*<!-- workflow-state:end -->/);
  const legacyPlan = JSON.parse(block[1]); legacyPlan.objective = '';
  legacyPlan.context_pack = { documents: [], include_last_completed_task: false, dependency_task_ids: [] };
  const legacyBlock = '<!-- workflow-state:begin -->\n```json\n' + JSON.stringify(legacyPlan, null, 2) + '\n```\n<!-- workflow-state:end -->';
  planText = planText.slice(0, block.index) + legacyBlock + planText.slice(block.index + block[0].length);
  await fs.writeFile(planFile, planText);

  await fs.writeFile(path.join(workspace, 'docs/architecture/OVERVIEW.md'), '# Краткая архитектура проекта\n\nCUSTOM_OVERVIEW_STAYS\n');
  await fs.writeFile(path.join(workspace, 'docs/PRODUCT.md'), '# User product stays\n');
  const indexFile = path.join(workspace, 'docs/DOCUMENTATION_INDEX.md');
  const customIndex = (await fs.readFile(indexFile, 'utf8')).replace('<!-- workflow-kit:end -->', '| docs/custom.md | User-added index row |\n<!-- workflow-kit:end -->');
  await fs.writeFile(indexFile, customIndex);
  git(workspace, 'add', '.'); git(workspace, '-c', 'core.hooksPath=/dev/null', 'commit', '-m', 'simulate legacy 1.2 NONE');

  const preview = await setup.preview({ mode: 'existing', workspace });
  assert.equal(preview.action, 'upgrade', JSON.stringify(preview));
  const result = await setup.apply(preview.token);
  assert.equal(result.ready, true, JSON.stringify(result)); assert.equal(result.version, '1.3.0');
  assert.match(await fs.readFile(commonPath, 'utf8'), /VERSION = '1\.3\.0'/);
  assert.match(await fs.readFile(path.join(workspace, 'docs/architecture/OVERVIEW.md'), 'utf8'), /CUSTOM_OVERVIEW_STAYS/);
  assert.equal(await fs.readFile(path.join(workspace, 'docs/PRODUCT.md'), 'utf8'), '# User product stays\n');
  const upgradedIndex = await fs.readFile(indexFile, 'utf8'); assert.match(upgradedIndex, /docs\/custom\.md/); assert.match(upgradedIndex, /docs\/MODULES\.md/); assert.match(upgradedIndex, /docs\/architecture\/OVERVIEW\.md/);
  const upgradedPlanText = await fs.readFile(planFile, 'utf8');
  const upgradedPlan = JSON.parse(upgradedPlanText.match(/```json\n([\s\S]*?)\n```/)[1]);
  assert.equal(upgradedPlan.objective, 'Обсудите следующий этап проекта с пользователем.');
  for (const required of ['docs/architecture/OVERVIEW.md', 'docs/MODULES.md', 'docs/DOCUMENTATION_INDEX.md']) {
    assert.ok(upgradedPlan.context_pack.documents.some(doc => doc.path === required && doc.required));
  }
  assert.equal(git(workspace, 'status', '--porcelain'), '');
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

test('Windows setup ignores inherited Node flags and preload hooks in a real worker', async t => {
  const { parent } = await fixture(t);
  for (const [index, options] of ['--web-pilot-invalid-option', '--require=web-pilot-missing-preload'].entries()) {
    const inherited = {
      ...environment,
      PATH: path.dirname(process.execPath) + path.delimiter + (environment.PATH ?? environment.Path ?? ''),
      NODE_OPTIONS: options, Node_Options: options,
      NODE_PATH: '/web-pilot-unrelated-modules', Node_Path: '/web-pilot-unrelated-modules',
    };
    const setup = new WorkspaceSetup({
      platform: 'win32', nodeCandidates: [path.basename(process.execPath)], environment: inherited,
    });
    const preview = await setup.preview({ mode: 'new', parent, name: 'Windows flags ' + index });
    assert.equal(preview.action, 'install');
    await assert.rejects(fs.stat(preview.workspace), { code: 'ENOENT' });
    assert.equal((await setup.apply(preview.token)).ready, true);
    assert.equal((await setup.preview({ mode: 'existing', workspace: preview.workspace })).action, 'open');
    assert.equal(inherited.NODE_OPTIONS, options);
    assert.equal(inherited.Node_Options, options);
    assert.equal(inherited.NODE_PATH, '/web-pilot-unrelated-modules');
    assert.equal(Object.keys(setup.environment).some(key => /^node_(options|path)$/i.test(key)), false);
  }
});

test('Windows Node errors distinguish missing, old, denied, invalid and timed out executables', async t => {
  const cases = [
    { name: 'missing', error: { code: 'ENOENT' }, expected: 'NODE_MISSING', message: /resources/ },
    { name: 'old', stdout: 'v20.19.0\r\n', expected: 'NODE_TOO_OLD', message: /v20\.19\.0/ },
    { name: 'denied', error: { code: 'EACCES' }, expected: 'NODE_START_FAILED', message: /EACCES/ },
    { name: 'invalid image', error: { code: 'UNKNOWN' }, expected: 'NODE_START_FAILED', message: /UNKNOWN/ },
    { name: 'timeout', error: { code: null, killed: true }, expected: 'NODE_START_FAILED', message: /TIMEOUT/ },
    { name: 'unexpected output', stdout: 'not-node-secret', expected: 'NODE_START_FAILED', message: /INVALID_VERSION_OUTPUT/ },
  ];
  for (const item of cases) await t.test(item.name, async () => {
    const setup = new WorkspaceSetup({
      platform: 'win32', nodeCandidates: ['C:\\Program Files\\Web Pilot\\node.exe'],
      executeNode: async () => {
        if (item.error) throw Object.assign(new Error('stderr-secret'), item.error);
        return { stdout: item.stdout };
      },
    });
    await assert.rejects(setup.node(), error => {
      assert.equal(error.code, item.expected);
      assert.match(error.message, item.message);
      assert.doesNotMatch(error.message, /secret/);
      return true;
    });
  });
});

test('Windows keeps searching after failure and caches only a successful Node', async () => {
  const calls = [];
  let available = false;
  const setup = new WorkspaceSetup({
    platform: 'win32', nodeCandidates: ['missing.exe', 'blocked.exe', 'old.exe', 'good.exe'],
    executeNode: async candidate => {
      calls.push(candidate);
      if (candidate === 'blocked.exe') throw Object.assign(new Error(), { code: 'EACCES' });
      if (candidate === 'old.exe') return { stdout: 'v18.20.0\n' };
      if (candidate === 'good.exe' && available) return { stdout: 'v22.17.0\r\n' };
      throw Object.assign(new Error(), { code: 'ENOENT' });
    },
  });
  await assert.rejects(setup.node(), { code: 'NODE_START_FAILED' });
  available = true;
  assert.equal(await setup.node(), 'good.exe');
  assert.deepEqual(calls, ['missing.exe', 'blocked.exe', 'old.exe', 'good.exe',
    'missing.exe', 'blocked.exe', 'old.exe', 'good.exe']);
  assert.equal(await setup.node(), 'good.exe');
  assert.equal(calls.length, 8);
});

test('macOS retains Node environment and legacy missing-Node diagnostics', async () => {
  const setup = new WorkspaceSetup({
    platform: 'darwin', environment: { NODE_OPTIONS: '--trace-warnings', NODE_PATH: '/existing/modules' },
    nodeCandidates: ['/usr/local/bin/node'],
    executeNode: async (_candidate, _args, options) => {
      assert.equal(options.env.NODE_OPTIONS, '--trace-warnings');
      assert.equal(options.env.NODE_PATH, '/existing/modules');
      assert.equal(options.windowsHide, undefined);
      throw Object.assign(new Error(), { code: 'EACCES' });
    },
  });
  await assert.rejects(setup.node(), { code: 'NODE_MISSING' });
});
