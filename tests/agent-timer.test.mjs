import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AgentTimer, AGENT_IDLE_GRACE_MS } from '../src/agent-timer.mjs';

const a = { workspace: '/a', sessionId: 's1' }, b = { workspace: '/a', sessionId: 's2' };

function fixture() {
  let now = 0;
  const finished = [], scheduled = [];
  const schedule = (fn, ms) => {
    const token = { fn, at: now + ms, cancelled: false, unref() {} };
    scheduled.push(token);
    return token;
  };
  const cancel = token => { token.cancelled = true; };
  const t = new AgentTimer({ now: () => now, schedule, cancel,
    onFinish: (target, ms) => finished.push([target.sessionId, ms]) });
  const observe = (target, busy, at) => { now = at; return t.observe(target, busy, at); };
  const advance = at => {
    now = at;
    for (;;) {
      const due = scheduled.find(item => !item.cancelled && !item.ran && item.at <= now);
      if (!due) break;
      due.ran = true;
      due.fn();
    }
  };
  return { t, finished, observe, advance, scheduled };
}

test('busy/idle transitions use one grace timeout and short idle gaps stay in the same request', () => {
  const f = fixture();
  assert.equal(f.observe(a, false, 0), false);
  assert.equal(f.observe(a, true, 1000), true);
  assert.deepEqual(f.t.view(a), { startedAt: 1000, lastBusyAt: 1000, paused: false });
  assert.equal(f.observe(a, false, 3000), true);
  assert.deepEqual(f.t.view(a), { startedAt: 1000, lastBusyAt: 3000, paused: true });
  assert.equal(f.scheduled.filter(item => !item.cancelled).length, 1);
  assert.equal(f.observe(a, true, 3000 + AGENT_IDLE_GRACE_MS - 1500), true);
  assert.equal(f.scheduled.filter(item => !item.cancelled && !item.ran).length, 0, 'resume cancels the grace timer');
  const finalIdle = 7500;
  assert.equal(f.observe(a, false, finalIdle), true);
  f.advance(finalIdle + AGENT_IDLE_GRACE_MS - 1);
  assert.deepEqual(f.finished, []);
  f.advance(finalIdle + AGENT_IDLE_GRACE_MS);
  assert.deepEqual(f.finished, [['s1', finalIdle - 1000]], 'grace is not added to the final duration');
  assert.equal(f.t.view(a), null);
});

test('repeated idle observations do not create extra grace timers', () => {
  const f = fixture();
  f.observe(a, true, 0);
  f.observe(a, false, 1000);
  f.observe(a, false, 2000);
  f.observe(a, false, 3000);
  assert.equal(f.scheduled.filter(item => !item.cancelled).length, 1);
  f.advance(1000 + AGENT_IDLE_GRACE_MS);
  assert.deepEqual(f.finished, [['s1', 1000]]);
});

test('switching or leaving the session ends the current interval at the observed transition', () => {
  const f = fixture();
  f.observe(a, true, 0);
  assert.equal(f.observe(b, false, 5000), true);
  assert.deepEqual(f.finished, [['s1', 5000]]);
  f.observe(b, true, 6000);
  assert.deepEqual(f.t.view(b), { startedAt: 6000, lastBusyAt: 6000, paused: false });
  assert.equal(f.observe(null, false, 7000), true);
  assert.deepEqual(f.finished, [['s1', 5000], ['s2', 1000]]);
  assert.equal(f.t.finish(), false);
});

test('invalid grace period is rejected', () => {
  assert.throws(() => new AgentTimer({ graceMs: -1 }), RangeError);
  assert.throws(() => new AgentTimer({ graceMs: Number.NaN }), RangeError);
});
