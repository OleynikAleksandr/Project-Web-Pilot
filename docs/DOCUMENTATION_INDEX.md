# Каталог документации

<!-- workflow-kit:begin -->
## Документы проекта

| Документ | Назначение |
| --- | --- |
| .harness/kit/WORKFLOW.md | Канонический протокол Workflow Kit |
| .harness/kit/templates/AGENTS.md | Шаблон управляемых инструкций нового проекта |
| .harness/kit/templates/ARCHITECTURE.md | Универсальный шаблон глобальной структуры проекта |
| .harness/kit/templates/PLAN.md | Шаблон собственного/подготовленного плана: project navigation, задачи и финальная DOCS |
| .harness/kit/templates/PRODUCT.md | Универсальный шаблон общего замысла проекта |
| .harness/kit/templates/START.md | Шаблон правил начала новой сессии |
| .harness/plans/todo-plan.md | Совместимый legacy-путь текущего проекта; принадлежность задана sessionId, новые планы — в .harness/plans/by-id/ |
| .harness/plans/todo-plan.template.md | Доступный агенту шаблон следующего рабочего scope |
| AGENTS.md | Управляемые инструкции Workflow Kit и границы Project Web Pilot |
| docs/PRODUCT.md | Действующий продуктовый контракт Project Web Pilot |
| docs/architecture/ARCHITECTURE.md | Подробная архитектура и история реализации Project Web Pilot |
| docs/WORKFLOW_START.md | Актуальный порядок начала и продолжения работы |
| docs/MODULES.md | Карта самостоятельных частей проекта и их владельцев |
| docs/architecture/OVERVIEW.md | Компактная общая структура проекта для каждого recovery |
| docs/DOCUMENTATION_INDEX.md | Полный пополняемый индекс действующей документации |
<!-- workflow-kit:end -->

## Project Web Pilot

| Документ | Назначение |
| --- | --- |
| README.md | Актуальный запуск, пользовательское поведение, ограничения и разработка |
| docs/DECISIONS.md | Решения пользователя и зафиксированные границы полномочий |
| docs/CONTEXT_DELIVERY.md | Канонический контракт recovery capsule и доставки контекста в ChatGPT |
| docs/modules/workflow-kit-recovery.md | Specification Workflow Kit / Context Recovery / project continuity |
| docs/modules/project-doctor.md | Контракт автономного Доктора проекта и границы автоматического ремонта |
| docs/modules/runtime-lifecycle.md | Specification self-healing MCP/tunnel lifecycle |
| docs/modules/workspace-sessions.md | Specification проектов, Chat/Work sessions, session tree, переходов после scope, оформления и сохранения геометрии интерфейса |
| docs/SOURCE_WORKSPACES.md | Исходные проекты, пути, версии и официальные ссылки |
| docs/VERIFICATION.md | Проверки, release evidence и границы пользовательской приёмки |
| docs/RELEASE.md | Постоянный macOS app, Finder-алиас, отдельный ZIP и обязательная проверка доставки |
| docs/CLEAN_INSTALL.md | Готовый стенд Clean/Test macOS/Windows, перенос первого запуска в следующий scope, диагностика задержек Computer Use/MCP и границы доказательств |
| docs/TRANSFER_TO_WINDOWS.md | Актуальная Windows x64 поставка и порядок физической проверки |
| docs/WORKSPACE_SETUP.md | Создание/подключение workspace и install/upgrade Workflow Kit |
| docs/PROJECT_ARCHIVE.md | Архив workspace, возврат и безопасное локальное удаление; веб-чаты сохраняются |

## Обязательная навигация проекта

Каждый канонический план сессии, включая состояние `NONE`, содержит required-ссылки на:
1. `docs/architecture/OVERVIEW.md` — что это за проект и как он устроен в целом;
2. `docs/MODULES.md` — из каких самостоятельных частей он состоит и где их спецификации;
3. `docs/DOCUMENTATION_INDEX.md` — какие документы существуют и что в них находится.

Для активного scope добавляются specification/planning documents затрагиваемых частей. Исторические документы и старые release sections не входят в recovery автоматически.

## Порядок чтения новой сессией

Новая сессия начинает с recovery capsule. При `NONE` capsule уже содержит Workflow Core и три обязательных навигационных документа и предлагает обсудить следующий этап проекта. При активном scope дополнительно передаются sessionId/planId, цель, текущая и оставшиеся задачи, релевантные specification/planning documents, рабочие изменения и только необходимые dependency diffs.

Большие исторические `PRODUCT`, `ARCHITECTURE`, `VERIFICATION`, `DECISIONS` и другие профильные документы читаются по этому индексу только когда нужны для конкретного этапа. Завершённые планы находятся в `.harness/plans/archive/` и являются историей, а не действующим контрактом.

## Поставляемое ядро Workspace Setup

| Документ | Назначение |
| --- | --- |
| resources/workflow-kit/WORKFLOW.md | Поставляемая копия протокола Workflow Kit |
| resources/workflow-kit/templates/AGENTS.md | Поставляемый шаблон AGENTS |
| resources/workflow-kit/templates/ARCHITECTURE.md | Поставляемый универсальный шаблон структуры проекта |
| resources/workflow-kit/templates/PLAN.md | Поставляемый шаблон ToDo-plan |
| resources/workflow-kit/templates/PRODUCT.md | Поставляемый универсальный шаблон общего замысла |
| resources/workflow-kit/templates/START.md | Поставляемый шаблон начала работы |

Установленный `.harness/kit` и `resources/workflow-kit` должны совпадать для файлов ядра; это проверяется автоматическим regression test.


## Действующий контракт — планы сессий

| Документ | Назначение |
| --- | --- |
| docs/modules/session-owned-plans.md | Реализованный в 0.6.28 контракт собственных планов сессий, подготовки продолжения, адресации и безопасной миграции |
| docs/design/session-plan-navigation.md | Принятый интерактивный пример сайдбара: «План следующей сессии», без + Задача и приёмки, существующий выбор Chat/Work для подготовленного плана, меню проекта для NONE |

## Действующий контракт — скорость открытия

| Документ | Назначение |
| --- | --- |
| docs/modules/session-opening-performance.md | Реализованный в 0.6.29 / Kit 1.4.1 быстрый показ собственного плана, фоновая готовность, строгая доставка и фактические source/packaged замеры |

## Действующий контракт — первый запуск

| Документ | Назначение |
| --- | --- |
| docs/modules/first-run-onboarding.md | Путь первого запуска 0.6.37, восстановление комплектного runtime, активация установщика Apple, ожидание и ошибки, прямой вход, подтверждённый результат 0.6.35 и ожидаемый T017; Base/клоны, границы facade и критерии полного результата |
