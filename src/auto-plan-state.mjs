import fs from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readWorkspace } from './workspace-session.mjs';
const execute = promisify(execFile);
// Only at activation/checkpoints/Send, never a Git polling loop.
export async function readAutoPlanState(selected, environment = process.env) {
  const { workspace, sessionId } = selected;
  const before = await readWorkspace(workspace, sessionId);
  const git = async args => (await execute(environment.WORKFLOW_GIT_BIN || 'git', ['-C', workspace, ...args],
    { env: environment, windowsHide: true, encoding: 'utf8', timeout: 10000, maxBuffer: 1024 * 1024 })).stdout.trim();
  const journal = path.resolve(workspace, await git(['rev-parse', '--git-path', 'workflow-kit/transaction.json']));
  let pending = false;
  try { await fs.access(journal); pending = true; } catch (error) { if (error.code !== 'ENOENT') throw error; }
  const dirty = await git(['status', '--porcelain', '--', '.harness/plans/todo-plan.md']);
  const after = await readWorkspace(workspace, sessionId);
  return { ...after, confirmed: !pending && (!after.planView.tasks.every(t => t.status === 'done') || !dirty) && before.planRevision === after.planRevision
    && before.scopeId === after.scopeId };
}
