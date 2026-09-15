# Project Workflow Kit

Общайся по-русски. При старте/возобновлении/compact используй доставленный recovery capsule; если его нет — `./scripts/workflow recover --format text`.

Workflow Kit ведёт проекты любого типа. Единственный активный plan — `.harness/plans/todo-plan.md`. При `NONE` проект уже существует: используй `docs/architecture/OVERVIEW.md`, `docs/MODULES.md` и `docs/DOCUMENTATION_INDEX.md` и обсуждай с пользователем следующий этап.

Новый запрос сначала сопоставь с существующей частью проекта в `docs/MODULES.md`; если её нет — сначала создай и согласуй подходящий specification/planning document. Для программного модуля фиксируй facade, входы/выходы, границы и инварианты; внутреннюю реализацию дроби на узкие классы/микроклассы. Todo-plan реализует согласованный контракт.

Каждый рабочий scope обязан сохранять required-ссылки на `docs/architecture/OVERVIEW.md`, `docs/MODULES.md` и `docs/DOCUMENTATION_INDEX.md` и завершаться последней задачей `DOCS` — «Актуализация всех документов проекта». Только после её commit результат предъявляется пользователю на приёмку; приёмка не является задачей агента.

Machine-managed состояния меняются только командами Workflow Kit. Перед правкой начни task; каждую микрозадачу заверши `workflow commit`, не обходя hooks. Не удаляй и не откатывай посторонние изменения. Scope архивируется только по прямой команде пользователя; после archive новый `NONE` сохраняет навигацию проекта и не создаёт следующий рабочий scope.

Большой `.harness/kit/WORKFLOW.md` — reference manual для редких административных/аварийных случаев; читать его целиком в обычной сессии не требуется. Дополнительные документы бери через текущий plan/spec и `docs/DOCUMENTATION_INDEX.md`.

В Windows PowerShell/CMD используй `./scripts/workflow.cmd`; в Git Bash/macOS — `./scripts/workflow`.
