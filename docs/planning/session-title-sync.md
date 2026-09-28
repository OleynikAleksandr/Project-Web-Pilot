# Автоматические названия сессий Web Pilot и ChatGPT

## Результат

Project Web Pilot автоматически присваивает выбранной локальной session осмысленное стабильное имя, связанное с работой этой session, и синхронизирует то же имя с соответствующим native conversation ChatGPT, чтобы оно одинаково отображалось:

- в дереве sessions слева в Project Web Pilot;
- в native Recents / истории ChatGPT.

Для первой реализации источником смыслового имени служит уже существующая проекция Workflow Kit: `scope_id`, `objective` и текущая/следующая микрозадача. Workflow Kit не получает новой ответственности за названия chats и не меняет свой lifecycle.

Реализация должна использовать существующую модель single active plan: один checkout/worktree имеет один current plan, а chat session остаётся отдельной сущностью навигации. Поэтому имя фиксируется на конкретной session и не является постоянно меняющейся проекцией current plan.

## Существующие решения, которые переиспользуем

В Project Web Pilot уже была реализована локальная автоматическая привязка имени session к scope:

- commit `c781b8f` — `feat: именовать сессию по scope`;
- `rememberScopeTitle()` и `applyScopeTitle()` использовали `objective`;
- persisted model уже поддерживает `titleSource=page|manual|scope`;
- page title ChatGPT уже используется как fallback через `rememberSessionTitle()`.

Эта логика была удалена commit `eb466fd` при переходе к single active plan, потому что прежняя привязка была связана с project/session plan handoff. Новый вариант не возвращает session-owned plans: переиспользуется только механизм локального именования, адаптированный к current checkout plan и session-owned title.

Для native ChatGPT rename найден open-source пример `NASIRCISSISTIC/chatgpt-triage`: он умеет переименовывать server-side conversation из уже авторизованной страницы ChatGPT. Это доказательство практической реализуемости, но он использует недокументированный web API и не принимается как готовая зависимость. В Web Pilot нужен собственный узкий adapter с fail-closed поведением и одной эмпирически подтверждённой стратегией.

## Правила имени session

1. Автоматическое имя назначается конкретной Web Pilot session, когда она впервые наблюдает активный или blocked scope с непустым `objective`.
2. Базовый формат:
   - `<objective>`;
   - если доступно содержательное `nextTaskTitle` и оно не дублирует objective — `<objective> — <nextTaskTitle>`.
3. Пробелы нормализуются; итог ограничивается разумной длиной, совместимой с текущим локальным лимитом 160 символов.
4. Для каждой session автоимя фиксируется, а обычное переключение между sessions или изменение revision плана не переименовывает уже названную session.
5. Новая session в том же scope может получить собственное автоимя — marker принадлежит session, а не проекту.
6. Ручное имя имеет высший приоритет и никогда не перетирается page title или автоматикой.
7. Заголовок страницы ChatGPT остаётся fallback только для session без manual/scope имени.
8. В первой версии нет отдельного модельного вызова только ради генерации title.

## Native ChatGPT rename

Добавляется узкий facade `ChatGPTTitleAdapter` (название рабочего класса можно уточнить при реализации), работающий только с текущим authenticated Chromium WebContents и exact bound conversation URL.

Перед фиксацией реализации выполняется один live probe текущего ChatGPT Web. Выбирается один минимальный рабочий путь:

1. предпочтительно штатное действие текущего web UI, если его можно устойчиво вызвать через существующий ChatGPT DOM adapter;
2. если UI-path существенно более хрупок, допускается same-origin web request тем же механизмом, которым пользуется текущий ChatGPT Web, но без извлечения/хранения токенов вне browser partition.

Не создаётся отдельный внешний сервис, API key, расширение браузера или зависимость от Tampermonkey.

Adapter обязан:

- работать только для `https://chatgpt.com` и exact conversation ID из bound `chatUrl`;
- не переименовывать другой conversation при переключении страницы;
- подтверждать наблюдаемый успех, а не считать изменение `document.title` успешным server rename;
- fail closed при изменении ChatGPT UI/API;
- позволять повторить синхронизацию после reload/open session.

## Синхронизация

Desired title хранится в Web Pilot session record. Локальное сохранение не зависит от доступности ChatGPT rename.

Когда selected session открыта на её exact bound conversation:

