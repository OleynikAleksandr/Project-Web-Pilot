# Шаблон входа scope:create

Todo-plan реализует уже согласованный контракт. Для функционального scope сначала зарегистрируйте владельца в `docs/MODULES.md` и согласуйте его module specification. Временный JSON-вход храните под `.harness/runtime/`.

```json
{
  "scope_id": "module-change-001",
  "objective": "Реализовать согласованное изменение модуля",
  "approval_note": "Фактическое решение пользователя о контракте и границах scope",
  "acceptance_criteria": ["Согласованный контракт модуля реализован и проверен"],
  "approved_scope": {
    "functional_paths": ["src/module.mjs"],
    "documentation_paths": ["docs/modules/module.md"],
    "max_functional_files_per_task": 3
  },
  "context_pack": {
    "documents": [
      {"path":"docs/architecture/OVERVIEW.md","heading_path":["Краткая архитектура проекта"],"required":true,"revision":"WORKTREE"},
      {"path":"docs/modules/module.md","heading_path":["Module Specification — Module"],"required":true,"revision":"WORKTREE"}
    ],
    "include_last_completed_task": false,
    "dependency_task_ids": []
  },
  "tasks": [{
    "id": "T001",
    "title": "Реализовать первый проверяемый шаг",
    "why": "Выполнить часть уже согласованного module contract",
    "dependencies": [],
    "functional_paths": ["src/module.mjs"],
    "documentation_paths": ["docs/modules/module.md"],
    "acceptance_criteria": ["Поведение соответствует specification"],
    "verification_ids": [],
    "expected_commit_message": "feat: реализовать шаг модуля"
  }]
}
```

Для чисто исследовательского/документального scope functional_paths могут быть пустыми; module specification тогда заменяется явно указанным planning/spec document. Команда назначает ID, baseline, revision, статусы и commit references сама.
