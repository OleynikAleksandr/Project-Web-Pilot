# Исходные проекты и ссылки

## Связанные рабочие репозитории — 05.10.2026

Project Web Pilot: текущая локальная и опубликованная версия **0.6.94**, предыдущая — **0.6.93** ([контракт](planning/codex-native-tools-macos.md)). 0.6.94 опубликована из source commit `24b04476d1d96fa770b1d488c197b19c07a33422`, обе Mac-копии установлены. Bundled canonical Workflow Kit — **1.5.5** (35 файлов, SHA-256 `8eadd98869a840f670dbfb00c33350e3054d8ec7de5298b2b0beca82d787f376`); его документы синхронизированы commit `6c8ad1902df1d0932a44215f014baca66ebf51df`. Native Windows остаётся отдельной platform-проверкой.

| Репозиторий | Workspace | Роль и граница |
| --- | --- | --- |
| Project Web Pilot | `/Users/oleksandroliinyk/VSCODE/Project Web Pilot` | Electron-приложение, проекты, сессии, текущий план, доставка recovery и MCP/runtime |
| [Workflow Kit](https://github.com/OleynikAleksandr/WorkflowKit) | `/Users/oleksandroliinyk/VSCODE/WorkflowKit` | Canonical локальный пакет `@webpilot/workflow-kit@1.5.5` (35 файлов, SHA-256 `8eadd98869a840f670dbfb00c33350e3054d8ec7de5298b2b0beca82d787f376`); последний отдельный release — 1.5.1. Документы синхронизированы с Web Pilot 0.6.94 commit `6c8ad190…`; код/runtime Kit не менялись |
| [Web Pilot Sidebar](https://github.com/OleynikAleksandr/Web-Pilot-Sidebar) | `/Users/oleksandroliinyk/VSCODE/Web Pilot Sidebar` | Отдельный репозиторий браузерного расширения; разрабатывается параллельно другим агентом, использует адаптер ChatGPT из Web Pilot |

Sidebar отображает проекты, сессии и прогресс плана в настоящей странице chatgpt.com. Проектные данные, текущий план, recovery и локальные инструменты остаются ответственностью Project Web Pilot и Workflow Kit; расширение не пишет todo-plan.md и не хранит проектные данные. На 02.10.2026 Sidebar — прототип этапа 0 с тестовыми данными и тестовым хостом. Production Host API в Project Web Pilot ещё не реализован; его подключение требует отдельной задачи по собственному workflow этого репозитория.

Текущая фактическая связь — сборка Sidebar переиспользует `src/chatgpt-dom.mjs`, `src/chatgpt-composer.mjs` и `src/chatgpt-experience.mjs`, закреплённые SHA-256 в его `vendor.lock.json`. Публичные символы, точный формат pageScript, ограничения импортов и порядок обновления описаны в [контракте DOM/Sidebar](modules/chatgpt-dom-compatibility.md). Изменения внешнего контракта отмечаются в описании коммита и передаются сопровождающему Sidebar для повторного закрепления.

Источники Sidebar для чтения: `README.md`, `AGENTS.md`, `docs/modules/provider-adapter.md` и `docs/modules/host-api.md` относительно его workspace. Remote `origin` Sidebar — `https://github.com/OleynikAleksandr/Web-Pilot-Sidebar.git`. [GitHub Release v0.1.0](https://github.com/OleynikAleksandr/Web-Pilot-Sidebar/releases/tag/v0.1.0) содержит два проверенных артефакта: Chrome/Edge ZIP `web-pilot-sidebar-chrome-0.1.0.zip` — 34468 байт, SHA-256 `00f9fc9405549c9e3c5b8cab3dbfa95be245ce3da3540a7dd8ee46d5b19b471e`; подписанный macOS DMG `Web-Pilot-Sidebar-0.1.0-2610021544.dmg` — 222208 байт, SHA-256 `80d638fffb34a6f827a21be1ef5ef8bd423242c51e52c885f92c09c63a8c690b`. Публичный GitHub API подтвердил оба digest. Приложение внутри DMG проходит `codesign --verify`, Gatekeeper принимает его как Notarized Developer ID, stapler-ticket валиден. Тег `v0.1.0` остаётся на функциональном release commit `8786bef8ae7be64277604c29a949681b9f496146`; после релиза `main` продвинут параллельной packaging/documentation работой до `0fab32aa88a92abc8ba854b4f22c777004d7dac3`, и `origin/main` совпадает с ним. TestFlight ещё не опубликован: App Store Connect не содержит app record для `com.oleynik.WebPilotSidebar`. Исторические источники WF001 и Codex Local Mac ниже сохраняются отдельно от этих текущих связей.

Последний отдельный WorkflowKit Release — [GitHub Release v1.5.1](https://github.com/OleynikAleksandr/WorkflowKit/releases/tag/v1.5.1), tag commit `dfc38c1b4a2cee1c13c68f9b54f064d3496dab10`. Canonical source/runtime — **1.5.5**, 35 файлов / SHA-256 `8eadd98869a840f670dbfb00c33350e3054d8ec7de5298b2b0beca82d787f376`. Документальная синхронизация Web Pilot 0.6.94 опубликована в WorkflowKit `main` commit `6c8ad1902df1d0932a44215f014baca66ebf51df`; код/version/runtime Kit не менялись.

## Проверенный снимок

Пути и Git-состояние проверены 11.09.2026 при подготовке Project Web Pilot. Оба источника имели чистое рабочее дерево. Перед переиспользованием повторно проверить HEAD и действующие инструкции: это привязанный ко времени снимок, не указание сбрасывать репозиторий на старую версию.

| Проект | Абсолютный путь | Проверенный HEAD |
| --- | --- | --- |
| Project Workflow Kit | `/Users/oleksandroliinyk/VSCODE/WF001` | `20260a0cebd825c1d0415070d9eca6e1b1585fd4` |
| Codex Local Mac | `/Users/oleksandroliinyk/VSCODE/Codex Local Mac` | `20ba452745ab50fc9bfa722a7b8fd34c8a42024a` — согласованное упрощение контекста |
| Новый целевой проект | `/Users/oleksandroliinyk/VSCODE/Project Web Pilot` | Начальный bootstrap `08e138789734cc3ea61be3fb078d067d2676cbb5`; текущий HEAD читать из Git |

Project ID нового проекта: `cf944136-d1fc-4bd5-9ea0-e46d1fe230e7`. В старых документах Codex Local Mac может называться `002`: папка была переименована пользователем. Для новых команд использовать текущий явный путь, не историческое имя.

## WF001: откуда брать Workflow Kit

| Материал | Для чего читать |
| --- | --- |
| AGENTS.md — `/Users/oleksandroliinyk/VSCODE/WF001/AGENTS.md` | Границы работы с исходным проектом |
| Спецификация — `/Users/oleksandroliinyk/VSCODE/WF001/project-workflow-kit-specification.md` | Полные требования к установке, планам, Git и восстановлению |
| Продукт — `/Users/oleksandroliinyk/VSCODE/WF001/docs/PRODUCT.md` | Создание проекта, подключение существующего, UI-состояния |
| Архитектура — `/Users/oleksandroliinyk/VSCODE/WF001/docs/architecture/ARCHITECTURE.md` | Ядро, JSON-ответы, транзакции и recovery |
| Проверки — `/Users/oleksandroliinyk/VSCODE/WF001/docs/VERIFICATION.md` | Что проверялось и где нужны реальные пользовательские подтверждения |
| Исходный протокол kit — `/Users/oleksandroliinyk/VSCODE/WF001/kit/WORKFLOW.md` | Канонические правила переносимого комплекта |
| CLI — `/Users/oleksandroliinyk/VSCODE/WF001/kit/cli.mjs` | inspect/install/status/doctor/recover и управляемые команды |
| Установщик — `/Users/oleksandroliinyk/VSCODE/WF001/kit/lib/installer.mjs` | Конфликты, сохранение существующих файлов, установка и переподключение |
| Recovery — `/Users/oleksandroliinyk/VSCODE/WF001/kit/lib/recovery.mjs` | Полный пакет из выбранных документов, плана и Git |
| Состояния и действия — `/Users/oleksandroliinyk/VSCODE/WF001/kit/lib/actions.mjs` | Scope, task:start, изменение плана и конфигурации |
| SwiftUI AppModel — `/Users/oleksandroliinyk/VSCODE/WF001/Sources/WorkflowStudio/AppModel.swift` | Пример подключения UI к ядру; не обязательный стек нового UI |
| Windows — `/Users/oleksandroliinyk/VSCODE/WF001/docs/WINDOWS.md` | Прежняя упаковка для Windows и ограничения её проверки |

Все относительные пути в следующем абзаце относятся к репозиторию **WF001**, корень `/Users/oleksandroliinyk/VSCODE/WF001`, а не к Project Web Pilot.

Связанные исходники WF001: `kit/lib/plan.mjs`, `kit/lib/validate.mjs`, `kit/lib/transaction.mjs`, `kit/lib/git.mjs`, `kit/lib/git-hooks.mjs`, `kit/lib/common.mjs`, `kit/lib/platform.mjs`, `kit/lib/installation-files.mjs`, `kit/schemas/`, `kit/templates/`. Регрессии WF001: `tests/install.test.mjs`, `tests/workflow.test.mjs`, `tests/recovery.test.mjs`, `tests/windows.test.mjs` и `scripts/demo-workflow.mjs`.

Источник переносимого runtime на исходном этапе был **WF001/kit**, версия 1.1.0 по common.mjs. Собственная установленная WF001/.harness/kit имела manifest 1.0.0: не перепутать установленный экземпляр с исходным комплектом. Это только историческое происхождение комплекта; с 0.6.56 текущий source of truth описан в разделе canonical package ниже. Реальный Project Web Pilot manifest был reconciled Доктором 16.09.2026 (`doctor_reconciled_at=2026-09-16T07:28:22.983Z`) и затем синхронизирован с correction-round bytes. 17.09.2026 штатный Doctor согласовал его с полным проверенным комплектом 1.4.0 с новой резервной копией; намеренно возвращать stale-состояние нельзя.

## Codex Local Mac: откуда брать локальное подключение

> **С 0.6.91 не источник.** Codex Local Mac удалён из Project Web Pilot по поручению пользователя от 05.10.2026: приложение его не ставит, не запускает и не читает, сборка не обращается к его папке. Таблица и разделы о нём ниже — история происхождения кода. Папки `~/VSCODE/Codex Local Mac` и `~/Library/Application Support/CodexLocalMac` удаляет пользователь. ZIP Windows-runtime, который сборка раньше брала из этой папки, теперь публикуется шестым файлом каждого релиза Project Web Pilot.

| Материал | Для чего читать |
| --- | --- |
| AGENTS.md — `/Users/oleksandroliinyk/VSCODE/Codex Local Mac/AGENTS.md` | Инструкции исходного workspace |
| Архитектура — `/Users/oleksandroliinyk/VSCODE/Codex Local Mac/docs/architecture/ARCHITECTURE.md` | Python MCP, loopback и secure tunnel |
| Настройка Mac — `/Users/oleksandroliinyk/VSCODE/Codex Local Mac/docs/MACOS_SETUP.md` | Зависимости, подключение ChatGPT, управление службами |
| Приёмка — `/Users/oleksandroliinyk/VSCODE/Codex Local Mac/docs/ACCEPTANCE.md` | Реальные локальные и Safari-проверки |
| Проверка контекста — `/Users/oleksandroliinyk/VSCODE/Codex Local Mac/docs/CONTEXT_PROBE.md` | Полный read-only пакет и история отменённой диагностики |
| Канонический MCP skill — `/Users/oleksandroliinyk/VSCODE/Codex Local Mac/mac-codex-local/skills/local-computer/SKILL.md` | Последовательность действий агента и пределы доказательств |
| Управление службами — `/Users/oleksandroliinyk/VSCODE/Codex Local Mac/mac-codex-local/control.py` | setup/start/status/stop, readiness и владение процессами |
| MCP tools — `/Users/oleksandroliinyk/VSCODE/Codex Local Mac/mac-codex-local/mcp/bridge_mcp.py` | Сервер, tool schemas, instructions и read-only контекст |
| ContextPacket — `/Users/oleksandroliinyk/VSCODE/Codex Local Mac/mac-codex-local/server/context_packet.py` | Полный пакет, facts, размер и SHA-256 без журнала ACK |
| Файлы и процессы — `/Users/oleksandroliinyk/VSCODE/Codex Local Mac/mac-codex-local/server/bridge_server.py` | Основной bridge runtime |
| Локальные исправления workflow — `/Users/oleksandroliinyk/VSCODE/Codex Local Mac/docs/WORKFLOW_FIXES.md` | История исправления plan:apply и незавершённых транзакций |
| Windows-комплект — `/Users/oleksandroliinyk/VSCODE/Codex Local Mac/Windows-Codex-Local/START_HERE.md` | Отдельный переносимый источник для будущего Windows-этапа |

В снимке 11.09.2026 macOS MCP публиковал 47 tools: 46 основных и read-only workflow_context_recover. Экспериментальные ACK/status/hook tools удалены по поручению пользователя 11.09.2026. Ранние разделы с числами 46 и 50 описывают прежние этапы. Перед реализацией проверить текущий tools/list. Python-окружение находится в `mac-codex-local/.venv`, требования — `mac-codex-local/requirements.txt`; их не копировать целиком в Git.

Локальный endpoint текущей конфигурации — `http://127.0.0.1:17842/mcp`; service manager также проверяет tunnel readiness. Команды control.py возвращают JSON; проверять exit code и содержимое, не только наличие процесса. Пример read-only диагностики существующей установки:

```bash
"/Users/oleksandroliinyk/VSCODE/Codex Local Mac/mac-codex-local/.venv/bin/python3" \
  "/Users/oleksandroliinyk/VSCODE/Codex Local Mac/mac-codex-local/control.py" status
```

Папка состояния — `~/Library/Application Support/CodexLocalMac`; приватную конфигурацию и ключи не включать в артефакты. Исторические отчёты находятся в ignored `.harness/runtime/context-probe-work/` исходного проекта и могут отсутствовать после клонирования. Авторитетное переносимое описание результатов сохранено в его docs/CONTEXT_PROBE.md.

## Правила переиспользования

WF001 остаётся источником для чтения. Пользователь разрешил согласованно изменить Codex Local Mac для прямой передачи контекста и убрать hook/ACK диагностику; это сделано задачей T018 исходного проекта. Перенос остальных модулей остаётся отдельной задачей. Для каждого перенесённого блока фиксировать repo/path/SHA и изменения, учитывать лицензии. Не делать скрытые изменения в оригиналах, не копировать .git, .venv, node_modules, runtime-состояние, tokens, cookies и ключи. Для переносимой поставки зависимость от абсолютных путей компьютера должна быть заменена явной упаковкой; прототип пока честно использует существующую установку.

## Официальные технические источники

Ссылки проверены в ходе обсуждения и подготовки 11.09.2026. Перед кодированием сверить актуальную документацию.

| Источник | Что он подтверждает и чего не доказывает |
| --- | --- |
| [Electron WebContentsView](https://www.electronjs.org/docs/latest/api/web-contents-view) | Размещение браузерного содержимого в собственном окне |
| [Electron webContents](https://www.electronjs.org/docs/latest/api/web-contents) | Управление страницей и событиями ввода; это не гарантия совместимости с ChatGPT |
| [Electron security](https://www.electronjs.org/docs/latest/tutorial/security) | Изоляция удалённой страницы и локальных привилегий |
| [Google OAuth policies](https://developers.google.com/identity/protocols/oauth2/policies) | Ограничения embedded user agents; реальный способ входа надо проверить |
| [Secure MCP Tunnels](https://developers.openai.com/api/docs/guides/secure-mcp-tunnels) | Транспорт от ChatGPT к локальному MCP; отдельная от модельного API задача |
| [Подключение и проверка плагина](https://developers.openai.com/plugins/deploy/connect-chatgpt) | Проверка MCP-подключения и полного plugin bundle — разные действия |
| [Plugin lifecycle hooks](https://developers.openai.com/plugins/build/plugins#bundled-mcp-servers-and-lifecycle-hooks) | Hooks зависят от поддерживаемого runtime и доверия определению |
| [SessionStart](https://learn.chatgpt.com/docs/hooks#sessionstart) | additionalContext и источники lifecycle-событий |
| [MCP tool hooks](https://learn.chatgpt.com/docs/hooks#mcp-tool-hooks) | Вызов уже подключённого MCP из hook; не регистрация событий сервером |

Официальные hooks-документы не являются доказательством, что личное Web Work подключение пользователя принимает hook bundle. В нашем просмотренном UI такого способа не было; подробности и контрольные эксперименты сохранены в источнике CONTEXT_PROBE.md.

## Историческая проверка подключения в T007

11.09.2026 актуальный initialize вернул Codex Local Mac, 50 tools; server instructions содержат полный текущий local-computer/SKILL.md. Описания и параметры recover/ack/status/hook совпадают с исходным backend: source=agent_request, точный readback, ACK только из пакета, status без challenge. Глобальные и проектные инструкции не добавляют альтернативной последовательности для этого сценария. Живые службы использованы с прежними PID: MCP 63546, tunnel 63553; оба ready. Новая оболочка не меняла исходники и не обновляла подключение аккаунта.

## Обновление T014

Новый фактический snapshot после перезапуска MCP: 47 tools, workflow_context_recover(workspace), readOnlyHint=true, protocol=inline-context-v1. Новый клиент получил полный WF001 (12531 UTF-8 байт) и сверил SHA-256. Tunnel сохранил свой процесс. Протокол server instructions, полного Skill, описаний инструментов и backend согласован; глобальные инструкции не добавляют альтернативного порядка. Старые Web-чаты проверяются отдельно от нового snapshot.

## Повторная сверка T017

После реального нового старта и перезапуска Web Pilot: WF001 HEAD 20260a0cebd825c1d0415070d9eca6e1b1585fd4, Codex Local Mac HEAD 20ba452745ab50fc9bfa722a7b8fd34c8a42024a; оба рабочих дерева чистые. Полный актуальный MCP Skill, server instructions, tool descriptions и backend не требуют hook/ACK. Новый старт Work описан в VERIFICATION.

## Встроенное ядро подготовки workspace

T021 переносит только `kit/` из WF001 на HEAD `20260a0cebd825c1d0415070d9eca6e1b1585fd4` в `resources/workflow-kit/`: 21 исходный файл, 135812 байт, версия 1.1.0. Файлы сохранены побайтно; точный состав и SHA-256 каждого файла закреплены в `tests/workflow-kit-source.test.mjs`. Профиль браузера, ключи, состояние runtime и приложение Swift не копируются. Исходный WF001 не изменяется. Его собственная установленная версия 1.0.0 отличается от поставляемого ядра 1.1.0; это не повод автоматически переустанавливать существующий проект.

На этапе T021 включены исполняемые модули и схемы; шесть Markdown-шаблонов будут добавлены вместе с регистрацией в каталоге документов на T022. Проверка фиксирует исходные SHA всех файлов, проверяя присутствующую часть импорта. Причина разделения: предкоммитная проверка каталога потребовала регистрировать документы до их добавления; незавершённая транзакция допускает только повтор исходного состава задачи.

## Встроенный Windows runtime — scope 008 / T007

Для Windows-поставки используется канонический пакет из соседнего workspace `Codex Local Mac/Windows-Codex-Local-2026-09-10.zip`. Для сборки Project Web Pilot использует неизменённый ZIP, а не его распакованную копию. Из-за 16 MiB лимита Workflow Kit сам 82 MiB payload хранится в ignored `.harness/runtime/windows-payload/` и физически встраивается в готовый Windows distribution; Git хранит его SHA-256 и provenance. SHA-256 payload: `1f041488ad97d8abf1984fd3521afb8abe15f50b8df3d3e11f1cc4248e019d98`; несжатый состав — 34 файла / 86,402,821 байт, сам ZIP около 82 MiB. Источник содержит 46 MCP tools, Windows Computer Use, приватный Python 3.13, MinGit, ripgrep, uv и официальный tunnel-client; live Windows acceptance исходного пакета на момент snapshot была `pending` и должна быть подтверждена уже через Windows Web Pilot.

Payload не содержит пользовательского tunnel ID/API key или DPAPI state. Эти данные создаются только на целевом Windows-пользователе в `%LOCALAPPDATA%\\CodexLocalWindows`.

## Portable Node.js для Windows — scope 008 / T014 (история)

Ниже описана первоначальная поставка Node 22.17.0. В текущих исходниках после T003 refactoring-node24 используется Node 24.21.0; версии и проверки зафиксированы в `docs/planning/refactoring-node24.md` и `docs/VERIFICATION.md`.

Чистая Windows-машина не должна иметь системный Node.js. Build pipeline использует официальный архив Node.js `node-v22.17.0-win-x64.zip` с `https://nodejs.org/dist/v22.17.0/`; ожидаемый SHA-256 — `721ab118a3aac8584348b132767eadf51379e0616f0db802cc1e66d7f0d98f85`. В Git хранится только `windows-runtime/node-v22.17.0-win-x64.zip.sha256`; сам 35.5 MiB архив и распакованный runtime находятся в ignored `.harness/runtime/windows-payload` / `.harness/runtime/windows-node` и физически попадают только в Windows distribution.

Scope 029 / T007: 17.09.2026 штатный Doctor согласовал manifest с byte-identical installed/bundled Kit 1.4.1, создав backup всех канонических планов и manifest. Переход с замороженного исходника 1.4.0 проверен отдельной временной установкой; WF001 и внешний Codex runtime не изменялись.

Scope 029 / T009: 0.6.29 собран из main 5028241 с изменением только package version для выпуска. Все 33 src и 31 resources совпадают побайтово между source, macOS/Windows staging и постоянным Mac app. Workflow Kit 1.4.1 — собственное развитие этого репозитория; внешние WF001/Codex runtime не редактировались. Полный receipt и SHA — .harness/runtime/releases/0.6.29/source-verification.json.

## Canonical Workflow Kit package — текущее состояние

Текущий source of truth — `/Users/oleksandroliinyk/VSCODE/WorkflowKit`, package `@webpilot/workflow-kit@1.5.5`, 35 файлов / SHA-256 `8eadd98869a840f670dbfb00c33350e3054d8ec7de5298b2b0beca82d787f376`; `resources/workflow-kit` создаётся автоматически и игнорируется Git. Сведения о переходе на canonical package ниже относятся к выпуску 0.6.58.

### История подключения canonical package — 0.6.58

На момент выпуска source of truth: `/Users/oleksandroliinyk/VSCODE/WorkflowKit`, package `@webpilot/workflow-kit@1.5.0`. Single-active implementation зафиксирована в серии commit начиная с `06a0b6a`; финальная документация Kit — `f0b98d9`. Runtime `src/` содержит 35 файлов с digest `0db567df6f0c8f68f3119a7322b4c1c6d28cd06bf57b267993b792097bbb2c75`. Project Web Pilot подключает package как `file:../WorkflowKit`, а `resources/workflow-kit` создаёт автоматически и игнорирует в Git. Исторические разделы 1.4.x ниже описывают происхождение прежней session-owned модели, но не задают текущую semantics/source.

## Поставляемый Workflow Kit 1.4.12 — 0.6.53 (история)

С 0.6.53 `resources/workflow-kit` = 1.4.11 из CodeAppServer (`badcf20`, описан ниже) плюс локальное исправление в этом репозитории: `lib/session-plans.mjs` читает `.harness/plans/by-session/`, `lib/inspection-inputs.mjs` включает его в входы проверки, VERSION 1.4.12, upgrade принимает 1.4.11. Содержимое 35 файлов закреплено SHA-256 `5464b2c1528eef1de740af50558bc8db1d39cfa7838f9c032d23650fb4f5f119`. В исходный Kit CodeAppServer исправление не переносилось — это нужно сделать отдельно, иначе следующая синхронизация вернёт дефект.

## Источник поставляемого Workflow Kit 1.4.11 — 0.6.52

С 0.6.52 `resources/workflow-kit` взят не из WF001 (там 1.4.9), а из `/Users/oleksandroliinyk/VSCODE/CodeAppServer+WebChatGPT`, ветка `codex/gpt-provider-names`, коммит `badcf20` (`resources/workflow-kit`, tree `1fe409fbc804a565ef850f830ceb83aaa43e7a0b`). Та же копия установлена в тестовом проекте `/Users/oleksandroliinyk/VSCODE/02_Chat`. Содержимое 35 файлов закреплено SHA-256 `49dd163e025739d93eddd7603ac16c45bae1bae762b14fac69f7d42c111746e9` в `tests/workflow-kit-source.test.mjs`. Ветка ещё не слита в main CodeAppServer.

## Историческая сверка с локальной Web Pilot 0.6.80 — 03.10.2026

На момент этой исторической сверки Web Pilot был 0.6.80 с постоянной Apple Development подписью UkrHD; сохранение ScreenCapture после обновления/перезагрузки подтверждено проверками и пользователем. Парная macOS/Windows поставка 0.6.80 была опубликована на GitHub; README всех трёх репозиториев были синхронизированы с тем состоянием.

Workflow Kit сохраняет версию 1.5.1, прежний runtime и minimum Node 22+; рабочая среда обоих проектов — Node 24.21.0. Web Pilot Sidebar сохраняет собственную версию 0.1.0 и тестовый хост. При сверке vendor lock два адаптера совпали с текущими исходниками Web Pilot; Composer отличается и требует отдельной синхронизации/проверки сборки, что отмечено в README Sidebar. Lock и функциональный код сателлитов этой DOCS не меняются. Точные SHA и публичный контракт — [DOM/Sidebar](modules/chatgpt-dom-compatibility.md).
