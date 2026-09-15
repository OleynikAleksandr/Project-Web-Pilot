# Шаблон входа scope:create

Todo-plan реализует уже согласованный этап проекта любого типа. До создания scope определите затрагиваемую часть проекта через `docs/MODULES.md` и согласуйте её specification/planning document. Для программного модуля документ фиксирует facade, входы/выходы, границы и инварианты; внутреннюю реализацию следует дробить на узкие классы/микроклассы. Временный JSON-вход храните под `.harness/runtime/`.

Три project-navigation документа обязательны для каждого рабочего scope: `docs/architecture/OVERVIEW.md`, `docs/MODULES.md` и `docs/DOCUMENTATION_INDEX.md`. Workflow Kit нормализует их как required даже если автор входа их пропустил. Последняя задача всегда `DOCS` — «Актуализация всех документов проекта»; она зависит от всех остальных задач. После её завершения следует отдельная пользовательская приёмка, которая не является задачей агента.

```json
{
  "scope_id": "project-stage-001",
  "objective": "Выполнить согласованный следующий этап проекта",
  "approval_note": "Фактическое решение пользователя о результате и границах этапа",
  "acceptance_criteria": ["Согласованный результат этапа получен и проверен"],
  "approved_scope": {
    "functional_paths": ["src/module.mjs"],
    "documentation_paths": [
      "docs/architecture/OVERVIEW.md",
      "docs/MODULES.md",
      "docs/DOCUMENTATION_INDEX.md",
      "docs/modules/module.md"
    ],
    "max_functional_files_per_task": 3
  },
  "context_pack": {
    "documents": [
      {"path":"docs/architecture/OVERVIEW.md","heading_path":["Краткая архитектура проекта"],"required":true,"revision":"WORKTREE"},
      {"path":"docs/MODULES.md","heading_path":["Модули проекта"],"required":true,"revision":"WORKTREE"},
      {"path":"docs/DOCUMENTATION_INDEX.md","heading_path":["Каталог документации"],"required":true,"revision":"WORKTREE"},
      {"path":"docs/modules/module.md","heading_path":["Module Specification — Module"],"required":true,"revision":"WORKTREE"}
    ],
    "include_last_completed_task": false,
    "dependency_task_ids": []
  },
  "tasks": [
    {
      "id": "T001",
      "title": "Выполнить первый проверяемый шаг",
      "why": "Реализовать часть уже согласованного этапа",
      "dependencies": [],
      "functional_paths": ["src/module.mjs"],
      "documentation_paths": ["docs/modules/module.md"],
      "acceptance_criteria": ["Результат соответствует согласованной specification"],
      "verification_ids": [],
      "expected_commit_message": "feat: выполнить шаг проекта"
    },
    {
      "id": "DOCS",
      "title": "Актуализация всех документов проекта",
      "why": "После выполнения этапа проверить весь действующий комплект документации по индексу и обновить только устаревшие сведения и ссылки",
      "dependencies": ["T001"],
      "functional_paths": [],
      "documentation_paths": [
        "docs/architecture/OVERVIEW.md",
        "docs/MODULES.md",
        "docs/DOCUMENTATION_INDEX.md"
      ],
      "acceptance_criteria": ["Все документы из индекса проверены; актуальные оставлены без бессмысленных правок; устаревшие сведения и ссылки исправлены"],
      "verification_ids": [],
      "expected_commit_message": "docs: актуализировать документацию проекта"
    }
  ]
}
```

Для исследовательского, проектного, творческого или другого непрограммного scope `functional_paths` могут быть пустыми, а `docs/modules/module.md` заменяется релевантным planning/spec document. Три project-navigation документа и финальная задача `DOCS` остаются обязательными. Команда назначает baseline, revision, статусы и commit references сама и не может заменить пользовательскую приёмку.
