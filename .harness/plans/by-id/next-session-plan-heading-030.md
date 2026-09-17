# Активный план — Project Web Pilot

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 9,
  "project_id": "cf944136-d1fc-4bd5-9ea0-e46d1fe230e7",
  "project_name": "Project Web Pilot",
  "scope_id": "next-session-plan-heading-030",
  "execution_scope_status": "ACTIVE",
  "delivery_status": "READY_FOR_ACCEPTANCE",
  "objective": "Переименовать непонятный заголовок блока будущего плана в «План следующей сессии» без изменения механики собственных и подготовленных планов и выпустить Project Web Pilot 0.6.30.",
  "acceptance_criteria": [
    "В сайдбаре будущий подготовленный план подписан «План следующей сессии».",
    "Логика plan:prepare/plan:bind, кнопка создания Chat/Work и связь с продолжением не изменены.",
    "Есть регрессионная проверка нового пользовательского текста.",
    "Собран и проверен релиз 0.6.30 для macOS arm64 и Windows x64.",
    "Актуализирован действующий комплект документации, где старое название было частью текущего контракта."
  ],
  "approved_scope": {
    "functional_paths": [
      "src/ui/index.html",
      "tests/sidebar.test.mjs",
      "package.json",
      "package-lock.json"
    ],
    "documentation_paths": [
      "README.md",
      "docs/PRODUCT.md",
      "docs/DECISIONS.md",
      "docs/architecture/OVERVIEW.md",
      "docs/architecture/ARCHITECTURE.md",
      "docs/MODULES.md",
      "docs/DOCUMENTATION_INDEX.md",
      "docs/modules/session-owned-plans.md",
      "docs/design/session-plan-navigation.md",
      "docs/VERIFICATION.md",
      "docs/RELEASE.md"
    ],
    "max_functional_files_per_task": 3
  },
  "baseline_commit": "68e8202cd623e9551988d40774c4219692a96c17",
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
        "path": "docs/modules/session-owned-plans.md",
        "heading_path": [
          "Планы сессий и подготовка продолжения"
        ],
        "required": true,
        "revision": "WORKTREE"
      },
      {
        "path": "docs/RELEASE.md",
        "heading_path": [
          "Выпуск и постоянный путь запуска"
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
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "next-session-plan-heading-030",
        "task_id": "T001",
        "role": "implementation"
      },
      "dependencies": [],
      "functional_paths": [
        "src/ui/index.html",
        "tests/sidebar.test.mjs"
      ],
      "documentation_paths": [],
      "verification_ids": [
        "suite",
        "electron-smoke"
      ],
      "id": "T001",
      "title": "Переименовать блок будущего плана",
      "why": "Пользователь должен сразу понимать, что блок относится к плану следующей сессии.",
      "acceptance_criteria": [
        "Заголовок блока в UI равен «План следующей сессии».",
        "Старый текст «Подготовлено здесь» не используется как пользовательский заголовок этого блока.",
        "Sidebar regression test фиксирует новый заголовок; существующее поведение подготовленного плана проходит без изменений."
      ],
      "expected_commit_message": "fix: rename next session plan heading"
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "next-session-plan-heading-030",
        "task_id": "T002",
        "role": "implementation"
      },
      "dependencies": [
        "T001"
      ],
      "functional_paths": [
        "package.json",
        "package-lock.json"
      ],
      "documentation_paths": [],
      "verification_ids": [
        "suite"
      ],
      "id": "T002",
      "title": "Собрать релиз 0.6.30",
      "why": "Доставить пользовательское исправление в штатных macOS и Windows пакетах.",
      "acceptance_criteria": [
        "Версия source обновлена до 0.6.30 и packager использует 0.6.30.",
        "macOS arm64 build обновляет постоянный Project Web Pilot.app штатным release facade.",
        "Windows x64 package проходит штатный verifier; обе поставки имеют проверенные архивы/checksum."
      ],
      "expected_commit_message": "build: release 0.6.30",
      "documentation_exception": "T002 меняет только version/package metadata и выполняет уже согласованную поставку; фактическая версия, checksums и release evidence фиксируются обязательной финальной задачей DOCS."
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "next-session-plan-heading-030",
        "task_id": "DOCS",
        "role": "implementation"
      },
      "dependencies": [
        "T001",
        "T002"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "README.md",
        "docs/PRODUCT.md",
        "docs/DECISIONS.md",
        "docs/architecture/OVERVIEW.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/MODULES.md",
        "docs/DOCUMENTATION_INDEX.md",
        "docs/modules/session-owned-plans.md",
        "docs/design/session-plan-navigation.md",
        "docs/VERIFICATION.md",
        "docs/RELEASE.md"
      ],
      "verification_ids": [],
      "id": "DOCS",
      "title": "Актуализация всех документов проекта",
      "why": "После изменения пользовательского термина и выпуска проверить весь действующий комплект документации и обновить только устаревшие сведения.",
      "acceptance_criteria": [
        "Все документы из docs/DOCUMENTATION_INDEX.md проверены на актуальность этого изменения.",
        "Текущее название блока в действующих контрактах — «План следующей сессии»; исторические цитаты/сведения не переписываются без необходимости.",
        "Release/verification документы содержат фактические сведения о 0.6.30; актуальные документы оставлены без бессмысленных правок."
      ],
      "expected_commit_message": "docs: document next session plan heading release"
    }
  ],
  "blocked_reason": null,
  "user_decisions": [
    {
      "id": "d530402c-744c-4e3c-ae8c-90ed342875ba",
      "text": "17.09.2026 пользователь поручил короткий scope: заменить заголовок блока «Подготовлено здесь» на понятный «План следующей сессии», сохранить всю существующую механику и собрать новый релиз.",
      "recorded_at": "2026-09-17T12:29:37.701Z"
    }
  ],
  "owner_session_id": "web-pilot-9d07224a-8971-476d-bc0c-ce51cdc8178c",
  "prepared_in_session_id": null
}
```
<!-- workflow-state:end -->

## Состояние

Execution Scope Status: ACTIVE
Delivery Status: READY_FOR_ACCEPTANCE
Scope: next-session-plan-heading-030
Current Task: нет
Revision: 9

## Цель

Переименовать непонятный заголовок блока будущего плана в «План следующей сессии» без изменения механики собственных и подготовленных планов и выпустить Project Web Pilot 0.6.30.

## Критерии приёмки

- В сайдбаре будущий подготовленный план подписан «План следующей сессии».
- Логика plan:prepare/plan:bind, кнопка создания Chat/Work и связь с продолжением не изменены.
- Есть регрессионная проверка нового пользовательского текста.
- Собран и проверен релиз 0.6.30 для macOS arm64 и Windows x64.
- Актуализирован действующий комплект документации, где старое название было частью текущего контракта.

## Микрозадачи

- [DONE] T001: Переименовать блок будущего плана — Завершено
  - Git Commit: [DONE] fix: rename next session plan heading
  - Reference: next-session-plan-heading-030 / T001 / implementation
  - Файлы: src/ui/index.html, tests/sidebar.test.mjs
- [DONE] T002: Собрать релиз 0.6.30 — Завершено
  - Git Commit: [DONE] build: release 0.6.30
  - Reference: next-session-plan-heading-030 / T002 / implementation
  - Файлы: package.json, package-lock.json
- [DONE] DOCS: Актуализация всех документов проекта — Завершено
  - Git Commit: [DONE] docs: document next session plan heading release
  - Reference: next-session-plan-heading-030 / DOCS / implementation
  - Файлы: README.md, docs/PRODUCT.md, docs/DECISIONS.md, docs/architecture/OVERVIEW.md, docs/architecture/ARCHITECTURE.md, docs/MODULES.md, docs/DOCUMENTATION_INDEX.md, docs/modules/session-owned-plans.md, docs/design/session-plan-navigation.md, docs/VERIFICATION.md, docs/RELEASE.md

## Context Pack For This Cycle

- docs/architecture/OVERVIEW.md → Краткая архитектура проекта
- docs/MODULES.md → Модули проекта
- docs/DOCUMENTATION_INDEX.md → Каталог документации
- docs/modules/session-owned-plans.md → Планы сессий и подготовка продолжения
- docs/RELEASE.md → Выпуск и постоянный путь запуска

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
