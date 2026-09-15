import { createProgress, operationLabel } from './progress.mjs';
import { projectArchiveView } from './project-archive.mjs';
import { workspaceSetupView } from './workspace-setup.mjs';
const $ = id => document.getElementById(id);
const api = window.webPilot;
let lastProjects = '';
let currentState;
let actionPending = false, pendingAction = null;
const progress = createProgress($('operation-progress'));
window.addEventListener('pagehide', () => progress.destroy());
let contextExpanded = false;
const sessionScroll = new Map();
function treeIcon(name) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'tree-icon'); svg.setAttribute('viewBox', '0 0 24 24'); svg.setAttribute('aria-hidden', 'true');
  const use = document.createElementNS('http://www.w3.org/2000/svg', 'use'); use.setAttribute('href', `#tree-${name}`); svg.append(use);
  return svg;
}
function closeTreeMenus() {
  for (const menu of document.querySelectorAll('.project-menu:popover-open, .session-menu:popover-open')) menu.hidePopover();
}
function bindTreeMenu(button, menu, label) {
  menu.setAttribute('popover', 'auto'); menu.setAttribute('aria-label', label);
  button.setAttribute('aria-label', label); button.setAttribute('aria-expanded', 'false'); button.setAttribute('aria-haspopup', 'true');
  menu.addEventListener('toggle', event => button.setAttribute('aria-expanded', String(event.newState === 'open')));
  button.addEventListener('click', () => {
    if (menu.matches(':popover-open')) { menu.hidePopover(); return; }
    $('project-actions').open = false;
    menu.showPopover();
    const rect = button.getBoundingClientRect();
    menu.style.left = `${Math.max(8, Math.min(rect.right - menu.offsetWidth, innerWidth - menu.offsetWidth - 8))}px`;
    menu.style.top = `${Math.max(8, rect.bottom + menu.offsetHeight + 14 <= innerHeight ? rect.bottom + 6 : rect.top - menu.offsetHeight - 6)}px`;
  });
}
document.addEventListener('click', event => { if (!$('project-actions').contains(event.target)) $('project-actions').open = false; });
document.addEventListener('keydown', event => { if (event.key === 'Escape') $('project-actions').open = false; });
document.addEventListener('scroll', event => { if (!event.target.closest?.('[popover]')) closeTreeMenus(); }, true);
window.addEventListener('resize', closeTreeMenus);
$('project-actions').addEventListener('toggle', () => { if ($('project-actions').open) closeTreeMenus(); });
$('toggle-projects').addEventListener('click', async () => {
  if (actionPending || !currentState) return;
  const expand = !currentState.projects.some(project => project.expanded);
  for (const project of currentState.projects.filter(project => project.expanded !== expand)) await action('setExpanded', project.workspace, expand);
});

const phases = {
  selected: ['Готов к началу', 'Войдите в ChatGPT справа и выберите папку проекта слева.', 'neutral'],
  preparing: ['Подготавливаем подключение', 'Проверяем локальные инструменты и связь с ChatGPT.', 'working'],
  'loading-context': ['Получаем контекст проекта', 'Готовим полный пакет для первого сообщения.', 'working'],
  'waiting-login': ['Войдите в ChatGPT', 'После входа полный контекст отправится автоматически.', 'working'],
  'waiting-composer': ['Ожидаем поле сообщения', 'Откройте доступное поле ChatGPT. Старт продолжится автоматически.', 'working'],
  'waiting-draft': ['В поле есть черновик', 'Закончите или уберите свой черновик. Стартовое сообщение подождёт.', 'working'],
  'waiting-generation': ['Ждём завершения ответа', 'ChatGPT отвечает. Передача контекста начнётся, когда поле освободится.', 'working'],
  'preparing-message': ['Вставляем контекст в сообщение', 'Проверяем полный текст перед отправкой.', 'working'],
  sending: ['Передаём контекст', 'Отправляем полный контекст проекта одним сообщением.', 'working'],
  'waiting-chat': ['Контекст отправлен', 'Сохраняем связь проекта с этим чатом.', 'working'],
  delivered: ['Контекст передан', 'Полный пакет отправлен в этот чат. Агент кратко подтвердит получение и опишет проект.', 'success'],
  stale: ['Контекст нужно обновить', 'План изменился после отправки. Нажмите «Обновить контекст», чтобы передать актуальную версию.', 'working'],
  'prepared-stale': ['Пакет в поле устарел', 'Уберите подготовленный черновик и нажмите «Обновить контекст». Отправка приостановлена.', 'working'],
  'legacy-session': ['Сохранённый чат проекта', 'Чат открыт. Для передачи полного пакета нажмите «Обновить контекст» или создайте новую сессию через меню проекта.', 'neutral'],
  'send-unknown': ['Проверяем результат отправки', 'Результат пока неизвестен. Проверяем появление сообщения перед повторной отправкой.', 'working'],
  'chat-changed': ['Открыт другой чат', 'Этот чат пока не связан с проектом. Вернитесь к сессии проекта или создайте новую через меню проекта.', 'working'],
  error: ['Не удалось передать контекст', 'Подробности ошибки показаны выше. После исправления нажмите «Проверить контекст».', 'error'],
};

