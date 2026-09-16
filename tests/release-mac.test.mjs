import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { createPackage, extractFile, uncache } from '@electron/asar';
import { installMacBundle, publishMacRelease } from '../scripts/release-mac.mjs';

const mac = { skip: process.platform !== 'darwin' };
async function fixture(t) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'web-pilot-release-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  return root;
}
async function bundle(root, version, marker) {
  const source = path.join(root, '.harness/runtime/build/Project Web Pilot-darwin-arm64/Project Web Pilot.app');
  await fs.rm(source, { recursive: true, force: true });
  const resources = path.join(source, 'Contents/Resources');
  await fs.mkdir(resources, { recursive: true });
  await fs.writeFile(path.join(source, 'Contents/Info.plist'), '<?xml version="1.0"?><plist version="1.0"><dict><key>CFBundleIdentifier</key><string>com.oleynik.ProjectWebPilot</string><key>CFBundleShortVersionString</key><string>' + version + '</string></dict></plist>');
  const input = path.join(root, 'input');
  await fs.mkdir(input, { recursive: true });
  await fs.writeFile(path.join(input, 'package.json'), JSON.stringify({ name: 'project-web-pilot', version }));
  await fs.writeFile(path.join(input, 'marker.txt'), marker);
  await createPackage(input, path.join(resources, 'app.asar'));
  await fs.writeFile(path.join(root, 'package.json'), JSON.stringify({ version }));
  return source;
}
function marker(app) {
  const archive = path.join(app, 'Contents/Resources/app.asar');
  uncache(archive);
  return extractFile(archive, 'marker.txt').toString();
}

test('two releases keep the permanent app identity, back up old contents and publish a separate ZIP', mac, async t => {
  const root = await fixture(t), delivery = path.join(root, 'downloads');
  await bundle(root, '1.0.0', 'first');
  const first = await publishMacRelease({ root, deliveryDirectory: delivery });
  const original = await fs.stat(first.installation.target);
  await fs.writeFile(path.join(first.installation.target, 'Contents/obsolete.txt'), 'old file');
  await bundle(root, '1.0.1', 'second');
  const second = await publishMacRelease({ root, deliveryDirectory: delivery });
  const updated = await fs.stat(second.installation.target);
  assert.equal(updated.ino, original.ino);
  assert.equal(updated.dev, original.dev);
  assert.equal(marker(second.installation.target), 'second');
  assert.equal(marker(second.installation.backup), 'first');
  await assert.rejects(fs.stat(path.join(second.installation.target, 'Contents/obsolete.txt')), { code: 'ENOENT' });
  assert.equal(await fs.readFile(path.join(second.installation.backup, 'Contents/obsolete.txt'), 'utf8'), 'old file');
  const extracted = path.join(root, 'unpacked');
  execFileSync('/usr/bin/ditto', ['-x', '-k', second.zip, extracted]);
  assert.equal(marker(path.join(extracted, 'Project Web Pilot.app')), 'second');
  assert.ok((await fs.stat(path.join(delivery, path.basename(second.zip)))).size > 0);
  assert.equal((await fs.readFile(second.zip + '.sha256', 'utf8')).split(' ')[0], second.sha256);
  assert.ok(!second.zip.startsWith(second.installation.target + path.sep));
});

test('invalid source version and unexpected target files preserve the installed app', mac, async t => {
  const root = await fixture(t);
  const source = await bundle(root, '1.0.0', 'safe');
  const options = { source, target: path.join(root, 'Project Web Pilot.app'), backupRoot: path.join(root, 'backups'), version: '1.0.0' };
  await installMacBundle(options);
  const before = await fs.stat(options.target);
  await assert.rejects(installMacBundle({ ...options, version: '9.9.9' }), /version mismatch/);
  await fs.writeFile(path.join(options.target, 'foreign.txt'), 'preserve');
  await assert.rejects(installMacBundle(options), /Unexpected app entries/);
  assert.equal((await fs.stat(options.target)).ino, before.ino);
  assert.equal(marker(options.target), 'safe');
  assert.equal(await fs.readFile(path.join(options.target, 'foreign.txt'), 'utf8'), 'preserve');
});

test('symlink target is refused without changing its destination', mac, async t => {
  const root = await fixture(t);
  const source = await bundle(root, '1.0.0', 'safe');
  const target = path.join(root, 'alias.app');
  await fs.symlink(source, target);
  await assert.rejects(installMacBundle({ source, target, backupRoot: path.join(root, 'backups'), version: '1.0.0' }), /real app directory/);
  assert.equal(marker(source), 'safe');
  assert.ok((await fs.lstat(target)).isSymbolicLink());
});
