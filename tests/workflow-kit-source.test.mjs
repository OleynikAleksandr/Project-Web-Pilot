import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
const expected = {
  "WORKFLOW.md": "707b2cc6b44cc604f4bedd8e9f6ad39877c0e685706e8c985183240af6834f88",
  "cli.mjs": "951eb369a762a824a475a3cdc65ebf6aef6c36c65587b576a2318c78eefb205a",
  "install.mjs": "528f4f545564e0b6eee109053d984e66c5b8fa9403fd4cd5cf36fc36122a03dc",
  "lib/actions.mjs": "91d1313cbadc998d5e3f091963c50110232b8ecbc8e837e3ccb679ca6d29e781",
  "lib/common.mjs": "13a75bd5ddc42e24c300102ed202af301df4a64066d7a39ab49e1a68c24992da",
  "lib/git-hooks.mjs": "72ebf77c2f2482b09ea7b5c38f03e8c26367549bc4df3d13036ef51f9416ad23",
  "lib/git.mjs": "226ba1ee0935fcefb38dd343282c720baba096fb9349d34ab349ca6be35fa44b",
  "lib/installation-files.mjs": "46335e793ee1343f39815adbb94e6ddf8c8eb9a01b8d192705d77fd7d7cd8f32",
  "lib/installer.mjs": "0d3353f43257030e565b7abc35bb7bd31dddac1d8c37cf1ad774a4586788b81a",
  "lib/plan.mjs": "4f57ee52cfad2af3450fa6099926c8c9dbf11e7ab3b5c90e32d4ffc33a196bbc",
  "lib/platform.mjs": "42786f88026d4ba7300cf08ae7b3e09645c49bc2730741bc71b009ffb55531eb",
  "lib/recovery.mjs": "2296e1ea1e6a55fe9913b0daa6a131ace504553798301760d0532ed983cbb5ea",
  "lib/transaction.mjs": "742bcc1b5e952f694be8e4533b1292d19a69888d5c964a4f5f884dbae6fc72a8",
  "lib/validate.mjs": "0e7c827051a8725994e114241d1b0254b35efeb8300dd41602d62f1e442f189c",
  "schemas/plan.schema.json": "b93898e7509debb33dccf1a60c4742a4b0f710a60ef778a6d60acbb23a7507ca",
  "schemas/workflow.schema.json": "2703199fdf049ad2634f4f7221ef3f74de6d11f039f19cbe02d9c03358721a1f",
  "templates/AGENTS.md": "474270920c3b564b81e385e0c03c6601ff5a8bc2e370764a2444106208151034",
  "templates/ARCHITECTURE.md": "d5342fbcfbb0885d1bff0f7705ce6a1f9cfd05b9af6d76c7f318ef4694c68a42",
  "templates/PLAN.md": "56f86b36012df64eeb2dee726a89961e96034fddb76120218ddb4f6835cb1bb8",
  "templates/PRODUCT.md": "6f101bde2d38b40c8477a33e5cedefb0595db913972b60f552ea2b9553aff4f0",
  "templates/START.md": "9b98c1fb954237a254fcde10669ed28c248e9c9cf15db7430169b6723b2c67ee"
};
test('vendored Workflow Kit exactly matches the pinned Project Web Pilot source snapshot', async () => {
  const root = new URL('../resources/workflow-kit/', import.meta.url);
  const files = (await fs.readdir(root, { recursive: true, withFileTypes: true })).filter(e => e.isFile()).map(e => path.relative(fileURLToPath(root), path.join(e.parentPath, e.name)).split(path.sep).join('/')).sort();
  assert.deepEqual(files, Object.keys(expected).sort());
  for (const [file, sha] of Object.entries(expected)) {
    const source = (await fs.readFile(new URL(file, root), 'utf8')).replace(/\r\n/g, '\n');
    assert.equal(createHash('sha256').update(source, 'utf8').digest('hex'), sha, file);
  }
});
