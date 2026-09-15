# Активный план — Project Web Pilot

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 416,
  "project_id": "cf944136-d1fc-4bd5-9ea0-e46d1fe230e7",
  "project_name": "Project Web Pilot",
  "scope_id": "windows-node-setup-019",
  "execution_scope_status": "ACTIVE",
  "delivery_status": "READY_FOR_ACCEPTANCE",
  "objective": "Устранить воспроизведённый ложный NODE_MISSING в Windows-подготовке проектов и проверить Windows-поставку.",
  "acceptance_criteria": [
    "Windows использует встроенный Node.js независимо от унаследованных NODE_OPTIONS/NODE_PATH.",
    "Отсутствие Node, неподдерживаемая версия и ошибка запуска различаются; резервный рабочий кандидат продолжает использоваться.",
    "Собрана и проверена Windows x64 поставка с Node.js. Native Windows 10 приёмка остаётся пользователю; scope не архивируется."
  ],
  "approved_scope": {
    "functional_paths": [
      "src/workspace-setup.mjs",
      "tests/workspace-setup.test.mjs",
      "package.json",
      "package-lock.json"
    ],
    "documentation_paths": [
      "docs/modules/workspace-sessions.md",
      "docs/WORKSPACE_SETUP.md",
      "docs/architecture/ARCHITECTURE.md",
      "docs/VERIFICATION.md",
      "docs/TRANSFER_TO_WINDOWS.md"
    ],
    "max_functional_files_per_task": 3
  },
  "baseline_commit": "d2e8acf577aee3eda32866e90b2f66b9a97c0f63",
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
        "path": "docs/WORKSPACE_SETUP.md",
        "heading_path": [
          "Создание и подключение workspace"
        ],
        "required": true,
        "revision": "WORKTREE"
      },
      {
        "path": "docs/modules/workspace-sessions.md",
        "heading_path": [
          "Module Specification — Workspace & Sessions",
          "Граница ответственности"
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
        "src/workspace-setup.mjs",
        "tests/workspace-setup.test.mjs"
      ],
      "documentation_paths": [
        "docs/modules/workspace-sessions.md",
        "docs/WORKSPACE_SETUP.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "syntax",
        "suite"
      ],
      "id": "T001",
      "title": "Исправить запуск и диагностику Node.js при подготовке Windows-проектов",
      "why": "Воспроизведён ложный NODE_MISSING при рабочем Node и неподдерживаемом унаследованном NODE_OPTIONS; текущий catch также скрывает версию и реальные ошибки запуска.",
      "acceptance_criteria": [
        "Windows дочерний Node не наследует NODE_OPTIONS/NODE_PATH независимо от регистра ключей.",
        "Рабочий fallback, retry и различные классы ошибок проверены; macOS сохраняет прежнее поведение."
      ],
      "expected_commit_message": "fix(windows): исправить запуск Node при подготовке проектов",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "windows-node-setup-019",
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
        "docs/TRANSFER_TO_WINDOWS.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "syntax"
      ],
      "id": "T002",
      "title": "Подготовить Windows-сборку с исправлением и инструкцией проверки",
      "why": "Дать пользователю конкретную исправленную Windows-поставку для проверки неизвестной старой версии.",
      "acceptance_criteria": [
        "Windows build имеет версию 0.6.17 и проходит verify:win.",
        "Пакет содержит настоящий Node.js, worker и исправленный код; macOS package не пересобирается.",
        "Зафиксированы локальные проверки и отсутствие native Windows 10 запуска."
      ],
      "expected_commit_message": "build(windows): подготовить исправленную сборку 0.6.17",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "windows-node-setup-019",
        "task_id": "T002",
        "role": "implementation"
      }
    }
  ],
  "blocked_reason": null,
  "user_decisions": [
    {
      "id": "b9452854-a1b1-4f17-bc04-62043a662ea5",
      "text": "15.09.2026 пользователь поручил исследовать показанный NODE_MISSING на Windows 10 и при найденных причинах исправить именно Windows-версию. Исправление исполняет существующий контракт встроенного portable Node; macOS-поведение и архитектура не меняются.",
      "recorded_at": "2026-09-15T14:59:38.402Z"
    }
  ]
}
```
<!-- workflow-state:end -->

## Состояние

Execution Scope Status: ACTIVE
Delivery Status: READY_FOR_ACCEPTANCE
Scope: windows-node-setup-019
Current Task: нет
Revision: 416

## Цель

Устранить воспроизведённый ложный NODE_MISSING в Windows-подготовке проектов и проверить Windows-поставку.

## Критерии приёмки

- Windows использует встроенный Node.js независимо от унаследованных NODE_OPTIONS/NODE_PATH.
- Отсутствие Node, неподдерживаемая версия и ошибка запуска различаются; резервный рабочий кандидат продолжает использоваться.
- Собрана и проверена Windows x64 поставка с Node.js. Native Windows 10 приёмка остаётся пользователю; scope не архивируется.

## Микрозадачи

- [DONE] T001: Исправить запуск и диагностику Node.js при подготовке Windows-проектов — Завершено
  - Git Commit: [DONE] fix(windows): исправить запуск Node при подготовке проектов
  - Reference: windows-node-setup-019 / T001 / implementation
  - Файлы: src/workspace-setup.mjs, tests/workspace-setup.test.mjs, docs/modules/workspace-sessions.md, docs/WORKSPACE_SETUP.md, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md
- [DONE] T002: Подготовить Windows-сборку с исправлением и инструкцией проверки — Завершено
  - Git Commit: [DONE] build(windows): подготовить исправленную сборку 0.6.17
  - Reference: windows-node-setup-019 / T002 / implementation
  - Файлы: package.json, package-lock.json, docs/TRANSFER_TO_WINDOWS.md, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md

## Context Pack For This Cycle

- docs/architecture/OVERVIEW.md → Краткая архитектура проекта
- docs/WORKSPACE_SETUP.md → Создание и подключение workspace
- docs/modules/workspace-sessions.md → Module Specification — Workspace & Sessions / Граница ответственности

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
