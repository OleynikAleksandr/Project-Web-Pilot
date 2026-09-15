import { contextInputKey } from './context-inputs.mjs';
import { validateContextPacket } from './mcp-runtime.mjs';

export class ContextCache {
  constructor({ load, inputKey = contextInputKey, now = Date.now, intervalMs = 5000, limit = 4 }) {
    Object.assign(this, { loadPacket: load, inputKey, now, intervalMs, limit });
    this.entries = new Map(); this.pending = new Map(); this.nextWarm = new Map();
    this.epoch = 0;
  }
  clear() { this.epoch++; this.entries.clear(); this.nextWarm.clear(); }
  async load(workspace) {
    if (this.pending.has(workspace)) {
      const pendingResult = await this.pending.get(workspace);
      const packet = await this.load(workspace);
      if (!pendingResult.preparation.cacheHit) packet.preparation.cacheHit = false;
      return packet;
    }
    const promise = this.prepare(workspace);
    this.pending.set(workspace, promise);
    try { return await promise; } finally { this.pending.delete(workspace); }
  }
  async prepare(workspace) {
    const started = performance.now(), epoch = this.epoch;
    for (let attempt = 0; attempt < 2; attempt++) {
      let key;
      try { key = await this.inputKey(workspace); }
      catch {
        this.entries.delete(workspace);
        // Unsupported repositories retain the original canonical recovery path.
        const packet = validateContextPacket(await this.loadPacket(workspace), workspace);
        return { ...packet, preparation: { cacheHit: false, ms: performance.now() - started } };
      }
      const cached = this.entries.get(workspace);
      if (cached?.key === key) {
        this.entries.delete(workspace); this.entries.set(workspace, cached);
        return { ...structuredClone(cached.packet), preparation: { cacheHit: true, inputKey: key, ms: performance.now() - started } };
      }
      this.entries.delete(workspace);
      const packet = validateContextPacket(await this.loadPacket(workspace), workspace);
      let after;
      try { after = await this.inputKey(workspace); } catch { after = null; }
      if (key !== after || epoch !== this.epoch) continue;
      this.entries.set(workspace, { key, packet: structuredClone(packet) });
      while (this.entries.size > this.limit) this.entries.delete(this.entries.keys().next().value);
      return { ...packet, preparation: { cacheHit: false, inputKey: key, ms: performance.now() - started } };
    }
    throw Object.assign(new Error('Проект менялся при подготовке контекста. Повторите после завершения изменений.'), { code: 'CONTEXT_CHANGED' });
  }
  async isCurrent(workspace, key) {
    if (!key) return false;
    try { return await this.inputKey(workspace) === key; } catch { return false; }
  }
  async warm(workspace) {
    if (this.pending.has(workspace) || this.now() < (this.nextWarm.get(workspace) ?? 0)) return;
    this.nextWarm.set(workspace, this.now() + this.intervalMs);
    while (this.nextWarm.size > this.limit) this.nextWarm.delete(this.nextWarm.keys().next().value);
    // Do not invoke recovery on a transaction, unsupported input or unavailable repository in background.
    try { await this.inputKey(workspace); await this.load(workspace); } catch {}
  }
}
