# Активный план — Project Web Pilot

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 1300,
  "project_id": "cf944136-d1fc-4bd5-9ea0-e46d1fe230e7",
  "project_name": "Project Web Pilot",
  "scope_id": "context-as-text-0.6.96-20261006",
  "execution_scope_status": "ACTIVE",
  "delivery_status": "IN_PROGRESS",
  "objective": "Вернуть доставку контекста текстом: на macOS стартовое сообщение несёт полный пакет, автопродолжение несёт текст следующей задачи, для внешних клиентов есть готовая строка; из MCP удалена доставка контекста — каталог из девяти инструментов; синхронизировать все документы, включая README и документы Workflow Kit; выпустить Project Web Pilot 0.6.96.",
  "acceptance_criteria": [
    "На macOS новая сессия начинается одним стартовым сообщением с правилами и полным пакетом recovery; режим MCP-доставки удалён из клиента",
    "Каталог MCP на macOS — девять инструментов; workflow_context_recover, протокол частей, session-rules.md, active-workspace.json и инструкция про чтение контекста удалены",
    "Сообщение автопродолжения несёт текст следующей задачи из плана; логика AutoPlan не изменена",
    "В меню проекта есть строка для внешнего клиента с путём к проекту и способом получить recovery",
    "Windows-runtime и его доставка, экспорты трёх browser-модулей и формат pageScript, остальные девять инструментов, codex-tools.lock.json, канал VPS, код и версия Workflow Kit 1.5.5 не изменены",
    "Все документы проекта, включая README.md и проектную часть AGENTS.md, синхронизированы до сборки (DOCS) и после публикации; документы репозитория WorkflowKit синхронизированы и опубликованы",
    "Релиз 0.6.96 собран один раз, установлен в /Applications, опубликован на GitHub; main синхронизирован"
  ],
  "approved_scope": {
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
      "tests/progress.test.mjs",
      "tools/codex-app-server-mcp/server.py",
      "tests/codex-app-server-mcp.test.mjs",
      "src/auto-plan.mjs",
      "tests/auto-plan.test.mjs",
      "src/preload.cjs",
      "package.json",
      "package-lock.json",
      "scripts/release-all.mjs",
      "scripts/check-installed-release.mjs",
      "scripts/check-github-release.mjs"
    ],
    "documentation_paths": [
      "docs/planning/context-as-text.md",
      "tools/codex-app-server-mcp/session-rules.md",
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
      "implementation_status": "TODO",
      "commit_status": "PENDING",
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
        "LocalMcpClient на macOS не требует workflow_context_recover в каталоге сервера; для Windows требование прежнее",
        "Экспорты src/chatgpt-dom.mjs, src/chatgpt-composer.mjs, src/chatgpt-experience.mjs и формат pageScript не меняются"
      ],
      "expected_commit_message": "feat: Стартовое сообщение macOS несёт полный контекст; режим MCP-доставки удалён из клиента"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
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
        "Остальные девять инструментов, их параметры, описания и поведение, codex-tools.lock.json, Windows-runtime и его workflow_context_recover не меняются"
      ],
      "expected_commit_message": "feat: MCP без доставки контекста: каталог из девяти инструментов"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
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
        "tests/auto-plan.test.mjs"
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
      "expected_commit_message": "feat: Автопродолжение несёт текст следующей задачи"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
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
        "tests/sidebar.test.mjs"
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
      "expected_commit_message": "feat: Строка для внешнего клиента в меню проекта"
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
        "T001",
        "T002",
        "T003",
        "T004"
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
        "T001",
        "T002",
        "T003",
        "T004",
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
        "docs/planning/codex-native-tools-macos.md"
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
        "~/Downloads/WebPilot-0.6.96 собран из коммита после DOCS, packagedSourceMatches=true, bundled Workflow Kit 1.5.5, в поставке шесть файлов; executor в пакете не содержит session-rules.md",
        "Windows-runtime и его каталог не изменены; GitHub Release на этом шаге не публикуется"
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
      "functional_paths": [],
      "documentation_paths": [
        "docs/planning/context-as-text.md",
        "docs/RELEASE.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "workflow-kit-docs"
      ],
      "id": "T009",
      "title": "Синхронизировать документы Workflow Kit с выпуском 0.6.96",
      "why": "Документы репозитория WorkflowKit называют текущим клиентом Web Pilot 0.6.95.",
      "verification_kind": "package",
      "acceptance_criteria": [
        "README.md, docs/PRODUCT.md, docs/architecture/OVERVIEW.md, docs/modules/workflow-kit-package.md и docs/DOCUMENTATION_INDEX.md репозитория WorkflowKit называют текущим клиентом опубликованный Web Pilot 0.6.96 с bundled Workflow Kit 1.5.5",
        "Правка выполнена собственным планом Workflow Kit в репозитории WorkflowKit и только в документах; код, версия 1.5.5 и состав runtime не изменены",
        "Коммиты WorkflowKit отправлены в его origin/main; worktree чистый",
        "docs/RELEASE.md Web Pilot называет коммит синхронизации WorkflowKit"
      ],
      "expected_commit_message": "feat: Синхронизировать документы Workflow Kit с выпуском 0.6.96"
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
        "docs/VERIFICATION.md и docs/RELEASE.md содержат итог релиза: проверки, sourceCommit, шесть файлов поставки, коммит синхронизации WorkflowKit",
        "origin/main совпадает с финальным локальным HEAD после публикации"
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
Revision: 1300

## Цель

Вернуть доставку контекста текстом: на macOS стартовое сообщение несёт полный пакет, автопродолжение несёт текст следующей задачи, для внешних клиентов есть готовая строка; из MCP удалена доставка контекста — каталог из девяти инструментов; синхронизировать все документы, включая README и документы Workflow Kit; выпустить Project Web Pilot 0.6.96.

