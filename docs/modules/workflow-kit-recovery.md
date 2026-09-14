# Module Specification — Workflow Kit / Context Recovery

## Назначение

Дать агенту минимальный самодостаточный execution state, достаточный для безопасного продолжения текущего scope после новой сессии, ручного refresh или подтверждённого compact. Recovery не является архивом знаний проекта и его размер не должен расти вместе с возрастом проекта.

## Владелец функционала

Модуль владеет:
- единственным активным `.harness/plans/todo-plan.md`;
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
2. Один активный todo-plan; machine-managed поля меняются только командами Workflow Kit.
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
1. session metadata: project/workspace/HEAD/plan revision/scope/task/reason/signature;
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
- `scope:create / plan:apply / task:start / commit / archive` управляют lifecycle;
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
