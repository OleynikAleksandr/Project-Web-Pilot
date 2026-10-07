# Доставка контекста

Web Pilot сам передаёт в ChatGPT Web полный recovery текущего checkout: одно стартовое сообщение с коротким транспортным текстом и частями пакета во вложениях. Модуль владеет ContextCache, попыткой отправки (attempt), привязкой разговора, однократностью Send, ConversationRecovery и транспортом автопродолжения. Состав и пределы пакета задаёт Kit ([граница Kit](workflow-kit-recovery.md)), DOM — [адаптер](chatgpt-dom-compatibility.md), паузы — [AutoPlan](auto-plan.md). MCP исполнителя контекст не доставляет.

## Код
- `src/context-session.mjs` — `ContextSession`, `startupMessage`, `externalClientLine`, `packetMatchesProject`; `src/context-cache.mjs` — `ContextCache`; `src/context-inputs.mjs` — `readinessContextKey`; `src/session-plans.mjs` — `SessionPlans.loadContext`; `src/mcp-runtime.mjs` — `validateContextPacket`, `CONTEXT_PROTOCOL`.
- `src/chatgpt-composer.mjs` — `ChatGPTComposer.deliver`, `sendUserMessage`, `waitForSendReady`, `clearNewSessionDraft`; действия `pageOperation` `attach`, `fill`/`paste`, `send`, `select-experience`, `clear-new-draft`.
- `src/conversation-recovery.mjs` — `ConversationRecovery`; `src/auto-plan.mjs` — `continueMessage`; `src/mac-runtime-switch.mjs` — `EXECUTOR_TOOL_RULES`.
- `src/main.mjs` — `attachController`, `navigate`, `observeManualConversation`, IPC `pilot:retry`, `pilot:reconnect`, `pilot:copy-external-client-line`; фазы в UI — `src/ui/sidebar.mjs`, `src/ui/progress.mjs`.

## Поведение

### Когда пакет отправляется
- Только при старте новой сессии Chat/Work (меню проекта, первый проект, Doctor «Chat»/«Work»; старт без Send продолжается при повторном открытии этой сессии) или по явному «Обновить контекст» (`pilot:retry`, Doctor). Просмотр, повторное открытие, переключение, reload и перезапуск сохранённого чата ничего не готовят и не шлют; старые чаты не мигрируют.
- `ContextSession` подключается только при подтверждённой readiness папки в текущем поколении навигации и вне setup/настроек. Подготовка проекта и Doctor приостанавливают доставку.
- Session ID — идентичность чата и навигации, план не выбирает: все сессии checkout получают recovery одного current plan. Смена проекта не меняет cwd работающего чата. Сохранённый `sent`/legacy/`unknown` чат не вызывает `runtime.ensure()`, прогрев и `recover`.

### Получение и проверка пакета
- `node <workspace>/scripts/workflow.mjs recover --format packet` (Kit проекта, 120 с, 4 MiB); старый Kit с `SESSION_REQUIRED` — повтор с `--session/--plan` ([граница Kit](workflow-kit-recovery.md)).
- `validateContextPacket` (в runtime, кеше и ContextSession; поля — [граница Kit](workflow-kit-recovery.md)):
  - не `inline-context-v1`, `ack_required !== false`, нет `parts` или неверный `budget.document_bytes` (28000 по умолчанию) — `MCP_UPDATE_REQUIRED`; чужой `workspace` — `MCP_CONTEXT_MISMATCH`;
  - не `ready`/`COMPLETE`, нет `context`/`signature`/`generated_at_ms`, не ровно 8 `facts`, есть `probe_id`/`challenge` — `MCP_CONTEXT_INCOMPLETE`;
  - `context` > 180000 байт — `MCP_CONTEXT_TOO_LARGE`;
  - не сходятся `context_bytes`/`context_sha256` или части (`index 1..N`, `total N`, точные `bytes`/`sha256`, `bytes ≤ document_bytes`, `join('\n\n') === context`) — `MCP_CONTEXT_DAMAGED`.
