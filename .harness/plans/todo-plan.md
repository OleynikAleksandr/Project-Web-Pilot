# Активный план — WorkflowKit

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 67,
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
    "functional_paths": [
      "LICENSE",
      "src/lib/actions.mjs",
      "src/cli.mjs",
      "src/lib/transaction.mjs",
      "src/lib/command-help.mjs",
      "scripts/check-runtime-fixture.mjs",
      "package.json",
      "scripts/check-carryover-fixture.mjs",
      "scripts/check-consumer-contract.mjs",
      "scripts/check-package.mjs",
      "src/lib/common.mjs",
      "src/lib/installer.mjs"
    ],
    "documentation_paths": [
      "docs/DOCUMENTATION_INDEX.md",
      "docs/modules/workflow-kit-package.md",
      "docs/planning/single-active-plan-migration.md",
      "docs/architecture/OVERVIEW.md",
      "docs/MODULES.md",
      "README.md",
      "src/templates/CONTINUE.md",
      "src/WORKFLOW.md",
      "docs/PRODUCT.md",
      "docs/WORKFLOW_START.md",
      "docs/architecture/ARCHITECTURE.md"
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
      },
      {
        "path": "docs/modules/workflow-kit-package.md",
        "required": true
      }
    ],
    "include_last_completed_task": false,
    "dependency_task_ids": []
  },
  "tasks": [
    {
      "id": "T002",
      "title": "Добавить README и связать WorkflowKit с Project Web Pilot",
      "why": "Добавить README и связать WorkflowKit с Project Web Pilot",
      "dependencies": [],
      "functional_paths": [],
      "documentation_paths": [
        "README.md"
      ],
      "verification_ids": [],
      "verification_kind": "code",
      "acceptance_criteria": [
        "README описывает WorkflowKit 1.5.0, single-active plan model, запуск проверок и package integration.",
        "README содержит прямую ссылку на https://github.com/OleynikAleksandr/Project-Web-Pilot."
      ],
      "expected_commit_message": "docs: add WorkflowKit README and Web Pilot link",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "release-1.5.0-docs-finalization-001",
        "task_id": "T002",
        "role": "implementation"
      },
      "actual_files": [
        "README.md"
      ]
    },
    {
      "id": "T003",
      "title": "Добавить README в индекс документации",
      "why": "Добавить README в индекс документации",
      "dependencies": [],
      "functional_paths": [],
      "documentation_paths": [
        "docs/DOCUMENTATION_INDEX.md"
      ],
      "verification_ids": [],
      "verification_kind": "code",
      "acceptance_criteria": [
        "README присутствует в полном индексе документации WorkflowKit."
      ],
      "expected_commit_message": "docs: index README",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "release-1.5.0-docs-finalization-001",
        "task_id": "T003",
        "role": "implementation"
      },
      "actual_files": [
        "docs/DOCUMENTATION_INDEX.md"
      ]
    },
    {
      "id": "T004",
      "title": "Сохранить GitHub LICENSE в локальной истории",
      "why": "Сохранить GitHub LICENSE в локальной истории",
      "dependencies": [],
      "functional_paths": [
        "LICENSE"
      ],
      "documentation_paths": [],
      "verification_ids": [
        "package"
      ],
      "verification_kind": "code",
      "acceptance_criteria": [
        "MIT LICENSE из существующего GitHub main присутствует в локальной истории WorkflowKit без изменения содержимого."
      ],
      "expected_commit_message": "chore: add repository LICENSE",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "release-1.5.0-docs-finalization-001",
        "task_id": "T004",
        "role": "implementation"
      },
      "actual_files": [
        "LICENSE"
      ]
    },
    {
      "id": "R001",
      "title": "Актуализировать README для интеграции с Web Pilot 0.6.64",
      "why": "Актуализировать README для интеграции с Web Pilot 0.6.64",
      "dependencies": [],
      "functional_paths": [],
      "documentation_paths": [
        "docs/modules/workflow-kit-package.md",
        "README.md"
      ],
      "verification_ids": [],
      "verification_kind": "code",
      "acceptance_criteria": [
        "README отражает Kit 1.5.0, фактическую структуру пакета и границу ответственности с Web Pilot 0.6.64.",
        "Ссылки и команды сверены с существующими файлами; runtime, версия и digest Kit не меняются."
      ],
      "expected_commit_message": "feat: Актуализировать README для интеграции с Web Pilot 0.6.64",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "release-1.5.0-docs-finalization-001",
        "task_id": "R001",
        "role": "implementation"
      },
      "actual_files": [
        "README.md"
      ]
    },
    {
      "id": "R002",
      "title": "Актуализировать README для выпуска клиента Web Pilot 0.6.65",
      "why": "Актуализировать README для выпуска клиента Web Pilot 0.6.65",
      "dependencies": [],
      "functional_paths": [],
      "documentation_paths": [
        "docs/modules/workflow-kit-package.md",
        "README.md"
      ],
      "verification_ids": [],
      "verification_kind": "code",
      "acceptance_criteria": [
        "README указывает Web Pilot 0.6.65 и неизменённый Workflow Kit 1.5.0; взаимная ссылка сохранена."
      ],
      "expected_commit_message": "feat: Актуализировать README для выпуска клиента Web Pilot 0.6.65",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "release-1.5.0-docs-finalization-001",
        "task_id": "R002",
        "role": "implementation"
      },
      "actual_files": [
        "README.md"
      ]
    },
    {
      "id": "R003",
      "title": "README: чистое поле нового Chat/Work в клиенте 0.6.66",
      "why": "README: чистое поле нового Chat/Work в клиенте 0.6.66",
      "dependencies": [],
      "functional_paths": [],
      "documentation_paths": [
        "docs/modules/workflow-kit-package.md",
        "README.md"
      ],
      "verification_ids": [],
      "verification_kind": "code",
      "acceptance_criteria": [
        "README отражает версию клиента 0.6.66 и границу между кэшем Kit и редактором ChatGPT; ссылка на Web Pilot сохранена."
      ],
      "expected_commit_message": "feat: README: чистое поле нового Chat/Work в клиенте 0.6.66",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "release-1.5.0-docs-finalization-001",
        "task_id": "R003",
        "role": "implementation"
      },
      "actual_files": [
        "README.md"
      ]
    },
    {
      "id": "R004",
      "title": "README: диагностический клиент Web Pilot 0.6.67",
      "why": "README: диагностический клиент Web Pilot 0.6.67",
      "dependencies": [],
      "functional_paths": [],
      "documentation_paths": [
        "README.md"
      ],
      "verification_ids": [],
      "verification_kind": "code",
      "acceptance_criteria": [
        "README отражает диагностический выпуск; runtime Kit остаётся 1.5.0."
      ],
      "expected_commit_message": "feat: README: диагностический клиент Web Pilot 0.6.67",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "release-1.5.0-docs-finalization-001",
        "task_id": "R004",
        "role": "implementation"
      },
      "actual_files": [
        "README.md"
      ]
    },
    {
      "id": "R005",
      "title": "README: быстрая вставка клиента Web Pilot 0.6.68",
      "why": "README: быстрая вставка клиента Web Pilot 0.6.68",
      "dependencies": [],
      "functional_paths": [],
      "documentation_paths": [
        "README.md"
      ],
      "verification_ids": [],
      "verification_kind": "code",
      "acceptance_criteria": [
        "README отражает клиент 0.6.68 и отсутствие изменений runtime Kit; связь с репозиторием Web Pilot сохранена."
      ],
      "expected_commit_message": "feat: README: быстрая вставка клиента Web Pilot 0.6.68",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "release-1.5.0-docs-finalization-001",
        "task_id": "R005",
        "role": "implementation"
      },
      "actual_files": [
        "README.md"
      ]
    },
    {
      "id": "R006",
      "title": "README: Paste в клиенте Web Pilot 0.6.69",
      "why": "README: Paste в клиенте Web Pilot 0.6.69",
      "dependencies": [],
      "functional_paths": [],
      "documentation_paths": [
        "README.md"
      ],
      "verification_ids": [],
      "verification_kind": "code",
      "acceptance_criteria": [
        "README отражает тестовый Paste клиента 0.6.69, неизменённый runtime Kit и взаимную ссылку."
      ],
      "expected_commit_message": "feat: README: Paste в клиенте Web Pilot 0.6.69",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "release-1.5.0-docs-finalization-001",
        "task_id": "R006",
        "role": "implementation"
      },
      "actual_files": [
        "README.md"
      ]
    },
    {
      "id": "R007",
      "title": "README: завершение Send в Web Pilot 0.6.70",
      "why": "README: завершение Send в Web Pilot 0.6.70",
      "dependencies": [],
      "functional_paths": [],
      "documentation_paths": [
        "README.md"
      ],
      "verification_ids": [],
      "verification_kind": "code",
      "acceptance_criteria": [
        "README указывает актуальный клиент и завершение локальной передачи без проверки DOM; взаимные ссылки сохранены."
      ],
      "expected_commit_message": "feat: README: завершение Send в Web Pilot 0.6.70",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "release-1.5.0-docs-finalization-001",
        "task_id": "R007",
        "role": "implementation"
      },
      "actual_files": [
        "README.md"
      ]
    },
    {
      "id": "R008",
      "title": "README: итоговый клиент Web Pilot 0.6.71",
      "why": "README: итоговый клиент Web Pilot 0.6.71",
      "dependencies": [],
      "functional_paths": [],
      "documentation_paths": [
        "README.md"
      ],
      "verification_ids": [],
      "verification_kind": "code",
      "acceptance_criteria": [
        "README указывает итоговый выпуск 0.6.71 без проверки и общего индикатора после Send; ссылки сохранены."
      ],
      "expected_commit_message": "feat: README: итоговый клиент Web Pilot 0.6.71",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "release-1.5.0-docs-finalization-001",
        "task_id": "R008",
        "role": "implementation"
      },
      "actual_files": [
        "README.md"
      ]
    },
    {
      "id": "R009",
      "title": "Перенос незавершённых задач одним коммитом; Workflow Kit 1.5.1",
      "why": "Перенос незавершённых задач одним коммитом; Workflow Kit 1.5.1",
      "dependencies": [],
      "functional_paths": [
        "src/lib/actions.mjs",
        "src/cli.mjs",
        "src/lib/transaction.mjs",
        "src/lib/command-help.mjs",
        "scripts/check-runtime-fixture.mjs",
        "package.json",
        "scripts/check-carryover-fixture.mjs",
        "scripts/check-consumer-contract.mjs",
        "scripts/check-package.mjs",
        "src/lib/common.mjs",
        "src/lib/installer.mjs"
      ],
      "documentation_paths": [
        "src/templates/CONTINUE.md",
        "src/WORKFLOW.md",
        "docs/modules/workflow-kit-package.md",
        "README.md",
        "docs/DOCUMENTATION_INDEX.md",
        "docs/architecture/OVERVIEW.md"
      ],
      "verification_ids": [
        "package",
        "runtime",
        "consumer-contract"
      ],
      "verification_kind": "code",
      "acceptance_criteria": [
        "plan:carryover по явному поручению архивирует исходный план с честными статусами и создаёт новый из незавершённых задач вместе с DOCS.",
        "Критерии, проверки, документация и внутренние зависимости сохранены; выполненные зависимости остаются историей.",
        "Ошибки revision, занятой задачи, чужих изменений, коллизии архива и повтор команды не теряют задачи; прерывание восстанавливается штатным repair."
      ],
      "expected_commit_message": "feat: Перенос незавершённых задач одним коммитом; Workflow Kit 1.5.1",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "release-1.5.0-docs-finalization-001",
        "task_id": "R009",
        "role": "implementation"
      },
      "actual_files": [
        "README.md",
        "docs/DOCUMENTATION_INDEX.md",
        "docs/architecture/OVERVIEW.md",
        "docs/modules/workflow-kit-package.md",
        "package.json",
        "scripts/check-carryover-fixture.mjs",
        "scripts/check-consumer-contract.mjs",
        "scripts/check-package.mjs",
        "scripts/check-runtime-fixture.mjs",
        "src/WORKFLOW.md",
        "src/cli.mjs",
        "src/lib/actions.mjs",
        "src/lib/command-help.mjs",
        "src/lib/common.mjs",
        "src/lib/installer.mjs",
        "src/lib/transaction.mjs",
        "src/templates/CONTINUE.md"
      ]
    },
    {
      "id": "T001",
      "title": "Обновить README интеграции с автовыполнением Web Pilot 0.6.73",
      "why": "Обновить README интеграции с автовыполнением Web Pilot 0.6.73",
      "dependencies": [],
      "functional_paths": [],
      "documentation_paths": [
        "README.md"
      ],
      "verification_ids": [],
      "verification_kind": "code",
      "acceptance_criteria": [
        "README сохраняет взаимные ссылки репозиториев и отделяет автовыполнение клиента от current plan/commit semantics Workflow Kit 1.5.1."
      ],
      "expected_commit_message": "feat: Обновить README интеграции с автовыполнением Web Pilot 0.6.73",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "release-1.5.0-docs-finalization-001",
        "task_id": "T001",
        "role": "implementation"
      },
      "actual_files": [
        "README.md"
      ]
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "release-1.5.0-docs-finalization-001",
        "task_id": "DOCS",
        "role": "implementation",
        "iteration": 14
      },
      "dependencies": [
        "T002",
        "T003",
        "T004",
        "R001",
        "R002",
        "R003",
        "R004",
        "R005",
        "R006",
        "R007",
        "R008",
        "R009",
        "T001"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/DOCUMENTATION_INDEX.md",
        "docs/modules/workflow-kit-package.md",
        "docs/planning/single-active-plan-migration.md",
        "docs/architecture/OVERVIEW.md",
        "docs/MODULES.md",
        "README.md",
        "src/templates/CONTINUE.md",
        "src/WORKFLOW.md",
        "docs/PRODUCT.md",
        "docs/WORKFLOW_START.md",
        "docs/architecture/ARCHITECTURE.md"
      ],
      "verification_ids": [],
      "id": "DOCS",
      "title": "Актуализация всех документов проекта",
      "why": "Зафиксировать поздние release-уточнения после self-host cutover.",
      "acceptance_criteria": [
        "Release docs согласованы с Workflow Kit 1.5.0 и self-host cutover."
      ],
      "expected_commit_message": "docs: завершить release-документацию 1.5.0",
      "actual_files": [
        "docs/PRODUCT.md",
        "docs/WORKFLOW_START.md",
        "docs/architecture/ARCHITECTURE.md"
      ]
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
Revision: 67

