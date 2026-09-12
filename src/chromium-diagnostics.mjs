import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';

const SAFE_SIGNAL_KEYS = new Set(['type', 'event', 'event_type', 'eventType', 'method', 'kind', 'op', 'action']);
const SAFE_IDENTIFIER = /^[A-Za-z0-9_.:/-]{1,96}$/;
const LONG_PATH_ID = /^[A-Za-z0-9_-]{20,}$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function redactPathname(pathname) {
  return pathname.split('/').map(segment => (UUID.test(segment) || LONG_PATH_ID.test(segment)) ? ':id' : segment).join('/');
}

export function safeUrl(input) {
  try {
    const url = new URL(input);
    return {
      origin: url.origin === 'null' ? `${url.protocol}//` : url.origin,
      path: redactPathname(url.pathname),
      queryKeys: [...new Set([...url.searchParams.keys()])].sort(),
    };
  } catch {
    return { invalid: true };
  }
}

function safeSignal(value) {
  return typeof value === 'string' && SAFE_IDENTIFIER.test(value) ? value : null;
}

function collectSignals(value, out, depth = 0, budget = { left: 80 }) {
  if (!value || typeof value !== 'object' || depth > 3 || budget.left-- <= 0) return;
  if (Array.isArray(value)) {
    for (const item of value.slice(0, 12)) collectSignals(item, out, depth + 1, budget);
    return;
  }
  for (const [key, item] of Object.entries(value)) {
    if (SAFE_SIGNAL_KEYS.has(key)) {
      const signal = safeSignal(item);
      if (signal) out.add(`${key}=${signal}`);
    }
    if (item && typeof item === 'object') collectSignals(item, out, depth + 1, budget);
  }
}

function structuralJson(text) {
  try {
    const value = JSON.parse(text);
    const signals = new Set();
    collectSignals(value, signals);
    return {
      format: 'json',
      keys: value && typeof value === 'object' && !Array.isArray(value) ? Object.keys(value).sort().slice(0, 40) : [],
      signals: [...signals].sort(),
    };
  } catch {
    return null;
  }
}

function structuralSse(text) {
  if (!/(^|\n)(event|data):/.test(text)) return null;
  const signals = new Set();
  for (const line of text.split(/\r?\n/).slice(0, 100)) {
    if (line.startsWith('event:')) {
      const event = safeSignal(line.slice(6).trim());
      if (event) signals.add(`event=${event}`);
    } else if (line.startsWith('data:')) {
      const meta = structuralJson(line.slice(5).trim());
      for (const signal of meta?.signals ?? []) signals.add(signal);
    }
  }
  return { format: 'sse', keys: [], signals: [...signals].sort() };
}

export function payloadMetadata(data) {
  const text = typeof data === 'string' ? data : Buffer.isBuffer(data) ? data.toString('utf8') : String(data ?? '');
  const structural = structuralJson(text) ?? structuralSse(text) ?? { format: 'opaque', keys: [], signals: [] };
  return {
    bytes: Buffer.byteLength(text),
    sha256: createHash('sha256').update(text).digest('hex'),
    ...structural,
  };
}

export class DiagnosticJsonl {
  constructor(file, { maxBytes = 25 * 1024 * 1024, now = () => new Date(), sessionId = randomUUID() } = {}) {
    this.file = file;
    this.maxBytes = maxBytes;
    this.now = now;
    this.sessionId = sessionId;
    this.size = 0;
    this.sequence = 0;
    this.tail = Promise.resolve();
  }

  async init() {
    await fs.mkdir(path.dirname(this.file), { recursive: true, mode: 0o700 });
    this.size = (await fs.stat(this.file).catch(() => null))?.size ?? 0;
  }

  record(source, event, fields = {}) {
    const entry = { ts: this.now().toISOString(), seq: ++this.sequence, diagnosticSession: this.sessionId, source, event, ...fields };
    const line = JSON.stringify(entry) + '\n';
    this.tail = this.tail.then(() => this.#append(line)).catch(() => {});
    return entry;
  }

  async #append(line) {
    const bytes = Buffer.byteLength(line);
    if (this.size > 0 && this.size + bytes > this.maxBytes) await this.#rotate();
    await fs.appendFile(this.file, line, { encoding: 'utf8', mode: 0o600 });
    this.size += bytes;
  }

