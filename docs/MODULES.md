# Модули проекта

| Модуль / часть проекта | Спецификация | Ответственность |
| --- | --- | --- |
| Canonical Workflow Kit package | [docs/modules/workflow-kit-package.md](modules/workflow-kit-package.md) | Единственный редактируемый исходник Kit, package API/CLI, installer, schemas/templates и runtime resource contract |
| Installed project runtime | [docs/modules/workflow-kit-package.md](modules/workflow-kit-package.md) | Производный `.harness/kit` конкретного проекта; создаётся и обновляется canonical installer-ом |
| Consumer integration | [docs/modules/workflow-kit-package.md](modules/workflow-kit-package.md) | Package imports и `getRuntimeRoot()` для WebPilot и будущих клиентов |
