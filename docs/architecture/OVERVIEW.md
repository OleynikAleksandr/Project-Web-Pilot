# Краткая архитектура проекта

## Назначение

WorkflowKit — canonical Node.js package существующего Workflow Kit. Репозиторий `/Users/oleksandroliinyk/VSCODE/WorkflowKit` является единственным местом разработки кода Kit; текущая версия package — 1.4.12.

## Устройство

```text
@webpilot/workflow-kit
├── index.mjs          # public package API
├── src/               # canonical 35-файловый Workflow Kit runtime source
├── scripts/           # package/runtime/consumer проверки
└── .harness/kit/      # установленный self-host runtime этого проекта, не source
```

Обычный проект по-прежнему получает собственный installed runtime `.harness/kit` через installer. Такой runtime является производным snapshot, а не отдельной версией исходника.

Внешние клиенты используют package imports. Для приложений, которым нужен физический runtime resource, `getRuntimeRoot()` возвращает canonical runtime payload для автоматического staging в build/resources.

## Следующий потребитель

Project Web Pilot должен быть мигрирован в своём workspace: tracked `resources/workflow-kit` заменяется dependency `@webpilot/workflow-kit`; физический `resources/workflow-kit`, если он нужен существующему external worker, становится только generated staging/build artifact.

После успешной миграции WebPilot тот же package будет использовать ChatGPT MCP App adapter.

Подробный контракт: [Workflow Kit Package](../modules/workflow-kit-package.md). План миграции: [Canonical Workflow Kit Package](../planning/canonical-workflow-kit-package.md).
