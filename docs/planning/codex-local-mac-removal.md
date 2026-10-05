# Codex Local Mac удалён, macOS работает только через App Server — релиз 0.6.91

Поручение пользователя 05.10.2026: Codex Local Mac — второй, собственный MCP, который тестировался и поддерживаться не будет; удалить его совсем. Решения пользователя: отдельный релиз после 0.6.90 ([управление интерфейсом убрано из MCP](computer-use-removal.md)); удаляются и следы на Mac, и зависимость сборки от папки `~/VSCODE/Codex Local Mac`; ZIP Windows-runtime лежит в разделе релизов рядом с пакетами macOS и Windows. Поручение 05.10.2026 после приёмки 0.6.90: закрыть прежний scope, открыть этот план и выполнить его полностью.

Из 0.6.90 сюда перенесено исправление упаковщика: первая сборка 0.6.90 упаковала в `app.asar` неотслеживаемую папку «Claude outputs» ([выпуск 0.6.90](../RELEASE.md)).

## Что показал осмотр кода (main `b08bd64`, 0.6.90)

- `MacRuntimeSwitcher.activate` требует `localRuntime` в обоих режимах: берёт у Codex Local Mac описание команд и состояние и передаёт их в `configure-selector`.
- Запуск приложения на macOS ждёт `activate`. На Mac без туннеля `configure-selector` завершается ошибкой «No configured Secure MCP Tunnel…», и приложение закрывается с окном ошибки: первый запуск на чистом Mac сейчас не доходит до мастера. В выпусках это отмечалось как «чистая VM не проверялась».
- Первый запуск ставит `resources/mac-runtime.zip` (`MacRuntimeBootstrap`, `src/mac-runtime.mjs`) встроенным `uv`, а ID и ключ туннеля принимает `resources/runtime-control/mac-first-run.py` в состояние Codex Local Mac.
- `tools/codex-app-server-mcp/control.py` умеет `setup`, `configure-tunnel`, `start`, `stop`, `configure-channel`, но: запускается через `/usr/bin/python3` (на чистом Mac это заглушка Xcode Command Line Tools), `uv` ищет только в `PATH`, без `uv` создаёт venv системным Python 3.9, которому пакет `mcp` недоступен; отсутствие Codex видно только как «MCP did not become ready».
- Сборка Windows берёт `Windows-Codex-Local-2026-09-10.zip` (86 МБ, SHA-256 закреплён в `src/windows-runtime.mjs`) из `../Codex Local Mac/`; копия лежит в неотслеживаемом кеше `.harness/runtime/windows-payload/`.
- Упаковщик исключает из пакета перечисленные папки; любая новая папка в корне проекта попадает в `app.asar`.
- Codex Local Windows — runtime из того же семейства. Он остаётся: App Server-варианта для Windows нет.

## Результат

