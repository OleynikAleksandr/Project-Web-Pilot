# Canonical Workflow Kit Package — планировочный документ

## Статус

HISTORICAL BASELINE / SUPERSEDED BY WORKFLOW KIT 1.5.0

Дата: 2026-09-26

Этот документ сохраняет фактическую историю выделения canonical package из baseline 1.4.12. Он не является текущим workflow contract. Актуальная модель single-active plan описана в [Workflow Kit Package](../modules/workflow-kit-package.md) и [Single Active Plan Migration](single-active-plan-migration.md).

## Зачем меняем устройство

Workflow Kit 1.4.12 сейчас существует как минимум в двух фактически одинаковых исходных копиях:

- текущая установка этого репозитория: `.harness/kit`;
- встроенный исходник Project Web Pilot: `/Users/oleksandroliinyk/VSCODE/Project Web Pilot/resources/workflow-kit`.

На момент подготовки плана обе копии содержат по 35 файлов и `diff -qr` не показывает различий. WebPilot при этом напрямую импортирует модули из `resources/workflow-kit` в runtime-коде и тестах, а Electron-пакет включает эту папку в resources.

Такое устройство не масштабируется на следующий потребитель — ChatGPT MCP App adapter: третью редактируемую копию создавать нельзя.

## Целевой результат

Репозиторий `/Users/oleksandroliinyk/VSCODE/WorkflowKit` становится единственным владельцем редактируемого исходника Workflow Kit.

В нём создаётся самодостаточный Node.js package `@webpilot/workflow-kit` с текущей версией 1.4.12 как исходной точкой.

Canonical source хранится отдельно от project runtime:

```text
WorkflowKit/
├── package.json
├── src/                       # ЕДИНСТВЕННЫЙ редактируемый исходник Kit
│   ├── WORKFLOW.md
│   ├── cli.mjs
│   ├── install.mjs
│   ├── lib/
│   ├── schemas/
│   ├── templates/
│   └── examples/
├── scripts/
├── tests/
├── docs/
└── .harness/kit/              # установленный runtime этого проекта, не source of truth
```

`.harness/kit` в любом подключённом проекте остаётся допустимым installed runtime, потому что текущий Workflow Kit намеренно устанавливает локальный комплект в проект. Он не редактируется как отдельный продукт и создаётся/обновляется только из canonical package.

Аналогично физическая копия Kit внутри готового Electron-приложения допустима только как build artifact, автоматически полученный из package.

## Главные правила

1. Единственный редактируемый исходник: `WorkflowKit/src`.
2. Новая функциональность Workflow Kit сначала меняется только здесь.
3. Версия определяется package и `VERSION` одним согласованным механизмом; независимые номера версий в потребителях не поддерживаются.
4. Installed runtime `.harness/kit` — производный артефакт, а не fork.
5. WebPilot больше не владеет `resources/workflow-kit` как самостоятельным исходником.
6. WebPilot в development использует package API/subpath exports.
7. При упаковке WebPilot необходимый runtime Kit staging создаётся автоматически из той же package dependency.
8. ChatGPT MCP App adapter после этой миграции будет третьим потребителем package, но не третьей копией исходника.
9. На этом этапе не вводятся registry, daemon, отдельная БД, WebSocket, monorepo или иной новый инфраструктурный слой.

## Граница текущего проекта

Этот репозиторий отвечает за:

- canonical package;
- сохранение текущего поведения Workflow Kit;
- package exports и CLI;
- детерминированное получение installed runtime;
- тесты package/installation/recovery;
- контракт подключения внешнего потребителя.

Изменения самого Project Web Pilot выполняются после готовности package в workspace WebPilot и под его собственным Workflow Kit plan, чтобы не смешивать Git-транзакции двух репозиториев.

## Общая последовательность

### Этап A — Canonical package в этом репозитории

