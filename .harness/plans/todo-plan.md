# Активный план — Project Web Pilot

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 1150,
  "project_id": "cf944136-d1fc-4bd5-9ea0-e46d1fe230e7",
  "project_name": "Project Web Pilot",
  "scope_id": "release-backups-kit-1.5.5-0.6.89-20261004",
  "execution_scope_status": "ACTIVE",
  "delivery_status": "IN_PROGRESS",
  "objective": "Одна резервная копия на установку вне Spotlight; Workflow Kit 1.5.5 (push только после DOCS); релиз 0.6.89.",
  "acceptance_criteria": [
    "Одна резервная копия на установку вне Spotlight; Workflow Kit 1.5.5 (push только после DOCS); релиз 0.6.89."
  ],
  "approved_scope": {
    "functional_paths": [
      "scripts/release-mac.mjs",
      "tests/release-mac.test.mjs",
      "scripts/check-workflow-kit-dependency.mjs",
      "tests/workflow-kit-source.test.mjs",
      "scripts/check-installed-release.mjs",
      "scripts/verify-windows-package.mjs",
      "package.json",
      "package-lock.json",
      "scripts/release-all.mjs",
      "scripts/check-github-release.mjs"
    ],
    "documentation_paths": [
      "docs/planning/release-backups-kit-1.5.5.md",
      "docs/PRODUCT.md",
      "docs/architecture/ARCHITECTURE.md",
      "docs/architecture/OVERVIEW.md",
      "docs/MODULES.md",
      "docs/DOCUMENTATION_INDEX.md"
    ]
  },
  "baseline_commit": "1b5ca63b444a29a5f40cf5a13b2be45e9a162b74",
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
        "path": "docs/planning/release-backups-kit-1.5.5.md",
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
        "scope_id": "release-backups-kit-1.5.5-0.6.89-20261004",
        "task_id": "T001",
        "role": "implementation"
      },
      "dependencies": [],
      "functional_paths": [
        "scripts/release-mac.mjs",
        "tests/release-mac.test.mjs"
      ],
      "documentation_paths": [
        "docs/planning/release-backups-kit-1.5.5.md"
      ],
      "verification_ids": [
        "unit-all"
      ],
      "id": "T001",
      "title": "Резервные копии установки: одна на цель, вне Spotlight",
      "why": "Копии накапливались без удаления (46 ГБ), Spotlight показывал Helper-приложения из них.",
      "verification_kind": "code",
      "acceptance_criteria": [
        "Копии в .harness/runtime/release-backups.noindex",
        "Одна копия предыдущей версии на цель установки",
        "Откат при ошибке установки прежний"
      ],
      "expected_commit_message": "feat: Резервные копии установки: одна на цель, вне Spotlight",
      "actual_files": [
        "scripts/release-mac.mjs",
        "tests/release-mac.test.mjs"
      ]
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "release-backups-kit-1.5.5-0.6.89-20261004",
        "task_id": "T002",
        "role": "implementation"
      },
      "dependencies": [],
      "functional_paths": [
        "scripts/check-workflow-kit-dependency.mjs",
        "tests/workflow-kit-source.test.mjs",
        "scripts/check-installed-release.mjs",
        "scripts/verify-windows-package.mjs"
      ],
      "documentation_paths": [
        "docs/planning/release-backups-kit-1.5.5.md"
      ],
      "verification_ids": [
        "release-source",
        "unit-all"
      ],
      "id": "T002",
      "title": "Перевести Web Pilot на Workflow Kit 1.5.5",
      "why": "Kit 1.5.5: push только после DOCS текущего плана.",
      "verification_kind": "code",
      "acceptance_criteria": [
        "Release-gates ожидают Workflow Kit 1.5.5, 35 файлов, новый SHA-256"
      ],
      "expected_commit_message": "feat: Перевести Web Pilot на Workflow Kit 1.5.5",
      "actual_files": [
        "scripts/check-workflow-kit-dependency.mjs",
        "tests/workflow-kit-source.test.mjs",
        "scripts/check-installed-release.mjs",
        "scripts/verify-windows-package.mjs"
      ]
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "release-backups-kit-1.5.5-0.6.89-20261004",
        "task_id": "T003",
        "role": "implementation"
      },
      "dependencies": [],
      "functional_paths": [
        "package.json",
        "package-lock.json"
      ],
      "documentation_paths": [
        "docs/planning/release-backups-kit-1.5.5.md"
      ],
      "verification_ids": [
        "release-source"
      ],
      "id": "T003",
      "title": "Подготовить source релиза 0.6.89",
      "why": "Правки доходят до пользователя новой сборкой.",
      "verification_kind": "code",
      "acceptance_criteria": [
        "package.json и package-lock.json задают 0.6.89"
      ],
      "expected_commit_message": "feat: Подготовить source релиза 0.6.89",
      "actual_files": [
        "package-lock.json",
        "package.json"
      ]
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "release-backups-kit-1.5.5-0.6.89-20261004",
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
        "docs/planning/release-backups-kit-1.5.5.md",
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
        "scope_id": "release-backups-kit-1.5.5-0.6.89-20261004",
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
        "docs/planning/release-backups-kit-1.5.5.md"
      ],
      "verification_ids": [
        "paired-release"
      ],
      "id": "T004",
      "title": "Собрать и проверить парный релиз 0.6.89",
      "why": "Пересобрать релиз после правок.",
      "verification_kind": "package",
      "acceptance_criteria": [
        "~/Downloads/WebPilot-0.6.89 собран из коммита после DOCS, packagedSourceMatches=true, bundled Workflow Kit 1.5.5",
        "Preflight identity записан до сборки"
      ],
      "expected_commit_message": "feat: Собрать и проверить парный релиз 0.6.89"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "release-backups-kit-1.5.5-0.6.89-20261004",
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
        "docs/planning/release-backups-kit-1.5.5.md"
      ],
      "verification_ids": [
        "release-installed"
      ],
      "id": "T005",
      "title": "Установить 0.6.89 и проверить установленные macOS-копии",
      "why": "Пользователь работает из /Applications.",
      "verification_kind": "installed",
      "acceptance_criteria": [
        "/Applications обновлена из staging без пересборки, identity сохранена, release-installed проходит",
        "В release-backups.noindex по одной копии 0.6.88 на цель"
      ],
      "expected_commit_message": "feat: Установить 0.6.89 и проверить установленные macOS-копии"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "release-backups-kit-1.5.5-0.6.89-20261004",
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
        "docs/planning/release-backups-kit-1.5.5.md"
      ],
      "verification_ids": [
        "github-release"
      ],
      "id": "T006",
      "title": "Опубликовать 0.6.89 и синхронизировать Project Web Pilot с GitHub",
      "why": "Отправить релиз на GitHub.",
      "verification_kind": "package",
      "acceptance_criteria": [
        "Tag v0.6.89 на sourceCommit, пять assets совпадают с локальной поставкой, main синхронизирован"
      ],
      "expected_commit_message": "feat: Опубликовать 0.6.89 и синхронизировать Project Web Pilot с GitHub"
    }
  ],
  "blocked_reason": null,
  "user_decisions": [
    {
      "id": "807bc264-9422-4d18-8306-8ee4bf9d6551",
      "text": "Пользователь поручил выполнить описанную задачу и план.",
      "recorded_at": "2026-10-04T16:45:51.794Z"
    }
  ]
}
```
<!-- workflow-state:end -->

## Состояние

Execution Scope Status: ACTIVE
Delivery Status: IN_PROGRESS
Scope: release-backups-kit-1.5.5-0.6.89-20261004
Current Task: нет
Revision: 1150

## Цель

Одна резервная копия на установку вне Spotlight; Workflow Kit 1.5.5 (push только после DOCS); релиз 0.6.89.

## Критерии приёмки

- Одна резервная копия на установку вне Spotlight; Workflow Kit 1.5.5 (push только после DOCS); релиз 0.6.89.

## Микрозадачи

- [DONE] T001: Резервные копии установки: одна на цель, вне Spotlight — Завершено
  - Git Commit: [DONE] feat: Резервные копии установки: одна на цель, вне Spotlight
  - Reference: release-backups-kit-1.5.5-0.6.89-20261004 / T001 / implementation
  - Файлы: scripts/release-mac.mjs, tests/release-mac.test.mjs, docs/planning/release-backups-kit-1.5.5.md
- [DONE] T002: Перевести Web Pilot на Workflow Kit 1.5.5 — Завершено
  - Git Commit: [DONE] feat: Перевести Web Pilot на Workflow Kit 1.5.5
  - Reference: release-backups-kit-1.5.5-0.6.89-20261004 / T002 / implementation
  - Файлы: scripts/check-workflow-kit-dependency.mjs, tests/workflow-kit-source.test.mjs, scripts/check-installed-release.mjs, scripts/verify-windows-package.mjs, docs/planning/release-backups-kit-1.5.5.md
- [DONE] T003: Подготовить source релиза 0.6.89 — Завершено
  - Git Commit: [DONE] feat: Подготовить source релиза 0.6.89
  - Reference: release-backups-kit-1.5.5-0.6.89-20261004 / T003 / implementation
  - Файлы: package.json, package-lock.json, docs/planning/release-backups-kit-1.5.5.md
- [TODO] DOCS: Актуализация всех документов проекта — Ожидает
  - Git Commit: [PENDING] docs: актуализировать контекст проекта
  - Reference: release-backups-kit-1.5.5-0.6.89-20261004 / DOCS / implementation
  - Файлы: docs/planning/release-backups-kit-1.5.5.md, docs/PRODUCT.md, docs/architecture/ARCHITECTURE.md, docs/architecture/OVERVIEW.md, docs/MODULES.md, docs/DOCUMENTATION_INDEX.md
- [TODO] T004: Собрать и проверить парный релиз 0.6.89 — Ожидает
  - Git Commit: [PENDING] feat: Собрать и проверить парный релиз 0.6.89
  - Reference: release-backups-kit-1.5.5-0.6.89-20261004 / T004 / implementation
  - Файлы: scripts/release-all.mjs, docs/planning/release-backups-kit-1.5.5.md
- [TODO] T005: Установить 0.6.89 и проверить установленные macOS-копии — Ожидает
  - Git Commit: [PENDING] feat: Установить 0.6.89 и проверить установленные macOS-копии
  - Reference: release-backups-kit-1.5.5-0.6.89-20261004 / T005 / implementation
  - Файлы: scripts/check-installed-release.mjs, docs/planning/release-backups-kit-1.5.5.md
- [TODO] T006: Опубликовать 0.6.89 и синхронизировать Project Web Pilot с GitHub — Ожидает
  - Git Commit: [PENDING] feat: Опубликовать 0.6.89 и синхронизировать Project Web Pilot с GitHub
  - Reference: release-backups-kit-1.5.5-0.6.89-20261004 / T006 / implementation
  - Файлы: scripts/check-github-release.mjs, docs/planning/release-backups-kit-1.5.5.md

## Context Pack For This Cycle

- docs/architecture/OVERVIEW.md → Краткая архитектура проекта
- docs/MODULES.md → Модули проекта
- docs/DOCUMENTATION_INDEX.md → Каталог документации
- docs/planning/release-backups-kit-1.5.5.md

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
