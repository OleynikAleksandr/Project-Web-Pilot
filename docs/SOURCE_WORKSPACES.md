# Исходные проекты и ссылки

## Проверенный снимок

Пути и Git-состояние проверены 11.09.2026 при подготовке Project Web Pilot. Оба источника имели чистое рабочее дерево. Перед переиспользованием повторно проверить HEAD и действующие инструкции: это привязанный ко времени снимок, не указание сбрасывать репозиторий на старую версию.

| Проект | Абсолютный путь | Проверенный HEAD |
| --- | --- | --- |
| Project Workflow Kit | `/Users/oleksandroliinyk/VSCODE/WF001` | `20260a0cebd825c1d0415070d9eca6e1b1585fd4` |
| Codex Local Mac | `/Users/oleksandroliinyk/VSCODE/Codex Local Mac` | `1d0ddef03c6d6af0dd3167831a20296307e2d930` |
| Новый целевой проект | `/Users/oleksandroliinyk/VSCODE/Project Web Pilot` | Начальный bootstrap `08e138789734cc3ea61be3fb078d067d2676cbb5`; текущий HEAD читать из Git |

Project ID нового проекта: `cf944136-d1fc-4bd5-9ea0-e46d1fe230e7`. В старых документах Codex Local Mac может называться `002`: папка была переименована пользователем. Для новых команд использовать текущий явный путь, не историческое имя.

## WF001: откуда брать Workflow Kit

| Материал | Для чего читать |
| --- | --- |
| [AGENTS.md](/Users/oleksandroliinyk/VSCODE/WF001/AGENTS.md) | Границы работы с исходным проектом |
| [Спецификация](/Users/oleksandroliinyk/VSCODE/WF001/project-workflow-kit-specification.md) | Полные требования к установке, планам, Git и восстановлению |
| [Продукт](/Users/oleksandroliinyk/VSCODE/WF001/docs/PRODUCT.md) | Создание проекта, подключение существующего, UI-состояния |
| [Архитектура](/Users/oleksandroliinyk/VSCODE/WF001/docs/architecture/ARCHITECTURE.md) | Ядро, JSON-ответы, транзакции и recovery |
| [Проверки](/Users/oleksandroliinyk/VSCODE/WF001/docs/VERIFICATION.md) | Что проверялось и где нужны реальные пользовательские подтверждения |
| [Исходный протокол kit](/Users/oleksandroliinyk/VSCODE/WF001/kit/WORKFLOW.md) | Канонические правила переносимого комплекта |
| [CLI](/Users/oleksandroliinyk/VSCODE/WF001/kit/cli.mjs) | inspect/install/status/doctor/recover и управляемые команды |
| [Установщик](/Users/oleksandroliinyk/VSCODE/WF001/kit/lib/installer.mjs) | Конфликты, сохранение существующих файлов, установка и переподключение |
| [Recovery](/Users/oleksandroliinyk/VSCODE/WF001/kit/lib/recovery.mjs) | Полный пакет из выбранных документов, плана и Git |
| [Состояния и действия](/Users/oleksandroliinyk/VSCODE/WF001/kit/lib/actions.mjs) | Scope, task:start, изменение плана и конфигурации |
| [SwiftUI AppModel](/Users/oleksandroliinyk/VSCODE/WF001/Sources/WorkflowStudio/AppModel.swift) | Пример подключения UI к ядру; не обязательный стек нового UI |
| [Windows](/Users/oleksandroliinyk/VSCODE/WF001/docs/WINDOWS.md) | Прежняя упаковка для Windows и ограничения её проверки |

Связанные исходники: `kit/lib/plan.mjs`, `validate.mjs`, `transaction.mjs`, `git.mjs`, `git-hooks.mjs`, `common.mjs`, `platform.mjs`, `installation-files.mjs`, `kit/schemas/`, `kit/templates/`. Регрессии: `tests/install.test.mjs`, `workflow.test.mjs`, `recovery.test.mjs`, `windows.test.mjs` и `scripts/demo-workflow.mjs`.

Источник переносимого runtime — **WF001/kit**, версия 1.1.0 по common.mjs. Собственная установленная WF001/.harness/kit имеет manifest 1.0.0: не перепутать установленный экземпляр с исходным комплектом. В Project Web Pilot установлена версия 1.1.0; её не переустанавливать ради начала сессии.

