# Активный план — Project Web Pilot

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 1323,
  "project_id": "cf944136-d1fc-4bd5-9ea0-e46d1fe230e7",
  "project_name": "Project Web Pilot",
  "scope_id": "context-as-text-0.6.96-20261006",
  "execution_scope_status": "ACTIVE",
  "delivery_status": "IN_PROGRESS",
  "objective": "Объединить репозитории Project Web Pilot и Workflow Kit; вернуть доставку контекста текстом и оставить в MCP только инструменты (девять); исправить дефекты Workflow Kit (1.5.6); сделать macOS и Windows одинаковыми по возможностям и способам — Windows работает через тот же исполнитель Codex App Server; синхронизировать все документы, включая README; выпустить Project Web Pilot 0.6.96.",
  "acceptance_criteria": [
    "На обеих платформах новая сессия начинается одним стартовым сообщением с правилами и полным пакетом recovery; режим MCP-доставки удалён",
    "Каталог MCP на обеих платформах — одни и те же девять инструментов; workflow_context_recover, протокол частей, session-rules.md и active-workspace.json удалены",
    "Сообщение автопродолжения несёт текст следующей задачи из плана; в меню проекта есть строка для внешнего клиента",
    "Workflow Kit — пакет packages/workflow-kit в этом репозитории; версия 1.5.6 исправляет вставку задачи в середину плана и ложный PRIVATE_CONTEXT; прежний репозиторий WorkflowKit на GitHub переведён в архив со ссылкой на новый дом",
    "Windows работает через исполнитель Codex App Server с теми же каналами ChatGPT, тем же жизненным циклом служб и теми же настройками, что macOS; прежний Windows-мост не используется",
    "Экспорты трёх browser-модулей и формат pageScript, codex-tools.lock.json, состав и SHA-256 закреплённого Windows-архива не изменены; поведение macOS не ухудшено",
    "Все документы проекта, включая README.md и проектную часть AGENTS.md, синхронизированы до сборки (DOCS) и после публикации",
    "Релиз 0.6.96 собран один раз, установлен в /Applications, опубликован на GitHub; main синхронизирован; приёмка на живой Windows — за пользователем"
  ],
  "approved_scope": {
    "functional_paths": [
      ".gitignore",
      "package-lock.json",
      "package.json",
      "packages/workflow-kit/package.json",
      "packages/workflow-kit/scripts/check-runtime-fixture.mjs",
      "packages/workflow-kit/src/lib/command-help.mjs",
      "packages/workflow-kit/src/lib/common.mjs",
      "packages/workflow-kit/src/lib/extend-plan.mjs",
      "packages/workflow-kit/src/lib/task-files.mjs",
      "scripts/check-github-release.mjs",
      "scripts/check-installed-release.mjs",
      "scripts/check-workflow-kit-archive.mjs",
      "scripts/check-workflow-kit-dependency.mjs",
      "scripts/check-workflow-kit-staging.mjs",
      "scripts/prepare-windows-toolchain.mjs",
      "scripts/release-all.mjs",
      "scripts/stage-workflow-kit.mjs",
      "scripts/verify-windows-package.mjs",
      "src/auto-plan.mjs",
      "src/context-session.mjs",
      "src/mac-runtime-switch.mjs",
      "src/main.mjs",
      "src/mcp-runtime.mjs",
      "src/platform.mjs",
      "src/preload.cjs",
      "src/startup-platform.mjs",
      "src/startup-readiness.mjs",
      "src/ui/index.html",
      "src/ui/progress.mjs",
      "src/ui/settings-panel.mjs",
      "src/ui/sidebar.mjs",
      "src/ui/startup.mjs",
      "src/vps-tunnel.mjs",
      "src/windows-runtime.mjs",
      "tests/auto-plan.test.mjs",
      "tests/codex-app-server-mcp.test.mjs",
      "tests/context-session.test.mjs",
      "tests/mac-runtime-switch.test.mjs",
      "tests/mcp-runtime.test.mjs",
      "tests/progress.test.mjs",
      "tests/release-all.test.mjs",
      "tests/settings-chatgpt-channel.test.mjs",
      "tests/sidebar.test.mjs",
      "tests/startup-platform.test.mjs",
      "tests/startup-readiness.test.mjs",
      "tests/vps-tunnel.test.mjs",
      "tests/windows-autostart.test.mjs",
      "tests/windows-first-run.test.mjs",
      "tests/windows-runtime.test.mjs",
      "tests/workflow-kit-recovery.test.mjs",
      "tests/workflow-kit-source.test.mjs",
      "tools/codex-app-server-mcp/app_server_client.py",
      "tools/codex-app-server-mcp/control.py",
      "tools/codex-app-server-mcp/server.py",
      "tools/codex-app-server-mcp/tunnel_prompt.py",
      "packages/workflow-kit/.gitattributes",
      "packages/workflow-kit/.gitignore",
      "packages/workflow-kit/scripts/check-consumer-contract.mjs",
      "packages/workflow-kit/scripts/check-package.mjs",
      "src/auto-plan-state.mjs",
      "tests/electron-smoke.mjs",
      "packages/workflow-kit/src/lib/git.mjs",
      "packages/workflow-kit/src/lib/installer.mjs",
      "resources/workspace-setup-worker.mjs",
      "tests/workspace-setup.test.mjs"
    ],
    "documentation_paths": [
      "AGENTS.md",
      "README.md",
      "docs/CLEAN_INSTALL.md",
      "docs/CONTEXT_DELIVERY.md",
      "docs/DECISIONS.md",
      "docs/DOCUMENTATION_INDEX.md",
      "docs/MODULES.md",
      "docs/PRODUCT.md",
      "docs/RELEASE.md",
      "docs/SOURCE_WORKSPACES.md",
      "docs/TRANSFER_TO_WINDOWS.md",
      "docs/VERIFICATION.md",
      "docs/WORKFLOW_START.md",
      "docs/architecture/ARCHITECTURE.md",
      "docs/architecture/OVERVIEW.md",
      "docs/modules/codex-app-server-executor.md",
      "docs/modules/workflow-kit-recovery.md",
      "docs/planning/codex-native-tools-macos.md",
      "docs/planning/context-as-text.md",
      "packages/workflow-kit/README.md",
      "packages/workflow-kit/docs/modules/workflow-kit-package.md",
      "packages/workflow-kit/src/templates/CONTINUE.md",
      "tools/codex-app-server-mcp/session-rules.md",
      "docs/WORKSPACE_SETUP.md",
      "docs/modules/session-owned-plans.md",
      "docs/planning/mcp-sequential-parts-kit-1.5.4.md",
      "docs/planning/release-backups-kit-1.5.5.md",
      "packages/workflow-kit/docs/DOCUMENTATION_INDEX.md",
      "packages/workflow-kit/docs/MODULES.md",
      "packages/workflow-kit/docs/PRODUCT.md",
      "packages/workflow-kit/docs/WORKFLOW_START.md",
      "packages/workflow-kit/docs/architecture/ARCHITECTURE.md",
      "packages/workflow-kit/docs/architecture/OVERVIEW.md"
    ]
  },
  "baseline_commit": "919ddde533e906b05ecaeac0683a02e67d4ced9b",
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
        "path": "docs/planning/context-as-text.md",
        "required": true
      }
    ],
    "include_last_completed_task": false,
    "dependency_task_ids": []
  },
  "tasks": [
    {
      "id": "C001",
      "title": "Зафиксировать расширенный контракт релиза 0.6.96",
      "why": "Пользователь 06.10.2026 расширил объём: исправление дефектов Workflow Kit и паритет Windows. Контракт дополнен после создания плана, а команда уточнения плана фиксирует только файл плана.",
      "dependencies": [],
      "functional_paths": [],
      "documentation_paths": [
        "docs/planning/context-as-text.md"
      ],
      "verification_ids": [],
      "verification_kind": "code",
      "acceptance_criteria": [
        "docs/planning/context-as-text.md содержит разделы «Workflow Kit 1.5.6» и «Паритет Windows», обновлённые результат, границы, проверку, риски и список задач",
        "Код не меняется"
      ],
      "expected_commit_message": "docs: расширить контракт 0.6.96 — Workflow Kit 1.5.6 и паритет Windows",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "context-as-text-0.6.96-20261006",
        "task_id": "C001",
        "role": "implementation"
      },
      "actual_files": [
        "docs/planning/context-as-text.md"
      ]
    },
    {
      "id": "C002",
      "title": "Зафиксировать в контракте объединение репозиториев",
      "why": "Пользователь 06.10.2026 поручил объединить репозитории Project Web Pilot и Workflow Kit в этом релизе. Контракт дополняется после уточнения плана, а команда уточнения фиксирует только файл плана.",
      "dependencies": [],
      "functional_paths": [],
      "documentation_paths": [
        "docs/planning/context-as-text.md"
      ],
      "verification_ids": [],
      "verification_kind": "code",
      "acceptance_criteria": [
        "docs/planning/context-as-text.md содержит раздел «Объединение репозиториев»; разделы про Workflow Kit 1.5.6, границы, проверку, риски и список задач приведены в соответствие",
        "Код не меняется"
      ],
      "expected_commit_message": "docs: дополнить контракт 0.6.96 — объединение репозиториев",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "context-as-text-0.6.96-20261006",
        "task_id": "C002",
        "role": "implementation"
      },
      "actual_files": [
        "docs/planning/context-as-text.md"
      ]
    },
    {
      "id": "M001",
      "title": "Объединить репозитории: Workflow Kit становится пакетом packages/workflow-kit",
      "why": "У Kit один потребитель — Web Pilot (зависимость file:../WorkflowKit); отдельно Kit не выпускается с v1.5.1; каждая его правка проходит двойной круг с ручной сменой версии, числа файлов и SHA-256; документы двух репозиториев расходятся. Пользователь решил объединить.",
      "dependencies": [
        "C002"
      ],
      "functional_paths": [
        "package.json",
        "package-lock.json",
        ".gitignore",
        "scripts/stage-workflow-kit.mjs",
        "scripts/check-workflow-kit-dependency.mjs",
        "scripts/check-workflow-kit-staging.mjs",
        "scripts/release-all.mjs",
        "tests/workflow-kit-source.test.mjs",
        "tests/workflow-kit-recovery.test.mjs",
        "tests/release-all.test.mjs",
        "packages/workflow-kit/package.json",
        "packages/workflow-kit/.gitattributes",
        "packages/workflow-kit/.gitignore",
        "packages/workflow-kit/scripts/check-consumer-contract.mjs",
        "packages/workflow-kit/scripts/check-package.mjs",
        "packages/workflow-kit/scripts/check-runtime-fixture.mjs",
        "scripts/check-installed-release.mjs",
        "scripts/verify-windows-package.mjs"
      ],
      "documentation_paths": [
        "docs/planning/context-as-text.md"
      ],
      "verification_ids": [
        "unit-all",
        "kit-check",
        "electron-smoke"
      ],
      "verification_kind": "code",
      "acceptance_criteria": [
        "Файлы и история репозитория WorkflowKit (main 6bbec655497eaea69d5c5825c68e9bdf78a01c18) перенесены в packages/workflow-kit одной операцией git subtree; это единственная прямая git-операция релиза. Если хук Workflow Kit её не допускает, файлы переносятся обычным коммитом задачи, история остаётся в прежнем репозитории, и это записывается в контракт",
        "Пакет сохраняет имя @webpilot/workflow-kit, версию 1.5.5 и состав runtime: 35 файлов, SHA-256 8eadd98869a840f670dbfb00c33350e3054d8ec7de5298b2b0beca82d787f376",
        "Служебные файлы управления прежним репозиторием в пакете удалены: его .harness, .codex, AGENTS.md и обёртки scripts/workflow; архив планов Kit остаётся в прежнем репозитории",
        "Web Pilot берёт пакет из packages/workflow-kit: зависимость, подготовка runtime, проверки и сборочные скрипты не обращаются к ../WorkflowKit; закреплённые константы версии, числа файлов и SHA-256 заменены сверкой подготовленного runtime с исходником пакета",
        "Собственные проверки пакета запускаются из корня проверкой kit-check; полный npm test и Electron smoke проходят",
        "Установленный Kit этого checkout (.harness/kit) в этой задаче не меняется; сборка не выполняется — состав пакета приложения проверяют тесты сборочных скриптов, сама сборка остаётся за T006"
      ],
      "expected_commit_message": "feat: Объединить репозитории: Workflow Kit становится пакетом packages/workflow-kit",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "context-as-text-0.6.96-20261006",
        "task_id": "M001",
        "role": "implementation"
      },
      "actual_files": [
        "docs/planning/context-as-text.md",
        "package-lock.json",
        "package.json",
        "packages/workflow-kit/.gitattributes",
        "packages/workflow-kit/.gitignore",
        "packages/workflow-kit/package.json",
        "packages/workflow-kit/scripts/check-consumer-contract.mjs",
        "packages/workflow-kit/scripts/check-package.mjs",
        "packages/workflow-kit/scripts/check-runtime-fixture.mjs",
        "scripts/check-installed-release.mjs",
        "scripts/check-workflow-kit-dependency.mjs",
        "scripts/check-workflow-kit-staging.mjs",
        "scripts/stage-workflow-kit.mjs",
        "scripts/verify-windows-package.mjs",
        "tests/release-all.test.mjs",
        "tests/workflow-kit-source.test.mjs"
      ]
    },
    {
      "id": "M002",
      "title": "Документы Workflow Kit в составе проекта",
      "why": "У Kit свои PRODUCT, OVERVIEW, MODULES, индекс и WORKFLOW_START с теми же именами, что у Web Pilot; документы проекта описывают Kit как соседний репозиторий.",
      "dependencies": [
        "M001"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/planning/context-as-text.md",
        "AGENTS.md",
        "docs/SOURCE_WORKSPACES.md",
        "docs/MODULES.md",
        "docs/DOCUMENTATION_INDEX.md",
        "docs/architecture/OVERVIEW.md",
        "docs/modules/workflow-kit-recovery.md",
        "packages/workflow-kit/README.md",
        "packages/workflow-kit/docs/modules/workflow-kit-package.md",
        "README.md",
        "docs/WORKFLOW_START.md",
        "docs/WORKSPACE_SETUP.md",
        "docs/modules/session-owned-plans.md",
        "docs/planning/mcp-sequential-parts-kit-1.5.4.md",
        "docs/planning/release-backups-kit-1.5.5.md",
        "packages/workflow-kit/docs/DOCUMENTATION_INDEX.md",
        "packages/workflow-kit/docs/MODULES.md",
        "packages/workflow-kit/docs/PRODUCT.md",
        "packages/workflow-kit/docs/WORKFLOW_START.md",
        "packages/workflow-kit/docs/architecture/ARCHITECTURE.md",
        "packages/workflow-kit/docs/architecture/OVERVIEW.md"
      ],
      "verification_ids": [],
      "verification_kind": "code",
      "acceptance_criteria": [
        "В пакете остаются README, техническая спецификация пакета и его планировочные контракты; дублирующие документы верхнего уровня Kit (PRODUCT, OVERVIEW, MODULES, индекс, WORKFLOW_START) влиты в документы проекта или заменены ссылками, без потери сведений",
        "Документы проекта и проектная часть AGENTS.md описывают один репозиторий: Kit — пакет packages/workflow-kit; ссылок на /Users/oleksandroliinyk/VSCODE/WorkflowKit как на действующий источник нет",
        "Все локальные ссылки в затронутых документах рабочие; блок Workflow Kit в AGENTS.md не трогается",
        "Код не меняется"
      ],
      "expected_commit_message": "docs: документы Workflow Kit в составе проекта",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "context-as-text-0.6.96-20261006",
        "task_id": "M002",
        "role": "implementation"
      },
      "actual_files": [
        "AGENTS.md",
        "README.md",
        "docs/DOCUMENTATION_INDEX.md",
        "docs/MODULES.md",
        "docs/SOURCE_WORKSPACES.md",
        "docs/WORKFLOW_START.md",
        "docs/WORKSPACE_SETUP.md",
        "docs/architecture/OVERVIEW.md",
        "docs/modules/session-owned-plans.md",
        "docs/modules/workflow-kit-recovery.md",
        "docs/planning/context-as-text.md",
        "docs/planning/mcp-sequential-parts-kit-1.5.4.md",
        "docs/planning/release-backups-kit-1.5.5.md",
        "packages/workflow-kit/README.md",
        "packages/workflow-kit/docs/DOCUMENTATION_INDEX.md",
        "packages/workflow-kit/docs/MODULES.md",
        "packages/workflow-kit/docs/PRODUCT.md",
        "packages/workflow-kit/docs/WORKFLOW_START.md",
        "packages/workflow-kit/docs/architecture/ARCHITECTURE.md",
        "packages/workflow-kit/docs/architecture/OVERVIEW.md",
        "packages/workflow-kit/docs/modules/workflow-kit-package.md"
      ]
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "context-as-text-0.6.96-20261006",
        "task_id": "T001",
        "role": "implementation"
      },
      "dependencies": [],
      "functional_paths": [
        "src/mac-runtime-switch.mjs",
        "src/context-session.mjs",
        "src/mcp-runtime.mjs",
        "src/ui/sidebar.mjs",
        "src/ui/progress.mjs",
        "src/ui/index.html",
        "src/main.mjs",
        "tests/context-session.test.mjs",
        "tests/mac-runtime-switch.test.mjs",
        "tests/mcp-runtime.test.mjs",
        "tests/sidebar.test.mjs",
        "tests/progress.test.mjs"
      ],
      "documentation_paths": [
        "docs/planning/context-as-text.md"
      ],
      "verification_ids": [
        "unit-all",
        "electron-smoke"
      ],
      "id": "T001",
      "title": "Стартовое сообщение macOS несёт полный контекст; режим MCP-доставки удалён из клиента",
      "why": "macOS переведён на чтение контекста через MCP одной строкой (contextDelivery = 'mcp'), а доставка полного пакета первым сообщением осталась в коде и работает для Windows. Пакет recovery этого проекта — 87 КБ: через MCP это четыре последовательных вызова, через поле ввода — одна вставка.",
      "verification_kind": "code",
      "acceptance_criteria": [
        "На macOS новая сессия отправляет одно стартовое сообщение с правилами сессии и полным пакетом recovery (startupMessage), как на Windows; пакет приходит напрямую от Workflow Kit через SessionPlans.loadContext",
        "Правила сессии в стартовом сообщении macOS включают строки про работу с инструментами (rg через exec_command, apply_patch без перечитывания) и про один повтор после блокировки OpenAI; текст стартового сообщения Windows не меняется",
        "Из клиента удалён режим MCP-доставки: mcpStartMessage, mcpSession, contextMode 'mcp', setActiveWorkspace и запись active-workspace.json, тексты сайдбара и индикатора про чтение через MCP",
        "Привязка чата по своему сообщению, откладывание при черновике и идущей генерации, отметка устаревшего контекста и повторная доставка по явному обновлению работают как в режиме первого сообщения",
        "Чаты, начатые в режиме MCP, остаются привязанными; в уже привязанные чаты ничего автоматически не отправляется",
        "LocalMcpClient на macOS не требует workflow_context_recover в каталоге сервера; для Windows требование остаётся до задачи W004",
        "Экспорты src/chatgpt-dom.mjs, src/chatgpt-composer.mjs, src/chatgpt-experience.mjs и формат pageScript не меняются"
      ],
      "expected_commit_message": "feat: Стартовое сообщение macOS несёт полный контекст; режим MCP-доставки удалён из клиента",
      "actual_files": [
        "docs/planning/context-as-text.md",
        "src/context-session.mjs",
        "src/mac-runtime-switch.mjs",
        "src/mcp-runtime.mjs",
        "src/ui/progress.mjs",
        "src/ui/sidebar.mjs",
        "tests/context-session.test.mjs",
        "tests/mac-runtime-switch.test.mjs",
        "tests/mcp-runtime.test.mjs",
        "tests/progress.test.mjs",
        "tests/sidebar.test.mjs"
      ]
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "context-as-text-0.6.96-20261006",
        "task_id": "T002",
        "role": "implementation"
      },
      "dependencies": [
        "T001"
      ],
      "functional_paths": [
        "tools/codex-app-server-mcp/server.py",
        "tests/codex-app-server-mcp.test.mjs",
        "src/mac-runtime-switch.mjs",
        "tests/mac-runtime-switch.test.mjs"
      ],
      "documentation_paths": [
        "docs/planning/context-as-text.md",
        "tools/codex-app-server-mcp/session-rules.md"
      ],
      "verification_ids": [
        "executor-channel",
        "unit-all",
        "codex-tools-live"
      ],
      "id": "T002",
      "title": "MCP без доставки контекста: каталог из девяти инструментов",
      "why": "После T001 инструмент workflow_context_recover, протокол частей и правила сессии в MCP никому не нужны: клиент получает пакет от Workflow Kit, модель получает его в стартовом сообщении.",
      "verification_kind": "code",
      "acceptance_criteria": [
        "Из server.py удалены workflow_context_recover, методы workflow_context, workflow_recover и active_workspace, функции session_rules, split_context, part_key и context_part, константы частей и active-workspace; файл session-rules.md удалён; каталог — ровно 9 инструментов",
        "Server instructions — короткий текст без упоминания recovery: локальные инструменты, без модельных ходов Codex, без управления интерфейсом, правила работы с инструментами и правило одного повтора после блокировки OpenAI; тест фиксирует новый текст вместо хеша первых 512 символов",
        "Исполнитель при запуске удаляет прежний файл active-workspace.json в своём каталоге состояния",
        "Тест каталога требует 9 имён и отсутствия workflow_context_recover в исходнике; tools/list настоящего сервера возвращает те же 9 имён с описаниями инструментов и параметров",
        "Остальные девять инструментов, их параметры, описания и поведение, codex-tools.lock.json не меняется; прежний Windows-runtime в этой задаче не трогается"
      ],
      "expected_commit_message": "feat: MCP без доставки контекста: каталог из девяти инструментов",
      "actual_files": [
        "tests/codex-app-server-mcp.test.mjs",
        "tools/codex-app-server-mcp/server.py",
        "tools/codex-app-server-mcp/session-rules.md"
      ]
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "context-as-text-0.6.96-20261006",
        "task_id": "T003",
        "role": "implementation"
      },
      "dependencies": [
        "T001"
      ],
      "functional_paths": [
        "src/auto-plan.mjs",
        "tests/auto-plan.test.mjs",
        "src/auto-plan-state.mjs",
        "tests/electron-smoke.mjs"
      ],
      "documentation_paths": [
        "docs/planning/context-as-text.md"
      ],
      "verification_ids": [
        "unit-all"
      ],
      "id": "T003",
      "title": "Автопродолжение несёт текст следующей задачи",
      "why": "AutoPlan отправляет голое «Продолжай», и агент тратит вызовы инструментов, чтобы узнать следующую задачу, хотя Web Pilot прямо перед отправкой читает актуальный план.",
      "verification_kind": "code",
      "acceptance_criteria": [
        "Сообщение автопродолжения — «Продолжай» и блок следующей задачи из current plan: id, название, зачем, критерии приёмки, файлы, проверки; данные берутся из той же проверки плана, что выполняется перед отправкой",
        "Блок помечен как данные плана и ограничен по размеру (не больше 4 КБ, длинные поля обрезаются с пометкой); если следующая задача не определена, отправляется прежнее «Продолжай»",
        "Логика пауз, контрольных точек, повторов и отказов AutoPlan не меняется; тесты AutoPlan проходят с новым текстом",
        "Документы задачи автоматически не вкладываются"
      ],
      "expected_commit_message": "feat: Автопродолжение несёт текст следующей задачи",
      "actual_files": [
        "docs/planning/context-as-text.md",
        "src/auto-plan-state.mjs",
        "src/auto-plan.mjs",
        "tests/auto-plan.test.mjs",
        "tests/electron-smoke.mjs"
      ]
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "context-as-text-0.6.96-20261006",
        "task_id": "T004",
        "role": "implementation"
      },
      "dependencies": [
        "T001"
      ],
      "functional_paths": [
        "src/ui/sidebar.mjs",
        "src/main.mjs",
        "src/preload.cjs",
        "tests/sidebar.test.mjs",
        "src/context-session.mjs",
        "src/ui/progress.mjs",
        "tests/context-session.test.mjs",
        "tests/electron-smoke.mjs"
      ],
      "documentation_paths": [
        "docs/planning/context-as-text.md"
      ],
      "verification_ids": [
        "unit-all"
      ],
      "id": "T004",
      "title": "Строка для внешнего клиента в меню проекта",
      "why": "Вне окна Web Pilot сессию начинает пользователь; ему нужна готовая первая строка, по которой агент сам прочитает правила и recovery из папки проекта.",
      "verification_kind": "code",
      "acceptance_criteria": [
        "В меню проекта рядом с «Скопировать полный путь» есть «Скопировать строку для внешнего клиента»",
        "В буфер попадает текст: имя проекта, абсолютная папка (JSON-строка), указание прочитать AGENTS.md и получить recovery командой ./scripts/workflow recover --format text с выводом в файл .harness/runtime/recovery.txt, затем прочитать файл целиком по частям",
        "Строка не содержит адреса коннектора, ключей и иных секретов; действие ничего не отправляет в чат"
      ],
      "expected_commit_message": "feat: Строка для внешнего клиента в меню проекта",
      "actual_files": [
        "src/context-session.mjs",
        "src/main.mjs",
        "src/preload.cjs",
        "src/ui/progress.mjs",
        "src/ui/sidebar.mjs",
        "tests/context-session.test.mjs",
        "tests/electron-smoke.mjs",
        "tests/sidebar.test.mjs"
      ]
    },
    {
      "id": "K001",
      "title": "Workflow Kit 1.5.6: вставка задачи, подсказка о полях, ложный PRIVATE_CONTEXT",
      "why": "При выпусках 0.6.93 и 0.6.95 Kit дважды мешал работе: plan:extend не умеет ставить задачу перед существующей и дополнять её зависимости, а первый commit сессии ложно отказывал из-за неизменённого .codex/hooks.json. Пользователь поручил включить исправление в этот релиз.",
      "dependencies": [
        "M001"
      ],
      "functional_paths": [
        "packages/workflow-kit/src/lib/extend-plan.mjs",
        "packages/workflow-kit/src/lib/task-files.mjs",
        "packages/workflow-kit/src/lib/command-help.mjs",
        "packages/workflow-kit/src/lib/common.mjs",
        "packages/workflow-kit/package.json",
        "packages/workflow-kit/scripts/check-runtime-fixture.mjs",
        "tests/workflow-kit-source.test.mjs",
        "tests/workflow-kit-recovery.test.mjs",
        "package-lock.json",
        "packages/workflow-kit/src/lib/git.mjs",
        "packages/workflow-kit/src/lib/installer.mjs",
        "resources/workspace-setup-worker.mjs",
        "tests/workspace-setup.test.mjs"
      ],
      "documentation_paths": [
        "docs/planning/context-as-text.md",
        "packages/workflow-kit/README.md",
        "packages/workflow-kit/src/templates/CONTINUE.md",
        "packages/workflow-kit/docs/modules/workflow-kit-package.md"
      ],
      "verification_ids": [
        "unit-all",
        "kit-check"
      ],
      "verification_kind": "code",
      "acceptance_criteria": [
        "plan:extend ставит новую задачу перед указанной незавершённой и дополняет зависимости незавершённых задач; порядок в файле плана совпадает с порядком выполнения; DONE-задачи и правило work → DOCS → delivery не затронуты; формат плана и прежние вызовы совместимы",
        "plan:extend --help показывает допустимые поля задачи и место spec",
        "Причина ложного PRIVATE_CONTEXT на неизменённом .codex/hooks.json установлена и устранена, есть воспроизводящий тест; действительно изменённый приватный путь не попадает в коммит задачи и перечисляется в excluded_changes",
        "Версия пакета — 1.5.6; kit-check и полный npm test проходят",
        "Установленный Kit этого checkout (.harness/kit) обновлён до 1.5.6 штатной командой после прохождения проверок"
      ],
      "expected_commit_message": "feat: Workflow Kit 1.5.6: вставка задачи, подсказка о полях, ложный PRIVATE_CONTEXT",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "context-as-text-0.6.96-20261006",
        "task_id": "K001",
        "role": "implementation"
      },
      "actual_files": [
        "docs/planning/context-as-text.md",
        "package-lock.json",
        "packages/workflow-kit/README.md",
        "packages/workflow-kit/docs/modules/workflow-kit-package.md",
        "packages/workflow-kit/package.json",
        "packages/workflow-kit/scripts/check-runtime-fixture.mjs",
        "packages/workflow-kit/src/lib/common.mjs",
        "packages/workflow-kit/src/lib/extend-plan.mjs",
        "packages/workflow-kit/src/lib/git.mjs",
        "packages/workflow-kit/src/lib/installer.mjs",
        "packages/workflow-kit/src/lib/task-files.mjs",
        "packages/workflow-kit/src/templates/CONTINUE.md",
        "resources/workspace-setup-worker.mjs",
        "tests/workspace-setup.test.mjs"
      ]
    },
    {
      "id": "W001",
      "title": "Исполнитель на Windows: команды, патч, поиск Codex, статус",
      "why": "На Windows работает прежний мост с 38 самодельными инструментами. Чтобы платформы были одинаковы, тот же исполнитель Codex App Server должен работать на Windows; в server.py и app_server_client.py зашиты пути и команды macOS.",
      "dependencies": [
        "T002"
      ],
      "functional_paths": [
        "tools/codex-app-server-mcp/server.py",
        "tools/codex-app-server-mcp/app_server_client.py",
        "tests/codex-app-server-mcp.test.mjs"
      ],
      "documentation_paths": [
        "docs/planning/context-as-text.md"
      ],
      "verification_ids": [
        "executor-channel",
        "unit-all",
        "codex-tools-live"
      ],
      "verification_kind": "code",
      "acceptance_criteria": [
        "app_server_client.py находит Codex на Windows (PATH, глобальная установка npm, приложение ChatGPT) и запускает codex app-server; на macOS поиск прежний",
        "exec_command на Windows по умолчанию запускает PowerShell с тем же смыслом login; write_stdin, сессии, Ctrl-C, пределы и формат ответа те же, что на macOS",
        "apply_patch на Windows исполняет apply_patch, который Codex кладёт в PATH процесса; проверка его наличия в bridge_status не использует /usr/bin/which",
        "Каталог состояния на Windows — в LOCALAPPDATA; пути и кодировка вывода обрабатываются без потерь",
        "Платформенные различия собраны в отдельных ветках и покрыты модульными тестами с подменой платформы; поведение и тесты macOS не меняются"
      ],
      "expected_commit_message": "feat: Исполнитель на Windows: команды, патч, поиск Codex, статус",
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "context-as-text-0.6.96-20261006",
        "task_id": "W001",
        "role": "implementation"
      }
    },
    {
      "id": "W002",
      "title": "Исполнитель на Windows: изображения, окна, снимки, уведомления",
      "why": "view_image, список окон, снимки и уведомление turn_watchdog на macOS вызывают file, sips, screencapture и osascript. В закреплённом Windows-архиве есть готовый код для окон, снимков и уведомлений.",
      "dependencies": [
        "W001"
      ],
      "functional_paths": [
        "tools/codex-app-server-mcp/server.py",
        "tests/codex-app-server-mcp.test.mjs"
      ],
      "documentation_paths": [
        "docs/planning/context-as-text.md"
      ],
      "verification_ids": [
        "executor-channel",
        "unit-all"
      ],
      "verification_kind": "code",
      "acceptance_criteria": [
        "view_image определяет тип изображения без внешней команды file и уменьшает его до 1600 точек на обеих платформах; отказы (не изображение, слишком большой файл, защищённый путь) прежние",
        "computer_list_windows, computer_capture_screen и computer_capture_window на Windows возвращают те же поля и тот же двухблочный результат (JSON и image/png), что на macOS",
        "Уведомление turn_watchdog на Windows показывается штатным средством системы",
        "Код Windows для окон, снимков и уведомлений взят из закреплённого архива и приведён к интерфейсу исполнителя; управление интерфейсом (мышь, клавиатура, активация окон) не переносится",
        "Модульные тесты с подменой платформы покрывают разбор результатов; поведение и тесты macOS не меняются"
      ],
      "expected_commit_message": "feat: Исполнитель на Windows: изображения, окна, снимки, уведомления",
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "context-as-text-0.6.96-20261006",
        "task_id": "W002",
        "role": "implementation"
      }
    },
    {
      "id": "W003",
      "title": "Службы исполнителя на Windows: установка, запуск, туннель, автозапуск",
      "why": "control.py исполнителя отказывается работать вне macOS: установка через uv, запуск и опознание процессов, архив tunnel-client и автозапуск написаны под macOS и LaunchAgent.",
      "dependencies": [
        "W001"
      ],
      "functional_paths": [
        "tools/codex-app-server-mcp/control.py",
        "tools/codex-app-server-mcp/tunnel_prompt.py",
        "tests/codex-app-server-mcp.test.mjs"
      ],
      "documentation_paths": [
        "docs/planning/context-as-text.md"
      ],
      "verification_ids": [
        "executor-channel",
        "unit-all"
      ],
      "verification_kind": "code",
      "acceptance_criteria": [
        "control.py на Windows выполняет setup, start, stop, status, configure-tunnel, выбор канала и selector-start с тем же JSON-ответом, что на macOS",
        "Окружение Python создаётся uv из закреплённого архива с теми же закреплёнными зависимостями; tunnel-client берётся из того же архива; MinGit и ripgrep доступны командам исполнителя",
        "Процессы MCP и туннеля запускаются отдельно от окна, опознаются и останавливаются без /bin/ps; повторный start идемпотентен",
        "Автозапуск служб при входе в Windows настраивается и снимается управляемо, без прав администратора",
        "Ввод ID и ключа туннеля работает на Windows; ключ не печатается и не попадает в журналы",
        "Поведение и тесты macOS не меняются"
      ],
      "expected_commit_message": "feat: Службы исполнителя на Windows: установка, запуск, туннель, автозапуск",
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "context-as-text-0.6.96-20261006",
        "task_id": "W003",
        "role": "implementation"
      }
    },
    {
      "id": "W004",
      "title": "Web Pilot на Windows работает через исполнитель; переход с прежнего runtime",
      "why": "Приложение на Windows ставит и запускает прежний мост из архива (WindowsRuntimeBootstrap, McpRuntime) и хранит папку runtime в настройках; на macOS исполнитель ставится из состава приложения без выбора папки.",
      "dependencies": [
        "W003",
        "T001"
      ],
      "functional_paths": [
        "src/mac-runtime-switch.mjs",
        "src/windows-runtime.mjs",
        "src/mcp-runtime.mjs",
        "src/platform.mjs",
        "src/startup-platform.mjs",
        "src/startup-readiness.mjs",
        "src/main.mjs",
        "src/context-session.mjs",
        "src/ui/startup.mjs",
        "src/ui/sidebar.mjs",
        "src/ui/index.html",
        "tests/mac-runtime-switch.test.mjs",
        "tests/windows-runtime.test.mjs",
        "tests/windows-first-run.test.mjs",
        "tests/windows-autostart.test.mjs",
        "tests/mcp-runtime.test.mjs",
        "tests/startup-platform.test.mjs",
        "tests/startup-readiness.test.mjs",
        "tests/context-session.test.mjs"
      ],
      "documentation_paths": [
        "docs/planning/context-as-text.md"
      ],
      "verification_ids": [
        "unit-all",
        "electron-smoke"
      ],
      "verification_kind": "code",
      "acceptance_criteria": [
        "На Windows приложение синхронизирует исполнитель из своего состава в данные приложения, ставит его и запускает службы тем же порядком, что на macOS; папка runtime в настройках больше не используется",
        "Мастер первого запуска на Windows проверяет наличие Codex и объясняет, что его нужно установить; отказ запуска служб не закрывает приложение, следующая попытка повторяет запуск",
        "При первом запуске после обновления прежний мост останавливается, его автозапуск снимается, настроенный туннель переносится, если у исполнителя своего нет; папки пользователя вне данных приложения не удаляются",
        "Стартовое сообщение и правила сессии одинаковы на обеих платформах; LocalMcpClient нигде не требует workflow_context_recover",
        "Workflow Kit на Windows по-прежнему получает переносимый Node и MinGit; создание и подключение проектов работают как раньше",
        "Экспорты src/chatgpt-dom.mjs, src/chatgpt-composer.mjs, src/chatgpt-experience.mjs и формат pageScript не меняются; поведение macOS не меняется"
      ],
      "expected_commit_message": "feat: Web Pilot на Windows работает через исполнитель; переход с прежнего runtime",
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "context-as-text-0.6.96-20261006",
        "task_id": "W004",
        "role": "implementation"
      }
    },
    {
      "id": "W005",
      "title": "Канал VPS и переключатель каналов на Windows",
      "why": "Выбор канала ChatGPT (Secure MCP Tunnel или свой сервер) доступен только на macOS: туннель VPS держит LaunchAgent, а обработчики настроек отказывают на других платформах.",
      "dependencies": [
        "W004"
      ],
      "functional_paths": [
        "src/vps-tunnel.mjs",
        "src/main.mjs",
        "src/ui/settings-panel.mjs",
        "src/ui/index.html",
        "tests/vps-tunnel.test.mjs",
        "tests/settings-chatgpt-channel.test.mjs"
      ],
      "documentation_paths": [
        "docs/planning/context-as-text.md"
      ],
      "verification_ids": [
        "unit-all"
      ],
      "verification_kind": "code",
      "acceptance_criteria": [
        "На Windows настройки показывают тот же раздел «Подключение ChatGPT» с теми же двумя каналами и той же проверкой состояния, что на macOS",
        "Туннель VPS на Windows — ssh из состава системы с тем же пробросом порта и тем же псевдонимом в ~/.ssh/config; за запуском при входе и перезапуском после обрыва следит служба Web Pilot",
        "Конфликт с RemoteForward в ~/.ssh/config, несовпадение порта и последняя ошибка показываются так же, как на macOS",
        "В канале VPS tunnel-client при входе не запускается; адрес коннектора по-прежнему уходит только в буфер обмена",
        "Поведение и тесты канала на macOS не меняются"
      ],
      "expected_commit_message": "feat: Канал VPS и переключатель каналов на Windows",
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "context-as-text-0.6.96-20261006",
        "task_id": "W005",
        "role": "implementation"
      }
    },
    {
      "id": "W006",
      "title": "Windows-пакет без прежнего моста; проверка пакета",
      "why": "Сборка Windows подключает закреплённый архив ради прежнего моста и накладывает на него правки. После W001–W005 из архива нужны только MinGit, ripgrep, tunnel-client и uv.",
      "dependencies": [
        "W005",
        "W002"
      ],
      "functional_paths": [
        "src/windows-runtime.mjs",
        "scripts/prepare-windows-toolchain.mjs",
        "scripts/verify-windows-package.mjs",
        "scripts/release-all.mjs",
        "tests/windows-runtime.test.mjs",
        "tests/release-all.test.mjs"
      ],
      "documentation_paths": [
        "docs/planning/context-as-text.md"
      ],
      "verification_ids": [
        "unit-all"
      ],
      "verification_kind": "code",
      "acceptance_criteria": [
        "Наложение правок на прежний мост (patchWindowsBridgeSource, удаление инструментов интерфейса, правка skill, WINDOWS_CONTEXT_PACKET_SOURCE) удалено вместе с тестами на него",
        "Закреплённый архив Windows-Codex-Local-2026-09-10.zip используется только как источник MinGit, ripgrep, tunnel-client и uv; его имя и SHA-256 не меняются",
        "verify:win проверяет, что Windows-пакет содержит исполнитель (server.py, app_server_client.py, control.py, codex-tools.lock.json) и не запускает прежний мост",
        "В поставке по-прежнему шесть файлов; releaseAssetNames не меняется"
      ],
      "expected_commit_message": "feat: Windows-пакет без прежнего моста; проверка пакета",
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "context-as-text-0.6.96-20261006",
        "task_id": "W006",
        "role": "implementation"
      }
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "context-as-text-0.6.96-20261006",
        "task_id": "T005",
        "role": "implementation"
      },
      "dependencies": [
        "M001",
        "M002",
        "T001",
        "T002",
        "T003",
        "T004",
        "K001",
        "W001",
        "W002",
        "W003",
        "W004",
        "W005",
        "W006"
      ],
      "functional_paths": [
        "package.json",
        "package-lock.json"
      ],
      "documentation_paths": [
        "docs/planning/context-as-text.md",
        "AGENTS.md",
        "README.md",
        "docs/PRODUCT.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/architecture/OVERVIEW.md",
        "docs/MODULES.md",
        "docs/DOCUMENTATION_INDEX.md",
        "docs/DECISIONS.md",
        "docs/VERIFICATION.md",
        "docs/RELEASE.md",
        "docs/CONTEXT_DELIVERY.md",
        "docs/modules/codex-app-server-executor.md",
        "docs/CLEAN_INSTALL.md",
        "docs/SOURCE_WORKSPACES.md",
        "docs/TRANSFER_TO_WINDOWS.md",
        "docs/WORKFLOW_START.md",
        "docs/modules/workflow-kit-recovery.md",
        "docs/planning/codex-native-tools-macos.md"
      ],
      "verification_ids": [
        "unit-all",
        "electron-smoke",
        "codex-tools-live"
      ],
      "id": "T005",
      "title": "Подготовить source версии 0.6.96 и проверить релизный исходник",
      "why": "Правки доходят до пользователя новой сборкой; весь код проверяется до первой сборки. Список документов задаёт охват DOCS: все документы проекта, включая README и проектную часть AGENTS.md.",
      "verification_kind": "code",
      "acceptance_criteria": [
        "package.json и package-lock.json задают 0.6.96",
        "Полный npm test, Electron smoke и сверка определений с Codex 0.160.0 проходят до первой сборки",
        "Сборка, установка и публикация на этом шаге не выполняются",
        "Следующая за этой задачей DOCS синхронизирует все перечисленные документы, включая README.md, docs/CONTEXT_DELIVERY.md и проектную часть AGENTS.md (блок Workflow Kit в AGENTS.md не трогать)"
      ],
      "expected_commit_message": "feat: Подготовить source версии 0.6.96 и проверить релизный исходник"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "context-as-text-0.6.96-20261006",
        "task_id": "DOCS",
        "role": "implementation"
      },
      "dependencies": [
        "C001",
        "C002",
        "M001",
        "M002",
        "T001",
        "T002",
        "T003",
        "T004",
        "K001",
        "W001",
        "W002",
        "W003",
        "W004",
        "W005",
        "W006",
        "T005"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/planning/context-as-text.md",
        "docs/PRODUCT.md",
        "docs/architecture/ARCHITECTURE.md",
        "tools/codex-app-server-mcp/session-rules.md",
        "AGENTS.md",
        "README.md",
        "docs/architecture/OVERVIEW.md",
        "docs/MODULES.md",
        "docs/DOCUMENTATION_INDEX.md",
        "docs/DECISIONS.md",
        "docs/VERIFICATION.md",
        "docs/RELEASE.md",
        "docs/CONTEXT_DELIVERY.md",
        "docs/modules/codex-app-server-executor.md",
        "docs/CLEAN_INSTALL.md",
        "docs/SOURCE_WORKSPACES.md",
        "docs/TRANSFER_TO_WINDOWS.md",
        "docs/WORKFLOW_START.md",
        "docs/modules/workflow-kit-recovery.md",
        "docs/planning/codex-native-tools-macos.md",
        "packages/workflow-kit/README.md",
        "packages/workflow-kit/docs/modules/workflow-kit-package.md",
        "packages/workflow-kit/src/templates/CONTINUE.md",
        "docs/WORKSPACE_SETUP.md",
        "docs/modules/session-owned-plans.md",
        "docs/planning/mcp-sequential-parts-kit-1.5.4.md",
        "docs/planning/release-backups-kit-1.5.5.md",
        "packages/workflow-kit/docs/DOCUMENTATION_INDEX.md",
        "packages/workflow-kit/docs/MODULES.md",
        "packages/workflow-kit/docs/PRODUCT.md",
        "packages/workflow-kit/docs/WORKFLOW_START.md",
        "packages/workflow-kit/docs/architecture/ARCHITECTURE.md",
        "packages/workflow-kit/docs/architecture/OVERVIEW.md"
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
        "scope_id": "context-as-text-0.6.96-20261006",
        "task_id": "T006",
        "role": "implementation"
      },
      "dependencies": [
        "T005",
        "DOCS"
      ],
      "functional_paths": [
        "scripts/release-all.mjs"
      ],
      "documentation_paths": [
        "docs/planning/context-as-text.md"
      ],
      "verification_ids": [
        "paired-release"
      ],
      "id": "T006",
      "title": "Собрать и проверить парный релиз 0.6.96",
      "why": "Пересобрать релиз после правок.",
      "verification_kind": "package",
      "acceptance_criteria": [
        "Preflight identity записан до сборки; сборку выполняет проверка paired-release при коммите этой задачи, один раз и только после завершённой DOCS",
        "~/Downloads/WebPilot-0.6.96 собран из коммита после DOCS, packagedSourceMatches=true, bundled Workflow Kit 1.5.6, в поставке шесть файлов; executor в пакете не содержит session-rules.md",
        "Windows-пакет содержит исполнитель и закреплённый архив с прежним SHA-256; GitHub Release на этом шаге не публикуется"
      ],
      "expected_commit_message": "feat: Собрать и проверить парный релиз 0.6.96"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "context-as-text-0.6.96-20261006",
        "task_id": "T007",
        "role": "implementation"
      },
      "dependencies": [
        "T006",
        "DOCS"
      ],
      "functional_paths": [
        "scripts/check-installed-release.mjs"
      ],
      "documentation_paths": [
        "docs/planning/context-as-text.md"
      ],
      "verification_ids": [
        "release-installed"
      ],
      "id": "T007",
      "title": "Установить 0.6.96 и проверить установленные macOS-копии",
      "why": "Пользователь работает из /Applications.",
      "verification_kind": "installed",
      "acceptance_criteria": [
        "/Applications/Project Web Pilot.app и root app обновлены до 0.6.96 из уже собранного staging без пересборки; identity сохранена",
        "Исполнитель внутри установленного приложения совпадает с исходником релиза",
        "Интерфейсом компьютера агент не управляет"
      ],
      "expected_commit_message": "feat: Установить 0.6.96 и проверить установленные macOS-копии"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "context-as-text-0.6.96-20261006",
        "task_id": "T008",
        "role": "implementation"
      },
      "dependencies": [
        "T007",
        "DOCS"
      ],
      "functional_paths": [
        "scripts/check-github-release.mjs"
      ],
      "documentation_paths": [
        "docs/planning/context-as-text.md"
      ],
      "verification_ids": [
        "github-release"
      ],
      "id": "T008",
      "title": "Опубликовать GitHub Release v0.6.96 и синхронизировать main",
      "why": "Отправить релиз на GitHub.",
      "verification_kind": "package",
      "acceptance_criteria": [
        "Tag v0.6.96 указывает на release-manifest.sourceCommit",
        "GitHub Release v0.6.96 содержит ровно шесть ожидаемых файлов, их digests совпадают с локальной поставкой",
        "origin/main после managed commit совпадает с локальным HEAD; повторная сборка при публикации не выполняется"
      ],
      "expected_commit_message": "feat: Опубликовать GitHub Release v0.6.96 и синхронизировать main"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "context-as-text-0.6.96-20261006",
        "task_id": "T009",
        "role": "implementation"
      },
      "dependencies": [
        "T008",
        "DOCS"
      ],
      "functional_paths": [
        "scripts/check-workflow-kit-archive.mjs"
      ],
      "documentation_paths": [
        "docs/planning/context-as-text.md",
        "docs/RELEASE.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "workflow-kit-archive"
      ],
      "id": "T009",
      "title": "Прежний репозиторий WorkflowKit: только чтение и ссылка на новый дом",
      "why": "После объединения пакет живёт в packages/workflow-kit. Прежний репозиторий на GitHub должен перестать принимать изменения и указывать, куда переехал, иначе появятся две расходящиеся копии.",
      "verification_kind": "package",
      "acceptance_criteria": [
        "README прежнего репозитория первой строкой сообщает, что пакет переехал в packages/workflow-kit репозитория Project-Web-Pilot; правка сделана управляемым коммитом его плана и отправлена в его origin/main",
        "Репозиторий OleynikAleksandr/WorkflowKit на GitHub переведён в архив (только чтение); это действие выполняется только в этой задаче, после публикации релиза",
        "Локальная папка /Users/oleksandroliinyk/VSCODE/WorkflowKit не удаляется и не меняется сверх названного коммита",
        "scripts/check-workflow-kit-archive.mjs подтверждает архивный статус и ссылку запросом к GitHub; docs/RELEASE.md называет последний коммит прежнего репозитория"
      ],
      "expected_commit_message": "feat: Прежний репозиторий WorkflowKit: только чтение и ссылка на новый дом"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "context-as-text-0.6.96-20261006",
        "task_id": "T010",
        "role": "implementation"
      },
      "dependencies": [
        "T009",
        "DOCS"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/planning/context-as-text.md",
        "AGENTS.md",
        "README.md",
        "docs/PRODUCT.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/architecture/OVERVIEW.md",
        "docs/MODULES.md",
        "docs/DOCUMENTATION_INDEX.md",
        "docs/DECISIONS.md",
        "docs/VERIFICATION.md",
        "docs/RELEASE.md",
        "docs/CONTEXT_DELIVERY.md",
        "docs/modules/codex-app-server-executor.md",
        "docs/CLEAN_INSTALL.md",
        "docs/SOURCE_WORKSPACES.md",
        "docs/TRANSFER_TO_WINDOWS.md",
        "docs/WORKFLOW_START.md",
        "docs/modules/workflow-kit-recovery.md",
        "docs/planning/codex-native-tools-macos.md"
      ],
      "verification_ids": [
        "github-release"
      ],
      "id": "T010",
      "title": "Послерелизная сверка всех документов и README, синхронизация origin/main",
      "why": "DOCS пишется до сборки и называет версию исходниками; после публикации документы должны называть её опубликованной.",
      "verification_kind": "package",
      "acceptance_criteria": [
        "README.md и все перечисленные документы называют 0.6.96 текущим опубликованным и установленным релизом, 0.6.95 — предыдущим",
        "Ни в README, ни в docs, ни в AGENTS.md нет строк, называющих текущую версию подготовленной или несобранной, и нет описания чтения контекста через MCP как действующего способа на macOS",
        "docs/VERIFICATION.md и docs/RELEASE.md содержат итог релиза: проверки, sourceCommit, шесть файлов поставки, последний коммит прежнего репозитория WorkflowKit",
        "origin/main совпадает с финальным локальным HEAD после публикации",
        "Ни один документ не описывает Workflow Kit как отдельный действующий репозиторий"
      ],
      "expected_commit_message": "feat: Послерелизная сверка всех документов и README, синхронизация origin/main"
    }
  ],
  "blocked_reason": null,
  "user_decisions": [
    {
      "id": "fc94f80e-ea21-4b06-8fd3-06030110ec53",
      "text": "Поручение пользователя 06.10.2026: по итогам разбора «что было — что стало» подготовить планировочный документ и to-do план рефакторинга «контекст текстом, MCP только инструменты» и разместить их в workspace Project Web Pilot; вернуться к полноразмерному тексту в поле ввода, вложение файлом — запасной вариант. Выполнение плана — по отдельному поручению.",
      "recorded_at": "2026-10-06T06:07:24.175Z"
    }
  ]
}
```
<!-- workflow-state:end -->

## Состояние

Execution Scope Status: ACTIVE
Delivery Status: IN_PROGRESS
Scope: context-as-text-0.6.96-20261006
Current Task: нет
Revision: 1323

## Цель

Объединить репозитории Project Web Pilot и Workflow Kit; вернуть доставку контекста текстом и оставить в MCP только инструменты (девять); исправить дефекты Workflow Kit (1.5.6); сделать macOS и Windows одинаковыми по возможностям и способам — Windows работает через тот же исполнитель Codex App Server; синхронизировать все документы, включая README; выпустить Project Web Pilot 0.6.96.

## Критерии приёмки

- На обеих платформах новая сессия начинается одним стартовым сообщением с правилами и полным пакетом recovery; режим MCP-доставки удалён
- Каталог MCP на обеих платформах — одни и те же девять инструментов; workflow_context_recover, протокол частей, session-rules.md и active-workspace.json удалены
- Сообщение автопродолжения несёт текст следующей задачи из плана; в меню проекта есть строка для внешнего клиента
- Workflow Kit — пакет packages/workflow-kit в этом репозитории; версия 1.5.6 исправляет вставку задачи в середину плана и ложный PRIVATE_CONTEXT; прежний репозиторий WorkflowKit на GitHub переведён в архив со ссылкой на новый дом
- Windows работает через исполнитель Codex App Server с теми же каналами ChatGPT, тем же жизненным циклом служб и теми же настройками, что macOS; прежний Windows-мост не используется
- Экспорты трёх browser-модулей и формат pageScript, codex-tools.lock.json, состав и SHA-256 закреплённого Windows-архива не изменены; поведение macOS не ухудшено
- Все документы проекта, включая README.md и проектную часть AGENTS.md, синхронизированы до сборки (DOCS) и после публикации
- Релиз 0.6.96 собран один раз, установлен в /Applications, опубликован на GitHub; main синхронизирован; приёмка на живой Windows — за пользователем

## Микрозадачи

- [DONE] C001: Зафиксировать расширенный контракт релиза 0.6.96 — Завершено
  - Git Commit: [DONE] docs: расширить контракт 0.6.96 — Workflow Kit 1.5.6 и паритет Windows
  - Reference: context-as-text-0.6.96-20261006 / C001 / implementation
  - Файлы: docs/planning/context-as-text.md
- [DONE] C002: Зафиксировать в контракте объединение репозиториев — Завершено
  - Git Commit: [DONE] docs: дополнить контракт 0.6.96 — объединение репозиториев
  - Reference: context-as-text-0.6.96-20261006 / C002 / implementation
  - Файлы: docs/planning/context-as-text.md
- [DONE] M001: Объединить репозитории: Workflow Kit становится пакетом packages/workflow-kit — Завершено
  - Git Commit: [DONE] feat: Объединить репозитории: Workflow Kit становится пакетом packages/workflow-kit
  - Reference: context-as-text-0.6.96-20261006 / M001 / implementation
  - Файлы: package.json, package-lock.json, .gitignore, scripts/stage-workflow-kit.mjs, scripts/check-workflow-kit-dependency.mjs, scripts/check-workflow-kit-staging.mjs, scripts/release-all.mjs, tests/workflow-kit-source.test.mjs, tests/workflow-kit-recovery.test.mjs, tests/release-all.test.mjs, packages/workflow-kit/package.json, packages/workflow-kit/.gitattributes, packages/workflow-kit/.gitignore, packages/workflow-kit/scripts/check-consumer-contract.mjs, packages/workflow-kit/scripts/check-package.mjs, packages/workflow-kit/scripts/check-runtime-fixture.mjs, scripts/check-installed-release.mjs, scripts/verify-windows-package.mjs, docs/planning/context-as-text.md
- [DONE] M002: Документы Workflow Kit в составе проекта — Завершено
  - Git Commit: [DONE] docs: документы Workflow Kit в составе проекта
  - Reference: context-as-text-0.6.96-20261006 / M002 / implementation
  - Файлы: docs/planning/context-as-text.md, AGENTS.md, docs/SOURCE_WORKSPACES.md, docs/MODULES.md, docs/DOCUMENTATION_INDEX.md, docs/architecture/OVERVIEW.md, docs/modules/workflow-kit-recovery.md, packages/workflow-kit/README.md, packages/workflow-kit/docs/modules/workflow-kit-package.md, README.md, docs/WORKFLOW_START.md, docs/WORKSPACE_SETUP.md, docs/modules/session-owned-plans.md, docs/planning/mcp-sequential-parts-kit-1.5.4.md, docs/planning/release-backups-kit-1.5.5.md, packages/workflow-kit/docs/DOCUMENTATION_INDEX.md, packages/workflow-kit/docs/MODULES.md, packages/workflow-kit/docs/PRODUCT.md, packages/workflow-kit/docs/WORKFLOW_START.md, packages/workflow-kit/docs/architecture/ARCHITECTURE.md, packages/workflow-kit/docs/architecture/OVERVIEW.md
- [DONE] T001: Стартовое сообщение macOS несёт полный контекст; режим MCP-доставки удалён из клиента — Завершено
  - Git Commit: [DONE] feat: Стартовое сообщение macOS несёт полный контекст; режим MCP-доставки удалён из клиента
  - Reference: context-as-text-0.6.96-20261006 / T001 / implementation
  - Файлы: src/mac-runtime-switch.mjs, src/context-session.mjs, src/mcp-runtime.mjs, src/ui/sidebar.mjs, src/ui/progress.mjs, src/ui/index.html, src/main.mjs, tests/context-session.test.mjs, tests/mac-runtime-switch.test.mjs, tests/mcp-runtime.test.mjs, tests/sidebar.test.mjs, tests/progress.test.mjs, docs/planning/context-as-text.md
- [DONE] T002: MCP без доставки контекста: каталог из девяти инструментов — Завершено
  - Git Commit: [DONE] feat: MCP без доставки контекста: каталог из девяти инструментов
  - Reference: context-as-text-0.6.96-20261006 / T002 / implementation
  - Файлы: tools/codex-app-server-mcp/server.py, tests/codex-app-server-mcp.test.mjs, src/mac-runtime-switch.mjs, tests/mac-runtime-switch.test.mjs, docs/planning/context-as-text.md, tools/codex-app-server-mcp/session-rules.md
- [DONE] T003: Автопродолжение несёт текст следующей задачи — Завершено
  - Git Commit: [DONE] feat: Автопродолжение несёт текст следующей задачи
  - Reference: context-as-text-0.6.96-20261006 / T003 / implementation
  - Файлы: src/auto-plan.mjs, tests/auto-plan.test.mjs, src/auto-plan-state.mjs, tests/electron-smoke.mjs, docs/planning/context-as-text.md
- [DONE] T004: Строка для внешнего клиента в меню проекта — Завершено
  - Git Commit: [DONE] feat: Строка для внешнего клиента в меню проекта
  - Reference: context-as-text-0.6.96-20261006 / T004 / implementation
  - Файлы: src/ui/sidebar.mjs, src/main.mjs, src/preload.cjs, tests/sidebar.test.mjs, src/context-session.mjs, src/ui/progress.mjs, tests/context-session.test.mjs, tests/electron-smoke.mjs, docs/planning/context-as-text.md
- [DONE] K001: Workflow Kit 1.5.6: вставка задачи, подсказка о полях, ложный PRIVATE_CONTEXT — Завершено
  - Git Commit: [DONE] feat: Workflow Kit 1.5.6: вставка задачи, подсказка о полях, ложный PRIVATE_CONTEXT
  - Reference: context-as-text-0.6.96-20261006 / K001 / implementation
  - Файлы: packages/workflow-kit/src/lib/extend-plan.mjs, packages/workflow-kit/src/lib/task-files.mjs, packages/workflow-kit/src/lib/command-help.mjs, packages/workflow-kit/src/lib/common.mjs, packages/workflow-kit/package.json, packages/workflow-kit/scripts/check-runtime-fixture.mjs, tests/workflow-kit-source.test.mjs, tests/workflow-kit-recovery.test.mjs, package-lock.json, packages/workflow-kit/src/lib/git.mjs, packages/workflow-kit/src/lib/installer.mjs, resources/workspace-setup-worker.mjs, tests/workspace-setup.test.mjs, docs/planning/context-as-text.md, packages/workflow-kit/README.md, packages/workflow-kit/src/templates/CONTINUE.md, packages/workflow-kit/docs/modules/workflow-kit-package.md
- [TODO] W001: Исполнитель на Windows: команды, патч, поиск Codex, статус — Ожидает
  - Git Commit: [PENDING] feat: Исполнитель на Windows: команды, патч, поиск Codex, статус
  - Reference: context-as-text-0.6.96-20261006 / W001 / implementation
  - Файлы: tools/codex-app-server-mcp/server.py, tools/codex-app-server-mcp/app_server_client.py, tests/codex-app-server-mcp.test.mjs, docs/planning/context-as-text.md
- [TODO] W002: Исполнитель на Windows: изображения, окна, снимки, уведомления — Ожидает
  - Git Commit: [PENDING] feat: Исполнитель на Windows: изображения, окна, снимки, уведомления
  - Reference: context-as-text-0.6.96-20261006 / W002 / implementation
  - Файлы: tools/codex-app-server-mcp/server.py, tests/codex-app-server-mcp.test.mjs, docs/planning/context-as-text.md
- [TODO] W003: Службы исполнителя на Windows: установка, запуск, туннель, автозапуск — Ожидает
  - Git Commit: [PENDING] feat: Службы исполнителя на Windows: установка, запуск, туннель, автозапуск
  - Reference: context-as-text-0.6.96-20261006 / W003 / implementation
  - Файлы: tools/codex-app-server-mcp/control.py, tools/codex-app-server-mcp/tunnel_prompt.py, tests/codex-app-server-mcp.test.mjs, docs/planning/context-as-text.md
- [TODO] W004: Web Pilot на Windows работает через исполнитель; переход с прежнего runtime — Ожидает
  - Git Commit: [PENDING] feat: Web Pilot на Windows работает через исполнитель; переход с прежнего runtime
  - Reference: context-as-text-0.6.96-20261006 / W004 / implementation
  - Файлы: src/mac-runtime-switch.mjs, src/windows-runtime.mjs, src/mcp-runtime.mjs, src/platform.mjs, src/startup-platform.mjs, src/startup-readiness.mjs, src/main.mjs, src/context-session.mjs, src/ui/startup.mjs, src/ui/sidebar.mjs, src/ui/index.html, tests/mac-runtime-switch.test.mjs, tests/windows-runtime.test.mjs, tests/windows-first-run.test.mjs, tests/windows-autostart.test.mjs, tests/mcp-runtime.test.mjs, tests/startup-platform.test.mjs, tests/startup-readiness.test.mjs, tests/context-session.test.mjs, docs/planning/context-as-text.md
- [TODO] W005: Канал VPS и переключатель каналов на Windows — Ожидает
  - Git Commit: [PENDING] feat: Канал VPS и переключатель каналов на Windows
  - Reference: context-as-text-0.6.96-20261006 / W005 / implementation
  - Файлы: src/vps-tunnel.mjs, src/main.mjs, src/ui/settings-panel.mjs, src/ui/index.html, tests/vps-tunnel.test.mjs, tests/settings-chatgpt-channel.test.mjs, docs/planning/context-as-text.md
- [TODO] W006: Windows-пакет без прежнего моста; проверка пакета — Ожидает
  - Git Commit: [PENDING] feat: Windows-пакет без прежнего моста; проверка пакета
  - Reference: context-as-text-0.6.96-20261006 / W006 / implementation
  - Файлы: src/windows-runtime.mjs, scripts/prepare-windows-toolchain.mjs, scripts/verify-windows-package.mjs, scripts/release-all.mjs, tests/windows-runtime.test.mjs, tests/release-all.test.mjs, docs/planning/context-as-text.md
- [TODO] T005: Подготовить source версии 0.6.96 и проверить релизный исходник — Ожидает
  - Git Commit: [PENDING] feat: Подготовить source версии 0.6.96 и проверить релизный исходник
  - Reference: context-as-text-0.6.96-20261006 / T005 / implementation
  - Файлы: package.json, package-lock.json, docs/planning/context-as-text.md, AGENTS.md, README.md, docs/PRODUCT.md, docs/architecture/ARCHITECTURE.md, docs/architecture/OVERVIEW.md, docs/MODULES.md, docs/DOCUMENTATION_INDEX.md, docs/DECISIONS.md, docs/VERIFICATION.md, docs/RELEASE.md, docs/CONTEXT_DELIVERY.md, docs/modules/codex-app-server-executor.md, docs/CLEAN_INSTALL.md, docs/SOURCE_WORKSPACES.md, docs/TRANSFER_TO_WINDOWS.md, docs/WORKFLOW_START.md, docs/modules/workflow-kit-recovery.md, docs/planning/codex-native-tools-macos.md
- [TODO] DOCS: Актуализация всех документов проекта — Ожидает
  - Git Commit: [PENDING] docs: актуализировать контекст проекта
  - Reference: context-as-text-0.6.96-20261006 / DOCS / implementation
  - Файлы: docs/planning/context-as-text.md, docs/PRODUCT.md, docs/architecture/ARCHITECTURE.md, tools/codex-app-server-mcp/session-rules.md, AGENTS.md, README.md, docs/architecture/OVERVIEW.md, docs/MODULES.md, docs/DOCUMENTATION_INDEX.md, docs/DECISIONS.md, docs/VERIFICATION.md, docs/RELEASE.md, docs/CONTEXT_DELIVERY.md, docs/modules/codex-app-server-executor.md, docs/CLEAN_INSTALL.md, docs/SOURCE_WORKSPACES.md, docs/TRANSFER_TO_WINDOWS.md, docs/WORKFLOW_START.md, docs/modules/workflow-kit-recovery.md, docs/planning/codex-native-tools-macos.md, packages/workflow-kit/README.md, packages/workflow-kit/docs/modules/workflow-kit-package.md, packages/workflow-kit/src/templates/CONTINUE.md, docs/WORKSPACE_SETUP.md, docs/modules/session-owned-plans.md, docs/planning/mcp-sequential-parts-kit-1.5.4.md, docs/planning/release-backups-kit-1.5.5.md, packages/workflow-kit/docs/DOCUMENTATION_INDEX.md, packages/workflow-kit/docs/MODULES.md, packages/workflow-kit/docs/PRODUCT.md, packages/workflow-kit/docs/WORKFLOW_START.md, packages/workflow-kit/docs/architecture/ARCHITECTURE.md, packages/workflow-kit/docs/architecture/OVERVIEW.md
- [TODO] T006: Собрать и проверить парный релиз 0.6.96 — Ожидает
  - Git Commit: [PENDING] feat: Собрать и проверить парный релиз 0.6.96
  - Reference: context-as-text-0.6.96-20261006 / T006 / implementation
  - Файлы: scripts/release-all.mjs, docs/planning/context-as-text.md
- [TODO] T007: Установить 0.6.96 и проверить установленные macOS-копии — Ожидает
  - Git Commit: [PENDING] feat: Установить 0.6.96 и проверить установленные macOS-копии
  - Reference: context-as-text-0.6.96-20261006 / T007 / implementation
  - Файлы: scripts/check-installed-release.mjs, docs/planning/context-as-text.md
- [TODO] T008: Опубликовать GitHub Release v0.6.96 и синхронизировать main — Ожидает
  - Git Commit: [PENDING] feat: Опубликовать GitHub Release v0.6.96 и синхронизировать main
  - Reference: context-as-text-0.6.96-20261006 / T008 / implementation
  - Файлы: scripts/check-github-release.mjs, docs/planning/context-as-text.md
- [TODO] T009: Прежний репозиторий WorkflowKit: только чтение и ссылка на новый дом — Ожидает
  - Git Commit: [PENDING] feat: Прежний репозиторий WorkflowKit: только чтение и ссылка на новый дом
  - Reference: context-as-text-0.6.96-20261006 / T009 / implementation
  - Файлы: scripts/check-workflow-kit-archive.mjs, docs/planning/context-as-text.md, docs/RELEASE.md, docs/VERIFICATION.md
- [TODO] T010: Послерелизная сверка всех документов и README, синхронизация origin/main — Ожидает
  - Git Commit: [PENDING] feat: Послерелизная сверка всех документов и README, синхронизация origin/main
  - Reference: context-as-text-0.6.96-20261006 / T010 / implementation
  - Файлы: docs/planning/context-as-text.md, AGENTS.md, README.md, docs/PRODUCT.md, docs/architecture/ARCHITECTURE.md, docs/architecture/OVERVIEW.md, docs/MODULES.md, docs/DOCUMENTATION_INDEX.md, docs/DECISIONS.md, docs/VERIFICATION.md, docs/RELEASE.md, docs/CONTEXT_DELIVERY.md, docs/modules/codex-app-server-executor.md, docs/CLEAN_INSTALL.md, docs/SOURCE_WORKSPACES.md, docs/TRANSFER_TO_WINDOWS.md, docs/WORKFLOW_START.md, docs/modules/workflow-kit-recovery.md, docs/planning/codex-native-tools-macos.md

## Context Pack For This Cycle

- docs/architecture/OVERVIEW.md → Краткая архитектура проекта
- docs/MODULES.md → Модули проекта
- docs/DOCUMENTATION_INDEX.md → Каталог документации
- docs/planning/context-as-text.md

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
