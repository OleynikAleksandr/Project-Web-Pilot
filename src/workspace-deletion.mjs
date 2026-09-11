import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { createHash, randomUUID } from 'node:crypto';
import { readWorkspace, WorkspaceError } from './workspace-session.mjs';

const fail = (code, message) => { throw new WorkspaceError(code, message); };
const within = (child, parent) => child === parent || child.startsWith(parent + path.sep);
const exists = async file => { try { return await fs.lstat(file, { bigint: true }); } catch (e) { if (e.code === 'ENOENT') return null; throw e; } };
const identity = stat => ({ dev: String(stat.dev), ino: String(stat.ino) });
const same = (stat, expected) => stat?.isDirectory() && !stat.isSymbolicLink() && String(stat.dev) === expected.dev && String(stat.ino) === expected.ino;

export class WorkspaceDeletion {
  constructor({ store, journalDir, protectedPaths = [], home = os.homedir() }) {
    Object.assign(this, { store, journalDir, protectedPaths, home });
    this.tickets = new Map(); this.pending = new Set();
  }
  clear() { this.tickets.clear(); }
  isPending(workspace) { return this.pending.has(workspace); }
  record(workspace, projectId) {
    const project = this.store.snapshot().projects.find(p => p.workspace === workspace);
    if (!project?.archivedAt) fail('PROJECT_NOT_ARCHIVED', 'Удалить можно только проект из архива.');
    if (projectId && project.projectId !== projectId) fail('PROJECT_REPLACED', 'Запись проекта изменилась. Повторите проверку.');
    return project;
  }
  async guard(workspace) {
    if (!path.isAbsolute(workspace) || path.normalize(workspace) !== workspace || workspace === path.parse(workspace).root)
      fail('DELETE_PROTECTED', 'Эту папку нельзя удалить через Web Pilot.');
    const canonical = async value => fs.realpath(value).catch(() => path.resolve(value));
    const home = await canonical(this.home);
    if (within(home, workspace)) fail('DELETE_PROTECTED', 'Домашнюю папку нельзя удалить через Web Pilot.');
    for (const input of [this.journalDir, path.dirname(this.store.file), ...this.protectedPaths]) {
      const protectedPath = await canonical(input);
      if (within(protectedPath, workspace) || within(workspace, protectedPath)) fail('DELETE_PROTECTED', 'Папка используется приложением или локальными инструментами.');
    }
    for (const other of this.store.snapshot().projects) {
      if (other.workspace !== workspace && (within(other.workspace, workspace) || within(workspace, other.workspace)))
        fail('DELETE_NESTED_PROJECT', 'Вложенные проекты пересекаются с этой папкой. Сначала разберите их отдельно.');
    }
    const stat = await exists(workspace);
    if (stat && (!stat.isDirectory() || stat.isSymbolicLink() || await fs.realpath(workspace) !== workspace))
      fail('DELETE_PATH_CHANGED', 'Путь больше не указывает на исходную папку проекта.');
    return stat;
  }
  async inspect(workspace) {
    const project = this.record(workspace);
    const stat = await this.guard(workspace);
    if (!stat) return { workspace, projectId: project.projectId, name: project.name, sessionCount: project.sessions.length, missing: true, bytes: 0, files: 0, fingerprint: 'missing', identity: null };
    const info = await readWorkspace(workspace);
    if (info.projectId !== project.projectId) fail('PROJECT_REPLACED', 'В этой папке теперь другой проект. Удаление остановлено.');
    const hash = createHash('sha256'); let bytes = 0, files = 0;
    const visit = async (file, relative) => {
      const item = await fs.lstat(file, { bigint: true });
      if (item.dev !== stat.dev) fail('DELETE_MOUNTED_FOLDER', 'Внутри проекта подключён другой диск. Сначала отключите его.');
      hash.update(JSON.stringify([relative, String(item.ino), String(item.mode), String(item.size), String(item.mtimeNs), String(item.ctimeNs)]));
      if (item.isDirectory()) for (const name of (await fs.readdir(file)).sort()) await visit(path.join(file, name), path.join(relative, name));
      else { files++; bytes += Number(item.size); }
    };
    await visit(workspace, '');
    return { workspace, projectId: project.projectId, name: project.name, sessionCount: project.sessions.length, missing: false, bytes, files, fingerprint: hash.digest('hex'), identity: identity(stat) };
  }
  async preview(workspace) {
    if (this.isPending(workspace)) fail('DELETE_PENDING', 'Завершите ранее подтверждённое удаление кнопкой «Повторить очистку».');
    const details = await this.inspect(workspace), token = randomUUID();
    this.clear(); this.tickets.set(token, details);
    const { fingerprint, identity: ignored, ...visible } = details;
    return { ...visible, token };
  }
  async apply(token, confirmation) {
    const expected = this.tickets.get(token);
    if (!expected) fail('DELETE_PREVIEW_EXPIRED', 'Откройте подтверждение удаления заново.');
    if (confirmation !== expected.name) fail('DELETE_CONFIRMATION', 'Введите точное имя проекта для подтверждения.');
    this.clear();
    const current = await this.inspect(expected.workspace);
    if (current.projectId !== expected.projectId || current.fingerprint !== expected.fingerprint || current.sessionCount !== expected.sessionCount)
      fail('DELETE_PREVIEW_CHANGED', 'Проект изменился после проверки. Откройте подтверждение заново.');
    const id = randomUUID();
    const job = { ...expected, id, quarantine: path.join(path.dirname(expected.workspace), '.web-pilot-delete-' + id), stage: 'confirmed' };
    await fs.mkdir(this.journalDir, { recursive: true, mode: 0o700 });
    await fs.writeFile(this.jobFile(job), JSON.stringify(job), { mode: 0o600, flag: 'wx' });
    this.pending.add(job.workspace);
    await this.finish(job);
  }
  jobFile(job) { return path.join(this.journalDir, job.id + '.json'); }
  async saveJob(job) {
    const temporary = this.jobFile(job) + '.tmp';
    await fs.writeFile(temporary, JSON.stringify(job), { mode: 0o600 }); await fs.rename(temporary, this.jobFile(job));
  }
  async purgeCopies(workspace) {
    for (const version of [1, 2]) {
      const file = this.store.file + `.v${version}-backup`;
      if (!await exists(file)) continue;
      const data = JSON.parse(await fs.readFile(file, 'utf8'));
      if (!Array.isArray(data.projects)) throw new Error('Не удалось очистить старую локальную копию списка проектов.');
      data.projects = data.projects.filter(p => p.workspace !== workspace);
      if (data.selectedWorkspace === workspace) data.selectedWorkspace = null;
      await fs.writeFile(file + '.tmp', JSON.stringify(data, null, 2) + '\n', { mode: 0o600 }); await fs.rename(file + '.tmp', file);
    }
    const file = path.join(path.dirname(this.store.file), 'diagnostics.jsonl');
    if (await exists(file)) {
      const lines = (await fs.readFile(file, 'utf8')).split('\n').filter(Boolean).filter(line => JSON.parse(line).workspace !== workspace);
      await fs.writeFile(file + '.tmp', lines.length ? lines.join('\n') + '\n' : '', { mode: 0o600 }); await fs.rename(file + '.tmp', file);
    }
  }
  async finish(job) {
    const record = this.store.project(job.workspace);
    if (record && (!record.archivedAt || record.projectId !== job.projectId)) fail('DELETE_RECORD_CHANGED', 'Запись проекта изменилась. Автоматическая очистка остановлена.');
    await this.guard(job.workspace);
    let quarantined = await exists(job.quarantine);
    if (quarantined && !same(quarantined, job.identity)) fail('DELETE_PATH_CHANGED', 'Папка удаления была заменена. Очистка остановлена.');
    if (!quarantined && job.stage === 'confirmed' && !job.missing) {
      const original = await exists(job.workspace);
      if (!same(original, job.identity)) fail('DELETE_PATH_CHANGED', 'Исходная папка изменилась. Очистка остановлена.');
      const latest = await this.inspect(job.workspace);
      if (latest.fingerprint !== job.fingerprint) fail('DELETE_PREVIEW_CHANGED', 'Папка изменилась до удаления. Очистка остановлена.');
      await fs.rename(job.workspace, job.quarantine);
      quarantined = await exists(job.quarantine);
      if (!same(quarantined, job.identity)) fail('DELETE_PATH_CHANGED', 'Папка изменилась во время удаления. Очистка остановлена.');
    }
    // After this durable stage, recovery only touches the renamed directory; a replacement at the old path is preserved.
    job.stage = 'removing'; await this.saveJob(job);
    if (quarantined) await fs.rm(job.quarantine, { recursive: true });
    await this.purgeCopies(job.workspace);
    await this.store.forgetArchived(job.workspace, job.projectId);
    await fs.unlink(this.jobFile(job)); this.pending.delete(job.workspace);
  }
  async recover() {
    const errors = [];
    for (const name of await fs.readdir(this.journalDir).catch(e => { if (e.code === 'ENOENT') return []; throw e; })) {
      if (!/^[0-9a-f-]{36}\.json$/.test(name)) continue;
      let job;
      try {
        job = JSON.parse(await fs.readFile(path.join(this.journalDir, name), 'utf8'));
        if (name !== job.id + '.json' || !path.isAbsolute(job.workspace) || job.quarantine !== path.join(path.dirname(job.workspace), '.web-pilot-delete-' + job.id)
            || !['confirmed', 'removing'].includes(job.stage) || (!job.missing && (!job.identity?.dev || !job.identity?.ino))) throw new Error('Неверный журнал удаления.');
        this.pending.add(job.workspace); await this.finish(job);
      } catch (error) { errors.push({ workspace: job?.workspace, message: String(error.message), code: error.code ?? 'DELETE_RECOVERY_FAILED' }); }
    }
    return errors;
  }
}
