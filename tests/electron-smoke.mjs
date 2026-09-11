import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { readWorkspace, WorkspaceSessions } from '../src/workspace-session.mjs';

const observedRequests = new Set();
const html = `<!doctype html><html lang="ru"><head><meta charset="utf-8"><title>TEST FIXTURE — no live ChatGPT</title>
<style>body{font:16px -apple-system,sans-serif;padding:40px;background:#fcfcff;color:#29394c}aside{background:#fff0d7;padding:14px;margin-bottom:20px}#prompt-textarea{border:1px solid #9caeb8;padding:12px;min-height:80px;white-space:pre-wrap}button{padding:10px}article{white-space:pre-wrap;font-size:12px}</style></head>
<body><aside>TEST FIXTURE · без реального ChatGPT, MCP и аккаунта</aside><h1>Composer fixture</h1>
<div id="messages"></div><form><div id="prompt-textarea" contenteditable="true" role="textbox"></div><button type="submit" data-testid="send-button">Send fixture</button></form>
<script>
window.fixtureMessages=[];
document.querySelector('form').addEventListener('submit',event=>{
 event.preventDefault(); const editor=document.getElementById('prompt-textarea');const text=editor.innerText;
 const message={text,at:Date.now()};window.fixtureMessages.push(message);
 const article=document.createElement('article');article.setAttribute('data-message-author-role','user');article.textContent=text;document.getElementById('messages').append(article);
 editor.textContent='';const id=text.match(/wp-request-[a-zA-Z0-9-]+/)[0];history.pushState({},'', '/c/'+id);
});
</script></body></html>`;

export async function createRuntime({ browser, session }) {
  // Explicit isolated test mode only. No request is sent to a real service.
  await session.protocol.handle('https', () => new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8' } }));
  return {
    ensure: async () => ({ mcp: { ready: true }, tunnel: { ready: true }, fixture: true }),
    contextStatus: async (workspace, sessionId) => {
      const messages = await browser.executeJavaScript('window.fixtureMessages ?? []').catch(() => []);
      const message = messages.find(item => item.text.includes(`Session ID для этого чата: ${sessionId}`));
      if (!message) return { workspace, session_id: sessionId, latest: null, last_receipt: null };
      const info = await readWorkspace(workspace);
      const requestId = message.text.match(/wp-request-[a-zA-Z0-9-]+/)?.[0];
      observedRequests.add(requestId);
      const facts = { project_id: info.projectId, project_name: info.name, plan_revision: info.planRevision,
        scope_id: info.scopeId, execution_scope_status: info.scopeStatus, delivery_status: info.deliveryStatus,
        task_id: info.nextTaskId, task_title: info.nextTaskTitle };
      const probeId = 'fixture-probe-' + requestId;
      return { workspace, session_id: sessionId,
        latest: { workspace, session_id: sessionId, probe_id: probeId, source: 'agent_request',
          issued_at: message.at / 1000, acknowledged_at: message.at / 1000, acknowledged: true, facts },
        last_receipt: { workspace, probe_id: probeId, source: 'agent_request', status: 'acknowledged', facts,
          user_message: 'TEST FIXTURE: синтетический status, не реальный ACK.' } };
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

export async function run({ app, window, browser, sidebar, store, controller, selectWorkspace, snapshot, assertLocalSender, dataDir }) {
  assert.equal(app.isPackaged, false, 'Fixtures never run from a packaged app');
  const workspace = path.join(dataDir, 'Тестовый проект с пробелами');
  await fs.mkdir(path.join(workspace, '.harness/plans'), { recursive: true });
  await fs.mkdir(path.join(workspace, 'scripts'), { recursive: true });
  await fs.writeFile(path.join(workspace, 'scripts/workflow.mjs'), '// Test fixture only');
  const plan = { schema_version: 1, project_id: randomUUID(), project_name: 'Тестовый проект', plan_revision: 7,
    scope_id: 'fixture-scope', execution_scope_status: 'ACTIVE', delivery_status: 'IN_PROGRESS', current_task_id: null,
    tasks: [{ id: 'T001', title: 'Проверить fixture', commit_status: 'PENDING' }] };
  await fs.writeFile(path.join(workspace, '.harness/plans/todo-plan.md'),
    '<!-- workflow-state:begin -->\n```json\n' + JSON.stringify(plan) + '\n```\n<!-- workflow-state:end -->');
  await waitFor(() => sidebar.executeJavaScript('typeof window.webPilot === "object"'), 'local IPC ready', snapshot);
  await selectWorkspace(workspace);
  await waitFor(async () => {
    if (snapshot().context.phase === 'waiting-draft') {
      const actual = await browser.executeJavaScript('document.getElementById("prompt-textarea").innerText');
      const expected = store.selected().attempt?.text ?? '';
      let offset = 0; while (offset < Math.min(actual.length, expected.length) && actual[offset] === expected[offset]) offset++;
      throw new Error('FIXTURE_DRAFT_MISMATCH: ' + JSON.stringify({ offset, actualLength: actual.length, expectedLength: expected.length, actual: actual.slice(Math.max(0,offset-40),offset+100), expected: expected.slice(Math.max(0,offset-40),offset+100) }));
    }
    return snapshot().context.phase === 'confirmed';
  }, 'first fixture context', snapshot);
  const first = store.selected();
  assert.ok(first.chatUrl.startsWith('https://chatgpt.com/c/'));
  assert.equal(first.attempt.state, 'acknowledged');
  assert.equal(observedRequests.size, 1);
  assert.deepEqual(await browser.executeJavaScript('({ require:typeof require, process:typeof process, bridge:typeof window.webPilot })'),
    { require: 'undefined', process: 'undefined', bridge: 'undefined' });
  const prefs = browser.getLastWebPreferences();
  assert.equal(prefs.nodeIntegration, false); assert.equal(prefs.contextIsolation, true); assert.equal(prefs.sandbox, true);
  assert.throws(() => assertLocalSender({ sender: browser, senderFrame: browser.mainFrame }), { code: 'IPC_FORBIDDEN' });
  assert.equal(await sidebar.executeJavaScript('document.getElementById("context-title").textContent'), 'Контекст подтверждён');
  assert.equal(await sidebar.executeJavaScript('document.getElementById("workspace-name").textContent'), 'Тестовый проект');
  const restored = new WorkspaceSessions(store.file); await restored.load();
  assert.equal(restored.selected().sessionId, first.sessionId); assert.equal(restored.selected().chatUrl, first.chatUrl);
  controller.attach(store.selected()); await controller.tick();
  assert.equal(observedRequests.size, 1);
  await sidebar.executeJavaScript('document.getElementById("new-chat").click()');
  await waitFor(() => store.selected()?.sessionId !== first.sessionId && snapshot().context.phase === 'confirmed', 'new chat via actual sidebar IPC', snapshot);
  assert.equal(observedRequests.size, 2);
  assert.equal(await browser.executeJavaScript('window.fixtureMessages.length'), 1);
  const result = { mode: 'isolated-fixture', electron: process.versions.electron, chromium: process.versions.chrome,
    views: window.contentView.children.length, secureRemote: true, sidebarIpc: true, startupMessages: observedRequests.size,
    restartKeepsSession: true, newChatCreatesSession: true, liveChatGPT: false, realAck: false };
  await fs.writeFile(path.join(dataDir, 'smoke-result.json'), JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result));
}
