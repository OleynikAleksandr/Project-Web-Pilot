# Начало работы

Project Web Pilot использует Workflow Kit 1.3.0 и Recovery Capsule v2. Обычная новая сессия, ручное «Обновить контекст» и будущий подтверждённый compact получают execution capsule текущего состояния; повторно читать историю проекта «на всякий случай» не требуется.

Workflow Kit предназначен для проектов любого типа: программных, исследовательских, проектных, творческих и прикладных. `NONE` означает только отсутствие согласованного рабочего scope, а не новый или забытый проект.

## Что уже находится в capsule

Всегда передаются:
- компактный Workflow Core;
- project/workspace/HEAD/scope/current task;
- цель, критерии и progress единственного todo-plan;
- `docs/architecture/OVERVIEW.md` — компактная общая структура проекта;
- `docs/MODULES.md` — карта самостоятельных частей проекта;
- `docs/DOCUMENTATION_INDEX.md` — полный пополняемый индекс документации;
- релевантная verification evidence и next action.

Для активного scope добавляются релевантные specification/planning documents, изменения текущей task и только необходимые dependency diffs. Для финальной задачи `DOCS` зависимости от всех предыдущих задач задают порядок выполнения, но их commit diff автоматически в recovery не копируются.

Optional/reference documents не копируются в payload. Большой `.harness/kit/WORKFLOW.md` и исторические `PRODUCT.md`, `ARCHITECTURE.md`, `VERIFICATION.md`, `DECISIONS.md` читаются по необходимости через `docs/DOCUMENTATION_INDEX.md`.

## Новый запрос пользователя

1. При `NONE` обсудить с пользователем следующий этап существующего проекта на основании OVERVIEW, MODULES и DOCUMENTATION_INDEX.
2. Найти затрагиваемую часть проекта в `docs/MODULES.md`; если её нет — сначала создать и согласовать подходящий specification/planning document.
3. Для программного модуля согласовать facade, входы/выходы, границы и инварианты; внутреннюю реализацию дробить на узкие классы/микроклассы. Для непрограммного проекта использовать естественную предметную декомпозицию.
4. Только после согласования создать или расширить todo-plan через Workflow Kit.
5. Перед изменением начать task; каждую микрозадачу завершать управляемым commit с применимыми checks.
6. Последняя задача каждого рабочего plan — `DOCS`, «Актуализация всех документов проекта». После её commit результат только предъявляется пользователю на приёмку.
7. Архивирование выполняется лишь по отдельной прямой команде пользователя. После archive текущий plan возвращается в `NONE`, сохраняет постоянную навигацию проекта и предлагает обсудить следующий этап; новый рабочий scope автоматически не создаётся.

## Текущий Project Web Pilot

Единый macOS/Windows source of truth — `https://github.com/OleynikAleksandr/Project-Web-Pilot`. Mac является основной средой разработки; Windows используется для native validation после pull. Platform runtime/build/userData не синхронизируются через Git.

В приложении слева работает локальный workspace/project UI, справа — настоящий ChatGPT Web в изолированном Chromium. Локальные действия агента идут через MCP/tunnel; модельные API приложением не используются. Компактная карта — `docs/architecture/OVERVIEW.md`, карта частей — `docs/MODULES.md`.

Текущая версия приложения — **0.6.20**, Workflow Kit — **1.3.0**. Сохранены дерево Chat/Work-сессий, переход в новую сессию после принятого и архивированного scope, автопрокрутка разговора, self-healing runtime и единый macOS/Windows source. В 0.6.19 добавлен project continuity: `NONE` больше не создаёт пустой контекст, каждый новый рабочий scope автоматически получает обязательную финальную актуализацию документации, а пользовательская приёмка остаётся отдельным gate. Исторические проверки и релизы — в `docs/VERIFICATION.md`.

## Служебные команды

```bash
./scripts/workflow status
./scripts/workflow recover --format text
./scripts/workflow validate
./scripts/workflow doctor
```

В Windows PowerShell/CMD используется `./scripts/workflow.cmd`. Полный `.harness/kit/WORKFLOW.md` открывать только для точной семантики команд, repair/install/upgrade и редких аварийных сценариев.

Runtime Lifecycle реализован по `docs/modules/runtime-lifecycle.md`: приложение автоматически переиспользует/устанавливает runtime, восстанавливает stale PID и принимает динамические loopback endpoints; ручной выбор runtime остаётся аварийным override.

## Доктор проекта 0.6.20

Доктор доступен в Settings и при ошибке подготовки. Его контракт — `docs/modules/project-doctor.md`. По прямому поручению пользователя текущий stale manifest реального проекта сохранён для самостоятельного теста. Не исправлять его при восстановлении контекста, чтении документов или запуске приложения. Сборки: `.harness/runtime/releases/0.6.20/`.
