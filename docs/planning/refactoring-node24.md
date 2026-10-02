# Очистка кода, устранение дубликатов и переход на Node 24

Дата: 02.10.2026, ревизия 2 — по результатам ревью плана. Основа: Project Web Pilot 0.6.74, commit `69a153203197a53ee8bea48d5702e21999879dac`, Workflow Kit 1.5.1.
Исполняемый план: current plan `refactoring-node24-20261002`. Этот документ — контракт результата и карта работ, а не второй ToDo: статусы и коммиты ведёт только `.harness/plans/todo-plan.md`.

## Результат

Пользователь получает парный выпуск **0.6.75** (macOS arm64 / Windows x64), который ведёт себя как 0.6.74, но:

- в нём нет мёртвого кода, найденного аудитом 01.10.2026 (приложение A): недостижимых IPC-обработчиков, скрытой устаревшей разметки, пустой передачи параметра `selection`, неиспользуемых функций, импортов и CSS;
- общие помощники существуют в одном экземпляре: настройка туннеля, шаблон ID туннеля, SHA-256 файла, `exists`, `fail`, версия комплектного Node;
- среда Node определена по правилу ниже;
- в документах агента (`AGENTS.md`, `README.md`, `docs/WORKFLOW_START.md`) нет противоречивых «текущих» разделов и устаревших версий.

Внешние контракты не меняются: схемы MCP-инструментов, IPC preload и форматы хранения остаются прежними. Переезд репозиториев на удалённый сервер пользователь отложил, поэтому абсолютные пути `/Users/...` в документах в этот план не входят.

## Правило версий Node

| Что | Требование | Где закреплено |
| --- | --- | --- |
| Встроенный Node Electron | ровно **24.21.0** (Electron **44.5.1**, точная версия) | `package.json` |
| Комплектный Node workers (`mac-tools/node`, `windows-node`) | ровно **24.21.0** | `src/platform.mjs` → `BUNDLED_NODE_VERSION` |
| Всё остальное: разработка, проверки при коммите, внешний запасной Node для workers | диапазон **`^24.21.0`** (≥ 24.21.0 и < 25) | `engines.node`, проверка `node24`, `src/workspace-setup.mjs` |

Если внешний Node ниже 24.21, worker возвращает `NODE_TOO_OLD`; если это 25 или новее — `NODE_UNSUPPORTED` с понятным сообщением. Переход на Node 26 — отдельное будущее решение. Минимальная версия в управляемом `scripts/workflow` (Node 22+) принадлежит WorkflowKit и не меняется.

## Запуск

Разработка, как и раньше: `npm start`, `npm test`, `npm run smoke`. Выпуск — только через проверку `paired-release` внутри коммита T009 по [RELEASE](../RELEASE.md). Поставка — `~/Downloads/WebPilot-0.6.75/`, постоянный `Project Web Pilot.app` в корне checkout обновляется с сохранением Finder identity.

Условие для среды разработки на Mac: `node -v` в диапазоне `^24.21.0`. Если версия вне диапазона, агент на T003 останавливается и просит пользователя установить Node 24 LTS (официальный pkg с nodejs.org или `brew install node@24`). Системные установки без согласия пользователя не выполняются.

02.10.2026 пользователь прямо разрешил агенту установить Node и отдельно подтвердил Electron 44.5.1. Установка Node выполнена через существующий Homebrew; выбран Node 24.21.0. Существующий Node 22 в /usr/local не удаляется; новые shell-сеансы и MCP используют Homebrew Node 24, приоритет login-shell закреплён в ~/.zprofile.

## Основания

**Авторитетный исходный результат** фиксирует T002 на macOS до любых изменений кода. Только он используется для сравнения: на Mac выполняются тесты, которые в облаке пропускаются.

Предварительные облачные прогоны 01–02.10.2026 (Linux, commit `69a1532`) — информационные, логи и diff в репозитории не сохранены:

