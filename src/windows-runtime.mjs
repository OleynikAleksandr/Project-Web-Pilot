import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFile as execFileCallback } from 'node:child_process';
import { promisify } from 'node:util';
import { exists, sha256File } from './common.mjs';
import { ZipError, extractZip, fileReader, zipEntries, zipEntryData } from './zip-archive.mjs';

const execFile = promisify(execFileCallback);
// The pinned archive of the Windows package. Since 0.6.96 only its vendor folder is used:
// uv, tunnel-client, ripgrep and MinGit for the Codex App Server executor and for Workflow Kit.
export const WINDOWS_RUNTIME_ARCHIVE = 'Windows-Codex-Local-2026-09-10.zip';
export const WINDOWS_RUNTIME_SHA256 = '1f041488ad97d8abf1984fd3521afb8abe15f50b8df3d3e11f1cc4248e019d98';
const WINDOWS_RUNTIME_FOLDER = 'Windows-Codex-Local';
// Vendor archive id -> the name under which control.py of the executor reads the executable from tools.json.
export const WINDOWS_VENDOR_TOOLS = Object.freeze({ uv: 'uv', 'tunnel-client': 'tunnel_client', ripgrep: 'rg', git: 'git' });

// The bridge that Web Pilot ran on Windows before 0.6.96. The source patches below are no longer applied.
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
  return removeWindowsUiControl(result);
}

// 0.6.90: the web model observes the desktop but never drives it. These tools are cut from the
// pinned bridge; computer_list_windows, computer_capture_screen and computer_capture_window stay.
export const WINDOWS_REMOVED_TOOLS = Object.freeze(['computer_status', 'computer_activate_window', 'computer_move_mouse',
  'computer_click', 'computer_scroll', 'computer_type_text', 'computer_key_press', 'computer_hotkey', 'computer_release_inputs']);
const WINDOWS_TOOL_DECORATOR = '    @mcp.tool(\n';
const WINDOWS_COMPUTER_USE_STATUS = '        status["computer_use"] = computer.status()\n';

function removeWindowsUiControl(source) {
  const definition = name => new RegExp(`\\n    (?:async )?def ${name}\\(`, 'g');
  const counts = WINDOWS_REMOVED_TOOLS.map(name => (source.match(definition(name)) ?? []).length);
  const statusLines = source.split(WINDOWS_COMPUTER_USE_STATUS).length - 1;
  if (counts.every(count => count === 0) && statusLines === 0) return source;
  // Fail closed: a bridge that has only some of the tools is not the snapshot this overlay knows.
  if (!counts.every(count => count === 1) || statusLines !== 1) {
    throw new WindowsRuntimeError('WINDOWS_RUNTIME_BRIDGE_INVALID', 'Инструменты управления интерфейсом в Windows MCP не соответствуют ожидаемому snapshot.');
  }
  const [head, ...blocks] = source.split(WINDOWS_TOOL_DECORATOR);
  const kept = blocks.filter((block, index) => {
    if (!WINDOWS_REMOVED_TOOLS.some(name => definition(name).test(block))) return true;
    // The last block also holds the end of create_server and must never be dropped.
    if (index === blocks.length - 1) throw new WindowsRuntimeError('WINDOWS_RUNTIME_BRIDGE_INVALID', 'Инструмент управления интерфейсом стоит последним в Windows MCP.');
    return false;
  });
  return [head, ...kept].join(WINDOWS_TOOL_DECORATOR).replace(WINDOWS_COMPUTER_USE_STATUS, '');
}

const WINDOWS_SKILL_DESKTOP_HEADING = '## Desktop\n';
const WINDOWS_SKILL_NEXT_HEADING = '## Turn notifications\n';
export const WINDOWS_SKILL_DESKTOP_SECTION = `## Desktop

This MCP cannot control the mouse, keyboard or windows. Observation only: computer_list_windows lists visible windows, computer_capture_screen and computer_capture_window return screenshots. Do not drive the Windows interface by other means such as SendKeys or UI Automation scripts; the user performs live interface checks. Locked screens, the UAC secure desktop and minimized windows cannot be captured.

Honor existing user authorization and the plugin's permission setting. Do not add repeated confirmations for actions already authorized within the task. The Allow all actions setting does not make Windows system elevation prompts disappear.

`;

