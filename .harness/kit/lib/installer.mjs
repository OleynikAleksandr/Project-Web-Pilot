import fs from 'node:fs';
import path from 'node:path';
import { VERSION, MANIFEST, PLAN, CONFIG, check, hash, id, json, readJSON, atomic, safePath, errorResult } from './common.mjs';
import { git, run, repoRoot, head, allChanges, identityReady, localPath } from './git.mjs';
import { status } from './actions.mjs';
import { readPlan } from './plan.mjs';
import { journal } from './validate.mjs';
import { commitCandidate, locked } from './transaction.mjs';
import { payload, hooksDirectory, hookContent, installationManifest, HOOK_COMMAND, BLOCK_START, BLOCK_END, MD_START, MD_END } from './installation-files.mjs';
import { prepareRuntime, launcherCommand, windows } from './platform.mjs';

const hookNames = ['pre-commit', 'commit-msg', 'post-commit', 'pre-push'];
const hookName = entry => path.posix.basename(entry.path.replaceAll('\\', '/'));
function manifestTarget(root, entry) {
  if (!entry.external) return safePath(root, entry.path);
  check(entry.kind === 'git-hook' && hookNames.includes(hookName(entry)), 'MANIFEST_PATH', 'Неизвестный внешний путь manifest.');
  return path.join(hooksDirectory(root).folder, hookName(entry));
}
function reconnect(root, preview) {
  check(preview.compatible, 'UNSUPPORTED_MIGRATION', 'Установлена версия ' + preview.version + '; приложение содержит ' + VERSION + '. Автоматическая миграция пока не поддерживается. Проект сохранён.');
  if (preview.conflicts.length) return publicPreview(preview);
  return locked(root, () => {
    const manifest = readJSON(path.join(root, MANIFEST));
    const location = hooksDirectory(root); const edits = [];
    for (const name of hookNames) {
      const file = path.join(location.folder, name);
      const current = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
      if (current.includes(BLOCK_START)) {
        const entry = manifest.files.find(e => e.kind === 'git-hook' && hookName(e) === name);
        const start = current.indexOf(BLOCK_START), end = current.indexOf(BLOCK_END);
        check(entry && end > start && hash(current.slice(start, end + BLOCK_END.length)) === entry.section_hash, 'MODIFIED_INTEGRATION', 'Секция Git hook изменена; автоматическое переподключение остановлено: ' + name);
      } else edits.push({ file, content: hookContent(current, name) });
    }
    const runtime = prepareRuntime(root);
    for (const e of edits) atomic(e.file, e.content, 0o755);
    return { ...publicPreview(preview), reconnected: true, runtime, state: status(root), message: 'Проект подключён. Текущий план сохранён; локальные команды подготовлены.' };
  });
}

