# Codex Local Mac удалён, macOS работает только через App Server — релиз 0.6.91

Поручение пользователя 05.10.2026: Codex Local Mac — второй, собственный MCP, который тестировался и поддерживаться не будет; удалить его совсем. Решения пользователя: отдельный релиз после 0.6.90 ([Computer Use убран из MCP](computer-use-removal.md)); удаляются и следы на Mac, и зависимость сборки от папки `~/VSCODE/Codex Local Mac`. Уточнение 05.10.2026: ZIP Windows-runtime лежит в разделе релизов рядом с пакетами macOS и Windows.

Статус: контракт следующего этапа. План в Workflow Kit создаётся через `plan:create` после закрытия плана 0.6.90, потому что у checkout один текущий план. До начала этапа сверить перечни ниже с кодом: они составлены по `main` `7b1d77b` (0.6.89).

## Что показал осмотр кода

- `MacRuntimeSwitcher.activate` требует `localRuntime` в обоих режимах: берёт у Codex Local Mac описание команд и состояние и передаёт их в `configure-selector`.
- Первый запуск на macOS идёт через `MacRuntimeBootstrap` (`src/mac-runtime.mjs`): он ставит `resources/mac-runtime.zip` в данные приложения, а ID и ключ туннеля принимает `resources/runtime-control/mac-first-run.py` в состояние Codex Local Mac. App Server затем забирает туннель через `adopt_tunnel_from_local`.
- `tools/codex-app-server-mcp/control.py` уже умеет всё сам: `setup` (venv и tunnel-client в собственном состоянии), `configure-tunnel --key-stdin`, `start`, `stop`, `configure-channel`. От Codex Local Mac в нём остаются обязательные аргументы `--local-*`, режим `local` в `selector.json`, `run_local_control` и путь `~/VSCODE/Codex Local Mac/…/tunnel-client` среди кандидатов.
- Сборка Windows берёт `Windows-Codex-Local-2026-09-10.zip` (86 МБ, SHA-256 закреплён в `src/windows-runtime.mjs`) из `../Codex Local Mac/`; копия лежит в неотслеживаемом кеше `.harness/runtime/windows-payload/`. Этот же ZIP уже публикуется внутри каждого Windows-пакета релиза.
- Codex Local Windows — runtime из того же семейства. Он остаётся: App Server-варианта для Windows нет.

## Результат

1. **Один backend на macOS — Codex App Server Local Mac.** Режим `local`, `MAC_RUNTIME_MODES`, действие `setMacRuntimeMode`, выбор папки «Выбрать Codex Local Mac» и две кнопки переключателя в «Настройках» удалены. В разделе «Локальные инструменты macOS» остаётся состояние службы.
2. **Первый запуск на чистом Mac** идёт через executor App Server: `control.py setup`, затем ввод ID и ключа туннеля прямо в его состояние (`configure-tunnel`, ключ только через stdin), затем запуск. Bundled runtime Codex Local Mac не ставится. В мастере имя плагина — «Codex App Server Local Mac».
3. **Требование macOS:** установлен Codex (CLI или приложение ChatGPT). Если бинарник не найден, мастер первого запуска показывает понятную ошибку с тем, что установить, а не общий отказ runtime.
4. **Selector.** `selector.json` хранит адрес MCP и канал ChatGPT. Блок `local`, режим и аргументы `--local-*` удалены; `selector-start` при входе в macOS поднимает только App Server и соблюдает канал. Файл прежнего формата читается и переписывается.
5. **Обновление существующей установки** (один раз, при первом запуске 0.6.91):
   - настройка `macRuntimeMode: local` становится `app-server`;
   - если у executor ещё нет профиля и ключа туннеля, а в `~/Library/Application Support/CodexLocalMac/private` они есть, туннель переносится существующим `adopt_tunnel_from_local`; ключ не выводится и не логируется;
   - процессы прежнего runtime останавливаются с проверкой принадлежности (как `stopLegacyOrphans`);
   - удаляются установленная Web Pilot копия `<данные приложения>/runtime/Codex-Local-Mac` с маркером `mac-runtime.json` и LaunchAgent `com.oleynik.CodexLocalMac` (bootout и plist).
