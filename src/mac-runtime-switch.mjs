import { exists } from './common.mjs';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { execFile as execFileCallback } from 'node:child_process';
import { promisify } from 'node:util';
import { LocalMcpClient, RuntimeError, validateContextPacket } from './mcp-runtime.mjs';
import { executePrivateInput, runTunnelHelper } from './tunnel-setup.mjs';

const execFile = promisify(execFileCallback);
// The only local MCP backend on macOS.
export const MAC_RUNTIME_LABEL = 'Codex App Server Local Mac';
export const APP_SERVER_LAUNCH_AGENT = 'com.oleynik.WebPilotCodexExecutor';
// The local runtime retired in 0.6.91. These names exist only to remove what earlier versions installed.
export const LEGACY_LAUNCH_AGENT = 'com.oleynik.CodexLocalMac';
const LEGACY_RUNTIME_FOLDER = 'Codex-Local-Mac';
// How ChatGPT reaches the MCP. The VPS tunnel itself runs whenever it is
// configured (Claude uses it too); the channel only decides whether tunnel-client runs.
export const CHATGPT_CHANNEL_SECURE = 'secure-tunnel';
export const CHATGPT_CHANNEL_VPS = 'vps';
export const CHATGPT_CHANNELS = Object.freeze([CHATGPT_CHANNEL_SECURE, CHATGPT_CHANNEL_VPS]);
// Read by tools/codex-app-server-mcp/server.py when a client asks for the project context without a workspace.
export const ACTIVE_WORKSPACE_FILE = 'active-workspace.json';
export const CODEX_NOT_FOUND_MESSAGE = 'На этом Mac не найден Codex. Установите Codex CLI или приложение ChatGPT и нажмите «Проверить и продолжить».';

const TUNNEL_SETUP_ERRORS = {
  MAC_TUNNEL_ID_INVALID: 'Вставьте полный ID туннеля, начинающийся с tunnel_, и подтвердите ввод ещё раз.',
  MAC_TUNNEL_PROMPT_FAILED: 'Не удалось открыть окно ввода подключения. Обновите Web Pilot и повторите ввод. Данные подключения не сохранены.',
  MAC_TUNNEL_INVALID_DATA: 'Проверьте формат tunnel_id и ключа и повторите ввод. Данные подключения не сохранены.',
  MAC_TUNNEL_SETUP_FAILED: 'Не удалось завершить настройку подключения. Повторите ввод. Если ошибка повторяется, сообщите разработчику. Действующее подключение автоматически не заменяется.',
};

function vpsProblem(vps) {
  if (!vps?.configured) return 'Свой сервер для канала VPS не настроен.';
  if (vps.conflict) return 'В ~/.ssh/config у vps-mcp-tunnel остался RemoteForward: обновите настройку сервера.';
  if (vps.error) return vps.error;
  if (!vps.portMatches) return 'Туннель VPS ещё не переключён на текущий порт MCP.';
  return 'Туннель VPS не запущен' + (vps.lastError?.message ? ': ' + vps.lastError.message : '.');
}

function vpsAsTunnel(vps) {
  return { ready: !!vps?.ready, owned: true, configured: !!vps?.configured, running: !!vps?.running };
}

function xml(value) {
  return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;').replaceAll("'", '&apos;');
}

export class CodexAppServerRuntime {
  constructor({ sourceDir, stateDir = path.join(os.homedir(), 'Library/Application Support/WebPilotCodexExecutor'),
    python = '/usr/bin/python3', execute = execFile, executeInput = executePrivateInput, sessionPlans, environment = process.env,
    uv = null } = {}) {
    if (!sourceDir || !path.isAbsolute(sourceDir)) throw new TypeError('CodexAppServerRuntime requires an absolute sourceDir');
    if (!sessionPlans) throw new TypeError('CodexAppServerRuntime requires sessionPlans');
    this.sourceDir = sourceDir;
    this.stateDir = stateDir;
    this.installedSource = path.join(stateDir, 'source');
    this.python = python;
    this.execute = execute;
    this.executeInput = executeInput;
    this.sessionPlans = sessionPlans;
    this.environment = { ...environment };
    this.uv = uv;
    this.expectedServerName = MAC_RUNTIME_LABEL;
    this.client = null;
    this.pending = null;
    this.mcpOnlyPending = null;
    this.configurePending = null;
    this.lastStatus = null;
    this.activeWorkspace = null;
    // Set by MacRuntimeSwitcher.activate: until then nothing here may be assumed installed or running.
    this.activated = false;
  }

