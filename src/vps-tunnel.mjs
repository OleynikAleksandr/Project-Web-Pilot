import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { execFile as execFileCallback } from 'node:child_process';
import { promisify } from 'node:util';

const execFile = promisify(execFileCallback);
// Contract with the vps-server repository: it creates the SSH host block, the key,
// the server user and the connector address; Web Pilot keeps the forward on the current MCP port.
export const VPS_TUNNEL_LABEL = 'com.oleynik.vps-mcp-tunnel';
export const VPS_SSH_HOST = 'vps-mcp-tunnel';
export const VPS_REMOTE_PORT = 17842;
const CONNECTOR_PATH = /^\/mcp\/[A-Za-z0-9_-]{20,}\/mcp$/;

function xml(value) {
  return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;').replaceAll("'", '&apos;');
}

export function loopbackMcpPort(mcpUrl) {
  let url;
  try { url = new URL(mcpUrl); } catch { return null; }
  const port = Number(url.port);
  return url.protocol === 'http:' && url.hostname === '127.0.0.1' && url.pathname === '/mcp'
    && Number.isSafeInteger(port) && port >= 1024 && port <= 65535 ? port : null;
}

// The path carries the secret: only the host is ever shown.
export function maskConnectorUrl(value) {
  return 'https://' + new URL(value).host + '/mcp/…/mcp';
}

export class VpsTunnel {
  constructor({ homeDir = os.homedir(), uid = typeof process.getuid === 'function' ? process.getuid() : 501,
    execute = execFile, launchAgentDir = null, sleep = ms => new Promise(resolve => setTimeout(resolve, ms)),
    settleMs = 2_000, startTimeoutMs = 6_000 } = {}) {
    this.execute = execute;
    this.sleep = sleep;
    this.settleMs = settleMs;
    this.startTimeoutMs = startTimeoutMs;
    this.plistFile = path.join(launchAgentDir ?? path.join(homeDir, 'Library/LaunchAgents'), VPS_TUNNEL_LABEL + '.plist');
    this.logFile = path.join(homeDir, 'Library/Logs/vps-mcp-tunnel.log');
    this.urlFile = path.join(homeDir, '.config/vps-server/mcp-url');
    this.domain = `gui/${uid}`;
    this.service = `${this.domain}/${VPS_TUNNEL_LABEL}`;
  }