6. **Не удаляются автоматически:** `~/Library/Application Support/CodexLocalMac` (там ключ туннеля) и `~/VSCODE/Codex Local Mac`. Их пользователь удаляет сам; в `docs/RELEASE.md` — точные пути и условие: 0.6.91 запущена и инструменты работают.
7. **Удалены из репозитория:** `src/mac-runtime.mjs`, `resources/mac-runtime.zip`, `resources/runtime-control/mac-control.py`, `resources/runtime-control/mac-first-run.py` (или заменён помощником ввода для executor), `scripts/benchmark-codex-app-server-mcp.mjs`, ветка `darwin` в `defaultRuntimeFolder`, кандидат tunnel-client из папки Codex Local Mac, строки «Codex Local Mac» в интерфейсе.
8. **ZIP Windows-runtime не зависит от папки Codex Local Mac.** Он публикуется в разделе релизов GitHub рядом с пакетами macOS и Windows — дополнительным файлом обычного релиза, начиная с v0.6.91; отдельного тега нет, в Git файл не добавляется. Релиз содержит шесть файлов вместо пяти; `release-manifest.json`, `SHA256SUMS.txt` и проверка `github-release` учитывают шестой. `scripts/prepare-windows-toolchain.mjs` при пустом кеше скачивает ZIP из последнего релиза и сверяет закреплённый SHA-256 — так же, как portable Node. Кандидат `../Codex Local Mac/` удалён; `WEB_PILOT_WINDOWS_RUNTIME_ARCHIVE` и локальный кеш остаются.
9. Режим первого сообщения (`src/context-session.mjs`, `src/mcp-runtime.mjs`) остаётся для Windows; на macOS контекст доставляется только через MCP.
10. Релиз **0.6.91**: версия → DOCS → парная сборка → установка в `/Applications` → GitHub Release и синхронизация `main`.

## Запуск

Установить 0.6.91 и запустить Web Pilot. На Mac пользователя перенос не нужен: executor уже владеет туннелем и каналом VPS. После проверки можно удалить `~/VSCODE/Codex Local Mac` и `~/Library/Application Support/CodexLocalMac`.

## Проверка

- Тесты executor (`control.py` на временном состоянии): selector без `local`; чтение файла прежнего формата; `selector-start` в обоих каналах; перенос туннеля из прежнего состояния без вывода ключа; `configure-tunnel` принимает ключ только из stdin.
- Тесты runtime macOS: `activate` без `localRuntime`; первый запуск вызывает `setup` и `configure-tunnel` executor; отсутствие Codex даёт отдельный код ошибки; очистка удаляет только копию в данных приложения и LaunchAgent, чужие пути не трогает (временные fixtures).
- JSDOM: в «Настройках» нет переключателя backend, раздел канала ChatGPT работает; мастер показывает новое имя плагина.
- Сборка Windows: при пустом кеше ZIP скачивается, неверный SHA-256 отклоняется, существующий кеш переиспользуется (сеть в тестах подменена). Поставка содержит ZIP runtime шестым файлом, его SHA-256 в `SHA256SUMS.txt` совпадает с закреплённым.
- Поиск по `src`, `scripts`, `resources`, `tools`: нет `Codex Local Mac`, `CodexLocalMac`, `mac-runtime.zip`, `mac-control.py` вне кода одноразового обновления.
- `unit-all`, `paired-release`, `release-installed`, `github-release` для 0.6.91.
- Вживую — пользователь: обновление на своём Mac (инструменты работают в ChatGPT и Claude через VPS, после перезагрузки тоже); первый запуск на чистой macOS VM с установленным Codex и без него; сборка `npm run build` после удаления папки `~/VSCODE/Codex Local Mac`.

## Задачи будущего плана

