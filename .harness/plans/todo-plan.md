# Активный план — Project Web Pilot

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 1003,
  "project_id": "cf944136-d1fc-4bd5-9ea0-e46d1fe230e7",
  "project_name": "Project Web Pilot",
  "scope_id": "input-instruction-delivery-ordering-20261003",
  "execution_scope_status": "ACTIVE",
  "delivery_status": "READY_FOR_ACCEPTANCE",
  "objective": "Сделать обязательный порядок DOCS → delivery частью canonical recovery WorkflowKit и startupMessage Project Web Pilot и исключить незапланированные сборки/публикации.",
  "acceptance_criteria": [
    "Сделать обязательный порядок DOCS → delivery частью canonical recovery WorkflowKit и startupMessage Project Web Pilot и исключить незапланированные сборки/публикации."
  ],
  "approved_scope": {
    "functional_paths": [
      "src/context-session.mjs",
      "tests/context-session.test.mjs",
      "tests/workflow-kit-recovery.test.mjs",
      "tests/workflow-kit-source.test.mjs",
      "scripts/check-workflow-kit-dependency.mjs"
    ],
    "documentation_paths": [
      "docs/planning/input-instruction-delivery-ordering.md",
      "docs/PRODUCT.md",
      "docs/architecture/ARCHITECTURE.md",
      "docs/architecture/OVERVIEW.md",
      "docs/MODULES.md",
      "docs/DOCUMENTATION_INDEX.md",
      "README.md",
      "docs/DECISIONS.md",
      "docs/SOURCE_WORKSPACES.md",
      "docs/VERIFICATION.md",
      "docs/WORKFLOW_START.md",
      "docs/modules/workflow-kit-recovery.md"
    ]
  },
  "baseline_commit": "0db9db525090e376ee5aaa1b87a14172e2810aa6",
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
        "path": "docs/planning/input-instruction-delivery-ordering.md",
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
        "scope_id": "input-instruction-delivery-ordering-20261003",
        "task_id": "T001",
        "role": "implementation"
      },
      "dependencies": [],
      "functional_paths": [],
      "documentation_paths": [
        "docs/planning/input-instruction-delivery-ordering.md"
      ],
      "verification_ids": [
        "workflowkit-policy"
      ],
      "id": "T001",
      "title": "Завершить canonical policy DOCS/build/publish в WorkflowKit",
      "why": "Завершить canonical policy DOCS/build/publish в WorkflowKit",
      "verification_kind": "code",
      "acceptance_criteria": [
        "WorkflowKit current plan остаётся NONE; отдельный active scope для этой работы не создаётся",
        "Canonical recovery запрещает build/package/sign/notarize/release/publish вне явно названной микрозадачи",
        "WorkflowKit размещает DOCS перед package/installed delivery-хвостом и сохраняет финальную DOCS для code-only планов",
        "plan:extend сохраняет порядок работа → DOCS → delivery и recovery показывает корректную следующую задачу",
        "Полный npm run check WorkflowKit проходит"
      ],
      "expected_commit_message": "feat: Завершить canonical policy DOCS/build/publish в WorkflowKit",
      "actual_files": [
        "docs/planning/input-instruction-delivery-ordering.md"
      ]
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "input-instruction-delivery-ordering-20261003",
        "task_id": "T002",
        "role": "implementation"
      },
      "dependencies": [
        "T001"
      ],
      "functional_paths": [
        "src/context-session.mjs",
        "tests/context-session.test.mjs"
      ],
      "documentation_paths": [
        "docs/planning/input-instruction-delivery-ordering.md"
      ],
      "verification_ids": [
        "startup-policy"
      ],
      "id": "T002",
      "title": "Добавить delivery-порядок в startupMessage Project Web Pilot",
      "why": "Добавить delivery-порядок в startupMessage Project Web Pilot",
      "verification_kind": "code",
      "acceptance_criteria": [
        "Новая сессия явно получает запрет незапланированной сборки и публикации",
        "startupMessage требует актуализировать документы до build и GitHub publish",
        "startupMessage не расходится с canonical policy WorkflowKit"
      ],
      "expected_commit_message": "feat: Добавить delivery-порядок в startupMessage Project Web Pilot",
      "actual_files": [
        "src/context-session.mjs",
        "tests/context-session.test.mjs"
      ]
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "input-instruction-delivery-ordering-20261003",
        "task_id": "T003",
        "role": "implementation"
      },
      "dependencies": [
        "T002"
      ],
      "functional_paths": [
        "tests/workflow-kit-recovery.test.mjs",
        "tests/workflow-kit-source.test.mjs",
        "tests/context-session.test.mjs",
        "scripts/check-workflow-kit-dependency.mjs"
      ],
      "documentation_paths": [
        "docs/planning/input-instruction-delivery-ordering.md"
      ],
      "verification_ids": [
        "integration-policy"
      ],
      "id": "T003",
      "title": "Проверить интеграцию canonical recovery и startupMessage",
      "why": "Проверить интеграцию canonical recovery и startupMessage",
      "verification_kind": "code",
      "acceptance_criteria": [
        "Web Pilot regression tests подтверждают новые правила во внешней инструкции и recovery",
        "Интеграция использует canonical WorkflowKit, а не отдельную копию правил",
        "В этом scope не выполняются build/package/release/publish Project Web Pilot"
      ],
      "expected_commit_message": "feat: Проверить интеграцию canonical recovery и startupMessage",
      "actual_files": [
        "docs/planning/input-instruction-delivery-ordering.md",
        "scripts/check-workflow-kit-dependency.mjs",
        "tests/workflow-kit-recovery.test.mjs",
        "tests/workflow-kit-source.test.mjs"
      ]
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "input-instruction-delivery-ordering-20261003",
        "task_id": "DOCS",
        "role": "implementation"
      },
      "dependencies": [
        "T001",
        "T002",
        "T003"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/planning/input-instruction-delivery-ordering.md",
        "docs/PRODUCT.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/architecture/OVERVIEW.md",
        "docs/MODULES.md",
        "docs/DOCUMENTATION_INDEX.md",
        "README.md",
        "docs/DECISIONS.md",
        "docs/SOURCE_WORKSPACES.md",
        "docs/VERIFICATION.md",
        "docs/WORKFLOW_START.md",
        "docs/modules/workflow-kit-recovery.md"
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
        "docs/DECISIONS.md",
        "docs/DOCUMENTATION_INDEX.md",
        "docs/MODULES.md",
        "docs/PRODUCT.md",
        "docs/SOURCE_WORKSPACES.md",
        "docs/VERIFICATION.md",
        "docs/WORKFLOW_START.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/architecture/OVERVIEW.md",
        "docs/modules/workflow-kit-recovery.md"
      ]
    }
  ],
  "blocked_reason": null,
  "user_decisions": [
    {
      "id": "3f707dc3-6b89-429a-a547-b19c004acfca",
      "text": "Пользователь поручил выполнить описанную задачу и план.",
      "recorded_at": "2026-10-03T15:49:05.324Z"
    }
  ]
}
```
<!-- workflow-state:end -->

## Состояние

Execution Scope Status: ACTIVE
Delivery Status: READY_FOR_ACCEPTANCE
Scope: input-instruction-delivery-ordering-20261003
Current Task: нет
Revision: 1003

## Цель

Сделать обязательный порядок DOCS → delivery частью canonical recovery WorkflowKit и startupMessage Project Web Pilot и исключить незапланированные сборки/публикации.

## Критерии приёмки

- Сделать обязательный порядок DOCS → delivery частью canonical recovery WorkflowKit и startupMessage Project Web Pilot и исключить незапланированные сборки/публикации.

## Микрозадачи

- [DONE] T001: Завершить canonical policy DOCS/build/publish в WorkflowKit — Завершено
  - Git Commit: [DONE] feat: Завершить canonical policy DOCS/build/publish в WorkflowKit
  - Reference: input-instruction-delivery-ordering-20261003 / T001 / implementation
  - Файлы: docs/planning/input-instruction-delivery-ordering.md
- [DONE] T002: Добавить delivery-порядок в startupMessage Project Web Pilot — Завершено
  - Git Commit: [DONE] feat: Добавить delivery-порядок в startupMessage Project Web Pilot
  - Reference: input-instruction-delivery-ordering-20261003 / T002 / implementation
  - Файлы: src/context-session.mjs, tests/context-session.test.mjs, docs/planning/input-instruction-delivery-ordering.md
- [DONE] T003: Проверить интеграцию canonical recovery и startupMessage — Завершено
  - Git Commit: [DONE] feat: Проверить интеграцию canonical recovery и startupMessage
  - Reference: input-instruction-delivery-ordering-20261003 / T003 / implementation
  - Файлы: tests/workflow-kit-recovery.test.mjs, tests/workflow-kit-source.test.mjs, tests/context-session.test.mjs, scripts/check-workflow-kit-dependency.mjs, docs/planning/input-instruction-delivery-ordering.md
- [DONE] DOCS: Актуализация всех документов проекта — Завершено
  - Git Commit: [DONE] docs: актуализировать контекст проекта
  - Reference: input-instruction-delivery-ordering-20261003 / DOCS / implementation
  - Файлы: docs/planning/input-instruction-delivery-ordering.md, docs/PRODUCT.md, docs/architecture/ARCHITECTURE.md, docs/architecture/OVERVIEW.md, docs/MODULES.md, docs/DOCUMENTATION_INDEX.md, README.md, docs/DECISIONS.md, docs/SOURCE_WORKSPACES.md, docs/VERIFICATION.md, docs/WORKFLOW_START.md, docs/modules/workflow-kit-recovery.md

## Context Pack For This Cycle

- docs/architecture/OVERVIEW.md → Краткая архитектура проекта
- docs/MODULES.md → Модули проекта
- docs/DOCUMENTATION_INDEX.md → Каталог документации
- docs/planning/input-instruction-delivery-ordering.md

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
