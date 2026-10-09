# Доктор проекта

Автономная проверка и безопасный ремонт известных неисправностей установки Workflow Kit в проекте (owned-файлы, manifest, Kit-секция AGENTS, Git hooks, проекция current plan, журнал подтверждённого коммита) и локальных служб — без страницы ChatGPT и MCP; затем полная проверка через Workspace Setup. Целую старую версию Kit обновляет не Доктор, а обычная подготовка ([workspace-setup.md](workspace-setup.md)); неизвестное Доктор не трогает.

## Код

- `src/project-doctor.mjs` — `ProjectDoctor`: `run(workspace, onProgress)` (координатор), `worker(workspace)`.
- `resources/project-doctor-worker.mjs` — отдельный Node-процесс: stdin `{ action: 'inspect'|'repair', workspace, fingerprint? }`, stdout — JSON-отчёт без содержимого файлов. Приложение вызывает только `repair` (внутри — проверка и повторная проверка под блокировкой).
- `resources/project-doctor/core.mjs` — `inspectProject`, `repairProject`, `publicReport`; `resources/project-doctor/files.mjs` — `regularPath`, `readFile`, `signature`, `backupAndWrite`. Используют только комплектный Kit `resources/workflow-kit/lib/*`, `src/` не импортируют; `resources/` поставляется вне ASAR.
- `src/ui/project-doctor.mjs` — `projectDoctorView` (панель `#doctor-panel` в Settings, `src/ui/index.html`, `src/ui/settings-panel.mjs`).
- `src/main.mjs` — IPC `pilot:open-doctor`, `pilot:doctor-select|run|backup|review|continue`, состояние `doctorState`.

## Поведение

### Поручение и границы

- Решение пользователя: из Settings и с экрана ошибки подготовки проверить и исправить известные неисправности, затем продолжить работу — открыть сессию, новый Chat/Work или обновить контекст.
- Ремонт только по кнопке «Проверить и исправить». Открытие Settings, отчёта или рендер ничего не чинят; при запуске приложения manifest не чинится.
- Не зависит от страницы ChatGPT и MCP, сообщений не отправляет; у страницы ChatGPT нет IPC-доступа. Код проекта (установленный `scripts/workflow`, `.harness/kit`) не исполняется: проверка и запись — комплектным Node и комплектным Kit в отдельном процессе; пока целостность не установлена, проверка Workspace Setup не запускается.
- Проверяется только current plan `.harness/plans/todo-plan.md` и его required-документы. Архив планов (`.harness/plans/by-id`, `by-session`, `archive`) не читается, не нормализуется и не блокирует; миграцию Kit Web Pilot не дублирует.

### Запуск

1. `pilot:doctor-run(workspace)` — только от сайдбара (`IPC_FORBIDDEN` иначе) и при открытых Settings; папка — зарегистрированный проект или выбранная в подготовке (иначе «Выберите проект в настройках.»). Доставка приостанавливается, ContextCache очищается.
2. `ProjectDoctor.run` — один запуск за раз («Доктор уже работает.»); фазы `repairing` → `verifying` → `services` → `done` публикуются в UI.
3. Worker: комплектный Node (`setup.node()`), окружение подготовки (`setup.environment`), 120 с, вывод ≤2 МиБ, stdin `{ action: 'repair', workspace }`. Не-JSON → `DOCTOR_OUTPUT` (или код ошибки процесса); `ok: false` → issue с кодом (по умолчанию `DOCTOR_FAILED`) и `backupPath`.
4. Есть issues worker → стоп, подготовка не запускается.
5. Workspace Setup preview `existing`; `reconnect` → apply («Восстановлены локальные команды проекта»); не готово → issues подготовки (`upgrade` → «Нужно обновить комплект через обычное подключение проекта.»).
6. Службы: `runtime.ensure()`; ошибка — отдельный issue «Подключение» с кодом. `projectReady` и `servicesReady` раздельны; ошибка служб не считается восстановлением.

