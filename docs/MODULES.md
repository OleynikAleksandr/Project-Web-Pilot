# Модули проекта

Карта самостоятельных частей проекта и их владельцев. Workflow Kit не ограничивает проект программным продуктом: здесь могут быть программные модули, исследовательские направления, зоны проектирования или другие устойчивые части предметной работы. Перед новым scope агент сначала находит затрагиваемую часть здесь; если владельца/спецификации нет, сначала создаётся и согласуется подходящий specification/planning document.

Для программных проектов модульная спецификация фиксирует границы, facade, входы/выходы и инварианты; взаимодействие между кластерами идёт через фасады, а внутренняя реализация дробится на узкие классы/микроклассы. Для непрограммных проектов применяется эквивалентная предметная декомпозиция без искусственной программной терминологии.

| Модуль / часть проекта | Спецификация | Ответственность |
| --- | --- | --- |
| Workflow Kit / Context Recovery | `docs/modules/workflow-kit-recovery.md` | Единственный current plan checkout/worktree, lifecycle scope, recovery capsule, dependency context, migration legacy session plans и continuity |
| Project Doctor | `docs/modules/project-doctor.md` | Автономная диагностика, резервная копия и безопасное исправление известных проблем открытия проекта |
| Runtime Lifecycle | `docs/modules/runtime-lifecycle.md` | MCP/tunnel discovery, bootstrap, process identity, persisted endpoints и self-healing startup |
| Codex App Server Local Executor | `docs/modules/codex-app-server-executor.md` | macOS local-only MCP facade поверх Codex App Server: паритет 47 локальных tools, Computer Use и альтернативный backend за единым stable connector |
| Workspace & Sessions | `docs/modules/workspace-sessions.md` | Проекты, Chat/Work sessions, session tree, experience routing, оформление и сохранение геометрии интерфейса |
| Release & Local Installation | `docs/RELEASE.md` | Постоянный macOS app, сохранение Finder-алиаса, отдельные ZIP и доставка релиза; стенд чистых ОС, точка передачи проверки установки и диагностика Computer Use/MCP — `docs/CLEAN_INSTALL.md` |

Этот файл является маршрутизатором. Общая архитектура находится в `docs/architecture/OVERVIEW.md`, полный перечень документов — в `docs/DOCUMENTATION_INDEX.md`, детали частей проекта — в их спецификациях.


## Single active plan — действующий совместный контракт

В 0.6.58 / Workflow Kit 1.5.0 прежний `session-owned-plans-028` переработан: **один checkout/worktree = один current plan**, sessions — только Chat/Work conversations. Канонический compatibility-документ — [Single active plan и чаты](modules/session-owned-plans.md); прежний [макет session-plan navigation](design/session-plan-navigation.md) сохранён как исторический дизайн 0.6.28. `plan:prepare`/`plan:bind` и prepared-plan UI удалены. Legacy session plan metadata не участвует в runtime selection; параллельная независимая работа — через Git worktree.

## Ускорение открытия — scope 029

Совместный контракт Workspace & Sessions и Workflow Kit / Context Recovery: [Быстрое открытие сессий и планов](modules/session-opening-performance.md). Контракт реализован в 0.6.29 и сохранён после migration 0.6.58: пакетные операции Git, единая validation, ограниченный readiness-кэш и строгая доставка контекста остаются; session-specific plan projection заменена checkout-scoped current plan. Source и packaged замеры прошлых версий сохранены как история.

## Layout встроенного ChatGPT — scope 034

Workspace & Sessions дополнен planning document [Регрессия layout скрытых tool calls](design/chat-message-layout-regression.md). В 0.6.46 визуальный DOM-adapter разрешает скрывать ближайший message/turn boundary только когда он целиком tool-only; mixed user/assistant message с полезным текстом сохраняется. Существующая автопрокрутка получает `refresh()` без принудительного возобновления follow. Node suite, Electron smoke и парная упаковка macOS arm64 / Windows x64 проверены; реальный DOM ChatGPT подтверждается пользователем после перезапуска новой версии.

## Экспериментальный Codex App Server executor — scope 035

