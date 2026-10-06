# Активный план — Project Web Pilot

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 1357,
  "project_id": "cf944136-d1fc-4bd5-9ea0-e46d1fe230e7",
  "project_name": "Project Web Pilot",
  "scope_id": "recovery-on-demand-research-20261006",
  "execution_scope_status": "ACTIVE",
  "delivery_status": "IN_PROGRESS",
  "objective": "Рефакторинг Workflow Kit: минимальная документация, восстановление по плану и Git, recovery из целых выбранных документов; сначала новый выпуск, затем согласованная миграция проекта.",
  "acceptance_criteria": [
    "Правила, шаблоны и проверки реализуют согласованный жизненный цикл документации и Git-восстановления.",
    "Recovery и Web Pilot одинаково работают на macOS/Windows по контракту, передают нужные целые документы без дублей и скрытого усечения.",
    "Новый Kit выпущен до миграции документации; T008/T009 добавлены новым Kit и переход завершён только после проверки согласованности."
  ],
  "approved_scope": {
    "functional_paths": [
      "packages/workflow-kit/src/lib/actions.mjs",
      "packages/workflow-kit/src/lib/plan.mjs",
      "packages/workflow-kit/src/lib/validate.mjs",
      "packages/workflow-kit/src/lib/git-hooks.mjs",
      "packages/workflow-kit/src/lib/transaction.mjs",
      "packages/workflow-kit/src/lib/simple-workflow.mjs",
      "packages/workflow-kit/src/lib/extend-plan.mjs",
      "packages/workflow-kit/scripts/check-runtime-fixture.mjs",
      "packages/workflow-kit/src/lib/recovery.mjs",
      "packages/workflow-kit/src/lib/project-facts.mjs",
      "packages/workflow-kit/src/lib/git.mjs",
      "packages/workflow-kit/src/lib/command-help.mjs",
      "tests/workflow-kit-recovery.test.mjs",
      "src/context-session.mjs",
      "src/context-cache.mjs",
      "src/session-plans.mjs",
      "src/mcp-runtime.mjs",
      "src/auto-plan.mjs",
      "src/mac-runtime-switch.mjs",
      "src/workspace-setup.mjs",
      "tests/context-session.test.mjs",
      "tests/context-cache.test.mjs",
      "tests/session-plans.test.mjs",
      "tests/auto-plan.test.mjs",
      "tests/workflow-kit-source.test.mjs",
      "packages/workflow-kit/package.json",
      "packages/workflow-kit/src/lib/common.mjs",
      "package.json",
      "package-lock.json",
      ".harness/workflow.json",
      "scripts/check-installed-release.mjs",
      "packages/workflow-kit/src/install.mjs",
      "scripts/check-github-release.mjs"
    ],
    "documentation_paths": [
      "docs/planning/workflow-kit-context-refactor.md",
      "docs/planning/recovery-on-demand-research.md",
      "docs/DOCUMENTATION_INDEX.md",
      "docs/MODULES.md",
      "packages/workflow-kit/src/WORKFLOW.md",
      "packages/workflow-kit/src/templates/AGENTS.md",
      "packages/workflow-kit/src/templates/PROTOTYPE.md",
      "packages/workflow-kit/src/templates/SPEC.md",
      "packages/workflow-kit/src/templates/PLAN.md",
      "packages/workflow-kit/src/templates/CONTINUE.md",
      "packages/workflow-kit/src/templates/STAGES.md",
      "docs/PRODUCT.md",
      "docs/architecture/ARCHITECTURE.md",
      "docs/architecture/OVERVIEW.md",
      "packages/workflow-kit/docs/modules/workflow-kit-package.md",
      "README.md",
      "AGENTS.md",
      ".harness/kit/WORKFLOW.md"
    ]
  },
  "baseline_commit": "7bd5f4714fc3be0572dfa8a593804af3fab45d1f",
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
        "path": "docs/planning/workflow-kit-context-refactor.md",
        "required": true
      }
    ],
    "include_last_completed_task": false,
    "dependency_task_ids": []
  },
  "tasks": [
    {
      "id": "T001",
      "title": "Зафиксировать исследование и план рефакторинга Workflow Kit",
      "why": "Зафиксировать исследование и план рефакторинга Workflow Kit",
      "dependencies": [],
      "functional_paths": [],
      "documentation_paths": [
        "docs/planning/workflow-kit-context-refactor.md",
        "docs/planning/recovery-on-demand-research.md",
        "docs/DOCUMENTATION_INDEX.md",
        "docs/MODULES.md"
      ],
      "verification_ids": [],
      "verification_kind": "code",
      "acceptance_criteria": [
        "Согласованные правила, восстановление по плану/Git и порядок выпуск → миграция описаны без изменения продуктового кода.",
        "Составлен управляемый to-do; результаты исследования сохранены, ограничения старого Kit учтены."
      ],
      "expected_commit_message": "docs: спланировать рефакторинг документации и recovery",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "recovery-on-demand-research-20261006",
        "task_id": "T001",
        "role": "implementation"
      },
      "actual_files": [
        "docs/DOCUMENTATION_INDEX.md",
        "docs/MODULES.md",
        "docs/planning/recovery-on-demand-research.md",
        "docs/planning/workflow-kit-context-refactor.md"
      ]
    },
    {
      "id": "T002",
      "title": "Реализовать правила документации и этапов работы в Workflow Kit",
      "why": "Реализовать правила документации и этапов работы в Workflow Kit",
      "dependencies": [
        "T001"
      ],
      "functional_paths": [
        "packages/workflow-kit/src/lib/actions.mjs",
        "packages/workflow-kit/src/lib/plan.mjs",
        "packages/workflow-kit/src/lib/validate.mjs",
        "packages/workflow-kit/src/lib/git-hooks.mjs",
        "packages/workflow-kit/src/lib/transaction.mjs",
        "packages/workflow-kit/src/lib/simple-workflow.mjs",
        "packages/workflow-kit/src/lib/extend-plan.mjs",
        "packages/workflow-kit/scripts/check-runtime-fixture.mjs"
      ],
      "documentation_paths": [
        "docs/planning/workflow-kit-context-refactor.md",
        "packages/workflow-kit/src/WORKFLOW.md",
        "packages/workflow-kit/src/templates/AGENTS.md",
        "packages/workflow-kit/src/templates/PROTOTYPE.md",
        "packages/workflow-kit/src/templates/SPEC.md",
        "packages/workflow-kit/src/templates/PLAN.md",
        "packages/workflow-kit/src/templates/CONTINUE.md",
        "packages/workflow-kit/src/templates/STAGES.md"
      ],
      "verification_ids": [
        "kit-check"
      ],
      "verification_kind": "code",
      "acceptance_criteria": [
        "Обсуждение/исследование и отдельная спецификация не требуют фиктивного плана; управляемая запись документов без такого плана сохраняет проверки и авторство.",
        "Полная DOCS нужна перед явным релизом; между релизами не навязывается обновление всех документов. Временные спецификации удаляются без копии архива с Git-ссылкой.",
        "Проверены пределы документов и штатное добавление обычной фазы после завершённого delivery; DONE, транзакции и hooks сохранены. Перед реализацией сверены существующие и готовые решения."
      ],
      "expected_commit_message": "feat: упростить документы и этапы Workflow Kit",
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "recovery-on-demand-research-20261006",
        "task_id": "T002",
        "role": "implementation"
      }
    },
    {
      "id": "T003",
      "title": "Реализовать recovery из целых документов и связей с Git",
      "why": "Реализовать recovery из целых документов и связей с Git",
      "dependencies": [
        "T002"
      ],
      "functional_paths": [
        "packages/workflow-kit/src/lib/recovery.mjs",
        "packages/workflow-kit/src/lib/project-facts.mjs",
        "packages/workflow-kit/src/lib/plan.mjs",
        "packages/workflow-kit/src/lib/git.mjs",
        "packages/workflow-kit/src/lib/actions.mjs",
        "packages/workflow-kit/src/lib/command-help.mjs",
        "packages/workflow-kit/scripts/check-runtime-fixture.mjs",
        "tests/workflow-kit-recovery.test.mjs"
      ],
      "documentation_paths": [
        "docs/planning/workflow-kit-context-refactor.md"
      ],
      "verification_ids": [
        "kit-check"
      ],
      "verification_kind": "code",
      "acceptance_criteria": [
        "ACTIVE включает ядро, план, спецификацию и выбранные источники один раз; NONE — ядро и точные ссылки на предыдущий план/Git, без всей истории в пакете.",
        "Удалённая спецификация доступна по сохранённому SHA/пути; новый репозиторий, dirty/transaction, missing source, oversized и stale состояния проверены.",
        "Размеры выражены корректными единицами; нет скрытого усечения, повторов и лишних обязательных шаблонов. До миграции документы старого формата не теряются."
      ],
      "expected_commit_message": "feat: восстанавливать контекст по плану и Git",
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "recovery-on-demand-research-20261006",
        "task_id": "T003",
        "role": "implementation"
      }
    },
    {
      "id": "T004",
      "title": "Согласовать Web Pilot с новым Kit и подготовить проверки выпуска",
      "why": "Согласовать Web Pilot с новым Kit и подготовить проверки выпуска",
      "dependencies": [
        "T003"
      ],
      "functional_paths": [
        "src/context-session.mjs",
        "src/context-cache.mjs",
        "src/session-plans.mjs",
        "src/mcp-runtime.mjs",
        "src/auto-plan.mjs",
        "src/mac-runtime-switch.mjs",
        "src/workspace-setup.mjs",
        "tests/context-session.test.mjs",
        "tests/context-cache.test.mjs",
        "tests/session-plans.test.mjs",
        "tests/auto-plan.test.mjs",
        "tests/workflow-kit-source.test.mjs",
        "packages/workflow-kit/package.json",
        "packages/workflow-kit/src/lib/common.mjs",
        "package.json",
        "package-lock.json",
        ".harness/workflow.json"
      ],
      "documentation_paths": [
        "docs/planning/workflow-kit-context-refactor.md"
      ],
      "verification_ids": [
        "kit-check",
        "unit-all"
      ],
      "verification_kind": "code",
      "acceptance_criteria": [
        "Общий сценарий macOS/Windows: текстовый старт, допустимое вложение, чтение файла, свежесть кеша и отсутствие дублей; AutoPlan и Sidebar не регрессировали.",
        "Версии и проверки paired-release/release-installed/github-release актуализированы для нового выпуска, без старого evidence 0.6.96/1.5.6.",
        "Новый Kit проверен на fixture продолжения текущего старого плана; сборка и установка на этом шаге не выполнялись."
      ],
      "expected_commit_message": "feat: подключить новый recovery к Web Pilot",
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "recovery-on-demand-research-20261006",
        "task_id": "T004",
        "role": "implementation"
      }
    },
    {
      "id": "DOCS",
      "title": "Актуализация всех документов проекта",
      "why": "Подготовить документы нового Kit к выпуску; массовая миграция проекта выполняется после выпуска по прямому указанию пользователя.",
      "dependencies": [
        "T001",
        "T002",
        "T003",
        "T004"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/planning/workflow-kit-context-refactor.md",
        "docs/planning/recovery-on-demand-research.md",
        "docs/PRODUCT.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/DOCUMENTATION_INDEX.md",
        "docs/MODULES.md",
        "docs/architecture/OVERVIEW.md",
        "packages/workflow-kit/docs/modules/workflow-kit-package.md",
        "README.md",
        "packages/workflow-kit/src/WORKFLOW.md",
        "packages/workflow-kit/src/templates/AGENTS.md",
        "packages/workflow-kit/src/templates/PROTOTYPE.md",
        "packages/workflow-kit/src/templates/SPEC.md",
        "packages/workflow-kit/src/templates/PLAN.md",
        "packages/workflow-kit/src/templates/CONTINUE.md",
        "packages/workflow-kit/src/templates/STAGES.md",
        "AGENTS.md",
        ".harness/kit/WORKFLOW.md"
      ],
      "verification_ids": [],
      "acceptance_criteria": [
        "Проверены и актуализированы документы изменённого Kit и сведения о предстоящем выпуске; нет ложной приёмки Windows.",
        "Действующая общая документация проверена на противоречия выпуску; массовая перестройка файлов и удаление истории отложены до T008 согласно поручению пользователя."
      ],
      "expected_commit_message": "docs: подготовить выпуск нового Workflow Kit",
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "recovery-on-demand-research-20261006",
        "task_id": "DOCS",
        "role": "implementation"
      }
    },
    {
      "id": "T005",
      "title": "Собрать парный выпуск Web Pilot с новым Workflow Kit",
      "why": "Собрать парный выпуск Web Pilot с новым Workflow Kit",
      "dependencies": [
        "T004",
        "DOCS"
      ],
      "functional_paths": [
        "package.json",
        "package-lock.json",
        "packages/workflow-kit/package.json",
        "packages/workflow-kit/src/lib/common.mjs"
      ],
      "documentation_paths": [
        "docs/planning/workflow-kit-context-refactor.md"
      ],
      "verification_ids": [
        "paired-release"
      ],
      "verification_kind": "package",
      "acceptance_criteria": [
        "После DOCS собраны macOS arm64 и Windows x64 с одним новым Kit; состав/версии/хеши пакетов проверены.",
        "Сборка выполняется один раз назначенной проверкой; нативная Windows и живая сессия не объявлены проверенными."
      ],
      "expected_commit_message": "release: собрать Web Pilot с новым Workflow Kit",
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "recovery-on-demand-research-20261006",
        "task_id": "T005",
        "role": "implementation"
      }
    },
    {
      "id": "T006",
      "title": "Установить выпуск и активировать новый Kit для проекта",
      "why": "Установить выпуск и активировать новый Kit для проекта",
      "dependencies": [
        "T005",
        "DOCS"
      ],
      "functional_paths": [
        "scripts/check-installed-release.mjs",
        "packages/workflow-kit/src/install.mjs",
        ".harness/workflow.json"
      ],
      "documentation_paths": [
        "docs/planning/workflow-kit-context-refactor.md",
        "AGENTS.md",
        ".harness/kit/WORKFLOW.md"
      ],
      "verification_ids": [
        "release-installed"
      ],
      "verification_kind": "installed",
      "acceptance_criteria": [
        "Проверены установленные macOS-копии, identity и подпись; установленный runtime Kit обновлён штатно из проверенного пакета.",
        "Текущий план, DONE и Git-ссылки сохранены; до миграции новый runtime умеет читать текущий состав документов. Нативная Windows остаётся пользовательской проверкой."
      ],
      "expected_commit_message": "release: установить новый Workflow Kit и Web Pilot",
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "recovery-on-demand-research-20261006",
        "task_id": "T006",
        "role": "implementation"
      }
    },
    {
      "id": "T007",
      "title": "Опубликовать выпуск и подготовить последующую миграцию документов",
      "why": "Опубликовать выпуск и подготовить последующую миграцию документов",
      "dependencies": [
        "T006",
        "DOCS"
      ],
      "functional_paths": [
        "scripts/check-github-release.mjs"
      ],
      "documentation_paths": [
        "docs/planning/workflow-kit-context-refactor.md"
      ],
      "verification_ids": [
        "github-release"
      ],
      "verification_kind": "package",
      "acceptance_criteria": [
        "GitHub source/tag/артефакты нового парного выпуска сверены без пересборки.",
        "После подтверждения выпуска новым Kit управляемо добавить T008 (миграция документов) и T009 (проверка recovery) из спецификации; существующие задачи и DONE не переписаны.",
        "До T008 старые документы массово не ревизовались; готовность перехода не объявляется до T009."
      ],
      "expected_commit_message": "release: опубликовать новый Kit и открыть фазу миграции",
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "recovery-on-demand-research-20261006",
        "task_id": "T007",
        "role": "implementation"
      }
    }
  ],
  "blocked_reason": null,
  "user_decisions": [
    {
      "id": "6c1ab6f7-f03c-4011-8067-1130111a5ad8",
      "text": "Прямое поручение пользователя 06.10.2026: закрыть текущий план и открыть новый короткий исследовательский план. Реализация и delivery не входят в scope.",
      "recorded_at": "2026-10-06T10:12:00.271Z"
    },
    {
      "id": "workflow-kit-refactor-20261006",
      "text": "06.10.2026 пользователь согласовал минимальные документы без накопления истории, обновление перед релизом, восстановление агентом по спецификации/плану/коммитам/диффам и детерминированный recovery целых документов. Сначала новые инструкции и выпуск Kit, затем миграция документации. Поручено составить спецификацию и to-do: прежнее исследовательское ограничение расширено для планирования этих этапов; текущий ответ не выполняет реализацию/сборку/публикацию.",
      "recorded_at": "2026-10-06T14:12:48Z"
    }
  ]
}
```
<!-- workflow-state:end -->

## Состояние

Execution Scope Status: ACTIVE
Delivery Status: IN_PROGRESS
Scope: recovery-on-demand-research-20261006
Current Task: нет
Revision: 1357

## Цель

Рефакторинг Workflow Kit: минимальная документация, восстановление по плану и Git, recovery из целых выбранных документов; сначала новый выпуск, затем согласованная миграция проекта.

## Критерии приёмки

- Правила, шаблоны и проверки реализуют согласованный жизненный цикл документации и Git-восстановления.
- Recovery и Web Pilot одинаково работают на macOS/Windows по контракту, передают нужные целые документы без дублей и скрытого усечения.
- Новый Kit выпущен до миграции документации; T008/T009 добавлены новым Kit и переход завершён только после проверки согласованности.

## Микрозадачи

- [DONE] T001: Зафиксировать исследование и план рефакторинга Workflow Kit — Завершено
  - Git Commit: [DONE] docs: спланировать рефакторинг документации и recovery
  - Reference: recovery-on-demand-research-20261006 / T001 / implementation
  - Файлы: docs/planning/workflow-kit-context-refactor.md, docs/planning/recovery-on-demand-research.md, docs/DOCUMENTATION_INDEX.md, docs/MODULES.md
- [TODO] T002: Реализовать правила документации и этапов работы в Workflow Kit — Ожидает
  - Git Commit: [PENDING] feat: упростить документы и этапы Workflow Kit
  - Reference: recovery-on-demand-research-20261006 / T002 / implementation
  - Файлы: packages/workflow-kit/src/lib/actions.mjs, packages/workflow-kit/src/lib/plan.mjs, packages/workflow-kit/src/lib/validate.mjs, packages/workflow-kit/src/lib/git-hooks.mjs, packages/workflow-kit/src/lib/transaction.mjs, packages/workflow-kit/src/lib/simple-workflow.mjs, packages/workflow-kit/src/lib/extend-plan.mjs, packages/workflow-kit/scripts/check-runtime-fixture.mjs, docs/planning/workflow-kit-context-refactor.md, packages/workflow-kit/src/WORKFLOW.md, packages/workflow-kit/src/templates/AGENTS.md, packages/workflow-kit/src/templates/PROTOTYPE.md, packages/workflow-kit/src/templates/SPEC.md, packages/workflow-kit/src/templates/PLAN.md, packages/workflow-kit/src/templates/CONTINUE.md, packages/workflow-kit/src/templates/STAGES.md
- [TODO] T003: Реализовать recovery из целых документов и связей с Git — Ожидает
  - Git Commit: [PENDING] feat: восстанавливать контекст по плану и Git
  - Reference: recovery-on-demand-research-20261006 / T003 / implementation
  - Файлы: packages/workflow-kit/src/lib/recovery.mjs, packages/workflow-kit/src/lib/project-facts.mjs, packages/workflow-kit/src/lib/plan.mjs, packages/workflow-kit/src/lib/git.mjs, packages/workflow-kit/src/lib/actions.mjs, packages/workflow-kit/src/lib/command-help.mjs, packages/workflow-kit/scripts/check-runtime-fixture.mjs, tests/workflow-kit-recovery.test.mjs, docs/planning/workflow-kit-context-refactor.md
- [TODO] T004: Согласовать Web Pilot с новым Kit и подготовить проверки выпуска — Ожидает
  - Git Commit: [PENDING] feat: подключить новый recovery к Web Pilot
  - Reference: recovery-on-demand-research-20261006 / T004 / implementation
  - Файлы: src/context-session.mjs, src/context-cache.mjs, src/session-plans.mjs, src/mcp-runtime.mjs, src/auto-plan.mjs, src/mac-runtime-switch.mjs, src/workspace-setup.mjs, tests/context-session.test.mjs, tests/context-cache.test.mjs, tests/session-plans.test.mjs, tests/auto-plan.test.mjs, tests/workflow-kit-source.test.mjs, packages/workflow-kit/package.json, packages/workflow-kit/src/lib/common.mjs, package.json, package-lock.json, .harness/workflow.json, docs/planning/workflow-kit-context-refactor.md
- [TODO] DOCS: Актуализация всех документов проекта — Ожидает
  - Git Commit: [PENDING] docs: подготовить выпуск нового Workflow Kit
  - Reference: recovery-on-demand-research-20261006 / DOCS / implementation
  - Файлы: docs/planning/workflow-kit-context-refactor.md, docs/planning/recovery-on-demand-research.md, docs/PRODUCT.md, docs/architecture/ARCHITECTURE.md, docs/DOCUMENTATION_INDEX.md, docs/MODULES.md, docs/architecture/OVERVIEW.md, packages/workflow-kit/docs/modules/workflow-kit-package.md, README.md, packages/workflow-kit/src/WORKFLOW.md, packages/workflow-kit/src/templates/AGENTS.md, packages/workflow-kit/src/templates/PROTOTYPE.md, packages/workflow-kit/src/templates/SPEC.md, packages/workflow-kit/src/templates/PLAN.md, packages/workflow-kit/src/templates/CONTINUE.md, packages/workflow-kit/src/templates/STAGES.md, AGENTS.md, .harness/kit/WORKFLOW.md
- [TODO] T005: Собрать парный выпуск Web Pilot с новым Workflow Kit — Ожидает
  - Git Commit: [PENDING] release: собрать Web Pilot с новым Workflow Kit
  - Reference: recovery-on-demand-research-20261006 / T005 / implementation
  - Файлы: package.json, package-lock.json, packages/workflow-kit/package.json, packages/workflow-kit/src/lib/common.mjs, docs/planning/workflow-kit-context-refactor.md
- [TODO] T006: Установить выпуск и активировать новый Kit для проекта — Ожидает
  - Git Commit: [PENDING] release: установить новый Workflow Kit и Web Pilot
  - Reference: recovery-on-demand-research-20261006 / T006 / implementation
  - Файлы: scripts/check-installed-release.mjs, packages/workflow-kit/src/install.mjs, .harness/workflow.json, docs/planning/workflow-kit-context-refactor.md, AGENTS.md, .harness/kit/WORKFLOW.md
- [TODO] T007: Опубликовать выпуск и подготовить последующую миграцию документов — Ожидает
  - Git Commit: [PENDING] release: опубликовать новый Kit и открыть фазу миграции
  - Reference: recovery-on-demand-research-20261006 / T007 / implementation
  - Файлы: scripts/check-github-release.mjs, docs/planning/workflow-kit-context-refactor.md

## Context Pack For This Cycle

- docs/architecture/OVERVIEW.md → Краткая архитектура проекта
- docs/MODULES.md → Модули проекта
- docs/DOCUMENTATION_INDEX.md → Каталог документации
- docs/planning/workflow-kit-context-refactor.md

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
