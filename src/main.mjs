import { app, BaseWindow, BrowserWindow, WebContentsView, Menu, session, ipcMain, dialog, nativeTheme, clipboard } from 'electron';
import path from 'node:path';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import os from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { WorkspaceSessions, normalizeChatUrl } from './workspace-session.mjs';
import { McpRuntime, findRuntimeFolder } from './mcp-runtime.mjs';
import { ChatGPTComposer } from './chatgpt-composer.mjs';
import { ContextSession } from './context-session.mjs';
import { WorkspaceDeletion } from './workspace-deletion.mjs';
import { WorkspaceSetup } from './workspace-setup.mjs';

const smoke = !app.isPackaged && process.argv.includes('--smoke');
const sourceDir = path.dirname(fileURLToPath(import.meta.url));
const sidebarUrl = pathToFileURL(path.join(sourceDir, 'ui/index.html')).href;
const archiveUrl = pathToFileURL(path.join(sourceDir, 'ui/archive.html')).href;
app.setName('Project Web Pilot');
app.setPath('userData', smoke ? fs.mkdtempSync(path.join(os.tmpdir(), 'web-pilot-electron-smoke-'))
  : path.join(app.getPath('appData'), 'Project Web Pilot'));
const dataDir = app.getPath('userData');
const settingsFile = path.join(dataDir, 'settings.json');
const store = new WorkspaceSessions(path.join(dataDir, 'workspaces.json'));
const partition = smoke ? 'web-pilot-smoke' : 'persist:chatgpt';
let runtimeFolder = path.join(os.homedir(), 'VSCODE/Codex Local Mac/mac-codex-local');
let shellTheme = 'light';
let hideToolCalls = true;
const SIDEBAR_MIN_WIDTH = 312;
const BROWSER_MIN_WIDTH = 600;
let sidebarWidth = SIDEBAR_MIN_WIDTH;
let window, browser, sidebar, archiveWindow, runtime, controller, interval, fixture;
let navigationId = 0;
let pageLoading = false;
let startupError = null;
let storageError = false;
let lastDiagnostic = '';
let actionTail = Promise.resolve();
const workspaceSetup = new WorkspaceSetup({ resourceDir: app.isPackaged ? path.join(process.resourcesPath, 'resources') : path.join(sourceDir, '../resources') });
let setupState = null;
let workspaceHealth = null;
let settingsState = null;
let archiveState = { deletion: null, notice: null, focusWorkspace: null };
let deletion;
const shellBackground = { light: '#f4f6f8', dark: '#1b1d22' };

function applyShellTheme(theme) {
  shellTheme = theme === 'dark' ? 'dark' : 'light';
  nativeTheme.themeSource = shellTheme;
  if (window && !window.isDestroyed()) window.setBackgroundColor(shellBackground[shellTheme]);
}

async function applyToolCallVisibility() {
  if (!browser || browser.webContents.isDestroyed()) return;
  const url = browser.webContents.getURL();
  if (!url.startsWith('https://chatgpt.com/')) return;
  const hide = hideToolCalls;
  await browser.webContents.executeJavaScript(`(() => {
    const attr = 'data-web-pilot-tool-call-hidden';
    const stateKey = '__webPilotToolCallFilter';
    const labels = ['вызываемый инструмент', 'called tool', 'tool call'];
    const normalize = value => String(value ?? '').replace(/\\s+/g, ' ').trim().toLocaleLowerCase();
    const restore = () => {
      for (const element of document.querySelectorAll('[' + attr + ']')) {
        element.style.removeProperty('display');
        element.removeAttribute(attr);
      }
    };
    restore();
    window[stateKey]?.disconnect?.();
    delete window[stateKey];
    if (!${hide ? 'true' : 'false'}) return 0;
    const matches = element => {
      const text = normalize(element.textContent);
      return labels.some(label => text === label || text.startsWith(label + ' '));
    };
    const apply = () => {
      for (const element of document.querySelectorAll('button,[role="button"],summary')) {
        if (!matches(element)) continue;
        element.setAttribute(attr, 'true');
        element.style.setProperty('display', 'none', 'important');
      }
    };
    let queued = false;
    const observer = new MutationObserver(() => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => { queued = false; apply(); });
    });
    observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
    window[stateKey] = { disconnect: () => observer.disconnect(), apply };
    apply();
    return document.querySelectorAll('[' + attr + ']').length;
  })()`, true).catch(() => {});
}

