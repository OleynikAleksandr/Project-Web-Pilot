# Module Specification — Codex App Server Local Executor

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
