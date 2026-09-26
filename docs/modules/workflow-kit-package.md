# Workflow Kit Package — техническая спецификация

## 1. Назначение

`@webpilot/workflow-kit` — canonical Node.js package существующего Workflow Kit.

Он должен одновременно поддерживать:

- CLI Workflow Kit;
- installer/upgrade в обычный project workspace;
- programmatic imports для доверенных локальных клиентов, прежде всего WebPilot и будущего ChatGPT MCP App adapter;
- получение self-contained runtime payload для упаковки приложений.

Package не меняет модель данных Workflow Kit и не становится отдельным сервисом.

## 2. Canonical layout

Целевая структура первого этапа:

```text
WorkflowKit/
├── package.json
├── src/
│   ├── WORKFLOW.md
│   ├── cli.mjs
│   ├── install.mjs
│   ├── lib/
│   ├── schemas/
│   ├── templates/
│   └── examples/
├── scripts/
├── tests/
└── docs/
```

Первичный `src/` создаётся из текущего Workflow Kit 1.4.12 без изменения поведения.

## 3. Package identity

Начальное имя: `@webpilot/workflow-kit`.

Начальная версия package: `1.4.12`.

На первом этапе package остаётся private/local и не требует npm publication.

Node.js: >= 22, как у текущего Workflow Kit.

## 4. Public surface v1

Цель первого выделения — совместимость, а не немедленное скрытие всех внутренних модулей.

Обязательные точки:

- CLI/bin `workflow`;
- package root / version;
- installer;
- session plans;
- plan read/projection;
- recovery/context packet;
- actions, необходимые существующему WebPilot;
- schemas/templates как package resources.

Допускаются subpath exports, которые отображают существующие модули `src/lib/*.mjs`, чтобы WebPilot можно было мигрировать без переписывания Workflow Kit.

После успешной миграции public API можно сузить отдельной задачей.

## 5. Installed runtime

Обычный подключённый проект по-прежнему получает:

```text
<project>/.harness/kit/
<project>/scripts/workflow*
<project>/.harness/kit-manifest.json
```

Это installed runtime snapshot, созданный installer-ом canonical package.

Инварианты:

- runtime содержит версию package;
- runtime не редактируется вручную как source;
- upgrade выполняется существующей безопасной логикой manifest/hash;
- canonical package остаётся единственным местом разработки.

## 6. Self-hosting репозитория WorkflowKit

Текущий репозиторий сам использует Workflow Kit и поэтому имеет `.harness/kit`.

На первой миграции не удалять этот runtime. Сначала package должен доказать эквивалентность и возможность безопасно генерировать/update установленный runtime.

Разрешается временное физическое сосуществование `src/` и `.harness/kit`, но:

- source of truth только `src/`;
- проверка должна ловить случайное расхождение;
- изменение `.harness/kit` напрямую не считается разработкой package.

Удаление или специальный self-host режим допускается только отдельным последующим решением, если это реально упрощает систему.

## 7. Подключение WebPilot

Текущее состояние подтверждено:

- WebPilot `resources/workflow-kit` и текущий Kit 1.4.12 побайтно/структурно совпадают по `diff -qr`;
- обе директории содержат 35 файлов;
- WebPilot напрямую импортирует `resources/workflow-kit` из `src/session-plans.mjs` и нескольких тестов;
- `resources/workspace-setup-worker.mjs` импортирует installer и другие модули из `./workflow-kit/lib/*`;
- Electron packaging включает весь `resources` каталог, а Windows verifier проверяет наличие `resources/resources/workflow-kit/WORKFLOW.md`.

Целевое состояние:

### Development

WebPilot подключает `@webpilot/workflow-kit` из canonical local package.

Runtime-код и тесты импортируют package exports, а не repository-owned copy.

### Packaged application

Готовое приложение обязано быть self-contained и не зависеть от соседней папки `/VSCODE/WorkflowKit`.

Перед Electron packaging build step получает runtime payload из resolved package и stage-ит его в resources сборки.

Staged runtime — build artifact. Он не является вторым source repository.

### Version check

Сборка/тест должны падать, если staged Workflow Kit version не равна resolved package version.

## 8. Способ локальной зависимости

Для первой миграции предпочтителен простой local file dependency на canonical repo/package.

