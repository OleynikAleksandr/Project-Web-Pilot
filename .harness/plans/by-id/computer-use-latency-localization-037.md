# Активный план — Project Web Pilot

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 8,
  "project_id": "cf944136-d1fc-4bd5-9ea0-e46d1fe230e7",
  "project_name": "Project Web Pilot",
  "scope_id": "computer-use-latency-localization-037",
  "execution_scope_status": "ACTIVE",
  "delivery_status": "IN_PROGRESS",
  "objective": "Количественно локализовать основные задержки пути ChatGPT Web -> plugin/connector -> Secure MCP Tunnel -> local MCP -> Computer Use/Sky -> response и определить, какая часть ~3-секундного tool round-trip контролируется Project Web Pilot.",
  "acceptance_criteria": [
    "Для direct loopback и Web/tunnel пути собраны сопоставимые warm/cold серии не менее 15 измерений для lightweight tool и Computer Use primitives.",
    "Локальный MCP имеет opt-in monotonic trace с correlation id, который не пишет секреты, аргументы пользователя или содержимое ChatGPT.",
    "Для типичного Web ChatGPT вызова количественно определены local MCP total, actual Computer Use/Sky time и внешний residual до/после local server.",
    "На основании данных зафиксировано решение: оптимизировать локальный код/tunnel либо уменьшать число Web tool round-trips через compound/sequence operations; реализация выбранного ускорения не начинается без отдельного решения пользователя."
  ],
  "approved_scope": {
    "functional_paths": [
      "scripts/benchmark-mcp-latency.mjs",
      "tools/codex-app-server-mcp/server.py",
      "tests/codex-app-server-mcp.test.mjs"
    ],
    "documentation_paths": [
      "docs/design/computer-use-latency-investigation.md",
      "docs/modules/runtime-lifecycle.md",
      "docs/modules/codex-app-server-executor.md",
      "docs/VERIFICATION.md",
      "docs/architecture/OVERVIEW.md",
      "docs/MODULES.md",
      "docs/DOCUMENTATION_INDEX.md"
    ],
    "max_functional_files_per_task": 3
  },
  "baseline_commit": "d6014a9c4e4e8e7d4653a3289de4f133826163ba",
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
          "Module Specification — Codex App Server Local Executor"
        ],
        "required": true,
        "revision": "WORKTREE"
      },
      {
        "path": "docs/design/computer-use-latency-investigation.md",
        "heading_path": [
          "Исследование задержек Computer Use и MCP"
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
      "id": "T005",
      "title": "Простой Web MCP тест записи и чтения для сравнения с локальным ChatGPT",
      "why": "По поручению пользователя сначала сравнить задержку простых файловых вызовов без Computer Use и изменений runtime.",
      "dependencies": [],
      "functional_paths": [],
      "documentation_paths": [
        "docs/design/computer-use-latency-investigation.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [],
      "acceptance_criteria": [
        "В одной временной папке выполнены один пробный и 15 измеряемых последовательных циклов записи и чтения файла 1024 байт через существующий Web MCP.",
        "Сохранены raw timings каждого tool call, статистика, фактический backend и проверка точного содержимого.",
        "Подготовлено задание локальному ChatGPT на ту же папку и последовательность с измерением внешнего времени каждого native tool call; результаты локального агента пока не предполагаются."
      ],
      "expected_commit_message": "docs: измерить Web MCP запись и чтение файла",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "computer-use-latency-localization-037",
        "task_id": "T005",
        "role": "implementation"
      }
    },
    {
      "id": "T006",
      "title": "Сопоставить Web MCP и полученный тест Codex Desktop",
      "why": "Сохранить присланные пользователем raw samples и корректно отделить сравнение путей от локализации туннеля.",
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "computer-use-latency-localization-037",
        "task_id": "T006",
        "role": "implementation"
      },
      "dependencies": [
        "T005"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/design/computer-use-latency-investigation.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [],
      "acceptance_criteria": [
        "Сохранены 15 пользовательских пар Codex Desktop, прогрев, путь исполнения и проверка содержимого с указанием источника.",
        "Статистика пересчитана из raw samples, отношение задержек и разница рассчитаны для одинаковых метрик.",
        "Явно указано, что desktop использовал exec_command и shell, Web использовал MCP file tools; разница не приписана целиком туннелю, следующий минимальный контроль — loopback того же MCP."
      ],
      "expected_commit_message": "docs: сравнить задержки Web MCP и Codex Desktop"
    },
    {
      "id": "T001",
      "title": "Собрать воспроизводимый direct-loopback benchmark",
      "why": "Отделить локальный MCP/backend от Secure MCP Tunnel и Web ChatGPT tool dispatch на одинаковых сериях вызовов.",
      "dependencies": [],
      "functional_paths": [
        "scripts/benchmark-mcp-latency.mjs"
      ],
      "documentation_paths": [
        "docs/design/computer-use-latency-investigation.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "suite"
      ],
      "acceptance_criteria": [
        "Benchmark напрямую вызывает локальный MCP endpoint без Secure MCP Tunnel и без модельного turn.",
        "Есть серии для lightweight read/control tool и как минимум capture/click/scroll, raw samples и min/median/mean/p95/max.",
        "Warm-up и steady-state измеряются отдельно; методика не меняется между сравниваемыми сериями."
      ],
      "expected_commit_message": "test: добавить direct loopback latency benchmark",
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "computer-use-latency-localization-037",
        "task_id": "T001",
        "role": "implementation"
      }
    },
    {
      "id": "T002",
      "title": "Добавить opt-in segment tracing в App Server MCP",
      "why": "Разделить время local server orchestration и фактического Computer Use/Sky исполнения, не меняя обычное production поведение.",
      "dependencies": [
        "T001"
      ],
      "functional_paths": [
        "tools/codex-app-server-mcp/server.py",
        "tests/codex-app-server-mcp.test.mjs"
      ],
      "documentation_paths": [
        "docs/design/computer-use-latency-investigation.md",
        "docs/modules/codex-app-server-executor.md"
      ],
      "verification_ids": [
        "suite"
      ],
      "acceptance_criteria": [
        "Trace включается только явным benchmark flag/env и по умолчанию выключен.",
        "Записываются только monotonic timestamps, correlation id и имя операции; secrets, tool arguments, clipboard, screenshots и ChatGPT content не логируются.",
        "Для Computer Use видны request/handler ingress, before/after Sky и response completion timestamps.",
        "Regression подтверждает отсутствие изменения публичного tool catalog и поведения при выключенном trace."
      ],
      "expected_commit_message": "test: добавить безопасный latency trace MCP",
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "computer-use-latency-localization-037",
        "task_id": "T002",
        "role": "implementation"
      }
    },
    {
      "id": "T003",
      "title": "Снять синхронные loopback и Web/tunnel серии",
      "why": "Связать внешнее end-to-end время Web ChatGPT с локальными trace timestamps и вычислить внешний residual.",
      "dependencies": [
        "T001",
        "T002"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/design/computer-use-latency-investigation.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [],
      "acceptance_criteria": [
        "Для lightweight tool и Computer Use сняты сопоставимые серии direct loopback и через стабильный ChatGPT connector.",
        "Для каждой серии сохранены raw samples и статистика; отдельно отмечены first-call/warm-up выбросы.",
        "Вычислены T_web_total, T_local_total, T_sky и residual = T_web_total - T_local_total с оговоркой о доступной точности синхронизации."
      ],
      "expected_commit_message": "docs: зафиксировать segment latency evidence",
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "computer-use-latency-localization-037",
        "task_id": "T003",
        "role": "implementation"
      }
    },
    {
      "id": "T004",
      "title": "Локализовать bottleneck и выбрать следующий путь",
      "why": "Не начинать оптимизацию до количественного понимания, где находится основная задержка.",
      "dependencies": [
        "T003"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/design/computer-use-latency-investigation.md",
        "docs/modules/runtime-lifecycle.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [],
      "acceptance_criteria": [
        "Для типичного ~3-секундного Web tool call указано, какая доля времени находится внутри local MCP/Sky и какая остаётся во внешнем Web/tunnel path.",
        "Если local часть существенна, перечислены конкретные локальные узкие места; если доминирует внешний round-trip, описан минимальный вариант compound/sequence operation для сокращения числа round-trips.",
        "Никакое ускорение production runtime не реализуется до явного решения пользователя по итогам измерений."
      ],
      "expected_commit_message": "docs: локализовать bottleneck Computer Use",
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "computer-use-latency-localization-037",
        "task_id": "T004",
        "role": "implementation"
      }
    },
    {
      "id": "DOCS",
      "title": "Актуализация всех документов проекта",
      "why": "Проверить весь действующий комплект документации по docs/DOCUMENTATION_INDEX.md и обновить только устаревшие сведения после выполнения scope.",
      "dependencies": [
        "T005",
        "T006",
        "T001",
        "T002",
        "T003",
        "T004"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/architecture/OVERVIEW.md",
        "docs/MODULES.md",
        "docs/DOCUMENTATION_INDEX.md"
      ],
      "verification_ids": [],
      "acceptance_criteria": [
        "Все документы из индекса проверены; устаревшие сведения и ссылки исправлены; после этого результат готов только к пользовательской приёмке."
      ],
      "expected_commit_message": "docs: актуализировать документацию проекта",
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "computer-use-latency-localization-037",
        "task_id": "DOCS",
        "role": "implementation"
      }
    }
  ],
  "blocked_reason": null,
  "user_decisions": [
    "Пользователь поручил сохранить результаты текущих тестов и продолжить в отдельной следующей сессии.",
    "Главная цель следующего этапа — найти, где именно в пути Web ChatGPT до локального компьютера возникают основные задержки, а не заранее переписывать Computer Use backend.",
    {
      "id": "e6c03fbb-aaad-4086-9c08-1c32a94238ac",
      "text": "Пользователь прямо поручил подготовить следующий план исследования задержек Compute Use, Secure MCP Tunnel и Web ChatGPT на основе проведённых сравнительных тестов.",
      "recorded_at": "2026-09-19T17:18:32.590Z"
    },
    "19.09.2026: сначала выполнить простой тест записи/чтения через Web MCP и подготовить идентичное задание локальному ChatGPT; дальнейшее сравнение после получения результата пользователя."
  ],
  "owner_session_id": "web-pilot-c638c8e7-37a3-4e58-b5d7-a4c92206dfb0",
  "prepared_in_session_id": "web-pilot-67675492-8406-46a8-89bc-0f8c21fdb300",
  "session_experience": "work"
}
```
<!-- workflow-state:end -->

## Состояние

Execution Scope Status: ACTIVE
Delivery Status: IN_PROGRESS
Scope: computer-use-latency-localization-037
Current Task: нет
Revision: 8

## Цель

Количественно локализовать основные задержки пути ChatGPT Web -> plugin/connector -> Secure MCP Tunnel -> local MCP -> Computer Use/Sky -> response и определить, какая часть ~3-секундного tool round-trip контролируется Project Web Pilot.

## Критерии приёмки

- Для direct loopback и Web/tunnel пути собраны сопоставимые warm/cold серии не менее 15 измерений для lightweight tool и Computer Use primitives.
- Локальный MCP имеет opt-in monotonic trace с correlation id, который не пишет секреты, аргументы пользователя или содержимое ChatGPT.
- Для типичного Web ChatGPT вызова количественно определены local MCP total, actual Computer Use/Sky time и внешний residual до/после local server.
- На основании данных зафиксировано решение: оптимизировать локальный код/tunnel либо уменьшать число Web tool round-trips через compound/sequence operations; реализация выбранного ускорения не начинается без отдельного решения пользователя.

## Микрозадачи

- [DONE] T005: Простой Web MCP тест записи и чтения для сравнения с локальным ChatGPT — Завершено
  - Git Commit: [DONE] docs: измерить Web MCP запись и чтение файла
  - Reference: computer-use-latency-localization-037 / T005 / implementation
  - Файлы: docs/design/computer-use-latency-investigation.md, docs/VERIFICATION.md
- [TODO] T006: Сопоставить Web MCP и полученный тест Codex Desktop — Ожидает
  - Git Commit: [PENDING] docs: сравнить задержки Web MCP и Codex Desktop
  - Reference: computer-use-latency-localization-037 / T006 / implementation
  - Файлы: docs/design/computer-use-latency-investigation.md, docs/VERIFICATION.md
- [TODO] T001: Собрать воспроизводимый direct-loopback benchmark — Ожидает
  - Git Commit: [PENDING] test: добавить direct loopback latency benchmark
  - Reference: computer-use-latency-localization-037 / T001 / implementation
  - Файлы: scripts/benchmark-mcp-latency.mjs, docs/design/computer-use-latency-investigation.md, docs/VERIFICATION.md
- [TODO] T002: Добавить opt-in segment tracing в App Server MCP — Ожидает
  - Git Commit: [PENDING] test: добавить безопасный latency trace MCP
  - Reference: computer-use-latency-localization-037 / T002 / implementation
  - Файлы: tools/codex-app-server-mcp/server.py, tests/codex-app-server-mcp.test.mjs, docs/design/computer-use-latency-investigation.md, docs/modules/codex-app-server-executor.md
- [TODO] T003: Снять синхронные loopback и Web/tunnel серии — Ожидает
  - Git Commit: [PENDING] docs: зафиксировать segment latency evidence
  - Reference: computer-use-latency-localization-037 / T003 / implementation
  - Файлы: docs/design/computer-use-latency-investigation.md, docs/VERIFICATION.md
- [TODO] T004: Локализовать bottleneck и выбрать следующий путь — Ожидает
  - Git Commit: [PENDING] docs: локализовать bottleneck Computer Use
  - Reference: computer-use-latency-localization-037 / T004 / implementation
  - Файлы: docs/design/computer-use-latency-investigation.md, docs/modules/runtime-lifecycle.md, docs/VERIFICATION.md
- [TODO] DOCS: Актуализация всех документов проекта — Ожидает
  - Git Commit: [PENDING] docs: актуализировать документацию проекта
  - Reference: computer-use-latency-localization-037 / DOCS / implementation
  - Файлы: docs/architecture/OVERVIEW.md, docs/MODULES.md, docs/DOCUMENTATION_INDEX.md

## Context Pack For This Cycle

- docs/architecture/OVERVIEW.md → Краткая архитектура проекта
- docs/MODULES.md → Модули проекта
- docs/DOCUMENTATION_INDEX.md → Каталог документации
- docs/modules/runtime-lifecycle.md → Module Specification — Runtime Lifecycle
- docs/modules/codex-app-server-executor.md → Module Specification — Codex App Server Local Executor
- docs/design/computer-use-latency-investigation.md → Исследование задержек Computer Use и MCP

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
