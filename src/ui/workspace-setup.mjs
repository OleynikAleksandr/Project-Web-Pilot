export function workspaceSetupView(action) {
  const $ = id => document.getElementById(id);
  let last = null, pending = false, formKey = '';
  $('create-workspace').addEventListener('click', () => action('beginCreate'));
  $('setup-parent-button').addEventListener('click', () => action('chooseParent', $('setup-name').value));
  $('setup-form').addEventListener('submit', event => { event.preventDefault(); action('previewNew', $('setup-name').value); });
  $('setup-cancel').addEventListener('click', () => action('cancelSetup'));
  $('setup-refresh').addEventListener('click', () => action('refreshSetup'));
  $('setup-apply').addEventListener('click', () => action('applySetup', last?.setup?.token, $('setup-git-name').value, $('setup-git-email').value));
  $('setup-experience-chat').addEventListener('click', () => action('setFirstSessionExperience', 'chat'));
  $('setup-experience-work').addEventListener('click', () => action('setFirstSessionExperience', 'work'));
  for (const id of ['setup-git-name', 'setup-git-email']) $(id).addEventListener('input', () => render(last, pending));
  function render(state, actionPending) {
    last = state; pending = actionPending;
    const setup = state.setup;
    $('setup-panel').hidden = !setup;
    $('projects').hidden = !!setup;
    $('context-card').hidden = !!setup;
    $('workspace-details').hidden = !!setup || !state.selected;
    if (!setup) { formKey = ''; return; }
    const busy = ['checking', 'applying'].includes(setup.phase);
    const form = setup.mode === 'new' && !setup.token && !setup.installed;
    $('setup-title').textContent = busy ? (setup.phase === 'checking' ? 'Проверяем папку' : 'Подготавливаем проект')
      : setup.ready ? 'Проект готов к открытию' : setup.mode === 'new' ? 'Новый проект' : 'Подключение проекта';
    $('setup-intro').textContent = busy ? 'Проверяем структуру, команды и контекст проекта. Это может занять несколько секунд.'
      : form ? 'Начните с имени и места для новой папки.'
      : setup.action === 'install' ? 'Добавим инструкции, документацию и план. Существующие файлы сохранятся.'
      : setup.action === 'reconnect' ? 'Восстановим локальные команды и проверки. План проекта сохранится.'
      : setup.action === 'upgrade' ? 'Обновим Workflow Kit до новой совместимой версии. План и пользовательские документы сохранятся.'
      : setup.ready ? 'Структура и полный контекст проверены. Можно продолжать работу в ChatGPT.'
      : 'Открытие приостановлено. Ниже указано, что нужно исправить.';
    $('setup-form').hidden = !form;
    if (form) {
      const key = `${setup.parent}\n${setup.name ?? ''}`;
      if (formKey !== key) { $('setup-name').value = setup.name ?? ''; formKey = key; }
      $('setup-parent').textContent = setup.parent;
      $('setup-name').disabled = busy || actionPending;
      if (setup.phase === 'form' && document.activeElement === document.body) queueMicrotask(() => $('setup-name').focus());
    }
    $('setup-path').hidden = !setup.workspace;
    $('setup-path').textContent = setup.workspace ?? '';
    $('setup-checks').replaceChildren(...(setup.checks ?? []).map(check => {
      const item = document.createElement('li'); item.textContent = `${check.ok ? '✓' : '○'} ${check.label}`; item.dataset.ok = String(check.ok); return item;
    }));
    $('setup-issues').replaceChildren(...(setup.issues ?? []).map(issue => {
      const item = document.createElement('li'); const title = document.createElement('strong'); title.textContent = issue.path;
      const detail = document.createElement('span'); detail.textContent = issue.reason; item.append(title, detail); return item;
    }));
    $('setup-error').hidden = !setup.error;
    $('setup-error').textContent = setup.error?.message ?? '';
    const warnings = [...(setup.warnings ?? [])];
    if (setup.initializeGit) warnings.push('Будет создана локальная история проекта.');
    if (setup.existingChanges?.length) warnings.push(`Есть исходные изменения (${setup.existingChanges.length}). Они останутся на месте и не будут автоматически включены в служебный коммит.`);
    $('setup-notes').textContent = warnings.join('\n\n'); $('setup-notes').hidden = !warnings.length;
    const files = setup.files ?? [];
    $('setup-files').hidden = !files.length;
    $('setup-file-summary').textContent = `Изменения в папке · ${files.length} файлов`;
    $('setup-file-list').replaceChildren(...files.map(file => { const item = document.createElement('li'); item.textContent = `${file.action}: ${file.path}`; return item; }));
    const identity = setup.action === 'install' && !setup.gitIdentityReady;
    $('setup-identity').hidden = !identity;
    const firstSession = !!setup.firstSessionRequired && !form;
    $('setup-experience').hidden = !firstSession;
    const experience = setup.firstSessionExperience === 'work' ? 'work' : 'chat';
    $('setup-experience-chat').setAttribute('aria-pressed', String(experience === 'chat'));
    $('setup-experience-work').setAttribute('aria-pressed', String(experience === 'work'));
    $('setup-experience-chat').disabled = busy || actionPending;
    $('setup-experience-work').disabled = busy || actionPending;
    $('setup-apply').hidden = !setup.action || busy || !!setup.error;
    $('setup-apply').textContent = { install: setup.mode === 'new' ? 'Создать и открыть' : 'Подготовить и открыть', reconnect: 'Восстановить и открыть', upgrade: 'Обновить и открыть', open: 'Открыть проект' }[setup.action] ?? 'Открыть проект';
    $('setup-apply').disabled = actionPending || (identity && (!$('setup-git-name').value.trim() || !$('setup-git-email').value.trim()));
    $('setup-refresh').hidden = busy || form || (!setup.installed && !setup.workspace);
    $('setup-cancel').textContent = busy ? 'Подождите…' : 'Отмена';
  }
  return { render };
}
