# Workflow Kit — Single Active Plan Migration
## Проектная спецификация и результат миграции

Статус: IMPLEMENTED — @webpilot/workflow-kit 1.5.0
Дата: 2026-09-27
Целевой workspace: /Users/oleksandroliinyk/VSCODE/WorkflowKit
Canonical package на момент подготовки: @webpilot/workflow-kit 1.4.13
Текущий HEAD на момент подготовки: b895149436ca3d2a390bced85e275196a3e76530

Документ сохранён как implementation record. Формулировки «следующая сессия» ниже описывают исходный план до выполнения; действующий контракт после реализации — Workflow Kit 1.5.0 и [Workflow Kit Package](../modules/workflow-kit-package.md).

---

## 0. Назначение

Этот документ является рабочей спецификацией следующей сессии WorkflowKit.

Он подготовлен после чтения:

- исходного архитектурного документа:
  /Users/oleksandroliinyk/Desktop/WorkflowKit_Single_Active_Plan_Migration_Planning.md
- companion-документа Project Web Pilot:
  /Users/oleksandroliinyk/Desktop/Project_Web_Pilot_Single_Active_Plan_Adaptation_Planning.md
- hot-swap/product-part архитектуры:
  /Users/oleksandroliinyk/Desktop/Project_Web_Pilot_WorkflowKit_HotSwap_ProductPart_Architecture_Specification.md
- фактического Workflow Kit 1.4.13 source/runtime/tests.

Следующая сессия должна реализовать архитектурный переход:

> Workflow Kit описывает состояние Git checkout/worktree, а не состояние чата.

---

## 1. Финально принятое решение пользователя

Новая базовая модель:

~~~text
one Git checkout/worktree
        =
one current working state
        =
one active Workflow Kit plan
~~~

Канонический current plan:

~~~text
.harness/plans/todo-plan.md
~~~

Chat/WebPilot session больше не является владельцем plan.

Новая ChatGPT/WebPilot session:

- не создаёт новый plan;
- не копирует current plan;
- не получает собственный plan file;
- не вызывает plan:prepare;
- просто получает recovery текущего todo-plan.md и продолжает работу.

Если нужна реальная параллельная независимая работа:

~~~text
Git branch + Git worktree
~~~

Каждый worktree имеет собственный todo-plan.md.

---

## 2. Отдельное решение: plan:prepare удаляется

Текущий prepared-plan, которым будет запущена следующая session, является последним использованием старой модели.

После миграции permanent semantics НЕ содержат:

- plan:prepare;
- plan:bind;
- plan:adopt как ownership operation;
- prepared_in_session_id;
- owner_session_id как runtime owner;
- future plan handoff между chat sessions.

Новый независимый plan появляется только:

1. после lifecycle завершения/архивирования текущего plan в том же checkout; или
2. в другом Git worktree.

---

## 3. Backward compatibility со старыми WebPilot sessions

Project Web Pilot должен уметь читать старые chat/session records.

Поэтому новая версия Workflow Kit должна сохранить мягкий compatibility path.

### 3.1 --session

Для обычных active-plan команд --session временно принимается как compatibility/no-op argument.

Примеры:

~~~text
workflow status --session OLD_SESSION
workflow recover --session OLD_SESSION
workflow task:start T001 --session OLD_SESSION
~~~

Все они работают с одним current todo-plan.md.

Session ID:

- может быть syntactically validated;
- может быть использован клиентом для diagnostics/navigation;
- не выбирает plan;
- не определяет owner;
- не меняет project state routing.

### 3.2 --plan

--plan больше не является selector произвольного active/historical plan.

Рекомендуемый compatibility rule:

- если передан current scope_id, допускается no-op compatibility;
- если передан другой legacy/historical plan ID, runtime command не переключается на него;
- вернуть ясную ошибку наподобие PLAN_NOT_CURRENT / HISTORICAL_PLAN_READ_ONLY;
- historical access должен быть отдельным read-only history/audit path, если он понадобится.

