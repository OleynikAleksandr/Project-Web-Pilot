# Активный план — Project Web Pilot

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 544,
  "project_id": "cf944136-d1fc-4bd5-9ea0-e46d1fe230e7",
  "project_name": "Project Web Pilot",
  "scope_id": "composer-color-025",
  "execution_scope_status": "ACTIVE",
  "delivery_status": "IN_PROGRESS",
  "objective": "Добавить пятый цвет «Фон поля ввода» в существующий редактор: немедленное применение к скруглённому блоку ввода, сохранение и сброс; выпуск macOS/Windows 0.6.25. Проверить и исправить сохранение цвета текста агента во время потокового ответа.",
  "acceptance_criteria": [
    "Редактор содержит отдельный пункт «Фон поля ввода».",
    "Цвет изменяет только блок ввода; текст, кнопки, форма и черновик сохраняются.",
    "Сохранение, переходы, повторный запуск и независимый/общий сброс работают.",
    "Релиз 0.6.25 установлен в постоянный macOS app с сохранением алиаса; отдельные ZIP обеих платформ проверены.",
    "Выбранный цвет текста агента сохраняется во время streaming и применяется к вновь появляющимся фрагментам."
  ],
  "approved_scope": {
    "functional_paths": [
      "src/chatgpt-colors.mjs",
      "tests/chatgpt-colors.test.mjs",
      "src/ui/chat-colors.mjs",
      "src/chat-colors-window.mjs",
      "tests/electron-smoke.mjs",
      "package.json",
      "package-lock.json"
    ],
    "documentation_paths": [
      "README.md",
      "AGENTS.md",
      "docs/PRODUCT.md",
      "docs/DECISIONS.md",
      "docs/CONTEXT_DELIVERY.md",
      "docs/architecture/ARCHITECTURE.md",
      "docs/WORKFLOW_START.md",
      "docs/MODULES.md",
      "docs/architecture/OVERVIEW.md",
      "docs/DOCUMENTATION_INDEX.md",
      "docs/modules/workspace-sessions.md",
      "docs/modules/project-doctor.md",
      "docs/modules/runtime-lifecycle.md",
      "docs/modules/workflow-kit-recovery.md",
      "docs/SOURCE_WORKSPACES.md",
      "docs/VERIFICATION.md",
      "docs/TRANSFER_TO_WINDOWS.md",
      "docs/WORKSPACE_SETUP.md",
      "docs/PROJECT_ARCHIVE.md",
      "docs/RELEASE.md"
    ],
    "max_functional_files_per_task": 3
  },
  "baseline_commit": "7bcb5b5cdfe601e5b4a982e35fb619c1ec3d2e82",
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
        "path": "docs/modules/workspace-sessions.md",
        "heading_path": [
          "Module Specification — Workspace & Sessions",
          "Редактор цветов чата — согласованный контракт 16.09.2026"
        ],
        "required": true,
        "revision": "WORKTREE"
      },
      {
        "path": "docs/RELEASE.md",
        "heading_path": [
          "Выпуск и постоянный путь запуска"
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
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "composer-color-025",
        "task_id": "T001",
        "role": "implementation"
      },
      "dependencies": [],
      "functional_paths": [
        "src/chatgpt-colors.mjs",
        "tests/chatgpt-colors.test.mjs"
      ],
      "documentation_paths": [
        "docs/modules/workspace-sessions.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "syntax"
      ],
      "id": "T001",
      "title": "Цвет поля ввода и устойчивый цвет текста потокового ответа",
      "why": "Пользователь поручил добавить фон поля ввода в существующий редактор цветов и собрать релиз.",
      "acceptance_criteria": [
        "Новый nullable HEX composerBackground совместим с прежними настройками; CSS ограничен блоком ввода.",
        "CSS охватывает потоковую markdown-разметку ответа, исключая пользовательский текст и поле ввода."
      ],
      "expected_commit_message": "feat: add composer background to chat palette"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "composer-color-025",
        "task_id": "T002",
        "role": "implementation"
      },
      "dependencies": [
        "T001"
      ],
      "functional_paths": [
        "src/ui/chat-colors.mjs",
        "src/chat-colors-window.mjs",
        "tests/electron-smoke.mjs"
      ],
      "documentation_paths": [
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "syntax",
        "suite",
        "electron-smoke"
      ],
      "id": "T002",
      "title": "Пятый пункт редактора и Chromium-проверка",
      "why": "Пользователь поручил добавить фон поля ввода в существующий редактор цветов и собрать релиз.",
      "acceptance_criteria": [
        "Пять строк помещаются в окне; live preview, независимый reset, persistence и полный reset подтверждены.",
        "Chromium воспроизводит появление и замену фрагментов streaming, изменение assistantText во время потока и его сохранение."
      ],
      "expected_commit_message": "feat: expose and verify live composer background control"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "composer-color-025",
        "task_id": "T003",
        "role": "implementation"
      },
      "dependencies": [
        "T002"
      ],
      "functional_paths": [
        "package.json",
        "package-lock.json"
      ],
      "documentation_paths": [
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md",
        "docs/RELEASE.md"
      ],
      "verification_ids": [
        "syntax"
      ],
      "id": "T003",
      "title": "Собрать и установить релиз 0.6.25",
      "why": "Пользователь поручил добавить фон поля ввода в существующий редактор цветов и собрать релиз.",
      "acceptance_criteria": [
        "Постоянный app и отдельные macOS/Windows ZIP версии 0.6.25 доставлены и проверены."
      ],
      "expected_commit_message": "release: publish Web Pilot 0.6.25 with composer color"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "composer-color-025",
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
        "README.md",
        "AGENTS.md",
        "docs/PRODUCT.md",
        "docs/DECISIONS.md",
        "docs/CONTEXT_DELIVERY.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/WORKFLOW_START.md",
        "docs/MODULES.md",
        "docs/architecture/OVERVIEW.md",
        "docs/DOCUMENTATION_INDEX.md",
        "docs/modules/workspace-sessions.md",
        "docs/modules/project-doctor.md",
        "docs/modules/runtime-lifecycle.md",
        "docs/modules/workflow-kit-recovery.md",
        "docs/SOURCE_WORKSPACES.md",
        "docs/VERIFICATION.md",
        "docs/TRANSFER_TO_WINDOWS.md",
        "docs/WORKSPACE_SETUP.md",
        "docs/PROJECT_ARCHIVE.md",
        "docs/RELEASE.md"
      ],
      "verification_ids": [],
      "id": "DOCS",
      "title": "Актуализация всех документов проекта",
      "why": "Пользователь поручил добавить фон поля ввода в существующий редактор цветов и собрать релиз.",
      "acceptance_criteria": [
        "Все документы индекса проверены; описания пяти цветов и текущего релиза актуальны."
      ],
      "expected_commit_message": "docs: document composer color and release 0.6.25"
    }
  ],
  "blocked_reason": null,
  "user_decisions": [
    {
      "id": "698a3af1-a806-4f16-b1ce-724eccfab0e4",
      "text": "Пользователь согласовал пятый параметр «Фон поля ввода» с live preview, сохранением и сбросом и прямо поручил создать короткий scope, реализовать дополнение и собрать новый релиз.",
      "recorded_at": "2026-09-16T12:28:19.295Z"
    },
    {
      "id": "2c5cd710-fb9c-4f59-ae4f-f5ed45b52a08",
      "text": "Пользователь дополнительно поручил проверить цвет текста агента: во время ответа выбранный цвет возвращается к оригинальному. Исправление и streaming regression включены в текущий scope.",
      "recorded_at": "2026-09-16T12:30:25.630Z"
    }
  ]
}
```
<!-- workflow-state:end -->

## Состояние

Execution Scope Status: ACTIVE
Delivery Status: IN_PROGRESS
Scope: composer-color-025
Current Task: нет
Revision: 544

## Цель

Добавить пятый цвет «Фон поля ввода» в существующий редактор: немедленное применение к скруглённому блоку ввода, сохранение и сброс; выпуск macOS/Windows 0.6.25. Проверить и исправить сохранение цвета текста агента во время потокового ответа.

## Критерии приёмки

- Редактор содержит отдельный пункт «Фон поля ввода».
- Цвет изменяет только блок ввода; текст, кнопки, форма и черновик сохраняются.
- Сохранение, переходы, повторный запуск и независимый/общий сброс работают.
- Релиз 0.6.25 установлен в постоянный macOS app с сохранением алиаса; отдельные ZIP обеих платформ проверены.
- Выбранный цвет текста агента сохраняется во время streaming и применяется к вновь появляющимся фрагментам.

## Микрозадачи

- [DONE] T001: Цвет поля ввода и устойчивый цвет текста потокового ответа — Завершено
  - Git Commit: [DONE] feat: add composer background to chat palette
  - Reference: composer-color-025 / T001 / implementation
  - Файлы: src/chatgpt-colors.mjs, tests/chatgpt-colors.test.mjs, docs/modules/workspace-sessions.md, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md
- [TODO] T002: Пятый пункт редактора и Chromium-проверка — Ожидает
  - Git Commit: [PENDING] feat: expose and verify live composer background control
  - Reference: composer-color-025 / T002 / implementation
  - Файлы: src/ui/chat-colors.mjs, src/chat-colors-window.mjs, tests/electron-smoke.mjs, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md
- [TODO] T003: Собрать и установить релиз 0.6.25 — Ожидает
  - Git Commit: [PENDING] release: publish Web Pilot 0.6.25 with composer color
  - Reference: composer-color-025 / T003 / implementation
  - Файлы: package.json, package-lock.json, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md, docs/RELEASE.md
- [TODO] DOCS: Актуализация всех документов проекта — Ожидает
  - Git Commit: [PENDING] docs: document composer color and release 0.6.25
  - Reference: composer-color-025 / DOCS / implementation
  - Файлы: README.md, AGENTS.md, docs/PRODUCT.md, docs/DECISIONS.md, docs/CONTEXT_DELIVERY.md, docs/architecture/ARCHITECTURE.md, docs/WORKFLOW_START.md, docs/MODULES.md, docs/architecture/OVERVIEW.md, docs/DOCUMENTATION_INDEX.md, docs/modules/workspace-sessions.md, docs/modules/project-doctor.md, docs/modules/runtime-lifecycle.md, docs/modules/workflow-kit-recovery.md, docs/SOURCE_WORKSPACES.md, docs/VERIFICATION.md, docs/TRANSFER_TO_WINDOWS.md, docs/WORKSPACE_SETUP.md, docs/PROJECT_ARCHIVE.md, docs/RELEASE.md

## Context Pack For This Cycle

- docs/architecture/OVERVIEW.md → Краткая архитектура проекта
- docs/MODULES.md → Модули проекта
- docs/DOCUMENTATION_INDEX.md → Каталог документации
- docs/modules/workspace-sessions.md → Module Specification — Workspace & Sessions / Редактор цветов чата — согласованный контракт 16.09.2026
- docs/RELEASE.md → Выпуск и постоянный путь запуска

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