- Число частей (≤ 7) и предел `min(hard_bytes, 180000)` обеспечивает Kit (`CONTEXT_TOO_LARGE`, без усечения); Web Pilot дублирует только потолок 180000.
- После сборки проект перечитывается: 8 facts должны совпасть с проекцией плана (`packetMatchesProject`), иначе `CONTEXT_CHANGED`; другой `project_id` — `PROJECT_REPLACED`. Чтение проекции — до 3 попыток (паузы 25/100 мс), затем `PROJECT_READ_FAILED`.

### ContextCache
- Адрес — workspace; ≤ 4 полных пакетов в памяти (LRU), на диск не пишется. Параллельные `load` объединяются; у каждой отправки свой `requestId`.
- Ключ — `sha256({version:4, workspace, readiness: inputKey})`, `inputKey` — от `WorkspaceSetup.ready()` (Kit `inspectionInputs`). Readiness не подтверждена или ключ пуст — `CONTEXT_INPUTS_UNAVAILABLE`; возраст пакета ключ не заменяет (300 с — только в ветке без кеша для тестов).
- Сборка: ключ до → build → ключ после; изменился ключ или кеш очищен — ещё одна попытка, затем `CONTEXT_CHANGED`; нестабильный пакет не кэшируется. Пакет с неизменными входами переиспользуется без предела возраста, в том числе новыми сессиями.
- Кеш очищают запуск Doctor, активация служб и закрытие окна. `warm` — только по событиям: отложенный старт (черновик, генерация, нет поля) и `projectChanged()` от наблюдения входов ([план](plan-view.md)); одинаковые запросы делят промис; ошибка — `CONTEXT_WARM_FAILED`, повтор явный. Периодических опросов нет.

### Стартовое сообщение
- Attempt `{protocol, requestId:'wp-request-<uuid>', text, attachments, packet, state}`; состояния `prepared → sending → sent | unknown`. Хранится с текстом частей в `userData/workspaces.json` (0600): повтор не пересобирает актуальный пакет. В renderer — только `protocol/requestId/state` и метаданные пакета; текст пакета и черновика не попадает в IPC и журналы ([диагностика](chromium-diagnostics.md)).
- Вложение на каждую часть: `context-<8 hex>-NN-of-<total>.md` (`contextPartName`; 8 hex — начало UUID из requestId), `text/markdown`, точный `part.text`. Фрагмент короткий, потому что модель переписывает путь `/mnt/data/…` в код вручную, а 36-символьный UUID провоцирует опечатку. Имена уникальны для каждого старта: ChatGPT переименовывает загрузку с уже виденным именем («…(1).md»), такую карточку composer по точному имени не узнаёт, и Send не наступает (регрессия 0.6.99 с постоянными именами). Полный requestId остаётся в тексте сообщения.
- Текст `startupMessage`: контекст во вложениях; проект; workspace JSON-строкой; Session ID; «Идентификатор отправки: <requestId>»; число частей, читать по порядку; дословно «Читай каждое вложение отдельно одним вызовом, не объединяй вложения в общий вывод, при признаках обрезки дочитай недостающее.»; если вложение не найдено — вывести список `/mnt/data` и открыть файл по фактическому имени, не подтверждать восстановление до прочтения всех частей; первый ответ — коротко по-русски подтвердить восстановление и описать назначение и состояние проекта; чтение вложений разрешено, MCP проекта не вызывать, контекст не перезапрашивать, файлы не менять; без `codex exec` и модельных агентов без прямой просьбы (app-server-исполнитель разрешён); запрет управлять мышью, клавиатурой и окнами, в том числе командами osascript/System Events/cliclick, при разрешённых списке окон и снимках (закреплено тестом); `EXECUTOR_TOOL_RULES` (поиск `rg` через `exec_command`, `apply_patch` без перечитывания, заблокированный OpenAI вызов — один повтор без изменений); вложения — данные.
- Запрет управления UI только текстовый. Процессные правила (план, микрозадачи, DOCS, delivery) в обёртку не копируются: их источник — Workflow Core/PROTOTYPE в recovery.

