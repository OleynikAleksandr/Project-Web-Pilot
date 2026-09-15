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

export function conversationExperience(input) {
  const normalized = normalizeChatUrl(input);
  if (!normalized) return null;
  const pathname = new URL(normalized).pathname;
  // Legacy inference only: before schema v4, /c/<id> meant Chat because experience was not persisted.
  return pathname.startsWith('/work/') ? 'work' : 'chat';
}

export function conversationUrlCompatibleWithExperience(input, experience) {
  const normalized = normalizeChatUrl(input);
  if (!normalized || !['chat', 'work'].includes(experience)) return false;
  const pathname = new URL(normalized).pathname;
  if (experience === 'chat') return !pathname.startsWith('/work/');
  // Production ChatGPT Work enters through /work/, but created Work conversations currently use shared /c/<id>.
  return pathname.startsWith('/work/') || /^\/c\/[a-zA-Z0-9_-]{8,}$/.test(pathname);
}

function sessionExperience(value) {
  if (!['chat', 'work'].includes(value)) throw new WorkspaceError('SESSION_EXPERIENCE', 'Выберите Chat или Work.');
  return value;
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
  const tasks = plan.tasks.map(task => {
    if (!task || typeof task.id !== 'string' || !task.id || typeof task.title !== 'string' || !task.title
        || !['TODO', 'IN_PROGRESS', 'DONE'].includes(task.implementation_status)
        || !['PENDING', 'DONE'].includes(task.commit_status)) {
      throw new WorkspaceError('WORKFLOW_PLAN_INVALID', 'План проекта содержит некорректную микрозадачу.');
    }
    return { id: task.id, title: task.title,
      status: task.commit_status === 'DONE' ? 'done' : task.implementation_status === 'IN_PROGRESS' ? 'current' : 'pending' };
  });
  const current = plan.tasks.find(t => t.id === plan.current_task_id)
    ?? plan.tasks.find(t => t.commit_status !== 'DONE');
  const completed = tasks.filter(task => task.status === 'done').length;
  const planState = plan.execution_scope_status === 'BLOCKED' ? 'blocked'
    : plan.execution_scope_status === 'ACTIVE' && plan.delivery_status === 'READY_FOR_ACCEPTANCE' && completed === tasks.length && tasks.length > 0 ? 'awaiting-acceptance'
      : plan.execution_scope_status === 'ACTIVE' ? 'working'
        : typeof plan.archived_scope_id === 'string' && plan.archived_scope_id ? 'closed' : 'not-created';
  return { workspace, projectId: plan.project_id, name: plan.project_name,
    planRevision: plan.plan_revision, scopeId: plan.scope_id,
    scopeStatus: plan.execution_scope_status, deliveryStatus: plan.delivery_status,
    nextTaskId: current?.id ?? null, nextTaskTitle: current?.title ?? null,
    planView: { state: planState, completed, total: tasks.length, tasks,
      blockedReason: planState === 'blocked' && typeof plan.blocked_reason === 'string' ? plan.blocked_reason : null } };
}

const copy = value => structuredClone(value);
const invalid = () => new WorkspaceError('SESSIONS_INVALID', 'Формат сохранённых проектов не поддерживается. Исходный файл сохранён.');
const sessionFields = ['sessionId', 'experience', 'chatUrl', 'attempt', 'receipt', 'title', 'titleSource', 'createdAt', 'lastOpenedAt', 'archivedAt'];
const explicitTitleSources = new Set(['manual', 'scope']);

function localName(value, { empty = 'Нужно непустое название.', code = 'TITLE_INVALID' } = {}) {
  if (typeof value !== 'string') throw new WorkspaceError(code, empty);
  const name = value.replace(/\s+/g, ' ').trim().slice(0, 160);
  if (!name) throw new WorkspaceError(code, empty);
  return name;
}

