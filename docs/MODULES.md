# Модули проекта

Карта архитектурных владельцев функционала. Перед новым функциональным scope агент сначала находит владельца здесь. Если подходящего модуля нет, сначала создаётся и согласуется новая module specification.

| Модуль | Спецификация | Ответственность |
| --- | --- | --- |
| Workflow Kit / Context Recovery | `docs/modules/workflow-kit-recovery.md` | Текущий plan, recovery capsule, dependency context, continuity новой сессии/refresh/compact |
| Runtime Lifecycle | `docs/architecture/ARCHITECTURE.md` | Локальные MCP/tunnel, bootstrap и readiness; отдельная спецификация будет выделена перед T002 |
| Workspace & Sessions | `docs/WORKSPACE_SETUP.md`, `docs/architecture/ARCHITECTURE.md` | Подготовка workspace, связь проекта и ChatGPT-сессий |

Этот файл является маршрутизатором, а не полной архитектурой. Детали живут в спецификациях модулей.
