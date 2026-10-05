# Активный план — WorkflowKit

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 146,
  "project_id": "98dbae8d-f53b-4acc-af12-d094fe016cee",
  "project_name": "WorkflowKit",
  "scope_id": "push-after-docs-1.5.5-20261004",
  "execution_scope_status": "ACTIVE",
  "delivery_status": "IN_PROGRESS",
  "objective": "Push на GitHub только после DOCS текущего плана: pre-push hook Workflow Kit 1.5.5.",
  "acceptance_criteria": [
    "Push до завершения DOCS текущего плана отклоняется, после DOCS проходит",
    "Workflow Kit 1.5.5 опубликован на GitHub"
  ],
  "approved_scope": {
    "functional_paths": [
      "src/lib/git-hooks.mjs",
      "src/lib/common.mjs",
      "src/lib/installer.mjs",
      "package.json",
      "scripts/check-runtime-fixture.mjs",
      "scripts/check-package.mjs",
      "scripts/check-consumer-contract.mjs"
    ],
    "documentation_paths": [
      "docs/planning/push-after-docs.md",
      "src/templates/PLAN.md",
      "src/templates/PROTOTYPE.md",
      "docs/PRODUCT.md",
      "docs/architecture/ARCHITECTURE.md",
      "docs/architecture/OVERVIEW.md",
      "docs/MODULES.md",
      "docs/DOCUMENTATION_INDEX.md",
      "README.md",
      "docs/modules/workflow-kit-package.md",
      "docs/planning/delivery-ordering-policy.md"
    ]
  },
  "baseline_commit": "1ba1f955c0c6aca75356557dc93cb6519e9736a1",
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
        "path": "docs/planning/push-after-docs.md",
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
        "scope_id": "push-after-docs-1.5.5-20261004",
        "task_id": "T001",
        "role": "implementation"
      },
      "dependencies": [],
      "functional_paths": [
        "src/lib/git-hooks.mjs",
        "src/lib/common.mjs",
        "src/lib/installer.mjs",
        "package.json",
        "scripts/check-runtime-fixture.mjs",
        "scripts/check-package.mjs",
        "scripts/check-consumer-contract.mjs"
      ],
      "documentation_paths": [
        "docs/planning/push-after-docs.md",
        "src/templates/PLAN.md",
        "src/templates/PROTOTYPE.md"
      ],
      "verification_ids": [
        "runtime-fixture",
        "package-check"
      ],
      "id": "T001",
      "title": "Kit 1.5.5: push только после DOCS",
      "why": "Публикация исходников обычной задачей могла уйти на GitHub до актуализации документов.",
      "verification_kind": "code",
      "acceptance_criteria": [
        "pre-push отклоняет push при незавершённой DOCS текущего плана (DOCS_BEFORE_PUSH) и пропускает после DOCS и без плана",
        "Форма плана и правила прототипа называют публикацию исходников delivery-задачей после DOCS",
        "Версия 1.5.5, upgrade-path 1.5.4 → 1.5.5, baselines обновлены"
      ],
      "expected_commit_message": "feat: Kit 1.5.5: push только после DOCS",
      "actual_files": [
        "package.json",
        "scripts/check-consumer-contract.mjs",
        "scripts/check-package.mjs",
        "scripts/check-runtime-fixture.mjs",
        "src/lib/common.mjs",
        "src/lib/git-hooks.mjs",
        "src/lib/installer.mjs",
        "src/templates/PLAN.md",
        "src/templates/PROTOTYPE.md"
      ]
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "push-after-docs-1.5.5-20261004",
        "task_id": "DOCS",
        "role": "implementation"
      },
      "dependencies": [
        "T001"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/planning/push-after-docs.md",
        "docs/PRODUCT.md",
        "docs/architecture/ARCHITECTURE.md",
        "src/templates/PLAN.md",
        "src/templates/PROTOTYPE.md",
        "docs/architecture/OVERVIEW.md",
        "docs/MODULES.md",
        "docs/DOCUMENTATION_INDEX.md",
        "README.md",
        "docs/modules/workflow-kit-package.md",
        "docs/planning/delivery-ordering-policy.md"
      ],
      "verification_ids": [],
      "id": "DOCS",
      "title": "Актуализация всех документов проекта",
      "why": "Сохранить актуальный контекст для следующего агента",
      "acceptance_criteria": [
        "Документы соответствуют результату"
      ],
      "expected_commit_message": "docs: актуализировать контекст проекта",
      "actual_files": [
        "README.md",
        "docs/DOCUMENTATION_INDEX.md",
        "docs/MODULES.md",
        "docs/architecture/OVERVIEW.md",
        "docs/modules/workflow-kit-package.md",
        "docs/planning/delivery-ordering-policy.md"
      ]
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "push-after-docs-1.5.5-20261004",
        "task_id": "T002",
        "role": "implementation"
      },
      "dependencies": [
        "DOCS"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/planning/push-after-docs.md"
      ],
      "verification_ids": [
        "github-main"
      ],
      "id": "T002",
      "title": "Опубликовать Workflow Kit 1.5.5 на GitHub",
      "why": "Web Pilot 0.6.89 собирается с Kit 1.5.5 из этого репозитория; main должен совпадать с GitHub.",
      "verification_kind": "package",
      "acceptance_criteria": [
        "origin/main совпадает с локальным HEAD; push прошёл через новый pre-push после DOCS"
      ],
      "expected_commit_message": "feat: Опубликовать Workflow Kit 1.5.5 на GitHub",
      "actual_files": []
    },
    {
      "id": "T003",
      "title": "Синхронизировать документы WorkflowKit с Web Pilot 0.6.94 и опубликовать main",
      "why": "Пять current-state документов WorkflowKit устарели; синхронизация должна быть документальной и попасть в origin/main без изменения release/tag или runtime Kit.",
      "dependencies": [
        "DOCS",
        "T002"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "README.md",
        "docs/PRODUCT.md",
        "docs/architecture/OVERVIEW.md",
        "docs/modules/workflow-kit-package.md",
        "docs/DOCUMENTATION_INDEX.md"
      ],
      "verification_ids": [
        "package-check",
        "github-main"
      ],
      "verification_kind": "package",
      "acceptance_criteria": [
        "Пять документов называют текущим опубликованным клиентом Project Web Pilot 0.6.94 с bundled Workflow Kit 1.5.5",
        "Canonical source/runtime указан как Workflow Kit 1.5.5, 35 файлов, SHA-256 8eadd98869a840f670dbfb00c33350e3054d8ec7de5298b2b0beca82d787f376",
        "Последний отдельный GitHub Release WorkflowKit остаётся фактическим v1.5.1",
        "Код, package version и canonical runtime Workflow Kit 1.5.5 не изменены",
        "После managed commit origin/main синхронизирован с новым HEAD"
      ],
      "expected_commit_message": "docs: синхронизировать WorkflowKit с Web Pilot 0.6.94",
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "push-after-docs-1.5.5-20261004",
        "task_id": "T003",
        "role": "implementation"
      }
    }
  ],
  "blocked_reason": null,
  "user_decisions": [
    {
      "id": "51cabc45-3569-4eca-985b-cfb0e866575c",
      "text": "Поручение пользователя 04.10.2026: закрыть лазейку публикации исходников до DOCS и выпустить релиз.",
      "recorded_at": "2026-10-04T16:41:50.529Z"
    }
  ]
}
```
<!-- workflow-state:end -->

## Состояние

Execution Scope Status: ACTIVE
Delivery Status: IN_PROGRESS
Scope: push-after-docs-1.5.5-20261004
Current Task: нет
Revision: 146

## Цель

Push на GitHub только после DOCS текущего плана: pre-push hook Workflow Kit 1.5.5.

## Критерии приёмки

- Push до завершения DOCS текущего плана отклоняется, после DOCS проходит
- Workflow Kit 1.5.5 опубликован на GitHub

## Микрозадачи

- [DONE] T001: Kit 1.5.5: push только после DOCS — Завершено
  - Git Commit: [DONE] feat: Kit 1.5.5: push только после DOCS
  - Reference: push-after-docs-1.5.5-20261004 / T001 / implementation
  - Файлы: src/lib/git-hooks.mjs, src/lib/common.mjs, src/lib/installer.mjs, package.json, scripts/check-runtime-fixture.mjs, scripts/check-package.mjs, scripts/check-consumer-contract.mjs, docs/planning/push-after-docs.md, src/templates/PLAN.md, src/templates/PROTOTYPE.md
- [DONE] DOCS: Актуализация всех документов проекта — Завершено
  - Git Commit: [DONE] docs: актуализировать контекст проекта
  - Reference: push-after-docs-1.5.5-20261004 / DOCS / implementation
  - Файлы: docs/planning/push-after-docs.md, docs/PRODUCT.md, docs/architecture/ARCHITECTURE.md, src/templates/PLAN.md, src/templates/PROTOTYPE.md, docs/architecture/OVERVIEW.md, docs/MODULES.md, docs/DOCUMENTATION_INDEX.md, README.md, docs/modules/workflow-kit-package.md, docs/planning/delivery-ordering-policy.md
- [DONE] T002: Опубликовать Workflow Kit 1.5.5 на GitHub — Завершено
  - Git Commit: [DONE] feat: Опубликовать Workflow Kit 1.5.5 на GitHub
  - Reference: push-after-docs-1.5.5-20261004 / T002 / implementation
  - Файлы: docs/planning/push-after-docs.md
- [TODO] T003: Синхронизировать документы WorkflowKit с Web Pilot 0.6.94 и опубликовать main — Ожидает
  - Git Commit: [PENDING] docs: синхронизировать WorkflowKit с Web Pilot 0.6.94
  - Reference: push-after-docs-1.5.5-20261004 / T003 / implementation
  - Файлы: README.md, docs/PRODUCT.md, docs/architecture/OVERVIEW.md, docs/modules/workflow-kit-package.md, docs/DOCUMENTATION_INDEX.md

## Context Pack For This Cycle

- docs/architecture/OVERVIEW.md → Краткая архитектура проекта
- docs/MODULES.md → Модули проекта
- docs/DOCUMENTATION_INDEX.md → Каталог документации
- docs/planning/push-after-docs.md

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