| № | Задача | Основные файлы |
| --- | --- | --- |
| T000 | Сборка: в пакет попадает только приложение — `--ignore` обеих платформ пропускает из корня только `src`, `node_modules`, `package.json`, `LICENSE`; `verifyPackagedSources` отклоняет `app.asar` с чем-либо ещё в корне | `package.json`, `scripts/release-all.mjs`, `tests/release-all.test.mjs` |
| T001 | ZIP Windows-runtime: шестой файл релиза, загрузка с проверкой SHA-256 | `scripts/prepare-windows-toolchain.mjs`, `scripts/release-all.mjs`, `scripts/check-github-release.mjs`, `tests/windows-runtime.test.mjs`, `tests/release-all.test.mjs`, `docs/SOURCE_WORKSPACES.md` |
| T002 | Executor без Codex Local Mac: selector, `selector-start`, кандидаты tunnel-client | `tools/codex-app-server-mcp/control.py`, `tests/codex-app-server-mcp.test.mjs` |
| T003 | Первый запуск macOS через executor: setup, ввод туннеля, проверка Codex | `src/mac-runtime-switch.mjs`, `src/main.mjs`, `src/tunnel-setup.mjs`, `src/startup-platform.mjs`, `src/ui/startup.mjs`, `src/ui/index.html`, тесты запуска |
| T004 | Один backend: убрать режим `local` и переключатель, перевод настроек | `src/mac-runtime-switch.mjs`, `src/main.mjs`, `src/ui/settings-panel.mjs`, `src/ui/index.html`, `src/platform.mjs`, тесты |
| T005 | Одноразовое обновление: перенос туннеля, остановка и очистка следов | `src/mac-runtime-switch.mjs`, `src/main.mjs`, тесты |
| T006 | Удалить ресурсы и код Codex Local Mac, обновить `AGENTS.md` | `src/mac-runtime.mjs`, `resources/mac-runtime.zip`, `resources/runtime-control/mac-*.py`, `scripts/benchmark-codex-app-server-mcp.mjs`, `tests/mac-runtime.test.mjs`, `tests/mac-first-run.test.mjs`, `tests/tunnel-id-*.test.mjs`, `AGENTS.md` |
| T007 | Source релиза 0.6.91 | `package.json`, `package-lock.json` |
| DOCS | Актуализация документов | добавляет Kit |
| T008 | Парная сборка 0.6.91 | — |
| T009 | Установка в `/Applications` | — |
| T010 | GitHub Release v0.6.91 и синхронизация `main` | — |

T000 самой первой: она перенесена из 0.6.90, где сборка упаковала неотслеживаемую папку «Claude outputs» (см. [выпуск 0.6.90](../RELEASE.md)); до неё перед сборкой в корне проекта не должно быть посторонних папок. T001 следом: она независима. Зависимость сборки из свежего клона от папки снимается после публикации v0.6.91, когда ZIP появляется в релизе; до этого сборка идёт из локального кеша. T005 и T006 — после T003 и T004, чтобы до переноса первого запуска прежний путь оставался рабочим.

## Границы

- Windows-runtime (Codex Local Windows) не удаляется и не переписывается; меняется только место, откуда сборка берёт его ZIP.
- Secure MCP Tunnel остаётся каналом по умолчанию; канал VPS не меняется.
- Папки пользователя вне данных приложения автоматически не удаляются. Агент не удаляет `~/VSCODE/Codex Local Mac`.
- Ключ туннеля и адрес коннектора не попадают в репозиторий, журналы, диагностику и чат.
- Исторические документы не переписываются; `docs/SOURCE_WORKSPACES.md` и `AGENTS.md` получают актуальное состояние: Codex Local Mac — история, не источник.
- Первый запуск на чистом Mac и native Windows проверяет пользователь; агент не запускает VM и не использует Computer Use.

## Риски

- Первый запуск на чистом Mac автотестами покрывается только на подменённых командах; реальную установку venv и tunnel-client проверяет пользователь.
- Установки, оставшиеся в режиме `local` и не имеющие Codex, после обновления не заработают, пока Codex не установлен. Это следствие решения оставить один backend.
- Сборка из свежего клона зависит от GitHub: ZIP берётся из последнего релиза; локальный кеш и переменная окружения остаются запасным путём.
- Каждый релиз становится больше на 86 МБ, хотя тот же ZIP уже лежит внутри Windows-пакета. Это цена того, что файл всегда рядом с текущим релизом.
