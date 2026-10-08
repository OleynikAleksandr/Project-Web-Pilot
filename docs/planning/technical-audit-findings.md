# Технический аудит — рабочий реестр

## T001. Базовая линия и матрица охвата

**Статус:** инвентаризация и методика проверки; поиск/подтверждение дефектов ещё не проводились. **Исходный HEAD после публикации плана:** `5c526a4079c987b4c9efb35a7c3f76aae6332d90`, версия приложения `0.6.103`, Workflow Kit `1.6.4`, Electron `44.5.1`, Node `24.21.0`. На старте T001 `git status --short` был пуст; затем `task:start T001` штатно изменил управляемый Kit `.harness/plans/todo-plan.md`. Последующие commits Kit изменят HEAD; в итоговой сверке сравнивать с зафиксированным исходным коммитом, выделять управляемый план и собственные документы, не считать их изменениями исходников приложения.

### Учтённые пути

Снимок `git ls-files | awk -F/ '{print $1}' | sort | uniq -c` до начала T001: `src` 58, `tests` 58, `packages` 46, `scripts` 20, `tools` 8, исходные `resources` 6, `docs` 19 (включая спецификацию аудита), `.harness` 38 управляемых файлов; отдельно README, AGENTS, package.json, package-lock.json, Windows CMD, настройки и LICENSE. Числа означают отслеживаемые файлы верхнего каталога, а не число модулей или подтверждённую работоспособность. Более ранняя команда `rg --files` показывает также генерируемые/игнорируемые файлы; для основного охвата использовать `git ls-files` и адресные проверки generators.

### Матрица запланированных проверок

| Подсистема / реальные входы | Дублирование T002 | Связи T003 | Неиспользуемое T004 | Ошибки / ресурсы T005 |
| --- | --- | --- | --- | --- |
| Electron main, `src/main.mjs`: `app`, `BaseWindow`, `WebContentsView`, `ipcMain`, навигация/закрытие | Валидации, IPC guards, константы | Imports, preload, IPC channels | Handlers, динамические вызовы | Неопределённый Send, гонки, окна, timers |
| UI и preload: `src/ui/*`, `src/preload.cjs`, `src/archive-preload.cjs`, окно цветов | Формы/состояния/проверки | HTML, assets, IPC/DOM hooks | Event handlers, exports | Обновление/отписка, ошибки UI |
| ChatGPT adapter: `chatgpt-dom`, `chatgpt-composer`, `chatgpt-experience`, observer и page-state | DOM routines / selectors | Статические и сериализованные функции | Публичные API Sidebar, pageScript | Turn lifecycle, наблюдатель, повтор отправки |
| Проекты/сессии/контекст: `workspace-session`, `context-*`, `session-plans`, `conversation-recovery` | Файловые/контекстные правила | Workers, input/output, Git refs | Входы start/reopen/recover | Смена проекта/чата, cleanup и ошибки |
| Review/AutoPlan/plan view: `plan-review`, `review-continuation`, `automation-send-state`, `auto-plan*`, `plan-monitor` | Guards и state transitions | Kit CLI ↔ UI/IPC | Callbacks и legacy fallback | Подписки, таймеры, idempotency, неизвестный результат |
| Службы и onboarding: `mcp-runtime`, `vps-tunnel`, `mac-runtime-switch`, `windows-runtime`, `browser-startup`, `startup-*`, `tunnel-*` | Platform-shared rules | Исполняемые пути/порт/ресурсы | Платформенные ветки | Process/service lifetime, разрешения, restart |
| Создание/архив/доктор: `workspace-setup`, `workspace-deletion`, `project-doctor`, `resources/*worker*` | Проверки путей и форматы | Worker bundling/IPC, assets | CLI/job entrypoints | Отказ, отмена, rollback, cleanup |
| Workflow Kit — `packages/workflow-kit/**`, `scripts/workflow*`, .harness конфигурация | CLI/schema/документные нормы | package staging, Git paths, commands | Экспорты CLI, hooks | Transactions, review/commit, отказ и recovery |
| Local executor: `tools/codex-app-server-mcp/**` | Platform-safe guards | Python entrypoints, pinned tools | Registered MCP interface | stdin/commands/long sessions, shutdown |
| Build/scripts/resources: `scripts/**`, `resources/**`, `package.json`, CMD, lockfile | Platform packaging logic | npm scripts, asar, extra-resource, generator | Dependencies/assets | Failure propagation, temp outputs |
| Тесты и документация: `tests/**`, `docs/**`, README/AGENTS | Повторённые правила vs fixtures | Markdown anchors, Git blobs, references | Obsolete test/config | Проверки ошибок и охват lifecycle |

