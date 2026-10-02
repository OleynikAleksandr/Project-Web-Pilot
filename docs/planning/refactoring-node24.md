# Очистка кода, устранение дубликатов и переход на Node 24

Дата: 02.10.2026. Основа: Project Web Pilot 0.6.74, commit `69a153203197a53ee8bea48d5702e21999879dac`, Workflow Kit 1.5.1.
Исполняемый план: current plan `refactoring-node24-20261002`. Этот документ — контракт результата и карта работ, а не второй ToDo: статусы и коммиты ведёт только `.harness/plans/todo-plan.md`.

## Результат

Пользователь получает парный выпуск **0.6.75** (macOS arm64 / Windows x64), который ведёт себя как 0.6.74, но:

- в нём нет мёртвого кода, найденного аудитом 01.10.2026: недостижимых IPC-обработчиков, скрытой устаревшей разметки, пустой передачи параметра `selection`, неиспользуемых функций, импортов и CSS;
- общие помощники существуют в одном экземпляре: настройка туннеля, шаблон ID туннеля, SHA-256 файла, `exists`, `fail`, версия комплектного Node;
- одна среда Node 24 везде:
  - Electron **44.5.1** со встроенным Node **24.21.0**;
  - комплектный Node **24.21.0** для workers на macOS и Windows;
  - разработка и проверки — на Node ≥ 24.21.0;
- в документах агента (`AGENTS.md`, `README.md`, `docs/WORKFLOW_START.md`) нет противоречивых «текущих» разделов и устаревших версий.

Переезд репозиториев на удалённый сервер пользователь отложил. Поэтому абсолютные пути `/Users/...` в документах в этот план не входят.

## Запуск

Разработка, как и раньше: `npm start`, `npm test`, `npm run smoke`. Выпуск: штатный `npm run build` по [RELEASE](../RELEASE.md). Поставка — `~/Downloads/WebPilot-0.6.75/`, постоянный `Project Web Pilot.app` в корне checkout обновляется с сохранением Finder identity.

Условие для среды разработки на Mac: `node -v` ≥ 24.21.0. Если версия ниже, агент останавливается и просит пользователя установить Node 24 LTS (официальный pkg с nodejs.org или `brew install node@24`). Системные установки без согласия пользователя не выполняются.

## Основания

Все проверки ниже выполнены 01–02.10.2026 на commit `69a1532`:

- unit-набор: 434 теста, 425 pass, 9 skip. Пропуски относятся к реальному macOS/Windows и одинаковы на Node 22.22.2 и Node 24.21.0.
- На Node 24.21.0 с `--pending-deprecation` предупреждений об устаревании нет.
- WorkflowKit `check-package`, `stage-workflow-kit`, `stage-page-observer` и `check-workflow-kit-staging` проходят на Node 24.21.0 с `--throw-deprecation`.
- Прототип удаления устаревшего архива настроек, параметра `selection`, консоли туннеля Windows, лишних импортов и Python-мусора (−126 / +28 строк) на Node 24.21.0: те же 425 pass / 0 fail. Electron smoke в облачной среде не запускался, его запускает Mac.
- Electron 44.5.1 — последний стабильный выпуск (29.09.2026), встроенный Node 24.21.0, Chromium 152.
- Node 24.21.0 «Krypton» — LTS от 08.09.2026, сопровождение до 30.04.2028.
- Node 26 станет LTS только 27.10.2026, а Electron 44 построен на Node 24. Совпадение со встроенным Node важнее.

## Неприкосновенные условия

1. Поведение 0.6.74 для пользователя сохраняется:
   - окно архива: восстановление, удаление с подтверждением, recover;
   - настройки и Доктор проекта;
   - доставка recovery, Chat/Work, AutoPlan;
   - переключение Mac runtime, мастер первого запуска, ввод ID и ключа туннеля на macOS и Windows.
2. Тест удаляется только если проверял исключительно удалённый код. Покрытие оставшегося поведения переносится. Commit каждой задачи фиксирует итог unit-набора; число pass не уменьшается без объяснения.
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
6. Python-файлы runtime (`resources/runtime-control/*.py`, `tools/codex-app-server-mcp/*.py`) разворачиваются по отдельности. Общий Python-модуль не вводится; совпадение общей проверки закрепляется тестом.
7. `resources/mac-runtime.zip` не пересобирается: изменение хеша payload вызовет переустановку runtime у пользователя.
8. Новые зависимости не добавляются. Исключение — явное объявление уже используемого `@electron/asar` (4.3.0, как в lockfile).
9. Секретный ввод туннеля через stdin worker, белый список кодов ошибок на границе и проверка данных до записи не ослабляются.

