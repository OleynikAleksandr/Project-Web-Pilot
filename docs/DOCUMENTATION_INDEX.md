# Каталог документации

<!-- workflow-kit:begin -->
## Документы проекта

| Документ | Назначение |
| --- | --- |
| .harness/kit/WORKFLOW.md | Канонический протокол Workflow Kit |
| .harness/kit/templates/AGENTS.md | Шаблон управляемых инструкций нового проекта |
| .harness/kit/templates/ARCHITECTURE.md | Универсальный шаблон глобальной структуры проекта |
| .harness/kit/templates/PLAN.md | Шаблон собственного/подготовленного плана: project navigation, задачи и финальная DOCS |
| .harness/kit/templates/PRODUCT.md | Универсальный шаблон общего замысла проекта |
| .harness/kit/templates/START.md | Шаблон правил начала новой сессии |
| .harness/plans/todo-plan.md | Единственный current plan текущего checkout/worktree; chat/session не выбирает его |
| .harness/plans/todo-plan.template.md | Доступный агенту шаблон следующего рабочего scope |
| AGENTS.md | Управляемые инструкции Workflow Kit и границы Project Web Pilot |
| docs/PRODUCT.md | Действующий продуктовый контракт Project Web Pilot |
| docs/architecture/ARCHITECTURE.md | Подробная архитектура и история реализации Project Web Pilot |
| docs/WORKFLOW_START.md | Актуальный порядок начала и продолжения работы |
| docs/MODULES.md | Карта самостоятельных частей проекта и их владельцев |
| docs/architecture/OVERVIEW.md | Компактная общая структура проекта для каждого recovery |
| docs/DOCUMENTATION_INDEX.md | Полный пополняемый индекс действующей документации |
<!-- workflow-kit:end -->

## Project Web Pilot

| Документ | Назначение |
| --- | --- |
| README.md | Актуальный запуск, пользовательское поведение, ограничения и разработка |
| docs/DECISIONS.md | Решения пользователя и зафиксированные границы полномочий |
| docs/CONTEXT_DELIVERY.md | Канонический контракт recovery capsule и доставки контекста в ChatGPT |
| docs/modules/workflow-kit-recovery.md | Specification Workflow Kit / Context Recovery / project continuity |
| docs/modules/project-doctor.md | Контракт автономного Доктора проекта и границы автоматического ремонта |
| docs/modules/runtime-lifecycle.md | Specification self-healing MCP/tunnel lifecycle |
| docs/modules/codex-app-server-executor.md | Local-only MCP facade поверх Codex App Server: паритет Codex Local Mac, Computer Use, исторический A/B и stable-connector integration 0.6.47 |
| docs/modules/workspace-sessions.md | Specification проектов, Chat/Work sessions, session tree, переходов после scope, оформления и сохранения геометрии интерфейса |
| docs/planning/session-title-sync.md | Контракт auto/manual session title и server-side синхронизации с native ChatGPT Recents |
| docs/design/chat-message-layout-regression.md | Planning исправления пустого layout скрытых tool-call message/turn wrappers и regression coverage |
| docs/design/computer-use-latency-investigation.md | Planning и evidence исследования end-to-end задержек Computer Use, MCP, Secure MCP Tunnel и Web ChatGPT |
| docs/SOURCE_WORKSPACES.md | Исходные проекты, пути, версии и официальные ссылки |
| docs/VERIFICATION.md | Проверки, release evidence и границы пользовательской приёмки |
| docs/RELEASE.md | Парный выпуск macOS/Windows, постоянный macOS app, Finder-алиас, ZIP, GitHub Release и проверка доставки |
| docs/CLEAN_INSTALL.md | Стенд Clean/Test macOS/Windows, evidence первого запуска до 0.6.45 и границы проверки текущей поставки 0.6.47 |
| docs/TRANSFER_TO_WINDOWS.md | Актуальная локальная Windows x64 поставка 0.6.47 и самостоятельная проверка пользователем |
| docs/WORKSPACE_SETUP.md | Создание/подключение workspace и install/upgrade Workflow Kit |
| docs/PROJECT_ARCHIVE.md | Архив workspace, возврат и безопасное локальное удаление; веб-чаты сохраняются |

## Обязательная навигация проекта

Каждый current plan checkout/worktree, включая состояние `NONE`, содержит required-ссылки на:
1. `docs/architecture/OVERVIEW.md` — что это за проект и как он устроен в целом;
2. `docs/MODULES.md` — из каких самостоятельных частей он состоит и где их спецификации;
3. `docs/DOCUMENTATION_INDEX.md` — какие документы существуют и что в них находится.

