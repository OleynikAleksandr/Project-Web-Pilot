# Шаблон входа scope:create

Это шаблон, а не согласованный активный план. После обсуждения запишите отдельный JSON-файл по примеру, замените содержание на решения пользователя и вызовите `./scripts/workflow scope:create --input <файл>`.

Стартовый этап может касаться только идеи и требований. Временный JSON-вход храните под `.harness/runtime/`, чтобы он не стал вторым активным планом.

```json
{
  "scope_id": "discovery-001",
  "objective": "Согласовать назначение и первую версию продукта",
  "approval_note": "Здесь записывается фактическое решение пользователя о границах этого этапа",
  "acceptance_criteria": ["Описаны пользовательские сценарии и границы первой версии"],
  "approved_scope": {
    "functional_paths": [],
    "documentation_paths": ["docs/PRODUCT.md", "docs/architecture/ARCHITECTURE.md", "docs/DOCUMENTATION_INDEX.md"],
    "max_functional_files_per_task": 3
  },
  "context_pack": {
    "documents": [{"path":"docs/PRODUCT.md","heading_path":["Продукт"],"required":true,"revision":"WORKTREE"}],
    "include_last_completed_task": true,
    "dependency_task_ids": []
  },
  "tasks": [{
    "id": "T001",
    "title": "Записать согласованные сценарии первой версии",
    "why": "Дать архитектуре и реализации проверяемую продуктовую цель",
    "dependencies": [],
    "functional_paths": [],
    "documentation_paths": ["docs/PRODUCT.md"],
    "acceptance_criteria": ["Документ отражает фактические решения пользователя"],
    "verification_ids": [],
    "expected_commit_message": "docs: определить первую версию продукта"
  }]
}
```

Команда назначает project ID, baseline, состояния, revision и commit references сама. Для функциональных задач сначала подключите согласованный профиль и проверки через config:apply.
