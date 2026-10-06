# Module Specification — Runtime Lifecycle

Связанные проекты (02.10.2026): **Workflow Kit** — планы и recovery; **Web Pilot Sidebar** — отдельно разрабатываемый браузерный интерфейс. [Рабочие каталоги и границы интеграции](../SOURCE_WORKSPACES.md).

> **С 0.6.96** на Windows действует тот же lifecycle исполнителя, что на macOS ([контракт](../planning/context-as-text.md), [спецификация исполнителя](codex-app-server-executor.md), раздел «Один исполнитель на macOS и Windows — 0.6.96»). Всё, что ниже сказано о Windows-runtime из архива (`WindowsRuntimeBootstrap`, `windows-control.py`, `windows-first-run.py`, порты 17842/17843, `CodexLocalWindows`), — история до 0.6.96; `windows-control.py` остаётся в пакете только для одноразовой остановки прежнего сервера инструментов.
>
> **С 0.6.91** на macOS один backend — Codex App Server Local Mac, его lifecycle описан в разделе «macOS: только executor — 0.6.91» в конце документа и в [спецификации executor](codex-app-server-executor.md). Разделы о Codex Local Mac (`mac-control.py`, `MacRuntimeBootstrap`, `mac-runtime.zip`, `macRuntimeMode`, переключатель в Settings) — история; разделы о Windows действуют.

## Назначение

Обеспечить бесшумный self-healing startup локальных MCP и Secure MCP Tunnel на macOS и Windows: переиспользовать существующую совместимую установку, установить runtime при отсутствии, восстановиться после stale PID и конфликтов локальных портов и всегда вернуть Web Pilot фактические loopback endpoints.

## Граница ответственности

Модуль владеет обнаружением/установкой runtime, process identity, persisted registration, локальными endpoint/портами, readiness и безопасным запуском MCP+tunnel. Модуль не владеет project recovery semantics, содержанием ChatGPT-сессии и tunnel credentials; секреты остаются в приватном runtime state и никогда не попадают в renderer, Git, чат или diagnostics.

## Facade

Web Pilot использует один контракт `ensure()`:
1. проверить persisted registration/runtime path;
2. быстро валидировать совместимую установку;
3. при необходимости выполнить platform discovery/adoption;
4. при отсутствии установить bundled runtime;
5. получить runtime `status`;
6. выполнить self-healing `start`, если сервисы не ready;
7. создать MCP client по фактическому `mcp_url` из status.

Status должен возвращать runtime contract/version, package root, state directory, фактический `mcp_url`, tunnel health/UI endpoint и для каждого сервиса `running/owned/ready/pid`. Номер порта не является частью UI/API Web Pilot.

## Persisted registration

Web Pilot сохраняет только несекретные данные: platform, runtime folder, runtime contract/version, source (`external`/`bundled`), подтверждённые local endpoints и timestamp последней успешной проверки. Это hint, а не источник истины: при каждом старте он валидируется через runtime status.

Runtime отдельно хранит выбранные MCP/tunnel loopback ports в своём private state. Именно runtime, а не Web Pilot, является владельцем port allocation, потому что он должен согласованно обновить bridge config и tunnel profile.

## Process identity и stale PID

PID record действителен только если PID существует и его start-time+command identity точно совпадает с сохранённой identity. Если PID существует, но identity отличается, record считается stale и удаляется/карантинируется под runtime operation lock. Чужой процесс не получает signal и не принимается за owned.

Перед остановкой owned процесса identity перечитывается повторно. Это сохраняет защиту от PID reuse между status и signal.

## Endpoint allocation

Предпочтительные исходные порты остаются 17842/17843 для совместимости, но не являются обязательными. Для незапущенного сервиса runtime сначала пытается использовать persisted preferred port. Если loopback port занят и не принадлежит этому runtime, выбирается свободный local port и сохраняется новая registration.

MCP и tunnel health/UI используют разные порты. При изменении MCP port runtime атомарно обновляет `bridge_config.json.port` и `tunnel-profile` server URL. При изменении tunnel health port обновляется `health.listen_addr`. Tunnel ID/key не логируются и не возвращаются Web Pilot.

Поиск свободного порта защищён operation lock и сопровождается retry на bind/start race; обнаруженный чужой listener никогда не завершается.

## Existing runtime adoption