1. **В пакет попадает только приложение.** `--ignore` упаковщика обеих платформ пропускает из корня проекта только `src`, `node_modules`, `package.json`, `LICENSE`. `verifyPackagedSources` отклоняет `app.asar`, в корне которого есть что-либо ещё. «Claude outputs/» добавлена в `.gitignore`.
2. **ZIP Windows-runtime — шестой файл каждого релиза**, рядом с пакетами macOS и Windows, начиная с v0.6.91; отдельного тега нет, в Git файл не добавляется. `release-manifest.json`, `SHA256SUMS.txt` и проверка `github-release` учитывают шестой файл. `scripts/prepare-windows-toolchain.mjs` при пустом кеше скачивает ZIP из последнего релиза и сверяет закреплённый SHA-256; кандидат `../Codex Local Mac/` удалён; `WEB_PILOT_WINDOWS_RUNTIME_ARCHIVE` и локальный кеш остаются.
3. **Один backend на macOS — Codex App Server Local Mac.** Режим `local`, действие `setMacRuntimeMode`, выбор папки runtime и две кнопки переключателя в «Настройках» удалены. В разделе «Локальные инструменты macOS» остаётся состояние службы.
4. **Запуск приложения не зависит от готовности служб.** Объект runtime создаётся без обращения к диску; подготовка (`activate`) выполняется при запуске, только если установлены Xcode Command Line Tools, и её ошибка показывается в интерфейсе, а не закрывает приложение. Мастер первого запуска повторяет подготовку на шаге «Проверить и продолжить».
5. **Первый запуск на чистом Mac:** Git (Command Line Tools, как раньше) → `control.py setup` встроенным `uv` (Python 3.13, пакет `mcp`, tunnel-client с проверкой SHA-256) → запуск MCP → ввод ID и ключа туннеля прямо в состояние executor (ключ только через stdin) → запуск туннеля. Bundled runtime Codex Local Mac не ставится. В мастере имя плагина — «Codex App Server Local Mac».
6. **Требование macOS:** установлен Codex (CLI или приложение ChatGPT). `control.py` проверяет это до установки и запуска и сообщает код `CODEX_NOT_FOUND`; интерфейс показывает отдельное понятное сообщение.
7. **Selector.** `selector.json` хранит адрес MCP и канал ChatGPT; блок `local` и аргументы `--mode`/`--local-*` удалены. Формат совместим с 0.6.90 (`schema_version: 1`, `mode: "app-server"`), файл с режимом `local` читается как `app-server` и переписывается. `selector-start` при входе в macOS поднимает только App Server и соблюдает канал.
8. **Обновление существующей установки** (один раз, при первой подготовке в 0.6.91; отметка в настройках Web Pilot):
   - если у executor нет профиля и ключа туннеля, а в `~/Library/Application Support/CodexLocalMac/private` они есть, туннель переносится; ключ не выводится и не логируется;
   - процессы прежнего runtime останавливаются только при точном совпадении командной строки с его файлами (`mcp/bridge_mcp.py`, `tools/tunnel-client … --profile mac-local`);
   - удаляются установленная Web Pilot копия `<данные приложения>/runtime/Codex-Local-Mac` с маркером `mac-runtime.json` и LaunchAgent `com.oleynik.CodexLocalMac` (bootout и plist);
   - настройки `macRuntimeMode`, `runtimeFolder` и `runtimeRegistration` на macOS больше не используются и не записываются.
9. **Не удаляются автоматически:** `~/Library/Application Support/CodexLocalMac` (там ключ туннеля) и `~/VSCODE/Codex Local Mac`. Их пользователь удаляет сам; в `docs/RELEASE.md` — точные пути и условие: 0.6.91 запущена и инструменты работают.
10. **Удалены из репозитория:** `src/mac-runtime.mjs`, `resources/mac-runtime.zip`, `resources/runtime-control/mac-control.py`, `resources/runtime-control/mac-first-run.py` (диалоги ввода переехали в `tools/codex-app-server-mcp/tunnel_prompt.py`), `scripts/benchmark-codex-app-server-mcp.mjs`, ветка `darwin` в `defaultRuntimeFolder`, кандидат tunnel-client из папки Codex Local Mac, строки «Codex Local Mac» в интерфейсе.
11. Режим первого сообщения (`src/context-session.mjs`, `src/mcp-runtime.mjs`) остаётся для Windows; на macOS контекст доставляется только через MCP.
12. Релиз **0.6.91**: версия → DOCS → парная сборка → установка в `/Applications` → GitHub Release (шесть файлов) и синхронизация `main`.

## Запуск

Установить 0.6.91, полностью выйти из Web Pilot (⌘Q) и открыть снова. На Mac пользователя перенос туннеля не нужен: executor уже владеет туннелем и каналом VPS. После проверки можно удалить `~/VSCODE/Codex Local Mac` и `~/Library/Application Support/CodexLocalMac`.

Откат: в `.harness/runtime/release-backups.noindex/mac-Applications-*` лежит Contents версии 0.6.90; тот же пакет есть в GitHub Release v0.6.90. `selector.json` остаётся читаемым для 0.6.90.

## Проверка

