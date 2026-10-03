# Модули проекта

Связанные проекты (02.10.2026): **Workflow Kit** — планы и recovery; **Web Pilot Sidebar** — отдельно разрабатываемый браузерный интерфейс. [Рабочие каталоги и границы интеграции](SOURCE_WORKSPACES.md).

Текущая локальная macOS-версия — **0.6.80**: постоянная подпись UkrHD и проверка целостности установки/ZIP; MCP-захват сохранился после обновления и настоящей перезагрузки, пользователь подтвердил отсутствие новых запросов. Electron 44.5.1 / Node 24.21.0 / Workflow Kit 1.5.1 и функциональный AutoPlan из 0.6.78 сохранены. Последняя опубликованная парная поставка macOS/Windows — 0.6.78. [Контракт подписи](planning/macos-screen-permission-stability.md), [RELEASE](RELEASE.md), [VERIFICATION](VERIFICATION.md).

Карта самостоятельных частей проекта и их владельцев. Workflow Kit не ограничивает проект программным продуктом: здесь могут быть программные модули, исследовательские направления, зоны проектирования или другие устойчивые части предметной работы. Перед новым scope агент сначала находит затрагиваемую часть здесь; если владельца/спецификации нет, сначала создаётся и согласуется подходящий specification/planning document.

Для программных проектов модульная спецификация фиксирует границы, facade, входы/выходы и инварианты; взаимодействие между кластерами идёт через фасады, а внутренняя реализация дробится на узкие классы/микроклассы. Для непрограммных проектов применяется эквивалентная предметная декомпозиция без искусственной программной терминологии.

| Модуль / часть проекта | Спецификация | Ответственность |
| --- | --- | --- |
| Workflow Kit / Context Recovery | `docs/modules/workflow-kit-recovery.md` | Единственный current plan checkout/worktree, lifecycle scope, recovery capsule, dependency context, migration legacy session plans и continuity |
| Project Doctor | `docs/modules/project-doctor.md` | Автономная диагностика, резервная копия и безопасное исправление известных проблем открытия проекта |
| Runtime Lifecycle | `docs/modules/runtime-lifecycle.md` | MCP/tunnel discovery, bootstrap, process identity, persisted endpoints и self-healing startup |
| Codex App Server Local Executor | `docs/modules/codex-app-server-executor.md` | macOS local-only MCP facade поверх Codex App Server: паритет 47 локальных tools, Computer Use и альтернативный backend за единым stable connector |
| Workspace & Sessions | `docs/modules/workspace-sessions.md` | Проекты, Chat/Work sessions, session tree, experience routing, оформление и сохранение геометрии интерфейса |
| AutoPlan | `docs/planning/auto-plan-client-driven-refactor.md` | Клиентское событийное продолжение current plan, переключатель, идентичность паузы/checkpoint и приоритет пользовательского ввода |
| Release & Local Installation | `docs/RELEASE.md`; [план стабильного разрешения macOS](planning/macos-screen-permission-stability.md) | Постоянный macOS app, сохранение Finder-алиаса, отдельные ZIP и доставка релиза; стенд чистых ОС, точка передачи проверки установки и диагностика Computer Use/MCP — `docs/CLEAN_INSTALL.md` |

Этот файл является маршрутизатором. Общая архитектура находится в `docs/architecture/OVERVIEW.md`, полный перечень документов — в `docs/DOCUMENTATION_INDEX.md`, детали частей проекта — в их спецификациях.


## Связанные проекты

Workflow Kit — отдельный canonical пакет планов и recovery. Web Pilot Sidebar — отдельное расширение браузера из `/Users/oleksandroliinyk/VSCODE/Web Pilot Sidebar`, которое использует browser-адаптер Web Pilot. Владение данными и будущим Host API остаётся у Project Web Pilot; прототип Sidebar сейчас работает с тестовым хостом. [Реестр репозиториев](SOURCE_WORKSPACES.md), [публичный контракт Sidebar](modules/chatgpt-dom-compatibility.md).

## Действующие совместные контракты
- [Single active plan](modules/session-owned-plans.md): один current plan на checkout; sessions не владельцы плана.
- [Быстрое открытие](modules/session-opening-performance.md): быстрый показ и строгая before-Send готовность.
- [ChatGPT DOM](modules/chatgpt-dom-compatibility.md): общий adapter, composer, наблюдатель, фильтр, цвета и autoscroll.
- [Событийный рефакторинг](planning/event-driven-runtime.md): фазы 1–3 завершены; 0.6.74 включает файловые события/прогрев, общий page observer без общего 1500-мс функционального пульса, оформление без секундного safety-pass, сопоставимые измерения и live Chat/Work на macOS. Native Windows остаётся отдельной platform-проверкой.
- [Клиентский AutoPlan 0.6.78](planning/auto-plan-client-driven-refactor.md): любой момент ON/OFF, обычные ответы, один «Продолжай» на подходящую паузу, persistent choice/checkpoint, draft и ручной Send, recovery и предупреждение watchdog. Workflow Kit обеспечивает фактический plan и Git evidence; прежние документы 0.6.73–0.6.76 сохранены как история.
- [Первый запуск](modules/first-run-onboarding.md), [Workspace Setup](WORKSPACE_SETUP.md): комплектные компоненты, MCP Permissions, подключение папок.
- [Исследование удалённого UI](research/remote-project-ui-options-2026-09-28.md): исследование, не функция продукта.
- [Session titles](planning/session-title-sync.md): событийная синхронизация и ручное переименование.

[Прежняя подробная карта](MODULES.history-20260929.md) сохранена целиком как история. Текущая поставка и доказательства — RELEASE.md и VERIFICATION.md.
