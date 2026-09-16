# Активный план — Project Web Pilot

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 515,
  "project_id": "cf944136-d1fc-4bd5-9ea0-e46d1fe230e7",
  "project_name": "Project Web Pilot",
  "scope_id": "chat-colors-024",
  "execution_scope_status": "ACTIVE",
  "delivery_status": "IN_PROGRESS",
  "objective": "Отдельный перемещаемый редактор цветов чата из Settings: общий фон, фон пользовательского сообщения, цвет пользовательского текста и цвет текста агента; немедленное применение, сохранение и сброс; релиз macOS/Windows.",
  "acceptance_criteria": [
    "Settings содержит отдельную кнопку редактора.",
    "Четыре цвета независимо и немедленно применяются в чате.",
    "Окно можно перемещать; повторный вызов поднимает существующее окно.",
    "Палитра сохраняется между запусками и переходами; сброс восстанавливает ChatGPT.",
    "Собраны macOS arm64 и Windows x64 0.6.23."
  ],
  "approved_scope": {
    "functional_paths": [
      "src/chatgpt-colors.mjs",
      "tests/chatgpt-colors.test.mjs",
      "src/chat-colors-window.mjs",
      "src/chat-colors-preload.cjs",
      "src/ui/chat-colors.html",
      "src/ui/chat-colors.mjs",
      "src/main.mjs",
      "src/preload.cjs",
      "src/ui/index.html",
      "src/ui/project-archive.mjs",
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
      "docs/PROJECT_ARCHIVE.md"
    ],
    "max_functional_files_per_task": 3
  },
  "baseline_commit": "1f4cdaf2c2a6f4d9b2b121ed486d7b761511d763",
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
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "chat-colors-024",
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
      "title": "Палитра чата и применение CSS",
      "why": "Реализовать согласованный пользователем редактор цветов чата с немедленным предпросмотром.",
      "acceptance_criteria": [
        "Палитра чата и применение CSS выполнено; существующие функции сохранены."
      ],
      "expected_commit_message": "feat: add isolated ChatGPT color palette"
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "chat-colors-024",
        "task_id": "T002",
        "role": "implementation"
      },
      "dependencies": [
        "T001"
      ],
      "functional_paths": [
        "src/chat-colors-window.mjs",
        "src/chat-colors-preload.cjs"
      ],
      "documentation_paths": [
        "docs/architecture/ARCHITECTURE.md"
      ],
      "verification_ids": [
        "syntax"
      ],
      "id": "T002",
      "title": "Перемещаемое окно редактора и безопасный IPC",
      "why": "Реализовать согласованный пользователем редактор цветов чата с немедленным предпросмотром.",
      "acceptance_criteria": [
        "Перемещаемое окно редактора и безопасный IPC выполнено; существующие функции сохранены."
      ],
      "expected_commit_message": "feat: add floating chat color editor window"
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "chat-colors-024",
        "task_id": "T003",
        "role": "implementation"
      },
      "dependencies": [
        "T002"
      ],
      "functional_paths": [
        "src/ui/chat-colors.html",
        "src/ui/chat-colors.mjs"
      ],
      "documentation_paths": [
        "docs/architecture/ARCHITECTURE.md"
      ],
      "verification_ids": [
        "syntax"
      ],
      "id": "T003",
      "title": "Интерактивный редактор четырёх цветов",
      "why": "Реализовать согласованный пользователем редактор цветов чата с немедленным предпросмотром.",
      "acceptance_criteria": [
        "Интерактивный редактор четырёх цветов выполнено; существующие функции сохранены."
      ],
      "expected_commit_message": "feat: add live chat color controls"
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "chat-colors-024",
        "task_id": "T004",
        "role": "implementation"
      },
      "dependencies": [
        "T003"
      ],
      "functional_paths": [
        "src/main.mjs",
        "src/preload.cjs"
      ],
      "documentation_paths": [
        "docs/architecture/ARCHITECTURE.md"
      ],
      "verification_ids": [
        "syntax"
      ],
      "id": "T004",
      "title": "Подключение палитры к приложению и сохранению настроек",
      "why": "Реализовать согласованный пользователем редактор цветов чата с немедленным предпросмотром.",
      "acceptance_criteria": [
        "Подключение палитры к приложению и сохранению настроек выполнено; существующие функции сохранены."
      ],
      "expected_commit_message": "feat: persist chat colors across navigation and restart"
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "chat-colors-024",
        "task_id": "T005",
        "role": "implementation"
      },
      "dependencies": [
        "T004"
      ],
      "functional_paths": [
        "src/ui/index.html",
        "src/ui/project-archive.mjs",
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
      "id": "T005",
      "title": "Кнопка в Settings и интеграционная проверка",
      "why": "Реализовать согласованный пользователем редактор цветов чата с немедленным предпросмотром.",
      "acceptance_criteria": [
        "Кнопка в Settings и интеграционная проверка выполнено; существующие функции сохранены."
      ],
      "expected_commit_message": "feat: expose chat color editor in settings"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "chat-colors-024",
        "task_id": "T006",
        "role": "implementation"
      },
      "dependencies": [
        "T005"
      ],
      "functional_paths": [
        "package.json",
        "package-lock.json"
      ],
      "documentation_paths": [
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "syntax"
      ],
      "id": "T006",
      "title": "Сборка релиза 0.6.23 для macOS и Windows",
      "why": "Реализовать согласованный пользователем редактор цветов чата с немедленным предпросмотром.",
      "acceptance_criteria": [
        "Сборка релиза 0.6.23 для macOS и Windows выполнено; существующие функции сохранены."
      ],
      "expected_commit_message": "release: build Web Pilot 0.6.23 with chat colors"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "chat-colors-024",
        "task_id": "DOCS",
        "role": "implementation"
      },
      "dependencies": [
        "T001",
        "T002",
        "T003",
        "T004",
        "T005",
        "T006"
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
        "docs/PROJECT_ARCHIVE.md"
      ],
      "verification_ids": [],
      "id": "DOCS",
      "title": "Актуализация всех документов проекта",
      "why": "Проверить полный индекс, обновить актуальное поведение и evidence; предъявить результат пользователю.",
      "acceptance_criteria": [
        "Документы согласованы с релизом; реальная пользовательская приёмка остаётся отдельным шагом."
      ],
      "expected_commit_message": "docs: document chat colors and release 0.6.23"
    }
  ],
  "blocked_reason": null,
  "user_decisions": [
    {
      "id": "1c2793cf-56cd-4995-9c6e-ae6d5b13718c",
      "text": "16.09.2026 пользователь прямо поручил подготовить новый scope, реализовать встроенный редактор цветов с live preview в отдельном перемещаемом окне как архив и собрать релиз.",
      "recorded_at": "2026-09-16T09:57:52.995Z"
    }
  ]
}
```
<!-- workflow-state:end -->

## Состояние

Execution Scope Status: ACTIVE
Delivery Status: IN_PROGRESS
Scope: chat-colors-024
Current Task: нет
Revision: 515

## Цель

Отдельный перемещаемый редактор цветов чата из Settings: общий фон, фон пользовательского сообщения, цвет пользовательского текста и цвет текста агента; немедленное применение, сохранение и сброс; релиз macOS/Windows.

## Критерии приёмки

- Settings содержит отдельную кнопку редактора.
- Четыре цвета независимо и немедленно применяются в чате.
- Окно можно перемещать; повторный вызов поднимает существующее окно.
- Палитра сохраняется между запусками и переходами; сброс восстанавливает ChatGPT.
- Собраны macOS arm64 и Windows x64 0.6.23.

## Микрозадачи

- [DONE] T001: Палитра чата и применение CSS — Завершено
  - Git Commit: [DONE] feat: add isolated ChatGPT color palette
  - Reference: chat-colors-024 / T001 / implementation
  - Файлы: src/chatgpt-colors.mjs, tests/chatgpt-colors.test.mjs, docs/modules/workspace-sessions.md, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md
- [DONE] T002: Перемещаемое окно редактора и безопасный IPC — Завершено
  - Git Commit: [DONE] feat: add floating chat color editor window
  - Reference: chat-colors-024 / T002 / implementation
  - Файлы: src/chat-colors-window.mjs, src/chat-colors-preload.cjs, docs/architecture/ARCHITECTURE.md
- [DONE] T003: Интерактивный редактор четырёх цветов — Завершено
  - Git Commit: [DONE] feat: add live chat color controls
  - Reference: chat-colors-024 / T003 / implementation
  - Файлы: src/ui/chat-colors.html, src/ui/chat-colors.mjs, docs/architecture/ARCHITECTURE.md
- [DONE] T004: Подключение палитры к приложению и сохранению настроек — Завершено
  - Git Commit: [DONE] feat: persist chat colors across navigation and restart
  - Reference: chat-colors-024 / T004 / implementation
  - Файлы: src/main.mjs, src/preload.cjs, docs/architecture/ARCHITECTURE.md
- [DONE] T005: Кнопка в Settings и интеграционная проверка — Завершено
  - Git Commit: [DONE] feat: expose chat color editor in settings
  - Reference: chat-colors-024 / T005 / implementation
  - Файлы: src/ui/index.html, src/ui/project-archive.mjs, tests/electron-smoke.mjs, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md
- [TODO] T006: Сборка релиза 0.6.23 для macOS и Windows — Ожидает
  - Git Commit: [PENDING] release: build Web Pilot 0.6.23 with chat colors
  - Reference: chat-colors-024 / T006 / implementation
  - Файлы: package.json, package-lock.json, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md
- [TODO] DOCS: Актуализация всех документов проекта — Ожидает
  - Git Commit: [PENDING] docs: document chat colors and release 0.6.23
  - Reference: chat-colors-024 / DOCS / implementation
  - Файлы: README.md, AGENTS.md, docs/PRODUCT.md, docs/DECISIONS.md, docs/CONTEXT_DELIVERY.md, docs/architecture/ARCHITECTURE.md, docs/WORKFLOW_START.md, docs/MODULES.md, docs/architecture/OVERVIEW.md, docs/DOCUMENTATION_INDEX.md, docs/modules/workspace-sessions.md, docs/modules/project-doctor.md, docs/modules/runtime-lifecycle.md, docs/modules/workflow-kit-recovery.md, docs/SOURCE_WORKSPACES.md, docs/VERIFICATION.md, docs/TRANSFER_TO_WINDOWS.md, docs/WORKSPACE_SETUP.md, docs/PROJECT_ARCHIVE.md

## Context Pack For This Cycle

- docs/architecture/OVERVIEW.md → Краткая архитектура проекта
- docs/MODULES.md → Модули проекта
- docs/DOCUMENTATION_INDEX.md → Каталог документации
- docs/modules/workspace-sessions.md → Module Specification — Workspace & Sessions / Граница ответственности

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
