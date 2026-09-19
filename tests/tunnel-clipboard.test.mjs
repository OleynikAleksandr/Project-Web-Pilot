import test from 'node:test';
import assert from 'node:assert/strict';
import { TunnelClipboard } from '../src/tunnel-clipboard.mjs';
const id = 'tunnel_fixture1234567890123456', key = 'sk-fixture-private-1234567890';
function fixture(options = {}) {
  let text = '', reads = 0; const calls = [], states = [];
  const flow = new TunnelClipboard({ readText: () => { reads++; return text; },
    configure: async values => { calls.push({ ...values }); }, onChange: s => states.push(s), ...options });
  return { flow, calls, states, copy: value => { text = value; }, reads: () => reads,
    tick: patch => flow.tick({ active: true, ...patch }) };
}
test('new ID advances automatically; next key configures once without renderer credentials', async () => {
  const f = fixture(); f.copy(key); await f.tick(); assert.equal(f.calls.length, 0);
  f.copy('irrelevant text'); await f.tick();
  f.copy(id); await f.tick(); assert.equal(f.flow.snapshot().step, 'key');
  assert.deepEqual(f.flow.manualInput(), { tunnelId: id });
  f.copy(key); await f.tick(); await f.tick();
  assert.deepEqual(f.calls, [{ tunnelId: id, key }]); assert.equal(f.flow.snapshot().step, 'done');
  assert.equal(f.flow.manualInput(), undefined);
  assert.doesNotMatch(JSON.stringify(f.states), /tunnel_fixture|sk-fixture/);
});
test('inactive, unready and busy steps do not read clipboard; returning ignores old data', async () => {
  const f = fixture();
  await f.tick({ active: false }); await f.tick({ ready: false }); await f.tick({ busy: true });
  assert.equal(f.reads(), 0);
  await f.tick(); f.copy(id); await f.tick();
  await f.tick({ active: false }); assert.equal(f.flow.manualInput(), undefined);
  f.copy(key); await f.tick(); assert.equal(f.calls.length, 0); assert.equal(f.flow.snapshot().step, 'tunnel');
});
test('malformed keys and IDs never configure; new valid ID replaces the pending ID', async () => {
  const f = fixture(); await f.tick();
  for (const value of ['tunnel_short', key, 'tunnel_' + 'x'.repeat(101)]) { f.copy(value); await f.tick(); }
  assert.equal(f.calls.length, 0); assert.equal(f.flow.snapshot().step, 'tunnel');
  f.copy(id); await f.tick();
  for (const value of ['sk-short', key + ' extra', 'x'.repeat(9000)]) { f.copy(value); await f.tick(); }
  assert.equal(f.calls.length, 0);
  const next = id + '2'; f.copy(next); await f.tick(); f.copy(key); await f.tick();
  assert.deepEqual(f.calls, [{ tunnelId: next, key }]);
});
test('pending connection is single-flight and disposal discards late results and credentials', async () => {
  let finish, received;
  const f = fixture({ configure: data => { received = data; return new Promise(r => { finish = r; }); } });
  await f.tick(); f.copy(id); await f.tick(); f.copy(key);
  const pending = f.tick(); assert.equal(f.flow.snapshot().step, 'connecting');
  const reads = f.reads(); await f.tick(); assert.equal(f.reads(), reads);
  f.flow.dispose(); finish(); await pending;
  assert.equal(received.key, ''); assert.equal(f.flow.snapshot().step, 'tunnel');
  assert.equal(f.flow.manualInput(), undefined);
});
test('failure does not echo secret or retry unchanged data; corrected key can retry', async () => {
  let attempts = 0;
  const f = fixture({ configure: async () => { if (++attempts === 1) throw new Error(key); } });
  await f.tick(); f.copy(id); await f.tick(); f.copy(key); await f.tick();
  assert.equal(f.flow.snapshot().step, 'key'); assert.doesNotMatch(f.flow.snapshot().error, /sk-fixture/);
  await f.tick(); assert.equal(attempts, 1);
  f.copy(key + '2'); await f.tick(); assert.equal(attempts, 2); assert.equal(f.flow.snapshot().step, 'done');
});

test('explicit paste accepts an unchanged ID but stops at the key instructions without configuring', async () => {
  const f = fixture(); f.copy(id); await f.tick();
  assert.equal(f.flow.snapshot().step, 'tunnel');
  f.flow.pasteTunnelId();
  assert.equal(f.flow.snapshot().step, 'key');
  assert.deepEqual(f.flow.manualInput(), { tunnelId: id });
  assert.deepEqual(f.calls, []);
  assert.doesNotMatch(JSON.stringify(f.states), /tunnel_fixture|sk-fixture/);
});

test('explicit ID paste rejects keys, invalid data and clipboard failures without leaking content', () => {
  const f = fixture();
  for (const value of [key, 'tunnel_short', 'x'.repeat(9000), '']) {
    f.copy(value); f.flow.pasteTunnelId();
    assert.equal(f.flow.snapshot().step, 'tunnel');
    assert.match(f.flow.snapshot().error, /Copy tunnel ID/);
    assert.equal(f.flow.manualInput(), undefined);
  }
  const failed = fixture({ readText: () => { throw new Error(key); } });
  failed.flow.pasteTunnelId();
  assert.doesNotMatch(JSON.stringify([...f.states, ...failed.states]), /sk-fixture/);
});

test('manual route separates ID and key actions, retains ID on cancel and excludes clipboard races', async () => {
  const f = fixture(), prompts = [];
  const configure = async values => { prompts.push(values); };
  f.copy(id); await f.flow.configureManually(configure);
  assert.equal(f.flow.snapshot().step, 'key'); assert.deepEqual(prompts, []);
  await f.flow.configureManually(configure);
  assert.deepEqual(prompts, [{ tunnelId: id }]);
  assert.deepEqual(f.flow.manualInput(), { tunnelId: id });
  let finish;
  const pending = f.flow.configureManually(() => new Promise(resolve => { finish = resolve; }));
  const reads = f.reads(); f.copy(key); await f.tick();
  await f.flow.configureManually(configure);
  assert.equal(f.reads(), reads); assert.equal(prompts.length, 1); assert.deepEqual(f.calls, []);
  finish(); await pending;
});
