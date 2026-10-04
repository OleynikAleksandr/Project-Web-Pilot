# MCP App Server без сессий — релиз 0.6.84

Проверка пользователя 04.10.2026 после 0.6.83: канал ChatGPT — VPS, агент в новом проекте вызвал `run_command_batch` и получил `McpServerError: Session terminated`.

## Причина

Сервер MCP «Codex App Server Local Mac» работал в режиме сессий (`Mcp-Session-Id`). Web Pilot перезапускает его при каждом своём старте; ChatGPT держит идентификатор сессии прошлого процесса, новый процесс отвечает `404 Session not found` (воспроизведено через сервер: `POST /mcp` с чужим `Mcp-Session-Id` → 404), и ChatGPT не переподключается. Через Secure MCP Tunnel проблема не проявлялась: сессию с локальным сервером держал tunnel-client.

## Результат

- Сервер MCP App Server работает без сессий (`FastMCP(stateless_http=True)`): каждый запрос самостоятелен, устаревший `Mcp-Session-Id` игнорируется. Перезапуск Web Pilot и MCP не ломает коннекторы ChatGPT и Claude через VPS; уже сохранённая у ChatGPT сессия начинает работать без переподключения.
- Уведомлений сервера внутри сессии MCP нет (уведомления macOS идут через osascript), поэтому режим без сессий ничего не отнимает. `LocalMcpClient` Web Pilot и проверка готовности `control.py` работают без идентификатора сессии.
- Релиз **0.6.84**: версия → DOCS → парная сборка → установка в `/Applications` → GitHub Release и синхронизация `main`.

## Проверка

- `executor-channel`: тест запускает настоящий `server.py` из runtime venv (пропускается, если venv нет) и вызывает `tools/list` с устаревшим `Mcp-Session-Id` без `initialize` — ответ 200 со списком инструментов, без нового `Mcp-Session-Id`.
- `unit-all`: весь `npm test`.
- Живая проверка после установки: повторить задание агенту в проекте Test_VPS_01 (канал VPS).

## Границы

- Внешний runtime **Codex Local Mac** (`/Users/oleksandroliinyk/VSCODE/Codex Local Mac`) не меняется: в режиме Codex Local Mac канал VPS после перезапуска MCP по-прежнему может давать `Session terminated`. Исправление там — отдельная задача.
- Ограничение Workflow Kit: в план с завершённым delivery-хвостом нельзя добавить задачи — `plan:extend` переносит DOCS в конец, и выполненная сборка, зависящая от DOCS, нарушает порядок (`DEPENDENCY_ORDER`). Поэтому scope `chatgpt-channel-vps-20261004` закрыт в архив, а исправление идёт отдельным планом.
