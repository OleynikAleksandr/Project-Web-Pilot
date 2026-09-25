import test from 'node:test';
import assert from 'node:assert/strict';
import { PlanMonitor } from '../src/plan-monitor.mjs';
const selected = { workspace: '/project', projectId: 'p', sessionId: 's' };
const info = (revision, s = selected) => ({ workspace: s.workspace, projectId: s.projectId,
  inspectedSessionId: s.sessionId, scopeId: 'plan', planRevision: revision, planView: { completed: revision } });

test('plan advances independently, without repeated notifications or delivery calls', async () => {
  let revision = 2, changes = 0;
  const monitor = new PlanMonitor({ selected: () => selected, inspect: async () => info(revision), onChange: () => changes++ });
  await monitor.tick(); await monitor.tick();
  assert.equal(changes, 1);
  revision = 15; await monitor.tick();
  assert.equal(monitor.view(selected, info(2)).planView.completed, 15);
  assert.equal(changes, 2);
});

test('late results cannot overwrite another session or a closed monitor', async () => {
  let active = selected, resolve;
  const monitor = new PlanMonitor({ selected: () => active, inspect: () => new Promise(r => { resolve = r; }) });
  const pending = monitor.tick();
  active = { ...selected, sessionId: 'other' };
  resolve(info(2)); await pending;
  assert.equal(monitor.view(active), null);
  const next = monitor.tick(); monitor.close(); resolve(info(3, active)); await next;
  assert.equal(monitor.info, null);
});

test('transient read failures retry and preserve only the matching plan', async () => {
  let fail = false;
  const monitor = new PlanMonitor({ selected: () => selected, inspect: async () => {
    if (fail) throw Error('transaction in progress'); return info(5);
  } });
  await monitor.tick(); fail = true; await monitor.tick();
  assert.equal(monitor.view(selected).planRevision, 5);
  assert.equal(monitor.view({ ...selected, projectId: 'replacement' }), null);
  assert.equal(monitor.pending, false);
  fail = false; await monitor.tick();
  assert.equal(monitor.view(selected, info(6)).planRevision, 6);
});
