# Активный план — Project Web Pilot

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 146,
  "project_id": "cf944136-d1fc-4bd5-9ea0-e46d1fe230e7",
  "project_name": "Project Web Pilot",
  "scope_id": "web-pilot-plan-ui-003",
  "execution_scope_status": "ACTIVE",
  "delivery_status": "READY_FOR_ACCEPTANCE",
  "objective": "Сделать план самостоятельным пользовательским блоком сайдбара: показывать понятный статус текущего scope и полный список микрозадач с признаками выполнено, выполняется и ожидает; убрать из пользовательского интерфейса технический plan_revision и выпустить обновлённую macOS-сборку 0.6.0. Кнопка «Принять» в карточке плана отправляет явную пользовательскую команду на штатное закрытие текущего scope и переход в NONE.",
  "acceptance_criteria": [
    "Блок План является самостоятельной карточкой сайдбара и не показывает plan_revision.",
    "Каждая микрозадача текущего scope отображается по имени и имеет понятный статус: ✓ выполнена, ● выполняется, ○ ожидает.",
    "Для активной работы показывается прогресс X из N выполнено; после завершения всех задач явно показывается ожидание приёмки пользователя.",
    "После архивирования scope интерфейс отличает завершённый scope от проекта, в котором план ещё никогда не создавался.",
    "Обновлённая macOS arm64 сборка версии 0.6.0 проходит Node suite и Electron smoke и готова к пользовательской проверке.",
    "В карточке План справа есть кнопка «Принять», активная только при ожидании приёмки; она безопасно отправляет явную пользовательскую команду закрыть scope и оставить проект в NONE."
  ],
  "approved_scope": {
    "functional_paths": [
      "src/workspace-session.mjs",
      "tests/workspace-session.test.mjs",
      "src/ui/index.html",
      "src/ui/sidebar.mjs",
      "tests/electron-smoke.mjs",
      "package.json",
      "package-lock.json",
      "src/chatgpt-composer.mjs",
      "src/preload.cjs",
      "src/main.mjs",
      "tests/chatgpt-composer.test.mjs"
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
      "implementation_status": "DONE",
      "commit_status": "DONE",
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
      "implementation_status": "DONE",
      "commit_status": "DONE",
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
        "package-lock.json",
        "src/ui/index.html"
      ],
      "documentation_paths": [
        "README.md",
        "docs/VERIFICATION.md",
        "docs/WORKFLOW_START.md",
        "docs/architecture/ARCHITECTURE.md"
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
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "web-pilot-plan-ui-003",
        "task_id": "T004",
        "role": "implementation"
      }
    },
    {
      "id": "T005",
      "title": "Добавить безопасную отправку пользовательской команды приёмки",
      "why": "Кнопка должна отправлять обычное пользовательское сообщение через видимый composer без служебного marker в тексте",
      "dependencies": [
        "T004"
      ],
      "functional_paths": [
        "src/chatgpt-composer.mjs",
        "tests/chatgpt-composer.test.mjs"
      ],
      "documentation_paths": [
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md"
      ],
      "acceptance_criteria": [
        "Composer отправляет обычный текст только при пустом доступном поле и отсутствии генерации",
        "Успех подтверждается увеличением числа пользовательских сообщений после click, без request-id в тексте",
        "Черновик, генерация, недоступный Send и смена чата не приводят к скрытой повторной отправке"
      ],
      "verification_ids": [
        "composer",
        "suite"
      ],
      "expected_commit_message": "feat: безопасно отправлять команду приёмки плана",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "web-pilot-plan-ui-003",
        "task_id": "T005",
        "role": "implementation"
      }
    },
    {
      "id": "T006",
      "title": "Добавить кнопку Принять в карточку плана",
      "why": "Пользователь должен принимать полностью выполненный scope одним явным действием без ручного набора текста",
      "dependencies": [
        "T005"
      ],
      "functional_paths": [
        "src/main.mjs",
        "src/preload.cjs",
        "src/ui/index.html"
      ],
      "documentation_paths": [
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md"
      ],
      "acceptance_criteria": [
        "Кнопка находится справа от заголовка План и активна только при awaiting-acceptance",
        "Main повторно проверяет выбранный workspace и фактический awaiting-acceptance перед отправкой",
        "Команда в чат явно просит архивировать текущий scope и оставить Workflow Kit в NONE; при черновике/ответе пользователь получает понятный отказ"
      ],
      "verification_ids": [
        "syntax",
        "suite"
      ],
      "expected_commit_message": "feat: добавить приёмку плана из sidebar",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "web-pilot-plan-ui-003",
        "task_id": "T006",
        "role": "implementation"
      }
    },
    {
      "id": "T007",
      "title": "Проверить кнопку приёмки и пересобрать 0.6.0",
      "why": "Закрепить реальный путь кнопка → ChatGPT message и подготовить обновлённую сборку",
      "dependencies": [
        "T006"
      ],
      "functional_paths": [
        "src/ui/sidebar.mjs",
        "tests/electron-smoke.mjs"
      ],
      "documentation_paths": [
        "README.md",
        "docs/VERIFICATION.md",
        "docs/WORKFLOW_START.md"
      ],
      "acceptance_criteria": [
        "Smoke проверяет disabled вне awaiting-acceptance, активную кнопку в ready state и точный текст нового user message",
        "После отправки кнопка не позволяет повторить команду до смены lifecycle",
        "Финальная 0.6.0 arm64 сборка пересобрана, suite/smoke проходят, репозиторий чистый"
      ],
      "verification_ids": [
        "suite",
        "electron-smoke"
      ],
      "expected_commit_message": "test: проверить приёмку плана из sidebar",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "web-pilot-plan-ui-003",
        "task_id": "T007",
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
    },
    {
      "id": "plan-accept-button-20260912",
      "text": "12.09.2026 пользователь поручил добавить справа в карточке План кнопку «Принять», активную при ожидании приёмки. Кнопка должна отправлять обычное пользовательское сообщение с явной командой закрыть текущий scope и оставить проект в пустом состоянии NONE для следующего плана.",
      "recorded_at": "2026-09-12T09:46:44Z"
    }
  ]
}
```
<!-- workflow-state:end -->

## Состояние

Execution Scope Status: ACTIVE
Delivery Status: READY_FOR_ACCEPTANCE
Scope: web-pilot-plan-ui-003
Current Task: нет
Revision: 146

## Цель

Сделать план самостоятельным пользовательским блоком сайдбара: показывать понятный статус текущего scope и полный список микрозадач с признаками выполнено, выполняется и ожидает; убрать из пользовательского интерфейса технический plan_revision и выпустить обновлённую macOS-сборку 0.6.0. Кнопка «Принять» в карточке плана отправляет явную пользовательскую команду на штатное закрытие текущего scope и переход в NONE.

## Критерии приёмки

- Блок План является самостоятельной карточкой сайдбара и не показывает plan_revision.
- Каждая микрозадача текущего scope отображается по имени и имеет понятный статус: ✓ выполнена, ● выполняется, ○ ожидает.
- Для активной работы показывается прогресс X из N выполнено; после завершения всех задач явно показывается ожидание приёмки пользователя.
- После архивирования scope интерфейс отличает завершённый scope от проекта, в котором план ещё никогда не создавался.
- Обновлённая macOS arm64 сборка версии 0.6.0 проходит Node suite и Electron smoke и готова к пользовательской проверке.
- В карточке План справа есть кнопка «Принять», активная только при ожидании приёмки; она безопасно отправляет явную пользовательскую команду закрыть scope и оставить проект в NONE.

## Микрозадачи

- [DONE] T001: Зафиксировать пользовательскую семантику блока План — Завершено
  - Git Commit: [DONE] docs: определить пользовательский блок плана
  - Reference: web-pilot-plan-ui-003 / T001 / implementation
  - Файлы: docs/PRODUCT.md, docs/DECISIONS.md
- [DONE] T002: Экспортировать пользовательское состояние плана — Завершено
  - Git Commit: [DONE] feat: публиковать состояние плана для интерфейса
  - Reference: web-pilot-plan-ui-003 / T002 / implementation
  - Файлы: src/workspace-session.mjs, tests/workspace-session.test.mjs, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md
- [DONE] T003: Сделать самостоятельную карточку План — Завершено
  - Git Commit: [DONE] feat: показать микрозадачи в блоке плана
  - Reference: web-pilot-plan-ui-003 / T003 / implementation
  - Файлы: src/ui/index.html, src/ui/sidebar.mjs, tests/electron-smoke.mjs, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md
- [DONE] T004: Выпустить Project Web Pilot 0.6.0 — Завершено
  - Git Commit: [DONE] release: собрать Project Web Pilot 0.6.0
  - Reference: web-pilot-plan-ui-003 / T004 / implementation
  - Файлы: package.json, package-lock.json, src/ui/index.html, README.md, docs/VERIFICATION.md, docs/WORKFLOW_START.md, docs/architecture/ARCHITECTURE.md
- [DONE] T005: Добавить безопасную отправку пользовательской команды приёмки — Завершено
  - Git Commit: [DONE] feat: безопасно отправлять команду приёмки плана
  - Reference: web-pilot-plan-ui-003 / T005 / implementation
  - Файлы: src/chatgpt-composer.mjs, tests/chatgpt-composer.test.mjs, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md
- [DONE] T006: Добавить кнопку Принять в карточку плана — Завершено
  - Git Commit: [DONE] feat: добавить приёмку плана из sidebar
  - Reference: web-pilot-plan-ui-003 / T006 / implementation
  - Файлы: src/main.mjs, src/preload.cjs, src/ui/index.html, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md
- [DONE] T007: Проверить кнопку приёмки и пересобрать 0.6.0 — Завершено
  - Git Commit: [DONE] test: проверить приёмку плана из sidebar
  - Reference: web-pilot-plan-ui-003 / T007 / implementation
  - Файлы: src/ui/sidebar.mjs, tests/electron-smoke.mjs, README.md, docs/VERIFICATION.md, docs/WORKFLOW_START.md

## Context Pack For This Cycle

- docs/PRODUCT.md
- docs/architecture/ARCHITECTURE.md

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
