# Активный план — Project Web Pilot

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 34,
  "project_id": "cf944136-d1fc-4bd5-9ea0-e46d1fe230e7",
  "project_name": "Project Web Pilot",
  "scope_id": "codex-app-server-mcp-035",
  "execution_scope_status": "ACTIVE",
  "delivery_status": "IN_PROGRESS",
  "objective": "Создать отдельный экспериментальный MCP для macOS, который предоставляет модели ChatGPT Web локальные инструменты через Codex App Server как исполнитель без запуска второго модельного агента, включая Computer Use, и подготовить безопасное A/B-сравнение с существующим Codex Local Mac.",
  "acceptance_criteria": [
    "Экспериментальный MCP запускается отдельно от штатного Codex Local Mac и не требует изменения кода Web Pilot для подключения в ChatGPT.",
    "По локальным возможностям новый MCP не уже существующего Codex Local Mac: доступны локальные файлы, поиск, Git, команды/процессы, Computer Use и иные реально локальные capabilities, необходимые модели для работы с компьютером.",
    "Каталог остаётся local-only: публичные, облачные и уже доступные Web ChatGPT инструменты из общего набора Codex/OpenAI не экспортируются через туннельный MCP.",
    "Интеграционные проверки доказывают, что исполнительный путь не запускает turn/start и не обращается к модельному endpoint.",
    "Существующий Codex Local Mac, его private state, tunnel credentials и текущий Runtime Lifecycle не модифицируются и могут быть возвращены в использование без восстановления из backup.",
    "Подготовлены воспроизводимые замеры и инструкция для A/B-переключения старого и нового MCP в ChatGPT; решение о замене штатного MCP принимается только после пользовательского сравнения."
  ],
  "approved_scope": {
    "functional_paths": [
      "tools/codex-app-server-mcp/app_server_client.py",
      "tools/codex-app-server-mcp/server.py",
      "tools/codex-app-server-mcp/control.py",
      "tools/codex-app-server-mcp/requirements.txt",
      "tests/codex-app-server-mcp.test.mjs",
      "scripts/benchmark-codex-app-server-mcp.mjs",
      "src/mac-runtime-switch.mjs",
      "src/mcp-runtime.mjs",
      "src/main.mjs",
      "tests/mac-runtime-switch.test.mjs",
      "src/ui/index.html",
      "src/ui/project-archive.mjs",
      "src/preload.cjs",
      "package.json",
      "package-lock.json",
      "scripts/release-all.mjs"
    ],
    "documentation_paths": [
      "docs/architecture/OVERVIEW.md",
      "docs/MODULES.md",
      "docs/DOCUMENTATION_INDEX.md",
      "docs/modules/runtime-lifecycle.md",
      "docs/modules/codex-app-server-executor.md",
      "docs/VERIFICATION.md",
      "docs/RELEASE.md"
    ],
    "max_functional_files_per_task": 3
  },
  "baseline_commit": "f2fb5e9cf62ad724acc8f3d69d981488ac78ca10",
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
        "path": "docs/modules/runtime-lifecycle.md",
        "heading_path": [
          "Module Specification — Runtime Lifecycle"
        ],
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
        "scope_id": "codex-app-server-mcp-035",
        "task_id": "T001",
        "role": "implementation"
      },
      "dependencies": [],
      "functional_paths": [],
      "documentation_paths": [
        "docs/modules/codex-app-server-executor.md",
        "docs/modules/runtime-lifecycle.md"
      ],
      "verification_ids": [],
      "id": "T001",
      "title": "Зафиксировать контракт Codex App Server executor",
      "why": "Отделить экспериментальный исполнитель от штатного runtime и заранее закрепить facade, границы безопасности и критерии A/B.",
      "acceptance_criteria": [
        "Спецификация фиксирует схему ChatGPT MCP → adapter → Codex App Server, discovery бинарника, lifecycle, границы состояния и запрет turn/start.",
        "Определён local-only facade, который по локальным возможностям не уже текущего Codex Local Mac и включает Computer Use наряду с файлами, командами/процессами, Git и явно разрешёнными локальными downstream MCP.",
        "Публичные/облачные инструменты общего каталога Codex/OpenAI не дублируются через внешний туннельный MCP.",
        "Зафиксировано, что эксперимент не изменяет старый MCP, его tunnel credentials и production Runtime Lifecycle."
      ],
      "expected_commit_message": "docs: зафиксировать контракт Codex App Server MCP"
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "codex-app-server-mcp-035",
        "task_id": "T002",
        "role": "implementation"
      },
      "dependencies": [
        "T001"
      ],
      "functional_paths": [
        "tools/codex-app-server-mcp/app_server_client.py",
        "tests/codex-app-server-mcp.test.mjs"
      ],
      "documentation_paths": [
        "docs/modules/codex-app-server-executor.md",
        "docs/DOCUMENTATION_INDEX.md"
      ],
      "verification_ids": [
        "suite"
      ],
      "id": "T002",
      "title": "Реализовать клиент Codex App Server",
      "why": "Получить узкий проверяемый facade JSON-RPC вместо копирования внутреннего исполнителя Codex.",
      "acceptance_criteria": [
        "Клиент запускает найденный codex app-server по stdio, выполняет initialize и корректно завершает/перезапускает дочерний процесс.",
        "Поддержаны необходимые прямые методы command/exec, fs/readFile и методы каталога/вызова MCP без запуска модельного turn.",
        "Тест с заблокированным модельным endpoint подтверждает ноль модельных запросов и отсутствие turn/start."
      ],
      "expected_commit_message": "feat: добавить клиент Codex App Server"
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "codex-app-server-mcp-035",
        "task_id": "T003",
        "role": "implementation"
      },
      "dependencies": [
        "T002"
      ],
      "functional_paths": [
        "tools/codex-app-server-mcp/server.py",
        "tools/codex-app-server-mcp/requirements.txt",
        "tests/codex-app-server-mcp.test.mjs"
      ],
      "documentation_paths": [
        "docs/modules/codex-app-server-executor.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "suite"
      ],
      "id": "T003",
      "title": "Реализовать ChatGPT-facing MCP facade",
      "why": "Дать веб-модели полный локальный набор возможностей не уже Codex Local Mac, передавая исполнение Codex и не дублируя штатные публичные/облачные capabilities ChatGPT.",
      "acceptance_criteria": [
        "Streamable HTTP MCP публикует локальные файлы, поиск, Git, команды/процессы, Computer Use и другие реально локальные capabilities, необходимые для паритета с текущим Codex Local Mac.",
        "Наличие инструмента или MCP в Codex само по себе не делает его видимым Web ChatGPT: экспорт строится по явному local-only allowlist.",
        "Публичные веб-инструменты, документация, облачные/browser capabilities и другие возможности, уже доступные Web ChatGPT без локального компьютера, не экспортируются.",
        "Аннотации read-only/destructive соответствуют реальному поведению; чувствительные параметры не логируются и не возвращаются модели."
      ],
      "expected_commit_message": "feat: добавить MCP facade поверх Codex App Server"
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "codex-app-server-mcp-035",
        "task_id": "T004",
        "role": "implementation"
      },
      "dependencies": [
        "T003"
      ],
      "functional_paths": [
        "tools/codex-app-server-mcp/control.py",
        "tests/codex-app-server-mcp.test.mjs"
      ],
      "documentation_paths": [
        "docs/modules/codex-app-server-executor.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "suite"
      ],
      "id": "T004",
      "title": "Добавить автономный lifecycle и отдельный tunnel",
      "why": "Новый MCP должен работать рядом со старым и переключаться без пересборки Web Pilot или повреждения текущей установки.",
      "acceptance_criteria": [
        "Control запускает/останавливает только экспериментальный MCP и использует собственные state/ports/profile.",
        "Secure MCP Tunnel может быть настроен отдельно от существующего Codex Local Mac; ключи не попадают в Git, argv, diagnostics или ChatGPT.",
        "Запуск/остановка эксперимента не меняет процессы, private state и профиль старого Codex Local Mac."
      ],
      "expected_commit_message": "feat: добавить lifecycle экспериментального Codex MCP"
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "codex-app-server-mcp-035",
        "task_id": "T005",
        "role": "implementation"
      },
      "dependencies": [
        "T004"
      ],
      "functional_paths": [
        "scripts/benchmark-codex-app-server-mcp.mjs",
        "tests/codex-app-server-mcp.test.mjs",
        "tools/codex-app-server-mcp/server.py",
        "tools/codex-app-server-mcp/app_server_client.py"
      ],
      "documentation_paths": [
        "docs/VERIFICATION.md",
        "docs/modules/codex-app-server-executor.md"
      ],
      "verification_ids": [
        "suite"
      ],
      "id": "T005",
      "title": "Проверить совместимость и измерить оба пути",
      "why": "Проверить фактический выигрыш Codex App Server и доказать функциональный паритет локальных возможностей, включая Computer Use, без дублирования штатных инструментов ChatGPT.",
      "acceptance_criteria": [
        "Автоматические проверки покрывают initialize, локальные файлы, команды, процессы, Git, Computer Use, allowlist downstream MCP, отмену и восстановление App Server в пределах доступной автоматизации.",
        "Сравнение каталога доказывает, что новый MCP по локальным capabilities не уже текущего Codex Local Mac; любое недоступное локальное capability явно фиксируется как ограничение эксперимента.",
        "Проверка каталога подтверждает отсутствие намеренных дублей публичных/облачных инструментов Web ChatGPT.",
        "Benchmark одинаковых локальных операций сравнивает старый MCP и новый adapter по времени и объёму ответа; Computer Use оценивается отдельным одинаковым пользовательским сценарием.",
        "Подготовлена короткая процедура пользовательского A/B: зарегистрировать новый connector, отключить старый, выполнить одинаковые задачи и вернуть прежний connector без изменений Web Pilot."
      ],
      "expected_commit_message": "test: сравнить Codex App Server MCP с Codex Local",
      "file_limit_exception": "T005 одновременно проверяет facade, benchmark и внутренний App Server MCP-thread; app_server_client.py нужен только для подтверждённой настройки Computer Use thread sandbox и не образует отдельный продуктовый scope."
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "codex-app-server-mcp-035",
        "task_id": "T006",
        "role": "implementation"
      },
      "dependencies": [
        "T005"
      ],
      "functional_paths": [
        "tools/codex-app-server-mcp/control.py",
        "tests/codex-app-server-mcp.test.mjs"
      ],
      "documentation_paths": [
        "docs/modules/codex-app-server-executor.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "suite"
      ],
      "id": "T006",
      "title": "Стабилизировать process identity между Terminal и runtime",
      "why": "Исключить ложный Recorded MCP PID belongs to another process при одинаковом PID из-за locale-зависимого вывода macOS ps.",
      "acceptance_criteria": [
        "pid_identity запускает /bin/ps с принудительным стабильным C locale независимо от окружения вызывающего Terminal.",
        "Regression проверяет, что LC_ALL/LANG передаются в ps как C и сохранённая identity остаётся сопоставимой между средами.",
        "Повторный start из обычного Terminal распознаёт уже работающий experimental MCP как owned и запускает tunnel вместо ложного отказа."
      ],
      "expected_commit_message": "fix: стабилизировать identity experimental MCP процесса"
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "codex-app-server-mcp-035",
        "task_id": "T007",
        "role": "implementation"
      },
      "dependencies": [
        "T006"
      ],
      "functional_paths": [
        "tools/codex-app-server-mcp/server.py",
        "tests/codex-app-server-mcp.test.mjs"
      ],
      "documentation_paths": [
        "docs/modules/codex-app-server-executor.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "suite"
      ],
      "id": "T007",
      "title": "Перевести Computer Use actions на Sky",
      "why": "Устранить ложный success Swift/CGEvent и использовать поддерживаемый Codex путь node_repl -> @oai/sky для UI-действий.",
      "acceptance_criteria": [
        "computer_click/type_text/key_press/hotkey/scroll используют @oai/sky через node_repl для активного app, а не Swift CGEvent.",
        "Facade хранит явно активированный app id и возвращает ошибку, если app не выбран для app-scoped action.",
        "Regression и реальный TextEdit smoke подтверждают фактическое изменение UI через последующий get_app_state; capture остаётся рабочим."
      ],
      "expected_commit_message": "fix: перевести Computer Use actions на Sky"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "codex-app-server-mcp-035",
        "task_id": "T008",
        "role": "implementation"
      },
      "dependencies": [
        "T007"
      ],
      "functional_paths": [
        "src/mac-runtime-switch.mjs",
        "src/mcp-runtime.mjs",
        "src/main.mjs",
        "tests/mac-runtime-switch.test.mjs"
      ],
      "file_limit_exception": "Переключение runtime требует одного узкого backend facade, существующего McpRuntime stop action, интеграции main и отдельного regression test; функционально это одна атомарная lifecycle-задача.",
      "documentation_paths": [
        "docs/modules/runtime-lifecycle.md",
        "docs/modules/codex-app-server-executor.md"
      ],
      "verification_ids": [
        "suite"
      ],
      "id": "T008",
      "title": "Добавить эксклюзивное переключение macOS runtime",
      "why": "Гарантировать, что старый и новый MCP/tunnel не работают параллельно и выбранный runtime сохраняется между запусками.",
      "acceptance_criteria": [
        "Сохраняется mode local/app-server; при переключении невыбранный runtime останавливается до запуска выбранного.",
        "LaunchAgent старого Codex Local Mac и нового WebPilotCodexExecutor включаются/отключаются взаимоисключающе, поэтому выбор переживает login/reboot.",
        "Новый App Server MCP запускается из установленной копии resources в private state, а не зависит от исходного workspace.",
        "После switch пересоздаются runtime/client/context controller и выбранный MCP проходит initialize."
      ],
      "expected_commit_message": "feat: добавить переключение macOS MCP runtime"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "codex-app-server-mcp-035",
        "task_id": "T009",
        "role": "implementation"
      },
      "dependencies": [
        "T008"
      ],
      "functional_paths": [
        "src/ui/index.html",
        "src/ui/project-archive.mjs",
        "src/preload.cjs"
      ],
      "documentation_paths": [
        "docs/modules/runtime-lifecycle.md"
      ],
      "verification_ids": [
        "suite"
      ],
      "id": "T009",
      "title": "Добавить переключатель MCP в Settings",
      "why": "Дать пользователю явный выбор между Codex Local Mac и Codex App Server Local Mac без Terminal.",
      "acceptance_criteria": [
        "В macOS Settings виден двухпозиционный выбор с понятными названиями старого и нового MCP.",
        "Выбор вызывает backend switch, показывает текущий active mode/status и блокируется на время операции.",
        "Windows UI и существующие настройки не меняют поведение."
      ],
      "expected_commit_message": "feat: добавить выбор MCP runtime в Settings"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "codex-app-server-mcp-035",
        "task_id": "T010",
        "role": "implementation"
      },
      "dependencies": [
        "T009"
      ],
      "functional_paths": [
        "package.json",
        "package-lock.json",
        "scripts/release-all.mjs"
      ],
      "documentation_paths": [
        "docs/RELEASE.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "suite",
        "smoke"
      ],
      "id": "T010",
      "title": "Собрать релиз 0.6.47 с новым MCP resource",
      "why": "Поставить переключатель как самодостаточный релиз macOS/Windows и проверить physical resource нового MCP.",
      "acceptance_criteria": [
        "Версия поднята до 0.6.47 одинаково для package/lock и обеих платформ.",
        "codex-app-server-mcp физически упакован как extra-resource, а release verification сверяет его с исходниками.",
        "Полный test suite и Electron smoke проходят; npm run build создаёт macOS arm64 и Windows x64 package и обновляет постоянный macOS app.",
        "Артефакты 0.6.47 лежат в ~/Downloads/WebPilot-0.6.47/ с manifest и SHA256."
      ],
      "expected_commit_message": "release: собрать Project Web Pilot 0.6.47"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "codex-app-server-mcp-035",
        "task_id": "DOCS",
        "role": "implementation",
        "iteration": 4
      },
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
        "T010"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/architecture/OVERVIEW.md",
        "docs/MODULES.md",
        "docs/DOCUMENTATION_INDEX.md",
        "docs/modules/runtime-lifecycle.md",
        "docs/modules/codex-app-server-executor.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [],
      "id": "DOCS",
      "title": "Актуализация всех документов проекта",
      "why": "После эксперимента согласовать действующую документацию с фактическими границами и не объявлять новый MCP штатным до пользовательского A/B.",
      "acceptance_criteria": [
        "Все документы из индекса проверены; актуальные оставлены без бессмысленных правок; новые сведения описывают эксперимент как альтернативный, а не production runtime.",
        "Документация явно фиксирует local-only boundary, требование паритета локальных capabilities включая Computer Use и оставляет решение о замене штатного Codex Local Mac за результатом пользовательского A/B."
      ],
      "expected_commit_message": "docs: актуализировать документацию Codex App Server MCP"
    }
  ],
  "blocked_reason": null,
  "user_decisions": [
    "Использовать Codex App Server именно как локальный исполнитель команд внешней модели ChatGPT Web, а не как второй агент; путь turn/start в экспериментальном MCP запрещён.",
    "Создать новый MCP отдельно от Codex Local Mac, чтобы можно было вручную отключать один connector и включать другой для сравнения.",
    "На этапе эксперимента не менять штатный Runtime Lifecycle Web Pilot и не выпускать новый релиз только ради этого MCP.",
    "Сначала реализовать и измерить macOS-вариант; Windows переносить только после решения по результатам A/B.",
    {
      "id": "2bcfe5d6-79cb-4a58-b07d-f5dffaa2d53b",
      "text": "19.09.2026 пользователь прямо поручил создать новый scope и ToDo Plan для реализации отдельного MCP поверх Codex App Server после завершения предыдущего scope.",
      "recorded_at": "2026-09-19T10:39:21.681Z"
    },
    "Codex может видеть общий набор MCP экосистемы OpenAI/ChatGPT, но наш внешний MCP через туннель экспортирует модели только возможности, которым нужен доступ именно к локальному компьютеру пользователя. Публичные, облачные и уже доступные Web ChatGPT инструменты не дублируются; downstream MCP публикуются только через явный allowlist локальных capabilities.",
    "В A/B-тесте новый MCP обязан включать Computer Use и по локальным capabilities не быть уже текущего Codex Local Mac. Отдельное исследование Computer Use потребуется только если полноценный путь через Codex App Server не получится."
  ],
  "owner_session_id": "web-pilot-361efaed-f824-4ab6-bc15-df56586093de",
  "prepared_in_session_id": null
}
```
<!-- workflow-state:end -->

## Состояние

Execution Scope Status: ACTIVE
Delivery Status: IN_PROGRESS
Scope: codex-app-server-mcp-035
Current Task: нет
Revision: 34

## Цель

Создать отдельный экспериментальный MCP для macOS, который предоставляет модели ChatGPT Web локальные инструменты через Codex App Server как исполнитель без запуска второго модельного агента, включая Computer Use, и подготовить безопасное A/B-сравнение с существующим Codex Local Mac.

## Критерии приёмки

- Экспериментальный MCP запускается отдельно от штатного Codex Local Mac и не требует изменения кода Web Pilot для подключения в ChatGPT.
- По локальным возможностям новый MCP не уже существующего Codex Local Mac: доступны локальные файлы, поиск, Git, команды/процессы, Computer Use и иные реально локальные capabilities, необходимые модели для работы с компьютером.
- Каталог остаётся local-only: публичные, облачные и уже доступные Web ChatGPT инструменты из общего набора Codex/OpenAI не экспортируются через туннельный MCP.
- Интеграционные проверки доказывают, что исполнительный путь не запускает turn/start и не обращается к модельному endpoint.
- Существующий Codex Local Mac, его private state, tunnel credentials и текущий Runtime Lifecycle не модифицируются и могут быть возвращены в использование без восстановления из backup.
- Подготовлены воспроизводимые замеры и инструкция для A/B-переключения старого и нового MCP в ChatGPT; решение о замене штатного MCP принимается только после пользовательского сравнения.

## Микрозадачи

- [DONE] T001: Зафиксировать контракт Codex App Server executor — Завершено
  - Git Commit: [DONE] docs: зафиксировать контракт Codex App Server MCP
  - Reference: codex-app-server-mcp-035 / T001 / implementation
  - Файлы: docs/modules/codex-app-server-executor.md, docs/modules/runtime-lifecycle.md
- [DONE] T002: Реализовать клиент Codex App Server — Завершено
  - Git Commit: [DONE] feat: добавить клиент Codex App Server
  - Reference: codex-app-server-mcp-035 / T002 / implementation
  - Файлы: tools/codex-app-server-mcp/app_server_client.py, tests/codex-app-server-mcp.test.mjs, docs/modules/codex-app-server-executor.md, docs/DOCUMENTATION_INDEX.md
- [DONE] T003: Реализовать ChatGPT-facing MCP facade — Завершено
  - Git Commit: [DONE] feat: добавить MCP facade поверх Codex App Server
  - Reference: codex-app-server-mcp-035 / T003 / implementation
  - Файлы: tools/codex-app-server-mcp/server.py, tools/codex-app-server-mcp/requirements.txt, tests/codex-app-server-mcp.test.mjs, docs/modules/codex-app-server-executor.md, docs/VERIFICATION.md
- [DONE] T004: Добавить автономный lifecycle и отдельный tunnel — Завершено
  - Git Commit: [DONE] feat: добавить lifecycle экспериментального Codex MCP
  - Reference: codex-app-server-mcp-035 / T004 / implementation
  - Файлы: tools/codex-app-server-mcp/control.py, tests/codex-app-server-mcp.test.mjs, docs/modules/codex-app-server-executor.md, docs/VERIFICATION.md
- [DONE] T005: Проверить совместимость и измерить оба пути — Завершено
  - Git Commit: [DONE] test: сравнить Codex App Server MCP с Codex Local
  - Reference: codex-app-server-mcp-035 / T005 / implementation
  - Файлы: scripts/benchmark-codex-app-server-mcp.mjs, tests/codex-app-server-mcp.test.mjs, tools/codex-app-server-mcp/server.py, tools/codex-app-server-mcp/app_server_client.py, docs/VERIFICATION.md, docs/modules/codex-app-server-executor.md
- [DONE] T006: Стабилизировать process identity между Terminal и runtime — Завершено
  - Git Commit: [DONE] fix: стабилизировать identity experimental MCP процесса
  - Reference: codex-app-server-mcp-035 / T006 / implementation
  - Файлы: tools/codex-app-server-mcp/control.py, tests/codex-app-server-mcp.test.mjs, docs/modules/codex-app-server-executor.md, docs/VERIFICATION.md
- [DONE] T007: Перевести Computer Use actions на Sky — Завершено
  - Git Commit: [DONE] fix: перевести Computer Use actions на Sky
  - Reference: codex-app-server-mcp-035 / T007 / implementation
  - Файлы: tools/codex-app-server-mcp/server.py, tests/codex-app-server-mcp.test.mjs, docs/modules/codex-app-server-executor.md, docs/VERIFICATION.md
- [TODO] T008: Добавить эксклюзивное переключение macOS runtime — Ожидает
  - Git Commit: [PENDING] feat: добавить переключение macOS MCP runtime
  - Reference: codex-app-server-mcp-035 / T008 / implementation
  - Файлы: src/mac-runtime-switch.mjs, src/mcp-runtime.mjs, src/main.mjs, tests/mac-runtime-switch.test.mjs, docs/modules/runtime-lifecycle.md, docs/modules/codex-app-server-executor.md
- [TODO] T009: Добавить переключатель MCP в Settings — Ожидает
  - Git Commit: [PENDING] feat: добавить выбор MCP runtime в Settings
  - Reference: codex-app-server-mcp-035 / T009 / implementation
  - Файлы: src/ui/index.html, src/ui/project-archive.mjs, src/preload.cjs, docs/modules/runtime-lifecycle.md
- [TODO] T010: Собрать релиз 0.6.47 с новым MCP resource — Ожидает
  - Git Commit: [PENDING] release: собрать Project Web Pilot 0.6.47
  - Reference: codex-app-server-mcp-035 / T010 / implementation
  - Файлы: package.json, package-lock.json, scripts/release-all.mjs, docs/RELEASE.md, docs/VERIFICATION.md
- [TODO] DOCS: Актуализация всех документов проекта — Ожидает
  - Git Commit: [PENDING] docs: актуализировать документацию Codex App Server MCP
  - Reference: codex-app-server-mcp-035 / DOCS / implementation
  - Файлы: docs/architecture/OVERVIEW.md, docs/MODULES.md, docs/DOCUMENTATION_INDEX.md, docs/modules/runtime-lifecycle.md, docs/modules/codex-app-server-executor.md, docs/VERIFICATION.md

## Context Pack For This Cycle

- docs/architecture/OVERVIEW.md → Краткая архитектура проекта
- docs/MODULES.md → Модули проекта
- docs/DOCUMENTATION_INDEX.md → Каталог документации
- docs/modules/runtime-lifecycle.md → Module Specification — Runtime Lifecycle

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