  // The bundled server gives the agent the project context in parts, so Web Pilot sends no recovery message.
  get contextDelivery() { return 'mcp'; }

  // First-run wizard: the services may be asked for their status only after activation.
  async inspect() { return { installed: this.activated, folder: this.stateDir }; }

  // True once setup has completed on this Mac: the services then start in seconds, without downloads.
  async prepared() {
    return await exists(path.join(this.stateDir, 'runtime', 'venv', 'bin', 'python'))
      && await exists(path.join(this.stateDir, 'runtime', 'tunnel-client'));
  }

  async setActiveWorkspace(workspace) {
    if (!path.isAbsolute(workspace ?? '')) throw new TypeError('setActiveWorkspace requires an absolute workspace');
    if (this.activeWorkspace === workspace) return false;
    await fs.mkdir(this.stateDir, { recursive: true, mode: 0o700 });
    const file = path.join(this.stateDir, ACTIVE_WORKSPACE_FILE), temp = file + '.tmp-' + process.pid;
    await fs.writeFile(temp, JSON.stringify({ workspace, updated_at_ms: Date.now() }) + '\n', { mode: 0o600 });
    await fs.rename(temp, file);
    this.activeWorkspace = workspace;
    return true;
  }

  async syncSource() {
    const stage = this.installedSource + '.stage-' + process.pid;
    await fs.mkdir(this.stateDir, { recursive: true, mode: 0o700 });
    await fs.rm(stage, { recursive: true, force: true });
    await fs.cp(this.sourceDir, stage, { recursive: true, filter: file => path.basename(file) !== '__pycache__' });
    await fs.rm(this.installedSource, { recursive: true, force: true });
    await fs.rename(stage, this.installedSource);
    return this.installedSource;
  }

  controlEnvironment() {
    return {
      ...this.environment,
      PYTHONDONTWRITEBYTECODE: '1',
      WEB_PILOT_CODEX_EXECUTOR_STATE_DIR: this.stateDir,
      // The packaged uv builds the venv on a Mac that has only the system Python.
      ...(this.uv ? { WEB_PILOT_UV: this.uv } : {}),
    };
  }

