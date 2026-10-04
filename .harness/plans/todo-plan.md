# Активный план — Project Web Pilot

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 1039,
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
      "tests/settings-chatgpt-channel.test.mjs"
    ],
    "documentation_paths": [
      "docs/planning/chatgpt-channel-vps.md",
      "docs/PRODUCT.md",
      "docs/architecture/ARCHITECTURE.md",
      "docs/architecture/OVERVIEW.md",
      "docs/MODULES.md",
      "docs/DOCUMENTATION_INDEX.md"
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
      "implementation_status": "TODO",
      "commit_status": "PENDING",
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
      "expected_commit_message": "feat: Executor: канал ChatGPT в selector и запуск tunnel-client только для Secure Tunnel"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
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
      "expected_commit_message": "feat: Туннель VPS следует за портом MCP; переключение канала ChatGPT в main"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
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
      "expected_commit_message": "feat: Раздел «Подключение ChatGPT» в Настройках"
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
        "T003"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/planning/chatgpt-channel-vps.md",
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
Revision: 1039

## Цель

Переключатель канала ChatGPT в Настройках Web Pilot: Secure MCP Tunnel или собственный сервер (VPS); канал VPS для Claude работает всегда и следует за портом MCP.

## Критерии приёмки

- В Настройках под «Локальные инструменты macOS» есть раздел «Подключение ChatGPT» с кнопками Secure MCP Tunnel и VPS
- В режиме VPS tunnel-client не запускается ни Web Pilot, ни автозапуском при входе в macOS; в режиме Secure Tunnel поведение прежнее
- Туннель VPS работает при любом выборе канала ChatGPT и после смены runtime пробрасывает текущий порт MCP
- Статус показывает готовность выбранного канала и состояние VPS; адрес коннектора скрыт, копируется кнопкой и нигде не сохраняется и не логируется
- Сборка и релиз не выполняются без отдельного поручения

## Микрозадачи

- [TODO] T001: Executor: канал ChatGPT в selector и запуск tunnel-client только для Secure Tunnel — Ожидает
  - Git Commit: [PENDING] feat: Executor: канал ChatGPT в selector и запуск tunnel-client только для Secure Tunnel
  - Reference: chatgpt-channel-vps-20261004 / T001 / implementation
  - Файлы: tools/codex-app-server-mcp/control.py, tests/codex-app-server-mcp.test.mjs, docs/planning/chatgpt-channel-vps.md
- [TODO] T002: Туннель VPS следует за портом MCP; переключение канала ChatGPT в main — Ожидает
  - Git Commit: [PENDING] feat: Туннель VPS следует за портом MCP; переключение канала ChatGPT в main
  - Reference: chatgpt-channel-vps-20261004 / T002 / implementation
  - Файлы: src/vps-tunnel.mjs, src/mac-runtime-switch.mjs, src/main.mjs, src/preload.cjs, tests/vps-tunnel.test.mjs, tests/mac-runtime-switch.test.mjs, docs/planning/chatgpt-channel-vps.md
- [TODO] T003: Раздел «Подключение ChatGPT» в Настройках — Ожидает
  - Git Commit: [PENDING] feat: Раздел «Подключение ChatGPT» в Настройках
  - Reference: chatgpt-channel-vps-20261004 / T003 / implementation
  - Файлы: src/ui/index.html, src/ui/settings-panel.mjs, tests/settings-chatgpt-channel.test.mjs, docs/planning/chatgpt-channel-vps.md
- [TODO] DOCS: Актуализация всех документов проекта — Ожидает
  - Git Commit: [PENDING] docs: актуализировать контекст проекта
  - Reference: chatgpt-channel-vps-20261004 / DOCS / implementation
  - Файлы: docs/planning/chatgpt-channel-vps.md, docs/PRODUCT.md, docs/architecture/ARCHITECTURE.md, docs/architecture/OVERVIEW.md, docs/MODULES.md, docs/DOCUMENTATION_INDEX.md

## Context Pack For This Cycle

- docs/architecture/OVERVIEW.md → Краткая архитектура проекта
- docs/MODULES.md → Модули проекта
- docs/DOCUMENTATION_INDEX.md → Каталог документации
- docs/planning/chatgpt-channel-vps.md

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
