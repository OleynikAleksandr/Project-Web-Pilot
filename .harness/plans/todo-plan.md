# Активный план — Project Web Pilot

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 352,
  "project_id": "cf944136-d1fc-4bd5-9ea0-e46d1fe230e7",
  "project_name": "Project Web Pilot",
  "scope_id": "next-modifications-discussion-012",
  "execution_scope_status": "ACTIVE",
  "delivery_status": "IN_PROGRESS",
  "objective": "Быстрая предварительная подготовка актуального контекста и спиннеры операций; экспериментальный счётчик токенов удалён по решению пользователя.",
  "acceptance_criteria": [
    "Полностью удалён счётчик: нет tokenizer worker, фонового DOM-сэмплинга и загрузки истории для расчёта.",
    "Сессии и recovery сохраняются; устаревшие локальные оценки очищаются.",
    "Предварительная подготовка полного актуального контекста и общие спиннеры операций работают.",
    "macOS/Windows packages пересобраны; пользователь проверяет релиз перед закрытием scope."
  ],
  "approved_scope": {
    "functional_paths": [
      "src/session-tokens.mjs",
      "src/workspace-session.mjs",
      "package.json",
      "package-lock.json",
      "tests/session-tokens.test.mjs",
      "src/main.mjs",
      "src/ui/sidebar.mjs",
      "src/ui/index.html",
      "tests/electron-smoke.mjs",
      "src/context-inputs.mjs",
      "src/context-cache.mjs",
      "tests/context-cache.test.mjs",
      "src/context-session.mjs",
      "tests/context-session.test.mjs",
      "src/ui/progress.mjs",
      "src/ui/archive.mjs",
      "src/ui/archive.html",
      "tests/progress.test.mjs",
      "src/conversation-history.mjs",
      "tests/conversation-history.test.mjs",
      "tests/workspace-session.test.mjs"
    ],
    "documentation_paths": [
      "docs/DECISIONS.md",
      "docs/modules/workspace-sessions.md",
      "docs/architecture/ARCHITECTURE.md",
      "docs/VERIFICATION.md",
      "docs/WORKFLOW_START.md",
      "docs/modules/workflow-kit-recovery.md",
      "docs/CONTEXT_DELIVERY.md"
    ],
    "max_functional_files_per_task": 3
  },
  "baseline_commit": "50b1651b0d6cd73865f7d249514ce125d2bd9cf9",
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
        "path": "docs/modules/workspace-sessions.md",
        "heading_path": [
          "Module Specification — Workspace & Sessions"
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
        "docs/DECISIONS.md",
        "docs/modules/workspace-sessions.md"
      ],
      "verification_ids": [],
      "id": "T001",
      "title": "Зафиксировать согласованный счётчик токенов сессии",
      "why": "Зафиксировать пользовательский результат и границы следующего изменения перед подготовкой задач реализации.",
      "acceptance_criteria": [
        "Получено конкретное поручение пользователя о следующей модификации.",
        "Согласованные результат, границы, критерии приёмки и модуль-владелец записаны в решениях проекта."
      ],
      "expected_commit_message": "docs: согласовать следующую модификацию Web Pilot",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "next-modifications-discussion-012",
        "task_id": "T001",
        "role": "implementation"
      }
    },
    {
      "id": "T002",
      "title": "Добавить tiktoken, подсчёт и сохранение оценки по сессиям",
      "why": "Выполнить согласованный счётчик токенов в Workspace & Sessions.",
      "dependencies": [
        "T001"
      ],
      "functional_paths": [
        "src/session-tokens.mjs",
        "src/workspace-session.mjs",
        "package.json",
        "package-lock.json",
        "tests/session-tokens.test.mjs"
      ],
      "documentation_paths": [
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md",
        "docs/modules/workspace-sessions.md"
      ],
      "verification_ids": [
        "syntax",
        "suite"
      ],
      "acceptance_criteria": [
        "Текст считается локально через js-tiktoken/o200k_base; повторное наблюдение и streaming не дублируют сообщение.",
        "Оценка сохраняется по sessionId, переживает restart и не переносится между разговорами.",
        "Неизвестное количество отличается от нуля; текст сообщений не сохраняется счётчиком."
      ],
      "expected_commit_message": "feat: считать и сохранять токены сессий через tiktoken",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "next-modifications-discussion-012",
        "task_id": "T002",
        "role": "implementation"
      },
      "file_limit_exception": "Единая интеграция счётчика и его обязательных dependency/test файлов; изменение принадлежит Workspace & Sessions."
    },
    {
      "id": "T003",
      "title": "Подключить счётчик к открытому чату и нижнему правому углу сессии",
      "why": "Выполнить согласованный счётчик токенов в Workspace & Sessions.",
      "dependencies": [
        "T002"
      ],
      "functional_paths": [
        "src/main.mjs",
        "src/ui/sidebar.mjs",
        "src/ui/index.html",
        "tests/electron-smoke.mjs"
      ],
      "documentation_paths": [
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md",
        "docs/modules/workspace-sessions.md"
      ],
      "verification_ids": [
        "syntax",
        "suite",
        "electron-smoke"
      ],
      "acceptance_criteria": [
        "Плашка показывает ≈ N ток. справа снизу и поясняет границы оценки.",
        "Смена сессии и чужой conversation URL не загрязняют сохранённые значения.",
        "Electron smoke подтверждает обновление, изоляцию сессий и размещение счётчика."
      ],
      "expected_commit_message": "feat: показывать оценку токенов в строках сессий",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "next-modifications-discussion-012",
        "task_id": "T003",
        "role": "implementation"
      },
      "file_limit_exception": "Единая интеграция счётчика и его обязательных dependency/test файлов; изменение принадлежит Workspace & Sessions."
    },
    {
      "id": "T004",
      "title": "Собрать обновление приложения для проверки пользователем",
      "why": "Выполнить согласованный счётчик токенов в Workspace & Sessions.",
      "dependencies": [
        "T003"
      ],
      "functional_paths": [
        "package.json",
        "package-lock.json"
      ],
      "documentation_paths": [
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md",
        "docs/WORKFLOW_START.md",
        "docs/modules/workspace-sessions.md"
      ],
      "verification_ids": [
        "syntax",
        "suite",
        "electron-smoke"
      ],
      "acceptance_criteria": [
        "macOS arm64 и Windows x64 packages пересобраны и содержат tiktoken и счётчик.",
        "Версия и результат проверок зафиксированы; финальная оценка показаний остаётся пользователю."
      ],
      "expected_commit_message": "chore: собрать Web Pilot 0.6.9 со счётчиком токенов",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "next-modifications-discussion-012",
        "task_id": "T004",
        "role": "implementation"
      }
    },
    {
      "id": "T005",
      "title": "Зафиксировать анализ и контракт предварительной подготовки контекста",
      "why": "Ускорить повторную передачу полного актуального контекста по поручению пользователя 15.09.2026.",
      "dependencies": [],
      "functional_paths": [],
      "documentation_paths": [
        "docs/modules/workflow-kit-recovery.md",
        "docs/CONTEXT_DELIVERY.md",
        "docs/DECISIONS.md"
      ],
      "verification_ids": [],
      "acceptance_criteria": [
        "Актуальность и полнота канонического пакета сохранены; результат проверен."
      ],
      "expected_commit_message": "docs: согласовать ускорение подготовки контекста",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "next-modifications-discussion-012",
        "task_id": "T005",
        "role": "implementation"
      }
    },
    {
      "id": "T006",
      "title": "Добавить проверяемый кэш полного recovery packet",
      "why": "Ускорить повторную передачу полного актуального контекста по поручению пользователя 15.09.2026.",
      "dependencies": [
        "T005"
      ],
      "functional_paths": [
        "src/context-inputs.mjs",
        "src/context-cache.mjs",
        "tests/context-cache.test.mjs"
      ],
      "documentation_paths": [
        "docs/modules/workflow-kit-recovery.md",
        "docs/CONTEXT_DELIVERY.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "suite"
      ],
      "acceptance_criteria": [
        "Актуальность и полнота канонического пакета сохранены; результат проверен."
      ],
      "expected_commit_message": "feat: заранее готовить актуальный recovery packet",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "next-modifications-discussion-012",
        "task_id": "T006",
        "role": "implementation"
      }
    },
    {
      "id": "T007",
      "title": "Подключить прогрев и проверку перед отправкой",
      "why": "Ускорить повторную передачу полного актуального контекста по поручению пользователя 15.09.2026.",
      "dependencies": [
        "T006"
      ],
      "functional_paths": [
        "src/main.mjs",
        "src/context-session.mjs",
        "src/ui/sidebar.mjs",
        "tests/context-session.test.mjs",
        "tests/electron-smoke.mjs",
        "src/context-cache.mjs",
        "src/context-inputs.mjs"
      ],
      "documentation_paths": [
        "docs/modules/workflow-kit-recovery.md",
        "docs/CONTEXT_DELIVERY.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "suite",
        "electron-smoke"
      ],
      "acceptance_criteria": [
        "Актуальность и полнота канонического пакета сохранены; результат проверен."
      ],
      "expected_commit_message": "feat: использовать подготовленный контекст при отправке",
      "file_limit_exception": "Интеграция одного recovery cache в координатор, интерфейс и обязательные regression tests.",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "next-modifications-discussion-012",
        "task_id": "T007",
        "role": "implementation"
      }
    },
    {
      "id": "T008",
      "title": "Показать выполнение операций спиннерами и понятными этапами",
      "why": "Пользователь отдельно поручил показывать выполнение процессов 15.09.2026.",
      "dependencies": [
        "T007"
      ],
      "functional_paths": [
        "src/ui/progress.mjs",
        "src/ui/sidebar.mjs",
        "src/ui/index.html",
        "src/ui/archive.mjs",
        "src/ui/archive.html",
        "tests/progress.test.mjs",
        "tests/electron-smoke.mjs",
        "src/main.mjs",
        "src/context-cache.mjs"
      ],
      "documentation_paths": [
        "docs/CONTEXT_DELIVERY.md",
        "docs/modules/workspace-sessions.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "suite",
        "electron-smoke"
      ],
      "acceptance_criteria": [
        "Спиннер и название действия видны во время операций приложения, включая setup/archive.",
        "Ошибки и ожидание пользователя не отображаются как бесконечное выполнение; reduced motion поддержан."
      ],
      "expected_commit_message": "feat: показывать ход операций приложения",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "next-modifications-discussion-012",
        "task_id": "T008",
        "role": "implementation"
      },
      "file_limit_exception": "Единый UI-индикатор в двух renderer views, CSS и regression tests; без изменения бизнес-операций."
    },
    {
      "id": "T009",
      "title": "Измерить ускорение и собрать релиз 0.6.10",
      "why": "Ускорить повторную передачу полного актуального контекста по поручению пользователя 15.09.2026.",
      "dependencies": [
        "T008"
      ],
      "functional_paths": [
        "package.json",
        "package-lock.json"
      ],
      "documentation_paths": [
        "docs/modules/workflow-kit-recovery.md",
        "docs/CONTEXT_DELIVERY.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md",
        "docs/WORKFLOW_START.md"
      ],
      "verification_ids": [
        "suite",
        "electron-smoke"
      ],
      "acceptance_criteria": [
        "Актуальность и полнота канонического пакета сохранены; результат проверен."
      ],
      "expected_commit_message": "chore: собрать Web Pilot 0.6.10 с быстрым recovery",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "next-modifications-discussion-012",
        "task_id": "T009",
        "role": "implementation"
      }
    },
    {
      "id": "T010",
      "title": "Зафиксировать исправление подсчёта всей истории",
      "why": "Исправить подтверждённый пользователем неполный подсчёт всей сессии.",
      "dependencies": [],
      "functional_paths": [],
      "documentation_paths": [
        "docs/modules/workspace-sessions.md",
        "docs/DECISIONS.md"
      ],
      "verification_ids": [],
      "acceptance_criteria": [
        "Полнота подтверждается исчерпанием пагинации; DOM-фрагмент не обозначается полной историей."
      ],
      "expected_commit_message": "docs: уточнить контракт полного подсчёта истории",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "next-modifications-discussion-012",
        "task_id": "T010",
        "role": "implementation"
      }
    },
    {
      "id": "T011",
      "title": "Загрузить полную историю через наблюдаемую пагинацию ChatGPT",
      "why": "Исправить подтверждённый пользователем неполный подсчёт всей сессии.",
      "dependencies": [
        "T010"
      ],
      "functional_paths": [
        "src/conversation-history.mjs",
        "src/session-tokens.mjs",
        "tests/conversation-history.test.mjs",
        "tests/session-tokens.test.mjs"
      ],
      "documentation_paths": [
        "docs/modules/workspace-sessions.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "syntax",
        "suite"
      ],
      "acceptance_criteria": [
        "История загружается до начала без прокрутки; циклы, ошибки и смена беседы не дают ложной полноты.",
        "Полный снимок заменяет прежние DOM-оценки; тексты и авторизация не сохраняются на диск."
      ],
      "expected_commit_message": "fix: считать полную историю разговора с пагинацией",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "next-modifications-discussion-012",
        "task_id": "T011",
        "role": "implementation"
      },
      "file_limit_exception": "Единое исправление подсчёта истории и его обязательная интеграционная проверка."
    },
    {
      "id": "T012",
      "title": "Подключить полную историю и честный статус счётчика",
      "why": "Исправить подтверждённый пользователем неполный подсчёт всей сессии.",
      "dependencies": [
        "T011"
      ],
      "functional_paths": [
        "src/main.mjs",
        "src/ui/sidebar.mjs",
        "src/ui/progress.mjs",
        "tests/electron-smoke.mjs",
        "tests/progress.test.mjs",
        "src/conversation-history.mjs",
        "tests/conversation-history.test.mjs"
      ],
      "documentation_paths": [
        "docs/modules/workspace-sessions.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "syntax",
        "suite",
        "electron-smoke"
      ],
      "acceptance_criteria": [
        "Старые фрагменты явно помечены; загрузка истории показывает ход работы.",
        "Полная история считается независимо от смонтированного DOM и сохраняется по сессии."
      ],
      "expected_commit_message": "fix: показывать полный подсчёт и загрузку истории",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "next-modifications-discussion-012",
        "task_id": "T012",
        "role": "implementation"
      },
      "file_limit_exception": "Единое исправление подсчёта истории и его обязательная интеграционная проверка."
    },
    {
      "id": "T013",
      "title": "Собрать релиз с исправленным счётчиком",
      "why": "Исправить подтверждённый пользователем неполный подсчёт всей сессии.",
      "dependencies": [
        "T012"
      ],
      "functional_paths": [
        "package.json",
        "package-lock.json"
      ],
      "documentation_paths": [
        "docs/modules/workspace-sessions.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md",
        "docs/WORKFLOW_START.md"
      ],
      "verification_ids": [
        "syntax",
        "suite",
        "electron-smoke"
      ],
      "acceptance_criteria": [
        "macOS и Windows packages пересобраны; реальные ограничения проверки явно указаны."
      ],
      "expected_commit_message": "chore: собрать Web Pilot 0.6.11 с полной историей",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "next-modifications-discussion-012",
        "task_id": "T013",
        "role": "implementation"
      }
    },
    {
      "id": "T014",
      "title": "Зафиксировать отказ от счётчика токенов",
      "why": "15.09.2026 пользователь поручил полностью убрать бесполезный для оценки окна счётчик и пересобрать релиз.",
      "dependencies": [],
      "functional_paths": [],
      "documentation_paths": [
        "docs/modules/workspace-sessions.md",
        "docs/DECISIONS.md"
      ],
      "verification_ids": [],
      "acceptance_criteria": [
        "Удаление счётчика согласовано пользователем; recovery cache и общие спиннеры остаются."
      ],
      "expected_commit_message": "docs: согласовать удаление счётчика токенов",
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "next-modifications-discussion-012",
        "task_id": "T014",
        "role": "implementation"
      }
    },
    {
      "id": "T015",
      "title": "Удалить подсчёт, пагинацию, worker и интерфейс",
      "why": "15.09.2026 пользователь поручил полностью убрать бесполезный для оценки окна счётчик и пересобрать релиз.",
      "dependencies": [
        "T014"
      ],
      "functional_paths": [
        "src/session-tokens.mjs",
        "src/conversation-history.mjs",
        "src/main.mjs",
        "src/workspace-session.mjs",
        "src/ui/sidebar.mjs",
        "src/ui/index.html",
        "src/ui/progress.mjs",
        "tests/session-tokens.test.mjs",
        "tests/conversation-history.test.mjs",
        "tests/electron-smoke.mjs",
        "tests/progress.test.mjs",
        "tests/workspace-session.test.mjs",
        "package.json",
        "package-lock.json"
      ],
      "documentation_paths": [
        "docs/modules/workspace-sessions.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "syntax",
        "suite",
        "electron-smoke"
      ],
      "acceptance_criteria": [
        "Нет фонового подсчёта, дополнительных запросов истории, worker, зависимости и индикаторов счётчика.",
        "Старые оценки удаляются при загрузке storage без потери сессий и привязок."
      ],
      "expected_commit_message": "refactor: полностью удалить подсчёт токенов сессий",
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "next-modifications-discussion-012",
        "task_id": "T015",
        "role": "implementation"
      },
      "file_limit_exception": "Атомарное удаление одного модуля вместе со всеми вызовами, зависимостью, UI и его tests; разбиение оставит неработающие imports."
    },
    {
      "id": "T016",
      "title": "Собрать релиз без счётчика для приёмки",
      "why": "15.09.2026 пользователь поручил полностью убрать бесполезный для оценки окна счётчик и пересобрать релиз.",
      "dependencies": [
        "T015"
      ],
      "functional_paths": [
        "package.json",
        "package-lock.json"
      ],
      "documentation_paths": [
        "docs/modules/workspace-sessions.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md",
        "docs/WORKFLOW_START.md"
      ],
      "verification_ids": [
        "syntax",
        "suite",
        "electron-smoke"
      ],
      "acceptance_criteria": [
        "macOS и Windows packages обновлены до 0.6.12 и не содержат счётчик/tiktoken.",
        "План остаётся открытым до пользовательской проверки."
      ],
      "expected_commit_message": "chore: собрать Web Pilot 0.6.12 без счётчика",
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "next-modifications-discussion-012",
        "task_id": "T016",
        "role": "implementation"
      }
    }
  ],
  "blocked_reason": null,
  "user_decisions": [
    {
      "id": "0241327a-8ae7-4fe3-be7d-2b41db785ea2",
      "text": "14.09.2026 пользователь: «Хорошо, отлично. В принципе можно план данный закрыть и открыть новый для дальнейших модификаций и обсуждений». Предыдущий план workspace-chat-work-sessions-011 закрыт как принятый; новый план открыт для обсуждения. Содержание следующего функционального изменения будет определено следующим поручением пользователя.",
      "recorded_at": "2026-09-14T18:24:17.336Z"
    },
    {
      "id": "session-tiktoken-20260914",
      "text": "Пользователь поручил интегрировать tiktoken и показывать израсходованные токены справа внизу плашки сессии; пользователь сам сравнит показания с реальным контекстным окном. Реализация и локальная сборка для проверки авторизованы. Считаем доступный текст сообщений, отображаем оценку, без процента окна и без изменения Recovery."
    },
    {
      "id": "context-prewarm-20260915",
      "text": "15.09.2026 пользователь поручил проанализировать ускорение передачи контекста более чем вдвое, формировать и хранить его заранее во время работы, реализовать и собрать новый релиз для тестов. Разрешён кэш полного канонического пакета с обязательной проверкой актуальности; содержание и защиты доставки сохраняются."
    },
    {
      "id": "operation-spinners-20260915",
      "text": "Пользователь дополнительно поручил сделать спиннеры выполнения процессов, чтобы было видно, что приложение работает. Включено в текущий релиз."
    },
    {
      "id": "full-session-tokens-20260915",
      "text": "15.09.2026 пользователь повторно указал, что счётчик показывает малый фрагмент вместо всей сессии. Исправление первоначально порученного полного подсчёта и сборка для тестов авторизованы."
    },
    {
      "id": "remove-token-counter-20260915",
      "text": "Пользователь поручил полностью убрать модуль подсчёта токенов, чтобы он не занимал время готовности сессии, и пересобрать релиз. Закрытие плана — после его проверки."
    }
  ]
}
```
<!-- workflow-state:end -->

## Состояние

Execution Scope Status: ACTIVE
Delivery Status: IN_PROGRESS
Scope: next-modifications-discussion-012
Current Task: нет
Revision: 352

## Цель

Быстрая предварительная подготовка актуального контекста и спиннеры операций; экспериментальный счётчик токенов удалён по решению пользователя.

## Критерии приёмки

- Полностью удалён счётчик: нет tokenizer worker, фонового DOM-сэмплинга и загрузки истории для расчёта.
- Сессии и recovery сохраняются; устаревшие локальные оценки очищаются.
- Предварительная подготовка полного актуального контекста и общие спиннеры операций работают.
- macOS/Windows packages пересобраны; пользователь проверяет релиз перед закрытием scope.

## Микрозадачи

- [DONE] T001: Зафиксировать согласованный счётчик токенов сессии — Завершено
  - Git Commit: [DONE] docs: согласовать следующую модификацию Web Pilot
  - Reference: next-modifications-discussion-012 / T001 / implementation
  - Файлы: docs/DECISIONS.md, docs/modules/workspace-sessions.md
- [DONE] T002: Добавить tiktoken, подсчёт и сохранение оценки по сессиям — Завершено
  - Git Commit: [DONE] feat: считать и сохранять токены сессий через tiktoken
  - Reference: next-modifications-discussion-012 / T002 / implementation
  - Файлы: src/session-tokens.mjs, src/workspace-session.mjs, package.json, package-lock.json, tests/session-tokens.test.mjs, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md, docs/modules/workspace-sessions.md
- [DONE] T003: Подключить счётчик к открытому чату и нижнему правому углу сессии — Завершено
  - Git Commit: [DONE] feat: показывать оценку токенов в строках сессий
  - Reference: next-modifications-discussion-012 / T003 / implementation
  - Файлы: src/main.mjs, src/ui/sidebar.mjs, src/ui/index.html, tests/electron-smoke.mjs, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md, docs/modules/workspace-sessions.md
- [DONE] T004: Собрать обновление приложения для проверки пользователем — Завершено
  - Git Commit: [DONE] chore: собрать Web Pilot 0.6.9 со счётчиком токенов
  - Reference: next-modifications-discussion-012 / T004 / implementation
  - Файлы: package.json, package-lock.json, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md, docs/WORKFLOW_START.md, docs/modules/workspace-sessions.md
- [DONE] T005: Зафиксировать анализ и контракт предварительной подготовки контекста — Завершено
  - Git Commit: [DONE] docs: согласовать ускорение подготовки контекста
  - Reference: next-modifications-discussion-012 / T005 / implementation
  - Файлы: docs/modules/workflow-kit-recovery.md, docs/CONTEXT_DELIVERY.md, docs/DECISIONS.md
- [DONE] T006: Добавить проверяемый кэш полного recovery packet — Завершено
  - Git Commit: [DONE] feat: заранее готовить актуальный recovery packet
  - Reference: next-modifications-discussion-012 / T006 / implementation
  - Файлы: src/context-inputs.mjs, src/context-cache.mjs, tests/context-cache.test.mjs, docs/modules/workflow-kit-recovery.md, docs/CONTEXT_DELIVERY.md, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md
- [DONE] T007: Подключить прогрев и проверку перед отправкой — Завершено
  - Git Commit: [DONE] feat: использовать подготовленный контекст при отправке
  - Reference: next-modifications-discussion-012 / T007 / implementation
  - Файлы: src/main.mjs, src/context-session.mjs, src/ui/sidebar.mjs, tests/context-session.test.mjs, tests/electron-smoke.mjs, src/context-cache.mjs, src/context-inputs.mjs, docs/modules/workflow-kit-recovery.md, docs/CONTEXT_DELIVERY.md, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md
- [DONE] T008: Показать выполнение операций спиннерами и понятными этапами — Завершено
  - Git Commit: [DONE] feat: показывать ход операций приложения
  - Reference: next-modifications-discussion-012 / T008 / implementation
  - Файлы: src/ui/progress.mjs, src/ui/sidebar.mjs, src/ui/index.html, src/ui/archive.mjs, src/ui/archive.html, tests/progress.test.mjs, tests/electron-smoke.mjs, src/main.mjs, src/context-cache.mjs, docs/CONTEXT_DELIVERY.md, docs/modules/workspace-sessions.md, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md
- [DONE] T009: Измерить ускорение и собрать релиз 0.6.10 — Завершено
  - Git Commit: [DONE] chore: собрать Web Pilot 0.6.10 с быстрым recovery
  - Reference: next-modifications-discussion-012 / T009 / implementation
  - Файлы: package.json, package-lock.json, docs/modules/workflow-kit-recovery.md, docs/CONTEXT_DELIVERY.md, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md, docs/WORKFLOW_START.md
- [DONE] T010: Зафиксировать исправление подсчёта всей истории — Завершено
  - Git Commit: [DONE] docs: уточнить контракт полного подсчёта истории
  - Reference: next-modifications-discussion-012 / T010 / implementation
  - Файлы: docs/modules/workspace-sessions.md, docs/DECISIONS.md
- [DONE] T011: Загрузить полную историю через наблюдаемую пагинацию ChatGPT — Завершено
  - Git Commit: [DONE] fix: считать полную историю разговора с пагинацией
  - Reference: next-modifications-discussion-012 / T011 / implementation
  - Файлы: src/conversation-history.mjs, src/session-tokens.mjs, tests/conversation-history.test.mjs, tests/session-tokens.test.mjs, docs/modules/workspace-sessions.md, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md
- [DONE] T012: Подключить полную историю и честный статус счётчика — Завершено
  - Git Commit: [DONE] fix: показывать полный подсчёт и загрузку истории
  - Reference: next-modifications-discussion-012 / T012 / implementation
  - Файлы: src/main.mjs, src/ui/sidebar.mjs, src/ui/progress.mjs, tests/electron-smoke.mjs, tests/progress.test.mjs, src/conversation-history.mjs, tests/conversation-history.test.mjs, docs/modules/workspace-sessions.md, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md
- [DONE] T013: Собрать релиз с исправленным счётчиком — Завершено
  - Git Commit: [DONE] chore: собрать Web Pilot 0.6.11 с полной историей
  - Reference: next-modifications-discussion-012 / T013 / implementation
  - Файлы: package.json, package-lock.json, docs/modules/workspace-sessions.md, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md, docs/WORKFLOW_START.md
- [TODO] T014: Зафиксировать отказ от счётчика токенов — Ожидает
  - Git Commit: [PENDING] docs: согласовать удаление счётчика токенов
  - Reference: next-modifications-discussion-012 / T014 / implementation
  - Файлы: docs/modules/workspace-sessions.md, docs/DECISIONS.md
- [TODO] T015: Удалить подсчёт, пагинацию, worker и интерфейс — Ожидает
  - Git Commit: [PENDING] refactor: полностью удалить подсчёт токенов сессий
  - Reference: next-modifications-discussion-012 / T015 / implementation
  - Файлы: src/session-tokens.mjs, src/conversation-history.mjs, src/main.mjs, src/workspace-session.mjs, src/ui/sidebar.mjs, src/ui/index.html, src/ui/progress.mjs, tests/session-tokens.test.mjs, tests/conversation-history.test.mjs, tests/electron-smoke.mjs, tests/progress.test.mjs, tests/workspace-session.test.mjs, package.json, package-lock.json, docs/modules/workspace-sessions.md, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md
- [TODO] T016: Собрать релиз без счётчика для приёмки — Ожидает
  - Git Commit: [PENDING] chore: собрать Web Pilot 0.6.12 без счётчика
  - Reference: next-modifications-discussion-012 / T016 / implementation
  - Файлы: package.json, package-lock.json, docs/modules/workspace-sessions.md, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md, docs/WORKFLOW_START.md

## Context Pack For This Cycle

- docs/architecture/OVERVIEW.md → Краткая архитектура проекта
- docs/modules/workspace-sessions.md → Module Specification — Workspace & Sessions

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
