# Module Specification — Codex App Server Local Executor

Связанные проекты (02.10.2026): **Workflow Kit** — планы и recovery; **Web Pilot Sidebar** — отдельно разрабатываемый браузерный интерфейс. [Рабочие каталоги и границы интеграции](../SOURCE_WORKSPACES.md).

> **С 0.6.91** это единственный локальный backend macOS, а не эксперимент рядом с Codex Local Mac: раздел «Единственный backend macOS — 0.6.91» в конце документа. Сравнение A/B, переключение `local`/`app-server` и приём credentials Codex Local Mac при каждом переключении ниже — история.

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

> **С 0.6.90** ветки «App Server MCP manager» в этой схеме нет: executor не создаёт thread, не вызывает `mcpServer/tool/call` и не использует `node_repl → @oai/sky`. Текущее состояние — в разделе «Наблюдение без управления интерфейсом — 0.6.90» в конце документа; схема и разделы ниже сохранены как история решения.

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
- наблюдение за экраном: список окон и снимки (управление интерфейсом удалено в 0.6.90);
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

**С 0.6.90** из списка ниже остаются только `computer_list_windows`, `computer_capture_screen` и `computer_capture_window`, и они работают без Sky. Остальное — история до 0.6.89.

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

**С 0.6.90 не действует:** действий в интерфейсе нет, остались только read-only инструменты наблюдения. Раздел сохранён как история.

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

## Computer Use: имена клавиш и пакет действий — 0.6.85

`computer_key_press` и `computer_hotkey` переводят символы в имена клавиш X11, которые ждёт `@oai/sky` (`*` → `asterisk`, `=` → `equal`, `+` → `plus` и т. д.); прежние имена работают как раньше. Встроенно (Work) модель пишет X11-имена по инструкции Computer Use; через MCP она этой инструкции не видит, поэтому перевод делает MCP.

Новый `computer_actions(actions)` выполняет до 50 действий в активном приложении одним вызовом `node_repl`: `key`, `hotkey`, `text` (вставка, без искажения кириллицы), `click`, `scroll`, `wait`. Все действия проверяются до выполнения; при ошибке выполнение останавливается, ответ содержит результат и время каждого выполненного действия. Встроенный `sky.type_text` искажает кириллицу, поэтому текст по-прежнему вставляется через `sky.paste`. `equal` в Калькуляторе даёт `+`, вычисляет `Return` — поведение sky, вне MCP. Чтобы ChatGPT увидел новый инструмент, в настройках плагина нужно нажать «Обновить инструменты». Контракт — [computer-use-keys-batch](../planning/computer-use-keys-batch.md).

## Сессии MCP — 0.6.84

`FastMCP` создаётся со `stateless_http=True`: сервер не выдаёт `Mcp-Session-Id` и не проверяет присланный, каждый запрос обрабатывается самостоятельно. Web Pilot перезапускает сервер при каждом старте, а внешние клиенты (ChatGPT и Claude через VPS) хранят идентификатор прошлой сессии; в режиме сессий новый процесс отвечал `404 Session not found`, ChatGPT не переподключался. Инструменты не хранят состояние сессии MCP и не шлют уведомлений внутри сессии (уведомления macOS — osascript). Внешний runtime Codex Local Mac не менялся. Контракт — [mcp-stateless-sessions](../planning/mcp-stateless-sessions.md).

## macOS ScreenCapture — подтверждённая локальная 0.6.80

Разрешение tool calls в ChatGPT, sandbox локального executor и системный Screen Recording macOS — отдельные уровни. TCC связывает запросы executor с responsible application `com.oleynik.ProjectWebPilot`; разрешение выдаётся подписанному Web Pilot штатно пользователем. Повторные запросы прежней ad hoc сборки были вызваны несовпадением code requirement.

Постоянная Apple Development identity UkrHD и строгая проверка конечного bundle устранили несовпадение. T004 подтвердила живой `computer_capture_screen` через действующий MCP; T005 (`8a6d0dd`) — захват после обновления 0.6.79 → 0.6.80 и настоящей перезагрузки, при разных CDHash и одинаковом requirement. Пользователь подтвердил отсутствие новых запросов. `scripts/check-mac-screen-capture.mjs` проверяет установленную версию/процессы, native preflight, PNG и положительную TCC attribution; при отсутствии доступа останавливается до захвата. Права инструмента и tool surface не изменены. [Контракт](../planning/macos-screen-permission-stability.md), [evidence](../VERIFICATION.md).

