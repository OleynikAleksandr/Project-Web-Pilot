# Module Specification — Workflow Kit / Context Recovery

Связанные проекты (02.10.2026): **Workflow Kit** — планы и recovery; **Web Pilot Sidebar** — отдельно разрабатываемый браузерный интерфейс. [Рабочие каталоги и границы интеграции](../SOURCE_WORKSPACES.md).

## Назначение

Дать агенту минимальный самодостаточный execution state, достаточный для безопасного продолжения текущего scope после новой сессии, ручного refresh или подтверждённого compact. Recovery не является архивом знаний проекта и его размер не должен расти вместе с возрастом проекта.

## Владелец функционала

Модуль владеет:
- единственным current plan checkout/worktree в `.harness/plans/todo-plan.md` и read-only migration/history legacy session plans;
- правилами формирования recovery capsule;
- выбором обязательных документов и dependency commits;
- continuity текущей микрозадачи через Git references и worktree diff;
- budget/полнотой recovery.

Модуль не владеет:
- содержанием продуктовой архитектуры других модулей;
- браузерной доставкой сообщения в ChatGPT;
- MCP/tunnel lifecycle и выбором сетевых портов;
- полной историей проверок и решений проекта.

## Workflow Core

В каждую сессию передаётся только компактный неизменяемый core правил:
1. Пользователь определяет продуктовый результат, scope, приёмку и закрытие.
2. Один checkout/worktree имеет один current plan либо NONE; session ID не выбирает state. Transitional `--session` — compatibility/no-op, а `--plan` допускает только current scope.
3. Новый запрос сначала сопоставляется с архитектурным модулем.
4. Для существующего модуля сначала согласуется изменение его specification; при отсутствии владельца сначала создаётся новая specification.
5. Todo-plan реализует уже согласованный контракт, а не проектирует архитектуру по ходу микрозадач.
6. Перед изменением начинается текущая task; каждая микрозадача завершается собственным проверенным commit.
7. Не обходить hooks, не удалять и не откатывать посторонние изменения.
8. Cross-module работу по возможности делить по владельцам и небольшой интеграционной задаче.
9. Архивирование scope требует отдельной прямой команды пользователя.

Большой `.harness/kit/WORKFLOW.md` остаётся reference manual для команд, repair, установки, миграций и редких аварийных сценариев; целиком в обычный recovery не входит.

## Цикл изменения функционала

1. Получить запрос пользователя.
2. Найти владельца в `docs/MODULES.md`.
3. Если модуль существует — изменить его specification и согласовать новый контракт.
4. Если владельца нет — создать module specification с facade, входами, выходами, границами и инвариантами; зарегистрировать в module map; согласовать.
5. Только после этого создать/уточнить todo-plan реализации.
6. Todo-plan обязан явно перечислить внешний контекст, без которого следующая сессия не сможет безопасно продолжить работу.

Для чисто исследовательского или документального scope module specification может быть заменена явно указанным planning/spec document; функциональная реализация без согласованного владельца/контракта не начинается.

## Recovery Capsule v2

Стандартный packet новой сессии, refresh и compact строится из текущего состояния репозитория и содержит:
1. session metadata: session_id/plan_id/plan_path/project/workspace/HEAD/plan revision/scope/task/reason/signature;
2. Workflow Core;
3. краткий project overview;
4. module specification и другие `required` sections, явно перечисленные текущим plan/task;
5. текущую цель, acceptance criteria, progress и полное описание текущей task;
6. актуальные решения пользователя текущего scope;
7. diff только прямых task dependencies и явно объявленных context dependencies;
8. staged/unstaged/untracked изменения только файлов текущей task;
9. последнюю verification evidence, относящуюся к текущему candidate/commit;
10. однозначное next action и completeness metadata.

Не входят автоматически:
- полный `WORKFLOW.md`;
- полный исторический `VERIFICATION.md`;
- полный `PRODUCT.md`, `ARCHITECTURE.md`, `DECISIONS.md`;
- история старых scopes/build reports/SHA;
- последний завершённый commit только потому, что он последний;
- optional documents: они передаются как reference paths и читаются по необходимости.

## Context Pack Contract

`context_pack.documents` — единственный явный список внешнего документального контекста.
- `required: true` означает: section входит в capsule целиком; без неё безопасное продолжение невозможно.
- `required: false` означает: section является reference-only и в стандартный payload не копируется.
- Для функционального scope required context должен содержать module specification `docs/modules/*.md` и компактный `docs/architecture/OVERVIEW.md` либо эквивалентные явно согласованные документы.
- `heading_path` должен выбирать минимально достаточный раздел, а не H1 большого исторического документа без необходимости.

