# Стабильное разрешение macOS на захват экрана

## Результат и объём поручения

Поручение 03.10.2026 — устранить повторный запрос Screen Recording. Пользователь поручил продолжить реализацию и явно выбрал developer account UkrHD. В T003 подписана и локально установлена macOS arm64 0.6.79. T004 проверяет выданное системное разрешение, настоящий MCP-захват и сохранение доступа после полного перезапуска; обновление с другим CDHash и перезагрузка остаются T005.

После перехода на постоянную подпись пользователь один раз разрешает захват экрана Web Pilot. Штатные последующие обновления и перезапуски сохраняют привязку разрешения к приложению. Критерий относится к обнаруженному отказу из-за несовпадения подписи; обязательное первое согласие macOS сохраняется.

Владельцы: Release & Local Installation и Codex App Server Local Executor. Существующие Electron, MCP, App Server и tunnel сохраняются.

## Подтверждённая причина

После перезагрузки Mac вызов `computer_capture_screen` снова вернул `could not create image from display`.

Журнал TCC от 03.10.2026 11:08:59 прямо сообщает:
`Failed to match existing code requirement for subject com.oleynik.ProjectWebPilot and service kTCCServiceScreenCapture`.

Сохранённое требование привязано к CDHash `c14ae52f91d6075f1fcfa02b680ca7d25d7c3b3a`, текущий CDHash — `f44f32fe75f56bb9cc7a70605ebec7f0ac567af2`. Затем TCC возвращает denied.

Запущена корневая копия `/Users/oleksandroliinyk/VSCODE/Project Web Pilot/Project Web Pilot.app`. Обе копии на момент диагностики 0.6.78, включая `/Applications/Project Web Pilot.app`, имели одинаковую подпись ad hoc, Identifier=Electron, незапечатанные ресурсы и Info.plist, не связанный с подписью. Проверка `codesign --verify --deep --strict` завершается ошибкой `code has no resources but signature indicates they must be present`.

Сохранение inode папки .app защищает Finder-алиас, но само по себе не сохраняет идентичность, которую проверяет TCC.

## Решение

Использовать штатную подпись Electron через `@electron/osx-sign` в существующей упаковке. Подписывать окончательный bundle и вложенные исполняемые компоненты до создания ZIP и установки. После подписи не изменять запечатанные ресурсы.

Закрепить один конкретный сертификат Apple Development, bundle ID `com.oleynik.ProjectWebPilot` и совместимое designated requirement. Не привязывать доверие к CDHash конкретной сборки. Не применять самодельные ослабленные requirements или обход TCC.

На Mac обнаружены три действительных Apple Development identities. Пользователь явно поручил использовать аккаунт UkrHD; выбран соответствующий существующий Apple Development сертификат, принадлежность организации проверена по сертификату и Xcode. Локальная конфигурация содержит точный SHA-1; автоматического выбора нет. Это узкое решение для локальной стабильной подписи; нотарификация, Developer ID distribution и настройка публикации не входят в объём. При отсутствии выбранной identity сборка с обещанием сохранения разрешений должна остановиться, а не незаметно перейти на ad hoc.

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

- Реализация и использование существующего сертификата UkrHD разрешены прямыми поручениями пользователя. Приватные ключи не создаются и не экспортируются; проверка использует только публичный сертификат подписи.
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

## Реализация подписи — T002

`npm run build:mac` сначала выполняет `check:mac-signing`, затем готовит/упаковывает staging, вызывает `sign:mac` и только после успешной строгой проверки подписанного bundle переходит к `release:mac`. Выбор задаётся точным SHA-1 через `WEBPILOT_MAC_SIGNING_IDENTITY` или локальный `.harness/runtime/mac-signing.json` с полем `identity`. Имя/частичный hash, отсутствующий или недействительный сертификат, identity для распространения и symlink-конфигурация отклоняются. Автовыбора и fallback нет.

Прямой dependency закреплён на уже установленном `@electron/osx-sign@2.7.0`. Подпись development/darwin использует штатный обход вложенного кода и entitlements Electron, без provisioning profile, модификации TeamID, нотарификации и Hardened Runtime для распространения; локальная подпись не запрашивает timestamp server. Реальная подпись/захват и совместимость обновлений проверяются последующими задачами T003–T005.

## Контроль установки — T003

Существующий installer проверяет подпись source и временной копии до перемещения прежних Contents, затем проверяет установленный bundle. Ошибка после замены запускает штатный rollback; постоянная внешняя папка .app сохраняет device/inode. Publisher проверяет извлечённый ZIP до установки. `scripts/check-mac-signature.mjs` проверяет действительный certificate signature, bundle ID, выбранный сертификат и TeamID, sealed resources и requirement без CDHash; установленный gate сверяет staging, обе копии и доставленный ZIP с receipt.

