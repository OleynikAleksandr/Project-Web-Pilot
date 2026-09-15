# Активный план — Project Web Pilot

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 410,
  "project_id": "cf944136-d1fc-4bd5-9ea0-e46d1fe230e7",
  "project_name": "Project Web Pilot",
  "scope_id": "context-window-removal-016",
  "execution_scope_status": "ACTIVE",
  "delivery_status": "READY_FOR_ACCEPTANCE",
  "objective": "Полностью убрать из Web Pilot оставшийся индикатор контекстного окна и его отдельную публикацию состояния, сохранив общую Chromium-диагностику и recovery без изменений.",
  "acceptance_criteria": [
    "В левом sidebar отсутствует плашка «Контекстное окно» и связанный progress UI.",
    "Main/sidebar больше не публикуют и не обрабатывают отдельное contextWindow state для этого индикатора.",
    "Chromium diagnostics не содержит observer API, созданный только для публикации индикатора; общая безопасная diagnostics telemetry остаётся работоспособной.",
    "Regression/smoke проверки подтверждают отсутствие индикатора и сохранность остального sidebar/recovery поведения.",
    "Собран новый macOS arm64 и Windows x64 релиз Web Pilot с увеличенной patch-версией."
  ],
  "approved_scope": {
    "functional_paths": [
      "src/ui/index.html",
      "src/ui/sidebar.mjs",
      "src/main.mjs",
      "src/chromium-diagnostics.mjs",
      "tests/electron-smoke.mjs",
      "package.json",
      "package-lock.json"
    ],
    "documentation_paths": [
      "docs/modules/workspace-sessions.md",
      "docs/VERIFICATION.md",
      "docs/architecture/ARCHITECTURE.md",
      "docs/PRODUCT.md",
      "docs/WORKFLOW_START.md"
    ],
    "max_functional_files_per_task": 3
  },
  "baseline_commit": "207b4e89d2fa28c2ffafe435daf2ac7ad6d2ab96",
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
          "Module Specification — Workspace & Sessions"
        ],
        "required": true,
        "revision": "WORKTREE"
      },
      {
        "path": "docs/architecture/ARCHITECTURE.md",
        "heading_path": [],
        "required": false,
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
        "src/ui/index.html",
        "src/ui/sidebar.mjs"
      ],
      "documentation_paths": [
        "docs/modules/workspace-sessions.md",
        "docs/architecture/ARCHITECTURE.md"
      ],
      "verification_ids": [],
      "id": "T001",
      "title": "Удалить индикатор контекстного окна из sidebar",
      "why": "Привести интерфейс к принятому контракту без внутренних лимитов OpenAI и убрать оставшуюся плашку.",
      "acceptance_criteria": [
        "Плашка, стили и renderer-логика context window полностью отсутствуют; спецификация фиксирует отмену индикатора."
      ],
      "expected_commit_message": "fix: удалить индикатор контекстного окна",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "context-window-removal-016",
        "task_id": "T001",
        "role": "implementation"
      }
    },
    {
      "dependencies": [
        "T001"
      ],
      "functional_paths": [
        "src/main.mjs",
        "src/chromium-diagnostics.mjs",
        "tests/electron-smoke.mjs"
      ],
      "documentation_paths": [
        "docs/VERIFICATION.md",
        "docs/architecture/ARCHITECTURE.md"
      ],
      "verification_ids": [],
      "id": "T002",
      "title": "Удалить публикацию состояния индикатора и обновить smoke",
      "why": "Не оставлять мёртвую observer-цепочку и не инициировать лишние sidebar publish из telemetry, сохранив общую диагностику.",
      "acceptance_criteria": [
        "Snapshot не содержит contextWindow, observer API удалён, smoke проверяет отсутствие DOM индикатора и остальная diagnostics telemetry продолжает проходить."
      ],
      "expected_commit_message": "refactor: удалить публикацию context window",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "context-window-removal-016",
        "task_id": "T002",
        "role": "implementation"
      }
    },
    {
      "dependencies": [
        "T002"
      ],
      "functional_paths": [
        "package.json",
        "package-lock.json"
      ],
      "documentation_paths": [
        "docs/modules/workspace-sessions.md",
        "docs/VERIFICATION.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/PRODUCT.md",
        "docs/WORKFLOW_START.md"
      ],
      "verification_ids": [],
      "id": "T003",
      "title": "Собрать Web Pilot 0.6.16",
      "why": "Передать пользователю проверяемый patch release с удалённым индикатором.",
      "acceptance_criteria": [
        "Версия 0.6.16 собрана для macOS arm64 и Windows x64, package verification и обязательные проверки проходят, результаты зафиксированы."
      ],
      "expected_commit_message": "release: build Web Pilot 0.6.16",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "context-window-removal-016",
        "task_id": "T003",
        "role": "implementation"
      }
    }
  ],
  "blocked_reason": null,
  "user_decisions": [
    {
      "id": "49863a09-62b9-4ee7-9f8e-313cc3a6685c",
      "text": "Пользователь прямо поручил убрать плашку «Контекстное окно / Ожидаем данные» полностью, сделать короткий scope и собрать новый релиз.",
      "recorded_at": "2026-09-15T14:35:56.087Z"
    }
  ]
}
```
<!-- workflow-state:end -->

## Состояние

Execution Scope Status: ACTIVE
Delivery Status: READY_FOR_ACCEPTANCE
Scope: context-window-removal-016
Current Task: нет
Revision: 410

## Цель

Полностью убрать из Web Pilot оставшийся индикатор контекстного окна и его отдельную публикацию состояния, сохранив общую Chromium-диагностику и recovery без изменений.

## Критерии приёмки

- В левом sidebar отсутствует плашка «Контекстное окно» и связанный progress UI.
- Main/sidebar больше не публикуют и не обрабатывают отдельное contextWindow state для этого индикатора.
- Chromium diagnostics не содержит observer API, созданный только для публикации индикатора; общая безопасная diagnostics telemetry остаётся работоспособной.
- Regression/smoke проверки подтверждают отсутствие индикатора и сохранность остального sidebar/recovery поведения.
- Собран новый macOS arm64 и Windows x64 релиз Web Pilot с увеличенной patch-версией.

## Микрозадачи

- [DONE] T001: Удалить индикатор контекстного окна из sidebar — Завершено
  - Git Commit: [DONE] fix: удалить индикатор контекстного окна
  - Reference: context-window-removal-016 / T001 / implementation
  - Файлы: src/ui/index.html, src/ui/sidebar.mjs, docs/modules/workspace-sessions.md, docs/architecture/ARCHITECTURE.md
- [DONE] T002: Удалить публикацию состояния индикатора и обновить smoke — Завершено
  - Git Commit: [DONE] refactor: удалить публикацию context window
  - Reference: context-window-removal-016 / T002 / implementation
  - Файлы: src/main.mjs, src/chromium-diagnostics.mjs, tests/electron-smoke.mjs, docs/VERIFICATION.md, docs/architecture/ARCHITECTURE.md
- [DONE] T003: Собрать Web Pilot 0.6.16 — Завершено
  - Git Commit: [DONE] release: build Web Pilot 0.6.16
  - Reference: context-window-removal-016 / T003 / implementation
  - Файлы: package.json, package-lock.json, docs/modules/workspace-sessions.md, docs/VERIFICATION.md, docs/architecture/ARCHITECTURE.md, docs/PRODUCT.md, docs/WORKFLOW_START.md

## Context Pack For This Cycle

- docs/architecture/OVERVIEW.md → Краткая архитектура проекта
- docs/modules/workspace-sessions.md → Module Specification — Workspace & Sessions
- docs/architecture/ARCHITECTURE.md

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
