import fs from 'node:fs';
import path from 'node:path';
import { inspect, install, doctor } from './workflow-kit/lib/installer.mjs';
import { check, hash, json, MANIFEST, errorResult } from './workflow-kit/lib/common.mjs';
import { hooksDirectory, BLOCK_START, BLOCK_END } from './workflow-kit/lib/installation-files.mjs';
import { run } from './workflow-kit/lib/git.mjs';

const supported = new Set(['1.0.0', '1.1.0']);
function options(input) {
  check(input && ['inspect', 'apply'].includes(input.action), 'SETUP_ACTION', 'Неизвестное действие подготовки.');
  check(['new', 'existing'].includes(input.mode), 'SETUP_MODE', 'Выберите создание или подключение проекта.');
  check(typeof input.project === 'string' && path.isAbsolute(input.project) && !/[\r\n\0]/.test(input.project), 'PROJECT_PATH', 'Нужен полный путь к папке проекта.');
  return { project: input.project, mode: input.mode, name: input.name };
}
function inspectProject(opts) {
  const p = inspect(opts);
  const result = { workspace: p.project_path, name: p.project_name, version: p.version, installed: p.installed,
    ready: false, action: null, issues: [...p.conflicts], checks: [], files: p.files,
    gitIdentityReady: p.git_identity_ready, initializeGit: p.initialize_git,
    existingChanges: p.existing_changes ?? [], warnings: [], fingerprint: p.preview_fingerprint };
  if (!p.installed) {
    result.action = p.can_install ? 'install' : null;
    return result;
  }
  if (!supported.has(p.version)) result.issues.push({ path: MANIFEST, reason: `Версия ${p.version} пока не поддерживается. Автоматическое обновление не выполняется.` });
  const anchors = ['.harness/workflow.json', '.harness/plans/todo-plan.md', '.harness/plans/todo-plan.template.md',
    'docs/DOCUMENTATION_INDEX.md', 'docs/WORKFLOW_START.md', 'docs/PRODUCT.md', 'docs/architecture/ARCHITECTURE.md'];
  const manifest = JSON.parse(fs.readFileSync(path.join(p.project_path, MANIFEST), 'utf8'));
  anchors.push(...manifest.files.filter(f => f.kind === 'managed' && /^AGENTS(?:\.override)?\.md$/.test(f.path)).map(f => f.path));
  if (!anchors.some(f => /^AGENTS/.test(f))) result.issues.push({ path: 'AGENTS.md', reason: 'Не найдены зарегистрированные инструкции проекта.' });
  for (const file of anchors) {
    try { check(fs.statSync(path.join(p.project_path, file)).isFile(), 'MISSING', 'Нужен обычный файл.'); }
    catch { result.issues.push({ path: file, reason: 'Обязательный файл отсутствует.' }); }
  }
  result.checks.push({ label: 'Файлы комплекта и документы', ok: !result.issues.length });
  if (result.issues.length) return result; // Never execute a damaged installation.
  const d = doctor(p.project_path);
  const checks = d.diagnostics.filter(c => !['Codex', 'SessionStart', 'Первый коммит'].includes(c.name));
  // Verify owned Git-hook sections too: presence of a marker is insufficient.
  const hookFolder = hooksDirectory(p.project_path).folder;
  let hookConflict = false;
  for (const entry of manifest.files.filter(f => f.kind === 'git-hook')) {
    const file = path.join(hookFolder, path.basename(entry.path));
    if (!fs.existsSync(file)) continue;
    const content = fs.readFileSync(file, 'utf8'), start = content.indexOf(BLOCK_START), end = content.indexOf(BLOCK_END);
    if (start >= 0 && (end < start || hash(content.slice(start, end + BLOCK_END.length)) !== entry.section_hash)) {
      hookConflict = true;
      result.issues.push({ path: path.relative(p.project_path, file), reason: 'Секция проверки изменена. Автоматическая перезапись запрещена.' });
    }
  }
  const launcher = checks.find(c => c.name === 'Launcher');
  const hookErrors = checks.filter(c => c.name !== 'Launcher' && c.status === 'ERROR');
  result.checks.push({ label: 'План и история проекта', ok: p.state?.ok === true },
    { label: 'Команды проекта', ok: launcher?.status === 'OK' },
    { label: 'Проверки изменений', ok: !hookErrors.length && !hookConflict });
  if (!p.state?.ok) result.issues.push({ path: '.harness/plans/todo-plan.md', reason: p.state?.message ?? 'План и история требуют проверки.' });
  const recovered = run(process.execPath, [path.join(p.project_path, 'scripts/workflow.mjs'), 'recover', '--format', 'json'], p.project_path, { allowFailure: true });
  let packet; try { packet = JSON.parse(recovered.stdout); } catch {}
  const complete = recovered.status === 0 && packet?.ok === true && packet.completeness === 'COMPLETE';
  result.checks.push({ label: 'Полный контекст проекта', ok: complete });
  if (!complete) result.issues.push({ path: 'Контекст проекта', reason: packet?.message ?? 'Не удалось собрать полный пакет контекста.' });
  if (d.installation?.bootstrap_pending) result.warnings.push('Файлы комплекта подготовлены. Их первая фиксация в истории ещё ожидает команды install:commit; исходные изменения сохранены.');
  if (p.version !== '1.1.0') result.warnings.push(`Установлен Workflow Kit ${p.version}. Рабочая версия сохраняется без обновления.`);
  const repairable = !result.issues.length && p.compatible && (hookErrors.length || launcher?.status === 'ERROR');
  result.ready = !result.issues.length && !hookErrors.length && launcher?.status === 'OK';
  result.action = result.ready ? 'open' : repairable ? 'reconnect' : null;
  if (!result.ready && !repairable) {
    if (launcher?.status === 'ERROR') result.issues.push({ path: 'Команды проекта', reason: launcher.detail });
    for (const e of hookErrors) result.issues.push({ path: e.name, reason: e.detail });
  }
  if (repairable) result.warnings.push('Нужно восстановить локальные команды и отсутствующие проверки. План и файлы проекта сохранятся.');
  result.fingerprint = hash(json({ root: p.project_path, version: p.version, manifest: hash(fs.readFileSync(path.join(p.project_path, MANIFEST))),
    state: [p.state?.head, p.state?.plan_revision, p.state?.changes], checks: result.checks, issues: result.issues }));
  return result;
}
try {
  const input = JSON.parse(fs.readFileSync(0, 'utf8'));
  const opts = options(input);
  let result = inspectProject(opts);
  if (input.action === 'apply') {
    check(typeof input.fingerprint === 'string' && result.fingerprint === input.fingerprint, 'PREVIEW_CHANGED', 'Папка изменилась после проверки. Проверьте её ещё раз.');
    check(result.action, 'SETUP_BLOCKED', 'Сначала устраните показанные проблемы. Файлы сохранены.');
    if (result.action === 'install' || result.action === 'reconnect') {
      const installed = install({ ...opts, 'expected-fingerprint': input.fingerprint,
        ...(input.gitName || input.gitEmail ? { 'git-name': input.gitName, 'git-email': input.gitEmail } : {}) });
      result = inspectProject({ project: installed.project_path, mode: 'existing' });
    }
  }
  process.stdout.write(JSON.stringify({ ok: true, ...result }) + '\n');
} catch (error) { process.stdout.write(JSON.stringify(errorResult(error)) + '\n'); process.exitCode = 1; }
