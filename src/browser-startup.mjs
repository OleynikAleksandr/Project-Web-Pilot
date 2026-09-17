const failure = (code, message, fields = {}) => Object.assign(new Error(message), { code, ...fields });
const superseded = () => failure('NAVIGATION_SUPERSEDED', 'Открыта другая страница.');

function firstDocument(contents, url, isCurrent, timeoutMs) {
  return new Promise((resolve, reject) => {
    let finished = false, documentStarted = false;
    const settle = error => {
      if (finished) return;
      finished = true;
      clearTimeout(deadline); clearInterval(currentTimer);
      contents.removeListener('dom-ready', ready);
      contents.removeListener('did-frame-navigate', navigated);
      error ? reject(error) : resolve();
    };
    const ready = () => {
      if (!isCurrent()) settle(superseded());
      else if (contents.getURL() && contents.getURL() !== 'about:blank') settle();
    };
    const navigated = (_event, _url, _status, _text, main) => { if (main && _url && _url !== 'about:blank') documentStarted = true; };
    const deadline = setTimeout(() => settle(isCurrent()
      ? failure(documentStarted ? 'PAGE_DOCUMENT_TIMEOUT' : 'PAGE_RESPONSE_TIMEOUT',
        'Не удалось дождаться страницы ChatGPT.', { documentStarted })
      : superseded()), timeoutMs);
    const currentTimer = setInterval(() => { if (!isCurrent()) settle(superseded()); }, 50);
    contents.on('dom-ready', ready);
    contents.on('did-frame-navigate', navigated);
    try { Promise.resolve(contents.loadURL(url)).then(ready, settle); }
    catch (error) { settle(error); }
  });
}

async function resetConnection(contents, isCurrent, timeoutMs) {
  let deadline, active = true;
  const reset = async () => {
    if (!active || !isCurrent()) throw superseded();
    await contents.session.closeAllConnections();
    if (!active || !isCurrent()) throw superseded();
    await contents.session.clearHostResolverCache();
    if (!active || !isCurrent()) throw superseded();
  };
  try {
    await Promise.race([reset(), new Promise((_, reject) => {
      deadline = setTimeout(() => reject(failure('PAGE_CONNECTION_RESET_TIMEOUT',
        'Не удалось восстановить соединение с ChatGPT.')), timeoutMs);
    })]);
  } finally { active = false; clearTimeout(deadline); }
}

/** First opening into an empty view. Existing chats keep their navigation contract. */
export async function openStartupPage(contents, url, {
  isCurrent = () => true, onRecovery = () => {}, timeoutMs = 15000, resetTimeoutMs = 5000,
} = {}) {
  for (let attempt = 0; attempt < 2; attempt++) {
    if (!isCurrent()) throw superseded();
    try {
      await firstDocument(contents, url, isCurrent, timeoutMs);
      return { recovered: attempt > 0 };
    } catch (error) {
      if (!isCurrent()) throw superseded();
      if (error.code !== 'PAGE_RESPONSE_TIMEOUT') throw error;
      // Never interrupt a document that has already appeared.
      if (contents.getURL()) throw error;
      contents.stop();
      if (attempt > 0) throw error;
      onRecovery();
      await resetConnection(contents, isCurrent, resetTimeoutMs);
    }
  }
}
