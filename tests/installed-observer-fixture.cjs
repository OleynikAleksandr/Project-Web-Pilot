const { app, BrowserWindow, ipcMain, session } = require('electron');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const [resourceRoot, moduleRoot, profile] = process.argv.slice(2);
app.setPath('userData', profile);
const html = `<!doctype html><html><body><div id="messages"></div><form>
<textarea id="prompt-textarea"></textarea><button data-testid="send-button" disabled>Send</button></form>
<script>
const sent=JSON.parse(sessionStorage.getItem('sent')||'[]');
function show(text){const el=document.createElement('article');el.dataset.messageAuthorRole='user';el.textContent=text;document.querySelector('#messages').append(el)}
sent.forEach(show);
document.querySelector('form').onsubmit=e=>{e.preventDefault();const text=document.querySelector('textarea').value;sent.push(text);sessionStorage.setItem('sent',JSON.stringify(sent));show(text);document.querySelector('textarea').value='';document.querySelector('textarea').dispatchEvent(new Event('input',{bubbles:true}))};
setTimeout(()=>document.querySelector('button').disabled=false,350);
</script></body></html>`;
const deadline = setTimeout(() => { console.error('Installed fixture deadline'); app.exit(1); }, 20000);
app.whenReady().then(async () => {
  const { PageStateSource } = await import(pathToFileURL(path.join(moduleRoot, 'page-state.mjs')));
  const { connectPageState } = await import(pathToFileURL(path.join(moduleRoot, 'page-state-bridge.mjs')));
  const { ChatGPTComposer } = await import(pathToFileURL(path.join(moduleRoot, 'chatgpt-composer.mjs')));
  const partition = session.fromPartition('installed-observer-fixture');
  await partition.protocol.handle('https', () => new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8' } }));
  const view = new BrowserWindow({ show: false, webPreferences: { session: partition,
    sandbox: true, contextIsolation: true, nodeIntegration: false,
    preload: path.join(resourceRoot, 'resources/chatgpt-page-observer-preload.cjs') } });
  const source = new PageStateSource(), disconnect = connectPageState(view.webContents, ipcMain, source);
  try {
    await view.loadURL('https://chatgpt.com/c/installed-fixture');
    if (!source.current) await source.waitForChange(source.version, { timeoutMs: 3000 });
    assert.ok(source.current?.state.editorAvailable);
    assert.equal(await view.webContents.executeJavaScript('typeof window.require + ":" + typeof window.webPilot'), 'undefined:undefined');
    const composer = new ChatGPTComposer(view.webContents, { pageState: source });
    const text = 'Полный пакет проверки. '.repeat(10000) + 'wp-request-installed-fixture';
    assert.equal((await composer.deliver({ text, requestId: 'wp-request-installed-fixture' })).state, 'sent');
    assert.equal(await view.webContents.executeJavaScript('document.querySelectorAll("article").length'), 1);
    const documentId = source.current.documentId;
    await view.loadURL('https://chatgpt.com/c/installed-fixture');
    if (!source.current) await source.waitForChange(source.version, { timeoutMs: 3000 });
    assert.notEqual(source.current.documentId, documentId);
    assert.equal((await composer.inspect({ requestId: 'wp-request-installed-fixture' })).messageSeen, true);
    assert.equal(await view.webContents.executeJavaScript('document.querySelectorAll("article").length'), 1);
    console.log(JSON.stringify({ installedPreload: resourceRoot, scenario: 'sandbox observer, large Send, same conversation reload without duplicate',
      electron: process.versions.electron, node: process.versions.node, liveChatGPT: false }));
  } finally { disconnect(); view.destroy(); clearTimeout(deadline); }
  app.quit();
}).catch(error => { console.error(error); clearTimeout(deadline); app.exit(1); });