function selectedProject(opts) {
  check(typeof opts.project === 'string' && opts.project.trim(), 'PROJECT_REQUIRED', 'Выберите папку проекта.');
  const selected = path.resolve(opts.project);
  check(!/[\r\n\0]/.test(selected), 'PROJECT_PATH', 'Путь проекта не должен содержать переносы строк.');
  const exists = fs.existsSync(selected);
  if (exists) check(fs.statSync(selected).isDirectory(), 'PROJECT_PATH', 'Выберите папку, а не файл.');
  if (opts.mode === 'new') {
    const entries = exists ? fs.readdirSync(selected).filter(n => n !== '.DS_Store') : [];
    const recovering = fs.existsSync(path.join(selected, '.harness/runtime/install-journal.json'));
    const installed = fs.existsSync(path.join(selected, MANIFEST));
    check(entries.length === 0 || recovering || installed, 'FOLDER_NOT_EMPTY', 'Для нового проекта выберите пустую папку. Для существующего используйте «Подключить проект».');
    check(fs.existsSync(path.dirname(selected)), 'PARENT_MISSING', 'Родительская папка не существует.');
    return { root: exists ? fs.realpathSync(selected) : path.join(fs.realpathSync(path.dirname(selected)), path.basename(selected)), exists, isGit: exists && fs.existsSync(path.join(selected, '.git')) };
  }
  check(exists, 'PROJECT_MISSING', 'Выбранная папка не существует.');
  const result = git(selected, ['rev-parse', '--show-toplevel'], { allowFailure: true });
  return { root: result.status === 0 ? repoRoot(selected) : fs.realpathSync(selected), exists, isGit: result.status === 0 };
}
function fingerprint(root, entries, isGit) {
  const state = { root, version: VERSION, entries: entries.map(e => ({ path: e.path, before: e.original_hash, after: e.hash })),
    head: isGit ? head(root) : null, dirty: isGit ? allChanges(root) : [], folder: fs.existsSync(root) ? fs.readdirSync(root).sort() : null };
  // Generated IDs and template content are intentionally absent: preview is about current inputs.
  for (const entry of state.entries) delete entry.after;
  return hash(json(state));
}
export function inspect(opts) {
  const selected = selectedProject(opts); const { root, isGit } = selected;
  const manifestFile = path.join(root, MANIFEST);
  if (fs.existsSync(manifestFile)) {
    const manifest = readJSON(manifestFile);
    const conflicts = [];
    for (const e of manifest.files.filter(e => e.kind === 'owned')) {
      const f = manifestTarget(root, e);
      if (!fs.existsSync(f) || hash(fs.readFileSync(f)) !== e.hash) conflicts.push({ path: e.path, reason: 'Файл runtime отсутствует или изменён.' });
    }
    let state; try { state = status(root); } catch (e) { state = errorResult(e); }
    return { ok: true, installed: true, project_path: root, project_name: state.project_name ?? path.basename(root), version: manifest.version,
      compatible: manifest.version === VERSION, conflicts, can_install: false, state, files: [],
      message: conflicts.length ? 'Найдены изменения runtime. Автоматическая перезапись запрещена.' : 'Комплект уже установлен. План и файлы сохранены.' };
  }
  const pendingFile = path.join(root, '.harness/runtime/install-journal.json');
  let entries; let hookLocation; let initialChanges;
  if (fs.existsSync(pendingFile)) {
    const pending = readJSON(pendingFile);
    check(pending.root === root && pending.version === VERSION, 'INSTALL_JOURNAL', 'Журнал частичной установки относится к другой версии/папке.');
    entries = pending.entries; hookLocation = pending.hook_location; initialChanges = pending.initial_changes ?? [];
  } else {
    hookLocation = isGit ? hooksDirectory(root) : { folder: path.join(root, '.git/hooks'), tracked: false, mechanism: 'git' };
    entries = payload(root, opts.name || path.basename(root), hookLocation);
  }
  const conflicts = [];
  for (const e of entries) {
    const target = e.external ? e.path : path.join(root, e.path);
    const current = fs.existsSync(target) ? hash(fs.readFileSync(target)) : null;
    if (fs.existsSync(pendingFile)) {
      if (current !== e.original_hash && current !== e.hash) conflicts.push({ path: e.path, reason: 'Файл изменён после прерванной установки.' });
    } else if (e.original_hash !== null && ['owned', 'editable'].includes(e.kind)) conflicts.push({ path: e.path, reason: 'Этот путь уже занят. Существующий файл не будет перезаписан.' });
  }
  const files = entries.map(e => ({ path: e.external ? path.relative(root, e.path) : e.path, action: e.existed ? 'Дополнить' : 'Создать', kind: e.kind }));
  return { ok: true, installed: false, project_path: root, project_name: opts.name || path.basename(root), version: VERSION,
    can_install: conflicts.length === 0, conflicts, files, is_git: isGit, initialize_git: !isGit, hook_mechanism: hookLocation.mechanism,
    git_identity_ready: identityReady(isGit ? root : path.dirname(root)),
    existing_changes: initialChanges ?? (isGit ? allChanges(root) : []), preview_fingerprint: fingerprint(root, entries, isGit),
    partial_install: fs.existsSync(pendingFile), _entries: entries, _hook_location: hookLocation };
}
export function install(opts) {
  const preview = inspect(opts);
  if (preview.installed && opts.update) check(preview.compatible, 'UNSUPPORTED_MIGRATION', 'Для этой версии пока нет миграции. Существующая установка сохранена.');
  if (opts['dry-run']) return publicPreview(preview);
  if (preview.installed) return reconnect(preview.project_path, preview);
  check(preview.can_install, 'INSTALL_CONFLICT', 'Установка остановлена из-за конфликтов. Существующие файлы сохранены.', { conflicts: preview.conflicts });
  if (opts['expected-fingerprint']) check(opts['expected-fingerprint'] === preview.preview_fingerprint, 'PREVIEW_CHANGED', 'Папка изменилась после предварительного просмотра. Проверьте её ещё раз.');
  const root = preview.project_path; fs.mkdirSync(root, { recursive: true });
  const fresh = !preview.is_git;
  if (fresh) git(root, ['init', '-b', 'main']);
  return locked(root, () => {
    if (opts['git-name'] || opts['git-email']) {
      for (const key of ['git-name', 'git-email']) check(typeof opts[key] === 'string' && opts[key].trim() && !/[\r\n\0]/.test(opts[key]), 'GIT_IDENTITY', 'Укажите имя и email автора Git.');
      git(root, ['config', '--local', 'user.name', opts['git-name'].trim()]);
      git(root, ['config', '--local', 'user.email', opts['git-email'].trim()]);
    }
    const installJournal = path.join(root, '.harness/runtime/install-journal.json');
    const entries = preview._entries;
    atomic(installJournal, json({ schema_version: 1, version: VERSION, root, entries, initial_changes: preview.existing_changes, hook_location: preview._hook_location }), 0o600);
    for (const e of entries) {
      const file = e.external ? e.path : safePath(root, e.path);
      const current = fs.existsSync(file) ? hash(fs.readFileSync(file)) : null;
      check(current === e.original_hash || current === e.hash, 'INSTALL_CHANGED', 'Файл изменился во время установки: ' + e.path);
      if (current !== e.hash) atomic(file, e.content, e.mode);
      if (e.mode === 0o755) fs.chmodSync(file, 0o755);
      opts.afterWrite?.(e.path);
    }
    const runtime = prepareRuntime(root);
    const manifest = installationManifest(entries, { initialized_git: fresh, hook_mechanism: preview.hook_mechanism, ...runtime });
    atomic(path.join(root, MANIFEST), json(manifest));
    const installedPaths = [...entries.filter(e => !e.external).map(e => e.path), MANIFEST];
    atomic(localPath(root, 'installation.json'), json({ paths: installedPaths, preexisting_changes: preview.existing_changes, bootstrap_pending: true }));
    fs.unlinkSync(installJournal);
    let bootstrap = null; const warnings = [];
    if (!identityReady(root)) warnings.push('Настройте имя и email автора Git, затем выполните ./scripts/workflow install:commit.');
    else if (preview.existing_changes.length) warnings.push('Файлы установлены. Исходные изменения сохранены; bootstrap-коммит ждёт отдельной команды install:commit.');
    else {
      bootstrap = commitCandidate(root, { plan: readPlan(root), role: 'bootstrap', selected: installedPaths, message: 'chore: установить Project Workflow Kit', beforeHead: head(root) });
      atomic(localPath(root, 'installation.json'), json({ paths: installedPaths, preexisting_changes: [], bootstrap_pending: false, sha: bootstrap.sha }));
    }
    let state; try { state = status(root); } catch (e) { state = errorResult(e); }
    return { ok: true, installed: true, project_path: root, project_name: preview.project_name, version: VERSION,
      installation_status: 'FILES_INSTALLED', integration_status: 'HOOK_TRUST_PENDING', state, bootstrap, warnings,
      message: 'Проект подготовлен. Добавьте эту папку в Codex и разрешите проектные hooks.' };
  });
}
function publicPreview(result) { const { _entries, _hook_location, ...value } = result; return value; }
export function finalizeInstallation(root) {
  return locked(root, () => {
    const record = readJSON(localPath(root, 'installation.json'));
    if (!record.bootstrap_pending) return { ok: true, message: 'Установка уже зафиксирована.', sha: record.sha };
    check(record.preexisting_changes.every(p => !record.paths.includes(p)), 'PREEXISTING_INSTALL_CHANGES', 'Изменения установки пересекаются с исходной работой. Нужен отдельный разбор; они не будут автоматически закоммичены.');
    const result = commitCandidate(root, { plan: readPlan(root), role: 'bootstrap', selected: record.paths, message: 'chore: установить Project Workflow Kit', beforeHead: head(root) });
    record.bootstrap_pending = false; record.sha = result.sha; atomic(localPath(root, 'installation.json'), json(record)); return result;
  });
}
export function doctor(root) {
  const inspected = publicPreview(inspect({ project: root, mode: 'existing' }));
  if (!inspected.installed) return { ...inspected, message: 'Комплект не установлен.' };
  const diagnostics = [];
  const hooksFile = path.join(root, '.codex/hooks.json');
  try {
    const hooks = readJSON(hooksFile);
    const count = (hooks.hooks?.SessionStart ?? []).flatMap(g => g.hooks ?? []).filter(h => h.command === HOOK_COMMAND).length;
    diagnostics.push({ name: 'SessionStart', status: count === 1 ? 'OK' : 'ERROR', detail: count === 1 ? 'Один обработчик зарегистрирован.' : 'Ожидается ровно один обработчик.' });
  } catch (e) { diagnostics.push({ name: 'SessionStart', status: 'ERROR', detail: e.message }); }
  for (const f of ['pre-commit', 'commit-msg', 'post-commit', 'pre-push']) {
    const location = hooksDirectory(root); const file = path.join(location.folder, f);
    const ready = fs.existsSync(file) && fs.readFileSync(file, 'utf8').includes(BLOCK_START) && (windows || (fs.statSync(file).mode & 0o111) !== 0);
    diagnostics.push({ name: f, status: ready ? 'OK' : 'ERROR', detail: ready ? 'Проверка подключена.' : 'Проверка отсутствует или не исполняется.' });
  }
  const command = launcherCommand(root);
  const launcher = run(command.executable, [...command.args, 'validate', '--json'], root, { allowFailure: true });
  diagnostics.push({ name: 'Launcher', status: launcher.status === 0 ? 'OK' : 'ERROR', detail: launcher.status === 0 ? 'Команды проекта запускаются.' : String(launcher.stderr || launcher.stdout || launcher.error?.message).slice(-2000) });
  diagnostics.push({ name: 'Codex', status: inspected.state?.integration_status === 'HOOK_VERIFIED' ? 'OK' : 'PENDING', detail: 'Фактическая доставка подтверждается маркером из новой сессии; файл конфигурации сам по себе её не доказывает.' });
  const recordFile = localPath(root, 'installation.json');
  const installation = fs.existsSync(recordFile) ? readJSON(recordFile) : null;
  if (installation?.bootstrap_pending) diagnostics.push({ name: 'Первый коммит', status: 'PENDING', detail: inspected.state?.git_identity_ready ? 'Фиксация установки ожидает команды ./scripts/workflow install:commit.' : 'Настройте Git user.name/user.email, затем выполните ./scripts/workflow install:commit.' });
  return { ...inspected, installation, diagnostics, healthy: diagnostics.every(d => d.status !== 'ERROR') && inspected.state?.ok === true && inspected.compatible && !inspected.conflicts.length };
}
export function remove(root, dryRun) {
  const manifest = readJSON(path.join(root, MANIFEST)); const plan = readPlan(root);
  check(plan.execution_scope_status === 'NONE' && !journal(root), 'ACTIVE_SCOPE', 'Сначала пользователь должен закрыть активный scope.');
  const removals = []; const edits = []; const preserved = []; const conflicts = [];
  for (const e of manifest.files) {
    const file = manifestTarget(root, e);
    if (!fs.existsSync(file)) continue;
    const current = fs.readFileSync(file, 'utf8');
    if (e.kind === 'owned' || e.kind === 'editable') {
      if (hash(current) === e.hash) removals.push(file); else preserved.push(e.path);
    } else if (e.kind === 'json-hook') {
      const data = readJSON(file);
      const ownedHandlers = (data.hooks?.SessionStart ?? []).flatMap(g => g.hooks ?? []).filter(h => h.command === HOOK_COMMAND);
      if (ownedHandlers.some(h => hash(json(h)) !== e.handler_hash)) { conflicts.push(e.path); continue; }
      data.hooks.SessionStart = (data.hooks.SessionStart ?? []).map(g => ({ ...g, hooks: g.hooks.filter(h => h.command !== HOOK_COMMAND) })).filter(g => g.hooks.length);
      edits.push({ file, content: json(data) });
    } else {
      const start = e.kind === 'git-hook' || ['.gitignore', '.gitattributes'].includes(e.path) ? BLOCK_START : MD_START;
      const end = start === BLOCK_START ? BLOCK_END : MD_END;
      const i = current.indexOf(start); const j = current.indexOf(end);
      if (i >= 0 && hash(current.slice(i, j + end.length)) !== e.section_hash) { conflicts.push(e.path); continue; }
      if (i >= 0 && j >= i) {
        const content = current.slice(0, i) + current.slice(j + end.length).replace(/^\n/, '');
        if (!e.existed && content.trim().replace(/^#!\/bin\/sh/, '').trim() === '') removals.push(file);
        else edits.push({ file, content });
      }
    }
  }
  const repairId = hash(json({ removals, edits, preserved, conflicts }));
  if (dryRun === true) return { ok: true, dry_run: true, remove_id: repairId, removals, edits: edits.map(e => e.file), preserved, conflicts };
  check(conflicts.length === 0, 'MODIFIED_INTEGRATION', 'Пользователь изменил принадлежащие комплекту секции. Сначала согласуйте их удаление.', { paths: conflicts });
  check(dryRun === repairId, 'REMOVE_REVIEW', 'Сначала remove --dry-run, затем remove --apply <remove_id>.');
  return locked(root, () => { for (const e of edits) atomic(e.file, e.content); for (const file of removals) fs.unlinkSync(file); fs.unlinkSync(path.join(root, MANIFEST)); return { ok: true, preserved, message: 'Принадлежащие комплекту неизменённые файлы удалены. Пользовательские файлы сохранены.' }; });
}
export async function installerCommand(command, opts) {
  if (command === 'install') return install(opts);
  if (command === 'inspect') return publicPreview(inspect(opts));
  const root = repoRoot(path.resolve(opts.project ?? process.cwd()));
  if (command === 'doctor') return doctor(root);
  if (command === 'install:commit') return finalizeInstallation(root);
  return remove(root, opts['dry-run'] ? true : opts.apply ?? false);
}