## Цель

Зафиксировать актуальные release-документы Workflow Kit 1.5.0 после self-host cutover.

## Критерии приёмки

- Release-документы отражают фактический single-active contract 1.5.0 и завершённый self-host cutover.

## Микрозадачи

- [DONE] T002: Добавить README и связать WorkflowKit с Project Web Pilot — Завершено
  - Git Commit: [DONE] docs: add WorkflowKit README and Web Pilot link
  - Reference: release-1.5.0-docs-finalization-001 / T002 / implementation
  - Файлы: README.md
- [DONE] T003: Добавить README в индекс документации — Завершено
  - Git Commit: [DONE] docs: index README
  - Reference: release-1.5.0-docs-finalization-001 / T003 / implementation
  - Файлы: docs/DOCUMENTATION_INDEX.md
- [DONE] T004: Сохранить GitHub LICENSE в локальной истории — Завершено
  - Git Commit: [DONE] chore: add repository LICENSE
  - Reference: release-1.5.0-docs-finalization-001 / T004 / implementation
  - Файлы: LICENSE
- [DONE] R001: Актуализировать README для интеграции с Web Pilot 0.6.64 — Завершено
  - Git Commit: [DONE] feat: Актуализировать README для интеграции с Web Pilot 0.6.64
  - Reference: release-1.5.0-docs-finalization-001 / R001 / implementation
  - Файлы: docs/modules/workflow-kit-package.md, README.md
