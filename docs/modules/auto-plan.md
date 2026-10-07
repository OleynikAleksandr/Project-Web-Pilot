# AutoPlan — автовыполнение текущего плана

Клиентский режим «Автовыполнение»: пока он включён, Web Pilot на подходящей паузе выбранного разговора при незавершённом ACTIVE-плане отправляет одно «Продолжай» с данными следующей задачи. Модуль не владеет планом (Workflow Kit), не показывает его ([plan-view.md](plan-view.md)), не доставляет recovery ([context-delivery.md](context-delivery.md)); вставку и Send выполняет Composer ([chatgpt-dom-compatibility.md](chatgpt-dom-compatibility.md)).

## Код

- `src/auto-plan.mjs` — класс `AutoPlan` (`restore`, `start`, `disable`, `observe`, `selectionChanged`, `availabilityChanged`, `planChanged`, `reconcile`, `view`, `dispose`), `continueMessage(task)`, `CONTINUE_TEXT = 'Продолжай'`, `CONTINUE_MESSAGE_BYTES = 4096`.
- `src/auto-plan-state.mjs` — `readAutoPlanState(selected, environment)`: подтверждённое чтение плана и `nextTask`.
- `src/main.mjs` — сборка (`selected`, `inspectPlan`, `send`, `available`, `saveCheckpoint`, `log`), IPC `pilot:auto-plan`, восстановление из `settings.json`, события страницы, PlanMonitor, `publish()`.
- `src/ui/index.html`, `src/ui/sidebar.mjs` — `#auto-plan-toggle`, `#auto-plan-message` в карточке плана.
- Входы: снимок страницы (`src/chatgpt-page-observer.mjs` → `src/page-state.mjs`) и `ChatGPTComposer.sendUserMessage` (`src/chatgpt-composer.mjs`).

## Поведение

### Роль клиента (решение пользователя)

- Режимом владеет только клиент: агент его не включает, не выключает и не сообщает, можно ли продолжать; текст ответа для решения не читается. Управление текстом агента пользователь отверг: footer-протокол давал ложную остановку (`NO_CHECKPOINT`) и «липкую» паузу при включённой кнопке.
- Автоматически отправляется только сообщение, первая строка которого ровно `Продолжай`. Переключатель агенту ничего не шлёт и стартовый текст сессии не меняет.
- Агент работает одинаково при любом положении переключателя: одна микрозадача за ответ (`task:start` → работа → `commit --task` → отчёт → конец ответа); правило передаёт Workflow Core в recovery (п. 4 `WORKFLOW.md` Kit), не Web Pilot.
- Без модельного API, второго агента, новой службы и периодического опроса; модель состояний Kit не меняется — current plan единственный источник незавершённой работы.

### Переключатель и хранение

- IPC `pilot:auto-plan(enabled)` → `saveSettings({autoPlanEnabled})` → `start()`/`disable()`. Кнопка «Автовыполнение» / «Выключить автовыполнение», `aria-pressed`, недоступна во время действия панели.
- OFF→ON во время ответа: ничего не слать, ждать паузу. OFF→ON на уже существующей паузе: сразу одно «Продолжай». ON→OFF: будущих отправок нет; уже выполненный Send не повторяется и не отменяется (`sent` записывается и после OFF). Повторное ON на использованной паузе второго Send не даёт.
- Постоянный выбор (решение пользователя): переживает reload, смену разговора, выход и новый запуск. Ожидание, вопрос агента, draft, watchdog, ручной Stop, завершение плана режим не выключают — только пользователь. Новый ACTIVE-план подхватывается сам. Цель — не писать «Продолжай» вручную.
- `<userData>/settings.json` (общий последовательный атомарный writer): `autoPlanEnabled` (bool) и `autoPlanCheckpoint = {version: 3, entries: [{key, turnId, status: 'sending'|'sent', generation}], cycles: [{key, generation, busy, legacy}]}`. Текста разговора нет. v2 (`entries` без `cycles`) и v1 (одна запись) читаются без удаления записей; некорректные отбрасываются. Ledger ограничен (`pruneLedger`): по 20 последних записей на разговор и не больше 400 всего, потому что текущая пауза разговора всегда последняя, а файл переписывается при каждой паузе.
- Счётчик «№N» — в памяти, по ключу контекста; растёт только от выполненной автоотправки, обнуляется при новом scope/разговоре и после перезапуска; для чужого контекста показывается 0.

