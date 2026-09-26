import fs from 'node:fs';

const template = name => fs.readFileSync(new URL('../templates/' + name + '.md', import.meta.url), 'utf8');
const address = 'Для общего плана адрес не нужен. Если recovery содержит sessionId, добавляй --session <sessionId>; для другого плана также --plan <planId>. N — текущая plan_revision из recovery/status.';
const topics = {
  'plan:create': () => template('PLAN') + '\n\n' + template('SPEC'),
  'plan:extend': () => template('CONTINUE'),
  'task:start': () => './scripts/workflow task:start T001\nНачни существующую микрозадачу перед изменением исходников. После успешного старта выполняй работу без дополнительного status. Затем commit --task T001.',
  commit: () => './scripts/workflow commit --task T001\nЗапускает проверки задачи и сохраняет фактические изменения одним коммитом. Если проверка уже входит в commit, не запускай её отдельно на том же состоянии.\nПри неоднозначном составе: --input files.json, где {"files":["src/main.mjs","package.json"]}.\nПосле ошибки исправь указанную причину; после прерывания проверь status перед повтором.',
  'task:update': () => './scripts/workflow task:update --task T001 --input update.json --expected-revision N\nПример update.json: {"files":["src/main.mjs","src/helper.mjs"],"acceptance":["Основной сценарий работает"]}.\nИзменяет контракт незавершённой задачи. Одно добавление исходника не требует task:update: commit сохраняет фактический состав.',
  status: () => './scripts/workflow status\nСвежие состояние плана, задачи, Git, revision и незавершённая транзакция. Не заменяет проверку файлов перед записью.',
  recover: () => './scripts/workflow recover --format text\nПолный стартовый контекст. Для машинного чтения --format json; для inline-контракта --format packet. Не перечитывай уже доставленный неизменившийся пакет.',
  validate: () => './scripts/workflow validate\nПроверяет согласованность плана и Git, не выполняет продуктовые тесты.',
  'plan:view': () => './scripts/workflow plan:view --session <sessionId>\nСобственный план и подготовленные в этой сессии планы.',
  'plan:apply': () => './scripts/workflow plan:apply --input changes.json --expected-revision N\nУточняет текущий план. Для добавления задач проще plan:extend. Сохраняй DONE-задачи и машинные статусы; пример разрешённого изменения: {"acceptance_criteria":["Проверяемый результат"]}.',
  'config:apply': () => './scripts/workflow config:apply --input config.json\nПолная конфигурация проверок, не частичный patch. Прочитай .harness/workflow.json и сохрани остальные поля. Для нового прототипа plan:create настраивает проверки из checks.',
  repair: () => './scripts/workflow repair --dry-run\nПолучить конкретный repair_id, затем --apply <repair_id>. --cancel <repair_id> отменяет неподтверждённую подготовку commit, сохраняя рабочие файлы. Не удаляй журнал вручную.',
  archive: () => './scripts/workflow archive --scope <scopeId> --approval-note "Прямое поручение пользователя"\nТолько по отдельному поручению, после завершения всех задач. Завершённый план не требует архивирования.',
  'plan:prepare': () => './scripts/workflow plan:prepare --session <sessionId> --input draft.json --expected-revision N\nСоздаёт отдельный будущий план, сохраняя текущий. Формат draft — WORKFLOW.md, раздел подготовленных планов.',
  'plan:bind': () => './scripts/workflow plan:bind --session <sessionId> --plan <planId> --target-session <targetId> --experience chat --expected-revision N\nПривязка подготовленного плана к созданной пользователем сессии; experience: chat или work.',
  'plan:adopt': () => './scripts/workflow plan:adopt --session <sessionId> --plan <planId> --input evidence.json --expected-revision N\nПринимает legacy-план только по доказанной связи; контракт evidence — WORKFLOW.md.',
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