function validate(data) {
  if (data?.schemaVersion !== 5 || !Array.isArray(data.projects)) throw invalid();
  const urls = [], ids = [], workspaces = [];
  for (const p of data.projects) {
    if (!p || typeof p.workspace !== 'string' || !path.isAbsolute(p.workspace)
        || typeof p.projectId !== 'string' || !p.projectId || typeof p.name !== 'string'
        || (p.displayName !== undefined && p.displayName !== null && (typeof p.displayName !== 'string' || !p.displayName.trim()))
        || (p.lastNamedScopeId !== undefined && p.lastNamedScopeId !== null && (typeof p.lastNamedScopeId !== 'string' || !p.lastNamedScopeId))
        || !Array.isArray(p.sessions) || !p.sessions.length || typeof p.expanded !== 'boolean'
        || (p.archivedAt !== null && (!Number.isFinite(p.archivedAt) || p.archivedAt <= 0))
        || !p.sessions.some(s => s?.sessionId === p.selectedSessionId && s.archivedAt === null)
        || !p.sessions.some(s => s?.archivedAt === null)) throw invalid();
    workspaces.push(p.workspace);
    for (const s of p.sessions) {
      if (!s || typeof s.sessionId !== 'string' || !s.sessionId || typeof s.title !== 'string'
          || (s.titleSource !== undefined && s.titleSource !== null && !['page', 'manual', 'scope'].includes(s.titleSource))
          || !['chat', 'work'].includes(s.experience)
          || !Number.isFinite(s.createdAt) || !Number.isFinite(s.lastOpenedAt)
          || (s.archivedAt !== null && (!Number.isFinite(s.archivedAt) || s.archivedAt <= 0))
          || (s.chatUrl !== null && (!normalizeChatUrl(s.chatUrl) || normalizeChatUrl(s.chatUrl) !== s.chatUrl
            || !conversationUrlCompatibleWithExperience(s.chatUrl, s.experience)))) throw invalid();
      ids.push(s.sessionId);
      if (s.chatUrl) urls.push(s.chatUrl);
    }
  }
  for (const values of [urls, ids, workspaces]) if (new Set(values).size !== values.length) throw invalid();
  return data;
}

function migrate(data) {
  if (data?.schemaVersion === 1 && Array.isArray(data.projects)) {
    data = { schemaVersion: 2, selectedWorkspace: data.selectedWorkspace, projects: data.projects.map(p => {
      if (!p || typeof p.sessionId !== 'string') throw invalid();
      const info = { ...p };
      for (const key of sessionFields) delete info[key];
      const time = p.attempt?.createdAtMs ?? p.lastOpenedAt ?? Date.now();
      return { ...info, expanded: false, selectedSessionId: p.sessionId,
        sessions: [{ sessionId: p.sessionId, chatUrl: p.chatUrl, attempt: p.attempt ?? null,
          receipt: p.receipt ?? null, title: p.title ?? '', createdAt: time, lastOpenedAt: p.lastOpenedAt ?? time }] };
    }) };
  }
  if (data?.schemaVersion === 2 && Array.isArray(data.projects)) {
    data = { ...data, schemaVersion: 3, projects: data.projects.map(p => ({ ...p, archivedAt: null })) };
  }
  if (data?.schemaVersion === 3 && Array.isArray(data.projects)) {
    data = { ...data, schemaVersion: 4, projects: data.projects.map(p => ({ ...p,
      sessions: p.sessions.map(session => ({ ...session, experience: conversationExperience(session.chatUrl) ?? 'chat' })) })) };
  }
  if (data?.schemaVersion !== 4 || !Array.isArray(data.projects)) throw invalid();
  return { ...data, schemaVersion: 5, projects: data.projects.map(p => ({ ...p,
    sessions: p.sessions.map(session => ({ ...session, archivedAt: null })) })) };
}

async function fileExists(file) {
  try { await fs.access(file); return true; } catch (error) { if (error.code === 'ENOENT') return false; throw error; }
}

async function writeJsonAtomic(file, data) {
  const temporary = file + '.tmp-session-archive';
  await fs.writeFile(temporary, JSON.stringify(data, null, 2) + '\n', { mode: 0o600 });
  await fs.rename(temporary, file);
}

