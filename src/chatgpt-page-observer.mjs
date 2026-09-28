// DOM-only observer; bundled with the same adapter used by composer.inspect.
export function installPageObserver(dom, send) {
  const documentId = crypto.randomUUID();
  Object.defineProperty(globalThis, '__webPilotObserverDocumentId', { value: documentId });
  let seq = 0, draftRevision = 0, userMessagesRevision = 0, editorRevision = 0;
  let editorIdentity = null, pending = false, lastSignature = '', live = true;
  const loginSelector = '[data-testid="login-button"],[data-testid="signup-button"],a[href="/auth/login"],a[href="https://chatgpt.com/auth/login"]';
  const profileSelector = '[data-testid="profile-button"],[data-testid="accounts-profile-button"],[data-testid="user-menu-button"],button[aria-label="Open Profile Menu"],button[aria-label="Открыть меню профиля"]';
  const snapshot = () => {
    const editor = dom.editor() ?? null;
    if (editor !== editorIdentity) { editorIdentity = editor; editorRevision++; draftRevision++; }
    const button = dom.sendButton();
    const login = dom.first(loginSelector) ? 'signed-out' : dom.first(profileSelector) ? 'signed-in' : 'unknown';
    return {
      url: location.href, experience: dom.experience(), login,
      visibility: document.visibilityState,
      editorAvailable: !!editor, editorRevision,
      writable: !!editor && !editor.disabled && !editor.readOnly && editor.getAttribute('contenteditable') !== 'false',
      busy: dom.busy(), sendEnabled: !!button && !button.disabled && button.getAttribute('aria-disabled') !== 'true',
      draftRevision, userMessageCount: dom.messages('user').length, userMessagesRevision,
    };
  };
  const emit = () => {
    pending = false;
    if (!live || location.origin !== 'https://chatgpt.com') return;
    const state = snapshot(), signature = JSON.stringify(state);
    if (signature === lastSignature) return;
    lastSignature = signature;
    send({ version: 1, documentId, seq: ++seq, state });
  };
  const schedule = () => { if (!pending) { pending = true; queueMicrotask(emit); } };
  const elementOf = node => node?.nodeType === 1 ? node : node?.parentElement;
  const inUser = node => !!elementOf(node)?.closest(dom.selectors.user);
  const containsUser = node => !!elementOf(node)?.matches(dom.selectors.user)
    || !!(node?.nodeType === 1 && node.querySelector(dom.selectors.user));
  const observer = new MutationObserver(records => {
    let draftChanged = false, usersChanged = false, relevant = false;
    for (const record of records) {
      const textChange = record.type === 'characterData' || record.type === 'childList';
      if (textChange && editorIdentity && (record.target === editorIdentity || editorIdentity.contains(record.target))) draftChanged = true;
      if (textChange && (inUser(record.target) || [...record.addedNodes, ...record.removedNodes].some(containsUser))) usersChanged = true;
      // Streaming assistant text alone is irrelevant to delivery and agent busy state.
      const inAssistant = elementOf(record.target)?.closest(dom.selectors.assistant);
      const onlyText = record.type === 'characterData' || (record.type === 'childList'
        && [...record.addedNodes, ...record.removedNodes].every(n => n.nodeType === 3));
      if (!(inAssistant && onlyText)) relevant = true;
    }
    if (draftChanged) draftRevision++;
    if (usersChanged) userMessagesRevision++;
    if (relevant || draftChanged || usersChanged) schedule();
  });
  const start = () => {
    observer.observe(document.documentElement, { subtree: true, childList: true, characterData: true, attributes: true,
      attributeFilter: ['disabled', 'readonly', 'contenteditable', 'aria-disabled', 'aria-hidden', 'hidden',
        'data-state', 'aria-checked', 'aria-pressed', 'class', 'style', 'data-testid', 'data-message-author-role'] });
    document.addEventListener('input', event => {
      if (editorIdentity && (event.target === editorIdentity || editorIdentity.contains(event.target))) { draftRevision++; schedule(); }
    }, true);
    document.addEventListener('change', schedule, true);
    document.addEventListener('visibilitychange', schedule);
    addEventListener('pageshow', schedule);
    addEventListener('resize', schedule);
    addEventListener('popstate', schedule);
    addEventListener('hashchange', schedule);
    // Navigation API observes main-world SPA changes from the isolated world too.
    globalThis.navigation?.addEventListener('currententrychange', schedule);
    emit();
  };
  if (document.documentElement) start();
  else addEventListener('DOMContentLoaded', start, { once: true });
  return () => { live = false; observer.disconnect(); };
}
