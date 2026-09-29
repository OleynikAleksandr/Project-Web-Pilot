# Краткая архитектура проекта

Project Web Pilot — Electron-приложение для macOS arm64 и Windows x64. Слева проекты, разговоры и текущий план; справа настоящий ChatGPT Web в изолированном Chromium. Файлы и команды доступны через MCP/tunnel; модельные API не используются.

Не запускай codex exec, других модельных агентов и не делегируй им работу, если пользователь прямо этого не попросил. Штатный codex app-server как локальный исполнитель MCP без модельных запросов разрешён.

## Текущее состояние
Установленный локальный выпуск — 0.6.73; Workflow Kit 1.5.1, Electron 44.3.0, встроенный Node 24.20.0. Постоянные приложения: Project Web Pilot.app в корне checkout и /Applications; ZIP — ~/Downloads/WebPilot-0.6.73/.
Фазы 1 и 2 событийного рефакторинга реализованы в source. T001 фазы 2 добавила файловые сигналы плана, событийный прогрев и ограниченный clipboard; T002 перевела startup-account на общий observer и удалила общий функциональный пульс 1500 мс; T003 убрала секундный safety-pass цветов в пользу событий editor/ancestor/theme/geometry. Текущая установленная поставка всё ещё 0.6.73 и этих T002/T003 не содержит: сопоставимые итоговые замеры, live Chat/Work, native Windows и парный релиз относятся к фазе 3. Автовыполнение реализовано: один ответ на контрольную точку, точное «Продолжай», учёт старых DONE и завершение после всех пунктов. Stop/вопрос ждут нового сообщения пользователя; выключение кнопкой отключает режим. Контракты — docs/planning/event-driven-runtime.md и docs/planning/auto-plan-continuation.md; доказательства и границы — RELEASE/VERIFICATION.

## Основные контракты
- Один checkout/worktree имеет один current plan: .harness/plans/todo-plan.md. Chat/Work sessions — разговоры с собственными URL, title и временем. Session ID не выбирает plan; legacy ownership только история. Независимая работа — отдельный worktree.
- Canonical Workflow Kit — /Users/oleksandroliinyk/VSCODE/WorkflowKit, package @webpilot/workflow-kit. resources/workflow-kit — ignored generated runtime; .harness/kit — установленный runtime проекта.
- Recovery строит Kit. Новая сессия получает полный актуальный пакет; просмотр старого разговора не отправляет его повторно. Paste использует обработчик страницы; передача завершается после Send без сверки текста и ожидания ответа. При неопределённом исходе автоматического дубля нет.
- PageStateSource получает события из sandboxed isolated preload только основного ChatGPT document. Проверяются frame/origin/document/sequence. Агентский секундомер следует Stop; busy не доказывает серверное состояние.
- PlanMonitor независим от доставки. Файловые сигналы означают перечитывание, а не журнал. Ошибки видимы, повторы ограничены; полный fingerprint остаётся перед вставкой.
- ConversationRecovery ограниченно восстанавливает известный URL при terminal stream error, включая Resume stream unavailable. Черновик, ручной Stop и rate limit учитываются; восстановление страницы не равно повторной генерации.
- Project Doctor чинит известные служебные неисправности current plan. Исторические планы не блокируют readiness.
- На macOS один стабильный tunnel обслуживает выбранный MCP backend: Codex Local Mac или Codex App Server Local Mac. App Server выполняет локальные инструменты без модельного turn/start. Службы живут независимо от UI.
- Новый этап дополняет current plan через plan:extend; DOCS завершает scope, архивирование только по прямому поручению. plan:carryover 1.5.1 переносит незавершённые задачи с точным архивом прошлого scope.
- Парный выпуск macOS/Windows — npm run build; сохранять identity постоянного app и Finder-алиас. Не использовать пользовательские сертификаты. Native Windows/live ChatGPT проверяются отдельно; VM и Computer Use не запускать.

## Навигация
[Модули](../MODULES.md), [индекс](../DOCUMENTATION_INDEX.md), [выпуск](../RELEASE.md), [проверки](../VERIFICATION.md).
[Общий контракт рефакторинга](../planning/event-driven-runtime.md), [автовыполнение](../planning/auto-plan-continuation.md).
Полная прежняя сводка с историей выпусков сохранена без потерь в [OVERVIEW.history-20260929.md](OVERVIEW.history-20260929.md); она не обязательна для каждого recovery.
