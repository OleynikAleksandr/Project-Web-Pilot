export const CONTINUE_TEXT = 'Продолжай';
const key = p => p && JSON.stringify([p.workspace, p.sessionId, p.scopeId, p.chatUrl]);
const conversationKey = p => p && JSON.stringify([p.workspace, p.sessionId, p.chatUrl]);
const finished = p => p?.planView?.tasks?.length > 0 && p.planView.tasks.every(t => t.status === 'done');

export class AutoPlan {
  constructor({ selected, inspectPlan, send, onChange = () => {}, log = () => {},
    schedule = setTimeout, cancel = clearTimeout, settleMs = 500, stallMs = 180000,
    available = () => true, saveCheckpoint = async () => {} }) {
    Object.assign(this, { selected, inspectPlan, send, onChange, log, schedule, cancel, settleMs, stallMs, available, saveCheckpoint });
    this.page = null; this.run = null; this.epoch = 0; this.timer = null; this.watchdog = null;
    this.state = { phase: 'off', message: '', active: false, reason: null };
    this.continuations = 0; this.continuationOwner = null;
    this.enabled = false; this.checkpoints = new Map(); this.closed = false;
    this.pending = null; this.rerunRequested = false; this.lastAvailability = false;
    this.selectionKey = key(this.selected()); this.manualWaiting = null;
  }
  view() { return { ...this.state, enabled: this.enabled,
    warning: this.run?.stallWarning ? 'STALL_WARNING' : null,
    continuations: this.continuationOwner === key(this.selected()) ? this.continuations : 0 }; }
  get checkpoint() { return [...this.checkpoints.values()].findLast(entry => entry.key === key(this.selected())) ?? null; }
  checkpointState() { return this.checkpoints.size ? { version: 2, entries: [...this.checkpoints.values()] } : null; }
  async writeCheckpoint(owner, checkpoint, replacingTurnId = checkpoint?.turnId) {
    const next = new Map(this.checkpoints);
    next.delete(JSON.stringify([owner, replacingTurnId]));
    if (checkpoint) next.set(JSON.stringify([owner, checkpoint.turnId]), checkpoint);
    await this.saveCheckpoint(next.size ? { version: 2, entries: [...next.values()] } : null);
    this.checkpoints = next;
  }
  restore(enabled, checkpoint = null) {
    this.epoch++; this.clearTimer(); this.clearWatchdog(); this.run = null; this.manualWaiting = null;
    this.closed = false; this.enabled = enabled === true; this.checkpoints = new Map();
    const entries = checkpoint?.version === 2 && Array.isArray(checkpoint.entries) ? checkpoint.entries : [checkpoint];
    for (const entry of entries) {
      if (entry && typeof entry.key === 'string' && typeof entry.turnId === 'string'
          && ['sending', 'sent'].includes(entry.status))
        this.checkpoints.set(JSON.stringify([entry.key, entry.turnId]), { key: entry.key, turnId: entry.turnId, status: entry.status });
    }
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
    this.clearTimer(); this.clearWatchdog(); this.run = null;
    if (this.manualWaiting?.key !== conversationKey(this.selected())) this.manualWaiting = null;
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
      this.manualWaiting = { key: conversationKey(this.selected()), turnId: previous.turnId ?? '' };
    }
    if (this.run && (this.run.key !== key(this.selected()) || this.run.documentId !== p.documentId)) {
      this.epoch++; this.clearWatchdog(); this.run = null;
    }
    if (p.busy) {
      this.clearTimer();
      if (this.run && (this.run.lastActivityRevision !== p.assistantRevision || !previous?.busy)) {
        this.run.lastActivityRevision = p.assistantRevision; this.watch(this.run);
      }
    } else if (this.enabled && previous && (previous.busy || previous.turnId !== p.turnId) && this.timer === null) {
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
    if (p.lastMessageRole === 'user')
      return this.wait('USER_MESSAGE_PENDING', 'Ваше сообщение отправлено. Ждём ответ.');
    if (this.manualWaiting?.key === conversationKey(selected)) {
      if ((p.turnId ?? '') === this.manualWaiting.turnId)
        return this.wait('USER_MESSAGE_PENDING', 'Ваше сообщение отправлено. Ждём ответ.');
      this.manualWaiting = null;
    }
    if (!selected.scopeId) return this.wait('PLAN_UNAVAILABLE', 'Ждём незавершённый текущий план.');
    const currentContext = () => this.enabled && !this.closed && epoch === this.epoch && key(this.selected()) === owner
      && this.page?.documentId === p.documentId && this.page?.url === selected.chatUrl;
    const ready = () => currentContext() && !this.page.busy && !this.page.connectionError
      && this.page.editorAvailable && this.page.writable && this.page.lastMessageRole !== 'user'
      && (this.page.turnId ?? '') === (p.turnId ?? '')
      && (this.page.userTurnId ?? '') === (p.userTurnId ?? '')
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
    // No reply text participates in identity. The synthetic initial pause stays
    // consumed across plan revisions until a genuinely new user/assistant turn.
    const previousCheckpoint = this.checkpoint;
    const syntheticSuffix = ':' + (p.userTurnId || 'empty');
    const initial = [...this.checkpoints.values()].findLast(entry => entry.key === owner
      && entry.turnId.startsWith('idle:') && entry.turnId.endsWith(syntheticSuffix));
    const pauseId = p.turnId || initial?.turnId || 'idle:' + plan.planRevision + syntheticSuffix;
    const consumed = this.checkpoints.get(JSON.stringify([owner, pauseId]));
    if (consumed)
      return this.set(consumed.status === 'sending' ? 'paused' : 'running',
        consumed.status === 'sending' ? 'Исход отправки для этой паузы неизвестен. Повтор не отправляется.'
          : '«Продолжай» уже отправлено. Ждём ответ.', consumed.status === 'sent',
        consumed.status === 'sending' ? 'SEND_UNKNOWN' : 'PAUSE_CONSUMED');
    if (this.continuationOwner !== owner) { this.continuationOwner = owner; this.continuations = 0; }
    const checkpoint = { key: owner, turnId: pauseId, status: 'sending' };
    this.set('sending', 'Отправляем «Продолжай»…', true);
    let sendInvoked = false, delivered = false, knownUnsent = false;
    try {
      await this.writeCheckpoint(owner, checkpoint);
      let result = { state: 'cancelled' };
      if (ready() && this.available() && !this.page.draftPresent) {
        sendInvoked = true;
        result = await this.send(CONTINUE_TEXT, ready, async () => {
          const latest = await this.inspectPlan(selected);
          if (!ready()) return false;
          if (!latest.confirmed || latest.scopeId !== selected.scopeId || latest.scopeStatus !== 'ACTIVE') {
            this.wait('PLAN_CHANGED_OR_TRANSACTION', 'Ждём актуальный подтверждённый план.'); return false;
          }
          if (finished(latest)) { this.complete(); return false; }
          return !!latest.planView?.tasks?.length;
        });
      }
      if (result.state === 'sent') {
        delivered = true;
        if (key(this.selected()) === owner) { this.continuations++; this.log('send', { kind: 'continue', continuations: this.continuations }); }
        await this.writeCheckpoint(owner, { ...checkpoint, status: 'sent' });
        if (currentContext()) this.set('running', 'Автоматически отправлено «Продолжай». Ждём ответ.', true);
      } else if (result.state === 'unknown') {
        if (currentContext()) this.pause('Исход отправки неизвестен. Для этой паузы повтор не отправляется.', 'SEND_UNKNOWN');
      } else {
        knownUnsent = true;
        await this.writeCheckpoint(owner, previousCheckpoint, checkpoint.turnId);
        if (currentContext() && this.state.phase === 'sending') this.wait(
          result.reason === 'DRAFT_PRESENT' ? 'DRAFT_PRESENT' : 'SEND_NOT_SENT',
          result.reason === 'DRAFT_PRESENT' ? 'Ждём вашего сообщения. Черновик сохранён.' : 'Продолжение не отправлено. Ждём следующего события.');
      }
    } catch {
      if (delivered) this.checkpoints.set(JSON.stringify([owner, pauseId]), { ...checkpoint, status: 'sent' });
      else if (!sendInvoked || knownUnsent) this.checkpoints.delete(JSON.stringify([owner, pauseId]));
      if (currentContext()) this.wait(delivered ? 'SEND_CHECKPOINT_ERROR' : 'SEND_ERROR',
        delivered ? '«Продолжай» отправлено. Не удалось сохранить подтверждение; повтор для этой паузы исключён.'
          : 'Ошибка отправки. Ждём следующего события; неизвестный Send не повторяется.');
    }
  }
  dispose() {
    this.closed = true; this.epoch++; this.clearTimer(); this.clearWatchdog(); this.run = null;
    this.rerunRequested = false;
  }
}
