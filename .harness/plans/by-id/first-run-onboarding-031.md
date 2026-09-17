# Активный план — Project Web Pilot

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 80,
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
      "tests/electron-smoke.mjs",
      "src/chromium-diagnostics.mjs",
      "tests/chromium-diagnostics.test.mjs",
      "src/browser-startup.mjs",
      "tests/browser-startup.test.mjs",
      "src/startup-network-trace.mjs",
      "tests/startup-network-trace.test.mjs",
      "src/chatgpt-experience.mjs"
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
      "implementation_status": "DONE",
      "commit_status": "DONE",
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
      "implementation_status": "DONE",
      "commit_status": "DONE",
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
      "implementation_status": "DONE",
      "commit_status": "DONE",
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
      "id": "C001",
      "title": "Сохранить работоспособность мастера после отмены и возврата",
      "why": "Проверка переходов выявила, что отмена подготовки/настроек меняет generation страницы; мастер должен продолжать проверку актуального документа.",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "first-run-onboarding-031",
        "task_id": "C001",
        "role": "implementation"
      },
      "dependencies": [
        "T007"
      ],
      "functional_paths": [
        "src/main.mjs",
        "src/startup-readiness.mjs",
        "tests/startup-readiness.test.mjs"
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
        "Возврат/отмена первого проекта и настроек сохраняют доступный мастер и актуальную проверку страницы.",
        "Перед переходом к проекту готовность перепроверяется; гостевой редактор без подтверждённого аккаунта не считается входом.",
        "Повторные действия и неизвестное состояние страницы не разрешают ложную готовность.",
        "На новом packaged macOS профиле запуск вне Applications предлагает штатное перемещение; отказ и конфликт не заменяют существующую копию без отдельного подтверждения."
      ],
      "expected_commit_message": "fix: resume first-run checks after cancelled setup"
    },
    {
      "id": "V001",
      "title": "Проверить мастер в интерфейсе и сценарии отказов",
      "why": "Нужны доказательства наблюдаемого исправления первого экрана до выпуска.",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "first-run-onboarding-031",
        "task_id": "V001",
        "role": "implementation"
      },
      "dependencies": [
        "C001"
      ],
      "functional_paths": [
        "tests/startup-ui.test.mjs",
        "tests/electron-smoke.mjs",
        "src/ui/startup.mjs"
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
      "implementation_status": "DONE",
      "commit_status": "DONE",
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
      "implementation_status": "DONE",
      "commit_status": "DONE",
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
      "implementation_status": "DONE",
      "commit_status": "DONE",
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
        "Зафиксирован повторный запуск, снимок пустой панели и переданные пользователем две строки diagnostics.jsonl.",
        "Первый путь остановлен на загрузке ChatGPT; причина неизвестна, полный результат и недостающие baseline-факты перенесены в T014.",
        "Добавлены конкретные исправления ранней диагностики и сопровождения, новая сборка и повтор в том же плане."
      ],
      "expected_commit_message": "docs: record blank first page after macOS retest",
      "id": "T009",
      "title": "Зафиксировать повторный запуск 0.6.32 и полученный журнал",
      "why": "Доказать самостоятельный первый запуск исправленной поставки."
    },
    {
      "id": "C002",
      "title": "Записывать загрузку браузера с первого обращения к сайту",
      "why": "Текущий журнал запускается после успешной загрузки и не объясняет пустую панель.",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "first-run-onboarding-031",
        "task_id": "C002",
        "role": "implementation"
      },
      "dependencies": [
        "T009"
      ],
      "functional_paths": [
        "src/main.mjs",
        "src/chromium-diagnostics.mjs",
        "tests/electron-smoke.mjs"
      ],
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
      "verification_ids": [
        "suite",
        "electron-smoke"
      ],
      "acceptance_criteria": [
        "Существующий журнал включается до первой навигации; фиксирует запрос, длительное ожидание, HTTP-статус главного документа, ошибки навигации и падение renderer.",
        "Диагностика содержит только безопасные коды/адреса без секретов и содержимого чата; неизвестная причина не подменяется предположением.",
        "Локальная команда копирует краткий отчёт текущего запуска для передачи через буфер; реальная ошибка первой загрузки проверена в Electron fixture."
      ],
      "expected_commit_message": "fix: capture browser diagnostics before first navigation"
    },
    {
      "id": "C003",
      "title": "Показывать вход только после появления страницы ChatGPT",
      "why": "Пользователь не должен искать кнопки на пустой правой панели.",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "first-run-onboarding-031",
        "task_id": "C003",
        "role": "implementation"
      },
      "dependencies": [
        "C002"
      ],
      "functional_paths": [
        "src/ui/startup.mjs",
        "src/ui/index.html",
        "tests/startup-ui.test.mjs"
      ],
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
      "verification_ids": [
        "suite",
        "electron-smoke"
      ],
      "acceptance_criteria": [
        "Первый экран объясняет, что Web Pilot открывает сайт ChatGPT справа; при отсутствии страницы видны повтор и копирование диагностики.",
        "Инструкции входа и регистрации не ссылаются на отсутствующие элементы; ожидается фактическое наблюдение экрана входа.",
        "Подсказка копирования позволяет передать журнал без двусторонней общей папки; проверены сбой и восстановление UI."
      ],
      "expected_commit_message": "fix: guide users when ChatGPT has not opened"
    },
    {
      "id": "V002",
      "title": "Проверить ранний журнал и повтор неудачной загрузки",
      "why": "Нужна воспроизводимая проверка случая, когда первая страница не загрузилась.",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "first-run-onboarding-031",
        "task_id": "V002",
        "role": "implementation"
      },
      "dependencies": [
        "C003"
      ],
      "functional_paths": [
        "tests/chromium-diagnostics.test.mjs",
        "tests/electron-smoke.mjs"
      ],
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
      "verification_ids": [
        "suite",
        "electron-smoke"
      ],
      "acceptance_criteria": [
        "Тесты подтверждают HTTP/сетевую ошибку до первого успешного load, безопасное содержимое отчёта и последующую успешную загрузку.",
        "Визуально проверен новый экран задержки; fixture не объявляется результатом чистой VM."
      ],
      "expected_commit_message": "test: verify first navigation failure diagnostics"
    },
    {
      "id": "B002",
      "title": "Собрать обе платформы с ранней диагностикой загрузки",
      "why": "Общие исправления браузера должны попасть в обе поставки одного выпуска.",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "first-run-onboarding-031",
        "task_id": "B002",
        "role": "implementation"
      },
      "dependencies": [
        "V002"
      ],
      "functional_paths": [
        "package.json",
        "package-lock.json"
      ],
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
      "verification_ids": [
        "suite",
        "electron-smoke"
      ],
      "acceptance_criteria": [
        "Выпущены macOS arm64 и Windows x64 0.6.33 с совпадающим source, checksum и проверкой ZIP.",
        "Постоянный app обновлён с сохранением identity; рабочий процесс не перезапускается.",
        "Windows получает общую диагностику; перенос мастера на Windows остаётся отдельной незавершённой задачей, его готовность не заявляется."
      ],
      "expected_commit_message": "build: release early browser diagnostics for both platforms"
    },
    {
      "id": "R002",
      "title": "Обновить документы и передать диагностический релиз",
      "why": "Сохранить факты повторного прогона и простой следующий шаг пользователя.",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "first-run-onboarding-031",
        "task_id": "R002",
        "role": "implementation"
      },
      "dependencies": [
        "B002"
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
        "Документы отражают 0.6.33, неизвестную причину пустой страницы, кнопку копирования и незавершённый полный прогон.",
        "План продолжает ту же сессию и сохраняет единственную финальную DOCS."
      ],
      "expected_commit_message": "docs: deliver browser startup diagnostic iteration"
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "first-run-onboarding-031",
        "task_id": "T014",
        "role": "implementation"
      },
      "dependencies": [
        "R002"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/modules/first-run-onboarding.md",
        "docs/CLEAN_INSTALL.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [],
      "acceptance_criteria": [
        "Зафиксированы отчёт 0.6.33 и открытие ChatGPT без входа в Safari гостя.",
        "Описаны воспроизводимые локальные пробы и их границы: нет доказанного диагноза гостевой сети.",
        "Выявлены ожидание первого документа без предела и зависимость мастера от полной загрузки ресурсов; полная приёмка сохранена в T015."
      ],
      "expected_commit_message": "docs: record first browser response investigation",
      "id": "T014",
      "title": "Зафиксировать повтор 0.6.33 и локализовать ожидание Chromium",
      "why": "Сохранить фактический остановленный проход; полные критерии перенесены в T015 без объявления успешной установки."
    },
    {
      "id": "C004",
      "title": "Ограничить первый запуск браузера и восстановить зависшее соединение",
      "why": "Первый документ не должен ждать бесконечно, а дополнительные ресурсы не должны блокировать уже открытый экран входа.",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "first-run-onboarding-031",
        "task_id": "C004",
        "role": "implementation"
      },
      "dependencies": [
        "T014"
      ],
      "functional_paths": [
        "src/browser-startup.mjs",
        "src/main.mjs",
        "tests/browser-startup.test.mjs"
      ],
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
      "verification_ids": [
        "suite",
        "electron-smoke"
      ],
      "acceptance_criteria": [
        "Новый пустой browser получает ограниченное ожидание DOM и не более одного автоматического восстановления только до появления документа.",
        "Восстановление использует штатные closeAllConnections/clearHostResolverCache, без удаления cookies, смены IP, отключения TLS/sandbox/GPU.",
        "Старая generation не останавливает и не перезаписывает новую навигацию; постоянный отказ ограничен по времени.",
        "На первом экране вход может определяться после DOM-ready, не ожидая завершения всех ресурсов.",
        "Поведение проверено на зависшей загрузке, успешном восстановлении, отказе, cancellation и уже появившемся документе."
      ],
      "expected_commit_message": "fix: recover stalled initial browser navigation"
    },
    {
      "id": "B003",
      "title": "Выпустить 0.6.34 для macOS и Windows",
      "why": "Передать проверяемое исправление общего первого открытия в обе поставки.",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "first-run-onboarding-031",
        "task_id": "B003",
        "role": "implementation"
      },
      "dependencies": [
        "C004"
      ],
      "functional_paths": [
        "package.json",
        "package-lock.json"
      ],
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
      "verification_ids": [
        "suite",
        "electron-smoke"
      ],
      "acceptance_criteria": [
        "Обе платформы собраны из одного source; ZIP, содержимое и контрольные суммы проверены.",
        "Постоянный macOS app обновлён с сохранением identity; рабочий процесс не перезапускается.",
        "Гостевой результат и Windows-мастер не объявлены проверенными."
      ],
      "expected_commit_message": "build: release bounded initial browser navigation"
    },
    {
      "id": "R003",
      "title": "Актуализировать документы итерации 0.6.34",
      "why": "Передать факты и следующий пользовательский повтор; сохранить финальную DOCS.",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "first-run-onboarding-031",
        "task_id": "R003",
        "role": "implementation"
      },
      "dependencies": [
        "B003"
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
        "Документы отражают фактическое исправление и границы локальных/гостевых проверок.",
        "Полный пользовательский проход остаётся T015, план не архивируется."
      ],
      "expected_commit_message": "docs: deliver first navigation recovery iteration"
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "first-run-onboarding-031",
        "task_id": "T015",
        "role": "implementation"
      },
      "dependencies": [
        "R003"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/modules/first-run-onboarding.md",
        "docs/CLEAN_INSTALL.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [],
      "acceptance_criteria": [
        "Повтор 0.6.34: две попытки по 15 секунд не дали документа; ручной повтор позже открыл экран входа.",
        "В новом отчёте первый видимый успешный ответ через 92.758 с от старта, последующие открытия 0.53–0.73 с; ранние события вытеснены.",
        "Перенос старта на кнопку отложен; разрешён один непрерывный запрос с сетевыми этапами и сохранением начала отчёта.",
        "Исходные полные критерии сохранены в T016, причина отказа не объявлена доказанной."
      ],
      "expected_commit_message": "docs: record delayed first navigation findings",
      "id": "T015",
      "title": "Зафиксировать повтор 0.6.34 и период отказов после старта",
      "why": "Сохранить факты двух отчётов и согласованный диагностический эксперимент."
    },
    {
      "id": "C005",
      "title": "Проверить один непрерывный запрос до 120 секунд",
      "why": "Проверить один непрерывный запрос до 120 секунд",
      "dependencies": [
        "T015"
      ],
      "functional_paths": [
        "src/browser-startup.mjs",
        "tests/browser-startup.test.mjs",
        "src/main.mjs"
      ],
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
      "verification_ids": [
        "suite",
        "electron-smoke"
      ],
      "acceptance_criteria": [
        "Нет отмены/повтора и очистки соединения через 15 секунд; один запрос ждёт DOM до 120 секунд или штатной ошибки Chromium.",
        "Повтор во время первого запроса не изменяет generation и не вызывает второй loadURL.",
        "После DOM-ready проверка не ждёт дополнительных ресурсов; ошибки передают точный безопасный код.",
        "Навигация существующих проектов сохраняет прежний контракт."
      ],
      "expected_commit_message": "fix: observe uninterrupted first browser request",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "first-run-onboarding-031",
        "task_id": "C005",
        "role": "implementation"
      }
    },
    {
      "id": "C006",
      "title": "Показывать ожидание и блокировать конкурирующие повторы",
      "why": "Показывать ожидание и блокировать конкурирующие повторы",
      "dependencies": [
        "C005"
      ],
      "functional_paths": [
        "src/ui/startup.mjs",
        "tests/startup-ui.test.mjs"
      ],
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
      "verification_ids": [
        "suite"
      ],
      "acceptance_criteria": [
        "Loading/slow объясняют проверку до двух минут, повтор заблокирован только на время запроса.",
        "Копирование отчёта доступно во время ожидания и после успеха.",
        "После завершения запрос можно повторить, таймаут имеет точное объяснение."
      ],
      "expected_commit_message": "fix: guide uninterrupted startup observation",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "first-run-onboarding-031",
        "task_id": "C006",
        "role": "implementation"
      }
    },
    {
      "id": "C007",
      "title": "Записать сетевые этапы первого запроса штатным netLog",
      "why": "Записать сетевые этапы первого запроса штатным netLog",
      "dependencies": [
        "C006"
      ],
      "functional_paths": [
        "src/startup-network-trace.mjs",
        "tests/startup-network-trace.test.mjs",
        "src/chromium-diagnostics.mjs"
      ],
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
      "verification_ids": [
        "suite"
      ],
      "acceptance_criteria": [
        "Используется Electron netLog default с ограничением размера/времени, только при запуске без проектов.",
        "Отчёт содержит безопасную сводку DNS/TCP/TLS/HTTP первого запроса; заголовки, значения query, cookies и содержимое не выдаются.",
        "В отчёте сохраняются начальные события и последние события с явным счётчиком пропущенных.",
        "Диагностика не блокирует навигацию и удаляет временный сырой журнал после сводки."
      ],
      "expected_commit_message": "feat: capture first-request network stages",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "first-run-onboarding-031",
        "task_id": "C007",
        "role": "implementation"
      }
    },
    {
      "id": "V003",
      "title": "Проверить сохранение начала отчёта и диагностический первый запуск",
      "why": "Проверить сохранение начала отчёта и диагностический первый запуск",
      "dependencies": [
        "C007"
      ],
      "functional_paths": [
        "tests/chromium-diagnostics.test.mjs",
        "tests/electron-smoke.mjs",
        "src/main.mjs"
      ],
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
      "verification_ids": [
        "suite",
        "electron-smoke"
      ],
      "acceptance_criteria": [
        "Fixture подтверждает один задержанный запрос, готовый DOM и доступную сводку сети.",
        "Регрессия сохраняет начало и конец отчёта, исключая секреты/предыдущие сессии.",
        "Startup network trace подключён только к запуску без проектов, существующие пользовательские профили не меняются."
      ],
      "expected_commit_message": "test: verify first-request diagnostic iteration",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "first-run-onboarding-031",
        "task_id": "V003",
        "role": "implementation"
      }
    },
    {
      "id": "C008",
      "title": "Исправить ограничение native netLog без изменения sandbox",
      "why": "Electron fixture выявил ERR_INSUFFICIENT_RESOURCES при native maxFileSize; до выпуска нужен рабочий сетевой отчёт.",
      "dependencies": [
        "V003"
      ],
      "functional_paths": [
        "src/startup-network-trace.mjs",
        "tests/startup-network-trace.test.mjs",
        "tests/electron-smoke.mjs"
      ],
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
      "verification_ids": [
        "suite",
        "electron-smoke"
      ],
      "acceptance_criteria": [
        "Ограничение файла выполняет приложение, native default netLog запускается без maxFileSize; sandbox не меняется.",
        "Регрессия подтверждает остановку по порогу размера и удаление сырого журнала.",
        "Electron fixture использует настоящий StartupNetworkTrace и получает TCP/HTTP 200 после одного 16-секундного запроса."
      ],
      "expected_commit_message": "fix: bound startup netlog in the application",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "first-run-onboarding-031",
        "task_id": "C008",
        "role": "implementation"
      }
    },
    {
      "id": "B004",
      "title": "Выпустить диагностическую 0.6.35 для обеих платформ",
      "why": "Выпустить диагностическую 0.6.35 для обеих платформ",
      "dependencies": [
        "C008"
      ],
      "functional_paths": [
        "package.json",
        "package-lock.json"
      ],
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
      "verification_ids": [
        "suite",
        "electron-smoke"
      ],
      "acceptance_criteria": [
        "Собраны macOS arm64 и Windows x64, source/resources/ZIP сверены.",
        "Постоянный Mac app обновлён с сохранением identity, рабочий процесс не перезапущен.",
        "Это диагностическая проверка гипотезы; исправление сетевой причины не объявлено."
      ],
      "expected_commit_message": "build: release uninterrupted startup diagnostics",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "first-run-onboarding-031",
        "task_id": "B004",
        "role": "implementation"
      }
    },
    {
      "id": "R004",
      "title": "Актуализировать документы и инструкции повторной проверки",
      "why": "Актуализировать документы и инструкции повторной проверки",
      "dependencies": [
        "B004"
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
        "Текущие документы отражают 0.6.35 и один запрос до двух минут.",
        "T016 сохраняет полный чистый путь; финальная DOCS остаётся последней."
      ],
      "expected_commit_message": "docs: deliver uninterrupted startup check",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "first-run-onboarding-031",
        "task_id": "R004",
        "role": "implementation"
      }
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "dependencies": [
        "R004"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/modules/first-run-onboarding.md",
        "docs/CLEAN_INSTALL.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [],
      "acceptance_criteria": [
        "Сохранены обе попытки одного диагностического сеанса: 120010 и 120008 мс, без HTTP-ответа/DOM.",
        "Отмечено, что network относится только к первому запросу, причина повторного ожидания по этой части не установлена.",
        "Локальные пробы различают главную страницу и прямой вход; условия и ограничения результатов явно записаны.",
        "Полные критерии прежнего T016 без потери перенесены в T017; чистый пользовательский путь не объявлен пройденным."
      ],
      "expected_commit_message": "docs: record repeated startup timeout and login route probes",
      "id": "T016",
      "title": "Зафиксировать два отказа 0.6.35 и сравнение начальных URL",
      "why": "Непрерывное ожидание и ручной повтор не устранили MAC-002; локализовать следующую узкую коррекцию.",
      "commit_ref": {
        "scope_id": "first-run-onboarding-031",
        "task_id": "T016",
        "role": "implementation"
      }
    },
    {
      "id": "C009",
      "title": "Открывать страницу входа напрямую при запуске без проекта",
      "why": "Открывать страницу входа напрямую при запуске без проекта",
      "dependencies": [
        "T016"
      ],
      "functional_paths": [
        "src/chatgpt-experience.mjs",
        "src/main.mjs",
        "tests/electron-smoke.mjs"
      ],
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
      "verification_ids": [
        "suite",
        "electron-smoke"
      ],
      "acceptance_criteria": [
        "Навигация без проекта направляется на штатный https://chatgpt.com/auth/login; явные entryUrl сохраняют приоритет.",
        "Сохранённые URL проектов и Chat/Work entrypoints не меняются.",
        "Electron fixture подтверждает фактический адрес первого открытия без проекта; защита, заголовки, cookies и диагностика не меняются."
      ],
      "expected_commit_message": "fix: open the sign-in page directly during onboarding",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "first-run-onboarding-031",
        "task_id": "C009",
        "role": "implementation"
      }
    },
    {
      "id": "C010",
      "title": "Показывать установщик Apple поверх Web Pilot",
      "why": "Подтверждение установки Command Line Tools скрыто под окном приложения на чистой macOS.",
      "dependencies": [
        "C009"
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
        "docs/DECISIONS.md"
      ],
      "verification_ids": [
        "suite"
      ],
      "acceptance_criteria": [
        "После успешного xcode-select --install приложение штатно активирует окно системного установщика без дополнительных разрешений Automation/Accessibility.",
        "Ошибка запуска и ошибка показа различимы, пользователь получает понятный следующий шаг; Git не считается установленным до проверки.",
        "Повторные нажатия сериализованы; тесты не запускают установщик на основном Mac.",
        "Наблюдения 0.6.35: чистые клоны созданы до экспериментов; сайт и вход успешны на другом клоне, причина прежнего сетевого сбоя не объявлена устранённой."
      ],
      "expected_commit_message": "fix: bring Apple command line tools installer to front",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "first-run-onboarding-031",
        "task_id": "C010",
        "role": "implementation"
      }
    },
    {
      "id": "B005",
      "title": "Собрать 0.6.36 с исправлением показа установщика",
      "why": "Передать проверяемое исправление скрытого окна Apple на обеих платформах.",
      "dependencies": [
        "C010"
      ],
      "functional_paths": [
        "package.json",
        "package-lock.json"
      ],
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
      "verification_ids": [
        "suite",
        "electron-smoke"
      ],
      "acceptance_criteria": [
        "macOS arm64 и Windows x64 собраны и сверены с исходниками; ZIP доставлены.",
        "Постоянный Mac app обновлён с сохранением identity и рабочего процесса.",
        "Устранение гостевого дефекта ожидает ручной проверки, нативная Windows не объявлена проверенной."
      ],
      "expected_commit_message": "build: release visible Apple installer handoff",
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "first-run-onboarding-031",
        "task_id": "B005",
        "role": "implementation"
      }
    },
    {
      "id": "R005",
      "title": "Обновить документы и передать проверку 0.6.36",
      "why": "Обновить документы и передать проверку 0.6.36",
      "dependencies": [
        "B005"
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
        "Документы описывают показ установщика Apple, фактический успех 0.6.35 на чистом клоне и границы проверки 0.6.36.",
        "Инструкция повтора и полный T017 сохранены; DOCS остаётся последней."
      ],
      "expected_commit_message": "docs: deliver installer visibility check",
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "first-run-onboarding-031",
        "task_id": "R005",
        "role": "implementation"
      }
    },
    {
      "id": "T017",
      "title": "Проверить показ установщика и полный чистый путь macOS",
      "why": "Проверить прямой вход и полный чистый путь macOS",
      "dependencies": [
        "R005"
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
        "На новом клоне Base пройден путь от пакета до проекта, доставки контекста и разрешённого действия агента с тестовым файлом гостя.",
        "Для подтверждения готовности достаточно подсказок поставки и приложения; помощь агента в обход недостающего UI считается проблемой.",
        "Каждый оставшийся дефект добавляет задачи исправления, сборки и нового прохода до последующих проверок и DOCS; число циклов не ограничивается.",
        "После перезапуска приложения и гостя настройки сохраняются и подготовка не начинается заново.",
        "Перед повторным испытанием подтвердить сборку/архитектуру гостя, отсутствие предустановленных зависимостей/профиля в Base и версию/происхождение гостевого app; ранее отсутствовавшие данные T001 не считать подтверждёнными."
      ],
      "expected_commit_message": "docs: verify clean macOS guided startup",
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "first-run-onboarding-031",
        "task_id": "T017",
        "role": "implementation"
      }
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
        "T017"
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
        "C001",
        "V001",
        "T008",
        "R001",
        "T009",
        "C002",
        "C003",
        "V002",
        "B002",
        "R002",
        "T014",
        "C004",
        "B003",
        "R003",
        "T015",
        "C005",
        "C006",
        "C007",
        "V003",
        "C008",
        "B004",
        "R004",
        "T016",
        "C009",
        "C010",
        "B005",
        "R005",
        "T017",
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
    },
    {
      "id": "apple-installer-visibility",
      "recorded_at": "2026-09-17T18:45:00Z",
      "text": "Пользователь подтвердил: все клоны созданы до экспериментов. На другом чистом клоне 0.6.35 открыл ChatGPT без Chrome и перезагрузки, вход подтверждён. Следующее препятствие: окно подтверждения установки Apple оказалось под Web Pilot; пользователь поручил исправить. Релиз теперь готовится для проверки этой конкретной проблемы, сетевой дефект не считается устранённым."
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
Revision: 80

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
- [DONE] F001: Проверять готовность чистой системы перед началом работы — Завершено
  - Git Commit: [DONE] feat: check first-run readiness on startup
  - Reference: first-run-onboarding-031 / F001 / implementation
  - Файлы: src/main.mjs, src/preload.cjs, src/ui/progress.mjs, docs/modules/first-run-onboarding.md, docs/CLEAN_INSTALL.md, docs/VERIFICATION.md, docs/architecture/ARCHITECTURE.md, docs/modules/runtime-lifecycle.md
- [DONE] T006: Встроить понятное сопровождение первого запуска — Завершено
  - Git Commit: [DONE] feat: guide users through first startup
  - Reference: first-run-onboarding-031 / T006 / implementation
  - Файлы: src/ui/startup.mjs, src/ui/index.html, src/ui/sidebar.mjs, docs/modules/first-run-onboarding.md, docs/CLEAN_INSTALL.md, docs/VERIFICATION.md, docs/architecture/ARCHITECTURE.md, docs/PRODUCT.md, docs/modules/workspace-sessions.md, docs/WORKSPACE_SETUP.md
- [DONE] T007: Сопроводить вход и первичную настройку подключения — Завершено
  - Git Commit: [DONE] feat: guide initial connection setup
  - Reference: first-run-onboarding-031 / T007 / implementation
  - Файлы: resources/runtime-control/mac-first-run.py, src/mac-runtime.mjs, tests/mac-first-run.test.mjs, docs/modules/first-run-onboarding.md, docs/CLEAN_INSTALL.md, docs/VERIFICATION.md, docs/architecture/ARCHITECTURE.md, docs/modules/runtime-lifecycle.md, docs/CONTEXT_DELIVERY.md, docs/PRODUCT.md
- [DONE] C001: Сохранить работоспособность мастера после отмены и возврата — Завершено
  - Git Commit: [DONE] fix: resume first-run checks after cancelled setup
  - Reference: first-run-onboarding-031 / C001 / implementation
  - Файлы: src/main.mjs, src/startup-readiness.mjs, tests/startup-readiness.test.mjs, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md, docs/modules/first-run-onboarding.md
- [DONE] V001: Проверить мастер в интерфейсе и сценарии отказов — Завершено
  - Git Commit: [DONE] test: verify guided startup and retries
  - Reference: first-run-onboarding-031 / V001 / implementation
  - Файлы: tests/startup-ui.test.mjs, tests/electron-smoke.mjs, src/ui/startup.mjs, docs/VERIFICATION.md, docs/architecture/ARCHITECTURE.md, docs/modules/first-run-onboarding.md
- [DONE] T008: Собрать проверенную macOS-поставку после исправлений — Завершено
  - Git Commit: [DONE] build: package guided macOS first run
  - Reference: first-run-onboarding-031 / T008 / implementation
  - Файлы: package.json, package-lock.json, scripts/release-mac.mjs, docs/modules/first-run-onboarding.md, docs/CLEAN_INSTALL.md, docs/VERIFICATION.md, docs/architecture/ARCHITECTURE.md, docs/RELEASE.md
- [DONE] R001: Обновить документы первой итерации и передать релиз на проверку — Завершено
  - Git Commit: [DONE] docs: deliver first-run iteration for clean testing
  - Reference: first-run-onboarding-031 / R001 / implementation
  - Файлы: docs/modules/first-run-onboarding.md, docs/CLEAN_INSTALL.md, docs/VERIFICATION.md, docs/PRODUCT.md, docs/DECISIONS.md, docs/architecture/ARCHITECTURE.md, docs/RELEASE.md, docs/modules/runtime-lifecycle.md, docs/WORKSPACE_SETUP.md, docs/modules/workspace-sessions.md, docs/CONTEXT_DELIVERY.md, docs/TRANSFER_TO_WINDOWS.md, README.md, docs/WORKFLOW_START.md, docs/architecture/OVERVIEW.md, docs/MODULES.md, docs/DOCUMENTATION_INDEX.md
- [DONE] T009: Зафиксировать повторный запуск 0.6.32 и полученный журнал — Завершено
  - Git Commit: [DONE] docs: record blank first page after macOS retest
  - Reference: first-run-onboarding-031 / T009 / implementation
  - Файлы: docs/modules/first-run-onboarding.md, docs/CLEAN_INSTALL.md, docs/VERIFICATION.md
- [DONE] C002: Записывать загрузку браузера с первого обращения к сайту — Завершено
  - Git Commit: [DONE] fix: capture browser diagnostics before first navigation
  - Reference: first-run-onboarding-031 / C002 / implementation
  - Файлы: src/main.mjs, src/chromium-diagnostics.mjs, tests/electron-smoke.mjs, docs/modules/first-run-onboarding.md, docs/CLEAN_INSTALL.md, docs/VERIFICATION.md, docs/PRODUCT.md, docs/DECISIONS.md, docs/architecture/ARCHITECTURE.md, docs/RELEASE.md, docs/modules/runtime-lifecycle.md, docs/WORKSPACE_SETUP.md, docs/modules/workspace-sessions.md, docs/CONTEXT_DELIVERY.md, docs/TRANSFER_TO_WINDOWS.md, README.md, docs/WORKFLOW_START.md, docs/architecture/OVERVIEW.md, docs/MODULES.md, docs/DOCUMENTATION_INDEX.md
- [DONE] C003: Показывать вход только после появления страницы ChatGPT — Завершено
  - Git Commit: [DONE] fix: guide users when ChatGPT has not opened
  - Reference: first-run-onboarding-031 / C003 / implementation
  - Файлы: src/ui/startup.mjs, src/ui/index.html, tests/startup-ui.test.mjs, docs/modules/first-run-onboarding.md, docs/CLEAN_INSTALL.md, docs/VERIFICATION.md, docs/PRODUCT.md, docs/DECISIONS.md, docs/architecture/ARCHITECTURE.md, docs/RELEASE.md, docs/modules/runtime-lifecycle.md, docs/WORKSPACE_SETUP.md, docs/modules/workspace-sessions.md, docs/CONTEXT_DELIVERY.md, docs/TRANSFER_TO_WINDOWS.md, README.md, docs/WORKFLOW_START.md, docs/architecture/OVERVIEW.md, docs/MODULES.md, docs/DOCUMENTATION_INDEX.md
- [DONE] V002: Проверить ранний журнал и повтор неудачной загрузки — Завершено
  - Git Commit: [DONE] test: verify first navigation failure diagnostics
  - Reference: first-run-onboarding-031 / V002 / implementation
  - Файлы: tests/chromium-diagnostics.test.mjs, tests/electron-smoke.mjs, docs/modules/first-run-onboarding.md, docs/CLEAN_INSTALL.md, docs/VERIFICATION.md, docs/PRODUCT.md, docs/DECISIONS.md, docs/architecture/ARCHITECTURE.md, docs/RELEASE.md, docs/modules/runtime-lifecycle.md, docs/WORKSPACE_SETUP.md, docs/modules/workspace-sessions.md, docs/CONTEXT_DELIVERY.md, docs/TRANSFER_TO_WINDOWS.md, README.md, docs/WORKFLOW_START.md, docs/architecture/OVERVIEW.md, docs/MODULES.md, docs/DOCUMENTATION_INDEX.md
- [DONE] B002: Собрать обе платформы с ранней диагностикой загрузки — Завершено
  - Git Commit: [DONE] build: release early browser diagnostics for both platforms
  - Reference: first-run-onboarding-031 / B002 / implementation
  - Файлы: package.json, package-lock.json, docs/modules/first-run-onboarding.md, docs/CLEAN_INSTALL.md, docs/VERIFICATION.md, docs/PRODUCT.md, docs/DECISIONS.md, docs/architecture/ARCHITECTURE.md, docs/RELEASE.md, docs/modules/runtime-lifecycle.md, docs/WORKSPACE_SETUP.md, docs/modules/workspace-sessions.md, docs/CONTEXT_DELIVERY.md, docs/TRANSFER_TO_WINDOWS.md, README.md, docs/WORKFLOW_START.md, docs/architecture/OVERVIEW.md, docs/MODULES.md, docs/DOCUMENTATION_INDEX.md
- [DONE] R002: Обновить документы и передать диагностический релиз — Завершено
  - Git Commit: [DONE] docs: deliver browser startup diagnostic iteration
  - Reference: first-run-onboarding-031 / R002 / implementation
  - Файлы: docs/modules/first-run-onboarding.md, docs/CLEAN_INSTALL.md, docs/VERIFICATION.md, docs/PRODUCT.md, docs/DECISIONS.md, docs/architecture/ARCHITECTURE.md, docs/RELEASE.md, docs/modules/runtime-lifecycle.md, docs/WORKSPACE_SETUP.md, docs/modules/workspace-sessions.md, docs/CONTEXT_DELIVERY.md, docs/TRANSFER_TO_WINDOWS.md, README.md, docs/WORKFLOW_START.md, docs/architecture/OVERVIEW.md, docs/MODULES.md, docs/DOCUMENTATION_INDEX.md
- [DONE] T014: Зафиксировать повтор 0.6.33 и локализовать ожидание Chromium — Завершено
  - Git Commit: [DONE] docs: record first browser response investigation
  - Reference: first-run-onboarding-031 / T014 / implementation
  - Файлы: docs/modules/first-run-onboarding.md, docs/CLEAN_INSTALL.md, docs/VERIFICATION.md
- [DONE] C004: Ограничить первый запуск браузера и восстановить зависшее соединение — Завершено
  - Git Commit: [DONE] fix: recover stalled initial browser navigation
  - Reference: first-run-onboarding-031 / C004 / implementation
  - Файлы: src/browser-startup.mjs, src/main.mjs, tests/browser-startup.test.mjs, docs/modules/first-run-onboarding.md, docs/CLEAN_INSTALL.md, docs/VERIFICATION.md, docs/PRODUCT.md, docs/DECISIONS.md, docs/architecture/ARCHITECTURE.md, docs/RELEASE.md, docs/modules/runtime-lifecycle.md, docs/WORKSPACE_SETUP.md, docs/modules/workspace-sessions.md, docs/CONTEXT_DELIVERY.md, docs/TRANSFER_TO_WINDOWS.md, README.md, docs/WORKFLOW_START.md, docs/architecture/OVERVIEW.md, docs/MODULES.md, docs/DOCUMENTATION_INDEX.md
- [DONE] B003: Выпустить 0.6.34 для macOS и Windows — Завершено
  - Git Commit: [DONE] build: release bounded initial browser navigation
  - Reference: first-run-onboarding-031 / B003 / implementation
  - Файлы: package.json, package-lock.json, docs/modules/first-run-onboarding.md, docs/CLEAN_INSTALL.md, docs/VERIFICATION.md, docs/PRODUCT.md, docs/DECISIONS.md, docs/architecture/ARCHITECTURE.md, docs/RELEASE.md, docs/modules/runtime-lifecycle.md, docs/WORKSPACE_SETUP.md, docs/modules/workspace-sessions.md, docs/CONTEXT_DELIVERY.md, docs/TRANSFER_TO_WINDOWS.md, README.md, docs/WORKFLOW_START.md, docs/architecture/OVERVIEW.md, docs/MODULES.md, docs/DOCUMENTATION_INDEX.md
- [DONE] R003: Актуализировать документы итерации 0.6.34 — Завершено
  - Git Commit: [DONE] docs: deliver first navigation recovery iteration
  - Reference: first-run-onboarding-031 / R003 / implementation
  - Файлы: docs/modules/first-run-onboarding.md, docs/CLEAN_INSTALL.md, docs/VERIFICATION.md, docs/PRODUCT.md, docs/DECISIONS.md, docs/architecture/ARCHITECTURE.md, docs/RELEASE.md, docs/modules/runtime-lifecycle.md, docs/WORKSPACE_SETUP.md, docs/modules/workspace-sessions.md, docs/CONTEXT_DELIVERY.md, docs/TRANSFER_TO_WINDOWS.md, README.md, docs/WORKFLOW_START.md, docs/architecture/OVERVIEW.md, docs/MODULES.md, docs/DOCUMENTATION_INDEX.md
- [DONE] T015: Зафиксировать повтор 0.6.34 и период отказов после старта — Завершено
  - Git Commit: [DONE] docs: record delayed first navigation findings
  - Reference: first-run-onboarding-031 / T015 / implementation
  - Файлы: docs/modules/first-run-onboarding.md, docs/CLEAN_INSTALL.md, docs/VERIFICATION.md
- [DONE] C005: Проверить один непрерывный запрос до 120 секунд — Завершено
  - Git Commit: [DONE] fix: observe uninterrupted first browser request
  - Reference: first-run-onboarding-031 / C005 / implementation
  - Файлы: src/browser-startup.mjs, tests/browser-startup.test.mjs, src/main.mjs, docs/modules/first-run-onboarding.md, docs/CLEAN_INSTALL.md, docs/VERIFICATION.md, docs/PRODUCT.md, docs/DECISIONS.md, docs/architecture/ARCHITECTURE.md, docs/RELEASE.md, docs/modules/runtime-lifecycle.md, docs/WORKSPACE_SETUP.md, docs/modules/workspace-sessions.md, docs/CONTEXT_DELIVERY.md, docs/TRANSFER_TO_WINDOWS.md, README.md, docs/WORKFLOW_START.md, docs/architecture/OVERVIEW.md, docs/MODULES.md, docs/DOCUMENTATION_INDEX.md
- [DONE] C006: Показывать ожидание и блокировать конкурирующие повторы — Завершено
  - Git Commit: [DONE] fix: guide uninterrupted startup observation
  - Reference: first-run-onboarding-031 / C006 / implementation
  - Файлы: src/ui/startup.mjs, tests/startup-ui.test.mjs, docs/modules/first-run-onboarding.md, docs/CLEAN_INSTALL.md, docs/VERIFICATION.md, docs/PRODUCT.md, docs/DECISIONS.md, docs/architecture/ARCHITECTURE.md, docs/RELEASE.md, docs/modules/runtime-lifecycle.md, docs/WORKSPACE_SETUP.md, docs/modules/workspace-sessions.md, docs/CONTEXT_DELIVERY.md, docs/TRANSFER_TO_WINDOWS.md, README.md, docs/WORKFLOW_START.md, docs/architecture/OVERVIEW.md, docs/MODULES.md, docs/DOCUMENTATION_INDEX.md
- [DONE] C007: Записать сетевые этапы первого запроса штатным netLog — Завершено
  - Git Commit: [DONE] feat: capture first-request network stages
  - Reference: first-run-onboarding-031 / C007 / implementation
  - Файлы: src/startup-network-trace.mjs, tests/startup-network-trace.test.mjs, src/chromium-diagnostics.mjs, docs/modules/first-run-onboarding.md, docs/CLEAN_INSTALL.md, docs/VERIFICATION.md, docs/PRODUCT.md, docs/DECISIONS.md, docs/architecture/ARCHITECTURE.md, docs/RELEASE.md, docs/modules/runtime-lifecycle.md, docs/WORKSPACE_SETUP.md, docs/modules/workspace-sessions.md, docs/CONTEXT_DELIVERY.md, docs/TRANSFER_TO_WINDOWS.md, README.md, docs/WORKFLOW_START.md, docs/architecture/OVERVIEW.md, docs/MODULES.md, docs/DOCUMENTATION_INDEX.md
- [DONE] V003: Проверить сохранение начала отчёта и диагностический первый запуск — Завершено
  - Git Commit: [DONE] test: verify first-request diagnostic iteration
  - Reference: first-run-onboarding-031 / V003 / implementation
  - Файлы: tests/chromium-diagnostics.test.mjs, tests/electron-smoke.mjs, src/main.mjs, docs/modules/first-run-onboarding.md, docs/CLEAN_INSTALL.md, docs/VERIFICATION.md, docs/PRODUCT.md, docs/DECISIONS.md, docs/architecture/ARCHITECTURE.md, docs/RELEASE.md, docs/modules/runtime-lifecycle.md, docs/WORKSPACE_SETUP.md, docs/modules/workspace-sessions.md, docs/CONTEXT_DELIVERY.md, docs/TRANSFER_TO_WINDOWS.md, README.md, docs/WORKFLOW_START.md, docs/architecture/OVERVIEW.md, docs/MODULES.md, docs/DOCUMENTATION_INDEX.md
- [DONE] C008: Исправить ограничение native netLog без изменения sandbox — Завершено
  - Git Commit: [DONE] fix: bound startup netlog in the application
  - Reference: first-run-onboarding-031 / C008 / implementation
  - Файлы: src/startup-network-trace.mjs, tests/startup-network-trace.test.mjs, tests/electron-smoke.mjs, docs/modules/first-run-onboarding.md, docs/CLEAN_INSTALL.md, docs/VERIFICATION.md, docs/PRODUCT.md, docs/DECISIONS.md, docs/architecture/ARCHITECTURE.md, docs/RELEASE.md, docs/modules/runtime-lifecycle.md, docs/WORKSPACE_SETUP.md, docs/modules/workspace-sessions.md, docs/CONTEXT_DELIVERY.md, docs/TRANSFER_TO_WINDOWS.md, README.md, docs/WORKFLOW_START.md, docs/architecture/OVERVIEW.md, docs/MODULES.md, docs/DOCUMENTATION_INDEX.md
- [DONE] B004: Выпустить диагностическую 0.6.35 для обеих платформ — Завершено
  - Git Commit: [DONE] build: release uninterrupted startup diagnostics
  - Reference: first-run-onboarding-031 / B004 / implementation
  - Файлы: package.json, package-lock.json, docs/modules/first-run-onboarding.md, docs/CLEAN_INSTALL.md, docs/VERIFICATION.md, docs/PRODUCT.md, docs/DECISIONS.md, docs/architecture/ARCHITECTURE.md, docs/RELEASE.md, docs/modules/runtime-lifecycle.md, docs/WORKSPACE_SETUP.md, docs/modules/workspace-sessions.md, docs/CONTEXT_DELIVERY.md, docs/TRANSFER_TO_WINDOWS.md, README.md, docs/WORKFLOW_START.md, docs/architecture/OVERVIEW.md, docs/MODULES.md, docs/DOCUMENTATION_INDEX.md
- [DONE] R004: Актуализировать документы и инструкции повторной проверки — Завершено
  - Git Commit: [DONE] docs: deliver uninterrupted startup check
  - Reference: first-run-onboarding-031 / R004 / implementation
  - Файлы: docs/modules/first-run-onboarding.md, docs/CLEAN_INSTALL.md, docs/VERIFICATION.md, docs/PRODUCT.md, docs/DECISIONS.md, docs/architecture/ARCHITECTURE.md, docs/RELEASE.md, docs/modules/runtime-lifecycle.md, docs/WORKSPACE_SETUP.md, docs/modules/workspace-sessions.md, docs/CONTEXT_DELIVERY.md, docs/TRANSFER_TO_WINDOWS.md, README.md, docs/WORKFLOW_START.md, docs/architecture/OVERVIEW.md, docs/MODULES.md, docs/DOCUMENTATION_INDEX.md
- [DONE] T016: Зафиксировать два отказа 0.6.35 и сравнение начальных URL — Завершено
  - Git Commit: [DONE] docs: record repeated startup timeout and login route probes
  - Reference: first-run-onboarding-031 / T016 / implementation
  - Файлы: docs/modules/first-run-onboarding.md, docs/CLEAN_INSTALL.md, docs/VERIFICATION.md
- [DONE] C009: Открывать страницу входа напрямую при запуске без проекта — Завершено
  - Git Commit: [DONE] fix: open the sign-in page directly during onboarding
  - Reference: first-run-onboarding-031 / C009 / implementation
  - Файлы: src/chatgpt-experience.mjs, src/main.mjs, tests/electron-smoke.mjs, docs/modules/first-run-onboarding.md, docs/CLEAN_INSTALL.md, docs/VERIFICATION.md, docs/PRODUCT.md, docs/DECISIONS.md, docs/architecture/ARCHITECTURE.md, docs/RELEASE.md, docs/modules/runtime-lifecycle.md, docs/WORKSPACE_SETUP.md, docs/modules/workspace-sessions.md, docs/CONTEXT_DELIVERY.md, docs/TRANSFER_TO_WINDOWS.md, README.md, docs/WORKFLOW_START.md, docs/architecture/OVERVIEW.md, docs/MODULES.md, docs/DOCUMENTATION_INDEX.md
- [DONE] C010: Показывать установщик Apple поверх Web Pilot — Завершено
  - Git Commit: [DONE] fix: bring Apple command line tools installer to front
  - Reference: first-run-onboarding-031 / C010 / implementation
  - Файлы: src/startup-readiness.mjs, tests/startup-readiness.test.mjs, docs/modules/first-run-onboarding.md, docs/CLEAN_INSTALL.md, docs/VERIFICATION.md, docs/architecture/ARCHITECTURE.md, docs/DECISIONS.md
- [TODO] B005: Собрать 0.6.36 с исправлением показа установщика — Ожидает
  - Git Commit: [PENDING] build: release visible Apple installer handoff
  - Reference: first-run-onboarding-031 / B005 / implementation
  - Файлы: package.json, package-lock.json, docs/modules/first-run-onboarding.md, docs/CLEAN_INSTALL.md, docs/VERIFICATION.md, docs/PRODUCT.md, docs/DECISIONS.md, docs/architecture/ARCHITECTURE.md, docs/RELEASE.md, docs/modules/runtime-lifecycle.md, docs/WORKSPACE_SETUP.md, docs/modules/workspace-sessions.md, docs/CONTEXT_DELIVERY.md, docs/TRANSFER_TO_WINDOWS.md, README.md, docs/WORKFLOW_START.md, docs/architecture/OVERVIEW.md, docs/MODULES.md, docs/DOCUMENTATION_INDEX.md
- [TODO] R005: Обновить документы и передать проверку 0.6.36 — Ожидает
  - Git Commit: [PENDING] docs: deliver installer visibility check
  - Reference: first-run-onboarding-031 / R005 / implementation
  - Файлы: docs/modules/first-run-onboarding.md, docs/CLEAN_INSTALL.md, docs/VERIFICATION.md, docs/PRODUCT.md, docs/DECISIONS.md, docs/architecture/ARCHITECTURE.md, docs/RELEASE.md, docs/modules/runtime-lifecycle.md, docs/WORKSPACE_SETUP.md, docs/modules/workspace-sessions.md, docs/CONTEXT_DELIVERY.md, docs/TRANSFER_TO_WINDOWS.md, README.md, docs/WORKFLOW_START.md, docs/architecture/OVERVIEW.md, docs/MODULES.md, docs/DOCUMENTATION_INDEX.md
- [TODO] T017: Проверить показ установщика и полный чистый путь macOS — Ожидает
  - Git Commit: [PENDING] docs: verify clean macOS guided startup
  - Reference: first-run-onboarding-031 / T017 / implementation
  - Файлы: docs/modules/first-run-onboarding.md, docs/CLEAN_INSTALL.md, docs/VERIFICATION.md, docs/PRODUCT.md, docs/DECISIONS.md, docs/architecture/ARCHITECTURE.md, docs/RELEASE.md, docs/modules/runtime-lifecycle.md, docs/WORKSPACE_SETUP.md, docs/modules/workspace-sessions.md, docs/CONTEXT_DELIVERY.md, docs/TRANSFER_TO_WINDOWS.md, README.md, docs/WORKFLOW_START.md, docs/architecture/OVERVIEW.md, docs/MODULES.md, docs/DOCUMENTATION_INDEX.md
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
