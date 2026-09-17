import { execFile as execFileCallback } from 'node:child_process';
import { promisify } from 'node:util';
import { SessionPlans } from './session-plans.mjs';
import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { isAbsolutePlatformPath, runtimeFolderCandidates, runtimeLayout } from './platform.mjs';

const execFile = promisify(execFileCallback);
const requiredTools = ['bridge_status', 'workflow_context_recover'];
export const CONTEXT_PROTOCOL = 'inline-context-v1';

export class RuntimeError extends Error {
  constructor(code, message) { super(message); this.code = code; }
}

export function validateContextPacket(packet, workspace, selection = {}) {
  if (packet?.delivery_protocol !== CONTEXT_PROTOCOL || packet.ack_required !== false) {
    throw new RuntimeError('MCP_UPDATE_REQUIRED', 'Нужна обновлённая версия Codex Local Mac с прямой передачей контекста.');
  }
  if (packet.workspace !== workspace) throw new RuntimeError('MCP_CONTEXT_MISMATCH', 'Получен контекст другой папки.');
  if (selection.sessionId && (packet.session_id !== selection.sessionId || packet.plan_id !== (selection.planId ?? null)))
    throw new RuntimeError('MCP_CONTEXT_SESSION_MISMATCH', 'Получен пакет другого плана или сессии.');
  const facts = packet.facts;
  const factNames = ['project_id', 'project_name', 'plan_revision', 'scope_id', 'execution_scope_status', 'delivery_status', 'task_id', 'task_title'];
  if (packet.status !== 'ready' || packet.completeness !== 'COMPLETE' || typeof packet.context !== 'string'
      || !packet.context.trim() || typeof packet.signature !== 'string' || !packet.signature
      || !facts || factNames.some(key => !(key in facts)) || Object.keys(facts).length !== factNames.length
      || typeof facts.project_id !== 'string' || !facts.project_id || typeof facts.project_name !== 'string'
      || !Number.isSafeInteger(facts.plan_revision) || facts.plan_revision < 0
      || !Number.isFinite(packet.generated_at_ms) || ['probe_id', 'challenge'].some(key => key in packet)) {
    throw new RuntimeError('MCP_CONTEXT_INCOMPLETE', 'Получен неполный пакет контекста.');
  }
  const bytes = Buffer.byteLength(packet.context, 'utf8');
  if (bytes > 180000) throw new RuntimeError('MCP_CONTEXT_TOO_LARGE', 'Пакет контекста слишком велик. Нужно уменьшить его состав в Workflow Kit.');
  if (bytes !== packet.context_bytes || createHash('sha256').update(packet.context, 'utf8').digest('hex') !== packet.context_sha256) {
    throw new RuntimeError('MCP_CONTEXT_DAMAGED', 'Полный текст контекста не прошёл проверку целостности.');
  }
  return packet;
}

export function validateEndpoint(value) {
  let url;
  try { url = new URL(value); } catch { throw new RuntimeError('MCP_URL_INVALID', 'Неверный адрес локальных инструментов.'); }
  if (url.protocol !== 'http:' || url.hostname !== '127.0.0.1' || url.pathname !== '/mcp'
      || url.username || url.password || url.search || url.hash) {
    throw new RuntimeError('MCP_URL_INVALID', 'Инструменты должны быть доступны локально на этом компьютере.');
  }
  return url.href;
}

async function responseMessage(response, id) {
  if (response.status === 202 || response.status === 204) return null;
  if (!response.ok) {
    await response.body?.cancel();
    throw new RuntimeError('MCP_HTTP_ERROR', `Локальный MCP вернул HTTP ${response.status}.`);
  }
  const sse = (response.headers.get('content-type') ?? '').includes('text/event-stream');
  if (!response.body) throw new RuntimeError('MCP_EMPTY_RESPONSE', 'MCP вернул пустой ответ.');
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let bytes = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (value) { bytes += value.byteLength; buffer += decoder.decode(value, { stream: !done }); }
      if (bytes > 2 * 1024 * 1024) throw new RuntimeError('MCP_RESPONSE_TOO_LARGE', 'Ответ MCP превышает допустимый размер.');
      if (sse) {
        buffer = buffer.replace(/\r\n/g, '\n');
        let boundary;
        while ((boundary = buffer.indexOf('\n\n')) !== -1) {
          const event = buffer.slice(0, boundary); buffer = buffer.slice(boundary + 2);
          const data = event.split('\n').filter(line => line.startsWith('data:')).map(line => line.slice(5).trimStart()).join('\n');
          if (!data) continue;
          const message = JSON.parse(data);
          if (message.id === id) return message;
        }
      } else if (done) {
        const message = JSON.parse(buffer);
        if (message.id !== id) throw new RuntimeError('MCP_ID_MISMATCH', 'MCP вернул ответ другой операции.');
        return message;
      }
      if (done) throw new RuntimeError('MCP_RESPONSE_MISSING', 'MCP закрыл соединение без ответа.');
    }
  } finally {
    await reader.cancel().catch(() => {});
  }
}