  // Runs one control.py command and returns its JSON; a failure carries the bounded message of control.py.
  async #controlCommand(args, { timeout = 20_000, code, fallback }) {
    const control = path.join(this.installedSource, 'control.py');
    let output;
    try {
      output = await this.execute(this.python, ['-B', control, ...args],
        { cwd: this.installedSource, timeout, maxBuffer: 2 * 1024 * 1024, env: this.controlEnvironment() });
    } catch (error) {
      let report = null;
      try { report = JSON.parse(error.stdout || error.stderr); } catch { /* bounded public error */ }
      if (report?.code === 'CODEX_NOT_FOUND') {
        throw Object.assign(new RuntimeError('MAC_CODEX_NOT_FOUND', CODEX_NOT_FOUND_MESSAGE), { publicMessage: CODEX_NOT_FOUND_MESSAGE });
      }
      throw new RuntimeError(code, report?.error ?? fallback);
    }
    let result;
    try { result = JSON.parse(output.stdout); } catch {
      throw new RuntimeError('RUNTIME_STATUS_INVALID', 'Codex App Server runtime вернул непонятный результат.');
    }
    if (result?.ok === false) throw new RuntimeError(code, String(result.error ?? fallback));
    return result;
  }

  async configureChannel(channel) {
    if (!CHATGPT_CHANNELS.includes(channel)) throw new RuntimeError('CHATGPT_CHANNEL_INVALID', 'Неизвестный канал ChatGPT.');
    if (!await exists(path.join(this.installedSource, 'control.py'))) await this.syncSource();
    const result = await this.#controlCommand(['configure-channel', '--channel', channel],
      { code: 'CHATGPT_CHANNEL_CONFIG_FAILED', fallback: 'Не удалось сохранить канал ChatGPT.' });
    if (result?.chatgpt_channel !== channel) throw new RuntimeError('CHATGPT_CHANNEL_CONFIG_FAILED', 'Канал ChatGPT не сохранён.');
    return result;
  }

  // Also carries the tunnel of the retired local runtime over once; control.py never prints its key.
  async configureSelector() {
    await this.syncSource();
    return this.#controlCommand(['configure-selector'],
      { code: 'APP_SERVER_SELECTOR_CONFIG_FAILED', fallback: 'Не удалось настроить стабильный MCP connector.' });
  }

  async control(command, { mcpOnly = false, tunnelOnly = false } = {}) {
    if (!['setup', 'status', 'start', 'stop', 'selector-start'].includes(command)) throw new RuntimeError('RUNTIME_ACTION_DENIED', 'Эта операция не поддерживается оболочкой.');
    if (!await exists(path.join(this.installedSource, 'control.py')) || command === 'setup') await this.syncSource();
    const result = await this.#controlCommand([command,
      ...(command === 'start' && mcpOnly ? ['--mcp-only'] : []),
      ...(['start', 'stop'].includes(command) && tunnelOnly ? ['--tunnel-only'] : [])],
    { timeout: command === 'setup' ? 10 * 60_000 : command === 'start' ? 90_000 : 20_000,
      code: 'APP_SERVER_RUNTIME_COMMAND_FAILED', fallback: 'Не удалось выполнить Codex App Server runtime.' });
    if (command === 'stop' || command === 'setup') {
      if (command === 'stop' && !tunnelOnly) { this.client = null; this.lastStatus = null; }
      return result;
    }
    if (!result?.mcp || !result?.tunnel || !result.mcp_url) throw new RuntimeError('RUNTIME_STATUS_INVALID', 'Codex App Server runtime вернул неполный status.');
    for (const service of [result.mcp, result.tunnel]) {
      if (service.running && !service.owned) throw new RuntimeError('RUNTIME_FOREIGN_PROCESS', 'Порт или процесс занят другой службой; автоматический запуск остановлен.');
    }
    this.lastStatus = result;
    return result;
  }

  promptTunnelId() { return this.configureTunnel(undefined, { idOnly: true }); }

  // Native dialogs or values from the wizard; the key reaches the worker only through its stdin.
  configureTunnel(credentials, { idOnly = false } = {}) {
    if (this.configurePending) return this.configurePending;
    this.configurePending = this.#configureTunnel(credentials, idOnly).finally(() => { this.configurePending = null; });
    return this.configurePending;
  }

  async #configureTunnel(credentials, idOnly) {
    const helper = path.join(this.installedSource, 'tunnel_prompt.py');
    if (!await exists(helper)) await this.syncSource();
    return runTunnelHelper({
      python: this.python, helper, credentials, idOnly, execute: this.execute, executeInput: this.executeInput,
      options: { cwd: this.installedSource, timeout: 16 * 60 * 1000, maxBuffer: 64 * 1024, env: this.controlEnvironment() },
      errorPrefix: 'MAC', ErrorType: RuntimeError, errorMessages: TUNNEL_SETUP_ERRORS,
    });
  }

  ensure() {
    if (this.pending) return this.pending;
    this.pending = this.prepare().finally(() => { this.pending = null; });
    return this.pending;
  }

  ensureMcpOnly() {
    if (this.mcpOnlyPending) return this.mcpOnlyPending;
    this.mcpOnlyPending = this.prepareMcpOnly().finally(() => { this.mcpOnlyPending = null; });
    return this.mcpOnlyPending;
  }

  async prepareMcpOnly() {
    let status = await this.control('status');
    if (!await exists(status.runtime_python) || !await exists(status.tunnel_client)) {
      await this.control('setup');
      status = await this.control('status');
    }
    if (!status.mcp.ready) status = await this.control('start', { mcpOnly: true });
    if (!status.mcp.ready || !status.mcp.owned) {
      throw new RuntimeError('RUNTIME_NOT_READY', 'Codex App Server MCP ещё не готов.');
    }
    this.client = new LocalMcpClient(status.mcp_url, { expectedServerName: this.expectedServerName });
    const connection = await this.client.initialize();
    this.lastStatus = status;
    return { ...status, connection };
  }

  async prepare() {
    let status = await this.control('status');
    if (!await exists(status.runtime_python) || !await exists(status.tunnel_client)) {
      await this.control('setup');
      status = await this.control('status');
    }
    if (!status.tunnel.configured) {
      if (!status.mcp.ready) status = await this.control('start', { mcpOnly: true });
      throw new RuntimeError('TUNNEL_NOT_CONFIGURED', 'Codex App Server MCP готов, но его Secure MCP Tunnel ещё не настроен.');
    }
    if (!status.mcp.ready || !status.tunnel.ready) status = await this.control('start');
    if (!status.mcp.ready || !status.mcp.owned || !status.tunnel.ready || !status.tunnel.owned) {
      throw new RuntimeError('RUNTIME_NOT_READY', 'Codex App Server MCP или его tunnel ещё не готовы.');
    }
    this.client = new LocalMcpClient(status.mcp_url, { expectedServerName: this.expectedServerName });
    const connection = await this.client.initialize();
    return { ...status, connection };
  }

  async loadContext(workspace) {
    return validateContextPacket(await this.sessionPlans.loadContext(workspace), workspace);
  }
}

