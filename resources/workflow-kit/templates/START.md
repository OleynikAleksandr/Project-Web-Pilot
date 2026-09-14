# Начало работы

Новая сессия начинает работу с recovery capsule Workflow Kit. Capsule уже содержит Workflow Core, текущий todo-plan, required module context, dependency diffs и текущее рабочее состояние. Большой WORKFLOW.md и исторические документы читать целиком не требуется.

## Порядок

1. Использовать доставленный capsule; если его нет — `./scripts/workflow recover --format text`.
2. Для нового функционального запроса найти владельца в `docs/MODULES.md`.
3. Сначала согласовать изменение существующей module specification или создать новую; только затем создавать/уточнять todo-plan реализации.
4. Дополнительные документы читать только по ссылкам plan/module spec через `docs/DOCUMENTATION_INDEX.md`.
5. Перед правкой начать task, после микрозадачи выполнить управляемый commit и назначенные проверки.

`docs/architecture/OVERVIEW.md` — компактная карта проекта для recovery. Подробная история и профильные документы остаются reference-only.
