# Управление интерфейсом убрано из MCP — релиз 0.6.90

Поручение пользователя 05.10.2026: полностью убрать у веб-модели возможность управлять интерфейсом компьютера через MCP Web Pilot. Передача Computer Use локальному агенту в этот этап не входит и не готовится.

Решения пользователя 05.10.2026: снимки экрана и окна остаются; Windows чистится в этом же релизе; в правила добавляется текстовый запрет; Codex Local Mac удаляется целиком отдельным релизом 0.6.91 ([контракт](codex-local-mac-removal.md)).

## Что показал осмотр кода (main `7b1d77b`, 0.6.89)

- macOS, `tools/codex-app-server-mcp/server.py`: 48 инструментов, из них 13 `computer_*`. Одиннадцать работают через `node_repl → @oai/sky`, `computer_move_mouse` — через Swift, `computer_capture_screen` — через `/usr/sbin/screencapture` и от Sky не зависит.
- `computer_list_windows` и `computer_capture_window` на macOS сейчас тоже идут через Sky: список — это приложения из `sky.list_apps` с условными номерами, снимок — `sky.get_app_state`.
- `tools/codex-app-server-mcp/app_server_client.py`: `ensure_mcp_thread`, `mcp_status_list`, `mcp_tool_call` и служебный `thread/start` с `danger-full-access` существуют только ради `node_repl`; других вызовов в коде нет.
- Windows: закреплённый `Windows-Codex-Local-2026-09-10.zip` содержит 12 `computer_*` в `mcp/bridge_mcp.py` (46 инструментов, с overlay Web Pilot — 47); список окон и оба снимка там собственные. `instructions` сервера — это `skills/local-computer/SKILL.md` с разделом «Desktop». Web Pilot уже правит `bridge_mcp.py` при установке runtime: `patchWindowsBridgeSource` в `src/windows-runtime.mjs`.
- Правило про модельных агентов доставляется двумя путями: `tools/codex-app-server-mcp/session-rules.md` (режим MCP) и `src/context-session.mjs` (режим первого сообщения: Windows и Codex Local Mac).

## Результат

1. **Остаются на обеих платформах** три инструмента наблюдения с прежними именами: `computer_capture_screen`, `computer_capture_window`, `computer_list_windows`. Список окон нужен снимку окна: он даёт `window_id`.
2. **macOS, App Server.** Из каталога удалены 10 инструментов: `computer_status`, `computer_activate_window`, `computer_move_mouse`, `computer_click`, `computer_scroll`, `computer_type_text`, `computer_key_press`, `computer_hotkey`, `computer_actions`, `computer_release_inputs`. Каталог: 48 → 38.
3. **Список и снимок окна на macOS работают без Sky**, системными средствами и без новых зависимостей. `computer_list_windows` возвращает видимые окна из CoreGraphics (`CGWindowListCopyWindowInfo`): системный номер окна как `window_id`, заголовок, приложение, PID, прямоугольник; фильтр `title_contains` и предел `max_results` сохраняются. `computer_capture_window` снимает окно через `/usr/sbin/screencapture -l <window_id>` и масштабирует по `max_dimension`, как снимок экрана. Способ чтения списка (JXA через `/usr/bin/osascript` или `swift -e`) выбирается в T001: он должен работать без Xcode Command Line Tools. Снимок окна больше не возвращает текст интерфейса приложения, который добавлял Sky.
4. Удалён код, который после этого нигде не вызывается (проверить поиском): в `server.py` — `_sky`, `_sky_json`, `_sky_key`, `_chord`, `_action_js`, `_active_app`, таблица клавиш, `_ACTION_LIMIT`, `_active_app_id`, учёт приложений Sky; в `app_server_client.py` — три метода MCP-thread, `_thread_id` и `mcp_thread_id` в статусе. Executor больше не зависит от плагина Computer Use внутри Codex и не создаёт thread с полным доступом.
5. `bridge_status` не содержит поля `computer_use`. В `instructions` сервера фраза про `node_repl/@oai/sky` заменена одной: управления мышью, клавиатурой и окнами нет; доступны список окон и снимки экрана и окна. Первые 512 символов `instructions` (порядок чтения контекста) не меняются.
6. **Правило.** В `session-rules.md` и в правила первого сообщения (`src/context-session.mjs`) добавлена строка:

   > Интерфейсом компьютера не управляй: не двигай мышь, не нажимай клавиши и не переключай окна — ни инструментами, ни командами (osascript, System Events, cliclick и подобными). Список окон и снимки экрана и окна (`computer_list_windows`, `computer_capture_screen`, `computer_capture_window`) разрешены. Живую проверку интерфейса выполняет пользователь.

   Запрет текстовый: `run_command` и `start_process` остаются, технической блокировки нет.
7. **Windows.** Overlay Web Pilot убирает из `bridge_mcp.py` 9 инструментов (те же, что на macOS, кроме отсутствующего там `computer_actions`) и строку `computer_use` в `bridge_status`, а раздел «Desktop» в `SKILL.md` заменяет коротким текстом: управления нет, доступны список окон и снимки. Каталог Windows: 47 → 38. Свёрнутое окно на Windows снять нельзя: активация окна удалена. Overlay применяется и к новой установке, и к уже установленному runtime при обновлении Web Pilot.
8. Overlay идемпотентен и закрыт на отказ: если в ещё не изменённом bridge блок любого из 9 инструментов или раздел «Desktop» не найден ровно один раз, установка останавливается с `WINDOWS_RUNTIME_BRIDGE_INVALID`. Закреплённый ZIP и его SHA-256 не меняются.
9. `scripts/benchmark-codex-app-server-mcp.mjs` не вызывает `computer_status`.
10. Релиз **0.6.90**: версия → DOCS → парная сборка → установка в `/Applications` → GitHub Release и синхронизация `main`. Workflow Kit не меняется (1.5.5).

