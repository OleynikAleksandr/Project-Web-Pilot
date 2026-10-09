# Активный план — Project Web Pilot

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 1659,
  "project_id": "cf944136-d1fc-4bd5-9ea0-e46d1fe230e7",
  "project_name": "Project Web Pilot",
  "scope_id": "project-state-deletion-20261009",
  "execution_scope_status": "ACTIVE",
  "delivery_status": "IN_PROGRESS",
  "objective": "Полное удаление состояния проекта, безопасный повтор папки и выпуск 0.6.109",
  "acceptance_criteria": [
    "Полное удаление состояния проекта, безопасный повтор папки и выпуск 0.6.109"
  ],
  "approved_scope": {
    "functional_paths": [
      "src/project-state-cleanup.mjs",
      "src/workspace-deletion.mjs",
      "src/workspace-session.mjs",
      "src/main.mjs",
      "src/parallel-execution.mjs",
      "src/session-runtime.mjs",
      "tests/project-state-cleanup.test.mjs",
      "tests/workspace-deletion.test.mjs",
      "src/project-auto-plan.mjs",
      "src/project-session-auto-plan.mjs",
      "src/execution-projection.mjs",
      "tests/project-auto-plan.test.mjs",
      "tests/parallel-execution.test.mjs",
      "tests/parallel-execution-recovery.test.mjs",
      "tests/parallel-execution-ui.test.mjs",
      "tests/electron-smoke.mjs",
      "tests/parallel-execution-smoke-fixture.cjs",
      "package.json",
      "package-lock.json",
      "src/parallel-kit.mjs"
    ],
    "documentation_paths": [
      "docs/planning/project-state-deletion.md",
      "README.md",
      "docs/architecture/OVERVIEW.md",
      "docs/modules/project-archive.md",
      "docs/modules/parallel-execution.md",
      "docs/modules/auto-plan.md",
      "docs/modules/workspace-sessions.md",
      "docs/modules/session-runtime.md",
      "docs/modules/release.md",
      "docs/modules/parallel-execution-acceptance.md"
    ]
  },
  "baseline_commit": "3f30e31295a249326222c4c4869b99b825c6a12c",
  "current_task_id": null,
  "context_pack": {
    "documents": [
      {
        "path": "docs/architecture/OVERVIEW.md",
        "required": true,
        "revision": "WORKTREE"
      },
      {
        "path": "docs/planning/project-state-deletion.md",
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
        "scope_id": "project-state-deletion-20261009",
        "task_id": "T001",
        "role": "implementation"
      },
      "dependencies": [],
      "functional_paths": [
        "src/project-state-cleanup.mjs",
        "src/workspace-deletion.mjs",
        "src/workspace-session.mjs",
        "src/main.mjs",
        "src/parallel-execution.mjs",
        "src/session-runtime.mjs",
        "tests/project-state-cleanup.test.mjs",
        "tests/workspace-deletion.test.mjs"
      ],
      "documentation_paths": [
        "docs/planning/project-state-deletion.md"
      ],
      "verification_ids": [
        "unit-all"
      ],
      "id": "T001",
      "title": "Полное удаление локального состояния проекта",
      "why": "Полное удаление локального состояния проекта",
      "verification_kind": "code",
      "acceptance_criteria": [
        "Удаление очищает settings, checkpoints, копии, диагностику и связанные локальные назначения; чужие данные и облачный профиль сохранены",
        "Состояние удаления и восстановление включают очистку приложения; незавершённая работа не удаляется скрыто"
      ],
      "expected_commit_message": "feat: Полное удаление локального состояния проекта",
      "actual_files": [
        "src/main.mjs",
        "src/parallel-execution.mjs",
        "src/project-state-cleanup.mjs",
        "src/workspace-deletion.mjs",
        "src/workspace-session.mjs",
        "tests/project-state-cleanup.test.mjs",
        "tests/workspace-deletion.test.mjs"
      ]
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "project-state-deletion-20261009",
        "task_id": "T002",
        "role": "implementation"
      },
      "dependencies": [
        "T001"
      ],
      "functional_paths": [
        "src/project-auto-plan.mjs",
        "src/project-session-auto-plan.mjs",
        "src/parallel-execution.mjs",
        "src/execution-projection.mjs",
        "src/main.mjs",
        "tests/project-auto-plan.test.mjs",
        "tests/parallel-execution.test.mjs",
        "tests/parallel-execution-recovery.test.mjs",
        "tests/parallel-execution-ui.test.mjs",
        "src/parallel-kit.mjs",
        "src/project-state-cleanup.mjs",
        "tests/project-state-cleanup.test.mjs"
      ],
      "documentation_paths": [
        "docs/planning/project-state-deletion.md"
      ],
      "verification_ids": [
        "unit-all"
      ],
      "id": "T002",
      "title": "Изоляция пересозданного проекта и согласованная проекция",
      "why": "Изоляция пересозданного проекта и согласованная проекция",
      "verification_kind": "code",
      "acceptance_criteria": [
        "Уникальный project_id отделяет новый проект в той же папке и scope; старое разрешение не переносится",
        "Существующая подтверждённая работа и UNKNOWN не переотправляются; статусы назначения и плана согласованы"
      ],
      "expected_commit_message": "feat: Изоляция пересозданного проекта и согласованная проекция",
      "actual_files": [
        "src/execution-projection.mjs",
        "src/main.mjs",
        "src/parallel-execution.mjs",
        "src/parallel-kit.mjs",
        "src/project-auto-plan.mjs",
        "src/project-state-cleanup.mjs",
        "tests/parallel-execution.test.mjs",
        "tests/project-auto-plan.test.mjs",
        "tests/project-state-cleanup.test.mjs"
      ]
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "project-state-deletion-20261009",
        "task_id": "T003",
        "role": "implementation"
      },
      "dependencies": [
        "T002"
      ],
      "functional_paths": [
        "tests/electron-smoke.mjs",
        "tests/parallel-execution-smoke-fixture.cjs",
        "package.json",
        "package-lock.json",
        "src/main.mjs",
        "src/project-state-cleanup.mjs",
        "tests/project-state-cleanup.test.mjs"
      ],
      "documentation_paths": [
        "docs/planning/project-state-deletion.md",
        "README.md",
        "docs/architecture/OVERVIEW.md",
        "docs/modules/project-archive.md",
        "docs/modules/parallel-execution.md",
        "docs/modules/auto-plan.md",
        "docs/modules/workspace-sessions.md",
        "docs/modules/session-runtime.md",
        "docs/modules/release.md",
        "docs/modules/parallel-execution-acceptance.md"
      ],
      "verification_ids": [
        "unit-all",
        "electron-smoke",
        "codex-tools-live"
      ],
      "id": "T003",
      "title": "Сквозная регрессия удаления и подготовка 0.6.109",
      "why": "Сквозная регрессия удаления и подготовка 0.6.109",
      "verification_kind": "code",
      "acceptance_criteria": [
        "Реальные IPC fixture подтверждают полное удаление и чистый новый запуск с тем же именем и scope при сохранении соседнего проекта",
        "Версия 0.6.109 согласована; сборка не выполнялась до DOCS"
      ],
      "expected_commit_message": "feat: Сквозная регрессия удаления и подготовка 0.6.109",
      "actual_files": [
        "package-lock.json",
        "package.json",
        "src/main.mjs",
        "src/project-state-cleanup.mjs",
        "tests/electron-smoke.mjs",
        "tests/parallel-execution-smoke-fixture.cjs",
        "tests/project-state-cleanup.test.mjs"
      ]
    },
    {
      "id": "T007",
      "title": "Сериализовать очистку с фоновой записью настроек",
      "why": "Сериализовать очистку с фоновой записью настроек",
      "dependencies": [
        "T003"
      ],
      "functional_paths": [
        "src/main.mjs",
        "src/workspace-deletion.mjs",
        "src/project-state-cleanup.mjs",
        "tests/project-state-cleanup.test.mjs",
        "tests/workspace-deletion.test.mjs"
      ],
      "documentation_paths": [
        "docs/planning/project-state-deletion.md"
      ],
      "verification_ids": [
        "project-lifecycle",
        "electron-smoke"
      ],
      "verification_kind": "code",
      "acceptance_criteria": [
        "Удаление не пересекается с атомарной записью settings другого проекта; recovery сохраняется",
        "Подтверждённые worktree очищены вместе с пустой группой, произвольные пути журнала запрещены"
      ],
      "expected_commit_message": "feat: Сериализовать очистку с фоновой записью настроек",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "project-state-deletion-20261009",
        "task_id": "T007",
        "role": "implementation"
      },
      "actual_files": [
        "src/main.mjs",
        "src/project-state-cleanup.mjs",
        "src/workspace-deletion.mjs",
        "tests/project-state-cleanup.test.mjs",
        "tests/workspace-deletion.test.mjs"
      ]
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "project-state-deletion-20261009",
        "task_id": "DOCS",
        "role": "implementation"
      },
      "dependencies": [
        "T001",
        "T002",
        "T003",
        "T007"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/planning/project-state-deletion.md",
        "README.md",
        "docs/architecture/OVERVIEW.md",
        "docs/modules/project-archive.md",
        "docs/modules/parallel-execution.md",
        "docs/modules/auto-plan.md",
        "docs/modules/workspace-sessions.md",
        "docs/modules/session-runtime.md",
        "docs/modules/release.md",
        "docs/modules/parallel-execution-acceptance.md"
      ],
      "verification_ids": [],
      "id": "DOCS",
      "title": "Актуализация всех документов проекта",
      "why": "Сохранить актуальный контекст для следующего агента",
      "acceptance_criteria": [
        "Документы соответствуют результату"
      ],
      "expected_commit_message": "docs: актуализировать контекст проекта"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "project-state-deletion-20261009",
        "task_id": "T004",
        "role": "implementation"
      },
      "dependencies": [
        "T003",
        "DOCS"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/planning/project-state-deletion.md",
        "docs/modules/release.md"
      ],
      "verification_ids": [
        "paired-release"
      ],
      "id": "T004",
      "title": "Собрать парный выпуск 0.6.109",
      "why": "Собрать парный выпуск 0.6.109",
      "verification_kind": "package",
      "acceptance_criteria": [
        "После DOCS одна сборка создаёт шесть assets и manifest для macOS и Windows; identity корневого app сохранена"
      ],
      "expected_commit_message": "feat: Собрать парный выпуск 0.6.109"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "project-state-deletion-20261009",
        "task_id": "T005",
        "role": "implementation"
      },
      "dependencies": [
        "T004",
        "DOCS"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/planning/project-state-deletion.md",
        "docs/modules/release.md"
      ],
      "verification_ids": [
        "release-installed"
      ],
      "id": "T005",
      "title": "Установить и проверить выпуск 0.6.109",
      "why": "Установить и проверить выпуск 0.6.109",
      "verification_kind": "installed",
      "acceptance_criteria": [
        "Готовый staging установлен без пересборки, подпись, runtime и identity проверены"
      ],
      "expected_commit_message": "feat: Установить и проверить выпуск 0.6.109"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "project-state-deletion-20261009",
        "task_id": "T006",
        "role": "implementation"
      },
      "dependencies": [
        "T005",
        "DOCS"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/planning/project-state-deletion.md",
        "docs/modules/release.md"
      ],
      "verification_ids": [
        "github-release"
      ],
      "id": "T006",
      "title": "Опубликовать выпуск 0.6.109 и репозиторий",
      "why": "Опубликовать выпуск 0.6.109 и репозиторий",
      "verification_kind": "package",
      "acceptance_criteria": [
        "main, tag и шесть assets сверены после окончательного push; живая приёмка остаётся открытой"
      ],
      "expected_commit_message": "feat: Опубликовать выпуск 0.6.109 и репозиторий"
    }
  ],
  "blocked_reason": null,
  "user_decisions": [
    {
      "id": "350cc4aa-2c14-411f-9fee-029360297eeb",
      "text": "Пользователь поручил очистку двух удалённых тестовых проектов, закрытие предыдущего плана, исправления и новый выпуск на GitHub.",
      "recorded_at": "2026-10-09T18:05:11.997Z"
    }
  ]
}
```
<!-- workflow-state:end -->

## Состояние

Execution Scope Status: ACTIVE
Delivery Status: IN_PROGRESS
Scope: project-state-deletion-20261009
Current Task: нет
Revision: 1659

## Цель

Полное удаление состояния проекта, безопасный повтор папки и выпуск 0.6.109

## Критерии приёмки

- Полное удаление состояния проекта, безопасный повтор папки и выпуск 0.6.109

## Микрозадачи

- [DONE] T001: Полное удаление локального состояния проекта — Завершено
  - Git Commit: [DONE] feat: Полное удаление локального состояния проекта
  - Reference: project-state-deletion-20261009 / T001 / implementation
  - Файлы: src/project-state-cleanup.mjs, src/workspace-deletion.mjs, src/workspace-session.mjs, src/main.mjs, src/parallel-execution.mjs, src/session-runtime.mjs, tests/project-state-cleanup.test.mjs, tests/workspace-deletion.test.mjs, docs/planning/project-state-deletion.md
- [DONE] T002: Изоляция пересозданного проекта и согласованная проекция — Завершено
  - Git Commit: [DONE] feat: Изоляция пересозданного проекта и согласованная проекция
  - Reference: project-state-deletion-20261009 / T002 / implementation
  - Файлы: src/project-auto-plan.mjs, src/project-session-auto-plan.mjs, src/parallel-execution.mjs, src/execution-projection.mjs, src/main.mjs, tests/project-auto-plan.test.mjs, tests/parallel-execution.test.mjs, tests/parallel-execution-recovery.test.mjs, tests/parallel-execution-ui.test.mjs, src/parallel-kit.mjs, src/project-state-cleanup.mjs, tests/project-state-cleanup.test.mjs, docs/planning/project-state-deletion.md
- [DONE] T003: Сквозная регрессия удаления и подготовка 0.6.109 — Завершено
  - Git Commit: [DONE] feat: Сквозная регрессия удаления и подготовка 0.6.109
  - Reference: project-state-deletion-20261009 / T003 / implementation
  - Файлы: tests/electron-smoke.mjs, tests/parallel-execution-smoke-fixture.cjs, package.json, package-lock.json, src/main.mjs, src/project-state-cleanup.mjs, tests/project-state-cleanup.test.mjs, docs/planning/project-state-deletion.md, README.md, docs/architecture/OVERVIEW.md, docs/modules/project-archive.md, docs/modules/parallel-execution.md, docs/modules/auto-plan.md, docs/modules/workspace-sessions.md, docs/modules/session-runtime.md, docs/modules/release.md, docs/modules/parallel-execution-acceptance.md
- [DONE] T007: Сериализовать очистку с фоновой записью настроек — Завершено
  - Git Commit: [DONE] feat: Сериализовать очистку с фоновой записью настроек
  - Reference: project-state-deletion-20261009 / T007 / implementation
  - Файлы: src/main.mjs, src/workspace-deletion.mjs, src/project-state-cleanup.mjs, tests/project-state-cleanup.test.mjs, tests/workspace-deletion.test.mjs, docs/planning/project-state-deletion.md
- [TODO] DOCS: Актуализация всех документов проекта — Ожидает
  - Git Commit: [PENDING] docs: актуализировать контекст проекта
  - Reference: project-state-deletion-20261009 / DOCS / implementation
  - Файлы: docs/planning/project-state-deletion.md, README.md, docs/architecture/OVERVIEW.md, docs/modules/project-archive.md, docs/modules/parallel-execution.md, docs/modules/auto-plan.md, docs/modules/workspace-sessions.md, docs/modules/session-runtime.md, docs/modules/release.md, docs/modules/parallel-execution-acceptance.md
- [TODO] T004: Собрать парный выпуск 0.6.109 — Ожидает
  - Git Commit: [PENDING] feat: Собрать парный выпуск 0.6.109
  - Reference: project-state-deletion-20261009 / T004 / implementation
  - Файлы: docs/planning/project-state-deletion.md, docs/modules/release.md
- [TODO] T005: Установить и проверить выпуск 0.6.109 — Ожидает
  - Git Commit: [PENDING] feat: Установить и проверить выпуск 0.6.109
  - Reference: project-state-deletion-20261009 / T005 / implementation
  - Файлы: docs/planning/project-state-deletion.md, docs/modules/release.md
- [TODO] T006: Опубликовать выпуск 0.6.109 и репозиторий — Ожидает
  - Git Commit: [PENDING] feat: Опубликовать выпуск 0.6.109 и репозиторий
  - Reference: project-state-deletion-20261009 / T006 / implementation
  - Файлы: docs/planning/project-state-deletion.md, docs/modules/release.md

## Context Pack For This Cycle

- docs/architecture/OVERVIEW.md
- docs/planning/project-state-deletion.md

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
