# Начало работы

Project Web Pilot использует Workflow Kit 1.2 и Recovery Capsule v2. Обычная новая сессия, ручное «Обновить контекст» и будущий подтверждённый compact должны получать текущий execution capsule; повторно читать историю проекта «на всякий случай» не требуется.

## Что уже находится в capsule

- компактный Workflow Core;
- project/workspace/HEAD/scope/current task;
- цель, критерии и progress единственного todo-plan;
- required compact project overview и module specification;
- diff прямых task/context dependencies;
- staged/unstaged/untracked изменения текущей task;
- релевантная verification evidence и next action.

Optional/reference documents не копируются в payload. Большой `.harness/kit/WORKFLOW.md`, исторические `PRODUCT.md`, `ARCHITECTURE.md`, `VERIFICATION.md`, `DECISIONS.md` читаются только по явной необходимости через `docs/DOCUMENTATION_INDEX.md`.

## Новый запрос пользователя

1. Найти архитектурного владельца в `docs/MODULES.md`.
2. Для существующего модуля сначала обсудить и согласовать изменение его specification.
3. Если владельца нет — сначала создать/согласовать module specification и зарегистрировать модуль.
4. Только затем создавать или расширять todo-plan реализации.
5. Перед кодом начать task; каждую микрозадачу завершать управляемым commit с назначенными checks.

Todo-plan обязан перечислять весь внешний контекст, необходимый следующей сессии. Всё остальное является reference-only.

## Текущий Project Web Pilot

Единый macOS/Windows source of truth — `https://github.com/OleynikAleksandr/Project-Web-Pilot`. Mac является основной средой разработки; Windows используется для native validation после pull. Platform runtime/build/userData не синхронизируются через Git.

В приложении слева работает локальный workspace/project UI, справа — настоящий ChatGPT Web в изолированном Chromium. Локальные действия агента идут через MCP/tunnel; модельные API приложением не используются. Компактная карта — `docs/architecture/OVERVIEW.md`, владельцы — `docs/MODULES.md`.

Текущая версия приложения — 0.6.6 с Recovery v2, self-healing Runtime Lifecycle и исправленными Chat/Work sessions. Workflow Kit — 1.2.0. Детальные исторические проверки остаются в `docs/VERIFICATION.md` и не являются стартовым контекстом.

## Служебные команды

```bash
./scripts/workflow status
./scripts/workflow recover --format text
./scripts/workflow validate
./scripts/workflow doctor
```

В Windows PowerShell/CMD используется `./scripts/workflow.cmd`. Полный `.harness/kit/WORKFLOW.md` открывать только для точной семантики команд, repair/install/upgrade и редких аварийных сценариев.

Runtime Lifecycle реализован по `docs/modules/runtime-lifecycle.md`: приложение автоматически переиспользует/устанавливает runtime, восстанавливает stale PID и принимает динамические loopback endpoints; ручной выбор runtime остаётся аварийным override.
