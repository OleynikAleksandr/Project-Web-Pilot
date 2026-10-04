# Workflow Kit Package — техническая спецификация

Текущий опубликованный release contract: `@webpilot/workflow-kit` **1.5.1**, 35 файлов, SHA-256 `93de6bb6362dfe968f971922a24028886780a8df6b773730f721c7489532dd33`. Локальный Workflow Kit **1.5.2** после policy DOCS → delivery: 35 файлов, SHA-256 `646fec106c498e004d8688a3bc40012bea1654178ce66a61b650211ab28055df`; отдельный release ещё не выполнялся.

## Среда Node.js

Минимальное требование `@webpilot/workflow-kit` 1.5.1 — **Node 22+**: его задают `package.json` (`engines.node: >=22`), CLI и installer launcher. Рабочая среда разработки и опубликованный Web Pilot 0.6.80 используют **Node 24.21.0**. Переход клиента и его workers на Node 24 сохраняет совместимость пакета Kit; локальная package version — 1.5.2, опубликованная — 1.5.1.

## Назначение

`@webpilot/workflow-kit` — единственный canonical Node.js package Workflow Kit. Он предоставляет CLI, installer/upgrade, programmatic imports для доверенных локальных клиентов и self-contained runtime payload для упаковки приложений.

Source of truth: `src/`. Установленный `<project>/.harness/kit/` — производный snapshot installer-а, а не второй редактируемый исходник.

## Current plan contract

Project state принадлежит Git checkout/worktree:

```text
one checkout/worktree
        =
one current plan
        =
.harness/plans/todo-plan.md
```

Chat/WebPilot session не владеет plan и не выбирает его. Обычные `status/validate/recover/task/commit` работают без session selector.

Legacy `--session` временно принимается только как compatibility metadata. Legacy `--plan` не может переключить runtime на historical plan: допускается только current scope ID, иначе возвращается `PLAN_NOT_CURRENT`.

`plan:prepare`, `plan:bind` и ownership-`plan:adopt` удалены из постоянного workflow contract.

## Consumer API

Основные импорты:

```js
import {
  VERSION,
  getRuntimeRoot,
  currentPlanView,
  sessionPlanView,
} from '@webpilot/workflow-kit';

import { contextPacket } from '@webpilot/workflow-kit/lib/recovery';
import { install, inspect } from '@webpilot/workflow-kit/lib/installer';
```

Также сохраняются subpath exports для `common`, `actions`, `session-plans`, `plan`, `transaction`, `installer`, `inspection-inputs`, `installation-files`, `git` и других существующих lib-модулей.

### currentPlanView

`currentPlanView(root)` — основной checkout-scoped consumer view. Он возвращает current `todo-plan.md`, его `plan_id`/scope и parsed plan.

### sessionPlanView — transition facade

`sessionPlanView(root, anySessionId)` временно сохраняется для адаптации старого Project Web Pilot.

Его семантика:

- любой syntactically valid session ID видит один и тот же current plan checkout;
- `session_id` может echo-иться обратно consumer-у;
- `prepared` и `unassigned` пусты;
- session ID не выбирает plan и не создаёт owner;
- historical `planId` не является runtime selector.

После адаптации Web Pilot новый код должен предпочитать `currentPlanView`; compatibility facade можно удалить отдельным breaking change.

## Legacy migration

Upgrade session-owned установки:

1. сначала строго валидирует existing `.harness/plans/todo-plan.md`;
2. valid current plan всегда остаётся winner, даже если legacy directories содержат ACTIVE plans;
3. invalid/missing current plan останавливает migration до любых destructive writes;
4. `.harness/plans/by-id/*.md` и `.harness/plans/by-session/*.md` сохраняются в `.harness/plans/archive/legacy-session-plans/` с digest verification и collision-safe именами;
5. только после подтверждённых archive copies исходные legacy files удаляются;
6. owner/prepared/session ownership fields удаляются из current plan;
7. повторный upgrade/migration идемпотентен.

Historical archive не участвует в normal readiness, inspection key или current recovery. Oversized history поэтому не блокирует проект; hard transport limit остаётся строгим для current recovery.

## Git worktrees

Workflow Kit не создаёт worktrees автоматически. Если требуется независимая параллельная работа, consumer создаёт отдельный Git branch/worktree обычными средствами Git. Каждый worktree получает свой tracked `.harness/plans/todo-plan.md` и поэтому имеет независимое current state без глобального registry.

## Runtime resource

`getRuntimeRoot()` возвращает абсолютный путь к canonical runtime payload текущей package version. Consumer может stage его как build artifact:

```js
import fs from 'node:fs/promises';
import { getRuntimeRoot } from '@webpilot/workflow-kit';

await fs.cp(getRuntimeRoot(), stageDirectory, { recursive: true });
```

Готовое приложение обязано быть self-contained и не зависеть от соседнего `/VSCODE/WorkflowKit`.

## Project Web Pilot adaptation

Web Pilot сохраняет старые chat/session records и их chat URL/title/history, но больше не использует legacy `planId`, `originSessionId` или binding metadata для выбора Workflow Kit state.

Правило UI:

> Открыть любой старый или новый chat = открыть его conversation history и показать актуальный current plan выбранного project checkout.

Если нужен старый plan, связанный с прежним разговором, он показывается отдельным read-only history view.

Workspace Setup и project readiness проверяют только current checkout state и не full-recover-ят historical plans.

## Актуальная интеграция — локальная macOS Web Pilot 0.6.80

