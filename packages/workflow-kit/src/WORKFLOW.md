# Workflow

## Workflow Core

1. Пользователь определяет результат и границы работы. Ясное поручение разрешает короткий контракт и план без повторного согласования; если поручения нет — обсуди следующий этап.
2. Workflow Kit описывает состояние Git checkout/worktree. Один checkout имеет ровно один current plan: `.harness/plans/todo-plan.md`. Chat, WebPilot session и другой клиент не владеют plan и не выбирают его.
3. Используй доставленный recovery и сводку среды. Общий порядок быстрого прототипа и Git находится в `.harness/kit/templates/PROTOTYPE.md` и передаётся в recovery; не дублируй его чтение.
4. Сопоставь поручение с `docs/MODULES.md`, сохрани краткий контракт результата, запуска и проверки. План сохраняет навигацию OVERVIEW, MODULES и DOCUMENTATION_INDEX. Масштаб структуры и плана определяется текущим результатом.
5. Перед реализацией начни `task:start`. Каждую микрозадачу завершай отдельным проверенным `commit --task`. Файлы плана — ориентир; фактический состав сохраняет Kit. Не обходи hooks и не удаляй посторонние изменения.
6. Новое поручение добавляй через `plan:extend`. Записи и позиции DONE сохраняются. При новом delivery создаётся отдельная DOCS следующей итерации; без delivery она автоматически не нужна. DOCS проверяет актуальность документов, но не требует бессмысленных правок.
7. Build/package/sign/notarize/release/publish выполняй только внутри активной микрозадачи, где это действие прямо названо. Не запускай delivery как вспомогательный шаг code/test/DOCS-задачи. Перед build или GitHub publish относящиеся к результату документы должны быть актуализированы и зафиксированы; если plan предусматривает delivery, DOCS выполняется до явного delivery-хвоста. Если явной delivery-задачи нет — не собирай и не публикуй.
8. Новый chat/client продолжает тот же current plan. Для реальной независимой параллельной работы используй отдельный Git branch + worktree; каждый worktree имеет собственный `todo-plan.md`.
9. История планов хранится в Git. Legacy `by-id/by-session` и archive существуют только как вход безопасной миграции и не участвуют в readiness/recovery текущего проекта.
10. После финального коммита сообщи результат и способ запуска. Архивирование current scope — только по отдельной прямой команде пользователя.

## Основная модель

```text
one Git checkout/worktree
        =
one current working state
        =
.harness/plans/todo-plan.md
```

Обычные команды не требуют session selector. Старый `--session <id>` временно допускается как compatibility metadata: он может быть синтаксически проверен и возвращён consumer-у, но не выбирает plan, не создаёт owner и не меняет routing.

`--plan <id>` допустим только если ID совпадает с current scope. Historical/legacy plan не может стать runtime current через selector. Для истории используется отдельный read-only путь.

`plan:prepare`, `plan:bind` и `plan:adopt` удалены из постоянной модели. Новый chat не создаёт и не получает отдельный plan.

## Основные команды

| Команда | Назначение |
| --- | --- |
| `status` | Краткое текущее состояние checkout, plan revision, Git и транзакция |
| `validate` | Согласованность current plan и Git |
| `recover --format text/json/packet` | Полный контекст current plan |
| `plan:view` | Current plan checkout; legacy `--session` не влияет на результат |
| `plan:create --input plan.json` | Создать новый current scope только из состояния NONE |
| `plan:extend --input changes.json --expected-revision N` | Добавить новое поручение в current scope |
| `scope:create --input scope.json` | Низкоуровневое создание current scope |
| `task:start T001` | Начать одну микрозадачу |
| `task:update --task T001 --input update.json --expected-revision N` | Уточнить незавершённую задачу |
| `plan:apply --input changes.json --expected-revision N` | Уточнить current plan с сохранением managed state |
| `commit --task T001` | Проверить и зафиксировать микрозадачу |
| `repair --dry-run` | Диагностика незавершённой транзакции/проекции |
| `archive --scope ID --approval-note "..."` | Архивировать завершённый current scope только по прямому поручению |
| `config:apply --input config.json` | Полностью применить конфигурацию проверок |
| `project:rename --name ИМЯ --expected-revision N` | Сменить имя проекта (например, после переименования папки); без активной микрозадачи |
| `inspect/doctor/install` | Проверка и обслуживание установки Kit |

В Windows PowerShell/CMD используй `./scripts/workflow.cmd`, в Git Bash/macOS — `./scripts/workflow`.

## Recovery и контекст

Recovery строится только для current `todo-plan.md`. Он содержит worktree, scope, revision, текущую/следующую задачу, обязательные документы, релевантные изменения и verification evidence.

Historical archive не входит в обычный recovery и не является входом readiness/cache. Transport hard limit остаётся строгим для current recovery; данные не обрезаются молча. Большой historical plan не должен блокировать открытие проекта.

