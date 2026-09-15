import { normalizeChatUrl } from './workspace-session.mjs';

const MAX_BYTES = 64 * 1024 * 1024;
const MAX_PAGES = 500;
const MAX_MESSAGES = 100000;
const TEXT_ROLES = new Set(['user', 'assistant', 'tool']);
const AUTH_HEADERS = new Set(['authorization', 'chatgpt-account-id', 'oai-device-id', 'oai-language', 'accept']);

function problem(code) { return Object.assign(new Error(code), { code }); }

export function historyRequest(raw, activeUrl) {
  try {
    const url = new URL(raw);
    const chat = new URL(normalizeChatUrl(activeUrl));
    const id = chat.pathname.split('/').filter(Boolean).at(-1);
    if (url.origin !== 'https://chatgpt.com' || chat.origin !== url.origin
        || url.pathname !== '/backend-api/conversations/' + id || !id || id.startsWith('WEB:')) return null;
    // Do not copy arbitrary query values or credentials into URLs.
    const turns = Number(url.searchParams.get('num_turns'));
    return { id, url: url.href, turns: Number.isInteger(turns) && turns > 0 && turns <= 100 ? turns : 20 };
  } catch { return null; }
}

function pageData(value) {
  if (!value || !Array.isArray(value.messages) || !value.page_info
      || typeof value.page_info.has_previous_page !== 'boolean') throw problem('HISTORY_SCHEMA');
  const previous = value.page_info.has_previous_page;
  const cursor = value.page_info.start_cursor;
  if (previous && (typeof cursor !== 'string' || !cursor || cursor.length > 4096)) throw problem('HISTORY_CURSOR');
  return { messages: value.messages, cursor: previous ? cursor : null };
}

function textMessage(message) {
  if (!message || typeof message.id !== 'string' || !message.id || message.id.length > 240) throw problem('HISTORY_MESSAGE');
  const role = message.author?.role;
  if (typeof role !== 'string') throw problem('HISTORY_MESSAGE');
  if (!TEXT_ROLES.has(role)) return null;
  const content = message.content;
  // Only explicit text fields, never JSON-stringify metadata, images or signed URLs.
  const pieces = [];
  if (Array.isArray(content?.parts)) {
    for (const part of content.parts) {
      if (typeof part === 'string') pieces.push(part);
      else if (part && typeof part.text === 'string') pieces.push(part.text);
    }
  } else if (typeof content?.text === 'string') pieces.push(content.text);
  const text = pieces.join('\n');
  return text ? { id: role + ':' + message.id, text } : null;
}

export async function collectHistory(first, fetchPage, { signal, onProgress = () => {} } = {}) {
  const messages = new Map();
  const cursors = new Set();
  let value = first;
  let pages = 0;
  let bytes = 0;
  while (true) {
    if (signal?.aborted) throw problem('HISTORY_CANCELLED');
    if (++pages > MAX_PAGES) throw problem('HISTORY_LIMIT');
    bytes += Buffer.byteLength(JSON.stringify(value));
    if (bytes > MAX_BYTES) throw problem('HISTORY_LIMIT');
    const page = pageData(value);
    for (const raw of page.messages) {
      const message = textMessage(raw);
      // Newest page wins if server pages overlap.
      if (message && !messages.has(message.id)) messages.set(message.id, message);
    }
    if (messages.size > MAX_MESSAGES) throw problem('HISTORY_LIMIT');
    onProgress({ pages, messageCount: messages.size });
    if (page.cursor === null) return { messages: [...messages.values()], pages, complete: true };
    if (cursors.has(page.cursor)) throw problem('HISTORY_CURSOR_LOOP');
    cursors.add(page.cursor);
    value = await fetchPage(page.cursor, signal);
  }
}

// Observe the app's own authenticated GET; credentials remain in memory and are
// reused only for read-only pagination of that exact selected conversation.
export class ConversationHistory {
  constructor(contents, { activeUrl, onChange = () => {} }) {
    this.contents = contents;
    this.activeUrl = activeUrl;
    this.onChange = onChange;
    this.requests = new Map();
    this.serial = 0;
    this.closed = false;
    this.state = { status: 'waiting', pages: 0, messageCount: 0 };
    this.onMessage = this.onMessage.bind(this);
    contents.debugger.on('message', this.onMessage);
  }
  current(url) { return !this.closed && normalizeChatUrl(this.activeUrl()) === url; }
  view() {
    return this.current(this.state.url) ? { status: this.state.status, pages: this.state.pages,
      messageCount: this.state.messageCount, error: this.state.error ?? null } : { status: 'waiting', pages: 0, messageCount: 0 };
  }
  set(state) { this.state = state; this.onChange(); }
  reset() {
    this.serial++;
    this.abort?.abort();
    this.abort = null;
    this.requests.clear();
    this.snapshot = null;
    this.set({ status: 'waiting', pages: 0, messageCount: 0 });
  }
  close() { this.reset(); this.closed = true; this.contents.debugger.removeListener('message', this.onMessage); }
  pendingSnapshot() {
    return this.snapshot && this.current(this.snapshot.url) ? this.snapshot : null;
  }
  acknowledge(revision) { if (this.snapshot?.revision === revision) this.snapshot = null; }