- unit-набор: 434 теста, 425 pass, 9 skip. Пропуски перечислены в приложении C. Итог одинаков на Node 22.22.2 и Node 24.21.0.
- На Node 24.21.0 с `--pending-deprecation` предупреждений об устаревании нет.
- WorkflowKit `check-package`, `stage-workflow-kit`, `stage-page-observer` и `check-workflow-kit-staging` проходят на Node 24.21.0 с `--throw-deprecation`.
- Пробное удаление устаревшего архива настроек, параметра `selection`, консоли туннеля Windows, лишних импортов и Python-мусора на Node 24.21.0 дало те же 425 pass / 0 fail. Electron smoke там не запускался. Каждая задача доказывает свой результат собственными проверками при коммите, а не этим прогоном.

Внешние факты:

- Electron 44.5.1 — последний стабильный выпуск (29.09.2026), встроенный Node 24.21.0, Chromium 152. Установленный сейчас Electron 44.3.0 уже работает на Node 24.20.0: переход с Node 22 касается среды разработки и комплектных workers.
- Node 24.21.0 «Krypton» — LTS от 08.09.2026, сопровождение до 30.04.2028.
- Node 26 станет LTS только 27.10.2026, а Electron 44 построен на Node 24.

## Неприкосновенные условия

1. Поведение 0.6.74 для пользователя сохраняется:
   - окно архива: восстановление, удаление с подтверждением, recover;
   - настройки и Доктор проекта;
   - доставка recovery; повторное открытие чата без повторной отправки;
   - Chat/Work, AutoPlan;
   - переключение Mac runtime, мастер первого запуска, ввод и отмена ID и ключа туннеля на macOS и Windows.
2. Тест удаляется только если проверял исключительно удалённый код. Покрытие оставшегося поведения переносится. Commit каждой задачи сравнивает итог с исходным результатом T002, включая состав пропусков.
3. Каждая задача — отдельный commit через Workflow Kit с назначенными проверками. Регрессия исправляется в той же задаче.
4. Управляемое и генерируемое не редактируется:
   - `.harness/kit/**`, `.harness/plans/archive/**`, `.harness/kit-manifest.json`;
   - `scripts/workflow*`;
   - блок `workflow-kit` в `AGENTS.md`;
   - `resources/workflow-kit/**`, `resources/chatgpt-page-observer-preload.cjs`.
5. Направления импорта:
   - `scripts/` может импортировать `src/`;
   - `src/` не импортирует `scripts/`: их нет в asar;
   - `resources/*-worker.mjs` и `resources/project-doctor/**` выполняются внешним Node вне asar и не импортируют `src/`.
6. Python-файлы runtime разворачиваются по отдельности. Общий Python-модуль не вводится; совпадение общей проверки закрепляется тестом.
7. `resources/mac-runtime.zip` не пересобирается: изменение хеша payload вызовет переустановку runtime у пользователя.
8. Новые зависимости не добавляются. Исключение — явное объявление уже используемого `@electron/asar` (4.3.0, как в lockfile).
9. Секретный ввод туннеля через stdin worker, белый список кодов ошибок и проверка данных до записи не ослабляются. Сохранение новых данных туннеля на живом подключении пользователя не выполняется: его покрывают unit-тесты и fixtures.

## Работы

### T001. Уточнение плана по ревью — выполнено в этой ревизии

Документ приведён в соответствие с ревью:
- сборка, проверка готовых файлов и пользовательская приёмка разделены (T009/T010);
- `force` у `stop_process` сохраняется;
- приёмка покрывает все сохраняемые сценарии;
- правило версий Node однозначно;
- добавлены приложения A–D для воспроизводимости.

### T002. Исходное состояние на macOS

До любых изменений кода, в текущей среде Mac:
- записать в `docs/VERIFICATION.md` версию Node, итог `npm test` (tests/pass/fail/skip) со списком пропущенных тестов и причинами, итог `npm run smoke`;
- повторно проверить grep символы приложения A на текущем коде, расхождения отметить здесь до удаления.

Код не меняется.

