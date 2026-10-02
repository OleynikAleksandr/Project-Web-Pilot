export const CONTINUE_TEXT = 'Продолжай';
const AUTO_PLAN_INSTRUCTION = [
  'Включён режим автовыполнения текущего плана Web Pilot.',
  'Сначала прочитай фактическое состояние текущего плана: выполненные задачи не повторяй, продолжай незавершённую.',
  'За один ответ выполняй не более одной микрозадачи с её проверкой и коммитом. Затем обязательно закончи ответ.',
  'После окончания ответа Web Pilot автоматически отправит «Продолжай», если план не завершён и пользователь не требуется. Не жди ручного «Продолжай» при возможности самостоятельной работы.',
  'Если работа затягивается, сохрани промежуточный результат и закончи ответ на безопасной контрольной точке; незавершённую задачу не помечай DONE.',
  'Длительные команды запускай через доступный MCP в фоне, сохраняя идентификатор процесса. После продолжения сначала проверь его результат, не запускай ту же операцию повторно.',
  'Задавай вопрос и приостанавливай самостоятельную работу только когда без информации, выбора или решения пользователя корректно продолжать невозможно. В этом случае дождись его ответа.',
  'Техническая ошибка, упавший тест, проблема сборки, Git/MCP или совместимости сами по себе не требуют ответа пользователя. Если можешь исследовать или исправить ситуацию самостоятельно, продолжай диагностику; при окончании ответа сохраняй возможность автоматического продолжения.',
  'В конце ответа отдельной последней строкой пиши «Готов продолжать.», если можешь работать дальше, включая самостоятельную диагностику, исправление ошибки или проверку фонового процесса; «Нужен ваш ответ.», только когда без информации, выбора или решения пользователя корректно продолжать невозможно; «План завершён.», только когда все пункты, включая DOCS, действительно завершены.',
  'После полного завершения не архивируй план без отдельного поручения. Следующее сообщение «Продолжай» означает продолжение фактической незавершённой работы, а не обязательный переход к следующей задаче.',
  'Не запускай codex exec, других модельных агентов и не делегируй им работу, если пользователь прямо этого не попросил.',
].join('\n');
const key = p => p && JSON.stringify([p.workspace, p.sessionId, p.scopeId, p.chatUrl]);
const finished = p => p?.planView?.tasks?.length > 0 && p.planView.tasks.every(t => t.status === 'done');
export class AutoPlan {
  constructor({ selected, inspectPlan, send, onChange = () => {}, log = () => {},
    schedule = setTimeout, cancel = clearTimeout, settleMs = 500, stallMs = 180000 }) {
    Object.assign(this, { selected, inspectPlan, send, onChange, log, schedule, cancel, settleMs, stallMs });
    this.page = null; this.run = null; this.epoch = 0; this.timer = null; this.watchdog = null;
    this.state = { phase: 'off', message: '', active: false };
  }
  view() { return { ...this.state, enabled: this.state.active || !!this.suspended,
    warning: this.run?.stallWarning ? 'STALL_WARNING' : null }; }
  set(phase, message, active = false) {
    this.state = { phase, message, active };
    this.log('state', { phase }); this.onChange();
  }
  clearTimer() { if (this.timer !== null) this.cancel(this.timer); this.timer = null; }
  clearWatchdog() { if (this.watchdog !== null) this.cancel(this.watchdog); this.watchdog = null; }
  watch(run) {
    this.clearWatchdog();
    if (run.stallWarning) {
      run.stallWarning = false;
      this.log('progress-resumed', { reason: 'STALL_WARNING' });
      this.set(this.state.phase, 'Автовыполнение: ждём контрольную точку агента.', this.state.active);
    }
    this.watchdog = this.schedule(() => {
      this.watchdog = null;
      if (this.run !== run) return;
      const busy = !!this.page?.busy;
      this.log('progress-timeout', { busy, assistantRevision: this.page?.assistantRevision ?? 0,
        reason: busy ? 'STALL_WARNING' : 'NO_CHECKPOINT' });
      if (busy) {
        run.stallWarning = true;
        this.set(this.state.phase, 'Три минуты без новых наблюдаемых данных. Агент ещё работает; ждём завершения ответа.', this.state.active);
        return;
      }
      this.pause('Три минуты без новых наблюдаемых данных. Проверьте ответ или восстановите разговор; повторной отправки не было.');
    }, this.stallMs);
    this.watchdog?.unref?.();
  }
  pause(message = 'Автовыполнение приостановлено.', resumeOnMessage = false) {
    const previous = this.run ?? this.suspended?.run;
    this.suspended = resumeOnMessage && previous ? { run: previous, sendRevision: this.page?.manualSendRevision ?? 0 } : null;
    this.epoch++; this.clearTimer(); this.clearWatchdog(); this.run = null;
    this.set('paused', message);
  }
  complete() {
    this.suspended = null;
    this.epoch++; this.clearTimer(); this.clearWatchdog(); this.run = null;
    this.set('complete', 'Все пункты плана выполнены. Продолжение не отправляется.');
  }
  selectionChanged() {
    if ((this.run ?? this.suspended?.run) && key(this.selected()) !== (this.run ?? this.suspended.run).key) this.pause('Выбран другой разговор или план.');
  }
  observe(event) {
    if (event.reset) { this.page = null; if (this.run || this.suspended) this.pause('Страница загружается заново. Проверьте разговор и включите автовыполнение.'); return; }
    this.page = { ...event.state, documentId: event.documentId ?? this.page?.documentId };
    this.selectionChanged();
    if (this.suspended) {
      const waiting = this.suspended, p = this.page;
      if (p.documentId !== waiting.run.documentId || p.url !== waiting.run.url || p.connectionError)
        return this.pause('Изменился документ или состояние связи.');
      if ((p.manualSendRevision ?? 0) > waiting.sendRevision) void this.resumeAfterMessage(waiting);
      return;
    }
    const run = this.run;
    if (!run) return;
    this.selectionChanged(); if (this.run !== run) return;
    const p = this.page;
    if (p.documentId !== run.documentId || p.url !== run.url) return this.pause('Изменился документ разговора.');
    if ((p.manualStopRevision ?? 0) !== run.stopRevision) return this.pause('Вы остановили ответ. Новое сообщение возобновит автовыполнение.', true);
    if ((p.manualInputRevision ?? 0) !== run.inputRevision) return this.pause('Ждём отправки вашего сообщения для продолжения.', true);
    if (p.connectionError) return this.pause('Связь с ChatGPT прервалась. Восстановите разговор перед продолжением.');
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
    if (this.state.active) return;
    this.suspended = null;
    const selected = this.selected(), page = this.page;
    if (!selected?.chatUrl || !selected.scopeId || !page || page.url !== selected.chatUrl
        || page.busy || !page.editorAvailable)
      return this.set('paused', 'Откройте сохранённый разговор и дождитесь завершения ответа.');
    const epoch = ++this.epoch;
    this.set('checking', 'Проверяем текущий план…', true);
    let plan;
    try { plan = await this.inspectPlan(selected); }
    catch { if (epoch === this.epoch) this.pause('Не удалось проверить план.'); return; }
    if (epoch !== this.epoch) return;
    if (key(this.selected()) !== key(selected)) return this.pause('Изменился выбранный разговор.');
    if (!plan.confirmed) return this.pause('В плане есть незавершённая Git-операция. Завершите её перед запуском.');
    if (finished(plan)) return this.complete();
    if (plan.scopeId !== selected.scopeId || plan.scopeStatus !== 'ACTIVE' || !plan.planView?.tasks?.length)
      return this.pause('Нет доступного незавершённого плана.');
    this.run = { key: key(selected), selected: { ...selected }, url: page.url, documentId: page.documentId,
      stopRevision: page.manualStopRevision ?? 0, inputRevision: page.manualInputRevision ?? 0,
      sawBusy: false, beforeAssistantRevision: page.assistantRevision ?? 0,
      planRevision: plan.planRevision, unchanged: 0,
      completedAtStart: plan.planView.tasks.filter(t => t.status === 'done').map(t => t.id) };
    this.log('start', { completed: this.run.completedAtStart.length, total: plan.planView.tasks.length });
    await this.dispatch(this.run, AUTO_PLAN_INSTRUCTION);
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
      if (!plan.confirmed || plan.scopeId !== run.selected.scopeId) return this.pause('Проверьте текущий план и Git-операцию.');
      if (finished(plan)) return this.complete();
      if (plan.scopeStatus !== 'ACTIVE') return this.pause('План приостановлен.');
      run.planRevision = plan.planRevision;
      this.log('resume', { reason: 'user-message' });
      this.set('running', 'Автовыполнение возобновлено вашим сообщением.', true);
      this.watch(run);
      this.observe({ state: this.page, documentId: this.page.documentId });
    } catch { if (this.run === run) this.pause('Не удалось проверить план после вашего сообщения.'); }
  }
  async finishTurn(run) {
    if (this.run !== run || this.page?.busy) return;
    run.sawBusy = false;
    this.set('checking', 'Ответ завершён. Проверяем план…', true);
    try {
      const plan = await this.inspectPlan(run.selected);
      if (this.run !== run) return;
      this.selectionChanged(); if (this.run !== run) return;
      if (plan.scopeId !== run.selected.scopeId) return this.pause('Текущий план изменился.');
      if (!plan.confirmed) return this.pause('Git-операция ещё не завершена. Проверьте её результат.');
      if (finished(plan)) return this.complete();
      if (plan.scopeStatus !== 'ACTIVE') return this.pause('План приостановлен.');
      if (this.page?.turnSignal === 'wait') return this.pause('Агент ждёт вашего ответа. Отправьте сообщение для продолжения.', true);
      if (!['continue', 'done'].includes(this.page?.turnSignal))
        return this.pause('Ответ закончился без контрольной точки. Проверьте сообщение агента.');
      run.unchanged = plan.planRevision === run.planRevision ? run.unchanged + 1 : 0;
      run.planRevision = plan.planRevision;
      if (run.unchanged >= 3) return this.pause('Три ответа без изменения плана. Проверьте ход работы.');
      await this.dispatch(run, CONTINUE_TEXT);
    } catch {
      if (this.run === run) this.pause('Не удалось проверить план или отправить продолжение. Повтора Send не будет.');
    }
  }
  async dispatch(run, text) {
    if (this.run !== run) return;
    run.beforeAssistantRevision = this.page?.assistantRevision ?? 0;
    run.sawBusy = false;
    this.set('sending', text === CONTINUE_TEXT ? 'Отправляем «Продолжай»…' : 'Запускаем автовыполнение…', true);
    const current = () => this.run === run && key(this.selected()) === run.key
      && this.page?.documentId === run.documentId && this.page?.url === run.url
      && (this.page?.manualStopRevision ?? 0) === run.stopRevision
      && (this.page?.manualInputRevision ?? 0) === run.inputRevision;
    try {
      const result = await this.send(text, current, async () => {
        const plan = await this.inspectPlan(run.selected);
        if (!current()) return false;
        if (!plan.confirmed || plan.scopeId !== run.selected.scopeId || plan.scopeStatus !== 'ACTIVE') {
          this.pause('План изменился или выполняется Git-операция.'); return false;
        }
        if (finished(plan)) { this.complete(); return false; }
        return true;
      });
      if (this.run !== run) return;
      if (result.state !== 'sent') return this.pause('Сообщение не отправлено либо результат неизвестен. Проверьте поле ввода и разговор.');
      this.log('send', { kind: text === CONTINUE_TEXT ? 'continue' : 'start' });
      this.set('running', 'Автовыполнение: ждём контрольную точку агента.', true);
      this.watch(run);
      if (this.page) this.observe({ state: this.page, documentId: this.page.documentId });
    } catch {
      if (this.run === run) this.pause('Ошибка отправки. Автоматический повтор отключён.');
    }
  }
  dispose() { this.suspended = null; this.epoch++; this.clearTimer(); this.clearWatchdog(); this.run = null; }
}
