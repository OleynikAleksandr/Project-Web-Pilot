import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { nativeTheme, clipboard } from 'electron';
import { readWorkspace, WorkspaceSessions } from '../src/workspace-session.mjs';
import { createScope, startTask, archive as archiveScope } from '../resources/workflow-kit/lib/actions.mjs';
import { commitTask } from '../resources/workflow-kit/lib/transaction.mjs';

let packetLoads = 0;
const fixtureContext = Array.from({ length: 400 }, (_, i) => `Раздел ${i + 1}: полный контекст проекта, включая кириллицу и точные пути.\n  Файл: /Projects/Мой проект/src/модуль.mjs\n\n`).join('');
const fixtureTelemetrySse = [
  'data: {"type":"event_msg","payload":{"type":"token_count","info":{"last_token_usage":{"input_tokens":229043,"cached_input_tokens":220000,"total_tokens":229153},"model_context_window":258400},"message":"PRIVATE STREAM TEXT"}}',
  '',
  'data: {"type":"event_msg","payload":{"type":"item_completed","item":{"type":"ContextCompaction","id":"PRIVATE-COMPACTION-ID"}}}',
  '',
].join('\n');
const html = `<!doctype html><html lang="ru"><head><meta charset="utf-8"><title>TEST FIXTURE — no live ChatGPT</title>
<style>body{font:16px -apple-system,sans-serif;padding:40px;background:#fcfcff;color:#29394c}aside{background:#fff0d7;padding:14px;margin-bottom:20px}#prompt-textarea{border:1px solid #9caeb8;padding:12px;min-height:80px;white-space:pre-wrap}button{padding:10px}article{white-space:pre-wrap;font-size:12px}</style></head>
<body><aside>TEST FIXTURE · без реального ChatGPT, MCP и аккаунта</aside><h1>Composer fixture</h1>
<div id="tool-activity"><button id="fixture-tool-call" type="button">Вызываемый инструмент</button></div>
<div aria-label="Select chat surface"><button type="button" data-tpp-toggle-value="chatgpt">Chat</button><button type="button" data-tpp-toggle-value="work">Work</button></div>\n<div id="messages"></div><form><div id="prompt-textarea" contenteditable="true" role="textbox"></div><button type="submit" data-testid="send-button">Send fixture</button></form>
<script>
window.fixtureMode=location.pathname.startsWith('/work')?'work':localStorage.getItem('fixture-mode')||'work';
window.fixtureModeClicks=0;
function setFixtureMode(mode){window.fixtureMode=mode;localStorage.setItem('fixture-mode',mode);document.querySelectorAll('[data-tpp-toggle-value]').forEach(button=>button.setAttribute('data-state',button.dataset.tppToggleValue===mode?'on':'off'));}
setFixtureMode(window.fixtureMode);
document.querySelectorAll('[data-tpp-toggle-value]').forEach(button=>button.addEventListener('click',()=>{window.fixtureModeClicks++;setFixtureMode(button.dataset.tppToggleValue);}));
window.fixtureMessages=JSON.parse(sessionStorage.getItem(location.pathname)||'[]');
function showMessage(text){const article=document.createElement('article');article.setAttribute('data-message-author-role','user');article.setAttribute('data-message-id','fixture-message-'+document.querySelectorAll('[data-message-author-role="user"]').length);article.textContent=text;document.getElementById('messages').append(article);}
window.fixtureMessages.forEach(message=>showMessage(message.text));
document.querySelector('form').addEventListener('submit',event=>{
 event.preventDefault(); const editor=document.getElementById('prompt-textarea');const text=editor.innerText;
 const message={text,at:Date.now(),mode:window.fixtureMode};window.fixtureMessages.push(message);
 showMessage(text);
 editor.textContent='';const match=text.match(/wp-request-[a-zA-Z0-9-]+/);
 if(match && !location.pathname.startsWith('/c/')){
   const target='/c/'+match[0];history.pushState({},'', '/c/WEB:12345678-1234-1234-1234-123456789abc');
   sessionStorage.setItem(target,JSON.stringify(window.fixtureMessages));
   setTimeout(()=>history.replaceState({},'',target),600);
 }else{sessionStorage.setItem(location.pathname,JSON.stringify(window.fixtureMessages));}
});
</script></body></html>`;

export async function createRuntime({ browser, session }) {
  // Explicit isolated test mode only. No request is sent to a real service.
  await session.protocol.handle('https', request => {
    const url = new URL(request.url);
    if (url.hostname === 'chatgpt.com' && url.pathname === '/backend-api/f/conversation') {
      return new Response(fixtureTelemetrySse, { headers: { 'content-type': 'text/event-stream; charset=utf-8' } });
    }
    return new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8' } });
  });
  return {
    ensure: async () => ({ mcp: { ready: true }, tunnel: { ready: true }, fixture: true }),
    loadContext: async workspace => {
      packetLoads++;
      await new Promise(resolve => setTimeout(resolve, 650)); // Observable fixture preparation, not a performance benchmark.
      const info = await readWorkspace(workspace);
      const facts = { project_id: info.projectId, project_name: info.name, plan_revision: info.planRevision,
        scope_id: info.scopeId, execution_scope_status: info.scopeStatus, delivery_status: info.deliveryStatus,
        task_id: info.nextTaskId, task_title: info.nextTaskTitle };
      return { workspace, facts, delivery_protocol: 'inline-context-v1', ack_required: false,
        status: 'ready', completeness: 'COMPLETE', signature: 'fixture-snapshot', head: 'fixture-head',
        generated_at_ms: Date.now(), context: fixtureContext, context_bytes: Buffer.byteLength(fixtureContext),
        context_sha256: createHash('sha256').update(fixtureContext).digest('hex') };
    },
  };
}

