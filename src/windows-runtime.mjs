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

export const WINDOWS_RUNTIME_OVERLAY_VERSION = 1;
export const WINDOWS_RUNTIME_CONTROL_CONTRACT = 2;
export const WINDOWS_LEGACY_CONTROL_SHA256 = '13dd532f339db09cc0a99568ba3be63a12a0c4548f25e9c611fd0978ca70bdda';
export const WINDOWS_CONTEXT_PACKET_SOURCE = String.raw`"""Workflow Kit recovery packet used by Project Web Pilot on Windows."""
from __future__ import annotations

import hashlib
import json
from pathlib import Path
import re
import subprocess
import time
from typing import Any

PROTOCOL = 'inline-context-v1'
MAX_CONTEXT_BYTES = 180000

class ContextPacket:
    @staticmethod
    def _workspace(workspace: str) -> Path:
        if not isinstance(workspace, str) or not workspace.strip() or not Path(workspace).is_absolute():
            raise ValueError('WORKSPACE_REQUIRED: supply the explicit absolute project directory')
        path = Path(workspace).resolve(strict=True)
        if not (path / '.harness/plans/todo-plan.md').is_file() or not (path / 'scripts/workflow.mjs').is_file():
            raise ValueError('WORKFLOW_NOT_INSTALLED: the selected directory has no Workflow Kit')
        node = path / '.harness/runtime/node.exe'
        if not node.is_file():
            raise ValueError('WORKFLOW_RUNTIME_MISSING: reconnect this project in Project Web Pilot')
        return path

    def recover(self, workspace: str) -> dict[str, Any]:
        path = self._workspace(workspace)
        plan_file = path / '.harness/plans/todo-plan.md'
        before = plan_file.read_bytes()
        node = path / '.harness/runtime/node.exe'
        workflow = path / 'scripts/workflow.mjs'
        try:
            process = subprocess.run([str(node), str(workflow), 'recover', '--format', 'json'],
                                     cwd=path, capture_output=True, timeout=25)
        except subprocess.TimeoutExpired as exc:
            raise ValueError('RECOVERY_TIMEOUT: workflow recover exceeded 25 seconds') from exc
        if process.returncode:
            raise ValueError('RECOVERY_FAILED: ' + process.stdout.decode('utf-8', errors='replace')[:2000])
        try:
            packet = json.loads(process.stdout)
            fence = chr(96) * 3
            match = re.search(re.escape(fence) + r'json\s*\n(.*?)\n' + re.escape(fence), before.decode('utf-8'), re.S)
            plan = json.loads(match.group(1))
        except (ValueError, AttributeError) as exc:
            raise ValueError('RECOVERY_INVALID: invalid workflow packet or plan JSON') from exc
        if before != plan_file.read_bytes() or packet.get('plan_revision') != plan.get('plan_revision'):
            raise ValueError('RECOVERY_CHANGED: plan changed while reading; recover again')
        if (packet.get('ok') is not True or packet.get('completeness') != 'COMPLETE'
                or not isinstance(packet.get('text'), str) or not packet['text'].strip()
                or not isinstance(packet.get('signature'), str) or not packet['signature']):
            raise ValueError('RECOVERY_INCOMPLETE: a complete canonical packet is required')
        content = packet['text'].encode('utf-8')
        if len(content) > MAX_CONTEXT_BYTES:
            raise ValueError('RECOVERY_TOO_LARGE: split the workflow context before delivery')
        task_id = packet.get('task_id') or packet.get('next_task_id')
        try:
            task = next((t for t in plan['tasks'] if t['id'] == task_id), None)
            if task_id and task is None:
                raise ValueError('RECOVERY_INVALID: current task is missing from the plan')
            facts = {'project_id': plan['project_id'], 'project_name': plan['project_name'],
                     'plan_revision': plan['plan_revision'], 'scope_id': plan['scope_id'],
                     'execution_scope_status': plan['execution_scope_status'],
                     'delivery_status': plan['delivery_status'], 'task_id': task_id,
                     'task_title': task['title'] if task else None}
            objective, head = plan['objective'], packet['head']
        except (KeyError, TypeError) as exc:
            raise ValueError('RECOVERY_INVALID: project identity is incomplete') from exc
        return {'delivery_protocol': PROTOCOL, 'status': 'ready', 'completeness': 'COMPLETE',
                'workspace': str(path), 'facts': facts, 'objective': objective, 'head': head,
                'signature': packet['signature'], 'context': packet['text'],
                'context_sha256': hashlib.sha256(content).hexdigest(), 'context_bytes': len(content),
                'generated_at_ms': int(time.time() * 1000), 'ack_required': False}
`;

