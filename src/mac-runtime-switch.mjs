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

function xml(value) {
  return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;').replaceAll("'", '&apos;');
}

async function exists(file) {
  try { await fs.access(file); return true; } catch { return false; }
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

  async control(command, { mcpOnly = false } = {}) {
    if (!['setup', 'status', 'start', 'stop'].includes(command)) throw new RuntimeError('RUNTIME_ACTION_DENIED', 'Эта операция не поддерживается оболочкой.');
    if (!await exists(path.join(this.installedSource, 'control.py')) || ['setup', 'start'].includes(command)) await this.syncSource();
    const control = path.join(this.installedSource, 'control.py');
    const env = {
      ...this.environment,
      PYTHONDONTWRITEBYTECODE: '1',
      WEB_PILOT_CODEX_EXECUTOR_STATE_DIR: this.stateDir,
      ...(this.tunnelClientCandidate ? { WEB_PILOT_CODEX_TUNNEL_CLIENT: this.tunnelClientCandidate } : {}),
    };
    let output;
    try {
      output = await this.execute(this.python, ['-B', control, command, ...(command === 'start' && mcpOnly ? ['--mcp-only'] : [])],
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
      if (command === 'stop') { this.client = null; this.lastStatus = null; }
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

  async loadContext(workspace, selection = {}) {
    if (selection.sessionId) return validateContextPacket(await this.sessionPlans.loadContext(workspace, selection), workspace, selection);
    if (!this.client) await this.ensure();
    return this.client.loadContext(workspace);
  }
}

export class MacRuntimeSwitcher {
  constructor({ appServerRuntime, homeDir = os.homedir(), uid = typeof process.getuid === 'function' ? process.getuid() : 501,
    execute = execFile, launchAgentDir = null } = {}) {
    if (!appServerRuntime) throw new TypeError('MacRuntimeSwitcher requires appServerRuntime');
    this.appServerRuntime = appServerRuntime;
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
<key>ProgramArguments</key><array><string>/usr/bin/python3</string><string>-B</string><string>${xml(control)}</string><string>start</string></array>
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

  async activate(mode, { localRuntime } = {}) {
    if (!MAC_RUNTIME_MODES.includes(mode)) throw new RuntimeError('MAC_RUNTIME_MODE_INVALID', 'Неизвестный режим локальных инструментов.');
    if (!localRuntime) throw new TypeError('activate requires localRuntime');
    await this.ensureAppServerLaunchAgent();
    if (mode === MAC_RUNTIME_APP_SERVER) {
      await this.setLaunchAgentEnabled(this.localLabel, false);
      await localRuntime.control('stop');
      await this.setLaunchAgentEnabled(this.appServerLabel, true);
      const status = await this.appServerRuntime.ensure();
      return { mode, runtime: this.appServerRuntime, status };
    }
    await this.setLaunchAgentEnabled(this.appServerLabel, false);
    await this.appServerRuntime.control('stop');
    await this.setLaunchAgentEnabled(this.localLabel, true);
    const status = await localRuntime.ensure();
    return { mode, runtime: localRuntime, status };
  }
}
