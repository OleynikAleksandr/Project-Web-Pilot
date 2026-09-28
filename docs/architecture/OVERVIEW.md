# Краткая архитектура проекта

Текущий локальный выпуск — **0.6.63**, macOS arm64 / Windows x64. Canonical package — `@webpilot/workflow-kit@1.5.0` из `/Users/oleksandroliinyk/VSCODE/WorkflowKit`; generated `resources/workflow-kit` содержит 35 файлов, SHA-256 `0db567df6f0c8f68f3119a7322b4c1c6d28cd06bf57b267993b792097bbb2c75`. Действующая модель: один checkout/worktree = один current plan; Web Pilot sessions — chats/navigation с собственным title. 0.6.63 добавляет собственный rename dialog в sidebar вместо системного browser prompt; title sync остаётся строго событийным. Парная поставка: `~/Downloads/WebPilot-0.6.63/`; корневой и `/Applications` app обновлены до 0.6.63.

Предыдущий локальный выпуск — **0.6.54**: таймер работы агента в карточке плана. Поставка: `~/Downloads/WebPilot-0.6.54/`.

Ранее — **0.6.50**, macOS arm64 и Windows x64, Workflow Kit **1.4.1**. Поставка: `~/Downloads/WebPilot-0.6.50/`. Исправлена заливка всей скруглённой плашки ввода: от «+» до голосовой кнопки. Реальный ChatGPT проверен визуально в Chat и Work; окружающая подложка и цвета кнопок сохраняются. Это заменяет поведение 0.6.49, окрашивавшее только editor. Независимое обновление задач из 0.6.49 сохранено.

История: 25.09.2026 выпущена локальная **0.6.49** для macOS arm64 и Windows x64; поставка — `~/Downloads/WebPilot-0.6.49/`. Встроенный Workflow Kit — **1.4.1**. План выбранной сессии читается независимо от доставки контекста, поэтому task:start и commit обновляют sidebar даже после остановки контроллера чата. Настройка фона поля ввода меняет сам editor, сохраняя внешнюю подложку и кнопки.

## Предыдущая поставка 0.6.48

25.09.2026 собрана **0.6.48** для macOS arm64 и Windows x64 одной командой `npm run build`; ZIP находятся в `~/Downloads/WebPilot-0.6.48/`. Постоянный `Project Web Pilot.app` в корне проекта обновлён с сохранением Finder-алиаса. Обе упаковки сверены с финальными исходниками.

Обновлены привязки к ChatGPT: кнопки Chat/Work, новые поля и сообщения, переходный адрес `local-chatgpt`, служебные карточки и цвета. Автопрокрутка учитывает обратный порядок сообщений и не создаёт обратную связь со своими scroll-событиями. Сайдбар показывает полный номер `ПРОТОТИП 0.6.48`. Закрытие главного окна завершает интерфейс и вспомогательные окна, сохраняя MCP и tunnel.

Общий DOM adapter используется composer, diagnostics, styles, filter и autoscroll; контракт — `docs/modules/chatgpt-dom-compatibility.md`. Результаты и ограничения — `docs/VERIFICATION.md`. Разделы 0.6.47 ниже описывают сохранённую архитектуру backend selector.

Project Web Pilot — одно Electron-приложение для macOS и Windows. Слева работает локальный интерфейс проектов и плана, справа — настоящий ChatGPT Web в изолированном Chromium. Локальные файлы и команды доступны агенту через MCP/tunnel; модельные OpenAI API приложением не используются.

Project Workflow Kit предназначен для проектов любого типа: программных, исследовательских, проектных, творческих и прикладных. Он управляет жизненным циклом согласованного этапа работы, Git/verification там, где они применимы, и формирует recovery context; предметная структура проекта задаётся его документацией, а не типом результата.

