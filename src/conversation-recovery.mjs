import { normalizeChatUrl } from './workspace-session.mjs';
// Reopen a known conversation once. Never sends a message or retries generation.
const keyOf = p => p ? JSON.stringify([p.workspace, p.sessionId, p.chatUrl]) : '';
const known = p => p?.chatUrl && normalizeChatUrl(p.chatUrl) === p.chatUrl
  && (p.manualStart || ['sent', 'acknowledged'].includes(p.attempt?.state));
export class ConversationRecovery {
  constructor({ selected, inspect, reopen, available = () => true, onChange = () => {},
    schedule = setTimeout, cancel = clearTimeout, delayMs = 3000, now = Date.now }) {
    Object.assign(this, { selected, inspect, reopen, available, onChange, schedule, cancel, delayMs, now });
    this.used = new Set(); this.cooldowns = new Map(); this.epoch = 0; this.timer = null;
    this.state = { phase: 'idle', message: '', canRetry: false };
  }
  view() { return { ...this.state }; }
  set(phase, message, canRetry = false) {
    this.state = { phase, message, canRetry }; this.onChange(this.view());
  }
  reset() {
    this.epoch++; this.cancel(this.timer); this.timer = null; this.key = null;
    this.set('idle', '');
  }
  observe(page) {
    if (!page || this.state.phase === 'reopening') return;
    if (!page.connectionError) {
      if (this.key && page.url === this.selected()?.chatUrl) this.reset();
      return;
    }
    const project = this.selected(), key = keyOf(project);
    if (this.key === key && this.state.phase !== 'idle') return;
    this.reset(); this.key = key;
    if (!known(project) || page.url !== project.chatUrl) {
      this.set('blocked', 'Связь с ChatGPT прервалась. Адрес разговора ещё не подтверждён: сохраните страницу и проверьте сообщение справа.');
      return;
    }
    if ((this.cooldowns.get(key) ?? 0) > this.now()) { this.cooldown(); return; }
    if (this.used.has(key)) {
      this.set('failed', 'Связь с ChatGPT снова прервалась. Можно повторно открыть этот разговор.', true); return;
    }
    this.set('waiting', 'Связь с ChatGPT прервалась. Повторно открываем сохранённый разговор…');
    this.timer = this.schedule(() => { this.timer = null; void this.retry(); }, this.delayMs);
    this.timer?.unref?.();
  }
  rateLimited(conversationId, retryAfter = 60) {
    const p = this.selected();
    if (!p?.chatUrl || new URL(p.chatUrl).pathname.split('/').at(-1) !== conversationId) return;
    const key = keyOf(p);
    this.cooldowns.set(key, this.now() + Math.max(60000, Math.min(300000, retryAfter * 1000)));
    if (this.key === key) this.cooldown();
  }
  cooldown() {
    this.cancel(this.timer); this.timer = null; this.epoch++;
    this.set('cooldown', 'ChatGPT временно ограничил запросы. Подождите; повторное открытие станет доступно после паузы.');
    const epoch = this.epoch, delay = Math.max(0, (this.cooldowns.get(this.key) ?? this.now()) - this.now());
    this.timer = this.schedule(() => {
      if (epoch !== this.epoch) return;
      this.timer = null;
      this.set('failed', 'Пауза завершена. Можно повторно открыть сохранённый разговор.', true);
    }, delay);
    this.timer?.unref?.();
  }
  async retry() {
    if (this.state.phase === 'reopening' || this.state.phase === 'cooldown') return false;
    this.cancel(this.timer); this.timer = null;
    const project = this.selected(), key = keyOf(project), epoch = this.epoch;
    if (key !== this.key) return false;
    if (!known(project) || !this.available()) {
      this.set('blocked', 'Отправка ещё не подтверждена или выполняется другая операция. Проверьте страницу, затем повторите открытие.', true); return false;
    }
    if ((this.cooldowns.get(key) ?? 0) > this.now()) { this.cooldown(); return false; }
    this.set('reopening', 'Проверяем страницу перед повторным открытием…');
    const current = () => epoch === this.epoch && key === keyOf(this.selected()) ;
    try {
      const page = await this.inspect();
      if (!current()) return false;
      if (page.url !== project.chatUrl || page.login || !page.editorAvailable || page.draftLength
          || !known(this.selected()) || !this.available()) {
        this.set('blocked', page.draftLength
          ? 'В поле ввода есть текст. Сохраните или отправьте его, затем повторно откройте разговор.'
          : 'Состояние разговора пока не подтверждено. Проверьте страницу перед повторным открытием.', true);
        return false;
      }
      this.used.add(key);
      const restored = await this.reopen(project, current);
      if (!current()) return false;
      this.set(restored ? 'restored' : 'failed', restored
        ? 'Разговор открыт повторно. Проверьте продолжение ответа в ChatGPT.'
        : 'Не удалось восстановить страницу. Можно повторить открытие разговора.', !restored);
      return restored;
    } catch {
      if (current()) this.set('failed', 'Не удалось открыть разговор. Проверьте соединение и повторите попытку.', true);
      return false;
    }
  }
}
