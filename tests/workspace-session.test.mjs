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

test('new chats retain all previous sessions and their independent context after restart', async t => {
  const { project, store } = await fixture(t);
  const first = await store.select(await project('История'));
  await store.bindChat(first.workspace, first.sessionId, 'https://chatgpt.com/c/first-chat');
  await store.setSessionTitle(first.workspace, first.sessionId, 'Первый разговор');
  await store.updateSession(first.workspace, first.sessionId, { attempt: { state: 'sent', requestId: 'request-1' } });
  const second = await store.newChat(first.workspace);
  await store.bindChat(first.workspace, second.sessionId, 'https://chatgpt.com/c/second-chat');
  await store.updateSession(first.workspace, second.sessionId, { attempt: { state: 'unknown', requestId: 'request-2' } });
  assert.equal(store.snapshot().projects[0].sessions.length, 2);
  await store.selectSession(first.workspace, first.sessionId);
  assert.equal(store.selected().title, 'Первый разговор');
  assert.equal(store.selected().attempt.requestId, 'request-1');
  await store.setExpanded(first.workspace, false);
  const restored = new WorkspaceSessions(store.file); await restored.load();
  assert.equal(restored.selected().sessionId, first.sessionId);
  assert.equal(restored.snapshot().projects[0].expanded, false);
  await restored.selectSession(first.workspace, second.sessionId);
  assert.equal(restored.selected().attempt.state, 'unknown');
  assert.equal(restored.selected().chatUrl, 'https://chatgpt.com/c/second-chat');
});

test('legacy storage migrates intact with an exclusive backup and is not migrated twice', async t => {
  const { project, store } = await fixture(t);
  const original = await store.select(await project('Прежний проект'));
  const legacy = { schemaVersion: 1, selectedWorkspace: original.workspace, projects: [{ ...original,
    chatUrl: 'https://chatgpt.com/c/legacy-chat', attempt: { state: 'sent', text: 'Точный старый текст', requestId: 'legacy-request' },
    receipt: { old: true } }] };
  const text = JSON.stringify(legacy);
  await fs.writeFile(store.file, text);
  const restored = new WorkspaceSessions(store.file); await restored.load();
  assert.equal(restored.snapshot().schemaVersion, 3);
  assert.equal(restored.snapshot().projects[0].sessions.length, 1);
  assert.equal(restored.selected().attempt.text, 'Точный старый текст');
  assert.equal(restored.selected().chatUrl, legacy.projects[0].chatUrl);
  assert.deepEqual(restored.selected().receipt, { old: true });
  assert.equal(await fs.readFile(store.file + '.v1-backup', 'utf8'), text);
  await restored.newChat(original.workspace); await restored.load();
  assert.equal(restored.snapshot().projects[0].sessions.length, 2);
  assert.equal(await fs.readFile(store.file + '.v1-backup', 'utf8'), text);
});

test('session selection and binding reject cross-project or duplicate conversations', async t => {
  const { project, store } = await fixture(t);
  const a = await store.select(await project('A'));
  const b = await store.select(await project('B'));
  await assert.rejects(store.selectSession(a.workspace, b.sessionId), { code: 'SESSION_NOT_FOUND' });
  assert.equal(store.selected().workspace, b.workspace);
  await store.bindChat(a.workspace, a.sessionId, 'https://chatgpt.com/c/one-chat');
  const next = await store.newChat(a.workspace);
  await assert.rejects(store.bindChat(a.workspace, next.sessionId, 'https://chatgpt.com/c/one-chat'), { code: 'CHAT_IN_USE' });
  await assert.rejects(store.setSessionTitle(a.workspace, a.sessionId, 'Late title'), { code: 'SESSION_CHANGED' });
});

test('corrupt histories and invalid selection preserve the original data', async t => {
  const { project, store } = await fixture(t);
  await store.select(await project('A'));
  for (const mutate of [d => d.projects[0].sessions.push({ ...d.projects[0].sessions[0] }),
    d => d.projects[0].selectedSessionId = 'missing', d => d.projects[0].sessions[0].chatUrl = 'https://evil.test/c/anything']) {
    const data = store.snapshot(); mutate(data); const text = JSON.stringify(data);
    await fs.writeFile(store.file, text);
    await assert.rejects(new WorkspaceSessions(store.file).load(), { code: 'SESSIONS_INVALID' });
    assert.equal(await fs.readFile(store.file, 'utf8'), text);
  }
});

