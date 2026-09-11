import { execFile as execFileCallback } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs/promises';
import path from 'node:path';

const execFile = promisify(execFileCallback);
const requiredTools = ['bridge_status', 'workflow_context_recover', 'workflow_context_ack', 'workflow_context_status'];

export class RuntimeError extends Error {
  constructor(code, message) { super(message); this.code = code; }
}

export function validateEndpoint(value) {
  let url;
  try { url = new URL(value); } catch { throw new RuntimeError('MCP_URL_INVALID', 'Неверный адрес локальных инструментов.'); }
  if (url.protocol !== 'http:' || url.hostname !== '127.0.0.1' || url.pathname !== '/mcp'
      || url.username || url.password || url.search || url.hash) {
    throw new RuntimeError('MCP_URL_INVALID', 'Инструменты должны быть доступны локально на этом Mac.');
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
  constructor(endpoint, { fetchImpl = globalThis.fetch, timeoutMs = 10000 } = {}) {
    this.endpoint = validateEndpoint(endpoint);
    this.fetch = fetchImpl;
    this.timeoutMs = timeoutMs;
    this.sessionId = null;
    this.protocolVersion = '2025-03-26';
    this.sequence = 0;
    this.ready = null;
  }

  async request(method, params = {}) {
    if (!['initialize', 'notifications/initialized', 'tools/list', 'tools/call'].includes(method)
        || (method === 'tools/call' && params.name !== 'workflow_context_status')) {
      throw new RuntimeError('MCP_READ_ONLY', 'Оболочка может только читать подтверждение контекста.');
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
        signal: AbortSignal.timeout(this.timeoutMs), redirect: 'error' });
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
      capabilities: {}, clientInfo: { name: 'Project Web Pilot', version: '0.1.0' } });
    if (init?.serverInfo?.name !== 'Codex Local Mac') {
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

  async contextStatus(workspace, sessionId) {
    if (!path.isAbsolute(workspace) || typeof sessionId !== 'string' || !sessionId) throw new RuntimeError('MCP_CONTEXT_REQUIRED', 'Не выбраны проект и сессия.');
    await this.initialize();
    const result = await this.request('tools/call', { name: 'workflow_context_status',
      arguments: { workspace, session_id: sessionId } });
    if (result?.isError) throw new RuntimeError('MCP_STATUS_ERROR', 'MCP не смог прочитать состояние выбранного проекта.');
    let data = result?.structuredContent;
    if (data?.result && !data.workspace) data = data.result;
    if (!data?.workspace) {
      try { data = JSON.parse(result?.content?.find(item => item.type === 'text')?.text ?? ''); } catch {
        throw new RuntimeError('MCP_STATUS_INVALID', 'Получен непонятный ответ проверки контекста.');
      }
    }
    if (data.workspace !== workspace || data.session_id !== sessionId) throw new RuntimeError('MCP_CONTEXT_MISMATCH', 'Получен статус другого проекта или чата.');
    return data;
  }
}

export async function findRuntimeFolder(input) {
  if (typeof input !== 'string' || !path.isAbsolute(input)) throw new RuntimeError('RUNTIME_PATH_REQUIRED', 'Выберите папку Codex Local Mac.');
  for (const candidate of [input, path.join(input, 'mac-codex-local')]) {
    try {
      const folder = await fs.realpath(candidate);
      await fs.access(path.join(folder, 'control.py'));
      await fs.access(path.join(folder, '.venv/bin/python3'));
      return folder;
    } catch { /* Try the source workspace's inner folder. */ }
  }
  throw new RuntimeError('RUNTIME_NOT_FOUND', 'В выбранной папке не найден настроенный Codex Local Mac.');
}

export class McpRuntime {
  constructor(folder, { execute = execFile, clientFactory = endpoint => new LocalMcpClient(endpoint) } = {}) {
    this.folder = folder;
    this.execute = execute;
    this.clientFactory = clientFactory;
    this.client = null;
    this.pending = null;
    this.lastStatus = null;
  }

  async control(command) {
    if (!['status', 'start'].includes(command)) throw new RuntimeError('RUNTIME_ACTION_DENIED', 'Эта операция не поддерживается оболочкой.');
    const folder = await findRuntimeFolder(this.folder);
    let output;
    try {
      output = await this.execute(path.join(folder, '.venv/bin/python3'), ['-B', path.join(folder, 'control.py'), command],
        { cwd: folder, timeout: command === 'start' ? 75000 : 12000, maxBuffer: 1024 * 1024,
          env: { ...process.env, PYTHONDONTWRITEBYTECODE: '1' } });
    } catch (error) {
      let message = 'Не удалось запустить локальные инструменты. Проверьте Codex Local Mac.';
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
    if (!status.tunnel.configured) throw new RuntimeError('TUNNEL_NOT_CONFIGURED', 'Подключение Codex Local Mac к ChatGPT ещё не настроено.');
    if (!status.mcp.ready || !status.tunnel.ready) status = await this.control('start');
    if (!status.mcp.ready || !status.mcp.owned || !status.tunnel.ready || !status.tunnel.owned) {
      throw new RuntimeError('RUNTIME_NOT_READY', 'Локальные инструменты или подключение ещё не готовы.');
    }
    // A fresh session also recovers after a separately restarted MCP server.
    this.client = this.clientFactory(status.mcp_url);
    const connection = await this.client.initialize();
    return { ...status, connection };
  }

  async contextStatus(workspace, sessionId) {
    if (!this.client) await this.ensure();
    return this.client.contextStatus(workspace, sessionId);
  }
}