- `unit-all`: весь `npm test`, включая тесты ниже.
- Упаковщик: тест `verifyPackagedSources` с посторонней папкой в `app.asar` — отказ; регулярное выражение `--ignore` из `package.json` пропускает `src`, `node_modules`, `package.json`, `LICENSE` и отбрасывает «Claude outputs», `docs`, `.harness`, `Project Web Pilot.app`.
- ZIP Windows-runtime: при пустом кеше ZIP скачивается, неверный SHA-256 отклоняется, существующий кеш переиспользуется (сеть в тестах подменена); поставка содержит ZIP шестым файлом с закреплённым SHA-256.
- `executor-channel` (`control.py` на временном состоянии): selector без `local`; файл с режимом `local` читается и переписывается; `selector-start` в обоих каналах; `configure-selector` без туннеля не падает; перенос туннеля из прежнего состояния без вывода ключа; отсутствие Codex даёт `CODEX_NOT_FOUND`; диалог ввода принимает ключ только из stdin.
- `vps-runtime` (runtime macOS на подменённых командах): подготовка без `localRuntime`; без туннеля подготовка не падает и не запускает tunnel-client; `start` с `mcpOnly`; отсутствие Codex — отдельный код ошибки; одноразовое обновление останавливает только процессы с точным совпадением пути, удаляет только копию в данных приложения и LaunchAgent, повторно не выполняется.
- `settings-ui`: в «Настройках» нет переключателя backend, раздел канала ChatGPT работает; мастер показывает новое имя плагина.
- Поиск по `src`, `scripts`, `resources`, `tools`: нет `Codex Local Mac`, `mac-runtime.zip`, `mac-control.py`; `CodexLocalMac` — только в коде одноразового обновления.
- Статически для `src/main.mjs`: сборка esbuild без неразрешённых импортов и проверка неопределённых имён (главный процесс тестами не покрыт).
- Вживую на этом Mac до сборки: `control.py setup` и `start --mcp-only` во временном каталоге состояния со встроенным `uv`.
- `paired-release`, `release-installed`, `github-release` для 0.6.91.
- Вживую — пользователь: перезапуск Web Pilot 0.6.91 на своём Mac (инструменты работают в ChatGPT и Claude через VPS, после перезагрузки тоже); первый запуск на чистой macOS VM с установленным Codex и без него; native Windows.

## Задачи

| № | Задача | Основные файлы |
| --- | --- | --- |
| T000 | Сборка: в пакет попадает только приложение | `package.json`, `scripts/release-all.mjs`, `tests/release-all.test.mjs`, `.gitignore` |
| T001 | ZIP Windows-runtime: шестой файл релиза, загрузка с проверкой SHA-256 | `scripts/prepare-windows-toolchain.mjs`, `scripts/release-all.mjs`, `scripts/check-github-release.mjs`, тесты |
| T002 | Executor без Codex Local Mac: selector, проверка Codex, встроенный uv, диалог ввода туннеля | `tools/codex-app-server-mcp/control.py`, `tools/codex-app-server-mcp/tunnel_prompt.py`, `tests/codex-app-server-mcp.test.mjs` |
| T003 | macOS только через App Server: подготовка, первый запуск, одноразовое обновление, интерфейс | `src/mac-runtime-switch.mjs`, `src/main.mjs`, `src/preload.cjs`, `src/startup-platform.mjs`, `src/startup-readiness.mjs`, `src/ui/*`, тесты |
| T004 | Удалить Codex Local Mac из репозитория | `src/mac-runtime.mjs`, `resources/mac-runtime.zip`, `resources/runtime-control/mac-*.py`, `scripts/benchmark-codex-app-server-mcp.mjs`, `src/platform.mjs`, `src/mcp-runtime.mjs`, тесты, `AGENTS.md` |
| T005 | Source релиза 0.6.91 | `package.json`, `package-lock.json` |
| DOCS | Актуализация документов | добавляет Kit |
| T006 | Парная сборка 0.6.91 | — |
| T007 | Установка в `/Applications` | — |
| T008 | GitHub Release v0.6.91 (шесть файлов) и синхронизация `main` | — |

Workflow Kit 1.5.5 не принимает кодовую задачу после завершённой delivery-задачи, поэтому всё, что должно попасть в релиз, проверяется до T006.

## Границы

