# Краткая архитектура проекта

Стек: Workflow Kit 1.6.4, Electron 44.5.1, Node 24.21.0; версия продукта — в `package.json` и [README](../../README.md). Это карта текущего устройства. Ход работы — в current plan и Git; факты сборки и публикации — в release-manifest.json и GitHub Release. Постоянные правила разработки — в [AGENTS.md](../../AGENTS.md), пользовательская инструкция — в README.

## Назначение и границы

Electron-приложение для macOS и Windows: одно окно, слева собственный сайдбар локальных проектов, их чатов и текущего плана, справа ChatGPT Web во встроенном Chromium (`BaseWindow` + `WebContentsView`). Модель работает через веб-аккаунт пользователя, без модельного API. Web Pilot готовит и доставляет стартовый контекст. Локальный исполнитель Codex App Server выполняет команды через MCP. ChatGPT подключается к нему через Secure MCP Tunnel или VPS.

Один Git checkout/worktree имеет один current plan (`.harness/plans/todo-plan.md`), которым управляет Workflow Kit. Сессии Web Pilot хранят чат, URL, тип Chat/Work и состояние интерфейса, но плана не владеют. Для независимой параллельной работы нужен отдельный worktree. Переключение проекта в панели не меняет рабочую папку уже открытого чата.

## Карта модулей

| Модуль | Код | Документ |
| --- | --- | --- |
| Каркас приложения | `src/main.mjs`, `common.mjs`, `platform.mjs` | этот документ |
| Доставка контекста | `context-session`, `context-cache`, `context-inputs`, `session-plans`, `mcp-runtime`, `conversation-recovery` | [context-delivery](../modules/context-delivery.md) |
| Граница Kit ↔ Web Pilot | вызов `recover`, проверка пакета | [workflow-kit-recovery](../modules/workflow-kit-recovery.md) |
| Review нового плана | `plan-review`, `review-continuation`, `automation-send-state`, Kit `plan-review`/`claude-review` | [plan-review](../modules/plan-review.md) |
| AutoPlan | `auto-plan`, `auto-plan-state` | [auto-plan](../modules/auto-plan.md) |
| Текущий план в панели | `plan-monitor`, `project-input-watch` | [plan-view](../modules/plan-view.md) |
| Проекты и сессии | `workspace-session`, `chatgpt-title`, `agent-timer` | [workspace-sessions](../modules/workspace-sessions.md) |
| Сайдбар и окно | `preload.cjs`, `src/ui/{index.html,sidebar,progress,settings-panel,chat-colors}`, `chat-colors-window`, `chat-colors-preload.cjs` | [workspace-sidebar-ui](../modules/workspace-sidebar-ui.md) |
| Быстрое открытие сессии | `workspace-readiness`, поколения навигации в `main.mjs` | [session-opening-performance](../modules/session-opening-performance.md) |
| Адаптер ChatGPT | `chatgpt-dom`, `chatgpt-composer`, `chatgpt-experience`, `chatgpt-page-observer`, `page-state(-bridge)`, `chatgpt-tool-filter`, `chatgpt-auto-scroll`, `chatgpt-colors` | [chatgpt-dom-compatibility](../modules/chatgpt-dom-compatibility.md) |
| Диагностика | `chromium-diagnostics`, `startup-network-trace` | [chromium-diagnostics](../modules/chromium-diagnostics.md) |
| Создание и подключение проекта | `workspace-setup`, `src/ui/workspace-setup.mjs`, `resources/workspace-setup-worker.mjs` | [workspace-setup](../modules/workspace-setup.md) |
| Архив проектов | `workspace-deletion`, `archive-preload.cjs`, `src/ui/archive*` | [project-archive](../modules/project-archive.md) |
| Доктор проекта | `project-doctor`, `src/ui/project-doctor.mjs`, `resources/project-doctor*` | [project-doctor](../modules/project-doctor.md) |
| Первый запуск | `browser-startup`, `startup-readiness`, `startup-platform`, `tunnel-setup`, `tunnel-clipboard`, `src/ui/startup.mjs` | [first-run-onboarding](../modules/first-run-onboarding.md) |
| Службы и каналы | `mac-runtime-switch`, `windows-runtime`, `vps-tunnel`, `zip-archive`, `tools/codex-app-server-mcp/control.py`, `resources/runtime-control/` | [runtime-lifecycle](../modules/runtime-lifecycle.md) |
| Исполнитель | `tools/codex-app-server-mcp/*`, `scripts/check-codex-tools.mjs` | [codex-app-server-executor](../modules/codex-app-server-executor.md) |
| Выпуск | `scripts/release-*`, `sign-mac-bundle`, `prepare-*-toolchain`, `verify-windows-package`, `check-*` | [release](../modules/release.md) |
| Workflow Kit | `packages/workflow-kit/**`, `scripts/stage-workflow-kit.mjs`, `scripts/workflow*` | [контракт пакета](../../packages/workflow-kit/docs/modules/workflow-kit-package.md) |