// The runtime the rest of Web Pilot talks to: the App Server MCP plus the selected ChatGPT channel.
export class MacSelectedRuntime {
  constructor({ appServerRuntime, vpsTunnel = null, channel = CHATGPT_CHANNEL_SECURE, prepare = null }) {
    if (!appServerRuntime) throw new TypeError('MacSelectedRuntime requires appServerRuntime');
    this.appServerRuntime = appServerRuntime;
    this.vpsTunnel = vpsTunnel;
    this.channel = channel;
    // Idempotent one-time preparation (MacRuntimeSwitcher.activate). The object itself costs nothing to create,
    // so the app can start before the services are installed or even installable.
    this.prepare = typeof prepare === 'function' ? prepare : null;
    this.lastStatus = null;
  }

  get contextDelivery() { return this.appServerRuntime.contextDelivery ?? 'mcp'; }
  get activated() { return !!this.appServerRuntime.activated; }

  async setActiveWorkspace(workspace) { return this.appServerRuntime.setActiveWorkspace(workspace); }

  // In the VPS channel the status "tunnel" is the VPS forward, so every readiness
  // check (startup, sidebar, settings) keeps working without a separate branch.
  combine(status, vps = null) {
    const viaVps = this.channel === CHATGPT_CHANNEL_VPS;
    const combined = {
      ...status,
      tunnel: viaVps ? vpsAsTunnel(vps) : status.tunnel,
      tunnel_ui: viaVps ? null : status.tunnel_ui ?? null,
      stable_tunnel_target: status.tunnel_target ?? null,
      chatgpt_channel: this.channel,
      vps,
    };
    this.lastStatus = combined;
    this.appServerRuntime.lastStatus = combined;
    return combined;
  }

  // The VPS forward must never break the Secure Tunnel channel.
  async applyVps(mcpUrl) {
    if (!this.vpsTunnel) return null;
    try { return await this.vpsTunnel.apply(mcpUrl); } catch (error) {
      return { configured: true, conflict: false, running: false, ready: false, owned: true, portMatches: false,
        error: String(error?.message ?? error).slice(0, 200), lastError: null, connector: null };
    }
  }

