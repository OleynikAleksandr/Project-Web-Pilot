// Wall-clock time ChatGPT spends on a user's request, observed only through the visible Stop control.
// A request starts when ChatGPT becomes busy and ends after it has stayed idle for the grace period;
// short gaps (tool calls, streaming hand-offs) belong to the same request.
export const AGENT_IDLE_GRACE_MS = 5000;

const sameTarget = (a, b) => !!a && !!b && a.workspace === b.workspace && a.sessionId === b.sessionId;

export class AgentTimer {
  constructor({ now = Date.now, graceMs = AGENT_IDLE_GRACE_MS, onFinish = () => {} } = {}) {
    if (!Number.isFinite(graceMs) || graceMs < 0) throw new RangeError('graceMs must be a non-negative number');
    this.now = now; this.graceMs = graceMs; this.onFinish = onFinish; this.active = null;
  }

  // target: { workspace, sessionId } of the selected session, or null. Returns true when the visible state changed.
  observe(target, busy, at = this.now()) {
    let changed = false;
    if (this.active && !sameTarget(this.active, target)) changed = this.finish();
    if (!target?.workspace || !target?.sessionId) return changed;
    const run = this.active;
    if (busy) {
      if (!run) {
        this.active = { workspace: target.workspace, sessionId: target.sessionId, startedAt: at, lastBusyAt: at, paused: false };
        return true;
      }
      run.lastBusyAt = Math.max(run.lastBusyAt, at);
      if (!run.paused) return changed;
      run.paused = false;
      return true;
    }
    if (!run) return changed;
    if (at - run.lastBusyAt >= this.graceMs) return this.finish();
    if (run.paused) return changed;
    run.paused = true;
    return true;
  }

  // Ends the current request at the last moment ChatGPT was seen working.
  finish() {
    const run = this.active;
    if (!run) return false;
    this.active = null;
    this.onFinish({ workspace: run.workspace, sessionId: run.sessionId }, Math.max(0, run.lastBusyAt - run.startedAt));
    return true;
  }

  view(target) {
    const run = this.active;
    return sameTarget(run, target) ? { startedAt: run.startedAt, lastBusyAt: run.lastBusyAt, paused: run.paused } : null;
  }
}
