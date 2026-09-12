import { projectArchiveView } from './project-archive.mjs';
import { workspaceSetupView } from './workspace-setup.mjs';
const $ = id => document.getElementById(id);
const api = window.webPilot;
window.addEventListener('pagehide', () => clearTimeout(workspaceClickTimer));
let lastProjects = '';
let currentState;
let actionPending = false;
let workspaceClickTimer;
let contextExpanded = false;
const phases = {
  selected: ['Готов к началу', 'Войдите в ChatGPT справа и выберите папку проекта слева.', 'neutral'],
  preparing: ['Подготавливаем подключение', 'Проверяем локальные инструменты и связь с ChatGPT.', 'working'],
  'loading-context': ['Получаем контекст проекта', 'Готовим полный пакет для первого сообщения.', 'working'],
  'waiting-login': ['Войдите в ChatGPT', 'После входа полный контекст отправится автоматически.', 'working'],
  'waiting-composer': ['Ожидаем поле сообщения', 'Откройте доступное поле ChatGPT. Старт продолжится автоматически.', 'working'],
  'waiting-draft': ['В поле есть черновик', 'Закончите или уберите свой черновик. Стартовое сообщение подождёт.', 'working'],
  'waiting-generation': ['Ждём завершения ответа', 'ChatGPT отвечает. Передача контекста начнётся, когда поле освободится.', 'working'],
  sending: ['Передаём контекст', 'Отправляем полный контекст проекта одним сообщением.', 'working'],
  'waiting-chat': ['Контекст отправлен', 'Сохраняем связь проекта с этим чатом.', 'working'],
  delivered: ['Контекст передан', 'Полный пакет отправлен в этот чат. Агент кратко подтвердит получение и опишет проект.', 'success'],
  stale: ['Контекст нужно обновить', 'План изменился после отправки. Нажмите «Обновить контекст», чтобы передать актуальную версию.', 'working'],
  'prepared-stale': ['Пакет в поле устарел', 'Уберите подготовленный черновик и нажмите «Обновить контекст». Отправка приостановлена.', 'working'],
  'legacy-session': ['Сохранённый чат проекта', 'Чат открыт. Для передачи полного пакета нажмите «Обновить контекст» или начните новый чат.', 'neutral'],
  'send-unknown': ['Проверяем результат отправки', 'Результат пока неизвестен. Проверяем появление сообщения перед повторной отправкой.', 'working'],
  'chat-changed': ['Открыт другой чат', 'Этот чат пока не связан с проектом. Вернитесь к чату проекта или начните новый через кнопку ниже.', 'working'],
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
  clearTimeout(workspaceClickTimer);
  actionPending = true;
  render(currentState);
  try {
    const result = await api[method](...args);
    if (result?.state) render(result.state);
  } catch (error) {
    $('error-banner').hidden = false;
    $('error-banner').textContent = error.message;
  } finally { actionPending = false; render(currentState); }
}