Не делать silent fallback на historical plan.

### 3.3 sessionPlanView compatibility facade

Package export sessionPlanView может временно сохраниться для Project Web Pilot migration.

Но его семантика становится:

~~~text
sessionPlanView(root, anySessionId)
  → current todo-plan.md
  → same current plan for every old/new chat session
~~~

Допустимо вернуть session_id echo для клиента.

prepared должен быть пустым.

Legacy historical metadata при необходимости может быть отдельным read-only field, но не влияет на current plan.

Это transitional consumer facade, не новая ownership model.

---

## 4. Старые WebPilot sessions после адаптации

Project Web Pilot продолжает хранить:

- sessionId;
- chatUrl;
- title;
- titleSource;
- Chat/Work experience;
- created/opened dates;
- archive state;
- useful delivery receipts.

Но старые поля:

- planId;
- originSessionId;
- legacyPlanId;
- plan binding metadata

не выбирают Workflow Kit plan.

Правило UX:

> Открыть старую session = открыть старый разговор + показать актуальный current plan checkout.

Если пользователь хочет посмотреть historical plan, связанный с этим разговором раньше, это отдельный read-only history view.

---

## 5. Текущий baseline 1.4.13

На момент подготовки:

~~~text
package: @webpilot/workflow-kit
version: 1.4.13
Node: >=22
runtime files: 35
canonical digest:
da763a50c32583553b6ca06e29c975766ab092890bbf9787bd2a6aca87be44c4
~~~

Текущий repository:

~~~text
/Users/oleksandroliinyk/VSCODE/WorkflowKit
HEAD b895149436ca3d2a390bced85e275196a3e76530
main
clean
~~~

Package checks до новой миграции:

- package;
- runtime;
- consumer-contract.

Новая версия обязана получить новый version number.

Рекомендуемый candidate: 1.5.0.

Точный bump подтвердить в начале следующей сессии по фактической текущей версии и принятой versioning policy.

Не переиспользовать 1.4.13 для изменённой semantics.

---

## 6. Фактическое текущее plan storage

Сейчас существуют:

~~~text
.harness/plans/todo-plan.md
.harness/plans/by-id/
.harness/plans/by-session/
.harness/plans/archive/
~~~

session-plans.mjs считает todo-plan, by-id и by-session одновременно canonical.

Это должно прекратиться.

После migration:

~~~text
.harness/plans/todo-plan.md       CURRENT
.harness/plans/archive/...        HISTORY
~~~

by-id / by-session могут читаться только migration code старой установки.

После успешной migration они не являются runtime plan directories.

---

## 7. Текущий self-host state

В самом WorkflowKit repository сейчас:

~~~text
.harness/plans/todo-plan.md
  scope = NONE
  revision = 1

.harness/plans/by-session/web-pilot-17b338f4-79ec-4097-a18d-5b6b903a2e24.md
  scope = canonical-workflow-kit-package-001
  ACTIVE / READY_FOR_ACCEPTANCE
~~~

Следующая session будет создана ещё старым plan:prepare mechanism.

Это последний prepared/session-owned plan.

Self-host migration требует осторожности:

- во время implementation использовать установленный старый runtime, пока plan не завершён;
- не переключать repository на новую semantics посреди незавершённой managed task без специально проверенного cutover;
- final package tests выполняются на fixtures;
- после завершения plan/DOCS новый installer может перевести self-host installation на single-active layout;
- завершённый legacy session plan сохраняется как history;
- canonical todo-plan после завершения может остаться NONE.

Не требуется автоматически делать старый completed session plan новым active plan.

---

## 8. Core data model после migration

Current active plan source:

~~~text
PLAN = .harness/plans/todo-plan.md
~~~

Runtime operations:

- status;
- validate;
- recover;
- plan:create;
- plan:extend;
- scope:create;
- task:start;
- task:update;
- plan:apply;
- commit;
- repair;
- archive;
- config:apply

работают только с current PLAN.

Никакая обычная operation не выполняет поиск active plan по session ID.

