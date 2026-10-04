# Активный план — WorkflowKit

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 119,
  "project_id": "98dbae8d-f53b-4acc-af12-d094fe016cee",
  "project_name": "WorkflowKit",
  "scope_id": "kit-153-project-rename",
  "execution_scope_status": "ACTIVE",
  "delivery_status": "IN_PROGRESS",
  "objective": "Workflow Kit 1.5.3: штатное переименование проекта (project:rename) и обновление установок 1.5.2",
  "acceptance_criteria": [
    "Workflow Kit 1.5.3: штатное переименование проекта (project:rename) и обновление установок 1.5.2"
  ],
  "approved_scope": {
    "functional_paths": [
      "src/lib/actions.mjs",
      "src/cli.mjs",
      "src/lib/command-help.mjs",
      "src/lib/common.mjs",
      "src/lib/installer.mjs",
      "package.json",
      "scripts/check-package.mjs",
      "scripts/check-runtime-fixture.mjs",
      "scripts/check-consumer-contract.mjs"
    ],
    "documentation_paths": [
      "docs/planning/project-rename.md",
      "src/WORKFLOW.md",
      "docs/PRODUCT.md",
      "docs/architecture/ARCHITECTURE.md",
      "docs/architecture/OVERVIEW.md",
      "docs/MODULES.md",
      "docs/DOCUMENTATION_INDEX.md"
    ]
  },
  "baseline_commit": "c438148a6eea3532538eb122383f17887155b9d7",
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
        "path": "docs/planning/project-rename.md",
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
        "scope_id": "kit-153-project-rename",
        "task_id": "T001",
        "role": "implementation"
      },
      "dependencies": [],
      "functional_paths": [
        "src/lib/actions.mjs",
        "src/cli.mjs",
        "src/lib/command-help.mjs",
        "src/lib/common.mjs",
        "src/lib/installer.mjs",
        "package.json",
        "scripts/check-package.mjs",
        "scripts/check-runtime-fixture.mjs",
        "scripts/check-consumer-contract.mjs"
      ],
      "documentation_paths": [
        "docs/planning/project-rename.md",
        "src/WORKFLOW.md"
      ],
      "verification_ids": [
        "runtime-fixture",
        "package-check"
      ],
      "id": "T001",
      "title": "Команда project:rename и обновление 1.5.2 → 1.5.3",
      "why": "Команда project:rename и обновление 1.5.2 → 1.5.3",
      "verification_kind": "code",
      "acceptance_criteria": [
        "project:rename меняет project_name в plan и recovery и пути hooks в manifest одним коммитом",
        "Повтор без изменений не создаёт коммит; активная задача и недопустимое имя отклоняются без изменений",
        "Установка 1.5.2 обновляется до 1.5.3 с сохранением плана",
        "npm run check проходит с версией 1.5.3 и новым baseline"
      ],
      "expected_commit_message": "feat: Команда project:rename и обновление 1.5.2 → 1.5.3",
      "actual_files": [
        "package.json",
        "scripts/check-consumer-contract.mjs",
        "scripts/check-package.mjs",
        "scripts/check-runtime-fixture.mjs",
        "src/WORKFLOW.md",
        "src/cli.mjs",
        "src/lib/actions.mjs",
        "src/lib/command-help.mjs",
        "src/lib/common.mjs",
        "src/lib/installer.mjs"
      ]
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "kit-153-project-rename",
        "task_id": "DOCS",
        "role": "implementation"
      },
      "dependencies": [
        "T001"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/planning/project-rename.md",
        "docs/PRODUCT.md",
        "docs/architecture/ARCHITECTURE.md",
        "src/WORKFLOW.md",
        "docs/architecture/OVERVIEW.md",
        "docs/MODULES.md",
        "docs/DOCUMENTATION_INDEX.md"
      ],
      "verification_ids": [],
      "id": "DOCS",
      "title": "Актуализация всех документов проекта",
      "why": "Сохранить актуальный контекст для следующего агента",
      "acceptance_criteria": [
        "Документы соответствуют результату"
      ],
      "expected_commit_message": "docs: актуализировать контекст проекта"
    }
  ],
  "blocked_reason": null,
  "user_decisions": [
    {
      "id": "467659be-86d7-4de9-bb0e-bf3ef8ac8b7e",
      "text": "Пользователь поручил выполнить описанную задачу и план.",
      "recorded_at": "2026-10-04T08:53:34.570Z"
    }
  ]
}
```
<!-- workflow-state:end -->

## Состояние

Execution Scope Status: ACTIVE
Delivery Status: IN_PROGRESS
Scope: kit-153-project-rename
Current Task: нет
Revision: 119

## Цель

Workflow Kit 1.5.3: штатное переименование проекта (project:rename) и обновление установок 1.5.2

## Критерии приёмки

- Workflow Kit 1.5.3: штатное переименование проекта (project:rename) и обновление установок 1.5.2

## Микрозадачи

- [DONE] T001: Команда project:rename и обновление 1.5.2 → 1.5.3 — Завершено
  - Git Commit: [DONE] feat: Команда project:rename и обновление 1.5.2 → 1.5.3
  - Reference: kit-153-project-rename / T001 / implementation
  - Файлы: src/lib/actions.mjs, src/cli.mjs, src/lib/command-help.mjs, src/lib/common.mjs, src/lib/installer.mjs, package.json, scripts/check-package.mjs, scripts/check-runtime-fixture.mjs, scripts/check-consumer-contract.mjs, docs/planning/project-rename.md, src/WORKFLOW.md
- [TODO] DOCS: Актуализация всех документов проекта — Ожидает
  - Git Commit: [PENDING] docs: актуализировать контекст проекта
  - Reference: kit-153-project-rename / DOCS / implementation
  - Файлы: docs/planning/project-rename.md, docs/PRODUCT.md, docs/architecture/ARCHITECTURE.md, src/WORKFLOW.md, docs/architecture/OVERVIEW.md, docs/MODULES.md, docs/DOCUMENTATION_INDEX.md

## Context Pack For This Cycle

- docs/architecture/OVERVIEW.md → Краткая архитектура проекта
- docs/MODULES.md → Модули проекта
- docs/DOCUMENTATION_INDEX.md → Каталог документации
- docs/planning/project-rename.md

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
