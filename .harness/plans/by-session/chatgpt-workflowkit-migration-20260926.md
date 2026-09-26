# Активный план — Project Web Pilot

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 10,
  "project_id": "cf944136-d1fc-4bd5-9ea0-e46d1fe230e7",
  "project_name": "Project Web Pilot",
  "scope_id": "workflow-kit-package-migration-039",
  "execution_scope_status": "ACTIVE",
  "delivery_status": "IN_PROGRESS",
  "objective": "Перевести Project Web Pilot на canonical @webpilot/workflow-kit с generated runtime staging и выпустить парный macOS arm64 / Windows x64 релиз.",
  "acceptance_criteria": [
    "@webpilot/workflow-kit@1.4.12 является development dependency и единственным editable source остаётся /Users/oleksandroliinyk/VSCODE/WorkflowKit/src",
    "resources/workflow-kit не хранится в Git как source и автоматически stage-ится из getRuntimeRoot()",
    "staged runtime содержит 35 файлов с digest 5464b2c1528eef1de740af50558bc8db1d39cfa7838f9c032d23650fb4f5f119",
    "Workspace Setup, Project Doctor, session plan/recovery, unit suite и Electron smoke проходят",
    "новый парный релиз содержит macOS arm64 и Windows x64 одной версии и обе упаковки проходят verifiers",
    "packaged приложения self-contained и не требуют sibling WorkflowKit workspace",
    "документация отражает canonical package + generated staging"
  ],
  "approved_scope": {
    "functional_paths": [
      "package.json",
      "package-lock.json",
      "src/session-plans.mjs",
      "scripts/check-workflow-kit-dependency.mjs",
      "tests/workflow-kit-source.test.mjs",
      "tests/session-plans.test.mjs",
      "tests/workflow-kit-recovery.test.mjs",
      "tests/electron-smoke.mjs",
      "tests/project-doctor.test.mjs",
      "tests/workspace-setup.test.mjs",
      "tests/session-opening-performance.test.mjs",
      "scripts/stage-workflow-kit.mjs",
      "scripts/check-workflow-kit-staging.mjs",
      "scripts/release-all.mjs",
      ".gitignore",
      "resources/workflow-kit/cli.mjs",
      "resources/workflow-kit/examples/verify-package.mjs",
      "resources/workflow-kit/install.mjs",
      "resources/workflow-kit/lib/actions.mjs",
      "resources/workflow-kit/lib/command-help.mjs",
      "resources/workflow-kit/lib/common.mjs",
      "resources/workflow-kit/lib/extend-plan.mjs",
      "resources/workflow-kit/lib/git-hooks.mjs",
      "resources/workflow-kit/lib/git.mjs",
      "resources/workflow-kit/lib/inspection-inputs.mjs",
      "resources/workflow-kit/lib/installation-files.mjs",
      "resources/workflow-kit/lib/installer.mjs",
      "resources/workflow-kit/lib/plan.mjs",
      "resources/workflow-kit/lib/platform.mjs",
      "resources/workflow-kit/lib/project-facts.mjs",
      "resources/workflow-kit/lib/recovery.mjs",
      "resources/workflow-kit/lib/session-plans.mjs",
      "resources/workflow-kit/lib/simple-workflow.mjs",
      "resources/workflow-kit/lib/task-files.mjs",
      "resources/workflow-kit/lib/task-update.mjs",
      "resources/workflow-kit/lib/transaction.mjs",
      "resources/workflow-kit/lib/validate.mjs",
      "resources/workflow-kit/schemas/plan.schema.json",
      "resources/workflow-kit/schemas/workflow.schema.json",
      "scripts/verify-windows-package.mjs",
      "scripts/release-mac.mjs"
    ],
    "documentation_paths": [
      "docs/planning/workflow-kit-package-migration.md",
      "resources/workflow-kit/WORKFLOW.md",
      "resources/workflow-kit/examples/PACKAGING.md",
      "resources/workflow-kit/templates/AGENTS.md",
      "resources/workflow-kit/templates/ARCHITECTURE.md",
      "resources/workflow-kit/templates/CONTINUE.md",
      "resources/workflow-kit/templates/PLAN.md",
      "resources/workflow-kit/templates/PRODUCT.md",
      "resources/workflow-kit/templates/PROTOTYPE.md",
      "resources/workflow-kit/templates/SPEC.md",
      "resources/workflow-kit/templates/STAGES.md",
      "resources/workflow-kit/templates/START.md",
      "docs/RELEASE.md",
      "docs/VERIFICATION.md",
      "docs/PRODUCT.md",
      "docs/architecture/ARCHITECTURE.md",
      "docs/architecture/OVERVIEW.md",
      "docs/MODULES.md",
      "docs/DOCUMENTATION_INDEX.md"
    ]
  },
  "baseline_commit": "8fc40c986cc4c7b02bc71f66fc4737a70da2868a",
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
        "path": "docs/planning/workflow-kit-package-migration.md",
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
        "scope_id": "workflow-kit-package-migration-039",
        "task_id": "T001",
        "role": "implementation"
      },
      "dependencies": [],
      "functional_paths": [
        "package.json",
        "package-lock.json",
        "src/session-plans.mjs",
        "scripts/check-workflow-kit-dependency.mjs",
        "tests/workflow-kit-source.test.mjs",
        "tests/session-plans.test.mjs",
        "tests/workflow-kit-recovery.test.mjs",
        "tests/electron-smoke.mjs",
        "tests/project-doctor.test.mjs",
        "tests/workspace-setup.test.mjs",
        "tests/session-opening-performance.test.mjs"
      ],
      "documentation_paths": [
        "docs/planning/workflow-kit-package-migration.md"
      ],
      "verification_ids": [
        "workflow-kit-contract",
        "suite"
      ],
      "id": "T001",
      "title": "Подключить canonical Workflow Kit package и development imports",
      "why": "Убрать использование tracked duplicate как source of truth до его физического удаления.",
      "verification_kind": "code",
      "acceptance_criteria": [
        "dependency и lockfile сохранены",
        "development imports используют package exports",
        "trusted packaged projection semantics сохранена",
        "package version/fileset/digest утверждаются автоматически"
      ],
      "expected_commit_message": "refactor: подключить canonical Workflow Kit package",
      "actual_files": [
        "package.json",
        "package-lock.json",
        "src/session-plans.mjs",
        "scripts/check-workflow-kit-dependency.mjs",
        "tests/workflow-kit-source.test.mjs",
        "tests/session-plans.test.mjs",
        "tests/workflow-kit-recovery.test.mjs",
        "tests/electron-smoke.mjs",
        "tests/project-doctor.test.mjs",
        "tests/workspace-setup.test.mjs",
        "tests/session-opening-performance.test.mjs"
      ]
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "workflow-kit-package-migration-039",
        "task_id": "T002",
        "role": "implementation"
      },
      "dependencies": [
        "T001"
      ],
      "functional_paths": [
        "package.json",
        "scripts/stage-workflow-kit.mjs",
        "scripts/check-workflow-kit-staging.mjs",
        "scripts/release-all.mjs",
        "tests/workflow-kit-source.test.mjs"
      ],
      "documentation_paths": [
        "docs/planning/workflow-kit-package-migration.md"
      ],
      "verification_ids": [
        "workflow-kit-contract",
        "workflow-kit-stage",
        "suite"
      ],
      "id": "T002",
      "title": "Добавить deterministic generated runtime staging",
      "why": "External workers и Electron resource layout должны получать runtime автоматически из canonical package.",
      "verification_kind": "code",
      "acceptance_criteria": [
        "staging автоматический перед start/test/smoke/build",
        "staging идемпотентен",
        "version/fileset/digest совпадают",
        "release snapshot не меняется в середине build"
      ],
      "expected_commit_message": "build: stage Workflow Kit runtime from package",
      "actual_files": [
        "package.json",
        "scripts/check-workflow-kit-staging.mjs",
        "scripts/release-all.mjs",
        "scripts/stage-workflow-kit.mjs"
      ]
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "workflow-kit-package-migration-039",
        "task_id": "T003",
        "role": "implementation"
      },
      "dependencies": [
        "T002"
      ],
      "functional_paths": [
        ".gitignore",
        "tests/workflow-kit-source.test.mjs",
        "tests/project-doctor.test.mjs",
        "tests/workspace-setup.test.mjs",
        "tests/session-opening-performance.test.mjs",
        "tests/electron-smoke.mjs",
        "resources/workflow-kit/cli.mjs",
        "resources/workflow-kit/examples/verify-package.mjs",
        "resources/workflow-kit/install.mjs",
        "resources/workflow-kit/lib/actions.mjs",
        "resources/workflow-kit/lib/command-help.mjs",
        "resources/workflow-kit/lib/common.mjs",
        "resources/workflow-kit/lib/extend-plan.mjs",
        "resources/workflow-kit/lib/git-hooks.mjs",
        "resources/workflow-kit/lib/git.mjs",
        "resources/workflow-kit/lib/inspection-inputs.mjs",
        "resources/workflow-kit/lib/installation-files.mjs",
        "resources/workflow-kit/lib/installer.mjs",
        "resources/workflow-kit/lib/plan.mjs",
        "resources/workflow-kit/lib/platform.mjs",
        "resources/workflow-kit/lib/project-facts.mjs",
        "resources/workflow-kit/lib/recovery.mjs",
        "resources/workflow-kit/lib/session-plans.mjs",
        "resources/workflow-kit/lib/simple-workflow.mjs",
        "resources/workflow-kit/lib/task-files.mjs",
        "resources/workflow-kit/lib/task-update.mjs",
        "resources/workflow-kit/lib/transaction.mjs",
        "resources/workflow-kit/lib/validate.mjs",
        "resources/workflow-kit/schemas/plan.schema.json",
        "resources/workflow-kit/schemas/workflow.schema.json",
        "scripts/check-workflow-kit-staging.mjs"
      ],
      "documentation_paths": [
        "docs/planning/workflow-kit-package-migration.md",
        "resources/workflow-kit/WORKFLOW.md",
        "resources/workflow-kit/examples/PACKAGING.md",
        "resources/workflow-kit/templates/AGENTS.md",
        "resources/workflow-kit/templates/ARCHITECTURE.md",
        "resources/workflow-kit/templates/CONTINUE.md",
        "resources/workflow-kit/templates/PLAN.md",
        "resources/workflow-kit/templates/PRODUCT.md",
        "resources/workflow-kit/templates/PROTOTYPE.md",
        "resources/workflow-kit/templates/SPEC.md",
        "resources/workflow-kit/templates/STAGES.md",
        "resources/workflow-kit/templates/START.md"
      ],
      "verification_ids": [
        "workflow-kit-contract"
      ],
      "id": "T003",
      "title": "Удалить tracked Workflow Kit duplicate и закрепить generated contract",
      "why": "В WebPilot не должно оставаться второй independently editable реализации Workflow Kit.",
      "verification_kind": "code",
      "acceptance_criteria": [
        "resources/workflow-kit отсутствует среди tracked files",
        "generated staging полностью восстанавливает runtime",
        "Workspace Setup и Project Doctor используют generated layout",
        "скрытой второй editable реализации нет"
      ],
      "expected_commit_message": "refactor: удалить bundled source duplicate Workflow Kit",
      "actual_files": [
        ".gitignore",
        "resources/workflow-kit/WORKFLOW.md",
        "resources/workflow-kit/cli.mjs",
        "resources/workflow-kit/examples/PACKAGING.md",
        "resources/workflow-kit/examples/verify-package.mjs",
        "resources/workflow-kit/install.mjs",
        "resources/workflow-kit/lib/actions.mjs",
        "resources/workflow-kit/lib/command-help.mjs",
        "resources/workflow-kit/lib/common.mjs",
        "resources/workflow-kit/lib/extend-plan.mjs",
        "resources/workflow-kit/lib/git-hooks.mjs",
        "resources/workflow-kit/lib/git.mjs",
        "resources/workflow-kit/lib/inspection-inputs.mjs",
        "resources/workflow-kit/lib/installation-files.mjs",
        "resources/workflow-kit/lib/installer.mjs",
        "resources/workflow-kit/lib/plan.mjs",
        "resources/workflow-kit/lib/platform.mjs",
        "resources/workflow-kit/lib/project-facts.mjs",
        "resources/workflow-kit/lib/recovery.mjs",
        "resources/workflow-kit/lib/session-plans.mjs",
        "resources/workflow-kit/lib/simple-workflow.mjs",
        "resources/workflow-kit/lib/task-files.mjs",
        "resources/workflow-kit/lib/task-update.mjs",
        "resources/workflow-kit/lib/transaction.mjs",
        "resources/workflow-kit/lib/validate.mjs",
        "resources/workflow-kit/schemas/plan.schema.json",
        "resources/workflow-kit/schemas/workflow.schema.json",
        "resources/workflow-kit/templates/AGENTS.md",
        "resources/workflow-kit/templates/ARCHITECTURE.md",
        "resources/workflow-kit/templates/CONTINUE.md",
        "resources/workflow-kit/templates/PLAN.md",
        "resources/workflow-kit/templates/PRODUCT.md",
        "resources/workflow-kit/templates/PROTOTYPE.md",
        "resources/workflow-kit/templates/SPEC.md",
        "resources/workflow-kit/templates/STAGES.md",
        "resources/workflow-kit/templates/START.md",
        "scripts/check-workflow-kit-staging.mjs",
        "tests/workflow-kit-source.test.mjs"
      ]
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "workflow-kit-package-migration-039",
        "task_id": "T004",
        "role": "implementation"
      },
      "dependencies": [
        "T003"
      ],
      "functional_paths": [
        "package.json",
        "package-lock.json",
        "scripts/verify-windows-package.mjs",
        "scripts/release-all.mjs",
        "scripts/release-mac.mjs"
      ],
      "documentation_paths": [
        "docs/planning/workflow-kit-package-migration.md",
        "docs/RELEASE.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "electron-smoke",
        "paired-release"
      ],
      "id": "T004",
      "title": "Собрать и проверить парный macOS Windows релиз",
      "why": "Подтвердить самодостаточность desktop-продукта на обеих поддерживаемых платформах.",
      "verification_kind": "package",
      "acceptance_criteria": [
        "Electron smoke проходит",
        "macOS arm64 package проходит verifier",
        "Windows x64 package проходит verifier",
        "оба ZIP одной новой версии лежат в ~/Downloads/WebPilot-<version>/",
        "packaged Workflow Kit = canonical 1.4.12 и runtime self-contained"
      ],
      "expected_commit_message": "build: выпустить WebPilot с canonical Workflow Kit package"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "workflow-kit-package-migration-039",
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
        "docs/planning/workflow-kit-package-migration.md",
        "docs/PRODUCT.md",
        "docs/architecture/ARCHITECTURE.md",
        "resources/workflow-kit/WORKFLOW.md",
        "resources/workflow-kit/examples/PACKAGING.md",
        "resources/workflow-kit/templates/AGENTS.md",
        "resources/workflow-kit/templates/ARCHITECTURE.md",
        "resources/workflow-kit/templates/CONTINUE.md",
        "resources/workflow-kit/templates/PLAN.md",
        "resources/workflow-kit/templates/PRODUCT.md",
        "resources/workflow-kit/templates/PROTOTYPE.md",
        "resources/workflow-kit/templates/SPEC.md",
        "resources/workflow-kit/templates/STAGES.md",
        "resources/workflow-kit/templates/START.md",
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
    }
  ],
  "blocked_reason": null,
  "user_decisions": [
    {
      "id": "3ad32961-0cbd-4be3-a969-1c77ec88f1e0",
      "text": "Пользователь согласовал T001–T004 + DOCS и отдельно подтвердил обязательность обеих платформ в новом релизе.",
      "recorded_at": "2026-09-26T16:38:41.406Z"
    }
  ],
  "owner_session_id": "chatgpt-workflowkit-migration-20260926",
  "prepared_in_session_id": null
}
```
<!-- workflow-state:end -->

## Состояние

Execution Scope Status: ACTIVE
Delivery Status: IN_PROGRESS
Scope: workflow-kit-package-migration-039
Current Task: нет
Revision: 10

## Цель

Перевести Project Web Pilot на canonical @webpilot/workflow-kit с generated runtime staging и выпустить парный macOS arm64 / Windows x64 релиз.

## Критерии приёмки

- @webpilot/workflow-kit@1.4.12 является development dependency и единственным editable source остаётся /Users/oleksandroliinyk/VSCODE/WorkflowKit/src
- resources/workflow-kit не хранится в Git как source и автоматически stage-ится из getRuntimeRoot()
- staged runtime содержит 35 файлов с digest 5464b2c1528eef1de740af50558bc8db1d39cfa7838f9c032d23650fb4f5f119
- Workspace Setup, Project Doctor, session plan/recovery, unit suite и Electron smoke проходят
- новый парный релиз содержит macOS arm64 и Windows x64 одной версии и обе упаковки проходят verifiers
- packaged приложения self-contained и не требуют sibling WorkflowKit workspace
- документация отражает canonical package + generated staging

## Микрозадачи

- [DONE] T001: Подключить canonical Workflow Kit package и development imports — Завершено
  - Git Commit: [DONE] refactor: подключить canonical Workflow Kit package
  - Reference: workflow-kit-package-migration-039 / T001 / implementation
  - Файлы: package.json, package-lock.json, src/session-plans.mjs, scripts/check-workflow-kit-dependency.mjs, tests/workflow-kit-source.test.mjs, tests/session-plans.test.mjs, tests/workflow-kit-recovery.test.mjs, tests/electron-smoke.mjs, tests/project-doctor.test.mjs, tests/workspace-setup.test.mjs, tests/session-opening-performance.test.mjs, docs/planning/workflow-kit-package-migration.md
- [DONE] T002: Добавить deterministic generated runtime staging — Завершено
  - Git Commit: [DONE] build: stage Workflow Kit runtime from package
  - Reference: workflow-kit-package-migration-039 / T002 / implementation
  - Файлы: package.json, scripts/stage-workflow-kit.mjs, scripts/check-workflow-kit-staging.mjs, scripts/release-all.mjs, tests/workflow-kit-source.test.mjs, docs/planning/workflow-kit-package-migration.md
- [DONE] T003: Удалить tracked Workflow Kit duplicate и закрепить generated contract — Завершено
  - Git Commit: [DONE] refactor: удалить bundled source duplicate Workflow Kit
  - Reference: workflow-kit-package-migration-039 / T003 / implementation
  - Файлы: .gitignore, tests/workflow-kit-source.test.mjs, tests/project-doctor.test.mjs, tests/workspace-setup.test.mjs, tests/session-opening-performance.test.mjs, tests/electron-smoke.mjs, resources/workflow-kit/cli.mjs, resources/workflow-kit/examples/verify-package.mjs, resources/workflow-kit/install.mjs, resources/workflow-kit/lib/actions.mjs, resources/workflow-kit/lib/command-help.mjs, resources/workflow-kit/lib/common.mjs, resources/workflow-kit/lib/extend-plan.mjs, resources/workflow-kit/lib/git-hooks.mjs, resources/workflow-kit/lib/git.mjs, resources/workflow-kit/lib/inspection-inputs.mjs, resources/workflow-kit/lib/installation-files.mjs, resources/workflow-kit/lib/installer.mjs, resources/workflow-kit/lib/plan.mjs, resources/workflow-kit/lib/platform.mjs, resources/workflow-kit/lib/project-facts.mjs, resources/workflow-kit/lib/recovery.mjs, resources/workflow-kit/lib/session-plans.mjs, resources/workflow-kit/lib/simple-workflow.mjs, resources/workflow-kit/lib/task-files.mjs, resources/workflow-kit/lib/task-update.mjs, resources/workflow-kit/lib/transaction.mjs, resources/workflow-kit/lib/validate.mjs, resources/workflow-kit/schemas/plan.schema.json, resources/workflow-kit/schemas/workflow.schema.json, scripts/check-workflow-kit-staging.mjs, docs/planning/workflow-kit-package-migration.md, resources/workflow-kit/WORKFLOW.md, resources/workflow-kit/examples/PACKAGING.md, resources/workflow-kit/templates/AGENTS.md, resources/workflow-kit/templates/ARCHITECTURE.md, resources/workflow-kit/templates/CONTINUE.md, resources/workflow-kit/templates/PLAN.md, resources/workflow-kit/templates/PRODUCT.md, resources/workflow-kit/templates/PROTOTYPE.md, resources/workflow-kit/templates/SPEC.md, resources/workflow-kit/templates/STAGES.md, resources/workflow-kit/templates/START.md
- [TODO] T004: Собрать и проверить парный macOS Windows релиз — Ожидает
  - Git Commit: [PENDING] build: выпустить WebPilot с canonical Workflow Kit package
  - Reference: workflow-kit-package-migration-039 / T004 / implementation
  - Файлы: package.json, package-lock.json, scripts/verify-windows-package.mjs, scripts/release-all.mjs, scripts/release-mac.mjs, docs/planning/workflow-kit-package-migration.md, docs/RELEASE.md, docs/VERIFICATION.md
- [TODO] DOCS: Актуализация всех документов проекта — Ожидает
  - Git Commit: [PENDING] docs: актуализировать контекст проекта
  - Reference: workflow-kit-package-migration-039 / DOCS / implementation
  - Файлы: docs/planning/workflow-kit-package-migration.md, docs/PRODUCT.md, docs/architecture/ARCHITECTURE.md, resources/workflow-kit/WORKFLOW.md, resources/workflow-kit/examples/PACKAGING.md, resources/workflow-kit/templates/AGENTS.md, resources/workflow-kit/templates/ARCHITECTURE.md, resources/workflow-kit/templates/CONTINUE.md, resources/workflow-kit/templates/PLAN.md, resources/workflow-kit/templates/PRODUCT.md, resources/workflow-kit/templates/PROTOTYPE.md, resources/workflow-kit/templates/SPEC.md, resources/workflow-kit/templates/STAGES.md, resources/workflow-kit/templates/START.md, docs/RELEASE.md, docs/VERIFICATION.md, docs/architecture/OVERVIEW.md, docs/MODULES.md, docs/DOCUMENTATION_INDEX.md

## Context Pack For This Cycle

- docs/architecture/OVERVIEW.md → Краткая архитектура проекта
- docs/MODULES.md → Модули проекта
- docs/DOCUMENTATION_INDEX.md → Каталог документации
- docs/planning/workflow-kit-package-migration.md

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
