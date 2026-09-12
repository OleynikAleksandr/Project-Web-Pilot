import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { nativeTheme } from 'electron';
import { readWorkspace, WorkspaceSessions } from '../src/workspace-session.mjs';

let packetLoads = 0;
const fixtureContext = Array.from({ length: 400 }, (_, i) => `Раздел ${i + 1}: полный контекст проекта, включая кириллицу и точные пути.\n  Файл: /Projects/Мой проект/src/модуль.mjs\n\n`).join('');
const html = `<!doctype html><html lang="ru"><head><meta charset="utf-8"><title>TEST FIXTURE — no live ChatGPT</title>
<style>body{font:16px -apple-system,sans-serif;padding:40px;background:#fcfcff;color:#29394c}aside{background:#fff0d7;padding:14px;margin-bottom:20px}#prompt-textarea{border:1px solid #9caeb8;padding:12px;min-height:80px;white-space:pre-wrap}button{padding:10px}article{white-space:pre-wrap;font-size:12px}</style></head>
<body><aside>TEST FIXTURE · без реального ChatGPT, MCP и аккаунта</aside><h1>Composer fixture</h1>
<div id="tool-activity"><button id="fixture-tool-call" type="button">Вызываемый инструмент</button></div>
<div id="messages"></div><form><div id="prompt-textarea" contenteditable="true" role="textbox"></div><button type="submit" data-testid="send-button">Send fixture</button></form>
<script>
window.fixtureMessages=JSON.parse(sessionStorage.getItem(location.pathname)||'[]');
function showMessage(text){const article=document.createElement('article');article.setAttribute('data-message-author-role','user');article.textContent=text;document.getElementById('messages').append(article);}
window.fixtureMessages.forEach(message=>showMessage(message.text));
document.querySelector('form').addEventListener('submit',event=>{
 event.preventDefault(); const editor=document.getElementById('prompt-textarea');const text=editor.innerText;
 const message={text,at:Date.now()};window.fixtureMessages.push(message);
 showMessage(text);
 editor.textContent='';const id=text.match(/wp-request-[a-zA-Z0-9-]+/)[0];history.pushState({},'', '/c/'+id);sessionStorage.setItem(location.pathname,JSON.stringify(window.fixtureMessages));
});
</script></body></html>`;

