# Активный план — WorkflowKit

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 104,
  "project_id": "98dbae8d-f53b-4acc-af12-d094fe016cee",
  "project_name": "WorkflowKit",
  "scope_id": "pwp-t001-crossrepo-commit-20261003",
  "execution_scope_status": "ACTIVE",
  "delivery_status": "IN_PROGRESS",
  "objective": "Зафиксировать изменения Workflow Kit, управляемые активной T001 плана Project Web Pilot, без постоянного active plan в WorkflowKit.",
  "acceptance_criteria": [
    "Policy DOCS → delivery и plan:extend regression зафиксированы",
    "npm run check и runtime fixture проходят",
    "После фиксации current plan WorkflowKit возвращён в NONE"
  ],
  "approved_scope": {
    "functional_paths": [
      "src/lib/actions.mjs",
      "scripts/check-runtime-fixture.mjs",
      "scripts/check-package.mjs",
      "scripts/check-consumer-contract.mjs"
    ],
    "documentation_paths": [
      "docs/planning/delivery-ordering-policy.md",
      "docs/architecture/OVERVIEW.md",
      "docs/MODULES.md",
      "docs/DOCUMENTATION_INDEX.md"
    ]
  },
  "baseline_commit": "35e2c5a283a043808ac9142862c5ecb6d9d8a4f0",
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
        "path": "docs/planning/delivery-ordering-policy.md",
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
        "scope_id": "pwp-t001-crossrepo-commit-20261003",
        "task_id": "T001",
        "role": "implementation"
      },
      "dependencies": [],
      "functional_paths": [
        "src/lib/actions.mjs",
        "scripts/check-runtime-fixture.mjs",
        "scripts/check-package.mjs",
        "scripts/check-consumer-contract.mjs"
      ],
      "documentation_paths": [
        "docs/planning/delivery-ordering-policy.md"
      ],
      "verification_ids": [
        "runtime-fixture",
        "package-check"
      ],
      "id": "T001",
      "title": "Зафиксировать policy и regression Workflow Kit",
      "why": "Фиксация cross-repository части PWP-T001 через обязательный managed commit Workflow Kit",
      "verification_kind": "code",
      "acceptance_criteria": [
        "plan:extend сохраняет DOCS перед delivery и переоткрывает DOCS для correction",
        "runtime fixture и package check проходят"
      ],
      "expected_commit_message": "feat: complete delivery ordering policy under Web Pilot plan"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "pwp-t001-crossrepo-commit-20261003",
        "task_id": "DOCS",
        "role": "implementation"
      },
      "id": "DOCS",
      "title": "Актуализация всех документов проекта",
      "why": "Проверить весь действующий комплект документации по docs/DOCUMENTATION_INDEX.md и обновить только устаревшие сведения после выполнения scope.",
      "dependencies": [
        "T001"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/architecture/OVERVIEW.md",
        "docs/MODULES.md",
        "docs/DOCUMENTATION_INDEX.md",
        "docs/planning/delivery-ordering-policy.md"
      ],
      "acceptance_criteria": [
        "Все документы из индекса проверены; устаревшие сведения и ссылки исправлены; после этого результат готов только к пользовательской приёмке."
      ],
      "verification_ids": [],
      "expected_commit_message": "docs: актуализировать документацию проекта"
    }
  ],
  "blocked_reason": null,
  "user_decisions": [
    {
      "id": "c104dc3d-8262-4ff4-ab14-8fdef125a853",
      "text": "Прямое поручение пользователя: удалить standalone plan WorkflowKit; работа управляется current plan Project Web Pilot, временный технический scope закрыть сразу после фиксации.",
      "recorded_at": "2026-10-03T16:24:55.340Z"
    }
  ]
}
```
<!-- workflow-state:end -->

## Состояние

Execution Scope Status: ACTIVE
Delivery Status: IN_PROGRESS
Scope: pwp-t001-crossrepo-commit-20261003
Current Task: нет
Revision: 104

## Цель

Зафиксировать изменения Workflow Kit, управляемые активной T001 плана Project Web Pilot, без постоянного active plan в WorkflowKit.

## Критерии приёмки

- Policy DOCS → delivery и plan:extend regression зафиксированы
- npm run check и runtime fixture проходят
- После фиксации current plan WorkflowKit возвращён в NONE

## Микрозадачи

- [TODO] T001: Зафиксировать policy и regression Workflow Kit — Ожидает
  - Git Commit: [PENDING] feat: complete delivery ordering policy under Web Pilot plan
  - Reference: pwp-t001-crossrepo-commit-20261003 / T001 / implementation
  - Файлы: src/lib/actions.mjs, scripts/check-runtime-fixture.mjs, scripts/check-package.mjs, scripts/check-consumer-contract.mjs, docs/planning/delivery-ordering-policy.md
- [TODO] DOCS: Актуализация всех документов проекта — Ожидает
  - Git Commit: [PENDING] docs: актуализировать документацию проекта
  - Reference: pwp-t001-crossrepo-commit-20261003 / DOCS / implementation
  - Файлы: docs/architecture/OVERVIEW.md, docs/MODULES.md, docs/DOCUMENTATION_INDEX.md, docs/planning/delivery-ordering-policy.md

## Context Pack For This Cycle

- docs/architecture/OVERVIEW.md → Краткая архитектура проекта
- docs/MODULES.md → Модули проекта
- docs/DOCUMENTATION_INDEX.md → Каталог документации
- docs/planning/delivery-ordering-policy.md

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
