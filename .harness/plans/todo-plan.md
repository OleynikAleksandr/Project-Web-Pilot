# Активный план — Project Web Pilot

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 695,
  "project_id": "cf944136-d1fc-4bd5-9ea0-e46d1fe230e7",
  "project_name": "Project Web Pilot",
  "scope_id": "session-title-sync-20260928",
  "execution_scope_status": "ACTIVE",
  "delivery_status": "IN_PROGRESS",
  "objective": "Автоматически давать каждой рабочей session Project Web Pilot осмысленное имя по текущей работе и синхронизировать это же server-side имя с соответствующим native conversation ChatGPT.",
  "acceptance_criteria": [
    "Автоматически давать каждой рабочей session Project Web Pilot осмысленное имя по текущей работе и синхронизировать это же server-side имя с соответствующим native conversation ChatGPT."
  ],
  "approved_scope": {
    "functional_paths": [
      "src/workspace-session.mjs",
      "src/plan-monitor.mjs",
      "src/main.mjs",
      "tests/workspace-session.test.mjs",
      "tests/plan-monitor.test.mjs",
      "src/chatgpt-title.mjs",
      "src/chatgpt-dom.mjs",
      "tests/chatgpt-title.test.mjs",
      "tests/chatgpt-dom.test.mjs",
      "src/ui/sidebar.mjs",
      "tests/electron-smoke.mjs",
      "package.json",
      "package-lock.json",
      "src/context-session.mjs",
      "tests/context-session.test.mjs"
    ],
    "documentation_paths": [
      "docs/planning/session-title-sync.md",
      "docs/RELEASE.md",
      "docs/VERIFICATION.md",
      "docs/PRODUCT.md",
      "docs/architecture/ARCHITECTURE.md",
      "docs/architecture/OVERVIEW.md",
      "docs/MODULES.md",
      "docs/DOCUMENTATION_INDEX.md",
      "docs/modules/workspace-sessions.md"
    ]
  },
  "baseline_commit": "65927edb26cedee23affc6505918ed22dff2009a",
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
        "path": "docs/planning/session-title-sync.md",
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
        "scope_id": "session-title-sync-20260928",
        "task_id": "T001",
        "role": "implementation"
      },
      "dependencies": [],
      "functional_paths": [
        "src/workspace-session.mjs",
        "src/plan-monitor.mjs",
        "src/main.mjs",
        "tests/workspace-session.test.mjs",
        "tests/plan-monitor.test.mjs"
      ],
      "documentation_paths": [
        "docs/planning/session-title-sync.md"
      ],
      "verification_ids": [
        "unit"
      ],
      "id": "T001",
      "title": "Восстановить и адаптировать локальное автоимя session к single active plan",
      "why": "В репозитории уже есть проверенная историческая реализация scope naming; нужно вернуть только naming semantics без session-owned plans.",
      "verification_kind": "code",
      "acceptance_criteria": [
        "Selected session получает стабильное auto title из objective и при наличии nextTaskTitle, не меняя current plan ownership.",
        "Marker автоименования принадлежит session: другая session того же workspace не переименовывается при переключении.",
        "Manual title имеет приоритет, page title остаётся только fallback."
      ],
      "expected_commit_message": "feat: restore session-scoped automatic titles",
      "actual_files": [
        "src/main.mjs",
        "src/workspace-session.mjs",
        "tests/workspace-session.test.mjs"
      ]
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "session-title-sync-20260928",
        "task_id": "T002",
        "role": "implementation"
      },
      "dependencies": [
        "T001"
      ],
      "functional_paths": [
        "src/chatgpt-title.mjs",
        "src/chatgpt-dom.mjs",
        "tests/chatgpt-title.test.mjs",
        "tests/chatgpt-dom.test.mjs"
      ],
      "documentation_paths": [
        "docs/planning/session-title-sync.md"
      ],
      "verification_ids": [
        "unit"
      ],
      "id": "T002",
      "title": "Реализовать узкий adapter server-side переименования native ChatGPT conversation",
      "why": "Локальное название не решает задачу Recents; требуется реальное сохранение title в текущем authenticated ChatGPT.",
      "verification_kind": "code",
      "acceptance_criteria": [
        "Adapter адресует только exact bound chatgpt.com conversation и fail closed при mismatch.",
        "Один live probe подтверждает реальное server-side rename: после reload название сохраняется в native Recents.",
        "Реализация не хранит ChatGPT credentials/token вне существующего browser partition и не добавляет внешний сервис."
      ],
      "expected_commit_message": "feat: add native ChatGPT conversation title adapter",
      "actual_files": [
        "src/chatgpt-title.mjs",
        "tests/chatgpt-title.test.mjs"
      ]
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "session-title-sync-20260928",
        "task_id": "T003",
        "role": "implementation"
      },
      "dependencies": [
        "T001",
        "T002"
      ],
      "functional_paths": [
        "src/main.mjs",
        "src/workspace-session.mjs",
        "src/ui/sidebar.mjs",
        "tests/electron-smoke.mjs",
        "tests/workspace-session.test.mjs"
      ],
      "documentation_paths": [
        "docs/planning/session-title-sync.md"
      ],
      "verification_ids": [
        "unit",
        "smoke"
      ],
      "id": "T003",
      "title": "Связать auto/manual local title с native ChatGPT и закрыть регрессии",
      "why": "Оба интерфейса должны получать одно desired title и не перетирать друг друга при page-title events, navigation или retry.",
      "verification_kind": "code",
      "acceptance_criteria": [
        "Auto title и ручное Переименовать используют единый sync path в Web Pilot и native ChatGPT.",
        "Native rename никогда не применяется к соседней session после navigation race.",
        "Временная ошибка native rename не теряет локальное имя; безопасный retry возможен после повторного открытия exact conversation.",
        "Electron smoke закрепляет отсутствие прежней регрессии project plan never renames the selected chat и заменяет её новым session-scoped контрактом."
      ],
      "expected_commit_message": "feat: synchronize Web Pilot and ChatGPT session titles",
      "actual_files": [
        "src/main.mjs",
        "src/workspace-session.mjs",
        "tests/electron-smoke.mjs",
        "tests/workspace-session.test.mjs"
      ]
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "session-title-sync-20260928",
        "task_id": "T004",
        "role": "implementation"
      },
      "dependencies": [
        "T003"
      ],
      "functional_paths": [
        "package.json",
        "package-lock.json"
      ],
      "documentation_paths": [
        "docs/planning/session-title-sync.md",
        "docs/RELEASE.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "package"
      ],
      "id": "T004",
      "title": "Собрать и проверить парный релиз Project Web Pilot 0.6.59",
      "why": "Пользователь проверяет функцию в реальном приложении; macOS и Windows должны выпускаться из одного source state.",
      "verification_kind": "package",
      "acceptance_criteria": [
        "Версия 0.6.59 собрана для macOS arm64 и Windows x64 штатной командой npm run build.",
        "Постоянный macOS app в корне workspace обновлён штатным release pipeline и совпадает с финальным source state.",
        "Versioned delivery содержит обе платформы; live evidence native ChatGPT rename записано в VERIFICATION без приписывания пользовательской приёмки."
      ],
      "expected_commit_message": "release: Project Web Pilot 0.6.59",
      "actual_files": [
        "docs/VERIFICATION.md",
        "package-lock.json",
        "package.json"
      ]
    },
    {
      "id": "T005",
      "title": "Исправить startup reconciliation названия session и native ChatGPT",
      "why": "Реальная приёмка 0.6.59 показала: local explicit scope title и server-side ChatGPT title расходятся после перезапуска, хотя standalone adapter работает.",
      "dependencies": [
        "T004"
      ],
      "functional_paths": [
        "src/chatgpt-title.mjs",
        "src/main.mjs",
        "tests/chatgpt-title.test.mjs",
        "tests/electron-smoke.mjs"
      ],
      "documentation_paths": [
        "docs/planning/session-title-sync.md"
      ],
      "verification_ids": [
        "unit",
        "smoke"
      ],
      "verification_kind": "code",
      "acceptance_criteria": [
        "При открытии exact bound conversation Web Pilot читает server title и не выполняет PATCH, если он уже совпадает с local explicit title.",
        "Если server title отличается, Web Pilot автоматически выполняет PATCH и подтверждает результат GET-readback без пользовательского действия.",
        "TITLE_SYNC_NOT_READY и ранняя загрузка не теряют sync: после did-finish-load/pageLoading=false выполняется bounded retry.",
        "Результаты sync наблюдаемы в безопасной диагностике без access token и без содержимого сообщений."
      ],
      "expected_commit_message": "fix: reconcile session title after ChatGPT load",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "session-title-sync-20260928",
        "task_id": "T005",
        "role": "implementation"
      },
      "actual_files": [
        "docs/planning/session-title-sync.md",
        "src/chatgpt-title.mjs",
        "src/main.mjs",
        "tests/chatgpt-title.test.mjs",
        "tests/electron-smoke.mjs"
      ]
    },
    {
      "id": "T006",
      "title": "Собрать исправленный парный релиз Project Web Pilot 0.6.60",
      "why": "Пользователь должен повторить реальный restart-test на исправленном приложении.",
      "dependencies": [
        "T005"
      ],
      "functional_paths": [
        "package.json",
        "package-lock.json"
      ],
      "documentation_paths": [
        "docs/RELEASE.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "package"
      ],
      "verification_kind": "package",
      "acceptance_criteria": [
        "0.6.60 собран для macOS arm64 и Windows x64 одной release pipeline.",
        "Финальный manifest указывает на зафиксированный source commit и packagedSourceMatches=true.",
        "Корневой и /Applications macOS app обновлены до 0.6.60; native Windows остаётся пользовательской проверкой."
      ],
      "expected_commit_message": "release: Project Web Pilot 0.6.60",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "session-title-sync-20260928",
        "task_id": "T006",
        "role": "implementation"
      },
      "actual_files": [
        "package-lock.json",
        "package.json"
      ]
    },
    {
      "id": "T007",
      "title": "Использовать короткий planning title и server-safe лимит session name",
      "why": "Приёмка 0.6.60 показала HTTP 422: auto-title из objective имеет 160 символов / 262 UTF-8 байта, тогда как короткий 59-символьный title тем же endpoint сохраняется успешно.",
      "dependencies": [
        "T006"
      ],
      "functional_paths": [
        "src/workspace-session.mjs",
        "src/main.mjs",
        "tests/workspace-session.test.mjs",
        "tests/electron-smoke.mjs",
        "src/chatgpt-title.mjs",
        "tests/chatgpt-title.test.mjs"
      ],
      "documentation_paths": [
        "docs/planning/session-title-sync.md"
      ],
      "verification_ids": [
        "unit",
        "smoke"
      ],
      "verification_kind": "code",
      "acceptance_criteria": [
        "Auto-title берётся из H1 обязательного docs/planning (fallback docs/modules), а не из полного objective, когда такой документ доступен.",
        "Session title ограничен 80 Unicode-символами и 200 UTF-8 байтами; manual/page/scope используют один safe normalizer.",
        "Existing titleSource=scope того же scope автоматически обновляется на новый canonical short title; manual title не меняется.",
        "После обновления local scope title существующий native ChatGPT conversation автоматически reconciles тем же sync path."
      ],
      "expected_commit_message": "fix: use concise server-safe session titles",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "session-title-sync-20260928",
        "task_id": "T007",
        "role": "implementation"
      },
      "actual_files": [
        "src/chatgpt-title.mjs",
        "src/main.mjs",
        "src/workspace-session.mjs",
        "tests/chatgpt-title.test.mjs",
        "tests/electron-smoke.mjs",
        "tests/workspace-session.test.mjs"
      ]
    },
    {
      "id": "T008",
      "title": "Собрать исправленный парный релиз Project Web Pilot 0.6.61",
      "why": "Нужен новый restart-test пользователя уже с коротким canonical title и подтверждённой синхронизацией.",
      "dependencies": [
        "T007"
      ],
      "functional_paths": [
        "package.json",
        "package-lock.json"
      ],
      "documentation_paths": [
        "docs/RELEASE.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "package"
      ],
      "verification_kind": "package",
      "acceptance_criteria": [
        "0.6.61 собран для macOS arm64 и Windows x64.",
        "Финальный release manifest соответствует зафиксированному source commit, packagedSourceMatches=true.",
        "Корневой и /Applications macOS app обновлены до 0.6.61; native Windows остаётся пользовательской проверкой."
      ],
      "expected_commit_message": "release: Project Web Pilot 0.6.61",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "session-title-sync-20260928",
        "task_id": "T008",
        "role": "implementation"
      },
      "actual_files": [
        "package-lock.json",
        "package.json"
      ]
    },
    {
      "id": "T009",
      "title": "Убрать циклический title-sync и восстановить мгновенное ручное переименование",
      "why": "Реальная 0.6.61 диагностика показала 20 title-sync за ~30 секунд и HTTP 429; manual rename блокируется, потому что IPC ожидает сетевой sync внутри общей action queue.",
      "dependencies": [
        "T008"
      ],
      "functional_paths": [
        "src/main.mjs",
        "src/context-session.mjs",
        "src/ui/sidebar.mjs",
        "tests/electron-smoke.mjs",
        "tests/context-session.test.mjs"
      ],
      "documentation_paths": [
        "docs/planning/session-title-sync.md"
      ],
      "verification_ids": [
        "unit",
        "smoke"
      ],
      "verification_kind": "code",
      "acceptance_criteria": [
        "Title sync не запускается из общего ContextSession.onChange и не содержит timer/backoff/retry loop.",
        "Автоматический sync выполняется только одноразово после local scope-title change, reopen/navigation exact chat и late bindChat новой session.",
        "Manual rename сохраняет local title и возвращает IPC/UI результат до любого native ChatGPT network request; native sync запускается best-effort отдельно.",
        "429/5xx native title sync не повторяется автоматически до следующего естественного события.",
        "Regression smoke подтверждает ограниченное число title-sync запросов и отсутствие блокировки sidebar action queue."
      ],
      "expected_commit_message": "fix: make title sync event-driven and non-blocking",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "session-title-sync-20260928",
        "task_id": "T009",
        "role": "implementation"
      },
      "actual_files": [
        "src/context-session.mjs",
        "src/main.mjs",
        "tests/context-session.test.mjs",
        "tests/electron-smoke.mjs"
      ]
    },
    {
      "id": "T010",
      "title": "Собрать парный релиз Project Web Pilot 0.6.62",
      "why": "Пользователю нужен релиз без request storm и с работающим ручным rename.",
      "dependencies": [
        "T009"
      ],
      "functional_paths": [
        "package.json",
        "package-lock.json"
      ],
      "documentation_paths": [
        "docs/RELEASE.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "package"
      ],
      "verification_kind": "package",
      "acceptance_criteria": [
        "0.6.62 собран для macOS arm64 и Windows x64.",
        "Финальный manifest соответствует release commit и packagedSourceMatches=true.",
        "Корневой и /Applications macOS app обновлены до 0.6.62."
      ],
      "expected_commit_message": "release: Project Web Pilot 0.6.62",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "session-title-sync-20260928",
        "task_id": "T010",
        "role": "implementation"
      },
      "actual_files": [
        "package-lock.json",
        "package.json"
      ]
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "session-title-sync-20260928",
        "task_id": "DOCS",
        "role": "implementation",
        "iteration": 4
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
        "T010"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/planning/session-title-sync.md",
        "docs/PRODUCT.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/RELEASE.md",
        "docs/VERIFICATION.md",
        "docs/architecture/OVERVIEW.md",
        "docs/MODULES.md",
        "docs/DOCUMENTATION_INDEX.md",
        "docs/modules/workspace-sessions.md"
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
        "docs/DOCUMENTATION_INDEX.md",
        "docs/MODULES.md",
        "docs/PRODUCT.md",
        "docs/RELEASE.md",
        "docs/VERIFICATION.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/architecture/OVERVIEW.md",
        "docs/modules/workspace-sessions.md",
        "docs/planning/session-title-sync.md"
      ]
    }
  ],
  "blocked_reason": null,
  "user_decisions": [
    {
      "id": "d9fa1b93-f2dc-40b7-8fa4-b4880d9d1e59",
      "text": "Пользователь поручил выполнить описанную задачу и план.",
      "recorded_at": "2026-09-28T06:34:05.321Z"
    }
  ]
}
```
<!-- workflow-state:end -->

## Состояние

Execution Scope Status: ACTIVE
Delivery Status: IN_PROGRESS
Scope: session-title-sync-20260928
Current Task: нет
Revision: 695

## Цель

Автоматически давать каждой рабочей session Project Web Pilot осмысленное имя по текущей работе и синхронизировать это же server-side имя с соответствующим native conversation ChatGPT.

## Критерии приёмки

- Автоматически давать каждой рабочей session Project Web Pilot осмысленное имя по текущей работе и синхронизировать это же server-side имя с соответствующим native conversation ChatGPT.

## Микрозадачи

- [DONE] T001: Восстановить и адаптировать локальное автоимя session к single active plan — Завершено
  - Git Commit: [DONE] feat: restore session-scoped automatic titles
  - Reference: session-title-sync-20260928 / T001 / implementation
  - Файлы: src/workspace-session.mjs, src/plan-monitor.mjs, src/main.mjs, tests/workspace-session.test.mjs, tests/plan-monitor.test.mjs, docs/planning/session-title-sync.md
- [DONE] T002: Реализовать узкий adapter server-side переименования native ChatGPT conversation — Завершено
  - Git Commit: [DONE] feat: add native ChatGPT conversation title adapter
  - Reference: session-title-sync-20260928 / T002 / implementation
  - Файлы: src/chatgpt-title.mjs, src/chatgpt-dom.mjs, tests/chatgpt-title.test.mjs, tests/chatgpt-dom.test.mjs, docs/planning/session-title-sync.md
- [DONE] T003: Связать auto/manual local title с native ChatGPT и закрыть регрессии — Завершено
  - Git Commit: [DONE] feat: synchronize Web Pilot and ChatGPT session titles
  - Reference: session-title-sync-20260928 / T003 / implementation
  - Файлы: src/main.mjs, src/workspace-session.mjs, src/ui/sidebar.mjs, tests/electron-smoke.mjs, tests/workspace-session.test.mjs, docs/planning/session-title-sync.md
- [DONE] T004: Собрать и проверить парный релиз Project Web Pilot 0.6.59 — Завершено
  - Git Commit: [DONE] release: Project Web Pilot 0.6.59
  - Reference: session-title-sync-20260928 / T004 / implementation
  - Файлы: package.json, package-lock.json, docs/planning/session-title-sync.md, docs/RELEASE.md, docs/VERIFICATION.md
- [DONE] T005: Исправить startup reconciliation названия session и native ChatGPT — Завершено
  - Git Commit: [DONE] fix: reconcile session title after ChatGPT load
  - Reference: session-title-sync-20260928 / T005 / implementation
  - Файлы: src/chatgpt-title.mjs, src/main.mjs, tests/chatgpt-title.test.mjs, tests/electron-smoke.mjs, docs/planning/session-title-sync.md
- [DONE] T006: Собрать исправленный парный релиз Project Web Pilot 0.6.60 — Завершено
  - Git Commit: [DONE] release: Project Web Pilot 0.6.60
  - Reference: session-title-sync-20260928 / T006 / implementation
  - Файлы: package.json, package-lock.json, docs/RELEASE.md, docs/VERIFICATION.md
- [DONE] T007: Использовать короткий planning title и server-safe лимит session name — Завершено
  - Git Commit: [DONE] fix: use concise server-safe session titles
  - Reference: session-title-sync-20260928 / T007 / implementation
  - Файлы: src/workspace-session.mjs, src/main.mjs, tests/workspace-session.test.mjs, tests/electron-smoke.mjs, src/chatgpt-title.mjs, tests/chatgpt-title.test.mjs, docs/planning/session-title-sync.md
- [DONE] T008: Собрать исправленный парный релиз Project Web Pilot 0.6.61 — Завершено
  - Git Commit: [DONE] release: Project Web Pilot 0.6.61
  - Reference: session-title-sync-20260928 / T008 / implementation
  - Файлы: package.json, package-lock.json, docs/RELEASE.md, docs/VERIFICATION.md
- [DONE] T009: Убрать циклический title-sync и восстановить мгновенное ручное переименование — Завершено
  - Git Commit: [DONE] fix: make title sync event-driven and non-blocking
  - Reference: session-title-sync-20260928 / T009 / implementation
  - Файлы: src/main.mjs, src/context-session.mjs, src/ui/sidebar.mjs, tests/electron-smoke.mjs, tests/context-session.test.mjs, docs/planning/session-title-sync.md
- [DONE] T010: Собрать парный релиз Project Web Pilot 0.6.62 — Завершено
  - Git Commit: [DONE] release: Project Web Pilot 0.6.62
  - Reference: session-title-sync-20260928 / T010 / implementation
  - Файлы: package.json, package-lock.json, docs/RELEASE.md, docs/VERIFICATION.md
- [TODO] DOCS: Актуализация всех документов проекта — Ожидает
  - Git Commit: [PENDING] docs: актуализировать контекст проекта
  - Reference: session-title-sync-20260928 / DOCS / implementation
  - Файлы: docs/planning/session-title-sync.md, docs/PRODUCT.md, docs/architecture/ARCHITECTURE.md, docs/RELEASE.md, docs/VERIFICATION.md, docs/architecture/OVERVIEW.md, docs/MODULES.md, docs/DOCUMENTATION_INDEX.md, docs/modules/workspace-sessions.md

## Context Pack For This Cycle

- docs/architecture/OVERVIEW.md → Краткая архитектура проекта
- docs/MODULES.md → Модули проекта
- docs/DOCUMENTATION_INDEX.md → Каталог документации
- docs/planning/session-title-sync.md

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