### T003. Среда Node 24.21.0 и Electron 44.5.1

| Место | Изменение |
| --- | --- |
| `package.json`, `package-lock.json` | `electron` 44.3.0 → `44.5.1` (точно); `devDependencies["@electron/asar"] = "4.3.0"`; `engines.node` `^24.21.0`; lockfile обновить на Node 24 |
| `src/platform.mjs` | `export const BUNDLED_NODE_VERSION = '24.21.0'` — единственный источник версии комплектного Node |
| `scripts/prepare-mac-toolchain.mjs`, `scripts/prepare-windows-toolchain.mjs` | Версию брать из `BUNDLED_NODE_VERSION`. SHA-256 `node-v24.21.0-darwin-arm64.tar.gz` и `node-v24.21.0-win-x64.zip` взять из официального `https://nodejs.org/dist/v24.21.0/SHASUMS256.txt`. Существующая проверка загрузки должна их подтвердить |
| `scripts/verify-windows-package.mjs:44`, `src/main.mjs:101–102` | Убрать литерал `node-v22.17.0-win-x64`, вывести имя из версии |
| `BUILD_WINDOWS.cmd` | Литерал `node-v24.21.0-win-x64`; тест сверяет его с выводимой папкой |
| `src/workspace-setup.mjs:65,78,84` | Принимать внешний Node только из `^24.21.0`: `NODE_TOO_OLD` ниже, `NODE_UNSUPPORTED` для 25+ |
| `tests/mac-toolchain.test.mjs`, `tests/windows-runtime.test.mjs:137–140`, `tests/workspace-setup.test.mjs:222` | Ожидания 24.21.0; тесты для v22 (`NODE_TOO_OLD`) и v25 (`NODE_UNSUPPORTED`) |
| `windows-runtime/*.sha256` | Удалить каталог: файлы никто не читает, источник правды — константы |
| `.harness/workflow.json` | `stack` = `Electron 44.5.1 / embedded Node 24.21.0 / Workflow Kit 1.5.1`, через `./scripts/workflow config:apply` полной конфигурацией с сохранением checks |
| `README.md` (раздел «Разработка») | Требование Node.js `^24.21.0` |

После правок выполнить `npm run prepare:mac` и `npm run prepare:win`. Ожидается: `.harness/runtime/mac-tools/node/manifest.json` и marker `windows-node` показывают 24.21.0. Сборка выпуска — только в T009.

### T004. Устаревший архив в настройках и мёртвая разметка

- `src/main.mjs:1062–1093`: удалить `pilot:select-archive`, `pilot:restore-project`, `pilot:preview-delete`, `pilot:cancel-delete`, `pilot:delete-project`, `pilot:recover-deletions`. Их нет в `src/preload.cjs`, а эту работу уже выполняют `archive:*` окна архива. После удаления каналы `ipcMain` должны совпадать с каналами preload, плюс `pilot:page-observation` из observer preload.
- `settingsState` оставить признаком открытых настроек. Поля `workspace`, `deletion`, `notice` удалить, если их больше никто не читает. Поведение `openSettings`/`closeSettings`, Доктора и ошибки восстановления удаления при старте (`main.mjs:1450`) сохранить.
- `src/ui/index.html:302–314`: удалить скрытый блок `settings-notice`, `archive-empty`, `archive-list`, `archive-detail` и `delete-form`, а также CSS, который использовался только им.
- `project-archive.mjs:8–9`: вставлять кнопку «Архив…» у постоянного якоря; цикл скрытия удалить.
- CSS без использования: `prepared-*` (7), `plan-origin`, `cancel-choice`, `project-entry`, `session-top`, `plus`. Регрессионные проверки отсутствия `prepared-card`/`plan-origin` сохранить.
- `src/ui/sidebar.mjs:14` (`preparedExpansion`) и `:357` (несоединённый `<small>`): удалить.
- Переименовать `src/ui/project-archive.mjs` в `src/ui/settings-panel.mjs` (`settingsPanelView`). Обновить `sidebar.mjs` и `tests/project-doctor-ui.test.mjs`.
- `tests/electron-smoke.mjs:919`: вместо `archive-list.hidden` проверять, что кнопка «Архив…» есть, а легаси-блока нет.
- Поле `archives` в снимке сайдбара (`main.mjs:282`) **оставить**: по нему smoke наблюдает архивирование (`electron-smoke.mjs:900`).

