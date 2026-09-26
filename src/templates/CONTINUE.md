## Продолжение существующего плана — plan:extend

Используй текущий план и адрес из recovery (--session, при необходимости --plan). `status` возвращает краткое состояние и plan_revision; полный контекст — `recover`. `--help` работает и у отдельных команд. Не редактируй служебный JSON и не читай реализацию Kit ради обычного продолжения.

**Добавить задачи:** сохрани в `.harness/runtime/changes.json` только новые задачи:

```json
{"tasks":[{"title":"Исправить навигацию","files":["src/main.mjs"],"checks":["navigation"],"acceptance":["Enter и Go открывают введённый адрес"]}]}
```

Вызови `./scripts/workflow plan:extend --input .harness/runtime/changes.json --expected-revision N`. ID необязателен. `spec` — необязательный путь существующего документа docs/planning/ или docs/modules/. Допустимы why, dependencies, commit и verification_kind. Kit обновит список файлов плана, сохранит DONE/commits и переоткроет последнюю DOCS. При активной DOCS он отложит её, передаст незакоммиченные документы первой доступной по зависимостям задаче и сохранит их на месте. Не закрывай DOCS, если уже известна ошибка продукта.

**Завершить задачу:** `./scripts/workflow commit --task T001` автоматически учтёт файлы, изменившиеся после task:start. Список files в плане — ориентир; лимита количества и file_limit_exception нет. Дополнительный package.json не требует task:update. Если нужны выбранные файлы или продолжение ранее начатых правок, передай `--files '["src/main.mjs","package.json"]'` либо `--input .harness/runtime/commit.json` с `{"files":["src/main.mjs","package.json"]}`. Kit сохранит фактический состав и план в том же коммите. Существовавшие до task:start правки автоматически не включаются; если они изменились снова, проверь diff и укажи фактические файлы явно. Это выбор состава коммита, дополнительное разрешение пользователя не требуется.

**Уточнить проверки или критерии:** сохрани `{"checks":["navigation"],"acceptance":["Enter открывает адрес"]}` и вызови `./scripts/workflow task:update --task T001 --input .harness/runtime/changes.json --expected-revision N`. files/checks/acceptance добавляются; статусы и ссылки сохраняет Kit.

checks — ID настроенных проверок. Новую проверку добавь через config:apply, сохранив остальные, затем прочитай новую revision. Ошибки содержат поле и причину; при конфликте revision прочитай status и проверь, не выполнено ли действие. Не повторяй вслепую. При NONE создай план через plan:create по `.harness/plans/todo-plan.template.md`.

Перед правкой — task:start, после работы — commit --task, в конце — DOCS. Сохраняй содержательные промежуточные сообщения. Не перемещай настройки и посторонние файлы ради допуска коммита: `.harness/settings/settings.json` принадлежит приложению.

Для сборки указывай verification_kind: package, для проверки установки — installed, и соответствующий kind проверки с evidence (артефакт и сценарий). Синтаксис не доказывает работоспособность. Слово «проверено» используй только для выполненных проверок; ручную приёмку пользователя не заявляй за него. Пример безопасной упаковки и проверки — `.harness/kit/examples/PACKAGING.md`.
