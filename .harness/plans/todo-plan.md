# Активный план — Project Web Pilot

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 1717,
  "project_id": "cf944136-d1fc-4bd5-9ea0-e46d1fe230e7",
  "project_name": "Project Web Pilot",
  "scope_id": "parallel-final-stage-recovery-20261010",
  "execution_scope_status": "ACTIVE",
  "delivery_status": "IN_PROGRESS",
  "objective": "Устранить тупик последнего READY при активном writer и сброс предварительного AutoPlan ON; завершить безопасный финальный цикл и покрыть его адресной регрессией.",
  "acceptance_criteria": [
    "F03: готовый source и активный writer не ведут к unsafe merge или немой блокировке; диагностика отправлена безопасно, после законного устранения причины цикл завершается один раз.",
    "F01/F02 подтверждены сквозными реальными Git/Kit и sandbox проверками, F04-F20/A01-A06 покрыты адресными unit/Git/Electron проверками либо явно обозначенными оставшимися границами.",
    "A01-A06: предварительный ON не сбрасывается при двух чатах и stale/read error, первый scope наследует разрешение, последующий начинает OFF.",
    "Одна очередь и один владелец main, повторных Send при UNKNOWN нет, живые серверы пользователя не останавливаются автоматически.",
    "DOCS обновлена перед одной парной сборкой, установкой и GitHub release; пользовательская приёмка и native Windows не объявлены выполненными по fixture."
  ],
  "approved_scope": {
    "functional_paths": [
      "src/command-activity.mjs",
      "src/parallel-kit.mjs",
      "src/main.mjs",
      "src/project-input-watch.mjs",
      "src/parallel-execution.mjs",
      "src/execution-projection.mjs",
      "src/automation-send-state.mjs",
      "src/project-auto-plan.mjs",
      "src/project-session-auto-plan.mjs",
      "src/auto-plan.mjs",
      "src/ui/sidebar.mjs",
      "src/ui/index.html",
      "tools/codex-app-server-mcp/server.py",
      "tools/codex-app-server-mcp/app_server_client.py",
      "tests/parallel-finalization.test.mjs",
      "tests/parallel-execution-smoke-fixture.cjs",
      "tests/command-activity.test.mjs",
      "tests/codex-app-server-mcp.test.mjs",
      "tests/parallel-execution-recovery.test.mjs",
      "tests/parallel-execution.test.mjs",
      "tests/automation-send-state.test.mjs",
      "tests/project-auto-plan.test.mjs",
      "tests/auto-plan.test.mjs",
      "tests/parallel-execution-ui.test.mjs",
      "tests/electron-smoke.mjs",
      "release-manifest.json",
      "package.json",
      "package-lock.json",
      "tests/sidebar.test.mjs"
    ],
    "documentation_paths": [
      "docs/planning/final-stage-recovery-spec.md",
      "docs/planning/final-stage-recovery-todo-draft.md",
      "README.md",
      "docs/architecture/OVERVIEW.md",
      "docs/modules/parallel-execution.md",
      "docs/modules/parallel-execution-acceptance.md",
      "docs/modules/auto-plan.md",
      "docs/modules/auto-plan-send.md",
      "docs/modules/command-activity.md",
      "docs/modules/codex-app-server-executor.md",
      "docs/modules/workspace-sidebar-ui.md",
      "docs/modules/release.md"
    ]
  },
  "baseline_commit": "8cd7dd464a4056c86a982d3bd8840bc07f9df9c6",
  "current_task_id": null,
  "context_pack": {
    "documents": [
      {
        "path": "docs/architecture/OVERVIEW.md",
        "required": true,
        "revision": "WORKTREE"
      },
      {
        "path": "docs/planning/final-stage-recovery-spec.md",
        "required": true,
        "revision": "WORKTREE"
      },
      {
        "path": "docs/planning/final-stage-recovery-todo-draft.md",
        "required": true,
        "revision": "WORKTREE"
      },
      {
        "path": "docs/modules/parallel-execution.md",
        "required": false,
        "revision": "WORKTREE"
      },
      {
        "path": "docs/modules/command-activity.md",
        "required": false,
        "revision": "WORKTREE"
      },
      {
        "path": "docs/modules/auto-plan.md",
        "required": false,
        "revision": "WORKTREE"
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
        "scope_id": "parallel-final-stage-recovery-20261010",
        "task_id": "T001",
        "role": "implementation"
      },
      "dependencies": [],
      "functional_paths": [
        "tests/parallel-finalization.test.mjs",
        "tests/parallel-execution-smoke-fixture.cjs"
      ],
      "documentation_paths": [],
      "verification_ids": [
        "unit-all",
        "electron-smoke"
      ],
      "id": "T001",
      "title": "Воспроизвести последний READY и writer после source",
      "why": "Получить независимый красный F03 и минимальный Git/Kit сценарий без пользовательского тестового проекта.",
      "acceptance_criteria": [
        "После source commit стартует writer; характеризующий зелёный тест текущей логики доказывает blocker, Send=0, merge=0. Старый ожидаемый красный F03 документирован, T003 инвертирует критерий.",
        "Границы READY/DONE/Send и cleanup проверены реальными Git/Kit-операциями; пользовательские процессы не изменены, обязательные suite проходят."
      ],
      "expected_commit_message": "test: воспроизвести блокировку последнего READY",
      "parallel_safe": false,
      "actual_files": [
        "tests/parallel-execution-smoke-fixture.cjs",
        "tests/parallel-finalization.test.mjs"
      ]
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "parallel-final-stage-recovery-20261010",
        "task_id": "T002",
        "role": "implementation"
      },
      "dependencies": [
        "T001"
      ],
      "functional_paths": [
        "src/command-activity.mjs",
        "src/parallel-kit.mjs",
        "src/main.mjs",
        "src/project-input-watch.mjs",
        "tools/codex-app-server-mcp/server.py",
        "tools/codex-app-server-mcp/app_server_client.py",
        "tests/command-activity.test.mjs",
        "tests/codex-app-server-mcp.test.mjs",
        "tests/parallel-execution-recovery.test.mjs"
      ],
      "documentation_paths": [],
      "verification_ids": [
        "unit-all",
        "executor-channel",
        "project-lifecycle"
      ],
      "id": "T002",
      "title": "Сохранить ограничения команд и доставить child completion",
      "why": "Writer и readOnly различаются фактическим sandbox, а completion должен будить основной reconcile.",
      "acceptance_criteria": [
        "F02/F04/F05/F06: live readOnly preview, write denial, completion без write_stdin, доступность child события; writer blocked, UNKNOWN не завершён фиктивно.",
        "Сохранено действующее исключение удаления acknowledged_unknown после доказанной предыдущей загрузки ОС; при сдвиге часов, отсутствии надёжной boot-границы и живом сервере удаление запрещено с объяснением."
      ],
      "expected_commit_message": "fix: уточнить lifecycle команд и child события",
      "parallel_safe": false,
      "actual_files": [
        "src/command-activity.mjs",
        "src/main.mjs",
        "src/project-input-watch.mjs",
        "tests/codex-app-server-mcp.test.mjs",
        "tests/command-activity.test.mjs",
        "tests/parallel-execution-recovery.test.mjs",
        "tools/codex-app-server-mcp/server.py"
      ]
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "parallel-final-stage-recovery-20261010",
        "task_id": "T003",
        "role": "implementation"
      },
      "dependencies": [
        "T002"
      ],
      "functional_paths": [
        "src/parallel-execution.mjs",
        "src/parallel-kit.mjs",
        "src/execution-projection.mjs",
        "src/main.mjs",
        "src/automation-send-state.mjs",
        "tests/parallel-finalization.test.mjs",
        "tests/parallel-execution-recovery.test.mjs",
        "tests/parallel-execution.test.mjs",
        "tests/parallel-execution-smoke-fixture.cjs"
      ],
      "documentation_paths": [],
      "verification_ids": [
        "unit-all",
        "electron-smoke"
      ],
      "id": "T003",
      "title": "Диагностировать блокированный source без unsafe merge",
      "why": "Снять тупик F03 без снятия безопасности и второго планировщика.",
      "acceptance_criteria": [
        "SourceReady, MergeSafe и DiagnosticEligible различены; F03 даёт диагностическую передачу origin при сохранённом запрете merge.",
        "После diagnostic очередь одна владеет main, основной агент лишь читает и сообщает причину. Terminal event разрешён только при самозавершении команды, пользовательской остановке через её собственный executor или ручной остановке с подтверждением App Server; утрата доказательств переводит в UNKNOWN с адресной процедурой.",
        "Тест diagnostic→read-only ответ main→terminal event→один merge→один final; до отдельного final Send основной агент не пишет main; F07-F10/F16 без двойной записи и ложного DONE."
      ],
      "expected_commit_message": "fix: передавать диагностический blocker основному агенту",
      "parallel_safe": false,
      "actual_files": [
        "src/main.mjs",
        "src/parallel-execution.mjs",
        "tests/parallel-execution-recovery.test.mjs",
        "tests/parallel-execution-smoke-fixture.cjs",
        "tests/parallel-finalization.test.mjs"
      ]
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "parallel-final-stage-recovery-20261010",
        "task_id": "T004",
        "role": "implementation"
      },
      "dependencies": [
        "T003"
      ],
      "functional_paths": [
        "src/parallel-execution.mjs",
        "src/automation-send-state.mjs",
        "src/main.mjs",
        "tests/parallel-finalization.test.mjs",
        "tests/automation-send-state.test.mjs",
        "tests/parallel-execution-smoke-fixture.cjs"
      ],
      "documentation_paths": [],
      "verification_ids": [
        "unit-all",
        "electron-smoke"
      ],
      "id": "T004",
      "title": "Долговечный финал, Send и доказанный reply",
      "why": "Окончательный Send и ответ не должны теряться при OFF, restart, busy, draft и перестановке событий.",
      "acceptance_criteria": [
        "F01/F11-F19: persist до Send, отсутствие повтора sending/unknown, остановка при wrong scope/URL/HEAD и manual Stop.",
        "После подтверждённого main DONE completion OFF не теряет допустимый final; reply-observed не устанавливается чужим или незавершённым turn."
      ],
      "expected_commit_message": "fix: стабилизировать итоговую передачу и подтверждение ответа",
      "parallel_safe": false,
      "actual_files": [
        "src/automation-send-state.mjs",
        "src/main.mjs",
        "src/parallel-execution.mjs",
        "tests/automation-send-state.test.mjs",
        "tests/parallel-finalization.test.mjs"
      ]
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "parallel-final-stage-recovery-20261010",
        "task_id": "T005",
        "role": "implementation"
      },
      "dependencies": [
        "T004"
      ],
      "functional_paths": [
        "src/project-auto-plan.mjs",
        "src/project-session-auto-plan.mjs",
        "src/auto-plan.mjs",
        "src/main.mjs",
        "tests/project-auto-plan.test.mjs",
        "tests/auto-plan.test.mjs"
      ],
      "documentation_paths": [],
      "verification_ids": [
        "unit-all",
        "project-lifecycle",
        "electron-smoke"
      ],
      "id": "T005",
      "title": "Предварительный ON при двух основных чатах",
      "why": "Устаревший per-chat monitor не вправе отменять project-level решение пользователя.",
      "acceptance_criteria": [
        "A01-A06 проходят: awaitingPlan переживает restart/stale/read error, первый подтверждённый scope наследует ON один раз.",
        "MANUAL_OFF фиксируется только при явном действии пользователя; completion и следующий scope, origin, два проекта и Review не смешиваются; штатные пути executor/review disable проверены."
      ],
      "expected_commit_message": "fix: сохранить предварительный AutoPlan ON",
      "parallel_safe": false,
      "actual_files": [
        "src/auto-plan.mjs",
        "src/main.mjs",
        "src/project-auto-plan.mjs",
        "src/project-session-auto-plan.mjs",
        "tests/auto-plan.test.mjs",
        "tests/project-auto-plan.test.mjs"
      ]
    },
    {
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "parallel-final-stage-recovery-20261010",
        "task_id": "T006",
        "role": "implementation"
      },
      "dependencies": [
        "T004",
        "T005"
      ],
      "functional_paths": [
        "src/ui/sidebar.mjs",
        "src/ui/index.html",
        "src/execution-projection.mjs",
        "tests/parallel-execution-ui.test.mjs",
        "tests/parallel-execution-smoke-fixture.cjs",
        "tests/electron-smoke.mjs",
        "tests/sidebar.test.mjs"
      ],
      "documentation_paths": [],
      "verification_ids": [
        "unit-all",
        "electron-smoke"
      ],
      "id": "T006",
      "title": "Сквозной финальный цикл и UI блокировок",
      "why": "Проверить именно последний этап и пользовательски понятную диагностику в существующей карточке.",
      "acceptance_criteria": [
        "F01-F20/A01-A06 сопоставлены тестам и фактическим доказательствам, F03 исходно воспроизводился и после исправления доходит до итогового ответа.",
        "UI показывает source, blocked, diagnostic, final, reply и user-action ясно при 312px/двух темах/keyboard/aria; сервер worker не объявлен проверкой main."
      ],
      "expected_commit_message": "test: проверить последний этап и диагностику финала",
      "parallel_safe": false,
      "actual_files": [
        "src/execution-projection.mjs",
        "src/ui/index.html",
        "src/ui/sidebar.mjs",
        "tests/parallel-execution-smoke-fixture.cjs",
        "tests/parallel-execution-ui.test.mjs",
        "tests/sidebar.test.mjs"
      ]
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "parallel-final-stage-recovery-20261010",
        "task_id": "DOCS",
        "role": "implementation"
      },
      "dependencies": [
        "T001",
        "T002",
        "T003",
        "T004",
        "T005",
        "T006"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/planning/final-stage-recovery-spec.md",
        "docs/planning/final-stage-recovery-todo-draft.md",
        "README.md",
        "docs/architecture/OVERVIEW.md",
        "docs/modules/parallel-execution.md",
        "docs/modules/parallel-execution-acceptance.md",
        "docs/modules/auto-plan.md",
        "docs/modules/auto-plan-send.md",
        "docs/modules/command-activity.md",
        "docs/modules/codex-app-server-executor.md",
        "docs/modules/workspace-sidebar-ui.md",
        "docs/modules/release.md"
      ],
      "verification_ids": [],
      "id": "DOCS",
      "title": "Актуализация всех документов проекта",
      "why": "Сверить все действующие контракты с результатом перед отдельным delivery-хвостом.",
      "acceptance_criteria": [
        "README, OVERVIEW и все перечисленные контракты соответствуют проверенному поведению, версиям и реальным ограничениям.",
        "Матрица F/A с тестами, доказательствами и открытыми границами перенесена в подходящий действующий контракт; два временных planning-документа удалены без архивных копий по правилам Kit."
      ],
      "expected_commit_message": "docs: актуализировать контракты финального этапа",
      "parallel_safe": false
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "parallel-final-stage-recovery-20261010",
        "task_id": "T007",
        "role": "implementation"
      },
      "dependencies": [
        "T006",
        "DOCS"
      ],
      "functional_paths": [
        "package.json",
        "package-lock.json",
        "release-manifest.json"
      ],
      "documentation_paths": [],
      "verification_ids": [
        "paired-release"
      ],
      "id": "T007",
      "title": "Собрать один парный выпуск после DOCS",
      "why": "Предоставить версионированный проверенный набор macOS arm64 и Windows x64.",
      "verification_kind": "package",
      "acceptance_criteria": [
        "Установленные версии, evidence, пакеты, sourceCommit, подпись и manifest согласованы.",
        "Одна сборка произведена назначенной проверкой commit после DOCS, без запуска вручную ранее."
      ],
      "expected_commit_message": "release: собрать парный выпуск финального этапа",
      "parallel_safe": false
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "parallel-final-stage-recovery-20261010",
        "task_id": "T008",
        "role": "implementation"
      },
      "dependencies": [
        "T007",
        "DOCS"
      ],
      "functional_paths": [
        "release-manifest.json"
      ],
      "documentation_paths": [],
      "verification_ids": [
        "release-installed"
      ],
      "id": "T008",
      "title": "Установить готовый выпуск без пересборки",
      "why": "Сохранить macOS app identity и подпись без перезапуска работающего приложения.",
      "verification_kind": "installed",
      "acceptance_criteria": [
        "Staging проверен и установлен без пересборки, пути/симлинки, подпись и identity сохранены.",
        "Работающее приложение не перезапущено автоматически."
      ],
      "expected_commit_message": "release: установить готовый выпуск финального этапа",
      "parallel_safe": false
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "parallel-final-stage-recovery-20261010",
        "task_id": "T009",
        "role": "implementation"
      },
      "dependencies": [
        "T008",
        "DOCS"
      ],
      "functional_paths": [
        "release-manifest.json"
      ],
      "documentation_paths": [],
      "verification_ids": [
        "github-release"
      ],
      "id": "T009",
      "title": "Опубликовать и сверить GitHub release",
      "why": "Одна версия и шесть assets подтверждены на GitHub и в локальном manifest.",
      "verification_kind": "package",
      "acceptance_criteria": [
        "Тег стоит на sourceCommit, шесть assets и remote main сверены без пересборки.",
        "Названы ограничения автоматических проверок и шаги живой приёмки; план не архивирован."
      ],
      "expected_commit_message": "release: опубликовать выпуск финального этапа",
      "parallel_safe": false
    }
  ],
  "blocked_reason": null,
  "user_decisions": [
    {
      "id": "fc27b135-6a60-415c-8036-d66b9a49e80c",
      "text": "Пользователь 10.10.2026 поручил изучить два черновика, подготовить скорректированные документы для Review и последующего плана. Текущий этап не разрешает выполнение задач реализации.",
      "recorded_at": "2026-10-10T12:39:55.852Z"
    }
  ],
  "stack": "Electron 44.5.1 / Node 24.21.0 / Workflow Kit 1.7.2",
  "parallel_allowed": true,
  "max_workers": 4,
  "execution_strategy": "sequential",
  "execution_reason": "Параллельное выполнение сейчас испытывается и исправляется. Пользователь поручил текущие исправления выполнять основным агентом последовательно; пересекающиеся состояния очереди, авторизации и UI требуют одного писателя и независимого будущего живого теста.",
  "execution_origin_session_id": "web-pilot-aa67c57c-101f-41a6-8ba4-8c882be9d6de"
}
```
<!-- workflow-state:end -->

## Состояние

Execution Scope Status: ACTIVE
Delivery Status: IN_PROGRESS
Scope: parallel-final-stage-recovery-20261010
Current Task: нет
Revision: 1717

## Цель

Устранить тупик последнего READY при активном writer и сброс предварительного AutoPlan ON; завершить безопасный финальный цикл и покрыть его адресной регрессией.

## Критерии приёмки

- F03: готовый source и активный writer не ведут к unsafe merge или немой блокировке; диагностика отправлена безопасно, после законного устранения причины цикл завершается один раз.
- F01/F02 подтверждены сквозными реальными Git/Kit и sandbox проверками, F04-F20/A01-A06 покрыты адресными unit/Git/Electron проверками либо явно обозначенными оставшимися границами.
- A01-A06: предварительный ON не сбрасывается при двух чатах и stale/read error, первый scope наследует разрешение, последующий начинает OFF.
- Одна очередь и один владелец main, повторных Send при UNKNOWN нет, живые серверы пользователя не останавливаются автоматически.
- DOCS обновлена перед одной парной сборкой, установкой и GitHub release; пользовательская приёмка и native Windows не объявлены выполненными по fixture.

## Микрозадачи

Выполнение: sequential; разрешено: true; лимит: 4
Причина: Параллельное выполнение сейчас испытывается и исправляется. Пользователь поручил текущие исправления выполнять основным агентом последовательно; пересекающиеся состояния очереди, авторизации и UI требуют одного писателя и независимого будущего живого теста.

- [DONE] T001: Воспроизвести последний READY и writer после source — Завершено
  - Git Commit: [DONE] test: воспроизвести блокировку последнего READY
  - Reference: parallel-final-stage-recovery-20261010 / T001 / implementation
  - Файлы: tests/parallel-finalization.test.mjs, tests/parallel-execution-smoke-fixture.cjs
  - Параллельность: исключительное выполнение
  - Зависимости: нет
- [DONE] T002: Сохранить ограничения команд и доставить child completion — Завершено
  - Git Commit: [DONE] fix: уточнить lifecycle команд и child события
  - Reference: parallel-final-stage-recovery-20261010 / T002 / implementation
  - Файлы: src/command-activity.mjs, src/parallel-kit.mjs, src/main.mjs, src/project-input-watch.mjs, tools/codex-app-server-mcp/server.py, tools/codex-app-server-mcp/app_server_client.py, tests/command-activity.test.mjs, tests/codex-app-server-mcp.test.mjs, tests/parallel-execution-recovery.test.mjs
  - Параллельность: исключительное выполнение
  - Зависимости: T001
- [DONE] T003: Диагностировать блокированный source без unsafe merge — Завершено
  - Git Commit: [DONE] fix: передавать диагностический blocker основному агенту
  - Reference: parallel-final-stage-recovery-20261010 / T003 / implementation
  - Файлы: src/parallel-execution.mjs, src/parallel-kit.mjs, src/execution-projection.mjs, src/main.mjs, src/automation-send-state.mjs, tests/parallel-finalization.test.mjs, tests/parallel-execution-recovery.test.mjs, tests/parallel-execution.test.mjs, tests/parallel-execution-smoke-fixture.cjs
  - Параллельность: исключительное выполнение
  - Зависимости: T002
- [DONE] T004: Долговечный финал, Send и доказанный reply — Завершено
  - Git Commit: [DONE] fix: стабилизировать итоговую передачу и подтверждение ответа
  - Reference: parallel-final-stage-recovery-20261010 / T004 / implementation
  - Файлы: src/parallel-execution.mjs, src/automation-send-state.mjs, src/main.mjs, tests/parallel-finalization.test.mjs, tests/automation-send-state.test.mjs, tests/parallel-execution-smoke-fixture.cjs
  - Параллельность: исключительное выполнение
  - Зависимости: T003
- [DONE] T005: Предварительный ON при двух основных чатах — Завершено
  - Git Commit: [DONE] fix: сохранить предварительный AutoPlan ON
  - Reference: parallel-final-stage-recovery-20261010 / T005 / implementation
  - Файлы: src/project-auto-plan.mjs, src/project-session-auto-plan.mjs, src/auto-plan.mjs, src/main.mjs, tests/project-auto-plan.test.mjs, tests/auto-plan.test.mjs
  - Параллельность: исключительное выполнение
  - Зависимости: T004
- [DONE] T006: Сквозной финальный цикл и UI блокировок — Завершено
  - Git Commit: [DONE] test: проверить последний этап и диагностику финала
  - Reference: parallel-final-stage-recovery-20261010 / T006 / implementation
  - Файлы: src/ui/sidebar.mjs, src/ui/index.html, src/execution-projection.mjs, tests/parallel-execution-ui.test.mjs, tests/parallel-execution-smoke-fixture.cjs, tests/electron-smoke.mjs, tests/sidebar.test.mjs
  - Параллельность: исключительное выполнение
  - Зависимости: T004, T005
- [TODO] DOCS: Актуализация всех документов проекта — Ожидает
  - Git Commit: [PENDING] docs: актуализировать контракты финального этапа
  - Reference: parallel-final-stage-recovery-20261010 / DOCS / implementation
  - Файлы: docs/planning/final-stage-recovery-spec.md, docs/planning/final-stage-recovery-todo-draft.md, README.md, docs/architecture/OVERVIEW.md, docs/modules/parallel-execution.md, docs/modules/parallel-execution-acceptance.md, docs/modules/auto-plan.md, docs/modules/auto-plan-send.md, docs/modules/command-activity.md, docs/modules/codex-app-server-executor.md, docs/modules/workspace-sidebar-ui.md, docs/modules/release.md
  - Параллельность: исключительное выполнение
  - Зависимости: T001, T002, T003, T004, T005, T006
- [TODO] T007: Собрать один парный выпуск после DOCS — Ожидает
  - Git Commit: [PENDING] release: собрать парный выпуск финального этапа
  - Reference: parallel-final-stage-recovery-20261010 / T007 / implementation
  - Файлы: package.json, package-lock.json, release-manifest.json
  - Параллельность: исключительное выполнение
  - Зависимости: T006, DOCS
- [TODO] T008: Установить готовый выпуск без пересборки — Ожидает
  - Git Commit: [PENDING] release: установить готовый выпуск финального этапа
  - Reference: parallel-final-stage-recovery-20261010 / T008 / implementation
  - Файлы: release-manifest.json
  - Параллельность: исключительное выполнение
  - Зависимости: T007, DOCS
- [TODO] T009: Опубликовать и сверить GitHub release — Ожидает
  - Git Commit: [PENDING] release: опубликовать выпуск финального этапа
  - Reference: parallel-final-stage-recovery-20261010 / T009 / implementation
  - Файлы: release-manifest.json
  - Параллельность: исключительное выполнение
  - Зависимости: T008, DOCS

## Context Pack For This Cycle

- docs/architecture/OVERVIEW.md
- docs/planning/final-stage-recovery-spec.md
- docs/planning/final-stage-recovery-todo-draft.md
- docs/modules/parallel-execution.md
- docs/modules/command-activity.md
- docs/modules/auto-plan.md

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
