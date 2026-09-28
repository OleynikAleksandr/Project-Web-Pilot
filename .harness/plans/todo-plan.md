# Активный план — Project Web Pilot

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 797,
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
      "src/chatgpt-colors.mjs"
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
      "docs/modules/session-owned-plans.md"
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
        "tests/electron-smoke.mjs"
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
      "expected_commit_message": "feat: События проекта, прогрев контекста и ограниченный опрос буфера"
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
        "T003"
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
        "docs/modules/session-owned-plans.md"
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
Revision: 797

## Цель

Продолжить фазу 2 из 3 по docs/planning/event-driven-runtime.md: файловые события, событийный прогрев, удаление общего пульса 1500 мс и секундного обхода цветов. Сохранить доставку Paste/Send 0.6.72 и ограниченное восстановление разговоров. Перенесены незавершённые T001–T003 и DOCS; реализация сейчас не начинается.

## Критерии приёмки

- Фаза 2 из 3 по docs/planning/event-driven-runtime.md: файловые события, событийный прогрев, удаление общего пульса 1500 мс и секундного обхода цветов; сохранить доставку, разговоры и ограниченное восстановление 0.6.65.

## Микрозадачи

- [TODO] T001: События проекта, прогрев контекста и ограниченный опрос буфера — Ожидает
  - Git Commit: [PENDING] feat: События проекта, прогрев контекста и ограниченный опрос буфера
  - Reference: event-driven-runtime-phase-2-continuation-20260928 / T001 / implementation
  - Файлы: src/plan-monitor.mjs, src/main.mjs, src/context-session.mjs, src/context-cache.mjs, src/context-inputs.mjs, src/tunnel-clipboard.mjs, tests/plan-monitor.test.mjs, tests/context-session.test.mjs, tests/electron-smoke.mjs, docs/planning/event-driven-runtime.md
- [TODO] T002: Перевести вход в аккаунт на события и удалить общий пульс — Ожидает
  - Git Commit: [PENDING] feat: Перевести вход в аккаунт на события и удалить общий пульс
  - Reference: event-driven-runtime-phase-2-continuation-20260928 / T002 / implementation
  - Файлы: src/main.mjs, src/startup-flow.mjs, src/chatgpt-page-observer.mjs, src/page-state.mjs, src/chromium-diagnostics.mjs, tests/electron-smoke.mjs, docs/planning/event-driven-runtime.md
- [TODO] T003: Убрать секундный обход цветов и проверить событийное оформление — Ожидает
  - Git Commit: [PENDING] feat: Убрать секундный обход цветов и проверить событийное оформление
  - Reference: event-driven-runtime-phase-2-continuation-20260928 / T003 / implementation
  - Файлы: src/chatgpt-colors.mjs, tests/electron-smoke.mjs, docs/planning/event-driven-runtime.md, docs/modules/chatgpt-dom-compatibility.md, docs/VERIFICATION.md
- [TODO] DOCS: Актуализация всех документов проекта — Ожидает
  - Git Commit: [PENDING] docs: актуализировать контекст проекта
  - Reference: event-driven-runtime-phase-2-continuation-20260928 / DOCS / implementation
  - Файлы: docs/planning/event-driven-runtime.md, docs/PRODUCT.md, docs/architecture/ARCHITECTURE.md, docs/modules/chatgpt-dom-compatibility.md, docs/VERIFICATION.md, docs/architecture/OVERVIEW.md, docs/MODULES.md, docs/DOCUMENTATION_INDEX.md, README.md, docs/RELEASE.md, docs/CONTEXT_DELIVERY.md, docs/TRANSFER_TO_WINDOWS.md, docs/WORKFLOW_START.md, docs/modules/workspace-sessions.md, docs/modules/workflow-kit-recovery.md, docs/modules/session-owned-plans.md

## Context Pack For This Cycle

- docs/architecture/OVERVIEW.md → Краткая архитектура проекта
- docs/MODULES.md → Модули проекта
- docs/DOCUMENTATION_INDEX.md → Каталог документации
- docs/planning/event-driven-runtime.md

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