async function purgeSessionCopies(storeFile, workspace, sessionId) {
  for (const version of [1, 2, 3, 4]) {
    const file = storeFile + `.v${version}-backup`;
    if (!await fileExists(file)) continue;
    const data = JSON.parse(await fs.readFile(file, 'utf8'));
    if (!Array.isArray(data.projects)) throw new WorkspaceError('SESSION_LOCAL_CLEANUP', 'Не удалось очистить старую локальную копию сессий.');
    let projectRemoved = false;
    data.projects = data.projects.filter(project => {
      if (project.workspace !== workspace) return true;
      if (Array.isArray(project.sessions)) {
        project.sessions = project.sessions.filter(session => session.sessionId !== sessionId);
        if (project.selectedSessionId === sessionId) project.selectedSessionId = project.sessions[0]?.sessionId ?? null;
        if (!project.sessions.length) { projectRemoved = true; return false; }
        return true;
      }
      if (project.sessionId === sessionId) { projectRemoved = true; return false; }
      return true;
    });
    if (projectRemoved && data.selectedWorkspace === workspace && !data.projects.some(project => project.workspace === workspace)) data.selectedWorkspace = null;
    await writeJsonAtomic(file, data);
  }
  const diagnostics = path.join(path.dirname(storeFile), 'diagnostics.jsonl');
  if (await fileExists(diagnostics)) {
    const lines = (await fs.readFile(diagnostics, 'utf8')).split('\n').filter(Boolean).filter(line => {
      const entry = JSON.parse(line);
      return !(entry.workspace === workspace && entry.sessionId === sessionId);
    });
    const temporary = diagnostics + '.tmp-session-archive';
    await fs.writeFile(temporary, lines.length ? lines.join('\n') + '\n' : '', { mode: 0o600 });
    await fs.rename(temporary, diagnostics);
  }
}

function currentView(project) {
  if (!project) return null;
  const { sessions, archivedAt: projectArchivedAt, ...info } = project;
  const session = sessions.find(s => s.sessionId === project.selectedSessionId);
  return copy({ ...info, ...session, archivedAt: projectArchivedAt, sessionArchivedAt: session.archivedAt });
}

export class WorkspaceSessions {
  constructor(file, { inspect = readWorkspace, uuid = randomUUID, now = Date.now } = {}) {
    Object.assign(this, { file, inspect, uuid, now });
    this.saveTail = Promise.resolve();
    this.mutationTail = Promise.resolve();
    this.data = { schemaVersion: 5, selectedWorkspace: null, projects: [] };
  }

  async load() {
    let text;
    try { text = await fs.readFile(this.file, 'utf8'); } catch (error) {
      if (error.code === 'ENOENT') return this.snapshot();
      throw error;
    }
    let parsed;
    try { parsed = JSON.parse(text); } catch { throw invalid(); }
    const legacy = [1, 2, 3, 4].includes(parsed.schemaVersion);
    const data = validate(legacy ? migrate(parsed) : parsed);
    if (legacy) {
      try { await fs.writeFile(this.file + `.v${parsed.schemaVersion}-backup`, text, { mode: 0o600, flag: 'wx' }); }
      catch (error) { if (error.code !== 'EEXIST') throw error; }
    }
    // Retire the optional estimate without keeping hashes/counts in normal session state.
    let removedEstimate = false;
    for (const project of data.projects) {
      for (const session of project.sessions) {
        if (Object.hasOwn(session, 'tokenEstimate')) {
          delete session.tokenEstimate;
          removedEstimate = true;
        }
      }
    }
    this.data = data;
    if (!data.projects.some(p => p.workspace === data.selectedWorkspace && p.archivedAt === null)) this.data.selectedWorkspace = null;
    if (legacy || removedEstimate) await this.save();
    return this.snapshot();
  }

  snapshot() { return copy(this.data); }
  selected() { return this.project(this.data.selectedWorkspace); }
  project(workspace) { return currentView(this.data.projects.find(p => p.workspace === workspace)); }

  activeRecord(workspace, sessionId, data = this.data) {
    const project = data.projects.find(p => p.workspace === workspace);
    if (project?.archivedAt) throw new WorkspaceError('PROJECT_ARCHIVED', 'Сначала верните проект из архива.');
    if (!project || project.selectedSessionId !== sessionId) {
      throw new WorkspaceError('SESSION_CHANGED', 'Проект или сессия уже изменились.');
    }
    return { project, session: project.sessions.find(s => s.sessionId === sessionId) };
  }

  save(data = this.data) {
    const text = JSON.stringify(data, null, 2) + '\n';
    const operation = this.saveTail.catch(() => {}).then(async () => {
      await fs.mkdir(path.dirname(this.file), { recursive: true, mode: 0o700 });
      const temporary = this.file + '.tmp-' + this.uuid();
      await fs.writeFile(temporary, text, { mode: 0o600 });
      await fs.rename(temporary, this.file);
    });
    this.saveTail = operation;
    return operation;
  }