Основные границы:
- Workflow Kit 1.5.0 владеет **одним current plan каждого checkout/worktree**, lifecycle scope и recovery context. Канонический runtime path — `.harness/plans/todo-plan.md`; sessionId не является owner/selector. Для независимой параллельной работы используется отдельный Git worktree.
- Состояние `NONE` означает отсутствие согласованного рабочего scope, а не отсутствие знания о проекте: current ToDo-plan сохраняет обязательную навигацию через `docs/architecture/OVERVIEW.md`, `docs/MODULES.md` и `docs/DOCUMENTATION_INDEX.md` и предлагает обсудить следующий этап с пользователем.
- `docs/MODULES.md` является картой самостоятельных частей проекта. Для программного проекта это архитектурные модули/кластеры; для непрограммного — соответствующие предметные части, разделы или направления.
- Для программного модуля согласованный контракт фиксирует границы, facade, входы/выходы и инварианты; внутреннюю реализацию следует дробить на узкие классы/микроклассы без размывания facade.
- Каждый рабочий scope заканчивается задачей `DOCS`; после неё `READY_FOR_ACCEPTANCE` означает завершённые задачи, но обязательной кнопки приёмки нет. Архивирование current plan требует отдельного прямого поручения пользователя.
- Новое поручение после `READY_FOR_ACCEPTANCE` расширяет тот же current plan через `plan:extend`, сохраняя DONE/commit history и переоткрывая DOCS.
- Выбор Web Pilot session открывает её собственный сохранённый ChatGPT URL, но sidebar всегда проецирует current plan workspace. Быстрое открытие чата и строгая before-Send readiness сохраняются; контракт и замеры — `docs/modules/session-opening-performance.md`.
- 0.6.62: title sync не запускается из общего ContextSession.onChange и не имеет timer/backoff retry loop. Одноразовые sync выполняются только на title change, manual rename, bindChat и reopen/navigation; manual rename не блокируется сетью.
- Web Pilot доставляет уже сформированный checkout-scoped recovery packet в ChatGPT и не собирает проектный контекст самостоятельно.
- Workspace/session layer schema v6 хранит проекты, chat sessions и legacy plan metadata backward-compatible. Legacy `planId`/`originSessionId`/`legacyPlanId` не участвуют в runtime plan selection. Prepared-plan UI и bind/adopt lifecycle удалены. Локальные UI metadata, архив, таймер и настройки сохраняются как прежде.
- Project Doctor проверяет и чинит известные служебные неисправности через доверенный worker, но с 0.6.58 semantic/readiness dependency ограничена current plan; historical plan payloads не блокируют открытие проекта.
- Runtime lifecycle поднимает или переиспользует MCP+tunnel и должен оставаться отделён от plan/recovery semantics. В macOS 0.6.47 один стабильный Secure MCP Tunnel/ChatGPT connector обслуживает два взаимоисключающих backend; Settings переключает только локальный MCP за этим tunnel.
- Scope `codex-app-server-mcp-035` добавил отдельный macOS-only экспериментальный local executor поверх Codex App Server. Он не меняет production Runtime Lifecycle/Web Pilot, публикует те же 47 локальных tool names, не экспортирует публичные/облачные дубли и использует `node_repl -> @oai/sky` для Computer Use. Экспериментальный MCP работает на 17852 с отдельным state; после пользовательской настройки второй Secure MCP Tunnel на 17853 также проверен `ready=true`.
- macOS и Windows используют один Git source of truth; platform runtime/build state остаётся локальным.

Подробная карта частей проекта находится в `docs/MODULES.md`, полный перечень пополняемых документов — в `docs/DOCUMENTATION_INDEX.md`. Полная историческая архитектура остаётся в `docs/architecture/ARCHITECTURE.md` и не является обязательным recovery-контекстом.
Постоянный путь запуска macOS — `Project Web Pilot.app` в корне workspace. Каждый macOS-релиз обновляет этот app с сохранением Finder-алиаса; версионированный ZIP создаётся отдельно. Обязательный контракт выпуска: `docs/RELEASE.md`.