export async function createRuntime({ browser, session }) {
  // Explicit isolated test mode only. No request is sent to a real service.
  await session.protocol.handle('https', () => new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8' } }));
  return {
    ensure: async () => ({ mcp: { ready: true }, tunnel: { ready: true }, fixture: true }),
    loadContext: async workspace => {
      packetLoads++;
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

export async function run({ app, window, browser, sidebar, store, controller, selectWorkspace, snapshot, assertLocalSender, permissionAllowed, dataDir, getArchiveWindow }) {
  assert.equal(app.isPackaged, false, 'Fixtures never run from a packaged app');
  assert.equal(permissionAllowed('media', 'https://chatgpt.com', { mediaTypes: ['audio'] }), true);
  assert.equal(permissionAllowed('media', 'https://chatgpt.com/', { mediaType: 'audio' }), true);
  assert.equal(permissionAllowed('media', 'https://chatgpt.com', { mediaTypes: ['video'] }), false);
  assert.equal(permissionAllowed('media', 'https://chatgpt.com', { mediaTypes: ['audio', 'video'] }), false);
  assert.equal(permissionAllowed('geolocation', 'https://chatgpt.com', {}), true);
  assert.equal(permissionAllowed('geolocation-approximate', 'https://chatgpt.com', {}), true);
  assert.equal(permissionAllowed('notifications', 'https://chatgpt.com', {}), false);
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
  const previewNew = async () => {
    await sidebar.executeJavaScript('document.getElementById("create-workspace").click()');
    await waitFor(() => snapshot().setup?.phase === 'form', 'new workspace form', snapshot);
    await sidebar.executeJavaScript(`document.getElementById('setup-name').value='Тестовый проект с пробелами'; document.getElementById('setup-preview').click()`);
    await waitFor(() => snapshot().setup?.phase === 'preview', 'new workspace preview', snapshot);
  };
  await previewNew();
  assert.equal(snapshot().setup.action, 'install'); assert.equal(packetLoads, 0); assert.equal(store.selected(), null);
  await assert.rejects(fs.stat(workspace), { code: 'ENOENT' });
  assert.ok(snapshot().setup.files.some(f => f.path === 'AGENTS.md'));
  await sidebar.executeJavaScript('document.getElementById("setup-cancel").click()');
  await waitFor(() => !snapshot().setup, 'cancel without creating', snapshot);
  await assert.rejects(fs.stat(workspace), { code: 'ENOENT' });
  await previewNew();
  await sidebar.executeJavaScript('document.getElementById("setup-apply").click()');
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
  assert.ok(first.chatUrl.startsWith('https://chatgpt.com/c/'));
  assert.equal(first.attempt.state, 'sent');
  assert.ok(first.attempt.text.includes(fixtureContext));
  assert.ok(Buffer.byteLength(fixtureContext) > 60000);
  assert.equal(snapshot().selected.attempt.text, undefined, 'Full prompt stays out of sidebar IPC');
  const sent = await browser.executeJavaScript('window.fixtureMessages[0].text');
  assert.equal(sent.replace(/\n+/g, '\n'), first.attempt.text.replace(/\n+/g, '\n'));
  assert.equal(first.receipt, null);
  assert.equal(packetLoads, 1);
  assert.deepEqual(await browser.executeJavaScript('({ require:typeof require, process:typeof process, bridge:typeof window.webPilot })'),
    { require: 'undefined', process: 'undefined', bridge: 'undefined' });
  const prefs = browser.getLastWebPreferences();
  assert.equal(prefs.nodeIntegration, false); assert.equal(prefs.contextIsolation, true); assert.equal(prefs.sandbox, true);
  assert.throws(() => assertLocalSender({ sender: browser, senderFrame: browser.mainFrame }), { code: 'IPC_FORBIDDEN' });
  assert.equal(await sidebar.executeJavaScript('document.getElementById("context-title").textContent'), 'Контекст передан');
  assert.equal(await sidebar.executeJavaScript('document.getElementById("workspace-name").textContent'), 'Тестовый проект с пробелами');
  const restored = new WorkspaceSessions(store.file); await restored.load();
  assert.equal(restored.selected().sessionId, first.sessionId); assert.equal(restored.selected().chatUrl, first.chatUrl);
  controller.attach(store.selected()); await controller.tick();
  assert.equal(packetLoads, 1);
  await sidebar.executeJavaScript('document.getElementById("new-chat").click()');
  await waitFor(() => store.selected()?.sessionId !== first.sessionId && snapshot().context.phase === 'delivered', 'new chat via actual sidebar IPC', snapshot);
  assert.equal(packetLoads, 2);
  assert.equal(await browser.executeJavaScript('window.fixtureMessages.length'), 1);
  const second = store.selected();
  assert.equal(store.snapshot().projects[0].sessions.length, 2);
  assert.equal(snapshot().projects[0].sessions[0].attempt, undefined, 'Session tree only receives metadata');
  await sidebar.executeJavaScript(`document.querySelector('[data-session-id="${first.sessionId}"]').click()`);
  await waitFor(() => store.selected()?.sessionId === first.sessionId && snapshot().context.phase === 'delivered'
    && browser.getURL() === first.chatUrl, 'select earlier session via tree', snapshot);
  assert.equal(packetLoads, 2, 'Earlier chat does not receive another context packet');
  assert.equal(await browser.executeJavaScript('window.fixtureMessages.length'), 1);
  assert.ok(await browser.executeJavaScript(`window.fixtureMessages[0].text.includes('${first.attempt.requestId}')`));
  assert.equal(store.selected().attempt.requestId, first.attempt.requestId);
  assert.equal(store.snapshot().projects[0].sessions[1].sessionId, second.sessionId);
  const doubleClickWorkspace = () => sidebar.executeJavaScript(`{
    const button = document.querySelector('.project');
    button.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
    button.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 2 }));
    button.dispatchEvent(new MouseEvent('dblclick', { bubbles: true, detail: 2 }));
  }`);
  await doubleClickWorkspace();
  await waitFor(() => sidebar.executeJavaScript('document.querySelector(".sessions").hidden'), 'double click collapses sessions', snapshot);
  await doubleClickWorkspace();
  await waitFor(() => sidebar.executeJavaScript('!document.querySelector(".sessions").hidden'), 'double click expands sessions', snapshot);
  assert.equal(store.selected().sessionId, first.sessionId, 'Expanding does not switch to latest session');
  const history = new WorkspaceSessions(store.file); await history.load();
  assert.equal(history.selected().sessionId, first.sessionId);
  assert.equal(history.snapshot().projects[0].sessions.length, 2);
  assert.equal(history.snapshot().projects[0].expanded, true);
  const startFile = path.join(workspace, 'docs/WORKFLOW_START.md');
  const startText = await fs.readFile(startFile); await fs.unlink(startFile);
  const urlBefore = browser.getURL();
  await selectWorkspace(workspace);
  assert.equal(snapshot().setup.ready, false);
  assert.ok(snapshot().setup.issues.some(i => i.path === 'docs/WORKFLOW_START.md'));
  assert.equal(store.selected().sessionId, first.sessionId); assert.equal(browser.getURL(), urlBefore); assert.equal(packetLoads, 2);
  await fs.writeFile(startFile, startText);
  await sidebar.executeJavaScript('document.getElementById("setup-cancel").click()');
  await waitFor(() => !snapshot().setup, 'cancel blocked open keeps current session', snapshot);
  const archiveCurrent = async () => {
    await sidebar.executeJavaScript('document.querySelector(".project-menu-button").click(); document.querySelector(".archive-project").click()');
    await waitFor(() => snapshot().archives.some(project => project.workspace === workspace) && !snapshot().selected && !snapshot().pageLoading, 'archive current project', snapshot);
    assert.equal(packetLoads, 2);
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
  assert.equal(await sidebar.executeJavaScript('document.getElementById("open-archive-window").textContent'), 'Архив проектов…');
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
  assert.equal(await browser.executeJavaScript('window.fixtureMessages.length'), 1, 'Web conversation remains after archive operations');
  assert.equal(packetLoads, 2, 'Archive operations never send context packets');
  firstArchiveWindow.close();
  const result = { mode: 'isolated-fixture', electron: process.versions.electron, chromium: process.versions.chrome,
    views: window.contentView.children.length, secureRemote: true, sidebarIpc: true, archiveRestore: true, archiveRestart: true, deleteCancel: true, localDeletion: true, cloudChatPreserved: true, workspaceCreation: true, workspaceValidation: true, cancelPreservesSession: true, startupMessages: packetLoads,
    restartKeepsSession: true, newChatCreatesSession: true, sessionTree: true, selectsEarlierSession: true, resizableSidebar: true, separateArchiveWindow: true, archiveMultiSelect: true, archiveForgetKeepsFolder: true, shellTheme: true, nativeTitlebarTheme: nativeTheme.shouldUseDarkColors, toolCallFilter: true, microphonePermission: true, geolocationPermission: true, cameraPermission: false, fullContextBytes: Buffer.byteLength(fixtureContext), liveChatGPT: false, agentToolsRequired: false };
  await fs.writeFile(path.join(dataDir, 'smoke-result.json'), JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result));
}
