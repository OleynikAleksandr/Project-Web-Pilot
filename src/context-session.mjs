import { randomUUID } from 'node:crypto';
import { normalizeChatUrl } from './workspace-session.mjs';

export function startupMessage(project, requestId) {
  return [
    'Восстанови контекст проекта через подключённый Codex Local Mac.',
    `Workspace (точная абсолютная папка, JSON-строка): ${JSON.stringify(project.workspace)}`,
    `Session ID для этого чата: ${project.sessionId}`,
    `Идентификатор отправки оболочки: ${requestId}`,
    'Задача: прочитать актуальное состояние этого проекта и сообщить его. Файлы не менять.',
    'Следуй действующим инструкциям MCP. Установи выбранную папку через bridge_status(repository=workspace).',
    'Получи полный пакет workflow_context_recover(workspace, session_id, source="agent_request") и прочитай весь context.',
    'Подтверди его через workflow_context_ack с probe_id/challenge из полученного пакета и точным объектом facts, включая null, в readback.',
    'После успешного ACK сразу сообщи возвращённое user_message по-русски. Если нужного инструмента нет — сообщи это явно.',
    'Это обычное стартовое сообщение Project Web Pilot. Оно не доказывает запуск внутреннего SessionStart или автоматического compact ChatGPT.',
  ].join('\n');
}

export function receiptMatch(status, project, attempt, nowMs = Date.now()) {
  if (!attempt?.sendStartedAtMs || status?.workspace !== project.workspace || status.session_id !== project.sessionId) return { kind: 'waiting' };
  const probe = status.latest;
  const receipt = status.last_receipt;
  if (!probe || !receipt || probe.acknowledged !== true || receipt.probe_id !== probe.probe_id
      || receipt.workspace !== project.workspace || probe.workspace !== project.workspace || probe.session_id !== project.sessionId
      || probe.source !== 'agent_request' || receipt.source !== 'agent_request'
      || !['acknowledged', 'already_acknowledged'].includes(receipt.status)) return { kind: 'waiting' };
  if (attempt.excludedProbeIds.includes(probe.probe_id)
      || !Number.isFinite(probe.issued_at) || probe.issued_at * 1000 < attempt.sendStartedAtMs - 250
      || probe.issued_at * 1000 > nowMs + 1000) return { kind: 'waiting' };
  if (attempt.ackProbeId && attempt.ackProbeId !== probe.probe_id) return { kind: 'superseded' };
  const facts = receipt.facts;
  if (!facts || !probe.facts || Object.keys(facts).length !== Object.keys(probe.facts).length
      || Object.keys(facts).some(key => facts[key] !== probe.facts[key])
      || !Number.isFinite(probe.acknowledged_at) || probe.acknowledged_at < probe.issued_at) return { kind: 'waiting' };
  const expected = { project_id: project.projectId, project_name: project.name, plan_revision: project.planRevision,
    scope_id: project.scopeId, execution_scope_status: project.scopeStatus, delivery_status: project.deliveryStatus,
    task_id: project.nextTaskId, task_title: project.nextTaskTitle };
  if (Object.keys(expected).some(key => facts[key] !== expected[key]) || nowMs - probe.issued_at * 1000 > 3600000) {
    return { kind: 'stale', receipt: { probeId: probe.probe_id, facts, acknowledgedAtMs: probe.acknowledged_at * 1000 } };
  }
  return { kind: 'confirmed', receipt: { probeId: probe.probe_id, facts, acknowledgedAtMs: probe.acknowledged_at * 1000,
    issuedAtMs: probe.issued_at * 1000, userMessage: receipt.user_message } };
}

const phaseForReason = reason => ({ LOGIN_REQUIRED: 'waiting-login', GENERATION_ACTIVE: 'waiting-generation',
  DRAFT_PRESENT: 'waiting-draft', DRAFT_CHANGED: 'waiting-draft', SEND_UNAVAILABLE: 'waiting-composer',
  INSERT_FAILED: 'waiting-composer' })[reason] ?? 'waiting-composer';