function render(state) {
  if (!state) return;
  currentState = state;
  splitter.setAttribute('aria-valuemin', String(state.sidebarMinWidth ?? 312));
  splitter.setAttribute('aria-valuenow', String(state.sidebarWidth ?? 312));
  const selected = state.selected;
  const context = state.context;
  const signature = JSON.stringify([state.projects, selected?.workspace, selected?.sessionId]);
  if (signature !== lastProjects) {
    lastProjects = signature;
    const fragment = document.createDocumentFragment();
    const dateFormat = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    for (const project of state.projects) {
      const item = document.createElement('li');
      const row = document.createElement('div'); row.className = 'workspace-row';
      const toggle = () => { clearTimeout(workspaceClickTimer); action('setExpanded', project.workspace, !project.expanded); };
      const arrow = document.createElement('button'); arrow.className = 'expand-project';
      arrow.textContent = '';
      arrow.setAttribute('aria-label', `${project.expanded ? 'Свернуть' : 'Раскрыть'} сессии ${project.name}`);
      arrow.setAttribute('aria-expanded', String(project.expanded));
      arrow.addEventListener('click', toggle);
      const button = document.createElement('button');
      button.className = 'project' + (project.workspace === selected?.workspace ? ' active' : '');
      button.dataset.workspace = project.workspace;
      button.setAttribute('aria-pressed', String(project.workspace === selected?.workspace));
      button.setAttribute('aria-expanded', String(project.expanded));
      button.title = `${project.workspace}\nДвойной клик — раскрыть сессии`;
      const name = document.createElement('strong'); name.textContent = project.name;
      const caption = document.createElement('small');
      const count = project.sessions.length;
      caption.textContent = `${count} ${count % 10 === 1 && count % 100 !== 11 ? 'сессия' : count % 10 >= 2 && count % 10 <= 4 && !(count % 100 >= 12 && count % 100 <= 14) ? 'сессии' : 'сессий'}`;
      button.append(name, caption);
      button.addEventListener('click', event => {
        clearTimeout(workspaceClickTimer);
        if (!event.detail) { action('selectWorkspace', project.workspace); return; }
        if (event.detail === 1) workspaceClickTimer = setTimeout(() => action('selectWorkspace', project.workspace), 450);
      });
      button.addEventListener('dblclick', event => { event.preventDefault(); toggle(); });
      button.addEventListener('keydown', event => {
        if ((event.key === 'ArrowRight' && !project.expanded) || (event.key === 'ArrowLeft' && project.expanded)) { event.preventDefault(); toggle(); }
      });
      const menuButton = document.createElement('button'); menuButton.className = 'icon-button project-menu-button'; menuButton.textContent = '⋯';
      menuButton.setAttribute('aria-label', `Меню проекта ${project.name}`); menuButton.setAttribute('aria-expanded', 'false');
      const menu = document.createElement('div'); menu.className = 'project-menu'; menu.hidden = true;
      const archive = document.createElement('button'); archive.className = 'secondary archive-project'; archive.textContent = 'Перенести в архив';
      archive.addEventListener('click', () => { clearTimeout(workspaceClickTimer); action('archiveProject', project.workspace); }); menu.append(archive);
      menuButton.addEventListener('click', () => { clearTimeout(workspaceClickTimer); menu.hidden = !menu.hidden; menuButton.setAttribute('aria-expanded', String(!menu.hidden)); });
      row.append(arrow, button, menuButton); item.append(row, menu);
      const sessions = document.createElement('ul'); sessions.className = 'sessions'; sessions.hidden = !project.expanded;
      sessions.setAttribute('aria-label', `Сессии ${project.name}`);
      for (const [index, session] of project.sessions.entries()) {
        const entry = document.createElement('li');
        const choice = document.createElement('button');
        const active = selected?.workspace === project.workspace && selected?.sessionId === session.sessionId;
        choice.className = 'session' + (active ? ' active' : '');
        choice.dataset.sessionId = session.sessionId;
        if (active) choice.setAttribute('aria-current', 'page');
        const title = document.createElement('strong'); title.textContent = session.title || `Сессия ${index + 1}`;
        const date = document.createElement('small');
        date.textContent = `Сессия ${index + 1} · ${dateFormat.format(new Date(session.createdAt))}` + (session.chatUrl ? '' : ' · новый чат');
        choice.title = `${session.title || 'Новая сессия'}\n${new Date(session.createdAt).toLocaleString('ru-RU')}`;
        choice.append(title, date);
        choice.addEventListener('click', () => { clearTimeout(workspaceClickTimer); action('selectSession', project.workspace, session.sessionId); });
        entry.append(choice); sessions.append(entry);
      }
      item.append(sessions); fragment.append(item);
    }
    if (!state.projects.length) {
      const empty = document.createElement('li'); empty.className = 'empty';
      empty.textContent = 'Выберите проект, чтобы начать работу с его контекстом.'; fragment.append(empty);
    }
    $('projects').replaceChildren(fragment);
  }
  $('workspace-details').hidden = !selected;
  $('session-actions').hidden = !selected;
  if (selected) {
    $('workspace-name').textContent = selected.name;
    $('workspace-path').textContent = selected.workspace;
    $('plan-text').textContent = `План · версия ${selected.planRevision}`
      + (selected.nextTaskId ? `\n${selected.nextTaskId} — ${selected.nextTaskTitle}` : '\nОткрытых задач нет');
  }
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
  $('connection-detail').textContent = state.runtimeFolder;
  const delivery = context.delivery;
  $('session-detail').textContent = selected ? `Сессия: ${selected.sessionId}`
    + (delivery ? `\nПередано ${(delivery.contextBytes / 1024).toFixed(1)} КБ · план ${delivery.facts.plan_revision}\n${new Date(delivery.sentAtMs).toLocaleString('ru-RU')}` : '') : '';
  if (state.fixture) $('connection-detail').textContent = 'TEST FIXTURE · без реального аккаунта и MCP';
  const error = state.startupError ?? context.error;
  $('error-banner').hidden = !error;
  $('error-banner').textContent = error ? `${error.message} (${error.code})` : '';
  for (const button of document.querySelectorAll('button')) {
    button.disabled = actionPending || (state.storageError && ['create-workspace', 'add-workspace', 'new-chat', 'retry-context'].includes(button.id));
  }
  setupView.render(state, actionPending);
  archiveView.render(state, actionPending);
  $('choose-runtime').disabled = actionPending || !!state.setup || !!state.settings;
  const health = state.workspaceHealth;
  $('workspace-health').textContent = health && selected && health.workspace === selected.workspace ? `Проект проверен · Workflow Kit ${health.version}` : '';
  $('workspace-notice').textContent = health && selected && health.workspace === selected.workspace ? (health.warnings ?? []).join('\n') : '';
}

$('context-toggle').addEventListener('click', () => { contextExpanded = !contextExpanded; render(currentState); });
$('add-workspace').addEventListener('click', () => action('chooseWorkspace'));
$('reload-chat').addEventListener('click', () => action('reload'));
$('retry-context').addEventListener('click', () => action('retry'));
$('new-chat').addEventListener('click', () => action('newChat'));
$('return-chat').addEventListener('click', () => action('returnToChat'));
$('choose-runtime').addEventListener('click', () => action('chooseRuntime'));
api.onState(render);
api.getState().then(render).catch(error => { $('error-banner').hidden = false; $('error-banner').textContent = error.message; });
