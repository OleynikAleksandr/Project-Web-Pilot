import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { check, WorkflowError, hash, safePath } from './common.mjs';
import { gitExecutable, processEnvironment } from './platform.mjs';

export function run(executable, args, cwd, options = {}) {
  const result = spawnSync(executable, args, { cwd, encoding: 'utf8', maxBuffer: 8 * 1024 * 1024, timeout: 30000,
    windowsHide: true, ...options, env: processEnvironment(cwd, options.env) });
  if ((result.error || result.status !== 0) && !options.allowFailure) {
    throw new WorkflowError('COMMAND_FAILED', 'Команда завершилась с ошибкой: ' + executable + ' ' + args[0], {
      status: result.status, reason: result.error?.message, output: String(result.stderr ?? result.stdout ?? '').slice(-6000),
    });
  }
  return result;
}
export const git = (root, args, options) => run(gitExecutable(root), ['--literal-pathspecs', '-c', 'core.quotePath=false', '-c', 'diff.external=', '-c', 'diff.autoRefreshIndex=false', ...args], root, options);
export const output = (root, args, options) => git(root, args, options).stdout.trim();
export function repoRoot(cwd) {
  const r = git(cwd, ['rev-parse', '--show-toplevel'], { allowFailure: true });
  check(r.status === 0, 'NOT_GIT_REPOSITORY', 'Выберите папку Git-проекта.', { cwd });
  return fs.realpathSync(r.stdout.trim());
}
export function gitPath(root, name) { return output(root, ['rev-parse', '--path-format=absolute', '--git-path', name]); }
export const localPath = (root, name) => gitPath(root, 'workflow-kit/' + name);
export function head(root) {
  const r = git(root, ['rev-parse', '--verify', 'HEAD'], { allowFailure: true });
  return r.status === 0 ? r.stdout.trim() : null;
}
export const splitZ = value => value.split('\0').filter(Boolean);
export function paths(root, mode = 'worktree') {
  if (mode === 'untracked') return splitZ(git(root, ['ls-files', '--others', '--exclude-standard', '-z']).stdout);
  if (mode === 'tracked') return splitZ(git(root, ['ls-files', '-z']).stdout);
  return splitZ(git(root, ['diff', '--no-ext-diff', '--no-textconv', '--no-renames', '--name-only', '-z', ...(mode === 'staged' ? ['--cached'] : [])]).stdout);
}
export function allChanges(root) { return [...new Set([...paths(root, 'staged'), ...paths(root), ...paths(root, 'untracked')])].sort(); }
export function fileFingerprint(root, p) {
  const file = safePath(root, p);
  if (!fs.existsSync(file)) return 'DELETED';
  const st = fs.lstatSync(file);
  check(st.isFile(), 'UNSUPPORTED_FILE', 'Ожидается обычный файл: ' + p);
  check(st.size <= 16 * 1024 * 1024, 'FILE_TOO_LARGE', 'Файл слишком велик для контрольного снимка: ' + p);
  return hash(Buffer.concat([Buffer.from(String(st.mode & 0o777) + '\n'), fs.readFileSync(file)]));
}
export function snapshot(root, relevant = []) {
  const conflicts = splitZ(git(root, ['diff', '--name-only', '--diff-filter=U', '-z']).stdout);
  check(conflicts.length === 0, 'MERGE_CONFLICT', 'Сначала разрешите конфликты слияния.', { paths: conflicts });
  const staged = paths(root, 'staged'); const unstaged = paths(root); const untracked = paths(root, 'untracked');
  const index = gitPath(root, 'index');
  const files = {};
  for (const p of [...new Set(relevant)].sort()) files[p] = fileFingerprint(root, p);
  const data = { head: head(root), branch: output(root, ['symbolic-ref', '--short', '-q', 'HEAD'], { allowFailure: true }),
    index: fs.existsSync(index) ? hash(fs.readFileSync(index)) : null, staged, unstaged, untracked, files };
  return { ...data, fingerprint: hash(JSON.stringify(data)) };
}
export function diff(root, mode, selected) {
  if (!selected.length) return '';
  return git(root, ['diff', '--no-ext-diff', '--no-textconv', '--no-renames', '--no-color', ...(mode === 'staged' ? ['--cached'] : []), '--', ...selected]).stdout;
}
export function commitPaths(root, sha) {
  return splitZ(git(root, ['diff-tree', '--root', '--no-commit-id', '--name-only', '-r', '--no-renames', '-z', sha]).stdout);
}
export function isAncestor(root, from, to = 'HEAD') {
  return git(root, ['merge-base', '--is-ancestor', from, to], { allowFailure: true }).status === 0;
}
export function areAncestors(root, from, to) {
  const commits = [...new Set(from)];
  if (!commits.length) return true;
  if (commits.length === 1) return isAncestor(root, commits[0], to);
  // Git performs the graph walk, including merges and replacement refs.
  const result = git(root, ['rev-list', '--max-count=1', ...commits, '--not', to, '--'], { allowFailure: true });
  return result.status === 0 && result.stdout.trim() === '';
}
export function commitHistory(root, baseline) {
  if (!head(root)) return [];
  if (baseline) check(isAncestor(root, baseline), 'BASELINE_MISMATCH', 'Baseline не принадлежит текущей истории.');
  const raw = git(root, ['log', '-z', '--format=%H%x00%P%x00%B%x00%(trailers:only,unfold)', baseline ? baseline + '..HEAD' : 'HEAD']).stdout;
  const fields = raw.split('\0');
  if (fields.at(-1) === '') fields.pop();
  check(fields.length % 4 === 0, 'HISTORY_FORMAT', 'Git вернул неполную историю коммитов.');
  const history = [];
  for (let i = 0; i < fields.length; i += 4) {
    const [sha, parents, body, formatted] = fields.slice(i, i + 4);
    // Pretty trailers ignore the patch divider, whereas --parse stops there.
    // Keep Git's legacy interpretation for this uncommon commit-message form.
    const parsed = (/(?:^|\n)---/.test(body)
      ? git(root, ['interpret-trailers', '--parse'], { input: body }).stdout : formatted).trim();
    const trailers = {};
    for (const line of parsed.split('\n').filter(Boolean)) {
      const colon = line.indexOf(':'); if (colon < 0) continue;
      const key = line.slice(0, colon); (trailers[key] ??= []).push(line.slice(colon + 1).trim());
    }
    history.push({ sha, parents: parents.split(' ').filter(Boolean), body, trailers });
  }
  return history;
}
export function ensureIdleGit(root) {
  for (const name of ['MERGE_HEAD', 'CHERRY_PICK_HEAD', 'REVERT_HEAD', 'rebase-merge', 'rebase-apply']) {
    check(!fs.existsSync(gitPath(root, name)), 'GIT_OPERATION_ACTIVE', 'Завершите текущую Git-операцию: ' + name);
  }
}
export function identityReady(root) {
  return git(root, ['var', 'GIT_AUTHOR_IDENT'], { allowFailure: true }).status === 0;
}
