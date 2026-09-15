# Активный план — Project Web Pilot

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 371,
  "project_id": "cf944136-d1fc-4bd5-9ea0-e46d1fe230e7",
  "project_name": "Project Web Pilot",
  "scope_id": "scope-014",
  "execution_scope_status": "ACTIVE",
  "delivery_status": "IN_PROGRESS",
  "objective": "Новая сессия после приёмки плана",
  "acceptance_criteria": [
    "После штатного архивирования завершённого плана появляется вопрос о Chat или Work",
    "Выбор открывает ровно одну новую сессию того же проекта с актуальным полным recovery",
    "Переход работает после кнопки Принять и прямой команды агенту, сохраняется после restart",
    "Готовность к приёмке сама по себе не закрывает scope; новый scope автоматически не создаётся",
    "Релиз 0.6.14 macOS/Windows собран; реальная приёмка пользователем"
  ],
  "approved_scope": {
    "functional_paths": [
      "src/workspace-session.mjs",
      "tests/workspace-session.test.mjs",
      "src/main.mjs",
      "src/preload.cjs",
      "src/ui/sidebar.mjs",
      "src/ui/index.html",
      "tests/electron-smoke.mjs",
      "package.json",
      "package-lock.json"
    ],
    "documentation_paths": [
      "docs/modules/workspace-sessions.md",
      "docs/modules/workflow-kit-recovery.md",
      "docs/DECISIONS.md",
      "docs/PRODUCT.md",
      "docs/architecture/ARCHITECTURE.md",
      "docs/VERIFICATION.md",
      "docs/WORKFLOW_START.md"
    ],
    "max_functional_files_per_task": 3
  },
  "baseline_commit": "b1a20c35da16287590b572cdea5a057c79ea0f4d",
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
          "Новая сессия после приёмки плана — scope 014"
        ],
        "required": false,
        "revision": "WORKTREE"
      },
      {
        "path": "docs/modules/workspace-sessions.md",
        "heading_path": [
          "Module Specification — Workspace & Sessions",
          "Session Contract"
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
      "functional_paths": [],
      "documentation_paths": [
        "docs/modules/workspace-sessions.md",
        "docs/modules/workflow-kit-recovery.md",
        "docs/DECISIONS.md",
        "docs/PRODUCT.md"
      ],
      "verification_ids": [],
      "id": "T001",
      "title": "Зафиксировать переход в новую сессию после приёмки",
      "why": "Зафиксировать переход в новую сессию после приёмки",
      "acceptance_criteria": [
        "Зафиксировать переход в новую сессию после приёмки выполнено согласно контракту"
      ],
      "expected_commit_message": "docs: define post-acceptance session transition",
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "scope-014",
        "task_id": "T001",
        "role": "implementation"
      }
    },
    {
      "dependencies": [
        "T001"
      ],
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
      "id": "T002",
      "title": "Сохранить переход и исключить дубли сессий",
      "why": "Сохранить переход и исключить дубли сессий",
      "acceptance_criteria": [
        "Сохранить переход и исключить дубли сессий выполнено согласно контракту"
      ],
      "expected_commit_message": "feat: persist scope session transitions",
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "scope-014",
        "task_id": "T002",
        "role": "implementation"
      }
    },
    {
      "dependencies": [
        "T002"
      ],
      "functional_paths": [
        "src/main.mjs"
      ],
      "documentation_paths": [
        "docs/architecture/ARCHITECTURE.md",
        "docs/modules/workspace-sessions.md"
      ],
      "verification_ids": [
        "syntax"
      ],
      "id": "T003",
      "title": "Связать закрытие плана с открытием новой сессии",
      "why": "Связать закрытие плана с открытием новой сессии",
      "acceptance_criteria": [
        "Связать закрытие плана с открытием новой сессии выполнено согласно контракту"
      ],
      "expected_commit_message": "feat: integrate post-archive session transition",
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "scope-014",
        "task_id": "T003",
        "role": "implementation"
      }
    },
    {
      "dependencies": [
        "T003"
      ],
      "functional_paths": [
        "src/preload.cjs",
        "src/ui/sidebar.mjs",
        "src/ui/index.html"
      ],
      "documentation_paths": [
        "docs/architecture/ARCHITECTURE.md",
        "docs/modules/workspace-sessions.md"
      ],
      "verification_ids": [
        "syntax"
      ],
      "id": "T004",
      "title": "Добавить вопрос о выборе Chat или Work",
      "why": "Добавить вопрос о выборе Chat или Work",
      "acceptance_criteria": [
        "Добавить вопрос о выборе Chat или Work выполнено согласно контракту"
      ],
      "expected_commit_message": "feat: ask for next session experience",
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "scope-014",
        "task_id": "T004",
        "role": "implementation"
      }
    },
    {
      "dependencies": [
        "T004"
      ],
      "functional_paths": [
        "tests/electron-smoke.mjs"
      ],
      "documentation_paths": [
        "docs/VERIFICATION.md",
        "docs/modules/workspace-sessions.md"
      ],
      "verification_ids": [
        "suite",
        "electron-smoke"
      ],
      "id": "T005",
      "title": "Проверить полный переход в Electron",
      "why": "Проверить полный переход в Electron",
      "acceptance_criteria": [
        "Проверить полный переход в Electron выполнено согласно контракту"
      ],
      "expected_commit_message": "test: verify post-acceptance Chat and Work transitions",
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "scope-014",
        "task_id": "T005",
        "role": "implementation"
      }
    },
    {
      "dependencies": [
        "T005"
      ],
      "functional_paths": [
        "package.json",
        "package-lock.json"
      ],
      "documentation_paths": [
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md",
        "docs/WORKFLOW_START.md",
        "docs/modules/workspace-sessions.md"
      ],
      "verification_ids": [
        "syntax"
      ],
      "id": "T006",
      "title": "Собрать релиз 0.6.14 для проверки",
      "why": "Собрать релиз 0.6.14 для проверки",
      "acceptance_criteria": [
        "Собрать релиз 0.6.14 для проверки выполнено согласно контракту"
      ],
      "expected_commit_message": "release: build Web Pilot 0.6.14",
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "scope-014",
        "task_id": "T006",
        "role": "implementation"
      }
    }
  ],
  "blocked_reason": null,
  "user_decisions": [
    {
      "id": "794f9c07-3362-47dc-a722-7d79622dab2e",
      "text": "15.09.2026 пользователь поручил: после принятия плана агент архивирует scope, затем пользователь выбирает Chat или Work для новой сессии; создать микрозадачи, выполнить их и собрать релиз для проверки. Настоящий scope до пользовательской приёмки остаётся активным.",
      "recorded_at": "2026-09-15T11:31:59.374Z"
    }
  ]
}
```
<!-- workflow-state:end -->

## Состояние

Execution Scope Status: ACTIVE
Delivery Status: IN_PROGRESS
Scope: scope-014
Current Task: нет
Revision: 371

## Цель

Новая сессия после приёмки плана

## Критерии приёмки

- После штатного архивирования завершённого плана появляется вопрос о Chat или Work
- Выбор открывает ровно одну новую сессию того же проекта с актуальным полным recovery
- Переход работает после кнопки Принять и прямой команды агенту, сохраняется после restart
- Готовность к приёмке сама по себе не закрывает scope; новый scope автоматически не создаётся
- Релиз 0.6.14 macOS/Windows собран; реальная приёмка пользователем

## Микрозадачи

- [TODO] T001: Зафиксировать переход в новую сессию после приёмки — Ожидает
  - Git Commit: [PENDING] docs: define post-acceptance session transition
  - Reference: scope-014 / T001 / implementation
  - Файлы: docs/modules/workspace-sessions.md, docs/modules/workflow-kit-recovery.md, docs/DECISIONS.md, docs/PRODUCT.md
- [TODO] T002: Сохранить переход и исключить дубли сессий — Ожидает
  - Git Commit: [PENDING] feat: persist scope session transitions
  - Reference: scope-014 / T002 / implementation
  - Файлы: src/workspace-session.mjs, tests/workspace-session.test.mjs, docs/modules/workspace-sessions.md, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md
- [TODO] T003: Связать закрытие плана с открытием новой сессии — Ожидает
  - Git Commit: [PENDING] feat: integrate post-archive session transition
  - Reference: scope-014 / T003 / implementation
  - Файлы: src/main.mjs, docs/architecture/ARCHITECTURE.md, docs/modules/workspace-sessions.md
- [TODO] T004: Добавить вопрос о выборе Chat или Work — Ожидает
  - Git Commit: [PENDING] feat: ask for next session experience
  - Reference: scope-014 / T004 / implementation
  - Файлы: src/preload.cjs, src/ui/sidebar.mjs, src/ui/index.html, docs/architecture/ARCHITECTURE.md, docs/modules/workspace-sessions.md
- [TODO] T005: Проверить полный переход в Electron — Ожидает
  - Git Commit: [PENDING] test: verify post-acceptance Chat and Work transitions
  - Reference: scope-014 / T005 / implementation
  - Файлы: tests/electron-smoke.mjs, docs/VERIFICATION.md, docs/modules/workspace-sessions.md
- [TODO] T006: Собрать релиз 0.6.14 для проверки — Ожидает
  - Git Commit: [PENDING] release: build Web Pilot 0.6.14
  - Reference: scope-014 / T006 / implementation
  - Файлы: package.json, package-lock.json, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md, docs/WORKFLOW_START.md, docs/modules/workspace-sessions.md

## Context Pack For This Cycle

- docs/architecture/OVERVIEW.md → Краткая архитектура проекта
- docs/modules/workspace-sessions.md → Module Specification — Workspace & Sessions / Новая сессия после приёмки плана — scope 014
- docs/modules/workspace-sessions.md → Module Specification — Workspace & Sessions / Session Contract

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