1. Web Pilot определяет desired title;
2. если локальное имя уже explicit (`manual|scope`), page title его не меняет;
3. native adapter синхронизирует conversation title;
4. после успеха обычный page-title event не должен создавать обратную перезапись;
5. при временном отказе native rename локальное имя сохраняется, а повтор выполняется при следующем безопасном событии открытия/обновления этой exact session.

Ручная команда `Переименовать` в sidebar также использует тот же sync path, когда conversation доступен. Это сохраняет одну семантику именования вместо двух независимых механизмов.

## Запуск и поставка

После реализации выпускается следующий локальный парный релиз Project Web Pilot — планово `0.6.59`:

- macOS arm64;
- Windows x64;
- постоянный `Project Web Pilot.app` в корне workspace обновляется штатным release pipeline;
- versioned delivery создаётся штатной командой `npm run build`.

До прямого подтверждения этого плана пользователем implementation task не начинается.

## Проверка

Обязательная автоматическая проверка:

- unit tests persisted naming model, manual precedence, session-owned marker и PlanMonitor projection;
- tests native title adapter на fixture/mock boundary;
- Electron smoke: новый scope именует только выбранную session; переключение не переименовывает соседнюю; page title не затирает explicit title; manual rename идёт через единый sync path;
- полный `npm test`;
- `npm run smoke`;
- штатная парная упаковка `npm run build`.

Обязательная live-проверка до объявления функции рабочей:

1. открыть тестовый или текущий bound ChatGPT conversation;
2. применить новое имя через Web Pilot;
3. убедиться, что оно появилось в локальном дереве;
4. reload ChatGPT / повторно открыть conversation;
5. убедиться, что native Recents показывает то же server-side имя;
6. проверить, что возвращение к другой session не переносит это имя на неё.

Windows package должен содержать ту же application logic; live ChatGPT rename на Windows пользователь может дополнительно проверить после установки, если локально нет Windows runtime для интерактивной проверки.

## Границы

В этот scope не входят:

- изменение семантики Workflow Kit или формата current plan;
- новый MCP tool только ради rename;
- отдельный LLM-вызов для генерации title;
- массовое ретроактивное переименование старых chats;
- синхронизация названий между несколькими устройствами вне штатного server-side ChatGPT title;
- удаление или перепривязка conversations;
- возвращение session-owned plans.

Если live probe покажет, что native rename невозможно устойчиво выполнить из текущего embedded ChatGPT без использования недокументированного server endpoint, это фиксируется как отдельное техническое решение внутри T002; внешний API/token не вводится.

## Результат реализации

Реализовано в 0.6.59 без изменения Workflow Kit 1.5.0. Session-scoped auto-name, manual precedence, native ChatGPT title adapter и единый sync path покрыты unit/Electron smoke. Live current-account probe подтвердил server-side persistence после reload. Парный релиз macOS arm64 / Windows x64 собран из commit `eabeea2359821a34c380a1904f902f18474adfd6`; native Windows остаётся пользовательской проверкой.


## Приёмочный hotfix 0.6.60

Реальная проверка 0.6.59 выявила расхождение после restart: local explicit scope title сохранялся, а server-side ChatGPT title оставался прежним. Hotfix переводит sync в reconciliation: GET до PATCH, no-op при совпадении, PATCH + GET при расхождении, bounded retry после загрузки/auth readiness и безопасная диагностика результата. UI automation для проверки не используется; финальную видимую проверку выполняет пользователь.

Реализовано в 0.6.60: post-load и late-bind triggers, force-preserving debounce, bounded retry и GET-before-PATCH regression. T005 suite/smoke прошли; финальная парная поставка собрана из `7cf1299a70633bb620f18e8db857ed1d552eb401`.


## Приёмочный hotfix 0.6.61

0.6.60 доказал, что lifecycle reconciliation запускается, но ChatGPT возвращает HTTP 422 на 160-символьный / 262-byte objective-title. 0.6.61 использует H1 planning/spec как canonical short title и общий лимит 80 Unicode chars / 200 UTF-8 bytes; existing scope-title того же scope мигрируется автоматически, manual title сохраняется.


## Приёмочный hotfix 0.6.62

0.6.61 выявил request storm: общий `ContextSession.onChange` запускал frequent title sync и при 429 обходил backoff. 0.6.62 полностью удаляет timer/retry loop. Native sync теперь event-driven и одноразовый; manual rename local-first и не ждёт сеть.


## Приёмочный hotfix 0.6.63

Пункт «Переименовать» больше не зависит от `window.prompt()` Electron. В sidebar реализован собственный modal с prefilled input, Enter/«Сохранить» и «Отмена»; тот же компонент используется для проекта.
