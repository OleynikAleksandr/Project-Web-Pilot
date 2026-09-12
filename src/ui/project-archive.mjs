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