Модули без префикса пути лежат в `src/`.

## Поток новой сессии

1. Пользователь выбирает проект и создаёт Chat или Work. Web Pilot открывает новую беседу в выбранном режиме.
2. Kit проекта строит recovery: Workflow Core, PROTOTYPE, проектная часть AGENTS, OVERVIEW, текущий план и выбранные им документы целиком. Пакет делится на части по `budget.document_bytes` (28000 байт), всего ≤ 7 частей и ≤ 180000 байт; превышение — `CONTEXT_TOO_LARGE` без усечения.
3. Web Pilot проверяет актуальность и целостность пакета, прикрепляет части как файлы и вставляет короткий транспортный текст. Send — один раз, сразу после загрузки всех вложений (ожидание до 120 с). Неопределённый Send автоматически не повторяется.
4. Агент читает каждое вложение отдельным вызовом и кратко подтверждает восстановление. MCP проекта в первом ответе не вызывается.
5. При Review ON новый план согласуется с Claude CLI; каждый успешный отзыв требует сохранённой позиции автора через Kit. Ошибки и споры возвращаются пользователю ([plan-review](../modules/plan-review.md)). Продолжение Review доставляется по явному Session ID, который планом не владеет. AutoPlan независим: если включён, после публикации отправляет «Продолжай» с данными следующей задачи.

Сохранённый чат при обычном открытии контекст заново не получает. Подробности — [context-delivery](../modules/context-delivery.md), [auto-plan](../modules/auto-plan.md), [граница с Kit](../modules/workflow-kit-recovery.md).

## Состояние, события, безопасность

- Состояние наблюдается событиями: наблюдатель страницы (PageStateSource), файловые события проекта (ProjectInputWatch), события служб. Функциональных опросов в простое нет; допустимы ограниченные ожидания и watchdog. Сбой наблюдения даёт видимую ошибку с повтором, а не тихую остановку.
- Адаптер ChatGPT работает только с видимым DOM: без cookies, localStorage и внутренних функций страницы. Исключение — синхронизация названия беседы через недокументированный `/backend-api/conversation/<id>` в авторизованной странице, fail-closed ([workspace-sessions](../modules/workspace-sessions.md)); пассивная диагностика наблюдает сеть через CDP, тела и текст не сохраняет ([chromium-diagnostics](../modules/chromium-diagnostics.md)).
- IPC узкие, отправитель проверяется по своему окну (`assertLocalSender` сайдбара, `assertArchiveSender` архива, проверка в `chat-colors-window`); универсального shell- или write-API нет.
- Профиль ChatGPT, настройки и состояние приложения — в пользовательских данных, не в Git. Диагностика хранит технические признаки, без тел recovery, беседы и секретов. Ключ туннеля и адрес коннектора не попадают в репозиторий, журналы и чат.

## Исполнитель и платформы

На macOS и Windows работает один backend — Codex App Server (`tools/codex-app-server-mcp`), имя подключения «Codex App Server Local Mac/Windows». Он отдаёт ровно девять MCP-инструментов: команды, stdin, patch, изображения, статус, watchdog и наблюдение экрана. Управления интерфейсом и модельных ходов нет, контекст через MCP не передаётся. Codex CLI устанавливает пользователь, версия закреплена в `codex-tools.lock.json`.