  async #rotate() {
    await fs.rm(this.file + '.1', { force: true });
    await fs.rename(this.file, this.file + '.1').catch(error => { if (error.code !== 'ENOENT') throw error; });
    this.size = 0;
  }

  async flush() { await this.tail; }
}

const IGNORED_CDP = new Set([
  'Network.dataReceived', 'Network.requestServedFromCache', 'Network.resourceChangedPriority',
  'Page.frameRequestedNavigation', 'Page.frameStartedLoading', 'Page.frameStoppedLoading',
]);

export class ChromiumDiagnostics {
  constructor(contents, { file, maxBytes, sampleIntervalMs = 5000, allowFixture = false } = {}) {
    if (!contents || !file) throw new TypeError('ChromiumDiagnostics requires contents and file');
    this.contents = contents;
    this.allowFixture = allowFixture;
    this.sampleIntervalMs = sampleIntervalMs;
    this.log = new DiagnosticJsonl(file, { maxBytes });
    this.handlers = [];
    this.sampleTimer = null;
    this.attachedByUs = false;
    this.started = false;
    this.onDebuggerMessage = this.onDebuggerMessage.bind(this);
    this.onDebuggerDetach = this.onDebuggerDetach.bind(this);
  }

  async start(metadata = {}) {
    if (this.started) return;
    this.started = true;
    await this.log.init();
    this.log.record('diagnostics', 'session-start', metadata);
    this.#listenNative();
    await this.#attachDebugger();
    this.sampleTimer = setInterval(() => { void this.sampleDom(); }, this.sampleIntervalMs);
    this.sampleTimer.unref?.();
    await this.sampleDom();
  }

