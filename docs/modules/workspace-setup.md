# Создание и подключение проекта

Создание новой папки проекта и подключение существующей, установка, восстановление и обновление Workflow Kit через preview/apply в отдельном Node-процессе, проверка готовности папки (readiness) перед открытием сессии и отправкой контекста. Не входят: план и recovery ([контракт Kit](../../packages/workflow-kit/docs/modules/workflow-kit-package.md)), ремонт ([project-doctor.md](project-doctor.md)), хранение проектов и сессий ([workspace-sessions.md](workspace-sessions.md)), сроки открытия ([session-opening-performance.md](session-opening-performance.md)), стартовый пакет ([context-delivery.md](context-delivery.md)), Git/CLT на новом Mac ([first-run-onboarding.md](first-run-onboarding.md)).

## Код

- `src/workspace-setup.mjs` — `WorkspaceSetup`: `preview`, `apply`, `ready`, `invalidateReadiness`, `clear`, `node`, `call`, `setRuntimeEnvironment`.
- `src/workspace-readiness.mjs` — `WorkspaceReadiness`: `check`, `clear`.
- `resources/workspace-setup-worker.mjs` — worker: действия `inspect|apply|fingerprint`; использует Kit из `resources/workflow-kit` (`inspectWithDiagnostics`, `install`, `upgradeFrom`, `inspectionInputs`). `resources/` лежит вне ASAR; копия Kit генерируется при сборке ([release.md](release.md)).
- `src/main.mjs` — IPC `pilot:begin-create`, `pilot:choose-parent`, `pilot:preview-new`, `pilot:refresh-setup`, `pilot:set-first-session-experience`, `pilot:apply-setup`, `pilot:cancel-setup`, `pilot:choose-workspace`, `pilot:new-session`; `reviewWorkspace`, `openConnectedSession`, `cancelSetup`; `projectsParent` в `settings.json`.
- `src/ui/workspace-setup.mjs`, `src/ui/index.html` — форма, preview, кнопки действий.
- `src/platform.mjs` — `nodeExecutableCandidates`, `bundledMacNode`, `BUNDLED_NODE_VERSION = '24.21.0'`; `src/windows-runtime.mjs` — `WindowsExecutorBootstrap.workflowEnvironment` (MinGit).

## Поведение

### Создание проекта

