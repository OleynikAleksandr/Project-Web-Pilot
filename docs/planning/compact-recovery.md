# Компактный recovery — Workflow Kit 1.5.4

Поручение пользователя 04.10.2026 (вместе с Project Web Pilot 0.6.87): сократить стартовый пакет, чтобы агент получал его целиком за 1–2 чтения, а формы и карты брал по запросу.

## Почему

ChatGPT показывает модели не больше ~10 000 токенов одного результата инструмента. Пакет recovery Project Web Pilot занимал ~100 КБ (~25 000 токенов): 6 частей через MCP, и агент дважды читал часть из них. Больше половины пакета на старте сессии не нужно: формы PLAN/SPEC/CONTINUE/STAGES (17,5 КБ) нужны только при создании/расширении плана и уже печатаются справкой команд; карты docs/MODULES.md и docs/DOCUMENTATION_INDEX.md (до 30 КБ) читаются, когда приходит задача.

## Результат

1. Recovery не включает формы `.harness/kit/templates/PLAN.md`, `SPEC.md`, `CONTINUE.md`, `STAGES.md`. Вместо них — короткий блок «ФОРМЫ И КАРТЫ ПО ЗАПРОСУ»: `plan:create --help` (PLAN + SPEC), `plan:extend --help` (CONTINUE), `task:start --help` (STAGES), файлы карт.
2. Навигационные карты `docs/MODULES.md` и `docs/DOCUMENTATION_INDEX.md` остаются обязательными документами плана (схема и проверки не меняются), но в recovery попадают ссылкой; целиком — только для финальной DOCS, которой они нужны для сверки.
3. `task:start --help` печатает STAGES.md. Тексты AGENTS-блока, START.md и STAGES.md больше не говорят, что формы «доставлены в recovery».
4. Версия **1.5.4**, upgrade-path 1.5.3 → 1.5.4 через `install --update`.

## Проверка

- `package-check` (`npm run check`): версия 1.5.4, новый baseline SHA-256.
- `runtime-fixture`: recovery через установленный runtime — COMPLETE, без форм и без содержимого карт вне DOCS; блок «ПО ЗАПРОСУ» присутствует; `plan:create --help`, `plan:extend --help`, `task:start --help` печатают формы.

## Границы

Схема плана, `context_pack` и валидация не меняются. OVERVIEW и документы текущего scope остаются целиком.
