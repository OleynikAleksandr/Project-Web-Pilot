import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

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

// The bundled Kit is pinned to its source: CodeAppServer+WebChatGPT, branch codex/gpt-provider-names,
// commit badcf20 (tree 1fe409fb). The repository's own development Kit (.harness/kit) is versioned separately.
const BUNDLED_KIT_VERSION = '1.4.11';
const BUNDLED_KIT_SHA256 = '49dd163e025739d93eddd7603ac16c45bae1bae762b14fac69f7d42c111746e9';

test('bundled Workflow Kit exactly matches the pinned 1.4.11 source', async () => {
  const bundled = await snapshot(new URL('../resources/workflow-kit/', import.meta.url));
  assert.equal(bundled.files.length, 35);
  assert.ok(bundled.contents.get('lib/common.mjs').includes(`VERSION = '${BUNDLED_KIT_VERSION}'`));
  const digest = createHash('sha256');
  for (const file of bundled.files) digest.update(file + '\0' + bundled.contents.get(file) + '\0');
  assert.equal(digest.digest('hex'), BUNDLED_KIT_SHA256);
});

test('development Kit of this repository stays a complete separate installation', async () => {
  const installed = await snapshot(new URL('../.harness/kit/', import.meta.url));
  assert.ok(installed.files.includes('lib/common.mjs') && installed.files.includes('install.mjs'));
  assert.match(installed.contents.get('lib/common.mjs'), /VERSION = '\d+\.\d+\.\d+'/);
});
