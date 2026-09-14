# Module Specification — Workspace & Sessions

## Назначение

Хранить локальную связь проекта Web Pilot с облачными разговорами ChatGPT и управлять созданием/выбором сессий проекта. Одна сессия проекта соответствует одному облачному разговору и с момента создания имеет явный experience: обычный Chat либо Work.

## Граница ответственности

Модуль владеет:
- локальным списком проектов и их сессий;
- типом сессии `chat | work`;
- созданием первой и дополнительных сессий;
- навигацией в правильный ChatGPT experience перед передачей первого recovery-пакета;
- сохранением/восстановлением conversation URL, названия, времени и выбранной сессии;
- пользовательским UI выбора Chat/Work и badge типа сессии.

Модуль не владеет:
- содержимым Recovery Capsule и Workflow Kit;
- выбором конкретной модели внутри Chat или Work;
- лимитами/биллингом OpenAI;
- MCP/tunnel lifecycle;
- внутренним DOM/состоянием ChatGPT сверх минимально необходимого переключения experience.

## Session Contract

Каждая сессия хранит:

```text
sessionId
experience: "chat" | "work"
chatUrl: string | null
title
createdAt
lastOpenedAt
archivedAt: number | null
attempt / receipt
```

`experience` задаётся в момент создания сессии и после привязки облачного разговора не меняется. Production-проверка 14.09.2026 показала, что URL больше не кодирует experience однозначно: Work стартует на `/work/`, но после создания разговора ChatGPT переводит его на общий `/c/<id>`. Поэтому источником истины после создания является persisted `experience` + точный conversation URL, а не namespace URL.

Для старого локального хранилища миграция определяется по URL:
- Work URL (`/work/...`) → `work`;
- обычный `/c/...` → `chat`;
- ещё не привязанная старая сессия → `chat`.

## Создание дополнительной сессии

Операция уровня проекта, а не контекста. В меню `⋯` проекта расположены:

```text
Новый Chat
Новый Work
──────────
Скопировать полный путь
Перенести в архив
```

Текущая кнопка «Новый чат для проекта» из карточки контекста удаляется. Карточка контекста отвечает только за состояние выбранной сессии и действие «Обновить контекст»/проверку текущей передачи.

Обе команды используют единый facade `newSession(workspace, experience)`; после создания новая сессия становится выбранной и Web Pilot открывает соответствующий ChatGPT experience.

## Первая сессия проекта

Когда Web Pilot действительно создаёт первую локальную сессию проекта, пользователь до финального открытия выбирает:

```text
Первая сессия проекта
[ Chat ] [ Work ]
```

По умолчанию выбран `Chat`. Выбор не запоминается глобально между проектами.

Это применяется к двум случаям:
1. создание нового проекта;
2. первое подключение существующей папки, которой ещё нет в локальном списке Web Pilot.

Если папка проекта уже зарегистрирована и содержит сохранённые сессии, обычное повторное открытие проекта не создаёт новую сессию и не показывает выбор Chat/Work: восстанавливается ранее выбранная сессия.

## Представление в дереве

В строке каждой сессии название находится слева, а в правом верхнем углу той же строки показывается компактный read-only badge:

```text
Recovery v2                         Work
14 сент., 10:41

Clipboard fix                       Chat
14 сент., 09:20
```

Badge не является переключателем и не меняет существующую сессию.

## ChatGPT Experience Routing

Web Pilot выбирает только верхнеуровневый experience `Chat | Work`. Конкретная модель, reasoning effort и другие настройки остаются нативному UI ChatGPT.

Перед реализацией должен быть эмпирически подтверждён способ создания чистой Work-сессии в текущем ChatGPT Web:
1. предпочтительно использовать устойчивый официальный/фактический URL маршрута, если он существует;
2. если Work выбирается только нативным UI, Web Pilot открывает чистый ChatGPT и выполняет минимальное переключение режима до отправки recovery;
3. не использовать недокументированный brittle DOM selector без regression/fallback;
4. после создания фактический conversation URL должен пройти `normalizeChatUrl()` и соответствовать выбранному experience.

## Recovery Contract

Context Recovery не различает Chat и Work. После того как Workspace & Sessions создал/выбрал сессию и открыл правильный experience, существующий `ContextSession` передаёт тот же Recovery Capsule тем же протоколом.

Для обеих разновидностей обязательны те же свойства:
- не перезаписывать пользовательский draft;
- не отправлять пакет дважды;
- привязать conversation URL только после наблюдаемой отправки;
- при открытии другой облачной беседы считать сессию изменённой, а не молча перепривязывать её.

