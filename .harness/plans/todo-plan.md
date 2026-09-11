# Активный план — Project Web Pilot

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 51,
  "project_id": "cf944136-d1fc-4bd5-9ea0-e46d1fe230e7",
  "project_name": "Project Web Pilot",
  "scope_id": "web-pilot-prototype-001",
  "execution_scope_status": "ACTIVE",
  "delivery_status": "IN_PROGRESS",
  "objective": "Локальный macOS Web Pilot с встроенным ChatGPT, выбором проекта и полным контекстом в первом сообщении; агент сразу кратко подтверждает восстановление и описывает проект. Сайдбар сохраняет все созданные сессии workspace и позволяет выбирать их в раскрываемом дереве.",
  "acceptance_criteria": [
    "Полный канонический контекст передаёт приложение до первого ответа агента.",
    "Первый ответ кратко подтверждает восстановление и описывает выбранный проект без обязательного получения пакета через MCP и без hook/ACK оговорок.",
    "Привязки workspace/chat и неизвестный исход Send не создают дубли сообщений.",
    "Реальный встроенный Work и повторный запуск проверены; пользовательская приёмка отдельно.",
    "Двойной клик по workspace раскрывает сессии; выбор открывает конкретный сохранённый чат."
  ],
  "approved_scope": {
    "functional_paths": [
      "package.json",
      "package-lock.json",
      "src/main.mjs",
      "src/workspace-session.mjs",
      "src/ui/index.html",
      "tests/workspace-session.test.mjs",
      "src/mcp-runtime.mjs",
      "tests/mcp-runtime.test.mjs",
      "src/chatgpt-composer.mjs",
      "tests/chatgpt-composer.test.mjs",
      "src/context-session.mjs",
      "tests/context-session.test.mjs",
      "src/preload.cjs",
      "src/ui/sidebar.mjs",
      ".gitignore",
      "tests/electron-smoke.mjs"
    ],
    "documentation_paths": [
      "README.md",
      "AGENTS.md",
      "docs/PRODUCT.md",
      "docs/architecture/ARCHITECTURE.md",
      "docs/CONTEXT_DELIVERY.md",
      "docs/SOURCE_WORKSPACES.md",
      "docs/DECISIONS.md",
      "docs/VERIFICATION.md",
      "docs/WORKFLOW_START.md",
      "docs/DOCUMENTATION_INDEX.md"
    ],
    "max_functional_files_per_task": 3
  },
  "baseline_commit": "08e138789734cc3ea61be3fb078d067d2676cbb5",
  "current_task_id": null,
  "context_pack": {
    "documents": [
      {
        "path": "AGENTS.md",
        "heading_path": [
          "Project Web Pilot — границы разработки"
        ],
        "required": true,
        "revision": "WORKTREE"
      },
      {
        "path": "docs/WORKFLOW_START.md",
        "heading_path": [
          "Начало работы",
          "Опорный контекст новой сессии"
        ],
        "required": true,
        "revision": "WORKTREE"
      },
      {
        "path": "docs/CONTEXT_DELIVERY.md",
        "heading_path": [
          "Передача контекста",
          "Каноническая последовательность"
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
      "dependencies": [],
      "functional_paths": [],
      "documentation_paths": [
        "README.md",
        "docs/PRODUCT.md",
        "docs/DECISIONS.md",
        "docs/DOCUMENTATION_INDEX.md"
      ],
      "verification_ids": [],
      "id": "T001",
      "title": "Зафиксировать идею и решения пользователя",
      "why": "Сохранить продуктовую договорённость для новой сессии",
      "acceptance_criteria": [
        "Указаны одно окно, встроенный Chromium, левый сайдбар, ChatGPT через аккаунт и локальный MCP",
        "Разделены первая проверка, полная цель и ещё не подтверждённые возможности"
      ],
      "expected_commit_message": "docs: определить идею Project Web Pilot",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "web-pilot-prototype-001",
        "task_id": "T001",
        "role": "implementation"
      }
    },
    {
      "dependencies": [
        "T001"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/architecture/ARCHITECTURE.md",
        "docs/CONTEXT_DELIVERY.md",
        "docs/SOURCE_WORKSPACES.md",
        "docs/DOCUMENTATION_INDEX.md"
      ],
      "verification_ids": [],
      "id": "T002",
      "title": "Описать архитектуру, передачу контекста и исходные проекты",
      "why": "Передать проверенные основания без копирования чужого runtime и ключей",
      "acceptance_criteria": [
        "Канонически описаны запуск MCP приложением, сообщение, recover и ACK",
        "Приведены проверенные пути и SHA обоих исходников",
        "Стартовый сценарий отделён от неподключённого автоматического compact"
      ],
      "expected_commit_message": "docs: описать архитектуру и источники проекта",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "web-pilot-prototype-001",
        "task_id": "T002",
        "role": "implementation"
      }
    },
    {
      "dependencies": [
        "T002"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "AGENTS.md",
        "docs/WORKFLOW_START.md",
        "docs/VERIFICATION.md",
        "docs/DOCUMENTATION_INDEX.md"
      ],
      "verification_ids": [],
      "id": "T003",
      "title": "Подготовить инструкции новой сессии и критерии проверки",
      "why": "Сделать передачу самодостаточной и проверяемой",
      "acceptance_criteria": [
        "Новая сессия находит цель, ограничения, источники и следующий шаг",
        "Зафиксированы реальные положительная и отрицательная проверки MCP",
        "Текущий этап ограничен документацией; задачи кода остаются TODO"
      ],
      "expected_commit_message": "docs: подготовить передачу в новую сессию",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "web-pilot-prototype-001",
        "task_id": "T003",
        "role": "implementation"
      }
    },
    {
      "dependencies": [
        "T003"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md",
        "docs/DECISIONS.md",
        "AGENTS.md",
        "docs/WORKFLOW_START.md"
      ],
      "verification_ids": [],
      "id": "T004",
      "title": "Уточнить профиль прототипа и подключить проверки",
      "why": "Подготовить исполнимую конфигурацию до функциональных задач",
      "acceptance_criteria": [
        "После поручения начать реализацию проверить текущую версию Electron и определить минимальный набор зависимостей",
        "Документировать полную конфигурацию и реальные проверки, завершить T004; затем между задачами применить DEVELOPMENT через config:apply и назначить verification_ids через plan:apply до начала T005",
        "Зафиксировать выбранные версии и команды, не объявлять пустую suite успешной"
      ],
      "expected_commit_message": "docs: определить профиль и проверки прототипа",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "web-pilot-prototype-001",
        "task_id": "T004",
        "role": "implementation"
      }
    },
    {
      "dependencies": [
        "T004"
      ],
      "functional_paths": [
        "package.json",
        "package-lock.json",
        "src/main.mjs",
        ".gitignore"
      ],
      "documentation_paths": [
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "syntax"
      ],
      "id": "T005",
      "title": "Создать запускаемый каркас Chromium-приложения",
      "why": "Проверить самостоятельное окно и загрузку реального ChatGPT",
      "acceptance_criteria": [
        "Одно локальное окно с WebContentsView открывает ChatGPT",
        "Профиль входа сохраняется отдельно от внешних браузеров",
        "У удалённой страницы нет Node integration и доступа к произвольному IPC; реальный вход проверяется пользователем"
      ],
      "expected_commit_message": "feat: создать каркас приложения с Chromium",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "web-pilot-prototype-001",
        "task_id": "T005",
        "role": "implementation"
      },
      "file_limit_exception": "Четвёртый файл .gitignore исключает зависимости и сборку из Git в том же атомарном каркасе; функциональных модулей по-прежнему один."
    },
    {
      "dependencies": [
        "T005"
      ],
      "functional_paths": [
        "src/workspace-session.mjs",
        "src/ui/index.html",
        "tests/workspace-session.test.mjs"
      ],
      "documentation_paths": [
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "workspace"
      ],
      "id": "T006",
      "title": "Добавить сайдбар и привязку workspace к чату",
      "why": "Сохранить выбранную папку и исключить смену контекста чужого чата",
      "acceptance_criteria": [
        "Привязка хранит canonical workspace, project_id, chat URL и session_id",
        "Переключение папки не меняет контекст уже работающего чата",
        "Проверены пробелы, кириллица, повторное открытие и несовпадающий проект"
      ],
      "expected_commit_message": "feat: связать workspace и сессию чата",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "web-pilot-prototype-001",
        "task_id": "T006",
        "role": "implementation"
      }
    },
    {
      "dependencies": [
        "T006"
      ],
      "functional_paths": [
        "src/mcp-runtime.mjs",
        "tests/mcp-runtime.test.mjs"
      ],
      "documentation_paths": [
        "docs/architecture/ARCHITECTURE.md",
        "docs/SOURCE_WORKSPACES.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "runtime"
      ],
      "id": "T007",
      "title": "Подключить управление существующим MCP и tunnel",
      "why": "Подготовить инструменты до первого сообщения модели",
      "acceptance_criteria": [
        "Используется явный путь к mac-codex-local/control.py; команды запускаются массивом аргументов",
        "Отдельно проверяются MCP initialization и готовность tunnel",
        "Старт идемпотентен; чужие процессы и глобальные настройки не меняются; ошибки не превращаются в готовность"
      ],
      "expected_commit_message": "feat: подключить запуск локального MCP",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "web-pilot-prototype-001",
        "task_id": "T007",
        "role": "implementation"
      }
    },
    {
      "dependencies": [
        "T007"
      ],
      "functional_paths": [
        "src/chatgpt-composer.mjs",
        "tests/chatgpt-composer.test.mjs"
      ],
      "documentation_paths": [
        "docs/CONTEXT_DELIVERY.md",
        "docs/VERIFICATION.md",
        "docs/architecture/ARCHITECTURE.md"
      ],
      "verification_ids": [
        "composer"
      ],
      "id": "T008",
      "title": "Реализовать отправку сообщения через поле ChatGPT",
      "why": "Проверить ключевой механизм оболочки",
      "acceptance_criteria": [
        "Адаптер дожидается реального доступного поля и отправляет видимое сообщение",
        "Не перетирает черновик, не прерывает генерацию, не повторяет автоматически отправку с неизвестным исходом",
        "Локальные тесты дополняются отдельной проверкой на реальной странице ChatGPT"
      ],
      "expected_commit_message": "feat: подготовить доставку стартового сообщения",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "web-pilot-prototype-001",
        "task_id": "T008",
        "role": "implementation"
      }
    },
    {
      "dependencies": [
        "T008"
      ],
      "functional_paths": [
        "src/context-session.mjs",
        "tests/context-session.test.mjs"
      ],
      "documentation_paths": [
        "docs/CONTEXT_DELIVERY.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "context"
      ],
      "id": "T009",
      "title": "Связать стартовое сообщение с recover и ACK",
      "why": "Получить проверяемое восстановление выбранного проекта",
      "acceptance_criteria": [
        "Сообщение содержит точные workspace/session_id, краткую задачу и последовательность канонического контракта",
        "Только агент вызывает recover и ACK; оболочка читает status без подделки challenge",
        "Чужой, старый или повторный ACK не засчитывается новому запуску; internal hook не симулируется"
      ],
      "expected_commit_message": "feat: связать старт чата с подтверждением контекста",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "web-pilot-prototype-001",
        "task_id": "T009",
        "role": "implementation"
      }
    },
    {
      "dependencies": [
        "T009"
      ],
      "functional_paths": [
        "src/main.mjs",
        "src/preload.cjs",
        "src/ui/sidebar.mjs",
        "tests/electron-smoke.mjs",
        "src/context-session.mjs",
        "tests/context-session.test.mjs",
        "src/chatgpt-composer.mjs",
        "tests/chatgpt-composer.test.mjs"
      ],
      "documentation_paths": [
        "docs/architecture/ARCHITECTURE.md",
        "docs/CONTEXT_DELIVERY.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "suite",
        "electron-smoke"
      ],
      "id": "T010",
      "title": "Соединить сайдбар, службы, браузер и состояние контекста",
      "why": "Получить одну пользовательскую цепочку",
      "acceptance_criteria": [
        "Выбор папки запускает координированный сценарий без ручного копирования промпта",
        "Сайдбар раздельно показывает готовность служб, отправку и подтверждение контекста",
        "При ACK показаны фактический проект и версия плана; состояние привязано к конкретному чату"
      ],
      "expected_commit_message": "feat: собрать стартовый сценарий в интерфейсе",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "web-pilot-prototype-001",
        "task_id": "T010",
        "role": "implementation"
      },
      "file_limit_exception": "Интеграция затрагивает три запланированных UI-файла, отдельный Electron smoke и небольшую защиту координатора с регрессионным тестом: новый workspace нельзя привязать к случайно открытому чужому чату до собственной отправки. Реальный Work также потребовал нормализовать абзацные переводы строки в адаптере; изменён адаптер и добавлен регрессионный тест."
    },
    {
      "dependencies": [
        "T010"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/VERIFICATION.md",
        "docs/DECISIONS.md"
      ],
      "verification_ids": [
        "suite"
      ],
      "id": "T011",
      "title": "Проверить вертикальный сценарий на реальном ChatGPT",
      "why": "Проверить основной риск до переноса двух кодовых баз",
      "acceptance_criteria": [
        "Пользователь выполнил вход и видит ChatGPT внутри приложения",
        "Приложение само отправило одно сообщение; агент получил выбранный workspace через MCP и показал подтверждение",
        "Журнал status, сообщение и сайдбар относятся к одной сессии; источник испытания WF001 не изменён",
        "Если реальный вход или отправка недоступны, записан точный блокер; встроенный Chromium не заменён внешним браузером без решения пользователя"
      ],
      "expected_commit_message": "docs: зафиксировать реальную проверку первого сценария",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "web-pilot-prototype-001",
        "task_id": "T011",
        "role": "implementation"
      }
    },
    {
      "dependencies": [
        "T011"
      ],
      "functional_paths": [
        "src/workspace-session.mjs",
        "src/context-session.mjs",
        "tests/context-session.test.mjs"
      ],
      "documentation_paths": [
        "docs/CONTEXT_DELIVERY.md",
        "docs/VERIFICATION.md",
        "docs/architecture/ARCHITECTURE.md"
      ],
      "verification_ids": [
        "suite",
        "electron-smoke"
      ],
      "id": "T012",
      "title": "Проверить повторное открытие, ошибки и восстановление состояния",
      "why": "Сделать прототип пригодным для повторяемого старта",
      "acceptance_criteria": [
        "Повторное открытие сохраняет связь папки и чата без лишних сообщений",
        "Таймаут, отсутствие MCP tools, неполный пакет, старый ACK, черновик и смена чата дают понятное состояние",
        "Не объявляются обнаружение compact и автоматическое восстановление после него"
      ],
      "expected_commit_message": "fix: обработать повторный старт и сбои восстановления",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "web-pilot-prototype-001",
        "task_id": "T012",
        "role": "implementation"
      }
    },
    {
      "dependencies": [
        "T012"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "README.md",
        "docs/VERIFICATION.md",
        "docs/WORKFLOW_START.md",
        "docs/DECISIONS.md",
        "AGENTS.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/PRODUCT.md",
        "docs/DOCUMENTATION_INDEX.md"
      ],
      "verification_ids": [
        "suite",
        "electron-smoke"
      ],
      "id": "T013",
      "title": "Подготовить результат прототипа к приёмке и следующий scope",
      "why": "Закончить проверочный этап по фактическому результату",
      "acceptance_criteria": [
        "Запуск и ограничения описаны для пользователя",
        "Различены локальные тесты, реальный браузерный сценарий и пользовательская приёмка",
        "Следующий объём по созданию/подключению проектов и переносу ядер уточняется после этой проверки",
        "Публикация, упаковка для Windows и архивирование scope не выполняются автоматически"
      ],
      "expected_commit_message": "docs: подготовить прототип к приёмке",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "web-pilot-prototype-001",
        "task_id": "T013",
        "role": "implementation"
      }
    },
    {
      "id": "T014",
      "title": "Получать полный контекст в приложении",
      "why": "Убрать промежуточное получение контекста агентом.",
      "dependencies": [
        "T013"
      ],
      "functional_paths": [
        "src/mcp-runtime.mjs",
        "tests/mcp-runtime.test.mjs"
      ],
      "documentation_paths": [
        "docs/CONTEXT_DELIVERY.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/SOURCE_WORKSPACES.md",
        "docs/VERIFICATION.md",
        "docs/DECISIONS.md",
        "AGENTS.md"
      ],
      "verification_ids": [
        "runtime"
      ],
      "acceptance_criteria": [
        "Оболочка получает полный пакет до сообщения и проверяет protocol, workspace, полноту и факты.",
        "Старый probe/ACK контракт отклоняется; агенту не поручается повторно запрашивать контекст."
      ],
      "expected_commit_message": "feat: получать полный контекст до старта чата",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "web-pilot-prototype-001",
        "task_id": "T014",
        "role": "implementation"
      }
    },
    {
      "id": "T015",
      "title": "Передавать контекст в первом сообщении",
      "why": "Агент сразу отвечает о выбранном проекте.",
      "dependencies": [
        "T014"
      ],
      "functional_paths": [
        "src/context-session.mjs",
        "tests/context-session.test.mjs"
      ],
      "documentation_paths": [
        "docs/CONTEXT_DELIVERY.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "suite"
      ],
      "acceptance_criteria": [
        "Первое сообщение содержит весь пакет и просит короткое подтверждение с описанием проекта без tools.",
        "Неизвестный исход Send не дублируется, чужой черновик сохраняется, изменившийся до Send пакет не отправляется.",
        "Старые чаты сохраняются без ложного объявления новой доставки."
      ],
      "expected_commit_message": "feat: передавать контекст первым сообщением",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "web-pilot-prototype-001",
        "task_id": "T015",
        "role": "implementation"
      }
    },
    {
      "id": "T016",
      "title": "Показать передачу контекста без ACK",
      "why": "Согласовать UI с новым стартом.",
      "dependencies": [
        "T015"
      ],
      "functional_paths": [
        "src/main.mjs",
        "src/ui/index.html",
        "src/ui/sidebar.mjs",
        "tests/electron-smoke.mjs"
      ],
      "documentation_paths": [
        "docs/CONTEXT_DELIVERY.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "suite",
        "electron-smoke"
      ],
      "acceptance_criteria": [
        "Сайдбар показывает передачу контекста и сохраняет папку/чат при повторном открытии.",
        "Electron smoke проверяет большой полный пакет и отсутствие повторного сообщения."
      ],
      "expected_commit_message": "feat: упростить состояния старта проекта",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "web-pilot-prototype-001",
        "task_id": "T016",
        "role": "implementation"
      },
      "file_limit_exception": "Главный процесс, разметка и renderer образуют один интерфейс; четвёртый файл — проверка в настоящем Electron."
    },
    {
      "id": "T017",
      "title": "Пересобрать и проверить краткий первый ответ",
      "why": "Передать исправленный прототип пользователю.",
      "dependencies": [
        "T016"
      ],
      "functional_paths": [
        "package.json",
        "package-lock.json"
      ],
      "documentation_paths": [
        "README.md",
        "AGENTS.md",
        "docs/PRODUCT.md",
        "docs/WORKFLOW_START.md",
        "docs/DECISIONS.md",
        "docs/VERIFICATION.md",
        "docs/SOURCE_WORKSPACES.md",
        "docs/architecture/ARCHITECTURE.md"
      ],
      "verification_ids": [
        "suite",
        "electron-smoke"
      ],
      "acceptance_criteria": [
        "Новая локальная сборка запускается; реальный первый ответ кратко подтверждает получение и описывает проект.",
        "Проверены новый MCP snapshot, полная отправка и повторное открытие; ограничения и инструкция актуальны."
      ],
      "expected_commit_message": "chore: собрать прототип с прямой передачей контекста",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "web-pilot-prototype-001",
        "task_id": "T017",
        "role": "implementation"
      }
    },
    {
      "id": "T018",
      "title": "Сохранять несколько сессий workspace",
      "why": "Новый чат не должен заменять предыдущий.",
      "dependencies": [],
      "functional_paths": [
        "src/workspace-session.mjs",
        "tests/workspace-session.test.mjs"
      ],
      "documentation_paths": [
        "docs/architecture/ARCHITECTURE.md",
        "docs/CONTEXT_DELIVERY.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "suite"
      ],
      "acceptance_criteria": [
        "Каждый workspace хранит список сессий и выбранную сессию; новый чат добавляется в список.",
        "Прежний формат переносится с резервной копией без потери сохранённого чата.",
        "Нельзя открыть или изменить сессию чужого workspace; повторный запуск сохраняет список."
      ],
      "expected_commit_message": "feat: сохранять историю сессий workspace",
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "web-pilot-prototype-001",
        "task_id": "T018",
        "role": "implementation"
      }
    },
    {
      "id": "T019",
      "title": "Добавить дерево сессий в сайдбар",
      "why": "Выбирать любой чат проекта, а не только последний.",
      "dependencies": [
        "T018"
      ],
      "functional_paths": [
        "src/main.mjs",
        "src/preload.cjs",
        "src/ui/sidebar.mjs",
        "src/ui/index.html",
        "tests/electron-smoke.mjs"
      ],
      "documentation_paths": [
        "docs/architecture/ARCHITECTURE.md",
        "docs/CONTEXT_DELIVERY.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "suite",
        "electron-smoke"
      ],
      "acceptance_criteria": [
        "Двойной клик по workspace раскрывает и сворачивает список его сессий.",
        "Нажатие на сессию открывает именно её; новый чат остаётся в дереве вместе с прежними.",
        "Названия и даты различают сессии; выбор и раскрытие сохраняются.",
        "Переключение назад не повторяет отправку контекста и не смешивает состояния сессий."
      ],
      "file_limit_exception": "Дерево требует согласованных изменений renderer, разметки, двух сторон IPC и интеграционной проверки; это один пользовательский сценарий из пяти файлов.",
      "expected_commit_message": "feat: выбирать сессии из дерева проектов",
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "web-pilot-prototype-001",
        "task_id": "T019",
        "role": "implementation"
      }
    },
    {
      "id": "T020",
      "title": "Собрать и проверить дерево чатов",
      "why": "Передать пользователю работающий выбор сессий.",
      "dependencies": [
        "T019"
      ],
      "functional_paths": [
        "package.json",
        "package-lock.json"
      ],
      "documentation_paths": [
        "README.md",
        "AGENTS.md",
        "docs/PRODUCT.md",
        "docs/WORKFLOW_START.md",
        "docs/DECISIONS.md",
        "docs/VERIFICATION.md",
        "docs/architecture/ARCHITECTURE.md"
      ],
      "verification_ids": [
        "suite",
        "electron-smoke"
      ],
      "acceptance_criteria": [
        "Новая локальная сборка показывает дерево и открывает выбранный реальный чат.",
        "Повторный запуск сохраняет сессии; пользовательская инструкция актуальна."
      ],
      "expected_commit_message": "chore: собрать прототип с деревом сессий",
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "web-pilot-prototype-001",
        "task_id": "T020",
        "role": "implementation"
      }
    }
  ],
  "blocked_reason": null,
  "user_decisions": [
    {
      "id": "scope-boundary",
      "text": "Сейчас разрешена подготовка документации и плана для новой сессии. Приложение в этой сессии не реализовывать.",
      "recorded_at": "2026-09-11T08:19:46.877Z"
    },
    {
      "id": "embedded-browser",
      "text": "Пользователь выбрал встроенный Chromium в одном окне с левым сайдбаром; модель работает через веб-аккаунт ChatGPT и локальный MCP.",
      "recorded_at": "2026-09-11T08:19:46.877Z"
    },
    {
      "id": "startup-message",
      "text": "Оболочка вызывает собственный стартовый сценарий и сама вставляет и отправляет сообщение в пользовательское поле ChatGPT с workspace и задачей; реальный autocompact остаётся отдельным вопросом.",
      "recorded_at": "2026-09-11T08:19:46.877Z"
    },
    {
      "id": "13ce9bc7-f80c-4bd4-9e89-83ef1378107c",
      "text": "11.09.2026 пользователь создал Project Web Pilot через Project Workflow Kit и поручил наполнить его первичными документами, ссылками на WF001 и Codex Local Mac и планом реализации для новой сессии. В этом сеансе выполняются T001–T003 и настройка context pack. Функциональные T004–T013 подготовлены для последующего поручения в новой сессии, сейчас не начинаются.",
      "recorded_at": "2026-09-11T08:14:01.195Z"
    },
    {
      "id": "31553ccf-3317-466b-a887-f5e98b8ca38e",
      "text": "11.09.2026, новая сессия: пользователь поручил продолжать без остановок до сборки первого запускаемого прототипа на Mac, который он сможет протестировать и дать фидбэк. Разрешены T004 и последующая реализация в согласованном scope; реальная авторизация и пользовательская приёмка проверяются отдельно.",
      "recorded_at": "2026-09-11T08:44:16.129775+00:00"
    },
    {
      "id": "inline-context-confirmation-20260911",
      "text": "Пользователь согласовал полный контекст в первом сообщении, очистку MCP от проверки hooks и обязательного ACK и короткий первый ответ: подтверждение восстановления плюс описание выбранного проекта. Поручил реализовать и пересобрать. Разрешено согласованное изменение Codex Local Mac для этой интеграции; WF001 сохраняется.",
      "recorded_at": "2026-09-11T09:32:26.851372+00:00"
    },
    {
      "id": "workspace-session-tree",
      "text": "Пользователь поручил сохранять несколько чатов/сессий под workspace, раскрывать дерево двойным кликом и выбирать конкретную сессию вместо только последней.",
      "recorded_at": "2026-09-11T09:50:00Z"
    }
  ]
}
```
<!-- workflow-state:end -->

## Состояние

Execution Scope Status: ACTIVE
Delivery Status: IN_PROGRESS
Scope: web-pilot-prototype-001
Current Task: нет
Revision: 51

## Цель

Локальный macOS Web Pilot с встроенным ChatGPT, выбором проекта и полным контекстом в первом сообщении; агент сразу кратко подтверждает восстановление и описывает проект. Сайдбар сохраняет все созданные сессии workspace и позволяет выбирать их в раскрываемом дереве.

## Критерии приёмки

- Полный канонический контекст передаёт приложение до первого ответа агента.
- Первый ответ кратко подтверждает восстановление и описывает выбранный проект без обязательного получения пакета через MCP и без hook/ACK оговорок.
- Привязки workspace/chat и неизвестный исход Send не создают дубли сообщений.
- Реальный встроенный Work и повторный запуск проверены; пользовательская приёмка отдельно.
- Двойной клик по workspace раскрывает сессии; выбор открывает конкретный сохранённый чат.

## Микрозадачи

- [DONE] T001: Зафиксировать идею и решения пользователя — Завершено
  - Git Commit: [DONE] docs: определить идею Project Web Pilot
  - Reference: web-pilot-prototype-001 / T001 / implementation
  - Файлы: README.md, docs/PRODUCT.md, docs/DECISIONS.md, docs/DOCUMENTATION_INDEX.md
- [DONE] T002: Описать архитектуру, передачу контекста и исходные проекты — Завершено
  - Git Commit: [DONE] docs: описать архитектуру и источники проекта
  - Reference: web-pilot-prototype-001 / T002 / implementation
  - Файлы: docs/architecture/ARCHITECTURE.md, docs/CONTEXT_DELIVERY.md, docs/SOURCE_WORKSPACES.md, docs/DOCUMENTATION_INDEX.md
- [DONE] T003: Подготовить инструкции новой сессии и критерии проверки — Завершено
  - Git Commit: [DONE] docs: подготовить передачу в новую сессию
  - Reference: web-pilot-prototype-001 / T003 / implementation
  - Файлы: AGENTS.md, docs/WORKFLOW_START.md, docs/VERIFICATION.md, docs/DOCUMENTATION_INDEX.md
- [DONE] T004: Уточнить профиль прототипа и подключить проверки — Завершено
  - Git Commit: [DONE] docs: определить профиль и проверки прототипа
  - Reference: web-pilot-prototype-001 / T004 / implementation
  - Файлы: docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md, docs/DECISIONS.md, AGENTS.md, docs/WORKFLOW_START.md
- [DONE] T005: Создать запускаемый каркас Chromium-приложения — Завершено
  - Git Commit: [DONE] feat: создать каркас приложения с Chromium
  - Reference: web-pilot-prototype-001 / T005 / implementation
  - Файлы: package.json, package-lock.json, src/main.mjs, .gitignore, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md
- [DONE] T006: Добавить сайдбар и привязку workspace к чату — Завершено
  - Git Commit: [DONE] feat: связать workspace и сессию чата
  - Reference: web-pilot-prototype-001 / T006 / implementation
  - Файлы: src/workspace-session.mjs, src/ui/index.html, tests/workspace-session.test.mjs, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md
- [DONE] T007: Подключить управление существующим MCP и tunnel — Завершено
  - Git Commit: [DONE] feat: подключить запуск локального MCP
  - Reference: web-pilot-prototype-001 / T007 / implementation
  - Файлы: src/mcp-runtime.mjs, tests/mcp-runtime.test.mjs, docs/architecture/ARCHITECTURE.md, docs/SOURCE_WORKSPACES.md, docs/VERIFICATION.md
- [DONE] T008: Реализовать отправку сообщения через поле ChatGPT — Завершено
  - Git Commit: [DONE] feat: подготовить доставку стартового сообщения
  - Reference: web-pilot-prototype-001 / T008 / implementation
  - Файлы: src/chatgpt-composer.mjs, tests/chatgpt-composer.test.mjs, docs/CONTEXT_DELIVERY.md, docs/VERIFICATION.md, docs/architecture/ARCHITECTURE.md
- [DONE] T009: Связать стартовое сообщение с recover и ACK — Завершено
  - Git Commit: [DONE] feat: связать старт чата с подтверждением контекста
  - Reference: web-pilot-prototype-001 / T009 / implementation
  - Файлы: src/context-session.mjs, tests/context-session.test.mjs, docs/CONTEXT_DELIVERY.md, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md
- [DONE] T010: Соединить сайдбар, службы, браузер и состояние контекста — Завершено
  - Git Commit: [DONE] feat: собрать стартовый сценарий в интерфейсе
  - Reference: web-pilot-prototype-001 / T010 / implementation
  - Файлы: src/main.mjs, src/preload.cjs, src/ui/sidebar.mjs, tests/electron-smoke.mjs, src/context-session.mjs, tests/context-session.test.mjs, src/chatgpt-composer.mjs, tests/chatgpt-composer.test.mjs, docs/architecture/ARCHITECTURE.md, docs/CONTEXT_DELIVERY.md, docs/VERIFICATION.md
- [DONE] T011: Проверить вертикальный сценарий на реальном ChatGPT — Завершено
  - Git Commit: [DONE] docs: зафиксировать реальную проверку первого сценария
  - Reference: web-pilot-prototype-001 / T011 / implementation
  - Файлы: docs/VERIFICATION.md, docs/DECISIONS.md
- [DONE] T012: Проверить повторное открытие, ошибки и восстановление состояния — Завершено
  - Git Commit: [DONE] fix: обработать повторный старт и сбои восстановления
  - Reference: web-pilot-prototype-001 / T012 / implementation
  - Файлы: src/workspace-session.mjs, src/context-session.mjs, tests/context-session.test.mjs, docs/CONTEXT_DELIVERY.md, docs/VERIFICATION.md, docs/architecture/ARCHITECTURE.md
- [DONE] T013: Подготовить результат прототипа к приёмке и следующий scope — Завершено
  - Git Commit: [DONE] docs: подготовить прототип к приёмке
  - Reference: web-pilot-prototype-001 / T013 / implementation
  - Файлы: README.md, docs/VERIFICATION.md, docs/WORKFLOW_START.md, docs/DECISIONS.md, AGENTS.md, docs/architecture/ARCHITECTURE.md, docs/PRODUCT.md, docs/DOCUMENTATION_INDEX.md
- [DONE] T014: Получать полный контекст в приложении — Завершено
  - Git Commit: [DONE] feat: получать полный контекст до старта чата
  - Reference: web-pilot-prototype-001 / T014 / implementation
  - Файлы: src/mcp-runtime.mjs, tests/mcp-runtime.test.mjs, docs/CONTEXT_DELIVERY.md, docs/architecture/ARCHITECTURE.md, docs/SOURCE_WORKSPACES.md, docs/VERIFICATION.md, docs/DECISIONS.md, AGENTS.md
- [DONE] T015: Передавать контекст в первом сообщении — Завершено
  - Git Commit: [DONE] feat: передавать контекст первым сообщением
  - Reference: web-pilot-prototype-001 / T015 / implementation
  - Файлы: src/context-session.mjs, tests/context-session.test.mjs, docs/CONTEXT_DELIVERY.md, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md
- [DONE] T016: Показать передачу контекста без ACK — Завершено
  - Git Commit: [DONE] feat: упростить состояния старта проекта
  - Reference: web-pilot-prototype-001 / T016 / implementation
  - Файлы: src/main.mjs, src/ui/index.html, src/ui/sidebar.mjs, tests/electron-smoke.mjs, docs/CONTEXT_DELIVERY.md, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md
- [DONE] T017: Пересобрать и проверить краткий первый ответ — Завершено
  - Git Commit: [DONE] chore: собрать прототип с прямой передачей контекста
  - Reference: web-pilot-prototype-001 / T017 / implementation
  - Файлы: package.json, package-lock.json, README.md, AGENTS.md, docs/PRODUCT.md, docs/WORKFLOW_START.md, docs/DECISIONS.md, docs/VERIFICATION.md, docs/SOURCE_WORKSPACES.md, docs/architecture/ARCHITECTURE.md
- [TODO] T018: Сохранять несколько сессий workspace — Ожидает
  - Git Commit: [PENDING] feat: сохранять историю сессий workspace
  - Reference: web-pilot-prototype-001 / T018 / implementation
  - Файлы: src/workspace-session.mjs, tests/workspace-session.test.mjs, docs/architecture/ARCHITECTURE.md, docs/CONTEXT_DELIVERY.md, docs/VERIFICATION.md
- [TODO] T019: Добавить дерево сессий в сайдбар — Ожидает
  - Git Commit: [PENDING] feat: выбирать сессии из дерева проектов
  - Reference: web-pilot-prototype-001 / T019 / implementation
  - Файлы: src/main.mjs, src/preload.cjs, src/ui/sidebar.mjs, src/ui/index.html, tests/electron-smoke.mjs, docs/architecture/ARCHITECTURE.md, docs/CONTEXT_DELIVERY.md, docs/VERIFICATION.md
- [TODO] T020: Собрать и проверить дерево чатов — Ожидает
  - Git Commit: [PENDING] chore: собрать прототип с деревом сессий
  - Reference: web-pilot-prototype-001 / T020 / implementation
  - Файлы: package.json, package-lock.json, README.md, AGENTS.md, docs/PRODUCT.md, docs/WORKFLOW_START.md, docs/DECISIONS.md, docs/VERIFICATION.md, docs/architecture/ARCHITECTURE.md

## Context Pack For This Cycle

- AGENTS.md → Project Web Pilot — границы разработки
- docs/WORKFLOW_START.md → Начало работы / Опорный контекст новой сессии
- docs/CONTEXT_DELIVERY.md → Передача контекста / Каноническая последовательность

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