const WINDOWS_CONTEXT_TOOL = String.raw`    @mcp.tool(
        title="Read the selected project context",
        description=("Return the complete canonical Workflow Kit packet for an explicit absolute workspace. "
                     "Web Pilot fetches it before sending the first project message; no acknowledgement is required."),
        annotations=READ_ONLY,
    )
    def workflow_context_recover(workspace: str) -> dict[str, Any]:
        return context_packet.recover(workspace)

`;

export function patchWindowsBridgeSource(source) {
  if (typeof source !== 'string' || !source.includes('FastMCP(') || !source.includes('def bridge_status(')) {
    throw new WindowsRuntimeError('WINDOWS_RUNTIME_BRIDGE_INVALID', 'Windows MCP bridge не соответствует ожидаемому snapshot.');
  }
  let result = source;
  if (!result.includes('from context_packet import ContextPacket')) {
    const anchor = 'from windows_computer import WindowsComputer  # noqa: E402';
    if (!result.includes(anchor)) throw new WindowsRuntimeError('WINDOWS_RUNTIME_BRIDGE_INVALID', 'Не найден import anchor Windows MCP.');
    result = result.replace(anchor, anchor + '\nfrom context_packet import ContextPacket  # noqa: E402');
  }
  if (!result.includes('context_packet = ContextPacket()')) {
    const anchor = '    turn_watchdog = TurnWatchdog()\n';
    if (!result.includes(anchor)) throw new WindowsRuntimeError('WINDOWS_RUNTIME_BRIDGE_INVALID', 'Не найден server-state anchor Windows MCP.');
    result = result.replace(anchor, anchor + '    context_packet = ContextPacket()\n');
  }
  if (!result.includes('def workflow_context_recover(')) {
    const anchor = '        return status\n\n    @mcp.tool(\n        title="Computer status",';
    if (!result.includes(anchor)) throw new WindowsRuntimeError('WINDOWS_RUNTIME_BRIDGE_INVALID', 'Не найден bridge_status anchor Windows MCP.');
    result = result.replace(anchor, '        return status\n\n' + WINDOWS_CONTEXT_TOOL + '    @mcp.tool(\n        title="Computer status",');
  }
  return result;
}

export async function applyWindowsWebPilotOverlay(folder) {
  const serverFile = path.win32.join(folder, 'server', 'context_packet.py');
  const bridgeFile = path.win32.join(folder, 'mcp', 'bridge_mcp.py');
  const bridge = await fs.readFile(bridgeFile, 'utf8');
  const patched = patchWindowsBridgeSource(bridge);
  await fs.writeFile(serverFile, WINDOWS_CONTEXT_PACKET_SOURCE, { encoding: 'utf8', mode: 0o600 });
  if (patched !== bridge) await fs.writeFile(bridgeFile, patched, { encoding: 'utf8', mode: 0o600 });
}

export class WindowsRuntimeError extends Error {
  constructor(code, message) { super(message); this.code = code; }
}

function windowsRuntimeFolderPaths(folder) {
  const api = path.win32;
  return {
    folder,
    control: api.join(folder, 'control.py'),
    python: api.join(folder, '.venv', 'Scripts', 'python.exe'),
    locations: api.join(folder, '.runtime', 'locations.json'),
    setupScript: api.join(folder, 'scripts', 'setup.ps1'),
    connectScript: api.join(folder, '2_CONNECT_TUNNEL.cmd'),
  };
}

export function windowsRuntimePaths(dataDir, payloadFile = '') {
  const api = path.win32;
  const root = api.join(dataDir, 'runtime');
  const folder = api.join(root, WINDOWS_RUNTIME_FOLDER);
  return {
    root,
    ...windowsRuntimeFolderPaths(folder),
    marker: api.join(root, 'windows-runtime.json'),
    staging: api.join(root, '.windows-runtime-staging'),
    payloadFile,
  };
}

export function windowsRuntimeStateDirectory(environment = process.env) {
  const base = environment?.LOCALAPPDATA;
  return typeof base === 'string' && path.win32.isAbsolute(base) ? path.win32.join(base, 'CodexLocalWindows') : null;
}

