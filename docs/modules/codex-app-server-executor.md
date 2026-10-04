# Module Specification — Codex App Server Local Executor

Связанные проекты (02.10.2026): **Workflow Kit** — планы и recovery; **Web Pilot Sidebar** — отдельно разрабатываемый браузерный интерфейс. [Рабочие каталоги и границы интеграции](../SOURCE_WORKSPACES.md).

## Назначение

Экспериментальный модуль scope `codex-app-server-mcp-035` проверяет, можно ли заменить собственный исполнитель Codex Local Mac тонким MCP-адаптером к официальному Codex App Server без изменения кода Project Web Pilot. Модель остаётся в ChatGPT Web и сама принимает решения; Codex используется только как локальный runtime и MCP host. Запуск модельного цикла Codex через `turn/start` запрещён.

## Архитектура

```text
ChatGPT Web
    |
Secure MCP Tunnel
    |
Codex App Server Local MCP
    |
    +-- direct App Server methods
    |     command/exec
    |     fs/readFile
    |     fs/writeFile
    |     fs/readDirectory
    |
    +-- App Server MCP manager
          mcpServerStatus/list
          mcpServer/tool/call
                |
                +-- node_repl -> @oai/sky -> Computer Use
                +-- явно разрешённые локальные downstream MCP
```

Адаптер не пересылает поручение второму агенту, не вызывает Responses API и не должен инициировать `turn/start`. Разрешены служебный `thread/start` для привязки MCP manager и прямые App Server requests, которые сами не выполняют модельный turn.

## Границы

Модуль является отдельным экспериментальным runtime и не заменяет production Runtime Lifecycle Web Pilot. Он не изменяет:

- `src/**` и packaged Web Pilot;
- внешний репозиторий Codex Local Mac;
- его private state, PID records, tunnel credentials или профиль;
- production endpoints 17842/17843;
- Windows runtime.

Эксперимент использует собственные state, MCP port и tunnel profile. После пользовательского A/B старый connector можно вернуть без восстановления файлов или пересборки приложения.

## Local-only boundary

Codex может видеть большой общий каталог MCP и Apps, однако внешний туннельный MCP Web Pilot экспортирует только возможности, для которых нужен доступ именно к локальному компьютеру.

Обязательная поверхность не уже текущего Codex Local Mac:

- локальная файловая система;
- локальный поиск по файлам и содержимому;
- локальные Git operations;
- короткие shell commands и длительные процессы;
- безопасные file mutations и recoverable delete/restore;
- Computer Use;
- Workflow Kit recovery для локального workspace;
- явно разрешённые downstream MCP, если их ценность зависит от этого Mac.

Не экспортируются только потому, что видны Codex:

- публичный web search;
- публичная документация;
- облачные/browser capabilities, уже имеющиеся у Web ChatGPT;
- общий `codex_apps` каталог;
- любой downstream MCP без явного local-only allowlist.

Наличие MCP в Codex не является разрешением публиковать его в ChatGPT.

## Facade

Внешний facade сохраняет знакомые семантические операции Codex Local Mac, чтобы A/B сравнивал исполнителей, а не разные пользовательские задачи.

### Status и workspace

- `bridge_status(repository="")`
- `workflow_context_recover(workspace, session_id="")`
- `list_drives()`

### Files

- `file_info`
- `list_directory`
- `read_file`
- `read_binary`
- `search_files`
- `search_text`
- `make_directory`
- `write_file`
- `write_binary`
- `patch_binary`
- `replace_text`
- `apply_patch`
- `copy_path`
- `move_path`
- `delete_path`
- `list_trash`
- `restore_trash`

### Commands/processes

- `run_command`
- `run_command_batch`
- `start_process`
- `process_status`
- `read_process_output`
- `list_processes`
- `stop_process`

Совместимость: stop_process(process_id, force=False) сохраняет параметр force в схеме MCP. Текущий App Server command/exec/terminate не различает его значение; изменение этой схемы требует отдельной задачи совместимости. Очистка Python-кода 02.10.2026 удалила только непрочитываемые импорты/поля и старый _keycode, сохранив все 47 зарегистрированных инструментов и действующий путь Sky.

### Repository/Git

- `list_repository_tree`
- `read_repository_file`
- `search_repository`
- `git_status`
- `git_diff`
- `git_log`
- `git_show`

