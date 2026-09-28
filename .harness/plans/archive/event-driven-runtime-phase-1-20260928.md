# Активный план — Project Web Pilot

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 764,
  "project_id": "cf944136-d1fc-4bd5-9ea0-e46d1fe230e7",
  "project_name": "Project Web Pilot",
  "scope_id": "event-driven-runtime-phase-1-20260928",
  "execution_scope_status": "ACTIVE",
  "delivery_status": "READY_FOR_ACCEPTANCE",
  "objective": "Фаза 1 из 3 по docs/planning/event-driven-runtime.md: событийное продолжение доставки, секундомер и диагностика; дополнительно — сохранение ручных разговоров, ограниченное восстановление связи и заказанный промежуточный парный выпуск 0.6.64.",
  "acceptance_criteria": [
    "Фаза 1 реализована и проверена без периодической DOM-подстраховки контроллера.",
    "Ручной recovery и обычное ручное первое сообщение сохраняют свой разговор без повторной доставки.",
    "Обрыв распознаётся, попытка восстановления ограничена; черновики и неопределённые отправки защищены.",
    "Выдан промежуточный парный релиз 0.6.64. Фазы 2 и 3 остаются отдельными этапами по docs/planning/event-driven-runtime.md."
  ],
  "approved_scope": {
    "functional_paths": [
      "src/main.mjs",
      "src/chromium-diagnostics.mjs",
      "tests/electron-smoke.mjs",
      "src/plan-monitor.mjs",
      "src/context-session.mjs",
      "src/agent-timer.mjs",
      "src/chatgpt-dom.mjs",
      "src/chatgpt-composer.mjs",
      "src/chatgpt-state-preload.cjs",
      "src/session-plans.mjs",
      "src/workspace-setup.mjs",
      "tests/chromium-diagnostics.test.mjs",
      "tests/event-runtime-baseline.mjs",
      "src/ui/sidebar.mjs",
      "tests/agent-timer.test.mjs",
      "tests/context-session.test.mjs",
      "tests/plan-monitor.test.mjs",
      "package.json",
      "package-lock.json",
      "scripts/check-event-runtime-release.mjs",
      "src/chatgpt-page-observer.mjs",
      "src/page-state.mjs",
      "src/conversation-recovery.mjs",
      "tests/conversation-recovery.test.mjs",
      ".gitignore",
      "src/page-state-bridge.mjs",
      "scripts/stage-page-observer.mjs",
      "tests/page-state.test.mjs",
      "tests/chatgpt-composer.test.mjs",
      "src/workspace-session.mjs",
      "src/preload.cjs",
      "src/ui/index.html",
      "tests/workspace-session.test.mjs",
      "tests/installed-observer-fixture.cjs"
    ],
    "documentation_paths": [
      "docs/planning/event-driven-runtime.md",
      "docs/VERIFICATION.md",
      "docs/modules/workspace-sessions.md",
      "docs/modules/chatgpt-dom-compatibility.md",
      "docs/CONTEXT_DELIVERY.md",
      "docs/PRODUCT.md",
      "docs/architecture/ARCHITECTURE.md",
      "docs/architecture/OVERVIEW.md",
      "docs/MODULES.md",
      "docs/DOCUMENTATION_INDEX.md",
      "docs/RELEASE.md",
      "AGENTS.md",
      "README.md",
      "docs/TRANSFER_TO_WINDOWS.md",
      "docs/WORKFLOW_START.md"
    ]
  },
  "baseline_commit": "e97af3fa61baef8686206a1c18aee6b1a3c237b7",
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
        "scope_id": "event-driven-runtime-phase-1-20260928",
        "task_id": "T001",
        "role": "implementation"
      },
      "dependencies": [],
      "functional_paths": [
        "src/main.mjs",
        "src/chromium-diagnostics.mjs",
        "tests/electron-smoke.mjs",
        "src/session-plans.mjs",
        "src/workspace-setup.mjs",
        "tests/chromium-diagnostics.test.mjs",
        "tests/event-runtime-baseline.mjs"
      ],
      "documentation_paths": [
        "docs/planning/event-driven-runtime.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "unit",
        "smoke"
      ],
      "id": "T001",
      "title": "Измерить исходное состояние и устранить дублирование снимков",
      "why": "Согласованный контракт: docs/planning/event-driven-runtime.md — Фаза 1, задача 1; Baseline и результат.",
      "verification_kind": "code",
      "acceptance_criteria": [
        "Зафиксированы сопоставимые измерения executeJavaScript, запусков worker/Node, IPC, логов и CPU в сценариях простоя, ожидания доставки и потокового ответа; условия и ограничения указаны",
        "publish строит один снимок и отправляет при смысловом изменении; новый и перезагруженный sidebar обязательно получает первоначальный снимок",
        "Одинаковые записи DOM pulse исключены; baseline снят до изменения поведения, без записи содержимого чатов или секретов",
        "Результаты и методика сохранены в docs/VERIFICATION.md; проверены пользовательские входы и существенные регрессии"
      ],
      "expected_commit_message": "feat: Измерить исходное состояние и устранить дублирование снимков",
      "actual_files": [
        "docs/VERIFICATION.md",
        "src/chromium-diagnostics.mjs",
        "src/main.mjs",
        "src/session-plans.mjs",
        "src/workspace-setup.mjs",
        "tests/chromium-diagnostics.test.mjs",
        "tests/electron-smoke.mjs",
        "tests/event-runtime-baseline.mjs"
      ]
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "event-driven-runtime-phase-1-20260928",
        "task_id": "T002",
        "role": "implementation"
      },
      "dependencies": [
        "T001"
      ],
      "functional_paths": [
        "src/plan-monitor.mjs",
        "src/context-session.mjs",
        "src/agent-timer.mjs",
        "tests/electron-smoke.mjs",
        "src/main.mjs",
        "src/ui/sidebar.mjs",
        "tests/agent-timer.test.mjs",
        "tests/context-session.test.mjs",
        "tests/plan-monitor.test.mjs"
      ],
      "documentation_paths": [
        "docs/planning/event-driven-runtime.md",
        "docs/modules/workspace-sessions.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "unit",
        "smoke"
      ],
      "id": "T002",
      "title": "Обеспечить продолжение операций без потери событий и исправить секундомер",
      "why": "Согласованный контракт: docs/planning/event-driven-runtime.md — Фаза 1, задача 2; карта 18 фаз; обработка сигналов; секундомер.",
      "verification_kind": "code",
      "acceptance_criteria": [
        "PlanMonitor и ContextSession сохраняют один выполняемый проход и повтор после сигнала во время обработки; последнее изменение не теряется",
        "Временная ошибка чтения допускает ограниченное восстановление, постоянная ошибка видима; смена поколения и закрытие отменяют устаревшую работу",
        "Секундомер считает время по переходам busy/idle, grace 5 секунд реализован одиночным таймером и не добавляется к конечной длительности",
        "Для 18 фаз определены события, допустимые и запрещённые действия; send-unknown не разрешает автоматическую повторную отправку",
        "Before-Send, сохранение пользовательского черновика и независимость карточки плана сохранены"
      ],
      "expected_commit_message": "feat: Обеспечить продолжение операций без потери событий и исправить секундомер",
      "actual_files": [
        "docs/VERIFICATION.md",
        "src/agent-timer.mjs",
        "src/context-session.mjs",
        "src/main.mjs",
        "src/plan-monitor.mjs",
        "src/ui/sidebar.mjs",
        "tests/agent-timer.test.mjs",
        "tests/context-session.test.mjs",
        "tests/plan-monitor.test.mjs"
      ]
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "event-driven-runtime-phase-1-20260928",
        "task_id": "T003",
        "role": "implementation"
      },
      "dependencies": [
        "T002"
      ],
      "functional_paths": [
        "src/main.mjs",
        "src/chatgpt-dom.mjs",
        "src/chatgpt-composer.mjs",
        "src/context-session.mjs",
        "src/plan-monitor.mjs",
        "src/chromium-diagnostics.mjs",
        "src/agent-timer.mjs",
        "src/chatgpt-state-preload.cjs",
        "tests/electron-smoke.mjs",
        ".gitignore",
        "package.json",
        "src/page-state.mjs",
        "src/page-state-bridge.mjs",
        "src/chatgpt-page-observer.mjs",
        "scripts/stage-page-observer.mjs",
        "tests/page-state.test.mjs",
        "tests/chatgpt-composer.test.mjs",
        "tests/chromium-diagnostics.test.mjs"
      ],
      "documentation_paths": [
        "docs/planning/event-driven-runtime.md",
        "docs/modules/chatgpt-dom-compatibility.md",
        "docs/modules/workspace-sessions.md",
        "docs/CONTEXT_DELIVERY.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "unit",
        "smoke"
      ],
      "id": "T003",
      "title": "Подключить preload и проверить доставку без периодических DOM-опросов",
      "why": "Согласованный контракт: docs/planning/event-driven-runtime.md — Фаза 1, задача 3 и критерий выхода; общий наблюдатель страницы; обязательные сценарии.",
      "verification_kind": "code",
      "acceptance_criteria": [
        "Sandboxed isolated preload включён только для основного ChatGPT view; main проверяет origin, senderFrame, поколение документа и порядок сообщений; popup и сторонние домены исключены",
        "Один канал preload → main передаёт исходное состояние и изменения; draftRevision замечает изменение текста той же длины без хеширования",
        "Число или ревизия текста пользовательских сообщений инициируют inspect({requestId}) ожидающей попытки; позднее появление requestId при прежнем количестве сообщений учтено",
        "Контроллер, секундомер и диагностика используют общий источник; observeAgent 1000 мс и sampleDom 5000 мс удалены в этой задаче",
        "Общий пульс 1500 мс не вызывает controller.tick ради страницы: временно читает PlanMonitor и сигнализирует контроллеру только об изменённом состоянии проекта; одинаковые чтения не двигают доставку",
        "Сценарии страницы проверены на неизменном проекте и без периодической подстраховки; подавление сигнала в fixture не подхватывается пульсом",
        "Работают смена чатов A→B→A, reload, input, Chat/Work, подтверждение отправки и сворачивание; requestAnimationFrame не является обязательным путём логики",
        "Startup-account и clipboard пока ограничены шагом настройки; они не служат обходным механизмом продолжения ContextSession",
        "Реальные Chat/Work, source fixture и неподтверждённые платформенные сценарии различаются в evidence; финальная упаковка относится к фазе 3"
      ],
      "expected_commit_message": "feat: Подключить preload и проверить доставку без периодических DOM-опросов",
      "actual_files": [
        ".gitignore",
        "package.json",
        "src/main.mjs",
        "src/context-session.mjs",
        "src/chatgpt-composer.mjs",
        "src/chromium-diagnostics.mjs",
        "src/page-state.mjs",
        "src/page-state-bridge.mjs",
        "src/chatgpt-page-observer.mjs",
        "scripts/stage-page-observer.mjs",
        "tests/page-state.test.mjs",
        "tests/chatgpt-composer.test.mjs",
        "tests/chromium-diagnostics.test.mjs",
        "tests/electron-smoke.mjs",
        "docs/planning/event-driven-runtime.md",
        "docs/VERIFICATION.md"
      ]
    },
    {
      "id": "T004",
      "title": "Сохранить привязку разговора после ручной отправки и проверить повторное открытие",
      "why": "По docs/planning/event-driven-runtime.md; поручение 28.09: исправление потери привязки и промежуточный парный выпуск до DOCS.",
      "dependencies": [
        "T003"
      ],
      "functional_paths": [
        "src/context-session.mjs",
        "src/chatgpt-composer.mjs",
        "tests/context-session.test.mjs",
        "tests/electron-smoke.mjs"
      ],
      "documentation_paths": [
        "docs/planning/event-driven-runtime.md",
        "docs/CONTEXT_DELIVERY.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "unit",
        "smoke"
      ],
      "verification_kind": "code",
      "acceptance_criteria": [
        "Своя отправленная recovery определяется по requestId даже без sendStartedAtMs; чужой разговор не привязывается",
        "Перезапуск и повторное открытие используют сохранённый URL без новой отправки recovery",
        "Сбой подтверждения не вызывает повторный Send; незавершённые правки T003 сохранены"
      ],
      "expected_commit_message": "feat: Сохранить привязку разговора после ручной отправки и проверить повторное открытие",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "event-driven-runtime-phase-1-20260928",
        "task_id": "T004",
        "role": "implementation"
      },
      "actual_files": [
        "docs/CONTEXT_DELIVERY.md",
        "docs/VERIFICATION.md",
        "src/context-session.mjs",
        "tests/context-session.test.mjs",
        "tests/electron-smoke.mjs"
      ]
    },
    {
      "id": "T005",
      "title": "Собрать и проверить исправленный парный релиз 0.6.64",
      "why": "По docs/planning/event-driven-runtime.md; поручение 28.09: исправление потери привязки и промежуточный парный выпуск до DOCS.",
      "dependencies": [
        "T004"
      ],
      "functional_paths": [
        "package.json",
        "package-lock.json",
        "scripts/check-event-runtime-release.mjs",
        "tests/installed-observer-fixture.cjs"
      ],
      "documentation_paths": [
        "docs/planning/event-driven-runtime.md",
        "docs/RELEASE.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "release-pair"
      ],
      "verification_kind": "installed",
      "acceptance_criteria": [
        "macOS arm64 и Windows x64 одного выпуска совпадают с финальными исходниками",
        "Корневой app и установленная macOS копия обновлены с сохранением Finder identity",
        "Проверки fixture и ограничения реального ChatGPT/Windows описаны явно"
      ],
      "expected_commit_message": "feat: Собрать и проверить исправленный парный релиз 0.6.64",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "event-driven-runtime-phase-1-20260928",
        "task_id": "T005",
        "role": "implementation"
      },
      "actual_files": [
        "package-lock.json",
        "package.json",
        "scripts/check-event-runtime-release.mjs",
        "tests/installed-observer-fixture.cjs"
      ]
    },
    {
      "id": "T006",
      "title": "Распознавать обрыв ответа и безопасно восстанавливать сохранённый разговор",
      "why": "docs/planning/event-driven-runtime.md; скриншот 28.09 15:10: ChatGPT stream recovery polling timed out",
      "dependencies": [
        "T004"
      ],
      "functional_paths": [
        "src/chatgpt-page-observer.mjs",
        "src/page-state.mjs",
        "src/main.mjs",
        "src/conversation-recovery.mjs",
        "src/ui/sidebar.mjs",
        "tests/conversation-recovery.test.mjs",
        "tests/electron-smoke.mjs",
        "src/chatgpt-composer.mjs",
        "src/chatgpt-dom.mjs",
        "src/chromium-diagnostics.mjs",
        "src/context-session.mjs",
        "src/preload.cjs",
        "src/ui/index.html",
        "tests/page-state.test.mjs"
      ],
      "documentation_paths": [
        "docs/planning/event-driven-runtime.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "unit",
        "smoke"
      ],
      "verification_kind": "code",
      "acceptance_criteria": [
        "Распознаётся видимая ошибка восстановления потока; пользователь видит состояние восстановления",
        "Ограниченное повторное открытие только привязанного URL при отсутствии черновика и неопределённой отправки",
        "Нет автоматического повторного Send или клика по кнопке Retry в ответе; 429 не запускает частые повторы",
        "При неудаче доступен явный повтор, смена сессии отменяет отложенную попытку"
      ],
      "expected_commit_message": "feat: Распознавать обрыв ответа и безопасно восстанавливать сохранённый разговор",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "event-driven-runtime-phase-1-20260928",
        "task_id": "T006",
        "role": "implementation"
      },
      "actual_files": [
        "docs/VERIFICATION.md",
        "src/chatgpt-composer.mjs",
        "src/chatgpt-dom.mjs",
        "src/chatgpt-page-observer.mjs",
        "src/chromium-diagnostics.mjs",
        "src/context-session.mjs",
        "src/conversation-recovery.mjs",
        "src/main.mjs",
        "src/page-state.mjs",
        "src/preload.cjs",
        "src/ui/index.html",
        "src/ui/sidebar.mjs",
        "tests/conversation-recovery.test.mjs",
        "tests/electron-smoke.mjs",
        "tests/page-state.test.mjs"
      ]
    },
    {
      "id": "T007",
      "title": "Проверить и исправить автоматическую отправку большого recovery",
      "why": "docs/planning/event-driven-runtime.md; поручение 28.09 о причине ручного Send и росте контекста",
      "dependencies": [
        "T004"
      ],
      "functional_paths": [
        "src/chatgpt-composer.mjs",
        "tests/chatgpt-composer.test.mjs",
        "tests/electron-smoke.mjs"
      ],
      "documentation_paths": [
        "docs/planning/event-driven-runtime.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "unit",
        "smoke"
      ],
      "verification_kind": "code",
      "acceptance_criteria": [
        "Причина остановки на черновике воспроизведена либо явно указана граница диагностики",
        "Большой recovery автоматически отправляется после подтверждённой готовности composer без порчи пользовательских правок",
        "Размер актуального recovery разобран по составляющим; изменение политики объёма не вносится без отдельного обсуждения"
      ],
      "expected_commit_message": "feat: Проверить и исправить автоматическую отправку большого recovery",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "event-driven-runtime-phase-1-20260928",
        "task_id": "T007",
        "role": "implementation"
      },
      "actual_files": [
        "docs/VERIFICATION.md",
        "src/chatgpt-composer.mjs",
        "tests/chatgpt-composer.test.mjs",
        "tests/electron-smoke.mjs"
      ]
    },
    {
      "id": "T008",
      "title": "Сохранить разговор после обычного ручного первого сообщения без ложной доставки контекста",
      "why": "Сохранить разговор после обычного ручного первого сообщения без ложной доставки контекста",
      "dependencies": [
        "T004"
      ],
      "functional_paths": [
        "src/chatgpt-page-observer.mjs",
        "src/page-state.mjs",
        "src/main.mjs",
        "src/context-session.mjs",
        "src/workspace-session.mjs",
        "tests/page-state.test.mjs",
        "tests/context-session.test.mjs",
        "tests/electron-smoke.mjs",
        "src/conversation-recovery.mjs",
        "src/ui/sidebar.mjs",
        "tests/conversation-recovery.test.mjs",
        "tests/workspace-session.test.mjs"
      ],
      "documentation_paths": [
        "docs/planning/event-driven-runtime.md",
        "docs/CONTEXT_DELIVERY.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "unit",
        "smoke"
      ],
      "verification_kind": "code",
      "acceptance_criteria": [
        "Обычный текст вручную создаёт сохранённый разговор, но не подтверждает recovery.",
        "Повторное открытие этого разговора не создаёт новый чат и не отправляет контекст автоматически.",
        "Чужая навигация без подтверждённого ручного Send не привязывается."
      ],
      "expected_commit_message": "feat: Сохранить разговор после обычного ручного первого сообщения без ложной доставки контекста",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "event-driven-runtime-phase-1-20260928",
        "task_id": "T008",
        "role": "implementation"
      },
      "actual_files": [
        "docs/CONTEXT_DELIVERY.md",
        "docs/VERIFICATION.md",
        "docs/planning/event-driven-runtime.md",
        "src/chatgpt-page-observer.mjs",
        "src/context-session.mjs",
        "src/conversation-recovery.mjs",
        "src/main.mjs",
        "src/page-state.mjs",
        "src/ui/sidebar.mjs",
        "src/workspace-session.mjs",
        "tests/context-session.test.mjs",
        "tests/conversation-recovery.test.mjs",
        "tests/electron-smoke.mjs",
        "tests/workspace-session.test.mjs"
      ]
    },
    {
      "id": "T009",
      "title": "Распознать Resume stream unavailable и выпустить 0.6.65 для macOS/Windows",
      "why": "Распознать Resume stream unavailable и выпустить 0.6.65 для macOS/Windows",
      "dependencies": [],
      "functional_paths": [
        "src/chatgpt-dom.mjs",
        "tests/page-state.test.mjs",
        "tests/electron-smoke.mjs",
        "tests/installed-observer-fixture.cjs",
        "scripts/check-event-runtime-release.mjs",
        "package.json",
        "package-lock.json"
      ],
      "documentation_paths": [
        "docs/planning/event-driven-runtime.md"
      ],
      "verification_ids": [
        "unit",
        "smoke",
        "release-pair"
      ],
      "verification_kind": "installed",
      "acceptance_criteria": [
        "Resume stream unavailable в ошибке интерфейса запускает существующее ограниченное восстановление сохранённого разговора без повторного Send; цитаты не запускают восстановление.",
        "Обе платформы 0.6.65 собраны и сверены; корневой app и /Applications обновлены с сохранением identity."
      ],
      "expected_commit_message": "feat: Распознать Resume stream unavailable и выпустить 0.6.65 для macOS/Windows",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "event-driven-runtime-phase-1-20260928",
        "task_id": "T009",
        "role": "implementation"
      },
      "actual_files": [
        "docs/planning/event-driven-runtime.md",
        "package-lock.json",
        "package.json",
        "scripts/check-event-runtime-release.mjs",
        "src/chatgpt-dom.mjs",
        "tests/electron-smoke.mjs",
        "tests/installed-observer-fixture.cjs",
        "tests/page-state.test.mjs"
      ]
    },
    {
      "id": "P001",
      "title": "Зафиксировать завершение фазы 1 и переход к фазе 2",
      "why": "Зафиксировать завершение фазы 1 и переход к фазе 2",
      "dependencies": [],
      "functional_paths": [],
      "documentation_paths": [
        "docs/planning/event-driven-runtime.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [],
      "verification_kind": "code",
      "acceptance_criteria": [
        "Записано наблюдение пользователя о 0.6.65 без объявления воспроизведения всех сетевых сбоев.",
        "Планировочный документ указывает фазу 2 как следующий этап, сохраняет исходный контракт и историю."
      ],
      "expected_commit_message": "feat: Зафиксировать завершение фазы 1 и переход к фазе 2",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "event-driven-runtime-phase-1-20260928",
        "task_id": "P001",
        "role": "implementation"
      },
      "actual_files": [
        "docs/VERIFICATION.md",
        "docs/planning/event-driven-runtime.md"
      ]
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "event-driven-runtime-phase-1-20260928",
        "task_id": "DOCS",
        "role": "implementation",
        "iteration": 3
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
        "P001"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/planning/event-driven-runtime.md",
        "docs/PRODUCT.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md",
        "docs/modules/workspace-sessions.md",
        "docs/modules/chatgpt-dom-compatibility.md",
        "docs/CONTEXT_DELIVERY.md",
        "docs/architecture/OVERVIEW.md",
        "docs/MODULES.md",
        "docs/DOCUMENTATION_INDEX.md",
        "docs/RELEASE.md",
        "AGENTS.md",
        "README.md",
        "docs/TRANSFER_TO_WINDOWS.md",
        "docs/WORKFLOW_START.md"
      ],
      "verification_ids": [],
      "id": "DOCS",
      "title": "Актуализация всех документов проекта",
      "why": "Сохранить актуальный контекст для следующего агента",
      "acceptance_criteria": [
        "Документы соответствуют результату"
      ],
      "expected_commit_message": "docs: актуализировать контекст проекта",
      "actual_files": []
    }
  ],
  "blocked_reason": null,
  "user_decisions": [
    {
      "id": "efd168d0-f8ad-42a5-b900-4db5e0bb6a2a",
      "text": "Пользователь поручил выполнить описанную задачу и план.",
      "recorded_at": "2026-09-28T12:08:55.568Z"
    }
  ]
}
```
<!-- workflow-state:end -->

## Состояние

Execution Scope Status: ACTIVE
Delivery Status: READY_FOR_ACCEPTANCE
Scope: event-driven-runtime-phase-1-20260928
Current Task: нет
Revision: 764

## Цель

Фаза 1 из 3 по docs/planning/event-driven-runtime.md: событийное продолжение доставки, секундомер и диагностика; дополнительно — сохранение ручных разговоров, ограниченное восстановление связи и заказанный промежуточный парный выпуск 0.6.64.

## Критерии приёмки

- Фаза 1 реализована и проверена без периодической DOM-подстраховки контроллера.
- Ручной recovery и обычное ручное первое сообщение сохраняют свой разговор без повторной доставки.
- Обрыв распознаётся, попытка восстановления ограничена; черновики и неопределённые отправки защищены.
- Выдан промежуточный парный релиз 0.6.64. Фазы 2 и 3 остаются отдельными этапами по docs/planning/event-driven-runtime.md.

## Микрозадачи

- [DONE] T001: Измерить исходное состояние и устранить дублирование снимков — Завершено
  - Git Commit: [DONE] feat: Измерить исходное состояние и устранить дублирование снимков
  - Reference: event-driven-runtime-phase-1-20260928 / T001 / implementation
  - Файлы: src/main.mjs, src/chromium-diagnostics.mjs, tests/electron-smoke.mjs, src/session-plans.mjs, src/workspace-setup.mjs, tests/chromium-diagnostics.test.mjs, tests/event-runtime-baseline.mjs, docs/planning/event-driven-runtime.md, docs/VERIFICATION.md
- [DONE] T002: Обеспечить продолжение операций без потери событий и исправить секундомер — Завершено
  - Git Commit: [DONE] feat: Обеспечить продолжение операций без потери событий и исправить секундомер
  - Reference: event-driven-runtime-phase-1-20260928 / T002 / implementation
  - Файлы: src/plan-monitor.mjs, src/context-session.mjs, src/agent-timer.mjs, tests/electron-smoke.mjs, src/main.mjs, src/ui/sidebar.mjs, tests/agent-timer.test.mjs, tests/context-session.test.mjs, tests/plan-monitor.test.mjs, docs/planning/event-driven-runtime.md, docs/modules/workspace-sessions.md, docs/VERIFICATION.md
- [DONE] T003: Подключить preload и проверить доставку без периодических DOM-опросов — Завершено
  - Git Commit: [DONE] feat: Подключить preload и проверить доставку без периодических DOM-опросов
  - Reference: event-driven-runtime-phase-1-20260928 / T003 / implementation
  - Файлы: src/main.mjs, src/chatgpt-dom.mjs, src/chatgpt-composer.mjs, src/context-session.mjs, src/plan-monitor.mjs, src/chromium-diagnostics.mjs, src/agent-timer.mjs, src/chatgpt-state-preload.cjs, tests/electron-smoke.mjs, .gitignore, package.json, src/page-state.mjs, src/page-state-bridge.mjs, src/chatgpt-page-observer.mjs, scripts/stage-page-observer.mjs, tests/page-state.test.mjs, tests/chatgpt-composer.test.mjs, tests/chromium-diagnostics.test.mjs, docs/planning/event-driven-runtime.md, docs/modules/chatgpt-dom-compatibility.md, docs/modules/workspace-sessions.md, docs/CONTEXT_DELIVERY.md, docs/VERIFICATION.md
- [DONE] T004: Сохранить привязку разговора после ручной отправки и проверить повторное открытие — Завершено
  - Git Commit: [DONE] feat: Сохранить привязку разговора после ручной отправки и проверить повторное открытие
  - Reference: event-driven-runtime-phase-1-20260928 / T004 / implementation
  - Файлы: src/context-session.mjs, src/chatgpt-composer.mjs, tests/context-session.test.mjs, tests/electron-smoke.mjs, docs/planning/event-driven-runtime.md, docs/CONTEXT_DELIVERY.md, docs/VERIFICATION.md
- [DONE] T005: Собрать и проверить исправленный парный релиз 0.6.64 — Завершено
  - Git Commit: [DONE] feat: Собрать и проверить исправленный парный релиз 0.6.64
  - Reference: event-driven-runtime-phase-1-20260928 / T005 / implementation
  - Файлы: package.json, package-lock.json, scripts/check-event-runtime-release.mjs, tests/installed-observer-fixture.cjs, docs/planning/event-driven-runtime.md, docs/RELEASE.md, docs/VERIFICATION.md
- [DONE] T006: Распознавать обрыв ответа и безопасно восстанавливать сохранённый разговор — Завершено
  - Git Commit: [DONE] feat: Распознавать обрыв ответа и безопасно восстанавливать сохранённый разговор
  - Reference: event-driven-runtime-phase-1-20260928 / T006 / implementation
  - Файлы: src/chatgpt-page-observer.mjs, src/page-state.mjs, src/main.mjs, src/conversation-recovery.mjs, src/ui/sidebar.mjs, tests/conversation-recovery.test.mjs, tests/electron-smoke.mjs, src/chatgpt-composer.mjs, src/chatgpt-dom.mjs, src/chromium-diagnostics.mjs, src/context-session.mjs, src/preload.cjs, src/ui/index.html, tests/page-state.test.mjs, docs/planning/event-driven-runtime.md, docs/VERIFICATION.md
- [DONE] T007: Проверить и исправить автоматическую отправку большого recovery — Завершено
  - Git Commit: [DONE] feat: Проверить и исправить автоматическую отправку большого recovery
  - Reference: event-driven-runtime-phase-1-20260928 / T007 / implementation
  - Файлы: src/chatgpt-composer.mjs, tests/chatgpt-composer.test.mjs, tests/electron-smoke.mjs, docs/planning/event-driven-runtime.md, docs/VERIFICATION.md
- [DONE] T008: Сохранить разговор после обычного ручного первого сообщения без ложной доставки контекста — Завершено
  - Git Commit: [DONE] feat: Сохранить разговор после обычного ручного первого сообщения без ложной доставки контекста
  - Reference: event-driven-runtime-phase-1-20260928 / T008 / implementation
  - Файлы: src/chatgpt-page-observer.mjs, src/page-state.mjs, src/main.mjs, src/context-session.mjs, src/workspace-session.mjs, tests/page-state.test.mjs, tests/context-session.test.mjs, tests/electron-smoke.mjs, src/conversation-recovery.mjs, src/ui/sidebar.mjs, tests/conversation-recovery.test.mjs, tests/workspace-session.test.mjs, docs/planning/event-driven-runtime.md, docs/CONTEXT_DELIVERY.md, docs/VERIFICATION.md
- [DONE] T009: Распознать Resume stream unavailable и выпустить 0.6.65 для macOS/Windows — Завершено
  - Git Commit: [DONE] feat: Распознать Resume stream unavailable и выпустить 0.6.65 для macOS/Windows
  - Reference: event-driven-runtime-phase-1-20260928 / T009 / implementation
  - Файлы: src/chatgpt-dom.mjs, tests/page-state.test.mjs, tests/electron-smoke.mjs, tests/installed-observer-fixture.cjs, scripts/check-event-runtime-release.mjs, package.json, package-lock.json, docs/planning/event-driven-runtime.md
- [DONE] P001: Зафиксировать завершение фазы 1 и переход к фазе 2 — Завершено
  - Git Commit: [DONE] feat: Зафиксировать завершение фазы 1 и переход к фазе 2
  - Reference: event-driven-runtime-phase-1-20260928 / P001 / implementation
  - Файлы: docs/planning/event-driven-runtime.md, docs/VERIFICATION.md
- [DONE] DOCS: Актуализация всех документов проекта — Завершено
  - Git Commit: [DONE] docs: актуализировать контекст проекта
  - Reference: event-driven-runtime-phase-1-20260928 / DOCS / implementation
  - Файлы: docs/planning/event-driven-runtime.md, docs/PRODUCT.md, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md, docs/modules/workspace-sessions.md, docs/modules/chatgpt-dom-compatibility.md, docs/CONTEXT_DELIVERY.md, docs/architecture/OVERVIEW.md, docs/MODULES.md, docs/DOCUMENTATION_INDEX.md, docs/RELEASE.md, AGENTS.md, README.md, docs/TRANSFER_TO_WINDOWS.md, docs/WORKFLOW_START.md

## Context Pack For This Cycle

- docs/architecture/OVERVIEW.md → Краткая архитектура проекта
- docs/MODULES.md → Модули проекта
- docs/DOCUMENTATION_INDEX.md → Каталог документации
- docs/planning/event-driven-runtime.md

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
