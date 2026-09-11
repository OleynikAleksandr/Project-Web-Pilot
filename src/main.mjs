import { app, BaseWindow, WebContentsView, Menu, session, ipcMain, dialog } from 'electron';
import path from 'node:path';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import os from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { WorkspaceSessions, normalizeChatUrl } from './workspace-session.mjs';
import { McpRuntime, findRuntimeFolder } from './mcp-runtime.mjs';
import { ChatGPTComposer } from './chatgpt-composer.mjs';
import { ContextSession } from './context-session.mjs';

const smoke = !app.isPackaged && process.argv.includes('--smoke');
const sourceDir = path.dirname(fileURLToPath(import.meta.url));
const sidebarUrl = pathToFileURL(path.join(sourceDir, 'ui/index.html')).href;
app.setName('Project Web Pilot');
app.setPath('userData', smoke ? fs.mkdtempSync(path.join(os.tmpdir(), 'web-pilot-electron-smoke-'))
  : path.join(app.getPath('appData'), 'Project Web Pilot'));
const dataDir = app.getPath('userData');
const settingsFile = path.join(dataDir, 'settings.json');
const store = new WorkspaceSessions(path.join(dataDir, 'workspaces.json'));
const partition = smoke ? 'web-pilot-smoke' : 'persist:chatgpt';
let runtimeFolder = path.join(os.homedir(), 'VSCODE/Codex Local Mac/mac-codex-local');
let window, browser, sidebar, runtime, controller, interval, fixture;
let navigationId = 0;
let pageLoading = false;
let startupError = null;
let storageError = false;
let lastDiagnostic = '';
let actionTail = Promise.resolve();

function publicError(error) { return { code: error.code ?? 'APP_ERROR', message: String(error.message ?? error).slice(0, 700) }; }
function snapshot() {
  const saved = store.selected();
  const info = controller?.state.projectInfo;
  const selected = saved && { ...saved, attempt: saved.attempt && { protocol: saved.attempt.protocol,
    requestId: saved.attempt.requestId, state: saved.attempt.state }, receipt: undefined,
    ...(info?.workspace === saved.workspace ? info : {}) };
  return { projects: store.snapshot().projects.map(({ workspace, projectId, name, chatUrl }) => ({ workspace, projectId, name, chatUrl })),
    selected, context: controller?.state ?? { phase: 'selected', servicesReady: false, messageSent: false },
    runtimeFolder, pageLoading, startupError, storageError, version: app.getVersion(), fixture: smoke };
}

function publish() {
  if (sidebar && !sidebar.webContents.isDestroyed()) sidebar.webContents.send('pilot:state-changed', snapshot());
  const state = snapshot();
  const record = { phase: state.context.phase, workspace: state.selected?.workspace, sessionId: state.selected?.sessionId,
    requestId: state.selected?.attempt?.requestId, contextSha256: state.context.delivery?.contextSha256,
    planRevision: state.context.projectInfo?.planRevision, errorCode: state.context.error?.code ?? startupError?.code };
  const signature = JSON.stringify(record);
  if (signature !== lastDiagnostic) {
    lastDiagnostic = signature;
    fsp.mkdir(dataDir, { recursive: true, mode: 0o700 })
      .then(() => fsp.appendFile(path.join(dataDir, 'diagnostics.jsonl'), JSON.stringify({ at: new Date().toISOString(), fixture: smoke, ...record }) + '\n', { mode: 0o600 }))
      .catch(() => {});
  }
}

function report(error) { startupError = publicError(error); publish(); }
function remotePreferences() {
  return { partition, nodeIntegration: false, contextIsolation: true, sandbox: true, webSecurity: true };
}

function secureRemote(contents) {
  contents.on('will-navigate', (event, url) => { if (!url.startsWith('https://')) event.preventDefault(); });
  contents.setWindowOpenHandler(({ url }) => ({ action: url.startsWith('https://') ? 'allow' : 'deny',
    overrideBrowserWindowOptions: { width: 980, height: 780, webPreferences: remotePreferences() } }));
  contents.on('did-create-window', child => secureRemote(child.webContents));
}

function layout() {
  if (!window || window.isDestroyed()) return;
  const [width, height] = window.getContentSize();
  const sidebarWidth = 312;
  sidebar.setBounds({ x: 0, y: 0, width: sidebarWidth, height });
  browser.setBounds({ x: sidebarWidth, y: 0, width: Math.max(0, width - sidebarWidth), height });
}

