# Активный план — Project Web Pilot

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 14,
  "project_id": "cf944136-d1fc-4bd5-9ea0-e46d1fe230e7",
  "project_name": "Project Web Pilot",
  "scope_id": "first-run-corrections-032",
  "execution_scope_status": "ACTIVE",
  "delivery_status": "READY_FOR_ACCEPTANCE",
  "objective": "Исправить отказ ввода туннеля и повторную кнопку установки Apple, выпустить 0.6.38 для нового чистого клона.",
  "acceptance_criteria": [
    "Два подтверждённых дефекта исправлены и проверены.",
    "Новый релиз доступен для чистого пользовательского повтора; полный гостевой путь не объявляется пройденным до проверки."
  ],
  "approved_scope": {
    "functional_paths": [
      "resources/runtime-control/mac-first-run.py",
      "tests/mac-first-run.test.mjs",
      "src/mac-runtime.mjs",
      "tests/mac-runtime.test.mjs",
      "src/startup-readiness.mjs",
      "tests/startup-readiness.test.mjs",
      "src/ui/startup.mjs",
      "tests/startup-ui.test.mjs",
      "package.json",
      "package-lock.json"
    ],
    "documentation_paths": [
      "docs/modules/first-run-onboarding.md",
      "docs/architecture/ARCHITECTURE.md",
      "docs/VERIFICATION.md",
      "AGENTS.md",
      "README.md",
      "docs/WORKFLOW_START.md",
      "docs/PRODUCT.md",
      "docs/DECISIONS.md",
      "docs/architecture/OVERVIEW.md",
      "docs/MODULES.md",
      "docs/DOCUMENTATION_INDEX.md",
      "docs/CLEAN_INSTALL.md",
      "docs/RELEASE.md",
      "docs/TRANSFER_TO_WINDOWS.md",
      "docs/modules/runtime-lifecycle.md",
      "docs/WORKSPACE_SETUP.md",
      "docs/CONTEXT_DELIVERY.md"
    ],
    "max_functional_files_per_task": 3
  },
  "baseline_commit": "de661a037741e510c5742bb46f267438cf9bf6bd",
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
        "path": "docs/modules/first-run-onboarding.md",
        "heading_path": [
          "Первый запуск Web Pilot на чистой системе"
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
        "scope_id": "first-run-corrections-032",
        "task_id": "T001",
        "role": "implementation"
      },
      "dependencies": [],
      "functional_paths": [
        "resources/runtime-control/mac-first-run.py",
        "tests/mac-first-run.test.mjs"
      ],
      "documentation_paths": [
        "docs/modules/first-run-onboarding.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "suite"
      ],
      "id": "T001",
      "title": "Исправить русские системные окна ввода туннеля",
      "why": "Исправить русские системные окна ввода туннеля",
      "acceptance_criteria": [
        "Оба реально сформированных AppleScript проходят системный компилятор, включая скрытый ключ.",
        "Отмена не сохраняет данные; отказ окна отделён от неверных значений; секреты не выводятся."
      ],
      "expected_commit_message": "fix: preserve Unicode in native tunnel prompts"
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "first-run-corrections-032",
        "task_id": "T002",
        "role": "implementation"
      },
      "dependencies": [
        "T001"
      ],
      "functional_paths": [
        "src/mac-runtime.mjs",
        "tests/mac-runtime.test.mjs"
      ],
      "documentation_paths": [
        "docs/modules/first-run-onboarding.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "suite"
      ],
      "id": "T002",
      "title": "Показывать точную причину отказа настройки подключения",
      "why": "Показывать точную причину отказа настройки подключения",
      "acceptance_criteria": [
        "Известные безопасные коды окна, данных и сохранения различаются.",
        "Неизвестные stderr и ключи не попадают в UI; повтор и отмена сохраняются."
      ],
      "expected_commit_message": "fix: distinguish tunnel prompt and save failures"
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "first-run-corrections-032",
        "task_id": "T003",
        "role": "implementation"
      },
      "dependencies": [
        "T002"
      ],
      "functional_paths": [
        "src/startup-readiness.mjs",
        "tests/startup-readiness.test.mjs"
      ],
      "documentation_paths": [
        "docs/modules/first-run-onboarding.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "suite"
      ],
      "id": "T003",
      "title": "Проверять завершение установки Apple автоматически",
      "why": "Проверять завершение установки Apple автоматически",
      "acceptance_criteria": [
        "Принятый запрос установки исключает повторный запуск, включая отказ показа окна.",
        "Ограниченный последовательный опрос проверяет Git, отменяется при dispose и не запускает подготовку автоматически.",
        "После подтверждённого Git остаётся явный следующий шаг проверки и подготовки."
      ],
      "expected_commit_message": "fix: observe Apple component installation readiness"
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "first-run-corrections-032",
        "task_id": "T004",
        "role": "implementation"
      },
      "dependencies": [
        "T003"
      ],
      "functional_paths": [
        "src/ui/startup.mjs",
        "tests/startup-ui.test.mjs"
      ],
      "documentation_paths": [
        "docs/modules/first-run-onboarding.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "suite",
        "electron-smoke"
      ],
      "id": "T004",
      "title": "Скрывать повторную установку Apple и показывать следующий шаг",
      "why": "Скрывать повторную установку Apple и показывать следующий шаг",
      "acceptance_criteria": [
        "После запуска установки и при готовом Git кнопка установки скрыта и недоступна.",
        "Состояние ожидания и переход Проверить и продолжить соответствуют реальной готовности."
      ],
      "expected_commit_message": "fix: keep Apple installer action out of the next step"
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "first-run-corrections-032",
        "task_id": "T005",
        "role": "implementation"
      },
      "dependencies": [
        "T004"
      ],
      "functional_paths": [
        "package.json",
        "package-lock.json"
      ],
      "documentation_paths": [
        "docs/modules/first-run-onboarding.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md",
        "docs/RELEASE.md",
        "docs/TRANSFER_TO_WINDOWS.md"
      ],
      "verification_ids": [
        "suite",
        "electron-smoke"
      ],
      "id": "T005",
      "title": "Собрать и проверить релиз 0.6.38",
      "why": "Собрать и проверить релиз 0.6.38",
      "acceptance_criteria": [
        "Собраны macOS arm64 и Windows x64, постоянный app обновлён с сохранением identity.",
        "Сверены source, packaged resources, версии и ZIP; проверены оба packaged AppleScript.",
        "Готовые ZIP и инструкция для чистого клона находятся в Downloads/WebPilot-0.6.38."
      ],
      "expected_commit_message": "build: release first-run prompt and Apple readiness fixes"
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "first-run-corrections-032",
        "task_id": "DOCS",
        "role": "implementation"
      },
      "dependencies": [
        "T001",
        "T002",
        "T003",
        "T004",
        "T005"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/modules/first-run-onboarding.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md",
        "AGENTS.md",
        "README.md",
        "docs/WORKFLOW_START.md",
        "docs/PRODUCT.md",
        "docs/DECISIONS.md",
        "docs/architecture/OVERVIEW.md",
        "docs/MODULES.md",
        "docs/DOCUMENTATION_INDEX.md",
        "docs/CLEAN_INSTALL.md",
        "docs/RELEASE.md",
        "docs/TRANSFER_TO_WINDOWS.md",
        "docs/modules/runtime-lifecycle.md",
        "docs/WORKSPACE_SETUP.md",
        "docs/CONTEXT_DELIVERY.md"
      ],
      "verification_ids": [],
      "id": "DOCS",
      "title": "Актуализация всех документов проекта",
      "why": "Зафиксировать текущий релиз и подтверждённые границы пользовательской проверки.",
      "acceptance_criteria": [
        "Документы по индексу просмотрены, устаревшие сведения исправлены.",
        "Успех компонентов в Test macOS 02, дефект фокуса Apple и ожидаемый чистый повтор 0.6.38 указаны раздельно.",
        "План прежней сессии сохранён; текущий план завершается без архивирования."
      ],
      "expected_commit_message": "docs: deliver first-run correction release 0.6.38"
    }
  ],
  "blocked_reason": null,
  "user_decisions": [
    {
      "id": "27fd19a3-6f82-4f02-a708-d2bfa92a67ac",
      "text": "18.09.2026 пользователь поручил добавить микрозадачу, исправить ошибку окна ввода туннеля и собрать новый релиз; отдельным сообщением включил оставшуюся кнопку установки Apple. Эта новая сессия имела NONE; исправления продолжают контракт first-run-onboarding-031 в собственном плане без изменения владельца прежнего плана.",
      "recorded_at": "2026-09-18T06:26:33.094Z"
    }
  ],
  "owner_session_id": "01a0b318-cc66-7743-9de7-696f05fff6e6",
  "prepared_in_session_id": null
}
```
<!-- workflow-state:end -->

## Состояние

Execution Scope Status: ACTIVE
Delivery Status: READY_FOR_ACCEPTANCE
Scope: first-run-corrections-032
Current Task: нет
Revision: 14

## Цель

Исправить отказ ввода туннеля и повторную кнопку установки Apple, выпустить 0.6.38 для нового чистого клона.

## Критерии приёмки

- Два подтверждённых дефекта исправлены и проверены.
- Новый релиз доступен для чистого пользовательского повтора; полный гостевой путь не объявляется пройденным до проверки.

## Микрозадачи

- [DONE] T001: Исправить русские системные окна ввода туннеля — Завершено
  - Git Commit: [DONE] fix: preserve Unicode in native tunnel prompts
  - Reference: first-run-corrections-032 / T001 / implementation
  - Файлы: resources/runtime-control/mac-first-run.py, tests/mac-first-run.test.mjs, docs/modules/first-run-onboarding.md, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md
- [DONE] T002: Показывать точную причину отказа настройки подключения — Завершено
  - Git Commit: [DONE] fix: distinguish tunnel prompt and save failures
  - Reference: first-run-corrections-032 / T002 / implementation
  - Файлы: src/mac-runtime.mjs, tests/mac-runtime.test.mjs, docs/modules/first-run-onboarding.md, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md
- [DONE] T003: Проверять завершение установки Apple автоматически — Завершено
  - Git Commit: [DONE] fix: observe Apple component installation readiness
  - Reference: first-run-corrections-032 / T003 / implementation
  - Файлы: src/startup-readiness.mjs, tests/startup-readiness.test.mjs, docs/modules/first-run-onboarding.md, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md
- [DONE] T004: Скрывать повторную установку Apple и показывать следующий шаг — Завершено
  - Git Commit: [DONE] fix: keep Apple installer action out of the next step
  - Reference: first-run-corrections-032 / T004 / implementation
  - Файлы: src/ui/startup.mjs, tests/startup-ui.test.mjs, docs/modules/first-run-onboarding.md, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md
- [DONE] T005: Собрать и проверить релиз 0.6.38 — Завершено
  - Git Commit: [DONE] build: release first-run prompt and Apple readiness fixes
  - Reference: first-run-corrections-032 / T005 / implementation
  - Файлы: package.json, package-lock.json, docs/modules/first-run-onboarding.md, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md, docs/RELEASE.md, docs/TRANSFER_TO_WINDOWS.md
- [DONE] DOCS: Актуализация всех документов проекта — Завершено
  - Git Commit: [DONE] docs: deliver first-run correction release 0.6.38
  - Reference: first-run-corrections-032 / DOCS / implementation
  - Файлы: docs/modules/first-run-onboarding.md, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md, AGENTS.md, README.md, docs/WORKFLOW_START.md, docs/PRODUCT.md, docs/DECISIONS.md, docs/architecture/OVERVIEW.md, docs/MODULES.md, docs/DOCUMENTATION_INDEX.md, docs/CLEAN_INSTALL.md, docs/RELEASE.md, docs/TRANSFER_TO_WINDOWS.md, docs/modules/runtime-lifecycle.md, docs/WORKSPACE_SETUP.md, docs/CONTEXT_DELIVERY.md

## Context Pack For This Cycle

- docs/architecture/OVERVIEW.md → Краткая архитектура проекта
- docs/MODULES.md → Модули проекта
- docs/DOCUMENTATION_INDEX.md → Каталог документации
- docs/modules/first-run-onboarding.md → Первый запуск Web Pilot на чистой системе

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
