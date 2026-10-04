# Активный план — Project Web Pilot

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 1025,
  "project_id": "cf944136-d1fc-4bd5-9ea0-e46d1fe230e7",
  "project_name": "Project Web Pilot",
  "scope_id": "release-0.6.82-workflowkit-1.5.3-20261004",
  "execution_scope_status": "ACTIVE",
  "delivery_status": "IN_PROGRESS",
  "objective": "Подготовить, собрать, проверить и опубликовать Project Web Pilot 0.6.82 с bundled Workflow Kit 1.5.3, строго выполнив DOCS до build/package и до GitHub publish/sync.",
  "acceptance_criteria": [
    "Подготовить, собрать, проверить и опубликовать Project Web Pilot 0.6.82 с bundled Workflow Kit 1.5.3, строго выполнив DOCS до build/package и до GitHub publish/sync."
  ],
  "approved_scope": {
    "functional_paths": [
      "package.json",
      "package-lock.json",
      "scripts/check-installed-release.mjs",
      "scripts/verify-windows-package.mjs",
      "scripts/check-workflow-kit-dependency.mjs",
      "scripts/check-github-release.mjs",
      "tests/workspace-setup.test.mjs",
      "scripts/release-all.mjs",
      "scripts/release-mac.mjs",
      "resources/workspace-setup-worker.mjs"
    ],
    "documentation_paths": [
      "docs/planning/release-0.6.82-workflowkit-1.5.3.md",
      "docs/PRODUCT.md",
      "docs/architecture/ARCHITECTURE.md",
      "docs/architecture/OVERVIEW.md",
      "docs/MODULES.md",
      "docs/DOCUMENTATION_INDEX.md"
    ]
  },
  "baseline_commit": "d2afd57bb04924b607dd4a79fb7c1485400c6552",
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
        "path": "docs/planning/release-0.6.82-workflowkit-1.5.3.md",
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
        "scope_id": "release-0.6.82-workflowkit-1.5.3-20261004",
        "task_id": "T001",
        "role": "implementation"
      },
      "dependencies": [],
      "functional_paths": [
        "package.json",
        "package-lock.json",
        "scripts/check-installed-release.mjs",
        "scripts/verify-windows-package.mjs",
        "scripts/check-workflow-kit-dependency.mjs",
        "scripts/check-github-release.mjs",
        "tests/workspace-setup.test.mjs"
      ],
      "documentation_paths": [
        "docs/planning/release-0.6.82-workflowkit-1.5.3.md"
      ],
      "verification_ids": [
        "release-source"
      ],
      "id": "T001",
      "title": "Подготовить source релиза 0.6.82 и release-gates для Workflow Kit 1.5.3",
      "why": "До документации и delivery нужно перевести version/runtime guards и remote verification на целевой релиз без запуска сборки или публикации.",
      "verification_kind": "code",
      "acceptance_criteria": [
        "package.json и package-lock.json задают 0.6.82",
        "Все действующие release gates ожидают Workflow Kit 1.5.3 / 35 files / canonical SHA d59ae7b6b074e953fdd6c5d78d1f644902f0e7b9af5ad3c78d67d42f1f6a1c0f",
        "GitHub verifier умеет сверить v0.6.82 tag/release/assets и remote main с release-manifest без сборки",
        "Source/integration regressions проходят, release build и GitHub publication не выполняются"
      ],
      "expected_commit_message": "feat: Подготовить source релиза 0.6.82 и release-gates для Workflow Kit 1.5.3"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "release-0.6.82-workflowkit-1.5.3-20261004",
        "task_id": "DOCS",
        "role": "implementation"
      },
      "dependencies": [
        "T001"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/planning/release-0.6.82-workflowkit-1.5.3.md",
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
        "scope_id": "release-0.6.82-workflowkit-1.5.3-20261004",
        "task_id": "T002",
        "role": "implementation"
      },
      "dependencies": [
        "T001",
        "DOCS"
      ],
      "functional_paths": [
        "package.json",
        "scripts/release-all.mjs",
        "scripts/release-mac.mjs",
        "scripts/verify-windows-package.mjs",
        "resources/workspace-setup-worker.mjs"
      ],
      "documentation_paths": [
        "docs/planning/release-0.6.82-workflowkit-1.5.3.md"
      ],
      "verification_ids": [
        "paired-release"
      ],
      "id": "T002",
      "title": "Собрать и проверить парный release 0.6.82",
      "why": "После DOCS создать единую macOS/Windows поставку штатным paired release pipeline.",
      "verification_kind": "package",
      "acceptance_criteria": [
        "npm run build выполняется только после завершённой DOCS",
        "~/Downloads/WebPilot-0.6.82 содержит два ZIP, SHA256SUMS.txt, INSTALL.txt и release-manifest.json",
        "release-manifest подтверждает packagedSourceMatches=true и bundled Workflow Kit 1.5.3 / 35 files / canonical SHA",
        "macOS staging/root bundle подписан выбранным Apple Development сертификатом UkrHD; Windows x64 проходит verify:win на Mac",
        "Сборка не публикует GitHub Release"
      ],
      "expected_commit_message": "feat: Собрать и проверить парный release 0.6.82"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "release-0.6.82-workflowkit-1.5.3-20261004",
        "task_id": "T003",
        "role": "implementation"
      },
      "dependencies": [
        "T002",
        "DOCS"
      ],
      "functional_paths": [
        "scripts/release-mac.mjs",
        "scripts/check-installed-release.mjs"
      ],
      "documentation_paths": [
        "docs/planning/release-0.6.82-workflowkit-1.5.3.md"
      ],
      "verification_ids": [
        "release-installed"
      ],
      "id": "T003",
      "title": "Обновить и проверить установленные macOS-копии 0.6.82",
      "why": "После package build без пересборки привести root app и /Applications к одному проверенному bundle и выполнить installed gate.",
      "verification_kind": "installed",
      "acceptance_criteria": [
        "/Applications/Project Web Pilot.app обновлён из уже собранного staging через installMacBundle без новой сборки",
        "Root app и /Applications имеют 0.6.82, одинаковый ASAR/signature и сохраняют filesystem identity",
        "check-installed-release.mjs подтверждает staging, обе Mac-копии, оба ZIP, Workflow Kit 1.5.3 и Windows package",
        "Native Windows и clean VM остаются непроверенными, если пользователь отдельно их не запускал",
        "До GitHub publication документы фиксируют фактические local build/install evidence 0.6.82 и сохраняют различие между готовой локальной поставкой и ещё не опубликованным GitHub Release"
      ],
      "expected_commit_message": "feat: Обновить и проверить установленные macOS-копии 0.6.82"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "release-0.6.82-workflowkit-1.5.3-20261004",
        "task_id": "T004",
        "role": "implementation"
      },
      "dependencies": [
        "T003",
        "DOCS"
      ],
      "functional_paths": [
        "scripts/check-github-release.mjs",
        "package.json"
      ],
      "documentation_paths": [
        "docs/planning/release-0.6.82-workflowkit-1.5.3.md"
      ],
      "verification_ids": [
        "github-release"
      ],
      "id": "T004",
      "title": "Опубликовать 0.6.82 и синхронизировать Project Web Pilot с GitHub",
      "why": "Только после DOCS, package и installed gate опубликовать уже готовые artifacts без пересборки и синхронизировать source history.",
      "verification_kind": "package",
      "acceptance_criteria": [
        "Перед publication main синхронизирован до delivery bookkeeping commit",
        "Tag v0.6.82 указывает точно на release-manifest.sourceCommit",
        "GitHub Release v0.6.82 опубликован не draft/prerelease и содержит ровно пять ожидаемых файлов готовой поставки",
        "Server size/digest всех assets совпадает с локальными файлами; повторная сборка не выполняется",
        "После managed commit T004 final main отправлен на GitHub и повторная проверка подтверждает origin/main == local HEAD",
        "Старые release tags и assets не изменены",
        "После публикации, но до финальной синхронизации main, документация фиксирует фактический GitHub Release v0.6.82, tag sourceCommit и server digests пяти assets"
      ],
      "expected_commit_message": "feat: Опубликовать 0.6.82 и синхронизировать Project Web Pilot с GitHub"
    }
  ],
  "blocked_reason": null,
  "user_decisions": [
    {
      "id": "8c702195-5e06-4e95-b97c-dc2d50fecff5",
      "text": "Пользователь поручил выполнить описанную задачу и план.",
      "recorded_at": "2026-10-04T09:01:21.251Z"
    }
  ]
}
```
<!-- workflow-state:end -->

## Состояние

Execution Scope Status: ACTIVE
Delivery Status: IN_PROGRESS
Scope: release-0.6.82-workflowkit-1.5.3-20261004
Current Task: нет
Revision: 1025

## Цель

Подготовить, собрать, проверить и опубликовать Project Web Pilot 0.6.82 с bundled Workflow Kit 1.5.3, строго выполнив DOCS до build/package и до GitHub publish/sync.

## Критерии приёмки

- Подготовить, собрать, проверить и опубликовать Project Web Pilot 0.6.82 с bundled Workflow Kit 1.5.3, строго выполнив DOCS до build/package и до GitHub publish/sync.

## Микрозадачи

- [TODO] T001: Подготовить source релиза 0.6.82 и release-gates для Workflow Kit 1.5.3 — Ожидает
  - Git Commit: [PENDING] feat: Подготовить source релиза 0.6.82 и release-gates для Workflow Kit 1.5.3
  - Reference: release-0.6.82-workflowkit-1.5.3-20261004 / T001 / implementation
  - Файлы: package.json, package-lock.json, scripts/check-installed-release.mjs, scripts/verify-windows-package.mjs, scripts/check-workflow-kit-dependency.mjs, scripts/check-github-release.mjs, tests/workspace-setup.test.mjs, docs/planning/release-0.6.82-workflowkit-1.5.3.md
- [TODO] DOCS: Актуализация всех документов проекта — Ожидает
  - Git Commit: [PENDING] docs: актуализировать контекст проекта
  - Reference: release-0.6.82-workflowkit-1.5.3-20261004 / DOCS / implementation
  - Файлы: docs/planning/release-0.6.82-workflowkit-1.5.3.md, docs/PRODUCT.md, docs/architecture/ARCHITECTURE.md, docs/architecture/OVERVIEW.md, docs/MODULES.md, docs/DOCUMENTATION_INDEX.md
- [TODO] T002: Собрать и проверить парный release 0.6.82 — Ожидает
  - Git Commit: [PENDING] feat: Собрать и проверить парный release 0.6.82
  - Reference: release-0.6.82-workflowkit-1.5.3-20261004 / T002 / implementation
  - Файлы: package.json, scripts/release-all.mjs, scripts/release-mac.mjs, scripts/verify-windows-package.mjs, resources/workspace-setup-worker.mjs, docs/planning/release-0.6.82-workflowkit-1.5.3.md
- [TODO] T003: Обновить и проверить установленные macOS-копии 0.6.82 — Ожидает
  - Git Commit: [PENDING] feat: Обновить и проверить установленные macOS-копии 0.6.82
  - Reference: release-0.6.82-workflowkit-1.5.3-20261004 / T003 / implementation
  - Файлы: scripts/release-mac.mjs, scripts/check-installed-release.mjs, docs/planning/release-0.6.82-workflowkit-1.5.3.md
- [TODO] T004: Опубликовать 0.6.82 и синхронизировать Project Web Pilot с GitHub — Ожидает
  - Git Commit: [PENDING] feat: Опубликовать 0.6.82 и синхронизировать Project Web Pilot с GitHub
  - Reference: release-0.6.82-workflowkit-1.5.3-20261004 / T004 / implementation
  - Файлы: scripts/check-github-release.mjs, package.json, docs/planning/release-0.6.82-workflowkit-1.5.3.md

## Context Pack For This Cycle

- docs/architecture/OVERVIEW.md → Краткая архитектура проекта
- docs/MODULES.md → Модули проекта
- docs/DOCUMENTATION_INDEX.md → Каталог документации
- docs/planning/release-0.6.82-workflowkit-1.5.3.md

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
