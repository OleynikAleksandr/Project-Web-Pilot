# Активный план — Project Web Pilot

<!-- workflow-state:begin -->
```json
{
  "schema_version": 1,
  "plan_revision": 2,
  "project_id": "cf944136-d1fc-4bd5-9ea0-e46d1fe230e7",
  "project_name": "Project Web Pilot",
  "scope_id": "session-opening-performance-029",
  "execution_scope_status": "ACTIVE",
  "delivery_status": "IN_PROGRESS",
  "objective": "Быстрое открытие сессий и планов",
  "acceptance_criteria": [
    "При обычном переключении подключённого проекта свежий собственный план и начало загрузки нужного чата появляются без ожидания полной диагностики всей папки; при NONE не подставляется чужой план.",
    "Цели на текущем Mac: p95 локального показа/начала навигации <=1с по 30 переключениям; <=2с после shell-ready на 5 стартах, с отдельным измерением полного app startup; полная проверка на сопоставимом проекте минимум на 60% быстрее baseline 16.1–16.5с. Скорость сети ChatGPT учитывается отдельно.",
    "Повторы полной валидации и Git-процессов устранены; память кэша ограничена, актуальность доказана, устаревшие/ошибочные результаты не разрешают операции нового состояния.",
    "Правильные session/plan ownership, Chat/Work, prepared links, NONE, история, транзакции, Git hooks, COMPLETE recovery и повторная проверка перед отправкой сохранены.",
    "Обе копии Workflow Kit, install/upgrade/Doctor и инструкции согласованы без ослабления целостности; данные и работа других агентов сохранены.",
    "Node suite/Electron smoke и сопоставимые packaged замеры подтверждены; macOS app и оба ZIP подготовлены по RELEASE, все документы актуализированы."
  ],
  "approved_scope": {
    "functional_paths": [
      ".harness/kit/lib/git.mjs",
      "resources/workflow-kit/lib/git.mjs",
      "tests/workflow-kit-recovery.test.mjs",
      ".harness/kit/lib/actions.mjs",
      "resources/workflow-kit/lib/actions.mjs",
      ".harness/kit/lib/validate.mjs",
      "resources/workflow-kit/lib/validate.mjs",
      ".harness/kit/lib/recovery.mjs",
      "resources/workflow-kit/lib/recovery.mjs",
      ".harness/kit/lib/installer.mjs",
      "resources/workflow-kit/lib/installer.mjs",
      "resources/workspace-setup-worker.mjs",
      "tests/workspace-setup.test.mjs",
      "src/workspace-readiness.mjs",
      "src/workspace-setup.mjs",
      "tests/workspace-readiness.test.mjs",
      "src/main.mjs",
      "src/workspace-session.mjs",
      "src/ui/index.html",
      "tests/workspace-session.test.mjs",
      "tests/electron-smoke.mjs",
      "src/context-session.mjs",
      "src/context-cache.mjs",
      "src/context-inputs.mjs",
      "src/session-plans.mjs",
      "tests/context-session.test.mjs",
      "tests/context-cache.test.mjs",
      ".harness/kit/lib/common.mjs",
      "resources/workflow-kit/lib/common.mjs",
      "resources/project-doctor/core.mjs",
      "tests/project-doctor.test.mjs",
      "tests/workflow-kit-source.test.mjs",
      "tests/session-opening-performance.test.mjs",
      "tests/session-plans.test.mjs",
      "package.json",
      "package-lock.json"
    ],
    "documentation_paths": [
      "docs/modules/session-opening-performance.md",
      "docs/architecture/OVERVIEW.md",
      "docs/MODULES.md",
      "docs/DOCUMENTATION_INDEX.md",
      "docs/WORKSPACE_SETUP.md",
      "docs/modules/workspace-sessions.md",
      "docs/modules/workflow-kit-recovery.md",
      "docs/VERIFICATION.md",
      "docs/CONTEXT_DELIVERY.md",
      "docs/modules/project-doctor.md",
      "docs/SOURCE_WORKSPACES.md",
      "docs/RELEASE.md",
      "docs/TRANSFER_TO_WINDOWS.md",
      "README.md",
      "AGENTS.md",
      "docs/PRODUCT.md",
      "docs/DECISIONS.md",
      "docs/WORKFLOW_START.md",
      "docs/architecture/ARCHITECTURE.md",
      "docs/modules/session-owned-plans.md",
      "docs/modules/runtime-lifecycle.md",
      "docs/PROJECT_ARCHIVE.md",
      "docs/CLEAN_INSTALL.md",
      ".harness/kit/WORKFLOW.md",
      "resources/workflow-kit/WORKFLOW.md",
      ".harness/kit/templates/AGENTS.md",
      "resources/workflow-kit/templates/AGENTS.md",
      ".harness/kit/templates/START.md",
      "resources/workflow-kit/templates/START.md",
      ".harness/kit/templates/PLAN.md",
      "resources/workflow-kit/templates/PLAN.md",
      ".harness/plans/todo-plan.template.md"
    ],
    "max_functional_files_per_task": 3
  },
  "baseline_commit": "d07ac2cc2dd25dd39e7cbc56d5bb8b8dbd8b043b",
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
        "path": "docs/modules/workflow-kit-recovery.md",
        "heading_path": [
          "Module Specification — Workflow Kit / Context Recovery"
        ],
        "required": true,
        "revision": "WORKTREE"
      },
      {
        "path": "docs/modules/workspace-sessions.md",
        "heading_path": [
          "Действующая модель — 0.6.28 / schema v6"
        ],
        "required": true,
        "revision": "WORKTREE"
      },
      {
        "path": "docs/modules/session-owned-plans.md",
        "required": false,
        "revision": "WORKTREE"
      },
      {
        "path": "docs/WORKSPACE_SETUP.md",
        "required": false,
        "revision": "WORKTREE"
      },
      {
        "path": "docs/CONTEXT_DELIVERY.md",
        "required": false,
        "revision": "WORKTREE"
      },
      {
        "path": "docs/modules/project-doctor.md",
        "required": false,
        "revision": "WORKTREE"
      },
      {
        "path": "docs/RELEASE.md",
        "required": false,
        "revision": "WORKTREE"
      },
      {
        "path": "docs/VERIFICATION.md",
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
        "scope_id": "session-opening-performance-029",
        "task_id": "T001",
        "role": "implementation"
      },
      "dependencies": [],
      "functional_paths": [],
      "documentation_paths": [
        "docs/modules/session-opening-performance.md",
        "docs/architecture/OVERVIEW.md",
        "docs/MODULES.md",
        "docs/DOCUMENTATION_INDEX.md",
        "docs/WORKSPACE_SETUP.md",
        "docs/modules/workspace-sessions.md",
        "docs/modules/workflow-kit-recovery.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [],
      "id": "T001",
      "title": "Уточнить контракт ускорения и зафиксировать исходные замеры",
      "why": "Диагностика 17.09.2026, приложение/checkout 0.6.28, Kit 1.4.0, HEAD d07ac2c: WorkspaceSetup.preview 16134 мс; повтор с профилированием 16488 мс, ready=true, issues=[]. Два канонических плана: session-owned-plans-028 и workflow-project-continuity-021. Чтение своего плана 11/5/5 мс; contextInputKey 36/28/25 мс. main.reviewWorkspace ждёт preview до store.selectSession/navigate; запуск приложения использует тот же путь. worker.inspectProject вызывает inspect -> status -> validate + recover(validate), затем doctor -> inspect повторно, затем отдельный recover каждого плана: пять валидаций на план. Непосредственно профилировано 1019 Git-процессов без вложенных recover: interpret-trailers 468/5766мс, merge-base 200/2600мс, diff-tree 108/1454мс, show 108/1435мс; два дочерних recover ещё 3307мс. Эти числа являются наблюдением до изменений, не обещанием скорости.",
      "acceptance_criteria": [
        "Первый шаг следующей сессии: task:start T001 со своим доставленным --session; прочитать данный план, действующие спецификации и свежий git status. Не начинать реализацию в исходной сессии подготовки.",
        "Сверить checkout/постоянный app, повторить сопоставимый baseline отдельно для startup, переключения внутри проекта и смены проекта; фиксировать локальное время без задержки MCP-инструментов и без сетевой загрузки ChatGPT.",
        "В docs/modules/session-opening-performance.md закрепить владельцев Workspace & Sessions и Workflow Kit/Context Recovery, facade, входы workspace/sessionId/planId/revision и navigation generation, выходы выбранная проекция/фоновая готовность/ошибка, границы быстрых чтений и полной проверки.",
        "Начать с готовых средств Git и существующего worker: https://git-scm.com/docs/pretty-formats (%(trailers:only,unfold)); https://www.electronjs.org/docs/latest/tutorial/performance. Проверить совместимость локального macOS и поставляемого Windows Git; без новых зависимостей и постоянной службы кэширования.",
        "Зарегистрировать спецификацию в MODULES и DOCUMENTATION_INDEX, после создания сделать её required в context_pack через plan:apply; уточнить пути остальных задач до правок. Повторное продуктовое согласование нужно только при новом противоречии, принятый сценарий не переобсуждать."
      ],
      "expected_commit_message": "docs: specify fast session opening and performance targets"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "session-opening-performance-029",
        "task_id": "T002",
        "role": "implementation"
      },
      "dependencies": [
        "T001"
      ],
      "functional_paths": [
        ".harness/kit/lib/git.mjs",
        "resources/workflow-kit/lib/git.mjs",
        "tests/workflow-kit-recovery.test.mjs"
      ],
      "documentation_paths": [
        "docs/modules/session-opening-performance.md",
        "docs/modules/workflow-kit-recovery.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "suite"
      ],
      "id": "T002",
      "title": "Сократить число процессов Git при проверке истории",
      "why": "Основная стоимость создаётся множеством коротких Git-процессов на каждый коммит и повторным чтением неизменяемых объектов.",
      "acceptance_criteria": [
        "Пакетное чтение истории использует штатные средства Git вместо отдельного interpret-trailers для каждого коммита; проверить эквивалентность для дубликатов, continuation lines, Unicode, пустых trailers и Workflow-Iteration.",
        "Сократить повторные чтения объектов/путей и проверки ancestry только там, где это подтверждает профиль; сохранять baseline, нелинейную историю, замену refs/объектов и корректность legacy plan paths. Не заменять Git самодельным парсером истории.",
        "Сохраняются отказы при неоднозначных ссылках, неверном составе коммита и порядке зависимостей; обе копии ядра совпадают. Профиль показывает реальное уменьшение процессов и времени."
      ],
      "expected_commit_message": "perf: batch workflow git history reads"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "session-opening-performance-029",
        "task_id": "T003",
        "role": "implementation"
      },
      "dependencies": [
        "T002"
      ],
      "functional_paths": [
        ".harness/kit/lib/actions.mjs",
        "resources/workflow-kit/lib/actions.mjs",
        ".harness/kit/lib/validate.mjs",
        "resources/workflow-kit/lib/validate.mjs",
        ".harness/kit/lib/recovery.mjs",
        "resources/workflow-kit/lib/recovery.mjs",
        ".harness/kit/lib/installer.mjs",
        "resources/workflow-kit/lib/installer.mjs",
        "resources/workspace-setup-worker.mjs",
        "tests/workspace-setup.test.mjs",
        "tests/workflow-kit-recovery.test.mjs"
      ],
      "documentation_paths": [
        "docs/modules/session-opening-performance.md",
        "docs/WORKSPACE_SETUP.md",
        "docs/modules/workflow-kit-recovery.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "suite"
      ],
      "id": "T003",
      "title": "Устранить повторную полную валидацию в одной проверке",
      "why": "Один переход сейчас повторяет validate в status/recover, повторяет inspect внутри doctor и снова собирает каждый recovery.",
      "acceptance_criteria": [
        "Один согласованный результат проверки плана/истории и COMPLETE recovery переиспользуется в пределах одного inspect без пяти повторов; публичные CLI-ответы и диагностика совместимы.",
        "Проверяются отпечатки до и после чтения. Изменившиеся HEAD, план, config, документы, index или transaction запрещают выдавать старый успех за готовность нового состояния; допускается ограниченный повтор.",
        "Не вводить отключение validation или доверие к произвольному внешнему объекту. Полная диагностика продолжает охватывать все канонические планы; доступный для просмотра старый чат не объявляется готовым к отправке контекста.",
        "Профиль и regression подтверждают неизменность смысловых ошибок, COMPLETE и commit references при значительном уменьшении работы."
      ],
      "expected_commit_message": "perf: reuse workflow validation within workspace inspection",
      "file_limit_exception": "Одна проверяемая часть изменения фасада; установленные и поставляемые файлы ядра меняются синхронно вместе с профильными проверками. Пути уточнить через plan:apply до правок."
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "session-opening-performance-029",
        "task_id": "T004",
        "role": "implementation"
      },
      "dependencies": [
        "T003"
      ],
      "functional_paths": [
        "src/workspace-readiness.mjs",
        "src/workspace-setup.mjs",
        "tests/workspace-readiness.test.mjs"
      ],
      "documentation_paths": [
        "docs/modules/session-opening-performance.md",
        "docs/WORKSPACE_SETUP.md",
        "docs/modules/workspace-sessions.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "suite"
      ],
      "id": "T004",
      "title": "Переиспользовать готовность неизменившегося проекта",
      "why": "При обычном переходе между сессиями одной папки не требуется запускать одинаковую полную диагностику заново.",
      "acceptance_criteria": [
        "Использовать небольшой ограниченный кэш в памяти и одну общую выполняемую проверку для одинакового состояния workspace; сначала переиспользовать текущие фасады, новый узкий helper допустим только по необходимости.",
        "Ключ/проверка актуальности учитывают канонический корень, Git HEAD/index/состояние изменений и relevant refs/config, инвентарь и содержимое планов, revision, required-документы, workflow config, manifest/owned files/hooks/launcher, transaction и версию bundled Kit; одного TTL, mtime или числа файлов недостаточно.",
        "Создание, bind, archive, удаление плана, upgrade/Doctor, изменения файлов и перезапуск сбрасывают соответствующее состояние; ошибки допускают повтор. Проверка завершившегося старого состояния не заполняет кэш для нового.",
        "Кэш readiness не подменяет адресованный кэш recovery. Объём памяти и фоновых процессов ограничен, просроченные работы не накапливаются. Первое подключение/установка/repair продолжают полный строгий путь."
      ],
      "expected_commit_message": "perf: reuse unchanged workspace readiness"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "session-opening-performance-029",
        "task_id": "T005",
        "role": "implementation"
      },
      "dependencies": [
        "T004"
      ],
      "functional_paths": [
        "src/main.mjs",
        "src/workspace-session.mjs",
        "src/ui/index.html",
        "tests/workspace-session.test.mjs",
        "tests/electron-smoke.mjs"
      ],
      "documentation_paths": [
        "docs/modules/session-opening-performance.md",
        "docs/modules/workspace-sessions.md",
        "docs/WORKSPACE_SETUP.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "workspace",
        "electron-smoke"
      ],
      "id": "T005",
      "title": "Ускорить показ плана и открытие выбранного чата",
      "why": "Полная проверка сейчас блокирует выбор сессии, показ плана и начало browser.loadURL; общая очередь IPC задерживает последующие переключения.",
      "acceptance_criteria": [
        "У подключённого проекта быстро проверить путь, project identity и выбранный session/plan, показать свежую каноническую проекцию и начать открытие сохранённого URL до окончания тяжёлой диагностики. Быстрый путь не исполняет непроверенный код workspace; использует доверенный фасад или проверенную целостность.",
        "Запуск приложения, переход между сессиями и смена проекта используют один согласованный путь. Полная проверка имеет ненавязчивый фоновый статус; ошибка показывается явно с возможностью повтора/Доктора, чужой план не подставляется.",
        "Последний выбор побеждает при A→B→A, смене workspace и закрытии окна. Старые проверки не меняют текущие sessionId, план, URL, health или recovery. Долгие чтения не удерживают общую очередь; атомарность записей session store сохраняется.",
        "Сохраняются Chat/Work, NONE, подготовленные планы, отмена выбора, порядок дерева, три строки/прокрутка, темы и тонкие линии релиза 0.6.28; профиль/реальные чаты не сбрасываются."
      ],
      "expected_commit_message": "perf: show selected sessions before background verification",
      "file_limit_exception": "Одна проверяемая часть изменения фасада; установленные и поставляемые файлы ядра меняются синхронно вместе с профильными проверками. Пути уточнить через plan:apply до правок."
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "session-opening-performance-029",
        "task_id": "T006",
        "role": "implementation"
      },
      "dependencies": [
        "T005"
      ],
      "functional_paths": [
        "src/context-session.mjs",
        "src/context-cache.mjs",
        "src/context-inputs.mjs",
        "src/session-plans.mjs",
        "tests/context-session.test.mjs",
        "tests/context-cache.test.mjs"
      ],
      "documentation_paths": [
        "docs/modules/session-opening-performance.md",
        "docs/CONTEXT_DELIVERY.md",
        "docs/modules/workspace-sessions.md",
        "docs/modules/workflow-kit-recovery.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "context",
        "suite"
      ],
      "id": "T006",
      "title": "Согласовать фоновую готовность и доставку контекста",
      "why": "Раннее открытие сохранённого чата должно сохранить строгую актуальность и правильного владельца любого нового recovery.",
      "acceptance_criteria": [
        "Просмотр сохранённого чата не ждёт MCP/tunnel и нового полного recovery; при переходе не возникает повторной отправки контекста.",
        "Новая Chat/Work и явное обновление контекста ждут актуальной готовности и канонического COMPLETE packet именно выбранных workspace/sessionId/planId/revision. Существующие experience/URL, draft/generation, duplicate-send и before-Send guards сохраняются.",
        "Отмена/ошибка/устаревший результат фоновой проверки не разрешают отправку. Изменения между прогревом и отправкой вызывают адресованную повторную проверку без бесконечного цикла.",
        "Устранить подтверждённые повторные вычисления ключа warm/load, если они ещё заметны; не создавать второй сборщик контекста в оболочке, не менять внешний Codex Local runtime."
      ],
      "expected_commit_message": "fix: gate context delivery on current session readiness",
      "file_limit_exception": "Одна проверяемая часть изменения фасада; установленные и поставляемые файлы ядра меняются синхронно вместе с профильными проверками. Пути уточнить через plan:apply до правок."
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "session-opening-performance-029",
        "task_id": "T007",
        "role": "implementation"
      },
      "dependencies": [
        "T006"
      ],
      "functional_paths": [
        ".harness/kit/lib/common.mjs",
        "resources/workflow-kit/lib/common.mjs",
        ".harness/kit/lib/installer.mjs",
        "resources/workflow-kit/lib/installer.mjs",
        "resources/project-doctor/core.mjs",
        "tests/workspace-setup.test.mjs",
        "tests/project-doctor.test.mjs",
        "tests/workflow-kit-source.test.mjs"
      ],
      "documentation_paths": [
        "docs/modules/session-opening-performance.md",
        "docs/WORKSPACE_SETUP.md",
        "docs/modules/project-doctor.md",
        "docs/modules/workflow-kit-recovery.md",
        "docs/SOURCE_WORKSPACES.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "suite"
      ],
      "id": "T007",
      "title": "Сохранить установку и диагностику обновлённого Workflow Kit",
      "why": "Изменённое ядро должно штатно поставляться и проверяться без stale manifest и без ослабления Доктора.",
      "acceptance_criteria": [
        "Версию Kit и совместимость обновления с 1.4.0 выбрать по фактическим изменениям; установленный и bundled комплект синхронны, manifest обновляется штатным подтверждённым upgrade/Doctor, хеши вручную не легализуются.",
        "Свежая установка, upgrade, явная полная проверка и Doctor обнаруживают повреждения всех планов, hooks, owned files и обязательных документов, сохраняют backup, commit references и чужие изменения.",
        "Задача ограничена совместимостью затронутых интерфейсов: не переделывать Doctor или установщик сверх необходимого. До запуска локального project code подтверждается целостность.",
        "Проверить macOS launcher и Windows portable Node/Git; никаких правок WF001, внешнего MCP/tunnel, профилей или пользовательских VM."
      ],
      "expected_commit_message": "fix: preserve kit upgrade and diagnostics after performance changes",
      "file_limit_exception": "Одна проверяемая часть изменения фасада; установленные и поставляемые файлы ядра меняются синхронно вместе с профильными проверками. Пути уточнить через plan:apply до правок."
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "session-opening-performance-029",
        "task_id": "T008",
        "role": "implementation"
      },
      "dependencies": [
        "T007"
      ],
      "functional_paths": [
        "tests/session-opening-performance.test.mjs",
        "tests/electron-smoke.mjs",
        "tests/workspace-readiness.test.mjs",
        "tests/session-plans.test.mjs"
      ],
      "documentation_paths": [
        "docs/modules/session-opening-performance.md",
        "docs/VERIFICATION.md",
        "docs/CONTEXT_DELIVERY.md"
      ],
      "verification_ids": [
        "suite",
        "electron-smoke"
      ],
      "id": "T008",
      "title": "Проверить корректность и достигнутую скорость",
      "why": "Ускорение подтверждается воспроизводимыми измерениями и отсутствием потери принадлежности планов.",
      "acceptance_criteria": [
        "Измерить минимум 30 обычных переключений и 5 перезапусков на сопоставимом проекте с двумя планами; указать окружение, revisions, число задач/коммитов, raw samples, медиану/p95 для переключений, диапазон запусков, число процессов Git и фоновой работы.",
        "Цели на текущем Mac: p95 от клика до свежего своего плана и начала loadURL не более 1с; после готовности оболочки до выбранного плана/начала loadURL не более 2с при каждом из 5 запусков; полное preview не менее чем на 60% быстрее сопоставимого baseline 16.1–16.5с. Измерить также полный app-start-to-plan, чтобы не скрыть задержку до shell-ready. Сетевую готовность ChatGPT указать отдельно.",
        "Fixtures покрывают разные workspace, два незавершённых и выполненный/подготовленный планы, NONE, A→B→A во время проверки, закрытие окна, изменения файлов/HEAD/index/планов/транзакции во время проверки и перед Send, отказ stale cache, повтор ошибки, отсутствие дубликатов и неверного владельца.",
        "Проверить масштабирование истории/числа планов и повторные переключения: они не создают очередь одинаковых проверок. Тайминги тестов в CI не выдавать за замеры реального packaged приложения.",
        "Полные Node suite и Electron smoke проходят; проверки повреждений используют только изолированные fixtures. При недостижении целей продолжить оптимизацию подтверждённого узкого места в этом плане, не выдавать цель за результат."
      ],
      "expected_commit_message": "test: verify fast session opening and stale result isolation",
      "file_limit_exception": "Одна проверяемая часть изменения фасада; установленные и поставляемые файлы ядра меняются синхронно вместе с профильными проверками. Пути уточнить через plan:apply до правок."
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "session-opening-performance-029",
        "task_id": "T009",
        "role": "implementation"
      },
      "dependencies": [
        "T008"
      ],
      "functional_paths": [
        "package.json",
        "package-lock.json"
      ],
      "documentation_paths": [
        "docs/modules/session-opening-performance.md",
        "docs/RELEASE.md",
        "docs/TRANSFER_TO_WINDOWS.md",
        "docs/SOURCE_WORKSPACES.md",
        "docs/VERIFICATION.md"
      ],
      "verification_ids": [
        "suite",
        "electron-smoke"
      ],
      "id": "T009",
      "title": "Собрать и проверить релиз для пользователя",
      "why": "Ускорение должно присутствовать в постоянном приложении и обеих поставках.",
      "acceptance_criteria": [
        "Перед сборкой сверить актуальные source/app версии и параллельные изменения; следующий номер выбрать по фактам, не перезаписывать более новый app старым кодом.",
        "Штатно собрать macOS arm64 и Windows x64; обновить постоянный Project Web Pilot.app с сохранением filesystem identity/Finder-алиаса; подготовить отдельные ZIP и подтвердить hashes/source/staging/installed.",
        "Повторить ключевые замеры packaged приложения на изолированном профиле и сравнить с T008; обычный профиль и облачные чаты сохраняются. Не объявлять native Windows/чистые VM проверки пройденными без их выполнения.",
        "После всех изменений прогнать обязательные Node suite и Electron smoke, сохранить evidence и инструкции короткой пользовательской проверки запуска/переключения/нового контекста."
      ],
      "expected_commit_message": "build: release faster session and plan opening"
    },
    {
      "implementation_status": "TODO",
      "commit_status": "PENDING",
      "commit_ref": {
        "scope_id": "session-opening-performance-029",
        "task_id": "DOCS",
        "role": "implementation"
      },
      "dependencies": [
        "T001",
        "T002",
        "T003",
        "T004",
        "T005",
        "T006",
        "T007",
        "T008",
        "T009"
      ],
      "functional_paths": [],
      "documentation_paths": [
        "docs/modules/session-opening-performance.md",
        "docs/architecture/OVERVIEW.md",
        "docs/MODULES.md",
        "docs/DOCUMENTATION_INDEX.md",
        "README.md",
        "AGENTS.md",
        "docs/PRODUCT.md",
        "docs/DECISIONS.md",
        "docs/WORKFLOW_START.md",
        "docs/architecture/ARCHITECTURE.md",
        "docs/WORKSPACE_SETUP.md",
        "docs/CONTEXT_DELIVERY.md",
        "docs/modules/workspace-sessions.md",
        "docs/modules/workflow-kit-recovery.md",
        "docs/modules/session-owned-plans.md",
        "docs/modules/project-doctor.md",
        "docs/modules/runtime-lifecycle.md",
        "docs/PROJECT_ARCHIVE.md",
        "docs/RELEASE.md",
        "docs/TRANSFER_TO_WINDOWS.md",
        "docs/SOURCE_WORKSPACES.md",
        "docs/CLEAN_INSTALL.md",
        "docs/VERIFICATION.md",
        ".harness/kit/WORKFLOW.md",
        "resources/workflow-kit/WORKFLOW.md",
        ".harness/kit/templates/AGENTS.md",
        "resources/workflow-kit/templates/AGENTS.md",
        ".harness/kit/templates/START.md",
        "resources/workflow-kit/templates/START.md",
        ".harness/kit/templates/PLAN.md",
        "resources/workflow-kit/templates/PLAN.md",
        ".harness/plans/todo-plan.template.md"
      ],
      "verification_ids": [],
      "id": "DOCS",
      "title": "Актуализация всех документов проекта",
      "why": "Перед предъявлением результата пройти весь действующий каталог документов и отразить реализованное поведение и измерения.",
      "acceptance_criteria": [
        "Проверить все документы из DOCUMENTATION_INDEX, обновить только устаревшее и ссылки; методы измерения, реальные времена, границы гарантии и непроведённые платформенные проверки изложены явно.",
        "Инструкции и шаблоны согласованы с быстрым показом сессии, фоновым readiness и строгой доставкой контекста; если тексты ядра менялись, installed/bundled синхронны. Никакие изменения документации не отменяют адресацию планов и отдельные commits задач.",
        "Подготовленная ссылка из исходной сессии и собственный план новой сессии сохраняют одну идентичность. Этот scope остаётся доступным после завершения; архивирование и новая сессия не происходят автоматически."
      ],
      "expected_commit_message": "docs: update project documentation for fast session opening"
    }
  ],
  "blocked_reason": null,
  "user_decisions": [
    {
      "id": "bea9c638-731f-4ebb-8a9a-1f81fa2cfb14",
      "text": "17.09.2026 пользователь одобрил результаты диагностики задержки проверки проекта и прямо поручил подготовить отдельный план следующей сессии с микрозадачами для существенного сокращения времени отображения выбранной сессии и её плана. Сейчас разрешена только подготовка через plan:prepare; реализация и сборка — в следующей сессии. Собственный завершённый план исходной сессии сохраняется, не архивируется и не заменяется. Создание следующей Chat/Work выполняет пользователь вручную через карточку подготовленного плана.",
      "recorded_at": "2026-09-17T10:08:58.792Z"
    }
  ],
  "owner_session_id": null,
  "prepared_in_session_id": "web-pilot-7e2e05c8-d094-4e09-b7a9-21ecb50c51b4"
}
```
<!-- workflow-state:end -->