Контракт — [Codex App Server Local Executor](modules/codex-app-server-executor.md). T001–T005 реализованы как отдельный macOS-only runtime, не входящий в release Web Pilot: App Server выполняет direct local operations без модельного `turn/start`, а Computer Use идёт через bundled `node_repl -> @oai/sky`. Каталог нового MCP совпадает со старым Codex Local Mac 47/47 и не содержит публичных/облачных дублей ChatGPT.

Отдельный state использует MCP 17852 и tunnel health 17853; первоначальный A/B с отдельным tunnel и двумя ChatGPT connector-ами сохранён как историческое evidence. Benchmark и Computer Use evidence находятся в `docs/VERIFICATION.md`: все 47 tools нового backend реально вызваны из ChatGPT, T007 перевёл Computer Use actions на `node_repl -> @oai/sky`, TextEdit smoke подтвердил ввод/capture. Семантическая разница app-level Sky inventory против Quartz top-level window inventory старого MCP остаётся известным ограничением backend. T006 устраняет locale-зависимую ложную потерю process ownership в Terminal.

## Один стабильный macOS connector — scope 036

В исправленной 0.6.47 Runtime Lifecycle и Codex App Server executor объединены через один Secure MCP Tunnel/ChatGPT connector. `MacRuntimeSwitcher` оставляет старый `com.oleynik.CodexLocalMac` LaunchAgent disabled в обоих modes, запускает выбранный backend MCP-only и retarget-ит стабильный private tunnel Web Pilot на его фактический loopback endpoint. Settings сохраняет `local | app-server`, после switch приложение relaunch-ится; `selector-start` восстанавливает выбор после login/reboot. Обычная установка без прежнего A/B однократно переносит существующие local tunnel credentials только внутри private worker без вывода key. Финальный 0.6.47 собран из T001 commit `acde362fc75645dff20f2e494604d9b2b5289403`; delivery — `~/Downloads/WebPilot-0.6.47/`.

Исследование задержек этого пути и сравнение с нативным ChatGPT Work зафиксированы в [Computer Use latency investigation](design/computer-use-latency-investigation.md): оба MCP backend дают почти одинаковые ~3-секундные tool round-trip, тогда как прямой `@oai/sky` в Work выполняет те же primitives на порядок быстрее. Следующий этап должен локализовать задержку по сегментам Web/plugin dispatch → Secure MCP Tunnel → local MCP → Sky → response.

## Первый запуск на чистой системе — scope 031

Согласован контракт [Первый запуск Web Pilot на чистой системе](modules/first-run-onboarding.md): владелец Release & Local Installation, смежные части Runtime Lifecycle, Workspace Setup и Workspace & Sessions. 19.09.2026 выпущена **0.6.45** для macOS arm64 и Windows x64 одной командой `npm run build`; ZIP находятся в ~/Downloads/WebPilot-0.6.45/. В общем мастере обеих платформ есть отдельный шаг подключения MCP к ChatGPT и видимый блок «Разрешения MCP»: путь к настройкам, четыре режима и добровольный выбор Allow all actions для работы без повторных подтверждений. На новом Mac подключение также нужно создать; оно не появляется автоматически. Создание проекта не запрашивает автора и email. Исходники, установленное приложение и обе упаковки сверены. Пользователь считает план завершённым с этим дополнением; агент не запускает VM и не использует Computer Use.

## Подготовка компонентов — актуальное исправление 0.6.37

В 0.6.37 устранён воспроизведённый отказ MAC_RUNTIME_EXTERNAL_MODIFIED после установки Apple: точный известный control.py из комплектного ZIP принимается через facade, собственная папка отличается от внешней. Завершённая установка используется повторно с сохранением настроек. Неизвестно изменённые файлы остаются защищены. Время Apple описано без обещания нескольких минут; ошибки подготовки больше не подменяются советом проверить интернет. Проверены холодная установка и восстановление отдельной ранее неудачной установки; гостевой повтор 0.6.37 подтвердил готовность компонентов; полный первый запуск позднее принят пользователем на чистой 0.6.38.