- [DONE] R002: Актуализировать README для выпуска клиента Web Pilot 0.6.65 — Завершено
  - Git Commit: [DONE] feat: Актуализировать README для выпуска клиента Web Pilot 0.6.65
  - Reference: release-1.5.0-docs-finalization-001 / R002 / implementation
  - Файлы: docs/modules/workflow-kit-package.md, README.md
- [DONE] R003: README: чистое поле нового Chat/Work в клиенте 0.6.66 — Завершено
  - Git Commit: [DONE] feat: README: чистое поле нового Chat/Work в клиенте 0.6.66
  - Reference: release-1.5.0-docs-finalization-001 / R003 / implementation
  - Файлы: docs/modules/workflow-kit-package.md, README.md
- [DONE] R004: README: диагностический клиент Web Pilot 0.6.67 — Завершено
  - Git Commit: [DONE] feat: README: диагностический клиент Web Pilot 0.6.67
  - Reference: release-1.5.0-docs-finalization-001 / R004 / implementation
  - Файлы: README.md
- [DONE] R005: README: быстрая вставка клиента Web Pilot 0.6.68 — Завершено
  - Git Commit: [DONE] feat: README: быстрая вставка клиента Web Pilot 0.6.68
  - Reference: release-1.5.0-docs-finalization-001 / R005 / implementation
  - Файлы: README.md
