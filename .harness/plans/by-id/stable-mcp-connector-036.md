# Активный план — Project Web Pilot

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 2,
  "project_id": "cf944136-d1fc-4bd5-9ea0-e46d1fe230e7",
  "project_name": "Project Web Pilot",
  "scope_id": "stable-mcp-connector-036",
  "execution_scope_status": "ACTIVE",
  "delivery_status": "IN_PROGRESS",
  "objective": "Завершить перенос двух macOS MCP backend на один стабильный Secure MCP Tunnel, пересобрать исправленный релиз 0.6.47 и привести документацию проекта в соответствие с фактической реализацией.",
  "acceptance_criteria": [
    "Один стабильный Secure MCP Tunnel обслуживает оба macOS backend и Settings переключает только backend за тем же ChatGPT connector.",
    "Исправленный 0.6.47 повторно собран для macOS arm64 и Windows x64 из актуального HEAD с обновлёнными manifest/hash/evidence.",
    "Все затронутые документы проекта актуализированы после реализации."
  ],
  "approved_scope": {
    "functional_paths": [
      "tools/codex-app-server-mcp/control.py",
      "src/mac-runtime-switch.mjs",
      "src/mcp-runtime.mjs",
      "tests/mac-runtime-switch.test.mjs",
      "tests/codex-app-server-mcp.test.mjs"
    ],
    "documentation_paths": [
      "docs/architecture/OVERVIEW.md",
      "docs/MODULES.md",
      "docs/DOCUMENTATION_INDEX.md",
      "docs/modules/runtime-lifecycle.md",
      "docs/modules/codex-app-server-executor.md",
      "docs/VERIFICATION.md",
      "docs/RELEASE.md",
      "docs/architecture/ARCHITECTURE.md",
      "README.md"
    ],
    "max_functional_files_per_task": 5
  },
  "baseline_commit": "f87f2073a23a6b1b17522186b8927d547ac7fbd8",
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
        "path": "docs/modules/runtime-lifecycle.md",
        "heading_path": [
          "Module Specification — Runtime Lifecycle"
        ],
        "required": true,
        "revision": "WORKTREE"
      },
      {
        "path": "docs/modules/codex-app-server-executor.md",
        "heading_path": [
          "Codex App Server Local Executor"
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
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "stable-mcp-connector-036",
        "task_id": "T001",
        "role": "implementation"
      },
      "dependencies": [],
      "functional_paths": [
        "tools/codex-app-server-mcp/control.py",
        "src/mac-runtime-switch.mjs",
        "src/mcp-runtime.mjs",
        "tests/mac-runtime-switch.test.mjs",
        "tests/codex-app-server-mcp.test.mjs"
      ],
      "documentation_paths": [
        "docs/modules/runtime-lifecycle.md",
        "docs/modules/codex-app-server-executor.md",
        "docs/VERIFICATION.md",
        "docs/architecture/ARCHITECTURE.md"
      ],
      "verification_ids": [
        "suite"
      ],
      "id": "T001",
      "title": "Свести два backend к одному Secure MCP Tunnel",
      "why": "Исключить два одновременно видимых connector/tool catalog и гарантировать, что Settings меняет backend за одним стабильным ChatGPT connector.",
      "acceptance_criteria": [
        "Новый Secure MCP Tunnel остаётся единственным tunnel для обоих modes; его profile target переключается между старым MCP URL и App Server MCP URL.",
        "В режиме local старый runtime запускает только MCP (--mcp-only), старый tunnel/LaunchAgent остаются disabled; в app-server режиме старый MCP также остановлен.",
        "Стабильный LaunchAgent нового selector восстанавливает выбранный backend+tunnel после login/reboot без запуска старого tunnel.",
        "Orphan-процессы старого runtime на известных executable/path/ports обнаруживаются и завершаются только после строгой identity-проверки; чужие процессы не сигналятся.",
        "После switch один ChatGPT connector предоставляет один каталог tools; backend initialize соответствует выбранному mode."
      ],
      "expected_commit_message": "fix: использовать один tunnel для обоих macOS MCP backend",
      "file_limit_exception": "Один stable-connector contract требует target/tunnel lifecycle в control.py, backend switch facade, mcp-only runtime path и два узких regression-файла; это единая correction обнаруженного end-to-end дефекта."
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "stable-mcp-connector-036",
        "task_id": "T002",
        "role": "implementation"
      },
      "dependencies": [
        "T001"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/RELEASE.md",
        "docs/VERIFICATION.md",
        "docs/architecture/ARCHITECTURE.md",
        "README.md"
      ],
      "verification_ids": [
        "suite",
        "electron-smoke"
      ],
      "id": "T002",
      "title": "Пересобрать 0.6.47 после stable-connector correction",
      "why": "Заменить предварительную 0.6.47 исправленной поставкой и обновить delivery hashes/evidence.",
      "acceptance_criteria": [
        "Полный suite и Electron smoke проходят после stable-connector correction.",
        "npm run build повторно создаёт macOS/Windows 0.6.47 из T001 HEAD и проверяет четыре MCP resource files в обоих ZIP.",
        "Постоянный Mac app обновлён, delivery ~/Downloads/WebPilot-0.6.47 перезаписан, manifest sourceCommit указывает на T001 commit.",
        "RELEASE/README/VERIFICATION содержат финальные SHA-256 исправленной 0.6.47 и правило одного стабильного connector."
      ],
      "expected_commit_message": "release: пересобрать 0.6.47 с одним MCP connector"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "stable-mcp-connector-036",
        "task_id": "DOCS",
        "role": "implementation"
      },
      "id": "DOCS",
      "title": "Актуализация всех документов проекта",
      "why": "Проверить весь действующий комплект документации по docs/DOCUMENTATION_INDEX.md и обновить только устаревшие сведения после выполнения scope.",
      "dependencies": [
        "T001",
        "T002"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/architecture/OVERVIEW.md",
        "docs/MODULES.md",
        "docs/DOCUMENTATION_INDEX.md"
      ],
      "acceptance_criteria": [
        "Все документы из индекса проверены; устаревшие сведения и ссылки исправлены; после этого результат готов только к пользовательской приёмке."
      ],
      "verification_ids": [],
      "expected_commit_message": "docs: актуализировать документацию проекта"
    }
  ],
  "blocked_reason": null,
  "user_decisions": [
    "Пользователь поручил создать в текущей сессии новый план с тремя оставшимися пунктами оборвавшейся предыдущей сессии и на этом остановиться.",
    {
      "id": "8f0a9bf4-fb95-4274-8106-aca6bfc8a09b",
      "text": "Пользователь прямо поручил создать новый план с теми же оставшимися пунктами предыдущей оборвавшейся сессии.",
      "recorded_at": "2026-09-19T14:58:42.781Z"
    }
  ],
  "owner_session_id": "web-pilot-67675492-8406-46a8-89bc-0f8c21fdb300",
  "prepared_in_session_id": null
}
```
<!-- workflow-state:end -->

## Состояние

Execution Scope Status: ACTIVE
Delivery Status: IN_PROGRESS
Scope: stable-mcp-connector-036
Current Task: нет
Revision: 2

## Цель

Завершить перенос двух macOS MCP backend на один стабильный Secure MCP Tunnel, пересобрать исправленный релиз 0.6.47 и привести документацию проекта в соответствие с фактической реализацией.

## Критерии приёмки

- Один стабильный Secure MCP Tunnel обслуживает оба macOS backend и Settings переключает только backend за тем же ChatGPT connector.
- Исправленный 0.6.47 повторно собран для macOS arm64 и Windows x64 из актуального HEAD с обновлёнными manifest/hash/evidence.
- Все затронутые документы проекта актуализированы после реализации.

## Микрозадачи

- [TODO] T001: Свести два backend к одному Secure MCP Tunnel — Ожидает
  - Git Commit: [PENDING] fix: использовать один tunnel для обоих macOS MCP backend
  - Reference: stable-mcp-connector-036 / T001 / implementation
  - Файлы: tools/codex-app-server-mcp/control.py, src/mac-runtime-switch.mjs, src/mcp-runtime.mjs, tests/mac-runtime-switch.test.mjs, tests/codex-app-server-mcp.test.mjs, docs/modules/runtime-lifecycle.md, docs/modules/codex-app-server-executor.md, docs/VERIFICATION.md, docs/architecture/ARCHITECTURE.md
- [TODO] T002: Пересобрать 0.6.47 после stable-connector correction — Ожидает
  - Git Commit: [PENDING] release: пересобрать 0.6.47 с одним MCP connector
  - Reference: stable-mcp-connector-036 / T002 / implementation
  - Файлы: docs/RELEASE.md, docs/VERIFICATION.md, docs/architecture/ARCHITECTURE.md, README.md
- [TODO] DOCS: Актуализация всех документов проекта — Ожидает
  - Git Commit: [PENDING] docs: актуализировать документацию проекта
  - Reference: stable-mcp-connector-036 / DOCS / implementation
  - Файлы: docs/architecture/OVERVIEW.md, docs/MODULES.md, docs/DOCUMENTATION_INDEX.md

## Context Pack For This Cycle

- docs/architecture/OVERVIEW.md → Краткая архитектура проекта
- docs/MODULES.md → Модули проекта
- docs/DOCUMENTATION_INDEX.md → Каталог документации
- docs/modules/runtime-lifecycle.md → Module Specification — Runtime Lifecycle
- docs/modules/codex-app-server-executor.md → Codex App Server Local Executor

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
