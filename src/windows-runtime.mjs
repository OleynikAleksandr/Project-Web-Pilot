import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFile as execFileCallback } from 'node:child_process';
import { promisify } from 'node:util';

const execFile = promisify(execFileCallback);
export const WINDOWS_RUNTIME_ARCHIVE = 'Windows-Codex-Local-2026-09-10.zip';
export const WINDOWS_RUNTIME_SHA256 = '1f041488ad97d8abf1984fd3521afb8abe15f50b8df3d3e11f1cc4248e019d98';
export const WINDOWS_RUNTIME_FOLDER = 'Windows-Codex-Local';

export class WindowsRuntimeError extends Error {
  constructor(code, message) { super(message); this.code = code; }
}

export function windowsRuntimePaths(dataDir, payloadFile = '') {
  const api = path.win32;
  const root = api.join(dataDir, 'runtime');
  const folder = api.join(root, WINDOWS_RUNTIME_FOLDER);
  return {
    root,
    folder,
    control: api.join(folder, 'control.py'),
    python: api.join(folder, '.venv', 'Scripts', 'python.exe'),
    locations: api.join(folder, '.runtime', 'locations.json'),
    setupScript: api.join(folder, 'scripts', 'setup.ps1'),
    connectScript: api.join(folder, '2_CONNECT_TUNNEL.cmd'),
    marker: api.join(root, 'windows-runtime.json'),
    staging: api.join(root, '.windows-runtime-staging'),
    payloadFile,
  };
}

export function windowsExpandInvocation(payloadFile, destination) {
  return {
    executable: 'powershell.exe',
    args: ['-NoLogo', '-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command',
      'Expand-Archive -LiteralPath $env:WEB_PILOT_RUNTIME_ARCHIVE -DestinationPath $env:WEB_PILOT_RUNTIME_DESTINATION -Force'],
    environment: { WEB_PILOT_RUNTIME_ARCHIVE: payloadFile, WEB_PILOT_RUNTIME_DESTINATION: destination },
  };
}

export function windowsSetupInvocation(setupScript, workspace) {
  return {
    executable: 'powershell.exe',
    args: ['-NoLogo', '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', setupScript, '-Workspace', workspace],
  };
}

export async function sha256File(file) {
  const hash = createHash('sha256');
  await new Promise((resolve, reject) => {
    const stream = fsSync.createReadStream(file);
    stream.on('data', chunk => hash.update(chunk));
    stream.on('error', reject);
    stream.on('end', resolve);
  });
  return hash.digest('hex');
}

async function exists(file) {
  try { await fs.access(file); return true; } catch { return false; }
}

export class WindowsRuntimeBootstrap {
  constructor({ payloadFile, dataDir, execute = execFile, environment = process.env, platform = process.platform,
    expectedSha256 = WINDOWS_RUNTIME_SHA256, onState = null } = {}) {
    if (!payloadFile || !dataDir) throw new TypeError('WindowsRuntimeBootstrap requires payloadFile and dataDir');
    this.platform = platform;
    this.environment = environment;
    this.execute = execute;
    this.expectedSha256 = expectedSha256;
    this.paths = windowsRuntimePaths(dataDir, payloadFile);
    this.onState = typeof onState === 'function' ? onState : null;
    this.pending = null;
    this.state = { phase: platform === 'win32' ? 'embedded' : 'unavailable', folder: this.paths.folder };
  }

  snapshot() { return { ...this.state }; }
  #publish(next) { this.state = { ...this.state, ...next, folder: this.paths.folder }; try { this.onState?.(this.snapshot()); } catch {} }

