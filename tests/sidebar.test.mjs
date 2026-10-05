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
  window.eval(`const createProgress = () => ({show(){},destroy(){}}); const operationLabel = () => ''; const settingsPanelView = () => ({render(){}}); const workspaceSetupView = () => ({render(state){document.getElementById('projects').hidden=!!state.setup;}});\n` + source.replace(/^import .*;\n/gm, ''));
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
  assert.ok(css.includes('border-left:.5px solid var(--tree-guide);border-bottom:.5px solid var(--tree-guide);border-bottom-left-radius:6px'), 'last branch is rounded');
  assert.ok(css.includes('#projects .expand-project{border:0;background:transparent;width:51px;align-self:stretch;flex:0 0 51px;display:grid;place-items:center;padding:0;border-radius:10px;color:var(--tree-guide)}'));
  assert.ok(css.includes('#projects .expand-project .tree-icon{width:20px;height:20px;stroke-width:.5;transition:transform .16s}'));
  assert.ok(css.includes('background:var(--tree-guide);pointer-events:none}'), 'project trunk uses accent');
  assert.ok(css.includes('width:23.5px;height:.5px;background:var(--tree-guide)}'), 'session branch uses half-pixel muted line');
  assert.ok(css.includes('#projects .session-row{position:relative;display:flex;align-items:center;gap:1px;flex:1;min-width:0;border:.5px solid transparent;border-radius:8px;padding-right:4px}'));
  assert.ok(css.includes('#projects .session-row:has(.session.active){background:var(--tree-selected);border-color:var(--tree-guide)}'));
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

test('one project plan stays visible for the selected chat and legacy ownership metadata has no UI', async t => {
  const f=await fixture(t),state=f.state;
  state.selected={...state.selected,scopeId:'current',objective:'Текущий план проекта',
    planBinding:'unresolved',originSessionId:'old-session',preparedPlans:[{planId:'legacy-future'}],
    unassignedPlans:[{plan_id:'legacy'}],
    planView:{state:'awaiting-acceptance',completed:1,total:1,tasks:[{id:'T1',title:'Сохранённый результат',status:'done'}]}};
  f.emit(state);
  assert.equal(f.document.querySelector('#plan-card .eyebrow').textContent,'Текущий план проекта');
  assert.equal(f.document.getElementById('plan-title').textContent,'Текущий план проекта');
  assert.equal(f.document.querySelector('#plan-tasks strong').textContent,'Сохранённый результат');
  assert.equal(f.document.getElementById('prepared-card'),null);
  assert.equal(f.document.getElementById('plan-origin'),null);
  assert.equal(f.document.getElementById('plan-note').hidden,true);
});

test('rapid A-B-A navigation reaches IPC immediately and ignores obsolete responses', async t => {
  const f = await fixture(t), pending = [];
  f.window.webPilot.selectSession = (workspace, sessionId) => new Promise(resolve => pending.push({ workspace, sessionId, resolve }));
  for (const id of ['s1', 's2', 's1']) f.document.querySelector(`[data-session-id=${id}]`).click();
  assert.deepEqual(pending.map(p => p.sessionId), ['s1', 's2', 's1']);
  const response = (i, title) => {
    const state = f.state; state.selected.sessionId = pending[i].sessionId;
    state.projects[0].sessions.find(s => s.sessionId === pending[i].sessionId).title = title;
    pending[i].resolve({ state });
  };
  response(2, 'Самый свежий план'); await f.settle();
  response(1, 'Старый B'); response(0, 'Старый A'); await f.settle();
  assert.equal(f.document.querySelector('.session.active').dataset.sessionId, 's1');
  assert.match(f.document.querySelector('.session.active').textContent, /Самый свежий план/);
});

test('outdated Workflow Kit notice names both versions and opens the regular upgrade preview', async t => {
  const f = await fixture(t);
  f.window.webPilot.retry = async () => { f.calls.push(['retry']); return {}; };
  f.window.webPilot.reload = async () => { f.calls.push(['reload']); return {}; };
  f.emit({ ...f.state, workspaceHealth: { phase: 'error', ready: false, action: 'upgrade', version: '1.4.12', kitVersion: '1.4.13', issues: [], workspace: '/demo' } });
  const message = f.document.getElementById('workspace-health-message').textContent;
  assert.match(message, /Workflow Kit 1\.4\.12/); assert.match(message, /1\.4\.13/);
  assert.equal(f.document.getElementById('workspace-health-retry').textContent, 'Обновить Workflow Kit');
  f.document.getElementById('workspace-health-retry').click(); await f.settle();
  assert.deepEqual(f.calls, [['retry']]);
  f.emit({ ...f.state, workspaceHealth: { phase: 'error', ready: false, issues: [{ reason: 'Нет файла' }], workspace: '/demo' } });
  assert.equal(f.document.getElementById('workspace-health-retry').textContent, 'Повторить проверку');
  f.document.getElementById('workspace-health-retry').click(); await f.settle();
  assert.deepEqual(f.calls, [['retry'], ['reload']]);
});

test('delivered chat shows local tools from the last confirmed runtime status without restarting services', async t => {
  const f = await fixture(t);
  f.emit({ ...f.state, context: { phase: 'delivered', servicesReady: false, messageSent: true } });
  assert.equal(f.document.getElementById('state-service').textContent, 'Не проверены');
  f.emit({ ...f.state, context: { phase: 'delivered', servicesReady: false, messageSent: true },
    macRuntime: { label: 'Codex App Server Local Mac', service: { mcpReady: true, tunnelReady: true, tunnelConfigured: true } } });
  assert.equal(f.document.getElementById('state-service').textContent, 'Готовы');
  f.emit({ ...f.state, macRuntime: { label: 'Codex App Server Local Mac', service: { mcpReady: true, tunnelReady: false, tunnelConfigured: true } } });
  assert.equal(f.document.getElementById('state-service').textContent, 'Не проверены');
  // macOS has one built-in backend: its name is shown and there is no folder to choose.
  assert.equal(f.document.getElementById('connection-detail').textContent, 'Codex App Server Local Mac · встроенный MCP');
  assert.equal(f.document.getElementById('choose-runtime'), null);
});

