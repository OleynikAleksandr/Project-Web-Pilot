# Совместимость с интерфейсом ChatGPT

Адаптер видимого DOM `https://chatgpt.com`: страница и composer, вставка текста и вложений, Send, наблюдатель страницы, фильтр строк инструментов, автопрокрутка, CSS цветов, изоляция и разрешения, контракт Web Pilot Sidebar. Доставка и состояния попытки — [context-delivery.md](context-delivery.md); сессии, URL, названия — [workspace-sessions.md](workspace-sessions.md); окно цветов — [workspace-sidebar-ui.md](workspace-sidebar-ui.md); журнал — [chromium-diagnostics.md](chromium-diagnostics.md).

## Код

- `src/chatgpt-dom.mjs` (`CHATGPT_SELECTORS`, `createChatGPTDOM`, `chatGPTDOMScript`), `src/chatgpt-experience.mjs` (входы, `chatGPTExperienceForUrl`, `isPendingChatGPTConversation`), `src/chatgpt-composer.mjs` (`pageOperation`, `pageScript`, `ChatGPTComposer`; `ComposerError` внутренний).
- `src/chatgpt-page-observer.mjs` → генерируемый `resources/chatgpt-page-observer-preload.cjs` (`npm run stage:page-observer` в pre-хуках start/test/smoke/build; в `.gitignore`, руками не править); `src/page-state.mjs` (`PageStateSource`), `src/page-state-bridge.mjs` (`connectPageState`).
- `src/chatgpt-tool-filter.mjs`, `src/chatgpt-auto-scroll.mjs`, `src/chatgpt-colors.mjs` (`ChatColors`, `installComposerCapsule`); в `src/main.mjs` — `remotePreferences`, `permissionAllowed`, `secureRemote` и подключение всего перечисленного.

## Контракт

### Общие правила

- Только видимый DOM: cookies, storage, внутренние функции/React ChatGPT, модельные и аккаунтные API не используются (исключение вне адаптера — переименование разговора, [workspace-sessions.md](workspace-sessions.md)); контракт утверждён пользователем.
- Селекторы — граница совместимости: прежние и новые атрибуты, aria-label EN/RU. Неизвестная разметка не красится, не скрывается и не даёт права на Send, потому что разметка ChatGPT не публичный контракт; опора — семантические атрибуты, текст и геометрия, не классы; сторонних библиотек нет.

### Распознавание страницы

- `createChatGPTDOM(selectors)`: `visible`, `first`, `messages`, `editor`, `sendButton`, `busy`, `experience`, `modeButtons`, `modeOf`, `connectionError`. `messages(role)` — внешние узлы роли (вложенные — один раз), не в `pre`, `code`, contenteditable.
- `sendButton()` — селектор `send`, иначе видимый `button[type=submit]` формы редактора (живой Send `aria-label=Send` без `data-testid` — только так). `busy()` — видимый stop-контрол, без сетевых данных.
- `experience()` — нативные `button[data-tpp-toggle-value=chatgpt|work]`, fallback — кнопки группы режима с текстом Chat/Чат/Work/Работа; выбранная — `data-state=on`, `aria-checked` или `aria-pressed`; ровно один режим, иначе `null`.
- `connectionError()` — только error UI (alert, conversation-error, предки кнопок Retry/Повторить), не сообщения пользователя, `pre`, `code`, `blockquote`: «ChatGPT stream recovery polling timed out», «Resume stream unavailable», network error/connection lost (EN/RU) → `stream-interrupted`; реакция — ConversationRecovery.

### Входы и режим Chat/Work

- Входы `https://chatgpt.com/` и `https://chatgpt.com/work/`; без проекта — `/auth/login` ([first-run-onboarding.md](first-run-onboarding.md)). Принимаются только `https:` хоста `chatgpt.com` без порта и учётных данных.
- Work живёт на общем `/c/<id>`, поэтому режим сессии — сохранённый `session.experience`, не URL. `/c/WEB:<uuid>`, `/c/local-chatgpt:<uuid>` (и `%3A`) — временные URL после Send (`isPendingChatGPTConversation`), в `chatUrl` не сохраняются.
- С `expectedExperience` действия разрешены только на `/` или `/work` без сообщений (`CHAT_CHANGED`). `select-experience`: совпало → `experience-confirmed`; черновик → `DRAFT_PRESENT`; кнопки нет → `EXPERIENCE_UNCONFIRMED`; иначе нативный click → `experience-selecting`, подтверждение — новым наблюдением. Прочие действия при несовпадении → `EXPERIENCE_UNCONFIRMED`, черновик цел. Причина: ChatGPT помнит режим, `/` не доказывает Chat. Модель не выбирается.

