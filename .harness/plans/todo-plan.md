# Активный план — Project Web Pilot

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 339,
  "project_id": "cf944136-d1fc-4bd5-9ea0-e46d1fe230e7",
  "project_name": "Project Web Pilot",
  "scope_id": "next-modifications-discussion-012",
  "execution_scope_status": "ACTIVE",
  "delivery_status": "IN_PROGRESS",
  "objective": "Оценка токенов сессий и существенное ускорение повторной передачи полного актуального контекста через предварительную подготовку.",
  "acceptance_criteria": [
    "Отдельная сохраняемая оценка для каждой Chat/Work сессии обновляется при чтении сообщений.",
    "Счётчик расположен справа снизу; повторное отображение одного сообщения не увеличивает сумму.",
    "Показания явно являются оценкой доступного текста; пользователь проверяет их на реальном ChatGPT.",
    "Готовый пакет переиспользуется только после проверки исходных данных; изменения Git, плана, документов и evidence инвалидируют кэш.",
    "Замер одинакового пакета показывает более чем двукратное ускорение подготовки при попадании в кэш; время страницы/ответа ChatGPT учитывается отдельно.",
    "Обновлены macOS/Windows packages для пользовательской приёмки."
  ],
  "approved_scope": {
    "functional_paths": [
      "src/session-tokens.mjs",
      "src/workspace-session.mjs",
      "package.json",
      "package-lock.json",
      "tests/session-tokens.test.mjs",
      "src/main.mjs",
      "src/ui/sidebar.mjs",
      "src/ui/index.html",
      "tests/electron-smoke.mjs",
      "src/context-inputs.mjs",
      "src/context-cache.mjs",
      "tests/context-cache.test.mjs",
      "src/context-session.mjs",
      "tests/context-session.test.mjs",
      "src/ui/progress.mjs",
      "src/ui/archive.mjs",
      "src/ui/archive.html",
      "tests/progress.test.mjs"
    ],
    "documentation_paths": [
      "docs/DECISIONS.md",
      "docs/modules/workspace-sessions.md",
      "docs/architecture/ARCHITECTURE.md",
      "docs/VERIFICATION.md",
      "docs/WORKFLOW_START.md",
      "docs/modules/workflow-kit-recovery.md",
      "docs/CONTEXT_DELIVERY.md"
    ],
    "max_functional_files_per_task": 3
  },
  "baseline_commit": "50b1651b0d6cd73865f7d249514ce125d2bd9cf9",
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
        "docs/DECISIONS.md",
        "docs/modules/workspace-sessions.md"
      ],
      "verification_ids": [],
      "id": "T001",
      "title": "Зафиксировать согласованный счётчик токенов сессии",
      "why": "Зафиксировать пользовательский результат и границы следующего изменения перед подготовкой задач реализации.",
      "acceptance_criteria": [
        "Получено конкретное поручение пользователя о следующей модификации.",
        "Согласованные результат, границы, критерии приёмки и модуль-владелец записаны в решениях проекта."
      ],
      "expected_commit_message": "docs: согласовать следующую модификацию Web Pilot",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "next-modifications-discussion-012",
        "task_id": "T001",
        "role": "implementation"
      }
    },
    {
      "id": "T002",
      "title": "Добавить tiktoken, подсчёт и сохранение оценки по сессиям",
      "why": "Выполнить согласованный счётчик токенов в Workspace & Sessions.",
      "dependencies": [
        "T001"
      ],
      "functional_paths": [
        "src/session-tokens.mjs",
        "src/workspace-session.mjs",
        "package.json",
        "package-lock.json",
        "tests/session-tokens.test.mjs"
      ],
      "documentation_paths": [
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md",
        "docs/modules/workspace-sessions.md"
      ],
      "verification_ids": [
        "syntax",
        "suite"
      ],
      "acceptance_criteria": [
        "Текст считается локально через js-tiktoken/o200k_base; повторное наблюдение и streaming не дублируют сообщение.",
        "Оценка сохраняется по sessionId, переживает restart и не переносится между разговорами.",
        "Неизвестное количество отличается от нуля; текст сообщений не сохраняется счётчиком."
      ],
      "expected_commit_message": "feat: считать и сохранять токены сессий через tiktoken",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "next-modifications-discussion-012",
        "task_id": "T002",
        "role": "implementation"
      },
      "file_limit_exception": "Единая интеграция счётчика и его обязательных dependency/test файлов; изменение принадлежит Workspace & Sessions."
    },
    {
      "id": "T003",
      "title": "Подключить счётчик к открытому чату и нижнему правому углу сессии",
      "why": "Выполнить согласованный счётчик токенов в Workspace & Sessions.",
      "dependencies": [
        "T002"
      ],
      "functional_paths": [
        "src/main.mjs",
        "src/ui/sidebar.mjs",
        "src/ui/index.html",
        "tests/electron-smoke.mjs"
      ],
      "documentation_paths": [
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md",
        "docs/modules/workspace-sessions.md"
      ],
      "verification_ids": [
        "syntax",
        "suite",
        "electron-smoke"
      ],
      "acceptance_criteria": [
        "Плашка показывает ≈ N ток. справа снизу и поясняет границы оценки.",
        "Смена сессии и чужой conversation URL не загрязняют сохранённые значения.",
        "Electron smoke подтверждает обновление, изоляцию сессий и размещение счётчика."
      ],
      "expected_commit_message": "feat: показывать оценку токенов в строках сессий",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "next-modifications-discussion-012",
        "task_id": "T003",
        "role": "implementation"
      },
      "file_limit_exception": "Единая интеграция счётчика и его обязательных dependency/test файлов; изменение принадлежит Workspace & Sessions."
    },
    {
      "id": "T004",
      "title": "Собрать обновление приложения для проверки пользователем",
      "why": "Выполнить согласованный счётчик токенов в Workspace & Sessions.",
      "dependencies": [
        "T003"
      ],
      "functional_paths": [
        "package.json",
        "package-lock.json"
      ],
      "documentation_paths": [
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md",
        "docs/WORKFLOW_START.md",
        "docs/modules/workspace-sessions.md"
      ],
      "verification_ids": [
        "syntax",
        "suite",
        "electron-smoke"
      ],
      "acceptance_criteria": [
        "macOS arm64 и Windows x64 packages пересобраны и содержат tiktoken и счётчик.",
        "Версия и результат проверок зафиксированы; финальная оценка показаний остаётся пользователю."
      ],
      "expected_commit_message": "chore: собрать Web Pilot 0.6.9 со счётчиком токенов",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "next-modifications-discussion-012",
        "task_id": "T004",
        "role": "implementation"
      }
    },
    {
      "id": "T005",
      "title": "Зафиксировать анализ и контракт предварительной подготовки контекста",
      "why": "Ускорить повторную передачу полного актуального контекста по поручению пользователя 15.09.2026.",
      "dependencies": [],
      "functional_paths": [],
      "documentation_paths": [
        "docs/modules/workflow-kit-recovery.md",
        "docs/CONTEXT_DELIVERY.md",
        "docs/DECISIONS.md"
      ],
      "verification_ids": [],
      "acceptance_criteria": [
        "Актуальность и полнота канонического пакета сохранены; результат проверен."
      ],
      "expected_commit_message": "docs: согласовать ускорение подготовки контекста",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "next-modifications-discussion-012",
        "task_id": "T005",
        "role": "implementation"
      }
    },
    {
      "id": "T006",
      "title": "Добавить проверяемый кэш полного recovery packet",
      "why": "Ускорить повторную передачу полного актуального контекста по поручению пользователя 15.09.2026.",
      "dependencies": [
        "T005"
      ],
      "functional_paths": [
        "src/context-inputs.mjs",
        "src/context-cache.mjs",
        "tests/context-cache.test.mjs"
      ],
      "documentation_paths": [
        "docs/modules/workflow-kit-recovery.md",
        "docs/CONTEXT_DELIVERY.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "suite"
      ],
      "acceptance_criteria": [
        "Актуальность и полнота канонического пакета сохранены; результат проверен."
      ],
      "expected_commit_message": "feat: заранее готовить актуальный recovery packet",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "next-modifications-discussion-012",
        "task_id": "T006",
        "role": "implementation"
      }
    },
    {
      "id": "T007",
      "title": "Подключить прогрев и проверку перед отправкой",
      "why": "Ускорить повторную передачу полного актуального контекста по поручению пользователя 15.09.2026.",
      "dependencies": [
        "T006"
      ],
      "functional_paths": [
        "src/main.mjs",
        "src/context-session.mjs",
        "src/ui/sidebar.mjs",
        "tests/context-session.test.mjs",
        "tests/electron-smoke.mjs",
        "src/context-cache.mjs",
        "src/context-inputs.mjs"
      ],
      "documentation_paths": [
        "docs/modules/workflow-kit-recovery.md",
        "docs/CONTEXT_DELIVERY.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "suite",
        "electron-smoke"
      ],
      "acceptance_criteria": [
        "Актуальность и полнота канонического пакета сохранены; результат проверен."
      ],
      "expected_commit_message": "feat: использовать подготовленный контекст при отправке",
      "file_limit_exception": "Интеграция одного recovery cache в координатор, интерфейс и обязательные regression tests.",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "next-modifications-discussion-012",
        "task_id": "T007",
        "role": "implementation"
      }
    },
    {
      "id": "T008",
      "title": "Показать выполнение операций спиннерами и понятными этапами",
      "why": "Пользователь отдельно поручил показывать выполнение процессов 15.09.2026.",
      "dependencies": [
        "T007"
      ],
      "functional_paths": [
        "src/ui/progress.mjs",
        "src/ui/sidebar.mjs",
        "src/ui/index.html",
        "src/ui/archive.mjs",
        "src/ui/archive.html",
        "tests/progress.test.mjs",
        "tests/electron-smoke.mjs",
        "src/main.mjs",
        "src/context-cache.mjs"
      ],
      "documentation_paths": [
        "docs/CONTEXT_DELIVERY.md",
        "docs/modules/workspace-sessions.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "suite",
        "electron-smoke"
      ],
      "acceptance_criteria": [
        "Спиннер и название действия видны во время операций приложения, включая setup/archive.",
        "Ошибки и ожидание пользователя не отображаются как бесконечное выполнение; reduced motion поддержан."
      ],
      "expected_commit_message": "feat: показывать ход операций приложения",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "next-modifications-discussion-012",
        "task_id": "T008",
        "role": "implementation"
      },
      "file_limit_exception": "Единый UI-индикатор в двух renderer views, CSS и regression tests; без изменения бизнес-операций."
    },
    {
      "id": "T009",
      "title": "Измерить ускорение и собрать релиз 0.6.10",
      "why": "Ускорить повторную передачу полного актуального контекста по поручению пользователя 15.09.2026.",
      "dependencies": [
        "T008"
      ],
      "functional_paths": [
        "package.json",
        "package-lock.json"
      ],
      "documentation_paths": [
        "docs/modules/workflow-kit-recovery.md",
        "docs/CONTEXT_DELIVERY.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md",
        "docs/WORKFLOW_START.md"
      ],
      "verification_ids": [
        "suite",
        "electron-smoke"
      ],
      "acceptance_criteria": [
        "Актуальность и полнота канонического пакета сохранены; результат проверен."
      ],
      "expected_commit_message": "chore: собрать Web Pilot 0.6.10 с быстрым recovery",
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "next-modifications-discussion-012",
        "task_id": "T009",
        "role": "implementation"
      }
    }
  ],
  "blocked_reason": null,
  "user_decisions": [
    {
      "id": "0241327a-8ae7-4fe3-be7d-2b41db785ea2",
      "text": "14.09.2026 пользователь: «Хорошо, отлично. В принципе можно план данный закрыть и открыть новый для дальнейших модификаций и обсуждений». Предыдущий план workspace-chat-work-sessions-011 закрыт как принятый; новый план открыт для обсуждения. Содержание следующего функционального изменения будет определено следующим поручением пользователя.",
      "recorded_at": "2026-09-14T18:24:17.336Z"
    },
    {
      "id": "session-tiktoken-20260914",
      "text": "Пользователь поручил интегрировать tiktoken и показывать израсходованные токены справа внизу плашки сессии; пользователь сам сравнит показания с реальным контекстным окном. Реализация и локальная сборка для проверки авторизованы. Считаем доступный текст сообщений, отображаем оценку, без процента окна и без изменения Recovery."
    },
    {
      "id": "context-prewarm-20260915",
      "text": "15.09.2026 пользователь поручил проанализировать ускорение передачи контекста более чем вдвое, формировать и хранить его заранее во время работы, реализовать и собрать новый релиз для тестов. Разрешён кэш полного канонического пакета с обязательной проверкой актуальности; содержание и защиты доставки сохраняются."
    },
    {
      "id": "operation-spinners-20260915",
      "text": "Пользователь дополнительно поручил сделать спиннеры выполнения процессов, чтобы было видно, что приложение работает. Включено в текущий релиз."
    }
  ]
}
```
<!-- workflow-state:end -->

## Состояние

Execution Scope Status: ACTIVE
Delivery Status: IN_PROGRESS
Scope: next-modifications-discussion-012
Current Task: нет
Revision: 339

## Цель

Оценка токенов сессий и существенное ускорение повторной передачи полного актуального контекста через предварительную подготовку.

## Критерии приёмки

- Отдельная сохраняемая оценка для каждой Chat/Work сессии обновляется при чтении сообщений.
- Счётчик расположен справа снизу; повторное отображение одного сообщения не увеличивает сумму.
- Показания явно являются оценкой доступного текста; пользователь проверяет их на реальном ChatGPT.
- Готовый пакет переиспользуется только после проверки исходных данных; изменения Git, плана, документов и evidence инвалидируют кэш.
- Замер одинакового пакета показывает более чем двукратное ускорение подготовки при попадании в кэш; время страницы/ответа ChatGPT учитывается отдельно.
- Обновлены macOS/Windows packages для пользовательской приёмки.

## Микрозадачи

- [DONE] T001: Зафиксировать согласованный счётчик токенов сессии — Завершено
  - Git Commit: [DONE] docs: согласовать следующую модификацию Web Pilot
  - Reference: next-modifications-discussion-012 / T001 / implementation
  - Файлы: docs/DECISIONS.md, docs/modules/workspace-sessions.md
- [DONE] T002: Добавить tiktoken, подсчёт и сохранение оценки по сессиям — Завершено
  - Git Commit: [DONE] feat: считать и сохранять токены сессий через tiktoken
  - Reference: next-modifications-discussion-012 / T002 / implementation
  - Файлы: src/session-tokens.mjs, src/workspace-session.mjs, package.json, package-lock.json, tests/session-tokens.test.mjs, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md, docs/modules/workspace-sessions.md
- [DONE] T003: Подключить счётчик к открытому чату и нижнему правому углу сессии — Завершено
  - Git Commit: [DONE] feat: показывать оценку токенов в строках сессий
  - Reference: next-modifications-discussion-012 / T003 / implementation
  - Файлы: src/main.mjs, src/ui/sidebar.mjs, src/ui/index.html, tests/electron-smoke.mjs, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md, docs/modules/workspace-sessions.md
- [DONE] T004: Собрать обновление приложения для проверки пользователем — Завершено
  - Git Commit: [DONE] chore: собрать Web Pilot 0.6.9 со счётчиком токенов
  - Reference: next-modifications-discussion-012 / T004 / implementation
  - Файлы: package.json, package-lock.json, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md, docs/WORKFLOW_START.md, docs/modules/workspace-sessions.md
- [DONE] T005: Зафиксировать анализ и контракт предварительной подготовки контекста — Завершено
  - Git Commit: [DONE] docs: согласовать ускорение подготовки контекста
  - Reference: next-modifications-discussion-012 / T005 / implementation
  - Файлы: docs/modules/workflow-kit-recovery.md, docs/CONTEXT_DELIVERY.md, docs/DECISIONS.md
- [DONE] T006: Добавить проверяемый кэш полного recovery packet — Завершено
  - Git Commit: [DONE] feat: заранее готовить актуальный recovery packet
  - Reference: next-modifications-discussion-012 / T006 / implementation
  - Файлы: src/context-inputs.mjs, src/context-cache.mjs, tests/context-cache.test.mjs, docs/modules/workflow-kit-recovery.md, docs/CONTEXT_DELIVERY.md, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md
- [DONE] T007: Подключить прогрев и проверку перед отправкой — Завершено
  - Git Commit: [DONE] feat: использовать подготовленный контекст при отправке
  - Reference: next-modifications-discussion-012 / T007 / implementation
  - Файлы: src/main.mjs, src/context-session.mjs, src/ui/sidebar.mjs, tests/context-session.test.mjs, tests/electron-smoke.mjs, src/context-cache.mjs, src/context-inputs.mjs, docs/modules/workflow-kit-recovery.md, docs/CONTEXT_DELIVERY.md, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md
- [DONE] T008: Показать выполнение операций спиннерами и понятными этапами — Завершено
  - Git Commit: [DONE] feat: показывать ход операций приложения
  - Reference: next-modifications-discussion-012 / T008 / implementation
  - Файлы: src/ui/progress.mjs, src/ui/sidebar.mjs, src/ui/index.html, src/ui/archive.mjs, src/ui/archive.html, tests/progress.test.mjs, tests/electron-smoke.mjs, src/main.mjs, src/context-cache.mjs, docs/CONTEXT_DELIVERY.md, docs/modules/workspace-sessions.md, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md
- [TODO] T009: Измерить ускорение и собрать релиз 0.6.10 — Ожидает
  - Git Commit: [PENDING] chore: собрать Web Pilot 0.6.10 с быстрым recovery
  - Reference: next-modifications-discussion-012 / T009 / implementation
  - Файлы: package.json, package-lock.json, docs/modules/workflow-kit-recovery.md, docs/CONTEXT_DELIVERY.md, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md, docs/WORKFLOW_START.md

## Context Pack For This Cycle

- docs/architecture/OVERVIEW.md → Краткая архитектура проекта
- docs/modules/workflow-kit-recovery.md → Module Specification — Workflow Kit / Context Recovery

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
