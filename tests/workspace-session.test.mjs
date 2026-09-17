import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { randomUUID } from 'node:crypto';
import { WorkspaceSessions, readWorkspace, normalizeChatUrl, conversationExperience, conversationUrlCompatibleWithExperience, activeSessionsNewestFirst } from '../src/workspace-session.mjs';

const directoryLink = (target, link) => fs.symlink(target, link, process.platform === 'win32' ? 'junction' : 'dir');

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
      current_task_id: null, tasks: [{ id: 'T001', title: 'Задача', implementation_status: 'TODO', commit_status: 'PENDING' }] };
    await fs.writeFile(path.join(folder, '.harness/plans/todo-plan.md'),
      '<!-- workflow-state:begin -->\n```json\n' + JSON.stringify(plan) + '\n```\n<!-- workflow-state:end -->');
    return folder;
  }
  return { root, project, store: new WorkspaceSessions(path.join(root, 'app-data/sessions.json')) };
}



test('readWorkspace exposes user plan lifecycle without using plan revision as UI state', async t => {
  const { project } = await fixture(t);
  const folder = await project('Plan view');
  const file = path.join(folder, '.harness/plans/todo-plan.md');
  const write = async plan => fs.writeFile(file, '<!-- workflow-state:begin -->\n```json\n' + JSON.stringify(plan) + '\n```\n<!-- workflow-state:end -->');
  const base = { schema_version: 1, project_id: randomUUID(), project_name: 'Plan view', plan_revision: 99,
    scope_id: 'scope-1', objective: 'Проверить отображение плана', execution_scope_status: 'ACTIVE', delivery_status: 'IN_PROGRESS', blocked_reason: null,
    current_task_id: 'T002', tasks: [
      { id: 'T001', title: 'Готовая задача', implementation_status: 'DONE', commit_status: 'DONE' },
      { id: 'T002', title: 'Текущая задача', implementation_status: 'IN_PROGRESS', commit_status: 'PENDING' },
      { id: 'T003', title: 'Следующая задача', implementation_status: 'TODO', commit_status: 'PENDING' },
    ] };
  await write(base);
  let info = await readWorkspace(folder);
  assert.deepEqual(info.planView, { state: 'working', completed: 1, total: 3, blockedReason: null, tasks: [
    { id: 'T001', title: 'Готовая задача', status: 'done' },
    { id: 'T002', title: 'Текущая задача', status: 'current' },
    { id: 'T003', title: 'Следующая задача', status: 'pending' },
  ] });
  assert.equal(info.planRevision, 99, 'revision remains available only for protocol matching');
  assert.equal(info.objective, 'Проверить отображение плана', 'scope objective is available for local session naming');

  await write({ ...base, current_task_id: null, delivery_status: 'READY_FOR_ACCEPTANCE',
    tasks: base.tasks.map(t => ({ ...t, implementation_status: 'DONE', commit_status: 'DONE' })) });
  info = await readWorkspace(folder);
  assert.equal(info.planView.state, 'awaiting-acceptance'); assert.equal(info.planView.completed, 3);

  await write({ ...base, execution_scope_status: 'BLOCKED', blocked_reason: 'Нужно решение пользователя', current_task_id: null });
  info = await readWorkspace(folder);
  assert.equal(info.planView.state, 'blocked'); assert.equal(info.planView.blockedReason, 'Нужно решение пользователя');

  await write({ ...base, scope_id: null, execution_scope_status: 'NONE', delivery_status: 'IN_PROGRESS', current_task_id: null, tasks: [], archived_scope_id: 'scope-1' });
  info = await readWorkspace(folder);
  assert.equal(info.planView.state, 'closed'); assert.equal(info.planView.total, 0);

  const { archived_scope_id, ...never } = { ...base, scope_id: null, execution_scope_status: 'NONE', delivery_status: 'IN_PROGRESS', current_task_id: null, tasks: [], archived_scope_id: 'scope-1' };
  await write(never);
  info = await readWorkspace(folder); assert.equal(info.planView.state, 'not-created');
});

