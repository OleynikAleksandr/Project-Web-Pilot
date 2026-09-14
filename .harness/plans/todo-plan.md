# Активный план — Project Web Pilot

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 240,
  "project_id": "cf944136-d1fc-4bd5-9ea0-e46d1fe230e7",
  "project_name": "Project Web Pilot",
  "scope_id": "workflow-kit-recovery-packet-010",
  "execution_scope_status": "ACTIVE",
  "delivery_status": "IN_PROGRESS",
  "objective": "Разобрать, почему recovery-пакет Workflow Kit разрастается до CONTEXT_TOO_LARGE, измерить фактический состав и стоимость обязательного контекста и выбрать безопасную политику упаковки без потери данных, необходимых агенту для продолжения работы.",
  "acceptance_criteria": [
    "На Mac воспроизведён или точно смоделирован сценарий CONTEXT_TOO_LARGE на реалистичном активном плане без изменения production semantics.",
    "Измерен вклад основных разделов recovery-пакета в bytes и оценочные tokens; обязательные и необязательные части разделены явно.",
    "Зафиксированы действующие лимиты Workflow Kit и Web Pilot и точная точка, где возникает переполнение.",
    "Сравнены безопасные варианты: изменение budget, изменение состава пакета и уменьшение повторяющегося контекста; дана конкретная рекомендация с рисками.",
    "До отдельного согласования пользователя код, budget и recovery semantics не изменяются."
  ],
  "approved_scope": {
    "functional_paths": [
      "src/main.mjs",
      "tests/electron-smoke.mjs"
    ],
    "documentation_paths": [
      "docs/CONTEXT_DELIVERY.md",
      "docs/VERIFICATION.md",
      "docs/WORKFLOW_START.md",
      "docs/architecture/ARCHITECTURE.md"
    ],
    "max_functional_files_per_task": 3
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
      "implementation_status": "TODO",
      "commit_status": "PENDING",
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
        "docs/CONTEXT_DELIVERY.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [],
      "id": "T001",
      "title": "Разобрать состав и budget recovery-пакета",
      "why": "На Windows уже наблюдался CONTEXT_TOO_LARGE, а дальнейшие изменения Workflow Kit нужно делать по измерениям, а не простым увеличением лимита.",
      "acceptance_criteria": [
        "Получен воспроизводимый пример или controlled fixture переполнения.",
        "Для recovery-пакета построен breakdown по основным секциям с bytes/tokens.",
        "Определено, какие секции обязательны для корректного восстановления, а какие можно сделать условными или компактнее.",
        "Сопоставлены лимиты Workflow Kit и 180000-byte лимит Web Pilot.",
        "В документах записаны минимум два варианта решения и рекомендованный следующий шаг; production-код и budget не менялись."
      ],
      "expected_commit_message": "docs: разобрать recovery budget Workflow Kit",
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "workflow-kit-recovery-packet-010",
        "task_id": "T001",
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
Revision: 240

## Цель

Разобрать, почему recovery-пакет Workflow Kit разрастается до CONTEXT_TOO_LARGE, измерить фактический состав и стоимость обязательного контекста и выбрать безопасную политику упаковки без потери данных, необходимых агенту для продолжения работы.

## Критерии приёмки

- На Mac воспроизведён или точно смоделирован сценарий CONTEXT_TOO_LARGE на реалистичном активном плане без изменения production semantics.
- Измерен вклад основных разделов recovery-пакета в bytes и оценочные tokens; обязательные и необязательные части разделены явно.
- Зафиксированы действующие лимиты Workflow Kit и Web Pilot и точная точка, где возникает переполнение.
- Сравнены безопасные варианты: изменение budget, изменение состава пакета и уменьшение повторяющегося контекста; дана конкретная рекомендация с рисками.
- До отдельного согласования пользователя код, budget и recovery semantics не изменяются.

## Микрозадачи

- [TODO] T000: Ограничить clipboard-write основным ChatGPT WebContents — Ожидает
  - Git Commit: [PENDING] fix: ограничить clipboard write основным ChatGPT
  - Reference: workflow-kit-recovery-packet-010 / T000 / implementation
  - Файлы: src/main.mjs, tests/electron-smoke.mjs, docs/VERIFICATION.md, docs/architecture/ARCHITECTURE.md
- [TODO] T001: Разобрать состав и budget recovery-пакета — Ожидает
  - Git Commit: [PENDING] docs: разобрать recovery budget Workflow Kit
  - Reference: workflow-kit-recovery-packet-010 / T001 / implementation
  - Файлы: docs/CONTEXT_DELIVERY.md, docs/VERIFICATION.md

## Context Pack For This Cycle

- docs/CONTEXT_DELIVERY.md → Передача контекста
- docs/VERIFICATION.md → Проверки и приёмка

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
