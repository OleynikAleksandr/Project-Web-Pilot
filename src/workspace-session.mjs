import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

export class WorkspaceError extends Error {
  constructor(code, message) { super(message); this.code = code; }
}

export function normalizeChatUrl(input) {
  if (typeof input !== 'string') return null;
  try {
    const url = new URL(input);
    if (url.protocol !== 'https:' || url.hostname !== 'chatgpt.com' || url.port || url.username || url.password) return null;
    // Chat and Work conversations may have different prefixes; bind only an actual conversation ID.
    const match = url.pathname.match(/^\/(?:c|work\/c|work|g\/[a-zA-Z0-9_-]+\/c)\/([a-zA-Z0-9_-]{8,})\/?$/);
    return match ? url.origin + url.pathname.replace(/\/$/, '') : null;
  } catch { return null; }
}

export async function readWorkspace(input) {
  if (typeof input !== 'string' || !path.isAbsolute(input)) {
    throw new WorkspaceError('WORKSPACE_REQUIRED', 'Выберите папку проекта.');
  }
  let workspace;
  let text;
  try {
    workspace = await fs.realpath(input);
    text = await fs.readFile(path.join(workspace, '.harness/plans/todo-plan.md'), 'utf8');
    await fs.access(path.join(workspace, 'scripts/workflow.mjs'));
  } catch {
    throw new WorkspaceError('WORKFLOW_NOT_INSTALLED', 'В этой папке нет Workflow Kit. Выберите подготовленный проект.');
  }
  const block = text.match(/<!-- workflow-state:begin -->\s*```json\s*([\s\S]*?)```\s*<!-- workflow-state:end -->/);
  let plan;
  try { plan = JSON.parse(block?.[1] ?? ''); } catch {
    throw new WorkspaceError('WORKFLOW_PLAN_INVALID', 'Не удалось прочитать план выбранного проекта.');
  }
  if (plan.schema_version !== 1 || typeof plan.project_id !== 'string' || !plan.project_id
      || typeof plan.project_name !== 'string' || !Number.isSafeInteger(plan.plan_revision)
      || !Array.isArray(plan.tasks)) {
    throw new WorkspaceError('WORKFLOW_PLAN_INVALID', 'План проекта имеет неподдерживаемый формат.');
  }
  const current = plan.tasks.find(t => t.id === plan.current_task_id)
    ?? plan.tasks.find(t => t.commit_status !== 'DONE');
  return { workspace, projectId: plan.project_id, name: plan.project_name,
    planRevision: plan.plan_revision, scopeId: plan.scope_id,
    scopeStatus: plan.execution_scope_status, deliveryStatus: plan.delivery_status,
    nextTaskId: current?.id ?? null, nextTaskTitle: current?.title ?? null };
}

const copy = value => structuredClone(value);
const invalid = () => new WorkspaceError('SESSIONS_INVALID', 'Формат сохранённых проектов не поддерживается. Исходный файл сохранён.');
const sessionFields = ['sessionId', 'chatUrl', 'attempt', 'receipt', 'title', 'createdAt', 'lastOpenedAt'];

function validate(data) {
  if (data?.schemaVersion !== 2 || !Array.isArray(data.projects)) throw invalid();
  const urls = [], ids = [], workspaces = [];
  for (const p of data.projects) {
    if (!p || typeof p.workspace !== 'string' || !path.isAbsolute(p.workspace)
        || typeof p.projectId !== 'string' || !p.projectId || typeof p.name !== 'string'
        || !Array.isArray(p.sessions) || !p.sessions.length || typeof p.expanded !== 'boolean'
        || !p.sessions.some(s => s?.sessionId === p.selectedSessionId)) throw invalid();
    workspaces.push(p.workspace);
    for (const s of p.sessions) {
      if (!s || typeof s.sessionId !== 'string' || !s.sessionId || typeof s.title !== 'string'
          || !Number.isFinite(s.createdAt) || !Number.isFinite(s.lastOpenedAt)
          || (s.chatUrl !== null && (!normalizeChatUrl(s.chatUrl) || normalizeChatUrl(s.chatUrl) !== s.chatUrl))) throw invalid();
      ids.push(s.sessionId);
      if (s.chatUrl) urls.push(s.chatUrl);
    }
  }
  for (const values of [urls, ids, workspaces]) if (new Set(values).size !== values.length) throw invalid();
  return data;
}

