# Активный план — Project Web Pilot

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 488,
  "project_id": "cf944136-d1fc-4bd5-9ea0-e46d1fe230e7",
  "project_name": "Project Web Pilot",
  "scope_id": "post-doctor-correction-022",
  "execution_scope_status": "ACTIVE",
  "delivery_status": "IN_PROGRESS",
  "objective": "Исправить выявленные после пользовательской проверки 0.6.20 расхождения: поддержать корректирующий цикл после READY_FOR_ACCEPTANCE, зафиксировать фактический успешный Project Doctor reconcile, восстановить повреждённый package.json, актуализировать документацию и выпустить отдельный релиз 0.6.21 для macOS/Windows.",
  "acceptance_criteria": [
    "После READY_FOR_ACCEPTANCE пользователь может поручить дополнительные исправления в том же активном scope; Workflow Kit возвращает scope в IN_PROGRESS и повторно делает DOCS последней обязательной задачей без неоднозначных commit references.",
    "Фактический успешный Project Doctor reconcile текущего проекта до Workflow Kit 1.3.0 зафиксирован, manifest больше не описывается как намеренно stale.",
    "Повреждённый package.json восстановлен до полного рабочего manifest и версия нового выпуска однозначно повышена до 0.6.21.",
    "Установленный и bundled Workflow Kit синхронизированы и regression tests покрывают повторный correction round.",
    "macOS arm64 и Windows x64 0.6.21 собраны, проверены и опубликованы в отдельной папке релиза без замены 0.6.20.",
    "Финальная DOCS повторно проверяет весь действующий комплект документации перед пользовательской приёмкой."
  ],
  "approved_scope": {
    "functional_paths": [
      ".harness/kit-manifest.json",
      "package.json",
      "package-lock.json",
      ".harness/kit/lib/actions.mjs",
      ".harness/kit/lib/transaction.mjs",
      ".harness/kit/lib/validate.mjs",
      "resources/workflow-kit/lib/actions.mjs",
      "resources/workflow-kit/lib/transaction.mjs",
      "resources/workflow-kit/lib/validate.mjs",
      "tests/workflow-kit-recovery.test.mjs",
      "tests/workflow-kit-source.test.mjs",
      "tests/electron-smoke.mjs"
    ],
    "documentation_paths": [
      "README.md",
      "AGENTS.md",
      ".harness/kit/WORKFLOW.md",
      "resources/workflow-kit/WORKFLOW.md",
      "docs/DOCUMENTATION_INDEX.md",
      "docs/architecture/OVERVIEW.md",
      "docs/architecture/ARCHITECTURE.md",
      "docs/MODULES.md",
      "docs/WORKFLOW_START.md",
      "docs/PRODUCT.md",
      "docs/DECISIONS.md",
      "docs/CONTEXT_DELIVERY.md",
      "docs/VERIFICATION.md",
      "docs/TRANSFER_TO_WINDOWS.md",
      "docs/WORKSPACE_SETUP.md",
      "docs/PROJECT_ARCHIVE.md",
      "docs/SOURCE_WORKSPACES.md",
      "docs/modules/workflow-kit-recovery.md",
      "docs/modules/project-doctor.md",
      "docs/modules/runtime-lifecycle.md",
      "docs/modules/workspace-sessions.md"
    ],
    "max_functional_files_per_task": 3
  },
  "baseline_commit": "c28462fe3194dcd6223ccabde3cd77cf510558cf",
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
        "path": "docs/modules/project-doctor.md",
        "heading_path": [
          "Module Specification — Project Doctor"
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
        "scope_id": "post-doctor-correction-022",
        "task_id": "T001",
        "role": "implementation"
      },
      "dependencies": [],
      "functional_paths": [],
      "documentation_paths": [
        "docs/modules/workflow-kit-recovery.md",
        "docs/architecture/OVERVIEW.md"
      ],
      "verification_ids": [],
      "id": "T001",
      "title": "Согласовать correction-round contract",
      "why": "Привести действующий контракт Workflow Kit в соответствие с пользовательским сценарием: после проверки результата дополнительные исправления не должны требовать аварийного обхода lifecycle.",
      "acceptance_criteria": [
        "Спецификация однозначно определяет повторный correction round, повторную DOCS и сохранение пользовательского gate."
      ],
      "expected_commit_message": "docs(workflow): согласовать correction round"
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "post-doctor-correction-022",
        "task_id": "T002",
        "role": "implementation"
      },
      "dependencies": [
        "T001"
      ],
      "functional_paths": [
        ".harness/kit-manifest.json",
        "package.json"
      ],
      "documentation_paths": [],
      "verification_ids": [],
      "id": "T002",
      "title": "Закрепить успешный Doctor reconcile и восстановить package manifest",
      "why": "Сохранить фактический результат пользовательского ремонта и вернуть проекту полноценные build/test scripts до дальнейших проверок.",
      "acceptance_criteria": [
        "Manifest фиксирует 1.3.0 и doctor_reconciled_at; package.json снова содержит private/scripts/devDependencies и остаётся на 0.6.20 до отдельного release bump."
      ],
      "documentation_exception": "Это фиксация фактического post-doctor состояния и восстановление повреждённого package manifest без изменения продуктовой архитектуры; пользовательская документация обновляется отдельной задачей и финальной DOCS.",
      "expected_commit_message": "fix(project): восстановить состояние после doctor"
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "post-doctor-correction-022",
        "task_id": "T003",
        "role": "implementation"
      },
      "dependencies": [
        "T002"
      ],
      "functional_paths": [
        ".harness/kit/lib/actions.mjs",
        ".harness/kit/lib/transaction.mjs",
        ".harness/kit/lib/validate.mjs"
      ],
      "documentation_paths": [
        "docs/modules/workflow-kit-recovery.md"
      ],
      "verification_ids": [],
      "id": "T003",
      "title": "Реализовать повторный correction round Workflow Kit",
      "why": "Разрешить штатно возвращать ACTIVE scope из READY_FOR_ACCEPTANCE в работу после пользовательской проверки и снова завершать его через DOCS.",
      "acceptance_criteria": [
        "Новые correction tasks разрешены только явным plan:apply; прежняя DOCS безопасно rearm с новым commit iteration; старые commit references остаются однозначными."
      ],
      "expected_commit_message": "fix(workflow): поддержать correction round"
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "post-doctor-correction-022",
        "task_id": "T004",
        "role": "implementation"
      },
      "dependencies": [
        "T003"
      ],
      "functional_paths": [
        "resources/workflow-kit/lib/actions.mjs",
        "resources/workflow-kit/lib/transaction.mjs",
        "resources/workflow-kit/lib/validate.mjs",
        "tests/workflow-kit-recovery.test.mjs",
        "tests/workflow-kit-source.test.mjs"
      ],
      "documentation_paths": [
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "suite"
      ],
      "id": "T004",
      "title": "Синхронизировать bundled Kit и regression tests",
      "why": "Поставляемый Workflow Kit должен иметь ту же correction-round semantics и автоматическую проверку поведения.",
      "acceptance_criteria": [
        "Installed/bundled Kit синхронизированы; regression воспроизводит READY_FOR_ACCEPTANCE → correction tasks → повторная DOCS → READY_FOR_ACCEPTANCE и полный suite проходит."
      ],
      "file_limit_exception": "Изменение обязано синхронно обновить три bundled lifecycle-файла и два связанных regression test, иначе поставляемая копия и проверка источника расходятся.",
      "expected_commit_message": "test(workflow): закрепить повторную коррекцию"
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "post-doctor-correction-022",
        "task_id": "T005",
        "role": "implementation"
      },
      "dependencies": [
        "T004"
      ],
      "functional_paths": [
        "package.json",
        "package-lock.json"
      ],
      "documentation_paths": [
        "docs/architecture/ARCHITECTURE.md"
      ],
      "verification_ids": [
        "suite"
      ],
      "id": "T005",
      "title": "Подготовить версию 0.6.21",
      "why": "Новый исправленный выпуск не должен подменять ранее проверенный 0.6.20.",
      "acceptance_criteria": [
        "package/lock/build scripts используют 0.6.21; 0.6.20 остаётся отдельным историческим релизом."
      ],
      "expected_commit_message": "build: подготовить релиз 0.6.21"
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "post-doctor-correction-022",
        "task_id": "T006",
        "role": "implementation"
      },
      "dependencies": [
        "T005"
      ],
      "functional_paths": [
        "tests/electron-smoke.mjs",
        ".harness/kit-manifest.json"
      ],
      "documentation_paths": [
        "docs/VERIFICATION.md",
        "docs/architecture/ARCHITECTURE.md",
        ".harness/kit/WORKFLOW.md",
        "resources/workflow-kit/WORKFLOW.md"
      ],
      "verification_ids": [
        "suite",
        "electron-smoke"
      ],
      "id": "T006",
      "title": "Проверить и собрать релиз 0.6.21",
      "why": "Перед финальной документацией получить фактические test/smoke/package evidence для обеих платформ.",
      "acceptance_criteria": [
        "Полный suite и Electron smoke проходят; macOS arm64/Windows x64 собраны в отдельной папке releases/0.6.21, Windows package verified, SHA256SUMS сформирован.",
        "Installed и bundled Workflow Kit остаются синхронны, а текущий kit-manifest содержит hashes именно этого финального 1.3.0 runtime."
      ],
      "expected_commit_message": "build: выпустить Project Web Pilot 0.6.21"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "post-doctor-correction-022",
        "task_id": "DOCS",
        "role": "implementation"
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
        "README.md",
        "AGENTS.md",
        ".harness/kit/WORKFLOW.md",
        "resources/workflow-kit/WORKFLOW.md",
        "docs/DOCUMENTATION_INDEX.md",
        "docs/architecture/OVERVIEW.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/MODULES.md",
        "docs/WORKFLOW_START.md",
        "docs/PRODUCT.md",
        "docs/DECISIONS.md",
        "docs/CONTEXT_DELIVERY.md",
        "docs/VERIFICATION.md",
        "docs/TRANSFER_TO_WINDOWS.md",
        "docs/WORKSPACE_SETUP.md",
        "docs/PROJECT_ARCHIVE.md",
        "docs/SOURCE_WORKSPACES.md",
        "docs/modules/workflow-kit-recovery.md",
        "docs/modules/project-doctor.md",
        "docs/modules/runtime-lifecycle.md",
        "docs/modules/workspace-sessions.md"
      ],
      "verification_ids": [],
      "id": "DOCS",
      "title": "Актуализация всех документов проекта",
      "why": "После исправлений и сборки пройти весь действующий комплект по индексу и устранить устаревшие сведения, включая статус реального Project Doctor reconcile и актуальную версию релиза.",
      "acceptance_criteria": [
        "Все документы из docs/DOCUMENTATION_INDEX.md проверены; действующие сведения соответствуют 0.6.21 и фактическому post-doctor состоянию; исторические записи сохранены как история."
      ],
      "expected_commit_message": "docs: актуализировать документацию 0.6.21"
    }
  ],
  "blocked_reason": null,
  "user_decisions": [
    {
      "id": "7cc648b0-cf20-40ee-8d74-f3e7dab2e697",
      "text": "Пользователь прямо поручил закрыть предыдущий этап, создать correction-scope, исправить найденные расхождения, восстановить package.json, поддержать повторную коррекцию после READY_FOR_ACCEPTANCE, актуализировать документацию и выпустить новый релиз.",
      "recorded_at": "2026-09-16T07:39:35.377Z"
    }
  ]
}
```
<!-- workflow-state:end -->

## Состояние

Execution Scope Status: ACTIVE
Delivery Status: IN_PROGRESS
Scope: post-doctor-correction-022
Current Task: нет
Revision: 488

## Цель

Исправить выявленные после пользовательской проверки 0.6.20 расхождения: поддержать корректирующий цикл после READY_FOR_ACCEPTANCE, зафиксировать фактический успешный Project Doctor reconcile, восстановить повреждённый package.json, актуализировать документацию и выпустить отдельный релиз 0.6.21 для macOS/Windows.

## Критерии приёмки

- После READY_FOR_ACCEPTANCE пользователь может поручить дополнительные исправления в том же активном scope; Workflow Kit возвращает scope в IN_PROGRESS и повторно делает DOCS последней обязательной задачей без неоднозначных commit references.
- Фактический успешный Project Doctor reconcile текущего проекта до Workflow Kit 1.3.0 зафиксирован, manifest больше не описывается как намеренно stale.
- Повреждённый package.json восстановлен до полного рабочего manifest и версия нового выпуска однозначно повышена до 0.6.21.
- Установленный и bundled Workflow Kit синхронизированы и regression tests покрывают повторный correction round.
- macOS arm64 и Windows x64 0.6.21 собраны, проверены и опубликованы в отдельной папке релиза без замены 0.6.20.
- Финальная DOCS повторно проверяет весь действующий комплект документации перед пользовательской приёмкой.

## Микрозадачи

- [DONE] T001: Согласовать correction-round contract — Завершено
  - Git Commit: [DONE] docs(workflow): согласовать correction round
  - Reference: post-doctor-correction-022 / T001 / implementation
  - Файлы: docs/modules/workflow-kit-recovery.md, docs/architecture/OVERVIEW.md
- [DONE] T002: Закрепить успешный Doctor reconcile и восстановить package manifest — Завершено
  - Git Commit: [DONE] fix(project): восстановить состояние после doctor
  - Reference: post-doctor-correction-022 / T002 / implementation
  - Файлы: .harness/kit-manifest.json, package.json
- [DONE] T003: Реализовать повторный correction round Workflow Kit — Завершено
  - Git Commit: [DONE] fix(workflow): поддержать correction round
  - Reference: post-doctor-correction-022 / T003 / implementation
  - Файлы: .harness/kit/lib/actions.mjs, .harness/kit/lib/transaction.mjs, .harness/kit/lib/validate.mjs, docs/modules/workflow-kit-recovery.md
- [DONE] T004: Синхронизировать bundled Kit и regression tests — Завершено
  - Git Commit: [DONE] test(workflow): закрепить повторную коррекцию
  - Reference: post-doctor-correction-022 / T004 / implementation
  - Файлы: resources/workflow-kit/lib/actions.mjs, resources/workflow-kit/lib/transaction.mjs, resources/workflow-kit/lib/validate.mjs, tests/workflow-kit-recovery.test.mjs, tests/workflow-kit-source.test.mjs, docs/VERIFICATION.md
- [DONE] T005: Подготовить версию 0.6.21 — Завершено
  - Git Commit: [DONE] build: подготовить релиз 0.6.21
  - Reference: post-doctor-correction-022 / T005 / implementation
  - Файлы: package.json, package-lock.json, docs/architecture/ARCHITECTURE.md
- [DONE] T006: Проверить и собрать релиз 0.6.21 — Завершено
  - Git Commit: [DONE] build: выпустить Project Web Pilot 0.6.21
  - Reference: post-doctor-correction-022 / T006 / implementation
  - Файлы: tests/electron-smoke.mjs, .harness/kit-manifest.json, docs/VERIFICATION.md, docs/architecture/ARCHITECTURE.md, .harness/kit/WORKFLOW.md, resources/workflow-kit/WORKFLOW.md
- [TODO] DOCS: Актуализация всех документов проекта — Ожидает
  - Git Commit: [PENDING] docs: актуализировать документацию 0.6.21
  - Reference: post-doctor-correction-022 / DOCS / implementation
  - Файлы: README.md, AGENTS.md, .harness/kit/WORKFLOW.md, resources/workflow-kit/WORKFLOW.md, docs/DOCUMENTATION_INDEX.md, docs/architecture/OVERVIEW.md, docs/architecture/ARCHITECTURE.md, docs/MODULES.md, docs/WORKFLOW_START.md, docs/PRODUCT.md, docs/DECISIONS.md, docs/CONTEXT_DELIVERY.md, docs/VERIFICATION.md, docs/TRANSFER_TO_WINDOWS.md, docs/WORKSPACE_SETUP.md, docs/PROJECT_ARCHIVE.md, docs/SOURCE_WORKSPACES.md, docs/modules/workflow-kit-recovery.md, docs/modules/project-doctor.md, docs/modules/runtime-lifecycle.md, docs/modules/workspace-sessions.md

## Context Pack For This Cycle

- docs/architecture/OVERVIEW.md → Краткая архитектура проекта
- docs/MODULES.md → Модули проекта
- docs/DOCUMENTATION_INDEX.md → Каталог документации
- docs/modules/workflow-kit-recovery.md → Module Specification — Workflow Kit / Context Recovery
- docs/modules/project-doctor.md → Module Specification — Project Doctor

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