`include_last_completed_task` по умолчанию `false`. Commit diff включается только если task является прямой dependency либо явно указан в `dependency_task_ids`.

## Budget

Целевой normal recovery: 15–30 KiB; сложный модуль: 30–50 KiB; 80–100 KiB — сигнал проверить границы. Транспортный hard limit Web Pilot остаётся 180000 UTF-8 bytes; Workflow Kit не должен разрешать packet больше транспортного лимита. `soft_tokens` является индикатором компактности, а не основанием silently обрезать required data.

При превышении hard limit обязательные данные не усекать. Ошибка должна указывать крупнейшие секции, чтобы уменьшить module/task context либо разделить scope.

## Facade

Внешний контракт модуля:
- `plan:create / scope:create / plan:extend / task:start / commit / archive` управляют lifecycle единственного current plan checkout; `status / recover / currentPlanView / sessionPlanView` читают current state; legacy `plan:prepare / plan:bind / plan:adopt` удалены из normal workflow;
- `recover`/SessionStart возвращают COMPLETE capsule, детерминированный текущим worktree;
- Web Pilot получает capsule read-only и проверяет bytes/hash/facts;
- новая сессия, manual refresh и compact используют один builder; различается только `reason`.

## Инварианты

- Recovery новой сессии не зависит от текста предыдущего разговора.
- Required context не теряется и не silently truncates.
- Размер capsule не растёт только из-за накопления исторической документации.
- Текущая task и её dependency commits восстанавливаются однозначно.
- Посторонние изменения не включаются как рабочий diff текущей задачи.
- Reference manual Workflow Kit не подменяет module specification.

## Проверяемые свойства

- Functional scope без module spec/overview блокируется до согласования контракта.
- Default plan не включает last completed task автоматически.
- Optional docs не копируются в body.
- Прямые dependencies включаются; unrelated completed commits — нет.
- Recovery текущего Project Web Pilot после миграции укладывается существенно ниже 180000 bytes и не содержит полного исторического `VERIFICATION.md`.
- Fresh install создаёт module map и compact overview; migration 1.1→1.2 сохраняет пользовательские документы.

## Реализация core Recovery v2 — T003

Source Workflow Kit использует отдельный `Workflow Core` из reference manual вместо полного блока правил. `emptyPlan()` по умолчанию ставит `include_last_completed_task=false`. При `scope:create` функциональный scope требует required `docs/architecture/OVERVIEW.md` и хотя бы одну `docs/modules/*.md`; уже существующие legacy scope не блокируются только из-за старого контракта, но добавление нового функционального task требует актуального module context.

Recovery builder копирует только `required` sections. `required=false` становится reference-only записью пути/heading и не расходует payload содержимым. Commit diffs выбираются только из прямых `task.dependencies` и явных `context_pack.dependency_task_ids`. Verification evidence включается только если относится к текущему HEAD/dependency или текущей transaction.

Эффективный hard budget ограничен минимумом project config и transport ceiling 180000 bytes / 90000 conservative tokens. При переполнении exception содержит `largest_sections`; required data не обрезается. `soft_tokens` публикуется как quality signal (`soft_exceeded`), но не удаляет данные автоматически.

## Install/upgrade contract 1.2 — T004

Fresh Workflow Kit 1.2 создаёт `docs/MODULES.md`, `docs/architecture/OVERVIEW.md` и plan template с module-centric `context_pack`. Workspace Setup распознаёт неизменённую 1.1 installation как upgradeable. Upgrade заменяет только подтверждённый owned runtime, обновляет принадлежащие Kit managed sections и создаёт недостающие новые документы; пользовательский active plan/config/editable docs сохраняются. Изменённый owned runtime или неизвестная версия не перезаписываются автоматически.

## Предварительная подготовка полного контекста — scope 012 / T005

Поручение 15.09.2026 разрешает ускорение и релиз для тестов. Web Pilot хранит в памяти ограниченный кэш COMPLETE пакетов штатного Workflow Kit, отдельно для workspace/sessionId/planId. Начиная с 0.6.29 пакет готовится для выбранного адреса новой сессии или явного обновления контекста; прогрев во время ожидания composer/черновика использует тот же load. Просмотр сохранённого sent/legacy/unknown чата не запускает прогрев или recover. request_id добавляется при фактической передаче. Текст capsule не дополняется вручную и не сокращается: при изменении входов штатный builder формирует новую версию. Кэш не заменяет Workflow Kit как владельца recovery.