## Состояние

Execution Scope Status: ACTIVE
Delivery Status: IN_PROGRESS
Scope: session-opening-performance-029
Current Task: нет
Revision: 2

## Цель

Быстрое открытие сессий и планов

## Критерии приёмки

- При обычном переключении подключённого проекта свежий собственный план и начало загрузки нужного чата появляются без ожидания полной диагностики всей папки; при NONE не подставляется чужой план.
- Цели на текущем Mac: p95 локального показа/начала навигации <=1с по 30 переключениям; <=2с после shell-ready на 5 стартах, с отдельным измерением полного app startup; полная проверка на сопоставимом проекте минимум на 60% быстрее baseline 16.1–16.5с. Скорость сети ChatGPT учитывается отдельно.
- Повторы полной валидации и Git-процессов устранены; память кэша ограничена, актуальность доказана, устаревшие/ошибочные результаты не разрешают операции нового состояния.
- Правильные session/plan ownership, Chat/Work, prepared links, NONE, история, транзакции, Git hooks, COMPLETE recovery и повторная проверка перед отправкой сохранены.
- Обе копии Workflow Kit, install/upgrade/Doctor и инструкции согласованы без ослабления целостности; данные и работа других агентов сохранены.
- Node suite/Electron smoke и сопоставимые packaged замеры подтверждены; macOS app и оба ZIP подготовлены по RELEASE, все документы актуализированы.