## URL Contract

`normalizeChatUrl()` принимает только HTTPS `chatgpt.com` concrete conversation URLs. Совместимость URL с persisted `experience` асимметрична: Chat не принимает явно Work-only `/work/...`; Work принимает как исторический `/work/...`, так и реальный production `/c/<id>`. Для legacy schema без поля `experience` обычный `/c/<id>` по-прежнему мигрируется как Chat.

Начальный URL новой сессии не сохраняется как `chatUrl`: он только открывает нужный experience. `chatUrl` появляется после фактического создания/наблюдения облачного разговора.

## UI Contract

Контекстная карточка:
- «Вернуться к чату проекта» — только при открытой чужой беседе;
- «Обновить контекст» / «Проверить контекст» — для выбранной сессии;
- кнопок создания новых сессий нет.

Меню проекта:
- `Новый Chat`;
- `Новый Work`;
- `Скопировать полный путь`;
- `Перенести в архив`.

Формы создания/первого подключения:
- явный выбор первой сессии `Chat | Work` непосредственно перед финальным действием;
- default `Chat`;
- выбор используется только если проект ещё не зарегистрирован локально.

## Инварианты

- У проекта может быть любое сочетание Chat и Work сессий.
- Experience выбранной сессии не меняется задним числом.
- Повторное открытие зарегистрированного проекта не создаёт новую сессию.
- Recovery Capsule и MCP одинаковы для Chat и Work.
- Модель внутри Work/Chat никогда не фиксируется Web Pilot.
- Старые сохранённые данные мигрируются без потери URL, попыток отправки и истории сессий.
- В sidebar не показываются внутренние лимиты OpenAI как вычисляемые Web Pilot значения.

## Приёмка

- Меню каждого активного проекта создаёт отдельно Chat и Work сессию.
- В карточке контекста больше нет «Новый чат для проекта».
- Первая сессия нового/впервые подключаемого проекта создаётся в явно выбранном experience.
- Для уже известного проекта выбор первой сессии не появляется и новая сессия не создаётся.
- В дереве рядом с названием каждой сессии виден корректный badge Chat/Work.
- После restart experience каждой сессии сохраняется.
- Старое хранилище мигрируется детерминированно.
- Chat и Work получают один и тот же recovery-flow без отдельной логики Context Recovery.
- Новый Work действительно открывается как чистая Work-сессия в текущем ChatGPT Web и после первого сообщения сохраняется как Work conversation URL.

## Подтверждённый Work entrypoint — 14.09.2026

Для нового Work Web Pilot использует канонический верхнеуровневый entrypoint `https://chatgpt.com/work/`. OpenAI публикует Work именно по этому адресу и описывает Chat и Work как отдельные ChatGPT experiences. Перед первым recovery Web Pilot подтверждает фактический режим через нативный переключатель Chat/Work; конкретная модель не выбирается. Подробности production correction — T013.

Fail-closed правило: стартовая Work session может передавать recovery только если текущий URL остаётся в `/work` namespace и страница предоставляет доступный composer с подтверждённым режимом Work. Если ChatGPT изменит маршрут/поведение, Web Pilot показывает ошибку/ожидание Work и не отправляет пакет в обычный Chat. После первой наблюдаемой отправки сохраняется фактический concrete conversation URL. В текущем production ChatGPT это обычный `/c/<id>`, хотя визуально и функционально conversation остаётся Work.

Для Chat стартовый entrypoint остаётся `https://chatgpt.com/`; после первой наблюдаемой отправки сохраняется concrete обычный conversation URL `/c/<id>`.

Актуальные публичные источники OpenAI на момент решения:
- `https://chatgpt.com/work/` — канонический Work entrypoint;
- OpenAI Help Center, `ChatGPT Work and Codex` — Chat и Work описаны как отдельные experiences; конкретный модельный выбор остаётся нативному ChatGPT UI.

## Контракт session model — T002

Для persisted-модели зафиксирована schema v4: каждая session обязана хранить `experience: chat|work`; канонический creator — `newSession(workspace, experience)`. Миграция v1/v2/v3 должна сохранять точный backup исходного файла, выводить `/work/...` как `work`, а обычные/непривязанные старые session — как `chat`. `bindChat()` обязан fail-closed отклонять concrete conversation URL другого experience. Фактическая реализация этого контракта объединяется с T003, где одновременно обновляются проектный UI и обязательный архитектурный документ.

