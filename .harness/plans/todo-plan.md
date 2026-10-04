# Активный план — Project Web Pilot

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 1133,
  "project_id": "cf944136-d1fc-4bd5-9ea0-e46d1fe230e7",
  "project_name": "Project Web Pilot",
  "scope_id": "mcp-start-message-0.6.88-20261004",
  "execution_scope_status": "ACTIVE",
  "delivery_status": "IN_PROGRESS",
  "objective": "Web Pilot сам начинает MCP-сессию коротким стартовым сообщением; агент читает контекст через MCP; релиз 0.6.88.",
  "acceptance_criteria": [
    "Web Pilot сам начинает MCP-сессию коротким стартовым сообщением; агент читает контекст через MCP; релиз 0.6.88."
  ],
  "approved_scope": {
    "functional_paths": [
      "src/context-session.mjs",
      "src/ui/sidebar.mjs",
      "src/ui/progress.mjs",
      "tests/context-session.test.mjs",
      "tests/sidebar.test.mjs",
      "tests/progress.test.mjs",
      "package.json",
      "package-lock.json",
      "scripts/release-all.mjs",
      "scripts/check-installed-release.mjs",
      "scripts/check-github-release.mjs"
    ],
    "documentation_paths": [
      "docs/planning/mcp-start-message.md",
      "docs/PRODUCT.md",
      "docs/architecture/ARCHITECTURE.md",
      "docs/architecture/OVERVIEW.md",
      "docs/MODULES.md",
      "docs/DOCUMENTATION_INDEX.md"
    ]
  },
  "baseline_commit": "ff914be35b996ba2357d17ecccb6d808258d439d",
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
        "path": "docs/planning/mcp-start-message.md",
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
        "scope_id": "mcp-start-message-0.6.88-20261004",
        "task_id": "T001",
        "role": "implementation"
      },
      "dependencies": [],
      "functional_paths": [
        "src/context-session.mjs",
        "src/ui/sidebar.mjs",
        "src/ui/progress.mjs",
        "tests/context-session.test.mjs",
        "tests/sidebar.test.mjs",
        "tests/progress.test.mjs"
      ],
      "documentation_paths": [
        "docs/planning/mcp-start-message.md"
      ],
      "verification_ids": [
        "unit-all"
      ],
      "id": "T001",
      "title": "MCP: Web Pilot начинает сессию коротким стартовым сообщением",
      "why": "В 0.6.87 первое сообщение «Начинаем новую сессию.» не вызвало workflow_context_recover; сообщение с проектом, папкой и порядком частей вызвало.",
      "verification_kind": "code",
      "acceptance_criteria": [
        "Новая MCP-сессия отправляет одно стартовое сообщение без загрузки пакета и привязывает чат по нему",
        "Привязанный, ручной и прежний чат стартового сообщения не получают",
        "Сайдбар и индикатор показывают стартовое сообщение и чтение через MCP; доставка первым сообщением без изменений"
      ],
      "expected_commit_message": "feat: MCP: Web Pilot начинает сессию коротким стартовым сообщением",
      "actual_files": []
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "mcp-start-message-0.6.88-20261004",
        "task_id": "T002",
        "role": "implementation"
      },
      "dependencies": [],
      "functional_paths": [
        "package.json",
        "package-lock.json",
        "src/context-session.mjs",
        "src/ui/progress.mjs",
        "src/ui/sidebar.mjs",
        "tests/context-session.test.mjs",
        "tests/progress.test.mjs",
        "tests/sidebar.test.mjs"
      ],
      "documentation_paths": [
        "docs/planning/mcp-start-message.md"
      ],
      "verification_ids": [
        "release-source"
      ],
      "id": "T002",
      "title": "Подготовить source релиза 0.6.88",
      "why": "Правки доходят до пользователя новой сборкой.",
      "verification_kind": "code",
      "acceptance_criteria": [
        "package.json и package-lock.json задают 0.6.88"
      ],
      "expected_commit_message": "feat: Подготовить source релиза 0.6.88",
      "actual_files": [
        "package.json",
        "package-lock.json",
        "src/context-session.mjs",
        "src/ui/progress.mjs",
        "src/ui/sidebar.mjs",
        "tests/context-session.test.mjs",
        "tests/progress.test.mjs",
        "tests/sidebar.test.mjs"
      ]
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "mcp-start-message-0.6.88-20261004",
        "task_id": "DOCS",
        "role": "implementation"
      },
      "dependencies": [
        "T001",
        "T002"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/planning/mcp-start-message.md",
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
        "scope_id": "mcp-start-message-0.6.88-20261004",
        "task_id": "T003",
        "role": "implementation"
      },
      "dependencies": [
        "DOCS"
      ],
      "functional_paths": [
        "scripts/release-all.mjs"
      ],
      "documentation_paths": [
        "docs/planning/mcp-start-message.md"
      ],
      "verification_ids": [
        "paired-release"
      ],
      "id": "T003",
      "title": "Собрать и проверить парный релиз 0.6.88",
      "why": "Пересобрать релиз после правок.",
      "verification_kind": "package",
      "acceptance_criteria": [
        "~/Downloads/WebPilot-0.6.88 собран из коммита после DOCS, packagedSourceMatches=true, bundled Workflow Kit 1.5.4",
        "Preflight identity записан до сборки"
      ],
      "expected_commit_message": "feat: Собрать и проверить парный релиз 0.6.88"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "mcp-start-message-0.6.88-20261004",
        "task_id": "T004",
        "role": "implementation"
      },
      "dependencies": [
        "DOCS"
      ],
      "functional_paths": [
        "scripts/check-installed-release.mjs"
      ],
      "documentation_paths": [
        "docs/planning/mcp-start-message.md"
      ],
      "verification_ids": [
        "release-installed"
      ],
      "id": "T004",
      "title": "Установить 0.6.88 и проверить установленные macOS-копии",
      "why": "Пользователь работает из /Applications.",
      "verification_kind": "installed",
      "acceptance_criteria": [
        "/Applications обновлена из staging без пересборки, identity сохранена, release-installed проходит"
      ],
      "expected_commit_message": "feat: Установить 0.6.88 и проверить установленные macOS-копии"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "mcp-start-message-0.6.88-20261004",
        "task_id": "T005",
        "role": "implementation"
      },
      "dependencies": [
        "DOCS"
      ],
      "functional_paths": [
        "scripts/check-github-release.mjs"
      ],
      "documentation_paths": [
        "docs/planning/mcp-start-message.md"
      ],
      "verification_ids": [
        "github-release"
      ],
      "id": "T005",
      "title": "Опубликовать 0.6.88 и синхронизировать Project Web Pilot с GitHub",
      "why": "Отправить релиз на GitHub.",
      "verification_kind": "package",
      "acceptance_criteria": [
        "Tag v0.6.88 на sourceCommit, пять assets совпадают с локальной поставкой, main синхронизирован"
      ],
      "expected_commit_message": "feat: Опубликовать 0.6.88 и синхронизировать Project Web Pilot с GitHub"
    }
  ],
  "blocked_reason": null,
  "user_decisions": [
    {
      "id": "66f5d062-f192-4e7d-85e7-a5ae9211f1a9",
      "text": "Пользователь поручил выполнить описанную задачу и план.",
      "recorded_at": "2026-10-04T15:56:41.662Z"
    }
  ]
}
```
<!-- workflow-state:end -->

## Состояние

Execution Scope Status: ACTIVE
Delivery Status: IN_PROGRESS
Scope: mcp-start-message-0.6.88-20261004
Current Task: нет
Revision: 1133

## Цель

Web Pilot сам начинает MCP-сессию коротким стартовым сообщением; агент читает контекст через MCP; релиз 0.6.88.

## Критерии приёмки

- Web Pilot сам начинает MCP-сессию коротким стартовым сообщением; агент читает контекст через MCP; релиз 0.6.88.

## Микрозадачи

- [DONE] T001: MCP: Web Pilot начинает сессию коротким стартовым сообщением — Завершено
  - Git Commit: [DONE] feat: MCP: Web Pilot начинает сессию коротким стартовым сообщением
  - Reference: mcp-start-message-0.6.88-20261004 / T001 / implementation
  - Файлы: src/context-session.mjs, src/ui/sidebar.mjs, src/ui/progress.mjs, tests/context-session.test.mjs, tests/sidebar.test.mjs, tests/progress.test.mjs, docs/planning/mcp-start-message.md
- [DONE] T002: Подготовить source релиза 0.6.88 — Завершено
  - Git Commit: [DONE] feat: Подготовить source релиза 0.6.88
  - Reference: mcp-start-message-0.6.88-20261004 / T002 / implementation
  - Файлы: package.json, package-lock.json, src/context-session.mjs, src/ui/progress.mjs, src/ui/sidebar.mjs, tests/context-session.test.mjs, tests/progress.test.mjs, tests/sidebar.test.mjs, docs/planning/mcp-start-message.md
- [TODO] DOCS: Актуализация всех документов проекта — Ожидает
  - Git Commit: [PENDING] docs: актуализировать контекст проекта
  - Reference: mcp-start-message-0.6.88-20261004 / DOCS / implementation
  - Файлы: docs/planning/mcp-start-message.md, docs/PRODUCT.md, docs/architecture/ARCHITECTURE.md, docs/architecture/OVERVIEW.md, docs/MODULES.md, docs/DOCUMENTATION_INDEX.md
- [TODO] T003: Собрать и проверить парный релиз 0.6.88 — Ожидает
  - Git Commit: [PENDING] feat: Собрать и проверить парный релиз 0.6.88
  - Reference: mcp-start-message-0.6.88-20261004 / T003 / implementation
  - Файлы: scripts/release-all.mjs, docs/planning/mcp-start-message.md
- [TODO] T004: Установить 0.6.88 и проверить установленные macOS-копии — Ожидает
  - Git Commit: [PENDING] feat: Установить 0.6.88 и проверить установленные macOS-копии
  - Reference: mcp-start-message-0.6.88-20261004 / T004 / implementation
  - Файлы: scripts/check-installed-release.mjs, docs/planning/mcp-start-message.md
- [TODO] T005: Опубликовать 0.6.88 и синхронизировать Project Web Pilot с GitHub — Ожидает
  - Git Commit: [PENDING] feat: Опубликовать 0.6.88 и синхронизировать Project Web Pilot с GitHub
  - Reference: mcp-start-message-0.6.88-20261004 / T005 / implementation
  - Файлы: scripts/check-github-release.mjs, docs/planning/mcp-start-message.md

## Context Pack For This Cycle

- docs/architecture/OVERVIEW.md → Краткая архитектура проекта
- docs/MODULES.md → Модули проекта
- docs/DOCUMENTATION_INDEX.md → Каталог документации
- docs/planning/mcp-start-message.md

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