## Микрозадачи

- [TODO] T001: Уточнить контракт ускорения и зафиксировать исходные замеры — Ожидает
  - Git Commit: [PENDING] docs: specify fast session opening and performance targets
  - Reference: session-opening-performance-029 / T001 / implementation
  - Файлы: docs/modules/session-opening-performance.md, docs/architecture/OVERVIEW.md, docs/MODULES.md, docs/DOCUMENTATION_INDEX.md, docs/WORKSPACE_SETUP.md, docs/modules/workspace-sessions.md, docs/modules/workflow-kit-recovery.md, docs/VERIFICATION.md
- [TODO] T002: Сократить число процессов Git при проверке истории — Ожидает
  - Git Commit: [PENDING] perf: batch workflow git history reads
  - Reference: session-opening-performance-029 / T002 / implementation
  - Файлы: .harness/kit/lib/git.mjs, resources/workflow-kit/lib/git.mjs, tests/workflow-kit-recovery.test.mjs, docs/modules/session-opening-performance.md, docs/modules/workflow-kit-recovery.md, docs/VERIFICATION.md
- [TODO] T003: Устранить повторную полную валидацию в одной проверке — Ожидает
  - Git Commit: [PENDING] perf: reuse workflow validation within workspace inspection
  - Reference: session-opening-performance-029 / T003 / implementation
  - Файлы: .harness/kit/lib/actions.mjs, resources/workflow-kit/lib/actions.mjs, .harness/kit/lib/validate.mjs, resources/workflow-kit/lib/validate.mjs, .harness/kit/lib/recovery.mjs, resources/workflow-kit/lib/recovery.mjs, .harness/kit/lib/installer.mjs, resources/workflow-kit/lib/installer.mjs, resources/workspace-setup-worker.mjs, tests/workspace-setup.test.mjs, tests/workflow-kit-recovery.test.mjs, docs/modules/session-opening-performance.md, docs/WORKSPACE_SETUP.md, docs/modules/workflow-kit-recovery.md, docs/VERIFICATION.md