## Реализация project/session UI — T003

Storage schema v4 и `newSession(workspace, experience)` реализованы вместе с UI. Создание дополнительной session из меню проекта одновременно выбирает этот проект; повторное открытие проекта сохраняет уже существующую selected session. Setup хранит first-session choice только transiently: new/first-connect preview показывает Chat|Work с default Chat, cancel/new setup снова начинается с Chat. Sidebar больше не содержит кнопку создания session в Context card; проектное меню содержит Новый Chat / Новый Work, а session row показывает badge справа от имени.

## Реализация experience routing — T004

Routing вынесен в `src/chatgpt-experience.mjs`: обычный Chat стартует на `https://chatgpt.com/`, Work — на `https://chatgpt.com/work/`. `navigate()` выбирает entrypoint только по persisted `session.experience` и не выбирает модель/режим reasoning. `ContextSession` независимо проверяет фактический URL перед recovery: новая Work-сессия принимает только `/work` namespace, Chat — обычный Chat namespace. При mismatch выдаётся `CHATGPT_EXPERIENCE_MISMATCH`, `loadContext()` и отправка не выполняются.

После наблюдаемой отправки прежний `bindChat()` сохраняет только concrete conversation URL и дополнительно проверяет совпадение URL с immutable experience. Electron smoke создаёт через проектное меню сначала дополнительный Chat, затем Work; fixture Work начинается на `/work/`, после отправки становится `/work/<request-id>`, сохраняется как Work и отображается соответствующим badge.

## Release integration — T005 / Project Web Pilot 0.6.5

Релиз 0.6.5 включает storage schema v4, project-level `Новый Chat` / `Новый Work`, выбор первой session для нового/впервые подключаемого проекта, session badges и fail-closed Chat/Work routing. Recovery Capsule и MCP protocol не менялись: обе разновидности session используют один Context Recovery flow. Финальная ручная проверка реального аккаунта ChatGPT оставлена пользователю; scope не архивируется автоматически.

## Production correction — T006 / shared conversation URL

Реальная приёмка 0.6.5 показала Work UI с Astra при URL `/c/<id>`. Production diagnostics зафиксировали последовательность `/work/` → отправка recovery → `/c/<id>`. Storage contract исправлен: schema v4 сохраняет immutable `experience=work`, разрешает Work concrete `/c/<id>` и переживает restart. Legacy inference не меняется: старый `/c/<id>` без persisted experience мигрируется как Chat.


## Production correction — T007 / Work provenance guard

Fail-closed теперь действует по фазе lifecycle. До первой отправки unbound Work обязан находиться на `/work/`; обычный Chat URL блокируется до `loadContext()`/send. После того как send уже начат из подтверждённого Work и request marker наблюдается в текущем conversation, переход на shared `/c/<id>` допустим и URL привязывается к persisted `experience=work`. Для уже привязанной session источником истины является exact сохранённый conversation URL; повторно выводить experience из его namespace запрещено.


## Release integration — T008 / Project Web Pilot 0.6.6

Patch release 0.6.6 исправляет production mismatch Work после перехода `/work/` → shared `/c/<id>`. Persisted `experience=work` сохраняется, binding требует observed request marker, а до первой отправки Work entrypoint остаётся fail-closed. Финальная ручная проверка реального аккаунта остаётся пользователю.


## Session Archive Contract — T009

Session archive является частью Workspace & Sessions и не меняет облачный ChatGPT conversation. Каждая persisted session получает `archivedAt: number|null`; `null` означает активную session. Архивирование скрывает session из дерева активного проекта, но сохраняет `sessionId`, `experience`, `chatUrl`, title и delivery metadata для возможного restore.

Правила lifecycle:
- архивировать можно session только активного проекта;
- последнюю активную session проекта архивировать нельзя (`SESSION_LAST_ACTIVE`), чтобы проект всегда оставался открываемым;
- если архивируется выбранная session и существуют другие активные, `selectedSessionId` атомарно переключается на наиболее недавно открытую оставшуюся session;
- restore снимает `archivedAt`, не меняя experience/chatUrl и не создавая новый облачный разговор;
- удаление разрешено только для архивной session и удаляет локальную запись/привязку Web Pilot. Облачный ChatGPT conversation на стороне OpenAI остаётся неизменным.

