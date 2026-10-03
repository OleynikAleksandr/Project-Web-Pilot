# Входная инструкция: порядок DOCS, build и publish

## Результат

Новая сессия Project Web Pilot должна получать однозначное правило delivery-порядка из двух согласованных источников:

1. canonical policy WorkflowKit, которая входит в recovery каждой сессии;
2. короткое дублирующее правило Project Web Pilot в `startupMessage()`.

Обязательные правила:

- build/package/sign/notarize/release/GitHub publish запрещены, если такое действие прямо не указано в активной микрозадаче;
- перед любой сборкой или публикацией все относящиеся к результату документы должны быть актуализированы и зафиксированы;
- если план предусматривает delivery, DOCS выполняется **до** delivery-хвоста;
- если предусмотрена сборка, она должна быть последней явной delivery-микрозадачей или входить в последнюю явную delivery-задачу вместе с проверкой/публикацией;
- если сборка в плане не указана — её не выполняют;
- публикация исходников или релиза на GitHub выполняется только после DOCS и только явной delivery-задачей.

## Связанный canonical scope

WorkflowKit:
`/Users/oleksandroliinyk/VSCODE/WorkflowKit`

Current scope:
`delivery-ordering-policy-20261003`

Он меняет canonical recovery policy и механизм расположения DOCS относительно package/installed delivery-задач.

## Проверка

- WorkflowKit scope завершён и его `npm run check` проходит;
- recovery WorkflowKit содержит новые правила;
- `startupMessage()` Project Web Pilot содержит короткое явное правило;
- тесты Web Pilot проверяют наличие правила и отсутствие расхождения с canonical policy;
- code-only план сохраняет обычную финальную DOCS;
- delivery-план имеет порядок работа → DOCS → delivery;
- в этом scope **нет** build/package/release/publish Project Web Pilot.

## Границы

Не собирать новый Project Web Pilot и не публиковать новый релиз в этом плане. Если после изменения policy понадобится новый бинарный релиз, это отдельный следующий plan, где build будет прямо назван последней delivery-микрозадачей.