- [DONE] R006: README: Paste в клиенте Web Pilot 0.6.69 — Завершено
  - Git Commit: [DONE] feat: README: Paste в клиенте Web Pilot 0.6.69
  - Reference: release-1.5.0-docs-finalization-001 / R006 / implementation
  - Файлы: README.md
- [DONE] R007: README: завершение Send в Web Pilot 0.6.70 — Завершено
  - Git Commit: [DONE] feat: README: завершение Send в Web Pilot 0.6.70
  - Reference: release-1.5.0-docs-finalization-001 / R007 / implementation
  - Файлы: README.md
- [DONE] R008: README: итоговый клиент Web Pilot 0.6.71 — Завершено
  - Git Commit: [DONE] feat: README: итоговый клиент Web Pilot 0.6.71
  - Reference: release-1.5.0-docs-finalization-001 / R008 / implementation
  - Файлы: README.md
- [DONE] R009: Перенос незавершённых задач одним коммитом; Workflow Kit 1.5.1 — Завершено
  - Git Commit: [DONE] feat: Перенос незавершённых задач одним коммитом; Workflow Kit 1.5.1
  - Reference: release-1.5.0-docs-finalization-001 / R009 / implementation
  - Файлы: src/lib/actions.mjs, src/cli.mjs, src/lib/transaction.mjs, src/lib/command-help.mjs, scripts/check-runtime-fixture.mjs, package.json, scripts/check-carryover-fixture.mjs, scripts/check-consumer-contract.mjs, scripts/check-package.mjs, src/lib/common.mjs, src/lib/installer.mjs, src/templates/CONTINUE.md, src/WORKFLOW.md, docs/modules/workflow-kit-package.md, README.md, docs/DOCUMENTATION_INDEX.md, docs/architecture/OVERVIEW.md
