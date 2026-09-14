const pause = ms => new Promise(resolve => setTimeout(resolve, ms));

export class ComposerError extends Error {
  constructor(code, message) { super(message); this.code = code; }
}

// Runs only in the visible ChatGPT document. No page internals, cookies or API requests.
export function pageOperation({ action = 'inspect', text = '', requestId = '', expectedExperience = null } = {}) {
  const visible = element => !!element && !element.hidden && element.getAttribute('aria-hidden') !== 'true'
    && getComputedStyle(element).display !== 'none' && getComputedStyle(element).visibility !== 'hidden'
    && element.getClientRects().length > 0;
  const first = selector => [...document.querySelectorAll(selector)].find(visible);
  const editor = first('#prompt-textarea,textarea[data-testid="prompt-textarea"],[data-testid="composer-text-input"],[contenteditable="true"][role="textbox"]');
  const busy = !!first('[data-testid="stop-button"],button[aria-label="Stop streaming"],button[aria-label="Остановить генерацию"],button[aria-label="Stop generating"]');
  const login = !!first('[data-testid="login-button"],a[href="/auth/login"],a[href="https://chatgpt.com/auth/login"]');
  const draft = () => editor ? (editor.tagName === 'TEXTAREA' || editor.tagName === 'INPUT'
    ? editor.value : editor.innerText ?? editor.textContent ?? '') : '';
  const normalized = value => value.replace(/\r\n/g, '\n').replace(/\n+/g, '\n').replace(/\u00a0/g, ' ').trim();
  const messages = [...document.querySelectorAll('[data-message-author-role="user"],[data-testid="user-message"]')];
  const messageSeen = !!requestId && messages.some(message => (message.innerText ?? message.textContent ?? '').includes(requestId));
  const button = first('[data-testid="send-button"],button[aria-label="Send prompt"],button[aria-label="Send message"],button[aria-label="Отправить сообщение"],button[aria-label="Отправить"]')
    ?? [...(editor?.closest('form')?.querySelectorAll('button[type="submit"]') ?? [])].find(visible);
  const draftLength = normalized(draft()).length;
  const draftMatches = !!text && normalized(draft()) === normalized(text);
  const writable = !!editor && !editor.disabled && !editor.readOnly && editor.getAttribute('contenteditable') !== 'false';
  const sendEnabled = !!button && !button.disabled && button.getAttribute('aria-disabled') !== 'true';
  // Native ChatGPT toggle, verified in the production web bundle on 2026-09-14.
  // Restrict the fallback to the labelled surface group; never match message text or model names.
  let modeButtons = [...document.querySelectorAll('button[data-tpp-toggle-value]')].filter(visible);
  if (!modeButtons.length) {
    const group = first('[aria-label="Select chat surface"],[aria-label="Выберите режим чата"]');
    modeButtons = [...(group?.querySelectorAll('button') ?? [])].filter(visible);
  }
  const modeOf = element => {
    const value = element.getAttribute('data-tpp-toggle-value');
    if (value === 'chatgpt') return 'chat';
    if (value === 'work') return 'work';
    const label = (element.innerText ?? element.textContent ?? '').trim();
    return /^(Chat|Чат)$/.test(label) ? 'chat' : /^(Work|Работа)$/.test(label) ? 'work' : null;
  };
  const selectedModes = [...new Set(modeButtons.filter(element => element.getAttribute('data-state') === 'on'
    || element.getAttribute('aria-checked') === 'true' || element.getAttribute('aria-pressed') === 'true')
    .map(modeOf).filter(Boolean))];
  const experience = selectedModes.length === 1 ? selectedModes[0] : null;
  const result = { url: location.href, editorAvailable: !!editor, writable, login, busy,
    draftLength, draftMatches, sendEnabled, messageSeen, userMessageCount: messages.length, experience };
  if (action === 'inspect') return result;
  if (messageSeen) return { ...result, action: 'already-sent' };
  if (login || !writable) return { ...result, action: 'deferred', reason: 'LOGIN_REQUIRED' };
  if (busy) return { ...result, action: 'deferred', reason: 'GENERATION_ACTIVE' };
  if (expectedExperience) {
    const entry = location.pathname.replace(/\/+$/, '') || '/';
    const atEntrypoint = expectedExperience === 'chat' ? entry === '/'
      && !['work', 'tpp'].includes(new URLSearchParams(location.search).get('surface')) : entry === '/work';
    if (!atEntrypoint || messages.length) return { ...result, action: 'deferred', reason: 'CHAT_CHANGED' };
    if (action === 'select-experience') {
      if (experience === expectedExperience) return { ...result, action: 'experience-confirmed' };
      if (draftLength) return { ...result, action: 'deferred', reason: 'DRAFT_PRESENT' };
      const target = modeButtons.find(element => modeOf(element) === expectedExperience);
      if (!target || target.disabled || target.getAttribute('aria-disabled') === 'true') {
        return { ...result, action: 'deferred', reason: 'EXPERIENCE_UNCONFIRMED' };
      }
      target.click();
      // Confirmation requires a fresh observation after React processes the native click.
      return { ...result, action: 'experience-selecting' };
    }
    if (experience !== expectedExperience) return { ...result, action: 'deferred', reason: 'EXPERIENCE_UNCONFIRMED' };
  }
  if (action === 'fill') {
    if (draftLength && !draftMatches) return { ...result, action: 'deferred', reason: 'DRAFT_PRESENT' };
    if (draftMatches) return { ...result, action: 'filled' };
    editor.focus();
    if (editor.tagName === 'TEXTAREA') {
      Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set.call(editor, text);
      editor.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: text }));
      editor.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      const selection = getSelection();
      const range = document.createRange(); range.selectNodeContents(editor); range.collapse(false);
      selection.removeAllRanges(); selection.addRange(range);
      if (!document.execCommand('insertText', false, text)) return { ...result, action: 'deferred', reason: 'INSERT_FAILED' };
    }
    return { ...result, action: 'filled' };
  }
  if (action === 'send') {
    // Recheck in the same renderer turn as click, preserving any user edits.
    if (!draftMatches) return { ...result, action: 'deferred', reason: 'DRAFT_CHANGED' };
    if (!sendEnabled) return { ...result, action: 'deferred', reason: 'SEND_UNAVAILABLE' };
    button.click();
    return { ...result, action: 'clicked' };
  }
  throw new Error('INVALID_COMPOSER_ACTION');
}

