import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { getRuntimeRoot } from '@webpilot/workflow-kit';
import { runtimeFiles, runtimeDigest, EXPECTED_WORKFLOW_KIT_FILES, EXPECTED_WORKFLOW_KIT_SHA256 } from './check-workflow-kit-dependency.mjs';
import { PROJECT_ROOT, DEFAULT_STAGE, stageWorkflowKit } from './stage-workflow-kit.mjs';

const scratch = path.join(PROJECT_ROOT, '.harness/runtime/workflow-kit-stage-check');

async function compare(left, right) {
  const leftFiles = await runtimeFiles(left);
  const rightFiles = await runtimeFiles(right);
  assert.deepEqual(leftFiles, rightFiles);
  assert.equal(leftFiles.length, EXPECTED_WORKFLOW_KIT_FILES);
  assert.equal(await runtimeDigest(left, leftFiles), EXPECTED_WORKFLOW_KIT_SHA256);
  assert.equal(await runtimeDigest(right, rightFiles), EXPECTED_WORKFLOW_KIT_SHA256);
}

try {
  const statusBefore = execFileSync('git', ['status', '--porcelain', '--', 'resources/workflow-kit'], { cwd: PROJECT_ROOT, encoding: 'utf8' });
  await fs.rm(scratch, { recursive: true, force: true });
  const first = await stageWorkflowKit({ target: scratch });
  assert.equal(first.changed, true, 'fresh staging must create the target');
  const second = await stageWorkflowKit({ target: scratch });
  assert.equal(second.changed, false, 'repeat staging must be idempotent');
  await compare(getRuntimeRoot(), scratch);

  const production = await stageWorkflowKit();
  await compare(getRuntimeRoot(), DEFAULT_STAGE);
  const statusAfter = execFileSync('git', ['status', '--porcelain', '--', 'resources/workflow-kit'], { cwd: PROJECT_ROOT, encoding: 'utf8' });
  assert.equal(statusAfter, statusBefore, 'generated Workflow Kit staging changed Git status');

  process.stdout.write(JSON.stringify({
    ok: true,
    version: production.version,
    files: production.files,
    sha256: production.sha256,
    target: DEFAULT_STAGE,
    productionChanged: production.changed,
    idempotent: true,
  }, null, 2) + '\n');
} finally {
  await fs.rm(scratch, { recursive: true, force: true });
}
