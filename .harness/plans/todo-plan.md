# Активный план — Project Web Pilot

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 170,
  "project_id": "cf944136-d1fc-4bd5-9ea0-e46d1fe230e7",
  "project_name": "Project Web Pilot",
  "scope_id": "web-pilot-context-window-indicator-007",
  "execution_scope_status": "ACTIVE",
  "delivery_status": "IN_PROGRESS",
  "objective": "Найти фактические служебные данные контекстного окна ChatGPT Web в Chromium-потоке и вывести в левом сайдбаре индикатор заполнения, не сохраняя текст разговора и не подменяя реальные данные оценкой.",
  "acceptance_criteria": [
    "Diagnostics безопасно обнаруживает candidate key paths и числовые token/context/usage/window значения внутри реальных ChatGPT Web stream-item/SSE без сохранения текста сообщений.",
    "Когда найдены фактические input token usage и context window, приложение хранит последнее наблюдение и вычисляет процент заполнения; при отсутствии пары данных показывает unknown, а не оценку.",
    "Левый sidebar содержит компактный индикатор контекстного окна с числом/процентом при подтверждённых данных и понятным состоянием ожидания иначе.",
    "Прямые/косвенные compact signals продолжают журналироваться, но этот scope не запускает автоматическое обновление контекста.",
    "Unit tests, Electron smoke и macOS arm64 build проходят."
  ],
  "approved_scope": {
    "functional_paths": [
      "src/chromium-diagnostics.mjs",
      "src/main.mjs",
      "src/ui/index.html",
      "src/ui/sidebar.mjs",
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
  "baseline_commit": "3f419b749f9e6e8cc6dc189878e3780453bbff75",
  "current_task_id": null,
  "context_pack": {
    "documents": [
      {
        "path": "docs/PRODUCT.md",
        "heading_path": [
          "Целевая context telemetry — scope 006"
        ],
        "required": true,
        "revision": "WORKTREE"
      },
      {
        "path": "docs/architecture/ARCHITECTURE.md",
        "heading_path": [
          "ChatGPT stream telemetry — scope 006 / T002"
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
      "title": "Расширить безопасное обнаружение полей Web stream",
      "why": "Реальный /backend-api/f/conversation уже дал telemetryFound=false, а WebSocket несёт stream-item без известных Codex token_count; нужны безопасные structural candidate paths.",
      "acceptance_criteria": [
        "Парсер рекурсивно фиксирует только имена candidate keys/path и конечные числовые значения для ключей, содержащих token/context/usage/window/compact, не записывая произвольные строковые значения.",
        "На JSON/WebSocket/SSE fixture с альтернативными Web-style именами candidate discovery находит числа и marker presence, а message/content/summary остаются отсутствующими в сериализованном результате.",
        "Существующая telemetry по точным Codex-полям остаётся совместимой."
      ],
      "expected_commit_message": "feat: обнаруживать context поля Web stream",
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "web-pilot-context-window-indicator-007",
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
        "src/main.mjs"
      ],
      "documentation_paths": [
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "suite"
      ],
      "id": "T002",
      "title": "Хранить последнее наблюдение context window",
      "why": "Sidebar нужен канонический локальный state последней подтверждённой пары usage/window независимо от ротации JSONL.",
      "acceptance_criteria": [
        "ChromiumDiagnostics публикует безопасный latestContextObservation только из фактической telemetry, с inputTokens/modelContextWindow/usedPercent/source/observedAt/compactSignal.",
        "При неполных или неизвестных данных state остаётся unknown и не вычисляет процент.",
        "Main snapshot передаёт sidebar только этот безопасный state, без raw payload и conversation text."
      ],
      "expected_commit_message": "feat: публиковать состояние context window",
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "web-pilot-context-window-indicator-007",
        "task_id": "T002",
        "role": "implementation"
      }
    },
    {
      "dependencies": [
        "T002"
      ],
      "functional_paths": [
        "src/ui/index.html",
        "src/ui/sidebar.mjs",
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
      "id": "T003",
      "title": "Показать индикатор контекстного окна в sidebar",
      "why": "Пользователь хочет видеть заполнение контекстного окна во время работы и до наступления auto-compact.",
      "acceptance_criteria": [
        "В sidebar отображается компактная строка/полоса Контекстное окно.",
        "При known state показаны inputTokens/modelContextWindow и usedPercent; при unknown — Ожидаем данные без фиктивного процента.",
        "Renderer не читает diagnostic file напрямую и не получает raw network data.",
        "Electron smoke проверяет known и unknown representation; macOS arm64 build создан."
      ],
      "expected_commit_message": "feat: показать context window в sidebar",
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "web-pilot-context-window-indicator-007",
        "task_id": "T003",
        "role": "implementation"
      }
    }
  ],
  "blocked_reason": null,
  "user_decisions": [
    {
      "id": "0abcaa98-375c-4cc6-875a-9ca7035f9a48",
      "text": "12.09.2026 пользователь определил следующий план: искать необходимую информацию в накопленных Chromium/Electron логах, разобраться с context window и сделать его индикатор в левом sidebar; auto-compact пока только наблюдать.",
      "recorded_at": "2026-09-12T11:32:41.067Z"
    }
  ]
}
```
<!-- workflow-state:end -->

## Состояние

Execution Scope Status: ACTIVE
Delivery Status: IN_PROGRESS
Scope: web-pilot-context-window-indicator-007
Current Task: нет
Revision: 170

## Цель

Найти фактические служебные данные контекстного окна ChatGPT Web в Chromium-потоке и вывести в левом сайдбаре индикатор заполнения, не сохраняя текст разговора и не подменяя реальные данные оценкой.

## Критерии приёмки

- Diagnostics безопасно обнаруживает candidate key paths и числовые token/context/usage/window значения внутри реальных ChatGPT Web stream-item/SSE без сохранения текста сообщений.
- Когда найдены фактические input token usage и context window, приложение хранит последнее наблюдение и вычисляет процент заполнения; при отсутствии пары данных показывает unknown, а не оценку.
- Левый sidebar содержит компактный индикатор контекстного окна с числом/процентом при подтверждённых данных и понятным состоянием ожидания иначе.
- Прямые/косвенные compact signals продолжают журналироваться, но этот scope не запускает автоматическое обновление контекста.
- Unit tests, Electron smoke и macOS arm64 build проходят.

## Микрозадачи

- [TODO] T001: Расширить безопасное обнаружение полей Web stream — Ожидает
  - Git Commit: [PENDING] feat: обнаруживать context поля Web stream
  - Reference: web-pilot-context-window-indicator-007 / T001 / implementation
  - Файлы: src/chromium-diagnostics.mjs, tests/chromium-diagnostics.test.mjs, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md
- [TODO] T002: Хранить последнее наблюдение context window — Ожидает
  - Git Commit: [PENDING] feat: публиковать состояние context window
  - Reference: web-pilot-context-window-indicator-007 / T002 / implementation
  - Файлы: src/chromium-diagnostics.mjs, src/main.mjs, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md
- [TODO] T003: Показать индикатор контекстного окна в sidebar — Ожидает
  - Git Commit: [PENDING] feat: показать context window в sidebar
  - Reference: web-pilot-context-window-indicator-007 / T003 / implementation
  - Файлы: src/ui/index.html, src/ui/sidebar.mjs, tests/electron-smoke.mjs, docs/PRODUCT.md, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md, docs/WORKFLOW_START.md

## Context Pack For This Cycle

- docs/PRODUCT.md → Целевая context telemetry — scope 006
- docs/architecture/ARCHITECTURE.md → ChatGPT stream telemetry — scope 006 / T002

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