### `pageOperation`

`pageOperation({ action, text, requestId, expectedExperience, diagnose, draftToken, attachments }, dom)` исполняется в странице; действия `inspect|fill|paste|attach|send|select-experience|clear-new-draft|clear-owned-draft`, иное → `INVALID_COMPOSER_ACTION`.

- Наблюдение: editor, вход, `busy`, `draftLength`, `draftMatches`, `sendEnabled`, `messageSeen` (requestId в сообщении user, не в цитате ассистента), число сообщений, режим, обрыв; с вложениями `attachmentsPresent|Failed|Ready`. Перед изменяющими действиями: `messageSeen` → `already-sent`, затем `CONNECTION_INTERRUPTED`, `LOGIN_REQUIRED`, `GENERATION_ACTIVE`.
- Вставка: textarea — нативный setter `value` + `input`/`change`; contenteditable — курсор в конец (`fill` → `paste-ready`, composer перепроверяет документ, затем `paste`) и один `ClipboardEvent('paste')` с `text/plain` и экранированным HTML (`data-pm-slice`): ProseMirror вставляет одной транзакцией, системный clipboard не трогается. Необработанная вставка → `PASTE_UNHANDLED` без запасного пути. Причина: `execCommand('insertText')`/`webContents.insertText` вставляли пакет десятки секунд и ломали переводы строк.
- С `requestId` точный восстановленный пакет переиспользуется, иначе текст дописывается к черновику; без `requestId` непустое поле → `DRAFT_PRESENT`. После своей вставки Send не зависит от `draftMatches` и правок пользователя (решение пользователя: дописанный ввод уходит вместе с контекстом).
- `send`: вложения не готовы → `ATTACHMENTS_FAILED|PENDING` (проверка в момент клика); Send недоступен → `SEND_UNAVAILABLE`; иначе один click → `clicked`.

### Вложения

- `attachments: [{ name, text }]` (по умолчанию `[]`). `attach` требует `requestId` (`INVALID_ATTACHMENTS`), создаёт `File` `text/markdown` на часть, один `DataTransfer` и синтетический `ClipboardEvent('paste')`; clipboard не используется.
- До dispatch editor получает метку `{ requestId, identity }`: тот же набор → `ATTACHMENTS_PENDING`, другой → `ATTACHMENTS_CHANGED`; метка снимается, только когда прежний requestId виден в отправленном сообщении, — исключение или частичная загрузка не дают второй вставки.
- Карточка (в composer, вне сообщений): узел с `title`/`aria-label` или текстом листа, равным имени, и предок ≤5 уровней (не выше `form`) с кнопкой `remove|delete|удалить`. Готово: карточки всех имён, разные, без прогресса и ошибки, Send доступен.
- Живой DOM: `span.group/composer-attachment` с `span.truncate` (полное имя); кнопка `aria-label="<имя>"` — только после загрузки; удаление — `aria-label="Remove <имя>"`; Send активен только после загрузки всех файлов. На классы код не опирается; решающий признак — доступность Send.
- Сбой → `ATTACHMENTS_FAILED|PENDING`: не отправлено, части сохранены. Число (≤7) и размер частей ограничивает Kit, adapter их не проверяет.

### `ChatGPTComposer`

`new ChatGPTComposer(contents, { timeoutMs = 12000, attachmentTimeoutMs = 120000, pageState, onDiagnostic })`; от `contents` — `getURL()`, `executeJavaScript(code, userGesture)`, для очистки нового черновика — `executeJavaScriptInIsolatedWorld`. Не `https://chatgpt.com` → `{ login: true, editorAvailable: false }`.

