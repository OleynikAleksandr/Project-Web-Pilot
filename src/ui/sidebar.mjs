const $ = id => document.getElementById(id);
const api = window.webPilot;
let lastProjects = '';
let currentState;
let actionPending = false;
const phases = {
  selected: ['Готов к началу', 'Войдите в ChatGPT справа и выберите папку проекта слева.', 'neutral'],
  preparing: ['Подготавливаем подключение', 'Проверяем локальные инструменты и связь с ChatGPT.', 'working'],
  'waiting-login': ['Войдите в ChatGPT', 'После входа в аккаунт стартовое сообщение отправится автоматически.', 'working'],
  'waiting-composer': ['Ожидаем поле сообщения', 'Откройте новый чат в режиме с доступом к Codex Local Mac. Старт продолжится автоматически.', 'working'],
  'waiting-draft': ['В поле есть черновик', 'Закончите или уберите свой черновик. Его содержимое сохранено; стартовое сообщение подождёт.', 'working'],
  'waiting-generation': ['Ждём завершения ответа', 'ChatGPT отвечает. Проверка проекта начнётся, когда поле освободится.', 'working'],
  sending: ['Отправляем сообщение', 'Передаём ChatGPT папку проекта и просьбу восстановить контекст.', 'working'],
  'waiting-ack': ['Ждём подтверждения', 'Сообщение отправлено. Агент должен получить контекст через Codex Local Mac и подтвердить его.', 'working'],
  confirmed: ['Контекст подтверждён', 'Агент получил контекст выбранного проекта. Можно продолжать работу в чате.', 'success'],
  stale: ['Контекст нужно обновить', 'План или подтверждение изменились. Нажмите «Обновить контекст», чтобы получить актуальные факты.', 'working'],
  'send-unknown': ['Проверяем результат отправки', 'Результат пока неизвестен. Повторная отправка отключена; проверяем появление сообщения и подтверждения.', 'working'],
  'chat-changed': ['Открыт другой чат', 'Этот чат пока не связан с проектом. Вернитесь к чату проекта или начните новый через кнопку ниже.', 'working'],
  'ack-timeout': ['Подтверждение не пришло', 'Проверьте ответ в чате и доступ к Codex Local Mac. При необходимости выберите режим Work с этим подключением.', 'working'],
  error: ['Нужна проверка подключения', 'Не удалось завершить старт. Подробности ошибки показаны выше.', 'error'],
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
  $('state-context').textContent = context.phase === 'confirmed' ? 'Подтверждён' : context.phase === 'stale' ? 'Устарел' : 'Ожидание';
  $('state-context').dataset.ready = String(context.phase === 'confirmed');
  $('return-chat').hidden = context.phase !== 'chat-changed';
  $('retry-context').textContent = ['confirmed', 'stale'].includes(context.phase) ? 'Обновить контекст'
    : ['send-unknown', 'waiting-ack', 'ack-timeout'].includes(context.phase) ? 'Проверить статус' : 'Проверить контекст';
  $('connection-detail').textContent = state.runtimeFolder;
  const receipt = context.receipt;
  $('session-detail').textContent = selected ? `Сессия: ${selected.sessionId}`
    + (receipt ? `\nПодтверждение: ${receipt.probeId}\nПлан ${receipt.facts.plan_revision} · ${new Date(receipt.acknowledgedAtMs).toLocaleString('ru-RU')}` : '') : '';
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
