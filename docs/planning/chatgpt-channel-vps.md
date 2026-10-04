# Переключатель канала ChatGPT: Secure MCP Tunnel ↔ VPS

Поручение пользователя 04.10.2026: в Project Web Pilot сделать переключатель канала, через который ChatGPT достаёт локальный MCP, — OpenAI Secure MCP Tunnel или собственный сервер (VPS). Место — «Настройки», под переключателем «Локальные инструменты macOS». Сервер и туннель уже настроены в репозитории `vps-server` (`HANDOFF-webpilot-vps-mcp.md`).

## Результат

- В «Настройках» под «Локальные инструменты macOS» — раздел **«Подключение ChatGPT»** с двумя кнопками: **Secure MCP Tunnel** и **VPS**.
  - Secure MCP Tunnel — как сейчас: Web Pilot и автозапуск macOS держат tunnel-client.
  - VPS — tunnel-client не запускается ни Web Pilot, ни автозапуском при входе в macOS; ChatGPT работает через коннектор на адрес сервера.
- **Канал VPS работает всегда, когда настроен**, независимо от выбора для ChatGPT: через него ходит Claude. Web Pilot держит проброс на текущий порт MCP выбранного runtime: при смене runtime (Codex Local Mac ↔ Codex App Server Local Mac) проброс перенастраивается сам.
- Статус в разделе: выбранный канал ChatGPT и его готовность; состояние VPS (процесс туннеля, совпадение порта проброса с портом MCP, последняя ошибка из журнала). Публичный адрес с Mac не проверяется (сервер пускает только адреса Anthropic и OpenAI) — это не ошибка.
- Адрес коннектора VPS показывается скрытым (`https://<сервер>/mcp/…/mcp`) с кнопкой «Скопировать». Полный адрес читается из `~/.config/vps-server/mcp-url` только для копирования, не логируется и не хранится в настройках Web Pilot.
- По умолчанию остаётся Secure MCP Tunnel; на VPS пользователь переключает сам, когда проверит ChatGPT через сервер. tunnel-client и его настройки не удаляются.

## Устройство

- **Выбор канала** хранится в настройках Web Pilot (`chatgptChannel`: `secure-tunnel` | `vps`) и в `selector.json` executor (`chatgpt_channel`), чтобы автозапуск `control.py selector-start` при входе в macOS соблюдал выбор без открытого Web Pilot. Переключение канала не перезапускает Web Pilot: при VPS останавливается только tunnel-client, при Secure Tunnel он запускается и проверяется.
- **Туннель VPS** — LaunchAgent `com.oleynik.vps-mcp-tunnel` (KeepAlive переподключает после обрыва и перезагрузки сервера): `ssh -N -o BatchMode=yes -o ExitOnForwardFailure=yes -o ServerAliveInterval=30 -o ServerAliveCountMax=3 -R 127.0.0.1:17842:127.0.0.1:<порт MCP> vps-mcp-tunnel`. Порт проброса — в аргументах plist; Web Pilot переписывает plist и перезагружает агент, только если порт изменился. Параметры подключения (`HostName`, `User mcptunnel`, ключ) остаются в блоке `Host vps-mcp-tunnel` файла `~/.ssh/config`, который создаёт `vps-server/setup/mcp-tunnel.sh`.
- **Настроен ли VPS:** есть блок `Host vps-mcp-tunnel` (`ssh -G` даёт реальный hostname) и файл адреса коннектора. Если в блоке остался `RemoteForward` (старый формат `mcp-tunnel.sh`), Web Pilot агент не перехватывает и пишет в статусе, что нужно обновить настройку из `vps-server`.
- В режиме VPS поле `tunnel` статуса runtime отражает канал VPS, поэтому индикатор «Локальные инструменты: Готовы» и проверки готовности работают без отдельной ветки.

## Проверка

- `executor-channel`: тесты `control.py` — `configure-channel`, `stop --tunnel-only`, `selector-start` в режиме VPS не запускает и останавливает tunnel-client, в режиме Secure Tunnel запускает; неизвестный канал отклоняется.
- `vps-runtime`: тесты модуля туннеля VPS (plist с портом, перезагрузка только при смене порта, статус по `launchctl print`, отказ при `RemoteForward` в конфиге, адрес не попадает в статус) и переключателя runtime (канал VPS не запускает tunnel-client, смена runtime перенастраивает проброс, ошибка VPS не ломает режим Secure Tunnel).
- `settings-ui`: JSDOM-тесты раздела «Подключение ChatGPT» — кнопки, состояние, скрытый адрес, копирование, недоступность VPS без настройки.
- `unit-all`: весь `npm test`.
- Живая проверка — после установки сборки с этой функцией: переключение каналов в Настройках, `bash ../vps-server/setup/check-mcp.sh`, вызов инструмента Web Pilot из ChatGPT и Claude. Сборка и релиз в этот план не входят — только по отдельному поручению.

## Границы

- Только macOS; Windows — отдельный этап.
- Сервер, его маршрут и `~/.ssh/config` настраиваются только из `vps-server`; там же — переход `mcp-tunnel.sh` на проброс в аргументах plist (без `RemoteForward` в конфиге) до установки новой сборки.
- Маршрут `/v1`, пользователь `wpstunnel`, служба `com.oleynik.wps-tunnel` — не трогать.
- Секрет и полный адрес коннектора не попадают в репозиторий, журналы, диагностику, настройки и чат.
- OAuth для коннекторов — позже.