Для активного scope добавляются specification/planning documents затрагиваемых частей. Исторические документы и старые release sections не входят в recovery автоматически.

## Порядок чтения новой сессией

Новая сессия начинает с recovery capsule. При `NONE` capsule уже содержит Workflow Core и три обязательных навигационных документа и предлагает обсудить следующий этап проекта. При активном scope дополнительно передаются current scope/revision, цель, текущая и оставшиеся задачи, релевантные specification/planning documents, рабочие изменения и только необходимые dependency diffs.

Большие исторические `PRODUCT`, `ARCHITECTURE`, `VERIFICATION`, `DECISIONS` и другие профильные документы читаются по этому индексу только когда нужны для конкретного этапа. Только явно архивированные планы находятся в `.harness/plans/archive/` и являются историей. Выполненный, но не архивированный план остаётся current plan checkout и может быть продолжен новым чатом.

## Workflow Kit package и generated runtime

| Документ / файл | Назначение |
| --- | --- |
| `/Users/oleksandroliinyk/VSCODE/WorkflowKit/docs/modules/workflow-kit-package.md` | Canonical contract package `@webpilot/workflow-kit` |
| `docs/planning/workflow-kit-package-migration.md` | Контракт миграции WebPilot на package + staging |
| `scripts/check-workflow-kit-dependency.mjs` | Проверка resolved package, версии, exports, 35-файлового fileset и digest |
| `scripts/stage-workflow-kit.mjs` | Детерминированный generated staging в `resources/workflow-kit` |
| `scripts/check-workflow-kit-staging.mjs` | Проверка равенства generated runtime canonical package и идемпотентности |

С 0.6.56 `resources/workflow-kit` не является source tree и не хранится в Git: это generated runtime для external workers и Electron packaging. Единственный editable source — `/Users/oleksandroliinyk/VSCODE/WorkflowKit/src`; `.harness/kit` Project Web Pilot — отдельная installed runtime самого проекта.


## Действующий контракт — single active plan и чаты

| Документ | Назначение |
| --- | --- |
| docs/modules/session-owned-plans.md | Stable filename действующего 0.6.58 контракта: один current plan на checkout/worktree; sessions — chats, legacy ownership только history |
| docs/modules/workspace-sessions.md | Session store, Chat/Work navigation, backward-compatible legacy fields и проекция current plan |
| docs/modules/workflow-kit-recovery.md | Workflow Kit 1.5.0, checkout-scoped recovery/cache и migration legacy session plans |
| docs/design/session-plan-navigation.md | Исторический макет 0.6.28 прежней prepared/session-owned модели; не действующий UI-контракт |

## Действующий контракт — скорость открытия

| Документ | Назначение |
| --- | --- |
| docs/modules/session-opening-performance.md | Реализованный в 0.6.29 / Kit 1.4.1 быстрый показ собственного плана, фоновая готовность, строгая доставка и фактические source/packaged замеры |

## Действующий контракт — первый запуск

| Документ | Назначение |
| --- | --- |
| docs/modules/first-run-onboarding.md | Первый запуск 0.6.40, принятые 0.6.38/0.6.39, закрытие 031 с передачей Windows, отдельный план 032 и границы проверки |

## Актуализация 19.09.2026 — 0.6.42

Актуальные контракты первого запуска, runtime, выпуска и передачи Windows описывают
два последовательных шага ID/API key. CLEAN_INSTALL хранит пользовательские
наблюдения, включая недиагностированный первый сбой подготовки Windows и отсутствие
приёмки нового выпуска. Workspace Setup, Context Delivery и Workspace Sessions
сохраняют существующий контракт: изменение касается ввода подключения перед ними.
Планы 031/032, локальный архив и правила полного контекста не изменялись.

0.6.43: первый запуск, runtime, release и передача Windows дополнены настоящим
системным диалогом ID; CLEAN_INSTALL хранит наблюдение 08.36.22. Контракты
Workspace Setup, Context Delivery, Workspace Sessions и архивирования не менялись.

0.6.44: актуализированы README, входные документы, Workspace Setup, первый запуск,
доставка контекста, runtime/sessions, реестр Windows-проверок и выпуск. Удалены
актуальные требования вводить автора/email; отражена отдельная регистрация MCP
в ChatGPT. Исторические записи прежних выпусков сохранены. Остальные контракты
по индексу этим изменением не затронуты.

0.6.45: согласованы README, инструкции Mac/Windows, четыре режима Permissions,
принятие плана пользователем, наблюдение Windows MCP 09.53.24, проверки и парный
выпуск. Документы по индексу пересмотрены; неизменённые контракты Workflow Kit,
архива и Доктора проекта сохраняются.