test('canonical folder with spaces and Cyrillic survives restart with its conversation', async t => {
  const { root, project, store } = await fixture(t);
  const folder = await project('Мой проект');
  const link = path.join(root, 'ссылка'); await directoryLink(folder, link);
  const a = await store.select(link);
  assert.equal(a.workspace, await fs.realpath(folder));
  assert.equal(a.nextTaskId, null, 'a new session does not inherit the global legacy task');
  const chat = 'https://chatgpt.com/c/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
  await store.bindChat(a.workspace, a.sessionId, chat + '?utm_source=x#bottom');
  const next = new WorkspaceSessions(store.file); await next.load();
  const reopened = await next.select(folder);
  assert.equal(reopened.sessionId, a.sessionId);
  assert.equal(reopened.chatUrl, chat);
  if (process.platform !== 'win32') assert.equal((await fs.stat(store.file)).mode & 0o777, 0o600);
});



test('local project alias and explicit session titles persist without changing canonical workflow identity', async t => {
  const { project, store } = await fixture(t);
  const folder = await project('Canonical project');
  const first = await store.select(folder);
  assert.equal(await store.setProjectDisplayName(first.workspace, '  Мой   проект  '), true);
  assert.equal(await store.renameSession(first.workspace, first.sessionId, '  Ручное   имя  '), true);
  assert.equal(await store.setSessionTitle(first.workspace, first.sessionId, 'Заголовок страницы'), false,
    'page title cannot overwrite an explicit local title');
  await store.select(folder);
  let raw = store.snapshot().projects[0];
  assert.equal(raw.name, 'Canonical project');
  assert.equal(raw.displayName, 'Мой проект');
  assert.equal(raw.sessions[0].title, 'Ручное имя');
  assert.equal(raw.sessions[0].titleSource, 'manual');

  const restarted = new WorkspaceSessions(store.file); await restarted.load();
  raw = restarted.snapshot().projects[0];
  assert.equal(raw.name, 'Canonical project'); assert.equal(raw.displayName, 'Мой проект');
  assert.equal(raw.sessions[0].title, 'Ручное имя'); assert.equal(raw.sessions[0].titleSource, 'manual');
});

