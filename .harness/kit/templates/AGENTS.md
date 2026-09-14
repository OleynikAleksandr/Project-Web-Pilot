# Project Workflow Kit

Общайся по-русски. При старте/возобновлении/compact используй доставленный recovery capsule; если его нет — `./scripts/workflow recover --format text`.

Единственный активный plan — `.harness/plans/todo-plan.md`. Новый функциональный запрос сначала сопоставь с владельцем в `docs/MODULES.md`: существующему модулю сначала согласуй изменение specification, при отсутствии владельца сначала создай specification. Todo-plan реализует согласованный контракт.

Machine-managed состояния меняются только командами Workflow Kit. Перед правкой начни task; каждую микрозадачу заверши `workflow commit`, не обходя hooks. Не удаляй и не откатывай посторонние изменения. Scope архивируется только по прямой команде пользователя.

Большой `.harness/kit/WORKFLOW.md` — reference manual для редких административных/аварийных случаев; читать его целиком в обычной сессии не требуется. Дополнительные документы бери только из ссылок текущего plan/module spec через `docs/DOCUMENTATION_INDEX.md`.

В Windows PowerShell/CMD используй `./scripts/workflow.cmd`; в Git Bash/macOS — `./scripts/workflow`.
