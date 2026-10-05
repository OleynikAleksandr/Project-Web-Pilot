# Активный план — Project Web Pilot

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 1229,
  "project_id": "cf944136-d1fc-4bd5-9ea0-e46d1fe230e7",
  "project_name": "Project Web Pilot",
  "scope_id": "codex-native-tools-0.6.92-20261005",
  "execution_scope_status": "ACTIVE",
  "delivery_status": "IN_PROGRESS",
  "objective": "На macOS веб-модель работает родными инструментами Codex (exec_command, write_stdin, apply_patch, view_image) через Codex App Server; самодельные инструменты удалены, корзина и продуктовые инструменты остаются; определения сверяются с версией Codex; релиз 0.6.92.",
  "acceptance_criteria": [
    "Каталог MCP на macOS — 13 инструментов: четыре в форме Codex 0.160.0, три продуктовых, три наблюдения, три корзины; 28 самодельных имён удалены",
    "exec_command, write_stdin и apply_patch исполняются через Codex App Server без thread и turn; apply_patch — родной из установленного Codex",
    "Определения закреплены за версией Codex: lock-файл, npm run check:codex-tools, статус в bridge_status",
    "Windows-runtime, workflow_context_recover, канал VPS и запуск служб не изменены",
    "Релиз 0.6.92 собран, установлен в /Applications, опубликован на GitHub; main синхронизирован"
  ],
  "approved_scope": {
    "functional_paths": [
      "tools/codex-app-server-mcp/app_server_client.py",
      "tools/codex-app-server-mcp/server.py",
      "tests/codex-app-server-mcp.test.mjs",
      "scripts/check-codex-tools.mjs",
      "tools/codex-app-server-mcp/codex-tools.lock.json",
      "package.json",
      "tests/check-codex-tools.test.mjs",
      "package-lock.json",
      "scripts/release-all.mjs",
      "scripts/check-installed-release.mjs",
      "scripts/check-github-release.mjs"
    ],
    "documentation_paths": [
      "docs/planning/codex-native-tools-macos.md",
      "tools/codex-app-server-mcp/session-rules.md",
      "docs/PRODUCT.md",
      "docs/architecture/ARCHITECTURE.md",
      "docs/architecture/OVERVIEW.md",
      "docs/MODULES.md",
      "docs/DOCUMENTATION_INDEX.md",
      "README.md",
      "docs/RELEASE.md",
      "docs/VERIFICATION.md",
      "docs/modules/codex-app-server-executor.md"
    ]
  },
  "baseline_commit": "d724cdf536c34cb2fd1f6612d271d1102b287a54",
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
        "path": "docs/planning/codex-native-tools-macos.md",
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
        "scope_id": "codex-native-tools-0.6.92-20261005",
        "task_id": "T001",
        "role": "implementation"
      },
      "dependencies": [],
      "functional_paths": [
        "tools/codex-app-server-mcp/app_server_client.py",
        "tools/codex-app-server-mcp/server.py",
        "tests/codex-app-server-mcp.test.mjs"
      ],
      "documentation_paths": [
        "docs/planning/codex-native-tools-macos.md"
      ],
      "verification_ids": [
        "executor-channel",
        "unit-all"
      ],
      "id": "T001",
      "title": "Команды в форме Codex: exec_command и write_stdin",
      "why": "Сейчас команды исполняют самодельные run_command, run_command_batch и пять инструментов процессов с собственными параметрами и обрезкой вывода на 120 000 символов. Форма Codex — один инструмент с сессиями и бюджетом вывода 10 000 токенов.",
      "verification_kind": "code",
      "acceptance_criteria": [
        "exec_command(cmd, workdir, shell, login, tty, yield_time_ms, max_output_tokens) и write_stdin(session_id, chars, yield_time_ms, max_output_tokens) исполняются через command/exec и command/exec/write без thread и turn",
        "Ответ — текст в формате Codex (Chunk ID, Wall time, Process exited with code / Process running with session ID, Original token count, Output); вывод обрезается по бюджету токенов с сохранением начала и конца; max_output_tokens не больше 10 000",
        "workdir обязателен и проверяется до запуска; пустая команда, неизвестная сессия и недопустимые значения параметров дают понятную ошибку",
        "Долгий процесс возвращает сессию; write_stdin дочитывает вывод и код выхода; tty принимает Ctrl-C",
        "Тесты на настоящем Codex App Server покрывают перечисленное"
      ],
      "expected_commit_message": "feat: Команды в форме Codex: exec_command и write_stdin",
      "actual_files": [
        "tests/codex-app-server-mcp.test.mjs",
        "tools/codex-app-server-mcp/app_server_client.py",
        "tools/codex-app-server-mcp/server.py"
      ]
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "codex-native-tools-0.6.92-20261005",
        "task_id": "T002",
        "role": "implementation"
      },
      "dependencies": [],
      "functional_paths": [
        "tools/codex-app-server-mcp/server.py",
        "tests/codex-app-server-mcp.test.mjs",
        "tools/codex-app-server-mcp/app_server_client.py"
      ],
      "documentation_paths": [
        "docs/planning/codex-native-tools-macos.md"
      ],
      "verification_ids": [
        "executor-channel",
        "unit-all"
      ],
      "id": "T002",
      "title": "Родной apply_patch и view_image",
      "why": "apply_patch в каталоге — это git apply обычного diff. Родной apply_patch Codex лежит в PATH внутри command/exec (проверено на 0.160.0). Показ изображения с диска в форме Codex заменяет чтение бинарных файлов.",
      "verification_kind": "code",
      "acceptance_criteria": [
        "apply_patch(patch, workdir) исполняет apply_patch Codex с патчем на stdin; добавление, изменение, удаление и перенос файла работают",
        "Пустой патч, патч без *** Begin Patch, патч больше 1 МБ и отсутствующая папка отклоняются до запуска; ошибка apply_patch возвращается его текстом; отсутствие команды в Codex — отдельная ошибка",
        "view_image(path) возвращает изображение, уменьшенное до 1600 точек; не изображение, отсутствующий или слишком большой файл и защищённый путь отклоняются",
        "Прежний apply_patch через git apply удалён"
      ],
      "expected_commit_message": "feat: Родной apply_patch и view_image",
      "actual_files": [
        "tests/codex-app-server-mcp.test.mjs",
        "tools/codex-app-server-mcp/app_server_client.py",
        "tools/codex-app-server-mcp/server.py"
      ]
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "codex-native-tools-0.6.92-20261005",
        "task_id": "T003",
        "role": "implementation"
      },
      "dependencies": [],
      "functional_paths": [
        "tools/codex-app-server-mcp/server.py",
        "tests/codex-app-server-mcp.test.mjs"
      ],
      "documentation_paths": [
        "docs/planning/codex-native-tools-macos.md",
        "tools/codex-app-server-mcp/session-rules.md"
      ],
      "verification_ids": [
        "executor-channel",
        "unit-all"
      ],
      "id": "T003",
      "title": "Каталог из 13 инструментов: удалить самодельные, подсказки и правило сессии",
      "why": "После T001 и T002 самодельные инструменты дублируют команды. Пользователь решил оставить корзину; модель должна знать, что искать нужно через rg, править через apply_patch, удалять через delete_path.",
      "verification_kind": "code",
      "acceptance_criteria": [
        "Каталог — ровно 13 имён из контракта; 28 удалённых имён и код, который больше нигде не вызывается, отсутствуют в server.py",
        "delete_path, list_trash, restore_trash, workflow_context_recover, bridge_status, turn_watchdog и три инструмента наблюдения не изменили имён, параметров и поведения",
        "Первые 512 символов instructions прежние; после них — подсказки про rg, apply_patch и delete_path; session-rules.md содержит ту же строку",
        "Правила первого сообщения для Windows не изменены"
      ],
      "expected_commit_message": "feat: Каталог из 13 инструментов: удалить самодельные, подсказки и правило сессии",
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
        "scope_id": "codex-native-tools-0.6.92-20261005",
        "task_id": "T004",
        "role": "implementation"
      },
      "dependencies": [],
      "functional_paths": [
        "scripts/check-codex-tools.mjs",
        "tools/codex-app-server-mcp/codex-tools.lock.json",
        "tools/codex-app-server-mcp/server.py",
        "package.json",
        "tests/check-codex-tools.test.mjs",
        "tests/codex-app-server-mcp.test.mjs"
      ],
      "documentation_paths": [
        "docs/planning/codex-native-tools-macos.md"
      ],
      "verification_ids": [
        "executor-channel",
        "unit-all"
      ],
      "id": "T004",
      "title": "Сверка определений с версией Codex",
      "why": "Определения трёх инструментов Codex — код в его репозитории; команды для выгрузки из бинарника нет. Нужен сигнал, что Codex обновился и определения стоит пересмотреть, без автоматической подмены каталога.",
      "verification_kind": "code",
      "acceptance_criteria": [
        "codex-tools.lock.json хранит версию Codex, тег и SHA-256 shell_spec.rs, view_image_spec.rs и apply_patch.lark",
        "npm run check:codex-tools: совпадение — код 0; расхождение — код 1 и имена файлов; нет сети или тега — код 2 с причиной; повреждённый lock-файл — ошибка",
        "bridge_status показывает закреплённую и установленную версии Codex, признак совпадения и доступность apply_patch",
        "Прогон против настоящего GitHub для установленного Codex выполнен и записан"
      ],
      "expected_commit_message": "feat: Сверка определений с версией Codex",
      "actual_files": [
        "package.json",
        "scripts/check-codex-tools.mjs",
        "tests/check-codex-tools.test.mjs",
        "tests/codex-app-server-mcp.test.mjs",
        "tools/codex-app-server-mcp/codex-tools.lock.json",
        "tools/codex-app-server-mcp/server.py"
      ]
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "codex-native-tools-0.6.92-20261005",
        "task_id": "T005",
        "role": "implementation"
      },
      "dependencies": [],
      "functional_paths": [
        "package.json",
        "package-lock.json"
      ],
      "documentation_paths": [
        "docs/planning/codex-native-tools-macos.md"
      ],
      "verification_ids": [
        "release-source"
      ],
      "id": "T005",
      "title": "Подготовить source релиза 0.6.92",
      "why": "Правки доходят до пользователя новой сборкой.",
      "verification_kind": "code",
      "acceptance_criteria": [
        "package.json и package-lock.json задают 0.6.92"
      ],
      "expected_commit_message": "feat: Подготовить source релиза 0.6.92",
      "actual_files": [
        "package-lock.json",
        "package.json"
      ]
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "codex-native-tools-0.6.92-20261005",
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
        "docs/planning/codex-native-tools-macos.md",
        "docs/PRODUCT.md",
        "docs/architecture/ARCHITECTURE.md",
        "tools/codex-app-server-mcp/session-rules.md",
        "docs/architecture/OVERVIEW.md",
        "docs/MODULES.md",
        "docs/DOCUMENTATION_INDEX.md",
        "README.md",
        "docs/RELEASE.md",
        "docs/VERIFICATION.md",
        "docs/modules/codex-app-server-executor.md"
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
        "docs/DOCUMENTATION_INDEX.md",
        "docs/MODULES.md",
        "docs/PRODUCT.md",
        "docs/RELEASE.md",
        "docs/VERIFICATION.md",
        "docs/architecture/OVERVIEW.md",
        "docs/modules/codex-app-server-executor.md",
        "docs/planning/codex-native-tools-macos.md"
      ]
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "codex-native-tools-0.6.92-20261005",
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
        "docs/planning/codex-native-tools-macos.md"
      ],
      "verification_ids": [
        "paired-release"
      ],
      "id": "T006",
      "title": "Собрать и проверить парный релиз 0.6.92",
      "why": "Пересобрать релиз после правок.",
      "verification_kind": "package",
      "acceptance_criteria": [
        "~/Downloads/WebPilot-0.6.92 собран из коммита после DOCS, packagedSourceMatches=true, bundled Workflow Kit 1.5.5",
        "В корне app.asar обеих платформ только src, node_modules, package.json и LICENSE; в поставке шесть файлов; executor в пакете содержит codex-tools.lock.json",
        "Preflight identity записан до сборки"
      ],
      "expected_commit_message": "feat: Собрать и проверить парный релиз 0.6.92",
      "actual_files": []
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "codex-native-tools-0.6.92-20261005",
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
        "docs/planning/codex-native-tools-macos.md"
      ],
      "verification_ids": [
        "release-installed"
      ],
      "id": "T007",
      "title": "Установить 0.6.92 и проверить установленные macOS-копии",
      "why": "Пользователь работает из /Applications.",
      "verification_kind": "installed",
      "acceptance_criteria": [
        "/Applications обновлена из staging без пересборки, identity сохранена, release-installed проходит"
      ],
      "expected_commit_message": "feat: Установить 0.6.92 и проверить установленные macOS-копии"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "codex-native-tools-0.6.92-20261005",
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
        "docs/planning/codex-native-tools-macos.md"
      ],
      "verification_ids": [
        "github-release"
      ],
      "id": "T008",
      "title": "Опубликовать 0.6.92 и синхронизировать Project Web Pilot с GitHub",
      "why": "Отправить релиз на GitHub.",
      "verification_kind": "package",
      "acceptance_criteria": [
        "Tag v0.6.92 на sourceCommit, шесть assets совпадают с локальной поставкой, main синхронизирован с origin"
      ],
      "expected_commit_message": "feat: Опубликовать 0.6.92 и синхронизировать Project Web Pilot с GitHub"
    }
  ],
  "blocked_reason": null,
  "user_decisions": [
    {
      "id": "c479ff3d-d7a8-4a00-a582-b695a595cc00",
      "text": "Поручение пользователя 05.10.2026: подготовить планировочный документ и To-do план перехода macOS на вариант с большей частью родных инструментов Codex; корзину оставить; Windows — отдельным этапом. Выполнение плана — по отдельному поручению.",
      "recorded_at": "2026-10-05T10:38:01.604Z"
    }
  ]
}
```
<!-- workflow-state:end -->

## Состояние

Execution Scope Status: ACTIVE
Delivery Status: IN_PROGRESS
Scope: codex-native-tools-0.6.92-20261005
Current Task: нет
Revision: 1229

## Цель

На macOS веб-модель работает родными инструментами Codex (exec_command, write_stdin, apply_patch, view_image) через Codex App Server; самодельные инструменты удалены, корзина и продуктовые инструменты остаются; определения сверяются с версией Codex; релиз 0.6.92.

## Критерии приёмки

- Каталог MCP на macOS — 13 инструментов: четыре в форме Codex 0.160.0, три продуктовых, три наблюдения, три корзины; 28 самодельных имён удалены
- exec_command, write_stdin и apply_patch исполняются через Codex App Server без thread и turn; apply_patch — родной из установленного Codex
- Определения закреплены за версией Codex: lock-файл, npm run check:codex-tools, статус в bridge_status
- Windows-runtime, workflow_context_recover, канал VPS и запуск служб не изменены
- Релиз 0.6.92 собран, установлен в /Applications, опубликован на GitHub; main синхронизирован

## Микрозадачи

- [DONE] T001: Команды в форме Codex: exec_command и write_stdin — Завершено
  - Git Commit: [DONE] feat: Команды в форме Codex: exec_command и write_stdin
  - Reference: codex-native-tools-0.6.92-20261005 / T001 / implementation
  - Файлы: tools/codex-app-server-mcp/app_server_client.py, tools/codex-app-server-mcp/server.py, tests/codex-app-server-mcp.test.mjs, docs/planning/codex-native-tools-macos.md
- [DONE] T002: Родной apply_patch и view_image — Завершено
  - Git Commit: [DONE] feat: Родной apply_patch и view_image
  - Reference: codex-native-tools-0.6.92-20261005 / T002 / implementation
  - Файлы: tools/codex-app-server-mcp/server.py, tests/codex-app-server-mcp.test.mjs, tools/codex-app-server-mcp/app_server_client.py, docs/planning/codex-native-tools-macos.md
- [DONE] T003: Каталог из 13 инструментов: удалить самодельные, подсказки и правило сессии — Завершено
  - Git Commit: [DONE] feat: Каталог из 13 инструментов: удалить самодельные, подсказки и правило сессии
  - Reference: codex-native-tools-0.6.92-20261005 / T003 / implementation
  - Файлы: tools/codex-app-server-mcp/server.py, tests/codex-app-server-mcp.test.mjs, docs/planning/codex-native-tools-macos.md, tools/codex-app-server-mcp/session-rules.md
- [DONE] T004: Сверка определений с версией Codex — Завершено
  - Git Commit: [DONE] feat: Сверка определений с версией Codex
  - Reference: codex-native-tools-0.6.92-20261005 / T004 / implementation
  - Файлы: scripts/check-codex-tools.mjs, tools/codex-app-server-mcp/codex-tools.lock.json, tools/codex-app-server-mcp/server.py, package.json, tests/check-codex-tools.test.mjs, tests/codex-app-server-mcp.test.mjs, docs/planning/codex-native-tools-macos.md
- [DONE] T005: Подготовить source релиза 0.6.92 — Завершено
  - Git Commit: [DONE] feat: Подготовить source релиза 0.6.92
  - Reference: codex-native-tools-0.6.92-20261005 / T005 / implementation
  - Файлы: package.json, package-lock.json, docs/planning/codex-native-tools-macos.md
- [DONE] DOCS: Актуализация всех документов проекта — Завершено
  - Git Commit: [DONE] docs: актуализировать контекст проекта
  - Reference: codex-native-tools-0.6.92-20261005 / DOCS / implementation
  - Файлы: docs/planning/codex-native-tools-macos.md, docs/PRODUCT.md, docs/architecture/ARCHITECTURE.md, tools/codex-app-server-mcp/session-rules.md, docs/architecture/OVERVIEW.md, docs/MODULES.md, docs/DOCUMENTATION_INDEX.md, README.md, docs/RELEASE.md, docs/VERIFICATION.md, docs/modules/codex-app-server-executor.md
- [DONE] T006: Собрать и проверить парный релиз 0.6.92 — Завершено
  - Git Commit: [DONE] feat: Собрать и проверить парный релиз 0.6.92
  - Reference: codex-native-tools-0.6.92-20261005 / T006 / implementation
  - Файлы: scripts/release-all.mjs, docs/planning/codex-native-tools-macos.md
- [TODO] T007: Установить 0.6.92 и проверить установленные macOS-копии — Ожидает
  - Git Commit: [PENDING] feat: Установить 0.6.92 и проверить установленные macOS-копии
  - Reference: codex-native-tools-0.6.92-20261005 / T007 / implementation
  - Файлы: scripts/check-installed-release.mjs, docs/planning/codex-native-tools-macos.md
- [TODO] T008: Опубликовать 0.6.92 и синхронизировать Project Web Pilot с GitHub — Ожидает
  - Git Commit: [PENDING] feat: Опубликовать 0.6.92 и синхронизировать Project Web Pilot с GitHub
  - Reference: codex-native-tools-0.6.92-20261005 / T008 / implementation
  - Файлы: scripts/check-github-release.mjs, docs/planning/codex-native-tools-macos.md

## Context Pack For This Cycle

- docs/architecture/OVERVIEW.md → Краткая архитектура проекта
- docs/MODULES.md → Модули проекта
- docs/DOCUMENTATION_INDEX.md → Каталог документации
- docs/planning/codex-native-tools-macos.md

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