// The skill text is the instructions of the Windows MCP server: its Desktop section must not teach UI control.
export function patchWindowsSkillSource(source) {
  const count = text => typeof source === 'string' ? source.split(text).length - 1 : 0;
  if (count(WINDOWS_SKILL_DESKTOP_HEADING) !== 1 || count(WINDOWS_SKILL_NEXT_HEADING) !== 1
    || source.indexOf(WINDOWS_SKILL_DESKTOP_HEADING) > source.indexOf(WINDOWS_SKILL_NEXT_HEADING)) {
    throw new WindowsRuntimeError('WINDOWS_RUNTIME_BRIDGE_INVALID', 'Раздел Desktop в инструкции Windows MCP не соответствует ожидаемому snapshot.');
  }
  return (source.slice(0, source.indexOf(WINDOWS_SKILL_DESKTOP_HEADING)) + WINDOWS_SKILL_DESKTOP_SECTION
    + source.slice(source.indexOf(WINDOWS_SKILL_NEXT_HEADING)))
    .replace('background processes and desktop actions requested in ChatGPT', 'background processes and screenshots');
}

class WindowsRuntimeError extends Error {
  constructor(code, message) { super(message); this.code = code; }
}

export function windowsCommandFailureText(error, fallback = 'Windows runtime command failed') {
  for (const value of [error?.stderr, error?.stdout, error?.message]) {
    const text = String(value ?? '').trim();
    if (text) return text.slice(-1500);
  }
  return fallback;
}

// Where the executor keeps what Project Web Pilot unpacks for it; control.py reads the same marker.
export function windowsExecutorPaths(stateDir, api = path) {
  const runtime = api.join(stateDir, 'runtime');
  return { runtime, tools: api.join(runtime, 'tools'), marker: api.join(runtime, 'tools.json'),
    staging: api.join(runtime, 'tools.staging'), venv: api.join(runtime, 'venv'),
    python: api.join(runtime, 'venv', 'Scripts', 'python.exe') };
}

// Workflow Kit on Windows uses the MinGit of the package, never a Git found on PATH.
export function windowsWorkflowEnvironment(toolsDir, tools, environment = {}, api = path) {
  const gitHome = api.join(api.resolve(toolsDir), 'git');
  const git = api.join(gitHome, 'cmd', 'git.exe');
  if (!tools || typeof tools.git !== 'string' || api.resolve(tools.git).toLowerCase() !== git.toLowerCase()) {
    throw new WindowsRuntimeError('WINDOWS_GIT_LAYOUT_INVALID', 'Комплект Git не соответствует установленным компонентам Windows. Повторите подготовку.');
  }
  const oldPath = Object.entries(environment).find(([key]) => key.toLowerCase() === 'path')?.[1] ?? '';
  return { WORKFLOW_GIT_BIN: git, WORKFLOW_GIT_HOME: gitHome,
    Path: [api.join(gitHome, 'cmd'), api.join(gitHome, 'usr', 'bin'), oldPath].filter(Boolean).join(';') };
}

// Prepares what the executor cannot prepare itself on Windows, where there is no system Python:
// the four vendor tools from the pinned archive and the private Python environment that runs control.py.
export class WindowsExecutorBootstrap {
  constructor({ payloadFile, stateDir, execute = execFile, environment = process.env, platform = process.platform,
    expectedSha256 = WINDOWS_RUNTIME_SHA256, onState = null } = {}) {
    if (!payloadFile || !stateDir) throw new TypeError('WindowsExecutorBootstrap requires payloadFile and stateDir');
    this.payloadFile = payloadFile;
    this.platform = platform;
    this.environment = environment;
    this.execute = execute;
    this.expectedSha256 = expectedSha256;
    this.paths = windowsExecutorPaths(stateDir);
    this.onState = typeof onState === 'function' ? onState : null;
    this.pending = null;
    this.toolsPending = null;
    this.state = { phase: platform === 'win32' ? 'embedded' : 'unavailable', installed: false, toolsReady: false, error: null };
  }