Для каждой строки T002–T005 заполнить проверенный охват (пути/команды), находки либо «не обнаружено в проверенном объёме», ограничения и исключения. Сводная матрица не означает, что проверки уже исполнены.

### Точки входа и метод подтверждения

- `package.json`: `main=src/main.mjs`, `npm start` → `electron .`, `npm test` → `node --test tests/*.test.mjs`, `npm run smoke` → `electron . --smoke`, `npm run build` → `scripts/release-all.mjs`; build служит предметом статического чтения, **не запускается**.
- В `src/main.mjs` наблюдаются прямые `ipcMain.handle` и обёртки регистрации каналов (около строк 569, 585, 937, 1181, 1227), `BaseWindow` и два `WebContentsView` (около 1231–1236). Это подтверждает наличие Electron/IPC точек входа, но не доказывает полноту их вызовов. Проверка: сопоставить sender guards, preload exposed API и вызовы UI.
- Для Kit: команды `./scripts/workflow`, маршрутизация в `packages/workflow-kit/src/cli.mjs`, пакетный источник `packages/workflow-kit` и генератор `scripts/stage-workflow-kit.mjs`. Для executor: Python control/registered tools в `tools/codex-app-server-mcp`. Для workers — найти инициаторы запуска и проверить относительно упаковки.
- Для динамических путей проверять `rg` совместно с анализом импортов, IPC, событий и запускаемых скриптов; отрицательный поиск не считать доказательством недостижимости. Исторические ссылки проверять через `git cat-file`/`git show` на конкретных SHA; локальные ссылки — по относительному пути и якорям, отдельно case sensitivity.
- Доказательства будущих замечаний: `путь:строка`, точный достижимый сценарий/команда, фактический результат, минимальная правка и её верификация, severity, последствия и риски для macOS/Windows/Sidebar. Список разделять на **A подтверждённые дефекты**, **B кандидаты на упрощение**, **C недостаточно доказательств**. Итоговый T006 содержит отрицательные результаты и ограничения по каждой проверке.

### Исключения и ограничения

- Исключены как исходники `node_modules`, `.git`, `.harness/runtime`, артефакты сборки и выпуска, архивы, browser profiles/личные данные и генерируемый `resources/workflow-kit`. При T003 читаются *правила* staging и упаковки; отсутствие generated файла до подготовки не есть дефект.
- Нельзя обращаться к приватным адресам, коннекторам, токенам; внешние URL фиксировать отдельно, сетевые ошибки не трактовать как битую ссылку. Соседний репозиторий Sidebar не изменять; публичный контракт исследовать по локальной реализации и действующим документам без прямого изменения потребителя.
- Нельзя выполнять сборку, установку, публикацию, реальные пользовательские операции или разрушительные проверки. При допустимых тестах предварительно проверить побочные эффекты; временные скрипты/выводы — только в системном tmpdir вне checkout. Закреплять только audit-документы с явным `commit --task --files`.
- Статический аудит на macOS не подтверждает поведение native Windows, чистую установку или живой ChatGPT. Преднамеренно независимые от окна службы не считать утечками. Неиспользуемость, безопасность удаления и дефектность до T002–T005 не установлены.

## A. Подтверждённые дефекты

На стадии T001 не исследовались; пусто, а не «ошибок нет».

## B. Кандидаты на упрощение

На стадии T001 не исследовались.

## C. Гипотезы и недостаточные доказательства

На стадии T001 не исследовались.
