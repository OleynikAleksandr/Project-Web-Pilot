# Живые страницы сессий

`SessionRuntimes` (`src/session-runtime.mjs`) на уровне приложения хранит отдельные WebContentsView, PageState, Composer, ContextSession, AgentTimer и ConversationRecovery. Ключ — workspace/sessionId/assignmentId/taskId; профиль входа ChatGPT общий, backgroundThrottling=false.

До первой страницы snapshot возвращает conversationRecovery={phase:'idle',message:'',canRetry:false}, agentRun=null: загрузка разрешений AutoPlan не требует runtime. Затем используются recovery/timer выбранной страницы.

## Представление и адресация

show/hide снимает view с contentView, сохраняя работу и обработчики. Уже открытый URL не загружается повторно, recovery не переотправляется. Навигация, epoch, отмена доставки и readiness принадлежат своей записи; поздний результат не меняет соседей. Тема и скрытие вызовов применяются ко всем живым страницам.

sessionStore имеет неизменный адрес. Фоновая запись attempt/chatUrl/recovery требует background и точного workspace/sessionId; обычные UI-методы проверяют выбор. Удалённые, архивные и чужие сессии недоступны. Фоновая проекция не выбирает строку панели.

Наблюдатель проверяет WebContents/mainFrame/документ. PageStateBridge имеет один ipcMain listener и карту получателей по WebContents; последний release снимает listener. Отсутствующий наблюдатель/render-process-gone дают видимую ошибку и отменяют неподтверждённую доставку своей страницы.

release без force отказывает при busy, pending-доставке или inFlight Composer; успешное освобождение снимает подписки. Закрытие приложения освобождает реестр, сохраняя независимые службы MCP. Контроллер не владеет BaseWindow; detach/attach и дополнительные окна не реализованы.

AgentTimer остаётся у своей страницы. ExecutorTimer сохраняет activeMs/waitingMs назначений — [parallel-execution](parallel-execution.md). Каждый основной runtime имеет AutoPlan/AutomationSendState/PlanMonitor через project-session-auto-plan; адрес отправки — record.project(), Composer и Session ID своей страницы, включая скрытую. Разрешения и журналы — [AutoPlan](auto-plan.md).

## Восстановление разговора

ConversationRecovery реагирует на видимый alert/Retry error UI, а не текст сообщения: stream recovery timed out, Resume stream unavailable, network error/connection lost на поддержанных EN/RU вариантах. Долгое ожидание/STALL_WARNING не запускают восстановление.

Для известного нормализованного chatUrl и manualStart либо отправленного attempt допускается одна автоматическая попытка через 3 с: перепроверяются URL, вход, поле, отсутствие черновика и другой операции, затем открывается тот же адрес. Новый чат, Send и Retry генерации не выполняются. Неизвестный URL/UNKNOWN Send запрещают перезагрузку.

«Перезагрузить страницу чата» видна по canRetry с причиной. HTTP 429 учитывает Retry-After (60–300 с), затем требует явного повтора. Ручной Stop подавляет автоматическое открытие до нового сообщения.

Checkpoint conversationRecovery={key,used,cooldownUntil,stoppedAt} сохраняется в своей сессии; использованная попытка записывается до перезагрузки. Смена выбора не сбрасывает чужой checkpoint. Restart сохраняет паузу, Stop и использованную попытку; черновик и UNKNOWN защищены.

## Readiness и доставка

Один worker проверяет папки последовательно. UI сохраняет последний ожидающий выбор; запросы исполнителей retain=true имеют отдельную очередь и не вытесняются выбором панели. Одинаковые запросы объединяются; CONCURRENT_CHANGE при inspect допускает один повтор. Кеш ограничен четырьмя папками; readiness не разрешает Send.

Явная сверка может возобновить ContextSession после CONTEXT_INPUTS_UNAVAILABLE/CONTEXT_CHANGED/PROJECT_READ_FAILED только до Send, без pending-операции и manualStart, сохраняя attempt. Отправленные/sending/UNKNOWN не переигрываются — [context-delivery](context-delivery.md).

Перед окончательным удалением проекта приложение проверяет остановку его чатов и команд, приостанавливает собственную очередь и освобождает только связанные runtime. Активная работа блокирует удаление; скрытие и архивирование по-прежнему не уничтожают страницы. После удаления watchers и проекции этого проекта очищены.

## Проверки и пределы

Electron smoke запускает настоящий main со старым глобальным AutoPlan ON в свежем временном профиле до окна/страницы; проверяет открытие панели и миграцию в OFF. Пользовательские данные не используются.

Unit покрывает адресацию, независимость страниц, смену представления без пересоздания, отказ release при работе, позднюю навигацию, recovery и фоновую очередь. Electron TEST FIXTURE проверяет отдельные WebContents и события скрытых страниц. Живые Chat/Work и native Windows принимает пользователь.
