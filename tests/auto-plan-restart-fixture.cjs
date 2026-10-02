// Fresh Electron process: no live ChatGPT, user account or real workspace mutations.
const { app, BrowserWindow, ipcMain, session } = require('electron');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const [settingsFile, expectedChoice] = process.argv.slice(2);
app.setPath('userData', path.join(path.dirname(settingsFile), 'auto-plan-restart-' + expectedChoice));
const deadline = setTimeout(() => { console.error('AutoPlan restart fixture timed out'); app.exit(1); }, 15000);
app.whenReady().then(async () => {
  const root = path.resolve(__dirname, '..');
  const { AutoPlan } = await import(pathToFileURL(path.join(root, 'src/auto-plan.mjs')));
  const { readAutoPlanState } = await import(pathToFileURL(path.join(root, 'src/auto-plan-state.mjs')));
  const { PageStateSource } = await import(pathToFileURL(path.join(root, 'src/page-state.mjs')));
  const { connectPageState } = await import(pathToFileURL(path.join(root, 'src/page-state-bridge.mjs')));
  const { ChatGPTComposer } = await import(pathToFileURL(path.join(root, 'src/chatgpt-composer.mjs')));
  const settings = JSON.parse(await fs.readFile(settingsFile, 'utf8'));
  assert.equal(settings.autoPlanEnabled, expectedChoice === 'on');
  const [workspace, sessionId, scopeId, chatUrl] = JSON.parse(settings.autoPlanCheckpoint.key);
  const selected = { workspace, sessionId, scopeId, chatUrl };
  const partition = session.fromPartition('restart-fixture');
  await partition.protocol.handle('https', () => new Response('<html><body><article data-message-author-role="user">Existing request</article><button id="stop" data-testid="stop-button">Stop</button><form><div id="prompt-textarea" contenteditable="true"></div><button data-testid="send-button">Send</button></form><script>window.sent=[];document.querySelector("form").onsubmit=e=>{e.preventDefault();sent.push(document.getElementById("prompt-textarea").textContent)};document.getElementById("prompt-textarea").onpaste=e=>{e.preventDefault();e.currentTarget.textContent+=e.clipboardData.getData("text/plain");e.currentTarget.dispatchEvent(new Event("input",{bubbles:true}))}</script></body></html>', { headers: { 'content-type': 'text/html' } }));
  const window = new BrowserWindow({ show: false, webPreferences: { session: partition, sandbox: true,
    contextIsolation: true, nodeIntegration: false, preload: path.join(root, 'resources/chatgpt-page-observer-preload.cjs') } });
  const source = new PageStateSource(), disconnect = connectPageState(window.webContents, ipcMain, source);
  const composer = new ChatGPTComposer(window.webContents, { pageState: source });
  let automatic;
  const wait = async predicate => {
    const began = Date.now();
    while (!predicate()) {
      if (Date.now() - began > 5000) throw new Error('Restart state timeout: ' + JSON.stringify(automatic?.view()));
      await source.waitForChange(source.version, { timeoutMs: 50 });
    }
  };
  const unsubscribe = source.subscribe(event => {
    automatic?.observe(event);
    void automatic?.recover();
  });
  try {
    automatic = new AutoPlan({ selected: () => selected, inspectPlan: () => readAutoPlanState(selected),
      send: (text, canContinue, onBeforeSend) => composer.sendUserMessage({ text, canContinue, onBeforeSend, waitForAcknowledgement: false }) });
    automatic.restore(settings.autoPlanEnabled, settings.autoPlanCheckpoint);
    await window.loadURL(chatUrl);
    await wait(() => source.current?.state.editorAvailable);
    await automatic.recover();
    await wait(() => !automatic.recovering);
    assert.equal(automatic.view().enabled, expectedChoice === 'on');
    assert.deepEqual(await window.webContents.executeJavaScript('window.sent'), [], 'fresh process never repeats Send into a busy turn');
    if (expectedChoice === 'on') {
      assert.equal(automatic.view().phase, 'running');
      assert.equal(automatic.run.sawBusy, true);
    } else assert.equal(automatic.run, null);
    console.log(JSON.stringify({ autoPlanRestart: expectedChoice, busy: true, sends: 0, isolated: true }));
  } finally { automatic?.dispose(); unsubscribe(); disconnect(); window.destroy(); clearTimeout(deadline); app.quit(); }
}).catch(error => { console.error(error); clearTimeout(deadline); app.exit(1); });
