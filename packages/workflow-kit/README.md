# Workflow Kit

Пакет `@webpilot/workflow-kit`: состояние проекта, текущий план, recovery и жизненный цикл задач в одном Git checkout/worktree.

Пакет живёт в репозитории [Project Web Pilot](https://github.com/OleynikAleksandr/Project-Web-Pilot), папка `packages/workflow-kit`. До 06.10.2026 он разрабатывался в отдельном репозитории [WorkflowKit](https://github.com/OleynikAleksandr/WorkflowKit); история перенесена сюда одной операцией `git subtree` (последний коммит прежнего репозитория на момент переноса — `6bbec655497eaea69d5c5825c68e9bdf78a01c18`). Прежний репозиторий после публикации Web Pilot 0.6.96 переводится в архив: только чтение, со ссылкой сюда. Последний отдельный релиз пакета — [v1.5.1](https://github.com/OleynikAleksandr/WorkflowKit/releases/tag/v1.5.1).

Версия — **1.5.5**. Она записана в двух местах, которые проверка пакета сверяет между собой: `package.json` и `src/lib/common.mjs`. Минимальный Node.js — 22 (`engines.node: >=22`); рабочая среда Web Pilot — Node 24.21.0.

## Основная модель

Один Git checkout/worktree имеет один current plan:

```text
.harness/plans/todo-plan.md
```

Chat, сессия Web Pilot или другой клиент не владеют планом и не выбирают его. Новый чат продолжает current state текущего checkout. Для независимой параллельной работы используется отдельный Git worktree.

Legacy `by-id/by-session` после upgrade сохраняются только как read-only history и не участвуют в обычном выборе плана. Старый `--session` принимается как метаданные совместимости и план не выбирает.

## Устройство

```text
packages/workflow-kit
├── index.mjs     # API пакета и фасад потребителя
├── src/          # единственный редактируемый исходник runtime
├── scripts/      # проверки пакета
└── docs/         # спецификация пакета и планировочные контракты
```

```text
packages/workflow-kit/src
      │
      ├── импорт пакета ───> Project Web Pilot (скрипты и тесты)
      ├── копия для сборки ─> resources/workflow-kit (в Git не хранится) ─> приложения macOS и Windows
      └── установщик ──────> <проект>/.harness/kit
```

Публичный runtime пакета — `index.mjs` и `src/`. Установленный `.harness/kit` любого проекта и `resources/workflow-kit` приложения — производные копии, а не второй исходник: они создаются из пакета и сверяются с ним файл в файл. Отдельной службы, базы данных или синхронизации этой схеме не нужно.

Основной API потребителя:

- `currentPlanView(root)` — текущий план checkout;
- `sessionPlanView(root, sessionId)` — переходная совместимость для старых записей Web Pilot;
- `getRuntimeRoot()` — самодостаточный runtime для копирования в приложение;
- CLI `workflow` — команды жизненного цикла.

## Как меняется Kit

Исходник правится обычной задачей плана Project Web Pilot. Kit, которым выполняются коммиты самого репозитория, — установленная копия `.harness/kit`, а не исходник пакета: её обновляет установщик пакета — `node packages/workflow-kit/src/install.mjs --project <папка> --update` — после того, как проверки пакета прошли. Новая версия меняет `package.json` и `VERSION` в `src/lib/common.mjs`; закреплённых чисел файлов и SHA-256 в скриптах нет.

## Проверка

Из корня репозитория:

```bash
npm run check --prefix packages/workflow-kit
```

Команда запускает четыре скрипта: `check-package.mjs` (состав и экспорты пакета, одна версия в двух местах), `check-consumer-contract.mjs` (зависимость `file:`, `npm pack`, копия runtime без исходника), `check-runtime-fixture.mjs` (установка в пробный проект, план, recovery, hooks, upgrade), `check-carryover-fixture.mjs` (перенос остатка плана). В плане Project Web Pilot это проверка `kit-check`. Копию runtime приложения сверяют `scripts/check-workflow-kit-dependency.mjs`, `scripts/stage-workflow-kit.mjs` и `scripts/check-workflow-kit-staging.mjs` в корне репозитория.

## Документация

- [Спецификация пакета](docs/modules/workflow-kit-package.md) — контракт текущего плана, API потребителя, перенос старых планов, runtime, проверки.
- Планировочные контракты: [порядок DOCS → delivery](docs/planning/delivery-ordering-policy.md), [push только после DOCS](docs/planning/push-after-docs.md), [компактный recovery](docs/planning/compact-recovery.md), [переименование проекта](docs/planning/project-rename.md), [один текущий план на checkout](docs/planning/single-active-plan-migration.md), [выделение пакета (история)](docs/planning/canonical-workflow-kit-package.md).
- Документы проекта: [карта модулей](../../docs/MODULES.md), [каталог документации](../../docs/DOCUMENTATION_INDEX.md), [Workflow Kit и recovery в Web Pilot](../../docs/modules/workflow-kit-recovery.md), [рабочие каталоги](../../docs/SOURCE_WORKSPACES.md).

## Использование в Project Web Pilot

Скрипты и тесты импортируют пакет по имени (`"@webpilot/workflow-kit": "file:packages/workflow-kit"`). В приложения macOS и Windows попадает копия `resources/workflow-kit`; готовое приложение от исходников пакета не зависит. Автовыполнение плана, доставка контекста и интерфейс принадлежат клиенту и описаны в [README](../../README.md) и [документах](../../docs/DOCUMENTATION_INDEX.md) Project Web Pilot.

## История версий

Runtime версий 1.5.1–1.5.5 содержит 35 файлов. SHA-256 выпущенных состояний: 1.5.5 — `8eadd98869a840f670dbfb00c33350e3054d8ec7de5298b2b0beca82d787f376`; 1.5.4 — `3a9a3838dbfaac80bccf8cb05d3be71576797cbb6946c6b1537a9c73c383b562`; 1.5.3 — `d59ae7b6b074e953fdd6c5d78d1f644902f0e7b9af5ad3c78d67d42f1f6a1c0f`; 1.5.2 — `646fec106c498e004d8688a3bc40012bea1654178ce66a61b650211ab28055df`; 1.5.1 — `93de6bb6362dfe968f971922a24028886780a8df6b773730f721c7489532dd33`. Версии 1.5.2–1.5.5 отдельными релизами не выпускались и поставлялись внутри Project Web Pilot.

### Workflow Kit 1.5.5 — push только после DOCS

По поручению пользователя 04.10.2026 ([контракт](docs/planning/push-after-docs.md)): управляемый `pre-push` hook отказывает в push, пока у текущего плана checkout есть незавершённая DOCS (`DOCS_BEFORE_PUSH`). Без плана и после DOCS push разрешён; повторно открытая `plan:extend` DOCS снова его останавливает. Так публикация исходников на GitHub, оформленная даже обычной задачей, не уходит раньше актуальных документов. Форма плана и правила прототипа называют такую публикацию delivery-задачей после DOCS (`verification_kind=package` с проверкой удалённой ветки). Новых полей схемы нет. Runtime 1.5.5: 35 файлов, SHA-256 `8eadd98869a840f670dbfb00c33350e3054d8ec7de5298b2b0beca82d787f376`.

### Workflow Kit 1.5.4 — компактный recovery

По поручению пользователя 04.10.2026 ([контракт](docs/planning/compact-recovery.md)): recovery больше не включает формы PLAN/SPEC/CONTINUE/STAGES — их печатают `plan:create --help`, `plan:extend --help` и `task:start --help`. Карты `docs/MODULES.md` и `docs/DOCUMENTATION_INDEX.md` остаются обязательными документами плана, но в recovery идут ссылкой (целиком — только в финальной DOCS). Блок «ФОРМЫ И КАРТЫ ПО ЗАПРОСУ» перечисляет команды и пути. Пакет Project Web Pilot уменьшился примерно вдвое: агент в ChatGPT получает его за 1–2 чтения. Схема плана и проверки не менялись. Runtime 1.5.4 — 35 файлов, SHA-256 `3a9a3838dbfaac80bccf8cb05d3be71576797cbb6946c6b1537a9c73c383b562`; upgrade 1.5.3 → 1.5.4 через `install --update`.

### Workflow Kit 1.5.3 — переименование проекта

По поручению пользователя 04.10.2026 добавлена команда `project:rename --name <имя> --expected-revision N`. Она меняет `project_name` в current plan (заголовок плана и recovery) — например, после переименования папки проекта — и обновляет абсолютные пути git-hooks в `.harness/kit-manifest.json` под текущий checkout. Один служебный коммит (роль kit-update); повтор без изменений не коммитит; при активной микрозадаче и недопустимом имени — отказ без изменений. Папку команда не переименовывает. Установки 1.5.2 обновляются до 1.5.3 штатным `install --update`. Runtime: 35 файлов; SHA-256 `d59ae7b6b074e953fdd6c5d78d1f644902f0e7b9af5ad3c78d67d42f1f6a1c0f`. Проверка — сценарий переименования в `scripts/check-runtime-fixture.mjs`. Контракт: [Переименование проекта](docs/planning/project-rename.md).

### Workflow Kit 1.5.1 — перенос остатка scope

По поручению пользователя 28.09.2026 добавлена plan:carryover: архив содержит точную исходную копию со статусами TODO/DONE; новый current plan — только незавершённые задачи и DOCS. Критерии, проверки, planning/module ссылки и зависимости между оставшимися задачами сохраняются. Ссылки на выполненные зависимости хранятся в carryover metadata и архиве. Оба плана фиксируются одним Git-коммитом. Нужны чистый checkout, отсутствие активной микрозадачи, точная revision и прямое поручение. Повтор после успеха безопасен; прерывания обслуживает штатный repair. Обычный archive сохраняет требование всех DONE. Runtime: 35 файлов; SHA-256 93de6bb6362dfe968f971922a24028886780a8df6b773730f721c7489532dd33.

Проверка — scripts/check-carryover-fixture.mjs через установленный CLI: точный архив, сохранность задач, зависимости, отказы без изменения плана, повтор и прерывания до/после коммита. Входит в runtime gate. На момент появления plan:carryover клиентом был Web Pilot 0.6.72.
