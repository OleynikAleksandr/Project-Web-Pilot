# Активный план — Project Web Pilot

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 474,
  "project_id": "cf944136-d1fc-4bd5-9ea0-e46d1fe230e7",
  "project_name": "Project Web Pilot",
  "scope_id": "workflow-project-continuity-021",
  "execution_scope_status": "ACTIVE",
  "delivery_status": "READY_FOR_ACCEPTANCE",
  "objective": "Сделать Workflow Kit универсальным для проектов любого типа: сохранять постоянный проектный контекст в NONE, автоматически добавлять обязательную финальную актуализацию документации и только после неё переводить результат к пользовательской приёмке. Добавить автономный Доктор проекта в Settings и на экран ошибки; выпустить 0.6.20, оставив текущий рассогласованный manifest для пользовательского теста.",
  "acceptance_criteria": [
    "После archive новый NONE ToDo-plan содержит обязательные ссылки на docs/architecture/OVERVIEW.md, docs/MODULES.md и docs/DOCUMENTATION_INDEX.md и приглашает обсудить следующий этап проекта.",
    "Новый рабочий scope автоматически содержит последнюю микрозадачу «Актуализация всех документов проекта», которая зависит от всех остальных задач.",
    "READY_FOR_ACCEPTANCE появляется только после завершения финальной актуализации документации; пользовательская приёмка остаётся отдельным последующим gate и не закрывается агентом.",
    "Workflow и шаблоны описывают проекты общего типа, а для программных проектов сохраняют модульные спецификации и фасады как профильную специализацию.",
    "Bundled Workflow Kit обновлён и новый релиз Project Web Pilot проходит автоматические проверки и сборку macOS/Windows.",
    "Доктор автоматически чинит известные ошибки с резервной копией и повторной проверкой, неизвестные изменения не затирает. Реальный дефект до пользовательского запуска сохраняется."
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
      "tests/workspace-setup.test.mjs",
      "tests/electron-smoke.mjs",
      "resources/project-doctor/core.mjs",
      "resources/project-doctor/files.mjs",
      "resources/project-doctor-worker.mjs",
      "tests/project-doctor.test.mjs",
      "src/project-doctor.mjs",
      "src/main.mjs",
      "src/preload.cjs",
      "src/ui/project-doctor.mjs",
      "src/ui/sidebar.mjs",
      "src/ui/project-archive.mjs",
      "src/ui/workspace-setup.mjs",
      "src/ui/index.html",
      "src/ui/progress.mjs",
      "tests/project-doctor-ui.test.mjs"
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
      "docs/VERIFICATION.md",
      ".harness/kit/templates/ARCHITECTURE.md",
      "resources/workflow-kit/templates/ARCHITECTURE.md",
      ".harness/kit/templates/PRODUCT.md",
      "resources/workflow-kit/templates/PRODUCT.md",
      ".harness/kit/templates/START.md",
      "resources/workflow-kit/templates/START.md",
      "README.md",
      "docs/architecture/ARCHITECTURE.md",
      "docs/DECISIONS.md",
      "docs/CONTEXT_DELIVERY.md",
      "docs/modules/runtime-lifecycle.md",
      "docs/modules/workspace-sessions.md",
      "docs/SOURCE_WORKSPACES.md",
      "docs/TRANSFER_TO_WINDOWS.md",
      "docs/WORKSPACE_SETUP.md",
      "docs/PROJECT_ARCHIVE.md",
      "docs/modules/project-doctor.md"
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
        "package-lock.json",
        "tests/electron-smoke.mjs"
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
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "workflow-project-continuity-021",
        "task_id": "T007",
        "role": "implementation"
      },
      "documentation_exception": "T007 меняет только release version/package metadata; архитектурный контракт не изменяется, итоговая версия и результаты сборки фиксируются обязательной задачей DOCS."
    },
    {
      "dependencies": [
        "T007"
      ],
      "functional_paths": [
        ".harness/kit/lib/recovery.mjs",
        "resources/workflow-kit/lib/recovery.mjs",
        "tests/workflow-kit-recovery.test.mjs"
      ],
      "documentation_paths": [],
      "verification_ids": [
        "suite"
      ],
      "id": "T008",
      "title": "Не включать ordering dependencies DOCS в recovery",
      "why": "DOCS зависит от всех предыдущих задач для порядка выполнения, но recovery не должен автоматически вкладывать diff всех этих коммитов.",
      "acceptance_criteria": [
        "Recovery для DOCS включает project navigation/specification, но не dependency commit diffs только из-за ordering dependencies; обычные задачи сохраняют прямые dependency diffs."
      ],
      "expected_commit_message": "fix(workflow): ограничить recovery финальной документации",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "workflow-project-continuity-021",
        "task_id": "T008",
        "role": "implementation"
      },
      "documentation_exception": "T008 исправляет выявленную интеграционную ошибку уже согласованного Project Continuity Contract; итоговая документация обновляется обязательной DOCS."
    },
    {
      "id": "T009",
      "title": "Зафиксировать контракт Доктора проекта",
      "why": "Реализовать согласованный механизм самостоятельного восстановления без изменения реального дефекта до пользовательского теста.",
      "dependencies": [
        "T008"
      ],
      "functional_paths": [],
      "documentation_paths": [
        ".harness/kit/templates/ARCHITECTURE.md",
        ".harness/kit/templates/PRODUCT.md",
        ".harness/kit/templates/START.md",
        "resources/workflow-kit/templates/ARCHITECTURE.md",
        "resources/workflow-kit/templates/PRODUCT.md",
        "resources/workflow-kit/templates/START.md",
        "README.md",
        "docs/DOCUMENTATION_INDEX.md",
        "docs/WORKFLOW_START.md",
        "docs/MODULES.md",
        "docs/modules/project-doctor.md"
      ],
      "verification_ids": [],
      "acceptance_criteria": [
        "Контракт Доктора выполнен; текущий manifest реального проекта сохранён без изменений; проверки проходят на fixtures."
      ],
      "expected_commit_message": "feat(doctor): Зафиксировать контракт Доктора проекта",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "workflow-project-continuity-021",
        "task_id": "T009",
        "role": "implementation"
      }
    },
    {
      "id": "T010",
      "title": "Реализовать безопасный ремонт проекта",
      "why": "Реализовать согласованный механизм самостоятельного восстановления без изменения реального дефекта до пользовательского теста.",
      "dependencies": [
        "T009"
      ],
      "functional_paths": [
        "resources/project-doctor/core.mjs",
        "resources/project-doctor/files.mjs",
        "resources/project-doctor-worker.mjs",
        "tests/project-doctor.test.mjs"
      ],
      "documentation_paths": [
        "docs/modules/project-doctor.md",
        "docs/VERIFICATION.md",
        "docs/architecture/ARCHITECTURE.md"
      ],
      "verification_ids": [
        "syntax",
        "suite"
      ],
      "acceptance_criteria": [
        "Контракт Доктора выполнен; текущий manifest реального проекта сохранён без изменений; проверки проходят на fixtures."
      ],
      "expected_commit_message": "feat(doctor): Реализовать безопасный ремонт проекта",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "workflow-project-continuity-021",
        "task_id": "T010",
        "role": "implementation"
      },
      "file_limit_exception": "Единый атомарный контракт безопасности и его проверка требуют согласованного изменения перечисленных файлов."
    },
    {
      "id": "T011",
      "title": "Подключить Доктор к настройкам и экрану ошибки",
      "why": "Реализовать согласованный механизм самостоятельного восстановления без изменения реального дефекта до пользовательского теста.",
      "dependencies": [
        "T010"
      ],
      "functional_paths": [
        "src/project-doctor.mjs",
        "src/main.mjs",
        "src/preload.cjs",
        "src/ui/project-doctor.mjs",
        "src/ui/sidebar.mjs",
        "src/ui/project-archive.mjs",
        "src/ui/workspace-setup.mjs",
        "src/ui/index.html",
        "src/ui/progress.mjs",
        "tests/project-doctor-ui.test.mjs",
        "resources/project-doctor/core.mjs"
      ],
      "documentation_paths": [
        "docs/modules/project-doctor.md",
        "docs/VERIFICATION.md",
        "docs/architecture/ARCHITECTURE.md"
      ],
      "verification_ids": [
        "syntax",
        "suite"
      ],
      "acceptance_criteria": [
        "Контракт Доктора выполнен; текущий manifest реального проекта сохранён без изменений; проверки проходят на fixtures."
      ],
      "expected_commit_message": "feat(doctor): Подключить Доктор к настройкам и экрану ошибки",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "workflow-project-continuity-021",
        "task_id": "T011",
        "role": "implementation"
      },
      "file_limit_exception": "Единый атомарный контракт безопасности и его проверка требуют согласованного изменения перечисленных файлов."
    },
    {
      "id": "T012",
      "title": "Проверить интерфейс и собрать новый релиз",
      "why": "Реализовать согласованный механизм самостоятельного восстановления без изменения реального дефекта до пользовательского теста.",
      "dependencies": [
        "T011"
      ],
      "functional_paths": [
        "package.json",
        "package-lock.json",
        "tests/electron-smoke.mjs",
        "src/project-doctor.mjs",
        "src/main.mjs",
        "src/preload.cjs",
        "src/ui/project-doctor.mjs",
        "src/ui/sidebar.mjs",
        "src/ui/project-archive.mjs",
        "src/ui/workspace-setup.mjs",
        "src/ui/index.html",
        "src/ui/progress.mjs",
        "tests/project-doctor-ui.test.mjs",
        "resources/project-doctor/core.mjs",
        "tests/project-doctor.test.mjs"
      ],
      "documentation_paths": [
        "docs/VERIFICATION.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/modules/project-doctor.md"
      ],
      "verification_ids": [
        "syntax",
        "suite",
        "electron-smoke"
      ],
      "acceptance_criteria": [
        "Контракт Доктора выполнен; текущий manifest реального проекта сохранён без изменений; проверки проходят на fixtures."
      ],
      "expected_commit_message": "feat(doctor): Проверить интерфейс и собрать новый релиз",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "workflow-project-continuity-021",
        "task_id": "T012",
        "role": "implementation"
      },
      "file_limit_exception": "Интеграционные smoke-проверки и выпуск охватывают связанный UI/IPC/координатор; исправления найденных проверкой дефектов входят в тот же контракт."
    },
    {
      "dependencies": [
        "T001",
        "T002",
        "T003",
        "T004",
        "T005",
        "T006",
        "T007",
        "T008",
        "T009",
        "T010",
        "T011",
        "T012"
      ],
      "functional_paths": [],
      "documentation_paths": [
        ".harness/kit/WORKFLOW.md",
        "resources/workflow-kit/WORKFLOW.md",
        ".harness/kit/templates/AGENTS.md",
        "resources/workflow-kit/templates/AGENTS.md",
        ".harness/kit/templates/ARCHITECTURE.md",
        "resources/workflow-kit/templates/ARCHITECTURE.md",
        ".harness/kit/templates/PLAN.md",
        "resources/workflow-kit/templates/PLAN.md",
        ".harness/kit/templates/PRODUCT.md",
        "resources/workflow-kit/templates/PRODUCT.md",
        ".harness/kit/templates/START.md",
        "resources/workflow-kit/templates/START.md",
        ".harness/plans/todo-plan.template.md",
        "AGENTS.md",
        "README.md",
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
        "docs/modules/runtime-lifecycle.md",
        "docs/modules/workspace-sessions.md",
        "docs/modules/project-doctor.md"
      ],
      "verification_ids": [],
      "id": "DOCS",
      "title": "Актуализация всех документов проекта",
      "why": "После выполнения scope проверить весь актуальный комплект документации по индексу и устранить устаревшие сведения до предъявления результата пользователю.",
      "acceptance_criteria": [
        "Все документы из docs/DOCUMENTATION_INDEX.md проверены на соответствие фактическому результату; устаревшие сведения исправлены, индекс и ссылки актуальны; после этого scope может быть только предъявлен пользователю на приёмку."
      ],
      "expected_commit_message": "docs: актуализировать документацию проекта",
      "implementation_status": "DONE",
      "commit_status": "DONE",
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
    },
    {
      "id": "c09656cf-c9ae-463b-9cda-69cebb26a43a",
      "recorded_at": "2026-09-16T07:06:52.986Z",
      "text": "16.09.2026 пользователь поручил реализовать Доктор проекта и собрать релиз, сохранив текущую неисправность для самостоятельного теста. Незавершённая DOCS отложена до конца расширенного этапа через валидированный API Workflow Kit; прежние изменения сохранены."
    },
    {
      "id": "74cfb350-fef2-4046-8278-66bcbe3bccdb",
      "recorded_at": "2026-09-16T07:20:54.727Z",
      "text": "Для расширенного smoke Доктора прежний предел 60 секунд недостаточен. Незавершённая T012 отложена с сохранением работы для штатного config:apply timeout 120 секунд; проверки не отключаются."
    }
  ],
  "owner_session_id": "web-pilot-746535b5-543f-4216-9311-6050fb08a5d6",
  "ownership_evidence": {
    "reason": "Уникальная связь из сохранённого доставленного recovery packet этой сессии.",
    "recorded_at": "2026-09-17T09:32:38.019Z"
  }
}
```
<!-- workflow-state:end -->

## Состояние

Execution Scope Status: ACTIVE
Delivery Status: READY_FOR_ACCEPTANCE
Scope: workflow-project-continuity-021
Current Task: нет
Revision: 474

## Цель

Сделать Workflow Kit универсальным для проектов любого типа: сохранять постоянный проектный контекст в NONE, автоматически добавлять обязательную финальную актуализацию документации и только после неё переводить результат к пользовательской приёмке. Добавить автономный Доктор проекта в Settings и на экран ошибки; выпустить 0.6.20, оставив текущий рассогласованный manifest для пользовательского теста.

## Критерии приёмки

- После archive новый NONE ToDo-plan содержит обязательные ссылки на docs/architecture/OVERVIEW.md, docs/MODULES.md и docs/DOCUMENTATION_INDEX.md и приглашает обсудить следующий этап проекта.
- Новый рабочий scope автоматически содержит последнюю микрозадачу «Актуализация всех документов проекта», которая зависит от всех остальных задач.
- READY_FOR_ACCEPTANCE появляется только после завершения финальной актуализации документации; пользовательская приёмка остаётся отдельным последующим gate и не закрывается агентом.
- Workflow и шаблоны описывают проекты общего типа, а для программных проектов сохраняют модульные спецификации и фасады как профильную специализацию.
- Bundled Workflow Kit обновлён и новый релиз Project Web Pilot проходит автоматические проверки и сборку macOS/Windows.
- Доктор автоматически чинит известные ошибки с резервной копией и повторной проверкой, неизвестные изменения не затирает. Реальный дефект до пользовательского запуска сохраняется.

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
- [DONE] T007: Подготовить релиз Project Web Pilot — Завершено
  - Git Commit: [DONE] build: подготовить релиз continuity workflow
  - Reference: workflow-project-continuity-021 / T007 / implementation
  - Файлы: package.json, package-lock.json, tests/electron-smoke.mjs
- [DONE] T008: Не включать ordering dependencies DOCS в recovery — Завершено
  - Git Commit: [DONE] fix(workflow): ограничить recovery финальной документации
  - Reference: workflow-project-continuity-021 / T008 / implementation
  - Файлы: .harness/kit/lib/recovery.mjs, resources/workflow-kit/lib/recovery.mjs, tests/workflow-kit-recovery.test.mjs
- [DONE] T009: Зафиксировать контракт Доктора проекта — Завершено
  - Git Commit: [DONE] feat(doctor): Зафиксировать контракт Доктора проекта
  - Reference: workflow-project-continuity-021 / T009 / implementation
  - Файлы: .harness/kit/templates/ARCHITECTURE.md, .harness/kit/templates/PRODUCT.md, .harness/kit/templates/START.md, resources/workflow-kit/templates/ARCHITECTURE.md, resources/workflow-kit/templates/PRODUCT.md, resources/workflow-kit/templates/START.md, README.md, docs/DOCUMENTATION_INDEX.md, docs/WORKFLOW_START.md, docs/MODULES.md, docs/modules/project-doctor.md
- [DONE] T010: Реализовать безопасный ремонт проекта — Завершено
  - Git Commit: [DONE] feat(doctor): Реализовать безопасный ремонт проекта
  - Reference: workflow-project-continuity-021 / T010 / implementation
  - Файлы: resources/project-doctor/core.mjs, resources/project-doctor/files.mjs, resources/project-doctor-worker.mjs, tests/project-doctor.test.mjs, docs/modules/project-doctor.md, docs/VERIFICATION.md, docs/architecture/ARCHITECTURE.md
- [DONE] T011: Подключить Доктор к настройкам и экрану ошибки — Завершено
  - Git Commit: [DONE] feat(doctor): Подключить Доктор к настройкам и экрану ошибки
  - Reference: workflow-project-continuity-021 / T011 / implementation
  - Файлы: src/project-doctor.mjs, src/main.mjs, src/preload.cjs, src/ui/project-doctor.mjs, src/ui/sidebar.mjs, src/ui/project-archive.mjs, src/ui/workspace-setup.mjs, src/ui/index.html, src/ui/progress.mjs, tests/project-doctor-ui.test.mjs, resources/project-doctor/core.mjs, docs/modules/project-doctor.md, docs/VERIFICATION.md, docs/architecture/ARCHITECTURE.md
- [DONE] T012: Проверить интерфейс и собрать новый релиз — Завершено
  - Git Commit: [DONE] feat(doctor): Проверить интерфейс и собрать новый релиз
  - Reference: workflow-project-continuity-021 / T012 / implementation
  - Файлы: package.json, package-lock.json, tests/electron-smoke.mjs, src/project-doctor.mjs, src/main.mjs, src/preload.cjs, src/ui/project-doctor.mjs, src/ui/sidebar.mjs, src/ui/project-archive.mjs, src/ui/workspace-setup.mjs, src/ui/index.html, src/ui/progress.mjs, tests/project-doctor-ui.test.mjs, resources/project-doctor/core.mjs, tests/project-doctor.test.mjs, docs/VERIFICATION.md, docs/architecture/ARCHITECTURE.md, docs/modules/project-doctor.md
- [DONE] DOCS: Актуализация всех документов проекта — Завершено
  - Git Commit: [DONE] docs: актуализировать документацию проекта
  - Reference: workflow-project-continuity-021 / DOCS / implementation
  - Файлы: .harness/kit/WORKFLOW.md, resources/workflow-kit/WORKFLOW.md, .harness/kit/templates/AGENTS.md, resources/workflow-kit/templates/AGENTS.md, .harness/kit/templates/ARCHITECTURE.md, resources/workflow-kit/templates/ARCHITECTURE.md, .harness/kit/templates/PLAN.md, resources/workflow-kit/templates/PLAN.md, .harness/kit/templates/PRODUCT.md, resources/workflow-kit/templates/PRODUCT.md, .harness/kit/templates/START.md, resources/workflow-kit/templates/START.md, .harness/plans/todo-plan.template.md, AGENTS.md, README.md, docs/DOCUMENTATION_INDEX.md, docs/architecture/OVERVIEW.md, docs/architecture/ARCHITECTURE.md, docs/MODULES.md, docs/WORKFLOW_START.md, docs/PRODUCT.md, docs/DECISIONS.md, docs/CONTEXT_DELIVERY.md, docs/VERIFICATION.md, docs/TRANSFER_TO_WINDOWS.md, docs/WORKSPACE_SETUP.md, docs/PROJECT_ARCHIVE.md, docs/SOURCE_WORKSPACES.md, docs/modules/workflow-kit-recovery.md, docs/modules/runtime-lifecycle.md, docs/modules/workspace-sessions.md, docs/modules/project-doctor.md

## Context Pack For This Cycle

- docs/architecture/OVERVIEW.md → Краткая архитектура проекта
- docs/MODULES.md → Модули проекта
- docs/DOCUMENTATION_INDEX.md → Каталог документации
- docs/modules/workflow-kit-recovery.md → Module Specification — Workflow Kit / Context Recovery
- docs/modules/project-doctor.md → Module Specification — Project Doctor

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