Реализация T004: панель перенесена в settings-panel.mjs; скрытая разметка, её стили, шесть недоступных IPC и неиспользуемые переменные удалены. Поля deletion/notice исключены из settingsState. workspace сохранён: projectDoctorView читает его при отсутствии выбранной сессии, в том числе после ошибки startup deletion recovery. Поле archives сохранено. Регрессии проверяют эту ветку Доктора, открытие/закрытие настроек и отдельного архива, показ ошибки; Electron smoke требует отсутствия легаси-разметки. Обязательные node24/unit/smoke выполняются Workflow Kit при коммите; эталон T003 — 452 tests / 449 PASS / 3 SKIP.

### T005. Мёртвый код runtime и доставки контекста

- **Параметр `selection`.**
  - `sessionSelection = () => ({})` (`context-session.mjs:7`) и параметр `selection` удалить по цепочке: `ContextCache` (`isBuilding`, `load`, `build`, `prepare`, `isCurrent`, `warm`), `contextAddress`, `contextInputKey`, `readinessContextKey`, `validateContextPacket`, `MacSelectedRuntime.loadContext`, `main.mjs:26–29,286`.
  - В `tests/electron-smoke.mjs` убрать импорт (`:20`), вызов (`:651`) и `selection.sessionId` в fake runtime (`:113–120`) — там всегда был `undefined`.
- **Консоль туннеля Windows.** `WindowsRuntimeBootstrap.launchTunnelSetup` (`windows-runtime.mjs:459`), `windowsTunnelSetupInvocation` (`:248`), поле `connectScript` (`:148`) и подпись `'tunnel-setup-launched'` в панели настроек — у них нет вызовов. Их заменил мастер (`main.mjs:1011`).
- **`readSessionPlans`, `trustedProjection`, `projectionFacade`** (`session-plans.mjs:12–27`): в приложении не используются. `tests/workspace-setup.test.mjs:399–404` перевести на фасад Kit `sessionPlanView` из `@webpilot/workflow-kit/lib/session-plans` с теми же утверждениями.
- **Мелочи.**
  - Импорты: `chatGPTDOMScript` (`main.mjs:8`), `fsSync` (`mac-runtime.mjs:2`), `fileURLToPath` (`scripts/check-workflow-kit-staging.mjs:5`).
  - Лишний `return` в `chatgpt-auto-scroll.mjs:58`.
  - Убрать `export` у символов приложения A, подтверждённых в T002. Функции, сериализуемые через `toString()`, от этого не меняются: тест `chatgpt-colors` сверяет имя функции, а не экспорт.

### T006. Python MCP-сервер

- `tools/codex-app-server-mcp/server.py`: удалить импорты `shlex`, `tempfile`, `AppServerError`, мёртвый метод `_keycode` (`:761`), атрибуты `_watch_lock`/`_watch` (`:102–103`).
- `control.py`: удалить импорт `asyncio`.
- `.gitignore`: добавить `__pycache__/` — тесты создают `tools/codex-app-server-mcp/__pycache__/`.
- **`stop_process(process_id, force=False)` не меняется.** Параметр `force` объявлен для клиентов MCP. Протокол `command/exec/terminate` его не различает, но удаление было бы изменением внешнего контракта. Если понадобится честная схема, это отдельное изменение с тестом совместимости старых вызовов.

### T007. Одна реализация общих помощников