  onMessage(_event, method, params = {}) {
    if (this.closed) return;
    if (method === 'Network.requestWillBeSent') {
      const url = normalizeChatUrl(this.activeUrl());
      const request = params.request;
      const match = request?.method === 'GET' && historyRequest(request.url, url);
      if (!match) return;
      const headers = {};
      for (const [key, value] of Object.entries(request.headers ?? {})) {
        if (AUTH_HEADERS.has(key.toLowerCase()) && typeof value === 'string') headers[key] = value;
      }
      if (this.requests.size >= 32) this.requests.delete(this.requests.keys().next().value);
      this.requests.set(params.requestId, { ...match, chatUrl: url, headers, order: ++this.serial });
    } else if (method === 'Network.responseReceived') {
      const request = this.requests.get(params.requestId);
      if (request) request.ok = params.response?.status === 200
        && params.response?.mimeType?.split(';')[0] === 'application/json'
        && !!historyRequest(params.response.url, request.chatUrl);
    } else if (method === 'Network.loadingFailed') {
      this.requests.delete(params.requestId);
    } else if (method === 'Network.loadingFinished') {
      const request = this.requests.get(params.requestId);
      if (!request) return;
      this.requests.delete(params.requestId);
      if (request.ok && request.order === this.serial && this.current(request.chatUrl)) void this.load(request, params.requestId);
    }
  }

  async load(request, requestId) {
    this.abort?.abort();
    const abort = new AbortController();
    this.abort = abort;
    const revision = request.order;
    const valid = () => !abort.signal.aborted && revision === this.serial && this.current(request.chatUrl);
    this.snapshot = null;
    this.set({ url: request.chatUrl, status: 'loading', pages: 0, messageCount: 0 });
    // Bound the entire job, including a stalled server.
    const timer = setTimeout(() => abort.abort(), 180000);
    timer.unref?.();
    try {
      const body = await this.contents.debugger.sendCommand('Network.getResponseBody', { requestId });
      if (!valid()) return;
      const text = body.base64Encoded ? Buffer.from(body.body, 'base64').toString('utf8') : body.body;
      if (typeof text !== 'string' || Buffer.byteLength(text) > MAX_BYTES) throw problem('HISTORY_LIMIT');
      let turns = 50;
      const fetchPage = async cursor => {
        if (!valid()) throw problem('HISTORY_CANCELLED');
        const url = new URL('https://chatgpt.com/backend-api/conversations/' + request.id + '/messages');
        url.searchParams.set('before', cursor);
        url.searchParams.set('include_has_versions', 'true');
        url.searchParams.set('num_turns', String(turns));
        const response = await this.contents.session.fetch(url.href, { method: 'GET', headers: request.headers,
          credentials: 'include', redirect: 'error', signal: abort.signal });
        if ((response.status === 400 || response.status === 422) && turns !== request.turns) {
          await response.body?.cancel();
          turns = request.turns;
          return fetchPage(cursor);
        }
        if (!response.ok) throw problem('HISTORY_HTTP_' + response.status);
        // Stream the response with an upper bound rather than retaining an unlimited body.
        const reader = response.body.getReader();
        const chunks = [];
        let size = 0;
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            size += value.byteLength;
            if (size > MAX_BYTES) throw problem('HISTORY_LIMIT');
            chunks.push(Buffer.from(value));
          }
        } finally { await reader.cancel().catch(() => {}); }
        return JSON.parse(Buffer.concat(chunks).toString('utf8'));
      };
      const result = await collectHistory(JSON.parse(text), fetchPage, { signal: abort.signal,
        onProgress: progress => { if (valid()) this.set({ url: request.chatUrl, status: 'loading', ...progress }); } });
      if (!valid()) return;
      this.snapshot = { ...result, url: request.chatUrl, revision };
      this.set({ url: request.chatUrl, status: 'ready', pages: result.pages, messageCount: result.messages.length });
    } catch (error) {
      if (revision === this.serial && this.current(request.chatUrl)) {
        this.set({ url: request.chatUrl, status: 'error', pages: this.state.pages, messageCount: this.state.messageCount,
          error: abort.signal.aborted ? 'HISTORY_TIMEOUT' : /^HISTORY_[A-Z0-9_]+$/.test(error.code ?? '') ? error.code : 'HISTORY_UNAVAILABLE' });
      }
    } finally { clearTimeout(timer); request.headers = {}; }
  }
}