### Computer Use

Для Computer Use адаптер не проксирует сломанную compatibility-запись `computer-use`. Актуальный bundled plugin Codex определяет рабочий путь как `node_repl + @oai/sky`.

Внешние инструменты сохраняют высокоуровневую поверхность:

- `computer_status`
- `computer_list_windows`
- `computer_activate_window`
- `computer_capture_screen`
- `computer_capture_window`
- `computer_move_mouse`
- `computer_click`
- `computer_scroll`
- `computer_type_text`
- `computer_key_press`
- `computer_hotkey`
- `computer_release_inputs`

Внутри они вызывают `mcpServer/tool/call(server=node_repl, tool=js)`; JavaScript импортирует bundled `@oai/sky` и вызывает его API. Если App Server/Node REPL не способен предоставить эквивалентную локальную возможность, это фиксируется как ограничение A/B, а не скрывается уменьшением каталога.

## Codex binary discovery

Исполнитель обязан явно показывать используемый бинарник и версию в status. Порядок:

1. `CODEX_APP_SERVER_BIN`, если задан абсолютный executable path;
2. user-installed `codex` из известных пользовательских locations/PATH;
3. bundled binary ChatGPT.app только как fallback после проверки требуемого App Server protocol.

Нельзя молча переключаться между разными установленными Codex. На текущем Mac одновременно наблюдались user-installed 0.155.1 и bundled ChatGPT 0.155.0-alpha.9.2; A/B должен фиксировать точный path/version.

## App Server client contract

Клиент использует JSON-RPC over stdio и один долгоживущий App Server process.

Обязательные свойства:

- `initialize` выполняется один раз на generation;
- requests демультиплексируются по `id`;
- server notifications обрабатываются независимо от responses;
- streaming `command/exec/outputDelta` привязывается к client-supplied `processId`;
- после неожиданного exit generation признаётся dead и следующий вызов выполняет контролируемый restart;
- `close()` завершает только принадлежащий адаптеру App Server;
- никакой request path не содержит `turn/start`.

Для доступа к downstream MCP создаётся ephemeral thread. Сам `thread/start` не является модельным turn и используется только как scope для `mcpServerStatus/list` / `mcpServer/tool/call`.

## Computer Use contract

Computer Use считается частью обязательного локального паритета. Источник возможностей — bundled plugin Computer Use через `node_repl + @oai/sky`.

Безопасность:

- read-only inspection разрешено без побочных действий;
- клики, typing, scrolling и другие UI actions имеют честные destructive/open-world annotations;
- sensitive input не логируется adapter-ом;
- permission/confirmation semantics Codex/Computer Use не обходятся;
- отсутствие Accessibility/Screen Recording или недоступный Sky backend возвращается явной ошибкой.

## Downstream MCP allowlist

Passthrough не является generic «call anything». Конфигурация перечисляет разрешённые server names и при необходимости разрешённые tools. Начальная версия допускает только локальные MCP, необходимые для A/B; публичные/облачные server names отклоняются даже если App Server их видит.

## State и tunnel

Экспериментальный runtime использует по умолчанию:

- state: `~/Library/Application Support/WebPilotCodexExecutor`;
- MCP: `127.0.0.1:17852/mcp`;
- tunnel health: `127.0.0.1:17853`;
- отдельный tunnel profile/private config.

Credentials принимаются только через stdin/private file с mode 0600. Они не входят в argv, stdout/stderr, Git, diagnostics или ChatGPT response.

## A/B invariants

Перед пользовательским сравнением должны выполняться условия:

1. старый Codex Local Mac не изменён;
2. новый MCP имеет отдельный endpoint и process identity;
3. Web Pilot не пересобран;
4. одинаковые локальные сценарии можно выполнить через оба connector-а;
5. catalog parity сравнивается по capabilities, включая Computer Use;
6. публичные/облачные дубли отсутствуют в новом catalog;
7. benchmark отдельно измеряет local execution и end-to-end tunnel path;
8. решение о production replacement не принимается автоматически.

## Не входит в scope

- изменение Web Pilot UI/runtime integration;
- Windows implementation;
- замена production Codex Local Mac;
- собственная новая реализация Computer Use;
- оптимизация Programmatic Tool Calling;
- автоматическое включение всех MCP из общего каталога Codex.