- Windows-runtime (Codex Local Windows) не удаляется и не переписывается; меняется только место, откуда сборка берёт его ZIP.
- Secure MCP Tunnel остаётся каналом по умолчанию; канал VPS не меняется.
- Папки пользователя вне данных приложения автоматически не удаляются. Агент не удаляет `~/VSCODE/Codex Local Mac`.
- Ключ туннеля и адрес коннектора не попадают в репозиторий, журналы, диагностику и чат.
- Исторические документы не переписываются; `docs/SOURCE_WORKSPACES.md` и `AGENTS.md` получают актуальное состояние: Codex Local Mac — история, не источник.
- Первый запуск на чистом Mac и native Windows проверяет пользователь; агент не запускает VM и не использует Computer Use.

## Риски

- Первый запуск на чистом Mac автотестами покрывается только на подменённых командах и прогоном `setup` во временном каталоге на Mac разработчика; чистую систему проверяет пользователь.
- Главный процесс (`src/main.mjs`) меняется заметно, а тестами не покрыт: проверяется статически и первым запуском установленной версии у пользователя.
- Установки, оставшиеся в режиме `local` и не имеющие Codex, после обновления не заработают, пока Codex не установлен. Это следствие решения оставить один backend.
- Сборка из свежего клона зависит от GitHub: ZIP Windows-runtime берётся из последнего релиза; локальный кеш и переменная окружения остаются запасным путём. До публикации v0.6.91 в релизах этого файла нет.
- Каждый релиз становится больше на 86 МБ, хотя тот же ZIP уже лежит внутри Windows-пакета. Это цена того, что файл всегда рядом с текущим релизом.

## Итог

- T000 `cf97a0c` — состав пакета. T001 `5777a5a` — ZIP Windows-runtime. T002 `3e5cda4` — executor без Codex Local Mac. T003 `9c8aec8` — macOS только через App Server. T004 `1636b53` — удаление из репозитория. T005 `5e4c143` — версия 0.6.91.
- Отступления от раздела «Результат»:
  - п. 4 — при запуске приложение ждёт подготовку, только если службы уже установлены (и есть Command Line Tools); на Mac без установленных служб её выполняет мастер или первое открытие проекта;
  - п. 8 — `macRuntimeMode: "app-server"` по-прежнему записывается (не читается) ради отката на 0.6.90; до завершения очистки в настройках хранится `legacyRuntimeRoots`; процессы останавливаются в папках из настроек и в копии из данных приложения;
  - п. 10 — ветка `darwin` в `defaultRuntimeFolder` не удалена, а возвращает каталог состояния executor;
  - сверх контракта — автозапуск служб включается и после неудачной подготовки; `LocalMcpClient` требует имя сервера; обновлены `tests/startup-readiness.test.mjs` и `tests/electron-smoke.mjs`, которых не было в плане. Причины — в [DECISIONS](../DECISIONS.md).
- «Очистка повторно не выполняется»: тестами покрыт результат `legacyRetired`; отметка `legacyMacRuntimeRetired` хранится в `src/main.mjs`, который тестами не покрыт.
- Живой прогон до сборки на изолированном состоянии (свободные порты, `launchctl` подменён записью): мастер первого запуска на настоящих `control.py` и `uv` дошёл до шага туннеля за 9,9 с; MCP отвечает именем «Codex App Server Local Mac», 38 инструментов; полный запуск без туннеля — `TUNNEL_NOT_CONFIGURED`; повторная подготовка — 2,2 с. Electron smoke на исходниках 0.6.91 — exit 0.
- `commit --task T003` в первый раз снова завершился `PRIVATE_CONTEXT` на `.codex/hooks.json` (файл не менялся); повтор без изменений прошёл. То же было в 0.6.90; причина не установлена.
- DOCS `00eb4a4` — до сборки. T006 `5ff4905` — парная сборка из sourceCommit `00eb4a424125229cf3ce5c4bab4a52672d520a7d`, шесть файлов поставки. T007 `711d37b` — установка в `/Applications` без пересборки.
- T008: [GitHub Release v0.6.91](https://github.com/OleynikAleksandr/Project-Web-Pilot/releases/tag/v0.6.91) опубликован 2026-10-05T09:18:07Z, шесть assets сверены по серверным SHA-256.
- Остаётся пользователю: полностью выйти из Web Pilot и открыть 0.6.91; проверить инструменты в ChatGPT и Claude; после этого удалить `~/VSCODE/Codex Local Mac` и `~/Library/Application Support/CodexLocalMac`; чистая macOS и native Windows.
