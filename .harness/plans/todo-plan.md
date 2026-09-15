# Активный план — Project Web Pilot

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 446,
  "project_id": "cf944136-d1fc-4bd5-9ea0-e46d1fe230e7",
  "project_name": "Project Web Pilot",
  "scope_id": "workflow-project-continuity-021",
  "execution_scope_status": "ACTIVE",
  "delivery_status": "IN_PROGRESS",
  "objective": "Сделать Workflow Kit универсальным для проектов любого типа: сохранять постоянный проектный контекст в NONE, автоматически добавлять обязательную финальную актуализацию документации и только после неё переводить результат к пользовательской приёмке.",
  "acceptance_criteria": [
    "После archive новый NONE ToDo-plan содержит обязательные ссылки на docs/architecture/OVERVIEW.md, docs/MODULES.md и docs/DOCUMENTATION_INDEX.md и приглашает обсудить следующий этап проекта.",
    "Новый рабочий scope автоматически содержит последнюю микрозадачу «Актуализация всех документов проекта», которая зависит от всех остальных задач.",
    "READY_FOR_ACCEPTANCE появляется только после завершения финальной актуализации документации; пользовательская приёмка остаётся отдельным последующим gate и не закрывается агентом.",
    "Workflow и шаблоны описывают проекты общего типа, а для программных проектов сохраняют модульные спецификации и фасады как профильную специализацию.",
    "Bundled Workflow Kit обновлён и новый релиз Project Web Pilot проходит автоматические проверки и сборку macOS/Windows."
  ],
  "approved_scope": {
    "functional_paths": [
      ".harness/kit/lib/plan.mjs",
      ".harness/kit/lib/actions.mjs",
      ".harness/kit/lib/transaction.mjs",
      ".harness/kit/lib/git-hooks.mjs",
      ".harness/kit/lib/recovery.mjs",
      ".harness/kit/lib/common.mjs",
      ".harness/kit/lib/installer.mjs",
      ".harness/kit/lib/installation-files.mjs",
      "resources/workflow-kit/lib/plan.mjs",
      "resources/workflow-kit/lib/actions.mjs",
      "resources/workflow-kit/lib/transaction.mjs",
      "resources/workflow-kit/lib/git-hooks.mjs",
      "resources/workflow-kit/lib/recovery.mjs",
      "resources/workflow-kit/lib/common.mjs",
      "resources/workflow-kit/lib/installer.mjs",
      "resources/workflow-kit/lib/installation-files.mjs",
      "tests/workflow-kit-recovery.test.mjs",
      "tests/workflow-kit-source.test.mjs",
      "package.json",
      "package-lock.json",
      "resources/workspace-setup-worker.mjs",
      "tests/workspace-setup.test.mjs"
    ],
    "documentation_paths": [
      ".harness/kit/WORKFLOW.md",
      "resources/workflow-kit/WORKFLOW.md",
      ".harness/kit/templates/PLAN.md",
      "resources/workflow-kit/templates/PLAN.md",
      ".harness/kit/templates/AGENTS.md",
      "resources/workflow-kit/templates/AGENTS.md",
      ".harness/plans/todo-plan.template.md",
      "AGENTS.md",
      "docs/modules/workflow-kit-recovery.md",
      "docs/architecture/OVERVIEW.md",
      "docs/MODULES.md",
      "docs/DOCUMENTATION_INDEX.md",
      "docs/WORKFLOW_START.md",
      "docs/PRODUCT.md",
      "docs/VERIFICATION.md"
    ],
    "max_functional_files_per_task": 7
  },
  "baseline_commit": "f19b4d9afed1f56cd92e81f59625364b588226b6",
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
      }
    ],
    "include_last_completed_task": false,
    "dependency_task_ids": []
  },
  "tasks": [
    {
      "dependencies": [],
      "functional_paths": [],
      "documentation_paths": [
        "docs/modules/workflow-kit-recovery.md",
        "docs/architecture/OVERVIEW.md",
        "docs/MODULES.md"
      ],
      "verification_ids": [],
      "id": "T001",
      "title": "Зафиксировать универсальный контракт continuity",
      "why": "Сначала закрепить согласованное поведение для проектов любого типа и границы NONE/ACTIVE/приёмки.",
      "acceptance_criteria": [
        "Спецификация описывает постоянный проектный контекст, универсальные части проекта, обязательную финальную актуализацию документов и отдельную пользовательскую приёмку."
      ],
      "expected_commit_message": "docs: согласовать continuity проектов",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "workflow-project-continuity-021",
        "task_id": "T001",
        "role": "implementation"
      }
    },
    {
      "dependencies": [
        "T001"
      ],
      "functional_paths": [
        ".harness/kit/lib/plan.mjs",
        ".harness/kit/lib/actions.mjs",
        "resources/workflow-kit/lib/plan.mjs",
        "resources/workflow-kit/lib/actions.mjs",
        "tests/workflow-kit-recovery.test.mjs"
      ],
      "documentation_paths": [],
      "verification_ids": [],
      "id": "T002",
      "title": "Реализовать постоянный NONE-контекст и completion contract",
      "why": "Пустой план не должен означать потерю знания о проекте, а новый scope не должен зависеть от памяти агента о финальной документационной задаче.",
      "acceptance_criteria": [
        "emptyPlan содержит проектный navigation context и нейтральную цель обсуждения следующего этапа; scope:create автоматически нормализует обязательный проектный контекст и финальную DOCS-задачу."
      ],
      "expected_commit_message": "feat(workflow): закрепить project continuity",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "workflow-project-continuity-021",
        "task_id": "T002",
        "role": "implementation"
      },
      "documentation_exception": "Контракт изменения уже согласован и зафиксирован в prerequisite T001: docs/modules/workflow-kit-recovery.md, docs/architecture/OVERVIEW.md и docs/MODULES.md. T002 реализует этот утверждённый контракт без нового изменения документации."
    },
    {
      "dependencies": [
        "T002"
      ],
      "functional_paths": [
        ".harness/kit/lib/transaction.mjs",
        ".harness/kit/lib/git-hooks.mjs",
        ".harness/kit/lib/recovery.mjs",
        "resources/workflow-kit/lib/transaction.mjs",
        "resources/workflow-kit/lib/git-hooks.mjs",
        "resources/workflow-kit/lib/recovery.mjs"
      ],
      "documentation_paths": [],
      "verification_ids": [],
      "id": "T003",
      "title": "Закрепить финальную документационную задачу в commit/recovery",
      "why": "Финальная проверка документации должна быть выполнима даже без искусственных правок файлов и должна предшествовать пользовательской приёмке.",
      "acceptance_criteria": [
        "DOCS-задача может подтвердить проверку без бессмысленного редактирования документа; recovery в NONE говорит об обсуждении следующего этапа, а READY_FOR_ACCEPTANCE остаётся пользовательским gate."
      ],
      "expected_commit_message": "feat(workflow): завершать scope через документацию",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "workflow-project-continuity-021",
        "task_id": "T003",
        "role": "implementation"
      },
      "documentation_exception": "Поведение финальной DOCS-задачи уже согласовано и описано в T001 в docs/modules/workflow-kit-recovery.md; T003 реализует этот контракт в транзакции и recovery без нового изменения specification."
    },
    {
      "dependencies": [
        "T003"
      ],
      "functional_paths": [
        ".harness/kit/lib/common.mjs",
        ".harness/kit/lib/installer.mjs",
        ".harness/kit/lib/installation-files.mjs",
        "resources/workflow-kit/lib/common.mjs",
        "resources/workflow-kit/lib/installer.mjs",
        "resources/workflow-kit/lib/installation-files.mjs",
        "resources/workspace-setup-worker.mjs"
      ],
      "documentation_paths": [],
      "verification_ids": [],
      "id": "T004",
      "title": "Обновить Workflow Kit и миграцию",
      "why": "Новый контракт должен поставляться новым и существующим workspace, а не только текущему репозиторию.",
      "acceptance_criteria": [
        "Версия Workflow Kit повышена; 1.2.0 поддерживается как безопасный источник upgrade; fresh install создаёт универсальные overview/module/index документы и NONE plan с постоянной навигацией."
      ],
      "expected_commit_message": "feat(workflow): выпустить kit continuity",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "workflow-project-continuity-021",
        "task_id": "T004",
        "role": "implementation"
      },
      "documentation_exception": "Контракт поставки и миграции Workflow Kit 1.3 следует согласованному Project Continuity Contract; пользовательская документация будет обновлена отдельными T005 и DOCS."
    },
    {
      "dependencies": [
        "T004"
      ],
      "functional_paths": [],
      "documentation_paths": [
        ".harness/kit/WORKFLOW.md",
        "resources/workflow-kit/WORKFLOW.md",
        ".harness/kit/templates/PLAN.md",
        "resources/workflow-kit/templates/PLAN.md",
        ".harness/kit/templates/AGENTS.md",
        "resources/workflow-kit/templates/AGENTS.md",
        ".harness/plans/todo-plan.template.md",
        "AGENTS.md"
      ],
      "verification_ids": [],
      "id": "T005",
      "title": "Обновить шаблоны и инструкции",
      "why": "Обязательные правила должны быть видны агенту и присутствовать в каждом новом проекте.",
      "acceptance_criteria": [
        "Шаблон содержит OVERVIEW, MODULES и DOCUMENTATION_INDEX, показывает обязательную DOCS-задачу и отдельную пользовательскую приёмку; инструкции не ограничивают Workflow Kit программными продуктами."
      ],
      "expected_commit_message": "docs(workflow): обновить обязательный шаблон",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "workflow-project-continuity-021",
        "task_id": "T005",
        "role": "implementation"
      }
    },
    {
      "dependencies": [
        "T005"
      ],
      "functional_paths": [
        "tests/workflow-kit-recovery.test.mjs",
        "tests/workflow-kit-source.test.mjs",
        "tests/workspace-setup.test.mjs"
      ],
      "documentation_paths": [],
      "verification_ids": [
        "suite"
      ],
      "id": "T006",
      "title": "Усилить регрессии и синхронизацию bundled Kit",
      "why": "Автоматические проверки должны ловить возврат пустого NONE-плана, отсутствие DOCS-задачи и расхождение установленного и поставляемого Kit.",
      "acceptance_criteria": [
        "Тесты проверяют archive→NONE context, автоматическую финальную задачу, gate READY_FOR_ACCEPTANCE, fresh/upgrade contract и точное совпадение bundled/installed Kit."
      ],
      "expected_commit_message": "test(workflow): закрепить continuity contract",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "workflow-project-continuity-021",
        "task_id": "T006",
        "role": "implementation"
      },
      "documentation_exception": "T006 закрепляет уже согласованный continuity contract регрессионными тестами; итоговые результаты полной проверки и релиза будут внесены в docs/VERIFICATION.md обязательной финальной задачей DOCS."
    },
    {
      "dependencies": [
        "T006"
      ],
      "functional_paths": [
        "package.json",
        "package-lock.json"
      ],
      "documentation_paths": [],
      "verification_ids": [
        "suite",
        "electron-smoke"
      ],
      "id": "T007",
      "title": "Подготовить релиз Project Web Pilot",
      "why": "Изменённый Workflow Kit должен войти в новую однозначно идентифицируемую сборку macOS и Windows.",
      "acceptance_criteria": [
        "Версия приложения увеличена; полная suite и Electron smoke проходят перед сборкой; build создаёт macOS arm64 и Windows x64 с новым bundled Workflow Kit."
      ],
      "expected_commit_message": "build: подготовить релиз continuity workflow",
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "workflow-project-continuity-021",
        "task_id": "T007",
        "role": "implementation"
      },
      "documentation_exception": "T007 меняет только release version/package metadata; архитектурный контракт не изменяется, итоговая версия и результаты сборки фиксируются обязательной задачей DOCS."
    },
    {
      "dependencies": [
        "T001",
        "T002",
        "T003",
        "T004",
        "T005",
        "T006",
        "T007"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/DOCUMENTATION_INDEX.md",
        "docs/architecture/OVERVIEW.md",
        "docs/MODULES.md",
        "docs/WORKFLOW_START.md",
        "docs/PRODUCT.md",
        "docs/VERIFICATION.md",
        "docs/modules/workflow-kit-recovery.md"
      ],
      "verification_ids": [],
      "id": "DOCS",
      "title": "Актуализация всех документов проекта",
      "why": "После выполнения scope проверить весь актуальный комплект документации по индексу и устранить устаревшие сведения до предъявления результата пользователю.",
      "acceptance_criteria": [
        "Все документы из docs/DOCUMENTATION_INDEX.md проверены на соответствие фактическому результату; устаревшие сведения исправлены, индекс и ссылки актуальны; после этого scope может быть только предъявлен пользователю на приёмку."
      ],
      "expected_commit_message": "docs: актуализировать документацию проекта",
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "workflow-project-continuity-021",
        "task_id": "DOCS",
        "role": "implementation"
      }
    }
  ],
  "blocked_reason": null,
  "user_decisions": [
    {
      "id": "a0b4e136-d0db-4a21-b7b9-06efc1f1eab7",
      "text": "Пользователь согласовал отдельный scope: обязательные ссылки на архитектурные документы и индекс, финальная актуализация всей документации, затем пользовательская приёмка; после archive новый NONE ToDo-plan сохраняет навигацию проекта.",
      "recorded_at": "2026-09-15T16:54:33.036Z"
    }
  ]
}
```
<!-- workflow-state:end -->

## Состояние

Execution Scope Status: ACTIVE
Delivery Status: IN_PROGRESS
Scope: workflow-project-continuity-021
Current Task: нет
Revision: 446

## Цель

Сделать Workflow Kit универсальным для проектов любого типа: сохранять постоянный проектный контекст в NONE, автоматически добавлять обязательную финальную актуализацию документации и только после неё переводить результат к пользовательской приёмке.

## Критерии приёмки

- После archive новый NONE ToDo-plan содержит обязательные ссылки на docs/architecture/OVERVIEW.md, docs/MODULES.md и docs/DOCUMENTATION_INDEX.md и приглашает обсудить следующий этап проекта.
- Новый рабочий scope автоматически содержит последнюю микрозадачу «Актуализация всех документов проекта», которая зависит от всех остальных задач.
- READY_FOR_ACCEPTANCE появляется только после завершения финальной актуализации документации; пользовательская приёмка остаётся отдельным последующим gate и не закрывается агентом.
- Workflow и шаблоны описывают проекты общего типа, а для программных проектов сохраняют модульные спецификации и фасады как профильную специализацию.
- Bundled Workflow Kit обновлён и новый релиз Project Web Pilot проходит автоматические проверки и сборку macOS/Windows.

## Микрозадачи

- [DONE] T001: Зафиксировать универсальный контракт continuity — Завершено
  - Git Commit: [DONE] docs: согласовать continuity проектов
  - Reference: workflow-project-continuity-021 / T001 / implementation
  - Файлы: docs/modules/workflow-kit-recovery.md, docs/architecture/OVERVIEW.md, docs/MODULES.md
- [DONE] T002: Реализовать постоянный NONE-контекст и completion contract — Завершено
  - Git Commit: [DONE] feat(workflow): закрепить project continuity
  - Reference: workflow-project-continuity-021 / T002 / implementation
  - Файлы: .harness/kit/lib/plan.mjs, .harness/kit/lib/actions.mjs, resources/workflow-kit/lib/plan.mjs, resources/workflow-kit/lib/actions.mjs, tests/workflow-kit-recovery.test.mjs
- [DONE] T003: Закрепить финальную документационную задачу в commit/recovery — Завершено
  - Git Commit: [DONE] feat(workflow): завершать scope через документацию
  - Reference: workflow-project-continuity-021 / T003 / implementation
  - Файлы: .harness/kit/lib/transaction.mjs, .harness/kit/lib/git-hooks.mjs, .harness/kit/lib/recovery.mjs, resources/workflow-kit/lib/transaction.mjs, resources/workflow-kit/lib/git-hooks.mjs, resources/workflow-kit/lib/recovery.mjs
- [DONE] T004: Обновить Workflow Kit и миграцию — Завершено
  - Git Commit: [DONE] feat(workflow): выпустить kit continuity
  - Reference: workflow-project-continuity-021 / T004 / implementation
  - Файлы: .harness/kit/lib/common.mjs, .harness/kit/lib/installer.mjs, .harness/kit/lib/installation-files.mjs, resources/workflow-kit/lib/common.mjs, resources/workflow-kit/lib/installer.mjs, resources/workflow-kit/lib/installation-files.mjs, resources/workspace-setup-worker.mjs
- [DONE] T005: Обновить шаблоны и инструкции — Завершено
  - Git Commit: [DONE] docs(workflow): обновить обязательный шаблон
  - Reference: workflow-project-continuity-021 / T005 / implementation
  - Файлы: .harness/kit/WORKFLOW.md, resources/workflow-kit/WORKFLOW.md, .harness/kit/templates/PLAN.md, resources/workflow-kit/templates/PLAN.md, .harness/kit/templates/AGENTS.md, resources/workflow-kit/templates/AGENTS.md, .harness/plans/todo-plan.template.md, AGENTS.md
- [DONE] T006: Усилить регрессии и синхронизацию bundled Kit — Завершено
  - Git Commit: [DONE] test(workflow): закрепить continuity contract
  - Reference: workflow-project-continuity-021 / T006 / implementation
  - Файлы: tests/workflow-kit-recovery.test.mjs, tests/workflow-kit-source.test.mjs, tests/workspace-setup.test.mjs
- [TODO] T007: Подготовить релиз Project Web Pilot — Ожидает
  - Git Commit: [PENDING] build: подготовить релиз continuity workflow
  - Reference: workflow-project-continuity-021 / T007 / implementation
  - Файлы: package.json, package-lock.json
- [TODO] DOCS: Актуализация всех документов проекта — Ожидает
  - Git Commit: [PENDING] docs: актуализировать документацию проекта
  - Reference: workflow-project-continuity-021 / DOCS / implementation
  - Файлы: docs/DOCUMENTATION_INDEX.md, docs/architecture/OVERVIEW.md, docs/MODULES.md, docs/WORKFLOW_START.md, docs/PRODUCT.md, docs/VERIFICATION.md, docs/modules/workflow-kit-recovery.md

## Context Pack For This Cycle

- docs/architecture/OVERVIEW.md → Краткая архитектура проекта
- docs/MODULES.md → Модули проекта
- docs/DOCUMENTATION_INDEX.md → Каталог документации
- docs/modules/workflow-kit-recovery.md → Module Specification — Workflow Kit / Context Recovery

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
