// Read-only plan projection. Delivery, browser readiness and MCP never gate it.
export class PlanMonitor {
  constructor({ selected, inspect, onChange = () => {} }) {
    Object.assign(this, { selected, inspect, onChange });
    this.info = null;
    this.pending = false;
    this.closed = false;
  }

  matches(info, selected) {
    return !!info && !!selected && info.workspace === selected.workspace
      && info.inspectedSessionId === selected.sessionId && info.projectId === selected.projectId;
  }

  view(selected, fallback = null) {
    const current = this.matches(this.info, selected) ? this.info : null;
    const previous = this.matches(fallback, selected) ? fallback : null;
    if (!current) return previous;
    if (previous?.scopeId === current.scopeId && previous.planRevision > current.planRevision) return previous;
    return current;
  }

  async tick() {
    if (this.closed || this.pending) return;
    const selected = this.selected();
    if (!selected) { this.info = null; return; }
    this.pending = true;
    try {
      const info = await this.inspect(selected.workspace, selected.sessionId);
      if (this.closed || !this.matches(info, this.selected()) || !this.matches(info, selected)) return;
      if (JSON.stringify(this.info) !== JSON.stringify(info)) {
        this.info = info;
        this.onChange();
      }
    } catch {
      // A transactional replace can briefly be unreadable. Preserve the last
      // valid projection and retry on the next tick, without stopping delivery.
    } finally { this.pending = false; }
  }

  close() { this.closed = true; this.info = null; }
}
