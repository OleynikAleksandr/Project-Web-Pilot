const CHATGPT_ORIGIN = 'https://chatgpt.com';

// Runs inside the visible ChatGPT document. It uses only DOM scrolling/events and does not call ChatGPT internals.
export function installAutoScrollPage({ forceFollow = false } = {}) {
  const stateKey = '__webPilotConversationAutoScroll';
  const previous = window[stateKey];
  if (previous?.version === 2 && typeof previous.refresh === 'function') {
    if (forceFollow) previous.resume();
    else previous.refresh();
    return previous.snapshot();
  }
  previous?.disconnect?.();

  const threshold = 32;
  const editorSelector = '#prompt-textarea,textarea[data-testid="prompt-textarea"],[data-testid="composer-text-input"],[contenteditable="true"][role="textbox"]';
  const sendSelector = '[data-testid="send-button"],button[aria-label="Send prompt"],button[aria-label="Send message"],button[aria-label="Отправить сообщение"],button[aria-label="Отправить"]';
  const messageSelector = '[data-message-author-role="user"],[data-message-author-role="assistant"],[data-testid="user-message"],[data-testid="assistant-message"]';
  let following = true;
  let target = null;
  let scheduled = false;
  let observer = null;
  let routeKey = location.pathname;
  let userScrollIntentUntil = 0;

  const rootScroller = () => document.scrollingElement || document.documentElement;
  const maxScrollTop = element => Math.max(0, (element?.scrollHeight ?? 0) - (element?.clientHeight ?? 0));
  const atBottom = element => !!element && maxScrollTop(element) - (element.scrollTop ?? 0) <= threshold;
  const scrollable = element => {
    if (!element) return false;
    if (element === rootScroller()) return true;
    const style = getComputedStyle(element);
    return /(auto|scroll|overlay)/.test(style.overflowY) && (element.scrollHeight ?? 0) > (element.clientHeight ?? 0) + 1;
  };
  const nearestScroller = anchor => {
    for (let element = anchor; element && element !== document.body; element = element.parentElement) {
      if (scrollable(element)) return element;
    }
    return null;
  };
  const findTarget = () => {
    const messages = document.querySelectorAll(messageSelector);
    const lastMessage = messages[messages.length - 1] ?? null;
    const editor = document.querySelector(editorSelector);
    return nearestScroller(lastMessage) || nearestScroller(editor) || rootScroller();
  };

  const markUserScrollIntent = () => { userScrollIntentUntil = Date.now() + 1500; };
  const hasUserScrollIntent = () => Date.now() <= userScrollIntentUntil;
  const onScroll = () => {
    if (!target) return;
    if (atBottom(target)) {
      following = true;
      return;
    }
    if (hasUserScrollIntent()) {
      following = false;
      return;
    }
    // ChatGPT may restore a remembered scrollTop after load. That is not a request to read history.
    if (following) scheduleFollow();
  };
  const bindTarget = () => {
    const next = findTarget();
    if (next === target) return target;
    target?.removeEventListener('scroll', onScroll);
    target = next;
    target?.addEventListener('scroll', onScroll, { passive: true });
    return target;
  };
  const scrollNow = () => {
    scheduled = false;
    if (!following) return;
    const element = bindTarget();
    if (!element) return;
    const top = maxScrollTop(element);
    if (Math.abs((element.scrollTop ?? 0) - top) <= 1) return;
    try {
      if (typeof element.scrollTo === 'function') element.scrollTo({ top, left: element.scrollLeft ?? 0, behavior: 'auto' });
      else element.scrollTop = top;
    } catch { element.scrollTop = top; }
  };
  const scheduleFollow = () => {
    if (scheduled || !following) return;
    scheduled = true;
    requestAnimationFrame(() => requestAnimationFrame(scrollNow));
  };
  const resume = () => {
    userScrollIntentUntil = 0;
    following = true;
    bindTarget();
    scheduleFollow();
  };
  const refresh = () => {
    const nextRouteKey = location.pathname;
    if (nextRouteKey !== routeKey) {
      routeKey = nextRouteKey;
      userScrollIntentUntil = 0;
      following = true;
    }
    bindTarget();
    scheduleFollow();
  };
  const snapshot = () => ({ installed: true, following, atBottom: atBottom(target) });

  const isComposerTarget = node => !!node?.closest?.(editorSelector);
  const onClick = event => {
    if (event.target?.closest?.(sendSelector)) resume();
  };
  const onKeyDown = event => {
    if (event.key === 'Enter' && !event.shiftKey && !event.altKey && !event.ctrlKey && !event.metaKey
        && !event.isComposing && isComposerTarget(event.target)) {
      resume();
      return;
    }
    if (!isComposerTarget(event.target)
        && ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) markUserScrollIntent();
  };
  const onWheel = () => markUserScrollIntent();
  const onTouch = () => markUserScrollIntent();
  const onPointerDown = event => {
    const element = bindTarget();
    if (element && (event.target === element || element.contains?.(event.target))) markUserScrollIntent();
  };
  const onPointerMove = event => { if (event.buttons) markUserScrollIntent(); };
  const onSubmit = event => {
    if (event.target?.querySelector?.(editorSelector)) resume();
  };
  const onResize = () => { if (following) scheduleFollow(); };

  observer = new MutationObserver(() => {
    bindTarget();
    if (following) scheduleFollow();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
  document.addEventListener('click', onClick, true);
  document.addEventListener('keydown', onKeyDown, true);
  document.addEventListener('wheel', onWheel, { capture: true, passive: true });
  document.addEventListener('touchstart', onTouch, { capture: true, passive: true });
  document.addEventListener('touchmove', onTouch, { capture: true, passive: true });
  document.addEventListener('pointerdown', onPointerDown, true);
  document.addEventListener('pointermove', onPointerMove, true);
  document.addEventListener('submit', onSubmit, true);
  window.addEventListener('resize', onResize, { passive: true });

  const controller = {
    version: 2,
    resume,
    refresh,
    snapshot,
    disconnect: () => {
      observer?.disconnect();
      target?.removeEventListener('scroll', onScroll);
      document.removeEventListener('click', onClick, true);
      document.removeEventListener('keydown', onKeyDown, true);
      document.removeEventListener('wheel', onWheel, true);
      document.removeEventListener('touchstart', onTouch, true);
      document.removeEventListener('touchmove', onTouch, true);
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('pointermove', onPointerMove, true);
      document.removeEventListener('submit', onSubmit, true);
      window.removeEventListener('resize', onResize);
      if (window[stateKey] === controller) delete window[stateKey];
    },
  };
  window[stateKey] = controller;
  bindTarget();
  if (forceFollow) following = true;
  scheduleFollow();
  return snapshot();
}

export function autoScrollPageScript(options = {}) {
  return `(${installAutoScrollPage.toString()})(${JSON.stringify(options)})`;
}

export async function installChatGPTAutoScroll(contents, { forceFollow = false } = {}) {
  if (!contents || contents.isDestroyed?.()) return null;
  let url;
  try { url = new URL(contents.getURL()); } catch { return null; }
  if (url.origin !== CHATGPT_ORIGIN) return null;
  return contents.executeJavaScript(autoScrollPageScript({ forceFollow }), true).catch(() => null);
}