function migrate(data) {
  if (data?.schemaVersion !== 1 || !Array.isArray(data.projects)) throw invalid();
  return { schemaVersion: 2, selectedWorkspace: data.selectedWorkspace, projects: data.projects.map(p => {
    if (!p || typeof p.sessionId !== 'string') throw invalid();
    const info = { ...p };
    for (const key of sessionFields) delete info[key];
    const time = p.attempt?.createdAtMs ?? p.lastOpenedAt ?? Date.now();
    return { ...info, expanded: false, selectedSessionId: p.sessionId,
      sessions: [{ sessionId: p.sessionId, chatUrl: p.chatUrl, attempt: p.attempt ?? null,
        receipt: p.receipt ?? null, title: p.title ?? '', createdAt: time, lastOpenedAt: p.lastOpenedAt ?? time }] };
  }) };
}

function currentView(project) {
  if (!project) return null;
  const { sessions, ...info } = project;
  return copy({ ...info, ...sessions.find(s => s.sessionId === project.selectedSessionId) });
}

export class WorkspaceSessions {
  constructor(file, { inspect = readWorkspace, uuid = randomUUID, now = Date.now } = {}) {
    Object.assign(this, { file, inspect, uuid, now });
    this.saveTail = Promise.resolve();
    this.data = { schemaVersion: 2, selectedWorkspace: null, projects: [] };
  }

  async load() {
    let text;
    try { text = await fs.readFile(this.file, 'utf8'); } catch (error) {
      if (error.code === 'ENOENT') return this.snapshot();
      throw error;
    }
    let parsed;
    try { parsed = JSON.parse(text); } catch { throw invalid(); }
    const legacy = parsed.schemaVersion === 1;
    const data = validate(legacy ? migrate(parsed) : parsed);
    if (legacy) {
      try { await fs.writeFile(this.file + '.v1-backup', text, { mode: 0o600, flag: 'wx' }); }
      catch (error) { if (error.code !== 'EEXIST') throw error; }
    }
    this.data = data;
    if (!data.projects.some(p => p.workspace === data.selectedWorkspace)) this.data.selectedWorkspace = null;
    if (legacy) await this.save();
    return this.snapshot();
  }

  snapshot() { return copy(this.data); }
  selected() { return this.project(this.data.selectedWorkspace); }
  project(workspace) { return currentView(this.data.projects.find(p => p.workspace === workspace)); }

  activeRecord(workspace, sessionId) {
    const project = this.data.projects.find(p => p.workspace === workspace);
    if (!project || project.selectedSessionId !== sessionId) {
      throw new WorkspaceError('SESSION_CHANGED', 'Проект или сессия уже изменились.');
    }
    return { project, session: project.sessions.find(s => s.sessionId === sessionId) };
  }

  save() {
    const text = JSON.stringify(this.data, null, 2) + '\n';
    const operation = this.saveTail.catch(() => {}).then(async () => {
      await fs.mkdir(path.dirname(this.file), { recursive: true, mode: 0o700 });
      const temporary = this.file + '.tmp-' + this.uuid();
      await fs.writeFile(temporary, text, { mode: 0o600 });
      await fs.rename(temporary, this.file);
    });
    this.saveTail = operation;
    return operation;
  }

  createSession() {
    return { sessionId: 'web-pilot-' + this.uuid(), chatUrl: null, title: '',
      createdAt: this.now(), lastOpenedAt: this.now(), attempt: null, receipt: null };
  }