export function pageScript(args) { return `(${pageOperation.toString()})(${JSON.stringify(args)})`; }

export class ChatGPTComposer {
  constructor(contents, { wait = pause, now = Date.now, settleMs = 200, timeoutMs = 12000,
    allowFixture = false } = {}) {
    this.contents = contents;
    this.wait = wait;
    this.now = now;
    this.settleMs = settleMs;
    this.timeoutMs = timeoutMs;
    this.allowFixture = allowFixture;
    this.inFlight = false;
  }

  async inspect({ text = '', requestId = '', action = 'inspect', expectedExperience = null } = {}) {
    const current = this.contents.getURL();
    let url;
    try { url = new URL(current); } catch { return { login: true, editorAvailable: false, url: current }; }
    const isChat = url.protocol === 'https:' && url.hostname === 'chatgpt.com';
    if (!isChat && !(this.allowFixture && url.protocol === 'file:')) {
      return { login: true, editorAvailable: false, url: current };
    }
    return this.contents.executeJavaScript(pageScript({ action, text, requestId, expectedExperience }), action !== 'inspect');
  }

  async sendUserMessage({ text, canContinue = () => true }) {
    if (this.inFlight) throw new ComposerError('SEND_IN_PROGRESS', 'Другая отправка ещё не завершилась.');
    if (typeof text !== 'string' || !text.trim()) throw new ComposerError('MESSAGE_INVALID', 'Не подготовлено пользовательское сообщение.');
    this.inFlight = true;
    let clicked = false;
    try {
      if (!canContinue()) return { state: 'cancelled' };
      let observation = await this.inspect({ text });
      const beforeCount = observation.userMessageCount ?? 0;
      if (observation.login || !observation.editorAvailable || !observation.writable) return { state: 'deferred', reason: 'LOGIN_REQUIRED', observation };
      if (observation.busy) return { state: 'deferred', reason: 'GENERATION_ACTIVE', observation };
      if (observation.draftLength) return { state: 'deferred', reason: 'DRAFT_PRESENT', observation };
      observation = await this.inspect({ action: 'fill', text });
      if (observation.action !== 'filled') return { state: 'deferred', reason: observation.reason ?? 'SEND_UNAVAILABLE', observation };
      await this.wait(this.settleMs);
      if (!canContinue()) return { state: 'cancelled' };
      observation = await this.inspect({ text });
      if (!observation.draftMatches || !observation.sendEnabled || observation.busy) {
        return { state: 'deferred', reason: observation.busy ? 'GENERATION_ACTIVE' : !observation.draftMatches ? 'DRAFT_CHANGED' : 'SEND_UNAVAILABLE', observation };
      }
      observation = await this.inspect({ action: 'send', text });
      if (observation.action !== 'clicked') return { state: 'deferred', reason: observation.reason ?? 'SEND_UNAVAILABLE', observation };
      clicked = true;
      const deadline = this.now() + this.timeoutMs;
      do {
        if (!canContinue()) return { state: 'unknown', reason: 'CHAT_CHANGED' };
        observation = await this.inspect();
        if ((observation.userMessageCount ?? 0) > beforeCount) return { state: 'sent', observation };
        await this.wait(this.settleMs);
      } while (this.now() < deadline);
      return { state: 'unknown', reason: 'SEND_NOT_OBSERVED' };
    } catch (error) {
      if (clicked) return { state: 'unknown', reason: 'PAGE_UNAVAILABLE' };
      throw error;
    } finally { this.inFlight = false; }
  }

