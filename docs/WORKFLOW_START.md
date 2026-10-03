# Начало работы

Связанные проекты (02.10.2026): **Workflow Kit** — планы и recovery; **Web Pilot Sidebar** — отдельно разрабатываемый браузерный интерфейс. [Рабочие каталоги и границы интеграции](SOURCE_WORKSPACES.md).

## Текущее состояние — 03.10.2026

Выпуск **0.6.77** для macOS arm64 и Windows x64: Electron **44.5.1**, встроенный и комплектный Node **24.21.0**, Workflow Kit **1.5.1**. AutoPlan принадлежит клиенту: переключатель можно менять в любой момент; при включённом режиме подходящая пауза незавершённого ACTIVE-плана получает ровно одно точное «Продолжай». Стартовая AutoPlan-инструкция и управляющие строки ответа удалены. Контракт Web Pilot Sidebar, экспорт `pageOperation` и формат `pageScript` сохранены.

Поставка — `~/Downloads/WebPilot-0.6.77/`. Корневой `Project Web Pilot.app` и копия в `/Applications` обновлены с сохранением Finder identity. Оба ZIP и metadata сверены с 106 source/resource файлами; node24, unit, Electron smoke и package/installed gate прошли в T005 (`0b8335c`). 02.10.2026 пользователь подтвердил общую приёмку 0.6.77: всё работает в соответствии с обсуждённым контрактом. Отдельные native Windows и чистый первый запуск в сообщении о приёмке не перечислены.

[Клиентский AutoPlan](planning/auto-plan-client-driven-refactor.md) реализован и проверен; scope рефакторинга принят и закрыт (`46097fb`). [Выпуск v0.6.77](https://github.com/OleynikAleksandr/Project-Web-Pilot/releases/tag/v0.6.77) опубликован с проверенными архивами. [Publication scope](planning/github-publication-0.6.77.md) подтвердил публикации, актуализировал README и синхронизировал оба репозитория. WorkflowKit 1.5.1 сохраняет minimum Node 22+; рабочая среда обоих проектов — Node 24.21.0. История и evidence — [RELEASE](RELEASE.md) и [VERIFICATION](VERIFICATION.md).

Node разработки, проверок и внешних workers — **^24.21.0** (не ниже 24.21.0 и ниже 25).

## Продолжение current plan

Project Web Pilot передаёт recovery **текущего checkout**. Один checkout/worktree имеет один `.harness/plans/todo-plan.md`; новая Web Pilot session продолжает его. Session ID служит навигации чата и не выбирает план. Для первого ответа повторно запрашивать уже переданный пакет не нужно.

Если пакета нет, используйте `./scripts/workflow recover --format text`. Workflow Kit 1.5.1 принимает legacy `--session` как compatibility/no-op; `--plan` допустим только для current scope.

1. При NONE обсудите следующий этап по OVERVIEW, MODULES и DOCUMENTATION_INDEX.
2. Сопоставьте запрос с существующей частью проекта и её контрактом. При отсутствии контракта сначала создайте краткий planning/spec document.
3. Создайте current plan через plan:create/scope:create либо расширьте через plan:extend, сохраняя DONE и commit references.
4. Перед изменениями выполните task:start; каждую микрозадачу завершите управляемым commit с назначенными проверками. Один checkout имеет одного текущего писателя.
5. Финальная DOCS актуализирует действующие документы. Архивирование — только по прямому поручению пользователя.
6. Новый Chat/Work продолжает этот же plan. `plan:prepare`/`plan:bind` удалены; независимая параллельная работа требует отдельного Git worktree. `plan:carryover` переносит незавершённые задачи в новый scope с точным архивом прошлого только по поручению пользователя.

Любая рабочая сессия выполняет одну микрозадачу за ответ с task:start, проверкой и управляемым коммитом, независимо от AutoPlan. Штатное окончание ответа совпадает с коммитом видимой микрозадачи текущего checkout. Внутренние шаги другого репозитория сами по себе не повод заканчивать ответ; межрепозиторную работу нужно заранее разложить на понятные пользователю самостоятельные результаты. Промежуточная остановка требует реальной необходимости и указания сохранённого состояния, а не просто завершения отдельной команды. На безопасной промежуточной точке сохраняйте результат без DONE. Длительные команды запускайте фоном через MCP, сохраняйте process ID и при продолжении сначала читайте результат. Пользователь нужен только для необходимой информации, выбора или решения; технические ошибки исследуются самостоятельно. Правила последней строки определяются текущим поручением пользователя; клиент их не разбирает. [Действующий контракт](planning/auto-plan-client-driven-refactor.md).

## Разработка и выпуск

Общий source macOS/Windows — [Project-Web-Pilot](https://github.com/OleynikAleksandr/Project-Web-Pilot); canonical Kit — [WorkflowKit](https://github.com/OleynikAleksandr/WorkflowKit). Runtime, userData, ключи и платформенные сборки не переносятся в Git. Встроенный Chromium показывает ChatGPT Web; локальные действия идут через MCP/tunnel, модельных API нет.

Для изменений приложения обязательны Node suite и Electron smoke на изолированных fixtures; документальные задачи выполняют назначенные проверки Workflow Kit. Проверки внутри commit не запускаются отдельно на том же состоянии. Готовый проверенный бинарный релиз не пересобирается без изменения приложения.

`npm run build` последовательно собирает обе платформы и выдаёт общий manifest. Внутренний build:mac обновляет постоянный app в корне workspace с сохранением Finder identity и создаёт ZIP. T005 собрала 0.6.77 отдельно и проверила готовые файлы через package/installed gate в commit без пересборки; /Applications обновлена штатным installMacBundle. Новая версия применяется после полного выхода и повторного запуска. Публикация GitHub — по отдельному поручению.

Живой ChatGPT, первый запуск и native Windows проверяет пользователь; агент не использует Computer Use и не запускает VM. Реальные чаты, профили и гостевые проекты не используются для разрушительных проверок. Предыдущие результаты и ограничения — [CLEAN_INSTALL](CLEAN_INSTALL.md) и [TRANSFER_TO_WINDOWS](TRANSFER_TO_WINDOWS.md).

## Контракты для чтения

- [Доставка контекста](CONTEXT_DELIVERY.md): Paste и завершение после Send; просмотр сохранённого чата не отправляет recovery повторно.
- [DOM и Sidebar](modules/chatgpt-dom-compatibility.md): публичные browser-модули, формат pageScript, ограничения импортов.
- [Один текущий план](modules/session-owned-plans.md), [скорость открытия](modules/session-opening-performance.md), [подготовка workspace](WORKSPACE_SETUP.md).
- [Каталог документации](DOCUMENTATION_INDEX.md) и [история выпусков](RELEASE.md).
