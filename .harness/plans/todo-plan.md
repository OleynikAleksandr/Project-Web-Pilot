# Активный план — Project Web Pilot

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 978,
  "project_id": "cf944136-d1fc-4bd5-9ea0-e46d1fe230e7",
  "project_name": "Project Web Pilot",
  "scope_id": "github-publication-0.6.80-20261003",
  "execution_scope_status": "ACTIVE",
  "delivery_status": "IN_PROGRESS",
  "objective": "Опубликовать актуальные main трёх связанных репозиториев и GitHub Release Project Web Pilot v0.6.80 с macOS arm64 и Windows x64.",
  "acceptance_criteria": [
    "Опубликовать актуальные main трёх связанных репозиториев и GitHub Release Project Web Pilot v0.6.80 с macOS arm64 и Windows x64."
  ],
  "approved_scope": {
    "functional_paths": [],
    "documentation_paths": [
      "docs/planning/github-publication-0.6.77.md",
      "docs/PRODUCT.md",
      "docs/architecture/ARCHITECTURE.md",
      "docs/architecture/OVERVIEW.md",
      "docs/MODULES.md",
      "docs/DOCUMENTATION_INDEX.md"
    ]
  },
  "baseline_commit": "4fe3a62697aa1f2c07593f2c9db895b3307f9e0a",
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
        "scope_id": "github-publication-0.6.80-20261003",
        "task_id": "T001",
        "role": "implementation"
      },
      "dependencies": [],
      "functional_paths": [],
      "documentation_paths": [
        "docs/planning/github-publication-0.6.77.md"
      ],
      "verification_ids": [
        "workflowkit_remote"
      ],
      "id": "T001",
      "title": "Опубликовать актуальный WorkflowKit main",
      "why": "Опубликовать актуальный WorkflowKit main",
      "verification_kind": "code",
      "acceptance_criteria": [
        "origin/main WorkflowKit совпадает с локальным HEAD"
      ],
      "expected_commit_message": "feat: Опубликовать актуальный WorkflowKit main",
      "actual_files": []
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "github-publication-0.6.80-20261003",
        "task_id": "T002",
        "role": "implementation"
      },
      "dependencies": [],
      "functional_paths": [],
      "documentation_paths": [
        "docs/planning/github-publication-0.6.77.md"
      ],
      "verification_ids": [
        "sidebar_remote"
      ],
      "id": "T002",
      "title": "Опубликовать актуальный Web Pilot Sidebar main",
      "why": "Опубликовать актуальный Web Pilot Sidebar main",
      "verification_kind": "code",
      "acceptance_criteria": [
        "origin/main Web Pilot Sidebar совпадает с локальным HEAD"
      ],
      "expected_commit_message": "feat: Опубликовать актуальный Web Pilot Sidebar main"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "github-publication-0.6.80-20261003",
        "task_id": "T003",
        "role": "implementation"
      },
      "dependencies": [],
      "functional_paths": [],
      "documentation_paths": [
        "docs/planning/github-publication-0.6.77.md"
      ],
      "verification_ids": [
        "webpilot_remote"
      ],
      "id": "T003",
      "title": "Опубликовать актуальный Project Web Pilot main",
      "why": "Опубликовать актуальный Project Web Pilot main",
      "verification_kind": "code",
      "acceptance_criteria": [
        "origin/main Project Web Pilot совпадает с локальным HEAD"
      ],
      "expected_commit_message": "feat: Опубликовать актуальный Project Web Pilot main"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "github-publication-0.6.80-20261003",
        "task_id": "T004",
        "role": "implementation"
      },
      "dependencies": [],
      "functional_paths": [],
      "documentation_paths": [
        "docs/planning/github-publication-0.6.77.md"
      ],
      "verification_ids": [
        "windows_package"
      ],
      "id": "T004",
      "title": "Собрать и проверить Windows x64 0.6.80 для парного релиза",
      "why": "Собрать и проверить Windows x64 0.6.80 для парного релиза",
      "verification_kind": "package",
      "acceptance_criteria": [
        "Windows x64 0.6.80 собран и проходит штатную verify:win"
      ],
      "expected_commit_message": "feat: Собрать и проверить Windows x64 0.6.80 для парного релиза"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "github-publication-0.6.80-20261003",
        "task_id": "T005",
        "role": "implementation"
      },
      "dependencies": [],
      "functional_paths": [],
      "documentation_paths": [
        "docs/planning/github-publication-0.6.77.md"
      ],
      "verification_ids": [
        "github_release"
      ],
      "id": "T005",
      "title": "Опубликовать GitHub Release v0.6.80 с macOS arm64 и Windows x64",
      "why": "Опубликовать GitHub Release v0.6.80 с macOS arm64 и Windows x64",
      "verification_kind": "package",
      "acceptance_criteria": [
        "GitHub Release v0.6.80 опубликован",
        "На GitHub доступны оба ZIP и три metadata assets"
      ],
      "expected_commit_message": "feat: Опубликовать GitHub Release v0.6.80 с macOS arm64 и Windows x64"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "github-publication-0.6.80-20261003",
        "task_id": "DOCS",
        "role": "implementation"
      },
      "dependencies": [
        "T001",
        "T002",
        "T003",
        "T004",
        "T005"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/planning/github-publication-0.6.77.md",
        "docs/PRODUCT.md",
        "docs/architecture/ARCHITECTURE.md",
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
      "id": "203881cf-869d-4fce-829e-4580d4c78b3d",
      "text": "Пользователь поручил выполнить описанную задачу и план.",
      "recorded_at": "2026-10-03T15:08:34.032Z"
    }
  ]
}
```
<!-- workflow-state:end -->

## Состояние

Execution Scope Status: ACTIVE
Delivery Status: IN_PROGRESS
Scope: github-publication-0.6.80-20261003
Current Task: нет
Revision: 978

## Цель

Опубликовать актуальные main трёх связанных репозиториев и GitHub Release Project Web Pilot v0.6.80 с macOS arm64 и Windows x64.

## Критерии приёмки

- Опубликовать актуальные main трёх связанных репозиториев и GitHub Release Project Web Pilot v0.6.80 с macOS arm64 и Windows x64.

## Микрозадачи

- [DONE] T001: Опубликовать актуальный WorkflowKit main — Завершено
  - Git Commit: [DONE] feat: Опубликовать актуальный WorkflowKit main
  - Reference: github-publication-0.6.80-20261003 / T001 / implementation
  - Файлы: docs/planning/github-publication-0.6.77.md
- [TODO] T002: Опубликовать актуальный Web Pilot Sidebar main — Ожидает
  - Git Commit: [PENDING] feat: Опубликовать актуальный Web Pilot Sidebar main
  - Reference: github-publication-0.6.80-20261003 / T002 / implementation
  - Файлы: docs/planning/github-publication-0.6.77.md
- [TODO] T003: Опубликовать актуальный Project Web Pilot main — Ожидает
  - Git Commit: [PENDING] feat: Опубликовать актуальный Project Web Pilot main
  - Reference: github-publication-0.6.80-20261003 / T003 / implementation
  - Файлы: docs/planning/github-publication-0.6.77.md
- [TODO] T004: Собрать и проверить Windows x64 0.6.80 для парного релиза — Ожидает
  - Git Commit: [PENDING] feat: Собрать и проверить Windows x64 0.6.80 для парного релиза
  - Reference: github-publication-0.6.80-20261003 / T004 / implementation
  - Файлы: docs/planning/github-publication-0.6.77.md
- [TODO] T005: Опубликовать GitHub Release v0.6.80 с macOS arm64 и Windows x64 — Ожидает
  - Git Commit: [PENDING] feat: Опубликовать GitHub Release v0.6.80 с macOS arm64 и Windows x64
  - Reference: github-publication-0.6.80-20261003 / T005 / implementation
  - Файлы: docs/planning/github-publication-0.6.77.md
- [TODO] DOCS: Актуализация всех документов проекта — Ожидает
  - Git Commit: [PENDING] docs: актуализировать контекст проекта
  - Reference: github-publication-0.6.80-20261003 / DOCS / implementation
  - Файлы: docs/planning/github-publication-0.6.77.md, docs/PRODUCT.md, docs/architecture/ARCHITECTURE.md, docs/architecture/OVERVIEW.md, docs/MODULES.md, docs/DOCUMENTATION_INDEX.md

## Context Pack For This Cycle

- docs/architecture/OVERVIEW.md → Краткая архитектура проекта
- docs/MODULES.md → Модули проекта
- docs/DOCUMENTATION_INDEX.md → Каталог документации
- docs/planning/github-publication-0.6.77.md

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
