# Начало работы

Используй доставленный recovery; если его нет — `./scripts/workflow recover --format json`. Current state всегда берётся из `.harness/plans/todo-plan.md` текущего Git checkout/worktree. Session ID может оставаться метаданными клиента, но не выбирает plan.

Правила работы и Git: `.harness/kit/templates/PROTOTYPE.md`, включённый в recovery. Используй сводку среды и проекта, не запрашивай неизменившиеся сведения повторно.

При NONE и ясном поручении запиши короткий контракт и создай plan через `plan:create` без повторного согласования. Если поручения нет, обсуди следующий этап. Recovery уже содержит PLAN.md, SPEC.md, CONTINUE.md и STAGES.md.

Продолжай незавершённую задачу. Новое поручение добавляй через `plan:extend`. Обычный цикл: `task:start` → работа и необходимая проверка → отдельный `commit --task`. Kit сохраняет DONE и повторно открывает финальную DOCS.

Новый chat/client продолжает тот же current plan. Для независимой параллельной работы используй отдельный Git branch + worktree; historical plans остаются read-only history.

После финальной DOCS сообщи результат и способ запуска. Архивирование current scope — только по прямому поручению пользователя.
