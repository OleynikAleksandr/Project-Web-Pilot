# Финальный этап Web Pilot: проект to-do для Review

Дата: 10.10.2026. **Статус: черновик декомпозиции, не активный план Kit.** Вход: [final-stage-recovery-spec.md](final-stage-recovery-spec.md), два пользовательских документа от 10.10.2026, результаты чтения исходников и тестов. Сценарии F01–F20/A01–A06 определены спецификацией; здесь указаны проверяемые результаты работ, зависимости и предварительные verification_ids. Все пункты **TODO**. Проверки, приведённые в спецификации как первоначальный аудит, не означают выполнения задач будущего плана.

## Стратегия, допуски и подготовка к публикации

- **Последовательное выполнение одним основным агентом**. Параллельность исправляется, её нельзя применять к этой разработке до отдельного пользовательского теста. Снимок сессии parallel_allowed=true/max_workers=4 разрешает выбор, но не требует parallel. Причина выбора: общий ledger/очередь, AutoPlan и основная страница имеют пересекающиеся состояния и области записи; последовательная работа снижает риск конкурентных правок.
- **Один current plan на checkout**. Не редактировать .harness/plans/todo-plan.md напрямую и не создавать параллельный TODO. После одобрения Review преобразовать пункты в одну формальную scope/tasks-пару через Workflow Kit; сохранить source/review positions. В списках файлов ниже указаны предполагаемые, а не разрешение менять любой файл без уточнения.
- Не запускать модельного исполнителя, автоматическую реальную parallel-реализацию, сборку, публикацию, установку, а также не останавливать или изменять пользовательский PL_Мастерская_файлов. Публикация плана и дальнейшая реализация выполняются в рамках следующего разрешённого этапа.
- **Базовая версия:** 0.6.110 и Kit 1.7.2. Версию будущего выпуска и необходимость Kit update определять отдельно после проверки манифестов. Не переиспользовать уже опубликованный выпуск 0.6.110 и не назначать 0.6.111 без проверки.
- **Существующие verification_ids:** unit-all, electron-smoke, executor-channel, project-lifecycle, kit-check; доставка по штатным paired-release, release-installed, github-release. Их текущий evidence в .harness/workflow.json относится к версии 0.6.110; до нового delivery оно должно быть обновлено штатным config:apply вместе с относящимися версиями и зависимостями. Нельзя использовать старое evidence как подтверждение нового результата.
- **Единый workflow:** согласовать точные spec/scope/tasks по Review ON; после публикации пройти микрозадачи с task:start и commit --task; DOCS перед отдельными delivery; завершить READY_FOR_ACCEPTANCE, не archive без пользователя. Review OFF означал бы обычную публикацию, но пользовательский флаг не менять агентом.

## P001 — Протокол и проверка границ безопасности (планирование, без фиктивного коммита)

**Результат:** согласована разница между SourceReady, MergeSafe, DiagnosticEligible и FinalEligible; определены главный адресат, один владелец записи main, fingerprint blocker, допустимые причины остановки и safe retry. Сверены F/A со средствами тестирования и точным состоянием Kit/Git.

**Работа:** сопоставить фактические контракты с разделами 2–5 спецификации, подтвердить отсутствие необходимости второго планировщика; проверить подписку на child command-activity и условие удаления acknowledged_unknown. Для F03 сохранить копию доказательств только в собственных черновиках, не изменяя тестовое дерево/сервер. Зафиксировать различие между автоматической диагностикой и действием с разрешения пользователя.

**Критерии:** все блокеры имеют причину, адресата и допустимое продолжение; ни один путь не снимает запрет на unsafe merge и не уничтожает UNKNOWN; отсутствуют обещания перебрать произвольные неисправности. Review-позиции и замечания включены в итоговую spec/задачи. P001 — работа **до публикации** плана, не отдельная implementation task.

## T001 — Минимальный последний READY и контролируемый writer после source

**Зачем:** существующий smoke подтверждает happy path, но не исходный F03.

**Результат:** изолированный Git/Kit fixture с минимальным source/коммитами и одним последним назначением на фоне ранее интегрированных задач; управляемые остановки на source pending, READY, writer started, merge pending, DONE и final pending. Нужные события и таймауты наблюдаемы независимо от разработки CSV/JSON/diff.

