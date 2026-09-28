// Agent time follows observed busy/idle transitions from the ChatGPT Stop control.
// A request starts on busy. Idle starts one grace timeout; if busy returns during
// the grace period it is the same request. Final duration ends at the idle transition.
export const AGENT_IDLE_GRACE_MS = 5000;

const sameTarget = (a, b) => !!a && !!b && a.workspace === b.workspace && a.sessionId === b.sessionId;

export class AgentTimer {
  constructor({ now = Date.now, graceMs = AGENT_IDLE_GRACE_MS, onFinish = () => {},
    schedule = setTimeout, cancel = clearTimeout } = {}) {
    if (!Number.isFinite(graceMs) || graceMs < 0) throw new RangeError('graceMs must be a non-negative number');
    Object.assign(this, { now, graceMs, onFinish, schedule, cancel });
    this.active = null;
  }

  observe(target, busy, at = this.now()) {
    let changed = false;
    if (this.active && !sameTarget(this.active, target)) changed = this.finish(at);
    if (!target?.workspace || !target?.sessionId) return changed;
    let run = this.active;
    if (busy) {
      if (!run) {
        this.active = { workspace: target.workspace, sessionId: target.sessionId,
          startedAt: at, lastBusyAt: at, paused: false, graceTimer: null };
        return true;
      }
      if (run.paused) {
        if (run.graceTimer) this.cancel(run.graceTimer);
        run.graceTimer = null;
        run.paused = false;
        return true;
      }
      run.lastBusyAt = Math.max(run.lastBusyAt, at);
      return changed;
    }
    if (!run || run.paused) return changed;
    run.lastBusyAt = at;
    run.paused = true;
    const expected = run;
    run.graceTimer = this.schedule(() => {
      if (this.active !== expected || !expected.paused) return;
      expected.graceTimer = null;
      this.finish(expected.lastBusyAt);
    }, this.graceMs);
    run.graceTimer?.unref?.();
    return true;
  }

  finish(at = this.now()) {
    const run = this.active;
    if (!run) return false;
    if (run.graceTimer) this.cancel(run.graceTimer);
    run.graceTimer = null;
    this.active = null;
    const endedAt = run.paused ? run.lastBusyAt : at;
    this.onFinish({ workspace: run.workspace, sessionId: run.sessionId }, Math.max(0, endedAt - run.startedAt));
    return true;
  }

  view(target) {
    const run = this.active;
    return sameTarget(run, target) ? {
      startedAt: run.startedAt,
      lastBusyAt: run.lastBusyAt,
      paused: run.paused,
    } : null;
  }
}
