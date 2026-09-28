# Активный план — Project Web Pilot

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 657,
  "project_id": "cf944136-d1fc-4bd5-9ea0-e46d1fe230e7",
  "project_name": "Project Web Pilot",
  "scope_id": "remote-project-ui-research-20260928",
  "execution_scope_status": "ACTIVE",
  "delivery_status": "IN_PROGRESS",
  "objective": "Исследовать удалённую панель проекта через ChatGPT MCP UI и мобильный Web Pilot; подготовить сравнительный отчёт и рекомендуемый следующий шаг",
  "acceptance_criteria": [
    "Исследовать удалённую панель проекта через ChatGPT MCP UI и мобильный Web Pilot; подготовить сравнительный отчёт и рекомендуемый следующий шаг"
  ],
  "approved_scope": {
    "functional_paths": [],
    "documentation_paths": [
      "docs/planning/remote-project-ui-research.md",
      "docs/research/remote-project-ui-options-2026-09-28.md",
      "docs/PRODUCT.md",
      "docs/architecture/ARCHITECTURE.md",
      "docs/architecture/OVERVIEW.md",
      "docs/MODULES.md",
      "docs/DOCUMENTATION_INDEX.md"
    ]
  },
  "baseline_commit": "2c87c9addfc3378911279688cc8ba35da7be363a",
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
        "path": "docs/planning/remote-project-ui-research.md",
        "required": true
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
        "scope_id": "remote-project-ui-research-20260928",
        "task_id": "T001",
        "role": "implementation"
      },
      "dependencies": [],
      "functional_paths": [],
      "documentation_paths": [
        "docs/planning/remote-project-ui-research.md",
        "docs/research/remote-project-ui-options-2026-09-28.md"
      ],
      "verification_ids": [
        "research-report"
      ],
      "id": "T001",
      "title": "Исследовать MCP UI, PiP и совместимость клиентов ChatGPT",
      "why": "Исследовать MCP UI, PiP и совместимость клиентов ChatGPT",
      "verification_kind": "code",
      "acceptance_criteria": [
        "Приведены официальные источники и host matrix с явными неизвестными",
        "Отделены snapshot, живое обновление и навигация разговоров; учтён прежний adapter"
      ],
      "expected_commit_message": "feat: Исследовать MCP UI, PiP и совместимость клиентов ChatGPT",
      "actual_files": [
        "docs/research/remote-project-ui-options-2026-09-28.md"
      ]
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "remote-project-ui-research-20260928",
        "task_id": "T002",
        "role": "implementation"
      },
      "dependencies": [
        "T001"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/planning/remote-project-ui-research.md",
        "docs/research/remote-project-ui-options-2026-09-28.md"
      ],
      "verification_ids": [
        "research-report"
      ],
      "id": "T002",
      "title": "Оценить мобильный Web Pilot для iOS/Android и готовые open-source основы",
      "why": "Оценить мобильный Web Pilot для iOS/Android и готовые open-source основы",
      "verification_kind": "code",
      "acceptance_criteria": [
        "Разобраны перенос Electron, embedded ChatGPT, мобильная оболочка и безопасный доступ к Mac",
        "Проверены первичные источники и существующие решения вместо новой архитектуры с нуля"
      ],
      "expected_commit_message": "feat: Оценить мобильный Web Pilot для iOS/Android и готовые open-source основы"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "remote-project-ui-research-20260928",
        "task_id": "T003",
        "role": "implementation"
      },
      "dependencies": [
        "T002"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/planning/remote-project-ui-research.md",
        "docs/research/remote-project-ui-options-2026-09-28.md"
      ],
      "verification_ids": [
        "research-report"
      ],
      "id": "T003",
      "title": "Сопоставить варианты и завершить исследовательский отчёт",
      "why": "Сопоставить варианты и завершить исследовательский отчёт",
      "verification_kind": "code",
      "acceptance_criteria": [
        "Даны сравнительная таблица, рекомендация, минимальный следующий эксперимент и stop conditions",
        "Зафиксированы границы безопасности, single current plan и реальные ограничения доказательств"
      ],
      "expected_commit_message": "feat: Сопоставить варианты и завершить исследовательский отчёт"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "remote-project-ui-research-20260928",
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
        "docs/planning/remote-project-ui-research.md",
        "docs/PRODUCT.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/research/remote-project-ui-options-2026-09-28.md",
        "docs/architecture/OVERVIEW.md",
        "docs/MODULES.md",
        "docs/DOCUMENTATION_INDEX.md"
      ],
      "verification_ids": [],
      "id": "DOCS",
      "title": "Актуализация всех документов проекта",
      "why": "Сохранить актуальный контекст для следующего агента",
      "acceptance_criteria": [
        "Документы соответствуют результату"
      ],
      "expected_commit_message": "docs: актуализировать контекст проекта"
    }
  ],
  "blocked_reason": null,
  "user_decisions": [
    {
      "id": "c51ffba8-89fc-4421-8844-471a5c246a33",
      "text": "Пользователь поручил выполнить описанную задачу и план.",
      "recorded_at": "2026-09-28T05:41:34.951Z"
    }
  ]
}
```
<!-- workflow-state:end -->

## Состояние

Execution Scope Status: ACTIVE
Delivery Status: IN_PROGRESS
Scope: remote-project-ui-research-20260928
Current Task: нет
Revision: 657

## Цель

Исследовать удалённую панель проекта через ChatGPT MCP UI и мобильный Web Pilot; подготовить сравнительный отчёт и рекомендуемый следующий шаг

## Критерии приёмки

- Исследовать удалённую панель проекта через ChatGPT MCP UI и мобильный Web Pilot; подготовить сравнительный отчёт и рекомендуемый следующий шаг

## Микрозадачи

- [DONE] T001: Исследовать MCP UI, PiP и совместимость клиентов ChatGPT — Завершено
  - Git Commit: [DONE] feat: Исследовать MCP UI, PiP и совместимость клиентов ChatGPT
  - Reference: remote-project-ui-research-20260928 / T001 / implementation
  - Файлы: docs/planning/remote-project-ui-research.md, docs/research/remote-project-ui-options-2026-09-28.md
- [TODO] T002: Оценить мобильный Web Pilot для iOS/Android и готовые open-source основы — Ожидает
  - Git Commit: [PENDING] feat: Оценить мобильный Web Pilot для iOS/Android и готовые open-source основы
  - Reference: remote-project-ui-research-20260928 / T002 / implementation
  - Файлы: docs/planning/remote-project-ui-research.md, docs/research/remote-project-ui-options-2026-09-28.md
- [TODO] T003: Сопоставить варианты и завершить исследовательский отчёт — Ожидает
  - Git Commit: [PENDING] feat: Сопоставить варианты и завершить исследовательский отчёт
  - Reference: remote-project-ui-research-20260928 / T003 / implementation
  - Файлы: docs/planning/remote-project-ui-research.md, docs/research/remote-project-ui-options-2026-09-28.md
- [TODO] DOCS: Актуализация всех документов проекта — Ожидает
  - Git Commit: [PENDING] docs: актуализировать контекст проекта
  - Reference: remote-project-ui-research-20260928 / DOCS / implementation
  - Файлы: docs/planning/remote-project-ui-research.md, docs/PRODUCT.md, docs/architecture/ARCHITECTURE.md, docs/research/remote-project-ui-options-2026-09-28.md, docs/architecture/OVERVIEW.md, docs/MODULES.md, docs/DOCUMENTATION_INDEX.md

## Context Pack For This Cycle

- docs/architecture/OVERVIEW.md → Краткая архитектура проекта
- docs/MODULES.md → Модули проекта
- docs/DOCUMENTATION_INDEX.md → Каталог документации
- docs/planning/remote-project-ui-research.md

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
