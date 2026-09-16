import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { JSDOM } from 'jsdom';

async function fixture(t) {
  const html = await fs.readFile(new URL('../src/ui/index.html', import.meta.url), 'utf8');
  const source = await fs.readFile(new URL('../src/ui/sidebar.mjs', import.meta.url), 'utf8');
  const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true, url: 'https://fixture.invalid/' });
  t.after(async () => { await new Promise(resolve => setTimeout(resolve, 0)); dom.window.close(); });
  const { window } = dom, document = window.document, calls = [];
  // JSDOM has no top layer. Electron smoke verifies native popover geometry.
  const query = document.querySelectorAll.bind(document);
  document.querySelectorAll = selector => query(selector.replaceAll(':popover-open', '[data-test-open]'));
  const matches = window.Element.prototype.matches;
  window.Element.prototype.matches = function(selector) { return matches.call(this, selector.replaceAll(':popover-open', '[data-test-open]')); };
  for (const [method, open] of [['showPopover', true], ['hidePopover', false]]) {
    window.HTMLElement.prototype[method] = function() {
      this.toggleAttribute('data-test-open', open);
      const event = new window.Event('toggle'); event.newState = open ? 'open' : 'closed'; this.dispatchEvent(event);
    };
  }
  let state = {
    projects: [{ workspace: '/demo', name: 'Проект', expanded: true, sessions: [4, 3, 2, 1].map(n => ({
      sessionId: 's' + n, createdAt: n * 1000, title: 'Сессия ' + n, experience: n % 2 ? 'chat' : 'work', chatUrl: 'https://fixture.invalid/c/' + n,
    })) }], selected: { workspace: '/demo', sessionId: 's4' }, context: { phase: 'delivered' },
  };
  let onState;
  const emit = value => { state = structuredClone(value); onState(state); };
  const api = {
    getState: async () => structuredClone(state), onState: listener => { onState = listener; },
    async selectSession(workspace, sessionId) { calls.push(['selectSession', workspace, sessionId]); state.selected = { workspace, sessionId }; return { state: structuredClone(state) }; },
    async selectWorkspace(workspace) { calls.push(['selectWorkspace', workspace]); state.selected = { workspace, sessionId: state.projects[0].sessions[0].sessionId }; state.projects[0].expanded = true; return { state: structuredClone(state) }; },
    async setExpanded(workspace, expanded) { calls.push(['setExpanded', workspace, expanded]); state.projects.find(p => p.workspace === workspace).expanded = expanded; return { state: structuredClone(state) }; },
    async chooseWorkspace() { calls.push(['chooseWorkspace']); return { state: structuredClone(state) }; },
  };
  window.webPilot = api;
  window.eval(`const createProgress = () => ({show(){},destroy(){}}); const operationLabel = () => ''; const projectArchiveView = () => ({render(){}}); const workspaceSetupView = () => ({render(state){document.getElementById('projects').hidden=!!state.setup;}});\n` + source.replace(/^import .*;\n/gm, ''));
  const settle = () => new Promise(resolve => setTimeout(resolve, 0));
  await settle();
  return { window, document, calls, emit, get state() { return structuredClone(state); }, settle };
}

test('native project actions stay open after focus changes, close on outside click and invoke existing action', async t => {
  const f = await fixture(t), header = f.document.getElementById('project-actions');
  const summary = header.querySelector('summary');
  summary.click(); assert.equal(header.open, true);
  summary.dispatchEvent(new f.window.FocusEvent('focusout', { bubbles: true }));
  assert.equal(header.open, true, 'focusout must not immediately close disclosure');
  f.document.getElementById('add-workspace').click(); await f.settle();
  assert.equal(header.open, false); assert.deepEqual(f.calls, [['chooseWorkspace']]);
  summary.click(); f.document.body.click(); assert.equal(header.open, false);
  summary.click(); summary.click(); assert.equal(header.open, false);
});