Точный npm-механизм фиксируется во время T001 после минимального package spike с учётом Electron packager и Windows build.

Критерий выбора важнее синтаксиса:

- один editable source;
- обычный `npm install`/подготовка development environment;
- self-contained release;
- отсутствие ручного copy step;
- воспроизводимая проверка версии.

Не вводить registry только ради этой миграции.

## 9. Проверки canonical package

Минимально обязательны:

1. baseline digest/fileset 1.4.12;
2. импорт package exports под Node 22;
3. CLI `status/recover` на fixture repo;
4. installer создаёт ожидаемый `.harness/kit`;
5. installed runtime version совпадает с package;
6. session-owned plan view/recovery работает;
7. upgrade/inspect существующей 1.4.12 установки не повреждает state;
8. package tarball/fileset не включает секреты, `.git`, runtime state или лишние project docs.

## 10. Проверки WebPilot после миграции

В workspace Project Web Pilot:

1. unit suite;
2. session plan tests;
3. workflow-kit recovery/source tests, переписанные на package contract;
4. Electron smoke;
5. Workspace Setup: inspect/install/upgrade реального test workspace;
6. macOS package verification;
7. Windows package verification;
8. проверка, что готовый package содержит Workflow Kit нужной версии и запускает workspace setup без sibling WorkflowKit repo.

## 11. Rollback

До удаления WebPilot duplicate:

- canonical package должен пройти собственные проверки;
- WebPilot dependency path должен быть подтверждён в development;
- packaging staging должен быть подтверждён.

Миграция WebPilot выполняется отдельным коммитом/серией микрозадач его собственного плана. При отказе WebPilot остаётся на последнем рабочем commit с bundled 1.4.12.

## 12. Future consumer

Будущий ChatGPT MCP App adapter импортирует canonical package через тот же dependency contract.

Он не получает `resources/workflow-kit` и не содержит business logic Workflow Kit.

## 13. Consumer contract v1

Canonical package предоставляет два уровня подключения.

### Programmatic imports

Основные клиенты используют package name и subpath exports:

```js
import { VERSION, getRuntimeRoot } from '@webpilot/workflow-kit';
import { sessionPlanView } from '@webpilot/workflow-kit/lib/session-plans';
import { contextPacket } from '@webpilot/workflow-kit/lib/recovery';
```

Для миграции WebPilot подтверждены subpath exports, которые покрывают его текущие прямые зависимости: `common`, `actions`, `session-plans`, `plan`, `transaction`, `installer`, `inspection-inputs`, `installation-files`, `git`.

### Runtime resource

`getRuntimeRoot()` возвращает абсолютный путь к 35-файловому runtime payload текущей версии. Этот каталог можно автоматически скопировать в staging Electron resources:

```js
import fs from 'node:fs/promises';
import { getRuntimeRoot } from '@webpilot/workflow-kit';

await fs.cp(getRuntimeRoot(), stageDirectory, { recursive: true });
```

Копия в staging/package является build artifact. В Git WebPilot она не является редактируемым исходником.

### Development dependency WebPilot

Для следующей сессии допускается локальная dependency:

```json
{
  "dependencies": {
    "@webpilot/workflow-kit": "file:../WorkflowKit"
  }
}
```

Это решение выбрано для локальной разработки без npm registry. Если позже понадобится независимый clean-clone build на другой машине, transport package можно заменить на Git/npm source без изменения consumer API.

### Packaging rule WebPilot

Перед `start/test/build`, где нужен relative runtime resource, WebPilot должен автоматически stage-ить текущий `getRuntimeRoot()` в свой generated resources path. Перед Electron packaging staging выполняется обязательно, а verifier проверяет VERSION и runtime digest/fileset.

Исходная папка `resources/workflow-kit` после миграции не должна оставаться tracked source. Если этот путь нужен существующему worker-у, он используется только как generated staging directory.

### Проверенная переносимость

`scripts/check-consumer-contract.mjs` проверяет два режима:

1. установка package через локальную `file:` dependency и imports по package name;
2. `npm pack` → установка tarball в изолированный consumer → import без доступа к sibling WorkflowKit workspace → staging 35-файлового runtime.

Это доказывает, что package можно использовать локально как always-current dependency и выдавать как self-contained artifact.

