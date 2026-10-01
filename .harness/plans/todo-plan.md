# Активный план — Project Web Pilot

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 826,
  "project_id": "cf944136-d1fc-4bd5-9ea0-e46d1fe230e7",
  "project_name": "Project Web Pilot",
  "scope_id": "event-driven-runtime-phase-3-20261001",
  "execution_scope_status": "ACTIVE",
  "delivery_status": "IN_PROGRESS",
  "objective": "Завершить фазу 3 событийного рефакторинга: выполнить сопоставимые итоговые измерения и пользовательскую матрицу Chat/Work, исправить только выявленные регрессии, затем собрать и проверить парный локальный релиз Project Web Pilot 0.6.74 для macOS arm64 и Windows x64.",
  "acceptance_criteria": [
    "Завершить фазу 3 событийного рефакторинга: выполнить сопоставимые итоговые измерения и пользовательскую матрицу Chat/Work, исправить только выявленные регрессии, затем собрать и проверить парный локальный релиз Project Web Pilot 0.6.74 для macOS arm64 и Windows x64."
  ],
  "approved_scope": {
    "functional_paths": [
      "src/main.mjs",
      "package.json",
      "package-lock.json",
      "scripts/release-all.mjs",
      "scripts/release-mac.mjs",
      "scripts/verify-windows-package.mjs"
    ],
    "documentation_paths": [
      "docs/planning/event-driven-runtime.md",
      "docs/VERIFICATION.md",
      "docs/RELEASE.md",
      "docs/PRODUCT.md",
      "docs/architecture/ARCHITECTURE.md",
      "docs/architecture/OVERVIEW.md",
      "docs/MODULES.md",
      "docs/DOCUMENTATION_INDEX.md"
    ]
  },
  "baseline_commit": "2fac605dcc350291d6e160dea2c7b01735b33748",
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
        "path": "docs/planning/event-driven-runtime.md",
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
        "scope_id": "event-driven-runtime-phase-3-20261001",
        "task_id": "T001",
        "role": "implementation"
      },
      "dependencies": [],
      "functional_paths": [
        "src/main.mjs"
      ],
      "documentation_paths": [
        "docs/planning/event-driven-runtime.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "unit",
        "smoke"
      ],
      "id": "T001",
      "title": "Проверить пользовательские сценарии и повторить сопоставимые измерения",
      "why": "Проверить пользовательские сценарии и повторить сопоставимые измерения",
      "verification_kind": "code",
      "acceptance_criteria": [
        "Для согласованных сценариев выполнены сопоставимые окна не менее 60 секунд после стабилизации с фиксацией платформы, Chat/Work, длительности и целевых счётчиков; baseline и результат сопоставлены без заявления непроверенной экономии.",
        "В live Chat и Work на macOS проверены доставка, генерация/idle, переключение/перезагрузка, сворачивание/восстановление, план/stale и оформление без целевых постоянных polling-циклов.",
        "Конкретные регрессии, выявленные матрицей, исправлены в этой задаче и покрыты относящимися тестами; отсутствие регрессии не порождает лишних изменений.",
        "Windows fixture/package evidence отделено от native Windows evidence; если native Windows недоступен в этой среде, это явно зафиксировано как пользовательская проверка, а не объявлено выполненным."
      ],
      "expected_commit_message": "feat: Проверить пользовательские сценарии и повторить сопоставимые измерения",
      "actual_files": [
        "docs/VERIFICATION.md",
        "docs/planning/event-driven-runtime.md"
      ]
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "event-driven-runtime-phase-3-20261001",
        "task_id": "T002",
        "role": "implementation"
      },
      "dependencies": [
        "T001"
      ],
      "functional_paths": [
        "package.json",
        "package-lock.json",
        "scripts/release-all.mjs",
        "scripts/release-mac.mjs",
        "scripts/verify-windows-package.mjs"
      ],
      "documentation_paths": [
        "docs/planning/event-driven-runtime.md",
        "docs/RELEASE.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "paired-release"
      ],
      "id": "T002",
      "title": "Собрать и проверить парный локальный релиз 0.6.74",
      "why": "Собрать и проверить парный локальный релиз 0.6.74",
      "verification_kind": "package",
      "acceptance_criteria": [
        "Версия 0.6.74 согласованно установлена в manifest и build-командах без расхождения платформ.",
        "Штатный npm run build создаёт macOS arm64 и Windows x64 из одного source snapshot и проверяет packaged sources, ZIP integrity, Workflow Kit runtime и установленную macOS копию.",
        "Постоянный Project Web Pilot.app сохраняет filesystem identity/Finder alias; выдача находится в ~/Downloads/WebPilot-0.6.74/ и содержит оба ZIP, хэши, инструкции и release-manifest.",
        "Native Windows запуск не подменён macOS cross-package проверкой; если он не выполнен локально, ограничение явно передано пользователю."
      ],
      "expected_commit_message": "feat: Собрать и проверить парный локальный релиз 0.6.74"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "event-driven-runtime-phase-3-20261001",
        "task_id": "DOCS",
        "role": "implementation"
      },
      "dependencies": [
        "T001",
        "T002"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/planning/event-driven-runtime.md",
        "docs/PRODUCT.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md",
        "docs/RELEASE.md",
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
      "id": "8f37bfca-ea77-4be4-a19f-6e776917888a",
      "text": "Пользователь поручил выполнить описанную задачу и план.",
      "recorded_at": "2026-10-01T16:51:18.918Z"
    }
  ]
}
```
<!-- workflow-state:end -->

## Состояние

Execution Scope Status: ACTIVE
Delivery Status: IN_PROGRESS
Scope: event-driven-runtime-phase-3-20261001
Current Task: нет
Revision: 826

## Цель

Завершить фазу 3 событийного рефакторинга: выполнить сопоставимые итоговые измерения и пользовательскую матрицу Chat/Work, исправить только выявленные регрессии, затем собрать и проверить парный локальный релиз Project Web Pilot 0.6.74 для macOS arm64 и Windows x64.

## Критерии приёмки

- Завершить фазу 3 событийного рефакторинга: выполнить сопоставимые итоговые измерения и пользовательскую матрицу Chat/Work, исправить только выявленные регрессии, затем собрать и проверить парный локальный релиз Project Web Pilot 0.6.74 для macOS arm64 и Windows x64.

## Микрозадачи

- [DONE] T001: Проверить пользовательские сценарии и повторить сопоставимые измерения — Завершено
  - Git Commit: [DONE] feat: Проверить пользовательские сценарии и повторить сопоставимые измерения
  - Reference: event-driven-runtime-phase-3-20261001 / T001 / implementation
  - Файлы: src/main.mjs, docs/planning/event-driven-runtime.md, docs/VERIFICATION.md
- [TODO] T002: Собрать и проверить парный локальный релиз 0.6.74 — Ожидает
  - Git Commit: [PENDING] feat: Собрать и проверить парный локальный релиз 0.6.74
  - Reference: event-driven-runtime-phase-3-20261001 / T002 / implementation
  - Файлы: package.json, package-lock.json, scripts/release-all.mjs, scripts/release-mac.mjs, scripts/verify-windows-package.mjs, docs/planning/event-driven-runtime.md, docs/RELEASE.md, docs/VERIFICATION.md
- [TODO] DOCS: Актуализация всех документов проекта — Ожидает
  - Git Commit: [PENDING] docs: актуализировать контекст проекта
  - Reference: event-driven-runtime-phase-3-20261001 / DOCS / implementation
  - Файлы: docs/planning/event-driven-runtime.md, docs/PRODUCT.md, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md, docs/RELEASE.md, docs/architecture/OVERVIEW.md, docs/MODULES.md, docs/DOCUMENTATION_INDEX.md

## Context Pack For This Cycle

- docs/architecture/OVERVIEW.md → Краткая архитектура проекта
- docs/MODULES.md → Модули проекта
- docs/DOCUMENTATION_INDEX.md → Каталог документации
- docs/planning/event-driven-runtime.md

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