- `deliver({ text, requestId, expectedExperience, attachments, canContinue, onBeforeFill, onBeforeSend })`: `text` содержит `requestId` (`MESSAGE_INVALID`), одна отправка за раз (`SEND_IN_PROGRESS`). Порядок: inspect (`messageSeen` → `sent`) → `attach` и вставка текста (каждое один раз на requestId и документ) → готовность → `onBeforeSend` (попытка сохраняется до клика) → `send`. Click → `sent`/`send-dispatched` без ожидания `messageSeen`, потому что ChatGPT может превратить вставку во вложение; исключение после клика → `unknown` (`PAGE_UNAVAILABLE`), повторного клика нет.
- Готовность: потолок `attachmentTimeoutMs` при вложениях, иначе `timeoutMs`; ждёт событий PageStateSource, при вложениях перепроверяет DOM не реже раза в 500 мс; выходит сразу при готовности или сбое. Отдельный срок — потому что загрузка занимает секунды, 12 с давали ложный PENDING.
- `sendUserMessage({ text, waitForAcknowledgement = true, cleanupOnCancel = false, … })` — без маркера; непустое поле → `DRAFT_PRESENT`; без роста сообщений до `timeoutMs` → `unknown`, без повторного клика. `cleanupOnCancel` (только AutoPlan, [auto-plan.md](auto-plan.md)): если Send не начат, `clear-owned-draft` удаляет только свою неизменённую вставку (`draftToken`, без trusted input).
- `clearNewSessionDraft()` — только при явном создании Chat/Work: isolated world 999, тем же вызовом сверка `__webPilotObserverDocumentId` (нет документа → `EDITOR_UNAVAILABLE`, другой → `CHAT_CHANGED`); чистит только `/` или `/work` без сообщений и генерации (иначе deferred), неудачное удаление → `NEW_SESSION_DRAFT_CLEAR_FAILED`.
- `onDiagnostic` — только длины, счётчики, состояние кнопки, коды, requestId; без текста, HTML, имён файлов и сообщений исключений; сбой логгера Send не блокирует.

### Контракт Web Pilot Sidebar

- Sidebar — отдельный репозиторий другого агента, изменения его workspace согласуются отдельно. Он собирает `chatgpt-dom.mjs`, `chatgpt-composer.mjs`, `chatgpt-experience.mjs` в content script; они импортируют только друг друга именованными статическими импортами, без Node API и динамических импортов.
- API: `CHATGPT_SELECTORS` (с `stop`); `createChatGPTDOM(selectors)` с `editor()`, `sendButton()`, `first(selector)`; `chatGPTDOMScript()`; публичная `pageOperation(args, dom)`; `ChatGPTComposer(contents, { timeoutMs, attachmentTimeoutMs })` с `deliver({ text, requestId, expectedExperience, attachments })` и `inspect({ action, text, attachments })`; от `contents` — только `getURL()`, `executeJavaScript(code)`; `chatGPTEntrypoint`, `isPendingChatGPTConversation`. Новые параметры необязательны.
- Провод: `pageScript(args)` = `` `(${pageOperation})(${JSON.stringify(args)}, ${chatGPTDOMScript()})` ``; Sidebar исполняет его без eval. Имя `pageOperation` и сериализация — часть контракта.
- Имена файлов вложений в публичный API трёх модулей не входят.
- Поручение пользователя: экспорты и формат `pageScript` без явной необходимости не менять, изменение отмечать в описании коммита и передавать сопровождающему Sidebar. Три файла закреплены SHA-256 в `vendor.lock.json` Sidebar; re-pin и сборку делает его сопровождающий.
- Граница: Sidebar показывает проекты, сессии и прогресс плана; данные проекта, план, recovery и инструменты — Web Pilot и Kit; расширение не пишет `todo-plan.md` и не хранит данные проекта.

### Наблюдатель страницы

