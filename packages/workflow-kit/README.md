# Workflow Kit

Пакет `@webpilot/workflow-kit` версии **1.6.3** внутри репозитория Project Web Pilot. Даёт агенту один текущий план на Git checkout/worktree, проверяемые коммиты задач и полный стартовый контекст (recovery) из плана, документов и Git. Пакет приватный, в npm не публикуется.

## Требования
Node.js 22+ и Git; приложение Web Pilot использует Node 24.21.0. На Windows установщик кладёт Node в `.harness/runtime` проекта; Git — MinGit приложения или системный.

## Исходник и копии
- `packages/workflow-kit/src` — единственный редактируемый исходник; версия записана в `package.json` и `src/lib/common.mjs`.
- `.harness/kit` проекта — установленная копия, которой выполняются коммиты; вручную не редактируется, обновляется установщиком отдельным шагом после проверок.
- `resources/workflow-kit` — копия для приложения: создаётся `npm run stage:workflow-kit` перед start/test/smoke/build, сверяется с `src` файл в файл, в Git не хранится.
- Прежний репозиторий WorkflowKit не источник: на GitHub он в архиве, его не менять, локальную папку не удалять.

## Установка
Из корня репозитория:

```bash
npm ci
node packages/workflow-kit/src/install.mjs --project /absolute/project/path
node packages/workflow-kit/src/install.mjs --project /absolute/empty/folder --mode new
node packages/workflow-kit/src/install.mjs --project /absolute/project/path --update
```

`--dry-run` показывает изменения без записи. Установщик не перезаписывает занятые и изменённые файлы. `--update` обновляет установки версий 1.1.0, 1.2.0, 1.3.0, 1.4.0–1.4.13, 1.5.0–1.5.6, 1.6.0–1.6.2: сохраняет резервную копию в `.harness/runtime/kit-upgrade-*`, текущий план остаётся источником, обновление фиксируется одним коммитом. Перед `--update` нужны автор Git (`user.name`, `user.email`; можно передать `--git-name`/`--git-email`), завершённые merge/rebase и отсутствие посторонних staged-файлов; иначе обновление отказывает до записи файлов. Новая установка без автора Git или поверх незакоммиченных изменений ждёт `./scripts/workflow install:commit`.

## Работа в проекте
```bash
./scripts/workflow status
./scripts/workflow recover --format text
./scripts/workflow plan:create --help
./scripts/workflow task:start T001
./scripts/workflow commit --task T001
./scripts/workflow docs:commit --files '["README.md"]' --message "docs: уточнить README"
```
На Windows PowerShell/CMD — `./scripts/workflow.cmd`. Список команд — `./scripts/workflow help`, форма команды — `--help`.

- Обсуждение и исследование план не требуют. Новый chat продолжает текущий `.harness/plans/todo-plan.md`; независимая работа — отдельный Git worktree. Уже доставленный recovery повторно не запрашивать.
- Задача: `task:start` до правок → работа → `commit --task`; Kit запускает назначенные проверки. Git hooks не обходить.
- `plan:extend` добавляет работу без изменения DONE; `before` ставит задачу перед ещё не начатой.
- Сборка и публикация — только в явно названных delivery-задачах; перед ними Kit ставит DOCS (`DOCS`, `DOCS-2`, …), push до её завершения отклоняется. Без выпуска DOCS не создаётся.
- `docs:commit` фиксирует `.md` вне `.harness/` без плана или между задачами. Каждый изменённый документ ≤ `budget.document_bytes`, по умолчанию 28000 байт UTF-8. Recovery делится на части того же предела: всего ≤ 180000 байт и ≤ 7 частей, без усечения.
- Закрытие плана (`archive`) и перенос незавершённого (`plan:carryover`) — только по поручению пользователя; прежний план читается из Git, архивных копий нет.

## Review нового плана
Опциональное согласование пары spec + to-do plan через Claude CLI перед ACTIVE. По умолчанию OFF, обычным потребителям Claude не нужен. При ON: `review:prepare --help` → `review:run` → позиция автора/исправления → `review:publish`. При ошибке — acknowledge, вопрос пользователю, затем resolve. Публикация проверяет точные входы, первый task:start очищает материалы. [Контракт Review](../../docs/modules/plan-review.md).

## Где данные
- `.harness/plans/todo-plan.md` — текущий план; `.harness/workflow.json` — профиль, проверки, бюджет; `.harness/kit-manifest.json` — состав установки; `.harness/runtime/` — локальные файлы вне Git.
- `<git-dir>/workflow-kit/` — журнал транзакции, результаты проверок, квитанция recovery.

## Проверка
```bash
npm run check --prefix packages/workflow-kit
npm test
```
Первая команда проверяет пакет, внешнего потребителя, установку и обновление, Git lifecycle, документы и recovery полного проекта; вторая запускает корневые тесты Web Pilot, включая тесты Kit. Друг друга они не заменяют.

API, команды, коды ошибок и устройство recovery — [контракт пакета](docs/modules/workflow-kit-package.md). Что проверяет и доставляет приложение — [граница Kit ↔ Web Pilot](../../docs/modules/workflow-kit-recovery.md); само приложение — [README](../../README.md). Факты выпусков — `release-manifest.json` и GitHub Release, прежние версии документов — Git.
