const INDEPENDENT = new Set(['chat', 'signup', 'help', 'keys', 'tunnels', 'plugins', 'copy-diagnostics']);
export function createStartupView({ document, api }) {
  const $ = id => document.getElementById(id), panel = $('startup-panel');
  let current = null, pending = false, signup = false, localError = null, copied = false;
  function render(state) {
    current = state;
    const s = state?.startup;
    panel.hidden = !s?.active || !!state.setup || !!state.settings;
    $('open-startup').hidden = !s;
    if (!s) return;
    const logged = s.account === 'signed-in', loginVisible = s.page === 'loaded' && s.account === 'signed-out';
    const local = s.node && s.git && s.runtime, ready = local && s.tunnel;
    const retry = ['slow', 'failed'].includes(s.page), unknown = s.page === 'loaded' && !logged && !loginVisible;
    const errors = {
      ERR_INTERNET_DISCONNECTED: 'Компьютер не подключён к интернету.',
      ERR_NAME_NOT_RESOLVED: 'Не удалось найти адрес сайта ChatGPT.',
      ERR_CONNECTION_TIMED_OUT: 'Сайт ChatGPT не ответил на подключение.',
      ERR_TIMED_OUT: 'Время ожидания ответа сайта истекло.',
      ERR_CERT_DATE_INVALID: 'Проверка сертификата не пройдена. Проверьте дату и время компьютера.',
      RENDER_PROCESS_GONE: 'Встроенная страница закрылась.',
    };
    const pageMessages = {
      idle: 'Открываем сайт chatgpt.com в правой части окна.',
      loading: 'Открываем сайт chatgpt.com в правой части окна.',
      slow: 'Сайт ChatGPT пока не открылся в правой части окна. Нажмите «Повторить открытие». Если справа снова пусто, скопируйте диагностику и передайте её разработчику.',
      failed: (errors[s.pageError] || 'Не удалось открыть сайт ChatGPT.') + ' Нажмите «Повторить открытие». Если это не помогает, скопируйте диагностику и передайте её разработчику.',
    };
    $('startup-account-title').textContent = logged || loginVisible ? 'Аккаунт ChatGPT' : 'Открытие ChatGPT';
    $('startup-account-status').textContent = pageMessages[s.page] ?? (logged ? 'Вход подтверждён' : loginVisible
      ? 'Теперь можно войти или создать аккаунт'
      : 'Ожидаем экран ChatGPT в правой части окна. Если справа пусто, повторите открытие или скопируйте диагностику.');
    $('startup-account-body').hidden = logged;
    $('startup-account-instructions').hidden = !loginVisible;
    $('startup-account-check').hidden = !loginVisible;
    $('startup-signup').hidden = !loginVisible;
    $('startup-signup-help').hidden = !signup || !loginVisible;
    $('startup-open-chat').textContent = retry || unknown ? 'Повторить открытие' : 'Открыть сайт ChatGPT';
    $('startup-copy-diagnostics').hidden = !retry && !unknown;
    $('startup-diagnostics-copied').hidden = !copied;
    $('startup-components-status').textContent = local ? 'Компоненты готовы' : s.busy ? 'Проверяем и подготавливаем…' : !s.node ? 'Проверяем комплект приложения' : !s.git ? 'Нужен компонент Apple' : 'Готовим локальные инструменты';
    $('startup-components-body').hidden = !logged || local;
    $('startup-components-help').textContent = !s.git
      ? 'Для истории проектов нужен Git из набора Apple Command Line Tools. Нажмите кнопку, затем «Установить» в системном окне и примите условия Apple. Загрузка может занять несколько минут. После завершения нажмите «Проверить и продолжить».'
      : 'Необходимые компоненты входят в приложение или загружаются автоматически. Подготовка может занять несколько минут; оставьте приложение открытым.';
    $('startup-install-git').hidden = !!s.git || s.phase === 'git-installing';
    $('startup-tunnel-status').textContent = s.tunnel ? 'Служба подключения работает' : !local ? 'После подготовки компьютера' : 'Нужна однократная настройка';
    $('startup-tunnel-body').hidden = !logged || !local || s.tunnel;
    $('startup-project-body').hidden = !logged || !ready;
    $('startup-project-wait').hidden = logged && ready;
    $('startup-error').hidden = !(localError || s.error);
    $('startup-error').textContent = localError || s.error || '';
    for (const button of panel.querySelectorAll('[data-startup]')) {
      const action = button.dataset.startup;
      button.disabled = (pending && !INDEPENDENT.has(action))
        || (s.busy && ['check', 'install-git', 'configure-tunnel', 'continue'].includes(action));
    }
    $('startup-continue').disabled ||= !logged || !ready;
  }
  async function perform(action) {
    if (pending && !INDEPENDENT.has(action)) return;
    if (action === 'signup' && current?.startup?.account === 'signed-out') {
      signup = true; render(current); return;
    }
    pending = true; localError = null; copied = false; if (current) render(current);
    try {
      const result = await api.startup(action);
      if (result?.ok === false) { localError = result.error?.message || 'Не удалось выполнить шаг. Повторите попытку.'; return; }
      if (result?.state) render(result.state);
      if (action === 'copy-diagnostics') copied = true;
      if (action === 'continue') {
        const project = await api.beginCreate();
        if (project?.ok === false) localError = project.error?.message || 'Не удалось открыть создание проекта.';
        if (project?.state) render(project.state);
      }
    } catch { localError = 'Действие не завершилось. Повторите попытку.'; }
    finally { pending = false; if (current) render(current); }
  }
  panel.addEventListener('click', event => {
    const button = event.target.closest('[data-startup]');
    if (button && !button.disabled) void perform(button.dataset.startup);
  });
  $('open-startup').addEventListener('click', () => { void perform('show'); });
  return { render };
}
if (typeof window !== 'undefined' && window.webPilot && document.getElementById('startup-panel')) {
  const view = createStartupView({ document, api: window.webPilot });
  window.webPilot.onState(view.render);
  window.webPilot.getState().then(view.render).catch(() => {});
}
