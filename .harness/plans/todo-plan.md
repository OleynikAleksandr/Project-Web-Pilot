# Активный план — Project Web Pilot

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 1295,
  "project_id": "cf944136-d1fc-4bd5-9ea0-e46d1fe230e7",
  "project_name": "Project Web Pilot",
  "scope_id": "trash-removal-0.6.95-20261005",
  "execution_scope_status": "ACTIVE",
  "delivery_status": "IN_PROGRESS",
  "objective": "Убрать самодельную корзину из macOS MCP Codex App Server Local Mac: каталог из 10 инструментов, удаление как в Codex, откат через git; синхронизировать все документы, включая README, и документы Workflow Kit; выпустить Project Web Pilot 0.6.95.",
  "acceptance_criteria": [
    "Каталог macOS — 10 инструментов; delete_path, list_trash, restore_trash и их код удалены; правило про delete_path убрано из server instructions и session-rules.md",
    "Исполнитель при запуске убирает прежнюю папку trash только если она пуста",
    "Остальные десять инструментов, первые 512 символов server instructions, codex-tools.lock.json, Windows-runtime и канал VPS не изменены",
    "Все документы проекта, включая README.md, синхронизированы с результатом до сборки (DOCS) и после публикации; ни один документ не называет текущую версию подготовленной или несобранной",
    "Документы репозитория WorkflowKit синхронизированы с выпуском 0.6.95 и опубликованы в его origin/main; код, версия 1.5.5 и runtime Workflow Kit не изменены",
    "Релиз 0.6.95 собран один раз, установлен в /Applications, опубликован на GitHub; main синхронизирован"
  ],
  "approved_scope": {
    "functional_paths": [
      "tools/codex-app-server-mcp/server.py",
      "tests/codex-app-server-mcp.test.mjs",
      "package.json",
      "package-lock.json",
      "scripts/release-all.mjs",
      "scripts/check-installed-release.mjs",
      "scripts/check-github-release.mjs"
    ],
    "documentation_paths": [
      "docs/planning/codex-native-tools-macos.md",
      "tools/codex-app-server-mcp/session-rules.md",
      "README.md",
      "docs/PRODUCT.md",
      "docs/architecture/ARCHITECTURE.md",
      "docs/architecture/OVERVIEW.md",
      "docs/MODULES.md",
      "docs/DOCUMENTATION_INDEX.md",
      "docs/DECISIONS.md",
      "docs/VERIFICATION.md",
      "docs/RELEASE.md",
      "docs/modules/codex-app-server-executor.md",
      "docs/CLEAN_INSTALL.md",
      "docs/SOURCE_WORKSPACES.md",
      "docs/TRANSFER_TO_WINDOWS.md",
      "docs/WORKFLOW_START.md",
      "docs/modules/workflow-kit-recovery.md"
    ]
  },
  "baseline_commit": "48a299f616a7ed9266d6120ec23522b117c93795",
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
        "scope_id": "trash-removal-0.6.95-20261005",
        "task_id": "T001",
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
        "codex-tools-live"
      ],
      "id": "T001",
      "title": "Удалить корзину из MCP: каталог из 10 инструментов",
      "why": "Корзина не гарантирует восстановимость (rm и apply_patch её обходят), не имеет очистки и не входит в набор Codex; откат даёт git.",
      "verification_kind": "code",
      "acceptance_criteria": [
        "delete_path, list_trash, restore_trash, их методы в LocalFacade и неиспользуемый после этого код удалены из server.py; каталог — ровно 10 инструментов",
        "Из server instructions и session-rules.md убрана часть «delete paths with delete_path, not rm»; остальной текст правил и первые 512 символов instructions прежние",
        "При создании исполнителя прежняя папка trash в каталоге состояния удаляется только пустой; непустая остаётся нетронутой; каталог состояния по-прежнему создаётся",
        "Тест каталога требует ровно 10 имён и отсутствия трёх удалённых; тест проверяет оба случая с папкой trash",
        "Остальные десять инструментов, их параметры, описания и поведение не меняются; codex-tools.lock.json без изменений; Windows-runtime не тронут"
      ],
      "expected_commit_message": "feat: Удалить корзину из MCP: каталог из 10 инструментов",
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
        "scope_id": "trash-removal-0.6.95-20261005",
        "task_id": "T002",
        "role": "implementation"
      },
      "dependencies": [
        "T001"
      ],
      "functional_paths": [
        "package.json",
        "package-lock.json"
      ],
      "documentation_paths": [
        "docs/planning/codex-native-tools-macos.md",
        "README.md",
        "docs/PRODUCT.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/architecture/OVERVIEW.md",
        "docs/MODULES.md",
        "docs/DOCUMENTATION_INDEX.md",
        "docs/DECISIONS.md",
        "docs/VERIFICATION.md",
        "docs/RELEASE.md",
        "docs/modules/codex-app-server-executor.md",
        "docs/CLEAN_INSTALL.md",
        "docs/SOURCE_WORKSPACES.md",
        "docs/TRANSFER_TO_WINDOWS.md",
        "docs/WORKFLOW_START.md",
        "docs/modules/workflow-kit-recovery.md"
      ],
      "verification_ids": [
        "unit-all",
        "codex-tools-live"
      ],
      "id": "T002",
      "title": "Подготовить source версии 0.6.95 и проверить релизный исходник",
      "why": "Правка доходит до пользователя новой сборкой; весь код проверяется до первой сборки. Список документов задаёт охват DOCS: все документы проекта, включая README.",
      "verification_kind": "code",
      "acceptance_criteria": [
        "package.json и package-lock.json задают 0.6.95",
        "Полный npm test и сверка определений с Codex 0.160.0 проходят до первой сборки",
        "Сборка, установка и публикация на этом шаге не выполняются",
        "Следующая за этой задачей DOCS синхронизирует все перечисленные документы, включая README.md, и записывает в docs/VERIFICATION.md пользовательскую проверку 0.6.94"
      ],
      "expected_commit_message": "feat: Подготовить source версии 0.6.95 и проверить релизный исходник",
      "actual_files": [
        "package-lock.json",
        "package.json"
      ]
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "trash-removal-0.6.95-20261005",
        "task_id": "DOCS",
        "role": "implementation"
      },
      "dependencies": [
        "T001",
        "T002"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/planning/codex-native-tools-macos.md",
        "docs/PRODUCT.md",
        "docs/architecture/ARCHITECTURE.md",
        "tools/codex-app-server-mcp/session-rules.md",
        "README.md",
        "docs/architecture/OVERVIEW.md",
        "docs/MODULES.md",
        "docs/DOCUMENTATION_INDEX.md",
        "docs/DECISIONS.md",
        "docs/VERIFICATION.md",
        "docs/RELEASE.md",
        "docs/modules/codex-app-server-executor.md",
        "docs/CLEAN_INSTALL.md",
        "docs/SOURCE_WORKSPACES.md",
        "docs/TRANSFER_TO_WINDOWS.md",
        "docs/WORKFLOW_START.md",
        "docs/modules/workflow-kit-recovery.md"
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
        "docs/DECISIONS.md",
        "docs/DOCUMENTATION_INDEX.md",
        "docs/MODULES.md",
        "docs/PRODUCT.md",
        "docs/RELEASE.md",
        "docs/VERIFICATION.md",
        "docs/WORKFLOW_START.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/architecture/OVERVIEW.md",
        "docs/modules/codex-app-server-executor.md",
        "docs/planning/codex-native-tools-macos.md"
      ]
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "trash-removal-0.6.95-20261005",
        "task_id": "T003",
        "role": "implementation"
      },
      "dependencies": [
        "T002",
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
      "id": "T003",
      "title": "Собрать и проверить парный релиз 0.6.95",
      "why": "Пересобрать релиз после правок.",
      "verification_kind": "package",
      "acceptance_criteria": [
        "Preflight identity записан до сборки; сборку выполняет проверка paired-release при коммите этой задачи, один раз и только после завершённой DOCS",
        "~/Downloads/WebPilot-0.6.95 собран из коммита после DOCS, packagedSourceMatches=true, bundled Workflow Kit 1.5.5, в поставке шесть файлов",
        "Windows-runtime и его каталог не изменены; GitHub Release на этом шаге не публикуется"
      ],
      "expected_commit_message": "feat: Собрать и проверить парный релиз 0.6.95",
      "actual_files": []
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "trash-removal-0.6.95-20261005",
        "task_id": "T004",
        "role": "implementation"
      },
      "dependencies": [
        "T003",
        "DOCS"
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
      "id": "T004",
      "title": "Установить 0.6.95 и проверить установленные macOS-копии",
      "why": "Пользователь работает из /Applications.",
      "verification_kind": "installed",
      "acceptance_criteria": [
        "/Applications/Project Web Pilot.app и root app обновлены до 0.6.95 из уже собранного staging без пересборки; identity сохранена",
        "Исполнитель внутри установленного приложения совпадает с исходником релиза",
        "Интерфейсом компьютера агент не управляет"
      ],
      "expected_commit_message": "feat: Установить 0.6.95 и проверить установленные macOS-копии",
      "actual_files": []
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "trash-removal-0.6.95-20261005",
        "task_id": "T005",
        "role": "implementation"
      },
      "dependencies": [
        "T004",
        "DOCS"
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
      "id": "T005",
      "title": "Опубликовать GitHub Release v0.6.95 и синхронизировать main",
      "why": "Отправить релиз на GitHub.",
      "verification_kind": "package",
      "acceptance_criteria": [
        "Tag v0.6.95 указывает на release-manifest.sourceCommit",
        "GitHub Release v0.6.95 содержит ровно шесть ожидаемых файлов, их digests совпадают с локальной поставкой",
        "origin/main после managed commit совпадает с локальным HEAD; повторная сборка при публикации не выполняется"
      ],
      "expected_commit_message": "feat: Опубликовать GitHub Release v0.6.95 и синхронизировать main",
      "actual_files": []
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "trash-removal-0.6.95-20261005",
        "task_id": "T006",
        "role": "implementation"
      },
      "dependencies": [
        "T005",
        "DOCS"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/planning/codex-native-tools-macos.md",
        "docs/RELEASE.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "workflow-kit-docs"
      ],
      "id": "T006",
      "title": "Синхронизировать документы Workflow Kit с выпуском 0.6.95",
      "why": "Документы репозитория WorkflowKit называют текущим клиентом Web Pilot 0.6.94.",
      "verification_kind": "package",
      "acceptance_criteria": [
        "README.md, docs/PRODUCT.md, docs/architecture/OVERVIEW.md, docs/modules/workflow-kit-package.md и docs/DOCUMENTATION_INDEX.md репозитория WorkflowKit называют текущим клиентом опубликованный Web Pilot 0.6.95 с bundled Workflow Kit 1.5.5",
        "Правка выполнена собственным планом Workflow Kit в репозитории WorkflowKit и только в документах; код, версия 1.5.5 и состав runtime не изменены",
        "Коммиты WorkflowKit отправлены в его origin/main; worktree чистый",
        "docs/RELEASE.md Web Pilot называет коммит синхронизации WorkflowKit"
      ],
      "expected_commit_message": "feat: Синхронизировать документы Workflow Kit с выпуском 0.6.95",
      "actual_files": [
        "docs/RELEASE.md",
        "docs/VERIFICATION.md"
      ]
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "trash-removal-0.6.95-20261005",
        "task_id": "T007",
        "role": "implementation"
      },
      "dependencies": [
        "T006",
        "DOCS"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/planning/codex-native-tools-macos.md",
        "README.md",
        "docs/PRODUCT.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/architecture/OVERVIEW.md",
        "docs/MODULES.md",
        "docs/DOCUMENTATION_INDEX.md",
        "docs/DECISIONS.md",
        "docs/VERIFICATION.md",
        "docs/RELEASE.md",
        "docs/modules/codex-app-server-executor.md",
        "docs/CLEAN_INSTALL.md",
        "docs/SOURCE_WORKSPACES.md",
        "docs/TRANSFER_TO_WINDOWS.md",
        "docs/WORKFLOW_START.md",
        "docs/modules/workflow-kit-recovery.md"
      ],
      "verification_ids": [
        "github-release"
      ],
      "id": "T007",
      "title": "Послерелизная сверка всех документов и README, синхронизация origin/main",
      "why": "DOCS пишется до сборки и называет версию исходниками; после публикации документы должны называть её опубликованной.",
      "verification_kind": "package",
      "acceptance_criteria": [
        "README.md и все перечисленные документы называют 0.6.95 текущим опубликованным и установленным релизом, 0.6.94 — предыдущим",
        "Ни в README, ни в docs нет строк, называющих текущую версию подготовленной, несобранной или готовой к release-хвосту",
        "docs/VERIFICATION.md и docs/RELEASE.md содержат итог релиза: проверки, sourceCommit, шесть файлов поставки, коммит синхронизации WorkflowKit",
        "origin/main совпадает с финальным локальным HEAD после публикации"
      ],
      "expected_commit_message": "feat: Послерелизная сверка всех документов и README, синхронизация origin/main"
    }
  ],
  "blocked_reason": null,
  "user_decisions": [
    {
      "id": "4a69678f-899f-41d2-871f-a78b60a89ce0",
      "text": "Поручение пользователя 05.10.2026: корзину удалить совсем (у агента есть git, шаги и коммиты); закрыть текущий план, открыть новый, реализовать его и собрать новый релиз; отчитаться после завершения.",
      "recorded_at": "2026-10-05T18:02:57.978Z"
    }
  ]
}
```
<!-- workflow-state:end -->

## Состояние

Execution Scope Status: ACTIVE
Delivery Status: IN_PROGRESS
Scope: trash-removal-0.6.95-20261005
Current Task: нет
Revision: 1295

## Цель

Убрать самодельную корзину из macOS MCP Codex App Server Local Mac: каталог из 10 инструментов, удаление как в Codex, откат через git; синхронизировать все документы, включая README, и документы Workflow Kit; выпустить Project Web Pilot 0.6.95.

## Критерии приёмки

- Каталог macOS — 10 инструментов; delete_path, list_trash, restore_trash и их код удалены; правило про delete_path убрано из server instructions и session-rules.md
- Исполнитель при запуске убирает прежнюю папку trash только если она пуста
- Остальные десять инструментов, первые 512 символов server instructions, codex-tools.lock.json, Windows-runtime и канал VPS не изменены
- Все документы проекта, включая README.md, синхронизированы с результатом до сборки (DOCS) и после публикации; ни один документ не называет текущую версию подготовленной или несобранной
- Документы репозитория WorkflowKit синхронизированы с выпуском 0.6.95 и опубликованы в его origin/main; код, версия 1.5.5 и runtime Workflow Kit не изменены
- Релиз 0.6.95 собран один раз, установлен в /Applications, опубликован на GitHub; main синхронизирован

## Микрозадачи

- [DONE] T001: Удалить корзину из MCP: каталог из 10 инструментов — Завершено
  - Git Commit: [DONE] feat: Удалить корзину из MCP: каталог из 10 инструментов
  - Reference: trash-removal-0.6.95-20261005 / T001 / implementation
  - Файлы: tools/codex-app-server-mcp/server.py, tests/codex-app-server-mcp.test.mjs, docs/planning/codex-native-tools-macos.md, tools/codex-app-server-mcp/session-rules.md
- [DONE] T002: Подготовить source версии 0.6.95 и проверить релизный исходник — Завершено
  - Git Commit: [DONE] feat: Подготовить source версии 0.6.95 и проверить релизный исходник
  - Reference: trash-removal-0.6.95-20261005 / T002 / implementation
  - Файлы: package.json, package-lock.json, docs/planning/codex-native-tools-macos.md, README.md, docs/PRODUCT.md, docs/architecture/ARCHITECTURE.md, docs/architecture/OVERVIEW.md, docs/MODULES.md, docs/DOCUMENTATION_INDEX.md, docs/DECISIONS.md, docs/VERIFICATION.md, docs/RELEASE.md, docs/modules/codex-app-server-executor.md, docs/CLEAN_INSTALL.md, docs/SOURCE_WORKSPACES.md, docs/TRANSFER_TO_WINDOWS.md, docs/WORKFLOW_START.md, docs/modules/workflow-kit-recovery.md
- [DONE] DOCS: Актуализация всех документов проекта — Завершено
  - Git Commit: [DONE] docs: актуализировать контекст проекта
  - Reference: trash-removal-0.6.95-20261005 / DOCS / implementation
  - Файлы: docs/planning/codex-native-tools-macos.md, docs/PRODUCT.md, docs/architecture/ARCHITECTURE.md, tools/codex-app-server-mcp/session-rules.md, README.md, docs/architecture/OVERVIEW.md, docs/MODULES.md, docs/DOCUMENTATION_INDEX.md, docs/DECISIONS.md, docs/VERIFICATION.md, docs/RELEASE.md, docs/modules/codex-app-server-executor.md, docs/CLEAN_INSTALL.md, docs/SOURCE_WORKSPACES.md, docs/TRANSFER_TO_WINDOWS.md, docs/WORKFLOW_START.md, docs/modules/workflow-kit-recovery.md
- [DONE] T003: Собрать и проверить парный релиз 0.6.95 — Завершено
  - Git Commit: [DONE] feat: Собрать и проверить парный релиз 0.6.95
  - Reference: trash-removal-0.6.95-20261005 / T003 / implementation
  - Файлы: scripts/release-all.mjs, docs/planning/codex-native-tools-macos.md
- [DONE] T004: Установить 0.6.95 и проверить установленные macOS-копии — Завершено
  - Git Commit: [DONE] feat: Установить 0.6.95 и проверить установленные macOS-копии
  - Reference: trash-removal-0.6.95-20261005 / T004 / implementation
  - Файлы: scripts/check-installed-release.mjs, docs/planning/codex-native-tools-macos.md
- [DONE] T005: Опубликовать GitHub Release v0.6.95 и синхронизировать main — Завершено
  - Git Commit: [DONE] feat: Опубликовать GitHub Release v0.6.95 и синхронизировать main
  - Reference: trash-removal-0.6.95-20261005 / T005 / implementation
  - Файлы: scripts/check-github-release.mjs, docs/planning/codex-native-tools-macos.md
- [DONE] T006: Синхронизировать документы Workflow Kit с выпуском 0.6.95 — Завершено
  - Git Commit: [DONE] feat: Синхронизировать документы Workflow Kit с выпуском 0.6.95
  - Reference: trash-removal-0.6.95-20261005 / T006 / implementation
  - Файлы: docs/planning/codex-native-tools-macos.md, docs/RELEASE.md, docs/VERIFICATION.md
- [TODO] T007: Послерелизная сверка всех документов и README, синхронизация origin/main — Ожидает
  - Git Commit: [PENDING] feat: Послерелизная сверка всех документов и README, синхронизация origin/main
  - Reference: trash-removal-0.6.95-20261005 / T007 / implementation
  - Файлы: docs/planning/codex-native-tools-macos.md, README.md, docs/PRODUCT.md, docs/architecture/ARCHITECTURE.md, docs/architecture/OVERVIEW.md, docs/MODULES.md, docs/DOCUMENTATION_INDEX.md, docs/DECISIONS.md, docs/VERIFICATION.md, docs/RELEASE.md, docs/modules/codex-app-server-executor.md, docs/CLEAN_INSTALL.md, docs/SOURCE_WORKSPACES.md, docs/TRANSFER_TO_WINDOWS.md, docs/WORKFLOW_START.md, docs/modules/workflow-kit-recovery.md

## Context Pack For This Cycle

- docs/architecture/OVERVIEW.md → Краткая архитектура проекта
- docs/MODULES.md → Модули проекта
- docs/DOCUMENTATION_INDEX.md → Каталог документации
- docs/planning/codex-native-tools-macos.md

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
