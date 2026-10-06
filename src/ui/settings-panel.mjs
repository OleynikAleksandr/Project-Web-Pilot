import { projectDoctorView } from './project-doctor.mjs';

function vpsLine(vps) {
  if (!vps) return 'Состояние VPS ещё не проверено.';
  if (!vps.configured) return 'Свой сервер не настроен.';
  if (vps.conflict) return 'В ~/.ssh/config у vps-mcp-tunnel остался RemoteForward — обновите настройку сервера.';
  if (vps.error) return 'Туннель VPS: ' + vps.error;
  if (vps.ready) return `Туннель VPS работает: сервер → MCP на порту ${vps.mcpPort}.`;
  if (vps.running && !vps.portMatches) return `Туннель VPS ведёт на порт ${vps.forwardPort ?? '—'}, а MCP работает на ${vps.mcpPort ?? '—'}.`;
  const last = vps.lastError ? ` Последняя ошибка (${new Date(vps.lastError.at).toLocaleString('ru-RU')}): ${vps.lastError.message}` : '';
  return 'Туннель VPS не запущен.' + last;
}
export function settingsPanelView(action) {
  const $ = id => document.getElementById(id);
  const doctor = projectDoctorView(action);
  const archiveButton = document.createElement('button');
  archiveButton.id = 'open-archive-window'; archiveButton.type = 'button'; archiveButton.className = 'secondary';
  archiveButton.textContent = 'Архив…'; archiveButton.style.width = '100%'; archiveButton.style.marginTop = '10px';
  $('settings-panel').append(archiveButton);
  archiveButton.addEventListener('click', () => action('openArchive'));
  $('open-chat-colors').addEventListener('click', () => action('openChatColors'));
  $('open-settings').addEventListener('click', () => action(state?.settings ? 'closeSettings' : 'openSettings'));
  $('close-settings').addEventListener('click', () => action('closeSettings'));
  $('theme-light').addEventListener('click', () => action('setTheme', 'light'));
  $('theme-dark').addEventListener('click', () => action('setTheme', 'dark'));
  $('tool-calls-hide').addEventListener('click', () => action('setHideToolCalls', true));
  $('tool-calls-show').addEventListener('click', () => action('setHideToolCalls', false));
  $('chatgpt-channel-secure').addEventListener('click', () => action('setChatgptChannel', 'secure-tunnel'));
  $('chatgpt-channel-vps').addEventListener('click', () => action('setChatgptChannel', 'vps'));
  $('chatgpt-channel-refresh').addEventListener('click', () => action('refreshChatgptChannel'));
  $('vps-connector-copy').addEventListener('click', () => action('copyVpsConnectorUrl'));
  let state;
  function render(next, pending) {
    state = next;
    doctor.render(state, pending);
    const theme = state.theme === 'dark' ? 'dark' : 'light';
    document.documentElement.dataset.theme = theme;
    $('theme-light').setAttribute('aria-pressed', String(theme === 'light'));
    $('theme-dark').setAttribute('aria-pressed', String(theme === 'dark'));
    $('theme-light').disabled = pending; $('theme-dark').disabled = pending;
    $('tool-calls-hide').setAttribute('aria-pressed', String(state.hideToolCalls));
    $('tool-calls-show').setAttribute('aria-pressed', String(!state.hideToolCalls));
    $('tool-calls-hide').disabled = pending; $('tool-calls-show').disabled = pending;
    // One section for both systems: the same executor, the same services, the same states.
    const isMac = state.platform === 'darwin', isWindows = state.platform === 'win32';
    const system = isWindows ? 'Windows' : 'macOS';
    $('local-runtime-section').hidden = !isMac && !isWindows;
    if (isMac || isWindows) {
      const localRuntime = state.localRuntime ?? { label: `Codex App Server Local ${isWindows ? 'Windows' : 'Mac'}`, service: null };
      const service = localRuntime.service;
      const viaVps = localRuntime.chatgptChannel === 'vps';
      const ready = !!service?.mcpReady && !!service?.tunnelReady && !!service?.tunnelConfigured;
      $('local-runtime-title').textContent = `Локальные инструменты ${system}`;
      $('local-runtime-help').textContent = `Web Pilot сам устанавливает и запускает локальный MCP. Он запускается при входе в ${system} и при открытии Web Pilot.`;
      $('local-runtime-status').textContent = ready
        ? `${localRuntime.label}: MCP и ${viaVps ? 'канал VPS' : 'Secure MCP Tunnel'} готовы.`
        : `${localRuntime.label}: службы ещё не подтвердили полную готовность.`;
    }
    if (isMac) {
      const localRuntime = state.localRuntime ?? { service: null };
      const service = localRuntime.service;
      const viaVps = localRuntime.chatgptChannel === 'vps';
      const vps = localRuntime.vps ?? null;
      $('chatgpt-channel-secure').setAttribute('aria-pressed', String(!viaVps));
      $('chatgpt-channel-vps').setAttribute('aria-pressed', String(viaVps));
      $('chatgpt-channel-secure').disabled = pending;
      // Switching to VPS needs a working tunnel; switching back is always possible.
      $('chatgpt-channel-vps').disabled = pending || (!viaVps && !vps?.ready);
      $('chatgpt-channel-refresh').disabled = pending;
      $('chatgpt-channel-status').textContent = viaVps
        ? (service?.tunnelReady ? 'ChatGPT подключается через VPS. Канал готов.' : 'Выбран VPS. Канал ещё не готов — состояние ниже.')
        : (service?.tunnelReady ? 'ChatGPT подключается через Secure MCP Tunnel. Туннель готов.' : 'Выбран Secure MCP Tunnel. Туннель ещё не подтвердил готовность.');
      // The ChatGPT side is a separate plugin per channel; Web Pilot cannot switch it.
      $('chatgpt-channel-hint').textContent = viaVps
        ? 'В ChatGPT включите плагин с адресом своего сервера, а плагин Secure MCP Tunnel отключите.'
        : 'В ChatGPT включите плагин Secure MCP Tunnel, а плагин с адресом своего сервера отключите.';
      $('vps-status').textContent = vpsLine(vps);
      $('vps-status').dataset.ready = String(!!vps?.ready);
      $('vps-connector').hidden = !vps?.connector;
      $('vps-connector-url').textContent = vps?.connector ?? '';
      $('vps-connector-copy').disabled = pending;
    }
    $('chatgpt-channel-section').hidden = !isMac;
    const settings = state.settings;
    $('settings-panel').hidden = !settings; $('active-projects').hidden = !!settings;
    $('open-settings').setAttribute('aria-pressed', String(!!settings));
    $('open-settings').disabled = pending || state.storageError;
    archiveButton.disabled = pending;
    $('open-chat-colors').disabled = pending;
    if (!settings) return;
    $('setup-panel').hidden = true; $('workspace-details').hidden = true; $('context-card').hidden = true;
  }
  return { render };
}