Archive UI содержит две независимые вкладки: `Проекты` и `Сессии`. В `Сессиях` показываются только архивные sessions проектов, которые сами не находятся в project archive. Строка session обязательно показывает project owner, title/fallback name, badge `Chat|Work` и дату архивирования. Если проект архивирован целиком, его sessions не дублируются в отдельной session-вкладке; после restore проекта ранее архивные sessions снова становятся видимы в session archive.

Локальное удаление session очищает primary workspace storage и доступные локальные ссылки этой session в migration-backups/diagnostics, если они существуют. Папка проекта, Git repository и любые облачные чаты не удаляются.


## Реализация session archive storage — T010

Storage schema v5 добавляет `session.archivedAt`. Миграция v4 выставляет `archivedAt=null` и сохраняет `.v4-backup`. Архивирование выбранной session атомарно переключает selection на наиболее недавно открытую оставшуюся активную session; `SESSION_LAST_ACTIVE` блокирует архивирование последней активной session. Restore сохраняет `experience/chatUrl`. Локальный forget архивной session удаляет primary metadata и доступные ссылки этой session из migration backup/diagnostics, не удаляя workspace или cloud conversation.


## Реализация session archive UI — T011

Sidebar добавляет `⋯ → Перенести в архив` для каждой активной session. Main snapshot скрывает `session.archivedAt != null` из активного дерева. Общее окно `Архив` имеет две вкладки — `Проекты` и `Сессии`; session row показывает title, badge Chat/Work, project owner и дату архивации. В session tab доступны batch restore и подтверждаемое локальное delete; текст явно указывает, что cloud conversation OpenAI сохраняется. Sessions проектов, которые сами находятся в project archive, не показываются в session tab.


## Release integration — T012 / Project Web Pilot 0.6.7

Patch release 0.6.7 объединяет подтверждённые Chat/Work sessions и session archive. Storage schema v5 мигрирует прежние sessions как активные, отдельный archive позволяет restore или локальный delete без удаления OpenAI conversation, а project archive и session archive остаются независимыми lifecycle. Финальная ручная приёмка остаётся пользователю; scope автоматически не архивируется.


## Исправление выбора Chat и временного URL — T013

Production diagnostics 14.09.2026 17:52:57–17:53:08 UTC: новый Chat загрузил `/`, отправил recovery, затем прошёл `/c/WEB:<uuid>` → `/c/<id>`. Скриншот пользователя подтвердил фактический Work. Корневой URL не доказывает выбранный Chat: веб-приложение использует сохранённый режим и может выбирать Work по умолчанию.

Проверен публичный код текущего ChatGPT Web: `4813494d-i88ebrgl0r2g94a4.js` определяет persisted ChatSurfaceMode и Work default; `984a38d2-hg7qoqxweuz8lvz0.js` реализует нативный toggle с `data-tpp-toggle-value=chatgpt|work` и `data-state=on|off`. Источник: https://chatgpt.com/cdn/assets/984a38d2-hg7qoqxweuz8lvz0.js. Web Pilot использует наблюдаемый нативный toggle; cookies, localStorage и внутренние функции ChatGPT не изменяются напрямую.

Перед первым recovery новая session подтверждает фактический режим через toggle. Если выбран другой режим, выполняется нативный click и отдельное чтение подтверждения. Fallback ограничен группой с точным доступным именем Select chat surface / Выберите режим чата. Недоступный или неопределённый toggle блокирует подготовку/отправку; draft и active generation сохраняются. Режим дополнительно проверяется в renderer в том же действии, что fill/send. Это исправление исполняет ранее согласованный выбор Chat/Work и не выбирает модель.

`/c/WEB:<uuid>` допускается только как промежуточный адрес после начатой отправки. Он не сохраняется в chatUrl. Наблюдение request marker подтверждает отправку; binding ждёт permanent concrete URL. Повторная отправка не выполняется. Уже привязанные sessions продолжают проверяться по exact URL.


## Release integration — T014 / Project Web Pilot 0.6.8

Patch 0.6.8 подтверждает фактический Chat/Work через нативный переключатель до первого recovery. Новый Chat после Work открывается с явно выбранным Chat; модель не фиксируется. Временный URL /c/WEB:<uuid> ожидает permanent URL без ложного mismatch и повторной отправки. Уже существующие привязки и пользовательские черновики сохраняются.

macOS arm64 и Windows x64 packages пересобираются из одного исходного дерева. Реальная проверка нового Chat/Work остаётся пользователю; scope остаётся ACTIVE/READY_FOR_ACCEPTANCE после обязательных checks.
