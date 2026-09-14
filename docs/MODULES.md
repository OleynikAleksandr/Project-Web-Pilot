# Модули проекта

Карта архитектурных владельцев функционала. Перед новым функциональным scope агент сначала находит владельца здесь. Если подходящего модуля нет, сначала создаётся и согласуется новая module specification.

| Модуль | Спецификация | Ответственность |
| --- | --- | --- |
| Workflow Kit / Context Recovery | `docs/modules/workflow-kit-recovery.md` | Текущий plan, recovery capsule, dependency context, continuity новой сессии/refresh/compact |
| Runtime Lifecycle | `docs/modules/runtime-lifecycle.md` | MCP/tunnel discovery, bootstrap, process identity, persisted endpoints и self-healing startup |
| Workspace & Sessions | `docs/modules/workspace-sessions.md` | Проекты, Chat/Work sessions, session tree, first-session choice и ChatGPT experience routing |

Этот файл является маршрутизатором, а не полной архитектурой. Детали живут в спецификациях модулей.
