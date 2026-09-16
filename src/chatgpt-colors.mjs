export const COLOR_KEYS = Object.freeze(['background', 'userBackground', 'userText', 'assistantText']);
export const DEFAULT_COLORS = Object.freeze({
  light: Object.freeze({ background: '#ffffff', userBackground: '#f4f4f4', userText: '#0d0d0d', assistantText: '#0d0d0d' }),
  dark: Object.freeze({ background: '#212121', userBackground: '#303030', userText: '#ececec', assistantText: '#ececec' }),
});
export function normalizeChatColors(value = {}) {
  const result = {};
  for (const key of COLOR_KEYS) {
    const color = value?.[key];
    result[key] = typeof color === 'string' && /^#[0-9a-f]{6}$/i.test(color) ? color.toLowerCase() : null;
  }
  return result;
}
export function validateColorChange(input) {
  if (!input || !COLOR_KEYS.includes(input.key) || (input.value !== null && (typeof input.value !== 'string' || !/^#[0-9a-f]{6}$/i.test(input.value))))
    throw new TypeError('Выберите цвет или укажите HEX в формате #RRGGBB.');
  return { key: input.key, value: input.value?.toLowerCase() ?? null };
}
const role = name => ':is([data-message-author-role="' + name + '"],[data-testid="' + name + '-message"])';
export function chatColorsCSS(input) {
  const colors = normalizeChatColors(input), rules = [];
  if (colors.background) {
    const c = colors.background;
    rules.push(':root,html,body,.dark,.light{--main-surface-primary:' + c + '!important;--bg-primary:' + c + '!important;--chat-background:' + c + '!important}');
    rules.push('html,body,main,#main,[role="main"],#thread,#thread :is(.bg-token-main-surface-primary,.bg-token-bg-primary),main :is(.bg-token-main-surface-primary,.bg-token-bg-primary){background-color:' + c + '!important}');
  }
  if (colors.userBackground) {
    rules.push(role('user') + '{--message-surface:' + colors.userBackground + '!important}');
    rules.push('.user-message-bubble,' + role('user') + ':not(:has(.user-message-bubble)){background-color:' + colors.userBackground + '!important}');
  }
  for (const name of ['user', 'assistant']) {
    const c = colors[name + 'Text'];
    if (c) rules.push(role(name) + ',' + role(name) + ' :not(:where(pre,pre *,code,code *,a,a *,svg,svg *)){color:' + c + '!important}');
  }
  return rules.join('\n');
}
export function isChatColorsURL(value) {
  try { const url = new URL(value); return url.origin === 'https://chatgpt.com'; } catch { return false; }
}
// One sheet per document; coalescing prevents a fast color drag from queuing obsolete sheets.
export class ChatColors {
  constructor(contents, colors = {}) {
    this.contents = contents; this.colors = normalizeChatColors(colors);
    this.key = null; this.document = 0; this.revision = 0; this.pending = null;
    this.onNavigate = (_event, _url, inPlace, mainFrame) => {
      if (mainFrame && !inPlace) { this.document++; this.key = null; }
    };
    this.onLoad = () => { void this.apply().catch(() => {}); };
    contents.on('did-start-navigation', this.onNavigate);
    contents.on('dom-ready', this.onLoad);
    contents.on('did-finish-load', this.onLoad);
    contents.on('did-navigate-in-page', this.onLoad);
  }
  set(colors) { this.colors = normalizeChatColors(colors); return this.apply(); }
  apply() {
    this.revision++;
    if (!this.pending) {
      this.pending = this.flush().finally(() => { this.pending = null; });
    }
    return this.pending;
  }
  async flush() {
    let applied;
    do {
      applied = this.revision;
      const doc = this.document, contents = this.contents;
      if (contents.isDestroyed() || !isChatColorsURL(contents.getURL())) return;
      const previous = this.key, css = chatColorsCSS(this.colors);
      const next = css ? await contents.insertCSS(css, { cssOrigin: 'user' }) : null;
      if (doc !== this.document || contents.isDestroyed()) {
        // Navigation owns a new document; never remove a sheet using an old document's key.
        continue;
      }
      this.key = next;
      if (previous) await contents.removeInsertedCSS(previous);
    } while (applied !== this.revision);
  }
  dispose() {
    for (const name of ['dom-ready', 'did-finish-load', 'did-navigate-in-page']) this.contents.removeListener(name, this.onLoad);
    this.contents.removeListener('did-start-navigation', this.onNavigate);
  }
}
