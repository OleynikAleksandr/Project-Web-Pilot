import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { VERSION, getRuntimeRoot } from '@webpilot/workflow-kit';

export const EXPECTED_WORKFLOW_KIT_VERSION = '1.4.12';
export const EXPECTED_WORKFLOW_KIT_FILES = 35;
export const EXPECTED_WORKFLOW_KIT_SHA256 = '5464b2c1528eef1de740af50558bc8db1d39cfa7838f9c032d23650fb4f5f119';

export async function runtimeFiles(root = getRuntimeRoot()) {
  root = path.resolve(root);
  return (await fs.readdir(root, { recursive: true, withFileTypes: true }))
    .filter(entry => entry.isFile())
    .map(entry => path.relative(root, path.join(entry.parentPath, entry.name)).split(path.sep).join('/'))
    .sort();
}

export async function runtimeDigest(root = getRuntimeRoot(), files = null) {
  files ??= await runtimeFiles(root);
  const digest = createHash('sha256');
  for (const file of files) {
    const text = (await fs.readFile(path.join(root, file), 'utf8')).replace(/\r\n/g, '\n');
    digest.update(file + '\0' + text + '\0');
  }
  return digest.digest('hex');
}

export async function verifyWorkflowKitDependency() {
  assert.equal(VERSION, EXPECTED_WORKFLOW_KIT_VERSION, 'unexpected Workflow Kit package version');
  const files = await runtimeFiles();
  assert.equal(files.length, EXPECTED_WORKFLOW_KIT_FILES, 'unexpected Workflow Kit runtime fileset');
  assert.equal(await runtimeDigest(getRuntimeRoot(), files), EXPECTED_WORKFLOW_KIT_SHA256, 'unexpected Workflow Kit runtime digest');

  const root = fileURLToPath(new URL('..', import.meta.url));
  const resolved = await fs.realpath(path.join(root, 'node_modules/@webpilot/workflow-kit'));
  const canonical = await fs.realpath(path.join(root, '../WorkflowKit'));
  assert.equal(resolved, canonical, 'development dependency does not resolve to canonical WorkflowKit workspace');

  for (const subpath of ['actions', 'plan', 'session-plans', 'recovery', 'installer', 'inspection-inputs', 'installation-files', 'git', 'transaction', 'validate', 'common']) {
    const module = await import('@webpilot/workflow-kit/lib/' + subpath);
    assert.ok(Object.keys(module).length > 0, 'empty package export: ' + subpath);
  }
  return { version: VERSION, files: files.length, sha256: EXPECTED_WORKFLOW_KIT_SHA256, runtime: getRuntimeRoot() };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  verifyWorkflowKitDependency().then(result => process.stdout.write(JSON.stringify({ ok: true, ...result }, null, 2) + '\n'))
    .catch(error => { console.error(error.message); process.exitCode = 1; });
}
