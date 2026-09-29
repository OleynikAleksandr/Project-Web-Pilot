export const CONTINUE_TEXT = 'Продолжай';
export const AUTO_PLAN_INSTRUCTION = [
  'Включён режим автовыполнения текущего плана Web Pilot.',
  'Сначала прочитай фактическое состояние текущего плана: выполненные задачи не повторяй, продолжай незавершённую.',
  'За один ответ выполняй не более одной микрозадачи с её проверкой и коммитом. Затем обязательно закончи ответ.',
  'Если работа затягивается, сохрани промежуточный результат и закончи ответ на безопасной контрольной точке; незавершённую задачу не помечай DONE.',
  'Длительные команды запускай через доступный MCP в фоне, сохраняя идентификатор процесса. После продолжения сначала проверь его результат, не запускай ту же операцию повторно.',
  'В конце ответа отдельной последней строкой пиши «Готов продолжать.», если можешь работать дальше; «Нужен ваш ответ.», если есть вопрос, ошибка или требуется решение пользователя; «План завершён.», только когда все пункты, включая DOCS, действительно завершены.',
  'После полного завершения не архивируй план без отдельного поручения. Следующее сообщение «Продолжай» означает продолжение фактической незавершённой работы, а не обязательный переход к следующей задаче.',
  'Не запускай codex exec, других модельных агентов и не делегируй им работу, если пользователь прямо этого не попросил.',
].join('\n');
const key = p => p && JSON.stringify([p.workspace, p.sessionId, p.scopeId, p.chatUrl]);
const finished = p => p?.planView?.tasks?.length > 0 && p.planView.tasks.every(t => t.status === 'done');
export class AutoPlan {
  constructor({ selected, inspectPlan, send, onChange = () => {}, log = () => {},
    schedule = setTimeout, cancel = clearTimeout, settleMs = 500 }) {
    Object.assign(this, { selected, inspectPlan, send, onChange, log, schedule, cancel, settleMs });
    this.page = null; this.run = null; this.epoch = 0; this.timer = null;
    this.state = { phase: 'off', message: '', active: false };
  }
  view() { return { ...this.state }; }
  set(phase, message, active = false) {
    this.state = { phase, message, active };
    this.log('state', { phase }); this.onChange();
  }
  clearTimer() { if (this.timer !== null) this.cancel(this.timer); this.timer = null; }
  pause(message = 'Автовыполнение приостановлено.') {
    this.epoch++; this.clearTimer(); this.run = null;
    this.set('paused', message);
  }
  complete() {
    this.epoch++; this.clearTimer(); this.run = null;
    this.set('complete', 'Все пункты плана выполнены. Продолжение не отправляется.');
  }
  selectionChanged() {
    if (this.run && key(this.selected()) !== this.run.key) this.pause('Выбран другой разговор или план.');
  }
  observe(event) {
    if (event.reset) { this.page = null; if (this.run) this.pause('Страница загружается заново. Проверьте разговор и включите автовыполнение.'); return; }
    this.page = { ...event.state, documentId: event.documentId ?? this.page?.documentId };
    const run = this.run;
    if (!run) return;
    this.selectionChanged(); if (this.run !== run) return;
    const p = this.page;
    if (p.documentId !== run.documentId || p.url !== run.url) return this.pause('Изменился документ разговора.');
    if ((p.manualStopRevision ?? 0) !== run.stopRevision) return this.pause('Вы остановили ответ. Автовыполнение приостановлено.');
    if ((p.manualInputRevision ?? 0) !== run.inputRevision) return this.pause('Вы начали ввод. Автовыполнение приостановлено.');
    if (p.connectionError) return this.pause('Связь с ChatGPT прервалась. Восстановите разговор перед продолжением.');
    if (p.busy) { run.sawBusy = true; this.clearTimer(); return; }
    if (this.state.phase === 'sending' || !run.sawBusy) return;
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
      if (this.page?.turnSignal === 'wait') return this.pause('Агент ожидает вашего ответа или сообщил об ошибке.');
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
      if (this.page) this.observe({ state: this.page, documentId: this.page.documentId });
    } catch {
      if (this.run === run) this.pause('Ошибка отправки. Автоматический повтор отключён.');
    }
  }
  dispose() { this.epoch++; this.clearTimer(); this.run = null; }
}
