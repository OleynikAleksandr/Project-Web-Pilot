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
| [Событийная обработка состояния Web Pilot](planning/event-driven-runtime.md) | Согласованный контракт трёх этапов; фаза 1 реализована и выпущена серией 0.6.64–0.6.71, фаза 2 завершена в source 29.09.2026: файловые события/прогрев, startup-account через общий observer, удаление общего пульса и секундного обхода цветов. Фаза 3 — итоговые сопоставимые измерения, live/native проверки и парная поставка |
## Workflow Kit 1.5.1 / Web Pilot 0.6.72

## Актуальные дополнения
- [Автовыполнение](planning/auto-plan-continuation.md) — короткие этапы, частичный план, Продолжай и пауза.
- [История обзора](architecture/OVERVIEW.history-20260929.md).
- [История карты модулей](MODULES.history-20260929.md).
- [Прежний полный индекс](DOCUMENTATION_INDEX.history-20260929.md) — сохранённые описания прошлых выпусков.

Один current plan .harness/plans/todo-plan.md принадлежит checkout/worktree. Новая chat session продолжает его. Обязательный recovery содержит текущие OVERVIEW, MODULES, этот индекс и документы активного контракта; исторические документы читаются по необходимости.
