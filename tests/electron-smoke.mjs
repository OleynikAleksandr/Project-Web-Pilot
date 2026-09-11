import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID, createHash } from 'node:crypto';
import { readWorkspace, WorkspaceSessions } from '../src/workspace-session.mjs';

let packetLoads = 0;
const fixtureContext = Array.from({ length: 400 }, (_, i) => `Раздел ${i + 1}: полный контекст проекта, включая кириллицу и точные пути.\n  Файл: /Projects/Мой проект/src/модуль.mjs\n\n`).join('');
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
    return snapshot().context.phase === 'delivered';
  }, 'first fixture context', snapshot);
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
  assert.equal(await sidebar.executeJavaScript('document.getElementById("workspace-name").textContent'), 'Тестовый проект');
  const restored = new WorkspaceSessions(store.file); await restored.load();
  assert.equal(restored.selected().sessionId, first.sessionId); assert.equal(restored.selected().chatUrl, first.chatUrl);
  controller.attach(store.selected()); await controller.tick();
  assert.equal(packetLoads, 1);
  await sidebar.executeJavaScript('document.getElementById("new-chat").click()');
  await waitFor(() => store.selected()?.sessionId !== first.sessionId && snapshot().context.phase === 'delivered', 'new chat via actual sidebar IPC', snapshot);
  assert.equal(packetLoads, 2);
  assert.equal(await browser.executeJavaScript('window.fixtureMessages.length'), 1);
  const result = { mode: 'isolated-fixture', electron: process.versions.electron, chromium: process.versions.chrome,
    views: window.contentView.children.length, secureRemote: true, sidebarIpc: true, startupMessages: packetLoads,
    restartKeepsSession: true, newChatCreatesSession: true, fullContextBytes: Buffer.byteLength(fixtureContext), liveChatGPT: false, agentToolsRequired: false };
  await fs.writeFile(path.join(dataDir, 'smoke-result.json'), JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result));
}
