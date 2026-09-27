import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { randomUUID } from 'node:crypto';
import { WorkspaceSetup } from './workspace-setup.mjs';
const execute = promisify(execFile);
const fail = (code, message) => Object.assign(new Error(message), { code });

// Use the trusted bundled facade for data-only projection before workspace readiness.
// Installed workspace code is executed only by the strict command path.
let projectionFacade;
async function trustedProjection() {
  const packaged = process.resourcesPath && path.join(process.resourcesPath, 'resources/workflow-kit/lib/session-plans.mjs');
  if (packaged) {
    try { await fs.access(packaged); return import(pathToFileURL(packaged).href); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
  return import('@webpilot/workflow-kit/lib/session-plans');
}
export async function readSessionPlans(workspace, sessionId) {
  const file = path.join(workspace, '.harness/kit/lib/session-plans.mjs');
  try { await fs.access(file); } catch (error) { if (error.code === 'ENOENT') return null; throw error; }
  const facade = await (projectionFacade ??= trustedProjection().catch(error => { projectionFacade = null; throw error; }));
  return facade.sessionPlanView(workspace, sessionId);
}
export class SessionPlans {
  constructor({ setup = new WorkspaceSetup(), run = execute } = {}) { Object.assign(this, { setup, run }); }
  async call(workspace, command, args = [], input = null) {
    if (!path.isAbsolute(workspace)) throw fail('WORKSPACE_REQUIRED', 'Нужна абсолютная папка проекта.');
    const node = await this.setup.node();
    let inputFile;
    try {
      if (input) {
        const directory = path.join(workspace, '.harness/runtime/session-plans');
        await fs.mkdir(directory, { recursive: true });
        inputFile = path.join(directory, randomUUID() + '.json');
        await fs.writeFile(inputFile, JSON.stringify(input), { mode: 0o600, flag: 'wx' });
        args = [...args, '--input', inputFile];
      }
      let stdout;
      try { ({ stdout } = await this.run(node, [path.join(workspace, 'scripts/workflow.mjs'), command, ...args],
        { cwd: workspace, env: this.setup.environment, timeout: 120000, maxBuffer: 4 * 1024 * 1024, windowsHide: true, encoding: 'utf8' })); }
      catch (error) { if (!error.stdout) throw error; stdout = error.stdout; }
      let result;
      try { result = JSON.parse(stdout); } catch { throw fail('PLAN_COMMAND_FAILED', 'Workflow Kit вернул неполный ответ.'); }
      if (!result.ok) throw fail(result.code ?? 'PLAN_COMMAND_FAILED', result.message ?? 'Команда плана не выполнена.');
      return result;
    } finally { if (inputFile) await fs.unlink(inputFile).catch(() => {}); }
  }
  async loadContext(workspace) {
    try {
      return await this.call(workspace, 'recover', ['--format', 'packet']);
    } catch (error) {
      if (error.code !== 'SESSION_REQUIRED') throw error;
      const text = await fs.readFile(path.join(workspace, '.harness/plans/todo-plan.md'), 'utf8');
      const raw = text.match(/<!-- workflow-state:begin -->\s*```json\s*([\s\S]*?)```/)?.[1];
      let plan;
      try { plan = JSON.parse(raw ?? ''); } catch { throw fail('WORKFLOW_PLAN_INVALID', 'Не удалось прочитать current plan для совместимости со старым Workflow Kit.'); }
      const sessionId = plan.owner_session_id ?? null;
      if (!sessionId) throw error;
      return this.call(workspace, 'recover', ['--session', sessionId, ...(plan.scope_id ? ['--plan', plan.scope_id] : []), '--format', 'packet']);
    }
  }

}