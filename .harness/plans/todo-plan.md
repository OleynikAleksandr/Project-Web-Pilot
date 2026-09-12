# Активный план — Project Web Pilot

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 151,
  "project_id": "cf944136-d1fc-4bd5-9ea0-e46d1fe230e7",
  "project_name": "Project Web Pilot",
  "scope_id": "web-pilot-closed-plan-004",
  "execution_scope_status": "ACTIVE",
  "delivery_status": "IN_PROGRESS",
  "objective": "После штатной приёмки и архивирования scope явно показывать в карточке План, что scope завершён и проект готов к следующему новому плану.",
  "acceptance_criteria": [
    "При NONE с archived_scope_id карточка План показывает «Scope завершён и архивирован».",
    "Под статусом показывается «Проект готов к следующему новому плану.»",
    "Проект без archived_scope_id по-прежнему показывает «План ещё не создан».",
    "Electron smoke проверяет переход в closed-state, финальная macOS arm64 сборка пересобрана."
  ],
  "approved_scope": {
    "functional_paths": [
      "src/ui/index.html",
      "src/ui/sidebar.mjs",
      "tests/electron-smoke.mjs"
    ],
    "documentation_paths": [
      "docs/PRODUCT.md",
      "docs/architecture/ARCHITECTURE.md",
      "docs/VERIFICATION.md"
    ],
    "max_functional_files_per_task": 3
  },
  "baseline_commit": "0a06fd2e264136f321423f584659690af68a9b0d",
  "current_task_id": null,
  "context_pack": {
    "documents": [
      {
        "path": "docs/PRODUCT.md",
        "heading_path": [
          "Продукт"
        ],
        "required": true,
        "revision": "WORKTREE"
      },
      {
        "path": "docs/architecture/ARCHITECTURE.md",
        "heading_path": [
          "Архитектура"
        ],
        "required": true,
        "revision": "WORKTREE"
      }
    ],
    "include_last_completed_task": true,
    "dependency_task_ids": []
  },
  "tasks": [
    {
      "dependencies": [],
      "functional_paths": [
        "src/ui/index.html",
        "src/ui/sidebar.mjs",
        "tests/electron-smoke.mjs"
      ],
      "documentation_paths": [
        "docs/PRODUCT.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "suite",
        "electron-smoke"
      ],
      "id": "T001",
      "title": "Показать завершённый scope в карточке План",
      "why": "После приёмки пользователь должен однозначно видеть, что предыдущий план закрыт и проект готов к следующей задаче.",
      "acceptance_criteria": [
        "closed-state содержит две согласованные пользовательские строки",
        "not-created остаётся отличимым от closed",
        "Electron smoke проверяет closed-state и отсутствие кнопки приёмки в нём"
      ],
      "expected_commit_message": "feat: показать завершённый scope в плане",
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "web-pilot-closed-plan-004",
        "task_id": "T001",
        "role": "implementation"
      }
    }
  ],
  "blocked_reason": null,
  "user_decisions": [
    {
      "id": "6d980d66-ed77-4b2f-8fff-a09ec9850e2a",
      "text": "12.09.2026 пользователь поручил добавить после закрытия scope надписи «Scope завершён и архивирован» и «Проект готов к следующему новому плану.»",
      "recorded_at": "2026-09-12T10:02:35.312Z"
    }
  ]
}
```
<!-- workflow-state:end -->

## Состояние

Execution Scope Status: ACTIVE
Delivery Status: IN_PROGRESS
Scope: web-pilot-closed-plan-004
Current Task: нет
Revision: 151

## Цель

После штатной приёмки и архивирования scope явно показывать в карточке План, что scope завершён и проект готов к следующему новому плану.

## Критерии приёмки

- При NONE с archived_scope_id карточка План показывает «Scope завершён и архивирован».
- Под статусом показывается «Проект готов к следующему новому плану.»
- Проект без archived_scope_id по-прежнему показывает «План ещё не создан».
- Electron smoke проверяет переход в closed-state, финальная macOS arm64 сборка пересобрана.

## Микрозадачи

- [TODO] T001: Показать завершённый scope в карточке План — Ожидает
  - Git Commit: [PENDING] feat: показать завершённый scope в плане
  - Reference: web-pilot-closed-plan-004 / T001 / implementation
  - Файлы: src/ui/index.html, src/ui/sidebar.mjs, tests/electron-smoke.mjs, docs/PRODUCT.md, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md

## Context Pack For This Cycle

- docs/PRODUCT.md → Продукт
- docs/architecture/ARCHITECTURE.md → Архитектура

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
