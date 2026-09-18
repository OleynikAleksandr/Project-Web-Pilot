import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { WINDOWS_RUNTIME_ARCHIVE, WINDOWS_RUNTIME_SHA256 } from '../src/windows-runtime.mjs';
import { NODE_FOLDER, NODE_SHA256 } from './prepare-windows-toolchain.mjs';
import { verifyPackagedSources } from './release-all.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function hashFile(file) {
  const hash = createHash('sha256');
  await new Promise((resolve, reject) => {
    const stream = fsSync.createReadStream(file);
    stream.on('data', chunk => hash.update(chunk));
    stream.on('error', reject);
    stream.on('end', resolve);
  });
  return hash.digest('hex');
}

async function requireFile(file, label) {
  const stat = await fs.stat(file).catch(() => null);
  if (!stat?.isFile()) throw new Error(`${label} missing: ${file}`);
  return stat;
}

async function requirePe(file, label) {
  const handle = await fs.open(file, 'r');
  try {
    const magic = Buffer.alloc(2); await handle.read(magic, 0, 2, 0);
    if (magic.toString('ascii') !== 'MZ') throw new Error(`${label} is not a Windows PE executable: ${file}`);
  } finally { await handle.close(); }
}

export async function verifyWindowsPackage(packageDir = path.join(ROOT, '.harness', 'runtime', 'build', 'Project Web Pilot-win32-x64')) {
  const { version } = JSON.parse(await fs.readFile(path.join(ROOT, 'package.json'), 'utf8'));
  const resources = path.join(packageDir, 'resources');
  const executable = path.join(packageDir, 'Project Web Pilot.exe');
  const appAsar = path.join(resources, 'app.asar');
  const runtimeArchive = path.join(resources, 'windows-payload', WINDOWS_RUNTIME_ARCHIVE);
  const nodeArchive = path.join(resources, 'windows-payload', `node-v22.17.0-win-x64.zip`);
  const nodeExe = path.join(resources, 'windows-node', NODE_FOLDER, 'node.exe');
  const workflow = path.join(resources, 'resources', 'workflow-kit', 'WORKFLOW.md');
  const setupWorker = path.join(resources, 'resources', 'workspace-setup-worker.mjs');
  const exeStat = await requireFile(executable, 'Project Web Pilot.exe');
  await requireFile(appAsar, 'app.asar');
  await requireFile(runtimeArchive, 'Codex Local Windows payload');
  await requireFile(nodeArchive, 'portable Node archive');
  const nodeStat = await requireFile(nodeExe, 'portable node.exe');
  await requireFile(workflow, 'Workflow Kit');
  await requireFile(setupWorker, 'workspace setup worker');
  await requireFile(path.join(resources, 'resources/runtime-control/windows-first-run.py'), 'Windows native tunnel dialog');
  await requireFile(path.join(resources, 'resources/runtime-control/windows-control.py'), 'Windows lifecycle control');
  const sourceProof = await verifyPackagedSources({ root: ROOT, resources, version });
  await requirePe(executable, 'Project Web Pilot.exe');
  await requirePe(nodeExe, 'portable node.exe');
  const runtimeSha256 = await hashFile(runtimeArchive);
  if (runtimeSha256 !== WINDOWS_RUNTIME_SHA256) throw new Error(`Codex Local Windows SHA mismatch: ${runtimeSha256}`);
  const nodeSha256 = await hashFile(nodeArchive);
  if (nodeSha256 !== NODE_SHA256) throw new Error(`portable Node SHA mismatch: ${nodeSha256}`);
  if (fsSync.existsSync(path.join(packageDir, 'Contents', 'Info.plist'))) throw new Error('macOS bundle structure leaked into Windows package');
  if (exeStat.size < 1024 * 1024 || nodeStat.size < 10 * 1024 * 1024) throw new Error('Windows executable payload is unexpectedly small');
  return {
    ...sourceProof,
    firstRun: true,
    packageDir,
    executable,
    executableSha256: await hashFile(executable),
    runtimeSha256,
    nodeSha256,
    nodeExecutableBytes: nodeStat.size,
    workflowKit: true,
    macBundle: false,
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  verifyWindowsPackage(process.argv[2] ? path.resolve(process.argv[2]) : undefined).then(result => {
    process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  }).catch(error => { console.error(error.message); process.exitCode = 1; });
}
