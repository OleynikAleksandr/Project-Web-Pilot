# Активный план — Project Web Pilot

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 420,
  "project_id": "cf944136-d1fc-4bd5-9ea0-e46d1fe230e7",
  "project_name": "Project Web Pilot",
  "scope_id": "chat-autoscroll-020",
  "execution_scope_status": "ACTIVE",
  "delivery_status": "IN_PROGRESS",
  "objective": "Сделать встроенный ChatGPT самопрокручивающимся к последним сообщениям, не мешая пользователю читать историю, и выпустить одинаковое исправление для macOS и Windows.",
  "acceptance_criteria": [
    "При открытии/продолжении сессии и появлении новых сообщений диалог остаётся у последнего сообщения, пока пользователь находится внизу.",
    "Ручная прокрутка вверх отключает автоследование и позиция пользователя не меняется из-за новых сообщений агента.",
    "Автоследование возобновляется после ручного возврата в самый низ либо после отправки пользователем нового сообщения.",
    "Поведение устойчиво к динамическому DOM ChatGPT и повторной установке после навигации без дублирования обработчиков.",
    "Обязательные проверки проходят, версия релиза увеличена, собраны пакеты macOS arm64 и Windows x64 из одного исходного дерева."
  ],
  "approved_scope": {
    "functional_paths": [
      "src/chatgpt-auto-scroll.mjs",
      "src/main.mjs",
      "tests/chatgpt-auto-scroll.test.mjs",
      "package.json",
      "package-lock.json"
    ],
    "documentation_paths": [
      "docs/modules/workspace-sessions.md",
      "docs/architecture/ARCHITECTURE.md",
      "docs/VERIFICATION.md"
    ],
    "max_functional_files_per_task": 3
  },
  "baseline_commit": "55fae06b9d4fe3f22c396e9bc94bc458f6b14f19",
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
        "path": "docs/modules/workspace-sessions.md",
        "heading_path": [
          "Module Specification — Workspace & Sessions"
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
      "functional_paths": [
        "src/chatgpt-auto-scroll.mjs",
        "src/main.mjs",
        "tests/chatgpt-auto-scroll.test.mjs"
      ],
      "documentation_paths": [
        "docs/modules/workspace-sessions.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "syntax",
        "suite"
      ],
      "id": "T001",
      "title": "Реализовать автопрокрутку диалога ChatGPT",
      "why": "Встроенный Chromium должен вести пользователя за последним сообщением, но не отбирать управление, когда пользователь вручную читает историю.",
      "acceptance_criteria": [
        "Автоследование включено внизу и прокручивает к последнему сообщению при динамических изменениях.",
        "Пользовательская прокрутка вверх переводит контроллер в suspended и новые ответы не двигают viewport.",
        "Возврат вниз или отправка нового запроса вновь включает автоследование.",
        "Установка контроллера идемпотентна и переживает SPA-навигацию/перезагрузку ChatGPT.",
        "Unit tests покрывают follow, suspend, manual resume и submit resume."
      ],
      "expected_commit_message": "feat(chat): добавить умную автопрокрутку диалога",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "chat-autoscroll-020",
        "task_id": "T001",
        "role": "implementation"
      }
    },
    {
      "dependencies": [
        "T001"
      ],
      "functional_paths": [
        "package.json",
        "package-lock.json"
      ],
      "documentation_paths": [
        "docs/modules/workspace-sessions.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "syntax",
        "suite",
        "electron-smoke"
      ],
      "id": "T002",
      "title": "Подготовить релиз автопрокрутки",
      "why": "Зафиксировать версию и release contract перед сборкой одинаковых пакетов macOS и Windows.",
      "acceptance_criteria": [
        "Версия приложения увеличена до следующего patch-релиза.",
        "Документация фиксирует включение auto-scroll в релиз.",
        "Полный suite и Electron smoke проходят перед упаковкой."
      ],
      "expected_commit_message": "build: подготовить релиз автопрокрутки",
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "chat-autoscroll-020",
        "task_id": "T002",
        "role": "implementation"
      }
    }
  ],
  "blocked_reason": null,
  "user_decisions": [
    {
      "id": "3f4adb32-b1ee-431e-a43f-482363db3d78",
      "text": "15.09.2026 пользователь явно поручил создать новый scope и реализовать автоматическую прокрутку: следовать за последними сообщениями, при ручной прокрутке вверх не вмешиваться до возврата вниз или отправки нового запроса, затем собрать релизы macOS и Windows.",
      "recorded_at": "2026-09-15T15:16:39.826Z"
    }
  ]
}
```
<!-- workflow-state:end -->

## Состояние

Execution Scope Status: ACTIVE
Delivery Status: IN_PROGRESS
Scope: chat-autoscroll-020
Current Task: нет
Revision: 420

## Цель

Сделать встроенный ChatGPT самопрокручивающимся к последним сообщениям, не мешая пользователю читать историю, и выпустить одинаковое исправление для macOS и Windows.

## Критерии приёмки

- При открытии/продолжении сессии и появлении новых сообщений диалог остаётся у последнего сообщения, пока пользователь находится внизу.
- Ручная прокрутка вверх отключает автоследование и позиция пользователя не меняется из-за новых сообщений агента.
- Автоследование возобновляется после ручного возврата в самый низ либо после отправки пользователем нового сообщения.
- Поведение устойчиво к динамическому DOM ChatGPT и повторной установке после навигации без дублирования обработчиков.
- Обязательные проверки проходят, версия релиза увеличена, собраны пакеты macOS arm64 и Windows x64 из одного исходного дерева.

## Микрозадачи

- [DONE] T001: Реализовать автопрокрутку диалога ChatGPT — Завершено
  - Git Commit: [DONE] feat(chat): добавить умную автопрокрутку диалога
  - Reference: chat-autoscroll-020 / T001 / implementation
  - Файлы: src/chatgpt-auto-scroll.mjs, src/main.mjs, tests/chatgpt-auto-scroll.test.mjs, docs/modules/workspace-sessions.md, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md
- [TODO] T002: Подготовить релиз автопрокрутки — Ожидает
  - Git Commit: [PENDING] build: подготовить релиз автопрокрутки
  - Reference: chat-autoscroll-020 / T002 / implementation
  - Файлы: package.json, package-lock.json, docs/modules/workspace-sessions.md, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md

## Context Pack For This Cycle

- docs/architecture/OVERVIEW.md → Краткая архитектура проекта
- docs/modules/workspace-sessions.md → Module Specification — Workspace & Sessions

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
