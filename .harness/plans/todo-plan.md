# Активный план — Project Web Pilot

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 813,
  "project_id": "cf944136-d1fc-4bd5-9ea0-e46d1fe230e7",
  "project_name": "Project Web Pilot",
  "scope_id": "event-driven-runtime-phase-2-continuation-20260928",
  "execution_scope_status": "ACTIVE",
  "delivery_status": "IN_PROGRESS",
  "objective": "Продолжить фазу 2 из 3 по docs/planning/event-driven-runtime.md: файловые события, событийный прогрев, удаление общего пульса 1500 мс и секундного обхода цветов. Сохранить доставку Paste/Send 0.6.72 и ограниченное восстановление разговоров. Перенесены незавершённые T001–T003 и DOCS; реализация сейчас не начинается.",
  "acceptance_criteria": [
    "Фаза 2 из 3 по docs/planning/event-driven-runtime.md: файловые события, событийный прогрев, удаление общего пульса 1500 мс и секундного обхода цветов; сохранить доставку, разговоры и ограниченное восстановление 0.6.65."
  ],
  "approved_scope": {
    "functional_paths": [
      "src/plan-monitor.mjs",
      "src/main.mjs",
      "src/context-session.mjs",
      "src/context-cache.mjs",
      "src/context-inputs.mjs",
      "src/tunnel-clipboard.mjs",
      "tests/plan-monitor.test.mjs",
      "tests/context-session.test.mjs",
      "tests/electron-smoke.mjs",
      "src/startup-flow.mjs",
      "src/chatgpt-page-observer.mjs",
      "src/page-state.mjs",
      "src/chromium-diagnostics.mjs",
      "src/chatgpt-colors.mjs",
      "src/project-input-watch.mjs",
      "src/workspace-session.mjs",
      "tests/context-cache.test.mjs",
      "tests/project-input-watch.test.mjs",
      "tests/tunnel-clipboard.test.mjs",
      "src/auto-plan.mjs",
      "src/preload.cjs",
      "src/ui/sidebar.mjs",
      "src/ui/index.html",
      "tests/auto-plan.test.mjs",
      "src/conversation-recovery.mjs",
      "tests/conversation-recovery.test.mjs",
      "package.json",
      "package-lock.json",
      "scripts/check-event-runtime-release.mjs",
      "src/auto-plan-state.mjs",
      "src/chatgpt-composer.mjs",
      "tests/chatgpt-composer.test.mjs",
      "tests/page-state.test.mjs",
      "tests/installed-observer-fixture.cjs"
    ],
    "documentation_paths": [
      "docs/planning/event-driven-runtime.md",
      "docs/modules/chatgpt-dom-compatibility.md",
      "docs/VERIFICATION.md",
      "docs/PRODUCT.md",
      "docs/architecture/ARCHITECTURE.md",
      "docs/architecture/OVERVIEW.md",
      "docs/MODULES.md",
      "docs/DOCUMENTATION_INDEX.md",
      "README.md",
      "docs/RELEASE.md",
      "docs/CONTEXT_DELIVERY.md",
      "docs/TRANSFER_TO_WINDOWS.md",
      "docs/WORKFLOW_START.md",
      "docs/modules/workspace-sessions.md",
      "docs/modules/workflow-kit-recovery.md",
      "docs/modules/session-owned-plans.md",
      "AGENTS.md",
      "docs/planning/auto-plan-continuation.md",
      "docs/DOCUMENTATION_INDEX.history-20260929.md",
      "docs/MODULES.history-20260929.md",
      "docs/architecture/OVERVIEW.history-20260929.md"
    ]
  },
  "baseline_commit": "812f646ba47d4eaed5b5f67cacb9f629007554df",
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
        "path": "docs/planning/event-driven-runtime.md",
        "required": true
      },
      {
        "path": "docs/planning/auto-plan-continuation.md",
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
        "scope_id": "event-driven-runtime-phase-2-continuation-20260928",
        "task_id": "T001",
        "role": "implementation"
      },
      "dependencies": [],
      "functional_paths": [
        "src/plan-monitor.mjs",
        "src/main.mjs",
        "src/context-session.mjs",
        "src/context-cache.mjs",
        "src/context-inputs.mjs",
        "src/tunnel-clipboard.mjs",
        "tests/plan-monitor.test.mjs",
        "tests/context-session.test.mjs",
        "tests/electron-smoke.mjs",
        "src/project-input-watch.mjs",
        "src/workspace-session.mjs",
        "tests/context-cache.test.mjs",
        "tests/project-input-watch.test.mjs",
        "tests/tunnel-clipboard.test.mjs"
      ],
      "documentation_paths": [
        "docs/planning/event-driven-runtime.md"
      ],
      "verification_ids": [
        "unit",
        "smoke"
      ],
      "id": "T001",
      "title": "События проекта, прогрев контекста и ограниченный опрос буфера",
      "why": "Раздел 4 и задача 1 фазы 2 в docs/planning/event-driven-runtime.md. Использовать штатные API и существующие фасады.",
      "verification_kind": "code",
      "acceptance_criteria": [
        "Файловые уведомления инициируют перечитывание плана и используемых вложенных planning/module документов; изменение H1 обновляет карточку без изменения плана. Учитываются существенные launcher/workspace входы readWorkspace.",
        "Атомарный rename, пачки сигналов, событие во время чтения и удаление/возврат каталога не теряются; watcher восстанавливается через доступный родитель, фокус, выбор или явную проверку. Ошибка видима, повторы ограничены; смена workspace освобождает наблюдатели.",
        "Карточка обновляется при отменённом контроллере; активный контроллер переоценивает stale без автоматической пересылки. Полная проверка fingerprint перед Send сохранена, включая ненаблюдаемые входы.",
        "Прогрев вызывается при новой/явно обновлённой доставке и значимых известных изменениях; одинаковые запросы объединяются, завершение async продолжает ожидание без зависимости от следующей DOM-мутации. Нет наблюдения за всем Git-деревом.",
        "Clipboard имеет свой опрос только во время допустимого шага туннеля, включая копирование внутри встроенного браузера; выход со шага/закрытие прекращают опрос."
      ],
      "expected_commit_message": "feat: События проекта, прогрев контекста и ограниченный опрос буфера",
      "actual_files": [
        "src/context-cache.mjs",
        "src/context-session.mjs",
        "src/main.mjs",
        "src/plan-monitor.mjs",
        "src/project-input-watch.mjs",
        "src/tunnel-clipboard.mjs",
        "src/workspace-session.mjs",
        "tests/context-cache.test.mjs",
        "tests/context-session.test.mjs",
        "tests/electron-smoke.mjs",
        "tests/project-input-watch.test.mjs",
        "tests/tunnel-clipboard.test.mjs"
      ]
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "event-driven-runtime-phase-2-continuation-20260928",
        "task_id": "T002",
        "role": "implementation"
      },
      "dependencies": [
        "T001"
      ],
      "functional_paths": [
        "src/main.mjs",
        "src/startup-flow.mjs",
        "src/chatgpt-page-observer.mjs",
        "src/page-state.mjs",
        "src/chromium-diagnostics.mjs",
        "tests/electron-smoke.mjs"
      ],
      "documentation_paths": [
        "docs/planning/event-driven-runtime.md"
      ],
      "verification_ids": [
        "unit",
        "smoke"
      ],
      "id": "T002",
      "title": "Перевести вход в аккаунт на события и удалить общий пульс",
      "why": "Задача 2 фазы 2 и раздел временного проверяющего режима в docs/planning/event-driven-runtime.md.",
      "verification_kind": "code",
      "acceptance_criteria": [
        "Startup-account использует общий наблюдатель и события навигации/явной проверки; вход через popup и возврат со стороннего origin учтены. Отсутствие Login не доказывает вход.",
        "Общий setInterval 1500 мс удалён. Интервалы observeAgent 1000 мс и sampleDom 5000 мс не возвращаются. Git installation и допустимые ограниченные ожидания сохраняются.",
        "Временный opt-in проверяющий механизм только читает; не вызывает controller.tick, warm, Send, запись сессии или исправление проекции. Расхождения учитываются после завершения обработчиков/очередей с проверкой поколения. В обычном режиме диагностический polling выключен.",
        "Сценарии атомарных изменений, ожиданий, A→B→A, reload/sidebar, сворачивания и восстановления выполняются без периодической функциональной подстраховки; подавленный сигнал не исправляется проверяющим механизмом.",
        "Ручной recovery и обычный Send сохраняют свои разговоры; unknown Send не повторяется, обе ошибки потока используют прежний ограниченный reconnect и защиту черновика."
      ],
      "expected_commit_message": "feat: Перевести вход в аккаунт на события и удалить общий пульс"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "event-driven-runtime-phase-2-continuation-20260928",
        "task_id": "T003",
        "role": "implementation"
      },
      "dependencies": [
        "T002"
      ],
      "functional_paths": [
        "src/chatgpt-colors.mjs",
        "tests/electron-smoke.mjs"
      ],
      "documentation_paths": [
        "docs/planning/event-driven-runtime.md",
        "docs/modules/chatgpt-dom-compatibility.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "unit",
        "smoke"
      ],
      "id": "T003",
      "title": "Убрать секундный обход цветов и проверить событийное оформление",
      "why": "Раздел 5 и задача 3 фазы 2 в docs/planning/event-driven-runtime.md.",
      "verification_kind": "code",
      "acceptance_criteria": [
        "Секундный safety interval отсутствует. Существующий childList observer отслеживает замену редактора; apply обновляет ссылки редактора и предков до html. Class/style проверяются по этим ссылкам.",
        "Смена темы, prefers-color-scheme, resize, изменение геометрии/предков и настройки цвета вызывают корректный apply без самовозбуждения от собственных меток.",
        "Оформление Chat/Work проверено в fixture; реальная вёрстка и native Windows отмечаются только по фактической проверке пользователя, без VM/Computer Use.",
        "В установившемся простое нет целевых периодических опросов плана/страницы/прогрева/цветов. Реестр удалённых и сохранённых таймеров передан DOCS; итоговые сопоставимые baseline-замеры и парный релиз остаются фазе 3."
      ],
      "expected_commit_message": "feat: Убрать секундный обход цветов и проверить событийное оформление"
    },
    {
      "id": "T004",
      "title": "Передавать правило делегирования только по прямому поручению пользователя",
      "why": "Прямое поручение пользователя 29.09.2026: запрет codex exec и других модельных агентов должен быть явно доставлен в контексте с исключением для прямого поручения пользователя.",
      "dependencies": [],
      "functional_paths": [
        "src/context-session.mjs",
        "tests/context-session.test.mjs"
      ],
      "documentation_paths": [
        "AGENTS.md",
        "docs/CONTEXT_DELIVERY.md",
        "docs/architecture/OVERVIEW.md"
      ],
      "verification_ids": [
        "unit"
      ],
      "verification_kind": "code",
      "acceptance_criteria": [
        "Первое сообщение любой новой Chat/Work сессии явно запрещает codex exec, запуск других модельных агентов и делегирование им работы, если пользователь прямо этого не попросил.",
        "Обычные локальные инструменты MCP и штатный codex app-server без модельных запросов разрешены; правило не блокирует локальный исполнитель.",
        "AGENTS.md, обязательный recovery OVERVIEW и контракт доставки согласованы; существующие разговоры не получают автоматических сообщений."
      ],
      "expected_commit_message": "feat: Передавать правило делегирования только по прямому поручению пользователя",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "event-driven-runtime-phase-2-continuation-20260928",
        "task_id": "T004",
        "role": "implementation"
      },
      "actual_files": [
        "AGENTS.md",
        "docs/CONTEXT_DELIVERY.md",
        "docs/architecture/OVERVIEW.md",
        "src/context-session.mjs",
        "tests/context-session.test.mjs"
      ]
    },
    {
      "id": "T005",
      "title": "Автовыполнение короткими ответами с учётом частично выполненного плана",
      "why": "Поручение 29.09.2026; модуль Workspace & Sessions, смежный Workflow Kit. Продолжает docs/planning/event-driven-runtime.md; отдельный контракт docs/planning/auto-plan-continuation.md.",
      "dependencies": [],
      "functional_paths": [
        "src/auto-plan.mjs",
        "src/main.mjs",
        "src/chatgpt-page-observer.mjs",
        "src/page-state.mjs",
        "src/preload.cjs",
        "src/ui/sidebar.mjs",
        "src/ui/index.html",
        "src/context-session.mjs",
        "src/workspace-session.mjs",
        "tests/auto-plan.test.mjs",
        "tests/electron-smoke.mjs",
        "src/auto-plan-state.mjs",
        "src/chatgpt-composer.mjs",
        "tests/chatgpt-composer.test.mjs"
      ],
      "documentation_paths": [
        "docs/planning/auto-plan-continuation.md",
        "docs/DOCUMENTATION_INDEX.history-20260929.md",
        "docs/DOCUMENTATION_INDEX.md",
        "docs/MODULES.history-20260929.md",
        "docs/MODULES.md",
        "docs/architecture/OVERVIEW.history-20260929.md",
        "docs/architecture/OVERVIEW.md"
      ],
      "verification_ids": [
        "unit",
        "smoke"
      ],
      "verification_kind": "code",
      "acceptance_criteria": [
        "Явное включение для выбранного разговора и текущего scope; начальный снимок учитывает DONE, TODO и текущую задачу без повторения DONE.",
        "Агенту передано правило заканчивать ответ после одной микрозадачи или сохраняемой промежуточной точки; продолжение после подтверждённого окончания ответа отправляет ровно «Продолжай».",
        "Незавершённый текущий пункт допускает продолжение без нового коммита; все задачи включая DOCS, подтверждённо DONE, запрещают Send.",
        "Ручной Stop, вопрос/ошибка, пользовательский ввод, смена чата/scope и перезапуск приостанавливают режим; один ответ не даёт двойного Send. Подготовленная Git-транзакция не считается выполненным планом."
      ],
      "expected_commit_message": "feat: Автовыполнение короткими ответами с учётом частично выполненного плана",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "event-driven-runtime-phase-2-continuation-20260928",
        "task_id": "T005",
        "role": "implementation"
      },
      "actual_files": [
        "docs/DOCUMENTATION_INDEX.history-20260929.md",
        "docs/DOCUMENTATION_INDEX.md",
        "docs/MODULES.history-20260929.md",
        "docs/MODULES.md",
        "docs/architecture/OVERVIEW.history-20260929.md",
        "docs/architecture/OVERVIEW.md",
        "docs/planning/auto-plan-continuation.md",
        "src/auto-plan-state.mjs",
        "src/auto-plan.mjs",
        "src/chatgpt-composer.mjs",
        "src/chatgpt-page-observer.mjs",
        "src/main.mjs",
        "src/page-state.mjs",
        "src/preload.cjs",
        "src/ui/index.html",
        "src/ui/sidebar.mjs",
        "tests/auto-plan.test.mjs",
        "tests/chatgpt-composer.test.mjs",
        "tests/electron-smoke.mjs"
      ]
    },
    {
      "id": "T006",
      "title": "Диагностика отсутствия продвижения и восстановление разговора без повторного исполнения",
      "why": "Диагностика отсутствия продвижения и восстановление разговора без повторного исполнения",
      "dependencies": [
        "T005"
      ],
      "functional_paths": [
        "src/auto-plan.mjs",
        "src/conversation-recovery.mjs",
        "src/chatgpt-page-observer.mjs",
        "src/chromium-diagnostics.mjs",
        "src/main.mjs",
        "tests/auto-plan.test.mjs",
        "tests/conversation-recovery.test.mjs",
        "tests/electron-smoke.mjs",
        "src/ui/sidebar.mjs",
        "tests/page-state.test.mjs"
      ],
      "documentation_paths": [
        "docs/planning/auto-plan-continuation.md"
      ],
      "verification_ids": [
        "unit",
        "smoke"
      ],
      "verification_kind": "code",
      "acceptance_criteria": [
        "Однократный сторожевой таймаут различает отсутствие новых наблюдаемых данных и доказанную ошибку; анимация сама по себе не считается продвижением.",
        "Диагностика сохраняет переходы busy/Stop/контрольной точки/ошибки без текста сообщений; восстановление ограничено и сохраняет разговор.",
        "После ручного Stop нет автоматического восстановления/Продолжай; при неопределённой отправке или состоянии нет повторного исполнения; черновик и 429 учитываются.",
        "Сценарии проверены в Chat и Work fixtures; отсутствие живого воспроизведения зависания не объявляется исправлением сервера."
      ],
      "expected_commit_message": "feat: Диагностика отсутствия продвижения и восстановление разговора без повторного исполнения",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "event-driven-runtime-phase-2-continuation-20260928",
        "task_id": "T006",
        "role": "implementation"
      },
      "actual_files": [
        "docs/planning/auto-plan-continuation.md",
        "src/auto-plan.mjs",
        "src/chatgpt-page-observer.mjs",
        "src/chromium-diagnostics.mjs",
        "src/conversation-recovery.mjs",
        "src/main.mjs",
        "src/ui/sidebar.mjs",
        "tests/auto-plan.test.mjs",
        "tests/conversation-recovery.test.mjs",
        "tests/electron-smoke.mjs",
        "tests/page-state.test.mjs"
      ]
    },
    {
      "id": "T007",
      "title": "Выпустить macOS/Windows 0.6.73 и обновить документы",
      "why": "Выпустить macOS/Windows 0.6.73 и обновить документы",
      "dependencies": [
        "T005",
        "T006"
      ],
      "functional_paths": [
        "package.json",
        "package-lock.json",
        "scripts/check-event-runtime-release.mjs",
        "tests/installed-observer-fixture.cjs"
      ],
      "documentation_paths": [
        "docs/RELEASE.md",
        "docs/VERIFICATION.md",
        "docs/architecture/OVERVIEW.md",
        "docs/MODULES.md",
        "docs/DOCUMENTATION_INDEX.md",
        "docs/modules/workspace-sessions.md",
        "docs/CONTEXT_DELIVERY.md",
        "README.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/planning/event-driven-runtime.md"
      ],
      "verification_ids": [
        "release-pair"
      ],
      "verification_kind": "installed",
      "acceptance_criteria": [
        "Парный выпуск 0.6.73 доставлен в Downloads/WebPilot-0.6.73; постоянный Mac app и /Applications обновлены с сохранением identity.",
        "Выдаваемые копии совпадают с исходниками, установленный код проходит сценарии частичного/полного плана и отправки Продолжай.",
        "README и контракты отражают включение/паузу/завершение, ограничения живой проверки и оставшиеся T002/T003 текущей фазы; scope не закрывается."
      ],
      "expected_commit_message": "feat: Выпустить macOS/Windows 0.6.73 и обновить документы",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "event-driven-runtime-phase-2-continuation-20260928",
        "task_id": "T007",
        "role": "implementation"
      },
      "actual_files": [
        "README.md",
        "docs/CONTEXT_DELIVERY.md",
        "docs/MODULES.md",
        "docs/RELEASE.md",
        "docs/VERIFICATION.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/architecture/OVERVIEW.md",
        "docs/modules/workspace-sessions.md",
        "docs/planning/event-driven-runtime.md",
        "package-lock.json",
        "package.json",
        "scripts/check-event-runtime-release.mjs",
        "tests/installed-observer-fixture.cjs"
      ]
    },
    {
      "id": "T008",
      "title": "Возобновлять включённое автовыполнение после нового сообщения пользователя",
      "why": "Возобновлять включённое автовыполнение после нового сообщения пользователя",
      "dependencies": [],
      "functional_paths": [
        "src/auto-plan.mjs",
        "src/auto-plan-state.mjs",
        "src/main.mjs",
        "tests/auto-plan.test.mjs",
        "src/chatgpt-page-observer.mjs",
        "src/ui/sidebar.mjs",
        "tests/electron-smoke.mjs"
      ],
      "documentation_paths": [
        "docs/planning/auto-plan-continuation.md"
      ],
      "verification_ids": [
        "unit",
        "smoke"
      ],
      "verification_kind": "code",
      "acceptance_criteria": [
        "Stop и вопрос агента приостанавливают автоматическое продолжение; новое отправленное сообщение пользователя возобновляет ранее включённый режим в том же разговоре без дополнительного Send",
        "Явное выключение режима и смена разговора не возобновляются от сообщения; завершённый план не получает Продолжай",
        "Инструкция разрешает задавать вопросы пользователю; Windows использует комплектный Git"
      ],
      "expected_commit_message": "feat: Возобновлять включённое автовыполнение после нового сообщения пользователя",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "event-driven-runtime-phase-2-continuation-20260928",
        "task_id": "T008",
        "role": "implementation"
      },
      "actual_files": [
        "docs/planning/auto-plan-continuation.md",
        "src/auto-plan-state.mjs",
        "src/auto-plan.mjs",
        "src/chatgpt-page-observer.mjs",
        "src/main.mjs",
        "src/ui/sidebar.mjs",
        "tests/auto-plan.test.mjs",
        "tests/electron-smoke.mjs"
      ]
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "event-driven-runtime-phase-2-continuation-20260928",
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
        "T008"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/planning/event-driven-runtime.md",
        "docs/PRODUCT.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/modules/chatgpt-dom-compatibility.md",
        "docs/VERIFICATION.md",
        "docs/architecture/OVERVIEW.md",
        "docs/MODULES.md",
        "docs/DOCUMENTATION_INDEX.md",
        "README.md",
        "docs/RELEASE.md",
        "docs/CONTEXT_DELIVERY.md",
        "docs/TRANSFER_TO_WINDOWS.md",
        "docs/WORKFLOW_START.md",
        "docs/modules/workspace-sessions.md",
        "docs/modules/workflow-kit-recovery.md",
        "docs/modules/session-owned-plans.md",
        "AGENTS.md",
        "docs/planning/auto-plan-continuation.md",
        "docs/DOCUMENTATION_INDEX.history-20260929.md",
        "docs/MODULES.history-20260929.md",
        "docs/architecture/OVERVIEW.history-20260929.md"
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
      "id": "dd268382-280c-4459-bc93-940c1cda2f11",
      "text": "Пользователь 28.09.2026 прямо поручил закрыть текущий scope и создать новый из незавершённых задач, затем разрешил добавить штатную команду переноса и собрать парный релиз.",
      "recorded_at": "2026-09-28T18:23:05.556Z"
    }
  ],
  "carryover": {
    "from_scope": "event-driven-runtime-phase-2-20260928",
    "source_revision": 795,
    "source_commit": "812f646ba47d4eaed5b5f67cacb9f629007554df",
    "archive_path": ".harness/plans/archive/event-driven-runtime-phase-2-20260928.md",
    "archive_sha256": "888701b9325a3ced29136e764f956257ec0e30655ba4b719d1263b8701ddc11e",
    "task_ids": [
      "T001",
      "T002",
      "T003",
      "DOCS"
    ],
    "completed_dependencies": {
      "T001": [],
      "T002": [],
      "T003": [],
      "DOCS": [
        "T004",
        "T005",
        "T006",
        "T007",
        "T008",
        "T009",
        "T010"
      ]
    }
  }
}
```
<!-- workflow-state:end -->

## Состояние

Execution Scope Status: ACTIVE
Delivery Status: IN_PROGRESS
Scope: event-driven-runtime-phase-2-continuation-20260928
Current Task: нет
Revision: 813

## Цель

Продолжить фазу 2 из 3 по docs/planning/event-driven-runtime.md: файловые события, событийный прогрев, удаление общего пульса 1500 мс и секундного обхода цветов. Сохранить доставку Paste/Send 0.6.72 и ограниченное восстановление разговоров. Перенесены незавершённые T001–T003 и DOCS; реализация сейчас не начинается.

## Критерии приёмки

- Фаза 2 из 3 по docs/planning/event-driven-runtime.md: файловые события, событийный прогрев, удаление общего пульса 1500 мс и секундного обхода цветов; сохранить доставку, разговоры и ограниченное восстановление 0.6.65.

## Микрозадачи

- [DONE] T001: События проекта, прогрев контекста и ограниченный опрос буфера — Завершено
  - Git Commit: [DONE] feat: События проекта, прогрев контекста и ограниченный опрос буфера
  - Reference: event-driven-runtime-phase-2-continuation-20260928 / T001 / implementation
  - Файлы: src/plan-monitor.mjs, src/main.mjs, src/context-session.mjs, src/context-cache.mjs, src/context-inputs.mjs, src/tunnel-clipboard.mjs, tests/plan-monitor.test.mjs, tests/context-session.test.mjs, tests/electron-smoke.mjs, src/project-input-watch.mjs, src/workspace-session.mjs, tests/context-cache.test.mjs, tests/project-input-watch.test.mjs, tests/tunnel-clipboard.test.mjs, docs/planning/event-driven-runtime.md
- [TODO] T002: Перевести вход в аккаунт на события и удалить общий пульс — Ожидает
  - Git Commit: [PENDING] feat: Перевести вход в аккаунт на события и удалить общий пульс
  - Reference: event-driven-runtime-phase-2-continuation-20260928 / T002 / implementation
  - Файлы: src/main.mjs, src/startup-flow.mjs, src/chatgpt-page-observer.mjs, src/page-state.mjs, src/chromium-diagnostics.mjs, tests/electron-smoke.mjs, docs/planning/event-driven-runtime.md
- [TODO] T003: Убрать секундный обход цветов и проверить событийное оформление — Ожидает
  - Git Commit: [PENDING] feat: Убрать секундный обход цветов и проверить событийное оформление
  - Reference: event-driven-runtime-phase-2-continuation-20260928 / T003 / implementation
  - Файлы: src/chatgpt-colors.mjs, tests/electron-smoke.mjs, docs/planning/event-driven-runtime.md, docs/modules/chatgpt-dom-compatibility.md, docs/VERIFICATION.md
- [DONE] T004: Передавать правило делегирования только по прямому поручению пользователя — Завершено
  - Git Commit: [DONE] feat: Передавать правило делегирования только по прямому поручению пользователя
  - Reference: event-driven-runtime-phase-2-continuation-20260928 / T004 / implementation
  - Файлы: src/context-session.mjs, tests/context-session.test.mjs, AGENTS.md, docs/CONTEXT_DELIVERY.md, docs/architecture/OVERVIEW.md
- [DONE] T005: Автовыполнение короткими ответами с учётом частично выполненного плана — Завершено
  - Git Commit: [DONE] feat: Автовыполнение короткими ответами с учётом частично выполненного плана
  - Reference: event-driven-runtime-phase-2-continuation-20260928 / T005 / implementation
  - Файлы: src/auto-plan.mjs, src/main.mjs, src/chatgpt-page-observer.mjs, src/page-state.mjs, src/preload.cjs, src/ui/sidebar.mjs, src/ui/index.html, src/context-session.mjs, src/workspace-session.mjs, tests/auto-plan.test.mjs, tests/electron-smoke.mjs, src/auto-plan-state.mjs, src/chatgpt-composer.mjs, tests/chatgpt-composer.test.mjs, docs/planning/auto-plan-continuation.md, docs/DOCUMENTATION_INDEX.history-20260929.md, docs/DOCUMENTATION_INDEX.md, docs/MODULES.history-20260929.md, docs/MODULES.md, docs/architecture/OVERVIEW.history-20260929.md, docs/architecture/OVERVIEW.md
- [DONE] T006: Диагностика отсутствия продвижения и восстановление разговора без повторного исполнения — Завершено
  - Git Commit: [DONE] feat: Диагностика отсутствия продвижения и восстановление разговора без повторного исполнения
  - Reference: event-driven-runtime-phase-2-continuation-20260928 / T006 / implementation
  - Файлы: src/auto-plan.mjs, src/conversation-recovery.mjs, src/chatgpt-page-observer.mjs, src/chromium-diagnostics.mjs, src/main.mjs, tests/auto-plan.test.mjs, tests/conversation-recovery.test.mjs, tests/electron-smoke.mjs, src/ui/sidebar.mjs, tests/page-state.test.mjs, docs/planning/auto-plan-continuation.md
- [DONE] T007: Выпустить macOS/Windows 0.6.73 и обновить документы — Завершено
  - Git Commit: [DONE] feat: Выпустить macOS/Windows 0.6.73 и обновить документы
  - Reference: event-driven-runtime-phase-2-continuation-20260928 / T007 / implementation
  - Файлы: package.json, package-lock.json, scripts/check-event-runtime-release.mjs, tests/installed-observer-fixture.cjs, docs/RELEASE.md, docs/VERIFICATION.md, docs/architecture/OVERVIEW.md, docs/MODULES.md, docs/DOCUMENTATION_INDEX.md, docs/modules/workspace-sessions.md, docs/CONTEXT_DELIVERY.md, README.md, docs/architecture/ARCHITECTURE.md, docs/planning/event-driven-runtime.md
- [DONE] T008: Возобновлять включённое автовыполнение после нового сообщения пользователя — Завершено
  - Git Commit: [DONE] feat: Возобновлять включённое автовыполнение после нового сообщения пользователя
  - Reference: event-driven-runtime-phase-2-continuation-20260928 / T008 / implementation
  - Файлы: src/auto-plan.mjs, src/auto-plan-state.mjs, src/main.mjs, tests/auto-plan.test.mjs, src/chatgpt-page-observer.mjs, src/ui/sidebar.mjs, tests/electron-smoke.mjs, docs/planning/auto-plan-continuation.md
- [TODO] DOCS: Актуализация всех документов проекта — Ожидает
  - Git Commit: [PENDING] docs: актуализировать контекст проекта
  - Reference: event-driven-runtime-phase-2-continuation-20260928 / DOCS / implementation
  - Файлы: docs/planning/event-driven-runtime.md, docs/PRODUCT.md, docs/architecture/ARCHITECTURE.md, docs/modules/chatgpt-dom-compatibility.md, docs/VERIFICATION.md, docs/architecture/OVERVIEW.md, docs/MODULES.md, docs/DOCUMENTATION_INDEX.md, README.md, docs/RELEASE.md, docs/CONTEXT_DELIVERY.md, docs/TRANSFER_TO_WINDOWS.md, docs/WORKFLOW_START.md, docs/modules/workspace-sessions.md, docs/modules/workflow-kit-recovery.md, docs/modules/session-owned-plans.md, AGENTS.md, docs/planning/auto-plan-continuation.md, docs/DOCUMENTATION_INDEX.history-20260929.md, docs/MODULES.history-20260929.md, docs/architecture/OVERVIEW.history-20260929.md

## Context Pack For This Cycle

- docs/architecture/OVERVIEW.md → Краткая архитектура проекта
- docs/MODULES.md → Модули проекта
- docs/DOCUMENTATION_INDEX.md → Каталог документации
- docs/planning/event-driven-runtime.md
- docs/planning/auto-plan-continuation.md

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