function assertLocalSender(event) {
  if (!sidebar || event.sender !== sidebar.webContents || event.senderFrame !== sidebar.webContents.mainFrame
      || event.senderFrame.url !== sidebarUrl) throw Object.assign(new Error('Недопустимый источник команды.'), { code: 'IPC_FORBIDDEN' });
}

function registerAction(channel, action) {
  ipcMain.handle(channel, (event, input) => {
    assertLocalSender(event);
    const operation = actionTail.catch(() => {}).then(async () => {
      try { const result = await action(input); publish(); return { ok: true, state: snapshot(), result }; }
      catch (error) { report(error); return { ok: false, error: publicError(error), state: snapshot() }; }
    });
    actionTail = operation;
    return operation;
  });
}

async function navigate(project = store.selected()) {
  const ownNavigation = ++navigationId;
  controller?.cancel();
  pageLoading = true; publish();
  const target = project?.chatUrl ?? 'https://chatgpt.com/';
  try {
    await browser.webContents.loadURL(target);
    if (ownNavigation !== navigationId) return;
    pageLoading = false;
    if (project) {
      controller.attach(store.project(project.workspace));
      void controller.tick();
    }
    publish();
  } catch (error) {
    if (ownNavigation !== navigationId) return;
    pageLoading = false;
    report(Object.assign(new Error('Не удалось открыть ChatGPT. Проверьте интернет и нажмите обновление рядом с проектами.'), { code: 'PAGE_LOAD_FAILED' }));
  }
}

async function selectWorkspace(input) {
  if (storageError) throw new Error('Сначала нужно восстановить сохранённый список проектов. Исходный файл оставлен без изменений.');
  controller?.cancel();
  startupError = null;
  const project = await store.select(input);
  publish();
  // Let the native sidebar stay responsive while the remote page loads.
  void navigate(project);
  return project;
}

function connectController() {
  controller?.cancel();
  controller = new ContextSession({ store, runtime, composer: new ChatGPTComposer(browser.webContents), onChange: publish });
}

function registerIpc() {
  ipcMain.handle('pilot:get-state', event => { assertLocalSender(event); return snapshot(); });
  registerAction('pilot:choose-workspace', async () => {
    controller?.cancel();
    const result = await dialog.showOpenDialog(window, { title: 'Открыть папку проекта',
      buttonLabel: 'Открыть проект', properties: ['openDirectory'], defaultPath: path.join(os.homedir(), 'VSCODE') });
    if (result.canceled) { const current = store.selected(); if (current) controller.attach(current); return; }
    return selectWorkspace(result.filePaths[0]);
  });
  registerAction('pilot:select-workspace', input => {
    if (typeof input !== 'string' || !store.project(input)) throw new Error('Выберите проект из списка.');
    return selectWorkspace(input);
  });
  registerAction('pilot:new-chat', async () => {
    const current = store.selected(); if (!current) return;
    controller.cancel();
    const project = await store.newChat(current.workspace);
    startupError = null; void navigate(project);
  });
  registerAction('pilot:return-chat', () => { startupError = null; void navigate(); });
  registerAction('pilot:retry', async () => {
    startupError = null;
    if (!controller.active) { const current = store.selected(); if (current) controller.attach(current); }
    await controller.retry();
  });
  registerAction('pilot:reload', () => { startupError = null; void navigate(); });
  registerAction('pilot:choose-runtime', async () => {
    const result = await dialog.showOpenDialog(window, { title: 'Выбрать Codex Local Mac', buttonLabel: 'Подключить',
      properties: ['openDirectory'], defaultPath: runtimeFolder });
    if (result.canceled) return;
    const selected = await findRuntimeFolder(result.filePaths[0]);
    controller.cancel();
    await fsp.mkdir(dataDir, { recursive: true, mode: 0o700 });
    await fsp.writeFile(settingsFile + '.tmp', JSON.stringify({ runtimeFolder: selected }, null, 2) + '\n', { mode: 0o600 });
    await fsp.rename(settingsFile + '.tmp', settingsFile);
    runtimeFolder = selected;
    runtime = new McpRuntime(runtimeFolder);
    connectController();
    startupError = null;
    const current = store.selected(); if (current) controller.attach(current);
  });
}