**Работа:** переиспользовать tests/parallel-execution-smoke-fixture.cjs, tests/parallel-finalization.test.mjs, packages/workflow-kit/scripts/check-parallel-execution-fixture.mjs; подготовить точный сценарий writer-сервера, стартующего после commit последнего исполнителя, и законченный ответ worker. На прежнем коде получить наблюдаемый blocker и отсутствие финального Send. При необходимости объединить регрессию с T002, чтобы не оставлять падающую обязательную проверку в DONE-коммите.

**Проверки:** F01 (контрольная точка), F03 (красный сценарий), снимки source/assignment/integration/Send; очистка только собственного fixture-процесса даже при падении. Не имитировать DONE простым подставлением флага вместо Git-доказательства.

**Файлы:** tests/parallel-finalization.test.mjs, tests/parallel-execution-smoke-fixture.cjs, новая узкая fixture только при необходимости.

**Verification:** unit-all; electron-smoke при изменении тестовой Electron-границы. **Зависимости:** утверждённый Review/P001.

## T002 — Жизненный цикл команд, сервер и гарантированные события

**Результат:** read_only сервер остаётся защищённым и живым, writer завершается наблюдаемым событием, а его блокировка точно видна; child command-activity будит очередь main. Ни один успешный source не ослабляет права записи команды.

**Работа:** сверить фактические инструкции назначений, SERVER_INSTRUCTIONS, описание exec_command(read_only) и код tools/codex-app-server-mcp с контрактом. Если backend уже корректен — не переписывать его ради нового изменения, исправить лишь недостающий путь событий и диагностики. Не определять безопасность по npm start, HTTP method, cwd, PID, имени или порту. Не менять количество MCP-инструментов. Проверить отдельную защиту удаления после acknowledged_unknown через прошлый boot, сохранить запрет для наблюдаемой живой службы.

**Проверки:** F02/F04/F05/F06, Writer→completion без write_stdin, child event→main reconcile, sandbox deny-write включая дочерний процесс, unsupported sandbox, потеря executor generation, legacy/malformed, защищённое удаление. Native Windows не объявлять проверенной по Mac. Только принадлежащие fixture процессы можно завершать автоматически.

**Файлы:** src/command-activity.mjs, src/parallel-kit.mjs, src/main.mjs, src/project-input-watch.mjs, при необходимости tools/codex-app-server-mcp/server.py и app_server_client.py; соответствующие tests/command-activity.test.mjs, tests/codex-app-server-mcp.test.mjs, tests/parallel-execution-recovery.test.mjs.

**Verification:** unit-all, executor-channel; project-lifecycle при изменении допуска удаления. **Зависимости:** T001.

## T003 — Безопасная диагностика блокировки и возврат финала в origin

**Результат:** при F03 сохраняется итоговое намерение; Writer блокирует **merge**, но не возможность строго ограниченной **диагностической передачи**. Если причина устранена законно, единственная очередь автоматически доводит итог до основного агента по событию. Ни один исход UNKNOWN не трактуется как успех.

**Работа:** встраивать diagnostic intent в существующий ledger, ParallelExecution и AutomationSendState; разделить SourceReady/MergeSafe/DiagnosticEligible; сохранить source SHA, blocker, identity, scope, main ownership, отправку и факт её неопределённости. Запретить конкурирующие correction/diagnostic/finalization и double merge; использовать действующую приостановку очереди. Проверять актуальную идентичность и HEAD перед последним Send. Состояние первоначального writer не меняется без пользовательского решения.

**Проверки:** F03/F07/F08/F09/F10/F16, writer после READY, исчезновение blocker до Send, завершение writer во время Send preparation, main/child dirty, assignment binding mismatch, transaction, check failed/launch failed, correction против diagnostic, snapshot/restart. Подтвердить **количество реальных Send и Git-интеграций**, а не только статус ledger.

**Критерии:** blocker показывается с ID, checkout, причиной и безопасным действием; разрешённая диагностика доходит до правильного origin или честно ждёт; не возникает безусловного разрешения merge, автоматического Ctrl-C чужой службы, потери source/pending и ложного DONE.