  async #marker() {
    try { return JSON.parse(await fs.readFile(this.paths.marker, 'utf8')); } catch { return null; }
  }

  async inspect() {
    if (this.platform !== 'win32') return this.snapshot();
    const marker = await this.#marker();
    const installed = marker?.payloadSha256 === this.expectedSha256
      && await exists(this.paths.control) && await exists(this.paths.python) && await exists(this.paths.locations);
    this.#publish({ phase: installed ? 'installed' : 'embedded', installed, payloadSha256: marker?.payloadSha256 ?? null });
    return this.snapshot();
  }

  ensure(workspace) {
    if (this.platform !== 'win32') return Promise.reject(new WindowsRuntimeError('WINDOWS_ONLY', 'Windows runtime доступен только в Windows-сборке.'));
    if (this.pending) return this.pending;
    this.pending = this.#ensure(workspace).finally(() => { this.pending = null; });
    return this.pending;
  }

  async #ensure(workspace) {
    if (typeof workspace !== 'string' || !path.win32.isAbsolute(workspace)) {
      throw new WindowsRuntimeError('WINDOWS_WORKSPACE_REQUIRED', 'Для подготовки Windows runtime нужен абсолютный путь workspace.');
    }
    const current = await this.inspect();
    if (current.installed) return { ...current, reused: true };
    this.#publish({ phase: 'verifying', installed: false, error: null });
    let actual;
    try { actual = await sha256File(this.paths.payloadFile); }
    catch { throw new WindowsRuntimeError('WINDOWS_RUNTIME_PAYLOAD_MISSING', 'В Windows-поставке отсутствует встроенный Codex Local runtime.'); }
    if (actual !== this.expectedSha256) {
      throw new WindowsRuntimeError('WINDOWS_RUNTIME_PAYLOAD_DAMAGED', 'SHA-256 встроенного Windows runtime не совпадает с каноническим пакетом.');
    }
    const marker = await this.#marker();
    if (marker && marker.payloadSha256 !== this.expectedSha256 && await exists(this.paths.folder)) {
      throw new WindowsRuntimeError('WINDOWS_RUNTIME_UPDATE_REQUIRES_STOP', 'Обнаружена другая установленная версия Windows runtime. Остановите её перед обновлением.');
    }
    this.#publish({ phase: 'extracting', payloadSha256: actual });
    await fs.rm(this.paths.staging, { recursive: true, force: true });
    await fs.mkdir(this.paths.staging, { recursive: true });
    const expand = windowsExpandInvocation(this.paths.payloadFile, this.paths.staging);
    await this.execute(expand.executable, expand.args, {
      timeout: 180000, maxBuffer: 4 * 1024 * 1024,
      env: { ...this.environment, ...expand.environment }, windowsHide: true,
    });
    const top = await fs.readdir(this.paths.staging);
    if (top.length !== 1 || top[0] !== WINDOWS_RUNTIME_FOLDER) {
      await fs.rm(this.paths.staging, { recursive: true, force: true });
      throw new WindowsRuntimeError('WINDOWS_RUNTIME_ARCHIVE_INVALID', 'Встроенный Windows runtime имеет неожиданную структуру архива.');
    }
    const extracted = path.win32.join(this.paths.staging, WINDOWS_RUNTIME_FOLDER);
    await fs.rm(this.paths.folder, { recursive: true, force: true });
    await fs.rename(extracted, this.paths.folder);
    await fs.rm(this.paths.staging, { recursive: true, force: true });
    this.#publish({ phase: 'installing' });
    const setup = windowsSetupInvocation(this.paths.setupScript, workspace);
    try {
      await this.execute(setup.executable, setup.args, {
        timeout: 15 * 60 * 1000, maxBuffer: 8 * 1024 * 1024,
        env: { ...this.environment, PYTHONUTF8: '1', PYTHONDONTWRITEBYTECODE: '1' }, windowsHide: true,
      });
    } catch (error) {
      this.#publish({ phase: 'error', error: 'WINDOWS_RUNTIME_SETUP_FAILED' });
      throw new WindowsRuntimeError('WINDOWS_RUNTIME_SETUP_FAILED', String(error?.stderr || error?.message || 'Windows runtime setup failed').slice(-1500));
    }
    if (!(await exists(this.paths.control) && await exists(this.paths.python) && await exists(this.paths.locations))) {
      throw new WindowsRuntimeError('WINDOWS_RUNTIME_SETUP_INCOMPLETE', 'Windows runtime setup завершился без обязательных файлов.');
    }
    const markerData = { schemaVersion: 1, payloadSha256: actual, installedAt: new Date().toISOString(), folder: this.paths.folder };
    await fs.mkdir(this.paths.root, { recursive: true });
    await fs.writeFile(this.paths.marker + '.tmp', JSON.stringify(markerData, null, 2) + '\n', { mode: 0o600 });
    await fs.rename(this.paths.marker + '.tmp', this.paths.marker);
    this.#publish({ phase: 'installed', installed: true, payloadSha256: actual, error: null });
    return { ...this.snapshot(), reused: false };
  }
}