1. Снять baseline 1.4.12 без функциональных изменений.
2. Перенести 35 файлов текущего Kit в canonical `src/`.
3. Добавить `package.json`, bin/exports и минимальный public/compatibility surface.
4. Сохранить существующий CLI и installer semantics.
5. Проверить, что canonical package создаёт тот же installed runtime и что install / inspect / recover / session-plan операции работают.
6. Зафиксировать правило: `.harness/kit` этого репозитория — только self-hosted installed runtime.

### Этап B — Project Web Pilot

В отдельной сессии WebPilot:

1. Подключить canonical `@webpilot/workflow-kit` как локальную package dependency.
2. Перевести direct imports тестов/runtime с `resources/workflow-kit/...` на package exports.
3. Изменить workspace setup worker так, чтобы он использовал тот же package.
4. Удалить tracked source duplicate `resources/workflow-kit`.
5. Подключить `@webpilot/workflow-kit` как `file:../WorkflowKit`; programmatic imports перевести на package exports. Для существующего external workspace worker автоматически stage-ить `getRuntimeRoot()` в generated `resources/workflow-kit` перед запуском/сборкой, если относительный layout всё ещё нужен.
6. Для Electron packaging автоматически stage-ить тот же runtime Kit из resolved package в packaged resources и проверять version/fileset.
7. Проверить dev tests, Electron smoke и фактическое наличие/работу Workflow Kit в macOS/Windows package.
8. Проверить установку/upgrade Workflow Kit в тестовом проекте через пользовательский путь WebPilot.

### Этап C — новый ChatGPT MCP App adapter

Только после успешного Этапа B создать отдельный проект для ChatGPT MCP App adapter. Он подключает тот же package и не содержит копии Workflow Kit.

## Acceptance всей миграции

- canonical source существует только в WorkflowKit;
- версия и содержимое package проверяются автоматически;
- текущие команды Workflow Kit работают без регрессии;
- WebPilot development не импортирует собственную source-копию Kit;
- WebPilot repository не содержит независимо редактируемый `resources/workflow-kit`;
- собранный WebPilot остаётся самодостаточным и содержит runtime Kit, полученный автоматически из package;
- macOS и Windows package checks подтверждают наличие правильной версии Kit;
- изменение canonical Workflow Kit не требует ручного копирования файлов в WebPilot;
- будущий ChatGPT adapter может подключить тот же package.

## Что не делаем сейчас

- не создаём ChatGPT MCP App;
- не меняем workflow business logic ради рефакторинга;
- не публикуем package в npm;
- не создаём отдельный update service;
- не меняем формат Plan / Session / Recovery;
- не удаляем working runtime `.harness/kit`, пока не доказан безопасный self-host path;
- не делаем широкую переработку WebPilot одновременно с package extraction.

## Результат этой сессии

Этап A завершён: создан самостоятельный `@webpilot/workflow-kit` 1.4.12 с единственным canonical source в `src/`, package API/CLI, installer и проверенным consumer contract.

Подтверждено:

- canonical `src/` содержит исходные 35 файлов Workflow Kit 1.4.12 с baseline SHA-256 `5464b2c1528eef1de740af50558bc8db1d39cfa7838f9c032d23650fb4f5f119`;
- package устанавливает рабочий `.harness/kit` в изолированный проект;
- session-owned plan и recovery работают через установленный runtime;
- package подключается через локальную `file:` dependency;
- tarball package работает в изолированном consumer без зависимости от canonical workspace;
- `getRuntimeRoot()` даёт runtime payload для автоматического Electron staging.

## Следующий approval gate

Пользователь подтвердил текущий этап 2026-09-26. Следующая работа выполняется отдельной сессией в Project Web Pilot: заменить tracked duplicate `resources/workflow-kit` на dependency `@webpilot/workflow-kit`, сохранить generated staging для external worker/package там, где он фактически нужен, и пройти проверки WebPilot/macOS/Windows packaging.

ChatGPT MCP App adapter не начинать до успешной миграции WebPilot.

