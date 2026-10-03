# Активный план — Project Web Pilot

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 963,
  "project_id": "cf944136-d1fc-4bd5-9ea0-e46d1fe230e7",
  "project_name": "Project Web Pilot",
  "scope_id": "macos-screen-permission-stability-20261003",
  "execution_scope_status": "ACTIVE",
  "delivery_status": "IN_PROGRESS",
  "objective": "Устранить повторный запрос Screen Recording из-за смены подписи Web Pilot: постоянная identity, проверяемая упаковка и сохранение разрешения после обновления",
  "acceptance_criteria": [
    "Устранить повторный запрос Screen Recording из-за смены подписи Web Pilot: постоянная identity, проверяемая упаковка и сохранение разрешения после обновления"
  ],
  "approved_scope": {
    "functional_paths": [
      "package.json",
      "package-lock.json",
      "scripts/sign-mac-bundle.mjs",
      "scripts/release-mac.mjs",
      "scripts/release-all.mjs",
      "scripts/check-mac-signature.mjs",
      "scripts/check-installed-release.mjs",
      "tests/release-mac.test.mjs",
      "scripts/check-mac-screen-capture.mjs",
      "tests/sign-mac-bundle.test.mjs"
    ],
    "documentation_paths": [
      "docs/planning/macos-screen-permission-stability.md",
      "docs/architecture/OVERVIEW.md",
      "docs/MODULES.md",
      "docs/DOCUMENTATION_INDEX.md",
      "docs/RELEASE.md",
      "docs/VERIFICATION.md",
      "docs/PRODUCT.md",
      "docs/architecture/ARCHITECTURE.md"
    ]
  },
  "baseline_commit": "cf72636faecc54f0bd38ef6c6bbf263efca4d9e7",
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
        "path": "docs/planning/macos-screen-permission-stability.md",
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
        "scope_id": "macos-screen-permission-stability-20261003",
        "task_id": "T001",
        "role": "implementation"
      },
      "dependencies": [],
      "functional_paths": [],
      "documentation_paths": [
        "docs/planning/macos-screen-permission-stability.md",
        "docs/architecture/OVERVIEW.md",
        "docs/MODULES.md",
        "docs/DOCUMENTATION_INDEX.md"
      ],
      "verification_ids": [],
      "id": "T001",
      "title": "Зафиксировать подтверждённую причину, контракт решения и current план",
      "why": "Зафиксировать подтверждённую причину, контракт решения и current план",
      "verification_kind": "code",
      "acceptance_criteria": [
        "План связан с Release & Local Installation и Executor; сохранены TCC evidence, проверенный стандартный путь подписи и условия приёмки",
        "Реализация не запущена; явный выбор сертификата остаётся до подписи"
      ],
      "expected_commit_message": "docs: plan stable macOS screen recording permissions",
      "actual_files": [
        "docs/architecture/OVERVIEW.md",
        "docs/MODULES.md",
        "docs/DOCUMENTATION_INDEX.md"
      ]
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "macos-screen-permission-stability-20261003",
        "task_id": "T002",
        "role": "implementation"
      },
      "dependencies": [
        "T001"
      ],
      "functional_paths": [
        "package.json",
        "package-lock.json",
        "scripts/sign-mac-bundle.mjs",
        "tests/sign-mac-bundle.test.mjs"
      ],
      "documentation_paths": [
        "docs/planning/macos-screen-permission-stability.md",
        "docs/RELEASE.md",
        "docs/architecture/OVERVIEW.md",
        "docs/DOCUMENTATION_INDEX.md"
      ],
      "verification_ids": [
        "unit",
        "smoke"
      ],
      "id": "T002",
      "title": "Настроить постоянную подпись окончательного macOS bundle",
      "why": "Настроить постоянную подпись окончательного macOS bundle",
      "verification_kind": "code",
      "acceptance_criteria": [
        "До действия пользователь явно выбрал одну identity; автоматического выбора и fallback на ad hoc нет",
        "Штатный @electron/osx-sign подписывает окончательные ресурсы и вложенные компоненты; bundle identity соответствует com.oleynik.ProjectWebPilot",
        "Производственная подпись и нотарификация не добавляются"
      ],
      "expected_commit_message": "fix: sign macOS bundle with a persistent development identity",
      "actual_files": [
        "package.json",
        "package-lock.json",
        "scripts/sign-mac-bundle.mjs",
        "tests/sign-mac-bundle.test.mjs",
        "docs/RELEASE.md",
        "docs/planning/macos-screen-permission-stability.md",
        "docs/architecture/OVERVIEW.md",
        "docs/DOCUMENTATION_INDEX.md"
      ]
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "macos-screen-permission-stability-20261003",
        "task_id": "T003",
        "role": "implementation"
      },
      "dependencies": [
        "T002"
      ],
      "functional_paths": [
        "scripts/release-mac.mjs",
        "scripts/release-all.mjs",
        "scripts/check-mac-signature.mjs",
        "scripts/check-installed-release.mjs",
        "tests/release-mac.test.mjs"
      ],
      "documentation_paths": [
        "docs/planning/macos-screen-permission-stability.md",
        "docs/RELEASE.md"
      ],
      "verification_ids": [
        "unit",
        "smoke",
        "mac-signature"
      ],
      "id": "T003",
      "title": "Добавить контроль подписи перед выпуском и установкой",
      "why": "Добавить контроль подписи перед выпуском и установкой",
      "verification_kind": "installed",
      "acceptance_criteria": [
        "Staging, ZIP и обе установленные копии проверены; после подписи sealed resources не меняются",
        "Неверная identity/подпись блокирует замену app; отрицательный тест использует только временный bundle",
        "Finder identity, постоянный путь и штатный rollback сохранены"
      ],
      "expected_commit_message": "fix: verify macOS code signature before installing releases"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "macos-screen-permission-stability-20261003",
        "task_id": "T004",
        "role": "implementation"
      },
      "dependencies": [
        "T003"
      ],
      "functional_paths": [
        "scripts/check-mac-screen-capture.mjs"
      ],
      "documentation_paths": [
        "docs/planning/macos-screen-permission-stability.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "mac-signature",
        "mac-screen-capture"
      ],
      "id": "T004",
      "title": "Перепривязать разрешение текущей сборки и проверить настоящий MCP-захват",
      "why": "Перепривязать разрешение текущей сборки и проверить настоящий MCP-захват",
      "verification_kind": "installed",
      "acceptance_criteria": [
        "Пользователь выдал один первичный consent исправленной копии Web Pilot штатными средствами macOS",
        "Действующий MCP capture_screen возвращает непустой PNG; responsible application подтверждён",
        "Повторный запуск app/executor сохраняет разрешение; нет TCC mismatch"
      ],
      "expected_commit_message": "test: verify screen capture through the installed MCP executor"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "macos-screen-permission-stability-20261003",
        "task_id": "T005",
        "role": "implementation"
      },
      "dependencies": [
        "T004"
      ],
      "functional_paths": [
        "scripts/check-mac-signature.mjs",
        "scripts/check-mac-screen-capture.mjs"
      ],
      "documentation_paths": [
        "docs/planning/macos-screen-permission-stability.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "mac-signature",
        "mac-screen-capture"
      ],
      "id": "T005",
      "title": "Подтвердить сохранение разрешения между двумя сборками и после перезагрузки",
      "why": "Подтвердить сохранение разрешения между двумя сборками и после перезагрузки",
      "verification_kind": "installed",
      "acceptance_criteria": [
        "Сборки A/B имеют разные CDHash, но одинаковую выбранную signing identity и совместимые designated requirements",
        "После установки B поверх A и перезагрузки реальный MCP-захват работает без повторного consent; пользователь подтверждает отсутствие диалога",
        "Сохранены evidence обеих сборок, запуска и live результата; неподтверждённая проверка не объявлена успешной"
      ],
      "expected_commit_message": "test: verify persistent screen permission across macOS updates"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "macos-screen-permission-stability-20261003",
        "task_id": "DOCS",
        "role": "implementation"
      },
      "dependencies": [
        "T001",
        "T002",
        "T003",
        "T004",
        "T005"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/planning/macos-screen-permission-stability.md",
        "docs/PRODUCT.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/architecture/OVERVIEW.md",
        "docs/MODULES.md",
        "docs/DOCUMENTATION_INDEX.md",
        "docs/RELEASE.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [],
      "id": "DOCS",
      "title": "Актуализация всех документов проекта",
      "why": "Сохранить актуальный контекст для следующего агента",
      "acceptance_criteria": [
        "Документы соответствуют результату"
      ],
      "expected_commit_message": "docs: актуализировать контекст проекта"
    }
  ],
  "blocked_reason": null,
  "user_decisions": [
    {
      "id": "35afacb0-99f8-496b-9b2e-a22ab80e5b66",
      "text": "Пользователь поручил выполнить описанную задачу и план.",
      "recorded_at": "2026-10-03T09:27:30.178Z"
    }
  ]
}
```
<!-- workflow-state:end -->

## Состояние

Execution Scope Status: ACTIVE
Delivery Status: IN_PROGRESS
Scope: macos-screen-permission-stability-20261003
Current Task: нет
Revision: 963

## Цель

Устранить повторный запрос Screen Recording из-за смены подписи Web Pilot: постоянная identity, проверяемая упаковка и сохранение разрешения после обновления

## Критерии приёмки

- Устранить повторный запрос Screen Recording из-за смены подписи Web Pilot: постоянная identity, проверяемая упаковка и сохранение разрешения после обновления

## Микрозадачи

- [DONE] T001: Зафиксировать подтверждённую причину, контракт решения и current план — Завершено
  - Git Commit: [DONE] docs: plan stable macOS screen recording permissions
  - Reference: macos-screen-permission-stability-20261003 / T001 / implementation
  - Файлы: docs/planning/macos-screen-permission-stability.md, docs/architecture/OVERVIEW.md, docs/MODULES.md, docs/DOCUMENTATION_INDEX.md
- [DONE] T002: Настроить постоянную подпись окончательного macOS bundle — Завершено
  - Git Commit: [DONE] fix: sign macOS bundle with a persistent development identity
  - Reference: macos-screen-permission-stability-20261003 / T002 / implementation
  - Файлы: package.json, package-lock.json, scripts/sign-mac-bundle.mjs, tests/sign-mac-bundle.test.mjs, docs/planning/macos-screen-permission-stability.md, docs/RELEASE.md, docs/architecture/OVERVIEW.md, docs/DOCUMENTATION_INDEX.md
- [TODO] T003: Добавить контроль подписи перед выпуском и установкой — Ожидает
  - Git Commit: [PENDING] fix: verify macOS code signature before installing releases
  - Reference: macos-screen-permission-stability-20261003 / T003 / implementation
  - Файлы: scripts/release-mac.mjs, scripts/release-all.mjs, scripts/check-mac-signature.mjs, scripts/check-installed-release.mjs, tests/release-mac.test.mjs, docs/planning/macos-screen-permission-stability.md, docs/RELEASE.md
- [TODO] T004: Перепривязать разрешение текущей сборки и проверить настоящий MCP-захват — Ожидает
  - Git Commit: [PENDING] test: verify screen capture through the installed MCP executor
  - Reference: macos-screen-permission-stability-20261003 / T004 / implementation
  - Файлы: scripts/check-mac-screen-capture.mjs, docs/planning/macos-screen-permission-stability.md, docs/VERIFICATION.md
- [TODO] T005: Подтвердить сохранение разрешения между двумя сборками и после перезагрузки — Ожидает
  - Git Commit: [PENDING] test: verify persistent screen permission across macOS updates
  - Reference: macos-screen-permission-stability-20261003 / T005 / implementation
  - Файлы: scripts/check-mac-signature.mjs, scripts/check-mac-screen-capture.mjs, docs/planning/macos-screen-permission-stability.md, docs/VERIFICATION.md
- [TODO] DOCS: Актуализация всех документов проекта — Ожидает
  - Git Commit: [PENDING] docs: актуализировать контекст проекта
  - Reference: macos-screen-permission-stability-20261003 / DOCS / implementation
  - Файлы: docs/planning/macos-screen-permission-stability.md, docs/PRODUCT.md, docs/architecture/ARCHITECTURE.md, docs/architecture/OVERVIEW.md, docs/MODULES.md, docs/DOCUMENTATION_INDEX.md, docs/RELEASE.md, docs/VERIFICATION.md

## Context Pack For This Cycle

- docs/architecture/OVERVIEW.md → Краткая архитектура проекта
- docs/MODULES.md → Модули проекта
- docs/DOCUMENTATION_INDEX.md → Каталог документации
- docs/planning/macos-screen-permission-stability.md

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
