# Краткая архитектура проекта

## Назначение

WorkflowKit — canonical Node.js package `@webpilot/workflow-kit`. Репозиторий `/Users/oleksandroliinyk/VSCODE/WorkflowKit` является единственным местом разработки кода Kit. Текущий release — **1.5.1**.

Рабочая среда и интеграция с Web Pilot 0.6.78 используют Node 24.21.0; минимальное требование самого пакета Kit остаётся Node 22+. Версия 1.5.1 и canonical runtime не меняются.

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

Canonical runtime: 35 файлов; SHA-256 `93de6bb6362dfe968f971922a24028886780a8df6b773730f721c7489532dd33`.

Проверки: `node scripts/check-package.mjs`, `node scripts/check-runtime-fixture.mjs`, `node scripts/check-consumer-contract.mjs`.

Подробный контракт: [Workflow Kit Package](../modules/workflow-kit-package.md). История package extraction: [Canonical Workflow Kit Package](../planning/canonical-workflow-kit-package.md). Спецификация миграции state: [Single Active Plan Migration](../planning/single-active-plan-migration.md).

## Workflow Kit 1.5.1 — перенос остатка scope

По поручению пользователя 28.09.2026 добавлена plan:carryover: архив содержит точную исходную копию со статусами TODO/DONE; новый current plan — только незавершённые задачи и DOCS. Критерии, проверки, planning/module ссылки и зависимости между оставшимися задачами сохраняются. Ссылки на выполненные зависимости хранятся в carryover metadata и архиве. Оба плана фиксируются одним Git-коммитом. Нужны чистый checkout, отсутствие активной микрозадачи, точная revision и прямое поручение. Повтор после успеха безопасен; прерывания обслуживает штатный repair. Обычный archive сохраняет требование всех DONE. Runtime: 35 файлов; SHA-256 93de6bb6362dfe968f971922a24028886780a8df6b773730f721c7489532dd33.

Проверка — scripts/check-carryover-fixture.mjs через установленный CLI: точный архив, сохранность задач, зависимости, отказы без изменения плана, повтор и прерывания до/после коммита. Входит в runtime gate. Актуальная интеграция и парная поставка — Project Web Pilot 0.6.78; прежняя 0.6.72 была первым выпуском клиента с plan:carryover.