## Запуск

Установить 0.6.90 и перезапустить Web Pilot. В настройках плагина ChatGPT и подключения Claude нажать «Обновить инструменты»: клиенты хранят прежний каталог.

## Проверка

- `executor-channel` (`tests/codex-app-server-mcp.test.mjs`): в `server.py` нет ни одного из 10 имён, нет `node_repl` и `@oai/sky`; три инструмента наблюдения есть; `@mcp.tool` ровно 38. На поддельном исполнителе команд: снимок окна вызывает `screencapture -l <window_id>`, неверный `window_id` отклоняется до запуска команды, список окон разбирает ответ системной команды и применяет фильтр. Тест клиента App Server проходит без MCP-thread и `arithmetic_probe`. Тесты клавиш, `computer_actions` и «actions route through Sky» удалены. `session-rules.md` содержит новую строку.
- `windows-overlay` (`tests/windows-runtime.test.mjs`): на фрагменте bridge — 9 имён удалены, три инструмента наблюдения и `workflow_context_recover` на месте, повторный патч ничего не меняет, повреждённый блок даёт `WINDOWS_RUNTIME_BRIDGE_INVALID`. На настоящем `bridge_mcp.py` и `SKILL.md` из закреплённого ZIP (тест пропускается, если ZIP нет в `.harness/runtime/windows-payload`): 38 инструментов, результат проходит `python3 -m py_compile`, в `SKILL.md` нет прежнего раздела «Desktop».
- `release-source`: `tests/context-session.test.mjs` проверяет новую строку в первом сообщении.
- `unit-all`: весь `npm test`.
- `paired-release`, `release-installed`, `github-release` — как в 0.6.89, для версии 0.6.90.
- Вживую — пользователь: после «Обновить инструменты» в ChatGPT и Claude каталог показывает 38 инструментов без управления интерфейсом; `computer_capture_screen` возвращает снимок; `computer_list_windows` показывает открытые окна с заголовками, `computer_capture_window` возвращает снимок выбранного окна, в том числе перекрытого другим; `scripts/check-mac-screen-capture.mjs` проходит как раньше. Native Windows — отдельно.

## Границы

- Локальный агент, универсальный Computer Use MCP и инструменты поручения проверки интерфейса не делаются и не подготавливаются.
- Codex Local Mac (режим `local` на macOS) в 0.6.90 не меняется и сохраняет свои `computer_*`; он удаляется целиком в 0.6.91. Запрет из п. 6 действует и в этом режиме.
- `scripts/check-mac-screen-capture.mjs`, разрешение на запись экрана и подпись UkrHD — без изменений.
- Команды в `run_command` и `start_process` не фильтруются.
- Исторические документы и разделы прошлых выпусков не переписываются.
- Native Windows и чистую VM проверяет пользователь; агент не запускает VM и не использует Computer Use.

## Риски

- Список и снимок окна на macOS — новый код, а не удаление. До T001 он не запускался: чтение `CGWindowListCopyWindowInfo` из JXA и поведение `screencapture -l` проверяются на месте.
- Заголовки окон и снимок окна требуют того же разрешения на запись экрана, что и снимок экрана. Без него список приходит без заголовков; это должно быть видно в ответе инструмента, а не выглядеть как пустой список.

## Итог

- C001 `fb64323` — контракты уточнены: снимок и список окон остаются. T001 `1fb9b8c` — macOS: 10 инструментов и код Sky удалены, список и снимок окна на системных средствах. T002 `216a235` — Windows overlay версии 2. T003 `2b24d35` — правило в обоих режимах доставки. T004 `e301c29` — версия 0.6.90.
- Способ чтения списка окон — JXA (`/usr/bin/osascript -l JavaScript`): около 70 мс, Xcode Command Line Tools не нужны.
- Сверх контракта: bundled Windows runtime со старой версией overlay обновляется на месте, а не переустанавливается из ZIP (иначе правка не дошла бы до уже установленных копий без потери venv).
- Первый запуск `commit --task T004` завершился `PRIVATE_CONTEXT` на `.codex/hooks.json`, хотя файл не менялся; повтор без изменений прошёл. Причина не установлена.
- DOCS `304f6f3`. T005 `52968f8` — первая сборка отклонена: в `app.asar` попала неотслеживаемая папка «Claude outputs» с видео пользователя. T008 `3d441a9` — пересборка из sourceCommit `ee737e2efec453d78c6efe1d5beadece53ecd43c` с временно убранной папкой; файлы первой сборки удалены и не публиковались. T006 `b644fce` — установка в `/Applications` без пересборки.
- T007: [GitHub Release v0.6.90](https://github.com/OleynikAleksandr/Project-Web-Pilot/releases/tag/v0.6.90) опубликован 2026-10-05T07:48:47Z, пять assets сверены по серверным SHA-256.
- Не сделано в этом релизе: исправление упаковщика (только приложение в пакете и проверка состава `app.asar`). Workflow Kit 1.5.5 не принимает кодовую задачу после завершённой delivery-задачи, поэтому оно — первая задача 0.6.91.