test('MCP delivery shows the short start message and the agent reading the context through MCP', async t => {
  const f = await fixture(t), text = id => f.document.getElementById(id).textContent;
  f.emit({ ...f.state, context: { phase: 'preparing-message', contextMode: 'mcp', messageSent: false } });
  assert.equal(text('context-title'), 'Готовим стартовое сообщение');
  assert.equal(text('state-message'), 'Ожидание');
  assert.equal(text('state-context'), 'Ожидание');
  f.emit({ ...f.state, context: { phase: 'sending', contextMode: 'mcp', messageSent: false } });
  assert.equal(text('context-title'), 'Начинаем сессию');
  assert.equal(text('state-message'), 'Отправка…');
  const sentAtMs = Date.UTC(2026, 9, 4, 12);
  f.emit({ ...f.state, context: { phase: 'waiting-chat', contextMode: 'mcp', messageSent: true,
    delivery: { workspace: '/p', contextMode: 'mcp', sentAtMs, deliveryMs: 1200 } } });
  assert.equal(text('context-title'), 'Сессия начата');
  assert.match(text('context-detail'), /через MCP по частям/);
  assert.equal(text('state-message'), 'Отправлено');
  assert.equal(text('state-context'), 'Агент читает через MCP');
  assert.equal(f.document.getElementById('state-context').dataset.ready, 'true');
  assert.match(text('session-detail'), /Стартовое сообщение · /);
  assert.match(text('session-detail'), /Отправка: 1\.20 с/);
  assert.doesNotMatch(text('session-detail'), /КБ|NaN|undefined/);
  assert.equal(text('retry-context'), 'Проверить подключение');
  f.emit({ ...f.state, context: { phase: 'bound', contextMode: 'mcp', messageSent: true,
    delivery: { workspace: '/p', contextMode: 'mcp', sentAtMs } } });
  assert.equal(text('context-title'), 'Чат проекта');
  assert.equal(text('state-message'), 'Отправлено');
  f.emit({ ...f.state, context: { phase: 'bound', contextMode: 'mcp', messageSent: false, delivery: null } });
  assert.equal(text('state-message'), 'Не отправлялось', 'a chat the user started manually got no start message');
  assert.equal(text('state-context'), 'Агент читает через MCP');
  assert.equal(text('retry-context'), 'Проверить подключение');
  f.emit({ ...f.state, context: { phase: 'preparing-message', contextMode: 'message', messageSent: false } });
  assert.equal(text('context-title'), 'Вставляем контекст', 'first-message delivery keeps its labels');
  f.emit({ ...f.state, context: { phase: 'delivered', contextMode: 'message', messageSent: true } });
  assert.equal(text('state-context'), 'Передан целиком');
  assert.equal(text('retry-context'), 'Обновить контекст');
});

test('plan card shows current and total agent time in minutes and seconds without live announcements', async t => {
  const f = await fixture(t), state = f.state, timer = f.document.getElementById('agent-time');
  assert.equal(timer.getAttribute('role'), 'timer', 'role=timer is not announced every second');
  assert.equal(timer.closest('.plan-head').querySelector('.eyebrow').textContent, 'Текущий план проекта');
  assert.equal(timer.hidden, false);
  assert.equal(timer.textContent, '00:00 · Σ 00:00');
  state.selected = { ...state.selected, agentTime: { totalMs: 3_725_000, lastMs: 65_900 } }; f.emit(state);
  assert.equal(timer.textContent, '01:05 · Σ 62:05');
  assert.equal(timer.dataset.running, 'false');
  assert.match(timer.getAttribute('aria-label'), /последнее задание 1 мин 5 с, всего за сессию 62 мин 5 с/);
  const now = f.window.Date.now();
  state.selected = { ...state.selected, agentTime: { totalMs: 60_000, lastMs: 60_000 }, agentRun: { startedAt: now - 3_400, lastBusyAt: now, paused: false } }; f.emit(state);
  assert.equal(timer.dataset.running, 'true');
  assert.equal(timer.textContent, '00:03 · Σ 01:03');
  await new Promise(resolve => setTimeout(resolve, 1100));
  assert.equal(timer.textContent, '00:04 · Σ 01:04', 'running value advances every second');
  state.selected = { ...state.selected, agentRun: { startedAt: now - 90_000, lastBusyAt: now - 20_000, paused: true } }; f.emit(state);
  assert.equal(timer.dataset.running, 'false', 'a pause freezes the value at the last busy moment');
  assert.equal(timer.textContent, '01:10 · Σ 02:10');
  state.selected = null; f.emit(state);
  assert.equal(timer.hidden, true);
});
test('startup deletion recovery error remains visible until settings are closed',async t=>{
  const f=await fixture(t),banner=f.document.getElementById('error-banner');
  f.emit({...f.state,settings:{workspace:'/recovery'},startupError:{code:'DELETE_RECOVERY',message:'Не удалось завершить удаление'}});
  assert.equal(banner.hidden,false);assert.equal(banner.textContent,'Не удалось завершить удаление (DELETE_RECOVERY)');
  f.emit({...f.state,settings:null,startupError:null});
  assert.equal(banner.hidden,true);assert.equal(banner.textContent,'');
});
