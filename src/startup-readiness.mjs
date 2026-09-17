import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
const execute = promisify(execFile);
const PREPARATION_ERRORS = {
  MAC_RUNTIME_EXTERNAL_MODIFIED: 'Локальный компонент отличается от поддерживаемой версии. Обновите Web Pilot. Если ошибка повторяется, передайте этот код разработчику; удалять настройки не нужно.',
  MAC_RUNTIME_SETUP_FAILED: 'Не удалось загрузить или установить локальные компоненты. Нажмите «Проверить и продолжить», чтобы повторить подготовку. Если ошибка повторяется, передайте этот код разработчику.',
  MAC_RUNTIME_STATUS_FAILED: 'Не удалось проверить локальные компоненты. Нажмите «Проверить и продолжить». Если ошибка повторяется, передайте этот код разработчику.',
  MAC_RUNTIME_STATUS_INVALID: 'Локальный компонент вернул непонятный ответ. Обновите Web Pilot и повторите подготовку.',
  MAC_RUNTIME_CONTRACT: 'Версия локального компонента несовместима с Web Pilot. Обновите приложение и повторите подготовку.',
  MAC_RUNTIME_PAYLOAD_MISSING: 'В приложении отсутствуют файлы для подготовки. Заново распакуйте полный архив Web Pilot и замените приложение.',
  MAC_RUNTIME_ARCHIVE_INVALID: 'Комплект локальных компонентов повреждён. Заново распакуйте полный архив Web Pilot и замените приложение.',
  MAC_RUNTIME_BOOTSTRAP_TOOL_MISSING: 'Не запускается встроенный инструмент установки. Заново распакуйте полный архив Web Pilot и замените приложение.',
  MAC_RUNTIME_NOT_FOUND: 'Установленные локальные компоненты не найдены. Перезапустите Web Pilot и повторите подготовку.',
};


// Avoid /usr/bin/git on an unprepared Mac: the shim can launch a system dialog.
export async function inspectMacGit(run = execute) {
  try {
    const { stdout } = await run('/usr/bin/xcode-select', ['-p'], { timeout: 5000 });
    const developer = stdout.trim();
    if (!path.isAbsolute(developer)) return false;
    const result = await run('/usr/bin/git', ['--version'], { timeout: 5000 });
    return /^git version \d+\./.test(result.stdout.trim());
  } catch { return false; }
}
export async function installMacGit(run = execute) {
  try { await run('/usr/bin/xcode-select', ['--install'], { timeout: 10000 }); }
  catch { throw Object.assign(new Error('Не удалось открыть установку Apple.'), { publicMessage: 'Не удалось открыть установку Apple. Проверьте «Системные настройки → Основные → Обновление ПО» и повторите проверку.' }); }
  // xcode-select requests installation but does not guarantee foreground activation.
  // LaunchServices reuses the system helper; no AppleScript or accessibility consent.
  try {
    await run('/usr/bin/open', ['-a', '/System/Library/CoreServices/Install Command Line Developer Tools.app'], { timeout: 10000 });
  } catch {
    throw Object.assign(new Error('Не удалось показать окно установки Apple.'), {
      publicMessage: 'Установка Apple запущена, но её окно не удалось вывести вперёд. Сверните Web Pilot жёлтой кнопкой и подтвердите установку. После завершения вернитесь и нажмите «Проверить и продолжить».',
    });
  }
}

// No cookies, account APIs, tokens, or page internals.
export function accountObservation() {
  const visible = e => !!e && !e.hidden && e.getClientRects().length > 0;
  const has = selector => [...document.querySelectorAll(selector)].some(visible);
  const login = has('[data-testid="login-button"],[data-testid="signup-button"],a[href="/auth/login"]');
  const profile = has('[data-testid="profile-button"],[data-testid="accounts-profile-button"],[data-testid="user-menu-button"],button[aria-label="Open Profile Menu"],button[aria-label="Открыть меню профиля"]');
  return { login, authenticated: !login && profile };
}

