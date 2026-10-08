# Активный план — Project Web Pilot

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 1478,
  "project_id": "cf944136-d1fc-4bd5-9ea0-e46d1fe230e7",
  "project_name": "Project Web Pilot",
  "scope_id": "plan-review-20261008",
  "execution_scope_status": "ACTIVE",
  "delivery_status": "IN_PROGRESS",
  "objective": "Встроить согласование новой спецификации и to-do plan с Claude CLI в Workflow Kit и Web Pilot: независимая зелёная кнопка Review, автоматический успешный цикл, вопрос пользователю при проблеме и очистка при начале выполнения.",
  "acceptance_criteria": [
    "Встроить согласование новой спецификации и to-do plan с Claude CLI в Workflow Kit и Web Pilot: независимая зелёная кнопка Review, автоматический успешный цикл, вопрос пользователю при проблеме и очистка при начале выполнения.",
    "Все четыре комбинации Review/AutoPlan выполняют согласованный сценарий; дополнительного разрешения исполнения нет.",
    "При существенном споре/ошибке основной агент спрашивает пользователя; первая начатая задача очищает только материалы своего ревью.",
    "Локальный выпуск собран и установлен по Kit; живая и Windows-приёмка имеют отдельные фактические результаты."
  ],
  "approved_scope": {
    "functional_paths": [
      "packages/workflow-kit/src/lib/plan-review.mjs",
      "packages/workflow-kit/src/cli.mjs",
      "packages/workflow-kit/src/lib/command-help.mjs",
      "packages/workflow-kit/src/lib/actions.mjs",
      "packages/workflow-kit/src/lib/simple-workflow.mjs",
      "packages/workflow-kit/src/lib/plan.mjs",
      "packages/workflow-kit/src/lib/recovery.mjs",
      "packages/workflow-kit/src/lib/validate.mjs",
      "packages/workflow-kit/src/lib/transaction.mjs",
      "packages/workflow-kit/src/lib/inspection-inputs.mjs",
      "packages/workflow-kit/src/schemas/plan.schema.json",
      "packages/workflow-kit/scripts/check-plan-review-fixture.mjs",
      "packages/workflow-kit/scripts/check-consumer-contract.mjs",
      "packages/workflow-kit/package.json",
      "packages/workflow-kit/src/lib/claude-review.mjs",
      "src/main.mjs",
      "src/preload.cjs",
      "src/ui/index.html",
      "src/ui/sidebar.mjs",
      "src/plan-review.mjs",
      "src/workspace-session.mjs",
      "src/context-session.mjs",
      "src/context-inputs.mjs",
      "packages/workflow-kit/src/WORKFLOW.md",
      "tests/plan-review.test.mjs",
      "tests/context-session.test.mjs",
      "tests/workspace-session.test.mjs",
      "src/project-input-watch.mjs",
      "src/plan-monitor.mjs",
      "src/auto-plan.mjs",
      "src/auto-plan-state.mjs",
      "src/automation-send-state.mjs",
      "tests/auto-plan.test.mjs",
      "tests/plan-monitor.test.mjs",
      "tests/auto-plan-restart-fixture.cjs",
      "package.json",
      "package-lock.json",
      "packages/workflow-kit/src/lib/common.mjs",
      ".harness/workflow.json",
      "tests/workflow-kit-source.test.mjs",
      "tests/workflow-kit-upgrade.test.mjs",
      "tests/workflow-kit-recovery.test.mjs",
      "scripts/check-installed-release.mjs",
      "scripts/stage-workflow-kit.mjs",
      "tests/electron-smoke.mjs",
      "packages/workflow-kit/src/lib/installer.mjs",
      "release-manifest.json",
      "src/review-continuation.mjs"
    ],
    "documentation_paths": [
      "docs/planning/plan-review.md",
      "docs/planning/plan-review-integration.md",
      "README.md",
      "docs/architecture/OVERVIEW.md",
      "AGENTS.md",
      "docs/modules/plan-review.md",
      "docs/modules/auto-plan.md",
      "docs/modules/plan-view.md",
      "docs/modules/context-delivery.md",
      "docs/modules/workflow-kit-recovery.md",
      "docs/modules/workspace-sidebar-ui.md",
      "docs/modules/codex-app-server-executor.md",
      "docs/modules/runtime-lifecycle.md",
      "docs/modules/release.md",
      "packages/workflow-kit/docs/modules/workflow-kit-package.md",
      "packages/workflow-kit/README.md"
    ]
  },
  "baseline_commit": "9a3397121e0645bb31ce60ee7a3050cea3d9524e",
  "current_task_id": null,
  "context_pack": {
    "documents": [
      {
        "path": "docs/architecture/OVERVIEW.md",
        "required": true,
        "revision": "WORKTREE"
      },
      {
        "path": "docs/planning/plan-review.md",
        "required": true,
        "revision": "WORKTREE"
      },
      {
        "path": "docs/planning/plan-review-integration.md",
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
        "scope_id": "plan-review-20261008",
        "task_id": "T001",
        "role": "implementation"
      },
      "dependencies": [],
      "functional_paths": [
        "packages/workflow-kit/src/lib/plan-review.mjs",
        "packages/workflow-kit/src/cli.mjs",
        "packages/workflow-kit/src/lib/command-help.mjs",
        "packages/workflow-kit/src/lib/actions.mjs",
        "packages/workflow-kit/src/lib/simple-workflow.mjs",
        "packages/workflow-kit/src/lib/plan.mjs",
        "packages/workflow-kit/src/lib/recovery.mjs",
        "packages/workflow-kit/src/lib/validate.mjs",
        "packages/workflow-kit/src/lib/transaction.mjs",
        "packages/workflow-kit/src/lib/inspection-inputs.mjs",
        "packages/workflow-kit/src/schemas/plan.schema.json",
        "packages/workflow-kit/scripts/check-plan-review-fixture.mjs",
        "packages/workflow-kit/scripts/check-consumer-contract.mjs",
        "packages/workflow-kit/package.json"
      ],
      "documentation_paths": [
        "docs/planning/plan-review.md",
        "docs/planning/plan-review-integration.md",
        "packages/workflow-kit/docs/modules/workflow-kit-package.md"
      ],
      "verification_ids": [
        "kit-check",
        "unit-all"
      ],
      "id": "T001",
      "title": "Протокол ревью и публикация согласованного плана в Kit",
      "why": "Согласованные входы должны стать единственным опубликованным планом; случайный прямой путь не обходит Review.",
      "verification_kind": "code",
      "acceptance_criteria": [
        "Opt-in команды подготовки, статуса и публикации имеют help, единую нормализацию пары spec+plan и состояния с SHA/HEAD/revision; выключенный режим сохраняет поведение потребителей.",
        "Проверки под блокировкой Kit покрывают plan:create/scope:create до изменения config; конфликт, спор, отсутствующее подтверждение и подмена входов не создают ACTIVE.",
        "Фикстуры проверяют реальные коммиты согласованных документов/задач, сохранность checks, чужие изменения, повтор/repair; carryover сохраняет явно описанный прежний контракт.",
        "Один state.json хранит политику и стадию checkout; OFF полностью возвращает обычную публикацию даже после спора. review:resolve поддерживает retry, publish, cancel по решению пользователя."
      ],
      "expected_commit_message": "feat: Протокол ревью и публикация согласованного плана в Kit",
      "context_pack": {
        "documents": [
          {
            "path": "packages/workflow-kit/docs/modules/workflow-kit-package.md",
            "required": true
          }
        ],
        "include_last_completed_task": false,
        "dependency_task_ids": []
      },
      "actual_files": [
        "docs/planning/plan-review-integration.md",
        "docs/planning/plan-review.md",
        "packages/workflow-kit/package.json",
        "packages/workflow-kit/scripts/check-plan-review-fixture.mjs",
        "packages/workflow-kit/src/cli.mjs",
        "packages/workflow-kit/src/lib/actions.mjs",
        "packages/workflow-kit/src/lib/command-help.mjs",
        "packages/workflow-kit/src/lib/inspection-inputs.mjs",
        "packages/workflow-kit/src/lib/plan-review.mjs",
        "packages/workflow-kit/src/lib/recovery.mjs",
        "packages/workflow-kit/src/lib/simple-workflow.mjs"
      ]
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "plan-review-20261008",
        "task_id": "T002",
        "role": "implementation"
      },
      "dependencies": [
        "T001"
      ],
      "functional_paths": [
        "packages/workflow-kit/src/lib/claude-review.mjs",
        "packages/workflow-kit/src/lib/plan-review.mjs",
        "packages/workflow-kit/src/cli.mjs",
        "packages/workflow-kit/src/lib/command-help.mjs",
        "packages/workflow-kit/scripts/check-plan-review-fixture.mjs",
        "packages/workflow-kit/package.json"
      ],
      "documentation_paths": [
        "docs/planning/plan-review.md",
        "docs/planning/plan-review-integration.md",
        "packages/workflow-kit/docs/modules/workflow-kit-package.md"
      ],
      "verification_ids": [
        "kit-check",
        "unit-all"
      ],
      "id": "T002",
      "title": "Claude CLI: раунды, resume и запрос помощи пользователю",
      "why": "Основной агент вызывает внешнее ревью через существующий MCP без ручного переноса ответов.",
      "verification_kind": "code",
      "acceptance_criteria": [
        "Два документа и позиция автора передаются Opus 5.5 с high; новая сессия один раз, следующие раунды используют ровно её ID; не более четырёх раундов без нового решения пользователя.",
        "Полные результаты сохраняются; модель/session/exit/schema/SHA проверяются. Таймаут, авторизация, неверный ответ и существенный спор приводят к NEEDS_USER с причиной для вопроса основного агента.",
        "Runner работает в exec session без nohup, молчаливого повтора или смены модели. Подменённый CLI проверяет success/error/timeout/resume; живая приёмка отдельно.",
        "Claude запускается вне operation.lock; короткие изменения состояния защищены. Runner привязывает вердикт к SHA. Память разрешена, свежие решения имеют приоритет."
      ],
      "expected_commit_message": "feat: Claude CLI: раунды, resume и запрос помощи пользователю",
      "context_pack": {
        "documents": [
          {
            "path": "docs/modules/codex-app-server-executor.md",
            "required": false
          }
        ],
        "include_last_completed_task": false,
        "dependency_task_ids": []
      },
      "actual_files": [
        "packages/workflow-kit/scripts/check-plan-review-fixture.mjs",
        "packages/workflow-kit/src/cli.mjs",
        "packages/workflow-kit/src/lib/claude-review.mjs",
        "packages/workflow-kit/src/lib/command-help.mjs",
        "packages/workflow-kit/src/lib/plan-review.mjs"
      ]
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "plan-review-20261008",
        "task_id": "T003",
        "role": "implementation"
      },
      "dependencies": [
        "T002"
      ],
      "functional_paths": [
        "src/main.mjs",
        "src/preload.cjs",
        "src/ui/index.html",
        "src/ui/sidebar.mjs",
        "src/plan-review.mjs",
        "src/workspace-session.mjs",
        "src/context-session.mjs",
        "src/context-inputs.mjs",
        "packages/workflow-kit/src/lib/recovery.mjs",
        "packages/workflow-kit/src/lib/plan-review.mjs",
        "packages/workflow-kit/src/WORKFLOW.md",
        "tests/plan-review.test.mjs",
        "tests/context-session.test.mjs",
        "tests/workspace-session.test.mjs",
        "src/project-input-watch.mjs",
        "tests/electron-smoke.mjs"
      ],
      "documentation_paths": [
        "docs/planning/plan-review.md",
        "docs/planning/plan-review-integration.md",
        "AGENTS.md",
        "docs/modules/auto-plan.md",
        "docs/modules/plan-view.md",
        "docs/modules/context-delivery.md",
        "docs/modules/plan-review.md"
      ],
      "verification_ids": [
        "unit-all",
        "electron-smoke",
        "kit-check"
      ],
      "id": "T003",
      "title": "Кнопка Review в панели и доставка правил основному агенту",
      "why": "Пользователь выбирает ревью независимо от автовыполнения в том же месте интерфейса.",
      "verification_kind": "code",
      "acceptance_criteria": [
        "Review рядом с AutoPlan доступна при NONE; ON зелёный, aria-pressed и подсказка показывают смысл; OFF по умолчанию, сохранение и восстановление выбора однозначны для checkout.",
        "Клиент синхронизирует политику выбранного checkout через узкий IPC с sender validation; смена проекта не меняет cwd или политику работающего чужого чата.",
        "Recovery и отказ REVIEW_REQUIRED доводят правило до новых и уже открытых агентов. Узкое разрешение Claude-review согласовано с startup text и проектным AGENTS; глобальные инструкции не меняются.",
        "Кнопка читает политику из единого state.json checkout; показывает стадию и раунд. Старый Kit даёт явную необходимость обновления."
      ],
      "expected_commit_message": "feat: Кнопка Review в панели и доставка правил основному агенту",
      "context_pack": {
        "documents": [
          {
            "path": "docs/modules/auto-plan.md",
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
        "AGENTS.md",
        "packages/workflow-kit/src/lib/plan-review.mjs",
        "src/main.mjs",
        "src/plan-review.mjs",
        "src/preload.cjs",
        "src/project-input-watch.mjs",
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
        "scope_id": "plan-review-20261008",
        "task_id": "T004",
        "role": "implementation"
      },
      "dependencies": [
        "T003"
      ],
      "functional_paths": [
        "src/plan-review.mjs",
        "src/main.mjs",
        "src/project-input-watch.mjs",
        "src/plan-monitor.mjs",
        "src/auto-plan.mjs",
        "src/auto-plan-state.mjs",
        "src/automation-send-state.mjs",
        "tests/plan-review.test.mjs",
        "tests/auto-plan.test.mjs",
        "tests/plan-monitor.test.mjs",
        "tests/auto-plan-restart-fixture.cjs",
        "packages/workflow-kit/src/cli.mjs",
        "packages/workflow-kit/src/lib/claude-review.mjs",
        "packages/workflow-kit/src/lib/command-help.mjs",
        "packages/workflow-kit/src/lib/plan-review.mjs",
        "src/review-continuation.mjs"
      ],
      "documentation_paths": [
        "docs/planning/plan-review.md",
        "docs/planning/plan-review-integration.md",
        "docs/modules/auto-plan.md",
        "docs/modules/plan-review.md"
      ],
      "verification_ids": [
        "unit-all",
        "electron-smoke",
        "kit-check"
      ],
      "id": "T004",
      "title": "Продолжение ревью на паузе и переход к AutoPlan",
      "why": "Цикл продолжается без копирования ответов и не отправляет два сообщения на одну паузу.",
      "verification_kind": "code",
      "acceptance_criteria": [
        "Файловые события и готовая пауза продолжают только нужный review при NONE; основной путь ожидания CLI агентом сохраняется; функционального polling нет.",
        "Общий журнал отправки Review/AutoPlan исключает дубли, UNKNOWN не повторяется; draft/Stop/busy/restart/смена проекта сохраняют защиту и корректного получателя.",
        "При NEEDS_USER агент один раз сообщает проблему и спрашивает пользователя; дальше автоматика ждёт ответа. PUBLISHED передаёт управление AutoPlan только если он включён; отдельного execution-разрешения нет."
      ],
      "expected_commit_message": "feat: Продолжение ревью на паузе и переход к AutoPlan",
      "context_pack": {
        "documents": [
          {
            "path": "docs/modules/auto-plan.md",
            "required": false
          },
          {
            "path": "docs/modules/chatgpt-dom-compatibility.md",
            "required": false
          }
        ],
        "include_last_completed_task": false,
        "dependency_task_ids": []
      },
      "actual_files": [
        "packages/workflow-kit/src/cli.mjs",
        "packages/workflow-kit/src/lib/claude-review.mjs",
        "packages/workflow-kit/src/lib/command-help.mjs",
        "packages/workflow-kit/src/lib/plan-review.mjs",
        "src/automation-send-state.mjs",
        "src/main.mjs",
        "src/review-continuation.mjs",
        "tests/plan-review.test.mjs"
      ]
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "plan-review-20261008",
        "task_id": "T005",
        "role": "implementation"
      },
      "dependencies": [
        "T004"
      ],
      "functional_paths": [
        "packages/workflow-kit/src/lib/plan-review.mjs",
        "packages/workflow-kit/src/lib/actions.mjs",
        "packages/workflow-kit/src/lib/recovery.mjs",
        "packages/workflow-kit/scripts/check-plan-review-fixture.mjs",
        "src/plan-review.mjs",
        "tests/plan-review.test.mjs"
      ],
      "documentation_paths": [
        "docs/planning/plan-review.md",
        "docs/planning/plan-review-integration.md",
        "packages/workflow-kit/docs/modules/workflow-kit-package.md",
        "docs/modules/plan-review.md"
      ],
      "verification_ids": [
        "kit-check",
        "unit-all"
      ],
      "id": "T005",
      "title": "Очистка материалов ревью при начале первой задачи",
      "why": "После принятия и старта плана временные документы не накапливаются.",
      "verification_kind": "code",
      "acceptance_criteria": [
        "Успешный первый task:start удаляет ровно папку связанного review при ручном старте и AutoPlan, в том числе без открытого Web Pilot; публикация и включение кнопки заранее её не удаляют.",
        "Повтор и crash восстанавливаются идемпотентно; symlink/посторонний каталог/старые эксперименты не удаляются, ошибка очистки видима и безопасно повторяется.",
        "При споре материалы сохранены; опубликованные spec/plan и required recovery не зависят от удалённых файлов; остаётся лишь минимальное состояние, без архива ревью.",
        "Повтор очистки выполняется и при повторном task:start до раннего возврата; ошибка уборки не отменяет начало задачи."
      ],
      "expected_commit_message": "feat: Очистка материалов ревью при начале первой задачи",
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
        "scope_id": "plan-review-20261008",
        "task_id": "T006",
        "role": "implementation"
      },
      "dependencies": [
        "T005"
      ],
      "functional_paths": [
        "package.json",
        "package-lock.json",
        "packages/workflow-kit/package.json",
        "packages/workflow-kit/src/lib/common.mjs",
        ".harness/workflow.json",
        "tests/plan-review.test.mjs",
        "tests/workflow-kit-source.test.mjs",
        "tests/workflow-kit-upgrade.test.mjs",
        "tests/workflow-kit-recovery.test.mjs",
        "scripts/check-installed-release.mjs",
        "scripts/stage-workflow-kit.mjs",
        "tests/electron-smoke.mjs",
        "packages/workflow-kit/src/lib/installer.mjs"
      ],
      "documentation_paths": [
        "docs/planning/plan-review.md",
        "docs/planning/plan-review-integration.md",
        "docs/modules/release.md",
        "docs/modules/plan-review.md",
        "packages/workflow-kit/docs/modules/workflow-kit-package.md"
      ],
      "verification_ids": [
        "unit-all",
        "electron-smoke",
        "kit-check",
        "codex-tools-live"
      ],
      "id": "T006",
      "title": "Проверить полный сценарий и подготовить локальный выпуск",
      "why": "Связать реализацию, установленный Kit и packaged приложение до DOCS и сборки.",
      "verification_kind": "code",
      "acceptance_criteria": [
        "Интеграционные fixtures покрывают четыре комбинации Review/AutoPlan, пару spec+plan, успешную публикацию, NEEDS_USER, restart и очистку через реальные пользовательские обработчики.",
        "Единые фактические инструкции и ошибки сверены; при необходимости изменения MCP добавить относящиеся файлы и executor-channel через task:update до правок.",
        "Версия приложения подготовлена как 0.6.102 (при занятости уточнить следующую), версия Kit обновлена по контракту; штатный install --update/stage доставляет код и help, evidence конфигурации обновлён через config:apply.",
        "Для живой приёмки составлена короткая последовательность на временном проекте; подмена CLI, TEST FIXTURE и Mac-кросс-сборка не объявлены проверкой живого ChatGPT или native Windows."
      ],
      "expected_commit_message": "feat: Проверить полный сценарий и подготовить локальный выпуск",
      "context_pack": {
        "documents": [
          {
            "path": "docs/modules/release.md",
            "required": false
          },
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
        "scope_id": "plan-review-20261008",
        "task_id": "DOCS",
        "role": "implementation"
      },
      "dependencies": [
        "T001",
        "T002",
        "T003",
        "T004",
        "T005",
        "T006"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/planning/plan-review.md",
        "docs/planning/plan-review-integration.md",
        "README.md",
        "docs/architecture/OVERVIEW.md",
        "AGENTS.md",
        "docs/modules/plan-review.md",
        "docs/modules/auto-plan.md",
        "docs/modules/plan-view.md",
        "docs/modules/context-delivery.md",
        "docs/modules/workflow-kit-recovery.md",
        "docs/modules/workspace-sidebar-ui.md",
        "docs/modules/codex-app-server-executor.md",
        "docs/modules/runtime-lifecycle.md",
        "docs/modules/release.md",
        "packages/workflow-kit/docs/modules/workflow-kit-package.md",
        "packages/workflow-kit/README.md"
      ],
      "verification_ids": [],
      "id": "DOCS",
      "title": "Актуализация всех документов проекта",
      "why": "Перед выпуском закрепить единый действующий контракт Review и убрать временные спецификации.",
      "acceptance_criteria": [
        "README, OVERVIEW, модули, проектные инструкции и Kit описывают фактическое поведение; противоречий о втором агенте, автосообщениях и двух кнопках нет.",
        "Требования спецификации перенесены в действующие контракты; обе временные части удалены с точными Git-ссылками для required recovery; каждый Markdown не более 28000 байт."
      ],
      "expected_commit_message": "docs: описать ревью планов и обновить контракты"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "plan-review-20261008",
        "task_id": "T007",
        "role": "implementation"
      },
      "dependencies": [
        "DOCS"
      ],
      "functional_paths": [
        "release-manifest.json"
      ],
      "documentation_paths": [
        "docs/planning/plan-review.md",
        "docs/planning/plan-review-integration.md",
        "docs/modules/release.md"
      ],
      "verification_ids": [
        "paired-release"
      ],
      "id": "T007",
      "title": "Собрать парный локальный выпуск с Review",
      "why": "Получить macOS arm64 и Windows x64 из одного проверенного дерева.",
      "verification_kind": "package",
      "acceptance_criteria": [
        "После DOCS сборку один раз выполняет paired-release при commit --task; root app и обе поставки согласованы с manifest; ручной предварительной сборки нет.",
        "Runtime Review/Kit входит в пакеты; временные отзывы и документы эксперимента в поставку не попали; native Windows остаётся до пользовательской приёмки."
      ],
      "expected_commit_message": "release: Собрать парный локальный выпуск с Review",
      "context_pack": {
        "documents": [
          {
            "path": "docs/modules/release.md",
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
        "scope_id": "plan-review-20261008",
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
      "documentation_paths": [
        "docs/planning/plan-review.md",
        "docs/planning/plan-review-integration.md",
        "docs/modules/release.md"
      ],
      "verification_ids": [
        "release-installed"
      ],
      "id": "T008",
      "title": "Установить готовый локальный выпуск и передать на приёмку",
      "why": "Пользователь проверяет кнопку и реальное ревью в постоянном приложении.",
      "verification_kind": "installed",
      "acceptance_criteria": [
        "Постоянное приложение обновлено из готового staging без пересборки с сохранением filesystem identity и проверкой release-installed.",
        "Пользователю переданы шаги живой приёмки Review/AutoPlan/спор/очистка на временном проекте; факты приёмки не выдуманы. Публикация GitHub выполняется следующей отдельной задачей T009."
      ],
      "expected_commit_message": "release: Установить готовый локальный выпуск и передать на приёмку",
      "context_pack": {
        "documents": [
          {
            "path": "docs/modules/release.md",
            "required": false
          }
        ],
        "include_last_completed_task": false,
        "dependency_task_ids": []
      }
    },
    {
      "id": "T009",
      "title": "Опубликовать выпуск с Review на GitHub",
      "why": "Пользователь поручил завершить внедрение опубликованным выпуском.",
      "dependencies": [
        "T008",
        "DOCS"
      ],
      "functional_paths": [
        "release-manifest.json"
      ],
      "documentation_paths": [
        "docs/planning/plan-review-integration.md"
      ],
      "verification_ids": [
        "github-release"
      ],
      "verification_kind": "package",
      "acceptance_criteria": [
        "Готовые проверенные assets опубликованы на GitHub без пересборки; main и тег согласованы с release-manifest; финальный push выполнен.",
        "Пользователю сообщены версия, ссылка на выпуск и фактически выполненные проверки."
      ],
      "expected_commit_message": "release: опубликовать выпуск с Review",
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "plan-review-20261008",
        "task_id": "T009",
        "role": "implementation"
      }
    }
  ],
  "blocked_reason": null,
  "user_decisions": [
    {
      "id": "f5fd34ea-293e-4a8f-b3a7-54cfcc5f1bb2",
      "text": "Пользователь 08.10.2026 поручил подготовить рабочую спецификацию и план внедрения Review по согласованным решениям. Сейчас только подготовка плана; начало реализации отдельным продолжением. План предусматривает локальную сборку и установку, без публикации GitHub.",
      "recorded_at": "2026-10-08T12:53:45.685Z"
    },
    {
      "id": "review-off-and-delivery-20261008",
      "text": "Пользователь разрешил реализацию, сборку, установку и публикацию на GitHub. Review OFF возвращает обычную публикацию, включая ранее спорный план; память рецензента разрешена.",
      "recorded_at": "2026-10-08T13:07:51.105Z"
    }
  ]
}
```
<!-- workflow-state:end -->

## Состояние

Execution Scope Status: ACTIVE
Delivery Status: IN_PROGRESS
Scope: plan-review-20261008
Current Task: нет
Revision: 1478

## Цель

Встроить согласование новой спецификации и to-do plan с Claude CLI в Workflow Kit и Web Pilot: независимая зелёная кнопка Review, автоматический успешный цикл, вопрос пользователю при проблеме и очистка при начале выполнения.

## Критерии приёмки

- Встроить согласование новой спецификации и to-do plan с Claude CLI в Workflow Kit и Web Pilot: независимая зелёная кнопка Review, автоматический успешный цикл, вопрос пользователю при проблеме и очистка при начале выполнения.
- Все четыре комбинации Review/AutoPlan выполняют согласованный сценарий; дополнительного разрешения исполнения нет.
- При существенном споре/ошибке основной агент спрашивает пользователя; первая начатая задача очищает только материалы своего ревью.
- Локальный выпуск собран и установлен по Kit; живая и Windows-приёмка имеют отдельные фактические результаты.

## Микрозадачи

- [DONE] T001: Протокол ревью и публикация согласованного плана в Kit — Завершено
  - Git Commit: [DONE] feat: Протокол ревью и публикация согласованного плана в Kit
  - Reference: plan-review-20261008 / T001 / implementation
  - Файлы: packages/workflow-kit/src/lib/plan-review.mjs, packages/workflow-kit/src/cli.mjs, packages/workflow-kit/src/lib/command-help.mjs, packages/workflow-kit/src/lib/actions.mjs, packages/workflow-kit/src/lib/simple-workflow.mjs, packages/workflow-kit/src/lib/plan.mjs, packages/workflow-kit/src/lib/recovery.mjs, packages/workflow-kit/src/lib/validate.mjs, packages/workflow-kit/src/lib/transaction.mjs, packages/workflow-kit/src/lib/inspection-inputs.mjs, packages/workflow-kit/src/schemas/plan.schema.json, packages/workflow-kit/scripts/check-plan-review-fixture.mjs, packages/workflow-kit/scripts/check-consumer-contract.mjs, packages/workflow-kit/package.json, docs/planning/plan-review.md, docs/planning/plan-review-integration.md, packages/workflow-kit/docs/modules/workflow-kit-package.md
- [DONE] T002: Claude CLI: раунды, resume и запрос помощи пользователю — Завершено
  - Git Commit: [DONE] feat: Claude CLI: раунды, resume и запрос помощи пользователю
  - Reference: plan-review-20261008 / T002 / implementation
  - Файлы: packages/workflow-kit/src/lib/claude-review.mjs, packages/workflow-kit/src/lib/plan-review.mjs, packages/workflow-kit/src/cli.mjs, packages/workflow-kit/src/lib/command-help.mjs, packages/workflow-kit/scripts/check-plan-review-fixture.mjs, packages/workflow-kit/package.json, docs/planning/plan-review.md, docs/planning/plan-review-integration.md, packages/workflow-kit/docs/modules/workflow-kit-package.md
- [DONE] T003: Кнопка Review в панели и доставка правил основному агенту — Завершено
  - Git Commit: [DONE] feat: Кнопка Review в панели и доставка правил основному агенту
  - Reference: plan-review-20261008 / T003 / implementation
  - Файлы: src/main.mjs, src/preload.cjs, src/ui/index.html, src/ui/sidebar.mjs, src/plan-review.mjs, src/workspace-session.mjs, src/context-session.mjs, src/context-inputs.mjs, packages/workflow-kit/src/lib/recovery.mjs, packages/workflow-kit/src/lib/plan-review.mjs, packages/workflow-kit/src/WORKFLOW.md, tests/plan-review.test.mjs, tests/context-session.test.mjs, tests/workspace-session.test.mjs, src/project-input-watch.mjs, tests/electron-smoke.mjs, docs/planning/plan-review.md, docs/planning/plan-review-integration.md, AGENTS.md, docs/modules/auto-plan.md, docs/modules/plan-view.md, docs/modules/context-delivery.md, docs/modules/plan-review.md
- [DONE] T004: Продолжение ревью на паузе и переход к AutoPlan — Завершено
  - Git Commit: [DONE] feat: Продолжение ревью на паузе и переход к AutoPlan
  - Reference: plan-review-20261008 / T004 / implementation
  - Файлы: src/plan-review.mjs, src/main.mjs, src/project-input-watch.mjs, src/plan-monitor.mjs, src/auto-plan.mjs, src/auto-plan-state.mjs, src/automation-send-state.mjs, tests/plan-review.test.mjs, tests/auto-plan.test.mjs, tests/plan-monitor.test.mjs, tests/auto-plan-restart-fixture.cjs, packages/workflow-kit/src/cli.mjs, packages/workflow-kit/src/lib/claude-review.mjs, packages/workflow-kit/src/lib/command-help.mjs, packages/workflow-kit/src/lib/plan-review.mjs, src/review-continuation.mjs, docs/planning/plan-review.md, docs/planning/plan-review-integration.md, docs/modules/auto-plan.md, docs/modules/plan-review.md
- [TODO] T005: Очистка материалов ревью при начале первой задачи — Ожидает
  - Git Commit: [PENDING] feat: Очистка материалов ревью при начале первой задачи
  - Reference: plan-review-20261008 / T005 / implementation
  - Файлы: packages/workflow-kit/src/lib/plan-review.mjs, packages/workflow-kit/src/lib/actions.mjs, packages/workflow-kit/src/lib/recovery.mjs, packages/workflow-kit/scripts/check-plan-review-fixture.mjs, src/plan-review.mjs, tests/plan-review.test.mjs, docs/planning/plan-review.md, docs/planning/plan-review-integration.md, packages/workflow-kit/docs/modules/workflow-kit-package.md, docs/modules/plan-review.md
- [TODO] T006: Проверить полный сценарий и подготовить локальный выпуск — Ожидает
  - Git Commit: [PENDING] feat: Проверить полный сценарий и подготовить локальный выпуск
  - Reference: plan-review-20261008 / T006 / implementation
  - Файлы: package.json, package-lock.json, packages/workflow-kit/package.json, packages/workflow-kit/src/lib/common.mjs, .harness/workflow.json, tests/plan-review.test.mjs, tests/workflow-kit-source.test.mjs, tests/workflow-kit-upgrade.test.mjs, tests/workflow-kit-recovery.test.mjs, scripts/check-installed-release.mjs, scripts/stage-workflow-kit.mjs, tests/electron-smoke.mjs, packages/workflow-kit/src/lib/installer.mjs, docs/planning/plan-review.md, docs/planning/plan-review-integration.md, docs/modules/release.md, docs/modules/plan-review.md, packages/workflow-kit/docs/modules/workflow-kit-package.md
- [TODO] DOCS: Актуализация всех документов проекта — Ожидает
  - Git Commit: [PENDING] docs: описать ревью планов и обновить контракты
  - Reference: plan-review-20261008 / DOCS / implementation
  - Файлы: docs/planning/plan-review.md, docs/planning/plan-review-integration.md, README.md, docs/architecture/OVERVIEW.md, AGENTS.md, docs/modules/plan-review.md, docs/modules/auto-plan.md, docs/modules/plan-view.md, docs/modules/context-delivery.md, docs/modules/workflow-kit-recovery.md, docs/modules/workspace-sidebar-ui.md, docs/modules/codex-app-server-executor.md, docs/modules/runtime-lifecycle.md, docs/modules/release.md, packages/workflow-kit/docs/modules/workflow-kit-package.md, packages/workflow-kit/README.md
- [TODO] T007: Собрать парный локальный выпуск с Review — Ожидает
  - Git Commit: [PENDING] release: Собрать парный локальный выпуск с Review
  - Reference: plan-review-20261008 / T007 / implementation
  - Файлы: release-manifest.json, docs/planning/plan-review.md, docs/planning/plan-review-integration.md, docs/modules/release.md
- [TODO] T008: Установить готовый локальный выпуск и передать на приёмку — Ожидает
  - Git Commit: [PENDING] release: Установить готовый локальный выпуск и передать на приёмку
  - Reference: plan-review-20261008 / T008 / implementation
  - Файлы: release-manifest.json, docs/planning/plan-review.md, docs/planning/plan-review-integration.md, docs/modules/release.md
- [TODO] T009: Опубликовать выпуск с Review на GitHub — Ожидает
  - Git Commit: [PENDING] release: опубликовать выпуск с Review
  - Reference: plan-review-20261008 / T009 / implementation
  - Файлы: release-manifest.json, docs/planning/plan-review-integration.md

## Context Pack For This Cycle

- docs/architecture/OVERVIEW.md
- docs/planning/plan-review.md
- docs/planning/plan-review-integration.md

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
