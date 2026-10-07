# Workflow Kit

Пакет @webpilot/workflow-kit версии **1.6.0** внутри репозитория Project Web Pilot. Даёт агенту один текущий план на Git checkout/worktree, проверяемые коммиты задач и восстановление контекста. Требует Node.js 22+; приложение использует Node 24.21.0.

## Установка и запуск
Из корня репозитория:

```bash
npm ci
node packages/workflow-kit/src/install.mjs --project /absolute/project/path
```

Для совместимой установки — та же команда с --update. Установщик проверяет файлы и создаёт резервную копию; неизвестные изменения не перезаписывает. .harness/kit — установленная копия, её вручную не редактируют. Источник — packages/workflow-kit/src; resources/workflow-kit создаётся автоматически для приложения.

В проекте:
```bash
./scripts/workflow status
./scripts/workflow recover --format text
./scripts/workflow plan:create --help
./scripts/workflow task:start T001
./scripts/workflow commit --task T001
```
На Windows PowerShell/CMD используется scripts/workflow.cmd. Реальные задачи и проверки сначала определяются в плане.

## Работа с проектом
- Обсуждение/исследование не требуют плана. docs:commit фиксирует документы вне .harness/ при NONE или idle ACTIVE; во время задачи запрещён.
- Новый chat продолжает текущий todo-plan.md. Независимая работа — отдельный worktree.
- plan:extend добавляет работу без изменения DONE. before допустим перед не начатой задачей.
- DOCS предшествует явно заказанному выпуску. Новый раунд выпуска получает новую запись DOCS; без выпуска обязательная DOCS не создаётся.
- Архивирование — только по команде пользователя. Прежний план читается из Git, архивные копии не создаются.
- Recovery передаёт целые выбранные документы и проекцию задач; коммиты/диффы читаются по необходимости. Формы PLAN/SPEC/CONTINUE/STAGES доступны через --help.
- Один предел budget.document_bytes, по умолчанию 28000 байт UTF-8, применяется к Markdown и каждой части пакета. Общий recovery — до 180000 байт и до 7 частей, без усечения. Ошибка размера не удаляет правки.

## Проверка и интеграция
```bash
npm run check --prefix packages/workflow-kit
npm test
```

Первая команда проверяет пакет, внешний consumer, установку/обновление, Git lifecycle, документы и recovery полного проекта. Вторая запускает корневые тесты Web Pilot; проверки взаимно не заменяются.

Programmatic API и контракты — [спецификация пакета](docs/modules/workflow-kit-package.md). Web Pilot поставляет самодостаточную копию getRuntimeRoot(), не зависит от соседнего checkout. Внешний Web Pilot Sidebar использует browser-адаптер клиента; его workspace здесь не изменяется.

[README приложения](../../README.md), [recovery](../../docs/modules/workflow-kit-recovery.md), [переход текущего проекта](../../docs/planning/workflow-kit-context-transition.md). Факты поставки и хеши находятся в release-manifest.json/GitHub Release; прежние версии документов — в Git.
