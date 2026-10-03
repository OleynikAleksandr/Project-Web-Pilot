# Стабильное разрешение macOS на захват экрана

## Результат и объём поручения

Поручение 03.10.2026 — подготовить план устранения повторного запроса Screen Recording. Сейчас фиксируются контракт и current to-do; реализация, подпись приложения и изменение системных разрешений ещё не выполняются.

После перехода на постоянную подпись пользователь один раз разрешает захват экрана Web Pilot. Штатные последующие обновления и перезапуски сохраняют привязку разрешения к приложению. Критерий относится к обнаруженному отказу из-за несовпадения подписи; обязательное первое согласие macOS сохраняется.

Владельцы: Release & Local Installation и Codex App Server Local Executor. Существующие Electron, MCP, App Server и tunnel сохраняются.

## Подтверждённая причина

После перезагрузки Mac вызов `computer_capture_screen` снова вернул `could not create image from display`.

Журнал TCC от 03.10.2026 11:08:59 прямо сообщает:
`Failed to match existing code requirement for subject com.oleynik.ProjectWebPilot and service kTCCServiceScreenCapture`.

Сохранённое требование привязано к CDHash `c14ae52f91d6075f1fcfa02b680ca7d25d7c3b3a`, текущий CDHash — `f44f32fe75f56bb9cc7a70605ebec7f0ac567af2`. Затем TCC возвращает denied.

Запущена корневая копия `/Users/oleksandroliinyk/VSCODE/Project Web Pilot/Project Web Pilot.app`. Обе текущие копии, включая `/Applications/Project Web Pilot.app`, имеют одинаковую подпись ad hoc, Identifier=Electron, незапечатанные ресурсы и Info.plist, не связанный с подписью. Проверка `codesign --verify --deep --strict` завершается ошибкой `code has no resources but signature indicates they must be present`.

Сохранение inode папки .app защищает Finder-алиас, но само по себе не сохраняет идентичность, которую проверяет TCC.

## Решение

Использовать штатную подпись Electron через `@electron/osx-sign` в существующей упаковке. Подписывать окончательный bundle и вложенные исполняемые компоненты до создания ZIP и установки. После подписи не изменять запечатанные ресурсы.

Закрепить один конкретный сертификат Apple Development, bundle ID `com.oleynik.ProjectWebPilot` и совместимое designated requirement. Не привязывать доверие к CDHash конкретной сборки. Не применять самодельные ослабленные requirements или обход TCC.

На Mac обнаружены три действительных Apple Development identities. Ни одна не выбрана. Перед подписью требуется явный выбор пользователя: действующий прототипный контракт запрещает автоматически выбирать пользовательские сертификаты. Это узкое решение для локальной стабильной подписи; нотарификация, Developer ID distribution и настройка публикации не входят в объём. При отсутствии выбранной identity сборка с обещанием сохранения разрешений должна остановиться, а не незаметно перейти на ad hoc.

Добавить контроль подписи после упаковки и копирования: строгая проверка, ожидаемые bundle/signing identifiers, выбранная identity, sealed resources, совместимость designated requirement между обновлениями. Ошибка блокирует замену рабочего приложения. Сохранить текущие backup/rollback и filesystem identity корневой .app.

## Запуск и миграция

Постоянный путь запуска остаётся `/Users/oleksandroliinyk/VSCODE/Project Web Pilot/Project Web Pilot.app`, штатный Finder-алиас сохраняется. Установленную копию в /Applications проверять на соответствие тому же подписанному bundle.

После первой исправленной установки пользователь полностью перезапускает Web Pilot и связанные executor-процессы, затем заново выдаёт системное разрешение именно текущей копии Web Pilot. Перепривязка выполняется штатными средствами macOS, адресно для этого приложения. Python/server.py не становятся дополнительными обязательными получателями разрешения: журнал устанавливает responsible application = Web Pilot.

Полный доступ ChatGPT connector остаётся отдельным уровнем. Его настройки не меняются в этом плане.

## Проверка

1. Сборка A: строгая проверка готового и установленного bundle, первый системный consent пользователя, один реальный захват через прежний MCP → App Server → screencapture. Ожидается непустой PNG без ошибки TCC.
2. Повторный запуск приложения/executor: захват проходит без нового запроса, в журнале нет mismatch для Web Pilot / ScreenCapture.
3. Сборка B: реальное изменение версии/содержимого меняет CDHash; signing identity и designated requirement сохраняют совместимость. Установка поверх A сохраняет alias и разрешение. Захват через тот же MCP проходит без повторного consent.
4. Перезагрузка Mac и повторный запуск B: результат сохраняется. Живое системное согласие и наблюдение диалога подтверждает пользователь; fixtures не заменяют этот результат.
5. Существующие unit и Electron smoke проверяют затронутый код на изолированных fixtures. Проверки готовых пакетов не объявляются проверкой живого захвата.

Для отрицательного случая на временном bundle повредить ресурс и убедиться, что release gate отклоняет пакет до замены рабочего .app. Не портить текущий установленный app ради теста.

## Границы

- Только планирование на данном этапе; ключи и сертификаты не создаются, не экспортируются и не используются.
- Исправление macOS не меняет AutoPlan, DOM/Sidebar, Workflow Kit runtime, модельный маршрут и MCP tool surface.
- Реальные сертификаты, приватные ключи и локальный выбор identity не записываются в Git.
- Нет автоматического нажатия системных consent-диалогов, правок TCC.db, общего сброса разрешений и новой службы захвата.
- GitHub-публикация и новый парный публичный выпуск этим поручением не запрошены.
- Микрозадачи и статусы находятся только в current `.harness/plans/todo-plan.md`; данный документ не является вторым to-do.

## Проверенный путь и источники

- [Apple DTS: смена ad hoc identity нарушает сохранение ScreenCapture-разрешений](https://developer.apple.com/forums/thread/819406).
- [Apple TN3127: code signing requirements и идентичность кода](https://developer.apple.com/documentation/technotes/tn3127-inside-code-signing-requirements).
- [Официальный @electron/osx-sign: стандартная подпись Electron](https://github.com/electron/osx-sign).

Навигация: [обзор](../architecture/OVERVIEW.md), [модули](../MODULES.md), [индекс](../DOCUMENTATION_INDEX.md), [выпуск](../RELEASE.md), [executor](../modules/codex-app-server-executor.md).