На macOS Web Pilot сначала использует persisted/выбранный external Codex Local Mac. Известный совместимый source snapshot может получить версионированный Web Pilot lifecycle overlay; overlay меняет только runtime control contract и не копирует private credentials. Неизвестный/изменённый control source не перезаписывается автоматически.

На Windows сохраняется существующий discovery/adoption Codex Local Windows и bundled fallback; self-healing contract должен быть одинаковым с macOS по status/endpoints/stale PID, даже если bootstrap implementation отличается.

## Bundled bootstrap

macOS package содержит чистый runtime source snapshot и bootstrap tool (`uv`) для arm64-сборки. Начиная с 0.6.32 в mac-tools также включён официальный Node.js 22.17.0 arm64 с проверенным SHA-256 и лицензией для WorkspaceSetup. При отсутствии external runtime source разворачивается в writable `userData/runtime/Codex-Local-Mac`, после чего выполняется setup для выбранного workspace. Python environment и tunnel-client устанавливаются runtime setup. Если tunnel credentials ещё не настроены, приложение завершает локальный MCP bootstrap и показывает единственное необходимое действие пользователя для первичной настройки tunnel.

Windows продолжает использовать встроенный payload/portable Node и существующий setup path.

## Self-healing алгоритм

1. Validate persisted registration.
2. Inspect/adopt/install runtime.
3. Runtime status очищает stale PID records и сообщает endpoints.
4. Если compatible owned services ready — reuse без restart.
5. Если сервис отсутствует — start.
6. Если preferred port занят чужим listener — allocate new local port, persist endpoints, update configs/profile, retry start.
7. Если старт частично успешен (MCP ready, tunnel нет) — MCP не останавливать; tunnel восстанавливать отдельно.
8. Ошибка показывается пользователю только после исчерпания безопасного self-healing; чужие процессы не трогать.

## Инварианты безопасности

- Никогда не kill/process-stop при identity mismatch.
- Никогда не читать/передавать tunnel key в renderer, diagnostics, Git или recovery context.
- Endpoint принимается только как `http://127.0.0.1:<port>/mcp` для MCP.
- Runtime source update/adoption допускается только для известного snapshot/contract.
- Закрытие Web Pilot не останавливает общие MCP/tunnel сервисы.
- Web Pilot не кэширует endpoint как истину: после restart всегда перепроверяет status.

## Приёмка

- stale PID + reused foreign PID восстанавливается молча без signal чужому процессу;
- занятые 17842/17843 приводят к автоматическому выбору других ports и успешному MCP/tunnel start;
- повторный startup использует сохранённые новые endpoints без discovery;
- существующий внешний Mac runtime сохраняет tunnel configuration при overlay/adoption;
- отсутствие Mac runtime приводит к bundled bootstrap, а не к ручному выбору папки;
- Windows contract и regression tests подтверждают тот же no-kill/dynamic-endpoint принцип;
- при штатном self-heal sidebar не показывает ошибку.

## Реализация macOS control v2 — T006

Versioned control facade хранит `runtime-endpoints.json` в private state. `managed_process()` удаляет PID record при исчезнувшем PID или identity mismatch, не отправляя signal. `reconcile_endpoints()` сохраняет preferred endpoint только если он свободен; иначе выбирает свободный loopback port и согласованно обновляет bridge config и существующий tunnel profile. `status()` возвращает `runtime_contract=2`, `package_root`, фактические endpoints и readiness. Bundled source snapshot содержит тот же control facade и runtime Python sources без private state, venv и tunnel credentials.

## Интеграция Web Pilot / macOS — T007

Web Pilot хранит несекретный runtime registration (folder/source/contract/endpoints/verifiedAt) в локальных settings как ускоряющий hint. На одном экземпляре `McpRuntime` discovery/bootstrap выполняется один раз; последующие status/start используют уже подтверждённую папку. External legacy Mac runtime не модифицируется: Web Pilot запускает versioned control-v2 adapter через Python внешнего runtime с `WEB_PILOT_RUNTIME_ROOT`, поэтому private state/tunnel credentials используются на месте, а Git source остаётся неизменным. При отсутствии external runtime `MacRuntimeBootstrap` атомарно распаковывает bundled ZIP под `userData/runtime/Codex-Local-Mac`, создаёт venv через bundled/system uv либо Python 3.13+ и выполняет setup.

