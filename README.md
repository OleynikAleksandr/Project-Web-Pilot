# WorkflowKit

WorkflowKit — canonical Node.js package `@webpilot/workflow-kit` для управления состоянием проекта, current plan, recovery context и lifecycle задач в одном Git checkout/worktree.

Текущая версия: **1.5.0**. Требуется **Node.js 22+**.

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

Canonical runtime 1.5.0 содержит 35 файлов; SHA-256: `0db567df6f0c8f68f3119a7322b4c1c6d28cd06bf57b267993b792097bbb2c75`.

## Документация

- [PRODUCT](docs/PRODUCT.md) — продуктовый контракт.
- [Architecture overview](docs/architecture/OVERVIEW.md) — компактная архитектура.
- [Modules](docs/MODULES.md) — карта модулей.
- [Workflow Kit package](docs/modules/workflow-kit-package.md) — технический контракт package/runtime.
- [Single active plan migration](docs/planning/single-active-plan-migration.md) — переход к одному current plan на checkout.
- [Documentation index](docs/DOCUMENTATION_INDEX.md) — полный индекс документации.

## Интеграция с Project Web Pilot

Project Web Pilot подключает WorkflowKit как локальную dependency `@webpilot/workflow-kit` и автоматически staging-ит runtime для packaged macOS/Windows build. Изменения WorkflowKit должны вноситься здесь, а не в generated `resources/workflow-kit` внутри Web Pilot.

На 28.09.2026 локальная парная поставка Web Pilot **0.6.68** использует неизменённый Kit **1.5.0**. Наблюдатель страницы, автоматическая/ручная отправка сообщений, сохранение URL разговора и восстановление связи с ChatGPT реализованы в клиенте Web Pilot. В 0.6.65 клиент также распознаёт «Resume stream unavailable» и использует прежнее ограниченное восстановление без повторной отправки. В 0.6.66 явное создание Chat/Work очищает восстановленный черновик перед своим recovery; обычный reopen его сохраняет. Кэш checkout-пакета не является буфером редактора и не требует сброса ради пустого поля. Эти изменения не меняют current plan и не входят в runtime Kit.

Исторические планы исключены из обычного recovery. Размер текущего пакета зависит от включённых документов и рабочих изменений; transport budget ограничивает выдачу, но не сокращает автоматически накопленную историю внутри обязательных документов. Политика компактного контекста требует отдельного изменения контракта.

Инструкции запуска и результаты проверки клиента — в [README Web Pilot](https://github.com/OleynikAleksandr/Project-Web-Pilot/blob/main/README.md).

В Web Pilot 0.6.68 массовая вставка выполняется через webContents.insertText; Send после вставки не блокируется сверкой текста. Дополнения пользователя отправляются вместе с контекстом. Проверка актуальности checkout-пакета перенесена перед вставкой. Диагностика длительностей сохранена; алгоритмы и версия Workflow Kit не менялись. Измерения стенда и границы живой проверки находятся в VERIFICATION репозитория Web Pilot.