- [TODO] T004: Переиспользовать готовность неизменившегося проекта — Ожидает
  - Git Commit: [PENDING] perf: reuse unchanged workspace readiness
  - Reference: session-opening-performance-029 / T004 / implementation
  - Файлы: src/workspace-readiness.mjs, src/workspace-setup.mjs, tests/workspace-readiness.test.mjs, docs/modules/session-opening-performance.md, docs/WORKSPACE_SETUP.md, docs/modules/workspace-sessions.md, docs/VERIFICATION.md
- [TODO] T005: Ускорить показ плана и открытие выбранного чата — Ожидает
  - Git Commit: [PENDING] perf: show selected sessions before background verification
  - Reference: session-opening-performance-029 / T005 / implementation
  - Файлы: src/main.mjs, src/workspace-session.mjs, src/ui/index.html, tests/workspace-session.test.mjs, tests/electron-smoke.mjs, docs/modules/session-opening-performance.md, docs/modules/workspace-sessions.md, docs/WORKSPACE_SETUP.md, docs/VERIFICATION.md
- [TODO] T006: Согласовать фоновую готовность и доставку контекста — Ожидает
  - Git Commit: [PENDING] fix: gate context delivery on current session readiness
  - Reference: session-opening-performance-029 / T006 / implementation
  - Файлы: src/context-session.mjs, src/context-cache.mjs, src/context-inputs.mjs, src/session-plans.mjs, tests/context-session.test.mjs, tests/context-cache.test.mjs, docs/modules/session-opening-performance.md, docs/CONTEXT_DELIVERY.md, docs/modules/workspace-sessions.md, docs/modules/workflow-kit-recovery.md, docs/VERIFICATION.md
