# Активный план — Project Web Pilot

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 731,
  "project_id": "cf944136-d1fc-4bd5-9ea0-e46d1fe230e7",
  "project_name": "Project Web Pilot",
  "scope_id": "event-driven-runtime-phase-1-20260928",
  "execution_scope_status": "ACTIVE",
  "delivery_status": "IN_PROGRESS",
  "objective": "Фаза 1 из 3: основа и общий наблюдатель страницы по docs/planning/event-driven-runtime.md. Получить событийное продолжение доставки, секундомер и диагностику без периодической DOM-подстраховки контроллера; парный релиз запланирован после фазы 3.",
  "acceptance_criteria": [
    "Фаза 1 из 3: основа и общий наблюдатель страницы по docs/planning/event-driven-runtime.md. Получить событийное продолжение доставки, секундомер и диагностику без периодической DOM-подстраховки контроллера; парный релиз запланирован после фазы 3."
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
      "tests/event-runtime-baseline.mjs"
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
      "docs/DOCUMENTATION_INDEX.md"
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
      "implementation_status": "TODO",
      "commit_status": "PENDING",
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
        "tests/electron-smoke.mjs"
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
      "expected_commit_message": "feat: Обеспечить продолжение операций без потери событий и исправить секундомер"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
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
        "tests/electron-smoke.mjs"
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
      "expected_commit_message": "feat: Подключить preload и проверить доставку без периодических DOM-опросов"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "event-driven-runtime-phase-1-20260928",
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
        "docs/VERIFICATION.md",
        "docs/modules/workspace-sessions.md",
        "docs/modules/chatgpt-dom-compatibility.md",
        "docs/CONTEXT_DELIVERY.md",
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
Delivery Status: IN_PROGRESS
Scope: event-driven-runtime-phase-1-20260928
Current Task: нет
Revision: 731

## Цель

Фаза 1 из 3: основа и общий наблюдатель страницы по docs/planning/event-driven-runtime.md. Получить событийное продолжение доставки, секундомер и диагностику без периодической DOM-подстраховки контроллера; парный релиз запланирован после фазы 3.

## Критерии приёмки

- Фаза 1 из 3: основа и общий наблюдатель страницы по docs/planning/event-driven-runtime.md. Получить событийное продолжение доставки, секундомер и диагностику без периодической DOM-подстраховки контроллера; парный релиз запланирован после фазы 3.

## Микрозадачи

- [DONE] T001: Измерить исходное состояние и устранить дублирование снимков — Завершено
  - Git Commit: [DONE] feat: Измерить исходное состояние и устранить дублирование снимков
  - Reference: event-driven-runtime-phase-1-20260928 / T001 / implementation
  - Файлы: src/main.mjs, src/chromium-diagnostics.mjs, tests/electron-smoke.mjs, src/session-plans.mjs, src/workspace-setup.mjs, tests/chromium-diagnostics.test.mjs, tests/event-runtime-baseline.mjs, docs/planning/event-driven-runtime.md, docs/VERIFICATION.md
- [TODO] T002: Обеспечить продолжение операций без потери событий и исправить секундомер — Ожидает
  - Git Commit: [PENDING] feat: Обеспечить продолжение операций без потери событий и исправить секундомер
  - Reference: event-driven-runtime-phase-1-20260928 / T002 / implementation
  - Файлы: src/plan-monitor.mjs, src/context-session.mjs, src/agent-timer.mjs, tests/electron-smoke.mjs, docs/planning/event-driven-runtime.md, docs/modules/workspace-sessions.md, docs/VERIFICATION.md
- [TODO] T003: Подключить preload и проверить доставку без периодических DOM-опросов — Ожидает
  - Git Commit: [PENDING] feat: Подключить preload и проверить доставку без периодических DOM-опросов
  - Reference: event-driven-runtime-phase-1-20260928 / T003 / implementation
  - Файлы: src/main.mjs, src/chatgpt-dom.mjs, src/chatgpt-composer.mjs, src/context-session.mjs, src/plan-monitor.mjs, src/chromium-diagnostics.mjs, src/agent-timer.mjs, src/chatgpt-state-preload.cjs, tests/electron-smoke.mjs, docs/planning/event-driven-runtime.md, docs/modules/chatgpt-dom-compatibility.md, docs/modules/workspace-sessions.md, docs/CONTEXT_DELIVERY.md, docs/VERIFICATION.md
- [TODO] DOCS: Актуализация всех документов проекта — Ожидает
  - Git Commit: [PENDING] docs: актуализировать контекст проекта
  - Reference: event-driven-runtime-phase-1-20260928 / DOCS / implementation
  - Файлы: docs/planning/event-driven-runtime.md, docs/PRODUCT.md, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md, docs/modules/workspace-sessions.md, docs/modules/chatgpt-dom-compatibility.md, docs/CONTEXT_DELIVERY.md, docs/architecture/OVERVIEW.md, docs/MODULES.md, docs/DOCUMENTATION_INDEX.md

## Context Pack For This Cycle

- docs/architecture/OVERVIEW.md → Краткая архитектура проекта
- docs/MODULES.md → Модули проекта
- docs/DOCUMENTATION_INDEX.md → Каталог документации
- docs/planning/event-driven-runtime.md

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
