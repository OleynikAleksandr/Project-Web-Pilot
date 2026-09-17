import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

async function snapshot(rootUrl) {
  const root = fileURLToPath(rootUrl);
  const files = (await fs.readdir(rootUrl, { recursive: true, withFileTypes: true }))
    .filter(entry => entry.isFile())
    .map(entry => path.relative(root, path.join(entry.parentPath, entry.name)).split(path.sep).join('/'))
    .sort();
  const contents = new Map();
  for (const file of files) contents.set(file, (await fs.readFile(new URL(file, rootUrl), 'utf8')).replace(/\r\n/g, '\n'));
  return { files, contents };
}

test('bundled Workflow Kit exactly matches the installed Project Web Pilot source', async () => {
  const installed = await snapshot(new URL('../.harness/kit/', import.meta.url));
  const bundled = await snapshot(new URL('../resources/workflow-kit/', import.meta.url));
  assert.deepEqual(bundled.files, installed.files);
  for (const file of installed.files) assert.equal(bundled.contents.get(file), installed.contents.get(file), file);
  assert.match(installed.contents.get('lib/common.mjs'), /VERSION = '1\.4\.1'/);
});
