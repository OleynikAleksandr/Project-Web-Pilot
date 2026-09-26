import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { VERSION, getRuntimeRoot } from '@webpilot/workflow-kit';
import {
  EXPECTED_WORKFLOW_KIT_VERSION,
  EXPECTED_WORKFLOW_KIT_FILES,
  EXPECTED_WORKFLOW_KIT_SHA256,
  runtimeFiles,
  runtimeDigest,
} from './check-workflow-kit-dependency.mjs';

export const PROJECT_ROOT = fileURLToPath(new URL('..', import.meta.url));
export const DEFAULT_STAGE = path.join(PROJECT_ROOT, 'resources/workflow-kit');

export async function verifyWorkflowKitRuntime(root) {
  root = path.resolve(root);
  const files = await runtimeFiles(root);
  assert.equal(VERSION, EXPECTED_WORKFLOW_KIT_VERSION, 'unexpected canonical Workflow Kit version');
  assert.equal(files.length, EXPECTED_WORKFLOW_KIT_FILES, 'unexpected Workflow Kit fileset');
  const sha256 = await runtimeDigest(root, files);
  assert.equal(sha256, EXPECTED_WORKFLOW_KIT_SHA256, 'unexpected Workflow Kit digest');
  const common = await fs.readFile(path.join(root, 'lib/common.mjs'), 'utf8');
  assert.match(common, new RegExp(`VERSION = ['"]${EXPECTED_WORKFLOW_KIT_VERSION.replaceAll('.', '\\.') }['"]`));
  return { root, version: VERSION, files: files.length, sha256 };
}

async function matchesCanonical(target, canonical) {
  try {
    const staged = await verifyWorkflowKitRuntime(target);
    return staged.files === canonical.files && staged.sha256 === canonical.sha256;
  } catch (error) {
    if (error.code === 'ENOENT') return false;
    return false;
  }
}

export async function stageWorkflowKit({ root = PROJECT_ROOT, target = path.join(root, 'resources/workflow-kit') } = {}) {
  root = path.resolve(root);
  target = path.resolve(target);
  const canonicalRoot = await fs.realpath(getRuntimeRoot());
  const canonical = await verifyWorkflowKitRuntime(canonicalRoot);
  if (await matchesCanonical(target, canonical)) return { ...canonical, target, changed: false };

  await fs.mkdir(path.dirname(target), { recursive: true });
  const temporary = target + '.stage-' + process.pid + '-' + Date.now();
  await fs.rm(temporary, { recursive: true, force: true });
  try {
    await fs.cp(canonicalRoot, temporary, { recursive: true });
    await verifyWorkflowKitRuntime(temporary);
    await fs.rm(target, { recursive: true, force: true });
    await fs.rename(temporary, target);
  } finally {
    await fs.rm(temporary, { recursive: true, force: true });
  }
  const staged = await verifyWorkflowKitRuntime(target);
  return { ...staged, target, changed: true };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  stageWorkflowKit().then(result => process.stdout.write(JSON.stringify({ ok: true, ...result }, null, 2) + '\n'))
    .catch(error => { console.error(error.message); process.exitCode = 1; });
}
