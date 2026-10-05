# Активный план — Project Web Pilot

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 1203,
  "project_id": "cf944136-d1fc-4bd5-9ea0-e46d1fe230e7",
  "project_name": "Project Web Pilot",
  "scope_id": "codex-local-mac-removal-0.6.91-20261005",
  "execution_scope_status": "ACTIVE",
  "delivery_status": "IN_PROGRESS",
  "objective": "Удалить Codex Local Mac: macOS работает только через Codex App Server, первый запуск идёт через executor; в пакет попадает только приложение; ZIP Windows-runtime публикуется в релизе; релиз 0.6.91.",
  "acceptance_criteria": [
    "В app.asar обеих платформ в корне только src, node_modules, package.json и LICENSE; посторонняя папка в пакете останавливает сборку",
    "Релиз содержит ZIP Windows-runtime шестым файлом; сборка не зависит от папки ~/VSCODE/Codex Local Mac",
    "На macOS один backend — Codex App Server Local Mac; запуск приложения и мастер первого запуска не используют Codex Local Mac",
    "В src, scripts, resources и tools нет Codex Local Mac, кроме кода одноразового обновления",
    "Релиз 0.6.91 собран, установлен в /Applications, опубликован на GitHub; main синхронизирован"
  ],
  "approved_scope": {
    "functional_paths": [
      "package.json",
      "scripts/release-all.mjs",
      "tests/release-all.test.mjs",
      ".gitignore",
      "scripts/prepare-windows-toolchain.mjs",
      "scripts/check-github-release.mjs",
      "tests/windows-runtime.test.mjs",
      "tools/codex-app-server-mcp/control.py",
      "tools/codex-app-server-mcp/tunnel_prompt.py",
      "tests/codex-app-server-mcp.test.mjs",
      "src/mac-runtime-switch.mjs",
      "src/main.mjs",
      "src/preload.cjs",
      "src/startup-platform.mjs",
      "src/startup-readiness.mjs",
      "src/ui/index.html",
      "src/ui/settings-panel.mjs",
      "src/ui/sidebar.mjs",
      "src/ui/startup.mjs",
      "tests/mac-runtime-switch.test.mjs",
      "tests/startup-platform.test.mjs",
      "tests/settings-chatgpt-channel.test.mjs",
      "tests/sidebar.test.mjs",
      "tests/startup-ui.test.mjs",
      "src/mac-runtime.mjs",
      "resources/mac-runtime.zip",
      "resources/runtime-control/mac-control.py",
      "resources/runtime-control/mac-first-run.py",
      "scripts/benchmark-codex-app-server-mcp.mjs",
      "src/platform.mjs",
      "src/mcp-runtime.mjs",
      "tests/mac-runtime.test.mjs",
      "tests/mac-first-run.test.mjs",
      "tests/tunnel-id-runtime.test.mjs",
      "tests/tunnel-id-prompt.test.mjs",
      "tests/mcp-runtime.test.mjs",
      "package-lock.json",
      "scripts/check-installed-release.mjs",
      "tests/tunnel-prompt.test.mjs",
      "tests/electron-smoke.mjs",
      "tests/startup-readiness.test.mjs"
    ],
    "documentation_paths": [
      "docs/planning/codex-local-mac-removal.md",
      "AGENTS.md",
      "docs/PRODUCT.md",
      "docs/architecture/ARCHITECTURE.md",
      "docs/architecture/OVERVIEW.md",
      "docs/MODULES.md",
      "docs/DOCUMENTATION_INDEX.md",
      "README.md",
      "docs/CLEAN_INSTALL.md",
      "docs/CONTEXT_DELIVERY.md",
      "docs/DECISIONS.md",
      "docs/RELEASE.md",
      "docs/SOURCE_WORKSPACES.md",
      "docs/VERIFICATION.md",
      "docs/WORKFLOW_START.md",
      "docs/modules/codex-app-server-executor.md",
      "docs/modules/first-run-onboarding.md",
      "docs/modules/runtime-lifecycle.md"
    ]
  },
  "baseline_commit": "151c782c7689489fbf81dd60181d2fcada299d94",
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
        "path": "docs/planning/codex-local-mac-removal.md",
        "required": true
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
        "scope_id": "codex-local-mac-removal-0.6.91-20261005",
        "task_id": "T000",
        "role": "implementation"
      },
      "dependencies": [],
      "functional_paths": [
        "package.json",
        "scripts/release-all.mjs",
        "tests/release-all.test.mjs",
        ".gitignore"
      ],
      "documentation_paths": [
        "docs/planning/codex-local-mac-removal.md"
      ],
      "verification_ids": [
        "unit-all"
      ],
      "id": "T000",
      "title": "Сборка: в пакет попадает только приложение",
      "why": "Первая сборка 0.6.90 упаковала в app.asar неотслеживаемую папку «Claude outputs» с видео пользователя: упаковщик исключает только перечисленные папки.",
      "verification_kind": "code",
      "acceptance_criteria": [
        "--ignore обеих платформ пропускает из корня только src, node_modules, package.json и LICENSE",
        "verifyPackagedSources отклоняет app.asar с чем-либо ещё в корне; тест воспроизводит постороннюю папку",
        "«Claude outputs/» в .gitignore"
      ],
      "expected_commit_message": "feat: Сборка: в пакет попадает только приложение",
      "actual_files": [
        ".gitignore",
        "package.json",
        "scripts/release-all.mjs",
        "tests/release-all.test.mjs"
      ]
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "codex-local-mac-removal-0.6.91-20261005",
        "task_id": "T001",
        "role": "implementation"
      },
      "dependencies": [],
      "functional_paths": [
        "scripts/prepare-windows-toolchain.mjs",
        "scripts/release-all.mjs",
        "scripts/check-github-release.mjs",
        "tests/windows-runtime.test.mjs",
        "tests/release-all.test.mjs",
        "scripts/check-installed-release.mjs"
      ],
      "documentation_paths": [
        "docs/planning/codex-local-mac-removal.md"
      ],
      "verification_ids": [
        "unit-all"
      ],
      "id": "T001",
      "title": "ZIP Windows-runtime: шестой файл релиза и загрузка с проверкой SHA-256",
      "why": "Сборка Windows брала ZIP из папки Codex Local Mac, которая удаляется; пользователь решил держать файл в разделе релизов рядом с пакетами.",
      "verification_kind": "code",
      "acceptance_criteria": [
        "Поставка и release-manifest содержат ZIP Windows-runtime с закреплённым SHA-256; check-github-release ждёт шесть файлов",
        "При пустом кеше ZIP скачивается из последнего релиза; неверный SHA-256 отклоняется; кеш переиспользуется",
        "Кандидат ../Codex Local Mac удалён"
      ],
      "expected_commit_message": "feat: ZIP Windows-runtime: шестой файл релиза и загрузка с проверкой SHA-256",
      "actual_files": [
        "scripts/check-github-release.mjs",
        "scripts/check-installed-release.mjs",
        "scripts/prepare-windows-toolchain.mjs",
        "scripts/release-all.mjs",
        "tests/release-all.test.mjs",
        "tests/windows-runtime.test.mjs"
      ]
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "codex-local-mac-removal-0.6.91-20261005",
        "task_id": "T002",
        "role": "implementation"
      },
      "dependencies": [],
      "functional_paths": [
        "tools/codex-app-server-mcp/control.py",
        "tools/codex-app-server-mcp/tunnel_prompt.py",
        "tests/codex-app-server-mcp.test.mjs",
        "tests/tunnel-prompt.test.mjs"
      ],
      "documentation_paths": [
        "docs/planning/codex-local-mac-removal.md"
      ],
      "verification_ids": [
        "executor-channel",
        "unit-all"
      ],
      "id": "T002",
      "title": "Executor без Codex Local Mac: selector, проверка Codex, встроенный uv, диалог ввода туннеля",
      "why": "Executor должен сам проходить первый запуск и не ссылаться на прежний runtime.",
      "verification_kind": "code",
      "acceptance_criteria": [
        "configure-selector без аргументов local; без туннеля не падает; selector с режимом local читается как app-server и переписывается",
        "Перенос туннеля из прежнего состояния один раз и без вывода ключа; run_local_control и путь к папке Codex Local Mac удалены",
        "Отсутствие Codex даёт код CODEX_NOT_FOUND в setup и start; setup использует WEB_PILOT_UV",
        "tunnel_prompt.py записывает туннель в состояние executor; ключ только через stdin"
      ],
      "expected_commit_message": "feat: Executor без Codex Local Mac: selector, проверка Codex, встроенный uv, диалог ввода туннеля",
      "actual_files": [
        "tests/codex-app-server-mcp.test.mjs",
        "tests/tunnel-prompt.test.mjs",
        "tools/codex-app-server-mcp/control.py",
        "tools/codex-app-server-mcp/tunnel_prompt.py"
      ]
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "codex-local-mac-removal-0.6.91-20261005",
        "task_id": "T003",
        "role": "implementation"
      },
      "dependencies": [],
      "functional_paths": [
        "src/mac-runtime-switch.mjs",
        "src/main.mjs",
        "src/preload.cjs",
        "src/startup-platform.mjs",
        "src/startup-readiness.mjs",
        "src/ui/index.html",
        "src/ui/settings-panel.mjs",
        "src/ui/sidebar.mjs",
        "src/ui/startup.mjs",
        "tests/mac-runtime-switch.test.mjs",
        "tests/startup-platform.test.mjs",
        "tests/settings-chatgpt-channel.test.mjs",
        "tests/sidebar.test.mjs",
        "tests/startup-ui.test.mjs",
        "tests/electron-smoke.mjs",
        "tests/startup-readiness.test.mjs"
      ],
      "documentation_paths": [
        "docs/planning/codex-local-mac-removal.md"
      ],
      "verification_ids": [
        "vps-runtime",
        "settings-ui",
        "unit-all"
      ],
      "id": "T003",
      "title": "macOS только через App Server: подготовка, первый запуск, одноразовое обновление, интерфейс",
      "why": "Запуск приложения, мастер и «Настройки» завязаны на Codex Local Mac; на Mac без туннеля приложение закрывается с ошибкой.",
      "verification_kind": "code",
      "acceptance_criteria": [
        "Подготовка не требует localRuntime; без туннеля не падает; ошибка подготовки при запуске не закрывает приложение",
        "Мастер первого запуска ставит и запускает executor, вводит туннель через tunnel_prompt.py; отсутствие Codex — отдельное сообщение",
        "Одноразовое обновление: остановка процессов по точному пути, удаление копии runtime в данных приложения и LaunchAgent com.oleynik.CodexLocalMac; повторно не выполняется",
        "В «Настройках» нет переключателя backend и выбора папки runtime; имя плагина в мастере — Codex App Server Local Mac",
        "src/main.mjs собирается esbuild без неразрешённых импортов и не содержит неопределённых имён"
      ],
      "expected_commit_message": "feat: macOS только через App Server: подготовка, первый запуск, одноразовое обновление, интерфейс",
      "actual_files": [
        "src/mac-runtime-switch.mjs",
        "src/main.mjs",
        "src/preload.cjs",
        "src/startup-platform.mjs",
        "src/startup-readiness.mjs",
        "src/ui/index.html",
        "src/ui/settings-panel.mjs",
        "src/ui/sidebar.mjs",
        "src/ui/startup.mjs",
        "tests/electron-smoke.mjs",
        "tests/mac-runtime-switch.test.mjs",
        "tests/settings-chatgpt-channel.test.mjs",
        "tests/sidebar.test.mjs",
        "tests/startup-platform.test.mjs",
        "tests/startup-readiness.test.mjs",
        "tests/startup-ui.test.mjs"
      ]
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "codex-local-mac-removal-0.6.91-20261005",
        "task_id": "T004",
        "role": "implementation"
      },
      "dependencies": [],
      "functional_paths": [
        "src/mac-runtime.mjs",
        "resources/mac-runtime.zip",
        "resources/runtime-control/mac-control.py",
        "resources/runtime-control/mac-first-run.py",
        "scripts/benchmark-codex-app-server-mcp.mjs",
        "src/platform.mjs",
        "src/mcp-runtime.mjs",
        "tests/mac-runtime.test.mjs",
        "tests/mac-first-run.test.mjs",
        "tests/tunnel-id-runtime.test.mjs",
        "tests/tunnel-id-prompt.test.mjs",
        "tests/mcp-runtime.test.mjs",
        "src/mac-runtime-switch.mjs",
        "src/main.mjs"
      ],
      "documentation_paths": [
        "docs/planning/codex-local-mac-removal.md",
        "AGENTS.md"
      ],
      "verification_ids": [
        "unit-all",
        "release-source"
      ],
      "id": "T004",
      "title": "Удалить Codex Local Mac из репозитория",
      "why": "После T003 код и ресурсы прежнего runtime нигде не используются.",
      "verification_kind": "code",
      "acceptance_criteria": [
        "Перечисленные файлы прежнего runtime удалены; тесты переведены на executor или удалены вместе с кодом",
        "В src, scripts, resources и tools нет «Codex Local Mac», mac-runtime.zip и mac-control.py; CodexLocalMac — только в коде одноразового обновления",
        "AGENTS.md описывает один backend macOS и не называет Codex Local Mac источником"
      ],
      "expected_commit_message": "feat: Удалить Codex Local Mac из репозитория",
      "actual_files": [
        "AGENTS.md",
        "resources/mac-runtime.zip",
        "resources/runtime-control/mac-control.py",
        "resources/runtime-control/mac-first-run.py",
        "scripts/benchmark-codex-app-server-mcp.mjs",
        "src/mac-runtime-switch.mjs",
        "src/mac-runtime.mjs",
        "src/main.mjs",
        "src/mcp-runtime.mjs",
        "src/platform.mjs",
        "tests/mac-first-run.test.mjs",
        "tests/mac-runtime.test.mjs",
        "tests/mcp-runtime.test.mjs",
        "tests/tunnel-id-prompt.test.mjs",
        "tests/tunnel-id-runtime.test.mjs"
      ]
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "codex-local-mac-removal-0.6.91-20261005",
        "task_id": "T005",
        "role": "implementation"
      },
      "dependencies": [],
      "functional_paths": [
        "package.json",
        "package-lock.json"
      ],
      "documentation_paths": [
        "docs/planning/codex-local-mac-removal.md"
      ],
      "verification_ids": [
        "release-source"
      ],
      "id": "T005",
      "title": "Подготовить source релиза 0.6.91",
      "why": "Правки доходят до пользователя новой сборкой.",
      "verification_kind": "code",
      "acceptance_criteria": [
        "package.json и package-lock.json задают 0.6.91"
      ],
      "expected_commit_message": "feat: Подготовить source релиза 0.6.91",
      "actual_files": [
        "package-lock.json",
        "package.json"
      ]
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "codex-local-mac-removal-0.6.91-20261005",
        "task_id": "DOCS",
        "role": "implementation"
      },
      "dependencies": [
        "T000",
        "T001",
        "T002",
        "T003",
        "T004",
        "T005"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/planning/codex-local-mac-removal.md",
        "docs/PRODUCT.md",
        "docs/architecture/ARCHITECTURE.md",
        "AGENTS.md",
        "docs/architecture/OVERVIEW.md",
        "docs/MODULES.md",
        "docs/DOCUMENTATION_INDEX.md",
        "README.md",
        "docs/CLEAN_INSTALL.md",
        "docs/CONTEXT_DELIVERY.md",
        "docs/DECISIONS.md",
        "docs/RELEASE.md",
        "docs/SOURCE_WORKSPACES.md",
        "docs/VERIFICATION.md",
        "docs/WORKFLOW_START.md",
        "docs/modules/codex-app-server-executor.md",
        "docs/modules/first-run-onboarding.md",
        "docs/modules/runtime-lifecycle.md"
      ],
      "verification_ids": [],
      "id": "DOCS",
      "title": "Актуализация всех документов проекта",
      "why": "Сохранить актуальный контекст для следующего агента",
      "acceptance_criteria": [
        "Документы соответствуют результату"
      ],
      "expected_commit_message": "docs: актуализировать контекст проекта",
      "actual_files": [
        "README.md",
        "docs/CLEAN_INSTALL.md",
        "docs/CONTEXT_DELIVERY.md",
        "docs/DECISIONS.md",
        "docs/DOCUMENTATION_INDEX.md",
        "docs/MODULES.md",
        "docs/PRODUCT.md",
        "docs/RELEASE.md",
        "docs/SOURCE_WORKSPACES.md",
        "docs/VERIFICATION.md",
        "docs/WORKFLOW_START.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/architecture/OVERVIEW.md",
        "docs/modules/codex-app-server-executor.md",
        "docs/modules/first-run-onboarding.md",
        "docs/modules/runtime-lifecycle.md",
        "docs/planning/codex-local-mac-removal.md"
      ]
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "codex-local-mac-removal-0.6.91-20261005",
        "task_id": "T006",
        "role": "implementation"
      },
      "dependencies": [
        "DOCS"
      ],
      "functional_paths": [
        "scripts/release-all.mjs"
      ],
      "documentation_paths": [
        "docs/planning/codex-local-mac-removal.md"
      ],
      "verification_ids": [
        "paired-release"
      ],
      "id": "T006",
      "title": "Собрать и проверить парный релиз 0.6.91",
      "why": "Пересобрать релиз после правок.",
      "verification_kind": "package",
      "acceptance_criteria": [
        "~/Downloads/WebPilot-0.6.91 собран из коммита после DOCS, packagedSourceMatches=true, bundled Workflow Kit 1.5.5",
        "В корне app.asar обеих платформ только src, node_modules, package.json и LICENSE; в поставке шесть файлов, включая ZIP Windows-runtime",
        "Preflight identity записан до сборки"
      ],
      "expected_commit_message": "feat: Собрать и проверить парный релиз 0.6.91"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "codex-local-mac-removal-0.6.91-20261005",
        "task_id": "T007",
        "role": "implementation"
      },
      "dependencies": [
        "DOCS",
        "T006"
      ],
      "functional_paths": [
        "scripts/check-installed-release.mjs"
      ],
      "documentation_paths": [
        "docs/planning/codex-local-mac-removal.md"
      ],
      "verification_ids": [
        "release-installed"
      ],
      "id": "T007",
      "title": "Установить 0.6.91 и проверить установленные macOS-копии",
      "why": "Пользователь работает из /Applications.",
      "verification_kind": "installed",
      "acceptance_criteria": [
        "/Applications обновлена из staging без пересборки, identity сохранена, release-installed проходит"
      ],
      "expected_commit_message": "feat: Установить 0.6.91 и проверить установленные macOS-копии"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "codex-local-mac-removal-0.6.91-20261005",
        "task_id": "T008",
        "role": "implementation"
      },
      "dependencies": [
        "DOCS",
        "T007"
      ],
      "functional_paths": [
        "scripts/check-github-release.mjs"
      ],
      "documentation_paths": [
        "docs/planning/codex-local-mac-removal.md"
      ],
      "verification_ids": [
        "github-release"
      ],
      "id": "T008",
      "title": "Опубликовать 0.6.91 и синхронизировать Project Web Pilot с GitHub",
      "why": "Отправить релиз на GitHub.",
      "verification_kind": "package",
      "acceptance_criteria": [
        "Tag v0.6.91 на sourceCommit, шесть assets совпадают с локальной поставкой, main синхронизирован с origin"
      ],
      "expected_commit_message": "feat: Опубликовать 0.6.91 и синхронизировать Project Web Pilot с GitHub"
    }
  ],
  "blocked_reason": null,
  "user_decisions": [
    {
      "id": "4a5de4a8-dc7b-4544-b35b-f614b31e7815",
      "text": "Поручение пользователя 05.10.2026: закрыть scope 0.6.90, открыть план нового релиза (удаление Codex Local Mac целиком, следы на Mac и папка; ZIP Windows-runtime рядом с релизом; исправление упаковщика), выполнить полностью и отчитаться.",
      "recorded_at": "2026-10-05T08:24:28.846Z"
    }
  ]
}
```
<!-- workflow-state:end -->

## Состояние

Execution Scope Status: ACTIVE
Delivery Status: IN_PROGRESS
Scope: codex-local-mac-removal-0.6.91-20261005
Current Task: нет
Revision: 1203

## Цель

Удалить Codex Local Mac: macOS работает только через Codex App Server, первый запуск идёт через executor; в пакет попадает только приложение; ZIP Windows-runtime публикуется в релизе; релиз 0.6.91.

## Критерии приёмки

- В app.asar обеих платформ в корне только src, node_modules, package.json и LICENSE; посторонняя папка в пакете останавливает сборку
- Релиз содержит ZIP Windows-runtime шестым файлом; сборка не зависит от папки ~/VSCODE/Codex Local Mac
- На macOS один backend — Codex App Server Local Mac; запуск приложения и мастер первого запуска не используют Codex Local Mac
- В src, scripts, resources и tools нет Codex Local Mac, кроме кода одноразового обновления
- Релиз 0.6.91 собран, установлен в /Applications, опубликован на GitHub; main синхронизирован

## Микрозадачи

- [DONE] T000: Сборка: в пакет попадает только приложение — Завершено
  - Git Commit: [DONE] feat: Сборка: в пакет попадает только приложение
  - Reference: codex-local-mac-removal-0.6.91-20261005 / T000 / implementation
  - Файлы: package.json, scripts/release-all.mjs, tests/release-all.test.mjs, .gitignore, docs/planning/codex-local-mac-removal.md
- [DONE] T001: ZIP Windows-runtime: шестой файл релиза и загрузка с проверкой SHA-256 — Завершено
  - Git Commit: [DONE] feat: ZIP Windows-runtime: шестой файл релиза и загрузка с проверкой SHA-256
  - Reference: codex-local-mac-removal-0.6.91-20261005 / T001 / implementation
  - Файлы: scripts/prepare-windows-toolchain.mjs, scripts/release-all.mjs, scripts/check-github-release.mjs, tests/windows-runtime.test.mjs, tests/release-all.test.mjs, scripts/check-installed-release.mjs, docs/planning/codex-local-mac-removal.md
- [DONE] T002: Executor без Codex Local Mac: selector, проверка Codex, встроенный uv, диалог ввода туннеля — Завершено
  - Git Commit: [DONE] feat: Executor без Codex Local Mac: selector, проверка Codex, встроенный uv, диалог ввода туннеля
  - Reference: codex-local-mac-removal-0.6.91-20261005 / T002 / implementation
  - Файлы: tools/codex-app-server-mcp/control.py, tools/codex-app-server-mcp/tunnel_prompt.py, tests/codex-app-server-mcp.test.mjs, tests/tunnel-prompt.test.mjs, docs/planning/codex-local-mac-removal.md
- [DONE] T003: macOS только через App Server: подготовка, первый запуск, одноразовое обновление, интерфейс — Завершено
  - Git Commit: [DONE] feat: macOS только через App Server: подготовка, первый запуск, одноразовое обновление, интерфейс
  - Reference: codex-local-mac-removal-0.6.91-20261005 / T003 / implementation
  - Файлы: src/mac-runtime-switch.mjs, src/main.mjs, src/preload.cjs, src/startup-platform.mjs, src/startup-readiness.mjs, src/ui/index.html, src/ui/settings-panel.mjs, src/ui/sidebar.mjs, src/ui/startup.mjs, tests/mac-runtime-switch.test.mjs, tests/startup-platform.test.mjs, tests/settings-chatgpt-channel.test.mjs, tests/sidebar.test.mjs, tests/startup-ui.test.mjs, tests/electron-smoke.mjs, tests/startup-readiness.test.mjs, docs/planning/codex-local-mac-removal.md
- [DONE] T004: Удалить Codex Local Mac из репозитория — Завершено
  - Git Commit: [DONE] feat: Удалить Codex Local Mac из репозитория
  - Reference: codex-local-mac-removal-0.6.91-20261005 / T004 / implementation
  - Файлы: src/mac-runtime.mjs, resources/mac-runtime.zip, resources/runtime-control/mac-control.py, resources/runtime-control/mac-first-run.py, scripts/benchmark-codex-app-server-mcp.mjs, src/platform.mjs, src/mcp-runtime.mjs, tests/mac-runtime.test.mjs, tests/mac-first-run.test.mjs, tests/tunnel-id-runtime.test.mjs, tests/tunnel-id-prompt.test.mjs, tests/mcp-runtime.test.mjs, src/mac-runtime-switch.mjs, src/main.mjs, docs/planning/codex-local-mac-removal.md, AGENTS.md
- [DONE] T005: Подготовить source релиза 0.6.91 — Завершено
  - Git Commit: [DONE] feat: Подготовить source релиза 0.6.91
  - Reference: codex-local-mac-removal-0.6.91-20261005 / T005 / implementation
  - Файлы: package.json, package-lock.json, docs/planning/codex-local-mac-removal.md
- [DONE] DOCS: Актуализация всех документов проекта — Завершено
  - Git Commit: [DONE] docs: актуализировать контекст проекта
  - Reference: codex-local-mac-removal-0.6.91-20261005 / DOCS / implementation
  - Файлы: docs/planning/codex-local-mac-removal.md, docs/PRODUCT.md, docs/architecture/ARCHITECTURE.md, AGENTS.md, docs/architecture/OVERVIEW.md, docs/MODULES.md, docs/DOCUMENTATION_INDEX.md, README.md, docs/CLEAN_INSTALL.md, docs/CONTEXT_DELIVERY.md, docs/DECISIONS.md, docs/RELEASE.md, docs/SOURCE_WORKSPACES.md, docs/VERIFICATION.md, docs/WORKFLOW_START.md, docs/modules/codex-app-server-executor.md, docs/modules/first-run-onboarding.md, docs/modules/runtime-lifecycle.md
- [TODO] T006: Собрать и проверить парный релиз 0.6.91 — Ожидает
  - Git Commit: [PENDING] feat: Собрать и проверить парный релиз 0.6.91
  - Reference: codex-local-mac-removal-0.6.91-20261005 / T006 / implementation
  - Файлы: scripts/release-all.mjs, docs/planning/codex-local-mac-removal.md
- [TODO] T007: Установить 0.6.91 и проверить установленные macOS-копии — Ожидает
  - Git Commit: [PENDING] feat: Установить 0.6.91 и проверить установленные macOS-копии
  - Reference: codex-local-mac-removal-0.6.91-20261005 / T007 / implementation
  - Файлы: scripts/check-installed-release.mjs, docs/planning/codex-local-mac-removal.md
- [TODO] T008: Опубликовать 0.6.91 и синхронизировать Project Web Pilot с GitHub — Ожидает
  - Git Commit: [PENDING] feat: Опубликовать 0.6.91 и синхронизировать Project Web Pilot с GitHub
  - Reference: codex-local-mac-removal-0.6.91-20261005 / T008 / implementation
  - Файлы: scripts/check-github-release.mjs, docs/planning/codex-local-mac-removal.md

## Context Pack For This Cycle

- docs/architecture/OVERVIEW.md → Краткая архитектура проекта
- docs/MODULES.md → Модули проекта
- docs/DOCUMENTATION_INDEX.md → Каталог документации
- docs/planning/codex-local-mac-removal.md

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