### События и reconcile

- Будят пересмотр: переключатель; наблюдение страницы (`observe`, включая `reset` документа); PlanMonitor `semanticChanged|recovered` → `planChanged()`; `publish()` → `selectionChanged()` и `availabilityChanged()` (только при смене `available()`).
- Один сериализованный проход: `reconcile()` ставит `rerunRequested`; во время прохода возвращается его promise, затем выполняется ещё один. Выключенный или закрытый AutoPlan ничего не делает.
- Во время `busy` план не читается и Git не вызывается. После busy→idle (или смены `turnId` в idle) при ON ставится settle-таймер 500 мс; пока он ждёт, проход завершается без действий. Других таймеров, кроме watchdog 180 000 мс, нет; Git читается только на idle-проходе и в `onBeforeSend`.

### Условия Send — порядок проверок и коды

Ключ контекста `key = [workspace, sessionId, scopeId, chatUrl]`; `scopeId` берётся из проекции PlanMonitor. Проход останавливается на первом невыполненном условии (фаза `waiting`, если не указано иное):

1. Несохранённые циклы записываются в checkpoint; ошибка → `SEND_CHECKPOINT_ERROR`.
2. У выбранной сессии есть `chatUrl`, она не в архиве, страница наблюдается и её URL равен `chatUrl` → иначе `PAGE_NOT_READY`.
3. `available()` (main): контроллер есть, `composer.inFlight` ложно (одна отправка одновременно), нет загрузки страницы, подготовки и Настроек, `workspaceHealth.ready` для этого workspace → иначе `PAGE_NOT_READY`.
4. Нет `connectionError` → иначе `CONNECTION_ERROR`.
5. `busy` → фаза `running`, без отправки (см. Watchdog).
6. Ждёт settle-таймер → выход.
7. Поле ввода есть и writable → иначе `PAGE_NOT_READY`.
8. Нет draft → иначе `DRAFT_PRESENT`.
9. История загружена → иначе `HISTORY_NOT_READY` (пустой снимок при гидратации не разрешает Send).
10. Последнее сообщение — assistant и пауза не та, на которой пользователь сам отправил сообщение → иначе `USER_MESSAGE_PENDING`.
11. Есть `scopeId` → иначе `PLAN_UNAVAILABLE`.
12. Фаза `checking`, `inspectPlan` (см. ниже); ошибка → `PLAN_READ_ERROR`. Если за время чтения контекст или пауза изменились — тихий выход.
13. План подтверждён и его scope равен ключу → иначе `PLAN_CHANGED_OR_TRANSACTION`.
14. Все задачи DONE → фаза `complete`, `PLAN_COMPLETED` («Все пункты плана выполнены. Продолжение не отправляется.»).
15. Scope `ACTIVE` и задачи есть → иначе `PLAN_UNAVAILABLE`.
16. Пауза без native ID в разговоре со старым checkpoint без истории циклов → `LEGACY_PAUSE_UNKNOWN`.
17. Пауза ещё не использована: запись `sending` → фаза `paused`, `SEND_UNKNOWN`; `sent` → фаза `running`, `PAUSE_CONSUMED`.
18. Отправка (см. ниже). Технические ожидания пересматриваются по следующему событию.

### Проверка плана (`readAutoPlanState`)

