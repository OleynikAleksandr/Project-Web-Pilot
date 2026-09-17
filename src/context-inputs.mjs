import fs from 'node:fs/promises';
import path from 'node:path';
import { execFile as callback } from 'node:child_process';
import { promisify } from 'node:util';
import { createHash } from 'node:crypto';
import { readSessionPlans } from './session-plans.mjs';

const execFile = promisify(callback);
const digest = data => createHash('sha256').update(data).digest('hex');
const absent = error => error.code === 'ENOENT' || error.code === 'ENOTDIR';
export const inputError = message => Object.assign(new Error(message), { code: 'CONTEXT_INPUTS_UNAVAILABLE' });

async function fileState(file) {
  try {
    const stat = await fs.lstat(file);
    if (!stat.isFile() || stat.size > 16 * 1024 * 1024) throw inputError('Unsupported recovery input');
    return [stat.mode & 0o777, await fs.realpath(file), digest(await fs.readFile(file))];
  } catch (error) { if (absent(error)) return null; throw error; }
}
async function treeFiles(root, prefix) {
  const result = [];
  async function walk(relative) {
    let entries;
    try { entries = await fs.readdir(path.join(root, relative), { withFileTypes: true }); }
    catch (error) { if (absent(error)) return; throw error; }
    for (const entry of entries) {
      const child = path.join(relative, entry.name);
      if (entry.isDirectory()) await walk(child);
      else result.push(child);
      if (result.length > 2000) throw inputError('Recovery input tree too large');
    }
  }
  await walk(prefix);
  return result;
}
function safeInput(root, relative) {
  if (typeof relative !== 'string' || !relative || path.isAbsolute(relative)
      || relative.split(/[\\/]/).includes('..')) throw inputError('Invalid recovery input path');
  return path.join(root, relative);
}
export async function contextInputKey(workspace, selection = {}) {
  const root = await fs.realpath(workspace);
  if (root !== workspace) throw inputError('Workspace must be canonical');
  let executable = process.platform === 'win32' ? 'git.exe' : 'git';
  if (process.platform === 'win32') {
    for (let current = root; ; current = path.dirname(current)) {
      const candidate = path.join(current, '.harness/runtime/git/cmd/git.exe');
      try { await fs.access(candidate); executable = candidate; break; } catch {}
      if (path.dirname(current) === current) {
        if (process.env.WORKFLOW_GIT_BIN) executable = process.env.WORKFLOW_GIT_BIN;
        break;
      }
    }
  }
  const env = { ...process.env, GIT_OPTIONAL_LOCKS: '0', GIT_TERMINAL_PROMPT: '0', LC_ALL: 'C.UTF-8' };
  for (const name of ['GIT_DIR','GIT_WORK_TREE','GIT_INDEX_FILE','GIT_COMMON_DIR','GIT_OBJECT_DIRECTORY','GIT_ALTERNATE_OBJECT_DIRECTORIES','GIT_PREFIX']) delete env[name];
  const git = async args => (await execFile(executable, ['--literal-pathspecs', '-c', 'core.quotePath=false', ...args],
    { cwd: root, env, windowsHide: true, timeout: 10000, maxBuffer: 8 * 1024 * 1024 })).stdout;
  const [locations, status, replacements, index] = await Promise.all([
    git(['rev-parse', '--path-format=absolute', '--git-dir', '--git-common-dir', 'HEAD']),
    git(['status', '--porcelain=v1', '-z', '--untracked-files=all', '--ignore-submodules=none']),
    git(['for-each-ref', '--format=%(refname):%(objectname)', 'refs/replace']),
    git(['ls-files', '--stage', '-z']),
  ]);
  const [gitDir, commonDir, head] = locations.trim().split('\n');
  if (!gitDir || !commonDir || !/^[a-f0-9]{40,64}$/.test(head)) throw inputError('Git snapshot unavailable');
  const planText = await fs.readFile(path.join(root, '.harness/plans/todo-plan.md'), 'utf8');
  const block = planText.match(/<!-- workflow-state:begin -->\s*```json\s*([\s\S]*?)```/);
  let plan = JSON.parse(block?.[1] ?? '');
  let selectedPlanPath = '.harness/plans/todo-plan.md';
  if (selection.sessionId) {
    const view = await readSessionPlans(root, selection.sessionId);
    if (!view || view.plan_id !== (selection.planId ?? null)) throw inputError('Session plan changed');
    plan = view.plan; selectedPlanPath = view.plan_path;
  }
  if (plan.schema_version !== 1 || !Array.isArray(plan.tasks) || !Array.isArray(plan.context_pack?.documents)) throw inputError('Unsupported recovery plan');
  const config = JSON.parse(await fs.readFile(path.join(root, '.harness/workflow.json'), 'utf8'));
  const relative = new Set(['.harness/plans/todo-plan.md', '.harness/workflow.json', '.harness/kit/WORKFLOW.md',
    'scripts/workflow', 'scripts/workflow.cmd', 'scripts/workflow.mjs', config.documentation?.index]);
  if (selectedPlanPath) relative.add(selectedPlanPath);
  if (selection.sessionId) for (const file of await treeFiles(root, '.harness/plans/by-id')) relative.add(file);
  for (const doc of plan.context_pack.documents) relative.add(doc.path);
  for (const task of plan.tasks) {
    for (const file of [...task.functional_paths, ...task.documentation_paths]) relative.add(file);
    for (const doc of task.context_pack?.documents ?? []) relative.add(doc.path);
  }
  for (const file of await treeFiles(root, '.harness/kit')) relative.add(file);
  const records = status.split('\0').filter(Boolean);
  for (let i = 0; i < records.length; i++) {
    relative.add(records[i].slice(3));
    if (/^[RC]|^.[RC]/.test(records[i])) relative.add(records[++i]);
  }
  for (const file of [...relative]) {
    safeInput(root, file);
    for (let directory = path.dirname(file); ; directory = path.dirname(directory)) {
      relative.add(path.join(directory, '.gitattributes'));
      relative.add(path.join(directory, '.gitignore'));
      if (directory === '.') break;
    }
  }
  const files = [...relative].sort().map(name => safeInput(root, name));
  // Worktree-local index/journal and common Git metadata both matter in linked worktrees.
  files.push(...['HEAD', 'workflow-kit/transaction.json', 'workflow-kit/last-verification.json',
    'MERGE_HEAD', 'CHERRY_PICK_HEAD', 'REVERT_HEAD'].map(name => path.join(gitDir, name)));
  files.push(...['config', 'shallow', 'info/grafts', 'info/attributes', 'info/exclude', 'objects/info/alternates'].map(name => path.join(commonDir, name)));
  for (const directory of ['rebase-merge', 'rebase-apply']) {
    try { await fs.access(path.join(gitDir, directory)); throw inputError('Git operation active'); }
    catch (error) { if (!absent(error)) throw error; }
  }
  const states = [];
  // Bounded filesystem concurrency; hash bytes even if mtime and size did not change.
  for (let i = 0; i < files.length; i += 24) {
    states.push(...await Promise.all(files.slice(i, i + 24).map(async file => [file, await fileState(file)])));
  }
  const transaction = states.find(([file]) => file === path.join(gitDir, 'workflow-kit/transaction.json'));
  if (transaction?.[1]) throw inputError('Commit transaction active');
  return digest(JSON.stringify({ version: 2, root, selection, planRevision: plan.plan_revision, head, status, replacements, index, states }));
}
