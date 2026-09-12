export function projectArchiveView(action) {
  const $ = id => document.getElementById(id);
  const archiveButton = document.createElement('button');
  archiveButton.id = 'open-archive-window'; archiveButton.type = 'button'; archiveButton.className = 'secondary';
  archiveButton.textContent = 'Архив проектов…'; archiveButton.style.width = '100%'; archiveButton.style.marginTop = '10px';
  $('archive-list').before(archiveButton);
  for (const id of ['archive-empty', 'archive-list', 'archive-detail', 'settings-notice']) $(id).hidden = true;
  archiveButton.addEventListener('click', () => action('openArchive'));
  $('open-settings').addEventListener('click', () => action(state?.settings ? 'closeSettings' : 'openSettings'));
  $('close-settings').addEventListener('click', () => action('closeSettings'));
  $('theme-light').addEventListener('click', () => action('setTheme', 'light'));
  $('theme-dark').addEventListener('click', () => action('setTheme', 'dark'));
  $('tool-calls-hide').addEventListener('click', () => action('setHideToolCalls', true));
  $('tool-calls-show').addEventListener('click', () => action('setHideToolCalls', false));
  $('configure-windows-tunnel').addEventListener('click', () => action('configureWindowsTunnel'));
  $('refresh-windows-runtime').addEventListener('click', () => action('refreshWindowsRuntime'));
  let state;
  function render(next, pending) {
    state = next;
    const theme = state.theme === 'dark' ? 'dark' : 'light';
    document.documentElement.dataset.theme = theme;
    $('theme-light').setAttribute('aria-pressed', String(theme === 'light'));
    $('theme-dark').setAttribute('aria-pressed', String(theme === 'dark'));
    $('theme-light').disabled = pending; $('theme-dark').disabled = pending;
    $('tool-calls-hide').setAttribute('aria-pressed', String(state.hideToolCalls));
    $('tool-calls-show').setAttribute('aria-pressed', String(!state.hideToolCalls));
    $('tool-calls-hide').disabled = pending; $('tool-calls-show').disabled = pending;
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
        'tunnel-setup-launched': 'Открыта консоль настройки tunnel. После завершения нажмите «Проверить».',
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
    $('open-settings').disabled = pending || !!state.setup || state.storageError;
    archiveButton.disabled = pending;
    if (!settings) return;
    $('setup-panel').hidden = true; $('workspace-details').hidden = true; $('context-card').hidden = true;
  }
  return { render };
}
