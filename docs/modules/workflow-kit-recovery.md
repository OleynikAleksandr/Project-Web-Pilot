# Граница Workflow Kit ↔ Web Pilot: recovery

Workflow Kit строит recovery текущего checkout и отвечает за его полноту; Web Pilot вызывает Kit проекта, проверяет целостность пакета, держит его в памяти и доставляет ([доставка](context-delivery.md)). Здесь — только граница и то, что проверяет Web Pilot. Состав пакета, документы и ревизии, деление на части, пределы и коды Kit описаны в [контракте пакета Kit](../../packages/workflow-kit/docs/modules/workflow-kit-package.md).

## Код
- Web Pilot: `src/session-plans.mjs` (`SessionPlans.call`, `loadContext`), `src/mcp-runtime.mjs` (`validateContextPacket`, `CONTEXT_PROTOCOL`), `src/context-inputs.mjs` (`readinessContextKey`), `src/context-cache.mjs`, `src/context-session.mjs` (`packetMatchesProject`, `externalClientLine`), `src/workspace-session.mjs` (`readWorkspace`), `src/auto-plan-state.mjs` (следующая задача), `resources/workspace-setup-worker.mjs` (`inspectionInputs` → `inputKey`).
- Kit: `packages/workflow-kit/src/lib/recovery.mjs` (`contextPacket`, `TRANSPORT_HARD_BYTES = 180000`, `TRANSPORT_MAX_PARTS = 7`), `lib/inspection-inputs.mjs`, `src/WORKFLOW.md` (Workflow Core), `src/templates/PROTOTYPE.md`.

## Ответственность
- Kit: current plan, Git references, сборка и полнота recovery, деление на части, пределы размера, проверки документов, процессные правила (Workflow Core, PROTOTYPE, Kit-секция AGENTS). Пакет не назначает работу вместо пользователя.
- Web Pilot: вызов, проверка целостности и соответствия плану, кеш в памяти, доставка, read-only показ плана ([план](plan-view.md)). Пакет не меняет, не режет, не дополняет; в стартовое сообщение добавляет только транспортные строки и правила исполнителя.
- Исполнитель Codex App Server и его MCP к recovery отношения не имеют; Web Pilot Sidebar recovery не владеет.
- Один checkout/worktree — один `.harness/plans/todo-plan.md`; chat и Session ID план не выбирают. Parallel-план выдаёт подчинённые [назначения в worktree](../../packages/workflow-kit/docs/modules/parallel-assignments.md). Их recovery содержит одну задачу и доказанную базу; локальное DONE не закрывает общий план.

## Контракт вызова
- Используется Kit, установленный в проекте (`<workspace>/scripts/workflow.mjs` → `.harness/kit`), а не копия в приложении. Node и окружение (на Windows — с MinGit комплекта) выбирает WorkspaceSetup ([подготовка проекта](workspace-setup.md)).
- `SessionPlans.call`: `node <workspace>/scripts/workflow.mjs <command> …`, `cwd = workspace`, таймаут 120 с, буфер 4 MiB, `windowsHide`. Входной JSON, если нужен, — временный `.harness/runtime/session-plans/<uuid>.json` (0600, удаляется после вызова). Ответ — JSON в stdout (берётся и при ненулевом коде выхода); не JSON — `PLAN_COMMAND_FAILED`; `ok:false` — код Kit пробрасывается (`CONTEXT_TOO_LARGE`, `CONCURRENT_CHANGE`, `CONTEXT_SECTION` и др.). Web Pilot вызывает так только `recover`. Относительная папка — `WORKSPACE_REQUIRED`.
- `loadContext`: `recover --format packet`. Совместимость со старым Kit: при `SESSION_REQUIRED` из блока `workflow-state` в `todo-plan.md` берутся `owner_session_id` и `scope_id`, вызов повторяется с `--session <id> [--plan <scope_id>]`; нет `owner_session_id` — исходная ошибка; блок не читается — `WORKFLOW_PLAN_INVALID`. Текущий Kit принимает `--session` только как метаданные, `--plan` — только равный текущему scope.
- Внешним клиентам Web Pilot даёт строку с `recover --format text` ([доставка](context-delivery.md)); прямые клиенты находят ту же команду в Kit-секции AGENTS.md. Hooks/SessionStart Kit Web Pilot не использует.

