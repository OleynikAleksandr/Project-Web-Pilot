# Project Web Pilot — Single Active Plan Adaptation

Связанные проекты (02.10.2026): **Workflow Kit** — планы и recovery; **Web Pilot Sidebar** — отдельно разрабатываемый браузерный интерфейс. [Рабочие каталоги и границы интеграции](../SOURCE_WORKSPACES.md).

Дата: 2026-09-27  
Workspace: `/Users/oleksandroliinyk/VSCODE/Project Web Pilot`  
Источник требований: `/Users/oleksandroliinyk/Desktop/Project_Web_Pilot_Single_Active_Plan_Adaptation_Planning.md`

## Цель

Перевести Project Web Pilot с модели «chat session владеет plan» на модель:

> один Git checkout/worktree = один current Workflow Kit plan.

Project Web Pilot после миграции управляет chat sessions и их URL/историей, а состояние проекта берёт только из текущего checkout. Любая старая или новая session одного workspace проецирует один и тот же `.harness/plans/todo-plan.md`.

## Зафиксированные решения

- Session ID остаётся identity чата и не выбирает plan.
- Старые `planId`, `originSessionId`, `legacyPlanId`, `planBinding` читаются backward-compatible, но не участвуют в runtime routing.
- Старые chat URL/title/Chat|Work/dates/history не переписываются и не удаляются.
- Новая session получает recovery текущего plan и не создаёт отдельный Workflow Kit plan.
- `plan:prepare`, `plan:bind` и adoption ownership удаляются из обычного Web Pilot flow.
- Context delivery через настоящий ChatGPT composer остаётся без архитектурной замены.
- Context cache адресуется workspace/current-checkout state, а не session-owned plan.
- Workspace Setup и Doctor проверяют current plan; historical plans не являются readiness dependency.
- Исторические plan directories могут оставаться как migration/history data, но не блокируют обычное открытие проекта.
- Релиз на этой фазе не собирается. После готовности нового canonical Workflow Kit отдельно выполняется contract sync и парный macOS/Windows release.

## Совместимость во время параллельной разработки Workflow Kit

Web Pilot разрабатывается до финальной версии нового Kit. Поэтому consumer path должен быть мягким:

1. Предпочитать новый current-plan контракт: recover/status без session selector.
2. При текущем старом Kit допускается ограниченный fallback только для локальной разработки/совместимости.
3. После подключения нового Kit fallback не должен влиять на plan selection.
4. Не дублировать semantic migration Workflow Kit внутри Web Pilot.

## ToDo Plan

### T015 — Зафиксировать consumer contract и границы миграции
- Создать этот planning document.
- Зафиксировать runtime/session/history/readiness границы.
- Не менять Workflow Kit workspace из Project Web Pilot.

### T016 — Перевести project/session projection на один current plan
- `readWorkspace(workspace, sessionId)` читает один `todo-plan.md` независимо от sessionId.
- Session A и Session B сохраняют разные URL/title, но получают одинаковый scope/revision/tasks.
- Prepared/unassigned projection исчезает из runtime.
- Legacy plan metadata остаётся persisted, но не обновляет plan routing.

### T017 — Отвязать recovery и cache от session-owned selector
- Context cache имеет один address на workspace/current checkout.
- Input key не перечисляет historical session plan directories.
- Runtime сначала вызывает current recover без `--session`.
- Packet validation проверяет current project/plan facts, а session echo не является authorization boundary.
- Startup message больше не инструктирует агента, что plan принадлежит session и что нужен `plan:prepare`.

### T018 — Удалить prepared-plan/adoption lifecycle из приложения и UI
- Удалить runtime adoption/reconcile и bind prepared plans.
- Удалить IPC/preload/sidebar controls для prepared-plan choice.
- Удалить origin/prepared UI.
- Новая session создаётся обычным `newSession` и получает тот же current plan.
- Существующие session records не мигрируются разрушительно.

### T019 — Сделать Workspace Setup и Doctor current-plan-only
- Readiness не запускает full recovery всех historical plans.
- Historical oversized/corrupt plan не блокирует current workspace.
- Ошибка recovery относится к current plan и показывается один раз.
- Doctor сохраняет historical данные, но не делает их runtime completeness dependency.

### T020 — Закрепить переход регрессиями
Обязательный сценарий:
- открыть старую Session A → сохранить её URL → получить current plan P;
- открыть старую Session B → сохранить другой URL → получить тот же P;
- создать Session C → новый ChatGPT conversation → recovery того же P;
- ни один chat не создаёт отдельный Workflow Kit plan.

Дополнительно:
- legacy metadata не влияет на selection;
- context cache общий для current checkout;
- Node suite и Electron smoke проходят;
- release/build не запускается.

### DOCS — Актуализировать действующую документацию
- Удалить действующую session-owned semantics из основных контрактов.
- Исторические разделы оставить как историю, явно пометив заменёнными.
- Зафиксировать, что финальный release выполняется только после синхронизации с новым canonical Workflow Kit.
