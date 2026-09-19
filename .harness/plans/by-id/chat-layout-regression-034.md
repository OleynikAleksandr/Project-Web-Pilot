# Активный план — Project Web Pilot

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 9,
  "project_id": "cf944136-d1fc-4bd5-9ea0-e46d1fe230e7",
  "project_name": "Project Web Pilot",
  "scope_id": "chat-layout-regression-034",
  "execution_scope_status": "ACTIVE",
  "delivery_status": "IN_PROGRESS",
  "objective": "Восстановить компактное расположение последних сообщений ChatGPT: скрытые tool-call элементы не должны оставлять layout-footprint между последним видимым ответом и composer; сохранить ручную прокрутку и выпустить Project Web Pilot 0.6.46 для macOS и Windows.",
  "acceptance_criteria": [
    "При включённом скрытии tool calls служебный tool-only turn/message wrapper полностью исключается из layout, если он не содержит пользовательского или содержательного assistant-текста.",
    "Обычный assistant/user message с полезным текстом никогда не скрывается целиком из-за вложенной tool-call строки.",
    "Существующая автопрокрутка после изменения layout пересчитывает низ без принудительного выхода из режима ручного чтения истории.",
    "Electron regression fixture покрывает прежнюю вложенную структуру и новую структуру, где tool call сам является message/turn boundary.",
    "Planning document фиксирует найденную исходную реализацию 0.6.22, причину регрессии и выбранный минимальный алгоритм.",
    "Node suite и Electron smoke проходят; Project Web Pilot 0.6.46 собран для macOS arm64 и Windows x64."
  ],
  "approved_scope": {
    "functional_paths": [
      "src/main.mjs",
      "tests/electron-smoke.mjs",
      "package.json",
      "package-lock.json"
    ],
    "documentation_paths": [
      "docs/design/chat-message-layout-regression.md",
      "docs/modules/workspace-sessions.md",
      "docs/VERIFICATION.md",
      "docs/RELEASE.md",
      "README.md",
      "docs/architecture/OVERVIEW.md",
      "docs/MODULES.md",
      "docs/DOCUMENTATION_INDEX.md",
      "docs/architecture/ARCHITECTURE.md",
      "docs/DECISIONS.md",
      "docs/CONTEXT_DELIVERY.md",
      "docs/TRANSFER_TO_WINDOWS.md",
      "docs/CLEAN_INSTALL.md",
      "docs/WORKFLOW_START.md",
      "docs/PRODUCT.md",
      "docs/WORKSPACE_SETUP.md",
      "docs/PROJECT_ARCHIVE.md",
      "docs/SOURCE_WORKSPACES.md",
      "docs/modules/workflow-kit-recovery.md",
      "docs/modules/project-doctor.md",
      "docs/modules/runtime-lifecycle.md",
      "docs/modules/session-owned-plans.md",
      "docs/modules/session-opening-performance.md",
      "docs/modules/first-run-onboarding.md",
      "docs/design/session-plan-navigation.md"
    ],
    "max_functional_files_per_task": 3
  },
  "baseline_commit": "055f5e9d5bd0f8c760bcf93a4a757c4e93fef458",
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
          "Скрытые tool-call строки и автопрокрутка — scope hidden-tool-scroll-023"
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
        "scope_id": "chat-layout-regression-034",
        "task_id": "T001",
        "role": "implementation"
      },
      "dependencies": [],
      "functional_paths": [],
      "documentation_paths": [
        "docs/design/chat-message-layout-regression.md",
        "docs/DOCUMENTATION_INDEX.md"
      ],
      "verification_ids": [],
      "id": "T001",
      "title": "Зафиксировать причину регрессии и план исправления",
      "why": "Отделить доказанную историю реализации от предположений о текущей DOM-разметке и зафиксировать минимальный безопасный алгоритм до изменения кода.",
      "acceptance_criteria": [
        "Документ указывает исходные commits scope hidden-tool-scroll-023 и подтверждает, что текущий код фильтра с тех пор функционально не менялся.",
        "Документ объясняет уязвимость: алгоритм останавливается перед ближайшим [data-message-author-role] boundary, поэтому новая tool-only message/turn оболочка может сохранять min-height/padding.",
        "Определены безопасные границы: message boundary разрешено скрывать только когда весь его нормализованный текст принадлежит tool-call control; смешанный message остаётся."
      ],
      "expected_commit_message": "docs: спланировать исправление layout скрытых tool calls"
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "chat-layout-regression-034",
        "task_id": "T002",
        "role": "implementation"
      },
      "dependencies": [
        "T001"
      ],
      "functional_paths": [
        "src/main.mjs",
        "tests/electron-smoke.mjs"
      ],
      "documentation_paths": [
        "docs/modules/workspace-sessions.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "syntax",
        "electron-smoke"
      ],
      "id": "T002",
      "title": "Убрать footprint tool-only message wrappers",
      "why": "Адаптировать существующий визуальный фильтр к обновившейся структуре ChatGPT, не затрагивая выполнение инструментов и содержательные сообщения.",
      "acceptance_criteria": [
        "Footprint-поиск может включить ближайший message/turn boundary, если он tool-only; смешанный assistant message не скрывается.",
        "Restore полностью обратим и снимает markers/layout overrides.",
        "Refresh автопрокрутки вызывается после фактического изменения layout без force resume.",
        "Smoke fixture проверяет dedicated tool message wrapper, старую вложенную оболочку и сохранность смешанного assistant message."
      ],
      "expected_commit_message": "fix(chat): убрать пустоту tool-only message wrappers"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "chat-layout-regression-034",
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
        "docs/VERIFICATION.md",
        "docs/RELEASE.md"
      ],
      "verification_ids": [
        "suite",
        "electron-smoke"
      ],
      "id": "T003",
      "title": "Подготовить и собрать релиз 0.6.46",
      "why": "Доставить исправление отдельной проверяемой версией на обе платформы.",
      "acceptance_criteria": [
        "Версия проекта повышена с 0.6.45 до 0.6.46.",
        "Полный npm test и Electron smoke проходят.",
        "Одна команда npm run build создаёт macOS arm64 и Windows x64 0.6.46 и обновляет постоянный macOS app согласно release contract."
      ],
      "expected_commit_message": "build: выпустить Project Web Pilot 0.6.46"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "chat-layout-regression-034",
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
        "docs/architecture/OVERVIEW.md",
        "docs/MODULES.md",
        "docs/DOCUMENTATION_INDEX.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/WORKFLOW_START.md",
        "docs/PRODUCT.md",
        "docs/DECISIONS.md",
        "docs/CONTEXT_DELIVERY.md",
        "docs/VERIFICATION.md",
        "docs/RELEASE.md",
        "docs/CLEAN_INSTALL.md",
        "docs/TRANSFER_TO_WINDOWS.md",
        "docs/WORKSPACE_SETUP.md",
        "docs/PROJECT_ARCHIVE.md",
        "docs/SOURCE_WORKSPACES.md",
        "docs/modules/workflow-kit-recovery.md",
        "docs/modules/project-doctor.md",
        "docs/modules/runtime-lifecycle.md",
        "docs/modules/workspace-sessions.md",
        "docs/modules/session-owned-plans.md",
        "docs/modules/session-opening-performance.md",
        "docs/modules/first-run-onboarding.md",
        "docs/design/session-plan-navigation.md",
        "docs/design/chat-message-layout-regression.md"
      ],
      "verification_ids": [],
      "id": "DOCS",
      "title": "Актуализация всех документов проекта",
      "why": "После исправления и выпуска проверить весь действующий комплект документации по индексу и обновить только устаревшие сведения и ссылки.",
      "acceptance_criteria": [
        "Все документы из docs/DOCUMENTATION_INDEX.md проверены; актуальные оставлены без бессмысленных правок.",
        "Индекс содержит новый planning document и актуальную версию 0.6.46 там, где версия является действующим контрактом."
      ],
      "expected_commit_message": "docs: актуализировать документацию 0.6.46"
    }
  ],
  "blocked_reason": null,
  "user_decisions": [
    {
      "id": "80dd5516-8538-445b-aae5-9cc2a52ed298",
      "text": "19.09.2026 пользователь показал регрессию на реальном ChatGPT, поручил найти прежнюю реализацию, разобраться в причине, составить planning document и ToDo plan, исправить проблему и собрать новый релиз.",
      "recorded_at": "2026-09-19T09:49:27.601Z"
    }
  ],
  "owner_session_id": "web-pilot-c1ad15e8-e0f2-4d5d-81ba-1414cc1c2b99",
  "prepared_in_session_id": null
}
```
<!-- workflow-state:end -->

## Состояние

Execution Scope Status: ACTIVE
Delivery Status: IN_PROGRESS
Scope: chat-layout-regression-034
Current Task: нет
Revision: 9

## Цель

Восстановить компактное расположение последних сообщений ChatGPT: скрытые tool-call элементы не должны оставлять layout-footprint между последним видимым ответом и composer; сохранить ручную прокрутку и выпустить Project Web Pilot 0.6.46 для macOS и Windows.

## Критерии приёмки

- При включённом скрытии tool calls служебный tool-only turn/message wrapper полностью исключается из layout, если он не содержит пользовательского или содержательного assistant-текста.
- Обычный assistant/user message с полезным текстом никогда не скрывается целиком из-за вложенной tool-call строки.
- Существующая автопрокрутка после изменения layout пересчитывает низ без принудительного выхода из режима ручного чтения истории.
- Electron regression fixture покрывает прежнюю вложенную структуру и новую структуру, где tool call сам является message/turn boundary.
- Planning document фиксирует найденную исходную реализацию 0.6.22, причину регрессии и выбранный минимальный алгоритм.
- Node suite и Electron smoke проходят; Project Web Pilot 0.6.46 собран для macOS arm64 и Windows x64.

## Микрозадачи

- [DONE] T001: Зафиксировать причину регрессии и план исправления — Завершено
  - Git Commit: [DONE] docs: спланировать исправление layout скрытых tool calls
  - Reference: chat-layout-regression-034 / T001 / implementation
  - Файлы: docs/design/chat-message-layout-regression.md, docs/DOCUMENTATION_INDEX.md
- [DONE] T002: Убрать footprint tool-only message wrappers — Завершено
  - Git Commit: [DONE] fix(chat): убрать пустоту tool-only message wrappers
  - Reference: chat-layout-regression-034 / T002 / implementation
  - Файлы: src/main.mjs, tests/electron-smoke.mjs, docs/modules/workspace-sessions.md, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md
- [TODO] T003: Подготовить и собрать релиз 0.6.46 — Ожидает
  - Git Commit: [PENDING] build: выпустить Project Web Pilot 0.6.46
  - Reference: chat-layout-regression-034 / T003 / implementation
  - Файлы: package.json, package-lock.json, docs/VERIFICATION.md, docs/RELEASE.md
- [TODO] DOCS: Актуализация всех документов проекта — Ожидает
  - Git Commit: [PENDING] docs: актуализировать документацию 0.6.46
  - Reference: chat-layout-regression-034 / DOCS / implementation
  - Файлы: README.md, docs/architecture/OVERVIEW.md, docs/MODULES.md, docs/DOCUMENTATION_INDEX.md, docs/architecture/ARCHITECTURE.md, docs/WORKFLOW_START.md, docs/PRODUCT.md, docs/DECISIONS.md, docs/CONTEXT_DELIVERY.md, docs/VERIFICATION.md, docs/RELEASE.md, docs/CLEAN_INSTALL.md, docs/TRANSFER_TO_WINDOWS.md, docs/WORKSPACE_SETUP.md, docs/PROJECT_ARCHIVE.md, docs/SOURCE_WORKSPACES.md, docs/modules/workflow-kit-recovery.md, docs/modules/project-doctor.md, docs/modules/runtime-lifecycle.md, docs/modules/workspace-sessions.md, docs/modules/session-owned-plans.md, docs/modules/session-opening-performance.md, docs/modules/first-run-onboarding.md, docs/design/session-plan-navigation.md, docs/design/chat-message-layout-regression.md

## Context Pack For This Cycle

- docs/architecture/OVERVIEW.md → Краткая архитектура проекта
- docs/MODULES.md → Модули проекта
- docs/DOCUMENTATION_INDEX.md → Каталог документации
- docs/modules/workspace-sessions.md → Module Specification — Workspace & Sessions / Скрытые tool-call строки и автопрокрутка — scope hidden-tool-scroll-023

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