| Дубликат | Сейчас | Решение |
| --- | --- | --- |
| Настройка туннеля, ~30 строк | `mac-runtime.mjs:100–135` `#configureTunnel` и `windows-runtime.mjs:198–230` `configureWindowsTunnel` | `src/tunnel-setup.mjs`: `runTunnelHelper(...)` — проверка credentials, JSON через stdin, разбор результата `cancelled`/`tunnelId`/`configured`, белый список кодов и `publicMessage`. Сюда же переносится `executePrivateInput`. Платформенные обёртки сохраняют свои классы ошибок, коды `MAC_*`/`WINDOWS_*`, тексты и env (`PYTHONUTF8`, `windowsHide`). Публичный API не меняется |
| Шаблон ID туннеля | JS: `mac-runtime.mjs:123`, `windows-runtime.mjs:217`, `tunnel-clipboard.mjs:3`; Python: `resources/runtime-control/{mac,windows}-{control,first-run}.py`, `tools/codex-app-server-mcp/control.py` | Один `TUNNEL_ID_PATTERN` в `tunnel-setup.mjs`. В `tests/tunnel-id-runtime.test.mjs` тест сверяет шаблон во всех 5 Python-файлах с JS |
| SHA-256 файла | `mac-runtime.mjs:34`, `windows-runtime.mjs:257`, `scripts/prepare-mac-toolchain.mjs:15`, `prepare-windows-toolchain.mjs:39`, `verify-windows-package.mjs:13`, `release-all.mjs:13`, `release-mac.mjs:14` | `src/common.mjs` → `sha256File` (потоковое чтение). Импортёры, включая `check-event-runtime-release.mjs` и тесты, переводятся на него |
| `exists` | `mac-runtime.mjs:33`, `windows-runtime.mjs:268`, `mac-runtime-switch.mjs:20`, `workspace-session.mjs:245` (`fileExists`) | `exists` в `src/common.mjs` |
| `fail` | `workspace-setup.mjs:10`, `session-plans.mjs:9`, `workspace-readiness.mjs:1` | `fail` в `src/common.mjs` |

Не объединяется, причины зафиксированы:

- `workspace-deletion.mjs:9` — другой смысл (`lstat` или `null`); переименовать в `lstatOrNull`.
- Хеши строк (`digest`) — однострочники; `resources/project-doctor/files.mjs` находится за границей asar.
- `ensure`/`ensureMcpOnly` в `mac-runtime-switch.mjs` и `mcp-runtime.mjs` — четыре строки single-flight; общий помощник был бы не короче.
- Повторы в Python-файлах mac/win first-run и control — условие 6.
- `.harness/kit` — управляемая копия WorkflowKit.
- Дубликат плана `workflow-project-continuity-021.md` в archive — управляемая история; Доктор сохраняет её побайтно.
- `docs/*.history-20260929.md` — намеренная связанная история.
- Служебные записи `__MACOSX` в `mac-runtime.zip` — условие 7.

### T008. Документация агента без противоречий

- `AGENTS.md`, вне блока Kit:
  - оставить один раздел «Текущее состояние»;
  - пять разделов «Текущий (локальный) выпуск» (0.6.45–0.6.58) и «Выпуск 0.6.52/0.6.53» убрать;
  - факты, которых нет в `docs/RELEASE.md`, перед удалением перенести туда;
  - `@webpilot/workflow-kit@1.5.0` (строки 31, 72) → 1.5.1;
  - указать правило версий Node.
- `README.md`: оставить один текущий раздел выпуска; «Сохранённые изменения 0.6.64…0.6.72» уже есть в `docs/RELEASE.md` — убрать.
- `docs/WORKFLOW_START.md`: убрать смесь «текущий 0.6.73» и «предыдущий 0.6.50».
- `docs/architecture/ARCHITECTURE.md:624`: удалённые `src/session-tokens.mjs` и `js-tiktoken` описаны как действующие — пометить как историю 0.6.9–0.6.12.
- `docs/SOURCE_WORKSPACES.md:32`: пути `tests/install.test.mjs`, `scripts/demo-workflow.mjs` и другие относятся к WF001 — указать репозиторий.
- `docs/DOCUMENTATION_INDEX.md`: добавить этот документ и `planning/single-active-plan-adaptation.md`.
- Журналы `ARCHITECTURE.md`/`VERIFICATION.md` не переписываются: это датированные свидетельства.

