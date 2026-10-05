# Computer Use убран из MCP — релиз 0.6.90

Поручение пользователя 05.10.2026: полностью убрать у веб-модели возможность управлять интерфейсом компьютера через MCP Web Pilot. Передача Computer Use локальному агенту в этот этап не входит и не готовится.

Решения пользователя 05.10.2026: снимок экрана остаётся; Windows чистится в этом же релизе; в правила добавляется текстовый запрет; Codex Local Mac удаляется целиком отдельным релизом 0.6.91 ([контракт](codex-local-mac-removal.md)).

## Что показал осмотр кода (main `7b1d77b`, 0.6.89)

- macOS, `tools/codex-app-server-mcp/server.py`: 48 инструментов, из них 13 `computer_*`. Одиннадцать работают через `node_repl → @oai/sky`, `computer_move_mouse` — через Swift, `computer_capture_screen` — через `/usr/sbin/screencapture` и от Sky не зависит.
- `tools/codex-app-server-mcp/app_server_client.py`: `ensure_mcp_thread`, `mcp_status_list`, `mcp_tool_call` и служебный `thread/start` с `danger-full-access` существуют только ради `node_repl`; других вызовов в коде нет.
- Windows: закреплённый `Windows-Codex-Local-2026-09-10.zip` содержит 12 `computer_*` в `mcp/bridge_mcp.py` (46 инструментов, с overlay Web Pilot — 47). `instructions` сервера — это `skills/local-computer/SKILL.md` с разделом «Desktop». Web Pilot уже правит `bridge_mcp.py` при установке runtime: `patchWindowsBridgeSource` в `src/windows-runtime.mjs`.
- Правило про модельных агентов доставляется двумя путями: `tools/codex-app-server-mcp/session-rules.md` (режим MCP) и `src/context-session.mjs` (режим первого сообщения: Windows и Codex Local Mac).

## Результат

1. **macOS, App Server.** Из каталога удалены 12 инструментов: `computer_status`, `computer_list_windows`, `computer_activate_window`, `computer_capture_window`, `computer_move_mouse`, `computer_click`, `computer_scroll`, `computer_type_text`, `computer_key_press`, `computer_hotkey`, `computer_actions`, `computer_release_inputs`. `computer_capture_screen` остаётся с прежним именем и поведением. Каталог: 48 → 36.
2. Удалён код, который после этого нигде не вызывается (проверить поиском): в `server.py` — `_sky`, `_sky_json`, `_sky_key`, `_chord`, `_action_js`, `_active_app`, `_swift`, `_window`, учёт окон, таблица клавиш, `_ACTION_LIMIT`, `_active_app_id`; в `app_server_client.py` — три метода MCP-thread, `_thread_id` и `mcp_thread_id` в статусе. Executor больше не зависит от плагина Computer Use внутри Codex и не создаёт thread с полным доступом.
3. `bridge_status` не содержит поля `computer_use`. В `instructions` сервера фраза про `node_repl/@oai/sky` заменена одной: управления мышью, клавиатурой и окнами нет, `computer_capture_screen` только делает снимок. Первые 512 символов `instructions` (порядок чтения контекста) не меняются.
4. **Windows.** Overlay Web Pilot убирает из `bridge_mcp.py` 11 инструментов (те же, кроме отсутствующего там `computer_actions`) и строку `computer_use` в `bridge_status`, а раздел «Desktop» в `SKILL.md` заменяет коротким текстом: управления нет, снимок через `computer_capture_screen`. Каталог Windows: 47 → 36. Overlay применяется и к новой установке, и к уже установленному runtime при обновлении Web Pilot.
5. Overlay идемпотентен и закрыт на отказ: если в ещё не изменённом bridge блок любого из 11 инструментов или раздел «Desktop» не найден ровно один раз, установка останавливается с `WINDOWS_RUNTIME_BRIDGE_INVALID`. Закреплённый ZIP и его SHA-256 не меняются.
6. **Правило.** В `session-rules.md` и в правила первого сообщения (`src/context-session.mjs`) добавлена строка:

   > Интерфейсом компьютера не управляй: не двигай мышь, не нажимай клавиши и не переключай окна — ни инструментами, ни командами (osascript, System Events, cliclick и подобными). Снимок экрана через `computer_capture_screen` разрешён. Живую проверку интерфейса выполняет пользователь.

   Запрет текстовый: `run_command` и `start_process` остаются, технической блокировки нет.
7. `scripts/benchmark-codex-app-server-mcp.mjs` не вызывает `computer_status`.
8. Релиз **0.6.90**: версия → DOCS → парная сборка → установка в `/Applications` → GitHub Release и синхронизация `main`. Workflow Kit не меняется (1.5.5).

## Запуск

Установить 0.6.90 и перезапустить Web Pilot. В настройках плагина ChatGPT и подключения Claude нажать «Обновить инструменты»: клиенты хранят прежний каталог.

## Проверка

- `executor-channel` (`tests/codex-app-server-mcp.test.mjs`): в `server.py` нет ни одного из 12 имён, нет `node_repl` и `@oai/sky`; `computer_capture_screen` есть; `@mcp.tool` ровно 36. Тест клиента App Server проходит без MCP-thread и `arithmetic_probe`. Тесты клавиш, `computer_actions` и «actions route through Sky» удалены. `session-rules.md` содержит новую строку.
- `windows-overlay` (`tests/windows-runtime.test.mjs`): на фрагменте bridge — 11 имён удалены, `computer_capture_screen` и `workflow_context_recover` на месте, повторный патч ничего не меняет, повреждённый блок даёт `WINDOWS_RUNTIME_BRIDGE_INVALID`. На настоящем `bridge_mcp.py` и `SKILL.md` из закреплённого ZIP (тест пропускается, если ZIP нет в `.harness/runtime/windows-payload`): 36 инструментов, результат проходит `python3 -m py_compile`, в `SKILL.md` нет прежнего раздела «Desktop».
- `release-source`: `tests/context-session.test.mjs` проверяет новую строку в первом сообщении.
- `unit-all`: весь `npm test`.
- `paired-release`, `release-installed`, `github-release` — как в 0.6.89, для версии 0.6.90.
- Вживую — пользователь: после «Обновить инструменты» в ChatGPT и Claude каталог показывает 36 инструментов без управления интерфейсом; `computer_capture_screen` возвращает снимок; `scripts/check-mac-screen-capture.mjs` проходит как раньше. Native Windows — отдельно.

## Границы

- Локальный агент, универсальный Computer Use MCP и инструменты поручения проверки интерфейса не делаются и не подготавливаются.
- Codex Local Mac (режим `local` на macOS) в 0.6.90 не меняется и сохраняет свои `computer_*`; он удаляется целиком в 0.6.91. Запрет из п. 6 действует и в этом режиме.
- `scripts/check-mac-screen-capture.mjs`, разрешение на запись экрана и подпись UkrHD — без изменений.
- Команды в `run_command` и `start_process` не фильтруются.
- Исторические документы и разделы прошлых выпусков не переписываются.
- Native Windows и чистую VM проверяет пользователь; агент не запускает VM и не использует Computer Use.