const setupView = workspaceSetupView(action);
const archiveView = projectArchiveView(action);

const splitter = $('sidebar-splitter');
let splitterDrag = null, resizeFrame = 0, requestedSidebarWidth = null;
function requestSidebarWidth(width) {
  requestedSidebarWidth = width;
  if (resizeFrame) return;
  resizeFrame = requestAnimationFrame(async () => {
    resizeFrame = 0;
    const value = requestedSidebarWidth; requestedSidebarWidth = null;
    try {
      const result = await api.setSidebarWidth(value);
      if (result?.state) render(result.state);
    } catch (error) { $('error-banner').hidden = false; $('error-banner').textContent = error.message; }
  });
}
splitter.addEventListener('pointerdown', event => {
  if (event.button !== 0) return;
  splitterDrag = { pointerId: event.pointerId, startX: event.screenX, startWidth: currentState?.sidebarWidth ?? 312 };
  splitter.classList.add('dragging');
  try { splitter.setPointerCapture(event.pointerId); } catch {}
  event.preventDefault();
});
splitter.addEventListener('pointermove', event => {
  if (!splitterDrag || event.pointerId !== splitterDrag.pointerId) return;
  requestSidebarWidth(splitterDrag.startWidth + event.screenX - splitterDrag.startX);
});
function finishSplitter(event) {
  if (!splitterDrag || event.pointerId !== splitterDrag.pointerId) return;
  requestSidebarWidth(splitterDrag.startWidth + event.screenX - splitterDrag.startX);
  splitterDrag = null; splitter.classList.remove('dragging');
}
splitter.addEventListener('pointerup', finishSplitter);
splitter.addEventListener('pointercancel', finishSplitter);
splitter.addEventListener('keydown', event => {
  if (!['ArrowLeft','ArrowRight'].includes(event.key)) return;
  event.preventDefault(); requestSidebarWidth((currentState?.sidebarWidth ?? 312) + (event.key === 'ArrowRight' ? 24 : -24));
});

async function action(method, ...args) {
  if (actionPending) return;
  closeTreeMenus();
  $('project-actions').open = false;
  if (['selectWorkspace', 'newSession'].includes(method)) {
    sessionScroll.set(args[0], 0);
    for (const list of $('projects').querySelectorAll('.sessions')) if (list.dataset.workspace === args[0]) list.scrollTop = 0;
  }
  actionPending = true; pendingAction = method;
  render(currentState);
  try {
    const result = await api[method](...args);
    if (result?.state) render(result.state);
  } catch (error) {
    $('error-banner').hidden = false;
    $('error-banner').textContent = error.message;
  } finally { actionPending = false; pendingAction = null; render(currentState); }
}

