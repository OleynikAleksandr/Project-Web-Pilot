# Активный план — Project Web Pilot

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 583,
  "project_id": "cf944136-d1fc-4bd5-9ea0-e46d1fe230e7",
  "project_name": "Project Web Pilot",
  "scope_id": "clean-install-lab-027",
  "execution_scope_status": "ACTIVE",
  "delivery_status": "READY_FOR_ACCEPTANCE",
  "objective": "Готовый стенд macOS/Windows и диагностика задержек Computer Use",
  "acceptance_criteria": [
    "Подготовлены изолированные Clean/Test macOS и Windows.",
    "Фактическое состояние пакетов записано; первый запуск и самодостаточность перенесены в следующий scope.",
    "Диагностика Computer Use содержит измерения, ограничения и следующие действия.",
    "Рабочие приложение, MCP/tunnel и профили сохранены; документы сверены."
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
        "heading_path": [
          "Выпуск и постоянный путь запуска"
        ],
        "path": "docs/RELEASE.md",
        "required": true,
        "revision": "WORKTREE"
      },
      {
        "heading_path": [
          "Module Specification — Runtime Lifecycle"
        ],
        "path": "docs/modules/runtime-lifecycle.md",
        "required": false,
        "revision": "WORKTREE"
      },
      {
        "path": "docs/CLEAN_INSTALL.md",
        "heading_path": [
          "Проверка установки на чистых системах"
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
      "implementation_status": "DONE",
      "commit_status": "DONE",
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
      "implementation_status": "DONE",
      "commit_status": "DONE",
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
      "title": "Подготовить чистую виртуальную macOS и параллельно начать создание Windows 11",
      "why": "Проверять готовый app без зависимостей компьютера разработчика; по команде пользователя подготовка Windows начинается во время загрузки macOS.",
      "acceptance_criteria": [
        "Гостевая macOS установлена из совместимого официального образа и достигает рабочего стола.",
        "Исходное чистое состояние сохранено; Node, Git и MCP разработчика не перенесены.",
        "Видимость гостевого окна подтверждена; по дальнейшему поручению пользователя настройка и проверки выполняются вручную по передаваемым скриншотам, без Computer Use.",
        "По поручению пользователя параллельно начаты загрузка официального образа Windows 11 и подготовка её VM; архитектура и фактическое состояние записаны."
      ],
      "expected_commit_message": "docs: record clean macOS test environment"
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
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
      "title": "Завершить подготовку виртуальной Windows и зафиксировать границы проверки x64",
      "why": "Повторять установку Windows-поставки независимо от рабочего Mac.",
      "acceptance_criteria": [
        "Гостевая Windows установлена из официального образа при выполненных лицензионных условиях.",
        "Архитектура гостя и отличие ARM64/эмуляции от нативной x64 указаны явно.",
        "Исходное чистое состояние сохранено для повторных установок."
      ],
      "expected_commit_message": "docs: record clean Windows test environment"
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
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
      "title": "Зафиксировать готовый стенд и перенос первого запуска",
      "why": "По поручению пользователя 17.09 проверка приложения переносится в следующий scope.",
      "acceptance_criteria": [
        "Записаны готовые Clean/Test VM и распаковка macOS-пакета 0.6.27.",
        "Первый запуск, зависимости и Windows-поставка явно отложены до следующего scope и не объявлены проверенными.",
        "История анализа 0.6.26 сохранена; рабочие runtime и профили не перенесены."
      ],
      "expected_commit_message": "docs: record lab handoff and defer first-launch checks"
    },
    {
      "id": "T006",
      "title": "Диагностировать задержки Computer Use через MCP",
      "why": "Понять причины неэффективного управления VM перед приёмкой.",
      "dependencies": [
        "T005"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/CLEAN_INSTALL.md",
        "docs/VERIFICATION.md"
      ],
      "acceptance_criteria": [
        "Сопоставлены локальные задержки и MCP-вызовы; факты отделены от гипотез.",
        "Изучены обработчики снимков и доступные несекретные журналы.",
        "Записаны следующие действия без изменения кода, перезапуска рабочего runtime и управления гостями."
      ],
      "verification_ids": [],
      "expected_commit_message": "docs: diagnose Computer Use latency across MCP transport",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "clean-install-lab-027",
        "task_id": "T006",
        "role": "implementation"
      }
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
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
        "T005",
        "T006"
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
    },
    {
      "id": "8497c9aa-da76-4c54-a104-24d967dece8a",
      "text": "16.09.2026 пользователь поручил продолжать настройку и проверку виртуальных машин без Computer Use: пользователь передаёт скриншоты, агент даёт пошаговые инструкции. Это заменяет проверку дальнейшего управления гостями через Computer Use.",
      "recorded_at": "2026-09-16T17:08:51.204648Z"
    },
    {
      "id": "9e94cfdb-1e49-4183-8ad3-37eaba73513b",
      "text": "17.09.2026 пользователь выбрал пакет 0.6.27, затем поручил перенести продолжение проверки установки в новый scope, до закрытия текущего диагностировать задержки Computer Use и актуализировать документы. Управление гостями не возобновляется. Архивирование после явного принятия результата.",
      "recorded_at": "2026-09-17T07:01:00.201775+00:00"
    }
  ]
}
```
<!-- workflow-state:end -->

## Состояние

Execution Scope Status: ACTIVE
Delivery Status: READY_FOR_ACCEPTANCE
Scope: clean-install-lab-027
Current Task: нет
Revision: 583

## Цель

Готовый стенд macOS/Windows и диагностика задержек Computer Use

## Критерии приёмки

- Подготовлены изолированные Clean/Test macOS и Windows.
- Фактическое состояние пакетов записано; первый запуск и самодостаточность перенесены в следующий scope.
- Диагностика Computer Use содержит измерения, ограничения и следующие действия.
- Рабочие приложение, MCP/tunnel и профили сохранены; документы сверены.

## Микрозадачи

- [DONE] T001: Зафиксировать стенд чистой установки и исходные ограничения — Завершено
  - Git Commit: [DONE] docs: define clean installation verification lab
  - Reference: clean-install-lab-027 / T001 / implementation
  - Файлы: docs/CLEAN_INSTALL.md, docs/RELEASE.md, docs/MODULES.md, docs/DOCUMENTATION_INDEX.md, docs/DECISIONS.md
- [DONE] T002: Установить и проверить UTM на основном Mac — Завершено
  - Git Commit: [DONE] docs: record verified UTM installation
  - Reference: clean-install-lab-027 / T002 / implementation
  - Файлы: docs/CLEAN_INSTALL.md
- [DONE] T003: Подготовить чистую виртуальную macOS и параллельно начать создание Windows 11 — Завершено
  - Git Commit: [DONE] docs: record clean macOS test environment
  - Reference: clean-install-lab-027 / T003 / implementation
  - Файлы: docs/CLEAN_INSTALL.md
- [DONE] T004: Завершить подготовку виртуальной Windows и зафиксировать границы проверки x64 — Завершено
  - Git Commit: [DONE] docs: record clean Windows test environment
  - Reference: clean-install-lab-027 / T004 / implementation
  - Файлы: docs/CLEAN_INSTALL.md
- [DONE] T005: Зафиксировать готовый стенд и перенос первого запуска — Завершено
  - Git Commit: [DONE] docs: record lab handoff and defer first-launch checks
  - Reference: clean-install-lab-027 / T005 / implementation
  - Файлы: docs/CLEAN_INSTALL.md, docs/VERIFICATION.md
- [DONE] T006: Диагностировать задержки Computer Use через MCP — Завершено
  - Git Commit: [DONE] docs: diagnose Computer Use latency across MCP transport
  - Reference: clean-install-lab-027 / T006 / implementation
  - Файлы: docs/CLEAN_INSTALL.md, docs/VERIFICATION.md
- [DONE] DOCS: Актуализация всех документов проекта — Завершено
  - Git Commit: [DONE] docs: update project documentation for clean installation lab
  - Reference: clean-install-lab-027 / DOCS / implementation
  - Файлы: docs/CLEAN_INSTALL.md, docs/RELEASE.md, docs/MODULES.md, docs/DOCUMENTATION_INDEX.md, docs/DECISIONS.md, docs/WORKFLOW_START.md, docs/VERIFICATION.md, docs/architecture/OVERVIEW.md, docs/architecture/ARCHITECTURE.md, docs/PRODUCT.md, docs/TRANSFER_TO_WINDOWS.md, README.md

## Context Pack For This Cycle

- docs/architecture/OVERVIEW.md → Краткая архитектура проекта
- docs/MODULES.md → Модули проекта
- docs/DOCUMENTATION_INDEX.md → Каталог документации
- docs/RELEASE.md → Выпуск и постоянный путь запуска
- docs/modules/runtime-lifecycle.md → Module Specification — Runtime Lifecycle
- docs/CLEAN_INSTALL.md → Проверка установки на чистых системах

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
