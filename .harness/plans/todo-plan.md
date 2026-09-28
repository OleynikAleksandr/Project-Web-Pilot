# Активный план — WorkflowKit

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 40,
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
      "LICENSE"
    ],
    "documentation_paths": [
      "docs/DOCUMENTATION_INDEX.md",
      "docs/modules/workflow-kit-package.md",
      "docs/planning/single-active-plan-migration.md",
      "docs/architecture/OVERVIEW.md",
      "docs/MODULES.md",
      "README.md"
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
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "release-1.5.0-docs-finalization-001",
        "task_id": "R005",
        "role": "implementation"
      }
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "release-1.5.0-docs-finalization-001",
        "task_id": "DOCS",
        "role": "implementation",
        "iteration": 9
      },
      "dependencies": [
        "T002",
        "T003",
        "T004",
        "R001",
        "R002",
        "R003",
        "R004",
        "R005"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/DOCUMENTATION_INDEX.md",
        "docs/modules/workflow-kit-package.md",
        "docs/planning/single-active-plan-migration.md",
        "docs/architecture/OVERVIEW.md",
        "docs/MODULES.md",
        "README.md"
      ],
      "verification_ids": [],
      "id": "DOCS",
      "title": "Актуализация всех документов проекта",
      "why": "Зафиксировать поздние release-уточнения после self-host cutover.",
      "acceptance_criteria": [
        "Release docs согласованы с Workflow Kit 1.5.0 и self-host cutover."
      ],
      "expected_commit_message": "docs: завершить release-документацию 1.5.0",
      "actual_files": []
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
Revision: 40

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
- [TODO] R005: README: быстрая вставка клиента Web Pilot 0.6.68 — Ожидает
  - Git Commit: [PENDING] feat: README: быстрая вставка клиента Web Pilot 0.6.68
  - Reference: release-1.5.0-docs-finalization-001 / R005 / implementation
  - Файлы: README.md
- [TODO] DOCS: Актуализация всех документов проекта — Ожидает
  - Git Commit: [PENDING] docs: завершить release-документацию 1.5.0
  - Reference: release-1.5.0-docs-finalization-001 / DOCS / implementation
  - Файлы: docs/DOCUMENTATION_INDEX.md, docs/modules/workflow-kit-package.md, docs/planning/single-active-plan-migration.md, docs/architecture/OVERVIEW.md, docs/MODULES.md, README.md

## Context Pack For This Cycle

- docs/architecture/OVERVIEW.md → Краткая архитектура проекта
- docs/MODULES.md → Модули проекта
- docs/DOCUMENTATION_INDEX.md → Каталог документации
- docs/planning/single-active-plan-migration.md
- docs/modules/workflow-kit-package.md

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
