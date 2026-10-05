# Активный план — Project Web Pilot

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 1272,
  "project_id": "cf944136-d1fc-4bd5-9ea0-e46d1fe230e7",
  "project_name": "Project Web Pilot",
  "scope_id": "codex-tools-polish-0.6.94-20261005",
  "execution_scope_status": "ACTIVE",
  "delivery_status": "IN_PROGRESS",
  "objective": "Довести macOS MCP Codex App Server Local Mac до предела того, что мы контролируем: закрыть всё найденное пользовательской проверкой 0.6.93 (Wall time, ввод в завершившуюся сессию, одна обрезка вывода, описания всех 13 инструментов, подсказка про изображения, общее правило повтора), синхронизировать все документы, включая README, и документы Workflow Kit; выпустить Project Web Pilot 0.6.94.",
  "acceptance_criteria": [
    "write_stdin показывает Wall time своего вызова, а ввод в уже завершившуюся сессию возвращает финальный вывод и код выхода вместо их потери",
    "Ответ exec_command и write_stdin обрезается один раз: бюджет 8000 оценочных токенов, ChatGPT не обрезает его повторно",
    "Все 13 инструментов и все их параметры имеют описания; описания трёх инструментов с изображениями объясняют состав результата; правило повтора после блокировки OpenAI общее и стоит в описаниях, server instructions и session-rules.md",
    "Каталог остаётся из 13 инструментов с прежними именами, параметрами и поведением; первые 512 символов server instructions, codex-tools.lock.json, Windows-runtime и канал VPS не изменены",
    "Все документы проекта, включая README.md, синхронизированы с результатом до сборки (DOCS) и после публикации; ни один документ не называет текущую версию подготовленной или готовой к release-хвосту",
    "Документы репозитория WorkflowKit синхронизированы с выпуском 0.6.94 и опубликованы в его origin/main; код, версия 1.5.5 и runtime Workflow Kit не изменены",
    "Релиз 0.6.94 собран, установлен в /Applications, опубликован на GitHub; main синхронизирован"
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
  "baseline_commit": "ce8c6cc5d2dddb1f6c2f9ddf869ef7692f932860",
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
        "scope_id": "codex-tools-polish-0.6.94-20261005",
        "task_id": "T001",
        "role": "implementation"
      },
      "dependencies": [],
      "functional_paths": [
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
      "title": "write_stdin: Wall time вызова и ввод в завершившуюся сессию",
      "why": "Wall time у write_stdin показывает возраст процесса (опрос на 5 с показал 27,758 с), а непустой ввод в уже завершившуюся сессию удаляет её с ошибкой и теряет непрочитанный вывод и код выхода. В Codex rust-v0.160.0 Wall time — длительность вызова, а при Exited после записи возвращается финальный результат.",
      "verification_kind": "code",
      "acceptance_criteria": [
        "Поведение сверено с openai/codex rust-v0.160.0 (process_manager.rs)",
        "Wall time в ответе write_stdin — длительность этого вызова от момента после записи до ответа; у exec_command значение прежнее",
        "Тест на настоящем App Server: после паузы не меньше 2 с ввод в tty-сессию возвращает Wall time меньше 1 с; пустой опрос работающего процесса показывает фактическое ожидание, а не возраст процесса",
        "Непустой write_stdin (обычный ввод и Ctrl-C) в сессию, процесс которой уже завершился, возвращает Process exited with code N и непрочитанный вывод; сессия закрывается; следующий вызов даёт Unknown or finished command session",
        "Ошибка command/exec/terminate из-за процесса, завершившегося в этот момент, не теряет результат: ответ — финальный результат процесса",
        "Отказ на обычный ввод в работающую non-TTY сессию, пустой опрос, пределы ожидания и формат ответа не меняются"
      ],
      "expected_commit_message": "feat: write_stdin: Wall time вызова и ввод в завершившуюся сессию",
      "actual_files": [
        "tests/codex-app-server-mcp.test.mjs",
        "tools/codex-app-server-mcp/server.py"
      ]
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "codex-tools-polish-0.6.94-20261005",
        "task_id": "T002",
        "role": "implementation"
      },
      "dependencies": [
        "T001"
      ],
      "functional_paths": [
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
      "id": "T002",
      "title": "Одна обрезка вывода: бюджет 8000 токенов",
      "why": "Предел 10000 оценочных токенов — 40000 байт; на выводе seq 1 60000 ChatGPT насчитал 11919 настоящих токенов и обрезал ответ второй раз своим маркером.",
      "verification_kind": "code",
      "acceptance_criteria": [
        "max_output_tokens у exec_command и write_stdin: значение по умолчанию и верхняя граница 8000; большее значение приводится к 8000, не отклоняется",
        "Описания параметра max_output_tokens и фраза о размере вывода в описании exec_command называют 8000",
        "Тест на настоящем App Server: seq 1 60000 возвращает вывод не длиннее 32000 байт с одним маркером bytes omitted, начало и конец сохранены, Original token count показывает полный размер",
        "workflow_context_recover и размер его частей не меняются"
      ],
      "expected_commit_message": "feat: Одна обрезка вывода: бюджет 8000 токенов",
      "actual_files": [
        "tests/codex-app-server-mcp.test.mjs",
        "tools/codex-app-server-mcp/server.py"
      ]
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "codex-tools-polish-0.6.94-20261005",
        "task_id": "T003",
        "role": "implementation"
      },
      "dependencies": [
        "T002"
      ],
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
        "unit-all",
        "codex-tools-live"
      ],
      "id": "T003",
      "title": "Описания всех 13 инструментов и параметров, подсказка про изображения, общее правило повтора",
      "why": "Шесть инструментов из 13 не имеют описания, параметры описаны только у двух; агент потерял изображение, потому что искал блоки результата не в том поле; правило повтора стоит только у exec_command и названо по одному тексту отказа, а все три блокировки в проверке пришли с другим текстом, одна — на write_stdin.",
      "verification_kind": "code",
      "acceptance_criteria": [
        "Все 13 инструментов имеют непустое описание, все их параметры — непустые описания; тест каталога проверяет это для всех 13",
        "Описания apply_patch и view_image и их параметров основаны на спецификациях Codex rust-v0.160.0 с локальными отличиями",
        "Описания view_image, computer_capture_screen и computer_capture_window сообщают: результат — текстовый блок с JSON и блок image/png; в скрипте вызова ChatGPT блоки лежат в content_items, блок изображения передаётся в image()",
        "Правило повтора общее: если OpenAI заблокировал вызов до исполнения — один раз повторить тот же вызов без изменений; менять или делить его только если повтор тоже заблокирован. Оно стоит в описаниях exec_command и write_stdin, в хвосте server instructions после первых 512 символов и той же строкой в session-rules.md",
        "Имена, параметры, значения по умолчанию и поведение инструментов не меняются; первые 512 символов server instructions прежние; codex-tools.lock.json без изменений; Windows-runtime не тронут"
      ],
      "expected_commit_message": "feat: Описания всех 13 инструментов и параметров, подсказка про изображения, общее правило повтора",
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
        "scope_id": "codex-tools-polish-0.6.94-20261005",
        "task_id": "T004",
        "role": "implementation"
      },
      "dependencies": [
        "T001",
        "T002",
        "T003"
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
        "docs/modules/codex-app-server-executor.md"
      ],
      "verification_ids": [
        "unit-all",
        "codex-tools-live"
      ],
      "id": "T004",
      "title": "Подготовить source версии 0.6.94 и проверить релизный исходник",
      "why": "Правки доходят до пользователя новой сборкой; весь код проверяется до первой сборки. Список документов задаёт охват DOCS: все документы проекта, включая README.",
      "verification_kind": "code",
      "acceptance_criteria": [
        "package.json и package-lock.json задают 0.6.94",
        "Полный npm test и сверка определений с Codex 0.160.0 проходят до первой сборки",
        "Сборка, установка и публикация на этом шаге не выполняются",
        "Следующая за этой задачей DOCS синхронизирует все перечисленные документы, включая README.md, и записывает в docs/VERIFICATION.md пользовательскую проверку 0.6.93"
      ],
      "expected_commit_message": "feat: Подготовить source версии 0.6.94 и проверить релизный исходник",
      "actual_files": [
        "package-lock.json",
        "package.json"
      ]
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "codex-tools-polish-0.6.94-20261005",
        "task_id": "DOCS",
        "role": "implementation"
      },
      "dependencies": [
        "T001",
        "T002",
        "T003",
        "T004"
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
        "docs/CLEAN_INSTALL.md",
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
        "docs/planning/codex-native-tools-macos.md"
      ]
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "codex-tools-polish-0.6.94-20261005",
        "task_id": "T005",
        "role": "implementation"
      },
      "dependencies": [
        "T004",
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
      "id": "T005",
      "title": "Собрать и проверить парный релиз 0.6.94",
      "why": "Пересобрать релиз после правок.",
      "verification_kind": "package",
      "acceptance_criteria": [
        "npm run build выполняется один раз и только после завершённой DOCS; preflight identity записан до сборки",
        "~/Downloads/WebPilot-0.6.94 собран из коммита после DOCS, packagedSourceMatches=true, bundled Workflow Kit 1.5.5, в поставке шесть файлов",
        "Windows-runtime и его каталог не изменены; GitHub Release на этом шаге не публикуется"
      ],
      "expected_commit_message": "feat: Собрать и проверить парный релиз 0.6.94",
      "actual_files": []
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "codex-tools-polish-0.6.94-20261005",
        "task_id": "T006",
        "role": "implementation"
      },
      "dependencies": [
        "T005",
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
      "id": "T006",
      "title": "Установить 0.6.94 и проверить установленные macOS-копии",
      "why": "Пользователь работает из /Applications.",
      "verification_kind": "installed",
      "acceptance_criteria": [
        "/Applications/Project Web Pilot.app и root app обновлены до 0.6.94 из уже собранного staging без пересборки; identity сохранена",
        "Установленный executor совпадает с исходником релиза",
        "Интерфейсом компьютера агент не управляет"
      ],
      "expected_commit_message": "feat: Установить 0.6.94 и проверить установленные macOS-копии",
      "actual_files": []
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "codex-tools-polish-0.6.94-20261005",
        "task_id": "T007",
        "role": "implementation"
      },
      "dependencies": [
        "T006",
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
      "id": "T007",
      "title": "Опубликовать GitHub Release v0.6.94 и синхронизировать main",
      "why": "Отправить релиз на GitHub.",
      "verification_kind": "package",
      "acceptance_criteria": [
        "Tag v0.6.94 указывает на release-manifest.sourceCommit",
        "GitHub Release v0.6.94 содержит ровно шесть ожидаемых файлов, их digests совпадают с локальной поставкой",
        "origin/main после managed commit совпадает с локальным HEAD; повторная сборка при публикации не выполняется"
      ],
      "expected_commit_message": "feat: Опубликовать GitHub Release v0.6.94 и синхронизировать main"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "codex-tools-polish-0.6.94-20261005",
        "task_id": "T008",
        "role": "implementation"
      },
      "dependencies": [
        "T007",
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
      "id": "T008",
      "title": "Синхронизировать документы Workflow Kit с выпуском 0.6.94",
      "why": "README и документы репозитория WorkflowKit называют текущим клиентом Web Pilot 0.6.80 и версией исходников 1.5.4 при фактических Web Pilot 0.6.9x и Kit 1.5.5: прошлые релизы их не обновляли.",
      "verification_kind": "package",
      "acceptance_criteria": [
        "README.md, docs/PRODUCT.md, docs/architecture/OVERVIEW.md, docs/modules/workflow-kit-package.md и docs/DOCUMENTATION_INDEX.md репозитория WorkflowKit называют текущим клиентом опубликованный Web Pilot 0.6.94 с bundled Workflow Kit 1.5.5",
        "Версии Kit указаны по факту и одинаково во всех документах: исходники и runtime 1.5.5; последний тег GitHub Release — тот, что есть в репозитории",
        "Правка выполнена собственным планом Workflow Kit в репозитории WorkflowKit и только в документах; код, версия 1.5.5 и состав runtime не изменены",
        "Коммиты WorkflowKit отправлены в его origin/main; worktree чистый",
        "docs/RELEASE.md Web Pilot называет коммит синхронизации WorkflowKit"
      ],
      "expected_commit_message": "feat: Синхронизировать документы Workflow Kit с выпуском 0.6.94"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "codex-tools-polish-0.6.94-20261005",
        "task_id": "T009",
        "role": "implementation"
      },
      "dependencies": [
        "T008",
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
        "docs/modules/codex-app-server-executor.md"
      ],
      "verification_ids": [
        "github-release"
      ],
      "id": "T009",
      "title": "Послерелизная сверка всех документов и README, синхронизация origin/main",
      "why": "DOCS пишется до сборки и называет версию подготовленной; после 0.6.93 такие строки остались в ARCHITECTURE.md и DOCUMENTATION_INDEX.md.",
      "verification_kind": "package",
      "acceptance_criteria": [
        "README.md и все перечисленные документы называют 0.6.94 текущим опубликованным и установленным релизом, 0.6.93 — предыдущим",
        "Ни в README, ни в docs нет строк, называющих 0.6.93 или текущую версию подготовленной или готовой к release-хвосту, включая docs/architecture/ARCHITECTURE.md и docs/DOCUMENTATION_INDEX.md",
        "docs/VERIFICATION.md и docs/RELEASE.md содержат итог релиза: проверки, sourceCommit, шесть файлов поставки, коммит синхронизации WorkflowKit",
        "origin/main совпадает с финальным локальным HEAD после публикации"
      ],
      "expected_commit_message": "feat: Послерелизная сверка всех документов и README, синхронизация origin/main"
    }
  ],
  "blocked_reason": null,
  "user_decisions": [
    {
      "id": "39b3a28b-3fc7-43c9-8e8f-f1770931a1f2",
      "text": "Поручение пользователя 05.10.2026: закрыть scope 0.6.93; все найденные при проверке мелочи включить в новый scope и собрать новый релиз — «мелочей здесь не должно быть»; в плане указать синхронизацию всех документов, включая README, и обязательно Workflow Kit.",
      "recorded_at": "2026-10-05T15:56:30.282Z"
    }
  ]
}
```
<!-- workflow-state:end -->

## Состояние

Execution Scope Status: ACTIVE
Delivery Status: IN_PROGRESS
Scope: codex-tools-polish-0.6.94-20261005
Current Task: нет
Revision: 1272

## Цель

Довести macOS MCP Codex App Server Local Mac до предела того, что мы контролируем: закрыть всё найденное пользовательской проверкой 0.6.93 (Wall time, ввод в завершившуюся сессию, одна обрезка вывода, описания всех 13 инструментов, подсказка про изображения, общее правило повтора), синхронизировать все документы, включая README, и документы Workflow Kit; выпустить Project Web Pilot 0.6.94.

## Критерии приёмки

- write_stdin показывает Wall time своего вызова, а ввод в уже завершившуюся сессию возвращает финальный вывод и код выхода вместо их потери
- Ответ exec_command и write_stdin обрезается один раз: бюджет 8000 оценочных токенов, ChatGPT не обрезает его повторно
- Все 13 инструментов и все их параметры имеют описания; описания трёх инструментов с изображениями объясняют состав результата; правило повтора после блокировки OpenAI общее и стоит в описаниях, server instructions и session-rules.md
- Каталог остаётся из 13 инструментов с прежними именами, параметрами и поведением; первые 512 символов server instructions, codex-tools.lock.json, Windows-runtime и канал VPS не изменены
- Все документы проекта, включая README.md, синхронизированы с результатом до сборки (DOCS) и после публикации; ни один документ не называет текущую версию подготовленной или готовой к release-хвосту
- Документы репозитория WorkflowKit синхронизированы с выпуском 0.6.94 и опубликованы в его origin/main; код, версия 1.5.5 и runtime Workflow Kit не изменены
- Релиз 0.6.94 собран, установлен в /Applications, опубликован на GitHub; main синхронизирован

## Микрозадачи

- [DONE] T001: write_stdin: Wall time вызова и ввод в завершившуюся сессию — Завершено
  - Git Commit: [DONE] feat: write_stdin: Wall time вызова и ввод в завершившуюся сессию
  - Reference: codex-tools-polish-0.6.94-20261005 / T001 / implementation
  - Файлы: tools/codex-app-server-mcp/server.py, tests/codex-app-server-mcp.test.mjs, docs/planning/codex-native-tools-macos.md
- [DONE] T002: Одна обрезка вывода: бюджет 8000 токенов — Завершено
  - Git Commit: [DONE] feat: Одна обрезка вывода: бюджет 8000 токенов
  - Reference: codex-tools-polish-0.6.94-20261005 / T002 / implementation
  - Файлы: tools/codex-app-server-mcp/server.py, tests/codex-app-server-mcp.test.mjs, docs/planning/codex-native-tools-macos.md
- [DONE] T003: Описания всех 13 инструментов и параметров, подсказка про изображения, общее правило повтора — Завершено
  - Git Commit: [DONE] feat: Описания всех 13 инструментов и параметров, подсказка про изображения, общее правило повтора
  - Reference: codex-tools-polish-0.6.94-20261005 / T003 / implementation
  - Файлы: tools/codex-app-server-mcp/server.py, tests/codex-app-server-mcp.test.mjs, docs/planning/codex-native-tools-macos.md, tools/codex-app-server-mcp/session-rules.md
- [DONE] T004: Подготовить source версии 0.6.94 и проверить релизный исходник — Завершено
  - Git Commit: [DONE] feat: Подготовить source версии 0.6.94 и проверить релизный исходник
  - Reference: codex-tools-polish-0.6.94-20261005 / T004 / implementation
  - Файлы: package.json, package-lock.json, docs/planning/codex-native-tools-macos.md, README.md, docs/PRODUCT.md, docs/architecture/ARCHITECTURE.md, docs/architecture/OVERVIEW.md, docs/MODULES.md, docs/DOCUMENTATION_INDEX.md, docs/DECISIONS.md, docs/VERIFICATION.md, docs/RELEASE.md, docs/modules/codex-app-server-executor.md
- [DONE] DOCS: Актуализация всех документов проекта — Завершено
  - Git Commit: [DONE] docs: актуализировать контекст проекта
  - Reference: codex-tools-polish-0.6.94-20261005 / DOCS / implementation
  - Файлы: docs/planning/codex-native-tools-macos.md, docs/PRODUCT.md, docs/architecture/ARCHITECTURE.md, tools/codex-app-server-mcp/session-rules.md, README.md, docs/architecture/OVERVIEW.md, docs/MODULES.md, docs/DOCUMENTATION_INDEX.md, docs/DECISIONS.md, docs/VERIFICATION.md, docs/RELEASE.md, docs/modules/codex-app-server-executor.md, docs/CLEAN_INSTALL.md, docs/SOURCE_WORKSPACES.md, docs/TRANSFER_TO_WINDOWS.md, docs/WORKFLOW_START.md, docs/modules/workflow-kit-recovery.md
- [DONE] T005: Собрать и проверить парный релиз 0.6.94 — Завершено
  - Git Commit: [DONE] feat: Собрать и проверить парный релиз 0.6.94
  - Reference: codex-tools-polish-0.6.94-20261005 / T005 / implementation
  - Файлы: scripts/release-all.mjs, docs/planning/codex-native-tools-macos.md
- [DONE] T006: Установить 0.6.94 и проверить установленные macOS-копии — Завершено
  - Git Commit: [DONE] feat: Установить 0.6.94 и проверить установленные macOS-копии
  - Reference: codex-tools-polish-0.6.94-20261005 / T006 / implementation
  - Файлы: scripts/check-installed-release.mjs, docs/planning/codex-native-tools-macos.md
- [TODO] T007: Опубликовать GitHub Release v0.6.94 и синхронизировать main — Ожидает
  - Git Commit: [PENDING] feat: Опубликовать GitHub Release v0.6.94 и синхронизировать main
  - Reference: codex-tools-polish-0.6.94-20261005 / T007 / implementation
  - Файлы: scripts/check-github-release.mjs, docs/planning/codex-native-tools-macos.md
- [TODO] T008: Синхронизировать документы Workflow Kit с выпуском 0.6.94 — Ожидает
  - Git Commit: [PENDING] feat: Синхронизировать документы Workflow Kit с выпуском 0.6.94
  - Reference: codex-tools-polish-0.6.94-20261005 / T008 / implementation
  - Файлы: docs/planning/codex-native-tools-macos.md, docs/RELEASE.md, docs/VERIFICATION.md
- [TODO] T009: Послерелизная сверка всех документов и README, синхронизация origin/main — Ожидает
  - Git Commit: [PENDING] feat: Послерелизная сверка всех документов и README, синхронизация origin/main
  - Reference: codex-tools-polish-0.6.94-20261005 / T009 / implementation
  - Файлы: docs/planning/codex-native-tools-macos.md, README.md, docs/PRODUCT.md, docs/architecture/ARCHITECTURE.md, docs/architecture/OVERVIEW.md, docs/MODULES.md, docs/DOCUMENTATION_INDEX.md, docs/DECISIONS.md, docs/VERIFICATION.md, docs/RELEASE.md, docs/modules/codex-app-server-executor.md

## Context Pack For This Cycle

- docs/architecture/OVERVIEW.md → Краткая архитектура проекта
- docs/MODULES.md → Модули проекта
- docs/DOCUMENTATION_INDEX.md → Каталог документации
- docs/planning/codex-native-tools-macos.md

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
