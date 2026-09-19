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
  pasteTunnelId() {
    if (this.#pending || this.state.step !== 'tunnel') return;
    let value;
    try { value = this.readText(); } catch { /* Show the same safe instruction below. */ }
    if (typeof value !== 'string' || value.length > 8192 || !tunnelPattern.test(value.trim())) {
      this.publish({ error: 'Скопируйте ID с кнопки Copy tunnel ID в Tunnels, затем нажмите «Вставить ID туннеля». ID начинается с tunnel_.' });
      return;
    }
    this.#active = true; this.#last = digest(value); this.#id = value.trim();
    this.publish({ step: 'key', hasTunnelId: true, error: null });
  }
  async configureManually(configure) {
    if (this.#pending) return;
    // Stop after collecting the ID so the user sees the API-key instructions first.
    if (!this.#id) { this.pasteTunnelId(); return; }
    this.#pending = true;
    try { return await configure({ tunnelId: this.#id }); }
    finally { this.#pending = false; }
  }
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