---

## 9. План schema

Не вводить новый parallel plan format.

Сохранить schema_version 1, если фактическая migration не требует schema bump.

Поля owner_session_id и prepared_in_session_id:

- больше не создаются для current plan;
- не требуются schema;
- не выводятся renderPlan для нового current state;
- могут оставаться внутри archived historical snapshots.

Если parser сегодня допускает эти legacy fields, он может продолжать читать их в migration/history context.

Runtime current plan должен игнорировать/remove их.

---

## 10. session-plans.mjs

Текущий файл содержит:

- PLANS_DIRECTORY = by-id;
- SESSION_PLANS_DIRECTORY = by-session;
- listPlans();
- selectPlan();
- withSessionPlan();
- sessionPlanView();
- assertSingleWriter();
- assertSelectionOwner().

После migration рекомендуемая роль:

### Core runtime

Core plan selection больше не должен зависеть от этого module.

Обычные commands используют current todo-plan напрямую.

### Legacy migration

Module или его replacement может содержать helpers:

- discoverLegacyPlans();
- readLegacyPlans();
- archiveLegacyPlans();
- compatibilitySessionPlanView().

Не сохранять старую routing architecture только ради имени файла.

---

## 11. CLI contract

### status

~~~text
./scripts/workflow status
~~~

Работает без session.

### validate

~~~text
./scripts/workflow validate
~~~

Работает без session.

### recover

~~~text
./scripts/workflow recover --format text
~~~

Однозначно возвращает current checkout recovery.

### plan:view

Если команда сохраняется:

~~~text
./scripts/workflow plan:view
~~~

показывает current plan.

--session может временно приниматься, но не влияет на результат.

### plan:create / plan:extend / task commands

Работают с current plan.

### plan:prepare / plan:bind / plan:adopt

Удалить из постоянного command contract.

На transition допустима понятная explicit deprecated/removed error, но не скрытое создание session plans.

---

## 12. currentPlanSelection / withPlanFile

Текущий common.mjs содержит dynamic plan selection context.

Нужно исследовать, какие части нужны не только session-owned plans.

Если withPlanFile используется для transaction/fixture/installer internals:

- сохранить generic file context только там, где он реально нужен;
- удалить sessionId ownership semantics;
- не использовать global selection для выбора runtime current plan.

Не заменять session routing другой скрытой routing layer.

---

## 13. Legacy migration algorithm

Upgrade 1.4.13 → single-active version должен безопасно распознать session-owned installation.

### Preconditions

Не выполнять destructive migration если:

- transaction pending;
- Git operation active;
- required manifest повреждён;
- todo-plan.md не может быть надёжно прочитан.

### Step 1 — inventory

Собрать:

