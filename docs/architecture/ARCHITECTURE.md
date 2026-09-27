# Архитектура / структура проекта

Выбран подход «один canonical package — несколько потребителей» и «один checkout/worktree — один current plan».

```text
WorkflowKit/src
      │
      ├── package imports ──> Project Web Pilot
      ├── package imports ──> другие доверенные клиенты
      │
      └── installer ────────> <project>/.harness/kit

<git checkout/worktree>
      │
      └── .harness/plans/todo-plan.md   # единственный runtime current plan
```

`src/` содержит canonical 35-файловый runtime source Workflow Kit **1.5.0**. Root `index.mjs` предоставляет package API, `currentPlanView/sessionPlanView` и `getRuntimeRoot()`; package `bin` предоставляет CLI `workflow`.

Installed `.harness/kit` и staged Electron resources — физические производные копии, но не source of truth. Они создаются автоматически из package и проверяются по версии/fileset.

Legacy `.harness/plans/by-id` и `.harness/plans/by-session` не являются runtime stores. Upgrade сохраняет их в `.harness/plans/archive/legacy-session-plans/`; history не участвует в normal readiness/recovery.

Session ID остаётся только метаданными consumer-а. Для независимого параллельного state используется отдельный Git branch/worktree, а не скрытый router или global registry.

Никакой отдельный daemon, database или synchronization service этой архитектуре не нужен. Детали: [Workflow Kit Package](../modules/workflow-kit-package.md).