## Реализованный lifecycle T004

Экспериментальный control находится в `tools/codex-app-server-mcp/control.py` и использует только собственный namespace:

- state: `~/Library/Application Support/WebPilotCodexExecutor`;
- runtime venv: `state/runtime/venv`;
- copied/verified tunnel-client: `state/runtime/tunnel-client`;
- MCP: `127.0.0.1:17852/mcp`;
- tunnel health/UI: `127.0.0.1:17853`;
- private profile/key: `state/private/**`.

Команды:

```bash
python3 tools/codex-app-server-mcp/control.py setup
python3 tools/codex-app-server-mcp/control.py configure-tunnel
python3 tools/codex-app-server-mcp/control.py start
python3 tools/codex-app-server-mcp/control.py status
python3 tools/codex-app-server-mcp/control.py stop
```

`configure-tunnel` спрашивает runtime key через скрытый `getpass`; для автоматизированного теста есть `--key-stdin`. Ключ хранится mode 0600, в profile находится только ссылка на отдельную environment variable. Status и diagnostics ключ не возвращают.

Control хранит PID + process identity и перед signal повторно сверяет identity. Чужой PID/занятый port не завершается. Readiness MCP проверяется собственным runtime Python, поэтому системный Python не обязан иметь пакет `mcp`.

19.09.2026 реальный `setup` создал отдельный Python 3.13 venv и установил `mcp==1.28.1`; tunnel-client 0.0.14 скопирован как отдельный runtime executable. `start --mcp-only` подтвердил ready=true на 17852. Production Codex Local Mac одновременно сохранил ready=true на 17842 и его tunnel ready=true; его state/credentials не менялись.


## T005 — A/B contract и фактический benchmark

Финальный локальный benchmark запускается командой:

```bash
node scripts/benchmark-codex-app-server-mcp.mjs --iterations 10
```

19.09.2026 на одном Mac, при одновременно работающих loopback MCP:

| Операция | Codex Local Mac median | Codex App Server MCP median |
| --- | ---: | ---: |
| file_info | 2.15 ms | 3.11 ms |
| read_file | 2.18 ms | 3.01 ms |
| git_status | 16.85 ms | 16.93 ms |
| search_text | 11.95 ms | 10.92 ms |
| run_command_batch | 19.58 ms | 18.68 ms |
| computer_status | 4.95 ms | 23.80 ms |

Каталог: **47 / 47** одинаковых tool names; missing=0, extra=0, cloud duplicates=0. Ранний вариант давал ~620 ms для `git_status` из-за App Server read-only sandbox/Xcode cache; fixed internal argv переведены на `dangerFullAccess`, после чего Git сравнялся со старым runtime. Это не расширяет внешний tool surface: generic App Server command или `node_repl` наружу не публикуются.

Computer Use: внутренний ephemeral App Server thread использует `sandbox=danger-full-access`, но `turn/start` жёстко запрещён клиентом. Именно этот режим нужен bundled `node_repl -> @oai/sky`: read-only thread позволял `list_apps`, но отклонял `get_app_state`. После исправления внешний `computer_capture_window` успешно получил Finder state и image через канонический Sky screenshot flow `file:// -> bytes -> nodeRepl.emitImage`, без UI action.

Ограничение A/B: `computer_list_windows` в experimental facade сейчас отображает Sky applications как стабильные compatibility IDs, а production Codex Local Mac возвращает реальные Quartz top-level windows. Поэтому tool catalog полностью совпадает, Computer Use функционально работает, но точный window-granularity contract требует пользовательской проверки до решения о production replacement.

### Пользовательское A/B переключение

1. В OpenAI Platform создать **второй** Secure MCP Tunnel, связанный с тем же ChatGPT workspace. Старый tunnel Codex Local Mac не менять.
2. Для runtime нового tunnel использовать отдельный key с требуемыми Secure MCP Tunnel permissions. Key не передавать в чат.
3. В Terminal из корня Project Web Pilot выполнить:
   `python3 tools/codex-app-server-mcp/control.py configure-tunnel`.
   Ввести новый `tunnel_id`, затем hidden runtime key.
