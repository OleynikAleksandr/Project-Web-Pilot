import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { VpsTunnel, VPS_TUNNEL_LABEL, loopbackMcpPort, maskConnectorUrl } from '../src/vps-tunnel.mjs';

const SECRET = 'AbCdEfGhIjKlMnOpQrStUvWxYz0123456789_-xyz';

async function fixture(t, { sshConfig = 'hostname 31.70.155.58\nuser mcptunnel\n', bootstrapFailures = 0 } = {}) {
  const home = await mkdtemp(path.join(tmpdir(), 'web-pilot-vps-'));
  t.after(() => fs.rm(home, { recursive: true, force: true }));
  const calls = [];
  const agent = { loaded: false, pid: null, nextPid: 4100 };
  let failures = bootstrapFailures;
  const execute = async (file, args) => {
    calls.push([path.basename(file), ...args].join(' '));
    if (file === '/usr/bin/ssh') {
      if (sshConfig === null) throw Object.assign(new Error('ssh failed'), { stderr: 'bad' });
      return { stdout: sshConfig, stderr: '' };
    }
    if (file === '/bin/launchctl' && args[0] === 'print') {
      if (!agent.loaded) throw Object.assign(new Error('not loaded'), { stderr: 'Could not find service' });
      return { stdout: `gui/501/${VPS_TUNNEL_LABEL} = {\n\tstate = running\n\tpid = ${agent.pid}\n\tendpoints = {\n\t\tstate = active\n\t}\n}\n`, stderr: '' };
    }
    if (file === '/bin/launchctl' && args[0] === 'bootout') { agent.loaded = false; agent.pid = null; return { stdout: '' }; }
    if (file === '/bin/launchctl' && args[0] === 'bootstrap') {
      if (failures > 0) { failures -= 1; throw Object.assign(new Error('Bootstrap failed: 5'), { stderr: 'Bootstrap failed: 5: Input/output error' }); }
      agent.loaded = true; agent.pid = agent.nextPid++; return { stdout: '' };
    }
    throw new Error('unexpected ' + file);
  };
  const tunnel = new VpsTunnel({ homeDir: home, uid: 501, execute, sleep: async () => {}, settleMs: 0 });
  return { home, calls, agent, tunnel };
}

test('loopback MCP port and masked connector address', () => {
  assert.equal(loopbackMcpPort('http://127.0.0.1:17852/mcp'), 17852);
  assert.equal(loopbackMcpPort('http://localhost:17852/mcp'), null);
  assert.equal(loopbackMcpPort('http://127.0.0.1:80/mcp'), null);
  assert.equal(loopbackMcpPort('not a url'), null);
  const masked = maskConnectorUrl(`https://vps.example/mcp/${SECRET}/mcp`);
  assert.equal(masked, 'https://vps.example/mcp/…/mcp');
  assert.equal(masked.includes(SECRET), false);
});

test('apply writes the forward to the current MCP port and reloads only when the port changes', async t => {
  const f = await fixture(t);
  const first = await f.tunnel.apply('http://127.0.0.1:17852/mcp');
  const plist = await fs.readFile(path.join(f.home, 'Library/LaunchAgents', VPS_TUNNEL_LABEL + '.plist'), 'utf8');
  assert.match(plist, /<string>-R<\/string><string>127\.0\.0\.1:17842:127\.0\.0\.1:17852<\/string><string>vps-mcp-tunnel<\/string>/);
  assert.match(plist, /<string>ExitOnForwardFailure=yes<\/string>/);
  assert.match(plist, /<key>KeepAlive<\/key><true\/>/);
  assert.ok(plist.includes(path.join(f.home, 'Library/Logs/vps-mcp-tunnel.log')));
  assert.equal(first.ready, true);
  assert.equal(first.forwardPort, 17852);
  assert.equal(first.mcpPort, 17852);
  assert.ok(f.calls.includes(`launchctl bootstrap gui/501 ${path.join(f.home, 'Library/LaunchAgents', VPS_TUNNEL_LABEL + '.plist')}`));

  f.calls.length = 0;
  const same = await f.tunnel.apply('http://127.0.0.1:17852/mcp');
  assert.equal(same.ready, true);
  assert.equal(f.calls.some(call => / bootout | bootstrap /.test(' ' + call + ' ')), false);

  f.calls.length = 0;
  const pid = f.agent.pid;
  const moved = await f.tunnel.apply('http://127.0.0.1:17842/mcp');
  assert.equal(moved.forwardPort, 17842);
  assert.equal(moved.ready, true);
  assert.notEqual(f.agent.pid, pid);
  assert.ok(f.calls.includes(`launchctl bootout gui/501/${VPS_TUNNEL_LABEL}`));
  assert.ok(f.calls.some(call => call.startsWith('launchctl bootstrap gui/501 ')));

  // Status for another port reports the mismatch instead of claiming readiness.
  const stale = await f.tunnel.status('http://127.0.0.1:17852/mcp');
  assert.equal(stale.portMatches, false);
  assert.equal(stale.ready, false);
});

