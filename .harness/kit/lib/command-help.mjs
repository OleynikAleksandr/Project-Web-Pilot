import fs from 'node:fs';

const template = name => fs.readFileSync(new URL('../templates/' + name + '.md', import.meta.url), 'utf8');
const address = 'Один checkout/worktree имеет один current plan в .harness/plans/todo-plan.md. Команды не требуют session selector; N — текущая plan_revision из recovery/status. Для независимой параллельной работы используй отдельный Git worktree.';
const topics = {
  'plan:create': () => template('PLAN') + '\n\n' + template('SPEC'),
  'plan:carryover': () => './scripts/workflow plan:carryover --input carryover.json --expected-revision N\nВход: {"scope":"old-scope","id":"new-scope","approval_note":"Прямое поручение пользователя"}; objective необязателен. Чистый checkout, без активной микрозадачи. Архив и новый план из незавершённых задач фиксируются одним коммитом; статусы архива не меняются. После прерывания используйте status/repair, повтор после успеха безопасен. Это отдельное закрытие с переносом, обычный archive по-прежнему требует завершения задач.',
  'plan:extend': () => template('CONTINUE'),
  'task:start': () => './scripts/workflow task:start T001\nНачни существующую микрозадачу перед изменением исходников. После успешного старта выполняй работу без дополнительного status. Затем commit --task T001.',
  commit: () => './scripts/workflow commit --task T001\nЗапускает проверки задачи и сохраняет фактические изменения одним коммитом. Если проверка уже входит в commit, не запускай её отдельно на том же состоянии.\nПри неоднозначном составе: --input files.json, где {"files":["src/main.mjs","package.json"]}.\nПосле ошибки исправь указанную причину; после прерывания проверь status перед повтором.',
  'task:update': () => './scripts/workflow task:update --task T001 --input update.json --expected-revision N\nПример update.json: {"files":["src/main.mjs","src/helper.mjs"],"acceptance":["Основной сценарий работает"]}.\nИзменяет контракт незавершённой задачи. Одно добавление исходника не требует task:update: commit сохраняет фактический состав.',
  status: () => './scripts/workflow status\nСвежие состояние плана, задачи, Git, revision и незавершённая транзакция. Не заменяет проверку файлов перед записью.',
  recover: () => './scripts/workflow recover --format text\nПолный стартовый контекст. Для машинного чтения --format json; для inline-контракта --format packet. Не перечитывай уже доставленный неизменившийся пакет.',
  validate: () => './scripts/workflow validate\nПроверяет согласованность плана и Git, не выполняет продуктовые тесты.',
  'plan:view': () => './scripts/workflow plan:view\nПоказывает единственный current plan этого checkout. --session временно принимается только как compatibility metadata.',
  'plan:apply': () => './scripts/workflow plan:apply --input changes.json --expected-revision N\nУточняет текущий план. Для добавления задач проще plan:extend. Сохраняй DONE-задачи и машинные статусы; пример разрешённого изменения: {"acceptance_criteria":["Проверяемый результат"]}.',
  'project:rename': () => './scripts/workflow project:rename --name <имя> --expected-revision N\nМеняет имя проекта в current plan (заголовок плана и recovery), например после переименования папки, и обновляет пути git-hooks в kit-manifest. Только без активной микрозадачи; один служебный коммит. Папку команда не переименовывает.',
  'config:apply': () => './scripts/workflow config:apply --input config.json\nПолная конфигурация проверок, не частичный patch. Прочитай .harness/workflow.json и сохрани остальные поля. Для нового прототипа plan:create настраивает проверки из checks.',
  repair: () => './scripts/workflow repair --dry-run\nПолучить конкретный repair_id, затем --apply <repair_id>. --cancel <repair_id> отменяет неподтверждённую подготовку commit, сохраняя рабочие файлы. Не удаляй журнал вручную.',
  archive: () => './scripts/workflow archive --scope <scopeId> --approval-note "Прямое поручение пользователя"\nТолько по отдельному поручению, после завершения всех задач. Завершённый план не требует архивирования.',
  'plan:prepare': () => 'Команда удалена. Новый chat продолжает текущий plan этого checkout; независимая работа ведётся в отдельном Git worktree.',
  'plan:bind': () => 'Команда удалена. Chat session больше не является владельцем Workflow Kit plan.',
  'plan:adopt': () => 'Команда удалена. Legacy plans остаются read-only history и не выбирают runtime state.',
  'scope:create': () => './scripts/workflow scope:create --input scope.json\nНизкоуровневый полный контракт scope. Для нового прототипа используй plan:create --help: Kit сам сформирует служебные поля.',
  install: () => './scripts/workflow install --project <absolute-path> --mode new\nУстановка Kit в новый проект; mode connect — существующий проект. --update обновляет принадлежащие Kit файлы с проверкой конфликтов.',
  'install:commit': () => './scripts/workflow install:commit --project <absolute-path>\nЗавершение bootstrap после настройки Git identity.',
  inspect: () => './scripts/workflow inspect --project <absolute-path>\nПроверка состояния установки без изменений.',
  doctor: () => './scripts/workflow doctor --project <absolute-path>\nДиагностика установки, ссылок и hooks.',
  remove: () => './scripts/workflow remove --project <absolute-path> --dry-run\nПоказывает удаление принадлежащих Kit неизменённых файлов; применение только по явному поручению.',
  'hook:ack': () => './scripts/workflow hook:ack --marker <DELIVERY-MARKER> --client codex\nПодтверждает только реально доставленный lifecycle marker.',
  hook: () => './scripts/workflow hook session-start\nСлужебный lifecycle endpoint; JSON события поступает в stdin.',
  'git-hook': () => './scripts/workflow git-hook <pre-commit|commit-msg|post-commit|pre-push>\nСлужебная проверка управляемого Git commit; обычно вызывается Git автоматически.'
};
export function commandHelp(command = 'help') {
  if (command === 'help') return 'Project Workflow Kit\n\n' + address + '\n\n' + Object.keys(topics).map(name => './scripts/workflow ' + name + ' --help').join('\n');
  if (!topics[command]) throw Object.assign(new Error('Неизвестная команда справки: ' + command), {code: 'UNKNOWN_COMMAND'});
  return 'Project Workflow Kit — ' + command + '\n\n' + address + '\n\n' + topics[command]();
}
