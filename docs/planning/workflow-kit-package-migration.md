# Workflow Kit package migration — Project Web Pilot

Связанные проекты (02.10.2026): **Workflow Kit** — планы и recovery; **Web Pilot Sidebar** — отдельно разрабатываемый браузерный интерфейс. [Рабочие каталоги и границы интеграции](../SOURCE_WORKSPACES.md).

## Результат

Project Web Pilot использует единственный canonical package `@webpilot/workflow-kit@1.4.12` из `/Users/oleksandroliinyk/VSCODE/WorkflowKit`. Tracked duplicate `resources/workflow-kit` удалён как исходник. Если этот layout нужен external workers и Electron package, он создаётся автоматически как generated staging из `getRuntimeRoot()`.

## Запуск

Development использует package exports. Перед start/test/smoke/build staging автоматически синхронизирует runtime в `resources/workflow-kit`. Парный релиз собирается штатной командой `npm run build` и выдаёт macOS arm64 и Windows x64 одной версии в `~/Downloads/WebPilot-<version>/`.

## Проверка

- resolved package = `@webpilot/workflow-kit@1.4.12`;
- canonical/staged runtime = 35 файлов, SHA-256 `5464b2c1528eef1de740af50558bc8db1d39cfa7838f9c032d23650fb4f5f119`;
- unit suite, Workspace Setup, Project Doctor, session plans/recovery и Electron smoke проходят;
- macOS arm64 и Windows x64 packages содержат правильный runtime и проходят штатные verifiers;
- готовые packages не зависят при запуске от sibling `/Users/oleksandroliinyk/VSCODE/WorkflowKit`.

## Границы

Не менять Workflow Kit business logic, Plan/Session/Recovery formats, WebPilot UI/UX, Secure MCP Tunnel, Codex App Server integration и собственный `.harness/kit` Project Web Pilot. Не начинать ChatGPT MCP App. Исторические archived plans не переписывать. Каждая техническая задача завершается отдельным managed commit.

## Фактический результат — 0.6.56

Миграция завершена: T001 `2327c5ed`, T002 `d9a9b070`, T003 `f959dcee`, T004 `a581e250`. В Git WebPilot нет tracked `resources/workflow-kit`; staging восстанавливает 35 файлов canonical package с ожидаемым digest. После удаления duplicate полный Node suite: 358 tests / 355 PASS / 3 SKIP / 0 FAIL. Electron smoke и парный package check прошли. Финальный post-commit `npm run build` собрал macOS arm64 и Windows x64 из `a581e250f9baf3e79ff688381fc44fe1c8e4e849`; delivery — `~/Downloads/WebPilot-0.6.56/`.
