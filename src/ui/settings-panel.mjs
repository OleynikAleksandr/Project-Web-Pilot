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
  $('mac-runtime-local').addEventListener('click', () => action('setMacRuntimeMode', 'local'));
  $('mac-runtime-app-server').addEventListener('click', () => action('setMacRuntimeMode', 'app-server'));
  $('chatgpt-channel-secure').addEventListener('click', () => action('setChatgptChannel', 'secure-tunnel'));
  $('chatgpt-channel-vps').addEventListener('click', () => action('setChatgptChannel', 'vps'));
  $('chatgpt-channel-refresh').addEventListener('click', () => action('refreshChatgptChannel'));
  $('vps-connector-copy').addEventListener('click', () => action('copyVpsConnectorUrl'));
  $('configure-windows-tunnel').addEventListener('click', () => action('configureWindowsTunnel'));
  $('refresh-windows-runtime').addEventListener('click', () => action('refreshWindowsRuntime'));
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
    const isMac = state.platform === 'darwin';
    const macSection = $('mac-runtime-section');
    macSection.hidden = !isMac;
    if (isMac) {
      const macRuntime = state.macRuntime ?? { mode: 'local', label: 'Codex Local Mac', service: null };
      const appServer = macRuntime.mode === 'app-server';
      $('mac-runtime-local').setAttribute('aria-pressed', String(!appServer));
      $('mac-runtime-app-server').setAttribute('aria-pressed', String(appServer));
      $('mac-runtime-local').disabled = pending;
      $('mac-runtime-app-server').disabled = pending;
      const service = macRuntime.service;
      const viaVps = macRuntime.chatgptChannel === 'vps';
      const ready = !!service?.mcpReady && !!service?.tunnelReady && !!service?.tunnelConfigured;
      $('mac-runtime-status').textContent = ready
        ? `Активен: ${macRuntime.label}. MCP и ${viaVps ? 'канал VPS' : 'Secure MCP Tunnel'} готовы.`
        : `Выбран: ${macRuntime.label}. Службы ещё не подтвердили полную готовность.`;
      const vps = macRuntime.vps ?? null;
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
    const isWindows = state.platform === 'win32';
    const windowsSection = $('windows-runtime-section');
    windowsSection.hidden = !isWindows;
    if (isWindows) {
      const runtime = state.windowsRuntime ?? { phase: 'embedded', installed: false, service: null };
      const ready = !!runtime.service?.mcpReady && !!runtime.service?.tunnelReady && !!runtime.service?.tunnelConfigured;
      const tunnelUnconfigured = runtime.installed && runtime.service && !runtime.service.tunnelConfigured;
      let uiState = ready ? 'ready' : tunnelUnconfigured ? 'tunnel-unconfigured' : runtime.installed ? 'installed' : runtime.phase ?? 'embedded';
      const working = ['verifying', 'extracting', 'installing'].includes(runtime.phase);
      const labels = {
        embedded: 'Встроенный runtime готов к установке.',
        verifying: 'Проверяем встроенный Windows runtime…',
        extracting: 'Распаковываем Windows runtime в профиль пользователя…',
        installing: 'Устанавливаем локальный Python, Git и MCP. Это может занять несколько минут…',
        installed: 'Windows runtime установлен. Настройте tunnel или нажмите «Проверить».',
        'tunnel-unconfigured': 'Windows runtime установлен, но Secure MCP Tunnel ещё не настроен.',
        ready: 'Windows runtime и Secure MCP Tunnel готовы к работе.',
        error: 'Не удалось подготовить Windows runtime. Повторите проверку.',
      };
      $('windows-runtime-status').dataset.state = uiState;
      $('windows-runtime-status').textContent = labels[uiState] ?? labels.installed;
      $('configure-windows-tunnel').textContent = runtime.installed ? 'Настроить tunnel…' : 'Установить и настроить tunnel…';
      $('configure-windows-tunnel').disabled = pending || working;
      $('refresh-windows-runtime').disabled = pending || working;
    }
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