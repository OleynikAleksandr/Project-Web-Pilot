# Module Specification — Runtime Lifecycle

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