## Контекст проекта частями — 0.6.86

`workflow_context_recover(workspace="", session_id="", part=0)`. При `part ≥ 1` результат — один текстовый блок без structuredContent: правила сессии из `session-rules.md` и полный пакет Workflow Kit, разрезанные по строкам на части до 20 000 байт. Заголовок части: «ЧАСТЬ N ИЗ M контекста проекта "<путь>"; sha256 …» и следующий вызов; в конце `[ПРОДОЛЖЕНИЕ] … part=N+1` или `[КОНЕЦ ПАКЕТА]`. Без `workspace` берётся `active-workspace.json` из каталога состояния (его пишет Web Pilot); без него — `WORKSPACE_REQUIRED`. Вне диапазона — `PART_OUT_OF_RANGE`. `part=0` отдаёт весь пакет одним результатом.

`instructions` сервера в первых 512 символах требуют до первого ответа прочитать все части, повторять чтение только по просьбе пользователя и не подменять непрочитанные части чтением файлов. Проверка — `executor-channel` на настоящем `server.py`. [Контракт](../planning/mcp-context-delivery.md).

## Части строго по одной — 0.6.87

`workflow_context_recover(workspace="", session_id="", part=0, after="")`. Часть N+1 выдаётся только с ключом `after`, напечатанным в конце части N; без ключа, с чужим ключом или через часть — `PART_ORDER`. Части до 28 000 байт. `instructions` и описание инструмента: одна часть на вызов, без пачек, параллельных вызовов и циклов; при обрезке повторить только эту часть. [Контракт](../planning/mcp-sequential-parts-kit-1.5.4.md).

## Стартовое сообщение — 0.6.88

Вызов `workflow_context_recover` запускает короткое стартовое сообщение Web Pilot (проект, папка, part=1 и далее по ключу `after`); сервер не меняется. [Контракт](../planning/mcp-start-message.md).

## Наблюдение без управления интерфейсом — 0.6.90

[Контракт](../planning/computer-use-removal.md). Каталог — 38 инструментов. Из `computer_*` остались три, все read-only:

| Инструмент | Как работает | Что возвращает |
| --- | --- | --- |
| `computer_list_windows(title_contains, max_results)` | `/usr/bin/osascript -l JavaScript`, `CGWindowListCopyWindowInfo` — видимые окна слоя 0 | `window_id` (системный номер окна), `title`, `application`, `pid`, `rect`; `note`, если macOS скрыла заголовки |
| `computer_capture_screen(x, y, width, height, max_dimension, include_cursor)` | `/usr/sbin/screencapture -x -t png [-C] [-R …]` | PNG экрана или прямоугольника |
| `computer_capture_window(window_id, max_dimension)` | `/usr/sbin/screencapture -x -t png -o -l <window_id>` | PNG окна, в том числе перекрытого другим; параметр `include_cursor` сохранён в схеме и не действует |

Удалены `computer_status`, `computer_activate_window`, `computer_move_mouse`, `computer_click`, `computer_scroll`, `computer_type_text`, `computer_key_press`, `computer_hotkey`, `computer_actions`, `computer_release_inputs`, фасад Sky и методы MCP-thread клиента. Executor больше не требует плагина Computer Use внутри Codex и не создаёт thread с `danger-full-access`.

Заголовки окон и снимки требуют разрешения macOS на запись экрана для Project Web Pilot — того же, что проверяет `scripts/check-mac-screen-capture.mjs`. Снимок окна больше не возвращает текст интерфейса приложения, который добавлял Sky. Правило сессии запрещает управлять интерфейсом командами; технической блокировки `run_command` нет.

## Единственный backend macOS — 0.6.91

[Контракт](../planning/codex-local-mac-removal.md).

