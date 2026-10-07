# Активный план — Project Web Pilot

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 1457,
  "project_id": "cf944136-d1fc-4bd5-9ea0-e46d1fe230e7",
  "project_name": "Project Web Pilot",
  "scope_id": "refactor-fixes-20261007",
  "execution_scope_status": "ACTIVE",
  "delivery_status": "IN_PROGRESS",
  "objective": "Исправление ошибок, найденных живой приёмкой после рефакторинга Workflow Kit: автоматическая отправка каждого старта сессии и отсутствие брошенных копий хранилища; выпуск Web Pilot 0.6.100.",
  "acceptance_criteria": [
    "Исправление ошибок, найденных живой приёмкой после рефакторинга Workflow Kit: автоматическая отправка каждого старта сессии и отсутствие брошенных копий хранилища; выпуск Web Pilot 0.6.100."
  ],
  "approved_scope": {
    "functional_paths": [
      "src/context-session.mjs",
      "tests/context-session.test.mjs",
      "tests/chatgpt-composer.test.mjs",
      "package.json",
      "package-lock.json",
      "src/workspace-session.mjs",
      "src/workspace-deletion.mjs",
      "tests/workspace-session.test.mjs",
      "tests/workspace-deletion.test.mjs",
      "tools/codex-app-server-mcp/server.py",
      "src/mac-runtime-switch.mjs",
      "tests/codex-app-server-mcp.test.mjs",
      "tests/mac-runtime-switch.test.mjs"
    ],
    "documentation_paths": [
      "docs/planning/refactor-fixes.md",
      "docs/modules/context-delivery.md",
      "docs/planning/correction-round-0.6.99.md",
      "docs/planning/workflow-kit-context-refactor.md",
      "docs/planning/workflow-kit-context-transition.md",
      "docs/modules/workspace-sessions.md",
      "docs/modules/project-archive.md",
      "README.md",
      "docs/architecture/OVERVIEW.md",
      "docs/modules/chatgpt-dom-compatibility.md",
      "docs/modules/workspace-setup.md",
      "packages/workflow-kit/docs/modules/workflow-kit-package.md",
      "docs/modules/codex-app-server-executor.md"
    ]
  },
  "baseline_commit": "ca5a25740a0bd5f6b05973b50e94d123061c088f",
  "current_task_id": null,
  "context_pack": {
    "documents": [
      {
        "path": "docs/architecture/OVERVIEW.md",
        "required": true,
        "revision": "WORKTREE"
      },
      {
        "path": "docs/planning/refactor-fixes.md",
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
        "scope_id": "refactor-fixes-20261007",
        "task_id": "T001",
        "role": "implementation"
      },
      "dependencies": [],
      "functional_paths": [
        "src/context-session.mjs",
        "tests/context-session.test.mjs",
        "tests/chatgpt-composer.test.mjs",
        "package.json",
        "package-lock.json"
      ],
      "documentation_paths": [
        "docs/planning/refactor-fixes.md",
        "docs/modules/context-delivery.md",
        "docs/planning/correction-round-0.6.99.md",
        "docs/planning/workflow-kit-context-refactor.md",
        "docs/planning/workflow-kit-context-transition.md"
      ],
      "verification_ids": [
        "unit-all",
        "electron-smoke"
      ],
      "id": "T001",
      "title": "Уникальные короткие имена частей контекста",
      "why": "Регрессия 0.6.99: ChatGPT переименовывает повторное имя вложения в «…(1).md», карточки не распознаются, второй старт не отправляется.",
      "verification_kind": "code",
      "acceptance_criteria": [
        "Части называются context-<8 hex requestId>-NN-of-M.md; два старта дают разные имена.",
        "Карточка, переименованная ChatGPT, не считается своей; распознавание по точному имени и строка о списке /mnt/data сохранены.",
        "Версия Web Pilot 0.6.100."
      ],
      "expected_commit_message": "fix: уникальные имена частей контекста",
      "actual_files": [
        "package-lock.json",
        "package.json",
        "src/context-session.mjs",
        "tests/chatgpt-composer.test.mjs",
        "tests/context-session.test.mjs"
      ]
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "refactor-fixes-20261007",
        "task_id": "T002",
        "role": "implementation"
      },
      "dependencies": [
        "T001"
      ],
      "functional_paths": [
        "src/workspace-session.mjs",
        "src/workspace-deletion.mjs",
        "tests/workspace-session.test.mjs",
        "tests/workspace-deletion.test.mjs"
      ],
      "documentation_paths": [
        "docs/planning/refactor-fixes.md",
        "docs/modules/workspace-sessions.md",
        "docs/modules/project-archive.md"
      ],
      "verification_ids": [
        "unit-all"
      ],
      "id": "T002",
      "title": "Брошенные временные файлы хранилища",
      "why": "Прерванные атомарные записи оставляют workspaces.json.tmp-* с записями проектов, в том числе удалённых.",
      "verification_kind": "code",
      "acceptance_criteria": [
        "Неудачная запись не оставляет временного файла.",
        "Загрузка хранилища удаляет осиротевшие временные файлы и не трогает посторонние.",
        "Удаление проекта и локальное удаление сессий удаляют осиротевшие временные файлы без гонки с собственной записью."
      ],
      "expected_commit_message": "fix: очистка брошенных временных копий хранилища",
      "actual_files": [
        "src/workspace-deletion.mjs",
        "src/workspace-session.mjs",
        "tests/workspace-deletion.test.mjs",
        "tests/workspace-session.test.mjs"
      ]
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "refactor-fixes-20261007",
        "task_id": "DOCS",
        "role": "implementation"
      },
      "dependencies": [
        "T001",
        "T002"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/planning/refactor-fixes.md",
        "README.md",
        "docs/architecture/OVERVIEW.md",
        "docs/modules/context-delivery.md",
        "docs/planning/correction-round-0.6.99.md",
        "docs/planning/workflow-kit-context-refactor.md",
        "docs/planning/workflow-kit-context-transition.md",
        "docs/modules/workspace-sessions.md",
        "docs/modules/project-archive.md",
        "docs/modules/chatgpt-dom-compatibility.md",
        "docs/modules/workspace-setup.md",
        "packages/workflow-kit/docs/modules/workflow-kit-package.md"
      ],
      "verification_ids": [],
      "id": "DOCS",
      "title": "Актуализация всех документов проекта",
      "why": "Сохранить актуальный контекст для следующего агента",
      "acceptance_criteria": [
        "Документы соответствуют результату"
      ],
      "expected_commit_message": "docs: актуализировать контекст проекта",
      "actual_files": [
        "README.md",
        "docs/modules/chatgpt-dom-compatibility.md",
        "docs/modules/context-delivery.md",
        "docs/modules/project-archive.md",
        "docs/modules/workspace-sessions.md",
        "docs/modules/workspace-setup.md",
        "docs/planning/correction-round-0.6.99.md",
        "docs/planning/workflow-kit-context-refactor.md",
        "docs/planning/workflow-kit-context-transition.md",
        "packages/workflow-kit/docs/modules/workflow-kit-package.md"
      ]
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "refactor-fixes-20261007",
        "task_id": "T003",
        "role": "implementation"
      },
      "dependencies": [
        "T001",
        "T002",
        "DOCS"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/planning/refactor-fixes.md"
      ],
      "verification_ids": [
        "paired-release"
      ],
      "id": "T003",
      "title": "Собрать парный выпуск 0.6.100",
      "why": "Собрать парный выпуск 0.6.100",
      "verification_kind": "package",
      "acceptance_criteria": [
        "После DOCS одна сборка macOS/Windows; manifest и хеши подтверждены."
      ],
      "expected_commit_message": "release: собрать Web Pilot 0.6.100",
      "actual_files": []
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "refactor-fixes-20261007",
        "task_id": "T004",
        "role": "implementation"
      },
      "dependencies": [
        "T003",
        "DOCS"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/planning/refactor-fixes.md"
      ],
      "verification_ids": [
        "release-installed"
      ],
      "id": "T004",
      "title": "Установить готовый выпуск 0.6.100",
      "why": "Установить готовый выпуск 0.6.100",
      "verification_kind": "installed",
      "acceptance_criteria": [
        "Обе macOS-копии соответствуют пакетам, identity и подпись сохранены; без пересборки."
      ],
      "expected_commit_message": "release: установить Web Pilot 0.6.100",
      "actual_files": []
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "refactor-fixes-20261007",
        "task_id": "T005",
        "role": "implementation"
      },
      "dependencies": [
        "T004",
        "DOCS"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/planning/refactor-fixes.md"
      ],
      "verification_ids": [
        "github-release"
      ],
      "id": "T005",
      "title": "Опубликовать выпуск 0.6.100",
      "why": "Опубликовать выпуск 0.6.100",
      "verification_kind": "package",
      "acceptance_criteria": [
        "Source/tag/шесть assets совпадают с manifest; push; READY_FOR_ACCEPTANCE."
      ],
      "expected_commit_message": "release: опубликовать Web Pilot 0.6.100",
      "actual_files": []
    },
    {
      "id": "T006",
      "title": "Правило долгих команд исполнителя",
      "why": "Исполнитель завершает процессы команды при её возврате; агент уводил npm test в фон через nohup &, и процесс исчезал с пустым журналом.",
      "dependencies": [],
      "functional_paths": [
        "tools/codex-app-server-mcp/server.py",
        "src/mac-runtime-switch.mjs",
        "tests/codex-app-server-mcp.test.mjs",
        "tests/context-session.test.mjs",
        "package.json",
        "package-lock.json",
        "tests/mac-runtime-switch.test.mjs"
      ],
      "documentation_paths": [
        "docs/planning/refactor-fixes.md",
        "docs/modules/codex-app-server-executor.md",
        "docs/modules/context-delivery.md",
        "docs/modules/workspace-sessions.md"
      ],
      "verification_ids": [
        "unit-all",
        "executor-channel",
        "codex-tools-live"
      ],
      "verification_kind": "code",
      "acceptance_criteria": [
        "LONG_COMMAND_RULE в instructions сервера и описании exec_command; третья строка EXECUTOR_TOOL_RULES в стартовом сообщении.",
        "Тексты закреплены тестами; поведение исполнителя не меняется.",
        "Версия Web Pilot 0.6.101."
      ],
      "expected_commit_message": "fix: правило долгих команд исполнителя",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "refactor-fixes-20261007",
        "task_id": "T006",
        "role": "implementation"
      },
      "actual_files": [
        "package-lock.json",
        "package.json",
        "src/mac-runtime-switch.mjs",
        "tests/codex-app-server-mcp.test.mjs",
        "tests/context-session.test.mjs",
        "tests/mac-runtime-switch.test.mjs",
        "tools/codex-app-server-mcp/server.py"
      ]
    },
    {
      "id": "DOCS-2",
      "title": "Актуализация всех документов проекта",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "refactor-fixes-20261007",
        "task_id": "DOCS-2",
        "role": "implementation",
        "iteration": 2
      },
      "why": "Перед выпуском сверить README, OVERVIEW и действующие контракты модулей с результатом; обновить устаревшее.",
      "dependencies": [
        "T006"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/architecture/OVERVIEW.md",
        "docs/planning/refactor-fixes.md",
        "docs/modules/codex-app-server-executor.md",
        "docs/modules/context-delivery.md",
        "docs/modules/workspace-sessions.md",
        "README.md"
      ],
      "acceptance_criteria": [
        "Документы описывают текущий результат, существенное из выпущенных рабочих спецификаций перенесено в контракты модулей; история остаётся в Git."
      ],
      "verification_ids": [],
      "expected_commit_message": "docs: актуализировать документацию проекта",
      "actual_files": [
        "README.md",
        "docs/modules/codex-app-server-executor.md",
        "docs/modules/context-delivery.md",
        "docs/modules/workspace-sessions.md"
      ]
    },
    {
      "id": "T007",
      "title": "Собрать парный выпуск 0.6.101",
      "why": "Собрать парный выпуск 0.6.101",
      "dependencies": [
        "T006",
        "DOCS-2"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/planning/refactor-fixes.md"
      ],
      "verification_ids": [
        "paired-release"
      ],
      "verification_kind": "package",
      "acceptance_criteria": [
        "После DOCS одна сборка macOS/Windows; manifest и хеши подтверждены."
      ],
      "expected_commit_message": "release: собрать Web Pilot 0.6.101",
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "refactor-fixes-20261007",
        "task_id": "T007",
        "role": "implementation"
      }
    },
    {
      "id": "T008",
      "title": "Установить готовый выпуск 0.6.101",
      "why": "Установить готовый выпуск 0.6.101",
      "dependencies": [
        "T007",
        "DOCS-2"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/planning/refactor-fixes.md"
      ],
      "verification_ids": [
        "release-installed"
      ],
      "verification_kind": "installed",
      "acceptance_criteria": [
        "Обе macOS-копии соответствуют пакетам, identity и подпись сохранены; без пересборки."
      ],
      "expected_commit_message": "release: установить Web Pilot 0.6.101",
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "refactor-fixes-20261007",
        "task_id": "T008",
        "role": "implementation"
      }
    },
    {
      "id": "T009",
      "title": "Опубликовать выпуск 0.6.101",
      "why": "Опубликовать выпуск 0.6.101",
      "dependencies": [
        "T008",
        "DOCS-2"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/planning/refactor-fixes.md"
      ],
      "verification_ids": [
        "github-release"
      ],
      "verification_kind": "package",
      "acceptance_criteria": [
        "Source/tag/шесть assets совпадают с manifest; push; READY_FOR_ACCEPTANCE."
      ],
      "expected_commit_message": "release: опубликовать Web Pilot 0.6.101",
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "refactor-fixes-20261007",
        "task_id": "T009",
        "role": "implementation"
      }
    }
  ],
  "blocked_reason": null,
  "user_decisions": [
    {
      "id": "298b81ca-13a0-438c-b9c6-d95d6849cfd6",
      "text": "Прямое поручение пользователя 07.10.2026: открыть новый план исправлений после рефакторинга, выполнить, собрать, установить и опубликовать.",
      "recorded_at": "2026-10-07T13:13:51.374Z"
    }
  ]
}
```
<!-- workflow-state:end -->

## Состояние

Execution Scope Status: ACTIVE
Delivery Status: IN_PROGRESS
Scope: refactor-fixes-20261007
Current Task: нет
Revision: 1457

## Цель

Исправление ошибок, найденных живой приёмкой после рефакторинга Workflow Kit: автоматическая отправка каждого старта сессии и отсутствие брошенных копий хранилища; выпуск Web Pilot 0.6.100.

## Критерии приёмки

- Исправление ошибок, найденных живой приёмкой после рефакторинга Workflow Kit: автоматическая отправка каждого старта сессии и отсутствие брошенных копий хранилища; выпуск Web Pilot 0.6.100.

## Микрозадачи

- [DONE] T001: Уникальные короткие имена частей контекста — Завершено
  - Git Commit: [DONE] fix: уникальные имена частей контекста
  - Reference: refactor-fixes-20261007 / T001 / implementation
  - Файлы: src/context-session.mjs, tests/context-session.test.mjs, tests/chatgpt-composer.test.mjs, package.json, package-lock.json, docs/planning/refactor-fixes.md, docs/modules/context-delivery.md, docs/planning/correction-round-0.6.99.md, docs/planning/workflow-kit-context-refactor.md, docs/planning/workflow-kit-context-transition.md
- [DONE] T002: Брошенные временные файлы хранилища — Завершено
  - Git Commit: [DONE] fix: очистка брошенных временных копий хранилища
  - Reference: refactor-fixes-20261007 / T002 / implementation
  - Файлы: src/workspace-session.mjs, src/workspace-deletion.mjs, tests/workspace-session.test.mjs, tests/workspace-deletion.test.mjs, docs/planning/refactor-fixes.md, docs/modules/workspace-sessions.md, docs/modules/project-archive.md
- [DONE] DOCS: Актуализация всех документов проекта — Завершено
  - Git Commit: [DONE] docs: актуализировать контекст проекта
  - Reference: refactor-fixes-20261007 / DOCS / implementation
  - Файлы: docs/planning/refactor-fixes.md, README.md, docs/architecture/OVERVIEW.md, docs/modules/context-delivery.md, docs/planning/correction-round-0.6.99.md, docs/planning/workflow-kit-context-refactor.md, docs/planning/workflow-kit-context-transition.md, docs/modules/workspace-sessions.md, docs/modules/project-archive.md, docs/modules/chatgpt-dom-compatibility.md, docs/modules/workspace-setup.md, packages/workflow-kit/docs/modules/workflow-kit-package.md
- [DONE] T003: Собрать парный выпуск 0.6.100 — Завершено
  - Git Commit: [DONE] release: собрать Web Pilot 0.6.100
  - Reference: refactor-fixes-20261007 / T003 / implementation
  - Файлы: docs/planning/refactor-fixes.md
- [DONE] T004: Установить готовый выпуск 0.6.100 — Завершено
  - Git Commit: [DONE] release: установить Web Pilot 0.6.100
  - Reference: refactor-fixes-20261007 / T004 / implementation
  - Файлы: docs/planning/refactor-fixes.md
- [DONE] T005: Опубликовать выпуск 0.6.100 — Завершено
  - Git Commit: [DONE] release: опубликовать Web Pilot 0.6.100
  - Reference: refactor-fixes-20261007 / T005 / implementation
  - Файлы: docs/planning/refactor-fixes.md
- [DONE] T006: Правило долгих команд исполнителя — Завершено
  - Git Commit: [DONE] fix: правило долгих команд исполнителя
  - Reference: refactor-fixes-20261007 / T006 / implementation
  - Файлы: tools/codex-app-server-mcp/server.py, src/mac-runtime-switch.mjs, tests/codex-app-server-mcp.test.mjs, tests/context-session.test.mjs, package.json, package-lock.json, tests/mac-runtime-switch.test.mjs, docs/planning/refactor-fixes.md, docs/modules/codex-app-server-executor.md, docs/modules/context-delivery.md, docs/modules/workspace-sessions.md
- [DONE] DOCS-2: Актуализация всех документов проекта — Завершено
  - Git Commit: [DONE] docs: актуализировать документацию проекта
  - Reference: refactor-fixes-20261007 / DOCS-2 / implementation
  - Файлы: docs/architecture/OVERVIEW.md, docs/planning/refactor-fixes.md, docs/modules/codex-app-server-executor.md, docs/modules/context-delivery.md, docs/modules/workspace-sessions.md, README.md
- [TODO] T007: Собрать парный выпуск 0.6.101 — Ожидает
  - Git Commit: [PENDING] release: собрать Web Pilot 0.6.101
  - Reference: refactor-fixes-20261007 / T007 / implementation
  - Файлы: docs/planning/refactor-fixes.md
- [TODO] T008: Установить готовый выпуск 0.6.101 — Ожидает
  - Git Commit: [PENDING] release: установить Web Pilot 0.6.101
  - Reference: refactor-fixes-20261007 / T008 / implementation
  - Файлы: docs/planning/refactor-fixes.md
- [TODO] T009: Опубликовать выпуск 0.6.101 — Ожидает
  - Git Commit: [PENDING] release: опубликовать Web Pilot 0.6.101
  - Reference: refactor-fixes-20261007 / T009 / implementation
  - Файлы: docs/planning/refactor-fixes.md

## Context Pack For This Cycle

- docs/architecture/OVERVIEW.md
- docs/planning/refactor-fixes.md

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
