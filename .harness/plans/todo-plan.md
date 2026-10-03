# Активный план — WorkflowKit

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 98,
  "project_id": "98dbae8d-f53b-4acc-af12-d094fe016cee",
  "project_name": "WorkflowKit",
  "scope_id": "delivery-ordering-policy-20261003",
  "execution_scope_status": "ACTIVE",
  "delivery_status": "IN_PROGRESS",
  "objective": "Зафиксировать и проверить строгий порядок DOCS → delivery и запретить любые незапланированные сборки/публикации в Workflow Kit recovery и планах.",
  "acceptance_criteria": [
    "Зафиксировать и проверить строгий порядок DOCS → delivery и запретить любые незапланированные сборки/публикации в Workflow Kit recovery и планах."
  ],
  "approved_scope": {
    "functional_paths": [
      "src/lib/simple-workflow.mjs",
      "src/lib/actions.mjs",
      "src/lib/plan.mjs",
      "src/lib/extend-plan.mjs",
      "src/lib/recovery.mjs",
      "src/lib/task-files.mjs",
      "scripts/check-runtime-fixture.mjs",
      "scripts/check-package.mjs"
    ],
    "documentation_paths": [
      "docs/planning/delivery-ordering-policy.md",
      "src/templates/PROTOTYPE.md",
      "src/templates/PLAN.md",
      "src/templates/STAGES.md",
      "src/WORKFLOW.md",
      "docs/PRODUCT.md",
      "docs/architecture/ARCHITECTURE.md",
      "docs/architecture/OVERVIEW.md",
      "docs/MODULES.md",
      "docs/DOCUMENTATION_INDEX.md"
    ]
  },
  "baseline_commit": "44585c94ce4494bf21b9dc95896c7878f13cd31e",
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
        "scope_id": "delivery-ordering-policy-20261003",
        "task_id": "T001",
        "role": "implementation"
      },
      "dependencies": [],
      "functional_paths": [],
      "documentation_paths": [
        "docs/planning/delivery-ordering-policy.md",
        "src/templates/PROTOTYPE.md",
        "src/templates/PLAN.md",
        "src/templates/STAGES.md",
        "src/WORKFLOW.md"
      ],
      "verification_ids": [
        "runtime-fixture"
      ],
      "id": "T001",
      "title": "Зафиксировать канонические правила DOCS, build и publish во входных инструкциях",
      "why": "Зафиксировать канонические правила DOCS, build и publish во входных инструкциях",
      "verification_kind": "code",
      "acceptance_criteria": [
        "Recovery явно запрещает build/package/sign/notarize/release/publish вне активной микрозадачи, где действие названо",
        "Инструкция требует актуализировать и зафиксировать документы до build и GitHub publish",
        "Инструкция требует явный delivery-хвост и не разрешает скрытую сборку в code/test/DOCS-задаче"
      ],
      "expected_commit_message": "feat: Зафиксировать канонические правила DOCS, build и publish во входных инструкциях"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "delivery-ordering-policy-20261003",
        "task_id": "T002",
        "role": "implementation"
      },
      "dependencies": [
        "T001"
      ],
      "functional_paths": [
        "src/lib/simple-workflow.mjs",
        "src/lib/actions.mjs",
        "src/lib/plan.mjs"
      ],
      "documentation_paths": [
        "docs/planning/delivery-ordering-policy.md"
      ],
      "verification_ids": [
        "runtime-fixture"
      ],
      "id": "T002",
      "title": "Перенести системную DOCS перед delivery-хвостом плана",
      "why": "Перенести системную DOCS перед delivery-хвостом плана",
      "verification_kind": "code",
      "acceptance_criteria": [
        "Code-only план по-прежнему заканчивается DOCS",
        "При наличии package/installed задач DOCS располагается перед первым delivery-task",
        "Delivery-задачи идут после DOCS и остаются последними пользовательскими задачами",
        "Решение использует существующий verification_kind без эвристики по title"
      ],
      "expected_commit_message": "feat: Перенести системную DOCS перед delivery-хвостом плана"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "delivery-ordering-policy-20261003",
        "task_id": "T003",
        "role": "implementation"
      },
      "dependencies": [
        "T002"
      ],
      "functional_paths": [
        "src/lib/extend-plan.mjs",
        "src/lib/actions.mjs",
        "src/lib/recovery.mjs",
        "src/lib/task-files.mjs"
      ],
      "documentation_paths": [
        "docs/planning/delivery-ordering-policy.md"
      ],
      "verification_ids": [
        "runtime-fixture"
      ],
      "id": "T003",
      "title": "Сохранить новый порядок при plan:extend и повторном открытии scope",
      "why": "Сохранить новый порядок при plan:extend и повторном открытии scope",
      "verification_kind": "code",
      "acceptance_criteria": [
        "plan:extend не возвращает DOCS после delivery-хвоста",
        "Добавление correction-задач переоткрывает DOCS в корректной позиции",
        "Recovery показывает правильную следующую задачу и не выдаёт неявного разрешения на delivery"
      ],
      "expected_commit_message": "feat: Сохранить новый порядок при plan:extend и повторном открытии scope"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "delivery-ordering-policy-20261003",
        "task_id": "T004",
        "role": "implementation"
      },
      "dependencies": [
        "T003"
      ],
      "functional_paths": [
        "scripts/check-runtime-fixture.mjs",
        "scripts/check-package.mjs"
      ],
      "documentation_paths": [
        "docs/planning/delivery-ordering-policy.md"
      ],
      "verification_ids": [
        "package-check"
      ],
      "id": "T004",
      "title": "Добавить регрессионную проверку входной инструкции и порядка delivery",
      "why": "Добавить регрессионную проверку входной инструкции и порядка delivery",
      "verification_kind": "code",
      "acceptance_criteria": [
        "Fixture проверяет присутствие новых правил в recovery",
        "Fixture проверяет code-only и delivery планы, DOCS-позицию и plan:extend",
        "npm run check проходит полностью",
        "В этом scope не выполняются build, package release или GitHub publish"
      ],
      "expected_commit_message": "feat: Добавить регрессионную проверку входной инструкции и порядка delivery"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "delivery-ordering-policy-20261003",
        "task_id": "DOCS",
        "role": "implementation"
      },
      "dependencies": [
        "T001",
        "T002",
        "T003",
        "T004"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/planning/delivery-ordering-policy.md",
        "docs/PRODUCT.md",
        "docs/architecture/ARCHITECTURE.md",
        "src/templates/PROTOTYPE.md",
        "src/templates/PLAN.md",
        "src/templates/STAGES.md",
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
      "id": "8d99a92f-b224-41af-8d1e-bfa8c01cb522",
      "text": "Пользователь поручил выполнить описанную задачу и план.",
      "recorded_at": "2026-10-03T15:45:08.276Z"
    }
  ]
}
```
<!-- workflow-state:end -->

## Состояние

Execution Scope Status: ACTIVE
Delivery Status: IN_PROGRESS
Scope: delivery-ordering-policy-20261003
Current Task: нет
Revision: 98

## Цель

Зафиксировать и проверить строгий порядок DOCS → delivery и запретить любые незапланированные сборки/публикации в Workflow Kit recovery и планах.

## Критерии приёмки

- Зафиксировать и проверить строгий порядок DOCS → delivery и запретить любые незапланированные сборки/публикации в Workflow Kit recovery и планах.

## Микрозадачи

- [TODO] T001: Зафиксировать канонические правила DOCS, build и publish во входных инструкциях — Ожидает
  - Git Commit: [PENDING] feat: Зафиксировать канонические правила DOCS, build и publish во входных инструкциях
  - Reference: delivery-ordering-policy-20261003 / T001 / implementation
  - Файлы: docs/planning/delivery-ordering-policy.md, src/templates/PROTOTYPE.md, src/templates/PLAN.md, src/templates/STAGES.md, src/WORKFLOW.md
- [TODO] T002: Перенести системную DOCS перед delivery-хвостом плана — Ожидает
  - Git Commit: [PENDING] feat: Перенести системную DOCS перед delivery-хвостом плана
  - Reference: delivery-ordering-policy-20261003 / T002 / implementation
  - Файлы: src/lib/simple-workflow.mjs, src/lib/actions.mjs, src/lib/plan.mjs, docs/planning/delivery-ordering-policy.md
- [TODO] T003: Сохранить новый порядок при plan:extend и повторном открытии scope — Ожидает
  - Git Commit: [PENDING] feat: Сохранить новый порядок при plan:extend и повторном открытии scope
  - Reference: delivery-ordering-policy-20261003 / T003 / implementation
  - Файлы: src/lib/extend-plan.mjs, src/lib/actions.mjs, src/lib/recovery.mjs, src/lib/task-files.mjs, docs/planning/delivery-ordering-policy.md
- [TODO] T004: Добавить регрессионную проверку входной инструкции и порядка delivery — Ожидает
  - Git Commit: [PENDING] feat: Добавить регрессионную проверку входной инструкции и порядка delivery
  - Reference: delivery-ordering-policy-20261003 / T004 / implementation
  - Файлы: scripts/check-runtime-fixture.mjs, scripts/check-package.mjs, docs/planning/delivery-ordering-policy.md
- [TODO] DOCS: Актуализация всех документов проекта — Ожидает
  - Git Commit: [PENDING] docs: актуализировать контекст проекта
  - Reference: delivery-ordering-policy-20261003 / DOCS / implementation
  - Файлы: docs/planning/delivery-ordering-policy.md, docs/PRODUCT.md, docs/architecture/ARCHITECTURE.md, src/templates/PROTOTYPE.md, src/templates/PLAN.md, src/templates/STAGES.md, src/WORKFLOW.md, docs/architecture/OVERVIEW.md, docs/MODULES.md, docs/DOCUMENTATION_INDEX.md

## Context Pack For This Cycle

- docs/architecture/OVERVIEW.md → Краткая архитектура проекта
- docs/MODULES.md → Модули проекта
- docs/DOCUMENTATION_INDEX.md → Каталог документации
- docs/planning/delivery-ordering-policy.md

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
