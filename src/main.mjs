import { app, BaseWindow, WebContentsView, Menu, session } from 'electron';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';

const shellSmoke = process.argv.includes('--shell-smoke');
app.setName('Project Web Pilot');
app.setPath('userData', shellSmoke
  ? fs.mkdtempSync(path.join(os.tmpdir(), 'web-pilot-shell-'))
  : path.join(app.getPath('appData'), 'Project Web Pilot'));

let window;
let browser;
let sidebar;
const sidebarWidth = 300;

function remotePreferences() {
  return { partition: shellSmoke ? 'shell-smoke' : 'persist:chatgpt', nodeIntegration: false,
    contextIsolation: true, sandbox: true, webSecurity: true };
}

function secureRemote(contents) {
  contents.on('will-navigate', (event, url) => {
    if (!url.startsWith('https://')) event.preventDefault();
  });
  contents.setWindowOpenHandler(({ url }) => ({
    action: url.startsWith('https://') ? 'allow' : 'deny',
    overrideBrowserWindowOptions: { width: 1000, height: 780, webPreferences: remotePreferences() },
  }));
  contents.on('did-create-window', child => secureRemote(child.webContents));
}

function layout() {
  if (!window || window.isDestroyed()) return;
  const [width, height] = window.getContentSize();
  sidebar.setBounds({ x: 0, y: 0, width: sidebarWidth, height });
  browser.setBounds({ x: sidebarWidth, y: 0, width: Math.max(0, width - sidebarWidth), height });
}

async function createWindow() {
  window = new BaseWindow({ title: 'Project Web Pilot', width: 1440, height: 940,
    minWidth: 980, minHeight: 680, backgroundColor: '#f6f7f9' });
  sidebar = new WebContentsView({ webPreferences: { nodeIntegration: false,
    contextIsolation: true, sandbox: true } });
  browser = new WebContentsView({ webPreferences: remotePreferences() });
  window.contentView.addChildView(sidebar);
  window.contentView.addChildView(browser);
  secureRemote(browser.webContents);
  sidebar.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  sidebar.webContents.on('will-navigate', event => event.preventDefault());
  window.on('resize', layout);
  window.on('closed', () => {
    sidebar.webContents.close(); browser.webContents.close(); window = null;
  });
  layout();
  await sidebar.webContents.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(
    '<!doctype html><html lang="ru"><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src \'none\'; style-src \'unsafe-inline\'"><style>body{font:15px -apple-system,sans-serif;background:#f2f4f7;color:#1b273c;padding:26px}h1{font-size:22px}p{line-height:1.6;color:#657184}</style><h1>Project Web Pilot</h1><p>Ваш проект и ChatGPT<br>в одном окне.</p><p>Подготавливаем первый прототип.</p></html>'));
  if (shellSmoke) {
    await browser.webContents.loadURL('data:text/html,<h1>Shell fixture</h1>');
    const exposed = await browser.webContents.executeJavaScript('({ require: typeof require, process: typeof process })');
    if (exposed.require !== 'undefined' || exposed.process !== 'undefined') throw new Error('REMOTE_NODE_EXPOSED');
    console.log(JSON.stringify({ shellSmoke: 'passed', views: window.contentView.children.length,
      remoteNodeIntegration: false, ...exposed }));
    window.close(); app.quit();
  } else {
    await browser.webContents.loadURL('https://chatgpt.com/').catch(error => {
      console.error('ChatGPT page:', error.message);
    });
  }
}

if (!shellSmoke && !app.requestSingleInstanceLock()) app.quit();
else {
  app.on('second-instance', () => { window?.restore(); window?.focus(); });
  app.whenReady().then(async () => {
  session.fromPartition(shellSmoke ? 'shell-smoke' : 'persist:chatgpt')
    .setPermissionRequestHandler((_contents, _permission, callback) => callback(false));
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    { label: 'Project Web Pilot', submenu: [{ role: 'about' }, { type: 'separator' }, { role: 'quit' }] },
    { label: 'Правка', submenu: [{ role: 'undo' }, { role: 'redo' }, { type: 'separator' },
      { role: 'cut' }, { role: 'copy' }, { role: 'paste' }, { role: 'selectAll' }] },
    { label: 'Вид', submenu: [{ role: 'reload' }, { role: 'togglefullscreen' },
      { role: 'resetZoom' }, { role: 'zoomIn' }, { role: 'zoomOut' }] },
  ]));
  await createWindow();
  app.on('activate', () => { if (!window) createWindow(); });
  app.on('window-all-closed', () => app.quit());
  }).catch(error => { console.error(error); app.exit(1); });
}
