# Активный план — Project Web Pilot

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 186,
  "project_id": "cf944136-d1fc-4bd5-9ea0-e46d1fe230e7",
  "project_name": "Project Web Pilot",
  "scope_id": "web-pilot-context-observation-008",
  "execution_scope_status": "ACTIVE",
  "delivery_status": "IN_PROGRESS",
  "objective": "Продолжать реальное наблюдение ChatGPT Web до обнаружения фактического context window и auto-compact: безопасно раскрыть служебные вложенные JSON-envelope WebSocket stream-item и анализировать только структурную/числовую telemetry без текста разговора. Параллельно отделить platform-specific runtime/build слой, чтобы будущая Windows 10/11 версия переиспользовала тот же Chromium/UI/workflow-код.",
  "acceptance_criteria": [
    "Подтверждён фактический источник context-window данных либо зафиксировано, какие наблюдаемые transport-слои их не содержат.",
    "Вложенные JSON-envelope WebSocket/SSE разбираются только для служебной структуры; пользовательский текст и произвольные string values не сохраняются.",
    "При обнаружении фактических input/window значений существующий sidebar-индикатор показывает их без оценочной подстановки.",
    "Scope остаётся активным до реального наблюдения auto-compact или отдельного решения пользователя изменить границы исследования.",
    "macOS-поведение после platform-refactor не меняется; runtime/Node/build различия централизованы и имеют Windows layout tests."
  ],
  "approved_scope": {
    "functional_paths": [
      "src/chromium-diagnostics.mjs",
      "tests/chromium-diagnostics.test.mjs",
      "tests/electron-smoke.mjs",
      "src/platform.mjs",
      "src/mcp-runtime.mjs",
      "tests/mcp-runtime.test.mjs",
      "src/workspace-setup.mjs",
      "tests/workspace-setup.test.mjs",
      "src/main.mjs",
      "package.json"
    ],
    "documentation_paths": [
      "docs/PRODUCT.md",
      "docs/architecture/ARCHITECTURE.md",
      "docs/VERIFICATION.md",
      "docs/WORKFLOW_START.md"
    ],
    "max_functional_files_per_task": 3
  },
  "baseline_commit": "05dbddef371b070f06ac217ffd8de39f2c2a8e10",
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
      "title": "Разбирать вложенные служебные JSON-envelope stream-item",
      "why": "Production-log после scope 007 видит только candidatePresence=token в conversation SSE; WebSocket conversation-turn-stream может нести полезную telemetry в сериализованном JSON внутри строкового envelope.",
      "acceptance_criteria": [
        "Парсер ограниченно распознаёт JSON-object/array в служебных string fields известных stream envelope и повторно применяет безопасный telemetry parser.",
        "Message/content/text/tool-output строки не разбираются как вложенный JSON и не сохраняются.",
        "Unit tests покрывают nested stream-item с context usage и приватным текстом."
      ],
      "expected_commit_message": "feat: разбирать вложенную telemetry Web stream",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "web-pilot-context-observation-008",
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
        "tests/chromium-diagnostics.test.mjs",
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
      "title": "Проверить production context-window telemetry",
      "why": "После новой сборки нужно на реальном ChatGPT Web определить фактические key paths и при необходимости уточнить только безопасный mapping к существующему индикатору.",
      "acceptance_criteria": [
        "После production-наблюдения записаны найденные безопасные candidate paths и установлено, можно ли достоверно получить inputTokens/modelContextWindow.",
        "Если семантика пары подтверждена, она маппится в существующий contextObservation; иначе UI остаётся unknown.",
        "Все тесты и Electron smoke проходят после фактического mapping."
      ],
      "expected_commit_message": "feat: сопоставить context window ChatGPT Web",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "web-pilot-context-observation-008",
        "task_id": "T002",
        "role": "implementation"
      }
    },
    {
      "dependencies": [
        "T002"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/VERIFICATION.md",
        "docs/WORKFLOW_START.md"
      ],
      "verification_ids": [],
      "id": "T003",
      "title": "Наблюдать реальный auto-compact",
      "why": "Нужен фактический production-сигнал compact, а не эмуляция или предположение по порогу.",
      "acceptance_criteria": [
        "В production-log зафиксирован реальный direct compact marker или согласованный набор сильных коррелирующих сигналов до/после compact.",
        "Зафиксированы context-window значения непосредственно до и после compact, если сервер их предоставляет.",
        "Никакая автоматическая отправка Обновить контекст не включается в этом scope без отдельного решения пользователя."
      ],
      "expected_commit_message": "docs: зафиксировать реальный auto-compact",
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "web-pilot-context-observation-008",
        "task_id": "T003",
        "role": "implementation"
      }
    },
    {
      "dependencies": [],
      "functional_paths": [
        "src/platform.mjs",
        "src/mcp-runtime.mjs",
        "tests/mcp-runtime.test.mjs"
      ],
      "documentation_paths": [
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "runtime",
        "suite"
      ],
      "id": "T004",
      "title": "Вынести platform adapter локального MCP runtime",
      "why": "Убрать из runtime-кода прямые macOS layout assumptions и заранее описать Windows layout без изменения поведения macOS.",
      "acceptance_criteria": [
        "Пути Python/control runtime вычисляются через отдельный platform adapter.",
        "Для darwin сохраняется текущий mac-codex-local/.venv/bin/python3; для win32 определён .venv/Scripts/python.exe и нейтральные варианты корня.",
        "Unit tests проверяют darwin и win32 layout без требования реального Windows runtime."
      ],
      "expected_commit_message": "refactor: отделить platform layout MCP runtime",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "web-pilot-context-observation-008",
        "task_id": "T004",
        "role": "implementation"
      }
    },
    {
      "dependencies": [
        "T004"
      ],
      "functional_paths": [
        "src/platform.mjs",
        "src/workspace-setup.mjs",
        "tests/workspace-setup.test.mjs"
      ],
      "documentation_paths": [
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "suite"
      ],
      "id": "T005",
      "title": "Сделать поиск внешнего Node платформенно-независимым",
      "why": "Workspace setup сейчас знает Homebrew-пути macOS; переносимость требует централизовать кандидаты Node для darwin/win32.",
      "acceptance_criteria": [
        "WorkspaceSetup получает список Node candidates из platform adapter.",
        "Текущие macOS Homebrew/local paths сохраняются, Windows candidates используют PATH и стандартные Program Files locations без запуска Windows-specific кода на macOS.",
        "Unit tests покрывают обе платформенные конфигурации."
      ],
      "expected_commit_message": "refactor: отделить platform layout Node runtime",
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "web-pilot-context-observation-008",
        "task_id": "T005",
        "role": "implementation"
      }
    },
    {
      "dependencies": [
        "T004",
        "T005"
      ],
      "functional_paths": [
        "src/platform.mjs",
        "src/main.mjs",
        "package.json"
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
      "id": "T006",
      "title": "Подключить platform boundary в main и build scripts",
      "why": "Главный процесс не должен содержать имя Codex Local Mac как архитектурное предположение, а упаковка должна иметь явные platform targets.",
      "acceptance_criteria": [
        "Default runtime path выбирается platform adapter, macOS default остаётся прежним.",
        "package scripts разделяют build:mac и build:win; npm run build остаётся macOS alias для текущего пользователя.",
        "Electron smoke и полный suite проходят на macOS; Windows build обозначен как packaging target, а не как принятая Windows-версия."
      ],
      "expected_commit_message": "refactor: подготовить platform boundary приложения",
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "web-pilot-context-observation-008",
        "task_id": "T006",
        "role": "implementation"
      }
    }
  ],
  "blocked_reason": null,
  "user_decisions": [
    {
      "id": "848cbdd5-7f04-4776-ac19-09fc612e821e",
      "text": "12.09.2026 пользователь поручил сохранить тот же исследовательский план: собирать из production-логов данные context window и держать наблюдение до появления auto-compact.",
      "recorded_at": "2026-09-12T11:52:10.998Z"
    },
    {
      "id": "portability-user-20260912",
      "text": "12.09.2026 пользователь попросил уже сейчас подкорректировать macOS-код так, чтобы будущий перенос на Windows 10/11 требовал меньше переписывания; текущую macOS-функциональность не менять.",
      "recorded_at": "2026-09-12T15:27:49.324Z"
    }
  ]
}
```
<!-- workflow-state:end -->

## Состояние

Execution Scope Status: ACTIVE
Delivery Status: IN_PROGRESS
Scope: web-pilot-context-observation-008
Current Task: нет
Revision: 186

## Цель

Продолжать реальное наблюдение ChatGPT Web до обнаружения фактического context window и auto-compact: безопасно раскрыть служебные вложенные JSON-envelope WebSocket stream-item и анализировать только структурную/числовую telemetry без текста разговора. Параллельно отделить platform-specific runtime/build слой, чтобы будущая Windows 10/11 версия переиспользовала тот же Chromium/UI/workflow-код.

## Критерии приёмки

- Подтверждён фактический источник context-window данных либо зафиксировано, какие наблюдаемые transport-слои их не содержат.
- Вложенные JSON-envelope WebSocket/SSE разбираются только для служебной структуры; пользовательский текст и произвольные string values не сохраняются.
- При обнаружении фактических input/window значений существующий sidebar-индикатор показывает их без оценочной подстановки.
- Scope остаётся активным до реального наблюдения auto-compact или отдельного решения пользователя изменить границы исследования.
- macOS-поведение после platform-refactor не меняется; runtime/Node/build различия централизованы и имеют Windows layout tests.

## Микрозадачи

- [DONE] T001: Разбирать вложенные служебные JSON-envelope stream-item — Завершено
  - Git Commit: [DONE] feat: разбирать вложенную telemetry Web stream
  - Reference: web-pilot-context-observation-008 / T001 / implementation
  - Файлы: src/chromium-diagnostics.mjs, tests/chromium-diagnostics.test.mjs, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md
- [DONE] T002: Проверить production context-window telemetry — Завершено
  - Git Commit: [DONE] feat: сопоставить context window ChatGPT Web
  - Reference: web-pilot-context-observation-008 / T002 / implementation
  - Файлы: src/chromium-diagnostics.mjs, tests/chromium-diagnostics.test.mjs, tests/electron-smoke.mjs, docs/PRODUCT.md, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md, docs/WORKFLOW_START.md
- [TODO] T003: Наблюдать реальный auto-compact — Ожидает
  - Git Commit: [PENDING] docs: зафиксировать реальный auto-compact
  - Reference: web-pilot-context-observation-008 / T003 / implementation
  - Файлы: docs/VERIFICATION.md, docs/WORKFLOW_START.md
- [DONE] T004: Вынести platform adapter локального MCP runtime — Завершено
  - Git Commit: [DONE] refactor: отделить platform layout MCP runtime
  - Reference: web-pilot-context-observation-008 / T004 / implementation
  - Файлы: src/platform.mjs, src/mcp-runtime.mjs, tests/mcp-runtime.test.mjs, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md
- [TODO] T005: Сделать поиск внешнего Node платформенно-независимым — Ожидает
  - Git Commit: [PENDING] refactor: отделить platform layout Node runtime
  - Reference: web-pilot-context-observation-008 / T005 / implementation
  - Файлы: src/platform.mjs, src/workspace-setup.mjs, tests/workspace-setup.test.mjs, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md
- [TODO] T006: Подключить platform boundary в main и build scripts — Ожидает
  - Git Commit: [PENDING] refactor: подготовить platform boundary приложения
  - Reference: web-pilot-context-observation-008 / T006 / implementation
  - Файлы: src/platform.mjs, src/main.mjs, package.json, docs/PRODUCT.md, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md

## Context Pack For This Cycle

- docs/PRODUCT.md → Продукт
- docs/architecture/ARCHITECTURE.md → Архитектура

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
