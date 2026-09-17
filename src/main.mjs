import { app, BaseWindow, BrowserWindow, WebContentsView, Menu, session, ipcMain, dialog, nativeTheme, clipboard, shell } from 'electron';
import path from 'node:path';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import os from 'node:os';
import { AsyncLocalStorage } from 'node:async_hooks';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { WorkspaceSessions, normalizeChatUrl, activeSessionsNewestFirst } from './workspace-session.mjs';
import { McpRuntime, findRuntimeFolder } from './mcp-runtime.mjs';
import { ChatGPTComposer } from './chatgpt-composer.mjs';
import { installChatGPTAutoScroll } from './chatgpt-auto-scroll.mjs';
import { ChatColors, normalizeChatColors, validateColorChange, DEFAULT_COLORS } from './chatgpt-colors.mjs';
import { ChatColorsWindow } from './chat-colors-window.mjs';
import { ContextCache } from './context-cache.mjs';
import { readinessContextKey } from './context-inputs.mjs';
const contextCache = new ContextCache({ load: (workspace, selection) => runtime.loadContext(workspace, selection),
  inputKey: (workspace, selection) => readinessContextKey(workspaceSetup, workspace, selection), onChange: () => publish() });
import { SessionPlans } from './session-plans.mjs';
import { ContextSession, sessionSelection } from './context-session.mjs';
import { chatGPTEntrypoint } from './chatgpt-experience.mjs';
import { WorkspaceDeletion } from './workspace-deletion.mjs';
import { WorkspaceSetup } from './workspace-setup.mjs';
import { ProjectDoctor } from './project-doctor.mjs';
import { ChromiumDiagnostics, safeUrl } from './chromium-diagnostics.mjs';
import { openStartupPage } from './browser-startup.mjs';
import { defaultRuntimeFolder, bundledWindowsRuntimeFolder, bundledMacNode, nodeExecutableCandidates } from './platform.mjs';
import { WindowsRuntimeBootstrap, WINDOWS_RUNTIME_ARCHIVE } from './windows-runtime.mjs';
import { MacRuntimeBootstrap } from './mac-runtime.mjs';
import { StartupReadiness, inspectMacGit, installMacGit, accountObservation, offerMacInstallation } from './startup-readiness.mjs';

const smoke = !app.isPackaged && process.argv.includes('--smoke');
const sourceDir = path.dirname(fileURLToPath(import.meta.url));
const sidebarUrl = pathToFileURL(path.join(sourceDir, 'ui/index.html')).href;
const archiveUrl = pathToFileURL(path.join(sourceDir, 'ui/archive.html')).href;
app.setName('Project Web Pilot');
app.setPath('userData', smoke ? fs.mkdtempSync(path.join(os.tmpdir(), 'web-pilot-electron-smoke-'))
  : path.join(app.getPath('appData'), 'Project Web Pilot'));
const dataDir = app.getPath('userData');
const settingsFile = path.join(dataDir, 'settings.json');
const chromiumDiagnosticsFile = path.join(dataDir, 'diagnostics', 'chromium-events.jsonl');
const store = new WorkspaceSessions(path.join(dataDir, 'workspaces.json'));
const partition = smoke ? 'web-pilot-smoke' : 'persist:chatgpt';
let runtimeFolder = bundledWindowsRuntimeFolder(dataDir, process.platform) ?? defaultRuntimeFolder(os.homedir(), process.platform);
let configuredRuntimeFolder = null;
let runtimeRegistration = null;
let macRuntimeBootstrap = null;
let shellTheme = 'light';
let hideToolCalls = true;
let chatColors = normalizeChatColors();
let chatColorStyles, colorEditor;
let settingsSaveTail = Promise.resolve();
const SIDEBAR_MIN_WIDTH = 312;
const BROWSER_MIN_WIDTH = 600;
let sidebarWidth = SIDEBAR_MIN_WIDTH;
let window, browser, sidebar, archiveWindow, runtime, controller, interval, fixture, chromiumDiagnostics, windowsRuntimeBootstrap;
let navigationId = 0;
const actionContext = new AsyncLocalStorage();
let pageLoading = false;
let startupFlow = null, startupActive = false, observingAccount = false;
let startupError = null;
let storageError = false;
let lastDiagnostic = '';
let actionTail = Promise.resolve();
const windowsPortableNode = process.platform === 'win32'
  ? (app.isPackaged
      ? path.join(process.resourcesPath, 'windows-node', 'node-v22.17.0-win-x64', 'node.exe')
      : path.join(sourceDir, '../.harness/runtime/windows-node/node-v22.17.0-win-x64/node.exe'))
  : null;
const workspaceSetup = new WorkspaceSetup({
  resourceDir: app.isPackaged ? path.join(process.resourcesPath, 'resources') : path.join(sourceDir, '../resources'),
  nodeCandidates: windowsPortableNode
    ? [windowsPortableNode, ...nodeExecutableCandidates({ platform: 'win32', environment: process.env, electron: true })]
    : process.platform === 'darwin'
      ? [bundledMacNode(app.isPackaged ? process.resourcesPath : path.join(sourceDir, '../.harness/runtime')), ...nodeExecutableCandidates()]
      : undefined,
});
const sessionPlans = new SessionPlans({ setup: workspaceSetup });
store.planService = sessionPlans;
let setupState = null;
let workspaceHealth = null;
let settingsState = null;
let doctorState = null;
const projectDoctor = new ProjectDoctor({ setup: workspaceSetup, ensureServices: () => runtime.ensure() });
let archiveState = { deletion: null, notice: null, focusWorkspace: null };
let preparedChoice = null;
let deletion;
const shellBackground = { light: '#f4f6f8', dark: '#1b1d22' };

function applyShellTheme(theme) {
  shellTheme = theme === 'dark' ? 'dark' : 'light';
  nativeTheme.themeSource = shellTheme;
  colorEditor?.publish();
  if (window && !window.isDestroyed()) window.setBackgroundColor(shellBackground[shellTheme]);
}

