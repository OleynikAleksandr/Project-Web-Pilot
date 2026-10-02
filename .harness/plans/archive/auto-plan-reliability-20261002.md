# Активный план — Project Web Pilot

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 914,
  "project_id": "cf944136-d1fc-4bd5-9ea0-e46d1fe230e7",
  "project_name": "Project Web Pilot",
  "scope_id": "auto-plan-reliability-20261002",
  "execution_scope_status": "ACTIVE",
  "delivery_status": "READY_FOR_ACCEPTANCE",
  "objective": "Устранить ложные остановки режима «Автовыполнение», чтобы Web Pilot самостоятельно отправлял «Продолжай» между микрозадачами и требовал пользователя только при действительно необходимом решении.",
  "acceptance_criteria": [
    "Технические ситуации, которые агент способен исследовать сам, не требуют ручного «Продолжай» пользователя.",
    "Watchdog при busy=true предупреждает, но не выключает AutoPlan.",
    "DRAFT_PRESENT сохраняет пользовательский черновик и оставляет режим способным возобновиться после ручной отправки.",
    "Факт автоматического «Продолжай» остаётся видим в sidebar, а diagnostics содержит машинно-различимую причину остановки/предупреждения.",
    "Unit tests и Electron smoke воспроизводят реальные сценарии 02.10.2026 и проходят."
  ],
  "approved_scope": {
    "functional_paths": [
      "src/auto-plan.mjs",
      "tests/auto-plan.test.mjs",
      "src/ui/sidebar.mjs",
      "tests/electron-smoke.mjs",
      "tests/installed-observer-fixture.cjs",
      "tests/page-state.test.mjs",
      "src/main.mjs",
      "package.json",
      "package-lock.json",
      "scripts/release-all.mjs",
      "scripts/check-installed-release.mjs",
      "src/chatgpt-page-observer.mjs",
      "src/page-state.mjs",
      "tests/auto-plan-restart-fixture.cjs"
    ],
    "documentation_paths": [
      "docs/planning/auto-plan-reliability.md",
      "docs/planning/auto-plan-continuation.md",
      "docs/PRODUCT.md",
      "docs/architecture/ARCHITECTURE.md",
      "docs/architecture/OVERVIEW.md",
      "docs/MODULES.md",
      "docs/DOCUMENTATION_INDEX.md",
      "docs/RELEASE.md",
      "docs/VERIFICATION.md",
      "README.md",
      "AGENTS.md",
      "docs/SOURCE_WORKSPACES.md"
    ]
  },
  "baseline_commit": "b15ae93c1e5d13a7d877ab4eca06b7a6b24c9087",
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
        "path": "docs/planning/auto-plan-reliability.md",
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
        "scope_id": "auto-plan-reliability-20261002",
        "task_id": "T001",
        "role": "implementation"
      },
      "dependencies": [],
      "functional_paths": [
        "src/auto-plan.mjs",
        "tests/auto-plan.test.mjs"
      ],
      "documentation_paths": [
        "docs/planning/auto-plan-reliability.md",
        "docs/planning/auto-plan-continuation.md"
      ],
      "verification_ids": [
        "unit",
        "smoke"
      ],
      "id": "T001",
      "title": "Уточнить контракт агента и критерий реального ожидания пользователя",
      "why": "Исключить ложный «Нужен ваш ответ.» для технических ситуаций, которые агент может разбирать самостоятельно.",
      "verification_kind": "code",
      "acceptance_criteria": [
        "Стартовая инструкция требует «Нужен ваш ответ.» только при необходимости информации, выбора или решения пользователя.",
        "Техническая ошибка, тест, сборка, Git/MCP или совместимость по контракту завершаются «Готов продолжать.», если агент может продолжить самостоятельно.",
        "Ограничение одной микрозадачи на turn и остальные действующие инварианты сохранены.",
        "Стартовая инструкция явно описывает цикл: одна микрозадача, проверка и commit, окончание ответа; Web Pilot автоматически отправляет точное «Продолжай».",
        "Вопрос пользователю задаётся только когда без его информации, выбора или решения корректно продолжать невозможно; техническая диагностика и исправления выполняются самостоятельно."
      ],
      "expected_commit_message": "fix: уточнить контракт ожидания AutoPlan",
      "actual_files": [
        "docs/planning/auto-plan-reliability.md",
        "src/auto-plan.mjs",
        "tests/auto-plan.test.mjs"
      ]
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "auto-plan-reliability-20261002",
        "task_id": "T002",
        "role": "implementation"
      },
      "dependencies": [
        "T001"
      ],
      "functional_paths": [
        "src/auto-plan.mjs",
        "tests/auto-plan.test.mjs",
        "tests/electron-smoke.mjs"
      ],
      "documentation_paths": [
        "docs/planning/auto-plan-reliability.md"
      ],
      "verification_ids": [
        "unit",
        "smoke"
      ],
      "id": "T002",
      "title": "Сделать watchdog диагностическим предупреждением без остановки run",
      "why": "Реальные длинные tool-операции могут не менять видимый текст более трёх минут, оставаясь корректно busy.",
      "verification_kind": "code",
      "acceptance_criteria": [
        "STALL_WARNING при busy=true не переводит AutoPlan в paused и не очищает текущий run.",
        "После последующего прогресса/завершения turn обычная проверка плана и автоматическое продолжение сохраняются.",
        "Watchdog не нажимает Stop и не делает повторный Send."
      ],
      "expected_commit_message": "fix: не останавливать AutoPlan по stall watchdog",
      "actual_files": [
        "docs/planning/auto-plan-reliability.md",
        "src/auto-plan.mjs",
        "tests/auto-plan.test.mjs",
        "tests/electron-smoke.mjs"
      ]
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "auto-plan-reliability-20261002",
        "task_id": "T003",
        "role": "implementation"
      },
      "dependencies": [
        "T002"
      ],
      "functional_paths": [
        "src/auto-plan.mjs",
        "tests/auto-plan.test.mjs",
        "tests/electron-smoke.mjs"
      ],
      "documentation_paths": [
        "docs/planning/auto-plan-reliability.md"
      ],
      "verification_ids": [
        "unit",
        "smoke"
      ],
      "id": "T003",
      "title": "Сохранять включённый AutoPlan при DRAFT_PRESENT и возобновлять после сообщения пользователя",
      "why": "Черновик должен быть защищён без превращения обычной ситуации в ручное восстановление режима.",
      "verification_kind": "code",
      "acceptance_criteria": [
        "DRAFT_PRESENT не изменяет пользовательский черновик.",
        "AutoPlan переходит в ожидающее/suspended состояние, а не полностью выключается.",
        "Фактическая ручная отправка сообщения в том же документе возобновляет существующий run без дополнительного автоматического Send."
      ],
      "expected_commit_message": "fix: возобновлять AutoPlan после пользовательского черновика",
      "actual_files": [
        "docs/planning/auto-plan-reliability.md",
        "src/auto-plan.mjs",
        "tests/auto-plan.test.mjs",
        "tests/electron-smoke.mjs"
      ]
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "auto-plan-reliability-20261002",
        "task_id": "T004",
        "role": "implementation"
      },
      "dependencies": [
        "T003"
      ],
      "functional_paths": [
        "src/auto-plan.mjs",
        "src/ui/sidebar.mjs",
        "tests/auto-plan.test.mjs",
        "tests/electron-smoke.mjs"
      ],
      "documentation_paths": [
        "docs/planning/auto-plan-reliability.md"
      ],
      "verification_ids": [
        "unit",
        "smoke"
      ],
      "id": "T004",
      "title": "Сделать автоматическое «Продолжай» и причины пауз явно наблюдаемыми",
      "why": "Пользователь должен видеть, что Web Pilot действительно продолжил работу, а диагностика должна объяснять остановку без реконструкции по соседним событиям.",
      "verification_kind": "code",
      "acceptance_criteria": [
        "После успешного автоматического Send sidebar устойчиво показывает факт отправки «Продолжай» и номер продолжения текущего запуска.",
        "Значимые pause/wait/warning события AutoPlan содержат безопасный reason code без текста разговора.",
        "Существующие секреты и содержимое сообщений в diagnostics не добавляются."
      ],
      "expected_commit_message": "feat: показать автоматические продолжения AutoPlan",
      "actual_files": [
        "docs/planning/auto-plan-reliability.md",
        "src/auto-plan.mjs",
        "src/ui/sidebar.mjs",
        "tests/auto-plan.test.mjs",
        "tests/electron-smoke.mjs"
      ]
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "auto-plan-reliability-20261002",
        "task_id": "T005",
        "role": "implementation"
      },
      "dependencies": [
        "T004"
      ],
      "functional_paths": [
        "tests/electron-smoke.mjs",
        "tests/installed-observer-fixture.cjs",
        "tests/page-state.test.mjs"
      ],
      "documentation_paths": [
        "docs/planning/auto-plan-reliability.md"
      ],
      "verification_ids": [
        "unit",
        "smoke"
      ],
      "id": "T005",
      "title": "Закрепить реальные сценарии AutoPlan интеграционным smoke",
      "why": "Проверить связку observer → AutoPlan → composer → sidebar на сценариях, которые фактически ломали автовыполнение.",
      "verification_kind": "code",
      "acceptance_criteria": [
        "Smoke подтверждает успешное автоматическое «Продолжай» после контрольной точки.",
        "Smoke подтверждает отсутствие pause от watchdog при продолжающемся busy.",
        "Smoke подтверждает сохранение draft и возобновление после ручной отправки.",
        "Smoke подтверждает корректное ожидание при настоящем «Нужен ваш ответ.» и fail-closed поведение остальных терминальных случаев."
      ],
      "expected_commit_message": "test: закрепить надёжность AutoPlan",
      "actual_files": [
        "docs/planning/auto-plan-reliability.md",
        "tests/electron-smoke.mjs"
      ]
    },
    {
      "id": "T006",
      "title": "Сохранять выбор автовыполнения и восстанавливать работу после перезапуска",
      "why": "Пользователь 02.10.2026 требует постоянный переключатель приложения: включение и выключение определяет только он.",
      "dependencies": [
        "T005"
      ],
      "functional_paths": [
        "src/main.mjs",
        "src/auto-plan.mjs",
        "src/ui/sidebar.mjs",
        "tests/auto-plan.test.mjs",
        "tests/electron-smoke.mjs",
        "tests/installed-observer-fixture.cjs",
        "src/chatgpt-page-observer.mjs",
        "src/page-state.mjs",
        "tests/auto-plan-restart-fixture.cjs",
        "tests/page-state.test.mjs"
      ],
      "documentation_paths": [
        "docs/planning/auto-plan-reliability.md",
        "docs/planning/auto-plan-continuation.md"
      ],
      "verification_ids": [
        "unit",
        "smoke"
      ],
      "verification_kind": "code",
      "acceptance_criteria": [
        "Выбор пользователя сохраняется в существующих настройках приложения и восстанавливается после полного выхода и запуска; выключенное положение также сохраняется.",
        "Положение кнопки не зависит от busy, паузы, watchdog, черновика, вопроса, смены разговора или завершения плана; отключить режим может только пользователь.",
        "В подходящем сохранённом разговоре с незавершённым current plan режим возобновляет цикл без повторного включения кнопки, после проверки фактического плана и состояния страницы.",
        "После перезапуска или reload работающий turn ожидается без повторного Send; реальный вопрос и draft сохраняют ожидание, неизвестный исход отправки не повторяется вслепую.",
        "Node tests и Electron smoke проверяют сохранение обоих положений кнопки, восстановление и отсутствие дублирующего сообщения."
      ],
      "expected_commit_message": "feat: сохранять выбор автовыполнения между запусками",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "auto-plan-reliability-20261002",
        "task_id": "T006",
        "role": "implementation"
      },
      "actual_files": [
        "docs/planning/auto-plan-continuation.md",
        "docs/planning/auto-plan-reliability.md",
        "tests/page-state.test.mjs"
      ]
    },
    {
      "id": "T007",
      "title": "Собрать и проверить новые релизы macOS и Windows",
      "why": "Прямое поручение пользователя 02.10.2026: изменения должны войти в код и новые релизы до финальной актуализации документов.",
      "dependencies": [
        "T006",
        "T008"
      ],
      "functional_paths": [
        "package.json",
        "package-lock.json",
        "scripts/release-all.mjs",
        "scripts/check-installed-release.mjs",
        "tests/installed-observer-fixture.cjs"
      ],
      "documentation_paths": [
        "docs/planning/auto-plan-reliability.md",
        "docs/RELEASE.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "node24",
        "unit",
        "smoke",
        "auto-plan-release"
      ],
      "verification_kind": "package",
      "acceptance_criteria": [
        "Версия повышена после 0.6.75; парная команда npm run build собирает macOS arm64 и Windows x64 из итоговых изменений этого плана.",
        "Постоянный Project Web Pilot.app в корне проекта обновлён с сохранением Finder-identity; ZIP обеих платформ, SHA256SUMS.txt, INSTALL.txt и release-manifest.json доступны в Downloads/WebPilot-<version>/.",
        "Упакованные исходники, версии, архивы и комплектные инструменты сверены; готовая macOS упаковка проверяет AutoPlan через установленный observer fixture.",
        "Финальная DOCS выполняется после этой задачи и описывает фактически собранный выпуск; native Windows и живая пользовательская приёмка не подменяются fixture-проверкой."
      ],
      "expected_commit_message": "build: выпустить исправления AutoPlan для macOS и Windows",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "auto-plan-reliability-20261002",
        "task_id": "T007",
        "role": "implementation"
      },
      "actual_files": [
        "docs/RELEASE.md",
        "docs/planning/auto-plan-reliability.md",
        "package-lock.json",
        "package.json"
      ]
    },
    {
      "id": "T008",
      "title": "Зафиксировать исключённый код постоянного автовыполнения",
      "why": "T006 прошла unit/smoke, но исходники существовали до task:start и были исключены из коммита. Это собственные правки текущей работы; требуется явный состав commit перед сборкой.",
      "dependencies": [
        "T006"
      ],
      "functional_paths": [
        "src/auto-plan.mjs",
        "src/chatgpt-page-observer.mjs",
        "src/main.mjs",
        "src/page-state.mjs",
        "src/ui/sidebar.mjs",
        "tests/auto-plan-restart-fixture.cjs",
        "tests/auto-plan.test.mjs",
        "tests/electron-smoke.mjs"
      ],
      "documentation_paths": [
        "docs/planning/auto-plan-reliability.md"
      ],
      "verification_ids": [
        "unit",
        "smoke"
      ],
      "verification_kind": "code",
      "acceptance_criteria": [
        "Все исключённые исходники и restart fixture включены явно в Git-коммит, рабочее дерево чистое перед T007.",
        "Настройки сохраняют выбор пользователя и отметку Send; восстановление, draft, question, busy и unknown проходят проверки."
      ],
      "expected_commit_message": "fix: завершить фиксацию постоянного автовыполнения",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "auto-plan-reliability-20261002",
        "task_id": "T008",
        "role": "implementation"
      },
      "actual_files": [
        "src/auto-plan.mjs",
        "src/chatgpt-page-observer.mjs",
        "src/main.mjs",
        "src/page-state.mjs",
        "src/ui/sidebar.mjs",
        "tests/auto-plan-restart-fixture.cjs",
        "tests/auto-plan.test.mjs",
        "tests/electron-smoke.mjs",
        "docs/planning/auto-plan-reliability.md"
      ]
    },
    {
      "id": "T009",
      "title": "Актуализировать документацию перед публикацией",
      "why": "Пользователь требует публикацию трёх связанных репозиториев и актуальных релизов после обновления документов.",
      "dependencies": [
        "T007"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/planning/auto-plan-reliability.md",
        "docs/PRODUCT.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/planning/auto-plan-continuation.md",
        "docs/architecture/OVERVIEW.md",
        "docs/MODULES.md",
        "docs/DOCUMENTATION_INDEX.md",
        "docs/RELEASE.md",
        "docs/VERIFICATION.md",
        "README.md",
        "AGENTS.md"
      ],
      "verification_ids": [],
      "verification_kind": "code",
      "acceptance_criteria": [
        "Документы Project Web Pilot описывают фактическую поставку 0.6.76 и завершённые исправления AutoPlan.",
        "Проверены актуальность описаний и взаимных ссылок Project Web Pilot, WorkflowKit и Web Pilot Sidebar; необходимые правки связанных репозиториев выполняются по их локальным правилам без присвоения чужих изменений.",
        "Зафиксированы версии и готовые артефакты для последующей публикации; финальная DOCS остаётся проверкой после публикаций."
      ],
      "expected_commit_message": "docs: подготовить документацию к публикации",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "auto-plan-reliability-20261002",
        "task_id": "T009",
        "role": "implementation"
      },
      "actual_files": [
        "AGENTS.md",
        "README.md",
        "docs/DOCUMENTATION_INDEX.md",
        "docs/MODULES.md",
        "docs/PRODUCT.md",
        "docs/RELEASE.md",
        "docs/VERIFICATION.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/architecture/OVERVIEW.md",
        "docs/planning/auto-plan-continuation.md",
        "docs/planning/auto-plan-reliability.md"
      ]
    },
    {
      "id": "T010",
      "title": "Опубликовать Project Web Pilot и релиз 0.6.76 на GitHub",
      "why": "Прямое поручение пользователя 02.10.2026 15:35: загрузить три связанных репозитория и актуальные релизы.",
      "dependencies": [
        "T009"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/RELEASE.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [],
      "verification_kind": "code",
      "acceptance_criteria": [
        "Проверены remote и локальные коммиты; main Project-Web-Pilot синхронизирован с GitHub без force push.",
        "Опубликован релиз v0.6.76 с macOS arm64 ZIP, Windows x64 ZIP, SHA256SUMS.txt, INSTALL.txt и release-manifest.json.",
        "Тег указывает на корректный release commit; серверные имена, размеры и контрольные суммы артефактов сверены с локальной поставкой; ссылки записаны в документах."
      ],
      "expected_commit_message": "docs: подтвердить публикацию Web Pilot 0.6.76",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "auto-plan-reliability-20261002",
        "task_id": "T010",
        "role": "implementation"
      },
      "actual_files": [
        "docs/RELEASE.md",
        "docs/VERIFICATION.md"
      ]
    },
    {
      "id": "T011",
      "title": "Опубликовать WorkflowKit и его актуальный релиз на GitHub",
      "why": "Прямое поручение пользователя о публикации связанного WorkflowKit.",
      "dependencies": [
        "T009"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/SOURCE_WORKSPACES.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [],
      "verification_kind": "code",
      "acceptance_criteria": [
        "Прочитаны фактическое состояние и правила /Users/oleksandroliinyk/VSCODE/WorkflowKit; подтверждена актуальная готовая версия.",
        "Коммиты WorkflowKit синхронизированы с origin main без force push и без включения посторонних незавершённых правок.",
        "Актуальный GitHub Release и предусмотренные проектом артефакты опубликованы или подтверждены уже актуальными; тег и серверные файлы проверены, ссылка и результат записаны."
      ],
      "expected_commit_message": "docs: подтвердить публикацию WorkflowKit",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "auto-plan-reliability-20261002",
        "task_id": "T011",
        "role": "implementation"
      },
      "actual_files": [
        "docs/SOURCE_WORKSPACES.md",
        "docs/VERIFICATION.md"
      ]
    },
    {
      "id": "T012",
      "title": "Опубликовать Web Pilot Sidebar и его актуальный релиз на GitHub",
      "why": "Прямое поручение пользователя о публикации третьего связанного репозитория Web Pilot Sidebar.",
      "dependencies": [
        "T009"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/SOURCE_WORKSPACES.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [],
      "verification_kind": "code",
      "acceptance_criteria": [
        "Прочитаны фактическое состояние и правила /Users/oleksandroliinyk/VSCODE/Web Pilot Sidebar; подтверждена актуальная готовая версия.",
        "Коммиты Web-Pilot-Sidebar синхронизированы с origin main без force push и без присвоения правок параллельной разработки.",
        "Актуальный GitHub Release и предусмотренные проектом артефакты опубликованы или подтверждены уже актуальными; тег и серверные файлы проверены, ссылка и результат записаны."
      ],
      "expected_commit_message": "docs: подтвердить публикацию Web Pilot Sidebar",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "auto-plan-reliability-20261002",
        "task_id": "T012",
        "role": "implementation"
      },
      "actual_files": [
        "docs/SOURCE_WORKSPACES.md",
        "docs/VERIFICATION.md"
      ]
    },
    {
      "id": "T013",
      "title": "Дополнить релиз Web Pilot Sidebar подписанным macOS DMG",
      "why": "Дополнить релиз Web Pilot Sidebar подписанным macOS DMG",
      "dependencies": [],
      "functional_paths": [],
      "documentation_paths": [
        "docs/SOURCE_WORKSPACES.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [],
      "verification_kind": "code",
      "acceptance_criteria": [
        "К существующему GitHub Release Web Pilot Sidebar v0.1.0 добавлен готовый подписанный macOS DMG без изменения release tag.",
        "Серверные имя, размер и SHA-256 DMG совпадают с локальным файлом; внутри DMG приложение проходит codesign, Gatekeeper и stapler validation.",
        "Документы фиксируют актуальный Sidebar main после параллельного commit 0fab32a и честно отмечают, что TestFlight не опубликован из-за отсутствующего App Store Connect app record."
      ],
      "expected_commit_message": "docs: дополнить релиз Sidebar подписанным DMG",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "auto-plan-reliability-20261002",
        "task_id": "T013",
        "role": "implementation"
      },
      "actual_files": [
        "docs/SOURCE_WORKSPACES.md",
        "docs/VERIFICATION.md"
      ]
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "auto-plan-reliability-20261002",
        "task_id": "DOCS",
        "role": "implementation"
      },
      "dependencies": [
        "T001",
        "T002",
        "T003",
        "T004",
        "T005",
        "T006",
        "T007",
        "T008",
        "T009",
        "T010",
        "T011",
        "T012",
        "T013"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/planning/auto-plan-reliability.md",
        "docs/PRODUCT.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/planning/auto-plan-continuation.md",
        "docs/architecture/OVERVIEW.md",
        "docs/MODULES.md",
        "docs/DOCUMENTATION_INDEX.md",
        "docs/RELEASE.md",
        "docs/VERIFICATION.md",
        "README.md",
        "AGENTS.md",
        "docs/SOURCE_WORKSPACES.md"
      ],
      "verification_ids": [],
      "id": "DOCS",
      "title": "Актуализация всех документов проекта",
      "why": "Сохранить актуальный контекст для следующего агента",
      "acceptance_criteria": [
        "Документы соответствуют результату",
        "Основная актуализация документации выполнена в T009 до публикаций T010–T012; финальная DOCS проверяет итоговые ссылки, версии и соответствие публикаций.",
        "После финального DOCS-коммита актуальные коммиты документации отправлены на GitHub; проверено совпадение локального и удалённого HEAD всех трёх репозиториев."
      ],
      "expected_commit_message": "docs: актуализировать контекст проекта",
      "actual_files": [
        "docs/VERIFICATION.md"
      ]
    }
  ],
  "blocked_reason": null,
  "user_decisions": [
    {
      "id": "0ecf22cd-8c55-4809-967f-9f32e07c7a0b",
      "text": "Пользователь поручил выполнить описанную задачу и план.",
      "recorded_at": "2026-10-02T11:30:26.231Z"
    }
  ]
}
```
<!-- workflow-state:end -->

## Состояние

Execution Scope Status: ACTIVE
Delivery Status: READY_FOR_ACCEPTANCE
Scope: auto-plan-reliability-20261002
Current Task: нет
Revision: 914

## Цель

Устранить ложные остановки режима «Автовыполнение», чтобы Web Pilot самостоятельно отправлял «Продолжай» между микрозадачами и требовал пользователя только при действительно необходимом решении.

## Критерии приёмки

- Технические ситуации, которые агент способен исследовать сам, не требуют ручного «Продолжай» пользователя.
- Watchdog при busy=true предупреждает, но не выключает AutoPlan.
- DRAFT_PRESENT сохраняет пользовательский черновик и оставляет режим способным возобновиться после ручной отправки.
- Факт автоматического «Продолжай» остаётся видим в sidebar, а diagnostics содержит машинно-различимую причину остановки/предупреждения.
- Unit tests и Electron smoke воспроизводят реальные сценарии 02.10.2026 и проходят.

## Микрозадачи

- [DONE] T001: Уточнить контракт агента и критерий реального ожидания пользователя — Завершено
  - Git Commit: [DONE] fix: уточнить контракт ожидания AutoPlan
  - Reference: auto-plan-reliability-20261002 / T001 / implementation
  - Файлы: src/auto-plan.mjs, tests/auto-plan.test.mjs, docs/planning/auto-plan-reliability.md, docs/planning/auto-plan-continuation.md
- [DONE] T002: Сделать watchdog диагностическим предупреждением без остановки run — Завершено
  - Git Commit: [DONE] fix: не останавливать AutoPlan по stall watchdog
  - Reference: auto-plan-reliability-20261002 / T002 / implementation
  - Файлы: src/auto-plan.mjs, tests/auto-plan.test.mjs, tests/electron-smoke.mjs, docs/planning/auto-plan-reliability.md
- [DONE] T003: Сохранять включённый AutoPlan при DRAFT_PRESENT и возобновлять после сообщения пользователя — Завершено
  - Git Commit: [DONE] fix: возобновлять AutoPlan после пользовательского черновика
  - Reference: auto-plan-reliability-20261002 / T003 / implementation
  - Файлы: src/auto-plan.mjs, tests/auto-plan.test.mjs, tests/electron-smoke.mjs, docs/planning/auto-plan-reliability.md
- [DONE] T004: Сделать автоматическое «Продолжай» и причины пауз явно наблюдаемыми — Завершено
  - Git Commit: [DONE] feat: показать автоматические продолжения AutoPlan
  - Reference: auto-plan-reliability-20261002 / T004 / implementation
  - Файлы: src/auto-plan.mjs, src/ui/sidebar.mjs, tests/auto-plan.test.mjs, tests/electron-smoke.mjs, docs/planning/auto-plan-reliability.md
- [DONE] T005: Закрепить реальные сценарии AutoPlan интеграционным smoke — Завершено
  - Git Commit: [DONE] test: закрепить надёжность AutoPlan
  - Reference: auto-plan-reliability-20261002 / T005 / implementation
  - Файлы: tests/electron-smoke.mjs, tests/installed-observer-fixture.cjs, tests/page-state.test.mjs, docs/planning/auto-plan-reliability.md
- [DONE] T006: Сохранять выбор автовыполнения и восстанавливать работу после перезапуска — Завершено
  - Git Commit: [DONE] feat: сохранять выбор автовыполнения между запусками
  - Reference: auto-plan-reliability-20261002 / T006 / implementation
  - Файлы: src/main.mjs, src/auto-plan.mjs, src/ui/sidebar.mjs, tests/auto-plan.test.mjs, tests/electron-smoke.mjs, tests/installed-observer-fixture.cjs, src/chatgpt-page-observer.mjs, src/page-state.mjs, tests/auto-plan-restart-fixture.cjs, tests/page-state.test.mjs, docs/planning/auto-plan-reliability.md, docs/planning/auto-plan-continuation.md
- [DONE] T007: Собрать и проверить новые релизы macOS и Windows — Завершено
  - Git Commit: [DONE] build: выпустить исправления AutoPlan для macOS и Windows
  - Reference: auto-plan-reliability-20261002 / T007 / implementation
  - Файлы: package.json, package-lock.json, scripts/release-all.mjs, scripts/check-installed-release.mjs, tests/installed-observer-fixture.cjs, docs/planning/auto-plan-reliability.md, docs/RELEASE.md, docs/VERIFICATION.md
- [DONE] T008: Зафиксировать исключённый код постоянного автовыполнения — Завершено
  - Git Commit: [DONE] fix: завершить фиксацию постоянного автовыполнения
  - Reference: auto-plan-reliability-20261002 / T008 / implementation
  - Файлы: src/auto-plan.mjs, src/chatgpt-page-observer.mjs, src/main.mjs, src/page-state.mjs, src/ui/sidebar.mjs, tests/auto-plan-restart-fixture.cjs, tests/auto-plan.test.mjs, tests/electron-smoke.mjs, docs/planning/auto-plan-reliability.md
- [DONE] T009: Актуализировать документацию перед публикацией — Завершено
  - Git Commit: [DONE] docs: подготовить документацию к публикации
  - Reference: auto-plan-reliability-20261002 / T009 / implementation
  - Файлы: docs/planning/auto-plan-reliability.md, docs/PRODUCT.md, docs/architecture/ARCHITECTURE.md, docs/planning/auto-plan-continuation.md, docs/architecture/OVERVIEW.md, docs/MODULES.md, docs/DOCUMENTATION_INDEX.md, docs/RELEASE.md, docs/VERIFICATION.md, README.md, AGENTS.md
- [DONE] T010: Опубликовать Project Web Pilot и релиз 0.6.76 на GitHub — Завершено
  - Git Commit: [DONE] docs: подтвердить публикацию Web Pilot 0.6.76
  - Reference: auto-plan-reliability-20261002 / T010 / implementation
  - Файлы: docs/RELEASE.md, docs/VERIFICATION.md
- [DONE] T011: Опубликовать WorkflowKit и его актуальный релиз на GitHub — Завершено
  - Git Commit: [DONE] docs: подтвердить публикацию WorkflowKit
  - Reference: auto-plan-reliability-20261002 / T011 / implementation
  - Файлы: docs/SOURCE_WORKSPACES.md, docs/VERIFICATION.md
- [DONE] T012: Опубликовать Web Pilot Sidebar и его актуальный релиз на GitHub — Завершено
  - Git Commit: [DONE] docs: подтвердить публикацию Web Pilot Sidebar
  - Reference: auto-plan-reliability-20261002 / T012 / implementation
  - Файлы: docs/SOURCE_WORKSPACES.md, docs/VERIFICATION.md
- [DONE] T013: Дополнить релиз Web Pilot Sidebar подписанным macOS DMG — Завершено
  - Git Commit: [DONE] docs: дополнить релиз Sidebar подписанным DMG
  - Reference: auto-plan-reliability-20261002 / T013 / implementation
  - Файлы: docs/SOURCE_WORKSPACES.md, docs/VERIFICATION.md
- [DONE] DOCS: Актуализация всех документов проекта — Завершено
  - Git Commit: [DONE] docs: актуализировать контекст проекта
  - Reference: auto-plan-reliability-20261002 / DOCS / implementation
  - Файлы: docs/planning/auto-plan-reliability.md, docs/PRODUCT.md, docs/architecture/ARCHITECTURE.md, docs/planning/auto-plan-continuation.md, docs/architecture/OVERVIEW.md, docs/MODULES.md, docs/DOCUMENTATION_INDEX.md, docs/RELEASE.md, docs/VERIFICATION.md, README.md, AGENTS.md, docs/SOURCE_WORKSPACES.md

## Context Pack For This Cycle

- docs/architecture/OVERVIEW.md → Краткая архитектура проекта
- docs/MODULES.md → Модули проекта
- docs/DOCUMENTATION_INDEX.md → Каталог документации
- docs/planning/auto-plan-reliability.md

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
