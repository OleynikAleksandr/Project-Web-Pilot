import fs from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createHash } from 'node:crypto';
import { execFileSync, spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import { extractFile, listPackage, uncache } from '@electron/asar';

const digest = bytes => createHash('sha256').update(bytes).digest('hex');
export async function hashFile(file) {
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(file)) hash.update(chunk);
  return hash.digest('hex');
}
async function files(folder) {
  return (await fs.readdir(folder, { recursive: true, withFileTypes: true }))
    .filter(e => e.isFile() && e.name !== '.DS_Store')
    .map(e => path.relative(folder, path.join(e.parentPath, e.name))).sort();
}
export async function sourceSnapshot(root) {
  const result = {};
  for (const file of ['package.json', 'package-lock.json', ...await files(path.join(root, 'src')).then(a => a.map(f => 'src/' + f)),
    ...await files(path.join(root, 'resources')).then(a => a.map(f => 'resources/' + f))])
    result[file] = await hashFile(path.join(root, file));
  return result;
}
export async function verifyPackagedSources({ root, resources, version, sources }) {
  sources ??= await sourceSnapshot(root);
  const asar = path.join(resources, 'app.asar');
  uncache(asar);
  const pkg = JSON.parse(extractFile(asar, 'package.json'));
  if (pkg.name !== 'project-web-pilot' || pkg.version !== version) throw new Error('Package version mismatch: ' + resources);
  const expectedPackage = JSON.parse(await fs.readFile(path.join(root, 'package.json'), 'utf8'));
  for (const field of ['private', 'scripts', 'devDependencies']) delete expectedPackage[field];
  if (!isDeepStrictEqual(pkg, expectedPackage)) throw new Error('Packaged runtime manifest mismatch');
  for (const [file, expected] of Object.entries(sources)) {
    if (file === 'package-lock.json' || file === 'package.json') continue; // Development metadata is pruned; runtime fields are checked above.
    const actual = file.startsWith('resources/') ? await hashFile(path.join(resources, file)) : digest(extractFile(asar, file));
    if (actual !== expected) throw new Error('Packaged source mismatch: ' + file);
  }
  if (listPackage(asar).some(f => f.includes('Project Web Pilot.app'))) throw new Error('Nested app in package');
  return { version: pkg.version, asarSha256: await hashFile(asar) };
}
const run = (command, args, cwd) => new Promise((resolve, reject) => {
  const child = spawn(command, args, { cwd, stdio: 'inherit', shell: false });
  child.once('error', reject);
  child.once('exit', (code, signal) => code === 0 ? resolve() : reject(new Error(`${command} failed (${code ?? signal})`)));
});
export async function buildPlatforms(root, execute = run) {
  await execute('npm', ['run', 'build:mac'], root);
  await execute('npm', ['run', 'build:win'], root);
}
const exec = (command, args) => execFileSync(command, args, { encoding: 'utf8', timeout: 180_000, maxBuffer: 128 * 1024 * 1024 });

