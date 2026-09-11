const $ = id => document.getElementById(id);
const api = window.webPilot;
let lastProjects = '';
let currentState;
let actionPending = false;
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

async function action(method, ...args) {
  if (actionPending) return;
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
  const selected = state.selected;
  const context = state.context;
  const signature = JSON.stringify([state.projects, selected?.workspace]);
  if (signature !== lastProjects) {
    lastProjects = signature;
    const fragment = document.createDocumentFragment();
    for (const project of state.projects) {
      const button = document.createElement('button');
      button.className = 'project' + (project.workspace === selected?.workspace ? ' active' : '');
      button.setAttribute('aria-pressed', String(project.workspace === selected?.workspace));
      button.title = project.workspace;
      const name = document.createElement('strong'); name.textContent = project.name;
      const caption = document.createElement('small'); caption.textContent = project.chatUrl ? 'Связанный чат сохранён' : 'Новый чат проекта';
      button.append(name, caption); button.addEventListener('click', () => action('selectWorkspace', project.workspace));
      fragment.append(button);
    }
    if (!state.projects.length) {
      const empty = document.createElement('div'); empty.className = 'empty';
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
    button.disabled = actionPending || (state.storageError && ['add-workspace', 'new-chat', 'retry-context'].includes(button.id));
  }
}

$('add-workspace').addEventListener('click', () => action('chooseWorkspace'));
$('reload-chat').addEventListener('click', () => action('reload'));
$('retry-context').addEventListener('click', () => action('retry'));
$('new-chat').addEventListener('click', () => action('newChat'));
$('return-chat').addEventListener('click', () => action('returnToChat'));
$('choose-runtime').addEventListener('click', () => action('chooseRuntime'));
api.onState(render);
api.getState().then(render).catch(error => { $('error-banner').hidden = false; $('error-banner').textContent = error.message; });