`recover --format packet` сохраняет единый inline-context envelope. Поле `session_id`, если присутствует ради старого consumer contract, не является routing key.

## План и жизненный цикл

`plan:create` работает только с current `todo-plan.md`. Активный scope не заменяется из-за открытия нового чата.

`plan:extend` сохраняет записи и позиции DONE/commits. Для нового delivery Kit добавляет отдельную DOCS (DOCS-2, DOCS-3); прежние delivery сохраняют зависимость от своей DOCS. Без нового delivery автоматическая DOCS не добавляется. Если DOCS была активна, Kit безопасно откладывает её и передаёт незакоммиченные относящиеся документы первой доступной correction-задаче.

Обсуждение и подготовка документов допускаются при NONE без фиктивного плана. `docs:commit --input files.json --message "docs: уточнить документы"` принимает {"files":["README.md","packages/example/README.md"]} при NONE или idle ACTIVE, запрещён при IN_PROGRESS. Допустимы любые .md вне .harness/. Управляемая секция AGENTS.md в index должна побайтно совпадать с HEAD. Роль documentation, схема, состав и размер проверяются без suite приложения. Ошибка сохраняет правки.

Delivery должен быть явным хвостом плана. Сборка/упаковка/установка помечается существующим `verification_kind=package|installed`; публикация исходников без сборки всё равно задаётся отдельной явно названной задачей после DOCS. В code/test/DOCS-задачу нельзя неявно добавлять build, подпись, notarization, release или publish.

Одновременно выполняется не более одной current task в одном checkout. Несколько агентов с независимым состоянием должны работать в разных Git worktrees.

После завершения всех задач plan остаётся доступным в READY_FOR_ACCEPTANCE. Это не требует автоматического archive и не создаёт новый plan.

## Git и managed commit

Перед изменениями запускай `task:start`. `commit --task` выбирает относящиеся к задаче изменения после start, запускает назначенные checks, создаёт один commit с Workflow trailers и подтверждает tree/transaction. Существовавшие до start изменения не присваиваются задаче автоматически.

При сбое проверки исходные правки сохраняются. Исправь причину и повтори `commit --task`; `repair` нужен только для действительно незавершённой транзакции.

Для package/installed результата используй соответствующий `verification_kind` и check с фактическим evidence. Проверка должна подтверждать реальный артефакт/сценарий, а не только синтаксис.

## Legacy migration

При upgrade со старой session-owned установки:

1. valid `.harness/plans/todo-plan.md` всегда остаётся current winner;
2. повреждённый/отсутствующий current plan останавливает migration non-destructively — legacy winner не угадывается;
3. все удаляемые файлы `.harness/plans/by-id/*.md`, `.harness/plans/by-session/*.md` и `.harness/plans/archive/` должны быть tracked и побайтно совпадать с HEAD и index; изменённый или неотслеживаемый файл останавливает миграцию до записи и удаления;
4. `install --update` удаляет проверенные файлы служебным коммитом kit-update; исходное содержимое доступно в Git, новые копии не создаются;
5. owner/prepared/session ownership fields удаляются из current plan;
6. повторная migration идемпотентна;
7. history не участвует в normal readiness/recovery.

Несколько legacy ACTIVE plans остаются в Git без merge и без автоматического promotion.

## Установка и hooks

Fresh install создаёт один `.harness/plans/todo-plan.md` и не требует `by-id/by-session` directories. Installer хранит runtime snapshot в `.harness/kit`; canonical source package остаётся `@webpilot/workflow-kit`.

SessionStart hook доставляет current checkout recovery. Git hooks проверяют managed commit. `doctor` диагностирует установку и hooks, но history не full-recovers автоматически.

## Совместимость consumer-ов

Старый WebPilot может продолжать хранить session ID/chat metadata. `sessionPlanView(root, anySessionId)` временно возвращает один current checkout plan для любого session ID, `prepared: []`; session не является owner.

Публичные package subpaths сохраняются там, где это разумно. Physical runtime consumers получают `getRuntimeRoot()` и могут stage payload без зависимости от sibling repository.

## Закрытие с переносом незавершённых задач

По прямому поручению пользователя используйте `plan:carryover --input carryover.json --expected-revision N`. Вход: `{"scope":"old-scope","id":"new-scope","approval_note":"Прямое поручение пользователя"}`; optional `objective`. Требуется чистый checkout без активной микрозадачи. Новый current plan содержит незавершённые задачи, сохраняет критерии, проверки и planning/module ссылки. Исходный план и выполненные зависимости доступны по source_commit в Git; архивных копий нет. Перенос фиксируется одним служебным коммитом. Повтор после успеха безопасен; при прерывании используйте status и штатный repair. Команда archive закрывает план только после всех DONE, без создания копии. Новый чат сам по себе не требует переноса.
