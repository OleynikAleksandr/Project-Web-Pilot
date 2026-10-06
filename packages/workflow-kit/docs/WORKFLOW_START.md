# Начало работы

Используй доставленный recovery; если его нет — `./scripts/workflow recover --format json`. Current state всегда берётся из `.harness/plans/todo-plan.md` текущего Git checkout/worktree. Session ID может оставаться метаданными клиента, но не выбирает plan.

Правила работы и Git: `.harness/kit/templates/PROTOTYPE.md`, включённый в recovery. Используй сводку среды и проекта, не запрашивай неизменившиеся сведения повторно.

При NONE и ясном поручении запиши короткий контракт и создай plan через `plan:create` без повторного согласования. Если поручения нет, обсуди следующий этап. Формы плана и этапов recovery не включает: `plan:create --help` (PLAN и SPEC), `plan:extend --help` (CONTINUE), `task:start --help` (STAGES).

Продолжай незавершённую задачу. Новое поручение добавляй через `plan:extend`. Обычный цикл: `task:start` → работа и необходимая проверка → отдельный `commit --task`. Для code-only scope DOCS завершает план; при явном package/installed delivery DOCS стоит перед delivery-хвостом и переоткрывается при новой correction-работе.

Новый chat/client продолжает тот же current plan. Для независимой параллельной работы используй отдельный Git branch + worktree; historical plans остаются read-only history.

После последней задачи плана сообщи результат и способ запуска. Build/package/sign/notarize/release/publish разрешены только в явно названной delivery-задаче после актуализированной и зафиксированной DOCS. Архивирование current scope — только по прямому поручению пользователя.

При прямом поручении закрыть scope и перенести остаток используйте `plan:carryover --help`; не отмечайте перенесённые задачи выполненными.