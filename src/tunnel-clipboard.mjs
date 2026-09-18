import { createHash } from 'node:crypto';
const digest = value => createHash('sha256').update(value).digest('hex');
const tunnelPattern = /^tunnel_[A-Za-z0-9_-]{16,100}$/;
const keyPattern = /^sk-[A-Za-z0-9_-]{16,4093}$/;

// Main-process facade: only progress crosses the renderer boundary.
export class TunnelClipboard {
  #id = null; #last = null; #active = false; #generation = 0; #pending = false;
  constructor({ readText, configure, onChange = () => {} }) {
    Object.assign(this, { readText, configure, onChange });
    this.state = { step: 'tunnel', hasTunnelId: false, error: null };
  }
  snapshot() { return { ...this.state }; }
  manualInput() { return this.#id ? { tunnelId: this.#id } : undefined; }
  publish(patch) { Object.assign(this.state, patch); this.onChange(this.snapshot()); }
  reset() {
    this.#generation++; this.#id = null; this.#last = null; this.#active = false;
    if (this.state.step !== 'tunnel' || this.state.error || this.state.hasTunnelId)
      this.publish({ step: 'tunnel', hasTunnelId: false, error: null });
  }
  async tick({ active, ready = true, busy = false }) {
    if (!active) { if (this.#active) this.reset(); return; }
    if (busy || this.#pending) return;
    if (!ready) { if (this.#active) this.reset(); return; }
    let value;
    try { value = this.readText(); } catch { return; }
    if (typeof value !== 'string') return;
    // Establish a baseline without accepting stale credentials from another task.
    if (!this.#active) { this.#active = true; this.#last = digest(value); return; }
    if (value.length > 8192) { this.#last = digest(value); return; }
    const changed = digest(value);
    if (changed === this.#last) return;
    this.#last = changed; value = value.trim();
    if (tunnelPattern.test(value)) {
      this.#id = value;
      this.publish({ step: 'key', hasTunnelId: true, error: null }); return;
    }
    if (!this.#id || !keyPattern.test(value)) return;
    const generation = this.#generation;
    const credentials = { tunnelId: this.#id, key: value }; value = '';
    this.#pending = true; this.publish({ step: 'connecting', error: null });
    try {
      await this.configure(credentials);
      if (generation === this.#generation) {
        this.#id = null; this.publish({ step: 'done', hasTunnelId: false, error: null });
      }
    } catch {
      if (generation === this.#generation) this.publish({ step: 'key',
        error: 'Подключение не подтверждено. Проверьте данные и права ключа. Скопируйте исправленный ключ или воспользуйтесь ручным вводом.' });
    } finally { credentials.key = ''; this.#pending = false; }
  }
  dispose() { this.reset(); }
}
