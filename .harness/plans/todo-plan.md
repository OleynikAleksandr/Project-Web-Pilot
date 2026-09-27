# Активный план — WorkflowKit

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 2,
  "project_id": "98dbae8d-f53b-4acc-af12-d094fe016cee",
  "project_name": "WorkflowKit",
  "scope_id": "release-1.5.0-docs-finalization-001",
  "execution_scope_status": "ACTIVE",
  "delivery_status": "IN_PROGRESS",
  "objective": "Зафиксировать актуальные release-документы Workflow Kit 1.5.0 после self-host cutover.",
  "acceptance_criteria": [
    "Release-документы отражают фактический single-active contract 1.5.0 и завершённый self-host cutover."
  ],
  "approved_scope": {
    "functional_paths": [],
    "documentation_paths": [
      "docs/DOCUMENTATION_INDEX.md",
      "docs/modules/workflow-kit-package.md",
      "docs/planning/single-active-plan-migration.md",
      "docs/architecture/OVERVIEW.md",
      "docs/MODULES.md"
    ]
  },
  "baseline_commit": "62fa4f5ef06d6f9e6541c3a7b280adf5a631aee1",
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
      },
      {
        "path": "docs/planning/single-active-plan-migration.md",
        "required": true
      }
    ],
    "include_last_completed_task": false,
    "dependency_task_ids": []
  },
  "tasks": [
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "release-1.5.0-docs-finalization-001",
        "task_id": "DOCS",
        "role": "implementation"
      },
      "dependencies": [],
      "functional_paths": [],
      "documentation_paths": [
        "docs/DOCUMENTATION_INDEX.md",
        "docs/modules/workflow-kit-package.md",
        "docs/planning/single-active-plan-migration.md",
        "docs/architecture/OVERVIEW.md",
        "docs/MODULES.md"
      ],
      "verification_ids": [],
      "id": "DOCS",
      "title": "Актуализация всех документов проекта",
      "why": "Зафиксировать поздние release-уточнения после self-host cutover.",
      "acceptance_criteria": [
        "Release docs согласованы с Workflow Kit 1.5.0 и self-host cutover."
      ],
      "expected_commit_message": "docs: завершить release-документацию 1.5.0"
    }
  ],
  "blocked_reason": null,
  "user_decisions": [
    {
      "id": "d17028dc-2475-4374-acaf-19a1238c7a01",
      "text": "Пользователь поручил выполнить весь план и собрать новый релиз Workflow Kit 1.5.0; фиксируем поздние документационные уточнения после self-host cutover.",
      "recorded_at": "2026-09-27T14:40:41.598Z"
    }
  ]
}
```
<!-- workflow-state:end -->

## Состояние

Execution Scope Status: ACTIVE
Delivery Status: IN_PROGRESS
Scope: release-1.5.0-docs-finalization-001
Current Task: нет
Revision: 2

## Цель

Зафиксировать актуальные release-документы Workflow Kit 1.5.0 после self-host cutover.

## Критерии приёмки

- Release-документы отражают фактический single-active contract 1.5.0 и завершённый self-host cutover.

## Микрозадачи

- [TODO] DOCS: Актуализация всех документов проекта — Ожидает
  - Git Commit: [PENDING] docs: завершить release-документацию 1.5.0
  - Reference: release-1.5.0-docs-finalization-001 / DOCS / implementation
  - Файлы: docs/DOCUMENTATION_INDEX.md, docs/modules/workflow-kit-package.md, docs/planning/single-active-plan-migration.md, docs/architecture/OVERVIEW.md, docs/MODULES.md

## Context Pack For This Cycle

- docs/architecture/OVERVIEW.md → Краткая архитектура проекта
- docs/MODULES.md → Модули проекта
- docs/DOCUMENTATION_INDEX.md → Каталог документации
- docs/planning/single-active-plan-migration.md

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
