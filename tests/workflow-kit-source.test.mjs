import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { VERSION, getRuntimeRoot } from '@webpilot/workflow-kit';
import { DEFAULT_STAGE } from '../scripts/stage-workflow-kit.mjs';

const EXPECTED_VERSION = '1.5.5';
const EXPECTED_FILES = 35;
const EXPECTED_SHA256 = '8eadd98869a840f670dbfb00c33350e3054d8ec7de5298b2b0beca82d787f376';
const projectRoot = fileURLToPath(new URL('..', import.meta.url));

async function snapshot(root) {
  root = path.resolve(root);
  const files = (await fs.readdir(root, { recursive: true, withFileTypes: true }))
    .filter(entry => entry.isFile())
    .map(entry => path.relative(root, path.join(entry.parentPath, entry.name)).split(path.sep).join('/'))
    .sort();
  const contents = new Map();
  for (const file of files) contents.set(file, (await fs.readFile(path.join(root, file), 'utf8')).replace(/\r\n/g, '\n'));
  return { files, contents };
}

function digestSnapshot(value) {
  const digest = createHash('sha256');
  for (const file of value.files) digest.update(file + '\0' + value.contents.get(file) + '\0');
  return digest.digest('hex');
}

test('canonical Workflow Kit package resolves to the sibling 1.5.5 policy source', async () => {
  assert.equal(VERSION, EXPECTED_VERSION);
  const packageRoot = await fs.realpath(path.join(projectRoot, 'node_modules/@webpilot/workflow-kit'));
  const canonicalRoot = await fs.realpath(path.join(projectRoot, '../WorkflowKit'));
  assert.equal(packageRoot, canonicalRoot);
  assert.equal(await fs.realpath(getRuntimeRoot()), await fs.realpath(path.join(canonicalRoot, 'src')));

  const canonical = await snapshot(getRuntimeRoot());
  assert.equal(canonical.files.length, EXPECTED_FILES);
  assert.ok(canonical.contents.get('lib/common.mjs').includes(`VERSION = '${EXPECTED_VERSION}'`));
  assert.equal(digestSnapshot(canonical), EXPECTED_SHA256);

  for (const subpath of ['actions', 'plan', 'session-plans', 'recovery', 'installer', 'installation-files', 'common']) {
    const module = await import('@webpilot/workflow-kit/lib/' + subpath);
    assert.ok(Object.keys(module).length > 0, 'empty package export: ' + subpath);
  }
});

test('generated Workflow Kit runtime staging matches the canonical package', async () => {
  const canonical = await snapshot(getRuntimeRoot());
  const staged = await snapshot(DEFAULT_STAGE);
  assert.deepEqual(staged.files, canonical.files);
  assert.equal(staged.files.length, EXPECTED_FILES);
  assert.equal(digestSnapshot(staged), EXPECTED_SHA256);
});

test('installed Workflow Kit of this repository stays a complete separate installation', async () => {
  const installed = await snapshot(path.join(projectRoot, '.harness/kit'));
  assert.ok(installed.files.includes('lib/common.mjs') && installed.files.includes('install.mjs'));
  assert.match(installed.contents.get('lib/common.mjs'), /VERSION = '\d+\.\d+\.\d+'/);
});