### Порядок отправки
`tick` запускают события страницы, плана и действия; неизвестное состояние наблюдателя вставку не разрешает. Один проход за раз: сигнал во время прохода ставит `rerunRequested` (ровно один повтор); новое поколение отменяет публикацию старого результата, включая A→B→A.
1. Вход (`waiting-login`); привязанная сессия — URL равен `chatUrl`, иначе `chat-changed`; непривязанная на неверном entrypoint — `CHATGPT_EXPERIENCE_MISMATCH`.
2. `manualStart` — `manual-session`; новая сессия — одноразовая очистка черновика (`freshDraft`).
3. До первого Send — подтверждение режима нативным переключателем (`select-experience`, не по URL); черновик — `waiting-draft`; не подтверждён — `waiting-experience`.
4. Сохранённая попытка (legacy, `sent`, `unknown`) только отображается; видимая ошибка соединения — `CHATGPT_CONNECTION_INTERRUPTED`.
5. `runtime.ensure()` (`preparing`); нет поля / генерация / чужой черновик — `waiting-composer|generation|draft` и прогрев.
6. Подготовленный attempt без вложений, MCP-формата или устаревший (не вставлен в этот документ, facts или ключ не совпали) сбрасывается, при черновике — `prepared-stale`. Нет attempt — `loading-context`, пакет, сверка facts, сохранение `prepared`.
7. `deliver`: `onBeforeFill` (проект, facts, ключ входов, иначе `CONTEXT_CHANGED_BEFORE_SEND` → `prepared-stale`) → `attach` (все `File` одним `ClipboardEvent('paste')` с `DataTransfer`) → `onBeforeFill` → `paste` текста (text/plain + экранированный HTML с `data-pm-slice`, одна транзакция; не принят — `PASTE_UNHANDLED`, запасного пути нет) → `waitForSendReady` → `onBeforeSend` → один click.

### Готовность вложений и сроки
- Карточка готова: видима вне истории и поля ввода, точное имя, своя кнопка удаления, без progress/ошибки; карточек столько же, сколько частей; Send доступен. Проверка повторяется прямо перед кликом.
- `attachmentTimeoutMs = 120000` для вложений, `timeoutMs = 12000` для текста — потолок, не задержка: всё готово — Send сразу; `ATTACHMENTS_FAILED` — стоп сразу; срок истёк — `ATTACHMENTS_PENDING` без Send. Ожидание — события PageStateSource и DOM-проверка не реже 500 мс. 120 с — потому что загрузка шести частей занимает около 8 с и вероятной причиной ложного `PENDING` при прежних 12 с было исчерпание срока (журнал того сбоя признаков вложений не содержал).

### Send, исход и дубли
- `sending` и `sendStartedAtMs` пишутся до клика, поэтому сбой процесса не даёт второй отправки.
- Click = `sent` (`send-dispatched`): дальше ничего не ждётся и не ищется — ни маркер в DOM, ни ответ, ни ACK. Это подтверждение вызова Send, не получения.
- Исключение после клика — `unknown` (`PAGE_UNAVAILABLE`), автоповтора нет. `unknown`/`sending` — нейтральная фаза `send-unknown`, URL сохраняется, маркер не ищется. `SEND_IN_PROGRESS` — параллельная отправка; `MESSAGE_INVALID` — `requestId` не в тексте.
- Метка `{requestId, identity}` ставится на editor до dispatch: тот же набор в том же документе повторно не вставляется (`ATTACHMENTS_PENDING`), другой — `ATTACHMENTS_CHANGED`; метка снимается, только когда прежний `requestId` найден в отправленном сообщении. `PENDING/FAILED/CHANGED` требуют проверки, не повторной отправки: явный повтор сохраняет `requestId` и части; новая вставка — только в новом документе страницы.

### Привязка разговора и режим
- Режим — сохранённый `experience`; Work входит через `https://chatgpt.com/work/`, после отправки живёт на общем `/c/<id>`; разговор в неверном режиме не конвертируется.
- Временные `/c/WEB:<uuid>`, `/c/local-chatgpt:<uuid>` не сохраняются: `waiting-chat` (или `send-unknown`) до постоянного URL, без повторного Send.
- URL привязывается только после своего `sendStartedAtMs`/`sent` или своего увиденного сообщения; чужой разговор — `chat-changed`. После привязки — синхронизация заголовка ([сессии](workspace-sessions.md)). Смена сессии, проекта или документа отменяет невыполненное.