async function saveSettings(overrides = {}) {
  const settings = { runtimeFolder, shellTheme, hideToolCalls, sidebarWidth, ...overrides };
  await fsp.mkdir(dataDir, { recursive: true, mode: 0o700 });
  await fsp.writeFile(settingsFile + '.tmp', JSON.stringify(settings, null, 2) + '\n', { mode: 0o600 });
  await fsp.rename(settingsFile + '.tmp', settingsFile);
}

function openSettings(workspace = null) {
  pauseForSetup(); workspaceSetup.clear(); setupState = null; deletion.clear();
  settingsState = { workspace, deletion: null, notice: null };
}
function closeSettings() {
  deletion.clear(); settingsState = null; startupError = null;
  const current = store.selected(); if (current) controller.attach(current);
}

function publicError(error) { return { code: error.code ?? 'APP_ERROR', message: String(error.message ?? error).slice(0, 700) }; }
function projectedArchives() {
  return store.snapshot().projects.filter(project => project.archivedAt).map(({ workspace, projectId, name, archivedAt, sessions }) => ({
    workspace, projectId, name, archivedAt, sessionCount: sessions.length, deletionPending: deletion?.isPending(workspace) ?? false,
  }));
}
function archiveSnapshot() {
  return { archives: projectedArchives(), deletion: archiveState.deletion, notice: archiveState.notice,
    focusWorkspace: archiveState.focusWorkspace, theme: shellTheme, fixture: smoke };
}
function publishArchive() {
  if (archiveWindow && !archiveWindow.isDestroyed() && !archiveWindow.webContents.isDestroyed())
    archiveWindow.webContents.send('pilot-archive:state-changed', archiveSnapshot());
}
function snapshot() {
  const saved = store.selected();
  const info = controller?.state.projectInfo;
  const selected = saved && { ...saved, attempt: saved.attempt && { protocol: saved.attempt.protocol,
    requestId: saved.attempt.requestId, state: saved.attempt.state }, receipt: undefined,
    ...(info?.workspace === saved.workspace ? info : {}) };
  return { projects: store.snapshot().projects.filter(p => !p.archivedAt).map(({ workspace, projectId, name, selectedSessionId, expanded, sessions }) => ({
    workspace, projectId, name, selectedSessionId, expanded,
    sessions: sessions.map(({ sessionId, chatUrl, title, createdAt }) => ({ sessionId, chatUrl, title, createdAt })),
  })),
    archives: projectedArchives(), settings: settingsState,
    selected, context: controller?.state ?? { phase: 'selected', servicesReady: false, messageSent: false },
    runtimeFolder, theme: shellTheme, hideToolCalls, sidebarWidth, sidebarMinWidth: SIDEBAR_MIN_WIDTH, pageLoading, startupError, storageError, setup: setupState, workspaceHealth, version: app.getVersion(), fixture: smoke };
}

function publish() {
  rememberSessionTitle();
  if (sidebar && !sidebar.webContents.isDestroyed()) sidebar.webContents.send('pilot:state-changed', snapshot());
  publishArchive();
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

function rememberSessionTitle() {
  if (!browser || browser.webContents.isDestroyed() || pageLoading) return;
  const selected = store.selected();
  if (!selected?.chatUrl || normalizeChatUrl(browser.webContents.getURL()) !== selected.chatUrl) return;
  const title = browser.webContents.getTitle().replace(/\s*[-–—|]\s*ChatGPT$/i, '').trim();
  if (!title || /^(ChatGPT|New chat|Новый чат)$/i.test(title) || selected.title === title) return;
  void store.setSessionTitle(selected.workspace, selected.sessionId, title)
    .then(changed => { if (changed) publish(); }).catch(() => {});
}

function report(error) { startupError = publicError(error); if (settingsState) settingsState = { ...settingsState, notice: null }; if (setupState) setupState = { ...setupState, phase: 'error', error: startupError }; publish(); }
function remotePreferences() {
  return { partition, nodeIntegration: false, contextIsolation: true, sandbox: true, webSecurity: true };
}

function isChatGPTOrigin(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname === 'chatgpt.com' && (!url.port || url.port === '443');
  } catch { return false; }
}

