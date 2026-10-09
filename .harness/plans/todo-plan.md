# Активный план — Project Web Pilot

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 1533,
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
      "packages/workflow-kit/scripts/check-parallel-execution-fixture.mjs"
    ],
    "documentation_paths": [
      "docs/planning/parallel-execution-spec.md",
      "docs/planning/parallel-execution-plan-draft.md",
      "packages/workflow-kit/src/templates/PLAN.md",
      "packages/workflow-kit/src/templates/SPEC.md",
      "docs/architecture/OVERVIEW.md"
    ]
  },
  "baseline_commit": "39507e5655e81395bbcbeab0bd7b00572e4a746b",
  "current_task_id": null,
  "context_pack": {
    "documents": [
      {
        "path": "docs/planning/parallel-execution-spec.md",
        "required": true,
        "revision": "WORKTREE"
      },
      {
        "path": "docs/planning/parallel-execution-plan-draft.md",
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
        "packages/workflow-kit/package.json"
      ],
      "documentation_paths": [
        "docs/planning/parallel-execution-spec.md",
        "packages/workflow-kit/src/templates/PLAN.md",
        "packages/workflow-kit/src/templates/SPEC.md"
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
      }
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
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
        "tests/settings-parallel-execution.test.mjs"
      ],
      "documentation_paths": [
        "docs/planning/parallel-execution-spec.md"
      ],
      "verification_ids": [
        "unit-all"
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
      }
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
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
        "packages/workflow-kit/package.json"
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
      }
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
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
        "docs/planning/parallel-execution-spec.md"
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
      }
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
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
        "tests/page-state.test.mjs"
      ],
      "documentation_paths": [
        "docs/planning/parallel-execution-spec.md"
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
      }
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
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
        "src/preload.cjs"
      ],
      "documentation_paths": [
        "docs/planning/parallel-execution-spec.md"
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
      }
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
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
        "tests/agent-timer.test.mjs"
      ],
      "documentation_paths": [
        "docs/planning/parallel-execution-spec.md"
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
      }
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
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
        "packages/workflow-kit/scripts/check-task-integration-fixture.mjs"
      ],
      "documentation_paths": [
        "docs/planning/parallel-execution-spec.md"
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
      }
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
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
        "tests/workflow-kit-upgrade.test.mjs"
      ],
      "documentation_paths": [
        "docs/planning/parallel-execution-spec.md"
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
      }
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
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
        "packages/workflow-kit/package.json"
      ],
      "documentation_paths": [
        "docs/planning/parallel-execution-spec.md"
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
      }
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
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
        "docs/planning/parallel-execution-spec.md"
      ],
      "verification_ids": [],
      "id": "T011",
      "title": "Пользовательская приёмка прототипа",
      "why": "Приёмка реальных чатов пользователем.",
      "acceptance_criteria": [
        "Записаны только фактически проверенные сценарии и платформа.",
        "Сбои разобраны, изменения объёма согласованы, ограничения названы.",
        "Агент не нажимает мышь/клавиши и не управляет окнами; fixtures не подменяют пользовательскую приёмку.",
        "Native Windows/чистая установка не объявлены проверенными без реального результата.",
        "После всех DONE план READY_FOR_ACCEPTANCE; закрытие только по прямой приёмке пользователя."
      ],
      "expected_commit_message": "docs: Пользовательская приёмка прототипа",
      "context_pack": {
        "documents": [],
        "include_last_completed_task": false,
        "dependency_task_ids": []
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
Revision: 1533

## Цель

Реализовать опциональное параллельное выполнение плана через чат-сессии Web Pilot и отдельные worktree с проверенной последовательной интеграцией в main.

## Критерии приёмки

- Снимок разрешения и лимита фиксируется при новой основной сессии; существующее выполнение не меняется от Settings.
- Параллельность выбирается при планировании только при пользе; иначе сохраняется основной последовательный процесс.
- Исполнители работают в отдельных chat/worktree, слияния в main сериализованы и проверены; основной план сохраняется.
- Живые сессии видны и доступны; архитектура независима от окна без реализации detach.
- Результаты сбоев/перезапуска не дублируются, пользовательские и автоматические проверки разграничены.

## Микрозадачи

- [TODO] T001: Модель и валидация параллельного плана — Ожидает
  - Git Commit: [PENDING] feat: Модель и валидация параллельного плана
  - Reference: parallel-chat-execution-20261009 / T001 / implementation
  - Файлы: packages/workflow-kit/src/schemas/plan.schema.json, packages/workflow-kit/src/lib/plan.mjs, packages/workflow-kit/src/lib/simple-workflow.mjs, packages/workflow-kit/src/lib/extend-plan.mjs, packages/workflow-kit/src/lib/task-update.mjs, packages/workflow-kit/src/lib/plan-review.mjs, packages/workflow-kit/src/lib/recovery.mjs, packages/workflow-kit/scripts/check-parallel-plan-fixture.mjs, packages/workflow-kit/package.json, docs/planning/parallel-execution-spec.md, packages/workflow-kit/src/templates/PLAN.md, packages/workflow-kit/src/templates/SPEC.md
- [TODO] T002: Settings и неизменяемый снимок сессии — Ожидает
  - Git Commit: [PENDING] feat: Settings и неизменяемый снимок сессии
  - Reference: parallel-chat-execution-20261009 / T002 / implementation
  - Файлы: src/ui/settings-panel.mjs, src/ui/index.html, src/main.mjs, src/preload.cjs, src/workspace-session.mjs, src/context-session.mjs, tests/workspace-session.test.mjs, tests/settings-parallel-execution.test.mjs, docs/planning/parallel-execution-spec.md
- [TODO] T003: Worktree и локальное назначение Kit — Ожидает
  - Git Commit: [PENDING] feat: Worktree и локальное назначение Kit
  - Reference: parallel-chat-execution-20261009 / T003 / implementation
  - Файлы: packages/workflow-kit/src/cli.mjs, packages/workflow-kit/src/lib/git.mjs, packages/workflow-kit/src/lib/plan.mjs, packages/workflow-kit/src/lib/transaction.mjs, packages/workflow-kit/src/lib/validate.mjs, packages/workflow-kit/src/lib/git-hooks.mjs, packages/workflow-kit/src/lib/recovery.mjs, packages/workflow-kit/src/lib/task-assignment.mjs, packages/workflow-kit/src/lib/command-help.mjs, packages/workflow-kit/scripts/check-task-assignment-fixture.mjs, packages/workflow-kit/package.json, docs/planning/parallel-execution-spec.md
- [TODO] T004: Управляемое слияние и доказательства интеграции — Ожидает
  - Git Commit: [PENDING] feat: Управляемое слияние и доказательства интеграции
  - Reference: parallel-chat-execution-20261009 / T004 / implementation
  - Файлы: packages/workflow-kit/src/lib/transaction.mjs, packages/workflow-kit/src/lib/validate.mjs, packages/workflow-kit/src/lib/git.mjs, packages/workflow-kit/src/lib/git-hooks.mjs, packages/workflow-kit/src/lib/plan.mjs, packages/workflow-kit/src/lib/task-integration.mjs, packages/workflow-kit/src/lib/command-help.mjs, packages/workflow-kit/src/cli.mjs, packages/workflow-kit/scripts/check-task-integration-fixture.mjs, packages/workflow-kit/package.json, docs/planning/parallel-execution-spec.md
- [TODO] T005: Несколько живых сессий без привязки к окну — Ожидает
  - Git Commit: [PENDING] feat: Несколько живых сессий без привязки к окну
  - Reference: parallel-chat-execution-20261009 / T005 / implementation
  - Файлы: src/main.mjs, src/context-session.mjs, src/page-state.mjs, src/page-state-bridge.mjs, src/workspace-session.mjs, src/session-runtime.mjs, tests/session-runtime.test.mjs, tests/context-session.test.mjs, tests/page-state.test.mjs, docs/planning/parallel-execution-spec.md
- [TODO] T006: Выдача задач и последовательная очередь main — Ожидает
  - Git Commit: [PENDING] feat: Выдача задач и последовательная очередь main
  - Reference: parallel-chat-execution-20261009 / T006 / implementation
  - Файлы: src/parallel-execution.mjs, src/main.mjs, src/auto-plan.mjs, src/auto-plan-state.mjs, src/automation-send-state.mjs, src/context-session.mjs, src/plan-monitor.mjs, tests/parallel-execution.test.mjs, tests/auto-plan.test.mjs, src/preload.cjs, docs/planning/parallel-execution-spec.md
- [TODO] T007: Дерево исполнителей, состояния и время — Ожидает
  - Git Commit: [PENDING] feat: Дерево исполнителей, состояния и время
  - Reference: parallel-chat-execution-20261009 / T007 / implementation
  - Файлы: src/ui/sidebar.mjs, src/ui/index.html, src/ui/progress.mjs, src/main.mjs, src/workspace-session.mjs, src/agent-timer.mjs, src/plan-monitor.mjs, tests/parallel-execution-ui.test.mjs, tests/agent-timer.test.mjs, docs/planning/parallel-execution-spec.md
- [TODO] T008: Восстановление назначений и сессий — Ожидает
  - Git Commit: [PENDING] feat: Восстановление назначений и сессий
  - Reference: parallel-chat-execution-20261009 / T008 / implementation
  - Файлы: src/parallel-execution.mjs, src/conversation-recovery.mjs, src/automation-send-state.mjs, src/auto-plan-state.mjs, src/session-runtime.mjs, src/workspace-session.mjs, src/main.mjs, packages/workflow-kit/src/lib/task-assignment.mjs, packages/workflow-kit/src/lib/task-integration.mjs, packages/workflow-kit/src/lib/actions.mjs, tests/parallel-execution-recovery.test.mjs, tests/conversation-recovery.test.mjs, packages/workflow-kit/scripts/check-task-assignment-fixture.mjs, packages/workflow-kit/scripts/check-task-integration-fixture.mjs, docs/planning/parallel-execution-spec.md
- [TODO] T009: Обновить локальный runtime Kit управляемым установщиком — Ожидает
  - Git Commit: [PENDING] feat: Обновить локальный runtime Kit управляемым установщиком
  - Reference: parallel-chat-execution-20261009 / T009 / implementation
  - Файлы: packages/workflow-kit/package.json, packages/workflow-kit/src/lib/common.mjs, packages/workflow-kit/src/install.mjs, tests/workflow-kit-upgrade.test.mjs, docs/planning/parallel-execution-spec.md
- [TODO] T010: Сквозная регрессия готового сценария — Ожидает
  - Git Commit: [PENDING] test: Сквозная регрессия готового сценария
  - Reference: parallel-chat-execution-20261009 / T010 / implementation
  - Файлы: tests/electron-smoke.mjs, tests/parallel-execution.test.mjs, tests/parallel-execution-smoke-fixture.cjs, packages/workflow-kit/scripts/check-parallel-execution-fixture.mjs, src/main.mjs, packages/workflow-kit/package.json, docs/planning/parallel-execution-spec.md
- [TODO] T011: Пользовательская приёмка прототипа — Ожидает
  - Git Commit: [PENDING] docs: Пользовательская приёмка прототипа
  - Reference: parallel-chat-execution-20261009 / T011 / implementation
  - Файлы: docs/planning/parallel-execution-spec.md

## Context Pack For This Cycle

- docs/planning/parallel-execution-spec.md
- docs/planning/parallel-execution-plan-draft.md
- docs/architecture/OVERVIEW.md

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
