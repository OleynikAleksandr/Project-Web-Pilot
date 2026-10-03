# Краткая архитектура проекта

Связанные проекты (02.10.2026): **Workflow Kit** — планы и recovery; **Web Pilot Sidebar** — отдельно разрабатываемый браузерный интерфейс. [Рабочие каталоги и границы интеграции](../SOURCE_WORKSPACES.md).

Project Web Pilot — Electron-приложение для macOS arm64 и Windows x64. Слева проекты, разговоры и текущий план; справа настоящий ChatGPT Web в изолированном Chromium. Файлы и команды доступны через MCP/tunnel; модельные API не используются.

Не запускай codex exec, других модельных агентов и не делегируй им работу, если пользователь прямо этого не попросил. Штатный codex app-server как локальный исполнитель MCP без модельных запросов разрешён.

## Текущее состояние

Выпуск **0.6.77** для macOS arm64 и Windows x64: Electron **44.5.1**, встроенный и комплектный Node **24.21.0**, Workflow Kit **1.5.1**. AutoPlan принадлежит клиенту: переключатель можно менять в любой момент; при включённом режиме подходящая пауза незавершённого ACTIVE-плана получает ровно одно точное «Продолжай». Стартовая AutoPlan-инструкция и управляющие строки ответа удалены. Контракт Web Pilot Sidebar, экспорт `pageOperation` и формат `pageScript` сохранены.

Поставка — `~/Downloads/WebPilot-0.6.77/`. Корневой `Project Web Pilot.app` и копия в `/Applications` обновлены с сохранением Finder identity. Оба ZIP и metadata сверены с 106 source/resource файлами; node24, unit, Electron smoke и package/installed gate прошли в T005 (`0b8335c`). 02.10.2026 пользователь подтвердил общую приёмку 0.6.77: всё работает в соответствии с обсуждённым контрактом. Отдельные native Windows и чистый первый запуск в сообщении о приёмке не перечислены.

