# Активный план — Project Web Pilot

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 119,
  "project_id": "cf944136-d1fc-4bd5-9ea0-e46d1fe230e7",
  "project_name": "Project Web Pilot",
  "scope_id": "web-pilot-layout-archive-002",
  "execution_scope_status": "ACTIVE",
  "delivery_status": "READY_FOR_ACCEPTANCE",
  "objective": "Сделать ширину левого сайдбара регулируемой, вынести архив в отдельное окно и сделать статус контекста компактным: детали сворачиваются под динамическим заголовком, а раскрывающие элементы проектов и статуса хорошо читаются.",
  "acceptance_criteria": [
    "Граница между сайдбаром и ChatGPT перетаскивается мышью; сайдбар не сужается меньше текущих 312 px, а выбранная ширина сохраняется между запусками.",
    "Settings содержит компактную кнопку «Архив проектов», открывающую отдельное локальное окно; повторное нажатие фокусирует уже открытое окно.",
    "В окне архива обычный клик выбирает один проект, Shift выбирает диапазон, Command/Ctrl переключает отдельные проекты.",
    "Для выбранных архивных проектов доступны возврат в активные и «Убрать из списка»; удаление локальной записи не меняет папки на диске и облачные чаты.",
    "Удаление с диска сохраняет существующую строгую проверку и подтверждение; для безопасности выполняется по одному выбранному проекту.",
    "После «Убрать из списка» папку можно снова подключить через «Открыть папку проекта» как существующий workspace.",
    "Автоматические тесты и Electron smoke проходят, обновлённая macOS arm64 сборка готова к пользовательской проверке.",
    "Карточка состояния контекста всегда показывает текущий заголовок, а детали и действия можно раскрыть/скрыть большим треугольником.",
    "Треугольник раскрытия сессий проекта заметно увеличен и однозначно читается как disclosure control."
  ],
  "approved_scope": {
    "functional_paths": [
      "src/main.mjs",
      "src/preload.cjs",
      "src/archive-preload.cjs",
      "src/workspace-session.mjs",
      "src/ui/index.html",
      "src/ui/sidebar.mjs",
      "src/ui/project-archive.mjs",
      "src/ui/archive.html",
      "src/ui/archive.mjs",
      "tests/workspace-session.test.mjs",
      "tests/electron-smoke.mjs",
      "package.json",
      "package-lock.json"
    ],
    "documentation_paths": [
      "README.md",
      "docs/PRODUCT.md",
      "docs/DECISIONS.md",
      "docs/PROJECT_ARCHIVE.md",
      "docs/architecture/ARCHITECTURE.md",
      "docs/VERIFICATION.md",
      "docs/WORKFLOW_START.md",
      "docs/DOCUMENTATION_INDEX.md"
    ],
    "max_functional_files_per_task": 3
  },
  "baseline_commit": "ccd6229d97485d6ac66f447e34d205357cd0ee10",
  "current_task_id": null,
  "context_pack": {
    "documents": [
      {
        "path": "AGENTS.md",
        "heading_path": [
          "Project Web Pilot — границы разработки"
        ],
        "required": true,
        "revision": "WORKTREE"
      },
      {
        "path": "docs/WORKFLOW_START.md",
        "heading_path": [
          "Начало работы",
          "Опорный контекст новой сессии"
        ],
        "required": true,
        "revision": "WORKTREE"
      },
      {
        "path": "docs/PROJECT_ARCHIVE.md",
        "heading_path": [
          "Архив проектов"
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
      "functional_paths": [],
      "documentation_paths": [
        "docs/PRODUCT.md",
        "docs/DECISIONS.md",
        "docs/PROJECT_ARCHIVE.md"
      ],
      "verification_ids": [],
      "id": "T001",
      "title": "Зафиксировать UX нового scope",
      "why": "Согласовать поведение resize, отдельного архива, множественного выбора и удаления локальной записи до изменения кода",
      "acceptance_criteria": [
        "Документы однозначно описывают минимальную ширину 312 px, отдельное окно архива, Shift/Cmd/Ctrl выбор и семантику «Убрать из списка»",
        "Зафиксировано, что массовые возврат/убрать из списка допустимы, а физическое удаление выполняется по одному проекту"
      ],
      "expected_commit_message": "docs: определить resize и новое окно архива",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "web-pilot-layout-archive-002",
        "task_id": "T001",
        "role": "implementation"
      }
    },
    {
      "dependencies": [
        "T001"
      ],
      "functional_paths": [
        "src/workspace-session.mjs",
        "tests/workspace-session.test.mjs"
      ],
      "documentation_paths": [
        "docs/PROJECT_ARCHIVE.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "workspace",
        "suite"
      ],
      "id": "T002",
      "title": "Добавить атомарное забывание нескольких архивов",
      "why": "Массовая команда «Убрать из списка» не должна частично менять локальный реестр",
      "acceptance_criteria": [
        "Store атомарно удаляет набор архивных записей только при совпадении workspace/projectId",
        "Папки на диске не читаются и не изменяются",
        "Ошибка одного элемента оставляет весь набор без изменений"
      ],
      "expected_commit_message": "feat: забывать выбранные архивные проекты",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "web-pilot-layout-archive-002",
        "task_id": "T002",
        "role": "implementation"
      }
    },
    {
      "dependencies": [
        "T001"
      ],
      "functional_paths": [
        "src/main.mjs",
        "src/preload.cjs",
        "tests/electron-smoke.mjs"
      ],
      "documentation_paths": [
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "syntax",
        "suite",
        "electron-smoke"
      ],
      "id": "T003",
      "title": "Сохранять регулируемую ширину сайдбара",
      "why": "Главный процесс должен владеть границами WebContentsView и устойчивой настройкой ширины",
      "acceptance_criteria": [
        "Ширина хранится в settings.json и ограничена минимумом 312 px",
        "Главный процесс перераскладывает sidebar/browser без перезагрузки ChatGPT",
        "При сужении окна сохраняется минимальная полезная ширина Chromium"
      ],
      "expected_commit_message": "feat: сохранять ширину сайдбара",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "web-pilot-layout-archive-002",
        "task_id": "T003",
        "role": "implementation"
      }
    },
    {
      "dependencies": [
        "T003"
      ],
      "functional_paths": [
        "src/ui/index.html",
        "src/ui/sidebar.mjs",
        "tests/electron-smoke.mjs"
      ],
      "documentation_paths": [
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "suite",
        "electron-smoke"
      ],
      "id": "T004",
      "title": "Добавить перетаскиваемую границу в sidebar",
      "why": "Пользователь должен менять ширину прямым drag жестом",
      "acceptance_criteria": [
        "У правой границы sidebar есть доступный drag handle",
        "Pointer drag расширяет и сужает sidebar, но не ниже 312 px",
        "Electron smoke проверяет drag и сохранённую ширину"
      ],
      "expected_commit_message": "feat: добавить splitter сайдбара",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "web-pilot-layout-archive-002",
        "task_id": "T004",
        "role": "implementation"
      }
    },
    {
      "dependencies": [
        "T001",
        "T002"
      ],
      "functional_paths": [
        "src/main.mjs",
        "src/archive-preload.cjs",
        "src/ui/archive.html"
      ],
      "documentation_paths": [
        "docs/PROJECT_ARCHIVE.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "syntax",
        "suite"
      ],
      "id": "T005",
      "title": "Создать отдельное локальное окно архива",
      "why": "Архив должен перестать занимать Settings и жить в самостоятельном безопасном окне",
      "acceptance_criteria": [
        "Главный процесс создаёт не более одного окна архива и фокусирует существующее",
        "Окно получает только выделенный archive IPC без Node integration",
        "Состояние архива обновляется при изменениях основного store"
      ],
      "expected_commit_message": "feat: вынести архив в отдельное окно",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "web-pilot-layout-archive-002",
        "task_id": "T005",
        "role": "implementation"
      }
    },
    {
      "dependencies": [
        "T005"
      ],
      "functional_paths": [
        "src/ui/archive.mjs",
        "src/ui/project-archive.mjs",
        "src/preload.cjs"
      ],
      "documentation_paths": [
        "docs/PROJECT_ARCHIVE.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "suite"
      ],
      "id": "T006",
      "title": "Реализовать множественный выбор и действия архива",
      "why": "Отдельное окно должно поддерживать привычный desktop multi-select и три пользовательских действия",
      "acceptance_criteria": [
        "Обычный клик, Shift и Command/Ctrl работают как в desktop списках",
        "Возврат и «Убрать из списка» применяются ко всем выбранным записям",
        "Удаление с диска доступно для одного выбранного проекта и использует прежнее точное подтверждение",
        "Settings показывает только кнопку открытия архива вместо списка"
      ],
      "expected_commit_message": "feat: добавить multi-select управление архивом",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "web-pilot-layout-archive-002",
        "task_id": "T006",
        "role": "implementation"
      }
    },
    {
      "dependencies": [
        "T004",
        "T006"
      ],
      "functional_paths": [
        "tests/electron-smoke.mjs",
        "src/ui/project-archive.mjs",
        "src/ui/archive.mjs"
      ],
      "documentation_paths": [
        "README.md",
        "docs/PROJECT_ARCHIVE.md",
        "docs/VERIFICATION.md",
        "docs/WORKFLOW_START.md",
        "docs/architecture/ARCHITECTURE.md"
      ],
      "verification_ids": [
        "suite",
        "electron-smoke"
      ],
      "id": "T007",
      "title": "Проверить интеграцию и пересобрать приложение",
      "why": "Закрепить оба пользовательских сценария в Electron и подготовить macOS сборку",
      "acceptance_criteria": [
        "Smoke проверяет resize, отдельное окно архива, Shift/Cmd/Ctrl выбор, массовый restore/forget и одиночное delete",
        "После forget папка остаётся и может быть повторно подключена",
        "Финальная arm64 сборка создана, а рабочее дерево чистое"
      ],
      "expected_commit_message": "test: проверить resize и отдельный архив",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "web-pilot-layout-archive-002",
        "task_id": "T007",
        "role": "implementation"
      }
    },
    {
      "id": "T008",
      "title": "Сделать компактный статус контекста и крупные disclosure-треугольники",
      "why": "Снизить визуальный шум сайдбара и сделать оба раскрывающих элемента очевидными",
      "dependencies": [
        "T007"
      ],
      "functional_paths": [
        "src/ui/index.html",
        "src/ui/sidebar.mjs",
        "tests/electron-smoke.mjs"
      ],
      "documentation_paths": [
        "docs/architecture/ARCHITECTURE.md",
        "docs/VERIFICATION.md"
      ],
      "acceptance_criteria": [
        "Динамический заголовок статуса контекста всегда видим, а описание, три строки состояния и действия скрываются/показываются одной кнопкой-треугольником",
        "Треугольник карточки имеет aria-expanded и доступен с клавиатуры",
        "Треугольник проекта визуально увеличен примерно втрое относительно прежнего глифа и сохраняет текущую логику раскрытия сессий",
        "Electron smoke проверяет сворачивание/раскрытие карточки и доступность обоих disclosure controls"
      ],
      "verification_ids": [
        "suite",
        "electron-smoke"
      ],
      "expected_commit_message": "feat: свернуть детали статуса контекста",
      "implementation_status": "DONE",
      "commit_status": "DONE",
      "commit_ref": {
        "scope_id": "web-pilot-layout-archive-002",
        "task_id": "T008",
        "role": "implementation"
      }
    }
  ],
  "blocked_reason": null,
  "user_decisions": [
    {
      "id": "c8e4daf1-7135-40ab-a21a-1ae9ddf5522a",
      "text": "12.09.2026 пользователь прямо поручил реализовать перемещаемую границу сайдбара и отдельное окно архива с множественным выбором и новой командой «Убрать из списка».",
      "recorded_at": "2026-09-12T08:06:18.020Z"
    },
    {
      "id": "context-card-collapse-20260912",
      "text": "12.09.2026 пользователь поручил сделать детали карточки состояния контекста сворачиваемыми под первой динамической строкой, заменить цветной кружок крупным треугольником раскрытия и примерно втрое увеличить треугольник раскрытия сессий проекта.",
      "recorded_at": "2026-09-12T08:43:07Z"
    }
  ]
}
```
<!-- workflow-state:end -->

## Состояние

Execution Scope Status: ACTIVE
Delivery Status: READY_FOR_ACCEPTANCE
Scope: web-pilot-layout-archive-002
Current Task: нет
Revision: 119

## Цель

Сделать ширину левого сайдбара регулируемой, вынести архив в отдельное окно и сделать статус контекста компактным: детали сворачиваются под динамическим заголовком, а раскрывающие элементы проектов и статуса хорошо читаются.

## Критерии приёмки

- Граница между сайдбаром и ChatGPT перетаскивается мышью; сайдбар не сужается меньше текущих 312 px, а выбранная ширина сохраняется между запусками.
- Settings содержит компактную кнопку «Архив проектов», открывающую отдельное локальное окно; повторное нажатие фокусирует уже открытое окно.
- В окне архива обычный клик выбирает один проект, Shift выбирает диапазон, Command/Ctrl переключает отдельные проекты.
- Для выбранных архивных проектов доступны возврат в активные и «Убрать из списка»; удаление локальной записи не меняет папки на диске и облачные чаты.
- Удаление с диска сохраняет существующую строгую проверку и подтверждение; для безопасности выполняется по одному выбранному проекту.
- После «Убрать из списка» папку можно снова подключить через «Открыть папку проекта» как существующий workspace.
- Автоматические тесты и Electron smoke проходят, обновлённая macOS arm64 сборка готова к пользовательской проверке.
- Карточка состояния контекста всегда показывает текущий заголовок, а детали и действия можно раскрыть/скрыть большим треугольником.
- Треугольник раскрытия сессий проекта заметно увеличен и однозначно читается как disclosure control.

## Микрозадачи

- [DONE] T001: Зафиксировать UX нового scope — Завершено
  - Git Commit: [DONE] docs: определить resize и новое окно архива
  - Reference: web-pilot-layout-archive-002 / T001 / implementation
  - Файлы: docs/PRODUCT.md, docs/DECISIONS.md, docs/PROJECT_ARCHIVE.md
- [DONE] T002: Добавить атомарное забывание нескольких архивов — Завершено
  - Git Commit: [DONE] feat: забывать выбранные архивные проекты
  - Reference: web-pilot-layout-archive-002 / T002 / implementation
  - Файлы: src/workspace-session.mjs, tests/workspace-session.test.mjs, docs/PROJECT_ARCHIVE.md, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md
- [DONE] T003: Сохранять регулируемую ширину сайдбара — Завершено
  - Git Commit: [DONE] feat: сохранять ширину сайдбара
  - Reference: web-pilot-layout-archive-002 / T003 / implementation
  - Файлы: src/main.mjs, src/preload.cjs, tests/electron-smoke.mjs, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md
- [DONE] T004: Добавить перетаскиваемую границу в sidebar — Завершено
  - Git Commit: [DONE] feat: добавить splitter сайдбара
  - Reference: web-pilot-layout-archive-002 / T004 / implementation
  - Файлы: src/ui/index.html, src/ui/sidebar.mjs, tests/electron-smoke.mjs, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md
- [DONE] T005: Создать отдельное локальное окно архива — Завершено
  - Git Commit: [DONE] feat: вынести архив в отдельное окно
  - Reference: web-pilot-layout-archive-002 / T005 / implementation
  - Файлы: src/main.mjs, src/archive-preload.cjs, src/ui/archive.html, docs/PROJECT_ARCHIVE.md, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md
- [DONE] T006: Реализовать множественный выбор и действия архива — Завершено
  - Git Commit: [DONE] feat: добавить multi-select управление архивом
  - Reference: web-pilot-layout-archive-002 / T006 / implementation
  - Файлы: src/ui/archive.mjs, src/ui/project-archive.mjs, src/preload.cjs, docs/PROJECT_ARCHIVE.md, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md
- [DONE] T007: Проверить интеграцию и пересобрать приложение — Завершено
  - Git Commit: [DONE] test: проверить resize и отдельный архив
  - Reference: web-pilot-layout-archive-002 / T007 / implementation
  - Файлы: tests/electron-smoke.mjs, src/ui/project-archive.mjs, src/ui/archive.mjs, README.md, docs/PROJECT_ARCHIVE.md, docs/VERIFICATION.md, docs/WORKFLOW_START.md, docs/architecture/ARCHITECTURE.md
- [DONE] T008: Сделать компактный статус контекста и крупные disclosure-треугольники — Завершено
  - Git Commit: [DONE] feat: свернуть детали статуса контекста
  - Reference: web-pilot-layout-archive-002 / T008 / implementation
  - Файлы: src/ui/index.html, src/ui/sidebar.mjs, tests/electron-smoke.mjs, docs/architecture/ARCHITECTURE.md, docs/VERIFICATION.md

## Context Pack For This Cycle

- AGENTS.md → Project Web Pilot — границы разработки
- docs/WORKFLOW_START.md → Начало работы / Опорный контекст новой сессии
- docs/PROJECT_ARCHIVE.md → Архив проектов

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
