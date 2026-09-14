# Активный план — Project Web Pilot

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 323,
  "project_id": "cf944136-d1fc-4bd5-9ea0-e46d1fe230e7",
  "project_name": "Project Web Pilot",
  "scope_id": "next-modifications-discussion-012",
  "execution_scope_status": "ACTIVE",
  "delivery_status": "IN_PROGRESS",
  "objective": "Добавить локальную оценку токенов переписки через tiktoken в правый нижний угол строки каждой сессии.",
  "acceptance_criteria": [
    "Отдельная сохраняемая оценка для каждой Chat/Work сессии обновляется при чтении сообщений.",
    "Счётчик расположен справа снизу; повторное отображение одного сообщения не увеличивает сумму.",
    "Показания явно являются оценкой доступного текста; пользователь проверяет их на реальном ChatGPT."
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
      "tests/electron-smoke.mjs"
    ],
    "documentation_paths": [
      "docs/DECISIONS.md",
      "docs/modules/workspace-sessions.md",
      "docs/architecture/ARCHITECTURE.md",
      "docs/VERIFICATION.md",
      "docs/WORKFLOW_START.md"
    ],
    "max_functional_files_per_task": 3
  },
  "baseline_commit": "50b1651b0d6cd73865f7d249514ce125d2bd9cf9",
  "current_task_id": null,
  "context_pack": {
    "documents": [
      {
        "path": "docs/architecture/OVERVIEW.md",
        "required": true,
        "revision": "WORKTREE"
      },
      {
        "path": "docs/modules/workspace-sessions.md",
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
      "implementation_status": "TODO",
      "commit_status": "PENDING",
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
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "next-modifications-discussion-012",
        "task_id": "T004",
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
Revision: 323

## Цель

Добавить локальную оценку токенов переписки через tiktoken в правый нижний угол строки каждой сессии.

## Критерии приёмки

- Отдельная сохраняемая оценка для каждой Chat/Work сессии обновляется при чтении сообщений.
- Счётчик расположен справа снизу; повторное отображение одного сообщения не увеличивает сумму.
- Показания явно являются оценкой доступного текста; пользователь проверяет их на реальном ChatGPT.

## Микрозадачи

- [DONE] T001: Зафиксировать согласованный счётчик токенов сессии — Завершено
  - Git Commit: [DONE] docs: согласовать следующую модификацию Web Pilot
  - Reference: next-modifications-discussion-012 / T001 / implementation
  - Файлы: docs/DECISIONS.md, docs/modules/workspace-sessions.md
- [DONE] T002: Добавить tiktoken, подсчёт и сохранение оценки по сессиям — Завершено
  - Git Commit: [DONE] feat: считать и сохранять токены сессий через tiktoken
  - Reference: next-modifications-discussion-012 / T002 / implementation
  - Файлы: src/session-tokens.mjs, src/workspace-session.mjs, package.json, package-lock.json, tests/session-tokens.test.mjs, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md, docs/modules/workspace-sessions.md
- [TODO] T003: Подключить счётчик к открытому чату и нижнему правому углу сессии — Ожидает
  - Git Commit: [PENDING] feat: показывать оценку токенов в строках сессий
  - Reference: next-modifications-discussion-012 / T003 / implementation
  - Файлы: src/main.mjs, src/ui/sidebar.mjs, src/ui/index.html, tests/electron-smoke.mjs, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md, docs/modules/workspace-sessions.md
- [TODO] T004: Собрать обновление приложения для проверки пользователем — Ожидает
  - Git Commit: [PENDING] chore: собрать Web Pilot 0.6.9 со счётчиком токенов
  - Reference: next-modifications-discussion-012 / T004 / implementation
  - Файлы: package.json, package-lock.json, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md, docs/WORKFLOW_START.md, docs/modules/workspace-sessions.md

## Context Pack For This Cycle

- docs/architecture/OVERVIEW.md
- docs/modules/workspace-sessions.md

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
