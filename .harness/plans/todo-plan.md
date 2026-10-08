# Активный план — Project Web Pilot

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 1500,
  "project_id": "cf944136-d1fc-4bd5-9ea0-e46d1fe230e7",
  "project_name": "Project Web Pilot",
  "scope_id": "review-usability-0103-20261008",
  "execution_scope_status": "ACTIVE",
  "delivery_status": "IN_PROGRESS",
  "objective": "Исправить пять замечаний пользовательского тестирования Review/AutoPlan и восстановления ChatGPT; выпустить обновление 0.6.103.",
  "acceptance_criteria": [
    "Пять замечаний устранены согласно спецификации; регрессии Review/AutoPlan и очистки исключены назначенными проверками",
    "Выпуск опубликован, пользовательская и Windows/чистая приёмка отделены от автоматических проверок"
  ],
  "approved_scope": {
    "functional_paths": [
      "src/ui/index.html",
      "src/ui/sidebar.mjs",
      "src/plan-review.mjs",
      "tests/plan-review.test.mjs",
      "tests/electron-smoke.mjs",
      "src/conversation-recovery.mjs",
      "tests/conversation-recovery.test.mjs",
      "packages/workflow-kit/src/lib/plan-review.mjs",
      "packages/workflow-kit/src/lib/command-help.mjs",
      "packages/workflow-kit/src/lib/recovery.mjs",
      "packages/workflow-kit/src/lib/actions.mjs",
      "src/context-session.mjs",
      "src/review-continuation.mjs",
      "packages/workflow-kit/scripts/check-plan-review-fixture.mjs",
      "packages/workflow-kit/src/lib/claude-review.mjs",
      "packages/workflow-kit/src/cli.mjs",
      "package.json",
      "package-lock.json",
      "packages/workflow-kit/package.json",
      "packages/workflow-kit/src/lib/common.mjs",
      "packages/workflow-kit/src/lib/installer.mjs",
      ".harness/workflow.json",
      "tests/workflow-kit-upgrade.test.mjs",
      "tests/workflow-kit-source.test.mjs",
      "release-manifest.json",
      "src/main.mjs"
    ],
    "documentation_paths": [
      "docs/planning/review-usability-0103.md",
      "README.md",
      "AGENTS.md",
      "docs/architecture/OVERVIEW.md",
      "docs/modules/plan-review.md",
      "docs/modules/auto-plan.md",
      "docs/modules/context-delivery.md",
      "docs/modules/workspace-sidebar-ui.md",
      "docs/modules/release.md",
      "packages/workflow-kit/docs/modules/workflow-kit-package.md",
      "packages/workflow-kit/README.md"
    ]
  },
  "baseline_commit": "98ce6212606858939324d4f234953b9e26261655",
  "current_task_id": null,
  "context_pack": {
    "documents": [
      {
        "path": "docs/planning/review-usability-0103.md",
        "required": true,
        "revision": "WORKTREE"
      },
      {
        "path": "docs/modules/plan-review.md",
        "required": false,
        "revision": "WORKTREE"
      },
      {
        "path": "docs/modules/auto-plan.md",
        "required": false,
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
        "scope_id": "review-usability-0103-20261008",
        "task_id": "T001",
        "role": "implementation"
      },
      "dependencies": [],
      "functional_paths": [
        "src/ui/index.html",
        "src/ui/sidebar.mjs",
        "src/plan-review.mjs",
        "tests/plan-review.test.mjs",
        "tests/electron-smoke.mjs",
        "src/main.mjs"
      ],
      "documentation_paths": [
        "docs/planning/review-usability-0103.md"
      ],
      "verification_ids": [
        "unit-all",
        "electron-smoke"
      ],
      "id": "T001",
      "title": "Согласовать кнопки и добавить индикатор Review",
      "why": "Согласовать кнопки и добавить индикатор Review",
      "acceptance_criteria": [
        "Обе кнопки зелёные только при ON, действия и aria понятны; независимость и восстановление настроек проверены через обработчики",
        "Спиннер только при выполнении; успех и внимание статичны, reduced motion учтён",
        "Живость runner проверяется при refresh; ограниченный watchdog только на время RUNNING переводит потерянный процесс в статическое внимание, включая restart; в простое polling нет"
      ],
      "expected_commit_message": "fix: Согласовать кнопки и добавить индикатор Review",
      "actual_files": [
        "src/main.mjs",
        "src/plan-review.mjs",
        "src/ui/index.html",
        "src/ui/sidebar.mjs",
        "tests/electron-smoke.mjs",
        "tests/plan-review.test.mjs"
      ]
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "review-usability-0103-20261008",
        "task_id": "T002",
        "role": "implementation"
      },
      "dependencies": [
        "T001"
      ],
      "functional_paths": [
        "src/ui/sidebar.mjs",
        "src/ui/index.html",
        "src/conversation-recovery.mjs",
        "tests/conversation-recovery.test.mjs",
        "tests/electron-smoke.mjs",
        "src/main.mjs"
      ],
      "documentation_paths": [
        "docs/planning/review-usability-0103.md"
      ],
      "verification_ids": [
        "unit-all",
        "electron-smoke"
      ],
      "id": "T002",
      "title": "Отделить ожидание от ошибки страницы ChatGPT",
      "why": "Отделить ожидание от ошибки страницы ChatGPT",
      "acceptance_criteria": [
        "STALL_WARNING не открывает восстановление; обнаруженная ошибка сохраняет его",
        "Перезагрузить страницу чата объясняет причину и отсутствие нового чата/повторной отправки; draft/UNKNOWN/rate limit сохранены"
      ],
      "expected_commit_message": "fix: Отделить ожидание от ошибки страницы ChatGPT",
      "actual_files": [
        "src/conversation-recovery.mjs",
        "src/ui/index.html",
        "src/ui/sidebar.mjs",
        "tests/conversation-recovery.test.mjs",
        "tests/electron-smoke.mjs"
      ]
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "review-usability-0103-20261008",
        "task_id": "T003",
        "role": "implementation"
      },
      "dependencies": [
        "T002"
      ],
      "functional_paths": [
        "packages/workflow-kit/src/lib/plan-review.mjs",
        "packages/workflow-kit/src/lib/command-help.mjs",
        "packages/workflow-kit/src/lib/recovery.mjs",
        "packages/workflow-kit/src/lib/actions.mjs",
        "src/context-session.mjs",
        "src/review-continuation.mjs",
        "tests/plan-review.test.mjs",
        "packages/workflow-kit/scripts/check-plan-review-fixture.mjs"
      ],
      "documentation_paths": [
        "docs/planning/review-usability-0103.md"
      ],
      "verification_ids": [
        "unit-all",
        "kit-check"
      ],
      "id": "T003",
      "title": "Передавать явного получателя продолжения Review",
      "why": "Передавать явного получателя продолжения Review",
      "acceptance_criteria": [
        "Обычная подготовка передаёт согласованный Session ID без угадывания и ручной правки state",
        "Пауза между раундами и restart доставляют только своему чату; отсутствие/конфликт ID проверены; тестовые проекты пользователя не изменены",
        "Другой ID продолжающегося run отклоняется без явного recipient_change_note с решением пользователя; разрешённый подхват записан и проверен"
      ],
      "expected_commit_message": "fix: Передавать явного получателя продолжения Review"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "review-usability-0103-20261008",
        "task_id": "T004",
        "role": "implementation"
      },
      "dependencies": [
        "T003"
      ],
      "functional_paths": [
        "packages/workflow-kit/src/lib/plan-review.mjs",
        "packages/workflow-kit/src/lib/claude-review.mjs",
        "packages/workflow-kit/src/lib/command-help.mjs",
        "packages/workflow-kit/src/lib/recovery.mjs",
        "packages/workflow-kit/src/cli.mjs",
        "src/review-continuation.mjs",
        "packages/workflow-kit/scripts/check-plan-review-fixture.mjs",
        "tests/plan-review.test.mjs"
      ],
      "documentation_paths": [
        "docs/planning/review-usability-0103.md"
      ],
      "verification_ids": [
        "unit-all",
        "kit-check"
      ],
      "id": "T004",
      "title": "Сохранять позицию автора на каждый отзыв и итоговое согласие",
      "why": "Сохранять позицию автора на каждый отзыв и итоговое согласие",
      "acceptance_criteria": [
        "Каждый успешный отзыв, включая approved, имеет содержательную позицию через Kit до публикации при ON",
        "Неизменённая согласованная пара публикуется без формального нового раунда; изменённая требует нового согласия",
        "Существенные решения опубликованы; ошибки/спор требуют пользователя; OFF и безопасная очистка сохранены",
        "После NEEDS_USER явное resolve publish разрешает публикацию с нерешённым спором: при успешном отзыве на текущую пару позиция обязательна, при ошибке без успешного отзыва не требуется; без решения пользователя публикация отклонена"
      ],
      "expected_commit_message": "fix: Сохранять позицию автора на каждый отзыв и итоговое согласие"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "review-usability-0103-20261008",
        "task_id": "T005",
        "role": "implementation"
      },
      "dependencies": [
        "T004"
      ],
      "functional_paths": [
        "package.json",
        "package-lock.json",
        "packages/workflow-kit/package.json",
        "packages/workflow-kit/src/lib/common.mjs",
        "packages/workflow-kit/src/lib/installer.mjs",
        ".harness/workflow.json",
        "tests/workflow-kit-upgrade.test.mjs",
        "tests/workflow-kit-source.test.mjs",
        "tests/electron-smoke.mjs"
      ],
      "documentation_paths": [
        "docs/planning/review-usability-0103.md"
      ],
      "verification_ids": [
        "unit-all",
        "electron-smoke",
        "kit-check",
        "codex-tools-live"
      ],
      "id": "T005",
      "title": "Проверить интеграцию и подготовить версии выпуска",
      "why": "Проверить интеграцию и подготовить версии выпуска",
      "acceptance_criteria": [
        "Версия 0.6.103 свободна и закреплена; версия Kit и upgrade/stage согласованы; evidence обновлён штатно",
        "Все пять замечаний проверены через соответствующие обработчики, четыре сочетания Review/AutoPlan сохранены; ограничения живой приёмки явно описаны"
      ],
      "expected_commit_message": "fix: Проверить интеграцию и подготовить версии выпуска"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "review-usability-0103-20261008",
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
        "docs/planning/review-usability-0103.md",
        "README.md",
        "AGENTS.md",
        "docs/architecture/OVERVIEW.md",
        "docs/modules/plan-review.md",
        "docs/modules/auto-plan.md",
        "docs/modules/context-delivery.md",
        "docs/modules/workspace-sidebar-ui.md",
        "docs/modules/release.md",
        "packages/workflow-kit/docs/modules/workflow-kit-package.md",
        "packages/workflow-kit/README.md"
      ],
      "verification_ids": [],
      "id": "DOCS",
      "title": "Актуализация всех документов проекта",
      "why": "Сохранить точный контракт выпущенного результата",
      "acceptance_criteria": [
        "Все действующие документы сверены с результатом, требования временной спецификации перенесены и она удалена с точной Git-ссылкой для recovery",
        "Непроверенная живая, Windows и чистая установка не объявлены пройденными"
      ],
      "expected_commit_message": "docs: описать исправления Review и восстановления страницы"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "review-usability-0103-20261008",
        "task_id": "T006",
        "role": "implementation"
      },
      "dependencies": [
        "DOCS"
      ],
      "functional_paths": [
        "release-manifest.json"
      ],
      "documentation_paths": [],
      "verification_ids": [
        "paired-release"
      ],
      "id": "T006",
      "title": "Собрать парный выпуск 0.6.103",
      "why": "Собрать парный выпуск 0.6.103",
      "verification_kind": "package",
      "acceptance_criteria": [
        "Сборка один раз при commit после DOCS; обе поставки и root app сверены с manifest; приложение пользователя не перезапущено"
      ],
      "expected_commit_message": "release: Собрать парный выпуск 0.6.103"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "review-usability-0103-20261008",
        "task_id": "T007",
        "role": "implementation"
      },
      "dependencies": [
        "DOCS",
        "T006"
      ],
      "functional_paths": [
        "release-manifest.json"
      ],
      "documentation_paths": [],
      "verification_ids": [
        "release-installed"
      ],
      "id": "T007",
      "title": "Установить готовый macOS выпуск",
      "why": "Установить готовый macOS выпуск",
      "verification_kind": "installed",
      "acceptance_criteria": [
        "Готовый staging установлен без пересборки, identity/signature сохранены; работающий процесс не перезапущен"
      ],
      "expected_commit_message": "release: Установить готовый macOS выпуск"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "review-usability-0103-20261008",
        "task_id": "T008",
        "role": "implementation"
      },
      "dependencies": [
        "DOCS",
        "T007"
      ],
      "functional_paths": [
        "release-manifest.json"
      ],
      "documentation_paths": [],
      "verification_ids": [
        "github-release"
      ],
      "id": "T008",
      "title": "Опубликовать выпуск на GitHub",
      "why": "Опубликовать выпуск на GitHub",
      "verification_kind": "package",
      "acceptance_criteria": [
        "Шесть готовых assets, тег на sourceCommit и main сверены; финальный push; пользователю версия, URL, проверки и шаги приёмки"
      ],
      "expected_commit_message": "release: Опубликовать выпуск на GitHub"
    }
  ],
  "blocked_reason": null,
  "user_decisions": [
    {
      "id": "01d3d827-810d-4d75-82b0-984cdb2922ba",
      "text": "Пользователь 08.10.2026 разрешил реализацию, DOCS, парную сборку, установку готового macOS приложения и публикацию GitHub, без перезапуска работающего приложения.",
      "recorded_at": "2026-10-08T15:45:59.056Z"
    }
  ]
}
```
<!-- workflow-state:end -->

## Состояние

Execution Scope Status: ACTIVE
Delivery Status: IN_PROGRESS
Scope: review-usability-0103-20261008
Current Task: нет
Revision: 1500

## Цель

Исправить пять замечаний пользовательского тестирования Review/AutoPlan и восстановления ChatGPT; выпустить обновление 0.6.103.

## Критерии приёмки

- Пять замечаний устранены согласно спецификации; регрессии Review/AutoPlan и очистки исключены назначенными проверками
- Выпуск опубликован, пользовательская и Windows/чистая приёмка отделены от автоматических проверок

## Микрозадачи

- [DONE] T001: Согласовать кнопки и добавить индикатор Review — Завершено
  - Git Commit: [DONE] fix: Согласовать кнопки и добавить индикатор Review
  - Reference: review-usability-0103-20261008 / T001 / implementation
  - Файлы: src/ui/index.html, src/ui/sidebar.mjs, src/plan-review.mjs, tests/plan-review.test.mjs, tests/electron-smoke.mjs, src/main.mjs, docs/planning/review-usability-0103.md
- [DONE] T002: Отделить ожидание от ошибки страницы ChatGPT — Завершено
  - Git Commit: [DONE] fix: Отделить ожидание от ошибки страницы ChatGPT
  - Reference: review-usability-0103-20261008 / T002 / implementation
  - Файлы: src/ui/sidebar.mjs, src/ui/index.html, src/conversation-recovery.mjs, tests/conversation-recovery.test.mjs, tests/electron-smoke.mjs, src/main.mjs, docs/planning/review-usability-0103.md
- [TODO] T003: Передавать явного получателя продолжения Review — Ожидает
  - Git Commit: [PENDING] fix: Передавать явного получателя продолжения Review
  - Reference: review-usability-0103-20261008 / T003 / implementation
  - Файлы: packages/workflow-kit/src/lib/plan-review.mjs, packages/workflow-kit/src/lib/command-help.mjs, packages/workflow-kit/src/lib/recovery.mjs, packages/workflow-kit/src/lib/actions.mjs, src/context-session.mjs, src/review-continuation.mjs, tests/plan-review.test.mjs, packages/workflow-kit/scripts/check-plan-review-fixture.mjs, docs/planning/review-usability-0103.md
- [TODO] T004: Сохранять позицию автора на каждый отзыв и итоговое согласие — Ожидает
  - Git Commit: [PENDING] fix: Сохранять позицию автора на каждый отзыв и итоговое согласие
  - Reference: review-usability-0103-20261008 / T004 / implementation
  - Файлы: packages/workflow-kit/src/lib/plan-review.mjs, packages/workflow-kit/src/lib/claude-review.mjs, packages/workflow-kit/src/lib/command-help.mjs, packages/workflow-kit/src/lib/recovery.mjs, packages/workflow-kit/src/cli.mjs, src/review-continuation.mjs, packages/workflow-kit/scripts/check-plan-review-fixture.mjs, tests/plan-review.test.mjs, docs/planning/review-usability-0103.md
- [TODO] T005: Проверить интеграцию и подготовить версии выпуска — Ожидает
  - Git Commit: [PENDING] fix: Проверить интеграцию и подготовить версии выпуска
  - Reference: review-usability-0103-20261008 / T005 / implementation
  - Файлы: package.json, package-lock.json, packages/workflow-kit/package.json, packages/workflow-kit/src/lib/common.mjs, packages/workflow-kit/src/lib/installer.mjs, .harness/workflow.json, tests/workflow-kit-upgrade.test.mjs, tests/workflow-kit-source.test.mjs, tests/electron-smoke.mjs, docs/planning/review-usability-0103.md
- [TODO] DOCS: Актуализация всех документов проекта — Ожидает
  - Git Commit: [PENDING] docs: описать исправления Review и восстановления страницы
  - Reference: review-usability-0103-20261008 / DOCS / implementation
  - Файлы: docs/planning/review-usability-0103.md, README.md, AGENTS.md, docs/architecture/OVERVIEW.md, docs/modules/plan-review.md, docs/modules/auto-plan.md, docs/modules/context-delivery.md, docs/modules/workspace-sidebar-ui.md, docs/modules/release.md, packages/workflow-kit/docs/modules/workflow-kit-package.md, packages/workflow-kit/README.md
- [TODO] T006: Собрать парный выпуск 0.6.103 — Ожидает
  - Git Commit: [PENDING] release: Собрать парный выпуск 0.6.103
  - Reference: review-usability-0103-20261008 / T006 / implementation
  - Файлы: release-manifest.json
- [TODO] T007: Установить готовый macOS выпуск — Ожидает
  - Git Commit: [PENDING] release: Установить готовый macOS выпуск
  - Reference: review-usability-0103-20261008 / T007 / implementation
  - Файлы: release-manifest.json
- [TODO] T008: Опубликовать выпуск на GitHub — Ожидает
  - Git Commit: [PENDING] release: Опубликовать выпуск на GitHub
  - Reference: review-usability-0103-20261008 / T008 / implementation
  - Файлы: release-manifest.json

## Context Pack For This Cycle

- docs/planning/review-usability-0103.md
- docs/modules/plan-review.md
- docs/modules/auto-plan.md
- docs/architecture/OVERVIEW.md

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
