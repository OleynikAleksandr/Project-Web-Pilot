export function createStartupView({ document, api }) {
  const $ = id => document.getElementById(id), panel = $('startup-panel');
  let current = null, pending = false, signup = false, localError = null;
  function render(state) {
    current = state;
    const s = state?.startup;
    panel.hidden = !s?.active || !!state.setup || !!state.settings;
    $('open-startup').hidden = !s;
    if (!s) return;
    const logged = s.account === 'signed-in', local = s.node && s.git && s.runtime, ready = local && s.tunnel;
    const pageMessages = {
      loading: 'Открываем страницу входа…',
      slow: 'Страница загружается дольше обычного. Проверьте интернет и нажмите «Открыть вход в ChatGPT», чтобы повторить.',
      failed: 'Страница не открылась. Проверьте интернет и повторите вход. Устанавливать ChatGPT для этого не нужно.',
    };
    $('startup-account-status').textContent = pageMessages[s.page] ?? (logged ? 'Вход подтверждён' : s.account === 'signed-out' ? 'Войдите или создайте аккаунт' : 'Завершите вход на странице справа, затем нажмите «Проверить вход».');
    $('startup-account-body').hidden = logged;
    $('startup-signup-help').hidden = !signup;
    $('startup-components-status').textContent = local ? 'Компоненты готовы' : s.busy ? 'Проверяем и подготавливаем…' : !s.node ? 'Проверяем комплект приложения' : !s.git ? 'Нужен компонент Apple' : 'Готовим локальные инструменты';
    $('startup-components-body').hidden = !logged || local;
    $('startup-components-help').textContent = !s.git
      ? 'Для истории проектов нужен Git из набора Apple Command Line Tools. Нажмите кнопку, затем «Установить» в системном окне и примите условия Apple. Загрузка может занять несколько минут. После завершения нажмите «Проверить и продолжить».'
      : 'Необходимые компоненты входят в приложение или загружаются автоматически. Подготовка может занять несколько минут; оставьте приложение открытым.';
    $('startup-install-git').hidden = !!s.git;
    $('startup-tunnel-status').textContent = s.tunnel ? 'Служба подключения работает' : !local ? 'После подготовки компьютера' : 'Нужна однократная настройка';
    $('startup-tunnel-body').hidden = !logged || !local || s.tunnel;
    $('startup-project-body').hidden = !logged || !ready;
    $('startup-project-wait').hidden = logged && ready;
    $('startup-error').hidden = !(localError || s.error);
    $('startup-error').textContent = localError || s.error || '';
    for (const button of panel.querySelectorAll('[data-startup]')) {
      const action = button.dataset.startup;
      button.disabled = (pending && !['chat', 'signup', 'help', 'keys', 'tunnels', 'plugins'].includes(action))
        || (s.busy && ['check', 'install-git', 'configure-tunnel', 'continue'].includes(action));
    }
    $('startup-continue').disabled ||= !logged || !ready;
  }
  async function perform(action) {
    if (pending && !['chat', 'signup', 'help', 'keys', 'tunnels', 'plugins'].includes(action)) return;
    signup = action === 'signup' || signup;
    pending = true; localError = null; if (current) render(current);
    try {
      const result = await api.startup(action);
      if (result?.ok === false) { localError = result.error?.message || 'Не удалось выполнить шаг. Повторите попытку.'; return; }
      if (result?.state) render(result.state);
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
