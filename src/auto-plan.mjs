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
    this.enabled = false; this.checkpoint = null; this.closed = false;
    this.pending = null; this.rerunRequested = false; this.lastAvailability = false;
    this.selectionKey = key(this.selected()); this.manualWaiting = null;
  }
  view() { return { ...this.state, enabled: this.enabled,
    warning: this.run?.stallWarning ? 'STALL_WARNING' : null,
    continuations: this.continuationOwner === key(this.selected()) ? this.continuations : 0 }; }
  restore(enabled, checkpoint = null) {
    this.closed = false; this.enabled = enabled === true;
    this.checkpoint = checkpoint && typeof checkpoint.key === 'string'
      && typeof checkpoint.turnId === 'string' && ['sending', 'sent'].includes(checkpoint.status)
      ? { key: checkpoint.key, turnId: checkpoint.turnId, status: checkpoint.status } : null;
    this.set(this.enabled ? 'waiting' : 'off', this.enabled ? 'Автовыполнение включено. Ждём разговор и план.' : '');
  }
  start() { this.closed = false; this.enabled = true; return this.reconcile(); }
  disable() {
    this.enabled = false; this.epoch++; this.clearTimer(); this.clearWatchdog(); this.run = null;
    this.set('off', 'Автовыполнение выключено пользователем.', false, 'MANUAL_OFF');
  }
  // Compatibility for explicit recovery; publish uses availabilityChanged instead.
  recover() { return this.reconcile(); }
  planChanged() { return this.reconcile(); }
  availabilityChanged() {
    const available = !!this.available();
    if (available === this.lastAvailability) return;
    this.lastAvailability = available;
    void this.reconcile();
  }
  set(phase, message, active = false, reason = null) {
    const next = { phase, message, active, reason };
    if (JSON.stringify(next) === JSON.stringify(this.state)) return;
    this.state = next;
    this.log('state', { phase, ...(reason ? { reason } : {}) }); this.onChange();
  }
  clearTimer() { if (this.timer !== null) this.cancel(this.timer); this.timer = null; }
  clearWatchdog() { if (this.watchdog !== null) this.cancel(this.watchdog); this.watchdog = null; }
  watch(run) {
    this.clearWatchdog();
    if (run.stallWarning) { run.stallWarning = false; this.log('progress-resumed', { reason: 'STALL_WARNING' }); }
    this.watchdog = this.schedule(() => {
      this.watchdog = null;
      if (this.run !== run || !this.enabled || !this.page?.busy) return;
      run.stallWarning = true;
      this.log('progress-timeout', { reason: 'STALL_WARNING' });
      this.set('running', 'Агент ещё работает. Давно не было новых данных; ждём завершения ответа.', true, 'STALL_WARNING');
    }, this.stallMs);
    this.watchdog?.unref?.();
  }
  wait(reason, message) {
    this.clearWatchdog();
    if (this.run) this.run.stallWarning = false;
    this.set('waiting', message, false, reason);
  }
  pause(message = 'Автовыполнение приостановлено.', reason = 'MANUAL_OFF') {
    this.clearTimer(); this.clearWatchdog();
    this.set('paused', message, false, reason);
  }
  complete() {
    this.clearTimer(); this.clearWatchdog();
    if (this.run) this.run.stallWarning = false;
    this.set('complete', 'Все пункты плана выполнены. Продолжение не отправляется.', false, 'PLAN_COMPLETED');
  }
  selectionChanged() {
    const selectedKey = key(this.selected());
    if (selectedKey === this.selectionKey) return;
    this.selectionKey = selectedKey; this.epoch++;
    this.clearTimer(); this.clearWatchdog(); this.run = null; this.manualWaiting = null;
    void this.reconcile();
  }
  observe(event) {
    const previous = this.page;
    if (event.reset) {
      this.page = null; this.epoch++; this.clearTimer(); this.clearWatchdog(); this.run = null;
      void this.reconcile(); return;
    }
    this.page = { ...event.state, documentId: event.documentId ?? previous?.documentId };
    this.selectionChanged();
    const p = this.page;
    if (previous?.documentId === p.documentId && (p.manualSendRevision ?? 0) > (previous.manualSendRevision ?? 0)) {
      this.manualWaiting = { key: key(this.selected()), documentId: p.documentId,
        turnId: previous.turnId, assistantRevision: previous.assistantRevision ?? 0 };
    }
    if (this.run && (this.run.key !== key(this.selected()) || this.run.documentId !== p.documentId)) {
      this.epoch++; this.clearWatchdog(); this.run = null;
    }
    if (p.busy) {
      this.clearTimer();
      if (this.run && (this.run.lastActivityRevision !== p.assistantRevision || !previous?.busy)) {
        this.run.lastActivityRevision = p.assistantRevision; this.watch(this.run);
      }
    } else if (this.enabled && previous?.busy && this.timer === null) {
      this.clearWatchdog();
      if (this.run) this.run.stallWarning = false;
      this.timer = this.schedule(() => { this.timer = null; void this.reconcile(); }, this.settleMs);
      this.timer?.unref?.();
    }
    void this.reconcile();
  }
  // One serialized event-driven pass. No interval and no scheduled Git reads.
  reconcile() {
    if (this.closed || !this.enabled) return Promise.resolve();
    this.rerunRequested = true;
    if (this.pending) return this.pending;
    const work = Promise.resolve().then(async () => {
      while (this.rerunRequested && this.enabled && !this.closed) {
        this.rerunRequested = false;
        await this.reconcileOnce();
      }
    });
    this.pending = work.finally(() => {
      this.pending = null;
      if (this.rerunRequested && this.enabled && !this.closed) void this.reconcile();
    });
    return this.pending;
  }
  async reconcileOnce() {
    this.selectionChanged();
    const selected = this.selected(), p = this.page, owner = key(selected), epoch = this.epoch;
    if (!selected?.chatUrl || selected.sessionArchivedAt || !p || p.url !== selected.chatUrl)
      return this.wait('PAGE_NOT_READY', 'Ждём выбранный разговор.');
    if (!this.available()) return this.wait('PAGE_NOT_READY', 'Ждём готовности страницы.');
    if (p.connectionError) return this.wait('CONNECTION_ERROR', 'Ждём восстановления связи с ChatGPT.');
    if (!this.run) this.run = { key: owner, documentId: p.documentId, lastActivityRevision: p.assistantRevision };
    const run = this.run;
    if (p.busy) {
      if (this.watchdog === null && !run.stallWarning) this.watch(run);
      return this.set('running', run.stallWarning ? 'Агент ещё работает. Давно не было новых данных; ждём завершения ответа.'
        : 'Автовыполнение включено. Агент работает.', true, run.stallWarning ? 'STALL_WARNING' : null);
    }
    if (this.timer !== null) return;
    if (!p.editorAvailable || !p.writable) return this.wait('PAGE_NOT_READY', 'Ждём готовности поля ввода.');
    if (p.draftPresent) return this.wait('DRAFT_PRESENT', 'Ждём вашего сообщения. Черновик сохранён.');
    if (this.manualWaiting?.key === owner && this.manualWaiting.documentId === p.documentId) {
      if (p.turnId === this.manualWaiting.turnId && (p.assistantRevision ?? 0) <= this.manualWaiting.assistantRevision)
        return this.wait('USER_MESSAGE_PENDING', 'Ваше сообщение отправлено. Ждём ответ.');
      this.manualWaiting = null;
    }
    if (!selected.scopeId) return this.wait('PLAN_UNAVAILABLE', 'Ждём незавершённый текущий план.');
    const currentContext = () => this.enabled && !this.closed && epoch === this.epoch && key(this.selected()) === owner
      && this.page?.documentId === p.documentId && this.page?.url === selected.chatUrl;
    const ready = () => currentContext() && !this.page.busy && !this.page.connectionError
      && this.page.editorAvailable && this.page.writable
      && (this.page.turnId ?? '') === (p.turnId ?? '')
      && (this.page.manualInputRevision ?? 0) === (p.manualInputRevision ?? 0)
      && (this.page.manualSendRevision ?? 0) === (p.manualSendRevision ?? 0)
      && (this.page.manualStopRevision ?? 0) === (p.manualStopRevision ?? 0);
    this.set('checking', 'Проверяем текущий план…', true);
    let plan;
    try { plan = await this.inspectPlan(selected); }
    catch { if (currentContext()) this.wait('PLAN_READ_ERROR', 'Ждём возможности прочитать план.'); return; }
    if (!ready() || !this.available() || this.page.draftPresent) return;
    if (!plan.confirmed) return this.wait('PLAN_CHANGED_OR_TRANSACTION', 'Ждём завершения Git-операции.');
    if (plan.scopeId !== selected.scopeId) return this.wait('PLAN_CHANGED_OR_TRANSACTION', 'Ждём актуальный текущий план.');
    if (finished(plan)) return this.complete();
    if (plan.scopeStatus !== 'ACTIVE' || !plan.planView?.tasks?.length)
      return this.wait('PLAN_UNAVAILABLE', 'Ждём незавершённый активный план.');
    run.completedAtStart ??= plan.planView.tasks.filter(t => t.status === 'done').map(t => t.id);
    // Keep the initial idle identity when plan revisions change before any reply.
    const pauseId = p.turnId || (this.checkpoint?.key === owner && this.checkpoint.turnId.startsWith('idle:')
      ? this.checkpoint.turnId : 'idle:' + plan.planRevision);
    if (this.checkpoint?.key === owner && this.checkpoint.turnId === pauseId)
      return this.set(this.checkpoint.status === 'sending' ? 'paused' : 'running',
        this.checkpoint.status === 'sending' ? 'Исход отправки для этой паузы неизвестен. Повтор не отправляется.'
          : '«Продолжай» уже отправлено. Ждём ответ.', this.checkpoint.status === 'sent',
        this.checkpoint.status === 'sending' ? 'SEND_UNKNOWN' : 'PAUSE_CONSUMED');
    if (this.continuationOwner !== owner) { this.continuationOwner = owner; this.continuations = 0; }
    const previousCheckpoint = this.checkpoint, checkpoint = { key: owner, turnId: pauseId, status: 'sending' };
    this.set('sending', 'Отправляем «Продолжай»…', true);
    try {
      await this.saveCheckpoint(checkpoint); this.checkpoint = checkpoint;
      let result = { state: 'cancelled' };
      if (ready() && this.available() && !this.page.draftPresent) result = await this.send(CONTINUE_TEXT, ready, async () => {
        const latest = await this.inspectPlan(selected);
        if (!ready()) return false;
        if (!latest.confirmed || latest.scopeId !== selected.scopeId || latest.scopeStatus !== 'ACTIVE') {
          this.wait('PLAN_CHANGED_OR_TRANSACTION', 'Ждём актуальный подтверждённый план.'); return false;
        }
        if (finished(latest)) { this.complete(); return false; }
        return !!latest.planView?.tasks?.length;
      });
      if (result.state === 'sent') {
        this.checkpoint = { ...checkpoint, status: 'sent' }; await this.saveCheckpoint(this.checkpoint);
        if (key(this.selected()) === owner) { this.continuations++; this.log('send', { kind: 'continue', continuations: this.continuations }); }
        if (currentContext()) this.set('running', 'Автоматически отправлено «Продолжай». Ждём ответ.', true);
      } else if (result.state === 'unknown') {
        if (currentContext()) this.pause('Исход отправки неизвестен. Для этой паузы повтор не отправляется.', 'SEND_UNKNOWN');
      } else {
        await this.saveCheckpoint(previousCheckpoint); this.checkpoint = previousCheckpoint;
        if (currentContext() && this.state.phase === 'sending') this.wait(
          result.reason === 'DRAFT_PRESENT' ? 'DRAFT_PRESENT' : 'SEND_NOT_SENT',
          result.reason === 'DRAFT_PRESENT' ? 'Ждём вашего сообщения. Черновик сохранён.' : 'Продолжение не отправлено. Ждём следующего события.');
      }
    } catch { if (currentContext()) this.wait('SEND_ERROR', 'Ошибка отправки. Ждём следующего события; неизвестный Send не повторяется.'); }
  }
  dispose() {
    this.closed = true; this.epoch++; this.clearTimer(); this.clearWatchdog(); this.run = null;
    this.rerunRequested = false;
  }
}
