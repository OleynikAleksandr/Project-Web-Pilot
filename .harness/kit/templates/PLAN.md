# Форма плана реализации

Объём реализации и рабочая спецификация определяются в диалоге. Процесс плана, DOCS и delivery задан Workflow Core; SPEC ниже — форма требований. Запиши только данные задачи, служебные поля создаёт Kit.

```json
{
  "id":"prototype-001",
  "spec":"docs/planning/prototype.md",
  "objective":"Пользователь получает работающий результат",
  "stack":"Node.js",
  "checks":[{"id":"test","executable":"node","args":["--test"],"kind":"test"}],
  "tasks":[{"id":"T001","title":"Реализовать основной сценарий","files":["src/main.mjs","tests/main.test.mjs"],"checks":["test"],"acceptance":["Сценарий и обработка ошибок работают"]}]
}
```

Сохрани JSON в `.harness/runtime/plan.json`, вызови `./scripts/workflow plan:create --input .harness/runtime/plan.json`. Подставь существующий стек и реальные проверки; Node не обязателен. spec — существующий документ требований. Небольшой самостоятельный результат может составлять одну микрозадачу.

files — предполагаемые пути; acceptance, why, commit, dependencies уточняются при необходимости. checks — ID проверок конфигурации. Для delivery используется verification_kind package или installed и проверка того же kind с evidence; форму показывает task:start --help. Контекст задачи выбирается через context_pack в plan:apply; не копируй шаблоны в проект.
