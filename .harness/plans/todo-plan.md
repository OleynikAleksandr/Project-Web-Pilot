# Активный план — Project Web Pilot

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 154,
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
    "Electron smoke проверяет переход в closed-state, финальная macOS arm64 сборка пересобрана.",
    "Состояние отправленной приёмки привязано к конкретному scope_id и не переносится на следующий scope того же workspace."
  ],
  "approved_scope": {
    "functional_paths": [
      "src/ui/index.html",
      "src/ui/sidebar.mjs",
      "tests/electron-smoke.mjs",
      "src/main.mjs"
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
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "web-pilot-closed-plan-004",
        "task_id": "T001",
        "role": "implementation"
      }
    },
    {
      "id": "T002",
      "title": "Не переносить Отправлено на следующий scope",
      "why": "Transient-состояние приёмки должно принадлежать конкретному scope, а не всему workspace.",
      "dependencies": [
        "T001"
      ],
      "functional_paths": [
        "src/main.mjs",
        "tests/electron-smoke.mjs"
      ],
      "documentation_paths": [
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md"
      ],
      "acceptance_criteria": [
        "После принятого scope A новый READY_FOR_ACCEPTANCE scope B показывает активную кнопку Принять",
        "planAcceptance публикуется и дедуплицируется только при совпадении workspace и scope_id",
        "Smoke воспроизводит последовательность A sent → B ready"
      ],
      "verification_ids": [
        "suite",
        "electron-smoke"
      ],
      "expected_commit_message": "fix: сбрасывать приёмку между scope",
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "web-pilot-closed-plan-004",
        "task_id": "T002",
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
    },
    {
      "id": "acceptance-scope-binding-20260912",
      "text": "12.09.2026 пользователь сообщил, что новый завершённый план ошибочно показывает «Отправлено» вместо «Принять»; состояние приёмки должно сбрасываться для каждого нового scope.",
      "recorded_at": "2026-09-12T10:05:08Z"
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
Revision: 154

## Цель

После штатной приёмки и архивирования scope явно показывать в карточке План, что scope завершён и проект готов к следующему новому плану.

## Критерии приёмки

- При NONE с archived_scope_id карточка План показывает «Scope завершён и архивирован».
- Под статусом показывается «Проект готов к следующему новому плану.»
- Проект без archived_scope_id по-прежнему показывает «План ещё не создан».
- Electron smoke проверяет переход в closed-state, финальная macOS arm64 сборка пересобрана.
- Состояние отправленной приёмки привязано к конкретному scope_id и не переносится на следующий scope того же workspace.

## Микрозадачи

- [DONE] T001: Показать завершённый scope в карточке План — Завершено
  - Git Commit: [DONE] feat: показать завершённый scope в плане
  - Reference: web-pilot-closed-plan-004 / T001 / implementation
  - Файлы: src/ui/index.html, src/ui/sidebar.mjs, tests/electron-smoke.mjs, docs/PRODUCT.md, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md
- [TODO] T002: Не переносить Отправлено на следующий scope — Ожидает
  - Git Commit: [PENDING] fix: сбрасывать приёмку между scope
  - Reference: web-pilot-closed-plan-004 / T002 / implementation
  - Файлы: src/main.mjs, tests/electron-smoke.mjs, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md

## Context Pack For This Cycle

- docs/PRODUCT.md → Продукт
- docs/architecture/ARCHITECTURE.md → Архитектура

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
