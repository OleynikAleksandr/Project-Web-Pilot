# Активный план — Project Web Pilot

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 162,
  "project_id": "cf944136-d1fc-4bd5-9ea0-e46d1fe230e7",
  "project_name": "Project Web Pilot",
  "scope_id": "web-pilot-compact-diagnostics-005",
  "execution_scope_status": "ACTIVE",
  "delivery_status": "READY_FOR_ACCEPTANCE",
  "objective": "Добавить пассивный диагностический журнал Electron/Chromium для исследования внутреннего auto-compact ChatGPT Web без вмешательства в работу чата и без записи чувствительного содержимого.",
  "acceptance_criteria": [
    "Project Web Pilot постоянно пишет отдельный JSONL-журнал наблюдаемых событий ChatGPT WebContents с точными временными метками.",
    "Журнал включает navigation/load/lifecycle, сетевые request/response, WebSocket/EventSource metadata и периодические безопасные DOM-снимки, но не сохраняет cookies, authorization headers, post bodies или полный текст сообщений.",
    "Payload WebSocket/SSE описывается размером, SHA-256, структурными JSON-ключами и безопасными event/type идентификаторами без сохранения пользовательского текста.",
    "Журнал ротируется и не растёт бесконечно; путь стабилен в userData приложения.",
    "Unit tests и Electron smoke подтверждают создание и полезность журнала; финальная macOS arm64 сборка пересобрана."
  ],
  "approved_scope": {
    "functional_paths": [
      "src/chromium-diagnostics.mjs",
      "tests/chromium-diagnostics.test.mjs",
      "src/main.mjs",
      "tests/electron-smoke.mjs"
    ],
    "documentation_paths": [
      "docs/PRODUCT.md",
      "docs/DECISIONS.md",
      "docs/architecture/ARCHITECTURE.md",
      "docs/VERIFICATION.md",
      "docs/WORKFLOW_START.md"
    ],
    "max_functional_files_per_task": 3
  },
  "baseline_commit": "ae2bbb19efa2c7f62da8d341a93820851699ab0f",
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
        "src/chromium-diagnostics.mjs",
        "tests/chromium-diagnostics.test.mjs"
      ],
      "documentation_paths": [
        "docs/DECISIONS.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "suite"
      ],
      "id": "T001",
      "title": "Реализовать безопасный журнал Chromium",
      "why": "Сначала нужен изолированный, тестируемый сборщик событий с гарантированным удалением чувствительных данных.",
      "acceptance_criteria": [
        "Модуль пишет JSONL последовательно, ротирует файл и не логирует значения query/header/body.",
        "URL сохраняется как origin/path и имена query-параметров без значений.",
        "WebSocket/SSE payload metadata содержит размер/hash/структурные ключи и только безопасные identifier-поля.",
        "Unit tests проверяют redaction, payload metadata и rotation."
      ],
      "expected_commit_message": "feat: добавить безопасный Chromium diagnostics log",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "web-pilot-compact-diagnostics-005",
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
        "tests/electron-smoke.mjs"
      ],
      "documentation_paths": [
        "docs/PRODUCT.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md",
        "docs/WORKFLOW_START.md"
      ],
      "verification_ids": [
        "suite",
        "electron-smoke"
      ],
      "id": "T002",
      "title": "Подключить diagnostics к ChatGPT WebContents",
      "why": "Нужно начать реальное накопление наблюдаемых Electron/CDP/DOM событий до следующего auto-compact.",
      "acceptance_criteria": [
        "На старте ChatGPT WebContents diagnostics подключает CDP Network/Page/Log и native webContents events.",
        "Каждые несколько секунд пишется безопасный DOM pulse: route, количество user/assistant messages, busy/composer/visibility без текста сообщений.",
        "Electron smoke подтверждает diagnostic-session, CDP/native events и DOM pulse в отдельном log-файле.",
        "Закрытие окна корректно flush/stop diagnostics."
      ],
      "expected_commit_message": "feat: логировать события ChatGPT Chromium",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "web-pilot-compact-diagnostics-005",
        "task_id": "T002",
        "role": "implementation"
      }
    }
  ],
  "blocked_reason": null,
  "user_decisions": [
    {
      "id": "ce4b5ea4-9bea-4e29-a932-fae461798541",
      "text": "12.09.2026 пользователь поручил сейчас создать механизм логирования событий Electron/Chrome, накопить журнал до предполагаемого автокомпакта и затем проанализировать его на признаки compact.",
      "recorded_at": "2026-09-12T10:52:26.900Z"
    }
  ]
}
```
<!-- workflow-state:end -->

## Состояние

Execution Scope Status: ACTIVE
Delivery Status: READY_FOR_ACCEPTANCE
Scope: web-pilot-compact-diagnostics-005
Current Task: нет
Revision: 162

## Цель

Добавить пассивный диагностический журнал Electron/Chromium для исследования внутреннего auto-compact ChatGPT Web без вмешательства в работу чата и без записи чувствительного содержимого.

## Критерии приёмки

- Project Web Pilot постоянно пишет отдельный JSONL-журнал наблюдаемых событий ChatGPT WebContents с точными временными метками.
- Журнал включает navigation/load/lifecycle, сетевые request/response, WebSocket/EventSource metadata и периодические безопасные DOM-снимки, но не сохраняет cookies, authorization headers, post bodies или полный текст сообщений.
- Payload WebSocket/SSE описывается размером, SHA-256, структурными JSON-ключами и безопасными event/type идентификаторами без сохранения пользовательского текста.
- Журнал ротируется и не растёт бесконечно; путь стабилен в userData приложения.
- Unit tests и Electron smoke подтверждают создание и полезность журнала; финальная macOS arm64 сборка пересобрана.

## Микрозадачи

- [DONE] T001: Реализовать безопасный журнал Chromium — Завершено
  - Git Commit: [DONE] feat: добавить безопасный Chromium diagnostics log
  - Reference: web-pilot-compact-diagnostics-005 / T001 / implementation
  - Файлы: src/chromium-diagnostics.mjs, tests/chromium-diagnostics.test.mjs, docs/DECISIONS.md, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md
- [DONE] T002: Подключить diagnostics к ChatGPT WebContents — Завершено
  - Git Commit: [DONE] feat: логировать события ChatGPT Chromium
  - Reference: web-pilot-compact-diagnostics-005 / T002 / implementation
  - Файлы: src/main.mjs, tests/electron-smoke.mjs, docs/PRODUCT.md, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md, docs/WORKFLOW_START.md

## Context Pack For This Cycle

- docs/PRODUCT.md → Продукт
- docs/architecture/ARCHITECTURE.md → Архитектура

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
