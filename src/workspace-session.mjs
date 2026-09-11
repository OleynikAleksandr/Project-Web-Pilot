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

export class WorkspaceSessions {
  constructor(file, { inspect = readWorkspace, uuid = randomUUID } = {}) {
    this.file = file;
    this.inspect = inspect;
    this.uuid = uuid;
    this.saveTail = Promise.resolve();
    this.data = { schemaVersion: 1, selectedWorkspace: null, projects: [] };
  }

  async load() {
    let text;
    try { text = await fs.readFile(this.file, 'utf8'); } catch (error) {
      if (error.code === 'ENOENT') return this.snapshot();
      throw error;
    }
    let data;
    try { data = JSON.parse(text); } catch {
      throw new WorkspaceError('SESSIONS_INVALID', 'Не удалось прочитать сохранённые проекты. Файл сохранён для диагностики.');
    }
    if (data.schemaVersion !== 1 || !Array.isArray(data.projects)
        || data.projects.some(p => !p || !path.isAbsolute(p.workspace ?? '')
          || typeof p.projectId !== 'string' || typeof p.sessionId !== 'string'
          || (p.chatUrl !== null && !normalizeChatUrl(p.chatUrl)))) {
      throw new WorkspaceError('SESSIONS_INVALID', 'Формат сохранённых проектов не поддерживается.');
    }
    const urls = data.projects.map(p => p.chatUrl).filter(Boolean);
    if (new Set(urls).size !== urls.length || new Set(data.projects.map(p => p.workspace)).size !== data.projects.length) {
      throw new WorkspaceError('SESSIONS_INVALID', 'В сохранённых проектах есть неоднозначная связь с чатом.');
    }
    this.data = data;
    if (!data.projects.some(p => p.workspace === data.selectedWorkspace)) this.data.selectedWorkspace = null;
    return this.snapshot();
  }

  snapshot() { return copy(this.data); }
  selected() { return copy(this.data.projects.find(p => p.workspace === this.data.selectedWorkspace) ?? null); }
  project(workspace) { return copy(this.data.projects.find(p => p.workspace === workspace) ?? null); }

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

  async select(input) {
    const info = await this.inspect(input);
    let project = this.data.projects.find(p => p.workspace === info.workspace);
    if (project && project.projectId !== info.projectId) {
      throw new WorkspaceError('PROJECT_REPLACED', 'В этой папке теперь другой проект. Старый чат сохранён; выберите другую папку для проверки.');
    }
    if (!project) {
      project = { ...info, sessionId: 'web-pilot-' + this.uuid(), chatUrl: null,
        attempt: null, receipt: null, lastOpenedAt: Date.now() };
      this.data.projects.unshift(project);
    } else {
      Object.assign(project, info, { lastOpenedAt: Date.now() });
    }
    this.data.selectedWorkspace = project.workspace;
    await this.save();
    return copy(project);
  }

  async bindChat(workspace, sessionId, input) {
    const url = normalizeChatUrl(input);
    if (!url) throw new WorkspaceError('CHAT_URL_INVALID', 'Откройте конкретный чат ChatGPT.');
    const project = this.data.projects.find(p => p.workspace === workspace);
    if (!project || project.sessionId !== sessionId) {
      throw new WorkspaceError('SESSION_CHANGED', 'Проект или сессия уже изменились.');
    }
    if (project.chatUrl && project.chatUrl !== url) {
      throw new WorkspaceError('CHAT_CHANGED', 'Открыт другой чат. Вернитесь к связанному чату или создайте новый через сайдбар.');
    }
    if (this.data.projects.some(p => p.workspace !== workspace && p.chatUrl === url)) {
      throw new WorkspaceError('CHAT_IN_USE', 'Этот чат уже связан с другим проектом.');
    }
    project.chatUrl = url;
    await this.save();
    return copy(project);
  }

  async newChat(workspace) {
    const project = this.data.projects.find(p => p.workspace === workspace);
    if (!project) throw new WorkspaceError('WORKSPACE_REQUIRED', 'Сначала выберите проект.');
    project.sessionId = 'web-pilot-' + this.uuid();
    project.chatUrl = null;
    project.attempt = null;
    project.receipt = null;
    await this.save();
    return copy(project);
  }

  async updateSession(workspace, sessionId, patch) {
    const project = this.data.projects.find(p => p.workspace === workspace);
    if (!project || project.sessionId !== sessionId) {
      throw new WorkspaceError('SESSION_CHANGED', 'Сессия изменилась; результат сохранённого чата не применён.');
    }
    if (Object.keys(patch).some(k => !['attempt', 'receipt'].includes(k))) throw new Error('INVALID_SESSION_PATCH');
    Object.assign(project, copy(patch));
    await this.save();
    return copy(project);
  }
}
