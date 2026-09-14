# Активный план — Project Web Pilot

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 253,
  "project_id": "cf944136-d1fc-4bd5-9ea0-e46d1fe230e7",
  "project_name": "Project Web Pilot",
  "scope_id": "workflow-kit-recovery-packet-010",
  "execution_scope_status": "ACTIVE",
  "delivery_status": "IN_PROGRESS",
  "objective": "Перевести Workflow Kit на module-centric Recovery v2: перед функциональным scope определять владельца функционала, сначала согласовывать module specification, затем выполнять todo-plan; новая сессия/refresh/compact получают компактный execution capsule из Workflow Core, project overview, module spec, текущего плана, прямых dependency diffs, текущих изменений и релевантных проверок. После этого отдельно спроектировать self-healing lifecycle MCP+tunnel.",
  "acceptance_criteria": [
    "Новый функциональный scope опирается на зарегистрированный архитектурный модуль и согласованную module specification до реализации.",
    "Recovery не включает полный WORKFLOW.md, исторический VERIFICATION.md или последний commit только потому, что он последний.",
    "Recovery включает компактный Workflow Core, project overview, module spec/required task context, прямые dependency diffs, текущий worktree и релевантные verification evidence.",
    "include_last_completed_task по умолчанию false; optional documents являются ссылками, а не автоматическим payload.",
    "Hard budget Workflow Kit согласован с транспортным лимитом Web Pilot 180000 UTF-8 bytes; soft budget служит целевым сигналом компактности.",
    "Workflow Kit 1.2 устанавливает module map и compact overview для новых проектов и безопасно обновляет совместимые 1.1 installations без перезаписи пользовательских документов.",
    "Project Web Pilot использует обновлённый Kit, проходит test/smoke и пересобирается для macOS; Windows package остаётся собираемым из той же кодовой базы.",
    "Следующая отдельная задача сохраняет ранее согласованное проектирование self-healing MCP+tunnel."
  ],
  "approved_scope": {
    "functional_paths": [
      "src/main.mjs",
      "tests/electron-smoke.mjs",
      "src/ui/workspace-setup.mjs",
      "resources/workspace-setup-worker.mjs",
      "tests/workspace-setup.test.mjs",
      "tests/workflow-kit-source.test.mjs",
      "tests/workflow-kit-recovery.test.mjs",
      "resources/workflow-kit/WORKFLOW.md",
      "resources/workflow-kit/lib/common.mjs",
      "resources/workflow-kit/lib/plan.mjs",
      "resources/workflow-kit/lib/recovery.mjs",
      "resources/workflow-kit/lib/validate.mjs",
      "resources/workflow-kit/lib/installation-files.mjs",
      "resources/workflow-kit/lib/installer.mjs",
      "resources/workflow-kit/templates/AGENTS.md",
      "resources/workflow-kit/templates/PLAN.md",
      "resources/workflow-kit/templates/MODULES.md",
      "resources/workflow-kit/templates/MODULE.md",
      "resources/workflow-kit/templates/OVERVIEW.md",
      "resources/workflow-kit/templates/START.md",
      ".harness/kit/WORKFLOW.md",
      ".harness/kit/lib/common.mjs",
      ".harness/kit/lib/plan.mjs",
      ".harness/kit/lib/recovery.mjs",
      ".harness/kit/lib/validate.mjs",
      ".harness/kit/lib/installation-files.mjs",
      ".harness/kit/lib/installer.mjs",
      ".harness/kit/templates/AGENTS.md",
      ".harness/kit/templates/PLAN.md",
      ".harness/kit/templates/MODULES.md",
      ".harness/kit/templates/MODULE.md",
      ".harness/kit/templates/OVERVIEW.md",
      ".harness/kit/templates/START.md",
      ".harness/kit-manifest.json",
      ".harness/plans/todo-plan.template.md",
      "AGENTS.md",
      "resources/workflow-kit/lib/actions.mjs",
      "resources/workflow-kit/lib/transaction.mjs",
      "package.json",
      "package-lock.json"
    ],
    "documentation_paths": [
      "docs/CONTEXT_DELIVERY.md",
      "docs/VERIFICATION.md",
      "docs/WORKFLOW_START.md",
      "docs/architecture/ARCHITECTURE.md",
      "docs/DOCUMENTATION_INDEX.md",
      "docs/MODULES.md",
      "docs/modules/workflow-kit-recovery.md",
      "docs/architecture/OVERVIEW.md",
      "docs/WORKSPACE_SETUP.md"
    ],
    "max_functional_files_per_task": 20
  },
  "baseline_commit": "d83a01bd9a21ecc3e02538ef976365f719dec0a6",
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
        "path": "docs/modules/workflow-kit-recovery.md",
        "heading_path": [
          "Module Specification — Workflow Kit / Context Recovery"
        ],
        "required": true,
        "revision": "WORKTREE"
      },
      {
        "path": "docs/CONTEXT_DELIVERY.md",
        "heading_path": [
          "Передача контекста",
          "Recovery Capsule v2 — согласованный контракт 14.09.2026"
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
      "id": "T000",
      "title": "Ограничить clipboard-write основным ChatGPT WebContents",
      "why": "Пользователь согласовал более строгий вариант: штатное копирование должно работать только из основного встроенного ChatGPT, без права чтения clipboard и без доступа для popup/дочерних WebContents.",
      "dependencies": [],
      "functional_paths": [
        "src/main.mjs",
        "tests/electron-smoke.mjs"
      ],
      "documentation_paths": [
        "docs/VERIFICATION.md",
        "docs/architecture/ARCHITECTURE.md"
      ],
      "acceptance_criteria": [
        "clipboard-sanitized-write разрешён только точному https://chatgpt.com и только основному правому WebContents ChatGPT.",
        "clipboard-read и clipboard write для popup/других WebContents/origin остаются запрещены.",
        "Electron smoke подтверждает фактическую запись из основного WebContents и policy deny для чужого WebContents.",
        "Полный npm test и smoke проходят."
      ],
      "verification_ids": [
        "suite",
        "electron-smoke"
      ],
      "expected_commit_message": "fix: ограничить clipboard write основным ChatGPT",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "workflow-kit-recovery-packet-010",
        "task_id": "T000",
        "role": "implementation"
      }
    },
    {
      "dependencies": [
        "T000"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/MODULES.md",
        "docs/architecture/OVERVIEW.md",
        "docs/modules/workflow-kit-recovery.md",
        "docs/CONTEXT_DELIVERY.md",
        "docs/VERIFICATION.md",
        "docs/DOCUMENTATION_INDEX.md"
      ],
      "verification_ids": [],
      "id": "T001",
      "title": "Зафиксировать module specification Workflow Recovery v2",
      "why": "Сначала закрепить согласованный контракт module-centric recovery, бюджет и границы пакета; todo-plan реализации должен опираться на эту спецификацию.",
      "acceptance_criteria": [
        "Module map определяет Context Recovery как архитектурного владельца текущего функционала.",
        "Module specification фиксирует Workflow Core, module-first цикл, состав Recovery Capsule v2, context_pack semantics, dependency diffs и budget.",
        "Компактный project overview отделён от полной исторической ARCHITECTURE.",
        "Измерения текущего 118003-byte recovery и причина роста зафиксированы до изменения production semantics.",
        "Документация явно утверждает: большой WORKFLOW.md и исторический VERIFICATION не являются стандартным recovery payload."
      ],
      "expected_commit_message": "docs: определить Workflow Recovery v2",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "workflow-kit-recovery-packet-010",
        "task_id": "T001",
        "role": "implementation"
      }
    },
    {
      "id": "T002",
      "title": "Спроектировать self-healing startup MCP и tunnel",
      "why": "Исключить повторение RUNTIME_FOREIGN_PROCESS, stale PID и конфликтов фиксированных портов при старте приложения; существующую совместимую установку нужно переиспользовать, отсутствующую — автоматически устанавливать и подключать.",
      "dependencies": [
        "T005"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/WORKFLOW_START.md",
        "docs/architecture/ARCHITECTURE.md"
      ],
      "acceptance_criteria": [
        "Определён persisted runtime registration: приложение запоминает подтверждённые runtime path/version/identity и фактические MCP+tunnel endpoints, а при следующем старте сначала быстро валидирует их вместо полного поиска.",
        "Если совместимые MCP и tunnel уже установлены и здоровы, приложение переиспользует их; если отсутствуют — bootstrap/install выполняется автоматически для текущей платформы.",
        "Проверен реальный endpoint-контракт для обоих сервисов: host/IP, локальный port и, где применимо, public tunnel URL; решение не предполагает заранее фиксированные 17842/17843.",
        "Stale PID/PID reuse и несовпадение process identity распознаются безопасно; чужие процессы не завершаются и не принимаются за собственный runtime.",
        "Если собственный MCP или tunnel не может стартовать из-за занятого порта, выбирается свободный локальный порт, новый endpoint атомарно передаётся всем зависимым компонентам и сохраняется для следующих запусков.",
        "Self-healing выполняется молча в штатных случаях; пользователь получает ошибку только если безопасное автоматическое восстановление невозможно.",
        "Перед реализацией отдельно проверены последствия динамических портов для Secure MCP Tunnel/profile, MCP client, Windows overlay и macOS runtime; секреты tunnel не попадают в Git, чат или диагностику.",
        "До отдельного согласования пользователя production-код lifecycle/ports не изменяется."
      ],
      "verification_ids": [],
      "expected_commit_message": "docs: спроектировать self-healing runtime startup",
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "workflow-kit-recovery-packet-010",
        "task_id": "T002",
        "role": "implementation"
      }
    },
    {
      "id": "T003",
      "title": "Реализовать core Workflow Recovery v2",
      "why": "Перевести builder и базовые правила Kit с исторического полного контекста на module-centric execution capsule без изменения transport API Web Pilot.",
      "dependencies": [
        "T001"
      ],
      "functional_paths": [
        "resources/workflow-kit/WORKFLOW.md",
        "resources/workflow-kit/lib/plan.mjs",
        "resources/workflow-kit/lib/recovery.mjs",
        "resources/workflow-kit/lib/validate.mjs",
        "resources/workflow-kit/lib/actions.mjs",
        "resources/workflow-kit/templates/AGENTS.md",
        "resources/workflow-kit/templates/PLAN.md",
        "tests/workflow-kit-source.test.mjs",
        "tests/workflow-kit-recovery.test.mjs"
      ],
      "documentation_paths": [
        "docs/modules/workflow-kit-recovery.md",
        "docs/CONTEXT_DELIVERY.md"
      ],
      "acceptance_criteria": [
        "Recovery передаёт только Workflow Core, текущий plan/task, required context, dependency diffs, current worktree и verification evidence.",
        "Optional documents становятся reference-only; full WORKFLOW/VERIFICATION не включаются автоматически.",
        "include_last_completed_task по умолчанию false; прямые task dependencies продолжают включаться.",
        "Functional scope/create требует required module spec и compact project overview, не ломая продолжение уже существующих legacy scope.",
        "CONTEXT_TOO_LARGE сообщает крупнейшие секции; effective hard transport budget не превышает 180000 bytes."
      ],
      "verification_ids": [],
      "expected_commit_message": "feat: реализовать Workflow Recovery v2",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "workflow-kit-recovery-packet-010",
        "task_id": "T003",
        "role": "implementation"
      },
      "file_limit_exception": "Core recovery меняет согласованный набор тесно связанных файлов Workflow Kit и один regression test."
    },
    {
      "id": "T004",
      "title": "Добавить Workflow Kit 1.2 install/upgrade contract",
      "why": "Новые проекты должны получать module map/overview сразу, а существующие совместимые 1.1 installations — безопасно обновляться без перезаписи пользовательских документов.",
      "dependencies": [
        "T003"
      ],
      "functional_paths": [
        "resources/workflow-kit/lib/common.mjs",
        "resources/workflow-kit/lib/installation-files.mjs",
        "resources/workflow-kit/lib/installer.mjs",
        "resources/workflow-kit/lib/transaction.mjs",
        "resources/workflow-kit/templates/START.md",
        "resources/workspace-setup-worker.mjs",
        "src/ui/workspace-setup.mjs",
        "tests/workspace-setup.test.mjs",
        "tests/workflow-kit-source.test.mjs"
      ],
      "documentation_paths": [
        "docs/WORKSPACE_SETUP.md",
        "docs/modules/workflow-kit-recovery.md"
      ],
      "acceptance_criteria": [
        "Fresh install Workflow Kit 1.2 создаёт docs/MODULES.md и docs/architecture/OVERVIEW.md и новый plan template.",
        "Совместимый неизменённый Kit 1.1 определяется как upgradeable; upgrade заменяет owned runtime, обновляет managed section и создаёт недостающие новые docs, сохраняя пользовательские документы.",
        "Upgrade фиксируется управляемым kit-update commit и не переписывает активный todo-plan.",
        "Workspace setup показывает upgrade как отдельное безопасное действие и после него повторно проверяет проект.",
        "Unsupported/modified installations остаются заблокированными без автоматической перезаписи."
      ],
      "verification_ids": [
        "suite"
      ],
      "expected_commit_message": "feat: добавить обновление Workflow Kit 1.2",
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "workflow-kit-recovery-packet-010",
        "task_id": "T004",
        "role": "implementation"
      },
      "file_limit_exception": "Installer/migration, workspace adapter и regression tests образуют одну атомарную compatibility boundary."
    },
    {
      "id": "T005",
      "title": "Мигрировать Project Web Pilot на Recovery v2 и пересобрать",
      "why": "Подтвердить новую семантику на реальном активном проекте, синхронизировать установленный Kit, уменьшить recovery и выпустить новую локальную сборку.",
      "dependencies": [
        "T004"
      ],
      "functional_paths": [
        "package.json",
        "package-lock.json"
      ],
      "documentation_paths": [
        "docs/VERIFICATION.md",
        "docs/WORKFLOW_START.md",
        "docs/CONTEXT_DELIVERY.md"
      ],
      "acceptance_criteria": [
        "Текущий Project Web Pilot обновлён до Workflow Kit 1.2 управляемым upgrade без потери plan/history.",
        "Текущий workflow config hard_bytes согласован с 180000-byte transport limit, а context_pack содержит overview + module spec без full historical VERIFICATION.",
        "Новый recovery Project Web Pilot существенно меньше старых 118003 bytes и не содержит полный VERIFICATION.md/WORKFLOW.md.",
        "Полный npm test и Electron smoke проходят после миграции.",
        "Версия Project Web Pilot обновлена, macOS app пересобрана; общий build contract для Windows не сломан."
      ],
      "verification_ids": [
        "suite",
        "electron-smoke"
      ],
      "expected_commit_message": "build: выпустить Project Web Pilot с Recovery v2",
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "workflow-kit-recovery-packet-010",
        "task_id": "T005",
        "role": "implementation"
      }
    }
  ],
  "blocked_reason": null,
  "user_decisions": [
    {
      "id": "a005eb9f-1da7-4b83-b70e-d6809403b836",
      "text": "14.09.2026 пользователь после закрытия объединяющего macOS/Windows scope прямо поручил начать новый план по Workflow Kit, сосредоточенный на том, как Kit упаковывает состояние проекта для передачи агенту.",
      "recorded_at": "2026-09-14T06:09:04.364Z"
    },
    {
      "id": "clipboard-primary-webcontents-20260914",
      "text": "14.09.2026 пользователь согласовал строгую clipboard-policy: разрешить sanitized write только основному встроенному ChatGPT WebContents и точному origin chatgpt.com, не разрешая чтение clipboard и popup/дочерним WebContents. После этого перейти к обсуждению recovery budget.",
      "recorded_at": "2026-09-14T06:13:23+02:00"
    },
    {
      "id": "runtime-self-healing-ports-20260914",
      "text": "14.09.2026 пользователь поручил записать в текущий план будущий механизм запуска: до установки/старта обнаруживать и переиспользовать существующие MCP+tunnel, при отсутствии автоматически устанавливать; запоминать подтверждённые endpoints, проверять фактические адреса/порты обоих сервисов и при конфликте порта молча выбирать свободный порт и переподключать компоненты, не завершая чужие процессы. Сначала требуется обсудить архитектуру и последствия, затем отдельно согласовать реализацию.",
      "recorded_at": "2026-09-14T06:22:42+02:00"
    },
    {
      "id": "workflow-recovery-v2-20260914",
      "text": "14.09.2026 пользователь согласовал Workflow Recovery v2: module-centric architecture; при изменении функционала сначала определить существующий модуль или создать новый, согласовать module specification и только затем todo-plan; recovery новой сессии/refresh/compact должен быть минимальным execution state, а не историей проекта; большой WORKFLOW.md остаётся справочником, в packet передаётся только компактный Workflow Core. Пользователь прямо разрешил реализовать изменения и пересобрать приложение.",
      "recorded_at": "2026-09-14T06:40:25+02:00"
    }
  ]
}
```
<!-- workflow-state:end -->

## Состояние

Execution Scope Status: ACTIVE
Delivery Status: IN_PROGRESS
Scope: workflow-kit-recovery-packet-010
Current Task: нет
Revision: 253

## Цель

Перевести Workflow Kit на module-centric Recovery v2: перед функциональным scope определять владельца функционала, сначала согласовывать module specification, затем выполнять todo-plan; новая сессия/refresh/compact получают компактный execution capsule из Workflow Core, project overview, module spec, текущего плана, прямых dependency diffs, текущих изменений и релевантных проверок. После этого отдельно спроектировать self-healing lifecycle MCP+tunnel.

## Критерии приёмки

- Новый функциональный scope опирается на зарегистрированный архитектурный модуль и согласованную module specification до реализации.
- Recovery не включает полный WORKFLOW.md, исторический VERIFICATION.md или последний commit только потому, что он последний.
- Recovery включает компактный Workflow Core, project overview, module spec/required task context, прямые dependency diffs, текущий worktree и релевантные verification evidence.
- include_last_completed_task по умолчанию false; optional documents являются ссылками, а не автоматическим payload.
- Hard budget Workflow Kit согласован с транспортным лимитом Web Pilot 180000 UTF-8 bytes; soft budget служит целевым сигналом компактности.
- Workflow Kit 1.2 устанавливает module map и compact overview для новых проектов и безопасно обновляет совместимые 1.1 installations без перезаписи пользовательских документов.
- Project Web Pilot использует обновлённый Kit, проходит test/smoke и пересобирается для macOS; Windows package остаётся собираемым из той же кодовой базы.
- Следующая отдельная задача сохраняет ранее согласованное проектирование self-healing MCP+tunnel.

## Микрозадачи

- [DONE] T000: Ограничить clipboard-write основным ChatGPT WebContents — Завершено
  - Git Commit: [DONE] fix: ограничить clipboard write основным ChatGPT
  - Reference: workflow-kit-recovery-packet-010 / T000 / implementation
  - Файлы: src/main.mjs, tests/electron-smoke.mjs, docs/VERIFICATION.md, docs/architecture/ARCHITECTURE.md
- [DONE] T001: Зафиксировать module specification Workflow Recovery v2 — Завершено
  - Git Commit: [DONE] docs: определить Workflow Recovery v2
  - Reference: workflow-kit-recovery-packet-010 / T001 / implementation
  - Файлы: docs/MODULES.md, docs/architecture/OVERVIEW.md, docs/modules/workflow-kit-recovery.md, docs/CONTEXT_DELIVERY.md, docs/VERIFICATION.md, docs/DOCUMENTATION_INDEX.md
- [TODO] T002: Спроектировать self-healing startup MCP и tunnel — Ожидает
  - Git Commit: [PENDING] docs: спроектировать self-healing runtime startup
  - Reference: workflow-kit-recovery-packet-010 / T002 / implementation
  - Файлы: docs/WORKFLOW_START.md, docs/architecture/ARCHITECTURE.md
- [DONE] T003: Реализовать core Workflow Recovery v2 — Завершено
  - Git Commit: [DONE] feat: реализовать Workflow Recovery v2
  - Reference: workflow-kit-recovery-packet-010 / T003 / implementation
  - Файлы: resources/workflow-kit/WORKFLOW.md, resources/workflow-kit/lib/plan.mjs, resources/workflow-kit/lib/recovery.mjs, resources/workflow-kit/lib/validate.mjs, resources/workflow-kit/lib/actions.mjs, resources/workflow-kit/templates/AGENTS.md, resources/workflow-kit/templates/PLAN.md, tests/workflow-kit-source.test.mjs, tests/workflow-kit-recovery.test.mjs, docs/modules/workflow-kit-recovery.md, docs/CONTEXT_DELIVERY.md
- [TODO] T004: Добавить Workflow Kit 1.2 install/upgrade contract — Ожидает
  - Git Commit: [PENDING] feat: добавить обновление Workflow Kit 1.2
  - Reference: workflow-kit-recovery-packet-010 / T004 / implementation
  - Файлы: resources/workflow-kit/lib/common.mjs, resources/workflow-kit/lib/installation-files.mjs, resources/workflow-kit/lib/installer.mjs, resources/workflow-kit/lib/transaction.mjs, resources/workflow-kit/templates/START.md, resources/workspace-setup-worker.mjs, src/ui/workspace-setup.mjs, tests/workspace-setup.test.mjs, tests/workflow-kit-source.test.mjs, docs/WORKSPACE_SETUP.md, docs/modules/workflow-kit-recovery.md
- [TODO] T005: Мигрировать Project Web Pilot на Recovery v2 и пересобрать — Ожидает
  - Git Commit: [PENDING] build: выпустить Project Web Pilot с Recovery v2
  - Reference: workflow-kit-recovery-packet-010 / T005 / implementation
  - Файлы: package.json, package-lock.json, docs/VERIFICATION.md, docs/WORKFLOW_START.md, docs/CONTEXT_DELIVERY.md

## Context Pack For This Cycle

- docs/architecture/OVERVIEW.md → Краткая архитектура проекта
- docs/modules/workflow-kit-recovery.md → Module Specification — Workflow Kit / Context Recovery
- docs/CONTEXT_DELIVERY.md → Передача контекста / Recovery Capsule v2 — согласованный контракт 14.09.2026

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
