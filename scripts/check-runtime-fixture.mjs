import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { installer, sessionPlans, VERSION } from '@webpilot/workflow-kit';

const BASELINE_FILE_COUNT = 35;
const BASELINE_SHA256 = '5464b2c1528eef1de740af50558bc8db1d39cfa7838f9c032d23650fb4f5f119';

function run(executable, args, cwd) {
  return execFileSync(executable, args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

function git(root, ...args) {
  return run('git', args, root);
}

async function filesBelow(directory, prefix = '') {
  const result = [];
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const relative = prefix ? prefix + '/' + entry.name : entry.name;
    if (entry.isDirectory()) result.push(...await filesBelow(path.join(directory, entry.name), relative));
    else if (entry.isFile()) result.push(relative);
  }
  return result.sort();
}

async function digestFiles(root, files) {
  const digest = createHash('sha256');
  for (const file of files) {
    const text = (await fs.readFile(path.join(root, file), 'utf8')).replace(/\r\n/g, '\n');
    digest.update(file + '\0' + text + '\0');
  }
  return digest.digest('hex');
}

function workflow(root, ...args) {
  const output = run(process.execPath, [path.join(root, 'scripts/workflow.mjs'), ...args], root);
  const parsed = JSON.parse(output);
  assert.equal(parsed.ok, true, 'Workflow command failed: ' + output);
  return parsed;
}

const root = await fs.mkdtemp(path.join(os.tmpdir(), 'workflow-kit-package-'));
try {
  git(root, 'init', '-b', 'main');
  git(root, 'config', 'user.name', 'Workflow Kit Test');
  git(root, 'config', 'user.email', 'workflow-kit@test.local');
  await fs.mkdir(path.join(root, 'docs/planning'), { recursive: true });
  await fs.writeFile(path.join(root, 'docs/planning/fixture.md'), '# Fixture plan\n\nRuntime package verification fixture.\n');
  await fs.writeFile(path.join(root, 'README.md'), '# Fixture\n');
  git(root, 'add', 'README.md', 'docs/planning/fixture.md');
  git(root, 'commit', '-m', 'test: fixture baseline');

  const installed = installer.install({ project: root, mode: 'existing' });
  assert.equal(installed.ok, true);
  assert.equal(installed.version, VERSION);

  const manifest = JSON.parse(await fs.readFile(path.join(root, '.harness/kit-manifest.json'), 'utf8'));
  assert.equal(manifest.version, VERSION);

  const runtimeRoot = path.join(root, '.harness/kit');
  const runtimeFiles = await filesBelow(runtimeRoot);
  assert.equal(runtimeFiles.length, BASELINE_FILE_COUNT);
  assert.equal(await digestFiles(runtimeRoot, runtimeFiles), BASELINE_SHA256);

  const inspected = installer.inspect({ project: root, mode: 'existing' });
  assert.equal(inspected.installed, true);
  assert.equal(inspected.compatible, true);
  assert.equal(inspected.conflicts.length, 0);

  const headBeforeReconnect = git(root, 'rev-parse', 'HEAD');
  const reconnected = installer.install({ project: root, mode: 'existing', update: true });
  assert.equal(reconnected.ok, true);
  assert.equal(git(root, 'rev-parse', 'HEAD'), headBeforeReconnect, 'same-version reconnect unexpectedly committed changes');

  const planInput = {
    id: 'fixture-session-plan',
    spec: 'docs/planning/fixture.md',
    objective: 'Verify session-owned plan and recovery through installed runtime',
    tasks: [{
      id: 'T001',
      title: 'Fixture task',
      files: ['README.md'],
      acceptance: ['Installed runtime can address a session-owned plan']
    }]
  };
  const inputFile = path.join(root, '.harness/runtime/fixture-plan.json');
  await fs.mkdir(path.dirname(inputFile), { recursive: true });
  await fs.writeFile(inputFile, JSON.stringify(planInput));

  const created = workflow(root, 'plan:create', '--input', inputFile, '--session', 'fixture-session');
  assert.equal(created.state?.scope_id, 'fixture-session-plan');

  const status = workflow(root, 'status', '--session', 'fixture-session');
  assert.equal(status.scope_id, 'fixture-session-plan');
  assert.equal(status.recovery_completeness, 'COMPLETE');

  const recovered = workflow(root, 'recover', '--session', 'fixture-session', '--format', 'json');
  assert.equal(recovered.completeness, 'COMPLETE');
  assert.equal(recovered.session_id, 'fixture-session');
  assert.equal(recovered.plan_id, 'fixture-session-plan');

  const view = workflow(root, 'plan:view', '--session', 'fixture-session');
  assert.equal(view.session_id, 'fixture-session');
  assert.equal(view.plan_id, 'fixture-session-plan');
  assert.equal(view.plan.owner_session_id, 'fixture-session');

  const directView = sessionPlans.sessionPlanView(root, 'fixture-session');
  assert.equal(directView.plan_id, 'fixture-session-plan');

  process.stdout.write(JSON.stringify({
    ok: true,
    version: VERSION,
    installedRuntimeFiles: runtimeFiles.length,
    installedRuntimeSha256: BASELINE_SHA256,
    sessionPlan: view.plan_id,
    recovery: recovered.completeness,
    reconnectHeadStable: true
  }, null, 2) + '\n');
} finally {
  await fs.rm(root, { recursive: true, force: true });
}