Реальная проверка на текущем Mac подключила внешний runtime через adapter: contract=2, MCP ready, tunnel ready/configured, `mcp_url=http://127.0.0.1:17842/mcp`, server `Codex Local Mac`, 47 tools. SHA внешнего `control.py` до/после остался `6c5c14972774ece2a9820059b3953fe2fe968c186bb6e17af074c7752dc294be`, Git external repo остался чистым.

## Windows lifecycle adapter — T008

Windows Web Pilot использует тот же runtime contract v2 через `resources/runtime-control/windows-control.py`, выполняемый Python существующего external/bundled runtime с `WEB_PILOT_RUNTIME_ROOT`. Тяжёлый bundled payload и его marker не переустанавливаются ради lifecycle update; существующий MCP context overlay остаётся отдельным механизмом. Adapter хранит dynamic endpoints в private `runtime-endpoints.json`, stale PID identity mismatch удаляет только record, bridge config/tunnel profile получают фактические ports, DPAPI tunnel key остаётся в private state. `WindowsRuntimeBootstrap` передаёт adapter path в `McpRuntime`, поэтому фактический `status.mcp_url` используется без fixed-port assumptions.

## Release integration — T009 / Project Web Pilot 0.6.4

macOS release bundles pinned `uv 0.9.13` (arm64 SHA-256 `11609c939296348c7cc1e1231b3fbf7ca90a603a4c494ec72b59d7ceafa695e1`) under `Contents/Resources/mac-tools/uv`, so first-time bundled runtime bootstrap does not depend on a preinstalled uv. Runtime source payload SHA-256 is `7313094f06d17e78624362a398e4d12d4be81434fd83f9a8ff2d946ec8c1f64d`. Packaged lifecycle adapters are separate resources and external runtime source remains untouched.

Release verification used the packaged Mac adapter against the current external Codex Local Mac: contract 2, MCP/tunnel ready, tunnel configured, 47 tools. External repo/control SHA remained unchanged. Full suite: 89 total, 87 passed, 0 failed, 2 native-Windows skipped; Electron smoke passed. Both macOS arm64 and Windows x64 packages were built from the same checkout.

## Первый запуск macOS — 0.6.32

StartupReadiness (`src/startup-readiness.mjs`) координирует probe Node/Git, inspect/status, существующий runtime start и несекретные события страницы через callbacks. Сайт, вход в аккаунт, локальный MCP и туннель имеют отдельные состояния. Неизвестный профиль или гостевой composer не подтверждает вход; устаревшая generation не меняет текущую страницу. Повторные операции объединяются, закрытие отменяет публикацию поздних результатов.

`MacRuntimeBootstrap.configureTunnel()` запускает отдельный `resources/runtime-control/mac-first-run.py` рядом с прежним control. Worker получает tunnel ID и скрытый ключ через нативные диалоги macOS, после обоих подтверждений вызывает существующий configure_tunnel под operation lock. Ключ остаётся в private store с mode 0600, не передаётся в argv, renderer или диагностический ответ; отмена не меняет конфигурацию. Живой tunnel не заменяется автоматически. Статус локальных служб не доказывает подключение плагина в ChatGPT: полный путь проверяется отдельным действием агента с файлом гостя.

## Комплектный runtime после установки Apple — C011

На чистом клоне после завершения Apple Command Line Tools подготовка остановилась, после перезапуска показан MAC_RUNTIME_EXTERNAL_MODIFIED. Независимая холодная установка из фактического resources/mac-runtime.zip воспроизвела тот же код за 34.465 с: setup завершился, marker записан, но hash комплектного control.py (84a68f…58f9) отсутствовал в списке известных версий адаптера. Ошибка не доказывает проблему интернета или изменение файлов пользователем.

MacRuntimeBootstrap принимает эту точную поставляемую версию через существующий facade, возвращает facade также после первой установки и отличает собственную папку от внешней. Повторный запуск использует завершённую установку и её настройки. Неизвестный внешний control.py и изменённый комплектный файл по-прежнему блокируются; одного marker недостаточно для доверия. Управляемый Python получает явно заданное окружение. Регрессия использует реальный ZIP, проверяет первый запуск, повтор после регистрации собственной папки и отказ для изменённых файлов. Основной MCP и профиль не меняются.


## Уточнение первого запуска — 0.6.38

