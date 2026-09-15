import { createHash } from 'node:crypto';
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';

export const TOKEN_ENCODING = 'o200k_base';
let tokenizer;

// Local rendering only: no network requests, cookies, composer changes or model calls.
export function readSessionMessages() {
  const selector = '[data-message-author-role="user"],[data-message-author-role="assistant"],[data-testid="user-message"],[data-testid="assistant-message"]';
  const elements = [...document.querySelectorAll(selector)]
    .filter(element => !element.parentElement?.closest(selector));
  const messages = [];
  const seen = new Set();
  for (const element of elements) {
    const role = element.getAttribute('data-message-author-role')
      ?? (element.getAttribute('data-testid') === 'user-message' ? 'user' : 'assistant');
    const identified = element.closest('[data-message-id]') ?? element.querySelector('[data-message-id]');
    const turn = element.closest('[data-testid^="conversation-turn-"]');
    const identity = identified?.getAttribute('data-message-id') ?? turn?.getAttribute('data-testid');
    // Never invent content-based or DOM-position IDs: streaming and virtualization change both.
    if (!identity || identity.length > 240) continue;
    const id = role + ':' + identity;
    if (seen.has(id)) continue;
    const content = element.cloneNode(true);
    for (const control of content.querySelectorAll('button,[role="button"],script,style,svg,textarea,input,[aria-hidden="true"]')) control.remove();
    for (const br of content.querySelectorAll('br')) br.replaceWith('\n');
    for (const block of content.querySelectorAll('p,pre,li,h1,h2,h3,h4,h5,h6,blockquote')) block.append('\n');
    const text = (content.textContent ?? '').replace(/\r\n/g, '\n').trim();
    if (!text) continue;
    seen.add(id);
    messages.push({ id, text });
  }
  return { url: location.href, messages };
}

export function validTokenEstimate(value) {
  return !!value && value.encoding === TOKEN_ENCODING && Number.isSafeInteger(value.total) && value.total >= 0
    && (value.coverage == null || ['partial', 'full-history'].includes(value.coverage))
    && Number.isFinite(value.updatedAt) && value.updatedAt > 0
    && value.messages && typeof value.messages === 'object' && !Array.isArray(value.messages)
    && Object.entries(value.messages).every(([id, entry]) => id.length > 0 && id.length <= 256
      && /^[a-f0-9]{64}$/.test(entry?.digest) && Number.isSafeInteger(entry.tokens) && entry.tokens >= 0)
    && Object.values(value.messages).reduce((sum, entry) => sum + entry.tokens, 0) === value.total;
}

export async function estimateMessageTokens(messages, previous = null, now = Date.now(), { complete = false } = {}) {
  if (!Array.isArray(messages)) return null;
  const entries = new Map(validTokenEstimate(previous) ? Object.entries(previous.messages) : []);
  let changed = complete && previous?.coverage !== 'full-history';
  if (complete) {
    const ids = new Set(messages.map(message => message?.id));
    for (const id of entries.keys()) if (!ids.has(id)) { entries.delete(id); changed = true; }
  }
  for (const message of messages) {
    if (typeof message?.id !== 'string' || !message.id || message.id.length > 256
        || typeof message.text !== 'string' || !message.text) continue;
    const digest = createHash('sha256').update(message.text).digest('hex');
    if (entries.get(message.id)?.digest === digest) continue;
    if (!tokenizer) {
      const [{ Tiktoken }, { default: ranks }] = await Promise.all([
        import('js-tiktoken/lite'), import('js-tiktoken/ranks/o200k_base'),
      ]);
      tokenizer = new Tiktoken(ranks);
    }
    // Literal special-token-looking text is ordinary chat content.
    const tokens = tokenizer.encode(message.text, [], []).length;
    entries.set(message.id, { digest, tokens });
    changed = true;
  }
  if (!changed) return null;
  return { encoding: TOKEN_ENCODING, coverage: complete ? 'full-history' : 'partial', total: [...entries.values()].reduce((sum, entry) => sum + entry.tokens, 0),
    messages: Object.fromEntries(entries), updatedAt: now };
}

// Large recovery packets are tokenized off the Electron main thread.
export class SessionTokenCounter {
  constructor() { this.worker = null; this.pending = new Map(); this.serial = 0; }
  estimate(messages, previous, options = {}) {
    if (!this.worker) {
      const worker = new Worker(new URL(import.meta.url), { workerData: { sessionTokenCounter: true } });
      this.worker = worker;
      worker.on('message', result => {
        const pending = this.pending.get(result.id);
        if (!pending) return;
        this.pending.delete(result.id);
        if (!this.pending.size) worker.unref();
        if (result.error) pending.reject(new Error(result.error));
        else pending.resolve(result.estimate);
      });
      const fail = error => {
        if (this.worker !== worker) return;
        this.worker = null;
        for (const pending of this.pending.values()) pending.reject(error);
        this.pending.clear();
      };
      worker.on('error', fail);
      worker.on('exit', () => fail(new Error('Token counter stopped')));
      worker.unref();
    }
    const id = ++this.serial;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.worker.ref();
      this.worker.postMessage({ id, messages, previous, options });
    });
  }
  async close() {
    const worker = this.worker;
    this.worker = null;
    for (const pending of this.pending.values()) pending.reject(new Error('Token counter closed'));
    this.pending.clear();
    if (worker) await worker.terminate();
  }
}

if (!isMainThread && workerData?.sessionTokenCounter) {
  parentPort.on('message', async ({ id, messages, previous, options }) => {
    try { parentPort.postMessage({ id, estimate: await estimateMessageTokens(messages, previous, Date.now(), options) }); }
    catch (error) { parentPort.postMessage({ id, error: String(error.message) }); }
  });
}