test('old session selection preserves scroll and order, project click resets to newest and arrow only folds', async t => {
  const f = await fixture(t), list = () => f.document.querySelector('.sessions');
  const ids = () => [...f.document.querySelectorAll('.session')].map(button => button.dataset.sessionId);
  list().scrollTop = 144;
  f.document.querySelector('[data-session-id=s1]').click(); await f.settle();
  assert.equal(list().scrollTop, 144); assert.deepEqual(ids(), ['s4', 's3', 's2', 's1']);
  assert.equal(f.document.querySelector('.session.active').dataset.sessionId, 's1');
  const changed = f.state; changed.projects[0].sessions[0].title = 'Обновлённый заголовок'; f.emit(changed);
  assert.equal(list().scrollTop, 144, 'metadata refresh retains scroll');
  f.document.querySelector('.expand-project').click(); await f.settle();
  assert.equal(list().hidden, true); assert.equal(f.state.selected.sessionId, 's1');
  f.document.querySelector('.expand-project').click(); await f.settle();
  assert.equal(list().hidden, false); assert.equal(list().scrollTop, 144);
  f.document.querySelector('.project').click(); await f.settle();
  assert.equal(f.state.selected.sessionId, 's4'); assert.equal(list().scrollTop, 0);
  assert.equal(f.calls.filter(call => call[0] === 'selectWorkspace').length, 1, 'one immediate project action');
});


test('active session outline continues the accent project tree around the full row', async t => {
  const f = await fixture(t);
  const css = f.document.querySelector('style').textContent.replace(/\s+/g, ' ');
  const activeRow = f.document.querySelector('.session.active').closest('.session-row');
  assert.ok(activeRow.querySelector('.session-experience'), 'outline row contains Chat/Work badge');
  assert.ok(activeRow.querySelector('.session-menu-button'), 'outline row contains session menu');
  assert.ok(css.includes('#projects .expand-project{border:0;background:transparent;width:51px;align-self:stretch;flex:0 0 51px;display:grid;place-items:center;padding:0;border-radius:10px;color:var(--tree-accent)}'));
  assert.ok(css.includes('#projects .expand-project .tree-icon{width:20px;height:20px;stroke-width:1.2;transition:transform .16s}'));
  assert.ok(css.includes('background:var(--tree-accent);pointer-events:none}'), 'project trunk uses accent');
  assert.ok(css.includes('width:23.5px;height:1px;background:var(--tree-accent)}'), 'session branch uses one-pixel accent line');
  assert.ok(css.includes('#projects .session-row{position:relative;display:flex;align-items:center;gap:1px;flex:1;min-width:0;border:1px solid transparent;border-radius:8px;padding-right:4px}'));
  assert.ok(css.includes('#projects .session-row:has(.session.active){background:var(--tree-selected);border-color:var(--tree-accent)}'));
  assert.ok(!css.includes('.session-row:has(.session.active)::before'), 'legacy vertical active marker is removed');
});

test('newly added session starts at top while global folding preserves current session', async t => {
  const f = await fixture(t);
  f.document.querySelector('.sessions').scrollTop = 144;
  const changed = f.state;
  changed.projects[0].sessions.unshift({ sessionId: 's5', createdAt: 5000, title: 'Новая', experience: 'work' });
  changed.selected.sessionId = 's5'; f.emit(changed);
  assert.equal(f.document.querySelector('.sessions').scrollTop, 0);
  f.document.getElementById('toggle-projects').click(); await f.settle();
  assert.equal(f.document.querySelector('.sessions').hidden, true); assert.equal(f.state.selected.sessionId, 's5');
  f.document.getElementById('toggle-projects').click(); await f.settle();
  assert.equal(f.document.querySelector('.sessions').hidden, false); assert.equal(f.state.selected.sessionId, 's5');
});


test('temporary workspace validation preserves scroll across hidden and replaced lists', async t => {
  const f = await fixture(t), list = () => f.document.querySelector('.sessions');
  list().scrollTop = 144;
  const checking = f.state; checking.setup = { phase: 'checking' }; f.emit(checking);
  assert.equal(f.document.getElementById('projects').hidden, true);
  const detached = list(); detached.scrollTop = 0;
  detached.dispatchEvent(new f.window.Event('scroll'));
  const selected = f.state; selected.selected.sessionId = 's1'; f.emit(selected);
  assert.notEqual(list(), detached, 'selection changed while tree was hidden');
  detached.dispatchEvent(new f.window.Event('scroll'));
  const ready = f.state; ready.setup = null; f.emit(ready);
  assert.equal(f.document.getElementById('projects').hidden, false);
  assert.equal(list().scrollTop, 144, 'hidden browser scroll reset is ignored');
  assert.equal(f.document.querySelector('.session.active').dataset.sessionId, 's1');
});
