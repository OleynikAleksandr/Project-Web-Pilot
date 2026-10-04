# Активный план — WorkflowKit

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 136,
  "project_id": "98dbae8d-f53b-4acc-af12-d094fe016cee",
  "project_name": "WorkflowKit",
  "scope_id": "kit-extend-after-delivery-note-20261004",
  "execution_scope_status": "ACTIVE",
  "delivery_status": "READY_FOR_ACCEPTANCE",
  "objective": "Записать известное ограничение: plan:extend невозможен в плане с завершённым delivery-хвостом.",
  "acceptance_criteria": [
    "Ограничение и обходной путь описаны в политике delivery-ordering"
  ],
  "approved_scope": {
    "functional_paths": [
      "src/lib/recovery.mjs",
      "src/lib/command-help.mjs",
      "src/lib/common.mjs",
      "package.json",
      "scripts/check-package.mjs",
      "scripts/check-runtime-fixture.mjs",
      "src/lib/installer.mjs",
      "scripts/check-consumer-contract.mjs"
    ],
    "documentation_paths": [
      "docs/planning/delivery-ordering-policy.md",
      "docs/PRODUCT.md",
      "docs/architecture/ARCHITECTURE.md",
      "docs/architecture/OVERVIEW.md",
      "docs/MODULES.md",
      "docs/DOCUMENTATION_INDEX.md",
      "src/templates/AGENTS.md",
      "src/templates/START.md",
      "src/templates/STAGES.md",
      "docs/planning/compact-recovery.md",
      "README.md",
      "src/templates/PLAN.md",
      "docs/WORKFLOW_START.md",
      "docs/modules/workflow-kit-package.md"
    ]
  },
  "baseline_commit": "18691d25d7f4943b0b1a8d5dce86081037c39208",
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
        "scope_id": "kit-extend-after-delivery-note-20261004",
        "task_id": "T001",
        "role": "implementation"
      },
      "dependencies": [],
      "functional_paths": [],
      "documentation_paths": [
        "docs/planning/delivery-ordering-policy.md"
      ],
      "verification_ids": [
        "package-check"
      ],
      "id": "T001",
      "title": "Записать ограничение plan:extend после завершённого delivery",
      "why": "В Project Web Pilot plan:extend после выпуска 0.6.83 упал с DEPENDENCY_ORDER.",
      "verification_kind": "code",
      "acceptance_criteria": [
        "В политике есть раздел «Известные ограничения» с причиной, симптомом и обходным путём"
      ],
      "expected_commit_message": "feat: Записать ограничение plan:extend после завершённого delivery",
      "actual_files": [
        "docs/planning/delivery-ordering-policy.md"
      ]
    },
    {
      "id": "K1",
      "title": "Компактный recovery: формы и карты по запросу; Workflow Kit 1.5.4",
      "why": "Пакет Project Web Pilot ~100 КБ не помещается в показ ChatGPT; формы и карты на старте не нужны.",
      "dependencies": [],
      "functional_paths": [
        "src/lib/recovery.mjs",
        "src/lib/command-help.mjs",
        "src/lib/common.mjs",
        "package.json",
        "scripts/check-package.mjs",
        "scripts/check-runtime-fixture.mjs",
        "src/lib/installer.mjs",
        "scripts/check-consumer-contract.mjs"
      ],
      "documentation_paths": [
        "src/templates/AGENTS.md",
        "src/templates/START.md",
        "src/templates/STAGES.md",
        "docs/planning/compact-recovery.md",
        "src/templates/PLAN.md"
      ],
      "verification_ids": [
        "package-check",
        "runtime-fixture"
      ],
      "verification_kind": "code",
      "acceptance_criteria": [
        "Recovery без форм PLAN/SPEC/CONTINUE/STAGES и без содержимого MODULES/DOCUMENTATION_INDEX вне DOCS",
        "Блок «ФОРМЫ И КАРТЫ ПО ЗАПРОСУ» с командами справки и путями",
        "task:start --help печатает STAGES",
        "Версия 1.5.4, новый baseline"
      ],
      "expected_commit_message": "feat: Компактный recovery: формы и карты по запросу; Workflow Kit 1.5.4",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "kit-extend-after-delivery-note-20261004",
        "task_id": "K1",
        "role": "implementation"
      },
      "actual_files": [
        "src/lib/recovery.mjs",
        "src/lib/command-help.mjs",
        "src/lib/common.mjs",
        "src/lib/installer.mjs",
        "src/templates/AGENTS.md",
        "src/templates/START.md",
        "src/templates/STAGES.md",
        "src/templates/PLAN.md",
        "package.json",
        "scripts/check-package.mjs",
        "scripts/check-runtime-fixture.mjs",
        "scripts/check-consumer-contract.mjs",
        "docs/planning/compact-recovery.md"
      ]
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "kit-extend-after-delivery-note-20261004",
        "task_id": "DOCS",
        "role": "implementation",
        "iteration": 2
      },
      "dependencies": [
        "T001",
        "K1"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/planning/delivery-ordering-policy.md",
        "docs/PRODUCT.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/architecture/OVERVIEW.md",
        "docs/MODULES.md",
        "docs/DOCUMENTATION_INDEX.md",
        "src/templates/AGENTS.md",
        "src/templates/START.md",
        "src/templates/STAGES.md",
        "docs/planning/compact-recovery.md",
        "README.md",
        "src/templates/PLAN.md",
        "docs/WORKFLOW_START.md",
        "docs/modules/workflow-kit-package.md"
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
        "docs/WORKFLOW_START.md",
        "docs/architecture/OVERVIEW.md",
        "docs/modules/workflow-kit-package.md"
      ]
    },
    {
      "id": "K2",
      "title": "Синхронизировать WorkflowKit main с GitHub",
      "why": "Project Web Pilot 0.6.87 встраивает Workflow Kit 1.5.4; исходники Kit на GitHub должны совпадать.",
      "dependencies": [
        "DOCS"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "README.md"
      ],
      "verification_ids": [
        "github-main"
      ],
      "verification_kind": "package",
      "acceptance_criteria": [
        "origin/main совпадает с локальным HEAD после DOCS"
      ],
      "expected_commit_message": "feat: Синхронизировать WorkflowKit main с GitHub",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "kit-extend-after-delivery-note-20261004",
        "task_id": "K2",
        "role": "implementation"
      },
      "actual_files": []
    }
  ],
  "blocked_reason": null,
  "user_decisions": [
    {
      "id": "be862b78-70d5-41c1-87f4-48c85431f015",
      "text": "Поручение пользователя 04.10.2026: записать ограничение Workflow Kit в его открытые вопросы.",
      "recorded_at": "2026-10-04T10:14:32.189Z"
    }
  ]
}
```
<!-- workflow-state:end -->

## Состояние

Execution Scope Status: ACTIVE
Delivery Status: READY_FOR_ACCEPTANCE
Scope: kit-extend-after-delivery-note-20261004
Current Task: нет
Revision: 136

## Цель

Записать известное ограничение: plan:extend невозможен в плане с завершённым delivery-хвостом.

## Критерии приёмки

- Ограничение и обходной путь описаны в политике delivery-ordering

## Микрозадачи

- [DONE] T001: Записать ограничение plan:extend после завершённого delivery — Завершено
  - Git Commit: [DONE] feat: Записать ограничение plan:extend после завершённого delivery
  - Reference: kit-extend-after-delivery-note-20261004 / T001 / implementation
  - Файлы: docs/planning/delivery-ordering-policy.md
- [DONE] K1: Компактный recovery: формы и карты по запросу; Workflow Kit 1.5.4 — Завершено
  - Git Commit: [DONE] feat: Компактный recovery: формы и карты по запросу; Workflow Kit 1.5.4
  - Reference: kit-extend-after-delivery-note-20261004 / K1 / implementation
  - Файлы: src/lib/recovery.mjs, src/lib/command-help.mjs, src/lib/common.mjs, package.json, scripts/check-package.mjs, scripts/check-runtime-fixture.mjs, src/lib/installer.mjs, scripts/check-consumer-contract.mjs, src/templates/AGENTS.md, src/templates/START.md, src/templates/STAGES.md, docs/planning/compact-recovery.md, src/templates/PLAN.md
- [DONE] DOCS: Актуализация всех документов проекта — Завершено
  - Git Commit: [DONE] docs: актуализировать контекст проекта
  - Reference: kit-extend-after-delivery-note-20261004 / DOCS / implementation
  - Файлы: docs/planning/delivery-ordering-policy.md, docs/PRODUCT.md, docs/architecture/ARCHITECTURE.md, docs/architecture/OVERVIEW.md, docs/MODULES.md, docs/DOCUMENTATION_INDEX.md, src/templates/AGENTS.md, src/templates/START.md, src/templates/STAGES.md, docs/planning/compact-recovery.md, README.md, src/templates/PLAN.md, docs/WORKFLOW_START.md, docs/modules/workflow-kit-package.md
- [DONE] K2: Синхронизировать WorkflowKit main с GitHub — Завершено
  - Git Commit: [DONE] feat: Синхронизировать WorkflowKit main с GitHub
  - Reference: kit-extend-after-delivery-note-20261004 / K2 / implementation
  - Файлы: README.md

## Context Pack For This Cycle

- docs/architecture/OVERVIEW.md → Краткая архитектура проекта
- docs/MODULES.md → Модули проекта
- docs/DOCUMENTATION_INDEX.md → Каталог документации
- docs/planning/delivery-ordering-policy.md

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