### T009. Сборка парного выпуска 0.6.75

Сборка выполняется **только** проверкой `paired-release` внутри commit задачи. `npm run build` вручную до commit не запускается: `scripts/release-all.mjs` отказывает в повторном выпуске уже собранной версии.

До commit:
- версия 0.6.75 в `package.json`/lock;
- ключ `--app-version=0.6.74` удалён из `build:mac:package` и `build:win:package` — @electron/packager по умолчанию берёт `version` из `package.json`;
- записан `.harness/runtime/release-0.6.75-preflight.json` (device/inode корневого app и `/Applications`, формат как у `release-074-preflight.json`).

Commit проходит, когда проверка собрала корневой app, `~/Downloads/WebPilot-0.6.75/` (два ZIP, `SHA256SUMS.txt`, `INSTALL.txt`, `release-manifest.json`) и обновила копию в `/Applications` по RELEASE. Лимит проверки — 600 с, это максимум Kit.

При сбое:
- версию не повышать;
- сначала осмотреть `.harness/runtime/paired-release.lock` и `.harness/runtime/releases/0.6.75/`;
- незавершённые артефакты попытки удалять только с согласия пользователя, затем повторить commit.

### T010. Проверка готового выпуска и пользовательская приёмка

Задача не меняет `src/`, `resources/`, `tools/`, `package*.json`, иначе упаковки перестанут совпадать с исходниками.

**Повторяемая проверка `release-installed`.** `scripts/check-event-runtime-release.mjs` обобщается в `scripts/check-installed-release.mjs`, ссылка в RELEASE обновляется. Версия берётся из `package.json`, preflight — `release-<version>-preflight.json`. Сохраняются прежние утверждения:
- исходники обеих упаковок, `CFBundleShortVersionString`;
- identity корневого app и `/Applications`, SHA-256 ZIP;
- установленный Kit, observer fixture.

Добавляются:
- встроенный Node упакованного приложения (`ELECTRON_RUN_AS_NODE=1`, `process.versions.node`) = 24.21.0;
- `Contents/Resources/mac-tools/node/bin/node` = `v24.21.0 arm64`;
- Windows-пакет содержит `node-v24.21.0-win-x64`;
- **запуск без системного Node:** worker `workspace-setup-worker.mjs` и CLI установленного Kit на временном fixture выполняются комплектным Node при `PATH`, где нет системного `node`.

Проверка не пересобирает выпуск.

**Пользовательская приёмка на macOS** после полного выхода и запуска. Результат каждого пункта записывается в `docs/VERIFICATION.md`:
1. новый Chat и новый Work получают recovery;
2. повторное открытие прежнего чата не отправляет контекст повторно;
3. AutoPlan на временном проекте;
4. окно архива на временном проекте: архивирование, возврат, удаление с подтверждением;
5. настройки: тема, скрытие вызовов, Доктор проекта;
6. переключение Mac runtime и обратно;
7. ввод ID туннеля открывается и отменяется без изменения существующего подключения, если интерфейс это позволяет.

Первый запуск на чистой macOS (VM или отдельная учётная запись) из ZIP — отдельная пользовательская проверка; если она не выполнена, записывается «не проверено». Windows подтверждается только статической проверкой пакета. Работоспособность Windows не заявляется до пользовательской проверки.

## Проверка

| Проверка | Команда | Лимит | Где |
| --- | --- | --- | --- |
| `node24` | `node -e` — отказ вне `^24.21.0` | 10 с | T003–T007, T009, T010 |
| `unit` | `npm test` | 120 с | T002–T007, T009 |
| `smoke` | `npm run smoke` | 120 с | T002–T005, T007, T009 |
| `paired-release` | `npm run build` (`package`) | 600 с | T009 |
| `release-installed` | `node scripts/check-installed-release.mjs` (`installed`) | 600 с | T010 |