export class StartupReadiness {
  constructor({ probeNode, probeGit, inspectRuntime, prepareRuntime, installGit, configureTunnel, onChange = () => {},
    schedule = setTimeout, cancel = clearTimeout } = {}) {
    Object.assign(this, { probeNode, probeGit, inspectRuntime, prepareRuntime, installGit, configureTunnel, onChange, schedule, cancel });
    this.state = { phase: 'checking', busy: false, node: false, git: false, runtime: false, tunnel: false,
      account: 'unknown', page: 'idle', pageError: null, error: null };
    this.live = true; this.pending = null; this.pageGeneration = 0; this.timer = null;
  }
  snapshot() { return { ...this.state }; }
  publish(patch) { if (!this.live) return; Object.assign(this.state, patch); this.onChange(this.snapshot()); }
  async serial(operation) {
    if (this.pending) return this.pending;
    if (!this.live) return;
    this.publish({ busy: true, error: null });
    this.pending = Promise.resolve().then(operation).catch(error => {
      // Never publish command arguments or raw stderr, which may contain credentials.
      const known = Object.hasOwn(PREPARATION_ERRORS, error?.code) ? PREPARATION_ERRORS[error.code] + ' (' + error.code + ')' : null;
      this.publish({ phase: 'error', error: error?.publicMessage || known || 'Не удалось подготовить локальные компоненты. Нажмите «Проверить и продолжить». Если ошибка повторяется, сообщите разработчику, на каком шаге она появилась.' });
    }).finally(() => { this.pending = null; this.publish({ busy: false }); });
    return this.pending;
  }
  async probe() {
    this.publish({ phase: 'checking', runtime: false, tunnel: false });
    const node = await this.probeNode().then(() => true, () => false);
    const git = await this.probeGit().catch(() => false);
    if (!this.live) return false;
    this.publish({ node, git });
    if (!node) { this.publish({ phase: 'package', error: 'В приложении не запускается встроенный компонент. Скопируйте полное приложение в Applications и откройте его снова.' }); return false; }
    if (!git) { this.publish({ phase: 'git' }); return false; }
    const service = await this.inspectRuntime();
    this.publish({ runtime: !!service?.mcp?.ready, tunnel: !!service?.tunnel?.ready && !!service?.tunnel?.configured });
    return true;
  }
  check({ prepare = false } = {}) {
    return this.serial(async () => {
      if (!await this.probe() || !this.live) return;
      if (prepare && (!this.state.runtime || !this.state.tunnel)) await this.prepare();
      else this.publish({ phase: this.state.runtime ? (this.state.tunnel ? 'connected' : 'tunnel') : 'prepare' });
    });
  }
  async prepare() {
    this.publish({ phase: 'preparing', runtime: false, tunnel: false });
    const service = await this.prepareRuntime();
    this.publish({ runtime: !!service?.mcp?.ready, tunnel: !!service?.tunnel?.ready && !!service?.tunnel?.configured,
      phase: !service?.mcp?.ready ? 'prepare' : service?.tunnel?.ready && service?.tunnel?.configured ? 'connected' : 'tunnel' });
  }
  install() {
    return this.serial(async () => {
      await this.installGit();
      this.publish({ phase: 'git-installing' });
    });
  }
  configure() {
    return this.serial(async () => {
      if (!await this.probe() || !this.live) return;
      this.publish({ phase: 'configuring' });
      const result = await this.configureTunnel();
      if (result?.cancelled) { this.publish({ phase: 'tunnel' }); return; }
      await this.prepare();
    });
  }
  beginPage(generation) {
    this.pageGeneration = generation;
    if (this.timer !== null) this.cancel(this.timer);
    this.publish({ page: 'loading', account: 'unknown', pageError: null });
    this.timer = this.schedule(() => {
      if (this.live && this.pageGeneration === generation && this.state.page === 'loading') this.publish({ page: 'slow' });
    }, 15000);
  }
  finishPage(generation, error = null) {
    if (generation !== this.pageGeneration || !this.live) return;
    if (this.timer !== null) this.cancel(this.timer);
    this.timer = null;
    this.publish({ page: error ? 'failed' : 'loaded', pageError: error ? String(error).slice(0, 80) : null,
      ...(error ? { account: 'unknown' } : {}) });
  }
  observe(generation, observation) {
    if (generation !== this.pageGeneration || !this.live || ['loading', 'slow', 'failed'].includes(this.state.page)) return;
    this.publish({ account: observation?.authenticated ? 'signed-in' : observation?.login ? 'signed-out' : 'unknown' });
  }
  dispose() { this.live = false; if (this.timer !== null) this.cancel(this.timer); this.timer = null; }
}


export async function offerMacInstallation({ app, dialog, fresh }) {
  if (!fresh || app.isInApplicationsFolder()) return false;
  const choice = await dialog.showMessageBox({
    type: 'question', title: 'Установка Project Web Pilot',
    message: 'Установить Web Pilot в «Программы»?',
    detail: 'Приложение само переместится в папку Applications и откроется снова. Перетаскивать файлы вручную не нужно.',
    buttons: ['Установить', 'Пока пропустить'], defaultId: 0, cancelId: 1,
  });
  if (choice.response !== 0) return false;
  try {
    return app.moveToApplicationsFolder({ conflictHandler: () => dialog.showMessageBoxSync({
      type: 'question', title: 'Project Web Pilot',
      message: 'В «Программах» уже есть Project Web Pilot.',
      detail: 'Заменить его этой версией? Существующие проекты и настройки сохранятся.',
      buttons: ['Заменить', 'Отмена'], defaultId: 1, cancelId: 1,
    }) === 0 });
  } catch {
    dialog.showErrorBox('Перемещение не выполнено', 'Web Pilot продолжит работу из текущей папки. Позже скопируйте полное приложение в Applications через Finder.');
    return false;
  }
}
