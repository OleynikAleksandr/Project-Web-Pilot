# Переименование проекта — Workflow Kit 1.5.3

## Результат
После переименования папки проекта (или по желанию пользователя) имя проекта в Kit меняется штатной командой:
`./scripts/workflow project:rename --name <имя> --expected-revision N`. Команда меняет `project_name` в current plan (заголовок плана и recovery) и обновляет пути git-hooks в `.harness/kit-manifest.json` под текущую папку. Один служебный коммит; без активной микрозадачи. Установки 1.5.2 обновляются до 1.5.3 через `install --update`.

## Запуск
- `./scripts/workflow project:rename --name vps-server --expected-revision N` в проекте с Kit 1.5.3.
- Обновление проекта: `workflow install --project <путь> --mode existing --update` (или Project Doctor в Web Pilot).

## Проверка
- `scripts/check-runtime-fixture.mjs`: переименование меняет имя в plan и recovery, пути hooks в manifest, создаёт один коммит; повтор — без коммита; отказ при активной задаче и при недопустимом имени без изменений; обновление 1.5.2 → 1.5.3 сохраняет план.
- `npm run check`: версия 1.5.3, 35 файлов runtime, новый baseline SHA-256.

## Границы
- Имя — одна строка до 100 символов без управляющих символов. Папку команда не переименовывает.
- Состав runtime (35 файлов) и остальные команды не меняются.
