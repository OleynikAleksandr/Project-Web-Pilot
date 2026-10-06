# Активный план — Project Web Pilot

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 1354,
  "project_id": "cf944136-d1fc-4bd5-9ea0-e46d1fe230e7",
  "project_name": "Project Web Pilot",
  "scope_id": "recovery-on-demand-research-20261006",
  "execution_scope_status": "ACTIVE",
  "delivery_status": "IN_PROGRESS",
  "objective": "Исследовать компактный стартовый recovery и получение инструкций, шаблонов и контекста по мере диалога; подготовить обоснованную рекомендацию для отдельного решения о реализации.",
  "acceptance_criteria": [
    "Подготовлено проверяемое сравнение вариантов и рекомендация в пределах исследовательского контракта.",
    "Документы отражают результаты исследования и открытые вопросы; продуктовый код и релиз не изменены."
  ],
  "approved_scope": {
    "functional_paths": [],
    "documentation_paths": [
      "docs/planning/recovery-on-demand-research.md",
      "docs/DOCUMENTATION_INDEX.md",
      "docs/MODULES.md",
      "docs/PRODUCT.md",
      "docs/architecture/ARCHITECTURE.md",
      "docs/architecture/OVERVIEW.md"
    ]
  },
  "baseline_commit": "7bd5f4714fc3be0572dfa8a593804af3fab45d1f",
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
        "path": "docs/planning/recovery-on-demand-research.md",
        "required": true
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
        "scope_id": "recovery-on-demand-research-20261006",
        "task_id": "T001",
        "role": "implementation"
      },
      "dependencies": [],
      "functional_paths": [],
      "documentation_paths": [
        "docs/planning/recovery-on-demand-research.md",
        "docs/DOCUMENTATION_INDEX.md",
        "docs/MODULES.md"
      ],
      "verification_ids": [],
      "id": "T001",
      "title": "Исследовать компактный recovery и получение контекста по запросу",
      "why": "Уменьшить стартовый пакет и определить, как агент сможет получать нужные инструкции по намерению пользователя без обязательных кнопок и лишних обращений к удалённому компьютеру.",
      "verification_kind": "code",
      "acceptance_criteria": [
        "Зафиксирован состав текущего recovery, дублирование и разделение постоянных инструкций и динамического состояния.",
        "Сравнены способы выдачи контекста, доступность из облачной среды и через удалённый компьютер, размеры, свежесть и восстановление.",
        "Описаны независимые сценарии обсуждения, документов, подготовки и выполнения to-do, ограничения автоматического выбора и интеграции с Kit, AutoPlan и Sidebar для macOS и Windows.",
        "В контракте опубликованы подтверждённые выводы, минимальная рекомендация, альтернативы и открытые вопросы; реализация не начата."
      ],
      "expected_commit_message": "docs: исследовать recovery и контекст по запросу"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "recovery-on-demand-research-20261006",
        "task_id": "DOCS",
        "role": "implementation"
      },
      "dependencies": [
        "T001"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/planning/recovery-on-demand-research.md",
        "docs/PRODUCT.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/DOCUMENTATION_INDEX.md",
        "docs/MODULES.md",
        "docs/architecture/OVERVIEW.md"
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
      "id": "6c1ab6f7-f03c-4011-8067-1130111a5ad8",
      "text": "Прямое поручение пользователя 06.10.2026: закрыть текущий план и открыть новый короткий исследовательский план. Реализация и delivery не входят в scope.",
      "recorded_at": "2026-10-06T10:12:00.271Z"
    }
  ]
}
```
<!-- workflow-state:end -->

## Состояние

Execution Scope Status: ACTIVE
Delivery Status: IN_PROGRESS
Scope: recovery-on-demand-research-20261006
Current Task: нет
Revision: 1354

## Цель

Исследовать компактный стартовый recovery и получение инструкций, шаблонов и контекста по мере диалога; подготовить обоснованную рекомендацию для отдельного решения о реализации.

## Критерии приёмки

- Подготовлено проверяемое сравнение вариантов и рекомендация в пределах исследовательского контракта.
- Документы отражают результаты исследования и открытые вопросы; продуктовый код и релиз не изменены.

## Микрозадачи

- [TODO] T001: Исследовать компактный recovery и получение контекста по запросу — Ожидает
  - Git Commit: [PENDING] docs: исследовать recovery и контекст по запросу
  - Reference: recovery-on-demand-research-20261006 / T001 / implementation
  - Файлы: docs/planning/recovery-on-demand-research.md, docs/DOCUMENTATION_INDEX.md, docs/MODULES.md
- [TODO] DOCS: Актуализация всех документов проекта — Ожидает
  - Git Commit: [PENDING] docs: актуализировать контекст проекта
  - Reference: recovery-on-demand-research-20261006 / DOCS / implementation
  - Файлы: docs/planning/recovery-on-demand-research.md, docs/PRODUCT.md, docs/architecture/ARCHITECTURE.md, docs/DOCUMENTATION_INDEX.md, docs/MODULES.md, docs/architecture/OVERVIEW.md

## Context Pack For This Cycle

- docs/architecture/OVERVIEW.md → Краткая архитектура проекта
- docs/MODULES.md → Модули проекта
- docs/DOCUMENTATION_INDEX.md → Каталог документации
- docs/planning/recovery-on-demand-research.md

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