Ключ актуальности учитывает канонический workspace, HEAD/ветку/index и Git status, содержимое plan/config, объявленных документов и task files, Workflow Kit runtime/launcher, transaction и verification evidence. Проверяется содержимое, а не только время файла или revision. Отсутствующие источники учитываются, чтобы их появление инвалидировало кэш. Во время commit transaction прогрев откладывается. До/после сборки входы должны совпасть; перед отправкой сравнение повторяется. При сомнении — полный recover, при изменении уже вставленного пакета — prepared-stale без удаления черновика. Возраст пакета сам по себе не делает неизменившиеся данные устаревшими, если актуальность подтверждена ключом.

Фоновая подготовка не отправляет сообщения, не меняет проект/черновик, не запускает тесты и не перезапускает исправные службы. Одновременные запросы одного адреса workspace/sessionId/planId объединяются; хранится до четырёх пакетов, без дополнительной дисковой копии контекста. После перезапуска первая подготовка обычная. Chat и Work используют одинаковую реализацию.

Проверки: независимые workspace, изменение содержимого при сохранённых размере/mtime, staged/unstaged и HEAD, добавление/удаление файлов, evidence, гонка со сборкой/отправкой, отсутствие дублей отправки. Отдельно измеряются подготовка пакета и браузерная доставка; целевой выигрыш >2x относится к подготовке повторной передачи при готовом кэше. Полное время загрузки ChatGPT/первого ответа не обещается.

## Release integration 0.6.10 — scope 012 / T009

Предварительная подготовка, повторная проверка входов и спиннеры поставлены для macOS/Windows. На неизменном пакете измерен выигрыш ~19x с учётом дополнительного before-Send input check. Содержимое capsule и штатный Workflow Kit runtime не изменены. Отдельная проверка packaged macOS подтвердила работу кэша с реальным локальным MCP. Финальная проверка UX и времени полного сценария остаётся пользователю.

## История: переход после приёмки — scope 014

Старый переход по NONE/archived_scope_id и обязательная кнопка приёмки заменены scope 028. Завершённый план остаётся в своей сессии. Подготовка продолжения выполняется отдельно; его создание через Chat/Work не требует завершения исходного плана.

## Project Continuity Contract — scope 021

Workflow Kit обслуживает проекты любого типа. Программный модуль — только один из вариантов самостоятельной части проекта; для исследования, проектирования, сада, планировки или другого предметного проекта используется эквивалентный planning/spec document. Для программных проектов сохраняется кластерно-модульная архитектура: внешние взаимодействия идут через согласованные facade-контракты, а внутренняя реализация дробится на узкие классы/микроклассы.

Совместимый `.harness/plans/todo-plan.md` сохраняет навигацию проекта. После явного archive выбранный ACTIVE-plan переносится в архив, а его адрес получает navigation-plan со статусом `NONE` и той же принадлежностью сессии. Он не создаёт новый рабочий scope и не назначает работу, но обязан сохранять required-ссылки на:
- `docs/architecture/OVERVIEW.md` — компактную действующую архитектуру/структуру проекта;
- `docs/MODULES.md` — карту самостоятельных частей проекта;
- `docs/DOCUMENTATION_INDEX.md` — полный пополняемый индекс документации.

Цель navigation-plan в `NONE`: «Обсудите следующий этап проекта с пользователем». Recovery разворачивает required-документы из этих ссылок, поэтому новая сессия понимает существующий проект без чтения истории завершённых scopes и без ложного возврата к «идее нового проекта».

Каждый новый рабочий scope обязан завершаться единственной последней задачей `DOCS` с названием «Актуализация всех документов проекта». Она зависит от всех остальных задач scope. Агент проходит весь действующий комплект документации через `docs/DOCUMENTATION_INDEX.md`, исправляет только устаревшие документы и ссылки и фиксирует результат. Если все документы уже актуальны, задача может завершиться без искусственного редактирования содержательных файлов: отдельный управляемый commit фиксирует факт проверки вместе с завершением задачи.

`READY_FOR_ACCEPTANCE` допускается только после завершения `DOCS`. Этот enum сохраняется для совместимости истории и обозначает завершённость задач. Пользователь оценивает результат в диалоге; обязательного интерфейсного gate нет. Archive по-прежнему требует отдельной прямой команды пользователя. Если после пользовательской проверки потребовались изменения, `DOCS` снова должна быть последней незавершённой задачей после этих изменений.