  async select(input) {
    const info = await this.inspect(input);
    let project = this.data.projects.find(p => p.workspace === info.workspace);
    if (project && project.projectId !== info.projectId) {
      throw new WorkspaceError('PROJECT_REPLACED', 'В этой папке теперь другой проект. Сохранённые чаты оставлены без изменений.');
    }
    if (!project) {
      const session = this.createSession();
      project = { ...info, selectedSessionId: session.sessionId, sessions: [session], expanded: false };
      this.data.projects.unshift(project);
    } else Object.assign(project, info);
    project.sessions.find(s => s.sessionId === project.selectedSessionId).lastOpenedAt = this.now();
    this.data.selectedWorkspace = project.workspace;
    await this.save();
    return currentView(project);
  }

  async selectSession(input, sessionId) {
    const info = await this.inspect(input);
    const project = this.data.projects.find(p => p.workspace === info.workspace);
    if (!project || !project.sessions.some(s => s.sessionId === sessionId)) {
      throw new WorkspaceError('SESSION_NOT_FOUND', 'Эта сессия не принадлежит выбранному проекту.');
    }
    if (project.projectId !== info.projectId) throw new WorkspaceError('PROJECT_REPLACED', 'В этой папке теперь другой проект. Сохранённые чаты оставлены без изменений.');
    Object.assign(project, info, { selectedSessionId: sessionId, expanded: true });
    project.sessions.find(s => s.sessionId === sessionId).lastOpenedAt = this.now();
    this.data.selectedWorkspace = project.workspace;
    await this.save();
    return currentView(project);
  }

  async bindChat(workspace, sessionId, input) {
    const url = normalizeChatUrl(input);
    if (!url) throw new WorkspaceError('CHAT_URL_INVALID', 'Откройте конкретный чат ChatGPT.');
    const { project, session } = this.activeRecord(workspace, sessionId);
    if (session.chatUrl && session.chatUrl !== url) {
      throw new WorkspaceError('CHAT_CHANGED', 'Открыт другой чат. Выберите его в дереве или вернитесь к сессии проекта.');
    }
    if (this.data.projects.some(p => p.sessions.some(s => s.sessionId !== sessionId && s.chatUrl === url))) {
      throw new WorkspaceError('CHAT_IN_USE', 'Этот чат уже связан с другой сессией.');
    }
    session.chatUrl = url;
    await this.save();
    return currentView(project);
  }

  async newChat(workspace) {
    const project = this.data.projects.find(p => p.workspace === workspace);
    if (!project) throw new WorkspaceError('WORKSPACE_REQUIRED', 'Сначала выберите проект.');
    const session = this.createSession();
    project.sessions.push(session);
    project.selectedSessionId = session.sessionId;
    project.expanded = true;
    await this.save();
    return currentView(project);
  }

  async setExpanded(workspace, expanded) {
    const project = this.data.projects.find(p => p.workspace === workspace);
    if (!project || typeof expanded !== 'boolean') throw new WorkspaceError('WORKSPACE_REQUIRED', 'Выберите проект из списка.');
    project.expanded = expanded;
    await this.save();
  }

  async setSessionTitle(workspace, sessionId, value) {
    const { session } = this.activeRecord(workspace, sessionId);
    if (typeof value !== 'string') throw new WorkspaceError('TITLE_INVALID', 'Неверное название сессии.');
    const title = value.replace(/\s+/g, ' ').trim().slice(0, 160);
    if (!title || session.title === title) return false;
    session.title = title;
    await this.save();
    return true;
  }

  async updateSession(workspace, sessionId, patch) {
    const { project, session } = this.activeRecord(workspace, sessionId);
    if (Object.keys(patch).some(k => !['attempt', 'receipt'].includes(k))) throw new Error('INVALID_SESSION_PATCH');
    Object.assign(session, copy(patch));
    await this.save();
    return currentView(project);
  }
}