async function applyToolCallVisibility() {
  if (!browser || browser.webContents.isDestroyed()) return;
  const url = browser.webContents.getURL();
  if (!url.startsWith('https://chatgpt.com/')) return;
  const hide = hideToolCalls;
  await browser.webContents.executeJavaScript(`(() => {
    const attr = 'data-web-pilot-tool-call-hidden';
    const footprintAttr = 'data-web-pilot-tool-call-footprint-hidden';
    const stateKey = '__webPilotToolCallFilter';
    const labels = ['вызываемый инструмент', 'called tool', 'tool call'];
    const messageSelector = '[data-message-author-role],[data-testid="user-message"],[data-testid="assistant-message"]';
    const normalize = value => String(value ?? '').replace(/\\s+/g, ' ').trim().toLocaleLowerCase();
    const restore = () => {
      for (const element of document.querySelectorAll('[' + footprintAttr + ']')) {
        element.style.removeProperty('display');
        element.removeAttribute(footprintAttr);
      }
      for (const element of document.querySelectorAll('[' + attr + ']')) {
        element.style.removeProperty('display');
        element.removeAttribute(attr);
      }
    };
    const refreshAutoScroll = () => window.__webPilotConversationAutoScroll?.refresh?.();
    restore();
    window[stateKey]?.disconnect?.();
    delete window[stateKey];
    if (!${hide ? 'true' : 'false'}) {
      refreshAutoScroll();
      return 0;
    }
    const matches = element => {
      const text = normalize(element.textContent);
      return labels.some(label => text === label || text.startsWith(label + ' '));
    };
    const footprint = element => {
      const message = element.closest(messageSelector);
      const ownText = normalize(element.textContent);
      let result = element;
      for (let parent = element.parentElement; parent && parent !== document.body && parent !== message; parent = parent.parentElement) {
        if (normalize(parent.textContent) !== ownText) break;
        result = parent;
      }
      return result;
    };
    const apply = () => {
      let changed = false;
      for (const element of document.querySelectorAll('button,[role="button"],summary')) {
        if (!matches(element)) continue;
        const layout = footprint(element);
        element.setAttribute(attr, 'true');
        element.style.setProperty('display', 'none', 'important');
        layout.setAttribute(footprintAttr, 'true');
        layout.style.setProperty('display', 'none', 'important');
        changed = true;
      }
      if (changed) refreshAutoScroll();
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

function saveSettings(overrides = {}) {
  const settings = { runtimeFolder, runtimeRegistration, shellTheme, hideToolCalls, sidebarWidth, chatColors, ...overrides };
  const operation = settingsSaveTail.catch(() => {}).then(async () => {
    await fsp.mkdir(dataDir, { recursive: true, mode: 0o700 });
    await fsp.writeFile(settingsFile + '.tmp', JSON.stringify(settings, null, 2) + '\n', { mode: 0o600 });
    await fsp.rename(settingsFile + '.tmp', settingsFile);
  });
  settingsSaveTail = operation;
  return operation;
}

async function setChatColors(colors) {
  chatColors = normalizeChatColors(colors);
  const apply = chatColorStyles.set(chatColors);
  const save = saveSettings();
  await Promise.all([apply, save]);
}

function openSettings(workspace = null) {
  workspace ??= setupState?.workspace ?? store.selected()?.workspace ?? null;
  if (doctorState?.workspace !== workspace) doctorState = { workspace, phase: 'idle' };
  pauseForSetup(); workspaceSetup.clear(); setupState = null; deletion.clear();
  settingsState = { workspace, deletion: null, notice: null };
}
function closeSettings() {
  deletion.clear(); settingsState = null; startupError = null;
  const current = store.selected(); if (current) void selectWorkspace(current.workspace, { resume: true }).catch(report);
  else if (startupFlow) { startupActive = true; void navigate(null); }
}

function publicError(error) { return { code: error.code ?? 'APP_ERROR', message: String(error.message ?? error).slice(0, 700) }; }
function projectedArchives() {
  return store.snapshot().projects.filter(project => project.archivedAt).map(({ workspace, projectId, name, displayName, archivedAt, sessions }) => ({
    workspace, projectId, name: displayName || name, archivedAt, sessionCount: sessions.length, deletionPending: deletion?.isPending(workspace) ?? false,
  }));
}
function projectedSessionArchives() {
  return store.snapshot().projects.filter(project => !project.archivedAt).flatMap(project => project.sessions
    .filter(session => session.archivedAt)
    .map((session, index) => ({ workspace: project.workspace, projectId: project.projectId, projectName: project.displayName || project.name,
      sessionId: session.sessionId, title: session.title || `Сессия ${index + 1}`, experience: session.experience,
      chatUrl: session.chatUrl, archivedAt: session.archivedAt, createdAt: session.createdAt })));
}
function archiveSnapshot() {
  return { archives: projectedArchives(), sessionArchives: projectedSessionArchives(), deletion: archiveState.deletion, notice: archiveState.notice,
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
    ...(info?.workspace === saved.workspace && info.inspectedSessionId === saved.sessionId ? info : {}) };
  return { projects: store.snapshot().projects.filter(p => !p.archivedAt).map(({ workspace, projectId, name, displayName, selectedSessionId, expanded, sessions }) => ({
    workspace, projectId, name: displayName || name, selectedSessionId, expanded,
    sessions: activeSessionsNewestFirst(sessions).map(({ sessionId, experience, chatUrl, title, createdAt }) => ({ sessionId, experience, chatUrl, title, createdAt })),
  })),
    archives: projectedArchives(), settings: settingsState, doctor: doctorState,
    selected, context: controller?.state ?? { phase: 'selected', servicesReady: false, messageSent: false },
    contextPreparation: { busy: selected ? contextCache.isBuilding(selected.workspace, sessionSelection(selected)) : false },
    preparedChoice: preparedChoice?.workspace === selected?.workspace && preparedChoice?.sourceSessionId === selected?.sessionId ? preparedChoice : null,
    runtimeFolder, platform: process.platform, windowsRuntime: windowsRuntimeBootstrap ? {
      ...windowsRuntimeBootstrap.snapshot(),
      service: runtime?.lastStatus ? {
        mcpReady: !!runtime.lastStatus.mcp?.ready,
        tunnelReady: !!runtime.lastStatus.tunnel?.ready,
        tunnelConfigured: !!runtime.lastStatus.tunnel?.configured,
      } : null,
    } : null,
    startup: startupFlow ? { ...startupFlow.snapshot(), active: startupActive } : null,
    theme: shellTheme, hideToolCalls, sidebarWidth, sidebarMinWidth: SIDEBAR_MIN_WIDTH, pageLoading, startupError, storageError, setup: setupState, workspaceHealth, version: app.getVersion(), fixture: smoke };
}

function publish() {
  rememberSessionTitle();
  rememberScopeTitle();
  if (sidebar && !sidebar.webContents.isDestroyed()) sidebar.webContents.send('pilot:state-changed', snapshot());
  publishArchive();
  const state = snapshot();
  const record = { phase: state.context.phase, workspace: state.selected?.workspace, sessionId: state.selected?.sessionId,
    requestId: state.selected?.attempt?.requestId, contextSha256: state.context.delivery?.contextSha256,
    planRevision: state.context.projectInfo?.planRevision, errorCode: state.context.error?.code ?? startupError?.code,
    appVersion: app.getVersion(), page: state.startup?.page, pageError: state.startup?.pageError };
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

function rememberScopeTitle() {
  const selected = store.selected();
  const info = controller?.state?.projectInfo;
  if (!selected || !info || info.workspace !== selected.workspace || info.inspectedSessionId !== selected.sessionId || selected.lastNamedScopeId === info.scopeId
      || !['ACTIVE', 'BLOCKED'].includes(info.scopeStatus) || typeof info.scopeId !== 'string' || !info.scopeId
      || typeof info.objective !== 'string' || !info.objective.trim()) return;
  void store.applyScopeTitle(selected.workspace, selected.sessionId, info)
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

function permissionAllowed(permission, origin, details = {}, contents = null) {
  if (!isChatGPTOrigin(origin)) return false;
  if (permission === 'clipboard-sanitized-write') {
    const primary = browser?.webContents;
    return Boolean(contents && primary && !primary.isDestroyed() && contents.id === primary.id);
  }
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

function sessionArchiveRecords(items) {
  if (!Array.isArray(items) || !items.length) throw new Error('Выберите сессии из архива.');
  const snapshot = store.snapshot(); const seen = new Set();
  return items.map(item => {
    const key = `${item?.workspace ?? ''}\n${item?.sessionId ?? ''}`;
    if (!item || typeof item.workspace !== 'string' || typeof item.projectId !== 'string' || typeof item.sessionId !== 'string' || seen.has(key))
      throw new Error('Некорректный выбор сессий архива.');
    seen.add(key);
    const project = snapshot.projects.find(project => project.workspace === item.workspace);
    if (!project || project.projectId !== item.projectId || project.archivedAt) throw new Error('Проект сессии изменился. Повторите выбор.');
    const session = project.sessions.find(session => session.sessionId === item.sessionId);
    if (!session?.archivedAt) throw new Error('Сессия больше не находится в архиве.');
    return { project, session };
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

function registerAction(channel, action, { navigation = false } = {}) {
  ipcMain.handle(channel, (event, input) => {
    assertLocalSender(event);
    const run = () => actionContext.run({ generation: navigationId }, async () => {
      const owner = actionContext.getStore();
      try {
        const result = await action(input);
        if (navigationCurrent(owner.generation)) publish();
        return { ok: true, state: snapshot(), result };
      } catch (error) {
        if (navigationCurrent(owner.generation)) report(error);
        return { ok: false, error: publicError(error), state: snapshot() };
      }
    });
    if (navigation) return run();
    const operation = actionTail.catch(() => {}).then(run);
    actionTail = operation;
    return operation;
  });
}

async function openArchiveWindow(workspace = null) {
  archiveState = { deletion: null, notice: null, focusWorkspace: workspace }; deletion.clear();
  if (archiveWindow && !archiveWindow.isDestroyed()) { archiveWindow.show(); archiveWindow.focus(); publishArchive(); return; }
  archiveWindow = new BrowserWindow({ title: 'Архив — Project Web Pilot', width: 780, height: 720, minWidth: 620, minHeight: 480,
    backgroundColor: shellBackground[shellTheme], webPreferences: { preload: path.join(sourceDir, 'archive-preload.cjs'),
      nodeIntegration: false, contextIsolation: true, sandbox: true, webSecurity: true } });
  archiveWindow.setWindowOpenHandler?.(() => ({ action: 'deny' }));
  archiveWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  archiveWindow.webContents.on('will-navigate', event => event.preventDefault());
  archiveWindow.webContents.on('did-finish-load', publishArchive);
  archiveWindow.on('closed', () => { deletion.clear(); archiveWindow = null; archiveState = { deletion: null, notice: null, focusWorkspace: null }; });
  await archiveWindow.loadURL(archiveUrl);
}

function nextNavigation() {
  const owner = actionContext.getStore();
  // An older async action cannot reclaim navigation after a newer user selection.
  if (owner && owner.generation !== navigationId) return owner.generation;
  const generation = ++navigationId;
  if (owner) owner.generation = generation;
  return generation;
}
function navigationCurrent(generation) {
  return generation === navigationId && window && !window.isDestroyed() && browser && !browser.webContents.isDestroyed();
}
function attachController(project) {
  const selected = store.selected();
  if (!project || !navigationCurrent(workspaceHealth?.generation) || !workspaceHealth?.ready
      || workspaceHealth.workspace !== project.workspace || workspaceHealth.sessionId !== project.sessionId
      || selected?.workspace !== project.workspace || selected.sessionId !== project.sessionId
      || pageLoading || setupState || settingsState) return false;
  if (controller.active?.workspace !== project.workspace || controller.active?.sessionId !== project.sessionId) controller.attach(project);
  return true;
}

async function navigate(project = store.selected(), { refresh = false, generation = null, resume = false, entryUrl = null } = {}) {
  if (!project && pageLoading && startupActive) return;
  const ownNavigation = generation ?? nextNavigation();
  if (!navigationCurrent(ownNavigation)) return;
  if (workspaceHealth?.ready && workspaceHealth.workspace === project?.workspace
      && (generation === null || workspaceHealth.generation === ownNavigation))
    workspaceHealth = { ...workspaceHealth, generation: ownNavigation, sessionId: project.sessionId };
  preparedChoice = null;
  controller?.cancel();
  pageLoading = true; startupFlow?.beginPage(ownNavigation); publish();
  const target = entryUrl ?? project?.chatUrl ?? chatGPTEntrypoint(project?.experience ?? 'chat');
  const began = Date.now();
  chromiumDiagnostics?.log.record('app', 'navigation-requested', { generation: ownNavigation, url: safeUrl(target),
    browserBounds: browser.getBounds(), windowSize: window.getContentSize() });
  const waiting = setTimeout(() => {
    if (navigationCurrent(ownNavigation) && pageLoading) chromiumDiagnostics?.log.record('app', 'navigation-waiting', {
      generation: ownNavigation, elapsedMs: Date.now() - began, url: safeUrl(target),
      currentUrl: safeUrl(browser.webContents.getURL()), loading: browser.webContents.isLoading(),
    });
  }, 15000);
  waiting.unref?.();
  try {
    const alreadyOpen = resume && !browser.webContents.isLoading() && browser.webContents.getURL() === target;
    if (!alreadyOpen) {
      const firstOpening = !project && !browser.webContents.getURL();
      if (firstOpening) await openStartupPage(browser.webContents, target, {
        isCurrent: () => navigationCurrent(ownNavigation),
      });
      else await browser.webContents.loadURL(target);
    }
    if (!navigationCurrent(ownNavigation)) return;
    pageLoading = false; startupFlow?.finishPage(ownNavigation);
    void observeStartupAccount();
    if (attachController(project && store.project(project.workspace))) {
      if (refresh) await controller.retry();
      else void controller.tick();
    }
    publish();
  } catch (error) {
    if (!navigationCurrent(ownNavigation)) return;
    chromiumDiagnostics?.log.record('app', 'load-url-failed', { generation: ownNavigation, url: safeUrl(target),
      elapsedMs: Date.now() - began, errorCode: Number.isFinite(error.errno) ? error.errno : null,
      errorName: /^(?:ERR|PAGE)_[A-Z0-9_]+$/.test(error.code ?? '') ? error.code : null });
    pageLoading = false; startupFlow?.finishPage(ownNavigation, error.code ?? 'PAGE_LOAD_FAILED');
    const code = /^(?:ERR|PAGE)_[A-Z0-9_]+$/.test(error.code ?? '') ? error.code : 'PAGE_LOAD_FAILED';
    report(Object.assign(new Error(code === 'PAGE_RESPONSE_TIMEOUT'
      ? 'ChatGPT не ответил за две минуты. Скопируйте диагностику перед повтором.'
      : 'Не удалось открыть сайт ChatGPT. Скопируйте диагностику и повторите открытие.'), { code }));
  } finally { clearTimeout(waiting); }
}

function pauseForSetup() {
  const generation = nextNavigation();
  if (!navigationCurrent(generation)) return false;
  controller?.cancel(); pageLoading = false; startupError = null;
  startupFlow?.beginPage(generation);
  if (!browser.webContents.isLoading()) startupFlow?.finishPage(generation);
  return true;
}
function cancelSetup() {
  workspaceSetup.clear(); setupState = null; startupError = null;
  const current = store.selected(); if (current) void selectWorkspace(current.workspace, { resume: true }).catch(report);
  else if (startupFlow) { startupActive = true; void navigate(null); }
  publish();
}
async function reviewWorkspace(workspace, openReady = false, { generation = null } = {}) {
  if (storageError) throw new Error('Сначала нужно восстановить сохранённый список проектов. Исходный файл оставлен без изменений.');
  const ownNavigation = generation ?? nextNavigation();
  if (!navigationCurrent(ownNavigation)) return false;
  controller?.cancel(); pageLoading = false; startupError = null;
  const canonical = await fsp.realpath(workspace).catch(() => workspace);
  if (!navigationCurrent(ownNavigation)) return false;
  if (store.project(canonical)?.archivedAt) { await openArchiveWindow(canonical); publish(); return false; }
  settingsState = null; deletion.clear();
  const firstSessionExperience = 'chat';
  setupState = { phase: 'checking', mode: 'existing', workspace, firstSessionExperience }; publish();
  const preview = await workspaceSetup.preview({ mode: 'existing', workspace });
  if (!navigationCurrent(ownNavigation)) return false;
  const firstSessionRequired = !store.project(preview.workspace);
  setupState = { ...preview, phase: 'preview', firstSessionRequired, firstSessionExperience: firstSessionRequired ? firstSessionExperience : 'chat' };
  if (preview.ready && openReady) {
    await store.reconcilePlanBindings(preview.workspace);
    if (!navigationCurrent(ownNavigation)) return false;
    workspaceHealth = { ...preview, phase: 'ready', generation: ownNavigation }; setupState = null; workspaceSetup.clear();
    return true;
  }
  publish(); return false;
}
async function openConnectedSession(input, sessionId = null, { latest = false, resume = false } = {}) {
  const explicitSession = sessionId !== null;
  const generation = nextNavigation();
  const current = () => navigationCurrent(generation);
  if (!current()) return null;
  if (storageError) throw new Error('Сначала нужно восстановить сохранённый список проектов.');
  controller.cancel(); preparedChoice = null; settingsState = null; setupState = null;
  startupError = null; pageLoading = true;
  workspaceHealth = { workspace: input, sessionId, generation, phase: 'checking', ready: false }; publish();
  try {
    if (typeof input !== 'string' || !path.isAbsolute(input)) throw new Error('Выберите папку проекта.');
    const workspace = await fsp.realpath(input);
    if (!current()) return null;
    const record = store.snapshot().projects.find(p => p.workspace === workspace);
    if (record?.archivedAt) { pageLoading = false; workspaceHealth = null; await openArchiveWindow(workspace); return null; }
    // First connection and legacy adoption retain the complete strict path.
    if (!record || record.sessions.some(s => s.legacyPlanId && s.planBinding === 'evidence')) {
      if (!await reviewWorkspace(workspace, true, { generation })) return null;
      const project = explicitSession && record
        ? await store.selectSession(workspace, sessionId, { isCurrent: current })
        : await store.select(workspace, { latest, isCurrent: current });
      if (!current()) return null;
      workspaceHealth = { ...workspaceHealth, sessionId: project.sessionId };
      publish(); void navigate(project, { generation, resume }); return project;
    }
    sessionId ??= latest ? activeSessionsNewestFirst(record.sessions)[0]?.sessionId : record.selectedSessionId;
    workspaceHealth = { workspace, sessionId, generation, phase: 'checking', ready: false };
    const project = await store.selectSession(workspace, sessionId, { isCurrent: current, expand: latest || explicitSession });
    if (!current() || !project) return null;
    publish();
    void navigate(project, { generation, resume });
    // Inspection runs in the existing worker and never holds the IPC or store queue.
    void workspaceSetup.ready(workspace).then(result => {
      if (!current()) return;
      workspaceHealth = { ...result, workspace, sessionId, generation, phase: result.ready ? 'ready' : 'error' };
      if (attachController(project)) void controller.tick();
      publish();
    }).catch(error => {
      if (!current()) return;
      workspaceHealth = { workspace, sessionId, generation, phase: 'error', ready: false, error: publicError(error) }; publish();
    });
    return project;
  } catch (error) {
    if (!current()) return null;
    pageLoading = false;
    workspaceHealth = { ...workspaceHealth, phase: 'error', ready: false, error: publicError(error) };
    report(error); return null;
  }
}
async function selectWorkspace(input, { latest = false, resume = false } = {}) {
  return openConnectedSession(input, null, { latest, resume });
}

function runtimeRegistrationFrom(result) {
  const service = result?.service ?? result;
  if (!result?.folder || !service?.mcp_url) return runtimeRegistration;
  return { platform: process.platform, folder: result.folder, source: result.source ?? 'external',
    contract: Number(service.runtime_contract ?? 1), mcpUrl: service.mcp_url, tunnelUi: service.tunnel_ui ?? null,
    verifiedAt: new Date().toISOString() };
}
function macBootstrap(preferred = runtimeRegistration?.folder ?? runtimeFolder) {
  if (process.platform !== 'darwin' || smoke) return null;
  const resourceRoot = app.isPackaged ? path.join(process.resourcesPath, 'resources') : path.join(sourceDir, '../resources');
  return new MacRuntimeBootstrap({
    payloadFile: path.join(resourceRoot, 'mac-runtime.zip'),
    controlSourceFile: path.join(resourceRoot, 'runtime-control', 'mac-control.py'),
    dataDir, preferredFolder: preferred, defaultFolder: defaultRuntimeFolder(os.homedir(), 'darwin'), onState: publish,
    environment: { ...process.env, ...(app.isPackaged ? { WEB_PILOT_UV: path.join(process.resourcesPath, 'mac-tools', 'uv') } : {}) },
  });
}
async function ensurePlatformRuntime() {
  const workspace = store.selected()?.workspace ?? os.homedir();
  const result = windowsRuntimeBootstrap ? await windowsRuntimeBootstrap.ensure(workspace)
    : macRuntimeBootstrap ? await macRuntimeBootstrap.ensure(workspace) : null;
  if (result?.folder) {
    runtimeFolder = result.folder; runtimeRegistration = runtimeRegistrationFrom(result);
    if (deletion) deletion.protectedPaths = [app.getAppPath(), runtimeFolder];
    await saveSettings({ runtimeFolder, runtimeRegistration });
  }
  return result;
}
function createLocalRuntime() {
  contextCache.clear();
  return new McpRuntime(runtimeFolder, {
    platform: process.platform, sessionPlans,
    expectedServerName: process.platform === 'win32' ? 'Codex Local Windows' : 'Codex Local Mac',
    ensureRuntime: windowsRuntimeBootstrap || macRuntimeBootstrap ? ensurePlatformRuntime : null,
  });
}

function createStartupFlow() {
  if (process.platform !== 'darwin' || smoke) return;
  startupActive = store.snapshot().projects.length === 0;
  startupFlow = new StartupReadiness({
    probeNode: () => workspaceSetup.node(), probeGit: () => inspectMacGit(), installGit: () => installMacGit(),
    inspectRuntime: async () => {
      const current = await macRuntimeBootstrap.inspect();
      return current.installed ? runtime.control('status') : null;
    },
    prepareRuntime: async () => {
      let status = await runtime.control('status');
      if (!status.mcp.ready || (status.tunnel.configured && !status.tunnel.ready))
        status = await runtime.control('start', { mcpOnly: !status.tunnel.configured });
      return status;
    },
    configureTunnel: async () => {
      await ensurePlatformRuntime();
      return macRuntimeBootstrap.configureTunnel();
    },
    onChange: publish,
  });
}
async function observeStartupAccount() {
  if (!startupFlow || !startupActive || pageLoading || observingAccount || !browser || browser.webContents.isDestroyed()) return;
  observingAccount = true;
  const generation = navigationId;
  try {
    if (!isChatGPTOrigin(browser.webContents.getURL())) return;
    if (['loading', 'slow', 'idle'].includes(startupFlow.snapshot().page)) startupFlow.finishPage(generation);
    const observation = await browser.webContents.mainFrame.executeJavaScript('(' + accountObservation.toString() + ')()');
    if (navigationCurrent(generation)) startupFlow.observe(generation, observation);
  } catch { /* Unknown remains unverified; a later visible document can be inspected. */ }
  finally { observingAccount = false; }
}
async function startupAction(action) {
  if (!startupFlow) throw new Error('Начальная настройка недоступна на этой платформе.');
  if (action === 'show') {
    settingsState = null; setupState = null; workspaceSetup.clear(); startupError = null; startupActive = true;
    if (!store.selected()) void navigate(null);
    else void observeStartupAccount();
    return startupFlow.check();
  }
  if (!startupActive) throw new Error('Сначала откройте начальную настройку.');
  if (action === 'copy-diagnostics') {
    clipboard.writeText(await chromiumDiagnostics.startupReport());
    return true;
  }
  if (action === 'check') { void observeStartupAccount(); return startupFlow.check({ prepare: true }); }
  if (action === 'install-git') return startupFlow.install();
  if (action === 'configure-tunnel') return startupFlow.configure();
  if (action === 'chat' || action === 'signup') { startupError = null; return navigate(null); }
  if (action === 'plugins') { startupError = null; return navigate(null, { entryUrl: 'https://chatgpt.com/plugins' }); }
  const pages = {
    tunnels: 'https://platform.openai.com/settings/organization/tunnels',
    keys: 'https://platform.openai.com/api-keys',
    help: 'https://developers.openai.com/api/docs/guides/secure-mcp-tunnels',
  };
  if (Object.hasOwn(pages, action)) return shell.openExternal(pages[action]);
  if (action === 'continue') {
    await startupFlow.check();
    await observeStartupAccount();
    const state = startupFlow.snapshot();
    if (state.busy || !state.node || !state.git || !state.runtime || !state.tunnel || state.account !== 'signed-in')
      throw new Error('Завершите вход и проверку подключения перед созданием проекта.');
    startupActive = false; startupError = null; return true;
  }
  throw new Error('Неизвестное действие начальной настройки.');
}

function connectController() {
  controller?.cancel();
  controller = new ContextSession({ store, runtime, contextCache, composer: new ChatGPTComposer(browser.webContents), onChange: publish });
}

function registerIpc() {
  ipcMain.handle('pilot:get-state', event => { assertLocalSender(event); return snapshot(); });
  registerAction('pilot:startup', action => startupAction(action), { navigation: true });
  registerAction('pilot:open-archive-window', input => openArchiveWindow(typeof input === 'string' ? input : null));
  registerAction('pilot:open-settings', () => openSettings());
  registerAction('pilot:open-chat-colors', () => colorEditor.open());
  registerAction('pilot:open-doctor', () => openSettings(setupState?.workspace ?? (workspaceHealth?.phase === 'error' ? workspaceHealth.workspace : null) ?? store.selected()?.workspace));
  const doctorWorkspace = input => {
    if (typeof input !== 'string' || (!store.project(input) && input !== doctorState?.workspace)) throw new Error('Выберите проект в настройках.');
    return input;
  };
  registerAction('pilot:doctor-select', input => {
    if (!settingsState) throw new Error('Откройте настройки.');
    doctorState = { workspace: doctorWorkspace(input), phase: 'idle' };
  });
  registerAction('pilot:doctor-run', async input => {
    if (!settingsState) throw new Error('Откройте настройки.');
    const workspace = doctorWorkspace(input);
    pauseForSetup(); contextCache.clear();
    const result = await projectDoctor.run(workspace, report => { doctorState = report; publish(); });
    doctorState = { ...result, phase: 'done' }; startupError = null;
  });
  registerAction('pilot:doctor-backup', async () => {
    if (!doctorState?.backupPath) throw new Error('Резервная копия ещё не создана.');
    const error = await shell.openPath(doctorState.backupPath);
    if (error) throw new Error('Не удалось открыть папку резервной копии.');
  });
  registerAction('pilot:doctor-review', async () => {
    if (!doctorState?.workspace) throw new Error('Выберите проект.');
    await reviewWorkspace(doctorState.workspace);
  });
  registerAction('pilot:doctor-continue', async mode => {
    if (!['open','chat','work','refresh'].includes(mode) || doctorState?.phase !== 'done' || !doctorState.projectReady || !doctorState.servicesReady || doctorState.issues.length) throw new Error('Сначала завершите проверку проекта.');
    const workspace = doctorState.workspace;
    if (!await reviewWorkspace(workspace, true)) return;
    const generation = navigationId, existing = store.project(workspace);
    let project = await store.select(workspace, { experience: mode === 'work' ? 'work' : 'chat', isCurrent: () => navigationCurrent(generation) });
    if (!navigationCurrent(generation) || !project) return;
    if (['chat','work'].includes(mode) && existing) project = await store.newSession(workspace, mode);
    if (!navigationCurrent(generation)) return;
    // Navigation attaches the selected session. Refresh is requested only after it loaded.
    await navigate(project, { refresh: mode === 'refresh', generation });
  });
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
  registerAction('pilot:configure-windows-tunnel', async () => {
    if (process.platform !== 'win32' || !windowsRuntimeBootstrap) throw new Error('Настройка Windows tunnel недоступна на этой платформе.');
    await windowsRuntimeBootstrap.ensure(store.selected()?.workspace ?? os.homedir());
    return windowsRuntimeBootstrap.launchTunnelSetup();
  });
  registerAction('pilot:refresh-windows-runtime', async () => {
    if (process.platform !== 'win32' || !windowsRuntimeBootstrap) throw new Error('Windows runtime недоступен на этой платформе.');
    await windowsRuntimeBootstrap.ensure(store.selected()?.workspace ?? os.homedir());
    const status = await runtime.control('status');
    startupError = null;
    return { windowsRuntime: windowsRuntimeBootstrap.snapshot(), service: status };
  });
  registerAction('pilot:copy-workspace-path', async input => {
    const project = store.project(input);
    if (!project || project.archivedAt) throw new Error('Выберите активный проект.');
    await clipboard.writeText(project.workspace);
    return project.workspace;
  });
  registerAction('pilot:rename-project', async input => {
    if (typeof input?.workspace !== 'string') throw new Error('Выберите активный проект.');
    return store.setProjectDisplayName(input.workspace, input.name);
  });
  registerAction('pilot:rename-session', async input => {
    if (typeof input?.workspace !== 'string' || typeof input?.sessionId !== 'string') throw new Error('Выберите сессию проекта.');
    return store.renameSession(input.workspace, input.sessionId, input.name);
  });
  registerAction('pilot:archive-project', async input => {
    const project = store.project(input);
    if (!project || project.archivedAt || storageError) throw new Error('Выберите активный проект.');
    const selected = store.selected()?.workspace === input;
    if (selected) { controller.cancel(); nextNavigation(); }
    const generation = navigationId;
    try { await store.setArchived(input, true); }
    catch (error) { if (selected && navigationCurrent(generation)) await selectWorkspace(project.workspace, { resume: true }); throw error; }
    if (!navigationCurrent(generation)) return;
    startupError = null;
    if (selected) { workspaceHealth = null; await navigate(null, { generation }); }
  });
  registerAction('pilot:archive-session', async input => {
    if (typeof input?.workspace !== 'string' || typeof input?.sessionId !== 'string') throw new Error('Выберите сессию проекта.');
    const current = store.selected(); const selected = current?.workspace === input.workspace && current.sessionId === input.sessionId;
    if (selected) { controller.cancel(); nextNavigation(); }
    const generation = navigationId;
    try { await store.setSessionArchived(input.workspace, input.sessionId, true); }
    catch (error) { if (selected && current && navigationCurrent(generation)) await selectWorkspace(current.workspace, { resume: true }); throw error; }
    if (!navigationCurrent(generation)) return;
    startupError = null;
    if (selected) { const fallback = store.selected(); if (fallback) await selectWorkspace(fallback.workspace); }
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
    setupState = { phase: 'form', mode: 'new', name: '', firstSessionRequired: true, firstSessionExperience: 'chat', parent: smoke ? dataDir + '-projects' : path.dirname(store.selected()?.workspace ?? path.join(os.homedir(), 'VSCODE/Project')) };
  });
  registerAction('pilot:choose-parent', async input => {
    if (setupState?.mode !== 'new') return;
    const name = typeof input?.name === 'string' ? input.name.slice(0, 120) : setupState.name;
    const result = await dialog.showOpenDialog(window, { title: 'Где создать проект', buttonLabel: 'Выбрать папку',
      properties: ['openDirectory'], defaultPath: setupState.parent });
    setupState = { phase: 'form', mode: 'new', name, firstSessionRequired: true, firstSessionExperience: setupState.firstSessionExperience ?? 'chat', parent: result.canceled ? setupState.parent : result.filePaths[0] };
  });
  registerAction('pilot:preview-new', async input => {
    if (setupState?.mode !== 'new') throw new Error('Сначала нажмите «Создать проект».');
    const parent = setupState.parent, name = input?.name, firstSessionExperience = setupState.firstSessionExperience ?? 'chat';
    setupState = { phase: 'checking', mode: 'new', parent, name, firstSessionRequired: true, firstSessionExperience }; publish();
    const preview = await workspaceSetup.preview({ mode: 'new', parent, name });
    setupState = { ...preview, phase: 'preview', parent, name, firstSessionRequired: true, firstSessionExperience };
  });
  registerAction('pilot:refresh-setup', async () => {
    if (!setupState) return;
    const { mode, parent, name, workspace } = setupState;
    const firstSessionExperience = setupState.firstSessionExperience ?? 'chat';
    setupState = { phase: 'checking', mode, parent, name, workspace, firstSessionRequired: setupState.firstSessionRequired, firstSessionExperience }; startupError = null; publish();
    const preview = await workspaceSetup.preview({ mode, parent, name, workspace });
    const firstSessionRequired = !store.project(preview.workspace);
    setupState = { ...preview, phase: 'preview', parent, name: preview.name, firstSessionRequired, firstSessionExperience: firstSessionRequired ? firstSessionExperience : 'chat' };
  });
  registerAction('pilot:set-first-session-experience', input => {
    if (!setupState?.firstSessionRequired || !['chat', 'work'].includes(input)) throw new Error('Выберите Chat или Work для первой сессии.');
    setupState = { ...setupState, firstSessionExperience: input };
    return input;
  });
  registerAction('pilot:cancel-setup', cancelSetup);
  registerAction('pilot:apply-setup', async input => {
    if (!setupState?.token || input?.token !== setupState.token) throw new Error('Сначала проверьте выбранную папку.');
    const firstSessionRequired = !!setupState.firstSessionRequired;
    const firstSessionExperience = firstSessionRequired && setupState.firstSessionExperience === 'work' ? 'work' : 'chat';
    setupState = { ...setupState, phase: 'applying', error: null }; startupError = null; publish();
    const generation = navigationId;
    const result = await workspaceSetup.apply(input.token, { gitName: input.gitName, gitEmail: input.gitEmail });
    if (!navigationCurrent(generation)) return;
    setupState = { ...result, phase: 'preview', mode: 'existing', firstSessionRequired, firstSessionExperience };
    if (!result.ready) return;
    workspaceHealth = result;
    const project = await store.select(result.workspace, { experience: firstSessionExperience, isCurrent: () => navigationCurrent(generation) });
    if (!navigationCurrent(generation) || !project) return;
    workspaceHealth = { ...workspaceHealth, generation };
    setupState = null; publish(); void navigate(project, { generation });
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
    return selectWorkspace(input, { latest: true });
  }, { navigation: true });
  registerAction('pilot:select-session', async input => {
    if (storageError) throw new Error('Сначала нужно восстановить сохранённый список проектов.');
    if (typeof input?.workspace !== 'string' || typeof input?.sessionId !== 'string') throw new Error('Выберите сессию из дерева проекта.');
    return openConnectedSession(input.workspace, input.sessionId);
  }, { navigation: true });
  registerAction('pilot:set-expanded', input => {
    if (storageError) throw new Error('Сначала нужно восстановить сохранённый список проектов.');
    return store.setExpanded(input?.workspace, input?.expanded);
  });
  registerAction('pilot:choose-prepared-plan', async input => {
    const current = store.selected();
    if (!current || current.workspace !== input?.workspace || current.sessionId !== input?.sourceSessionId)
      throw new Error('Выбрана другая сессия.');
    const readGeneration = navigationId;
    const info = await store.inspect(current.workspace, current.sessionId);
    if (!navigationCurrent(readGeneration)) return;
    const plan = info.preparedPlans.find(p => p.planId === input.planId);
    if (!plan) throw new Error('Подготовленный план больше не доступен в этой сессии.');
    preparedChoice = { workspace: current.workspace, sourceSessionId: current.sessionId, planId: plan.planId,
      revision: plan.revision, title: plan.objective };
  });
  registerAction('pilot:cancel-prepared-choice', () => { preparedChoice = null; });
  registerAction('pilot:create-prepared-session', async experience => {
    const choice = preparedChoice, current = store.selected();
    if (!choice || current?.workspace !== choice.workspace || current.sessionId !== choice.sourceSessionId)
      throw new Error('Сначала выберите подготовленный план.');
    if (!await reviewWorkspace(choice.workspace, true)) return;
    const generation = navigationId;
    const project = await store.fromPrepared(choice.workspace, choice.sourceSessionId, choice.planId, choice.revision, experience);
    if (!navigationCurrent(generation)) return;
    preparedChoice = null; startupError = null; contextCache.clear(); await navigate(project, { generation });
  });
  registerAction('pilot:open-prepared-session', async input => {
    const current = store.selected();
    if (current?.workspace !== input?.workspace || current.sessionId !== input?.sourceSessionId) throw new Error('Выбрана другая сессия.');
    const readGeneration = navigationId;
    const info = await store.inspect(current.workspace, current.sessionId);
    if (!navigationCurrent(readGeneration)) return;
    const plan = info.preparedPlans.find(p => p.planId === input.planId);
    if (!plan?.sessionId || !plan.experience) throw new Error('Для этого плана сначала выберите Chat или Work.');
    if (!await reviewWorkspace(current.workspace, true)) return;
    const generation = navigationId;
    const project = await store.fromPrepared(current.workspace, current.sessionId, plan.planId, plan.revision, plan.experience);
    if (!navigationCurrent(generation)) return;
    startupError = null; await navigate(project, { generation });
  });
  registerAction('pilot:new-session', async input => {
    if (typeof input?.workspace !== 'string' || !['chat', 'work'].includes(input?.experience)) throw new Error('Выберите проект и тип новой сессии.');
    if (!store.project(input.workspace)) throw new Error('Выберите активный проект.');
    if (!await reviewWorkspace(input.workspace, true)) return;
    const generation = navigationId;
    await store.select(input.workspace, { isCurrent: () => navigationCurrent(generation) });
    if (!navigationCurrent(generation)) return;
    const project = await store.newSession(input.workspace, input.experience);
    if (!navigationCurrent(generation)) return;
    startupError = null; void navigate(project, { generation });
  });
  registerAction('pilot:return-chat', async () => { const current = store.selected(); if (current) await selectWorkspace(current.workspace); }, { navigation: true });
  registerAction('pilot:retry', async () => {
    const selected = store.selected(); if (selected && !await reviewWorkspace(selected.workspace, true)) return;
    startupError = null;
    const current = store.selected();
    if (current) workspaceHealth = { ...workspaceHealth, sessionId: current.sessionId };
    if (attachController(current)) await controller.retry();
  });
  registerAction('pilot:reload', async () => { startupError = null; const current = store.selected(); if (current) await selectWorkspace(current.workspace); else void navigate(); }, { navigation: true });
  registerAction('pilot:choose-runtime', async () => {
    if (process.platform === 'win32') throw new Error('Windows-версия использует встроенный Codex Local Windows runtime.');
    const result = await dialog.showOpenDialog(window, { title: 'Выбрать Codex Local Mac', buttonLabel: 'Подключить',
      properties: ['openDirectory'], defaultPath: runtimeFolder });
    if (result.canceled) return;
    const selected = await findRuntimeFolder(result.filePaths[0]);
    controller.cancel();
    runtimeFolder = selected; runtimeRegistration = null; macRuntimeBootstrap = macBootstrap(selected);
    await saveSettings({ runtimeFolder: selected, runtimeRegistration: null });
    deletion.protectedPaths = [app.getAppPath(), runtimeFolder];
    runtime = createLocalRuntime();
    connectController();
    startupError = null;
    const current = store.selected(); if (current) attachController(current);
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
  registerArchiveAction('archive:restore-sessions', async input => {
    const records = sessionArchiveRecords(input);
    for (const { project, session } of records) await store.setSessionArchived(project.workspace, session.sessionId, false);
    archiveState = { ...archiveState, notice: `Возвращено сессий: ${records.length}.` };
    return records.length;
  });
  registerArchiveAction('archive:delete-sessions', async input => {
    const records = sessionArchiveRecords(input);
    const count = await store.forgetArchivedSessions(records.map(({ project, session }) => ({ workspace: project.workspace, projectId: project.projectId, sessionId: session.sessionId })));
    archiveState = { ...archiveState, notice: `Удалено локальных сессий: ${count}. Облачные чаты ChatGPT сохранены.` };
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
  window = new BaseWindow({ name: 'main-window', title: smoke ? 'Project Web Pilot — TEST FIXTURE' : 'Project Web Pilot',
    width: 1440, height: 940, minWidth: 980, minHeight: 700, backgroundColor: shellBackground[shellTheme],
    windowStatePersistence: { bounds: true, displayMode: false } });
  sidebar = new WebContentsView({ webPreferences: { preload: path.join(sourceDir, 'preload.cjs'),
    nodeIntegration: false, contextIsolation: true, sandbox: true, webSecurity: true } });
  browser = new WebContentsView({ webPreferences: remotePreferences() });
  chatColorStyles = new ChatColors(browser.webContents, chatColors);
  colorEditor = new ChatColorsWindow({
    sourceDir, getBounds: () => window?.getBounds(),
    getState: () => ({ colors: { ...chatColors }, defaults: DEFAULT_COLORS[shellTheme], theme: shellTheme }),
    change: input => { const { key, value } = validateColorChange(input); return setChatColors({ ...chatColors, [key]: value }); },
    reset: () => setChatColors({}),
  });
  window.contentView.addChildView(sidebar); window.contentView.addChildView(browser);
  secureRemote(browser.webContents);
  chromiumDiagnostics = new ChromiumDiagnostics(browser.webContents, { file: chromiumDiagnosticsFile,
    sampleIntervalMs: smoke ? 250 : 5000, allowFixture: smoke });
  sidebar.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  sidebar.webContents.on('will-navigate', event => event.preventDefault());
  sidebar.webContents.on('did-finish-load', publish);
  browser.webContents.on('page-title-updated', rememberSessionTitle);
  browser.webContents.on('did-navigate-in-page', () => { void applyToolCallVisibility(); void installChatGPTAutoScroll(browser.webContents); publish(); if (!pageLoading && !setupState && !settingsState) void controller?.tick(); });
  browser.webContents.on('did-finish-load', () => {
    void applyToolCallVisibility(); void installChatGPTAutoScroll(browser.webContents, { forceFollow: true }); publish(); if (!pageLoading && !setupState && !settingsState) void controller?.tick();
  });
  browser.webContents.on('render-process-gone', () => {
    pageLoading = false; startupFlow?.finishPage(navigationId, 'RENDER_PROCESS_GONE');
    controller?.cancel(); report(new Error('Страница ChatGPT закрылась. Повторите открытие страницы.'));
  });
  window.on('resize', layout);
  window.on('closed', () => {
    ++navigationId; startupFlow?.dispose(); startupFlow = null; controller?.cancel(); clearInterval(interval); contextCache.clear(); workspaceSetup.invalidateReadiness();
    colorEditor?.close(); chatColorStyles?.dispose();
    void chromiumDiagnostics?.stop(); chromiumDiagnostics = null;
    if (archiveWindow && !archiveWindow.isDestroyed()) archiveWindow.close();
    for (const view of [sidebar, browser]) if (!view.webContents.isDestroyed()) view.webContents.close();
    window = null;
  });
  layout();
  // Observe the first request, including failure before a document ever loads.
  await chromiumDiagnostics.start({ appVersion: app.getVersion(), platform: process.platform, electron: process.versions.electron,
    chromium: process.versions.chrome, fixture: smoke }).catch(() => {});
  if (smoke) {
    await fsp.mkdir(dataDir + '-projects', { recursive: true });
    fixture = await import('../tests/electron-smoke.mjs');
    runtime = await fixture.createRuntime({ browser: browser.webContents, session: session.fromPartition(partition), dataDir });
  } else runtime = createLocalRuntime();
  connectController();
  createStartupFlow();
  registerIpc();
  await sidebar.webContents.loadURL(sidebarUrl);
  if (startupFlow) void startupFlow.check({ prepare: startupActive });
  interval = setInterval(() => {
    void observeStartupAccount();
    if (!pageLoading && !setupState && !settingsState) { void controller.tick(); }
  }, 1500);
  if (smoke) {
    await fixture.run({ app, window, browser: browser.webContents, sidebar: sidebar.webContents,
      store, controller, selectWorkspace, workspaceSetup, snapshot, assertLocalSender, permissionAllowed, dataDir,
      chromiumDiagnostics, chromiumDiagnosticsFile, openArchiveWindow, getArchiveWindow: () => archiveWindow,
      getColorWindow: () => colorEditor.window, chatColorStyles });
    await chromiumDiagnostics.stop(); chromiumDiagnostics = null;
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
      if (typeof settings.runtimeFolder === 'string' && path.isAbsolute(settings.runtimeFolder)) {
        if (process.platform === 'win32') configuredRuntimeFolder = settings.runtimeFolder;
        else runtimeFolder = settings.runtimeFolder;
      }
      if (settings.runtimeRegistration && typeof settings.runtimeRegistration === 'object'
          && settings.runtimeRegistration.platform === process.platform
          && typeof settings.runtimeRegistration.folder === 'string' && path.isAbsolute(settings.runtimeRegistration.folder)) {
        runtimeRegistration = { platform: process.platform, folder: settings.runtimeRegistration.folder,
          source: typeof settings.runtimeRegistration.source === 'string' ? settings.runtimeRegistration.source : 'external',
          contract: Number.isSafeInteger(settings.runtimeRegistration.contract) ? settings.runtimeRegistration.contract : 1,
          mcpUrl: typeof settings.runtimeRegistration.mcpUrl === 'string' ? settings.runtimeRegistration.mcpUrl : null,
          tunnelUi: typeof settings.runtimeRegistration.tunnelUi === 'string' ? settings.runtimeRegistration.tunnelUi : null,
          verifiedAt: typeof settings.runtimeRegistration.verifiedAt === 'string' ? settings.runtimeRegistration.verifiedAt : null };
        if (process.platform === 'darwin') runtimeFolder = runtimeRegistration.folder;
      }
      if (['light', 'dark'].includes(settings.shellTheme)) shellTheme = settings.shellTheme;
      if (typeof settings.hideToolCalls === 'boolean') hideToolCalls = settings.hideToolCalls;
      chatColors = normalizeChatColors(settings.chatColors);
      if (Number.isFinite(settings.sidebarWidth)) sidebarWidth = Math.max(SIDEBAR_MIN_WIDTH, Math.round(settings.sidebarWidth));
    } catch (error) { if (error.code !== 'ENOENT') startupError = { code: 'SETTINGS_INVALID', message: 'Не удалось прочитать локальные настройки Web Pilot. Проверьте настройки подключения.' }; }
    applyShellTheme(shellTheme);
    try { await store.load(); } catch (error) { startupError = publicError(error); storageError = true; }
    if (!smoke && app.isPackaged && process.platform === 'darwin' && !storageError
        && await offerMacInstallation({ app, dialog, fresh: store.snapshot().projects.length === 0 })) return;
    if (process.platform === 'win32') {
      const payloadFile = app.isPackaged
        ? path.join(process.resourcesPath, 'windows-payload', WINDOWS_RUNTIME_ARCHIVE)
        : path.join(sourceDir, '../.harness/runtime/windows-payload', WINDOWS_RUNTIME_ARCHIVE);
      const runtimeControlRoot = app.isPackaged ? path.join(process.resourcesPath, 'resources', 'runtime-control') : path.join(sourceDir, '../resources/runtime-control');
      windowsRuntimeBootstrap = new WindowsRuntimeBootstrap({ payloadFile, dataDir, preferredFolder: configuredRuntimeFolder,
        controlSourceFile: path.join(runtimeControlRoot, 'windows-control.py'), onState: publish });
      const windowsRuntimeState = await windowsRuntimeBootstrap.inspect();
      runtimeFolder = windowsRuntimeState.folder;
      if (windowsRuntimeState.source === 'external' || configuredRuntimeFolder) await saveSettings({ runtimeFolder });
    }
    else if (process.platform === 'darwin' && !smoke) {
      macRuntimeBootstrap = macBootstrap(runtimeRegistration?.folder ?? runtimeFolder);
      const macRuntimeState = await macRuntimeBootstrap.inspect();
      runtimeFolder = macRuntimeState.folder;
      if (macRuntimeState.error) startupError = { code: macRuntimeState.error, message: 'Выбранный Codex Local Mac изменён; автоматическое восстановление остановлено.' };
    }
    deletion = new WorkspaceDeletion({ store, journalDir: path.join(dataDir, 'deletions'), protectedPaths: [app.getAppPath(), runtimeFolder] });
    if (!storageError) {
      const errors = await deletion.recover();
      if (errors.length) { startupError = errors[0]; settingsState = { workspace: errors[0].workspace, deletion: null, notice: null }; }
    }
    const remoteSession = session.fromPartition(partition);
    remoteSession.setPermissionRequestHandler((contents, permission, callback, details) => {
      const origin = details?.securityOrigin ?? details?.requestingUrl ?? contents.getURL();
      callback(permissionAllowed(permission, origin, details, contents));
    });
    remoteSession.setPermissionCheckHandler((_contents, permission, requestingOrigin, details) => {
      const origin = details?.securityOrigin ?? requestingOrigin ?? details?.requestingUrl;
      return permissionAllowed(permission, origin, details, _contents);
    });
    installMenu();
    await createWindow();
  }).catch(error => {
    console.error('Project Web Pilot:', error.message);
    if (!smoke) dialog.showErrorBox('Project Web Pilot', error.message);
    app.exit(1);
  });
}