test('page titles are fallback and each scope names only the session selected on first observation', async t => {
  const { project, store } = await fixture(t);
  const first = await store.select(await project('Scope titles'));
  assert.equal(await store.setSessionTitle(first.workspace, first.sessionId, 'ChatGPT title'), true);
  assert.equal(store.selected().titleSource, 'page');
  assert.equal(await store.applyScopeTitle(first.workspace, first.sessionId,
    { scopeId: 'scope-a', objective: '  Первый   scope  ', scopeStatus: 'ACTIVE' }), true);
  assert.equal(store.selected().title, 'Первый scope'); assert.equal(store.selected().titleSource, 'scope');
  assert.equal(await store.setSessionTitle(first.workspace, first.sessionId, 'Поздний page title'), false);

  const second = await store.newSession(first.workspace, 'chat');
  assert.equal(await store.applyScopeTitle(first.workspace, second.sessionId,
    { scopeId: 'scope-a', objective: 'Первый scope', scopeStatus: 'ACTIVE' }), false,
    'the same scope must not move its title to another session');
  assert.equal(store.selected().title, '');
  assert.equal(await store.applyScopeTitle(first.workspace, second.sessionId,
    { scopeId: 'scope-b', objective: 'Второй scope', scopeStatus: 'BLOCKED' }), true);
  await store.renameSession(first.workspace, second.sessionId, 'Моё имя');
  assert.equal(await store.applyScopeTitle(first.workspace, second.sessionId,
    { scopeId: 'scope-b', objective: 'Второй scope', scopeStatus: 'ACTIVE' }), false);
  assert.equal(store.selected().title, 'Моё имя');
  assert.equal(await store.applyScopeTitle(first.workspace, second.sessionId,
    { scopeId: 'scope-c', objective: 'Третий scope', scopeStatus: 'ACTIVE' }), true,
    'a later scope may rename the current session again');
  assert.equal(store.selected().title, 'Третий scope'); assert.equal(store.selected().titleSource, 'scope');

  const restarted = new WorkspaceSessions(store.file); await restarted.load();
  assert.equal(restarted.snapshot().projects[0].sessions.find(s => s.sessionId === second.sessionId).lastNamedScopeId, 'scope-c');
  assert.equal(restarted.selected().title, 'Третий scope');
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



test('first session experience is chosen only for a newly registered project', async t => {
  const { project, store } = await fixture(t);
  const folder = await project('First Work');
  const first = await store.select(folder, { experience: 'work' });
  assert.equal(first.experience, 'work');
  const reopened = await store.select(folder, { experience: 'chat' });
  assert.equal(reopened.sessionId, first.sessionId);
  assert.equal(reopened.experience, 'work', 'reopening a known project never replaces first-session experience');
  assert.equal(store.snapshot().projects[0].sessions.length, 1);
});

test('session experience persists, migrates from v3, and rejects cross-experience URLs', async t => {
  const { project, store } = await fixture(t);
  const chat = await store.select(await project('Experiences'));
  assert.equal(chat.experience, 'chat');
  await store.bindChat(chat.workspace, chat.sessionId, 'https://chatgpt.com/c/chat-session');
  const work = await store.newSession(chat.workspace, 'work');
  assert.equal(work.experience, 'work');
  await store.bindChat(chat.workspace, work.sessionId, 'https://chatgpt.com/c/work-session');
  assert.equal(store.selected().experience, 'work');
  assert.equal(store.selected().chatUrl, 'https://chatgpt.com/c/work-session');
  await assert.rejects(store.newSession(chat.workspace, 'astra'), { code: 'SESSION_EXPERIENCE' });
  const saved = store.snapshot();
  assert.deepEqual(saved.projects[0].sessions.map(session => session.experience), ['chat', 'work']);
  const restarted = new WorkspaceSessions(store.file); await restarted.load();
  assert.equal(restarted.project(chat.workspace).experience, 'work');
  assert.equal(restarted.project(chat.workspace).chatUrl, 'https://chatgpt.com/c/work-session');

  const chatOnly = await store.select(await project('Chat only'));
  await assert.rejects(store.bindChat(chatOnly.workspace, chatOnly.sessionId, 'https://chatgpt.com/work/not-chat'), { code: 'CHAT_EXPERIENCE_MISMATCH' });

  const v3 = structuredClone(saved); v3.schemaVersion = 3;
  v3.projects[0].sessions[1].chatUrl = 'https://chatgpt.com/work/legacy-work';
  for (const session of v3.projects[0].sessions) delete session.experience;
  const original = JSON.stringify(v3); await fs.writeFile(store.file, original);
  const migrated = new WorkspaceSessions(store.file); await migrated.load();
  assert.equal(migrated.snapshot().schemaVersion, 6);
  assert.deepEqual(migrated.snapshot().projects[0].sessions.map(session => session.experience), ['chat', 'work']);
  assert.equal(await fs.readFile(store.file + '.v3-backup', 'utf8'), original);
  assert.equal(conversationExperience('https://chatgpt.com/c/aaaaaaaa'), 'chat');
  assert.equal(conversationExperience('https://chatgpt.com/work/aaaaaaaa'), 'work');
  assert.equal(conversationExperience('https://chatgpt.com/'), null);
  assert.equal(conversationUrlCompatibleWithExperience('https://chatgpt.com/c/aaaaaaaa', 'work'), true);
  assert.equal(conversationUrlCompatibleWithExperience('https://chatgpt.com/work/aaaaaaaa', 'chat'), false);
});



test('session archive switches selection, blocks the last active session, restores, and persists', async t => {
  let clock = 1000;
  const { project, root } = await fixture(t);
  const store = new WorkspaceSessions(path.join(root, 'app-data/archive-sessions.json'), { now: () => ++clock });
  const first = await store.select(await project('Session archive'));
  const second = await store.newSession(first.workspace, 'chat');
  const third = await store.newSession(first.workspace, 'work');
  await store.selectSession(first.workspace, first.sessionId);
  await store.setSessionArchived(first.workspace, first.sessionId, true);
  assert.equal(store.selected().sessionId, third.sessionId, 'most recently opened remaining session becomes selected');
  let raw = store.snapshot().projects[0];
  assert.ok(raw.sessions.find(session => session.sessionId === first.sessionId).archivedAt);
  await assert.rejects(store.selectSession(first.workspace, first.sessionId), { code: 'SESSION_ARCHIVED' });
  await store.setSessionArchived(first.workspace, first.sessionId, false);
  assert.equal(raw.sessions?.find?.(session => session.sessionId === first.sessionId)?.experience ?? 'chat', 'chat');
  await store.selectSession(first.workspace, first.sessionId);
  await store.setSessionArchived(first.workspace, second.sessionId, true);
  await store.setSessionArchived(first.workspace, third.sessionId, true);
  await assert.rejects(store.setSessionArchived(first.workspace, first.sessionId, true), { code: 'SESSION_LAST_ACTIVE' });
  const restarted = new WorkspaceSessions(store.file); await restarted.load();
  assert.equal(restarted.snapshot().schemaVersion, 6);
  assert.equal(restarted.snapshot().projects[0].sessions.filter(session => session.archivedAt === null).length, 1);
});

test('forget archived session removes local references but keeps project folder and active sessions', async t => {
  const { root, project, store } = await fixture(t);
  const first = await store.select(await project('Forget session'));
  const second = await store.newSession(first.workspace, 'work');
  await store.bindChat(first.workspace, second.sessionId, 'https://chatgpt.com/c/work-session-delete');
  await store.setSessionArchived(first.workspace, second.sessionId, true);
  const backup = store.snapshot(); backup.schemaVersion = 4;
  for (const item of backup.projects.flatMap(project => project.sessions)) delete item.archivedAt;
  await fs.writeFile(store.file + '.v4-backup', JSON.stringify(backup));
  await fs.writeFile(path.join(path.dirname(store.file), 'diagnostics.jsonl'), [
    JSON.stringify({ workspace: first.workspace, sessionId: second.sessionId, phase: 'test' }),
    JSON.stringify({ workspace: first.workspace, sessionId: first.sessionId, phase: 'keep' }),
  ].join('\n') + '\n');
  await store.forgetArchivedSessions([{ workspace: first.workspace, projectId: first.projectId, sessionId: second.sessionId }]);
  assert.equal(store.snapshot().projects[0].sessions.length, 1);
  assert.equal(store.snapshot().projects[0].sessions[0].sessionId, first.sessionId);
  assert.ok((await fs.stat(first.workspace)).isDirectory());
  const backupAfter = JSON.parse(await fs.readFile(store.file + '.v4-backup', 'utf8'));
  assert.equal(backupAfter.projects[0].sessions.some(session => session.sessionId === second.sessionId), false);
  const diagnostics = await fs.readFile(path.join(path.dirname(store.file), 'diagnostics.jsonl'), 'utf8');
  assert.equal(diagnostics.includes(second.sessionId), false); assert.equal(diagnostics.includes(first.sessionId), true);
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
  assert.equal(restored.snapshot().schemaVersion, 6);
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
  assert.equal(next.snapshot().schemaVersion, 6); assert.equal(next.selected().archivedAt, null);
  assert.deepEqual(next.snapshot().projects[0].sessions, old.projects[0].sessions.map(session => ({ ...session, experience: conversationExperience(session.chatUrl) ?? 'chat', archivedAt: null })));
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

test('forgetting several archived projects is atomic and leaves folders untouched', async t => {
  const { project, store } = await fixture(t);
  const a = await store.select(await project('Forget A'));
  const b = await store.select(await project('Forget B'));
  const c = await store.select(await project('Keep active'));
  await store.setArchived(a.workspace, true); await store.setArchived(b.workspace, true);
  const before = store.snapshot();
  await assert.rejects(store.forgetArchivedMany([
    { workspace: a.workspace, projectId: a.projectId },
    { workspace: c.workspace, projectId: c.projectId },
  ]), { code: 'PROJECT_NOT_ARCHIVED' });
  assert.deepEqual(store.snapshot(), before, 'failed batch is atomic');
  assert.equal(await store.forgetArchivedMany([
    { workspace: a.workspace, projectId: a.projectId },
    { workspace: b.workspace, projectId: b.projectId },
  ]), 2);
  assert.equal(store.project(a.workspace), null); assert.equal(store.project(b.workspace), null); assert.ok(store.project(c.workspace));
  assert.ok((await fs.stat(a.workspace)).isDirectory()); assert.ok((await fs.stat(b.workspace)).isDirectory());
});

test('retired token estimates are removed on load without changing sessions or archive state', async t => {
  const { store, project } = await fixture(t);
  const folder = await fs.realpath(await project('Counter removal'));
  await store.load();
  await store.select(folder);
  const first = store.selected();
  await store.bindChat(folder, first.sessionId, 'https://chatgpt.com/c/removed-counter-chat');
  await store.newSession(folder, 'work');
  const second = store.selected();
  await store.bindChat(folder, second.sessionId, 'https://chatgpt.com/c/removed-counter-work');
  await store.setSessionArchived(folder, first.sessionId, true);
  const expected = store.snapshot();
  const old = structuredClone(expected);
  for (const session of old.projects[0].sessions) {
    session.tokenEstimate = { obsolete: true, total: 4052533, messages: { unused: { tokens: 4052533 } } };
  }
  await fs.writeFile(store.file, JSON.stringify(old));
  const reopened = new WorkspaceSessions(store.file);
  await reopened.load();
  assert.deepEqual(reopened.snapshot(), expected);
  assert.deepEqual(JSON.parse(await fs.readFile(store.file, 'utf8')), expected);
  reopened.save = () => { throw new Error('Already clean storage must not be rewritten'); };
  await reopened.load();
  assert.deepEqual(reopened.snapshot(), expected);
});

async function changeScopePlan(folder, patch) {
  const file = path.join(folder, '.harness/plans/todo-plan.md');
  const text = await fs.readFile(file, 'utf8');
  const plan = JSON.parse(text.match(/```json\s*([\s\S]*?)```/)[1]);
  Object.assign(plan, patch);
  plan.plan_revision++;
  await fs.writeFile(file, '<!-- workflow-state:begin -->\n```json\n' + JSON.stringify(plan) + '\n```\n<!-- workflow-state:end -->');
}

test('project selection chooses newest created active session without reordering stored history or reload selection', async t => {
  const { store, project } = await fixture(t);
  let time = 100;
  store.now = () => time;
  const input = await project('Recent sessions');
  const first = await store.select(input);
  const folder = first.workspace;
  const firstUrl = 'https://chatgpt.com/c/aaaaaaaa-1111-2222-3333-eeeeeeeeeeee';
  await store.bindChat(folder, first.sessionId, firstUrl);
  time = 200;
  const second = await store.newSession(folder, 'work');
  const third = await store.newSession(folder, 'chat');
  const order = () => activeSessionsNewestFirst(store.snapshot().projects.find(p => p.workspace === folder).sessions).map(s => s.sessionId);
  assert.deepEqual(order(), [third.sessionId, second.sessionId, first.sessionId], 'equal creation times use reverse insertion order');
  time = 500;
  await store.selectSession(folder, first.sessionId);
  assert.deepEqual(order(), [third.sessionId, second.sessionId, first.sessionId], 'opening old history does not promote it');
  assert.equal((await store.select(folder)).sessionId, first.sessionId, 'service reload preserves selection');
  const newest = await store.select(folder, { latest: true });
  assert.equal(newest.sessionId, third.sessionId);
  assert.equal(store.project(folder).expanded, true);
  assert.deepEqual(store.snapshot().projects.find(p => p.workspace === folder).sessions.map(s => s.sessionId), [first.sessionId, second.sessionId, third.sessionId], 'projection does not mutate storage order');
  await store.setSessionArchived(folder, third.sessionId, true);
  assert.equal((await store.select(folder, { latest: true })).sessionId, second.sessionId, 'archive is excluded');
  await store.selectSession(folder, first.sessionId);
  const restarted = new WorkspaceSessions(store.file);
  await restarted.load();
  assert.equal((await restarted.select(folder)).sessionId, first.sessionId, 'restart preserves explicitly chosen old conversation');
  assert.equal(restarted.selected().chatUrl, firstUrl);
  assert.equal((await restarted.select(folder, { latest: true })).sessionId, second.sessionId);
  assert.deepEqual(activeSessionsNewestFirst([]), []);
});

test('v5 migration backs up evidence and never guesses when several chats received the same scope', async t => {
  const { project, store } = await fixture(t);
  const first = await store.select(await project('Evidence'));
  const second = await store.newSession(first.workspace, 'work');
  const third = await store.newSession(first.workspace, 'chat');
  const old = store.snapshot(); old.schemaVersion = 5;
  for (const session of old.projects[0].sessions) {
    delete session.planId; delete session.originSessionId; delete session.legacyPlanId; delete session.planBinding;
    session.attempt = { state: 'sent', packet: { facts: { project_id: first.projectId, scope_id: session.sessionId === first.sessionId ? 'unique' : 'ambiguous' } } };
  }
  const text = JSON.stringify(old); await fs.writeFile(store.file, text);
  const migrated = new WorkspaceSessions(store.file); await migrated.load();
  assert.equal(await fs.readFile(store.file + '.v5-backup', 'utf8'), text);
  const sessions = migrated.snapshot().projects[0].sessions;
  assert.equal(sessions[0].legacyPlanId, 'unique'); assert.equal(sessions[0].planId, null);
  assert.equal(sessions[1].legacyPlanId, null); assert.equal(sessions[2].legacyPlanId, null);
  assert.equal(sessions[1].planBinding, 'unresolved');
  assert.deepEqual(sessions.map(s => [s.sessionId,s.experience,s.chatUrl,s.title,s.archivedAt]), old.projects[0].sessions.map(s => [s.sessionId,s.experience,s.chatUrl,s.title,s.archivedAt]));
  assert.equal('planView' in JSON.parse(await fs.readFile(store.file,'utf8')).projects[0],false);
});

for (const experience of ['chat','work']) test('prepared '+experience+' session survives a failed store save and repeated creation', async t => {
  const { project, store: initial }=await fixture(t);let folder=await project('Prepared '+experience);
  const owners=new Map();let binding=null,sourceId;
  const inspect=async(w,sid)=>{const base=await readWorkspace(w);const planId=owners.get(sid)??null;return {...base,inspectedSessionId:sid,planId,scopeId:planId,
    scopeStatus:planId?'ACTIVE':'NONE',objective:planId??'NONE',originSessionId:planId==='future'?sourceId:null,
    planView:{state:planId?'working':'not-created',completed:0,total:0,tasks:[]}};};
  const planService={bind:async(_w,input)=>{binding??={session_id:'stable-continuation',experience:input.experience,plan_id:input.planId};owners.set(binding.session_id,'future');return binding;}};
  const store=new WorkspaceSessions(initial.file,{inspect,planService});const source=await store.select(folder);folder=source.workspace;sourceId=source.sessionId;
  owners.set(sourceId,'original');await store.selectSession(folder,sourceId);
  const save=store.save.bind(store);let fail=true;
  store.save=async data=>{if(fail&&data.projects[0].sessions.some(s=>s.sessionId==='stable-continuation')){fail=false;throw new Error('simulated storage interruption');}return save(data);};
  await assert.rejects(store.fromPrepared(folder,sourceId,'future',1,experience),/storage interruption/);
  assert.equal(store.snapshot().projects[0].sessions.length,1);
  const [created,repeated]=await Promise.all([store.fromPrepared(folder,sourceId,'future',1,experience),store.fromPrepared(folder,sourceId,'future',1,experience)]);
  assert.equal(created.sessionId,repeated.sessionId);assert.equal(created.experience,experience);assert.equal(created.planId,'future');
  assert.equal(store.snapshot().projects[0].sessions.length,2);assert.equal(created.originSessionId,sourceId);
  const restarted=new WorkspaceSessions(store.file,{inspect,planService});await restarted.load();
  assert.equal((await restarted.selectSession(folder,sourceId)).planId,'original');
  assert.equal((await restarted.fromPrepared(folder,sourceId,'future',1,experience)).sessionId,created.sessionId);
  const empty=await restarted.newSession(folder,experience);assert.equal(empty.planId,null);assert.equal(empty.scopeStatus,'NONE');
  assert.equal(restarted.snapshot().projects[0].scopeTransition,undefined);
  const saved=JSON.parse(await fs.readFile(store.file,'utf8'));assert.equal('planView' in saved.projects[0],false);
});

test('slow projections do not hold mutations; A-B-A selects and persists only the newest generation', async t => {
  const { project, store } = await fixture(t);
  const first = await store.select(await project('A')), second = await store.select(await project('B'));
  const a = first.workspace, b = second.workspace;
  const read = store.inspect, requests = [];
  store.inspect = (workspace, sessionId) => new Promise(resolve => requests.push({ workspace, sessionId, resolve }));
  const a1 = store.selectSession(a, first.sessionId), b1 = store.selectSession(b, second.sessionId), a2 = store.selectSession(a, first.sessionId);
  await store.setProjectDisplayName(b, 'B переименован'); // Must finish while all three reads are still pending.
  assert.equal(requests.length, 3);
  const resolve = async (i, revision) => requests[i].resolve({ ...await read(requests[i].workspace, requests[i].sessionId), planRevision: revision });
  await resolve(2, 102); await a2;
  await resolve(1, 101); assert.equal(await b1, null);
  await resolve(0, 100); assert.equal(await a1, null);
  assert.equal(store.selected().workspace, a); assert.equal(store.selected().planRevision, 102);
  assert.equal(store.selected().sessionId, first.sessionId);
  const disk = new WorkspaceSessions(store.file); await disk.load();
  assert.equal(disk.selected().workspace, a); assert.equal(disk.selected().planRevision, 102);
  assert.equal(disk.project(b).displayName, 'B переименован');
});

test('selection cancelled during an atomic save restores the previous disk snapshot', async t => {
  const { project, store } = await fixture(t);
  const a = await project('A'), b = await project('B');
  const first = await store.select(a), second = await store.select(b);
  let current = true, renamed;
  const afterRename = new Promise(resolve => { renamed = resolve; });
  let release;
  const hold = new Promise(resolve => { release = resolve; });
  const save = store.save.bind(store);
  store.save = async (...args) => { const result = await save(...args); if (args.length === 2) { renamed(); await hold; } return result; };
  const selecting = store.selectSession(a, first.sessionId, { isCurrent: () => current });
  await afterRename; current = false; release();
  assert.equal(await selecting, null);
  const disk = new WorkspaceSessions(store.file); await disk.load();
  assert.equal(store.selected().sessionId, second.sessionId); assert.equal(disk.selected().sessionId, second.sessionId);
});