  snapshot() { return { ...this.state }; }

  #publish(next) {
    if (Object.entries(next).every(([key, value]) => this.state[key] === value)) return;
    this.state = { ...this.state, ...next };
    try { this.onState?.(this.snapshot()); } catch { /* a view error must not stop the preparation */ }
  }

  #requireWindows() {
    if (this.platform !== 'win32') throw new WindowsRuntimeError('WINDOWS_ONLY', 'Компоненты Windows доступны только в Windows-сборке.');
  }

  // The recorded executables, or null when the tools are not unpacked from this very archive.
  async #tools() {
    let marker;
    try { marker = JSON.parse((await fs.readFile(this.paths.marker, 'utf8')).replace(/^\uFEFF/, '')); } catch { return null; }
    if (marker?.schema_version !== 1 || marker.archive_sha256 !== this.expectedSha256 || !marker.tools) return null;
    const tools = {};
    for (const key of Object.values(WINDOWS_VENDOR_TOOLS)) {
      const file = marker.tools[key];
      if (typeof file !== 'string' || !path.isAbsolute(file)) return null;
      const relative = path.relative(this.paths.tools, file);
      if (!relative || relative.startsWith('..') || path.isAbsolute(relative) || !await exists(file)) return null;
      tools[key] = file;
    }
    return tools;
  }

  async inspect() {
    if (this.platform !== 'win32') return this.snapshot();
    const tools = await this.#tools();
    const installed = !!tools && await exists(this.paths.python);
    // A running preparation owns the phase; inspection only reports what is already on disk.
    if (!this.pending && !this.toolsPending) this.#publish({ phase: installed ? 'installed' : this.state.phase === 'error' ? 'error' : 'embedded',
      toolsReady: !!tools, installed });
    return { ...this.snapshot(), toolsReady: !!tools, installed };
  }

  // The vendor tools alone: enough for Workflow Kit (Git), needs no internet.
  ensureTools() {
    if (this.toolsPending) return this.toolsPending;
    this.toolsPending = this.#ensureTools().finally(() => { this.toolsPending = null; });
    return this.toolsPending;
  }

  // The tools and the private Python of the executor. The first run downloads Python and needs internet.
  ensure() {
    if (this.pending) return this.pending;
    this.pending = this.#ensure().finally(() => { this.pending = null; });
    return this.pending;
  }

  async #ensureTools() {
    this.#requireWindows();
    let tools = await this.#tools();
    if (tools) { this.#publish({ toolsReady: true }); return tools; }
    this.#publish({ phase: 'verifying', installed: false, toolsReady: false, error: null });
    try {
      let actual;
      try { actual = await sha256File(this.payloadFile); }
      catch { throw new WindowsRuntimeError('WINDOWS_RUNTIME_PAYLOAD_MISSING', 'В Windows-поставке отсутствует архив локальных компонентов.'); }
      if (actual !== this.expectedSha256) {
        throw new WindowsRuntimeError('WINDOWS_RUNTIME_PAYLOAD_DAMAGED', 'SHA-256 архива локальных компонентов Windows не совпадает с закреплённым.');
      }
      this.#publish({ phase: 'extracting' });
      tools = await this.#extract();
    } catch (error) {
      const failure = error instanceof WindowsRuntimeError ? error
        : new WindowsRuntimeError(error instanceof ZipError ? 'WINDOWS_RUNTIME_ARCHIVE_INVALID' : 'WINDOWS_RUNTIME_SETUP_FAILED',
          windowsCommandFailureText(error, 'Не удалось распаковать компоненты Windows.'));
      this.#publish({ phase: 'error', error: failure.code });
      throw failure;
    }
    this.#publish({ phase: 'embedded', toolsReady: true });
    return tools;
  }

  async #extract() {
    const { staging, tools: target, marker } = this.paths;
    const invalid = message => new WindowsRuntimeError('WINDOWS_RUNTIME_ARCHIVE_INVALID', message);
    const recorded = {};
    await fs.rm(staging, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
    const reader = await fileReader(this.payloadFile);
    try {
      const entries = new Map((await zipEntries(reader)).map(entry => [entry.name, entry]));
      const vendor = name => {
        const entry = entries.get(`${WINDOWS_RUNTIME_FOLDER}/vendor/${name}`);
        if (!entry || entry.directory) throw invalid(`В архиве компонентов Windows нет файла vendor/${name}.`);
        return entry;
      };
      let manifest;
      try { manifest = JSON.parse((await zipEntryData(reader, vendor('manifest.json'))).toString('utf8').replace(/^\uFEFF/, '')); }
      catch (error) { throw error instanceof WindowsRuntimeError ? error : invalid('Список компонентов Windows в архиве повреждён.'); }
      if (manifest?.schema_version !== 1 || !Array.isArray(manifest.tools)) throw invalid('Список компонентов Windows имеет неизвестный формат.');
      for (const [id, key] of Object.entries(WINDOWS_VENDOR_TOOLS)) {
        const found = manifest.tools.filter(tool => tool?.id === id);
        const tool = found[0];
        if (found.length !== 1 || typeof tool.file !== 'string' || !/^[A-Za-z0-9._-]+\.zip$/.test(tool.file)
            || typeof tool.sha256 !== 'string' || typeof tool.executable !== 'string') throw invalid(`Компонент ${id} описан в архиве неверно.`);
        const archive = await zipEntryData(reader, vendor(tool.file));
        if (createHash('sha256').update(archive).digest('hex') !== tool.sha256.toLowerCase()) throw invalid(`SHA-256 компонента ${id} не совпадает со списком архива.`);
        const files = await extractZip(archive, path.join(staging, id));
        if (!files.includes(tool.executable)) throw invalid(`В компоненте ${id} нет исполняемого файла ${tool.executable}.`);
        recorded[key] = path.join(target, id, ...tool.executable.split('/'));
      }
    } catch (error) {
      await fs.rm(staging, { recursive: true, force: true }).catch(() => {});
      throw error;
    } finally { await reader.close(); }
    // The marker goes first and comes back last: an interrupted swap is simply repeated.
    await fs.rm(marker, { force: true });
    await fs.rm(target, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
    await fs.rename(staging, target);
    await fs.writeFile(marker + '.tmp', JSON.stringify({ schema_version: 1, archive_sha256: this.expectedSha256, tools: recorded }, null, 2) + '\n', { mode: 0o600 });
    await fs.rename(marker + '.tmp', marker);
    return recorded;
  }

  async #ensure() {
    const tools = await this.ensureTools();
    if (!await exists(this.paths.python)) {
      this.#publish({ phase: 'installing', installed: false, error: null });
      try {
        // The same command control.py setup uses; --clear replaces what an interrupted attempt left.
        await this.execute(tools.uv, ['venv', '--clear', '--managed-python', '--python', '3.13', '--no-config', this.paths.venv], {
          timeout: 15 * 60 * 1000, maxBuffer: 8 * 1024 * 1024, windowsHide: true,
          env: { ...this.environment, UV_PYTHON_INSTALL_DIR: path.join(this.paths.runtime, 'python'), UV_CACHE_DIR: path.join(this.paths.runtime, 'uv-cache') },
        });
      } catch (error) {
        this.#publish({ phase: 'error', error: 'WINDOWS_RUNTIME_SETUP_FAILED' });
        throw new WindowsRuntimeError('WINDOWS_RUNTIME_SETUP_FAILED', windowsCommandFailureText(error, 'Не удалось подготовить Python для локальных инструментов Windows.'));
      }
      if (!await exists(this.paths.python)) {
        this.#publish({ phase: 'error', error: 'WINDOWS_RUNTIME_SETUP_INCOMPLETE' });
        throw new WindowsRuntimeError('WINDOWS_RUNTIME_SETUP_INCOMPLETE', 'Подготовка Python для локальных инструментов Windows завершилась без обязательных файлов.');
      }
    }
    this.#publish({ phase: 'installed', installed: true, toolsReady: true, error: null });
    return this.snapshot();
  }

  async workflowEnvironment() {
    const tools = await this.#tools();
    if (!tools) throw new WindowsRuntimeError('WINDOWS_RUNTIME_NOT_INSTALLED', 'Сначала подготовьте локальные компоненты Windows.');
    const environment = windowsWorkflowEnvironment(this.paths.tools, tools, this.environment);
    if (!await exists(path.join(environment.WORKFLOW_GIT_HOME, 'usr', 'bin', 'sh.exe')))
      throw new WindowsRuntimeError('WINDOWS_GIT_INCOMPLETE', 'Комплект Git неполон. Распакуйте всю Windows-поставку и повторите подготовку.');
    let version;
    try { version = await this.execute(environment.WORKFLOW_GIT_BIN, ['--version'], { timeout: 10000, windowsHide: true }); }
    catch { throw new WindowsRuntimeError('WINDOWS_GIT_START_FAILED', 'Не удалось запустить комплектный Git. Проверьте разрешение Windows на запуск и повторите подготовку.'); }
    if (!/^git version \d+\./.test(version.stdout)) throw new WindowsRuntimeError('WINDOWS_GIT_START_FAILED', 'Комплектный Git не подтвердил готовность.');
    return environment;
  }
}