export class LocalMcpClient {
  constructor(endpoint, { fetchImpl = globalThis.fetch, timeoutMs = 10000, expectedServerName = 'Codex Local Mac' } = {}) {
    this.endpoint = validateEndpoint(endpoint);
    this.fetch = fetchImpl;
    this.timeoutMs = timeoutMs;
    this.expectedServerName = expectedServerName;
    this.sessionId = null;
    this.protocolVersion = '2025-03-26';
    this.sequence = 0;
    this.ready = null;
  }

  async request(method, params = {}) {
    if (!['initialize', 'notifications/initialized', 'tools/list', 'tools/call'].includes(method)
        || (method === 'tools/call' && params.name !== 'workflow_context_recover')) {
      throw new RuntimeError('MCP_READ_ONLY', 'Оболочка может только получать полный контекст проекта.');
    }
    const notification = method.startsWith('notifications/');
    const id = notification ? undefined : ++this.sequence;
    const headers = { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream' };
    if (this.sessionId) headers['Mcp-Session-Id'] = this.sessionId;
    if (method !== 'initialize') headers['MCP-Protocol-Version'] = this.protocolVersion;
    let response;
    try {
      response = await this.fetch(this.endpoint, { method: 'POST', headers,
        body: JSON.stringify({ jsonrpc: '2.0', ...(id === undefined ? {} : { id }), method, params }),
        signal: AbortSignal.timeout(params.name === 'workflow_context_recover' ? Math.max(this.timeoutMs, 35000) : this.timeoutMs), redirect: 'error' });
      if (method === 'initialize') this.sessionId = response.headers.get('mcp-session-id');
      const message = await responseMessage(response, id);
      if (message?.error) throw new RuntimeError('MCP_RPC_ERROR', String(message.error.message ?? 'Ошибка MCP.'));
      return message?.result ?? null;
    } catch (error) {
      if (error instanceof RuntimeError) throw error;
      throw new RuntimeError('MCP_UNAVAILABLE', 'Не удалось связаться с локальными инструментами. Проверьте подключение.');
    }
  }

  async initialize() {
    if (this.ready) return this.ready;
    const init = await this.request('initialize', { protocolVersion: this.protocolVersion,
      capabilities: {}, clientInfo: { name: 'Project Web Pilot', version: '0.2.0' } });
    if (init?.serverInfo?.name !== this.expectedServerName) {
      throw new RuntimeError('MCP_SERVER_MISMATCH', 'Локальный адрес занят другим MCP-сервером.');
    }
    this.protocolVersion = init.protocolVersion;
    await this.request('notifications/initialized');
    const names = [];
    let cursor;
    for (let page = 0; page < 8; page++) {
      const result = await this.request('tools/list', cursor ? { cursor } : {});
      if (!Array.isArray(result?.tools)) throw new RuntimeError('MCP_TOOLS_INVALID', 'MCP не вернул список инструментов.');
      names.push(...result.tools.map(tool => tool.name));
      cursor = result.nextCursor;
      if (!cursor) break;
    }
    const missing = requiredTools.filter(name => !names.includes(name));
    if (missing.length) {
      throw new RuntimeError('MCP_TOOLS_MISSING', 'В подключении отсутствуют: ' + missing.join(', ') + '. Нужен актуальный MCP.');
    }
    this.ready = { serverName: init.serverInfo.name, toolCount: names.length, protocolVersion: this.protocolVersion };
    return this.ready;
  }

  async loadContext(workspace) {
    if (!path.isAbsolute(workspace)) throw new RuntimeError('MCP_CONTEXT_REQUIRED', 'Не выбран проект.');
    await this.initialize();
    const result = await this.request('tools/call', { name: 'workflow_context_recover', arguments: { workspace } });
    if (result?.isError) throw new RuntimeError('MCP_CONTEXT_ERROR', 'MCP не смог получить полный контекст проекта. Проверьте выбранную папку и версию локального Codex runtime.');
    let data = result?.structuredContent;
    if (data?.result && !data.workspace) data = data.result;
    if (!data?.workspace) {
      try { data = JSON.parse(result?.content?.find(item => item.type === 'text')?.text ?? ''); } catch {
        throw new RuntimeError('MCP_CONTEXT_INVALID', 'Получен непонятный ответ с контекстом.');
      }
    }
    return validateContextPacket(data, workspace);
  }

}

export async function findRuntimeFolder(input, { platform = process.platform } = {}) {
  if (!isAbsolutePlatformPath(input, platform)) throw new RuntimeError('RUNTIME_PATH_REQUIRED', 'Выберите папку локального Codex runtime.');
  for (const candidate of runtimeFolderCandidates(input, platform)) {
    try {
      const folder = await fs.realpath(candidate);
      const layout = runtimeLayout(folder, platform);
      await fs.access(layout.control);
      await fs.access(layout.python);
      return folder;
    } catch { /* Try the platform-specific source workspace inner folder. */ }
  }
  throw new RuntimeError('RUNTIME_NOT_FOUND', 'В выбранной папке не найден настроенный локальный Codex runtime.');
}

export class McpRuntime {
  constructor(folder, { execute = execFile, clientFactory = null, platform = process.platform,
    expectedServerName = platform === 'win32' ? 'Codex Local Windows' : 'Codex Local Mac', ensureRuntime = null, sessionPlans = new SessionPlans() } = {}) {
    this.folder = folder;
    this.sessionPlans = sessionPlans;
    this.execute = execute;
    this.expectedServerName = expectedServerName;
    this.clientFactory = clientFactory ?? (endpoint => new LocalMcpClient(endpoint, { expectedServerName: this.expectedServerName }));
    this.platform = platform;
    this.ensureRuntime = typeof ensureRuntime === 'function' ? ensureRuntime : null;
    this.client = null;
    this.controlFile = null;
    this.runtimePrepared = false;
    this.pending = null;
    this.lastStatus = null;
  }