function render(state) {
  progress.show(operationLabel(state ?? {}, pendingAction));
  if (!state) return;
  for (const list of $('projects').querySelectorAll('.sessions')) {
    if (!list.closest('[hidden]')) sessionScroll.set(list.dataset.workspace, list.scrollTop);
  }
  const previousProjects = currentState?.projects ?? [];
  currentState = state;
  splitter.setAttribute('aria-valuemin', String(state.sidebarMinWidth ?? 312));
  splitter.setAttribute('aria-valuenow', String(state.sidebarWidth ?? 312));
  const selected = state.selected;
  const context = state.context;
  const signature = JSON.stringify([state.projects, selected?.workspace, selected?.sessionId]);
  if (signature !== lastProjects) {
    lastProjects = signature;
    const outerScroll = $('projects').scrollTop;
    const oldProject = previousProjects.find(project => project.workspace === selected?.workspace);
    if (selected && !oldProject?.sessions.some(session => session.sessionId === selected.sessionId)) sessionScroll.set(selected.workspace, 0);
    closeTreeMenus();
    const fragment = document.createDocumentFragment();
    const dateFormat = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    for (const project of state.projects) {
      const item = document.createElement('li'); item.className = 'workspace-tree';
      const activeProject = project.workspace === selected?.workspace;
      const row = document.createElement('div'); row.className = 'workspace-row' + (activeProject ? ' active' : '');
      const toggle = () => action('setExpanded', project.workspace, !project.expanded);
      const arrow = document.createElement('button'); arrow.className = 'expand-project';
      arrow.append(treeIcon('chevron-right'));
      arrow.setAttribute('aria-label', `${project.expanded ? 'Свернуть' : 'Раскрыть'} сессии ${project.name}`);
      arrow.setAttribute('aria-expanded', String(project.expanded));
      arrow.addEventListener('click', toggle);
      const button = document.createElement('button');
      button.className = 'project' + (activeProject ? ' active' : '');
      button.dataset.workspace = project.workspace;
      button.setAttribute('aria-pressed', String(activeProject));
      button.setAttribute('aria-expanded', String(project.expanded));
      button.title = `${project.workspace}\nОткрыть последнюю сессию`;
      const label = document.createElement('span'); label.className = 'project-copy';
      const name = document.createElement('strong'); name.textContent = project.name;
      const caption = document.createElement('small');
      const count = project.sessions.length;
      caption.textContent = `${count} ${count % 10 === 1 && count % 100 !== 11 ? 'сессия' : count % 10 >= 2 && count % 10 <= 4 && !(count % 100 >= 12 && count % 100 <= 14) ? 'сессии' : 'сессий'}`;
      label.append(name, caption); button.append(treeIcon(project.expanded ? 'folder-open' : 'folder'), label);
      button.addEventListener('click', () => action('selectWorkspace', project.workspace));
      button.addEventListener('keydown', event => {
        if ((event.key === 'ArrowRight' && !project.expanded) || (event.key === 'ArrowLeft' && project.expanded)) { event.preventDefault(); toggle(); }
      });
      const menuButton = document.createElement('button'); menuButton.className = 'icon-button project-menu-button'; menuButton.append(treeIcon('ellipsis'));
      const menu = document.createElement('div'); menu.className = 'project-menu';
      bindTreeMenu(menuButton, menu, `Меню проекта ${project.name}`);
      const menuAction = (className, text, handler) => {
        const control = document.createElement('button'); control.className = `secondary ${className}`; control.textContent = text;
        control.addEventListener('click', () => { closeTreeMenus(); handler(); });
        menu.append(control);
      };
      menuAction('new-project-chat', 'Новый Chat', () => action('newSession', project.workspace, 'chat'));
      menuAction('new-project-work', 'Новый Work', () => action('newSession', project.workspace, 'work'));
      const separator = document.createElement('div'); separator.className = 'menu-separator'; separator.setAttribute('aria-hidden', 'true'); menu.append(separator);
      menuAction('rename-project', 'Переименовать', () => {
        const value = window.prompt('Название проекта в Web Pilot', project.name);
        if (value !== null) action('renameProject', project.workspace, value);
      });
      menuAction('copy-workspace-path', 'Скопировать полный путь', () => action('copyWorkspacePath', project.workspace));
      menuAction('archive-project', 'Перенести в архив', () => action('archiveProject', project.workspace));
      row.append(arrow, button, menuButton); item.append(row, menu);
      const sessions = document.createElement('ul'); sessions.className = 'sessions'; sessions.hidden = !project.expanded;
      sessions.dataset.workspace = project.workspace;
      sessions.setAttribute('aria-label', `Сессии ${project.name}, новые сверху`);
      sessions.tabIndex = 0;
      sessions.addEventListener('scroll', () => {
        if (sessions.isConnected && !sessions.closest('[hidden]')) sessionScroll.set(project.workspace, sessions.scrollTop);
      }, { passive: true });
      for (const session of project.sessions) {
        const entry = document.createElement('li');
        const row = document.createElement('div'); row.className = 'session-row';
        const choice = document.createElement('button');
        const active = activeProject && selected?.sessionId === session.sessionId;
        choice.className = 'session' + (active ? ' active' : '');
        choice.dataset.sessionId = session.sessionId;
        if (active) choice.setAttribute('aria-current', 'page');
        const copy = document.createElement('span'); copy.className = 'session-copy';
        const title = document.createElement('strong'); title.textContent = session.title || 'Новая сессия';
        const date = document.createElement('small');
        date.textContent = dateFormat.format(new Date(session.createdAt)) + (session.chatUrl ? '' : ' · новая');
        copy.append(title, date);
        const experience = document.createElement('span'); experience.className = 'session-experience'; experience.dataset.experience = session.experience ?? 'chat'; experience.textContent = session.experience === 'work' ? 'Work' : 'Chat';
        choice.title = `${session.title || 'Новая сессия'} · ${experience.textContent}\n${new Date(session.createdAt).toLocaleString('ru-RU')}`;
        choice.append(copy, experience);
        choice.addEventListener('click', () => action('selectSession', project.workspace, session.sessionId));
        const menuButton = document.createElement('button'); menuButton.className = 'icon-button session-menu-button'; menuButton.append(treeIcon('ellipsis'));
        const menu = document.createElement('div'); menu.className = 'session-menu';
        bindTreeMenu(menuButton, menu, `Меню сессии ${session.title || 'Новая сессия'}`);
        const rename = document.createElement('button'); rename.className = 'secondary rename-session'; rename.textContent = 'Переименовать';
        rename.addEventListener('click', () => {
          closeTreeMenus();
          const value = window.prompt('Название сессии', session.title || 'Новая сессия');
          if (value !== null) action('renameSession', project.workspace, session.sessionId, value);
        });
        const archive = document.createElement('button'); archive.className = 'secondary archive-session'; archive.textContent = 'Перенести в архив';
        archive.addEventListener('click', () => { closeTreeMenus(); action('archiveSession', project.workspace, session.sessionId); });
        menu.append(rename, archive);
        row.append(choice, menuButton); entry.append(row, menu); sessions.append(entry);
      }
      item.append(sessions); fragment.append(item);
    }
    if (!state.projects.length) {
      const empty = document.createElement('li'); empty.className = 'empty';
      empty.textContent = 'Откройте меню «Ваши проекты», чтобы создать проект или выбрать его папку.'; fragment.append(empty);
    }
    $('projects').replaceChildren(fragment);
    $('projects').scrollTop = outerScroll;
    for (const workspace of sessionScroll.keys()) if (!state.projects.some(project => project.workspace === workspace)) sessionScroll.delete(workspace);
  }
  const collapseAll = state.projects.some(project => project.expanded);
  $('toggle-projects').title = collapseAll ? 'Свернуть все проекты' : 'Раскрыть все проекты';
  $('toggle-projects').setAttribute('aria-label', $('toggle-projects').title);
  $('plan-card').hidden = !selected;
  $('session-actions').hidden = !selected;
  const plan = selected?.planView ?? { state: 'not-created', completed: 0, total: 0, tasks: [], blockedReason: null };
  if (selected) {
    const plural = count => count % 10 === 1 && count % 100 !== 11 ? 'задача'
      : count % 10 >= 2 && count % 10 <= 4 && !(count % 100 >= 12 && count % 100 <= 14) ? 'задачи' : 'задач';
    const statusText = plan.state === 'awaiting-acceptance' ? `Все ${plan.total} ${plural(plan.total)} выполнены · ожидается ваша приёмка`
      : plan.state === 'blocked' ? `План заблокирован · ${plan.completed} из ${plan.total} выполнено`
        : plan.state === 'closed' ? 'Scope завершён и архивирован'
          : plan.state === 'not-created' ? 'План ещё не создан'
            : `В работе · ${plan.completed} из ${plan.total} выполнено`;
    $('plan-status').textContent = statusText; $('plan-status').dataset.state = plan.state;
    $('plan-note').hidden = plan.state !== 'closed';
    $('plan-note').textContent = plan.state === 'closed' ? 'Проект готов к следующему новому плану.' : '';
    $('plan-reason').hidden = !plan.blockedReason; $('plan-reason').textContent = plan.blockedReason ?? '';
    $('plan-tasks').replaceChildren(...plan.tasks.map(task => {
      const item = document.createElement('li'); item.className = 'plan-task'; item.dataset.status = task.status;
      const mark = document.createElement('span'); mark.className = 'plan-task-state'; mark.setAttribute('aria-hidden', 'true');
      mark.textContent = task.status === 'done' ? '✓' : task.status === 'current' ? '●' : '○';
      const body = document.createElement('div'), title = document.createElement('strong'), id = document.createElement('small');
      title.textContent = task.title; id.textContent = task.id; body.append(title, id); item.append(mark, body); return item;
    }));
  } else { $('plan-tasks').replaceChildren(); $('plan-note').hidden = true; $('plan-reason').hidden = true; }
  const [title, detail, tone] = phases[context.phase] ?? phases.selected;
  $('context-title').textContent = state.pageLoading ? 'Открываем ChatGPT' : title;
  $('context-details').hidden = !contextExpanded;
  $('context-toggle').setAttribute('aria-expanded', String(contextExpanded));
  $('context-toggle').setAttribute('aria-label', `${contextExpanded ? 'Скрыть' : 'Показать'} подробности состояния контекста`);
  $('context-detail').textContent = state.pageLoading ? 'Загружаем чат выбранного проекта.' : detail;
  $('context-card').dataset.tone = state.pageLoading ? 'working' : tone;
  $('state-service').textContent = context.servicesReady ? 'Готовы' : context.phase === 'preparing' ? 'Проверка…' : 'Не проверены';
  $('state-service').dataset.ready = String(context.servicesReady);
  $('state-message').textContent = context.messageSent ? 'Отправлено' : context.phase === 'sending' ? 'Отправка…' : context.phase === 'send-unknown' ? 'Уточняем' : 'Ожидание';
  $('state-message').dataset.ready = String(!!context.messageSent);
  $('state-context').textContent = context.phase === 'delivered' ? 'Передан целиком' : ['stale', 'prepared-stale'].includes(context.phase) ? 'Устарел' : context.phase === 'loading-context' ? 'Подготовка…' : context.phase === 'legacy-session' ? 'Прежняя сессия' : 'Ожидание';
  $('state-context').dataset.ready = String(context.phase === 'delivered');
  $('return-chat').hidden = context.phase !== 'chat-changed';
  $('retry-context').textContent = ['delivered', 'stale', 'prepared-stale', 'legacy-session'].includes(context.phase) ? 'Обновить контекст'
    : ['send-unknown', 'waiting-chat'].includes(context.phase) ? 'Проверить статус' : 'Проверить контекст';
  $('connection-detail').textContent = state.platform === 'win32' ? 'Codex Local Windows · встроенный runtime' : state.runtimeFolder;
  const delivery = context.delivery;
  $('session-detail').textContent = selected ? `Сессия: ${selected.sessionId}`
    + (delivery ? `\nПередано ${(delivery.contextBytes / 1024).toFixed(1)} КБ · план ${delivery.facts.plan_revision}\n${new Date(delivery.sentAtMs).toLocaleString('ru-RU')}` : '')
    + (Number.isFinite(delivery?.preparationMs) ? `\nПодготовка: ${Math.round(delivery.preparationMs)} мс${delivery.cacheHit ? ' · пакет готов заранее' : ''}` : '')
    + (Number.isFinite(delivery?.deliveryMs) ? `\nОтправка: ${(delivery.deliveryMs / 1000).toFixed(2)} с` : '') : '';
  if (state.fixture) $('connection-detail').textContent = 'TEST FIXTURE · без реального аккаунта и MCP';
  const error = state.startupError ?? context.error;
  $('error-banner').hidden = !error;
  $('error-banner').textContent = error ? `${error.message} (${error.code})` : '';
  for (const button of document.querySelectorAll('button')) {
    button.disabled = actionPending || (state.storageError && ['create-workspace', 'add-workspace', 'retry-context'].includes(button.id));
  }
  $('next-session-choice').hidden = !state.scopeTransition;
  const acceptance = state.planAcceptance;
  $('accept-plan').textContent = acceptance === 'sending' ? 'Отправляем…' : acceptance === 'sent' ? 'Отправлено'
    : acceptance === 'unknown' ? 'Проверьте чат' : 'Принять';
  $('accept-plan').disabled = actionPending || !selected || plan.state !== 'awaiting-acceptance' || !!acceptance;
  setupView.render(state, actionPending);
  archiveView.render(state, actionPending);
  // Setup briefly hides the tree while checking a folder. Restore only after it is visible.
  for (const list of $('projects').querySelectorAll('.sessions')) {
    if (!list.closest('[hidden]')) {
      const top = sessionScroll.get(list.dataset.workspace) ?? 0;
      if (list.scrollTop !== top) list.scrollTop = top;
    }
  }
  $('choose-runtime').hidden = state.platform === 'win32';
  $('choose-runtime').disabled = actionPending || !!state.setup || !!state.settings;
}

$('context-toggle').addEventListener('click', () => { contextExpanded = !contextExpanded; render(currentState); });
$('accept-plan').addEventListener('click', () => action('acceptPlan'));
for (const experience of ['chat', 'work']) $('next-session-' + experience).addEventListener('click', () => {
  const transition = currentState?.scopeTransition;
  if (transition) action('continueAfterScope', transition.workspace, transition.scopeId, experience);
});
$('add-workspace').addEventListener('click', () => action('chooseWorkspace'));
$('reload-chat').addEventListener('click', () => action('reload'));
$('retry-context').addEventListener('click', () => action('retry'));
$('return-chat').addEventListener('click', () => action('returnToChat'));
$('choose-runtime').addEventListener('click', () => action('chooseRuntime'));
api.onState(render);
api.getState().then(render).catch(error => { $('error-banner').hidden = false; $('error-banner').textContent = error.message; });
