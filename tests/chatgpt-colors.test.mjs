import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { ChatColors, normalizeChatColors, validateColorChange, chatColorsCSS } from '../src/chatgpt-colors.mjs';
class Contents extends EventEmitter {
  constructor() { super(); this.url = 'https://chatgpt.com/c/fixture'; this.sheets = new Map(); this.serial = 0; }
  isDestroyed() { return false; }
  getURL() { return this.url; }
  async insertCSS(css) { const key = String(++this.serial); this.sheets.set(key, css); await new Promise(resolve => setImmediate(resolve)); return key; }
  async removeInsertedCSS(key) { this.sheets.delete(key); }
}
test('palette accepts only four hex colors and rejects CSS injection', () => {
  assert.deepEqual(normalizeChatColors({ background: '#ABCDEF', userText: 'red;display:none', extra: '#ffffff' }), {
    background: '#abcdef', userBackground: null, userText: null, assistantText: null,
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
