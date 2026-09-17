const fail = (code, message) => Object.assign(new Error(message), { code });
const copy = value => structuredClone(value);

// One active worker operation and one latest queued workspace. Readiness is
// separate from addressed recovery; cache entries never authorize context Send.
export class WorkspaceReadiness {
  constructor({ fingerprint, inspect, maxEntries = 4 }) {
    Object.assign(this, { fingerprint, inspect, maxEntries });
    this.cache = new Map(); this.active = null; this.pending = null;
  }
  check(workspace) {
    for (const job of [this.active, this.pending]) {
      if (job?.workspace === workspace && !job.invalidated) return job.promise.then(copy);
    }
    const job = { workspace, invalidated: false };
    job.promise = new Promise((resolve, reject) => Object.assign(job, { resolve, reject }));
    if (this.active) {
      this.pending?.reject(fail('READINESS_SUPERSEDED', 'Выбран другой проект.'));
      this.pending = job;
    } else { this.active = job; void this.run(job); }
    return job.promise.then(copy);
  }
  clear(workspace = null) {
    if (workspace) this.cache.delete(workspace); else this.cache.clear();
    if (this.active && (!workspace || this.active.workspace === workspace)) this.active.invalidated = true;
    if (this.pending && (!workspace || this.pending.workspace === workspace)) {
      this.pending.reject(fail('READINESS_CHANGED', 'Проверка проекта отменена.'));
      this.pending = null;
    }
  }
  assertCurrent(job) {
    if (job.invalidated) throw fail('READINESS_CHANGED', 'Состояние проекта изменилось. Повторите проверку.');
  }
  async run(job) {
    const workspace = job.workspace;
    try {
      for (let attempt = 0; attempt < 2; attempt++) {
        this.assertCurrent(job);
        const before = await this.fingerprint(workspace);
        this.assertCurrent(job);
        if (before.transaction) throw fail('READINESS_BUSY', 'Ожидается завершение транзакции проекта. Повторите проверку.');
        const cached = this.cache.get(workspace);
        if (cached?.key === before.key) {
          this.cache.delete(workspace); this.cache.set(workspace, cached);
          job.resolve(cached.result); return;
        }
        this.cache.delete(workspace);
        const result = await this.inspect(workspace);
        const after = await this.fingerprint(workspace);
        this.assertCurrent(job);
        if (before.key !== after.key || after.transaction || (result.inputKey && result.inputKey !== after.key)) continue;
        if (result.ready) {
          this.cache.set(workspace, { key: after.key, result: copy(result) });
          while (this.cache.size > this.maxEntries) this.cache.delete(this.cache.keys().next().value);
        }
        job.resolve(result); return;
      }
      throw fail('READINESS_CHANGED', 'Проект меняется во время проверки. Повторите проверку.');
    } catch (error) { this.cache.delete(workspace); job.reject(error); }
    finally {
      this.active = this.pending; this.pending = null;
      if (this.active) void this.run(this.active);
    }
  }
}