0.6.46: scope `chat-layout-regression-034` исправляет пустую высоту скрытых tool-call
message/turn wrappers без изменения MCP, conversation state или ручной прокрутки.
Добавлен planning document, расширен Electron regression fixture, полный suite и smoke
прошли. Обе платформы собраны из source commit `ba9819ab5b241a979afcd543671d2c2fb09252f0`;
локальные ZIP находятся в `~/Downloads/WebPilot-0.6.46/`. GitHub 0.6.46 не публикуется
без отдельного поручения пользователя.

## Экспериментальный контракт — Codex App Server executor / scope 035

`docs/modules/codex-app-server-executor.md` сохраняет историю macOS A/B Codex App Server facade: каталог совпадает с Codex Local Mac 47/47, cloud/public duplicates исключены, Computer Use использует `node_repl -> @oai/sky`; T006 стабилизировал process identity, T007 завершил live smoke всех 47 tools и TextEdit input/capture. Первоначальная схема двух tunnel/connector остаётся историческим evidence.

## Действующий контракт — один macOS MCP connector / 0.6.47

Scope `stable-mcp-connector-036` завершает интеграцию scope 035: в ChatGPT используется один стабильный Secure MCP Tunnel/connector, а macOS Settings переключает только backend `Codex Local Mac | Codex App Server Local Mac`. Старый local LaunchAgent остаётся disabled, выбранный backend запускается MCP-only, стабильный WebPilot selector retarget-ит tunnel и восстанавливает выбор после login/reboot. Existing Codex Local Mac tunnel credentials при необходимости импортируются внутри private worker без вывода секрета. Финальная поставка 0.6.47 собрана из `acde362fc75645dff20f2e494604d9b2b5289403`; артефакты и hashes — `docs/RELEASE.md` и `docs/VERIFICATION.md`. GitHub 0.6.47 не публикуется без отдельного поручения пользователя.
- `docs/modules/chatgpt-dom-compatibility.md` — общий DOM adapter, фильтр, оформление и автопрокрутка, контракт 0.6.48.

Историческая локальная поставка 0.6.48: [RELEASE](RELEASE.md); живые проверки и ограничения Windows/login — [VERIFICATION](VERIFICATION.md); контракт DOM — [chatgpt-dom-compatibility](modules/chatgpt-dom-compatibility.md). Исторические версии в документах сохраняются как evidence, а не текущая поставка.

Исторический выпуск 0.6.49: RELEASE.md и VERIFICATION.md. Контракт независимого прогресса и цвета поля — `docs/modules/workspace-sessions.md`. Workflow Kit 1.4.1 сохраняется.

Исторический выпуск — 0.6.50: RELEASE.md, VERIFICATION.md. Контракт полной плашки — `docs/modules/workspace-sessions.md`; история 0.6.49 сохраняет причины исправления.

Исторический выпуск 0.6.51: RELEASE.md, VERIFICATION.md. Выбор первого проекта описан в `docs/modules/first-run-onboarding.md` и WORKSPACE_SETUP.md.

Текущий выпуск 0.6.69: [RELEASE](RELEASE.md), [VERIFICATION](VERIFICATION.md), naming planning — `docs/planning/session-title-sync.md`; single-active contract сохраняется в `docs/planning/single-active-plan-adaptation.md`. Canonical Workflow Kit 1.5.0 / 35 files / digest `0db567df…bbb2c75`; парная поставка находится в `~/Downloads/WebPilot-0.6.69/`.

## Удалённый интерфейс — исследование 2026-09-28

| Документ | Назначение |
| --- | --- |
| [Контракт исследования](planning/remote-project-ui-research.md) | Границы сравнения MCP UI и мобильного клиента; без реализации и изменения runtime |
| [Сравнительный отчёт](research/remote-project-ui-options-2026-09-28.md) | Первичные источники, предыдущий adapter, ограничения клиентов/PiP, мобильные основы, рекомендация и критерии следующего эксперимента |

Исследовательский scope `remote-project-ui-research-20260928` не меняет поставку 0.6.58 и не подтверждает ещё не выполненные проверки мобильного UI.

## Событийная обработка — планирование 2026-09-28

| Документ | Назначение |
| --- | --- |
| [Событийная обработка состояния Web Pilot](planning/event-driven-runtime.md) | Согласованный контракт трёх этапов; фаза 1 реализована в 0.6.64, включая ручной Send и восстановление разговора; 0.6.65 добавляет Resume stream unavailable, 0.6.66 — чистое поле нового Chat/Work, 0.6.67 — диагностику Send, 0.6.68 — Send без сверки черновика, 0.6.69 — экспериментальный Paste вместо медленного на живой странице insertText; фазы 2/3 ожидают отдельного продолжения |