## Codex Local Mac: откуда брать локальное подключение

| Материал | Для чего читать |
| --- | --- |
| [AGENTS.md](</Users/oleksandroliinyk/VSCODE/Codex Local Mac/AGENTS.md>) | Инструкции исходного workspace |
| [Архитектура](</Users/oleksandroliinyk/VSCODE/Codex Local Mac/docs/architecture/ARCHITECTURE.md>) | Python MCP, loopback и secure tunnel |
| [Настройка Mac](</Users/oleksandroliinyk/VSCODE/Codex Local Mac/docs/MACOS_SETUP.md>) | Зависимости, подключение ChatGPT, управление службами |
| [Приёмка](</Users/oleksandroliinyk/VSCODE/Codex Local Mac/docs/ACCEPTANCE.md>) | Реальные локальные и Safari-проверки |
| [Проверка контекста](</Users/oleksandroliinyk/VSCODE/Codex Local Mac/docs/CONTEXT_PROBE.md>) | Уже реализованный recovery/ACK, положительный и отрицательный эксперименты |
| [Канонический MCP skill](</Users/oleksandroliinyk/VSCODE/Codex Local Mac/mac-codex-local/skills/local-computer/SKILL.md>) | Последовательность действий агента и пределы доказательств |
| [Управление службами](</Users/oleksandroliinyk/VSCODE/Codex Local Mac/mac-codex-local/control.py>) | setup/start/status/stop, readiness и владение процессами |
| [MCP tools](</Users/oleksandroliinyk/VSCODE/Codex Local Mac/mac-codex-local/mcp/bridge_mcp.py>) | Сервер, tool schemas, instructions и четыре контекстных инструмента |
| [ContextProbe](</Users/oleksandroliinyk/VSCODE/Codex Local Mac/mac-codex-local/server/context_probe.py>) | Полный пакет, свежесть, facts/readback и журнал ACK |
| [Файлы и процессы](</Users/oleksandroliinyk/VSCODE/Codex Local Mac/mac-codex-local/server/bridge_server.py>) | Основной bridge runtime |
| [Локальные исправления workflow](</Users/oleksandroliinyk/VSCODE/Codex Local Mac/docs/WORKFLOW_FIXES.md>) | История исправления plan:apply и незавершённых транзакций |
| [Windows-комплект](</Users/oleksandroliinyk/VSCODE/Codex Local Mac/Windows-Codex-Local/START_HERE.md>) | Отдельный переносимый источник для будущего Windows-этапа |

Текущий macOS MCP публикует 50 tools: 46 основных и workflow_context_recover/ack/status/hook. Ранние разделы документации с числом 46 описывают прежний этап. Перед реализацией проверить текущий tools/list. Python-окружение находится в `mac-codex-local/.venv`, требования — `mac-codex-local/requirements.txt`; их не копировать целиком в Git.

Локальный endpoint текущей конфигурации — `http://127.0.0.1:17842/mcp`; service manager также проверяет tunnel readiness. Команды control.py возвращают JSON; проверять exit code и содержимое, не только наличие процесса. Пример read-only диагностики существующей установки:

```bash
"/Users/oleksandroliinyk/VSCODE/Codex Local Mac/mac-codex-local/.venv/bin/python3" \
  "/Users/oleksandroliinyk/VSCODE/Codex Local Mac/mac-codex-local/control.py" status
```

Папка состояния — `~/Library/Application Support/CodexLocalMac`; приватную конфигурацию и ключи не включать в артефакты. Исторические отчёты находятся в ignored `.harness/runtime/context-probe-work/` исходного проекта и могут отсутствовать после клонирования. Авторитетное переносимое описание результатов сохранено в его docs/CONTEXT_PROBE.md.

## Правила переиспользования

Сейчас источники нужны для чтения. Любое перенесение кода — отдельная задача нового плана после проверки прототипа. Для каждого перенесённого блока фиксировать repo/path/SHA и изменения, учитывать лицензии. Не делать скрытые изменения в оригиналах, не копировать .git, .venv, node_modules, runtime-состояние, tokens, cookies и ключи. Для переносимой поставки зависимость от абсолютных путей компьютера должна быть заменена явной упаковкой; прототип пока честно использует существующую установку.

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