  #on(name, handler) {
    this.contents.on(name, handler);
    this.handlers.push([name, handler]);
  }

  #listenNative() {
    this.#on('did-start-loading', () => this.log.record('webContents', 'did-start-loading', { url: safeUrl(this.contents.getURL()) }));
    this.#on('did-stop-loading', () => this.log.record('webContents', 'did-stop-loading', { url: safeUrl(this.contents.getURL()) }));
    this.#on('did-finish-load', () => this.log.record('webContents', 'did-finish-load', { url: safeUrl(this.contents.getURL()) }));
    this.#on('did-navigate', (_event, url) => this.log.record('webContents', 'did-navigate', { url: safeUrl(url) }));
    this.#on('did-navigate-in-page', (_event, url, isMainFrame) => this.log.record('webContents', 'did-navigate-in-page', { url: safeUrl(url), isMainFrame }));
    this.#on('unresponsive', () => this.log.record('webContents', 'unresponsive'));
    this.#on('responsive', () => this.log.record('webContents', 'responsive'));
    this.#on('render-process-gone', (_event, details) => this.log.record('webContents', 'render-process-gone', { reason: details?.reason, exitCode: details?.exitCode }));
  }

  async #attachDebugger() {
    const debug = this.contents.debugger;
    try {
      if (debug.isAttached()) {
        this.log.record('cdp', 'attach-skipped', { reason: 'already-attached' });
        return;
      }
      debug.attach('1.3');
      this.attachedByUs = true;
      debug.on('message', this.onDebuggerMessage);
      debug.on('detach', this.onDebuggerDetach);
      await Promise.all(['Network.enable', 'Page.enable', 'Log.enable'].map(command => debug.sendCommand(command)));
      await debug.sendCommand('Page.setLifecycleEventsEnabled', { enabled: true }).catch(() => {});
      this.log.record('cdp', 'attached', { protocolVersion: '1.3' });
    } catch (error) {
      this.log.record('cdp', 'attach-failed', { name: error?.name ?? 'Error', code: error?.code ?? null });
    }
  }

  onDebuggerDetach(_event, reason) {
    this.attachedByUs = false;
    this.log.record('cdp', 'detached', { reason: safeSignal(reason) ?? 'unknown' });
  }

  onDebuggerMessage(_event, method, params = {}) {
    const base = { method };
    if (method === 'Network.requestWillBeSent') {
      return this.log.record('cdp', 'request', { ...base, requestId: params.requestId, requestMethod: params.request?.method,
        resourceType: params.type, url: safeUrl(params.request?.url) });
    }
    if (method === 'Network.responseReceived') {
      return this.log.record('cdp', 'response', { ...base, requestId: params.requestId, resourceType: params.type,
        status: params.response?.status, mimeType: params.response?.mimeType, protocol: params.response?.protocol,
        url: safeUrl(params.response?.url) });
    }
    if (method === 'Network.loadingFinished') {
      return this.log.record('cdp', 'loading-finished', { ...base, requestId: params.requestId, encodedDataLength: params.encodedDataLength });
    }
    if (method === 'Network.loadingFailed') {
      return this.log.record('cdp', 'loading-failed', { ...base, requestId: params.requestId, errorType: safeSignal(params.type) ?? null,
        canceled: !!params.canceled, blockedReason: safeSignal(params.blockedReason) ?? null });
    }
    if (method === 'Network.webSocketCreated') {
      return this.log.record('cdp', 'websocket-created', { ...base, requestId: params.requestId, url: safeUrl(params.url) });
    }
    if (method === 'Network.webSocketClosed') {
      return this.log.record('cdp', 'websocket-closed', { ...base, requestId: params.requestId });
    }
    if (method === 'Network.webSocketFrameReceived' || method === 'Network.webSocketFrameSent') {
      return this.log.record('cdp', method.endsWith('Received') ? 'websocket-frame-received' : 'websocket-frame-sent', {
        ...base, requestId: params.requestId, opcode: params.response?.opcode, payload: payloadMetadata(params.response?.payloadData ?? ''),
      });
    }
    if (method === 'Network.eventSourceMessageReceived') {
      return this.log.record('cdp', 'eventsource-message', { ...base, requestId: params.requestId,
        eventName: safeSignal(params.eventName) ?? null, eventIdPresent: !!params.eventId, payload: payloadMetadata(params.data ?? '') });
    }
    if (method === 'Page.lifecycleEvent') {
      return this.log.record('cdp', 'lifecycle', { ...base, name: safeSignal(params.name) ?? null, frameId: params.frameId });
    }
    if (method === 'Log.entryAdded') {
      const entry = params.entry ?? {};
      return this.log.record('cdp', 'browser-log', { ...base, source: safeSignal(entry.source) ?? null,
        level: safeSignal(entry.level) ?? null, url: safeUrl(entry.url), lineNumber: entry.lineNumber });
    }
    if (!IGNORED_CDP.has(method)) this.log.record('cdp', 'event', base);
  }

  async sampleDom() {
    if (!this.started || this.contents.isDestroyed?.()) return;
    const current = this.contents.getURL();
    let url;
    try { url = new URL(current); } catch { return; }
    if (!(url.hostname === 'chatgpt.com' && url.protocol === 'https:') && !this.allowFixture) return;
    try {
      const sample = await this.contents.executeJavaScript(`(() => ({
        userMessages: document.querySelectorAll('[data-message-author-role="user"],[data-testid="user-message"]').length,
        assistantMessages: document.querySelectorAll('[data-message-author-role="assistant"],[data-testid="assistant-message"]').length,
        busy: !!document.querySelector('[data-testid="stop-button"],button[aria-label="Stop streaming"],button[aria-label="Остановить генерацию"],button[aria-label="Stop generating"]'),
        composer: !!document.querySelector('#prompt-textarea,textarea[data-testid="prompt-textarea"],[data-testid="composer-text-input"],[contenteditable="true"][role="textbox"]'),
        visibility: document.visibilityState
      }))()`, false);
      this.log.record('dom', 'pulse', { url: safeUrl(current), ...sample });
    } catch (error) {
      this.log.record('dom', 'pulse-failed', { name: error?.name ?? 'Error' });
    }
  }

  async stop() {
    if (!this.started) return;
    this.started = false;
    if (this.sampleTimer) clearInterval(this.sampleTimer);
    this.sampleTimer = null;
    for (const [name, handler] of this.handlers) this.contents.removeListener(name, handler);
    this.handlers = [];
    const debug = this.contents.debugger;
    if (this.attachedByUs && debug.isAttached()) {
      debug.removeListener('message', this.onDebuggerMessage);
      debug.removeListener('detach', this.onDebuggerDetach);
      try { debug.detach(); } catch {}
      this.attachedByUs = false;
    }
    this.log.record('diagnostics', 'session-stop');
    await this.log.flush();
  }

  async flush() { await this.log.flush(); }
}
