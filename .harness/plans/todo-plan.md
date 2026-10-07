# Активный план — Project Web Pilot

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 1382,
  "project_id": "cf944136-d1fc-4bd5-9ea0-e46d1fe230e7",
  "project_name": "Project Web Pilot",
  "scope_id": "recovery-on-demand-research-20261006",
  "execution_scope_status": "ACTIVE",
  "delivery_status": "IN_PROGRESS",
  "objective": "Рефакторинг Workflow Kit: компактные документы до 28000 байт, recovery по плану и Git, доставка частями-вложениями; парный выпуск перед согласованной миграцией проекта вне плана.",
  "acceptance_criteria": [
    "Принятые правила С1–С15 и П1–П13 реализованы по двум частям спецификации; документы актуализируются перед выпуском, история доступна в Git.",
    "Recovery и Web Pilot передают полный выбранный контекст без дублей/усечения одинаково на macOS и Windows; предел 28000 байт конфигурируемый, превышение изменённого документа блокирует commit.",
    "Парный выпуск проверен и опубликован; переход старый Kit → новый Kit сохраняет план. После T007 остановка на READY_FOR_ACCEPTANCE; независимое ревью и миграция Claude вне плана до перезапуска, закрытие только по команде пользователя."
  ],
  "approved_scope": {
    "functional_paths": [
      "packages/workflow-kit/src/lib/actions.mjs",
      "packages/workflow-kit/src/lib/plan.mjs",
      "packages/workflow-kit/src/lib/validate.mjs",
      "packages/workflow-kit/src/lib/git-hooks.mjs",
      "packages/workflow-kit/src/lib/transaction.mjs",
      "packages/workflow-kit/src/lib/simple-workflow.mjs",
      "packages/workflow-kit/src/lib/extend-plan.mjs",
      "packages/workflow-kit/src/lib/session-plans.mjs",
      "packages/workflow-kit/src/lib/installer.mjs",
      "packages/workflow-kit/src/lib/task-update.mjs",
      "packages/workflow-kit/src/lib/task-files.mjs",
      "packages/workflow-kit/src/lib/command-help.mjs",
      "packages/workflow-kit/src/cli.mjs",
      "packages/workflow-kit/src/schemas/plan.schema.json",
      "packages/workflow-kit/scripts/check-runtime-fixture.mjs",
      "packages/workflow-kit/scripts/check-carryover-fixture.mjs",
      "tests/project-doctor.test.mjs",
      "tests/release-all.test.mjs",
      "tests/session-opening-performance.test.mjs",
      "tests/session-plans.test.mjs",
      "tests/workflow-kit-recovery.test.mjs",
      "tests/workflow-kit-source.test.mjs",
      "tests/workspace-setup.test.mjs",
      "packages/workflow-kit/src/lib/installation-files.mjs",
      "packages/workflow-kit/src/lib/inspection-inputs.mjs",
      "packages/workflow-kit/src/schemas/workflow.schema.json",
      "resources/workspace-setup-worker.mjs",
      "packages/workflow-kit/src/lib/recovery.mjs",
      "packages/workflow-kit/src/lib/project-facts.mjs",
      "packages/workflow-kit/src/lib/git.mjs",
      "packages/workflow-kit/src/lib/common.mjs",
      "src/context-session.mjs",
      "src/context-cache.mjs",
      "src/session-plans.mjs",
      "src/mcp-runtime.mjs",
      "src/auto-plan.mjs",
      "src/mac-runtime-switch.mjs",
      "src/workspace-setup.mjs",
      "tests/context-session.test.mjs",
      "tests/context-cache.test.mjs",
      "tests/auto-plan.test.mjs",
      "packages/workflow-kit/package.json",
      "package.json",
      "package-lock.json",
      ".harness/workflow.json",
      "src/context-inputs.mjs",
      "src/main.mjs",
      "src/chatgpt-composer.mjs",
      "src/chatgpt-dom.mjs",
      "src/chatgpt-experience.mjs",
      "tests/chatgpt-composer.test.mjs",
      "tests/chatgpt-dom.test.mjs",
      "tests/chatgpt-experience.test.mjs",
      "scripts/check-installed-release.mjs",
      "scripts/check-github-release.mjs",
      "packages/workflow-kit/scripts/check-document-fixture.mjs",
      "resources/project-doctor/core.mjs",
      "scripts/probe-chatgpt-file-paste.mjs",
      "tests/chatgpt-file-paste-probe.test.mjs",
      "packages/workflow-kit/scripts/check-project-recovery-fixture.mjs",
      "tests/electron-smoke.mjs",
      "tests/mcp-runtime.test.mjs",
      "tests/workflow-kit-upgrade.test.mjs"
    ],
    "documentation_paths": [
      "docs/planning/workflow-kit-context-refactor.md",
      "docs/planning/recovery-on-demand-research.md",
      "docs/DOCUMENTATION_INDEX.md",
      "docs/MODULES.md",
      "docs/planning/workflow-kit-context-transition.md",
      "packages/workflow-kit/src/WORKFLOW.md",
      "packages/workflow-kit/src/templates/AGENTS.md",
      "packages/workflow-kit/src/templates/PROTOTYPE.md",
      "packages/workflow-kit/src/templates/SPEC.md",
      "packages/workflow-kit/src/templates/PLAN.md",
      "packages/workflow-kit/src/templates/CONTINUE.md",
      "packages/workflow-kit/src/templates/STAGES.md",
      "packages/workflow-kit/src/templates/PRODUCT.md",
      "packages/workflow-kit/src/templates/ARCHITECTURE.md",
      "packages/workflow-kit/src/templates/START.md",
      "docs/modules/workflow-kit-recovery.md",
      "docs/CONTEXT_DELIVERY.md",
      "docs/WORKSPACE_SETUP.md",
      "docs/modules/chatgpt-dom-compatibility.md",
      "docs/PRODUCT.md",
      "docs/architecture/ARCHITECTURE.md",
      "docs/architecture/OVERVIEW.md",
      "packages/workflow-kit/docs/modules/workflow-kit-package.md",
      "README.md",
      "AGENTS.md",
      "docs/planning/context-as-text.md",
      "packages/workflow-kit/README.md"
    ]
  },
  "baseline_commit": "7bd5f4714fc3be0572dfa8a593804af3fab45d1f",
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
        "path": "docs/planning/workflow-kit-context-transition.md",
        "required": true,
        "revision": "WORKTREE"
      },
      {
        "path": "docs/planning/workflow-kit-context-refactor.md",
        "required": true
      }
    ],
    "include_last_completed_task": false,
    "dependency_task_ids": []
  },
  "tasks": [
    {
      "id": "T001",
      "title": "Зафиксировать исследование и план рефакторинга Workflow Kit",
      "why": "Зафиксировать исследование и план рефакторинга Workflow Kit",
      "dependencies": [],
      "functional_paths": [],
      "documentation_paths": [
        "docs/planning/workflow-kit-context-refactor.md",
        "docs/planning/recovery-on-demand-research.md",
        "docs/DOCUMENTATION_INDEX.md",
        "docs/MODULES.md"
      ],
      "verification_ids": [],
      "verification_kind": "code",
      "acceptance_criteria": [
        "Согласованные правила, восстановление по плану/Git и порядок выпуск → миграция описаны без изменения продуктового кода.",
        "Составлен управляемый to-do; результаты исследования сохранены, ограничения старого Kit учтены."
      ],
      "expected_commit_message": "docs: спланировать рефакторинг документации и recovery",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "recovery-on-demand-research-20261006",
        "task_id": "T001",
        "role": "implementation"
      },
      "actual_files": [
        "docs/DOCUMENTATION_INDEX.md",
        "docs/MODULES.md",
        "docs/planning/recovery-on-demand-research.md",
        "docs/planning/workflow-kit-context-refactor.md"
      ]
    },
    {
      "id": "T001R",
      "title": "Согласовать спецификацию и план по принятому ревью",
      "why": "Устранить противоречия до реализации и сохранить завершённую T001 неизменной.",
      "dependencies": [
        "T001"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/planning/workflow-kit-context-refactor.md",
        "docs/planning/workflow-kit-context-transition.md",
        "docs/planning/recovery-on-demand-research.md",
        "docs/DOCUMENTATION_INDEX.md"
      ],
      "verification_ids": [],
      "verification_kind": "code",
      "acceptance_criteria": [
        "В спецификации отражены С1–С15, П1–П13 и окончательные уточнения пользователя от 06.10.2026; единственный предел 28000 байт UTF-8.",
        "План разделён на T002/T002A, проверки и переход T005 → T006 → T007 согласованы; будущих задач миграции нет; T001 неизменна.",
        "Противоречивый исследовательский документ удалён, навигация актуальна; исходники, установленный Kit, сборка и публикация не изменялись."
      ],
      "expected_commit_message": "docs: согласовать ревью документации и recovery",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "recovery-on-demand-research-20261006",
        "task_id": "T001R",
        "role": "implementation"
      },
      "actual_files": [
        "docs/planning/workflow-kit-context-refactor.md",
        "docs/planning/workflow-kit-context-transition.md",
        "docs/planning/recovery-on-demand-research.md",
        "docs/DOCUMENTATION_INDEX.md"
      ]
    },
    {
      "id": "T001R2",
      "title": "Уточнить пять условий перед реализацией Kit",
      "why": "Устранить ограничения путей и несовместимость переходной конфигурации до начала T002.",
      "dependencies": [
        "T001R"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/planning/workflow-kit-context-refactor.md",
        "docs/planning/workflow-kit-context-transition.md"
      ],
      "verification_ids": [],
      "verification_kind": "code",
      "acceptance_criteria": [
        "В спецификации и задачах отражены пять уточнений: пути docs:commit/защита AGENTS, переходные token-поля, содержание README, семь вложений по 28000 байт, граница проверок T002/T004.",
        "T001 и T001R неизменны; обе части спецификации меньше 28000 байт; конфигурация/runtime/код не изменены, T002 не начата."
      ],
      "expected_commit_message": "docs: уточнить условия реализации и перехода Kit",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "recovery-on-demand-research-20261006",
        "task_id": "T001R2",
        "role": "implementation"
      },
      "actual_files": [
        "docs/planning/workflow-kit-context-refactor.md",
        "docs/planning/workflow-kit-context-transition.md"
      ]
    },
    {
      "id": "T002",
      "title": "Реализовать жизненный цикл планов и документационных коммитов",
      "why": "Позволить обсуждения без фиктивного плана и доработки после выпуска без потери подтверждённых коммитов.",
      "dependencies": [
        "T001R2"
      ],
      "functional_paths": [
        "packages/workflow-kit/src/lib/actions.mjs",
        "packages/workflow-kit/src/lib/plan.mjs",
        "packages/workflow-kit/src/lib/validate.mjs",
        "packages/workflow-kit/src/lib/git-hooks.mjs",
        "packages/workflow-kit/src/lib/transaction.mjs",
        "packages/workflow-kit/src/lib/simple-workflow.mjs",
        "packages/workflow-kit/src/lib/extend-plan.mjs",
        "packages/workflow-kit/src/lib/session-plans.mjs",
        "packages/workflow-kit/src/lib/installer.mjs",
        "packages/workflow-kit/src/lib/task-update.mjs",
        "packages/workflow-kit/src/lib/task-files.mjs",
        "packages/workflow-kit/src/lib/command-help.mjs",
        "packages/workflow-kit/src/cli.mjs",
        "packages/workflow-kit/src/schemas/plan.schema.json",
        "packages/workflow-kit/scripts/check-runtime-fixture.mjs",
        "packages/workflow-kit/scripts/check-carryover-fixture.mjs",
        "tests/project-doctor.test.mjs",
        "tests/release-all.test.mjs",
        "tests/session-opening-performance.test.mjs",
        "tests/session-plans.test.mjs",
        "tests/workflow-kit-recovery.test.mjs",
        "tests/workflow-kit-source.test.mjs",
        "tests/workspace-setup.test.mjs",
        "packages/workflow-kit/src/lib/recovery.mjs"
      ],
      "documentation_paths": [
        "docs/planning/workflow-kit-context-refactor.md",
        "docs/planning/workflow-kit-context-transition.md",
        "packages/workflow-kit/src/WORKFLOW.md",
        "packages/workflow-kit/src/templates/AGENTS.md",
        "packages/workflow-kit/src/templates/PROTOTYPE.md",
        "packages/workflow-kit/src/templates/SPEC.md",
        "packages/workflow-kit/src/templates/PLAN.md",
        "packages/workflow-kit/src/templates/CONTINUE.md",
        "packages/workflow-kit/src/templates/STAGES.md"
      ],
      "verification_ids": [
        "kit-check",
        "unit-all"
      ],
      "verification_kind": "code",
      "acceptance_criteria": [
        "С4/С5/С15: docs:commit в NONE/idle ACTIVE, запрет при IN_PROGRESS; любой .md вне .harness/, включая документацию packages/workflow-kit. Управляемая секция AGENTS.md в index побайтно совпадает с HEAD; меняется только проектная часть. Роль documentation, trailers, схема/состав/размер без suite приложения; DOCS только перед delivery.",
        "Раунды после выполненного delivery добавляют работу без перестановки DONE; before только перед не начатой задачей; прошлые delivery привязаны к прежней итерации DOCS. Проверены раунды с новым выпуском и без, nextTask/delivery_status/pre-push.",
        "Archive/carryover/legacy migration больше не создают архивных копий. install --update удаляет прежние архивы ролью kit-update только если все файлы tracked и совпадают с blob HEAD; при изменённом/untracked файле ошибка до удаления.",
        "Переиспользованы existing references, транзакции и команды; правки сохраняются при ошибке. Служебный коммит между task:start и commit не ломает учёт файлов задачи и её доказательства. Полный переход между версиями проверяется в T004; проверки пакета и корневые тесты проходят."
      ],
      "expected_commit_message": "feat: поддержать раунды и самостоятельные документы в Kit",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "recovery-on-demand-research-20261006",
        "task_id": "T002",
        "role": "implementation"
      },
      "actual_files": [
        "docs/planning/workflow-kit-context-refactor.md",
        "packages/workflow-kit/scripts/check-carryover-fixture.mjs",
        "packages/workflow-kit/scripts/check-runtime-fixture.mjs",
        "packages/workflow-kit/src/WORKFLOW.md",
        "packages/workflow-kit/src/cli.mjs",
        "packages/workflow-kit/src/lib/actions.mjs",
        "packages/workflow-kit/src/lib/command-help.mjs",
        "packages/workflow-kit/src/lib/extend-plan.mjs",
        "packages/workflow-kit/src/lib/git-hooks.mjs",
        "packages/workflow-kit/src/lib/installer.mjs",
        "packages/workflow-kit/src/lib/plan.mjs",
        "packages/workflow-kit/src/lib/recovery.mjs",
        "packages/workflow-kit/src/lib/session-plans.mjs",
        "packages/workflow-kit/src/lib/simple-workflow.mjs",
        "packages/workflow-kit/src/lib/task-files.mjs",
        "packages/workflow-kit/src/lib/transaction.mjs",
        "packages/workflow-kit/src/lib/validate.mjs",
        "packages/workflow-kit/src/schemas/plan.schema.json",
        "packages/workflow-kit/src/templates/AGENTS.md",
        "packages/workflow-kit/src/templates/CONTINUE.md",
        "packages/workflow-kit/src/templates/PLAN.md",
        "tests/workflow-kit-recovery.test.mjs",
        "tests/workspace-setup.test.mjs"
      ]
    },
    {
      "id": "T002A",
      "title": "Реализовать модель документов и общий предел размера",
      "why": "Сделать документы компактными, убрать дубли правил и согласовать установку с новым составом.",
      "dependencies": [
        "T002"
      ],
      "functional_paths": [
        "packages/workflow-kit/src/lib/installation-files.mjs",
        "packages/workflow-kit/src/lib/installer.mjs",
        "packages/workflow-kit/src/lib/inspection-inputs.mjs",
        "packages/workflow-kit/src/lib/plan.mjs",
        "packages/workflow-kit/src/lib/validate.mjs",
        "packages/workflow-kit/src/lib/git-hooks.mjs",
        "packages/workflow-kit/src/lib/transaction.mjs",
        "packages/workflow-kit/src/lib/command-help.mjs",
        "packages/workflow-kit/src/schemas/workflow.schema.json",
        "resources/workspace-setup-worker.mjs",
        "packages/workflow-kit/scripts/check-runtime-fixture.mjs",
        "tests/project-doctor.test.mjs",
        "tests/release-all.test.mjs",
        "tests/session-opening-performance.test.mjs",
        "tests/session-plans.test.mjs",
        "tests/workflow-kit-recovery.test.mjs",
        "tests/workflow-kit-source.test.mjs",
        "tests/workspace-setup.test.mjs",
        "packages/workflow-kit/scripts/check-document-fixture.mjs",
        "packages/workflow-kit/src/lib/actions.mjs",
        "packages/workflow-kit/src/lib/recovery.mjs",
        "packages/workflow-kit/src/lib/simple-workflow.mjs",
        "resources/project-doctor/core.mjs"
      ],
      "documentation_paths": [
        "docs/planning/workflow-kit-context-refactor.md",
        "docs/planning/workflow-kit-context-transition.md",
        "packages/workflow-kit/src/WORKFLOW.md",
        "packages/workflow-kit/src/templates/AGENTS.md",
        "packages/workflow-kit/src/templates/PROTOTYPE.md",
        "packages/workflow-kit/src/templates/SPEC.md",
        "packages/workflow-kit/src/templates/PLAN.md",
        "packages/workflow-kit/src/templates/CONTINUE.md",
        "packages/workflow-kit/src/templates/STAGES.md",
        "packages/workflow-kit/src/templates/PRODUCT.md",
        "packages/workflow-kit/src/templates/ARCHITECTURE.md",
        "packages/workflow-kit/src/templates/START.md"
      ],
      "verification_ids": [
        "kit-check",
        "unit-all"
      ],
      "verification_kind": "code",
      "acceptance_criteria": [
        "С1/С3: новые проекты получают минимальный состав; обновление не восстанавливает упразднённые документы; readiness и inspection учитывают старые проекты до миграции. Источники правил разделены по таблице спецификации, Kit-секция AGENTS в ядре не повторяется.",
        "С2: budget.document_bytes по умолчанию 28000 в workflow.json; один предел для документов и частей. validateStaged проверяет index до ролей и тестов для всех изменённых .md, включая файлы Kit; единственное исключение — .harness/plans/todo-plan.md. Новый runtime принимает конфигурацию как с budget.soft_tokens/hard_tokens, так и без них.",
        "Проверены размер ровно 28000/превышение/UTF-8, index отличается от worktree, коммиты задач и служебные операции, нетронутый legacy документ. Ошибка содержит путь/байты/предел/команду повтора, правки сохранены.",
        "Нет прежних символьных нормативов и новых обязательных документов с историей; изменения ядра и состава проверены kit-check и unit-all."
      ],
      "expected_commit_message": "feat: ограничить документы Kit и обновить их модель",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "recovery-on-demand-research-20261006",
        "task_id": "T002A",
        "role": "implementation"
      },
      "actual_files": [
        "packages/workflow-kit/scripts/check-document-fixture.mjs",
        "packages/workflow-kit/scripts/check-runtime-fixture.mjs",
        "packages/workflow-kit/src/WORKFLOW.md",
        "packages/workflow-kit/src/lib/actions.mjs",
        "packages/workflow-kit/src/lib/git-hooks.mjs",
        "packages/workflow-kit/src/lib/inspection-inputs.mjs",
        "packages/workflow-kit/src/lib/installation-files.mjs",
        "packages/workflow-kit/src/lib/installer.mjs",
        "packages/workflow-kit/src/lib/plan.mjs",
        "packages/workflow-kit/src/lib/recovery.mjs",
        "packages/workflow-kit/src/lib/simple-workflow.mjs",
        "packages/workflow-kit/src/lib/transaction.mjs",
        "packages/workflow-kit/src/lib/validate.mjs",
        "packages/workflow-kit/src/schemas/workflow.schema.json",
        "packages/workflow-kit/src/templates/AGENTS.md",
        "packages/workflow-kit/src/templates/ARCHITECTURE.md",
        "packages/workflow-kit/src/templates/CONTINUE.md",
        "packages/workflow-kit/src/templates/PLAN.md",
        "packages/workflow-kit/src/templates/PRODUCT.md",
        "packages/workflow-kit/src/templates/PROTOTYPE.md",
        "packages/workflow-kit/src/templates/SPEC.md",
        "packages/workflow-kit/src/templates/STAGES.md",
        "packages/workflow-kit/src/templates/START.md",
        "resources/project-doctor/core.mjs",
        "resources/workspace-setup-worker.mjs",
        "tests/project-doctor.test.mjs",
        "tests/session-opening-performance.test.mjs",
        "tests/workflow-kit-recovery.test.mjs",
        "tests/workspace-setup.test.mjs"
      ]
    },
    {
      "id": "T003",
      "title": "Реализовать recovery из целых документов и связей с Git",
      "why": "Передавать достаточный контекст без накопленной истории, дублей и скрытого усечения.",
      "dependencies": [
        "T002A"
      ],
      "functional_paths": [
        "packages/workflow-kit/src/lib/recovery.mjs",
        "packages/workflow-kit/src/lib/project-facts.mjs",
        "packages/workflow-kit/src/lib/plan.mjs",
        "packages/workflow-kit/src/lib/git.mjs",
        "packages/workflow-kit/src/lib/actions.mjs",
        "packages/workflow-kit/src/lib/command-help.mjs",
        "packages/workflow-kit/scripts/check-runtime-fixture.mjs",
        "tests/workflow-kit-recovery.test.mjs",
        "packages/workflow-kit/src/lib/inspection-inputs.mjs",
        "packages/workflow-kit/src/lib/transaction.mjs",
        "packages/workflow-kit/src/lib/validate.mjs",
        "packages/workflow-kit/src/lib/common.mjs",
        "packages/workflow-kit/src/schemas/plan.schema.json"
      ],
      "documentation_paths": [
        "docs/planning/workflow-kit-context-refactor.md",
        "docs/planning/workflow-kit-context-transition.md",
        "docs/modules/workflow-kit-recovery.md",
        "docs/CONTEXT_DELIVERY.md"
      ],
      "verification_ids": [
        "kit-check",
        "unit-all"
      ],
      "verification_kind": "code",
      "acceptance_criteria": [
        "С6–С12: ACTIVE содержит ядро, проекцию всех задач (id/title/why/status/dependencies/criteria/SHA/files), рабочую спецификацию и выбранные целые документы; NONE — общие документы, archived_scope_id, SHA закрытия, задачи прошлого плана и ссылки на спецификацию.",
        "Не передаются сырой JSON плана и diff; staged/unstaged/untracked/посторонние изменения перечислены, docs/planning представлен путями/заголовками/байтами. Перед реализацией агент читает нужные коммиты, диффы и код.",
        "revision WORKTREE/SHA, дедупликация (path,revision), required побеждает; heading_path и dependency_task_ids старых планов совместимы без выборки разделов/включения диффов. Удаление required-документа и ссылка на существующий blob before_head атомарны; иначе ошибка.",
        "Единый splitter: заголовки → абзацы → строки → символ UTF-8; каждый документ/проекция задач передаётся полностью, части со служебными заголовками <= budget.document_bytes (28000 default); legacy oversized помечен «разделить при следующей правке».",
        "Сохранены hard_bytes 180000, свежесть, транзакции и приватные пути; удалены псевдотокены bytes/2 и soft_exceeded. Проверены missing WORKTREE/SHA, новый проект, dirty/stale, oversized раздел/задача и повторная правка уже dirty источника."
      ],
      "expected_commit_message": "feat: восстанавливать контекст по плану и Git",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "recovery-on-demand-research-20261006",
        "task_id": "T003",
        "role": "implementation"
      },
      "actual_files": [
        "docs/planning/workflow-kit-context-refactor.md",
        "packages/workflow-kit/scripts/check-runtime-fixture.mjs",
        "packages/workflow-kit/src/lib/command-help.mjs",
        "packages/workflow-kit/src/lib/git.mjs",
        "packages/workflow-kit/src/lib/inspection-inputs.mjs",
        "packages/workflow-kit/src/lib/plan.mjs",
        "packages/workflow-kit/src/lib/project-facts.mjs",
        "packages/workflow-kit/src/lib/recovery.mjs",
        "packages/workflow-kit/src/lib/transaction.mjs",
        "packages/workflow-kit/src/lib/validate.mjs",
        "packages/workflow-kit/src/schemas/plan.schema.json",
        "tests/workflow-kit-recovery.test.mjs"
      ]
    },
    {
      "id": "T004",
      "title": "Согласовать Web Pilot с новым Kit и подготовить проверки выпуска",
      "why": "Доставить агенту полный пакет отдельными вложениями и подготовить совместимый выпуск обеих платформ.",
      "dependencies": [
        "T003"
      ],
      "functional_paths": [
        "src/context-session.mjs",
        "src/context-cache.mjs",
        "src/session-plans.mjs",
        "src/mcp-runtime.mjs",
        "src/auto-plan.mjs",
        "src/mac-runtime-switch.mjs",
        "src/workspace-setup.mjs",
        "tests/context-session.test.mjs",
        "tests/context-cache.test.mjs",
        "tests/session-plans.test.mjs",
        "tests/auto-plan.test.mjs",
        "tests/workflow-kit-source.test.mjs",
        "packages/workflow-kit/package.json",
        "packages/workflow-kit/src/lib/common.mjs",
        "package.json",
        "package-lock.json",
        ".harness/workflow.json",
        "packages/workflow-kit/src/lib/installer.mjs",
        "packages/workflow-kit/src/lib/inspection-inputs.mjs",
        "resources/workspace-setup-worker.mjs",
        "src/context-inputs.mjs",
        "src/main.mjs",
        "src/chatgpt-composer.mjs",
        "src/chatgpt-dom.mjs",
        "src/chatgpt-experience.mjs",
        "tests/chatgpt-composer.test.mjs",
        "tests/chatgpt-dom.test.mjs",
        "tests/chatgpt-experience.test.mjs",
        "tests/workspace-setup.test.mjs",
        "tests/session-opening-performance.test.mjs",
        "scripts/check-installed-release.mjs",
        "scripts/check-github-release.mjs",
        "scripts/probe-chatgpt-file-paste.mjs",
        "tests/chatgpt-file-paste-probe.test.mjs",
        "tests/electron-smoke.mjs",
        "tests/mcp-runtime.test.mjs",
        "tests/workflow-kit-upgrade.test.mjs"
      ],
      "documentation_paths": [
        "docs/planning/workflow-kit-context-refactor.md",
        "docs/planning/workflow-kit-context-transition.md",
        "docs/CONTEXT_DELIVERY.md",
        "docs/WORKSPACE_SETUP.md",
        "docs/modules/chatgpt-dom-compatibility.md"
      ],
      "verification_ids": [
        "kit-check",
        "unit-all",
        "electron-smoke"
      ],
      "verification_kind": "code",
      "acceptance_criteria": [
        "По решению пользователя 07.10.2026 живая проверка File/DataTransfer перенесена на приёмку нового релиза и не блокирует T004. Проверить 7 файлов по 28000 байт в одном сообщении, все загружены до Send; транспортная проба 196000 байт не меняет hard_bytes=180000. До живой приёмки результат не подтверждён; молчаливый fallback к большой текстовой вставке запрещён.",
        "Первое сообщение содержит все части-вложения <=28000 байт и короткий транспортный текст; загрузка завершена до Send, отправка ровно одна, частичный сбой не теряет части и не дублирует сообщение. Чтение вложений разрешено, MCP проекта в первом ответе не вызывается.",
        "Одинаковый сценарий macOS/Windows; AutoPlan и nextTask согласованы с раундами; публичные экспорты Sidebar/pageOperation/pageScript совместимы и проверены при изменении трёх browser-модулей.",
        "Реальный ключ inspectionInputs учитывает новые источники NONE/planning, повторная правка уже dirty документа меняет ключ; тестовый contextInputKey удалён либо синхронизирован.",
        "upgradeFrom включает 1.5.6; fixture start T006 старым Kit → kit-update → commit T006 новым Kit → доступная T007 проходит. До релиза сохранён доступ к старому составу документов.",
        "Подготовлены версии исходников и checks/evidence/stack; config:apply в T004 добавляет budget.document_bytes=28000, сохраняя обязательные для Kit 1.5.6 soft_tokens/hard_tokens до DOCS, T005 и task:start T006. Новый runtime принимает конфигурацию с ними и без; удалять не раньше перехода T006. Kit-check, unit-all и electron-smoke пройдены; сборки/установки реального приложения на T004 нет.",
        "Текст первого сообщения Web Pilot содержит правило: «Читай каждое вложение отдельно одним вызовом, не объединяй вложения в общий вывод, при признаках обрезки дочитай недостающее». Правило закреплено проверкой текста сообщения. Поддерживаемый максимум — 7 вложений; ограничение recovery реализуется отдельной T004A после T004, до DOCS."
      ],
      "expected_commit_message": "feat: подключить новый recovery к Web Pilot",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "recovery-on-demand-research-20261006",
        "task_id": "T004",
        "role": "implementation"
      },
      "actual_files": [
        "docs/planning/workflow-kit-context-refactor.md",
        "docs/planning/workflow-kit-context-transition.md",
        "package-lock.json",
        "package.json",
        "packages/workflow-kit/package.json",
        "packages/workflow-kit/src/lib/common.mjs",
        "packages/workflow-kit/src/lib/installer.mjs",
        "scripts/probe-chatgpt-file-paste.mjs",
        "src/chatgpt-composer.mjs",
        "src/context-cache.mjs",
        "src/context-inputs.mjs",
        "src/context-session.mjs",
        "src/mcp-runtime.mjs",
        "tests/auto-plan.test.mjs",
        "tests/chatgpt-composer.test.mjs",
        "tests/chatgpt-file-paste-probe.test.mjs",
        "tests/context-cache.test.mjs",
        "tests/context-session.test.mjs",
        "tests/electron-smoke.mjs",
        "tests/mcp-runtime.test.mjs",
        "tests/workflow-kit-upgrade.test.mjs",
        "tests/workspace-setup.test.mjs"
      ]
    },
    {
      "id": "T004A",
      "title": "Устранить переполнение recovery и ограничить число частей",
      "why": "Обеспечить восстановление реального проекта после перехода на новый Kit без превышения бюджета и проверенного числа вложений.",
      "dependencies": [
        "T004"
      ],
      "functional_paths": [
        "packages/workflow-kit/src/lib/plan.mjs",
        "packages/workflow-kit/src/lib/recovery.mjs",
        "packages/workflow-kit/src/lib/validate.mjs",
        "packages/workflow-kit/src/lib/transaction.mjs",
        "packages/workflow-kit/scripts/check-runtime-fixture.mjs",
        "packages/workflow-kit/scripts/check-project-recovery-fixture.mjs",
        "tests/workflow-kit-recovery.test.mjs",
        "tests/workflow-kit-source.test.mjs",
        "packages/workflow-kit/scripts/check-document-fixture.mjs",
        "tests/project-doctor.test.mjs",
        "tests/workspace-setup.test.mjs"
      ],
      "documentation_paths": [
        "docs/planning/workflow-kit-context-refactor.md",
        "docs/planning/workflow-kit-context-transition.md"
      ],
      "verification_ids": [
        "kit-check",
        "unit-all"
      ],
      "verification_kind": "code",
      "acceptance_criteria": [
        "README.md исключён из PROJECT_CONTEXT_DOCUMENTS: нормализация не добавляет его как обязательный источник; создание установщиком разрешено. Старые docs/MODULES.md и docs/DOCUMENTATION_INDEX.md в контексте плана передаются ссылкой с путём, ревизией и размером, даже при required; источник проверяется.",
        "В NONE прошлый план представлен списком «id — заголовок — статус — SHA» без полных карточек; archived_scope_id, SHA закрытия и ссылка на спецификацию сохранены. Обязательный контекст ACTIVE не теряется.",
        "Recover в изолированной копии реального состояния этого репозитория с установленными исходниками нового Kit проходит до и после штатной нормализации плана: <=144000 байт, запас >=20% от hard_bytes=180000, <=7 частей. Проверка включена в обязательные checks, без сокращённого плана и без замены реального установленного Kit до T006.",
        "Не больше 7 частей, каждая со служебным оформлением <=budget.document_bytes (28000 по умолчанию). Восьмая часть вызывает CONTEXT_TOO_LARGE даже при сумме <180000; нет усечения или частичной отправки. Проверены 7/8 частей и общий байтовый предел.",
        "Размер staged blob проверяется для .md/.markdown без учёта регистра, единственное исключение .harness/plans/todo-plan.md. docs:commit защищает управляемую секцию AGENTS.override.md так же, как AGENTS.md: index побайтно совпадает с HEAD; правки при отказе сохраняются.",
        "Kit-check и unit-all проходят; изменение выполнено после T004 и до DOCS, завершённые задачи не переписаны."
      ],
      "expected_commit_message": "fix: ограничить recovery бюджетом и семью частями",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "recovery-on-demand-research-20261006",
        "task_id": "T004A",
        "role": "implementation"
      },
      "actual_files": [
        "docs/planning/workflow-kit-context-transition.md",
        "packages/workflow-kit/scripts/check-document-fixture.mjs",
        "packages/workflow-kit/scripts/check-project-recovery-fixture.mjs",
        "packages/workflow-kit/scripts/check-runtime-fixture.mjs",
        "packages/workflow-kit/src/lib/plan.mjs",
        "packages/workflow-kit/src/lib/recovery.mjs",
        "packages/workflow-kit/src/lib/validate.mjs",
        "tests/project-doctor.test.mjs",
        "tests/workflow-kit-recovery.test.mjs",
        "tests/workflow-kit-source.test.mjs",
        "tests/workspace-setup.test.mjs"
      ]
    },
    {
      "id": "DOCS",
      "title": "Актуализация всех документов проекта",
      "why": "Зафиксировать корректное описание нового выпуска до сборки, сохраняя совместимость проекта в переходный период.",
      "dependencies": [
        "T001",
        "T001R",
        "T001R2",
        "T002",
        "T002A",
        "T003",
        "T004",
        "T004A"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/planning/workflow-kit-context-refactor.md",
        "docs/planning/recovery-on-demand-research.md",
        "docs/PRODUCT.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/DOCUMENTATION_INDEX.md",
        "docs/MODULES.md",
        "docs/architecture/OVERVIEW.md",
        "packages/workflow-kit/docs/modules/workflow-kit-package.md",
        "README.md",
        "packages/workflow-kit/src/WORKFLOW.md",
        "packages/workflow-kit/src/templates/AGENTS.md",
        "packages/workflow-kit/src/templates/PROTOTYPE.md",
        "packages/workflow-kit/src/templates/SPEC.md",
        "packages/workflow-kit/src/templates/PLAN.md",
        "packages/workflow-kit/src/templates/CONTINUE.md",
        "packages/workflow-kit/src/templates/STAGES.md",
        "AGENTS.md",
        "docs/planning/workflow-kit-context-transition.md",
        "docs/modules/workflow-kit-recovery.md",
        "docs/CONTEXT_DELIVERY.md",
        "docs/planning/context-as-text.md",
        "docs/WORKSPACE_SETUP.md",
        "packages/workflow-kit/README.md",
        "docs/modules/chatgpt-dom-compatibility.md",
        "packages/workflow-kit/src/templates/PRODUCT.md",
        "packages/workflow-kit/src/templates/ARCHITECTURE.md",
        "packages/workflow-kit/src/templates/START.md"
      ],
      "verification_ids": [],
      "acceptance_criteria": [
        "Актуализированы документы изменённого поведения и выпуска, включая recovery, доставку, workspace setup и README пакета; проверен весь действующий комплект, нет ложной приёмки native Windows.",
        "До T006 действует установленный Kit 1.5.6: массовой миграции старых документов нет; текущие две части спецификации сохраняются до закрытия scope. Installed Kit и его секция AGENTS не редактируются вручную.",
        "Источники новых инструкций соответствуют спецификации; docs перед сборкой зафиксированы. История и состав проекта переводятся Claude вне плана после T007/доработок, до пользовательского перезапуска.",
        "README: версия, установка, запуск; без статуса сборки/публикации, ссылок на конкретный релиз и хешей — они в release-manifest.json и GitHub Release."
      ],
      "expected_commit_message": "docs: подготовить выпуск нового Workflow Kit",
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "recovery-on-demand-research-20261006",
        "task_id": "DOCS",
        "role": "implementation"
      }
    },
    {
      "id": "T005",
      "title": "Собрать парный выпуск Web Pilot с новым Workflow Kit",
      "why": "Получить проверенные пакеты обеих платформ из одного подготовленного состояния исходников.",
      "dependencies": [
        "T004",
        "DOCS"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/planning/workflow-kit-context-transition.md"
      ],
      "verification_ids": [
        "paired-release"
      ],
      "verification_kind": "package",
      "acceptance_criteria": [
        "На установленном Kit 1.5.6 после DOCS назначенная paired-release проверка один раз собирает macOS arm64 и Windows x64 с одинаковым новым Kit; версии, хеши и состав подтверждены.",
        "Версии уже подготовлены T004; нет повторной сборки, изменения исходников и объявления native Windows/живого ChatGPT проверенными."
      ],
      "expected_commit_message": "release: собрать Web Pilot с новым Workflow Kit",
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "recovery-on-demand-research-20261006",
        "task_id": "T005",
        "role": "implementation"
      }
    },
    {
      "id": "T006",
      "title": "Установить выпуск и активировать новый Kit для проекта",
      "why": "Перевести текущий проект на новый runtime без потери выполняемой задачи и подтверждённых коммитов.",
      "dependencies": [
        "T005",
        "DOCS"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/planning/workflow-kit-context-transition.md"
      ],
      "verification_ids": [
        "release-installed"
      ],
      "verification_kind": "installed",
      "acceptance_criteria": [
        "task:start T006 выполняется старым Kit; устанавливается уже собранное приложение; install --update создаёт отдельный служебный kit-update, включая безопасное удаление старых архивов; commit --task T006 выполняется новым Kit.",
        "Подтверждены установленные macOS-копии, identity/подпись и соответствие пакетам без пересборки. План читается, T001 и остальные DONE/references сохранены, commit T006 подтверждён, T007 доступна.",
        "До общей миграции новый runtime читает старые документы; при недоступности открытого чата остановиться и сообщить пользователю, переход на внешнего клиента — только по его решению. Native Windows проверяет пользователь."
      ],
      "expected_commit_message": "release: установить новый Workflow Kit и Web Pilot",
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "recovery-on-demand-research-20261006",
        "task_id": "T006",
        "role": "implementation"
      }
    },
    {
      "id": "T007",
      "title": "Опубликовать и проверить новый парный выпуск",
      "why": "Предоставить пользователю проверенные артефакты и завершить реализацию перед независимым ревью.",
      "dependencies": [
        "T006",
        "DOCS"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/planning/workflow-kit-context-transition.md"
      ],
      "verification_ids": [
        "github-release"
      ],
      "verification_kind": "package",
      "acceptance_criteria": [
        "На новом Kit опубликован и проверен GitHub Release: source/tag/assets совпадают с manifest, пересборки и переноса опубликованного тега нет.",
        "После подтверждения коммита план READY_FOR_ACCEPTANCE; агент останавливается. Задачи миграции не добавляются; Claude проверяет результат и затем мигрирует документы вне плана до перезапуска пользователя.",
        "Готовность проекта к перезапуску ещё не объявляется: она требует согласованной проверенной миграции и push документационных коммитов."
      ],
      "expected_commit_message": "release: опубликовать парный выпуск с новым Workflow Kit",
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "recovery-on-demand-research-20261006",
        "task_id": "T007",
        "role": "implementation"
      }
    }
  ],
  "blocked_reason": null,
  "user_decisions": [
    {
      "id": "6c1ab6f7-f03c-4011-8067-1130111a5ad8",
      "text": "Прямое поручение пользователя 06.10.2026: закрыть текущий план и открыть новый короткий исследовательский план. Реализация и delivery не входят в scope.",
      "recorded_at": "2026-10-06T10:12:00.271Z"
    },
    {
      "id": "workflow-kit-refactor-20261006",
      "text": "06.10.2026 пользователь согласовал минимальные документы без накопления истории, обновление перед релизом, восстановление агентом по спецификации/плану/коммитам/диффам и детерминированный recovery целых документов. Сначала новые инструкции и выпуск Kit, затем миграция документации. Поручено составить спецификацию и to-do: прежнее исследовательское ограничение расширено для планирования этих этапов; текущий ответ не выполняет реализацию/сборку/публикацию.",
      "recorded_at": "2026-10-06T14:12:48Z"
    },
    {
      "id": "accepted-review-20261006",
      "text": "06.10.2026: приняты обе части ревью и окончательные уточнения. Предел budget.document_bytes=28000 байт UTF-8 для документа и части со служебными заголовками; validateStaged проверяет index всех изменённых .md до ролей/тестов, единственное исключение .harness/plans/todo-plan.md. Разделение источников правил; docs:commit; раунды; Git вместо архивных копий. Архивы удаляет install --update ролью kit-update только tracked и совпадающие с HEAD. Дедупликация (path,revision), required before_head проверяется. Общий splitter заголовки/абзацы/строки/UTF-8. T004 начинается с проверки File/DataTransfer, при отказе остановка. T005 старый Kit; T006 task:start старым, установка приложения, kit-update, commit новым; T007 новый Kit. T001 неизменна; миграция Claude вне плана после T007/доработок до перезапуска, спецификация текущего scope сохраняется до закрытия. Правки спецификации/плана разрешены сейчас; реализация в этом ответе не выполняется.",
      "recorded_at": "2026-10-06T16:16:25.261363+00:00"
    },
    {
      "id": "review-five-clarifications-20261006",
      "text": "06.10.2026 после проверки 4186101 приняты пять уточнений: docs:commit разрешает любой .md вне .harness/, в AGENTS.md Kit-секция в index побайтно равна HEAD; T004 config:apply добавляет document_bytes и сохраняет soft_tokens/hard_tokens для старого Kit, новый runtime принимает оба формата, удаление не раньше T006; README без статусов/ссылок на конкретный релиз/хешей; проверка File/DataTransfer — 7 файлов по 28000 байт до Send; T002 проверяет устойчивость к промежуточному служебному коммиту, полный переход версий с upgradeFrom 1.5.6 — T004. Поручено внести до начала T002.",
      "recorded_at": "2026-10-06T16:22:49.391693+00:00"
    }
  ]
}
```
<!-- workflow-state:end -->

## Состояние

Execution Scope Status: ACTIVE
Delivery Status: IN_PROGRESS
Scope: recovery-on-demand-research-20261006
Current Task: нет
Revision: 1382

## Цель

Рефакторинг Workflow Kit: компактные документы до 28000 байт, recovery по плану и Git, доставка частями-вложениями; парный выпуск перед согласованной миграцией проекта вне плана.

## Критерии приёмки

- Принятые правила С1–С15 и П1–П13 реализованы по двум частям спецификации; документы актуализируются перед выпуском, история доступна в Git.
- Recovery и Web Pilot передают полный выбранный контекст без дублей/усечения одинаково на macOS и Windows; предел 28000 байт конфигурируемый, превышение изменённого документа блокирует commit.
- Парный выпуск проверен и опубликован; переход старый Kit → новый Kit сохраняет план. После T007 остановка на READY_FOR_ACCEPTANCE; независимое ревью и миграция Claude вне плана до перезапуска, закрытие только по команде пользователя.

## Микрозадачи

- [DONE] T001: Зафиксировать исследование и план рефакторинга Workflow Kit — Завершено
  - Git Commit: [DONE] docs: спланировать рефакторинг документации и recovery
  - Reference: recovery-on-demand-research-20261006 / T001 / implementation
  - Файлы: docs/planning/workflow-kit-context-refactor.md, docs/planning/recovery-on-demand-research.md, docs/DOCUMENTATION_INDEX.md, docs/MODULES.md
- [DONE] T001R: Согласовать спецификацию и план по принятому ревью — Завершено
  - Git Commit: [DONE] docs: согласовать ревью документации и recovery
  - Reference: recovery-on-demand-research-20261006 / T001R / implementation
  - Файлы: docs/planning/workflow-kit-context-refactor.md, docs/planning/workflow-kit-context-transition.md, docs/planning/recovery-on-demand-research.md, docs/DOCUMENTATION_INDEX.md
- [DONE] T001R2: Уточнить пять условий перед реализацией Kit — Завершено
  - Git Commit: [DONE] docs: уточнить условия реализации и перехода Kit
  - Reference: recovery-on-demand-research-20261006 / T001R2 / implementation
  - Файлы: docs/planning/workflow-kit-context-refactor.md, docs/planning/workflow-kit-context-transition.md
- [DONE] T002: Реализовать жизненный цикл планов и документационных коммитов — Завершено
  - Git Commit: [DONE] feat: поддержать раунды и самостоятельные документы в Kit
  - Reference: recovery-on-demand-research-20261006 / T002 / implementation
  - Файлы: packages/workflow-kit/src/lib/actions.mjs, packages/workflow-kit/src/lib/plan.mjs, packages/workflow-kit/src/lib/validate.mjs, packages/workflow-kit/src/lib/git-hooks.mjs, packages/workflow-kit/src/lib/transaction.mjs, packages/workflow-kit/src/lib/simple-workflow.mjs, packages/workflow-kit/src/lib/extend-plan.mjs, packages/workflow-kit/src/lib/session-plans.mjs, packages/workflow-kit/src/lib/installer.mjs, packages/workflow-kit/src/lib/task-update.mjs, packages/workflow-kit/src/lib/task-files.mjs, packages/workflow-kit/src/lib/command-help.mjs, packages/workflow-kit/src/cli.mjs, packages/workflow-kit/src/schemas/plan.schema.json, packages/workflow-kit/scripts/check-runtime-fixture.mjs, packages/workflow-kit/scripts/check-carryover-fixture.mjs, tests/project-doctor.test.mjs, tests/release-all.test.mjs, tests/session-opening-performance.test.mjs, tests/session-plans.test.mjs, tests/workflow-kit-recovery.test.mjs, tests/workflow-kit-source.test.mjs, tests/workspace-setup.test.mjs, packages/workflow-kit/src/lib/recovery.mjs, docs/planning/workflow-kit-context-refactor.md, docs/planning/workflow-kit-context-transition.md, packages/workflow-kit/src/WORKFLOW.md, packages/workflow-kit/src/templates/AGENTS.md, packages/workflow-kit/src/templates/PROTOTYPE.md, packages/workflow-kit/src/templates/SPEC.md, packages/workflow-kit/src/templates/PLAN.md, packages/workflow-kit/src/templates/CONTINUE.md, packages/workflow-kit/src/templates/STAGES.md
- [DONE] T002A: Реализовать модель документов и общий предел размера — Завершено
  - Git Commit: [DONE] feat: ограничить документы Kit и обновить их модель
  - Reference: recovery-on-demand-research-20261006 / T002A / implementation
  - Файлы: packages/workflow-kit/src/lib/installation-files.mjs, packages/workflow-kit/src/lib/installer.mjs, packages/workflow-kit/src/lib/inspection-inputs.mjs, packages/workflow-kit/src/lib/plan.mjs, packages/workflow-kit/src/lib/validate.mjs, packages/workflow-kit/src/lib/git-hooks.mjs, packages/workflow-kit/src/lib/transaction.mjs, packages/workflow-kit/src/lib/command-help.mjs, packages/workflow-kit/src/schemas/workflow.schema.json, resources/workspace-setup-worker.mjs, packages/workflow-kit/scripts/check-runtime-fixture.mjs, tests/project-doctor.test.mjs, tests/release-all.test.mjs, tests/session-opening-performance.test.mjs, tests/session-plans.test.mjs, tests/workflow-kit-recovery.test.mjs, tests/workflow-kit-source.test.mjs, tests/workspace-setup.test.mjs, packages/workflow-kit/scripts/check-document-fixture.mjs, packages/workflow-kit/src/lib/actions.mjs, packages/workflow-kit/src/lib/recovery.mjs, packages/workflow-kit/src/lib/simple-workflow.mjs, resources/project-doctor/core.mjs, docs/planning/workflow-kit-context-refactor.md, docs/planning/workflow-kit-context-transition.md, packages/workflow-kit/src/WORKFLOW.md, packages/workflow-kit/src/templates/AGENTS.md, packages/workflow-kit/src/templates/PROTOTYPE.md, packages/workflow-kit/src/templates/SPEC.md, packages/workflow-kit/src/templates/PLAN.md, packages/workflow-kit/src/templates/CONTINUE.md, packages/workflow-kit/src/templates/STAGES.md, packages/workflow-kit/src/templates/PRODUCT.md, packages/workflow-kit/src/templates/ARCHITECTURE.md, packages/workflow-kit/src/templates/START.md
- [DONE] T003: Реализовать recovery из целых документов и связей с Git — Завершено
  - Git Commit: [DONE] feat: восстанавливать контекст по плану и Git
  - Reference: recovery-on-demand-research-20261006 / T003 / implementation
  - Файлы: packages/workflow-kit/src/lib/recovery.mjs, packages/workflow-kit/src/lib/project-facts.mjs, packages/workflow-kit/src/lib/plan.mjs, packages/workflow-kit/src/lib/git.mjs, packages/workflow-kit/src/lib/actions.mjs, packages/workflow-kit/src/lib/command-help.mjs, packages/workflow-kit/scripts/check-runtime-fixture.mjs, tests/workflow-kit-recovery.test.mjs, packages/workflow-kit/src/lib/inspection-inputs.mjs, packages/workflow-kit/src/lib/transaction.mjs, packages/workflow-kit/src/lib/validate.mjs, packages/workflow-kit/src/lib/common.mjs, packages/workflow-kit/src/schemas/plan.schema.json, docs/planning/workflow-kit-context-refactor.md, docs/planning/workflow-kit-context-transition.md, docs/modules/workflow-kit-recovery.md, docs/CONTEXT_DELIVERY.md
- [DONE] T004: Согласовать Web Pilot с новым Kit и подготовить проверки выпуска — Завершено
  - Git Commit: [DONE] feat: подключить новый recovery к Web Pilot
  - Reference: recovery-on-demand-research-20261006 / T004 / implementation
  - Файлы: src/context-session.mjs, src/context-cache.mjs, src/session-plans.mjs, src/mcp-runtime.mjs, src/auto-plan.mjs, src/mac-runtime-switch.mjs, src/workspace-setup.mjs, tests/context-session.test.mjs, tests/context-cache.test.mjs, tests/session-plans.test.mjs, tests/auto-plan.test.mjs, tests/workflow-kit-source.test.mjs, packages/workflow-kit/package.json, packages/workflow-kit/src/lib/common.mjs, package.json, package-lock.json, .harness/workflow.json, packages/workflow-kit/src/lib/installer.mjs, packages/workflow-kit/src/lib/inspection-inputs.mjs, resources/workspace-setup-worker.mjs, src/context-inputs.mjs, src/main.mjs, src/chatgpt-composer.mjs, src/chatgpt-dom.mjs, src/chatgpt-experience.mjs, tests/chatgpt-composer.test.mjs, tests/chatgpt-dom.test.mjs, tests/chatgpt-experience.test.mjs, tests/workspace-setup.test.mjs, tests/session-opening-performance.test.mjs, scripts/check-installed-release.mjs, scripts/check-github-release.mjs, scripts/probe-chatgpt-file-paste.mjs, tests/chatgpt-file-paste-probe.test.mjs, tests/electron-smoke.mjs, tests/mcp-runtime.test.mjs, tests/workflow-kit-upgrade.test.mjs, docs/planning/workflow-kit-context-refactor.md, docs/planning/workflow-kit-context-transition.md, docs/CONTEXT_DELIVERY.md, docs/WORKSPACE_SETUP.md, docs/modules/chatgpt-dom-compatibility.md
- [DONE] T004A: Устранить переполнение recovery и ограничить число частей — Завершено
  - Git Commit: [DONE] fix: ограничить recovery бюджетом и семью частями
  - Reference: recovery-on-demand-research-20261006 / T004A / implementation
  - Файлы: packages/workflow-kit/src/lib/plan.mjs, packages/workflow-kit/src/lib/recovery.mjs, packages/workflow-kit/src/lib/validate.mjs, packages/workflow-kit/src/lib/transaction.mjs, packages/workflow-kit/scripts/check-runtime-fixture.mjs, packages/workflow-kit/scripts/check-project-recovery-fixture.mjs, tests/workflow-kit-recovery.test.mjs, tests/workflow-kit-source.test.mjs, packages/workflow-kit/scripts/check-document-fixture.mjs, tests/project-doctor.test.mjs, tests/workspace-setup.test.mjs, docs/planning/workflow-kit-context-refactor.md, docs/planning/workflow-kit-context-transition.md
- [TODO] DOCS: Актуализация всех документов проекта — Ожидает
  - Git Commit: [PENDING] docs: подготовить выпуск нового Workflow Kit
  - Reference: recovery-on-demand-research-20261006 / DOCS / implementation
  - Файлы: docs/planning/workflow-kit-context-refactor.md, docs/planning/recovery-on-demand-research.md, docs/PRODUCT.md, docs/architecture/ARCHITECTURE.md, docs/DOCUMENTATION_INDEX.md, docs/MODULES.md, docs/architecture/OVERVIEW.md, packages/workflow-kit/docs/modules/workflow-kit-package.md, README.md, packages/workflow-kit/src/WORKFLOW.md, packages/workflow-kit/src/templates/AGENTS.md, packages/workflow-kit/src/templates/PROTOTYPE.md, packages/workflow-kit/src/templates/SPEC.md, packages/workflow-kit/src/templates/PLAN.md, packages/workflow-kit/src/templates/CONTINUE.md, packages/workflow-kit/src/templates/STAGES.md, AGENTS.md, docs/planning/workflow-kit-context-transition.md, docs/modules/workflow-kit-recovery.md, docs/CONTEXT_DELIVERY.md, docs/planning/context-as-text.md, docs/WORKSPACE_SETUP.md, packages/workflow-kit/README.md, docs/modules/chatgpt-dom-compatibility.md, packages/workflow-kit/src/templates/PRODUCT.md, packages/workflow-kit/src/templates/ARCHITECTURE.md, packages/workflow-kit/src/templates/START.md
- [TODO] T005: Собрать парный выпуск Web Pilot с новым Workflow Kit — Ожидает
  - Git Commit: [PENDING] release: собрать Web Pilot с новым Workflow Kit
  - Reference: recovery-on-demand-research-20261006 / T005 / implementation
  - Файлы: docs/planning/workflow-kit-context-transition.md
- [TODO] T006: Установить выпуск и активировать новый Kit для проекта — Ожидает
  - Git Commit: [PENDING] release: установить новый Workflow Kit и Web Pilot
  - Reference: recovery-on-demand-research-20261006 / T006 / implementation
  - Файлы: docs/planning/workflow-kit-context-transition.md
- [TODO] T007: Опубликовать и проверить новый парный выпуск — Ожидает
  - Git Commit: [PENDING] release: опубликовать парный выпуск с новым Workflow Kit
  - Reference: recovery-on-demand-research-20261006 / T007 / implementation
  - Файлы: docs/planning/workflow-kit-context-transition.md

## Context Pack For This Cycle

- docs/architecture/OVERVIEW.md → Краткая архитектура проекта
- docs/MODULES.md → Модули проекта
- docs/DOCUMENTATION_INDEX.md → Каталог документации
- docs/planning/workflow-kit-context-transition.md
- docs/planning/workflow-kit-context-refactor.md

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
