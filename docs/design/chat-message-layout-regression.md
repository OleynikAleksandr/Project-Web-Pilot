# Planning — регрессия layout скрытых tool calls

Дата: 19.09.2026  
Scope: `chat-layout-regression-034`  
Владелец: Workspace & Sessions

## Наблюдение пользователя

На реальном ChatGPT Web после последнего видимого ответа снова остаётся большой пустой участок до composer. Визуально это соответствует прежней проблеме: служебные tool-call строки скрыты, но часть их layout продолжает занимать высоту.

Проверка выполняется без изменения ChatGPT API и без вмешательства в выполнение MCP/tools. Исправление касается только DOM-layout встроенной страницы.

## Где это уже исправлялось

Проблема впервые была оформлена scope `hidden-tool-scroll-023` и выпущена в 0.6.22.

- `893fad5` — создан scope `hidden-tool-scroll-023`.
- `cdf5cc3` — фактическая реализация: marker `data-web-pilot-tool-call-footprint-hidden`, поиск безопасного wrapper и `refresh()` существующей автопрокрутки.
- `c3dd81d` — выпуск 0.6.22.
- `c240ec9` — документация выпуска.
- `1f4cdaf` — архивирование scope.

Текущий `git blame` показывает, что основная логика footprint в `src/main.mjs` (selector, `footprint()`, hide/restore и refresh) по-прежнему принадлежит `cdf5cc3`. После 0.6.22 этот алгоритм функционально не переписывался. Следовательно, это не регрессия от позднейшего изменения Web Pilot; наиболее вероятна несовместимость старого DOM-эвристического правила с обновившейся разметкой ChatGPT.

## Уязвимость старого алгоритма

Текущий код определяет ближайшую границу сообщения так:

`[data-message-author-role],[data-testid="user-message"],[data-testid="assistant-message"]`

Затем `footprint()` поднимается от кнопки tool call вверх только пока текст контейнера равен тексту самой кнопки, но **останавливается перед найденным message boundary**:

`parent !== message`

Это было безопасно для старой разметки, где tool call находился внутри более крупного assistant message, а промежуточный tool-only wrapper не являлся message boundary.

Если ChatGPT теперь помечает отдельный tool-call turn/wrapper собственным `data-message-author-role` или делает tool-only узел отдельным message root, старый алгоритм прекращает подъём на один уровень раньше. Кнопка и внутренний wrapper становятся `display:none`, а внешний message/turn root с `min-height`, padding или gap остаётся в layout. Несколько таких узлов дают именно большой пустой хвост, видимый на снимке пользователя.

Это объяснение подтверждено историей кода и поведением алгоритма. Точная внутренняя DOM-разметка текущего ChatGPT не является стабильным публичным контрактом, поэтому исправление должно опираться не на конкретный CSS-класс, а на содержимое и безопасную границу.

## Выбранное исправление

Сохраняем существующую простую архитектуру и не добавляем отдельный сервис.

1. Найти ближайший message/turn boundary, как и сейчас.
2. Подниматься по tool-only ancestors, пока нормализованный `textContent` полностью совпадает с текстом скрываемого tool-call control.
3. В отличие от 0.6.22, разрешить включить **сам boundary** в скрываемый footprint, но только если он также tool-only.
4. Никогда не скрывать целиком mixed assistant/user message: если в boundary есть какой-либо другой текст, подъём останавливается на предыдущем безопасном wrapper.
5. Сохранять два marker-а и полное обратимое restore.
6. После фактического изменения layout вызывать существующий `window.__webPilotConversationAutoScroll.refresh()`, но не `resume()`; ручное чтение истории остаётся нетронутым.

## Regression coverage

Electron smoke должен моделировать три формы DOM:

- прежний nested wrapper с собственным `min-height`;
- dedicated tool-only message/turn boundary с `min-height` — новая регрессия;
- mixed assistant message: содержательный текст + вложенный tool call — корень сообщения обязан остаться видимым.

Для hide/show/hide проверяются marker, computed `display` и обратимое восстановление layout.

## Границы

Не меняются:

- выполнение MCP/tools;
- содержимое conversation;
- Chat/Work routing;
- composer;
- алгоритм определения ручной прокрутки;
- внутренние API ChatGPT.

Исправление остаётся визуальным DOM-adapter и выпускается отдельной версией 0.6.46 для macOS arm64 и Windows x64.

## Результат 0.6.46

Planning зафиксирован commit `41ddd9bc4bd9cabfbfdb5d2d05ec42c57756f395`; реализация и regression fixture — `e1760c49166cf906eb0cb3db7b6aab39830540e5`; release source — `ba9819ab5b241a979afcd543671d2c2fb09252f0`. Workflow Kit перед выпуском подтвердил syntax, полный Node suite и Electron smoke. Парный `npm run build` сверил 74 source files с обоими packages и обновил постоянный Mac app без смены identity.

Архивы находятся в `~/Downloads/WebPilot-0.6.46/`: macOS arm64 — 181063171 bytes, SHA-256 `7d511780464ac809adef2e0d6a47a58c78ceeb12e7c445804e615bd3bba3c41a`; Windows x64 — 316335471 bytes, SHA-256 `a2e5a544b1345a5b178329a11f691f6f905ed7471d646502e9cff47584c00c96`. Следующее доказательство — пользовательская проверка этой живой ChatGPT-сессии после полного перезапуска 0.6.46.