- [TODO] T007: Сохранить установку и диагностику обновлённого Workflow Kit — Ожидает
  - Git Commit: [PENDING] fix: preserve kit upgrade and diagnostics after performance changes
  - Reference: session-opening-performance-029 / T007 / implementation
  - Файлы: .harness/kit/lib/common.mjs, resources/workflow-kit/lib/common.mjs, .harness/kit/lib/installer.mjs, resources/workflow-kit/lib/installer.mjs, resources/project-doctor/core.mjs, tests/workspace-setup.test.mjs, tests/project-doctor.test.mjs, tests/workflow-kit-source.test.mjs, docs/modules/session-opening-performance.md, docs/WORKSPACE_SETUP.md, docs/modules/project-doctor.md, docs/modules/workflow-kit-recovery.md, docs/SOURCE_WORKSPACES.md, docs/VERIFICATION.md
- [TODO] T008: Проверить корректность и достигнутую скорость — Ожидает
  - Git Commit: [PENDING] test: verify fast session opening and stale result isolation
  - Reference: session-opening-performance-029 / T008 / implementation
  - Файлы: tests/session-opening-performance.test.mjs, tests/electron-smoke.mjs, tests/workspace-readiness.test.mjs, tests/session-plans.test.mjs, docs/modules/session-opening-performance.md, docs/VERIFICATION.md, docs/CONTEXT_DELIVERY.md