4. Выполнить `python3 tools/codex-app-server-mcp/control.py start`, затем `python3 tools/codex-app-server-mcp/control.py status`. У нового MCP и tunnel должно быть `ready=true`.
5. В ChatGPT: основной sidebar → Plugins → `+` → Connection: Tunnel → выбрать новый tunnel → No authentication. Дождаться списка **47 tools**.
6. Отключить connector **Codex Local Mac** и оставить включённым новый connector. Старый локальный процесс останавливать для A/B не требуется.
7. Перезапустить Web Pilot или открыть новую Chat/Work-сессию, чтобы гарантированно получить свежий tool catalog.
8. Выполнить одинаковые локальные задания через старый и новый connector, отдельно проверить Computer Use.
9. Rollback: отключить новый connector, снова включить Codex Local Mac. При желании остановить experimental runtime командой `python3 tools/codex-app-server-mcp/control.py stop`. Web Pilot не пересобирается.

Решение о замене production MCP принимается только после этого пользовательского A/B.


## T006 — стабильная process identity из Terminal

После пользовательской проверки 19.09.2026 обычный Terminal дважды возвращал `Recorded MCP PID belongs to another process`, хотя PID 1951 действительно принадлежал experimental MCP. Диагностика показала, что сохранённая identity использует вывод macOS `ps -o lstart,command`; поле `lstart` locale-sensitive, поэтому одна и та же process identity могла форматироваться по-разному в разных средах запуска.

`control.py::pid_identity` теперь всегда запускает `/bin/ps` с `LC_ALL=C` и `LANG=C`. Это сохраняет защиту от PID reuse, но делает строковую identity независимой от locale Finder/Codex/Terminal.

Regression подменяет `subprocess.run` и подтверждает передачу обоих значений `C` даже когда родительская среда имеет `ru_RU.UTF-8`. Дополнительно реальный status с `LANG=LC_ALL=ru_RU.UTF-8` распознал существующий PID 1951 как `owned=true, ready=true`.

После исправления `control.py start` с уже сохранёнными пользователем credentials успешно запустил отдельный Secure MCP Tunnel: MCP PID 1951 и tunnel PID 36091 имели `running=true, owned=true, ready=true`. Production Codex Local Mac этим запуском не изменялся.


## T007 — Computer Use actions через Sky

Живой A/B через новый ChatGPT connector выявил дефекты прежнего action facade: `computer_hotkey` падал на сгенерированном Swift, а CGEvent-based `computer_type_text` и `computer_key_press` могли вернуть success без фактического изменения приложения. Bundled `computer-use` skill требует выполнять Computer Use через `node_repl + @oai/sky`, поэтому `computer_click`, `computer_scroll`, `computer_type_text`, `computer_key_press` и `computer_hotkey` переведены на Sky.

`computer_activate_window` фиксирует активный app id; app-scoped action без предварительной активации возвращает ошибку. `computer_release_inputs` является compatibility no-op: Sky actions атомарны и не оставляют held key/button state. `computer_move_mouse` остаётся compatibility CoreGraphics operation, потому что Sky API не предоставляет hover-only pointer move.

Direct probe подтвердил, что JavaScript literals проходят через App Server/node_repl без искажения. При этом текущий bundled `sky.type_text` на TextEdit воспроизводимо оставлял только whitespace, тогда как `sky.paste({format:"text"})` вставлял строку точно и восстанавливал clipboard. Поэтому внешний `computer_type_text` использует `sky.paste`, сохраняя семантику ввода текста. Горячие клавиши переводятся в xdotool-style Sky notation, например `["cmd","a"] -> "super+a"`.

Реальный smoke после перезапуска experimental runtime подтвердил фактический эффект: TextEdit получил точный буфер `MCP_UI_TYPED\nSECOND_LINE\n`, а последующий `computer_capture_window` вернул тот же AX Value и image. После correction все 47 tool names нового connector-а были реально вызваны из Web ChatGPT; временный TextEdit закрыт без сохранения, test fixture в `/tmp` удалён, recoverable test-trash восстановлен/очищен.


## T008 — интеграция выбора runtime в Web Pilot

Эксперимент перестаёт требовать параллельного запуска двух локальных MCP. В macOS Web Pilot управляет взаимоисключающими mode `local` и `app-server` через `MacRuntimeSwitcher`. App Server source копируется из release resource в private state, после чего стабильный LaunchAgent может запускать его независимо от исходного репозитория и обновляемого app bundle.

