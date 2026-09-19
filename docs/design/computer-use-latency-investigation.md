# Исследование задержек Computer Use и MCP

## Назначение

Этот документ фиксирует результаты измерений 19.09.2026 и является основным контекстом следующего этапа Project Web Pilot: локализовать, где именно возникает многосекундная задержка между действием агента ChatGPT Web и фактическим выполнением на локальном Mac.

Исследование относится прежде всего к Runtime Lifecycle, Secure MCP Tunnel и macOS MCP backends. Цель следующего этапа — не «ускорять всё подряд», а разложить один tool call на измеримые сегменты и определить вклад каждого сегмента.

## Актуальная архитектура

В Web Pilot 0.6.47 ChatGPT видит один стабильный connector `Codex App Server Local Mac`. Settings Web Pilot переключает только локальный backend за одним Secure MCP Tunnel:

```
ChatGPT Web
  -> один plugin/connector
  -> Secure MCP Tunnel
  -> выбранный локальный MCP backend
       - Codex Local Mac
       - Codex App Server Local Mac
```

После отключения старого cloud connector `Codex Local Mac` в ChatGPT и перезапуска Web Pilot агент видел только один namespace с 47 tools. При переключении Settings namespace оставался тем же, а `bridge_status` подтверждал фактическую смену backend.

## Методика A/B через Web ChatGPT

Тестировался Safari с открытым `chatgpt.com`. Замерялось end-to-end время каждого tool call: от отправки вызова MCP инструменту до получения результата агентом. Время рассуждения модели между вызовами не включалось.

После предварительного последовательного теста был выполнен более чистый тест: по 15 повторов каждой операции.

Операции:
1. `activate_window`
2. `capture_window`
3. одиночный `click` в безопасной точке 600x400
4. `scroll` в той же области, попеременно вниз/вверх

Для App Server backend Computer Use шёл через `Codex App Server -> node_repl -> @oai/sky`.
Для Codex Local Mac использовался его существующий Computer Use facade.

## Результаты через Secure MCP Tunnel / Web ChatGPT

| Операция | Codex App Server MCP median | Codex Local Mac median |
| --- | ---: | ---: |
| activate_window | 3.112 с | 3.232 с |
| capture_window | 2.293 с | 2.306 с |
| click | 3.135 с | 2.981 с |
| scroll | 3.101 с | 3.137 с |
| Сумма медиан | 11.641 с | 11.656 с |

### App Server MCP, 15 повторов

| Операция | min | median | mean | p95 / max |
| --- | ---: | ---: | ---: | ---: |
| activate_window | 2.728 с | 3.112 с | 3.433 с | 6.099 с |
| capture_window | 1.935 с | 2.293 с | 2.372 с | 2.798 с |
| click | 2.720 с | 3.135 с | 3.507 с | 7.048 с |
| scroll | 2.742 с | 3.101 с | 3.118 с | 3.576 с |

### Codex Local Mac, 15 повторов

| Операция | min | median | mean | p95 / max |
| --- | ---: | ---: | ---: | ---: |
| activate_window | 2.443 с | 3.232 с | 3.166 с | 3.723 с |
| capture_window | 1.951 с | 2.306 с | 2.307 с | 2.537 с |
| click | 2.418 с | 2.981 с | 3.013 с | 3.628 с |
| scroll | 2.643 с | 3.137 с | 3.446 с | 6.299 с |

Разница между двумя backend практически исчезает на уровне медиан. Это сильный аргумент против гипотезы, что основной источник задержки находится внутри конкретной реализации Computer Use backend.

## Нативный ChatGPT Work / встроенный Computer Use

Отдельный локальный ChatGPT Work выполнил тот же тест без Mac-control MCP, без Secure MCP Tunnel и без браузерной автоматизации. Использовался встроенный `@oai/sky`, target `mac`.

Все четыре серии — по 15 вызовов.

| Операция | min | median | mean | p95 / max |
| --- | ---: | ---: | ---: | ---: |
| activate_window | 0.3921 с | 0.4002 с | 0.4536 с | 1.2098 с |
| capture_window | 0.1231 с | 0.1320 с | 0.1540 с | 0.4689 с |
| click | 0.0567 с | 0.0991 с | 0.1061 с | 0.2443 с |
| scroll | 0.0802 с | 0.0830 с | 0.0839 с | 0.0964 с |