**Файлы:** src/parallel-execution.mjs, src/parallel-kit.mjs, src/execution-projection.mjs, src/main.mjs, src/automation-send-state.mjs, tests/parallel-finalization.test.mjs, tests/parallel-execution-recovery.test.mjs, tests/parallel-execution.test.mjs.

**Verification:** unit-all, electron-smoke при изменении интеграционной границы. **Зависимости:** T002.

## T004 — Одно итоговое поручение, проверенный ответ и устойчивый restart

**Результат:** последний READY → durable final intent → одна отправка → верифицированный main → completion OFF → наблюдаемый отдельный итоговый ответ. Ни перестановка событий, ни restart не дублируют Send. Состояние blocked/diagnostic не подменяет финальное завершение.

**Работа:** уточнить persist-before-Send и состояние sending, безопасный cancelled до клика, after-click UNKNOWN, MANUAL_STOP, manual OFF, completion OFF, draft/busy и общий pause gate; восстановление ledger без «наследования» чужого scope. Для reply-observed требуется свой новый законченный turn, а не смена pauseKey. Событие нового разрешённого ожидания продолжает pending без watchdog-повторной отправки.

**Проверки:** F01/F11–F19, двойной DOM/READY event, два проекта/два main-чата, stale URL/HEAD на последнем guard, restart на всех фазах, persist failure до/после Send, PAUSE_CONSUMED, пользовательский turn, ошибка ответа и отсутствие ответа. Реальные счётчики Send/merge/response проверяются отдельно.

**Критерии:** у каждого pending есть объяснимая причина; отправка лишь одному origin, ручной OFF/Stop соблюдаются; completion OFF не отменяет ранее разрешённый финал; sending/unknown никогда автоматически не повторяются.

**Файлы:** src/parallel-execution.mjs, src/automation-send-state.mjs, src/main.mjs, tests/parallel-finalization.test.mjs, tests/automation-send-state.test.mjs, tests/parallel-execution-smoke-fixture.cjs.

**Verification:** unit-all, electron-smoke. **Зависимости:** T003.

## T005 — Исправить предварительный AutoPlan ON и независимость основных чатов

**Результат:** ON до первого плана сохраняется при двух основных чатах и при ошибке чтения; первая подтверждённая публикация получает ON ровно один раз, следующий scope начинает OFF; origin берётся из опубликованного плана.

**Работа:** убрать программный OFF по stale per-chat NONE и sync(null), обеспечить авторитетную project-level синхронизацию с подтверждённым scope/identity/revision, разделить ручное и автоматическое выключение; исключить MANUAL_OFF из вызова программного flow.disable(). Не менять Review. Исключить reentrant onChange и передачу другому проекту.

**Проверки:** A01–A06, read error, разный порядок двух monitor, awaitingPlan restart, completion→новый scope, два проекта/Review, проверка persist, разрешённой фактической отправки и отсутствия дубликата. Проверить состояние кнопки, но не полагаться только на него.

**Критерии:** только пользовательское OFF/Stop либо подтверждённый completion меняет авторизацию; stale read может приостановить отправку, но не отозвать волю пользователя.

**Файлы:** src/project-auto-plan.mjs, src/project-session-auto-plan.mjs, src/auto-plan.mjs, src/main.mjs, tests/project-auto-plan.test.mjs и узкие тесты планового monitor.

**Verification:** unit-all, project-lifecycle. **Зависимости:** T004 как порядок последовательной разработки; технически основание дефекта независимо от T003.

## T006 — Сводная регрессия последнего этапа и UI диагностики

**Результат:** понятные состояния source/merge/blocker/diagnostic/final/reply; минимальный реальный Git/Kit/Electron цикл последнего READY проходит F03 до нормального конца; F01/F02 и F04–F20/A01–A06 имеют явное соответствие тестам и проверкам.

**Работа:** применить существующую карточку проекта без новых ручных управляющих кнопок; проверить доступность при 312 px, двух темах, focus/aria, быстрые переключения и отдельное отображение происхождения preview vs main. Тестировать сквозной продуктовый вход и регистрацию фактических Send/merge; расширять regression только по изменённым условиям. Добавить матрицу «сценарий → test/fixture → доказательства/ограничения» в подходящий действующий модуль при DOCS, не отдельный вечный отчёт.

