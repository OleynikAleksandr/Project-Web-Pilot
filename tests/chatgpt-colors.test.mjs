import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { JSDOM } from 'jsdom';
import { ChatColors, normalizeChatColors, validateColorChange, chatColorsCSS, composerCapsuleScript, COMPOSER_CAPSULE_ATTR, COMPOSER_INNER_ATTR } from '../src/chatgpt-colors.mjs';
class Contents extends EventEmitter {
  constructor() { super(); this.url = 'https://chatgpt.com/c/fixture'; this.sheets = new Map(); this.serial = 0; this.scripts = []; }
  async executeJavaScript(code) { this.scripts.push(code); }
  isDestroyed() { return false; }
  getURL() { return this.url; }
  async insertCSS(css) { const key = String(++this.serial); this.sheets.set(key, css); await new Promise(resolve => setImmediate(resolve)); return key; }
  async removeInsertedCSS(key) { this.sheets.delete(key); }
}
test('palette accepts only five hex colors and rejects CSS injection', () => {
  assert.deepEqual(normalizeChatColors({ background: '#ABCDEF', userText: 'red;display:none', extra: '#ffffff' }), {
    background: '#abcdef', userBackground: null, userText: null, assistantText: null, composerBackground: null,
  });
  assert.throws(() => validateColorChange({ key: 'background', value: 'url(https://example.com)' }));
  assert.throws(() => validateColorChange({ key: 'other', value: '#ffffff' }));
  assert.equal(chatColorsCSS({}), '');
});
test('rapid changes converge to one sheet, reset removes it, navigation reapplies', async () => {
  const contents = new Contents(), palette = new ChatColors(contents);
  const pending = palette.set({ background: '#111111' });
  for (let n = 1; n < 20; n++) palette.set({ background: '#' + n.toString(16).padStart(6, '0') });
  await pending;
  assert.equal(contents.sheets.size, 1);
  assert.match([...contents.sheets.values()][0], /#000013/);
  contents.sheets.clear();
  contents.emit('did-start-navigation', {}, 'https://chatgpt.com/c/next', false, true);
  await palette.apply();
  assert.equal(contents.sheets.size, 1);
  await palette.set({});
  assert.equal(contents.sheets.size, 0);
  contents.url = 'https://example.com';
  await palette.set({ userText: '#123456' });
  assert.equal(contents.sheets.size, 0);
  palette.dispose();
  assert.equal(contents.listenerCount('dom-ready'), 0);
});
test('old palettes retain their colors while the composer defaults to native', () => {
  const old = { background: '#102030', userBackground: '#304050', userText: '#abcDEF', assistantText: '#654321' };
  assert.deepEqual(normalizeChatColors(old), { ...old, userText: '#abcdef', composerBackground: null });
  assert.deepEqual(validateColorChange({ key: 'composerBackground', value: '#Ab1234' }), { key: 'composerBackground', value: '#ab1234' });
  assert.throws(() => validateColorChange({ key: 'composerBackground', value: '#abc;display:none' }));
});

// ChatGPT alternates the wrapper that draws the rounded capsule; only the capsule may receive the color.
const capsuleLayouts = `
<form id="thread"><div id="mode-surface"><div id="root" style="border-radius:26px"><div id="body" data-composer-body style="border-radius:0px">
  <button id="plus">+</button><div id="footer"><div id="prompt" contenteditable="true" role="textbox"></div></div><button id="voice">Voice</button>
</div></div></div></form>
<form id="landing"><div id="plain-root"><div id="rounded-body" data-composer-body style="border-radius:26px"><div id="landing-footer"><textarea id="landing-editor" data-testid="prompt-textarea"></textarea></div></div></div></form>
<form id="square"><div id="square-surface"><div data-testid="composer-text-input" contenteditable="true" role="textbox"></div></div></form>`;

test('composer capsule is the nearest rounded ancestor of each editor, never a rectangular wrapper', () => {
  const dom = new JSDOM('<body>' + capsuleLayouts + '</body>', { runScripts: 'outside-only' });
  const { window } = dom, $ = id => window.document.getElementById(id);
  window.Element.prototype.getClientRects = () => [{ width: 1, height: 1 }];
  assert.equal(window.eval(composerCapsuleScript(true)), 2);
  const tagged = attr => [...window.document.querySelectorAll('[' + attr + ']')].map(e => e.id).sort();
  assert.deepEqual(tagged(COMPOSER_CAPSULE_ATTR), ['root', 'rounded-body'], 'rounded root in threads, rounded body on the landing page');
  assert.deepEqual(tagged(COMPOSER_INNER_ATTR), ['body', 'footer', 'landing-footer'], 'rectangular wrappers inside the capsule become transparent');
  for (const id of ['mode-surface', 'plain-root', 'square-surface', 'square']) assert.equal($(id).hasAttribute(COMPOSER_CAPSULE_ATTR), false, id + ' is not painted');
  assert.equal(window.eval(composerCapsuleScript(false)), 0);
  assert.deepEqual([...tagged(COMPOSER_CAPSULE_ATTR), ...tagged(COMPOSER_INNER_ATTR)], [], 'reset removes every mark');
  assert.equal(window.__webPilotComposerCapsule, undefined);
  dom.window.close();
});

test('composer color targets only the marked capsule and the marker follows the palette', async () => {
  const css = chatColorsCSS({ composerBackground: '#2b2b2b' });
  assert.match(css, new RegExp('^\\[' + COMPOSER_CAPSULE_ATTR + '\\]\\{background:#2b2b2b!important\\}', 'm'));
  assert.match(css, new RegExp('\\[' + COMPOSER_INNER_ATTR + '\\][^{]*\\{background:transparent!important\\}'));
  assert.equal(/data-composer-body|composer-background|ComposerLayout/.test(css), false, 'no layout-specific surface is painted directly');
  const contents = new Contents(), palette = new ChatColors(contents);
  await palette.set({ composerBackground: '#2b2b2b' });
  assert.match(contents.scripts.at(-1), /^\(function installComposerCapsule[\s\S]*\}\)\(true, /);
  await palette.set({ background: '#111111' });
  assert.match(contents.scripts.at(-1), /^\(function installComposerCapsule[\s\S]*\}\)\(false, /);
  palette.dispose();
});
