import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { extractFile } from '@electron/asar';
import { hashFile, sourceSnapshot, verifyPackagedSources } from './release-all.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const { version } = JSON.parse(await fs.readFile(path.join(root, 'package.json'), 'utf8'));
assert.equal(version, '0.6.67');
const delivery = path.join(os.homedir(), 'Downloads', 'WebPilot-' + version);
const manifest = JSON.parse(await fs.readFile(path.join(delivery, 'release-manifest.json'), 'utf8'));
assert.equal(manifest.version, version); assert.equal(manifest.packagedSourceMatches, true);
const sources = await sourceSnapshot(root);
const rootApp = path.join(root, 'Project Web Pilot.app');
const appsApp = '/Applications/Project Web Pilot.app';
const targets = [
  path.join(rootApp, 'Contents/Resources'),
  path.join(appsApp, 'Contents/Resources'),
  path.join(root, '.harness/runtime/build/Project Web Pilot-darwin-arm64/Project Web Pilot.app/Contents/Resources'),
  path.join(root, '.harness/runtime/build/Project Web Pilot-win32-x64/resources'),
];
for (const resources of targets) await verifyPackagedSources({ root, resources, version, sources });
for (const app of [rootApp, appsApp]) {
  assert.equal((await fs.lstat(app)).isSymbolicLink(), false);
  assert.equal(execFileSync('/usr/libexec/PlistBuddy', ['-c', 'Print :CFBundleShortVersionString', path.join(app, 'Contents/Info.plist')], { encoding: 'utf8' }).trim(), version);
}
const preflight = JSON.parse(await fs.readFile(path.join(root, '.harness/runtime/release-067-preflight.json'), 'utf8'));
const appsBefore = preflight.find(item => item.path === appsApp);
const appsAfter = await fs.stat(appsApp);
assert.equal(appsAfter.dev, appsBefore.device); assert.equal(appsAfter.ino, appsBefore.inode);
assert.equal(Object.keys(sources).length, manifest.sourceFiles);
const stat = await fs.stat(rootApp); assert.equal(stat.ino, manifest.identity.inode); assert.equal(stat.dev, manifest.identity.device);
for (const artifact of manifest.artifacts) {
  const zip = path.join(delivery, artifact.file);
  assert.equal(await hashFile(zip), artifact.sha256);
  const prefix = artifact.platform.startsWith('macOS')
    ? 'Project Web Pilot.app/Contents/Resources/' : 'Project Web Pilot-win32-x64/resources/';
  const preload = execFileSync('/usr/bin/unzip', ['-p', zip, prefix + 'resources/chatgpt-page-observer-preload.cjs'], { maxBuffer: 1024 * 1024 });
  assert.deepEqual(preload, await fs.readFile(path.join(targets[0], 'resources/chatgpt-page-observer-preload.cjs')));
}
const temporary = await fs.mkdtemp(path.join(os.tmpdir(), 'web-pilot-installed-observer-'));
try {
  for (const file of ['page-state.mjs','page-state-bridge.mjs','chatgpt-dom.mjs','chatgpt-composer.mjs'])
    await fs.writeFile(path.join(temporary, file), extractFile(path.join(targets[0], 'app.asar'), 'src/' + file));
  const require = createRequire(import.meta.url);
  const environment = { ...process.env }; delete environment.ELECTRON_RUN_AS_NODE;
  const result = execFileSync(require('electron'), [path.join(root, 'tests/installed-observer-fixture.cjs'),
    targets[0], temporary, path.join(temporary, 'profile')], {
    encoding: 'utf8', timeout: 30000, maxBuffer: 2 * 1024 * 1024,
    env: environment,
  });
  process.stdout.write(result);
} finally { await fs.rm(temporary, { recursive: true, force: true }); }
console.log(JSON.stringify({ version, delivery, packagedSources: true, installedResourcesExecuted: true,
  nativeWindowsTested: false, liveChatGPT: false }));