- [TODO] T009: Собрать и проверить релиз для пользователя — Ожидает
  - Git Commit: [PENDING] build: release faster session and plan opening
  - Reference: session-opening-performance-029 / T009 / implementation
  - Файлы: package.json, package-lock.json, docs/modules/session-opening-performance.md, docs/RELEASE.md, docs/TRANSFER_TO_WINDOWS.md, docs/SOURCE_WORKSPACES.md, docs/VERIFICATION.md
- [TODO] DOCS: Актуализация всех документов проекта — Ожидает
  - Git Commit: [PENDING] docs: update project documentation for fast session opening
  - Reference: session-opening-performance-029 / DOCS / implementation
  - Файлы: docs/modules/session-opening-performance.md, docs/architecture/OVERVIEW.md, docs/MODULES.md, docs/DOCUMENTATION_INDEX.md, README.md, AGENTS.md, docs/PRODUCT.md, docs/DECISIONS.md, docs/WORKFLOW_START.md, docs/architecture/ARCHITECTURE.md, docs/WORKSPACE_SETUP.md, docs/CONTEXT_DELIVERY.md, docs/modules/workspace-sessions.md, docs/modules/workflow-kit-recovery.md, docs/modules/session-owned-plans.md, docs/modules/project-doctor.md, docs/modules/runtime-lifecycle.md, docs/PROJECT_ARCHIVE.md, docs/RELEASE.md, docs/TRANSFER_TO_WINDOWS.md, docs/SOURCE_WORKSPACES.md, docs/CLEAN_INSTALL.md, docs/VERIFICATION.md, .harness/kit/WORKFLOW.md, resources/workflow-kit/WORKFLOW.md, .harness/kit/templates/AGENTS.md, resources/workflow-kit/templates/AGENTS.md, .harness/kit/templates/START.md, resources/workflow-kit/templates/START.md, .harness/kit/templates/PLAN.md, resources/workflow-kit/templates/PLAN.md, .harness/plans/todo-plan.template.md

## Context Pack For This Cycle

- docs/architecture/OVERVIEW.md → Краткая архитектура проекта
- docs/MODULES.md → Модули проекта
- docs/DOCUMENTATION_INDEX.md → Каталог документации
- docs/modules/workflow-kit-recovery.md → Module Specification — Workflow Kit / Context Recovery
- docs/modules/workspace-sessions.md → Действующая модель — 0.6.28 / schema v6
- docs/modules/session-owned-plans.md
- docs/WORKSPACE_SETUP.md
- docs/CONTEXT_DELIVERY.md
- docs/modules/project-doctor.md
- docs/RELEASE.md
- docs/VERIFICATION.md

Служебные состояния меняются только командами workflow. Приёмка не архивирует scope.