  async deliver({ text, requestId, expectedExperience = null, canContinue = () => true, onBeforeSend = async () => {} }) {
    if (this.inFlight) throw new ComposerError('SEND_IN_PROGRESS', 'Другая отправка ещё не завершилась.');
    if (typeof text !== 'string' || !text || !requestId || !text.includes(requestId)) throw new ComposerError('MESSAGE_INVALID', 'Не подготовлено стартовое сообщение.');
    this.inFlight = true;
    let clicked = false;
    try {
      if (!canContinue()) return { state: 'cancelled' };
      let observation = await this.inspect({ text, requestId });
      if (observation.messageSeen) return { state: 'sent', recovered: true, observation };
      if (!canContinue()) return { state: 'cancelled' };
      observation = await this.inspect({ action: 'fill', text, requestId, expectedExperience });
      if (observation.action === 'already-sent') return { state: 'sent', recovered: true, observation };
      if (observation.action !== 'filled') return { state: 'deferred', reason: observation.reason ?? 'LOGIN_REQUIRED', observation };
      await this.wait(this.settleMs);
      if (!canContinue()) return { state: 'cancelled' };
      observation = await this.inspect({ text, requestId });
      if (!observation.draftMatches || !observation.sendEnabled || observation.busy) {
        return { state: 'deferred', reason: observation.busy ? 'GENERATION_ACTIVE' : !observation.draftMatches ? 'DRAFT_CHANGED' : 'SEND_UNAVAILABLE', observation };
      }
      // Persist an uncertain attempt BEFORE the click, so a crash never triggers a second send.
      await onBeforeSend();
      if (!canContinue()) return { state: 'cancelled' };
      observation = await this.inspect({ action: 'send', text, requestId, expectedExperience });
      if (observation.action === 'already-sent') return { state: 'sent', recovered: true, observation };
      if (observation.action !== 'clicked') return { state: 'deferred', reason: observation.reason, observation };
      clicked = true;
      const deadline = this.now() + this.timeoutMs;
      do {
        if (!canContinue()) return { state: 'unknown', reason: 'CHAT_CHANGED' };
        observation = await this.inspect({ requestId });
        if (observation.messageSeen) return { state: 'sent', observation };
        await this.wait(this.settleMs);
      } while (this.now() < deadline);
      return { state: 'unknown', reason: 'SEND_NOT_OBSERVED' };
    } catch (error) {
      if (clicked) return { state: 'unknown', reason: 'PAGE_UNAVAILABLE' };
      throw error;
    } finally { this.inFlight = false; }
  }
}
