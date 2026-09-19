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

test('MacRuntimeSwitcher enforces exclusive stop/start order and persistent launch-agent choice', async t => {
  const root = await mkdtemp(path.join(tmpdir(), 'web-pilot-runtime-switch-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const events = [];
  const installedSource = path.join(root, 'state', 'source');
  const appServerRuntime = {
    installedSource,
    stateDir: path.join(root, 'state'),
    async syncSource() {
      events.push('app.sync');
      await fs.mkdir(installedSource, { recursive: true });
      await fs.writeFile(path.join(installedSource, 'control.py'), '# control\n');
    },
    async ensure() { events.push('app.ensure'); return { mcp: { ready: true }, tunnel: { ready: true, configured: true } }; },
    async control(command) { events.push('app.' + command); return { ok: true }; },
  };
  const localRuntime = {
    async ensure() { events.push('local.ensure'); return { mcp: { ready: true }, tunnel: { ready: true, configured: true } }; },
    async control(command) { events.push('local.' + command); return { ok: true }; },
  };
  const switcher = new MacRuntimeSwitcher({
    appServerRuntime, homeDir: root, uid: 123,
    launchAgentDir: path.join(root, 'LaunchAgents'),
    execute: async (_file, args) => { events.push('launchctl.' + args[0] + ':' + args[1]); return { stdout: '', stderr: '' }; },
  });

  const app = await switcher.activate(MAC_RUNTIME_APP_SERVER, { localRuntime });
  assert.equal(app.mode, MAC_RUNTIME_APP_SERVER);
  assert.deepEqual(events.slice(-4), [
    'launchctl.disable:gui/123/' + LOCAL_LAUNCH_AGENT,
    'local.stop',
    'launchctl.enable:gui/123/' + APP_SERVER_LAUNCH_AGENT,
    'app.ensure',
  ]);
  const plist = await fs.readFile(path.join(root, 'LaunchAgents', APP_SERVER_LAUNCH_AGENT + '.plist'), 'utf8');
  assert.match(plist, /RunAtLoad/);
  assert.ok(plist.includes(installedSource));
  assert.doesNotMatch(plist, /Project Web Pilot\/tools\/codex-app-server-mcp/);

  events.length = 0;
  const local = await switcher.activate(MAC_RUNTIME_LOCAL, { localRuntime });
  assert.equal(local.mode, MAC_RUNTIME_LOCAL);
  assert.deepEqual(events.slice(-4), [
    'launchctl.disable:gui/123/' + APP_SERVER_LAUNCH_AGENT,
    'app.stop',
    'launchctl.enable:gui/123/' + LOCAL_LAUNCH_AGENT,
    'local.ensure',
  ]);
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