function permissionAllowed(permission, origin, details = {}) {
  if (!isChatGPTOrigin(origin)) return false;
  if (permission === 'geolocation' || permission === 'geolocation-approximate') return true;
  if (permission !== 'media') return false;
  const mediaTypes = Array.isArray(details.mediaTypes) ? details.mediaTypes
    : details.mediaType ? [details.mediaType] : [];
  return mediaTypes.length > 0 && mediaTypes.every(type => type === 'audio');
}

function secureRemote(contents) {
  contents.on('will-navigate', (event, url) => { if (!url.startsWith('https://')) event.preventDefault(); });
  contents.setWindowOpenHandler(({ url }) => ({ action: url.startsWith('https://') ? 'allow' : 'deny',
    overrideBrowserWindowOptions: { width: 980, height: 780, webPreferences: remotePreferences() } }));
  contents.on('did-create-window', child => secureRemote(child.webContents));
}

function clampedSidebarWidth(value = sidebarWidth) {
  const windowWidth = window && !window.isDestroyed() ? window.getContentSize()[0] : 1440;
  const max = Math.max(SIDEBAR_MIN_WIDTH, windowWidth - BROWSER_MIN_WIDTH);
  return Math.max(SIDEBAR_MIN_WIDTH, Math.min(max, Math.round(Number(value) || SIDEBAR_MIN_WIDTH)));
}

function layout() {
  if (!window || window.isDestroyed()) return;
  const [width, height] = window.getContentSize();
  const effectiveSidebarWidth = clampedSidebarWidth();
  sidebar.setBounds({ x: 0, y: 0, width: effectiveSidebarWidth, height });
  browser.setBounds({ x: effectiveSidebarWidth, y: 0, width: Math.max(0, width - effectiveSidebarWidth), height });
}

function assertLocalSender(event) {
  if (!sidebar || event.sender !== sidebar.webContents || event.senderFrame !== sidebar.webContents.mainFrame
      || event.senderFrame.url !== sidebarUrl) throw Object.assign(new Error('Недопустимый источник команды.'), { code: 'IPC_FORBIDDEN' });
}

function assertArchiveSender(event) {
  if (!archiveWindow || archiveWindow.isDestroyed() || event.sender !== archiveWindow.webContents
      || event.senderFrame !== archiveWindow.webContents.mainFrame || event.senderFrame.url !== archiveUrl)
    throw Object.assign(new Error('Недопустимый источник команды архива.'), { code: 'IPC_FORBIDDEN' });
}

function archiveRecords(items, { single = false } = {}) {
  if (!Array.isArray(items) || !items.length || (single && items.length !== 1)) throw new Error(single ? 'Выберите один проект.' : 'Выберите проекты из архива.');
  const seen = new Set();
  return items.map(item => {
    if (!item || typeof item.workspace !== 'string' || typeof item.projectId !== 'string' || seen.has(item.workspace)) throw new Error('Некорректный выбор архива.');
    seen.add(item.workspace);
    const project = store.project(item.workspace);
    if (!project?.archivedAt || project.projectId !== item.projectId) throw new Error('Список архива изменился. Повторите выбор.');
    return project;
  });
}

