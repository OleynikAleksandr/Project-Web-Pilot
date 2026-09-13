import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { WINDOWS_RUNTIME_ARCHIVE, WINDOWS_RUNTIME_SHA256 } from '../src/windows-runtime.mjs';
import { promisify } from 'node:util';

const execute = promisify(execFile);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const NODE_VERSION = '22.17.0';
export const NODE_ARCHIVE = `node-v${NODE_VERSION}-win-x64.zip`;
export const NODE_SHA256 = '721ab118a3aac8584348b132767eadf51379e0616f0db802cc1e66d7f0d98f85';
export const NODE_URL = `https://nodejs.org/dist/v${NODE_VERSION}/${NODE_ARCHIVE}`;
export const NODE_FOLDER = `node-v${NODE_VERSION}-win-x64`;

export function windowsRuntimeSourceCandidates(root = ROOT, environment = process.env) {
  return [...new Set([
    environment.WEB_PILOT_WINDOWS_RUNTIME_ARCHIVE,
    path.join(root, 'windows-app', 'resources', 'windows-payload', WINDOWS_RUNTIME_ARCHIVE),
    path.resolve(root, '..', 'Codex Local Mac', WINDOWS_RUNTIME_ARCHIVE),
  ].filter(Boolean))];
}

export function windowsToolchainPaths(root = ROOT) {
  const cacheDir = path.join(root, '.harness', 'runtime', 'windows-payload');
  const extractDir = path.join(root, '.harness', 'runtime', 'windows-node');
  return {
    cacheDir,
    archive: path.join(cacheDir, NODE_ARCHIVE),
    extractDir,
    nodeFolder: path.join(extractDir, NODE_FOLDER),
    nodeExe: path.join(extractDir, NODE_FOLDER, 'node.exe'),
    marker: path.join(extractDir, '.web-pilot-node.json'),
  };
}

async function sha256(file) {
  const hash = createHash('sha256');
  await new Promise((resolve, reject) => {
    const stream = fsSync.createReadStream(file);
    stream.on('data', chunk => hash.update(chunk));
    stream.on('error', reject);
    stream.on('end', resolve);
  });
  return hash.digest('hex');
}

async function ensureWindowsRuntimePayload(root, cacheDir, environment = process.env) {
  const destination = path.join(cacheDir, WINDOWS_RUNTIME_ARCHIVE);
  let digest = null;
  try { digest = await sha256(destination); } catch {}
  if (digest === WINDOWS_RUNTIME_SHA256) return { file: destination, sha256: digest, reused: true };
  await fs.rm(destination, { force: true });
  for (const source of windowsRuntimeSourceCandidates(root, environment)) {
    try {
      if (await sha256(source) !== WINDOWS_RUNTIME_SHA256) continue;
      await fs.copyFile(source, destination);
      if (await sha256(destination) === WINDOWS_RUNTIME_SHA256) return { file: destination, sha256: WINDOWS_RUNTIME_SHA256, reused: false };
    } catch {}
  }
  throw new Error(`Windows Codex Local payload missing. Put ${WINDOWS_RUNTIME_ARCHIVE} at ${destination} or set WEB_PILOT_WINDOWS_RUNTIME_ARCHIVE.`);
}

async function download(url, destination) {
  const response = await fetch(url, { redirect: 'follow' });
  if (!response.ok || !response.body) throw new Error(`Node download failed: HTTP ${response.status}`);
  const temporary = destination + '.download';
  await fs.rm(temporary, { force: true });
  const file = fsSync.createWriteStream(temporary, { mode: 0o600 });
  await new Promise(async (resolve, reject) => {
    file.on('error', reject); file.on('finish', resolve);
    try {
      for await (const chunk of response.body) if (!file.write(chunk)) await new Promise(r => file.once('drain', r));
      file.end();
    } catch (error) { file.destroy(error); }
  });
  await fs.rename(temporary, destination);
}

export function extractionCommand(platform, archive, destination) {
  if (platform === 'darwin') return { executable: '/usr/bin/ditto', args: ['-x', '-k', archive, destination], env: {} };
  if (platform === 'win32') return {
    executable: 'powershell.exe',
    args: ['-NoLogo', '-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command',
      'Expand-Archive -LiteralPath $env:WEB_PILOT_NODE_ARCHIVE -DestinationPath $env:WEB_PILOT_NODE_DESTINATION -Force'],
    env: { WEB_PILOT_NODE_ARCHIVE: archive, WEB_PILOT_NODE_DESTINATION: destination },
  };
  return { executable: 'unzip', args: ['-q', archive, '-d', destination], env: {} };
}

export async function prepareWindowsToolchain({ root = ROOT, platform = process.platform, fetchArchive = download, run = execute } = {}) {
  const p = windowsToolchainPaths(root);
  await fs.mkdir(p.cacheDir, { recursive: true });
  const runtime = await ensureWindowsRuntimePayload(root, p.cacheDir);
  let digest = null;
  try { digest = await sha256(p.archive); } catch {}
  if (digest !== NODE_SHA256) {
    await fs.rm(p.archive, { force: true });
    const packagedNode = path.join(root, 'windows-app', 'resources', 'windows-payload', NODE_ARCHIVE);
    try {
      if (await sha256(packagedNode) === NODE_SHA256) await fs.copyFile(packagedNode, p.archive);
    } catch {}
    try { digest = await sha256(p.archive); } catch { digest = null; }
    if (digest !== NODE_SHA256) {
      await fetchArchive(NODE_URL, p.archive);
      digest = await sha256(p.archive);
    }
  }
  if (digest !== NODE_SHA256) throw new Error(`Node payload SHA-256 mismatch: ${digest ?? 'missing'}`);
  let marker = null;
  try { marker = JSON.parse(await fs.readFile(p.marker, 'utf8')); } catch {}
  if (marker?.sha256 !== NODE_SHA256 || !fsSync.existsSync(p.nodeExe)) {
    await fs.rm(p.extractDir, { recursive: true, force: true });
    await fs.mkdir(p.extractDir, { recursive: true });
    const command = extractionCommand(platform, p.archive, p.extractDir);
    await run(command.executable, command.args, { timeout: 120000, maxBuffer: 4 * 1024 * 1024,
      env: { ...process.env, ...command.env }, windowsHide: true });
    if (!fsSync.existsSync(p.nodeExe)) throw new Error(`Portable Node extraction incomplete: ${p.nodeExe}`);
    await fs.writeFile(p.marker, JSON.stringify({ schemaVersion: 1, version: NODE_VERSION, sha256: NODE_SHA256 }, null, 2) + '\n');
  }
  return { ...p, sha256: NODE_SHA256, version: NODE_VERSION, runtimeArchive: runtime.file, runtimeSha256: runtime.sha256 };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  prepareWindowsToolchain().then(result => process.stdout.write(JSON.stringify(result) + '\n')).catch(error => {
    console.error(error.message); process.exitCode = 1;
  });
}
