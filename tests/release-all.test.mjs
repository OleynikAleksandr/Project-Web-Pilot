import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { createPackage } from '@electron/asar';
import { buildPlatforms, sourceSnapshot, verifyPackagedSources } from '../scripts/release-all.mjs';

async function fixture(t) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'pilot-paired-release-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const input = path.join(root, 'input'), resources = path.join(root, 'package/resources');
  await fs.mkdir(path.join(root, 'src'), { recursive: true });
  await fs.mkdir(path.join(root, 'resources/runtime-control'), { recursive: true });
  await fs.writeFile(path.join(root, 'package.json'), JSON.stringify({ name: 'project-web-pilot', version: '1.0.0' }));
  await fs.writeFile(path.join(root, 'package-lock.json'), '{}');
  await fs.writeFile(path.join(root, 'src/startup.mjs'), 'export const platform = "win32";');
  await fs.writeFile(path.join(root, 'resources/runtime-control/windows-first-run.py'), 'print("fixture")');
  await fs.mkdir(input, { recursive: true });
  await fs.mkdir(resources, { recursive: true });
  await fs.cp(path.join(root, 'src'), path.join(input, 'src'), { recursive: true });
  await fs.copyFile(path.join(root, 'package.json'), path.join(input, 'package.json'));
  await fs.cp(path.join(root, 'resources'), path.join(resources, 'resources'), { recursive: true });
  await createPackage(input, path.join(resources, 'app.asar'));
  return { root, input, resources, version: '1.0.0' };
}
test('release refuses mismatched versions, omitted helper and stale source despite a valid asar', async t => {
  const f = await fixture(t);
  const proof = await verifyPackagedSources(f);
  assert.equal(proof.version, '1.0.0'); assert.match(proof.asarSha256, /^[a-f0-9]{64}$/);
  await assert.rejects(verifyPackagedSources({ ...f, version: '1.0.1' }), /version mismatch/);
  const helper = path.join(f.resources, 'resources/runtime-control/windows-first-run.py');
  await fs.rm(helper);
  await assert.rejects(verifyPackagedSources(f), { code: 'ENOENT' });
  await fs.copyFile(path.join(f.root, 'resources/runtime-control/windows-first-run.py'), helper);
  await fs.writeFile(path.join(f.root, 'src/startup.mjs'), 'export const platform = "changed";');
  await assert.rejects(verifyPackagedSources(f), /Packaged source mismatch: src/);
});
test('release snapshots detect a changed external helper and rejects nested macOS app', async t => {
  const f = await fixture(t), before = await sourceSnapshot(f.root);
  await fs.writeFile(path.join(f.root, 'resources/runtime-control/windows-first-run.py'), 'print("changed")');
  assert.notDeepEqual(await sourceSnapshot(f.root), before);
  await assert.rejects(verifyPackagedSources(f), /Packaged source mismatch: resources/);
  await fs.writeFile(path.join(f.root, 'resources/runtime-control/windows-first-run.py'), 'print("fixture")');
  await fs.mkdir(path.join(f.input, 'Project Web Pilot.app'), { recursive: true });
  await fs.writeFile(path.join(f.input, 'Project Web Pilot.app/foreign'), 'old');
  await createPackage(f.input, path.join(f.resources, 'app.asar'));
  await assert.rejects(verifyPackagedSources(f), /Nested app/);
});
test('paired build is sequential and propagates failure before the next platform', async () => {
  const calls = [];
  await buildPlatforms('/fixture', async (command, args, cwd) => { calls.push([command, args[1], cwd]); });
  assert.deepEqual(calls, [['npm', 'build:mac', '/fixture'], ['npm', 'build:win', '/fixture']]);
  const failed = [];
  await assert.rejects(buildPlatforms('/fixture', async (_, args) => { failed.push(args[1]); throw new Error('fixture failure'); }), /fixture failure/);
  assert.deepEqual(failed, ['build:mac']);
});

test('packager prunes development metadata while preserving every runtime field', async t => {
  const f = await fixture(t);
  const production = { name: 'project-web-pilot', version: '1.0.0', main: 'src/startup.mjs', type: 'module' };
  await fs.writeFile(path.join(f.root, 'package.json'), JSON.stringify({ ...production, private: true, scripts: { build: 'fixture' }, devDependencies: { fixture: '1.0.0' } }));
  await fs.writeFile(path.join(f.input, 'package.json'), JSON.stringify(production));
  await createPackage(f.input, path.join(f.resources, 'app.asar'));
  assert.equal((await verifyPackagedSources(f)).version, '1.0.0');
  await fs.writeFile(path.join(f.input, 'package.json'), JSON.stringify({ ...production, main: 'wrong.mjs' }));
  await createPackage(f.input, path.join(f.resources, 'app.asar'));
  await assert.rejects(verifyPackagedSources(f), /runtime manifest mismatch/);
});