Локальная macOS 0.6.79 подписана сертификатом UkrHD и установлена в постоянные пути. Node/uv в mac-tools сохранены с исходными подписями и pinned SHA-256; строгая проверка всего приложения проходит. Отрицательный тест с настоящим подписанным bundle выполнялся только на временной копии: другая identity и повреждённый ресурс не изменили временную установку. Подробности поставки и evidence — [RELEASE](../RELEASE.md).

При завершении T003 системное разрешение и живой захват ещё не были подтверждены. Результаты T004 приведены ниже; обновление с другим CDHash и перезагрузка проверяются отдельно в T005. Проверка подписи не заменяет эти результаты.

## Проверка захвата — T004

Подготовлен `scripts/check-mac-screen-capture.mjs`: до захвата он проверяет запуск подписанного Web Pilot и действующего MCP после сборки, ownership порта 17852 и доступ через штатный `CGPreflightScreenCaptureAccess`. Проверка прав не вызывает consent-диалог; при отсутствии разрешения script останавливается до MCP capture. После разрешения официальный Python MCP client установленного runtime вызывает прежний `computer_capture_screen`; проверяются PNG, размеры/хеш и TCC attribution с текущим PID Web Pilot. Проверка не перезапускает службы и не управляет системными consent-диалогами.

03.10.2026 в 12:24 Europe/Madrid preflight остановился с `MAC_CAPTURE_RESTART_REQUIRED`: app PID 1259 и MCP PID 1302 всё ещё запущены в 11:05, до подписи 0.6.79 в 12:00. Проверены синтаксис Node и встроенного Python client; PNG-захват исправленной версии не вызывался. Evidence: `.harness/runtime/t004-progress.json`.

В 12:32:59 агент выполнил штатный выход через `NSRunningApplication.terminate` и открыл прежний root app; startup перезапустил MCP и стабильный tunnel. Новые PID: app 77118, MCP 77174; preflight подтвердил 0.6.79 и подпись UkrHD. Перезагрузка компьютера не потребовалась. Evidence: `.harness/runtime/t004-restart.json`.

Первый настоящий cloud MCP capture в 12:35:58 не получил PNG. TCC подтвердил responsible application = текущий `com.oleynik.ProjectWebPilot`, но сохранённый старый CDHash всё ещё не совпал с новым постоянным requirement. В 12:40:29 выполнен ровно один адресный `tccutil reset ScreenCapture com.oleynik.ProjectWebPilot`; открыты системные настройки. Receipt предотвращает повторный reset. Native preflight и default script подтвердили отсутствие доступа: `MAC_CAPTURE_PERMISSION_REQUIRED`, без нового MCP-захвата после reset. Evidence: `t004-cloud-capture-attribution.json`, `t004-permission-reset.json`, `t004-consent-preflight.log`, `t004-capture-check.log` в runtime.

После выдачи системного разрешения native preflight подтвердил доступ текущей подписанной копии: app PID 92168, MCP PID 92210. В 14:02:37–14:02:39 Europe/Madrid официальный MCP client получил непустой PNG 1600×900 (1 514 442 байта). TCC подтвердил responsible application = текущий Web Pilot и разрешённый настоящий запрос; mismatch отсутствует. Первое системное разрешение подтверждено состоянием macOS и успешным захватом; агент не нажимал consent-кнопки.

В 14:04:17 агент снова выполнил штатный полный выход и открыл тот же root app. Новые процессы: app PID 98011, MCP PID 98053. Preflight после перезапуска подтвердил сохранённое разрешение, тот же сертификат и requirement. В 14:15:08 реальный захват через новые процессы прошёл: PNG 1600×900 / 1 853 446 байт, положительные настоящие TCC requests, mismatch отсутствует. Назначенные mac-screen-capture и mac-signature повторяют проверки текущего executor и установленной поставки в managed commit. Повторный reset и взаимодействие с системным диалогом не выполнялись.

Evidence: .harness/runtime/t004-initial-capture.json, t004-persistence-restart.json, t004-post-restart-preflight.json, mac-screen-capture-check.json и итоговый t004-progress.json. PNG и связанный TCC log сохраняются только в приватной ignored runtime-папке. Отсутствие видимого диалога пользователь отдельно не подтверждал; T005 требует его подтверждения после обновления/перезагрузки. T004 проверяет фактический доступ текущей сборки и полный перезапуск, но ещё не гарантирует поведение новой сборки.

Первый managed commit остановился по двухминутному timeout mac-signature при чтении доставленного ZIP из Downloads. Диагностическая трасса подтвердила действительные подписи staging/root/Applications и хеш исходного ZIP; TCC сообщил о старом ad hoc requirement для SystemPolicyAllFiles. После следующего запуска app PID 9303 / MCP PID 9346 чтение доставленного файла восстановилось. Для ScreenCapture адресный reset не повторялся; Full Disk Access и TCC.db агент не менял. Итоговые assigned checks подтверждают полноту проверки; при их отказе T004 остаётся открытой.
