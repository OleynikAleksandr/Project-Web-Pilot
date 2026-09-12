const $ = id => document.getElementById(id);
const api = window.webPilotArchive;
let state = null, pending = false, anchor = null;
const selected = new Set();

function selectedItems() {
  const map = new Map((state?.archives ?? []).map(project => [project.workspace, project]));
  return [...selected].map(workspace => map.get(workspace)).filter(Boolean)
    .map(({ workspace, projectId }) => ({ workspace, projectId }));
}

async function action(method, ...args) {
  if (pending) return;
  pending = true; render();
  try {
    const response = await api[method](...args);
    if (response?.state) state = response.state;
    if (response?.ok === false) throw new Error(response.error?.message ?? 'Операция архива не выполнена.');
  } catch (error) {
    state = { ...(state ?? { archives: [] }), notice: error.message };
  } finally { pending = false; render(); }
}

function choose(project, index, event) {
  const projects = state.archives;
  if (event.shiftKey && anchor !== null) {
    const anchorIndex = projects.findIndex(item => item.workspace === anchor);
    if (anchorIndex >= 0) {
      const range = projects.slice(Math.min(anchorIndex, index), Math.max(anchorIndex, index) + 1).map(item => item.workspace);
      if (!(event.metaKey || event.ctrlKey)) selected.clear();
      for (const workspace of range) selected.add(workspace);
    }
  } else if (event.metaKey || event.ctrlKey) {
    if (selected.has(project.workspace)) selected.delete(project.workspace); else selected.add(project.workspace);
    anchor = project.workspace;
  } else {
    selected.clear(); selected.add(project.workspace); anchor = project.workspace;
  }
  if (!selected.size) anchor = null;
  render();
}

function render(next = state) {
  if (next) state = next;
  if (!state) return;
  document.documentElement.dataset.theme = state.theme === 'dark' ? 'dark' : 'light';
  const valid = new Set(state.archives.map(project => project.workspace));
  for (const workspace of [...selected]) if (!valid.has(workspace)) selected.delete(workspace);
  if (!selected.size && state.focusWorkspace && valid.has(state.focusWorkspace)) {
    selected.add(state.focusWorkspace); anchor = state.focusWorkspace;
  }
  if (state.deletion?.workspace && valid.has(state.deletion.workspace)) {
    selected.clear(); selected.add(state.deletion.workspace); anchor = state.deletion.workspace;
  }
  const fragment = document.createDocumentFragment();
  if (!state.archives.length) {
    const empty = document.createElement('li'); empty.className = 'empty'; empty.textContent = 'Архив пуст.'; fragment.append(empty);
  } else state.archives.forEach((project, index) => {
    const item = document.createElement('li'); item.className = 'item' + (selected.has(project.workspace) ? ' selected' : '');
    item.dataset.workspace = project.workspace; item.setAttribute('role', 'option'); item.setAttribute('aria-selected', String(selected.has(project.workspace)));
    item.tabIndex = 0;
    const name = document.createElement('strong'); name.textContent = project.name;
    const detail = document.createElement('small');
    detail.textContent = `${project.workspace} · ${new Date(project.archivedAt).toLocaleDateString('ru-RU')} · сессий: ${project.sessionCount}` + (project.deletionPending ? ' · удаление ожидает завершения' : '');
    item.append(name, detail);
    item.addEventListener('click', event => choose(project, index, event));
    item.addEventListener('keydown', event => { if (event.key === ' ' || event.key === 'Enter') { event.preventDefault(); choose(project, index, event); } });
    fragment.append(item);
  });
  $('archive-list').replaceChildren(fragment);
  const picked = state.archives.filter(project => selected.has(project.workspace));
  const blocked = picked.some(project => project.deletionPending);
  $('restore').disabled = pending || !picked.length || blocked;
  $('forget').disabled = pending || !picked.length || blocked;
  $('delete').disabled = pending || picked.length !== 1 || blocked;
  $('recover').hidden = !picked.some(project => project.deletionPending);
  $('recover').disabled = pending;
  $('notice').hidden = !state.notice; $('notice').textContent = state.notice ?? '';
  const preview = state.deletion;
  $('delete-panel').hidden = !preview;
  if (preview) {
    $('delete-name').textContent = preview.name;
    $('delete-path').textContent = preview.workspace;
    $('delete-meta').textContent = preview.missing ? `Папка отсутствует · локальных сессий: ${preview.sessionCount}`
      : `${preview.files.toLocaleString('ru-RU')} файлов · ${(preview.bytes / 1024 / 1024).toLocaleString('ru-RU', { maximumFractionDigits: 1 })} МБ · сессий: ${preview.sessionCount}`;
    if ($('delete-confirmation').dataset.token !== preview.token) { $('delete-confirmation').dataset.token = preview.token; $('delete-confirmation').value = ''; }
    $('delete-confirmation').disabled = pending;
    $('confirm-delete').disabled = pending || $('delete-confirmation').value !== preview.name;
  } else { $('delete-confirmation').dataset.token = ''; $('delete-confirmation').value = ''; }
}

$('restore').addEventListener('click', () => action('restore', selectedItems()));
$('forget').addEventListener('click', () => action('forget', selectedItems()));
$('delete').addEventListener('click', () => { const [item] = selectedItems(); if (item) action('previewDelete', item); });
$('recover').addEventListener('click', () => action('recoverDeletions'));
$('cancel-delete').addEventListener('click', () => action('cancelDelete'));
$('delete-confirmation').addEventListener('input', () => render());
$('confirm-delete').addEventListener('click', () => { if (state?.deletion) action('deleteProject', state.deletion.token, $('delete-confirmation').value); });
$('close').addEventListener('click', () => api.close());
api.onState(render);
api.getState().then(render).catch(error => { state = { archives: [], notice: error.message }; render(); });
