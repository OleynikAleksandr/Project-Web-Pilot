import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AgentTimer, AGENT_IDLE_GRACE_MS } from '../src/agent-timer.mjs';

const a = { workspace: '/a', sessionId: 's1' }, b = { workspace: '/a', sessionId: 's2' };
const timer = () => { const finished = []; return { finished, t: new AgentTimer({ onFinish: (target, ms) => finished.push([target.sessionId, ms]) }) }; };

test('a request runs from the first busy observation to the last one, bridging pauses shorter than the grace period', () => {
  const { t, finished } = timer();
  assert.equal(t.observe(a, false, 0), false);
  assert.equal(t.observe(a, true, 1000), true);
  assert.deepEqual(t.view(a), { startedAt: 1000, lastBusyAt: 1000, paused: false });
  assert.equal(t.observe(a, true, 2000), false);
  assert.equal(t.observe(a, false, 3000), true, 'pause is published');
  assert.equal(t.view(a).paused, true);
  assert.equal(t.observe(a, true, 3000 + AGENT_IDLE_GRACE_MS - 1500), true, 'short gap resumes the same request');
  assert.equal(t.view(a).startedAt, 1000);
  const lastBusy = 3000 + AGENT_IDLE_GRACE_MS - 1500;
  assert.equal(t.observe(a, false, lastBusy + 1000), true);
  assert.equal(t.observe(a, false, lastBusy + AGENT_IDLE_GRACE_MS - 1), false);
  assert.deepEqual(finished, []);
  assert.equal(t.observe(a, false, lastBusy + AGENT_IDLE_GRACE_MS), true);
  assert.deepEqual(finished, [['s1', lastBusy - 1000]]);
  assert.equal(t.view(a), null);
});

test('switching or leaving the session ends the running request at its last busy moment', () => {
  const { t, finished } = timer();
  t.observe(a, true, 0); t.observe(a, true, 4000);
  assert.equal(t.observe(b, false, 5000), true);
  assert.deepEqual(finished, [['s1', 4000]]);
  assert.equal(t.view(a), null);
  t.observe(b, true, 6000);
  assert.equal(t.view(a), null, 'another session never sees the running request');
  assert.deepEqual(t.view(b), { startedAt: 6000, lastBusyAt: 6000, paused: false });
  assert.equal(t.observe(null, false, 7000), true);
  assert.deepEqual(finished, [['s1', 4000], ['s2', 0]]);
  assert.equal(t.finish(), false, 'nothing left to finish');
});

test('invalid grace period is rejected', () => {
  assert.throws(() => new AgentTimer({ graceMs: -1 }), RangeError);
  assert.throws(() => new AgentTimer({ graceMs: Number.NaN }), RangeError);
});
