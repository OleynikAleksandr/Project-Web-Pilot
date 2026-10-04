# Активный план — Project Web Pilot

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 1092,
  "project_id": "cf944136-d1fc-4bd5-9ea0-e46d1fe230e7",
  "project_name": "Project Web Pilot",
  "scope_id": "computer-use-keys-batch-0.6.85-20261004",
  "execution_scope_status": "ACTIVE",
  "delivery_status": "READY_FOR_ACCEPTANCE",
  "objective": "Computer Use в MCP: имена клавиш X11 и пакет действий одним вызовом; нейтральные подписи канала VPS и подсказка про плагин; релиз 0.6.85.",
  "acceptance_criteria": [
    "computer_key_press и computer_hotkey принимают символы",
    "computer_actions выполняет последовательность действий одним вызовом",
    "Подписи канала нейтральные, есть подсказка про плагин",
    "Релиз 0.6.85 собран, установлен и опубликован после DOCS"
  ],
  "approved_scope": {
    "functional_paths": [
      "tools/codex-app-server-mcp/server.py",
      "tests/codex-app-server-mcp.test.mjs",
      "src/ui/index.html",
      "src/ui/settings-panel.mjs",
      "src/mac-runtime-switch.mjs",
      "tests/settings-chatgpt-channel.test.mjs",
      "package.json",
      "package-lock.json",
      "scripts/release-all.mjs",
      "scripts/check-installed-release.mjs",
      "scripts/check-github-release.mjs",
      "src/workspace-session.mjs",
      "src/main.mjs",
      "tests/workspace-session.test.mjs",
      "src/vps-tunnel.mjs"
    ],
    "documentation_paths": [
      "docs/planning/computer-use-keys-batch.md",
      "docs/PRODUCT.md",
      "docs/architecture/ARCHITECTURE.md",
      "docs/RELEASE.md",
      "docs/VERIFICATION.md",
      "docs/architecture/OVERVIEW.md",
      "docs/MODULES.md",
      "docs/DOCUMENTATION_INDEX.md",
      "README.md",
      "docs/WORKFLOW_START.md",
      "docs/modules/codex-app-server-executor.md"
    ]
  },
  "baseline_commit": "e92010bb22665888ad9a8018a2f5e6d94d6af1fb",
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
        "path": "docs/planning/computer-use-keys-batch.md",
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
        "scope_id": "computer-use-keys-batch-0.6.85-20261004",
        "task_id": "T001",
        "role": "implementation"
      },
      "dependencies": [],
      "functional_paths": [
        "tools/codex-app-server-mcp/server.py",
        "tests/codex-app-server-mcp.test.mjs"
      ],
      "documentation_paths": [
        "docs/planning/computer-use-keys-batch.md"
      ],
      "verification_ids": [
        "executor-channel"
      ],
      "id": "T001",
      "title": "Computer Use: имена клавиш X11 и пакет действий computer_actions",
      "why": "Модель через MCP передаёт символы клавиш; каждое действие — отдельный ход модели.",
      "verification_kind": "code",
      "acceptance_criteria": [
        "* = + и другие символы переводятся в имена X11 в computer_key_press и computer_hotkey",
        "computer_actions: до 50 действий key/hotkey/text/click/scroll/wait одним вызовом node_repl, остановка на ошибке, результат по каждому действию",
        "Прежние инструменты и имена клавиш работают как раньше"
      ],
      "expected_commit_message": "feat: Computer Use: имена клавиш X11 и пакет действий computer_actions",
      "actual_files": [
        "tests/codex-app-server-mcp.test.mjs",
        "tools/codex-app-server-mcp/server.py"
      ]
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "computer-use-keys-batch-0.6.85-20261004",
        "task_id": "T002",
        "role": "implementation"
      },
      "dependencies": [],
      "functional_paths": [
        "src/ui/index.html",
        "src/ui/settings-panel.mjs",
        "src/mac-runtime-switch.mjs",
        "tests/settings-chatgpt-channel.test.mjs",
        "src/vps-tunnel.mjs"
      ],
      "documentation_paths": [
        "docs/planning/computer-use-keys-batch.md"
      ],
      "verification_ids": [
        "settings-ui",
        "vps-runtime",
        "unit-all"
      ],
      "id": "T002",
      "title": "Канал ChatGPT: нейтральные подписи и подсказка про плагин",
      "why": "У постороннего пользователя подпись ссылалась на vps-server; не было сказано, какой плагин включить в ChatGPT.",
      "verification_kind": "code",
      "acceptance_criteria": [
        "Без своего сервера подпись «Свой сервер не настроен» без упоминания vps-server",
        "Под переключателем подсказка про плагин ChatGPT для выбранного канала",
        "Весь npm test проходит"
      ],
      "expected_commit_message": "feat: Канал ChatGPT: нейтральные подписи и подсказка про плагин",
      "actual_files": [
        "src/ui/index.html",
        "src/ui/settings-panel.mjs",
        "src/mac-runtime-switch.mjs",
        "src/vps-tunnel.mjs",
        "tests/settings-chatgpt-channel.test.mjs"
      ]
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "computer-use-keys-batch-0.6.85-20261004",
        "task_id": "T003",
        "role": "implementation"
      },
      "dependencies": [],
      "functional_paths": [
        "package.json",
        "package-lock.json"
      ],
      "documentation_paths": [
        "docs/planning/computer-use-keys-batch.md"
      ],
      "verification_ids": [
        "release-source"
      ],
      "id": "T003",
      "title": "Подготовить source релиза 0.6.85",
      "why": "Правки доходят до пользователя новой сборкой.",
      "verification_kind": "code",
      "acceptance_criteria": [
        "package.json и package-lock.json задают 0.6.85"
      ],
      "expected_commit_message": "feat: Подготовить source релиза 0.6.85",
      "actual_files": [
        "package-lock.json",
        "package.json"
      ]
    },
    {
      "id": "T007",
      "title": "Закрытие Настроек после архива выбранного проекта открывает другой проект, а не первый запуск",
      "why": "Пользователь: архивировал тестовый проект, удалил его с диска из архива, закрыл Настройки — сайдбар показал первый запуск, хотя другие проекты есть. Архив и удаление выбранного проекта сбрасывают выбор, а closeSettings и cancelSetup при пустом выборе включают первый запуск.",
      "dependencies": [],
      "functional_paths": [
        "src/workspace-session.mjs",
        "src/main.mjs",
        "tests/workspace-session.test.mjs"
      ],
      "documentation_paths": [],
      "verification_ids": [
        "unit-all"
      ],
      "verification_kind": "code",
      "acceptance_criteria": [
        "Если выбранный проект архивирован или удалён, закрытие Настроек и отмена создания проекта открывают первый активный проект из списка",
        "Первый запуск показывается только когда активных проектов нет",
        "Прежнее поведение архива (выбор сбрасывается в хранилище) сохраняется"
      ],
      "expected_commit_message": "feat: Закрытие Настроек после архива выбранного проекта открывает другой проект, а не первый запуск",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "computer-use-keys-batch-0.6.85-20261004",
        "task_id": "T007",
        "role": "implementation"
      },
      "actual_files": [
        "src/main.mjs",
        "src/workspace-session.mjs",
        "tests/workspace-session.test.mjs"
      ]
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "computer-use-keys-batch-0.6.85-20261004",
        "task_id": "DOCS",
        "role": "implementation"
      },
      "dependencies": [
        "T001",
        "T002",
        "T003",
        "T007"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/planning/computer-use-keys-batch.md",
        "docs/PRODUCT.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/RELEASE.md",
        "docs/VERIFICATION.md",
        "docs/architecture/OVERVIEW.md",
        "docs/MODULES.md",
        "docs/DOCUMENTATION_INDEX.md",
        "README.md",
        "docs/WORKFLOW_START.md",
        "docs/modules/codex-app-server-executor.md"
      ],
      "verification_ids": [],
      "id": "DOCS",
      "title": "Актуализация всех документов проекта",
      "why": "Сохранить актуальный контекст для следующего агента",
      "acceptance_criteria": [
        "Документы соответствуют результату"
      ],
      "expected_commit_message": "docs: актуализировать контекст проекта",
      "actual_files": [
        "README.md",
        "docs/DOCUMENTATION_INDEX.md",
        "docs/MODULES.md",
        "docs/PRODUCT.md",
        "docs/RELEASE.md",
        "docs/WORKFLOW_START.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/architecture/OVERVIEW.md",
        "docs/modules/codex-app-server-executor.md"
      ]
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "computer-use-keys-batch-0.6.85-20261004",
        "task_id": "T004",
        "role": "implementation"
      },
      "dependencies": [
        "DOCS"
      ],
      "functional_paths": [
        "scripts/release-all.mjs"
      ],
      "documentation_paths": [
        "docs/planning/computer-use-keys-batch.md"
      ],
      "verification_ids": [
        "paired-release"
      ],
      "id": "T004",
      "title": "Собрать и проверить парный релиз 0.6.85",
      "why": "Пересобрать релиз после правок.",
      "verification_kind": "package",
      "acceptance_criteria": [
        "~/Downloads/WebPilot-0.6.85 собран из коммита после DOCS, packagedSourceMatches=true",
        "Preflight identity записан до сборки"
      ],
      "expected_commit_message": "feat: Собрать и проверить парный релиз 0.6.85",
      "actual_files": []
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "computer-use-keys-batch-0.6.85-20261004",
        "task_id": "T005",
        "role": "implementation"
      },
      "dependencies": [
        "DOCS"
      ],
      "functional_paths": [
        "scripts/check-installed-release.mjs"
      ],
      "documentation_paths": [
        "docs/planning/computer-use-keys-batch.md"
      ],
      "verification_ids": [
        "release-installed"
      ],
      "id": "T005",
      "title": "Установить 0.6.85 и проверить установленные macOS-копии",
      "why": "Пользователь работает из /Applications.",
      "verification_kind": "installed",
      "acceptance_criteria": [
        "/Applications обновлена из staging без пересборки, identity сохранена, release-installed проходит"
      ],
      "expected_commit_message": "feat: Установить 0.6.85 и проверить установленные macOS-копии",
      "actual_files": []
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "computer-use-keys-batch-0.6.85-20261004",
        "task_id": "T006",
        "role": "implementation"
      },
      "dependencies": [
        "DOCS"
      ],
      "functional_paths": [
        "scripts/check-github-release.mjs"
      ],
      "documentation_paths": [
        "docs/planning/computer-use-keys-batch.md",
        "docs/RELEASE.md",
        "docs/VERIFICATION.md",
        "README.md",
        "docs/MODULES.md",
        "docs/PRODUCT.md",
        "docs/WORKFLOW_START.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/architecture/OVERVIEW.md"
      ],
      "verification_ids": [
        "github-release"
      ],
      "id": "T006",
      "title": "Опубликовать 0.6.85 и синхронизировать Project Web Pilot с GitHub",
      "why": "Отправить релиз на GitHub.",
      "verification_kind": "package",
      "acceptance_criteria": [
        "Tag v0.6.85 на sourceCommit, пять assets сверены по server digest",
        "После финального push origin/main == local HEAD",
        "Документы фиксируют публикацию"
      ],
      "expected_commit_message": "feat: Опубликовать 0.6.85 и синхронизировать Project Web Pilot с GitHub",
      "actual_files": [
        "README.md",
        "docs/MODULES.md",
        "docs/PRODUCT.md",
        "docs/RELEASE.md",
        "docs/VERIFICATION.md",
        "docs/WORKFLOW_START.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/architecture/OVERVIEW.md",
        "docs/planning/computer-use-keys-batch.md"
      ]
    }
  ],
  "blocked_reason": null,
  "user_decisions": [
    {
      "id": "5801a917-fad2-4249-85f0-a1d973d9f7fe",
      "text": "Поручение пользователя 04.10.2026: создать новый план в Project Web Pilot и реализовать правки Computer Use и интерфейса канала, без ухудшения текущей работы.",
      "recorded_at": "2026-10-04T12:16:36.497Z"
    }
  ]
}
```
<!-- workflow-state:end -->

## Состояние

Execution Scope Status: ACTIVE
Delivery Status: READY_FOR_ACCEPTANCE
Scope: computer-use-keys-batch-0.6.85-20261004
Current Task: нет
Revision: 1092

## Цель

Computer Use в MCP: имена клавиш X11 и пакет действий одним вызовом; нейтральные подписи канала VPS и подсказка про плагин; релиз 0.6.85.

## Критерии приёмки

- computer_key_press и computer_hotkey принимают символы
- computer_actions выполняет последовательность действий одним вызовом
- Подписи канала нейтральные, есть подсказка про плагин
- Релиз 0.6.85 собран, установлен и опубликован после DOCS

## Микрозадачи

- [DONE] T001: Computer Use: имена клавиш X11 и пакет действий computer_actions — Завершено
  - Git Commit: [DONE] feat: Computer Use: имена клавиш X11 и пакет действий computer_actions
  - Reference: computer-use-keys-batch-0.6.85-20261004 / T001 / implementation
  - Файлы: tools/codex-app-server-mcp/server.py, tests/codex-app-server-mcp.test.mjs, docs/planning/computer-use-keys-batch.md
- [DONE] T002: Канал ChatGPT: нейтральные подписи и подсказка про плагин — Завершено
  - Git Commit: [DONE] feat: Канал ChatGPT: нейтральные подписи и подсказка про плагин
  - Reference: computer-use-keys-batch-0.6.85-20261004 / T002 / implementation
  - Файлы: src/ui/index.html, src/ui/settings-panel.mjs, src/mac-runtime-switch.mjs, tests/settings-chatgpt-channel.test.mjs, src/vps-tunnel.mjs, docs/planning/computer-use-keys-batch.md
- [DONE] T003: Подготовить source релиза 0.6.85 — Завершено
  - Git Commit: [DONE] feat: Подготовить source релиза 0.6.85
  - Reference: computer-use-keys-batch-0.6.85-20261004 / T003 / implementation
  - Файлы: package.json, package-lock.json, docs/planning/computer-use-keys-batch.md
- [DONE] T007: Закрытие Настроек после архива выбранного проекта открывает другой проект, а не первый запуск — Завершено
  - Git Commit: [DONE] feat: Закрытие Настроек после архива выбранного проекта открывает другой проект, а не первый запуск
  - Reference: computer-use-keys-batch-0.6.85-20261004 / T007 / implementation
  - Файлы: src/workspace-session.mjs, src/main.mjs, tests/workspace-session.test.mjs
- [DONE] DOCS: Актуализация всех документов проекта — Завершено
  - Git Commit: [DONE] docs: актуализировать контекст проекта
  - Reference: computer-use-keys-batch-0.6.85-20261004 / DOCS / implementation
  - Файлы: docs/planning/computer-use-keys-batch.md, docs/PRODUCT.md, docs/architecture/ARCHITECTURE.md, docs/RELEASE.md, docs/VERIFICATION.md, docs/architecture/OVERVIEW.md, docs/MODULES.md, docs/DOCUMENTATION_INDEX.md, README.md, docs/WORKFLOW_START.md, docs/modules/codex-app-server-executor.md
- [DONE] T004: Собрать и проверить парный релиз 0.6.85 — Завершено
  - Git Commit: [DONE] feat: Собрать и проверить парный релиз 0.6.85
  - Reference: computer-use-keys-batch-0.6.85-20261004 / T004 / implementation
  - Файлы: scripts/release-all.mjs, docs/planning/computer-use-keys-batch.md
- [DONE] T005: Установить 0.6.85 и проверить установленные macOS-копии — Завершено
  - Git Commit: [DONE] feat: Установить 0.6.85 и проверить установленные macOS-копии
  - Reference: computer-use-keys-batch-0.6.85-20261004 / T005 / implementation
  - Файлы: scripts/check-installed-release.mjs, docs/planning/computer-use-keys-batch.md
- [DONE] T006: Опубликовать 0.6.85 и синхронизировать Project Web Pilot с GitHub — Завершено
  - Git Commit: [DONE] feat: Опубликовать 0.6.85 и синхронизировать Project Web Pilot с GitHub
  - Reference: computer-use-keys-batch-0.6.85-20261004 / T006 / implementation
  - Файлы: scripts/check-github-release.mjs, docs/planning/computer-use-keys-batch.md, docs/RELEASE.md, docs/VERIFICATION.md, README.md, docs/MODULES.md, docs/PRODUCT.md, docs/WORKFLOW_START.md, docs/architecture/ARCHITECTURE.md, docs/architecture/OVERVIEW.md

## Context Pack For This Cycle

- docs/architecture/OVERVIEW.md → Краткая архитектура проекта
- docs/MODULES.md → Модули проекта
- docs/DOCUMENTATION_INDEX.md → Каталог документации
- docs/planning/computer-use-keys-batch.md

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