**Проверки:** полный целевой F01–F20/A01–A06, обязательные комбинации из spec; Electron smoke и существующий Kit fixture; корректное завершение собственного сервера, без остановки пользовательского. PASS unit при отсутствующем живом ChatGPT не является его пользовательской приёмкой.

**Критерии:** F03 воспроизведён на старой логике и исправлен; ошибка различает ожидание события, unsafe blocker и обязательное решение пользователя; финальный main подтверждён собственными тестами, а не только по URL worker.

**Файлы:** src/ui/sidebar.mjs, src/ui/index.html, src/execution-projection.mjs, tests/parallel-execution-ui.test.mjs, tests/parallel-execution-smoke-fixture.cjs, tests/electron-smoke.mjs.

**Verification:** unit-all, electron-smoke; kit-check, только если изменяется packages/workflow-kit. **Зависимости:** T004 и T005.

## DOCS — Актуализировать действующие контракты после реализации

**Результат:** README, OVERVIEW и связанные docs/modules соответствуют проверенному поведению и версии; временные planning-документы перенесены в подходящие контракты и удалены без архивных копий по правилам Kit.

**Проверить:** docs/modules/parallel-execution.md, parallel-execution-acceptance.md, auto-plan.md, auto-plan-send.md, command-activity.md, codex-app-server-executor.md, workspace-sidebar-ui.md и связанные Kit-документы только при изменении их источника. Описать непротиворечивый пользовательский тест последнего этапа: настоящий Chat/Work, preview, автоматическая передача и итог, отдельное объяснение безопасной остановки writer. Не подменять native Windows/чистую ОС Mac fixture.

**Критерии:** следующие исполнители могут восстановить контракт по recovery; ограничения, небезопасные случаи и результаты проверок явно обозначены; старые версии в документах выпуска не оставлены. **Зависимости:** T006; никаких package/install/publish до DOCS.

## DELIVERY-1 — Одна штатная парная сборка (только после разрешённой реализации)

**Результат:** подготовленная и проверенная версия, один пакетный build macOS arm64/Windows x64 через paired-release при управляемом commit, подписанный постоянный app, актуальный manifest, полные файлы поставки и sourceCommit после DOCS. До delivery обновлены package/lock/Kit version и evidence **без подмены проверки**. Не запускать npm run build вручную перед commit.

**Verification:** paired-release. **Зависимости:** DOCS. **Граница:** cross-build Windows не равен native приёмке.

## DELIVERY-2 — Установить готовую сборку

**Результат:** готовый staging установлен без пересборки, сохранены filesystem identity, подпись и прежний Finder-алиас; работающий Web Pilot самовольно не перезапускается. Проверить путь назначения и symlink до записи.

**Verification:** release-installed. **Зависимости:** DELIVERY-1.

## DELIVERY-3 — Публикация GitHub и финальная сверка

**Результат:** тег на проверенном sourceCommit, шесть assets, GitHub Release/manifest, remote main и локальный Git согласованы после push, без повторной сборки. Пользователю сообщены версия, URL, проверки, ограничения и короткий живой сценарий финала.

**Verification:** github-release. **Зависимости:** DELIVERY-2. **Граница:** план READY_FOR_ACCEPTANCE, не archive без пользователя; серверы пользователя не остановлены.

## Перенос черновика в настоящий план

Для Review ON составить нормализованную структуру scope по форме review:prepare --help: scope_id, objective, approval_note, acceptance_criteria, approved_scope, documentation_paths, конкретные task functional_paths/documentation_paths, verification_ids, expected_commit_message, зависимости, context_pack и execution_reason. Каждую часть spec поместить в required context_pack. Добавить execution_origin_session_id сохранённой основной сессии внутри scope и recipient_session_id как отдельный верхнеуровневый адрес доставки. **Это разные сущности.**

P001 не должен оформляться фиктивной implementation-задачей, если он выполнен при согласовании. T001/T002 допустимо объединить после Review при риске заведомо красного обязательного теста. DOCS и доставка — разные этапы с отдельными проверками. Все задачи и ID носят предварительный характер до нормализации Kit. Новый current plan публикуется только через штатную команду и после завершения необходимого Review; завершённые задачи прошлого выпуска не переписывать.
