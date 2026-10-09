# Активный план — Project Web Pilot

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 1588,
  "project_id": "cf944136-d1fc-4bd5-9ea0-e46d1fe230e7",
  "project_name": "Project Web Pilot",
  "scope_id": "parallel-chat-execution-20261009",
  "execution_scope_status": "ACTIVE",
  "delivery_status": "IN_PROGRESS",
  "objective": "Реализовать опциональное параллельное выполнение плана через чат-сессии Web Pilot и отдельные worktree с проверенной последовательной интеграцией в main.",
  "acceptance_criteria": [
    "Снимок разрешения и лимита фиксируется при новой основной сессии; существующее выполнение не меняется от Settings.",
    "Параллельность выбирается при планировании только при пользе; иначе сохраняется основной последовательный процесс.",
    "Исполнители работают в отдельных chat/worktree, слияния в main сериализованы и проверены; основной план сохраняется.",
    "Живые сессии видны и доступны; архитектура независима от окна без реализации detach.",
    "Результаты сбоев/перезапуска не дублируются, пользовательские и автоматические проверки разграничены."
  ],
  "approved_scope": {
    "functional_paths": [
      "packages/workflow-kit/src/schemas/plan.schema.json",
      "packages/workflow-kit/src/lib/plan.mjs",
      "packages/workflow-kit/src/lib/simple-workflow.mjs",
      "packages/workflow-kit/src/lib/extend-plan.mjs",
      "packages/workflow-kit/src/lib/task-update.mjs",
      "packages/workflow-kit/src/lib/plan-review.mjs",
      "packages/workflow-kit/src/lib/recovery.mjs",
      "packages/workflow-kit/scripts/check-parallel-plan-fixture.mjs",
      "packages/workflow-kit/package.json",
      "src/ui/settings-panel.mjs",
      "src/ui/index.html",
      "src/main.mjs",
      "src/preload.cjs",
      "src/workspace-session.mjs",
      "src/context-session.mjs",
      "tests/workspace-session.test.mjs",
      "tests/settings-parallel-execution.test.mjs",
      "packages/workflow-kit/src/cli.mjs",
      "packages/workflow-kit/src/lib/git.mjs",
      "packages/workflow-kit/src/lib/transaction.mjs",
      "packages/workflow-kit/src/lib/validate.mjs",
      "packages/workflow-kit/src/lib/git-hooks.mjs",
      "packages/workflow-kit/src/lib/task-assignment.mjs",
      "packages/workflow-kit/src/lib/command-help.mjs",
      "packages/workflow-kit/scripts/check-task-assignment-fixture.mjs",
      "packages/workflow-kit/src/lib/task-integration.mjs",
      "packages/workflow-kit/scripts/check-task-integration-fixture.mjs",
      "src/page-state.mjs",
      "src/page-state-bridge.mjs",
      "src/session-runtime.mjs",
      "tests/session-runtime.test.mjs",
      "tests/context-session.test.mjs",
      "tests/page-state.test.mjs",
      "src/parallel-execution.mjs",
      "src/auto-plan.mjs",
      "src/auto-plan-state.mjs",
      "src/automation-send-state.mjs",
      "src/plan-monitor.mjs",
      "tests/parallel-execution.test.mjs",
      "tests/auto-plan.test.mjs",
      "src/ui/sidebar.mjs",
      "src/ui/progress.mjs",
      "src/agent-timer.mjs",
      "tests/parallel-execution-ui.test.mjs",
      "tests/agent-timer.test.mjs",
      "src/conversation-recovery.mjs",
      "packages/workflow-kit/src/lib/actions.mjs",
      "tests/parallel-execution-recovery.test.mjs",
      "tests/conversation-recovery.test.mjs",
      "packages/workflow-kit/src/lib/common.mjs",
      "packages/workflow-kit/src/install.mjs",
      "tests/workflow-kit-upgrade.test.mjs",
      "tests/electron-smoke.mjs",
      "tests/parallel-execution-smoke-fixture.cjs",
      "packages/workflow-kit/scripts/check-parallel-execution-fixture.mjs",
      "package.json",
      "package-lock.json",
      ".harness/workflow.json",
      "src/parallel-settings.mjs",
      "src/executor-session.mjs",
      "src/parallel-kit.mjs",
      "src/project-input-watch.mjs",
      "src/session-plans.mjs",
      "tests/codex-app-server-mcp.test.mjs",
      "tools/codex-app-server-mcp/server.py",
      "src/execution-projection.mjs",
      "packages/workflow-kit/src/lib/installer.mjs",
      "src/context-inputs.mjs",
      "src/workspace-readiness.mjs",
      "src/workspace-setup.mjs",
      "tests/workspace-readiness.test.mjs",
      "tools/codex-app-server-mcp/codex-tools.lock.json"
    ],
    "documentation_paths": [
      "docs/planning/parallel-execution-spec.md",
      "docs/planning/parallel-execution-plan-draft.md",
      "packages/workflow-kit/src/templates/PLAN.md",
      "packages/workflow-kit/src/templates/SPEC.md",
      "docs/architecture/OVERVIEW.md",
      "docs/modules/release.md",
      "README.md",
      "docs/modules/auto-plan.md",
      "docs/modules/chatgpt-dom-compatibility.md",
      "docs/modules/chromium-diagnostics.md",
      "docs/modules/codex-app-server-executor.md",
      "docs/modules/context-delivery.md",
      "docs/modules/first-run-onboarding.md",
      "docs/modules/plan-review.md",
      "docs/modules/plan-view.md",
      "docs/modules/project-archive.md",
      "docs/modules/project-doctor.md",
      "docs/modules/runtime-lifecycle.md",
      "docs/modules/session-opening-performance.md",
      "docs/modules/workflow-kit-recovery.md",
      "docs/modules/workspace-sessions.md",
      "docs/modules/workspace-setup.md",
      "docs/modules/workspace-sidebar-ui.md",
      "docs/planning/technical-audit-20261008.md",
      "docs/planning/technical-audit-findings-lifecycle.md",
      "docs/planning/technical-audit-findings-summary.md",
      "docs/planning/technical-audit-findings-unused.md",
      "docs/planning/technical-audit-findings.md",
      "packages/workflow-kit/docs/modules/workflow-kit-package.md",
      "docs/planning/parallel-integration.md",
      "docs/planning/live-session-runtime.md",
      "docs/planning/parallel-dispatch.md",
      "docs/planning/parallel-ui.md",
      "docs/planning/parallel-recovery.md",
      "docs/planning/parallel-kit-upgrade.md",
      "docs/planning/parallel-regression.md",
      "docs/planning/parallel-acceptance.md",
      "docs/planning/parallel-release-preparation.md",
      "docs/modules/parallel-execution-acceptance.md",
      "docs/modules/parallel-execution.md",
      "docs/modules/session-runtime.md",
      "docs/modules/technical-audit-followups.md",
      "packages/workflow-kit/README.md",
      "packages/workflow-kit/docs/modules/parallel-assignments.md"
    ]
  },
  "baseline_commit": "39507e5655e81395bbcbeab0bd7b00572e4a746b",
  "current_task_id": null,
  "context_pack": {
    "documents": [
      {
        "path": "docs/architecture/OVERVIEW.md",
        "required": true,
        "revision": "WORKTREE"
      },
      {
        "path": "docs/planning/parallel-execution-spec.md",
        "required": true,
        "revision": "dcdb9132bec59b2e1e26e4cc17e332dbc7412f19"
      },
      {
        "path": "docs/modules/session-runtime.md",
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
        "scope_id": "parallel-chat-execution-20261009",
        "task_id": "T001",
        "role": "implementation"
      },
      "dependencies": [],
      "functional_paths": [
        "packages/workflow-kit/src/schemas/plan.schema.json",
        "packages/workflow-kit/src/lib/plan.mjs",
        "packages/workflow-kit/src/lib/simple-workflow.mjs",
        "packages/workflow-kit/src/lib/extend-plan.mjs",
        "packages/workflow-kit/src/lib/task-update.mjs",
        "packages/workflow-kit/src/lib/plan-review.mjs",
        "packages/workflow-kit/src/lib/recovery.mjs",
        "packages/workflow-kit/scripts/check-parallel-plan-fixture.mjs",
        "packages/workflow-kit/package.json",
        "packages/workflow-kit/src/lib/actions.mjs"
      ],
      "documentation_paths": [
        "docs/planning/parallel-execution-spec.md",
        "packages/workflow-kit/src/templates/PLAN.md",
        "packages/workflow-kit/src/templates/SPEC.md",
        "docs/planning/parallel-execution-plan-draft.md"
      ],
      "verification_ids": [
        "kit-check"
      ],
      "id": "T001",
      "title": "Модель и валидация параллельного плана",
      "why": "Единое понимание зависимостей и интеграции.",
      "acceptance_criteria": [
        "Старые планы читаются и выполняются как прежде, без автоматического parallel.",
        "OFF и лимит 1 не допускают parallel; ON позволяет sequential с причиной.",
        "Циклы, неизвестные ссылки, неверный лимит и неизвестная область при parallel_safe=true отклоняются. Пересечение путей сериализует выдачу; топологический порядок обязателен лишь для новых планов.",
        "parallel_safe=false имеет исключительную семантику; слово «последовательно» не означает передачу планировщику в parallel-плане.",
        "Review получает точную нормализованную разметку; её изменение требует нового согласования пары при ON.",
        "Родительское DONE невозможно подтвердить одним локальным коммитом исполнителя.",
        "Новая fixture подключена к npm run check пакета и реально выполняется в kit-check; успешный код без её запуска не считается проверкой."
      ],
      "expected_commit_message": "feat: Модель и валидация параллельного плана",
      "context_pack": {
        "documents": [
          {
            "path": "packages/workflow-kit/docs/modules/workflow-kit-package.md",
            "required": false
          }
        ],
        "include_last_completed_task": false,
        "dependency_task_ids": []
      },
      "actual_files": [
        "docs/planning/parallel-execution-plan-draft.md",
        "docs/planning/parallel-execution-spec.md",
        "packages/workflow-kit/package.json",
        "packages/workflow-kit/scripts/check-parallel-plan-fixture.mjs",
        "packages/workflow-kit/src/lib/actions.mjs",
        "packages/workflow-kit/src/lib/extend-plan.mjs",
        "packages/workflow-kit/src/lib/plan.mjs",
        "packages/workflow-kit/src/lib/recovery.mjs",
        "packages/workflow-kit/src/lib/simple-workflow.mjs",
        "packages/workflow-kit/src/schemas/plan.schema.json",
        "packages/workflow-kit/src/templates/PLAN.md",
        "packages/workflow-kit/src/templates/SPEC.md"
      ]
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "parallel-chat-execution-20261009",
        "task_id": "T002",
        "role": "implementation"
      },
      "dependencies": [
        "T001"
      ],
      "functional_paths": [
        "src/ui/settings-panel.mjs",
        "src/ui/index.html",
        "src/main.mjs",
        "src/preload.cjs",
        "src/workspace-session.mjs",
        "src/context-session.mjs",
        "tests/workspace-session.test.mjs",
        "tests/settings-parallel-execution.test.mjs",
        "src/parallel-settings.mjs",
        "tests/electron-smoke.mjs"
      ],
      "documentation_paths": [
        "docs/planning/parallel-execution-spec.md",
        "docs/planning/parallel-execution-plan-draft.md"
      ],
      "verification_ids": [
        "unit-all",
        "electron-smoke"
      ],
      "id": "T002",
      "title": "Settings и неизменяемый снимок сессии",
      "why": "Разрешение и предел без ручного выбора параллельности.",
      "acceptance_criteria": [
        "Отдельный блок, переключатель «Разрешить параллельное выполнение», при ON — положительный целочисленный максимум; исходное предложение OFF/2.",
        "Снимок создаётся только при новой пользовательской основной сессии и сохраняется при restart.",
        "Изменение Settings никак не меняет существующую сессию/план/автоматически созданных исполнителей.",
        "Новая сессия при ACTIVE продолжает его параметры; новый снимок не создаёт второй план.",
        "Legacy миграция сохраняет URL, Chat/Work, имена, попытки доставки, архив и времена; старым сессиям не включается parallel.",
        "Recovery сообщает разрешение/лимит для планирования, но не состояние AutoPlan.",
        "Изменение переключателя само не запускает задач."
      ],
      "expected_commit_message": "feat: Settings и неизменяемый снимок сессии",
      "context_pack": {
        "documents": [
          {
            "path": "docs/modules/workspace-sessions.md",
            "required": false
          },
          {
            "path": "docs/modules/context-delivery.md",
            "required": false
          }
        ],
        "include_last_completed_task": false,
        "dependency_task_ids": []
      },
      "actual_files": [
        "docs/planning/parallel-execution-plan-draft.md",
        "src/context-session.mjs",
        "src/main.mjs",
        "src/parallel-settings.mjs",
        "src/preload.cjs",
        "src/ui/index.html",
        "src/ui/settings-panel.mjs",
        "src/workspace-session.mjs",
        "tests/electron-smoke.mjs",
        "tests/settings-parallel-execution.test.mjs",
        "tests/workspace-session.test.mjs"
      ]
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "parallel-chat-execution-20261009",
        "task_id": "T003",
        "role": "implementation"
      },
      "dependencies": [
        "T001"
      ],
      "functional_paths": [
        "packages/workflow-kit/src/cli.mjs",
        "packages/workflow-kit/src/lib/git.mjs",
        "packages/workflow-kit/src/lib/plan.mjs",
        "packages/workflow-kit/src/lib/transaction.mjs",
        "packages/workflow-kit/src/lib/validate.mjs",
        "packages/workflow-kit/src/lib/git-hooks.mjs",
        "packages/workflow-kit/src/lib/recovery.mjs",
        "packages/workflow-kit/src/lib/task-assignment.mjs",
        "packages/workflow-kit/src/lib/command-help.mjs",
        "packages/workflow-kit/scripts/check-task-assignment-fixture.mjs",
        "packages/workflow-kit/package.json",
        "packages/workflow-kit/src/lib/actions.mjs",
        "packages/workflow-kit/src/schemas/plan.schema.json"
      ],
      "documentation_paths": [
        "docs/planning/parallel-execution-spec.md"
      ],
      "verification_ids": [
        "kit-check"
      ],
      "id": "T003",
      "title": "Worktree и локальное назначение Kit",
      "why": "Исполнитель работает только над своим назначением.",
      "acceptance_criteria": [
        "Управляемая операция выдаёт уникальное назначение и создаёт отдельную ветку/worktree от подтверждённого SHA main.",
        "Локальный current plan содержит одну задачу с parent scope/task, базой и подтверждёнными внешними зависимостями; нового пользовательского Review для него нет.",
        "Пути/symlink/занятость/принадлежность Git проверяются; чужая папка и существующая ветка не затираются.",
        "Разные worktree имеют независимые index/lock/transaction; hooks не перенастраивают соседей.",
        "Окружение готово к verification_ids: явный npm ci по lockfile в своём worktree либо NEEDS_SETUP; без копий/symlink node_modules. Проверить штатную генерацию игнорируемых ресурсов.",
        "Повтор/сбой в середине выдачи не создаёт второго задания/ветки; восстановление по ID.",
        "task:start и commit проверяют назначение и cwd; исходный коммит не меняет main.",
        "Исполнитель не расширяет план и не запускает вложенных агентов; локальное DONE — только готовность к интеграции.",
        "Новая fixture подключена к npm run check пакета и реально выполняется в kit-check; успешный код без её запуска не считается проверкой."
      ],
      "expected_commit_message": "feat: Worktree и локальное назначение Kit",
      "context_pack": {
        "documents": [
          {
            "path": "packages/workflow-kit/docs/modules/workflow-kit-package.md",
            "required": false
          }
        ],
        "include_last_completed_task": false,
        "dependency_task_ids": []
      },
      "actual_files": [
        "docs/planning/parallel-execution-spec.md",
        "packages/workflow-kit/package.json",
        "packages/workflow-kit/scripts/check-task-assignment-fixture.mjs",
        "packages/workflow-kit/src/cli.mjs",
        "packages/workflow-kit/src/lib/actions.mjs",
        "packages/workflow-kit/src/lib/command-help.mjs",
        "packages/workflow-kit/src/lib/git-hooks.mjs",
        "packages/workflow-kit/src/lib/git.mjs",
        "packages/workflow-kit/src/lib/plan.mjs",
        "packages/workflow-kit/src/lib/recovery.mjs",
        "packages/workflow-kit/src/lib/task-assignment.mjs",
        "packages/workflow-kit/src/lib/transaction.mjs",
        "packages/workflow-kit/src/lib/validate.mjs",
        "packages/workflow-kit/src/schemas/plan.schema.json"
      ]
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "parallel-chat-execution-20261009",
        "task_id": "T004",
        "role": "implementation"
      },
      "dependencies": [
        "T003"
      ],
      "functional_paths": [
        "packages/workflow-kit/src/lib/transaction.mjs",
        "packages/workflow-kit/src/lib/validate.mjs",
        "packages/workflow-kit/src/lib/git.mjs",
        "packages/workflow-kit/src/lib/git-hooks.mjs",
        "packages/workflow-kit/src/lib/plan.mjs",
        "packages/workflow-kit/src/lib/task-integration.mjs",
        "packages/workflow-kit/src/lib/command-help.mjs",
        "packages/workflow-kit/src/cli.mjs",
        "packages/workflow-kit/scripts/check-task-integration-fixture.mjs",
        "packages/workflow-kit/package.json"
      ],
      "documentation_paths": [
        "docs/planning/parallel-execution-spec.md",
        "docs/planning/parallel-integration.md"
      ],
      "verification_ids": [
        "kit-check"
      ],
      "id": "T004",
      "title": "Управляемое слияние и доказательства интеграции",
      "why": "Проверенный main с сохранённым общим планом.",
      "acceptance_criteria": [
        "Source SHA связан с назначением/базой, diff ограничен задачей, сторонние коммиты отвергаются.",
        "Один merge за раз; main чист и свободен от чужой операции; штатные записи Kit блокируются на время интеграции.",
        "Дочерний план/служебные настройки не перетирают основной план и его конфигурацию.",
        "Кандидат слияния проверяется до окончательного merge-коммита; провал не даёт DONE.",
        "Дочерний implementation остаётся однородительским; отдельная роль интеграции проверяет родителей, trailers, файлы, источники и зависимости.",
        "Обе ссылки восстанавливаются из Git без хранения собственного SHA внутри создаваемого коммита; нет AMBIGUOUS_COMMIT.",
        "Конфликт допускает назначенное исправление в main; следующая интеграция заблокирована. Разрешение нельзя заменить автоматическим ours/theirs.",
        "Повтор после сбоя до/после коммита не создаёт вторую интеграцию; чужие изменения сохраняются.",
        "Новая fixture подключена к npm run check пакета и реально выполняется в kit-check; успешный код без её запуска не считается проверкой."
      ],
      "expected_commit_message": "feat: Управляемое слияние и доказательства интеграции",
      "context_pack": {
        "documents": [
          {
            "path": "packages/workflow-kit/docs/modules/workflow-kit-package.md",
            "required": false
          }
        ],
        "include_last_completed_task": false,
        "dependency_task_ids": []
      },
      "actual_files": [
        "docs/planning/parallel-execution-spec.md",
        "docs/planning/parallel-integration.md",
        "packages/workflow-kit/package.json",
        "packages/workflow-kit/scripts/check-task-integration-fixture.mjs",
        "packages/workflow-kit/src/cli.mjs",
        "packages/workflow-kit/src/lib/command-help.mjs",
        "packages/workflow-kit/src/lib/git-hooks.mjs",
        "packages/workflow-kit/src/lib/git.mjs",
        "packages/workflow-kit/src/lib/task-integration.mjs",
        "packages/workflow-kit/src/lib/transaction.mjs",
        "packages/workflow-kit/src/lib/validate.mjs"
      ]
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "parallel-chat-execution-20261009",
        "task_id": "T005",
        "role": "implementation"
      },
      "dependencies": [
        "T002"
      ],
      "functional_paths": [
        "src/main.mjs",
        "src/context-session.mjs",
        "src/page-state.mjs",
        "src/page-state-bridge.mjs",
        "src/workspace-session.mjs",
        "src/session-runtime.mjs",
        "tests/session-runtime.test.mjs",
        "tests/context-session.test.mjs",
        "tests/page-state.test.mjs",
        "tests/electron-smoke.mjs",
        "tests/workspace-session.test.mjs"
      ],
      "documentation_paths": [
        "docs/planning/parallel-execution-spec.md",
        "docs/planning/live-session-runtime.md"
      ],
      "verification_ids": [
        "unit-all",
        "electron-smoke"
      ],
      "id": "T005",
      "title": "Несколько живых сессий без привязки к окну",
      "why": "Живые чаты и возможность будущего detach.",
      "acceptance_criteria": [
        "У живой сессии отдельные WebContentsView/PageState/Composer/доставка и обработчики событий при штатном общем профиле аккаунта.",
        "Выбор чата меняет отображение, не URL другой работающей сессии и не её cwd/назначение.",
        "Контроллер живёт на уровне приложения, не принадлежит главному окну; показ/скрытие отделены от запуска/остановки/уничтожения сессии.",
        "Ключи операций используют session/worktree/task; late-event и события чужого WebContents/mainFrame отклоняются.",
        "Будущий перенос представления не требует нового чата/Send/агента. Сейчас не создаются detach-кнопки и дополнительные окна.",
        "Подписки не удваиваются, завершённые страницы освобождаются явно; смена выбора не уничтожает работающую страницу.",
        "Сохраняются узкие IPC, защита remote renderer и публичные экспорты DOM/Composer/Experience для Web Pilot Sidebar."
      ],
      "expected_commit_message": "feat: Несколько живых сессий без привязки к окну",
      "context_pack": {
        "documents": [
          {
            "path": "docs/modules/workspace-sessions.md",
            "required": false
          },
          {
            "path": "docs/modules/context-delivery.md",
            "required": false
          }
        ],
        "include_last_completed_task": false,
        "dependency_task_ids": []
      },
      "actual_files": [
        "docs/planning/live-session-runtime.md",
        "docs/planning/parallel-execution-spec.md",
        "src/context-session.mjs",
        "src/main.mjs",
        "src/session-runtime.mjs",
        "src/workspace-session.mjs",
        "tests/context-session.test.mjs",
        "tests/electron-smoke.mjs",
        "tests/session-runtime.test.mjs",
        "tests/workspace-session.test.mjs"
      ]
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "parallel-chat-execution-20261009",
        "task_id": "T006",
        "role": "implementation"
      },
      "dependencies": [
        "T004",
        "T005"
      ],
      "functional_paths": [
        "src/parallel-execution.mjs",
        "src/main.mjs",
        "src/auto-plan.mjs",
        "src/auto-plan-state.mjs",
        "src/automation-send-state.mjs",
        "src/context-session.mjs",
        "src/plan-monitor.mjs",
        "tests/parallel-execution.test.mjs",
        "tests/auto-plan.test.mjs",
        "src/preload.cjs",
        "packages/workflow-kit/scripts/check-parallel-plan-fixture.mjs",
        "packages/workflow-kit/src/lib/plan.mjs",
        "packages/workflow-kit/src/lib/simple-workflow.mjs",
        "packages/workflow-kit/src/schemas/plan.schema.json",
        "src/executor-session.mjs",
        "src/parallel-kit.mjs",
        "src/project-input-watch.mjs",
        "src/session-plans.mjs",
        "src/workspace-session.mjs",
        "tests/codex-app-server-mcp.test.mjs",
        "tests/workspace-session.test.mjs",
        "tools/codex-app-server-mcp/server.py"
      ],
      "documentation_paths": [
        "docs/planning/parallel-execution-spec.md",
        "docs/planning/parallel-dispatch.md"
      ],
      "verification_ids": [
        "kit-check",
        "unit-all",
        "electron-smoke"
      ],
      "id": "T006",
      "title": "Выдача задач и последовательная очередь main",
      "why": "Автоматическое исполнение согласованного плана.",
      "acceptance_criteria": [
        "Работа начинается только для разрешённого опубликованного плана; Review gate сохраняется.",
        "Узкий IPC запуска выдаёт доступную группу; проверяет sender, снимок сессии происхождения и параметры плана. OFF-снимок/parallel-план, превышение лимита или неизвестный снимок блокируют запуск. Повтор клика не дублирует задания.",
        "Разрешение ON не принуждает к parallel; sequential идёт через старый основной чат без worktree.",
        "Готовность считается по интегрированным зависимостям и совместимости путей, лимит — из неизменного снимка.",
        "В parallel-стратегии все обычные задачи выдаются исполнителям; исключительная ждёт интеграции предыдущих и выполняется одна.",
        "Одно назначение — один чат/ветка/worktree; завершение ответа без коммита не считается DONE.",
        "Для готовых результатов одна очередь main; после интеграции зависимая задача получает актуальный base SHA.",
        "AutoPlan продолжает только назначенную задачу; коммит останавливает её автоотправки. Сам Settings режим не является AutoPlan.",
        "Применено правило кнопки запуска/AutoPlan из §7; нет управления AutoPlan текстом агента.",
        "По действию пользователя основной чат получает одно поручение исправить конкретную интеграцию в main; исключительный доступ сохраняется, UNKNOWN доставки не повторяется.",
        "Повторные события, переключения и Settings не меняют текущую стратегию и не дублируют запуск."
      ],
      "expected_commit_message": "feat: Выдача задач и последовательная очередь main",
      "context_pack": {
        "documents": [
          {
            "path": "docs/modules/auto-plan.md",
            "required": false
          },
          {
            "path": "docs/modules/plan-review.md",
            "required": false
          }
        ],
        "include_last_completed_task": false,
        "dependency_task_ids": []
      },
      "actual_files": [
        "docs/planning/parallel-dispatch.md",
        "docs/planning/parallel-execution-spec.md",
        "packages/workflow-kit/scripts/check-parallel-plan-fixture.mjs",
        "packages/workflow-kit/src/lib/plan.mjs",
        "packages/workflow-kit/src/lib/simple-workflow.mjs",
        "packages/workflow-kit/src/schemas/plan.schema.json",
        "src/auto-plan-state.mjs",
        "src/context-session.mjs",
        "src/executor-session.mjs",
        "src/main.mjs",
        "src/parallel-execution.mjs",
        "src/parallel-kit.mjs",
        "src/preload.cjs",
        "src/project-input-watch.mjs",
        "src/session-plans.mjs",
        "src/workspace-session.mjs",
        "tests/codex-app-server-mcp.test.mjs",
        "tests/parallel-execution.test.mjs",
        "tests/workspace-session.test.mjs",
        "tools/codex-app-server-mcp/server.py"
      ]
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "parallel-chat-execution-20261009",
        "task_id": "T007",
        "role": "implementation"
      },
      "dependencies": [
        "T006"
      ],
      "functional_paths": [
        "src/ui/sidebar.mjs",
        "src/ui/index.html",
        "src/ui/progress.mjs",
        "src/main.mjs",
        "src/workspace-session.mjs",
        "src/agent-timer.mjs",
        "src/plan-monitor.mjs",
        "tests/parallel-execution-ui.test.mjs",
        "tests/agent-timer.test.mjs",
        "src/execution-projection.mjs",
        "src/executor-session.mjs",
        "src/parallel-execution.mjs"
      ],
      "documentation_paths": [
        "docs/planning/parallel-execution-spec.md",
        "docs/planning/parallel-ui.md"
      ],
      "verification_ids": [
        "unit-all"
      ],
      "id": "T007",
      "title": "Дерево исполнителей, состояния и время",
      "why": "пользователь видит работу и открывает чаты, не путая готовность с интеграцией.",
      "acceptance_criteria": [
        "Группа «Исполнители» связана с основной сессией, без владения планом.",
        "Панель плана содержит «Выполнить доступные задачи» и при конфликте «Передать исправление основному агенту»; кнопки вызывают защищённые IPC.",
        "ID/название, отметка worktree, состояние и время читаются без зависимости от цвета.",
        "Клик открывает соответствующий живой/сохранённый чат, не останавливает соседей.",
        "Готово к слиянию, интегрируется и завершено различаются; DONE только после проверенной интеграции.",
        "Idle не выдаётся за вопрос пользователя; неопределённость видима.",
        "Наблюдаемая активность отделена от ожидания; restart не сбрасывает время и не выдумывает активность за закрытое приложение.",
        "Завершённые чаты доступны; нет копии полного текста беседы или новых detach-окон."
      ],
      "expected_commit_message": "feat: Дерево исполнителей, состояния и время",
      "context_pack": {
        "documents": [
          {
            "path": "docs/modules/workspace-sidebar-ui.md",
            "required": false
          },
          {
            "path": "docs/modules/plan-view.md",
            "required": false
          }
        ],
        "include_last_completed_task": false,
        "dependency_task_ids": []
      },
      "actual_files": [
        "docs/planning/parallel-execution-spec.md",
        "docs/planning/parallel-ui.md",
        "src/agent-timer.mjs",
        "src/execution-projection.mjs",
        "src/executor-session.mjs",
        "src/main.mjs",
        "src/parallel-execution.mjs",
        "src/ui/index.html",
        "src/ui/progress.mjs",
        "src/ui/sidebar.mjs",
        "src/workspace-session.mjs",
        "tests/agent-timer.test.mjs",
        "tests/parallel-execution-ui.test.mjs"
      ]
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "parallel-chat-execution-20261009",
        "task_id": "T008",
        "role": "implementation"
      },
      "dependencies": [
        "T007"
      ],
      "functional_paths": [
        "src/parallel-execution.mjs",
        "src/conversation-recovery.mjs",
        "src/automation-send-state.mjs",
        "src/auto-plan-state.mjs",
        "src/session-runtime.mjs",
        "src/workspace-session.mjs",
        "src/main.mjs",
        "packages/workflow-kit/src/lib/task-assignment.mjs",
        "packages/workflow-kit/src/lib/task-integration.mjs",
        "packages/workflow-kit/src/lib/actions.mjs",
        "tests/parallel-execution-recovery.test.mjs",
        "tests/conversation-recovery.test.mjs",
        "packages/workflow-kit/scripts/check-task-assignment-fixture.mjs",
        "packages/workflow-kit/scripts/check-task-integration-fixture.mjs",
        "src/execution-projection.mjs",
        "src/parallel-kit.mjs",
        "src/preload.cjs",
        "src/ui/index.html",
        "src/ui/sidebar.mjs"
      ],
      "documentation_paths": [
        "docs/planning/parallel-execution-spec.md",
        "docs/planning/parallel-recovery.md"
      ],
      "verification_ids": [
        "kit-check",
        "unit-all",
        "electron-smoke"
      ],
      "id": "T008",
      "title": "Восстановление назначений и сессий",
      "why": "Восстановление без потери и повторения задач.",
      "acceptance_criteria": [
        "Перезапуск сверяет назначения, чаты, Git/Kit и незавершённые транзакции до новых действий.",
        "UNKNOWN не повторяет Send; сбой после фактического коммита не запускает задачу заново.",
        "Существующая однократная безопасная перезагрузка и пауза rate-limit действуют на правильную сессию; бесконечного retry нет.",
        "Черновик и ручной Stop защищены; чужая выбранная сессия не получает продолжение.",
        "Ошибка исполнителя блокирует его/зависимых, конфликт main — очередь слияний; независимая работа не теряется.",
        "При неизвестном состоянии видна причина и доступное действие, без ложного DONE.",
        "Подробности новых наблюдаемых сбоев фиксируются по фактам, не вводится гипотетический лимит tool calls."
      ],
      "expected_commit_message": "feat: Восстановление назначений и сессий",
      "context_pack": {
        "documents": [
          {
            "path": "docs/modules/auto-plan.md",
            "required": false
          },
          {
            "path": "docs/modules/plan-review.md",
            "required": false
          }
        ],
        "include_last_completed_task": false,
        "dependency_task_ids": []
      },
      "actual_files": [
        "docs/planning/parallel-recovery.md",
        "packages/workflow-kit/src/lib/task-integration.mjs",
        "src/conversation-recovery.mjs",
        "src/execution-projection.mjs",
        "src/main.mjs",
        "src/parallel-execution.mjs",
        "src/parallel-kit.mjs",
        "src/preload.cjs",
        "src/session-runtime.mjs",
        "src/ui/index.html",
        "src/ui/sidebar.mjs",
        "src/workspace-session.mjs",
        "tests/conversation-recovery.test.mjs",
        "tests/parallel-execution-recovery.test.mjs"
      ]
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "parallel-chat-execution-20261009",
        "task_id": "T009",
        "role": "implementation"
      },
      "dependencies": [
        "T008"
      ],
      "functional_paths": [
        "packages/workflow-kit/package.json",
        "packages/workflow-kit/src/lib/common.mjs",
        "packages/workflow-kit/src/install.mjs",
        "tests/workflow-kit-upgrade.test.mjs",
        "package-lock.json",
        "packages/workflow-kit/src/lib/installer.mjs"
      ],
      "documentation_paths": [
        "docs/planning/parallel-execution-spec.md",
        "docs/planning/parallel-kit-upgrade.md"
      ],
      "verification_ids": [
        "kit-check",
        "unit-all"
      ],
      "id": "T009",
      "title": "Обновить локальный runtime Kit управляемым установщиком",
      "why": "Совместимость checkout с новой моделью Kit.",
      "acceptance_criteria": [
        "Версия пакета и VERSION согласованы; переход с фактической 1.6.4 поддержан и проверен.",
        "Старые проекты/планы сохраняют последовательное поведение и историю; незавершённые назначения не мигрируются наугад.",
        "Установщик проверяет состояние до записи; обновляет только принадлежащие Kit файлы.",
        "Пакет остаётся единственным источником; resources/workflow-kit воспроизводим, runtime вручную не правится.",
        "Из текущего плана после обновления можно продолжить штатный commit; настоящий переход покрыт fixture."
      ],
      "expected_commit_message": "feat: Обновить локальный runtime Kit управляемым установщиком",
      "context_pack": {
        "documents": [
          {
            "path": "packages/workflow-kit/docs/modules/workflow-kit-package.md",
            "required": false
          }
        ],
        "include_last_completed_task": false,
        "dependency_task_ids": []
      },
      "actual_files": [
        "docs/planning/parallel-kit-upgrade.md",
        "package-lock.json",
        "packages/workflow-kit/package.json",
        "packages/workflow-kit/src/lib/common.mjs",
        "packages/workflow-kit/src/lib/installer.mjs",
        "tests/workflow-kit-upgrade.test.mjs"
      ]
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "parallel-chat-execution-20261009",
        "task_id": "T010",
        "role": "implementation"
      },
      "dependencies": [
        "T009"
      ],
      "functional_paths": [
        "tests/electron-smoke.mjs",
        "tests/parallel-execution.test.mjs",
        "tests/parallel-execution-smoke-fixture.cjs",
        "packages/workflow-kit/scripts/check-parallel-execution-fixture.mjs",
        "src/main.mjs",
        "packages/workflow-kit/package.json",
        "src/context-inputs.mjs",
        "src/context-session.mjs",
        "src/execution-projection.mjs",
        "src/executor-session.mjs",
        "src/page-state-bridge.mjs",
        "src/parallel-execution.mjs",
        "src/parallel-kit.mjs",
        "src/session-runtime.mjs",
        "src/ui/sidebar.mjs",
        "src/workspace-readiness.mjs",
        "src/workspace-setup.mjs",
        "tests/context-session.test.mjs",
        "tests/page-state.test.mjs",
        "tests/parallel-execution-recovery.test.mjs",
        "tests/workspace-readiness.test.mjs"
      ],
      "documentation_paths": [
        "docs/planning/parallel-execution-spec.md",
        "docs/planning/parallel-regression.md"
      ],
      "verification_ids": [
        "kit-check",
        "unit-all",
        "electron-smoke"
      ],
      "id": "T010",
      "title": "Сквозная регрессия готового сценария",
      "why": "подтвердить путь через реальные обработчики до пользовательской приёмки.",
      "acceptance_criteria": [
        "Settings → сессия → план → исполнители → main проверяется через реальные IPC TEST FIXTURE.",
        "Две задачи имеют разные worktree; main не меняется до интеграции; третья видит оба результата.",
        "Fixture требует реальную зависимость worktree; NEEDS_SETUP/штатная подготовка проверены. Конфликт проходит исправление через основной чат, повтор проверок и ровно один merge-коммит/DONE.",
        "Проверены snapshot/legacy/лимиты/последовательный fallback и запрет второй записи main.",
        "Клик по сессиям сохраняет их работу; показываются состояния, время, ошибки, обе темы и доступные названия.",
        "Регрессия Review/AutoPlan, доставка контекста, план и Sidebar API не нарушены.",
        "Будущий detach не заблокирован владением сессии главным окном; сама функция detach отсутствует.",
        "Fixture-успех явно отделён от живого ChatGPT, чистой ОС и native Windows.",
        "Новая fixture подключена к npm run check пакета и реально выполняется в kit-check; успешный код без её запуска не считается проверкой."
      ],
      "expected_commit_message": "test: Сквозная регрессия готового сценария",
      "context_pack": {
        "documents": [],
        "include_last_completed_task": false,
        "dependency_task_ids": []
      },
      "actual_files": [
        "docs/planning/parallel-regression.md",
        "packages/workflow-kit/package.json",
        "packages/workflow-kit/scripts/check-parallel-execution-fixture.mjs",
        "src/context-inputs.mjs",
        "src/context-session.mjs",
        "src/execution-projection.mjs",
        "src/executor-session.mjs",
        "src/main.mjs",
        "src/page-state-bridge.mjs",
        "src/parallel-execution.mjs",
        "src/parallel-kit.mjs",
        "src/session-runtime.mjs",
        "src/ui/sidebar.mjs",
        "src/workspace-readiness.mjs",
        "src/workspace-setup.mjs",
        "tests/context-session.test.mjs",
        "tests/electron-smoke.mjs",
        "tests/page-state.test.mjs",
        "tests/parallel-execution-recovery.test.mjs",
        "tests/parallel-execution-smoke-fixture.cjs",
        "tests/parallel-execution.test.mjs",
        "tests/workspace-readiness.test.mjs"
      ]
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "parallel-chat-execution-20261009",
        "task_id": "T011",
        "role": "implementation"
      },
      "dependencies": [
        "T010"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/planning/parallel-execution-spec.md",
        "docs/planning/parallel-acceptance.md"
      ],
      "verification_ids": [],
      "id": "T011",
      "title": "Подготовить пользовательскую приёмку нового выпуска",
      "why": "Живая приёмка проводится пользователем после установки нового выпуска, а не до сборки.",
      "acceptance_criteria": [
        "Подготовлен сценарий проверки реальных Chat/Work, параллельных исполнителей, последовательного fallback и восстановления на установленном выпуске.",
        "Живая приёмка и её результаты остаются открытыми до установки выпуска; fixtures не подменяют пользовательскую проверку.",
        "Агент не управляет окнами, мышью и клавиатурой пользователя. Native Windows и чистая установка не объявлены проверенными без фактического результата.",
        "После задач выпуска план READY_FOR_ACCEPTANCE; закрытие только после прямой приёмки пользователем."
      ],
      "expected_commit_message": "docs: подготовить приёмку нового выпуска",
      "context_pack": {
        "documents": [],
        "include_last_completed_task": false,
        "dependency_task_ids": []
      },
      "actual_files": [
        "docs/planning/parallel-acceptance.md"
      ]
    },
    {
      "id": "T012",
      "title": "Подготовить новую версию приложения к выпуску",
      "why": "Подготовить новую версию приложения к выпуску",
      "dependencies": [
        "T011"
      ],
      "functional_paths": [
        "package.json",
        "package-lock.json",
        ".harness/workflow.json",
        "tools/codex-app-server-mcp/codex-tools.lock.json"
      ],
      "documentation_paths": [
        "docs/planning/parallel-execution-spec.md",
        "docs/planning/parallel-release-preparation.md"
      ],
      "verification_ids": [
        "unit-all",
        "electron-smoke",
        "codex-tools-live",
        "kit-check"
      ],
      "verification_kind": "code",
      "acceptance_criteria": [
        "Выбрана следующая свободная версия X.Y.Z; package.json и lock согласованы.",
        "Через config:apply актуализированы evidence paired-release/release-installed/github-release с новой версией приложения и фактической версией Kit.",
        "Все обязательные проверки исходников пройдены до DOCS; сборка не запускается в этой задаче."
      ],
      "expected_commit_message": "chore: подготовить версию приложения к выпуску",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "parallel-chat-execution-20261009",
        "task_id": "T012",
        "role": "implementation"
      },
      "actual_files": [
        "docs/planning/parallel-release-preparation.md",
        "package-lock.json",
        "package.json",
        "tools/codex-app-server-mcp/codex-tools.lock.json"
      ]
    },
    {
      "id": "DOCS",
      "title": "Актуализация всех документов проекта",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "parallel-chat-execution-20261009",
        "task_id": "DOCS",
        "role": "implementation",
        "iteration": 1
      },
      "why": "Перед выпуском сверить README, OVERVIEW и действующие контракты модулей с результатом; обновить устаревшее.",
      "dependencies": [
        "T001",
        "T002",
        "T003",
        "T004",
        "T005",
        "T006",
        "T007",
        "T008",
        "T009",
        "T010",
        "T011",
        "T012"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/architecture/OVERVIEW.md",
        "docs/planning/parallel-execution-spec.md",
        "packages/workflow-kit/src/templates/PLAN.md",
        "packages/workflow-kit/src/templates/SPEC.md",
        "docs/modules/release.md",
        "README.md",
        "docs/modules/auto-plan.md",
        "docs/modules/chatgpt-dom-compatibility.md",
        "docs/modules/chromium-diagnostics.md",
        "docs/modules/codex-app-server-executor.md",
        "docs/modules/context-delivery.md",
        "docs/modules/first-run-onboarding.md",
        "docs/modules/plan-review.md",
        "docs/modules/plan-view.md",
        "docs/modules/project-archive.md",
        "docs/modules/project-doctor.md",
        "docs/modules/runtime-lifecycle.md",
        "docs/modules/session-opening-performance.md",
        "docs/modules/workflow-kit-recovery.md",
        "docs/modules/workspace-sessions.md",
        "docs/modules/workspace-setup.md",
        "docs/modules/workspace-sidebar-ui.md",
        "docs/planning/parallel-execution-plan-draft.md",
        "docs/planning/technical-audit-20261008.md",
        "docs/planning/technical-audit-findings-lifecycle.md",
        "docs/planning/technical-audit-findings-summary.md",
        "docs/planning/technical-audit-findings-unused.md",
        "docs/planning/technical-audit-findings.md",
        "packages/workflow-kit/docs/modules/workflow-kit-package.md",
        "docs/planning/parallel-integration.md",
        "docs/planning/live-session-runtime.md",
        "docs/planning/parallel-dispatch.md",
        "docs/planning/parallel-ui.md",
        "docs/planning/parallel-recovery.md",
        "docs/planning/parallel-kit-upgrade.md",
        "docs/planning/parallel-regression.md",
        "docs/planning/parallel-acceptance.md",
        "docs/planning/parallel-release-preparation.md",
        "docs/modules/parallel-execution-acceptance.md",
        "docs/modules/parallel-execution.md",
        "docs/modules/session-runtime.md",
        "docs/modules/technical-audit-followups.md",
        "packages/workflow-kit/README.md",
        "packages/workflow-kit/docs/modules/parallel-assignments.md"
      ],
      "acceptance_criteria": [
        "Документы описывают текущий результат, существенное из выпущенных рабочих спецификаций перенесено в контракты модулей; история остаётся в Git.",
        "Сверены все документы проекта и Kit, включая README, обзор и контракты модулей; изменены только нуждающиеся в актуализации.",
        "Контракты и инструкции отражают готовую реализацию и выпуск; живая пользовательская приёмка остаётся после установки."
      ],
      "verification_ids": [],
      "expected_commit_message": "docs: актуализировать документацию проекта",
      "actual_files": [
        "README.md",
        "docs/architecture/OVERVIEW.md",
        "docs/modules/auto-plan.md",
        "docs/modules/chromium-diagnostics.md",
        "docs/modules/codex-app-server-executor.md",
        "docs/modules/context-delivery.md",
        "docs/modules/parallel-execution-acceptance.md",
        "docs/modules/parallel-execution.md",
        "docs/modules/plan-review.md",
        "docs/modules/plan-view.md",
        "docs/modules/project-doctor.md",
        "docs/modules/release.md",
        "docs/modules/runtime-lifecycle.md",
        "docs/modules/session-opening-performance.md",
        "docs/modules/session-runtime.md",
        "docs/modules/technical-audit-followups.md",
        "docs/modules/workflow-kit-recovery.md",
        "docs/modules/workspace-sessions.md",
        "docs/modules/workspace-setup.md",
        "docs/modules/workspace-sidebar-ui.md",
        "docs/planning/live-session-runtime.md",
        "docs/planning/parallel-acceptance.md",
        "docs/planning/parallel-dispatch.md",
        "docs/planning/parallel-execution-plan-draft.md",
        "docs/planning/parallel-execution-spec.md",
        "docs/planning/parallel-integration.md",
        "docs/planning/parallel-kit-upgrade.md",
        "docs/planning/parallel-recovery.md",
        "docs/planning/parallel-regression.md",
        "docs/planning/parallel-release-preparation.md",
        "docs/planning/parallel-ui.md",
        "docs/planning/technical-audit-20261008.md",
        "docs/planning/technical-audit-findings-lifecycle.md",
        "docs/planning/technical-audit-findings-summary.md",
        "docs/planning/technical-audit-findings-unused.md",
        "docs/planning/technical-audit-findings.md",
        "packages/workflow-kit/README.md",
        "packages/workflow-kit/docs/modules/parallel-assignments.md",
        "packages/workflow-kit/docs/modules/workflow-kit-package.md"
      ]
    },
    {
      "id": "T013",
      "title": "Собрать парный выпуск macOS и Windows",
      "why": "Собрать парный выпуск macOS и Windows",
      "dependencies": [
        "T012",
        "DOCS"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/planning/parallel-execution-spec.md",
        "docs/modules/release.md"
      ],
      "verification_ids": [
        "paired-release"
      ],
      "verification_kind": "package",
      "acceptance_criteria": [
        "Сборка запускается один раз самой проверкой paired-release при commit задачи; исходники и DOCS уже закоммичены.",
        "Готовы обе платформы, шесть файлов поставки и manifest; sourceCommit указывает на HEAD после DOCS, исходники и bundled Kit сверены.",
        "Корневое приложение обновлено с сохранением identity и действующей подписи."
      ],
      "expected_commit_message": "build: собрать новый парный выпуск",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "parallel-chat-execution-20261009",
        "task_id": "T013",
        "role": "implementation"
      },
      "actual_files": []
    },
    {
      "id": "T014",
      "title": "Установить и проверить готовый выпуск",
      "why": "Установить и проверить готовый выпуск",
      "dependencies": [
        "T013",
        "DOCS"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/planning/parallel-execution-spec.md",
        "docs/modules/release.md"
      ],
      "verification_ids": [
        "release-installed"
      ],
      "verification_kind": "installed",
      "acceptance_criteria": [
        "Готовый staging установлен в /Applications через installMacBundle без пересборки; обе постоянные копии проверены.",
        "Версия, подпись, identity, runtime и поставка совпадают с manifest; настройки и пользовательские данные сохранены.",
        "Пользователю доступна новая версия для живой приёмки после полного перезапуска приложения."
      ],
      "expected_commit_message": "build: установить и проверить выпуск",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "parallel-chat-execution-20261009",
        "task_id": "T014",
        "role": "implementation"
      },
      "actual_files": []
    },
    {
      "id": "T015",
      "title": "Опубликовать исходники и GitHub Release",
      "why": "Опубликовать исходники и GitHub Release",
      "dependencies": [
        "T014",
        "DOCS"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/planning/parallel-execution-spec.md",
        "docs/modules/release.md"
      ],
      "verification_ids": [
        "github-release"
      ],
      "verification_kind": "package",
      "acceptance_criteria": [
        "Пользователь разрешил публикацию: main и тег vX.Y.Z отправлены в текущий репозиторий GitHub штатно с hooks.",
        "Тег указывает на manifest.sourceCommit; GitHub Release содержит шесть готовых assets из поставки, без пересборки.",
        "После финального push коммита задачи проверены remote main, тег и assets; пользователю переданы ссылки и сценарий живой приёмки."
      ],
      "expected_commit_message": "release: опубликовать выпуск на GitHub",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "parallel-chat-execution-20261009",
        "task_id": "T015",
        "role": "implementation"
      },
      "actual_files": []
    },
    {
      "id": "T016",
      "title": "Исправить запуск с сохранённым AutoPlan ON и подготовить версию 0.6.105",
      "why": "Устранить падение при раннем обновлении панели до создания runtime чат-сессии.",
      "dependencies": [
        "T015"
      ],
      "functional_paths": [
        "src/main.mjs",
        "tests/electron-smoke.mjs",
        "package.json",
        "package-lock.json",
        ".harness/workflow.json"
      ],
      "documentation_paths": [
        "docs/modules/auto-plan.md",
        "docs/modules/session-runtime.md",
        "docs/architecture/OVERVIEW.md",
        "README.md",
        "docs/modules/release.md"
      ],
      "verification_ids": [
        "unit-all",
        "electron-smoke",
        "codex-tools-live"
      ],
      "verification_kind": "code",
      "acceptance_criteria": [
        "Обновление панели до создания живой страницы возвращает корректное пустое состояние восстановления и таймера, без ошибки чтения view.",
        "Electron TEST FIXTURE запускает настоящий main.mjs с заранее сохранённым AutoPlan ON, до создания окна; панель и чат открываются, режим остаётся ON.",
        "Проверка воспроизводит прежний сбой на коде без исправления; пользовательские настройки и профиль не используются и не меняются.",
        "Существующие проверки ON/OFF, checkpoint, повторных отправок, Review и параллельных сессий проходят.",
        "Следующая свободная версия 0.6.105 согласована в package.json/lock и evidence конфигурации; до DOCS сборка не запускается."
      ],
      "expected_commit_message": "fix: исправить запуск с сохранённым AutoPlan ON",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "parallel-chat-execution-20261009",
        "task_id": "T016",
        "role": "implementation"
      },
      "actual_files": [
        "src/main.mjs",
        "tests/electron-smoke.mjs",
        "package.json",
        "package-lock.json"
      ]
    },
    {
      "id": "DOCS-2",
      "title": "Актуализация всех документов проекта",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "parallel-chat-execution-20261009",
        "task_id": "DOCS-2",
        "role": "implementation",
        "iteration": 2
      },
      "why": "Перед выпуском сверить README, OVERVIEW и действующие контракты модулей с результатом; обновить устаревшее.",
      "dependencies": [
        "T016"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/architecture/OVERVIEW.md",
        "docs/modules/auto-plan.md",
        "docs/modules/session-runtime.md",
        "README.md",
        "docs/modules/release.md"
      ],
      "acceptance_criteria": [
        "Документы описывают текущий результат, существенное из выпущенных рабочих спецификаций перенесено в контракты модулей; история остаётся в Git."
      ],
      "verification_ids": [],
      "expected_commit_message": "docs: актуализировать документацию проекта",
      "actual_files": [
        "README.md",
        "docs/architecture/OVERVIEW.md",
        "docs/modules/auto-plan.md",
        "docs/modules/release.md",
        "docs/modules/session-runtime.md"
      ]
    },
    {
      "id": "T017",
      "title": "Собрать исправленный парный выпуск 0.6.105",
      "why": "Собрать исправленный парный выпуск 0.6.105",
      "dependencies": [
        "T016",
        "DOCS-2"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/modules/auto-plan.md",
        "docs/modules/release.md"
      ],
      "verification_ids": [
        "paired-release"
      ],
      "verification_kind": "package",
      "acceptance_criteria": [
        "DOCS нового раунда завершена; paired-release выполняет сборку один раз при коммите, готовит шесть assets и manifest с sourceCommit после DOCS; корневой app сохраняет identity и действующую подпись."
      ],
      "expected_commit_message": "build: собрать исправленный выпуск 0.6.105",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "parallel-chat-execution-20261009",
        "task_id": "T017",
        "role": "implementation"
      },
      "actual_files": []
    },
    {
      "id": "T018",
      "title": "Установить и проверить выпуск 0.6.105",
      "why": "Установить и проверить выпуск 0.6.105",
      "dependencies": [
        "T017",
        "DOCS-2"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/modules/auto-plan.md",
        "docs/modules/release.md"
      ],
      "verification_ids": [
        "release-installed"
      ],
      "verification_kind": "installed",
      "acceptance_criteria": [
        "Готовый staging установлен в /Applications через installMacBundle без пересборки; обе постоянные копии, identity, подпись и поставка проверены; профиль и настройки сохранены."
      ],
      "expected_commit_message": "build: установить исправленный выпуск 0.6.105",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "parallel-chat-execution-20261009",
        "task_id": "T018",
        "role": "implementation"
      },
      "actual_files": []
    },
    {
      "id": "T019",
      "title": "Опубликовать выпуск 0.6.105 и исходники на GitHub",
      "why": "Опубликовать выпуск 0.6.105 и исходники на GitHub",
      "dependencies": [
        "T018",
        "DOCS-2"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/modules/auto-plan.md",
        "docs/modules/release.md"
      ],
      "verification_ids": [
        "github-release"
      ],
      "verification_kind": "package",
      "acceptance_criteria": [
        "По прямому поручению пользователя опубликованы main и тег v0.6.105 на manifest.sourceCommit; GitHub Release содержит шесть готовых assets; после финального push коммита задачи remote main, тег и assets проверены; живая приёмка и закрытие плана остаются за пользователем."
      ],
      "expected_commit_message": "release: опубликовать исправленный выпуск 0.6.105",
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "parallel-chat-execution-20261009",
        "task_id": "T019",
        "role": "implementation"
      }
    }
  ],
  "blocked_reason": null,
  "user_decisions": [
    {
      "id": "review-publish-before-execution",
      "text": "Разрешены Review и публикация согласованной пары. Выполнение задач и выпуск — только по отдельному поручению пользователя."
    },
    {
      "id": "91930bcf-f6fe-4b71-a7b0-e4383d9cc2a4",
      "text": "Пользователь согласовал требования и поручил Review с публикацией согласованной пары через Kit. Публикация плана не разрешает выполнение задач или выпуск; отдельное поручение реализации ещё требуется.",
      "recorded_at": "2026-10-09T07:57:39.502Z"
    },
    {
      "id": "execution-and-release-authorized-20261009",
      "text": "Пользователь поручил начать выполнение текущего плана и добавить стандартный выпуск: актуализацию всей документации, сборку, установку, публикацию нового релиза и репозитория на GitHub. Это последующее разрешение выполнения и выпуска; живую приёмку проводить на установленном выпуске."
    }
  ]
}
```
<!-- workflow-state:end -->

## Состояние

Execution Scope Status: ACTIVE
Delivery Status: IN_PROGRESS
Scope: parallel-chat-execution-20261009
Current Task: нет
Revision: 1588

## Цель

Реализовать опциональное параллельное выполнение плана через чат-сессии Web Pilot и отдельные worktree с проверенной последовательной интеграцией в main.

## Критерии приёмки

- Снимок разрешения и лимита фиксируется при новой основной сессии; существующее выполнение не меняется от Settings.
- Параллельность выбирается при планировании только при пользе; иначе сохраняется основной последовательный процесс.
- Исполнители работают в отдельных chat/worktree, слияния в main сериализованы и проверены; основной план сохраняется.
- Живые сессии видны и доступны; архитектура независима от окна без реализации detach.
- Результаты сбоев/перезапуска не дублируются, пользовательские и автоматические проверки разграничены.

## Микрозадачи

- [DONE] T001: Модель и валидация параллельного плана — Завершено
  - Git Commit: [DONE] feat: Модель и валидация параллельного плана
  - Reference: parallel-chat-execution-20261009 / T001 / implementation
  - Файлы: packages/workflow-kit/src/schemas/plan.schema.json, packages/workflow-kit/src/lib/plan.mjs, packages/workflow-kit/src/lib/simple-workflow.mjs, packages/workflow-kit/src/lib/extend-plan.mjs, packages/workflow-kit/src/lib/task-update.mjs, packages/workflow-kit/src/lib/plan-review.mjs, packages/workflow-kit/src/lib/recovery.mjs, packages/workflow-kit/scripts/check-parallel-plan-fixture.mjs, packages/workflow-kit/package.json, packages/workflow-kit/src/lib/actions.mjs, docs/planning/parallel-execution-spec.md, packages/workflow-kit/src/templates/PLAN.md, packages/workflow-kit/src/templates/SPEC.md, docs/planning/parallel-execution-plan-draft.md
- [DONE] T002: Settings и неизменяемый снимок сессии — Завершено
  - Git Commit: [DONE] feat: Settings и неизменяемый снимок сессии
  - Reference: parallel-chat-execution-20261009 / T002 / implementation
  - Файлы: src/ui/settings-panel.mjs, src/ui/index.html, src/main.mjs, src/preload.cjs, src/workspace-session.mjs, src/context-session.mjs, tests/workspace-session.test.mjs, tests/settings-parallel-execution.test.mjs, src/parallel-settings.mjs, tests/electron-smoke.mjs, docs/planning/parallel-execution-spec.md, docs/planning/parallel-execution-plan-draft.md
- [DONE] T003: Worktree и локальное назначение Kit — Завершено
  - Git Commit: [DONE] feat: Worktree и локальное назначение Kit
  - Reference: parallel-chat-execution-20261009 / T003 / implementation
  - Файлы: packages/workflow-kit/src/cli.mjs, packages/workflow-kit/src/lib/git.mjs, packages/workflow-kit/src/lib/plan.mjs, packages/workflow-kit/src/lib/transaction.mjs, packages/workflow-kit/src/lib/validate.mjs, packages/workflow-kit/src/lib/git-hooks.mjs, packages/workflow-kit/src/lib/recovery.mjs, packages/workflow-kit/src/lib/task-assignment.mjs, packages/workflow-kit/src/lib/command-help.mjs, packages/workflow-kit/scripts/check-task-assignment-fixture.mjs, packages/workflow-kit/package.json, packages/workflow-kit/src/lib/actions.mjs, packages/workflow-kit/src/schemas/plan.schema.json, docs/planning/parallel-execution-spec.md
- [DONE] T004: Управляемое слияние и доказательства интеграции — Завершено
  - Git Commit: [DONE] feat: Управляемое слияние и доказательства интеграции
  - Reference: parallel-chat-execution-20261009 / T004 / implementation
  - Файлы: packages/workflow-kit/src/lib/transaction.mjs, packages/workflow-kit/src/lib/validate.mjs, packages/workflow-kit/src/lib/git.mjs, packages/workflow-kit/src/lib/git-hooks.mjs, packages/workflow-kit/src/lib/plan.mjs, packages/workflow-kit/src/lib/task-integration.mjs, packages/workflow-kit/src/lib/command-help.mjs, packages/workflow-kit/src/cli.mjs, packages/workflow-kit/scripts/check-task-integration-fixture.mjs, packages/workflow-kit/package.json, docs/planning/parallel-execution-spec.md, docs/planning/parallel-integration.md
- [DONE] T005: Несколько живых сессий без привязки к окну — Завершено
  - Git Commit: [DONE] feat: Несколько живых сессий без привязки к окну
  - Reference: parallel-chat-execution-20261009 / T005 / implementation
  - Файлы: src/main.mjs, src/context-session.mjs, src/page-state.mjs, src/page-state-bridge.mjs, src/workspace-session.mjs, src/session-runtime.mjs, tests/session-runtime.test.mjs, tests/context-session.test.mjs, tests/page-state.test.mjs, tests/electron-smoke.mjs, tests/workspace-session.test.mjs, docs/planning/parallel-execution-spec.md, docs/planning/live-session-runtime.md
- [DONE] T006: Выдача задач и последовательная очередь main — Завершено
  - Git Commit: [DONE] feat: Выдача задач и последовательная очередь main
  - Reference: parallel-chat-execution-20261009 / T006 / implementation
  - Файлы: src/parallel-execution.mjs, src/main.mjs, src/auto-plan.mjs, src/auto-plan-state.mjs, src/automation-send-state.mjs, src/context-session.mjs, src/plan-monitor.mjs, tests/parallel-execution.test.mjs, tests/auto-plan.test.mjs, src/preload.cjs, packages/workflow-kit/scripts/check-parallel-plan-fixture.mjs, packages/workflow-kit/src/lib/plan.mjs, packages/workflow-kit/src/lib/simple-workflow.mjs, packages/workflow-kit/src/schemas/plan.schema.json, src/executor-session.mjs, src/parallel-kit.mjs, src/project-input-watch.mjs, src/session-plans.mjs, src/workspace-session.mjs, tests/codex-app-server-mcp.test.mjs, tests/workspace-session.test.mjs, tools/codex-app-server-mcp/server.py, docs/planning/parallel-execution-spec.md, docs/planning/parallel-dispatch.md
- [DONE] T007: Дерево исполнителей, состояния и время — Завершено
  - Git Commit: [DONE] feat: Дерево исполнителей, состояния и время
  - Reference: parallel-chat-execution-20261009 / T007 / implementation
  - Файлы: src/ui/sidebar.mjs, src/ui/index.html, src/ui/progress.mjs, src/main.mjs, src/workspace-session.mjs, src/agent-timer.mjs, src/plan-monitor.mjs, tests/parallel-execution-ui.test.mjs, tests/agent-timer.test.mjs, src/execution-projection.mjs, src/executor-session.mjs, src/parallel-execution.mjs, docs/planning/parallel-execution-spec.md, docs/planning/parallel-ui.md
- [DONE] T008: Восстановление назначений и сессий — Завершено
  - Git Commit: [DONE] feat: Восстановление назначений и сессий
  - Reference: parallel-chat-execution-20261009 / T008 / implementation
  - Файлы: src/parallel-execution.mjs, src/conversation-recovery.mjs, src/automation-send-state.mjs, src/auto-plan-state.mjs, src/session-runtime.mjs, src/workspace-session.mjs, src/main.mjs, packages/workflow-kit/src/lib/task-assignment.mjs, packages/workflow-kit/src/lib/task-integration.mjs, packages/workflow-kit/src/lib/actions.mjs, tests/parallel-execution-recovery.test.mjs, tests/conversation-recovery.test.mjs, packages/workflow-kit/scripts/check-task-assignment-fixture.mjs, packages/workflow-kit/scripts/check-task-integration-fixture.mjs, src/execution-projection.mjs, src/parallel-kit.mjs, src/preload.cjs, src/ui/index.html, src/ui/sidebar.mjs, docs/planning/parallel-execution-spec.md, docs/planning/parallel-recovery.md
- [DONE] T009: Обновить локальный runtime Kit управляемым установщиком — Завершено
  - Git Commit: [DONE] feat: Обновить локальный runtime Kit управляемым установщиком
  - Reference: parallel-chat-execution-20261009 / T009 / implementation
  - Файлы: packages/workflow-kit/package.json, packages/workflow-kit/src/lib/common.mjs, packages/workflow-kit/src/install.mjs, tests/workflow-kit-upgrade.test.mjs, package-lock.json, packages/workflow-kit/src/lib/installer.mjs, docs/planning/parallel-execution-spec.md, docs/planning/parallel-kit-upgrade.md
- [DONE] T010: Сквозная регрессия готового сценария — Завершено
  - Git Commit: [DONE] test: Сквозная регрессия готового сценария
  - Reference: parallel-chat-execution-20261009 / T010 / implementation
  - Файлы: tests/electron-smoke.mjs, tests/parallel-execution.test.mjs, tests/parallel-execution-smoke-fixture.cjs, packages/workflow-kit/scripts/check-parallel-execution-fixture.mjs, src/main.mjs, packages/workflow-kit/package.json, src/context-inputs.mjs, src/context-session.mjs, src/execution-projection.mjs, src/executor-session.mjs, src/page-state-bridge.mjs, src/parallel-execution.mjs, src/parallel-kit.mjs, src/session-runtime.mjs, src/ui/sidebar.mjs, src/workspace-readiness.mjs, src/workspace-setup.mjs, tests/context-session.test.mjs, tests/page-state.test.mjs, tests/parallel-execution-recovery.test.mjs, tests/workspace-readiness.test.mjs, docs/planning/parallel-execution-spec.md, docs/planning/parallel-regression.md
- [DONE] T011: Подготовить пользовательскую приёмку нового выпуска — Завершено
  - Git Commit: [DONE] docs: подготовить приёмку нового выпуска
  - Reference: parallel-chat-execution-20261009 / T011 / implementation
  - Файлы: docs/planning/parallel-execution-spec.md, docs/planning/parallel-acceptance.md
- [DONE] T012: Подготовить новую версию приложения к выпуску — Завершено
  - Git Commit: [DONE] chore: подготовить версию приложения к выпуску
  - Reference: parallel-chat-execution-20261009 / T012 / implementation
  - Файлы: package.json, package-lock.json, .harness/workflow.json, tools/codex-app-server-mcp/codex-tools.lock.json, docs/planning/parallel-execution-spec.md, docs/planning/parallel-release-preparation.md
- [DONE] DOCS: Актуализация всех документов проекта — Завершено
  - Git Commit: [DONE] docs: актуализировать документацию проекта
  - Reference: parallel-chat-execution-20261009 / DOCS / implementation
  - Файлы: docs/architecture/OVERVIEW.md, docs/planning/parallel-execution-spec.md, packages/workflow-kit/src/templates/PLAN.md, packages/workflow-kit/src/templates/SPEC.md, docs/modules/release.md, README.md, docs/modules/auto-plan.md, docs/modules/chatgpt-dom-compatibility.md, docs/modules/chromium-diagnostics.md, docs/modules/codex-app-server-executor.md, docs/modules/context-delivery.md, docs/modules/first-run-onboarding.md, docs/modules/plan-review.md, docs/modules/plan-view.md, docs/modules/project-archive.md, docs/modules/project-doctor.md, docs/modules/runtime-lifecycle.md, docs/modules/session-opening-performance.md, docs/modules/workflow-kit-recovery.md, docs/modules/workspace-sessions.md, docs/modules/workspace-setup.md, docs/modules/workspace-sidebar-ui.md, docs/planning/parallel-execution-plan-draft.md, docs/planning/technical-audit-20261008.md, docs/planning/technical-audit-findings-lifecycle.md, docs/planning/technical-audit-findings-summary.md, docs/planning/technical-audit-findings-unused.md, docs/planning/technical-audit-findings.md, packages/workflow-kit/docs/modules/workflow-kit-package.md, docs/planning/parallel-integration.md, docs/planning/live-session-runtime.md, docs/planning/parallel-dispatch.md, docs/planning/parallel-ui.md, docs/planning/parallel-recovery.md, docs/planning/parallel-kit-upgrade.md, docs/planning/parallel-regression.md, docs/planning/parallel-acceptance.md, docs/planning/parallel-release-preparation.md, docs/modules/parallel-execution-acceptance.md, docs/modules/parallel-execution.md, docs/modules/session-runtime.md, docs/modules/technical-audit-followups.md, packages/workflow-kit/README.md, packages/workflow-kit/docs/modules/parallel-assignments.md
- [DONE] T013: Собрать парный выпуск macOS и Windows — Завершено
  - Git Commit: [DONE] build: собрать новый парный выпуск
  - Reference: parallel-chat-execution-20261009 / T013 / implementation
  - Файлы: docs/planning/parallel-execution-spec.md, docs/modules/release.md
- [DONE] T014: Установить и проверить готовый выпуск — Завершено
  - Git Commit: [DONE] build: установить и проверить выпуск
  - Reference: parallel-chat-execution-20261009 / T014 / implementation
  - Файлы: docs/planning/parallel-execution-spec.md, docs/modules/release.md
- [DONE] T015: Опубликовать исходники и GitHub Release — Завершено
  - Git Commit: [DONE] release: опубликовать выпуск на GitHub
  - Reference: parallel-chat-execution-20261009 / T015 / implementation
  - Файлы: docs/planning/parallel-execution-spec.md, docs/modules/release.md
- [DONE] T016: Исправить запуск с сохранённым AutoPlan ON и подготовить версию 0.6.105 — Завершено
  - Git Commit: [DONE] fix: исправить запуск с сохранённым AutoPlan ON
  - Reference: parallel-chat-execution-20261009 / T016 / implementation
  - Файлы: src/main.mjs, tests/electron-smoke.mjs, package.json, package-lock.json, .harness/workflow.json, docs/modules/auto-plan.md, docs/modules/session-runtime.md, docs/architecture/OVERVIEW.md, README.md, docs/modules/release.md
- [DONE] DOCS-2: Актуализация всех документов проекта — Завершено
  - Git Commit: [DONE] docs: актуализировать документацию проекта
  - Reference: parallel-chat-execution-20261009 / DOCS-2 / implementation
  - Файлы: docs/architecture/OVERVIEW.md, docs/modules/auto-plan.md, docs/modules/session-runtime.md, README.md, docs/modules/release.md
- [DONE] T017: Собрать исправленный парный выпуск 0.6.105 — Завершено
  - Git Commit: [DONE] build: собрать исправленный выпуск 0.6.105
  - Reference: parallel-chat-execution-20261009 / T017 / implementation
  - Файлы: docs/modules/auto-plan.md, docs/modules/release.md
- [DONE] T018: Установить и проверить выпуск 0.6.105 — Завершено
  - Git Commit: [DONE] build: установить исправленный выпуск 0.6.105
  - Reference: parallel-chat-execution-20261009 / T018 / implementation
  - Файлы: docs/modules/auto-plan.md, docs/modules/release.md
- [TODO] T019: Опубликовать выпуск 0.6.105 и исходники на GitHub — Ожидает
  - Git Commit: [PENDING] release: опубликовать исправленный выпуск 0.6.105
  - Reference: parallel-chat-execution-20261009 / T019 / implementation
  - Файлы: docs/modules/auto-plan.md, docs/modules/release.md

## Context Pack For This Cycle

- docs/architecture/OVERVIEW.md
- docs/planning/parallel-execution-spec.md
- docs/modules/session-runtime.md

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
