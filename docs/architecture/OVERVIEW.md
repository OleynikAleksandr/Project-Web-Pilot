# Краткая архитектура проекта

## Назначение

WorkflowKit — canonical Node.js package `@webpilot/workflow-kit`. Репозиторий `/Users/oleksandroliinyk/VSCODE/WorkflowKit` является единственным местом разработки кода Kit. Текущий canonical source/runtime — **1.5.5**, 35 файлов, SHA-256 `8eadd98869a840f670dbfb00c33350e3054d8ec7de5298b2b0beca82d787f376`; последний отдельный GitHub Release Kit — **v1.5.1**. Текущий опубликованный клиент — **Project Web Pilot 0.6.94**, он bundles Workflow Kit **1.5.5**.

Рабочая среда и опубликованная интеграция Web Pilot 0.6.94 используют Node 24.21.0; минимальное требование самого пакета Kit остаётся Node 22+. Отдельный Release Kit остаётся v1.5.1; версии 1.5.2–1.5.5 развивались в `main`, а canonical 1.5.5 уже поставляется внутри Web Pilot 0.6.94.

## Устройство

```text
@webpilot/workflow-kit
├── index.mjs          # public package API и consumer facade
├── src/               # canonical 35-файловый runtime source
├── scripts/           # package/runtime/consumer проверки
└── .harness/kit/      # self-host installed runtime, производный от package
```

Project state принадлежит Git checkout/worktree. Единственный runtime current plan — `.harness/plans/todo-plan.md`. Chat/session не выбирает plan; старый `--session` — только transition metadata. Параллельный независимый state требует отдельного Git worktree.

Upgrade со старой session-owned установки оставляет valid `todo-plan.md` current winner и переносит `by-id/by-session` в read-only history без merge. Historical recovery не участвует в normal readiness; strict transport limit применяется к current recovery.

Внешние клиенты используют package imports. `currentPlanView(root)` — основной consumer API; `sessionPlanView(root, sessionId)` временно сохраняется для старых WebPilot chat records. `getRuntimeRoot()` даёт runtime payload для автоматического staging.

## Проверка

Текущий canonical runtime 1.5.5: 35 файлов; SHA-256 `8eadd98869a840f670dbfb00c33350e3054d8ec7de5298b2b0beca82d787f376`. Прежний 1.5.4: SHA-256 `3a9a3838dbfaac80bccf8cb05d3be71576797cbb6946c6b1537a9c73c383b562`. Прежний 1.5.3: SHA-256 `d59ae7b6b074e953fdd6c5d78d1f644902f0e7b9af5ad3c78d67d42f1f6a1c0f`. Прежний 1.5.2: SHA-256 `646fec106c498e004d8688a3bc40012bea1654178ce66a61b650211ab28055df`. Опубликованный Release 1.5.1 сохраняет SHA-256 `93de6bb6362dfe968f971922a24028886780a8df6b773730f721c7489532dd33`.

Проверки: `node scripts/check-package.mjs`, `node scripts/check-runtime-fixture.mjs`, `node scripts/check-consumer-contract.mjs`.

Подробный контракт: [Workflow Kit Package](../modules/workflow-kit-package.md). Policy DOCS → delivery: [Delivery Ordering](../planning/delivery-ordering-policy.md). История package extraction: [Canonical Workflow Kit Package](../planning/canonical-workflow-kit-package.md). Спецификация миграции state: [Single Active Plan Migration](../planning/single-active-plan-migration.md).

## Workflow Kit 1.5.5 — push только после DOCS

По поручению пользователя 04.10.2026 ([контракт](../planning/push-after-docs.md)): управляемый `pre-push` hook отказывает в push, пока у текущего плана checkout есть незавершённая DOCS (`DOCS_BEFORE_PUSH`). Без плана и после DOCS push разрешён; повторно открытая `plan:extend` DOCS снова его останавливает. Так публикация исходников на GitHub, оформленная даже обычной задачей, не уходит раньше актуальных документов. Форма плана и правила прототипа называют такую публикацию delivery-задачей после DOCS (`verification_kind=package` с проверкой удалённой ветки). Новых полей схемы нет. Runtime 1.5.5: 35 файлов, SHA-256 `8eadd98869a840f670dbfb00c33350e3054d8ec7de5298b2b0beca82d787f376`.

## Workflow Kit 1.5.4 — компактный recovery

По поручению пользователя 04.10.2026 ([контракт](../planning/compact-recovery.md)): recovery больше не включает формы PLAN/SPEC/CONTINUE/STAGES — их печатают `plan:create --help`, `plan:extend --help` и `task:start --help`. Карты `docs/MODULES.md` и `docs/DOCUMENTATION_INDEX.md` остаются обязательными документами плана, но в recovery идут ссылкой (целиком — только в финальной DOCS). Блок «ФОРМЫ И КАРТЫ ПО ЗАПРОСУ» перечисляет команды и пути. Пакет Project Web Pilot уменьшился примерно вдвое: агент в ChatGPT получает его за 1–2 чтения. Схема плана и проверки не менялись. Runtime 1.5.4 — 35 файлов, SHA-256 `3a9a3838dbfaac80bccf8cb05d3be71576797cbb6946c6b1537a9c73c383b562`; upgrade 1.5.3 → 1.5.4 через `install --update`.

## Workflow Kit 1.5.3 — переименование проекта

По поручению пользователя 04.10.2026 добавлена команда `project:rename --name <имя> --expected-revision N`. Она меняет `project_name` в current plan (заголовок плана и recovery) — например, после переименования папки проекта — и обновляет абсолютные пути git-hooks в `.harness/kit-manifest.json` под текущий checkout. Один служебный коммит (роль kit-update); повтор без изменений не коммитит; при активной микрозадаче и недопустимом имени — отказ без изменений. Папку команда не переименовывает. Установки 1.5.2 обновляются до 1.5.3 штатным `install --update`. Runtime: 35 файлов; SHA-256 `d59ae7b6b074e953fdd6c5d78d1f644902f0e7b9af5ad3c78d67d42f1f6a1c0f`. Проверка — сценарий переименования в `scripts/check-runtime-fixture.mjs`. Контракт: [Переименование проекта](../planning/project-rename.md).

## Workflow Kit 1.5.1 — перенос остатка scope

По поручению пользователя 28.09.2026 добавлена plan:carryover: архив содержит точную исходную копию со статусами TODO/DONE; новый current plan — только незавершённые задачи и DOCS. Критерии, проверки, planning/module ссылки и зависимости между оставшимися задачами сохраняются. Ссылки на выполненные зависимости хранятся в carryover metadata и архиве. Оба плана фиксируются одним Git-коммитом. Нужны чистый checkout, отсутствие активной микрозадачи, точная revision и прямое поручение. Повтор после успеха безопасен; прерывания обслуживает штатный repair. Обычный archive сохраняет требование всех DONE. Runtime: 35 файлов; SHA-256 93de6bb6362dfe968f971922a24028886780a8df6b773730f721c7489532dd33.

Проверка — scripts/check-carryover-fixture.mjs через установленный CLI: точный архив, сохранность задач, зависимости, отказы без изменения плана, повтор и прерывания до/после коммита. Входит в runtime gate. Исторически 0.6.72 был первым клиентом с plan:carryover; текущий опубликованный клиент — Project Web Pilot 0.6.94 с bundled Kit 1.5.5.