Опубликованная парная Web Pilot 0.6.80 включает прежний опубликованный Kit 1.5.1. В 0.6.80 сохранение ScreenCapture после обновления и перезагрузки подтверждено проверками и пользователем; это исправление подписи клиента, без изменения runtime/API/CLI Kit. Windows x64 0.6.80 собран, проверен на Mac и опубликован вместе с macOS asset; native Windows отдельно не проверен. Клиент управляет AutoPlan событийно: постоянный выбор, одно точное «Продолжай» на подходящую паузу незавершённого ACTIVE-плана, durable защита от повторов и приоритет ручного ввода. Стартовая инструкция и footer-протокол удалены. Это поведение принадлежит Web Pilot и не меняет API/CLI или minimum Node пакета Kit. [Действующий контракт AutoPlan](https://github.com/OleynikAleksandr/Project-Web-Pilot/blob/main/docs/planning/auto-plan-client-driven-refactor.md).

## Проверки package contract

`scripts/check-runtime-fixture.mjs` проверяет single-active runtime, compatibility session IDs, legacy migration, strict current recovery budget, Git worktree isolation и порядок code → DOCS → package/installed при plan:create/plan:extend, включая повторное открытие DOCS для correction.

`scripts/check-consumer-contract.mjs` проверяет local `file:` dependency, package/subpath imports, `currentPlanView/sessionPlanView`, `npm pack` standalone consumer и staging runtime без sibling repository.

`scripts/check-package.mjs` проверяет package identity/fileset/exports и отсутствие project/runtime state в tarball.

Release **@webpilot/workflow-kit 1.5.1**: canonical runtime — **35 файлов**, SHA-256 **93de6bb6362dfe968f971922a24028886780a8df6b773730f721c7489532dd33**. Текущий непубликованный Workflow Kit **1.5.2** — **35 файлов**, SHA-256 **646fec106c498e004d8688a3bc40012bea1654178ce66a61b650211ab28055df**. Upgrade 1.5.1 → 1.5.2 поддерживается installer-ом. Workflow Kit **1.5.3** — **35 файлов**, SHA-256 **d59ae7b6b074e953fdd6c5d78d1f644902f0e7b9af5ad3c78d67d42f1f6a1c0f**: команда `project:rename`, upgrade 1.5.2 → 1.5.3. Installer принимает upgrade с 1.4.13; runtime regression проверяет этот переход, архивирование legacy session plans, strict current recovery budget и Git worktree isolation.

## Workflow Kit 1.5.3 — переименование проекта

По поручению пользователя 04.10.2026 добавлена команда `project:rename --name <имя> --expected-revision N`. Она меняет `project_name` в current plan (заголовок плана и recovery) — например, после переименования папки проекта — и обновляет абсолютные пути git-hooks в `.harness/kit-manifest.json` под текущий checkout. Один служебный коммит (роль kit-update); повтор без изменений не коммитит; при активной микрозадаче и недопустимом имени — отказ без изменений. Папку команда не переименовывает. Установки 1.5.2 обновляются до 1.5.3 штатным `install --update`. Runtime: 35 файлов; SHA-256 `d59ae7b6b074e953fdd6c5d78d1f644902f0e7b9af5ad3c78d67d42f1f6a1c0f`. Проверка — сценарий переименования в `scripts/check-runtime-fixture.mjs`. Контракт: [Переименование проекта](../planning/project-rename.md).

## Workflow Kit 1.5.1 — перенос остатка scope

По поручению пользователя 28.09.2026 добавлена plan:carryover: архив содержит точную исходную копию со статусами TODO/DONE; новый current plan — только незавершённые задачи и DOCS. Критерии, проверки, planning/module ссылки и зависимости между оставшимися задачами сохраняются. Ссылки на выполненные зависимости хранятся в carryover metadata и архиве. Оба плана фиксируются одним Git-коммитом. Нужны чистый checkout, отсутствие активной микрозадачи, точная revision и прямое поручение. Повтор после успеха безопасен; прерывания обслуживает штатный repair. Обычный archive сохраняет требование всех DONE. Runtime: 35 файлов; SHA-256 93de6bb6362dfe968f971922a24028886780a8df6b773730f721c7489532dd33.

Проверка — scripts/check-carryover-fixture.mjs через установленный CLI: точный архив, сохранность задач, зависимости, отказы без изменения плана, повтор и прерывания до/после коммита. Входит в runtime gate. Текущий локальный клиент — macOS Project Web Pilot 0.6.80; последняя опубликованная парная поставка — 0.6.78; прежняя 0.6.72 была первым выпуском клиента с plan:carryover.

## Документальная актуализация после публикации 0.6.78 — 03.10.2026

По поручению пользователя README и связанные документы отражают опубликованную поставку клиента. AutoPlan 0.6.78 использует native ID или сохраняемые наблюдаемые циклы генерации, ожидает готовность истории и очищает только собственную неизменённую отменённую вставку. Защита от повторов и ручной ввод сохраняются. Живая приёмка исправления, native Windows и чистый первый запуск отдельно не подтверждены. Источник проверки — опубликованный тег клиента и его release/verification документы.

Проверка этой актуализации: версии и взаимные ссылки README, все локальные Markdown-ссылки, неизменность runtime/package относительно v1.5.1; затем managed commits и сверка main/README через GitHub. Новая версия Kit, сборка клиента и перемещение release tags не требуются. Архивирование не поручено.