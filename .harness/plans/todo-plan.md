# Активный план — Project Web Pilot

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 724,
  "project_id": "cf944136-d1fc-4bd5-9ea0-e46d1fe230e7",
  "project_name": "Project Web Pilot",
  "scope_id": "event-driven-runtime-planning-20260928",
  "execution_scope_status": "ACTIVE",
  "delivery_status": "IN_PROGRESS",
  "objective": "Подготовить согласованный планировочный документ событийной обработки и предложить три компактные фазы реализации; код и релиз в этом поручении не менять",
  "acceptance_criteria": [
    "Подготовить согласованный планировочный документ событийной обработки и предложить три компактные фазы реализации; код и релиз в этом поручении не менять"
  ],
  "approved_scope": {
    "functional_paths": [],
    "documentation_paths": [
      "docs/planning/event-driven-runtime.md",
      "docs/MODULES.md",
      "docs/DOCUMENTATION_INDEX.md",
      "docs/architecture/OVERVIEW.md",
      "docs/PRODUCT.md",
      "docs/architecture/ARCHITECTURE.md"
    ]
  },
  "baseline_commit": "821d67d4a73a657e6b7c7af42d4b1600e1c2775b",
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
        "path": "docs/planning/event-driven-runtime.md",
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
        "scope_id": "event-driven-runtime-planning-20260928",
        "task_id": "T001",
        "role": "implementation"
      },
      "dependencies": [],
      "functional_paths": [],
      "documentation_paths": [
        "docs/planning/event-driven-runtime.md",
        "docs/MODULES.md",
        "docs/DOCUMENTATION_INDEX.md",
        "docs/architecture/OVERVIEW.md"
      ],
      "verification_ids": [],
      "id": "T001",
      "title": "Подготовить и проверить контракт перехода на события и три компактные фазы",
      "why": "Подготовить и проверить контракт перехода на события и три компактные фазы",
      "verification_kind": "code",
      "acceptance_criteria": [
        "Документ содержит решения аудита, карту 18 состояний, три фазы и критерии приёмки",
        "Навигация связывает документ с существующими модулями; реализация не начата"
      ],
      "expected_commit_message": "feat: Подготовить и проверить контракт перехода на события и три компактные фазы",
      "actual_files": [
        "docs/planning/event-driven-runtime.md",
        "docs/MODULES.md",
        "docs/DOCUMENTATION_INDEX.md",
        "docs/architecture/OVERVIEW.md"
      ]
    },
    {
      "id": "T002",
      "title": "Уточнить границы фаз, ревизии черновика, подтверждение requestId и Node Electron",
      "why": "Уточнить границы фаз, ревизии черновика, подтверждение requestId и Node Electron",
      "dependencies": [],
      "functional_paths": [],
      "documentation_paths": [
        "docs/planning/event-driven-runtime.md"
      ],
      "verification_ids": [],
      "verification_kind": "code",
      "acceptance_criteria": [
        "Фаза 1 проверяется без периодического DOM вызова controller.tick и отдельных busy/diagnostic интервалов",
        "Зафиксированы draftRevision, односторонние уведомления сообщений и фактически проверенная версия Node встроенного Electron"
      ],
      "expected_commit_message": "feat: Уточнить границы фаз, ревизии черновика, подтверждение requestId и Node Electron",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "event-driven-runtime-planning-20260928",
        "task_id": "T002",
        "role": "implementation"
      },
      "actual_files": [
        "docs/planning/event-driven-runtime.md"
      ]
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "event-driven-runtime-planning-20260928",
        "task_id": "DOCS",
        "role": "implementation",
        "iteration": 2
      },
      "dependencies": [
        "T001",
        "T002"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/planning/event-driven-runtime.md",
        "docs/PRODUCT.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/MODULES.md",
        "docs/DOCUMENTATION_INDEX.md",
        "docs/architecture/OVERVIEW.md"
      ],
      "verification_ids": [],
      "id": "DOCS",
      "title": "Актуализация всех документов проекта",
      "why": "Сохранить актуальный контекст для следующего агента",
      "acceptance_criteria": [
        "Документы соответствуют результату"
      ],
      "expected_commit_message": "docs: актуализировать контекст проекта",
      "actual_files": []
    }
  ],
  "blocked_reason": null,
  "user_decisions": [
    {
      "id": "ea5f17a3-354c-4506-9765-0376880ea0bb",
      "text": "Пользователь поручил выполнить описанную задачу и план.",
      "recorded_at": "2026-09-28T11:52:54.643Z"
    }
  ]
}
```
<!-- workflow-state:end -->

## Состояние

Execution Scope Status: ACTIVE
Delivery Status: IN_PROGRESS
Scope: event-driven-runtime-planning-20260928
Current Task: нет
Revision: 724

## Цель

Подготовить согласованный планировочный документ событийной обработки и предложить три компактные фазы реализации; код и релиз в этом поручении не менять

## Критерии приёмки

- Подготовить согласованный планировочный документ событийной обработки и предложить три компактные фазы реализации; код и релиз в этом поручении не менять

## Микрозадачи

- [DONE] T001: Подготовить и проверить контракт перехода на события и три компактные фазы — Завершено
  - Git Commit: [DONE] feat: Подготовить и проверить контракт перехода на события и три компактные фазы
  - Reference: event-driven-runtime-planning-20260928 / T001 / implementation
  - Файлы: docs/planning/event-driven-runtime.md, docs/MODULES.md, docs/DOCUMENTATION_INDEX.md, docs/architecture/OVERVIEW.md
- [DONE] T002: Уточнить границы фаз, ревизии черновика, подтверждение requestId и Node Electron — Завершено
  - Git Commit: [DONE] feat: Уточнить границы фаз, ревизии черновика, подтверждение requestId и Node Electron
  - Reference: event-driven-runtime-planning-20260928 / T002 / implementation
  - Файлы: docs/planning/event-driven-runtime.md
- [TODO] DOCS: Актуализация всех документов проекта — Ожидает
  - Git Commit: [PENDING] docs: актуализировать контекст проекта
  - Reference: event-driven-runtime-planning-20260928 / DOCS / implementation
  - Файлы: docs/planning/event-driven-runtime.md, docs/PRODUCT.md, docs/architecture/ARCHITECTURE.md, docs/MODULES.md, docs/DOCUMENTATION_INDEX.md, docs/architecture/OVERVIEW.md

## Context Pack For This Cycle

- docs/architecture/OVERVIEW.md → Краткая архитектура проекта
- docs/MODULES.md → Модули проекта
- docs/DOCUMENTATION_INDEX.md → Каталог документации
- docs/planning/event-driven-runtime.md

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
