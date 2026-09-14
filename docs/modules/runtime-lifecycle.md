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

macOS package содержит чистый runtime source snapshot и bootstrap tool (`uv`) для arm64-сборки. При отсутствии external runtime source разворачивается в writable `userData/runtime/Codex-Local-Mac`, после чего выполняется setup для выбранного workspace. Python environment и tunnel-client устанавливаются runtime setup. Если tunnel credentials ещё не настроены, приложение завершает локальный MCP bootstrap и показывает единственное необходимое действие пользователя для первичной настройки tunnel.

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
