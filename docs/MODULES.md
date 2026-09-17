# Модули проекта

Карта самостоятельных частей проекта и их владельцев. Workflow Kit не ограничивает проект программным продуктом: здесь могут быть программные модули, исследовательские направления, зоны проектирования или другие устойчивые части предметной работы. Перед новым scope агент сначала находит затрагиваемую часть здесь; если владельца/спецификации нет, сначала создаётся и согласуется подходящий specification/planning document.

Для программных проектов модульная спецификация фиксирует границы, facade, входы/выходы и инварианты; взаимодействие между кластерами идёт через фасады, а внутренняя реализация дробится на узкие классы/микроклассы. Для непрограммных проектов применяется эквивалентная предметная декомпозиция без искусственной программной терминологии.

| Модуль / часть проекта | Спецификация | Ответственность |
| --- | --- | --- |
| Workflow Kit / Context Recovery | `docs/modules/workflow-kit-recovery.md` | Текущий ToDo-plan, lifecycle scope, recovery capsule, dependency context и continuity между сессиями |
| Project Doctor | `docs/modules/project-doctor.md` | Автономная диагностика, резервная копия и безопасное исправление известных проблем открытия проекта |
| Runtime Lifecycle | `docs/modules/runtime-lifecycle.md` | MCP/tunnel discovery, bootstrap, process identity, persisted endpoints и self-healing startup |
| Workspace & Sessions | `docs/modules/workspace-sessions.md` | Проекты, Chat/Work sessions, session tree, first-session choice, ChatGPT experience routing и локальный редактор цветов чата |
| Release & Local Installation | `docs/RELEASE.md` | Постоянный macOS app, сохранение Finder-алиаса, отдельные ZIP и доставка релиза; стенд чистых ОС, точка передачи проверки установки и диагностика Computer Use/MCP — `docs/CLEAN_INSTALL.md` |

Этот файл является маршрутизатором. Общая архитектура находится в `docs/architecture/OVERVIEW.md`, полный перечень документов — в `docs/DOCUMENTATION_INDEX.md`, детали частей проекта — в их спецификациях.


## Следующий согласованный этап: планы сессий

Scope `session-owned-plans-028` совместно затрагивает Workflow Kit / Context Recovery и Workspace & Sessions. Согласованный целевой контракт — [Планы сессий и подготовка продолжения](modules/session-owned-plans.md), принятый пример — [Сайдбар планов](design/session-plan-navigation.md). Это подготовленная реализация для следующей сессии; действующее приложение пока использует прежнюю глобальную модель. Нового параллельного менеджера задач не создавать.
