# Активный план — Project Web Pilot

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 1097,
  "project_id": "cf944136-d1fc-4bd5-9ea0-e46d1fe230e7",
  "project_name": "Project Web Pilot",
  "scope_id": "mcp-context-delivery-0.6.86-20261004",
  "execution_scope_status": "ACTIVE",
  "delivery_status": "IN_PROGRESS",
  "objective": "Агент получает recovery через MCP частями; Web Pilot (Codex App Server) больше не вставляет пакет в ChatGPT; релиз 0.6.86.",
  "acceptance_criteria": [
    "Агент получает recovery через MCP частями; Web Pilot (Codex App Server) больше не вставляет пакет в ChatGPT; релиз 0.6.86."
  ],
  "approved_scope": {
    "functional_paths": [
      "tools/codex-app-server-mcp/server.py",
      "tests/codex-app-server-mcp.test.mjs",
      "src/context-session.mjs",
      "src/mac-runtime-switch.mjs",
      "src/ui/sidebar.mjs",
      "tests/context-session.test.mjs",
      "tests/mac-runtime-switch.test.mjs",
      "package.json",
      "package-lock.json",
      "scripts/release-all.mjs",
      "scripts/check-installed-release.mjs",
      "scripts/check-github-release.mjs"
    ],
    "documentation_paths": [
      "docs/planning/mcp-context-delivery.md",
      "tools/codex-app-server-mcp/session-rules.md",
      "docs/PRODUCT.md",
      "docs/architecture/ARCHITECTURE.md",
      "docs/architecture/OVERVIEW.md",
      "docs/MODULES.md",
      "docs/DOCUMENTATION_INDEX.md"
    ]
  },
  "baseline_commit": "9cd25faf5743fff706269ef7589705f4306384b7",
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
        "path": "docs/planning/mcp-context-delivery.md",
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
        "scope_id": "mcp-context-delivery-0.6.86-20261004",
        "task_id": "T001",
        "role": "implementation"
      },
      "dependencies": [],
      "functional_paths": [
        "tools/codex-app-server-mcp/server.py",
        "tests/codex-app-server-mcp.test.mjs"
      ],
      "documentation_paths": [
        "docs/planning/mcp-context-delivery.md",
        "tools/codex-app-server-mcp/session-rules.md"
      ],
      "verification_ids": [
        "executor-channel"
      ],
      "id": "T001",
      "title": "MCP: recovery частями, правила сессии и проект по умолчанию",
      "why": "ChatGPT показывает модели не больше ~10 000 токенов результата; пакет нужно отдавать частями.",
      "verification_kind": "code",
      "acceptance_criteria": [
        "part≥1: части ≤20000 байт только текстом, «ЧАСТЬ N ИЗ M», один sha256, следующий вызов указан",
        "Часть 1 начинается с правил сессии Web Pilot",
        "workspace по умолчанию из active-workspace.json; без него понятная ошибка",
        "part=0 отдаёт весь пакет как раньше",
        "instructions требуют прочитать все части перед первым ответом"
      ],
      "expected_commit_message": "feat: MCP: recovery частями, правила сессии и проект по умолчанию",
      "actual_files": [
        "tests/codex-app-server-mcp.test.mjs",
        "tools/codex-app-server-mcp/server.py",
        "tools/codex-app-server-mcp/session-rules.md"
      ]
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "mcp-context-delivery-0.6.86-20261004",
        "task_id": "T002",
        "role": "implementation"
      },
      "dependencies": [],
      "functional_paths": [
        "src/context-session.mjs",
        "src/mac-runtime-switch.mjs",
        "src/ui/sidebar.mjs",
        "tests/context-session.test.mjs",
        "tests/mac-runtime-switch.test.mjs"
      ],
      "documentation_paths": [
        "docs/planning/mcp-context-delivery.md"
      ],
      "verification_ids": [
        "unit-all"
      ],
      "id": "T002",
      "title": "Web Pilot: сессии Codex App Server без вставки recovery",
      "why": "Контекст агент получает сам через MCP; вставка 88 КБ в поле ChatGPT больше не нужна.",
      "verification_kind": "code",
      "acceptance_criteria": [
        "В режиме MCP новая сессия не загружает и не вставляет пакет, фаза «Можно начинать»",
        "Чат привязывается по первому сообщению пользователя, фаза «Чат проекта»",
        "Выбранный проект записывается в active-workspace.json executor",
        "Прежняя доставка для Codex Local Mac, Windows и fixture без изменений"
      ],
      "expected_commit_message": "feat: Web Pilot: сессии Codex App Server без вставки recovery"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "mcp-context-delivery-0.6.86-20261004",
        "task_id": "T003",
        "role": "implementation"
      },
      "dependencies": [],
      "functional_paths": [
        "package.json",
        "package-lock.json"
      ],
      "documentation_paths": [
        "docs/planning/mcp-context-delivery.md"
      ],
      "verification_ids": [
        "release-source"
      ],
      "id": "T003",
      "title": "Подготовить source релиза 0.6.86",
      "why": "Правки доходят до пользователя новой сборкой.",
      "verification_kind": "code",
      "acceptance_criteria": [
        "package.json и package-lock.json задают 0.6.86"
      ],
      "expected_commit_message": "feat: Подготовить source релиза 0.6.86"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "mcp-context-delivery-0.6.86-20261004",
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
        "docs/planning/mcp-context-delivery.md",
        "docs/PRODUCT.md",
        "docs/architecture/ARCHITECTURE.md",
        "tools/codex-app-server-mcp/session-rules.md",
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
        "scope_id": "mcp-context-delivery-0.6.86-20261004",
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
        "docs/planning/mcp-context-delivery.md"
      ],
      "verification_ids": [
        "paired-release"
      ],
      "id": "T004",
      "title": "Собрать и проверить парный релиз 0.6.86",
      "why": "Пересобрать релиз после правок.",
      "verification_kind": "package",
      "acceptance_criteria": [
        "~/Downloads/WebPilot-0.6.86 собран из коммита после DOCS, packagedSourceMatches=true",
        "Preflight identity записан до сборки"
      ],
      "expected_commit_message": "feat: Собрать и проверить парный релиз 0.6.86"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "mcp-context-delivery-0.6.86-20261004",
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
        "docs/planning/mcp-context-delivery.md"
      ],
      "verification_ids": [
        "release-installed"
      ],
      "id": "T005",
      "title": "Установить 0.6.86 и проверить установленные macOS-копии",
      "why": "Пользователь работает из /Applications.",
      "verification_kind": "installed",
      "acceptance_criteria": [
        "/Applications обновлена из staging без пересборки, identity сохранена, release-installed проходит"
      ],
      "expected_commit_message": "feat: Установить 0.6.86 и проверить установленные macOS-копии"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "mcp-context-delivery-0.6.86-20261004",
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
        "docs/planning/mcp-context-delivery.md"
      ],
      "verification_ids": [
        "github-release"
      ],
      "id": "T006",
      "title": "Опубликовать 0.6.86 и синхронизировать Project Web Pilot с GitHub",
      "why": "Отправить релиз на GitHub.",
      "verification_kind": "package",
      "acceptance_criteria": [
        "Tag v0.6.86 на sourceCommit, пять assets совпадают с локальной поставкой, main синхронизирован"
      ],
      "expected_commit_message": "feat: Опубликовать 0.6.86 и синхронизировать Project Web Pilot с GitHub"
    }
  ],
  "blocked_reason": null,
  "user_decisions": [
    {
      "id": "eefd43bf-45ad-462a-8cf2-83834966a11e",
      "text": "Пользователь поручил выполнить описанную задачу и план.",
      "recorded_at": "2026-10-04T14:26:58.618Z"
    }
  ]
}
```
<!-- workflow-state:end -->

## Состояние

Execution Scope Status: ACTIVE
Delivery Status: IN_PROGRESS
Scope: mcp-context-delivery-0.6.86-20261004
Current Task: нет
Revision: 1097

## Цель

Агент получает recovery через MCP частями; Web Pilot (Codex App Server) больше не вставляет пакет в ChatGPT; релиз 0.6.86.

## Критерии приёмки

- Агент получает recovery через MCP частями; Web Pilot (Codex App Server) больше не вставляет пакет в ChatGPT; релиз 0.6.86.

## Микрозадачи

- [DONE] T001: MCP: recovery частями, правила сессии и проект по умолчанию — Завершено
  - Git Commit: [DONE] feat: MCP: recovery частями, правила сессии и проект по умолчанию
  - Reference: mcp-context-delivery-0.6.86-20261004 / T001 / implementation
  - Файлы: tools/codex-app-server-mcp/server.py, tests/codex-app-server-mcp.test.mjs, docs/planning/mcp-context-delivery.md, tools/codex-app-server-mcp/session-rules.md
- [TODO] T002: Web Pilot: сессии Codex App Server без вставки recovery — Ожидает
  - Git Commit: [PENDING] feat: Web Pilot: сессии Codex App Server без вставки recovery
  - Reference: mcp-context-delivery-0.6.86-20261004 / T002 / implementation
  - Файлы: src/context-session.mjs, src/mac-runtime-switch.mjs, src/ui/sidebar.mjs, tests/context-session.test.mjs, tests/mac-runtime-switch.test.mjs, docs/planning/mcp-context-delivery.md
- [TODO] T003: Подготовить source релиза 0.6.86 — Ожидает
  - Git Commit: [PENDING] feat: Подготовить source релиза 0.6.86
  - Reference: mcp-context-delivery-0.6.86-20261004 / T003 / implementation
  - Файлы: package.json, package-lock.json, docs/planning/mcp-context-delivery.md
- [TODO] DOCS: Актуализация всех документов проекта — Ожидает
  - Git Commit: [PENDING] docs: актуализировать контекст проекта
  - Reference: mcp-context-delivery-0.6.86-20261004 / DOCS / implementation
  - Файлы: docs/planning/mcp-context-delivery.md, docs/PRODUCT.md, docs/architecture/ARCHITECTURE.md, tools/codex-app-server-mcp/session-rules.md, docs/architecture/OVERVIEW.md, docs/MODULES.md, docs/DOCUMENTATION_INDEX.md
- [TODO] T004: Собрать и проверить парный релиз 0.6.86 — Ожидает
  - Git Commit: [PENDING] feat: Собрать и проверить парный релиз 0.6.86
  - Reference: mcp-context-delivery-0.6.86-20261004 / T004 / implementation
  - Файлы: scripts/release-all.mjs, docs/planning/mcp-context-delivery.md
- [TODO] T005: Установить 0.6.86 и проверить установленные macOS-копии — Ожидает
  - Git Commit: [PENDING] feat: Установить 0.6.86 и проверить установленные macOS-копии
  - Reference: mcp-context-delivery-0.6.86-20261004 / T005 / implementation
  - Файлы: scripts/check-installed-release.mjs, docs/planning/mcp-context-delivery.md
- [TODO] T006: Опубликовать 0.6.86 и синхронизировать Project Web Pilot с GitHub — Ожидает
  - Git Commit: [PENDING] feat: Опубликовать 0.6.86 и синхронизировать Project Web Pilot с GitHub
  - Reference: mcp-context-delivery-0.6.86-20261004 / T006 / implementation
  - Файлы: scripts/check-github-release.mjs, docs/planning/mcp-context-delivery.md

## Context Pack For This Cycle

- docs/architecture/OVERVIEW.md → Краткая архитектура проекта
- docs/MODULES.md → Модули проекта
- docs/DOCUMENTATION_INDEX.md → Каталог документации
- docs/planning/mcp-context-delivery.md

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
