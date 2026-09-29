# WorkflowKit

WorkflowKit — canonical Node.js package `@webpilot/workflow-kit` для управления состоянием проекта, current plan, recovery context и lifecycle задач в одном Git checkout/worktree.

Текущая версия: **1.5.1**. Требуется **Node.js 22+**.

## Связанные репозитории

- [WorkflowKit](https://github.com/OleynikAleksandr/WorkflowKit) — этот репозиторий, единственный редактируемый source of truth для Workflow Kit.
- [Project Web Pilot](https://github.com/OleynikAleksandr/Project-Web-Pilot) — Electron-клиент, который использует WorkflowKit как dependency и staging runtime.

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

## Документация

- [PRODUCT](docs/PRODUCT.md) — продуктовый контракт.
- [Architecture overview](docs/architecture/OVERVIEW.md) — компактная архитектура.
- [Modules](docs/MODULES.md) — карта модулей.
- [Workflow Kit package](docs/modules/workflow-kit-package.md) — технический контракт package/runtime.
- [Single active plan migration](docs/planning/single-active-plan-migration.md) — переход к одному current plan на checkout.
- [Documentation index](docs/DOCUMENTATION_INDEX.md) — полный индекс документации.

## Интеграция с Project Web Pilot

Project Web Pilot подключает WorkflowKit как локальную dependency `@webpilot/workflow-kit` и автоматически staging-ит runtime для packaged macOS/Windows build. Изменения WorkflowKit должны вноситься здесь, а не в generated `resources/workflow-kit` внутри Web Pilot.

Для парной поставки Web Pilot **0.6.73** используется неизменённый Kit **1.5.1**. Наблюдатель страницы, автоматическая/ручная отправка сообщений, сохранение URL разговора и восстановление связи с ChatGPT реализованы в клиенте Web Pilot. В 0.6.65 клиент также распознаёт «Resume stream unavailable» и использует прежнее ограниченное восстановление без повторной отправки. В 0.6.66 явное создание Chat/Work очищает восстановленный черновик перед своим recovery; обычный reopen его сохраняет. Кэш checkout-пакета не является буфером редактора и не требует сброса ради пустого поля. Эти изменения не меняют current plan и не входят в runtime Kit.

Web Pilot 0.6.73 добавляет явный режим автовыполнения: короткий ответ на контрольной точке, затем точное «Продолжай», пока current plan не завершён. Частично выполненный план продолжается с фактического остатка; DONE не повторяются. Подготовленная Git-транзакция не равна подтверждённому завершению. Ручной Stop, вопрос, ошибка, смена разговора и перезапуск приостанавливают клиентский режим. Эти правила реализованы в Web Pilot и не изменяют команды/версию runtime Kit.

Исторические планы исключены из обычного recovery. Размер текущего пакета зависит от включённых документов и рабочих изменений; transport budget ограничивает выдачу, но не сокращает автоматически накопленную историю внутри обязательных документов. Политика компактного контекста требует отдельного изменения контракта.

Инструкции запуска и результаты проверки клиента — в [README Web Pilot](https://github.com/OleynikAleksandr/Project-Web-Pilot/blob/main/README.md).

В Web Pilot 0.6.72 контекст по-прежнему передаётся через Paste без изменения системного clipboard. Автоматическая передача и общий индикатор завершаются сразу после Send, без поиска requestId в DOM вложения и ожидания ответа агента. Прежние неопределённые попытки не вызывают проверку или автоматический повтор. Это поведение доставки сохранено из 0.6.71; в Kit 1.5.1 добавлена отдельная команда переноса плана. Живые измерения 0.6.69 и проверки нового клиента — в VERIFICATION репозитория Web Pilot.

## Workflow Kit 1.5.1 — перенос остатка scope

По поручению пользователя 28.09.2026 добавлена plan:carryover: архив содержит точную исходную копию со статусами TODO/DONE; новый current plan — только незавершённые задачи и DOCS. Критерии, проверки, planning/module ссылки и зависимости между оставшимися задачами сохраняются. Ссылки на выполненные зависимости хранятся в carryover metadata и архиве. Оба плана фиксируются одним Git-коммитом. Нужны чистый checkout, отсутствие активной микрозадачи, точная revision и прямое поручение. Повтор после успеха безопасен; прерывания обслуживает штатный repair. Обычный archive сохраняет требование всех DONE. Runtime: 35 файлов; SHA-256 93de6bb6362dfe968f971922a24028886780a8df6b773730f721c7489532dd33.

Проверка — scripts/check-carryover-fixture.mjs через установленный CLI: точный архив, сохранность задач, зависимости, отказы без изменения плана, повтор и прерывания до/после коммита. Входит в runtime gate. Интеграция и парная поставка — Project Web Pilot 0.6.72.