## Работы

### T001. Среда Node 24.21.0 и Electron 44.5.1

| Место | Изменение |
| --- | --- |
| `package.json`, `package-lock.json` | `electron` 44.3.0 → `44.5.1` (точно); `devDependencies["@electron/asar"] = "4.3.0"`; `engines.node` `>=24.21.0`; lockfile обновить на Node 24 |
| `src/platform.mjs` | `export const BUNDLED_NODE_VERSION = '24.21.0'` — единственный источник версии комплектного Node |
| `scripts/prepare-mac-toolchain.mjs`, `scripts/prepare-windows-toolchain.mjs` | Версию брать из `BUNDLED_NODE_VERSION`. SHA-256 `node-v24.21.0-darwin-arm64.tar.gz` и `node-v24.21.0-win-x64.zip` взять из официального `https://nodejs.org/dist/v24.21.0/SHASUMS256.txt`. Существующая проверка загрузки должна их подтвердить |
| `scripts/verify-windows-package.mjs:44`, `src/main.mjs:101–102` | Убрать литерал `node-v22.17.0-win-x64`, вывести имя из версии |
| `BUILD_WINDOWS.cmd` | Литерал `node-v24.21.0-win-x64`; тест сверяет его с выводимой папкой |
| `src/workspace-setup.mjs:65,78,84` | Минимальная версия внешнего Node для workers — 24; сообщения обновить |
| `tests/mac-toolchain.test.mjs`, `tests/windows-runtime.test.mjs:137–140`, `tests/workspace-setup.test.mjs:222` | Ожидания 24.21.0; тест NODE_TOO_OLD для v22 |
| `windows-runtime/*.sha256` | Удалить каталог: файлы никто не читает, источник правды — константы |
| `.harness/workflow.json` | `stack` = `Electron 44.5.1 / embedded Node 24.21.0 / Workflow Kit 1.5.1`, через `./scripts/workflow config:apply` полной конфигурацией с сохранением checks |
| `README.md` (раздел «Разработка») | Требование Node.js 24.21.0+ |

После правок выполнить `npm run prepare:mac` и `npm run prepare:win`. Ожидается: `.harness/runtime/mac-tools/node/manifest.json` и marker `windows-node` показывают 24.21.0. Сборка выпуска — только в T007.

Вне плана: `engines` WorkflowKit (`>=22`) — отдельный репозиторий. Kit на Node 24 проверен и совместим, но управляемый `scripts/workflow` в проектах пользователей продолжает требовать Node 22+.

### T002. Устаревший архив в настройках и мёртвая разметка

- `src/main.mjs:1062–1093`: удалить `pilot:select-archive`, `pilot:restore-project`, `pilot:preview-delete`, `pilot:cancel-delete`, `pilot:delete-project`, `pilot:recover-deletions`. Их нет в `src/preload.cjs`, а эту работу уже выполняют `archive:*` окна архива. После удаления каналы main должны совпадать с каналами preload, плюс `pilot:page-observation` из observer preload.
- `settingsState` оставить признаком открытых настроек. Поля `workspace`, `deletion`, `notice` удалить, если их больше никто не читает. Поведение `openSettings`/`closeSettings`, Доктора и ошибки восстановления удаления при старте (`main.mjs:1450`) сохранить.
- `src/ui/index.html:302–314`: удалить скрытый блок `settings-notice`, `archive-empty`, `archive-list`, `archive-detail` и `delete-form`, а также CSS, который использовался только им.
- `project-archive.mjs:8–9`: вставлять кнопку «Архив…» у постоянного якоря; цикл скрытия удалить.
- CSS без использования: `prepared-*` (7), `plan-origin`, `cancel-choice`, `project-entry`, `session-top`, `plus`. Регрессионные проверки отсутствия `prepared-card`/`plan-origin` в тестах сохранить.
- `src/ui/sidebar.mjs:14` (`preparedExpansion`) и `:357` (несоединённый `<small>`): удалить.
- Переименовать `src/ui/project-archive.mjs` в `src/ui/settings-panel.mjs` (`settingsPanelView`): модуль отвечает за панель настроек. Обновить `sidebar.mjs` и `tests/project-doctor-ui.test.mjs`.
- `tests/electron-smoke.mjs:919`: вместо `archive-list.hidden` проверять, что кнопка «Архив…» есть, а легаси-блока нет.
- Поле `archives` в снимке сайдбара (`main.mjs:282`) **оставить**: по нему smoke наблюдает архивирование (`electron-smoke.mjs:900`).