Нативный worker передаёт русский текст без JSON Unicode escapes, различает отмену, отказ окна и отказ данных. MacRuntimeBootstrap публикует только известный безопасный код/сообщение без сырого stderr. Фоновый Git watcher принадлежит StartupReadiness, после успеха ждёт явной подготовки. Контракт — docs/modules/first-run-onboarding.md; runtime lifecycle и сохранение секретов остаются прежними.

## Автоматическое подключение — 0.6.39

Во время активного macOS onboarding TunnelClipboard распознаёт новый ID, затем ключ. Начальное содержимое буфера игнорируется. MacRuntimeBootstrap.configureTunnel(credentials) передаёт ограниченный JSON в mac-first-run.py через stdin. Переданные поля не спрашиваются повторно; ручной ввод без credentials сохраняет нативные окна. Renderer и snapshot получают только прогресс, не ID/ключ. Живой рабочий tunnel автоматически не заменяется; configured без ready не завершает шаг. Выход из мастера прекращает чтение буфера. Runtime и profile форматы сохранены.

## Windows first-run facade — scope 033

Согласован Windows-мастер поверх существующего WindowsRuntimeBootstrap. Новый worker windows-first-run.py использует существующий Windows control и DPAPI; bootstrap передаёт секреты только приватным stdin, публикует несекретный результат и выдаёт проверенное окружение комплектного Git для Workflow Kit. Ввод собирается и проверяется до блокировки/остановки принадлежащих установке процессов. Чужие процессы не останавливаются. Платформенный StartupReadiness adapter оркестрирует ensure/status/start; второй runtime manager не создаётся.

W002: Windows bootstrap проверяет control provenance перед нативной настройкой, сериализует configure и передаёт ключ только stdin. Bundled Git environment проверяется отдельно от установки runtime; неправильный root, неполный Git или отказ запуска имеют самостоятельные коды. Существующий launchTunnelSetup остаётся для совместимости настроек до подключения общего мастера.

## Уточнение 0.6.41

Windows 0.6.41: общий startup-platform facade активен в production для darwin/win32. Windows-комплект устанавливается до проверки Git, MCP запускается отдельно до настройки туннеля; после защищённого ввода запускается подключение. Приватный worker вызывает прежний configure_tunnel/DPAPI под operation_lock; raw stderr/ключи не публикуются.

## 0.6.42 — ввод подключения в два шага

TunnelClipboard.pasteTunnelId принимает только ID в main, включая содержимое
буфера, скопированное до открытия мастера. configureManually без ID завершает
первый шаг и возвращает управление инструкции; с ID передаёт его существующему
platform worker и открывает только защищённое поле ключа. Опрос при ручном вводе
приостановлен. main проверяет вход, компоненты и busy; UI не получает credentials.
Сохранение ключа, доверие runtime и запуск служб используют прежние механизмы.

## 0.6.43 — отдельный системный ID prompt

Предыдущий pasteTunnelId из 0.6.42 заменён асинхронным native prompt через
bootstrap.promptTunnelId и worker --tunnel-id. ID-only worker не загружает control
и не пишет credentials. Отмена/ошибка не меняют private store. Main сохраняет ID
для последующего ключа; renderer получает только stage/hasTunnelId/error.
На время диалога опрос остановлен, поздний ответ после выхода отбрасывается;
копирование внутри отменённого диалога не запускает подключение после закрытия.

## 0.6.44 — создание проекта и подключение инструментов

Готовность MCP и туннеля означает локальную проверку служб. Она не доказывает регистрацию коннектора в аккаунте или набор инструментов чата. Мастер отдельно объясняет этот шаг; механизм управления службами, ключи, endpoints и transport в этом выпуске не меняются.

## 0.6.45 — общий мастер подключения и разрешений

Видимый блок Permissions в общем мастере объясняет режимы подтверждений ChatGPT. Он не вызывает runtime-команд и не меняет права подключения, хранилище ключей, службы или транспорт.

## Эксперимент Codex App Server executor — scope 035

Scope `codex-app-server-mcp-035` не меняет production Runtime Lifecycle этого документа. Рядом с ним создаётся отдельный macOS-only MCP adapter с собственным state, портами и tunnel profile для A/B против Codex Local Mac. Контракт эксперимента — `docs/modules/codex-app-server-executor.md`.

