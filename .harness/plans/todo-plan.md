# Активный план — WorkflowKit

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 114,
  "project_id": "98dbae8d-f53b-4acc-af12-d094fe016cee",
  "project_name": "WorkflowKit",
  "scope_id": "pwp-t001-kit-152-cutover-20261003",
  "execution_scope_status": "ACTIVE",
  "delivery_status": "READY_FOR_ACCEPTANCE",
  "objective": "Поднять локальный Workflow Kit до 1.5.2 для доставки policy DOCS → delivery в installed recovery без release/publish.",
  "acceptance_criteria": [
    "Package version 1.5.2 поддерживает upgrade 1.5.1 → 1.5.2",
    "Runtime/package checks проходят",
    "После commit scope немедленно архивируется и current plan возвращается в NONE"
  ],
  "approved_scope": {
    "functional_paths": [
      "package.json",
      "src/lib/common.mjs",
      "src/lib/installer.mjs",
      "scripts/check-runtime-fixture.mjs",
      "scripts/check-package.mjs",
      "scripts/check-consumer-contract.mjs"
    ],
    "documentation_paths": [
      "README.md",
      "docs/architecture/OVERVIEW.md",
      "docs/modules/workflow-kit-package.md",
      "docs/planning/delivery-ordering-policy.md",
      "docs/MODULES.md",
      "docs/DOCUMENTATION_INDEX.md"
    ]
  },
  "baseline_commit": "fe3b27ee5d6c12bc6e0a7b4ee3a1e4a3f61de7aa",
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
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "pwp-t001-kit-152-cutover-20261003",
        "task_id": "T001",
        "role": "implementation"
      },
      "dependencies": [],
      "functional_paths": [
        "package.json",
        "src/lib/common.mjs",
        "src/lib/installer.mjs",
        "scripts/check-runtime-fixture.mjs",
        "scripts/check-package.mjs",
        "scripts/check-consumer-contract.mjs"
      ],
      "documentation_paths": [
        "README.md",
        "docs/architecture/OVERVIEW.md",
        "docs/modules/workflow-kit-package.md",
        "docs/planning/delivery-ordering-policy.md"
      ],
      "verification_ids": [
        "runtime-fixture",
        "package-check"
      ],
      "id": "T001",
      "title": "Подготовить локальный Workflow Kit 1.5.2 для self-host upgrade",
      "why": "Same-version installer не обновляет .harness/kit; новая recovery policy требует нового package version без публикации релиза.",
      "verification_kind": "code",
      "acceptance_criteria": [
        "VERSION и package.json = 1.5.2",
        "upgradeFrom включает 1.5.1",
        "runtime fixture и package check проходят"
      ],
      "expected_commit_message": "feat: prepare Workflow Kit 1.5.2 policy cutover",
      "actual_files": [
        "README.md",
        "docs/architecture/OVERVIEW.md",
        "docs/modules/workflow-kit-package.md",
        "docs/planning/delivery-ordering-policy.md",
        "package.json",
        "scripts/check-consumer-contract.mjs",
        "scripts/check-package.mjs",
        "scripts/check-runtime-fixture.mjs",
        "src/lib/common.mjs",
        "src/lib/installer.mjs"
      ]
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "pwp-t001-kit-152-cutover-20261003",
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
        "README.md",
        "docs/modules/workflow-kit-package.md",
        "docs/planning/delivery-ordering-policy.md"
      ],
      "acceptance_criteria": [
        "Все документы из индекса проверены; устаревшие сведения и ссылки исправлены; после этого результат готов только к пользовательской приёмке."
      ],
      "verification_ids": [],
      "expected_commit_message": "docs: актуализировать документацию проекта",
      "actual_files": []
    }
  ],
  "blocked_reason": null,
  "user_decisions": [
    {
      "id": "67bb38ff-4c87-429e-b1ed-5165091b1c6b",
      "text": "Прямое поручение пользователя: standalone plan WorkflowKit не оставлять; технический scope допустим только на время managed commit и должен быть сразу архивирован.",
      "recorded_at": "2026-10-03T16:29:50.418Z"
    }
  ]
}
```
<!-- workflow-state:end -->

## Состояние

Execution Scope Status: ACTIVE
Delivery Status: READY_FOR_ACCEPTANCE
Scope: pwp-t001-kit-152-cutover-20261003
Current Task: нет
Revision: 114

## Цель

Поднять локальный Workflow Kit до 1.5.2 для доставки policy DOCS → delivery в installed recovery без release/publish.

## Критерии приёмки

- Package version 1.5.2 поддерживает upgrade 1.5.1 → 1.5.2
- Runtime/package checks проходят
- После commit scope немедленно архивируется и current plan возвращается в NONE

## Микрозадачи

- [DONE] T001: Подготовить локальный Workflow Kit 1.5.2 для self-host upgrade — Завершено
  - Git Commit: [DONE] feat: prepare Workflow Kit 1.5.2 policy cutover
  - Reference: pwp-t001-kit-152-cutover-20261003 / T001 / implementation
  - Файлы: package.json, src/lib/common.mjs, src/lib/installer.mjs, scripts/check-runtime-fixture.mjs, scripts/check-package.mjs, scripts/check-consumer-contract.mjs, README.md, docs/architecture/OVERVIEW.md, docs/modules/workflow-kit-package.md, docs/planning/delivery-ordering-policy.md
- [DONE] DOCS: Актуализация всех документов проекта — Завершено
  - Git Commit: [DONE] docs: актуализировать документацию проекта
  - Reference: pwp-t001-kit-152-cutover-20261003 / DOCS / implementation
  - Файлы: docs/architecture/OVERVIEW.md, docs/MODULES.md, docs/DOCUMENTATION_INDEX.md, README.md, docs/modules/workflow-kit-package.md, docs/planning/delivery-ordering-policy.md

## Context Pack For This Cycle

- docs/architecture/OVERVIEW.md → Краткая архитектура проекта
- docs/MODULES.md → Модули проекта
- docs/DOCUMENTATION_INDEX.md → Каталог документации
- docs/planning/delivery-ordering-policy.md

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
