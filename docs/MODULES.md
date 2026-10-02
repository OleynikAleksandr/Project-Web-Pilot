# Модули проекта

Связанные проекты (02.10.2026): **Workflow Kit** — планы и recovery; **Web Pilot Sidebar** — отдельно разрабатываемый браузерный интерфейс. [Рабочие каталоги и границы интеграции](SOURCE_WORKSPACES.md).

Текущий выпуск — 0.6.75: очистка кода, Node 24.21.0 / Electron 44.5.1; Workflow Kit 1.5.1. Состав модулей и поведение 0.6.74 сохранены, контракт Web Pilot Sidebar закреплён. Сборка/публикация T009 и последующая приёмка T010 разделены в [плане](planning/refactoring-node24.md).

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


## Связанные проекты

Workflow Kit — отдельный canonical пакет планов и recovery. Web Pilot Sidebar — отдельное расширение браузера из `/Users/oleksandroliinyk/VSCODE/Web Pilot Sidebar`, которое использует browser-адаптер Web Pilot. Владение данными и будущим Host API остаётся у Project Web Pilot; прототип Sidebar сейчас работает с тестовым хостом. [Реестр репозиториев](SOURCE_WORKSPACES.md), [публичный контракт Sidebar](modules/chatgpt-dom-compatibility.md).

## Действующие совместные контракты
- [Single active plan](modules/session-owned-plans.md): один current plan на checkout; sessions не владельцы плана.
- [Быстрое открытие](modules/session-opening-performance.md): быстрый показ и строгая before-Send готовность.
- [ChatGPT DOM](modules/chatgpt-dom-compatibility.md): общий adapter, composer, наблюдатель, фильтр, цвета и autoscroll.
- [Событийный рефакторинг](planning/event-driven-runtime.md): фазы 1–3 завершены; 0.6.74 включает файловые события/прогрев, общий page observer без общего 1500-мс функционального пульса, оформление без секундного safety-pass, сопоставимые измерения и live Chat/Work на macOS. Native Windows остаётся отдельной platform-проверкой.
- 0.6.74: [Автовыполнение](planning/auto-plan-continuation.md) сохраняет поведение 0.6.73: Workspace & Sessions владеет короткими ответами, точным «Продолжай», частично выполненным планом, остановкой/восстановлением. Workflow Kit обеспечивает фактический план и Git evidence.
- [Первый запуск](modules/first-run-onboarding.md), [Workspace Setup](WORKSPACE_SETUP.md): комплектные компоненты, MCP Permissions, подключение папок.
- [Исследование удалённого UI](research/remote-project-ui-options-2026-09-28.md): исследование, не функция продукта.
- [Session titles](planning/session-title-sync.md): событийная синхронизация и ручное переименование.

[Прежняя подробная карта](MODULES.history-20260929.md) сохранена целиком как история. Текущая поставка и доказательства — RELEASE.md и VERIFICATION.md.