async function waitFor(predicate, description, snapshot) {
  const end = Date.now() + 25000;
  while (Date.now() < end) {
    if (await predicate()) return;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error(`SMOKE_TIMEOUT: ${description}; ${JSON.stringify(snapshot?.())}`);
}

export async function run({ app, window, browser, sidebar, store, controller, selectWorkspace, snapshot, assertLocalSender, permissionAllowed, dataDir, chromiumDiagnostics, chromiumDiagnosticsFile, getArchiveWindow }) {
  assert.equal(app.isPackaged, false, 'Fixtures never run from a packaged app');
  assert.equal(permissionAllowed('media', 'https://chatgpt.com', { mediaTypes: ['audio'] }), true);
  assert.equal(permissionAllowed('media', 'https://chatgpt.com/', { mediaType: 'audio' }), true);
  assert.equal(permissionAllowed('media', 'https://chatgpt.com', { mediaTypes: ['video'] }), false);
  assert.equal(permissionAllowed('media', 'https://chatgpt.com', { mediaTypes: ['audio', 'video'] }), false);
  assert.equal(permissionAllowed('geolocation', 'https://chatgpt.com', {}), true);
  assert.equal(permissionAllowed('geolocation-approximate', 'https://chatgpt.com', {}), true);
  assert.equal(permissionAllowed('clipboard-sanitized-write', 'https://chatgpt.com', {}, browser), true);
  assert.equal(permissionAllowed('clipboard-sanitized-write', 'https://chatgpt.com', {}, sidebar), false);
  assert.equal(permissionAllowed('clipboard-read', 'https://chatgpt.com', {}, browser), false);
  assert.equal(permissionAllowed('notifications', 'https://chatgpt.com', {}), false);
  assert.equal(permissionAllowed('clipboard-sanitized-write', 'https://example.com', {}, browser), false);
  assert.equal(permissionAllowed('media', 'https://example.com', { mediaTypes: ['audio'] }), false);
  const workspace = path.join(await fs.realpath(dataDir + '-projects'), 'Тестовый проект с пробелами');
  await waitFor(() => sidebar.executeJavaScript('typeof window.webPilot === "object"'), 'local IPC ready', snapshot);
  assert.equal(snapshot().sidebarWidth, 312);
  await sidebar.executeJavaScript('window.webPilot.setSidebarWidth(420)');
  await waitFor(() => snapshot().sidebarWidth === 420, 'persist sidebar width', snapshot);
  assert.equal(window.contentView.children[0].getBounds().width, 420); assert.equal(window.contentView.children[1].getBounds().x, 420);
  let layoutSettings = JSON.parse(await fs.readFile(path.join(dataDir, 'settings.json'), 'utf8'));
  assert.equal(layoutSettings.sidebarWidth, 420);
  await sidebar.executeJavaScript('window.webPilot.setSidebarWidth(100)');
  await waitFor(() => snapshot().sidebarWidth === 312, 'sidebar legacy minimum', snapshot);
  await sidebar.executeJavaScript(`{
    const splitter=document.getElementById('sidebar-splitter');
    splitter.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,pointerId:7,button:0,screenX:312}));
    splitter.dispatchEvent(new PointerEvent('pointermove',{bubbles:true,pointerId:7,screenX:432}));
    splitter.dispatchEvent(new PointerEvent('pointerup',{bubbles:true,pointerId:7,screenX:432}));
  }`);
  await waitFor(() => snapshot().sidebarWidth === 432, 'drag sidebar splitter', snapshot);
  assert.equal(window.contentView.children[0].getBounds().width, 432); assert.equal(window.contentView.children[1].getBounds().x, 432);
  await sidebar.executeJavaScript(`document.getElementById('sidebar-splitter').dispatchEvent(new KeyboardEvent('keydown',{bubbles:true,key:'ArrowLeft'}))`);
  await waitFor(() => snapshot().sidebarWidth === 408, 'keyboard sidebar resize', snapshot);
  const disclosure = await sidebar.executeJavaScript(`(() => {
    const details=document.getElementById('project-actions'), summary=details.querySelector('summary');
    const initially=details.open; summary.click(); summary.dispatchEvent(new FocusEvent('focusout',{bubbles:true}));
    const opened=details.open; summary.click(); const closed=!details.open;
    summary.click(); document.body.click(); return {initially,opened,closed,outsideClosed:!details.open};
  })()`);
  assert.deepEqual(disclosure, {initially:false,opened:true,closed:true,outsideClosed:true});
  const previewNew = async () => {
    await sidebar.executeJavaScript('document.getElementById("create-workspace").click()');
    await waitFor(() => snapshot().setup?.phase === 'form', 'new workspace form', snapshot);
    await sidebar.executeJavaScript(`document.getElementById('setup-name').value='Тестовый проект с пробелами'; document.getElementById('setup-preview').click()`);
    await waitFor(() => snapshot().setup?.phase === 'preview', 'new workspace preview', snapshot);
  };
  await previewNew();
  assert.equal(snapshot().setup.action, 'install'); assert.equal(packetLoads, 0); assert.equal(store.selected(), null);
  assert.equal(snapshot().setup.firstSessionRequired, true); assert.equal(snapshot().setup.firstSessionExperience, 'chat');
  assert.equal(await sidebar.executeJavaScript('document.getElementById("setup-experience").hidden'), false);
  assert.equal(await sidebar.executeJavaScript('document.getElementById("setup-experience-chat").getAttribute("aria-pressed")'), 'true');
  await sidebar.executeJavaScript('document.getElementById("setup-experience-work").click()');
  await waitFor(() => snapshot().setup?.firstSessionExperience === 'work', 'choose Work as first session', snapshot);
  assert.equal(await sidebar.executeJavaScript('document.getElementById("setup-experience-work").getAttribute("aria-pressed")'), 'true');
  await assert.rejects(fs.stat(workspace), { code: 'ENOENT' });
  assert.ok(snapshot().setup.files.some(f => f.path === 'AGENTS.md'));
  await sidebar.executeJavaScript('document.getElementById("setup-cancel").click()');
  await waitFor(() => !snapshot().setup, 'cancel without creating', snapshot);
  await assert.rejects(fs.stat(workspace), { code: 'ENOENT' });
  await previewNew();
  assert.equal(snapshot().setup.firstSessionExperience, 'chat', 'choice is not remembered globally after cancel');
  await sidebar.executeJavaScript('document.getElementById("setup-apply").click()');
  await waitFor(() => sidebar.executeJavaScript(`(() => { const e=document.getElementById('operation-progress'); return !e.hidden && e.querySelector('.operation-label').textContent.length > 0; })()`), 'visible recovery spinner', snapshot);
  assert.equal(await sidebar.executeJavaScript("getComputedStyle(document.querySelector('.operation-spinner')).animationName"), 'operation-spin');
  assert.equal(await sidebar.executeJavaScript("document.getElementById('operation-progress').getAttribute('role')"), 'status');
  const progressBounds = await sidebar.executeJavaScript("(() => { const r=document.getElementById('operation-progress').getBoundingClientRect(); return {x:0,y:Math.max(0,Math.floor(r.y)-8),width:Math.ceil(innerWidth),height:Math.ceil(r.height)+16}; })()");
  await fs.writeFile(path.join(dataDir,'progress-ui.png'), (await sidebar.capturePage(progressBounds)).toPNG());

  await waitFor(async () => {
    if (snapshot().context.phase === 'waiting-draft') {
      const actual = await browser.executeJavaScript('document.getElementById("prompt-textarea").innerText');
      const expected = store.selected().attempt?.text ?? '';
      let offset = 0; while (offset < Math.min(actual.length, expected.length) && actual[offset] === expected[offset]) offset++;
      throw new Error('FIXTURE_DRAFT_MISMATCH: ' + JSON.stringify({ offset, actualLength: actual.length, expectedLength: expected.length, actual: actual.slice(Math.max(0,offset-40),offset+100), expected: expected.slice(Math.max(0,offset-40),offset+100) }));
    }
    return snapshot().context.phase === 'delivered';
  }, 'first fixture context', snapshot);
  await browser.executeJavaScript("document.title='Первый разговор проекта'");
  await waitFor(() => snapshot().projects[0].sessions[0].title === 'Первый разговор проекта', 'conversation title', snapshot);
  const first = store.selected();
  assert.equal(first.experience, 'chat');
  assert.equal(await browser.executeJavaScript('window.fixtureMessages[0].mode'), 'chatgpt', 'root defaults to Work but startup explicitly selects Chat');
  assert.equal(await browser.executeJavaScript('window.fixtureModeClicks'), 1);
  assert.ok(first.chatUrl.startsWith('https://chatgpt.com/c/'));
  assert.equal(await sidebar.executeJavaScript('document.querySelector(".session-experience").textContent'), 'Chat');
  assert.equal(await sidebar.executeJavaScript('document.getElementById("new-chat")'), null, 'context card has no session creation button');
  assert.equal(first.attempt.state, 'sent');
  assert.ok(first.attempt.text.includes(fixtureContext));
  assert.ok(Buffer.byteLength(fixtureContext) > 60000);
  assert.equal(snapshot().selected.attempt.text, undefined, 'Full prompt stays out of sidebar IPC');
  const sent = await browser.executeJavaScript('window.fixtureMessages[0].text');
  assert.equal(sent.replace(/\n+/g, '\n'), first.attempt.text.replace(/\n+/g, '\n'));
  assert.equal(first.receipt, null);
  assert.equal(packetLoads, 1, 'packet loads at line 158');
  assert.deepEqual(await browser.executeJavaScript('({ require:typeof require, process:typeof process, bridge:typeof window.webPilot })'),
    { require: 'undefined', process: 'undefined', bridge: 'undefined' });
  await clipboard.clear();
  await browser.executeJavaScript("navigator.clipboard.writeText('REMOTE_CHATGPT_CLIPBOARD_FIXTURE')");
  await waitFor(async () => await clipboard.readText() === 'REMOTE_CHATGPT_CLIPBOARD_FIXTURE', 'remote ChatGPT clipboard write', snapshot);

  assert.equal(await sidebar.executeJavaScript('document.querySelector(".session-tokens") === null'), true);
  assert.equal(snapshot().selected.tokenEstimate, undefined);
  assert.equal(snapshot().tokenHistory, undefined);
  const prefs = browser.getLastWebPreferences();
  assert.equal(prefs.nodeIntegration, false); assert.equal(prefs.contextIsolation, true); assert.equal(prefs.sandbox, true);
  assert.throws(() => assertLocalSender({ sender: browser, senderFrame: browser.mainFrame }), { code: 'IPC_FORBIDDEN' });
  assert.equal(await sidebar.executeJavaScript(`({
    planCard: !document.getElementById('plan-card').hidden,
    detailsVisible: !document.getElementById('workspace-details').hidden, oldPlanText: !!document.getElementById('plan-text'),
    revisionVisible: document.getElementById('plan-card').textContent.includes('версия') || document.getElementById('plan-card').textContent.includes('Revision')
  })`).then(value => JSON.stringify(value)), JSON.stringify({ planCard: true, detailsVisible: true, oldPlanText: false, revisionVisible: false }));
  assert.equal(await sidebar.executeJavaScript('document.getElementById("plan-status").textContent'), 'План ещё не создан');
  assert.equal(await sidebar.executeJavaScript('document.querySelectorAll("#plan-tasks .plan-task").length'), 0);
  assert.equal(await sidebar.executeJavaScript('document.getElementById("accept-plan").disabled'), true);

  const planFile = path.join(workspace, '.harness/plans/todo-plan.md');
  const originalPlanText = await fs.readFile(planFile, 'utf8');
  const block = originalPlanText.match(/<!-- workflow-state:begin -->\s*```json\s*([\s\S]*?)```\s*<!-- workflow-state:end -->/);
  const activePlan = JSON.parse(block[1]);
  Object.assign(activePlan, { plan_revision: activePlan.plan_revision + 1, scope_id: 'fixture-plan-ui', objective: 'Автоимя scope fixture', execution_scope_status: 'ACTIVE',
    delivery_status: 'IN_PROGRESS', current_task_id: 'T002', archived_scope_id: undefined, tasks: [
      { id: 'T001', title: 'Подготовить модель', implementation_status: 'DONE', commit_status: 'DONE' },
      { id: 'T002', title: 'Сделать интерфейс', implementation_status: 'IN_PROGRESS', commit_status: 'PENDING' },
      { id: 'T003', title: 'Собрать релиз', implementation_status: 'TODO', commit_status: 'PENDING' },
    ] });
  delete activePlan.archived_scope_id;
  const writeFixturePlan = async plan => fs.writeFile(planFile, '<!-- workflow-state:begin -->\n```json\n' + JSON.stringify(plan) + '\n```\n<!-- workflow-state:end -->');
  await writeFixturePlan(activePlan); controller.attach(store.selected()); await controller.tick();
  await waitFor(() => sidebar.executeJavaScript('document.getElementById("plan-status").textContent === "В работе · 1 из 3 выполнено"'), 'working plan UI', snapshot);
  await waitFor(() => store.selected()?.title === 'Автоимя scope fixture', 'scope automatically names current session', snapshot);
  assert.equal(store.selected().titleSource, 'scope');
  assert.deepEqual(await sidebar.executeJavaScript(`Array.from(document.querySelectorAll('#plan-tasks .plan-task')).map(e=>({status:e.dataset.status,title:e.querySelector('strong').textContent,mark:e.querySelector('.plan-task-state').textContent}))`), [
    { status: 'done', title: 'Подготовить модель', mark: '✓' },
    { status: 'current', title: 'Сделать интерфейс', mark: '●' },
    { status: 'pending', title: 'Собрать релиз', mark: '○' },
  ]);
  assert.equal(await sidebar.executeJavaScript('document.getElementById("plan-card").textContent.includes("Revision") || document.getElementById("plan-card").textContent.includes("версия")'), false);
  assert.equal(await sidebar.executeJavaScript('document.getElementById("accept-plan").disabled'), true);

  const readyPlan = { ...activePlan, plan_revision: activePlan.plan_revision + 1, delivery_status: 'READY_FOR_ACCEPTANCE', current_task_id: null,
    tasks: activePlan.tasks.map(task => ({ ...task, implementation_status: 'DONE', commit_status: 'DONE' })) };
  await writeFixturePlan(readyPlan); controller.attach(store.selected()); await controller.tick();
  await waitFor(() => sidebar.executeJavaScript('document.getElementById(\"plan-status\").textContent.includes(\"ожидается ваша приёмка\")'), 'ready for acceptance plan UI', snapshot);
  assert.equal(await sidebar.executeJavaScript('document.querySelectorAll(\"#plan-tasks .plan-task[data-status=done]\").length'), 3);
  await waitFor(() => sidebar.executeJavaScript('!document.getElementById("accept-plan").disabled'), 'accept plan enabled', snapshot);
  await sidebar.executeJavaScript('document.getElementById("accept-plan").click()');
  await waitFor(() => browser.executeJavaScript('window.fixtureMessages.length === 2'), 'acceptance user message', snapshot);
  assert.equal(await browser.executeJavaScript('window.fixtureMessages[1].text'), 'Принимаю текущий план и результат работы. Это моя явная команда закрыть текущий scope: штатно архивируй его через Workflow Kit и оставь проект без активного scope (NONE). Новый scope автоматически не создавай. После закрытия коротко подтверди результат и предложи выбрать Chat или Work в блоке «План»: Web Pilot откроет новую сессию с актуальным контекстом после моего выбора.');
  await waitFor(() => snapshot().planAcceptance === 'sent', 'acceptance send confirmed', snapshot);
  assert.equal(await sidebar.executeJavaScript('document.getElementById("accept-plan").textContent'), 'Отправлено');
  assert.equal(await sidebar.executeJavaScript('document.getElementById("accept-plan").disabled'), true);

  const closedPlan = { ...readyPlan, plan_revision: readyPlan.plan_revision + 1, scope_id: null, execution_scope_status: 'NONE',
    delivery_status: 'IN_PROGRESS', archived_scope_id: 'fixture-plan-ui', current_task_id: null, tasks: [] };
  await writeFixturePlan(closedPlan); controller.attach(store.selected()); await controller.tick();
  await waitFor(() => sidebar.executeJavaScript('document.getElementById("plan-status").textContent === "Scope завершён и архивирован"'), 'closed plan UI', snapshot);
  assert.equal(await sidebar.executeJavaScript('document.getElementById("plan-note").textContent'), 'Проект готов к следующему новому плану.');
  assert.equal(await sidebar.executeJavaScript('document.getElementById("plan-note").hidden'), false);
  assert.equal(await sidebar.executeJavaScript('document.getElementById("accept-plan").disabled'), true);
  assert.equal(snapshot().planAcceptance, null);

  const nextReadyPlan = { ...readyPlan, plan_revision: closedPlan.plan_revision + 1, scope_id: 'fixture-plan-ui-b',
    execution_scope_status: 'ACTIVE', delivery_status: 'READY_FOR_ACCEPTANCE', archived_scope_id: 'fixture-plan-ui', current_task_id: null };
  await writeFixturePlan(nextReadyPlan); controller.attach(store.selected()); await controller.tick();
  await waitFor(() => sidebar.executeJavaScript('document.getElementById(\"plan-status\").textContent.includes(\"ожидается ваша приёмка\")'), 'next scope ready UI', snapshot);
  assert.equal(snapshot().planAcceptance, null, 'Acceptance state from previous scope must not leak into the next scope');
  assert.equal(await sidebar.executeJavaScript('document.getElementById(\"accept-plan\").textContent'), 'Принять');
  assert.equal(await sidebar.executeJavaScript('document.getElementById(\"accept-plan\").disabled'), false);

  await fs.writeFile(planFile, originalPlanText); controller.attach(store.selected()); await controller.tick();
  await waitFor(() => sidebar.executeJavaScript('document.getElementById("plan-status").textContent === "План ещё не создан"'), 'restore fixture plan', snapshot);
  assert.equal(await sidebar.executeJavaScript('document.getElementById("plan-note").hidden'), true);
  assert.equal(snapshot().planAcceptance, null);
  assert.equal(await sidebar.executeJavaScript('document.getElementById("accept-plan").disabled'), true);
  await clipboard.clear();
  await waitFor(() => sidebar.executeJavaScript('!document.querySelector(".project-menu-button").disabled'), 'project menu enabled', snapshot);
  await sidebar.executeJavaScript(`document.querySelector('.project-menu-button').click(); document.querySelector('.copy-workspace-path').click()`);
  await waitFor(async () => await clipboard.readText() === workspace, 'copy exact workspace path from menu', snapshot);
  assert.equal(await sidebar.executeJavaScript('document.getElementById("context-title").textContent'), 'Контекст передан');
  assert.equal(await sidebar.executeJavaScript('document.getElementById("context-toggle").getAttribute("aria-expanded")'), 'false');
  assert.equal(await sidebar.executeJavaScript('document.getElementById("context-details").hidden'), true);
  await sidebar.executeJavaScript('document.getElementById("context-toggle").click()');
  assert.equal(await sidebar.executeJavaScript('document.getElementById("context-toggle").getAttribute("aria-expanded")'), 'true');
  assert.equal(await sidebar.executeJavaScript('document.getElementById("context-details").hidden'), false);
  await sidebar.executeJavaScript('document.getElementById("context-toggle").click()');
  assert.equal(await sidebar.executeJavaScript('document.getElementById("context-details").hidden'), true);
  const disclosureSize = await sidebar.executeJavaScript(`(() => { const e=document.querySelector('.expand-project'); const p=getComputedStyle(e,'::before'); return {button:e.getBoundingClientRect().width, icon:e.querySelector('svg').getBoundingClientRect().width, expanded:e.getAttribute('aria-expanded')}; })()`);
  assert.ok(disclosureSize.button >= 32); assert.ok(disclosureSize.icon >= 18); assert.equal(disclosureSize.expanded, 'false');
  const restored = new WorkspaceSessions(store.file); await restored.load();
  assert.equal(restored.selected().sessionId, first.sessionId); assert.equal(restored.selected().chatUrl, first.chatUrl);
  controller.attach(store.selected()); await controller.tick();
  await controller.contextCache.load(workspace);
  const warmPacketLoads = packetLoads;
  assert.deepEqual(await sidebar.executeJavaScript(`(() => { document.querySelector('.project-menu-button').click(); return Array.from(document.querySelectorAll('.project-menu button')).map(button => button.textContent); })()`),
    ['Новый Chat', 'Новый Work', 'Переименовать', 'Скопировать полный путь', 'Перенести в архив']);
  await sidebar.executeJavaScript(`window.prompt=()=>"Проект Smoke Rename"; document.querySelector('.project-menu-button').click(); document.querySelector('.rename-project').click()`);
  await waitFor(() => snapshot().projects[0].name === 'Проект Smoke Rename', 'project rename menu IPC', snapshot);
  assert.equal(store.project(workspace).name, 'Тестовый проект с пробелами', 'project rename keeps canonical workflow name');
  await sidebar.executeJavaScript('document.querySelector(".expand-project").click()');
  await waitFor(() => sidebar.executeJavaScript('!document.querySelector(".sessions").hidden && !document.querySelector(".session").disabled'), 'expand before session actions', snapshot);
  await sidebar.executeJavaScript(`window.prompt=()=>"Сессия Smoke Rename"; { const li=document.querySelector('[data-session-id="${first.sessionId}"]').closest('li'); li.querySelector('.session-menu-button').click(); li.querySelector('.rename-session').click(); }`);
  await waitFor(() => store.selected()?.title === 'Сессия Smoke Rename', 'session rename menu IPC', snapshot);
  assert.equal(store.selected().titleSource, 'manual');
  await browser.executeJavaScript(`document.title='Поздний заголовок ChatGPT'`);
  await new Promise(resolve => setTimeout(resolve, 150));
  assert.equal(store.selected().title, 'Сессия Smoke Rename', 'page title cannot overwrite manual session name');
  await sidebar.executeJavaScript('document.querySelector(".new-project-chat").click()');
  await waitFor(() => store.selected()?.sessionId !== first.sessionId && snapshot().context.phase === 'delivered', 'new Chat via project menu IPC', snapshot);
  assert.equal(packetLoads, warmPacketLoads, 'packet loads at line 289');
  assert.equal(await browser.executeJavaScript('window.fixtureMessages.length'), 1);
  const second = store.selected();
  assert.equal(second.attempt.packet.cacheHit, true);
  assert.equal(second.attempt.packet.contextSha256, first.attempt.packet.contextSha256);
  assert.notEqual(second.attempt.requestId, first.attempt.requestId);
  assert.ok(Number.isFinite(second.attempt.packet.preparationMs));
  assert.ok(Number.isFinite(second.attempt.packet.deliveryMs));
  assert.match(await sidebar.executeJavaScript('document.getElementById(\"session-detail\").textContent'), /пакет готов заранее/);
  assert.equal(second.experience, 'chat');
  assert.equal(store.snapshot().projects[0].sessions.length, 2);
  assert.deepEqual(await sidebar.executeJavaScript('Array.from(document.querySelectorAll(".session-experience")).map(e=>e.textContent)'), ['Chat', 'Chat']);
  assert.equal(snapshot().projects[0].sessions[0].attempt, undefined, 'Session tree only receives metadata');
  await sidebar.executeJavaScript(`document.querySelector('.project-menu-button').click(); document.querySelector('.new-project-work').click()`);
  await waitFor(() => store.selected()?.experience === 'work' && snapshot().context.phase === 'delivered', 'new Work via project menu IPC', snapshot);
  assert.equal(packetLoads, warmPacketLoads, 'packet loads at line 304');
  const third = store.selected();
  assert.equal(third.experience, 'work');
  assert.ok(third.chatUrl.startsWith('https://chatgpt.com/c/'));
  assert.ok(browser.getURL().startsWith('https://chatgpt.com/c/'));
  assert.equal(third.experience, 'work', 'shared /c URL keeps Work provenance');
  assert.equal(store.snapshot().projects[0].sessions.length, 3);
  assert.deepEqual(await sidebar.executeJavaScript('Array.from(document.querySelectorAll(".session-experience")).map(e=>e.textContent)'), ['Work', 'Chat', 'Chat']);
  assert.equal(await browser.executeJavaScript('window.fixtureMessages[0].mode'), 'work');
  await sidebar.executeJavaScript(`document.querySelector('.project-menu-button').click(); document.querySelector('.new-project-chat').click()`);
  await waitFor(() => store.selected()?.experience === 'chat' && store.selected()?.sessionId !== second.sessionId
    && snapshot().context.phase === 'delivered', 'new Chat after Work remembers browser preference', snapshot);
  assert.equal(packetLoads, warmPacketLoads, 'packet loads at line 325');
  assert.equal(await browser.executeJavaScript('window.fixtureMessages.length'), 1);
  assert.equal(await browser.executeJavaScript('window.fixtureMessages[0].mode'), 'chatgpt');
  assert.equal(await browser.executeJavaScript('window.fixtureModeClicks'), 1);
  const fourth = store.selected();
  assert.deepEqual(snapshot().projects[0].sessions.map(s => s.sessionId), [fourth.sessionId, third.sessionId, second.sessionId, first.sessionId]);
  const treeScreenshots = [];
  for (const width of [312, 408]) {
    await sidebar.executeJavaScript('window.webPilot.setSidebarWidth(' + width + ')');
    await waitFor(() => snapshot().sidebarWidth === width, 'tree width ' + width, snapshot);
    for (const theme of ['light', 'dark']) {
      await sidebar.executeJavaScript('window.webPilot.setTheme(' + JSON.stringify(theme) + ')');
      await waitFor(() => sidebar.executeJavaScript('document.documentElement.dataset.theme === ' + JSON.stringify(theme)), 'tree theme ' + theme, snapshot);
      const bounds = await sidebar.executeJavaScript(`(() => {
        const list=document.querySelector('.sessions'), rows=[...list.children], row=rows[0], style=getComputedStyle(list);
        const right=list.getBoundingClientRect().right, menu=row.querySelector('.session-menu-button').getBoundingClientRect();
        const badge=row.querySelector('.session-experience').getBoundingClientRect();
        return {height:list.clientHeight,rowHeight:row.getBoundingClientRect().height,overflow:list.scrollHeight>list.clientHeight,
          scrollbar:list.offsetWidth-list.clientWidth, gutter:style.scrollbarGutter, right,menuRight:menu.right,badgeRight:badge.right,
          horizontal:list.scrollWidth<=list.clientWidth, bodyFits:document.documentElement.scrollWidth<=innerWidth};
      })()`);
      assert.ok(Math.abs(bounds.height - bounds.rowHeight * 3) < 2, JSON.stringify(bounds));
      assert.ok(bounds.overflow && bounds.horizontal && bounds.bodyFits, JSON.stringify(bounds));
      assert.ok(bounds.scrollbar >= 10 && bounds.gutter === 'stable', JSON.stringify(bounds));
      assert.ok(bounds.menuRight < bounds.right - bounds.scrollbar && bounds.badgeRight < bounds.menuRight, JSON.stringify(bounds));
      const imageFile=path.join(dataDir, 'projects-' + width + '-' + theme + '.png');
      await fs.writeFile(imageFile, (await sidebar.capturePage()).toPNG()); treeScreenshots.push(imageFile);
    }
  }
  await sidebar.executeJavaScript('window.webPilot.setTheme("light")');
  await waitFor(() => snapshot().theme === 'light', 'restore theme after tree check', snapshot);
  await sidebar.executeJavaScript(`document.querySelector('.sessions').scrollTop=document.querySelector('.sessions').scrollHeight`);
  await sidebar.executeJavaScript('new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))');
  const oldScroll = await sidebar.executeJavaScript(`(() => {
    const list=document.querySelector('.sessions');
    const button=list.querySelector('[data-session-id="${first.sessionId}"]').closest('li').querySelector('.session-menu-button');
    button.focus({preventScroll:true}); button.click(); const menu=button.closest('li').querySelector('.session-menu'), rect=menu.getBoundingClientRect();
    const result={scroll:list.scrollTop,open:menu.matches(':popover-open'),visible:rect.width>0 && rect.top>=0 && rect.bottom<=innerHeight};
    menu.hidePopover(); result.afterHide=list.scrollTop; return result;
  })()`);
  assert.ok(oldScroll.scroll > 0 && oldScroll.open && oldScroll.visible, JSON.stringify(oldScroll));
  assert.equal(oldScroll.afterHide, oldScroll.scroll, JSON.stringify(oldScroll));
  await sidebar.executeJavaScript('new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))');
  assert.equal(await sidebar.executeJavaScript('document.querySelector(".sessions").scrollTop'), oldScroll.scroll, 'menu closing preserves scroll');

  await sidebar.executeJavaScript(`document.querySelector('[data-session-id="${first.sessionId}"]').click()`);
  await waitFor(() => store.selected()?.sessionId === first.sessionId && snapshot().context.phase === 'delivered'
    && browser.getURL() === first.chatUrl, 'select earlier session via tree', snapshot);
  assert.equal(await sidebar.executeJavaScript('document.querySelector(".sessions").scrollTop'), oldScroll.scroll, 'old session keeps scroll after state refresh');
  assert.deepEqual(snapshot().projects[0].sessions.map(s => s.sessionId), [fourth.sessionId, third.sessionId, second.sessionId, first.sessionId]);
  assert.equal(packetLoads, warmPacketLoads, 'Earlier chat does not receive another context packet');
  assert.equal(await browser.executeJavaScript('window.fixtureMessages.length'), 2);
  assert.ok(await browser.executeJavaScript(`window.fixtureMessages[0].text.includes('${first.attempt.requestId}')`));
  assert.equal(store.selected().attempt.requestId, first.attempt.requestId);
  assert.equal(store.snapshot().projects[0].sessions[1].sessionId, second.sessionId);
  assert.equal(store.snapshot().projects[0].sessions[2].sessionId, third.sessionId);

  const archiveSessionFromTree = async sessionId => {
    await sidebar.executeJavaScript(`{ const choice=document.querySelector('[data-session-id="${sessionId}"]'); const li=choice.closest('li'); li.querySelector('.session-menu-button').click(); li.querySelector('.archive-session').click(); }`);
    await waitFor(() => store.snapshot().projects[0].sessions.find(session => session.sessionId === sessionId)?.archivedAt, 'archive session from tree', snapshot);
  };
  await archiveSessionFromTree(second.sessionId);
  assert.equal(snapshot().projects[0].sessions.some(session => session.sessionId === second.sessionId), false, 'archived session disappears from active tree');
  await sidebar.executeJavaScript('window.webPilot.openArchive()');
  await waitFor(() => !!getArchiveWindow() && !getArchiveWindow().isDestroyed(), 'session archive window', snapshot);
  let sessionArchiveWindow = getArchiveWindow(), sessionArchive = sessionArchiveWindow.webContents;
  await waitFor(() => sessionArchive.executeJavaScript('typeof window.webPilotArchive === "object"'), 'session archive preload ready', snapshot);
  await sessionArchive.executeJavaScript('document.getElementById("tab-sessions").click()');
  await waitFor(() => sessionArchive.executeJavaScript('document.querySelectorAll(".item").length === 1'), 'archived session visible', snapshot);
  assert.ok(await sessionArchive.executeJavaScript('document.querySelector(".item").textContent.includes("Проект Smoke Rename")'));
  assert.ok(await sessionArchive.executeJavaScript('document.querySelector(".item").textContent.includes("Chat")'));
  await sessionArchive.executeJavaScript('document.querySelector(".item").click(); document.getElementById("restore-sessions").click()');
  await waitFor(() => !store.snapshot().projects[0].sessions.find(session => session.sessionId === second.sessionId)?.archivedAt, 'restore archived session', snapshot);
  sessionArchiveWindow.close(); await waitFor(() => !getArchiveWindow() || getArchiveWindow().isDestroyed(), 'close session archive window', snapshot);

  await archiveSessionFromTree(third.sessionId);
  await sidebar.executeJavaScript('window.webPilot.openArchive()');
  await waitFor(() => !!getArchiveWindow() && !getArchiveWindow().isDestroyed(), 'session delete archive window', snapshot);
  sessionArchiveWindow = getArchiveWindow(); sessionArchive = sessionArchiveWindow.webContents;
  await waitFor(() => sessionArchive.executeJavaScript('typeof window.webPilotArchive === "object"'), 'session delete archive preload ready', snapshot);
  await sessionArchive.executeJavaScript('document.getElementById("tab-sessions").click()');
  await waitFor(() => sessionArchive.executeJavaScript('document.querySelectorAll(".item").length === 1'), 'Work session in archive', snapshot);
  assert.ok(await sessionArchive.executeJavaScript('document.querySelector(".item").textContent.includes("Work")'));
  await sessionArchive.executeJavaScript('document.querySelector(".item").click(); document.getElementById("delete-sessions").click()');
  await waitFor(() => sessionArchive.executeJavaScript('!document.getElementById("session-delete-panel").hidden'), 'session local delete confirmation', snapshot);
  assert.ok(await sessionArchive.executeJavaScript('document.getElementById("session-delete-panel").textContent.includes("OpenAI")'));
  await sessionArchive.executeJavaScript('document.getElementById("confirm-session-delete").click()');
  await waitFor(() => !store.snapshot().projects[0].sessions.some(session => session.sessionId === third.sessionId), 'delete archived session locally', snapshot);
  assert.ok(await fs.stat(workspace), 'session delete keeps workspace folder');
  sessionArchiveWindow.close(); await waitFor(() => !getArchiveWindow() || getArchiveWindow().isDestroyed(), 'close session delete archive', snapshot);
  await archiveSessionFromTree(second.sessionId);
  await sidebar.executeJavaScript('document.querySelector(".expand-project").click()');
  await waitFor(() => sidebar.executeJavaScript('document.querySelector(".sessions").hidden && !document.querySelector(".expand-project").disabled'), 'arrow collapses sessions', snapshot);
  assert.equal(store.selected().sessionId, first.sessionId);
  await sidebar.executeJavaScript('document.querySelector(".expand-project").click()');
  await waitFor(() => sidebar.executeJavaScript('!document.querySelector(".sessions").hidden && !document.querySelector(".project").disabled'), 'arrow expands sessions', snapshot);
  assert.equal(store.selected().sessionId, first.sessionId, 'disclosure preserves conversation');
  await sidebar.executeJavaScript('document.querySelector(".project").click()');
  await waitFor(() => store.selected().sessionId === fourth.sessionId && snapshot().context.phase === 'delivered', 'project name selects latest session', snapshot);
  assert.equal(await sidebar.executeJavaScript('document.querySelector(".sessions").scrollTop'), 0);
  await sidebar.executeJavaScript('document.getElementById("toggle-projects").click()');
  await waitFor(() => sidebar.executeJavaScript('document.querySelector(".sessions").hidden && !document.getElementById("toggle-projects").disabled'), 'collapse all projects', snapshot);
  await sidebar.executeJavaScript('document.getElementById("toggle-projects").click()');
  await waitFor(() => sidebar.executeJavaScript('!document.querySelector(".sessions").hidden && !document.getElementById("toggle-projects").disabled'), 'expand all projects', snapshot);
  assert.equal(store.selected().sessionId, fourth.sessionId);
  await sidebar.executeJavaScript(`document.querySelector('[data-session-id="${first.sessionId}"]').click()`);
  await waitFor(() => store.selected().sessionId === first.sessionId && snapshot().context.phase === 'delivered', 'restore old selection for restart check', snapshot);
  const history = new WorkspaceSessions(store.file); await history.load();
  assert.equal(history.selected().sessionId, first.sessionId);
  assert.equal(history.snapshot().projects[0].sessions.length, 3);
  assert.ok(history.snapshot().projects[0].sessions.find(session => session.sessionId === second.sessionId).archivedAt);
  assert.equal(history.snapshot().projects[0].expanded, true);
  const startFile = path.join(workspace, 'docs/WORKFLOW_START.md');
  const startText = await fs.readFile(startFile); await fs.unlink(startFile);
  const urlBefore = browser.getURL();
  await selectWorkspace(workspace);
  assert.equal(snapshot().setup.ready, false);
  assert.ok(snapshot().setup.issues.some(i => i.path === 'docs/WORKFLOW_START.md'));
  assert.equal(store.selected().sessionId, first.sessionId); assert.equal(browser.getURL(), urlBefore);
  await fs.writeFile(startFile, startText);
  await sidebar.executeJavaScript('document.getElementById("setup-cancel").click()');
  await waitFor(() => !snapshot().setup, 'cancel blocked open keeps current session', snapshot);
  const archiveCurrent = async () => {
    await sidebar.executeJavaScript('document.querySelector(".project-menu-button").click(); document.querySelector(".archive-project").click()');
    await waitFor(() => snapshot().archives.some(project => project.workspace === workspace) && !snapshot().selected && !snapshot().pageLoading, 'archive current project', snapshot);
  };
  const makeAux = async (name, suffix) => {
    const dir = path.join(dataDir + '-projects', name);
    await fs.mkdir(path.join(dir, '.harness/plans'), { recursive: true }); await fs.mkdir(path.join(dir, 'scripts'), { recursive: true });
    const plan = { schema_version: 1, plan_revision: 1, project_id: 'fixture-project-' + suffix, project_name: name,
      scope_id: null, execution_scope_status: 'NONE', delivery_status: 'IN_PROGRESS', tasks: [] };
    const planText = '# Fixture\n\n<!-- workflow-state:begin -->\n```json\n' + JSON.stringify(plan, null, 2) + '\n```\n<!-- workflow-state:end -->\n';
    await fs.writeFile(path.join(dir, '.harness/plans/todo-plan.md'), planText);
    await fs.writeFile(path.join(dir, 'scripts/workflow.mjs'), 'export {};\n');
    const selectedProject = await store.select(dir); await store.setArchived(selectedProject.workspace, true); return selectedProject;
  };
  await archiveCurrent();
  assert.equal(await fs.readFile(startFile, 'utf8'), startText.toString(), 'Archiving preserves workspace files');
  const auxB = await makeAux('Архив B', 'b'), auxC = await makeAux('Архив C', 'c'), auxD = await makeAux('Архив D', 'd'), auxE = await makeAux('Архив E', 'e'), auxF = await makeAux('Архив F', 'f');
  assert.equal(store.snapshot().projects.filter(project => project.archivedAt).length, 6);

  await sidebar.executeJavaScript('document.getElementById("open-settings").click()');
  await waitFor(() => !!snapshot().settings, 'gear opens settings', snapshot);
  assert.equal(await sidebar.executeJavaScript('document.getElementById("archive-list").hidden'), true);
  assert.equal(await sidebar.executeJavaScript('document.getElementById("open-archive-window").textContent'), 'Архив…');
  assert.equal(snapshot().platform, process.platform);
  assert.equal(await sidebar.executeJavaScript('document.getElementById("windows-runtime-section").hidden'), true, 'Windows onboarding stays hidden on macOS smoke');
  assert.equal(await sidebar.executeJavaScript('document.getElementById("choose-runtime").hidden'), false, 'macOS keeps manual Codex Local picker');
  assert.equal(snapshot().theme, 'light');
  await sidebar.executeJavaScript('document.getElementById("theme-dark").click()');
  await waitFor(() => snapshot().theme === 'dark', 'switch shell theme to dark', snapshot);
  assert.equal(nativeTheme.shouldUseDarkColors, true);
  let persistedSettings = JSON.parse(await fs.readFile(path.join(dataDir, 'settings.json'), 'utf8'));
  assert.equal(persistedSettings.shellTheme, 'dark'); assert.equal(persistedSettings.sidebarWidth, 408);
  assert.equal(snapshot().hideToolCalls, true);
  await waitFor(() => browser.executeJavaScript('document.getElementById("fixture-tool-call").getAttribute("data-web-pilot-tool-call-hidden") === "true"'), 'default tool call hidden', snapshot);
  await sidebar.executeJavaScript('document.getElementById("tool-calls-show").click()');
  await waitFor(() => snapshot().hideToolCalls === false, 'show tool calls setting', snapshot);
  assert.equal(await browser.executeJavaScript('document.getElementById("fixture-tool-call").hasAttribute("data-web-pilot-tool-call-hidden")'), false);
  await sidebar.executeJavaScript('document.getElementById("tool-calls-hide").click()');
  await waitFor(() => snapshot().hideToolCalls === true, 'hide tool calls setting', snapshot);

  await sidebar.executeJavaScript('document.getElementById("open-archive-window").click()');
  await waitFor(() => !!getArchiveWindow() && !getArchiveWindow().isDestroyed(), 'separate archive window', snapshot);
  const firstArchiveWindow = getArchiveWindow(), archive = firstArchiveWindow.webContents;
  await waitFor(() => archive.executeJavaScript('typeof window.webPilotArchive === "object"'), 'archive preload ready', snapshot);
  assert.deepEqual(await archive.executeJavaScript('({require:typeof require,process:typeof process})'), { require: 'undefined', process: 'undefined' });
  assert.equal(await archive.executeJavaScript('document.querySelectorAll(".item").length'), 6);
  await archive.executeJavaScript('document.getElementById("tab-sessions").click()');
  assert.equal(await archive.executeJavaScript('document.querySelectorAll(".item").length'), 0, 'sessions of archived projects are not duplicated');
  await archive.executeJavaScript('document.getElementById("tab-projects").click()');
  await sidebar.executeJavaScript('window.webPilot.openArchive()');
  await new Promise(resolve => setTimeout(resolve, 100)); assert.equal(getArchiveWindow(), firstArchiveWindow, 'archive window is single-instance');

  const clickArchive = (target, options = {}) => archive.executeJavaScript(`document.querySelector('[data-workspace=${JSON.stringify(target)}]').dispatchEvent(new MouseEvent('click',{bubbles:true,shiftKey:${!!options.shiftKey},metaKey:${!!options.metaKey},ctrlKey:${!!options.ctrlKey}}))`);
  await clickArchive(auxB.workspace); await clickArchive(auxC.workspace, { shiftKey: true });
  assert.equal(await archive.executeJavaScript('document.querySelectorAll(".item.selected").length'), 2, 'Shift selects range');
  await archive.executeJavaScript('document.getElementById("restore").click()');
  await waitFor(() => !store.project(auxB.workspace).archivedAt && !store.project(auxC.workspace).archivedAt, 'batch restore', snapshot);
  await waitFor(() => archive.executeJavaScript('document.querySelectorAll(".item").length === 4'), 'archive list after restore', snapshot);

  await clickArchive(auxD.workspace); await clickArchive(workspace, { metaKey: true });
  assert.equal(await archive.executeJavaScript('document.querySelectorAll(".item.selected").length'), 2, 'Command toggles separate item');
  await archive.executeJavaScript('document.getElementById("forget").click()');
  await waitFor(() => !store.project(auxD.workspace) && !store.project(workspace), 'batch forget', snapshot);
  assert.ok(await fs.stat(auxD.workspace)); assert.ok(await fs.stat(workspace));
  const reattached = await store.select(workspace); assert.equal(reattached.workspace, workspace); assert.equal(store.project(workspace).archivedAt, null, 'forgotten folder can be attached again');

  await clickArchive(auxF.workspace);
  assert.equal(await archive.executeJavaScript('document.getElementById("delete").disabled'), false);
  await archive.executeJavaScript('document.getElementById("delete").click()');
  await waitFor(() => archive.executeJavaScript('!document.getElementById("delete-panel").hidden'), 'delete preview in archive window', snapshot);
  assert.equal(await archive.executeJavaScript('document.getElementById("confirm-delete").disabled'), true);
  await archive.executeJavaScript('document.getElementById("cancel-delete").click()');
  await waitFor(() => archive.executeJavaScript('document.getElementById("delete-panel").hidden'), 'cancel archive deletion', snapshot); assert.ok(await fs.stat(auxF.workspace));
  await archive.executeJavaScript('document.getElementById("delete").click()');
  await waitFor(() => archive.executeJavaScript('!document.getElementById("delete-panel").hidden'), 'second delete preview', snapshot);
  await archive.executeJavaScript(`{ const input=document.getElementById('delete-confirmation'); input.value=${JSON.stringify(auxF.name)}; input.dispatchEvent(new Event('input',{bubbles:true})); document.getElementById('confirm-delete').click(); }`);
  await waitFor(() => !store.project(auxF.workspace), 'confirmed local deletion from archive window', snapshot);
  await assert.rejects(fs.stat(auxF.workspace), { code: 'ENOENT' });
  assert.ok(store.project(auxE.workspace)?.archivedAt, 'unselected archived project is untouched');
  await browser.loadURL(first.chatUrl);
  assert.equal(await browser.executeJavaScript('window.fixtureMessages.length'), 2, 'Web conversation remains after archive operations');
  firstArchiveWindow.close();

  assert.equal(await sidebar.executeJavaScript('document.getElementById("context-window-card")'), null, 'context window indicator is absent');
  assert.equal(Object.hasOwn(snapshot(), 'contextWindow'), false, 'sidebar snapshot exposes no contextWindow state');

  await browser.executeJavaScript(`fetch('/backend-api/f/conversation',{method:'POST'}).then(response=>response.text())`);
  await waitFor(async () => {
    await chromiumDiagnostics.flush();
    const text = await fs.readFile(chromiumDiagnosticsFile, 'utf8');
    return text.includes('conversation-stream-inspected');
  }, 'conversation SSE diagnostics', snapshot);
  assert.equal(Object.hasOwn(snapshot(), 'contextWindow'), false, 'telemetry does not republish contextWindow state');
  await chromiumDiagnostics.sampleDom(); await chromiumDiagnostics.flush();
  const diagnosticLines = (await fs.readFile(chromiumDiagnosticsFile, 'utf8')).trim().split('\n').map(line => JSON.parse(line));
  assert.ok(diagnosticLines.some(entry => entry.source === 'diagnostics' && entry.event === 'session-start'), 'diagnostic session is logged');
  assert.ok(diagnosticLines.some(entry => entry.source === 'cdp' && entry.event === 'attached'), 'CDP is attached');
  assert.ok(diagnosticLines.some(entry => entry.source === 'webContents' && entry.event === 'did-finish-load'), 'native load is logged');
  assert.ok(diagnosticLines.some(entry => entry.source === 'dom' && entry.event === 'pulse' && entry.userMessages >= 1 && entry.composer === true), 'DOM pulse is logged');
  assert.ok(diagnosticLines.some(entry => entry.source === 'cdp' && ['request','response','loading-finished'].includes(entry.event)), 'network metadata is logged');
  assert.ok(diagnosticLines.some(entry => entry.source === 'telemetry' && entry.event === 'conversation-stream-inspected' && entry.telemetryFound === true), 'conversation SSE body is inspected');
  assert.ok(diagnosticLines.some(entry => entry.source === 'telemetry' && entry.event === 'context' && entry.origin === 'conversation-sse'
    && entry.inputTokens === 229043 && entry.modelContextWindow === 258400 && entry.compactSignal === 'direct'), 'context and compact telemetry is extracted');
  const diagnosticText = JSON.stringify(diagnosticLines);
  assert.equal(diagnosticText.includes('Раздел 1: полный контекст проекта'), false, 'diagnostics never contain project context text');
  assert.equal(diagnosticText.includes('Принимаю текущий план и результат работы'), false, 'diagnostics never contain user message text');
  assert.equal(diagnosticText.includes('PRIVATE STREAM TEXT'), false, 'SSE private text is never logged');
  assert.equal(diagnosticText.includes('PRIVATE-COMPACTION-ID'), false, 'SSE item identifiers are never logged');


  // Exercise the real local IPC and navigation after all legacy fixture assertions.
  await sidebar.executeJavaScript('window.webPilot.closeSettings()');
  await selectWorkspace(workspace);
  await waitFor(() => snapshot().context.phase === 'delivered', 'transition fixture initial context', snapshot);
  assert.equal(snapshot().scopeTransition, null, 'historical NONE does not ask for a new session');
  await sidebar.executeJavaScript('window.webPilot.setSidebarWidth(312)');
  for (const experience of ['chat', 'work']) {
    const scopeId = 'fixture-continue-' + experience;
    const source = store.selected(), beforeCount = store.snapshot().projects.find(p => p.workspace === workspace).sessions.length;
    // Use a genuine Kit plan and archive so workspace review validates real history.
    createScope(workspace, {
      scope_id: scopeId, objective: 'Следующая сессия ' + experience, approval_note: 'Изолированный smoke fixture, разрешённый проверкой перехода.',
      acceptance_criteria: ['Fixture завершён'], approved_scope: { functional_paths: [], documentation_paths: ['docs/PRODUCT.md'], max_functional_files_per_task: 3 },
      context_pack: { documents: [], include_last_completed_task: false, dependency_task_ids: [] },
      tasks: [{ id: 'T001', title: 'Записать fixture', why: 'Проверить lifecycle', dependencies: [],
        functional_paths: [], documentation_paths: ['docs/PRODUCT.md'], acceptance_criteria: ['Запись добавлена'],
        verification_ids: [], expected_commit_message: 'docs: transition fixture' }],
    });
    startTask(workspace, 'T001');
    await fs.appendFile(path.join(workspace, 'docs/PRODUCT.md'), '\nTransition fixture ' + experience + '\n');
    assert.equal(commitTask(workspace, 'T001').ok, true);
    controller.attach(store.selected()); await controller.tick();
    await waitFor(() => store.selected().scopeTransition?.scopeId === scopeId, 'watch scope before closing', snapshot);
    assert.equal(snapshot().scopeTransition, null, 'READY alone cannot open a session');
    assert.equal(await sidebar.executeJavaScript('document.getElementById("next-session-choice").hidden'), true);
    if (experience === 'chat') {
      await waitFor(() => sidebar.executeJavaScript('!document.getElementById("accept-plan").disabled'), 'transition accept button enabled', snapshot);
      await sidebar.executeJavaScript('document.getElementById("accept-plan").click()');
      await waitFor(() => snapshot().planAcceptance === 'sent', 'transition acceptance sent', snapshot);
    }
    // Chat models a button-triggered archive; Work models a direct agent archive.
    assert.equal(archiveScope(workspace, scopeId, 'Прямая команда закрыть изолированный проверочный scope.').ok, true);
    const archivedInfo = await readWorkspace(workspace);
    controller.attach(store.selected()); await controller.tick();
    await waitFor(() => snapshot().scopeTransition?.scopeId === scopeId, 'choice after archive', snapshot);
    await waitFor(() => sidebar.executeJavaScript('!document.getElementById("next-session-choice").hidden'), 'visible Chat Work question', snapshot);
    assert.equal(store.selected().sessionId, source.sessionId, 'no navigation before explicit mode choice');
    const resumedTransition = new WorkspaceSessions(store.file); await resumedTransition.load();
    assert.equal(resumedTransition.selected().scopeTransition.state, 'choice');
    const questionBounds = await sidebar.executeJavaScript(`(() => {
      const e=document.getElementById('next-session-choice'); const r=e.getBoundingClientRect();
      return { width:r.width, scroll:e.scrollWidth, buttons:Array.from(e.querySelectorAll('button')).map(b=>b.textContent) };
    })()`);
    assert.ok(questionBounds.width >= questionBounds.scroll - 1, 'question fits minimum sidebar width');
    assert.deepEqual(questionBounds.buttons, ['Chat', 'Work']);
    if (experience === 'chat') await fs.writeFile(path.join(dataDir, 'next-session-choice.png'), (await sidebar.capturePage()).toPNG());
    await sidebar.executeJavaScript(`document.getElementById('next-session-${experience}').click(); document.getElementById('next-session-${experience}').click()`);
    await waitFor(() => store.selected().sessionId !== source.sessionId && snapshot().context.phase === 'delivered',
      'post-archive ' + experience + ' context delivered', snapshot);
    const next = store.selected();
    assert.equal(next.experience, experience); assert.equal(next.attempt.packet.facts.scope_id, null);
    assert.equal(next.attempt.packet.facts.execution_scope_status, 'NONE');
    assert.equal(next.attempt.packet.facts.plan_revision, archivedInfo.planRevision);
    assert.equal(await browser.executeJavaScript('window.fixtureMessages.length'), 1);
    assert.equal(await browser.executeJavaScript('window.fixtureMessages[0].mode'), experience === 'chat' ? 'chatgpt' : 'work');
    assert.equal(snapshot().scopeTransition, null);
    assert.equal(store.snapshot().projects.find(p => p.workspace === workspace).sessions.length, beforeCount + 1);
    assert.equal(store.snapshot().projects.find(p => p.workspace === workspace).sessions.find(s => s.sessionId === source.sessionId).chatUrl, source.chatUrl);
    const reopened = new WorkspaceSessions(store.file); await reopened.load();
    assert.equal(reopened.selected().sessionId, next.sessionId);
    assert.equal(reopened.selected().scopeTransition.state, 'opened');
    const duplicate = await sidebar.executeJavaScript(`window.webPilot.continueAfterScope(${JSON.stringify(workspace)}, ${JSON.stringify(scopeId)}, ${JSON.stringify(experience)})`);
    assert.equal(duplicate.ok, true);
    await waitFor(() => snapshot().context.phase === 'delivered', 'repeat reopens existing session', snapshot);
    assert.equal(store.selected().sessionId, next.sessionId);
    assert.equal(store.snapshot().projects.find(p => p.workspace === workspace).sessions.length, beforeCount + 1);
    assert.equal(await browser.executeJavaScript('window.fixtureMessages.length'), 1);
  }

  const result = { newestSessionFirst: true, projectSelectsNewest: true, threeSessionViewport: true, sessionScrollPreserved: true, visibleSessionScrollbar: true, nativeProjectsDisclosure: true, treePopover: true, treeScreenshots, scopeContinuationChat: true, scopeContinuationWork: true, scopeContinuationRestart: true, scopeContinuationNoDuplicates: true,
    transitionScreenshot: path.join(dataDir, 'next-session-choice.png'), mode: 'isolated-fixture', electron: process.versions.electron, chromium: process.versions.chrome,
    views: window.contentView.children.length, secureRemote: true, sidebarIpc: true, archiveRestore: true, archiveRestart: true, deleteCancel: true, localDeletion: true, cloudChatPreserved: true, workspaceCreation: true, workspaceValidation: true, cancelPreservesSession: true, startupMessages: 4, canonicalPacketLoads: packetLoads, recoveryCache: true, operationProgress: true, progressScreenshot: path.join(dataDir, 'progress-ui.png'),
    tokenCounterRemoved: true, projectRename: true, sessionRename: true, scopeSessionRename: true, restartKeepsSession: true, newChatCreatesSession: true, sessionTree: true, selectsEarlierSession: true, compactWorkspaceDetails: true, projectPathClipboard: true, planAcceptanceButton: true, chromiumDiagnostics: true, contextWindowIndicatorRemoved: true, resizableSidebar: true, separateArchiveWindow: true, archiveMultiSelect: true, archiveForgetKeepsFolder: true, shellTheme: true, nativeTitlebarTheme: nativeTheme.shouldUseDarkColors, toolCallFilter: true, microphonePermission: true, geolocationPermission: true, cameraPermission: false, fullContextBytes: Buffer.byteLength(fixtureContext), liveChatGPT: false, agentToolsRequired: false };
  await fs.writeFile(path.join(dataDir, 'smoke-result.json'), JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result));
}
