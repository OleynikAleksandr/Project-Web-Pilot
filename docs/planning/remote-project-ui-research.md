# Исследование удалённого интерфейса Project Web Pilot

## Результат
Сравнить два варианта доступа к проектам, разговорам и current plan работающего Mac: дополнительный MCP plugin с UI внутри ChatGPT и мобильный клиент Project Web Pilot для iOS/Android. Дать рекомендацию по минимальному проверяемому следующему этапу, не реализуя его.

## Просмотр результата
Отчёт: `docs/research/remote-project-ui-options-2026-09-28.md`. Текущий scope ведётся в `.harness/plans/todo-plan.md`; отдельного плана чата нет.

## Проверка
Проверить официальную документацию OpenAI, платформ и существующие open-source решения на 2026-09-28. Сверить выводы с исходниками Web Pilot и завершённого ChatGPT_MCP_App_adapter. Разделить документированные возможности, прежние пользовательские наблюдения и непроверенные host/device сценарии. Проверка документа обнаруживает отсутствующие разделы/источники; она не заменяет реальную проверку UI.

## Границы
Только исследование и документация. Не менять приложение 0.6.58, Workflow Kit 1.5.0, MCP, tunnel, настройки, авторизацию или установленные приложения. Не возобновлять ChatGPT_MCP_App_adapter: только читать пригодные материалы. Не создавать отдельный Plan/Task store, не вводить model API и не автоматизировать native ChatGPT navigation. Сохранять один current plan на checkout/worktree и один пишущий агент на worktree.

## Владельцы
Workspace & Sessions — представление проекта/разговоров; Workflow Kit / Context Recovery — canonical current plan; Runtime Lifecycle — защищённый доступ к Mac. Исходные контракты: `docs/MODULES.md`, `docs/modules/workspace-sessions.md`, `docs/modules/workflow-kit-recovery.md`, `docs/modules/runtime-lifecycle.md`.
