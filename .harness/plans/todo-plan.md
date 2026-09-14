# Активный план — Project Web Pilot

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 247,
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
      "AGENTS.md"
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
        "path": "docs/CONTEXT_DELIVERY.md",
        "heading_path": [
          "Передача контекста"
        ],
        "required": true,
        "revision": "WORKTREE"
      },
      {
        "path": "docs/VERIFICATION.md",
        "heading_path": [
          "Проверки и приёмка"
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
        "T001"
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
Revision: 247

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

## Context Pack For This Cycle

- docs/CONTEXT_DELIVERY.md → Передача контекста
- docs/VERIFICATION.md → Проверки и приёмка

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