Службы (MCP, tunnel-client, VPS-проброс) живут вне окна и стартуют при входе пользователя: LaunchAgent на macOS, HKCU Run на Windows. Предпочтительные порты: MCP 17852, tunnel-client 17853; если порт занят другой программой, служба переходит на свободный и сохраняет его, а selector, туннель и VPS-проброс следуют фактическому адресу. Удалённый порт VPS — 17842. Подробности — [runtime-lifecycle](../modules/runtime-lifecycle.md) и [codex-app-server-executor](../modules/codex-app-server-executor.md).

## Исходники и потребители

- `packages/workflow-kit` — единственный источник Kit (`@webpilot/workflow-kit`). `resources/workflow-kit` — копия для приложения, создаётся `npm run stage:workflow-kit` и в Git не хранится. `.harness/kit` — установленный runtime этого checkout, его обновляет только `install --update`.
- Web Pilot Sidebar — отдельный репозиторий. Он переиспользует `chatgpt-dom`, `chatgpt-composer` и `chatgpt-experience` по закреплённым SHA; их экспорты и формат `pageScript` — внешний контракт ([chatgpt-dom-compatibility](../modules/chatgpt-dom-compatibility.md)). Production Host API для Sidebar не реализован — будущая работа.
- Направление импорта: `scripts/` может импортировать `src/`, обратное запрещено. Workers в `resources/` и Доктор не импортируют `src/`.

## Запуск и проверки

- `npm start` — запуск из исходников; `npm test` — Node suite (`tests/*.test.mjs`); `npm run smoke` — Electron smoke на TEST FIXTURE, не живой ChatGPT; `npm run build` — парная сборка macOS arm64 + Windows x64 ([release](../modules/release.md)).
- Проверки задач задаются в `.harness/workflow.json` и назначаются в плане через `verification_ids`: `unit-all`, `electron-smoke`, `executor-channel`, `codex-tools-live`, `kit-check`, `paired-release`, `release-installed`, `github-release`, `workflow-kit-archive`.
- Fixtures, smoke и упаковка проверяют разные уровни. Живой ChatGPT, чистую установку и native Windows принимает пользователь. Ручные протоколы — в документах модулей, раздел «Проверки».

## Документация

- Документы описывают текущее устройство, требования, ограничения и краткие причины решений. История не накапливается: ход работы — в плане, коммитах и диффах.
- Каждый `.md` ≤ `budget.document_bytes` (28000 байт UTF-8); при росте документ делится на самостоятельные.
- `docs/modules/*.md` — контракты модулей. `docs/planning/*.md` — только невыпущенные рабочие спецификации; при DOCS выпуска их действующее содержание переносится в модули, а сами они удаляются. README — для пользователя. Полная актуализация — в DOCS перед каждым выпуском.
- Вне задачи (план NONE или ACTIVE без текущей задачи) документы фиксируются `./scripts/workflow docs:commit`.

## Отложенные направления

- Удалённая видимость проектов, разговоров и current plan работающего Mac с iPad/iPhone/Android. Решение о реализации не принято. Если начнётся, порядок такой: read-only MCP UI с проверкой каждого клиента; при неудаче — web-панель-компаньон. Без своей копии плана, с явной ссылкой на project/worktree, без shell и прямой записи `todo-plan.md`, с аутентификацией и allowlist проектов, без model API. Ограничения: Electron не собирается под iOS/Android; Secure MCP Tunnel не даёт стороннему приложению HTTP-доступа к Mac.
- Отвергнуто: адаптер ChatGPT MCP App и автоматизация навигации в нативном приложении ChatGPT. Spike не переключил нативную беседу; модель `owner_session_id` несовместима с одним current plan на checkout. Не возобновлять.
- Коннектор Claude через VPS: канал общий, подключение Claude не создавалось и не проверялось.
- Сигнал внутреннего compact в ChatGPT не найден; восстановление после compact не заявляется ([context-delivery](../modules/context-delivery.md)).