Эксперимент использует Codex App Server как локальный executor без `turn/start`: direct `command/exec` и `fs/readFile`, `fs/writeFile`, `fs/readDirectory` для базовых операций, MCP manager только для local-only downstream capabilities. Для обращения к MCP допускается служебный ephemeral `thread/start`; модельный turn не запускается. Computer Use обязателен для паритета и маршрутизируется по актуальному bundled пути `node_repl + @oai/sky`. Общий каталог Codex не экспортируется автоматически: публичные и уже доступные ChatGPT capabilities остаются за Web ChatGPT.

Facade эксперимента должен быть не уже текущего Codex Local Mac по локальным возможностям: файлы, поиск, Git, команды/процессы, recoverable file operations, Workflow Kit recovery и Computer Use. Downstream MCP публикуются только по явному allowlist. Любая недоступная локальная capability фиксируется как ограничение A/B, а не скрывается сокращением каталога.

Codex binary выбирается детерминированно и всегда показывается в status вместе с версией: явный `CODEX_APP_SERVER_BIN`, затем user-installed Codex, затем bundled ChatGPT binary только после проверки требуемого protocol. Это важно, потому что на одном Mac могут одновременно существовать разные версии Codex.

Экспериментальный runtime использует отдельные state и endpoints (по умолчанию MCP 17852, tunnel health 17853) и собственный tunnel profile/private credentials. До пользовательского A/B старый runtime 17842/17843, его credentials, service ownership и Web Pilot `McpRuntime` остаются неизменными. Новый executor не считается production runtime и не включается в release package.

После пользовательской настройки второго tunnel T006 зафиксировал `LC_ALL=C`/`LANG=C` для `ps -o lstart,command`: process identity больше не зависит от locale Terminal. Реальный повторный `start` распознал MCP как owned и поднял отдельный tunnel; оба experimental сервиса подтверждены `ready=true`. Production runtime не останавливался и не перенастраивался.

T007 подтвердил end-to-end использование именно через ChatGPT connector: все 47 experimental tools были реально вызваны. Computer Use actions переведены с Swift/CGEvent на bundled `node_repl -> @oai/sky`; TextEdit smoke доказал фактический ввод и capture. Это остаётся экспериментальным runtime рядом с production Codex Local Mac; решение о замене lifecycle не принимается автоматически.



## 0.6.47 — эксклюзивный выбор macOS MCP runtime

Web Pilot хранит `macRuntimeMode = local | app-server` в локальных settings. `MacRuntimeSwitcher` является единственным facade переключения: перед запуском выбранного runtime он отключает LaunchAgent и останавливает невыбранный runtime. Одновременная штатная работа Codex Local Mac и Codex App Server Local Mac не допускается.

Для `app-server` source из release resource копируется в стабильный private state `~/Library/Application Support/WebPilotCodexExecutor/source`; LaunchAgent `com.oleynik.WebPilotCodexExecutor` запускает только эту стабильную копию. Поэтому автозапуск не зависит от workspace или пути текущего app bundle. Старый LaunchAgent `com.oleynik.CodexLocalMac` не удаляется: переключатель использует `launchctl enable/disable gui/<uid>/<label>`, что сохраняет выбор после login/reboot.

При переходе в новый mode порядок: disable старого LaunchAgent → stop Codex Local Mac → enable нового LaunchAgent → start/initialize App Server MCP. Обратный переход симметричен. `McpRuntime` получил разрешённую lifecycle-команду `stop`, после которой сбрасывает client/status. После успешного пользовательского switch main пересоздаёт runtime/context controller, сохраняет mode и выполняет `app.relaunch()`; при ошибке делает best-effort rollback на прежний mode.

Миграция 0.6.46→0.6.47: если `macRuntimeMode` ещё не сохранён, но private tunnel App Server уже настроен, выбирается `app-server`; иначе сохраняется прежний `local`.

Реальная проверка 19.09.2026: `com.oleynik.CodexLocalMac => disabled`, старые MCP/tunnel остановлены; `com.oleynik.WebPilotCodexExecutor => enabled`, новый MCP/tunnel ready=true, initialize вернул server `Codex App Server Local Mac` и 47 tools.


## 0.6.47 — переключатель runtime в Settings

В macOS Settings появился двухпозиционный control **Codex Local Mac / Codex App Server Local Mac**. Он отображает сохранённый `macRuntime.mode` и readiness активного MCP/tunnel из main-process snapshot. На Windows секция скрыта, существующий Windows runtime UI не меняется.