### T003. Мёртвый код runtime и доставки контекста

- **Параметр `selection`.**
  - `sessionSelection = () => ({})` (`context-session.mjs:7`) и параметр `selection` удалить по цепочке: `ContextCache` (`isBuilding`, `load`, `build`, `prepare`, `isCurrent`, `warm`), `contextAddress`, `contextInputKey`, `readinessContextKey`, `validateContextPacket`, `MacSelectedRuntime.loadContext`, `main.mjs:26–29,286`.
  - В `tests/electron-smoke.mjs` убрать импорт (`:20`), вызов (`:651`) и `selection.sessionId` в fake runtime (`:113–120`) — там всегда был `undefined`.
- **Консоль туннеля Windows.** `WindowsRuntimeBootstrap.launchTunnelSetup` (`windows-runtime.mjs:459`), `windowsTunnelSetupInvocation` (`:248`), поле `connectScript` (`:148`) и подпись `'tunnel-setup-launched'` в панели настроек — у них нет вызовов. Их заменил мастер (`main.mjs:1011`).
- **`readSessionPlans`, `trustedProjection`, `projectionFacade`** (`session-plans.mjs:12–27`): в приложении не используются. `tests/workspace-setup.test.mjs:399–404` перевести на фасад Kit `sessionPlanView` из `@webpilot/workflow-kit/lib/session-plans` с теми же утверждениями.
- **Мелочи.**
  - Импорты: `chatGPTDOMScript` (`main.mjs:8`), `fsSync` (`mac-runtime.mjs:2`), `fileURLToPath` (`scripts/check-workflow-kit-staging.mjs:5`).
  - Лишний `return` в `chatgpt-auto-scroll.mjs:58`.
  - Убрать `export` у 27 символов, которые используются только внутри своего файла (список knip из аудита). Каждый перед изменением проверить grep, включая `tests/` и `scripts/`. Функции, сериализуемые через `toString()`, от этого не меняются.

### T004. Python MCP-сервер

- `tools/codex-app-server-mcp/server.py`: удалить импорты `shlex`, `tempfile`, `AppServerError`, мёртвый метод `_keycode` (`:761`), атрибуты `_watch_lock`/`_watch` (`:102–103`).
- `stop_process(process_id, force=False)` (`:1009`): параметр `force` объявлен в схеме MCP-инструмента, но игнорируется. Протокол `command/exec/terminate` его не поддерживает, поэтому параметр удаляется из сигнатуры: схема инструмента становится честной.
- `control.py`: удалить импорт `asyncio`.
- `.gitignore`: добавить `__pycache__/` — тесты создают `tools/codex-app-server-mcp/__pycache__/`.

### T005. Одна реализация общих помощников

| Дубликат | Сейчас | Решение |
| --- | --- | --- |
| Настройка туннеля, ~30 строк | `mac-runtime.mjs:100–135` `#configureTunnel` и `windows-runtime.mjs:198–230` `configureWindowsTunnel` | `src/tunnel-setup.mjs`: `runTunnelHelper(...)` — проверка credentials, JSON через stdin, разбор результата `cancelled`/`tunnelId`/`configured`, белый список кодов и `publicMessage`. Сюда же переносится `executePrivateInput`. Платформенные обёртки сохраняют свои классы ошибок, коды `MAC_*`/`WINDOWS_*`, тексты и env (`PYTHONUTF8`, `windowsHide`). Публичный API не меняется |
| Шаблон ID туннеля | JS: `mac-runtime.mjs:123`, `windows-runtime.mjs:217`, `tunnel-clipboard.mjs:3`; Python: 5 файлов | Один `TUNNEL_ID_PATTERN` в `tunnel-setup.mjs`. В `tests/tunnel-id-runtime.test.mjs` тест сверяет шаблон во всех 5 Python-файлах с JS |
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

### T006. Документация агента без противоречий