Итерация 0.6.39 после принятого пользователем чистого запуска 0.6.38 относится к
тем же модулям: First Run (clipboard facade и подсказки), Workspace Setup (одно
действие Chat/Work), Workspace & Sessions (одна строка NONE). Контракт — раздел
«Принятый чистый запуск и интерфейс 0.6.39» в modules/first-run-onboarding.md.

## Передача дальнейшей проверки Windows

18.09.2026 пользователь поручил закрыть план first-run-onboarding-031 и передал испытания Windows 11 другому агенту. Итог macOS и границы доказательств — docs/CLEAN_INSTALL.md; условия и оставшиеся критерии Windows — docs/TRANSFER_TO_WINDOWS.md. План first-run-corrections-032 принадлежит другой сессии и этим закрытием не изменяется.

Scope windows-onboarding-033: общий `startup-platform.mjs` связывает WindowsRuntimeBootstrap, StartupReadiness и WorkspaceSetup; Windows получает комплектный Git. Release & Local Installation владеет `scripts/release-all.mjs`, сверкой пары и общим manifest. Контракт — docs/modules/first-run-onboarding.md.

## Совместимость ChatGPT DOM — 0.6.48

Контракт: [ChatGPT DOM](modules/chatgpt-dom-compatibility.md). Фасад `createChatGPTDOM` объединяет селекторы режима, composer, сообщений, busy и прокрутки; потребители — composer/context, диагностика, цвета, фильтр и автопрокрутка. Новый переходный URL не является ошибкой и не вызывает повторную отправку. Lifecycle UI и autostart служб описаны в [runtime-lifecycle](modules/runtime-lifecycle.md).

## PlanMonitor и цвет editor — 0.6.49

Read-only PlanMonitor входит в модуль сессий: `docs/modules/workspace-sessions.md`. Вывод плана отделён от контроллера доставки; смена задач не отправляет recovery. В ChatColors composerBackground применён к editor, а не внешнему контейнеру.

## Плашка ввода — 0.6.50

ChatColors выбирает data-composer-body, владеющий видимым фоном и скруглением; editor прозрачен, внешняя подложка не затронута. Контракт в `docs/modules/workspace-sessions.md`, живые доказательства в VERIFICATION.md.

## Первый проект из папки — 0.6.51

Общий startup UI предлагает chooseWorkspace после той же проверки, что beginCreate. Контракты: `docs/modules/first-run-onboarding.md` и `docs/WORKSPACE_SETUP.md`. Backend установки не менялся.

## Плашка поля ввода — 0.6.55

Палитра ChatGPT (`src/chatgpt-colors.mjs`): цвет поля ввода закрашивает скруглённую плашку, найденную по геометрии — [workspace-sessions](modules/workspace-sessions.md), [chatgpt-dom-compatibility](modules/chatgpt-dom-compatibility.md).

## Таймер работы агента — 0.6.54

Workspace & Sessions: `src/agent-timer.mjs` (замер по видимому Stop), поле сессии `agentTime` и отображение `mm:ss · Σ mm:ss` в карточке плана — [workspace-sessions](modules/workspace-sessions.md), признак работы ChatGPT — [chatgpt-dom-compatibility](modules/chatgpt-dom-compatibility.md).

## Canonical Workflow Kit package — 0.6.58

Workflow Kit / Context Recovery: единственный editable source — `/Users/oleksandroliinyk/VSCODE/WorkflowKit/src`, package — `@webpilot/workflow-kit@1.5.0`. Development использует package exports; external Workspace Setup / Project Doctor и Electron package используют ignored generated `resources/workflow-kit`, автоматически staged из `getRuntimeRoot()`. Runtime: 35 files, SHA-256 `0db567df6f0c8f68f3119a7322b4c1c6d28cd06bf57b267993b792097bbb2c75`. Контракт — [workflow-kit-recovery](modules/workflow-kit-recovery.md), [single-active plan](modules/session-owned-plans.md), [WORKSPACE_SETUP](WORKSPACE_SETUP.md).

## Поставляемый Workflow Kit 1.4.12 — 0.6.53 (история)

