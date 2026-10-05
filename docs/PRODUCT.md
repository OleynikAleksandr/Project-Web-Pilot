# WorkflowKit

WorkflowKit — самостоятельный локальный Node.js package `@webpilot/workflow-kit`, который является единственным редактируемым источником Workflow Kit.

Canonical source/runtime Workflow Kit — **1.5.5**: 35 файлов, SHA-256 `8eadd98869a840f670dbfb00c33350e3054d8ec7de5298b2b0beca82d787f376`. Последний отдельный GitHub Release Kit — **v1.5.1**. Текущий опубликованный клиент — **Project Web Pilot 0.6.95** с bundled Workflow Kit **1.5.5**. Рабочая среда — **Node 24.21.0**; минимальное требование пакета остаётся **Node 22+** (`engines.node: >=22`).

## Основная модель

Один Git checkout/worktree имеет один current plan:

```text
.harness/plans/todo-plan.md
```

Chat, WebPilot session и другой клиент не владеют plan. Новый chat продолжает current state checkout; независимая параллельная работа выполняется в отдельном Git worktree.

Legacy `by-id/by-session` сохраняются только как read-only history при upgrade. Старый `--session` временно поддерживается как compatibility/no-op, но не выбирает project state.

## Использование

Разработчик меняет Kit только в этом репозитории. Проекты получают installed runtime через installer в `.harness/kit`, а приложения подключают package как dependency. `getRuntimeRoot()` предоставляет self-contained runtime payload для staging в готовые приложения.

Project Web Pilot должен использовать checkout-scoped consumer contract: `currentPlanView(root)` для нового кода и временный `sessionPlanView(root, sessionId)` для чтения старых chat records без session ownership.

Подробный контракт: [Workflow Kit Package](modules/workflow-kit-package.md).

Команда plan:carryover закрывает scope переносом незавершённых задач в новый current plan; точная исходная копия остаётся в архиве. Контракт и проверки — docs/modules/workflow-kit-package.md.