async function createWindow() {
  window = new BaseWindow({ title: smoke ? 'Project Web Pilot — TEST FIXTURE' : 'Project Web Pilot',
    width: 1440, height: 940, minWidth: 980, minHeight: 700, backgroundColor: '#f4f6f8' });
  sidebar = new WebContentsView({ webPreferences: { preload: path.join(sourceDir, 'preload.cjs'),
    nodeIntegration: false, contextIsolation: true, sandbox: true, webSecurity: true } });
  browser = new WebContentsView({ webPreferences: remotePreferences() });
  window.contentView.addChildView(sidebar); window.contentView.addChildView(browser);
  secureRemote(browser.webContents);
  sidebar.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  sidebar.webContents.on('will-navigate', event => event.preventDefault());
  sidebar.webContents.on('did-finish-load', publish);
  browser.webContents.on('did-navigate-in-page', () => { publish(); if (!pageLoading) void controller?.tick(); });
  browser.webContents.on('did-finish-load', () => { publish(); if (!pageLoading) void controller?.tick(); });
  browser.webContents.on('render-process-gone', () => { controller?.cancel(); report(new Error('Страница ChatGPT закрылась. Нажмите обновление.')); });
  window.on('resize', layout);
  window.on('closed', () => {
    controller?.cancel(); clearInterval(interval);
    for (const view of [sidebar, browser]) if (!view.webContents.isDestroyed()) view.webContents.close();
    window = null;
  });
  layout();
  if (smoke) {
    fixture = await import('../tests/electron-smoke.mjs');
    runtime = await fixture.createRuntime({ browser: browser.webContents, session: session.fromPartition(partition), dataDir });
  } else runtime = new McpRuntime(runtimeFolder);
  connectController();
  registerIpc();
  await sidebar.webContents.loadURL(sidebarUrl);
  interval = setInterval(() => { if (!pageLoading) void controller.tick(); }, 1500);
  if (smoke) {
    await fixture.run({ app, window, browser: browser.webContents, sidebar: sidebar.webContents,
      store, controller, selectWorkspace, snapshot, assertLocalSender, dataDir });
    window.close(); app.quit();
  } else void navigate();
}

function installMenu() {
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    { label: 'Project Web Pilot', submenu: [{ role: 'about', label: 'О Project Web Pilot' }, { type: 'separator' },
      { role: 'hide', label: 'Скрыть' }, { role: 'quit', label: 'Завершить Project Web Pilot' }] },
    { label: 'Правка', submenu: [{ role: 'undo' }, { role: 'redo' }, { type: 'separator' },
      { role: 'cut' }, { role: 'copy' }, { role: 'paste' }, { role: 'selectAll' }] },
    { label: 'Вид', submenu: [{ label: 'Обновить ChatGPT', accelerator: 'CmdOrCtrl+R', click: () => { if (browser) void navigate(); } },
      { role: 'togglefullscreen' }, { role: 'resetZoom' }, { role: 'zoomIn' }, { role: 'zoomOut' }] },
  ]));
}

if (!smoke && !app.requestSingleInstanceLock()) app.quit();
else {
  app.on('second-instance', () => { if (window?.isMinimized()) window.restore(); window?.focus(); });
  app.on('window-all-closed', () => app.quit());
  app.whenReady().then(async () => {
    try {
      const settings = JSON.parse(await fsp.readFile(settingsFile, 'utf8'));
      if (typeof settings.runtimeFolder === 'string' && path.isAbsolute(settings.runtimeFolder)) runtimeFolder = settings.runtimeFolder;
    } catch (error) { if (error.code !== 'ENOENT') startupError = { code: 'SETTINGS_INVALID', message: 'Не удалось прочитать настройки подключения. Выберите папку Codex Local Mac в подробностях.' }; }
    try { await store.load(); } catch (error) { startupError = publicError(error); storageError = true; }
    const remoteSession = session.fromPartition(partition);
    remoteSession.setPermissionRequestHandler((_contents, _permission, callback) => callback(false));
    remoteSession.setPermissionCheckHandler(() => false);
    installMenu();
    await createWindow();
  }).catch(error => {
    console.error('Project Web Pilot:', error.message);
    if (!smoke) dialog.showErrorBox('Project Web Pilot', error.message);
    app.exit(1);
  });
}