function registerArchiveAction(channel, action) {
  ipcMain.handle(channel, (event, input) => {
    assertArchiveSender(event);
    const operation = actionTail.catch(() => {}).then(async () => {
      try {
        const result = await action(input); publish();
        return { ok: true, state: archiveSnapshot(), result };
      } catch (error) {
        archiveState = { ...archiveState, notice: publicError(error).message }; publishArchive();
        return { ok: false, error: publicError(error), state: archiveSnapshot() };
      }
    });
    actionTail = operation; return operation;
  });
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

async function openArchiveWindow(workspace = null) {
  archiveState = { deletion: null, notice: null, focusWorkspace: workspace }; deletion.clear();
  if (archiveWindow && !archiveWindow.isDestroyed()) { archiveWindow.show(); archiveWindow.focus(); publishArchive(); return; }
  archiveWindow = new BrowserWindow({ title: 'Архив проектов — Project Web Pilot', width: 780, height: 720, minWidth: 620, minHeight: 480,
    backgroundColor: shellBackground[shellTheme], webPreferences: { preload: path.join(sourceDir, 'archive-preload.cjs'),
      nodeIntegration: false, contextIsolation: true, sandbox: true, webSecurity: true } });
  archiveWindow.setWindowOpenHandler?.(() => ({ action: 'deny' }));
  archiveWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  archiveWindow.webContents.on('will-navigate', event => event.preventDefault());
  archiveWindow.webContents.on('did-finish-load', publishArchive);
  archiveWindow.on('closed', () => { deletion.clear(); archiveWindow = null; archiveState = { deletion: null, notice: null, focusWorkspace: null }; });
  await archiveWindow.loadURL(archiveUrl);
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

function pauseForSetup() {
  controller?.cancel(); ++navigationId; pageLoading = false; startupError = null;
}
function cancelSetup() {
  workspaceSetup.clear(); setupState = null; startupError = null;
  const current = store.selected(); if (current) controller.attach(current);
  publish();
}
async function reviewWorkspace(workspace, openReady = false) {
  if (storageError) throw new Error('Сначала нужно восстановить сохранённый список проектов. Исходный файл оставлен без изменений.');
  const canonical = await fsp.realpath(workspace).catch(() => workspace);
  if (store.project(canonical)?.archivedAt) { await openArchiveWindow(canonical); publish(); return false; }
  settingsState = null; deletion.clear();
  pauseForSetup(); setupState = { phase: 'checking', mode: 'existing', workspace }; publish();
  const preview = await workspaceSetup.preview({ mode: 'existing', workspace });
  setupState = { ...preview, phase: 'preview' };
  if (preview.ready && openReady) {
    workspaceHealth = preview; setupState = null; workspaceSetup.clear();
    return true;
  }
  publish(); return false;
}
async function selectWorkspace(input) {
  if (!await reviewWorkspace(input, true)) return;
  const project = await store.select(workspaceHealth.workspace);
  publish(); void navigate(project); return project;
}

function connectController() {
  controller?.cancel();
  controller = new ContextSession({ store, runtime, composer: new ChatGPTComposer(browser.webContents), onChange: publish });
}

function registerIpc() {
  ipcMain.handle('pilot:get-state', event => { assertLocalSender(event); return snapshot(); });
  registerAction('pilot:open-archive-window', input => openArchiveWindow(typeof input === 'string' ? input : null));
  registerAction('pilot:open-settings', () => openSettings());
  registerAction('pilot:close-settings', closeSettings);
  registerAction('pilot:set-sidebar-width', async input => {
    if (!Number.isFinite(input)) throw new Error('Некорректная ширина сайдбара.');
    const next = clampedSidebarWidth(input);
    if (next === sidebarWidth) { layout(); return next; }
    sidebarWidth = next; layout();
    await saveSettings({ sidebarWidth: next });
    return next;
  });
  registerAction('pilot:set-theme', async input => {
    if (!['light', 'dark'].includes(input)) throw new Error('Неизвестная тема оформления.');
    if (input === shellTheme) return;
    await saveSettings({ shellTheme: input });
    applyShellTheme(input);
  });
  registerAction('pilot:set-hide-tool-calls', async input => {
    if (typeof input !== 'boolean') throw new Error('Некорректная настройка отображения инструментов.');
    if (input === hideToolCalls) return;
    await saveSettings({ hideToolCalls: input });
    hideToolCalls = input;
    await applyToolCallVisibility();
  });
  registerAction('pilot:copy-workspace-path', async input => {
    const project = store.project(input);
    if (!project || project.archivedAt) throw new Error('Выберите активный проект.');
    await clipboard.writeText(project.workspace);
    return project.workspace;
  });
  registerAction('pilot:archive-project', async input => {
    const project = store.project(input);
    if (!project || project.archivedAt || storageError) throw new Error('Выберите активный проект.');
    const selected = store.selected()?.workspace === input;
    if (selected) { controller.cancel(); ++navigationId; }
    try { await store.setArchived(input, true); } catch (error) { if (selected) controller.attach(project); throw error; }
    startupError = null;
    if (selected) { workspaceHealth = null; await navigate(null); }
  });
  registerAction('pilot:select-archive', input => {
    if (!settingsState || !store.project(input)?.archivedAt) throw new Error('Выберите проект из архива.');
    deletion.clear(); settingsState = { workspace: input, deletion: null, notice: null }; startupError = null;
  });
  registerAction('pilot:restore-project', async input => {
    if (!settingsState || !store.project(input)?.archivedAt) throw new Error('Выберите проект из архива.');
    if (deletion.isPending(input)) throw new Error('Сначала завершите ранее подтверждённое удаление.');
    const name = store.project(input).name; await store.setArchived(input, false);
    deletion.clear(); settingsState = { workspace: null, deletion: null, notice: `«${name}» возвращён в активные проекты.` }; startupError = null;
  });
  registerAction('pilot:preview-delete', async input => {
    if (!settingsState || settingsState.workspace !== input) throw new Error('Выберите проект в настройках.');
    settingsState = { ...settingsState, deletion: null, notice: 'Проверяем содержимое папки…' }; publish();
    const preview = await deletion.preview(input);
    settingsState = { workspace: input, deletion: preview, notice: null }; startupError = null;
  });
  registerAction('pilot:cancel-delete', () => {
    deletion.clear(); if (settingsState) settingsState = { ...settingsState, deletion: null, notice: null }; startupError = null;
  });
  registerAction('pilot:delete-project', async input => {
    if (!settingsState?.deletion || input?.token !== settingsState.deletion.token) throw new Error('Откройте подтверждение удаления.');
    try { await deletion.apply(input.token, input.confirmation); }
    catch (error) { settingsState = { ...settingsState, deletion: null, notice: null }; throw error; }
    settingsState = { workspace: null, deletion: null, notice: 'Папка и локальная история удалены. Чаты в ChatGPT сохранены.' }; startupError = null;
  });
  registerAction('pilot:recover-deletions', async () => {
    if (!settingsState) return;
    const errors = await deletion.recover();
    settingsState = { workspace: null, deletion: null, notice: errors.length ? null : 'Локальная очистка завершена.' };
    if (errors.length) throw Object.assign(new Error(errors[0].message), { code: errors[0].code });
    startupError = null;
  });
  registerAction('pilot:begin-create', () => {
    if (storageError) throw new Error('Сначала нужно восстановить сохранённый список проектов.');
    settingsState = null; deletion.clear(); pauseForSetup(); workspaceSetup.clear();
    setupState = { phase: 'form', mode: 'new', name: '', parent: smoke ? dataDir + '-projects' : path.dirname(store.selected()?.workspace ?? path.join(os.homedir(), 'VSCODE/Project')) };
  });
  registerAction('pilot:choose-parent', async input => {
    if (setupState?.mode !== 'new') return;
    const name = typeof input?.name === 'string' ? input.name.slice(0, 120) : setupState.name;
    const result = await dialog.showOpenDialog(window, { title: 'Где создать проект', buttonLabel: 'Выбрать папку',
      properties: ['openDirectory'], defaultPath: setupState.parent });
    setupState = { phase: 'form', mode: 'new', name, parent: result.canceled ? setupState.parent : result.filePaths[0] };
  });
  registerAction('pilot:preview-new', async input => {
    if (setupState?.mode !== 'new') throw new Error('Сначала нажмите «Создать проект».');
    const parent = setupState.parent, name = input?.name;
    setupState = { phase: 'checking', mode: 'new', parent, name }; publish();
    const preview = await workspaceSetup.preview({ mode: 'new', parent, name });
    setupState = { ...preview, phase: 'preview', parent, name };
  });
  registerAction('pilot:refresh-setup', async () => {
    if (!setupState) return;
    const { mode, parent, name, workspace } = setupState;
    setupState = { phase: 'checking', mode, parent, name, workspace }; startupError = null; publish();
    const preview = await workspaceSetup.preview({ mode, parent, name, workspace });
    setupState = { ...preview, phase: 'preview', parent, name: preview.name };
  });
  registerAction('pilot:cancel-setup', cancelSetup);
  registerAction('pilot:apply-setup', async input => {
    if (!setupState?.token || input?.token !== setupState.token) throw new Error('Сначала проверьте выбранную папку.');
    setupState = { ...setupState, phase: 'applying', error: null }; startupError = null; publish();
    const result = await workspaceSetup.apply(input.token, { gitName: input.gitName, gitEmail: input.gitEmail });
    setupState = { ...result, phase: 'preview', mode: 'existing' };
    if (!result.ready) return;
    workspaceHealth = result;
    const project = await store.select(result.workspace);
    setupState = null; publish(); void navigate(project);
  });
  registerAction('pilot:choose-workspace', async () => {
    pauseForSetup();
    const result = await dialog.showOpenDialog(window, { title: 'Открыть папку проекта',
      buttonLabel: 'Проверить папку', properties: ['openDirectory'], defaultPath: path.join(os.homedir(), 'VSCODE') });
    if (result.canceled) { cancelSetup(); return; }
    return reviewWorkspace(result.filePaths[0]);
  });
  registerAction('pilot:select-workspace', input => {
    if (typeof input !== 'string' || !store.project(input)) throw new Error('Выберите проект из списка.');
    return selectWorkspace(input);
  });
  registerAction('pilot:select-session', async input => {
    if (storageError) throw new Error('Сначала нужно восстановить сохранённый список проектов.');
    if (typeof input?.workspace !== 'string' || typeof input?.sessionId !== 'string') throw new Error('Выберите сессию из дерева проекта.');
    if (!await reviewWorkspace(input.workspace, true)) return;
    const project = await store.selectSession(input.workspace, input.sessionId);
    startupError = null; void navigate(project);
  });
  registerAction('pilot:set-expanded', input => {
    if (storageError) throw new Error('Сначала нужно восстановить сохранённый список проектов.');
    return store.setExpanded(input?.workspace, input?.expanded);
  });
  registerAction('pilot:new-chat', async () => {
    const current = store.selected(); if (!current) return;
    if (!await reviewWorkspace(current.workspace, true)) return;
    const project = await store.newChat(current.workspace);
    startupError = null; void navigate(project);
  });
  registerAction('pilot:return-chat', async () => { const current = store.selected(); if (current) await selectWorkspace(current.workspace); });
  registerAction('pilot:retry', async () => {
    const selected = store.selected(); if (selected && !await reviewWorkspace(selected.workspace, true)) return;
    startupError = null;
    if (!controller.active) { const current = store.selected(); if (current) controller.attach(current); }
    await controller.retry();
  });
  registerAction('pilot:reload', async () => { startupError = null; const current = store.selected(); if (current) await selectWorkspace(current.workspace); else void navigate(); });
  registerAction('pilot:choose-runtime', async () => {
    const result = await dialog.showOpenDialog(window, { title: 'Выбрать Codex Local Mac', buttonLabel: 'Подключить',
      properties: ['openDirectory'], defaultPath: runtimeFolder });
    if (result.canceled) return;
    const selected = await findRuntimeFolder(result.filePaths[0]);
    controller.cancel();
    await saveSettings({ runtimeFolder: selected });
    runtimeFolder = selected; deletion.protectedPaths = [app.getAppPath(), runtimeFolder];
    runtime = new McpRuntime(runtimeFolder);
    connectController();
    startupError = null;
    const current = store.selected(); if (current) controller.attach(current);
  });

  ipcMain.handle('archive:get-state', event => { assertArchiveSender(event); return archiveSnapshot(); });
  registerArchiveAction('archive:restore', async input => {
    const projects = archiveRecords(input);
    for (const project of projects) {
      if (deletion.isPending(project.workspace)) throw new Error('Сначала завершите подтверждённое удаление.');
    }
    for (const project of projects) await store.setArchived(project.workspace, false);
    deletion.clear(); archiveState = { deletion: null, notice: `Возвращено в активные: ${projects.length}.`, focusWorkspace: null };
    return projects.length;
  });
  registerArchiveAction('archive:forget', async input => {
    const projects = archiveRecords(input);
    for (const project of projects) if (deletion.isPending(project.workspace)) throw new Error('Сначала завершите подтверждённое удаление.');
    const count = await store.forgetArchivedMany(projects.map(project => ({ workspace: project.workspace, projectId: project.projectId })));
    deletion.clear(); archiveState = { deletion: null, notice: `Убрано из списка: ${count}. Папки на диске сохранены.`, focusWorkspace: null };
    return count;
  });
  registerArchiveAction('archive:preview-delete', async input => {
    const [project] = archiveRecords([input], { single: true });
    archiveState = { deletion: null, notice: 'Проверяем содержимое папки…', focusWorkspace: project.workspace }; publishArchive();
    const preview = await deletion.preview(project.workspace);
    archiveState = { deletion: preview, notice: null, focusWorkspace: project.workspace }; return preview;
  });
  registerArchiveAction('archive:cancel-delete', () => { deletion.clear(); archiveState = { ...archiveState, deletion: null, notice: null }; });
  registerArchiveAction('archive:delete-project', async input => {
    if (!archiveState.deletion || input?.token !== archiveState.deletion.token) throw new Error('Откройте подтверждение удаления заново.');
    await deletion.apply(input.token, input.confirmation);
    archiveState = { deletion: null, notice: 'Папка и локальная история удалены. Чаты ChatGPT сохранены.', focusWorkspace: null };
  });
  registerArchiveAction('archive:recover-deletions', async () => {
    const errors = await deletion.recover();
    archiveState = { deletion: null, notice: errors.length ? null : 'Локальная очистка завершена.', focusWorkspace: errors[0]?.workspace ?? null };
    if (errors.length) throw Object.assign(new Error(errors[0].message), { code: errors[0].code });
  });
  ipcMain.handle('archive:close', event => { assertArchiveSender(event); archiveWindow?.close(); return { ok: true }; });
}

async function createWindow() {
  window = new BaseWindow({ title: smoke ? 'Project Web Pilot — TEST FIXTURE' : 'Project Web Pilot',
    width: 1440, height: 940, minWidth: 980, minHeight: 700, backgroundColor: shellBackground[shellTheme] });
  sidebar = new WebContentsView({ webPreferences: { preload: path.join(sourceDir, 'preload.cjs'),
    nodeIntegration: false, contextIsolation: true, sandbox: true, webSecurity: true } });
  browser = new WebContentsView({ webPreferences: remotePreferences() });
  window.contentView.addChildView(sidebar); window.contentView.addChildView(browser);
  secureRemote(browser.webContents);
  sidebar.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  sidebar.webContents.on('will-navigate', event => event.preventDefault());
  sidebar.webContents.on('did-finish-load', publish);
  browser.webContents.on('page-title-updated', rememberSessionTitle);
  browser.webContents.on('did-navigate-in-page', () => { void applyToolCallVisibility(); publish(); if (!pageLoading && !setupState && !settingsState) void controller?.tick(); });
  browser.webContents.on('did-finish-load', () => { void applyToolCallVisibility(); publish(); if (!pageLoading && !setupState && !settingsState) void controller?.tick(); });
  browser.webContents.on('render-process-gone', () => { controller?.cancel(); report(new Error('Страница ChatGPT закрылась. Нажмите обновление.')); });
  window.on('resize', layout);
  window.on('closed', () => {
    controller?.cancel(); clearInterval(interval);
    if (archiveWindow && !archiveWindow.isDestroyed()) archiveWindow.close();
    for (const view of [sidebar, browser]) if (!view.webContents.isDestroyed()) view.webContents.close();
    window = null;
  });
  layout();
  if (smoke) {
    await fsp.mkdir(dataDir + '-projects', { recursive: true });
    fixture = await import('../tests/electron-smoke.mjs');
    runtime = await fixture.createRuntime({ browser: browser.webContents, session: session.fromPartition(partition), dataDir });
  } else runtime = new McpRuntime(runtimeFolder);
  connectController();
  registerIpc();
  await sidebar.webContents.loadURL(sidebarUrl);
  interval = setInterval(() => { if (!pageLoading && !setupState && !settingsState) void controller.tick(); }, 1500);
  if (smoke) {
    await fixture.run({ app, window, browser: browser.webContents, sidebar: sidebar.webContents,
      store, controller, selectWorkspace, snapshot, assertLocalSender, permissionAllowed, dataDir,
      openArchiveWindow, getArchiveWindow: () => archiveWindow });
    window.close(); app.quit();
  } else { const current = store.selected(); if (current && !storageError && !settingsState) void selectWorkspace(current.workspace).catch(report); else void navigate(); }
}

function installMenu() {
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    { label: 'Project Web Pilot', submenu: [{ role: 'about', label: 'О Project Web Pilot' }, { type: 'separator' },
      { role: 'hide', label: 'Скрыть' }, { role: 'quit', label: 'Завершить Project Web Pilot' }] },
    { label: 'Правка', submenu: [{ role: 'undo' }, { role: 'redo' }, { type: 'separator' },
      { role: 'cut' }, { role: 'copy' }, { role: 'paste' }, { role: 'selectAll' }] },
    { label: 'Вид', submenu: [{ label: 'Обновить ChatGPT', accelerator: 'CmdOrCtrl+R', click: () => { const current = store.selected(); if (current) void selectWorkspace(current.workspace).catch(report); else if (browser) void navigate(); } },
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
      if (['light', 'dark'].includes(settings.shellTheme)) shellTheme = settings.shellTheme;
      if (typeof settings.hideToolCalls === 'boolean') hideToolCalls = settings.hideToolCalls;
      if (Number.isFinite(settings.sidebarWidth)) sidebarWidth = Math.max(SIDEBAR_MIN_WIDTH, Math.round(settings.sidebarWidth));
    } catch (error) { if (error.code !== 'ENOENT') startupError = { code: 'SETTINGS_INVALID', message: 'Не удалось прочитать локальные настройки Web Pilot. Проверьте настройки подключения.' }; }
    applyShellTheme(shellTheme);
    try { await store.load(); } catch (error) { startupError = publicError(error); storageError = true; }
    deletion = new WorkspaceDeletion({ store, journalDir: path.join(dataDir, 'deletions'), protectedPaths: [app.getAppPath(), runtimeFolder] });
    if (!storageError) {
      const errors = await deletion.recover();
      if (errors.length) { startupError = errors[0]; settingsState = { workspace: errors[0].workspace, deletion: null, notice: null }; }
    }
    const remoteSession = session.fromPartition(partition);
    remoteSession.setPermissionRequestHandler((contents, permission, callback, details) => {
      const origin = details?.securityOrigin ?? details?.requestingUrl ?? contents.getURL();
      callback(permissionAllowed(permission, origin, details));
    });
    remoteSession.setPermissionCheckHandler((_contents, permission, requestingOrigin, details) => {
      const origin = details?.securityOrigin ?? requestingOrigin ?? details?.requestingUrl;
      return permissionAllowed(permission, origin, details);
    });
    installMenu();
    await createWindow();
  }).catch(error => {
    console.error('Project Web Pilot:', error.message);
    if (!smoke) dialog.showErrorBox('Project Web Pilot', error.message);
    app.exit(1);
  });
}
