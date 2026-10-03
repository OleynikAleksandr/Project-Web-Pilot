# Активный план — Project Web Pilot

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 940,
  "project_id": "cf944136-d1fc-4bd5-9ea0-e46d1fe230e7",
  "project_name": "Project Web Pilot",
  "scope_id": "github-publication-0.6.77-20261002",
  "execution_scope_status": "ACTIVE",
  "delivery_status": "READY_FOR_ACCEPTANCE",
  "objective": "Актуализировать README Project Web Pilot и WorkflowKit, синхронизировать оба репозитория с GitHub и опубликовать проверенные актуальные релизы без пересборки.",
  "acceptance_criteria": [
    "Актуализировать README Project Web Pilot и WorkflowKit, синхронизировать оба репозитория с GitHub и опубликовать проверенные актуальные релизы без пересборки."
  ],
  "approved_scope": {
    "functional_paths": [],
    "documentation_paths": [
      "docs/planning/github-publication-0.6.77.md",
      "README.md",
      "AGENTS.md",
      "docs/WORKFLOW_START.md",
      "docs/RELEASE.md",
      "docs/VERIFICATION.md",
      "docs/DOCUMENTATION_INDEX.md",
      "docs/TRANSFER_TO_WINDOWS.md",
      "docs/PRODUCT.md",
      "docs/architecture/ARCHITECTURE.md",
      "docs/architecture/OVERVIEW.md",
      "docs/MODULES.md",
      "docs/planning/auto-plan-client-driven-refactor.md",
      "docs/CLEAN_INSTALL.md",
      "docs/DECISIONS.md"
    ]
  },
  "baseline_commit": "0a78bf366e65ad35fed3332c43eda3aa3cddf9b2",
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
        "path": "docs/planning/github-publication-0.6.77.md",
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
        "scope_id": "github-publication-0.6.77-20261002",
        "task_id": "T001",
        "role": "implementation"
      },
      "dependencies": [],
      "functional_paths": [],
      "documentation_paths": [
        "docs/planning/github-publication-0.6.77.md",
        "README.md",
        "AGENTS.md",
        "docs/WORKFLOW_START.md",
        "docs/RELEASE.md",
        "docs/VERIFICATION.md",
        "docs/DOCUMENTATION_INDEX.md",
        "docs/TRANSFER_TO_WINDOWS.md",
        "docs/architecture/OVERVIEW.md",
        "docs/planning/auto-plan-client-driven-refactor.md"
      ],
      "verification_ids": [],
      "id": "T001",
      "title": "Опубликовать принятую поставку Project Web Pilot 0.6.77",
      "why": "Опубликовать принятую поставку Project Web Pilot 0.6.77",
      "verification_kind": "code",
      "acceptance_criteria": [
        "README отражает принятую 0.6.77 и актуальные ссылки",
        "main синхронизирован с GitHub; v0.6.77 указывает на проверенный build commit",
        "Публичный GitHub Release содержит оба ZIP и три metadata-файла с совпадающими размерами/SHA-256"
      ],
      "expected_commit_message": "docs: опубликовать принятую поставку Web Pilot 0.6.77",
      "actual_files": [
        "AGENTS.md",
        "README.md",
        "docs/DOCUMENTATION_INDEX.md",
        "docs/RELEASE.md",
        "docs/TRANSFER_TO_WINDOWS.md",
        "docs/VERIFICATION.md",
        "docs/WORKFLOW_START.md",
        "docs/architecture/OVERVIEW.md",
        "docs/planning/auto-plan-client-driven-refactor.md",
        "docs/planning/github-publication-0.6.77.md"
      ]
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "github-publication-0.6.77-20261002",
        "task_id": "T002",
        "role": "implementation"
      },
      "dependencies": [],
      "functional_paths": [],
      "documentation_paths": [
        "docs/planning/github-publication-0.6.77.md",
        "docs/RELEASE.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [],
      "id": "T002",
      "title": "Актуализировать и синхронизировать WorkflowKit",
      "why": "Актуализировать и синхронизировать WorkflowKit",
      "verification_kind": "code",
      "acceptance_criteria": [
        "README canonical WorkflowKit описывает интеграцию с Web Pilot 0.6.77",
        "WorkflowKit main отправлен и совпадает с локальным Git",
        "Опубликованный v1.5.1 сохранён; версия и runtime не меняются"
      ],
      "expected_commit_message": "docs: подтвердить публикацию актуального WorkflowKit",
      "actual_files": [
        "docs/RELEASE.md",
        "docs/VERIFICATION.md",
        "docs/planning/github-publication-0.6.77.md"
      ]
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "github-publication-0.6.77-20261002",
        "task_id": "DOCS",
        "role": "implementation"
      },
      "dependencies": [
        "T001",
        "T002"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/planning/github-publication-0.6.77.md",
        "docs/PRODUCT.md",
        "docs/architecture/ARCHITECTURE.md",
        "README.md",
        "AGENTS.md",
        "docs/WORKFLOW_START.md",
        "docs/RELEASE.md",
        "docs/VERIFICATION.md",
        "docs/DOCUMENTATION_INDEX.md",
        "docs/TRANSFER_TO_WINDOWS.md",
        "docs/architecture/OVERVIEW.md",
        "docs/MODULES.md",
        "docs/planning/auto-plan-client-driven-refactor.md",
        "docs/CLEAN_INSTALL.md",
        "docs/DECISIONS.md"
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
        "AGENTS.md",
        "README.md",
        "docs/CLEAN_INSTALL.md",
        "docs/DECISIONS.md",
        "docs/DOCUMENTATION_INDEX.md",
        "docs/MODULES.md",
        "docs/VERIFICATION.md",
        "docs/WORKFLOW_START.md",
        "docs/architecture/OVERVIEW.md",
        "docs/planning/github-publication-0.6.77.md"
      ]
    }
  ],
  "blocked_reason": null,
  "user_decisions": [
    {
      "id": "2dab0901-b01a-4c56-b4cf-30e03d7da673",
      "text": "Пользователь поручил выполнить описанную задачу и план.",
      "recorded_at": "2026-10-02T19:20:11.182Z"
    }
  ]
}
```
<!-- workflow-state:end -->

## Состояние

Execution Scope Status: ACTIVE
Delivery Status: READY_FOR_ACCEPTANCE
Scope: github-publication-0.6.77-20261002
Current Task: нет
Revision: 940

## Цель

Актуализировать README Project Web Pilot и WorkflowKit, синхронизировать оба репозитория с GitHub и опубликовать проверенные актуальные релизы без пересборки.

## Критерии приёмки

- Актуализировать README Project Web Pilot и WorkflowKit, синхронизировать оба репозитория с GitHub и опубликовать проверенные актуальные релизы без пересборки.

## Микрозадачи

- [DONE] T001: Опубликовать принятую поставку Project Web Pilot 0.6.77 — Завершено
  - Git Commit: [DONE] docs: опубликовать принятую поставку Web Pilot 0.6.77
  - Reference: github-publication-0.6.77-20261002 / T001 / implementation
  - Файлы: docs/planning/github-publication-0.6.77.md, README.md, AGENTS.md, docs/WORKFLOW_START.md, docs/RELEASE.md, docs/VERIFICATION.md, docs/DOCUMENTATION_INDEX.md, docs/TRANSFER_TO_WINDOWS.md, docs/architecture/OVERVIEW.md, docs/planning/auto-plan-client-driven-refactor.md
- [DONE] T002: Актуализировать и синхронизировать WorkflowKit — Завершено
  - Git Commit: [DONE] docs: подтвердить публикацию актуального WorkflowKit
  - Reference: github-publication-0.6.77-20261002 / T002 / implementation
  - Файлы: docs/planning/github-publication-0.6.77.md, docs/RELEASE.md, docs/VERIFICATION.md
- [DONE] DOCS: Актуализация всех документов проекта — Завершено
  - Git Commit: [DONE] docs: актуализировать контекст проекта
  - Reference: github-publication-0.6.77-20261002 / DOCS / implementation
  - Файлы: docs/planning/github-publication-0.6.77.md, docs/PRODUCT.md, docs/architecture/ARCHITECTURE.md, README.md, AGENTS.md, docs/WORKFLOW_START.md, docs/RELEASE.md, docs/VERIFICATION.md, docs/DOCUMENTATION_INDEX.md, docs/TRANSFER_TO_WINDOWS.md, docs/architecture/OVERVIEW.md, docs/MODULES.md, docs/planning/auto-plan-client-driven-refactor.md, docs/CLEAN_INSTALL.md, docs/DECISIONS.md

## Context Pack For This Cycle

- docs/architecture/OVERVIEW.md → Краткая архитектура проекта
- docs/MODULES.md → Модули проекта
- docs/DOCUMENTATION_INDEX.md → Каталог документации
- docs/planning/github-publication-0.6.77.md

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
