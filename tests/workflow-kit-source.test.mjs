import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
const expected = {
  "WORKFLOW.md": "9f706c909294631ab62a0564f2ccb0e1cea7f67d3f8ea6cded078ac58b1cd124",
  "cli.mjs": "951eb369a762a824a475a3cdc65ebf6aef6c36c65587b576a2318c78eefb205a",
  "install.mjs": "528f4f545564e0b6eee109053d984e66c5b8fa9403fd4cd5cf36fc36122a03dc",
  "lib/actions.mjs": "9e7f1d2c4fc15a40e5bd0e5514ae11661ae3b93d7fbb4b6fcbebf8cd53b44d46",
  "lib/common.mjs": "3c1bdd4fc8c796d96060216b2369f33f47cfc429fa6c768e6e54765ab05e25d1",
  "lib/git-hooks.mjs": "72ebf77c2f2482b09ea7b5c38f03e8c26367549bc4df3d13036ef51f9416ad23",
  "lib/git.mjs": "226ba1ee0935fcefb38dd343282c720baba096fb9349d34ab349ca6be35fa44b",
  "lib/installation-files.mjs": "c24459d1acb31bb65a8a698f133b9e3adf949e46c6af3328467cd74526fc0b9f",
  "lib/installer.mjs": "5bfee2a88c3f2bb308576414955caf7df7075893e2e901bb09fb270dfe4f94aa",
  "lib/plan.mjs": "0099067c38486697c41e2e5ddd709356e6c1ea7f1b365553ea26be4f904fcca8",
  "lib/platform.mjs": "42786f88026d4ba7300cf08ae7b3e09645c49bc2730741bc71b009ffb55531eb",
  "lib/recovery.mjs": "13e96bf800d8c464e1e76692d5df71618f2092888fc3a508dd419ca14fd980cb",
  "lib/transaction.mjs": "a6c0ca7a034fb51aae733ab913d8634958ed223c2b0cbc1fe8830789736e6389",
  "lib/validate.mjs": "a4f0edc04213a47f4ea0cda03b8178d0ec51a792cbd384ff93022e5542435689",
  "schemas/plan.schema.json": "b93898e7509debb33dccf1a60c4742a4b0f710a60ef778a6d60acbb23a7507ca",
  "schemas/workflow.schema.json": "2703199fdf049ad2634f4f7221ef3f74de6d11f039f19cbe02d9c03358721a1f",
  "templates/AGENTS.md": "a657ab164b3db5bc33b55efa591c53e7eade746cafe4f12bdbecc10855f1fe66",
  "templates/ARCHITECTURE.md": "d5342fbcfbb0885d1bff0f7705ce6a1f9cfd05b9af6d76c7f318ef4694c68a42",
  "templates/PLAN.md": "fed35748aca82771516506f75b1e4cf1a0a9f983c80c9f3f46f3f8efcb8a607f",
  "templates/PRODUCT.md": "6f101bde2d38b40c8477a33e5cedefb0595db913972b60f552ea2b9553aff4f0",
  "templates/START.md": "5decb9e56e178b03151ef9f3d658753a7103f147a24b1224c82c4f83b3d950f3"
};
test('vendored Workflow Kit exactly matches WF001 20260a0 source snapshot', async () => {
  const root = new URL('../resources/workflow-kit/', import.meta.url);
  const files = (await fs.readdir(root, { recursive: true, withFileTypes: true })).filter(e => e.isFile()).map(e => path.relative(fileURLToPath(root), path.join(e.parentPath, e.name)).split(path.sep).join('/')).sort();
  assert.deepEqual(files, Object.keys(expected).sort());
  for (const [file, sha] of Object.entries(expected)) {
    const source = (await fs.readFile(new URL(file, root), 'utf8')).replace(/\r\n/g, '\n');
    assert.equal(createHash('sha256').update(source, 'utf8').digest('hex'), sha, file);
  }
});
