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

function compactTokenCount(value) {
  if (!Number.isFinite(value)) return '—';
  if (value >= 1_000_000) return `${(value / 1_000_000).toLocaleString('ru-RU', { maximumFractionDigits: 1 })}M`;
  if (value >= 1000) return `${Math.round(value / 1000).toLocaleString('ru-RU')}K`;
  return Math.round(value).toLocaleString('ru-RU');
}

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
      const newChat = document.createElement('button'); newChat.className = 'secondary new-project-chat'; newChat.textContent = 'Новый Chat';
      newChat.addEventListener('click', () => { clearTimeout(workspaceClickTimer); menu.hidden = true; menuButton.setAttribute('aria-expanded', 'false'); action('newSession', project.workspace, 'chat'); });
      const newWork = document.createElement('button'); newWork.className = 'secondary new-project-work'; newWork.textContent = 'Новый Work';
      newWork.addEventListener('click', () => { clearTimeout(workspaceClickTimer); menu.hidden = true; menuButton.setAttribute('aria-expanded', 'false'); action('newSession', project.workspace, 'work'); });
      const separator = document.createElement('div'); separator.className = 'menu-separator'; separator.setAttribute('aria-hidden', 'true');
      const copyPath = document.createElement('button'); copyPath.className = 'secondary copy-workspace-path'; copyPath.textContent = 'Скопировать полный путь';
      copyPath.addEventListener('click', () => { clearTimeout(workspaceClickTimer); menu.hidden = true; menuButton.setAttribute('aria-expanded', 'false'); action('copyWorkspacePath', project.workspace); });
      const archive = document.createElement('button'); archive.className = 'secondary archive-project'; archive.textContent = 'Перенести в архив';
      archive.addEventListener('click', () => { clearTimeout(workspaceClickTimer); action('archiveProject', project.workspace); }); menu.append(newChat, newWork, separator, copyPath, archive);
      menuButton.addEventListener('click', () => { clearTimeout(workspaceClickTimer); menu.hidden = !menu.hidden; menuButton.setAttribute('aria-expanded', String(!menu.hidden)); });
      row.append(arrow, button, menuButton); item.append(row, menu);
      const sessions = document.createElement('ul'); sessions.className = 'sessions'; sessions.hidden = !project.expanded;
      sessions.setAttribute('aria-label', `Сессии ${project.name}`);
      for (const [index, session] of project.sessions.entries()) {
        const entry = document.createElement('li');
        const row = document.createElement('div'); row.className = 'session-row';
        const choice = document.createElement('button');
        const active = selected?.workspace === project.workspace && selected?.sessionId === session.sessionId;
        choice.className = 'session' + (active ? ' active' : '');
        choice.dataset.sessionId = session.sessionId;
        if (active) choice.setAttribute('aria-current', 'page');
        const top = document.createElement('div'); top.className = 'session-top';
        const title = document.createElement('strong'); title.textContent = session.title || `Сессия ${index + 1}`;
        const experience = document.createElement('span'); experience.className = 'session-experience'; experience.dataset.experience = session.experience ?? 'chat'; experience.textContent = session.experience === 'work' ? 'Work' : 'Chat';
        top.append(title, experience);
        const date = document.createElement('small');
        date.textContent = `Сессия ${index + 1} · ${dateFormat.format(new Date(session.createdAt))}` + (session.chatUrl ? '' : ' · новая');
        choice.title = `${session.title || 'Новая сессия'} · ${session.experience === 'work' ? 'Work' : 'Chat'}\n${new Date(session.createdAt).toLocaleString('ru-RU')}`;
        const bottom = document.createElement('div'); bottom.className = 'session-bottom';
        const tokens = document.createElement('span'); tokens.className = 'session-tokens';
        const estimate = session.tokenEstimate;
        tokens.textContent = estimate ? `≈ ${estimate.total.toLocaleString('ru-RU')} ток.` : '— ток.';
        tokens.title = estimate
          ? `Оценка текста прочитанных сообщений: ${estimate.messageCount}. Скрытый контекст, reasoning и вложения не учитываются. Старые сообщения учитываются после загрузки при прокрутке. Это не расход API и не заполнение окна. Обновлено: ${new Date(estimate.updatedAt).toLocaleString('ru-RU')}.`
          : 'Оценка появится после чтения сообщений открытой сессии.';
        tokens.setAttribute('aria-label', estimate ? `Оценка токенов сессии: ${estimate.total}` : 'Оценка токенов сессии пока неизвестна');
        bottom.append(date, tokens);
        choice.append(top, bottom);
        choice.addEventListener('click', () => { clearTimeout(workspaceClickTimer); action('selectSession', project.workspace, session.sessionId); });
        const menuButton = document.createElement('button'); menuButton.className = 'icon-button session-menu-button'; menuButton.textContent = '⋯';
        menuButton.setAttribute('aria-label', `Меню сессии ${session.title || index + 1}`); menuButton.setAttribute('aria-expanded', 'false');
        const menu = document.createElement('div'); menu.className = 'session-menu'; menu.hidden = true;
        const archive = document.createElement('button'); archive.className = 'secondary archive-session'; archive.textContent = 'Перенести в архив';
        archive.addEventListener('click', () => { menu.hidden = true; menuButton.setAttribute('aria-expanded', 'false'); action('archiveSession', project.workspace, session.sessionId); });
        menu.append(archive);
        menuButton.addEventListener('click', event => { event.stopPropagation(); menu.hidden = !menu.hidden; menuButton.setAttribute('aria-expanded', String(!menu.hidden)); });
        row.append(choice, menuButton); entry.append(row, menu); sessions.append(entry);
      }
      item.append(sessions); fragment.append(item);
    }
    if (!state.projects.length) {
      const empty = document.createElement('li'); empty.className = 'empty';
      empty.textContent = 'Выберите проект, чтобы начать работу с его контекстом.'; fragment.append(empty);
    }
    $('projects').replaceChildren(fragment);
  }
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
  const contextWindow = state.contextWindow ?? { status: 'unknown' };
  const contextWindowKnown = contextWindow.status === 'known' && Number.isFinite(contextWindow.inputTokens)
    && Number.isFinite(contextWindow.modelContextWindow) && Number.isFinite(contextWindow.usedPercent);
  $('context-window-card').hidden = !selected;
  $('context-window-value').dataset.known = String(contextWindowKnown);
  $('context-window-value').textContent = contextWindowKnown
    ? `${compactTokenCount(contextWindow.inputTokens)} / ${compactTokenCount(contextWindow.modelContextWindow)} · ${contextWindow.usedPercent.toLocaleString('ru-RU', { maximumFractionDigits: 1 })}%`
    : 'Ожидаем данные';
  $('context-window-track').hidden = !contextWindowKnown;
  if (contextWindowKnown) {
    const percent = Math.max(0, Math.min(100, contextWindow.usedPercent));
    $('context-window-fill').style.width = `${percent}%`;
    $('context-window-track').setAttribute('aria-valuenow', String(percent));
    $('context-window-track').setAttribute('aria-valuetext', `${contextWindow.usedPercent.toLocaleString('ru-RU', { maximumFractionDigits: 1 })}% — ${contextWindow.inputTokens.toLocaleString('ru-RU')} из ${contextWindow.modelContextWindow.toLocaleString('ru-RU')} токенов`);
  } else {
    $('context-window-fill').style.width = '0%';
    $('context-window-track').removeAttribute('aria-valuenow');
    $('context-window-track').removeAttribute('aria-valuetext');
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
  const acceptance = state.planAcceptance;
  $('accept-plan').textContent = acceptance === 'sending' ? 'Отправляем…' : acceptance === 'sent' ? 'Отправлено'
    : acceptance === 'unknown' ? 'Проверьте чат' : 'Принять';
  $('accept-plan').disabled = actionPending || !selected || plan.state !== 'awaiting-acceptance' || !!acceptance;
  setupView.render(state, actionPending);
  archiveView.render(state, actionPending);
  $('choose-runtime').hidden = state.platform === 'win32';
  $('choose-runtime').disabled = actionPending || !!state.setup || !!state.settings;
}

$('context-toggle').addEventListener('click', () => { contextExpanded = !contextExpanded; render(currentState); });
$('accept-plan').addEventListener('click', () => action('acceptPlan'));
$('add-workspace').addEventListener('click', () => action('chooseWorkspace'));
$('reload-chat').addEventListener('click', () => action('reload'));
$('retry-context').addEventListener('click', () => action('retry'));
$('return-chat').addEventListener('click', () => action('returnToChat'));
$('choose-runtime').addEventListener('click', () => action('chooseRuntime'));
api.onState(render);
api.getState().then(render).catch(error => { $('error-banner').hidden = false; $('error-banner').textContent = error.message; });
