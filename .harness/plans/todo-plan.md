# Активный план — Project Web Pilot

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 501,
  "project_id": "cf944136-d1fc-4bd5-9ea0-e46d1fe230e7",
  "project_name": "Project Web Pilot",
  "scope_id": "hidden-tool-scroll-023",
  "execution_scope_status": "ACTIVE",
  "delivery_status": "IN_PROGRESS",
  "objective": "Устранить пустое пространство, остающееся в разговоре после визуального скрытия строк вызовов инструментов, синхронизировать фильтр с существующей автопрокруткой и выпустить новый релиз Project Web Pilot 0.6.22 для macOS и Windows.",
  "acceptance_criteria": [
    "При включённом Settings → скрывать вызовы инструментов скрывается не только кнопка tool-call, но и её безопасно определяемый служебный layout-контейнер, поэтому скрытые строки не оставляют пустой хвост внизу разговора.",
    "Фильтр после изменения DOM уведомляет существующий контроллер автопрокрутки: follow mode корректирует низ, а ручное чтение истории выше не принудительно прокручивается вниз.",
    "При выборе показывать вызовы инструментов исходный DOM/layout восстанавливается без перезагрузки; сами MCP/tools не меняются.",
    "Regression/Smoke проверяют удаление layout-footprint и обратимое восстановление настройки.",
    "Версия 0.6.22 собрана для macOS arm64 и Windows x64 и подготовлена как отдельный релиз для пользовательской проверки."
  ],
  "approved_scope": {
    "functional_paths": [
      "src/main.mjs",
      "tests/electron-smoke.mjs",
      "package.json",
      "package-lock.json"
    ],
    "documentation_paths": [
      "README.md",
      "docs/architecture/OVERVIEW.md",
      "docs/MODULES.md",
      "docs/DOCUMENTATION_INDEX.md",
      "docs/architecture/ARCHITECTURE.md",
      "docs/WORKFLOW_START.md",
      "docs/PRODUCT.md",
      "docs/DECISIONS.md",
      "docs/VERIFICATION.md",
      "docs/TRANSFER_TO_WINDOWS.md",
      "docs/WORKSPACE_SETUP.md",
      "docs/PROJECT_ARCHIVE.md",
      "docs/SOURCE_WORKSPACES.md",
      "docs/CONTEXT_DELIVERY.md",
      "docs/modules/workflow-kit-recovery.md",
      "docs/modules/project-doctor.md",
      "docs/modules/runtime-lifecycle.md",
      "docs/modules/workspace-sessions.md"
    ],
    "max_functional_files_per_task": 3
  },
  "baseline_commit": "9320d1137b315314867ee708b6cb9bbe3a3ab40d",
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
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "hidden-tool-scroll-023",
        "task_id": "T001",
        "role": "implementation"
      },
      "dependencies": [],
      "functional_paths": [
        "src/main.mjs",
        "tests/electron-smoke.mjs"
      ],
      "documentation_paths": [
        "docs/modules/workspace-sessions.md"
      ],
      "verification_ids": [
        "syntax",
        "electron-smoke"
      ],
      "id": "T001",
      "title": "Убрать layout-footprint скрытых tool-call строк",
      "why": "Текущий фильтр скрывает кликабельную строку, но служебный контейнер ChatGPT может продолжать занимать высоту и уводить физический низ прокрутки ниже последнего видимого текста.",
      "acceptance_criteria": [
        "Фильтр помечает исходную tool-call строку и скрывает максимально высокий безопасный tool-only контейнер, не поднимаясь до message root.",
        "Restore снимает оба Web Pilot marker и возвращает исходное отображение.",
        "После apply/restore существующий auto-scroll controller получает refresh без принудительного resume, поэтому suspended manual reading сохраняется.",
        "Electron smoke проверяет физическое исчезновение контейнера и его восстановление."
      ],
      "expected_commit_message": "fix(chat): убрать пустоту скрытых tool calls"
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "hidden-tool-scroll-023",
        "task_id": "T001B",
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
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "syntax",
        "electron-smoke"
      ],
      "id": "T001B",
      "title": "Реализовать удаление footprint и regression",
      "why": "Контракт T001 уже зафиксирован; реализация и smoke выделены в отдельную микрозадачу вместе с обязательными связанными документами архитектуры и verification.",
      "acceptance_criteria": [
        "Фильтр скрывает максимально высокий безопасный tool-only контейнер, не поднимаясь до корня сообщения.",
        "При выключении фильтра исходный layout полностью восстанавливается.",
        "После apply/restore вызывается refresh существующего auto-scroll controller без принудительного resume ручного чтения.",
        "Electron smoke подтверждает исчезновение layout-footprint и обратимое восстановление."
      ],
      "expected_commit_message": "fix(chat): синхронизировать скрытые tool calls с прокруткой"
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "hidden-tool-scroll-023",
        "task_id": "T002",
        "role": "implementation"
      },
      "dependencies": [
        "T001B"
      ],
      "functional_paths": [
        "package.json",
        "package-lock.json"
      ],
      "documentation_paths": [
        "docs/architecture/ARCHITECTURE.md"
      ],
      "verification_ids": [
        "suite"
      ],
      "id": "T002",
      "title": "Подготовить версию 0.6.22",
      "why": "Исправление должно быть отделено от уже принятого релиза 0.6.21.",
      "acceptance_criteria": [
        "package/lock/build scripts используют 0.6.22, а 0.6.21 остаётся отдельным историческим релизом."
      ],
      "expected_commit_message": "build: подготовить релиз 0.6.22"
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "hidden-tool-scroll-023",
        "task_id": "T003",
        "role": "implementation"
      },
      "dependencies": [
        "T002"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/VERIFICATION.md",
        "docs/TRANSFER_TO_WINDOWS.md"
      ],
      "verification_ids": [
        "suite",
        "electron-smoke"
      ],
      "id": "T003",
      "title": "Проверить и собрать релиз 0.6.22",
      "why": "Получить фактический test/smoke/package evidence для macOS и Windows перед пользовательской проверкой.",
      "acceptance_criteria": [
        "Полный suite и Electron smoke проходят; macOS arm64 и Windows x64 0.6.22 собраны и Windows package verification пройдена; release artifacts и checksums подготовлены."
      ],
      "expected_commit_message": "build: выпустить Project Web Pilot 0.6.22"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "hidden-tool-scroll-023",
        "task_id": "DOCS",
        "role": "implementation"
      },
      "dependencies": [
        "T001",
        "T001B",
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
        "docs/TRANSFER_TO_WINDOWS.md",
        "docs/WORKSPACE_SETUP.md",
        "docs/PROJECT_ARCHIVE.md",
        "docs/SOURCE_WORKSPACES.md",
        "docs/modules/workflow-kit-recovery.md",
        "docs/modules/project-doctor.md",
        "docs/modules/runtime-lifecycle.md",
        "docs/modules/workspace-sessions.md"
      ],
      "verification_ids": [],
      "id": "DOCS",
      "title": "Актуализация всех документов проекта",
      "why": "После исправления и сборки пройти весь действующий комплект по индексу и обновить только устаревшие сведения и ссылки.",
      "acceptance_criteria": [
        "Все документы из docs/DOCUMENTATION_INDEX.md проверены; актуальные оставлены без бессмысленных правок, устаревшие сведения о версии и поведении исправлены."
      ],
      "expected_commit_message": "docs: актуализировать документацию 0.6.22"
    }
  ],
  "blocked_reason": null,
  "user_decisions": [
    {
      "id": "c10b6997-00b9-4b6c-a8fc-96da6f563dd4",
      "text": "Пользователь поручил короткий scope: при включённом скрытии вызываемых инструментов убрать занимаемую ими пустоту из диалога/автопрокрутки и после исправления собрать новый релиз.",
      "recorded_at": "2026-09-16T08:14:57.731Z"
    }
  ]
}
```
<!-- workflow-state:end -->

## Состояние

Execution Scope Status: ACTIVE
Delivery Status: IN_PROGRESS
Scope: hidden-tool-scroll-023
Current Task: нет
Revision: 501

## Цель

Устранить пустое пространство, остающееся в разговоре после визуального скрытия строк вызовов инструментов, синхронизировать фильтр с существующей автопрокруткой и выпустить новый релиз Project Web Pilot 0.6.22 для macOS и Windows.

## Критерии приёмки

- При включённом Settings → скрывать вызовы инструментов скрывается не только кнопка tool-call, но и её безопасно определяемый служебный layout-контейнер, поэтому скрытые строки не оставляют пустой хвост внизу разговора.
- Фильтр после изменения DOM уведомляет существующий контроллер автопрокрутки: follow mode корректирует низ, а ручное чтение истории выше не принудительно прокручивается вниз.
- При выборе показывать вызовы инструментов исходный DOM/layout восстанавливается без перезагрузки; сами MCP/tools не меняются.
- Regression/Smoke проверяют удаление layout-footprint и обратимое восстановление настройки.
- Версия 0.6.22 собрана для macOS arm64 и Windows x64 и подготовлена как отдельный релиз для пользовательской проверки.

## Микрозадачи

- [DONE] T001: Убрать layout-footprint скрытых tool-call строк — Завершено
  - Git Commit: [DONE] fix(chat): убрать пустоту скрытых tool calls
  - Reference: hidden-tool-scroll-023 / T001 / implementation
  - Файлы: src/main.mjs, tests/electron-smoke.mjs, docs/modules/workspace-sessions.md
- [DONE] T001B: Реализовать удаление footprint и regression — Завершено
  - Git Commit: [DONE] fix(chat): синхронизировать скрытые tool calls с прокруткой
  - Reference: hidden-tool-scroll-023 / T001B / implementation
  - Файлы: src/main.mjs, tests/electron-smoke.mjs, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md
- [DONE] T002: Подготовить версию 0.6.22 — Завершено
  - Git Commit: [DONE] build: подготовить релиз 0.6.22
  - Reference: hidden-tool-scroll-023 / T002 / implementation
  - Файлы: package.json, package-lock.json, docs/architecture/ARCHITECTURE.md
- [DONE] T003: Проверить и собрать релиз 0.6.22 — Завершено
  - Git Commit: [DONE] build: выпустить Project Web Pilot 0.6.22
  - Reference: hidden-tool-scroll-023 / T003 / implementation
  - Файлы: docs/VERIFICATION.md, docs/TRANSFER_TO_WINDOWS.md
- [TODO] DOCS: Актуализация всех документов проекта — Ожидает
  - Git Commit: [PENDING] docs: актуализировать документацию 0.6.22
  - Reference: hidden-tool-scroll-023 / DOCS / implementation
  - Файлы: README.md, docs/architecture/OVERVIEW.md, docs/MODULES.md, docs/DOCUMENTATION_INDEX.md, docs/architecture/ARCHITECTURE.md, docs/WORKFLOW_START.md, docs/PRODUCT.md, docs/DECISIONS.md, docs/CONTEXT_DELIVERY.md, docs/VERIFICATION.md, docs/TRANSFER_TO_WINDOWS.md, docs/WORKSPACE_SETUP.md, docs/PROJECT_ARCHIVE.md, docs/SOURCE_WORKSPACES.md, docs/modules/workflow-kit-recovery.md, docs/modules/project-doctor.md, docs/modules/runtime-lifecycle.md, docs/modules/workspace-sessions.md

## Context Pack For This Cycle

- docs/architecture/OVERVIEW.md → Краткая архитектура проекта
- docs/MODULES.md → Модули проекта
- docs/DOCUMENTATION_INDEX.md → Каталог документации
- docs/modules/workspace-sessions.md → Module Specification — Workspace & Sessions

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
