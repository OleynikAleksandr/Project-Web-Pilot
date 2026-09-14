# Активный план — Project Web Pilot

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 276,
  "project_id": "cf944136-d1fc-4bd5-9ea0-e46d1fe230e7",
  "project_name": "Project Web Pilot",
  "scope_id": "workflow-kit-recovery-packet-010",
  "execution_scope_status": "ACTIVE",
  "delivery_status": "IN_PROGRESS",
  "objective": "Интегрировать self-healing Runtime Lifecycle для MCP+tunnel на macOS и Windows: безопасное переиспользование/установка runtime, stale PID recovery, persisted dynamic endpoints и автоматический startup без остановки чужих процессов.",
  "acceptance_criteria": [
    "Runtime Lifecycle specification является канонической границей MCP/tunnel startup.",
    "Existing compatible runtime переиспользуется; отсутствующий macOS runtime получает bundled bootstrap.",
    "Stale PID/PID reuse восстанавливается молча без signal чужому процессу.",
    "Занятые preferred ports автоматически заменяются свободными persisted endpoints; Web Pilot использует фактический status.mcp_url.",
    "Tunnel credentials остаются в private runtime state и не попадают в renderer/Git/diagnostics.",
    "Одинаковый lifecycle contract покрыт regression tests на macOS и Windows.",
    "Полный test/smoke/build проходит и обе platform packages пересобраны."
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
      "package-lock.json",
      "src/mac-runtime.mjs",
      "src/mcp-runtime.mjs",
      "src/platform.mjs",
      "src/windows-runtime.mjs",
      "tests/mac-runtime.test.mjs",
      "tests/mcp-runtime.test.mjs",
      "tests/windows-runtime.test.mjs",
      "resources/runtime-control/mac-control.py",
      "resources/runtime-control/windows-control.py",
      "resources/mac-runtime/requirements.txt",
      "resources/mac-runtime/mcp/bridge_mcp.py",
      "resources/mac-runtime/server/bridge_server.py",
      "resources/mac-runtime/server/codex_local_runtime.py",
      "resources/mac-runtime/server/macos_computer.py",
      "resources/mac-runtime/server/context_packet.py",
      "resources/mac-runtime/skills/local-computer/SKILL.md",
      "resources/mac-runtime/control.py",
      "resources/mac-runtime.zip"
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
      "docs/WORKSPACE_SETUP.md",
      "docs/modules/runtime-lifecycle.md"
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
        "path": "docs/modules/runtime-lifecycle.md",
        "heading_path": [
          "Module Specification — Runtime Lifecycle"
        ],
        "required": true,
        "revision": "WORKTREE"
      },
      {
        "path": "docs/architecture/ARCHITECTURE.md",
        "heading_path": [
          "Архитектура"
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
      "title": "Определить module specification self-healing Runtime Lifecycle",
      "why": "Сначала закрепить контракт process identity, persisted endpoints, adoption/bootstrap и безопасного self-healing; реализация приложения должна опираться на согласованную модульную границу.",
      "dependencies": [
        "T005"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/MODULES.md",
        "docs/modules/runtime-lifecycle.md",
        "docs/WORKFLOW_START.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/DOCUMENTATION_INDEX.md"
      ],
      "acceptance_criteria": [
        "Runtime Lifecycle зарегистрирован отдельным архитектурным модулем и имеет facade/границы ответственности.",
        "Спецификация определяет persisted registration, stale PID/PID reuse, dynamic loopback endpoints и no-kill policy.",
        "Определены adoption существующего macOS/Windows runtime и bundled fallback при отсутствии установки.",
        "Первичная tunnel credential настройка отделена от автоматического штатного self-healing и секреты не попадают в renderer/Git/diagnostics.",
        "Зафиксированы проверяемые сценарии: stale PID, занятые 17842/17843, повторный startup с сохранёнными endpoints и отсутствие runtime."
      ],
      "verification_ids": [],
      "expected_commit_message": "docs: определить self-healing Runtime Lifecycle",
      "implementation_status": "DONE",
      "commit_status": "DONE",
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
        "tests/workflow-kit-source.test.mjs",
        "tests/workflow-kit-recovery.test.mjs"
      ],
      "documentation_paths": [
        "docs/WORKSPACE_SETUP.md",
        "docs/modules/workflow-kit-recovery.md",
        "docs/VERIFICATION.md",
        "docs/architecture/ARCHITECTURE.md"
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
      "implementation_status": "DONE",
      "commit_status": "DONE",
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
        "docs/CONTEXT_DELIVERY.md",
        "docs/architecture/ARCHITECTURE.md"
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
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "workflow-kit-recovery-packet-010",
        "task_id": "T005",
        "role": "implementation"
      }
    },
    {
      "id": "T006",
      "title": "Реализовать self-healing runtime control v2 на macOS",
      "why": "Runtime должен сам безопасно очищать stale PID и владеть persisted dynamic endpoints.",
      "dependencies": [
        "T002"
      ],
      "functional_paths": [
        "resources/runtime-control/mac-control.py",
        "resources/mac-runtime.zip",
        "tests/mac-runtime.test.mjs"
      ],
      "documentation_paths": [
        "docs/modules/runtime-lifecycle.md",
        "docs/VERIFICATION.md"
      ],
      "acceptance_criteria": [
        "Known legacy Mac control может быть заменён versioned lifecycle control без доступа к secret state.",
        "Stale PID identity mismatch очищается без signal чужому PID.",
        "Занятые preferred MCP/tunnel ports приводят к выбору и сохранению свободных loopback ports.",
        "Bridge config и существующий tunnel profile согласованно получают новые endpoints без изменения tunnel credentials.",
        "Повторный status/start использует persisted endpoints."
      ],
      "verification_ids": [
        "suite"
      ],
      "expected_commit_message": "feat: добавить self-healing Mac runtime control",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "workflow-kit-recovery-packet-010",
        "task_id": "T006",
        "role": "implementation"
      },
      "file_limit_exception": "Runtime lifecycle изменяет тесно связанный cross-platform control/bootstrap contract."
    },
    {
      "id": "T007",
      "title": "Интегрировать Mac runtime bootstrap и persisted registration в Web Pilot",
      "why": "Приложение должно автоматически adopt/install/ensure runtime без ручного выбора папки при штатном запуске.",
      "dependencies": [
        "T006"
      ],
      "functional_paths": [
        "src/mac-runtime.mjs",
        "src/mcp-runtime.mjs",
        "src/platform.mjs",
        "src/main.mjs",
        "tests/mcp-runtime.test.mjs",
        "tests/mac-runtime.test.mjs",
        "tests/electron-smoke.mjs",
        "resources/runtime-control/mac-control.py"
      ],
      "documentation_paths": [
        "docs/modules/runtime-lifecycle.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md"
      ],
      "acceptance_criteria": [
        "Persisted runtime registration валидируется через status и не считается источником истины.",
        "Known external Mac runtime автоматически получает lifecycle overlay и сохраняет private tunnel state.",
        "При отсутствии external runtime bundled source разворачивается в userData/runtime и запускается setup.",
        "McpRuntime принимает фактический dynamic mcp_url и больше не останавливается на stale PID как RUNTIME_FOREIGN_PROCESS.",
        "Штатный self-heal не показывает startup error."
      ],
      "verification_ids": [
        "runtime",
        "suite",
        "electron-smoke"
      ],
      "expected_commit_message": "feat: интегрировать self-healing Mac runtime",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "workflow-kit-recovery-packet-010",
        "task_id": "T007",
        "role": "implementation"
      },
      "file_limit_exception": "Runtime lifecycle изменяет тесно связанный cross-platform control/bootstrap contract."
    },
    {
      "id": "T008",
      "title": "Расширить Windows runtime тем же self-healing contract",
      "why": "Windows external/bundled lifecycle должен иметь тот же stale-PID/no-kill/dynamic-endpoint contract.",
      "dependencies": [
        "T006"
      ],
      "functional_paths": [
        "resources/runtime-control/windows-control.py",
        "src/windows-runtime.mjs",
        "tests/windows-runtime.test.mjs",
        "src/main.mjs"
      ],
      "documentation_paths": [
        "docs/modules/runtime-lifecycle.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md"
      ],
      "acceptance_criteria": [
        "Known Windows control snapshot получает versioned lifecycle overlay.",
        "Stale PID record не блокирует startup и не приводит к остановке foreign process.",
        "Occupied preferred ports приводят к persisted dynamic endpoints и обновлению profile/config.",
        "External adoption и bundled fallback сохраняются; unknown modified control не перезаписывается."
      ],
      "verification_ids": [
        "suite"
      ],
      "expected_commit_message": "feat: добавить self-healing Windows runtime",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "workflow-kit-recovery-packet-010",
        "task_id": "T008",
        "role": "implementation"
      }
    },
    {
      "id": "T009",
      "title": "Проверить и выпустить self-healing runtime release",
      "why": "Подтвердить полный macOS/Windows build и фактический startup на текущем Mac.",
      "dependencies": [
        "T007",
        "T008"
      ],
      "functional_paths": [
        "package.json",
        "package-lock.json",
        "tests/electron-smoke.mjs"
      ],
      "documentation_paths": [
        "docs/VERIFICATION.md",
        "docs/WORKFLOW_START.md",
        "docs/modules/runtime-lifecycle.md"
      ],
      "acceptance_criteria": [
        "На текущем Mac existing runtime проходит real ensure/status после overlay и использует сохранённый tunnel config.",
        "npm test и Electron smoke проходят.",
        "Общий npm run build создаёт macOS и Windows packages и Windows verifier проходит.",
        "Git working tree чистый; release опубликован в общий main."
      ],
      "verification_ids": [
        "suite",
        "electron-smoke"
      ],
      "expected_commit_message": "build: выпустить self-healing runtime startup",
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "workflow-kit-recovery-packet-010",
        "task_id": "T009",
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
Revision: 276

## Цель

Интегрировать self-healing Runtime Lifecycle для MCP+tunnel на macOS и Windows: безопасное переиспользование/установка runtime, stale PID recovery, persisted dynamic endpoints и автоматический startup без остановки чужих процессов.

## Критерии приёмки

- Runtime Lifecycle specification является канонической границей MCP/tunnel startup.
- Existing compatible runtime переиспользуется; отсутствующий macOS runtime получает bundled bootstrap.
- Stale PID/PID reuse восстанавливается молча без signal чужому процессу.
- Занятые preferred ports автоматически заменяются свободными persisted endpoints; Web Pilot использует фактический status.mcp_url.
- Tunnel credentials остаются в private runtime state и не попадают в renderer/Git/diagnostics.
- Одинаковый lifecycle contract покрыт regression tests на macOS и Windows.
- Полный test/smoke/build проходит и обе platform packages пересобраны.

## Микрозадачи

- [DONE] T000: Ограничить clipboard-write основным ChatGPT WebContents — Завершено
  - Git Commit: [DONE] fix: ограничить clipboard write основным ChatGPT
  - Reference: workflow-kit-recovery-packet-010 / T000 / implementation
  - Файлы: src/main.mjs, tests/electron-smoke.mjs, docs/VERIFICATION.md, docs/architecture/ARCHITECTURE.md
- [DONE] T001: Зафиксировать module specification Workflow Recovery v2 — Завершено
  - Git Commit: [DONE] docs: определить Workflow Recovery v2
  - Reference: workflow-kit-recovery-packet-010 / T001 / implementation
  - Файлы: docs/MODULES.md, docs/architecture/OVERVIEW.md, docs/modules/workflow-kit-recovery.md, docs/CONTEXT_DELIVERY.md, docs/VERIFICATION.md, docs/DOCUMENTATION_INDEX.md
- [DONE] T002: Определить module specification self-healing Runtime Lifecycle — Завершено
  - Git Commit: [DONE] docs: определить self-healing Runtime Lifecycle
  - Reference: workflow-kit-recovery-packet-010 / T002 / implementation
  - Файлы: docs/MODULES.md, docs/modules/runtime-lifecycle.md, docs/WORKFLOW_START.md, docs/architecture/ARCHITECTURE.md, docs/DOCUMENTATION_INDEX.md
- [DONE] T003: Реализовать core Workflow Recovery v2 — Завершено
  - Git Commit: [DONE] feat: реализовать Workflow Recovery v2
  - Reference: workflow-kit-recovery-packet-010 / T003 / implementation
  - Файлы: resources/workflow-kit/WORKFLOW.md, resources/workflow-kit/lib/plan.mjs, resources/workflow-kit/lib/recovery.mjs, resources/workflow-kit/lib/validate.mjs, resources/workflow-kit/lib/actions.mjs, resources/workflow-kit/templates/AGENTS.md, resources/workflow-kit/templates/PLAN.md, tests/workflow-kit-source.test.mjs, tests/workflow-kit-recovery.test.mjs, docs/modules/workflow-kit-recovery.md, docs/CONTEXT_DELIVERY.md
- [DONE] T004: Добавить Workflow Kit 1.2 install/upgrade contract — Завершено
  - Git Commit: [DONE] feat: добавить обновление Workflow Kit 1.2
  - Reference: workflow-kit-recovery-packet-010 / T004 / implementation
  - Файлы: resources/workflow-kit/lib/common.mjs, resources/workflow-kit/lib/installation-files.mjs, resources/workflow-kit/lib/installer.mjs, resources/workflow-kit/lib/transaction.mjs, resources/workflow-kit/templates/START.md, resources/workspace-setup-worker.mjs, src/ui/workspace-setup.mjs, tests/workspace-setup.test.mjs, tests/workflow-kit-source.test.mjs, tests/workflow-kit-recovery.test.mjs, docs/WORKSPACE_SETUP.md, docs/modules/workflow-kit-recovery.md, docs/VERIFICATION.md, docs/architecture/ARCHITECTURE.md
- [DONE] T005: Мигрировать Project Web Pilot на Recovery v2 и пересобрать — Завершено
  - Git Commit: [DONE] build: выпустить Project Web Pilot с Recovery v2
  - Reference: workflow-kit-recovery-packet-010 / T005 / implementation
  - Файлы: package.json, package-lock.json, docs/VERIFICATION.md, docs/WORKFLOW_START.md, docs/CONTEXT_DELIVERY.md, docs/architecture/ARCHITECTURE.md
- [DONE] T006: Реализовать self-healing runtime control v2 на macOS — Завершено
  - Git Commit: [DONE] feat: добавить self-healing Mac runtime control
  - Reference: workflow-kit-recovery-packet-010 / T006 / implementation
  - Файлы: resources/runtime-control/mac-control.py, resources/mac-runtime.zip, tests/mac-runtime.test.mjs, docs/modules/runtime-lifecycle.md, docs/VERIFICATION.md
- [DONE] T007: Интегрировать Mac runtime bootstrap и persisted registration в Web Pilot — Завершено
  - Git Commit: [DONE] feat: интегрировать self-healing Mac runtime
  - Reference: workflow-kit-recovery-packet-010 / T007 / implementation
  - Файлы: src/mac-runtime.mjs, src/mcp-runtime.mjs, src/platform.mjs, src/main.mjs, tests/mcp-runtime.test.mjs, tests/mac-runtime.test.mjs, tests/electron-smoke.mjs, resources/runtime-control/mac-control.py, docs/modules/runtime-lifecycle.md, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md
- [DONE] T008: Расширить Windows runtime тем же self-healing contract — Завершено
  - Git Commit: [DONE] feat: добавить self-healing Windows runtime
  - Reference: workflow-kit-recovery-packet-010 / T008 / implementation
  - Файлы: resources/runtime-control/windows-control.py, src/windows-runtime.mjs, tests/windows-runtime.test.mjs, src/main.mjs, docs/modules/runtime-lifecycle.md, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md
- [TODO] T009: Проверить и выпустить self-healing runtime release — Ожидает
  - Git Commit: [PENDING] build: выпустить self-healing runtime startup
  - Reference: workflow-kit-recovery-packet-010 / T009 / implementation
  - Файлы: package.json, package-lock.json, tests/electron-smoke.mjs, docs/VERIFICATION.md, docs/WORKFLOW_START.md, docs/modules/runtime-lifecycle.md

## Context Pack For This Cycle

- docs/architecture/OVERVIEW.md → Краткая архитектура проекта
- docs/modules/runtime-lifecycle.md → Module Specification — Runtime Lifecycle
- docs/architecture/ARCHITECTURE.md → Архитектура

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