[Клиентский AutoPlan](../planning/auto-plan-client-driven-refactor.md) реализован и проверен в T001–T005. История и evidence — [RELEASE](../RELEASE.md) и [VERIFICATION](../VERIFICATION.md). Пользователь принял результат и поручил закрыть scope рефакторинга (`46097fb`). [Выпуск v0.6.77](https://github.com/OleynikAleksandr/Project-Web-Pilot/releases/tag/v0.6.77) опубликован; README и main обоих репозиториев актуализированы отдельным publication scope. В WorkflowKit 1.5.1 minimum Node 22+ сохраняется; рабочая среда и клиент используют Node 24.21.0.

## Связь с Web Pilot Sidebar

Web Pilot Sidebar (`/Users/oleksandroliinyk/VSCODE/Web Pilot Sidebar`) — отдельный браузерный интерфейс, который другой агент разрабатывает параллельно. Workflow Kit владеет планом/recovery, Project Web Pilot — проектами, сессиями и локальным runtime; Sidebar переиспользует три browser-модуля адаптера. Сейчас у Sidebar тестовый хост этапа 0; production Host API в этом приложении ещё не реализован. Контракт и SHA-256 согласуются через [DOM/Sidebar](../modules/chatgpt-dom-compatibility.md), рабочие каталоги — [связанные репозитории](../SOURCE_WORKSPACES.md).

## Основные контракты
- Один checkout/worktree имеет один current plan: .harness/plans/todo-plan.md. Chat/Work sessions — разговоры с собственными URL, title и временем. Session ID не выбирает plan; legacy ownership только история. Независимая работа — отдельный worktree.
- Canonical Workflow Kit — /Users/oleksandroliinyk/VSCODE/WorkflowKit, package @webpilot/workflow-kit. resources/workflow-kit — ignored generated runtime; .harness/kit — установленный runtime проекта.
- Recovery строит Kit. Новая сессия получает полный актуальный пакет; просмотр старого разговора не отправляет его повторно. Paste использует обработчик страницы; передача завершается после Send без сверки текста и ожидания ответа. При неопределённом исходе автоматического дубля нет.
- PageStateSource получает события из sandboxed isolated preload только основного ChatGPT document. Проверяются frame/origin/document/sequence. Агентский секундомер следует Stop; busy не доказывает серверное состояние.
- ContextCache, fingerprint и проверка recovery принимают workspace без session selector; кеш общий для чатов checkout. Пакет по-прежнему строит canonical Workflow Kit, а актуальность проверяется перед вставкой. Настройка туннеля Windows идёт через мастер и configureWindowsTunnel; старый запуск внешней консоли удалён.
- PlanMonitor независим от доставки. Файловые сигналы означают перечитывание, а не журнал. Ошибки видимы, повторы ограничены; полный fingerprint остаётся перед вставкой.
- AutoPlan выполняет один последовательный событийный reconcile по toggle, странице, выбранному контексту и PlanMonitor. Saved on/off независим от фазы; busy не вызывает Git polling. Перед Send повторно проверяется подтверждённый ACTIVE-план. Stable turn/user IDs и v2 checkpoint ledger исключают дубль sending/sent между OFF/ON, reload и restart. Draft сохраняется, ручной Send ждёт нового ответа; Stop с частичным ответом допускает подходящую idle-паузу. Текст ответа не определяет отправку. Watchdog только сообщает STALL_WARNING; sidebar показывает подтверждённый счётчик, diagnostics — причины без содержимого разговора.
- ConversationRecovery ограниченно восстанавливает известный URL при terminal stream error, включая Resume stream unavailable. Черновик, ручной Stop и rate limit учитываются; восстановление страницы не равно повторной генерации.
- Project Doctor чинит известные служебные неисправности current plan. Исторические планы не блокируют readiness.
- Панель настроек — src/ui/settings-panel.mjs (settingsPanelView). Кнопка «Архив…» открывает отдельное окно с archive:* IPC; скрытого встроенного архива и старых pilot:* обработчиков удаления нет. settings хранит workspace для выбора проекта в Докторе, включая ошибку восстановления удаления при старте; archives в снимке остаётся для наблюдения за архивированием.
- Общие файловые функции находятся в src/common.mjs: потоковый SHA-256, exists (строгий режим для очистки истории) и создание ошибок fail. src/tunnel-setup.mjs объединяет обмен с first-run helper, передачу credentials через stdin и фильтрацию ошибок; платформенные обёртки задают прежние env, классы ошибок и пользовательские сообщения. Scripts импортируют src, обратных зависимостей нет; самостоятельные Python/resources-workers не зависят от src.
- На macOS один стабильный tunnel обслуживает выбранный MCP backend: Codex Local Mac или Codex App Server Local Mac. App Server выполняет локальные инструменты без модельного turn/start. Службы живут независимо от UI.
- Новый этап дополняет current plan через plan:extend; DOCS завершает scope, архивирование только по прямому поручению. plan:carryover 1.5.1 переносит незавершённые задачи с точным архивом прошлого scope.
- Парный выпуск macOS/Windows — npm run build; сохранять identity постоянного app и Finder-алиас. Не использовать пользовательские сертификаты. Native Windows/live ChatGPT проверяются отдельно; VM и Computer Use не запускать.

## Навигация
[Модули](../MODULES.md), [индекс](../DOCUMENTATION_INDEX.md), [выпуск](../RELEASE.md), [проверки](../VERIFICATION.md).
[Общий контракт рефакторинга](../planning/event-driven-runtime.md), [клиентское автопродолжение](../planning/auto-plan-client-driven-refactor.md).
Полная прежняя сводка с историей выпусков сохранена без потерь в [OVERVIEW.history-20260929.md](OVERVIEW.history-20260929.md); она не обязательна для каждого recovery.
