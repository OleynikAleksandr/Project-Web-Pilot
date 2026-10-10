# Активный план — Project Web Pilot

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 1675,
  "project_id": "cf944136-d1fc-4bd5-9ea0-e46d1fe230e7",
  "project_name": "Project Web Pilot",
  "scope_id": "reliable-completion-sidebar-20261010",
  "execution_scope_status": "ACTIVE",
  "delivery_status": "IN_PROGRESS",
  "objective": "Исправить автоматический финал, учёт команд и ownership исполнителей, упростить сайдбар и выпустить 0.6.110",
  "acceptance_criteria": [
    "Завершение exec/patch отражается независимо от write_stdin; ошибки и legacy сохраняют UNKNOWN с ID и причиной",
    "read_only реально запрещает запись и допускает loopback сервер; обычные операции не получают исключение; девять MCP tools сохранены",
    "Готовый source при защищённом сервере допускает интеграцию; dirty/transaction/UNKNOWN остаются заблокированы",
    "Все потребители включая удаление используют одну проекцию; completed не блокирует, журнал итогов ограничен 100; живой сервер блокирует удаление",
    "Доказанно read_only UNKNOWN не блокирует интеграцию; write UNKNOWN требует явной scoped диагностики и пользовательского признания неизвестности, без ложного exit=0/снятия защиты удаления",
    "Долговечное намерение создаётся при последнем READY до общего DONE; автоматический OFF не теряет поручение",
    "Правильный project/scope/session, busy/draft/Stop/явный OFF и UNKNOWN сохранены; restart/повтор события не дублируют Send",
    "Нет гонки merge/correction/finalization; итог основного ответа наблюдается отдельно от Send, main проверки обязательны",
    "parentProjectId подтверждается назначением; legacy мигрируется только с доказательствами",
    "Удаление родителя каскадно убирает подтверждённые дочерние записи/worktree/архив/runtime после restart",
    "Активность, чужая identity/одноимённый сосед, повторная папка и подмена worktree защищены; облачные чаты сохранены",
    "Меню поиска проектов, выбранный проект/последняя сессия и исполнители соответствуют открытому чату; фон не останавливается",
    "ID/название/способ/статус плана различены; версия и увеличенная Settings наверху; нижний блок удалён, сведения доступны в Settings",
    "Нет повторной доставки recovery в начатый чат; реальные ошибки видны у сессии, safe retry до Send и UNKNOWN сохраняются",
    "312px, обе темы, keyboard/focus/aria и быстрые переключения покрыты fixtures",
    "Состояния финальной передачи видны в карточке основного проекта",
    "Полный временный Git/Electron цикл с сервером завершает main и один финальный ответ без пользовательского толчка; restart/сбои/два проекта проверены",
    "Правила Kit выбирают декомпозицию по результату/зависимостям/контрактам/риску без нормативов файлов/строк; текущая работа sequential",
    "Версии 0.6.110 и Kit 1.7.2, lockfiles и evidence согласованы; Kit установлен штатно",
    "Kit 1.7.2 поддерживает upgradeFrom 1.7.1 и установлен штатно с проверкой миграции",
    "Действующие документы и README соответствуют результату; спецификация перенесена в контракты без архивных копий",
    "Пользовательский повторный тест и ограничения native Windows/живого ChatGPT описаны; постоянное правило полного выпуска закреплено",
    "Одна сборка macOS arm64/Windows x64 выполняется проверкой при commit; подписанный постоянный app и шесть файлов поставки сверены",
    "sourceCommit содержит документы и исходники, identity сохранена",
    "Готовый staging установлен без пересборки, identity/signature сохранены; работающий процесс не перезапущен",
    "Шесть assets, тег на sourceCommit и main сверены; финальный push выполнен без пересборки",
    "Пользователю версия, URL, проверки, ограничения и шаги приёмки; архивирование без пользователя не выполнено"
  ],
  "approved_scope": {
    "functional_paths": [
      "tools/codex-app-server-mcp/server.py",
      "tools/codex-app-server-mcp/app_server_client.py",
      "src/parallel-kit.mjs",
      "src/execution-projection.mjs",
      "tests/codex-app-server-mcp.test.mjs",
      "tests/codex-app-server-tools.test.mjs",
      "tests/parallel-kit.test.mjs",
      "src/main.mjs",
      "src/executor-session.mjs",
      "src/command-activity.mjs",
      "src/preload.cjs",
      "src/ui/sidebar.mjs",
      "src/ui/index.html",
      "tests/command-activity.test.mjs",
      "src/parallel-execution.mjs",
      "src/project-auto-plan.mjs",
      "src/automation-send-state.mjs",
      "tests/parallel-execution.test.mjs",
      "tests/parallel-execution-recovery.test.mjs",
      "tests/automation-send-state.test.mjs",
      "tests/project-auto-plan.test.mjs",
      "src/workspace-session.mjs",
      "src/workspace-deletion.mjs",
      "src/project-state-cleanup.mjs",
      "tests/workspace-session.test.mjs",
      "tests/workspace-deletion.test.mjs",
      "tests/project-state-cleanup.test.mjs",
      "src/ui/settings-panel.mjs",
      "src/context-session.mjs",
      "src/session-plans.mjs",
      "tests/sidebar.test.mjs",
      "tests/context-session.test.mjs",
      "tests/electron-smoke.mjs",
      "tests/settings-chatgpt-channel.test.mjs",
      "tests/parallel-execution-smoke-fixture.cjs",
      "packages/workflow-kit/src",
      "packages/workflow-kit/package.json",
      "package.json",
      "package-lock.json",
      "scripts/check-codex-tools.mjs",
      "scripts/check-installed-release.mjs",
      "tests/workflow-kit-source.test.mjs",
      "release-manifest.json",
      "packages/workflow-kit/src/lib/common.mjs",
      "packages/workflow-kit/src/lib/installer.mjs"
    ],
    "documentation_paths": [
      "docs/planning/reliable-completion-sidebar.md",
      "AGENTS.md",
      "README.md",
      "docs/architecture/OVERVIEW.md",
      "docs/modules/parallel-execution.md",
      "docs/modules/parallel-execution-acceptance.md",
      "docs/modules/auto-plan.md",
      "docs/modules/auto-plan-send.md",
      "docs/modules/plan-view.md",
      "docs/modules/workspace-sidebar-ui.md",
      "docs/modules/workspace-sessions.md",
      "docs/modules/context-delivery.md",
      "docs/modules/project-archive.md",
      "docs/modules/codex-app-server-executor.md",
      "docs/modules/release.md",
      "packages/workflow-kit/docs/modules/workflow-kit-package.md",
      "docs/planning/reliable-completion-validation.md",
      "docs/modules/first-run-onboarding.md",
      "packages/workflow-kit/docs/modules/parallel-assignments.md",
      "docs/modules/runtime-lifecycle.md",
      "packages/workflow-kit/src/templates/PLAN.md",
      "packages/workflow-kit/src/templates/PROTOTYPE.md",
      "packages/workflow-kit/src/WORKFLOW.md"
    ]
  },
  "baseline_commit": "c3da7b29a5e29945637f1f54f70071269605f6a6",
  "current_task_id": null,
  "context_pack": {
    "documents": [
      {
        "path": "docs/planning/reliable-completion-sidebar.md",
        "required": true,
        "revision": "WORKTREE"
      },
      {
        "path": "docs/planning/reliable-completion-validation.md",
        "required": true,
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
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "reliable-completion-sidebar-20261010",
        "task_id": "T001",
        "role": "implementation"
      },
      "dependencies": [],
      "functional_paths": [
        "tools/codex-app-server-mcp/server.py",
        "tools/codex-app-server-mcp/app_server_client.py",
        "src/parallel-kit.mjs",
        "src/execution-projection.mjs",
        "tests/codex-app-server-mcp.test.mjs",
        "tests/codex-app-server-tools.test.mjs",
        "tests/parallel-kit.test.mjs",
        "src/main.mjs",
        "src/executor-session.mjs",
        "src/command-activity.mjs",
        "src/preload.cjs",
        "src/ui/sidebar.mjs",
        "src/ui/index.html",
        "tests/command-activity.test.mjs"
      ],
      "documentation_paths": [],
      "verification_ids": [
        "unit-all",
        "executor-channel"
      ],
      "id": "T001",
      "title": "Подтверждённый lifecycle команд и защищённый сервер результата",
      "why": "Подтверждённый lifecycle команд и защищённый сервер результата",
      "acceptance_criteria": [
        "Завершение exec/patch отражается независимо от write_stdin; ошибки и legacy сохраняют UNKNOWN с ID и причиной",
        "read_only реально запрещает запись и допускает loopback сервер; обычные операции не получают исключение; девять MCP tools сохранены",
        "Готовый source при защищённом сервере допускает интеграцию; dirty/transaction/UNKNOWN остаются заблокированы",
        "Все потребители включая удаление используют одну проекцию; completed не блокирует, журнал итогов ограничен 100; живой сервер блокирует удаление",
        "Доказанно read_only UNKNOWN не блокирует интеграцию; write UNKNOWN требует явной scoped диагностики и пользовательского признания неизвестности, без ложного exit=0/снятия защиты удаления"
      ],
      "expected_commit_message": "fix: Подтверждённый lifecycle команд и защищённый сервер результата",
      "parallel_safe": false
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "reliable-completion-sidebar-20261010",
        "task_id": "T002",
        "role": "implementation"
      },
      "dependencies": [
        "T001"
      ],
      "functional_paths": [
        "src/parallel-execution.mjs",
        "src/main.mjs",
        "src/project-auto-plan.mjs",
        "src/automation-send-state.mjs",
        "src/executor-session.mjs",
        "tests/parallel-execution.test.mjs",
        "tests/parallel-execution-recovery.test.mjs",
        "tests/automation-send-state.test.mjs",
        "tests/project-auto-plan.test.mjs"
      ],
      "documentation_paths": [],
      "verification_ids": [
        "unit-all"
      ],
      "id": "T002",
      "title": "Автоматическая финальная передача основному агенту",
      "why": "Автоматическая финальная передача основному агенту",
      "acceptance_criteria": [
        "Долговечное намерение создаётся при последнем READY до общего DONE; автоматический OFF не теряет поручение",
        "Правильный project/scope/session, busy/draft/Stop/явный OFF и UNKNOWN сохранены; restart/повтор события не дублируют Send",
        "Нет гонки merge/correction/finalization; итог основного ответа наблюдается отдельно от Send, main проверки обязательны"
      ],
      "expected_commit_message": "fix: Автоматическая финальная передача основному агенту",
      "parallel_safe": false
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "reliable-completion-sidebar-20261010",
        "task_id": "T003",
        "role": "implementation"
      },
      "dependencies": [],
      "functional_paths": [
        "src/workspace-session.mjs",
        "src/workspace-deletion.mjs",
        "src/project-state-cleanup.mjs",
        "src/execution-projection.mjs",
        "src/main.mjs",
        "tests/workspace-session.test.mjs",
        "tests/workspace-deletion.test.mjs",
        "tests/project-state-cleanup.test.mjs"
      ],
      "documentation_paths": [],
      "verification_ids": [
        "unit-all",
        "project-lifecycle"
      ],
      "id": "T003",
      "title": "Связь исполнителей с родителем и каскадное удаление",
      "why": "Связь исполнителей с родителем и каскадное удаление",
      "acceptance_criteria": [
        "parentProjectId подтверждается назначением; legacy мигрируется только с доказательствами",
        "Удаление родителя каскадно убирает подтверждённые дочерние записи/worktree/архив/runtime после restart",
        "Активность, чужая identity/одноимённый сосед, повторная папка и подмена worktree защищены; облачные чаты сохранены"
      ],
      "expected_commit_message": "fix: Связь исполнителей с родителем и каскадное удаление",
      "parallel_safe": false
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "reliable-completion-sidebar-20261010",
        "task_id": "T004",
        "role": "implementation"
      },
      "dependencies": [
        "T003",
        "T002"
      ],
      "functional_paths": [
        "src/ui/index.html",
        "src/ui/sidebar.mjs",
        "src/ui/settings-panel.mjs",
        "src/context-session.mjs",
        "src/main.mjs",
        "src/workspace-session.mjs",
        "src/session-plans.mjs",
        "src/execution-projection.mjs",
        "tests/sidebar.test.mjs",
        "tests/context-session.test.mjs",
        "tests/electron-smoke.mjs",
        "tests/settings-chatgpt-channel.test.mjs"
      ],
      "documentation_paths": [],
      "verification_ids": [
        "unit-all",
        "electron-smoke"
      ],
      "id": "T004",
      "title": "Один выбранный проект и обновлённый сайдбар",
      "why": "Один выбранный проект и обновлённый сайдбар",
      "acceptance_criteria": [
        "Меню поиска проектов, выбранный проект/последняя сессия и исполнители соответствуют открытому чату; фон не останавливается",
        "ID/название/способ/статус плана различены; версия и увеличенная Settings наверху; нижний блок удалён, сведения доступны в Settings",
        "Нет повторной доставки recovery в начатый чат; реальные ошибки видны у сессии, safe retry до Send и UNKNOWN сохраняются",
        "312px, обе темы, keyboard/focus/aria и быстрые переключения покрыты fixtures",
        "Состояния финальной передачи видны в карточке основного проекта"
      ],
      "expected_commit_message": "fix: Один выбранный проект и обновлённый сайдбар",
      "parallel_safe": false
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "reliable-completion-sidebar-20261010",
        "task_id": "T005",
        "role": "implementation"
      },
      "dependencies": [
        "T001",
        "T002",
        "T003",
        "T004"
      ],
      "functional_paths": [
        "tests/parallel-execution-smoke-fixture.cjs",
        "tests/electron-smoke.mjs",
        "packages/workflow-kit/src",
        "packages/workflow-kit/package.json",
        "package.json",
        "package-lock.json",
        "scripts/check-codex-tools.mjs",
        "scripts/check-installed-release.mjs",
        "tests/workflow-kit-source.test.mjs",
        "packages/workflow-kit/src/lib/common.mjs",
        "packages/workflow-kit/src/lib/installer.mjs"
      ],
      "documentation_paths": [
        "packages/workflow-kit/src/templates/PLAN.md",
        "packages/workflow-kit/src/templates/PROTOTYPE.md",
        "packages/workflow-kit/src/WORKFLOW.md"
      ],
      "verification_ids": [
        "unit-all",
        "electron-smoke",
        "codex-tools-live",
        "kit-check"
      ],
      "id": "T005",
      "title": "Сквозная регрессия и подготовка выпуска 0.6.110",
      "why": "Сквозная регрессия и подготовка выпуска 0.6.110",
      "acceptance_criteria": [
        "Полный временный Git/Electron цикл с сервером завершает main и один финальный ответ без пользовательского толчка; restart/сбои/два проекта проверены",
        "Правила Kit выбирают декомпозицию по результату/зависимостям/контрактам/риску без нормативов файлов/строк; текущая работа sequential",
        "Версии 0.6.110 и Kit 1.7.2, lockfiles и evidence согласованы; Kit установлен штатно",
        "Kit 1.7.2 поддерживает upgradeFrom 1.7.1 и установлен штатно с проверкой миграции"
      ],
      "expected_commit_message": "fix: Сквозная регрессия и подготовка выпуска 0.6.110",
      "parallel_safe": false
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "reliable-completion-sidebar-20261010",
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
        "AGENTS.md",
        "README.md",
        "docs/architecture/OVERVIEW.md",
        "docs/modules/parallel-execution.md",
        "docs/modules/parallel-execution-acceptance.md",
        "docs/modules/auto-plan.md",
        "docs/modules/auto-plan-send.md",
        "docs/modules/plan-view.md",
        "docs/modules/workspace-sidebar-ui.md",
        "docs/modules/workspace-sessions.md",
        "docs/modules/context-delivery.md",
        "docs/modules/project-archive.md",
        "docs/modules/codex-app-server-executor.md",
        "docs/modules/release.md",
        "packages/workflow-kit/docs/modules/workflow-kit-package.md",
        "docs/planning/reliable-completion-sidebar.md",
        "docs/planning/reliable-completion-validation.md",
        "docs/modules/first-run-onboarding.md",
        "packages/workflow-kit/docs/modules/parallel-assignments.md",
        "docs/modules/runtime-lifecycle.md",
        "packages/workflow-kit/src/templates/PLAN.md",
        "packages/workflow-kit/src/templates/PROTOTYPE.md",
        "packages/workflow-kit/src/WORKFLOW.md"
      ],
      "verification_ids": [],
      "id": "DOCS",
      "title": "Актуализация всех документов проекта",
      "why": "Актуализация всех документов проекта",
      "acceptance_criteria": [
        "Действующие документы и README соответствуют результату; спецификация перенесена в контракты без архивных копий",
        "Пользовательский повторный тест и ограничения native Windows/живого ChatGPT описаны; постоянное правило полного выпуска закреплено"
      ],
      "expected_commit_message": "docs: Актуализация всех документов проекта",
      "parallel_safe": false
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "reliable-completion-sidebar-20261010",
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
      "title": "Собрать парный выпуск 0.6.110",
      "why": "Собрать парный выпуск 0.6.110",
      "acceptance_criteria": [
        "Одна сборка macOS arm64/Windows x64 выполняется проверкой при commit; подписанный постоянный app и шесть файлов поставки сверены",
        "sourceCommit содержит документы и исходники, identity сохранена"
      ],
      "expected_commit_message": "release: Собрать парный выпуск 0.6.110",
      "parallel_safe": false,
      "verification_kind": "package"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "reliable-completion-sidebar-20261010",
        "task_id": "T007",
        "role": "implementation"
      },
      "dependencies": [
        "T006",
        "DOCS"
      ],
      "functional_paths": [
        "release-manifest.json"
      ],
      "documentation_paths": [],
      "verification_ids": [
        "release-installed"
      ],
      "id": "T007",
      "title": "Установить готовый macOS выпуск 0.6.110",
      "why": "Установить готовый macOS выпуск 0.6.110",
      "acceptance_criteria": [
        "Готовый staging установлен без пересборки, identity/signature сохранены; работающий процесс не перезапущен"
      ],
      "expected_commit_message": "release: Установить готовый macOS выпуск 0.6.110",
      "parallel_safe": false,
      "verification_kind": "installed"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "reliable-completion-sidebar-20261010",
        "task_id": "T008",
        "role": "implementation"
      },
      "dependencies": [
        "T007",
        "DOCS"
      ],
      "functional_paths": [
        "release-manifest.json"
      ],
      "documentation_paths": [],
      "verification_ids": [
        "github-release"
      ],
      "id": "T008",
      "title": "Опубликовать выпуск 0.6.110 на GitHub",
      "why": "Опубликовать выпуск 0.6.110 на GitHub",
      "acceptance_criteria": [
        "Шесть assets, тег на sourceCommit и main сверены; финальный push выполнен без пересборки",
        "Пользователю версия, URL, проверки, ограничения и шаги приёмки; архивирование без пользователя не выполнено"
      ],
      "expected_commit_message": "release: Опубликовать выпуск 0.6.110 на GitHub",
      "parallel_safe": false,
      "verification_kind": "package"
    }
  ],
  "blocked_reason": null,
  "user_decisions": [
    {
      "id": "90d285c7-f8da-4485-884e-7e483edf5fd7",
      "text": "Пользователь 10.10.2026 согласовал UX и разрешил самостоятельную последовательную реализацию, сборку, установку и публикацию GitHub после Review; без параллельных исполнителей.",
      "recorded_at": "2026-10-10T07:29:14.648Z"
    }
  ],
  "parallel_allowed": true,
  "max_workers": 4,
  "execution_strategy": "sequential",
  "execution_reason": "Прямое решение пользователя: parallel требует этих исправлений и отдельного живого теста; реализация основным агентом, без назначений. Независимые UI/ownership работы всё равно выполняются последовательно; зависимости указаны по смыслу.",
  "execution_origin_session_id": "web-pilot-7aa2c4e9-0257-42f7-8f29-aeeeaf834299"
}
```
<!-- workflow-state:end -->

## Состояние

Execution Scope Status: ACTIVE
Delivery Status: IN_PROGRESS
Scope: reliable-completion-sidebar-20261010
Current Task: нет
Revision: 1675

## Цель

Исправить автоматический финал, учёт команд и ownership исполнителей, упростить сайдбар и выпустить 0.6.110

## Критерии приёмки

- Завершение exec/patch отражается независимо от write_stdin; ошибки и legacy сохраняют UNKNOWN с ID и причиной
- read_only реально запрещает запись и допускает loopback сервер; обычные операции не получают исключение; девять MCP tools сохранены
- Готовый source при защищённом сервере допускает интеграцию; dirty/transaction/UNKNOWN остаются заблокированы
- Все потребители включая удаление используют одну проекцию; completed не блокирует, журнал итогов ограничен 100; живой сервер блокирует удаление
- Доказанно read_only UNKNOWN не блокирует интеграцию; write UNKNOWN требует явной scoped диагностики и пользовательского признания неизвестности, без ложного exit=0/снятия защиты удаления
- Долговечное намерение создаётся при последнем READY до общего DONE; автоматический OFF не теряет поручение
- Правильный project/scope/session, busy/draft/Stop/явный OFF и UNKNOWN сохранены; restart/повтор события не дублируют Send
- Нет гонки merge/correction/finalization; итог основного ответа наблюдается отдельно от Send, main проверки обязательны
- parentProjectId подтверждается назначением; legacy мигрируется только с доказательствами
- Удаление родителя каскадно убирает подтверждённые дочерние записи/worktree/архив/runtime после restart
- Активность, чужая identity/одноимённый сосед, повторная папка и подмена worktree защищены; облачные чаты сохранены
- Меню поиска проектов, выбранный проект/последняя сессия и исполнители соответствуют открытому чату; фон не останавливается
- ID/название/способ/статус плана различены; версия и увеличенная Settings наверху; нижний блок удалён, сведения доступны в Settings
- Нет повторной доставки recovery в начатый чат; реальные ошибки видны у сессии, safe retry до Send и UNKNOWN сохраняются
- 312px, обе темы, keyboard/focus/aria и быстрые переключения покрыты fixtures
- Состояния финальной передачи видны в карточке основного проекта
- Полный временный Git/Electron цикл с сервером завершает main и один финальный ответ без пользовательского толчка; restart/сбои/два проекта проверены
- Правила Kit выбирают декомпозицию по результату/зависимостям/контрактам/риску без нормативов файлов/строк; текущая работа sequential
- Версии 0.6.110 и Kit 1.7.2, lockfiles и evidence согласованы; Kit установлен штатно
- Kit 1.7.2 поддерживает upgradeFrom 1.7.1 и установлен штатно с проверкой миграции
- Действующие документы и README соответствуют результату; спецификация перенесена в контракты без архивных копий
- Пользовательский повторный тест и ограничения native Windows/живого ChatGPT описаны; постоянное правило полного выпуска закреплено
- Одна сборка macOS arm64/Windows x64 выполняется проверкой при commit; подписанный постоянный app и шесть файлов поставки сверены
- sourceCommit содержит документы и исходники, identity сохранена
- Готовый staging установлен без пересборки, identity/signature сохранены; работающий процесс не перезапущен
- Шесть assets, тег на sourceCommit и main сверены; финальный push выполнен без пересборки
- Пользователю версия, URL, проверки, ограничения и шаги приёмки; архивирование без пользователя не выполнено

## Микрозадачи

Выполнение: sequential; разрешено: true; лимит: 4
Причина: Прямое решение пользователя: parallel требует этих исправлений и отдельного живого теста; реализация основным агентом, без назначений. Независимые UI/ownership работы всё равно выполняются последовательно; зависимости указаны по смыслу.

- [TODO] T001: Подтверждённый lifecycle команд и защищённый сервер результата — Ожидает
  - Git Commit: [PENDING] fix: Подтверждённый lifecycle команд и защищённый сервер результата
  - Reference: reliable-completion-sidebar-20261010 / T001 / implementation
  - Файлы: tools/codex-app-server-mcp/server.py, tools/codex-app-server-mcp/app_server_client.py, src/parallel-kit.mjs, src/execution-projection.mjs, tests/codex-app-server-mcp.test.mjs, tests/codex-app-server-tools.test.mjs, tests/parallel-kit.test.mjs, src/main.mjs, src/executor-session.mjs, src/command-activity.mjs, src/preload.cjs, src/ui/sidebar.mjs, src/ui/index.html, tests/command-activity.test.mjs
  - Параллельность: исключительное выполнение
  - Зависимости: нет
- [TODO] T002: Автоматическая финальная передача основному агенту — Ожидает
  - Git Commit: [PENDING] fix: Автоматическая финальная передача основному агенту
  - Reference: reliable-completion-sidebar-20261010 / T002 / implementation
  - Файлы: src/parallel-execution.mjs, src/main.mjs, src/project-auto-plan.mjs, src/automation-send-state.mjs, src/executor-session.mjs, tests/parallel-execution.test.mjs, tests/parallel-execution-recovery.test.mjs, tests/automation-send-state.test.mjs, tests/project-auto-plan.test.mjs
  - Параллельность: исключительное выполнение
  - Зависимости: T001
- [TODO] T003: Связь исполнителей с родителем и каскадное удаление — Ожидает
  - Git Commit: [PENDING] fix: Связь исполнителей с родителем и каскадное удаление
  - Reference: reliable-completion-sidebar-20261010 / T003 / implementation
  - Файлы: src/workspace-session.mjs, src/workspace-deletion.mjs, src/project-state-cleanup.mjs, src/execution-projection.mjs, src/main.mjs, tests/workspace-session.test.mjs, tests/workspace-deletion.test.mjs, tests/project-state-cleanup.test.mjs
  - Параллельность: исключительное выполнение
  - Зависимости: нет
- [TODO] T004: Один выбранный проект и обновлённый сайдбар — Ожидает
  - Git Commit: [PENDING] fix: Один выбранный проект и обновлённый сайдбар
  - Reference: reliable-completion-sidebar-20261010 / T004 / implementation
  - Файлы: src/ui/index.html, src/ui/sidebar.mjs, src/ui/settings-panel.mjs, src/context-session.mjs, src/main.mjs, src/workspace-session.mjs, src/session-plans.mjs, src/execution-projection.mjs, tests/sidebar.test.mjs, tests/context-session.test.mjs, tests/electron-smoke.mjs, tests/settings-chatgpt-channel.test.mjs
  - Параллельность: исключительное выполнение
  - Зависимости: T003, T002
- [TODO] T005: Сквозная регрессия и подготовка выпуска 0.6.110 — Ожидает
  - Git Commit: [PENDING] fix: Сквозная регрессия и подготовка выпуска 0.6.110
  - Reference: reliable-completion-sidebar-20261010 / T005 / implementation
  - Файлы: tests/parallel-execution-smoke-fixture.cjs, tests/electron-smoke.mjs, packages/workflow-kit/src, packages/workflow-kit/package.json, package.json, package-lock.json, scripts/check-codex-tools.mjs, scripts/check-installed-release.mjs, tests/workflow-kit-source.test.mjs, packages/workflow-kit/src/lib/common.mjs, packages/workflow-kit/src/lib/installer.mjs, packages/workflow-kit/src/templates/PLAN.md, packages/workflow-kit/src/templates/PROTOTYPE.md, packages/workflow-kit/src/WORKFLOW.md
  - Параллельность: исключительное выполнение
  - Зависимости: T001, T002, T003, T004
- [TODO] DOCS: Актуализация всех документов проекта — Ожидает
  - Git Commit: [PENDING] docs: Актуализация всех документов проекта
  - Reference: reliable-completion-sidebar-20261010 / DOCS / implementation
  - Файлы: AGENTS.md, README.md, docs/architecture/OVERVIEW.md, docs/modules/parallel-execution.md, docs/modules/parallel-execution-acceptance.md, docs/modules/auto-plan.md, docs/modules/auto-plan-send.md, docs/modules/plan-view.md, docs/modules/workspace-sidebar-ui.md, docs/modules/workspace-sessions.md, docs/modules/context-delivery.md, docs/modules/project-archive.md, docs/modules/codex-app-server-executor.md, docs/modules/release.md, packages/workflow-kit/docs/modules/workflow-kit-package.md, docs/planning/reliable-completion-sidebar.md, docs/planning/reliable-completion-validation.md, docs/modules/first-run-onboarding.md, packages/workflow-kit/docs/modules/parallel-assignments.md, docs/modules/runtime-lifecycle.md, packages/workflow-kit/src/templates/PLAN.md, packages/workflow-kit/src/templates/PROTOTYPE.md, packages/workflow-kit/src/WORKFLOW.md
  - Параллельность: исключительное выполнение
  - Зависимости: T001, T002, T003, T004, T005
- [TODO] T006: Собрать парный выпуск 0.6.110 — Ожидает
  - Git Commit: [PENDING] release: Собрать парный выпуск 0.6.110
  - Reference: reliable-completion-sidebar-20261010 / T006 / implementation
  - Файлы: release-manifest.json
  - Параллельность: исключительное выполнение
  - Зависимости: DOCS
- [TODO] T007: Установить готовый macOS выпуск 0.6.110 — Ожидает
  - Git Commit: [PENDING] release: Установить готовый macOS выпуск 0.6.110
  - Reference: reliable-completion-sidebar-20261010 / T007 / implementation
  - Файлы: release-manifest.json
  - Параллельность: исключительное выполнение
  - Зависимости: T006, DOCS
- [TODO] T008: Опубликовать выпуск 0.6.110 на GitHub — Ожидает
  - Git Commit: [PENDING] release: Опубликовать выпуск 0.6.110 на GitHub
  - Reference: reliable-completion-sidebar-20261010 / T008 / implementation
  - Файлы: release-manifest.json
  - Параллельность: исключительное выполнение
  - Зависимости: T007, DOCS

## Context Pack For This Cycle

- docs/planning/reliable-completion-sidebar.md
- docs/planning/reliable-completion-validation.md
- docs/architecture/OVERVIEW.md

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
