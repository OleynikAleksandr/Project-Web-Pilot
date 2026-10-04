# Активный план — Project Web Pilot

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 1064,
  "project_id": "cf944136-d1fc-4bd5-9ea0-e46d1fe230e7",
  "project_name": "Project Web Pilot",
  "scope_id": "mcp-stateless-0.6.84-20261004",
  "execution_scope_status": "ACTIVE",
  "delivery_status": "IN_PROGRESS",
  "objective": "Сервер MCP App Server без сессий: перезапуск Web Pilot не ломает коннекторы ChatGPT и Claude через VPS; релиз 0.6.84.",
  "acceptance_criteria": [
    "Запрос с устаревшим Mcp-Session-Id к серверу App Server получает ответ без initialize",
    "Релиз 0.6.84 собран, установлен в /Applications и опубликован на GitHub после DOCS"
  ],
  "approved_scope": {
    "functional_paths": [
      "tools/codex-app-server-mcp/server.py",
      "tests/codex-app-server-mcp.test.mjs",
      "package.json",
      "package-lock.json",
      "scripts/release-all.mjs",
      "scripts/check-installed-release.mjs",
      "scripts/check-github-release.mjs"
    ],
    "documentation_paths": [
      "docs/planning/mcp-stateless-sessions.md",
      "docs/PRODUCT.md",
      "docs/architecture/ARCHITECTURE.md",
      "docs/RELEASE.md",
      "docs/VERIFICATION.md",
      "docs/architecture/OVERVIEW.md",
      "docs/MODULES.md",
      "docs/DOCUMENTATION_INDEX.md"
    ]
  },
  "baseline_commit": "0514b7f580b854dca651b07d0746ebd94b3ec2d7",
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
        "path": "docs/planning/mcp-stateless-sessions.md",
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
        "scope_id": "mcp-stateless-0.6.84-20261004",
        "task_id": "T001",
        "role": "implementation"
      },
      "dependencies": [],
      "functional_paths": [
        "tools/codex-app-server-mcp/server.py",
        "tests/codex-app-server-mcp.test.mjs"
      ],
      "documentation_paths": [
        "docs/planning/mcp-stateless-sessions.md"
      ],
      "verification_ids": [
        "executor-channel",
        "unit-all"
      ],
      "id": "T001",
      "title": "MCP App Server без сессий",
      "why": "ChatGPT через VPS получает Session terminated после каждого перезапуска MCP.",
      "verification_kind": "code",
      "acceptance_criteria": [
        "FastMCP создаётся со stateless_http=True",
        "tools/list с устаревшим Mcp-Session-Id без initialize возвращает инструменты",
        "Весь npm test проходит"
      ],
      "expected_commit_message": "feat: MCP App Server без сессий",
      "actual_files": [
        "tests/codex-app-server-mcp.test.mjs",
        "tools/codex-app-server-mcp/server.py"
      ]
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "mcp-stateless-0.6.84-20261004",
        "task_id": "T002",
        "role": "implementation"
      },
      "dependencies": [],
      "functional_paths": [
        "package.json",
        "package-lock.json"
      ],
      "documentation_paths": [
        "docs/planning/mcp-stateless-sessions.md"
      ],
      "verification_ids": [
        "release-source"
      ],
      "id": "T002",
      "title": "Подготовить source релиза 0.6.84",
      "why": "Исправление доходит до пользователя новой сборкой.",
      "verification_kind": "code",
      "acceptance_criteria": [
        "package.json и package-lock.json задают 0.6.84"
      ],
      "expected_commit_message": "feat: Подготовить source релиза 0.6.84",
      "actual_files": [
        "package-lock.json",
        "package.json"
      ]
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "mcp-stateless-0.6.84-20261004",
        "task_id": "DOCS",
        "role": "implementation"
      },
      "dependencies": [
        "T001",
        "T002"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/planning/mcp-stateless-sessions.md",
        "docs/PRODUCT.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/RELEASE.md",
        "docs/VERIFICATION.md",
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
        "scope_id": "mcp-stateless-0.6.84-20261004",
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
        "docs/planning/mcp-stateless-sessions.md"
      ],
      "verification_ids": [
        "paired-release"
      ],
      "id": "T003",
      "title": "Собрать и проверить парный релиз 0.6.84",
      "why": "Пересобрать релиз после исправления.",
      "verification_kind": "package",
      "acceptance_criteria": [
        "~/Downloads/WebPilot-0.6.84 собран из коммита после DOCS, packagedSourceMatches=true",
        "Preflight identity записан до сборки"
      ],
      "expected_commit_message": "feat: Собрать и проверить парный релиз 0.6.84"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "mcp-stateless-0.6.84-20261004",
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
        "docs/planning/mcp-stateless-sessions.md"
      ],
      "verification_ids": [
        "release-installed"
      ],
      "id": "T004",
      "title": "Установить 0.6.84 и проверить установленные macOS-копии",
      "why": "Пользователь работает из /Applications.",
      "verification_kind": "installed",
      "acceptance_criteria": [
        "/Applications обновлена из staging без пересборки, identity сохранена, release-installed проходит"
      ],
      "expected_commit_message": "feat: Установить 0.6.84 и проверить установленные macOS-копии"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "mcp-stateless-0.6.84-20261004",
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
        "docs/planning/mcp-stateless-sessions.md",
        "docs/RELEASE.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "github-release"
      ],
      "id": "T005",
      "title": "Опубликовать 0.6.84 и синхронизировать Project Web Pilot с GitHub",
      "why": "Отправить релиз на GitHub.",
      "verification_kind": "package",
      "acceptance_criteria": [
        "Tag v0.6.84 на sourceCommit, пять assets сверены по server digest",
        "После финального push origin/main == local HEAD",
        "Документы фиксируют публикацию"
      ],
      "expected_commit_message": "feat: Опубликовать 0.6.84 и синхронизировать Project Web Pilot с GitHub"
    }
  ],
  "blocked_reason": null,
  "user_decisions": [
    {
      "id": "7fb22f01-7c05-4929-98e1-b31c892d0376",
      "text": "Прямое поручение пользователя 04.10.2026: закрыть scope переключателя в архив и открыть новый план исправления с релизом 0.6.84 (сборка, установка, GitHub).",
      "recorded_at": "2026-10-04T10:13:36.121Z"
    }
  ]
}
```
<!-- workflow-state:end -->

## Состояние

Execution Scope Status: ACTIVE
Delivery Status: IN_PROGRESS
Scope: mcp-stateless-0.6.84-20261004
Current Task: нет
Revision: 1064

## Цель

Сервер MCP App Server без сессий: перезапуск Web Pilot не ломает коннекторы ChatGPT и Claude через VPS; релиз 0.6.84.

## Критерии приёмки

- Запрос с устаревшим Mcp-Session-Id к серверу App Server получает ответ без initialize
- Релиз 0.6.84 собран, установлен в /Applications и опубликован на GitHub после DOCS

## Микрозадачи

- [DONE] T001: MCP App Server без сессий — Завершено
  - Git Commit: [DONE] feat: MCP App Server без сессий
  - Reference: mcp-stateless-0.6.84-20261004 / T001 / implementation
  - Файлы: tools/codex-app-server-mcp/server.py, tests/codex-app-server-mcp.test.mjs, docs/planning/mcp-stateless-sessions.md
- [DONE] T002: Подготовить source релиза 0.6.84 — Завершено
  - Git Commit: [DONE] feat: Подготовить source релиза 0.6.84
  - Reference: mcp-stateless-0.6.84-20261004 / T002 / implementation
  - Файлы: package.json, package-lock.json, docs/planning/mcp-stateless-sessions.md
- [TODO] DOCS: Актуализация всех документов проекта — Ожидает
  - Git Commit: [PENDING] docs: актуализировать контекст проекта
  - Reference: mcp-stateless-0.6.84-20261004 / DOCS / implementation
  - Файлы: docs/planning/mcp-stateless-sessions.md, docs/PRODUCT.md, docs/architecture/ARCHITECTURE.md, docs/RELEASE.md, docs/VERIFICATION.md, docs/architecture/OVERVIEW.md, docs/MODULES.md, docs/DOCUMENTATION_INDEX.md
- [TODO] T003: Собрать и проверить парный релиз 0.6.84 — Ожидает
  - Git Commit: [PENDING] feat: Собрать и проверить парный релиз 0.6.84
  - Reference: mcp-stateless-0.6.84-20261004 / T003 / implementation
  - Файлы: scripts/release-all.mjs, docs/planning/mcp-stateless-sessions.md
- [TODO] T004: Установить 0.6.84 и проверить установленные macOS-копии — Ожидает
  - Git Commit: [PENDING] feat: Установить 0.6.84 и проверить установленные macOS-копии
  - Reference: mcp-stateless-0.6.84-20261004 / T004 / implementation
  - Файлы: scripts/check-installed-release.mjs, docs/planning/mcp-stateless-sessions.md
- [TODO] T005: Опубликовать 0.6.84 и синхронизировать Project Web Pilot с GitHub — Ожидает
  - Git Commit: [PENDING] feat: Опубликовать 0.6.84 и синхронизировать Project Web Pilot с GitHub
  - Reference: mcp-stateless-0.6.84-20261004 / T005 / implementation
  - Файлы: scripts/check-github-release.mjs, docs/planning/mcp-stateless-sessions.md, docs/RELEASE.md, docs/VERIFICATION.md

## Context Pack For This Cycle

- docs/architecture/OVERVIEW.md → Краткая архитектура проекта
- docs/MODULES.md → Модули проекта
- docs/DOCUMENTATION_INDEX.md → Каталог документации
- docs/planning/mcp-stateless-sessions.md

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
