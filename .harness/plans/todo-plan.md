# Активный план — Project Web Pilot

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 1241,
  "project_id": "cf944136-d1fc-4bd5-9ea0-e46d1fe230e7",
  "project_name": "Project Web Pilot",
  "scope_id": "codex-stdin-contract-fix-0.6.93-20261005",
  "execution_scope_status": "ACTIVE",
  "delivery_status": "IN_PROGRESS",
  "objective": "Исправить контракт stdin у exec_command/write_stdin в macOS MCP Codex App Server Local Mac, добавить Codex-совместимые описания и clamp пределов, проверить на настоящем Codex App Server и выпустить Project Web Pilot 0.6.93 без изменений Windows-runtime.",
  "acceptance_criteria": [
    "Исправить контракт stdin у exec_command/write_stdin в macOS MCP Codex App Server Local Mac, добавить Codex-совместимые описания и clamp пределов, проверить на настоящем Codex App Server и выпустить Project Web Pilot 0.6.93 без изменений Windows-runtime."
  ],
  "approved_scope": {
    "functional_paths": [
      "tools/codex-app-server-mcp/server.py",
      "tests/codex-app-server-mcp.test.mjs",
      "package.json",
      "package-lock.json",
      "scripts/release-all.mjs",
      "scripts/release-mac.mjs",
      "scripts/verify-windows-package.mjs",
      "scripts/check-installed-release.mjs",
      "scripts/check-github-release.mjs"
    ],
    "documentation_paths": [
      "docs/planning/codex-native-tools-macos.md",
      "docs/PRODUCT.md",
      "docs/architecture/ARCHITECTURE.md",
      "docs/architecture/OVERVIEW.md",
      "docs/MODULES.md",
      "docs/DOCUMENTATION_INDEX.md"
    ]
  },
  "baseline_commit": "b9025dabdd8ef99bc9a2352697e31c1da894a6c0",
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
        "path": "docs/MODULES.md",
        "heading_path": [
          "Модули проекта"
        ],
        "required": true,
        "revision": "WORKTREE"
      },
      {
        "path": "docs/DOCUMENTATION_INDEX.md",
        "heading_path": [
          "Каталог документации"
        ],
        "required": true,
        "revision": "WORKTREE"
      },
      {
        "path": "docs/planning/codex-native-tools-macos.md",
        "required": true
      }
    ],
    "include_last_completed_task": false,
    "dependency_task_ids": []
  },
  "tasks": [
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "codex-stdin-contract-fix-0.6.93-20261005",
        "task_id": "T001",
        "role": "implementation"
      },
      "dependencies": [],
      "functional_paths": [
        "tools/codex-app-server-mcp/server.py",
        "tests/codex-app-server-mcp.test.mjs"
      ],
      "documentation_paths": [
        "docs/planning/codex-native-tools-macos.md"
      ],
      "verification_ids": [
        "executor-channel",
        "unit-all",
        "codex-tools-live"
      ],
      "id": "T001",
      "title": "Исправить stdin-контракт exec_command/write_stdin и покрыть его тестами",
      "why": "0.6.92 всегда открывает stdin у command/exec, из-за чего stdin-читающие команды вроде rg/grep/cat могут зависать в обычном tty=false режиме.",
      "verification_kind": "code",
      "acceptance_criteria": [
        "Поведение сверено с openai/codex tag rust-v0.160.0: process_manager.rs и errors.rs; codex-tools.lock.json не меняется",
        "tty=false запускает command/exec с закрытым stdin; rg -n add без пути и cat завершаются без зависания",
        "tty=true сохраняет открытый stdin, write_stdin и Ctrl-C работают как прежде",
        "Сервер хранит tty-режим каждой command session вместе с курсором",
        "write_stdin с непустыми chars в tty=false возвращает дословную ошибку Codex, кроме единственного U+0003: Ctrl-C завершает процесс через command/exec/terminate; пустой опрос работает в обоих режимах",
        "yield_time_ms и max_output_tokens приводятся к допустимым пределам как в Codex; нечисловые значения остаются ошибкой",
        "exec_command, write_stdin и все их параметры имеют непустые описания по shell_spec.rs с локальными отличиями и пределами; каталог остаётся ровно 13 инструментов",
        "apply_patch, view_image, корзина, recovery/status/watchdog, инструменты наблюдения, Windows-runtime и первые 512 символов server instructions не меняются",
        "Контракт docs/planning/codex-native-tools-macos.md дополнен исправлением 0.6.93"
      ],
      "expected_commit_message": "feat: Исправить stdin-контракт exec_command/write_stdin и покрыть его тестами",
      "actual_files": [
        "docs/planning/codex-native-tools-macos.md",
        "tests/codex-app-server-mcp.test.mjs",
        "tools/codex-app-server-mcp/server.py"
      ]
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "codex-stdin-contract-fix-0.6.93-20261005",
        "task_id": "T002",
        "role": "implementation"
      },
      "dependencies": [
        "T001"
      ],
      "functional_paths": [
        "package.json",
        "package-lock.json"
      ],
      "documentation_paths": [
        "docs/planning/codex-native-tools-macos.md"
      ],
      "verification_ids": [
        "unit-all",
        "codex-tools-live"
      ],
      "id": "T002",
      "title": "Подготовить source версии 0.6.93 и повторно проверить релизный исходник",
      "why": "Подготовить source версии 0.6.93 и повторно проверить релизный исходник",
      "verification_kind": "code",
      "acceptance_criteria": [
        "package.json и package-lock.json задают 0.6.93",
        "Весь код, который должен попасть в релиз, проверен до первой сборки",
        "Сверка определений с Codex 0.160.0 проходит; codex-tools.lock.json остаётся неизменным",
        "Сборка, установка и публикация на этом шаге не выполняются"
      ],
      "expected_commit_message": "feat: Подготовить source версии 0.6.93 и повторно проверить релизный исходник"
    },
    {
      "id": "T001A",
      "title": "Привести ожидание write_stdin к Codex rust-v0.160.0",
      "why": "После исправления stdin-контракта 0.6.92 write_stdin всё ещё применяет poll-минимум 5000 мс к непустой записи, из-за чего интерактивный tty-ввод искусственно задерживается примерно на 5 секунд.",
      "dependencies": [
        "T001"
      ],
      "functional_paths": [
        "tools/codex-app-server-mcp/server.py",
        "tests/codex-app-server-mcp.test.mjs"
      ],
      "documentation_paths": [
        "docs/planning/codex-native-tools-macos.md"
      ],
      "verification_ids": [
        "executor-channel"
      ],
      "verification_kind": "code",
      "acceptance_criteria": [
        "Поведение сверено с openai/codex tag rust-v0.160.0, включая process_manager.rs и handlers/unified_exec.rs",
        "write_stdin по умолчанию использует yield_time_ms=250",
        "При непустом chars yield_time_ms clamp-ится к диапазону 250-30000 мс",
        "При пустом chars (poll) yield_time_ms clamp-ится к диапазону 5000-60000 мс",
        "Описание параметра yield_time_ms у write_stdin и docs/planning/codex-native-tools-macos.md отражают раздельные пределы для write и poll",
        "Реальный App Server тест подтверждает: tty=true запись с default yield возвращает ответ программы быстрее 2 секунд",
        "Реальный App Server тест подтверждает: пустой poll с yield ниже 5000 сохраняет нижнюю границу 5000 мс",
        "Каталог остаётся ровно 13 tools; codex-tools.lock.json, Windows-runtime и Windows catalog не меняются"
      ],
      "expected_commit_message": "feat: Привести ожидание write_stdin к Codex rust-v0.160.0",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "codex-stdin-contract-fix-0.6.93-20261005",
        "task_id": "T001A",
        "role": "implementation"
      },
      "actual_files": [
        "docs/planning/codex-native-tools-macos.md",
        "tests/codex-app-server-mcp.test.mjs",
        "tools/codex-app-server-mcp/server.py"
      ]
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "codex-stdin-contract-fix-0.6.93-20261005",
        "task_id": "DOCS",
        "role": "implementation"
      },
      "dependencies": [
        "T001",
        "T002",
        "T001A"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/planning/codex-native-tools-macos.md",
        "docs/PRODUCT.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/architecture/OVERVIEW.md",
        "docs/MODULES.md",
        "docs/DOCUMENTATION_INDEX.md"
      ],
      "verification_ids": [],
      "id": "DOCS",
      "title": "Актуализация всех документов проекта",
      "why": "Сохранить актуальный контекст для следующего агента",
      "acceptance_criteria": [
        "Документы соответствуют результату"
      ],
      "expected_commit_message": "docs: актуализировать контекст проекта"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "codex-stdin-contract-fix-0.6.93-20261005",
        "task_id": "T003",
        "role": "implementation"
      },
      "dependencies": [
        "T002",
        "DOCS"
      ],
      "functional_paths": [
        "package.json",
        "scripts/release-all.mjs",
        "scripts/release-mac.mjs",
        "scripts/verify-windows-package.mjs"
      ],
      "documentation_paths": [
        "docs/planning/codex-native-tools-macos.md"
      ],
      "verification_ids": [
        "paired-release"
      ],
      "id": "T003",
      "title": "Собрать и проверить парный release 0.6.93",
      "why": "Собрать и проверить парный release 0.6.93",
      "verification_kind": "package",
      "acceptance_criteria": [
        "npm run build выполняется только после завершённой DOCS",
        "Парные macOS arm64 и Windows x64 artifacts 0.6.93 собраны штатным pipeline",
        "Windows-runtime и его каталог не изменены",
        "GitHub Release на этом шаге не публикуется"
      ],
      "expected_commit_message": "feat: Собрать и проверить парный release 0.6.93"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "codex-stdin-contract-fix-0.6.93-20261005",
        "task_id": "T004",
        "role": "implementation"
      },
      "dependencies": [
        "T003",
        "DOCS"
      ],
      "functional_paths": [
        "scripts/release-mac.mjs",
        "scripts/check-installed-release.mjs"
      ],
      "documentation_paths": [
        "docs/planning/codex-native-tools-macos.md"
      ],
      "verification_ids": [
        "release-installed"
      ],
      "id": "T004",
      "title": "Установить и проверить macOS 0.6.93 в /Applications",
      "why": "Установить и проверить macOS 0.6.93 в /Applications",
      "verification_kind": "installed",
      "acceptance_criteria": [
        "/Applications/Project Web Pilot.app и root app обновлены до 0.6.93 из уже собранного staging без пересборки",
        "Установленная копия и release artifacts проходят штатную installed-проверку",
        "Интерфейсом компьютера агент не управляет"
      ],
      "expected_commit_message": "feat: Установить и проверить macOS 0.6.93 в /Applications"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "codex-stdin-contract-fix-0.6.93-20261005",
        "task_id": "T005",
        "role": "implementation"
      },
      "dependencies": [
        "T004",
        "DOCS"
      ],
      "functional_paths": [
        "scripts/check-github-release.mjs",
        "package.json"
      ],
      "documentation_paths": [
        "docs/planning/codex-native-tools-macos.md"
      ],
      "verification_ids": [
        "github-release"
      ],
      "id": "T005",
      "title": "Опубликовать GitHub Release v0.6.93 и синхронизировать main",
      "why": "Опубликовать GitHub Release v0.6.93 и синхронизировать main",
      "verification_kind": "package",
      "acceptance_criteria": [
        "Tag v0.6.93 указывает на release-manifest.sourceCommit",
        "GitHub Release v0.6.93 содержит ровно шесть ожидаемых файлов и их server digests совпадают с локальной поставкой",
        "origin/main после managed commit совпадает с локальным HEAD",
        "Повторная сборка при публикации не выполняется"
      ],
      "expected_commit_message": "feat: Опубликовать GitHub Release v0.6.93 и синхронизировать main"
    }
  ],
  "blocked_reason": null,
  "user_decisions": [
    {
      "id": "bc537305-c9c6-490f-b312-69053f733e4d",
      "text": "Пользователь поручил выполнить описанную задачу и план.",
      "recorded_at": "2026-10-05T13:49:55.468Z"
    }
  ]
}
```
<!-- workflow-state:end -->

## Состояние

Execution Scope Status: ACTIVE
Delivery Status: IN_PROGRESS
Scope: codex-stdin-contract-fix-0.6.93-20261005
Current Task: нет
Revision: 1241

## Цель

Исправить контракт stdin у exec_command/write_stdin в macOS MCP Codex App Server Local Mac, добавить Codex-совместимые описания и clamp пределов, проверить на настоящем Codex App Server и выпустить Project Web Pilot 0.6.93 без изменений Windows-runtime.

## Критерии приёмки

- Исправить контракт stdin у exec_command/write_stdin в macOS MCP Codex App Server Local Mac, добавить Codex-совместимые описания и clamp пределов, проверить на настоящем Codex App Server и выпустить Project Web Pilot 0.6.93 без изменений Windows-runtime.

## Микрозадачи

- [DONE] T001: Исправить stdin-контракт exec_command/write_stdin и покрыть его тестами — Завершено
  - Git Commit: [DONE] feat: Исправить stdin-контракт exec_command/write_stdin и покрыть его тестами
  - Reference: codex-stdin-contract-fix-0.6.93-20261005 / T001 / implementation
  - Файлы: tools/codex-app-server-mcp/server.py, tests/codex-app-server-mcp.test.mjs, docs/planning/codex-native-tools-macos.md
- [TODO] T002: Подготовить source версии 0.6.93 и повторно проверить релизный исходник — Ожидает
  - Git Commit: [PENDING] feat: Подготовить source версии 0.6.93 и повторно проверить релизный исходник
  - Reference: codex-stdin-contract-fix-0.6.93-20261005 / T002 / implementation
  - Файлы: package.json, package-lock.json, docs/planning/codex-native-tools-macos.md
- [DONE] T001A: Привести ожидание write_stdin к Codex rust-v0.160.0 — Завершено
  - Git Commit: [DONE] feat: Привести ожидание write_stdin к Codex rust-v0.160.0
  - Reference: codex-stdin-contract-fix-0.6.93-20261005 / T001A / implementation
  - Файлы: tools/codex-app-server-mcp/server.py, tests/codex-app-server-mcp.test.mjs, docs/planning/codex-native-tools-macos.md
- [TODO] DOCS: Актуализация всех документов проекта — Ожидает
  - Git Commit: [PENDING] docs: актуализировать контекст проекта
  - Reference: codex-stdin-contract-fix-0.6.93-20261005 / DOCS / implementation
  - Файлы: docs/planning/codex-native-tools-macos.md, docs/PRODUCT.md, docs/architecture/ARCHITECTURE.md, docs/architecture/OVERVIEW.md, docs/MODULES.md, docs/DOCUMENTATION_INDEX.md
- [TODO] T003: Собрать и проверить парный release 0.6.93 — Ожидает
  - Git Commit: [PENDING] feat: Собрать и проверить парный release 0.6.93
  - Reference: codex-stdin-contract-fix-0.6.93-20261005 / T003 / implementation
  - Файлы: package.json, scripts/release-all.mjs, scripts/release-mac.mjs, scripts/verify-windows-package.mjs, docs/planning/codex-native-tools-macos.md
- [TODO] T004: Установить и проверить macOS 0.6.93 в /Applications — Ожидает
  - Git Commit: [PENDING] feat: Установить и проверить macOS 0.6.93 в /Applications
  - Reference: codex-stdin-contract-fix-0.6.93-20261005 / T004 / implementation
  - Файлы: scripts/release-mac.mjs, scripts/check-installed-release.mjs, docs/planning/codex-native-tools-macos.md
- [TODO] T005: Опубликовать GitHub Release v0.6.93 и синхронизировать main — Ожидает
  - Git Commit: [PENDING] feat: Опубликовать GitHub Release v0.6.93 и синхронизировать main
  - Reference: codex-stdin-contract-fix-0.6.93-20261005 / T005 / implementation
  - Файлы: scripts/check-github-release.mjs, package.json, docs/planning/codex-native-tools-macos.md

## Context Pack For This Cycle

- docs/architecture/OVERVIEW.md → Краткая архитектура проекта
- docs/MODULES.md → Модули проекта
- docs/DOCUMENTATION_INDEX.md → Каталог документации
- docs/planning/codex-native-tools-macos.md

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