`scope:create` нормализует обязательный project navigation context и добавляет/проверяет `DOCS`, чтобы агент не мог забыть эти правила при составлении очередного плана. `plan:apply` сохраняет `DOCS` последней и обновляет её зависимости при добавлении новых задач по поручению пользователя.

## Correction round после пользовательской проверки — scope 022

`READY_FOR_ACCEPTANCE` означает готовность результата к пользовательской проверке, но scope остаётся `ACTIVE`. Если пользователь после проверки поручает исправления до archive, `plan:apply` должен штатно вернуть тот же scope в `IN_PROGRESS`, добавить согласованные correction tasks перед финальной документационной задачей и повторно открыть `DOCS` как последнюю обязательную задачу.

Повторное выполнение `DOCS` не должно делать commit history неоднозначной. Для этого `commit_ref` поддерживает положительный `iteration`: первая фиксация задачи совместима с историческими commit без iteration и считается iteration 1; при повторном открытии уже завершённой `DOCS` её iteration увеличивается, статусы возвращаются в `TODO/PENDING`, зависимости пересчитываются на все остальные задачи scope. Commit trailers нового прохода содержат `Workflow-Iteration`, а resolver выбирает commit только требуемой iteration.

Обычные завершённые задачи остаются неизменяемыми. Повторное открытие разрешено только когда исходный scope остаётся `ACTIVE`, находится в `READY_FOR_ACCEPTANCE`, финальная `DOCS` завершена и пользователь явно добавляет новые задачи через `plan:apply`. Archive по-прежнему требует отдельной прямой команды пользователя. После correction tasks новая iteration `DOCS` снова является единственным путём к `READY_FOR_ACCEPTANCE`. Реализация использует `Workflow-Iteration` только для implementation commits; historical commits без этого trailer интерпретируются как iteration 1.


Scope 028 / T002: слой session-plans адресует канонический файл без глобального переключателя; legacy путь сохраняется.


T003: команды принимают --session/--plan; journal сохраняет plan_path, Git hooks читают именно кандидата этого плана.


T004: resolver различает scope/path/iteration; план другой сессии читается без присвоения pending-коммита. Один IN_PROGRESS писатель сохраняется для всех адресованных операций.


T006: canonical contextPacket формируется внутри Workflow Kit из одного проверенного snapshot. Web Pilot больше не нуждается в workspace-only выборе внешнего runtime для контекста сессии.

T010: установленный и поставляемый Workflow Core и шаблоны синхронно обновлены для адресованных планов сессий. Во всех командах используется sessionId из пакета; старый безадресный CLI разрешён только до появления связей. Подготовка продолжения не заменяет собственный план, выполнение DOCS не архивирует его. Продолжение сохраняет прежние commit references и повторно открывает DOCS.

T011: Workflow Kit 1.4.0 добавляет upgrade с 1.3.0, предварительную проверку новых файлов ядра и резервную копию перед заменой. Readiness проверяет контекст каждого канонического плана; Doctor проверяет все планы, восстанавливает только читаемую проекцию и сохраняет их в backup. Pre-push разрешает commit references всех планов. Согласование manifest допустимо только с полностью совпадающим доверенным комплектом, неизвестные изменения не перезаписываются.

Scope 029 / T002: историю и unfolded trailers читает штатный git log. Для commit message с patch divider --- сохраняется прежний interpret-trailers --parse; дубликаты и Workflow-Iteration не теряются. Несколько dependencies проверяет один git rev-list по графу, поэтому merge/replace refs не подменяются линейным порядком log. Семантика ошибок baseline, неоднозначных references, состава коммита и dependency order сохранена.

Scope 029 / T003: recoverState формирует проверенные validation/snapshot/COMPLETE одним проходом; status не запускает validate повторно. Полная инспекция переиспользует этот результат для диагностики и COMPLETE checks всех канонических планов. Публичного параметра skipValidate или injected validated object нет. Общий отпечаток входов до/после включает все планы/документы и Git/runtime metadata; изменение отклоняет устаревший успех. Повреждённый owned runtime не запускается для launcher probe.

## Интеграция readiness и recovery — scope 029 / T006

