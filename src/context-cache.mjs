import { contextInputKey } from './context-inputs.mjs';
import { validateContextPacket } from './mcp-runtime.mjs';

export const contextAddress = (workspace, selection = {}) => selection.sessionId
  ? JSON.stringify([workspace, selection.sessionId, selection.planId ?? null]) : workspace;
export class ContextCache {
  constructor({ load, inputKey = contextInputKey, now = Date.now, intervalMs = 5000, limit = 4, onChange = () => {} }) {
    Object.assign(this, { loadPacket: load, inputKey, now, intervalMs, limit, onChange });
    this.entries = new Map(); this.pending = new Map(); this.nextWarm = new Map(); this.building = new Set(); this.epoch = 0;
  }
  clear() { this.epoch++; this.entries.clear(); this.nextWarm.clear(); }
  isBuilding(workspace, selection) { return this.building.has(contextAddress(workspace, selection)); }
  async load(workspace, selection = {}) {
    const address = contextAddress(workspace, selection);
    if (this.pending.has(address)) {
      const pendingResult = await this.pending.get(address);
      const packet = await this.load(workspace, selection);
      if (!pendingResult.preparation.cacheHit) packet.preparation.cacheHit = false;
      return packet;
    }
    const promise = this.prepare(workspace, selection);
    this.pending.set(address, promise);
    try { return await promise; } finally { this.pending.delete(address); }
  }
  async build(workspace, selection) {
    const address = contextAddress(workspace, selection);
    this.building.add(address); this.onChange();
    try { return await this.loadPacket(workspace, selection); }
    finally { this.building.delete(address); this.onChange(); }
  }
  async prepare(workspace, selection) {
    const started = performance.now(), epoch = this.epoch, address = contextAddress(workspace, selection);
    for (let attempt = 0; attempt < 2; attempt++) {
      let key;
      try { key = await this.inputKey(workspace, selection); }
      catch {
        this.entries.delete(address);
        const packet = validateContextPacket(await this.build(workspace, selection), workspace, selection);
        return { ...packet, preparation: { cacheHit: false, ms: performance.now() - started } };
      }
      const cached = this.entries.get(address);
      if (cached?.key === key) {
        this.entries.delete(address); this.entries.set(address, cached);
        return { ...structuredClone(cached.packet), preparation: { cacheHit: true, inputKey: key, ms: performance.now() - started } };
      }
      this.entries.delete(address);
      const packet = validateContextPacket(await this.build(workspace, selection), workspace, selection);
      let after;
      try { after = await this.inputKey(workspace, selection); } catch { after = null; }
      if (key !== after || epoch !== this.epoch) continue;
      this.entries.set(address, { key, packet: structuredClone(packet) });
      while (this.entries.size > this.limit) this.entries.delete(this.entries.keys().next().value);
      return { ...packet, preparation: { cacheHit: false, inputKey: key, ms: performance.now() - started } };
    }
    throw Object.assign(new Error('Проект менялся при подготовке контекста. Повторите после завершения изменений.'), { code: 'CONTEXT_CHANGED' });
  }
  async isCurrent(workspace, key, selection = {}) {
    if (!key) return false;
    try { return await this.inputKey(workspace, selection) === key; } catch { return false; }
  }
  async warm(workspace, selection = {}) {
    const address = contextAddress(workspace, selection);
    if (this.pending.has(address) || this.now() < (this.nextWarm.get(address) ?? 0)) return;
    this.nextWarm.set(address, this.now() + this.intervalMs);
    while (this.nextWarm.size > this.limit) this.nextWarm.delete(this.nextWarm.keys().next().value);
    try { await this.inputKey(workspace, selection); await this.load(workspace, selection); } catch {}
  }
}
