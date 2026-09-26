# WorkflowKit

WorkflowKit — самостоятельный локальный Node.js package `@webpilot/workflow-kit`, который владеет единственным редактируемым исходником Workflow Kit.

Основной сценарий: разработчик меняет Kit только в этом репозитории; проекты получают installed runtime через installer, а приложения подключают package как dependency. Ручное копирование исходника Workflow Kit между WebPilot, будущим ChatGPT adapter и другими клиентами не требуется.

Текущая версия package: **1.4.12**. Требуется Node.js 22+.

Для следующего этапа Project Web Pilot подключает этот package в отдельной сессии и удаляет собственный tracked duplicate `resources/workflow-kit`. Подробный контракт: [docs/modules/workflow-kit-package.md](modules/workflow-kit-package.md).
