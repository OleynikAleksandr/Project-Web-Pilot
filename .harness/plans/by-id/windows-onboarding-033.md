# Активный план — Project Web Pilot

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 61,
  "project_id": "cf944136-d1fc-4bd5-9ea0-e46d1fe230e7",
  "project_name": "Project Web Pilot",
  "scope_id": "windows-onboarding-033",
  "execution_scope_status": "ACTIVE",
  "delivery_status": "IN_PROGRESS",
  "objective": "Зафиксировать пользовательский полный проход 0.6.43, убрать атрибуты автора/email из создания проекта и приложения, выпустить 0.6.44 для Mac/Windows и опубликовать исходники и бинарный релиз на GitHub.",
  "acceptance_criteria": [
    "Windows показывает и выполняет шаги компонентов, туннеля и создания проекта после входа",
    "Данные подключения проходят существующее защищённое хранилище Windows; настройки сохраняются",
    "macOS сохраняет рабочее поведение, обе платформы выпущены как 0.6.41",
    "Source, tests, packaged fixtures и состав ZIP проверены; реальное подключение и приёмка в госте отдельно подтверждаются пользователем",
    "В Mac и Windows ID туннеля и API key оформлены двумя последовательными шагами; ссылка API keys и инструкция создания/копирования/вставки видимы без раскрытия подсказок",
    "Ручной путь не открывает два диалога подряд; перед вводом ключа показана инструкция",
    "Один парный выпуск 0.6.42 в Downloads, постоянный Mac app обновлён с сохранением identity; VM и Computer Use не используются",
    "Кнопка вставки ID всегда открывает отдельное системное поле на Mac и Windows; пустой/несвязанный буфер не вызывает ошибку до ввода",
    "Отмена не меняет настройки; подтверждённый ID ведёт к инструкции API key без второго немедленного диалога",
    "Обе платформы выпущены как 0.6.43; пользователь сам проверяет VM",
    "Создание проекта не запрашивает и не передаёт имя/email; служебная Git история создаётся при отсутствии пользовательской настройки без изменения глобального Git",
    "Новый парный релиз 0.6.44, README и документация актуальны; GitHub main и release с обоими ZIP опубликованы и проверены после финального DOCS commit"
  ],
  "approved_scope": {
    "functional_paths": [
      "resources/runtime-control/windows-first-run.py",
      "tests/windows-first-run.test.mjs",
      "src/windows-runtime.mjs",
      "tests/windows-runtime.test.mjs",
      "src/startup-platform.mjs",
      "src/startup-readiness.mjs",
      "tests/startup-platform.test.mjs",
      "src/main.mjs",
      "src/workspace-setup.mjs",
      "tests/workspace-setup.test.mjs",
      "src/ui/startup.mjs",
      "src/ui/index.html",
      "tests/startup-ui.test.mjs",
      "scripts/release-all.mjs",
      "package.json",
      "package-lock.json",
      "tests/electron-smoke.mjs",
      "tests/release-all.test.mjs",
      "scripts/verify-windows-package.mjs",
      "src/tunnel-clipboard.mjs",
      "tests/tunnel-clipboard.test.mjs",
      "resources/runtime-control/mac-first-run.py",
      "tests/tunnel-id-prompt.test.mjs",
      "src/mac-runtime.mjs",
      "tests/tunnel-id-runtime.test.mjs",
      "resources/workspace-setup-worker.mjs",
      "src/preload.cjs",
      "src/ui/workspace-setup.mjs",
      "tests/project-doctor-ui.test.mjs"
    ],
    "documentation_paths": [
      "AGENTS.md",
      "README.md",
      "docs/WORKFLOW_START.md",
      "docs/PRODUCT.md",
      "docs/DECISIONS.md",
      "docs/architecture/OVERVIEW.md",
      "docs/MODULES.md",
      "docs/DOCUMENTATION_INDEX.md",
      "docs/CLEAN_INSTALL.md",
      "docs/TRANSFER_TO_WINDOWS.md",
      "docs/RELEASE.md",
      "docs/WORKSPACE_SETUP.md",
      "docs/CONTEXT_DELIVERY.md",
      "docs/modules/runtime-lifecycle.md",
      "docs/modules/workspace-sessions.md",
      "docs/architecture/ARCHITECTURE.md",
      "docs/VERIFICATION.md",
      "docs/modules/first-run-onboarding.md"
    ],
    "max_functional_files_per_task": 3
  },
  "baseline_commit": "3d5ece83f1b1a5565bf419b1da3502ed29e58891",
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
        "path": "docs/modules/first-run-onboarding.md",
        "heading_path": [
          "Первый запуск Web Pilot на чистой системе"
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
        "scope_id": "windows-onboarding-033",
        "task_id": "P001",
        "role": "implementation"
      },
      "dependencies": [],
      "functional_paths": [],
      "documentation_paths": [
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md",
        "docs/modules/first-run-onboarding.md",
        "docs/DECISIONS.md",
        "docs/modules/runtime-lifecycle.md",
        "docs/RELEASE.md",
        "docs/CLEAN_INSTALL.md"
      ],
      "verification_ids": [],
      "id": "P001",
      "title": "Уточнить контракт Windows первого запуска и парного релиза",
      "why": "Уточнить контракт Windows первого запуска и парного релиза",
      "acceptance_criteria": [
        "Зафиксированы наблюдение пользователя, фасады, границы секретов и единый релиз 0.6.41"
      ],
      "expected_commit_message": "docs: Уточнить контракт Windows первого запуска и парного релиза"
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "windows-onboarding-033",
        "task_id": "W001",
        "role": "implementation"
      },
      "dependencies": [
        "P001"
      ],
      "functional_paths": [
        "resources/runtime-control/windows-first-run.py",
        "tests/windows-first-run.test.mjs"
      ],
      "documentation_paths": [
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md",
        "docs/modules/first-run-onboarding.md"
      ],
      "verification_ids": [
        "suite"
      ],
      "id": "W001",
      "title": "Добавить нативный защищённый ввод подключения Windows",
      "why": "Добавить нативный защищённый ввод подключения Windows",
      "acceptance_criteria": [
        "Clipboard stdin и ручной диалог используют DPAPI через существующий control",
        "Отмена и неверные данные не останавливают службы и не меняют сохранённые настройки"
      ],
      "expected_commit_message": "feat: Добавить нативный защищённый ввод подключения Windows"
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "windows-onboarding-033",
        "task_id": "W002",
        "role": "implementation"
      },
      "dependencies": [
        "W001"
      ],
      "functional_paths": [
        "src/windows-runtime.mjs",
        "tests/windows-runtime.test.mjs"
      ],
      "documentation_paths": [
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md",
        "docs/modules/first-run-onboarding.md",
        "docs/modules/runtime-lifecycle.md"
      ],
      "verification_ids": [
        "suite"
      ],
      "id": "W002",
      "title": "Подключить настройку туннеля и комплектный Git к Windows bootstrap",
      "why": "Подключить настройку туннеля и комплектный Git к Windows bootstrap",
      "acceptance_criteria": [
        "Bootstrap использует worker без ключей в argv, окружении или renderer",
        "Проверяется комплектный Git и выдаётся окружение Workflow Kit"
      ],
      "expected_commit_message": "feat: Подключить настройку туннеля и комплектный Git к Windows bootstrap"
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "windows-onboarding-033",
        "task_id": "W003",
        "role": "implementation"
      },
      "dependencies": [
        "W002"
      ],
      "functional_paths": [
        "src/startup-platform.mjs",
        "src/startup-readiness.mjs",
        "tests/startup-platform.test.mjs"
      ],
      "documentation_paths": [
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md",
        "docs/modules/first-run-onboarding.md"
      ],
      "verification_ids": [
        "suite"
      ],
      "id": "W003",
      "title": "Объединить первый запуск через платформенные адаптеры",
      "why": "Объединить первый запуск через платформенные адаптеры",
      "acceptance_criteria": [
        "Обе платформы используют общий coordinator",
        "Windows готовит комплект до проверки Git; macOS сохраняет прежний порядок",
        "Проверены отказ подготовки, повтор и восстановление готового подключения"
      ],
      "expected_commit_message": "feat: Объединить первый запуск через платформенные адаптеры"
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "windows-onboarding-033",
        "task_id": "W004",
        "role": "implementation"
      },
      "dependencies": [
        "W003"
      ],
      "functional_paths": [
        "src/main.mjs",
        "src/workspace-setup.mjs",
        "tests/workspace-setup.test.mjs"
      ],
      "documentation_paths": [
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md",
        "docs/modules/first-run-onboarding.md",
        "docs/WORKSPACE_SETUP.md"
      ],
      "verification_ids": [
        "suite"
      ],
      "id": "W004",
      "title": "Включить Windows мастер и окружение создания проектов",
      "why": "Включить Windows мастер и окружение создания проектов",
      "acceptance_criteria": [
        "Windows получает реальный startupFlow и clipboard",
        "Комплектный Git доступен readiness, созданию и recovery проекта",
        "macOS вызовы сохранены"
      ],
      "expected_commit_message": "feat: Включить Windows мастер и окружение создания проектов"
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "windows-onboarding-033",
        "task_id": "W005",
        "role": "implementation"
      },
      "dependencies": [
        "W004"
      ],
      "functional_paths": [
        "src/ui/startup.mjs",
        "src/ui/index.html",
        "tests/startup-ui.test.mjs"
      ],
      "documentation_paths": [
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md",
        "docs/modules/first-run-onboarding.md"
      ],
      "verification_ids": [
        "suite"
      ],
      "id": "W005",
      "title": "Адаптировать шаги и подписи Windows интерфейса",
      "why": "Адаптировать шаги и подписи Windows интерфейса",
      "acceptance_criteria": [
        "Windows не показывает Apple и Mac подсказки",
        "Мастер последовательно показывает подготовку, tunnel, Plugins и первый проект",
        "macOS интерфейс сохраняет существующее поведение"
      ],
      "expected_commit_message": "feat: Адаптировать шаги и подписи Windows интерфейса"
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "windows-onboarding-033",
        "task_id": "R001",
        "role": "implementation"
      },
      "dependencies": [
        "W005"
      ],
      "functional_paths": [
        "scripts/release-all.mjs",
        "package.json",
        "package-lock.json"
      ],
      "documentation_paths": [
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md",
        "docs/modules/first-run-onboarding.md",
        "docs/RELEASE.md"
      ],
      "verification_ids": [
        "suite"
      ],
      "id": "R001",
      "title": "Добавить единый выпуск macOS и Windows версии 0.6.41",
      "why": "Добавить единый выпуск macOS и Windows версии 0.6.41",
      "acceptance_criteria": [
        "Одна команда последовательно собирает обе платформы",
        "ZIP, версии, source и постоянный app сверяются до выдачи в Downloads"
      ],
      "expected_commit_message": "feat: Добавить единый выпуск macOS и Windows версии 0.6.41"
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "windows-onboarding-033",
        "task_id": "V001",
        "role": "implementation"
      },
      "dependencies": [
        "R001"
      ],
      "functional_paths": [
        "tests/electron-smoke.mjs",
        "tests/release-all.test.mjs",
        "scripts/verify-windows-package.mjs"
      ],
      "documentation_paths": [
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md",
        "docs/modules/first-run-onboarding.md",
        "docs/RELEASE.md"
      ],
      "verification_ids": [
        "suite",
        "electron-smoke"
      ],
      "id": "V001",
      "title": "Проверить Windows мастер и выпуск в изолированных сценариях",
      "why": "Проверить Windows мастер и выпуск в изолированных сценариях",
      "acceptance_criteria": [
        "Smoke проверяет обе платформы и Windows переходы",
        "Проверены неполная поставка и несогласованная версия",
        "Полный Node suite и Electron smoke пройдены"
      ],
      "expected_commit_message": "feat: Проверить Windows мастер и выпуск в изолированных сценариях"
    },
    {
      "id": "R003",
      "title": "Учесть нормализацию package.json упаковщиком",
      "why": "Packager штатно удаляет private, scripts и devDependencies; сравнивать итоговый runtime manifest с тем же представлением source",
      "dependencies": [
        "V001"
      ],
      "functional_paths": [
        "scripts/release-all.mjs",
        "tests/release-all.test.mjs"
      ],
      "documentation_paths": [
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md",
        "docs/RELEASE.md"
      ],
      "acceptance_criteria": [
        "Pruned package manifest принят, несогласованные runtime поля отклонены"
      ],
      "verification_ids": [
        "suite"
      ],
      "expected_commit_message": "fix: сверять runtime manifest после нормализации упаковщиком",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "windows-onboarding-033",
        "task_id": "R003",
        "role": "implementation"
      }
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "windows-onboarding-033",
        "task_id": "R002",
        "role": "implementation"
      },
      "dependencies": [
        "R003"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md",
        "docs/modules/first-run-onboarding.md",
        "docs/RELEASE.md",
        "docs/CLEAN_INSTALL.md",
        "docs/TRANSFER_TO_WINDOWS.md"
      ],
      "verification_ids": [],
      "id": "R002",
      "title": "Собрать и проверить обе поставки 0.6.41",
      "why": "Собрать и проверить обе поставки 0.6.41",
      "acceptance_criteria": [
        "npm run build успешно создаёт обе поставки одной версии",
        "Постоянный macOS app сохраняет identity",
        "Состав ZIP и source сверены; пользователь оставил запуск и проверки в Windows/macOS себе, Computer Use и VM не применяются"
      ],
      "expected_commit_message": "docs: Собрать и проверить обе поставки 0.6.41"
    },
    {
      "id": "C001",
      "title": "Разделить вставку ID и защищённый ввод ключа",
      "why": "Разделить вставку ID и защищённый ввод ключа",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "windows-onboarding-033",
        "task_id": "C001",
        "role": "implementation"
      },
      "dependencies": [
        "R002"
      ],
      "functional_paths": [
        "src/tunnel-clipboard.mjs",
        "src/main.mjs",
        "tests/tunnel-clipboard.test.mjs"
      ],
      "documentation_paths": [
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md",
        "docs/modules/first-run-onboarding.md"
      ],
      "verification_ids": [
        "suite"
      ],
      "acceptance_criteria": [
        "Разделить вставку ID и защищённый ввод ключа"
      ],
      "expected_commit_message": "fix: Разделить вставку ID и защищённый ввод ключа"
    },
    {
      "id": "C002",
      "title": "Показать отдельный шаг API key с явной ссылкой и инструкцией",
      "why": "Показать отдельный шаг API key с явной ссылкой и инструкцией",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "windows-onboarding-033",
        "task_id": "C002",
        "role": "implementation"
      },
      "dependencies": [
        "C001"
      ],
      "functional_paths": [
        "src/ui/index.html",
        "src/ui/startup.mjs",
        "tests/startup-ui.test.mjs"
      ],
      "documentation_paths": [
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md",
        "docs/modules/first-run-onboarding.md"
      ],
      "verification_ids": [
        "suite",
        "electron-smoke"
      ],
      "acceptance_criteria": [
        "Показать отдельный шаг API key с явной ссылкой и инструкцией"
      ],
      "expected_commit_message": "fix: Показать отдельный шаг API key с явной ссылкой и инструкцией"
    },
    {
      "id": "C003",
      "title": "Подготовить единый номер версии 0.6.42",
      "why": "Подготовить единый номер версии 0.6.42",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "windows-onboarding-033",
        "task_id": "C003",
        "role": "implementation"
      },
      "dependencies": [
        "C002"
      ],
      "functional_paths": [
        "package.json",
        "package-lock.json"
      ],
      "documentation_paths": [
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md",
        "docs/modules/first-run-onboarding.md",
        "docs/RELEASE.md"
      ],
      "verification_ids": [
        "suite"
      ],
      "acceptance_criteria": [
        "Подготовить единый номер версии 0.6.42"
      ],
      "expected_commit_message": "fix: Подготовить единый номер версии 0.6.42"
    },
    {
      "id": "C004",
      "title": "Собрать и сверить парный выпуск 0.6.42",
      "why": "Собрать и сверить парный выпуск 0.6.42",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "windows-onboarding-033",
        "task_id": "C004",
        "role": "implementation"
      },
      "dependencies": [
        "C003"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md",
        "docs/modules/first-run-onboarding.md",
        "docs/RELEASE.md"
      ],
      "verification_ids": [],
      "acceptance_criteria": [
        "Собрать и сверить парный выпуск 0.6.42"
      ],
      "expected_commit_message": "fix: Собрать и сверить парный выпуск 0.6.42"
    },
    {
      "id": "D001",
      "title": "Добавить отдельный нативный диалог ID без изменения служб",
      "why": "Добавить отдельный нативный диалог ID без изменения служб",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "windows-onboarding-033",
        "task_id": "D001",
        "role": "implementation"
      },
      "dependencies": [
        "C004"
      ],
      "functional_paths": [
        "resources/runtime-control/mac-first-run.py",
        "resources/runtime-control/windows-first-run.py",
        "tests/tunnel-id-prompt.test.mjs"
      ],
      "documentation_paths": [
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md",
        "docs/modules/first-run-onboarding.md"
      ],
      "verification_ids": [],
      "acceptance_criteria": [
        "Добавить отдельный нативный диалог ID без изменения служб"
      ],
      "expected_commit_message": "fix: Добавить отдельный нативный диалог ID без изменения служб"
    },
    {
      "id": "D002",
      "title": "Подключить безопасный диалог ID к обеим runtime facade",
      "why": "Подключить безопасный диалог ID к обеим runtime facade",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "windows-onboarding-033",
        "task_id": "D002",
        "role": "implementation"
      },
      "dependencies": [
        "D001"
      ],
      "functional_paths": [
        "src/mac-runtime.mjs",
        "src/windows-runtime.mjs",
        "tests/tunnel-id-runtime.test.mjs"
      ],
      "documentation_paths": [
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md",
        "docs/modules/first-run-onboarding.md"
      ],
      "verification_ids": [],
      "acceptance_criteria": [
        "Подключить безопасный диалог ID к обеим runtime facade"
      ],
      "expected_commit_message": "fix: Подключить безопасный диалог ID к обеим runtime facade"
    },
    {
      "id": "D003",
      "title": "Открывать диалог ID вместо чтения буфера по кнопке",
      "why": "Открывать диалог ID вместо чтения буфера по кнопке",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "windows-onboarding-033",
        "task_id": "D003",
        "role": "implementation"
      },
      "dependencies": [
        "D002"
      ],
      "functional_paths": [
        "src/tunnel-clipboard.mjs",
        "src/main.mjs",
        "tests/tunnel-clipboard.test.mjs"
      ],
      "documentation_paths": [
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md",
        "docs/modules/first-run-onboarding.md"
      ],
      "verification_ids": [],
      "acceptance_criteria": [
        "Открывать диалог ID вместо чтения буфера по кнопке"
      ],
      "expected_commit_message": "fix: Открывать диалог ID вместо чтения буфера по кнопке"
    },
    {
      "id": "D004",
      "title": "Проверить ручной путь ID и уточнить подсказки мастера",
      "why": "Проверить ручной путь ID и уточнить подсказки мастера",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "windows-onboarding-033",
        "task_id": "D004",
        "role": "implementation"
      },
      "dependencies": [
        "D003"
      ],
      "functional_paths": [
        "src/ui/index.html",
        "tests/startup-ui.test.mjs",
        "tests/electron-smoke.mjs"
      ],
      "documentation_paths": [
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md",
        "docs/modules/first-run-onboarding.md"
      ],
      "verification_ids": [
        "suite",
        "electron-smoke"
      ],
      "acceptance_criteria": [
        "Проверить ручной путь ID и уточнить подсказки мастера"
      ],
      "expected_commit_message": "fix: Проверить ручной путь ID и уточнить подсказки мастера"
    },
    {
      "id": "D005",
      "title": "Синхронизировать обе платформы на версии 0.6.43",
      "why": "Синхронизировать обе платформы на версии 0.6.43",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "windows-onboarding-033",
        "task_id": "D005",
        "role": "implementation"
      },
      "dependencies": [
        "D004"
      ],
      "functional_paths": [
        "package.json",
        "package-lock.json"
      ],
      "documentation_paths": [
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md",
        "docs/modules/first-run-onboarding.md",
        "docs/RELEASE.md"
      ],
      "verification_ids": [],
      "acceptance_criteria": [
        "Синхронизировать обе платформы на версии 0.6.43"
      ],
      "expected_commit_message": "fix: Синхронизировать обе платформы на версии 0.6.43"
    },
    {
      "id": "D006",
      "title": "Выпустить и сверить оба архива 0.6.43",
      "why": "Выпустить и сверить оба архива 0.6.43",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "windows-onboarding-033",
        "task_id": "D006",
        "role": "implementation"
      },
      "dependencies": [
        "D005"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md",
        "docs/modules/first-run-onboarding.md",
        "docs/RELEASE.md"
      ],
      "verification_ids": [],
      "acceptance_criteria": [
        "Выпустить и сверить оба архива 0.6.43"
      ],
      "expected_commit_message": "fix: Выпустить и сверить оба архива 0.6.43"
    },
    {
      "id": "E001",
      "title": "Убрать атрибуты автора из подготовки проекта и настроить служебную историю",
      "why": "Убрать атрибуты автора из подготовки проекта и настроить служебную историю",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "windows-onboarding-033",
        "task_id": "E001",
        "role": "implementation"
      },
      "dependencies": [
        "D006"
      ],
      "functional_paths": [
        "src/workspace-setup.mjs",
        "resources/workspace-setup-worker.mjs",
        "tests/workspace-setup.test.mjs"
      ],
      "documentation_paths": [
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md",
        "docs/WORKSPACE_SETUP.md"
      ],
      "verification_ids": [],
      "acceptance_criteria": [
        "Убрать атрибуты автора из подготовки проекта и настроить служебную историю"
      ],
      "expected_commit_message": "feat: Убрать атрибуты автора из подготовки проекта и настроить служебную историю"
    },
    {
      "id": "E002",
      "title": "Убрать имя и email из IPC создания проекта",
      "why": "Убрать имя и email из IPC создания проекта",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "windows-onboarding-033",
        "task_id": "E002",
        "role": "implementation"
      },
      "dependencies": [
        "E001"
      ],
      "functional_paths": [
        "src/main.mjs",
        "src/preload.cjs",
        "tests/electron-smoke.mjs"
      ],
      "documentation_paths": [
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md",
        "docs/WORKSPACE_SETUP.md"
      ],
      "verification_ids": [],
      "acceptance_criteria": [
        "Убрать имя и email из IPC создания проекта"
      ],
      "expected_commit_message": "feat: Убрать имя и email из IPC создания проекта"
    },
    {
      "id": "E003",
      "title": "Удалить поля автора и ограничение создания проекта",
      "why": "Удалить поля автора и ограничение создания проекта",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "windows-onboarding-033",
        "task_id": "E003",
        "role": "implementation"
      },
      "dependencies": [
        "E002"
      ],
      "functional_paths": [
        "src/ui/index.html",
        "src/ui/workspace-setup.mjs",
        "tests/project-doctor-ui.test.mjs"
      ],
      "documentation_paths": [
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md",
        "docs/WORKSPACE_SETUP.md"
      ],
      "verification_ids": [
        "suite",
        "electron-smoke"
      ],
      "acceptance_criteria": [
        "Удалить поля автора и ограничение создания проекта"
      ],
      "expected_commit_message": "feat: Удалить поля автора и ограничение создания проекта"
    },
    {
      "id": "E004",
      "title": "Подготовить 0.6.44 без персонального автора пакета",
      "why": "Подготовить 0.6.44 без персонального автора пакета",
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "windows-onboarding-033",
        "task_id": "E004",
        "role": "implementation"
      },
      "dependencies": [
        "E003"
      ],
      "functional_paths": [
        "package.json",
        "package-lock.json"
      ],
      "documentation_paths": [
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md",
        "docs/WORKSPACE_SETUP.md",
        "docs/RELEASE.md",
        "docs/DECISIONS.md"
      ],
      "verification_ids": [],
      "acceptance_criteria": [
        "Подготовить 0.6.44 без персонального автора пакета"
      ],
      "expected_commit_message": "feat: Подготовить 0.6.44 без персонального автора пакета"
    },
    {
      "id": "E005",
      "title": "Собрать и сверить парный релиз 0.6.44",
      "why": "Собрать и сверить парный релиз 0.6.44",
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "windows-onboarding-033",
        "task_id": "E005",
        "role": "implementation"
      },
      "dependencies": [
        "E004"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md",
        "docs/WORKSPACE_SETUP.md",
        "docs/RELEASE.md",
        "docs/DECISIONS.md"
      ],
      "verification_ids": [],
      "acceptance_criteria": [
        "Собрать и сверить парный релиз 0.6.44"
      ],
      "expected_commit_message": "feat: Собрать и сверить парный релиз 0.6.44"
    },
    {
      "id": "E006",
      "title": "Подготовить публикацию GitHub после финального DOCS commit",
      "why": "Подготовить публикацию GitHub после финального DOCS commit",
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "windows-onboarding-033",
        "task_id": "E006",
        "role": "implementation"
      },
      "dependencies": [
        "E005"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md",
        "docs/WORKSPACE_SETUP.md",
        "docs/RELEASE.md",
        "docs/DECISIONS.md"
      ],
      "verification_ids": [],
      "acceptance_criteria": [
        "Подготовить публикацию GitHub после финального DOCS commit"
      ],
      "expected_commit_message": "feat: Подготовить публикацию GitHub после финального DOCS commit"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "windows-onboarding-033",
        "task_id": "DOCS",
        "role": "implementation",
        "iteration": 4
      },
      "dependencies": [
        "P001",
        "W001",
        "W002",
        "W003",
        "W004",
        "W005",
        "R001",
        "V001",
        "R003",
        "R002",
        "C001",
        "C002",
        "C003",
        "C004",
        "D001",
        "D002",
        "D003",
        "D004",
        "D005",
        "D006",
        "E001",
        "E002",
        "E003",
        "E004",
        "E005",
        "E006"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "AGENTS.md",
        "README.md",
        "docs/WORKFLOW_START.md",
        "docs/PRODUCT.md",
        "docs/DECISIONS.md",
        "docs/architecture/OVERVIEW.md",
        "docs/MODULES.md",
        "docs/DOCUMENTATION_INDEX.md",
        "docs/CLEAN_INSTALL.md",
        "docs/TRANSFER_TO_WINDOWS.md",
        "docs/RELEASE.md",
        "docs/WORKSPACE_SETUP.md",
        "docs/CONTEXT_DELIVERY.md",
        "docs/modules/runtime-lifecycle.md",
        "docs/modules/workspace-sessions.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md",
        "docs/modules/first-run-onboarding.md"
      ],
      "verification_ids": [],
      "id": "DOCS",
      "title": "Актуализация всех документов проекта",
      "why": "Согласовать текущий выпуск и передачу пользовательской проверки во всём комплекте",
      "acceptance_criteria": [
        "Документы по индексу актуализированы, подтверждения отделены от ещё не выполненной приёмки Windows",
        "План сохраняется в собственной сессии; 031 и 032 не изменяются"
      ],
      "expected_commit_message": "docs: актуализировать выпуск 0.6.43 с системным вводом ID"
    }
  ],
  "blocked_reason": null,
  "user_decisions": [
    {
      "id": "68c54bb2-473e-43c5-af70-3f7f761cb0d1",
      "text": "18.09.2026 пользователь прямо поручил догнать Windows по первому запуску, аккуратно встроить всё необходимое и пакетно выпустить Mac и Windows с единым новым номером.",
      "recorded_at": "2026-09-18T15:10:54.734Z"
    },
    {
      "id": "tunnel-key-steps-042",
      "text": "19.09.2026 пользователь поручил исправить обе платформы: отдельный последовательный шаг API key с кнопкой страницы и инструкцией; собрать новый парный релиз. Все реальные проверки выполняет пользователь; VM и Computer Use запрещены.",
      "recorded_at": "2026-09-19T07:00:00.000Z"
    },
    {
      "id": "native-id-dialog-043",
      "text": "19.09.2026 пользователь сообщил, что кнопка ID вместо ожидаемого окна показывает ошибку, и передал скриншот 08.36.22. Исправление продолжает авторизованный парный выпуск; VM и Computer Use запрещены.",
      "recorded_at": "2026-09-19T06:38:20.057576+00:00"
    },
    {
      "id": "no-author-release-044",
      "text": "19.09.2026 пользователь подтвердил полный успешный проход, поручил удалить атрибуты автора/email, собрать новый релиз, актуализировать все документы и README и залить локальный релиз на GitHub. Авторизованы обычный push main и GitHub Release с обоими ZIP в существующий origin. Публикация выполняется после последнего DOCS commit и проверяется до итогового ответа.",
      "recorded_at": "2026-09-19T07:08:54.705466+00:00"
    }
  ],
  "owner_session_id": "01a0b501-9a29-7b30-87a1-036ded275092",
  "prepared_in_session_id": null
}
```
<!-- workflow-state:end -->

## Состояние

Execution Scope Status: ACTIVE
Delivery Status: IN_PROGRESS
Scope: windows-onboarding-033
Current Task: нет
Revision: 61

## Цель

Зафиксировать пользовательский полный проход 0.6.43, убрать атрибуты автора/email из создания проекта и приложения, выпустить 0.6.44 для Mac/Windows и опубликовать исходники и бинарный релиз на GitHub.

## Критерии приёмки

- Windows показывает и выполняет шаги компонентов, туннеля и создания проекта после входа
- Данные подключения проходят существующее защищённое хранилище Windows; настройки сохраняются
- macOS сохраняет рабочее поведение, обе платформы выпущены как 0.6.41
- Source, tests, packaged fixtures и состав ZIP проверены; реальное подключение и приёмка в госте отдельно подтверждаются пользователем
- В Mac и Windows ID туннеля и API key оформлены двумя последовательными шагами; ссылка API keys и инструкция создания/копирования/вставки видимы без раскрытия подсказок
- Ручной путь не открывает два диалога подряд; перед вводом ключа показана инструкция
- Один парный выпуск 0.6.42 в Downloads, постоянный Mac app обновлён с сохранением identity; VM и Computer Use не используются
- Кнопка вставки ID всегда открывает отдельное системное поле на Mac и Windows; пустой/несвязанный буфер не вызывает ошибку до ввода
- Отмена не меняет настройки; подтверждённый ID ведёт к инструкции API key без второго немедленного диалога
- Обе платформы выпущены как 0.6.43; пользователь сам проверяет VM
- Создание проекта не запрашивает и не передаёт имя/email; служебная Git история создаётся при отсутствии пользовательской настройки без изменения глобального Git
- Новый парный релиз 0.6.44, README и документация актуальны; GitHub main и release с обоими ZIP опубликованы и проверены после финального DOCS commit

## Микрозадачи

- [DONE] P001: Уточнить контракт Windows первого запуска и парного релиза — Завершено
  - Git Commit: [DONE] docs: Уточнить контракт Windows первого запуска и парного релиза
  - Reference: windows-onboarding-033 / P001 / implementation
  - Файлы: docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md, docs/modules/first-run-onboarding.md, docs/DECISIONS.md, docs/modules/runtime-lifecycle.md, docs/RELEASE.md, docs/CLEAN_INSTALL.md
- [DONE] W001: Добавить нативный защищённый ввод подключения Windows — Завершено
  - Git Commit: [DONE] feat: Добавить нативный защищённый ввод подключения Windows
  - Reference: windows-onboarding-033 / W001 / implementation
  - Файлы: resources/runtime-control/windows-first-run.py, tests/windows-first-run.test.mjs, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md, docs/modules/first-run-onboarding.md
- [DONE] W002: Подключить настройку туннеля и комплектный Git к Windows bootstrap — Завершено
  - Git Commit: [DONE] feat: Подключить настройку туннеля и комплектный Git к Windows bootstrap
  - Reference: windows-onboarding-033 / W002 / implementation
  - Файлы: src/windows-runtime.mjs, tests/windows-runtime.test.mjs, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md, docs/modules/first-run-onboarding.md, docs/modules/runtime-lifecycle.md
- [DONE] W003: Объединить первый запуск через платформенные адаптеры — Завершено
  - Git Commit: [DONE] feat: Объединить первый запуск через платформенные адаптеры
  - Reference: windows-onboarding-033 / W003 / implementation
  - Файлы: src/startup-platform.mjs, src/startup-readiness.mjs, tests/startup-platform.test.mjs, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md, docs/modules/first-run-onboarding.md
- [DONE] W004: Включить Windows мастер и окружение создания проектов — Завершено
  - Git Commit: [DONE] feat: Включить Windows мастер и окружение создания проектов
  - Reference: windows-onboarding-033 / W004 / implementation
  - Файлы: src/main.mjs, src/workspace-setup.mjs, tests/workspace-setup.test.mjs, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md, docs/modules/first-run-onboarding.md, docs/WORKSPACE_SETUP.md
- [DONE] W005: Адаптировать шаги и подписи Windows интерфейса — Завершено
  - Git Commit: [DONE] feat: Адаптировать шаги и подписи Windows интерфейса
  - Reference: windows-onboarding-033 / W005 / implementation
  - Файлы: src/ui/startup.mjs, src/ui/index.html, tests/startup-ui.test.mjs, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md, docs/modules/first-run-onboarding.md
- [DONE] R001: Добавить единый выпуск macOS и Windows версии 0.6.41 — Завершено
  - Git Commit: [DONE] feat: Добавить единый выпуск macOS и Windows версии 0.6.41
  - Reference: windows-onboarding-033 / R001 / implementation
  - Файлы: scripts/release-all.mjs, package.json, package-lock.json, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md, docs/modules/first-run-onboarding.md, docs/RELEASE.md
- [DONE] V001: Проверить Windows мастер и выпуск в изолированных сценариях — Завершено
  - Git Commit: [DONE] feat: Проверить Windows мастер и выпуск в изолированных сценариях
  - Reference: windows-onboarding-033 / V001 / implementation
  - Файлы: tests/electron-smoke.mjs, tests/release-all.test.mjs, scripts/verify-windows-package.mjs, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md, docs/modules/first-run-onboarding.md, docs/RELEASE.md
- [DONE] R003: Учесть нормализацию package.json упаковщиком — Завершено
  - Git Commit: [DONE] fix: сверять runtime manifest после нормализации упаковщиком
  - Reference: windows-onboarding-033 / R003 / implementation
  - Файлы: scripts/release-all.mjs, tests/release-all.test.mjs, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md, docs/RELEASE.md
- [DONE] R002: Собрать и проверить обе поставки 0.6.41 — Завершено
  - Git Commit: [DONE] docs: Собрать и проверить обе поставки 0.6.41
  - Reference: windows-onboarding-033 / R002 / implementation
  - Файлы: docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md, docs/modules/first-run-onboarding.md, docs/RELEASE.md, docs/CLEAN_INSTALL.md, docs/TRANSFER_TO_WINDOWS.md
- [DONE] C001: Разделить вставку ID и защищённый ввод ключа — Завершено
  - Git Commit: [DONE] fix: Разделить вставку ID и защищённый ввод ключа
  - Reference: windows-onboarding-033 / C001 / implementation
  - Файлы: src/tunnel-clipboard.mjs, src/main.mjs, tests/tunnel-clipboard.test.mjs, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md, docs/modules/first-run-onboarding.md
- [DONE] C002: Показать отдельный шаг API key с явной ссылкой и инструкцией — Завершено
  - Git Commit: [DONE] fix: Показать отдельный шаг API key с явной ссылкой и инструкцией
  - Reference: windows-onboarding-033 / C002 / implementation
  - Файлы: src/ui/index.html, src/ui/startup.mjs, tests/startup-ui.test.mjs, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md, docs/modules/first-run-onboarding.md
- [DONE] C003: Подготовить единый номер версии 0.6.42 — Завершено
  - Git Commit: [DONE] fix: Подготовить единый номер версии 0.6.42
  - Reference: windows-onboarding-033 / C003 / implementation
  - Файлы: package.json, package-lock.json, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md, docs/modules/first-run-onboarding.md, docs/RELEASE.md
- [DONE] C004: Собрать и сверить парный выпуск 0.6.42 — Завершено
  - Git Commit: [DONE] fix: Собрать и сверить парный выпуск 0.6.42
  - Reference: windows-onboarding-033 / C004 / implementation
  - Файлы: docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md, docs/modules/first-run-onboarding.md, docs/RELEASE.md
- [DONE] D001: Добавить отдельный нативный диалог ID без изменения служб — Завершено
  - Git Commit: [DONE] fix: Добавить отдельный нативный диалог ID без изменения служб
  - Reference: windows-onboarding-033 / D001 / implementation
  - Файлы: resources/runtime-control/mac-first-run.py, resources/runtime-control/windows-first-run.py, tests/tunnel-id-prompt.test.mjs, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md, docs/modules/first-run-onboarding.md
- [DONE] D002: Подключить безопасный диалог ID к обеим runtime facade — Завершено
  - Git Commit: [DONE] fix: Подключить безопасный диалог ID к обеим runtime facade
  - Reference: windows-onboarding-033 / D002 / implementation
  - Файлы: src/mac-runtime.mjs, src/windows-runtime.mjs, tests/tunnel-id-runtime.test.mjs, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md, docs/modules/first-run-onboarding.md
- [DONE] D003: Открывать диалог ID вместо чтения буфера по кнопке — Завершено
  - Git Commit: [DONE] fix: Открывать диалог ID вместо чтения буфера по кнопке
  - Reference: windows-onboarding-033 / D003 / implementation
  - Файлы: src/tunnel-clipboard.mjs, src/main.mjs, tests/tunnel-clipboard.test.mjs, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md, docs/modules/first-run-onboarding.md
- [DONE] D004: Проверить ручной путь ID и уточнить подсказки мастера — Завершено
  - Git Commit: [DONE] fix: Проверить ручной путь ID и уточнить подсказки мастера
  - Reference: windows-onboarding-033 / D004 / implementation
  - Файлы: src/ui/index.html, tests/startup-ui.test.mjs, tests/electron-smoke.mjs, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md, docs/modules/first-run-onboarding.md
- [DONE] D005: Синхронизировать обе платформы на версии 0.6.43 — Завершено
  - Git Commit: [DONE] fix: Синхронизировать обе платформы на версии 0.6.43
  - Reference: windows-onboarding-033 / D005 / implementation
  - Файлы: package.json, package-lock.json, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md, docs/modules/first-run-onboarding.md, docs/RELEASE.md
- [DONE] D006: Выпустить и сверить оба архива 0.6.43 — Завершено
  - Git Commit: [DONE] fix: Выпустить и сверить оба архива 0.6.43
  - Reference: windows-onboarding-033 / D006 / implementation
  - Файлы: docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md, docs/modules/first-run-onboarding.md, docs/RELEASE.md
- [DONE] E001: Убрать атрибуты автора из подготовки проекта и настроить служебную историю — Завершено
  - Git Commit: [DONE] feat: Убрать атрибуты автора из подготовки проекта и настроить служебную историю
  - Reference: windows-onboarding-033 / E001 / implementation
  - Файлы: src/workspace-setup.mjs, resources/workspace-setup-worker.mjs, tests/workspace-setup.test.mjs, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md, docs/WORKSPACE_SETUP.md
- [DONE] E002: Убрать имя и email из IPC создания проекта — Завершено
  - Git Commit: [DONE] feat: Убрать имя и email из IPC создания проекта
  - Reference: windows-onboarding-033 / E002 / implementation
  - Файлы: src/main.mjs, src/preload.cjs, tests/electron-smoke.mjs, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md, docs/WORKSPACE_SETUP.md
- [DONE] E003: Удалить поля автора и ограничение создания проекта — Завершено
  - Git Commit: [DONE] feat: Удалить поля автора и ограничение создания проекта
  - Reference: windows-onboarding-033 / E003 / implementation
  - Файлы: src/ui/index.html, src/ui/workspace-setup.mjs, tests/project-doctor-ui.test.mjs, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md, docs/WORKSPACE_SETUP.md
- [TODO] E004: Подготовить 0.6.44 без персонального автора пакета — Ожидает
  - Git Commit: [PENDING] feat: Подготовить 0.6.44 без персонального автора пакета
  - Reference: windows-onboarding-033 / E004 / implementation
  - Файлы: package.json, package-lock.json, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md, docs/WORKSPACE_SETUP.md, docs/RELEASE.md, docs/DECISIONS.md
- [TODO] E005: Собрать и сверить парный релиз 0.6.44 — Ожидает
  - Git Commit: [PENDING] feat: Собрать и сверить парный релиз 0.6.44
  - Reference: windows-onboarding-033 / E005 / implementation
  - Файлы: docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md, docs/WORKSPACE_SETUP.md, docs/RELEASE.md, docs/DECISIONS.md
- [TODO] E006: Подготовить публикацию GitHub после финального DOCS commit — Ожидает
  - Git Commit: [PENDING] feat: Подготовить публикацию GitHub после финального DOCS commit
  - Reference: windows-onboarding-033 / E006 / implementation
  - Файлы: docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md, docs/WORKSPACE_SETUP.md, docs/RELEASE.md, docs/DECISIONS.md
- [TODO] DOCS: Актуализация всех документов проекта — Ожидает
  - Git Commit: [PENDING] docs: актуализировать выпуск 0.6.43 с системным вводом ID
  - Reference: windows-onboarding-033 / DOCS / implementation
  - Файлы: AGENTS.md, README.md, docs/WORKFLOW_START.md, docs/PRODUCT.md, docs/DECISIONS.md, docs/architecture/OVERVIEW.md, docs/MODULES.md, docs/DOCUMENTATION_INDEX.md, docs/CLEAN_INSTALL.md, docs/TRANSFER_TO_WINDOWS.md, docs/RELEASE.md, docs/WORKSPACE_SETUP.md, docs/CONTEXT_DELIVERY.md, docs/modules/runtime-lifecycle.md, docs/modules/workspace-sessions.md, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md, docs/modules/first-run-onboarding.md

## Context Pack For This Cycle

- docs/architecture/OVERVIEW.md → Краткая архитектура проекта
- docs/MODULES.md → Модули проекта
- docs/DOCUMENTATION_INDEX.md → Каталог документации
- docs/modules/first-run-onboarding.md → Первый запуск Web Pilot на чистой системе

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