  createSession(experience = 'chat') {
    experience = sessionExperience(experience);
    return { sessionId: 'web-pilot-' + this.uuid(), experience, chatUrl: null, title: '', titleSource: null,
      createdAt: this.now(), lastOpenedAt: this.now(), archivedAt: null, attempt: null, receipt: null };
  }

  mutate(change) {
    const operation = this.mutationTail.catch(() => {}).then(async () => {
      const draft = copy(this.data);
      const result = await change(draft);
      await this.save(draft);
      this.data = draft;
      return result;
    });
    this.mutationTail = operation;
    return operation;
  }

  select(input, { experience = 'chat' } = {}) {
    return this.mutate(async data => {
      const info = await this.inspect(input);
      let project = data.projects.find(p => p.workspace === info.workspace);
      if (project?.archivedAt) throw new WorkspaceError('PROJECT_ARCHIVED', 'Сначала верните проект из архива в настройках.');
      if (project && project.projectId !== info.projectId) throw new WorkspaceError('PROJECT_REPLACED', 'В этой папке теперь другой проект. Сохранённые чаты оставлены без изменений.');
      if (!project) {
        const session = this.createSession(experience);
        project = { ...info, selectedSessionId: session.sessionId, sessions: [session], expanded: false, archivedAt: null };
        data.projects.unshift(project);
      } else Object.assign(project, info);
      project.sessions.find(s => s.sessionId === project.selectedSessionId).lastOpenedAt = this.now();
      data.selectedWorkspace = project.workspace;
      return currentView(project);
    });
  }

  selectSession(input, sessionId) {
    return this.mutate(async data => {
      const info = await this.inspect(input);
      const project = data.projects.find(p => p.workspace === info.workspace);
      if (!project || !project.sessions.some(s => s.sessionId === sessionId)) throw new WorkspaceError('SESSION_NOT_FOUND', 'Эта сессия не принадлежит выбранному проекту.');
      if (project.sessions.find(s => s.sessionId === sessionId)?.archivedAt) throw new WorkspaceError('SESSION_ARCHIVED', 'Сначала верните сессию из архива.');
      if (project.archivedAt) throw new WorkspaceError('PROJECT_ARCHIVED', 'Сначала верните проект из архива.');
      if (project.projectId !== info.projectId) throw new WorkspaceError('PROJECT_REPLACED', 'В этой папке теперь другой проект. Сохранённые чаты оставлены без изменений.');
      Object.assign(project, info, { selectedSessionId: sessionId, expanded: true });
      project.sessions.find(s => s.sessionId === sessionId).lastOpenedAt = this.now();
      data.selectedWorkspace = project.workspace;
      return currentView(project);
    });
  }

  bindChat(workspace, sessionId, input) {
    return this.mutate(data => {
      const url = normalizeChatUrl(input);
      if (!url) throw new WorkspaceError('CHAT_URL_INVALID', 'Откройте конкретный чат ChatGPT.');
      const { session } = this.activeRecord(workspace, sessionId, data);
      if (!conversationUrlCompatibleWithExperience(url, session.experience)) {
        throw new WorkspaceError('CHAT_EXPERIENCE_MISMATCH', session.experience === 'work'
          ? 'Эта сессия создана как Work. Откройте разговор, созданный из Work.' : 'Эта сессия создана как Chat. Откройте обычный Chat.');
      }
      if (session.chatUrl && session.chatUrl !== url) throw new WorkspaceError('CHAT_CHANGED', 'Открыт другой чат. Выберите его в дереве или вернитесь к сессии проекта.');
      if (data.projects.some(p => p.sessions.some(s => s.sessionId !== sessionId && s.chatUrl === url))) throw new WorkspaceError('CHAT_IN_USE', 'Этот чат уже связан с другой сессией.');
      session.chatUrl = url;
      return currentView(data.projects.find(p => p.workspace === workspace));
    });
  }

