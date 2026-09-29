# Модули проекта

Карта самостоятельных частей проекта и их владельцев. Workflow Kit не ограничивает проект программным продуктом: здесь могут быть программные модули, исследовательские направления, зоны проектирования или другие устойчивые части предметной работы. Перед новым scope агент сначала находит затрагиваемую часть здесь; если владельца/спецификации нет, сначала создаётся и согласуется подходящий specification/planning document.

Для программных проектов модульная спецификация фиксирует границы, facade, входы/выходы и инварианты; взаимодействие между кластерами идёт через фасады, а внутренняя реализация дробится на узкие классы/микроклассы. Для непрограммных проектов применяется эквивалентная предметная декомпозиция без искусственной программной терминологии.

| Модуль / часть проекта | Спецификация | Ответственность |
| --- | --- | --- |
| Workflow Kit / Context Recovery | `docs/modules/workflow-kit-recovery.md` | Единственный current plan checkout/worktree, lifecycle scope, recovery capsule, dependency context, migration legacy session plans и continuity |
| Project Doctor | `docs/modules/project-doctor.md` | Автономная диагностика, резервная копия и безопасное исправление известных проблем открытия проекта |
| Runtime Lifecycle | `docs/modules/runtime-lifecycle.md` | MCP/tunnel discovery, bootstrap, process identity, persisted endpoints и self-healing startup |
| Codex App Server Local Executor | `docs/modules/codex-app-server-executor.md` | macOS local-only MCP facade поверх Codex App Server: паритет 47 локальных tools, Computer Use и альтернативный backend за единым stable connector |
| Workspace & Sessions | `docs/modules/workspace-sessions.md` | Проекты, Chat/Work sessions, session tree, experience routing, оформление и сохранение геометрии интерфейса |
| Release & Local Installation | `docs/RELEASE.md` | Постоянный macOS app, сохранение Finder-алиаса, отдельные ZIP и доставка релиза; стенд чистых ОС, точка передачи проверки установки и диагностика Computer Use/MCP — `docs/CLEAN_INSTALL.md` |

Этот файл является маршрутизатором. Общая архитектура находится в `docs/architecture/OVERVIEW.md`, полный перечень документов — в `docs/DOCUMENTATION_INDEX.md`, детали частей проекта — в их спецификациях.


## Действующие совместные контракты
- [Single active plan](modules/session-owned-plans.md): один current plan на checkout; sessions не владельцы плана.
- [Быстрое открытие](modules/session-opening-performance.md): быстрый показ и строгая before-Send готовность.
- [ChatGPT DOM](modules/chatgpt-dom-compatibility.md): общий adapter, composer, наблюдатель, фильтр, цвета и autoscroll.
- [Событийный рефакторинг](planning/event-driven-runtime.md): фаза 1 выпущена, T001 фазы 2 завершена; T002/T003 остаются.
- 0.6.73: [Автовыполнение](planning/auto-plan-continuation.md): Workspace & Sessions владеет короткими ответами, точным «Продолжай», частично выполненным планом, остановкой/восстановлением. Workflow Kit обеспечивает фактический план и Git evidence.
- [Первый запуск](modules/first-run-onboarding.md), [Workspace Setup](WORKSPACE_SETUP.md): комплектные компоненты, MCP Permissions, подключение папок.
- [Исследование удалённого UI](research/remote-project-ui-options-2026-09-28.md): исследование, не функция продукта.
- [Session titles](planning/session-title-sync.md): событийная синхронизация и ручное переименование.

[Прежняя подробная карта](MODULES.history-20260929.md) сохранена целиком как история. Текущая поставка и доказательства — RELEASE.md и VERIFICATION.md.