export async function releaseAll({ root = fileURLToPath(new URL('..', import.meta.url)), deliveryDirectory } = {}) {
  if (process.platform !== 'darwin') throw new Error('Paired release requires the macOS build host');
  root = path.resolve(root);
  const { version } = JSON.parse(await fs.readFile(path.join(root, 'package.json'), 'utf8'));
  if (!/^\d+\.\d+\.\d+$/.test(version)) throw new Error('Invalid paired release version');
  const runtime = path.join(root, '.harness/runtime'), release = path.join(runtime, 'releases', version);
  const delivery = deliveryDirectory ?? path.join(os.homedir(), 'Downloads', 'WebPilot-' + version);
  await fs.mkdir(runtime, { recursive: true });
  const lock = path.join(runtime, 'paired-release.lock');
  await fs.mkdir(lock); // Refuse concurrent publishers; remove only the lock acquired here.
  try {
    if (await fs.stat(path.join(release, 'release-manifest.json')).catch(e => { if (e.code !== 'ENOENT') throw e; }))
      throw new Error('This paired release already exists; use a new version');
    const sources = await sourceSnapshot(root);
    const sourceCommit = exec('git', ['-C', root, 'rev-parse', 'HEAD']).trim();
    const target = path.join(root, 'Project Web Pilot.app');
    const before = await fs.stat(target).catch(e => { if (e.code !== 'ENOENT') throw e; });
    await buildPlatforms(root);
    if (JSON.stringify(await sourceSnapshot(root)) !== JSON.stringify(sources)) throw new Error('Sources changed during build');
    const build = path.join(runtime, 'build');
    const macResources = path.join(build, 'Project Web Pilot-darwin-arm64/Project Web Pilot.app/Contents/Resources');
    const winFolder = path.join(build, 'Project Web Pilot-win32-x64'), winResources = path.join(winFolder, 'resources');
    const installedResources = path.join(target, 'Contents/Resources');
    const mac = await verifyPackagedSources({ root, resources: macResources, version, sources });
    const windows = await verifyPackagedSources({ root, resources: winResources, version, sources });
    const installed = await verifyPackagedSources({ root, resources: installedResources, version, sources });
    if (mac.asarSha256 !== installed.asarSha256) throw new Error('Installed app differs from staging');
    const actual = exec('/usr/libexec/PlistBuddy', ['-c', 'Print :CFBundleShortVersionString', path.join(target, 'Contents/Info.plist')]).trim();
    if (actual !== version) throw new Error('Installed app version mismatch');
    const identity = await fs.stat(target);
    if (before && (before.ino !== identity.ino || before.dev !== identity.dev)) throw new Error('Installed app identity changed');
    for (const file of await files(path.join(runtime, 'mac-tools'))) {
      const expected = await hashFile(path.join(runtime, 'mac-tools', file));
      for (const res of [macResources, installedResources])
        if (await hashFile(path.join(res, 'mac-tools', file)) !== expected) throw new Error('Mac toolchain mismatch: ' + file);
    }
    const receipt = JSON.parse(await fs.readFile(path.join(release, 'mac-release.json'), 'utf8'));
    if (receipt.version !== version || receipt.installation.asarSha256 !== mac.asarSha256) throw new Error('Mac receipt mismatch');
    const macZip = path.join(release, `Project-Web-Pilot-${version}-macOS-arm64.zip`);
    const winZip = path.join(release, `Project-Web-Pilot-${version}-Windows-x64.zip`);
    const zipStage = await fs.mkdtemp(path.join(release, '.windows-zip-'));
    try {
      const zip = path.join(zipStage, path.basename(winZip));
      await run('/usr/bin/ditto', ['-c', '-k', '--keepParent', '--norsrc', winFolder, zip], root);
      await fs.rename(zip, winZip);
    } finally { await fs.rm(zipStage, { recursive: true, force: true }); }
    const artifacts = [];
    for (const [platform, zip, member, proof] of [
      ['macOS arm64', macZip, 'Project Web Pilot.app/Contents/Resources/app.asar', mac],
      ['Windows x64', winZip, 'Project Web Pilot-win32-x64/resources/app.asar', windows],
    ]) {
      await run('/usr/bin/unzip', ['-tq', zip], root);
      const packed = execFileSync('/usr/bin/unzip', ['-p', zip, member], { maxBuffer: 128 * 1024 * 1024, timeout: 180_000 });
      if (digest(packed) !== proof.asarSha256) throw new Error('ZIP differs from staging: ' + platform);
      artifacts.push({ platform, file: path.basename(zip), bytes: (await fs.stat(zip)).size, sha256: await hashFile(zip), asarSha256: proof.asarSha256 });
    }
    const evidence = { version, sourceCommit, sourceFiles: Object.keys(sources).length, packagedSourceMatches: true,
      identity: { device: identity.dev, inode: identity.ino }, artifacts, nativeWindowsTested: false, cleanVmTested: false };
    await fs.mkdir(delivery, { recursive: true });
    for (const artifact of artifacts) {
      const destination = path.join(delivery, artifact.file);
      await fs.copyFile(path.join(release, artifact.file), destination);
      if (await hashFile(destination) !== artifact.sha256) throw new Error('Delivery copy mismatch');
    }
    const hashes = artifacts.map(a => `${a.sha256}  ${a.file}`).join('\n') + '\n';
    const instructions = `Project Web Pilot ${version}\n\nmacOS arm64: постоянное приложение в корне проекта обновлено; ZIP предназначен для переноса.\nWindows x64: распакуйте всю папку ZIP на локальный диск Windows, затем запустите Project Web Pilot.exe. Мастер подготовит компоненты, туннель и покажет подключение Codex Local Windows MCP в ChatGPT. Для этой Windows используйте отдельный туннель.\n\nОба пакета собраны одной командой и сверены с исходниками. Подключение личного аккаунта и проверка файлов в Windows выполняются пользователем отдельно. Windows ARM64 использует эмуляцию x64; отдельной сборки ARM64 нет.\n`;
    for (const dir of [release, delivery]) {
      await fs.writeFile(path.join(dir, 'SHA256SUMS.txt'), hashes);
      await fs.writeFile(path.join(dir, 'INSTALL.txt'), instructions);
      await fs.writeFile(path.join(dir, 'release-manifest.json'), JSON.stringify(evidence, null, 2) + '\n');
    }
    return { ...evidence, delivery };
  } finally { await fs.rmdir(lock); }
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  releaseAll().then(result => console.log(JSON.stringify(result, null, 2))).catch(error => { console.error(error.message); process.exitCode = 1; });
}