- «Создать проект» открывает форму с сохранённым расположением или без него. Сначала «Выбрать расположение папки для проектов», затем имя. Выбор хранится в `settings.json` `projectsParent` (абсолютный путь) между проектами и запусками; отмена диалога оставляет прежнее значение; «Изменить расположение папки для проектов» меняет его для следующих проектов, существующие не перемещаются. Предустановленного пути нет: `~/VSCODE` и папка открытого проекта не подставляются (решение пользователя).
- Имя: непустое, без пробелов по краям, ≤120 символов, без `/`, `\`, переводов строк и NUL, не `.`/`..` и не с точки в начале → иначе `PROJECT_NAME`. Нет расположения → `PARENT_REQUIRED`. Путь — `realpath(parent)/name`.
- Preview показывает конечный путь, проверки и список изменений в папке. До подтверждения не создаётся ни папка, ни стартовое сообщение.
- Для нового или ещё не зарегистрированного проекта кнопки Chat/Work одной операцией применяют preview и открывают первую сессию этого режима; неверный режим отклоняется до изменения папки, повторный клик во время применения блокирован. Автор и email не спрашиваются (решение пользователя).

### Подключение существующей папки

- «Открыть папку проекта» (диалог «Проверить папку» открывается в `~/VSCODE`; это не расположение новых проектов) → `reviewWorkspace`: realpath; папка архивного проекта открывает окно архива ([project-archive.md](project-archive.md)); иначе preview в режиме `existing`. Git-подкаталог принимается, preview показывает фактический корень репозитория.
- Повторное открытие зарегистрированного проекта сессию не создаёт. Новый Chat/Work — из меню ⋯ проекта (`pilot:new-session`), только после успешной проверки папки.
- Действия preview и подписи кнопок: `install` — «Создать и открыть» / «Подготовить и открыть»; `reconnect` — «Восстановить и открыть» (восстановить команды и hooks совместимой установки; план и файлы сохраняются); `upgrade` — «Обновить и открыть»; `open` — «Открыть проект».
- Блокируют запись (действия нет): конфликт путей, изменённое ядро Kit или изменённая секция Git-hook (перезапись запрещена), отсутствующие `.harness/workflow.json`, план, шаблон плана, required-документы или зарегистрированный AGENTS, неполный recovery текущего плана, неподдерживаемая версия («Версия … пока не поддерживается. Автоматическое обновление не выполняется»). При проблеме показываются «Проверить ещё раз» и «Доктор проекта»; на успешном preview их нет. Отмена или ошибка возвращают прежний чат (`cancelSetup`).
- Предупреждения: первая фиксация установки ещё ждёт `install:commit` (исходные изменения сохранены); установлен совместимый Kit старше текущего — работа без обновления.

### Preview/apply

- `preview` запускает worker `inspect` и выдаёт непрозрачный токен (UUID), который хранится только в main вместе с запросом (папка, режим, имя) и fingerprint. Новый preview и `clear()` гасят прежние токены; успешный apply гасит свой.
- `apply(token)`: нет токена → `PREVIEW_REQUIRED`. Worker повторяет inspect: fingerprint изменился → `PREVIEW_CHANGED`, действия нет → `SETUP_BLOCKED`. `install`/`reconnect`/`upgrade` вызывают Kit `install` (`update:true` для upgrade, `expected-fingerprint`), затем inspect заново; результат `ready` открывает сессию.
- Preview и apply сбрасывают кеш readiness этой папки. Открытие настройки проекта отменяет текущую доставку контекста (`pauseForSetup`).
- IPC принимается только от сайдбара (`assertLocalSender`, `IPC_FORBIDDEN`); странице ChatGPT недоступен.

### Установка и обновление Kit

- Установщик Kit меняет только управляемые секции `workflow-kit:begin/end`; пользовательские документы, AGENTS и hooks сохраняются, чужие изменения в служебный коммит не попадают, staging пользователя цел.
- Нет полной Git identity (только при `install`): задаются локальные `user.name=Web Pilot`, `user.email=web-pilot@localhost`, имеющиеся частичные значения сохраняются, глобальный config не меняется.
- Новый workspace получает launcher `scripts/workflow`, `scripts/workflow.cmd`, `scripts/workflow.mjs` → `.harness/kit/cli.mjs`, шаблоны, AGENTS, README, `docs/architecture/OVERVIEW.md` и current plan в `NONE`. Обязателен только OVERVIEW (`required_documents` manifest); README — по желанию, модули — по надобности. Manifest без `required_documents` сверяется с прежним набором (`DOCUMENTATION_INDEX`, `WORKFLOW_START`, `PRODUCT`, `ARCHITECTURE`, для версий после 1.1.0 ещё `MODULES` и OVERVIEW).
- `MODULES`, `DOCUMENTATION_INDEX`, `PRODUCT`, `WORKFLOW_START`, `ARCHITECTURE` не создаются; upgrade снимает с них владение Kit, не удаляя файлы.
- Поддерживаемые версии — единый список установщика: 1.0.0, upgradeFrom (включая выпущенную 1.6.4) и текущая 1.7.1; worker не дублирует список. Upgrade при активном назначении или интеграции отказывает до записи — [контракт Kit](../../packages/workflow-kit/docs/modules/parallel-assignments.md).
- Upgrade: проверка owned/managed файлов, резервная копия `.harness/runtime/kit-upgrade-*`, служебный коммит `kit-update`; повреждённый план не заменяется догадкой; legacy-планы удаляются, только если tracked и совпадают с HEAD и index, иначе стоп. `.harness/kit` и Kit-секцию AGENTS руками не править.
- Обновление приложения ≠ обновление Kit проекта: проект на старом Kit работает со своими полями конфигурации до штатного upgrade.
- Kit копирует Node worker в `.harness/runtime` проекта (Windows — всегда, macOS — если нет Homebrew или `/usr/local` Node 22+) и на Windows — MinGit комплекта.

### Readiness

- `ready(workspace)` → `realpath` → `WorkspaceReadiness.check`. Ключ — worker `fingerprint` (Kit `inspectionInputs`): `{key, transaction}`; ключ покрывает содержимое, Git index и hooks, конфигурацию, источники планирования и `NONE`, транзакции и evidence, `documentation.index`, и меняется даже при повторной правке уже изменённого файла того же размера. Тот же ключ адресует кеш recovery ([context-delivery.md](context-delivery.md)).
- Очередь: одна активная проверка, последний ожидающий UI-выбор и удерживаемые фоновые запросы контекста. Запросы одной папки объединяются; UI не вытесняет retain=true. Fingerprint до/после и inputKey должны совпасть; допускается один повтор расхождения либо CONCURRENT_CHANGE. Транзакция даёт READINESS_BUSY. clear(workspace) отменяет проверки своей папки; детали — [readiness](session-opening-performance.md).
- Кеш ≤4 папок, только `ready`-результаты; ошибки и транзакции не кешируются; копии результатов изолированы. Запись кеша сама по себе отправку не разрешает.
- `ready` = нет проблем, launcher OK, hooks без ошибок, recovery текущего плана `COMPLETE` (worker вызывает `scripts/workflow.mjs recover --format json`; старому Kit при `SESSION_REQUIRED` — `--session <owner_session_id> [--plan <scope_id>]`). Проверяется только current plan: исторические и повреждённые архивные payload не блокируют открытие, миграцию Kit Web Pilot не дублирует. SessionStart, Codex и первый коммит условиями не являются. Незавершённая транзакция Kit — не ready.
- Сохранённый проект открывает свой URL сразу после проверки записи; полная readiness идёт в фоне и обязательна до любой отправки. Первое подключение проходит полный preview до открытия. «Обновить контекст» и новый Chat/Work сначала повторяют проверку папки.
- Сохранённый проект на старом совместимом Kit получает в фоне действие `upgrade`: панель предлагает «Обновить Workflow Kit» (через preview/apply), до обновления чат только для просмотра.

### Worker и Node

- Worker — отдельный Node-процесс, не Electron: `execFile(node, [workspace-setup-worker.mjs])`, вход — JSON в stdin (`action, mode, project, name?, fingerprint?`), выход — JSON в stdout; 120 с, 4 MiB. Из окружения удаляются `ELECTRON_RUN_AS_NODE`, `GIT_DIR`, `GIT_WORK_TREE`, `GIT_INDEX_FILE`, `GIT_COMMON_DIR`, `GIT_OBJECT_DIRECTORY`, `GIT_ALTERNATE_OBJECT_DIRECTORIES`, `GIT_PREFIX`; задаются `GIT_OPTIONAL_LOCKS=0`, `GIT_TERMINAL_PROMPT=0`. Коды worker: `SETUP_ACTION`, `SETUP_MODE`, `PROJECT_PATH`, `PREVIEW_CHANGED`, `SETUP_BLOCKED`, `CONCURRENT_CHANGE` и коды Kit; ответ без JSON → `SETUP_FAILED` с хвостом stderr (≤500 символов).
- Кандидаты Node: macOS — комплектный `Contents/Resources/mac-tools/node/bin/node` (в разработке `.harness/runtime/mac-tools/…`), затем `/opt/homebrew/bin/node`, `/usr/local/bin/node`; Windows — portable `resources/windows-node/node-v24.21.0-win-x64/node.exe` (в разработке `.harness/runtime/windows-node/…`), затем `%ProgramFiles%\nodejs`, `%ProgramFiles(x86)%\nodejs`, `node.exe` из PATH. `process.execPath` Electron как Node не используется. Системный Node на Windows не нужен, автоустановки Node нет.
- Принимается только линия 24 не ниже 24.21; иначе `NODE_TOO_OLD` (ниже) или `NODE_UNSUPPORTED` (25+). Windows различает `NODE_START_FAILED` (не запускается, таймаут, неверный вывод) и `NODE_MISSING`; macOS — `NODE_MISSING`. Сбойный кандидат не останавливает перебор, кешируется только успешный. stderr и окружение кандидатов в сообщения не попадают. Сам Kit требует Node ≥22.
- Windows: перед каждым вызовом worker готовятся компоненты (`ensureTools`) и окружение MinGit комплекта: `WORKFLOW_GIT_BIN`, `WORKFLOW_GIT_HOME`, `Path` (ошибки `WINDOWS_RUNTIME_NOT_INSTALLED`, `WINDOWS_GIT_LAYOUT_INVALID`, `WINDOWS_GIT_INCOMPLETE`, `WINDOWS_GIT_START_FAILED`). `setRuntimeEnvironment` принимает только их и `WORKFLOW_NODE_LICENSE`, без переводов строк и NUL (иначе `RUNTIME_ENVIRONMENT`), и заменяет `Path` независимо от регистра. `NODE_OPTIONS`/`NODE_PATH` удаляются без учёта регистра только у дочернего процесса; системное окружение не меняется. Подготовке Git-проекта не нужны Codex и запущенные службы (инструментам — нужны).
- Ключи MCP и туннеля в проект не попадают.

## Решения и запреты

- Создание и подключение «как в Project Workflow Kit»: без автомиграции, до подтверждения preview/apply ничего не ставится (решение пользователя).
- Сначала расположение, потом имя; выбор запоминается и меняется только явно (решение пользователя).
- Readiness и Doctor проверяют только current plan; Doctor запускается только явным действием ([project-doctor.md](project-doctor.md)).

Не возвращать: поля автора/email в форме и IPC; подстановку `~/VSCODE` или папки открытого проекта как расположения новых проектов; создание `MODULES`/`DOCUMENTATION_INDEX`/`PRODUCT`/`WORKFLOW_START`/`ARCHITECTURE`; отдельный список версий Kit в worker; Electron под видом Node для worker.

## Проверки

- `tests/workspace-setup.test.mjs` — настоящий Kit: создание и повторное открытие, сохранение существующих файлов и staging, конфликты и изменённый preview, reconnect, изменённое ядро и отсутствующие документы, legacy и неподдерживаемая версия, upgrade 1.2/1.3/текущего Kit с backup, Git-подкаталог, неверные имена и истёкшие токены, кандидаты и коды Node на macOS/Windows, окружение Windows, Git identity, ключ readiness.
- `tests/workspace-readiness.test.mjs`, `tests/workflow-kit-upgrade.test.mjs`, `tests/session-plans.test.mjs`, `tests/project-doctor.test.mjs`, `tests/workflow-kit-recovery.test.mjs`, `tests/workflow-kit-source.test.mjs`.
- Проверки `.harness/workflow.json`: `unit-all`; `electron-smoke` (форма, сохранение `projectsParent` на диск, первая сессия Chat/Work); `release-installed` (worker inspect/apply/inspect комплектным Node без системного node на временном Git-проекте).
- Вручную (пользователь): создание и подключение проекта в установленном приложении на чистой macOS и на native Windows.

## Открыто

- Native Windows: worker на portable Node, окружение MinGit и создание проекта проверены только тестами с подменой платформы; приёмка на Windows — за пользователем.
