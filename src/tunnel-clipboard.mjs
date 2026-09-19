import { createHash } from 'node:crypto';
const digest = value => createHash('sha256').update(value).digest('hex');
const tunnelPattern = /^tunnel_[A-Za-z0-9_-]{16,100}$/;
const keyPattern = /^sk-[A-Za-z0-9_-]{16,4093}$/;

// Main-process facade: only progress crosses the renderer boundary.
export class TunnelClipboard {
  #id = null; #last = null; #active = false; #generation = 0; #pending = false;
  constructor({ readText, configure, promptTunnelId, onChange = () => {} }) {
    Object.assign(this, { readText, configure, promptTunnelId, onChange });
    this.state = { step: 'tunnel', hasTunnelId: false, error: null };
  }
  snapshot() { return { ...this.state }; }
  manualInput() { return this.#id ? { tunnelId: this.#id } : undefined; }
  #rememberClipboard() {
    try { const value = this.readText(); if (typeof value === 'string') this.#last = digest(value); }
    catch { /* Clipboard access is optional when using native input. */ }
  }
  async pasteTunnelId() {
    if (this.#pending || this.state.step !== 'tunnel') return;
    const generation = this.#generation;
    this.#pending = true; this.#active = true; this.publish({ error: null });
    try {
      const result = await this.promptTunnelId();
      if (generation !== this.#generation || result?.cancelled) return;
      if (typeof result?.tunnelId !== 'string' || !tunnelPattern.test(result.tunnelId)) {
        this.publish({ error: 'Вставьте полный ID туннеля, начинающийся с tunnel_, и подтвердите ввод ещё раз.' });
        return;
      }
      this.#id = result.tunnelId;
      this.publish({ step: 'key', hasTunnelId: true, error: null });
    } catch (error) {
      if (generation === this.#generation) this.publish({ error:
        ['MAC_TUNNEL_ID_INVALID', 'WINDOWS_TUNNEL_ID_INVALID'].includes(error?.code)
          ? 'Вставьте полный ID туннеля, начинающийся с tunnel_, и подтвердите ввод ещё раз.'
          : 'Не удалось открыть окно ввода ID туннеля. Повторите попытку.' });
    } finally {
      // Copy/paste inside a native dialog must not trigger another action on close/cancel.
      if (generation === this.#generation) this.#rememberClipboard();
      this.#pending = false;
    }
  }
  async configureManually(configure) {
    if (this.#pending) return;
    // Stop after collecting the ID so the user sees the API-key instructions first.
    if (!this.#id) { await this.pasteTunnelId(); return; }
    const generation = this.#generation;
    this.#pending = true;
    try { return await configure({ tunnelId: this.#id }); }
    finally {
      if (generation === this.#generation) this.#rememberClipboard();
      this.#pending = false;
    }
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
