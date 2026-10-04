# Вход plan:create

Определи результат, основной сценарий, запуск и проверку. Запиши короткий контракт в docs/planning/prototype.md по форме SPEC.md (она напечатана ниже в этой же справке), не требуя повторного согласования ясного поручения. Для существующего проекта используй его стек и команды. Небольшому прототипу достаточно одной задачи реализации; финальную DOCS добавит Kit.

Если поручение включает delivery, задай его только явными последними задачами плана. Build/package/install оформляй через `verification_kind=package|installed`; source-only GitHub publish — отдельной явно названной задачей. Документы должны быть актуализированы и зафиксированы до build/publish, поэтому DOCS должна предшествовать delivery-хвосту. Не прячь build/sign/notarize/release/publish в code/test/DOCS-задачах и не добавляй delivery, которого пользователь не поручал.

Ниже пример формы для утилиты Node.js; пути и команду проверки замени под фактический продукт (интерфейс, сайт, API, обработку данных или иной результат). Это не предписание создавать именно утилиту или использовать Node.js.

```json
{
  "id": "prototype-001",
  "spec": "docs/planning/prototype.md",
  "objective": "Получить работающий прототип по поручению пользователя",
  "stack": "Node.js",
  "checks": [
    {"id":"scenario","executable":"node","args":["scripts/check-scenario.mjs"]}
  ],
  "tasks": [
    {"id":"T001","title":"Реализовать и проверить основной сценарий","files":["src/main.mjs","scripts/check-scenario.mjs"],"checks":["scenario"],"acceptance":["Запрошенный сценарий работает через пользовательский интерфейс или входную команду"]}
  ]
}
```

Сохрани JSON в `.harness/runtime/plan.json` и выполни `./scripts/workflow plan:create --input .harness/runtime/plan.json && ./scripts/workflow task:start T001` (T001 замени на первый ID своего плана). Команды всегда работают с current plan этого checkout/worktree; session selector не нужен. verification_kind по умолчанию code. Если задача включает упаковку или установку, укажи соответственно package или installed и проверку с таким kind и evidence, называющим артефакт и реальный сценарий. Отдельная задача на каждый технический шаг не нужна. Проверка должна выполнять утверждения о результате, а не просто печатать успех.

files — предполагаемые пути без лимита: commit сохраняет фактический состав. checks — ID перечисленных проверок; acceptance, why, commit, dependencies уточняются при необходимости. Статусы и DOCS создаёт Kit. Git и прототипирование описаны в переданном PROTOTYPE.md; пример локальной упаковки Electron — `.harness/kit/examples/PACKAGING.md`.