### Черновик и ручной ввод
- Черновик пользователя и генерация откладывают старт; чужой текст не перезаписывается.
- Исключение — явное создание новой сессии (нет `chatUrl` и attempt): поле очищается один раз в isolated world 999 со сверкой `documentId` в том же вызове, только на entrypoint без сообщений, вне генерации и входа (иначе ожидание или `chat-changed`); неудачное удаление — `NEW_SESSION_DRAFT_CLEAR_FAILED`. Reopen и retry поле не трогают.
- После своей вставки текст поля не сверяется: пользователь разрешил отправлять дописанный ввод вместе с контекстом; вложения обязательны все.
- Ручной Send подготовленного recovery распознаётся по своему сообщению пользователя (`requestId`, workspace, совместимый URL) → `sent`. Обычное ручное первое сообщение (trusted click/Enter, `manualSendRevision`) привязывает URL с `manualStart`: recovery не доставлен, чат ждёт «Обновить контекст». Число сообщений и цитата ассистента не доказательство.

### Фазы и явные действия
- Фазы: `selected`, `preparing`, `loading-context`, `preparing-message`, `sending`, `waiting-*`, `waiting-chat`, `delivered`, `stale` (после доставки изменились facts или ключ входов), `prepared-stale`, `manual-session`, `legacy-session`, `send-unknown`, `chat-changed`, `error` (без автоповтора).
- Кнопка: «Обновить контекст» в `delivered|stale|prepared-stale|legacy-session|manual-session`, «Проверить статус» в `send-unknown|waiting-chat`, иначе «Проверить контекст». `retry()` снимает `manualStart` и сбрасывает attempt только `sent`/`acknowledged` или не начатый без вложений; обновление — новый `requestId` и пакет в тот же чат.
- Чаты прежней MCP-доставки (`attempt.packet.contextMode === 'mcp'`) и другого протокола — «Сохранённый чат проекта» (`legacy-session`); их подготовленное короткое сообщение не отправляется; пакет — только «Обновить контекст».

### ConversationRecovery
- Сигнал — только видимый error UI (alert, блок рядом с Retry; не сообщения, код, цитаты): «ChatGPT stream recovery polling timed out», «Resume stream unavailable», network error / connection lost (EN/RU) → `stream-interrupted`.
- Разговор известен, если `chatUrl` нормализован и есть `manualStart` или attempt `sent`: одна автопопытка через 3 с — перепроверка (тот же URL, вход, поле, нет черновика и другой операции) и открытие того же URL. Ничего не отправляет, Send/Retry генерации не нажимает.
- Неизвестный URL — `blocked`, новая сессия не создаётся; повторный сбой — кнопка «Повторно открыть разговор». HTTP 429 разговора ([диагностика](chromium-diagnostics.md)) — пауза `Retry-After` в пределах 60–300 с, затем только явный повтор. Ручной Stop подавляет автооткрытие до нового сообщения пользователя; смена сессии сбрасывает восстановление.

### Транспорт AutoPlan
`sendUserMessage` с `continueMessage(task)` («Продолжай» и данные следующей задачи, ≤ 4096 байт; не recovery, документы не вкладываются), `waitForAcknowledgement:false`, `cleanupOnCancel:true` (своя неизменённая вставка при отмене удаляется). Непустое поле — `DRAFT_PRESENT`; тот же paste; срок 12 с; перед кликом план перечитывается ([AutoPlan](auto-plan.md)). Click — `send-dispatched`; исключение после клика — `unknown` без повтора.

### Строка для внешнего клиента
Меню проекта «Скопировать строку для внешнего клиента» (`externalClientLine`): имя, папка JSON-строкой, прочитать `AGENTS.md`, выполнить `./scripts/workflow recover --format text > .harness/runtime/recovery.txt` (Windows `scripts\workflow.cmd …`), прочитать файл целиком по частям и кратко подтвердить. Только clipboard, в чат не уходит; адреса коннектора и ключей нет.

