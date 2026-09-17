import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { randomUUID } from 'node:crypto';
import { executableCandidateAllowed, nodeExecutableCandidates } from './platform.mjs';
import { WorkspaceReadiness } from './workspace-readiness.mjs';
const execute = promisify(execFile);
const fail = (code, message) => Object.assign(new Error(message), { code });

export class WorkspaceSetup {
  constructor({ resourceDir = fileURLToPath(new URL('../resources/', import.meta.url)), nodeCandidates,
    environment = process.env, platform = process.platform, executeNode = execute } = {}) {
    this.resourceDir = resourceDir;
    this.platform = platform;
    this.executeNode = executeNode;
    this.nodeCandidates = nodeCandidates ?? nodeExecutableCandidates({
      platform,
      environment,
      execPath: process.execPath,
      electron: Boolean(process.versions.electron),
    });
    this.environment = { ...environment, GIT_OPTIONAL_LOCKS: '0', GIT_TERMINAL_PROMPT: '0' };
    for (const key of ['GIT_DIR', 'GIT_WORK_TREE', 'GIT_INDEX_FILE', 'GIT_COMMON_DIR', 'GIT_OBJECT_DIRECTORY', 'GIT_ALTERNATE_OBJECT_DIRECTORIES', 'GIT_PREFIX', 'ELECTRON_RUN_AS_NODE']) delete this.environment[key];
    if (platform === 'win32') {
      // The bundled worker must not inherit Node flags/module hooks from other apps.
      for (const key of Object.keys(this.environment)) {
        if (['NODE_OPTIONS', 'NODE_PATH'].includes(key.toUpperCase())) delete this.environment[key];
      }
    }
    this.tickets = new Map();
    this.readiness = new WorkspaceReadiness({
      fingerprint: workspace => this.call({ action: 'fingerprint', mode: 'existing', project: workspace }),
      inspect: workspace => this.call({ action: 'inspect', mode: 'existing', project: workspace }),
    });
  }
  async node() {
    if (this.nodeExecutable) return this.nodeExecutable;
    const windowsIssues = [];
    for (const candidate of this.nodeCandidates) {
      if (!executableCandidateAllowed(candidate, this.platform)) continue;
      try {
        const { stdout } = await this.executeNode(candidate, ['--version'], {
          timeout: 5000, env: this.environment,
          ...(this.platform === 'win32' ? { windowsHide: true } : {}),
        });
        const version = /^v(\d+)\.\d+\.\d+/.exec(stdout);
        if (version && Number(version[1]) >= 22) return this.nodeExecutable = candidate;
        if (this.platform === 'win32') windowsIssues.push({
          candidate, code: version ? 'NODE_TOO_OLD' : 'INVALID_VERSION_OUTPUT', version: version?.[0],
        });
      } catch (error) {
        if (this.platform === 'win32' && error.code !== 'ENOENT') windowsIssues.push({
          candidate, code: error.killed ? 'TIMEOUT' : String(error.code ?? 'START_FAILED'),
        });
      }
    }
    if (this.platform === 'win32') {
      const issue = windowsIssues.find(item => item.code !== 'NODE_TOO_OLD') ?? windowsIssues[0];
      if (issue?.code === 'NODE_TOO_OLD') throw fail('NODE_TOO_OLD',
        'Найден Node.js ' + issue.version + ', нужен 22 или новее. Распакуйте всю папку актуальной Windows-версии приложения.');
      if (issue) throw fail('NODE_START_FAILED',
        'Не удалось запустить Node.js: ' + issue.candidate + ' (' + issue.code + '). Проверьте доступ к файлу и повторите проверку.');
      throw fail('NODE_MISSING',
        'Node.js не найден. Распакуйте всю папку Windows-версии приложения, включая resources, и повторите проверку.');
    }
    throw fail('NODE_MISSING', 'Для подготовки проектов нужен Node.js 22 или новее. Установите его и повторите проверку.');
  }
  async call(input) {
    const node = await this.node();
    const child = execFile(node, [path.join(this.resourceDir, 'workspace-setup-worker.mjs')],
      { env: this.environment, timeout: 120000, maxBuffer: 4 * 1024 * 1024, encoding: 'utf8',
        ...(this.platform === 'win32' ? { windowsHide: true } : {}) });
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
    this.readiness.clear(workspace);
    const request = { action: 'inspect', mode, project: workspace, name: mode === 'new' ? name : undefined };
    const result = await this.call(request);
    const token = randomUUID();
    this.tickets.clear(); this.tickets.set(token, { request, fingerprint: result.fingerprint });
    return { ...result, token, mode };
  }
  async apply(token, { gitName, gitEmail } = {}) {
    const ticket = this.tickets.get(token);
    if (!ticket) throw fail('PREVIEW_REQUIRED', 'Сначала проверьте выбранную папку.');
    this.readiness.clear(ticket.request.project);
    if ((gitName || gitEmail) && [gitName, gitEmail].some(v => typeof v !== 'string' || !v.trim() || /[\r\n\0]/.test(v))) throw fail('GIT_IDENTITY', 'Укажите имя и email для истории этого проекта.');
    const result = await this.call({ ...ticket.request, action: 'apply', fingerprint: ticket.fingerprint, gitName, gitEmail });
    this.tickets.delete(token);
    return result;
  }
  clear() { this.tickets.clear(); }
  async ready(workspace) {
    if (typeof workspace !== 'string' || !path.isAbsolute(workspace)) throw fail('PROJECT_PATH', 'Выберите папку проекта.');
    return this.readiness.check(await fs.realpath(workspace));
  }
  invalidateReadiness(workspace = null) { this.readiness.clear(workspace); }
}
