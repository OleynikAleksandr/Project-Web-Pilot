# Начало работы

Связанные проекты (03.10.2026): **Workflow Kit** — планы и recovery; **Web Pilot Sidebar** — отдельно разрабатываемый браузерный интерфейс. [Рабочие каталоги и границы интеграции](SOURCE_WORKSPACES.md).

## Текущее состояние — 03.10.2026

**Опубликован 0.6.82** ([контракт](planning/release-0.6.82-workflowkit-1.5.3.md)) — текущая локальная и опубликованная парная версия: bundled Workflow Kit **1.5.3** (35 файлов, SHA-256 `d59ae7b6b074e953fdd6c5d78d1f644902f0e7b9af5ad3c78d67d42f1f6a1c0f`) с командой `project:rename` — штатное переименование проекта. Release собран после предсборочной DOCS из source commit `85ffd3355b7fa9d945c1a703bc1027ce6c3ca2a7`; root `Project Web Pilot.app` и `/Applications/Project Web Pilot.app` обновлены до 0.6.82 без пересборки (общий ASAR SHA-256 `37766b5fc586d0934fe9f4c8da08c3ebd1db7359b600b26f6b34af7fe79c6770`). [GitHub Release v0.6.82](https://github.com/OleynikAleksandr/Project-Web-Pilot/releases/tag/v0.6.82) опубликован 2026-10-04T09:16:44Z; tag указывает на sourceCommit, пять assets сверены по серверным SHA-256. macOS подписан сертификатом Apple Development UkrHD; native Windows и clean VM 0.6.82 не проверялись.

Предыдущая опубликованная парная версия — **0.6.81**: Electron **44.5.1**, Node **24.21.0**, bundled Workflow Kit **1.5.2** (35 файлов, SHA-256 `646fec106c498e004d8688a3bc40012bea1654178ce66a61b650211ab28055df`). Release собран после отдельного предсборочного DOCS-коммита из source commit `db59be83f0d3fa4136c109a8252181422acfe94c`; root `Project Web Pilot.app` и `/Applications/Project Web Pilot.app` имеют 0.6.81 и общий ASAR SHA-256 `4fc92297dafdf6afa2e97b0a504d774753a57f7c195a6a931477f9ea4beb8195`. [GitHub Release v0.6.81](https://github.com/OleynikAleksandr/Project-Web-Pilot/releases/tag/v0.6.81) опубликован 2026-10-03T18:07:01Z; tag указывает на sourceCommit, пять assets имеют серверные SHA-256, совпадающие с локальной поставкой. macOS подписан выбранным Apple Development сертификатом UkrHD; native Windows/clean VM не проверялись.

Корневой `Project Web Pilot.app` и копия в `/Applications` обновлены с сохранением Finder identity. Проверены строгие подписи staging, обеих установок и приложения из выданного ZIP. T004 подтвердила первичную миграцию разрешения и живой MCP-захват; T005 (`8a6d0dd`) подтвердила сохранение доступа после обновления 0.6.79 → 0.6.80 и настоящей перезагрузки Mac. Пользователь подтвердил работоспособность и отсутствие новых запросов. Подробности — [стабильное разрешение macOS](planning/macos-screen-permission-stability.md), [RELEASE](RELEASE.md) и [VERIFICATION](VERIFICATION.md).

Парная поставка **0.6.81** опубликована в [GitHub Release v0.6.81](https://github.com/OleynikAleksandr/Project-Web-Pilot/releases/tag/v0.6.81) и локально находится в `~/Downloads/WebPilot-0.6.81/`. Windows x64 прошёл `verify:win` на Mac; native Windows и clean VM 0.6.81 не проверены.

Функциональное поведение AutoPlan из 0.6.78 сохранено: native ID либо сохраняемый цикл генерации определяет паузу; загрузка истории ожидается, отменённая собственная вставка очищается с сохранением пользовательских правок. Публичные экспорты DOM/Composer и формат `pageScript` сохранены. [Контракт AutoPlan](planning/auto-plan-client-driven-refactor.md).

Node разработки, проверок и внешних workers — **^24.21.0** (не ниже 24.21.0 и ниже 25). Minimum текущего Workflow Kit 1.5.3 остаётся Node 22+.

## Продолжение current plan

Project Web Pilot передаёт recovery **текущего checkout**. Один checkout/worktree имеет один `.harness/plans/todo-plan.md`; новая Web Pilot session продолжает его. Session ID служит навигации чата и не выбирает план. Для первого ответа повторно запрашивать уже переданный пакет не нужно.

Если пакета нет, используйте `./scripts/workflow recover --format text`. Workflow Kit 1.5.3 принимает legacy `--session` как compatibility/no-op; `--plan` допустим только для current scope.

1. При NONE обсудите следующий этап по OVERVIEW, MODULES и DOCUMENTATION_INDEX.
2. Сопоставьте запрос с существующей частью проекта и её контрактом. При отсутствии контракта сначала создайте краткий planning/spec document.
3. Создайте current plan через plan:create/scope:create либо расширьте через plan:extend, сохраняя DONE и commit references.
4. Перед изменениями выполните task:start; каждую микрозадачу завершите управляемым commit с назначенными проверками. Build/package/sign/notarize/release/publish допустимы только в явно названной active-задаче; документы должны быть актуализированы и зафиксированы до build/GitHub publish. Для delivery-плана порядок: работа → DOCS → delivery. Один checkout имеет одного текущего писателя.
5. Финальная DOCS актуализирует действующие документы. Архивирование — только по прямому поручению пользователя.
6. Новый Chat/Work продолжает этот же plan. `plan:prepare`/`plan:bind` удалены; независимая параллельная работа требует отдельного Git worktree. `plan:carryover` переносит незавершённые задачи в новый scope с точным архивом прошлого только по поручению пользователя.

Любая рабочая сессия выполняет одну микрозадачу за ответ с task:start, проверкой и управляемым коммитом, независимо от AutoPlan. Штатное окончание ответа совпадает с коммитом видимой микрозадачи текущего checkout. Внутренние шаги другого репозитория сами по себе не повод заканчивать ответ; межрепозиторную работу нужно заранее разложить на понятные пользователю самостоятельные результаты. Промежуточная остановка требует реальной необходимости и указания сохранённого состояния, а не просто завершения отдельной команды. На безопасной промежуточной точке сохраняйте результат без DONE. Длительные команды запускайте фоном через MCP, сохраняйте process ID и при продолжении сначала читайте результат. Пользователь нужен только для необходимой информации, выбора или решения; технические ошибки исследуются самостоятельно. Правила последней строки определяются текущим поручением пользователя; клиент их не разбирает. [Действующий контракт](planning/auto-plan-client-driven-refactor.md).

## Разработка и выпуск

Общий source macOS/Windows — [Project-Web-Pilot](https://github.com/OleynikAleksandr/Project-Web-Pilot); canonical Kit — [WorkflowKit](https://github.com/OleynikAleksandr/WorkflowKit). Runtime, userData, ключи и платформенные сборки не переносятся в Git. Встроенный Chromium показывает ChatGPT Web; локальные действия идут через MCP/tunnel, модельных API нет.

Для изменений приложения обязательны Node suite и Electron smoke на изолированных fixtures; документальные задачи выполняют назначенные проверки Workflow Kit. Проверки внутри commit не запускаются отдельно на том же состоянии. Готовый проверенный бинарный релиз не пересобирается без изменения приложения.

`npm run build` последовательно собирает обе платформы и выдаёт общий manifest. build:mac требует явно выбранную Apple Development identity, подписывает окончательный bundle, проверяет подпись и обновляет постоянный app с сохранением Finder identity. Для публичной 0.6.80 повторно не пересобирали macOS: опубликован точный ZIP, уже проверенный после обновления/перезагрузки; Windows x64 собран отдельно штатным `build:win` и опубликован в том же релизе.

Живой ChatGPT, первый запуск и native Windows проверяет пользователь; агент не использует Computer Use и не запускает VM. Реальные чаты, профили и гостевые проекты не используются для разрушительных проверок. Предыдущие результаты и ограничения — [CLEAN_INSTALL](CLEAN_INSTALL.md) и [TRANSFER_TO_WINDOWS](TRANSFER_TO_WINDOWS.md).

## Контракты для чтения

- [Доставка контекста](CONTEXT_DELIVERY.md): Paste и завершение после Send; просмотр сохранённого чата не отправляет recovery повторно.
- [DOM и Sidebar](modules/chatgpt-dom-compatibility.md): публичные browser-модули, формат pageScript, ограничения импортов.
- [Один текущий план](modules/session-owned-plans.md), [скорость открытия](modules/session-opening-performance.md), [подготовка workspace](WORKSPACE_SETUP.md).
- [Каталог документации](DOCUMENTATION_INDEX.md) и [история выпусков](RELEASE.md).