export class ContextSession {
  constructor({ store, runtime, composer, onChange = () => {}, now = Date.now, uuid = randomUUID }) {
    Object.assign(this, { store, runtime, composer, onChange, now, uuid });
    this.generation = 0;
    this.active = null;
    this.pending = false;
    this.servicesReady = false;
    this.state = { phase: 'selected', servicesReady: false, messageSent: false };
  }

  attach(project) {
    this.generation++;
    this.active = { workspace: project.workspace, sessionId: project.sessionId };
    this.servicesReady = false;
    this.emit({ phase: 'selected', messageSent: ['sent', 'acknowledged'].includes(project.attempt?.state), receipt: null, error: null, projectInfo: null });
  }

  cancel() {
    this.generation++; this.active = null; this.servicesReady = false;
    this.emit({ phase: 'selected', messageSent: false, receipt: null, error: null, projectInfo: null });
  }

  emit(patch) {
    this.state = { ...this.state, ...patch, servicesReady: this.servicesReady };
    this.onChange(structuredClone(this.state));
  }

  current(generation) {
    if (generation !== this.generation || !this.active) return false;
    const selected = this.store.selected();
    return selected?.workspace === this.active.workspace && selected.sessionId === this.active.sessionId;
  }

  async retry() {
    if (!this.active || this.pending) return;
    const project = this.store.project(this.active.workspace);
    // Unknown/sent attempts are observed again; only an already acknowledged attempt can be replaced.
    if (project?.attempt?.state === 'acknowledged') {
      await this.store.updateSession(project.workspace, project.sessionId, { attempt: null, receipt: null });
    }
    this.servicesReady = false;
    this.emit({ phase: 'selected', error: null, receipt: null });
    return this.tick();
  }

