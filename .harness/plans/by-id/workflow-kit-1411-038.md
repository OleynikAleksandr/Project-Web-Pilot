# Активный план — Project Web Pilot

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 14,
  "project_id": "cf944136-d1fc-4bd5-9ea0-e46d1fe230e7",
  "project_name": "Project Web Pilot",
  "scope_id": "workflow-kit-1411-038",
  "execution_scope_status": "ACTIVE",
  "delivery_status": "IN_PROGRESS",
  "objective": "Поставлять в новых и подключаемых проектах Workflow Kit 1.4.11 и выпустить парный релиз 0.6.52; затем Kit 1.4.12 с видимыми планами by-session и выпуск 0.6.53",
  "acceptance_criteria": [
    "resources/workflow-kit побайтно совпадает с Workflow Kit 1.4.11 из CodeAppServer badcf20 (tree 1fe409fb)",
    "Новый проект получает Workflow Kit 1.4.11; проект 1.4.1 предлагается к обновлению и обновляется с сохранением планов сессий",
    "Доктор и подготовка принимают установки 1.4.1; сайдбар объясняет необходимость обновления Kit",
    "Полный Node suite проходит",
    "Парный выпуск 0.6.52 собран npm run build: ZIP macOS arm64 и Windows x64 в ~/Downloads/WebPilot-0.6.52/, корневой Project Web Pilot.app обновлён"
  ],
  "approved_scope": {
    "functional_paths": [
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
      "resources/workspace-setup-worker.mjs",
      "resources/project-doctor/core.mjs",
      "src/ui/sidebar.mjs",
      "tests/workflow-kit-source.test.mjs",
      "tests/workspace-setup.test.mjs",
      "tests/project-doctor.test.mjs",
      "tests/electron-smoke.mjs",
      "package.json",
      "package-lock.json",
      "tests/workflow-kit-recovery.test.mjs",
      "src/context-inputs.mjs",
      "src/context-session.mjs",
      "tests/session-plans.test.mjs",
      "tests/context-session.test.mjs"
    ],
    "documentation_paths": [
      "docs/architecture/OVERVIEW.md",
      "docs/MODULES.md",
      "docs/DOCUMENTATION_INDEX.md",
      "docs/modules/workflow-kit-recovery.md",
      "docs/WORKSPACE_SETUP.md",
      "docs/RELEASE.md",
      "docs/VERIFICATION.md",
      "README.md",
      "AGENTS.md",
      "docs/SOURCE_WORKSPACES.md",
      "docs/architecture/ARCHITECTURE.md",
      "docs/PRODUCT.md",
      "docs/modules/project-doctor.md",
      "resources/workflow-kit/WORKFLOW.md",
      "docs/modules/session-owned-plans.md"
    ],
    "max_functional_files_per_task": 3
  },
  "baseline_commit": "f7673110508daa85fa5e19e7c7f89ba2fcd8d4ad",
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
        "path": "docs/modules/workflow-kit-recovery.md",
        "heading_path": [
          "Module Specification — Workflow Kit / Context Recovery"
        ],
        "required": true,
        "revision": "WORKTREE"
      },
      {
        "path": "docs/WORKSPACE_SETUP.md",
        "heading_path": [
          "Создание и подключение workspace"
        ],
        "required": true,
        "revision": "WORKTREE"
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
        "scope_id": "workflow-kit-1411-038",
        "task_id": "T001",
        "role": "implementation"
      },
      "dependencies": [],
      "functional_paths": [
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
        "resources/workspace-setup-worker.mjs",
        "resources/project-doctor/core.mjs",
        "src/ui/sidebar.mjs",
        "tests/workflow-kit-source.test.mjs",
        "tests/workspace-setup.test.mjs",
        "tests/project-doctor.test.mjs",
        "tests/electron-smoke.mjs",
        "tests/workflow-kit-recovery.test.mjs"
      ],
      "documentation_paths": [
        "docs/modules/workflow-kit-recovery.md",
        "docs/WORKSPACE_SETUP.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md",
        "docs/DOCUMENTATION_INDEX.md"
      ],
      "verification_ids": [
        "suite"
      ],
      "id": "T001",
      "title": "Поставляемый Workflow Kit 1.4.11 и обновление проектов 1.4.1",
      "why": "Новые проекты получают актуальный Kit; старые обновляются штатным upgrade",
      "file_limit_exception": "Замена целого поставляемого комплекта Kit (35 файлов) — одна атомарная единица; вместе с ней адаптеры подготовки, Доктора, сайдбара и их тесты",
      "acceptance_criteria": [
        "Комплект совпадает с источником 1.4.11",
        "Установка нового проекта даёт 1.4.11",
        "Проект 1.4.1 получает upgrade и сохраняет планы",
        "npm test проходит"
      ],
      "expected_commit_message": "feat: поставлять Workflow Kit 1.4.11"
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "workflow-kit-1411-038",
        "task_id": "T002",
        "role": "implementation"
      },
      "dependencies": [],
      "functional_paths": [
        "package.json",
        "package-lock.json"
      ],
      "documentation_paths": [],
      "verification_ids": [
        "syntax"
      ],
      "id": "T002",
      "title": "Версия 0.6.52",
      "why": "Новый парный выпуск",
      "acceptance_criteria": [
        "package.json и package-lock.json имеют 0.6.52, build-скрипты передают --app-version=0.6.52"
      ],
      "expected_commit_message": "chore: версия 0.6.52",
      "documentation_exception": "Меняется только номер версии выпуска; архитектура и зависимости не меняются."
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "workflow-kit-1411-038",
        "task_id": "T003",
        "role": "implementation"
      },
      "dependencies": [
        "T002"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/RELEASE.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [],
      "id": "T003",
      "title": "Парный выпуск 0.6.52",
      "why": "Собрать и проверить macOS + Windows",
      "acceptance_criteria": [
        "npm run build завершился успешно",
        "ZIP и SHA-256 записаны в RELEASE/VERIFICATION"
      ],
      "expected_commit_message": "feat: Парный выпуск 0.6.52"
    },
    {
      "id": "T004",
      "title": "Kit 1.4.12: планы by-session и полная интеграция в приложение",
      "why": "Планы, созданные plan:create --session с проверками, лежат в by-session и не видны сайдбару, Доктору и проверке готовности",
      "dependencies": [],
      "functional_paths": [
        "resources/workflow-kit/lib/session-plans.mjs",
        "resources/workflow-kit/lib/inspection-inputs.mjs",
        "resources/workflow-kit/lib/common.mjs",
        "resources/workflow-kit/lib/installer.mjs",
        "resources/workspace-setup-worker.mjs",
        "resources/project-doctor/core.mjs",
        "src/context-inputs.mjs",
        "src/context-session.mjs",
        "tests/workflow-kit-source.test.mjs",
        "tests/session-plans.test.mjs",
        "tests/context-session.test.mjs",
        "tests/workspace-setup.test.mjs",
        "tests/project-doctor.test.mjs",
        "tests/electron-smoke.mjs"
      ],
      "documentation_paths": [
        "resources/workflow-kit/WORKFLOW.md",
        "docs/modules/workflow-kit-recovery.md",
        "docs/modules/session-owned-plans.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md"
      ],
      "file_limit_exception": "Исправление Kit и все его потребители в приложении (сайдбар, Доктор, готовность, кэш контекста) меняются согласованно одной задачей с общими тестами",
      "acceptance_criteria": [
        "plan:create --session с проверками создаёт план, который видят sessionPlanView, listPlans, readiness и Доктор",
        "Проект 1.4.11 предлагается к обновлению до 1.4.12",
        "Статус «Локальные инструменты» проверяется и для уже доставленной сессии",
        "npm test проходит"
      ],
      "verification_ids": [
        "suite"
      ],
      "expected_commit_message": "fix: Workflow Kit 1.4.12 и полная интеграция планов сессий",
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "workflow-kit-1411-038",
        "task_id": "T004",
        "role": "implementation"
      }
    },
    {
      "id": "T005",
      "title": "Версия 0.6.53",
      "why": "Новый парный выпуск",
      "dependencies": [],
      "functional_paths": [
        "package.json",
        "package-lock.json"
      ],
      "documentation_paths": [],
      "documentation_exception": "Меняется только номер версии выпуска; архитектура и зависимости не меняются.",
      "acceptance_criteria": [
        "package.json, package-lock.json и build-скрипты — 0.6.53"
      ],
      "verification_ids": [
        "syntax"
      ],
      "expected_commit_message": "chore: версия 0.6.53",
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "workflow-kit-1411-038",
        "task_id": "T005",
        "role": "implementation"
      }
    },
    {
      "id": "T006",
      "title": "Парный выпуск 0.6.53",
      "why": "Собрать и проверить macOS + Windows",
      "dependencies": [
        "T005"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/RELEASE.md",
        "docs/VERIFICATION.md"
      ],
      "acceptance_criteria": [
        "npm test, smoke и npm run build прошли на Mac",
        "Корневой и /Applications app — 0.6.53; план 02WebPilot виден в собранном app"
      ],
      "verification_ids": [],
      "expected_commit_message": "feat: Парный выпуск 0.6.53",
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "workflow-kit-1411-038",
        "task_id": "T006",
        "role": "implementation"
      }
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "workflow-kit-1411-038",
        "task_id": "DOCS",
        "role": "implementation",
        "iteration": 2
      },
      "dependencies": [
        "T001",
        "T002",
        "T003",
        "T004",
        "T005",
        "T006"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/architecture/OVERVIEW.md",
        "docs/MODULES.md",
        "docs/DOCUMENTATION_INDEX.md",
        "README.md",
        "AGENTS.md",
        "docs/SOURCE_WORKSPACES.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/PRODUCT.md",
        "docs/modules/project-doctor.md",
        "docs/modules/workflow-kit-recovery.md",
        "docs/WORKSPACE_SETUP.md"
      ],
      "verification_ids": [],
      "id": "DOCS",
      "title": "Актуализация всех документов проекта",
      "why": "После выполнения этапа проверить весь действующий комплект документации по индексу и обновить только устаревшие сведения и ссылки",
      "acceptance_criteria": [
        "Все документы из индекса проверены; актуальные оставлены без бессмысленных правок; устаревшие сведения и ссылки исправлены"
      ],
      "expected_commit_message": "docs: актуализировать документацию проекта"
    }
  ],
  "blocked_reason": null,
  "user_decisions": [
    {
      "id": "f73e8fd4-0669-4473-8410-65bcfe4dcf00",
      "text": "Пользователь 25.09.2026 поручил обновить поставляемый Workflow Kit Project Web Pilot до 1.4.11 и собрать новый релиз macOS + Windows. Собственный Kit репозитория остаётся 1.4.1. Существующие проекты 1.4.1 обновляются как раньше: явной кнопкой «Обновить и открыть» с резервной копией. Источник 1.4.11 — CodeAppServer, ветка codex/gpt-provider-names, коммит badcf20.",
      "recorded_at": "2026-09-25T15:54:35.700Z"
    }
  ],
  "owner_session_id": "cowork-kit-1411",
  "prepared_in_session_id": null
}
```
<!-- workflow-state:end -->

## Состояние

Execution Scope Status: ACTIVE
Delivery Status: IN_PROGRESS
Scope: workflow-kit-1411-038
Current Task: нет
Revision: 14

## Цель

Поставлять в новых и подключаемых проектах Workflow Kit 1.4.11 и выпустить парный релиз 0.6.52; затем Kit 1.4.12 с видимыми планами by-session и выпуск 0.6.53

## Критерии приёмки

- resources/workflow-kit побайтно совпадает с Workflow Kit 1.4.11 из CodeAppServer badcf20 (tree 1fe409fb)
- Новый проект получает Workflow Kit 1.4.11; проект 1.4.1 предлагается к обновлению и обновляется с сохранением планов сессий
- Доктор и подготовка принимают установки 1.4.1; сайдбар объясняет необходимость обновления Kit
- Полный Node suite проходит
- Парный выпуск 0.6.52 собран npm run build: ZIP macOS arm64 и Windows x64 в ~/Downloads/WebPilot-0.6.52/, корневой Project Web Pilot.app обновлён

## Микрозадачи

- [DONE] T001: Поставляемый Workflow Kit 1.4.11 и обновление проектов 1.4.1 — Завершено
  - Git Commit: [DONE] feat: поставлять Workflow Kit 1.4.11
  - Reference: workflow-kit-1411-038 / T001 / implementation
  - Файлы: resources/workflow-kit/WORKFLOW.md, resources/workflow-kit/cli.mjs, resources/workflow-kit/examples/PACKAGING.md, resources/workflow-kit/examples/verify-package.mjs, resources/workflow-kit/install.mjs, resources/workflow-kit/lib/actions.mjs, resources/workflow-kit/lib/command-help.mjs, resources/workflow-kit/lib/common.mjs, resources/workflow-kit/lib/extend-plan.mjs, resources/workflow-kit/lib/git-hooks.mjs, resources/workflow-kit/lib/git.mjs, resources/workflow-kit/lib/inspection-inputs.mjs, resources/workflow-kit/lib/installation-files.mjs, resources/workflow-kit/lib/installer.mjs, resources/workflow-kit/lib/plan.mjs, resources/workflow-kit/lib/platform.mjs, resources/workflow-kit/lib/project-facts.mjs, resources/workflow-kit/lib/recovery.mjs, resources/workflow-kit/lib/session-plans.mjs, resources/workflow-kit/lib/simple-workflow.mjs, resources/workflow-kit/lib/task-files.mjs, resources/workflow-kit/lib/task-update.mjs, resources/workflow-kit/lib/transaction.mjs, resources/workflow-kit/lib/validate.mjs, resources/workflow-kit/schemas/plan.schema.json, resources/workflow-kit/schemas/workflow.schema.json, resources/workflow-kit/templates/AGENTS.md, resources/workflow-kit/templates/ARCHITECTURE.md, resources/workflow-kit/templates/CONTINUE.md, resources/workflow-kit/templates/PLAN.md, resources/workflow-kit/templates/PRODUCT.md, resources/workflow-kit/templates/PROTOTYPE.md, resources/workflow-kit/templates/SPEC.md, resources/workflow-kit/templates/STAGES.md, resources/workflow-kit/templates/START.md, resources/workspace-setup-worker.mjs, resources/project-doctor/core.mjs, src/ui/sidebar.mjs, tests/workflow-kit-source.test.mjs, tests/workspace-setup.test.mjs, tests/project-doctor.test.mjs, tests/electron-smoke.mjs, tests/workflow-kit-recovery.test.mjs, docs/modules/workflow-kit-recovery.md, docs/WORKSPACE_SETUP.md, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md, docs/DOCUMENTATION_INDEX.md
- [DONE] T002: Версия 0.6.52 — Завершено
  - Git Commit: [DONE] chore: версия 0.6.52
  - Reference: workflow-kit-1411-038 / T002 / implementation
  - Файлы: package.json, package-lock.json
- [DONE] T003: Парный выпуск 0.6.52 — Завершено
  - Git Commit: [DONE] feat: Парный выпуск 0.6.52
  - Reference: workflow-kit-1411-038 / T003 / implementation
  - Файлы: docs/RELEASE.md, docs/VERIFICATION.md
- [TODO] T004: Kit 1.4.12: планы by-session и полная интеграция в приложение — Ожидает
  - Git Commit: [PENDING] fix: Workflow Kit 1.4.12 и полная интеграция планов сессий
  - Reference: workflow-kit-1411-038 / T004 / implementation
  - Файлы: resources/workflow-kit/lib/session-plans.mjs, resources/workflow-kit/lib/inspection-inputs.mjs, resources/workflow-kit/lib/common.mjs, resources/workflow-kit/lib/installer.mjs, resources/workspace-setup-worker.mjs, resources/project-doctor/core.mjs, src/context-inputs.mjs, src/context-session.mjs, tests/workflow-kit-source.test.mjs, tests/session-plans.test.mjs, tests/context-session.test.mjs, tests/workspace-setup.test.mjs, tests/project-doctor.test.mjs, tests/electron-smoke.mjs, resources/workflow-kit/WORKFLOW.md, docs/modules/workflow-kit-recovery.md, docs/modules/session-owned-plans.md, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md
- [TODO] T005: Версия 0.6.53 — Ожидает
  - Git Commit: [PENDING] chore: версия 0.6.53
  - Reference: workflow-kit-1411-038 / T005 / implementation
  - Файлы: package.json, package-lock.json
- [TODO] T006: Парный выпуск 0.6.53 — Ожидает
  - Git Commit: [PENDING] feat: Парный выпуск 0.6.53
  - Reference: workflow-kit-1411-038 / T006 / implementation
  - Файлы: docs/RELEASE.md, docs/VERIFICATION.md
- [TODO] DOCS: Актуализация всех документов проекта — Ожидает
  - Git Commit: [PENDING] docs: актуализировать документацию проекта
  - Reference: workflow-kit-1411-038 / DOCS / implementation
  - Файлы: docs/architecture/OVERVIEW.md, docs/MODULES.md, docs/DOCUMENTATION_INDEX.md, README.md, AGENTS.md, docs/SOURCE_WORKSPACES.md, docs/architecture/ARCHITECTURE.md, docs/PRODUCT.md, docs/modules/project-doctor.md, docs/modules/workflow-kit-recovery.md, docs/WORKSPACE_SETUP.md

## Context Pack For This Cycle

- docs/architecture/OVERVIEW.md → Краткая архитектура проекта
- docs/MODULES.md → Модули проекта
- docs/DOCUMENTATION_INDEX.md → Каталог документации
- docs/modules/workflow-kit-recovery.md → Module Specification — Workflow Kit / Context Recovery
- docs/WORKSPACE_SETUP.md → Создание и подключение workspace

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