`resources/workflow-kit` = 1.4.12: канонические планы — `.harness/plans/by-id/` и `.harness/plans/by-session/`; их читают Kit (listPlans, inspection inputs), полный контекст (`src/context-inputs.mjs`), Доктор (`resources/project-doctor`) и Workspace Setup (upgrade 1.1.0–1.4.11). Контракт — [workflow-kit-recovery](modules/workflow-kit-recovery.md) и [session-owned-plans](modules/session-owned-plans.md).

## Поставляемый Workflow Kit 1.4.11 — 0.6.52

Workflow Kit / Context Recovery: `resources/workflow-kit` = 1.4.11, контракт — [workflow-kit-recovery](modules/workflow-kit-recovery.md); открытие и upgrade проектов 1.4.1–1.4.3 — [WORKSPACE_SETUP](WORKSPACE_SETUP.md). Собственный `.harness/kit` репозитория — 1.4.1.

## Удалённая панель проекта — исследование 2026-09-28

Совместная область Workspace & Sessions, Workflow Kit / Context Recovery и Runtime Lifecycle. [Контракт исследования](planning/remote-project-ui-research.md); [сравнительный отчёт](research/remote-project-ui-options-2026-09-28.md) — MCP UI/PiP, host compatibility, мобильный Web Pilot и облегчённая панель. Рекомендован отдельный read-only UI spike с проверкой реальных клиентов; реализация не выполнялась. Новый store планов не создаётся; текущий продукт остаётся 0.6.58.

## Синхронизация названий sessions — 0.6.63

Workspace & Sessions использует planning contract [session-title-sync](planning/session-title-sync.md). Workflow Kit 1.5.0 не менялся. В 0.6.61 `readWorkspace()` берёт canonical auto-title из H1 required planning/spec документа; objective остаётся fallback. Session title проходит 80-char/200-byte normalizer, manual title имеет приоритет. `src/chatgpt-title.mjs` выполняет GET-before-PATCH reconciliation desired title с exact bound native ChatGPT conversation; post-load/late-bind retry из 0.6.60 сохранён. Live probe и release evidence — `docs/VERIFICATION.md`.

## Событийная обработка — фаза 1 / 0.6.64

Workspace & Sessions совместно с Workflow Kit / Context Recovery: [контракт перехода на события](planning/event-driven-runtime.md). Фаза 1 завершена: `chatgpt-page-observer`, `page-state` и `page-state-bridge` обеспечивают общий источник событий; `conversation-recovery` — ограниченное восстановление сохранённого разговора. Ручной recovery и обычный ручной Send различаются, before-Send сохранён. Промежуточный парный релиз 0.6.64 прямо заказан пользователем; исправление 0.6.65 добавляет «Resume stream unavailable» в общий DOM adapter и прежний путь восстановления. Фазы 2/3 ещё не выполнены; Kit 1.5.0 не менялся.

0.6.66 / фаза 2, T004: Workspace & Sessions и Context Delivery — одноразовая очистка восстановленного черновика только при новом Chat/Work. Контракт: [событийная обработка](planning/event-driven-runtime.md), [DOM](modules/chatgpt-dom-compatibility.md). Файловые события и удаление оставшихся опросов пока не реализованы.


## Диагностика Send — T005 / 0.6.67
Workspace & Sessions / ChatGPT DOM: этапы composer, сводка первого отличия без текста, защита data URL в сетевой диагностике. Контракт — docs/planning/event-driven-runtime.md; инцидент и границы выводов — docs/VERIFICATION.md. Основные задачи фазы 2 не выполнены этим диагностическим выпуском.

## Быстрая вставка и автоматический Send — 0.6.68

Workspace & Sessions: штатный webContents.insertText, актуальность до вставки, отсутствие запрета Send из-за изменений текста. Контракты — [доставка](CONTEXT_DELIVERY.md), [DOM](modules/chatgpt-dom-compatibility.md), [фаза 2, T006](planning/event-driven-runtime.md). Kit 1.5.0 не менялся.

## Paste для recovery — 0.6.69

Workspace & Sessions: ClipboardEvent.paste в composer, безопасный HTML и неизменённый plain text; диагностика принятия/времени. Контракт — [доставка](CONTEXT_DELIVERY.md), [T007](planning/event-driven-runtime.md). TXT и runtime Workflow Kit не меняются.
