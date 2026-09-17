# Активный план — Project Web Pilot

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 15,
  "project_id": "cf944136-d1fc-4bd5-9ea0-e46d1fe230e7",
  "project_name": "Project Web Pilot",
  "scope_id": "first-run-onboarding-031",
  "execution_scope_status": "ACTIVE",
  "delivery_status": "IN_PROGRESS",
  "objective": "Довести первый запуск Web Pilot на чистых macOS и Windows от установки до начала работы: приложение само подготавливает компоненты и понятно сопровождает каждое необходимое действие пользователя. Исправлять, пересобирать и повторять проверки на свежих клонах, пока весь путь полностью не устроит пользователя.",
  "acceptance_criteria": [
    "На свежем клоне пользователь проходит от готового пакета до первого проекта и реального действия агента с тестовым файлом по подсказкам самого приложения.",
    "Технические компоненты готовятся автоматически; пользователь не выполняет команды, не устанавливает инструменты разработчика вручную и не должен понимать MCP, порты или runtime.",
    "Неизбежные личные действия, внешние входы, разрешения и получение данных подключения объяснены на нужном шаге и проверяются после выполнения.",
    "Ошибки, ожидание, повтор и перезапуск имеют понятное поведение, сохранение прогресса и настроек.",
    "Исправление → проверки → сборка → новый клон → повтор образуют неограниченный цикл внутри этого плана; завершение определяется полным пользовательским результатом.",
    "macOS и Windows ARM64 с x64-эмуляцией проверены отдельно; нативная Windows x64 имеет честно указанный статус.",
    "Base сохраняется; основной Mac, рабочие runtime и профили не используются как скрытые предварительные условия.",
    "Каждая микрозадача имеет отдельный проверенный commit; единственная последняя DOCS актуализирует документацию; пользователь подтверждает пригодность полного пути."
  ],
  "approved_scope": {
    "documentation_paths": [
      "docs/modules/first-run-onboarding.md",
      "docs/CLEAN_INSTALL.md",
      "docs/VERIFICATION.md",
      "docs/PRODUCT.md",
      "docs/DECISIONS.md",
      "docs/architecture/ARCHITECTURE.md",
      "docs/RELEASE.md",
      "docs/modules/runtime-lifecycle.md",
      "docs/WORKSPACE_SETUP.md",
      "docs/modules/workspace-sessions.md",
      "docs/CONTEXT_DELIVERY.md",
      "docs/TRANSFER_TO_WINDOWS.md",
      "README.md",
      "docs/WORKFLOW_START.md",
      "docs/architecture/OVERVIEW.md",
      "docs/MODULES.md",
      "docs/DOCUMENTATION_INDEX.md"
    ],
    "functional_paths": [
      "scripts/prepare-mac-toolchain.mjs",
      "src/platform.mjs",
      "tests/mac-runtime.test.mjs",
      "src/mac-runtime.mjs",
      "src/workspace-setup.mjs",
      "tests/workspace-setup.test.mjs",
      "src/main.mjs",
      "src/preload.cjs",
      "src/ui/workspace-setup.mjs",
      "src/mcp-runtime.mjs",
      "src/ui/index.html",
      "src/ui/progress.mjs",
      "package.json",
      "package-lock.json",
      "scripts/release-mac.mjs",
      "src/windows-runtime.mjs",
      "tests/windows-runtime.test.mjs",
      "scripts/verify-windows-package.mjs",
      "src/startup-readiness.mjs",
      "tests/startup-readiness.test.mjs",
      "tests/mac-toolchain.test.mjs",
      "src/ui/startup.mjs",
      "src/ui/sidebar.mjs",
      "resources/runtime-control/mac-first-run.py",
      "tests/mac-first-run.test.mjs",
      "tests/startup-ui.test.mjs",
      "tests/sidebar.test.mjs",
      "tests/electron-smoke.mjs"
    ],
    "max_functional_files_per_task": 3
  },
  "baseline_commit": "df9eea387ff08f76b707e055fbefa83f4175e8ae",
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
        "heading_path": [
          "Первый запуск Web Pilot на чистой системе"
        ],
        "path": "docs/modules/first-run-onboarding.md",
        "required": true,
        "revision": "WORKTREE"
      },
      {
        "heading_path": [
          "Module Specification — Runtime Lifecycle"
        ],
        "path": "docs/modules/runtime-lifecycle.md",
        "required": true,
        "revision": "WORKTREE"
      },
      {
        "heading_path": [
          "Создание и подключение workspace"
        ],
        "path": "docs/WORKSPACE_SETUP.md",
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
        "scope_id": "first-run-onboarding-031",
        "task_id": "T001",
        "role": "implementation"
      },
      "dependencies": [],
      "functional_paths": [],
      "documentation_paths": [
        "docs/modules/first-run-onboarding.md",
        "docs/CLEAN_INSTALL.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [],
      "acceptance_criteria": [
        "Записаны подтверждённые имена Base/Test, выбранная завершённая поставка с SHA-256 и её происхождение.",
        "Неподтверждённые версия/чистота гостя явно отмечены и сохранены обязательными проверками T009; они не выдаются за результат и не блокируют исправление установленного аудитом дефекта.",
        "Base не используется для испытаний; файлы и проекты гостя не подменяются рабочими профилями основного Mac."
      ],
      "expected_commit_message": "docs: record clean first-run baseline",
      "id": "T001",
      "title": "Зафиксировать исходную поставку и известные границы стенда",
      "why": "Зафиксировать воспроизводимую исходную точку без скрытых зависимостей разработчика."
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "first-run-onboarding-031",
        "task_id": "T002",
        "role": "implementation"
      },
      "dependencies": [
        "T001"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/modules/first-run-onboarding.md",
        "docs/CLEAN_INSTALL.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [],
      "acceptance_criteria": [
        "Пользователь выполняет обычную установку/распаковку и запуск в WebPilot-Test-macOS 01; записан каждый шаг до первой преграды либо начала работы.",
        "Для каждого затруднения сохранены ожидание, фактический результат, несекретное сообщение/скриншот, потребовавшаяся помощь и воспроизводимость.",
        "Недостающие зависимости не устанавливаются вручную для сокрытия проблемы. Успех основного Mac не считается результатом гостя.",
        "Подтверждённые проблемы получают конкретные задачи исправления, сборки и повторной проверки в этом плане."
      ],
      "expected_commit_message": "docs: record initial macOS first-run findings",
      "id": "T002",
      "title": "Пройти первый запуск macOS и зафиксировать затруднения пользователя",
      "why": "Получить факты установки и запуска готового приложения обычным пользователем."
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "first-run-onboarding-031",
        "task_id": "T003",
        "role": "implementation"
      },
      "dependencies": [
        "T002"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/modules/first-run-onboarding.md",
        "docs/CLEAN_INSTALL.md",
        "docs/PRODUCT.md",
        "docs/DECISIONS.md"
      ],
      "verification_ids": [],
      "acceptance_criteria": [
        "Зафиксированы шаги от установки до первого проекта: автоматические операции, личные действия, ожидание, ошибки и повтор.",
        "Проверены существующие решения в проекте; при необходимости внешнего компонента изучены проверенные открытые решения и официальные источники.",
        "Для первого исправления указаны facade, входы/выходы, точные файлы и проверки; широкие изменения разбиты до трёх функциональных файлов на задачу.",
        "Мастер сопровождает и получение данных внешнего подключения, а не только предлагает необъяснённое поле ключа."
      ],
      "expected_commit_message": "docs: define guided first-run steps",
      "id": "T003",
      "title": "Уточнить последовательность первого запуска по наблюдениям",
      "why": "Сделать пользовательский путь понятным и реализовать его существующими средствами."
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "first-run-onboarding-031",
        "task_id": "T004",
        "role": "implementation"
      },
      "dependencies": [
        "T003"
      ],
      "functional_paths": [
        "scripts/prepare-mac-toolchain.mjs",
        "src/platform.mjs",
        "tests/mac-toolchain.test.mjs"
      ],
      "documentation_paths": [
        "docs/modules/first-run-onboarding.md",
        "docs/CLEAN_INSTALL.md",
        "docs/VERIFICATION.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/RELEASE.md",
        "docs/modules/runtime-lifecycle.md"
      ],
      "verification_ids": [
        "suite"
      ],
      "acceptance_criteria": [
        "Официальный Node.js 22.17.0 arm64 включён в mac-tools с проверенным SHA-256 и лицензией; используется существующий packaging extra-resource.",
        "Выбор bundled Node не зависит от Homebrew пользователя; его подключение к WorkspaceSetup выполняется F001. Git проверяется и устанавливается штатным механизмом Apple в T005/F001."
      ],
      "expected_commit_message": "fix: prepare dependencies for clean macOS",
      "id": "T004",
      "title": "Обеспечить доступность компонентов для чистой macOS",
      "why": "Устранить зависимость готовой поставки от инструментов компьютера разработчика."
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "first-run-onboarding-031",
        "task_id": "T005",
        "role": "implementation"
      },
      "dependencies": [
        "T004"
      ],
      "functional_paths": [
        "src/startup-readiness.mjs",
        "tests/startup-readiness.test.mjs"
      ],
      "documentation_paths": [
        "docs/modules/first-run-onboarding.md",
        "docs/CLEAN_INSTALL.md",
        "docs/VERIFICATION.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/WORKSPACE_SETUP.md",
        "docs/modules/runtime-lifecycle.md"
      ],
      "verification_ids": [
        "suite"
      ],
      "acceptance_criteria": [
        "Узкий facade проверяет Node и Git без вызова установочных диалогов при чтении, повторяет проверки после явного действия пользователя.",
        "Установка Git запускается штатным диалогом Apple по кнопке с объяснением; существующая подготовка Python/MCP вызывается через переданный facade с понятным прогрессом и ошибкой.",
        "Загрузка сайта, вход, локальные компоненты и tunnel имеют отдельные состояния; ошибка/повтор/закрытие не принимают старые результаты за готовность."
      ],
      "expected_commit_message": "fix: bootstrap first workspace on clean macOS",
      "id": "T005",
      "title": "Реализовать проверку и последовательную подготовку чистого окружения",
      "why": "Соединить доступные компоненты с реальной подготовкой чистого пользовательского окружения."
    },
    {
      "id": "F001",
      "title": "Проверять готовность чистой системы перед началом работы",
      "why": "Первый запуск не должен предполагать прежний вход в ChatGPT или наличие компонентов, локальной службы и туннеля.",
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "first-run-onboarding-031",
        "task_id": "F001",
        "role": "implementation"
      },
      "dependencies": [
        "T005"
      ],
      "functional_paths": [
        "src/main.mjs",
        "src/preload.cjs",
        "src/ui/progress.mjs"
      ],
      "documentation_paths": [
        "docs/modules/first-run-onboarding.md",
        "docs/CLEAN_INSTALL.md",
        "docs/VERIFICATION.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/modules/runtime-lifecycle.md"
      ],
      "verification_ids": [
        "suite",
        "electron-smoke"
      ],
      "acceptance_criteria": [
        "При запуске проверяются нужные локальные компоненты, состояние MCP и туннеля; вход в ChatGPT и подключение инструментов проверяются отдельными состояниями.",
        "Каждое отсутствующее условие переводит приложение в понятный шаг подготовки, входа или настройки с проверяемым результатом; отсутствие прежнего профиля является нормальным первым запуском.",
        "Затяжная загрузка сайта, отсутствие сети, неготовый компонент и требуемое личное действие не объединяются одним индикатором; доступны понятные действия и повтор.",
        "Приложение ChatGPT отдельно не устанавливается; пользователь проходит штатный вход или создание аккаунта во встроенной веб-версии.",
        "Успехи чужого runtime, старого профиля или только локальной службы не разрешают объявлять полный путь готовым; повтор и перезапуск сохраняют безопасное состояние."
      ],
      "expected_commit_message": "feat: check first-run readiness on startup"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "first-run-onboarding-031",
        "task_id": "T006",
        "role": "implementation"
      },
      "dependencies": [
        "T005",
        "F001"
      ],
      "functional_paths": [
        "src/ui/startup.mjs",
        "src/ui/index.html",
        "src/ui/sidebar.mjs"
      ],
      "documentation_paths": [
        "docs/modules/first-run-onboarding.md",
        "docs/CLEAN_INSTALL.md",
        "docs/VERIFICATION.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/PRODUCT.md",
        "docs/modules/workspace-sessions.md",
        "docs/WORKSPACE_SETUP.md"
      ],
      "verification_ids": [
        "suite",
        "electron-smoke"
      ],
      "acceptance_criteria": [
        "Один последовательный путь ведёт от первого окна к готовому проекту; технические действия выполняются автоматически.",
        "Для ожидания, действия пользователя, успеха и ошибки показаны понятные тексты и подходящая кнопка; нет технических тупиков.",
        "Состояния UI основаны на фактической готовности; после возврата/перезапуска путь продолжается.",
        "Новые узкие файлы и необходимые UI/regression tests добавляются отдельными микрозадачами до изменения."
      ],
      "expected_commit_message": "feat: guide users through first startup",
      "id": "T006",
      "title": "Встроить понятное сопровождение первого запуска",
      "why": "Пользователь должен понимать и выполнять следующий шаг из самого приложения."
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "first-run-onboarding-031",
        "task_id": "T007",
        "role": "implementation"
      },
      "dependencies": [
        "T006"
      ],
      "functional_paths": [
        "resources/runtime-control/mac-first-run.py",
        "src/mac-runtime.mjs",
        "tests/mac-first-run.test.mjs"
      ],
      "documentation_paths": [
        "docs/modules/first-run-onboarding.md",
        "docs/CLEAN_INSTALL.md",
        "docs/VERIFICATION.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/modules/runtime-lifecycle.md",
        "docs/CONTEXT_DELIVERY.md",
        "docs/PRODUCT.md"
      ],
      "verification_ids": [
        "suite",
        "electron-smoke"
      ],
      "acceptance_criteria": [
        "macOS получает нативный последовательный ввод tunnel_id и ключа по кнопке; ключ обрабатывается только дочерним локальным worker и private runtime store, не попадает в renderer/argv/диагностику.",
        "Инструкция мастера объясняет создание туннеля/ключа, связывание ChatGPT workspace и подключение плагина с официальными ссылками; личные действия выполняет пользователь.",
        "Отмена не меняет конфигурацию; после настройки выполняется реальная проверка служб; успешный локальный статус не выдаётся за выполненное агентом действие с файлом."
      ],
      "expected_commit_message": "feat: guide initial connection setup",
      "id": "T007",
      "title": "Сопроводить вход и первичную настройку подключения",
      "why": "Устранить необходимость самостоятельно разбираться с аккаунтом, туннелем и разрешениями."
    },
    {
      "id": "V001",
      "title": "Проверить мастер в интерфейсе и сценарии отказов",
      "why": "Нужны доказательства наблюдаемого исправления первого экрана до выпуска.",
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "first-run-onboarding-031",
        "task_id": "V001",
        "role": "implementation"
      },
      "dependencies": [
        "T007"
      ],
      "functional_paths": [
        "tests/startup-ui.test.mjs",
        "tests/sidebar.test.mjs",
        "tests/electron-smoke.mjs"
      ],
      "documentation_paths": [
        "docs/VERIFICATION.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/modules/first-run-onboarding.md"
      ],
      "verification_ids": [
        "suite",
        "electron-smoke"
      ],
      "acceptance_criteria": [
        "Изолированно проверены новый профиль, долгий/неудачный load, повтор, вход, отсутствие компонентов, отмена и возврат; существующие сессии не нарушены.",
        "Снимок локального мастера подтверждает читаемость следующего действия; это не подменяет реальный чистый прогон пользователя."
      ],
      "expected_commit_message": "test: verify guided startup and retries"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "first-run-onboarding-031",
        "task_id": "T008",
        "role": "implementation"
      },
      "dependencies": [
        "V001"
      ],
      "functional_paths": [
        "package.json",
        "package-lock.json",
        "scripts/release-mac.mjs"
      ],
      "documentation_paths": [
        "docs/modules/first-run-onboarding.md",
        "docs/CLEAN_INSTALL.md",
        "docs/VERIFICATION.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/RELEASE.md"
      ],
      "verification_ids": [
        "suite",
        "electron-smoke"
      ],
      "acceptance_criteria": [
        "Пройдены применимые проверки и Electron smoke, подготовлен ZIP с версией и SHA-256.",
        "Постоянный macOS app обновлён по RELEASE с сохранением Finder-алиаса; работающее приложение пользователя не перезапускается автоматически.",
        "Испытание выполняется готовым пакетом, исходники и компоненты рабочего Mac не подмешиваются."
      ],
      "expected_commit_message": "build: package guided macOS first run",
      "id": "T008",
      "title": "Собрать проверенную macOS-поставку после исправлений",
      "why": "Передать для испытания готовое приложение с прослеживаемым составом."
    },
    {
      "id": "R001",
      "title": "Обновить документы первой итерации и передать релиз на проверку",
      "why": "Релизная итерация должна иметь актуальные инструкции и честные границы до ручного прогона.",
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "first-run-onboarding-031",
        "task_id": "R001",
        "role": "implementation"
      },
      "dependencies": [
        "T008"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/modules/first-run-onboarding.md",
        "docs/CLEAN_INSTALL.md",
        "docs/VERIFICATION.md",
        "docs/PRODUCT.md",
        "docs/DECISIONS.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/RELEASE.md",
        "docs/modules/runtime-lifecycle.md",
        "docs/WORKSPACE_SETUP.md",
        "docs/modules/workspace-sessions.md",
        "docs/CONTEXT_DELIVERY.md",
        "docs/TRANSFER_TO_WINDOWS.md",
        "README.md",
        "docs/WORKFLOW_START.md",
        "docs/architecture/OVERVIEW.md",
        "docs/MODULES.md",
        "docs/DOCUMENTATION_INDEX.md"
      ],
      "verification_ids": [],
      "acceptance_criteria": [
        "Обновлены документы первой итерации, состав/доставка релиза и точка повторного запуска; будущие задачи остаются в текущем плане до единственной финальной DOCS."
      ],
      "expected_commit_message": "docs: deliver first-run iteration for clean testing"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "first-run-onboarding-031",
        "task_id": "T009",
        "role": "implementation"
      },
      "dependencies": [
        "R001"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/modules/first-run-onboarding.md",
        "docs/CLEAN_INSTALL.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [],
      "acceptance_criteria": [
        "На новом клоне Base пройден путь от пакета до проекта, доставки контекста и разрешённого действия агента с тестовым файлом гостя.",
        "Для подтверждения готовности достаточно подсказок поставки и приложения; помощь агента в обход недостающего UI считается проблемой.",
        "Каждый оставшийся дефект добавляет задачи исправления, сборки и нового прохода до последующих проверок и DOCS; число циклов не ограничивается.",
        "После перезапуска приложения и гостя настройки сохраняются и подготовка не начинается заново.",
        "Перед повторным испытанием подтвердить сборку/архитектуру гостя, отсутствие предустановленных зависимостей/профиля в Base и версию/происхождение гостевого app; ранее отсутствовавшие данные T001 не считать подтверждёнными."
      ],
      "expected_commit_message": "docs: verify clean macOS guided startup",
      "id": "T009",
      "title": "Повторять полный путь macOS на свежих клонах до успеха",
      "why": "Доказать самостоятельный первый запуск исправленной поставки."
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "first-run-onboarding-031",
        "task_id": "T010",
        "role": "implementation"
      },
      "dependencies": [
        "T009"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/modules/first-run-onboarding.md",
        "docs/CLEAN_INSTALL.md",
        "docs/VERIFICATION.md",
        "docs/TRANSFER_TO_WINDOWS.md"
      ],
      "verification_ids": [],
      "acceptance_criteria": [
        "Подтверждён чистый эталон Windows; испытание проводится на отдельной копии с полной распакованной папкой поставки.",
        "Записаны ОС, ARM64 и запуск x64-приложения через эмуляцию; нативная Windows x64 не объявляется проверенной.",
        "Пройден обычный путь до первого блокера либо работы; отдельно записаны платформенные ошибки, запросы разрешений и неясные действия."
      ],
      "expected_commit_message": "docs: record Windows first-run findings",
      "id": "T010",
      "title": "Пройти первый запуск Windows и выявить отличия",
      "why": "Проверить тот же пользовательский путь во второй поддерживаемой ОС."
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "first-run-onboarding-031",
        "task_id": "T011",
        "role": "implementation"
      },
      "dependencies": [
        "T010"
      ],
      "functional_paths": [
        "src/windows-runtime.mjs",
        "src/platform.mjs",
        "tests/windows-runtime.test.mjs"
      ],
      "documentation_paths": [
        "docs/modules/first-run-onboarding.md",
        "docs/CLEAN_INSTALL.md",
        "docs/VERIFICATION.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/TRANSFER_TO_WINDOWS.md",
        "docs/modules/runtime-lifecycle.md",
        "docs/WORKSPACE_SETUP.md"
      ],
      "verification_ids": [
        "suite"
      ],
      "acceptance_criteria": [
        "Подтверждённые проблемы portable Node/Git, runtime и настройки подключения устранены без ручной установки компонентов пользователем.",
        "Сохраняются профиль, введённые данные, ошибки и повтор; изменения совместимы с macOS.",
        "Каждая независимая причина оформлена узкой микрозадачей и проверкой до изменения; при отсутствии дефекта фиксируется результат без искусственных правок."
      ],
      "expected_commit_message": "fix: complete guided Windows preparation",
      "id": "T011",
      "title": "Устранить подтверждённые проблемы подготовки Windows",
      "why": "Обеспечить тот же понятный путь на Windows с учётом её окружения."
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "first-run-onboarding-031",
        "task_id": "T012",
        "role": "implementation"
      },
      "dependencies": [
        "T011"
      ],
      "functional_paths": [
        "package.json",
        "package-lock.json",
        "scripts/verify-windows-package.mjs"
      ],
      "documentation_paths": [
        "docs/modules/first-run-onboarding.md",
        "docs/CLEAN_INSTALL.md",
        "docs/VERIFICATION.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/RELEASE.md",
        "docs/TRANSFER_TO_WINDOWS.md"
      ],
      "verification_ids": [
        "suite",
        "electron-smoke"
      ],
      "acceptance_criteria": [
        "Собраны macOS arm64 и Windows x64; пройдены suite, Electron smoke и проверки состава пакетов.",
        "Версии, SHA-256, исходники и установленный macOS app согласованы по RELEASE; файлы доставлены для испытаний.",
        "После дальнейшего исправления выпуск и чистое прохождение повторяются новыми микрозадачами этого же плана."
      ],
      "expected_commit_message": "build: release guided first-run packages",
      "id": "T012",
      "title": "Выпустить согласованные пакеты обеих платформ",
      "why": "Подготовить финальные поставки одного source для завершающего прохождения."
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "first-run-onboarding-031",
        "task_id": "T013",
        "role": "implementation"
      },
      "dependencies": [
        "T012"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/modules/first-run-onboarding.md",
        "docs/CLEAN_INSTALL.md",
        "docs/VERIFICATION.md",
        "docs/RELEASE.md",
        "docs/TRANSFER_TO_WINDOWS.md"
      ],
      "verification_ids": [],
      "acceptance_criteria": [
        "Финальные пакеты пройдены на свежих клонах обеих ОС от установки до реального действия с файлом тестового проекта.",
        "Проверены фактически обнаруженные ошибки, повтор, отмена/возврат, перезапуск приложения и ОС; подсказки понятны без технического сопровождения.",
        "Пользователь подтвердил, что весь путь его устраивает; незавершённые проверки не получают DONE.",
        "Границы Windows ARM64 и нативной x64 зафиксированы отдельно; все подтверждённые препятствия согласованного пути устранены."
      ],
      "expected_commit_message": "docs: confirm complete first-run experience",
      "id": "T013",
      "title": "Подтвердить весь путь пользователя и восстановление после ошибок",
      "why": "Достичь согласованного результата, а не только технического открытия окна."
    },
    {
      "id": "D001",
      "title": "Зафиксировать пробу Computer Use и возврат к скриншотам",
      "why": "Сохранить фактические задержки короткого опыта и действующий способ управления стендом без продолжения диагностики.",
      "dependencies": [],
      "functional_paths": [],
      "documentation_paths": [
        "docs/CLEAN_INSTALL.md",
        "docs/VERIFICATION.md",
        "docs/modules/first-run-onboarding.md"
      ],
      "acceptance_criteria": [
        "Записаны полученные внешние задержки: обычные вызовы около 1.8–2.3 с, первый снимок 3.311 с, клик запуска VM 34.038 с, снимок VM 56.566 с; причины задержек не объявлены установленными.",
        "Две ошибки INVALID_ARGUMENT команды activate_window и прерванная пользователем последняя операция отмечены отдельно от успешных измерений.",
        "Пользователь отменил продолжение Computer Use; сохранён режим его скриншотов и подсказок агента. Приложение в госте в ходе опыта не запускалось агентом."
      ],
      "verification_ids": [],
      "expected_commit_message": "docs: record Computer Use trial and manual test mode",
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "first-run-onboarding-031",
        "task_id": "D001",
        "role": "implementation"
      }
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "first-run-onboarding-031",
        "task_id": "DOCS",
        "role": "implementation"
      },
      "dependencies": [
        "T001",
        "T002",
        "T003",
        "T004",
        "T005",
        "F001",
        "T006",
        "T007",
        "V001",
        "T008",
        "R001",
        "T009",
        "T010",
        "T011",
        "T012",
        "T013",
        "D001"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "README.md",
        "docs/PRODUCT.md",
        "docs/DECISIONS.md",
        "docs/WORKFLOW_START.md",
        "docs/architecture/OVERVIEW.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/MODULES.md",
        "docs/DOCUMENTATION_INDEX.md",
        "docs/CLEAN_INSTALL.md",
        "docs/VERIFICATION.md",
        "docs/RELEASE.md",
        "docs/TRANSFER_TO_WINDOWS.md",
        "docs/WORKSPACE_SETUP.md",
        "docs/CONTEXT_DELIVERY.md",
        "docs/modules/first-run-onboarding.md",
        "docs/modules/runtime-lifecycle.md",
        "docs/modules/workspace-sessions.md"
      ],
      "verification_ids": [],
      "acceptance_criteria": [
        "Пройдены все документы по DOCUMENTATION_INDEX; устаревшие сведения исправлены, актуальные оставлены без бессмысленных правок.",
        "Инструкции установки соответствуют проверенному поведению; статусы испытаний и платформенные ограничения не преувеличены.",
        "План остаётся в своей сессии; архивирование и новая сессия автоматически не выполняются."
      ],
      "expected_commit_message": "docs: update first-run project documentation",
      "id": "DOCS",
      "title": "Актуализация всех документов проекта",
      "why": "Согласовать весь действующий комплект документов с фактически достигнутым результатом."
    }
  ],
  "blocked_reason": null,
  "user_decisions": [
    {
      "id": "prepared-base",
      "recorded_at": "2026-09-17T14:17:09.706Z",
      "text": "Источник каждого свежего клона — нынешний подготовленный Base (бывший Test), с общей папкой и гостевыми инструментами. Исходный Clean сохраняется резервом. Пользователь сообщил «Я сделал»; конфигурации Base и трёх Test подтверждены чтением на основном Mac."
    },
    {
      "id": "manual-guests",
      "recorded_at": "2026-09-17T14:17:09.707Z",
      "text": "Сохраняется согласованный порядок: пользователь управляет гостевыми ОС, агент анализирует результаты и готовит исправления/пакеты. Computer Use не возобновляется."
    },
    {
      "id": "iterations",
      "recorded_at": "2026-09-17T14:17:09.707Z",
      "text": "Каждая наблюдаемая проблема порождает конкретные задачи исправления, проверенной сборки и чистого повтора через plan:apply с актуальной revision до DOCS. Заранее заданного числа попыток нет; сценарий должен полностью устроить пользователя."
    },
    {
      "id": "6127a658-c9c4-4ac2-b8c3-c7aff17c7444",
      "text": "17.09.2026 пользователь подтвердил создание подготовленной Base и тестовых клонов и прямо поручил создать план этой сессии: запускать приложение на чистой системе, выявлять затруднения, устранять, пересобирать и повторять до полностью устраивающего результата. Приложение должно само провести пользователя от инсталляции до начала работы с понятными действиями на каждом шаге. Сначала macOS, затем Windows по восстановленному согласованному порядку. Текущее поручение — создание плана; дальнейшее выполнение начинается с T001.",
      "recorded_at": "2026-09-17T14:23:39.281Z"
    },
    {
      "id": "computer-use-trial-stopped",
      "text": "17.09.2026 пользователь временно разрешил Computer Use только для запуска Test macOS 01, просмотра папки обмена и замера задержек. После задержек 34 и 57 секунд он остановил опыт и поручил вернуться к своим скриншотам и подсказкам агента; диагностика отложена.",
      "recorded_at": "2026-09-17T14:33:51.217455+00:00"
    },
    {
      "id": "zero-prerequisites-startup",
      "recorded_at": "2026-09-17T14:50:36.992191+00:00",
      "text": "Пользователь уточнил: на чистой системе может не быть аккаунта или прежнего входа в ChatGPT, локального bridge/MCP и туннеля. Web Pilot обязан проверять необходимые условия при запуске, автоматически готовить технические компоненты и полностью сопровождать обязательные личные действия. Внешние диагностические подсказки агента не заменяют этот путь."
    },
    {
      "id": "stepwise-releases",
      "recorded_at": "2026-09-17T14:56:50.242259+00:00",
      "text": "Пользователь поручил сейчас реализовать исправления первого запуска и выпустить новый релиз, затем проверить его в чистом госте и перейти к следующему наблюдаемому препятствию. Работа выполняется итерациями в этом же плане; недостающие доказательства базовой VM сохраняются в T009, не выдаются за проверенные и не блокируют исправление подтверждённых кодом проблем."
    }
  ],
  "owner_session_id": "web-pilot-ee60a2b3-bdde-4d7f-83cd-a4e25767fcbe",
  "prepared_in_session_id": null
}
```
<!-- workflow-state:end -->

## Состояние

Execution Scope Status: ACTIVE
Delivery Status: IN_PROGRESS
Scope: first-run-onboarding-031
Current Task: нет
Revision: 15

## Цель

Довести первый запуск Web Pilot на чистых macOS и Windows от установки до начала работы: приложение само подготавливает компоненты и понятно сопровождает каждое необходимое действие пользователя. Исправлять, пересобирать и повторять проверки на свежих клонах, пока весь путь полностью не устроит пользователя.

## Критерии приёмки

- На свежем клоне пользователь проходит от готового пакета до первого проекта и реального действия агента с тестовым файлом по подсказкам самого приложения.
- Технические компоненты готовятся автоматически; пользователь не выполняет команды, не устанавливает инструменты разработчика вручную и не должен понимать MCP, порты или runtime.
- Неизбежные личные действия, внешние входы, разрешения и получение данных подключения объяснены на нужном шаге и проверяются после выполнения.
- Ошибки, ожидание, повтор и перезапуск имеют понятное поведение, сохранение прогресса и настроек.
- Исправление → проверки → сборка → новый клон → повтор образуют неограниченный цикл внутри этого плана; завершение определяется полным пользовательским результатом.
- macOS и Windows ARM64 с x64-эмуляцией проверены отдельно; нативная Windows x64 имеет честно указанный статус.
- Base сохраняется; основной Mac, рабочие runtime и профили не используются как скрытые предварительные условия.
- Каждая микрозадача имеет отдельный проверенный commit; единственная последняя DOCS актуализирует документацию; пользователь подтверждает пригодность полного пути.

## Микрозадачи

- [DONE] T001: Зафиксировать исходную поставку и известные границы стенда — Завершено
  - Git Commit: [DONE] docs: record clean first-run baseline
  - Reference: first-run-onboarding-031 / T001 / implementation
  - Файлы: docs/modules/first-run-onboarding.md, docs/CLEAN_INSTALL.md, docs/VERIFICATION.md
- [DONE] T002: Пройти первый запуск macOS и зафиксировать затруднения пользователя — Завершено
  - Git Commit: [DONE] docs: record initial macOS first-run findings
  - Reference: first-run-onboarding-031 / T002 / implementation
  - Файлы: docs/modules/first-run-onboarding.md, docs/CLEAN_INSTALL.md, docs/VERIFICATION.md
- [DONE] T003: Уточнить последовательность первого запуска по наблюдениям — Завершено
  - Git Commit: [DONE] docs: define guided first-run steps
  - Reference: first-run-onboarding-031 / T003 / implementation
  - Файлы: docs/modules/first-run-onboarding.md, docs/CLEAN_INSTALL.md, docs/PRODUCT.md, docs/DECISIONS.md
- [DONE] T004: Обеспечить доступность компонентов для чистой macOS — Завершено
  - Git Commit: [DONE] fix: prepare dependencies for clean macOS
  - Reference: first-run-onboarding-031 / T004 / implementation
  - Файлы: scripts/prepare-mac-toolchain.mjs, src/platform.mjs, tests/mac-toolchain.test.mjs, docs/modules/first-run-onboarding.md, docs/CLEAN_INSTALL.md, docs/VERIFICATION.md, docs/architecture/ARCHITECTURE.md, docs/RELEASE.md, docs/modules/runtime-lifecycle.md
- [DONE] T005: Реализовать проверку и последовательную подготовку чистого окружения — Завершено
  - Git Commit: [DONE] fix: bootstrap first workspace on clean macOS
  - Reference: first-run-onboarding-031 / T005 / implementation
  - Файлы: src/startup-readiness.mjs, tests/startup-readiness.test.mjs, docs/modules/first-run-onboarding.md, docs/CLEAN_INSTALL.md, docs/VERIFICATION.md, docs/architecture/ARCHITECTURE.md, docs/WORKSPACE_SETUP.md, docs/modules/runtime-lifecycle.md
- [TODO] F001: Проверять готовность чистой системы перед началом работы — Ожидает
  - Git Commit: [PENDING] feat: check first-run readiness on startup
  - Reference: first-run-onboarding-031 / F001 / implementation
  - Файлы: src/main.mjs, src/preload.cjs, src/ui/progress.mjs, docs/modules/first-run-onboarding.md, docs/CLEAN_INSTALL.md, docs/VERIFICATION.md, docs/architecture/ARCHITECTURE.md, docs/modules/runtime-lifecycle.md
- [TODO] T006: Встроить понятное сопровождение первого запуска — Ожидает
  - Git Commit: [PENDING] feat: guide users through first startup
  - Reference: first-run-onboarding-031 / T006 / implementation
  - Файлы: src/ui/startup.mjs, src/ui/index.html, src/ui/sidebar.mjs, docs/modules/first-run-onboarding.md, docs/CLEAN_INSTALL.md, docs/VERIFICATION.md, docs/architecture/ARCHITECTURE.md, docs/PRODUCT.md, docs/modules/workspace-sessions.md, docs/WORKSPACE_SETUP.md
- [TODO] T007: Сопроводить вход и первичную настройку подключения — Ожидает
  - Git Commit: [PENDING] feat: guide initial connection setup
  - Reference: first-run-onboarding-031 / T007 / implementation
  - Файлы: resources/runtime-control/mac-first-run.py, src/mac-runtime.mjs, tests/mac-first-run.test.mjs, docs/modules/first-run-onboarding.md, docs/CLEAN_INSTALL.md, docs/VERIFICATION.md, docs/architecture/ARCHITECTURE.md, docs/modules/runtime-lifecycle.md, docs/CONTEXT_DELIVERY.md, docs/PRODUCT.md
- [TODO] V001: Проверить мастер в интерфейсе и сценарии отказов — Ожидает
  - Git Commit: [PENDING] test: verify guided startup and retries
  - Reference: first-run-onboarding-031 / V001 / implementation
  - Файлы: tests/startup-ui.test.mjs, tests/sidebar.test.mjs, tests/electron-smoke.mjs, docs/VERIFICATION.md, docs/architecture/ARCHITECTURE.md, docs/modules/first-run-onboarding.md
- [TODO] T008: Собрать проверенную macOS-поставку после исправлений — Ожидает
  - Git Commit: [PENDING] build: package guided macOS first run
  - Reference: first-run-onboarding-031 / T008 / implementation
  - Файлы: package.json, package-lock.json, scripts/release-mac.mjs, docs/modules/first-run-onboarding.md, docs/CLEAN_INSTALL.md, docs/VERIFICATION.md, docs/architecture/ARCHITECTURE.md, docs/RELEASE.md
- [TODO] R001: Обновить документы первой итерации и передать релиз на проверку — Ожидает
  - Git Commit: [PENDING] docs: deliver first-run iteration for clean testing
  - Reference: first-run-onboarding-031 / R001 / implementation
  - Файлы: docs/modules/first-run-onboarding.md, docs/CLEAN_INSTALL.md, docs/VERIFICATION.md, docs/PRODUCT.md, docs/DECISIONS.md, docs/architecture/ARCHITECTURE.md, docs/RELEASE.md, docs/modules/runtime-lifecycle.md, docs/WORKSPACE_SETUP.md, docs/modules/workspace-sessions.md, docs/CONTEXT_DELIVERY.md, docs/TRANSFER_TO_WINDOWS.md, README.md, docs/WORKFLOW_START.md, docs/architecture/OVERVIEW.md, docs/MODULES.md, docs/DOCUMENTATION_INDEX.md
- [TODO] T009: Повторять полный путь macOS на свежих клонах до успеха — Ожидает
  - Git Commit: [PENDING] docs: verify clean macOS guided startup
  - Reference: first-run-onboarding-031 / T009 / implementation
  - Файлы: docs/modules/first-run-onboarding.md, docs/CLEAN_INSTALL.md, docs/VERIFICATION.md
- [TODO] T010: Пройти первый запуск Windows и выявить отличия — Ожидает
  - Git Commit: [PENDING] docs: record Windows first-run findings
  - Reference: first-run-onboarding-031 / T010 / implementation
  - Файлы: docs/modules/first-run-onboarding.md, docs/CLEAN_INSTALL.md, docs/VERIFICATION.md, docs/TRANSFER_TO_WINDOWS.md
- [TODO] T011: Устранить подтверждённые проблемы подготовки Windows — Ожидает
  - Git Commit: [PENDING] fix: complete guided Windows preparation
  - Reference: first-run-onboarding-031 / T011 / implementation
  - Файлы: src/windows-runtime.mjs, src/platform.mjs, tests/windows-runtime.test.mjs, docs/modules/first-run-onboarding.md, docs/CLEAN_INSTALL.md, docs/VERIFICATION.md, docs/architecture/ARCHITECTURE.md, docs/TRANSFER_TO_WINDOWS.md, docs/modules/runtime-lifecycle.md, docs/WORKSPACE_SETUP.md
- [TODO] T012: Выпустить согласованные пакеты обеих платформ — Ожидает
  - Git Commit: [PENDING] build: release guided first-run packages
  - Reference: first-run-onboarding-031 / T012 / implementation
  - Файлы: package.json, package-lock.json, scripts/verify-windows-package.mjs, docs/modules/first-run-onboarding.md, docs/CLEAN_INSTALL.md, docs/VERIFICATION.md, docs/architecture/ARCHITECTURE.md, docs/RELEASE.md, docs/TRANSFER_TO_WINDOWS.md
- [TODO] T013: Подтвердить весь путь пользователя и восстановление после ошибок — Ожидает
  - Git Commit: [PENDING] docs: confirm complete first-run experience
  - Reference: first-run-onboarding-031 / T013 / implementation
  - Файлы: docs/modules/first-run-onboarding.md, docs/CLEAN_INSTALL.md, docs/VERIFICATION.md, docs/RELEASE.md, docs/TRANSFER_TO_WINDOWS.md
- [TODO] D001: Зафиксировать пробу Computer Use и возврат к скриншотам — Ожидает
  - Git Commit: [PENDING] docs: record Computer Use trial and manual test mode
  - Reference: first-run-onboarding-031 / D001 / implementation
  - Файлы: docs/CLEAN_INSTALL.md, docs/VERIFICATION.md, docs/modules/first-run-onboarding.md
- [TODO] DOCS: Актуализация всех документов проекта — Ожидает
  - Git Commit: [PENDING] docs: update first-run project documentation
  - Reference: first-run-onboarding-031 / DOCS / implementation
  - Файлы: README.md, docs/PRODUCT.md, docs/DECISIONS.md, docs/WORKFLOW_START.md, docs/architecture/OVERVIEW.md, docs/architecture/ARCHITECTURE.md, docs/MODULES.md, docs/DOCUMENTATION_INDEX.md, docs/CLEAN_INSTALL.md, docs/VERIFICATION.md, docs/RELEASE.md, docs/TRANSFER_TO_WINDOWS.md, docs/WORKSPACE_SETUP.md, docs/CONTEXT_DELIVERY.md, docs/modules/first-run-onboarding.md, docs/modules/runtime-lifecycle.md, docs/modules/workspace-sessions.md

## Context Pack For This Cycle

- docs/architecture/OVERVIEW.md → Краткая архитектура проекта
- docs/MODULES.md → Модули проекта
- docs/DOCUMENTATION_INDEX.md → Каталог документации
- docs/modules/first-run-onboarding.md → Первый запуск Web Pilot на чистой системе
- docs/modules/runtime-lifecycle.md → Module Specification — Runtime Lifecycle
- docs/WORKSPACE_SETUP.md → Создание и подключение workspace

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