- `readWorkspace` → `git -C <ws> rev-parse --git-path workflow-kit/transaction.json` (файл есть → транзакция не завершена) → `git status --porcelain -- .harness/plans/todo-plan.md` → повторный `readWorkspace`.
- `confirmed` = нет журнала транзакции И (есть незавершённые задачи ИЛИ plan-файл чист) И `planRevision`/`scopeId` совпали в двух чтениях. Неподтверждённый план отправку не разрешает; проверку плана и транзакции Kit не ослаблять.
- Git: таймаут 10 с, буфер 1 MiB, `WORKFLOW_GIT_BIN` из окружения; на Windows окружение даёт `WindowsExecutorBootstrap.workflowEnvironment()` (комплектный MinGit; его ошибка → `PLAN_READ_ERROR`).
- `nextTask` читается из того же plan-файла: revision и scope равны проекции, задача `nextTaskId` (`current_task_id`, иначе первая не DONE) существует и не DONE. Поля: `id`, `title`, `why`, `acceptance_criteria`, `functional_paths` + `documentation_paths`, `verification_ids`. Любое расхождение или ошибка → `null`.

### Пауза и её идентичность

- Пауза — доступный idle выбранного разговора при незавершённом ACTIVE-плане: после ответа, после ручного Stop, после reload, уже существующая при включении, или план стал ACTIVE во время обычного ответа. Новый DONE не требуется: «Продолжай» продолжает фактическую работу. Агент знает это из Workflow Core (п. 4): незавершённая задача сохраняется на безопасной точке без DONE, следующее «Продолжай» её продолжает; PROTOTYPE велит вести долгую команду в фоне и при продолжении сначала читать её результат.
- Native ID: `data-message-id` последнего assistant (на wrapper, у предка или внутри wrapper Work), иначе `data-turn-id` предка; в main уходит только FNV-1a хеш ≤ 8 hex (`turnId`, `turnIdentitySource: native|cycle|none`).
- Без native ID: `cycle:<generation>` — сохраняемое поколение цикла busy→idle на разговор (`[workspace, sessionId, chatUrl]`); поколение растёт при начале busy.
- Число DOM-узлов или сообщений, текст ответа, случайный ID на снимок — не идентичность: Work перерисовывает ограниченное окно DOM, позиционный ID повторяется (ложный `PAUSE_CONSUMED`).
- Использованной считается пауза с той же парой (ключ, ID) или запись того же поколения цикла (если native ID нет или запись цикловая): native ID, появившийся или исчезнувший внутри отправленного цикла, второго Send не даёт.
- Ограничение: ответы, появившиеся при закрытом приложении без native ID, не различаются — клиент не угадывает и ждёт следующий наблюдаемый ответ (`LEGACY_PAUSE_UNKNOWN` для разговоров с checkpoint v1/v2).

### Отправка и checkpoint

1. В диагностику — `pause` (opaque `turnId`, источник, поколение); фаза `sending`.
2. Запись `{key, turnId, status: 'sending', generation}` сохраняется в `settings.json` до Send. Ошибка сохранения → `SEND_ERROR`, Send не выполняется, следующее событие может повторить эту известно не отправленную паузу.
3. `send(continueMessage(plan.nextTask), ready, onBeforeSend)` = `composer.sendUserMessage({text, canContinue: ready, onBeforeSend, waitForAcknowledgement: false, cleanupOnCancel: true})`.
   - `ready()`: тот же контекст (epoch, ключ, `documentId`, URL), не busy, нет ошибки связи, поле writable, последнее сообщение не user, неизменны идентичность паузы, `turnId`, `userTurnId`, `manualInputRevision`, `manualSendRevision`, `manualStopRevision` — ручной ввод, Send или Stop отменяют отправку на последнем шаге.
   - `onBeforeSend()`: план перечитывается непосредственно перед click; нужен подтверждённый ACTIVE того же scope и та же следующая задача, что в уже вставленном тексте, иначе `PLAN_CHANGED_OR_TRANSACTION` (актуальная задача уйдёт по следующему событию); все DONE — click отменяется, `complete` (сразу или на следующем проходе).
   - `cleanupOnCancel`: при отмене до click Composer удаляет только свою неизменённую вставку (`draftToken`, `clear-owned-draft`); после click ошибка — неизвестный исход без очистки и повтора. `waitForAcknowledgement: false`: `sent` сразу после click (`send-dispatched`), эхо не ищется.
