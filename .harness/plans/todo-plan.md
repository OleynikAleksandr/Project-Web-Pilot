# Активный план — Project Web Pilot

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 132,
  "project_id": "cf944136-d1fc-4bd5-9ea0-e46d1fe230e7",
  "project_name": "Project Web Pilot",
  "scope_id": "web-pilot-plan-ui-003",
  "execution_scope_status": "ACTIVE",
  "delivery_status": "IN_PROGRESS",
  "objective": "Сделать план самостоятельным пользовательским блоком сайдбара: показывать понятный статус текущего scope и полный список микрозадач с признаками выполнено, выполняется и ожидает; убрать из пользовательского интерфейса технический plan_revision и выпустить обновлённую macOS-сборку 0.6.0.",
  "acceptance_criteria": [
    "Блок План является самостоятельной карточкой сайдбара и не показывает plan_revision.",
    "Каждая микрозадача текущего scope отображается по имени и имеет понятный статус: ✓ выполнена, ● выполняется, ○ ожидает.",
    "Для активной работы показывается прогресс X из N выполнено; после завершения всех задач явно показывается ожидание приёмки пользователя.",
    "После архивирования scope интерфейс отличает завершённый scope от проекта, в котором план ещё никогда не создавался.",
    "Обновлённая macOS arm64 сборка версии 0.6.0 проходит Node suite и Electron smoke и готова к пользовательской проверке."
  ],
  "approved_scope": {
    "functional_paths": [
      "src/workspace-session.mjs",
      "tests/workspace-session.test.mjs",
      "src/ui/index.html",
      "src/ui/sidebar.mjs",
      "tests/electron-smoke.mjs",
      "package.json",
      "package-lock.json"
    ],
    "documentation_paths": [
      "docs/PRODUCT.md",
      "docs/DECISIONS.md",
      "docs/architecture/ARCHITECTURE.md",
      "docs/VERIFICATION.md",
      "docs/WORKFLOW_START.md",
      "README.md"
    ],
    "max_functional_files_per_task": 3
  },
  "baseline_commit": "3f8068da653bc8a89c4982bc3f55fa417d70e057",
  "current_task_id": null,
  "context_pack": {
    "documents": [
      {
        "path": "docs/PRODUCT.md",
        "required": true,
        "revision": "WORKTREE"
      },
      {
        "path": "docs/architecture/ARCHITECTURE.md",
        "required": true,
        "revision": "WORKTREE"
      }
    ],
    "include_last_completed_task": true,
    "dependency_task_ids": []
  },
  "tasks": [
    {
      "dependencies": [],
      "functional_paths": [],
      "documentation_paths": [
        "docs/PRODUCT.md",
        "docs/DECISIONS.md"
      ],
      "verification_ids": [],
      "id": "T001",
      "title": "Зафиксировать пользовательскую семантику блока План",
      "why": "Не смешивать внутренние поля Workflow Kit с тем, что нужно видеть пользователю",
      "acceptance_criteria": [
        "Документы фиксируют статусы ✓/●/○ и формулировку ожидания приёмки",
        "plan_revision явно отнесён к внутренним данным и исключён из пользовательского блока"
      ],
      "expected_commit_message": "docs: определить пользовательский блок плана",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "web-pilot-plan-ui-003",
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
        "tests/workspace-session.test.mjs"
      ],
      "documentation_paths": [
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "workspace",
        "suite"
      ],
      "id": "T002",
      "title": "Экспортировать пользовательское состояние плана",
      "why": "Sidebar должен получать полный список задач и lifecycle scope из канонического todo-plan без разбора Markdown в renderer",
      "acceptance_criteria": [
        "readWorkspace возвращает безопасный task summary: id, title и пользовательский статус для каждой задачи",
        "Возвращаются признаки active/blocked/ready-for-acceptance/archived-or-never-started без передачи технического plan_revision как UI-поля",
        "Тесты покрывают active, current task, ready for acceptance и archived scope"
      ],
      "expected_commit_message": "feat: публиковать состояние плана для интерфейса",
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "web-pilot-plan-ui-003",
        "task_id": "T002",
        "role": "implementation"
      }
    },
    {
      "dependencies": [
        "T002"
      ],
      "functional_paths": [
        "src/ui/index.html",
        "src/ui/sidebar.mjs",
        "tests/electron-smoke.mjs"
      ],
      "documentation_paths": [
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "suite",
        "electron-smoke"
      ],
      "id": "T003",
      "title": "Сделать самостоятельную карточку План",
      "why": "Пользователь должен с одного взгляда видеть что запланировано, что выполнено и что делается сейчас",
      "acceptance_criteria": [
        "Sidebar показывает отдельный блок План со статусной строкой и полным списком задач",
        "DONE отображается ✓, IN_PROGRESS — ●, TODO — ○, текущая задача визуально выделена",
        "READY_FOR_ACCEPTANCE показывает Все задачи выполнены · ожидается ваша приёмка",
        "Revision не отображается нигде в пользовательской карточке плана",
        "Electron smoke проверяет состояния и названия задач"
      ],
      "expected_commit_message": "feat: показать микрозадачи в блоке плана",
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "web-pilot-plan-ui-003",
        "task_id": "T003",
        "role": "implementation"
      }
    },
    {
      "dependencies": [
        "T003"
      ],
      "functional_paths": [
        "package.json",
        "package-lock.json"
      ],
      "documentation_paths": [
        "README.md",
        "docs/VERIFICATION.md",
        "docs/WORKFLOW_START.md"
      ],
      "verification_ids": [
        "suite",
        "electron-smoke"
      ],
      "id": "T004",
      "title": "Выпустить Project Web Pilot 0.6.0",
      "why": "Зафиксировать пользовательское изменение как отдельный проверяемый релиз",
      "acceptance_criteria": [
        "Версия приложения и команда сборки обновлены до 0.6.0",
        "README описывает новый блок План без plan_revision",
        "Полная suite и Electron smoke проходят, финальная arm64 .app пересобрана"
      ],
      "expected_commit_message": "release: собрать Project Web Pilot 0.6.0",
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "web-pilot-plan-ui-003",
        "task_id": "T004",
        "role": "implementation"
      }
    }
  ],
  "blocked_reason": null,
  "user_decisions": [
    {
      "id": "5883b46a-4da8-4878-b699-00e08c6201cf",
      "text": "12.09.2026 пользователь полностью согласовал самостоятельный блок План со списком микрозадач и статусами и поручил составить новый план и выполнить его в новом релизе.",
      "recorded_at": "2026-09-12T09:14:51.993Z"
    }
  ]
}
```
<!-- workflow-state:end -->

## Состояние

Execution Scope Status: ACTIVE
Delivery Status: IN_PROGRESS
Scope: web-pilot-plan-ui-003
Current Task: нет
Revision: 132

## Цель

Сделать план самостоятельным пользовательским блоком сайдбара: показывать понятный статус текущего scope и полный список микрозадач с признаками выполнено, выполняется и ожидает; убрать из пользовательского интерфейса технический plan_revision и выпустить обновлённую macOS-сборку 0.6.0.

## Критерии приёмки

- Блок План является самостоятельной карточкой сайдбара и не показывает plan_revision.
- Каждая микрозадача текущего scope отображается по имени и имеет понятный статус: ✓ выполнена, ● выполняется, ○ ожидает.
- Для активной работы показывается прогресс X из N выполнено; после завершения всех задач явно показывается ожидание приёмки пользователя.
- После архивирования scope интерфейс отличает завершённый scope от проекта, в котором план ещё никогда не создавался.
- Обновлённая macOS arm64 сборка версии 0.6.0 проходит Node suite и Electron smoke и готова к пользовательской проверке.

## Микрозадачи

- [DONE] T001: Зафиксировать пользовательскую семантику блока План — Завершено
  - Git Commit: [DONE] docs: определить пользовательский блок плана
  - Reference: web-pilot-plan-ui-003 / T001 / implementation
  - Файлы: docs/PRODUCT.md, docs/DECISIONS.md
- [TODO] T002: Экспортировать пользовательское состояние плана — Ожидает
  - Git Commit: [PENDING] feat: публиковать состояние плана для интерфейса
  - Reference: web-pilot-plan-ui-003 / T002 / implementation
  - Файлы: src/workspace-session.mjs, tests/workspace-session.test.mjs, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md
- [TODO] T003: Сделать самостоятельную карточку План — Ожидает
  - Git Commit: [PENDING] feat: показать микрозадачи в блоке плана
  - Reference: web-pilot-plan-ui-003 / T003 / implementation
  - Файлы: src/ui/index.html, src/ui/sidebar.mjs, tests/electron-smoke.mjs, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md
- [TODO] T004: Выпустить Project Web Pilot 0.6.0 — Ожидает
  - Git Commit: [PENDING] release: собрать Project Web Pilot 0.6.0
  - Reference: web-pilot-plan-ui-003 / T004 / implementation
  - Файлы: package.json, package-lock.json, README.md, docs/VERIFICATION.md, docs/WORKFLOW_START.md

## Context Pack For This Cycle

- docs/PRODUCT.md
- docs/architecture/ARCHITECTURE.md

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