  async vpsStatus(mcpUrl) {
    if (!this.vpsTunnel) return null;
    try { return await this.vpsTunnel.status(mcpUrl); } catch { return null; }
  }

  async startStable() {
    let stable = await this.appServerRuntime.control('status');
    if (!stable.tunnel?.configured) throw new RuntimeError('TUNNEL_NOT_CONFIGURED', 'Локальный MCP готов, но Secure MCP Tunnel ещё не настроен.');
    if (!stable.tunnel?.ready) stable = await this.appServerRuntime.control('start', { tunnelOnly: true });
    if (!stable.tunnel?.ready || !stable.tunnel?.owned || !stable.tunnel?.configured) {
      throw new RuntimeError('RUNTIME_NOT_READY', 'Стабильный Secure MCP Tunnel ещё не готов.');
    }
    return stable;
  }

  async ready() { if (this.prepare) await this.prepare(); }

  async ensure() {
    await this.ready();
    const backend = await this.appServerRuntime.ensureMcpOnly();
    const vps = await this.applyVps(backend.mcp_url);
    if (this.channel === CHATGPT_CHANNEL_VPS) {
      const status = this.combine(backend, vps);
      if (!vps?.ready) throw new RuntimeError('RUNTIME_NOT_READY', vpsProblem(vps));
      return status;
    }
    return this.combine({ ...backend, ...await this.startStable() }, vps);
  }

  // First run: bring the MCP up and report the tunnel as it is, configured or not.
  async startMcpOnly() {
    await this.ready();
    const backend = await this.appServerRuntime.ensureMcpOnly();
    return this.combine(backend, await this.applyVps(backend.mcp_url));
  }

  async setChannel(channel) {
    if (!CHATGPT_CHANNELS.includes(channel)) throw new RuntimeError('CHATGPT_CHANNEL_INVALID', 'Неизвестный канал ChatGPT.');
    await this.ready();
    const backend = await this.appServerRuntime.ensureMcpOnly();
    const vps = await this.applyVps(backend.mcp_url);
    if (channel === CHATGPT_CHANNEL_VPS) {
      if (!vps?.ready) throw new RuntimeError('VPS_NOT_READY', vpsProblem(vps));
      await this.appServerRuntime.configureChannel(CHATGPT_CHANNEL_VPS);
      await this.appServerRuntime.control('stop', { tunnelOnly: true });
      this.channel = CHATGPT_CHANNEL_VPS;
      return this.combine(backend, vps);
    }
    await this.appServerRuntime.configureChannel(CHATGPT_CHANNEL_SECURE);
    this.channel = CHATGPT_CHANNEL_SECURE;
    return this.combine({ ...backend, ...await this.startStable() }, vps);
  }

  async control(command, { mcpOnly = false } = {}) {
    if (command === 'status') {
      const status = await this.appServerRuntime.control('status');
      return this.combine(status, await this.vpsStatus(status.mcp_url));
    }
    if (command === 'start') return mcpOnly ? this.startMcpOnly() : this.ensure();
    if (command === 'stop') {
      const stopped = await this.appServerRuntime.control('stop');
      this.lastStatus = null;
      return { ok: true, stable: stopped, backend: stopped };
    }
    throw new RuntimeError('RUNTIME_ACTION_DENIED', 'Эта операция не поддерживается оболочкой.');
  }

  async loadContext(workspace) {
    await this.ensure();
    return this.appServerRuntime.loadContext(workspace);
  }
}

export class MacRuntimeSwitcher {
  constructor({ appServerRuntime, vpsTunnel = null, homeDir = os.homedir(), uid = typeof process.getuid === 'function' ? process.getuid() : 501,
    execute = execFile, launchAgentDir = null } = {}) {
    if (!appServerRuntime) throw new TypeError('MacRuntimeSwitcher requires appServerRuntime');
    this.appServerRuntime = appServerRuntime;
    this.vpsTunnel = vpsTunnel;
    this.homeDir = homeDir;
    this.uid = uid;
    this.execute = execute;
    this.launchAgentDir = launchAgentDir ?? path.join(homeDir, 'Library/LaunchAgents');
    this.appServerLabel = APP_SERVER_LAUNCH_AGENT;
  }