- `AGENTS.md`, вне блока Kit:
  - оставить один раздел «Текущее состояние»;
  - пять разделов «Текущий (локальный) выпуск» (0.6.45–0.6.58) и «Выпуск 0.6.52/0.6.53» убрать;
  - факты, которых нет в `docs/RELEASE.md`, перед удалением перенести туда;
  - `@webpilot/workflow-kit@1.5.0` (строки 31, 72) → 1.5.1;
  - указать среду Node 24.21.0 / Electron 44.5.1.
- `README.md`: оставить один текущий раздел выпуска; «Сохранённые изменения 0.6.64…0.6.72» уже есть в `docs/RELEASE.md` — убрать.
- `docs/WORKFLOW_START.md`: убрать смесь «текущий 0.6.73» и «предыдущий 0.6.50»; историю оставить в RELEASE.
- `docs/architecture/ARCHITECTURE.md:624`: удалённые `src/session-tokens.mjs` и `js-tiktoken` описаны как действующие — пометить как историю 0.6.9–0.6.12.
- `docs/SOURCE_WORKSPACES.md:32`: пути `tests/install.test.mjs`, `scripts/demo-workflow.mjs` и другие относятся к WF001 — указать репозиторий.
- `docs/DOCUMENTATION_INDEX.md`: добавить этот документ и `planning/single-active-plan-adaptation.md` (сейчас он есть только в индексе-истории).
- Журналы `ARCHITECTURE.md`/`VERIFICATION.md` не переписываются: это датированные свидетельства.

### T007. Парный выпуск 0.6.75

- Версия 0.6.75. Убрать дублирование версии: `--app-version=0.6.74` в `build:mac:package`/`build:win:package` удаляется, @electron/packager по умолчанию берёт `version` из `package.json`. Проверить `CFBundleShortVersionString` и версию exe = 0.6.75.
- `npm run build`: корневой app, `~/Downloads/WebPilot-0.6.75/` (два ZIP, `SHA256SUMS.txt`, `INSTALL.txt`, `release-manifest.json`), копия в `/Applications` — по RELEASE.
- Проверить:
  - встроенный Node упакованного приложения — `ELECTRON_RUN_AS_NODE=1 "Project Web Pilot.app/Contents/MacOS/Project Web Pilot" -p process.versions.node` = `24.21.0`;
  - `mac-tools/node` = `v24.21.0 arm64`;
  - Windows-пакет содержит `node-v24.21.0-win-x64` (`verify-windows-package`).
- Пользовательская приёмка, после полного выхода и запуска:
  - новый Chat и Work на macOS получают recovery;
  - окно архива на временном проекте: архивирование, возврат, удаление с подтверждением;
  - настройки: тема, скрытие вызовов, Доктор;
  - переключение Mac runtime.
- Native Windows и clean VM — отдельная пользовательская проверка, не заявляется выполненной.

## Проверка

| Проверка | Команда | Где |
| --- | --- | --- |
| `node24` | `node -e` — отказ при Node < 24.21 | T001–T005, T007 |
| `unit` | `npm test` | T001–T005, T007 |
| `smoke` | `npm run smoke` | T001–T003, T005, T007 |
| `paired-release` | `npm run build` (`package`) | T007 |

T006 меняет только документы, функциональных проверок не требует. Ссылки в изменённых Markdown-файлах проверяются вручную или скриптом, битых быть не должно.

## План

| Задача | Зависит от | Результат |
| --- | --- | --- |
| T001 | — | Среда Node 24.21.0 и Electron 44.5.1 |
| T002 | T001 | Нет устаревшего архива настроек и мёртвой разметки |
| T003 | T002 | Нет мёртвого кода runtime и доставки контекста |
| T004 | T001 | Python MCP без мёртвого кода, честная схема `stop_process` |
| T005 | T003 | Общие помощники в одном экземпляре |
| T006 | T005 | Документы агента без противоречий |
| T007 | T004, T006 | Парный выпуск 0.6.75 |
| DOCS | все | Актуальные OVERVIEW, MODULES, DOCUMENTATION_INDEX, ARCHITECTURE, RELEASE, VERIFICATION |

## Источники

- [Electron v44.5.1](https://releases.electronjs.org/release/v44.5.1): Node 24.21.0, Chromium 152, 29.09.2026.
- [Node.js v24.21.0](https://nodejs.org/en/blog/release/v24.21.0): LTS Krypton, 08.09.2026.
- [endoflife.date/nodejs](https://endoflife.date/nodejs), [endoflife.date/electron](https://endoflife.date/electron): сроки поддержки.
