# Активный план — Project Web Pilot

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 839,
  "project_id": "cf944136-d1fc-4bd5-9ea0-e46d1fe230e7",
  "project_name": "Project Web Pilot",
  "scope_id": "refactoring-node24-20261002",
  "execution_scope_status": "ACTIVE",
  "delivery_status": "IN_PROGRESS",
  "objective": "Очистить Project Web Pilot от мёртвого кода и дубликатов, найденных аудитом 01.10.2026, перевести среду на Node 24.21.0 и Electron 44.5.1 без изменения пользовательского поведения 0.6.74 и выпустить проверенную парную поставку 0.6.75 для macOS arm64 и Windows x64.",
  "acceptance_criteria": [
    "Пользовательское поведение 0.6.74 сохранено: окно архива, настройки, Доктор, доставка recovery, Chat/Work, AutoPlan, переключение Mac runtime, мастер первого запуска и ввод туннеля на macOS и Windows.",
    "Мёртвый код из docs/planning/refactoring-node24.md удалён, общие помощники существуют в одном экземпляре, исключения обоснованы в документе.",
    "Среда разработки, комплектный Node workers и встроенный Node Electron — 24.21.0; Electron 44.5.1.",
    "Каждая задача завершена отдельным Workflow-коммитом с пройденными назначенными проверками; итог unit-набора не уменьшен без объяснения.",
    "Парная поставка 0.6.75 собрана и проверена; native Windows отмечен как отдельная пользовательская проверка."
  ],
  "approved_scope": {
    "functional_paths": [
      "package.json",
      "package-lock.json",
      "src/platform.mjs",
      "src/main.mjs",
      "src/workspace-setup.mjs",
      "scripts/prepare-mac-toolchain.mjs",
      "scripts/prepare-windows-toolchain.mjs",
      "scripts/verify-windows-package.mjs",
      "BUILD_WINDOWS.cmd",
      "windows-runtime/node-v22.17.0-win-x64.zip.sha256",
      "windows-runtime/Windows-Codex-Local-2026-09-10.zip.sha256",
      "tests/mac-toolchain.test.mjs",
      "tests/windows-runtime.test.mjs",
      "tests/workspace-setup.test.mjs",
      "src/ui/index.html",
      "src/ui/project-archive.mjs",
      "src/ui/settings-panel.mjs",
      "src/ui/sidebar.mjs",
      "tests/electron-smoke.mjs",
      "tests/project-doctor-ui.test.mjs",
      "tests/sidebar.test.mjs",
      "src/context-session.mjs",
      "src/context-cache.mjs",
      "src/context-inputs.mjs",
      "src/mcp-runtime.mjs",
      "src/mac-runtime-switch.mjs",
      "src/windows-runtime.mjs",
      "src/session-plans.mjs",
      "src/mac-runtime.mjs",
      "src/chatgpt-auto-scroll.mjs",
      "scripts/check-workflow-kit-staging.mjs",
      "tools/codex-app-server-mcp/server.py",
      "tools/codex-app-server-mcp/control.py",
      ".gitignore",
      "tests/codex-app-server-mcp.test.mjs",
      "src/common.mjs",
      "src/tunnel-setup.mjs",
      "src/workspace-session.mjs",
      "src/workspace-readiness.mjs",
      "src/workspace-deletion.mjs",
      "src/tunnel-clipboard.mjs",
      "scripts/release-all.mjs",
      "scripts/release-mac.mjs",
      "scripts/check-event-runtime-release.mjs",
      "tests/tunnel-id-runtime.test.mjs",
      "tests/mac-runtime.test.mjs",
      "tests/release-all.test.mjs"
    ],
    "documentation_paths": [
      "docs/planning/refactoring-node24.md",
      "README.md",
      "AGENTS.md",
      "docs/WORKFLOW_START.md",
      "docs/RELEASE.md",
      "docs/architecture/ARCHITECTURE.md",
      "docs/SOURCE_WORKSPACES.md",
      "docs/DOCUMENTATION_INDEX.md",
      "docs/VERIFICATION.md",
      "docs/PRODUCT.md",
      "docs/architecture/OVERVIEW.md",
      "docs/MODULES.md"
    ]
  },
  "baseline_commit": "65cc2f73a5aebd628c4ef4041ac3fcc9eab8aec1",
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
        "path": "docs/planning/refactoring-node24.md",
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
        "scope_id": "refactoring-node24-20261002",
        "task_id": "T001",
        "role": "implementation"
      },
      "dependencies": [],
      "functional_paths": [
        "package.json",
        "package-lock.json",
        "src/platform.mjs",
        "src/main.mjs",
        "src/workspace-setup.mjs",
        "scripts/prepare-mac-toolchain.mjs",
        "scripts/prepare-windows-toolchain.mjs",
        "scripts/verify-windows-package.mjs",
        "BUILD_WINDOWS.cmd",
        "windows-runtime/node-v22.17.0-win-x64.zip.sha256",
        "windows-runtime/Windows-Codex-Local-2026-09-10.zip.sha256",
        "tests/mac-toolchain.test.mjs",
        "tests/windows-runtime.test.mjs",
        "tests/workspace-setup.test.mjs"
      ],
      "documentation_paths": [
        "docs/planning/refactoring-node24.md",
        "README.md"
      ],
      "verification_ids": [
        "node24",
        "unit",
        "smoke"
      ],
      "id": "T001",
      "title": "Перевести среду на Node 24.21.0 и Electron 44.5.1",
      "why": "Перевести среду на Node 24.21.0 и Electron 44.5.1",
      "verification_kind": "code",
      "acceptance_criteria": [
        "Проверка node24 проходит в среде разработки Mac; если системный Node ниже 24.21.0, агент остановился и пользователь установил Node 24 LTS сам.",
        "electron 44.5.1 и @electron/asar 4.3.0 объявлены точными версиями, engines.node >=24.21.0, lockfile обновлён на Node 24, npm ls electron @electron/asar без ошибок.",
        "Версия комплектного Node задана один раз в src/platform.mjs (BUNDLED_NODE_VERSION = 24.21.0); prepare-mac-toolchain, prepare-windows-toolchain, verify-windows-package и путь windows-node в main.mjs выводятся из неё; SHA-256 архивов darwin-arm64 и win-x64 взяты из официального SHASUMS256.txt v24.21.0.",
        "npm run prepare:mac и npm run prepare:win скачали и проверили архивы; mac-tools/node/manifest.json и marker windows-node показывают 24.21.0.",
        "BUILD_WINDOWS.cmd указывает node-v24.21.0-win-x64, тест сверяет литерал с выводимой папкой; каталог windows-runtime с неиспользуемыми .sha256 удалён.",
        "Минимум внешнего Node для workers — 24 с обновлёнными сообщениями; тесты принимают v24.21.0 и дают NODE_TOO_OLD для v22.",
        "stack в .harness/workflow.json обновлён через config:apply полной конфигурацией с сохранением checks: Electron 44.5.1 / embedded Node 24.21.0 / Workflow Kit 1.5.1.",
        "unit и smoke проходят на Node 24.21.0; итог не меньше baseline 425 pass при 9 платформенных skip, с учётом новых тестов."
      ],
      "expected_commit_message": "chore: Перевести среду на Node 24.21.0 и Electron 44.5.1"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "refactoring-node24-20261002",
        "task_id": "T002",
        "role": "implementation"
      },
      "dependencies": [
        "T001"
      ],
      "functional_paths": [
        "src/main.mjs",
        "src/ui/index.html",
        "src/ui/project-archive.mjs",
        "src/ui/settings-panel.mjs",
        "src/ui/sidebar.mjs",
        "tests/electron-smoke.mjs",
        "tests/project-doctor-ui.test.mjs",
        "tests/sidebar.test.mjs"
      ],
      "documentation_paths": [
        "docs/planning/refactoring-node24.md"
      ],
      "verification_ids": [
        "node24",
        "unit",
        "smoke"
      ],
      "id": "T002",
      "title": "Удалить устаревший архив настроек и мёртвую разметку",
      "why": "Удалить устаревший архив настроек и мёртвую разметку",
      "verification_kind": "code",
      "acceptance_criteria": [
        "Шесть недостижимых обработчиков pilot:select-archive, pilot:restore-project, pilot:preview-delete, pilot:cancel-delete, pilot:delete-project и pilot:recover-deletions удалены; каналы ipcMain совпадают с каналами preload плюс pilot:page-observation.",
        "Скрытый легаси-блок архива и удаления в index.html и только его CSS удалены; кнопка «Архив…» открывает окно архива, архивирование, возврат и удаление с подтверждением работают как в 0.6.74; smoke проверяет наличие кнопки и отсутствие легаси-блока.",
        "Неиспользуемые CSS-классы prepared-*, plan-origin, cancel-choice, project-entry, session-top, plus, Map preparedExpansion и несоединённый элемент small удалены; регрессионные проверки отсутствия prepared-card и plan-origin сохранены.",
        "settingsState не хранит непрочитываемых полей; открытие и закрытие настроек, Доктор и показ ошибки восстановления удаления при старте работают как в 0.6.74.",
        "project-archive.mjs переименован в settings-panel.mjs с экспортом settingsPanelView; поле archives в снимке сайдбара сохранено для smoke.",
        "unit и smoke проходят."
      ],
      "expected_commit_message": "refactor: Удалить устаревший архив настроек и мёртвую разметку"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "refactoring-node24-20261002",
        "task_id": "T003",
        "role": "implementation"
      },
      "dependencies": [
        "T002"
      ],
      "functional_paths": [
        "src/context-session.mjs",
        "src/context-cache.mjs",
        "src/context-inputs.mjs",
        "src/mcp-runtime.mjs",
        "src/mac-runtime-switch.mjs",
        "src/main.mjs",
        "src/windows-runtime.mjs",
        "src/session-plans.mjs",
        "src/mac-runtime.mjs",
        "src/chatgpt-auto-scroll.mjs",
        "src/ui/settings-panel.mjs",
        "scripts/check-workflow-kit-staging.mjs",
        "tests/electron-smoke.mjs",
        "tests/workspace-setup.test.mjs"
      ],
      "documentation_paths": [
        "docs/planning/refactoring-node24.md"
      ],
      "verification_ids": [
        "node24",
        "unit",
        "smoke"
      ],
      "id": "T003",
      "title": "Удалить мёртвый код runtime и доставки контекста",
      "why": "Удалить мёртвый код runtime и доставки контекста",
      "verification_kind": "code",
      "acceptance_criteria": [
        "sessionSelection и параметр selection удалены по всей цепочке ContextCache, contextAddress, contextInputKey, readinessContextKey, validateContextPacket, MacSelectedRuntime.loadContext и main.mjs, включая импорт, вызов и fake runtime в electron-smoke.",
        "launchTunnelSetup, windowsTunnelSetupInvocation, поле connectScript и подпись tunnel-setup-launched удалены; настройка туннеля Windows через мастер работает как прежде.",
        "readSessionPlans, trustedProjection и projectionFacade удалены; tests/workspace-setup.test.mjs проверяет те же утверждения через sessionPlanView фасада Workflow Kit.",
        "Неиспользуемые импорты chatGPTDOMScript, fsSync и fileURLToPath и лишний return удалены; export снят только с символов, которые grep не находит вне их файла, включая tests и scripts.",
        "unit и smoke проходят."
      ],
      "expected_commit_message": "refactor: Удалить мёртвый код runtime и доставки контекста"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "refactoring-node24-20261002",
        "task_id": "T004",
        "role": "implementation"
      },
      "dependencies": [
        "T001"
      ],
      "functional_paths": [
        "tools/codex-app-server-mcp/server.py",
        "tools/codex-app-server-mcp/control.py",
        ".gitignore",
        "tests/codex-app-server-mcp.test.mjs"
      ],
      "documentation_paths": [
        "docs/planning/refactoring-node24.md"
      ],
      "verification_ids": [
        "node24",
        "unit"
      ],
      "id": "T004",
      "title": "Очистить Python MCP-сервер и честно описать stop_process",
      "why": "Очистить Python MCP-сервер и честно описать stop_process",
      "verification_kind": "code",
      "acceptance_criteria": [
        "В server.py удалены неиспользуемые импорты shlex, tempfile и AppServerError, метод _keycode и атрибуты _watch_lock и _watch; в control.py удалён импорт asyncio.",
        "stop_process больше не объявляет игнорируемый параметр force; остальной список и поведение MCP-инструментов не изменились.",
        "__pycache__/ добавлен в .gitignore, git check-ignore подтверждает исключение tools/codex-app-server-mcp/__pycache__.",
        "unit проходит, включая Python-тесты codex-app-server-mcp."
      ],
      "expected_commit_message": "refactor: Очистить Python MCP-сервер и честно описать stop_process"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "refactoring-node24-20261002",
        "task_id": "T005",
        "role": "implementation"
      },
      "dependencies": [
        "T003"
      ],
      "functional_paths": [
        "src/common.mjs",
        "src/tunnel-setup.mjs",
        "src/mac-runtime.mjs",
        "src/windows-runtime.mjs",
        "src/mac-runtime-switch.mjs",
        "src/workspace-session.mjs",
        "src/workspace-setup.mjs",
        "src/session-plans.mjs",
        "src/workspace-readiness.mjs",
        "src/workspace-deletion.mjs",
        "src/tunnel-clipboard.mjs",
        "scripts/prepare-mac-toolchain.mjs",
        "scripts/prepare-windows-toolchain.mjs",
        "scripts/verify-windows-package.mjs",
        "scripts/release-all.mjs",
        "scripts/release-mac.mjs",
        "scripts/check-event-runtime-release.mjs",
        "tests/windows-runtime.test.mjs",
        "tests/tunnel-id-runtime.test.mjs",
        "tests/mac-runtime.test.mjs",
        "tests/release-all.test.mjs"
      ],
      "documentation_paths": [
        "docs/planning/refactoring-node24.md"
      ],
      "verification_ids": [
        "node24",
        "unit",
        "smoke"
      ],
      "id": "T005",
      "title": "Свести дублирующиеся помощники к одной реализации",
      "why": "Свести дублирующиеся помощники к одной реализации",
      "verification_kind": "code",
      "acceptance_criteria": [
        "Общая часть настройки туннеля macOS и Windows вынесена в src/tunnel-setup.mjs вместе с executePrivateInput; публичный API, классы ошибок, коды MAC_* и WINDOWS_*, тексты и платформенное окружение сохранены, существующие тесты туннеля проходят без ослабления утверждений.",
        "В JS один TUNNEL_ID_PATTERN; новый тест сверяет шаблон ID туннеля во всех пяти Python-файлах runtime с JS.",
        "sha256File, exists и fail существуют один раз в src/common.mjs и заменяют копии из src и scripts, перечисленные в планировочном документе; workspace-deletion переименовал свой lstat-помощник в lstatOrNull.",
        "Границы импорта соблюдены: src не импортирует scripts, resources-workers не импортируют src; необъединённые повторы перечислены в документе с причинами.",
        "unit и smoke проходят."
      ],
      "expected_commit_message": "refactor: Свести дублирующиеся помощники к одной реализации"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "refactoring-node24-20261002",
        "task_id": "T006",
        "role": "implementation"
      },
      "dependencies": [
        "T005"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/planning/refactoring-node24.md",
        "AGENTS.md",
        "README.md",
        "docs/WORKFLOW_START.md",
        "docs/RELEASE.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/SOURCE_WORKSPACES.md",
        "docs/DOCUMENTATION_INDEX.md"
      ],
      "verification_ids": [],
      "id": "T006",
      "title": "Убрать противоречия и устаревшие сведения в документации агента",
      "why": "Убрать противоречия и устаревшие сведения в документации агента",
      "verification_kind": "code",
      "acceptance_criteria": [
        "В AGENTS.md вне блока workflow-kit один раздел текущего состояния; повторяющиеся разделы «Текущий (локальный) выпуск» и «Выпуск 0.6.52/0.6.53» удалены после переноса недостающих фактов в docs/RELEASE.md; версия Workflow Kit везде 1.5.1; указана среда Node 24.21.0 и Electron 44.5.1.",
        "README.md и docs/WORKFLOW_START.md содержат по одному текущему разделу без смеси версий; история выпусков остаётся в docs/RELEASE.md.",
        "ARCHITECTURE.md больше не описывает удалённые session-tokens как действующие; пути WF001 в SOURCE_WORKSPACES.md однозначны; DOCUMENTATION_INDEX.md ссылается на этот план и на planning/single-active-plan-adaptation.md.",
        "Блок workflow-kit в AGENTS.md не изменён; относительные ссылки в изменённых Markdown-файлах не битые."
      ],
      "expected_commit_message": "docs: Убрать противоречия и устаревшие сведения в документации агента"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "refactoring-node24-20261002",
        "task_id": "T007",
        "role": "implementation"
      },
      "dependencies": [
        "T004",
        "T006"
      ],
      "functional_paths": [
        "package.json",
        "package-lock.json"
      ],
      "documentation_paths": [
        "docs/planning/refactoring-node24.md",
        "docs/RELEASE.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "node24",
        "unit",
        "smoke",
        "paired-release"
      ],
      "id": "T007",
      "title": "Собрать и проверить парный выпуск 0.6.75",
      "why": "Собрать и проверить парный выпуск 0.6.75",
      "verification_kind": "package",
      "acceptance_criteria": [
        "Версия 0.6.75; ключ --app-version удалён из скриптов упаковки, и @electron/packager берёт версию из package.json; CFBundleShortVersionString и версия Windows exe равны 0.6.75.",
        "npm run build обновил корневой Project Web Pilot.app с сохранением Finder identity и создал ~/Downloads/WebPilot-0.6.75/ с двумя ZIP, SHA256SUMS.txt, INSTALL.txt и release-manifest.json; копия в /Applications обновлена по RELEASE.md.",
        "Встроенный Node упакованного приложения (ELECTRON_RUN_AS_NODE=1, process.versions.node) равен 24.21.0, mac-tools/node — v24.21.0 arm64, Windows-пакет содержит node-v24.21.0-win-x64.",
        "Пользователь после полного выхода и запуска проверил на macOS новый Chat и Work с доставкой recovery, окно архива на временном проекте, настройки и переключение Mac runtime; native Windows и clean VM записаны как отдельная пользовательская проверка."
      ],
      "expected_commit_message": "feat: Собрать и проверить парный выпуск 0.6.75"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "refactoring-node24-20261002",
        "task_id": "DOCS",
        "role": "implementation"
      },
      "dependencies": [
        "T001",
        "T002",
        "T003",
        "T004",
        "T005",
        "T006",
        "T007"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/planning/refactoring-node24.md",
        "docs/PRODUCT.md",
        "docs/architecture/ARCHITECTURE.md",
        "README.md",
        "AGENTS.md",
        "docs/WORKFLOW_START.md",
        "docs/RELEASE.md",
        "docs/SOURCE_WORKSPACES.md",
        "docs/DOCUMENTATION_INDEX.md",
        "docs/VERIFICATION.md",
        "docs/architecture/OVERVIEW.md",
        "docs/MODULES.md"
      ],
      "verification_ids": [],
      "id": "DOCS",
      "title": "Актуализация всех документов проекта",
      "why": "Сохранить актуальный контекст для следующего агента",
      "acceptance_criteria": [
        "Документы соответствуют результату"
      ],
      "expected_commit_message": "docs: актуализировать контекст проекта"
    }
  ],
  "blocked_reason": null,
  "user_decisions": [
    {
      "id": "118cbac5-a70d-436e-8c37-8189184e777d",
      "text": "Пользователь 02.10.2026 поручил: по аудиту репозитория составить план рефакторинга по максимуму (мёртвый код, мёртвые ссылки, дубликаты), выполнять безопасно со всеми имеющимися тестами, перевести приложение на Node 24 (выбраны Node 24.21.0 и Electron 44.5.1 со встроенным Node 24.21.0) и создать новый todo-plan. Переезд на удалённый сервер отложен; абсолютные пути /Users в документах не входят в план.",
      "recorded_at": "2026-10-02T06:46:04.489Z"
    }
  ]
}
```
<!-- workflow-state:end -->

## Состояние

Execution Scope Status: ACTIVE
Delivery Status: IN_PROGRESS
Scope: refactoring-node24-20261002
Current Task: нет
Revision: 839

## Цель

Очистить Project Web Pilot от мёртвого кода и дубликатов, найденных аудитом 01.10.2026, перевести среду на Node 24.21.0 и Electron 44.5.1 без изменения пользовательского поведения 0.6.74 и выпустить проверенную парную поставку 0.6.75 для macOS arm64 и Windows x64.

## Критерии приёмки

- Пользовательское поведение 0.6.74 сохранено: окно архива, настройки, Доктор, доставка recovery, Chat/Work, AutoPlan, переключение Mac runtime, мастер первого запуска и ввод туннеля на macOS и Windows.
- Мёртвый код из docs/planning/refactoring-node24.md удалён, общие помощники существуют в одном экземпляре, исключения обоснованы в документе.
- Среда разработки, комплектный Node workers и встроенный Node Electron — 24.21.0; Electron 44.5.1.
- Каждая задача завершена отдельным Workflow-коммитом с пройденными назначенными проверками; итог unit-набора не уменьшен без объяснения.
- Парная поставка 0.6.75 собрана и проверена; native Windows отмечен как отдельная пользовательская проверка.

## Микрозадачи

- [TODO] T001: Перевести среду на Node 24.21.0 и Electron 44.5.1 — Ожидает
  - Git Commit: [PENDING] chore: Перевести среду на Node 24.21.0 и Electron 44.5.1
  - Reference: refactoring-node24-20261002 / T001 / implementation
  - Файлы: package.json, package-lock.json, src/platform.mjs, src/main.mjs, src/workspace-setup.mjs, scripts/prepare-mac-toolchain.mjs, scripts/prepare-windows-toolchain.mjs, scripts/verify-windows-package.mjs, BUILD_WINDOWS.cmd, windows-runtime/node-v22.17.0-win-x64.zip.sha256, windows-runtime/Windows-Codex-Local-2026-09-10.zip.sha256, tests/mac-toolchain.test.mjs, tests/windows-runtime.test.mjs, tests/workspace-setup.test.mjs, docs/planning/refactoring-node24.md, README.md
- [TODO] T002: Удалить устаревший архив настроек и мёртвую разметку — Ожидает
  - Git Commit: [PENDING] refactor: Удалить устаревший архив настроек и мёртвую разметку
  - Reference: refactoring-node24-20261002 / T002 / implementation
  - Файлы: src/main.mjs, src/ui/index.html, src/ui/project-archive.mjs, src/ui/settings-panel.mjs, src/ui/sidebar.mjs, tests/electron-smoke.mjs, tests/project-doctor-ui.test.mjs, tests/sidebar.test.mjs, docs/planning/refactoring-node24.md
- [TODO] T003: Удалить мёртвый код runtime и доставки контекста — Ожидает
  - Git Commit: [PENDING] refactor: Удалить мёртвый код runtime и доставки контекста
  - Reference: refactoring-node24-20261002 / T003 / implementation
  - Файлы: src/context-session.mjs, src/context-cache.mjs, src/context-inputs.mjs, src/mcp-runtime.mjs, src/mac-runtime-switch.mjs, src/main.mjs, src/windows-runtime.mjs, src/session-plans.mjs, src/mac-runtime.mjs, src/chatgpt-auto-scroll.mjs, src/ui/settings-panel.mjs, scripts/check-workflow-kit-staging.mjs, tests/electron-smoke.mjs, tests/workspace-setup.test.mjs, docs/planning/refactoring-node24.md
- [TODO] T004: Очистить Python MCP-сервер и честно описать stop_process — Ожидает
  - Git Commit: [PENDING] refactor: Очистить Python MCP-сервер и честно описать stop_process
  - Reference: refactoring-node24-20261002 / T004 / implementation
  - Файлы: tools/codex-app-server-mcp/server.py, tools/codex-app-server-mcp/control.py, .gitignore, tests/codex-app-server-mcp.test.mjs, docs/planning/refactoring-node24.md
- [TODO] T005: Свести дублирующиеся помощники к одной реализации — Ожидает
  - Git Commit: [PENDING] refactor: Свести дублирующиеся помощники к одной реализации
  - Reference: refactoring-node24-20261002 / T005 / implementation
  - Файлы: src/common.mjs, src/tunnel-setup.mjs, src/mac-runtime.mjs, src/windows-runtime.mjs, src/mac-runtime-switch.mjs, src/workspace-session.mjs, src/workspace-setup.mjs, src/session-plans.mjs, src/workspace-readiness.mjs, src/workspace-deletion.mjs, src/tunnel-clipboard.mjs, scripts/prepare-mac-toolchain.mjs, scripts/prepare-windows-toolchain.mjs, scripts/verify-windows-package.mjs, scripts/release-all.mjs, scripts/release-mac.mjs, scripts/check-event-runtime-release.mjs, tests/windows-runtime.test.mjs, tests/tunnel-id-runtime.test.mjs, tests/mac-runtime.test.mjs, tests/release-all.test.mjs, docs/planning/refactoring-node24.md
- [TODO] T006: Убрать противоречия и устаревшие сведения в документации агента — Ожидает
  - Git Commit: [PENDING] docs: Убрать противоречия и устаревшие сведения в документации агента
  - Reference: refactoring-node24-20261002 / T006 / implementation
  - Файлы: docs/planning/refactoring-node24.md, AGENTS.md, README.md, docs/WORKFLOW_START.md, docs/RELEASE.md, docs/architecture/ARCHITECTURE.md, docs/SOURCE_WORKSPACES.md, docs/DOCUMENTATION_INDEX.md
- [TODO] T007: Собрать и проверить парный выпуск 0.6.75 — Ожидает
  - Git Commit: [PENDING] feat: Собрать и проверить парный выпуск 0.6.75
  - Reference: refactoring-node24-20261002 / T007 / implementation
  - Файлы: package.json, package-lock.json, docs/planning/refactoring-node24.md, docs/RELEASE.md, docs/VERIFICATION.md
- [TODO] DOCS: Актуализация всех документов проекта — Ожидает
  - Git Commit: [PENDING] docs: актуализировать контекст проекта
  - Reference: refactoring-node24-20261002 / DOCS / implementation
  - Файлы: docs/planning/refactoring-node24.md, docs/PRODUCT.md, docs/architecture/ARCHITECTURE.md, README.md, AGENTS.md, docs/WORKFLOW_START.md, docs/RELEASE.md, docs/SOURCE_WORKSPACES.md, docs/DOCUMENTATION_INDEX.md, docs/VERIFICATION.md, docs/architecture/OVERVIEW.md, docs/MODULES.md

## Context Pack For This Cycle

- docs/architecture/OVERVIEW.md → Краткая архитектура проекта
- docs/MODULES.md → Модули проекта
- docs/DOCUMENTATION_INDEX.md → Каталог документации
- docs/planning/refactoring-node24.md

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