  newSession(workspace, experience) {
    return this.mutate(data => {
      experience = sessionExperience(experience);
      const project = data.projects.find(p => p.workspace === workspace);
      if (!project) throw new WorkspaceError('WORKSPACE_REQUIRED', 'Сначала выберите проект.');
      if (project.archivedAt) throw new WorkspaceError('PROJECT_ARCHIVED', 'Сначала верните проект из архива.');
      const session = this.createSession(experience);
      project.sessions.push(session); project.selectedSessionId = session.sessionId; project.expanded = true;
      return currentView(project);
    });
  }

  newChat(workspace) { return this.newSession(workspace, 'chat'); }

  setExpanded(workspace, expanded) {
    return this.mutate(data => {
      const project = data.projects.find(p => p.workspace === workspace);
      if (!project || typeof expanded !== 'boolean') throw new WorkspaceError('WORKSPACE_REQUIRED', 'Выберите проект из списка.');
      project.expanded = expanded;
    });
  }

  setProjectDisplayName(workspace, value) {
    return this.mutate(data => {
      const project = data.projects.find(p => p.workspace === workspace);
      if (!project) throw new WorkspaceError('WORKSPACE_REQUIRED', 'Выберите проект из списка.');
      if (project.archivedAt) throw new WorkspaceError('PROJECT_ARCHIVED', 'Сначала верните проект из архива.');
      const displayName = localName(value, { code: 'PROJECT_NAME_INVALID', empty: 'Введите название проекта.' });
      if (project.displayName === displayName) return false;
      project.displayName = displayName; return true;
    });
  }

  renameSession(workspace, sessionId, value) {
    return this.mutate(data => {
      const project = data.projects.find(p => p.workspace === workspace);
      if (!project) throw new WorkspaceError('WORKSPACE_REQUIRED', 'Выберите проект из списка.');
      if (project.archivedAt) throw new WorkspaceError('PROJECT_ARCHIVED', 'Сначала верните проект из архива.');
      const session = project.sessions.find(item => item.sessionId === sessionId);
      if (!session) throw new WorkspaceError('SESSION_NOT_FOUND', 'Сессия не найдена.');
      if (session.archivedAt) throw new WorkspaceError('SESSION_ARCHIVED', 'Сначала верните сессию из архива.');
      const title = localName(value, { empty: 'Введите название сессии.' });
      if (session.title === title && session.titleSource === 'manual') return false;
      session.title = title; session.titleSource = 'manual'; return true;
    });
  }

  setSessionTitle(workspace, sessionId, value) {
    return this.mutate(data => {
      const { session } = this.activeRecord(workspace, sessionId, data);
      if (typeof value !== 'string') throw new WorkspaceError('TITLE_INVALID', 'Неверное название сессии.');
      const title = value.replace(/\s+/g, ' ').trim().slice(0, 160);
      if (!title || explicitTitleSources.has(session.titleSource)) return false;
      if (session.title === title && session.titleSource === 'page') return false;
      session.title = title; session.titleSource = 'page'; return true;
    });
  }

  applyScopeTitle(workspace, sessionId, { scopeId, objective, scopeStatus } = {}) {
    return this.mutate(data => {
      const { project, session } = this.activeRecord(workspace, sessionId, data);
      if (!['ACTIVE', 'BLOCKED'].includes(scopeStatus) || typeof scopeId !== 'string' || !scopeId) return false;
      if (project.lastNamedScopeId === scopeId) return false;
      const title = localName(objective, { empty: 'У scope нет названия для сессии.' });
      session.title = title; session.titleSource = 'scope'; project.lastNamedScopeId = scopeId;
      return true;
    });
  }

  updateSession(workspace, sessionId, patch) {
    return this.mutate(data => {
      const { project, session } = this.activeRecord(workspace, sessionId, data);
      if (Object.keys(patch).some(k => !['attempt', 'receipt'].includes(k))) throw new Error('INVALID_SESSION_PATCH');
      Object.assign(session, copy(patch)); return currentView(project);
    });
  }

