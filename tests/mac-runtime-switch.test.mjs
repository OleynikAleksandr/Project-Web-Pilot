import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { CodexAppServerRuntime, MacRuntimeSwitcher, MAC_RUNTIME_APP_SERVER, MAC_RUNTIME_LOCAL,
  LOCAL_LAUNCH_AGENT, APP_SERVER_LAUNCH_AGENT } from '../src/mac-runtime-switch.mjs';
import { McpRuntime } from '../src/mcp-runtime.mjs';

test('CodexAppServerRuntime copies release source into stable private state', async t => {
  const root = await mkdtemp(path.join(tmpdir(), 'web-pilot-runtime-source-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const source = path.join(root, 'resource');
  const state = path.join(root, 'state');
  await fs.mkdir(path.join(source, '__pycache__'), { recursive: true });
  await fs.writeFile(path.join(source, 'control.py'), 'print("control")\n');
  await fs.writeFile(path.join(source, 'server.py'), 'print("server")\n');
  await fs.writeFile(path.join(source, '__pycache__', 'server.pyc'), 'cache');
  const runtime = new CodexAppServerRuntime({
    sourceDir: source, stateDir: state, sessionPlans: { loadContext() {} },
    execute: async () => { throw new Error('not used'); },
  });
  const installed = await runtime.syncSource();
  assert.equal(installed, path.join(state, 'source'));
  assert.equal(await fs.readFile(path.join(installed, 'control.py'), 'utf8'), 'print("control")\n');
  await assert.rejects(fs.access(path.join(installed, '__pycache__', 'server.pyc')));
});

test('MacRuntimeSwitcher keeps one stable tunnel while switching only the MCP backend', async t => {
  const root = await mkdtemp(path.join(tmpdir(), 'web-pilot-runtime-switch-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const events = [];
  const installedSource = path.join(root, 'state', 'source');
  let tunnelTarget = 'http://127.0.0.1:27852/mcp';
  const stableStatus = () => ({
    mcp: { ready: false, owned: false },
    tunnel: { ready: true, owned: true, configured: true },
    tunnel_target: tunnelTarget,
    tunnel_ui: 'http://127.0.0.1:27853/ui',
    mcp_url: 'http://127.0.0.1:27852/mcp',
  });
  const appServerRuntime = {
    installedSource,
    stateDir: path.join(root, 'state'),
    lastStatus: null,
    async syncSource() {
      events.push('app.sync');
      await fs.mkdir(installedSource, { recursive: true });
      await fs.writeFile(path.join(installedSource, 'control.py'), '# control\n');
    },
    async control(command, options = {}) {
      events.push('app.' + command + (options.tunnelOnly ? ':tunnel-only' : ''));
      if (command === 'status') return stableStatus();
      if (command === 'start' && options.tunnelOnly) return stableStatus();
      return { ok: true };
    },
    async ensureMcpOnly() {
      events.push('app.ensureMcpOnly');
      return {
        mcp: { ready: true, owned: true },
        tunnel: { ready: false, owned: false, configured: true },
        mcp_url: 'http://127.0.0.1:27852/mcp',
      };
    },
    async configureSelector(mode, mcpUrl, descriptor, localState) {
      events.push('app.configure:' + mode + ':' + mcpUrl);
      assert.equal(descriptor.runtimeRoot, path.join(root, 'local-runtime'));
      assert.equal(localState, path.join(root, 'local-state'));
      tunnelTarget = mcpUrl;
      return { ok: true, configured: true };
    },
  };
  const localRuntime = {
    lastStatus: null,
    async commandDescriptor() {
      events.push('local.descriptor');
      return {
        python: '/usr/bin/python3',
        control: path.join(root, 'local-control.py'),
        runtimeRoot: path.join(root, 'local-runtime'),
      };
    },
    async control(command) {
      events.push('local.' + command);
      if (command === 'status') return {
        mcp: { ready: false, owned: false },
        tunnel: { ready: false, owned: false, configured: true },
        mcp_url: 'http://127.0.0.1:17842/mcp',
        state_directory: path.join(root, 'local-state'),
      };
      return { ok: true };
    },
    async ensureMcpOnly() {
      events.push('local.ensureMcpOnly');
      return {
        mcp: { ready: true, owned: true },
        tunnel: { ready: false, owned: false, configured: true },
        mcp_url: 'http://127.0.0.1:17842/mcp',
      };
    },
    async loadContext() { return { ok: true }; },
  };
  const switcher = new MacRuntimeSwitcher({
    appServerRuntime, homeDir: root, uid: 123,
    launchAgentDir: path.join(root, 'LaunchAgents'),
    execute: async (file, args) => {
      if (file === '/usr/sbin/lsof') return { stdout: '', stderr: '' };
      events.push('launchctl.' + args[0] + ':' + args[1]);
      return { stdout: '', stderr: '' };
    },
  });

  const app = await switcher.activate(MAC_RUNTIME_APP_SERVER, { localRuntime });
  assert.equal(app.mode, MAC_RUNTIME_APP_SERVER);
  assert.equal(app.status.stable_tunnel_target, 'http://127.0.0.1:27852/mcp');
  assert.equal(events.includes('launchctl.enable:gui/123/' + LOCAL_LAUNCH_AGENT), false);
  assert.deepEqual(events.slice(-9), [
    'local.descriptor',
    'local.status',
    'app.status',
    'local.stop',
    'app.stop',
    'app.configure:app-server:http://127.0.0.1:27852/mcp',
    'app.ensureMcpOnly',
    'app.start:tunnel-only',
    'launchctl.enable:gui/123/' + APP_SERVER_LAUNCH_AGENT,
  ]);
  const plist = await fs.readFile(path.join(root, 'LaunchAgents', APP_SERVER_LAUNCH_AGENT + '.plist'), 'utf8');
  assert.match(plist, /RunAtLoad/);
  assert.match(plist, /selector-start/);
  assert.ok(plist.includes(installedSource));

  events.length = 0;
  const local = await switcher.activate(MAC_RUNTIME_LOCAL, { localRuntime });
  assert.equal(local.mode, MAC_RUNTIME_LOCAL);
  assert.equal(local.status.stable_tunnel_target, 'http://127.0.0.1:17842/mcp');
  assert.equal(events.includes('launchctl.enable:gui/123/' + LOCAL_LAUNCH_AGENT), false);
  assert.deepEqual(events.slice(-8), [
    'local.descriptor',
    'local.status',
    'local.stop',
    'app.stop',
    'app.configure:local:http://127.0.0.1:17842/mcp',
    'local.ensureMcpOnly',
    'app.start:tunnel-only',
    'launchctl.enable:gui/123/' + APP_SERVER_LAUNCH_AGENT,
  ]);

  events.length = 0;
  await local.runtime.ensure();
  assert.deepEqual(events, ['local.ensureMcpOnly', 'app.status']);
  assert.equal(local.runtime.lastStatus.tunnel.ready, true);
});

test('MacRuntimeSwitcher stops only strictly identified legacy listeners', async t => {
  const root = await mkdtemp(path.join(tmpdir(), 'web-pilot-runtime-orphans-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const runtimeRoot = path.join(root, 'local-runtime');
  const bridge = path.join(runtimeRoot, 'mcp', 'bridge_mcp.py');
  const tunnel = path.join(runtimeRoot, 'tools', 'tunnel-client');
  const python = path.join(runtimeRoot, '.venv', 'bin', 'python3');
  const signals = [];
  const calls = new Map();
  const command = new Map([
    [4201, `${python} -B ${bridge} --config /tmp/bridge.json --port 17842`],
    [4202, '/usr/bin/python3 -m http.server 17843'],
  ]);
  const appServerRuntime = {
    stateDir: path.join(root, 'state'),
    installedSource: path.join(root, 'state', 'source'),
    async syncSource() {},
  };
  const switcher = new MacRuntimeSwitcher({
    appServerRuntime,
    homeDir: root,
    execute: async (file, args) => {
      if (file === '/usr/sbin/lsof') {
        if (args.includes('-iTCP:17842')) return { stdout: '4201\n', stderr: '' };
        if (args.includes('-iTCP:17843')) return { stdout: '4202\n', stderr: '' };
        return { stdout: '', stderr: '' };
      }
      if (file === '/bin/ps') {
        const pid = Number(args[1]);
        calls.set(pid, (calls.get(pid) ?? 0) + 1);
        return { stdout: (command.get(pid) ?? '') + '\n', stderr: '' };
      }
      if (file === '/bin/kill') {
        signals.push(args);
        return { stdout: '', stderr: '' };
      }
      return { stdout: '', stderr: '' };
    },
  });
  const stopped = await switcher.stopLegacyOrphans(
    { runtimeRoot, python, control: path.join(runtimeRoot, 'control.py') },
    { mcp_url: 'http://127.0.0.1:17842/mcp', tunnel_ui: 'http://127.0.0.1:17843/ui' },
  );
  assert.deepEqual(stopped, [4201]);
  assert.deepEqual(signals, [['-TERM', '-4201']]);
  assert.equal(calls.get(4201), 2);
  assert.equal(calls.get(4202), 1);
});

test('McpRuntime stop accepts lifecycle result without status payload and clears client', async t => {
  const root = await mkdtemp(path.join(tmpdir(), 'web-pilot-mcp-stop-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  await fs.mkdir(path.join(root, '.venv', 'bin'), { recursive: true });
  await fs.writeFile(path.join(root, 'control.py'), '# control\n');
  await fs.writeFile(path.join(root, '.venv', 'bin', 'python3'), '');
  const calls = [];
  const runtime = new McpRuntime(root, {
    platform: 'darwin',
    execute: async (_file, args) => {
      calls.push(args);
      return { stdout: JSON.stringify({ ok: true, services: [{ service: 'mcp', stopped: true }] }), stderr: '' };
    },
    sessionPlans: { loadContext() {} },
  });
  runtime.client = { stale: true };
  runtime.lastStatus = { mcp: { ready: true } };
  const result = await runtime.control('stop');
  assert.equal(result.ok, true);
  assert.equal(calls[0].at(-1), 'stop');
  assert.equal(runtime.client, null);
  assert.equal(runtime.lastStatus, null);
});