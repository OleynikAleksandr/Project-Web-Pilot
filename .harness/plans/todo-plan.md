# Активный план — Project Web Pilot

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 301,
  "project_id": "cf944136-d1fc-4bd5-9ea0-e46d1fe230e7",
  "project_name": "Project Web Pilot",
  "scope_id": "workspace-chat-work-sessions-011",
  "execution_scope_status": "ACTIVE",
  "delivery_status": "READY_FOR_ACCEPTANCE",
  "objective": "Добавить в Workspace & Sessions явный выбор Chat или Work для первой и дополнительных сессий проекта, сохранить experience в session model, перенести создание сессий в меню проекта и открыть выбранный ChatGPT experience без изменения Recovery flow.",
  "acceptance_criteria": [
    "Каждая session имеет persisted experience chat|work и старое хранилище мигрируется без потери данных.",
    "Меню проекта содержит Новый Chat и Новый Work; контекстная карточка больше не создаёт сессии.",
    "Новый и впервые подключаемый проект требуют явного выбора первой сессии Chat/Work с default Chat; известный проект восстанавливает существующую сессию без нового выбора.",
    "В дереве сессий рядом с названием отображается read-only badge Chat/Work.",
    "Надёжный фактический способ открытия чистого Work подтверждён на текущем ChatGPT Web и покрыт fallback/regression.",
    "Chat и Work используют один и тот же Context Recovery flow и привязывают только concrete conversation URL своего experience.",
    "Полный test/smoke/build проходит, macOS и Windows packages пересобраны; пользователь выполняет финальную ручную приёмку релиза."
  ],
  "approved_scope": {
    "functional_paths": [
      "src/workspace-session.mjs",
      "src/main.mjs",
      "src/preload.cjs",
      "src/ui/index.html",
      "src/ui/sidebar.mjs",
      "src/ui/workspace-setup.mjs",
      "src/chatgpt-experience.mjs",
      "tests/workspace-session.test.mjs",
      "tests/chatgpt-experience.test.mjs",
      "tests/electron-smoke.mjs",
      "package.json",
      "package-lock.json",
      "src/context-session.mjs",
      "tests/context-session.test.mjs"
    ],
    "documentation_paths": [
      "docs/modules/workspace-sessions.md",
      "docs/MODULES.md",
      "docs/DOCUMENTATION_INDEX.md",
      "docs/WORKSPACE_SETUP.md",
      "docs/WORKFLOW_START.md",
      "docs/architecture/ARCHITECTURE.md",
      "docs/VERIFICATION.md"
    ],
    "max_functional_files_per_task": 8
  },
  "baseline_commit": "f66816023d4ec664dc728a92c8d058db5f961936",
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
      },
      {
        "path": "docs/WORKSPACE_SETUP.md",
        "heading_path": [
          "Создание и подключение workspace"
        ],
        "required": false,
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
        "docs/modules/workspace-sessions.md",
        "docs/MODULES.md",
        "docs/DOCUMENTATION_INDEX.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [],
      "id": "T001",
      "title": "Подтвердить Work entrypoint и зафиксировать Workspace Sessions contract",
      "why": "Не зашивать в Web Pilot предположительный Work URL или хрупкий DOM selector; сначала проверить фактическое поведение текущего ChatGPT Web и сохранить согласованный контракт модуля.",
      "acceptance_criteria": [
        "На текущем ChatGPT Web определён воспроизводимый способ открыть чистый Work либо документирован безопасный UI fallback.",
        "Module specification содержит окончательный Chat/Work data/UI/routing contract и first-session semantics."
      ],
      "expected_commit_message": "docs: определить Chat и Work sessions",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "workspace-chat-work-sessions-011",
        "task_id": "T001",
        "role": "implementation"
      }
    },
    {
      "dependencies": [
        "T001"
      ],
      "functional_paths": [
        "src/workspace-session.mjs",
        "tests/workspace-session.test.mjs"
      ],
      "documentation_paths": [
        "docs/modules/workspace-sessions.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "suite"
      ],
      "id": "T002",
      "title": "Мигрировать session model на experience Chat Work",
      "why": "Тип сессии должен быть устойчивым persisted свойством, а не выводом UI на лету.",
      "acceptance_criteria": [
        "Session schema хранит experience chat|work и newSession(workspace, experience) валидирует тип.",
        "Legacy storage мигрируется: Work URL->work, обычный URL/непривязанная старая session->chat.",
        "bindChat отклоняет concrete conversation URL, не соответствующий experience выбранной session."
      ],
      "expected_commit_message": "feat: добавить experience сессии",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "workspace-chat-work-sessions-011",
        "task_id": "T002",
        "role": "implementation"
      }
    },
    {
      "dependencies": [
        "T002"
      ],
      "functional_paths": [
        "src/main.mjs",
        "src/preload.cjs",
        "src/ui/index.html",
        "src/ui/sidebar.mjs",
        "src/ui/workspace-setup.mjs",
        "tests/electron-smoke.mjs",
        "src/workspace-session.mjs",
        "tests/workspace-session.test.mjs"
      ],
      "documentation_paths": [
        "docs/modules/workspace-sessions.md",
        "docs/WORKSPACE_SETUP.md",
        "docs/VERIFICATION.md",
        "docs/architecture/ARCHITECTURE.md"
      ],
      "verification_ids": [
        "suite",
        "electron-smoke"
      ],
      "id": "T003",
      "title": "Перенести создание Chat Work в проектный UI и первую сессию",
      "why": "Создание сессии относится к проекту; пользователь должен выбирать experience как для дополнительных, так и для первой session.",
      "acceptance_criteria": [
        "Проектное меню содержит Новый Chat и Новый Work; контекстная карточка содержит только действия текущего контекста.",
        "Форма нового/впервые подключаемого проекта показывает выбор первой сессии Chat|Work с default Chat.",
        "Повторное открытие зарегистрированного проекта не предлагает first-session choice и не создаёт session.",
        "Session tree показывает badge Chat/Work справа от названия.",
        "Session schema v4 и newSession(workspace, experience) реализованы вместе с UI и покрыты migration/cross-experience tests."
      ],
      "expected_commit_message": "feat: добавить UI Chat и Work sessions",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "workspace-chat-work-sessions-011",
        "task_id": "T003",
        "role": "implementation"
      }
    },
    {
      "dependencies": [
        "T003"
      ],
      "functional_paths": [
        "src/chatgpt-experience.mjs",
        "src/main.mjs",
        "tests/chatgpt-experience.test.mjs",
        "tests/electron-smoke.mjs",
        "src/context-session.mjs",
        "tests/context-session.test.mjs"
      ],
      "documentation_paths": [
        "docs/modules/workspace-sessions.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "suite",
        "electron-smoke"
      ],
      "id": "T004",
      "title": "Интегрировать Chat Work experience routing с recovery",
      "why": "Новая session должна открыть правильный ChatGPT experience до первой отправки, сохранив существующий безопасный recovery protocol.",
      "acceptance_criteria": [
        "Chat session открывает обычный ChatGPT, Work session — подтверждённый Work experience.",
        "Routing не выбирает конкретную модель и не изменяет Context Recovery.",
        "После первой отправки conversation URL соответствует experience и сохраняется в session.",
        "При изменении ChatGPT UI/route Work fallback fail-closed не отправляет recovery в неправильный experience."
      ],
      "expected_commit_message": "feat: маршрутизировать Chat и Work sessions",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "workspace-chat-work-sessions-011",
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
        "tests/electron-smoke.mjs"
      ],
      "documentation_paths": [
        "docs/WORKFLOW_START.md",
        "docs/modules/workspace-sessions.md",
        "docs/VERIFICATION.md",
        "docs/architecture/ARCHITECTURE.md"
      ],
      "verification_ids": [
        "suite",
        "electron-smoke"
      ],
      "id": "T005",
      "title": "Собрать релиз Chat Work sessions",
      "why": "Передать пользователю новую сборку для фактической проверки обеих разновидностей сессии.",
      "acceptance_criteria": [
        "Версия приложения повышена и полный npm test/Electron smoke проходят.",
        "Общий npm run build создаёт macOS arm64 и Windows x64 packages; Windows verifier проходит.",
        "Scope остаётся READY_FOR_ACCEPTANCE для ручной проверки пользователем; автоматическая архивация не выполняется."
      ],
      "expected_commit_message": "build: выпустить Chat и Work sessions",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "workspace-chat-work-sessions-011",
        "task_id": "T005",
        "role": "implementation"
      }
    },
    {
      "id": "T006",
      "title": "Исправить URL-контракт Work conversation",
      "why": "Реальный ChatGPT Work после создания разговора переходит с /work/ на обычный /c/<id>; persisted experience должен оставаться Work и такой concrete URL должен быть допустим.",
      "dependencies": [
        "T005"
      ],
      "functional_paths": [
        "src/workspace-session.mjs",
        "tests/workspace-session.test.mjs"
      ],
      "documentation_paths": [
        "docs/modules/workspace-sessions.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md"
      ],
      "acceptance_criteria": [
        "Work session может сохранить concrete /c/<id> после подтверждённой Work-отправки, не меняя experience=work.",
        "Legacy migration по-прежнему трактует старый /c/<id> как Chat, потому что в старой schema experience отсутствовал.",
        "Chat session не принимает явно Work-only URL namespace."
      ],
      "verification_ids": [
        "suite"
      ],
      "expected_commit_message": "fix: разрешить Work conversation на общем URL",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "workspace-chat-work-sessions-011",
        "task_id": "T006",
        "role": "implementation"
      }
    },
    {
      "id": "T007",
      "title": "Исправить fail-closed guard Work после отправки",
      "why": "Fail-closed должен проверять Work entrypoint до recovery, но не ошибочно отвергать /c/<id> после того, как recovery уже наблюдаемо отправлен из Work.",
      "dependencies": [
        "T006"
      ],
      "functional_paths": [
        "src/context-session.mjs",
        "tests/context-session.test.mjs",
        "tests/electron-smoke.mjs"
      ],
      "documentation_paths": [
        "docs/modules/workspace-sessions.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md"
      ],
      "acceptance_criteria": [
        "Новая unbound Work session на обычном Chat URL по-прежнему блокируется до loadContext/send.",
        "После наблюдаемой Work-отправки переход на /c/<id> допускается и conversation URL привязывается только если request marker виден в текущем чате.",
        "Уже привязанная Work session открывается по exact сохранённому /c/<id> без ложного mismatch."
      ],
      "verification_ids": [
        "suite",
        "electron-smoke"
      ],
      "expected_commit_message": "fix: сохранить Work provenance после отправки",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "workspace-chat-work-sessions-011",
        "task_id": "T007",
        "role": "implementation"
      }
    },
    {
      "id": "T008",
      "title": "Собрать исправленный релиз Work sessions",
      "why": "Передать пользователю исправленную сборку после реальной ошибки приёмки.",
      "dependencies": [
        "T007"
      ],
      "functional_paths": [
        "package.json",
        "package-lock.json"
      ],
      "documentation_paths": [
        "docs/WORKFLOW_START.md",
        "docs/modules/workspace-sessions.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md"
      ],
      "acceptance_criteria": [
        "Версия повышена до patch release и полный test/smoke проходят.",
        "Общий build создаёт macOS arm64 и Windows x64 packages; Windows verifier проходит.",
        "Scope снова READY_FOR_ACCEPTANCE и остаётся ACTIVE до команды пользователя."
      ],
      "verification_ids": [
        "suite",
        "electron-smoke"
      ],
      "expected_commit_message": "build: выпустить исправление Work sessions",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "workspace-chat-work-sessions-011",
        "task_id": "T008",
        "role": "implementation"
      }
    }
  ],
  "blocked_reason": null,
  "user_decisions": [
    {
      "id": "469c2e28-ca0d-41d1-b1e9-1e3063381825",
      "text": "14.09.2026 пользователь согласовал UX и контракт: в меню проекта две команды Новый Chat / Новый Work; из карточки контекста убрать создание чата; при создании нового или первом подключении проекта выбирать первую сессию Chat/Work с default Chat; в дереве сессий справа показывать badge Chat/Work; Recovery одинаков для обоих режимов. Разрешена реализация и сборка, финальная проверка релиза остаётся за пользователем.",
      "recorded_at": "2026-09-14T08:39:01.478Z"
    },
    {
      "id": "work-url-real-20260914",
      "text": "14.09.2026 при реальной приёмке пользователь показал Work UI с Astra и ошибку CHATGPT_EXPERIENCE_MISMATCH. Production diagnostics подтвердили: Work стартует на /work/, но созданный Work conversation переходит на общий /c/<id>. Пользователь поручил исправить ошибку и закончить план.",
      "recorded_at": "2026-09-14T10:16:15+02:00"
    }
  ]
}
```
<!-- workflow-state:end -->

## Состояние

Execution Scope Status: ACTIVE
Delivery Status: READY_FOR_ACCEPTANCE
Scope: workspace-chat-work-sessions-011
Current Task: нет
Revision: 301

## Цель

Добавить в Workspace & Sessions явный выбор Chat или Work для первой и дополнительных сессий проекта, сохранить experience в session model, перенести создание сессий в меню проекта и открыть выбранный ChatGPT experience без изменения Recovery flow.

## Критерии приёмки

- Каждая session имеет persisted experience chat|work и старое хранилище мигрируется без потери данных.
- Меню проекта содержит Новый Chat и Новый Work; контекстная карточка больше не создаёт сессии.
- Новый и впервые подключаемый проект требуют явного выбора первой сессии Chat/Work с default Chat; известный проект восстанавливает существующую сессию без нового выбора.
- В дереве сессий рядом с названием отображается read-only badge Chat/Work.
- Надёжный фактический способ открытия чистого Work подтверждён на текущем ChatGPT Web и покрыт fallback/regression.
- Chat и Work используют один и тот же Context Recovery flow и привязывают только concrete conversation URL своего experience.
- Полный test/smoke/build проходит, macOS и Windows packages пересобраны; пользователь выполняет финальную ручную приёмку релиза.

## Микрозадачи

- [DONE] T001: Подтвердить Work entrypoint и зафиксировать Workspace Sessions contract — Завершено
  - Git Commit: [DONE] docs: определить Chat и Work sessions
  - Reference: workspace-chat-work-sessions-011 / T001 / implementation
  - Файлы: docs/modules/workspace-sessions.md, docs/MODULES.md, docs/DOCUMENTATION_INDEX.md, docs/VERIFICATION.md
- [DONE] T002: Мигрировать session model на experience Chat Work — Завершено
  - Git Commit: [DONE] feat: добавить experience сессии
  - Reference: workspace-chat-work-sessions-011 / T002 / implementation
  - Файлы: src/workspace-session.mjs, tests/workspace-session.test.mjs, docs/modules/workspace-sessions.md, docs/VERIFICATION.md
- [DONE] T003: Перенести создание Chat Work в проектный UI и первую сессию — Завершено
  - Git Commit: [DONE] feat: добавить UI Chat и Work sessions
  - Reference: workspace-chat-work-sessions-011 / T003 / implementation
  - Файлы: src/main.mjs, src/preload.cjs, src/ui/index.html, src/ui/sidebar.mjs, src/ui/workspace-setup.mjs, tests/electron-smoke.mjs, src/workspace-session.mjs, tests/workspace-session.test.mjs, docs/modules/workspace-sessions.md, docs/WORKSPACE_SETUP.md, docs/VERIFICATION.md, docs/architecture/ARCHITECTURE.md
- [DONE] T004: Интегрировать Chat Work experience routing с recovery — Завершено
  - Git Commit: [DONE] feat: маршрутизировать Chat и Work sessions
  - Reference: workspace-chat-work-sessions-011 / T004 / implementation
  - Файлы: src/chatgpt-experience.mjs, src/main.mjs, tests/chatgpt-experience.test.mjs, tests/electron-smoke.mjs, src/context-session.mjs, tests/context-session.test.mjs, docs/modules/workspace-sessions.md, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md
- [DONE] T005: Собрать релиз Chat Work sessions — Завершено
  - Git Commit: [DONE] build: выпустить Chat и Work sessions
  - Reference: workspace-chat-work-sessions-011 / T005 / implementation
  - Файлы: package.json, package-lock.json, tests/electron-smoke.mjs, docs/WORKFLOW_START.md, docs/modules/workspace-sessions.md, docs/VERIFICATION.md, docs/architecture/ARCHITECTURE.md
- [DONE] T006: Исправить URL-контракт Work conversation — Завершено
  - Git Commit: [DONE] fix: разрешить Work conversation на общем URL
  - Reference: workspace-chat-work-sessions-011 / T006 / implementation
  - Файлы: src/workspace-session.mjs, tests/workspace-session.test.mjs, docs/modules/workspace-sessions.md, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md
- [DONE] T007: Исправить fail-closed guard Work после отправки — Завершено
  - Git Commit: [DONE] fix: сохранить Work provenance после отправки
  - Reference: workspace-chat-work-sessions-011 / T007 / implementation
  - Файлы: src/context-session.mjs, tests/context-session.test.mjs, tests/electron-smoke.mjs, docs/modules/workspace-sessions.md, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md
- [DONE] T008: Собрать исправленный релиз Work sessions — Завершено
  - Git Commit: [DONE] build: выпустить исправление Work sessions
  - Reference: workspace-chat-work-sessions-011 / T008 / implementation
  - Файлы: package.json, package-lock.json, docs/WORKFLOW_START.md, docs/modules/workspace-sessions.md, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md

## Context Pack For This Cycle

- docs/architecture/OVERVIEW.md → Краткая архитектура проекта
- docs/modules/workspace-sessions.md → Module Specification — Workspace & Sessions
- docs/WORKSPACE_SETUP.md → Создание и подключение workspace

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