  setSessionArchived(workspace, sessionId, archived) {
    return this.mutate(data => {
      if (typeof archived !== 'boolean') throw new WorkspaceError('SESSION_ARCHIVE', 'Неверное состояние архива сессии.');
      const project = data.projects.find(p => p.workspace === workspace);
      if (!project) throw new WorkspaceError('WORKSPACE_REQUIRED', 'Выберите проект из списка.');
      if (project.archivedAt) throw new WorkspaceError('PROJECT_ARCHIVED', 'Сначала верните проект из архива.');
      const session = project.sessions.find(item => item.sessionId === sessionId);
      if (!session) throw new WorkspaceError('SESSION_NOT_FOUND', 'Сессия не найдена.');
      if (archived) {
        if (session.archivedAt) return currentView(project);
        const active = project.sessions.filter(item => item.archivedAt === null);
        if (active.length <= 1) throw new WorkspaceError('SESSION_LAST_ACTIVE', 'Нельзя архивировать единственную активную сессию проекта.');
        session.archivedAt = this.now();
        if (project.selectedSessionId === sessionId) {
          const fallback = active.filter(item => item.sessionId !== sessionId)
            .sort((a, b) => b.lastOpenedAt - a.lastOpenedAt || b.createdAt - a.createdAt)[0];
          project.selectedSessionId = fallback.sessionId;
          fallback.lastOpenedAt = this.now();
        }
      } else session.archivedAt = null;
      return currentView(project);
    });
  }

  forgetArchivedSessions(items) {
    return this.mutate(async data => {
      if (!Array.isArray(items) || !items.length) throw new WorkspaceError('SESSION_ARCHIVE', 'Выберите сессии из архива.');
      const seen = new Set();
      const records = items.map(item => {
        const key = `${item?.workspace ?? ''}\n${item?.sessionId ?? ''}`;
        if (!item || typeof item.workspace !== 'string' || typeof item.projectId !== 'string' || typeof item.sessionId !== 'string' || seen.has(key))
          throw new WorkspaceError('SESSION_ARCHIVE', 'Выберите корректные сессии из архива.');
        seen.add(key);
        const project = data.projects.find(project => project.workspace === item.workspace);
        if (!project || project.projectId !== item.projectId) throw new WorkspaceError('PROJECT_REPLACED', 'Запись проекта изменилась. Повторите выбор.');
        const session = project.sessions.find(session => session.sessionId === item.sessionId);
        if (!session?.archivedAt) throw new WorkspaceError('SESSION_NOT_ARCHIVED', 'Удалить локально можно только сессию из архива.');
        return { project, session };
      });
      for (const { project, session } of records) await purgeSessionCopies(this.file, project.workspace, session.sessionId);
      for (const { project, session } of records) project.sessions = project.sessions.filter(item => item.sessionId !== session.sessionId);
      return records.length;
    });
  }

  setArchived(workspace, archived) {
    return this.mutate(data => {
      const project = data.projects.find(p => p.workspace === workspace);
      if (!project || typeof archived !== 'boolean') throw new WorkspaceError('WORKSPACE_REQUIRED', 'Выберите проект из списка.');
      project.archivedAt = archived ? (project.archivedAt ?? this.now()) : null;
      if (archived && data.selectedWorkspace === workspace) data.selectedWorkspace = null;
      return currentView(project);
    });
  }

  forgetArchived(workspace, projectId) {
    return this.forgetArchivedMany([{ workspace, projectId }]).then(count => count > 0);
  }

  forgetArchivedMany(items) {
    return this.mutate(data => {
      if (!Array.isArray(items) || !items.length) throw new WorkspaceError('WORKSPACE_REQUIRED', 'Выберите проект из архива.');
      const seen = new Set();
      const projects = items.map(item => {
        if (!item || typeof item.workspace !== 'string' || typeof item.projectId !== 'string' || seen.has(item.workspace))
          throw new WorkspaceError('WORKSPACE_REQUIRED', 'Выберите корректные проекты из архива.');
        seen.add(item.workspace);
        const project = data.projects.find(p => p.workspace === item.workspace);
        if (!project || project.projectId !== item.projectId) throw new WorkspaceError('PROJECT_REPLACED', 'Запись проекта изменилась. Повторите проверку.');
        if (!project.archivedAt) throw new WorkspaceError('PROJECT_NOT_ARCHIVED', 'Убрать из списка можно только проект из архива.');
        return project;
      });
      const remove = new Set(projects.map(project => project.workspace));
      data.projects = data.projects.filter(project => !remove.has(project.workspace));
      if (remove.has(data.selectedWorkspace)) data.selectedWorkspace = null;
      return projects.length;
    });
  }
}
