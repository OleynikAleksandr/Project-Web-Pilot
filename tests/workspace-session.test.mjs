import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { randomUUID } from 'node:crypto';
import { WorkspaceSessions, readWorkspace, normalizeChatUrl } from '../src/workspace-session.mjs';

async function fixture(t) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'web-pilot-workspaces-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  async function project(name, id = randomUUID()) {
    const folder = path.join(root, name);
    await fs.mkdir(path.join(folder, '.harness/plans'), { recursive: true });
    await fs.mkdir(path.join(folder, 'scripts'), { recursive: true });
    await fs.writeFile(path.join(folder, 'scripts/workflow.mjs'), '// fixture');
    const plan = { schema_version: 1, project_id: id, project_name: name, plan_revision: 7,
      scope_id: 'fixture-scope', execution_scope_status: 'ACTIVE', delivery_status: 'IN_PROGRESS',
      current_task_id: null, tasks: [{ id: 'T001', title: 'Задача', commit_status: 'PENDING' }] };
    await fs.writeFile(path.join(folder, '.harness/plans/todo-plan.md'),
      '<!-- workflow-state:begin -->\n```json\n' + JSON.stringify(plan) + '\n```\n<!-- workflow-state:end -->');
    return folder;
  }
  return { root, project, store: new WorkspaceSessions(path.join(root, 'app-data/sessions.json')) };
}

test('canonical folder with spaces and Cyrillic survives restart with its conversation', async t => {
  const { root, project, store } = await fixture(t);
  const folder = await project('Мой проект');
  const link = path.join(root, 'ссылка'); await fs.symlink(folder, link);
  const a = await store.select(link);
  assert.equal(a.workspace, await fs.realpath(folder));
  assert.equal(a.nextTaskId, 'T001');
  const chat = 'https://chatgpt.com/c/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
  await store.bindChat(a.workspace, a.sessionId, chat + '?utm_source=x#bottom');
  const next = new WorkspaceSessions(store.file); await next.load();
  const reopened = await next.select(folder);
  assert.equal(reopened.sessionId, a.sessionId);
  assert.equal(reopened.chatUrl, chat);
  assert.equal((await fs.stat(store.file)).mode & 0o777, 0o600);
});

test('switching project cannot mutate another chat or accept late session results', async t => {
  const { project, store } = await fixture(t);
  const a = await store.select(await project('A')); const b = await store.select(await project('B'));
  assert.notEqual(a.sessionId, b.sessionId);
  const url = 'https://chatgpt.com/c/aaaaaaaa';
  await store.bindChat(a.workspace, a.sessionId, url);
  await assert.rejects(store.bindChat(b.workspace, b.sessionId, url), { code: 'CHAT_IN_USE' });
  await assert.rejects(store.bindChat(a.workspace, a.sessionId, 'https://chatgpt.com/c/bbbbbbbb'), { code: 'CHAT_CHANGED' });
  const newA = await store.newChat(a.workspace);
  assert.notEqual(newA.sessionId, a.sessionId);
  await assert.rejects(store.updateSession(a.workspace, a.sessionId, { receipt: {} }), { code: 'SESSION_CHANGED' });
  assert.equal(store.selected().workspace, b.workspace);
  assert.equal(store.project(a.workspace).receipt, null);
});

test('a replacement project is rejected and the original binding is preserved', async t => {
  const { project, store } = await fixture(t);
  const folder = await project('Original'); const a = await store.select(folder);
  await project('Original', randomUUID());
  await assert.rejects(store.select(folder), { code: 'PROJECT_REPLACED' });
  assert.equal(store.project(a.workspace).projectId, a.projectId);
});

test('invalid/missing workspace and malformed storage fail without overwriting data', async t => {
  const { root, store } = await fixture(t);
  await assert.rejects(readWorkspace('relative'), { code: 'WORKSPACE_REQUIRED' });
  await assert.rejects(readWorkspace(root), { code: 'WORKFLOW_NOT_INSTALLED' });
  await fs.mkdir(path.dirname(store.file), { recursive: true });
  await fs.writeFile(store.file, 'broken original');
  await assert.rejects(store.load(), { code: 'SESSIONS_INVALID' });
  assert.equal(await fs.readFile(store.file, 'utf8'), 'broken original');
});

test('only actual HTTPS ChatGPT conversation URLs can be saved', () => {
  for (const url of ['http://chatgpt.com/c/aaaaaaaa', 'https://chatgpt.com.evil.test/c/aaaaaaaa',
    'file:///tmp/chat', 'https://evil@chatgpt.com/c/aaaaaaaa', 'https://chatgpt.com/',
    'https://chatgpt.com/auth/login', 'https://chatgpt.com:444/c/aaaaaaaa']) assert.equal(normalizeChatUrl(url), null);
  assert.equal(normalizeChatUrl('https://chatgpt.com/work/aaaaaaaa'), 'https://chatgpt.com/work/aaaaaaaa');
});
