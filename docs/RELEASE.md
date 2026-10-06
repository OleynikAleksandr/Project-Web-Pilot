# Выпуск и постоянный путь запуска

## Выпуск 0.6.96 — 06.10.2026

Текущая опубликованная и установленная версия; предыдущая — 0.6.95. [Контракт](planning/context-as-text.md); доказательства — [VERIFICATION](VERIFICATION.md), разделы от 2026-10-06. [GitHub Release v0.6.96](https://github.com/OleynikAleksandr/Project-Web-Pilot/releases/tag/v0.6.96).

Состав: контекст текстом первым сообщением на macOS и Windows, MCP из девяти инструментов без доставки контекста, автопродолжение с текстом задачи, строка для внешнего клиента, Workflow Kit 1.5.6 в пакете `packages/workflow-kit`, Windows через исполнитель Codex App Server с каналами Secure MCP Tunnel и VPS. Электрон 44.5.1, Node 24.21.0, Codex 0.160.0 без изменений.

Предсборочные доказательства: задачи M001–T005 зафиксированы (хеши — в VERIFICATION); полный `npm test` — 554 total, 553 passed, 1 skipped, 0 failed; Electron smoke и `npm run check:codex-tools` (`rust-v0.160.0`) пройдены.

После предсборочной DOCS `9c2ced9cce9f7fdc387eaeddb0cc3b10898cadc9` выполнена одна парная сборка — её запустила проверка `paired-release` при коммите T006 (`4915aa6`); `release-manifest.sourceCommit` равен коммиту DOCS, `packagedSourceMatches=true`, 107 файлов исходника сверены, в каждом пакете 8 файлов исполнителя, bundled Workflow Kit 1.5.6 (35 файлов). Затем установка корневого app и `/Applications` без пересборки (T007 `48e5428`, identity сохранена, резервная копия прежней установки — в `release-backups.noindex`) и публикация (T008 `c925ae8`): tag `v0.6.96` указывает на `9c2ced9`, GitHub Release опубликован 2026-10-06T08:57:44Z, не draft/prerelease, `main` отправлен.

Шесть файлов GitHub Release v0.6.96:

| Файл | Байт | SHA-256 |
| --- | --- | --- |
| Project-Web-Pilot-0.6.96-macOS-arm64.zip | 185962947 | `df2271ce1a107f58e694c26233c06e23139e31597e5844987e9902b0d45135ef` |
| Project-Web-Pilot-0.6.96-Windows-x64.zip | 355097855 | `4c3eae627588e488c20155fbdc674a11c37f460c8f51a2966205312cdeb34818` |
| Windows-Codex-Local-2026-09-10.zip | 86242347 | `1f041488ad97d8abf1984fd3521afb8abe15f50b8df3d3e11f1cc4248e019d98` |
| SHA256SUMS.txt | 315 | `a490d9b3aad6701c70879b45a512c5feb06d85f72f0a45ff7e57cc95c8daa439` |
| INSTALL.txt | 1469 | `944222091756f8c60c6cb3f7f5e76a7f2d42e977992fddcb04dff2c47207f101` |
| release-manifest.json | 1753 | `d01bcb0090a777c18051f4ae2155fc02e0eac9b73eacd8e0d12bcd4da5421c36` |

ASAR обеих Mac-копий — `929df8f2aaec58b03badb899765aa0f64164f2798f0240b8fc80754a2dcd3ee0`; подпись — прежний выбранный сертификат Apple Development (Team `LXY7H5ZUE9`), CDHash `0c7e1f78d65386c156a4df4210d3a899dfda00af`. Локальная поставка — `~/Downloads/WebPilot-0.6.96/`. Состав поставки не меняется: два ZIP, закреплённый архив компонентов Windows, `SHA256SUMS.txt`, `INSTALL.txt`, `release-manifest.json`. `verify:win` дополнительно проверяет файлы исполнителя в Windows-пакете и четыре компонента в архиве.

**Прежний репозиторий WorkflowKit.** Прежний репозиторий `OleynikAleksandr/WorkflowKit` (T009, 06.10.2026): README первой строкой ведёт на `packages/workflow-kit` этого репозитория — коммит `217c4a34739a44de2ea517ff459c20dd2e525e33` его собственного плана (задача T005 плана `push-after-docs-1.5.5-20261004`, перед ним служебный коммит плана `b691665`), отправлен в его `origin/main`; затем репозиторий переведён на GitHub в архив (только чтение). Последний коммит прежнего репозитория — `217c4a34739a44de2ea517ff459c20dd2e525e33`. Проверка `workflow-kit-archive` (`scripts/check-workflow-kit-archive.mjs`) запрашивает GitHub: `archived=true`, `main` указывает на этот коммит, первая строка README содержит ссылку на новый дом. Локальная папка `/Users/oleksandroliinyk/VSCODE/WorkflowKit` не удалялась; кроме этих двух коммитов в ней ничего не менялось.

**Ограничение выпуска.** Windows-пакет 0.6.96 собирается и проверяется на Mac автоматически, но на настоящей Windows не запускался. До приёмки пользователем рабочей версией для Windows остаётся 0.6.95; откат — её установка. На Windows 0.6.96 требует установленный Codex CLI.

## Выпуск 0.6.95 — 05.10.2026

[Контракт](planning/codex-native-tools-macos.md). 0.6.95 убирает самодельную корзину из `Codex App Server Local Mac`: `delete_path`, `list_trash`, `restore_trash` и их код удалены, каталог macOS — 10 инструментов; удаление выполняется как в Codex, откат даёт git; исполнитель при запуске убирает прежнюю папку `trash` только пустой. Остальные десять инструментов, `codex-tools.lock.json`, Windows-runtime и VPS channel не менялись. После установки нужно перезапустить Web Pilot и обновить инструменты в ChatGPT.

Предсборочное evidence: T001 `ec2e57f`, T002 `c1c839b`. Полный `npm test`: 553 total, 549 passed, 4 skipped, 0 failed. `npm run check:codex-tools` подтвердил `rust-v0.160.0`; bundled Workflow Kit — 1.5.5 / 35 файлов / SHA-256 `8eadd98869a840f670dbfb00c33350e3054d8ec7de5298b2b0beca82d787f376`. DOCS/source commit — `7416c88c7a96b358b21b0f1744decee6fb5e3fb7`.

После предсборочной DOCS `7416c88c7a96b358b21b0f1744decee6fb5e3fb7` выполнен один paired build — его запустила проверка `paired-release` при коммите T003 (`25f7744`); затем установка `/Applications` без пересборки (T004 `cda0e96`) и публикация [GitHub Release v0.6.95](https://github.com/OleynikAleksandr/Project-Web-Pilot/releases/tag/v0.6.95) 2026-10-05T18:14:25Z (T005 `82ed208`). Tag `v0.6.95` указывает на release-manifest.sourceCommit `7416c88c…`; `sourceFiles=106`, `packagedSourceMatches=true`; GitHub содержит ровно шесть assets с совпадающими size/SHA-256, а `origin/main` после T005 совпадает с `82ed20889b36d09eae7a5f4e4658f1ec84f3c603`. Обе macOS-копии — 0.6.95 с общим ASAR `506cd28c9bf954fe732a53df0b6efba7d545d20e06bcdef68037a86546ae251d`, identity сохранена.

Шесть файлов GitHub Release v0.6.95:

- `Project-Web-Pilot-0.6.95-macOS-arm64.zip` — 186412851 bytes, SHA-256 `e183768ea9fb1c5732bae33ff1b65d4d98a5aeb80bdee922b44ecced844df545`;
- `Project-Web-Pilot-0.6.95-Windows-x64.zip` — 355538964 bytes, SHA-256 `070e98c4d7a75f7aae531e7f3ab5271eed713a26fef532a7863886f91f6b6598`;
- `Windows-Codex-Local-2026-09-10.zip` — 86242347 bytes, SHA-256 `1f041488ad97d8abf1984fd3521afb8abe15f50b8df3d3e11f1cc4248e019d98`;
- `SHA256SUMS.txt`, `INSTALL.txt`, `release-manifest.json`.

Документы связанного WorkflowKit синхронизированы собственным managed plan и отправлены в `WorkflowKit/origin/main` коммитом **`6bbec655497eaea69d5c5825c68e9bdf78a01c18`**. Пять current-state документов называют опубликованный Project Web Pilot 0.6.95 с bundled Workflow Kit 1.5.5; canonical source/runtime Kit остаётся 1.5.5 / 35 файлов / SHA-256 `8eadd988…f376`, код и версия не менялись.

Замечание по сборке: первая попытка остановилась через 1,4 с на `.harness/runtime/mac-tools/uv --version` — закреплённый бинарник `uv`, перезаписанный на месте при сборке 0.6.94, завершался системой (SIGKILL), хотя SHA-256 и подпись были верны, а его свежая копия работала. Файл заменён копией с тем же содержимым; вторая попытка собрала релиз. `scripts/prepare-mac-toolchain.mjs` в этом scope не менялся.

T006 `36d8584` записала синхронизацию WorkflowKit; T007 выполнила послерелизную сверку README и документов: 0.6.95 — текущая опубликованная и установленная версия, 0.6.94 — предыдущая.

Не проверено: живая сессия ChatGPT с каталогом из 10 инструментов после перезапуска Web Pilot и обновления инструментов, чистая установка macOS, native Windows.

## Выпуск 0.6.94 — 05.10.2026

[Контракт](planning/codex-native-tools-macos.md). Source 0.6.94 сохраняет 13-tool каталог `Codex App Server Local Mac`, но доводит командный контракт и metadata поверхности после пользовательской проверки 0.6.93: Wall time `write_stdin` относится к текущему вызову; завершение между status и write/terminate возвращает финальный вывод и exit code; default/max command output — 8000 оценочных токенов; все 13 tools и все параметры имеют descriptions; image-tool объясняют JSON + `image/png` и `content_items → image()`; pre-execution OpenAI block получает единое правило одного неизменённого retry. Первые 512 символов server instructions, `codex-tools.lock.json`, Windows-runtime и VPS channel не менялись.

Предсборочное evidence: T001 `7f0664f`, T002 `3f550b0`, T003 `4c21128`, T004 `fe7592d`; DOCS/source commit — `24b04476d1d96fa770b1d488c197b19c07a33422`. Полный `npm test`: 553 total, 549 passed, 4 skipped, 0 failed. `npm run check:codex-tools` подтвердил `rust-v0.160.0`; bundled Workflow Kit — 1.5.5 / 35 файлов / SHA-256 `8eadd98869a840f670dbfb00c33350e3054d8ec7de5298b2b0beca82d787f376`.

После предсборочной DOCS `24b04476d1d96fa770b1d488c197b19c07a33422` выполнен один paired build (T005 `cc06f99`), установка `/Applications` без пересборки (T006 `11307d5`) и публикация [GitHub Release v0.6.94](https://github.com/OleynikAleksandr/Project-Web-Pilot/releases/tag/v0.6.94) (T007 `880fdda`). Tag `v0.6.94` указывает на release-manifest.sourceCommit `24b04476…`; GitHub содержит ровно шесть assets с совпадающими size/SHA-256, а `origin/main` после T007 совпадает с `880fddaa63008675d0591f6793f93bb1ce9878eb`. Обе macOS-копии установлены как 0.6.94 с ASAR SHA-256 `4d9f5efec3b608fbd0da3b216f57100c32b8a6ce1aa8bce2bb7abb22e9f98549`; filesystem identity сохранена.

Шесть файлов GitHub Release v0.6.94:

- `Project-Web-Pilot-0.6.94-macOS-arm64.zip` — 186364653 bytes, SHA-256 `75ae7a6b4c2d45984d3a73a3610990e65e914764668cc159735538d96dfef2af`;
- `Project-Web-Pilot-0.6.94-Windows-x64.zip` — 355499338 bytes, SHA-256 `87e077df005a922a89204f9115bec3286acd2cc8af1d69d34c8b0bd7951bff7d`;
- `Windows-Codex-Local-2026-09-10.zip` — 86242347 bytes, SHA-256 `1f041488ad97d8abf1984fd3521afb8abe15f50b8df3d3e11f1cc4248e019d98`;
- `SHA256SUMS.txt` — 315 bytes, SHA-256 `b26f2c3fd107e584339c8da13acfff2d031b82ae9ac19c2dac8f09d6bc2c441b`;
- `INSTALL.txt` — 1186 bytes, SHA-256 `65ebf114604db85bce5201ec5d9da30d52eb27e05f3dd94fa0e1e9061e8e95df`;
- `release-manifest.json` — 1753 bytes, SHA-256 `fcbd8960fee26c981bd10e970f2eff00d3fda4a9a2e3fc66c1c2190d11d6d086`.

Документы связанного WorkflowKit синхронизированы собственным managed plan и отправлены в `WorkflowKit/origin/main` коммитом **`6c8ad1902df1d0932a44215f014baca66ebf51df`**. Пять current-state документов теперь называют опубликованный Project Web Pilot 0.6.94 с bundled Workflow Kit 1.5.5; canonical source/runtime Kit остаётся 1.5.5 / 35 файлов / SHA-256 `8eadd988…f376`, код/runtime не менялись. Последний отдельный GitHub Release WorkflowKit по факту остаётся **v1.5.1**.

Текущая установленная и опубликованная версия Project Web Pilot — **0.6.94**; предыдущая — **0.6.93**. Native Windows и clean VM 0.6.94 не выполнялись.

## Выпуск 0.6.93 — 05.10.2026

[Контракт](planning/codex-native-tools-macos.md). Correction release сохраняет 13-tool каталог `Codex App Server Local Mac` из 0.6.92 и исправляет stdin/timing contract command tools: non-TTY `exec_command` получает закрытый stdin; `write_stdin` различает tty/non-TTY, поддерживает одиночный Ctrl-C для обычной сессии и использует default 250 мс с clamp 250–30000 мс для write и 5000–60000 мс для empty poll. Tool/parameter descriptions заполнены; definitions lock остаётся Codex 0.160.0 / `rust-v0.160.0`. Windows-runtime и Windows catalog не менялись.

Предсборочная DOCS/source commit — `21dcd113cc6c6c76090ea7d33bf0c0aa02c6d8ea`. Root app и `/Applications/Project Web Pilot.app` установлены как 0.6.93; ASAR SHA-256 обеих Mac-копий — `44863bc4dfd22168c08410111b64a2df3606302a6d9ba66f10f4a51d764c3b8d`. [GitHub Release v0.6.93](https://github.com/OleynikAleksandr/Project-Web-Pilot/releases/tag/v0.6.93) опубликован 2026-10-05T15:15:04Z, не draft/prerelease. Tag указывает на sourceCommit; штатный `scripts/check-github-release.mjs` подтвердил ровно шесть assets, их server size/SHA-256 и согласованность release/main. Пользовательская проверка 05.10.2026 в новой сессии подтвердила исправления и каталог из 13 tools; продуктовых дефектов 0.6.93 не найдено. Наблюдавшиеся шероховатости metadata/tool-call wrapper вошли в source 0.6.94. Native Windows ещё не выполнялся.

## Выпуск 0.6.92 — 05.10.2026

[Контракт](planning/codex-native-tools-macos.md). На macOS каталог Codex App Server Local Mac сокращён 38 → 13: `exec_command`, `write_stdin`, native `apply_patch`, `view_image`; recovery/status/watchdog; три инструмента наблюдения; корзина. Definitions lock закреплён на Codex 0.160.0 / `rust-v0.160.0`; Windows-runtime не менялся. [GitHub Release v0.6.92](https://github.com/OleynikAleksandr/Project-Web-Pilot/releases/tag/v0.6.92) опубликован 2026-10-05T12:09:11Z из source commit `ca85e9dcc4673bfaa7b5a6d358a6fc5b353506d6`, не draft/prerelease и содержит шесть assets. Пользовательская проверка подтвердила каталог и штатные сценарии, но выявила открытый non-TTY stdin и неудобные timing limits `write_stdin`; исправление выпущено в 0.6.93.

Связанные проекты (02.10.2026): **Workflow Kit** — планы и recovery; **Web Pilot Sidebar** — отдельно разрабатываемый браузерный интерфейс. [Рабочие каталоги и границы интеграции](SOURCE_WORKSPACES.md).

## Выпуск 0.6.91 — 05.10.2026

0.6.91 ([контракт](planning/codex-local-mac-removal.md)): на macOS один локальный backend — Codex App Server Local Mac; Codex Local Mac удалён из приложения, репозитория и поставки. Source: T000 `cf97a0c`, T001 `5777a5a`, T002 `3e5cda4`, T003 `9c8aec8`, T004 `1636b53`, T005 `5e4c143`.

**Что меняется.** В «Настройках» macOS нет выбора backend и папки runtime — остались состояние службы и канал ChatGPT. На новом Mac мастер первого запуска сам ставит и запускает backend и принимает туннель; нужны Apple Command Line Tools и Codex (CLI или приложение ChatGPT). Ошибка подготовки служб больше не закрывает приложение: она видна в сайдбаре и повторяется при следующем обращении. Каталог инструментов прежний — 38. В пакет приложения попадают только `src`, `node_modules`, `package.json` и `LICENSE`. Релиз состоит из шести файлов: шестой — `Windows-Codex-Local-2026-09-10.zip` (runtime, который уже лежит внутри Windows-пакета; он нужен сборке, скачивать его пользователю не требуется).

**Обновление существующей установки macOS.** Установить 0.6.91, полностью выйти из Web Pilot (⌘Q) и открыть снова. При первом запуске приложение один раз останавливает процессы прежнего runtime (только с точным совпадением пути), удаляет LaunchAgent `com.oleynik.CodexLocalMac` и копию `runtime/Codex-Local-Mac` из своих данных, если она там была; если у executor нет своего туннеля, переносит туннель прежнего runtime. В ChatGPT ничего менять не нужно: адрес MCP, туннель, канал и каталог инструментов прежние.

**Что удалить вручную — после того как 0.6.91 запущена и инструменты работают:**

- `~/VSCODE/Codex Local Mac` — исходники и runtime прежнего MCP;
- `~/Library/Application Support/CodexLocalMac` — его состояние, включая ключ туннеля. Перенесённый туннель к этому моменту уже записан в `~/Library/Application Support/WebPilotCodexExecutor/private`.

Приложение и агент эти папки не удаляют.

**Откат.** Contents версии 0.6.90 — в `.harness/runtime/release-backups.noindex/mac-Applications-*`; тот же пакет — в GitHub Release v0.6.90. Настройки и `selector.json` остаются читаемыми для 0.6.90. Удалённые LaunchAgent и копия прежнего runtime при откате не возвращаются. По коду 0.6.90 (не проверялось): при запуске она обращается к папке Codex Local Mac и, если её нет, заново ставит свою копию прежнего runtime в данные приложения — поэтому удалять папки выше стоит после решения не возвращаться на 0.6.90.

**Проверено на Mac пользователя 05.10.2026** ([запись](VERIFICATION.md)): установленная 0.6.91 запущена, одноразовая очистка выполнена, службы в ожидаемом состоянии, инструменты работают в ChatGPT через VPS, интерфейс соответствует.

**Не проверено:** автозапуск после перезагрузки Mac, первый запуск на чистой macOS (с Codex и без него), native Windows, откат на 0.6.90. Коннектор Claude к серверу пользователь не создавал: канал VPS рассчитан и на него, но такое подключение не настраивалось и не проверялось.

**Сборка, установка, публикация.** Предсборочная DOCS — коммит `00eb4a4` **до** release-сборки. T006 `5ff4905`: `release-manifest.sourceCommit=00eb4a424125229cf3ce5c4bab4a52672d520a7d`, `sourceFiles=105`, `packagedSourceMatches=true`; в корне `app.asar` обеих платформ и корневого app — только `src`, `node_modules`, `package.json`, `LICENSE` (2561960 байт); в ресурсах пакетов нет `mac-runtime.zip`, `mac-control.py` и `mac-first-run.py`, executor — шесть файлов, включая `tunnel_prompt.py`. Identity обеих Mac-копий записана в `release-0.6.91-preflight.json` до сборки и сохранена.

macOS arm64: `~/Downloads/WebPilot-0.6.91/Project-Web-Pilot-0.6.91-macOS-arm64.zip`, 186361518 байт, SHA-256 `8584276cc1ca6ad119550c183cacdc4a51db9270379fb374a58817488aa20548`. Windows x64: `~/Downloads/WebPilot-0.6.91/Project-Web-Pilot-0.6.91-Windows-x64.zip`, 355496977 байт, SHA-256 `43a8b4e42d8d470760ae099c9d2360ffa024ee3e62c122504e5a6973e0bfbc29`. Оба package имеют ASAR SHA-256 `51e4b6e52a15fadf47a1758b729f117b1054b715ae4e192c4f92f7450c2e55fa`; Windows прошёл `verify:win` на Mac. ZIP Windows-runtime: `Windows-Codex-Local-2026-09-10.zip`, 86242347 байт, SHA-256 `1f041488ad97d8abf1984fd3521afb8abe15f50b8df3d3e11f1cc4248e019d98` — взят из кеша сборки, совпадает с закреплённым в `src/windows-runtime.mjs`.

`/Applications` установлена из staging штатным `installMacBundle` **без пересборки**, inode сохранён `406571340`; T007 `711d37b` прошла полный `release-installed` gate. В слоте резервной копии `/Applications` лежит Contents версии 0.6.90.

[GitHub Release v0.6.91](https://github.com/OleynikAleksandr/Project-Web-Pilot/releases/tag/v0.6.91) опубликован 2026-10-05T09:18:07Z. Tag `v0.6.91` указывает точно на `00eb4a424125229cf3ce5c4bab4a52672d520a7d`. Опубликованы ровно шесть файлов; server size/digest каждого совпадает с локальной поставкой. Release не draft/prerelease. Финальный `main` должен совпасть с managed T008 commit; это повторно проверяет `scripts/check-github-release.mjs` после push.

## Выпуск 0.6.90 — 05.10.2026

0.6.90 ([контракт](planning/computer-use-removal.md)): управление интерфейсом убрано из MCP на macOS и Windows; остаются список окон и снимки экрана и окна, каталог — 38 инструментов; правила сессии запрещают управлять интерфейсом. Source: T001 `1fb9b8c`, T002 `216a235`, T003 `2b24d35`, T004 `e301c29`.

Предсборочная DOCS — коммит `304f6f3` **до** release-сборки. Первая сборка (T005 `52968f8`) упаковала в `app.asar` неотслеживаемую папку «Claude outputs» с двумя видео пользователя (27 МБ): `--ignore` упаковщика перечисляет известные папки, а `packagedSourceMatches` сверяет только исходники. Сборка не публиковалась и не ставилась в `/Applications`; её файлы в `.harness/runtime/releases/0.6.90` и `~/Downloads/WebPilot-0.6.90` удалены. T008 `3d441a9` пересобрала релиз из того же дерева исходников, убрав папку на время сборки и вернув её без изменений: `release-manifest.sourceCommit=ee737e2efec453d78c6efe1d5beadece53ecd43c`, `sourceFiles=108`, `packagedSourceMatches=true`; в корне `app.asar` обеих платформ и корневого app — только `src`, `node_modules`, `package.json`, `LICENSE`; в ZIP нет `.mp4`. Identity обеих Mac-копий записана в `release-0.6.90-preflight.json` до первой сборки и сохранена.

macOS arm64: `~/Downloads/WebPilot-0.6.90/Project-Web-Pilot-0.6.90-macOS-arm64.zip`, 186500458 байт, SHA-256 `8881cea5ae32f5740fe251a77d530eb68a250dbb27843a4444f8415f77b71da1`. Windows x64: `~/Downloads/WebPilot-0.6.90/Project-Web-Pilot-0.6.90-Windows-x64.zip`, 355614790 байт, SHA-256 `d752870da0543d2c79306e311350088b259cae63bedbb919455527525d50b103`. Оба package имеют ASAR SHA-256 `d3752086cf1f97f9300081a88a41cae3685737c945940ca439e4465f78734639`; Windows прошёл `verify:win` на Mac, native Windows/clean VM не запускались.

`/Applications` установлена из staging штатным `installMacBundle` **без пересборки**, inode сохранён `406571340`; T006 `b644fce` прошла полный `release-installed` gate. В слоте резервной копии корневого app лежит Contents первой сборки 0.6.90 (с видео внутри `app.asar`); следующая установка его заменит.

[GitHub Release v0.6.90](https://github.com/OleynikAleksandr/Project-Web-Pilot/releases/tag/v0.6.90) опубликован 2026-10-05T07:48:47Z. Tag `v0.6.90` указывает точно на `ee737e2efec453d78c6efe1d5beadece53ecd43c`. Опубликованы ровно пять файлов; server size/digest каждого совпадает с локальной поставкой. Release не draft/prerelease. Финальный `main` должен совпасть с managed T007 commit; это повторно проверяет `scripts/check-github-release.mjs` после push.

После установки: в настройках плагина ChatGPT и подключения Claude нажать «Обновить инструменты» — клиенты хранят прежний каталог.

Ограничение Workflow Kit 1.5.5, выявленное здесь: `plan:extend` с кодовой задачей после завершённой delivery-задачи отклоняется (`DEPENDENCY_ORDER`: DOCS переоткрывается новой итерацией, а завершённая delivery-задача зависит от неё). Поэтому исправление упаковщика не вошло в 0.6.90 и перенесено первой задачей в 0.6.91.

## Выпуск 0.6.89 — 04.10.2026

0.6.89 ([контракт](planning/release-backups-kit-1.5.5.md)): установка хранит по одной резервной копии предыдущей версии на цель в `.harness/runtime/release-backups.noindex` (вне Spotlight, без накопления); bundled Workflow Kit 1.5.5 — push только после DOCS текущего плана. Source: T001 `88762d4`, kit-update `cf39482`, T002 `6d9f39b`, T003 `241580d`.

Предсборочная DOCS — коммит `d340f7a` **до** release-сборки. T004 выполнила единственный `npm run build`: `release-manifest.sourceCommit=d340f7afdad3963888ae5c484c201287635fd549`, `sourceFiles=108`, `packagedSourceMatches=true`; identity обеих Mac-копий записана в `release-0.6.89-preflight.json` до сборки.

macOS arm64: `~/Downloads/WebPilot-0.6.89/Project-Web-Pilot-0.6.89-macOS-arm64.zip`, 186503700 байт, SHA-256 `ddb6d9be8e7432b48c7ace812eee705d7231c812fcd9534f899736bc85c835a3`. Windows x64: `~/Downloads/WebPilot-0.6.89/Project-Web-Pilot-0.6.89-Windows-x64.zip`, 355617913 байт, SHA-256 `4eaddd9fd0d633951122c0c4071d0be8724041380acb988455c76318bd3dfce4`. Оба package имеют ASAR SHA-256 `002e56ec296fb4293302502f1248facdbb6c2f97c3c9732eb1336b8cf8342afa`; Windows прошёл `verify:win` на Mac, native Windows/clean VM не запускались.

`/Applications` установлена из staging штатным `installMacBundle` **без пересборки**, inode сохранён `406571340`; T005 прошла полный `release-installed` gate.

[GitHub Release v0.6.89](https://github.com/OleynikAleksandr/Project-Web-Pilot/releases/tag/v0.6.89) опубликован 2026-10-04T17:08:22Z. Tag `v0.6.89` указывает точно на `d340f7afdad3963888ae5c484c201287635fd549`. Опубликованы ровно пять файлов; server size/digest каждого совпадает с локальной поставкой. Release не draft/prerelease. Финальный `main` должен совпасть с managed T006 commit; это повторно проверяет `scripts/check-github-release.mjs` после push.

## Выпуск 0.6.88 — 04.10.2026

0.6.88 ([контракт](planning/mcp-start-message.md)): в режиме Codex App Server Web Pilot сам начинает новую сессию коротким стартовым сообщением — проект, папка и порядок чтения `workflow_context_recover` по одной части с ключом `after`; агент получает контекст через MCP и кратко подтверждает. Пакет в чат не вставляется; привязанный, ручной и прежний чат стартового сообщения не получают. Bundled Workflow Kit 1.5.4. Source: T001 `330108f` (план), T002 `96367b8` (код и версия).

Предсборочная DOCS — коммит `5e2b214` **до** release-сборки. T003 выполнила единственный `npm run build`: `release-manifest.sourceCommit=5e2b21419f6d5d3126ae0d28d9b85dcccbee2fdf`, `sourceFiles=108`, `packagedSourceMatches=true`; identity обеих Mac-копий записана в `release-0.6.88-preflight.json` до сборки.

macOS arm64: `~/Downloads/WebPilot-0.6.88/Project-Web-Pilot-0.6.88-macOS-arm64.zip`, 186481309 байт, SHA-256 `14182747fd13027e3b44dd5ed6adaaf922f970dab819bcbb5dd88f73fae1e060`. Windows x64: `~/Downloads/WebPilot-0.6.88/Project-Web-Pilot-0.6.88-Windows-x64.zip`, 355595639 байт, SHA-256 `9cac9974dc260495f6c24f6a05674e3a529c174a3f8ee75d4eb1ad69b847356e`. Оба package имеют ASAR SHA-256 `07705d3b1e723f9cf3a4a1716eae51f898a805b40e4f2cfebc81ae6af1036d41`; Windows прошёл `verify:win` на Mac, native Windows/clean VM не запускались.

`/Applications` установлена из staging штатным `installMacBundle` **без пересборки**, inode сохранён `406571340`; T004 прошла полный `release-installed` gate.

[GitHub Release v0.6.88](https://github.com/OleynikAleksandr/Project-Web-Pilot/releases/tag/v0.6.88) опубликован 2026-10-04T16:08:41Z. Tag `v0.6.88` указывает точно на `5e2b21419f6d5d3126ae0d28d9b85dcccbee2fdf`. Опубликованы ровно пять файлов; server size/digest каждого совпадает с локальной поставкой. Release не draft/prerelease. Финальный `main` должен совпасть с managed T005 commit; это повторно проверяет `scripts/check-github-release.mjs` после push.

## Выпуск 0.6.87 — 04.10.2026

0.6.87 ([контракт](planning/mcp-sequential-parts-kit-1.5.4.md)): агент читает контекст через MCP строго по одной части — следующая часть выдаётся только по ключу `after` из конца предыдущей, части до 28 000 байт, повторного чтения нет; bundled Workflow Kit 1.5.4 не включает в recovery формы плана и карты документов. Source: T001 `e9c5bbe`, kit-update `eda3d51`, T002 `a857a1b`, T003 `ab6e7b7`.

Предсборочная DOCS — коммит `394f907` **до** release-сборки. T004 выполнила единственный `npm run build`: `release-manifest.sourceCommit=394f907642d2ffe2abb865ea0b404c12ed43fbd9`, `sourceFiles=108`, `packagedSourceMatches=true`; identity обеих Mac-копий записана в `release-0.6.87-preflight.json` до сборки.

macOS arm64: `~/Downloads/WebPilot-0.6.87/Project-Web-Pilot-0.6.87-macOS-arm64.zip`, 186480315 байт, SHA-256 `69ad05c7ead98e1cb7061ac1c0def11f19286d281835461c3e1596e62f574cde`. Windows x64: `~/Downloads/WebPilot-0.6.87/Project-Web-Pilot-0.6.87-Windows-x64.zip`, 355594448 байт, SHA-256 `6325a805a2ad2a9176a146e48636f01961b345615893cc324e33d966fceeb088`. Оба package имеют ASAR SHA-256 `07a1b7ef6dc1ef6e6d673c9778cd94acb1e2c9beba891095b59aa146a2b85f38`; Windows прошёл `verify:win` на Mac, native Windows/clean VM не запускались.

`/Applications` установлена из staging штатным `installMacBundle` **без пересборки**, inode сохранён `406571340`; T005 прошла полный `release-installed` gate.

[GitHub Release v0.6.87](https://github.com/OleynikAleksandr/Project-Web-Pilot/releases/tag/v0.6.87) опубликован 2026-10-04T15:32:40Z. Tag `v0.6.87` указывает точно на `394f907642d2ffe2abb865ea0b404c12ed43fbd9`. Опубликованы ровно пять файлов; server size/digest каждого совпадает с локальной поставкой. Release не draft/prerelease. Финальный `main` должен совпасть с managed T006 commit; это повторно проверяет `scripts/check-github-release.mjs` после push.

## Выпуск 0.6.86 — 04.10.2026

0.6.86 ([контракт](planning/mcp-context-delivery.md)): агент сам получает контекст проекта через MCP — `workflow_context_recover` выдаёт правила сессии и полный пакет Workflow Kit текстовыми частями до 20 000 байт; в режиме Codex App Server Web Pilot больше не вставляет recovery в ChatGPT, новая сессия ждёт первого сообщения пользователя и привязывается по нему. Codex Local Mac и Windows сохраняют доставку первым сообщением. Source: T001 `18970e8`, T002 `05fd934`, T003 `734d632`.

Предсборочная DOCS — коммит `ea4f835` **до** release-сборки. T004 выполнила единственный `npm run build`: `release-manifest.sourceCommit=ea4f835f7a4d857f3c0125541fa952f796e50c56`, `sourceFiles=108`, `packagedSourceMatches=true`; identity обеих Mac-копий записана в `release-0.6.86-preflight.json` до сборки.

macOS arm64: `~/Downloads/WebPilot-0.6.86/Project-Web-Pilot-0.6.86-macOS-arm64.zip`, 186444882 байт, SHA-256 `9be94072f3b98e43214594e155cbc03c53f806cbfd614c1a9b6714fb1a0e0f07`. Windows x64: `~/Downloads/WebPilot-0.6.86/Project-Web-Pilot-0.6.86-Windows-x64.zip`, 355558960 байт, SHA-256 `f1674fd3285adf92815d344fd43954e6947b6d779d513a3498265ee1bdcf23dc`. Оба package имеют ASAR SHA-256 `a2d85bc7e6a85912372a978704b59f828be5d31c8b357b023b65e6f8f28c4eeb`; Windows прошёл `verify:win` на Mac, native Windows/clean VM не запускались.

`/Applications` установлена из staging штатным `installMacBundle` **без пересборки**, inode сохранён `406571340`; T005 прошла полный `release-installed` gate.

[GitHub Release v0.6.86](https://github.com/OleynikAleksandr/Project-Web-Pilot/releases/tag/v0.6.86) опубликован 2026-10-04T14:49:55Z. Tag `v0.6.86` указывает точно на `ea4f835f7a4d857f3c0125541fa952f796e50c56`. Опубликованы ровно пять файлов; server size/digest каждого совпадает с локальной поставкой. Release не draft/prerelease. Финальный `main` должен совпасть с managed T006 commit; это повторно проверяет `scripts/check-github-release.mjs` после push.

## Выпуск 0.6.85 — 04.10.2026

0.6.85 ([контракт](planning/computer-use-keys-batch.md)): Computer Use в MCP принимает символы клавиш (`*` → `asterisk`) и новый инструмент `computer_actions` — до 50 нажатий, сочетаний, вставок текста, кликов и прокруток одним вызовом вместо отдельного хода модели на каждое действие; подписи канала VPS без ссылок на vps-server и подсказка, какой плагин включить в ChatGPT; после архива или удаления выбранного проекта закрытие Настроек открывает другой активный проект, а не первый запуск. Сборка, установка и GitHub-публикация — задачи T004–T006 после этой DOCS; до их завершения 0.6.84 остаётся последним опубликованным релизом. Основание — проверка Computer Use через VPS и встроенными средствами Work (`equal`/`Escape`/`type_text` ведут себя так же встроенно и не исправляются) и сообщение пользователя о первом запуске после удаления архивного проекта. Source: T001 `de07563` (имена клавиш, `computer_actions`, тест на настоящем `server.py` с исполнением созданного сценария), T002 `979887f` (подписи и подсказка канала), T007 `8623b60` (`landing()` в хранилище проектов, `closeSettings`/`cancelSetup`), T003 `51f2143` (версия).

Предсборочная DOCS — коммит `9a0b699` **до** release-сборки. T004 выполнила единственный `npm run build`: `release-manifest.sourceCommit=9a0b6994fce07bcf466314cfe9bb0267420d0242`, `sourceFiles=107`, `packagedSourceMatches=true`; identity обеих Mac-копий записана в `release-0.6.85-preflight.json` до сборки.

macOS arm64: `~/Downloads/WebPilot-0.6.85/Project-Web-Pilot-0.6.85-macOS-arm64.zip`, 186439652 байт, SHA-256 `9f32618b10ab315637068cc6f0eae19c6f781a20a0c45da8f465c5fc63d19297`. Windows x64: `~/Downloads/WebPilot-0.6.85/Project-Web-Pilot-0.6.85-Windows-x64.zip`, 355554835 байт, SHA-256 `132742acd2fc813176d561a7e403f89cb022a95b00e44f2ccdd6b02bb1220a21`. Оба package имеют ASAR SHA-256 `219eb85c688ee00048a2620253cc6108f503039bbe6d109bba4137b7be661320`; Windows прошёл `verify:win` на Mac, native Windows/clean VM не запускались.

`/Applications` установлена из staging штатным `installMacBundle` **без пересборки**, inode сохранён `406571340`; T005 прошла полный `release-installed` gate.

[GitHub Release v0.6.85](https://github.com/OleynikAleksandr/Project-Web-Pilot/releases/tag/v0.6.85) опубликован 2026-10-04T12:29:00Z. Tag `v0.6.85` указывает точно на `9a0b6994fce07bcf466314cfe9bb0267420d0242`. Опубликованы ровно пять файлов; server size/digest каждого совпадает с локальной поставкой. Release не draft/prerelease. Финальный `main` должен совпасть с managed T006 commit; это повторно проверяет `scripts/check-github-release.mjs` после push.

## Выпуск 0.6.84 — 04.10.2026

Причина — проверка пользователя через VPS после 0.6.83: `run_command_batch` → `McpServerError: Session terminated`; через сервер воспроизведено `POST /mcp` с чужим `Mcp-Session-Id` → `404 Session not found`. Исправление по [контракту](planning/mcp-stateless-sessions.md): T001 `d565c1a` — `stateless_http=True`, тест на настоящем `server.py` с устаревшим идентификатором, полный `npm test`; T002 `fd0719e` — версия. Scope 0.6.83 закрыт в архив: в план с завершённым delivery-хвостом Workflow Kit 1.5.3 не даёт добавить задачи (`DEPENDENCY_ORDER`, записано в политике delivery-ordering WorkflowKit).

Предсборочная DOCS — коммит `ee2cf20` **до** release-сборки. T003 выполнила единственный `npm run build`: `release-manifest.sourceCommit=ee2cf2031a396a7cf33c317df47efefd768770ef`, `sourceFiles=107`, `packagedSourceMatches=true`; identity обеих Mac-копий записана в `release-0.6.84-preflight.json` до сборки.

macOS arm64: `~/Downloads/WebPilot-0.6.84/Project-Web-Pilot-0.6.84-macOS-arm64.zip`, 186437905 байт, SHA-256 `868b524094e95aa7747bd49c4ff3a35fe5351299ecad13c41da6b45bad595a5e`. Windows x64: `~/Downloads/WebPilot-0.6.84/Project-Web-Pilot-0.6.84-Windows-x64.zip`, 355552588 байт, SHA-256 `22e8cfeb898e6b1fd52af5eeaf34308bd959a7b89045d9b39bfd2684fac60e7c`. Оба package имеют ASAR SHA-256 `5232684f7d488e2f37e7c33f02c49fa9960972f9c1504b2f5bd393703b0d4618`; Windows прошёл `verify:win` на Mac, native Windows/clean VM не запускались.

`/Applications` установлена из staging штатным `installMacBundle` **без пересборки**, inode сохранён `406571340`; T004 прошла полный `release-installed` gate.

[GitHub Release v0.6.84](https://github.com/OleynikAleksandr/Project-Web-Pilot/releases/tag/v0.6.84) опубликован 2026-10-04T10:22:08Z. Tag `v0.6.84` указывает точно на `ee2cf2031a396a7cf33c317df47efefd768770ef`. Опубликованы ровно пять файлов; server size/digest каждого совпадает с локальной поставкой. Release не draft/prerelease. Финальный `main` должен совпасть с managed T005 commit; это повторно проверяет `scripts/check-github-release.mjs` после push.

## Выпуск 0.6.83 — 04.10.2026

Причина релиза — переключатель канала ChatGPT (Secure MCP Tunnel / VPS) по [контракту](planning/chatgpt-channel-vps.md). Source: T001 `40585ca` (executor: канал в selector), T002 `07926e2` (туннель VPS и переключение в main), T003 `04d47e3` (раздел в Настройках, полный `npm test`), T004 `7140742` (версия). Bundled Workflow Kit 1.5.3 не менялся.

Предсборочная DOCS зафиксирована коммитом `366791a` **до** первой release-сборки. T005 (`fa32f6e`) выполнила единственный `npm run build`: `release-manifest.sourceCommit=366791a752cc4a67ada3f9fbf92326e6b9e78f12`, `sourceFiles=107`, `packagedSourceMatches=true`. Identity обеих Mac-копий записана в `release-0.6.83-preflight.json` до сборки.

macOS arm64: `~/Downloads/WebPilot-0.6.83/Project-Web-Pilot-0.6.83-macOS-arm64.zip`, 186435757 байт, SHA-256 `4125d4b2dfb8c2605b47614f73842c02a2b1d61bb4dbc619f9272695f69bedb0`. Windows x64: `~/Downloads/WebPilot-0.6.83/Project-Web-Pilot-0.6.83-Windows-x64.zip`, 355550282 байт, SHA-256 `b7e81ec6f97da618145c98caf2a27c705857f8c72fc92c2464ed54685f0b5559`. Оба package имеют ASAR SHA-256 `871dcd8b471615add399d2628cb22ff99b8a54cd29e1f6b4b6e2cd9568ca02f6`; Windows прошёл `verify:win` на Mac, native Windows/clean VM не запускались.

Root app и `/Applications/Project Web Pilot.app` обновлены до 0.6.83; `/Applications` установлена из staging штатным `installMacBundle` **без пересборки**, inode сохранён `406571340`. Managed T006 (`1dfe2dd`) прошёл полный `release-installed` gate. После перезапуска 0.6.83 канал ChatGPT — Secure MCP Tunnel (по умолчанию), туннель VPS не перезагружался (plist совпал), `vps-server/setup/check-mcp.sh` — ok.

[GitHub Release v0.6.83](https://github.com/OleynikAleksandr/Project-Web-Pilot/releases/tag/v0.6.83) опубликован 2026-10-04T09:54:15Z. Tag `v0.6.83` указывает точно на `366791a752cc4a67ada3f9fbf92326e6b9e78f12`. Опубликованы ровно пять файлов: оба ZIP, `SHA256SUMS.txt`, `INSTALL.txt`, `release-manifest.json`; server size/digest каждого совпадает с локальной поставкой. Release не draft/prerelease. Финальный `main` должен совпасть с managed T007 commit; это повторно проверяет `scripts/check-github-release.mjs` после push.

## Выпуск 0.6.82 — 04.10.2026

Причина релиза — поручение пользователя навести порядок с именами: bundled Workflow Kit **1.5.3** добавляет команду `project:rename` (переименование проекта с обновлением путей Git-хуков в manifest). Dev Kit репозитория обновлён до 1.5.3 штатным installer (`7f6d853`), поэтому development и bundled Kit совпадают.

Предсборочная DOCS зафиксирована коммитом `85ffd33` **до** первой release-сборки. T002 (`0490365`) выполнила единственный `npm run build`: `release-manifest.sourceCommit=85ffd3355b7fa9d945c1a703bc1027ce6c3ca2a7`, `sourceFiles=106`, `packagedSourceMatches=true`, bundled Workflow Kit **1.5.3 / 35 файлов / SHA-256 `d59ae7b6b074e953fdd6c5d78d1f644902f0e7b9af5ad3c78d67d42f1f6a1c0f`**.

macOS arm64: `~/Downloads/WebPilot-0.6.82/Project-Web-Pilot-0.6.82-macOS-arm64.zip`, 186428235 байт, SHA-256 `dc3b1115bc6808f92a9119507efcd15ea97c0622de76ff72c51b07460cabf9a5`. Windows x64: `~/Downloads/WebPilot-0.6.82/Project-Web-Pilot-0.6.82-Windows-x64.zip`, 355543096 байт, SHA-256 `846c555169c69023d3879df677be7a6fa579d9b308e1f122158ad106ea941e76`. Оба package имеют ASAR SHA-256 `37766b5fc586d0934fe9f4c8da08c3ebd1db7359b600b26f6b34af7fe79c6770`; Windows прошёл `verify:win` на Mac, native Windows/clean VM не запускались.

Root app и `/Applications/Project Web Pilot.app` обновлены до 0.6.82. `/Applications` установлена из уже собранного staging штатным `installMacBundle` **без пересборки**; inode сохранён `406571340`. Managed T003 (`8e701ae`) прошёл полный `release-installed` gate.

[GitHub Release v0.6.82](https://github.com/OleynikAleksandr/Project-Web-Pilot/releases/tag/v0.6.82) опубликован 2026-10-04T09:16:44Z. Tag `v0.6.82` указывает точно на `85ffd3355b7fa9d945c1a703bc1027ce6c3ca2a7`. Опубликованы ровно пять файлов: оба ZIP, `SHA256SUMS.txt`, `INSTALL.txt`, `release-manifest.json`; server size/digest каждого совпадает с локальной поставкой. Release не draft/prerelease. Финальный `main` должен совпасть с managed T004 commit; это повторно проверяет `scripts/check-github-release.mjs` после push.

## Выпуск 0.6.81 — 03.10.2026

Предсборочная DOCS была зафиксирована коммитом `db59be8` **до** первой release-сборки. T002 (`36c4ff3`) выполнила единственный `npm run build`: `release-manifest.sourceCommit=db59be83f0d3fa4136c109a8252181422acfe94c`, `sourceFiles=106`, `packagedSourceMatches=true`, bundled Workflow Kit **1.5.2 / 35 файлов / SHA-256 `646fec106c498e004d8688a3bc40012bea1654178ce66a61b650211ab28055df`**.

macOS arm64: `~/Downloads/WebPilot-0.6.81/Project-Web-Pilot-0.6.81-macOS-arm64.zip`, 186376299 байт, SHA-256 `76084ae92195e4d86c350075f87aac76031a97ee9f03e024ece5041dc85c0f78`. Windows x64: `~/Downloads/WebPilot-0.6.81/Project-Web-Pilot-0.6.81-Windows-x64.zip`, 355490949 байт, SHA-256 `24c1ddb9071e5b4efc58ad63a3d1a44f0a129d91a98b6f18f84a7d63111e5634`. Оба package имеют ASAR SHA-256 `4fc92297dafdf6afa2e97b0a504d774753a57f7c195a6a931477f9ea4beb8195`; Windows прошёл `verify:win` на Mac, native Windows/clean VM не запускались.

Root app и `/Applications/Project Web Pilot.app` обновлены до 0.6.81. `/Applications` установлена из уже собранного staging штатным `installMacBundle` **без пересборки**; inode сохранён `406571340`, root inode — `406600483`. Managed T003 (`795f368`) прошёл полный `release-installed` gate.

[GitHub Release v0.6.81](https://github.com/OleynikAleksandr/Project-Web-Pilot/releases/tag/v0.6.81) опубликован 2026-10-03T18:07:01Z. Tag `v0.6.81` указывает точно на `db59be83f0d3fa4136c109a8252181422acfe94c`. Опубликованы ровно пять файлов: оба ZIP, `SHA256SUMS.txt`, `INSTALL.txt`, `release-manifest.json`; server size/digest каждого совпадает с локальной поставкой. Release не draft/prerelease. Финальный `main` должен совпасть с managed T004 commit; это повторно проверяет `scripts/check-github-release.mjs` после push.

## Выпуск 0.6.80 — 03.10.2026

B для T005 сохраняет функциональный код и зависимости 0.6.79; изменена версия package/Info.plist/ASAR. Подпись Apple Development организации UkrHD и designated requirement совпадают с A при новом CDHash. Штатный `npm run build:mac` создал ZIP и обновил root app; Applications обновлён тем же installMacBundle. Внешние папки app сохранили inode 406600483 и 406571340 и прежний volume UUID; старые Contents доступны в backup.

Поставка: `~/Downloads/WebPilot-0.6.80/Project-Web-Pilot-0.6.80-macOS-arm64.zip`, 186322226 байт, SHA-256 `bca650c9de63d02d19edc3c5fa008a09d76ad60c1809a60c95ce235db800f3c3`. ASAR двух установок: `d343a61ef69d169fd333ebf945b84fa85c3103212f5c412e8c987998df0b4baf`. Настоящие подписи staging, обеих копий и извлечённого доставленного ZIP проверены.

Windows x64: `~/Downloads/WebPilot-0.6.80/Project-Web-Pilot-0.6.80-Windows-x64.zip`, 355438598 байт, SHA-256 `8d0a1728713988315697626c5969ba3af387c6172fad3251ce3a40906b9d44b1`. `verify:win` подтвердил версию 0.6.80, EXE, bundled Node 24.21.0, Windows runtime и Workflow Kit 1.5.1.

0.6.80 запущена через прежний root app. Live MCP capture после обновления и после настоящей перезагрузки Mac прошёл с сохранённым разрешением; подписи/ZIP проверены в обеих загрузках, volume UUID и inode сохранены. 03.10.2026 пользователь подтвердил работоспособность и отсутствие новых системных запросов; критерии приёмки macOS T005 подтверждены.

[GitHub Release v0.6.80](https://github.com/OleynikAleksandr/Project-Web-Pilot/releases/tag/v0.6.80) опубликован 2026-10-03T15:21:11Z. Тег указывает на проверенный build-коммит `8a6d0dd0f2d8dd99aace8b86c0e8359bf4e82308`. macOS не пересобирался перед публикацией: загружен точный ранее проверенный ZIP. Windows x64 собран штатным `npm run build:win`, прошёл `verify:win` на Mac и упакован в ZIP. На GitHub опубликованы оба ZIP, `SHA256SUMS.txt`, `INSTALL.txt` и `release-manifest.json`; серверные SHA-256 совпали с локальными файлами. Native Windows и clean VM не проверены.

Evidence: `.harness/runtime/releases/0.6.80/mac-release.json`, `t005-applications-install.json`, `t005-baseline.json`, `t005-update-comparison.json`, `t005-before-reboot.json`, `t005-after-reboot.json`, `t005-user-confirmation.json`, `t005-progress.json`, `.harness/runtime/github-0.6.80-publication.json`. Проверки после перезагрузки и назначенные installed gates managed commit T005 (`8a6d0dd`) прошли на той же B; публикация сверена отдельно по GitHub API.

## Локальная подписанная macOS 0.6.79 — 03.10.2026

По прямому поручению пользователя используется существующий Apple Development сертификат организации UkrHD. Подписана окончательная macOS arm64-сборка с bundle ID `com.oleynik.ProjectWebPilot` и TeamID `LXY7H5ZUE9`. Designated requirement содержит Apple anchor и выбранную identity, без привязки к CDHash отдельной сборки. Ключи не экспортировались.

Root app и `/Applications/Project Web Pilot.app` обновлены штатным installer; device/inode `16777227/406600483` и `16777227/406571340` сохранены. Старые Contents доступны в release-backups. ASAR SHA-256 обеих копий — `b60e422a94d938a94a4d082e20af1b1fb6e5b64c72ccf409df1fa73c53c0c8cb`. Комплектные Node 24.21.0 и uv 0.9.13 не переподписывались; исходные контрольные суммы сохранены.

Поставка: `~/Downloads/WebPilot-0.6.79/Project-Web-Pilot-0.6.79-macOS-arm64.zip`, 186321811 байт, SHA-256 `4f507f6206b1101bbcb00050b82dc38a36793953e92fae3f60a6b2a027c8915b`. Это локальная macOS-поставка текущего исправления: Windows 0.6.79 и GitHub-публикация не выполнялись; публичная парная версия остаётся 0.6.78.

Проверки T003: unit, Electron smoke и `mac-signature`. Последняя проверяет настоящие подписи staging, двух установленных копий и приложения из выданного ZIP, совпадение identity/TeamID/requirement/CDHash и сохранённые device/inode. Отрицательная проверка на временном bundle отклонила чужую identity и повреждённый запечатанный ресурс до изменения временной установки. Реальные установленные приложения для этого теста не повреждались.

При установке T003 пользовательский процесс ещё не перезапускался. Последующая T004 подтвердила первичную миграцию Screen Recording, живой MCP-захват и сохранение доступа после полного перезапуска app/executor. Обновление и перезагрузка относятся к T005; подпись сама по себе не является подтверждением живого захвата.

Evidence: `.harness/runtime/releases/0.6.79/mac-release.json`, `t003-applications-install.json`, `t003-vendor-hashes.json`, `t003-signature-negative.json`, `mac-signature-check.json` и управляемый результат commit T003.

## Выпуск 0.6.78 — 03.10.2026

Исправлен AutoPlan для длинных Work-разговоров: количество DOM-узлов больше не служит ID ответа, сохраняются наблюдаемые циклы генерации. При загрузке истории нет преждевременной вставки; отменённый собственный Paste очищается с сохранением пользовательских правок. [Разбор и ограничения](planning/auto-plan-session-incident-20261003.md).

Поставка: `~/Downloads/WebPilot-0.6.78/`. Штатный `npm run build` создал macOS arm64 / Windows x64 ZIP и metadata; 106 source/resource файлов совпали с упаковками. Manifest sourceCommit — `f32e4e382d35e6ea947537f3d930f5c1dfc7bc3c` (HEAD перед коммитом реализации T004). Electron 44.5.1, Node 24.21.0, WorkflowKit 1.5.1.

| Архив | Размер, байт | SHA-256 |
| --- | ---: | --- |
| Project-Web-Pilot-0.6.78-macOS-arm64.zip | 185532186 | `0bfd43caf03274390889b83319fb48c531e266140ce3df371c96a31a49e38f15` |
| Project-Web-Pilot-0.6.78-Windows-x64.zip | 355434034 | `f98e5eef4a9347b45d2ecb62b8cb8c6f3665566484967234be5a335f762271f7` |

Root app и `/Applications/Project Web Pilot.app` обновлены штатным installMacBundle. Inode 406600483 и 406571340 сохранены; старые Contents сохранены в backup. ASAR SHA-256 обеих копий — `eb4badce53d64455448e2e7d310cd4ca4967de2ddac198a0e57ac7406c981122`. Пользовательский процесс не перезапускался. Для применения нужен полный выход и повторный запуск.

T004 завершена коммитом `88f8866`; unit (496 PASS, 3 SKIP), smoke и release-installed прошли: исходники/версии/хеши/identity, runtime обеих упаковок и установленный observer/Composer/AutoPlan с bounded DOM и настоящим ProseMirror. Результат хранит Workflow Kit и `.harness/runtime/t004-commit.log`; сборка внутри commit не повторяется. GitHub Release 0.6.78 опубликован по последующему поручению пользователя; живая приёмка и native Windows не заявлены.

[GitHub Release v0.6.78](https://github.com/OleynikAleksandr/Project-Web-Pilot/releases/tag/v0.6.78) опубликован 2026-10-03T08:08:36Z. Тег указывает на проверенный коммит `88f8866d2722edaff019137455a79d7be5698b08`. Готовые пакеты не пересобирались. До публикации сверены размеры и серверные SHA-256 всех пяти файлов: macOS arm64 ZIP, Windows x64 ZIP, `SHA256SUMS.txt`, `INSTALL.txt`, `release-manifest.json`. GitHub подтвердил latest public release; WorkflowKit main синхронизирован, актуальный v1.5.1 и его runtime не менялись. Evidence: `.harness/runtime/github-0.6.78-publication.json` и `github-0.6.78-workflowkit.json`. Живая приёмка, native Windows и чистый первый запуск отдельно не подтверждены.

Финальная документальная сверка: 44 документа/256 локальных ссылок Web Pilot и 11/19 WorkflowKit без ошибок. README Kit описывает опубликованную 0.6.78; main Kit обновлён до `b0aeb72761f8cd6288235c15167ed955df68603a`. Теги и готовые assets сохранены. Подробности — [VERIFICATION](VERIFICATION.md).

## Выпуск 0.6.77 — 02.10.2026

Клиентский AutoPlan: переключатель не отправляет стартовую инструкцию, обычный ответ не требует footer, подходящая idle-пауза незавершённого ACTIVE-плана получает ровно одно точное «Продолжай». Постоянный выбор, durable checkpoint, ручной ввод и восстановление связи управляются клиентом. Electron **44.5.1**, встроенный и комплектный Node **24.21.0**, Workflow Kit **1.5.1**.

Штатный `npm run build` завершился успешно. Поставка — `~/Downloads/WebPilot-0.6.77/`: macOS arm64 / Windows x64 ZIP, SHA256SUMS.txt, INSTALL.txt и release-manifest.json. Все **106** source/resource файлов совпали с упаковками; manifest sourceCommit — `4ca7ac90be225d515ed92b6815be9a3739b446a3` (HEAD перед version/build commit T005). Версия и release-изменения входят в T005.

| Архив | Размер, байт | SHA-256 |
| --- | ---: | --- |
| Project-Web-Pilot-0.6.77-macOS-arm64.zip | 185522743 | `cf9f7468fc0289cd73dd170517bf69cc4bab69daf6ca9de4502bba09783c0072` |
| Project-Web-Pilot-0.6.77-Windows-x64.zip | 355424594 | `5e7ea853b69068142908ea4ccf096b059143ea00f1515b91e1c3f4b3ca230ef6` |

Корневой app и `/Applications/Project Web Pilot.app` обновлены до **0.6.77** штатным installMacBundle с сохранением device/inode `16777234/406600483` и `16777234/406571340`. Оба app соответствуют staging; общий ASAR SHA-256 — `8e01a33bd51287b31d12edb1e1d49d27e9f362316823310bc73e6603fd37afdc`. Предыдущие Contents сохранены в release-backups. Работающий пользовательский процесс не перезапускался; новую версию запускают после полного выхода.

Через config:apply `auto-plan-package` настроена на проверку уже готовой 0.6.77 командой `node scripts/check-installed-release.mjs`: source/metadata/hash/version, Finder identity, комплектные инструменты, runtime Kit из обеих упаковок и установленный observer/Composer/клиентский AutoPlan с обычными ответами без footer. T005 завершена коммитом `0b8335cb22193f3b986a1e9ad93bc65830556116`: node24, unit, smoke и package/installed gate прошли; сборка в commit не повторялась. Evidence — `.harness/runtime/t005-build.log`, `release-0.6.77-preflight.json`, `t005-installation.json` и release manifest.

02.10.2026 пользователь подтвердил общую приёмку 0.6.77: всё работает согласно обсуждённому контракту; scope рефакторинга закрыт коммитом `46097fb`. Отдельные native Windows и чистый первый запуск в сообщении о приёмке не перечислены.

[GitHub Release v0.6.77](https://github.com/OleynikAleksandr/Project-Web-Pilot/releases/tag/v0.6.77) опубликован из этой готовой поставки без пересборки. Тег указывает на build commit T005 `0b8335cb22193f3b986a1e9ad93bc65830556116`; manifest sourceCommit сохраняет HEAD перед build commit. Перед раскрытием draft проверены ровно пять assets: оба ZIP, `SHA256SUMS.txt`, `INSTALL.txt` и `release-manifest.json`. Серверные размеры и `digest=sha256:...` совпали с локальными файлами. На момент публикации main синхронизирован с `25619d5fb4eb4fba76255dc632580718b2f1f1df`; документы T001 отправлены коммитом `ebf6e20a000b34d41d568b04aa94f07295f0db32`. Evidence — `.harness/runtime/github-0.6.77-publication.json`.

### WorkflowKit — актуализация 03.10.2026

[WorkflowKit 1.5.1](https://github.com/OleynikAleksandr/WorkflowKit/releases/tag/v1.5.1) остаётся актуальным релизом пакета: его код, версия и 35-файловый runtime не менялись. README и product/module/architecture/index документы обновлены для интеграции с Web Pilot 0.6.77 коммитом T006 `298219e5222274f7b088f7d78924ec950a9d976d`. Рабочая среда использует Node **24.21.0**; минимальное требование самого пакета остаётся **Node 22+** (`engines.node: >=22`).

T006 прошла назначенную package-проверку. Финальная DOCS завершена коммитом `6ced59485e7dcbaf94d33a5c887b4631e1eeefd5`: 11 документов, 19 локальных ссылок, 0 ошибок. `main` WorkflowKit синхронизирован с этим коммитом; опубликованный тег `v1.5.1` сохранён на `dfc38c1b4a2cee1c13c68f9b54f064d3496dab10`. Отдельные бинарные release assets для Kit не предусмотрены; GitHub предоставляет исходные архивы тега. Повторная сборка Web Pilot и новая версия Kit ради документальной актуализации не требовались. Evidence — `.harness/runtime/github-T002-workflowkit-verification.json` и отчёты canonical workspace WorkflowKit.

## Выпуск 0.6.76 — 02.10.2026

Исправления AutoPlan: постоянный выбор автовыполнения, восстановление после перезапуска, ожидание busy без ложной остановки, сохранение черновика, понятный счётчик «Продолжай» и причины пауз. Electron **44.5.1**, Node **24.21.0**, Workflow Kit **1.5.1**.

Парный `npm run build` выполнил сборку macOS arm64 и Windows x64. Поставка — `~/Downloads/WebPilot-0.6.76/`, включая оба ZIP, `SHA256SUMS.txt`, `INSTALL.txt` и `release-manifest.json`. Все 106 source/resource файлов совпали с упаковками. Manifest sourceCommit — `2a716271cba9c9af1ac62cd84df142beb144246c`; изменение версии фиксируется T007.

| Архив | Размер, байт | SHA-256 |
| --- | ---: | --- |
| Project-Web-Pilot-0.6.76-macOS-arm64.zip | 185522652 | `086936d44b3b392e126a06df244ef9c762a7db1c4c3a6038149b1c405412cc81` |
| Project-Web-Pilot-0.6.76-Windows-x64.zip | 355424499 | `1b69c8f118d37d68b16f021f53ee0e4fdc46bbb65cece815a47a43ebd396c363` |

Корневой app и `/Applications/Project Web Pilot.app` обновлены до 0.6.76 штатной установкой с сохранением device/inode: `16777234/406600483` и `16777234/406571340`. Оба соответствуют staging; ASAR SHA-256 — `9f32216ae38994f6b166d918a45324bcda1495babb79b80a015f5f58e936a46f`. Старые Contents сохранены в release-backups. Работающий пользовательский процесс не перезапускался; для запуска новой версии нужен полный выход и повторное открытие приложения.

T007 требует node24, unit, smoke и auto-plan-release. Последняя проверка выполняет `scripts/check-installed-release.mjs` на уже собранной поставке: источники, версии, ZIP, identity, комплектные инструменты и установленный observer/Composer/AutoPlan. Сборка не повторяется внутри коммита. Исходные отчёты: `.harness/runtime/release-0.6.76-preflight.json`, `auto-plan-t007-installation.json` и release manifest. Итоги проверок фиксирует Workflow Kit; после T007 выполнена документальная подготовка T009, публикация Project Web Pilot — T010, публикации WorkflowKit/Web Pilot Sidebar — T011/T012, затем финальная DOCS.

[GitHub Release v0.6.76](https://github.com/OleynikAleksandr/Project-Web-Pilot/releases/tag/v0.6.76) опубликован из готовой поставки без пересборки. Тег `v0.6.76` указывает на release/build commit T007 `0a73a39ec27bf844607619bd1bf29c3884a92e81`; remote `main` после публикации совпал с документальным HEAD T009 `bb9e262267b8e66642e5b3aeb6bdeffbe1fe20b7`. На GitHub ровно пять требуемых assets: оба ZIP, `SHA256SUMS.txt`, `INSTALL.txt` и `release-manifest.json`; их серверные размеры и SHA-256 digest совпали с локальными файлами. Evidence — `.harness/runtime/t010-publication.json`.

Native Windows, чистый первый запуск и живая приёмка ChatGPT не выполнялись.

## Выпуск 0.6.75 — 02.10.2026

Выпуск **0.6.75** для macOS arm64 и Windows x64: Electron **44.5.1**, встроенный и комплектный Node **24.21.0**, Workflow Kit **1.5.1**. Node разработки, проверок и внешних workers — **^24.21.0** (не ниже 24.21.0 и ниже 25). Очистка мёртвого кода и дубликатов сохраняет поведение 0.6.74 и событийный runtime. Экспорт `pageOperation` восстановлен для Web Pilot Sidebar; формат `pageScript` сохранён.

Поставка — `~/Downloads/WebPilot-0.6.75/`. Корневой `Project Web Pilot.app` и копия в `/Applications` обновлены с сохранением Finder-identity. 02.10.2026 пользователь запустил 0.6.75 и явно передал общую приёмку. Отдельные live-сценарии не перечислены; native Windows и чистый первый запуск не проверены. Матрица подтверждений — в [VERIFICATION](VERIFICATION.md).

T009 завершена коммитом `ed55308431f28239205ba854f20d1e2a69add865`. Проверки node24, unit (457 / 454 PASS / 3 SKIP), smoke и paired-release прошли. Packager получает версию из package.json без --app-version. Все 106 исходных файлов совпали с упаковками. Manifest sourceCommit — `198cb457cb82240bc2c2519b67500903b75a657b` (HEAD перед release commit); изменения версии вошли в T009.

| Архив | Размер, байт | SHA-256 |
| --- | ---: | --- |
| Project-Web-Pilot-0.6.75-macOS-arm64.zip | 185520257 | `d36df5cf7edca43e622481b29b411748d7dc8fdc109bd2696927711c85efa0aa` |
| Project-Web-Pilot-0.6.75-Windows-x64.zip | 355422106 | `ba135bceaa379d6cc2073ecbc5be5ce940972c4b038e3096a7eae51fb6b27ec4` |

[Релиз v0.6.75 на GitHub](https://github.com/OleynikAleksandr/Project-Web-Pilot/releases/tag/v0.6.75) опубликован с обоими ZIP, SHA256SUMS.txt, INSTALL.txt и release-manifest.json. Main и тег были синхронизированы с T009; последующие документальные коммиты продвигают main, тег остаётся на release commit. Серверные размеры/SHA-256 сверены; отчёт — .harness/runtime/t009-publication.json.

Root app и /Applications обновлены без потери Finder identity; device/inode сверены с .harness/runtime/release-0.6.75-preflight.json. Установка /Applications после сборки выполнена штатным installMacBundle без пересборки; прежние Contents сохранены в backup. Отчёт — .harness/runtime/t009-installation.json.

T010 завершена коммитом `18203141cee540dadb2b92742d9ea676743b286d`. `node scripts/check-installed-release.mjs` (gate release-installed) прошла за 21,74 с: исходники, ZIP, identity обоих app, встроенный/комплектный Node, worker и CLI Kit с PATH без системного Node, статическая Windows-проверка и установленный observer fixture. Приёмка пользователя записана в [VERIFICATION](VERIFICATION.md).

## Предыдущая локальная поставка — 0.6.74 / 01.10.2026

0.6.74 завершает трёхфазный событийный рефакторинг и сохраняет AutoPlan 0.6.73. T001 фазы 3 выполнила сопоставимые 60-секундные fixture-замеры и live Chat/Work на macOS с реальным аккаунтом: recovery, `busy → idle`, reload без дубля, file-event/stale, событийное оформление composer и minimize/restore. Production-регрессий не выявлено. Workflow Kit 1.5.1 неизменён.

T002 штатно выполнила `npm run build` внутри управляемого Workflow Kit commit `a0db3583fe5f0e24169aa635bf9b0d12ee5d284f`. Release manifest фиксирует `sourceCommit=274688bb141c8a06cd4a32a68a4ee47a30909e0c`, 104 source/resource файла и `packagedSourceMatches=true`; версия/релизные изменения вошли в T002. Workflow Kit в обеих упаковках: 1.5.1, 35 файлов, SHA-256 `93de6bb6362dfe968f971922a24028886780a8df6b773730f721c7489532dd33`.

Поставка: `~/Downloads/WebPilot-0.6.74/`.

- `Project-Web-Pilot-0.6.74-macOS-arm64.zip` — 181585874 bytes; SHA-256 `c42738a5e5dec9b0d3cccb74b5e6e3c48a39fe3fad65827891c72abf9591a1cf`.
- `Project-Web-Pilot-0.6.74-Windows-x64.zip` — 316847740 bytes; SHA-256 `aa02587d23a356975c8fb8814ed2ba7e85f39f8db88d571c9c228fe65b09377d`.

Постоянный root `Project Web Pilot.app` обновлён до 0.6.74 с сохранением device/inode `16777234/406600483`, то есть Finder-identity не изменилась. Отдельная копия `/Applications/Project Web Pilot.app` в T002 не обновлялась: inode `406571340` сохранён, версия остаётся 0.6.73. Это явно отличать от root app и ZIP-поставки.

Native Windows запуск и clean VM в этой фазе не выполнялись (`nativeWindowsTested=false`, `cleanVmTested=false`) и не подменяются macOS cross-package проверкой. GitHub Release не публиковался.

## Предыдущая локальная поставка — 0.6.73 / 29.09.2026

Автовыполнение короткими ответами, продолжение частичного плана, Stop/вопрос с возобновлением после сообщения пользователя, диагностика отсутствия наблюдаемого прогресса и исправление T001 второй фазы. Workflow Kit 1.5.1 неизменён. Контракт — [автовыполнение](planning/auto-plan-continuation.md).

Поставка: ~/Downloads/WebPilot-0.6.73/. Все 104 source/resource файлов совпадают с обеими упаковками. Постоянный root app и /Applications обновлены с сохранением identity; работающий пользовательский процесс не перезапускался. Базовый commit сборки be885324d51ec240a1b31203eb9e5f09761f62eb; версия и release-документы фиксируются T007.

- Project-Web-Pilot-0.6.73-macOS-arm64.zip — 181585176 bytes; SHA-256 7d31eaab5b8c9545f8c3372533e90e60ae290570c596444178eaab5670eff4ec.
- Project-Web-Pilot-0.6.73-Windows-x64.zip — 316847036 bytes; SHA-256 3a953265e28449ecfb9d95e76db430d036843e2d94b3a1cc58dccd9f8ec77e4e.

T005/T006/T008 прошли unit и Electron smoke. Gate T007 проверяет упаковки, установленный preload/composer/AutoPlan на частичном и полностью завершённом плане, точное «Продолжай» и отсутствие дополнительного Send после всех DONE. Kit из обеих упаковок проверяется через CLI. Результат gate сохраняется Workflow Kit вместе с подтверждённым коммитом T007.

После полного выхода запустить прежний app и включить «Автовыполнение» в карточке плана. Живая устойчивость ChatGPT, native Windows и clean VM не подтверждаются этими fixture-проверками; GitHub Release не публиковался. Поставка 0.6.73 предшествует source-коммитам фазы 2 T002/T003; они завершены 29.09.2026, но отдельный промежуточный релиз не назначался. Их упаковка и итоговые измерения относятся к фазе 3.

## Предыдущая локальная поставка — 0.6.72 / 28.09.2026

Workflow Kit 1.5.1 добавляет plan:carryover: архив исходного scope с честными статусами и новый current plan из незавершённых задач одним Git-коммитом. Доставка Paste/Send сохранена из 0.6.71.

Поставка: ~/Downloads/WebPilot-0.6.72/. Все 101 source/resource файлов совпадают с обеими упаковками; root app и /Applications обновлены с сохранением inode. Базовый commit a9987f76826fa798783b1529c15868918e0498f9; исходники релиза фиксируются T010.

- Project-Web-Pilot-0.6.72-macOS-arm64.zip — 181575393 bytes; SHA-256 e2959647972ae73e4f96460ca565fd47d0dbe366ba8649b14c8eea251eb7a201.
- Project-Web-Pilot-0.6.72-Windows-x64.zip — 316837295 bytes; SHA-256 4525a1fcc316c7995467274d3a67e0fb25cff01cbd5f54e316d3fa1bcf63df27.

Gate T010: unit, Electron smoke и installed/package; Kit из обеих упаковок выполняет plan:carryover через CLI в изолированном Git-проекте. Проверка установленного composer сохраняется. Live ChatGPT и native Windows не проверялись агентом; GitHub Release не публиковался.

## Предыдущая локальная поставка — 0.6.71 / 28.09.2026

Итог T008/T009: после Send нет ожидания результата, поиска маркера во вложении или общего индикатора проверки. Старые unknown не повторяются и не держат секундомер. Базовый commit d8774b5cc552aa3e962347d42e9f93dfb0fe6b1a; финальные изменения фиксируются T009. Все 101 source/resource файлов равны обеим упаковкам; root app и /Applications обновлены с сохранением identity. Kit 1.5.0 не менялся.

Доставка: ~/Downloads/WebPilot-0.6.71/.

- Project-Web-Pilot-0.6.71-macOS-arm64.zip — 181497969 bytes; SHA-256 7b27adbc09a507ccec4d441888146e1188c483f1b12c2d5dca836fcdd731743b.
- Project-Web-Pilot-0.6.71-Windows-x64.zip — 316759879 bytes; SHA-256 253eb04fd67fa027baae08dbd25d9ed54c473fc653c9decb6da21b2b90fce30b.

Основная логика T008 прошла unit/smoke/installed gate. T009 проверяет скрытие индикатора и отмену его таймера, импорт установленного progress.mjs, установленный Paste/Send и обе упаковки. Live ChatGPT и native Windows отдельно. GitHub Release не публиковался.

## Предыдущая локальная поставка — 0.6.70 / 28.09.2026

T008 удаляет ожидание подтверждения recovery после вызова Send. Вложение без requestId в видимом тексте больше не вызывает 12-секундный timeout и бесконечную проверку. Постоянный адрес связывается без сверки содержимого; старые неизвестные попытки остаются нейтральными, без повтора.

Базовый commit 65a7e1aa6e416b149f54c78d6905eb79b338bfa7; исходники исправления фиксируются T008. Все 101 source/resource файлов равны обеим упаковкам. Root app и /Applications обновлены с прежней identity; пользовательский процесс не перезапускался. Kit 1.5.0 неизменён.

Доставка: ~/Downloads/WebPilot-0.6.70/ с manifest, INSTALL и SHA256SUMS.

- Project-Web-Pilot-0.6.70-macOS-arm64.zip — 181498153 bytes; SHA-256 a5c0f858e0c53ca0195890b0f51f14271c18615b3c4505b20e651b36f1048945.
- Project-Web-Pilot-0.6.70-Windows-x64.zip — 316760088 bytes; SHA-256 93796997d3ddb24c64a17a0ace245f73c07c94e629ad5daee051b10a265275d8.

Обязательные проверки T008: unit, smoke, installed/package gate. Установленный composer выполняет Paste в ProseMirror и завершает Send без post-click ожидания при DOM, содержащем только имя вложения. Live ChatGPT, native Windows и clean VM отдельно. GitHub Release не публиковался.

## Предыдущая локальная поставка — 0.6.69 / 28.09.2026

T007: контекст передаётся обработчику Paste редактора через text/plain и безопасное text/html. Системный clipboard не меняется; автоматический Send не блокируется сверкой текста. Если Paste не обработан, выводится ошибка без медленного fallback. Kit остаётся 1.5.0.

Базовый commit 5646950b0288302eccbdc3770dcbc37af7293fbb; исходники исправления фиксируются T007. Все 101 source/resource файлов совпадают с обеими упаковками. Корневой app и /Applications обновлены с сохранением identity; пользовательский процесс не перезапускался.

Доставка: ~/Downloads/WebPilot-0.6.69/ с manifest, INSTALL и SHA256SUMS.

- Project-Web-Pilot-0.6.69-macOS-arm64.zip — 181497129 bytes; SHA-256 1446791026f9bdbcc46cbf209bdb800b08ae2e4dc08fa7d9f614a4be53d6ac1c.
- Project-Web-Pilot-0.6.69-Windows-x64.zip — 316759050 bytes; SHA-256 0e854ae23d5266f3185c1f78f546a0af486bb22068e552e1119763bb993cbbb6.

Обязательные проверки T007: unit, Electron smoke и installed/package gate. Последний исполняет установленный composer на настоящем ProseMirror: один Paste, точный многострочный текст, Send, reload без дубля. Скорость реального ChatGPT проверяет пользователь; native Windows и clean VM не запускались. GitHub Release не публиковался.

## Предыдущая локальная поставка — 0.6.68 / 28.09.2026

T006: webContents.insertText вместо медленного execCommand; Send после вставки без сверки текста. Актуальность пакета проверяется до вставки. Runtime Kit остаётся 1.5.0.

Базовый commit c4e8f27aff9b391dbb9b43d68736cf164664c81b; исходники исправления фиксируются T006. Все 101 source/resource файлов совпадают с обеими упаковками. Корневой app и /Applications обновлены с сохранением identity; пользовательский процесс не перезапускался.

Доставка: ~/Downloads/WebPilot-0.6.68/ с manifest, INSTALL и SHA256SUMS.

- Project-Web-Pilot-0.6.68-macOS-arm64.zip — 181495181 bytes; SHA-256 512c664bcd4033807301dc2796dbdbdc7811cff0bac231f4804a07be60e75cef.
- Project-Web-Pilot-0.6.68-Windows-x64.zip — 316756972 bytes; SHA-256 a5fe05cc9c125e9af83c6b92c184be02fe3d7a860a275eae21b99febf6b8f275.

Обязательные проверки T006: unit, Electron smoke и installed/package gate. Installed fixture выполняет нативную вставку большого contenteditable, Send и подтверждение, reload без дубля. Живой ChatGPT, native Windows и clean VM проверяются отдельно. GitHub Release не публиковался.

## Предыдущая локальная поставка — 0.6.67 / 28.09.2026

Диагностический выпуск T005: этапы Send и метаданные несовпадения черновика без текста. Реальный отказ 0.6.66 пока не объявляется исправленным; сравнение и защита от повторной отправки сохранены.

Базовый commit 444ea9defac76a16f7a140e310ea5072584b4ec0; изменения входят в T005. Все 101 исходных/resource файлов совпадают с обеими упаковками. Root app и /Applications обновлены с сохранением identity. Пользовательский процесс не перезапускался.

Доставка: ~/Downloads/WebPilot-0.6.67/ с manifest, INSTALL и SHA256SUMS.

- Project-Web-Pilot-0.6.67-macOS-arm64.zip — 181494607 bytes; SHA-256 cb50e70ef4edbc12e174c949ef19db1c77f508a7f7b1e245291c60b410cc19bf.
- Project-Web-Pilot-0.6.67-Windows-x64.zip — 316756424 bytes; SHA-256 dd9057a5fdbcb51b88efbd1c0311834e8f7920e09c1b11cf6c61efb44bd15aea.

Проверки T005: unit, Electron smoke, installed/package gate. Installed fixture использует многострочный contenteditable и проверяет записи clicked/sent без текста. Native Windows, live ChatGPT и clean VM отдельно. Kit 1.5.0 не менялся; GitHub Release не публиковался.

## Предыдущая локальная поставка — 0.6.66 / 28.09.2026

Самостоятельное исправление T004 фазы 2: пустое поле перед recovery нового Chat/Work, сохранение черновика при обычном открытии. Основные задачи фазы 2 ещё ожидают выполнения.

Парный build: базовый commit `ad7d58aa85504b273aa897c0172d92c800319d05`, исходники и версия 0.6.66 зафиксированы задачей T004; все 101 source/resource файлов совпадают с упаковками. Root app и /Applications обновлены с сохранением identity; пользовательский процесс не перезапускался.

Доставка: `~/Downloads/WebPilot-0.6.66/` с INSTALL, manifest и SHA256SUMS.

- `Project-Web-Pilot-0.6.66-macOS-arm64.zip` — 181493023 bytes; SHA-256 `e99c0a031e5e2e04f6ac7cadb280394fc5ed1bd12086440010bba4e24a415d74`.
- `Project-Web-Pilot-0.6.66-Windows-x64.zip` — 316754849 bytes; SHA-256 `e2798eec8a23a67241a74d4e0030676f7a89bfb5562837a4dc319c1d94980839`.

Обязательные проверки T004 — unit, Electron smoke, installed/package gate. Installed composer очищает восстановленный черновик, отправляет новый пакет и при reload сохраняет черновик без дубля. Изолированный fixture не заменяет live ChatGPT, native Windows или clean VM; они не запускались. Kit остаётся 1.5.0; GitHub Release не публиковался.

## Предыдущая локальная поставка — 0.6.65 / 28.09.2026

Исправление T009 добавляет распознавание «Resume stream unavailable». Существующие ограничения восстановления, запрет повторного Send и защита черновика сохранены.

Парный `npm run build`: базовый commit `d7731f3aa061921d1e8cb86fb1e7355e4a4b09a7`, изменения версии и адаптера входят в T009. Все 101 source/resource файлов сверены с обеими упаковками. Корневой app и `/Applications/Project Web Pilot.app` обновлены с сохранением inode 406600483 и 406571340. Работающий процесс не перезапускался.

Доставка: `~/Downloads/WebPilot-0.6.65/`, включая `SHA256SUMS.txt`, `INSTALL.txt`, `release-manifest.json`.

- `Project-Web-Pilot-0.6.65-macOS-arm64.zip` — 181492068 bytes; SHA-256 `b7e43ce33125a83a562723ca92a7de4c69aa56479d6b5b3888e3a78de341a5f2`.
- `Project-Web-Pilot-0.6.65-Windows-x64.zip` — 316753921 bytes; SHA-256 `b8b621a00e7f1bc29ae577db550d358ff0b983b1747a87f11b5e9819301e36b9`.

Проверки T009: Node suite, Electron smoke и installed/package gate; installed observer/composer распознают новую ошибку и сохраняют единственное сообщение при reload в изолированном fixture. Native Windows, live ChatGPT и clean VM не проверялись. Workflow Kit остаётся 1.5.0; фазы 2/3 не выполнялись. Новый GitHub Release не публиковался.

## Предыдущая локальная поставка — 0.6.64 / 28.09.2026

`npm run build` выпустил macOS arm64 и Windows x64 из одной версии исходников; базовый commit `884e8818364709691c4f2b8a3349b4a7dfad6de8`, версия package/lock обновлена до 0.6.64 в задаче выпуска. Все 101 source/resource файла сверены с обеими упаковками. Root app и `/Applications/Project Web Pilot.app` обновлены с прежними inode 406600483 и 406571340 соответственно. Сборка не перезапускает открытый пользовательский процесс.

Доставка: `~/Downloads/WebPilot-0.6.64/`, рядом `SHA256SUMS.txt`, `INSTALL.txt` и `release-manifest.json`.

- `Project-Web-Pilot-0.6.64-macOS-arm64.zip` — 181490764 bytes; SHA-256 `b0d90ac3fbcd2ed64cab0d41ad22077eb3b89d41ac76f7a1593384d778bc9998`.
- `Project-Web-Pilot-0.6.64-Windows-x64.zip` — 316752603 bytes; SHA-256 `4c21ba3ad5d8b506df1d73833375eb4a0ef201638107d468ac7c005a85c7bee0`.

`scripts/check-installed-release.mjs` проверяет источники/версии обеих упаковок, обе установленные macOS копии, identity, hashes ZIP и наличие generated preload в каждом ZIP. Отдельный Electron fixture исполняет preload и composer, извлечённые из установленной копии, на изолированной странице: большой Send, reload того же разговора и отсутствие дубля. Полный исходный UI проверен Electron smoke; полный запуск установленного приложения с реальным аккаунтом и native Windows не объявляются проверенными.

Первая фаза событийного runtime завершена; этот заказанный промежуточный выпуск не закрывает фазы 2/3. Workflow Kit 1.5.0 и runtime digest не менялись. Локальная поставка не опубликована как новый GitHub Release.


## Согласованный результат

16.09.2026 пользователь поручил один постоянный адрес приложения для Finder-алиаса и отдельный ZIP. Владелец этой части проекта — Release & Local Installation.

Постоянный macOS app: `<workspace>/Project Web Pilot.app`. На основном Mac это `/Users/oleksandroliinyk/VSCODE/Project Web Pilot/Project Web Pilot.app`. Имя и путь не зависят от версии. Пользователь один раз создаёт Finder-алиас на этот объект.

Отдельный архив: `.harness/runtime/releases/<version>/Project-Web-Pilot-<version>-macOS-arm64.zip`. Для выдачи пользователю архив копируется в `~/Downloads/WebPilot-<version>/`. Версия берётся из package.json. Постоянный app и ZIP — самостоятельные результаты выпуска.

## Facade и границы

- `npm run build:mac`: подготовить runtime, собрать app в staging, опубликовать постоянный app и отдельный ZIP.
- `npm run release:mac`: проверить уже собранный staging и повторить публикацию.
- `scripts/release-mac.mjs`: facade `publishMacRelease({ root })`; узкая операция `installMacBundle({ source, target, backupRoot, version })`.
- Входы: macOS arm64 staging bundle, версия package.json, корень workspace.
- Выходы: постоянный app, версионированный ZIP, checksum и локальный release receipt.
- Сборочный скрипт не меняет настройки, профиль Chromium, проекты или чаты; не останавливает запущенное приложение.
- Windows остаётся отдельной поставкой; macOS app из корня исключается из упаковки обеих платформ.

## Инварианты обновления

1. Перед заменой проверяются Info.plist и версия package.json внутри app.asar; источник копируется в staging и проверяется.
2. Корневая директория существующего постоянного `.app` сохраняет filesystem identity (device/inode). Меняется только Contents; старый Contents остаётся в резервной копии под `.harness/runtime/release-backups.noindex/` (до 0.6.89 — `release-backups/`).
3. При ошибке установки прежний Contents возвращается. Неизвестные файлы в корне bundle и symlink вместо app не перезаписываются.
3a. С 0.6.89 резервные копии лежат в `.harness/runtime/release-backups.noindex` (Spotlight не индексирует `.noindex`, вложенные Helper-приложения не видны). На каждую цель установки — корневой app и `/Applications` — хранится одна копия предыдущей версии в слоте `mac-<папка>-<hash пути>`; проверенная установка заменяет её. Если заменить слот не удалось, установка остаётся успешной, а копия — во временной папке рядом (`backupError`).
4. ZIP формируется из той же проверенной сборки отдельно от постоянного app; архив проверяется через unzip. Релиз считается готовым только при успехе установки и упаковки.
5. App, ZIP, backup и staging не входят в Git. Корневой app явно исключён из обоих packager commands, чтобы повторная сборка не включала предыдущую сборку внутрь новой.
6. В итоговом отчёте подтверждаются версия установленного app, равенство app.asar со staging и путь ZIP. Только наличие ZIP не означает завершённую доставку.
7. Работающий процесс продолжает старую сессию до полного выхода и нового запуска; замена файлов не считается перезапуском.

## Переход с прежнего алиаса

Старый адрес `.harness/runtime/releases/0.6.20/Project Web Pilot-darwin-arm64/Project Web Pilot.app` один раз обновляется до 0.6.23 с сохранением identity. Это совместимость с нынешним алиасом, а не будущий постоянный адрес. После выпуска пользователь создаёт алиас на app в корне проекта. Следующие релизы обновляют именно корневой app.
## Проверка механизма

`node --test tests/release-mac.test.mjs` на macOS проверяет повторный выпуск, неизменный device/inode постоянного app, отсутствие устаревших файлов, backup, распаковку отдельного ZIP и отказ при неверной версии, посторонних файлах или symlink target. На других платформах эти три проверки пропускаются. `mac-release.json` и `<zip>.sha256` сохраняют фактическую доставку и контрольную сумму.

## Выполненный переход — 0.6.23

Постоянный корневой app установлен и повторно обновлён штатным build:mac с неизменным inode. Прежний app в releases/0.6.20 также обновлён до 0.6.23 с сохранением identity. Проверены версии, совпадение app.asar со staging, ZIP integrity и отсутствие вложенного app в обоих platform packages. Подробные контрольные суммы и evidence — `docs/VERIFICATION.md` и `.harness/runtime/releases/0.6.23/release-manifest.json`.

## Последующий выпуск — 0.6.24

Штатная сборка обновила постоянный корневой app с 0.6.23 до 0.6.24, сохранив device/inode. Отдельный ZIP и checksum находятся в .harness/runtime/releases/0.6.24/ и ~/Downloads/WebPilot-0.6.24/. Исторический адрес releases/0.6.20 остаётся однократно обновлённой копией 0.6.23; актуальный запуск — только постоянный корневой app.

## Последующий выпуск — 0.6.25

Постоянный корневой app обновлён с 0.6.24 до 0.6.25 штатным build:mac, identity сохранена. Поставки обеих платформ — .harness/runtime/releases/0.6.25/; копии ZIP — ~/Downloads/WebPilot-0.6.25/. Релиз добавляет фон ввода и исправляет обработку цвета потокового текста. Для применения нужен полный выход и повторный запуск через постоянный алиас.


## Последующий выпуск — 0.6.26

Постоянный корневой app обновлён с 0.6.25 до 0.6.26 штатным `build:mac` с сохранением inode `398344301`. macOS ZIP опубликован штатным publisher; Windows x64 package прошёл verifier и упакован отдельным ZIP. Обе поставки находятся в `.harness/runtime/releases/0.6.26/`, копии ZIP и `SHA256SUMS.txt` — в `~/Downloads/WebPilot-0.6.26/`. Релиз меняет только визуальное выделение активной сессии в дереве. Для применения уже запущенного macOS приложения нужен полный выход и повторный запуск через постоянный алиас.

## Проверка самостоятельной установки — clean-install-lab-027

Пользователь поручил подготовить чистые виртуальные macOS и Windows и проверить на них готовые поставки. После уточнения 17.09 подготовка стенда завершена, проверка первых запусков перенесена в следующий scope; здесь выполнена диагностика задержек Computer Use. Планировочный документ и фактические результаты — `docs/CLEAN_INSTALL.md`. Наличие bundled компонентов не означает успешную установку на чистой ОС; для 0.6.26 выявлены внешняя зависимость Mac от Node/Git, незавершённое подключение Windows Git к Workspace Setup и отсутствие Mac UI настройки туннеля. Успех на компьютере разработчика не заменяет эту проверку. Рабочие runtime/профили основного компьютера сохраняются.


## Наблюдаемая поставка 0.6.27 — 17.09.2026

На 17.09.2026 этот Git-checkout содержит исходники 0.6.26, а установленный корневой macOS app по Info.plist — 0.6.27. Пользователь сообщил о выпуске 0.6.27 другим агентом; ZIP обеих платформ есть в ~/Downloads/WebPilot-0.6.27/. Соответствие этих пакетов данному checkout и их чистая установка пока не подтверждены.

Пакет macOS 0.6.27 скопирован и распакован пользователем в гостевой Test-macOS. Публикация, rebuild, изменение версии исходников и проверка release provenance в clean-install-lab-027 не выполнялись. Перед следующим испытанием сверить выбранные пакеты и SHA-256; сведения об успешно проверенной 0.6.26 выше сохраняются как история.

## Выпуск 0.6.28 — планы сессий / T013

17.09.2026 собраны macOS arm64 и Windows x64 из одного source. Workflow Kit 1.4.0 включён в обе поставки. Постоянный Project Web Pilot.app обновлён штатным build:mac; device 16777232 / inode 398344301 сохранены. app.asar установленного приложения совпадает со staging и ZIP; все 32 файла src и поставляемые resources совпадают с source. Обводка дерева из 0.6.27 сохранена. Windows verifier проверил PE, Node и runtime SHA. Оба ZIP проверены и скопированы в ~/Downloads/WebPilot-0.6.28/ вместе с SHA256SUMS.txt.

- Project-Web-Pilot-0.6.28-macOS-arm64.zip: SHA-256 df7ddb3a155c320ea5b980dadf130316eb1c7896029c7634a4b690136220570b; 145210773 bytes.
- Project-Web-Pilot-0.6.28-Windows-x64.zip: SHA-256 f61492cc74bc2c560412a2a0adb6cfa54469232f0c21fd7bf25f5c9fe0f6c222; 318057661 bytes.

Evidence: .harness/runtime/releases/0.6.28/{mac-release.json,source-verification.json,release-manifest.json,SHA256SUMS.txt}. Реальный ChatGPT, чистая установка в UTM и native Windows этим выпуском не проверялись. Работающее приложение не перезапускалось: для применения нужен полный выход и повторный запуск через постоянный app/алиас.

Для 0.6.28 происхождение исходников уточнено: единственное различие src установленного 0.6.27 относительно исходного 0.6.26 было в index.html. Его обводка/линии сохранены в новом UI; пакет не заменён старой реализацией.

## Выпуск 0.6.29 — быстрое открытие / scope 029

17.09.2026 штатно собраны macOS arm64 и Windows x64 с Workflow Kit 1.4.1. Постоянный корневой app обновлён; device 16777232 / inode 398344301 сохранены, прежний Contents находится в release-backups/mac-K8QmyO. Все 33 файла src и 31 файл resources совпадают с source в обеих поставках и установленном app; app.asar установленного app совпадает со staging и ZIP (`11fdfee96de9ff163e2f80c907e1a4847bc4466d1ff905b7cf7a83dd309f8970`). Вложенного старого app нет.

- macOS ZIP: `bf01bfb8d576d9a63311ec51abbc58aa5b4693817826022aca038852b237169e`, 145219226 bytes.
- Windows ZIP: `f902693319d1c6ec644e96ebadac423f5735a1508cb4c55c028085e59d3a8859`, 315992003 bytes.

Оба ZIP прошли integrity/asar проверку; копии и SHA256SUMS.txt находятся в ~/Downloads/WebPilot-0.6.29/. Evidence: .harness/runtime/releases/0.6.29/{mac-release.json,source-verification.json,release-manifest.json}. Установленный macOS app измерен на отдельном профиле: 30 переключений, p95 обоих локальных endpoints 14.3 мс; пять запусков shell→план 14–19 мс, полный spawn→план 389–1682 мс, включая inspector setup. Подробные границы — docs/VERIFICATION.md. Native Windows и чистые VM не запускались.

Короткая пользовательская проверка: полностью выйти из работающего Web Pilot и открыть постоянный app/алиас; несколько раз переключить сессии и проверить собственный план/NONE; затем создать Chat/Work или явно обновить контекст и проверить доставку после готовности. Рабочий профиль и чаты сохраняются, приложение не перезапускалось автоматически.

Scope 029 / T010: после выпуска все изменения находятся в main, лишние зарегистрированные worktrees и временная ветка удалены. Их уникальные отчёты/черновики и Git refs сохранены в .harness/runtime/cleanup-029/. В основном репозитории остаётся одно рабочее дерево и одна локальная ветка main; выпуск не архивирует план сессии.

## Выпуск 0.6.30 — понятное название плана следующей сессии

17.09.2026 выпущен Project Web Pilot 0.6.30. Изменение пользовательского интерфейса одно: блок будущего подготовленного плана теперь называется «План следующей сессии» вместо «Подготовлено здесь»; механика plan:prepare/plan:bind, выбор Chat/Work и связи между сессиями не менялись. Sidebar regression, полный Node suite и Electron smoke прошли.

`npm run build` успешно собрал macOS arm64 и Windows x64. Постоянный `Project Web Pilot.app` обновлён штатным release facade с сохранением device `16777232` / inode `398344301`; резервная копия прежнего Contents — `.harness/runtime/release-backups/mac-0zA7Wi`. Все 33 файла `src` и 31 файл `resources` побайтово совпали с macOS package, Windows package и установленным app; Windows verifier подтвердил PE, portable Node 22.17.0, runtime SHA и наличие Workflow Kit.

- `Project-Web-Pilot-0.6.30-macOS-arm64.zip`: SHA-256 `1247fec6f7e8ad21040805ce64e5703b318dcdba95771dcc22166be7a6158f4f`, 145219230 bytes.
- `Project-Web-Pilot-0.6.30-Windows-x64.zip`: SHA-256 `8ea8469720524105fe23c55c37125c0d48203b42a2bc8fca561b771e4027a33e`, 315991998 bytes.

Оба ZIP прошли integrity и app.asar verification; копии и `SHA256SUMS.txt` находятся в `~/Downloads/WebPilot-0.6.30/`. Evidence: `.harness/runtime/releases/0.6.30/{mac-release.json,source-verification.json,release-manifest.json,SHA256SUMS.txt}`. Native Windows и чистые VM этим коротким выпуском не запускались. Для применения в уже открытом Web Pilot нужен полный выход и повторный запуск постоянного app/алиаса.

## Выпуск 0.6.31 — сохранение размеров и позиции интерфейса

17.09.2026 выпущен Project Web Pilot 0.6.31. Главное окно теперь сохраняет и восстанавливает position/size штатным Electron `windowStatePersistence`; ширина сайдбара продолжает сохраняться существующим `settings.json`. Оба состояния находятся в userData вне app bundle, поэтому штатная замена релиза их не удаляет. Полноэкранный/максимизированный display mode не сохраняется.

`npm run build` успешно собрал macOS arm64 и Windows x64. Постоянный macOS app обновлён с сохранением device `16777232` / inode `398344301`; backup прежнего Contents — `.harness/runtime/release-backups/mac-LhYcRR`. Все 33 файла `src` и 31 файл `resources` побайтово совпали с macOS staging, Windows staging и установленным app; Windows verifier подтвердил portable Node/runtime и Workflow Kit.

- `Project-Web-Pilot-0.6.31-macOS-arm64.zip`: SHA-256 `14fa8dd2d4f3941b71bfe482997257a4dd028e5a4100279d0f567fa26f432fe9`, 145219263 bytes.
- `Project-Web-Pilot-0.6.31-Windows-x64.zip`: SHA-256 `00b4a80973718d137bc733df2937858fe12b9dbeba7230a302b00213f34ff5b5`, 315992040 bytes.

Оба ZIP прошли integrity/app.asar verification и скопированы в `~/Downloads/WebPilot-0.6.31/`; `SHA256SUMS.txt` лежит рядом. Evidence: `.harness/runtime/releases/0.6.31/`. Native Windows и чистые VM в этом коротком дополнении не запускались. Уже открытое окно не перезапускалось автоматически.

## Выпуск 0.6.32 — первая итерация сопровождения macOS

17.09.2026 штатный `npm run build:mac` собрал macOS arm64. Новый профиль получает мастер входа/создания аккаунта, подготовки компонентов, подключения файлов и первого проекта. Включён официальный Node.js 22.17.0 arm64; Git устанавливается штатным диалогом Apple по кнопке, Python/MCP — существующим bootstrap. Настройка туннеля сопровождается инструкцией и нативным вводом личных данных. Запуск вне Applications на новом профиле предлагает штатное перемещение приложения.

Постоянный app имеет версию 0.6.32 и сохранил device `16777232` / inode `398344301`; backup Contents — `.harness/runtime/release-backups/mac-Wo08g7`. Все 35 файлов src, 32 файла resources и четыре файла mac-tools сверены с готовой поставкой. app.asar установленного app, staging и ZIP совпадает: `d06b59da4f702e0583e2f962c64aac272b1e693aef8010a2ca04dc315b02fac2`. Проверены ZIP integrity, встроенная версия Node и соответствие копии в Downloads.

`Project-Web-Pilot-0.6.32-macOS-arm64.zip`: 181068519 байт, SHA-256 `2e0d816182e60ecba94088cbb7f0bda5415f079a9269045653b58cc229528d8a`. Копия, `SHA256SUMS.txt` и короткий `INSTALL.txt` находятся в `~/Downloads/WebPilot-0.6.32/`. Evidence: `.harness/runtime/releases/0.6.32/{mac-release.json,source-verification.json,SHA256SUMS.txt,startup-account.png,startup-components.png}`.

Это macOS-итерация для повторного ручного испытания на свежем клоне, а не подтверждение чистого полного запуска. Причина пустой веб-панели прежнего запуска пока не установлена. Windows 0.6.32 не собиралась; последний Windows ZIP остаётся 0.6.31. Основное работающее приложение и runtime не перезапускались.

## Выпуск 0.6.33 — ранняя диагностика первой загрузки

Обе платформы собраны штатным npm run build. Постоянный macOS app обновлён с сохранением device 16777232 / inode 398344301; резервная копия Contents — .harness/runtime/release-backups/mac-p6IC2n. Работающий Web Pilot не перезапускался. Ранняя диагностика входит в обе поставки; macOS-мастер получил корректные подсказки и копирование отчёта, Windows-мастер остаётся отдельной задачей.

- macOS arm64: Project-Web-Pilot-0.6.33-macOS-arm64.zip, 181070160 байт, SHA-256 7de3f296b58bb3109ec241344569eae690b67ebbf9585cde7492132232b10e1a.
- Windows x64: Project-Web-Pilot-0.6.33-Windows-x64.zip, 317787260 байт, SHA-256 7349ac662782aada96a420397f6bff34f9b8a82fa041ef6be9de6a598775dded.

ZIP проверены и скопированы в ~/Downloads/WebPilot-0.6.33/ вместе с SHA256SUMS.txt и INSTALL.txt. Все 35 файлов src и 32 файла resources совпали с source в обеих поставках и постоянном app; app.asar установленного Mac, staging и ZIP совпадает. Проверены четыре bundled mac-tools и исполнение Node v22.17.0 arm64. Windows verifier подтвердил PE, portable Node и runtime SHA; нативного Windows-запуска не было.

Evidence — .harness/runtime/releases/0.6.33/{mac-release.json,source-verification.json,release-manifest.json}. Этот выпуск устраняет доказанный диагностический пробел, но причина пустой панели гостя остаётся неизвестной. Проверка в госте и весь чистый путь ещё впереди.

## Выпуск 0.6.34 — ограниченное первое открытие

Обе платформы собраны штатным npm run build. В пустой панели без проекта первый документ получает до 15 секунд; при отсутствии документа соединение восстанавливается один раз, не дольше 5 секунд, затем запрос получает ещё до 15 секунд. Готовый DOM позволяет macOS-мастеру проверить вход, пока дополнительные ресурсы продолжают загружаться. Существующие проекты сохраняют прежние проверки навигации и доставки; cookies и настройки не удаляются.

Постоянный macOS app обновлён до 0.6.34 с сохранением device 16777232 / inode 398344301. Работающий процесс и рабочий runtime не перезапускались.

- macOS arm64: Project-Web-Pilot-0.6.34-macOS-arm64.zip, 181071249 байт, SHA-256 57467253485aafc67165bc8844febabf3280f6b974afbc76d7f39d9a6f846933.
- Windows x64: Project-Web-Pilot-0.6.34-Windows-x64.zip, 317788339 байт, SHA-256 be7688a5a4982f121f8cc231f0a4570a51e0c26096e44efa692f12b6da5199f4.

Все 36 файлов src и 32 файла resources побайтово совпали с source в обеих поставках и установленном app. app.asar установленного Mac, staging и ZIP совпадает; проверены целостность обоих ZIP, четыре mac-tools и запуск встроенного Node v22.17.0 arm64. Windows verifier подтвердил portable Node/runtime и структуру EXE-поставки. Архивы, SHA256SUMS.txt и INSTALL.txt находятся в ~/Downloads/WebPilot-0.6.34/.

Evidence: .harness/runtime/releases/0.6.34/{mac-release.json,source-verification.json,release-manifest.json,browser-recovery-native.log}. Локальный native Electron fixture подтвердил один recovery, чтение DOM при незавершённом изображении и сохранение cookie. Повтор в Test macOS 01 ещё не выполнен; причина сети гостя не установлена, MAC-002 остаётся открытым. Нативный Windows-запуск и Windows-мастер не объявлены проверенными.

## Выпуск 0.6.35 — непрерывный первый запрос / B004

Собраны macOS arm64 и Windows x64. Один автоматический первый запрос ожидает до 120 секунд без отмены на 15-й секунде; повтор во время ожидания заблокирован. Отчёт сохраняет начало сессии и очищенные сетевые этапы. Это диагностическая итерация: причина задержки в Test macOS 01 ещё не установлена.

Постоянный macOS app обновлён штатным release facade с сохранением device 16777232 / inode 398344301. Все 37 файлов src и 32 файлов resources совпадают в source, macOS staging, Windows staging и установленном app; сверены 4 файла mac-tools, Node v22.17.0 arm64 и отсутствие вложенного старого app. Оба ZIP проверены, app.asar совпадают с staging, контрольные суммы копий в Downloads совпадают.

- Project-Web-Pilot-0.6.35-macOS-arm64.zip: 181073878 bytes; SHA-256 5b03ec3b236009d8b010d638098223889f585733fd99ed002e00e67bb4cb1acd.
- Project-Web-Pilot-0.6.35-Windows-x64.zip: 317790975 bytes; SHA-256 75d2d4daadfbda5417268b181e11f64753af27edd49d868e43a76f679ea1136c.

Пакеты, SHA256SUMS.txt и INSTALL.txt: ~/Downloads/WebPilot-0.6.35/. Evidence: .harness/runtime/releases/0.6.35/{mac-release.json,source-verification.json,release-manifest.json,SHA256SUMS.txt}. Рабочий процесс Web Pilot, профили и runtime не перезапускались. Нативная Windows и результат гостевой проверки 0.6.35 не подтверждены. Следующая задача T016 сохраняет полный чистый путь, финальная DOCS остаётся последней.

## Выпуск 0.6.36 — показ установщика Apple / B005

Штатный npm run build собрал macOS arm64 и Windows x64. Постоянный корневой Project Web Pilot.app обновлён с сохранением device 16777232 / inode 398344301; версия Info.plist и app.asar — 0.6.36. Все 37 файлов src и 32 файла resources побайтово совпали с обеими поставками и установленным app; 4 файла mac-tools также совпали. ZIP прошли integrity, app.asar и проверку SHA-256 после копирования в ~/Downloads/WebPilot-0.6.36/. Windows package verifier подтвердил состав runtime; native Windows не запускалась.

- Project-Web-Pilot-0.6.36-macOS-arm64.zip: 181074205 bytes; SHA-256 c5ee9d318961f4954282c801d6bdd3b33bea693fb1859a98581833e288d46558.
- Project-Web-Pilot-0.6.36-Windows-x64.zip: 316322177 bytes; SHA-256 733c28af4853e3bf8b7a2259cd84d3e5ceec31ef9cc511fbb9941f4a0d2c835e.

Изменения: после запроса установки Apple активируется штатное окно через open; ошибки запуска и показа различимы. Ранее подготовленная C009 добавляет прямой /auth/login для открытия без выбранного проекта. Сетевой дефект не объявляется устранённым: новый исходный клон 0.6.35 работал без изменения маршрута, тогда как прежний давал таймауты. Рабочий процесс и профиль основного Mac не перезапускались. Видимость системного окна и полный путь в госте ожидают T017. Evidence: .harness/runtime/installer-focus-{build,verify}-036.log, releases/0.6.36/{mac-release.json,source-verification.json,release-manifest.json,SHA256SUMS.txt}.

## Выпуск 0.6.37 — восстановление подготовки runtime

Выпущены macOS arm64 и Windows x64. Включены C010 (показ установщика Apple), C011 (точный известный комплектный control.py, facade после первой установки и восстановление собственной папки) и C012 (понятные ожидания/ошибки без обещания нескольких минут). Прямой вход C009 сохранён. Windows-мастер и гостевой полный путь этим выпуском не объявляются проверенными.

Постоянный корневой app обновлён с сохранением device 16777232 / inode 398344301. Версия Info.plist/ASAR — 0.6.37; ASAR установленного app равен staging. Все 37 исходных и 32 ресурсных файлов совпали в обеих поставках и установленном app; 4 Mac tools сверены. Вложенного старого app нет; Windows verifier пройден. ZIP integrity, содержимое ASAR и SHA доставки проверены.

- Project-Web-Pilot-0.6.37-macOS-arm64.zip: 181075090 bytes; SHA-256 b8be44db63dce0ee17e8e2f444c94add5a8772ba59c57b47caeb408bbe83d967; ASAR 2b977c2f5073ce9b093ae7ec599a88834b5cd53613914d2d5317e364621635f5.
- Project-Web-Pilot-0.6.37-Windows-x64.zip: 316323066 bytes; SHA-256 37d725c782895af44bde82d86df169231dd43ffe5a341d730b6ad3745cfd781c; ASAR 003c8512e9378819d409a7cdb6bc49e520f03e120369af76e6aa55cf6c4a0a45.

ZIP, INSTALL.txt и SHA256SUMS.txt находятся в ~/Downloads/WebPilot-0.6.37/. Evidence — .harness/runtime/releases/0.6.37/{mac-release.json,source-verification.json,release-manifest.json}. Изолированная установка из реального ZIP прошла за 33.671 с; ранее упавшая установка восстановлена без переустановки и изменения bridge_config. Результат в госте ожидает T017. Рабочий процесс и профиль основного Mac не перезапускались.

## Выпуск 0.6.38 — ввод туннеля и готовность Apple

18.09.2026 обе платформы собраны штатным `npm run build`. Русские тексты
системных окон больше не превращаются в неподдерживаемые AppleScript escapes;
ошибка окна отделена от отмены и ошибки данных. Принятый запрос установки Apple
запускает фоновую проверку Git; повторная установка скрыта, после готовности
остаётся явное «Проверить и продолжить».

Постоянный macOS app обновлён до 0.6.38; inode 398344301 сохранён. Текущий device
16777230 проверен в операции обновления; старый receipt 0.6.37 содержит прежний
номер device 16777232, который не используется как постоянный идентификатор
между монтированиями. Backup Contents: `.harness/runtime/release-backups/mac-5FGCxT`.
Совпали все 37 src, 32 resources и четыре mac-tools; установленный app.asar
совпадает со staging и Mac ZIP. Оба ZIP проверены и скопированы в
`~/Downloads/WebPilot-0.6.38/` вместе с SHA256SUMS.txt и INSTALL.txt.

- macOS arm64: 181076010 байт; SHA-256 `f74b0c7885e8890391bd3e2ee2d2856aabad3e29784040d1d6911b02741e40da`.
- Windows x64: 316323993 байт; SHA-256 `039eac9640a4e862aed236f9d44d61ae870ce8ed337bb6182fbbad18dbf00e05`.

Evidence: `.harness/runtime/releases/0.6.38/`. Оба точных выражения диалогов из
поставки прошли osacompile. Визуальное открытие через Computer Use на хосте не
подтверждено: отдельный osascript не адресуется, редактор остался в Running без
доступного окна; тест остановлен. Личные данные не вводились. Новый чистый клон,
весь путь до файла проекта и native Windows пока не проверены.

## Выпуск 0.6.39 — автоматические шаги и первый проект

18.09.2026 собраны macOS arm64 и Windows x64. Постоянный корневой app обновлён штатным build:mac с сохранением inode 398344301; Info.plist и package.json внутри app.asar подтверждают 0.6.39. Установленный app.asar совпадает со staging и ZIP. Все 38 файлов src и 32 файлов resources побайтово совпадают с source в обеих поставках; 4 файла mac-tools совпадают в staging и установленном app. Вложенного прежнего app нет.

- Project-Web-Pilot-0.6.39-macOS-arm64.zip: SHA-256 08cf81adc2f6981de4cfdd26e9aca0e2c2d4d599dd7252ad9f120f52d03be8ac; 181078830 bytes.
- Project-Web-Pilot-0.6.39-Windows-x64.zip: SHA-256 780b5cdefbbf12145f0cf3d85f79741c756646a73b40c514a85dfdb85e5149f3; 316326784 bytes.

Оба ZIP прошли integrity и проверку app.asar. Копии с SHA256SUMS.txt и INSTALL.txt находятся в ~/Downloads/WebPilot-0.6.39/. Evidence — .harness/runtime/releases/0.6.39/{mac-release.json,source-verification.json,release-manifest.json}. Сборка не перезапускала рабочее приложение и не меняла профиль/ключи.

В 0.6.39 macOS-мастер автоматически распознаёт новый скопированный ID, затем ключ; завершённые шаги скрываются. Plugins — помощь по необходимости. Chat/Work применяют preview сразу, healthy preview не показывает Doctor/Recheck, NONE не дублируется. 0.6.38 принята пользователем на абсолютно чистой macOS; новый реальный проход 0.6.39 и native Windows пока не подтверждены. На Windows общие изменения UI упакованы, но платформенный мастер и его автоматический tunnel flow не заявляются проверенными.

## Выпуск 0.6.40 — сохранённое расположение проектов

После принятой пользователем 0.6.39 изменено только создание нового проекта.
При первом выборе папка не задана: доступно «Выбрать расположение папки для проектов».
После выбора появляется имя. Расположение сохраняется в локальных настройках для
следующих проектов и перезапусков; кнопка «Изменить расположение папки для проектов»
заменяет его. Отмена сохраняет прежний выбор; уже существующие проекты не перемещаются.

Собраны macOS arm64 и Windows x64. Постоянный корневой app обновлён до 0.6.40;
Info.plist и app.asar подтверждают версию. Filesystem identity сохранена:
{'device': 16777230, 'inode': 398344301}. app.asar установленного app, staging и ZIP совпадает.
Все 38 файлов src и 32 файлов resources совпадают с исходниками в обеих поставках и установленном app; сверены 4 файла mac-tools. Вложенного прежнего app нет.

- Project-Web-Pilot-0.6.40-macOS-arm64.zip: 181079130 bytes, SHA-256 `6e2744190ef63bada5705545d60e9cc55f7783c13d9e53d76cfa95b88cf09589`.
- Project-Web-Pilot-0.6.40-Windows-x64.zip: 316327092 bytes, SHA-256 `c2961ca920281188795f10db2c7cb8f134229ffd68bf2885c9040f23816d728e`.

Оба ZIP проверены и скопированы в ~/Downloads/WebPilot-0.6.40/ вместе с SHA256SUMS.txt
и INSTALL.txt. Evidence: .harness/runtime/releases/0.6.40/{mac-release.json,
source-verification.json,release-manifest.json}. Работающее приложение не
перезапускалось; для применения требуется полный выход и новый запуск.
Пользовательская проверка этого изменения и нативный Windows-запуск ещё предстоят.

## Сверка при закрытии плана 031 — 18.09.2026

Повторно вычислены SHA-256 обоих ZIP 0.6.40 в каталоге выпуска и в ~/Downloads/WebPilot-0.6.40/: все четыре файла совпадают с приведёнными выше контрольными суммами и размерами. Info.plist постоянного app подтверждает 0.6.40; SHA-256 его app.asar — 29d4b3a683029090412e16307bcda15d15e2e51c88285341122babb6e34b64b1, совпадает с проверенной поставкой.

С release commit 978e6613e6ff4285083911a6d137cb12d37660cb функциональные src/resources/scripts/tests и package.json/package-lock.json не изменились. Выполняются документальное закрытие и синхронизация исходников с GitHub; новый номер и повторная сборка приложения не требуются. ZIP остаются отдельной локальной поставкой; git push не является публикацией бинарных GitHub Releases.

## Текущая точка выдачи

Историческая сверка поставки 0.6.40; актуальная парная поставка 0.6.41 описана ниже. Более ранние версионные разделы сохраняют состояние на момент соответствующего выпуска; ожидавшиеся тогда проверки не заменяют текущий итог в docs/CLEAN_INSTALL.md.

## Парный выпуск — поручение 18.09.2026 / scope 033

Начиная с 0.6.41 единый npm run build должен последовательно собрать обе платформы, проверить общий номер версии и соответствие исходникам, обновить постоянный macOS app и подготовить оба ZIP с SHA256SUMS.txt и INSTALL.txt в ~/Downloads/WebPilot-<version>/. Если одна платформа не собрана или не прошла проверку, полный комплект не объявляется готовым. Платформенные build:mac/build:win остаются узкими операциями; публичный результат задачи — парный комплект.

Парный publisher реализован: `npm run build` собирает обе платформы 0.6.41;
состав и версия сверяются до общего manifest. Промежуточный macOS ZIP от
build:mac ещё не означает готовность пары. Итог: два ZIP, SHA256SUMS.txt,
INSTALL.txt и release-manifest.json в ~/Downloads/WebPilot-<version>/.

R002 завершён: единый парный выпуск 0.6.41 создан командой `npm run build`.
Оба ZIP доставлены в ~/Downloads/WebPilot-0.6.41/ и сверены. Windows включает
native first-run worker, общий мастер и комплектный Git; macOS app обновлён
по постоянному пути с сохранением identity. Общий manifest фиксирует отсутствие
native Windows/clean VM приёмки; пользователь выполняет её самостоятельно.

## Выпуск 0.6.41 — Windows onboarding и единая сборка

18.09.2026 выпущена **0.6.41** для macOS arm64 и Windows x64 одной командой `npm run build`; ZIP находятся в ~/Downloads/WebPilot-0.6.41/. Windows теперь получает общий мастер первого запуска: комплектные Python/Git/MCP, туннель, инструкция Codex Local Windows MCP в ChatGPT и первый проект. Секреты сохраняются в существующем защищённом хранилище Windows; ручной ввод использует системный диалог. macOS сохраняет прежний путь, номер синхронизирован. Выбор расположения проектов из 0.6.40 сохранён. Исходники и упаковки сверены; реальный запуск, подключение и все проверки в гостевых системах пользователь проводит сам. Computer Use и запуск VM агентом прекращены по его прямому поручению.

- Project-Web-Pilot-0.6.41-macOS-arm64.zip: 181060637 bytes; SHA-256 `3fe1c59871c420eac939b2ca23998f8e5c66842434dbf7fe22c51f8231dedc00`.
- Project-Web-Pilot-0.6.41-Windows-x64.zip: 316332963 bytes; SHA-256 `8830efbfe1fe339f724709a0a1e4c3818fa0df0a2dd794b01d83d31429e597ac`.

Общая команда `npm run build` завершилась успешно. Оба ZIP проверены на целостность; app.asar внутри архивов совпадает со staging; все src/resources сверены с исходниками. Постоянный корневой Mac app имеет версию 0.6.41 и прежнюю filesystem identity: device 16777234, inode 398344301. Копии в Downloads сверены по SHA-256. Evidence: `.harness/runtime/releases/0.6.41/release-manifest.json`; общий журнал `.harness/runtime/033-build.log`.

Запуск новой готовой сборки на пользовательских Mac/Windows и подключение аккаунта не выполнялись агентом по последнему поручению. Packaged source verification не считается приёмкой. Ранее начатый локальный изолированный Electron fixture завершился успешно; это не Windows guest test.

## Парный выпуск 0.6.42 — 19.09.2026

Общий мастер Mac/Windows исправлен: последовательные шаги ID туннеля и API key,
видимая кнопка API keys, инструкция создания/копирования/вставки ключа. ID принимается
отдельно; ручной путь больше не запрашивает оба значения двумя окнами подряд.
C002 suite и Electron TEST FIXTURE smoke прошли. Пакетные версии подняты совместно;
фактические архивы и контрольные суммы после npm run build приведены ниже.

- Project-Web-Pilot-0.6.42-macOS-arm64.zip: 181061334 bytes; SHA-256 `feb5ab274b55c920b2742e6c025254fd00cec85187ba196040f785f8bb9cb2e9`.
- Project-Web-Pilot-0.6.42-Windows-x64.zip: 316333671 bytes; SHA-256 `91308bae3a9f76db1f33cff21df1443db5faaea415362bd01b6b9eea8c645796`.

Каталог выдачи: `~/Downloads/WebPilot-0.6.42/`. Manifest: `.harness/runtime/releases/0.6.42/release-manifest.json`. Лог сборки: `.harness/runtime/033-build-042.log`.

Source commit `e93db24548b824900a7523e192f4e3e8f2dddd79`; 74 файлов зафиксированы, src/resources и runtime manifest совпадают в обеих упаковках. ZIP integrity и asar внутри архивов проверены, SHA копий в Downloads совпадают. Постоянный app версии 0.6.42 совпадает со staging; сохранена identity: device 16777232, inode 398344301. Native Windows и чистые VM не запускались, новый реальный проход выполняет пользователь.

## Парный выпуск 0.6.43 — системный ввод ID

Кнопка «Вставить ID туннеля» открывает отдельное системное поле на Mac и Windows.
Пустой/недоступный буфер не вызывает предварительную ошибку; отмена не меняет
настройки, подтверждение открывает инструкцию API key. Полные suite и Electron
fixture прошли; версия обеих платформ и packager синхронизирована на 0.6.43.

- Project-Web-Pilot-0.6.43-macOS-arm64.zip: 181062445 bytes; SHA-256 `e7eda01af7ca83b72fed55cf9d1dd8f5108cc50ff5d05d2389bbe7c2aaccf368`.
- Project-Web-Pilot-0.6.43-Windows-x64.zip: 316334779 bytes; SHA-256 `7b3c0e12a509ee2cca688e33460ae5768a0eeb0b76410f39f83250cfda08f66c`.

Единая сборка npm run build завершена. Каталог: `~/Downloads/WebPilot-0.6.43/`; manifest: `.harness/runtime/releases/0.6.43/release-manifest.json`; журнал: `.harness/runtime/033-build-043.log`. Source commit `3981d61b1ac3aebfcb50eeb247f8e81c069a6f59`, 74 файлов snapshot; исходники/resources обеих платформ, версии, ZIP integrity, app.asar архивов и хеши копий сверены. Постоянный Mac app 0.6.43 совпадает со staging, identity сохранена: device 16777232, inode 398344301. Native Windows/чистые VM не запускались; новый ручной проход выполняет пользователь.

0.6.44 / E004: подготовлены общие package/lock и app-version для обеих платформ,
персональный author пакета удалён. Следующий шаг — штатный парный npm run build.

0.6.44 / E005: npm run build завершён. macOS arm64 и Windows x64 собраны из
cd9569e50dd6347a8b7047480e781d940ca33a75; все 74 файла snapshot совпали с
обеими упаковками и постоянным Mac app. Архивы прошли integrity/ASAR и проверку
копий в Downloads/WebPilot-0.6.44. Версия постоянного app — 0.6.44, inode
398344301 сохранён. Manifest: .harness/runtime/releases/0.6.44/release-manifest.json.

0.6.44 / E006: подготовлена публикация в существующий origin
https://github.com/OleynikAleksandr/Project-Web-Pilot. Доступ подтверждён через
существующую Git-авторизацию; репозиторий публичный. Тег v0.6.44 свободен.
После финальной DOCS выполняются обычный push main/tag, загрузка обоих ZIP,
INSTALL.txt, SHA256SUMS.txt, release-manifest.json в draft, сверка размеров и
серверных SHA-256, затем публикация релиза. Локальные runtime/key/profile и app
bundle не входят в исходный Git push.

## Парный выпуск 0.6.44 — 19.09.2026

Удалены автор/email из создания проекта и персональный author пакета. Мастер
обеих платформ выделяет подключение MCP в ChatGPT перед первым проектом.

- Project-Web-Pilot-0.6.44-macOS-arm64.zip: 181062714 bytes, SHA-256 `0b186bcecb3138be24cda924463dd62bb43c82a137cf8951d3056ddcfdd05db1`.
- Project-Web-Pilot-0.6.44-Windows-x64.zip: 316335016 bytes, SHA-256 `bdc66bd4c8beb4f366c3450d6a120e0d43b81b6dd6f723a97306c564c7484f14`.

Source build commit: `cd9569e50dd6347a8b7047480e781d940ca33a75`. Все 74 файлов snapshot
совпали с обеими поставками и установленным Mac app; ZIP integrity и ASAR
подтверждены. Постоянный app имеет версию 0.6.44 и сохранил device
16777232 / inode 398344301. Архивы, INSTALL.txt, SHA256SUMS.txt и
release-manifest.json находятся в ~/Downloads/WebPilot-0.6.44/. Локальные evidence:
.harness/runtime/releases/0.6.44/.

Пользователь выполняет Windows-проверку сам. В прежнем тестовом чате был доступен
только Mac-коннектор; отдельное подключение Windows не было создано. Работа
Windows-туннеля и запись файла не объявляются подтверждёнными по упаковке.

GitHub: [v0.6.44](https://github.com/OleynikAleksandr/Project-Web-Pilot/releases/tag/v0.6.44). По прямому поручению пользователя публикуются
обычный push main, тег v0.6.44 и оба ZIP с сопроводительными файлами. Тег указывает
на финальный DOCS commit; отличие от source build commit — только документы и
план. Публикация выполняется после DOCS, затем проверяются main, tag и assets.

## Парный выпуск 0.6.45 — 19.09.2026

Дополнение из прежних инструкций агента: создание проекта не запрашивало автора/email. Пользователь оставил живые проверки себе; наличие Windows MCP на снимке не подтверждало запись файла. Scope first-run-onboarding-031 закрыт по отдельному поручению 18.09.2026, first-run-corrections-032 этим не менялся; windows-onboarding-033 выполнялся в сессии 01a0b501-9a29-7b30-87a1-036ded275092. Это история прежней session-owned модели, не адресация текущего плана.

В общем мастере Mac/Windows добавлен видимый блок режимов Permissions. Отдельный
шаг создания MCP в ChatGPT присутствует на обеих платформах, включая новый Mac.

- Project-Web-Pilot-0.6.45-macOS-arm64.zip: 181063158 bytes; SHA-256 `445dd534e7f3c57af0d5c8c2f5dd79afe80c671d9b67aa741e644cb479ef1fdd`.
- Project-Web-Pilot-0.6.45-Windows-x64.zip: 316335461 bytes; SHA-256 `2cea4843ecf24e5154ea27c05326ec0eadfd286f995ca66ee6392949117bfb1e`.

Source build commit: `3f77599e5281b60e0e34fbb104785e83bebf52f5`. Все 74 файла snapshot
сверены с обоими пакетами и установленным Mac app. Проверены ZIP integrity, ASAR
и копии в ~/Downloads/WebPilot-0.6.45/. Постоянный Mac app имеет версию 0.6.45;
device 16777232 / inode 398344301 сохранены. Evidence:
.harness/runtime/releases/0.6.45/release-manifest.json.

Пользователь считает план завершённым. Скриншот 09.53.24 показывает Windows MCP
в настройках аккаунта. Проверки сборки не подменяют отдельное испытание записи
файла в Windows; агент VM не запускал и Computer Use не использовал.

Публикация: [v0.6.45](https://github.com/OleynikAleksandr/Project-Web-Pilot/releases/tag/v0.6.45).
По прямому поручению пользователя main, тег и оба ZIP публикуются после DOCS.
Тег указывает на финальный DOCS commit; отличие от source build commit — только
документы и план. После загрузки проверяются серверные SHA-256 и набор assets.

## Парный выпуск 0.6.46 — chat-layout-regression-034 / 19.09.2026

Исправление `e1760c49166cf906eb0cb3db7b6aab39830540e5` адаптирует скрытие tool calls:
tool-only message/turn boundary исключается из layout целиком, а mixed assistant/user
message сохраняет содержательный корень. Версия package/lock и обеих платформ — 0.6.46.

- Project-Web-Pilot-0.6.46-macOS-arm64.zip: 181063171 bytes; SHA-256 `7d511780464ac809adef2e0d6a47a58c78ceeb12e7c445804e615bd3bba3c41a`.
- Project-Web-Pilot-0.6.46-Windows-x64.zip: 316335471 bytes; SHA-256 `a2e5a544b1345a5b178329a11f691f6f905ed7471d646502e9cff47584c00c96`.

Source build commit: `ba9819ab5b241a979afcd543671d2c2fb09252f0`; 74 source files сверены
с обеими упаковками (`packagedSourceMatches=true`). ZIP integrity и ASAR внутри
архивов проверены. Постоянный Mac app обновлён до 0.6.46 и сохранил device
16777232 / inode 398344301. Manifest: `.harness/runtime/releases/0.6.46/release-manifest.json`;
копии для передачи: `~/Downloads/WebPilot-0.6.46/`.

Native Windows и clean VM для 0.6.46 не запускались; изменение проверено автоматическими
fixtures, а реальный текущий DOM ChatGPT остаётся пользовательской приёмкой. GitHub
Release 0.6.46 не создавался: публикация требует отдельного поручения пользователя.


## Парный выпуск 0.6.47 — выбор macOS MCP runtime / 19.09.2026

В macOS Settings действует взаимоисключающий выбор **Codex Local Mac / Codex App Server Local Mac**. Исправленная 0.6.47 оставляет в ChatGPT один стабильный Secure MCP Tunnel/connector: старый `com.oleynik.CodexLocalMac` LaunchAgent disabled в обоих modes, выбранный backend запускается MCP-only, а `com.oleynik.WebPilotCodexExecutor` retarget-ит один private tunnel на фактический loopback MCP endpoint. Mode сохраняется и после переключения приложение relaunch-ится. Если stable private tunnel ещё не создан, его ID/key локально импортируются из существующего Codex Local Mac private state без публикации секрета.

Codex App Server MCP теперь является физическим extra-resource релиза: `Contents/Resources/codex-app-server-mcp` на macOS и `resources/codex-app-server-mcp` на Windows. Release verifier сравнивает четыре файла resource с source SHA-256 в staging, установленном Mac app и непосредственно внутри обоих ZIP. Внутрь ASAR этот каталог не дублируется.

Проверки перед сборкой:
- полный Node suite: **325 tests / 323 passed / 0 failed / 2 Windows-only skipped**;
- Electron isolated fixture: exit 0, полный smoke result получен;
- release regression: 7/7 passed.

`npm run build` завершён успешно; 79 source files сверены с обеими упаковками и постоянным Mac app (`packagedSourceMatches=true`).

- Project-Web-Pilot-0.6.47-macOS-arm64.zip: 181097186 bytes; SHA-256 `c82554c36d553ef92a03649ddcd5ccc82315c34e935dc7d23673f674e7b660e6`.
- Project-Web-Pilot-0.6.47-Windows-x64.zip: 316367350 bytes; SHA-256 `8fcdd36743ef91e3eb89951f4267eebd3d22fb10f6fb4149100f0cf489ffcce4`.

Source build commit в manifest: `acde362fc75645dff20f2e494604d9b2b5289403` (stable-connector T001). Постоянный `Project Web Pilot.app` имеет версию 0.6.47 и сохранил identity: device 16777234 / inode 398344301. macOS ASAR SHA-256: `b72c7adea0aec363d0fd51f152b388bf77a40aeb30bb318a18116e7b9d3f1b32`; Windows ASAR SHA-256: `7435d127206a8e2b54f65c5872e7d9bbee04ccf353027fff51e25064d5d13e3b`. Предварительная 0.6.47 сохранена локально только как backup `.harness/runtime/release-backups/paired-0.6.47-pre-stable`; текущая delivery полностью заменена исправленной сборкой.

Каталог выдачи: `~/Downloads/WebPilot-0.6.47/`. Manifest: `.harness/runtime/releases/0.6.47/release-manifest.json`. GitHub Release 0.6.47 не публикуется без отдельного поручения пользователя. Native Windows и clean VM для 0.6.47 не запускались; Windows package verification выполнен на macOS build host.

## Локальный парный выпуск 0.6.48 — 25.09.2026

Дополнение из прежнего AGENTS: live Chat/Work recovery и MCP hide/show проверены на macOS; Node suite — 335 PASS / 2 SKIP, Electron smoke — PASSED. Native Windows/reboot не проверены.

Окончательная `npm run build` завершилась успешно после исправления переходного
URL в живой проверке. Source commit: `377d5c42377c590ffa6a3eb7035d80cf32553b2c`.
Сверены 81 исходный файл, обе упаковки и установленный корневой Mac app;
версия app — 0.6.48, filesystem identity сохранена (device 16777234,
inode 406420885). ZIP прошли проверку целостности; ASAR и комплектный executor
соответствуют staging. Предварительная внутренняя сборка до H005 убрана
из поставки в локальный backup и не является финальным релизом.

Поставка: `~/Downloads/WebPilot-0.6.48/` — два ZIP, `INSTALL.txt`,
`SHA256SUMS.txt`, `release-manifest.json`.

| Платформа | Размер, байт | SHA-256 ZIP |
| --- | ---: | --- |
| macOS arm64 | 181155569 | `8dba85eebb9e3ee3de9807a617e0ab341015f7c3711532deb64c57486458d0f3` |
| Windows x64 | 316423743 | `05bee11b5cbf0a9d4d27a9d36ec1620949cdf1f09e08b9ac5eba287e86b6a6d5` |

Изменения: общий адаптер нового ChatGPT DOM, Chat/Work и переходные URL,
структурный фильтр служебных карточек, цвета новых сообщений, стабильная
автопрокрутка, полный номер в sidebar, завершение UI без остановки MCP/tunnel,
постоянный Windows autostart при входе пользователя. Результаты живых проверок
и границы Windows/login описаны в VERIFICATION.md. Публикация на GitHub в этом
поручении не выполнялась. Постоянный путь запуска — корневой
`Project Web Pilot.app`; отдельные физические копии, например на Desktop,
этой сборкой не обновляются.

## Локальный парный выпуск 0.6.49 — 25.09.2026

PlanMonitor читал план независимо от ContextSession; smoke выполнял реальные task:start/commit на fixture при отменённом контроллере доставки без дополнительного recovery. composerBackground окрашивал editor, не внешнюю поверхность. Форматы проектов/сессий и службы не менялись.

`npm run build` завершилась успешно. Source commit: `6adbb3c5c02fca46f5f66de42c151f647b67ff8a`.
Сверены 82 исходных файлов, ASAR и executor обеих упаковок;
ZIP проверены на целостность. Постоянный корневой Mac app обновлён до 0.6.49
с сохранением filesystem identity. Поставка: `~/Downloads/WebPilot-0.6.49/`.
Workflow Kit остаётся 1.4.1; изменения относятся к отображению плана и цвету поля.

| Платформа | Размер, байт | SHA-256 ZIP |
| --- | ---: | --- |
| macOS arm64 | 181156165 | `75b7874b3ff2d331e93c4c3e71251fe1ffa4deef91f5af2bd604a348d69a21de` |
| Windows x64 | 316424342 | `f1b129014701b73f103dea6f0749c890b99d85c10b5b07e8da463519520fdde4` |

Проверки и ограничения — VERIFICATION.md. Native Windows и reboot не запускались.
Публикация GitHub не выполнялась. Запускать корневой app после полного выхода
из прежней версии; отдельная физическая Desktop-копия не обновляется.

## Локальный парный выпуск 0.6.50 — 25.09.2026

Исправление этого выпуска использовало data-composer-body для полной скруглённой composer-плашки: editor внутри прозрачный, внешний ModeSurface не закрашивался. PlanMonitor сохранён. Последующая корректировка поиска плашки описана в 0.6.55.

`npm run build` завершилась успешно. Source commit: `e6a71a6256f7e3936738be793d16122cb3df2b9d`.
Сверены 82 исходных файла, обе упаковки, ZIP integrity и постоянный
корневой Mac app. Поставка: `~/Downloads/WebPilot-0.6.50/`.

| Платформа | Размер, байт | SHA-256 ZIP |
| --- | ---: | --- |
| macOS arm64 | 181156262 | `94bc7485f8ed3af81a3770639d1bc7f2ea999865d3b422f41db83a6a7a2ef050` |
| Windows x64 | 316424444 | `7c8d323c4bf9a64c3cc7d9b418926102e9459962924c8d6bfc8e9420cdbf1281` |

Также штатным installMacBundle обновлена фактически используемая копия
`/Applications/Project Web Pilot.app` до 0.6.50 с сохранением identity
(inode 406538347), сверкой bundle и резервной копией прежнего Contents.
Живые Chat/Work изображения просмотрены до сборки, packaged source совпадает.
Kit 1.4.1. Native Windows не запускалась, GitHub не публиковался.

## Локальный парный выпуск 0.6.51 — 25.09.2026

В шаге «Первый проект» доступны создание нового и подключение существующей папки; повторная готовность, preview/apply и сохранение файлов использовали прежний путь. Расположение выбиралось перед именем и сохранялось для следующих проектов; Chat/Work применял preview и открывал первую сессию одним действием.

`npm run build` прошла, source commit `efaae0bfcf49c836b3eac8d289e15ada57057711`.
Оба пакета сверены с исходниками, ZIP integrity и ASAR подтверждены.
Корневой app и /Applications/Project Web Pilot.app обновлены с сохранением
identity; предыдущий Contents установленной копии сохранён в backup.
Поставка: `~/Downloads/WebPilot-0.6.51/`. Kit 1.4.1, GitHub не публиковался.

| Платформа | Размер, байт | SHA-256 ZIP |
| --- | ---: | --- |
| macOS arm64 | 181156393 | `e577a2b0fe333b0c3589038fd081b917d9cf936cecf1a93782e0b67ac4eb2726` |
| Windows x64 | 316424573 | `c6ca825b3e07de3154548e6d07f60e0bb8c57307078f3995e24376e7fa2b9a87` |

## Локальный парный выпуск 0.6.52 — 25.09.2026

Происхождение Kit: CodeAppServer+WebChatGPT, ветка codex/gpt-provider-names, commit badcf20; SHA-256 закреплялся тестом. Upgrade проектов 1.4.1 создавал backup; собственный установленный Kit обновлялся отдельным поручением. Scope 038 относился к исторической сессии cowork-kit-1411.

Поставляемый Workflow Kit обновлён до **1.4.11** (новые и подключаемые проекты); собственный Kit репозитория — 1.4.1. `npm run build` прошла на Mac, source commit `55b3b5cebe241d577d4c1dd755b1ee4504696c8e`, 94 исходных файла совпали с упакованными. ZIP integrity и ASAR подтверждены. Корневой `Project Web Pilot.app` обновлён с сохранением identity (inode 406600483); штатным installMacBundle обновлена и фактически используемая `/Applications/Project Web Pilot.app` (inode 406571340 сохранён, прежний Contents — в `.harness/runtime/release-backups/mac-HQlclI`). Поставка: `~/Downloads/WebPilot-0.6.52/`, `shasum -c SHA256SUMS.txt` — OK. Native Windows не запускалась, GitHub не публиковался.

| Платформа | Размер, байт | SHA-256 ZIP |
| --- | ---: | --- |
| macOS arm64 | 181201009 | `bbe2bb203044f8d48e9983beb9eb24856bd85f0a9a23d70636c6786bb97555e0` |
| Windows x64 | 316463282 | `cb7586160c020dc2dccd2719afc47861c9024692a745f399db208289172ec839` |

ASAR: macOS `07fa66abf30614d04053cc5b257423a5653f78ff77875f936bc324ddf4ff0212`, Windows `21459b07b0ec3eafbd399687356acd11f47b14e4568ff15669c107fad7be7fb0`.

## Локальный парный выпуск 0.6.53 — 25.09.2026

Тест runtime закреплял SHA-256 5464b2c1528eef1de740af50558bc8db1d39cfa7838f9c032d23650fb4f5f119. На момент выпуска исправление не было перенесено в исходный Kit CodeAppServer; это историческое ограничение источника 1.4.12.

Поставляемый Workflow Kit — **1.4.12** (1.4.11 из CodeAppServer `badcf20` + исправление планов сессий): план, созданный `plan:create --session` из NONE, хранится в `.harness/plans/by-session/<сессия>.md` и теперь виден `listPlans`, сайдбару, готовности проекта, полному контексту и Доктору. Приложение принимает проекты 1.4.11 как обновляемые: уведомление в сайдбаре предлагает «Обновить Workflow Kit» (preview → резервная копия → upgrade). Статус локальных инструментов в уже доставленном чате берётся из фактического состояния runtime (MCP + туннель), а не только из флага сессии. Собственный Kit репозитория по-прежнему 1.4.1.

`npm run build` прошла на Mac 18:04–18:08 UTC, source commit `f8c11a8`, 94 исходных файла совпали с упакованными. Корневой `Project Web Pilot.app` — 0.6.53 (inode 406600483 сохранён); `/Applications/Project Web Pilot.app` обновлена штатным installMacBundle (inode 406571340 сохранён, прежний Contents — в `.harness/runtime/release-backups/mac-K3LhAA`). Поставка: `~/Downloads/WebPilot-0.6.53/`, `shasum -c SHA256SUMS.txt` — OK. Native Windows не запускалась, GitHub не публиковался.

| Платформа | Размер, байт | SHA-256 ZIP |
| --- | ---: | --- |
| macOS arm64 | 181201503 | `d3629f05b263b498297c76ee179731310957b0ef25a560b40dc1ee036116abaa` |
| Windows x64 | 316463768 | `bb09b89a0a5a6669326dbf176a3fe56df2f77d6c78f6c52bb68576e703e0f7b4` |

ASAR: macOS `2de04d7ce060c6e557de38ad1402fe5946a08f8c9587cec8ed2a31492255c523`, Windows `8681534787590d7516e030ada82b8daaa852fc610db2f61482730246a8deb995`.

## Локальный парный выпуск 0.6.54 — 26.09.2026

Первоначальная реализация таймера: src/agent-timer.mjs, секундный опрос Stop выбранной сессии; завершённые задания суммировались в session store (agentTime), текущее передавалось как selected.agentRun. Позже наблюдение переведено на события.

Таймер работы агента: справа в заголовке карточки «План этой сессии» — `mm:ss · Σ mm:ss`, время текущего (или последнего) задания и сумма за сессию. Замер идёт, пока ChatGPT показывает кнопку Stop; паузы до 5 с — то же задание. Сумма хранится в session store и переживает перезапуск. Поставляемый Workflow Kit — 1.4.12, собственный Kit репозитория — 1.4.1.

`npm run build` прошла на Mac 07:50–07:55 UTC, source commit `0fa62de`, исходные файлы совпали с упакованными. Корневой `Project Web Pilot.app` — 0.6.54 (inode 406600483 сохранён); `/Applications/Project Web Pilot.app` обновлена штатным installMacBundle (inode 406571340 сохранён, прежний Contents — в `.harness/runtime/release-backups/mac-aZY2Vh`). Поставка: `~/Downloads/WebPilot-0.6.54/`, `shasum -c SHA256SUMS.txt` — OK. Native Windows не запускалась, GitHub не публиковался.

| Платформа | Размер, байт | SHA-256 ZIP |
| --- | ---: | --- |
| macOS arm64 | 181203572 | `f0a522f78743f533ebbde895bc8cf497d8b1465b1037f2fb147508e8e401e3fe` |
| Windows x64 | 316465854 | `1b11f152cf5a68f492c446714402192461ae1d1354db9c153b178eeab5613c9e` |

ASAR: macOS `4ea68c0ac2a16691e07fb97a7ba74c60fbf1ce258086ab482434a75c5122dec6`, Windows `13512313090468dfee7ef63eba8e01a1bf141f0be802f5a47e83c617dcc2560d`.

## Локальный парный выпуск 0.6.55 — 26.09.2026

Деталь реализации: installComposerCapsule помечал ближайшего скруглённого предка редактора data-web-pilot-composer-capsule, внутренние прямоугольные обёртки — data-web-pilot-composer-inner. Заливка не должна зависеть от data-composer-body/ComposerLayoutRoot; реальный DOM после входа проверяется отдельно.

Цвет поля ввода из настроек закрашивает только скруглённую плашку (радиусные края слева и справа): плашка находится по скруглению ближайшего предка поля ввода, прямоугольные обёртки внутри неё прозрачны. Раньше в чатах `/c/…` закрашивался прямоугольный `data-composer-body`.

`npm run build` прошла на Mac 12:24–12:28 UTC, source commit `ca577f2`, исходные файлы совпали с упакованными. Корневой `Project Web Pilot.app` — 0.6.55 (inode 406600483 сохранён); `/Applications/Project Web Pilot.app` обновлена штатным installMacBundle (inode 406571340 сохранён, прежний Contents — в `.harness/runtime/release-backups/mac-DYMCHn`). Поставка: `~/Downloads/WebPilot-0.6.55/`, `shasum -c SHA256SUMS.txt` — OK. Native Windows не запускалась, GitHub не публиковался.

| Платформа | Размер, байт | SHA-256 ZIP |
| --- | ---: | --- |
| macOS arm64 | 181204557 | `a04b4b62668034a97bc198a15fc8180e0525b1df933e1ce6d7d49814221a1b08` |
| Windows x64 | 316466837 | `08a0af2f396c2fa6067200f4837b6ffe7bb9775ed751c9344aad25e5eecd4c36` |

ASAR: macOS `6206d848870ea871138a40cdc008aac1928154c1541b311de42677abfcdf32a5`, Windows `0772fef3a6c784247d30602b33a9003daa1caa61dec872455c3af1708c5d215e`.

## Локальный парный выпуск 0.6.56 — 26.09.2026

Workflow Kit переведён на canonical `@webpilot/workflow-kit@1.4.12`; tracked duplicate удалён, packaged runtime автоматически stage-ится из package. После managed package commit `a581e250f9baf3e79ff688381fc44fe1c8e4e849` парный `npm run build` повторён из уже зафиксированного HEAD: `sourceCommit` в финальном manifest совпадает с этим commit, `packagedSourceMatches: true`. Runtime Kit в обеих поставках: 35 файлов, SHA-256 `5464b2c1528eef1de740af50558bc8db1d39cfa7838f9c032d23650fb4f5f119`.

Корневой `Project Web Pilot.app` обновлён до 0.6.56 с сохранением inode `406600483`. Поставка: `~/Downloads/WebPilot-0.6.56/`; оба ZIP прошли integrity check.

| Платформа | Размер, байт | SHA-256 ZIP | ASAR SHA-256 |
| --- | ---: | --- | --- |
| macOS arm64 | 181302932 | `5bdda7cb444b19dd581bef122812077fed75585d8b5f533be54994fa24ec36bb` | `b135d03e2833f5802852d1f38813f831392f354090d5cd9880cc4333844d0ee7` |
| Windows x64 | 316565254 | `57b5e226ee3db64db653e78379ddb7b25aac7c749dd2e0229b6888e2e268811e` | `5fda451f7bfc3650883457018a5d5dc5cb0932f48d6bc938a5452a8bc70513fd` |

Windows package verifier подтвердил PE, portable Node, Windows runtime и Workflow Kit 1.4.12 / 35 files / expected digest. Native Windows и clean VM в этом выпуске не запускались; это остаётся пользовательской проверкой.

## Локальный парный выпуск 0.6.57 — 27.09.2026

Project Web Pilot обновлён до canonical `@webpilot/workflow-kit@1.4.13`. Workspace Setup и Project Doctor принимают целостную установку 1.4.12 как штатно обновляемую до 1.4.13; prepared-plan recovery до `plan:bind` поддерживается новым Kit. Адресный regression `1.4.12 → 1.4.13` сохраняет canonical session plans и завершает upgrade с чистым Git-деревом.

Финальный парный `npm run build` выполнен из подтверждённого source commit `c0545f53828291a3b652a590aa35852085f10884`; `packagedSourceMatches: true`. Workflow Kit в обеих поставках: 1.4.13, 35 файлов, SHA-256 `da763a50c32583553b6ca06e29c975766ab092890bbf9787bd2a6aca87be44c4`. Корневой app и `/Applications/Project Web Pilot.app` обновлены до 0.6.57 с сохранением inode. Поставка: `~/Downloads/WebPilot-0.6.57/`.

| Платформа | Размер, байт | SHA-256 ZIP | ASAR SHA-256 |
| --- | ---: | --- | --- |
| macOS arm64 | 181323407 | `22db6f3876bcbb2524a50c80fae41601588a7ce27aea21df6bd39cfb7cdd6f96` | `533e2036be402edd3be20d365d13eee99a9a0db62234ecc7de49536154fb1996` |
| Windows x64 | 316585724 | `edeafce525d30f5c7d92c49206873acc02641e979fa447948b28a1a533cc5989` | `395e696d76e1684101782eddcee4c75255dcf513c812d1bc3935284d8a07e02b` |

Оба ZIP прошли integrity check. Windows package verifier подтвердил PE, portable Node, Windows runtime и Workflow Kit 1.4.13. Native Windows и clean VM не запускались.

## Локальный парный выпуск 0.6.58 — 27.09.2026

Главное изменение — переход на **single active plan**: один Git checkout/worktree = один current `.harness/plans/todo-plan.md`. Web Pilot sessions сохраняют chat URL/title/Chat|Work/history, но больше не владеют и не выбирают Workflow Kit plan. Prepared-plan/bind/adopt UI/lifecycle удалены; Workflow Kit 1.5.0 архивирует legacy `by-id` / `by-session` и сохраняет compatibility `--session` как no-op.

Canonical `@webpilot/workflow-kit@1.5.0`: 35 runtime files, SHA-256 `0db567df6f0c8f68f3119a7322b4c1c6d28cd06bf57b267993b792097bbb2c75`. Финальный `npm run build` выполнен из чистого source commit `c135f1a523bdd5dc1c26a5e8ca72327866a093e0`; release manifest: `sourceFiles=95`, `packagedSourceMatches=true`. Поставка: `~/Downloads/WebPilot-0.6.58/`.

| Платформа | Размер, байт | SHA-256 ZIP | ASAR SHA-256 |
| --- | ---: | --- | --- |
| macOS arm64 | 181471570 | `a80df450f37d92dc682ca8b085eeeae2b6024bbd16a01c67c7fb26fcd02dab4f` | `960269dc66032aafdf51ca2f29f1abcd4de851902265b9a115aafcaf3d70f968` |
| Windows x64 | 316733865 | `bd338add3a7d24520ee1fe5722b932580e78118de15ac7f11b48f72200c96f2a` | `d3db825afed890281eec2515c74e32a6040dfedfc879415ebdc8221215b9bfa7` |

Оба ZIP прошли integrity check. Корневой `Project Web Pilot.app` и `/Applications/Project Web Pilot.app` имеют CFBundleShortVersionString 0.6.58 и одинаковый ASAR; inode постоянного root app сохранён: `406600483`. Windows verifier подтвердил `Project Web Pilot.exe` SHA-256 `7662af0bd92befccd9217ca67ecdbf43bd3c16a46de76c31ece373da3269fe50`, portable Node SHA-256 `721ab118a3aac8584348b132767eadf51379e0616f0db802cc1e66d7f0d98f85` и Windows runtime SHA-256 `1f041488ad97d8abf1984fd3521afb8abe15f50b8df3d3e11f1cc4248e019d98`. Native Windows и clean VM не запускались.


## Локальный парный выпуск 0.6.59 — 28.09.2026

Session title стал chat-owned metadata поверх сохранённой single-active plan модели. Auto-name использует `objective`/`nextTaskTitle`, manual rename имеет приоритет, а exact bound conversation получает то же server-side имя в native ChatGPT. Workflow Kit остаётся 1.5.0.

Финальный `npm run build` повторён из чистого source commit `eabeea2359821a34c380a1904f902f18474adfd6`; release manifest: `sourceFiles=96`, `packagedSourceMatches=true`. Поставка: `~/Downloads/WebPilot-0.6.59/`; `shasum -c SHA256SUMS.txt` — OK. Корневой и `/Applications/Project Web Pilot.app` — 0.6.59, одинаковый macOS ASAR `0b532240fe717f3428eff65a12eeae4a769b1e896850c0f25bb0954aa5b6c5b5`; обе app-directory identity сохранены.

| Платформа | Размер, байт | SHA-256 ZIP | ASAR SHA-256 |
| --- | ---: | --- | --- |
| macOS arm64 | 181473642 | `9dd4f0f5ca8e4983d13066f7b578e255eb215a4dae47ea66f1371924f398e0a2` | `0b532240fe717f3428eff65a12eeae4a769b1e896850c0f25bb0954aa5b6c5b5` |
| Windows x64 | 316735943 | `045247f12bda051c77531d00472a0ad80a2e0c354467ca6109c182c3969428ce` | `937a23b034b2a949d4d4a2847857da2c9d56cf6f31075d68be9623bb2f778522` |

Windows package verifier подтвердил executable, portable Node, bundled Windows runtime и Workflow Kit 1.5.0. Native Windows и clean VM не запускались; это остаётся пользовательской проверкой.


## Локальный парный выпуск 0.6.60 — 28.09.2026

Hotfix restart/reopen title reconciliation. Native ChatGPT title сначала читается; PATCH выполняется только при расхождении с local explicit session title, после чего результат подтверждается GET. Post-load и late-bind triggers не теряются, force-reconcile переживает debounce, transient readiness/auth failures получают bounded retry. Workflow Kit остаётся 1.5.0.

Финальный `npm run build` выполнен из source commit `7cf1299a70633bb620f18e8db857ed1d552eb401`; `sourceFiles=96`, `packagedSourceMatches=true`. Поставка: `~/Downloads/WebPilot-0.6.60/`; `shasum -c SHA256SUMS.txt` — OK. Корневой и `/Applications/Project Web Pilot.app` — 0.6.60, одинаковый macOS ASAR `cc2df5380de32c76461cf0e2e90f2e393ae4895808181c6fa7d339198f54b564`.

| Платформа | Размер, байт | SHA-256 ZIP | ASAR SHA-256 |
| --- | ---: | --- | --- |
| macOS arm64 | 181474464 | `66ae4e3a95b5485396ce333d4d88d89ff39b77ca317be663b714710666fe725b` | `cc2df5380de32c76461cf0e2e90f2e393ae4895808181c6fa7d339198f54b564` |
| Windows x64 | 316736763 | `f7a24c6dca6193c929193887a487d9fb26c2967f1d14f685347d6bdabdcd77e8` | `0b578e6e680330890668ac27c7a25964d26c76ea3a6418bf341627aede173d0a` |

Windows package verifier подтвердил executable, portable Node, bundled Windows runtime и Workflow Kit 1.5.0. Native Windows/clean VM не запускались.


## Локальный парный выпуск 0.6.61 — 28.09.2026

Canonical session auto-title теперь берётся из H1 обязательного planning/spec документа; objective используется только как fallback. Все session titles ограничены 80 Unicode-символами и 200 UTF-8 байтами, чтобы local и native ChatGPT names имели один безопасный контракт. 0.6.60 GET-before-PATCH reconciliation сохранён. Workflow Kit — 1.5.0.

Финальный `npm run build` выполнен из source commit `320e9fd8ae59d477097b09de9d116e34aca1e756`; `sourceFiles=96`, `packagedSourceMatches=true`. Поставка: `~/Downloads/WebPilot-0.6.61/`; `shasum -c SHA256SUMS.txt` — OK. Корневой и `/Applications/Project Web Pilot.app` — 0.6.61, одинаковый macOS ASAR `478d63635904ec13708a53b79ecbfce577937e2b0c48487afacc3d32cf390947`.

| Платформа | Размер, байт | SHA-256 ZIP | ASAR SHA-256 |
| --- | ---: | --- | --- |
| macOS arm64 | 181475006 | `67ed9741e004f6fbdf9029fc310822cd181b06b0ef610fcba86cc636f00b67fc` | `478d63635904ec13708a53b79ecbfce577937e2b0c48487afacc3d32cf390947` |
| Windows x64 | 316737303 | `f53880165665274b0248ed6378e7a129ab98e8918d53083ff21bb661c7828b68` | `bd413c5b79a5aa99ca1d166f57a1feef175b88b854cbca0430d89b4a91bccf03` |


## Локальный парный выпуск 0.6.62 — 28.09.2026

Убран циклический native title retry. Sync выполняется только одноразово на естественных событиях: изменение local scope-title, manual rename, поздний bindChat новой session и reopen/navigation bound conversation. Ошибка 429/5xx не запускает автоматический повтор. Manual rename сохраняет local title и возвращает UI результат до любого сетевого title request.

Финальный `npm run build` выполнен из source commit `a2be84b59ed611040aba3f685719176c68911b07`; `sourceFiles=96`, `packagedSourceMatches=true`. Поставка: `~/Downloads/WebPilot-0.6.62/`; ZIP integrity — OK. macOS ZIP `82a43d6671cdc5f9310f3dd14899d054d83ece6ad3fbca5239292f42d33f155e`; Windows ZIP `60c607631f3916351be93bd2d9d494cdc2cbf3467133184cc5eb24c862845b0f`. macOS ASAR `537fe82b51bbd08d41d53314fc92bba0a9ea653f3b8c2efce150317311f25a06`.


## Локальный парный выпуск 0.6.63 — 28.09.2026

Ручное переименование больше не использует `window.prompt()`. В sidebar есть собственный modal с текущим именем, полем ввода, Enter/«Сохранить» и «Отмена». Один и тот же dialog используется для проекта и session. Native ChatGPT sync остаётся отдельной одноразовой best-effort операцией и не блокирует ввод.

Финальный `npm run build` выполнен из source commit `243e250a0f75d4480e7cdc2b25c58d36bf11a3fb`; `sourceFiles=96`, `packagedSourceMatches=true`. Поставка: `~/Downloads/WebPilot-0.6.63/`; ZIP integrity — OK. macOS ZIP `fdaf6f4ab0a08d462401ac472ad4f7145a8085137db9e3ecb2750a97ad3c3660`; Windows ZIP `cbf6133dae0490689c61702e2334ba5d34e1e4af362fe0273d1bec1e6e979b1e`. macOS ASAR `dce3e5edad72df49b6a394d44378fd7d6743674f14a32f9274afd148d63c48ff`.

## Постоянная локальная подпись macOS — scope 03.10.2026

[Контракт](planning/macos-screen-permission-stability.md) устраняет подтверждённое несовпадение TCC signing requirement. `npm run build:mac` требует явно выбранную Apple Development identity до упаковки. Укажите SHA-1 сертификата через `WEBPILOT_MAC_SIGNING_IDENTITY` либо `.harness/runtime/mac-signing.json`: `{"identity":"<SHA-1 выбранного сертификата>"}`. Конфигурация и signing receipt остаются в игнорируемом runtime, вне Git. `npm run check:mac-signing` проверяет наличие действительной identity; `npm run sign:mac` подписывает окончательный staging через `@electron/osx-sign@2.7.0` и выполняет строгую проверку перед выпуском. Штатные ошибки останавливают `build:mac`; автоматического выбора сертификата и перехода на ad hoc нет. Подпись локальная development, без profile automation, нотарификации и timestamp server.

T002 добавила подпись staging. T003 установила подписанную 0.6.79 и добавила обязательный gate до установки, после копирования и для извлечённого ZIP: строгая проверка вложенного кода, bundle ID, выбранного сертификата/TeamID, запечатанных ресурсов и designated requirement. Неудачная проверка блокирует замену либо возвращает прежние Contents. Комплектные Node/uv сохраняют исходные подписи и контрольные суммы; ресурсы покрыты подписью Web Pilot. Проверка `mac-signature` сверяет staging, root app, /Applications, выданный ZIP и сохранённые device/inode. Парный release manifest также хранит доказательство подписи. T004 подтвердила первичную перепривязку и живой захват; T005 (`8a6d0dd`) подтвердила сохранение разрешения после обновления до 0.6.80 и настоящей перезагрузки. Пользователь подтвердил отсутствие новых запросов. Filesystem identity проверяется по volume UUID/inode и дополнительно device в пределах одной загрузки.

## Сводки прежних выпусков из обзорных документов

Перенесены 06.10.2026 без изменений из `docs/MODULES.md`, `docs/DOCUMENTATION_INDEX.md` и `docs/architecture/OVERVIEW.md`: эти документы входят в обязательный контекст каждой сессии, и вместе с контрактом 0.6.96 пакет recovery превысил предел 180 000 байт. Ссылки в перенесённом тексте даны относительно папки исходного документа.

### Из `docs/MODULES.md`

**Предыдущая версия 0.6.94** ([контракт](planning/codex-native-tools-macos.md)): macOS `Codex App Server Local Mac` в 0.6.94 имел ровно 13 tools. 0.6.94 исправляет Wall time/race `write_stdin`, вводит предел command-output 8000 оценочных токенов, заполняет descriptions всех tools/parameters, добавляет image-result hint и единое правило неизменённого retry после pre-execution OpenAI block. Release опубликован из source commit `24b04476…`, обе Mac-копии установлены; native Windows остаётся отдельной приёмкой. Windows-runtime, `codex-tools.lock.json` и VPS channel не менялись.

**Предыдущая версия 0.6.92** — первый выпуск 13-tool каталога; опубликована 05.10.2026 из source commit `ca85e9dcc4673bfaa7b5a6d358a6fc5b353506d6`. Пользовательская проверка подтвердила каталог и штатные сценарии, но выявила открытый non-TTY stdin и неудобные timing limits `write_stdin`; оба пункта исправлены в 0.6.93.

**Предыдущая версия 0.6.91** ([контракт](planning/codex-local-mac-removal.md)): на macOS один локальный backend — Codex App Server Local Mac; Codex Local Mac удалён из приложения, репозитория и поставки. На новом Mac мастер первого запуска сам ставит и запускает этот backend (нужны Apple Command Line Tools и Codex — CLI или приложение ChatGPT) и принимает туннель; в Настройках нет переключателя backend и выбора папки runtime. Первый запуск 0.6.91 один раз останавливает процессы прежнего runtime, удаляет его копию из данных приложения и LaunchAgent `com.oleynik.CodexLocalMac`; туннель прежнего runtime переносится в executor, если своего у него ещё нет. В пакет попадает только приложение (`src`, `node_modules`, `package.json`, `LICENSE`): посторонняя папка останавливает сборку. ZIP Windows-runtime — шестой файл релиза; сборка берёт его из кеша или скачивает с проверкой SHA-256. Bundled Workflow Kit **1.5.5**. Release собран после предсборочной DOCS из source commit `00eb4a424125229cf3ce5c4bab4a52672d520a7d`; root `Project Web Pilot.app` и `/Applications/Project Web Pilot.app` обновлены до 0.6.91 без пересборки (общий ASAR SHA-256 `51e4b6e52a15fadf47a1758b729f117b1054b715ae4e192c4f92f7450c2e55fa`). [GitHub Release v0.6.91](https://github.com/OleynikAleksandr/Project-Web-Pilot/releases/tag/v0.6.91) опубликован 2026-10-05T09:18:07Z; tag указывает на sourceCommit, шесть assets сверены по серверным SHA-256. Установленная 0.6.91 проверена на Mac пользователя 05.10.2026 (одноразовая очистка, службы, инструменты в ChatGPT через VPS, интерфейс); чистая macOS, native Windows и автозапуск после перезагрузки не проверялись.

Предыдущая опубликованная парная версия — **0.6.90** ([контракт](planning/computer-use-removal.md)): веб-модель больше не управляет интерфейсом компьютера через MCP. На macOS и Windows из каталога убраны инструменты мыши, клавиатуры и активации окон; остаются список окон и снимки экрана и окна (`computer_list_windows`, `computer_capture_screen`, `computer_capture_window`), каталог — 38 инструментов. На macOS они работают системными средствами без Sky и плагина Computer Use внутри Codex; правила сессии запрещают управлять интерфейсом, в том числе командами. Bundled Workflow Kit **1.5.5**. Release собран после предсборочной DOCS из source commit `ee737e2efec453d78c6efe1d5beadece53ecd43c`; root `Project Web Pilot.app` и `/Applications/Project Web Pilot.app` обновлены до 0.6.90 без пересборки (общий ASAR SHA-256 `d3752086cf1f97f9300081a88a41cae3685737c945940ca439e4465f78734639`). [GitHub Release v0.6.90](https://github.com/OleynikAleksandr/Project-Web-Pilot/releases/tag/v0.6.90) опубликован 2026-10-05T07:48:47Z; tag указывает на sourceCommit, пять assets сверены по серверным SHA-256. native Windows и clean VM 0.6.90 не проверялись.

Предыдущая опубликованная парная версия — **0.6.89** ([контракт](planning/release-backups-kit-1.5.5.md)): установка релиза хранит по одной резервной копии предыдущей версии на каждую цель (корневой app и `/Applications`) в `.harness/runtime/release-backups.noindex` — копии больше не накапливаются и не видны в Spotlight. Bundled Workflow Kit **1.5.5**: push на GitHub отклоняется, пока DOCS текущего плана не завершена. Release собран после предсборочной DOCS из source commit `d340f7afdad3963888ae5c484c201287635fd549`; root `Project Web Pilot.app` и `/Applications/Project Web Pilot.app` обновлены до 0.6.89 без пересборки (общий ASAR SHA-256 `002e56ec296fb4293302502f1248facdbb6c2f97c3c9732eb1336b8cf8342afa`). [GitHub Release v0.6.89](https://github.com/OleynikAleksandr/Project-Web-Pilot/releases/tag/v0.6.89) опубликован 2026-10-04T17:08:22Z; tag указывает на sourceCommit, пять assets сверены по серверным SHA-256. native Windows и clean VM 0.6.89 не проверялись.

Предыдущая опубликованная парная версия — **0.6.88** ([контракт](planning/mcp-start-message.md)): в режиме Codex App Server Web Pilot сам начинает новую сессию коротким стартовым сообщением — проект, папка и порядок чтения `workflow_context_recover` по одной части с ключом `after` до `[КОНЕЦ ПАКЕТА]`; агент получает контекст через MCP и кратко подтверждает. Пакет в чат не вставляется; привязанный, начатый вручную или прежний чат стартового сообщения не получает. Bundled Workflow Kit **1.5.4**. Release собран после предсборочной DOCS из source commit `5e2b21419f6d5d3126ae0d28d9b85dcccbee2fdf`; root `Project Web Pilot.app` и `/Applications/Project Web Pilot.app` обновлены до 0.6.88 без пересборки (общий ASAR SHA-256 `07705d3b1e723f9cf3a4a1716eae51f898a805b40e4f2cfebc81ae6af1036d41`). [GitHub Release v0.6.88](https://github.com/OleynikAleksandr/Project-Web-Pilot/releases/tag/v0.6.88) опубликован 2026-10-04T16:08:41Z; tag указывает на sourceCommit, пять assets сверены по серверным SHA-256. Живая проверка новой сессии со стартовым сообщением — за пользователем; native Windows и clean VM 0.6.88 не проверялись.

Предыдущая опубликованная парная версия — **0.6.87** ([контракт](planning/mcp-sequential-parts-kit-1.5.4.md)): агент читает контекст проекта через MCP строго по одной части — следующая часть выдаётся только по ключу `after` из конца предыдущей (иначе короткий отказ `PART_ORDER`), части до 28 000 байт, повторного чтения нет. Bundled Workflow Kit **1.5.4**: recovery не включает формы плана и карты документов — формы печатает `--help` команд, карты читаются по задаче; пакет уменьшился примерно вдвое. Bundled Workflow Kit **1.5.4**. Release собран после предсборочной DOCS из source commit `394f907642d2ffe2abb865ea0b404c12ed43fbd9`; root `Project Web Pilot.app` и `/Applications/Project Web Pilot.app` обновлены до 0.6.87 без пересборки (общий ASAR SHA-256 `07a1b7ef6dc1ef6e6d673c9778cd94acb1e2c9beba891095b59aa146a2b85f38`). [GitHub Release v0.6.87](https://github.com/OleynikAleksandr/Project-Web-Pilot/releases/tag/v0.6.87) опубликован 2026-10-04T15:32:40Z; tag указывает на sourceCommit, пять assets сверены по серверным SHA-256. Живая проверка сессии без вставки — за пользователем; native Windows и clean VM 0.6.87 не проверялись.

Предыдущая опубликованная парная версия — **0.6.86** ([контракт](planning/mcp-context-delivery.md)): агент сам получает контекст проекта через MCP — `workflow_context_recover` выдаёт правила сессии и полный пакет Workflow Kit частями до 20 000 байт (ChatGPT показывает модели не больше ~10 000 токенов одного результата). В режиме Codex App Server Web Pilot больше не вставляет recovery в ChatGPT: новая сессия ждёт первого сообщения пользователя и привязывается по нему, выбранный проект передаётся серверу. Codex Local Mac и Windows сохраняют доставку первым сообщением. Bundled Workflow Kit **1.5.3**. Release собран после предсборочной DOCS из source commit `ea4f835f7a4d857f3c0125541fa952f796e50c56`; root `Project Web Pilot.app` и `/Applications/Project Web Pilot.app` обновлены до 0.6.86 без пересборки (общий ASAR SHA-256 `a2d85bc7e6a85912372a978704b59f828be5d31c8b357b023b65e6f8f28c4eeb`). [GitHub Release v0.6.86](https://github.com/OleynikAleksandr/Project-Web-Pilot/releases/tag/v0.6.86) опубликован 2026-10-04T14:49:55Z; tag указывает на sourceCommit, пять assets сверены по серверным SHA-256. Живая проверка сессии без вставки — за пользователем; native Windows и clean VM 0.6.86 не проверялись.

Предыдущая опубликованная парная версия — **0.6.85** ([контракт](planning/computer-use-keys-batch.md)): Computer Use в MCP принимает символы клавиш и пакет действий `computer_actions` (до 50 действий одним вызовом); подписи канала VPS нейтральные, есть подсказка про плагин ChatGPT; после архива или удаления выбранного проекта Настройки возвращают к другому проекту. Bundled Workflow Kit **1.5.3**. Release собран после предсборочной DOCS из source commit `9a0b6994fce07bcf466314cfe9bb0267420d0242`; root `Project Web Pilot.app` и `/Applications/Project Web Pilot.app` обновлены до 0.6.85 без пересборки (общий ASAR SHA-256 `219eb85c688ee00048a2620253cc6108f503039bbe6d109bba4137b7be661320`). [GitHub Release v0.6.85](https://github.com/OleynikAleksandr/Project-Web-Pilot/releases/tag/v0.6.85) опубликован 2026-10-04T12:29:00Z; tag указывает на sourceCommit, пять assets сверены по серверным SHA-256. macOS подписан сертификатом Apple Development UkrHD; native Windows и clean VM 0.6.85 не проверялись.

Предыдущая опубликованная парная версия — **0.6.84** ([контракт](planning/mcp-stateless-sessions.md)): сервер MCP «Codex App Server Local Mac» без сессий — перезапуск Web Pilot и MCP не ломает коннекторы ChatGPT и Claude через VPS; содержит переключатель канала ChatGPT из 0.6.83. Bundled Workflow Kit **1.5.3**. Release собран после предсборочной DOCS из source commit `ee2cf2031a396a7cf33c317df47efefd768770ef`; root `Project Web Pilot.app` и `/Applications/Project Web Pilot.app` обновлены до 0.6.84 без пересборки (общий ASAR SHA-256 `5232684f7d488e2f37e7c33f02c49fa9960972f9c1504b2f5bd393703b0d4618`). [GitHub Release v0.6.84](https://github.com/OleynikAleksandr/Project-Web-Pilot/releases/tag/v0.6.84) опубликован 2026-10-04T10:22:08Z; tag указывает на sourceCommit, пять assets сверены по серверным SHA-256. macOS подписан сертификатом Apple Development UkrHD; native Windows и clean VM 0.6.84 не проверялись.

Предыдущая опубликованная парная версия — **0.6.83** ([контракт](planning/chatgpt-channel-vps.md)): в Настройках под «Локальные инструменты macOS» раздел «Подключение ChatGPT» — Secure MCP Tunnel или собственный сервер (VPS); в режиме VPS tunnel-client не запускается, туннель VPS работает при любом выборе и следует за портом MCP. Bundled Workflow Kit **1.5.3** без изменений. Release собран после предсборочной DOCS из source commit `366791a752cc4a67ada3f9fbf92326e6b9e78f12`; root `Project Web Pilot.app` и `/Applications/Project Web Pilot.app` обновлены до 0.6.83 без пересборки (общий ASAR SHA-256 `871dcd8b471615add399d2628cb22ff99b8a54cd29e1f6b4b6e2cd9568ca02f6`). [GitHub Release v0.6.83](https://github.com/OleynikAleksandr/Project-Web-Pilot/releases/tag/v0.6.83) опубликован 2026-10-04T09:54:15Z; tag указывает на sourceCommit, пять assets сверены по серверным SHA-256. macOS подписан сертификатом Apple Development UkrHD; native Windows и clean VM 0.6.83 не проверялись.

Предыдущая опубликованная парная версия — **0.6.82** ([контракт](planning/release-0.6.82-workflowkit-1.5.3.md)): bundled Workflow Kit **1.5.3** (35 файлов, SHA-256 `d59ae7b6b074e953fdd6c5d78d1f644902f0e7b9af5ad3c78d67d42f1f6a1c0f`) с командой `project:rename` — штатное переименование проекта. Release собран после предсборочной DOCS из source commit `85ffd3355b7fa9d945c1a703bc1027ce6c3ca2a7`; root `Project Web Pilot.app` и `/Applications/Project Web Pilot.app` обновлены до 0.6.82 без пересборки (общий ASAR SHA-256 `37766b5fc586d0934fe9f4c8da08c3ebd1db7359b600b26f6b34af7fe79c6770`). [GitHub Release v0.6.82](https://github.com/OleynikAleksandr/Project-Web-Pilot/releases/tag/v0.6.82) опубликован 2026-10-04T09:16:44Z; tag указывает на sourceCommit, пять assets сверены по серверным SHA-256. macOS подписан сертификатом Apple Development UkrHD; native Windows и clean VM 0.6.82 не проверялись.

Предыдущая опубликованная парная версия — **0.6.81**: Electron 44.5.1 / Node 24.21.0 / Workflow Kit **1.5.2** (35 файлов, SHA-256 `646fec106c498e004d8688a3bc40012bea1654178ce66a61b650211ab28055df`). Предсборочная DOCS предшествовала package build; root и `/Applications` обновлены без повторной сборки и имеют общий ASAR `4fc92297dafdf6afa2e97b0a504d774753a57f7c195a6a931477f9ea4beb8195`. GitHub Release v0.6.81 опубликован; tag указывает на `db59be83f0d3fa4136c109a8252181422acfe94c`, пять assets сверены по server digest. Native Windows/clean VM автоматически не проверялись.

### Из `docs/DOCUMENTATION_INDEX.md`

**Предыдущая версия 0.6.94 / Workflow Kit 1.5.5** ([контракт](planning/codex-native-tools-macos.md)). 0.6.94 сохраняет 13-tool каталог, исправляет Wall time/race `write_stdin`, ограничивает command-output 8000 оценочных токенов, заполняет descriptions всех tools/parameters, добавляет image-result hint и единое pre-execution retry-rule. Release sourceCommit `24b04476…`, обе Mac-копии установлены, GitHub содержит ровно шесть проверенных assets; WorkflowKit docs синхронизированы commit `6c8ad190…`. Native Windows остаётся отдельной проверкой. `codex-tools.lock.json`, Windows-runtime и VPS channel не менялись. История выпусков — [RELEASE.md](RELEASE.md).

### Из `docs/architecture/OVERVIEW.md`

**Предыдущая версия 0.6.94** ([контракт](planning/codex-native-tools-macos.md)). Каталог macOS в 0.6.94 — ровно 13 инструментов. 0.6.94 считает Wall time `write_stdin` на текущий вызов, возвращает финальный вывод/exit code при завершении между poll и write/terminate, ограничивает command-result 8000 оценочных токенов, описывает все 13 tools и все параметры, а image-tool объясняют JSON + `image/png` и `content_items → image()`. Единое правило pre-execution OpenAI block находится в `exec_command`, `write_stdin`, server instructions и `session-rules.md`. Полный suite: 553 теста, 549 passed, 4 skipped, 0 failed; definitions совпали с Codex 0.160.0 / `rust-v0.160.0`. GitHub Release v0.6.94 опубликован из source commit `24b04476d1d96fa770b1d488c197b19c07a33422`; обе macOS-копии установлены и имеют ASAR `4d9f5efe…f98549`. `codex-tools.lock.json`, Windows-runtime и VPS channel не менялись; native Windows остаётся отдельной приёмкой.

**Предыдущая версия 0.6.92** ([тот же контракт](planning/codex-native-tools-macos.md)) — первый выпуск каталога из 13 tools. GitHub Release v0.6.92 содержит шесть assets; tag указывает на source commit `ca85e9dcc4673bfaa7b5a6d358a6fc5b353506d6`, release/main были сверены штатным verifier. Пользовательская проверка 05.10.2026 подтвердила каталог, штатные сценарии и отказы; обнаружен продуктовый дефект — зависание bare `rg` из-за открытого stdin, а один вызов потребовал повтора из-за прежних жёстких пределов `write_stdin`. Оба correction-пункта исправлены в 0.6.93.

**Предыдущая версия 0.6.91** ([контракт](planning/codex-local-mac-removal.md)): на macOS один локальный backend — Codex App Server Local Mac; Codex Local Mac удалён из приложения, репозитория и поставки. На новом Mac мастер первого запуска сам ставит и запускает этот backend (нужны Apple Command Line Tools и Codex — CLI или приложение ChatGPT) и принимает туннель; в Настройках нет переключателя backend и выбора папки runtime. Первый запуск 0.6.91 один раз останавливает процессы прежнего runtime, удаляет его копию из данных приложения и LaunchAgent `com.oleynik.CodexLocalMac`; туннель прежнего runtime переносится в executor, если своего у него ещё нет. В пакет попадает только приложение (`src`, `node_modules`, `package.json`, `LICENSE`): посторонняя папка останавливает сборку. ZIP Windows-runtime — шестой файл релиза; сборка берёт его из кеша или скачивает с проверкой SHA-256. Bundled Workflow Kit **1.5.5**. Release собран после предсборочной DOCS из source commit `00eb4a424125229cf3ce5c4bab4a52672d520a7d`; root `Project Web Pilot.app` и `/Applications/Project Web Pilot.app` обновлены до 0.6.91 без пересборки (общий ASAR SHA-256 `51e4b6e52a15fadf47a1758b729f117b1054b715ae4e192c4f92f7450c2e55fa`). [GitHub Release v0.6.91](https://github.com/OleynikAleksandr/Project-Web-Pilot/releases/tag/v0.6.91) опубликован 2026-10-05T09:18:07Z; tag указывает на sourceCommit, шесть assets сверены по серверным SHA-256. Установленная 0.6.91 проверена на Mac пользователя 05.10.2026 (одноразовая очистка, службы, инструменты в ChatGPT через VPS, интерфейс); чистая macOS, native Windows и автозапуск после перезагрузки не проверялись.
