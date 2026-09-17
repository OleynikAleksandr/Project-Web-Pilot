import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { WorkspaceReadiness } from '../src/workspace-readiness.mjs';
import { WorkspaceSetup } from '../src/workspace-setup.mjs';

const deferred = () => { let resolve; const promise = new Promise(r => { resolve = r; }); return { promise, resolve }; };
const state = (key = 'a') => ({ key, transaction: false });

test('readiness coalesces work, checks a fresh key on reuse, isolates returned values and bounds memory', async () => {
  let key = 'a', inspections = 0, fingerprints = 0;
  const gate = deferred();
  const cache = new WorkspaceReadiness({ maxEntries: 2,
    fingerprint: async () => { fingerprints++; return state(key); },
    inspect: async workspace => { inspections++; await gate.promise; return { ready: true, workspace, inputKey: key }; } });
  const first = cache.check('/a'), duplicate = cache.check('/a'); gate.resolve();
  const a = await first, b = await duplicate;
  assert.equal(inspections, 1); a.ready = false; assert.equal(b.ready, true);
  const before = fingerprints;
  assert.equal((await cache.check('/a')).ready, true);
  assert.equal(fingerprints - before, 1); assert.equal(inspections, 1);
  key = 'b'; await cache.check('/a'); assert.equal(inspections, 2);
  await cache.check('/b'); await cache.check('/c'); assert.equal(cache.cache.size, 2);
  await cache.check('/a'); assert.equal(inspections, 5);
});

test('readiness rejects stale or invalidated work and never caches errors or transactions', async () => {
  let key = 'a', inspections = 0;
  const cache = new WorkspaceReadiness({ fingerprint: async () => state(key), inspect: async () => {
    inspections++; const old = key; key += 'x'; return { ready: true, inputKey: old };
  } });
  await assert.rejects(cache.check('/a'), { code: 'READINESS_CHANGED' });
  assert.equal(inspections, 2); assert.equal(cache.cache.size, 0);
  const gate = deferred();
  cache.inspect = async () => { await gate.promise; return { ready: true, inputKey: key }; };
  const pending = cache.check('/a'); cache.clear('/a'); gate.resolve();
  await assert.rejects(pending, { code: 'READINESS_CHANGED' });
  cache.inspect = async () => { throw Object.assign(new Error('failed'), { code: 'FAILED' }); };
  await assert.rejects(cache.check('/a'), { code: 'FAILED' });
  cache.inspect = async () => ({ ready: false });
  assert.equal((await cache.check('/a')).ready, false); assert.equal(cache.cache.size, 0);
  cache.fingerprint = async () => ({ key, transaction: true });
  await assert.rejects(cache.check('/a'), { code: 'READINESS_BUSY' });
  cache.fingerprint = async () => state(key);
  cache.inspect = async () => ({ ready: true, inputKey: key });
  assert.equal((await cache.check('/a')).ready, true);
});

test('rapid workspace choices retain only one active and the latest pending operation', async () => {
  const gate = deferred(), inspected = [];
  const cache = new WorkspaceReadiness({ fingerprint: async workspace => state(workspace), inspect: async workspace => {
    inspected.push(workspace); if (workspace === '/a') await gate.promise;
    return { ready: true, inputKey: workspace };
  } });
  const a = cache.check('/a');
  const b = cache.check('/b'); const rejected = assert.rejects(b, { code: 'READINESS_SUPERSEDED' });
  const c = cache.check('/c'); const againA = cache.check('/a');
  await rejected; gate.resolve(); await Promise.all([a, c, againA]);
  assert.deepEqual(inspected, ['/a', '/c']);
  assert.equal(cache.active, null); assert.equal(cache.pending, null);
});

test('trusted worker reuses unchanged readiness and detects a required document change', async t => {
  const parent = await fs.mkdtemp(path.join(os.tmpdir(), 'web-pilot-readiness-'));
  t.after(() => fs.rm(parent, { recursive: true, force: true }));
  const environment = { ...process.env, GIT_AUTHOR_NAME: 'Readiness Fixture', GIT_AUTHOR_EMAIL: 'fixture@example.invalid',
    GIT_COMMITTER_NAME: 'Readiness Fixture', GIT_COMMITTER_EMAIL: 'fixture@example.invalid' };
  const setup = new WorkspaceSetup({ environment });
  const preview = await setup.preview({ mode: 'new', parent, name: 'workspace' });
  const created = await setup.apply(preview.token); assert.equal(created.ready, true);
  const call = setup.call.bind(setup); let inspections = 0;
  setup.call = input => { if (input.action === 'inspect') inspections++; return call(input); };
  const first = await setup.ready(created.workspace), again = await setup.ready(created.workspace);
  assert.equal(first.ready, true); assert.equal(again.inputKey, first.inputKey); assert.equal(inspections, 1);
  const file = path.join(created.workspace, 'docs/architecture/OVERVIEW.md');
  await fs.appendFile(file, '\nChanged required document.\n');
  const changed = await setup.ready(created.workspace);
  assert.equal(changed.ready, true); assert.notEqual(changed.inputKey, first.inputKey); assert.equal(inspections, 2);
  setup.invalidateReadiness(created.workspace); await setup.ready(created.workspace); assert.equal(inspections, 3);
});