Отчёт: `workspace, version, kitVersion, checks[{label, ok}], repairs[], issues[{path, reason, code}], projectReady, servicesReady, backupPath, repaired`.

### Проверка (`inspectProject`)

- Путь абсолютный, без CR/LF/NUL (`PROJECT_PATH`); корень репозитория; нет активной Git-операции (merge, cherry-pick, revert, rebase → `GIT_OPERATION_ACTIVE`).
- `.harness/kit-manifest.json`: нет или не JSON → `DOCTOR_MANIFEST` (состав установки не угадывается); `schema_version: 1`, массив `files`, версия из того же списка, что у Workspace Setup: `1.0.0`, `upgradeFrom` комплектного установщика и `VERSION` (1.6.4); иначе `DOCTOR_VERSION`. Целая старая версия направляется в обычную подготовку.
- Доверенный каталог — owned-файлы комплектного payload Kit. Owned-записи manifest уникальны и известны каталогу, иначе `DOCTOR_INVENTORY`.
- Каждый доверенный owned-файл: есть и отличается → issue «Откройте обычную подготовку…», файл сохраняется; отсутствует, а manifest записывает другой hash → issue (другая версия); отсутствует при совпадающем hash → восстановить; потерян бит исполнения (кроме Windows) → восстановить. Лишний файл в `.harness/kit` → issue.
- Любой issue на этом шаге — стоп без записи, даже при устаревшем manifest.
- `AGENTS.md`/`AGENTS.override.md`: Kit-секция равна шаблону → согласовать `section_hash`; файла нет → `DOCTOR_DOCUMENT`.
- Hooks `pre-commit`, `commit-msg`, `post-commit`, `pre-push` (каталог по `core.hooksPath`; вне проекта → `SHARED_HOOKS`): нет управляемой секции → дописать её, сохранив чужое; секция повреждена или изменена → issue, не перезаписывается; потерян бит исполнения → восстановить.
- Current plan: нет → `DOCTOR_PLAN`; canonical разбирается Kit (ошибка → issue); читаемая проекция отличается от рендера canonical → переписать проекцию; читаются `.harness/workflow.json` и конфигурация, разрешаются ссылки плана.
- Журнал фиксации `.git/workflow-kit/transaction.json`: коммит подтверждён → завершить журнал; не подтверждён → `DOCTOR_PENDING` (продолжить исходную задачу; Доктор не коммитит).
- Required-документы: `required_documents` manifest (без него — `docs/architecture/OVERVIEW.md`), `.harness/plans/todo-plan.template.md`, required-документы плана и его задач; недопустимый путь → `DOCTOR_PATH`; отсутствующий → issue, не создаётся.
- Manifest согласуется с `VERSION` (с `doctor_reconciled_at`) только когда все owned-файлы побайтно совпали с каталогом и issues нет. Hashes не пересчитываются по произвольным файлам, downgrade невозможен.
- Отпечаток — HEAD и подписи (mode + содержимое) всех прочитанных файлов, включая Git index и журнал фиксации.

### Ремонт и запись (`repairProject`, `backupAndWrite`)

- Проверка → под общей блокировкой Kit (`.git/workflow-kit/operation.lock`) повторная проверка; отпечаток изменился → `DOCTOR_CHANGED`.
- Пути: symlink в любом компоненте → `DOCTOR_SYMLINK`; компонент занят файлом → `DOCTOR_PATH`; только обычные файлы ≤16 МБ (`DOCTOR_FILE`).
- Backup до записи: `.harness/runtime/doctor/<ISO-время>-<uuid>/` (0700) — исходные байты изменяемых файлов, current plan и manifest (при журнале фиксации также `transaction.json`, `index-before`, `last-verification.json`, `last-commit.json`), файлы 0600; журнал `repair.json` (`prepared` → `applied`|`failed`, режимы, подписи, `rollbackConflicts`).
- Каждая запись: повторная сверка подписи (`DOCTOR_CHANGED`), atomic temp (`wx`) + rename с режимом.
- Ошибка: откат в обратном порядке только своих файлов, не изменённых после записи; остальные — в `rollbackConflicts`; backup остаётся, путь возвращается.
- Подтверждённый журнал завершается штатным `finishTransaction` Kit после backup.
- Результат — отчёт повторной проверки, `repairs`, `backupPath`, `repaired`; повторный запуск ничего не меняет (`repaired: false`).
- Не делает: закрытие scope, коммит пользовательской работы и staging, изменения сессий и облачных чатов. Исправления owned-файлов остаются видимыми в Git — UI об этом сообщает.