T001 и T008 меняют только документы.

## План

| Задача | Зависит от | Результат |
| --- | --- | --- |
| T001 | — | План уточнён по ревью (выполнено) |
| T002 | T001 | Исходное состояние на macOS зафиксировано |
| T003 | T002 | Среда Node 24.21.0 и Electron 44.5.1 |
| T004 | T003 | Нет устаревшего архива настроек и мёртвой разметки |
| T005 | T004 | Нет мёртвого кода runtime и доставки контекста |
| T006 | T003 | Python MCP без мёртвого кода; контракт `stop_process` сохранён |
| T007 | T005 | Общие помощники в одном экземпляре |
| T008 | T007 | Документы агента без противоречий |
| T009 | T006, T008 | Собрана парная поставка 0.6.75 |
| T010 | T009 | Готовая поставка проверена, пользовательская приёмка записана |
| DOCS | все | Актуальные OVERVIEW, MODULES, DOCUMENTATION_INDEX, ARCHITECTURE, RELEASE, VERIFICATION |

## Приложение A. Экспорты без внешних потребителей

Найдены knip 01.10.2026: knip с точками входа main, preload, ui, workers, scripts и tests; каждый символ затем проверен grep. Все используются внутри своего файла — лишнее только слово `export`. T002 перепроверяет список.

Перепроверка T002 на macOS arm64 02.10.2026, исходный HEAD `a3ad36c4414bb1d17a0f38bcdc5fc3c53002250a`: все 27 символов проверены через `rg -n -w` по отслеживаемым исходникам `src/`, `scripts/`, `tests/`, `resources/` и `tools/`; внешних импортов или потребителей этих экспортов не обнаружено. Дополнительно просмотрены namespace/dynamic imports. Список для T005 подтверждён без исключений.

Совпадения имени вне файла не являются использованием экспорта: `installComposerCapsule` в `tests/chatgpt-colors.test.mjs:131,133` — проверка имени сериализованной функции (имя и тест сохранить); `MAC_RUNTIME_CONTRACT` в `src/startup-readiness.mjs:19` — ключ сообщения об ошибке (ключ сохранить). Машинный список совпадений: `.harness/runtime/t002-export-audit.json`. Функции и константы на этом шаге не изменялись.

| Файл | Символы |
| --- | --- |
| `resources/project-doctor/files.mjs` | `atomicWrite` |
| `src/auto-plan.mjs` | `AUTO_PLAN_INSTRUCTION` |
| `src/browser-startup.mjs` | `STARTUP_REQUEST_TIMEOUT_MS` |
| `src/chatgpt-auto-scroll.mjs` | `installAutoScrollPage` |
| `src/chatgpt-colors.mjs` | `COLOR_KEYS`, `installComposerCapsule`, `isChatColorsURL` |
| `src/chatgpt-composer.mjs` | `ComposerError`, `pageOperation` |
| `src/chatgpt-title.mjs` | `renameChatGPTConversationPage` |
| `src/chatgpt-tool-filter.mjs` | `installToolFilter` |
| `src/context-cache.mjs` | `contextAddress` (удаляется целиком в T005) |
| `src/context-inputs.mjs` | `inputError` |
| `src/mac-runtime-switch.mjs` | `MacSelectedRuntime` |
| `src/mac-runtime.mjs` | `MAC_RUNTIME_CONTRACT`, `MAC_RUNTIME_FOLDER`, `MAC_BUNDLED_CONTROL_SHA256`, `MAC_LEGACY_CONTROL_SHA256`, `MacRuntimeError`, `macRuntimePaths`, `macRuntimeFolderPaths` |
| `src/project-input-watch.mjs` | `projectWatchInputs` |
| `src/windows-runtime.mjs` | `WINDOWS_RUNTIME_FOLDER`, `WINDOWS_RUNTIME_OVERLAY_VERSION`, `applyWindowsWebPilotOverlay`, `WindowsRuntimeError`, `windowsTunnelSetupInvocation` (удаляется целиком в T005) |