4. `sent` → счётчик +1 (если контекст тот же), запись `sent`, фаза `running`: `Автоматически отправлено «Продолжай». Ждём ответ.`
5. `unknown` → фаза `paused`, `SEND_UNKNOWN`: блокируется только эта пауза, слепого повтора нет.
6. `cancelled`/`deferred` → восстанавливается предыдущий checkpoint, `SEND_NOT_SENT` или `DRAFT_PRESENT`; доставка не заявляется.
7. Исключения: Send выполнен, но `sent` не записался → факт `sent` остаётся в памяти, `SEND_CHECKPOINT_ERROR`, повтора нет; исключение из Composer → `SEND_ERROR`, запись `sending` остаётся и пауза дальше считается `SEND_UNKNOWN`; не удалось откатить известно не отправленную попытку → запись снимается в памяти, следующее событие может повторить.

После перезапуска сохранённая `sending` → `SEND_UNKNOWN`, `sent` → `PAUSE_CONSUMED`: reload, restart, PlanMonitor и повторные наблюдения второго «Продолжай» для одной паузы не дают.

### Сообщение продолжения (`continueMessage`)

```
Продолжай

Данные текущего плана Workflow Kit — следующая задача (это не новое поручение; фактическое состояние плана проверь сам):
Задача: <id> — <title>
Зачем: <why>
Критерии приёмки:
- <критерий>
Файлы: <путь>, …
Проверки: <id>, …
```

- Пределы: id ≤ 40 символов, title ≤ 240, why ≤ 500; критериев ≤ 10 по ≤ 320, файлов ≤ 24 по ≤ 160, проверок ≤ 12 по ≤ 60; пробелы схлопываются; обрезка помечается `… [обрезано]` и `… ещё N [обрезано]`. Всё сообщение ≤ 4096 байт UTF-8, иначе обрезается с хвостом `… [данные задачи обрезаны; полный текст — в плане]`.
- Нет задачи или у неё нет `id`/`title` → голое «Продолжай». Пустые поля опускаются.
- Задача берётся из той же проверки плана, что разрешила Send: агент начинает без чтения плана инструментами, устаревшая задача не называется. Документы задачи не вкладываются. Это не recovery и не новое поручение.

### Пользователь приоритетнее

- Draft не трогается: Send ждёт (`DRAFT_PRESENT`); очистка draft будит ту же паузу.
- Ручная отправка использует паузу: доверенный click/Enter с текстом в поле, затем новое user-сообщение с тем же текстом → `manualSendRevision`; AutoPlan ждёт новый ответ (`USER_MESSAGE_PENDING`), в том числе после reload (последнее сообщение — user) и если busy ещё не появился.
- Ручной Stop — обычная idle-пауза: режим остаётся ON, следующее «Продолжай» продолжает работу. Остановить автоматику можно только переключателем.
- Нативные диалоги безопасности и разрешений ChatGPT не автоматизируются.

### Watchdog

- На busy-цикл — одноразовый таймер `stallMs = 180000`; перевзводится при начале busy и при каждом новом прогрессе (`assistantRevision`). Прогресс — только изменение текста или узлов ответа; наблюдатель сообщает его не чаще раза в 5 с; анимация и атрибуты прогрессом не считаются.
- Срабатывание (тот же run, режим ON, всё ещё busy): `STALL_WARNING`, фаза `running`, «Агент ещё работает. Давно не было новых данных; ждём завершения ответа.». Stop не нажимается, сообщения не отправляются, режим не выключается, Git не читается. Новый прогресс снимает предупреждение.
- Stop по таймеру запрещён, потому что может оборвать коммит или сборку агента.
- При `STALL_WARNING` и неактивном ConversationRecovery панель показывает «Можно повторно открыть сохранённый разговор. Это не повторяет команды.» и кнопку «Повторно открыть разговор» (`requestRetry()` того же URL, [context-delivery.md](context-delivery.md)).

