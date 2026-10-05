# Активный план — Project Web Pilot

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 1164,
  "project_id": "cf944136-d1fc-4bd5-9ea0-e46d1fe230e7",
  "project_name": "Project Web Pilot",
  "scope_id": "computer-use-removal-0.6.90-20261005",
  "execution_scope_status": "ACTIVE",
  "delivery_status": "IN_PROGRESS",
  "objective": "Убрать управление интерфейсом из инструментов MCP на macOS и Windows, оставив снимки экрана и окна и список окон; добавить запрет управления интерфейсом в правила; релиз 0.6.90.",
  "acceptance_criteria": [
    "macOS: в каталоге MCP App Server 38 инструментов, из computer_* остались computer_capture_screen, computer_capture_window, computer_list_windows; кода Sky и MCP-thread нет",
    "Windows: overlay оставляет в bridge 38 инструментов, из computer_* те же три; раздел Desktop в SKILL.md заменён",
    "Правила сессии в обоих режимах доставки запрещают управлять интерфейсом и разрешают снимки и список окон",
    "Релиз 0.6.90 собран, установлен в /Applications, опубликован на GitHub; main синхронизирован"
  ],
  "approved_scope": {
    "functional_paths": [
      "tools/codex-app-server-mcp/server.py",
      "tools/codex-app-server-mcp/app_server_client.py",
      "tests/codex-app-server-mcp.test.mjs",
      "scripts/benchmark-codex-app-server-mcp.mjs",
      "src/windows-runtime.mjs",
      "tests/windows-runtime.test.mjs",
      "src/context-session.mjs",
      "tests/context-session.test.mjs",
      "package.json",
      "package-lock.json",
      "scripts/release-all.mjs",
      "scripts/check-installed-release.mjs",
      "scripts/check-github-release.mjs"
    ],
    "documentation_paths": [
      "docs/planning/computer-use-removal.md",
      "tools/codex-app-server-mcp/session-rules.md",
      "docs/planning/codex-local-mac-removal.md",
      "docs/PRODUCT.md",
      "docs/architecture/ARCHITECTURE.md",
      "docs/architecture/OVERVIEW.md",
      "docs/MODULES.md",
      "docs/DOCUMENTATION_INDEX.md"
    ]
  },
  "baseline_commit": "a93040be31b696939b5100e846fc8e3c7f1d4937",
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
        "path": "docs/planning/computer-use-removal.md",
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
        "scope_id": "computer-use-removal-0.6.90-20261005",
        "task_id": "T001",
        "role": "implementation"
      },
      "dependencies": [],
      "functional_paths": [
        "tools/codex-app-server-mcp/server.py",
        "tools/codex-app-server-mcp/app_server_client.py",
        "tests/codex-app-server-mcp.test.mjs",
        "scripts/benchmark-codex-app-server-mcp.mjs"
      ],
      "documentation_paths": [
        "docs/planning/computer-use-removal.md"
      ],
      "verification_ids": [
        "executor-channel",
        "unit-all"
      ],
      "id": "T001",
      "title": "macOS: убрать 10 инструментов управления интерфейсом и код Sky; снимок и список окон — системными средствами",
      "why": "Веб-модель не должна управлять интерфейсом через MCP; Computer Use через туннель медленный и не нужен.",
      "verification_kind": "code",
      "acceptance_criteria": [
        "Удалены computer_status, computer_activate_window, computer_move_mouse, computer_click, computer_scroll, computer_type_text, computer_key_press, computer_hotkey, computer_actions, computer_release_inputs; @mcp.tool ровно 38",
        "computer_capture_screen работает как раньше; computer_list_windows и computer_capture_window сохранили имена и работают без Sky: список окон через CoreGraphics, снимок через /usr/sbin/screencapture -l <window_id> с масштабированием max_dimension",
        "В server.py и app_server_client.py нет node_repl, @oai/sky, методов MCP-thread и другого кода, который больше нигде не вызывается",
        "bridge_status без поля computer_use; в instructions фраза про Sky заменена, первые 512 символов не изменены",
        "Тесты клавиш, computer_actions и маршрута через Sky удалены; тест каталога проверяет отсутствие 10 имён и наличие трёх оставшихся; тест на поддельном исполнителе проверяет argv снимка окна и отказ при неверном window_id; benchmark не вызывает computer_status"
      ],
      "expected_commit_message": "feat: macOS: убрать 10 инструментов управления интерфейсом и код Sky; снимок и список окон — системными средствами"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "computer-use-removal-0.6.90-20261005",
        "task_id": "T002",
        "role": "implementation"
      },
      "dependencies": [],
      "functional_paths": [
        "src/windows-runtime.mjs",
        "tests/windows-runtime.test.mjs"
      ],
      "documentation_paths": [
        "docs/planning/computer-use-removal.md"
      ],
      "verification_ids": [
        "windows-overlay",
        "unit-all"
      ],
      "id": "T002",
      "title": "Windows: overlay убирает 9 инструментов управления интерфейсом и раздел Desktop",
      "why": "В Windows-runtime свои computer_*; закреплённый ZIP не меняется, поэтому правка идёт существующим overlay.",
      "verification_kind": "code",
      "acceptance_criteria": [
        "patchWindowsBridgeSource удаляет computer_status, computer_activate_window, computer_move_mouse, computer_click, computer_scroll, computer_type_text, computer_key_press, computer_hotkey, computer_release_inputs и строку computer_use в bridge_status; computer_capture_screen, computer_capture_window, computer_list_windows остаются; workflow_context_recover по-прежнему добавляется ровно один раз",
        "Раздел Desktop в skills/local-computer/SKILL.md заменён коротким текстом: управления нет, доступны список окон и снимки экрана и окна",
        "Overlay идемпотентен; при ненайденном блоке в неизменённом bridge — WINDOWS_RUNTIME_BRIDGE_INVALID; уже установленный runtime получает правку при обновлении",
        "На настоящих bridge_mcp.py и SKILL.md из закреплённого ZIP (если он есть в .harness/runtime/windows-payload): 38 инструментов, python3 -m py_compile проходит",
        "WINDOWS_RUNTIME_SHA256 и сам ZIP не изменены"
      ],
      "expected_commit_message": "feat: Windows: overlay убирает 9 инструментов управления интерфейсом и раздел Desktop"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "computer-use-removal-0.6.90-20261005",
        "task_id": "T003",
        "role": "implementation"
      },
      "dependencies": [],
      "functional_paths": [
        "src/context-session.mjs",
        "tests/context-session.test.mjs",
        "tests/codex-app-server-mcp.test.mjs"
      ],
      "documentation_paths": [
        "docs/planning/computer-use-removal.md",
        "tools/codex-app-server-mcp/session-rules.md",
        "docs/planning/codex-local-mac-removal.md"
      ],
      "verification_ids": [
        "release-source",
        "executor-channel"
      ],
      "id": "T003",
      "title": "Правила: запрет управления интерфейсом в обоих режимах доставки",
      "why": "Без инструментов модель может управлять интерфейсом командами через run_command; запрет закрывает это текстом. Контракт следующего этапа фиксируется вместе с планом.",
      "verification_kind": "code",
      "acceptance_criteria": [
        "session-rules.md и правила первого сообщения содержат строку из п. 6 контракта дословно",
        "Тесты обоих путей доставки проверяют новую строку; прежние правила не изменены"
      ],
      "expected_commit_message": "feat: Правила: запрет управления интерфейсом в обоих режимах доставки"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "computer-use-removal-0.6.90-20261005",
        "task_id": "T004",
        "role": "implementation"
      },
      "dependencies": [],
      "functional_paths": [
        "package.json",
        "package-lock.json"
      ],
      "documentation_paths": [
        "docs/planning/computer-use-removal.md"
      ],
      "verification_ids": [
        "release-source"
      ],
      "id": "T004",
      "title": "Подготовить source релиза 0.6.90",
      "why": "Правки доходят до пользователя новой сборкой.",
      "verification_kind": "code",
      "acceptance_criteria": [
        "package.json и package-lock.json задают 0.6.90"
      ],
      "expected_commit_message": "feat: Подготовить source релиза 0.6.90"
    },
    {
      "id": "C001",
      "title": "Уточнить контракты: снимки и список окон остаются, ZIP Windows-runtime в релизе",
      "why": "Уточнение пользователя 05.10.2026 после создания плана; контракты должны совпадать с планом до начала реализации.",
      "dependencies": [],
      "functional_paths": [],
      "documentation_paths": [
        "docs/planning/computer-use-removal.md",
        "docs/planning/codex-local-mac-removal.md"
      ],
      "verification_ids": [],
      "verification_kind": "code",
      "acceptance_criteria": [
        "Контракт 0.6.90 описывает 38 инструментов и три оставшихся computer_*",
        "Контракт 0.6.91 описывает публикацию ZIP Windows-runtime в обычном релизе"
      ],
      "expected_commit_message": "docs: уточнить контракты 0.6.90 и 0.6.91",
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "computer-use-removal-0.6.90-20261005",
        "task_id": "C001",
        "role": "implementation"
      }
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "computer-use-removal-0.6.90-20261005",
        "task_id": "DOCS",
        "role": "implementation"
      },
      "dependencies": [
        "T001",
        "T002",
        "T003",
        "T004",
        "C001"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/planning/computer-use-removal.md",
        "docs/PRODUCT.md",
        "docs/architecture/ARCHITECTURE.md",
        "tools/codex-app-server-mcp/session-rules.md",
        "docs/planning/codex-local-mac-removal.md",
        "docs/architecture/OVERVIEW.md",
        "docs/MODULES.md",
        "docs/DOCUMENTATION_INDEX.md"
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
        "scope_id": "computer-use-removal-0.6.90-20261005",
        "task_id": "T005",
        "role": "implementation"
      },
      "dependencies": [
        "DOCS"
      ],
      "functional_paths": [
        "scripts/release-all.mjs"
      ],
      "documentation_paths": [
        "docs/planning/computer-use-removal.md"
      ],
      "verification_ids": [
        "paired-release"
      ],
      "id": "T005",
      "title": "Собрать и проверить парный релиз 0.6.90",
      "why": "Пересобрать релиз после правок.",
      "verification_kind": "package",
      "acceptance_criteria": [
        "~/Downloads/WebPilot-0.6.90 собран из коммита после DOCS, packagedSourceMatches=true, bundled Workflow Kit 1.5.5",
        "Preflight identity записан до сборки"
      ],
      "expected_commit_message": "feat: Собрать и проверить парный релиз 0.6.90"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "computer-use-removal-0.6.90-20261005",
        "task_id": "T006",
        "role": "implementation"
      },
      "dependencies": [
        "DOCS"
      ],
      "functional_paths": [
        "scripts/check-installed-release.mjs"
      ],
      "documentation_paths": [
        "docs/planning/computer-use-removal.md"
      ],
      "verification_ids": [
        "release-installed"
      ],
      "id": "T006",
      "title": "Установить 0.6.90 и проверить установленные macOS-копии",
      "why": "Пользователь работает из /Applications.",
      "verification_kind": "installed",
      "acceptance_criteria": [
        "/Applications обновлена из staging без пересборки, identity сохранена, release-installed проходит",
        "В release-backups.noindex по одной копии 0.6.89 на цель"
      ],
      "expected_commit_message": "feat: Установить 0.6.90 и проверить установленные macOS-копии"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "computer-use-removal-0.6.90-20261005",
        "task_id": "T007",
        "role": "implementation"
      },
      "dependencies": [
        "DOCS"
      ],
      "functional_paths": [
        "scripts/check-github-release.mjs"
      ],
      "documentation_paths": [
        "docs/planning/computer-use-removal.md"
      ],
      "verification_ids": [
        "github-release"
      ],
      "id": "T007",
      "title": "Опубликовать 0.6.90 и синхронизировать Project Web Pilot с GitHub",
      "why": "Отправить релиз на GitHub.",
      "verification_kind": "package",
      "acceptance_criteria": [
        "Tag v0.6.90 на sourceCommit, пять assets совпадают с локальной поставкой, main синхронизирован с origin, включая коммит 7b1d77b"
      ],
      "expected_commit_message": "feat: Опубликовать 0.6.90 и синхронизировать Project Web Pilot с GitHub"
    }
  ],
  "blocked_reason": null,
  "user_decisions": [
    {
      "id": "0468ee71-2fc8-44ee-9589-ce14cd931844",
      "text": "Поручение пользователя 05.10.2026: полностью убрать Computer Use из инструментов MCP для веб-модели (macOS и Windows), снимок экрана оставить, добавить текстовый запрет в правила, собрать релиз 0.6.90 и синхронизировать с GitHub. Локальный агент не делается. Codex Local Mac удаляется отдельным релизом 0.6.91.",
      "recorded_at": "2026-10-05T07:06:30.679Z"
    },
    {
      "id": "ff32df00-2a51-4f1f-a6d4-34ea5ba9cd2b",
      "text": "Уточнение пользователя 05.10.2026: снимок окна тоже остаётся (вместе со списком окон, который даёт window_id); ZIP Windows-runtime в 0.6.91 публикуется в разделе релизов рядом с пакетами macOS и Windows.",
      "recorded_at": "2026-10-05T07:14:58.000Z"
    }
  ]
}
```
<!-- workflow-state:end -->

## Состояние

Execution Scope Status: ACTIVE
Delivery Status: IN_PROGRESS
Scope: computer-use-removal-0.6.90-20261005
Current Task: нет
Revision: 1164

## Цель

Убрать управление интерфейсом из инструментов MCP на macOS и Windows, оставив снимки экрана и окна и список окон; добавить запрет управления интерфейсом в правила; релиз 0.6.90.

## Критерии приёмки

- macOS: в каталоге MCP App Server 38 инструментов, из computer_* остались computer_capture_screen, computer_capture_window, computer_list_windows; кода Sky и MCP-thread нет
- Windows: overlay оставляет в bridge 38 инструментов, из computer_* те же три; раздел Desktop в SKILL.md заменён
- Правила сессии в обоих режимах доставки запрещают управлять интерфейсом и разрешают снимки и список окон
- Релиз 0.6.90 собран, установлен в /Applications, опубликован на GitHub; main синхронизирован

## Микрозадачи

- [TODO] T001: macOS: убрать 10 инструментов управления интерфейсом и код Sky; снимок и список окон — системными средствами — Ожидает
  - Git Commit: [PENDING] feat: macOS: убрать 10 инструментов управления интерфейсом и код Sky; снимок и список окон — системными средствами
  - Reference: computer-use-removal-0.6.90-20261005 / T001 / implementation
  - Файлы: tools/codex-app-server-mcp/server.py, tools/codex-app-server-mcp/app_server_client.py, tests/codex-app-server-mcp.test.mjs, scripts/benchmark-codex-app-server-mcp.mjs, docs/planning/computer-use-removal.md
- [TODO] T002: Windows: overlay убирает 9 инструментов управления интерфейсом и раздел Desktop — Ожидает
  - Git Commit: [PENDING] feat: Windows: overlay убирает 9 инструментов управления интерфейсом и раздел Desktop
  - Reference: computer-use-removal-0.6.90-20261005 / T002 / implementation
  - Файлы: src/windows-runtime.mjs, tests/windows-runtime.test.mjs, docs/planning/computer-use-removal.md
- [TODO] T003: Правила: запрет управления интерфейсом в обоих режимах доставки — Ожидает
  - Git Commit: [PENDING] feat: Правила: запрет управления интерфейсом в обоих режимах доставки
  - Reference: computer-use-removal-0.6.90-20261005 / T003 / implementation
  - Файлы: src/context-session.mjs, tests/context-session.test.mjs, tests/codex-app-server-mcp.test.mjs, docs/planning/computer-use-removal.md, tools/codex-app-server-mcp/session-rules.md, docs/planning/codex-local-mac-removal.md
- [TODO] T004: Подготовить source релиза 0.6.90 — Ожидает
  - Git Commit: [PENDING] feat: Подготовить source релиза 0.6.90
  - Reference: computer-use-removal-0.6.90-20261005 / T004 / implementation
  - Файлы: package.json, package-lock.json, docs/planning/computer-use-removal.md
- [TODO] C001: Уточнить контракты: снимки и список окон остаются, ZIP Windows-runtime в релизе — Ожидает
  - Git Commit: [PENDING] docs: уточнить контракты 0.6.90 и 0.6.91
  - Reference: computer-use-removal-0.6.90-20261005 / C001 / implementation
  - Файлы: docs/planning/computer-use-removal.md, docs/planning/codex-local-mac-removal.md
- [TODO] DOCS: Актуализация всех документов проекта — Ожидает
  - Git Commit: [PENDING] docs: актуализировать контекст проекта
  - Reference: computer-use-removal-0.6.90-20261005 / DOCS / implementation
  - Файлы: docs/planning/computer-use-removal.md, docs/PRODUCT.md, docs/architecture/ARCHITECTURE.md, tools/codex-app-server-mcp/session-rules.md, docs/planning/codex-local-mac-removal.md, docs/architecture/OVERVIEW.md, docs/MODULES.md, docs/DOCUMENTATION_INDEX.md
- [TODO] T005: Собрать и проверить парный релиз 0.6.90 — Ожидает
  - Git Commit: [PENDING] feat: Собрать и проверить парный релиз 0.6.90
  - Reference: computer-use-removal-0.6.90-20261005 / T005 / implementation
  - Файлы: scripts/release-all.mjs, docs/planning/computer-use-removal.md
- [TODO] T006: Установить 0.6.90 и проверить установленные macOS-копии — Ожидает
  - Git Commit: [PENDING] feat: Установить 0.6.90 и проверить установленные macOS-копии
  - Reference: computer-use-removal-0.6.90-20261005 / T006 / implementation
  - Файлы: scripts/check-installed-release.mjs, docs/planning/computer-use-removal.md
- [TODO] T007: Опубликовать 0.6.90 и синхронизировать Project Web Pilot с GitHub — Ожидает
  - Git Commit: [PENDING] feat: Опубликовать 0.6.90 и синхронизировать Project Web Pilot с GitHub
  - Reference: computer-use-removal-0.6.90-20261005 / T007 / implementation
  - Файлы: scripts/check-github-release.mjs, docs/planning/computer-use-removal.md

## Context Pack For This Cycle

- docs/architecture/OVERVIEW.md → Краткая архитектура проекта
- docs/MODULES.md → Модули проекта
- docs/DOCUMENTATION_INDEX.md → Каталог документации
- docs/planning/computer-use-removal.md

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
