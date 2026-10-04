# Активный план — Project Web Pilot

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 1049,
  "project_id": "cf944136-d1fc-4bd5-9ea0-e46d1fe230e7",
  "project_name": "Project Web Pilot",
  "scope_id": "chatgpt-channel-vps-20261004",
  "execution_scope_status": "ACTIVE",
  "delivery_status": "IN_PROGRESS",
  "objective": "Переключатель канала ChatGPT в Настройках Web Pilot: Secure MCP Tunnel или собственный сервер (VPS); канал VPS для Claude работает всегда и следует за портом MCP.",
  "acceptance_criteria": [
    "В Настройках под «Локальные инструменты macOS» есть раздел «Подключение ChatGPT» с кнопками Secure MCP Tunnel и VPS",
    "В режиме VPS tunnel-client не запускается ни Web Pilot, ни автозапуском при входе в macOS; в режиме Secure Tunnel поведение прежнее",
    "Туннель VPS работает при любом выборе канала ChatGPT и после смены runtime пробрасывает текущий порт MCP",
    "Статус показывает готовность выбранного канала и состояние VPS; адрес коннектора скрыт, копируется кнопкой и нигде не сохраняется и не логируется",
    "Сборка и релиз не выполняются без отдельного поручения"
  ],
  "approved_scope": {
    "functional_paths": [
      "tools/codex-app-server-mcp/control.py",
      "tests/codex-app-server-mcp.test.mjs",
      "src/vps-tunnel.mjs",
      "src/mac-runtime-switch.mjs",
      "src/main.mjs",
      "src/preload.cjs",
      "tests/vps-tunnel.test.mjs",
      "tests/mac-runtime-switch.test.mjs",
      "src/ui/index.html",
      "src/ui/settings-panel.mjs",
      "tests/settings-chatgpt-channel.test.mjs",
      "package.json",
      "package-lock.json",
      "scripts/release-all.mjs",
      "scripts/check-installed-release.mjs",
      "scripts/check-github-release.mjs"
    ],
    "documentation_paths": [
      "docs/planning/chatgpt-channel-vps.md",
      "docs/PRODUCT.md",
      "docs/architecture/ARCHITECTURE.md",
      "docs/architecture/OVERVIEW.md",
      "docs/MODULES.md",
      "docs/DOCUMENTATION_INDEX.md",
      "docs/RELEASE.md",
      "docs/VERIFICATION.md"
    ]
  },
  "baseline_commit": "b2b7c5a57af30bb07930301b865445bbac3425ef",
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
        "path": "docs/planning/chatgpt-channel-vps.md",
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
        "scope_id": "chatgpt-channel-vps-20261004",
        "task_id": "T001",
        "role": "implementation"
      },
      "dependencies": [],
      "functional_paths": [
        "tools/codex-app-server-mcp/control.py",
        "tests/codex-app-server-mcp.test.mjs"
      ],
      "documentation_paths": [
        "docs/planning/chatgpt-channel-vps.md"
      ],
      "verification_ids": [
        "executor-channel"
      ],
      "id": "T001",
      "title": "Executor: канал ChatGPT в selector и запуск tunnel-client только для Secure Tunnel",
      "why": "Автозапуск при входе в macOS должен соблюдать выбор канала без открытого Web Pilot.",
      "verification_kind": "code",
      "acceptance_criteria": [
        "selector.json хранит chatgpt_channel (secure-tunnel по умолчанию, vps); команда configure-channel меняет только это поле",
        "stop --tunnel-only останавливает только tunnel-client",
        "selector-start в режиме vps не запускает и останавливает tunnel-client, в режиме secure-tunnel запускает как раньше",
        "status сообщает выбранный канал; неизвестное значение отклоняется"
      ],
      "expected_commit_message": "feat: Executor: канал ChatGPT в selector и запуск tunnel-client только для Secure Tunnel",
      "actual_files": [
        "tests/codex-app-server-mcp.test.mjs",
        "tools/codex-app-server-mcp/control.py"
      ]
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "chatgpt-channel-vps-20261004",
        "task_id": "T002",
        "role": "implementation"
      },
      "dependencies": [],
      "functional_paths": [
        "src/vps-tunnel.mjs",
        "src/mac-runtime-switch.mjs",
        "src/main.mjs",
        "src/preload.cjs",
        "tests/vps-tunnel.test.mjs",
        "tests/mac-runtime-switch.test.mjs"
      ],
      "documentation_paths": [
        "docs/planning/chatgpt-channel-vps.md"
      ],
      "verification_ids": [
        "vps-runtime",
        "executor-channel"
      ],
      "id": "T002",
      "title": "Туннель VPS следует за портом MCP; переключение канала ChatGPT в main",
      "why": "Канал VPS нужен Claude всегда, а порт MCP меняется при смене runtime.",
      "verification_kind": "code",
      "acceptance_criteria": [
        "LaunchAgent com.oleynik.vps-mcp-tunnel пробрасывает 127.0.0.1:17842 на текущий порт MCP; plist переписывается и агент перезагружается только при смене порта",
        "RemoteForward в блоке Host vps-mcp-tunnel блокирует перехват с понятным статусом",
        "Канал vps: tunnel-client остановлен, готовность = MCP + туннель VPS; канал secure-tunnel: прежнее поведение; ошибка VPS не ломает Secure Tunnel",
        "Выбор канала сохраняется в настройках и selector.json, переключение без перезапуска Web Pilot",
        "Полный адрес коннектора доступен только действию копирования и не попадает в статус, настройки и журналы"
      ],
      "expected_commit_message": "feat: Туннель VPS следует за портом MCP; переключение канала ChatGPT в main",
      "actual_files": [
        "src/mac-runtime-switch.mjs",
        "src/main.mjs",
        "src/preload.cjs",
        "src/vps-tunnel.mjs",
        "tests/mac-runtime-switch.test.mjs",
        "tests/vps-tunnel.test.mjs"
      ]
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "chatgpt-channel-vps-20261004",
        "task_id": "T003",
        "role": "implementation"
      },
      "dependencies": [],
      "functional_paths": [
        "src/ui/index.html",
        "src/ui/settings-panel.mjs",
        "tests/settings-chatgpt-channel.test.mjs"
      ],
      "documentation_paths": [
        "docs/planning/chatgpt-channel-vps.md"
      ],
      "verification_ids": [
        "settings-ui",
        "unit-all"
      ],
      "id": "T003",
      "title": "Раздел «Подключение ChatGPT» в Настройках",
      "why": "Пользователь переключает канал там же, где выбирает runtime.",
      "verification_kind": "code",
      "acceptance_criteria": [
        "Под «Локальные инструменты macOS» кнопки Secure MCP Tunnel и VPS с aria-pressed и блокировкой во время операции",
        "Статус выбранного канала и строка состояния VPS; без настройки VPS кнопка недоступна с подсказкой",
        "Адрес коннектора показан скрытым, «Скопировать» вызывает действие main",
        "Весь npm test проходит"
      ],
      "expected_commit_message": "feat: Раздел «Подключение ChatGPT» в Настройках",
      "actual_files": [
        "src/ui/index.html",
        "src/ui/settings-panel.mjs",
        "tests/settings-chatgpt-channel.test.mjs"
      ]
    },
    {
      "id": "T004",
      "title": "Подготовить source релиза 0.6.83",
      "why": "Новая функция доходит до пользователя только новой сборкой; версия поднимается до DOCS и сборки.",
      "dependencies": [
        "T003"
      ],
      "functional_paths": [
        "package.json",
        "package-lock.json"
      ],
      "documentation_paths": [],
      "verification_ids": [
        "release-source"
      ],
      "verification_kind": "code",
      "acceptance_criteria": [
        "package.json и package-lock.json задают 0.6.83",
        "release gates и bundled Workflow Kit 1.5.3 проверены без сборки"
      ],
      "expected_commit_message": "feat: Подготовить source релиза 0.6.83",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "chatgpt-channel-vps-20261004",
        "task_id": "T004",
        "role": "implementation"
      },
      "actual_files": [
        "package-lock.json",
        "package.json"
      ]
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "chatgpt-channel-vps-20261004",
        "task_id": "DOCS",
        "role": "implementation"
      },
      "dependencies": [
        "T001",
        "T002",
        "T003",
        "T004"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/planning/chatgpt-channel-vps.md",
        "docs/PRODUCT.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/architecture/OVERVIEW.md",
        "docs/MODULES.md",
        "docs/DOCUMENTATION_INDEX.md",
        "docs/RELEASE.md",
        "docs/VERIFICATION.md"
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
      "id": "T005",
      "title": "Собрать и проверить парный релиз 0.6.83",
      "why": "По поручению пользователя после задач плана пересобрать релиз.",
      "dependencies": [
        "T004",
        "DOCS"
      ],
      "functional_paths": [
        "scripts/release-all.mjs"
      ],
      "documentation_paths": [],
      "verification_ids": [
        "paired-release"
      ],
      "verification_kind": "package",
      "acceptance_criteria": [
        "~/Downloads/WebPilot-0.6.83 содержит macOS arm64 ZIP, Windows x64 ZIP, SHA256SUMS.txt, INSTALL.txt, release-manifest.json",
        "release-manifest.sourceCommit — коммит до delivery bookkeeping, packagedSourceMatches=true",
        "macOS подписан сертификатом UkrHD; Windows прошёл verify:win на Mac",
        "Перед сборкой записан release-0.6.83-preflight.json с identity обеих Mac-копий"
      ],
      "expected_commit_message": "feat: Собрать и проверить парный релиз 0.6.83",
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "chatgpt-channel-vps-20261004",
        "task_id": "T005",
        "role": "implementation"
      }
    },
    {
      "id": "T006",
      "title": "Установить 0.6.83 и проверить установленные macOS-копии",
      "why": "Пользователь работает из /Applications; установка без пересборки.",
      "dependencies": [
        "T005",
        "DOCS"
      ],
      "functional_paths": [
        "scripts/check-installed-release.mjs"
      ],
      "documentation_paths": [],
      "verification_ids": [
        "release-installed"
      ],
      "verification_kind": "installed",
      "acceptance_criteria": [
        "/Applications/Project Web Pilot.app обновлена из staging штатным installMacBundle без пересборки, identity сохранена",
        "check-installed-release.mjs проверяет обе Mac-копии, staging, ZIP, подпись и runtime"
      ],
      "expected_commit_message": "feat: Установить 0.6.83 и проверить установленные macOS-копии",
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "chatgpt-channel-vps-20261004",
        "task_id": "T006",
        "role": "implementation"
      }
    },
    {
      "id": "T007",
      "title": "Опубликовать 0.6.83 и синхронизировать Project Web Pilot с GitHub",
      "why": "По поручению пользователя отправить релиз на GitHub.",
      "dependencies": [
        "T006",
        "DOCS"
      ],
      "functional_paths": [
        "scripts/check-github-release.mjs"
      ],
      "documentation_paths": [
        "docs/RELEASE.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "github-release"
      ],
      "verification_kind": "package",
      "acceptance_criteria": [
        "Tag v0.6.83 указывает на release-manifest.sourceCommit",
        "GitHub Release v0.6.83 не draft/prerelease, ровно пять файлов, server digest совпадает с локальными",
        "После managed commit финальный main отправлен и origin/main == local HEAD",
        "Документы фиксируют фактическую публикацию"
      ],
      "expected_commit_message": "feat: Опубликовать 0.6.83 и синхронизировать Project Web Pilot с GitHub",
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "chatgpt-channel-vps-20261004",
        "task_id": "T007",
        "role": "implementation"
      }
    }
  ],
  "blocked_reason": null,
  "user_decisions": [
    {
      "id": "d8efc37c-0916-40c1-8b85-6093c04008e1",
      "text": "Прямое поручение пользователя 04.10.2026: закрыть scope 0.6.82 и создать план переключателя Secure Tunnel ↔ VPS в Настройках под «Локальные инструменты macOS».",
      "recorded_at": "2026-10-04T09:32:27.057Z"
    }
  ]
}
```
<!-- workflow-state:end -->

## Состояние

Execution Scope Status: ACTIVE
Delivery Status: IN_PROGRESS
Scope: chatgpt-channel-vps-20261004
Current Task: нет
Revision: 1049

## Цель

Переключатель канала ChatGPT в Настройках Web Pilot: Secure MCP Tunnel или собственный сервер (VPS); канал VPS для Claude работает всегда и следует за портом MCP.

## Критерии приёмки

- В Настройках под «Локальные инструменты macOS» есть раздел «Подключение ChatGPT» с кнопками Secure MCP Tunnel и VPS
- В режиме VPS tunnel-client не запускается ни Web Pilot, ни автозапуском при входе в macOS; в режиме Secure Tunnel поведение прежнее
- Туннель VPS работает при любом выборе канала ChatGPT и после смены runtime пробрасывает текущий порт MCP
- Статус показывает готовность выбранного канала и состояние VPS; адрес коннектора скрыт, копируется кнопкой и нигде не сохраняется и не логируется
- Сборка и релиз не выполняются без отдельного поручения

## Микрозадачи

- [DONE] T001: Executor: канал ChatGPT в selector и запуск tunnel-client только для Secure Tunnel — Завершено
  - Git Commit: [DONE] feat: Executor: канал ChatGPT в selector и запуск tunnel-client только для Secure Tunnel
  - Reference: chatgpt-channel-vps-20261004 / T001 / implementation
  - Файлы: tools/codex-app-server-mcp/control.py, tests/codex-app-server-mcp.test.mjs, docs/planning/chatgpt-channel-vps.md
- [DONE] T002: Туннель VPS следует за портом MCP; переключение канала ChatGPT в main — Завершено
  - Git Commit: [DONE] feat: Туннель VPS следует за портом MCP; переключение канала ChatGPT в main
  - Reference: chatgpt-channel-vps-20261004 / T002 / implementation
  - Файлы: src/vps-tunnel.mjs, src/mac-runtime-switch.mjs, src/main.mjs, src/preload.cjs, tests/vps-tunnel.test.mjs, tests/mac-runtime-switch.test.mjs, docs/planning/chatgpt-channel-vps.md
- [DONE] T003: Раздел «Подключение ChatGPT» в Настройках — Завершено
  - Git Commit: [DONE] feat: Раздел «Подключение ChatGPT» в Настройках
  - Reference: chatgpt-channel-vps-20261004 / T003 / implementation
  - Файлы: src/ui/index.html, src/ui/settings-panel.mjs, tests/settings-chatgpt-channel.test.mjs, docs/planning/chatgpt-channel-vps.md
- [DONE] T004: Подготовить source релиза 0.6.83 — Завершено
  - Git Commit: [DONE] feat: Подготовить source релиза 0.6.83
  - Reference: chatgpt-channel-vps-20261004 / T004 / implementation
  - Файлы: package.json, package-lock.json
- [TODO] DOCS: Актуализация всех документов проекта — Ожидает
  - Git Commit: [PENDING] docs: актуализировать контекст проекта
  - Reference: chatgpt-channel-vps-20261004 / DOCS / implementation
  - Файлы: docs/planning/chatgpt-channel-vps.md, docs/PRODUCT.md, docs/architecture/ARCHITECTURE.md, docs/architecture/OVERVIEW.md, docs/MODULES.md, docs/DOCUMENTATION_INDEX.md, docs/RELEASE.md, docs/VERIFICATION.md
- [TODO] T005: Собрать и проверить парный релиз 0.6.83 — Ожидает
  - Git Commit: [PENDING] feat: Собрать и проверить парный релиз 0.6.83
  - Reference: chatgpt-channel-vps-20261004 / T005 / implementation
  - Файлы: scripts/release-all.mjs
- [TODO] T006: Установить 0.6.83 и проверить установленные macOS-копии — Ожидает
  - Git Commit: [PENDING] feat: Установить 0.6.83 и проверить установленные macOS-копии
  - Reference: chatgpt-channel-vps-20261004 / T006 / implementation
  - Файлы: scripts/check-installed-release.mjs
- [TODO] T007: Опубликовать 0.6.83 и синхронизировать Project Web Pilot с GitHub — Ожидает
  - Git Commit: [PENDING] feat: Опубликовать 0.6.83 и синхронизировать Project Web Pilot с GitHub
  - Reference: chatgpt-channel-vps-20261004 / T007 / implementation
  - Файлы: scripts/check-github-release.mjs, docs/RELEASE.md, docs/VERIFICATION.md

## Context Pack For This Cycle

- docs/architecture/OVERVIEW.md → Краткая архитектура проекта
- docs/MODULES.md → Модули проекта
- docs/DOCUMENTATION_INDEX.md → Каталог документации
- docs/planning/chatgpt-channel-vps.md

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
