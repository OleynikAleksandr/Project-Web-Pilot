# Каталог документации

Связанные проекты (03.10.2026): **Workflow Kit** — планы и recovery; **Web Pilot Sidebar** — отдельно разрабатываемый браузерный интерфейс. [Рабочие каталоги и границы интеграции](SOURCE_WORKSPACES.md).

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

Предыдущая опубликованная парная поставка — **0.6.81 / Workflow Kit 1.5.2**. **Опубликован 0.6.82** ([контракт](planning/release-0.6.82-workflowkit-1.5.3.md)) — текущая локальная и опубликованная парная версия: bundled Workflow Kit **1.5.3** (35 файлов, SHA-256 `d59ae7b6b074e953fdd6c5d78d1f644902f0e7b9af5ad3c78d67d42f1f6a1c0f`) с командой `project:rename` — штатное переименование проекта. Release собран после предсборочной DOCS из source commit `85ffd3355b7fa9d945c1a703bc1027ce6c3ca2a7`; root `Project Web Pilot.app` и `/Applications/Project Web Pilot.app` обновлены до 0.6.82 без пересборки (общий ASAR SHA-256 `37766b5fc586d0934fe9f4c8da08c3ebd1db7359b600b26f6b34af7fe79c6770`). [GitHub Release v0.6.82](https://github.com/OleynikAleksandr/Project-Web-Pilot/releases/tag/v0.6.82) опубликован 2026-10-04T09:16:44Z; tag указывает на sourceCommit, пять assets сверены по серверным SHA-256. macOS подписан сертификатом Apple Development UkrHD; native Windows и clean VM 0.6.82 не проверялись. DOCS выполнена до release-сборки по [контракту 0.6.81](planning/release-0.6.81-workflowkit-1.5.2.md); package/installed gates завершены, GitHub Release v0.6.81 содержит пять проверенных assets. История сохранения ScreenCapture 0.6.80 — [отдельный контракт](planning/macos-screen-permission-stability.md).

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
| docs/planning/input-instruction-delivery-ordering.md | Канонический порядок DOCS → delivery, startupMessage guard и границы незапланированных build/publish |
| docs/planning/mcp-stateless-sessions.md | MCP App Server без сессий: перезапуск не ломает коннекторы через VPS; релиз 0.6.84 |
| docs/planning/chatgpt-channel-vps.md | Канал ChatGPT: Secure MCP Tunnel / VPS в Настройках, туннель VPS следует за портом MCP; релиз 0.6.83 |
| docs/planning/release-0.6.82-workflowkit-1.5.3.md | Release 0.6.82: bundled Workflow Kit 1.5.3 (project:rename), DOCS до build/package и GitHub publish |
| docs/planning/release-0.6.81-workflowkit-1.5.2.md | Release 0.6.81: DOCS до build/package и GitHub publish, bundled Workflow Kit 1.5.2 |
| docs/design/chat-message-layout-regression.md | Planning исправления пустого layout скрытых tool-call message/turn wrappers и regression coverage |
| docs/design/computer-use-latency-investigation.md | Planning и evidence исследования end-to-end задержек Computer Use, MCP, Secure MCP Tunnel и Web ChatGPT |
| docs/SOURCE_WORKSPACES.md | Связанные Project Web Pilot / Workflow Kit / Web Pilot Sidebar, рабочие каталоги, границы интеграции и исторические источники |
| docs/VERIFICATION.md | Проверки, release evidence и границы пользовательской приёмки |
| docs/RELEASE.md | Парный выпуск macOS/Windows, постоянный macOS app, Finder-алиас, ZIP, GitHub Release и проверка доставки |
| docs/CLEAN_INSTALL.md | Стенд Clean/Test macOS/Windows, историческое evidence первого запуска, обновление существующего Mac до 0.6.80 и границы clean/native-проверок |
| docs/TRANSFER_TO_WINDOWS.md | Опубликованная Windows x64 0.6.80, hashes и самостоятельная проверка |
| docs/WORKSPACE_SETUP.md | Создание/подключение workspace и install/upgrade Workflow Kit |
| docs/PROJECT_ARCHIVE.md | Архив workspace, возврат и безопасное локальное удаление; веб-чаты сохраняются |
## Обязательная навигация проекта
## Порядок чтения новой сессией
## Workflow Kit package и generated runtime
| Документ / файл | Назначение |
| --- | --- |
| `/Users/oleksandroliinyk/VSCODE/WorkflowKit/docs/modules/workflow-kit-package.md` | Canonical contract package `@webpilot/workflow-kit` |
| `docs/planning/workflow-kit-package-migration.md` | Контракт миграции WebPilot на package + staging |
| `scripts/check-workflow-kit-dependency.mjs` | Проверка resolved package, версии, exports, 35-файлового fileset и digest |
| `scripts/stage-workflow-kit.mjs` | Детерминированный generated staging в `resources/workflow-kit` |
| `scripts/check-workflow-kit-staging.mjs` | Проверка равенства generated runtime canonical package и идемпотентности |
## Действующий контракт — single active plan и чаты
| Документ | Назначение |
| --- | --- |
| docs/modules/session-owned-plans.md | Stable filename действующего 0.6.58 контракта: один current plan на checkout/worktree; sessions — chats, legacy ownership только history |
| docs/modules/workspace-sessions.md | Session store, Chat/Work navigation, backward-compatible legacy fields и проекция current plan |
| docs/modules/workflow-kit-recovery.md | Workflow Kit 1.5.2 source/runtime: checkout-scoped recovery, delivery ordering, migration legacy session plans и continuity |
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
## Экспериментальный контракт — Codex App Server executor / scope 035
## Действующий контракт — один macOS MCP connector / 0.6.47
- `docs/modules/chatgpt-dom-compatibility.md` — общий DOM adapter, фильтр, оформление и автопрокрутка, контракт 0.6.48.
## Удалённый интерфейс — исследование 2026-09-28
| Документ | Назначение |
| --- | --- |
| [Контракт исследования](planning/remote-project-ui-research.md) | Границы сравнения MCP UI и мобильного клиента; без реализации и изменения runtime |
| [Сравнительный отчёт](research/remote-project-ui-options-2026-09-28.md) | Первичные источники, предыдущий adapter, ограничения клиентов/PiP, мобильные основы, рекомендация и критерии следующего эксперимента |
## Событийная обработка — планирование 2026-09-28
| Документ | Назначение |
| --- | --- |
| [Событийная обработка состояния Web Pilot](planning/event-driven-runtime.md) | Завершённый контракт трёх этапов: фаза 1 — общий observer/дедупликация, фаза 2 — файловые события/прогрев и удаление постоянных опросов, фаза 3 — сопоставимые измерения, live Chat/Work на macOS и парная поставка 0.6.74; native Windows отмечен как отдельная непроведённая проверка |
## Workflow Kit 1.5.2 / опубликованная Web Pilot 0.6.81

## Web Pilot Sidebar — связанный репозиторий
- [Контракт DOM/Sidebar](modules/chatgpt-dom-compatibility.md) — общие browser-модули, публичные символы, pageScript и SHA-256.
- [Рабочие репозитории](SOURCE_WORKSPACES.md) — пути и роли Workflow Kit/Sidebar, актуальные README для локальной 0.6.80, расхождение Composer vendor lock и границы будущего Host API.

## Актуальные дополнения
- [Стабильное разрешение macOS на захват экрана](planning/macos-screen-permission-stability.md) — выбранная подпись UkrHD, строгий контроль staging/ZIP/обеих установок 0.6.80, реальный MCP-захват после обновления и перезагрузки, подтверждение пользователя об отсутствии новых запросов; T005 завершена.
- [Публикация 0.6.77/0.6.78 и актуализация WorkflowKit](planning/github-publication-0.6.77.md) — результат GitHub-поставки, актуализации README обоих репозиториев и финальной сверки.
- [Рефакторинг и Node 24](planning/refactoring-node24.md) — завершённый scope очистки, Node 24.21.0 / Electron 44.5.1, контракт Sidebar, опубликованный выпуск 0.6.75 и полученная приёмка.
- [Переход на один текущий план](planning/single-active-plan-adaptation.md) — исходный контракт адаптации Web Pilot к single-active Workflow Kit.
- [Клиентский AutoPlan с исправлением 0.6.78](planning/auto-plan-client-driven-refactor.md) — действующий контракт событийного reconcile, переключателя, обычных ответов, идентичности паузы/checkpoint и пользовательского ввода; опубликованная 0.6.78, историческая приёмка 0.6.77 и границы проверок.
- [Автовыполнение 0.6.73–0.6.76](planning/auto-plan-continuation.md) — исторический протокол коротких turn; заменён клиентским AutoPlan.
- [Надёжность AutoPlan 0.6.76](planning/auto-plan-reliability.md) — исторические исправления и опубликованный выпуск; архитектура заменена в 0.6.77.
- [История обзора](architecture/OVERVIEW.history-20260929.md).
- [История карты модулей](MODULES.history-20260929.md).
- [Прежний полный индекс](DOCUMENTATION_INDEX.history-20260929.md) — сохранённые описания прошлых выпусков.

Один current plan .harness/plans/todo-plan.md принадлежит checkout/worktree. Новая chat session продолжает его. Обязательный recovery содержит текущие OVERVIEW, MODULES, этот индекс и документы активного контракта; исторические документы читаются по необходимости.