- Preload задаётся явно только основному WebContentsView ChatGPT (popup и окно входа — без него); только main frame `https://chatgpt.com`; `contextIsolation`, `sandbox`, без `nodeIntegration` и contextBridge. Канал односторонний `pilot:page-observation`: `{ version: 1, documentId, seq, state }`, `documentId` — случайный UUID (он же `__webPilotObserverDocumentId` в isolated world); каждое сообщение — полный снимок, отправляется только при изменении.
- `state`: URL, режим, `login` (`signed-in|signed-out|unknown`; нет кнопки Login ≠ вход), editor, `busy`, `sendEnabled`, `connectionError`, `draftPresent`/`draftRevision`, число и ревизия сообщений пользователя, `manualSend|Stop|InputRevision`, `assistantRevision`, `turnId`/`userTurnId`, `turnIdentitySource`, `lastMessageRole`. Текст, его хеш и requestId не передаются.
- `draftRevision` растёт на input, мутации текста и замене редактора, не на оформлении. Manual Send — trusted click/Enter, затем сообщение user с тем же текстом и пустой редактор. Потоковый ответ — не чаще раза в 5 с. `turnId` — хеш нативного `data-message-id` (в т.ч. внутри обёртки Work) или `data-turn-id`, иначе `cycle`; число DOM-узлов не ID (история виртуализирована).
- Только события (MutationObserver, input/click/keydown, visibility, resize, Navigation API), без опроса и requestAnimationFrame — работает в свёрнутом окне.
- Main принимает сообщение только от текущего webContents/mainFrame с origin `https://chatgpt.com`, с `documentId`, прочитанным один раз на поколение из isolated world 999 (поздний hello старого документа себя не назначит), `state.url` = URL фрейма и растущим `seq`; поколение сбрасывают навигация и `render-process-gone`. Сообщение ≤8192 байт по схеме, иначе `PAGE_OBSERVATION_INVALID` → видимая `PAGE_OBSERVER_INVALID`; url длиннее 2048 обнуляется. `PAGE_OBSERVER_FAILED` — ошибка preload, `PAGE_OBSERVER_UNAVAILABLE` — нет состояния 5 с после загрузки.
- Сигнал лишь запускает inspect; решает ContextSession/Composer. Аккаунт при старте и после auth-popup — разовый `__webPilotObserverSnapshot()` в isolated world.

### Фильтр строк инструментов

- `hideToolCalls` (по умолчанию `true`, `settings.json`, `pilot:set-hide-tool-calls`) — без перезагрузки, только на `https://chatgpt.com/`.
- Скрываются activity-заголовки и строки `button|[role=button]|summary` с текстом «вызываемый инструмент», «called tool», «tool call», «получен ответ приложения», «app response» — с высшим предком того же текста без ссылок и полей, до границы сообщения ассистента: tool-only turn скрывается целиком, в смешанном сообщении — только строка. Причина: tool-only turn со своей ролью оставлял `min-height`/padding — пустой хвост, сбивавший прокрутку.
- Не скрываются сообщения пользователя, `pre`/`code`, contenteditable, узлы со ссылками, полями, диалогами, запросы разрешения, кнопки действий. Маркеры `data-web-pilot-tool-call-hidden`, `…-footprint-hidden`; исходный `display` восстанавливается при «Показывать»; после изменения — только `__webPilotConversationAutoScroll.refresh()`, не `resume()`.

### Автопрокрутка

- `installChatGPTAutoScroll` — только `https://chatgpt.com`; после загрузки — `forceFollow`, при SPA-переходе — `refresh`. Контроллер `window.__webPilotConversationAutoScroll` (`version: 3`, `resume`, `refresh`, `snapshot`, `disconnect`), установка идемпотентна.
- Цель: `.thread-scroll-container` → прокручиваемый предок последнего сообщения → редактора → корень. Низ — максимум `scrollTop` (`column-reverse` — `0`); порог 32 px; мгновенно; без изменения низа записи нет.
- Follow по умолчанию; контент и размеры двигают только при follow. Приостановка — только по намерению пользователя: колесо вверх или уход от низа в течение 1,5 с после колеса, клавиш навигации вне composer, touch, перетаскивания; программная прокрутка follow не выключает. Возобновление: возврат к низу, Send, Enter в composer, смена маршрута, загрузка.
- На scroll никогда не отвечать scroll: анимации принадлежат ChatGPT, коррекция давала дрожание.

### Цвета чата (DOM-часть)

