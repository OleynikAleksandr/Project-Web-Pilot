import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { randomUUID } from 'node:crypto';
import { executableCandidateAllowed, nodeExecutableCandidates } from './platform.mjs';
const execute = promisify(execFile);
const fail = (code, message) => Object.assign(new Error(message), { code });

export class WorkspaceSetup {
  constructor({ resourceDir = fileURLToPath(new URL('../resources/', import.meta.url)), nodeCandidates,
    environment = process.env, platform = process.platform } = {}) {
    this.resourceDir = resourceDir;
    this.platform = platform;
    this.nodeCandidates = nodeCandidates ?? nodeExecutableCandidates({
      platform,
      environment,
      execPath: process.execPath,
      electron: Boolean(process.versions.electron),
    });
    this.environment = { ...environment, GIT_OPTIONAL_LOCKS: '0', GIT_TERMINAL_PROMPT: '0' };
    for (const key of ['GIT_DIR', 'GIT_WORK_TREE', 'GIT_INDEX_FILE', 'GIT_COMMON_DIR', 'GIT_OBJECT_DIRECTORY', 'GIT_ALTERNATE_OBJECT_DIRECTORIES', 'GIT_PREFIX', 'ELECTRON_RUN_AS_NODE']) delete this.environment[key];
    this.tickets = new Map();
  }
  async node() {
    if (this.nodeExecutable) return this.nodeExecutable;
    for (const candidate of this.nodeCandidates) {
      if (!executableCandidateAllowed(candidate, this.platform)) continue;
      try {
        const { stdout } = await execute(candidate, ['--version'], { timeout: 5000, env: this.environment });
        if (/^v(\d+)\./.test(stdout) && Number(RegExp.$1) >= 22) return this.nodeExecutable = candidate;
      } catch {}
    }
    throw fail('NODE_MISSING', 'Для подготовки проектов нужен Node.js 22 или новее. Установите его и повторите проверку.');
  }
  async call(input) {
    const node = await this.node();
    const child = execFile(node, [path.join(this.resourceDir, 'workspace-setup-worker.mjs')],
      { env: this.environment, timeout: 120000, maxBuffer: 4 * 1024 * 1024, encoding: 'utf8' });
    const result = await new Promise((resolve, reject) => {
      let stdout = '', stderr = '';
      child.stdout.on('data', chunk => { stdout += chunk; }); child.stderr.on('data', chunk => { stderr += chunk; });
      child.on('error', reject);
      child.on('close', code => {
        let data; try { data = JSON.parse(stdout); } catch { reject(fail('SETUP_FAILED', 'Проверка папки не завершилась: ' + (stderr.trim().slice(-500) || `код ${code}`))); return; }
        if (!data.ok) reject(fail(data.code ?? 'SETUP_FAILED', data.message)); else resolve(data);
      });
      child.stdin.on('error', () => {});
      child.stdin.end(JSON.stringify(input));
    });
    return result;
  }
  async preview({ mode, workspace, parent, name } = {}) {
    if (!['new', 'existing'].includes(mode)) throw fail('SETUP_MODE', 'Выберите создание или подключение проекта.');
    if (mode === 'new') {
      if (typeof name !== 'string' || !name.trim() || name !== name.trim() || name.length > 120 || /[\/\\\r\n\0]/.test(name) || ['.', '..'].includes(name) || name.startsWith('.')) throw fail('PROJECT_NAME', 'Укажите обычное имя новой папки без слешей и переносов строк.');
      if (typeof parent !== 'string' || !path.isAbsolute(parent)) throw fail('PARENT_REQUIRED', 'Выберите папку, в которой создать проект.');
      const canonicalParent = await fs.realpath(parent);
      workspace = path.join(canonicalParent, name);
    }
    if (typeof workspace !== 'string' || !path.isAbsolute(workspace)) throw fail('PROJECT_PATH', 'Выберите папку проекта.');
    const request = { action: 'inspect', mode, project: workspace, name: mode === 'new' ? name : undefined };
    const result = await this.call(request);
    const token = randomUUID();
    this.tickets.clear(); this.tickets.set(token, { request, fingerprint: result.fingerprint });
    return { ...result, token, mode };
  }
  async apply(token, { gitName, gitEmail } = {}) {
    const ticket = this.tickets.get(token);
    if (!ticket) throw fail('PREVIEW_REQUIRED', 'Сначала проверьте выбранную папку.');
    if ((gitName || gitEmail) && [gitName, gitEmail].some(v => typeof v !== 'string' || !v.trim() || /[\r\n\0]/.test(v))) throw fail('GIT_IDENTITY', 'Укажите имя и email для истории этого проекта.');
    const result = await this.call({ ...ticket.request, action: 'apply', fingerprint: ticket.fingerprint, gitName, gitEmail });
    this.tickets.delete(token);
    return result;
  }
  clear() { this.tickets.clear(); }
}
