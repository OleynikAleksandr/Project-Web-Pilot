# Активный план — Project Web Pilot

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 607,
  "project_id": "cf944136-d1fc-4bd5-9ea0-e46d1fe230e7",
  "project_name": "Project Web Pilot",
  "scope_id": "session-owned-plans-028",
  "execution_scope_status": "ACTIVE",
  "delivery_status": "IN_PROGRESS",
  "objective": "Планы сессий и подготовка продолжения",
  "acceptance_criteria": [
    "Каждая сессия показывает собственный сохраняемый план либо NONE; выполненный план продолжается по новому поручению агенту.",
    "В исходной сессии видны её план и подготовленное продолжение; после создания новой остаётся ссылка на тот же план.",
    "Подготовленный план открывается в новой Chat/Work-сессии через существующий выбор; меню проекта отдельно создаёт сессию без scope.",
    "Обязательная приёмка и + Задача отсутствуют; завершение задач не архивирует план и не создаёт сессию автоматически.",
    "Канонический контекст, инструкции и шаблоны используют правильную session/plan привязку; миграция, Git-история и данные сохранены.",
    "Поведение проверено, подготовлен релиз для пользователя и актуализирован весь действующий комплект документов."
  ],
  "approved_scope": {
    "documentation_paths": [
      "docs/modules/session-owned-plans.md",
      "docs/modules/workspace-sessions.md",
      "docs/modules/workflow-kit-recovery.md",
      "docs/CONTEXT_DELIVERY.md",
      "docs/RELEASE.md",
      "docs/architecture/ARCHITECTURE.md",
      "docs/VERIFICATION.md",
      "docs/design/session-plan-navigation.md",
      "AGENTS.md",
      "docs/WORKFLOW_START.md",
      ".harness/kit/WORKFLOW.md",
      "resources/workflow-kit/WORKFLOW.md",
      ".harness/kit/templates/AGENTS.md",
      "resources/workflow-kit/templates/AGENTS.md",
      ".harness/kit/templates/START.md",
      "resources/workflow-kit/templates/START.md",
      ".harness/kit/templates/PLAN.md",
      "resources/workflow-kit/templates/PLAN.md",
      ".harness/plans/todo-plan.template.md",
      "docs/WORKSPACE_SETUP.md",
      "docs/modules/project-doctor.md",
      "docs/TRANSFER_TO_WINDOWS.md",
      "docs/architecture/OVERVIEW.md",
      "docs/MODULES.md",
      "docs/DOCUMENTATION_INDEX.md",
      "docs/DECISIONS.md",
      "docs/PRODUCT.md",
      "docs/PROJECT_ARCHIVE.md",
      "docs/CLEAN_INSTALL.md",
      "README.md"
    ],
    "functional_paths": [
      ".harness/kit/lib/session-plans.mjs",
      "resources/workflow-kit/lib/session-plans.mjs",
      "tests/session-plans.test.mjs",
      ".harness/kit/lib/common.mjs",
      "resources/workflow-kit/lib/common.mjs",
      ".harness/kit/lib/plan.mjs",
      "resources/workflow-kit/lib/plan.mjs",
      ".harness/kit/lib/actions.mjs",
      "resources/workflow-kit/lib/actions.mjs",
      ".harness/kit/cli.mjs",
      "resources/workflow-kit/cli.mjs",
      ".harness/kit/lib/transaction.mjs",
      "resources/workflow-kit/lib/transaction.mjs",
      ".harness/kit/lib/validate.mjs",
      "resources/workflow-kit/lib/validate.mjs",
      ".harness/kit/lib/git-hooks.mjs",
      "resources/workflow-kit/lib/git-hooks.mjs",
      ".harness/kit/lib/recovery.mjs",
      "resources/workflow-kit/lib/recovery.mjs",
      "tests/workflow-kit-source.test.mjs",
      "src/workspace-session.mjs",
      "tests/workspace-session.test.mjs",
      "src/session-plans.mjs",
      "tests/workflow-kit-recovery.test.mjs",
      "src/context-session.mjs",
      "src/context-cache.mjs",
      "src/context-inputs.mjs",
      "src/mcp-runtime.mjs",
      "tests/context-cache.test.mjs",
      "tests/context-session.test.mjs",
      "tests/mcp-runtime.test.mjs",
      "src/main.mjs",
      "src/preload.cjs",
      "src/ui/sidebar.mjs",
      "src/ui/index.html",
      "src/ui/progress.mjs",
      "tests/sidebar.test.mjs",
      "tests/progress.test.mjs",
      ".harness/kit/lib/installer.mjs",
      "resources/workflow-kit/lib/installer.mjs",
      "src/workspace-setup.mjs",
      "src/project-doctor.mjs",
      ".harness/kit/lib/installation-files.mjs",
      "resources/workflow-kit/lib/installation-files.mjs",
      ".harness/kit-manifest.json",
      "tests/project-doctor.test.mjs",
      "tests/workspace-setup.test.mjs",
      "tests/electron-smoke.mjs",
      "package.json",
      "package-lock.json"
    ],
    "max_functional_files_per_task": 3
  },
  "baseline_commit": "962f30328c65748bc63d25c083ce460cef824f56",
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
        "heading_path": [
          "Планы сессий и подготовка продолжения"
        ],
        "path": "docs/modules/session-owned-plans.md",
        "required": true,
        "revision": "WORKTREE"
      },
      {
        "heading_path": [
          "Сайдбар планов сессий — принятый пример"
        ],
        "path": "docs/design/session-plan-navigation.md",
        "required": false,
        "revision": "WORKTREE"
      },
      {
        "heading_path": [
          "Module Specification — Workspace & Sessions"
        ],
        "path": "docs/modules/workspace-sessions.md",
        "required": false,
        "revision": "WORKTREE"
      },
      {
        "heading_path": [
          "Module Specification — Workflow Kit / Context Recovery"
        ],
        "path": "docs/modules/workflow-kit-recovery.md",
        "required": false,
        "revision": "WORKTREE"
      },
      {
        "heading_path": [
          "Выпуск и постоянный путь запуска"
        ],
        "path": "docs/RELEASE.md",
        "required": false,
        "revision": "WORKTREE"
      },
      {
        "heading_path": [
          "Проверка установки на чистых системах"
        ],
        "path": "docs/CLEAN_INSTALL.md",
        "required": false,
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
        "scope_id": "session-owned-plans-028",
        "task_id": "T001",
        "role": "implementation"
      },
      "dependencies": [],
      "functional_paths": [],
      "documentation_paths": [
        "docs/modules/session-owned-plans.md",
        "docs/modules/workspace-sessions.md",
        "docs/modules/workflow-kit-recovery.md",
        "docs/CONTEXT_DELIVERY.md",
        "docs/RELEASE.md"
      ],
      "verification_ids": [],
      "acceptance_criteria": [
        "Прочитан принятый контракт и макет; решения пользователя не переобсуждаются без нового противоречия.",
        "Проверены существующие фасады Workflow Kit/Workspace Sessions и применимые готовые подходы; выбрана минимальная схема стабильной связи sessionId и planId.",
        "Описаны совместимость CLI, правила одновременного чтения и одного писателя, транзакции, сохранение commit references, миграция только доказанных связей и обновление manifest.",
        "Уточнены пути последующих микрозадач через plan:apply перед изменениями; версии checkout 0.6.26 и app 0.6.27 сверены, работа другого агента сохраняется."
      ],
      "expected_commit_message": "docs: specify session plan ownership and migration",
      "id": "T001",
      "title": "Уточнить контракт хранения и безопасную миграцию",
      "why": "Сопоставить согласованный UX с существующими модулями и выбрать минимальные изменения."
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "session-owned-plans-028",
        "task_id": "T002",
        "role": "implementation"
      },
      "dependencies": [
        "T001"
      ],
      "functional_paths": [
        ".harness/kit/lib/session-plans.mjs",
        "resources/workflow-kit/lib/session-plans.mjs",
        "tests/session-plans.test.mjs",
        ".harness/kit/lib/common.mjs",
        "resources/workflow-kit/lib/common.mjs",
        ".harness/kit/lib/plan.mjs",
        "resources/workflow-kit/lib/plan.mjs"
      ],
      "documentation_paths": [
        "docs/modules/session-owned-plans.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md",
        "docs/modules/workflow-kit-recovery.md"
      ],
      "verification_ids": [
        "suite"
      ],
      "acceptance_criteria": [
        "Собственный план, ещё не привязанный черновик и ссылка происхождения представлены без дублирования полных задач.",
        "Запись атомарна, проверяет revision; перезапуск и повтор операции сохраняют данные.",
        "Исторические планы не удаляются при смене выбранной сессии; путь/формат согласованы с миграцией T001; обе копии ядра синхронны."
      ],
      "expected_commit_message": "feat: persist session plans and continuation drafts",
      "id": "T002",
      "title": "Добавить каноническое хранение планов и черновиков",
      "why": "Каждый план сохраняет идентичность и доступность независимо от выбранной сессии.",
      "file_limit_exception": "Единый контракт явной адресации и его проверки; синхронное изменение установленной и поставляемой копий ядра."
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "session-owned-plans-028",
        "task_id": "T003",
        "role": "implementation"
      },
      "dependencies": [
        "T002"
      ],
      "functional_paths": [
        ".harness/kit/lib/actions.mjs",
        "resources/workflow-kit/lib/actions.mjs",
        ".harness/kit/cli.mjs",
        "resources/workflow-kit/cli.mjs",
        ".harness/kit/lib/plan.mjs",
        "resources/workflow-kit/lib/plan.mjs",
        "tests/session-plans.test.mjs",
        ".harness/kit/lib/transaction.mjs",
        "resources/workflow-kit/lib/transaction.mjs",
        ".harness/kit/lib/validate.mjs",
        "resources/workflow-kit/lib/validate.mjs",
        ".harness/kit/lib/git-hooks.mjs",
        "resources/workflow-kit/lib/git-hooks.mjs",
        ".harness/kit/lib/recovery.mjs",
        "resources/workflow-kit/lib/recovery.mjs",
        ".harness/kit/lib/session-plans.mjs",
        "resources/workflow-kit/lib/session-plans.mjs"
      ],
      "documentation_paths": [
        "docs/modules/session-owned-plans.md",
        "docs/modules/workflow-kit-recovery.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "suite"
      ],
      "acceptance_criteria": [
        "Команды создают черновик будущего плана без замены плана текущей сессии и позволяют продолжить ранее выполненный план.",
        "Новые задачи сохраняют прежние DONE-задачи и commit references; финальная DOCS выполняется после новых задач.",
        "Завершение задач не требует обязательной приёмки, не архивирует план и не инициирует новую сессию; явный архив остаётся отдельным действием.",
        "Запись адресуется конкретному plan/session, а не глобальному последнему выбору; CLI старого формата имеет явную совместимость."
      ],
      "expected_commit_message": "feat: add session scoped plan lifecycle commands",
      "file_limit_exception": "Единый контракт явной адресации и его проверки; синхронное изменение установленной и поставляемой копий ядра.",
      "id": "T003",
      "title": "Добавить команды подготовки и продолжения планов",
      "why": "Агент управляет нужным планом, включая полностью выполненный, по явной привязке."
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "session-owned-plans-028",
        "task_id": "T004",
        "role": "implementation"
      },
      "dependencies": [
        "T003"
      ],
      "functional_paths": [
        ".harness/kit/lib/transaction.mjs",
        "resources/workflow-kit/lib/transaction.mjs",
        ".harness/kit/lib/validate.mjs",
        "resources/workflow-kit/lib/validate.mjs",
        "tests/session-plans.test.mjs",
        ".harness/kit/lib/git-hooks.mjs",
        "resources/workflow-kit/lib/git-hooks.mjs",
        "tests/workflow-kit-source.test.mjs",
        ".harness/kit/lib/actions.mjs",
        "resources/workflow-kit/lib/actions.mjs",
        ".harness/kit/lib/session-plans.mjs",
        "resources/workflow-kit/lib/session-plans.mjs"
      ],
      "documentation_paths": [
        "docs/modules/session-owned-plans.md",
        "docs/modules/workflow-kit-recovery.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "suite"
      ],
      "acceptance_criteria": [
        "Валидация, task:start, commit и восстановление транзакции используют правильный plan/scopeId.",
        "Проверены stale revision, переключение сессии во время операции и повтор после сбоя; неверная привязка отклоняется.",
        "Один писатель на worktree сохраняется; наличие другого незавершённого плана не требует его закрывать.",
        "Workflow trailers и исторические references продолжают разрешаться без переписывания истории."
      ],
      "expected_commit_message": "fix: bind plan transactions to their owning session",
      "file_limit_exception": "Единый контракт явной адресации и его проверки; синхронное изменение установленной и поставляемой копий ядра.",
      "id": "T004",
      "title": "Сохранить проверки и транзакции для нескольких планов",
      "why": "При смене сессии агент не должен изменить чужую задачу или потерять коммит."
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "session-owned-plans-028",
        "task_id": "T005",
        "role": "implementation"
      },
      "dependencies": [
        "T004"
      ],
      "functional_paths": [
        "src/workspace-session.mjs",
        "tests/workspace-session.test.mjs",
        "src/session-plans.mjs"
      ],
      "documentation_paths": [
        "docs/modules/session-owned-plans.md",
        "docs/modules/workspace-sessions.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "workspace"
      ],
      "acceptance_criteria": [
        "Session store хранит стабильную ссылку на свой plan и источник продолжения; полные задачи не копируются в session store.",
        "Миграция с backup сохраняет URL, Chat/Work, имена, архивы и порядок; неизвестные исторические связи не угадываются.",
        "Возврат к старой сессии, перезапуск и восстановление из архива показывают её план независимо от последнего созданного.",
        "Автопереименование по scope адресуется владельцу плана, а не случайно выбранной сессии."
      ],
      "expected_commit_message": "feat: bind persisted sessions to their plans",
      "id": "T005",
      "title": "Связать сессии с планами и мигрировать сохранённые данные",
      "why": "Выбор сессии должен восстанавливать именно её план."
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "session-owned-plans-028",
        "task_id": "T006",
        "role": "implementation"
      },
      "dependencies": [
        "T005"
      ],
      "functional_paths": [
        ".harness/kit/lib/recovery.mjs",
        "resources/workflow-kit/lib/recovery.mjs",
        "tests/workflow-kit-recovery.test.mjs",
        ".harness/kit/cli.mjs",
        "resources/workflow-kit/cli.mjs"
      ],
      "documentation_paths": [
        "docs/modules/session-owned-plans.md",
        "docs/modules/workflow-kit-recovery.md",
        "docs/CONTEXT_DELIVERY.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "suite"
      ],
      "acceptance_criteria": [
        "Пакет содержит план выбранной сессии, его решения, незавершённые задачи и required-документы.",
        "Продолжение получает подготовленный контекст; новая самостоятельная сессия получает project navigation и NONE без чужого scope.",
        "Пакет не зависит от полного старого диалога; недостающие required-ссылки и превышение лимита обнаруживаются явно.",
        "Обновление контекста старой сессии не подставляет глобальный последний план."
      ],
      "expected_commit_message": "feat: recover context for the selected session plan",
      "id": "T006",
      "title": "Формировать recovery по плану выбранной сессии",
      "why": "Новая и возвращённая сессии должны получать правильный рабочий контекст.",
      "file_limit_exception": "Единый контракт явной адресации и его проверки; синхронное изменение установленной и поставляемой копий ядра."
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "session-owned-plans-028",
        "task_id": "T007",
        "role": "implementation"
      },
      "dependencies": [
        "T006"
      ],
      "functional_paths": [
        "src/context-session.mjs",
        "src/context-cache.mjs",
        "src/context-inputs.mjs",
        "src/mcp-runtime.mjs",
        "tests/context-cache.test.mjs",
        "tests/context-session.test.mjs",
        "tests/mcp-runtime.test.mjs"
      ],
      "documentation_paths": [
        "docs/modules/session-owned-plans.md",
        "docs/CONTEXT_DELIVERY.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "context",
        "suite"
      ],
      "acceptance_criteria": [
        "Ключ и проверка актуальности учитывают workspace/sessionId/planId/revision и нужные файлы.",
        "Переключение сессии отменяет либо игнорирует устаревшую подготовку; защита от повторной отправки сохраняется.",
        "Оболочка доставляет канонический пакет Workflow Kit; не добавлен второй сборщик контекста или модельный API."
      ],
      "expected_commit_message": "fix: isolate context delivery and cache by session plan",
      "id": "T007",
      "title": "Привязать доставку и кэш контекста к сессии и плану",
      "why": "Кэш или запоздалый ответ не должен перенести чужой план в новый чат.",
      "file_limit_exception": "Единый контракт явной адресации и его проверки; синхронное изменение установленной и поставляемой копий ядра."
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "session-owned-plans-028",
        "task_id": "T008",
        "role": "implementation"
      },
      "dependencies": [
        "T007"
      ],
      "functional_paths": [
        "src/main.mjs",
        "src/preload.cjs",
        "src/workspace-session.mjs",
        "src/session-plans.mjs",
        "tests/workspace-session.test.mjs",
        ".harness/kit/lib/actions.mjs",
        "resources/workflow-kit/lib/actions.mjs"
      ],
      "documentation_paths": [
        "docs/modules/session-owned-plans.md",
        "docs/modules/workspace-sessions.md",
        "docs/CONTEXT_DELIVERY.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "syntax",
        "workspace",
        "context",
        "suite"
      ],
      "acceptance_criteria": [
        "Создать сессию с этим планом открывает существующий выбор Chat/Work; выбранная новая сессия привязана к плану до подготовки первого контекста.",
        "Отмена сохраняет черновик; двойной клик/повтор после сбоя не создают дубль и не теряют связь.",
        "Новый Chat / Новый Work из меню проекта создают сессию с NONE, не присваивая план другой сессии.",
        "В исходной сессии сохраняется ссылка на тот же план продолжения.",
        "Удалены обработчики приёмки и автоматического предложения новой сессии по завершению/архиву обычного плана."
      ],
      "expected_commit_message": "feat: create sessions from prepared plans or empty scope",
      "id": "T008",
      "title": "Подключить два сценария ручного создания сессии",
      "why": "Пользователь явно выбирает продолжение готового плана либо новую тему.",
      "file_limit_exception": "Единый контракт явной адресации и его проверки; синхронное изменение установленной и поставляемой копий ядра."
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "session-owned-plans-028",
        "task_id": "T009",
        "role": "implementation"
      },
      "dependencies": [
        "T008"
      ],
      "functional_paths": [
        "src/ui/sidebar.mjs",
        "src/ui/index.html",
        "src/ui/progress.mjs",
        "tests/sidebar.test.mjs",
        "tests/progress.test.mjs"
      ],
      "documentation_paths": [
        "docs/modules/session-owned-plans.md",
        "docs/modules/workspace-sessions.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md",
        "docs/design/session-plan-navigation.md"
      ],
      "verification_ids": [
        "suite"
      ],
      "acceptance_criteria": [
        "План этой сессии всегда соответствует выбранной сессии и показывает выполненные и невыполненные задачи.",
        "Нет кнопки + Задача, Принять, Принять и завершить или Принять и продолжить; задачи добавляет агент по сообщению пользователя.",
        "Подготовлено здесь отображает черновик/документы/кнопку создания, затем карточку продолжения с раскрываемым просмотром и переходом.",
        "Переиспользованы существующая карточка Chat/Work и меню проекта; исходная сессия сохраняет собственный план.",
        "Сохранены две темы, ширина sidebar от 312px, новые сессии сверху, прокрутка списка и принятая тонкая обводка; статусы понятны без технических идентификаторов."
      ],
      "expected_commit_message": "feat: show session plans and prepared continuations in sidebar",
      "id": "T009",
      "title": "Обновить сайдбар по принятому макету",
      "why": "Свой план и подготовленное продолжение должны быть видимы и различимы.",
      "file_limit_exception": "Единый контракт явной адресации и его проверки; синхронное изменение установленной и поставляемой копий ядра."
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "session-owned-plans-028",
        "task_id": "T010",
        "role": "implementation"
      },
      "dependencies": [
        "T009"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/modules/session-owned-plans.md",
        "AGENTS.md",
        "docs/WORKFLOW_START.md",
        "docs/CONTEXT_DELIVERY.md",
        "docs/modules/workflow-kit-recovery.md",
        ".harness/kit/WORKFLOW.md",
        "resources/workflow-kit/WORKFLOW.md",
        ".harness/kit/templates/AGENTS.md",
        "resources/workflow-kit/templates/AGENTS.md",
        ".harness/kit/templates/START.md",
        "resources/workflow-kit/templates/START.md",
        ".harness/kit/templates/PLAN.md",
        "resources/workflow-kit/templates/PLAN.md",
        ".harness/plans/todo-plan.template.md"
      ],
      "verification_ids": [
        "suite"
      ],
      "acceptance_criteria": [
        "Инструкции закрепляют принадлежность плана сессии, создание микрозадач агентом по поручению и подготовку будущего плана в текущем контексте.",
        "Завершение DOCS не требует обязательного клика приёмки и не скрывает план; новое поручение сохраняет историю и вновь актуализирует документы.",
        "Шаблон будущего плана содержит цель/границы/решения/микрозадачи/критерии/документы/первый шаг, включая три required navigation docs.",
        "Установленные и поставляемые инструкции синхронны; отменён старый автоматический переход после приёмки; явный архив/удаление остаются отдельными действиями."
      ],
      "expected_commit_message": "docs: align agent instructions and templates with session plans",
      "id": "T010",
      "title": "Обновить инструкции агента и шаблоны Workflow Kit",
      "why": "Новая модель должна работать в следующих проектах и сессиях без старых требований приёмки."
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "session-owned-plans-028",
        "task_id": "T011",
        "role": "implementation"
      },
      "dependencies": [
        "T010"
      ],
      "functional_paths": [
        ".harness/kit/lib/installer.mjs",
        "resources/workflow-kit/lib/installer.mjs",
        "src/workspace-setup.mjs",
        "src/project-doctor.mjs",
        "tests/workflow-kit-source.test.mjs",
        ".harness/kit/lib/common.mjs",
        "resources/workflow-kit/lib/common.mjs",
        ".harness/kit/lib/installation-files.mjs",
        "resources/workflow-kit/lib/installation-files.mjs",
        ".harness/kit-manifest.json",
        "tests/project-doctor.test.mjs",
        "tests/workspace-setup.test.mjs"
      ],
      "documentation_paths": [
        "docs/modules/session-owned-plans.md",
        "docs/WORKSPACE_SETUP.md",
        "docs/modules/project-doctor.md",
        "docs/modules/workflow-kit-recovery.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "suite"
      ],
      "acceptance_criteria": [
        "Install/upgrade и manifest согласованы с новой версией ядра штатным способом, без обхода integrity checks.",
        "Doctor/readiness понимают новую схему и сохраняют планы/связи/историю с backup; не восстанавливают старый глобальный контракт поверх нового.",
        "Новые проекты и повторное подключение существующих работают; WF001 и внешние рабочие MCP/runtime не изменены.",
        "Проверки выполняются на временных fixtures; обе копии Workflow Kit совпадают."
      ],
      "expected_commit_message": "fix: migrate workflow installation and doctor for session plans",
      "file_limit_exception": "Единый контракт явной адресации и его проверки; синхронное изменение установленной и поставляемой копий ядра.",
      "id": "T011",
      "title": "Согласовать установку, обновление и Doctor с новой моделью",
      "why": "Служебное восстановление не должно вернуть глобальный план или потерять связи."
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "session-owned-plans-028",
        "task_id": "T012",
        "role": "implementation"
      },
      "dependencies": [
        "T011"
      ],
      "functional_paths": [
        "tests/sidebar.test.mjs",
        "tests/electron-smoke.mjs",
        "tests/context-session.test.mjs",
        "tests/session-plans.test.mjs",
        "tests/workflow-kit-recovery.test.mjs",
        "tests/context-cache.test.mjs",
        "tests/workspace-session.test.mjs"
      ],
      "documentation_paths": [
        "docs/modules/session-owned-plans.md",
        "docs/VERIFICATION.md",
        "docs/modules/workspace-sessions.md",
        "docs/CONTEXT_DELIVERY.md"
      ],
      "verification_ids": [
        "suite",
        "electron-smoke"
      ],
      "acceptance_criteria": [
        "Покрыты два незавершённых плана одного проекта, возврат к выполненному и новое поручение через команды агента, независимость планов.",
        "Покрыты черновик, отмена выбора, Chat и Work с подготовленным планом, ссылка назад/вперёд, отсутствие дублей и перезапуск.",
        "Покрыты самостоятельные Chat/Work с NONE, миграция legacy, stale context/revision, DOCS и архив/restore.",
        "Node suite и Electron smoke пройдены; пользовательская проверка реального интерфейса не объявлена автоматически выполненной."
      ],
      "expected_commit_message": "test: verify session plan continuity and manual creation",
      "id": "T012",
      "title": "Проверить полный сценарий сессий и продолжения",
      "why": "Подтвердить сохранение планов и контекста во всех принятых переходах.",
      "file_limit_exception": "Единый контракт явной адресации и его проверки; синхронное изменение установленной и поставляемой копий ядра."
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "session-owned-plans-028",
        "task_id": "T013",
        "role": "implementation"
      },
      "dependencies": [
        "T012"
      ],
      "functional_paths": [
        "package.json",
        "package-lock.json",
        "tests/sidebar.test.mjs"
      ],
      "documentation_paths": [
        "docs/modules/session-owned-plans.md",
        "docs/RELEASE.md",
        "docs/TRANSFER_TO_WINDOWS.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "suite",
        "electron-smoke"
      ],
      "acceptance_criteria": [
        "Версия выбрана после сверки исходников и пакета 0.6.27 другого агента; его изменения сохранены.",
        "Собраны macOS arm64 app и отдельный ZIP, Windows x64 package/ZIP; выполнены применимые package checks.",
        "Постоянный Project Web Pilot.app обновлён по RELEASE с сохранением Finder-алиаса; app.asar соответствует staging и ZIP.",
        "Зафиксированы фактические проверки и ограничения; тесты чистой установки и native Windows не объявлены выполненными без запуска. Никаких сборок в сессии подготовки плана."
      ],
      "expected_commit_message": "build: release session owned plans for user verification",
      "id": "T013",
      "title": "Собрать новый релиз для проверки пользователя",
      "why": "Доставить реализованное поведение в привычный app и отдельные пакеты."
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "session-owned-plans-028",
        "task_id": "DOCS",
        "role": "implementation"
      },
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
        "T012",
        "T013"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/modules/session-owned-plans.md",
        "docs/design/session-plan-navigation.md",
        "docs/architecture/OVERVIEW.md",
        "docs/MODULES.md",
        "docs/DOCUMENTATION_INDEX.md",
        "docs/DECISIONS.md",
        "docs/WORKFLOW_START.md",
        "docs/PRODUCT.md",
        "docs/CONTEXT_DELIVERY.md",
        "docs/modules/workspace-sessions.md",
        "docs/modules/workflow-kit-recovery.md",
        "docs/modules/project-doctor.md",
        "docs/PROJECT_ARCHIVE.md",
        "docs/WORKSPACE_SETUP.md",
        "docs/RELEASE.md",
        "docs/TRANSFER_TO_WINDOWS.md",
        "docs/CLEAN_INSTALL.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md",
        "README.md",
        "AGENTS.md",
        ".harness/kit/WORKFLOW.md",
        "resources/workflow-kit/WORKFLOW.md",
        ".harness/kit/templates/AGENTS.md",
        "resources/workflow-kit/templates/AGENTS.md",
        ".harness/kit/templates/START.md",
        "resources/workflow-kit/templates/START.md",
        ".harness/kit/templates/PLAN.md",
        "resources/workflow-kit/templates/PLAN.md",
        ".harness/plans/todo-plan.template.md"
      ],
      "verification_ids": [],
      "acceptance_criteria": [
        "Проверен весь действующий комплект по DOCUMENTATION_INDEX; обновлены устаревшие сведения и ссылки, действующие оставлены без бессмысленных правок.",
        "Документы согласованно описывают планы сессий, ручные переходы и продолжение; старые требования обязательной приёмки помечены историческими/заменены.",
        "Записаны release evidence, миграция, ограничения и реальная точка следующего продолжения; незавершённые независимые направления не теряются.",
        "План остаётся видимым и доступным для новых поручений; агент сообщает результат без автоматического архивирования или создания сессии."
      ],
      "expected_commit_message": "docs: update all project documentation for session plans",
      "id": "DOCS",
      "title": "Актуализация всех документов проекта",
      "why": "Сверить полный индекс после реализации, сохранив новый план доступным для дальнейших поручений."
    }
  ],
  "blocked_reason": null,
  "user_decisions": [
    {
      "id": "85685484-f2b1-48fd-84df-8f49b5bd6a92",
      "text": "17.09.2026 пользователь согласовал модель собственных планов сессий и блок Подготовлено здесь; исключил + Задача и обязательную приёмку; утвердил ручное создание с подготовленным планом через существующий выбор Chat/Work и самостоятельные Chat/Work с NONE через меню проекта. Последним поручением разрешил закрыть предыдущий план и создать этот новый для выполнения в следующей сессии. Сейчас разрешена только подготовка плана/контракта/макета; реализация и сборка в следующей сессии.",
      "recorded_at": "2026-09-17T08:02:20.988Z"
    },
    {
      "id": "6cb63237-b8a4-4917-b254-c7e3664a4d38",
      "text": "17.09.2026 в новой сессии пользователь прямо поручил начать реализацию текущего согласованного плана и подготовку релиза.",
      "recorded_at": "2026-09-17T08:08:19.630Z"
    }
  ]
}
```
<!-- workflow-state:end -->

## Состояние

Execution Scope Status: ACTIVE
Delivery Status: IN_PROGRESS
Scope: session-owned-plans-028
Current Task: нет
Revision: 607

## Цель

Планы сессий и подготовка продолжения

## Критерии приёмки

- Каждая сессия показывает собственный сохраняемый план либо NONE; выполненный план продолжается по новому поручению агенту.
- В исходной сессии видны её план и подготовленное продолжение; после создания новой остаётся ссылка на тот же план.
- Подготовленный план открывается в новой Chat/Work-сессии через существующий выбор; меню проекта отдельно создаёт сессию без scope.
- Обязательная приёмка и + Задача отсутствуют; завершение задач не архивирует план и не создаёт сессию автоматически.
- Канонический контекст, инструкции и шаблоны используют правильную session/plan привязку; миграция, Git-история и данные сохранены.
- Поведение проверено, подготовлен релиз для пользователя и актуализирован весь действующий комплект документов.

## Микрозадачи

- [DONE] T001: Уточнить контракт хранения и безопасную миграцию — Завершено
  - Git Commit: [DONE] docs: specify session plan ownership and migration
  - Reference: session-owned-plans-028 / T001 / implementation
  - Файлы: docs/modules/session-owned-plans.md, docs/modules/workspace-sessions.md, docs/modules/workflow-kit-recovery.md, docs/CONTEXT_DELIVERY.md, docs/RELEASE.md
- [DONE] T002: Добавить каноническое хранение планов и черновиков — Завершено
  - Git Commit: [DONE] feat: persist session plans and continuation drafts
  - Reference: session-owned-plans-028 / T002 / implementation
  - Файлы: .harness/kit/lib/session-plans.mjs, resources/workflow-kit/lib/session-plans.mjs, tests/session-plans.test.mjs, .harness/kit/lib/common.mjs, resources/workflow-kit/lib/common.mjs, .harness/kit/lib/plan.mjs, resources/workflow-kit/lib/plan.mjs, docs/modules/session-owned-plans.md, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md, docs/modules/workflow-kit-recovery.md
- [DONE] T003: Добавить команды подготовки и продолжения планов — Завершено
  - Git Commit: [DONE] feat: add session scoped plan lifecycle commands
  - Reference: session-owned-plans-028 / T003 / implementation
  - Файлы: .harness/kit/lib/actions.mjs, resources/workflow-kit/lib/actions.mjs, .harness/kit/cli.mjs, resources/workflow-kit/cli.mjs, .harness/kit/lib/plan.mjs, resources/workflow-kit/lib/plan.mjs, tests/session-plans.test.mjs, .harness/kit/lib/transaction.mjs, resources/workflow-kit/lib/transaction.mjs, .harness/kit/lib/validate.mjs, resources/workflow-kit/lib/validate.mjs, .harness/kit/lib/git-hooks.mjs, resources/workflow-kit/lib/git-hooks.mjs, .harness/kit/lib/recovery.mjs, resources/workflow-kit/lib/recovery.mjs, .harness/kit/lib/session-plans.mjs, resources/workflow-kit/lib/session-plans.mjs, docs/modules/session-owned-plans.md, docs/modules/workflow-kit-recovery.md, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md
- [DONE] T004: Сохранить проверки и транзакции для нескольких планов — Завершено
  - Git Commit: [DONE] fix: bind plan transactions to their owning session
  - Reference: session-owned-plans-028 / T004 / implementation
  - Файлы: .harness/kit/lib/transaction.mjs, resources/workflow-kit/lib/transaction.mjs, .harness/kit/lib/validate.mjs, resources/workflow-kit/lib/validate.mjs, tests/session-plans.test.mjs, .harness/kit/lib/git-hooks.mjs, resources/workflow-kit/lib/git-hooks.mjs, tests/workflow-kit-source.test.mjs, .harness/kit/lib/actions.mjs, resources/workflow-kit/lib/actions.mjs, .harness/kit/lib/session-plans.mjs, resources/workflow-kit/lib/session-plans.mjs, docs/modules/session-owned-plans.md, docs/modules/workflow-kit-recovery.md, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md
- [DONE] T005: Связать сессии с планами и мигрировать сохранённые данные — Завершено
  - Git Commit: [DONE] feat: bind persisted sessions to their plans
  - Reference: session-owned-plans-028 / T005 / implementation
  - Файлы: src/workspace-session.mjs, tests/workspace-session.test.mjs, src/session-plans.mjs, docs/modules/session-owned-plans.md, docs/modules/workspace-sessions.md, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md
- [DONE] T006: Формировать recovery по плану выбранной сессии — Завершено
  - Git Commit: [DONE] feat: recover context for the selected session plan
  - Reference: session-owned-plans-028 / T006 / implementation
  - Файлы: .harness/kit/lib/recovery.mjs, resources/workflow-kit/lib/recovery.mjs, tests/workflow-kit-recovery.test.mjs, .harness/kit/cli.mjs, resources/workflow-kit/cli.mjs, docs/modules/session-owned-plans.md, docs/modules/workflow-kit-recovery.md, docs/CONTEXT_DELIVERY.md, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md
- [DONE] T007: Привязать доставку и кэш контекста к сессии и плану — Завершено
  - Git Commit: [DONE] fix: isolate context delivery and cache by session plan
  - Reference: session-owned-plans-028 / T007 / implementation
  - Файлы: src/context-session.mjs, src/context-cache.mjs, src/context-inputs.mjs, src/mcp-runtime.mjs, tests/context-cache.test.mjs, tests/context-session.test.mjs, tests/mcp-runtime.test.mjs, docs/modules/session-owned-plans.md, docs/CONTEXT_DELIVERY.md, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md
- [DONE] T008: Подключить два сценария ручного создания сессии — Завершено
  - Git Commit: [DONE] feat: create sessions from prepared plans or empty scope
  - Reference: session-owned-plans-028 / T008 / implementation
  - Файлы: src/main.mjs, src/preload.cjs, src/workspace-session.mjs, src/session-plans.mjs, tests/workspace-session.test.mjs, .harness/kit/lib/actions.mjs, resources/workflow-kit/lib/actions.mjs, docs/modules/session-owned-plans.md, docs/modules/workspace-sessions.md, docs/CONTEXT_DELIVERY.md, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md
- [DONE] T009: Обновить сайдбар по принятому макету — Завершено
  - Git Commit: [DONE] feat: show session plans and prepared continuations in sidebar
  - Reference: session-owned-plans-028 / T009 / implementation
  - Файлы: src/ui/sidebar.mjs, src/ui/index.html, src/ui/progress.mjs, tests/sidebar.test.mjs, tests/progress.test.mjs, docs/modules/session-owned-plans.md, docs/modules/workspace-sessions.md, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md, docs/design/session-plan-navigation.md
- [TODO] T010: Обновить инструкции агента и шаблоны Workflow Kit — Ожидает
  - Git Commit: [PENDING] docs: align agent instructions and templates with session plans
  - Reference: session-owned-plans-028 / T010 / implementation
  - Файлы: docs/modules/session-owned-plans.md, AGENTS.md, docs/WORKFLOW_START.md, docs/CONTEXT_DELIVERY.md, docs/modules/workflow-kit-recovery.md, .harness/kit/WORKFLOW.md, resources/workflow-kit/WORKFLOW.md, .harness/kit/templates/AGENTS.md, resources/workflow-kit/templates/AGENTS.md, .harness/kit/templates/START.md, resources/workflow-kit/templates/START.md, .harness/kit/templates/PLAN.md, resources/workflow-kit/templates/PLAN.md, .harness/plans/todo-plan.template.md
- [TODO] T011: Согласовать установку, обновление и Doctor с новой моделью — Ожидает
  - Git Commit: [PENDING] fix: migrate workflow installation and doctor for session plans
  - Reference: session-owned-plans-028 / T011 / implementation
  - Файлы: .harness/kit/lib/installer.mjs, resources/workflow-kit/lib/installer.mjs, src/workspace-setup.mjs, src/project-doctor.mjs, tests/workflow-kit-source.test.mjs, .harness/kit/lib/common.mjs, resources/workflow-kit/lib/common.mjs, .harness/kit/lib/installation-files.mjs, resources/workflow-kit/lib/installation-files.mjs, .harness/kit-manifest.json, tests/project-doctor.test.mjs, tests/workspace-setup.test.mjs, docs/modules/session-owned-plans.md, docs/WORKSPACE_SETUP.md, docs/modules/project-doctor.md, docs/modules/workflow-kit-recovery.md, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md
- [TODO] T012: Проверить полный сценарий сессий и продолжения — Ожидает
  - Git Commit: [PENDING] test: verify session plan continuity and manual creation
  - Reference: session-owned-plans-028 / T012 / implementation
  - Файлы: tests/sidebar.test.mjs, tests/electron-smoke.mjs, tests/context-session.test.mjs, tests/session-plans.test.mjs, tests/workflow-kit-recovery.test.mjs, tests/context-cache.test.mjs, tests/workspace-session.test.mjs, docs/modules/session-owned-plans.md, docs/VERIFICATION.md, docs/modules/workspace-sessions.md, docs/CONTEXT_DELIVERY.md
- [TODO] T013: Собрать новый релиз для проверки пользователя — Ожидает
  - Git Commit: [PENDING] build: release session owned plans for user verification
  - Reference: session-owned-plans-028 / T013 / implementation
  - Файлы: package.json, package-lock.json, tests/sidebar.test.mjs, docs/modules/session-owned-plans.md, docs/RELEASE.md, docs/TRANSFER_TO_WINDOWS.md, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md
- [TODO] DOCS: Актуализация всех документов проекта — Ожидает
  - Git Commit: [PENDING] docs: update all project documentation for session plans
  - Reference: session-owned-plans-028 / DOCS / implementation
  - Файлы: docs/modules/session-owned-plans.md, docs/design/session-plan-navigation.md, docs/architecture/OVERVIEW.md, docs/MODULES.md, docs/DOCUMENTATION_INDEX.md, docs/DECISIONS.md, docs/WORKFLOW_START.md, docs/PRODUCT.md, docs/CONTEXT_DELIVERY.md, docs/modules/workspace-sessions.md, docs/modules/workflow-kit-recovery.md, docs/modules/project-doctor.md, docs/PROJECT_ARCHIVE.md, docs/WORKSPACE_SETUP.md, docs/RELEASE.md, docs/TRANSFER_TO_WINDOWS.md, docs/CLEAN_INSTALL.md, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md, README.md, AGENTS.md, .harness/kit/WORKFLOW.md, resources/workflow-kit/WORKFLOW.md, .harness/kit/templates/AGENTS.md, resources/workflow-kit/templates/AGENTS.md, .harness/kit/templates/START.md, resources/workflow-kit/templates/START.md, .harness/kit/templates/PLAN.md, resources/workflow-kit/templates/PLAN.md, .harness/plans/todo-plan.template.md

## Context Pack For This Cycle

- docs/architecture/OVERVIEW.md → Краткая архитектура проекта
- docs/MODULES.md → Модули проекта
- docs/DOCUMENTATION_INDEX.md → Каталог документации
- docs/modules/session-owned-plans.md → Планы сессий и подготовка продолжения
- docs/design/session-plan-navigation.md → Сайдбар планов сессий — принятый пример
- docs/modules/workspace-sessions.md → Module Specification — Workspace & Sessions
- docs/modules/workflow-kit-recovery.md → Module Specification — Workflow Kit / Context Recovery
- docs/RELEASE.md → Выпуск и постоянный путь запуска
- docs/CLEAN_INSTALL.md → Проверка установки на чистых системах

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