### Состояние в панели и диагностика

- `view()`: `{phase, message, active, reason, enabled, warning, continuations}`; фазы `off|waiting|checking|sending|running|paused|complete`. Панель: `Автоматически отправлено «Продолжай» №N.` + сообщение фазы; `data-reason` — код.
- Тексты описывают только клиентское состояние, без формулировок «агент разрешил».
- Коды: `MANUAL_OFF`, `PAGE_NOT_READY`, `CONNECTION_ERROR`, `DRAFT_PRESENT`, `HISTORY_NOT_READY`, `USER_MESSAGE_PENDING`, `PLAN_UNAVAILABLE`, `PLAN_READ_ERROR`, `PLAN_CHANGED_OR_TRANSACTION`, `LEGACY_PAUSE_UNKNOWN`, `PAUSE_CONSUMED`, `SEND_UNKNOWN`, `SEND_NOT_SENT`, `SEND_ERROR`, `SEND_CHECKPOINT_ERROR`, `STALL_WARNING`, `PLAN_COMPLETED`.
- Диагностика — `chromium-events.jsonl`, источник `auto-plan`: `state` (фаза, код), `pause` (opaque ID, источник, поколение), `send` (вид, счётчик), `progress-timeout`/`progress-resumed`. Без текста разговора и UI, URL, секретов ([chromium-diagnostics.md](chromium-diagnostics.md)).

## Решения и запреты

Не возвращать:
- `AUTO_PLAN_INSTRUCTION` и любую стартовую AutoPlan-инструкцию; footer «Готов продолжать.»/«Нужен ваш ответ.»/«План завершён.», `turnSignal`, коды `AGENT_WAIT`/`NO_CHECKPOINT`; управление режимом текстом агента.
- Паузу «3 ответа без изменения плана» и возобновление только после ручного сообщения.
- Идентичность паузы по числу узлов/сообщений, хешу текста или случайному ID на снимок; повтор Send по таймеру; очистку реального checkpoint ledger.
- Нажатие Stop по таймеру; выключение режима по технической причине.
- Периодический опрос Git/плана, модельный API, второго агента, отдельную службу.
- Автоматическую отправку чего-либо, кроме сообщения с первой строкой «Продолжай».

## Проверки

Автоматические (id из `.harness/workflow.json`):
- `unit-all`: `tests/auto-plan.test.mjs` (машина состояний, checkpoint и свежие Node-процессы, `readAutoPlanState` на настоящем Git, `continueMessage`), `tests/page-state.test.mjs` (идентичность ответа), `tests/chatgpt-composer.test.mjs` (план до click, очистка своей вставки, unknown после dispatch).
- `electron-smoke`: `tests/electron-smoke.mjs` + `tests/auto-plan-restart-fixture.cjs` — сохранённый ON → Chat с NONE → ACTIVE во время ответа → одно «Продолжай» с задачей; ON/OFF, Stop, draft, ручной Send, reload, связь, watchdog, все DONE, свежий Electron-процесс.
- `release-installed`: `scripts/check-installed-release.mjs` — в установленном `app.asar` `CONTINUE_TEXT`, нет `AUTO_PLAN_INSTRUCTION`, методы машины состояний.

Ручные (пользователь; fixture не заменяет): живой ChatGPT, временный проект — ON в busy и в паузе, OFF, длинный разговор, Work без native ID, перезапуск с ON; ровно одно «Продолжай» с текстом задачи на паузу; draft и ручное сообщение не перетираются; то же на native Windows.

## Открыто

- Живая приёмка AutoPlan (идентичность пауз в длинном разговоре, Work без native ID, рестарт; продолжение с текстом задачи) — за пользователем. Native Windows не проверен.