  async control(command, { mcpOnly = false } = {}) {
    if (!['status', 'start'].includes(command)) throw new RuntimeError('RUNTIME_ACTION_DENIED', 'Эта операция не поддерживается оболочкой.');
    let runtimeFolder = this.folder;
    if (this.ensureRuntime && !this.runtimePrepared) {
      const ensured = await this.ensureRuntime();
      if (typeof ensured?.folder === 'string' && isAbsolutePlatformPath(ensured.folder, this.platform)) {
        runtimeFolder = ensured.folder;
        this.folder = ensured.folder;
      }
      this.controlFile = typeof ensured?.control === 'string' && isAbsolutePlatformPath(ensured.control, this.platform)
        ? ensured.control : null;
      this.runtimePrepared = true;
    }
    const folder = await findRuntimeFolder(runtimeFolder, { platform: this.platform });
    const layout = runtimeLayout(folder, this.platform);
    const controlFile = this.controlFile ?? layout.control;
    let output;
    try {
      const args = ['-B', controlFile, command, ...(command === 'start' && mcpOnly ? ['--mcp-only'] : [])];
      output = await this.execute(layout.python, args,
        { cwd: folder, timeout: command === 'start' ? 75000 : 12000, maxBuffer: 1024 * 1024,
          env: { ...process.env, PYTHONDONTWRITEBYTECODE: '1',
            ...(this.controlFile ? { WEB_PILOT_RUNTIME_ROOT: folder } : {}) } });
    } catch (error) {
      let message = 'Не удалось запустить локальные инструменты. Проверьте локальный Codex runtime.';
      try { message = JSON.parse(error.stderr).error ?? message; } catch { /* Keep a bounded public error. */ }
      throw new RuntimeError('RUNTIME_COMMAND_FAILED', message);
    }
    let status;
    try { status = JSON.parse(output.stdout); } catch {
      throw new RuntimeError('RUNTIME_STATUS_INVALID', 'Служба вернула непонятный статус.');
    }
    if (!status?.mcp || !status?.tunnel || !status.mcp_url) throw new RuntimeError('RUNTIME_STATUS_INVALID', 'Служба вернула неполный статус.');
    validateEndpoint(status.mcp_url);
    for (const service of [status.mcp, status.tunnel]) {
      if (service.running && !service.owned) throw new RuntimeError('RUNTIME_FOREIGN_PROCESS', 'Порт или процесс занят другой службой; автоматический запуск остановлен.');
    }
    this.lastStatus = status;
    return status;
  }

  ensure() {
    if (this.pending) return this.pending;
    this.pending = this.prepare().finally(() => { this.pending = null; });
    return this.pending;
  }

  async prepare() {
    let status = await this.control('status');
    if (!status.tunnel.configured) {
      // First-time bootstrap still brings the local MCP up; only tunnel credentials require user action.
      if (!status.mcp.ready) status = await this.control('start', { mcpOnly: true });
      throw new RuntimeError('TUNNEL_NOT_CONFIGURED', 'Локальный MCP готов. Один раз настройте Secure MCP Tunnel в локальном runtime; ключ не передаётся Web Pilot.');
    }
    if (!status.mcp.ready || !status.tunnel.ready) status = await this.control('start');
    if (!status.mcp.ready || !status.mcp.owned || !status.tunnel.ready || !status.tunnel.owned) {
      throw new RuntimeError('RUNTIME_NOT_READY', 'Локальные инструменты или подключение ещё не готовы.');
    }
    // A fresh session also recovers after a separately restarted MCP server.
    this.client = this.clientFactory(status.mcp_url);
    const connection = await this.client.initialize();
    return { ...status, connection };
  }

  async loadContext(workspace, selection = {}) {
    if (selection.sessionId) return validateContextPacket(await this.sessionPlans.loadContext(workspace, selection), workspace, selection);
    if (!this.client) await this.ensure();
    return this.client.loadContext(workspace);
  }
}
