# Краткая архитектура проекта

Связанные проекты (02.10.2026): **Workflow Kit** — планы и recovery; **Web Pilot Sidebar** — отдельно разрабатываемый браузерный интерфейс. [Рабочие каталоги и границы интеграции](../SOURCE_WORKSPACES.md).

Project Web Pilot — Electron-приложение для macOS arm64 и Windows x64. Слева проекты, разговоры и текущий план; справа настоящий ChatGPT Web в изолированном Chromium. Файлы и команды доступны через MCP/tunnel; модельные API не используются.

Не запускай codex exec, других модельных агентов и не делегируй им работу, если пользователь прямо этого не попросил. Штатный codex app-server как локальный исполнитель MCP без модельных запросов разрешён.

## Текущее состояние

Поставка **0.6.78** для macOS arm64 и Windows x64: Electron **44.5.1**, встроенный и комплектный Node **24.21.0**, Workflow Kit **1.5.1**. Исправлен AutoPlan для ограниченного окна сообщений Work: native ID либо сохраняемый цикл генерации заменяет счётчики DOM. При загрузке истории отправка ожидает сообщения; отменённая собственная вставка очищается с сохранением пользовательских правок. Экспорт `pageOperation` и формат `pageScript` сохранены.

Поставка — `~/Downloads/WebPilot-0.6.78/`. Корневой `Project Web Pilot.app` и копия в `/Applications` обновлены с сохранением Finder identity. Оба ZIP сверены с 106 source/resource файлами. T004 (`88f8866`) прошла unit (496 PASS, 3 SKIP), Electron smoke и release-installed. Для применения нужен полный выход и повторный запуск. Живая приёмка 0.6.78, native Windows и чистый первый запуск не подтверждены.

[Исправление и ограничения 0.6.78](../planning/auto-plan-session-incident-20261003.md). На GitHub опубликована 0.6.78 с пятью проверенными файлами; 0.6.77 сохранена в истории выпусков. Publication scope расширен T003/T004 по сообщению о сбое и T005 по поручению опубликовать 0.6.78; выполненные задачи сохранены, архивирование не поручено.

[Клиентский AutoPlan](../planning/auto-plan-client-driven-refactor.md) реализован и проверен в T001–T005. История и evidence — [RELEASE](../RELEASE.md) и [VERIFICATION](../VERIFICATION.md). Пользователь принял прежний результат 0.6.77 и поручил закрыть scope рефакторинга (`46097fb`). [Выпуск v0.6.77](https://github.com/OleynikAleksandr/Project-Web-Pilot/releases/tag/v0.6.77) опубликован; README и main обоих репозиториев актуализированы отдельным publication scope. В WorkflowKit 1.5.1 minimum Node 22+ сохраняется; рабочая среда и клиент используют Node 24.21.0.

## Связь с Web Pilot Sidebar

Web Pilot Sidebar (`/Users/oleksandroliinyk/VSCODE/Web Pilot Sidebar`) — отдельный браузерный интерфейс, который другой агент разрабатывает параллельно. Workflow Kit владеет планом/recovery, Project Web Pilot — проектами, сессиями и локальным runtime; Sidebar переиспользует три browser-модуля адаптера. Сейчас у Sidebar тестовый хост этапа 0; production Host API в этом приложении ещё не реализован. Контракт и SHA-256 согласуются через [DOM/Sidebar](../modules/chatgpt-dom-compatibility.md), рабочие каталоги — [связанные репозитории](../SOURCE_WORKSPACES.md).

## Основные контракты
- Один checkout/worktree имеет один current plan: .harness/plans/todo-plan.md. Chat/Work sessions — разговоры с собственными URL, title и временем. Session ID не выбирает plan; legacy ownership только история. Независимая работа — отдельный worktree.
- Canonical Workflow Kit — /Users/oleksandroliinyk/VSCODE/WorkflowKit, package @webpilot/workflow-kit. resources/workflow-kit — ignored generated runtime; .harness/kit — установленный runtime проекта.
- Recovery строит Kit. Новая сессия получает полный актуальный пакет; просмотр старого разговора не отправляет его повторно. Paste использует обработчик страницы; передача завершается после Send без сверки текста и ожидания ответа. При неопределённом исходе автоматического дубля нет.
- PageStateSource получает события из sandboxed isolated preload только основного ChatGPT document. Проверяются frame/origin/document/sequence. Агентский секундомер следует Stop; busy не доказывает серверное состояние.
- ContextCache, fingerprint и проверка recovery принимают workspace без session selector; кеш общий для чатов checkout. Пакет по-прежнему строит canonical Workflow Kit, а актуальность проверяется перед вставкой. Настройка туннеля Windows идёт через мастер и configureWindowsTunnel; старый запуск внешней консоли удалён.
- PlanMonitor независим от доставки. Файловые сигналы означают перечитывание, а не журнал. Ошибки видимы, повторы ограничены; полный fingerprint остаётся перед вставкой.
- AutoPlan выполняет один последовательный событийный reconcile по toggle, странице, выбранному контексту и PlanMonitor. Saved on/off независим от фазы; busy не вызывает Git polling. Перед Send повторно проверяется подтверждённый ACTIVE-план. Native turn/user IDs, наблюдаемые циклы генерации и v3 checkpoint ledger исключают дубль sending/sent между OFF/ON, reload и restart. Draft сохраняется, ручной Send ждёт нового ответа; Stop с частичным ответом допускает подходящую idle-паузу. Текст ответа не определяет отправку. Watchdog только сообщает STALL_WARNING; sidebar показывает подтверждённый счётчик, diagnostics — причины без содержимого разговора.
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

## Подготовленный план — стабильное разрешение macOS

[Контракт](../planning/macos-screen-permission-stability.md): устранить подтверждённое TCC несовпадение подписи ScreenCapture через постоянную identity и проверяемую упаковку. T002 добавляет обязательную проверку явно выбранной identity и локальную подпись окончательного staging через штатный @electron/osx-sign. Реальная подписанная поставка и системное разрешение ещё не проверены; выбор сертификата остаётся перед первым использованием.