## Критерии приёмки

- На macOS новая сессия начинается одним стартовым сообщением с правилами и полным пакетом recovery; режим MCP-доставки удалён из клиента
- Каталог MCP на macOS — девять инструментов; workflow_context_recover, протокол частей, session-rules.md, active-workspace.json и инструкция про чтение контекста удалены
- Сообщение автопродолжения несёт текст следующей задачи из плана; логика AutoPlan не изменена
- В меню проекта есть строка для внешнего клиента с путём к проекту и способом получить recovery
- Windows-runtime и его доставка, экспорты трёх browser-модулей и формат pageScript, остальные девять инструментов, codex-tools.lock.json, канал VPS, код и версия Workflow Kit 1.5.5 не изменены
- Все документы проекта, включая README.md и проектную часть AGENTS.md, синхронизированы до сборки (DOCS) и после публикации; документы репозитория WorkflowKit синхронизированы и опубликованы
- Релиз 0.6.96 собран один раз, установлен в /Applications, опубликован на GitHub; main синхронизирован

## Микрозадачи

- [TODO] T001: Стартовое сообщение macOS несёт полный контекст; режим MCP-доставки удалён из клиента — Ожидает
  - Git Commit: [PENDING] feat: Стартовое сообщение macOS несёт полный контекст; режим MCP-доставки удалён из клиента
  - Reference: context-as-text-0.6.96-20261006 / T001 / implementation
  - Файлы: src/mac-runtime-switch.mjs, src/context-session.mjs, src/mcp-runtime.mjs, src/ui/sidebar.mjs, src/ui/progress.mjs, src/ui/index.html, src/main.mjs, tests/context-session.test.mjs, tests/mac-runtime-switch.test.mjs, tests/mcp-runtime.test.mjs, tests/sidebar.test.mjs, tests/progress.test.mjs, docs/planning/context-as-text.md
- [TODO] T002: MCP без доставки контекста: каталог из девяти инструментов — Ожидает
  - Git Commit: [PENDING] feat: MCP без доставки контекста: каталог из девяти инструментов
  - Reference: context-as-text-0.6.96-20261006 / T002 / implementation
  - Файлы: tools/codex-app-server-mcp/server.py, tests/codex-app-server-mcp.test.mjs, src/mac-runtime-switch.mjs, tests/mac-runtime-switch.test.mjs, docs/planning/context-as-text.md, tools/codex-app-server-mcp/session-rules.md
- [TODO] T003: Автопродолжение несёт текст следующей задачи — Ожидает
  - Git Commit: [PENDING] feat: Автопродолжение несёт текст следующей задачи
  - Reference: context-as-text-0.6.96-20261006 / T003 / implementation
  - Файлы: src/auto-plan.mjs, tests/auto-plan.test.mjs, docs/planning/context-as-text.md
- [TODO] T004: Строка для внешнего клиента в меню проекта — Ожидает
  - Git Commit: [PENDING] feat: Строка для внешнего клиента в меню проекта
  - Reference: context-as-text-0.6.96-20261006 / T004 / implementation
  - Файлы: src/ui/sidebar.mjs, src/main.mjs, src/preload.cjs, tests/sidebar.test.mjs, docs/planning/context-as-text.md
- [TODO] T005: Подготовить source версии 0.6.96 и проверить релизный исходник — Ожидает
  - Git Commit: [PENDING] feat: Подготовить source версии 0.6.96 и проверить релизный исходник
  - Reference: context-as-text-0.6.96-20261006 / T005 / implementation
  - Файлы: package.json, package-lock.json, docs/planning/context-as-text.md, AGENTS.md, README.md, docs/PRODUCT.md, docs/architecture/ARCHITECTURE.md, docs/architecture/OVERVIEW.md, docs/MODULES.md, docs/DOCUMENTATION_INDEX.md, docs/DECISIONS.md, docs/VERIFICATION.md, docs/RELEASE.md, docs/CONTEXT_DELIVERY.md, docs/modules/codex-app-server-executor.md, docs/CLEAN_INSTALL.md, docs/SOURCE_WORKSPACES.md, docs/TRANSFER_TO_WINDOWS.md, docs/WORKFLOW_START.md, docs/modules/workflow-kit-recovery.md, docs/planning/codex-native-tools-macos.md
- [TODO] DOCS: Актуализация всех документов проекта — Ожидает
  - Git Commit: [PENDING] docs: актуализировать контекст проекта
  - Reference: context-as-text-0.6.96-20261006 / DOCS / implementation
  - Файлы: docs/planning/context-as-text.md, docs/PRODUCT.md, docs/architecture/ARCHITECTURE.md, tools/codex-app-server-mcp/session-rules.md, AGENTS.md, README.md, docs/architecture/OVERVIEW.md, docs/MODULES.md, docs/DOCUMENTATION_INDEX.md, docs/DECISIONS.md, docs/VERIFICATION.md, docs/RELEASE.md, docs/CONTEXT_DELIVERY.md, docs/modules/codex-app-server-executor.md, docs/CLEAN_INSTALL.md, docs/SOURCE_WORKSPACES.md, docs/TRANSFER_TO_WINDOWS.md, docs/WORKFLOW_START.md, docs/modules/workflow-kit-recovery.md, docs/planning/codex-native-tools-macos.md
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
- [TODO] T009: Синхронизировать документы Workflow Kit с выпуском 0.6.96 — Ожидает
  - Git Commit: [PENDING] feat: Синхронизировать документы Workflow Kit с выпуском 0.6.96
  - Reference: context-as-text-0.6.96-20261006 / T009 / implementation
  - Файлы: docs/planning/context-as-text.md, docs/RELEASE.md, docs/VERIFICATION.md
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
