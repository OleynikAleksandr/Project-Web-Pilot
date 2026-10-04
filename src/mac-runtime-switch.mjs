import { exists } from './common.mjs';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { execFile as execFileCallback } from 'node:child_process';
import { promisify } from 'node:util';
import { LocalMcpClient, RuntimeError, validateContextPacket } from './mcp-runtime.mjs';

const execFile = promisify(execFileCallback);
export const MAC_RUNTIME_LOCAL = 'local';
export const MAC_RUNTIME_APP_SERVER = 'app-server';
export const MAC_RUNTIME_MODES = Object.freeze([MAC_RUNTIME_LOCAL, MAC_RUNTIME_APP_SERVER]);
export const LOCAL_LAUNCH_AGENT = 'com.oleynik.CodexLocalMac';
export const APP_SERVER_LAUNCH_AGENT = 'com.oleynik.WebPilotCodexExecutor';
// How ChatGPT reaches the selected MCP. The VPS tunnel itself runs whenever it is
// configured (Claude uses it too); the channel only decides whether tunnel-client runs.
export const CHATGPT_CHANNEL_SECURE = 'secure-tunnel';
export const CHATGPT_CHANNEL_VPS = 'vps';
export const CHATGPT_CHANNELS = Object.freeze([CHATGPT_CHANNEL_SECURE, CHATGPT_CHANNEL_VPS]);

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
    python = '/usr/bin/python3', execute = execFile, sessionPlans, environment = process.env,
    tunnelClientCandidate = null } = {}) {
    if (!sourceDir || !path.isAbsolute(sourceDir)) throw new TypeError('CodexAppServerRuntime requires an absolute sourceDir');
    if (!sessionPlans) throw new TypeError('CodexAppServerRuntime requires sessionPlans');
    this.sourceDir = sourceDir;
    this.stateDir = stateDir;
    this.installedSource = path.join(stateDir, 'source');
    this.python = python;
    this.execute = execute;
    this.sessionPlans = sessionPlans;
    this.environment = { ...environment };
    this.tunnelClientCandidate = tunnelClientCandidate;
    this.expectedServerName = 'Codex App Server Local Mac';
    this.client = null;
    this.pending = null;
    this.mcpOnlyPending = null;
    this.lastStatus = null;
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
      ...(this.tunnelClientCandidate ? { WEB_PILOT_CODEX_TUNNEL_CLIENT: this.tunnelClientCandidate } : {}),
    };
  }

  async configureChannel(channel) {
    if (!CHATGPT_CHANNELS.includes(channel)) throw new RuntimeError('CHATGPT_CHANNEL_INVALID', 'Неизвестный канал ChatGPT.');
    if (!await exists(path.join(this.installedSource, 'control.py'))) await this.syncSource();
    let output;
    try {
      output = await this.execute(this.python, ['-B', path.join(this.installedSource, 'control.py'), 'configure-channel', '--channel', channel],
        { cwd: this.installedSource, timeout: 20_000, maxBuffer: 2 * 1024 * 1024, env: this.controlEnvironment() });
    } catch (error) {
      let message = 'Не удалось сохранить канал ChatGPT.';
      try { message = JSON.parse(error.stdout || error.stderr).error ?? message; } catch { /* bounded public error */ }
      throw new RuntimeError('CHATGPT_CHANNEL_CONFIG_FAILED', message);
    }
    let result;
    try { result = JSON.parse(output.stdout); } catch {
      throw new RuntimeError('RUNTIME_STATUS_INVALID', 'Selector вернул непонятный результат.');
    }
    if (result?.ok === false || result?.chatgpt_channel !== channel) throw new RuntimeError('CHATGPT_CHANNEL_CONFIG_FAILED', String(result?.error ?? 'Канал ChatGPT не сохранён.'));
    return result;
  }

  async control(command, { mcpOnly = false, tunnelOnly = false } = {}) {
    if (!['setup', 'status', 'start', 'stop', 'selector-start'].includes(command)) throw new RuntimeError('RUNTIME_ACTION_DENIED', 'Эта операция не поддерживается оболочкой.');
    if (!await exists(path.join(this.installedSource, 'control.py')) || command === 'setup') await this.syncSource();
    const control = path.join(this.installedSource, 'control.py');
    const env = this.controlEnvironment();
    let output;
    try {
      output = await this.execute(this.python, ['-B', control, command,
        ...(command === 'start' && mcpOnly ? ['--mcp-only'] : []),
        ...(['start', 'stop'].includes(command) && tunnelOnly ? ['--tunnel-only'] : [])],
        { cwd: this.installedSource, timeout: command === 'setup' ? 10 * 60_000 : command === 'start' ? 90_000 : 20_000,
          maxBuffer: 2 * 1024 * 1024, env });
    } catch (error) {
      let message = 'Не удалось выполнить Codex App Server runtime.';
      try { message = JSON.parse(error.stdout || error.stderr).error ?? message; } catch { /* bounded public error */ }
      throw new RuntimeError('APP_SERVER_RUNTIME_COMMAND_FAILED', message);
    }
    let result;
    try { result = JSON.parse(output.stdout); } catch {
      throw new RuntimeError('RUNTIME_STATUS_INVALID', 'Codex App Server runtime вернул непонятный результат.');
    }
    if (result?.ok === false) throw new RuntimeError('APP_SERVER_RUNTIME_COMMAND_FAILED', String(result.error ?? 'Codex App Server runtime error'));
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

  async configureSelector(mode, mcpUrl, localDescriptor, localState) {
    await this.syncSource();
    const control = path.join(this.installedSource, 'control.py');
    let output;
    try {
      output = await this.execute(this.python, ['-B', control, 'configure-selector',
        '--mode', mode, '--mcp-url', mcpUrl,
        '--local-python', localDescriptor.python,
        '--local-control', localDescriptor.control,
        '--local-root', localDescriptor.runtimeRoot,
        '--local-state', localState],
      { cwd: this.installedSource, timeout: 20_000, maxBuffer: 2 * 1024 * 1024,
        env: this.controlEnvironment() });
    } catch (error) {
      let message = 'Не удалось настроить стабильный MCP connector.';
      try { message = JSON.parse(error.stdout || error.stderr).error ?? message; } catch { /* bounded public error */ }
      throw new RuntimeError('APP_SERVER_SELECTOR_CONFIG_FAILED', message);
    }
    let result;
    try { result = JSON.parse(output.stdout); } catch {
      throw new RuntimeError('RUNTIME_STATUS_INVALID', 'Selector вернул непонятный результат.');
    }
    if (result?.ok === false) throw new RuntimeError('APP_SERVER_SELECTOR_CONFIG_FAILED', String(result.error ?? 'Selector error'));
    return result;
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

class MacSelectedRuntime {
  constructor({ backendRuntime, stableRuntime, vpsTunnel = null, channel = CHATGPT_CHANNEL_SECURE, status = null }) {
    this.backendRuntime = backendRuntime;
    this.stableRuntime = stableRuntime;
    this.vpsTunnel = vpsTunnel;
    this.channel = channel;
    this.lastStatus = status;
  }

  // In the VPS channel the status "tunnel" is the VPS forward, so every readiness
  // check (startup, sidebar, settings) keeps working without a separate branch.
  combine(backend, stable, vps = null) {
    const viaVps = this.channel === CHATGPT_CHANNEL_VPS;
    const status = {
      ...backend,
      tunnel: viaVps ? vpsAsTunnel(vps) : stable.tunnel,
      tunnel_ui: viaVps ? null : stable.tunnel_ui,
      stable_tunnel_target: stable?.tunnel_target ?? null,
      chatgpt_channel: this.channel,
      vps,
    };
    this.lastStatus = status;
    this.backendRuntime.lastStatus = status;
    return status;
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
    let stable = await this.stableRuntime.control('status');
    if (!stable.tunnel?.ready) stable = await this.stableRuntime.control('start', { tunnelOnly: true });
    if (!stable.tunnel?.ready || !stable.tunnel?.owned || !stable.tunnel?.configured) {
      throw new RuntimeError('RUNTIME_NOT_READY', 'Стабильный Secure MCP Tunnel ещё не готов.');
    }
    return stable;
  }

  async ensure() {
    const backend = await this.backendRuntime.ensureMcpOnly();
    const vps = await this.applyVps(backend.mcp_url);
    if (this.channel === CHATGPT_CHANNEL_VPS) {
      const status = this.combine(backend, null, vps);
      if (!vps?.ready) throw new RuntimeError('RUNTIME_NOT_READY', vpsProblem(vps));
      return status;
    }
    return this.combine(backend, await this.startStable(), vps);
  }

  async setChannel(channel) {
    if (!CHATGPT_CHANNELS.includes(channel)) throw new RuntimeError('CHATGPT_CHANNEL_INVALID', 'Неизвестный канал ChatGPT.');
    const backend = await this.backendRuntime.ensureMcpOnly();
    const vps = await this.applyVps(backend.mcp_url);
    if (channel === CHATGPT_CHANNEL_VPS) {
      if (!vps?.ready) throw new RuntimeError('VPS_NOT_READY', vpsProblem(vps));
      await this.stableRuntime.configureChannel(CHATGPT_CHANNEL_VPS);
      await this.stableRuntime.control('stop', { tunnelOnly: true });
      this.channel = CHATGPT_CHANNEL_VPS;
      return this.combine(backend, null, vps);
    }
    await this.stableRuntime.configureChannel(CHATGPT_CHANNEL_SECURE);
    this.channel = CHATGPT_CHANNEL_SECURE;
    return this.combine(backend, await this.startStable(), vps);
  }

  async control(command) {
    if (command === 'status') {
      const backend = await this.backendRuntime.control('status');
      const stable = this.backendRuntime === this.stableRuntime
        ? backend
        : await this.stableRuntime.control('status');
      return this.combine(backend, stable, await this.vpsStatus(backend.mcp_url));
    }
    if (command === 'start') return this.ensure();
    if (command === 'stop') {
      const stable = await this.stableRuntime.control('stop');
      const backend = this.backendRuntime === this.stableRuntime ? stable : await this.backendRuntime.control('stop');
      this.lastStatus = null;
      return { ok: true, stable, backend };
    }
    throw new RuntimeError('RUNTIME_ACTION_DENIED', 'Эта операция не поддерживается оболочкой.');
  }

  async loadContext(workspace) {
    await this.ensure();
    return this.backendRuntime.loadContext(workspace);
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
    this.localLabel = LOCAL_LAUNCH_AGENT;
    this.appServerLabel = APP_SERVER_LAUNCH_AGENT;
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

  async listenerPids(port) {
    if (!Number.isSafeInteger(port) || port < 1024 || port > 65535) return [];
    try {
      const { stdout = '' } = await this.execute('/usr/sbin/lsof',
        ['-nP', `-iTCP:${port}`, '-sTCP:LISTEN', '-t'], { timeout: 5_000, maxBuffer: 64 * 1024 });
      return [...new Set(stdout.split(/\s+/).filter(Boolean).map(Number).filter(pid => Number.isSafeInteger(pid) && pid > 1))];
    } catch {
      return [];
    }
  }

  async processCommand(pid) {
    try {
      const { stdout = '' } = await this.execute('/bin/ps', ['-p', String(pid), '-o', 'command='],
        { timeout: 5_000, maxBuffer: 64 * 1024, env: { ...process.env, LC_ALL: 'C', LANG: 'C' } });
      return stdout.trim();
    } catch {
      return '';
    }
  }

  async stopLegacyOrphans(descriptor, status) {
    const root = descriptor.runtimeRoot;
    const python = descriptor.python;
    const bridge = path.join(root, 'mcp', 'bridge_mcp.py');
    const tunnel = path.join(root, 'tools', 'tunnel-client');
    const candidates = [];
    for (const [kind, value] of [['mcp', status?.mcp_url], ['tunnel', status?.tunnel_ui]]) {
      let port = null;
      try { port = Number(new URL(value).port); } catch { /* no known listener */ }
      for (const pid of await this.listenerPids(port)) candidates.push({ kind, pid, port });
    }
    const signalled = [];
    for (const candidate of candidates) {
      const matches = command => candidate.kind === 'mcp'
        ? command.includes(python) && command.includes(bridge) && command.includes(`--port ${candidate.port}`)
        : command.startsWith(tunnel + ' ') && command.includes(' run ') && command.includes('--profile mac-local');
      const first = await this.processCommand(candidate.pid);
      if (!first || !matches(first)) continue;
      const second = await this.processCommand(candidate.pid);
      if (second !== first || !matches(second)) continue;
      await this.execute('/bin/kill', ['-TERM', `-${candidate.pid}`], { timeout: 5_000, maxBuffer: 64 * 1024 });
      signalled.push(candidate.pid);
    }
    return signalled;
  }

  async activate(mode, { localRuntime, chatgptChannel = CHATGPT_CHANNEL_SECURE } = {}) {
    if (!MAC_RUNTIME_MODES.includes(mode)) throw new RuntimeError('MAC_RUNTIME_MODE_INVALID', 'Неизвестный режим локальных инструментов.');
    if (!CHATGPT_CHANNELS.includes(chatgptChannel)) throw new RuntimeError('CHATGPT_CHANNEL_INVALID', 'Неизвестный канал ChatGPT.');
    if (!localRuntime) throw new TypeError('activate requires localRuntime');
    await this.ensureAppServerLaunchAgent();

    // The historical Codex Local Mac LaunchAgent must never own a second tunnel.
    // It stays disabled in both modes; the WebPilot selector is the only login item.
    await this.setLaunchAgentEnabled(this.localLabel, false);
    await this.setLaunchAgentEnabled(this.appServerLabel, false);

    const localDescriptor = await localRuntime.commandDescriptor();
    const localStatus = await localRuntime.control('status');
    const targetStatus = mode === MAC_RUNTIME_APP_SERVER
      ? await this.appServerRuntime.control('status')
      : localStatus;

    await localRuntime.control('stop');
    await this.stopLegacyOrphans(localDescriptor, localStatus);
    await this.appServerRuntime.control('stop');
    await this.appServerRuntime.configureSelector(mode, targetStatus.mcp_url, localDescriptor, localStatus.state_directory);
    await this.appServerRuntime.configureChannel(chatgptChannel);

    const backendRuntime = mode === MAC_RUNTIME_APP_SERVER ? this.appServerRuntime : localRuntime;
    const backendStatus = await backendRuntime.ensureMcpOnly();
    const runtime = new MacSelectedRuntime({ backendRuntime, stableRuntime: this.appServerRuntime,
      vpsTunnel: this.vpsTunnel, channel: chatgptChannel });
    // The VPS forward follows the MCP port of the selected backend.
    const vps = await runtime.applyVps(backendStatus.mcp_url);
    let stableStatus = null;
    if (chatgptChannel === CHATGPT_CHANNEL_SECURE) {
      stableStatus = await this.appServerRuntime.control('start', { tunnelOnly: true });
      if (!stableStatus.tunnel?.ready || !stableStatus.tunnel?.owned || !stableStatus.tunnel?.configured) {
        throw new RuntimeError('RUNTIME_NOT_READY', 'Стабильный Secure MCP Tunnel ещё не готов.');
      }
    }
    // tunnel-client was stopped above; in the VPS channel it stays stopped. An unready VPS
    // is reported in the status instead of blocking startup: the server may be offline.
    const status = runtime.combine(backendStatus, stableStatus, vps);
    await this.setLaunchAgentEnabled(this.appServerLabel, true);
    return { mode, runtime, status };
  }
}