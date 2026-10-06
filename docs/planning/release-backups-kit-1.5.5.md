# Одна резервная копия на установку и Workflow Kit 1.5.5 — релиз 0.6.89

Поручение пользователя 04.10.2026 после уборки «Программ».

## Проблема

1. `installMacBundle` при каждой установке сохранял прежний `Contents` в новую папку `.harness/runtime/release-backups/mac-XXXXXX` и никогда их не удалял: к 0.6.88 накопилось около 110 копий на 46 ГБ. Папки копий не имеют расширения `.app`, поэтому Spotlight показывал вложенные `Project Web Pilot Helper*.app` как отдельные приложения.
2. Публикация исходников на GitHub, оформленная обычной задачей, могла уйти раньше DOCS.

## Результат

1. Резервные копии — в `.harness/runtime/release-backups.noindex` (Spotlight не индексирует папки `.noindex`). Для каждой цели установки (корневой app и `/Applications`) хранится одна копия — предыдущая версия: после проверенной установки новая копия заменяет прежнюю в постоянном слоте `mac-<папка>-<hash пути>`. Откат при ошибке установки не меняется. Если заменить слот не удалось, установка остаётся успешной, а копия — во временной папке рядом (`backupError` в результате).
2. Bundled Workflow Kit **1.5.5** ([контракт](../../packages/workflow-kit/docs/planning/push-after-docs.md)): управляемый `pre-push` отказывает в push, пока DOCS текущего плана не завершена. Release-gates Web Pilot ожидают 1.5.5; Kit проекта обновляется штатным `install --update`.
3. Релиз **0.6.89**: версия → DOCS → парная сборка → установка → GitHub Release.

## Проверка

- `unit-all`: `tests/release-mac.test.mjs` — три выпуска подряд оставляют одну копию в `release-backups.noindex` с предыдущей версией; вторая цель получает свой слот; откат и защита прежние.
- `release-source`: Workflow Kit 1.5.5 (версия, 35 файлов, SHA-256 `8eadd98869a840f670dbfb00c33350e3054d8ec7de5298b2b0beca82d787f376`).
- Установка 0.6.89 (T-installed): в `release-backups.noindex` ровно две копии 0.6.88 — корневой app и `/Applications`; push релиза проходит через новый pre-push после DOCS.

## Границы

Приложение, MCP-сервер и стартовое сообщение не меняются. Старые копии уже перенесены пользователем в Корзину.

## Итог

- T001 `88762d4` — резервные копии (`scripts/release-mac.mjs`, тесты); kit-update `cf39482` — Kit проекта 1.5.5; T002 `6d9f39b` — release-gates 1.5.5; T003 `241580d` — версия 0.6.89. Зависимость `@webpilot/workflow-kit` уже была 1.5.5, поэтому `unit-all` T001 выполнялась на рабочей копии вместе с правками gates; сами gates зафиксированы в T002.
- DOCS `d340f7a`; T004 — сборка из sourceCommit `d340f7afdad3963888ae5c484c201287635fd549`; T005 — установка в `/Applications` без пересборки, в `release-backups.noindex` по одной копии на цель.
- T006: [GitHub Release v0.6.89](https://github.com/OleynikAleksandr/Project-Web-Pilot/releases/tag/v0.6.89) опубликован 2026-10-04T17:08:22Z, пять assets сверены по серверным SHA-256; push прошёл через pre-push Kit 1.5.5 после DOCS.