Web Pilot использует полный content-key WorkspaceSetup.ready и адрес sessionId/planId для отдельного RecoveryCache. Общий fingerprint учитывает все канонические планы, integrity и transaction; COMPLETE packet по-прежнему создаёт только Workflow Kit. Невозможность подтвердить ключ блокирует подготовку и Send, без обхода по возрасту пакета. Просмотр уже существующего чата не вызывает новый recover.

## Поставка 1.4.1 — scope 029 / T007

Installed/bundled ядро синхронно обновлено до patch-версии 1.4.1. Формат планов, адресация и recovery остаются совместимыми с 1.4.0. Обычный upgrade поддерживает 1.4.0 и сохраняет планы/commit references; штатный Doctor согласует manifest только при полном совпадении доверенного комплекта, с backup. Ускорение не отключает hooks или полную проверку планов.

T008: общий Git facade отключает только автоматическую запись stat-cache из porcelain diff через `diff.autoRefreshIndex=false`. Это устраняет повтор полной проверки из-за её собственного чтения индекса. GIT_OPTIONAL_LOCKS=0 уже присутствовал и сам по себе этот случай не устранял. Индекс продолжает входить в fingerprint целиком; явные записи и hooks сохранены.

## Поставка 1.4.11 — scope 038

Поставляемый комплект `resources/workflow-kit` заменён на Workflow Kit 1.4.11 из CodeAppServer+WebChatGPT, ветка `codex/gpt-provider-names`, коммит `badcf20` (tree `1fe409fb`). Тест закрепляет его версию и SHA-256 содержимого 35 файлов. Собственный Kit этого репозитория (`.harness/kit`) остаётся 1.4.1 и больше не обязан совпадать с поставляемым.

Recovery 1.4.11 передаёт вместе с Workflow Core правила `PROTOTYPE.md` и формы `PLAN`, `SPEC`, `CONTINUE`, `STAGES`. Ясное поручение разрешает короткий контракт и `plan:create`; добавлены `plan:extend`, `task:update`, адресная справка `--help` и сводка среды. Формат канонических планов (`schema_version 1`) и адресация `--session/--plan` не изменились, поэтому Web Pilot читает планы проектов 1.4.1 и 1.4.11 одним кодом.

## Workflow Kit 1.4.12 — планы по адресу сессии (0.6.53)

Живой прогон 0.6.52 показал: `plan:create --session <id>` с проверками сначала сохраняет конфигурацию, поэтому виртуальный план сессии записывается в `.harness/plans/by-session/<id>.md`, и `createScope` оставляет его там. Команды агента этот файл находили, а `listPlans` читал только `by-id`, поэтому сайдбар, Доктор и проверка готовности видели NONE. В 1.4.12 оба каталога канонические: `listPlans` и входы инспекции читают `by-id` и `by-session`, установщик обновляет установки 1.1.0–1.4.11. Остальной код 1.4.11 не менялся; исправление нужно перенести в исходный Kit (CodeAppServer, ветка `codex/gpt-provider-names`).

## Canonical package и staging — 0.6.58 / Workflow Kit 1.5.0

Исторические поставки 1.4.x выше сохраняют происхождение изменений. Текущий владелец source один: `/Users/oleksandroliinyk/VSCODE/WorkflowKit/src`, package `@webpilot/workflow-kit@1.5.0`. WebPilot programmatic imports используют package exports; external Workspace Setup/Project Doctor и Electron package получают generated runtime из `getRuntimeRoot()` в ignored `resources/workflow-kit`. Canonical и staged runtime подтверждены: 35 файлов, SHA-256 `0db567df6f0c8f68f3119a7322b4c1c6d28cd06bf57b267993b792097bbb2c75`.

1.5.0 делает `.harness/plans/todo-plan.md` единственным runtime current plan. `listPlans` и `sessionPlanView` transitional facade возвращают тот же current plan для любой session; prepared/unassigned пусты. Legacy `by-id`/`by-session` обнаруживаются только migration code и переносятся в `.harness/plans/archive/legacy-session-plans/`.

## Workflow Kit 1.5.1 / Web Pilot 0.6.72

Команда plan:carryover по прямому поручению архивирует исходный scope с сохранением реальных статусов и создаёт новый current plan из незавершённых задач, включая DOCS. Критерии, проверки, ссылки на planning/module документы сохраняются; перенос — один Git-коммит. Обычный archive требует всех DONE. Canonical runtime: 35 файлов, SHA-256 93de6bb6362dfe968f971922a24028886780a8df6b773730f721c7489532dd33. Общий контракт фазы 2 — docs/planning/event-driven-runtime.md; перенос не означает её завершения.
