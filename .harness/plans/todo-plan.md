# Активный план — Project Web Pilot

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 563,
  "project_id": "cf944136-d1fc-4bd5-9ea0-e46d1fe230e7",
  "project_name": "Project Web Pilot",
  "scope_id": "clean-install-lab-027",
  "execution_scope_status": "ACTIVE",
  "delivery_status": "IN_PROGRESS",
  "objective": "Чистые macOS и Windows для проверки установки Web Pilot",
  "acceptance_criteria": [
    "Подготовлены изолированные гостевые macOS и Windows для повторяемой проверки установки.",
    "Готовые пакеты проверены на чистом состоянии, ограничения и ошибки записаны.",
    "Рабочее приложение, основной MCP/tunnel, существующие проекты и учётные данные сохранены."
  ],
  "approved_scope": {
    "functional_paths": [],
    "documentation_paths": [
      "docs/CLEAN_INSTALL.md",
      "docs/RELEASE.md",
      "docs/MODULES.md",
      "docs/DOCUMENTATION_INDEX.md",
      "docs/DECISIONS.md",
      "docs/WORKFLOW_START.md",
      "docs/VERIFICATION.md",
      "docs/architecture/OVERVIEW.md",
      "docs/architecture/ARCHITECTURE.md",
      "docs/PRODUCT.md",
      "docs/TRANSFER_TO_WINDOWS.md",
      "README.md"
    ],
    "max_functional_files_per_task": 3
  },
  "baseline_commit": "777dc23fe63a0ecd3808b4ce2a58e850a88c5a7e",
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
        "path": "docs/RELEASE.md",
        "heading_path": [
          "Выпуск и постоянный путь запуска"
        ],
        "required": true,
        "revision": "WORKTREE"
      },
      {
        "path": "docs/modules/runtime-lifecycle.md",
        "heading_path": [
          "Module Specification — Runtime Lifecycle"
        ],
        "required": false,
        "revision": "WORKTREE"
      }
    ],
    "include_last_completed_task": false,
    "dependency_task_ids": []
  },
  "tasks": [
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "clean-install-lab-027",
        "task_id": "T001",
        "role": "implementation"
      },
      "dependencies": [],
      "functional_paths": [],
      "documentation_paths": [
        "docs/CLEAN_INSTALL.md",
        "docs/RELEASE.md",
        "docs/MODULES.md",
        "docs/DOCUMENTATION_INDEX.md",
        "docs/DECISIONS.md"
      ],
      "verification_ids": [],
      "id": "T001",
      "title": "Зафиксировать стенд чистой установки и исходные ограничения",
      "why": "Согласованный подход должен быть воспроизводимым для следующих сессий.",
      "acceptance_criteria": [
        "Описаны чистые macOS/Windows, изоляция, архитектуры, источники ОС и исходная проверка 0.6.26.",
        "Зафиксированы реальные ограничения поставки и разрешений Computer Use."
      ],
      "expected_commit_message": "docs: define clean installation verification lab"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "clean-install-lab-027",
        "task_id": "T002",
        "role": "implementation"
      },
      "dependencies": [
        "T001"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/CLEAN_INSTALL.md"
      ],
      "verification_ids": [],
      "id": "T002",
      "title": "Установить и проверить UTM на основном Mac",
      "why": "Использовать готовое приложение виртуализации для обеих гостевых систем.",
      "acceptance_criteria": [
        "UTM установлен из официального релиза, SHA-256 и подпись проверены.",
        "Рабочий Web Pilot и его службы не изменены."
      ],
      "expected_commit_message": "docs: record verified UTM installation"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "clean-install-lab-027",
        "task_id": "T003",
        "role": "implementation"
      },
      "dependencies": [
        "T002"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/CLEAN_INSTALL.md"
      ],
      "verification_ids": [],
      "id": "T003",
      "title": "Подготовить чистую виртуальную macOS",
      "why": "Проверять готовый app без системных зависимостей компьютера разработчика.",
      "acceptance_criteria": [
        "Гостевая macOS установлена из совместимого официального образа и достигает рабочего стола.",
        "Исходное чистое состояние сохранено; Node, Git и MCP разработчика не перенесены.",
        "Возможность видеть и управлять гостевым окном проверена после выдачи системных разрешений."
      ],
      "expected_commit_message": "docs: record clean macOS test environment"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "clean-install-lab-027",
        "task_id": "T004",
        "role": "implementation"
      },
      "dependencies": [
        "T002"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/CLEAN_INSTALL.md"
      ],
      "verification_ids": [],
      "id": "T004",
      "title": "Подготовить виртуальную Windows и зафиксировать границы проверки x64",
      "why": "Повторять установку Windows-поставки независимо от рабочего Mac.",
      "acceptance_criteria": [
        "Гостевая Windows установлена из официального образа при выполненных лицензионных условиях.",
        "Архитектура гостя и отличие ARM64/эмуляции от нативной x64 указаны явно.",
        "Исходное чистое состояние сохранено для повторных установок."
      ],
      "expected_commit_message": "docs: record clean Windows test environment"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "clean-install-lab-027",
        "task_id": "T005",
        "role": "implementation"
      },
      "dependencies": [
        "T003",
        "T004"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/CLEAN_INSTALL.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [],
      "id": "T005",
      "title": "Проверить первый запуск текущих поставок и записать шаги установки",
      "why": "Получить реальные ошибки для следующего этапа самодостаточной поставки и будущих подсказок.",
      "acceptance_criteria": [
        "На чистых гостях проверен первый запуск готовых пакетов 0.6.26.",
        "Шаги, результаты, blockers и пользовательские действия записаны без секретов.",
        "Отсутствующие зависимости не установлены вручную ради ложного успешного результата."
      ],
      "expected_commit_message": "docs: record clean installation baseline"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "clean-install-lab-027",
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
        "docs/CLEAN_INSTALL.md",
        "docs/RELEASE.md",
        "docs/MODULES.md",
        "docs/DOCUMENTATION_INDEX.md",
        "docs/DECISIONS.md",
        "docs/WORKFLOW_START.md",
        "docs/VERIFICATION.md",
        "docs/architecture/OVERVIEW.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/PRODUCT.md",
        "docs/TRANSFER_TO_WINDOWS.md",
        "README.md"
      ],
      "verification_ids": [],
      "id": "DOCS",
      "title": "Актуализация всех документов проекта",
      "why": "Сверить действующий комплект по индексу и отделить подтверждённые результаты от истории.",
      "acceptance_criteria": [
        "Документы отражают фактический результат стенда, актуальную версию и ограничения.",
        "Исправлены устаревшие вводные сведения без подмены исторических записей."
      ],
      "expected_commit_message": "docs: update project documentation for clean installation lab"
    }
  ],
  "blocked_reason": null,
  "user_decisions": [
    {
      "id": "56c0fc31-e66a-47c3-a704-fd807594fc7a",
      "text": "16.09.2026 пользователь согласился на проверку в виртуальных системах: «Делаем так. Начнем с виртуальной MacOS? Я бы и виртуальный Windows поставил, чтобы можно было проверять обе версии». Текущий этап — стенд и исходная проверка готовых поставок; затем по фактическим результатам обсуждаются исправления самодостаточности и пошаговые подсказки.",
      "recorded_at": "2026-09-16T13:48:43.118Z"
    }
  ]
}
```
<!-- workflow-state:end -->

## Состояние

Execution Scope Status: ACTIVE
Delivery Status: IN_PROGRESS
Scope: clean-install-lab-027
Current Task: нет
Revision: 563

## Цель

Чистые macOS и Windows для проверки установки Web Pilot

## Критерии приёмки

- Подготовлены изолированные гостевые macOS и Windows для повторяемой проверки установки.
- Готовые пакеты проверены на чистом состоянии, ограничения и ошибки записаны.
- Рабочее приложение, основной MCP/tunnel, существующие проекты и учётные данные сохранены.

## Микрозадачи

- [TODO] T001: Зафиксировать стенд чистой установки и исходные ограничения — Ожидает
  - Git Commit: [PENDING] docs: define clean installation verification lab
  - Reference: clean-install-lab-027 / T001 / implementation
  - Файлы: docs/CLEAN_INSTALL.md, docs/RELEASE.md, docs/MODULES.md, docs/DOCUMENTATION_INDEX.md, docs/DECISIONS.md
- [TODO] T002: Установить и проверить UTM на основном Mac — Ожидает
  - Git Commit: [PENDING] docs: record verified UTM installation
  - Reference: clean-install-lab-027 / T002 / implementation
  - Файлы: docs/CLEAN_INSTALL.md
- [TODO] T003: Подготовить чистую виртуальную macOS — Ожидает
  - Git Commit: [PENDING] docs: record clean macOS test environment
  - Reference: clean-install-lab-027 / T003 / implementation
  - Файлы: docs/CLEAN_INSTALL.md
- [TODO] T004: Подготовить виртуальную Windows и зафиксировать границы проверки x64 — Ожидает
  - Git Commit: [PENDING] docs: record clean Windows test environment
  - Reference: clean-install-lab-027 / T004 / implementation
  - Файлы: docs/CLEAN_INSTALL.md
- [TODO] T005: Проверить первый запуск текущих поставок и записать шаги установки — Ожидает
  - Git Commit: [PENDING] docs: record clean installation baseline
  - Reference: clean-install-lab-027 / T005 / implementation
  - Файлы: docs/CLEAN_INSTALL.md, docs/VERIFICATION.md
- [TODO] DOCS: Актуализация всех документов проекта — Ожидает
  - Git Commit: [PENDING] docs: update project documentation for clean installation lab
  - Reference: clean-install-lab-027 / DOCS / implementation
  - Файлы: docs/CLEAN_INSTALL.md, docs/RELEASE.md, docs/MODULES.md, docs/DOCUMENTATION_INDEX.md, docs/DECISIONS.md, docs/WORKFLOW_START.md, docs/VERIFICATION.md, docs/architecture/OVERVIEW.md, docs/architecture/ARCHITECTURE.md, docs/PRODUCT.md, docs/TRANSFER_TO_WINDOWS.md, README.md

## Context Pack For This Cycle

- docs/architecture/OVERVIEW.md → Краткая архитектура проекта
- docs/MODULES.md → Модули проекта
- docs/DOCUMENTATION_INDEX.md → Каталог документации
- docs/RELEASE.md → Выпуск и постоянный путь запуска
- docs/modules/runtime-lifecycle.md → Module Specification — Runtime Lifecycle

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