~~~text
todo-plan.md
by-id/*.md
by-session/*.md
existing archive
~~~

Для каждого legacy file сохранить:

- path;
- scope_id;
- owner_session_id;
- prepared_in_session_id;
- execution status;
- delivery status;
- current_task_id;
- digest.

### Step 2 — current winner

Если todo-plan.md valid:

> Он является current plan после migration.

Даже если scope = NONE.

Не выбирать другой plan автоматически только потому, что в by-session есть ACTIVE plan.

### Step 3 — invalid current plan

Если todo-plan отсутствует/invalid:

- не угадывать winner;
- не объединять plans;
- не продвигать случайный by-session plan;
- migration останавливается non-destructively;
- diagnostics показывает точную причину и список legacy candidates.

### Step 4 — backup

Перед move/archive создать достаточную backup/evidence.

Использовать существующую installer backup practice.

### Step 5 — archive legacy plans

Все by-id/by-session files сохраняются как history.

Рекомендуется отдельный namespace, например:

~~~text
.harness/plans/archive/legacy-session-plans/
~~~

Точный layout можно скорректировать, если существующий archive contract требует другое.

Обязательные свойства:

- collision-safe;
- origin path recoverable;
- no data loss;
- idempotent;
- historical owner fields preserved.

### Step 6 — normalize current

Current todo-plan:

- не содержит runtime owner_session_id;
- не содержит prepared_in_session_id;
- не зависит от session_experience;
- сохраняет project/scope/tasks/revision/state.

### Step 7 — idempotency

Повтор upgrade:

- не создаёт дубликаты;
- не повторяет destructive move;
- не меняет already migrated current plan;
- не создаёт новый Git commit без изменений.

---

## 14. Несколько legacy ACTIVE plans

Это ожидаемый legacy condition.

Новая migration не решает, кто из них “правильный”.

Если todo-plan valid:

- todo-plan остаётся current;
- все legacy ACTIVE/unfinished session plans сохраняются как history;
- diagnostics сообщает, что legacy unfinished plans archived;
- пользователь может читать их вручную;
- они не участвуют в runtime readiness.

Не merge tasks автоматически.

---

## 15. Historical oversized recovery

Исходная проблема Project Web Pilot:

legacy plans могли ссылаться на растущие WORKTREE docs и позже превышать 180000 byte transport hard limit.

Новая architecture устраняет это системно.

После migration:

- full recovery строится только для current plan;
- archive recovery не строится при ordinary status/open/inspect;
- historical oversized plan не блокирует project readiness;
- hard limit 180000 bytes сохраняется для current recovery;
- silent truncation запрещён.

Если current plan превышает budget:

- recovery должен fail точно на current state;
- diagnostics не размножает ошибку на chats/history.

---

## 16. Installer/readiness

Сегодня installer inspect проходит listPlans(root) и status/recover для нескольких canonical plans.

После migration normal readiness должен проверять:

1. managed installation files;
2. manifest/version;
3. current todo-plan structural validity;
4. current plan status;
5. current recovery completeness, если required;
6. launcher;
7. hooks/checks;
8. Git state.

Historical archive:

- не является readiness dependency;
- не вызывает full recover;
- при желании проверяется Doctor structurally/on demand.

---

## 17. inspection-inputs

Текущие inputs включают:

~~~text
.harness/plans/by-id
.harness/plans/by-session
~~~

После migration legacy history не должен инвалидировать current readiness/cache.

Normal project inspection inputs должны включать current active state.

Archive можно:

- исключить из normal inspection key;
- включить только в explicit historical Doctor mode.

Точное решение принять по фактическому current caching contract.

---

## 18. Recovery format

Сохранить один canonical recovery builder.

Убрать session-owned content:

- SESSION И КОМАНДЫ block как plan routing instruction;
- требование передавать --session;
- plan:prepare instruction;
- prepared plans listing;
- owner session selection.

Recovery должен ясно говорить:

~~~text
Current plan:
.harness/plans/todo-plan.md

Current worktree:
<absolute path>

Commands:
./scripts/workflow <command>
~~~

Если caller передал session ID compatibility argument, это не должно менять recovery content/state selection.

---

## 19. Context budget

Сохранить:

~~~text
soft_tokens
hard_tokens
hard_bytes
TRANSPORT_HARD_BYTES = 180000
~~~

Не вводить truncation.

Migration не лечит oversized current plan сокрытием context.

Она только перестаёт без необходимости восстанавливать historical plans.

---

## 20. task lifecycle

Сохранить:

- one current_task_id;
- task:start;
- task:update;
- managed commit;
- transaction journal;
- repair;
- verification evidence;
- DOCS final task;
- READY_FOR_ACCEPTANCE state.

Изменяется только plan routing.

---

## 21. plan:create semantics

plan:create создаёт current scope в todo-plan.md.

Если current plan уже ACTIVE/BLOCKED:

- применяются существующие lifecycle restrictions;
- новая chat session не является причиной create.

Не создавать by-session file.

---

## 22. plan:extend semantics

Новый user request в любой chat/client расширяет current plan.

Это может произойти из:

- Project Web Pilot;
- ChatGPT Desktop;
- Codex CLI;
- другого agent.

Client session не имеет значения.

---

## 23. archive semantics

Archive current completed/accepted scope по действующему explicit lifecycle.

После archive current todo-plan возвращается к NONE/current project navigation state.

Historical archive не становится active автоматически.

Chat lifecycle не управляет archive.

---

## 24. Git worktree model

Workflow Kit не обязан создавать worktree автоматически.

Но architecture должна естественно работать:

~~~text
repo/
  main worktree/
    .harness/plans/todo-plan.md

  feature worktree/
    .harness/plans/todo-plan.md
~~~

Каждый checkout работает со своим filesystem/Git state.

Не вводить global registry active plan.

---

## 25. Templates и instructions

Обязательно обновить:

- src/WORKFLOW.md
- src/templates/AGENTS.md
- src/templates/START.md
- src/templates/PLAN.md
- src/templates/CONTINUE.md
- src/templates/STAGES.md
- src/templates/PROTOTYPE.md
- command-help.

Удалить инструкции:

- “передавай --session”;
- “plan принадлежит этой session”;
- “prepare future plan”;
- “bind to new Chat/Work session”;
- “selected UI session is address”.

Добавить:

- one checkout = one current plan;
- new chat continues current plan;
- parallel work = Git worktree;
- historical plans are read-only;
- session IDs are client metadata, not project routing.

---

## 26. Installation files

installation-files.mjs сейчас описывает plans by-id в generated docs/index.

После migration generated project docs должны отражать single-active contract.

Fresh install новой версии:

- создаёт todo-plan.md;
- не создаёт active by-id/by-session routing directories как requirement;
- templates учат sessionless commands.

Legacy directories могут появляться только при upgrade history.

---

## 27. Package public API compatibility

Current WebPilot imports subpaths from @webpilot/workflow-kit.

Новый package должен сохранять consumer compatibility там, где это разумно.

Особенно:

- installer;
- common;
- plan;
- recovery;
- actions;
- inspection-inputs;
- installation-files;
- git.

session-plans subpath может временно сохраниться как compatibility facade.

Но package docs должны объявить:

- session ownership deprecated/removed;
- current plan is checkout-scoped;
- sessionPlanView compatibility semantics.

---

## 28. Project Web Pilot adaptation contract

Companion file:

/Users/oleksandroliinyk/Desktop/Project_Web_Pilot_Single_Active_Plan_Adaptation_Planning.md

WebPilot после adaptation:

- сохраняет старые chat sessions;
- не использует planId как selector;
- новую session создаёт как chat only;
- recovery получает current checkout plan;
- UI project card показывает current plan;
- sessions остаются chat history;
- Workspace Setup не full-recovers historical plans.

WorkflowKit migration должна сделать этот consumer adaptation возможным без data loss.

---

## 29. Hot-swap Project Web Pilot architecture

Companion file:

/Users/oleksandroliinyk/Desktop/Project_Web_Pilot_WorkflowKit_HotSwap_ProductPart_Architecture_Specification.md

В него внесено обязательное уточнение single-active-plan.

Следующий WebPilot hot-swap bridge НЕ должен закреплять obsolete commands:

- plan.prepare;
- plan.bind;
- session-owned plan routing.

Будущий bridge отражает checkout plan operations.

---

## 30. Regression fixture strategy

Existing scripts/check-runtime-fixture.mjs сейчас специально доказывает session-owned plan + prepared-plan semantics.

Его нужно переписать как primary single-active fixture.

Минимальный new fixture:

### Fresh installation

- install;
- todo-plan NONE;
- plan:create without --session;
- status without --session;
- recover without --session;
- task flow.

### Compatibility --session

- status --session old-A = same current plan;
- recover --session old-B = same current plan;
- no owner created.

### Compatibility view

- sessionPlanView(A) current plan;
- sessionPlanView(B) same plan;
- prepared empty.

### Legacy upgrade

Создать 1.4.13-style fixture:

~~~text
todo-plan valid
by-session/session-A.md
by-session/session-B.md
by-id/prepared-X.md
~~~

После update:

- todo-plan preserved;
- legacy files archived;
- no data loss;
- repeat update no-op.

### Legacy unfinished plans

Несколько legacy ACTIVE plans:

- preserved history;
- no automatic merge;
- no readiness block.

### Oversized history

Historical plan can exceed current transport budget or reference large docs.

Project inspect/current recovery still succeeds if current plan valid.

### Current oversized plan

Current recovery still fails strict budget.

### Worktree isolation

Separate worktrees/repositories maintain separate todo-plan state.

---

## 31. Consumer contract test

scripts/check-consumer-contract.mjs должен доказать:

- local file dependency;
- packed standalone consumer;
- current package imports;
- current runtime staging;
- compatibility facade needed by WebPilot;
- no sibling repository required after pack.

Не нужно сохранять old session-owned behavior как acceptance.

---

## 32. Package check

scripts/check-package.mjs:

- current version;
- canonical fileset;
- package exports;
- runtime digest.

Digest изменится после functional migration.

Не оставлять old 1.4.13 digest как expected new version.

---

## 33. Version/upgrade path

Новый package installer должен принимать upgrade source 1.4.13.

Также сохранить поддерживаемые старые версии в объёме, который реально поддерживает current installer.

Migration path должен быть explicit:

~~~text
session-owned schema/runtime
        ↓
single-active-plan runtime
~~~

Release/version docs обновить.

---

## 34. Self-host cutover

Это отдельная acceptance operation.

Во время implementation следующей session old installed Kit продолжает обслуживать prepared plan.

После всех technical tasks и final documentation:

1. package checks new version pass;
2. fixture migration pass;
3. current working tree clean;
4. legacy plan backup verified;
5. new installer updates WorkflowKit repository installation;
6. completed session-owned plan goes to history;
7. todo-plan.md remains canonical current state;
8. sessionless status/recover works;
9. --session compatibility call returns same current state;
10. no prepared future plan is created afterward.

Если self-host cutover невозможно сделать безопасно в той же session, не импровизировать: завершить package release and evidence, затем выполнить explicit cutover before next ordinary development session.

---

## 35. Project Web Pilot package transition

WorkflowKit work не должно редактировать Project Web Pilot source.

После new package is ready:

- передать version/consumer contract WebPilot agent;
- WebPilot adapter migration выполняется в своём workspace;
- old chats preserved;
- session plan selection removed;
- paired macOS/Windows release required там, не здесь.

---

## 36. Non-goals

Не добавлять:

- automatic worktree manager;
- merge/cherry-pick manager;
- new plan database;
- cloud state;
- OpenAI API;
- ChatGPT Desktop-specific protocol;
- second recovery format;
- hidden session-plan router;
- automatic merge legacy plans;
- automatic selection of “best” legacy plan.

---

## 37. Source files to inspect/modify

Minimum:

~~~text
package.json
index.mjs
src/cli.mjs
src/WORKFLOW.md
src/lib/session-plans.mjs
src/lib/actions.mjs
src/lib/recovery.mjs
src/lib/installer.mjs
src/lib/common.mjs
src/lib/plan.mjs
src/lib/transaction.mjs
src/lib/inspection-inputs.mjs
src/lib/installation-files.mjs
src/lib/command-help.mjs
src/lib/simple-workflow.mjs
src/lib/validate.mjs
src/schemas/plan.schema.json
src/schemas/workflow.schema.json
src/templates/AGENTS.md
src/templates/START.md
src/templates/PLAN.md
src/templates/CONTINUE.md
src/templates/STAGES.md
src/templates/PROTOTYPE.md
scripts/check-package.mjs
scripts/check-runtime-fixture.mjs
scripts/check-consumer-contract.mjs
~~~

Actual changes determine final commit files.

---

## 38. Project documentation to update

Minimum:

~~~text
docs/PRODUCT.md
docs/architecture/ARCHITECTURE.md
docs/architecture/OVERVIEW.md
docs/MODULES.md
docs/DOCUMENTATION_INDEX.md
docs/modules/workflow-kit-package.md
docs/planning/canonical-workflow-kit-package.md
docs/planning/single-active-plan-migration.md
~~~

Historical documents can retain historical descriptions if clearly marked history.

Current docs must not teach session-owned semantics as active contract.

---

## 39. Existing checks

Current project check IDs:

~~~text
package
runtime
consumer-contract
~~~

Use them rather than introducing unnecessary duplicate check infrastructure.

runtime check should gain single-active + legacy migration assertions.

consumer-contract should gain transitional WebPilot compatibility assertions.

package remains final package/fileset verification.

---

## 40. Acceptance criteria

Migration is complete when:

1. Exactly one current canonical plan exists per checkout.
2. Current source is todo-plan.md.
3. status works without --session.
4. validate works without --session.
5. recover works without --session.
6. plan:create/extend/tasks operate current plan only.
7. --session is accepted temporarily but cannot select plan.
8. Different old session IDs see the same current plan.
9. plan:prepare is removed from permanent workflow.
10. plan:bind ownership transfer is removed.
11. plan owner fields are not written to new current plans.
12. Legacy by-id/by-session plans migrate without data loss.
13. Multiple legacy active plans are preserved, not merged.
14. Historical plans do not block readiness/recovery.
15. Historical oversized recovery does not block project open.
16. Current oversized recovery still fails strict hard limit.
17. Installer migration is idempotent.
18. Fresh install uses single-active model.
19. Existing current todo-plan wins migration when valid.
20. Invalid current todo-plan causes safe migration stop, not automatic winner selection.
21. New WebPilot can preserve old sessions while reading one current plan.
22. ChatGPT Desktop/Codex can call recover without knowing WebPilot session ID.
23. Separate Git worktrees can hold separate current plans.
24. Templates/docs describe new model.
25. New package version and upgrade path are verified.
26. Package/runtime/consumer checks pass.
27. No silent truncation.
28. No hidden second canonical plan store.

---

## 41. Recommended implementation sequence

~~~text
T001
Single-active core/CLI compatibility

T002
Legacy migration + installer/readiness

T003
Recovery/inspection/templates single-active conversion

T004
Regression fixture: legacy sessions, oversized history, worktree isolation

T005
Consumer compatibility for Project Web Pilot

T006
Version/package/upgrade verification and handoff

DOCS
Final documentation
~~~

Detailed task contract is in the companion Desktop To-Do Plan.

---

## 42. Start-of-session instructions

Agent must:

1. Read this file.
2. Read AGENTS.md.
3. Check git status/HEAD/version.
4. Recover the prepared plan delivered by Web Pilot.
5. Re-run repository-wide search for session-owned terms.
6. Verify no other agent changed canonical source.
7. Review current Project Web Pilot companion planning docs only as consumer contract.
8. Start T001 using old 1.4.13 Workflow Kit process.
9. Do not use plan:prepare again after this migration plan.
10. Do not archive the current plan unless user explicitly asks under the then-current lifecycle.

---

## 43. Main thesis

> Workflow Kit current state belongs to the checkout.

Chat can change.

Client can change.

Agent can change.

The current plan remains one.

Parallel state requires a parallel Git worktree.

---

## 44. Release result

Scope реализован в **@webpilot/workflow-kit 1.5.0**.

Release runtime:

- canonical source files: 35;
- SHA-256: `0db567df6f0c8f68f3119a7322b4c1c6d28cd06bf57b267993b792097bbb2c75`;
- fresh install использует один current `.harness/plans/todo-plan.md`;
- installer поддерживает upgrade from 1.4.13 и переносит `by-id/by-session` в read-only history;
- legacy `--session` остаётся compatibility/no-op, а historical `--plan` не становится runtime selector;
- package, runtime и consumer-contract проверки прошли в управляемом T006 commit `adc38a21c111edc718f0652093a627d824b71c3c`;
- self-host cutover выполняется после финального DOCS commit согласно разделу 34, без создания prepared future plan.