19.09.2026 собрана исправленная **0.6.47** для macOS arm64 и Windows x64 одной командой `npm run build`; ZIP находятся в `~/Downloads/WebPilot-0.6.47/`. На macOS Settings переключает **Codex Local Mac / Codex App Server Local Mac** за одним стабильным Secure MCP Tunnel/ChatGPT connector: выбранный backend работает MCP-only, старый LaunchAgent Codex Local Mac остаётся disabled, а стабильный WebPilot selector восстанавливает выбранный backend и общий tunnel после login/reboot. Если stable tunnel ещё не настроен, существующие credentials Codex Local Mac импортируются только локально без публикации секрета. Финальная поставка собрана из `acde362fc75645dff20f2e494604d9b2b5289403`; постоянный Mac app и обе упаковки сверены. Визуальное исправление layout 0.6.46 и первый запуск/Permissions 0.6.45 сохраняются.

## Эксперимент Codex App Server MCP — scope 035

19.09.2026 реализован отдельный MCP в `tools/codex-app-server-mcp/` без изменений `src/**`, package version и release Web Pilot. Codex App Server используется как локальный executor без `turn/start`; интеграционный тест с намеренно недоступным model endpoint подтвердил ноль модельных запросов. Новый MCP имеет тот же local tool catalog 47/47, Computer Use через `node_repl -> @oai/sky`, отдельный lifecycle/state и loopback endpoint 17852. Production Codex Local Mac и его tunnel 17842/17843 остаются неизменными и готовы к rollback.

Loopback A/B подтвердил полный каталог без cloud duplicates; file/read/git/search/command задержки сопоставимы со старым runtime. Затем пользователь подключил второй Secure MCP Tunnel в ChatGPT: namespace `Codex_App_Server_Local_Mac` стал доступен с 47 tools, и все 47 были реально вызваны из Web ChatGPT. Live smoke выявил и исправил action-path Computer Use: click/scroll/type/key/hotkey теперь используют `node_repl -> @oai/sky`, а реальный TextEdit-тест подтвердил точный ввод и последующий AX/image capture. Известная семантическая граница остаётся: experimental `computer_list_windows` использует app-level inventory Sky, тогда как старый MCP возвращает Quartz top-level windows. Первоначальный A/B с двумя connector-ами сохранён как история эксперимента. В 0.6.47 scope `stable-mcp-connector-036` интегрировал App Server executor как альтернативный macOS backend за одним стабильным connector; выбор backend остаётся явной пользовательской настройкой.

## Подготовка компонентов — актуальное исправление 0.6.37

В 0.6.37 устранён воспроизведённый отказ MAC_RUNTIME_EXTERNAL_MODIFIED после установки Apple: точный известный control.py из комплектного ZIP принимается через facade, собственная папка отличается от внешней. Завершённая установка используется повторно с сохранением настроек. Неизвестно изменённые файлы остаются защищены. Время Apple описано без обещания нескольких минут; ошибки подготовки больше не подменяются советом проверить интернет. Проверены холодная установка и восстановление отдельной ранее неудачной установки; гостевой повтор 0.6.37 подтвердил готовность компонентов; полный первый запуск позднее принят пользователем на чистой 0.6.38.

## Завершение этапа первого запуска

18.09.2026 пользователь поручил закрыть план first-run-onboarding-031 и передал испытания Windows 11 другому агенту. Итог macOS и границы доказательств — docs/CLEAN_INSTALL.md; условия и оставшиеся критерии Windows — docs/TRANSFER_TO_WINDOWS.md. План first-run-corrections-032 принадлежит другой сессии и этим закрытием не изменяется.

## Удалённый UI — исследование 2026-09-28

[Сравнительный отчёт](../research/remote-project-ui-options-2026-09-28.md) рассматривает MCP UI/PiP внутри ChatGPT и мобильную панель. Предложен минимальный read-only эксперимент с каноническим current plan и отдельной проверкой каждого клиента. Это исследование, не реализованная функция: приложение 0.6.58, службы и tunnel не изменялись; прежний adapter не возобновлялся.