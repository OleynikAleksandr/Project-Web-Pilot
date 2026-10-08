# Активный план — Project Web Pilot

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 1526,
  "project_id": "cf944136-d1fc-4bd5-9ea0-e46d1fe230e7",
  "project_name": "Project Web Pilot",
  "scope_id": "technical-audit-20261008",
  "execution_scope_status": "ACTIVE",
  "delivery_status": "IN_PROGRESS",
  "objective": "Провести доказательный read-only аудит сопровождаемости и надёжности всего поддерживаемого Project Web Pilot, представить находки, минимальные предложения и ограничения; исходники не менять",
  "acceptance_criteria": [
    "Матрица охвата всех поддерживаемых подсистем и четырёх направлений с ограничениями",
    "Раздельные подтверждённые дефекты, кандидаты на упрощение и гипотезы; для каждой подтверждённой находки доказательство, место, приоритет, минимальное исправление, проверка и платформенные/публичные риски",
    "Никаких исправлений, удалений, сборок, инсталляций и релизов; Windows и чистую установку не объявлять испытанными"
  ],
  "approved_scope": {
    "functional_paths": [],
    "documentation_paths": [
      "docs/planning/technical-audit-20261008.md",
      "docs/planning/technical-audit-findings.md",
      "docs/architecture/OVERVIEW.md",
      "docs/planning/technical-audit-findings-unused.md"
    ]
  },
  "baseline_commit": "fda09de65ed4a86648f44be3343c478b53468f5f",
  "current_task_id": null,
  "context_pack": {
    "documents": [
      {
        "path": "docs/planning/technical-audit-20261008.md",
        "required": true,
        "revision": "WORKTREE"
      },
      {
        "path": "docs/architecture/OVERVIEW.md",
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
        "scope_id": "technical-audit-20261008",
        "task_id": "T001",
        "role": "implementation"
      },
      "dependencies": [],
      "functional_paths": [],
      "documentation_paths": [
        "docs/planning/technical-audit-findings.md"
      ],
      "verification_ids": [],
      "id": "T001",
      "title": "Зафиксировать базовую линию и матрицу охвата",
      "why": "Проверяемая полнота охвата и входов до поиска находок",
      "acceptance_criteria": [
        "В отчёте HEAD, состав исходных подсистем, реальные входы и способы проверки, exclusions и ограничения",
        "Ни один пользовательский процесс или проект не изменён"
      ],
      "expected_commit_message": "docs: зафиксировать исходную линию технического аудита",
      "actual_files": [
        "docs/planning/technical-audit-findings.md"
      ]
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "technical-audit-20261008",
        "task_id": "T002",
        "role": "implementation"
      },
      "dependencies": [
        "T001"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/planning/technical-audit-findings.md"
      ],
      "verification_ids": [],
      "id": "T002",
      "title": "Исследовать дублирование и риск расхождений",
      "why": "Отделить опасное повторение правил от намеренной независимости",
      "acceptance_criteria": [
        "Есть результаты по коду, платформам, Kit и документации с точными местами и доказательствами",
        "Для каждого предлагаемого объединения объяснены экономия обслуживания и риск связности; ложные дубли отделены"
      ],
      "expected_commit_message": "docs: проверить дублирование и независимые реализации",
      "actual_files": [
        "docs/planning/technical-audit-findings.md"
      ]
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "technical-audit-20261008",
        "task_id": "T003",
        "role": "implementation"
      },
      "dependencies": [
        "T002"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/planning/technical-audit-findings.md"
      ],
      "verification_ids": [],
      "id": "T003",
      "title": "Проверить локальные ссылки, зависимости путей и упаковку",
      "why": "Проверить реальные точки подключения исходников и staged/runtime ресурсов",
      "acceptance_criteria": [
        "Исследованы Markdown anchors, imports/exports, IPC/workers, npm scripts, config, generators, macOS/Windows package inclusion",
        "Отличены отсутствующие файлы от генерируемых; Git ссылки привязаны к коммитам; внешние URL отмечены отдельно без запросов секретных адресов"
      ],
      "expected_commit_message": "docs: проверить ссылки и состав поставки",
      "actual_files": [
        "docs/planning/technical-audit-findings.md"
      ]
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "technical-audit-20261008",
        "task_id": "T004",
        "role": "implementation"
      },
      "dependencies": [
        "T003"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/planning/technical-audit-findings.md",
        "docs/planning/technical-audit-findings-unused.md"
      ],
      "verification_ids": [],
      "id": "T004",
      "title": "Проверить кандидатов на неиспользуемый код",
      "why": "Выявить безопасные варианты упрощения без преждевременных удалений",
      "acceptance_criteria": [
        "Проверены динамические, событийные, IPC, CLI, платформенные входы и публичные контракты Sidebar",
        "Для каждого кандидата дана оценка достижимости и недостаточности одного текстового поиска"
      ],
      "expected_commit_message": "docs: исследовать неиспользуемые реализации",
      "actual_files": [
        "docs/planning/technical-audit-findings.md",
        "docs/planning/technical-audit-findings-unused.md"
      ]
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "technical-audit-20261008",
        "task_id": "T005",
        "role": "implementation"
      },
      "dependencies": [
        "T004"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/planning/technical-audit-findings.md"
      ],
      "verification_ids": [],
      "id": "T005",
      "title": "Проверить обработку ошибок и жизненный цикл",
      "why": "Найти подтверждённые сбои в реальных пользовательских сценариях",
      "acceptance_criteria": [
        "Проверены promises, подавление ошибок, таймеры, подписки, watchers, процессы, гонки при смене чата/проекта и завершении",
        "Неопределённый исход операции и постоянно работающие службы квалифицированы корректно; приведены доказательства и ограничения"
      ],
      "expected_commit_message": "docs: исследовать ошибки и жизненный цикл"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "technical-audit-20261008",
        "task_id": "T006",
        "role": "implementation"
      },
      "dependencies": [
        "T005"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/planning/technical-audit-findings.md"
      ],
      "verification_ids": [],
      "id": "T006",
      "title": "Свести результаты и проверить доказательства",
      "why": "Предоставить пригодный для выбора точечных исправлений итог",
      "acceptance_criteria": [
        "Три независимые категории находок, приоритеты и реальные доказательства; у каждой подтверждённой есть место, последствия, минимальная правка, верификация, платформенные и API риски",
        "Матрица покрытия и отрицательные результаты каждого направления, ограничения, отсутствие необоснованных заявлений о Windows/чистой установке",
        "Исходники и связанные репозитории не изменены; предложен перечень дальнейших отдельных работ без их выполнения"
      ],
      "expected_commit_message": "docs: завершить доказательный технический аудит"
    }
  ],
  "blocked_reason": null,
  "user_decisions": [
    {
      "id": "9130cacc-5b66-424d-9576-f6554bf0a2fd",
      "text": "Пользователь разрешил подготовить и опубликовать план технического аудита; сам аудит будет начат отдельным поручением.",
      "recorded_at": "2026-10-08T17:24:18.539Z"
    }
  ]
}
```
<!-- workflow-state:end -->

## Состояние

Execution Scope Status: ACTIVE
Delivery Status: IN_PROGRESS
Scope: technical-audit-20261008
Current Task: нет
Revision: 1526

## Цель

Провести доказательный read-only аудит сопровождаемости и надёжности всего поддерживаемого Project Web Pilot, представить находки, минимальные предложения и ограничения; исходники не менять

## Критерии приёмки

- Матрица охвата всех поддерживаемых подсистем и четырёх направлений с ограничениями
- Раздельные подтверждённые дефекты, кандидаты на упрощение и гипотезы; для каждой подтверждённой находки доказательство, место, приоритет, минимальное исправление, проверка и платформенные/публичные риски
- Никаких исправлений, удалений, сборок, инсталляций и релизов; Windows и чистую установку не объявлять испытанными

## Микрозадачи

- [DONE] T001: Зафиксировать базовую линию и матрицу охвата — Завершено
  - Git Commit: [DONE] docs: зафиксировать исходную линию технического аудита
  - Reference: technical-audit-20261008 / T001 / implementation
  - Файлы: docs/planning/technical-audit-findings.md
- [DONE] T002: Исследовать дублирование и риск расхождений — Завершено
  - Git Commit: [DONE] docs: проверить дублирование и независимые реализации
  - Reference: technical-audit-20261008 / T002 / implementation
  - Файлы: docs/planning/technical-audit-findings.md
- [DONE] T003: Проверить локальные ссылки, зависимости путей и упаковку — Завершено
  - Git Commit: [DONE] docs: проверить ссылки и состав поставки
  - Reference: technical-audit-20261008 / T003 / implementation
  - Файлы: docs/planning/technical-audit-findings.md
- [DONE] T004: Проверить кандидатов на неиспользуемый код — Завершено
  - Git Commit: [DONE] docs: исследовать неиспользуемые реализации
  - Reference: technical-audit-20261008 / T004 / implementation
  - Файлы: docs/planning/technical-audit-findings.md, docs/planning/technical-audit-findings-unused.md
- [TODO] T005: Проверить обработку ошибок и жизненный цикл — Ожидает
  - Git Commit: [PENDING] docs: исследовать ошибки и жизненный цикл
  - Reference: technical-audit-20261008 / T005 / implementation
  - Файлы: docs/planning/technical-audit-findings.md
- [TODO] T006: Свести результаты и проверить доказательства — Ожидает
  - Git Commit: [PENDING] docs: завершить доказательный технический аудит
  - Reference: technical-audit-20261008 / T006 / implementation
  - Файлы: docs/planning/technical-audit-findings.md

## Context Pack For This Cycle

- docs/planning/technical-audit-20261008.md
- docs/architecture/OVERVIEW.md

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
