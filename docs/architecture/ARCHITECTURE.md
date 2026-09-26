# Архитектура / структура проекта

Выбран подход «один canonical package — несколько потребителей».

```text
WorkflowKit/src
      │
      ├── package imports ──> WebPilot
      ├── package imports ──> будущий ChatGPT MCP App adapter
      │
      └── installer ────────> <project>/.harness/kit
```

`src/` содержит canonical 35-файловый runtime source Workflow Kit 1.4.12. Root `index.mjs` предоставляет package API и `getRuntimeRoot()`; package `bin` предоставляет CLI `workflow`.

Installed `.harness/kit` и staged Electron resources — физические производные копии, но не source of truth. Они должны получаться автоматически из package и проверяться по версии/fileset.

Никакой отдельный daemon, registry, database или механизм синхронизации кода для этой архитектуры не нужен. Детали и consumer contract: [docs/modules/workflow-kit-package.md](../modules/workflow-kit-package.md).
