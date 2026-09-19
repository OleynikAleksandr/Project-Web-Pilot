# Модули проекта

Карта самостоятельных частей проекта и их владельцев. Workflow Kit не ограничивает проект программным продуктом: здесь могут быть программные модули, исследовательские направления, зоны проектирования или другие устойчивые части предметной работы. Перед новым scope агент сначала находит затрагиваемую часть здесь; если владельца/спецификации нет, сначала создаётся и согласуется подходящий specification/planning document.

Для программных проектов модульная спецификация фиксирует границы, facade, входы/выходы и инварианты; взаимодействие между кластерами идёт через фасады, а внутренняя реализация дробится на узкие классы/микроклассы. Для непрограммных проектов применяется эквивалентная предметная декомпозиция без искусственной программной терминологии.

| Модуль / часть проекта | Спецификация | Ответственность |
| --- | --- | --- |
| Workflow Kit / Context Recovery | `docs/modules/workflow-kit-recovery.md` | Канонические планы сессий, lifecycle scope, адресованный recovery capsule, dependency context и continuity |
| Project Doctor | `docs/modules/project-doctor.md` | Автономная диагностика, резервная копия и безопасное исправление известных проблем открытия проекта |
| Runtime Lifecycle | `docs/modules/runtime-lifecycle.md` | MCP/tunnel discovery, bootstrap, process identity, persisted endpoints и self-healing startup |
| Codex App Server Local Executor | `docs/modules/codex-app-server-executor.md` | macOS local-only MCP facade поверх Codex App Server: паритет 47 локальных tools, Computer Use и альтернативный backend за единым stable connector |
| Workspace & Sessions | `docs/modules/workspace-sessions.md` | Проекты, Chat/Work sessions, session tree, experience routing, оформление и сохранение геометрии интерфейса |
| Release & Local Installation | `docs/RELEASE.md` | Постоянный macOS app, сохранение Finder-алиаса, отдельные ZIP и доставка релиза; стенд чистых ОС, точка передачи проверки установки и диагностика Computer Use/MCP — `docs/CLEAN_INSTALL.md` |

Этот файл является маршрутизатором. Общая архитектура находится в `docs/architecture/OVERVIEW.md`, полный перечень документов — в `docs/DOCUMENTATION_INDEX.md`, детали частей проекта — в их спецификациях.


## Планы сессий — действующий совместный контракт

В 0.6.28 / Workflow Kit 1.4.0 реализован scope `session-owned-plans-028`, совместно принадлежащий Workflow Kit / Context Recovery и Workspace & Sessions. Канонический контракт — [Планы сессий и подготовка продолжения](modules/session-owned-plans.md), принятый пример — [Сайдбар планов](design/session-plan-navigation.md). Каждая сессия имеет собственный план либо NONE; будущий план готовится отдельно и получает сессию только после ручного выбора Chat/Work. Нового параллельного менеджера задач нет. В 0.6.30 пользовательский заголовок блока будущего плана уточнён до «План следующей сессии» без изменения механики.

## Ускорение открытия — scope 029

Совместный контракт Workspace & Sessions и Workflow Kit / Context Recovery: [Быстрое открытие сессий и планов](modules/session-opening-performance.md). Контракт реализован и проверен в 0.6.29 / Kit 1.4.1: пакетные операции Git, единая validation, ограниченный readiness-кэш, ранний показ собственного плана и строгая доставка контекста. Source и packaged замеры подтверждены; все изменения находятся в main, лишние worktrees/ветка удалены. План остаётся в своей сессии.

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