Ложные срабатывания, не трогать:
- `tests/installed-observer-fixture.cjs`, `tests/prosemirror-composer-fixture.mjs`, `esbuild`, `prosemirror-*` — вызываются по пути из скрипта проверки выпуска;
- функции `@mcp.tool` в `server.py` — регистрируются декоратором;
- `mcp_status_list` и свойство `generation` — используются тестом;
- id `doctor-*` и `tree-*` — собираются динамически.

## Приложение B. Прочие находки аудита

- **ESLint `no-unused-vars` в `src/` и `scripts/`:**
  - `main.mjs:8` `chatGPTDOMScript`;
  - `mac-runtime.mjs:2` `fsSync`;
  - `check-workflow-kit-staging.mjs:5` `fileURLToPath`;
  - параметр `selection` в `context-cache.mjs:56`, `context-inputs.mjs:40,113`, `mcp-runtime.mjs:17`;
  - `sidebar.mjs:14,357`;
  - `no-useless-return` в `chatgpt-auto-scroll.mjs:58`.
- **Неиспользуемые переменные в тестах** (`project-doctor.test.mjs:102–103`, `session-plans.test.mjs:7`, `workspace-session.test.mjs:298,504,549–550`, `workspace-setup.test.mjs:11`, `conversation-recovery.test.mjs:8`, `mac-runtime*.test.mjs`) — остатки удалённых функций. Убираются попутно, если задача касается файла.
- **pyflakes/vulture:** неиспользуемые импорты из T006, `_keycode`, `_watch_lock`/`_watch`, игнорируемый `force`.
- **Markdown-ссылки:** 173, битых нет. Пути в тексте на удалённые файлы — T008.

## Приложение C. Пропуски в облачном прогоне (Linux)

1. Codex App Server client executes directly — нужен локальный macOS-бинарь Codex.
2. Both real native prompt scripts compile — SKIP.
3. Shipped Mac archive installs through adapter — SKIP.
4. Two releases keep the permanent app identity — SKIP.
5. Invalid source version and unexpected target files — SKIP.
6. Symlink target is refused — SKIP.
7. Windows bootstrap adopts an existing compatible Codex Local — SKIP.
8. Windows bootstrap restarts the same running external runtime — SKIP.
9. Real installation of the development Kit — development и bundled Kit одной версии.

На macOS часть этих тестов выполняется; эталоном служит список из T002.

## Приложение D. Повтор аудита

- **knip** (версия 5): точки входа `src/main.mjs`, `src/*preload.cjs`, `src/ui/{sidebar,startup,archive,chat-colors}.mjs`, `resources/*-worker.mjs`, `scripts/*.mjs`, `tests/*.test.mjs`, `tests/electron-smoke.mjs`, `tests/event-runtime-baseline.mjs`. Игнор: `resources/workflow-kit/**`, `resources/chatgpt-page-observer-preload.cjs`, `.harness/**`. Режим `--include files,exports,dependencies,unlisted`.
- **ESLint 9:** правила `no-unused-vars` (`caughtErrors: none`), `no-unreachable`, `no-useless-return`, `no-undef`.
- **IPC:** сверить строки `pilot:`/`archive:`/`chat-colors:` в `src/*.cjs` и `src/*.mjs`.
- **HTML id и CSS-классы:** сверить с использованием в `src/ui/*.mjs`.
- **Python:** `vulture --min-confidence 60`, `pyflakes`.

## Источники

- [Electron v44.5.1](https://releases.electronjs.org/release/v44.5.1): Node 24.21.0, Chromium 152, 29.09.2026.
- [Node.js v24.21.0](https://nodejs.org/en/blog/release/v24.21.0): LTS Krypton, 08.09.2026.
- [endoflife.date/nodejs](https://endoflife.date/nodejs), [endoflife.date/electron](https://endoflife.date/electron): сроки поддержки.
