# Активный план — Project Web Pilot

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 208,
  "project_id": "cf944136-d1fc-4bd5-9ea0-e46d1fe230e7",
  "project_name": "Project Web Pilot",
  "scope_id": "web-pilot-context-observation-008",
  "execution_scope_status": "ACTIVE",
  "delivery_status": "IN_PROGRESS",
  "objective": "Продолжать наблюдение ChatGPT Web до реального auto-compact и параллельно довести Project Web Pilot до самодостаточной Windows 10/11 x64 версии: тот же Electron/Chromium/UI/Workflow Kit, встроенный Codex Local Windows runtime, автоматическая локальная установка и безопасная настройка tunnel.",
  "acceptance_criteria": [
    "Подтверждён фактический источник context-window данных либо зафиксировано, какие наблюдаемые transport-слои их не содержат.",
    "Вложенные JSON-envelope WebSocket/SSE разбираются только для служебной структуры; пользовательский текст и произвольные string values не сохраняются.",
    "При обнаружении фактических input/window значений существующий sidebar-индикатор показывает их без оценочной подстановки.",
    "Scope остаётся активным до реального наблюдения auto-compact или отдельного решения пользователя изменить границы исследования.",
    "macOS-поведение не меняется; Windows 10/11 x64 package включает проверенный Codex Local Windows runtime и не требует отдельного копирования runtime.",
    "На первом Windows запуске runtime разворачивается в userData, проверяется по SHA-256 и подготавливает приватный Python/Git/ripgrep/tunnel без admin installation.",
    "Tunnel secret настраивается только локально в Windows console/DPAPI и не проходит через ChatGPT или renderer IPC.",
    "Windows build проходит cross-package/static tests на Mac и остаётся на live-acceptance до проверки пользователем на настоящем Windows 10/11 ПК."
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
      "package.json",
      "windows-runtime/Windows-Codex-Local-2026-09-10.zip",
      "windows-runtime/Windows-Codex-Local-2026-09-10.zip.sha256",
      "src/windows-runtime.mjs",
      "tests/windows-runtime.test.mjs",
      "src/preload.cjs",
      "src/ui/index.html",
      "src/ui/project-archive.mjs",
      "scripts/verify-windows-package.mjs",
      "src/ui/sidebar.mjs",
      "windows-runtime/node-v22.17.0-win-x64.zip.sha256",
      "scripts/prepare-windows-toolchain.mjs"
    ],
    "documentation_paths": [
      "docs/PRODUCT.md",
      "docs/architecture/ARCHITECTURE.md",
      "docs/VERIFICATION.md",
      "docs/WORKFLOW_START.md",
      "docs/SOURCE_WORKSPACES.md"
    ],
    "max_functional_files_per_task": 4
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
      "implementation_status": "DONE",
      "commit_status": "DONE",
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
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "web-pilot-context-observation-008",
        "task_id": "T006",
        "role": "implementation"
      }
    },
    {
      "id": "T007",
      "title": "Встроить канонический Codex Local Windows payload",
      "why": "Windows Web Pilot должен поставляться с тем же проверенным Windows runtime, а не требовать отдельного скачивания.",
      "dependencies": [
        "T006"
      ],
      "functional_paths": [
        "windows-runtime/Windows-Codex-Local-2026-09-10.zip",
        "windows-runtime/Windows-Codex-Local-2026-09-10.zip.sha256"
      ],
      "documentation_paths": [
        "docs/SOURCE_WORKSPACES.md",
        "docs/architecture/ARCHITECTURE.md"
      ],
      "acceptance_criteria": [
        "ZIP совпадает с каноническим соседним Windows-Codex-Local snapshot по SHA-256.",
        "Происхождение, размер и hash зафиксированы; payload не распаковывается в Git."
      ],
      "verification_ids": [],
      "expected_commit_message": "build: встроить Windows Codex Local runtime",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "web-pilot-context-observation-008",
        "task_id": "T007",
        "role": "implementation"
      }
    },
    {
      "id": "T008",
      "title": "Автоматизировать установку Windows runtime",
      "why": "На Windows приложение должно само развернуть встроенный runtime в userData и подготовить его до первого MCP запуска.",
      "dependencies": [
        "T007"
      ],
      "functional_paths": [
        "src/windows-runtime.mjs",
        "src/platform.mjs",
        "tests/windows-runtime.test.mjs"
      ],
      "documentation_paths": [
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md"
      ],
      "acceptance_criteria": [
        "Bootstrap проверяет SHA-256 payload, распаковывает только ожидаемый top-level folder и не пишет в Program Files.",
        "Установка выполняется PowerShell setup.ps1 в userData runtime и переиспользует уже установленный matching payload.",
        "Tests покрывают paths/hash/commands для win32 без исполнения Windows API на Mac."
      ],
      "verification_ids": [
        "suite"
      ],
      "expected_commit_message": "feat: автоматически готовить Windows runtime",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "web-pilot-context-observation-008",
        "task_id": "T008",
        "role": "implementation"
      }
    },
    {
      "id": "T009",
      "title": "Подключить bundled runtime к Windows lifecycle",
      "why": "McpRuntime должен на Windows автоматически bootstrap-ить встроенный runtime перед status/start.",
      "dependencies": [
        "T008"
      ],
      "functional_paths": [
        "src/main.mjs",
        "src/mcp-runtime.mjs",
        "src/windows-runtime.mjs",
        "tests/windows-runtime.test.mjs"
      ],
      "documentation_paths": [
        "docs/PRODUCT.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md"
      ],
      "acceptance_criteria": [
        "Windows main выбирает installed bundled runtime по умолчанию и не требует ручного выбора папки.",
        "Bootstrap выполняется до control status/start; macOS путь не меняется.",
        "Electron smoke и suite сохраняют существующее macOS поведение."
      ],
      "verification_ids": [
        "suite",
        "electron-smoke"
      ],
      "expected_commit_message": "feat: подключить bundled runtime Windows",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "web-pilot-context-observation-008",
        "task_id": "T009",
        "role": "implementation"
      }
    },
    {
      "id": "T010",
      "title": "Добавить безопасную команду настройки Windows tunnel",
      "why": "Пользователь должен выполнить обязательный секретный шаг из Web Pilot, не передавая API key через ChatGPT/renderer.",
      "dependencies": [
        "T009"
      ],
      "functional_paths": [
        "src/main.mjs",
        "src/preload.cjs",
        "src/windows-runtime.mjs"
      ],
      "documentation_paths": [
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md"
      ],
      "acceptance_criteria": [
        "Локальный IPC доступен только sidebar и только на win32.",
        "Команда запускает 2_CONNECT_TUNNEL.cmd в отдельной Windows console; Web Pilot не читает tunnel key.",
        "После настройки runtime status можно обновить без перезапуска приложения."
      ],
      "verification_ids": [
        "suite"
      ],
      "expected_commit_message": "feat: добавить Windows tunnel onboarding",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "web-pilot-context-observation-008",
        "task_id": "T010",
        "role": "implementation"
      }
    },
    {
      "id": "T011",
      "title": "Показать Windows runtime onboarding в Settings",
      "why": "Windows-пользователь должен видеть состояние встроенного runtime и понятную кнопку одноразовой настройки tunnel.",
      "dependencies": [
        "T010"
      ],
      "functional_paths": [
        "src/ui/index.html",
        "src/ui/project-archive.mjs",
        "src/ui/sidebar.mjs",
        "tests/electron-smoke.mjs"
      ],
      "documentation_paths": [
        "docs/PRODUCT.md",
        "docs/VERIFICATION.md",
        "docs/architecture/ARCHITECTURE.md"
      ],
      "acceptance_criteria": [
        "Settings показывает Windows runtime section только на Windows.",
        "Есть состояния embedded/installing/installed/tunnel-unconfigured/ready и кнопка настройки tunnel.",
        "macOS Settings визуально не меняется."
      ],
      "verification_ids": [
        "suite",
        "electron-smoke"
      ],
      "expected_commit_message": "feat: добавить Windows runtime UI",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "web-pilot-context-observation-008",
        "task_id": "T011",
        "role": "implementation"
      }
    },
    {
      "id": "T012",
      "title": "Собрать и проверить Windows distribution",
      "why": "Нужен готовый каталог/архив для передачи на реальный Windows 10/11 ПК.",
      "dependencies": [
        "T011",
        "T014"
      ],
      "functional_paths": [
        "package.json",
        "scripts/verify-windows-package.mjs",
        "tests/windows-runtime.test.mjs"
      ],
      "documentation_paths": [
        "docs/PRODUCT.md",
        "docs/VERIFICATION.md",
        "docs/WORKFLOW_START.md"
      ],
      "acceptance_criteria": [
        "build:win создаёт x64 package с runtime ZIP и workflow resources.",
        "Статический verifier проверяет exe, bundled payload hash и отсутствие macOS-only Info.plist зависимости.",
        "Готов путь к Windows package и SHA-256 для пользовательской проверки."
      ],
      "verification_ids": [
        "suite"
      ],
      "expected_commit_message": "build: подготовить Windows distribution",
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "web-pilot-context-observation-008",
        "task_id": "T012",
        "role": "implementation"
      }
    },
    {
      "id": "T013",
      "title": "Провести живую приёмку Windows 10/11",
      "why": "Cross-build на Mac не доказывает запуск, Windows Computer Use и tunnel на реальном Windows ПК.",
      "dependencies": [
        "T012"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/VERIFICATION.md",
        "docs/WORKFLOW_START.md"
      ],
      "acceptance_criteria": [
        "Пользователь запускает package на реальном Windows 10/11 x64.",
        "Подтверждены startup/login, создание или открытие workspace, runtime setup, tunnel/MCP и минимум одна локальная file/Git команда.",
        "Подтверждён хотя бы один Windows Computer Use action либо записана точная блокирующая причина."
      ],
      "verification_ids": [],
      "expected_commit_message": "docs: принять Windows 10/11 runtime",
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "web-pilot-context-observation-008",
        "task_id": "T013",
        "role": "implementation"
      }
    },
    {
      "id": "T014",
      "title": "Встроить portable Node.js для чистой Windows",
      "why": "Создание первого Workflow Kit workspace не должно требовать системного Node.js; worker должен запускаться от проверенного portable Node внутри Windows package.",
      "dependencies": [
        "T011"
      ],
      "functional_paths": [
        "windows-runtime/node-v22.17.0-win-x64.zip.sha256",
        "scripts/prepare-windows-toolchain.mjs",
        "src/main.mjs",
        "tests/windows-runtime.test.mjs"
      ],
      "documentation_paths": [
        "docs/SOURCE_WORKSPACES.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md"
      ],
      "acceptance_criteria": [
        "Официальный Node.js 22.17.0 win-x64 archive фиксирован SHA-256 и хранится только в ignored build-cache.",
        "Windows build preparation проверяет hash и распаковывает portable Node в resources payload.",
        "Windows WorkspaceSetup получает packaged node.exe первым candidate; Workflow Kit копирует его в локальный runtime проекта, системный Node не требуется."
      ],
      "verification_ids": [
        "suite"
      ],
      "expected_commit_message": "build: встроить portable Node Windows",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "web-pilot-context-observation-008",
        "task_id": "T014",
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
    },
    {
      "id": "windows-full-user-20260912",
      "text": "12.09.2026 пользователь поручил в ожидании auto-compact сделать полноценную Windows 10/11 версию и сообщил, что имеет Windows ПК для живой проверки.",
      "recorded_at": "2026-09-12T15:52:39.891Z"
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
Revision: 208

## Цель

Продолжать наблюдение ChatGPT Web до реального auto-compact и параллельно довести Project Web Pilot до самодостаточной Windows 10/11 x64 версии: тот же Electron/Chromium/UI/Workflow Kit, встроенный Codex Local Windows runtime, автоматическая локальная установка и безопасная настройка tunnel.

## Критерии приёмки

- Подтверждён фактический источник context-window данных либо зафиксировано, какие наблюдаемые transport-слои их не содержат.
- Вложенные JSON-envelope WebSocket/SSE разбираются только для служебной структуры; пользовательский текст и произвольные string values не сохраняются.
- При обнаружении фактических input/window значений существующий sidebar-индикатор показывает их без оценочной подстановки.
- Scope остаётся активным до реального наблюдения auto-compact или отдельного решения пользователя изменить границы исследования.
- macOS-поведение не меняется; Windows 10/11 x64 package включает проверенный Codex Local Windows runtime и не требует отдельного копирования runtime.
- На первом Windows запуске runtime разворачивается в userData, проверяется по SHA-256 и подготавливает приватный Python/Git/ripgrep/tunnel без admin installation.
- Tunnel secret настраивается только локально в Windows console/DPAPI и не проходит через ChatGPT или renderer IPC.
- Windows build проходит cross-package/static tests на Mac и остаётся на live-acceptance до проверки пользователем на настоящем Windows 10/11 ПК.

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
- [DONE] T005: Сделать поиск внешнего Node платформенно-независимым — Завершено
  - Git Commit: [DONE] refactor: отделить platform layout Node runtime
  - Reference: web-pilot-context-observation-008 / T005 / implementation
  - Файлы: src/platform.mjs, src/workspace-setup.mjs, tests/workspace-setup.test.mjs, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md
- [DONE] T006: Подключить platform boundary в main и build scripts — Завершено
  - Git Commit: [DONE] refactor: подготовить platform boundary приложения
  - Reference: web-pilot-context-observation-008 / T006 / implementation
  - Файлы: src/platform.mjs, src/main.mjs, package.json, docs/PRODUCT.md, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md
- [DONE] T007: Встроить канонический Codex Local Windows payload — Завершено
  - Git Commit: [DONE] build: встроить Windows Codex Local runtime
  - Reference: web-pilot-context-observation-008 / T007 / implementation
  - Файлы: windows-runtime/Windows-Codex-Local-2026-09-10.zip, windows-runtime/Windows-Codex-Local-2026-09-10.zip.sha256, docs/SOURCE_WORKSPACES.md, docs/architecture/ARCHITECTURE.md
- [DONE] T008: Автоматизировать установку Windows runtime — Завершено
  - Git Commit: [DONE] feat: автоматически готовить Windows runtime
  - Reference: web-pilot-context-observation-008 / T008 / implementation
  - Файлы: src/windows-runtime.mjs, src/platform.mjs, tests/windows-runtime.test.mjs, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md
- [DONE] T009: Подключить bundled runtime к Windows lifecycle — Завершено
  - Git Commit: [DONE] feat: подключить bundled runtime Windows
  - Reference: web-pilot-context-observation-008 / T009 / implementation
  - Файлы: src/main.mjs, src/mcp-runtime.mjs, src/windows-runtime.mjs, tests/windows-runtime.test.mjs, docs/PRODUCT.md, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md
- [DONE] T010: Добавить безопасную команду настройки Windows tunnel — Завершено
  - Git Commit: [DONE] feat: добавить Windows tunnel onboarding
  - Reference: web-pilot-context-observation-008 / T010 / implementation
  - Файлы: src/main.mjs, src/preload.cjs, src/windows-runtime.mjs, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md
- [DONE] T011: Показать Windows runtime onboarding в Settings — Завершено
  - Git Commit: [DONE] feat: добавить Windows runtime UI
  - Reference: web-pilot-context-observation-008 / T011 / implementation
  - Файлы: src/ui/index.html, src/ui/project-archive.mjs, src/ui/sidebar.mjs, tests/electron-smoke.mjs, docs/PRODUCT.md, docs/VERIFICATION.md, docs/architecture/ARCHITECTURE.md
- [TODO] T012: Собрать и проверить Windows distribution — Ожидает
  - Git Commit: [PENDING] build: подготовить Windows distribution
  - Reference: web-pilot-context-observation-008 / T012 / implementation
  - Файлы: package.json, scripts/verify-windows-package.mjs, tests/windows-runtime.test.mjs, docs/PRODUCT.md, docs/VERIFICATION.md, docs/WORKFLOW_START.md
- [TODO] T013: Провести живую приёмку Windows 10/11 — Ожидает
  - Git Commit: [PENDING] docs: принять Windows 10/11 runtime
  - Reference: web-pilot-context-observation-008 / T013 / implementation
  - Файлы: docs/VERIFICATION.md, docs/WORKFLOW_START.md
- [DONE] T014: Встроить portable Node.js для чистой Windows — Завершено
  - Git Commit: [DONE] build: встроить portable Node Windows
  - Reference: web-pilot-context-observation-008 / T014 / implementation
  - Файлы: windows-runtime/node-v22.17.0-win-x64.zip.sha256, scripts/prepare-windows-toolchain.mjs, src/main.mjs, tests/windows-runtime.test.mjs, docs/SOURCE_WORKSPACES.md, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md

## Context Pack For This Cycle

- docs/PRODUCT.md → Продукт
- docs/architecture/ARCHITECTURE.md → Архитектура

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
