# Активный план — Project Web Pilot

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 561,
  "project_id": "cf944136-d1fc-4bd5-9ea0-e46d1fe230e7",
  "project_name": "Project Web Pilot",
  "scope_id": "session-tree-outline-026",
  "execution_scope_status": "ACTIVE",
  "delivery_status": "READY_FOR_ACCEPTANCE",
  "objective": "Заменить отдельную акцентную полосу выбранной сессии на тонкую обводку всей карточки, визуально объединённую с яркими линиями дерева, и выпустить новый релиз macOS/Windows.",
  "acceptance_criteria": [
    "У активной сессии отсутствует отдельная вертикальная акцентная полоса.",
    "Вся session-row, включая badge Chat/Work и меню, имеет тонкую скруглённую обводку.",
    "Chevron раскрытия, вертикальная магистраль, горизонтальные ветви и обводка активной сессии используют один tree-accent цвет и визуально одинаковую тонкую толщину.",
    "Hover, длинные заголовки, badge, меню и viewport/scroll трёх сессий не нарушены.",
    "Собран и проверен новый релиз для macOS arm64 и Windows x64."
  ],
  "approved_scope": {
    "functional_paths": [
      "src/ui/index.html",
      "tests/sidebar.test.mjs",
      "package.json",
      "package-lock.json"
    ],
    "documentation_paths": [
      "docs/architecture/OVERVIEW.md",
      "docs/MODULES.md",
      "docs/DOCUMENTATION_INDEX.md",
      "docs/modules/workspace-sessions.md",
      "docs/RELEASE.md",
      "docs/VERIFICATION.md",
      "README.md",
      "docs/PRODUCT.md",
      "docs/WORKFLOW_START.md",
      "docs/DECISIONS.md",
      "docs/TRANSFER_TO_WINDOWS.md",
      "docs/architecture/ARCHITECTURE.md",
      "docs/modules/project-doctor.md"
    ],
    "max_functional_files_per_task": 3
  },
  "baseline_commit": "1afd8835fb33075a6949f58c2bf816e4dc31997d",
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
        "path": "docs/modules/workspace-sessions.md",
        "heading_path": [
          "Module Specification — Workspace & Sessions"
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
        "scope_id": "session-tree-outline-026",
        "task_id": "T001",
        "role": "implementation"
      },
      "dependencies": [],
      "functional_paths": [
        "src/ui/index.html",
        "tests/sidebar.test.mjs"
      ],
      "documentation_paths": [
        "docs/modules/workspace-sessions.md"
      ],
      "verification_ids": [],
      "id": "T001",
      "title": "Объединить выделение сессии с линиями дерева",
      "why": "Реализовать согласованное визуальное выделение активной сессии без отдельной вертикальной полосы.",
      "acceptance_criteria": [
        "Активная session-row обведена по всему периметру тонкой скруглённой линией.",
        "Отдельный 3px marker удалён.",
        "Chevron и все ветви дерева используют tree-accent, как и active outline.",
        "Тест фиксирует CSS-контракт и существующее поведение выбора/scroll остаётся зелёным."
      ],
      "expected_commit_message": "feat: unify active session tree outline",
      "documentation_exception": "Модульный контракт Workspace & Sessions обновляется в этой задаче; широкие архитектурные и verification-сводки по mappings будут актуализированы обязательной финальной задачей DOCS."
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "session-tree-outline-026",
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
        "suite",
        "electron-smoke"
      ],
      "id": "T002",
      "title": "Собрать и проверить релиз 0.6.26",
      "why": "Предоставить пользователю новый проверяемый выпуск для обеих поддерживаемых платформ.",
      "acceptance_criteria": [
        "Версия package и обеих packager-команд — 0.6.26.",
        "Node test suite и Electron smoke проходят.",
        "macOS arm64 и Windows x64 packages успешно собраны и проверены штатными release scripts.",
        "Постоянный macOS app обновлён штатным механизмом без смены filesystem identity."
      ],
      "expected_commit_message": "release: publish Web Pilot 0.6.26 with session outline",
      "documentation_exception": "T002 меняет только version/package metadata и выполняет уже согласованную поставку; фактическая версия, checksums и release evidence фиксируются обязательной финальной задачей DOCS."
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "session-tree-outline-026",
        "task_id": "DOCS",
        "role": "implementation"
      },
      "dependencies": [
        "T001",
        "T002"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/architecture/OVERVIEW.md",
        "docs/MODULES.md",
        "docs/DOCUMENTATION_INDEX.md",
        "docs/modules/workspace-sessions.md",
        "docs/RELEASE.md",
        "docs/VERIFICATION.md",
        "README.md",
        "docs/PRODUCT.md",
        "docs/WORKFLOW_START.md",
        "docs/DECISIONS.md",
        "docs/TRANSFER_TO_WINDOWS.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/modules/project-doctor.md"
      ],
      "verification_ids": [],
      "id": "DOCS",
      "title": "Актуализация всех документов проекта",
      "why": "Проверить действующую документацию после изменения session tree и выпуска 0.6.26, обновив только устаревшие сведения.",
      "acceptance_criteria": [
        "Все документы из индекса проверены; актуальные оставлены без бессмысленных правок.",
        "Изменение дерева сессий и release evidence 0.6.26 отражены в профильных документах.",
        "Текущая версия и пути поставок macOS/Windows не противоречат собранным артефактам."
      ],
      "expected_commit_message": "docs: document session outline and release 0.6.26"
    }
  ],
  "blocked_reason": null,
  "user_decisions": [
    {
      "id": "bb5fb703-53be-4fcc-8c94-dca54c224bdf",
      "text": "16.09.2026 пользователь подтвердил: убрать отдельную вертикальную полосу активной сессии; обвести всю плашку, включая Chat/Work и меню; треугольник, ветви дерева и обводка должны иметь один акцентный цвет и одинаковую тонкую толщину. После этого поручил составить todo-план, реализовать и собрать новый релиз.",
      "recorded_at": "2026-09-16T12:58:38.867Z"
    }
  ]
}
```
<!-- workflow-state:end -->

## Состояние

Execution Scope Status: ACTIVE
Delivery Status: READY_FOR_ACCEPTANCE
Scope: session-tree-outline-026
Current Task: нет
Revision: 561

## Цель

Заменить отдельную акцентную полосу выбранной сессии на тонкую обводку всей карточки, визуально объединённую с яркими линиями дерева, и выпустить новый релиз macOS/Windows.

## Критерии приёмки

- У активной сессии отсутствует отдельная вертикальная акцентная полоса.
- Вся session-row, включая badge Chat/Work и меню, имеет тонкую скруглённую обводку.
- Chevron раскрытия, вертикальная магистраль, горизонтальные ветви и обводка активной сессии используют один tree-accent цвет и визуально одинаковую тонкую толщину.
- Hover, длинные заголовки, badge, меню и viewport/scroll трёх сессий не нарушены.
- Собран и проверен новый релиз для macOS arm64 и Windows x64.

## Микрозадачи

- [DONE] T001: Объединить выделение сессии с линиями дерева — Завершено
  - Git Commit: [DONE] feat: unify active session tree outline
  - Reference: session-tree-outline-026 / T001 / implementation
  - Файлы: src/ui/index.html, tests/sidebar.test.mjs, docs/modules/workspace-sessions.md
- [DONE] T002: Собрать и проверить релиз 0.6.26 — Завершено
  - Git Commit: [DONE] release: publish Web Pilot 0.6.26 with session outline
  - Reference: session-tree-outline-026 / T002 / implementation
  - Файлы: package.json, package-lock.json
- [DONE] DOCS: Актуализация всех документов проекта — Завершено
  - Git Commit: [DONE] docs: document session outline and release 0.6.26
  - Reference: session-tree-outline-026 / DOCS / implementation
  - Файлы: docs/architecture/OVERVIEW.md, docs/MODULES.md, docs/DOCUMENTATION_INDEX.md, docs/modules/workspace-sessions.md, docs/RELEASE.md, docs/VERIFICATION.md, README.md, docs/PRODUCT.md, docs/WORKFLOW_START.md, docs/DECISIONS.md, docs/TRANSFER_TO_WINDOWS.md, docs/architecture/ARCHITECTURE.md, docs/modules/project-doctor.md

## Context Pack For This Cycle

- docs/architecture/OVERVIEW.md → Краткая архитектура проекта
- docs/MODULES.md → Модули проекта
- docs/DOCUMENTATION_INDEX.md → Каталог документации
- docs/modules/workspace-sessions.md → Module Specification — Workspace & Sessions
- docs/RELEASE.md → Выпуск и постоянный путь запуска

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
