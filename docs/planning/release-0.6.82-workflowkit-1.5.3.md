# Project Web Pilot 0.6.82 — release на Workflow Kit 1.5.3

## Результат

Подготовить и опубликовать новый парный релиз **Project Web Pilot 0.6.82** для macOS arm64 и Windows x64, в котором bundled Workflow Kit уже **1.5.3** (команда `project:rename` — штатное переименование проекта, поручение пользователя 04.10.2026 «навести порядок с именами»). После установки новая сборка должна открывать workspace с Workflow Kit 1.5.3 и обновлять проекты 1.5.2 до 1.5.3 через Project Doctor.

Последний опубликованный релиз 0.6.81 остаётся историческим фактом и содержит Workflow Kit 1.5.2. Новый release не переписывает старые теги или assets.

## Обязательный порядок Workflow Kit 1.5.3

План исполняется строго так:

1. **Source preparation** — версия 0.6.82, release guards и проверки переводятся на Workflow Kit 1.5.3. Сборка и GitHub publication на этом этапе запрещены.
2. **DOCS** — все действующие документы обновляются и фиксируются **до любой сборки** и **до GitHub publish/sync**.
3. **Build/package** — только после DOCS выполняется парный npm run build; проверяются macOS/Windows artifacts, подпись, source snapshot, generated Workflow Kit 1.5.3 и release manifest.
4. **Installed delivery** — без пересборки обновляется /Applications/Project Web Pilot.app штатным installMacBundle; затем check-installed-release.mjs проверяет root app, /Applications, staging и оба ZIP.
5. **GitHub delivery** — только после успешной сборки и installed gate публикуются/синхронизируются main, tag v0.6.82, GitHub Release и пять release files. Remote tag должен указывать на release-manifest.sourceCommit; размеры и SHA-256 GitHub assets должны совпасть с локальной поставкой.

Никакой build/package/sign/release/publish не выполняется вне явно названных delivery-задач T002–T004.

## Source preparation

T001 должна как минимум:

- поднять package.json и package-lock.json до **0.6.82**;
- перевести оставшиеся hard-coded release gates с Workflow Kit 1.5.2 на **1.5.3**, включая scripts/check-installed-release.mjs и scripts/verify-windows-package.mjs;
- сохранить canonical dependency/staging contract: Workflow Kit **1.5.3**, 35 файлов, SHA-256 d59ae7b6b074e953fdd6c5d78d1f644902f0e7b9af5ad3c78d67d42f1f6a1c0f;
- добавить/уточнить проверку GitHub release, которая сверяет remote tag/release/assets с release-manifest.json;
- прогнать source/integration regressions без сборки release.

## DOCS до delivery

Системная DOCS Workflow Kit 1.5.3 должна быть расположена **между T001 и T002**.

До первой сборки документы должны уже фиксировать:

- source/dev и bundled runtime нового релиза = Workflow Kit 1.5.3;
- target release = 0.6.82;
- 0.6.81 остаётся предыдущим опубликованным релизом;
- native Windows остаётся отдельной непроведённой platform-проверкой, если пользователь не выполнял её;
- build и GitHub publication ещё не объявляются выполненными до соответствующих delivery-задач.

## Delivery

### T002 — Build/package 0.6.82

Назначенная package-проверка запускает штатный npm run build **после DOCS commit**.

Критерии:

- ~/Downloads/WebPilot-0.6.82/ содержит macOS arm64 ZIP, Windows x64 ZIP, SHA256SUMS.txt, INSTALL.txt, release-manifest.json;
- release-manifest.sourceCommit указывает на source HEAD, существовавший до delivery bookkeeping commit;
- packagedSourceMatches=true;
- bundled Workflow Kit = 1.5.3 / 35 files / canonical SHA;
- macOS bundle подписан выбранным Apple Development сертификатом UkrHD;
- Windows package проходит verify:win на Mac;
- native Windows и clean VM не заявляются проверенными без отдельного факта.

### T003 — Installed delivery

После T002, **без пересборки**, staging app устанавливается в /Applications/Project Web Pilot.app штатным installMacBundle с backup/rollback и сохранением filesystem identity. Затем scripts/check-installed-release.mjs проверяет обе установленные Mac-копии, staging, ZIP, подпись и bundled runtime.

### T004 — GitHub publish/sync

Только после T003:

- синхронизировать main;
- создать/проверить tag v0.6.82 на release-manifest.sourceCommit;
- создать GitHub Release v0.6.82;
- загрузить пять файлов из готовой поставки без пересборки;
- сверить server size/digest каждого asset;
- после managed commit T004 отправить финальный main и повторно подтвердить, что origin/main == local HEAD.

GitHub publication не должна запускать новую сборку и не должна перемещать старые release tags.

## Проверка

Source gate:
- relevant unit/integration tests;
- check-workflow-kit-dependency.mjs;
- workspace setup открывает/поддерживает bundled Workflow Kit 1.5.3.

Package gate:
- npm run build.

Installed gate:
- node scripts/check-installed-release.mjs.

GitHub gate:
- локальный verifier GitHub release/tag/assets/main против release manifest.

## Границы

- Единственный управляющий current plan — Project Web Pilot.
- WorkflowKit остаётся отдельным canonical source и не получает незавершённый current plan.
- Не менять signing identity UkrHD.
- Не переподписывать bundled Node/uv отдельно от существующего release contract.
- Не выполнять native Windows/clean VM автоматически.
- Не архивировать новый scope без отдельного прямого поручения пользователя.