Renderer не управляет процессами напрямую: preload публикует только `setMacRuntimeMode(mode)`, а main-process action выполняет эксклюзивный switch T008. Пока операция выполняется, Settings controls блокируются. После успешного switch Web Pilot сохраняет mode и автоматически relaunch-ится, поэтому embedded ChatGPT получает заново каталог подключений/инструментов.

## 0.6.47 correction — один стабильный Secure MCP Tunnel

Correction scope `stable-mcp-connector-036` заменяет предварительную схему «runtime = MCP+tunnel» на один стабильный ChatGPT connector. `com.oleynik.CodexLocalMac` остаётся disabled в обоих macOS modes. `com.oleynik.WebPilotCodexExecutor` является единственным login LaunchAgent и запускает `selector-start` из private installed source. Selector хранит только mode, loopback `mcp_url` выбранного backend и проверенные абсолютные пути локального runtime; tunnel key/profile остаются в private state. Если stable private tunnel ещё не настроен (например, обновление обычной установки без прежнего A/B), selector локально импортирует существующие tunnel ID/key из private state Codex Local Mac без вывода секрета и затем использует уже этот единственный connector.

При переключении Web Pilot останавливает оба принадлежащих ему backend, выбранный MCP запускает в `--mcp-only`, после чего один App Server private tunnel перенаправляется на фактический loopback endpoint выбранного MCP и запускается отдельно. `MacSelectedRuntime` представляет main/context layer составной status «выбранный MCP + общий tunnel», поэтому существующие `ensure/status/loadContext` не создают второй tunnel. После login/reboot тот же LaunchAgent читает selector и восстанавливает выбранный MCP и общий tunnel до запуска Web Pilot.

Старый local runtime дополнительно проверяется на оставшиеся listeners по его фактическим MCP/tunnel ports. Процесс получает TERM только если `/bin/ps` дважды подряд подтверждает тот же известный executable/path и ожидаемый port/profile; чужой listener или изменившаяся command line не сигналится.

## Независимый lifecycle — 0.6.48

Закрытие Web Pilot завершает только UI и дочерние окна, не MCP и tunnel. На macOS действующий пользовательский LaunchAgent запускает selector-start при входе (RunAtLoad). В Windows полный start дополнительно регистрирует HKCU Run ProjectWebPilotMCP: pythonw запускает стабильную private-копию control.py с явным ROOT и STATE, а не файл из распакованного ZIP. Ключи остаются в DPAPI/private; реестр и launcher не содержат секретов. Повторная регистрация идемпотентна. Автозапуск относится к входу пользователя, а не к системному сервису до входа. Первый reboot Windows должен проверить пользователь; агент VM не запускает.

## macOS: только executor — 0.6.91

[Контракт](../planning/codex-local-mac-removal.md); устройство — [ARCHITECTURE](../architecture/ARCHITECTURE.md), раздел «Один backend macOS — 0.6.91».

- Состояние: `~/Library/Application Support/WebPilotCodexExecutor` (`source`, `runtime/venv`, `runtime/tunnel-client`, `private/selector.json`, `private/tunnel-key`, `private/tunnel-profile`, журналы, `*.pid.json`). MCP — `127.0.0.1:17852/mcp`, health tunnel-client — `127.0.0.1:17853`.
- Установка: `control.py setup` встроенным `uv` (Python 3.13, пакет `mcp`, tunnel-client с проверкой SHA-256). Требуются Xcode Command Line Tools (системный Python для запуска `control.py`) и Codex; без Codex — `CODEX_NOT_FOUND` до каких-либо загрузок.
- Запуск: при входе в macOS — LaunchAgent `com.oleynik.WebPilotCodexExecutor` (`selector-start`); при запуске Web Pilot — `MacRuntimeSwitcher.activate`, которая останавливает службы, обновляет исходники и запускает их снова. Process identity, отказ трогать чужой процесс или порт и остановка по группе — как в разделах об executor выше.
- Без туннеля службы не считаются сломанными: MCP работает, статус сообщает `tunnel.configured = false`, мастер просит ID и ключ.
- Прежний runtime: его процессы, копия в данных приложения и LaunchAgent `com.oleynik.CodexLocalMac` убираются один раз; `~/Library/Application Support/CodexLocalMac` и `~/VSCODE/Codex Local Mac` остаются пользователю.
