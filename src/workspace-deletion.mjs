import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { createHash, randomUUID } from 'node:crypto';
import { readWorkspace, WorkspaceError } from './workspace-session.mjs';
import { diagnosticFiles, queueDiagnosticFile } from './common.mjs';
import { purgeProjectStateFiles } from './project-state-cleanup.mjs';

const fail = (code, message) => { throw new WorkspaceError(code, message); };
const within = (child, parent) => child === parent || child.startsWith(parent + path.sep);
const lstatOrNull = async file => { try { return await fs.lstat(file, { bigint: true }); } catch (e) { if (e.code === 'ENOENT') return null; throw e; } };
const identity = stat => ({ dev: String(stat.dev), ino: String(stat.ino) });
const same = (stat, expected) => stat?.isDirectory() && !stat.isSymbolicLink() && String(stat.dev) === expected.dev && String(stat.ino) === expected.ino;

export class WorkspaceDeletion {
  constructor({ store, journalDir, protectedPaths = [], home = os.homedir(), prepare=async()=>{}, cleanup=async()=>{}, purgeState=purgeProjectStateFiles }) {
    Object.assign(this, { store, journalDir, protectedPaths, home, prepare, cleanup, purgeState });
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
    const stat = await lstatOrNull(workspace);
    if (stat && (!stat.isDirectory() || stat.isSymbolicLink() || await fs.realpath(workspace) !== workspace))
      fail('DELETE_PATH_CHANGED', 'Путь больше не указывает на исходную папку проекта.');
    return stat;
  }
  async related(project) {
    const records=this.store.snapshot().projects.filter(p=>p.parentWorkspace===project.workspace);
    const assignments=path.join(project.workspace,'.git/workflow-kit/assignments');
    const candidates=new Map(records.map(p=>[p.workspace,{workspace:p.workspace,id:p.sessions[0]?.assignmentId,projectId:p.projectId,sessionIds:p.sessions.map(s=>s.sessionId)}]));
    for(const name of await fs.readdir(assignments).catch(e=>{if(e.code==='ENOENT'||e.code==='ENOTDIR')return [];throw e;})) {
      if(!/^[A-Za-z0-9_-]+\.json$/.test(name))continue;
      const a=JSON.parse(await fs.readFile(path.join(assignments,name),'utf8'));
      if(a.parent_root!==project.workspace)continue;
      if(!candidates.has(a.worktree))candidates.set(a.worktree,{workspace:a.worktree,id:a.id,sessionIds:[]});
    }
    const result=[];
    for(const item of candidates.values()) {
      const stat=await lstatOrNull(item.workspace);
      if(stat) {
        const expected=path.join(path.dirname(project.workspace),'.web-pilot-worktrees',createHash('sha256').update(project.workspace).digest('hex').slice(0,16),item.id??'');
        if(!/^[A-Za-z0-9][A-Za-z0-9_-]{0,79}$/.test(item.id??'')||item.workspace!==expected||!stat.isDirectory()||stat.isSymbolicLink()||await fs.realpath(item.workspace)!==item.workspace)
          fail('DELETE_WORKTREE_CHANGED','Путь исполнителя не подтверждён. Удаление остановлено.');
        const gitFile=await fs.readFile(path.join(item.workspace,'.git'),'utf8');
        const pointer=gitFile.trim().replace(/^gitdir: /,'');
        if(!gitFile.startsWith('gitdir: ')||!within(pointer,path.join(project.workspace,'.git/worktrees')))
          fail('DELETE_WORKTREE_CHANGED','Git исполнителя принадлежит другому проекту.');
        const binding=JSON.parse(await fs.readFile(path.join(pointer,'workflow-kit/assignment.json'),'utf8'));
        if(binding.id!==item.id||binding.parent_root!==project.workspace||binding.worktree!==item.workspace)
          fail('DELETE_WORKTREE_CHANGED','Назначение исполнителя не соответствует удаляемому проекту.');
        item.identity=identity(stat);
      }
      result.push(item);
    }
    return result;
  }
  async inspect(workspace) {
    const project = this.record(workspace);
    const stat = await this.guard(workspace);
    const related=await this.related(project),sessionIds=project.sessions.map(s=>s.sessionId);
    if (!stat) return { workspace, projectId: project.projectId, name: project.name, sessionCount: project.sessions.length, missing: true, bytes: 0, files: 0, fingerprint: 'missing', identity: null, related, sessionIds };
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
    return { workspace, projectId: project.projectId, name: project.name, sessionCount: project.sessions.length, missing: false, bytes, files, fingerprint: hash.digest('hex'), identity: identity(stat), related, sessionIds };
  }
  async preview(workspace) {
    if (this.isPending(workspace)) fail('DELETE_PENDING', 'Завершите ранее подтверждённое удаление кнопкой «Повторить очистку».');
    const details = await this.inspect(workspace), token = randomUUID();
    this.clear(); this.tickets.set(token, details);
    const { fingerprint, identity: ignored, related: ignoredRelated, sessionIds: ignoredSessions, ...visible } = details;
    return { ...visible, token };
  }
  async apply(token, confirmation) {
    const expected = this.tickets.get(token);
    if (!expected) fail('DELETE_PREVIEW_EXPIRED', 'Откройте подтверждение удаления заново.');
    if (confirmation !== expected.name) fail('DELETE_CONFIRMATION', 'Введите точное имя проекта для подтверждения.');
    this.clear();
    const current = await this.inspect(expected.workspace);
    if (current.projectId !== expected.projectId || current.fingerprint !== expected.fingerprint || current.sessionCount !== expected.sessionCount || JSON.stringify(current.related)!==JSON.stringify(expected.related))
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
    // Every migration copy the store can create (v1–v5) may hold the project's URLs and attempts.
    for (const version of [1, 2, 3, 4, 5]) {
      const file = this.store.file + `.v${version}-backup`;
      if (!await lstatOrNull(file)) continue;
      const data = JSON.parse(await fs.readFile(file, 'utf8'));
      if (!Array.isArray(data.projects)) throw new Error('Не удалось очистить старую локальную копию списка проектов.');
      data.projects = data.projects.filter(p => p.workspace !== workspace);
      if (data.selectedWorkspace === workspace) data.selectedWorkspace = null;
      await fs.writeFile(file + '.tmp', JSON.stringify(data, null, 2) + '\n', { mode: 0o600 }); await fs.rename(file + '.tmp', file);
    }
    const diagnostics=path.join(path.dirname(this.store.file),'diagnostics.jsonl');
    await queueDiagnosticFile(diagnostics,async()=>{
    for (const file of diagnosticFiles(diagnostics)) {
      if (!await lstatOrNull(file)) continue;
      const lines = (await fs.readFile(file, 'utf8')).split('\n').filter(Boolean).filter(line => JSON.parse(line).workspace !== workspace);
      await fs.writeFile(file + '.tmp', lines.length ? lines.join('\n') + '\n' : '', { mode: 0o600 }); await fs.rename(file + '.tmp', file);
    }
    });
  }
  async finish(job) {
    const record = this.store.project(job.workspace);
    if (record && (!record.archivedAt || record.projectId !== job.projectId)) fail('DELETE_RECORD_CHANGED', 'Запись проекта изменилась. Автоматическая очистка остановлена.');
    await this.prepare(job);
    await this.guard(job.workspace);
    let quarantined = await lstatOrNull(job.quarantine);
    if (quarantined && !same(quarantined, job.identity)) fail('DELETE_PATH_CHANGED', 'Папка удаления была заменена. Очистка остановлена.');
    if (!quarantined && job.stage === 'confirmed' && !job.missing) {
      const original = await lstatOrNull(job.workspace);
      if (!same(original, job.identity)) fail('DELETE_PATH_CHANGED', 'Исходная папка изменилась. Очистка остановлена.');
      const latest = await this.inspect(job.workspace);
      if (latest.fingerprint !== job.fingerprint) fail('DELETE_PREVIEW_CHANGED', 'Папка изменилась до удаления. Очистка остановлена.');
      await fs.rename(job.workspace, job.quarantine);
      quarantined = await lstatOrNull(job.quarantine);
      if (!same(quarantined, job.identity)) fail('DELETE_PATH_CHANGED', 'Папка изменилась во время удаления. Очистка остановлена.');
    }
    // After this durable stage, recovery only touches the renamed directory; a replacement at the old path is preserved.
    job.stage = 'removing'; await this.saveJob(job);
    if (quarantined) await fs.rm(job.quarantine, { recursive: true });
    for(const item of job.related??[]) {
      const expected=path.join(path.dirname(job.workspace),'.web-pilot-worktrees',createHash('sha256').update(job.workspace).digest('hex').slice(0,16),item.id??'');
      if(!/^[A-Za-z0-9][A-Za-z0-9_-]{0,79}$/.test(item.id??'')||item.workspace!==expected)fail('DELETE_WORKTREE_CHANGED','Путь в журнале удаления не подтверждён.');
      const stat=await lstatOrNull(item.workspace);
      if(stat) {
        if(!item.identity||!same(stat,item.identity)||await fs.realpath(item.workspace)!==item.workspace)
          fail('DELETE_WORKTREE_CHANGED','Папка исполнителя была заменена. Очистка остановлена.');
        await fs.rm(item.workspace,{recursive:true});
      }
    }
    const group=path.join(path.dirname(job.workspace),'.web-pilot-worktrees',createHash('sha256').update(job.workspace).digest('hex').slice(0,16));
    await fs.rmdir(group).catch(e=>{if(!['ENOENT','ENOTEMPTY','EEXIST'].includes(e.code))throw e;});
    const identities=[{workspace:job.workspace,projectId:job.projectId,sessionIds:job.sessionIds??[]},...(job.related??[])];
    await this.cleanup(job);
    await this.purgeState(path.dirname(this.store.file),identities);
    for(const item of identities)await this.purgeCopies(item.workspace);
    await this.store.removeTemporaries();
    await this.store.forgetDeletedProject(job.workspace, job.projectId);
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
