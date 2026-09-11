# Активный план — Project Web Pilot

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 7,
  "project_id": "cf944136-d1fc-4bd5-9ea0-e46d1fe230e7",
  "project_name": "Project Web Pilot",
  "scope_id": "web-pilot-prototype-001",
  "execution_scope_status": "ACTIVE",
  "delivery_status": "IN_PROGRESS",
  "objective": "Подготовить самодостаточный проект и первичный план; следующим этапом проверить локальное приложение с встроенным Chromium, выбором workspace, запуском MCP и автоматическим стартовым сообщением с подтверждением контекста.",
  "acceptance_criteria": [
    "Документы однозначно передают согласованную идею и источники; новый recovery packet COMPLETE",
    "Первый прототип проверяет реальный ChatGPT внутри одного окна и автоматическую отправку через обычное поле ввода",
    "Выбранный workspace, чат, session_id и подтверждённые факты плана не смешиваются",
    "Локальное приложение запускает MCP до первого запроса агента; ACK проверяется по фактическому состоянию",
    "Автоматический compact не объявляется решённым без отдельного подтверждённого события"
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
      "src/ui/sidebar.mjs"
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
        "path": "docs/PRODUCT.md",
        "heading_path": [
          "Продукт"
        ],
        "required": true,
        "revision": "WORKTREE"
      }
    ],
    "include_last_completed_task": true,
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
      "implementation_status": "TODO",
      "commit_status": "PENDING",
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
        "docs/DECISIONS.md"
      ],
      "verification_ids": [],
      "id": "T004",
      "title": "Уточнить профиль прототипа и подключить проверки",
      "why": "Подготовить исполнимую конфигурацию до функциональных задач",
      "acceptance_criteria": [
        "После поручения начать реализацию проверить текущую версию Electron и выбрать минимальный набор зависимостей",
        "Между задачами применить DEVELOPMENT и реальные проверки через config:apply, затем назначить verification_ids задачам через plan:apply",
        "Зафиксировать выбранные версии и команды, не объявлять пустую suite успешной"
      ],
      "expected_commit_message": "docs: определить профиль и проверки прототипа",
      "implementation_status": "TODO",
      "commit_status": "PENDING",
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
        "src/main.mjs"
      ],
      "documentation_paths": [
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [],
      "id": "T005",
      "title": "Создать запускаемый каркас Chromium-приложения",
      "why": "Проверить самостоятельное окно и загрузку реального ChatGPT",
      "acceptance_criteria": [
        "Одно локальное окно с WebContentsView открывает ChatGPT",
        "Профиль входа сохраняется отдельно от внешних браузеров",
        "У удалённой страницы нет Node integration и доступа к произвольному IPC; реальный вход проверяется пользователем"
      ],
      "expected_commit_message": "feat: создать каркас приложения с Chromium",
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "web-pilot-prototype-001",
        "task_id": "T005",
        "role": "implementation"
      }
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
      "verification_ids": [],
      "id": "T006",
      "title": "Добавить сайдбар и привязку workspace к чату",
      "why": "Сохранить выбранную папку и исключить смену контекста чужого чата",
      "acceptance_criteria": [
        "Привязка хранит canonical workspace, project_id, chat URL и session_id",
        "Переключение папки не меняет контекст уже работающего чата",
        "Проверены пробелы, кириллица, повторное открытие и несовпадающий проект"
      ],
      "expected_commit_message": "feat: связать workspace и сессию чата",
      "implementation_status": "TODO",
      "commit_status": "PENDING",
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
      "verification_ids": [],
      "id": "T007",
      "title": "Подключить управление существующим MCP и tunnel",
      "why": "Подготовить инструменты до первого сообщения модели",
      "acceptance_criteria": [
        "Используется явный путь к mac-codex-local/control.py; команды запускаются массивом аргументов",
        "Отдельно проверяются MCP initialization и готовность tunnel",
        "Старт идемпотентен; чужие процессы и глобальные настройки не меняются; ошибки не превращаются в готовность"
      ],
      "expected_commit_message": "feat: подключить запуск локального MCP",
      "implementation_status": "TODO",
      "commit_status": "PENDING",
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
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [],
      "id": "T008",
      "title": "Реализовать отправку сообщения через поле ChatGPT",
      "why": "Проверить ключевой механизм оболочки",
      "acceptance_criteria": [
        "Адаптер дожидается реального доступного поля и отправляет видимое сообщение",
        "Не перетирает черновик, не прерывает генерацию, не повторяет автоматически отправку с неизвестным исходом",
        "Локальные тесты дополняются отдельной проверкой на реальной странице ChatGPT"
      ],
      "expected_commit_message": "feat: подготовить доставку стартового сообщения",
      "implementation_status": "TODO",
      "commit_status": "PENDING",
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
      "verification_ids": [],
      "id": "T009",
      "title": "Связать стартовое сообщение с recover и ACK",
      "why": "Получить проверяемое восстановление выбранного проекта",
      "acceptance_criteria": [
        "Сообщение содержит точные workspace/session_id, краткую задачу и последовательность канонического контракта",
        "Только агент вызывает recover и ACK; оболочка читает status без подделки challenge",
        "Чужой, старый или повторный ACK не засчитывается новому запуску; internal hook не симулируется"
      ],
      "expected_commit_message": "feat: связать старт чата с подтверждением контекста",
      "implementation_status": "TODO",
      "commit_status": "PENDING",
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
        "src/ui/sidebar.mjs"
      ],
      "documentation_paths": [
        "docs/architecture/ARCHITECTURE.md",
        "docs/CONTEXT_DELIVERY.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [],
      "id": "T010",
      "title": "Соединить сайдбар, службы, браузер и состояние контекста",
      "why": "Получить одну пользовательскую цепочку",
      "acceptance_criteria": [
        "Выбор папки запускает координированный сценарий без ручного копирования промпта",
        "Сайдбар раздельно показывает готовность служб, отправку и подтверждение контекста",
        "При ACK показаны фактический проект и версия плана; состояние привязано к конкретному чату"
      ],
      "expected_commit_message": "feat: собрать стартовый сценарий в интерфейсе",
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "web-pilot-prototype-001",
        "task_id": "T010",
        "role": "implementation"
      }
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
      "verification_ids": [],
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
      "implementation_status": "TODO",
      "commit_status": "PENDING",
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
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [],
      "id": "T012",
      "title": "Проверить повторное открытие, ошибки и восстановление состояния",
      "why": "Сделать прототип пригодным для повторяемого старта",
      "acceptance_criteria": [
        "Повторное открытие сохраняет связь папки и чата без лишних сообщений",
        "Таймаут, отсутствие MCP tools, неполный пакет, старый ACK, черновик и смена чата дают понятное состояние",
        "Не объявляются обнаружение compact и автоматическое восстановление после него"
      ],
      "expected_commit_message": "fix: обработать повторный старт и сбои восстановления",
      "implementation_status": "TODO",
      "commit_status": "PENDING",
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
        "docs/DECISIONS.md"
      ],
      "verification_ids": [],
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
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "web-pilot-prototype-001",
        "task_id": "T013",
        "role": "implementation"
      }
    }
  ],
  "blocked_reason": null,
  "user_decisions": [
    {
      "id": "scope-boundary",
      "text": "Сейчас разрешена подготовка документации и плана для новой сессии. Приложение в этой сессии не реализовывать.",
      "recorded_at": "2026-09-11T08:00:00Z"
    },
    {
      "id": "embedded-browser",
      "text": "Пользователь выбрал встроенный Chromium в одном окне с левым сайдбаром; модель работает через веб-аккаунт ChatGPT и локальный MCP.",
      "recorded_at": "2026-09-11T08:00:00Z"
    },
    {
      "id": "startup-message",
      "text": "Оболочка вызывает собственный стартовый сценарий и сама вставляет и отправляет сообщение в пользовательское поле ChatGPT с workspace и задачей; реальный autocompact остаётся отдельным вопросом.",
      "recorded_at": "2026-09-11T08:00:00Z"
    },
    {
      "id": "13ce9bc7-f80c-4bd4-9e89-83ef1378107c",
      "text": "11.09.2026 пользователь создал Project Web Pilot через Project Workflow Kit и поручил наполнить его первичными документами, ссылками на WF001 и Codex Local Mac и планом реализации для новой сессии. В этом сеансе выполняются T001–T003 и настройка context pack. Функциональные T004–T013 подготовлены для последующего поручения в новой сессии, сейчас не начинаются.",
      "recorded_at": "2026-09-11T08:14:01.195Z"
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
Revision: 7

## Цель

Подготовить самодостаточный проект и первичный план; следующим этапом проверить локальное приложение с встроенным Chromium, выбором workspace, запуском MCP и автоматическим стартовым сообщением с подтверждением контекста.

## Критерии приёмки

- Документы однозначно передают согласованную идею и источники; новый recovery packet COMPLETE
- Первый прототип проверяет реальный ChatGPT внутри одного окна и автоматическую отправку через обычное поле ввода
- Выбранный workspace, чат, session_id и подтверждённые факты плана не смешиваются
- Локальное приложение запускает MCP до первого запроса агента; ACK проверяется по фактическому состоянию
- Автоматический compact не объявляется решённым без отдельного подтверждённого события

## Микрозадачи

- [DONE] T001: Зафиксировать идею и решения пользователя — Завершено
  - Git Commit: [DONE] docs: определить идею Project Web Pilot
  - Reference: web-pilot-prototype-001 / T001 / implementation
  - Файлы: README.md, docs/PRODUCT.md, docs/DECISIONS.md, docs/DOCUMENTATION_INDEX.md
- [DONE] T002: Описать архитектуру, передачу контекста и исходные проекты — Завершено
  - Git Commit: [DONE] docs: описать архитектуру и источники проекта
  - Reference: web-pilot-prototype-001 / T002 / implementation
  - Файлы: docs/architecture/ARCHITECTURE.md, docs/CONTEXT_DELIVERY.md, docs/SOURCE_WORKSPACES.md, docs/DOCUMENTATION_INDEX.md
- [TODO] T003: Подготовить инструкции новой сессии и критерии проверки — Ожидает
  - Git Commit: [PENDING] docs: подготовить передачу в новую сессию
  - Reference: web-pilot-prototype-001 / T003 / implementation
  - Файлы: AGENTS.md, docs/WORKFLOW_START.md, docs/VERIFICATION.md, docs/DOCUMENTATION_INDEX.md
- [TODO] T004: Уточнить профиль прототипа и подключить проверки — Ожидает
  - Git Commit: [PENDING] docs: определить профиль и проверки прототипа
  - Reference: web-pilot-prototype-001 / T004 / implementation
  - Файлы: docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md, docs/DECISIONS.md
- [TODO] T005: Создать запускаемый каркас Chromium-приложения — Ожидает
  - Git Commit: [PENDING] feat: создать каркас приложения с Chromium
  - Reference: web-pilot-prototype-001 / T005 / implementation
  - Файлы: package.json, package-lock.json, src/main.mjs, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md
- [TODO] T006: Добавить сайдбар и привязку workspace к чату — Ожидает
  - Git Commit: [PENDING] feat: связать workspace и сессию чата
  - Reference: web-pilot-prototype-001 / T006 / implementation
  - Файлы: src/workspace-session.mjs, src/ui/index.html, tests/workspace-session.test.mjs, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md
- [TODO] T007: Подключить управление существующим MCP и tunnel — Ожидает
  - Git Commit: [PENDING] feat: подключить запуск локального MCP
  - Reference: web-pilot-prototype-001 / T007 / implementation
  - Файлы: src/mcp-runtime.mjs, tests/mcp-runtime.test.mjs, docs/architecture/ARCHITECTURE.md, docs/SOURCE_WORKSPACES.md, docs/VERIFICATION.md
- [TODO] T008: Реализовать отправку сообщения через поле ChatGPT — Ожидает
  - Git Commit: [PENDING] feat: подготовить доставку стартового сообщения
  - Reference: web-pilot-prototype-001 / T008 / implementation
  - Файлы: src/chatgpt-composer.mjs, tests/chatgpt-composer.test.mjs, docs/CONTEXT_DELIVERY.md, docs/VERIFICATION.md
- [TODO] T009: Связать стартовое сообщение с recover и ACK — Ожидает
  - Git Commit: [PENDING] feat: связать старт чата с подтверждением контекста
  - Reference: web-pilot-prototype-001 / T009 / implementation
  - Файлы: src/context-session.mjs, tests/context-session.test.mjs, docs/CONTEXT_DELIVERY.md, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md
- [TODO] T010: Соединить сайдбар, службы, браузер и состояние контекста — Ожидает
  - Git Commit: [PENDING] feat: собрать стартовый сценарий в интерфейсе
  - Reference: web-pilot-prototype-001 / T010 / implementation
  - Файлы: src/main.mjs, src/preload.cjs, src/ui/sidebar.mjs, docs/architecture/ARCHITECTURE.md, docs/CONTEXT_DELIVERY.md, docs/VERIFICATION.md
- [TODO] T011: Проверить вертикальный сценарий на реальном ChatGPT — Ожидает
  - Git Commit: [PENDING] docs: зафиксировать реальную проверку первого сценария
  - Reference: web-pilot-prototype-001 / T011 / implementation
  - Файлы: docs/VERIFICATION.md, docs/DECISIONS.md
- [TODO] T012: Проверить повторное открытие, ошибки и восстановление состояния — Ожидает
  - Git Commit: [PENDING] fix: обработать повторный старт и сбои восстановления
  - Reference: web-pilot-prototype-001 / T012 / implementation
  - Файлы: src/workspace-session.mjs, src/context-session.mjs, tests/context-session.test.mjs, docs/CONTEXT_DELIVERY.md, docs/VERIFICATION.md
- [TODO] T013: Подготовить результат прототипа к приёмке и следующий scope — Ожидает
  - Git Commit: [PENDING] docs: подготовить прототип к приёмке
  - Reference: web-pilot-prototype-001 / T013 / implementation
  - Файлы: README.md, docs/VERIFICATION.md, docs/WORKFLOW_START.md, docs/DECISIONS.md

## Context Pack For This Cycle

- docs/PRODUCT.md → Продукт

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