Сумма медиан четырёх операций: примерно **0.714 с**.

Ограничения сопоставимости:
- native Work scroll API не принимает pixel delta ±500; использовался фиксированный `pages: 1`;
- native Work capture не давал настроить max_dimension/cursor;
- первые вызовы activate/capture/click имели warm-up выбросы;
- эти отличия не объясняют разницу порядка величины.

## Сравнение нативного Work и Web ChatGPT через MCP

| Операция | Native Work / Sky | App Server MCP | Local MCP | Замедление через MCP |
| --- | ---: | ---: | ---: | ---: |
| activate_window | 0.400 с | 3.112 с | 3.232 с | ~7.8–8.1x |
| capture_window | 0.132 с | 2.293 с | 2.306 с | ~17.4x |
| click | 0.099 с | 3.135 с | 2.981 с | ~30–32x |
| scroll | 0.083 с | 3.101 с | 3.137 с | ~37–38x |

Сумма медиан:
- Native Work: ~0.714 с
- App Server MCP: 11.641 с
- Codex Local Mac: 11.656 с

Агрегированное замедление — около **16.3x**.

## Установленные факты

1. `@oai/sky` сам по себе быстрый: локальный ChatGPT Work выполняет click/scroll примерно за 0.08–0.10 с, capture примерно за 0.13 с.
2. Два разных локальных MCP backend дают почти одинаковые end-to-end задержки через Web ChatGPT.
3. Следовательно, оптимизация только Sky, Quartz, App Server executor или старого Computer Use facade маловероятно даст существенный выигрыш.
4. Основная задержка, вероятно, находится в общей части тракта между Web ChatGPT и локальным backend либо в общей MCP/tunnel orchestration вокруг tool call.
5. Пока это гипотеза, а не доказанная точка: текущие замеры не разделяют server ingress, локальное выполнение и transport/dispatch.

## Гипотезы следующего этапа

### H1 — задержка до локального MCP server
ChatGPT tool dispatch, plugin routing и Secure MCP Tunnel могут добавлять большую часть 2–3 секунд до того, как request достигает local server.

### H2 — задержка после локального результата
Локальное действие может завершаться быстро, но serialization / tunnel upload / ChatGPT result handling может добавлять существенную задержку после backend completion.

### H3 — постоянный MCP dispatch overhead
Если lightweight/no-op/read-only tool через тот же connector также занимает ~2–3 секунды, проблема не специфична Computer Use.

### H4 — локальная orchestration App Server несущественна
Если direct loopback call к App Server MCP даёт время близкое к native Work, внутренний путь `MCP -> node_repl -> Sky` не является узким местом.

### H5 — round-trip count важнее скорости primitive
Даже при невозможности уменьшить одиночный round-trip можно существенно ускорить сложные сценарии, если безопасно объединять несколько UI primitives в одну локальную operation/sequence.

## Измеримые точки следующей сессии

Для одного Computer Use tool call нужен monotonic trace с correlation id:

1. local MCP HTTP/MCP request ingress;
2. начало tool handler;
3. непосредственно перед вызовом Sky/Computer Use;
4. сразу после возврата Sky;
5. после формирования MCP result;
6. непосредственно перед отправкой response / завершением handler.

Нельзя логировать tunnel key, cookies, ChatGPT content или другие секреты. Trace должен быть opt-in для benchmark и легко удаляться.

Снаружи одновременно фиксируется время Web ChatGPT tool call. Тогда:
- `T_web_total` — наблюдаемое агентом end-to-end;
- `T_local_total` — ingress -> local response;
- `T_sky` — before Sky -> after Sky;
- остаток `T_web_total - T_local_total` указывает на внешний transport/dispatch/result path.

## Минимальный набор будущих сравнений

1. Direct native Work / Sky — baseline уже есть.
2. Direct loopback к каждому local MCP без Secure MCP Tunnel.
3. Web ChatGPT -> stable connector -> Local backend.
4. Web ChatGPT -> stable connector -> App Server backend.
5. Lightweight control tool через тот же connector, например `bridge_status` или безопасный file metadata read.
6. Computer Use primitive через тот же connector.
7. Warm и cold series отдельно.
8. Не менее 15–30 повторов, хранить raw samples, median, mean, p95/max.