export function windowsCommandFailureText(error, fallback = 'Windows runtime command failed') {
  for (const value of [error?.stderr, error?.stdout, error?.message]) {
    const text = String(value ?? '').trim();
    if (text) return text.slice(-1500);
  }
  return fallback;
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

export function windowsTunnelSetupInvocation(connectScript, workingDirectory) {
  return {
    executable: 'powershell.exe',
    args: ['-NoLogo', '-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command',
      'Start-Process -FilePath $env:WEB_PILOT_TUNNEL_SCRIPT -WorkingDirectory $env:WEB_PILOT_TUNNEL_CWD -WindowStyle Normal'],
    environment: { WEB_PILOT_TUNNEL_SCRIPT: connectScript, WEB_PILOT_TUNNEL_CWD: workingDirectory },
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
    expectedSha256 = WINDOWS_RUNTIME_SHA256, onState = null, preferredFolder = null, stateDir = null,
    controlSourceFile = null, legacyControlHashes = [WINDOWS_LEGACY_CONTROL_SHA256] } = {}) {
    if (!payloadFile || !dataDir) throw new TypeError('WindowsRuntimeBootstrap requires payloadFile and dataDir');
    this.platform = platform;
    this.environment = environment;
    this.execute = execute;
    this.expectedSha256 = expectedSha256;
    this.paths = windowsRuntimePaths(dataDir, payloadFile);
    this.preferredFolder = typeof preferredFolder === 'string' && path.win32.isAbsolute(preferredFolder) ? preferredFolder : null;
    this.stateDir = stateDir ?? windowsRuntimeStateDirectory(environment);
    this.controlSourceFile = controlSourceFile;
    this.legacyControlHashes = new Set(legacyControlHashes);
    this.onState = typeof onState === 'function' ? onState : null;
    this.pending = null;
    this.external = null;
    this.state = { phase: platform === 'win32' ? 'embedded' : 'unavailable', folder: this.paths.folder };
  }

  snapshot() { return { ...this.state }; }
  #publish(next) { this.state = { ...this.state, ...next, folder: next?.folder ?? this.state.folder ?? this.paths.folder }; try { this.onState?.(this.snapshot()); } catch {} }

  async #marker() {
    try { return JSON.parse(await fs.readFile(this.paths.marker, 'utf8')); } catch { return null; }
  }

  async #controlFor(folder) {
    const layout = windowsRuntimeFolderPaths(folder);
    if (!this.controlSourceFile) return layout.control;
    let desired, current;
    try { [desired, current] = await Promise.all([sha256File(this.controlSourceFile), sha256File(layout.control)]); }
    catch { throw new WindowsRuntimeError('WINDOWS_RUNTIME_CONTROL_MISSING', 'Не удалось проверить Windows lifecycle control.'); }
    if (current === desired || this.legacyControlHashes.has(current)) return this.controlSourceFile;
    throw new WindowsRuntimeError('WINDOWS_RUNTIME_EXTERNAL_INCOMPATIBLE', 'Windows control.py изменён и не будет автоматически адаптирован.');
  }

  async #runControl(folder, command, extraArgs = []) {
    const layout = windowsRuntimeFolderPaths(folder);
    const control = await this.#controlFor(folder);
    return this.execute(layout.python, ['-B', control, command, ...extraArgs], {
      cwd: folder, timeout: command === 'start' ? 90000 : 20000, maxBuffer: 1024 * 1024,
      env: { ...this.environment, PYTHONUTF8: '1', PYTHONDONTWRITEBYTECODE: '1',
        ...(control !== layout.control ? { WEB_PILOT_RUNTIME_ROOT: folder } : {}) }, windowsHide: true,
    });
  }

  async #externalCandidates() {
    const values = [];
    if (this.stateDir) {
      for (const name of ['mcp.pid.json', 'tunnel.pid.json']) {
        try {
          const record = JSON.parse(await fs.readFile(path.win32.join(this.stateDir, name), 'utf8'));
          if (typeof record?.package_root === 'string' && path.win32.isAbsolute(record.package_root)) values.push(record.package_root);
        } catch {}
      }
    }
    if (this.preferredFolder) values.push(this.preferredFolder);
    const bundled = path.win32.resolve(this.paths.folder).toLowerCase();
    return [...new Map(values.map(value => [path.win32.resolve(value).toLowerCase(), value])).entries()]
      .filter(([key]) => key !== bundled).map(([, value]) => value);
  }

  async #inspectExternal() {
    for (const folder of await this.#externalCandidates()) {
      const layout = windowsRuntimeFolderPaths(folder);
      if (!(await exists(layout.control) && await exists(layout.python) && await exists(layout.locations))) continue;
      try {
        const output = await this.#runControl(folder, 'status');
        const service = JSON.parse(output.stdout);
        if (!service?.mcp || !service?.tunnel || typeof service.package_root !== 'string') continue;
        if (this.controlSourceFile && service.runtime_contract !== WINDOWS_RUNTIME_CONTROL_CONTRACT) continue;
        if ([service.mcp, service.tunnel].some(item => item?.running && !item?.owned)) continue;
        if (path.win32.resolve(service.package_root).toLowerCase() !== path.win32.resolve(folder).toLowerCase()) continue;
        return { folder, layout, service };
      } catch {}
    }
    return null;
  }

  async inspect() {
    if (this.platform !== 'win32') return this.snapshot();
    const external = await this.#inspectExternal();
    if (external) {
      this.external = external;
      this.#publish({ phase: 'installed', installed: true, source: 'external', folder: external.folder,
        payloadSha256: null, service: external.service, error: null });
      return this.snapshot();
    }
    this.external = null;
    const marker = await this.#marker();
    const installed = marker?.payloadSha256 === this.expectedSha256 && marker?.overlayVersion === WINDOWS_RUNTIME_OVERLAY_VERSION
      && await exists(this.paths.control) && await exists(this.paths.python) && await exists(this.paths.locations);
    this.#publish({ phase: installed ? 'installed' : 'embedded', installed, source: installed ? 'bundled' : 'embedded',
      folder: this.paths.folder, payloadSha256: marker?.payloadSha256 ?? null, service: null });
    return this.snapshot();
  }

  ensure(workspace) {
    if (this.platform !== 'win32') return Promise.reject(new WindowsRuntimeError('WINDOWS_ONLY', 'Windows runtime доступен только в Windows-сборке.'));
    if (this.pending) return this.pending;
    this.pending = this.#ensure(workspace).finally(() => { this.pending = null; });
    return this.pending;
  }

  async #externalControl(folder, command, extraArgs = []) { return this.#runControl(folder, command, extraArgs); }


  async #ensureExternal(current) {
    const folder = current.folder;
    const bridgeFile = path.win32.join(folder, 'mcp', 'bridge_mcp.py');
    const contextFile = path.win32.join(folder, 'server', 'context_packet.py');
    let bridge;
    try { bridge = await fs.readFile(bridgeFile, 'utf8'); }
    catch { throw new WindowsRuntimeError('WINDOWS_RUNTIME_EXTERNAL_INCOMPATIBLE', `Найдена установленная Codex Local Windows, но отсутствует совместимый MCP bridge: ${folder}`); }
    let patched;
    try { patched = patchWindowsBridgeSource(bridge); }
    catch (error) { throw new WindowsRuntimeError('WINDOWS_RUNTIME_EXTERNAL_INCOMPATIBLE', `Найдена установленная Codex Local Windows, но её MCP bridge несовместим с Web Pilot: ${error.message}`); }
    let contextBefore = null;
    let contextExisted = false;
    try { contextBefore = await fs.readFile(contextFile, 'utf8'); contextExisted = true; } catch {}
    const needsOverlay = patched !== bridge || contextBefore !== WINDOWS_CONTEXT_PACKET_SOURCE;
    if (!needsOverlay) {
      this.#publish({ phase: 'installed', installed: true, source: 'external', folder, error: null });
      return { ...this.snapshot(), control: this.controlSourceFile ?? windowsRuntimeFolderPaths(folder).control, reused: true, adopted: true };
    }
    const mcpWasRunning = !!current.service?.mcp?.owned && !!current.service?.mcp?.running;
    const tunnelWasRunning = !!current.service?.tunnel?.owned && !!current.service?.tunnel?.running;
    const wasRunning = mcpWasRunning || tunnelWasRunning;
    this.#publish({ phase: 'adopting', installed: true, source: 'external', folder, error: null });
    try {
      if (wasRunning) await this.#externalControl(folder, 'stop');
      await fs.writeFile(contextFile, WINDOWS_CONTEXT_PACKET_SOURCE, { encoding: 'utf8', mode: 0o600 });
      if (patched !== bridge) await fs.writeFile(bridgeFile, patched, { encoding: 'utf8', mode: 0o600 });
      if (wasRunning) await this.#externalControl(folder, 'start', tunnelWasRunning ? [] : ['--mcp-only']);
    } catch (error) {
      try {
        await fs.writeFile(bridgeFile, bridge, { encoding: 'utf8', mode: 0o600 });
        if (contextExisted) await fs.writeFile(contextFile, contextBefore, { encoding: 'utf8', mode: 0o600 });
        else await fs.rm(contextFile, { force: true });
        if (wasRunning) await this.#externalControl(folder, 'start', tunnelWasRunning ? [] : ['--mcp-only']);
      } catch {}
      this.#publish({ phase: 'error', installed: true, source: 'external', folder, error: 'WINDOWS_RUNTIME_EXTERNAL_ADOPTION_FAILED' });
      throw new WindowsRuntimeError('WINDOWS_RUNTIME_EXTERNAL_ADOPTION_FAILED', windowsCommandFailureText(error, 'Не удалось подключить существующую Codex Local Windows.'));
    }
    const refreshed = await this.#inspectExternal();
    if (refreshed) this.external = refreshed;
    this.#publish({ phase: 'installed', installed: true, source: 'external', folder, service: refreshed?.service ?? current.service, error: null });
    return { ...this.snapshot(), control: this.controlSourceFile ?? windowsRuntimeFolderPaths(folder).control, reused: true, adopted: true };
  }

  async launchTunnelSetup() {
    if (this.platform !== 'win32') throw new WindowsRuntimeError('WINDOWS_ONLY', 'Настройка tunnel доступна только в Windows-сборке.');
    const current = await this.inspect();
    const layout = windowsRuntimeFolderPaths(current.folder);
    if (!current.installed || !(await exists(layout.connectScript))) {
      throw new WindowsRuntimeError('WINDOWS_RUNTIME_NOT_INSTALLED', 'Сначала установите или подключите Windows runtime.');
    }
    if (current.source === 'external' && current.service?.tunnel?.configured) {
      return { launched: false, configured: true, folder: current.folder };
    }
    const launch = windowsTunnelSetupInvocation(layout.connectScript, current.folder);
    await this.execute(launch.executable, launch.args, {
      timeout: 15000, maxBuffer: 1024 * 1024,
      env: { ...this.environment, ...launch.environment }, windowsHide: true,
    });
    this.#publish({ phase: 'tunnel-setup-launched', installed: true, error: null, folder: current.folder });
    return { launched: true, folder: current.folder };
  }

  async #ensure(workspace) {
    if (typeof workspace !== 'string' || !path.win32.isAbsolute(workspace)) {
      throw new WindowsRuntimeError('WINDOWS_WORKSPACE_REQUIRED', 'Для подготовки Windows runtime нужен абсолютный путь workspace.');
    }
    const current = await this.inspect();
    if (current.installed && current.source === 'external') return this.#ensureExternal(current);
    if (current.installed) return { ...current, control: this.controlSourceFile ?? windowsRuntimeFolderPaths(current.folder).control, reused: true };
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
    await applyWindowsWebPilotOverlay(this.paths.folder);
    this.#publish({ phase: 'installing' });
    const setup = windowsSetupInvocation(this.paths.setupScript, workspace);
    try {
      await this.execute(setup.executable, setup.args, {
        timeout: 15 * 60 * 1000, maxBuffer: 8 * 1024 * 1024,
        env: { ...this.environment, PYTHONUTF8: '1', PYTHONDONTWRITEBYTECODE: '1' }, windowsHide: true,
      });
    } catch (error) {
      this.#publish({ phase: 'error', error: 'WINDOWS_RUNTIME_SETUP_FAILED' });
      throw new WindowsRuntimeError('WINDOWS_RUNTIME_SETUP_FAILED', windowsCommandFailureText(error, 'Windows runtime setup failed'));
    }
    if (!(await exists(this.paths.control) && await exists(this.paths.python) && await exists(this.paths.locations))) {
      throw new WindowsRuntimeError('WINDOWS_RUNTIME_SETUP_INCOMPLETE', 'Windows runtime setup завершился без обязательных файлов.');
    }
    const markerData = { schemaVersion: 1, payloadSha256: actual, overlayVersion: WINDOWS_RUNTIME_OVERLAY_VERSION, installedAt: new Date().toISOString(), folder: this.paths.folder };
    await fs.mkdir(this.paths.root, { recursive: true });
    await fs.writeFile(this.paths.marker + '.tmp', JSON.stringify(markerData, null, 2) + '\n', { mode: 0o600 });
    await fs.rename(this.paths.marker + '.tmp', this.paths.marker);
    this.#publish({ phase: 'installed', installed: true, payloadSha256: actual, error: null });
    return { ...this.snapshot(), control: this.controlSourceFile ?? this.paths.control, reused: false };
  }
}