  plist(port) {
    const argv = ['/usr/bin/ssh', '-N', '-o', 'BatchMode=yes', '-o', 'ExitOnForwardFailure=yes',
      '-o', 'ServerAliveInterval=30', '-o', 'ServerAliveCountMax=3',
      '-R', `127.0.0.1:${VPS_REMOTE_PORT}:127.0.0.1:${port}`, VPS_SSH_HOST];
    return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
<key>Label</key><string>${VPS_TUNNEL_LABEL}</string>
<key>ProgramArguments</key><array>${argv.map(value => `<string>${xml(value)}</string>`).join('')}</array>
<key>RunAtLoad</key><true/>
<key>KeepAlive</key><true/>
<key>ThrottleInterval</key><integer>15</integer>
<key>StandardErrorPath</key><string>${xml(this.logFile)}</string>
</dict></plist>
`;
  }

  async connectorUrl() {
    const text = (await fs.readFile(this.urlFile, 'utf8')).trim();
    let url;
    try { url = new URL(text); } catch { url = null; }
    if (!url || url.protocol !== 'https:' || !CONNECTOR_PATH.test(url.pathname) || url.search || url.hash || url.username) {
      throw new Error('Адрес коннектора VPS повреждён; повторите настройку в vps-server.');
    }
    return text;
  }

  async inspectSsh() {
    let stdout = '';
    try {
      ({ stdout = '' } = await this.execute('/usr/bin/ssh', ['-G', '-T', VPS_SSH_HOST], { timeout: 5_000, maxBuffer: 256 * 1024 }));
    } catch {
      return { configured: false, remoteForward: false };
    }
    const values = key => stdout.split('\n').filter(line => line.startsWith(key + ' ')).map(line => line.slice(key.length + 1).trim());
    const hostname = values('hostname')[0];
    // Without a Host block ssh echoes the alias itself as the hostname.
    return { configured: !!hostname && hostname !== VPS_SSH_HOST, remoteForward: values('remoteforward').length > 0 };
  }

  async agent() {
    try {
      const { stdout = '' } = await this.execute('/bin/launchctl', ['print', this.service], { timeout: 5_000, maxBuffer: 512 * 1024 });
      const state = /^\s*state = (\S+)/m.exec(stdout)?.[1] ?? null;
      const pid = Number(/^\s*pid = (\d+)/m.exec(stdout)?.[1]) || null;
      return { loaded: true, running: state === 'running' && pid !== null, pid };
    } catch {
      return { loaded: false, running: false, pid: null };
    }
  }

  async forwardPort() {
    try {
      const text = await fs.readFile(this.plistFile, 'utf8');
      const match = new RegExp(`<string>-R</string><string>127\\.0\\.0\\.1:${VPS_REMOTE_PORT}:127\\.0\\.0\\.1:(\\d+)</string>`).exec(text);
      return match ? Number(match[1]) : null;
    } catch {
      return null;
    }
  }

  async lastError() {
    try {
      const stat = await fs.stat(this.logFile);
      if (!stat.size) return null;
      const handle = await fs.open(this.logFile, 'r');
      try {
        const length = Math.min(stat.size, 4096);
        const { buffer } = await handle.read(Buffer.alloc(length), 0, length, stat.size - length);
        const line = buffer.toString('utf8').split('\n').map(value => value.trim()).filter(Boolean).at(-1);
        return line ? { message: line.slice(0, 200), at: stat.mtime.toISOString() } : null;
      } finally { await handle.close(); }
    } catch {
      return null;
    }
  }

  async status(mcpUrl) {
    const mcpPort = loopbackMcpPort(mcpUrl);
    const ssh = await this.inspectSsh();
    if (!ssh.configured) {
      return { configured: false, conflict: false, running: false, ready: false, owned: false, pid: null,
        mcpPort, forwardPort: null, portMatches: false, lastError: null, connector: null };
    }
    const [agent, forwardPort, lastError, connector] = await Promise.all([
      this.agent(), this.forwardPort(), this.lastError(),
      this.connectorUrl().then(maskConnectorUrl, () => null),
    ]);
    const portMatches = mcpPort !== null && forwardPort === mcpPort;
    return { configured: true, conflict: ssh.remoteForward, running: agent.running, pid: agent.pid,
      ready: !ssh.remoteForward && agent.running && portMatches, owned: true,
      mcpPort, forwardPort, portMatches, lastError, connector };
  }

  async bootstrap() {
    let failure;
    for (let attempt = 0; attempt < 4; attempt += 1) {
      try {
        await this.execute('/bin/launchctl', ['bootstrap', this.domain, this.plistFile], { timeout: 10_000, maxBuffer: 64 * 1024 });
        return;
      } catch (error) {
        failure = error;
        await this.sleep(500); // bootout finishes asynchronously
      }
    }
    throw new Error('Не удалось запустить туннель VPS: ' + (failure?.stderr || failure?.message || 'launchctl bootstrap').toString().trim().slice(0, 200));
  }

  // ExitOnForwardFailure ends ssh quickly when the forward is refused; a pid that
  // survives the settle period holds an established forward.
  async settle() {
    const deadline = Date.now() + this.startTimeoutMs;
    let agent = await this.agent();
    while (!agent.running && Date.now() < deadline) {
      await this.sleep(250);
      agent = await this.agent();
    }
    if (!agent.running) return;
    await this.sleep(this.settleMs);
  }

  async apply(mcpUrl) {
    const port = loopbackMcpPort(mcpUrl);
    if (port === null) throw new Error('Некорректный адрес локального MCP для туннеля VPS.');
    const ssh = await this.inspectSsh();
    if (!ssh.configured || ssh.remoteForward) return this.status(mcpUrl);
    const next = this.plist(port);
    const current = await fs.readFile(this.plistFile, 'utf8').catch(() => null);
    const agent = await this.agent();
    if (current !== next) {
      await fs.mkdir(path.dirname(this.plistFile), { recursive: true });
      await fs.mkdir(path.dirname(this.logFile), { recursive: true });
      await fs.writeFile(this.plistFile + '.tmp', next, { mode: 0o644 });
      await fs.rename(this.plistFile + '.tmp', this.plistFile);
      if (agent.loaded) await this.execute('/bin/launchctl', ['bootout', this.service], { timeout: 10_000, maxBuffer: 64 * 1024 }).catch(() => {});
      await this.bootstrap();
      await this.settle();
    } else if (!agent.loaded) {
      await this.bootstrap();
      await this.settle();
    }
    return this.status(mcpUrl);
  }
}