  async tick() {
    if (!this.active || this.pending || this.state.phase === 'error') return;
    const generation = this.generation;
    this.pending = true;
    let project;
    try {
      project = this.store.project(this.active.workspace);
      if (!project || !this.current(generation)) return;
      const info = await this.store.inspect(project.workspace);
      if (!this.current(generation)) return;
      if (info.projectId !== project.projectId) throw Object.assign(new Error('В этой папке теперь другой проект. Связь с прежним чатом сохранена.'), { code: 'PROJECT_REPLACED' });
      project = { ...project, ...info };
      if (!this.servicesReady) {
        this.emit({ phase: 'preparing', projectInfo: info });
        await this.runtime.ensure();
        if (!this.current(generation)) return;
        this.servicesReady = true;
      }
      let attempt = project.attempt;
      const observation = await this.composer.inspect({ requestId: attempt?.requestId, text: attempt?.text });
      if (!this.current(generation)) return;
      if (observation.login) { this.emit({ phase: 'waiting-login', projectInfo: info }); return; }
      const currentUrl = normalizeChatUrl(observation.url);
      if (project.chatUrl && currentUrl !== project.chatUrl) {
        this.emit({ phase: 'chat-changed', projectInfo: info }); return;
      }
      if (!project.chatUrl && currentUrl) {
        if (!attempt?.sendStartedAtMs || !observation.messageSeen) {
          this.emit({ phase: 'chat-changed', projectInfo: info }); return;
        }
        project = { ...await this.store.bindChat(project.workspace, project.sessionId, currentUrl), ...info };
        if (!this.current(generation)) return;
      }
      const status = await this.runtime.contextStatus(project.workspace, project.sessionId);
      if (!this.current(generation)) return;
      if (attempt && ['sending', 'unknown', 'sent', 'acknowledged'].includes(attempt.state)) {
        const matched = receiptMatch(status, project, attempt, this.now());
        const messageSent = observation.messageSeen || ['sent', 'acknowledged'].includes(attempt.state);
        if (messageSent && project.chatUrl && matched.kind === 'confirmed') {
          if (attempt.state !== 'acknowledged' || attempt.ackProbeId !== matched.receipt.probeId) {
            attempt = { ...attempt, state: 'acknowledged', ackProbeId: matched.receipt.probeId };
            await this.store.updateSession(project.workspace, project.sessionId, { attempt, receipt: matched.receipt });
          }
          if (this.current(generation)) this.emit({ phase: 'confirmed', projectInfo: info, messageSent: true, receipt: matched.receipt, error: null });
          return;
        }
        if (matched.kind === 'stale' || matched.kind === 'superseded') {
          // A valid but outdated ACK completes the old send; an explicit refresh may start a new request.
          if (matched.receipt && messageSent && project.chatUrl && attempt.state !== 'acknowledged') {
            attempt = { ...attempt, state: 'acknowledged', ackProbeId: matched.receipt.probeId };
            await this.store.updateSession(project.workspace, project.sessionId, { attempt, receipt: matched.receipt });
            if (!this.current(generation)) return;
          }
          this.emit({ phase: 'stale', projectInfo: info, messageSent, receipt: matched.receipt ?? project.receipt }); return;
        }
        if (messageSent) {
          if (attempt.state === 'sending' || attempt.state === 'unknown') {
            attempt = { ...attempt, state: 'sent' };
            await this.store.updateSession(project.workspace, project.sessionId, { attempt });
          }
          if (this.current(generation)) this.emit({ phase: this.now() - attempt.sendStartedAtMs > 180000 ? 'ack-timeout' : 'waiting-ack',
            projectInfo: info, messageSent: true });
        } else this.emit({ phase: 'send-unknown', projectInfo: info, messageSent: false });
        return;
      }
      if (!observation.editorAvailable || !observation.writable) { this.emit({ phase: 'waiting-composer', projectInfo: info }); return; }
      if (observation.busy) { this.emit({ phase: 'waiting-generation', projectInfo: info }); return; }
      if (observation.draftLength && !observation.draftMatches) { this.emit({ phase: 'waiting-draft', projectInfo: info }); return; }
      if (!attempt) {
        const requestId = 'wp-request-' + this.uuid();
        attempt = { requestId, text: startupMessage(project, requestId), createdAtMs: this.now(),
          excludedProbeIds: [status.latest?.probe_id, status.last_receipt?.probe_id].filter(Boolean),
          sendStartedAtMs: null, state: 'prepared' };
        await this.store.updateSession(project.workspace, project.sessionId, { attempt, receipt: null });
        if (!this.current(generation)) return;
      }
      const result = await this.composer.deliver({ text: attempt.text, requestId: attempt.requestId,
        canContinue: () => this.current(generation), onBeforeSend: async () => {
          attempt = { ...attempt, state: 'sending', sendStartedAtMs: this.now() };
          await this.store.updateSession(project.workspace, project.sessionId, { attempt });
          if (this.current(generation)) this.emit({ phase: 'sending', projectInfo: info, messageSent: false });
        } });
      if (!this.current(generation)) return;
      if (result.state === 'sent') {
        attempt = { ...attempt, state: 'sent', sendStartedAtMs: attempt.sendStartedAtMs ?? attempt.createdAtMs };
        await this.store.updateSession(project.workspace, project.sessionId, { attempt });
        if (this.current(generation)) this.emit({ phase: 'waiting-ack', messageSent: true, projectInfo: info });
      } else if (result.state === 'unknown') {
        await this.store.updateSession(project.workspace, project.sessionId, { attempt: { ...attempt, state: 'unknown' } });
        if (this.current(generation)) this.emit({ phase: 'send-unknown', messageSent: false, projectInfo: info });
      } else if (result.state === 'deferred') {
        await this.store.updateSession(project.workspace, project.sessionId, { attempt: { ...attempt, state: 'prepared', sendStartedAtMs: null } });
        if (this.current(generation)) this.emit({ phase: phaseForReason(result.reason), projectInfo: info });
      }
    } catch (error) {
      if (!this.current(generation)) return;
      const persisted = project && this.store.project(project.workspace);
      if (persisted?.attempt?.state === 'sending') {
        await this.store.updateSession(project.workspace, project.sessionId, { attempt: { ...persisted.attempt, state: 'unknown' } }).catch(() => {});
        this.emit({ phase: 'send-unknown', error: { code: error.code ?? 'SEND_UNKNOWN', message: error.message } });
      } else this.emit({ phase: 'error', error: { code: error.code ?? 'CONTEXT_ERROR', message: error.message } });
    } finally { this.pending = false; }
  }
}
