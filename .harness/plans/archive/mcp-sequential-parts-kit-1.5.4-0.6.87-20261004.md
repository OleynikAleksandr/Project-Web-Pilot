# Активный план — Project Web Pilot

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 1126,
  "project_id": "cf944136-d1fc-4bd5-9ea0-e46d1fe230e7",
  "project_name": "Project Web Pilot",
  "scope_id": "mcp-sequential-parts-kit-1.5.4-0.6.87-20261004",
  "execution_scope_status": "ACTIVE",
  "delivery_status": "READY_FOR_ACCEPTANCE",
  "objective": "Агент читает контекст через MCP строго по одной части без повторов; компактный recovery Workflow Kit 1.5.4; релиз 0.6.87.",
  "acceptance_criteria": [
    "Агент читает контекст через MCP строго по одной части без повторов; компактный recovery Workflow Kit 1.5.4; релиз 0.6.87."
  ],
  "approved_scope": {
    "functional_paths": [
      "tools/codex-app-server-mcp/server.py",
      "tests/codex-app-server-mcp.test.mjs",
      "scripts/check-workflow-kit-dependency.mjs",
      "tests/workflow-kit-source.test.mjs",
      "tests/workflow-kit-recovery.test.mjs",
      "scripts/check-installed-release.mjs",
      "scripts/verify-windows-package.mjs",
      "package.json",
      "package-lock.json",
      "scripts/release-all.mjs",
      "scripts/check-github-release.mjs"
    ],
    "documentation_paths": [
      "docs/planning/mcp-sequential-parts-kit-1.5.4.md",
      "tools/codex-app-server-mcp/session-rules.md",
      "docs/PRODUCT.md",
      "docs/architecture/ARCHITECTURE.md",
      "docs/architecture/OVERVIEW.md",
      "docs/MODULES.md",
      "docs/DOCUMENTATION_INDEX.md",
      "README.md",
      "docs/CONTEXT_DELIVERY.md",
      "docs/VERIFICATION.md",
      "docs/WORKFLOW_START.md",
      "docs/modules/codex-app-server-executor.md",
      "docs/RELEASE.md"
    ]
  },
  "baseline_commit": "372c314fc141ec20b338a24492bd81d7ba926c39",
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
        "path": "docs/planning/mcp-sequential-parts-kit-1.5.4.md",
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
        "scope_id": "mcp-sequential-parts-kit-1.5.4-0.6.87-20261004",
        "task_id": "T001",
        "role": "implementation"
      },
      "dependencies": [],
      "functional_paths": [
        "tools/codex-app-server-mcp/server.py",
        "tests/codex-app-server-mcp.test.mjs"
      ],
      "documentation_paths": [
        "docs/planning/mcp-sequential-parts-kit-1.5.4.md",
        "tools/codex-app-server-mcp/session-rules.md"
      ],
      "verification_ids": [
        "executor-channel"
      ],
      "id": "T001",
      "title": "MCP: части контекста строго по одной — ключ следующей части",
      "why": "В 0.6.86 агент запросил части 2–6 одним вызовом; вывод обрезался, части 2–5 читались дважды.",
      "verification_kind": "code",
      "acceptance_criteria": [
        "Часть N+1 только с ключом after из конца части N; иначе короткая ошибка PART_ORDER",
        "Заголовок не называет следующий вызов",
        "Части до 28000 байт только текстом",
        "instructions: одна часть на вызов, без пачек, параллельных вызовов и циклов",
        "Правила сессии без дублей Workflow Core"
      ],
      "expected_commit_message": "feat: MCP: части контекста строго по одной — ключ следующей части",
      "actual_files": [
        "tests/codex-app-server-mcp.test.mjs",
        "tools/codex-app-server-mcp/server.py",
        "tools/codex-app-server-mcp/session-rules.md"
      ]
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "mcp-sequential-parts-kit-1.5.4-0.6.87-20261004",
        "task_id": "T002",
        "role": "implementation"
      },
      "dependencies": [],
      "functional_paths": [
        "scripts/check-workflow-kit-dependency.mjs",
        "tests/workflow-kit-source.test.mjs",
        "tests/workflow-kit-recovery.test.mjs",
        "scripts/check-installed-release.mjs",
        "scripts/verify-windows-package.mjs"
      ],
      "documentation_paths": [
        "docs/planning/mcp-sequential-parts-kit-1.5.4.md"
      ],
      "verification_ids": [
        "release-source",
        "unit-all"
      ],
      "id": "T002",
      "title": "Перевести Web Pilot на Workflow Kit 1.5.4",
      "why": "Компактный recovery Kit 1.5.4: формы и карты по запросу.",
      "verification_kind": "code",
      "acceptance_criteria": [
        "Release-gates ожидают Workflow Kit 1.5.4, 35 файлов, новый SHA-256",
        "Recovery без форм и без содержимого MODULES/DOCUMENTATION_INDEX вне DOCS"
      ],
      "expected_commit_message": "feat: Перевести Web Pilot на Workflow Kit 1.5.4",
      "actual_files": [
        "scripts/check-installed-release.mjs",
        "scripts/check-workflow-kit-dependency.mjs",
        "scripts/verify-windows-package.mjs",
        "tests/workflow-kit-recovery.test.mjs",
        "tests/workflow-kit-source.test.mjs"
      ]
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "mcp-sequential-parts-kit-1.5.4-0.6.87-20261004",
        "task_id": "T003",
        "role": "implementation"
      },
      "dependencies": [],
      "functional_paths": [
        "package.json",
        "package-lock.json"
      ],
      "documentation_paths": [
        "docs/planning/mcp-sequential-parts-kit-1.5.4.md"
      ],
      "verification_ids": [
        "release-source"
      ],
      "id": "T003",
      "title": "Подготовить source релиза 0.6.87",
      "why": "Правки доходят до пользователя новой сборкой.",
      "verification_kind": "code",
      "acceptance_criteria": [
        "package.json и package-lock.json задают 0.6.87"
      ],
      "expected_commit_message": "feat: Подготовить source релиза 0.6.87",
      "actual_files": [
        "package-lock.json",
        "package.json"
      ]
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "mcp-sequential-parts-kit-1.5.4-0.6.87-20261004",
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
        "docs/planning/mcp-sequential-parts-kit-1.5.4.md",
        "docs/PRODUCT.md",
        "docs/architecture/ARCHITECTURE.md",
        "tools/codex-app-server-mcp/session-rules.md",
        "docs/architecture/OVERVIEW.md",
        "docs/MODULES.md",
        "docs/DOCUMENTATION_INDEX.md",
        "README.md",
        "docs/CONTEXT_DELIVERY.md",
        "docs/VERIFICATION.md",
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
        "docs/CONTEXT_DELIVERY.md",
        "docs/DOCUMENTATION_INDEX.md",
        "docs/MODULES.md",
        "docs/PRODUCT.md",
        "docs/VERIFICATION.md",
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
        "scope_id": "mcp-sequential-parts-kit-1.5.4-0.6.87-20261004",
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
        "docs/planning/mcp-sequential-parts-kit-1.5.4.md"
      ],
      "verification_ids": [
        "paired-release"
      ],
      "id": "T004",
      "title": "Собрать и проверить парный релиз 0.6.87",
      "why": "Пересобрать релиз после правок.",
      "verification_kind": "package",
      "acceptance_criteria": [
        "~/Downloads/WebPilot-0.6.87 собран из коммита после DOCS, packagedSourceMatches=true, bundled Workflow Kit 1.5.4",
        "Preflight identity записан до сборки"
      ],
      "expected_commit_message": "feat: Собрать и проверить парный релиз 0.6.87",
      "actual_files": []
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "mcp-sequential-parts-kit-1.5.4-0.6.87-20261004",
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
        "docs/planning/mcp-sequential-parts-kit-1.5.4.md"
      ],
      "verification_ids": [
        "release-installed"
      ],
      "id": "T005",
      "title": "Установить 0.6.87 и проверить установленные macOS-копии",
      "why": "Пользователь работает из /Applications.",
      "verification_kind": "installed",
      "acceptance_criteria": [
        "/Applications обновлена из staging без пересборки, identity сохранена, release-installed проходит"
      ],
      "expected_commit_message": "feat: Установить 0.6.87 и проверить установленные macOS-копии",
      "actual_files": []
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "mcp-sequential-parts-kit-1.5.4-0.6.87-20261004",
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
        "docs/planning/mcp-sequential-parts-kit-1.5.4.md",
        "README.md",
        "docs/MODULES.md",
        "docs/PRODUCT.md",
        "docs/RELEASE.md",
        "docs/VERIFICATION.md",
        "docs/WORKFLOW_START.md",
        "docs/architecture/OVERVIEW.md"
      ],
      "verification_ids": [
        "github-release"
      ],
      "id": "T006",
      "title": "Опубликовать 0.6.87 и синхронизировать Project Web Pilot с GitHub",
      "why": "Отправить релиз на GitHub.",
      "verification_kind": "package",
      "acceptance_criteria": [
        "Tag v0.6.87 на sourceCommit, пять assets совпадают с локальной поставкой, main синхронизирован"
      ],
      "expected_commit_message": "feat: Опубликовать 0.6.87 и синхронизировать Project Web Pilot с GitHub",
      "actual_files": [
        "README.md",
        "docs/MODULES.md",
        "docs/PRODUCT.md",
        "docs/RELEASE.md",
        "docs/VERIFICATION.md",
        "docs/WORKFLOW_START.md",
        "docs/architecture/OVERVIEW.md",
        "docs/planning/mcp-sequential-parts-kit-1.5.4.md"
      ]
    }
  ],
  "blocked_reason": null,
  "user_decisions": [
    {
      "id": "f435b732-4ce7-4706-840c-e033037a477d",
      "text": "Пользователь поручил выполнить описанную задачу и план.",
      "recorded_at": "2026-10-04T15:17:22.191Z"
    }
  ]
}
```
<!-- workflow-state:end -->

## Состояние

Execution Scope Status: ACTIVE
Delivery Status: READY_FOR_ACCEPTANCE
Scope: mcp-sequential-parts-kit-1.5.4-0.6.87-20261004
Current Task: нет
Revision: 1126

## Цель

Агент читает контекст через MCP строго по одной части без повторов; компактный recovery Workflow Kit 1.5.4; релиз 0.6.87.

## Критерии приёмки

- Агент читает контекст через MCP строго по одной части без повторов; компактный recovery Workflow Kit 1.5.4; релиз 0.6.87.

## Микрозадачи

- [DONE] T001: MCP: части контекста строго по одной — ключ следующей части — Завершено
  - Git Commit: [DONE] feat: MCP: части контекста строго по одной — ключ следующей части
  - Reference: mcp-sequential-parts-kit-1.5.4-0.6.87-20261004 / T001 / implementation
  - Файлы: tools/codex-app-server-mcp/server.py, tests/codex-app-server-mcp.test.mjs, docs/planning/mcp-sequential-parts-kit-1.5.4.md, tools/codex-app-server-mcp/session-rules.md
- [DONE] T002: Перевести Web Pilot на Workflow Kit 1.5.4 — Завершено
  - Git Commit: [DONE] feat: Перевести Web Pilot на Workflow Kit 1.5.4
  - Reference: mcp-sequential-parts-kit-1.5.4-0.6.87-20261004 / T002 / implementation
  - Файлы: scripts/check-workflow-kit-dependency.mjs, tests/workflow-kit-source.test.mjs, tests/workflow-kit-recovery.test.mjs, scripts/check-installed-release.mjs, scripts/verify-windows-package.mjs, docs/planning/mcp-sequential-parts-kit-1.5.4.md
- [DONE] T003: Подготовить source релиза 0.6.87 — Завершено
  - Git Commit: [DONE] feat: Подготовить source релиза 0.6.87
  - Reference: mcp-sequential-parts-kit-1.5.4-0.6.87-20261004 / T003 / implementation
  - Файлы: package.json, package-lock.json, docs/planning/mcp-sequential-parts-kit-1.5.4.md
- [DONE] DOCS: Актуализация всех документов проекта — Завершено
  - Git Commit: [DONE] docs: актуализировать контекст проекта
  - Reference: mcp-sequential-parts-kit-1.5.4-0.6.87-20261004 / DOCS / implementation
  - Файлы: docs/planning/mcp-sequential-parts-kit-1.5.4.md, docs/PRODUCT.md, docs/architecture/ARCHITECTURE.md, tools/codex-app-server-mcp/session-rules.md, docs/architecture/OVERVIEW.md, docs/MODULES.md, docs/DOCUMENTATION_INDEX.md, README.md, docs/CONTEXT_DELIVERY.md, docs/VERIFICATION.md, docs/WORKFLOW_START.md, docs/modules/codex-app-server-executor.md
- [DONE] T004: Собрать и проверить парный релиз 0.6.87 — Завершено
  - Git Commit: [DONE] feat: Собрать и проверить парный релиз 0.6.87
  - Reference: mcp-sequential-parts-kit-1.5.4-0.6.87-20261004 / T004 / implementation
  - Файлы: scripts/release-all.mjs, docs/planning/mcp-sequential-parts-kit-1.5.4.md
- [DONE] T005: Установить 0.6.87 и проверить установленные macOS-копии — Завершено
  - Git Commit: [DONE] feat: Установить 0.6.87 и проверить установленные macOS-копии
  - Reference: mcp-sequential-parts-kit-1.5.4-0.6.87-20261004 / T005 / implementation
  - Файлы: scripts/check-installed-release.mjs, docs/planning/mcp-sequential-parts-kit-1.5.4.md
- [DONE] T006: Опубликовать 0.6.87 и синхронизировать Project Web Pilot с GitHub — Завершено
  - Git Commit: [DONE] feat: Опубликовать 0.6.87 и синхронизировать Project Web Pilot с GitHub
  - Reference: mcp-sequential-parts-kit-1.5.4-0.6.87-20261004 / T006 / implementation
  - Файлы: scripts/check-github-release.mjs, docs/planning/mcp-sequential-parts-kit-1.5.4.md, README.md, docs/MODULES.md, docs/PRODUCT.md, docs/RELEASE.md, docs/VERIFICATION.md, docs/WORKFLOW_START.md, docs/architecture/OVERVIEW.md

## Context Pack For This Cycle

- docs/architecture/OVERVIEW.md → Краткая архитектура проекта
- docs/MODULES.md → Модули проекта
- docs/DOCUMENTATION_INDEX.md → Каталог документации
- docs/planning/mcp-sequential-parts-kit-1.5.4.md

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