## Решения и запреты
- Пакет передаёт приложение через поле ввода: MCP-инструмент вызывает только модель, `instructions` MCP не гарантированы, результат инструмента ChatGPT показывает около 10 000 токенов (середина терялась, в Work текст дублировался `structuredContent`).
- Части — вложения одного сообщения (решение пользователя): каждая ≤ `document_bytes`: этот рабочий предел подтверждён испытаниями чтения; при признаках обрезки агент дочитывает часть, а повторяющаяся обрезка — повод пересмотреть предел.
- ACK, status/hook-инструментов и hooks нет (приём hook bundle Web-подключением не доказан; ACK исключён поручением пользователя). Успех — полный контекст у агента и его ответ о проекте. Системный clipboard, cookies, внутренние и модельные API не используются.

### Не возвращать
- MCP-доставку контекста (`workflow_context_recover`, части с ключами, `session-rules.md`, `active-workspace.json`, стартовое «читай через MCP»), машинный ACK и hook-проверки в ответе.
- `execCommand('insertText')` и `webContents.insertText`: десятки секунд на ~100 тыс. символов, ложный `DRAFT_CHANGED`.
- Молчаливый fallback от вложений к большой текстовой вставке; усечение пакета.
- Ожидание своего сообщения после Send (ложный `SEND_NOT_OBSERVED`, когда ChatGPT превращал вставку во вложение); автоповтор Send; второй paste в тот же документ.
- Автоотправку в сохранённые и привязанные чаты (открытие, перезапуск, изменение плана, compact).
- Выбор плана по Session ID и планы сессий; копии процессных правил Kit в `startupMessage`.

## Проверки
- `unit-all`: `tests/{context-session,context-cache,chatgpt-composer,mcp-runtime,session-plans,conversation-recovery,auto-plan,progress,chatgpt-file-paste-probe}.test.mjs` (в composer — 7 × 28000 байт до одного Send, upload-сбои без отправки и второго paste, 120/12 с, исключение после клика).
- `electron-smoke` (TEST FIXTURE): части во вложениях, загрузка до Send, один Send; живой DOM не доказывает.
- Ручные (пользователь):
  1. Временный проект, новые Chat и Work (macOS, Windows): N карточек загружены до одного Send (до 120 с без ложного `PENDING`); агент читает вложения по одному и описывает проект; временный URL сменяется постоянным без второй отправки; reopen/перезапуск не шлют.
  2. `node scripts/probe-chatgpt-file-paste.mjs` печатает скрипт для консоли пустой страницы ChatGPT: 7 файлов по 28000 байт, Send вручную после загрузки; `--check` — размеры.
  3. `stale` → «Обновить контекст» в тот же чат; AutoPlan с текстом задачи; строка внешнего клиента; обрыв потока — одно автооткрытие без отправки. Следить за предупреждениями OpenAI о лимитах.
- Не доказывают: сборка, HTTP, smoke, тесты Windows с подменой платформы; пауза/reconnect/счётчик/новый пакет — не признак compact.

## Открыто
- Живая приёмка за пользователем: срок 120 с на реальной загрузке, новые Chat/Work на macOS, native Windows, чистая установка, автопродолжение с текстом задачи, строка внешнего клиента.
- Восстановление после auto-compact нужно пользователю, подтверждённого сигнала нет: ChatGPT Web не отдаёт браузеру занятость окна и токены; есть лишь пассивные записи `max_tokens` модели и `context_truncation_continuation` ([диагностика](chromium-diagnostics.md)). Автообновление по эвристике и контекст перед каждым сообщением не утверждены.
- Чат в `send-unknown` нельзя дополнить пакетом: «Обновить контекст» не показывается, «Проверить статус» только наблюдает, путь — новая сессия. Нужен ли явный повтор в тот же чат — решение пользователя.
- `ATTACHMENTS_CHANGED` показывается общей фазой `waiting-composer` без подсказки перезагрузить страницу (отправки корректно нет).
