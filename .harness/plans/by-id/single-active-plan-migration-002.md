# Активный план — WorkflowKit

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 9,
  "project_id": "98dbae8d-f53b-4acc-af12-d094fe016cee",
  "project_name": "WorkflowKit",
  "scope_id": "single-active-plan-migration-002",
  "execution_scope_status": "ACTIVE",
  "delivery_status": "IN_PROGRESS",
  "objective": "Перевести Workflow Kit с session-owned plans на один active todo-plan.md для каждого Git checkout/worktree, безопасно мигрировать legacy plans и подготовить совместимый consumer contract для Project Web Pilot.",
  "acceptance_criteria": [
    "Один checkout/worktree имеет ровно один current plan в .harness/plans/todo-plan.md.",
    "Обычные workflow commands и recover не требуют session selector.",
    "Legacy by-id/by-session plans сохраняются как history без потери данных и не участвуют в readiness.",
    "Старые WebPilot session IDs могут временно передаваться как compatibility/no-op и видят один current plan.",
    "plan:prepare/plan:bind session ownership удалены из постоянной модели.",
    "Package/installer/runtime/consumer checks подтверждают fresh install и upgrade from 1.4.13."
  ],
  "approved_scope": {
    "functional_paths": [
      "package.json",
      "index.mjs",
      "src/cli.mjs",
      "src/lib/session-plans.mjs",
      "src/lib/actions.mjs",
      "src/lib/recovery.mjs",
      "src/lib/installer.mjs",
      "src/lib/common.mjs",
      "src/lib/plan.mjs",
      "src/lib/transaction.mjs",
      "src/lib/inspection-inputs.mjs",
      "src/lib/installation-files.mjs",
      "src/lib/command-help.mjs",
      "src/lib/simple-workflow.mjs",
      "src/lib/task-update.mjs",
      "src/lib/extend-plan.mjs",
      "src/lib/validate.mjs",
      "src/schemas/plan.schema.json",
      "src/schemas/workflow.schema.json",
      "scripts/check-package.mjs",
      "scripts/check-runtime-fixture.mjs",
      "scripts/check-consumer-contract.mjs"
    ],
    "documentation_paths": [
      "docs/planning/single-active-plan-migration.md",
      "docs/modules/workflow-kit-package.md",
      "docs/PRODUCT.md",
      "docs/architecture/ARCHITECTURE.md",
      "docs/architecture/OVERVIEW.md",
      "docs/MODULES.md",
      "docs/DOCUMENTATION_INDEX.md",
      "docs/planning/canonical-workflow-kit-package.md",
      "src/WORKFLOW.md",
      "src/templates/AGENTS.md",
      "src/templates/START.md",
      "src/templates/PLAN.md",
      "src/templates/CONTINUE.md",
      "src/templates/STAGES.md",
      "src/templates/PROTOTYPE.md"
    ]
  },
  "baseline_commit": "b895149436ca3d2a390bced85e275196a3e76530",
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
        "required": true,
        "revision": "WORKTREE"
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
        "scope_id": "single-active-plan-migration-002",
        "task_id": "T001",
        "role": "implementation"
      },
      "dependencies": [],
      "functional_paths": [
        "src/cli.mjs",
        "src/lib/session-plans.mjs",
        "src/lib/common.mjs",
        "src/lib/plan.mjs",
        "src/lib/actions.mjs",
        "src/lib/task-update.mjs",
        "src/lib/extend-plan.mjs",
        "src/lib/transaction.mjs",
        "src/lib/validate.mjs",
        "src/lib/command-help.mjs",
        "scripts/check-runtime-fixture.mjs"
      ],
      "documentation_paths": [
        "docs/planning/single-active-plan-migration.md"
      ],
      "verification_ids": [
        "runtime"
      ],
      "id": "T001",
      "title": "Перевести core routing и CLI на один active plan checkout",
      "why": "Убрать session ownership из выбора текущего project state при сохранении мягкой совместимости старых клиентов.",
      "acceptance_criteria": [
        "todo-plan.md является единственным runtime current plan.",
        "status/validate/recover/task commands работают без --session.",
        "--session принимается как compatibility/no-op и не выбирает plan.",
        "Новые current plans не получают owner_session_id/prepared_in_session_id.",
        "plan:prepare/plan:bind не создают новую постоянную session-owned semantics."
      ],
      "expected_commit_message": "feat: перейти на один active plan checkout",
      "actual_files": [
        "scripts/check-runtime-fixture.mjs",
        "src/cli.mjs",
        "src/lib/actions.mjs",
        "src/lib/command-help.mjs",
        "src/lib/session-plans.mjs",
        "src/lib/transaction.mjs"
      ]
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "single-active-plan-migration-002",
        "task_id": "T002",
        "role": "implementation"
      },
      "dependencies": [
        "T001"
      ],
      "functional_paths": [
        "src/lib/installer.mjs",
        "src/lib/session-plans.mjs",
        "src/lib/installation-files.mjs",
        "src/lib/inspection-inputs.mjs",
        "src/lib/common.mjs",
        "src/lib/plan.mjs",
        "scripts/check-runtime-fixture.mjs",
        "src/lib/transaction.mjs"
      ],
      "documentation_paths": [
        "docs/planning/single-active-plan-migration.md"
      ],
      "verification_ids": [
        "runtime"
      ],
      "id": "T002",
      "title": "Реализовать безопасную legacy migration и single-plan readiness",
      "why": "Сохранить все старые plans как историю и убрать historical recovery из normal project readiness.",
      "acceptance_criteria": [
        "Valid todo-plan.md остаётся current winner.",
        "by-id/by-session files архивируются без потери данных и без automatic merge.",
        "Migration идемпотентна и invalid current plan останавливает её non-destructively.",
        "Historical oversized plans не блокируют readiness.",
        "Current oversized recovery по-прежнему строго соблюдает hard limit."
      ],
      "expected_commit_message": "feat: мигрировать legacy session plans в историю",
      "actual_files": [
        "scripts/check-runtime-fixture.mjs",
        "src/lib/inspection-inputs.mjs",
        "src/lib/installation-files.mjs",
        "src/lib/installer.mjs",
        "src/lib/session-plans.mjs",
        "src/lib/transaction.mjs"
      ]
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "single-active-plan-migration-002",
        "task_id": "T003",
        "role": "implementation"
      },
      "dependencies": [
        "T002"
      ],
      "functional_paths": [
        "src/lib/recovery.mjs",
        "src/lib/inspection-inputs.mjs",
        "src/lib/installation-files.mjs",
        "src/lib/command-help.mjs",
        "src/schemas/plan.schema.json",
        "src/schemas/workflow.schema.json",
        "scripts/check-package.mjs"
      ],
      "documentation_paths": [
        "src/WORKFLOW.md",
        "src/templates/AGENTS.md",
        "src/templates/START.md",
        "src/templates/PLAN.md",
        "src/templates/CONTINUE.md",
        "src/templates/STAGES.md",
        "src/templates/PROTOTYPE.md",
        "docs/planning/single-active-plan-migration.md"
      ],
      "verification_ids": [
        "runtime",
        "package"
      ],
      "id": "T003",
      "title": "Сделать recovery, inspection и generated instructions sessionless",
      "why": "Новый агент и любой клиент должны понимать checkout без скрытого WebPilot session routing.",
      "acceptance_criteria": [
        "Recovery не содержит session routing/plan:prepare guidance.",
        "Normal inspection inputs не зависят от legacy plan archive.",
        "Templates учат one checkout = one current plan и Git worktree для параллельности.",
        "Fresh install не требует by-id/by-session routing."
      ],
      "expected_commit_message": "docs: закрепить single-active workflow contract",
      "actual_files": [
        "scripts/check-package.mjs",
        "src/WORKFLOW.md",
        "src/lib/command-help.mjs",
        "src/lib/recovery.mjs",
        "src/templates/AGENTS.md",
        "src/templates/CONTINUE.md",
        "src/templates/PLAN.md",
        "src/templates/STAGES.md",
        "src/templates/START.md"
      ]
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "single-active-plan-migration-002",
        "task_id": "T004",
        "role": "implementation"
      },
      "dependencies": [
        "T003"
      ],
      "functional_paths": [
        "scripts/check-runtime-fixture.mjs",
        "scripts/check-consumer-contract.mjs",
        "scripts/check-package.mjs"
      ],
      "documentation_paths": [
        "docs/planning/single-active-plan-migration.md"
      ],
      "verification_ids": [
        "runtime",
        "consumer-contract"
      ],
      "id": "T004",
      "title": "Закрепить regression coverage для legacy sessions и Git worktrees",
      "why": "Доказать новую модель на fresh install, legacy migration, context budget и нескольких клиентах.",
      "acceptance_criteria": [
        "Разные old session IDs возвращают один scope/revision текущего checkout.",
        "sessionPlanView compatibility facade показывает один current plan.",
        "Несколько legacy active plans сохраняются, но не становятся current.",
        "Historical oversized plan не блокирует current recovery.",
        "Отдельные Git worktrees имеют независимые todo-plan.md."
      ],
      "expected_commit_message": "test: закрепить single-active plan regressions"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "single-active-plan-migration-002",
        "task_id": "T005",
        "role": "implementation"
      },
      "dependencies": [
        "T004"
      ],
      "functional_paths": [
        "index.mjs",
        "src/lib/session-plans.mjs",
        "scripts/check-consumer-contract.mjs"
      ],
      "documentation_paths": [
        "docs/modules/workflow-kit-package.md",
        "docs/planning/single-active-plan-migration.md"
      ],
      "verification_ids": [
        "consumer-contract",
        "runtime"
      ],
      "id": "T005",
      "title": "Обновить consumer contract для адаптации Project Web Pilot",
      "why": "Дать WebPilot понятный переходный API для чтения старых chats при одном актуальном project plan.",
      "acceptance_criteria": [
        "Package contract описывает checkout-scoped current plan.",
        "sessionPlanView временно совместим со старым WebPilot, но не владеет plan.",
        "Legacy planId не используется как runtime selector.",
        "Packed standalone consumer работает без sibling WorkflowKit repo."
      ],
      "expected_commit_message": "feat: обновить consumer contract для single-active plan"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "single-active-plan-migration-002",
        "task_id": "T006",
        "role": "implementation"
      },
      "dependencies": [
        "T005"
      ],
      "functional_paths": [
        "package.json",
        "src/lib/common.mjs",
        "src/lib/installer.mjs",
        "scripts/check-package.mjs",
        "scripts/check-runtime-fixture.mjs",
        "scripts/check-consumer-contract.mjs"
      ],
      "documentation_paths": [
        "docs/modules/workflow-kit-package.md",
        "docs/planning/single-active-plan-migration.md"
      ],
      "verification_ids": [
        "package",
        "runtime",
        "consumer-contract"
      ],
      "id": "T006",
      "title": "Выпустить новую версию Workflow Kit и проверить upgrade с 1.4.13",
      "why": "Зафиксировать breaking architectural migration отдельной package version и доказать safe upgrade/fresh install.",
      "acceptance_criteria": [
        "Package version отличается от 1.4.13 и отражает новую semantics.",
        "Upgrade legacy 1.4.13 сохраняет current todo-plan и legacy history.",
        "Fresh install сразу использует single-active model.",
        "Package/runtime/consumer-contract checks проходят на candidate tree.",
        "WebPilot agent получает точный новый version/contract handoff."
      ],
      "expected_commit_message": "release: подготовить single-active Workflow Kit"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "single-active-plan-migration-002",
        "task_id": "DOCS",
        "role": "implementation"
      },
      "id": "DOCS",
      "title": "Актуализация всех документов проекта",
      "why": "Проверить весь действующий комплект документации по docs/DOCUMENTATION_INDEX.md и обновить только устаревшие сведения после выполнения scope.",
      "dependencies": [
        "T001",
        "T002",
        "T003",
        "T004",
        "T005",
        "T006"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/architecture/OVERVIEW.md",
        "docs/MODULES.md",
        "docs/DOCUMENTATION_INDEX.md",
        "docs/planning/single-active-plan-migration.md",
        "src/WORKFLOW.md",
        "src/templates/AGENTS.md",
        "src/templates/START.md",
        "src/templates/PLAN.md",
        "src/templates/CONTINUE.md",
        "src/templates/STAGES.md",
        "src/templates/PROTOTYPE.md",
        "docs/modules/workflow-kit-package.md"
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
      "id": "a00ad757-5563-4ce7-be6d-82e6003dc92f",
      "text": "Пользователь утвердил переход Workflow Kit к модели одного активного plan на Git checkout/worktree и удаление session-owned plan semantics.",
      "recorded_at": "2026-09-27T13:49:50.362Z"
    }
  ],
  "owner_session_id": "web-pilot-0543a4f6-84a3-4269-be1a-3868edce135b",
  "prepared_in_session_id": "web-pilot-17b338f4-79ec-4097-a18d-5b6b903a2e24",
  "session_experience": "chat"
}
```
<!-- workflow-state:end -->

## Состояние

Execution Scope Status: ACTIVE
Delivery Status: IN_PROGRESS
Scope: single-active-plan-migration-002
Current Task: нет
Revision: 9

## Цель

Перевести Workflow Kit с session-owned plans на один active todo-plan.md для каждого Git checkout/worktree, безопасно мигрировать legacy plans и подготовить совместимый consumer contract для Project Web Pilot.

## Критерии приёмки

- Один checkout/worktree имеет ровно один current plan в .harness/plans/todo-plan.md.
- Обычные workflow commands и recover не требуют session selector.
- Legacy by-id/by-session plans сохраняются как history без потери данных и не участвуют в readiness.
- Старые WebPilot session IDs могут временно передаваться как compatibility/no-op и видят один current plan.
- plan:prepare/plan:bind session ownership удалены из постоянной модели.
- Package/installer/runtime/consumer checks подтверждают fresh install и upgrade from 1.4.13.

## Микрозадачи

- [DONE] T001: Перевести core routing и CLI на один active plan checkout — Завершено
  - Git Commit: [DONE] feat: перейти на один active plan checkout
  - Reference: single-active-plan-migration-002 / T001 / implementation
  - Файлы: src/cli.mjs, src/lib/session-plans.mjs, src/lib/common.mjs, src/lib/plan.mjs, src/lib/actions.mjs, src/lib/task-update.mjs, src/lib/extend-plan.mjs, src/lib/transaction.mjs, src/lib/validate.mjs, src/lib/command-help.mjs, scripts/check-runtime-fixture.mjs, docs/planning/single-active-plan-migration.md
- [DONE] T002: Реализовать безопасную legacy migration и single-plan readiness — Завершено
  - Git Commit: [DONE] feat: мигрировать legacy session plans в историю
  - Reference: single-active-plan-migration-002 / T002 / implementation
  - Файлы: src/lib/installer.mjs, src/lib/session-plans.mjs, src/lib/installation-files.mjs, src/lib/inspection-inputs.mjs, src/lib/common.mjs, src/lib/plan.mjs, scripts/check-runtime-fixture.mjs, src/lib/transaction.mjs, docs/planning/single-active-plan-migration.md
- [DONE] T003: Сделать recovery, inspection и generated instructions sessionless — Завершено
  - Git Commit: [DONE] docs: закрепить single-active workflow contract
  - Reference: single-active-plan-migration-002 / T003 / implementation
  - Файлы: src/lib/recovery.mjs, src/lib/inspection-inputs.mjs, src/lib/installation-files.mjs, src/lib/command-help.mjs, src/schemas/plan.schema.json, src/schemas/workflow.schema.json, scripts/check-package.mjs, src/WORKFLOW.md, src/templates/AGENTS.md, src/templates/START.md, src/templates/PLAN.md, src/templates/CONTINUE.md, src/templates/STAGES.md, src/templates/PROTOTYPE.md, docs/planning/single-active-plan-migration.md
- [TODO] T004: Закрепить regression coverage для legacy sessions и Git worktrees — Ожидает
  - Git Commit: [PENDING] test: закрепить single-active plan regressions
  - Reference: single-active-plan-migration-002 / T004 / implementation
  - Файлы: scripts/check-runtime-fixture.mjs, scripts/check-consumer-contract.mjs, scripts/check-package.mjs, docs/planning/single-active-plan-migration.md
- [TODO] T005: Обновить consumer contract для адаптации Project Web Pilot — Ожидает
  - Git Commit: [PENDING] feat: обновить consumer contract для single-active plan
  - Reference: single-active-plan-migration-002 / T005 / implementation
  - Файлы: index.mjs, src/lib/session-plans.mjs, scripts/check-consumer-contract.mjs, docs/modules/workflow-kit-package.md, docs/planning/single-active-plan-migration.md
- [TODO] T006: Выпустить новую версию Workflow Kit и проверить upgrade с 1.4.13 — Ожидает
  - Git Commit: [PENDING] release: подготовить single-active Workflow Kit
  - Reference: single-active-plan-migration-002 / T006 / implementation
  - Файлы: package.json, src/lib/common.mjs, src/lib/installer.mjs, scripts/check-package.mjs, scripts/check-runtime-fixture.mjs, scripts/check-consumer-contract.mjs, docs/modules/workflow-kit-package.md, docs/planning/single-active-plan-migration.md
- [TODO] DOCS: Актуализация всех документов проекта — Ожидает
  - Git Commit: [PENDING] docs: актуализировать документацию проекта
  - Reference: single-active-plan-migration-002 / DOCS / implementation
  - Файлы: docs/architecture/OVERVIEW.md, docs/MODULES.md, docs/DOCUMENTATION_INDEX.md, docs/planning/single-active-plan-migration.md, src/WORKFLOW.md, src/templates/AGENTS.md, src/templates/START.md, src/templates/PLAN.md, src/templates/CONTINUE.md, src/templates/STAGES.md, src/templates/PROTOTYPE.md, docs/modules/workflow-kit-package.md

## Context Pack For This Cycle

- docs/architecture/OVERVIEW.md → Краткая архитектура проекта
- docs/MODULES.md → Модули проекта
- docs/DOCUMENTATION_INDEX.md → Каталог документации
- docs/planning/single-active-plan-migration.md

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
