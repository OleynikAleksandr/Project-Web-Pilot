# Активный план — Project Web Pilot

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 389,
  "project_id": "cf944136-d1fc-4bd5-9ea0-e46d1fe230e7",
  "project_name": "Project Web Pilot",
  "scope_id": "scope-015",
  "execution_scope_status": "ACTIVE",
  "delivery_status": "IN_PROGRESS",
  "objective": "Ваши проекты: компактное дерево сессий",
  "acceptance_criteria": [
    "Создание и подключение проекта находятся в раскрывающемся меню Ваши проекты.",
    "Название проекта выбирает последнюю созданную активную сессию; стрелка управляет раскрытием.",
    "Новые сессии сверху; открытие старой сессии не меняет порядок.",
    "В папке видны не более трёх строк сессий; остальные доступны видимой прокруткой справа.",
    "Оформление соответствует утверждённому прототипу и поддерживает светлую/тёмную тему и ширину sidebar от 312 px.",
    "Регрессионные проверки пройдены; новый macOS/Windows release собран для пользователя; scope остаётся ACTIVE до приёмки."
  ],
  "approved_scope": {
    "functional_paths": [
      "src/workspace-session.mjs",
      "src/main.mjs",
      "src/ui/sidebar.mjs",
      "src/ui/index.html",
      "tests/workspace-session.test.mjs",
      "tests/sidebar.test.mjs",
      "tests/electron-smoke.mjs",
      "package.json",
      "package-lock.json"
    ],
    "documentation_paths": [
      "docs/modules/workspace-sessions.md",
      "docs/DECISIONS.md",
      "docs/architecture/ARCHITECTURE.md",
      "docs/VERIFICATION.md",
      "docs/WORKFLOW_START.md",
      "docs/PRODUCT.md"
    ],
    "max_functional_files_per_task": 3
  },
  "baseline_commit": "eefb94be4bc8fc15c79b44ef7cbeefaf7f00992c",
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
        "path": "docs/modules/workspace-sessions.md",
        "heading_path": [
          "Module Specification — Workspace & Sessions",
          "Представление в дереве"
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
      "dependencies": [],
      "functional_paths": [],
      "documentation_paths": [
        "docs/modules/workspace-sessions.md",
        "docs/DECISIONS.md"
      ],
      "verification_ids": [],
      "id": "T001",
      "title": "Зафиксировать согласованный контракт блока проектов",
      "why": "Перенести утверждённое поведение прототипа в спецификацию владельца",
      "acceptance_criteria": [
        "Спецификация фиксирует меню, дерево, выбор последней, порядок по дате создания и прокрутку трёх строк"
      ],
      "expected_commit_message": "docs: approve compact projects sidebar contract",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "scope-015",
        "task_id": "T001",
        "role": "implementation"
      }
    },
    {
      "dependencies": [
        "T001"
      ],
      "functional_paths": [
        "src/workspace-session.mjs",
        "src/main.mjs",
        "tests/workspace-session.test.mjs"
      ],
      "documentation_paths": [
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "syntax",
        "workspace"
      ],
      "id": "T002",
      "title": "Выбирать последнюю сессию и выдавать новые первыми",
      "why": "Согласовать выбор проекта и порядок списка с утверждённым поведением",
      "acceptance_criteria": [
        "Явный выбор проекта выбирает newest active createdAt; равные даты упорядочены детерминированно",
        "Reload/startup и прямой выбор старой сессии сохраняют текущую сессию и порядок",
        "Архивные сессии исключены, данные и URL сохранены"
      ],
      "expected_commit_message": "feat: select newest project session and order recent sessions",
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "scope-015",
        "task_id": "T002",
        "role": "implementation"
      }
    },
    {
      "dependencies": [
        "T002"
      ],
      "functional_paths": [
        "src/ui/sidebar.mjs",
        "src/ui/index.html"
      ],
      "documentation_paths": [
        "docs/architecture/ARCHITECTURE.md"
      ],
      "verification_ids": [
        "syntax"
      ],
      "id": "T003",
      "title": "Внедрить меню и компактное дерево с прокруткой",
      "why": "Применить утверждённое оформление в существующем sidebar",
      "acceptance_criteria": [
        "Редкие действия скрыты в работающем меню Ваши проекты",
        "Проект визуально отличается от сессии; линии и стрелки соосны",
        "Список ограничен тремя строками, scrollbar видим справа, menus/badges левее",
        "Меню сессий не обрезается областью прокрутки; scroll position сохраняется при обновлениях состояния"
      ],
      "expected_commit_message": "feat: integrate compact project tree and session scrolling",
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "scope-015",
        "task_id": "T003",
        "role": "implementation"
      }
    },
    {
      "dependencies": [
        "T003"
      ],
      "functional_paths": [
        "tests/sidebar.test.mjs",
        "tests/electron-smoke.mjs"
      ],
      "documentation_paths": [
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "syntax",
        "suite",
        "electron-smoke"
      ],
      "id": "T004",
      "title": "Проверить интерфейс и сценарии сессий",
      "why": "Проверить реальные IPC и DOM после изменения дерева",
      "acceptance_criteria": [
        "Проверены меню, newest-first, последняя сессия, доступ к четвёртой, scroll и темы",
        "Пройдены Node suite и Electron smoke на изолированном fixture"
      ],
      "expected_commit_message": "test: verify compact sidebar and newest session flow",
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "scope-015",
        "task_id": "T004",
        "role": "implementation"
      }
    },
    {
      "dependencies": [
        "T004"
      ],
      "functional_paths": [
        "package.json",
        "package-lock.json"
      ],
      "documentation_paths": [
        "docs/WORKFLOW_START.md",
        "docs/PRODUCT.md",
        "docs/modules/workspace-sessions.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "syntax"
      ],
      "id": "T005",
      "title": "Собрать релиз 0.6.15 для проверки",
      "why": "Передать пользователю обновлённое приложение",
      "acceptance_criteria": [
        "Собраны macOS arm64 и Windows x64 0.6.15",
        "Версии bundle и исходники app.asar сверены; scope оставлен на приёмке"
      ],
      "expected_commit_message": "release: build Web Pilot 0.6.15",
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "scope-015",
        "task_id": "T005",
        "role": "implementation"
      }
    }
  ],
  "blocked_reason": null,
  "user_decisions": [
    {
      "id": "66647247-b934-4006-a93c-c4c4b1f7c078",
      "text": "Пользователь утвердил интерактивный HTML-прототип в этой сессии и прямо поручил интегрировать его, создать scope и собрать новый релиз. Подтверждены: меню Ваши проекты, отличие проектов от сессий, соосное дерево, автоматический выбор последней сессии, порядок createdAt по убыванию, три видимые сессии и заметная внутренняя прокрутка.",
      "recorded_at": "2026-09-15T13:49:55.124Z"
    }
  ]
}
```
<!-- workflow-state:end -->

## Состояние

Execution Scope Status: ACTIVE
Delivery Status: IN_PROGRESS
Scope: scope-015
Current Task: нет
Revision: 389

## Цель

Ваши проекты: компактное дерево сессий

## Критерии приёмки

- Создание и подключение проекта находятся в раскрывающемся меню Ваши проекты.
- Название проекта выбирает последнюю созданную активную сессию; стрелка управляет раскрытием.
- Новые сессии сверху; открытие старой сессии не меняет порядок.
- В папке видны не более трёх строк сессий; остальные доступны видимой прокруткой справа.
- Оформление соответствует утверждённому прототипу и поддерживает светлую/тёмную тему и ширину sidebar от 312 px.
- Регрессионные проверки пройдены; новый macOS/Windows release собран для пользователя; scope остаётся ACTIVE до приёмки.

## Микрозадачи

- [DONE] T001: Зафиксировать согласованный контракт блока проектов — Завершено
  - Git Commit: [DONE] docs: approve compact projects sidebar contract
  - Reference: scope-015 / T001 / implementation
  - Файлы: docs/modules/workspace-sessions.md, docs/DECISIONS.md
- [TODO] T002: Выбирать последнюю сессию и выдавать новые первыми — Ожидает
  - Git Commit: [PENDING] feat: select newest project session and order recent sessions
  - Reference: scope-015 / T002 / implementation
  - Файлы: src/workspace-session.mjs, src/main.mjs, tests/workspace-session.test.mjs, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md
- [TODO] T003: Внедрить меню и компактное дерево с прокруткой — Ожидает
  - Git Commit: [PENDING] feat: integrate compact project tree and session scrolling
  - Reference: scope-015 / T003 / implementation
  - Файлы: src/ui/sidebar.mjs, src/ui/index.html, docs/architecture/ARCHITECTURE.md
- [TODO] T004: Проверить интерфейс и сценарии сессий — Ожидает
  - Git Commit: [PENDING] test: verify compact sidebar and newest session flow
  - Reference: scope-015 / T004 / implementation
  - Файлы: tests/sidebar.test.mjs, tests/electron-smoke.mjs, docs/VERIFICATION.md
- [TODO] T005: Собрать релиз 0.6.15 для проверки — Ожидает
  - Git Commit: [PENDING] release: build Web Pilot 0.6.15
  - Reference: scope-015 / T005 / implementation
  - Файлы: package.json, package-lock.json, docs/WORKFLOW_START.md, docs/PRODUCT.md, docs/modules/workspace-sessions.md, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md

## Context Pack For This Cycle

- docs/architecture/OVERVIEW.md → Краткая архитектура проекта
- docs/modules/workspace-sessions.md → Module Specification — Workspace & Sessions / Представление в дереве

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
