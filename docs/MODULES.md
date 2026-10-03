| Delivery ordering | [docs/planning/delivery-ordering-policy.md](planning/delivery-ordering-policy.md) | Явный delivery-хвост, DOCS перед package/installed, запрет незапланированных build/sign/release/publish |
# Модули проекта

| Модуль / часть проекта | Спецификация | Ответственность |
| --- | --- | --- |
| Canonical Workflow Kit package | [docs/modules/workflow-kit-package.md](modules/workflow-kit-package.md) | Единственный редактируемый исходник Kit, package API/CLI, installer, schemas/templates и runtime resource contract |
| Current checkout state | [docs/modules/workflow-kit-package.md](modules/workflow-kit-package.md) | Единственный current `.harness/plans/todo-plan.md`; sessionless status/recovery/task lifecycle |
| Legacy plan migration | [docs/modules/workflow-kit-package.md](modules/workflow-kit-package.md) | Безопасное идемпотентное архивирование старых `by-id/by-session` без выбора winner/merge |
| Installed project runtime | [docs/modules/workflow-kit-package.md](modules/workflow-kit-package.md) | Производный `.harness/kit` конкретного проекта; создаётся и обновляется canonical installer-ом |
| Consumer integration | [docs/modules/workflow-kit-package.md](modules/workflow-kit-package.md) | `currentPlanView`, transition `sessionPlanView`, package imports и `getRuntimeRoot()` для WebPilot и других клиентов |