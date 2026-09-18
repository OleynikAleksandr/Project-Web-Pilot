# Активный план — Project Web Pilot

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 8,
  "project_id": "cf944136-d1fc-4bd5-9ea0-e46d1fe230e7",
  "project_name": "Project Web Pilot",
  "scope_id": "windows-onboarding-033",
  "execution_scope_status": "ACTIVE",
  "delivery_status": "IN_PROGRESS",
  "objective": "Довести Windows-мастер до согласованного macOS-пути и выпустить обе платформы одним комплектом 0.6.41.",
  "acceptance_criteria": [
    "Windows показывает и выполняет шаги компонентов, туннеля и создания проекта после входа",
    "Данные подключения проходят существующее защищённое хранилище Windows; настройки сохраняются",
    "macOS сохраняет рабочее поведение, обе платформы выпущены как 0.6.41",
    "Source, tests, packaged fixtures и состав ZIP проверены; реальное подключение и приёмка в госте отдельно подтверждаются пользователем"
  ],
  "approved_scope": {
    "functional_paths": [
      "resources/runtime-control/windows-first-run.py",
      "tests/windows-first-run.test.mjs",
      "src/windows-runtime.mjs",
      "tests/windows-runtime.test.mjs",
      "src/startup-platform.mjs",
      "src/startup-readiness.mjs",
      "tests/startup-platform.test.mjs",
      "src/main.mjs",
      "src/workspace-setup.mjs",
      "tests/workspace-setup.test.mjs",
      "src/ui/startup.mjs",
      "src/ui/index.html",
      "tests/startup-ui.test.mjs",
      "scripts/release-all.mjs",
      "package.json",
      "package-lock.json",
      "tests/electron-smoke.mjs",
      "tests/release-all.test.mjs",
      "scripts/verify-windows-package.mjs"
    ],
    "documentation_paths": [
      "AGENTS.md",
      "README.md",
      "docs/WORKFLOW_START.md",
      "docs/PRODUCT.md",
      "docs/DECISIONS.md",
      "docs/architecture/OVERVIEW.md",
      "docs/MODULES.md",
      "docs/DOCUMENTATION_INDEX.md",
      "docs/CLEAN_INSTALL.md",
      "docs/TRANSFER_TO_WINDOWS.md",
      "docs/RELEASE.md",
      "docs/WORKSPACE_SETUP.md",
      "docs/CONTEXT_DELIVERY.md",
      "docs/modules/runtime-lifecycle.md",
      "docs/modules/workspace-sessions.md",
      "docs/architecture/ARCHITECTURE.md",
      "docs/VERIFICATION.md",
      "docs/modules/first-run-onboarding.md"
    ],
    "max_functional_files_per_task": 3
  },
  "baseline_commit": "3d5ece83f1b1a5565bf419b1da3502ed29e58891",
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
        "scope_id": "windows-onboarding-033",
        "task_id": "P001",
        "role": "implementation"
      },
      "dependencies": [],
      "functional_paths": [],
      "documentation_paths": [
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md",
        "docs/modules/first-run-onboarding.md",
        "docs/DECISIONS.md",
        "docs/modules/runtime-lifecycle.md",
        "docs/RELEASE.md",
        "docs/CLEAN_INSTALL.md"
      ],
      "verification_ids": [],
      "id": "P001",
      "title": "Уточнить контракт Windows первого запуска и парного релиза",
      "why": "Уточнить контракт Windows первого запуска и парного релиза",
      "acceptance_criteria": [
        "Зафиксированы наблюдение пользователя, фасады, границы секретов и единый релиз 0.6.41"
      ],
      "expected_commit_message": "docs: Уточнить контракт Windows первого запуска и парного релиза"
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "windows-onboarding-033",
        "task_id": "W001",
        "role": "implementation"
      },
      "dependencies": [
        "P001"
      ],
      "functional_paths": [
        "resources/runtime-control/windows-first-run.py",
        "tests/windows-first-run.test.mjs"
      ],
      "documentation_paths": [
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md",
        "docs/modules/first-run-onboarding.md"
      ],
      "verification_ids": [
        "suite"
      ],
      "id": "W001",
      "title": "Добавить нативный защищённый ввод подключения Windows",
      "why": "Добавить нативный защищённый ввод подключения Windows",
      "acceptance_criteria": [
        "Clipboard stdin и ручной диалог используют DPAPI через существующий control",
        "Отмена и неверные данные не останавливают службы и не меняют сохранённые настройки"
      ],
      "expected_commit_message": "feat: Добавить нативный защищённый ввод подключения Windows"
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "windows-onboarding-033",
        "task_id": "W002",
        "role": "implementation"
      },
      "dependencies": [
        "W001"
      ],
      "functional_paths": [
        "src/windows-runtime.mjs",
        "tests/windows-runtime.test.mjs"
      ],
      "documentation_paths": [
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md",
        "docs/modules/first-run-onboarding.md",
        "docs/modules/runtime-lifecycle.md"
      ],
      "verification_ids": [
        "suite"
      ],
      "id": "W002",
      "title": "Подключить настройку туннеля и комплектный Git к Windows bootstrap",
      "why": "Подключить настройку туннеля и комплектный Git к Windows bootstrap",
      "acceptance_criteria": [
        "Bootstrap использует worker без ключей в argv, окружении или renderer",
        "Проверяется комплектный Git и выдаётся окружение Workflow Kit"
      ],
      "expected_commit_message": "feat: Подключить настройку туннеля и комплектный Git к Windows bootstrap"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "windows-onboarding-033",
        "task_id": "W003",
        "role": "implementation"
      },
      "dependencies": [
        "W002"
      ],
      "functional_paths": [
        "src/startup-platform.mjs",
        "src/startup-readiness.mjs",
        "tests/startup-platform.test.mjs"
      ],
      "documentation_paths": [
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md",
        "docs/modules/first-run-onboarding.md"
      ],
      "verification_ids": [
        "suite"
      ],
      "id": "W003",
      "title": "Объединить первый запуск через платформенные адаптеры",
      "why": "Объединить первый запуск через платформенные адаптеры",
      "acceptance_criteria": [
        "Обе платформы используют общий coordinator",
        "Windows готовит комплект до проверки Git; macOS сохраняет прежний порядок",
        "Проверены отказ подготовки, повтор и восстановление готового подключения"
      ],
      "expected_commit_message": "feat: Объединить первый запуск через платформенные адаптеры"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "windows-onboarding-033",
        "task_id": "W004",
        "role": "implementation"
      },
      "dependencies": [
        "W003"
      ],
      "functional_paths": [
        "src/main.mjs",
        "src/workspace-setup.mjs",
        "tests/workspace-setup.test.mjs"
      ],
      "documentation_paths": [
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md",
        "docs/modules/first-run-onboarding.md",
        "docs/WORKSPACE_SETUP.md"
      ],
      "verification_ids": [
        "suite"
      ],
      "id": "W004",
      "title": "Включить Windows мастер и окружение создания проектов",
      "why": "Включить Windows мастер и окружение создания проектов",
      "acceptance_criteria": [
        "Windows получает реальный startupFlow и clipboard",
        "Комплектный Git доступен readiness, созданию и recovery проекта",
        "macOS вызовы сохранены"
      ],
      "expected_commit_message": "feat: Включить Windows мастер и окружение создания проектов"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "windows-onboarding-033",
        "task_id": "W005",
        "role": "implementation"
      },
      "dependencies": [
        "W004"
      ],
      "functional_paths": [
        "src/ui/startup.mjs",
        "src/ui/index.html",
        "tests/startup-ui.test.mjs"
      ],
      "documentation_paths": [
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md",
        "docs/modules/first-run-onboarding.md"
      ],
      "verification_ids": [
        "suite"
      ],
      "id": "W005",
      "title": "Адаптировать шаги и подписи Windows интерфейса",
      "why": "Адаптировать шаги и подписи Windows интерфейса",
      "acceptance_criteria": [
        "Windows не показывает Apple и Mac подсказки",
        "Мастер последовательно показывает подготовку, tunnel, Plugins и первый проект",
        "macOS интерфейс сохраняет существующее поведение"
      ],
      "expected_commit_message": "feat: Адаптировать шаги и подписи Windows интерфейса"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "windows-onboarding-033",
        "task_id": "R001",
        "role": "implementation"
      },
      "dependencies": [
        "W005"
      ],
      "functional_paths": [
        "scripts/release-all.mjs",
        "package.json",
        "package-lock.json"
      ],
      "documentation_paths": [
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md",
        "docs/modules/first-run-onboarding.md",
        "docs/RELEASE.md"
      ],
      "verification_ids": [
        "suite"
      ],
      "id": "R001",
      "title": "Добавить единый выпуск macOS и Windows версии 0.6.41",
      "why": "Добавить единый выпуск macOS и Windows версии 0.6.41",
      "acceptance_criteria": [
        "Одна команда последовательно собирает обе платформы",
        "ZIP, версии, source и постоянный app сверяются до выдачи в Downloads"
      ],
      "expected_commit_message": "feat: Добавить единый выпуск macOS и Windows версии 0.6.41"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "windows-onboarding-033",
        "task_id": "V001",
        "role": "implementation"
      },
      "dependencies": [
        "R001"
      ],
      "functional_paths": [
        "tests/electron-smoke.mjs",
        "tests/release-all.test.mjs",
        "scripts/verify-windows-package.mjs"
      ],
      "documentation_paths": [
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md",
        "docs/modules/first-run-onboarding.md",
        "docs/RELEASE.md"
      ],
      "verification_ids": [
        "suite",
        "electron-smoke"
      ],
      "id": "V001",
      "title": "Проверить Windows мастер и выпуск в изолированных сценариях",
      "why": "Проверить Windows мастер и выпуск в изолированных сценариях",
      "acceptance_criteria": [
        "Smoke проверяет обе платформы и Windows переходы",
        "Проверены неполная поставка и несогласованная версия",
        "Полный Node suite и Electron smoke пройдены"
      ],
      "expected_commit_message": "feat: Проверить Windows мастер и выпуск в изолированных сценариях"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "windows-onboarding-033",
        "task_id": "R002",
        "role": "implementation"
      },
      "dependencies": [
        "V001"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md",
        "docs/modules/first-run-onboarding.md",
        "docs/RELEASE.md",
        "docs/CLEAN_INSTALL.md",
        "docs/TRANSFER_TO_WINDOWS.md"
      ],
      "verification_ids": [
        "suite",
        "electron-smoke"
      ],
      "id": "R002",
      "title": "Собрать и проверить обе поставки 0.6.41",
      "why": "Собрать и проверить обе поставки 0.6.41",
      "acceptance_criteria": [
        "npm run build успешно создаёт обе поставки одной версии",
        "Постоянный macOS app сохраняет identity",
        "Проверены packaged fixture и доступные проверки Windows, физическая приёмка указана отдельно"
      ],
      "expected_commit_message": "docs: Собрать и проверить обе поставки 0.6.41"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "windows-onboarding-033",
        "task_id": "DOCS",
        "role": "implementation"
      },
      "dependencies": [
        "P001",
        "W001",
        "W002",
        "W003",
        "W004",
        "W005",
        "R001",
        "V001",
        "R002"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "AGENTS.md",
        "README.md",
        "docs/WORKFLOW_START.md",
        "docs/PRODUCT.md",
        "docs/DECISIONS.md",
        "docs/architecture/OVERVIEW.md",
        "docs/MODULES.md",
        "docs/DOCUMENTATION_INDEX.md",
        "docs/CLEAN_INSTALL.md",
        "docs/TRANSFER_TO_WINDOWS.md",
        "docs/RELEASE.md",
        "docs/WORKSPACE_SETUP.md",
        "docs/CONTEXT_DELIVERY.md",
        "docs/modules/runtime-lifecycle.md",
        "docs/modules/workspace-sessions.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md",
        "docs/modules/first-run-onboarding.md"
      ],
      "verification_ids": [],
      "id": "DOCS",
      "title": "Актуализация всех документов проекта",
      "why": "Согласовать текущий выпуск и передачу пользовательской проверки во всём комплекте",
      "acceptance_criteria": [
        "Документы по индексу актуализированы, подтверждения отделены от ещё не выполненной приёмки Windows",
        "План сохраняется в собственной сессии; 031 и 032 не изменяются"
      ],
      "expected_commit_message": "docs: актуализировать документы Windows onboarding 0.6.41"
    }
  ],
  "blocked_reason": null,
  "user_decisions": [
    {
      "id": "68c54bb2-473e-43c5-af70-3f7f761cb0d1",
      "text": "18.09.2026 пользователь прямо поручил догнать Windows по первому запуску, аккуратно встроить всё необходимое и пакетно выпустить Mac и Windows с единым новым номером.",
      "recorded_at": "2026-09-18T15:10:54.734Z"
    }
  ],
  "owner_session_id": "01a0b501-9a29-7b30-87a1-036ded275092",
  "prepared_in_session_id": null
}
```
<!-- workflow-state:end -->

## Состояние

Execution Scope Status: ACTIVE
Delivery Status: IN_PROGRESS
Scope: windows-onboarding-033
Current Task: нет
Revision: 8

## Цель

Довести Windows-мастер до согласованного macOS-пути и выпустить обе платформы одним комплектом 0.6.41.

## Критерии приёмки

- Windows показывает и выполняет шаги компонентов, туннеля и создания проекта после входа
- Данные подключения проходят существующее защищённое хранилище Windows; настройки сохраняются
- macOS сохраняет рабочее поведение, обе платформы выпущены как 0.6.41
- Source, tests, packaged fixtures и состав ZIP проверены; реальное подключение и приёмка в госте отдельно подтверждаются пользователем

## Микрозадачи

- [DONE] P001: Уточнить контракт Windows первого запуска и парного релиза — Завершено
  - Git Commit: [DONE] docs: Уточнить контракт Windows первого запуска и парного релиза
  - Reference: windows-onboarding-033 / P001 / implementation
  - Файлы: docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md, docs/modules/first-run-onboarding.md, docs/DECISIONS.md, docs/modules/runtime-lifecycle.md, docs/RELEASE.md, docs/CLEAN_INSTALL.md
- [DONE] W001: Добавить нативный защищённый ввод подключения Windows — Завершено
  - Git Commit: [DONE] feat: Добавить нативный защищённый ввод подключения Windows
  - Reference: windows-onboarding-033 / W001 / implementation
  - Файлы: resources/runtime-control/windows-first-run.py, tests/windows-first-run.test.mjs, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md, docs/modules/first-run-onboarding.md
- [DONE] W002: Подключить настройку туннеля и комплектный Git к Windows bootstrap — Завершено
  - Git Commit: [DONE] feat: Подключить настройку туннеля и комплектный Git к Windows bootstrap
  - Reference: windows-onboarding-033 / W002 / implementation
  - Файлы: src/windows-runtime.mjs, tests/windows-runtime.test.mjs, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md, docs/modules/first-run-onboarding.md, docs/modules/runtime-lifecycle.md
- [TODO] W003: Объединить первый запуск через платформенные адаптеры — Ожидает
  - Git Commit: [PENDING] feat: Объединить первый запуск через платформенные адаптеры
  - Reference: windows-onboarding-033 / W003 / implementation
  - Файлы: src/startup-platform.mjs, src/startup-readiness.mjs, tests/startup-platform.test.mjs, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md, docs/modules/first-run-onboarding.md
- [TODO] W004: Включить Windows мастер и окружение создания проектов — Ожидает
  - Git Commit: [PENDING] feat: Включить Windows мастер и окружение создания проектов
  - Reference: windows-onboarding-033 / W004 / implementation
  - Файлы: src/main.mjs, src/workspace-setup.mjs, tests/workspace-setup.test.mjs, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md, docs/modules/first-run-onboarding.md, docs/WORKSPACE_SETUP.md
- [TODO] W005: Адаптировать шаги и подписи Windows интерфейса — Ожидает
  - Git Commit: [PENDING] feat: Адаптировать шаги и подписи Windows интерфейса
  - Reference: windows-onboarding-033 / W005 / implementation
  - Файлы: src/ui/startup.mjs, src/ui/index.html, tests/startup-ui.test.mjs, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md, docs/modules/first-run-onboarding.md
- [TODO] R001: Добавить единый выпуск macOS и Windows версии 0.6.41 — Ожидает
  - Git Commit: [PENDING] feat: Добавить единый выпуск macOS и Windows версии 0.6.41
  - Reference: windows-onboarding-033 / R001 / implementation
  - Файлы: scripts/release-all.mjs, package.json, package-lock.json, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md, docs/modules/first-run-onboarding.md, docs/RELEASE.md
- [TODO] V001: Проверить Windows мастер и выпуск в изолированных сценариях — Ожидает
  - Git Commit: [PENDING] feat: Проверить Windows мастер и выпуск в изолированных сценариях
  - Reference: windows-onboarding-033 / V001 / implementation
  - Файлы: tests/electron-smoke.mjs, tests/release-all.test.mjs, scripts/verify-windows-package.mjs, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md, docs/modules/first-run-onboarding.md, docs/RELEASE.md
- [TODO] R002: Собрать и проверить обе поставки 0.6.41 — Ожидает
  - Git Commit: [PENDING] docs: Собрать и проверить обе поставки 0.6.41
  - Reference: windows-onboarding-033 / R002 / implementation
  - Файлы: docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md, docs/modules/first-run-onboarding.md, docs/RELEASE.md, docs/CLEAN_INSTALL.md, docs/TRANSFER_TO_WINDOWS.md
- [TODO] DOCS: Актуализация всех документов проекта — Ожидает
  - Git Commit: [PENDING] docs: актуализировать документы Windows onboarding 0.6.41
  - Reference: windows-onboarding-033 / DOCS / implementation
  - Файлы: AGENTS.md, README.md, docs/WORKFLOW_START.md, docs/PRODUCT.md, docs/DECISIONS.md, docs/architecture/OVERVIEW.md, docs/MODULES.md, docs/DOCUMENTATION_INDEX.md, docs/CLEAN_INSTALL.md, docs/TRANSFER_TO_WINDOWS.md, docs/RELEASE.md, docs/WORKSPACE_SETUP.md, docs/CONTEXT_DELIVERY.md, docs/modules/runtime-lifecycle.md, docs/modules/workspace-sessions.md, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md, docs/modules/first-run-onboarding.md

## Context Pack For This Cycle

- docs/architecture/OVERVIEW.md → Краткая архитектура проекта
- docs/MODULES.md → Модули проекта
- docs/DOCUMENTATION_INDEX.md → Каталог документации
- docs/modules/first-run-onboarding.md → Первый запуск Web Pilot на чистой системе

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
