# Workflow Kit Package — техническая спецификация

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

## Проверки package contract

`scripts/check-runtime-fixture.mjs` проверяет single-active runtime, compatibility session IDs, legacy migration, strict current recovery budget и Git worktree isolation.

`scripts/check-consumer-contract.mjs` проверяет local `file:` dependency, package/subpath imports, `currentPlanView/sessionPlanView`, `npm pack` standalone consumer и staging runtime без sibling repository.

`scripts/check-package.mjs` проверяет package identity/fileset/exports и отсутствие project/runtime state в tarball.

Финальная release version и digest фиксируются в release-задаче T006.