## Что Web Pilot проверяет
- Пакет (`validateContextPacket`): `delivery_protocol = 'inline-context-v1'`, `ack_required = false`; свой `workspace`; `status = 'ready'`, `completeness = 'COMPLETE'`, непустые `context` и `signature`, `generated_at_ms`; ровно 8 `facts` (`project_id`, `project_name`, `plan_revision`, `scope_id`, `execution_scope_status`, `delivery_status`, `task_id`, `task_title`), без `probe_id`/`challenge`; `context` ≤ 180000 байт, точные `context_bytes`/`context_sha256`; `parts[]` с `index 1..N`, `total = N`, точными `bytes`/`sha256`, каждая ≤ `budget.document_bytes` (по умолчанию 28000), склейка через `\n\n` равна `context`. Коды: `MCP_UPDATE_REQUIRED`, `MCP_CONTEXT_MISMATCH`, `MCP_CONTEXT_INCOMPLETE`, `MCP_CONTEXT_TOO_LARGE`, `MCP_CONTEXT_DAMAGED` (префикс исторический).
- Соответствие плану: после сборки 8 facts сверяются с проекцией `todo-plan.md` (`task_id`/`task_title` — текущая или первая незавершённая задача), иначе `CONTEXT_CHANGED`. `session_id`/`plan_id` пакета не участвуют.
- ≤ 7 частей и ≤ min(`hard_bytes`, 180000) обеспечивает Kit (`CONTEXT_TOO_LARGE`, без усечения и частичного пакета); Web Pilot число частей не проверяет и дублирует только потолок 180000. Поля `sources[]`, `size` Web Pilot не использует.

## Свежесть
- Ключ кеша — `sha256({version:4, workspace, readiness: inputKey})`; `inputKey` считает worker WorkspaceSetup через `inspectionInputs` копии Kit в приложении (содержимое плана и конфигурации, README/AGENTS/OVERVIEW, документов `context_pack` и путей задач, runtime Kit, Git status/HEAD/index/refs/config/hooks, транзакция, состояние Review). Ошибка readiness или ключа запрещает сборку и отправку (`CONTEXT_INPUTS_UNAVAILABLE`), возраст не подменяет ключ.
- Kit сам сверяет входы до и после сборки (повтор, затем `CONCURRENT_CHANGE`); Web Pilot дополнительно сверяет ключ до и после `build` (2 попытки, затем `CONTEXT_CHANGED`) и перед вставкой (`CONTEXT_CHANGED_BEFORE_SEND`). Кеш не разрешает устаревшую отправку.
- Просмотр `sent`/legacy/`unknown` чата не запускает `recover`; пользовательский черновик сохраняется.

## Что Web Pilot читает из плана напрямую
`readWorkspace` только читает JSON-блок `<!-- workflow-state:begin -->` из `.harness/plans/todo-plan.md` (`schema_version 1`): идентичность проекта, facts, проекцию задач, `context_pack.documents` (входы наблюдения и название scope). Нет плана или `scripts/workflow.mjs` — `WORKFLOW_NOT_INSTALLED`; неверный формат — `WORKFLOW_PLAN_INVALID`. AutoPlan берёт поля следующей незавершённой задачи из того же блока при совпадении `plan_revision`/`scope_id`. План Web Pilot не пишет: изменения — только командами Kit агента или установщика.

## Проверки
- `unit-all`: `tests/session-plans.test.mjs` (все адреса чатов проецируют один план; legacy `--session` не маршрутизирует), `tests/mcp-runtime.test.mjs`, `tests/context-cache.test.mjs`, `tests/workflow-kit-recovery.test.mjs` (полнота, 7 частей проходят, 8-я — ошибка ниже байтового предела, splitter UTF-8, ревизии документов, NONE), `tests/workflow-kit-source.test.mjs` (запас 20 % recovery реального проекта, Kit — пакет этого репозитория).
- `kit-check` (`npm run check --prefix packages/workflow-kit`): контракт потребителя, runtime-fixture, `check-project-recovery-fixture.mjs` — реальный проект в изолированной копии до и после нормализации ≤ 144000 байт (запас ≥ 20 %) и ≤ 7 частей. Установленный Kit рабочего checkout он не заменяет.
- Доставка проверяется отдельно ([доставка](context-delivery.md)); живой ChatGPT и native Windows — приёмка пользователя.

Review добавляет в recovery краткую политику, стадию и следующую команду. Отзывы и runtime-снимки не включаются в required context; после очистки опубликованные документы остаются доступны. Полный контракт — [plan-review](plan-review.md).