## Критерий локализации

Следующий этап считается успешным, когда для типичного ~3-секундного Web ChatGPT tool call можно количественно объяснить основную часть времени хотя бы одной из категорий:
- Web/plugin dispatch до tunnel;
- Secure MCP Tunnel transport;
- local MCP parsing/orchestration;
- actual tool/Sky execution;
- response transport/result handling.

После локализации принимается решение:
- исправлять локальный код, если задержка локальная;
- оптимизировать tunnel/runtime, если задержка транспортная;
- уменьшать количество tool round-trips через безопасные compound/sequence operations, если доминирует неизбежный Web/tool dispatch overhead.

## Неправильный следующий шаг

Не следует заранее переписывать Computer Use backend, менять Sky или строить ещё один executor без измерения сегментов. Проведённые тесты показывают, что Local и App Server backend практически равны по end-to-end latency через один и тот же Web/MCP путь.


## Простой тест write_file/read_file — T005 / 19.09.2026
По новому поручению пользователя выполнен предварительный простой файловый тест перед T001–T004: один пробный и 15 измеряемых последовательных циклов записи/чтения файла 1024 байт. Использован действующий stable connector; bridge_status подтвердил именно backend Codex Local Mac, несмотря на имя namespace Codex App Server Local Mac.

Папка: `/Users/oleksandroliinyk/Desktop/TMP/WebPilot-RW-Test-20260919`. Измеряемые записи перезаписывают один существующий probe.txt, encoding=utf-8, create_parent_directories=false, overwrite=true. Чтение: read_file(path, include_line_numbers=false). Для NN=00 (проба), 01…15 записывается ASCII-заголовок `WEBPILOT_RW_NN\n`, затем символы x до общей длины 1024 байта, без завершающего перевода строки. Каждый вызов write/read выполнен отдельно, последовательно, через Web MCP; время фиксируется в вызывающей functions.exec непосредственно вокруг await инструмента. Цикл автоматизирован на стороне вызывающего агента, без модельных пауз внутри серий; между блоками 1–5 и 6–15 был переход orchestration cell. Никакого параллельного исполнения. Сумма write+read образует cycle_ms.

Timer: Date.now(), wall clock с разрешением 1 мс; monotonic performance.now в этой среде отсутствует. Поэтому это предварительный round-trip тест, не segment trace. Подготовка папки/файла и исправление пробной длины 1025→1024 байта исключены из статистики. Проба уже прогретая, cold-start не измерен. Во всех 15 измерениях подтверждены длина 1024, точное возвращённое содержимое и совпадение SHA-256 записи/чтения.

| Операция | min, ms | median, ms | mean, ms | p95/max, ms |
| --- | ---: | ---: | ---: | ---: |
| write_ms | 1406 | 1702 | 1690.33 | 1833 |
| read_ms | 1428 | 1688 | 1689.20 | 1915 |
| cycle_ms | 3130 | 3342 | 3379.53 | 3748 |

p95: nearest rank; при n=15 совпадает с max. Пробный цикл: запись 1609 мс, чтение 1729 мс, сумма 3338 мс. Сумма 30 измеряемых tool calls — 50693 мс.

Вывод: секундная задержка наблюдается и на простых файловых инструментах, без Computer Use. Результат не разделяет cloud tool dispatch, Secure MCP Tunnel, local MCP и обработку ответа. Сравнение с локальным ChatGPT ещё не проведено; различие native tools тоже может влиять. T001–T004 этим тестом не закрываются, runtime не менялся.

Raw samples:

```json
{
  "date": "2026-09-19",
  "started_at": "2026-09-19T17:36:25.304Z",
  "path": "/Users/oleksandroliinyk/Desktop/TMP/WebPilot-RW-Test-20260919/probe.txt",
  "file_bytes": 1024,
  "backend": "Codex Local Mac (bridge_status.codex_local; stable namespace Codex App Server Local Mac)",
  "tools": [
    "write_file",
    "read_file"
  ],
  "clock": "Date.now(), caller-side wall clock, integer milliseconds; performance.now unavailable",
  "trial": {
    "iteration": 0,
    "write_ms": 1609,
    "read_ms": 1729,
    "cycle_ms": 3338,
    "verified": true
  },
  "samples": [
    {
      "iteration": 1,
      "write_ms": 1665,
      "read_ms": 1658,
      "cycle_ms": 3323,
      "verified": true
    },
    {
      "iteration": 2,
      "write_ms": 1833,
      "read_ms": 1915,
      "cycle_ms": 3748,
      "verified": true
    },
    {
      "iteration": 3,
      "write_ms": 1651,
      "read_ms": 1830,
      "cycle_ms": 3481,
      "verified": true
    },
    {
      "iteration": 4,
      "write_ms": 1639,
      "read_ms": 1622,
      "cycle_ms": 3261,
      "verified": true
    },
    {
      "iteration": 5,
      "write_ms": 1647,
      "read_ms": 1666,
      "cycle_ms": 3313,
      "verified": true
    },
    {
      "iteration": 6,
      "write_ms": 1702,
      "read_ms": 1428,
      "cycle_ms": 3130,
      "verified": true
    },
    {
      "iteration": 7,
      "write_ms": 1705,
      "read_ms": 1724,
      "cycle_ms": 3429,
      "verified": true
    },
    {
      "iteration": 8,
      "write_ms": 1761,
      "read_ms": 1457,
      "cycle_ms": 3218,
      "verified": true
    },
    {
      "iteration": 9,
      "write_ms": 1686,
      "read_ms": 1695,
      "cycle_ms": 3381,
      "verified": true
    },
    {
      "iteration": 10,
      "write_ms": 1406,
      "read_ms": 1822,
      "cycle_ms": 3228,
      "verified": true
    },
    {
      "iteration": 11,
      "write_ms": 1816,
      "read_ms": 1855,
      "cycle_ms": 3671,
      "verified": true
    },
    {
      "iteration": 12,
      "write_ms": 1722,
      "read_ms": 1873,
      "cycle_ms": 3595,
      "verified": true
    },
    {
      "iteration": 13,
      "write_ms": 1721,
      "read_ms": 1455,
      "cycle_ms": 3176,
      "verified": true
    },
    {
      "iteration": 14,
      "write_ms": 1747,
      "read_ms": 1650,
      "cycle_ms": 3397,
      "verified": true
    },
    {
      "iteration": 15,
      "write_ms": 1654,
      "read_ms": 1688,
      "cycle_ms": 3342,
      "verified": true
    }
  ],
  "stats": {
    "write_ms": {
      "min": 1406,
      "median": 1702,
      "mean": 1690.3333333333333,
      "p95": 1833,
      "max": 1833
    },
    "read_ms": {
      "min": 1428,
      "median": 1688,
      "mean": 1689.2,
      "p95": 1915,
      "max": 1915
    },
    "cycle_ms": {
      "min": 3130,
      "median": 3342,
      "mean": 3379.5333333333333,
      "p95": 3748,
      "max": 3748
    }
  },
  "note": "Preparation created directory and file with a 1025-byte draft, then corrected to 1024 before trial; preparation excluded. Trial is warmed, not a true cold-start measurement. All measured writes overwrite an existing file; all reads verified content and matching SHA-256."
}
```

### Задание локальному ChatGPT для сопоставления

На этом же Mac использовать существующий `/Users/oleksandroliinyk/Desktop/TMP/WebPilot-RW-Test-20260919/probe.txt`. Выполнить один прогревочный цикл NN=00 и 15 измеряемых NN=01…15 с тем же ASCII-содержимым 1024 байт и без финального newline. Использовать встроенные локальные инструменты ChatGPT, без Web Pilot MCP и Secure MCP Tunnel. Каждая запись и каждое чтение — отдельный последовательный вызов native tool. Замерять в вызывающем runtime полное время await каждого инструмента, а не время fs.writeFile/readFile внутри одного локального скрипта; это разные метрики. Оркестратор может содержать цикл отдельных tool calls. Между записью и чтением никаких дополнительных действий. Проверять содержимое после чтения, не менять настройки, не перезапускать приложения и не трогать код проекта. Вернуть фактический путь исполнения, имена инструментов, timer, пробные времена, все 15 пар write/read, min/median/mean/p95/max и суммарное время. Если внешние времена вызовов недоступны, прямо сообщить это; внутренние файловые времена можно привести только как отдельную, несопоставимую метрику. Сохранять результаты вне измеряемой серии. Второму агенту не поручается менять Workflow Kit или коммитить проект.
