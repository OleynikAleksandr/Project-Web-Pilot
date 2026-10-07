# Workflow Kit 1.6.0 — контракт пакета

@webpilot/workflow-kit — пакет packages/workflow-kit репозитория Project Web Pilot. Node 22+; рабочий consumer Web Pilot 0.6.98 использует Node 24.21.0. Исходник — src/, установленная .harness/kit и resources/workflow-kit — производные копии. Версии/хеши поставок читаются из manifest и Git, не из истории в README.

## Публичный API
```js
import { VERSION, getRuntimeRoot, currentPlanView, sessionPlanView } from '@webpilot/workflow-kit';
import { contextPacket } from '@webpilot/workflow-kit/lib/recovery';
import { install, inspect } from '@webpilot/workflow-kit/lib/installer';
```
Существующие lib-subpaths (common/actions/plan/transaction/installer/inspection-inputs/installation-files/git/session-plans и остальные), schemas/templates/WORKFLOW, CLI и installer exports сохраняются.

currentPlanView(root) возвращает current todo-plan, scope/plan_id и parsed plan. sessionPlanView(root, sessionId) — совместимый фасад того же checkout: session_id может отражаться в результате, prepared/unassigned пусты; исторический planId не выбирает состояние. Независимая работа требует отдельного worktree, который Kit сам не создаёт.

## План и команды
Один .harness/plans/todo-plan.md на checkout. Legacy --session — только метаданные; --plan допускает current scope, иначе PLAN_NOT_CURRENT. plan:prepare/bind/adopt удалены.

plan:create начинает реализацию при NONE; ясный запрос допускает спецификацию и план без фиктивного дополнительного согласования. Исследование/обсуждение не требует плана. task:start → работа → commit --task сохраняют фактические файлы, trailers, references и проверки. Транзакция и Git-история проверяются существующим resolver; промежуточный service commit не теряет файлы задачи.

plan:extend сохраняет позиции/содержимое DONE. before вставляет работу перед не начатой задачей и добавляет зависимость; зависимости вперёд недопустимы. spec — поле верхнего уровня, task:update уточняет checks/files/acceptance.

DOCS требуется перед явно назначенным delivery. Новый раунд выпуска получает DOCS/DOCS-2/... и отдельную iteration; старые delivery сохраняют прежние зависимости. Без выпуска автоматической DOCS нет. Pre-push не пропускает незавершённую DOCS; all DONE означает READY_FOR_ACCEPTANCE, не автоматическое закрытие.

docs:commit при NONE/idle ACTIVE фиксирует .md вне .harness/ ролью documentation, без suite приложения. Kit-секции AGENTS.md/AGENTS.override.md в index должны совпадать с HEAD. Все изменённые .md/.markdown любого регистра проверяются до ролей/тестов по budget.document_bytes (default 28000), кроме точного todo-plan.md. Ошибки сохраняют правки и дают команду повтора.

archive требует всех DONE и прямого поручения; сохраняет пустой current plan с archived_scope_id, прошлый читается из родителя closing commit. plan:carryover по поручению переносит незавершённые задачи, критерии/проверки/контекст и зависимости, сохраняет source_commit; нужен чистый checkout без активной задачи и точная revision. Архивных копий нет; повторы/прерывания обслуживает обычная транзакция.

project:rename меняет имя current plan и пути hooks в manifest служебным kit-update; не переименовывает папку. При активной задаче/неверном имени отказ, без изменений повторного коммита нет.

## Recovery и документы
Общий пакет — Workflow Core, PROTOTYPE, проектные ограничения AGENTS и OVERVIEW; README не обязателен. ACTIVE содержит все карточки задач и целые выбранные документы; NONE — компактный прошлый план и Git-ссылки. MODULES/INDEX совместимых старых проектов передаются ссылкой даже при required. Формы по --help, сырые JSON/diff не включаются.

Документы дедуплицируются по path/revision, required побеждает. WORKTREE и точный SHA проверяются; удаление required-документа атомарно закрепляет существующий before_head blob. Если blob отсутствует, ошибка. Приватные пути исключаются, изменения файлов подтверждаются содержимым без обновления индекса; автоматически исключённые приватные правки перечисляются в excluded_changes, явный выбор отклоняется.

contextPacket сохраняет inline-context-v1 и COMPLETE, но включает parts[] с индексами, размерами, SHA-256, точными source-фрагментами. Каждая часть с оформлением <=document_bytes; весь пакет <=min(hard_bytes,180000), не больше 7 частей. Splitter сохраняет UTF-8 и весь текст, ошибки CONTEXT_TOO_LARGE не возвращают усечённого успеха. Soft token-поля принимаются для перехода, но не задают ограничения.

Readiness/inspection проверяют только current state, учитывают реальные содержательные правки в NONE/planning и dirty-файлах. Web Pilot использует этот же inputKey. Полный контракт — [recovery](../../../../docs/modules/workflow-kit-recovery.md).

## Установка и совместимость
install создаёт README, OVERVIEW, AGENTS locator и служебные файлы. Новые модули/спецификации появляются по необходимости. Упразднённые документы не восстанавливаются, исторический индекс не дополняется.

upgradeFrom включает 1.5.6. Проверяются целостность owned/managed файлов, резервная копия и отдельный kit-update. Current plan всегда остаётся источником; invalid/missing current останавливает миграцию. Legacy by-id/by-session/archive удаляются без архивных копий, только если каждый файл tracked и совпадает с HEAD/index; чужие изменения запрещают удаление. Owner/session-поля больше не управляют состоянием. Миграция проектной документации отдельно от установки.

getRuntimeRoot() возвращает самодостаточный payload. Consumer копирует его в resources; состав и содержимое сверяются с src/ без закреплённых вручную SHA/числа файлов. Готовое приложение не зависит от исходников или соседнего репозитория. Старые chat URL/title/history клиента сохраняются.

Текущий checkout уже переведён на 1.6.0 штатным установщиком; исправительный выпуск Web Pilot 0.6.98 не меняет пакет Kit. [Порядок перехода](../../../../docs/planning/workflow-kit-context-transition.md).

## Проверки
npm run check пакета (kit-check):
- check-package — exports/identity/версия/состав npm pack;
- check-consumer-contract — file:-зависимость, standalone imports/runtime без исходника;
- check-runtime-fixture — CLI/hooks/lifecycle/upgrade/раунды, включая check-document-fixture и check-project-recovery-fixture;
- check-carryover-fixture — перенос, Git history, зависимости, guards и прерывания.

Корневой npm test (unit-all) обязателен отдельно. Реальная копия проекта с новым runtime проверяется до/после нормализации: <=144000 байт и <=7 частей, без сокращения плана и изменения рабочей .harness/kit. tests/workflow-kit-upgrade.test.mjs подтверждает start старым 1.5.6 → kit-update → commit новым → следующая задача.

Web Pilot Sidebar переиспользует browser-модули клиента; его vendor lock и production Host API не принадлежат этому пакету. Live ChatGPT и native Windows остаются пользовательскими проверками.
