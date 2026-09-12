# Активный план — Project Web Pilot

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 168,
  "project_id": "cf944136-d1fc-4bd5-9ea0-e46d1fe230e7",
  "project_name": "Project Web Pilot",
  "scope_id": "web-pilot-context-telemetry-006",
  "execution_scope_status": "ACTIVE",
  "delivery_status": "READY_FOR_ACCEPTANCE",
  "objective": "Преобразовать Chromium diagnostics в целевую телеметрию контекстного окна ChatGPT Web: безопасно извлекать token/context usage и прямые признаки auto-compact из WebSocket/SSE/служебных ответов без сохранения текста разговора.",
  "acceptance_criteria": [
    "Парсер распознаёт известные по Codex служебные поля token_count, last_token_usage, input_tokens, model_context_window и прямые compact-маркеры compacted/ContextCompaction/compaction_response_id.",
    "Из WebSocket и text/event-stream извлекаются только разрешённые числовые context/token-поля и compact identifiers; сырой текст сообщений и полный payload не записываются.",
    "Для /backend-api/f/conversation после завершения ответа diagnostics пытается безопасно разобрать response body в памяти и пишет только telemetry summary.",
    "Журнал позволяет построить временную серию input_tokens/model_context_window и отдельно фиксирует прямой или косвенный compact signal.",
    "Unit tests и Electron smoke проходят; macOS arm64 сборка пересобрана для длительного наблюдения."
  ],
  "approved_scope": {
    "functional_paths": [
      "src/chromium-diagnostics.mjs",
      "tests/chromium-diagnostics.test.mjs",
      "tests/electron-smoke.mjs"
    ],
    "documentation_paths": [
      "docs/PRODUCT.md",
      "docs/architecture/ARCHITECTURE.md",
      "docs/VERIFICATION.md",
      "docs/WORKFLOW_START.md"
    ],
    "max_functional_files_per_task": 3
  },
  "baseline_commit": "1f668e735bb41e5ee60aa2850191127a23c98ab8",
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
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "suite"
      ],
      "id": "T001",
      "title": "Извлекать context/token/compact telemetry из payload",
      "why": "Сначала нужен строгий безопасный парсер известных серверных полей без сохранения текста разговора.",
      "acceptance_criteria": [
        "Парсер находит числовые поля input_tokens/cached_input_tokens/output_tokens/reasoning_output_tokens/total_tokens/model_context_window во вложенных JSON/SSE структурах.",
        "Распознаются type=token_count, type=compacted, item.type=ContextCompaction и наличие compaction_response_id/window identifiers.",
        "В telemetry output отсутствуют произвольные строки, message/content/replacement_history и другие текстовые значения.",
        "Unit tests используют образцы структуры из нативного Codex JSONL и проверяют redaction."
      ],
      "expected_commit_message": "feat: извлекать context telemetry из Chromium payload",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "web-pilot-context-telemetry-006",
        "task_id": "T001",
        "role": "implementation"
      }
    },
    {
      "dependencies": [
        "T001"
      ],
      "functional_paths": [
        "src/chromium-diagnostics.mjs",
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
      "title": "Разбирать служебный stream ChatGPT Web",
      "why": "Основной /backend-api/f/conversation отвечает text/event-stream, поэтому context metadata может находиться в fetch stream, а не только в WebSocket frames.",
      "acceptance_criteria": [
        "Diagnostics отслеживает только релевантные ChatGPT conversation stream requestId и после loadingFinished получает response body через CDP без логирования raw body.",
        "SSE body разбирается в памяти и в JSONL пишется отдельная telemetry запись с найденными token/context/compact полями либо безопасный факт отсутствия telemetry.",
        "WebSocket frames используют тот же telemetry parser и могут фиксировать compact/token сигналы немедленно.",
        "Electron smoke подтверждает telemetry extraction и отсутствие пользовательского текста в diagnostic log."
      ],
      "expected_commit_message": "feat: наблюдать context telemetry ChatGPT stream",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "web-pilot-context-telemetry-006",
        "task_id": "T002",
        "role": "implementation"
      }
    }
  ],
  "blocked_reason": null,
  "user_decisions": [
    {
      "id": "39e4e3af-f025-4af0-b55a-8f74aa44dfbf",
      "text": "12.09.2026 пользователь поручил искать в потоке Chromium/Electron данные использования context window и момент auto-compact, адаптировать логирование под эти сигналы и затем наблюдать реальную сессию.",
      "recorded_at": "2026-09-12T11:17:34.318Z"
    }
  ]
}
```
<!-- workflow-state:end -->

## Состояние

Execution Scope Status: ACTIVE
Delivery Status: READY_FOR_ACCEPTANCE
Scope: web-pilot-context-telemetry-006
Current Task: нет
Revision: 168

## Цель

Преобразовать Chromium diagnostics в целевую телеметрию контекстного окна ChatGPT Web: безопасно извлекать token/context usage и прямые признаки auto-compact из WebSocket/SSE/служебных ответов без сохранения текста разговора.

## Критерии приёмки

- Парсер распознаёт известные по Codex служебные поля token_count, last_token_usage, input_tokens, model_context_window и прямые compact-маркеры compacted/ContextCompaction/compaction_response_id.
- Из WebSocket и text/event-stream извлекаются только разрешённые числовые context/token-поля и compact identifiers; сырой текст сообщений и полный payload не записываются.
- Для /backend-api/f/conversation после завершения ответа diagnostics пытается безопасно разобрать response body в памяти и пишет только telemetry summary.
- Журнал позволяет построить временную серию input_tokens/model_context_window и отдельно фиксирует прямой или косвенный compact signal.
- Unit tests и Electron smoke проходят; macOS arm64 сборка пересобрана для длительного наблюдения.

## Микрозадачи

- [DONE] T001: Извлекать context/token/compact telemetry из payload — Завершено
  - Git Commit: [DONE] feat: извлекать context telemetry из Chromium payload
  - Reference: web-pilot-context-telemetry-006 / T001 / implementation
  - Файлы: src/chromium-diagnostics.mjs, tests/chromium-diagnostics.test.mjs, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md
- [DONE] T002: Разбирать служебный stream ChatGPT Web — Завершено
  - Git Commit: [DONE] feat: наблюдать context telemetry ChatGPT stream
  - Reference: web-pilot-context-telemetry-006 / T002 / implementation
  - Файлы: src/chromium-diagnostics.mjs, tests/electron-smoke.mjs, docs/PRODUCT.md, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md, docs/WORKFLOW_START.md

## Context Pack For This Cycle

- docs/PRODUCT.md → Продукт
- docs/architecture/ARCHITECTURE.md → Архитектура

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
