# Активный план — Project Web Pilot

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 15,
  "project_id": "cf944136-d1fc-4bd5-9ea0-e46d1fe230e7",
  "project_name": "Project Web Pilot",
  "scope_id": "next-session-plan-heading-030",
  "execution_scope_status": "ACTIVE",
  "delivery_status": "IN_PROGRESS",
  "objective": "Переименовать блок будущего плана, сохранять геометрию интерфейса между запусками и релизами и выпустить актуальный Project Web Pilot.",
  "acceptance_criteria": [
    "В сайдбаре будущий подготовленный план подписан «План следующей сессии».",
    "Логика plan:prepare/plan:bind, кнопка создания Chat/Work и связь с продолжением не изменены.",
    "Есть регрессионная проверка нового пользовательского текста.",
    "Собран и проверен релиз 0.6.30 для macOS arm64 и Windows x64.",
    "Актуализирован действующий комплект документации, где старое название было частью текущего контракта.",
    "Размер и позиция основного окна, а также ширина левого сайдбара сохраняются между перезапусками и после установки нового релиза."
  ],
  "approved_scope": {
    "functional_paths": [
      "src/ui/index.html",
      "tests/sidebar.test.mjs",
      "package.json",
      "package-lock.json",
      "src/main.mjs",
      "tests/electron-smoke.mjs"
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
      "docs/RELEASE.md",
      "docs/modules/workspace-sessions.md"
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
        "task_id": "T003",
        "role": "implementation"
      },
      "dependencies": [
        "T002"
      ],
      "functional_paths": [
        "src/main.mjs",
        "tests/electron-smoke.mjs"
      ],
      "documentation_paths": [],
      "verification_ids": [
        "suite",
        "electron-smoke"
      ],
      "id": "T003",
      "title": "Сохранять геометрию окна и сайдбара",
      "why": "После перезапуска и обновления пользователь должен получать тот же размер и положение интерфейса.",
      "acceptance_criteria": [
        "Основное BaseWindow использует штатное Electron windowStatePersistence с постоянным именем и сохраняет position/size в userData.",
        "Восстановленные bounds переживают перезапуск и смену релиза и корректно адаптируются Electron к актуальной конфигурации мониторов.",
        "Ширина левого сайдбара продолжает сохраняться в userData/settings.json; регрессионная проверка подтверждает её сохранение.",
        "Механика layout WebContentsView и минимальные ширины сайдбара/браузера не изменены."
      ],
      "expected_commit_message": "feat: persist main window geometry",
      "documentation_exception": "T003 реализует согласованный контракт Workspace & Sessions; итоговое описание поведения и проверок обновляется обязательной повторной задачей DOCS."
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "next-session-plan-heading-030",
        "task_id": "T004",
        "role": "implementation"
      },
      "dependencies": [
        "T003"
      ],
      "functional_paths": [
        "package.json",
        "package-lock.json"
      ],
      "documentation_paths": [],
      "verification_ids": [
        "suite"
      ],
      "id": "T004",
      "title": "Собрать релиз 0.6.31",
      "why": "Доставить сохранение геометрии окна в новых macOS и Windows пакетах.",
      "acceptance_criteria": [
        "Версия source и packager обновлена до 0.6.31.",
        "macOS arm64 и Windows x64 сборки успешно проходят штатные release/verifier проверки.",
        "Обе ZIP-поставки проверены и скопированы в ~/Downloads/WebPilot-0.6.31/."
      ],
      "expected_commit_message": "build: release 0.6.31",
      "documentation_exception": "T004 меняет только version/package metadata и выполняет согласованную поставку; фактические checksums и release evidence фиксируются повторной DOCS."
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "next-session-plan-heading-030",
        "task_id": "DOCS",
        "role": "implementation",
        "iteration": 2
      },
      "dependencies": [
        "T001",
        "T002",
        "T003",
        "T004"
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
        "docs/RELEASE.md",
        "docs/modules/workspace-sessions.md"
      ],
      "verification_ids": [],
      "id": "DOCS",
      "title": "Актуализация всех документов проекта",
      "why": "После сохранения геометрии интерфейса и выпуска 0.6.31 проверить весь действующий комплект документации и обновить только устаревшие сведения.",
      "acceptance_criteria": [
        "Все документы из docs/DOCUMENTATION_INDEX.md проверены на актуальность этого изменения.",
        "Контракт Workspace & Sessions описывает сохранение position/size основного окна через native Electron persistence и существующее сохранение ширины сайдбара в userData.",
        "Release/verification документы содержат фактические сведения, checksums и границы проверки 0.6.31; исторические записи сохранены.",
        "Актуальные документы оставлены без бессмысленных правок; локальные ссылки и две копии Workflow Kit согласованы."
      ],
      "expected_commit_message": "docs: document persistent window geometry release"
    }
  ],
  "blocked_reason": null,
  "user_decisions": [
    {
      "id": "d530402c-744c-4e3c-ae8c-90ed342875ba",
      "text": "17.09.2026 пользователь поручил короткий scope: заменить заголовок блока «Подготовлено здесь» на понятный «План следующей сессии», сохранить всю существующую механику и собрать новый релиз.",
      "recorded_at": "2026-09-17T12:29:37.701Z"
    },
    {
      "id": "e201778e-14cf-4a24-a891-97dc5d3146ff",
      "text": "17.09.2026 после проверки 0.6.30 пользователь поручил в том же scope сохранять между перезапусками и новыми релизами размер и положение основного окна Web Pilot и ширину левого сайдбара.",
      "recorded_at": "2026-09-17T13:58:54.479386Z"
    }
  ],
  "owner_session_id": "web-pilot-9d07224a-8971-476d-bc0c-ce51cdc8178c",
  "prepared_in_session_id": null
}
```
<!-- workflow-state:end -->

## Состояние

Execution Scope Status: ACTIVE
Delivery Status: IN_PROGRESS
Scope: next-session-plan-heading-030
Current Task: нет
Revision: 15

## Цель

Переименовать блок будущего плана, сохранять геометрию интерфейса между запусками и релизами и выпустить актуальный Project Web Pilot.

## Критерии приёмки

- В сайдбаре будущий подготовленный план подписан «План следующей сессии».
- Логика plan:prepare/plan:bind, кнопка создания Chat/Work и связь с продолжением не изменены.
- Есть регрессионная проверка нового пользовательского текста.
- Собран и проверен релиз 0.6.30 для macOS arm64 и Windows x64.
- Актуализирован действующий комплект документации, где старое название было частью текущего контракта.
- Размер и позиция основного окна, а также ширина левого сайдбара сохраняются между перезапусками и после установки нового релиза.

## Микрозадачи

- [DONE] T001: Переименовать блок будущего плана — Завершено
  - Git Commit: [DONE] fix: rename next session plan heading
  - Reference: next-session-plan-heading-030 / T001 / implementation
  - Файлы: src/ui/index.html, tests/sidebar.test.mjs
- [DONE] T002: Собрать релиз 0.6.30 — Завершено
  - Git Commit: [DONE] build: release 0.6.30
  - Reference: next-session-plan-heading-030 / T002 / implementation
  - Файлы: package.json, package-lock.json
- [DONE] T003: Сохранять геометрию окна и сайдбара — Завершено
  - Git Commit: [DONE] feat: persist main window geometry
  - Reference: next-session-plan-heading-030 / T003 / implementation
  - Файлы: src/main.mjs, tests/electron-smoke.mjs
- [DONE] T004: Собрать релиз 0.6.31 — Завершено
  - Git Commit: [DONE] build: release 0.6.31
  - Reference: next-session-plan-heading-030 / T004 / implementation
  - Файлы: package.json, package-lock.json
- [TODO] DOCS: Актуализация всех документов проекта — Ожидает
  - Git Commit: [PENDING] docs: document persistent window geometry release
  - Reference: next-session-plan-heading-030 / DOCS / implementation
  - Файлы: README.md, docs/PRODUCT.md, docs/DECISIONS.md, docs/architecture/OVERVIEW.md, docs/architecture/ARCHITECTURE.md, docs/MODULES.md, docs/DOCUMENTATION_INDEX.md, docs/modules/session-owned-plans.md, docs/design/session-plan-navigation.md, docs/VERIFICATION.md, docs/RELEASE.md, docs/modules/workspace-sessions.md

## Context Pack For This Cycle

- docs/architecture/OVERVIEW.md → Краткая архитектура проекта
- docs/MODULES.md → Модули проекта
- docs/DOCUMENTATION_INDEX.md → Каталог документации
- docs/modules/session-owned-plans.md → Планы сессий и подготовка продолжения
- docs/RELEASE.md → Выпуск и постоянный путь запуска
- docs/modules/workspace-sessions.md → Module Specification — Workspace & Sessions

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
