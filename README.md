# WorkflowKit

WorkflowKit — canonical Node.js package `@webpilot/workflow-kit` для управления состоянием проекта, current plan, recovery context и lifecycle задач в одном Git checkout/worktree.

Текущая версия: **1.5.1**. Текущая рабочая среда и Project Web Pilot используют **Node.js 24.21.0**. Минимальное требование самого пакета остаётся **Node.js 22+** (`engines.node: >=22`); Node 24 соответствует этому требованию.

## Связанные репозитории

- [WorkflowKit](https://github.com/OleynikAleksandr/WorkflowKit) — этот репозиторий, единственный редактируемый source of truth для Workflow Kit.
- [Project Web Pilot](https://github.com/OleynikAleksandr/Project-Web-Pilot) — Electron-клиент, который использует WorkflowKit как dependency и staging runtime.
- [Web Pilot Sidebar](https://github.com/OleynikAleksandr/Web-Pilot-Sidebar) — отдельное расширение браузера; проекты и current plan остаются у Web Pilot и WorkflowKit.

## Основная модель

Один Git checkout/worktree имеет один current plan:

```text
.harness/plans/todo-plan.md
```

Chat, Web Pilot session или другой клиент не владеют plan и не выбирают его. Новый chat продолжает current state текущего checkout. Для независимой параллельной работы используется отдельный Git worktree.

Legacy `by-id/by-session` после upgrade сохраняются только как read-only history и не участвуют в normal runtime selection.

## Исходники и пакет

```text
@webpilot/workflow-kit
├── index.mjs
├── src/
├── scripts/
└── .harness/kit/
```

Дерево выше описывает репозиторий. Публичный runtime пакета — `index.mjs` и `src/`; `scripts/` служит проверкам разработки, а `.harness/kit/` — производная self-host установка. Они не являются второй редактируемой копией runtime.

Основные consumer API:

- `currentPlanView(root)` — current checkout-scoped plan;
- `sessionPlanView(root, sessionId)` — transition compatibility для старых Web Pilot records;
- `getRuntimeRoot()` — self-contained runtime payload для staging;
- CLI `workflow` — lifecycle команд Workflow Kit.

## Проверка

```bash
npm install
npm run check
node scripts/check-runtime-fixture.mjs
node scripts/check-consumer-contract.mjs
```

Canonical runtime 1.5.1 содержит 35 файлов; SHA-256: `93de6bb6362dfe968f971922a24028886780a8df6b773730f721c7489532dd33`.

Исходный [GitHub Release WorkflowKit 1.5.1](https://github.com/OleynikAleksandr/WorkflowKit/releases/tag/v1.5.1) сохраняет опубликованный тег; последующие документальные обновления находятся в main.

## Документация

- [PRODUCT](docs/PRODUCT.md) — продуктовый контракт.
- [Architecture overview](docs/architecture/OVERVIEW.md) — компактная архитектура.
- [Modules](docs/MODULES.md) — карта модулей.
- [Workflow Kit package](docs/modules/workflow-kit-package.md) — технический контракт package/runtime.
- [Single active plan migration](docs/planning/single-active-plan-migration.md) — переход к одному current plan на checkout.
- [Documentation index](docs/DOCUMENTATION_INDEX.md) — полный индекс документации.

## Интеграция с Project Web Pilot

Project Web Pilot подключает WorkflowKit как локальную dependency `@webpilot/workflow-kit` и включает runtime в готовые macOS/Windows приложения. Изменения кода Kit вносят здесь; `resources/workflow-kit` клиента — производная сборочная копия.

Текущий локальный macOS-клиент — **Web Pilot 0.6.80**; последняя опубликованная парная macOS/Windows поставка — [0.6.78](https://github.com/OleynikAleksandr/Project-Web-Pilot/releases/tag/v0.6.78). Обе используют Kit **1.5.1** с прежними 35 файлами runtime и SHA-256. Клиент, среда разработки, проверки и комплектные workers используют **Node 24.21.0**. Минимальное требование самого пакета Kit остаётся **Node 22+**.

Локальные 0.6.79/0.6.80 добавили постоянную Apple Development подпись UkrHD и строгую проверку macOS bundle/ZIP. Живой MCP-захват сохранился после обновления и настоящей перезагрузки; пользователь подтвердил работоспособность и отсутствие новых запросов. Это изменение упаковки клиента, без изменения API/CLI, runtime или версии Kit. Windows 0.6.80 и публикация 0.6.80 не выполнялись. [Контракт исправления](https://github.com/OleynikAleksandr/Project-Web-Pilot/blob/main/docs/planning/macos-screen-permission-stability.md).

Автовыполнение полностью принадлежит клиенту. Переключатель можно менять в любой момент; при включённом режиме подходящая пауза незавершённого ACTIVE-плана получает одно точное «Продолжай». Выбор и защита от повторной отправки сохраняются между reload и перезапуском; черновик и ручная отправка имеют приоритет. Стартовой AutoPlan-инструкции и управляющих строк ответа нет. В 0.6.78 пауза определяется по native ID или сохраняемому наблюдаемому циклу генерации, без счётчиков DOM. При загрузке истории клиент ждёт сообщения; отменённая собственная вставка очищается с сохранением пользовательских правок. Если генерация не наблюдалась и native ID отсутствует, новая пауза не угадывается. Агент завершает ответ после проверки и коммита видимой микрозадачи; внутренние шаги другого checkout не требуют отдельного ответа. Эти правила реализованы в Web Pilot и сохраняют версию и команды Kit.

Один checkout по-прежнему имеет один current plan. Новый Chat/Work получает его recovery; сохранённый чат открывается без новой отправки. Исторические планы исключены из обычного recovery. Размер текущего пакета зависит от включённых документов и рабочих изменений; transport budget ограничивает выдачу и не сокращает автоматически историю внутри обязательных документов. Политика компактного контекста требует отдельного изменения контракта. Передача контекста использует Paste без изменения системного clipboard и завершается после Send; неизвестный результат не вызывает автоматический повтор.

Подробности: [README Web Pilot](https://github.com/OleynikAleksandr/Project-Web-Pilot/blob/main/README.md), [контракт клиентского AutoPlan](https://github.com/OleynikAleksandr/Project-Web-Pilot/blob/main/docs/planning/auto-plan-client-driven-refactor.md) и [проверки/приёмка клиента](https://github.com/OleynikAleksandr/Project-Web-Pilot/blob/main/docs/VERIFICATION.md). Сохранение ScreenCapture локальной 0.6.80 принято пользователем и подтверждено установленными mac-signature/mac-screen-capture проверками. Native Windows и чистая установка 0.6.80 не проверены. Web Pilot Sidebar остаётся отдельным 0.1.0 с тестовым хостом; его README отмечает расхождение Composer vendor lock с текущим клиентом.

## Workflow Kit 1.5.1 — перенос остатка scope

По поручению пользователя 28.09.2026 добавлена plan:carryover: архив содержит точную исходную копию со статусами TODO/DONE; новый current plan — только незавершённые задачи и DOCS. Критерии, проверки, planning/module ссылки и зависимости между оставшимися задачами сохраняются. Ссылки на выполненные зависимости хранятся в carryover metadata и архиве. Оба плана фиксируются одним Git-коммитом. Нужны чистый checkout, отсутствие активной микрозадачи, точная revision и прямое поручение. Повтор после успеха безопасен; прерывания обслуживает штатный repair. Обычный archive сохраняет требование всех DONE. Runtime: 35 файлов; SHA-256 93de6bb6362dfe968f971922a24028886780a8df6b773730f721c7489532dd33.

Проверка — scripts/check-carryover-fixture.mjs через установленный CLI: точный архив, сохранность задач, зависимости, отказы без изменения плана, повтор и прерывания до/после коммита. Входит в runtime gate. Актуальный локальный клиент — macOS Project Web Pilot 0.6.80; последняя опубликованная парная поставка — 0.6.78.
