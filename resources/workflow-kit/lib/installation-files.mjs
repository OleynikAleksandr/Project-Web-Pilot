import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { VERSION, PLAN, CONFIG, MANIFEST, INDEX, hash, json, check, safePath } from './common.mjs';
import { emptyPlan, renderPlan } from './plan.mjs';
import { defaultConfig } from './validate.mjs';
import { git, gitPath } from './git.mjs';
import { windowsHookCommand, windowsLauncher } from './platform.mjs';

export const kitRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
export const HOOK_COMMAND = '"$(git rev-parse --show-toplevel)/scripts/workflow" hook session-start';
export const BLOCK_START = '# workflow-kit:begin';
export const BLOCK_END = '# workflow-kit:end';
export const MD_START = '<!-- workflow-kit:begin -->';
export const MD_END = '<!-- workflow-kit:end -->';

const MODULES_TEMPLATE = `# Модули проекта

Карта архитектурных владельцев функционала. Перед функциональным scope найдите существующего владельца; если его нет, сначала создайте и согласуйте module specification.

| Модуль | Спецификация | Ответственность |
| --- | --- | --- |
| Первый модуль | docs/modules/<module>.md | Уточняется перед первым функциональным scope |
`;
const OVERVIEW_TEMPLATE = `# Краткая архитектура проекта

Коротко опишите назначение продукта, основные архитектурные границы и место модулей. Этот документ предназначен для recovery и должен оставаться компактным; подробности живут в module specifications и профильных документах.

Карта модулей: docs/MODULES.md.
`;
export function walk(directory, prefix = '') {
  if (!fs.existsSync(directory)) return [];
  const output = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (['.git', 'node_modules', '.build', 'artifacts', '.DS_Store', 'runtime'].includes(entry.name) || entry.isSymbolicLink()) continue;
    const name = prefix + entry.name;
    if (entry.isDirectory()) output.push(...walk(path.join(directory, entry.name), name + '/'));
    else if (entry.isFile()) output.push(name);
  }
  return output;
}
export function addSection(old, content, start = MD_START, end = MD_END) {
  check(!old.includes(start) && !old.includes(end), 'UNOWNED_SECTION', 'В файле уже есть секция workflow-kit без действующего manifest.');
  return old + (old && !old.endsWith('\n') ? '\n' : '') + '\n' + start + '\n' + content.trim() + '\n' + end + '\n';
}
export function hooksDirectory(root) {
  const result = git(root, ['config', '--get', 'core.hooksPath'], { allowFailure: true });
  if (result.status !== 0) return { folder: gitPath(root, 'hooks'), tracked: false, mechanism: 'git' };
  const configured = result.stdout.trim(); const folder = path.resolve(root, configured);
  check(folder.startsWith(root + path.sep), 'SHARED_HOOKS', 'core.hooksPath указывает вне проекта. Общие hooks автоматически не меняются.', { hooks_path: configured });
  if (configured.replaceAll('\\', '/').replace(/\/$/, '') === '.husky/_') return { folder: path.join(root, '.husky'), tracked: true, mechanism: 'husky' };
  return { folder, tracked: true, mechanism: 'custom' };
}
export function hookContent(old, name) {
  check(!old.includes(BLOCK_START), 'UNOWNED_HOOK', 'Git hook уже содержит неизвестную установку workflow-kit.');
  const lines = old.split('\n');
  const shebang = old.startsWith('#!') ? lines.shift() : '#!/bin/sh';
  check(/(?:^#!\/(?:usr\/bin\/env\s+|bin\/)|\/)(?:sh|bash|zsh)(?:\s|$)/.test(shebang), 'HOOK_LANGUAGE', 'Существующий hook написан не на shell. Требуется явное согласование интеграции: ' + name);
  const block = BLOCK_START + '\n"$(git rev-parse --show-toplevel)/scripts/workflow" git-hook ' + name + ' "$@" || exit $?\n' + BLOCK_END;
  return shebang + '\n' + block + '\n' + (old.startsWith('#!') ? lines.join('\n') : old);
}
export function payload(root, name, hookLocation) {
  const entries = [];
  const add = (p, content, kind = 'owned', mode = 0o644, external = false) => {
    const target = external ? p : fs.existsSync(root) ? safePath(root, p) : path.join(root, p);
    const original = fs.existsSync(target) ? fs.readFileSync(target, 'utf8') : null;
    entries.push({ path: p, external, kind, mode, original_hash: original === null ? null : hash(original), hash: hash(content), content, existed: original !== null });
  };
  for (const p of walk(kitRoot).filter(p => /\.(mjs|json|md)$/.test(p))) add('.harness/kit/' + p, fs.readFileSync(path.join(kitRoot, p), 'utf8'));
  const wrapper = "#!/usr/bin/env node\nimport { main } from '../.harness/kit/cli.mjs';\nconst r = await main();\nprocess.stdout.write(r.json ? JSON.stringify(r.value, null, 2) + '\\n' : r.value + '\\n');\nprocess.exitCode = r.exitCode ?? 0;\n";
  add('scripts/workflow.mjs', wrapper, 'owned', 0o755);
  add('scripts/workflow.cmd', windowsLauncher, 'owned');
  add('scripts/workflow', '#!/bin/sh\nset -eu\nroot=$(git rev-parse --show-toplevel)\nfor candidate in "$root/.harness/runtime/node" "$root/.harness/runtime/node.exe" /opt/homebrew/bin/node /usr/local/bin/node "$(command -v node || true)"; do\n  if [ -n "$candidate" ] && [ -x "$candidate" ] && "$candidate" -e \'process.exit(Number(process.versions.node.split(".")[0]) >= 22 ? 0 : 1)\' 2>/dev/null; then\n    exec "$candidate" "$root/scripts/workflow.mjs" "$@"\n  fi\ndone\nprintf \'%s\\n\' \'Требуется Node.js 22+. Откройте проект в Project Workflow Kit для диагностики.\' >&2\nexit 1\n', 'owned', 0o755);
  add(CONFIG, json(defaultConfig()), 'editable');
  add(PLAN, renderPlan(emptyPlan(name)), 'editable');
  add('.harness/plans/todo-plan.template.md', fs.readFileSync(path.join(kitRoot, 'templates/PLAN.md'), 'utf8'), 'editable');
  const activeAgents = fs.existsSync(path.join(root, 'AGENTS.override.md')) && fs.readFileSync(path.join(root, 'AGENTS.override.md'), 'utf8').trim() ? 'AGENTS.override.md' : 'AGENTS.md';
  const agentsOld = fs.existsSync(path.join(root, activeAgents)) ? fs.readFileSync(path.join(root, activeAgents), 'utf8') : '';
  add(activeAgents, addSection(agentsOld, fs.readFileSync(path.join(kitRoot, 'templates/AGENTS.md'), 'utf8')), 'managed');
  for (const [target, source] of [['docs/PRODUCT.md', 'PRODUCT.md'], ['docs/architecture/ARCHITECTURE.md', 'ARCHITECTURE.md'], ['docs/WORKFLOW_START.md', 'START.md']]) {
    if (!fs.existsSync(path.join(root, target))) add(target, fs.readFileSync(path.join(kitRoot, 'templates', source), 'utf8'), 'editable');
  }
  if (!fs.existsSync(path.join(root, 'docs/MODULES.md'))) add('docs/MODULES.md', MODULES_TEMPLATE, 'editable');
  if (!fs.existsSync(path.join(root, 'docs/architecture/OVERVIEW.md'))) add('docs/architecture/OVERVIEW.md', OVERVIEW_TEMPLATE, 'editable');
  const inventory = [...new Set([...walk(root), ...entries.map(e => e.path), INDEX])].filter(p => /\.(md|markdown)$/.test(p));
  const indexOld = fs.existsSync(path.join(root, INDEX)) ? fs.readFileSync(path.join(root, INDEX), 'utf8') : '# Каталог документации\n';
  add(INDEX, addSection(indexOld, '## Документы проекта\n\n| Документ | Назначение |\n| --- | --- |\n' + inventory.map(p => '| ' + p + ' | ' + (p === PLAN ? 'Единственный активный план' : p.includes('/kit/') ? 'Протокол и шаблон комплекта' : 'Контракт проекта; уточняется при обсуждении') + ' |').join('\n')), 'managed');
  const ignore = fs.existsSync(path.join(root, '.gitignore')) ? fs.readFileSync(path.join(root, '.gitignore'), 'utf8') : '';
  add('.gitignore', addSection(ignore, '.harness/runtime/\n', BLOCK_START, BLOCK_END), 'managed');
  const attributes = fs.existsSync(path.join(root, '.gitattributes')) ? fs.readFileSync(path.join(root, '.gitattributes'), 'utf8') : '';
  add('.gitattributes', addSection(attributes, '/.harness/** -text\n/scripts/workflow* -text\n', BLOCK_START, BLOCK_END), 'managed');
  const hooksFile = path.join(root, '.codex/hooks.json');
  let hooks; try { hooks = fs.existsSync(hooksFile) ? JSON.parse(fs.readFileSync(hooksFile, 'utf8')) : { hooks: {} }; } catch { check(false, 'HOOKS_JSON', 'Существующий .codex/hooks.json повреждён.'); }
  check(hooks && typeof hooks === 'object' && !Array.isArray(hooks), 'HOOKS_JSON', 'Неверный формат hooks.json.');
  hooks.hooks ??= {}; hooks.hooks.SessionStart ??= [];
  check(Array.isArray(hooks.hooks.SessionStart), 'HOOKS_JSON', 'SessionStart должен быть массивом.');
  check(!hooks.hooks.SessionStart.some(g => g.hooks?.some(h => h.command === HOOK_COMMAND)), 'UNOWNED_HOOK', 'Обработчик workflow-kit уже есть без manifest.');
  hooks.hooks.SessionStart.push({ matcher: '^(startup|resume|clear|compact)$', hooks: [{ type: 'command', command: HOOK_COMMAND, commandWindows: windowsHookCommand, timeout: 20, additionalContextLimit: 0, statusMessage: 'Восстановление текущего плана проекта' }] });
  add('.codex/hooks.json', json(hooks), 'json-hook');
  for (const name of ['pre-commit', 'commit-msg', 'post-commit', 'pre-push']) {
    const target = path.join(hookLocation.folder, name);
    const old = fs.existsSync(target) ? fs.readFileSync(target, 'utf8') : '';
    const relative = path.relative(root, target).split(path.sep).join('/');
    add(hookLocation.tracked ? relative : target, hookContent(old, name), 'git-hook', 0o755, !hookLocation.tracked);
  }
  return entries;
}
export function installationManifest(entries, metadata) {
  return { schema_version: 1, version: VERSION, installed_at: new Date().toISOString(), ...metadata,
    files: entries.map(({ content, ...entry }) => {
      if (['managed', 'git-hook'].includes(entry.kind)) {
        const start = entry.kind === 'git-hook' || ['.gitignore', '.gitattributes'].includes(entry.path) ? BLOCK_START : MD_START;
        const end = start === BLOCK_START ? BLOCK_END : MD_END;
        entry.section_hash = hash(content.slice(content.indexOf(start), content.indexOf(end) + end.length));
      }
      if (entry.kind === 'json-hook') entry.handler_hash = hash(json(JSON.parse(content).hooks.SessionStart.flatMap(g => g.hooks).find(h => h.command === HOOK_COMMAND)));
      return entry;
    }) };
}