Переключение не удаляет старый Codex Local Mac и не меняет его tunnel credentials: старый runtime только останавливается и его LaunchAgent disable-ится. Возврат в `local` делает обратную операцию. Это обеспечивает мгновенный rollback без восстановления файлов.

## Stable connector correction — scope 036

Предварительный A/B с двумя ChatGPT connector-ами остаётся историей эксперимента. В поставляемом Web Pilot 0.6.47 конечный контракт другой: в ChatGPT сохраняется один connector одного нового Secure MCP Tunnel, а Settings переключает только локальный backend за этим tunnel — `Codex Local Mac` или `Codex App Server Local Mac`.

Private state App Server runtime теперь также владеет selector. При отсутствии уже настроенного experimental tunnel он безопасно принимает существующие credentials Codex Local Mac локально, не выводя key в stdout/renderer/argv; это сохраняет рабочий единственный connector на обычном upgrade. `configure-selector` атомарно сохраняет mode и retarget-ит единственный tunnel profile на проверенный `http://127.0.0.1:<port>/mcp`; `selector-start` после login/reboot останавливает старый local lifecycle через его собственный control, поднимает только выбранный MCP и затем общий tunnel. Старый `com.oleynik.CodexLocalMac` LaunchAgent не удаляется, но остаётся disabled; rollback выполняется тем же Settings control без изменения ChatGPT connector.

Local backend работает `--mcp-only`; App Server backend также отделяет MCP start от `--tunnel-only`. Один внешний catalog из 47 tools остаётся привязан к одному tunnel, поэтому relaunch Web Pilot нужен лишь для обновления tool catalog после смены backend, а не для ручного включения второго connector.

## Канал ChatGPT — 0.6.83

`selector.json` хранит `chatgpt_channel` (`secure-tunnel` по умолчанию или `vps`). `configure-channel --channel <канал>` меняет только это поле; `configure-selector` при смене runtime канал сохраняет и в режиме VPS не требует настроенного Secure Tunnel. `stop --tunnel-only` останавливает только tunnel-client. `selector-start` в режиме VPS останавливает tunnel-client, если он работает, и не запускает его; полный `start` в режиме VPS поднимает только MCP. Туннель VPS держит не executor, а Web Pilot (`src/vps-tunnel.mjs`, LaunchAgent `com.oleynik.vps-mcp-tunnel`). Контракт — [chatgpt-channel-vps](../planning/chatgpt-channel-vps.md).

## Сессии MCP — 0.6.84

`FastMCP` создаётся со `stateless_http=True`: сервер не выдаёт `Mcp-Session-Id` и не проверяет присланный, каждый запрос обрабатывается самостоятельно. Web Pilot перезапускает сервер при каждом старте, а внешние клиенты (ChatGPT и Claude через VPS) хранят идентификатор прошлой сессии; в режиме сессий новый процесс отвечал `404 Session not found`, ChatGPT не переподключался. Инструменты не хранят состояние сессии MCP и не шлют уведомлений внутри сессии (уведомления macOS — osascript). Внешний runtime Codex Local Mac не менялся. Контракт — [mcp-stateless-sessions](../planning/mcp-stateless-sessions.md).

## macOS ScreenCapture — подтверждённая локальная 0.6.80

Разрешение tool calls в ChatGPT, sandbox локального executor и системный Screen Recording macOS — отдельные уровни. TCC связывает запросы executor с responsible application `com.oleynik.ProjectWebPilot`; разрешение выдаётся подписанному Web Pilot штатно пользователем. Повторные запросы прежней ad hoc сборки были вызваны несовпадением code requirement.

Постоянная Apple Development identity UkrHD и строгая проверка конечного bundle устранили несовпадение. T004 подтвердила живой `computer_capture_screen` через действующий MCP; T005 (`8a6d0dd`) — захват после обновления 0.6.79 → 0.6.80 и настоящей перезагрузки, при разных CDHash и одинаковом requirement. Пользователь подтвердил отсутствие новых запросов. `scripts/check-mac-screen-capture.mjs` проверяет установленную версию/процессы, native preflight, PNG и положительную TCC attribution; при отсутствии доступа останавливается до захвата. Права инструмента и tool surface не изменены. [Контракт](../planning/macos-screen-permission-stability.md), [evidence](../VERIFICATION.md).
