# Активный план — WorkflowKit

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 97,
  "project_id": "98dbae8d-f53b-4acc-af12-d094fe016cee",
  "project_name": "WorkflowKit",
  "scope_id": null,
  "execution_scope_status": "NONE",
  "delivery_status": "IN_PROGRESS",
  "objective": "Если поручение уже ясно, создайте короткий план и приступайте; иначе обсудите следующий этап проекта.",
  "acceptance_criteria": [],
  "approved_scope": {
    "functional_paths": [],
    "documentation_paths": []
  },
  "baseline_commit": null,
  "current_task_id": null,
  "context_pack": {
    "documents": [
      {
        "path": "docs/architecture/OVERVIEW.md",
        "heading_path": [
          "Краткая архитектура проекта"
        ],
        "required": true,
        "revision": "WORKTREE"
      },
      {
        "path": "docs/MODULES.md",
        "heading_path": [
          "Модули проекта"
        ],
        "required": true,
        "revision": "WORKTREE"
      },
      {
        "path": "docs/DOCUMENTATION_INDEX.md",
        "heading_path": [
          "Каталог документации"
        ],
        "required": true,
        "revision": "WORKTREE"
      }
    ],
    "include_last_completed_task": false,
    "dependency_task_ids": []
  },
  "tasks": [],
  "blocked_reason": null,
  "user_decisions": [
    {
      "id": "fe298832-99ed-410c-839f-47826f0f75e8",
      "text": "Прямое поручение пользователя: закрыть завершённый план и создать новый план для жёсткого порядка DOCS, сборки и публикации",
      "recorded_at": "2026-10-03T15:43:47.523Z"
    }
  ],
  "archived_scope_id": "release-1.5.0-docs-finalization-001"
}
```
<!-- workflow-state:end -->

## Состояние

Execution Scope Status: NONE
Delivery Status: IN_PROGRESS
Scope: не создан
Current Task: нет
Revision: 97

## Цель

Если поручение уже ясно, создайте короткий план и приступайте; иначе обсудите следующий этап проекта.

## Критерии приёмки


## Микрозадачи


## Context Pack For This Cycle

- docs/architecture/OVERVIEW.md → Краткая архитектура проекта
- docs/MODULES.md → Модули проекта
- docs/DOCUMENTATION_INDEX.md → Каталог документации

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
