export const CONTINUE_TEXT = 'Продолжай';
const key = p => p && JSON.stringify([p.workspace, p.sessionId, p.scopeId, p.chatUrl]);
const finished = p => p?.planView?.tasks?.length > 0 && p.planView.tasks.every(t => t.status === 'done');
export class AutoPlan {
  constructor({ selected, inspectPlan, send, onChange = () => {}, log = () => {},
    schedule = setTimeout, cancel = clearTimeout, settleMs = 500, stallMs = 180000,
    available = () => true, saveCheckpoint = async () => {} }) {
    Object.assign(this, { selected, inspectPlan, send, onChange, log, schedule, cancel, settleMs, stallMs, available, saveCheckpoint });
    this.page = null; this.run = null; this.epoch = 0; this.timer = null; this.watchdog = null;
    this.state = { phase: 'off', message: '', active: false, reason: null };
    this.continuations = 0; this.continuationOwner = null;
    this.enabled = false; this.checkpoint = null; this.recoveryPending = false; this.recovering = false;
    this.selectionKey = key(this.selected());
  }
  view() { return { ...this.state, enabled: this.enabled,
    warning: this.run?.stallWarning ? 'STALL_WARNING' : null,
    continuations: this.continuationOwner === key(this.selected()) ? this.continuations : 0 }; }
  restore(enabled, checkpoint = null) {
    this.enabled = enabled === true;
    this.checkpoint = checkpoint && typeof checkpoint.key === 'string'
      && typeof checkpoint.turnId === 'string' && ['sending', 'sent'].includes(checkpoint.status)
      ? { key: checkpoint.key, turnId: checkpoint.turnId, status: checkpoint.status } : null;
    this.recoveryPending = this.enabled;
    this.set(this.enabled ? 'waiting' : 'off', this.enabled ? 'Автовыполнение включено. Ждём подходящий разговор и план.' : '');
  }
  disable() {
    this.enabled = false; this.recoveryPending = false;
    this.pause('Автовыполнение выключено пользователем.', 'MANUAL_OFF');
  }
  async recover() {
    if (!this.enabled || !this.recoveryPending || this.recovering || !this.available()) return;
    const selected = this.selected(), page = this.page;
    if (!selected?.chatUrl || !selected.scopeId || !page?.editorAvailable || page.url !== selected.chatUrl || page.connectionError) return;
    this.recovering = true; this.recoveryPending = false;
    try { await this.start(); }
    finally { this.recovering = false; }
  }
  set(phase, message, active = false, reason = null) {
    this.state = { phase, message, active, reason };
    this.log('state', { phase, ...(reason ? { reason } : {}) }); this.onChange();
  }
  clearTimer() { if (this.timer !== null) this.cancel(this.timer); this.timer = null; }
  clearWatchdog() { if (this.watchdog !== null) this.cancel(this.watchdog); this.watchdog = null; }
  watch(run) {
    this.clearWatchdog();
    if (run.stallWarning) {
      run.stallWarning = false;
      this.log('progress-resumed', { reason: 'STALL_WARNING' });
      this.set(this.state.phase, 'Автовыполнение: ждём завершения ответа.', this.state.active);
    }
    this.watchdog = this.schedule(() => {
      this.watchdog = null;
      if (this.run !== run) return;
      const busy = !!this.page?.busy;
      this.log('progress-timeout', { busy, assistantRevision: this.page?.assistantRevision ?? 0,
        reason: busy ? 'STALL_WARNING' : 'RESPONSE_NOT_OBSERVED' });
      if (busy) {
        run.stallWarning = true;
        this.set(this.state.phase, 'Три минуты без новых наблюдаемых данных. Агент ещё работает; ждём завершения ответа.', this.state.active, 'STALL_WARNING');
        return;
      }
      this.pause('Три минуты без новых наблюдаемых данных. Проверьте ответ или восстановите разговор; повторной отправки не было.', 'RESPONSE_NOT_OBSERVED');
    }, this.stallMs);
    this.watchdog?.unref?.();
  }
  pause(message = 'Автовыполнение приостановлено.', reason = 'MANUAL_OFF', resumeOnMessage = false, sendRevision = this.page?.manualSendRevision ?? 0) {
    const previous = this.run ?? this.suspended?.run;
    this.suspended = resumeOnMessage && previous ? { run: previous, sendRevision } : null;
    this.epoch++; this.clearTimer(); this.clearWatchdog(); this.run = null;
    this.set('paused', message, false, reason);
  }
  complete() {
    this.suspended = null;
    this.epoch++; this.clearTimer(); this.clearWatchdog(); this.run = null;
    this.set('complete', 'Все пункты плана выполнены. Продолжение не отправляется.', false, 'PLAN_COMPLETED');
  }
  selectionChanged() {
    const selectedKey = key(this.selected());
    if (selectedKey === this.selectionKey) return;
    this.selectionKey = selectedKey;
    this.pause('Выбран другой разговор или план.', 'SELECTED_CONTEXT_CHANGED');
    this.recoveryPending = this.enabled;
  }
  observe(event) {
    if (event.reset) { this.page = null; if (this.enabled) this.pause('Страница загружается заново. Автовыполнение восстановится после проверки разговора.', 'DOCUMENT_RELOADED'); this.recoveryPending = this.enabled; return; }
    this.page = { ...event.state, documentId: event.documentId ?? this.page?.documentId };
    this.selectionChanged();
    if (this.suspended) {
      const waiting = this.suspended, p = this.page;
      if (p.documentId !== waiting.run.documentId || p.url !== waiting.run.url || p.connectionError)
        return this.pause('Изменился документ или состояние связи.', p.connectionError ? 'CONNECTION_ERROR' : 'DOCUMENT_CHANGED');
      if ((p.manualSendRevision ?? 0) > waiting.sendRevision) void this.resumeAfterMessage(waiting);
      return;
    }
    const run = this.run;
    if (!run) return;
    this.selectionChanged(); if (this.run !== run) return;
    const p = this.page;
    if (p.documentId !== run.documentId || p.url !== run.url) return this.pause('Изменился документ разговора.', 'DOCUMENT_CHANGED');
    if ((p.manualStopRevision ?? 0) !== run.stopRevision) return this.pause('Вы остановили ответ. Новое сообщение возобновит автовыполнение.', 'MANUAL_STOP', true);
    if ((p.manualInputRevision ?? 0) !== run.inputRevision) return this.pause('Ждём отправки вашего сообщения для продолжения.', 'MANUAL_INPUT', true);
    if (p.connectionError) return this.pause('Связь с ChatGPT прервалась. Восстановите разговор перед продолжением.', 'CONNECTION_ERROR');
    if ((p.assistantRevision ?? 0) !== run.lastActivityRevision || p.busy && !run.sawBusy) {
      run.lastActivityRevision = p.assistantRevision ?? 0; this.watch(run);
    }
    if (p.busy) { run.sawBusy = true; this.clearTimer(); return; }
    if (['sending', 'resuming'].includes(this.state.phase) || !run.sawBusy) return;
    if (p.assistantRevision <= run.beforeAssistantRevision) return;
    if (this.timer !== null) return;
    const epoch = this.epoch;
    this.timer = this.schedule(() => {
      this.timer = null;
      if (epoch === this.epoch) void this.finishTurn(run);
    }, this.settleMs);
    this.timer?.unref?.();
  }
  async start() {
    this.enabled = true; this.recoveryPending = false;
    if (this.state.active) return;
    this.suspended = null;
    const selected = this.selected(), page = this.page;
    if (!selected?.chatUrl || !selected.scopeId || !page || page.url !== selected.chatUrl
        || !page.editorAvailable || page.connectionError) {
      this.recoveryPending = true;
      return this.set('waiting', 'Автовыполнение включено. Ждём подходящий разговор и план.', false, 'PAGE_NOT_READY');
    }
    const epoch = ++this.epoch;
    this.set('checking', 'Проверяем текущий план…', true);
    let plan;
    try { plan = await this.inspectPlan(selected); }
    catch { if (epoch === this.epoch) this.pause('Не удалось проверить план.', 'PLAN_READ_ERROR'); return; }
    if (epoch !== this.epoch) return;
    if (key(this.selected()) !== key(selected)) return this.pause('Изменился выбранный разговор.', 'SELECTED_CONTEXT_CHANGED');
    if (!plan.confirmed) return this.pause('В плане есть незавершённая Git-операция. Завершите её перед запуском.', 'PLAN_CHANGED_OR_TRANSACTION');
    if (finished(plan)) return this.complete();
    if (plan.scopeId !== selected.scopeId || plan.scopeStatus !== 'ACTIVE' || !plan.planView?.tasks?.length)
      return this.pause('Нет доступного незавершённого плана.', 'PLAN_UNAVAILABLE');
    this.run = { key: key(selected), selected: { ...selected }, url: page.url, documentId: page.documentId,
      stopRevision: page.manualStopRevision ?? 0, inputRevision: page.manualInputRevision ?? 0,
      sawBusy: !!page.busy, beforeAssistantRevision: page.assistantRevision ?? 0,
      planRevision: plan.planRevision, unchanged: 0,
      completedAtStart: plan.planView.tasks.filter(t => t.status === 'done').map(t => t.id) };
    this.continuationOwner = this.run.key; this.continuations = 0;
    this.log('start', { completed: this.run.completedAtStart.length, total: plan.planView.tasks.length });
    const run = this.run, checkpoint = this.checkpoint;
    if (page.busy) {
      this.set('running', 'Автовыполнение восстановлено. Ждём завершения текущего ответа.', true);
      this.watch(run); this.observe({ state: this.page, documentId: this.page.documentId });
      return;
    }
    if (page.draftPresent)
      return this.pause('Ждём отправки вашего сообщения. Черновик сохранён, автовыполнение остаётся включённым.', 'DRAFT_PRESENT', true);
    if (checkpoint?.key === run.key && checkpoint.status === 'sending')
      return this.pause('Исход предыдущей отправки неизвестен. Отправьте сообщение после проверки разговора.', 'SEND_UNKNOWN', true);
    if (page.turnId && page.turnId !== (checkpoint?.key === run.key ? checkpoint.turnId : null))
      return this.finishTurn(run);
    this.set('running', 'Автовыполнение включено. Ждём ответ или ваше сообщение.', true);
    this.watch(run); this.observe({ state: this.page, documentId: this.page.documentId });
  }
  async resumeAfterMessage(waiting) {
    if (this.suspended !== waiting) return;
    const p = this.page, run = { ...waiting.run };
    this.suspended = null; this.run = run;
    run.stopRevision = p.manualStopRevision ?? 0; run.inputRevision = p.manualInputRevision ?? 0;
    run.beforeAssistantRevision = p.assistantRevision ?? 0;
    run.lastActivityRevision = run.beforeAssistantRevision;
    run.sawBusy = !!p.busy; run.unchanged = 0;
    this.set('resuming', 'Ваше сообщение отправлено. Возобновляем автовыполнение…', true);
    try {
      const plan = await this.inspectPlan(run.selected);
      if (this.run !== run) return;
      this.selectionChanged(); if (this.run !== run) return;
      if (!plan.confirmed || plan.scopeId !== run.selected.scopeId) return this.pause('Проверьте текущий план и Git-операцию.', 'PLAN_CHANGED_OR_TRANSACTION');
      if (finished(plan)) return this.complete();
      if (plan.scopeStatus !== 'ACTIVE') return this.pause('План приостановлен.', 'PLAN_INACTIVE');
      run.planRevision = plan.planRevision;
      this.log('resume', { reason: 'user-message' });
      this.set('running', 'Автовыполнение возобновлено вашим сообщением.', true);
      this.watch(run);
      this.observe({ state: this.page, documentId: this.page.documentId });
    } catch { if (this.run === run) this.pause('Не удалось проверить план после вашего сообщения.', 'PLAN_READ_ERROR'); }
  }
  async finishTurn(run) {
    if (this.run !== run || this.page?.busy) return;
    run.sawBusy = false;
    this.set('checking', 'Ответ завершён. Проверяем план…', true);
    try {
      const plan = await this.inspectPlan(run.selected);
      if (this.run !== run) return;
      this.selectionChanged(); if (this.run !== run) return;
      if (plan.scopeId !== run.selected.scopeId) return this.pause('Текущий план изменился.', 'PLAN_CHANGED_OR_TRANSACTION');
      if (!plan.confirmed) return this.pause('Git-операция ещё не завершена. Проверьте её результат.', 'PLAN_CHANGED_OR_TRANSACTION');
      if (finished(plan)) return this.complete();
      if (plan.scopeStatus !== 'ACTIVE') return this.pause('План приостановлен.', 'PLAN_INACTIVE');
      run.unchanged = plan.planRevision === run.planRevision ? run.unchanged + 1 : 0;
      run.planRevision = plan.planRevision;
      if (run.unchanged >= 3) return this.pause('Три ответа без изменения плана. Проверьте ход работы.', 'NO_PLAN_PROGRESS');
      await this.dispatch(run);
    } catch {
      if (this.run === run) this.pause('Не удалось проверить план или отправить продолжение. Повтора Send не будет.', 'CHECK_OR_SEND_ERROR');
    }
  }
  async dispatch(run) {
    if (this.run !== run) return;
    const sendRevision = this.page?.manualSendRevision ?? 0;
    run.beforeAssistantRevision = this.page?.assistantRevision ?? 0;
    run.sawBusy = false;
    this.set('sending', 'Отправляем «Продолжай»…', true);
    const current = () => this.run === run && key(this.selected()) === run.key
      && this.page?.documentId === run.documentId && this.page?.url === run.url
      && (this.page?.manualStopRevision ?? 0) === run.stopRevision
      && (this.page?.manualInputRevision ?? 0) === run.inputRevision;
    try {
      const checkpoint = { key: run.key, turnId: this.page?.turnId ?? '', status: 'sending' };
      await this.saveCheckpoint(checkpoint);
      this.checkpoint = checkpoint;
      if (!current()) return;
      const result = await this.send(CONTINUE_TEXT, current, async () => {
        const plan = await this.inspectPlan(run.selected);
        if (!current()) return false;
        if (!plan.confirmed || plan.scopeId !== run.selected.scopeId || plan.scopeStatus !== 'ACTIVE') {
          this.pause('План изменился или выполняется Git-операция.', 'PLAN_CHANGED_OR_TRANSACTION'); return false;
        }
        if (finished(plan)) { this.complete(); return false; }
        return true;
      });
      if (this.run !== run) return;
      if (result.state === 'deferred' && result.reason === 'DRAFT_PRESENT') {
        this.log('wait', { reason: 'DRAFT_PRESENT' });
        this.pause('Ждём отправки вашего сообщения. Черновик сохранён, автовыполнение остаётся включённым.', 'DRAFT_PRESENT', true, sendRevision);
        if (this.page) this.observe({ state: this.page, documentId: this.page.documentId });
        return;
      }
      if (result.state !== 'sent') return this.pause('Сообщение не отправлено либо результат неизвестен. Проверьте поле ввода и разговор.', result.state === 'unknown' ? 'SEND_UNKNOWN' : 'SEND_NOT_SENT');
      this.checkpoint = { ...checkpoint, status: 'sent' };
      await this.saveCheckpoint(this.checkpoint);
      if (!current()) return;
      this.continuations++;
      this.log('send', { kind: 'continue', continuations: this.continuations });
      this.set('running', 'Автовыполнение: ждём завершения ответа.', true);
      this.watch(run);
      if (this.page) this.observe({ state: this.page, documentId: this.page.documentId });
    } catch {
      if (this.run === run) this.pause('Ошибка отправки. Автоматический повтор отключён.', 'SEND_ERROR');
    }
  }
  dispose() { this.suspended = null; this.epoch++; this.clearTimer(); this.clearWatchdog(); this.run = null; }
}