- [DONE] T001: Обновить README интеграции с автовыполнением Web Pilot 0.6.73 — Завершено
  - Git Commit: [DONE] feat: Обновить README интеграции с автовыполнением Web Pilot 0.6.73
  - Reference: release-1.5.0-docs-finalization-001 / T001 / implementation
  - Файлы: README.md
- [TODO] DOCS: Актуализация всех документов проекта — Ожидает
  - Git Commit: [PENDING] docs: завершить release-документацию 1.5.0
  - Reference: release-1.5.0-docs-finalization-001 / DOCS / implementation
  - Файлы: docs/DOCUMENTATION_INDEX.md, docs/modules/workflow-kit-package.md, docs/planning/single-active-plan-migration.md, docs/architecture/OVERVIEW.md, docs/MODULES.md, README.md, src/templates/CONTINUE.md, src/WORKFLOW.md, docs/PRODUCT.md, docs/WORKFLOW_START.md, docs/architecture/ARCHITECTURE.md

## Context Pack For This Cycle

- docs/architecture/OVERVIEW.md → Краткая архитектура проекта
- docs/MODULES.md → Модули проекта
- docs/DOCUMENTATION_INDEX.md → Каталог документации
- docs/planning/single-active-plan-migration.md
- docs/modules/workflow-kit-package.md

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