### UI

- Settings → «Доктор проекта»: выбор проекта (зарегистрированные + выбранная в подготовке папка), путь, статус (`aria-live`), «Проверить и исправить»; во время работы кнопки заблокированы. Settings доступны и при ошибке подготовки.
- Вход: «Доктор проекта» на заблокированном экране подготовки и в ошибке готовности проекта → `pilot:open-doctor` открывает Settings для этой папки.
- Результат: ✓ исправления и пройденные проверки, ○ оставшиеся проблемы; при backup — пояснение и «Открыть резервную копию».
- Успех (`done`, `projectReady`, `servicesReady`, нет issues): «Открыть сессию», «Обновить контекст», «Новый Chat», «Новый Work» → `pilot:doctor-continue(open|refresh|chat|work)`: строгая проверка папки, выбор проекта, новая сессия для chat/work, навигация; доставка только по выбранной пользователем команде.
- Не готово: «Открыть проверку папки» → `pilot:doctor-review` — обычная проверка Workspace Setup, где предлагается штатное обновление целой старой версии.

## Решения и запреты

- Чинится только известное и только с backup; изменённые/лишние owned-файлы, изменённая секция hook, повреждённые manifest/план, отсутствующие документы, Git merge/rebase, незавершённая фиксация — только issue, потому что угадывание легализует чужие изменения или теряет данные пользователя.
- Manifest согласуется только с полностью совпадающим доверенным комплектом: пересчёт hashes узаконил бы произвольные правки.
- Службы — только существующий `runtime.ensure()`; чужие процессы, credentials и аккаунт не трогаются.
- Намеренно оставлять или возвращать stale-состояние в реальном проекте нельзя; повреждения моделируются только на временных fixtures.
- Не возвращать: ремонт при открытии Settings/рендере/запуске; проверку всех планов сессий и каталогов `by-id`/`by-session`.

## Проверки

Штатное обновление Kit сохраняет ограничения активных назначений/интеграций: отказ до записи не обходится ремонтом. Контракт и проверка перехода 1.6.4 → 1.7.0 — [назначения Kit](../../packages/workflow-kit/docs/modules/parallel-assignments.md).

- `unit-all`: `tests/project-doctor.test.mjs` (устаревший manifest, отсутствующие owned-файл/hook/права, неизвестная правка, лишний файл, повреждённые manifest/план, проекция, изменившийся снимок и hook, symlink, откат при сбое записи, завершение подтверждённого коммита, архивные планы не затрагиваются, согласование 1.4.0 и отсутствующие документы задач); `tests/project-doctor-ui.test.mjs` (только явный запуск, блокировка повтора, Доктор из ошибки подготовки, раздельная готовность служб, нет проверки подготовки после недоверенных файлов, восстановление локальных команд).
- `electron-smoke` на временной папке: ошибка готовности → «Доктор проекта» → открытие ничего не чинит → ремонт с backup и `repair.json` → manifest = комплектная версия, выбранная сессия не меняется → «Открыть сессию» → повтор без изменений → «Обновить контекст» доставляет один раз; панель на минимальной ширине в обеих темах.
- Ручная проверка пользователя на установленном приложении: полностью закрыть прежнюю версию, открыть новую → Settings → Доктор проекта → проект → «Проверить и исправить»; одно открытие Settings ничего не меняет. Реальный проект для проверки не повреждается.
