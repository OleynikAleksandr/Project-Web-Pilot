# Активный план — Project Web Pilot

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 367,
  "project_id": "cf944136-d1fc-4bd5-9ea0-e46d1fe230e7",
  "project_name": "Project Web Pilot",
  "scope_id": "project-session-renaming-013",
  "execution_scope_status": "ACTIVE",
  "delivery_status": "IN_PROGRESS",
  "objective": "Переименование проектов и сессий",
  "acceptance_criteria": [
    "Пользователь может переименовать проект из его меню и сессию из её меню",
    "Новый scope автоматически именует только текущую сессию и не требует отдельного MCP-инструмента",
    "Явные локальные имена не перезаписываются заголовком страницы ChatGPT",
    "Изменения сохраняются после перезапуска и новый macOS/Windows релиз собран"
  ],
  "approved_scope": {
    "functional_paths": [
      "src/workspace-session.mjs",
      "src/preload.cjs",
      "src/main.mjs",
      "src/ui/sidebar.mjs",
      "tests/workspace-session.test.mjs",
      "tests/electron-smoke.mjs",
      "package.json",
      "package-lock.json"
    ],
    "documentation_paths": [
      "docs/modules/workspace-sessions.md",
      "docs/PRODUCT.md",
      "docs/architecture/ARCHITECTURE.md",
      "docs/VERIFICATION.md",
      "docs/WORKFLOW_START.md"
    ],
    "max_functional_files_per_task": 3
  },
  "baseline_commit": "644399225314a58a0b4791286d9c6408fa825e20",
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
        "path": "docs/modules/workspace-sessions.md",
        "heading_path": [
          "Module Specification — Workspace & Sessions",
          "Переименование проектов и сессий — scope 013"
        ],
        "required": true,
        "revision": "WORKTREE"
      }
    ],
    "include_last_completed_task": false,
    "dependency_task_ids": []
  },
  "tasks": [
    {
      "dependencies": [],
      "functional_paths": [
        "src/workspace-session.mjs",
        "tests/workspace-session.test.mjs"
      ],
      "documentation_paths": [
        "docs/modules/workspace-sessions.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "workspace"
      ],
      "id": "T001",
      "title": "Добавить локальные имена и приоритеты заголовков",
      "why": "Нужна единая persisted-модель для alias проекта, ручного имени session и scope-имени без перезаписи page title.",
      "acceptance_criteria": [
        "Storage сохраняет project display name и источник session title",
        "Новый scope можно применить к текущей session ровно один раз на проект",
        "Unit tests покрывают приоритеты и persistence"
      ],
      "expected_commit_message": "feat: добавить локальные имена проектов и сессий",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "project-session-renaming-013",
        "task_id": "T001",
        "role": "implementation"
      }
    },
    {
      "dependencies": [
        "T001"
      ],
      "functional_paths": [
        "src/preload.cjs",
        "src/main.mjs",
        "src/ui/sidebar.mjs"
      ],
      "documentation_paths": [
        "docs/modules/workspace-sessions.md",
        "docs/PRODUCT.md",
        "docs/architecture/ARCHITECTURE.md"
      ],
      "verification_ids": [
        "syntax"
      ],
      "id": "T002",
      "title": "Добавить ручное переименование в меню",
      "why": "Пользователь должен менять названия непосредственно в существующих меню проекта и session.",
      "acceptance_criteria": [
        "В project menu и session menu есть Переименовать",
        "Project rename доступен только через локальный пользовательский IPC",
        "Page title не перетирает явное session name"
      ],
      "expected_commit_message": "feat: добавить переименование в меню",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "project-session-renaming-013",
        "task_id": "T002",
        "role": "implementation"
      }
    },
    {
      "dependencies": [
        "T002"
      ],
      "functional_paths": [
        "src/main.mjs",
        "src/workspace-session.mjs",
        "tests/workspace-session.test.mjs"
      ],
      "documentation_paths": [
        "docs/modules/workspace-sessions.md",
        "docs/PRODUCT.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "workspace",
        "syntax"
      ],
      "id": "T003",
      "title": "Автоматически именовать session по новому scope",
      "why": "После создания конкретного scope текущая session должна получить понятное имя без отдельного управляющего API.",
      "acceptance_criteria": [
        "Новый scope использует objective как имя текущей session",
        "Тот же scope не переименовывает другие sessions после переключения",
        "Следующий scope может дать новое имя текущей session"
      ],
      "expected_commit_message": "feat: именовать сессию по scope",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "project-session-renaming-013",
        "task_id": "T003",
        "role": "implementation"
      }
    },
    {
      "dependencies": [
        "T003"
      ],
      "functional_paths": [
        "tests/electron-smoke.mjs",
        "package.json",
        "package-lock.json"
      ],
      "documentation_paths": [
        "docs/modules/workspace-sessions.md",
        "docs/VERIFICATION.md",
        "docs/WORKFLOW_START.md",
        "docs/architecture/ARCHITECTURE.md"
      ],
      "verification_ids": [
        "suite",
        "electron-smoke"
      ],
      "id": "T004",
      "title": "Проверить UI и собрать релиз 0.6.13",
      "why": "Изменение должно быть проверено через реальный sidebar fixture и поставлено в новом релизе обеих платформ.",
      "acceptance_criteria": [
        "Electron smoke проверяет оба rename menu и scope auto-name",
        "Версия 0.6.13 зафиксирована",
        "macOS arm64 и Windows x64 packages собраны"
      ],
      "expected_commit_message": "chore: собрать Web Pilot 0.6.13 с переименованием",
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "project-session-renaming-013",
        "task_id": "T004",
        "role": "implementation"
      }
    }
  ],
  "blocked_reason": null,
  "user_decisions": [
    {
      "id": "e17eec51-cc7f-4d97-b5a3-80a1789afaa3",
      "text": "Пользователь поручил добавить ручное переименование проекта и сессии, автоматическое имя текущей сессии по новому scope и собрать новый релиз.",
      "recorded_at": "2026-09-15T11:13:40.949Z"
    }
  ]
}
```
<!-- workflow-state:end -->

## Состояние

Execution Scope Status: ACTIVE
Delivery Status: IN_PROGRESS
Scope: project-session-renaming-013
Current Task: нет
Revision: 367

## Цель

Переименование проектов и сессий

## Критерии приёмки

- Пользователь может переименовать проект из его меню и сессию из её меню
- Новый scope автоматически именует только текущую сессию и не требует отдельного MCP-инструмента
- Явные локальные имена не перезаписываются заголовком страницы ChatGPT
- Изменения сохраняются после перезапуска и новый macOS/Windows релиз собран

## Микрозадачи

- [DONE] T001: Добавить локальные имена и приоритеты заголовков — Завершено
  - Git Commit: [DONE] feat: добавить локальные имена проектов и сессий
  - Reference: project-session-renaming-013 / T001 / implementation
  - Файлы: src/workspace-session.mjs, tests/workspace-session.test.mjs, docs/modules/workspace-sessions.md, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md
- [DONE] T002: Добавить ручное переименование в меню — Завершено
  - Git Commit: [DONE] feat: добавить переименование в меню
  - Reference: project-session-renaming-013 / T002 / implementation
  - Файлы: src/preload.cjs, src/main.mjs, src/ui/sidebar.mjs, docs/modules/workspace-sessions.md, docs/PRODUCT.md, docs/architecture/ARCHITECTURE.md
- [DONE] T003: Автоматически именовать session по новому scope — Завершено
  - Git Commit: [DONE] feat: именовать сессию по scope
  - Reference: project-session-renaming-013 / T003 / implementation
  - Файлы: src/main.mjs, src/workspace-session.mjs, tests/workspace-session.test.mjs, docs/modules/workspace-sessions.md, docs/PRODUCT.md, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md
- [TODO] T004: Проверить UI и собрать релиз 0.6.13 — Ожидает
  - Git Commit: [PENDING] chore: собрать Web Pilot 0.6.13 с переименованием
  - Reference: project-session-renaming-013 / T004 / implementation
  - Файлы: tests/electron-smoke.mjs, package.json, package-lock.json, docs/modules/workspace-sessions.md, docs/VERIFICATION.md, docs/WORKFLOW_START.md, docs/architecture/ARCHITECTURE.md

## Context Pack For This Cycle

- docs/architecture/OVERVIEW.md → Краткая архитектура проекта
- docs/modules/workspace-sessions.md → Module Specification — Workspace & Sessions / Переименование проектов и сессий — scope 013

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