- `control.py`: `setup` · `configure-tunnel` · `configure-selector` (без аргументов) · `configure-channel` · `status` · `start [--mcp-only|--tunnel-only]` · `stop [--tunnel-only]` · `selector-start`. Аргументы `--mode` и `--local-*`, блок `local` в `selector.json` и запуск чужого `control.py` удалены.
- `require_codex()`: Codex ищется до установки и перед запуском MCP; его отсутствие — JSON с `code: "CODEX_NOT_FOUND"`.
- `find_uv()`: `WEB_PILOT_UV` (встроенный `mac-tools/uv`), затем `PATH`. С `uv` venv создаётся на Python 3.13; без него — системным Python, которому пакет `mcp` на чистом Mac недоступен.
- `adopt_legacy_tunnel()`: если своих профиля и ключа нет, а в `~/Library/Application Support/CodexLocalMac/private` есть `tunnel-profile/mac-local.yaml` и `tunnel-key`, туннель один раз переносится через обычный `configure_tunnel`; ключ не печатается; повреждённая прежняя настройка не переносится.
- `tunnel_prompt.py`: системные диалоги ввода ID и ключа туннеля (прежний `mac-first-run.py`), загружает соседний `control.py`; режимы `--tunnel-id` и `--stdin`.
- Каталог инструментов не менялся: 38, как в 0.6.90.
- `scripts/benchmark-codex-app-server-mcp.mjs` удалён: сравнивать больше не с чем. Результаты A/B в разделе T005 — история.

## Родные инструменты Codex — 0.6.92–0.6.95

[Контракт](../planning/codex-native-tools-macos.md). С 0.6.92 это действующая поверхность macOS executor; разделы выше про 38/47 tools — история соответствующих версий. Текущая опубликованная/установленная версия — 0.6.95; предыдущая — 0.6.94.

Каталог MCP с 0.6.95 содержит ровно 10 инструментов (в 0.6.92–0.6.94 их было 13 — с тремя инструментами корзины `delete_path`, `list_trash`, `restore_trash`):

- форма Codex: `exec_command`, `write_stdin`, `apply_patch`, `view_image`;
- продуктовые: `workflow_context_recover`, `bridge_status`, `turn_watchdog`;
- наблюдение: `computer_list_windows`, `computer_capture_screen`, `computer_capture_window`.

`exec_command` и `write_stdin` используют прямые `command/exec` и `command/exec/write` без thread/turn. `workdir` обязателен; долгий процесс возвращает session ID; TTY принимает Ctrl-C. С 0.6.94 один результат ограничивается максимум 8000 оценочных токенов / 32000 байт с сохранением начала и конца и одним MCP-маркером обрезки; `Original token count` относится к полному выводу. Wall time `write_stdin` измеряет текущий вызов, а завершение процесса между status и write/terminate возвращает финальный вывод и exit code. `apply_patch` запускает native `apply_patch`, который поставляет установленный Codex, и передаёт Codex patch через stdin с `closeStdin`; старого `git apply` нет. `view_image` проверяет sensitive path, наличие, MIME и лимит 20 МБ, работает на временной копии и уменьшает изображение до 1600 по большей стороне.

28 прежних файловых, поисковых, process и Git tools удалены вместе с недостижимым facade. Агент ищет через `rg` в `exec_command`, правит текст через `apply_patch`; эта строка есть и в server instructions, и в `session-rules.md`. Удаление с 0.6.95 — `rm` в `exec_command` или `*** Delete File` в `apply_patch`, откат — через git; самодельная корзина убрана, а прежнюю папку `trash` исполнитель при запуске удаляет только пустой. В 0.6.94 все 13 tools и все параметры имеют описания. `view_image`, `computer_capture_screen`, `computer_capture_window` прямо объясняют двухблочный результат (JSON + `image/png`) и ChatGPT-script путь `content_items → image()`. `exec_command` и `write_stdin`, server instructions и `session-rules.md` содержат одно правило: если OpenAI заблокировал вызов до исполнения — один раз повторить его без изменений, менять/делить только после повторной блокировки. Первые 512 символов instructions сохранены без изменения. UI control по-прежнему отсутствует.

Определения закреплены в `codex-tools.lock.json` на Codex **0.160.0**, tag `rust-v0.160.0` и SHA-256 `shell_spec.rs`, `view_image_spec.rs`, `apply_patch.lark`. `npm run check:codex-tools` сверяет installed Codex с соответствующим GitHub tag: 0 — совпало, 1 — definitions/version отличаются, 2 — сеть/tag недоступны. `bridge_status.codex_tools` показывает pinned/installed version, `version_matches` и `apply_patch_available`. Живая GitHub-сверка 05.10.2026 прошла.

Windows-runtime, selector, VPS/Secure Tunnel, lifecycle служб и правила первого сообщения Windows в 0.6.92–0.6.95 не менялись. 0.6.95 прошла полный `npm test` (553 total, 549 passed, 4 skipped, 0 failed), live `npm run check:codex-tools`, paired build, installed gate и GitHub release verification; обе macOS-копии установлены. Native Windows остаётся отдельной проверкой.