  createRuntime(channel = CHATGPT_CHANNEL_SECURE, prepare = null) {
    if (!CHATGPT_CHANNELS.includes(channel)) throw new RuntimeError('CHATGPT_CHANNEL_INVALID', 'Неизвестный канал ChatGPT.');
    return new MacSelectedRuntime({ appServerRuntime: this.appServerRuntime, vpsTunnel: this.vpsTunnel, channel, prepare });
  }

  async ensureAppServerLaunchAgent() {
    await this.appServerRuntime.syncSource();
    await fs.mkdir(this.launchAgentDir, { recursive: true });
    const file = path.join(this.launchAgentDir, this.appServerLabel + '.plist');
    const control = path.join(this.appServerRuntime.installedSource, 'control.py');
    const stdout = path.join(this.appServerRuntime.stateDir, 'autostart.out.log');
    const stderr = path.join(this.appServerRuntime.stateDir, 'autostart.err.log');
    const plist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
<key>Label</key><string>${xml(this.appServerLabel)}</string>
<key>ProgramArguments</key><array><string>/usr/bin/python3</string><string>-B</string><string>${xml(control)}</string><string>selector-start</string></array>
<key>WorkingDirectory</key><string>${xml(this.appServerRuntime.installedSource)}</string>
<key>LimitLoadToSessionType</key><string>Aqua</string>
<key>RunAtLoad</key><true/>
<key>Umask</key><integer>63</integer>
<key>StandardOutPath</key><string>${xml(stdout)}</string>
<key>StandardErrorPath</key><string>${xml(stderr)}</string>
</dict></plist>
`;
    await fs.writeFile(file + '.tmp', plist, { mode: 0o600 });
    await fs.rename(file + '.tmp', file);
    return file;
  }

  async setLaunchAgentEnabled(label, enabled) {
    const action = enabled ? 'enable' : 'disable';
    await this.execute('/bin/launchctl', [action, `gui/${this.uid}/${label}`], { timeout: 10_000, maxBuffer: 64 * 1024 });
  }

  async #processTable() {
    const { stdout = '' } = await this.execute('/bin/ps', ['-axo', 'pid=,command='],
      { timeout: 5_000, maxBuffer: 8 * 1024 * 1024, env: { ...process.env, LC_ALL: 'C', LANG: 'C' } });
    const table = new Map();
    for (const line of stdout.split('\n')) {
      const match = line.match(/^\s*(\d+)\s+(.+)$/);
      if (match) table.set(Number(match[1]), match[2]);
    }
    return table;
  }

  // Signals only processes whose command line names the files of a retired runtime folder exactly,
  // and only when two consecutive readings agree (a recycled PID never matches twice).
  async stopLegacyProcesses(roots) {
    const matches = command => roots.some(root => {
      const python = path.join(root, '.venv', 'bin', 'python');
      const bridge = path.join(root, 'mcp', 'bridge_mcp.py');
      const tunnel = path.join(root, 'tools', 'tunnel-client');
      return (command.includes(python) && command.includes(' ' + bridge + ' ') && command.includes('--port '))
        || (command.startsWith(tunnel + ' ') && command.includes(' run ') && command.includes('--profile mac-local'));
    });
    const first = await this.#processTable();
    const candidates = [...first].filter(([pid, command]) => pid > 1 && matches(command));
    if (!candidates.length) return [];
    const second = await this.#processTable();
    const signalled = [];
    for (const [pid, command] of candidates) {
      if (second.get(pid) !== command) continue;
      try {
        await this.execute('/bin/kill', ['-TERM', `-${pid}`], { timeout: 5_000, maxBuffer: 64 * 1024 });
        signalled.push(pid);
      } catch { /* already gone, or not a group leader: nothing of ours to stop */ }
    }
    return signalled;
  }

  // One-time cleanup after the retired local runtime: its processes, its LaunchAgent and the copy
  // Web Pilot itself installed into its data folder. The user's own folders and the old tunnel key stay.
  // runtimeRoots are the runtime folders that earlier versions recorded in the settings.
  async retireLegacyRuntime({ dataDir, runtimeRoots = [] }) {
    if (!dataDir || !path.isAbsolute(dataDir)) throw new TypeError('retireLegacyRuntime requires an absolute dataDir');
    const installed = path.join(dataDir, 'runtime', LEGACY_RUNTIME_FOLDER);
    const roots = [...new Set([installed, ...runtimeRoots]
      .filter(root => typeof root === 'string' && path.isAbsolute(root)).map(root => path.resolve(root)))];
    const stopped = await this.stopLegacyProcesses(roots);
    try {
      await this.execute('/bin/launchctl', ['bootout', `gui/${this.uid}/${LEGACY_LAUNCH_AGENT}`], { timeout: 10_000, maxBuffer: 64 * 1024 });
    } catch { /* not loaded */ }
    await fs.rm(path.join(this.launchAgentDir, LEGACY_LAUNCH_AGENT + '.plist'), { force: true });
    for (const leftover of [installed, path.join(dataDir, 'runtime', 'mac-runtime.json'), path.join(dataDir, 'runtime', '.mac-runtime-staging')]) {
      await fs.rm(leftover, { recursive: true, force: true });
    }
    return { stopped, removed: installed };
  }

  // Prepares the services for this app run: source and LaunchAgent, selector and channel, the MCP itself and,
  // when a tunnel is configured, the tunnel. A Mac without a tunnel is a normal first run, not an error.
  async activate(runtime, { chatgptChannel = runtime?.channel, retireLegacy = null } = {}) {
    if (!(runtime instanceof MacSelectedRuntime)) throw new TypeError('activate requires the runtime created by createRuntime');
    if (!CHATGPT_CHANNELS.includes(chatgptChannel)) throw new RuntimeError('CHATGPT_CHANNEL_INVALID', 'Неизвестный канал ChatGPT.');
    const app = this.appServerRuntime;
    await this.ensureAppServerLaunchAgent();
    // The login item is switched off while the services are reconfigured, and back on whatever the outcome:
    // a failed start (no Codex yet, the tunnel is offline) must not cancel the start at the next login.
    await this.setLaunchAgentEnabled(this.appServerLabel, false);
    let legacyRetired = false, combined;
    try {
      if (retireLegacy) {
        // Cleanup must never keep the working backend from starting; it is simply tried again next time.
        try { await this.retireLegacyRuntime(retireLegacy); legacyRetired = true; } catch { /* retried on the next start */ }
      }

      await app.control('stop');
      await app.configureSelector();
      await app.configureChannel(chatgptChannel);
      runtime.channel = chatgptChannel;

      const backend = await app.ensureMcpOnly();
      // The VPS forward follows the MCP port.
      const vps = await runtime.applyVps(backend.mcp_url);
      let status = backend;
      if (chatgptChannel === CHATGPT_CHANNEL_SECURE && backend.tunnel?.configured) {
        const stable = await app.control('start', { tunnelOnly: true });
        if (!stable.tunnel?.ready || !stable.tunnel?.owned || !stable.tunnel?.configured) {
          throw new RuntimeError('RUNTIME_NOT_READY', 'Стабильный Secure MCP Tunnel ещё не готов.');
        }
        status = { ...backend, ...stable };
      }
      // tunnel-client was stopped above; in the VPS channel it stays stopped. An unready VPS
      // is reported in the status instead of blocking startup: the server may be offline.
      combined = runtime.combine(status, vps);
    } finally {
      await this.setLaunchAgentEnabled(this.appServerLabel, true);
    }
    app.activated = true;
    return { runtime, status: combined, legacyRetired };
  }
}
