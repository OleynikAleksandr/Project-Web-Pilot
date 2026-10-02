# Начало работы

Связанные проекты (02.10.2026): **Workflow Kit** — планы и recovery; **Web Pilot Sidebar** — отдельно разрабатываемый браузерный интерфейс. [Рабочие каталоги и границы интеграции](SOURCE_WORKSPACES.md).

## Текущее состояние — 02.10.2026

Выпуск **0.6.75** для macOS arm64 и Windows x64: Electron **44.5.1**, встроенный и комплектный Node **24.21.0**, Workflow Kit **1.5.1**. Node разработки, проверок и внешних workers — **^24.21.0** (не ниже 24.21.0 и ниже 25). Очистка мёртвого кода и дубликатов сохраняет поведение 0.6.74 и событийный runtime. Экспорт `pageOperation` восстановлен для Web Pilot Sidebar; формат `pageScript` сохранён.

Поставка — `/Downloads/WebPilot-0.6.75/`. Корневой `Project Web Pilot.app` и копия в `/Applications` обновляются с сохранением Finder-identity. После обновления полностью завершите приложение и запустите его снова. Автоматические проверки сборки не заменяют пользовательскую приёмку T010; live Chat/Work новой версии, native Windows и чистый первый запуск ещё не проверены.

История и evidence — [RELEASE](RELEASE.md). [Текущий план](planning/refactoring-node24.md) разделяет сборку/публикацию T009 и повторяемую installed-проверку с пользовательской приёмкой T010. Пользователь поручил синхронизацию main и публикацию [v0.6.75](https://github.com/OleynikAleksandr/Project-Web-Pilot/releases/tag/v0.6.75) с двумя архивами. Публикация не закрывает T010 и не архивирует scope.

## Продолжение current plan

Project Web Pilot передаёт recovery **текущего checkout**. Один checkout/worktree имеет один `.harness/plans/todo-plan.md`; новая Web Pilot session продолжает его. Session ID служит навигации чата и не выбирает план. Для первого ответа повторно запрашивать уже переданный пакет не нужно.

Если пакета нет, используйте `./scripts/workflow recover --format text`. Workflow Kit 1.5.1 принимает legacy `--session` как compatibility/no-op; `--plan` допустим только для current scope.

1. При NONE обсудите следующий этап по OVERVIEW, MODULES и DOCUMENTATION_INDEX.
2. Сопоставьте запрос с существующей частью проекта и её контрактом. При отсутствии контракта сначала создайте краткий planning/spec document.
3. Создайте current plan через plan:create/scope:create либо расширьте через plan:extend, сохраняя DONE и commit references.
4. Перед изменениями выполните task:start; каждую микрозадачу завершите управляемым commit с назначенными проверками. Один checkout имеет одного текущего писателя.
5. Финальная DOCS актуализирует действующие документы. Архивирование — только по прямому поручению пользователя.
6. Новый Chat/Work продолжает этот же plan. `plan:prepare`/`plan:bind` удалены; независимая параллельная работа требует отдельного Git worktree. `plan:carryover` переносит незавершённые задачи в новый scope с точным архивом прошлого только по поручению пользователя.

В режиме автовыполнения один ответ ограничен одной микрозадачей с проверкой и коммитом. На безопасной промежуточной точке сохраните результат без DONE. Длительные команды запускайте фоном через MCP, сохраните process ID и после продолжения сначала прочитайте его результат. При вопросе остановитесь и дождитесь пользователя. Правила завершения ответа — в поручении пользователя и [контракте автовыполнения](planning/auto-plan-continuation.md).

## Разработка и выпуск

Общий source macOS/Windows — [Project-Web-Pilot](https://github.com/OleynikAleksandr/Project-Web-Pilot); canonical Kit — [WorkflowKit](https://github.com/OleynikAleksandr/WorkflowKit). Runtime, userData, ключи и платформенные сборки не переносятся в Git. Встроенный Chromium показывает ChatGPT Web; локальные действия идут через MCP/tunnel, модельных API нет.

Для изменений приложения обязательны Node suite и Electron smoke на изолированных fixtures; документальные задачи выполняют назначенные проверки Workflow Kit. Проверки внутри commit не запускаются отдельно на том же состоянии. Готовый проверенный бинарный релиз не пересобирается без изменения приложения.

`npm run build` последовательно собирает обе платформы и выдаёт общий manifest. Внутренний шаг build:mac обновляет постоянный `Project Web Pilot.app` в корне workspace с сохранением Finder-identity и создаёт ZIP. Для текущего scope сборку 0.6.75 запускает только проверка paired-release внутри commit T009; T010 проверяет уже готовые файлы. Обновление работающего приложения применяется после полного выхода и повторного запуска. Новая публикация GitHub выполняется по отдельному поручению.

Живой ChatGPT, первый запуск и native Windows проверяет пользователь; агент не использует Computer Use и не запускает VM. Реальные чаты, профили и гостевые проекты не используются для разрушительных проверок. Предыдущие результаты и ограничения — [CLEAN_INSTALL](CLEAN_INSTALL.md) и [TRANSFER_TO_WINDOWS](TRANSFER_TO_WINDOWS.md).

## Контракты для чтения

- [Доставка контекста](CONTEXT_DELIVERY.md): Paste и завершение после Send; просмотр сохранённого чата не отправляет recovery повторно.
- [DOM и Sidebar](modules/chatgpt-dom-compatibility.md): публичные browser-модули, формат pageScript, ограничения импортов.
- [Один текущий план](modules/session-owned-plans.md), [скорость открытия](modules/session-opening-performance.md), [подготовка workspace](WORKSPACE_SETUP.md).
- [Каталог документации](DOCUMENTATION_INDEX.md) и [история выпусков](RELEASE.md).
