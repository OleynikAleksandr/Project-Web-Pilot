# Каталог документации

Canonical source/runtime Workflow Kit — **1.5.5** (35 файлов, SHA-256 `8eadd98869a840f670dbfb00c33350e3054d8ec7de5298b2b0beca82d787f376`). Последний отдельный GitHub Release Kit — **v1.5.1**. Текущий опубликованный клиент — **Project Web Pilot 0.6.94** с bundled Workflow Kit **1.5.5**.

<!-- workflow-kit:begin -->
## Документы проекта

| Документ | Назначение |
| --- | --- |
| .harness/kit/WORKFLOW.md | Установленный протокол Workflow Kit этого проекта |
| .harness/kit/examples/PACKAGING.md | Протокол локальной упаковки |
| .harness/kit/templates/AGENTS.md | Шаблон инструкций проекта |
| .harness/kit/templates/ARCHITECTURE.md | Шаблон архитектурного документа |
| .harness/kit/templates/CONTINUE.md | Продолжение существующего плана |
| .harness/kit/templates/PLAN.md | Форма нового плана |
| .harness/kit/templates/PRODUCT.md | Шаблон описания продукта |
| .harness/kit/templates/PROTOTYPE.md | Правила прототипирования и Git |
| .harness/kit/templates/SPEC.md | Короткий контракт результата |
| .harness/kit/templates/STAGES.md | Формы этапов Workflow Kit |
| .harness/kit/templates/START.md | Стартовый шаблон |
| .harness/plans/todo-plan.md | Единственный current plan checkout/worktree |
| .harness/plans/todo-plan.template.md | Шаблон нового current plan |
| AGENTS.md | Инструкции проекта |
| README.md | Краткое описание WorkflowKit, запуск, документация и связь с Project Web Pilot |
| docs/PRODUCT.md | Назначение canonical package и current state model |
| docs/architecture/ARCHITECTURE.md | Архитектура package, single-active plan и legacy history |
| docs/architecture/OVERVIEW.md | Компактный recovery-обзор текущей архитектуры |
| docs/MODULES.md | Карта модулей проекта |
| docs/modules/workflow-kit-package.md | Техническая спецификация package/runtime: canonical 1.5.5, latest отдельный Release v1.5.1, minimum Node 22+, рабочая среда Node 24 и опубликованный consumer Web Pilot 0.6.94 с bundled Kit 1.5.5 |
| docs/planning/canonical-workflow-kit-package.md | Исторический план выделения canonical package |
| docs/planning/single-active-plan-migration.md | План и результат перехода к одному current plan на checkout |
| docs/planning/delivery-ordering-policy.md | Канонический порядок DOCS → delivery и запрет незапланированных build/publish |
| docs/planning/project-rename.md | Workflow Kit 1.5.3: команда project:rename |
| docs/planning/push-after-docs.md | Workflow Kit 1.5.5: push на GitHub только после DOCS текущего плана (pre-push) |
| docs/planning/compact-recovery.md | Workflow Kit 1.5.4: компактный recovery, формы и карты по запросу |
| docs/WORKFLOW_START.md | Общий контракт старта Workflow Kit |
| docs/DOCUMENTATION_INDEX.md | Этот индекс |
<!-- workflow-kit:end -->
Перенос незавершённых scope описан в docs/modules/workflow-kit-package.md; установленный CLI проверяет scripts/check-carryover-fixture.mjs.
