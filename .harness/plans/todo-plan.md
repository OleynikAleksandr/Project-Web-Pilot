# Активный план — Project Web Pilot

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 222,
  "project_id": "cf944136-d1fc-4bd5-9ea0-e46d1fe230e7",
  "project_name": "Project Web Pilot",
  "scope_id": "web-pilot-unified-mac-windows-009",
  "execution_scope_status": "ACTIVE",
  "delivery_status": "IN_PROGRESS",
  "objective": "Объединить Project Web Pilot для macOS и Windows в один канонический репозиторий: перенести подтверждённые Windows-исправления в общий код, сохранить обе платформенные сборки и подготовить лёгкую Git-синхронизацию между компьютерами без переноса runtime/build-артефактов.",
  "acceptance_criteria": [
    "Полезные Windows runtime fixes 0.6.1/0.6.2 перенесены в общий код без регрессии macOS.",
    "Общий package/build contract поддерживает build:mac и build:win; обычная общая сборка формирует оба package на Mac.",
    "Кроссплатформенные regression tests синхронизированы и полный suite проходит на Mac.",
    "macOS package и Windows x64 package успешно собираются из одного workspace.",
    "Тяжёлые локальные runtime/build артефакты не входят в Git; общий репозиторий готов к private remote sync между Mac и Windows."
  ],
  "approved_scope": {
    "functional_paths": [
      ".gitignore",
      "package.json",
      "package-lock.json",
      "BUILD_WINDOWS.cmd",
      "RUN_WINDOWS.cmd",
      "scripts/prepare-windows-toolchain.mjs",
      "src/main.mjs",
      "src/mcp-runtime.mjs",
      "src/windows-runtime.mjs",
      "tests/mcp-runtime.test.mjs",
      "tests/windows-runtime.test.mjs",
      "tests/workflow-kit-source.test.mjs",
      "tests/workspace-deletion.test.mjs",
      "tests/workspace-session.test.mjs",
      "tests/workspace-setup.test.mjs"
    ],
    "documentation_paths": [
      "docs/PRODUCT.md",
      "docs/VERIFICATION.md",
      "docs/WORKFLOW_START.md",
      "docs/TRANSFER_TO_WINDOWS.md",
      "docs/DECISIONS.md",
      "docs/architecture/ARCHITECTURE.md"
    ],
    "max_functional_files_per_task": 7
  },
  "baseline_commit": "9c331bf617a08c2e838474b6d094849960d4b9f2",
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
      },
      {
        "path": "docs/architecture/ARCHITECTURE.md",
        "heading_path": [
          "Архитектура"
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
      "functional_paths": [
        "src/windows-runtime.mjs",
        "src/mcp-runtime.mjs",
        "src/main.mjs",
        "tests/windows-runtime.test.mjs",
        "tests/mcp-runtime.test.mjs"
      ],
      "documentation_paths": [
        "docs/VERIFICATION.md",
        "docs/architecture/ARCHITECTURE.md"
      ],
      "verification_ids": [
        "runtime",
        "suite"
      ],
      "id": "T001",
      "title": "Синхронизировать Windows runtime fixes",
      "why": "Вернуть в общий source of truth подтверждённые на Windows исправления переиспользования внешнего Codex Local Windows и фактического runtime folder.",
      "acceptance_criteria": [
        "Существующий совместимый Codex Local Windows переиспользуется вместо второй копии.",
        "ensureRuntime может заменить stale runtime path на фактический prepared folder.",
        "macOS runtime path и поведение не меняются."
      ],
      "expected_commit_message": "fix: синхронизировать Windows runtime с общим проектом",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "web-pilot-unified-mac-windows-009",
        "task_id": "T001",
        "role": "implementation"
      }
    },
    {
      "dependencies": [
        "T001"
      ],
      "functional_paths": [
        "package.json",
        "package-lock.json",
        "scripts/prepare-windows-toolchain.mjs",
        "BUILD_WINDOWS.cmd",
        "RUN_WINDOWS.cmd",
        ".gitignore",
        "tests/windows-runtime.test.mjs"
      ],
      "documentation_paths": [
        "docs/PRODUCT.md",
        "docs/TRANSFER_TO_WINDOWS.md",
        "docs/WORKFLOW_START.md",
        "docs/architecture/ARCHITECTURE.md"
      ],
      "verification_ids": [
        "syntax"
      ],
      "id": "T002",
      "title": "Объединить packaging macOS и Windows",
      "why": "Один репозиторий должен уметь собирать обе платформы и не зависеть от переноса тяжёлых локальных артефактов.",
      "acceptance_criteria": [
        "Сохранены build:mac и build:win, а общий build формирует оба package.",
        "Windows toolchain сначала переиспользует packaged payload/cache, не требуя соседнего Mac runtime repository.",
        "node_modules, .harness/runtime, windows-app и platform build outputs не синхронизируются через Git."
      ],
      "expected_commit_message": "build: объединить macOS и Windows packaging",
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "web-pilot-unified-mac-windows-009",
        "task_id": "T002",
        "role": "implementation"
      }
    },
    {
      "dependencies": [
        "T002"
      ],
      "functional_paths": [
        "tests/workflow-kit-source.test.mjs",
        "tests/workspace-deletion.test.mjs",
        "tests/workspace-session.test.mjs",
        "tests/workspace-setup.test.mjs"
      ],
      "documentation_paths": [
        "docs/VERIFICATION.md",
        "docs/DECISIONS.md",
        "docs/WORKFLOW_START.md"
      ],
      "verification_ids": [
        "suite",
        "electron-smoke"
      ],
      "id": "T003",
      "title": "Синхронизировать кроссплатформенные тесты и проверить обе сборки",
      "why": "Общий репозиторий должен ловить platform-specific regressions до передачи изменений на второй компьютер.",
      "acceptance_criteria": [
        "Тесты не предполагают POSIX symlink/mode semantics на Windows.",
        "Полный npm test и Electron smoke проходят на Mac.",
        "Из одного workspace успешно собраны macOS arm64 app и Windows x64 exe.",
        "Документация фиксирует один общий Git source of truth и локальные platform runtimes."
      ],
      "expected_commit_message": "test: подтвердить единый macOS Windows репозиторий",
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "web-pilot-unified-mac-windows-009",
        "task_id": "T003",
        "role": "implementation"
      }
    }
  ],
  "blocked_reason": null,
  "user_decisions": [
    {
      "id": "61622b55-bfd4-4d6e-9fca-a2685dba5225",
      "text": "13.09.2026 пользователь прямо поручил объединить macOS и Windows проекты в один Project Web Pilot, дальше вести обе платформы параллельно из общего Git-репозитория и после успешной синхронизации отказаться от отдельной папки Win Project Web Pilot.",
      "recorded_at": "2026-09-13T17:50:23.012Z"
    }
  ]
}
```
<!-- workflow-state:end -->

## Состояние

Execution Scope Status: ACTIVE
Delivery Status: IN_PROGRESS
Scope: web-pilot-unified-mac-windows-009
Current Task: нет
Revision: 222

## Цель

Объединить Project Web Pilot для macOS и Windows в один канонический репозиторий: перенести подтверждённые Windows-исправления в общий код, сохранить обе платформенные сборки и подготовить лёгкую Git-синхронизацию между компьютерами без переноса runtime/build-артефактов.

## Критерии приёмки

- Полезные Windows runtime fixes 0.6.1/0.6.2 перенесены в общий код без регрессии macOS.
- Общий package/build contract поддерживает build:mac и build:win; обычная общая сборка формирует оба package на Mac.
- Кроссплатформенные regression tests синхронизированы и полный suite проходит на Mac.
- macOS package и Windows x64 package успешно собираются из одного workspace.
- Тяжёлые локальные runtime/build артефакты не входят в Git; общий репозиторий готов к private remote sync между Mac и Windows.

## Микрозадачи

- [DONE] T001: Синхронизировать Windows runtime fixes — Завершено
  - Git Commit: [DONE] fix: синхронизировать Windows runtime с общим проектом
  - Reference: web-pilot-unified-mac-windows-009 / T001 / implementation
  - Файлы: src/windows-runtime.mjs, src/mcp-runtime.mjs, src/main.mjs, tests/windows-runtime.test.mjs, tests/mcp-runtime.test.mjs, docs/VERIFICATION.md, docs/architecture/ARCHITECTURE.md
- [TODO] T002: Объединить packaging macOS и Windows — Ожидает
  - Git Commit: [PENDING] build: объединить macOS и Windows packaging
  - Reference: web-pilot-unified-mac-windows-009 / T002 / implementation
  - Файлы: package.json, package-lock.json, scripts/prepare-windows-toolchain.mjs, BUILD_WINDOWS.cmd, RUN_WINDOWS.cmd, .gitignore, tests/windows-runtime.test.mjs, docs/PRODUCT.md, docs/TRANSFER_TO_WINDOWS.md, docs/WORKFLOW_START.md, docs/architecture/ARCHITECTURE.md
- [TODO] T003: Синхронизировать кроссплатформенные тесты и проверить обе сборки — Ожидает
  - Git Commit: [PENDING] test: подтвердить единый macOS Windows репозиторий
  - Reference: web-pilot-unified-mac-windows-009 / T003 / implementation
  - Файлы: tests/workflow-kit-source.test.mjs, tests/workspace-deletion.test.mjs, tests/workspace-session.test.mjs, tests/workspace-setup.test.mjs, docs/VERIFICATION.md, docs/DECISIONS.md, docs/WORKFLOW_START.md

## Context Pack For This Cycle

- docs/PRODUCT.md → Продукт
- docs/architecture/ARCHITECTURE.md → Архитектура

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
