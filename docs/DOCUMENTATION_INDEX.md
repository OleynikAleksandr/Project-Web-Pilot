# Каталог документации

Состав и связи (06.10.2026): **Workflow Kit** — планы и recovery, пакет `packages/workflow-kit` этого репозитория; **Web Pilot Sidebar** — отдельно разрабатываемый браузерный интерфейс в своём репозитории. [Рабочие каталоги и границы интеграции](SOURCE_WORKSPACES.md).

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

**Текущая установленная и опубликованная версия — 0.6.95 / Workflow Kit 1.5.5; предыдущая — 0.6.94** ([контракт](planning/codex-native-tools-macos.md)). 0.6.95 убирает самодельную корзину: `delete_path`, `list_trash`, `restore_trash` и их код удалены, каталог macOS — 10 инструментов. Удаление выполняется как в Codex — `rm` через `exec_command` или `*** Delete File` в `apply_patch`; откат даёт git. Исполнитель при запуске убирает прежнюю папку `trash` только пустой. Полный `npm test`: 553 теста, 549 passed, 4 skipped, 0 failed; `npm run check:codex-tools` подтвердил `rust-v0.160.0`. Release собран один раз из source commit `7416c88c7a96b358b21b0f1744decee6fb5e3fb7`, обе macOS-копии установлены как 0.6.95 с ASAR `506cd28c9bf954fe732a53df0b6efba7d545d20e06bcdef68037a86546ae251d`; [GitHub Release v0.6.95](https://github.com/OleynikAleksandr/Project-Web-Pilot/releases/tag/v0.6.95) содержит ровно шесть проверенных assets. Bundled Workflow Kit — 1.5.5; его документы синхронизированы commit `6bbec655497eaea69d5c5825c68e9bdf78a01c18`. Остальные десять инструментов, `codex-tools.lock.json`, Windows-runtime и VPS channel не менялись. После обновления нужно перезапустить Web Pilot и обновить инструменты в ChatGPT. Native Windows и clean VM остаются отдельной приёмкой. История выпусков — [RELEASE.md](RELEASE.md).

**Предыдущая версия 0.6.94 / Workflow Kit 1.5.5** ([контракт](planning/codex-native-tools-macos.md)). 0.6.94 сохраняет 13-tool каталог, исправляет Wall time/race `write_stdin`, ограничивает command-output 8000 оценочных токенов, заполняет descriptions всех tools/parameters, добавляет image-result hint и единое pre-execution retry-rule. Release sourceCommit `24b04476…`, обе Mac-копии установлены, GitHub содержит ровно шесть проверенных assets; WorkflowKit docs синхронизированы commit `6c8ad190…`. Native Windows остаётся отдельной проверкой. `codex-tools.lock.json`, Windows-runtime и VPS channel не менялись. История выпусков — [RELEASE.md](RELEASE.md).

| Документ | Назначение |
| --- | --- |
| README.md | Актуальный запуск, пользовательское поведение, ограничения и разработка |
| docs/DECISIONS.md | Решения пользователя и зафиксированные границы полномочий |
| docs/CONTEXT_DELIVERY.md | Канонический контракт recovery capsule и доставки контекста в ChatGPT |
| docs/modules/workflow-kit-recovery.md | Specification Workflow Kit / Context Recovery / project continuity |
| docs/modules/project-doctor.md | Контракт автономного Доктора проекта и границы автоматического ремонта |
| docs/modules/runtime-lifecycle.md | Specification self-healing MCP/tunnel lifecycle |
| docs/modules/codex-app-server-executor.md | Единственный macOS executor: 13 tools с 0.6.92; 0.6.93 — stdin/timing correction; 0.6.94 — Wall time/race, output 8000, полный schema/image hint/retry-rule; опубликованная 0.6.95 — 10 tools, корзина удалена; lifecycle 0.6.91, наблюдение без UI control и исторический A/B |
| docs/modules/workspace-sessions.md | Specification проектов, Chat/Work sessions, session tree, переходов после scope, оформления и сохранения геометрии интерфейса |
| docs/planning/session-title-sync.md | Контракт auto/manual session title и server-side синхронизации с native ChatGPT Recents |
| docs/planning/input-instruction-delivery-ordering.md | Канонический порядок DOCS → delivery, startupMessage guard и границы незапланированных build/publish |
| docs/planning/computer-use-removal.md | Управление интерфейсом убрано из MCP на macOS и Windows; остаются список окон и снимки; запрет в правилах; релиз 0.6.90 |
| docs/planning/codex-native-tools-macos.md | 0.6.95: корзина удалена, каталог 10 tools; 0.6.92: 13-tool каталог; 0.6.93: stdin/write timing correction; 0.6.94: Wall time/race, output 8000, полный tool schema/image hint/retry-rule, все документы и Workflow Kit docs; Windows без изменений, DOCS → delivery |
| docs/planning/codex-local-mac-removal.md | 0.6.91: Codex Local Mac удалён; macOS только через Codex App Server (первый запуск, одноразовая очистка); в пакете только приложение; ZIP Windows-runtime — шестой файл релиза |
| docs/planning/release-backups-kit-1.5.5.md | Одна резервная копия установки на цель вне Spotlight; Workflow Kit 1.5.5 (push только после DOCS); релиз 0.6.89 |
| docs/planning/mcp-start-message.md | Web Pilot начинает MCP-сессию коротким стартовым сообщением; релиз 0.6.88 |
| docs/planning/mcp-sequential-parts-kit-1.5.4.md | Части контекста строго по одной (ключ after), компактный recovery Workflow Kit 1.5.4; релиз 0.6.87 |
| docs/planning/mcp-context-delivery.md | Контекст проекта через MCP частями без вставки recovery в ChatGPT; правила сессии в MCP; релиз 0.6.86 |
| docs/planning/computer-use-keys-batch.md | Computer Use: имена клавиш X11 и пакет действий computer_actions; подписи канала VPS; возврат к проекту после архива; релиз 0.6.85 |
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
| `packages/workflow-kit/README.md` | Пакет `@webpilot/workflow-kit` в этом репозитории: модель, устройство, проверка, как меняется Kit, история версий |
| `packages/workflow-kit/docs/modules/workflow-kit-package.md` | Техническая спецификация пакета: контракт текущего плана, API потребителя, перенос старых планов, runtime, проверки |
| `packages/workflow-kit/docs/planning/delivery-ordering-policy.md` | Kit: порядок DOCS → delivery и запрет незапланированных build/publish |
| `packages/workflow-kit/docs/planning/push-after-docs.md` | Kit 1.5.5: push только после DOCS текущего плана (pre-push) |
| `packages/workflow-kit/docs/planning/compact-recovery.md` | Kit 1.5.4: компактный recovery, формы и карты по запросу |
| `packages/workflow-kit/docs/planning/project-rename.md` | Kit 1.5.3: команда project:rename |
| `packages/workflow-kit/docs/planning/single-active-plan-migration.md` | Kit 1.5.0: переход к одному current plan на checkout |
| `packages/workflow-kit/docs/planning/canonical-workflow-kit-package.md` | Исторический план выделения пакета |
| `docs/planning/context-as-text.md` | 0.6.96: объединение репозиториев, Workflow Kit 1.5.6, контекст текстом, паритет Windows |
| `docs/planning/workflow-kit-package-migration.md` | Контракт миграции WebPilot на package + staging |
| `scripts/check-workflow-kit-dependency.mjs` | Зависимость ведёт в `packages/workflow-kit`, одна версия в `package.json` и `common.mjs`, экспорты; состав и digest исходника пакета |
| `scripts/stage-workflow-kit.mjs` | Детерминированный generated staging в `resources/workflow-kit` |
| `scripts/check-workflow-kit-staging.mjs` | Копия `resources/workflow-kit` равна исходнику пакета файл в файл; повторная подготовка ничего не меняет |
| `npm run check --prefix packages/workflow-kit` | Собственные проверки пакета (в плане — `kit-check`): состав, контракт потребителя, установка в пробный проект, перенос плана |
## Действующий контракт — single active plan и чаты
| Документ | Назначение |
| --- | --- |
| docs/modules/session-owned-plans.md | Stable filename действующего 0.6.58 контракта: один current plan на checkout/worktree; sessions — chats, legacy ownership только history |
| docs/modules/workspace-sessions.md | Session store, Chat/Work navigation, backward-compatible legacy fields и проекция current plan |
| docs/modules/workflow-kit-recovery.md | Текущий Workflow Kit 1.5.5: checkout-scoped recovery и continuity; delivery ordering с 1.5.2; migration legacy session plans и compact recovery |
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
## Исторический переход Workflow Kit 1.5.2 / Web Pilot 0.6.81

## Web Pilot Sidebar — связанный репозиторий
- [Контракт DOM/Sidebar](modules/chatgpt-dom-compatibility.md) — общие browser-модули, публичные символы, pageScript и SHA-256.
- [Рабочие репозитории](SOURCE_WORKSPACES.md) — текущие пути и роли Project Web Pilot / Workflow Kit / Sidebar, фактические версии source/runtime и отдельный исторический снимок синхронизации 0.6.80.

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
