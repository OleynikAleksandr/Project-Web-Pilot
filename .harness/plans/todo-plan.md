# Активный план — Project Web Pilot

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 871,
  "project_id": "cf944136-d1fc-4bd5-9ea0-e46d1fe230e7",
  "project_name": "Project Web Pilot",
  "scope_id": "auto-plan-reliability-20261002",
  "execution_scope_status": "ACTIVE",
  "delivery_status": "IN_PROGRESS",
  "objective": "Устранить ложные остановки режима «Автовыполнение», чтобы Web Pilot самостоятельно отправлял «Продолжай» между микрозадачами и требовал пользователя только при действительно необходимом решении.",
  "acceptance_criteria": [
    "Технические ситуации, которые агент способен исследовать сам, не требуют ручного «Продолжай» пользователя.",
    "Watchdog при busy=true предупреждает, но не выключает AutoPlan.",
    "DRAFT_PRESENT сохраняет пользовательский черновик и оставляет режим способным возобновиться после ручной отправки.",
    "Факт автоматического «Продолжай» остаётся видим в sidebar, а diagnostics содержит машинно-различимую причину остановки/предупреждения.",
    "Unit tests и Electron smoke воспроизводят реальные сценарии 02.10.2026 и проходят."
  ],
  "approved_scope": {
    "functional_paths": [
      "src/auto-plan.mjs",
      "tests/auto-plan.test.mjs",
      "src/ui/sidebar.mjs",
      "tests/electron-smoke.mjs",
      "tests/installed-observer-fixture.cjs",
      "tests/page-state.test.mjs"
    ],
    "documentation_paths": [
      "docs/planning/auto-plan-reliability.md",
      "docs/planning/auto-plan-continuation.md",
      "docs/PRODUCT.md",
      "docs/architecture/ARCHITECTURE.md",
      "docs/architecture/OVERVIEW.md",
      "docs/MODULES.md",
      "docs/DOCUMENTATION_INDEX.md"
    ]
  },
  "baseline_commit": "b15ae93c1e5d13a7d877ab4eca06b7a6b24c9087",
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
        "path": "docs/planning/auto-plan-reliability.md",
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
        "scope_id": "auto-plan-reliability-20261002",
        "task_id": "T001",
        "role": "implementation"
      },
      "dependencies": [],
      "functional_paths": [
        "src/auto-plan.mjs",
        "tests/auto-plan.test.mjs"
      ],
      "documentation_paths": [
        "docs/planning/auto-plan-reliability.md",
        "docs/planning/auto-plan-continuation.md"
      ],
      "verification_ids": [
        "unit"
      ],
      "id": "T001",
      "title": "Уточнить контракт агента и критерий реального ожидания пользователя",
      "why": "Исключить ложный «Нужен ваш ответ.» для технических ситуаций, которые агент может разбирать самостоятельно.",
      "verification_kind": "code",
      "acceptance_criteria": [
        "Стартовая инструкция требует «Нужен ваш ответ.» только при необходимости информации, выбора или решения пользователя.",
        "Техническая ошибка, тест, сборка, Git/MCP или совместимость по контракту завершаются «Готов продолжать.», если агент может продолжить самостоятельно.",
        "Ограничение одной микрозадачи на turn и остальные действующие инварианты сохранены."
      ],
      "expected_commit_message": "fix: уточнить контракт ожидания AutoPlan"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "auto-plan-reliability-20261002",
        "task_id": "T002",
        "role": "implementation"
      },
      "dependencies": [
        "T001"
      ],
      "functional_paths": [
        "src/auto-plan.mjs",
        "tests/auto-plan.test.mjs"
      ],
      "documentation_paths": [
        "docs/planning/auto-plan-reliability.md"
      ],
      "verification_ids": [
        "unit"
      ],
      "id": "T002",
      "title": "Сделать watchdog диагностическим предупреждением без остановки run",
      "why": "Реальные длинные tool-операции могут не менять видимый текст более трёх минут, оставаясь корректно busy.",
      "verification_kind": "code",
      "acceptance_criteria": [
        "STALL_WARNING при busy=true не переводит AutoPlan в paused и не очищает текущий run.",
        "После последующего прогресса/завершения turn обычная проверка плана и автоматическое продолжение сохраняются.",
        "Watchdog не нажимает Stop и не делает повторный Send."
      ],
      "expected_commit_message": "fix: не останавливать AutoPlan по stall watchdog"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "auto-plan-reliability-20261002",
        "task_id": "T003",
        "role": "implementation"
      },
      "dependencies": [
        "T002"
      ],
      "functional_paths": [
        "src/auto-plan.mjs",
        "tests/auto-plan.test.mjs"
      ],
      "documentation_paths": [
        "docs/planning/auto-plan-reliability.md"
      ],
      "verification_ids": [
        "unit"
      ],
      "id": "T003",
      "title": "Сохранять включённый AutoPlan при DRAFT_PRESENT и возобновлять после сообщения пользователя",
      "why": "Черновик должен быть защищён без превращения обычной ситуации в ручное восстановление режима.",
      "verification_kind": "code",
      "acceptance_criteria": [
        "DRAFT_PRESENT не изменяет пользовательский черновик.",
        "AutoPlan переходит в ожидающее/suspended состояние, а не полностью выключается.",
        "Фактическая ручная отправка сообщения в том же документе возобновляет существующий run без дополнительного автоматического Send."
      ],
      "expected_commit_message": "fix: возобновлять AutoPlan после пользовательского черновика"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "auto-plan-reliability-20261002",
        "task_id": "T004",
        "role": "implementation"
      },
      "dependencies": [
        "T003"
      ],
      "functional_paths": [
        "src/auto-plan.mjs",
        "src/ui/sidebar.mjs",
        "tests/auto-plan.test.mjs"
      ],
      "documentation_paths": [
        "docs/planning/auto-plan-reliability.md"
      ],
      "verification_ids": [
        "unit"
      ],
      "id": "T004",
      "title": "Сделать автоматическое «Продолжай» и причины пауз явно наблюдаемыми",
      "why": "Пользователь должен видеть, что Web Pilot действительно продолжил работу, а диагностика должна объяснять остановку без реконструкции по соседним событиям.",
      "verification_kind": "code",
      "acceptance_criteria": [
        "После успешного автоматического Send sidebar устойчиво показывает факт отправки «Продолжай» и номер продолжения текущего запуска.",
        "Значимые pause/wait/warning события AutoPlan содержат безопасный reason code без текста разговора.",
        "Существующие секреты и содержимое сообщений в diagnostics не добавляются."
      ],
      "expected_commit_message": "feat: показать автоматические продолжения AutoPlan"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "auto-plan-reliability-20261002",
        "task_id": "T005",
        "role": "implementation"
      },
      "dependencies": [
        "T004"
      ],
      "functional_paths": [
        "tests/electron-smoke.mjs",
        "tests/installed-observer-fixture.cjs",
        "tests/page-state.test.mjs"
      ],
      "documentation_paths": [
        "docs/planning/auto-plan-reliability.md"
      ],
      "verification_ids": [
        "unit",
        "smoke"
      ],
      "id": "T005",
      "title": "Закрепить реальные сценарии AutoPlan интеграционным smoke",
      "why": "Проверить связку observer → AutoPlan → composer → sidebar на сценариях, которые фактически ломали автовыполнение.",
      "verification_kind": "code",
      "acceptance_criteria": [
        "Smoke подтверждает успешное автоматическое «Продолжай» после контрольной точки.",
        "Smoke подтверждает отсутствие pause от watchdog при продолжающемся busy.",
        "Smoke подтверждает сохранение draft и возобновление после ручной отправки.",
        "Smoke подтверждает корректное ожидание при настоящем «Нужен ваш ответ.» и fail-closed поведение остальных терминальных случаев."
      ],
      "expected_commit_message": "test: закрепить надёжность AutoPlan"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "auto-plan-reliability-20261002",
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
        "docs/planning/auto-plan-reliability.md",
        "docs/PRODUCT.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/planning/auto-plan-continuation.md",
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
      "id": "0ecf22cd-8c55-4809-967f-9f32e07c7a0b",
      "text": "Пользователь поручил выполнить описанную задачу и план.",
      "recorded_at": "2026-10-02T11:30:26.231Z"
    }
  ]
}
```
<!-- workflow-state:end -->

## Состояние

Execution Scope Status: ACTIVE
Delivery Status: IN_PROGRESS
Scope: auto-plan-reliability-20261002
Current Task: нет
Revision: 871

## Цель

Устранить ложные остановки режима «Автовыполнение», чтобы Web Pilot самостоятельно отправлял «Продолжай» между микрозадачами и требовал пользователя только при действительно необходимом решении.

## Критерии приёмки

- Технические ситуации, которые агент способен исследовать сам, не требуют ручного «Продолжай» пользователя.
- Watchdog при busy=true предупреждает, но не выключает AutoPlan.
- DRAFT_PRESENT сохраняет пользовательский черновик и оставляет режим способным возобновиться после ручной отправки.
- Факт автоматического «Продолжай» остаётся видим в sidebar, а diagnostics содержит машинно-различимую причину остановки/предупреждения.
- Unit tests и Electron smoke воспроизводят реальные сценарии 02.10.2026 и проходят.

## Микрозадачи

- [TODO] T001: Уточнить контракт агента и критерий реального ожидания пользователя — Ожидает
  - Git Commit: [PENDING] fix: уточнить контракт ожидания AutoPlan
  - Reference: auto-plan-reliability-20261002 / T001 / implementation
  - Файлы: src/auto-plan.mjs, tests/auto-plan.test.mjs, docs/planning/auto-plan-reliability.md, docs/planning/auto-plan-continuation.md
- [TODO] T002: Сделать watchdog диагностическим предупреждением без остановки run — Ожидает
  - Git Commit: [PENDING] fix: не останавливать AutoPlan по stall watchdog
  - Reference: auto-plan-reliability-20261002 / T002 / implementation
  - Файлы: src/auto-plan.mjs, tests/auto-plan.test.mjs, docs/planning/auto-plan-reliability.md
- [TODO] T003: Сохранять включённый AutoPlan при DRAFT_PRESENT и возобновлять после сообщения пользователя — Ожидает
  - Git Commit: [PENDING] fix: возобновлять AutoPlan после пользовательского черновика
  - Reference: auto-plan-reliability-20261002 / T003 / implementation
  - Файлы: src/auto-plan.mjs, tests/auto-plan.test.mjs, docs/planning/auto-plan-reliability.md
- [TODO] T004: Сделать автоматическое «Продолжай» и причины пауз явно наблюдаемыми — Ожидает
  - Git Commit: [PENDING] feat: показать автоматические продолжения AutoPlan
  - Reference: auto-plan-reliability-20261002 / T004 / implementation
  - Файлы: src/auto-plan.mjs, src/ui/sidebar.mjs, tests/auto-plan.test.mjs, docs/planning/auto-plan-reliability.md
- [TODO] T005: Закрепить реальные сценарии AutoPlan интеграционным smoke — Ожидает
  - Git Commit: [PENDING] test: закрепить надёжность AutoPlan
  - Reference: auto-plan-reliability-20261002 / T005 / implementation
  - Файлы: tests/electron-smoke.mjs, tests/installed-observer-fixture.cjs, tests/page-state.test.mjs, docs/planning/auto-plan-reliability.md
- [TODO] DOCS: Актуализация всех документов проекта — Ожидает
  - Git Commit: [PENDING] docs: актуализировать контекст проекта
  - Reference: auto-plan-reliability-20261002 / DOCS / implementation
  - Файлы: docs/planning/auto-plan-reliability.md, docs/PRODUCT.md, docs/architecture/ARCHITECTURE.md, docs/planning/auto-plan-continuation.md, docs/architecture/OVERVIEW.md, docs/MODULES.md, docs/DOCUMENTATION_INDEX.md

## Context Pack For This Cycle

- docs/architecture/OVERVIEW.md → Краткая архитектура проекта
- docs/MODULES.md → Модули проекта
- docs/DOCUMENTATION_INDEX.md → Каталог документации
- docs/planning/auto-plan-reliability.md

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