- Пять nullable `#rrggbb` (`background`, `userBackground`, `userText`, `assistantText`, `composerBackground`), `null` — штатный CSS; формат проверяется (защита от CSS injection).
- `userBackground` — только пузырь `.user-message-bubble-color` (и старые классы), не вся строка role=user. `assistantText` — роль ассистента и markdown/prose в `main` вне user/editable (потоковый текст до роли). Код, ссылки, SVG, кнопки, редактор и размеры не меняются.
- `composerBackground` — вся скруглённая плашка от «+» до голосовой кнопки (решение пользователя): `installComposerCapsule` от видимого editor вверх ≤14 уровней (не выше формы) до предка с радиусом ≥12 px → `data-web-pilot-composer-capsule`, промежуточные → `data-web-pilot-composer-inner` (прозрачны); нет предка — не красить. Причина: скругляют разные обёртки (`data-composer-body`, `ComposerLayoutRoot`, форма гостя). Обновление — узкий MutationObserver, ResizeObserver, `resize`, `prefers-color-scheme`, без интервала.
- `ChatColors`: один лист на документ, `insertCSS(css, { cssOrigin: 'author' })` с `!important`, затем снятие прежнего; latest-wins; повтор после навигации. `author`, потому что user-origin лист не снимается `removeInsertedCSS`.

### Изоляция и разрешения

- View ChatGPT: partition `persist:chatgpt`, без `nodeIntegration`, `contextIsolation`, `sandbox`, `webSecurity`; в странице нет `window.webPilot`, `require`, `process`; навигация и окна — только `https://`.
- Разрешения только для `https://chatgpt.com`: `media` — только audio; `geolocation`, `geolocation-approximate`; `clipboard-sanitized-write` — только основному WebContents («Копировать»); прочее (камера, экран, notifications, `clipboard-read`, другие origin) отклоняется (решение пользователя: микрофон для диктовки и геолокация, не камера). Одна политика в Request- и CheckHandler, потому что Electron спрашивает оба. Ключи plist — [release.md](release.md).

## Решения и запреты

- Сигнала auto-compact нет: загрузку, idle, reconnect, число сообщений и задержку ответа не считать compact ([context-delivery.md](context-delivery.md)).
- Не возвращать: вставку `insertText` и fallback после `PASTE_UNHANDLED`; переход вложений на текстовую вставку; сверку черновика как условие Send и ожидание DOM-маркера после Send; периодический опрос страницы (общий интервал, секундный проход плашки); корректирующую прокрутку на scroll; окраску строки role=user, выбор плашки по классам, user-origin CSS; определение Chat/Work по URL; индикатор окна контекста и счётчик токенов по видимому тексту.

## Проверки

- `unit-all`: `tests/chatgpt-{dom,experience,composer,file-paste-probe,tool-filter,auto-scroll,colors}.test.mjs` (провод Sidebar — «Sidebar can import pageOperation and reconstruct the exact pageScript wire format» в `chatgpt-composer.test.mjs`), `tests/page-state.test.mjs`.
- `electron-smoke` (TEST FIXTURE): разрешения, изоляция, popup без preload, наблюдатель в свёрнутом окне, фильтр, computed styles палитры и плашки в Chromium. `release-installed`: наблюдатель и Composer из установленного app.asar на ProseMirror.
- Живые проверки (пользователь; fixtures их не заменяют):
  1. Новые Chat и Work: режим подтверждён, вложения загружены, один Send; временный URL сменился постоянным без повторной отправки.
  2. `node scripts/probe-chatgpt-file-paste.mjs` печатает консольный скрипт: в новом пустом чате вставляет 7 файлов × 28000 байт без Send; проверить карточки и загрузку, отправить вручную один раз.
  3. После реального вызова MCP строка инструмента скрывается/показывается без пустого хвоста; прокрутка внизу, в т.ч. после холодного старта.
  4. Оформление поля ввода: временный отладочный порт на реальном чате (`/` и `/c/…`), снимки; затем перезапуск без порта, снимки удалить.

## Открыто

- Production Host API для Web Pilot Sidebar не реализован — будущая задача Web Pilot.
- Совпадение vendor lock Sidebar с текущими модулями (с необязательными `attachments` и `draftToken`) не подтверждено. Re-pin и проверка сборки — у сопровождающего Sidebar.
- Живая приёмка (проверки 1–4 выше) — за пользователем.
- Native Windows для адаптера и наблюдателя не проверен.