// One-time cleanup after the bridge that Web Pilot ran on Windows before 0.6.96: its services, its start at
// sign-in and the copy Web Pilot itself unpacked into its data folder. Folders the user chose for the bridge
// and its state with the old tunnel key stay; the executor reads that key once and never writes there.
export async function retireLegacyWindowsRuntime({ dataDir, runtimeRoots = [], legacyStateDir = null, controlFile,
  execute = execFile, environment = process.env, api = path } = {}) {
  if (!dataDir || !api.isAbsolute(dataDir)) throw new TypeError('retireLegacyWindowsRuntime requires an absolute dataDir');
  if (!controlFile) throw new TypeError('retireLegacyWindowsRuntime requires the lifecycle script of the old bridge');
  const installed = api.join(dataDir, 'runtime', WINDOWS_RUNTIME_FOLDER);
  const recorded = [];
  if (legacyStateDir) {
    for (const name of ['mcp.pid.json', 'tunnel.pid.json']) {
      try {
        const record = JSON.parse(await fs.readFile(api.join(legacyStateDir, name), 'utf8'));
        if (typeof record?.package_root === 'string') recorded.push(record.package_root);
      } catch { /* no record: nothing was started from an unknown folder */ }
    }
  }
  const roots = [...new Map([installed, ...runtimeRoots, ...recorded]
    .filter(root => typeof root === 'string' && api.isAbsolute(root))
    .map(root => [api.resolve(root).toLowerCase(), api.resolve(root)])).values()];
  const stopped = [];
  for (const root of roots) {
    const python = api.join(root, '.venv', 'Scripts', 'python.exe');
    // Windows keeps the executable of a running process on disk: without this Python nothing of the folder runs.
    if (!await exists(python)) continue;
    // The lifecycle script of the old bridge stops only the processes it recorded itself, checked by identity.
    await execute(python, ['-B', controlFile, 'stop'], { cwd: root, timeout: 30_000, maxBuffer: 1024 * 1024, windowsHide: true,
      env: { ...environment, PYTHONUTF8: '1', PYTHONDONTWRITEBYTECODE: '1', WEB_PILOT_RUNTIME_ROOT: root } });
    stopped.push(root);
  }
  const systemRoot = Object.entries(environment).find(([key]) => key.toLowerCase() === 'systemroot')?.[1] || 'C:\\Windows';
  try {
    await execute(api.join(systemRoot, 'System32', 'reg.exe'),
      ['delete', 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run', '/v', 'ProjectWebPilotMCP', '/f'],
      { timeout: 10_000, maxBuffer: 64 * 1024, windowsHide: true });
  } catch { /* reg.exe fails when the value is already absent */ }
  for (const leftover of [installed, api.join(dataDir, 'runtime', 'windows-runtime.json'), api.join(dataDir, 'runtime', '.windows-runtime-staging')]) {
    await fs.rm(leftover, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
  }
  return { stopped, removed: installed };
}