test('bootstrap retries while launchd finishes the previous bootout', async t => {
  const f = await fixture(t, { bootstrapFailures: 2 });
  const status = await f.tunnel.apply('http://127.0.0.1:17852/mcp');
  assert.equal(status.ready, true);
  assert.equal(f.calls.filter(call => call.startsWith('launchctl bootstrap')).length, 3);
});

test('a RemoteForward left in ~/.ssh/config blocks the takeover', async t => {
  const f = await fixture(t, { sshConfig: 'hostname 31.70.155.58\nremoteforward [127.0.0.1]:17842 [127.0.0.1]:17852\n' });
  const status = await f.tunnel.apply('http://127.0.0.1:17852/mcp');
  assert.equal(status.configured, true);
  assert.equal(status.conflict, true);
  assert.equal(status.ready, false);
  await assert.rejects(fs.access(path.join(f.home, 'Library/LaunchAgents', VPS_TUNNEL_LABEL + '.plist')));
  assert.equal(f.calls.some(call => call.includes('bootstrap')), false);
});

test('an unconfigured host is reported without touching launchd', async t => {
  for (const sshConfig of ['hostname vps-mcp-tunnel\nuser me\n', null]) {
    const f = await fixture(t, { sshConfig });
    const status = await f.tunnel.apply('http://127.0.0.1:17852/mcp');
    assert.equal(status.configured, false);
    assert.equal(status.ready, false);
    assert.equal(f.calls.some(call => call.startsWith('launchctl')), false);
  }
});

test('the connector address is masked in status and read in full only for copying', async t => {
  const f = await fixture(t);
  const urlFile = path.join(f.home, '.config/vps-server/mcp-url');
  await fs.mkdir(path.dirname(urlFile), { recursive: true });
  await fs.writeFile(urlFile, `https://vps.example/mcp/${SECRET}/mcp\n`, { mode: 0o600 });
  await fs.mkdir(path.join(f.home, 'Library/Logs'), { recursive: true });
  await fs.writeFile(path.join(f.home, 'Library/Logs/vps-mcp-tunnel.log'), 'old line\nConnection closed by remote host\n\n');
  const status = await f.tunnel.apply('http://127.0.0.1:17852/mcp');
  assert.equal(status.connector, 'https://vps.example/mcp/…/mcp');
  assert.equal(JSON.stringify(status).includes(SECRET), false);
  assert.equal(status.lastError.message, 'Connection closed by remote host');
  assert.equal(await f.tunnel.connectorUrl(), `https://vps.example/mcp/${SECRET}/mcp`);
  await fs.writeFile(urlFile, 'http://vps.example/mcp/short/mcp\n');
  await assert.rejects(f.tunnel.connectorUrl(), /повреждён/);
  assert.equal((await f.tunnel.status('http://127.0.0.1:17852/mcp')).connector, null);
});

test('apply rejects a non-loopback MCP address', async t => {
  const f = await fixture(t);
  await assert.rejects(f.tunnel.apply('https://example.com/mcp'), /Некорректный адрес/);
  assert.equal(f.calls.length, 0);
});
