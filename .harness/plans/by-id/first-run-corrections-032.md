# Активный план — Project Web Pilot

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 39,
  "project_id": "cf944136-d1fc-4bd5-9ea0-e46d1fe230e7",
  "project_name": "Project Web Pilot",
  "scope_id": "first-run-corrections-032",
  "execution_scope_status": "ACTIVE",
  "delivery_status": "IN_PROGRESS",
  "objective": "Довести интерфейс первого запуска и создания проекта по замечаниям после успешной чистой проверки 0.6.38; выпустить 0.6.39.",
  "acceptance_criteria": [
    "Первый запуск 0.6.38 принят пользователем на абсолютно чистой macOS.",
    "Устранены повтор плана, неясные и лишние шаги туннеля/плагина/создания первого проекта.",
    "0.6.39 собрана и проверена для пользовательского повтора."
  ],
  "approved_scope": {
    "functional_paths": [
      "resources/runtime-control/mac-first-run.py",
      "tests/mac-first-run.test.mjs",
      "src/mac-runtime.mjs",
      "tests/mac-runtime.test.mjs",
      "src/startup-readiness.mjs",
      "tests/startup-readiness.test.mjs",
      "src/ui/startup.mjs",
      "tests/startup-ui.test.mjs",
      "package.json",
      "package-lock.json",
      "src/ui/sidebar.mjs",
      "tests/electron-smoke.mjs",
      "src/ui/index.html",
      "src/main.mjs",
      "src/preload.cjs",
      "src/ui/workspace-setup.mjs",
      "tests/project-doctor-ui.test.mjs",
      "src/tunnel-clipboard.mjs",
      "tests/tunnel-clipboard.test.mjs"
    ],
    "documentation_paths": [
      "docs/modules/first-run-onboarding.md",
      "docs/architecture/ARCHITECTURE.md",
      "docs/VERIFICATION.md",
      "AGENTS.md",
      "README.md",
      "docs/WORKFLOW_START.md",
      "docs/PRODUCT.md",
      "docs/DECISIONS.md",
      "docs/architecture/OVERVIEW.md",
      "docs/MODULES.md",
      "docs/DOCUMENTATION_INDEX.md",
      "docs/CLEAN_INSTALL.md",
      "docs/RELEASE.md",
      "docs/TRANSFER_TO_WINDOWS.md",
      "docs/modules/runtime-lifecycle.md",
      "docs/WORKSPACE_SETUP.md",
      "docs/CONTEXT_DELIVERY.md"
    ],
    "max_functional_files_per_task": 3
  },
  "baseline_commit": "de661a037741e510c5742bb46f267438cf9bf6bd",
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
        "scope_id": "first-run-corrections-032",
        "task_id": "T001",
        "role": "implementation"
      },
      "dependencies": [],
      "functional_paths": [
        "resources/runtime-control/mac-first-run.py",
        "tests/mac-first-run.test.mjs"
      ],
      "documentation_paths": [
        "docs/modules/first-run-onboarding.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "suite"
      ],
      "id": "T001",
      "title": "Исправить русские системные окна ввода туннеля",
      "why": "Исправить русские системные окна ввода туннеля",
      "acceptance_criteria": [
        "Оба реально сформированных AppleScript проходят системный компилятор, включая скрытый ключ.",
        "Отмена не сохраняет данные; отказ окна отделён от неверных значений; секреты не выводятся."
      ],
      "expected_commit_message": "fix: preserve Unicode in native tunnel prompts"
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "first-run-corrections-032",
        "task_id": "T002",
        "role": "implementation"
      },
      "dependencies": [
        "T001"
      ],
      "functional_paths": [
        "src/mac-runtime.mjs",
        "tests/mac-runtime.test.mjs"
      ],
      "documentation_paths": [
        "docs/modules/first-run-onboarding.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "suite"
      ],
      "id": "T002",
      "title": "Показывать точную причину отказа настройки подключения",
      "why": "Показывать точную причину отказа настройки подключения",
      "acceptance_criteria": [
        "Известные безопасные коды окна, данных и сохранения различаются.",
        "Неизвестные stderr и ключи не попадают в UI; повтор и отмена сохраняются."
      ],
      "expected_commit_message": "fix: distinguish tunnel prompt and save failures"
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "first-run-corrections-032",
        "task_id": "T003",
        "role": "implementation"
      },
      "dependencies": [
        "T002"
      ],
      "functional_paths": [
        "src/startup-readiness.mjs",
        "tests/startup-readiness.test.mjs"
      ],
      "documentation_paths": [
        "docs/modules/first-run-onboarding.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "suite"
      ],
      "id": "T003",
      "title": "Проверять завершение установки Apple автоматически",
      "why": "Проверять завершение установки Apple автоматически",
      "acceptance_criteria": [
        "Принятый запрос установки исключает повторный запуск, включая отказ показа окна.",
        "Ограниченный последовательный опрос проверяет Git, отменяется при dispose и не запускает подготовку автоматически.",
        "После подтверждённого Git остаётся явный следующий шаг проверки и подготовки."
      ],
      "expected_commit_message": "fix: observe Apple component installation readiness"
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "first-run-corrections-032",
        "task_id": "T004",
        "role": "implementation"
      },
      "dependencies": [
        "T003"
      ],
      "functional_paths": [
        "src/ui/startup.mjs",
        "tests/startup-ui.test.mjs"
      ],
      "documentation_paths": [
        "docs/modules/first-run-onboarding.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "suite",
        "electron-smoke"
      ],
      "id": "T004",
      "title": "Скрывать повторную установку Apple и показывать следующий шаг",
      "why": "Скрывать повторную установку Apple и показывать следующий шаг",
      "acceptance_criteria": [
        "После запуска установки и при готовом Git кнопка установки скрыта и недоступна.",
        "Состояние ожидания и переход Проверить и продолжить соответствуют реальной готовности."
      ],
      "expected_commit_message": "fix: keep Apple installer action out of the next step"
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "first-run-corrections-032",
        "task_id": "T005",
        "role": "implementation"
      },
      "dependencies": [
        "T004"
      ],
      "functional_paths": [
        "package.json",
        "package-lock.json"
      ],
      "documentation_paths": [
        "docs/modules/first-run-onboarding.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md",
        "docs/RELEASE.md",
        "docs/TRANSFER_TO_WINDOWS.md"
      ],
      "verification_ids": [
        "suite",
        "electron-smoke"
      ],
      "id": "T005",
      "title": "Собрать и проверить релиз 0.6.38",
      "why": "Собрать и проверить релиз 0.6.38",
      "acceptance_criteria": [
        "Собраны macOS arm64 и Windows x64, постоянный app обновлён с сохранением identity.",
        "Сверены source, packaged resources, версии и ZIP; проверены оба packaged AppleScript.",
        "Готовые ZIP и инструкция для чистого клона находятся в Downloads/WebPilot-0.6.38."
      ],
      "expected_commit_message": "build: release first-run prompt and Apple readiness fixes"
    },
    {
      "id": "U001",
      "title": "Зафиксировать успешный чистый запуск и контракт интерфейсных исправлений",
      "why": "Зафиксировать успешный чистый запуск и контракт интерфейсных исправлений",
      "dependencies": [
        "T005"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/modules/first-run-onboarding.md",
        "docs/WORKSPACE_SETUP.md",
        "docs/VERIFICATION.md",
        "docs/CLEAN_INSTALL.md",
        "docs/MODULES.md"
      ],
      "acceptance_criteria": [
        "Приёмка 0.6.38 зафиксирована по сообщению пользователя и скриншотам.",
        "Замечания сопоставлены с First Run, Workspace Setup и Workspace & Sessions."
      ],
      "verification_ids": [],
      "expected_commit_message": "fix: record clean macOS acceptance and onboarding UI contract",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "first-run-corrections-032",
        "task_id": "U001",
        "role": "implementation"
      }
    },
    {
      "id": "U002",
      "title": "Убрать повтор «План ещё не создан»",
      "why": "Убрать повтор «План ещё не создан»",
      "dependencies": [
        "U001"
      ],
      "functional_paths": [
        "src/ui/sidebar.mjs",
        "tests/electron-smoke.mjs"
      ],
      "documentation_paths": [
        "docs/modules/first-run-onboarding.md",
        "docs/WORKSPACE_SETUP.md",
        "docs/VERIFICATION.md",
        "docs/architecture/ARCHITECTURE.md"
      ],
      "acceptance_criteria": [
        "В NONE одна видимая строка; состояние настоящего плана восстанавливает заголовок."
      ],
      "verification_ids": [
        "suite",
        "electron-smoke"
      ],
      "expected_commit_message": "fix: remove duplicate empty plan label",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "first-run-corrections-032",
        "task_id": "U002",
        "role": "implementation"
      }
    },
    {
      "id": "A001",
      "title": "Принимать данные туннеля через защищённый канал worker",
      "why": "accept tunnel credentials through private worker stdin",
      "dependencies": [
        "U002"
      ],
      "functional_paths": [
        "resources/runtime-control/mac-first-run.py",
        "tests/mac-first-run.test.mjs"
      ],
      "documentation_paths": [
        "docs/modules/first-run-onboarding.md",
        "docs/WORKSPACE_SETUP.md",
        "docs/VERIFICATION.md",
        "docs/architecture/ARCHITECTURE.md"
      ],
      "acceptance_criteria": [
        "JSON stdin ограничен; секрет не попадает в argv/environment/stdout/errors.",
        "Оба значения применяются без диалогов; ручной ввод и отмена сохранены."
      ],
      "verification_ids": [
        "suite"
      ],
      "expected_commit_message": "feat: accept tunnel credentials through private worker stdin",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "first-run-corrections-032",
        "task_id": "A001",
        "role": "implementation"
      }
    },
    {
      "id": "A002",
      "title": "Передавать скопированные данные в существующий runtime",
      "why": "pass clipboard credentials to the native runtime facade",
      "dependencies": [
        "A001"
      ],
      "functional_paths": [
        "src/mac-runtime.mjs",
        "tests/mac-runtime.test.mjs"
      ],
      "documentation_paths": [
        "docs/modules/first-run-onboarding.md",
        "docs/WORKSPACE_SETUP.md",
        "docs/VERIFICATION.md",
        "docs/architecture/ARCHITECTURE.md"
      ],
      "acceptance_criteria": [
        "Credentials идут только в stdin дочернего процесса; ошибки allowlist."
      ],
      "verification_ids": [
        "suite"
      ],
      "expected_commit_message": "feat: pass clipboard credentials to the native runtime facade",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "first-run-corrections-032",
        "task_id": "A002",
        "role": "implementation"
      }
    },
    {
      "id": "A003",
      "title": "Распознавать ID и ключ в буфере на шаге настройки",
      "why": "recognize tunnel clipboard changes within onboarding",
      "dependencies": [
        "A002"
      ],
      "functional_paths": [
        "src/tunnel-clipboard.mjs",
        "tests/tunnel-clipboard.test.mjs"
      ],
      "documentation_paths": [
        "docs/modules/first-run-onboarding.md",
        "docs/WORKSPACE_SETUP.md",
        "docs/VERIFICATION.md",
        "docs/architecture/ARCHITECTURE.md"
      ],
      "acceptance_criteria": [
        "ID и ключ распознаются последовательно; старый буфер при активации игнорируется.",
        "Ключ не хранится в состоянии/renderer; закрытие шага прекращает чтение.",
        "Повтор не запускает вторую настройку; ошибка позволяет новое копирование."
      ],
      "verification_ids": [
        "suite"
      ],
      "expected_commit_message": "feat: recognize tunnel clipboard changes within onboarding",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "first-run-corrections-032",
        "task_id": "A003",
        "role": "implementation"
      }
    },
    {
      "id": "A004",
      "title": "Связать автоматическое подключение с готовностью и закрытием мастера",
      "why": "connect clipboard onboarding to readiness and lifecycle",
      "dependencies": [
        "A003"
      ],
      "functional_paths": [
        "src/main.mjs",
        "src/startup-readiness.mjs",
        "tests/startup-readiness.test.mjs"
      ],
      "documentation_paths": [
        "docs/modules/first-run-onboarding.md",
        "docs/WORKSPACE_SETUP.md",
        "docs/VERIFICATION.md",
        "docs/architecture/ARCHITECTURE.md"
      ],
      "acceptance_criteria": [
        "Монитор работает только в открытом шаге подключения, после входа и готовности компонентов.",
        "Успех проверяет реально запущенный tunnel; ручной ввод доступен."
      ],
      "verification_ids": [
        "suite"
      ],
      "expected_commit_message": "feat: connect clipboard onboarding to readiness and lifecycle",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "first-run-corrections-032",
        "task_id": "A004",
        "role": "implementation"
      }
    },
    {
      "id": "U003",
      "title": "Сделать шаги туннеля последовательными и объяснить копирование",
      "why": "Сделать шаги туннеля последовательными и объяснить копирование",
      "dependencies": [
        "A004"
      ],
      "functional_paths": [
        "src/ui/index.html",
        "src/ui/startup.mjs",
        "tests/startup-ui.test.mjs"
      ],
      "documentation_paths": [
        "docs/modules/first-run-onboarding.md",
        "docs/WORKSPACE_SETUP.md",
        "docs/VERIFICATION.md",
        "docs/architecture/ARCHITECTURE.md"
      ],
      "acceptance_criteria": [
        "Инструкции объясняют создание ID/ключа и Command C/V или Ctrl C/V.",
        "Шаги сменяются по автоматически распознанным данным и результату подключения, без кнопок подтверждения.",
        "Ручной ввод остаётся резервом; ключ не попадает в renderer."
      ],
      "verification_ids": [
        "suite"
      ],
      "expected_commit_message": "fix: guide tunnel setup through completed steps",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "first-run-corrections-032",
        "task_id": "U003",
        "role": "implementation"
      }
    },
    {
      "id": "U004",
      "title": "Показывать добавление плагина как помощь по необходимости",
      "why": "Показывать добавление плагина как помощь по необходимости",
      "dependencies": [
        "U003"
      ],
      "functional_paths": [
        "src/ui/index.html",
        "tests/startup-ui.test.mjs"
      ],
      "documentation_paths": [
        "docs/modules/first-run-onboarding.md",
        "docs/WORKSPACE_SETUP.md",
        "docs/VERIFICATION.md",
        "docs/architecture/ARCHITECTURE.md"
      ],
      "acceptance_criteria": [
        "Создание первого проекта — основное действие; подробности Plugins свернуты.",
        "Существующий плагин не предлагается создавать повторно; его связь с новым туннелем не объявляется проверенной по одному названию."
      ],
      "verification_ids": [
        "suite"
      ],
      "expected_commit_message": "fix: make plugin setup help conditional",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "first-run-corrections-032",
        "task_id": "U004",
        "role": "implementation"
      }
    },
    {
      "id": "U005",
      "title": "Передавать выбранный Chat или Work вместе с применением проекта",
      "why": "Передавать выбранный Chat или Work вместе с применением проекта",
      "dependencies": [
        "U004"
      ],
      "functional_paths": [
        "src/main.mjs",
        "src/preload.cjs"
      ],
      "documentation_paths": [
        "docs/modules/first-run-onboarding.md",
        "docs/WORKSPACE_SETUP.md",
        "docs/VERIFICATION.md",
        "docs/architecture/ARCHITECTURE.md"
      ],
      "acceptance_criteria": [
        "Один IPC передаёт token, identity и experience; неверный режим отклоняется до записи.",
        "Существующий preview fingerprint и блокировка действий сохраняются."
      ],
      "verification_ids": [
        "suite"
      ],
      "expected_commit_message": "fix: accept first session mode in one setup operation",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "first-run-corrections-032",
        "task_id": "U005",
        "role": "implementation"
      }
    },
    {
      "id": "U006",
      "title": "Создавать первую сессию одним нажатием и показывать диагностику по причине",
      "why": "Создавать первую сессию одним нажатием и показывать диагностику по причине",
      "dependencies": [
        "U005"
      ],
      "functional_paths": [
        "src/ui/workspace-setup.mjs",
        "tests/electron-smoke.mjs",
        "tests/project-doctor-ui.test.mjs"
      ],
      "documentation_paths": [
        "docs/modules/first-run-onboarding.md",
        "docs/WORKSPACE_SETUP.md",
        "docs/VERIFICATION.md",
        "docs/architecture/ARCHITECTURE.md"
      ],
      "acceptance_criteria": [
        "Chat/Work сразу применяет подтверждённый preview; повторная кнопка отсутствует.",
        "Успешный preview не содержит Доктора/повторной проверки; ошибка сохраняет нужные действия.",
        "Недостающая Git identity блокирует оба режима; повторные клики не создают вторую сессию."
      ],
      "verification_ids": [
        "suite",
        "electron-smoke"
      ],
      "expected_commit_message": "fix: create first session directly from Chat or Work",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "first-run-corrections-032",
        "task_id": "U006",
        "role": "implementation"
      }
    },
    {
      "id": "A005",
      "title": "Сохранять готовность компонентов после отказа туннеля",
      "why": "Воспроизведено: prepareRuntime бросает ошибку туннеля, а работающий MCP отображается как неготовый; автоматический ввод теряет свой шаг.",
      "dependencies": [
        "A004",
        "U003"
      ],
      "functional_paths": [
        "src/startup-readiness.mjs",
        "src/ui/startup.mjs",
        "tests/startup-readiness.test.mjs"
      ],
      "documentation_paths": [
        "docs/modules/first-run-onboarding.md",
        "docs/WORKSPACE_SETUP.md",
        "docs/VERIFICATION.md",
        "docs/architecture/ARCHITECTURE.md"
      ],
      "acceptance_criteria": [
        "После отказа запуска повторно прочитать состояние, не объявлять туннель готовым; рабочий MCP сохраняет доступность ввода и полученный ID.",
        "Неуспех дополнительной проверки не объявляет готовность; сообщение автоматического ввода имеет приоритет над общей ошибкой.",
        "Регрессия связывает реальные facade readiness и clipboard на fixtures."
      ],
      "verification_ids": [
        "suite"
      ],
      "expected_commit_message": "fix: preserve local readiness after tunnel connection failure",
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "first-run-corrections-032",
        "task_id": "A005",
        "role": "implementation"
      }
    },
    {
      "id": "U007",
      "title": "Собрать и проверить 0.6.39 для пользовательского повтора",
      "why": "Собрать и проверить 0.6.39 для пользовательского повтора",
      "dependencies": [
        "U006",
        "A005"
      ],
      "functional_paths": [
        "package.json",
        "package-lock.json"
      ],
      "documentation_paths": [
        "docs/modules/first-run-onboarding.md",
        "docs/WORKSPACE_SETUP.md",
        "docs/VERIFICATION.md",
        "docs/RELEASE.md",
        "docs/TRANSFER_TO_WINDOWS.md",
        "docs/architecture/ARCHITECTURE.md"
      ],
      "acceptance_criteria": [
        "Собраны обе платформы, исходники и ресурсы совпадают, ZIP проверены.",
        "Постоянный app обновлён с сохранением identity; доставка в Downloads/WebPilot-0.6.39.",
        "Новые UI состояния проверены в изолированном Electron."
      ],
      "verification_ids": [
        "suite",
        "electron-smoke"
      ],
      "expected_commit_message": "fix: release onboarding usability improvements 0.6.39",
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "first-run-corrections-032",
        "task_id": "U007",
        "role": "implementation"
      }
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "first-run-corrections-032",
        "task_id": "DOCS",
        "role": "implementation",
        "iteration": 2
      },
      "dependencies": [
        "T001",
        "T002",
        "T003",
        "T004",
        "T005",
        "U001",
        "U002",
        "A001",
        "A002",
        "A003",
        "A004",
        "U003",
        "U004",
        "U005",
        "U006",
        "A005",
        "U007"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/modules/first-run-onboarding.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md",
        "AGENTS.md",
        "README.md",
        "docs/WORKFLOW_START.md",
        "docs/PRODUCT.md",
        "docs/DECISIONS.md",
        "docs/architecture/OVERVIEW.md",
        "docs/MODULES.md",
        "docs/DOCUMENTATION_INDEX.md",
        "docs/CLEAN_INSTALL.md",
        "docs/RELEASE.md",
        "docs/TRANSFER_TO_WINDOWS.md",
        "docs/modules/runtime-lifecycle.md",
        "docs/WORKSPACE_SETUP.md",
        "docs/CONTEXT_DELIVERY.md"
      ],
      "verification_ids": [],
      "id": "DOCS",
      "title": "Актуализация всех документов проекта",
      "why": "Зафиксировать текущий релиз и подтверждённые границы пользовательской проверки.",
      "acceptance_criteria": [
        "Документы по индексу просмотрены, устаревшие сведения исправлены.",
        "Успех компонентов в Test macOS 02, дефект фокуса Apple и ожидаемый чистый повтор 0.6.38 указаны раздельно.",
        "План прежней сессии сохранён; текущий план завершается без архивирования."
      ],
      "expected_commit_message": "docs: deliver first-run correction release 0.6.38"
    }
  ],
  "blocked_reason": null,
  "user_decisions": [
    {
      "id": "27fd19a3-6f82-4f02-a708-d2bfa92a67ac",
      "text": "18.09.2026 пользователь поручил добавить микрозадачу, исправить ошибку окна ввода туннеля и собрать новый релиз; отдельным сообщением включил оставшуюся кнопку установки Apple. Эта новая сессия имела NONE; исправления продолжают контракт first-run-onboarding-031 в собственном плане без изменения владельца прежнего плана.",
      "recorded_at": "2026-09-18T06:26:33.094Z"
    },
    {
      "id": "9d277bf8-8257-49bd-8f04-f42e76ab1be8",
      "text": "18.09.2026 пользователь подтвердил полный первый запуск 0.6.38 на абсолютно чистой macOS без ошибок. Затем поручил добавить в текущий план и выполнить UI-микрозадачи по четырём скриншотам: дубль NONE, последовательные шаги туннеля и копирование, необязательное добавление уже имеющегося плагина, немедленное создание по Chat/Work, диагностические кнопки только по проблеме; собрать новый релиз.",
      "recorded_at": "2026-09-18T07:15:23.626662+00:00"
    },
    {
      "id": "773ad7d2-ee46-4c2e-a960-1fb7463d19aa",
      "text": "Пользователь отверг подтверждения завершения: всё автоматизируемое должно происходить автоматически. Прямо разрешил определять скопированные ID/ключ из буфера, распознавать tunnel_ и подставлять данные, переходя дальше без вопросов. Чтение ограничено активным этапом подключения; ключ не публикуется в renderer/логи.",
      "recorded_at": "2026-09-18T07:16:47.960846+00:00"
    }
  ],
  "owner_session_id": "01a0b318-cc66-7743-9de7-696f05fff6e6",
  "prepared_in_session_id": null
}
```
<!-- workflow-state:end -->

## Состояние

Execution Scope Status: ACTIVE
Delivery Status: IN_PROGRESS
Scope: first-run-corrections-032
Current Task: нет
Revision: 39

## Цель

Довести интерфейс первого запуска и создания проекта по замечаниям после успешной чистой проверки 0.6.38; выпустить 0.6.39.

## Критерии приёмки

- Первый запуск 0.6.38 принят пользователем на абсолютно чистой macOS.
- Устранены повтор плана, неясные и лишние шаги туннеля/плагина/создания первого проекта.
- 0.6.39 собрана и проверена для пользовательского повтора.

## Микрозадачи

- [DONE] T001: Исправить русские системные окна ввода туннеля — Завершено
  - Git Commit: [DONE] fix: preserve Unicode in native tunnel prompts
  - Reference: first-run-corrections-032 / T001 / implementation
  - Файлы: resources/runtime-control/mac-first-run.py, tests/mac-first-run.test.mjs, docs/modules/first-run-onboarding.md, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md
- [DONE] T002: Показывать точную причину отказа настройки подключения — Завершено
  - Git Commit: [DONE] fix: distinguish tunnel prompt and save failures
  - Reference: first-run-corrections-032 / T002 / implementation
  - Файлы: src/mac-runtime.mjs, tests/mac-runtime.test.mjs, docs/modules/first-run-onboarding.md, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md
- [DONE] T003: Проверять завершение установки Apple автоматически — Завершено
  - Git Commit: [DONE] fix: observe Apple component installation readiness
  - Reference: first-run-corrections-032 / T003 / implementation
  - Файлы: src/startup-readiness.mjs, tests/startup-readiness.test.mjs, docs/modules/first-run-onboarding.md, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md
- [DONE] T004: Скрывать повторную установку Apple и показывать следующий шаг — Завершено
  - Git Commit: [DONE] fix: keep Apple installer action out of the next step
  - Reference: first-run-corrections-032 / T004 / implementation
  - Файлы: src/ui/startup.mjs, tests/startup-ui.test.mjs, docs/modules/first-run-onboarding.md, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md
- [DONE] T005: Собрать и проверить релиз 0.6.38 — Завершено
  - Git Commit: [DONE] build: release first-run prompt and Apple readiness fixes
  - Reference: first-run-corrections-032 / T005 / implementation
  - Файлы: package.json, package-lock.json, docs/modules/first-run-onboarding.md, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md, docs/RELEASE.md, docs/TRANSFER_TO_WINDOWS.md
- [DONE] U001: Зафиксировать успешный чистый запуск и контракт интерфейсных исправлений — Завершено
  - Git Commit: [DONE] fix: record clean macOS acceptance and onboarding UI contract
  - Reference: first-run-corrections-032 / U001 / implementation
  - Файлы: docs/modules/first-run-onboarding.md, docs/WORKSPACE_SETUP.md, docs/VERIFICATION.md, docs/CLEAN_INSTALL.md, docs/MODULES.md
- [DONE] U002: Убрать повтор «План ещё не создан» — Завершено
  - Git Commit: [DONE] fix: remove duplicate empty plan label
  - Reference: first-run-corrections-032 / U002 / implementation
  - Файлы: src/ui/sidebar.mjs, tests/electron-smoke.mjs, docs/modules/first-run-onboarding.md, docs/WORKSPACE_SETUP.md, docs/VERIFICATION.md, docs/architecture/ARCHITECTURE.md
- [DONE] A001: Принимать данные туннеля через защищённый канал worker — Завершено
  - Git Commit: [DONE] feat: accept tunnel credentials through private worker stdin
  - Reference: first-run-corrections-032 / A001 / implementation
  - Файлы: resources/runtime-control/mac-first-run.py, tests/mac-first-run.test.mjs, docs/modules/first-run-onboarding.md, docs/WORKSPACE_SETUP.md, docs/VERIFICATION.md, docs/architecture/ARCHITECTURE.md
- [DONE] A002: Передавать скопированные данные в существующий runtime — Завершено
  - Git Commit: [DONE] feat: pass clipboard credentials to the native runtime facade
  - Reference: first-run-corrections-032 / A002 / implementation
  - Файлы: src/mac-runtime.mjs, tests/mac-runtime.test.mjs, docs/modules/first-run-onboarding.md, docs/WORKSPACE_SETUP.md, docs/VERIFICATION.md, docs/architecture/ARCHITECTURE.md
- [DONE] A003: Распознавать ID и ключ в буфере на шаге настройки — Завершено
  - Git Commit: [DONE] feat: recognize tunnel clipboard changes within onboarding
  - Reference: first-run-corrections-032 / A003 / implementation
  - Файлы: src/tunnel-clipboard.mjs, tests/tunnel-clipboard.test.mjs, docs/modules/first-run-onboarding.md, docs/WORKSPACE_SETUP.md, docs/VERIFICATION.md, docs/architecture/ARCHITECTURE.md
- [DONE] A004: Связать автоматическое подключение с готовностью и закрытием мастера — Завершено
  - Git Commit: [DONE] feat: connect clipboard onboarding to readiness and lifecycle
  - Reference: first-run-corrections-032 / A004 / implementation
  - Файлы: src/main.mjs, src/startup-readiness.mjs, tests/startup-readiness.test.mjs, docs/modules/first-run-onboarding.md, docs/WORKSPACE_SETUP.md, docs/VERIFICATION.md, docs/architecture/ARCHITECTURE.md
- [DONE] U003: Сделать шаги туннеля последовательными и объяснить копирование — Завершено
  - Git Commit: [DONE] fix: guide tunnel setup through completed steps
  - Reference: first-run-corrections-032 / U003 / implementation
  - Файлы: src/ui/index.html, src/ui/startup.mjs, tests/startup-ui.test.mjs, docs/modules/first-run-onboarding.md, docs/WORKSPACE_SETUP.md, docs/VERIFICATION.md, docs/architecture/ARCHITECTURE.md
- [DONE] U004: Показывать добавление плагина как помощь по необходимости — Завершено
  - Git Commit: [DONE] fix: make plugin setup help conditional
  - Reference: first-run-corrections-032 / U004 / implementation
  - Файлы: src/ui/index.html, tests/startup-ui.test.mjs, docs/modules/first-run-onboarding.md, docs/WORKSPACE_SETUP.md, docs/VERIFICATION.md, docs/architecture/ARCHITECTURE.md
- [DONE] U005: Передавать выбранный Chat или Work вместе с применением проекта — Завершено
  - Git Commit: [DONE] fix: accept first session mode in one setup operation
  - Reference: first-run-corrections-032 / U005 / implementation
  - Файлы: src/main.mjs, src/preload.cjs, docs/modules/first-run-onboarding.md, docs/WORKSPACE_SETUP.md, docs/VERIFICATION.md, docs/architecture/ARCHITECTURE.md
- [DONE] U006: Создавать первую сессию одним нажатием и показывать диагностику по причине — Завершено
  - Git Commit: [DONE] fix: create first session directly from Chat or Work
  - Reference: first-run-corrections-032 / U006 / implementation
  - Файлы: src/ui/workspace-setup.mjs, tests/electron-smoke.mjs, tests/project-doctor-ui.test.mjs, docs/modules/first-run-onboarding.md, docs/WORKSPACE_SETUP.md, docs/VERIFICATION.md, docs/architecture/ARCHITECTURE.md
- [TODO] A005: Сохранять готовность компонентов после отказа туннеля — Ожидает
  - Git Commit: [PENDING] fix: preserve local readiness after tunnel connection failure
  - Reference: first-run-corrections-032 / A005 / implementation
  - Файлы: src/startup-readiness.mjs, src/ui/startup.mjs, tests/startup-readiness.test.mjs, docs/modules/first-run-onboarding.md, docs/WORKSPACE_SETUP.md, docs/VERIFICATION.md, docs/architecture/ARCHITECTURE.md
- [TODO] U007: Собрать и проверить 0.6.39 для пользовательского повтора — Ожидает
  - Git Commit: [PENDING] fix: release onboarding usability improvements 0.6.39
  - Reference: first-run-corrections-032 / U007 / implementation
  - Файлы: package.json, package-lock.json, docs/modules/first-run-onboarding.md, docs/WORKSPACE_SETUP.md, docs/VERIFICATION.md, docs/RELEASE.md, docs/TRANSFER_TO_WINDOWS.md, docs/architecture/ARCHITECTURE.md
- [TODO] DOCS: Актуализация всех документов проекта — Ожидает
  - Git Commit: [PENDING] docs: deliver first-run correction release 0.6.38
  - Reference: first-run-corrections-032 / DOCS / implementation
  - Файлы: docs/modules/first-run-onboarding.md, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md, AGENTS.md, README.md, docs/WORKFLOW_START.md, docs/PRODUCT.md, docs/DECISIONS.md, docs/architecture/OVERVIEW.md, docs/MODULES.md, docs/DOCUMENTATION_INDEX.md, docs/CLEAN_INSTALL.md, docs/RELEASE.md, docs/TRANSFER_TO_WINDOWS.md, docs/modules/runtime-lifecycle.md, docs/WORKSPACE_SETUP.md, docs/CONTEXT_DELIVERY.md

## Context Pack For This Cycle

- docs/architecture/OVERVIEW.md → Краткая архитектура проекта
- docs/MODULES.md → Модули проекта
- docs/DOCUMENTATION_INDEX.md → Каталог документации
- docs/modules/first-run-onboarding.md → Первый запуск Web Pilot на чистой системе

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
