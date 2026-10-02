# Активный план — Project Web Pilot

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 928,
  "project_id": "cf944136-d1fc-4bd5-9ea0-e46d1fe230e7",
  "project_name": "Project Web Pilot",
  "scope_id": "auto-plan-client-driven-refactor-20261002",
  "execution_scope_status": "ACTIVE",
  "delivery_status": "IN_PROGRESS",
  "objective": "Перевести автопродолжение полностью под управление клиента: переключатель не отправляет агенту инструкций, Web Pilot событийно отправляет только одно точное «Продолжай» на каждую подходящую паузу незавершённого Workflow Kit plan.",
  "acceptance_criteria": [
    "Перевести автопродолжение полностью под управление клиента: переключатель не отправляет агенту инструкций, Web Pilot событийно отправляет только одно точное «Продолжай» на каждую подходящую паузу незавершённого Workflow Kit plan."
  ],
  "approved_scope": {
    "functional_paths": [
      "src/auto-plan.mjs",
      "src/chatgpt-page-observer.mjs",
      "src/page-state.mjs",
      "src/context-session.mjs",
      "src/chromium-diagnostics.mjs",
      "tests/auto-plan.test.mjs",
      "tests/page-state.test.mjs",
      "tests/context-session.test.mjs",
      "src/auto-plan-state.mjs",
      "src/main.mjs",
      "src/plan-monitor.mjs",
      "tests/plan-monitor.test.mjs",
      "src/ui/sidebar.mjs",
      "tests/auto-plan-restart-fixture.cjs",
      "tests/electron-smoke.mjs",
      "package.json",
      "package-lock.json",
      ".harness/workflow.json",
      "scripts/check-installed-release.mjs",
      "tests/installed-observer-fixture.cjs"
    ],
    "documentation_paths": [
      "docs/planning/auto-plan-client-driven-refactor.md",
      "docs/VERIFICATION.md",
      "docs/RELEASE.md",
      "docs/PRODUCT.md",
      "docs/architecture/ARCHITECTURE.md",
      "docs/architecture/OVERVIEW.md",
      "docs/MODULES.md",
      "docs/DOCUMENTATION_INDEX.md"
    ]
  },
  "baseline_commit": "2ca651faad912501f58e3733c377e4c4dcd0e654",
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
        "path": "docs/planning/auto-plan-client-driven-refactor.md",
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
        "scope_id": "auto-plan-client-driven-refactor-20261002",
        "task_id": "T001",
        "role": "implementation"
      },
      "dependencies": [],
      "functional_paths": [
        "src/auto-plan.mjs",
        "src/chatgpt-page-observer.mjs",
        "src/page-state.mjs",
        "src/context-session.mjs",
        "src/chromium-diagnostics.mjs",
        "tests/auto-plan.test.mjs",
        "tests/page-state.test.mjs",
        "tests/context-session.test.mjs"
      ],
      "documentation_paths": [
        "docs/planning/auto-plan-client-driven-refactor.md"
      ],
      "verification_ids": [
        "node24",
        "unit"
      ],
      "id": "T001",
      "title": "Убрать управляющий протокол агента из AutoPlan",
      "why": "AutoPlan 0.6.76 зависит от стартовой инструкции и footer-сигналов агента, из-за чего клиент ошибочно отдаёт агенту управление автопродолжением.",
      "verification_kind": "code",
      "acceptance_criteria": [
        "В production AutoPlan отсутствует AUTO_PLAN_INSTRUCTION и включение переключателя не отправляет агенту специальный стартовый текст.",
        "AutoPlan не принимает решений по строкам «Готов продолжать.», «Нужен ваш ответ.» или «План завершён.»; устаревший turnSignal/footer parser удалён, если он больше нигде не нужен.",
        "Обычный startup contract Web Pilot независимо от AutoPlan закрепляет цикл: одна микрозадача за ответ, task:start, проверка, commit --task, короткий отчёт и конец ответа.",
        "Unit tests подтверждают отсутствие агентского управляющего протокола и сохранение обычной доставки recovery."
      ],
      "expected_commit_message": "refactor: убрать агентский протокол AutoPlan",
      "actual_files": [
        "docs/planning/auto-plan-client-driven-refactor.md",
        "src/auto-plan.mjs",
        "src/chatgpt-page-observer.mjs",
        "src/chromium-diagnostics.mjs",
        "src/context-session.mjs",
        "src/page-state.mjs",
        "tests/auto-plan.test.mjs",
        "tests/context-session.test.mjs",
        "tests/page-state.test.mjs"
      ]
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "auto-plan-client-driven-refactor-20261002",
        "task_id": "T002",
        "role": "implementation"
      },
      "dependencies": [
        "T001"
      ],
      "functional_paths": [
        "src/auto-plan.mjs",
        "src/auto-plan-state.mjs",
        "src/main.mjs",
        "src/plan-monitor.mjs",
        "tests/auto-plan.test.mjs",
        "tests/plan-monitor.test.mjs"
      ],
      "documentation_paths": [
        "docs/planning/auto-plan-client-driven-refactor.md"
      ],
      "verification_ids": [
        "node24",
        "unit"
      ],
      "id": "T002",
      "title": "Перевести AutoPlan на событийный reconcile пауз",
      "why": "Решение об автоматическом продолжении должно определяться только переключателем, состоянием страницы и подтверждённым current plan.",
      "verification_kind": "code",
      "acceptance_criteria": [
        "AutoPlan reconcile событийно вызывается от toggle, PageStateSource, selection/reload и semantic change PlanMonitor; новый Git polling не добавлен.",
        "При ON + idle + готовой странице + подтверждённом ACTIVE unfinished plan отправляется ровно одно точное «Продолжай».",
        "При ON + busy Web Pilot только ждёт; после первой подходящей паузы отправляет одно «Продолжай».",
        "Если AutoPlan уже ON, а plan меняется NONE/неподтверждённый → ACTIVE unfinished, текущий busy-turn не прерывается, а после его окончания отправляется одно «Продолжай».",
        "Завершённый plan, OFF, неподходящий разговор или временно неготовая страница не вызывают Send."
      ],
      "expected_commit_message": "refactor: сделать AutoPlan клиентским reconciler",
      "actual_files": [
        "docs/planning/auto-plan-client-driven-refactor.md",
        "src/auto-plan-state.mjs",
        "src/auto-plan.mjs",
        "src/main.mjs",
        "tests/auto-plan.test.mjs"
      ]
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "auto-plan-client-driven-refactor-20261002",
        "task_id": "T003",
        "role": "implementation"
      },
      "dependencies": [
        "T002"
      ],
      "functional_paths": [
        "src/auto-plan.mjs",
        "src/main.mjs",
        "src/chatgpt-page-observer.mjs",
        "src/page-state.mjs",
        "src/ui/sidebar.mjs",
        "tests/auto-plan.test.mjs",
        "tests/auto-plan-restart-fixture.cjs",
        "tests/page-state.test.mjs"
      ],
      "documentation_paths": [
        "docs/planning/auto-plan-client-driven-refactor.md"
      ],
      "verification_ids": [
        "node24",
        "unit"
      ],
      "id": "T003",
      "title": "Закрепить переключатель, dedupe и приоритет пользователя",
      "why": "AutoPlan должен быть включаемым в любое время, не дублировать Send и автоматически восстанавливаться после технических ожиданий.",
      "verification_kind": "code",
      "acceptance_criteria": [
        "OFF→ON можно выполнить в любой момент: во время busy Send не происходит до паузы; во время уже существующей подходящей паузы отправляется одно «Продолжай».",
        "ON→OFF запрещает будущие автоматические Send; повторное ON на существующей паузе снова даёт не более одного Send для новой разрешённой попытки.",
        "Одна pause identity не может породить два автоматических «Продолжай» при повторных DOM/PlanMonitor events, reload или restart.",
        "Checkpoint хранит только судьбу автоматического «Продолжай» для pause identity и не зависит от текста ответа агента.",
        "Draft не стирается; ручная отправка пользователя потребляет текущую паузу и Web Pilot ждёт её ответ без соседнего автоматического «Продолжай».",
        "Page reload, plan transaction, connection error и временная неготовность являются автоматически пересматриваемыми ожиданиями, а не липкой паузой, требующей передёрнуть переключатель.",
        "UI и diagnostics описывают только клиентские причины состояния; AGENT_WAIT и NO_CHECKPOINT как текстовый протокол удалены."
      ],
      "expected_commit_message": "fix: сделать автопродолжение устойчивым и идемпотентным",
      "actual_files": [
        "docs/planning/auto-plan-client-driven-refactor.md",
        "src/auto-plan.mjs",
        "src/chatgpt-page-observer.mjs",
        "src/page-state.mjs",
        "src/ui/sidebar.mjs",
        "tests/auto-plan-restart-fixture.cjs",
        "tests/auto-plan.test.mjs",
        "tests/page-state.test.mjs"
      ]
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "auto-plan-client-driven-refactor-20261002",
        "task_id": "T004",
        "role": "implementation"
      },
      "dependencies": [
        "T003"
      ],
      "functional_paths": [
        "tests/electron-smoke.mjs",
        "tests/auto-plan.test.mjs",
        "tests/page-state.test.mjs",
        "tests/auto-plan-restart-fixture.cjs",
        "src/chatgpt-page-observer.mjs",
        "tests/installed-observer-fixture.cjs"
      ],
      "documentation_paths": [
        "docs/planning/auto-plan-client-driven-refactor.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "node24",
        "unit",
        "smoke"
      ],
      "id": "T004",
      "title": "Воспроизвести 01TestAuto и все границы в Electron smoke",
      "why": "Предыдущий release-gate не содержал реального сценария: persisted ON, новая сессия без plan, создание plan обычным ответом и автоматическое продолжение без footer.",
      "verification_kind": "code",
      "acceptance_criteria": [
        "Electron fixture точно воспроизводит 01TestAuto: persisted ON, новый Chat с NONE, обычный ответ создаёт ACTIVE plan без footer, после idle автоматически отправляется одно «Продолжай».",
        "После следующей микрозадачи/commit обычный отчёт без footer приводит к следующему одному «Продолжай».",
        "Проверены включение во время busy и во время существующей паузы, выключение во время busy, повторное включение, completed plan, manual send, draft, connection recovery и selection/reload.",
        "Параллельные PlanMonitor и page events не создают duplicate Send; unknown исход Send не повторяется вслепую.",
        "Production code и regression suite больше не требуют специальных footer-строк агента."
      ],
      "expected_commit_message": "test: закрепить клиентское автопродолжение",
      "actual_files": [
        "docs/VERIFICATION.md",
        "docs/planning/auto-plan-client-driven-refactor.md",
        "src/chatgpt-page-observer.mjs",
        "tests/auto-plan-restart-fixture.cjs",
        "tests/electron-smoke.mjs",
        "tests/installed-observer-fixture.cjs",
        "tests/page-state.test.mjs"
      ]
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "auto-plan-client-driven-refactor-20261002",
        "task_id": "T005",
        "role": "implementation"
      },
      "dependencies": [
        "T004"
      ],
      "functional_paths": [
        "package.json",
        "package-lock.json",
        ".harness/workflow.json",
        "scripts/check-installed-release.mjs"
      ],
      "documentation_paths": [
        "docs/planning/auto-plan-client-driven-refactor.md",
        "docs/RELEASE.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "node24",
        "unit",
        "smoke",
        "auto-plan-package"
      ],
      "id": "T005",
      "title": "Подготовить локальную поставку следующей версии для приёмки",
      "why": "Исправление должно проверяться пользователем в реальном Project Web Pilot, а не только fixture-тестами.",
      "verification_kind": "package",
      "acceptance_criteria": [
        "Версия Project Web Pilot повышена относительно 0.6.76 и собрана штатным npm run build для macOS arm64 и Windows x64.",
        "Перед package commit настроена актуальная package/installed verification в Workflow Kit через config:apply; evidence указывает фактическую новую версию и артефакты.",
        "Корневой app и /Applications обновлены штатным путём с сохранением Finder identity; оба ZIP и release metadata сверены с исходниками.",
        "В установленной macOS версии fixture подтверждает новую клиентскую AutoPlan state machine без footer-протокола.",
        "GitHub Release не публикуется без отдельного поручения пользователя."
      ],
      "expected_commit_message": "build: подготовить клиентский AutoPlan к приёмке",
      "actual_files": [
        "package.json",
        "package-lock.json",
        "scripts/check-installed-release.mjs",
        "docs/planning/auto-plan-client-driven-refactor.md",
        "docs/RELEASE.md",
        "docs/VERIFICATION.md"
      ]
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "auto-plan-client-driven-refactor-20261002",
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
        "docs/planning/auto-plan-client-driven-refactor.md",
        "docs/PRODUCT.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md",
        "docs/RELEASE.md",
        "docs/architecture/OVERVIEW.md",
        "docs/MODULES.md",
        "docs/DOCUMENTATION_INDEX.md"
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
      "id": "038b7bd5-a96d-4777-b8f9-5bb1c77dc7b9",
      "text": "Пользователь поручил выполнить описанную задачу и план.",
      "recorded_at": "2026-10-02T16:59:32.178Z"
    }
  ]
}
```
<!-- workflow-state:end -->

## Состояние

Execution Scope Status: ACTIVE
Delivery Status: IN_PROGRESS
Scope: auto-plan-client-driven-refactor-20261002
Current Task: нет
Revision: 928

## Цель

Перевести автопродолжение полностью под управление клиента: переключатель не отправляет агенту инструкций, Web Pilot событийно отправляет только одно точное «Продолжай» на каждую подходящую паузу незавершённого Workflow Kit plan.

## Критерии приёмки

- Перевести автопродолжение полностью под управление клиента: переключатель не отправляет агенту инструкций, Web Pilot событийно отправляет только одно точное «Продолжай» на каждую подходящую паузу незавершённого Workflow Kit plan.

## Микрозадачи

- [DONE] T001: Убрать управляющий протокол агента из AutoPlan — Завершено
  - Git Commit: [DONE] refactor: убрать агентский протокол AutoPlan
  - Reference: auto-plan-client-driven-refactor-20261002 / T001 / implementation
  - Файлы: src/auto-plan.mjs, src/chatgpt-page-observer.mjs, src/page-state.mjs, src/context-session.mjs, src/chromium-diagnostics.mjs, tests/auto-plan.test.mjs, tests/page-state.test.mjs, tests/context-session.test.mjs, docs/planning/auto-plan-client-driven-refactor.md
- [DONE] T002: Перевести AutoPlan на событийный reconcile пауз — Завершено
  - Git Commit: [DONE] refactor: сделать AutoPlan клиентским reconciler
  - Reference: auto-plan-client-driven-refactor-20261002 / T002 / implementation
  - Файлы: src/auto-plan.mjs, src/auto-plan-state.mjs, src/main.mjs, src/plan-monitor.mjs, tests/auto-plan.test.mjs, tests/plan-monitor.test.mjs, docs/planning/auto-plan-client-driven-refactor.md
- [DONE] T003: Закрепить переключатель, dedupe и приоритет пользователя — Завершено
  - Git Commit: [DONE] fix: сделать автопродолжение устойчивым и идемпотентным
  - Reference: auto-plan-client-driven-refactor-20261002 / T003 / implementation
  - Файлы: src/auto-plan.mjs, src/main.mjs, src/chatgpt-page-observer.mjs, src/page-state.mjs, src/ui/sidebar.mjs, tests/auto-plan.test.mjs, tests/auto-plan-restart-fixture.cjs, tests/page-state.test.mjs, docs/planning/auto-plan-client-driven-refactor.md
- [DONE] T004: Воспроизвести 01TestAuto и все границы в Electron smoke — Завершено
  - Git Commit: [DONE] test: закрепить клиентское автопродолжение
  - Reference: auto-plan-client-driven-refactor-20261002 / T004 / implementation
  - Файлы: tests/electron-smoke.mjs, tests/auto-plan.test.mjs, tests/page-state.test.mjs, tests/auto-plan-restart-fixture.cjs, src/chatgpt-page-observer.mjs, tests/installed-observer-fixture.cjs, docs/planning/auto-plan-client-driven-refactor.md, docs/VERIFICATION.md
- [DONE] T005: Подготовить локальную поставку следующей версии для приёмки — Завершено
  - Git Commit: [DONE] build: подготовить клиентский AutoPlan к приёмке
  - Reference: auto-plan-client-driven-refactor-20261002 / T005 / implementation
  - Файлы: package.json, package-lock.json, .harness/workflow.json, scripts/check-installed-release.mjs, docs/planning/auto-plan-client-driven-refactor.md, docs/RELEASE.md, docs/VERIFICATION.md
- [TODO] DOCS: Актуализация всех документов проекта — Ожидает
  - Git Commit: [PENDING] docs: актуализировать контекст проекта
  - Reference: auto-plan-client-driven-refactor-20261002 / DOCS / implementation
  - Файлы: docs/planning/auto-plan-client-driven-refactor.md, docs/PRODUCT.md, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md, docs/RELEASE.md, docs/architecture/OVERVIEW.md, docs/MODULES.md, docs/DOCUMENTATION_INDEX.md

## Context Pack For This Cycle

- docs/architecture/OVERVIEW.md → Краткая архитектура проекта
- docs/MODULES.md → Модули проекта
- docs/DOCUMENTATION_INDEX.md → Каталог документации
- docs/planning/auto-plan-client-driven-refactor.md

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
