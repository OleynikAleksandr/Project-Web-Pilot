export function projectArchiveView(action) {
  const $ = id => document.getElementById(id);
  let state, pending = false, lastList = '', token = null;
  const selected = () => state?.archives.find(p => p.workspace === state.settings?.workspace);
  $('open-settings').addEventListener('click', () => action(state?.settings ? 'closeSettings' : 'openSettings'));
  $('close-settings').addEventListener('click', () => action('closeSettings'));
  $('theme-light').addEventListener('click', () => action('setTheme', 'light'));
  $('theme-dark').addEventListener('click', () => action('setTheme', 'dark'));
  $('restore-project').addEventListener('click', () => action('restoreProject', selected()?.workspace));
  $('preview-delete').addEventListener('click', () => action('previewDelete', selected()?.workspace));
  $('cancel-delete').addEventListener('click', () => action('cancelDelete'));
  $('recover-deletions').addEventListener('click', () => action('recoverDeletions'));
  $('delete-form').addEventListener('submit', event => { event.preventDefault(); if (!$('delete-project').disabled) action('deleteProject', state?.settings?.deletion?.token, $('delete-confirmation').value); });
  $('delete-confirmation').addEventListener('input', () => updateConfirm());
  function updateConfirm() { $('delete-project').disabled = pending || $('delete-confirmation').value !== state?.settings?.deletion?.name; }
  function render(next, actionPending) {
    state = next; pending = actionPending;
    const theme = state.theme === 'dark' ? 'dark' : 'light';
    document.documentElement.dataset.theme = theme;
    $('theme-light').setAttribute('aria-pressed', String(theme === 'light'));
    $('theme-dark').setAttribute('aria-pressed', String(theme === 'dark'));
    $('theme-light').disabled = pending; $('theme-dark').disabled = pending;
    const settings = state.settings;
    $('settings-panel').hidden = !settings; $('active-projects').hidden = !!settings;
    $('open-settings').setAttribute('aria-pressed', String(!!settings));
    $('open-settings').disabled = pending || !!state.setup || state.storageError;
    if (!settings) { token = null; return; }
    $('setup-panel').hidden = true; $('workspace-details').hidden = true; $('context-card').hidden = true;
    const listKey = JSON.stringify([state.archives, settings.workspace]);
    if (listKey !== lastList) {
      lastList = listKey;
      $('archive-list').replaceChildren(...state.archives.map(project => {
        const li = document.createElement('li'), button = document.createElement('button');
        button.dataset.archiveWorkspace = project.workspace; button.setAttribute('aria-pressed', String(settings.workspace === project.workspace));
        const name = document.createElement('strong'); name.textContent = project.name;
        const detail = document.createElement('small'); detail.textContent = `${new Date(project.archivedAt).toLocaleDateString('ru-RU')} · сессий: ${project.sessionCount}`;
        button.append(name, detail); button.addEventListener('click', () => action('selectArchive', project.workspace)); li.append(button); return li;
      }));
    }
    for (const button of $('archive-list').querySelectorAll('button')) button.disabled = pending;
    $('archive-empty').hidden = state.archives.length > 0;
    $('settings-notice').hidden = !settings.notice; $('settings-notice').textContent = settings.notice ?? '';
    const project = selected(), preview = settings.deletion;
    $('archive-detail').hidden = !project;
    if (!project) return;
    $('archive-name').textContent = project.name; $('archive-path').textContent = project.workspace;
    $('archive-meta').textContent = preview ? (preview.missing ? `Папка уже отсутствует · локальных сессий: ${project.sessionCount}`
      : `${preview.files.toLocaleString('ru-RU')} файлов · ${(preview.bytes / 1024 / 1024).toLocaleString('ru-RU', { maximumFractionDigits: 1 })} МБ · сессий: ${project.sessionCount}`)
      : project.deletionPending ? 'Удаление было подтверждено. Нужно завершить локальную очистку.' : `Сохранённых сессий: ${project.sessionCount}`;
    $('archive-actions').hidden = !!preview && !project.deletionPending;
    $('restore-project').hidden = project.deletionPending; $('preview-delete').hidden = project.deletionPending;
    $('recover-deletions').hidden = !project.deletionPending;
    $('delete-form').hidden = !preview || project.deletionPending;
    if (preview) {
      $('delete-note').textContent = preview.missing ? 'Будут удалены все локальные записи этого проекта и его сессий.' : 'Папка по указанному пути и всё её содержимое будут удалены с диска без корзины. Локальная история всех сессий тоже будет удалена.';
      if (token !== preview.token) { token = preview.token; $('delete-confirmation').value = ''; if (!pending) queueMicrotask(() => $('delete-confirmation').focus()); }
      $('delete-confirmation').disabled = pending; updateConfirm();
    } else token = null;
  }
  return { render };
}