test('archive and restore preserve every session, selection and project files', async t => {
  const { project, store } = await fixture(t); const a = await store.select(await project('Архив'));
  await store.bindChat(a.workspace, a.sessionId, 'https://chatgpt.com/c/archive-chat');
  await store.updateSession(a.workspace, a.sessionId, { attempt: { state: 'sent', requestId: 'kept-request' } });
  await store.newChat(a.workspace); await store.selectSession(a.workspace, a.sessionId);
  const before = store.snapshot().projects[0], plan = await fs.readFile(path.join(a.workspace, '.harness/plans/todo-plan.md'));
  await store.setArchived(a.workspace, true); assert.equal(store.selected(), null);
  await assert.rejects(store.select(a.workspace), { code: 'PROJECT_ARCHIVED' });
  await assert.rejects(store.newChat(a.workspace), { code: 'PROJECT_ARCHIVED' });
  await assert.rejects(store.updateSession(a.workspace, a.sessionId, { receipt: {} }), { code: 'PROJECT_ARCHIVED' });
  const restored = new WorkspaceSessions(store.file); await restored.load(); assert.ok(restored.project(a.workspace).archivedAt);
  await restored.setArchived(a.workspace, false);
  assert.deepEqual(restored.snapshot().projects[0], before);
  assert.deepEqual(await fs.readFile(path.join(a.workspace, '.harness/plans/todo-plan.md')), plan);
  const selected = await restored.select(a.workspace); assert.equal(selected.sessionId, a.sessionId); assert.equal(selected.attempt.requestId, 'kept-request');
});
test('version two history migrates with an exact backup and starts active', async t => {
  const { project, store } = await fixture(t); await store.select(await project('Version 2')); await store.newChat(store.selected().workspace);
  const old = store.snapshot(); old.schemaVersion = 2; delete old.projects[0].archivedAt;
  const original = JSON.stringify(old); await fs.writeFile(store.file, original);
  const next = new WorkspaceSessions(store.file); await next.load();
  assert.equal(next.snapshot().schemaVersion, 3); assert.equal(next.selected().archivedAt, null);
  assert.deepEqual(next.snapshot().projects[0].sessions, old.projects[0].sessions);
  assert.equal(await fs.readFile(store.file + '.v2-backup', 'utf8'), original);
});
test('archive save failure preserves current state and queued edits do not lose other projects', async t => {
  const { project, store } = await fixture(t); const a = await store.select(await project('A')); const b = await store.select(await project('B'));
  const diskBefore = await fs.readFile(store.file), before = store.snapshot(), save = store.save;
  store.save = async () => { throw new Error('disk full'); };
  await assert.rejects(store.setArchived(a.workspace, true), /disk full/);
  assert.deepEqual(store.snapshot(), before); assert.deepEqual(await fs.readFile(store.file), diskBefore);
  store.save = save;
  await Promise.all([store.setArchived(a.workspace, true), store.setSessionTitle(b.workspace, b.sessionId, 'Preserved title')]);
  assert.ok(store.project(a.workspace).archivedAt); assert.equal(store.project(b.workspace).title, 'Preserved title');
  assert.equal(store.selected().workspace, b.workspace);
});
test('forgetting requires an archived matching identity and removes all local sessions only', async t => {
  const { project, store } = await fixture(t); const a = await store.select(await project('Forget'));
  await store.newChat(a.workspace);
  await assert.rejects(store.forgetArchived(a.workspace, a.projectId), { code: 'PROJECT_NOT_ARCHIVED' });
  await store.setArchived(a.workspace, true);
  await assert.rejects(store.forgetArchived(a.workspace, 'wrong-id'), { code: 'PROJECT_REPLACED' });
  await store.forgetArchived(a.workspace, a.projectId);
  assert.equal(store.project(a.workspace), null); assert.equal(store.snapshot().projects.length, 0);
  assert.ok((await fs.stat(a.workspace)).isDirectory(), 'Metadata operation never deletes files');
});
