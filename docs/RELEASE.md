# Выпуск и постоянный путь запуска

## Текущая локальная поставка — 0.6.65 / 28.09.2026

Исправление T009 добавляет распознавание «Resume stream unavailable». Существующие ограничения восстановления, запрет повторного Send и защита черновика сохранены.

Парный `npm run build`: базовый commit `d7731f3aa061921d1e8cb86fb1e7355e4a4b09a7`, изменения версии и адаптера входят в T009. Все 101 source/resource файлов сверены с обеими упаковками. Корневой app и `/Applications/Project Web Pilot.app` обновлены с сохранением inode 406600483 и 406571340. Работающий процесс не перезапускался.

Доставка: `~/Downloads/WebPilot-0.6.65/`, включая `SHA256SUMS.txt`, `INSTALL.txt`, `release-manifest.json`.

- `Project-Web-Pilot-0.6.65-macOS-arm64.zip` — 181492068 bytes; SHA-256 `b7e43ce33125a83a562723ca92a7de4c69aa56479d6b5b3888e3a78de341a5f2`.
- `Project-Web-Pilot-0.6.65-Windows-x64.zip` — 316753921 bytes; SHA-256 `b8b621a00e7f1bc29ae577db550d358ff0b983b1747a87f11b5e9819301e36b9`.

Проверки T009: Node suite, Electron smoke и installed/package gate; installed observer/composer распознают новую ошибку и сохраняют единственное сообщение при reload в изолированном fixture. Native Windows, live ChatGPT и clean VM не проверялись. Workflow Kit остаётся 1.5.0; фазы 2/3 не выполнялись. Новый GitHub Release не публиковался.

## Предыдущая локальная поставка — 0.6.64 / 28.09.2026

`npm run build` выпустил macOS arm64 и Windows x64 из одной версии исходников; базовый commit `884e8818364709691c4f2b8a3349b4a7dfad6de8`, версия package/lock обновлена до 0.6.64 в задаче выпуска. Все 101 source/resource файла сверены с обеими упаковками. Root app и `/Applications/Project Web Pilot.app` обновлены с прежними inode 406600483 и 406571340 соответственно. Сборка не перезапускает открытый пользовательский процесс.

Доставка: `~/Downloads/WebPilot-0.6.64/`, рядом `SHA256SUMS.txt`, `INSTALL.txt` и `release-manifest.json`.

- `Project-Web-Pilot-0.6.64-macOS-arm64.zip` — 181490764 bytes; SHA-256 `b0d90ac3fbcd2ed64cab0d41ad22077eb3b89d41ac76f7a1593384d778bc9998`.
- `Project-Web-Pilot-0.6.64-Windows-x64.zip` — 316752603 bytes; SHA-256 `4c21ba3ad5d8b506df1d73833375eb4a0ef201638107d468ac7c005a85c7bee0`.

`scripts/check-event-runtime-release.mjs` проверяет источники/версии обеих упаковок, обе установленные macOS копии, identity, hashes ZIP и наличие generated preload в каждом ZIP. Отдельный Electron fixture исполняет preload и composer, извлечённые из установленной копии, на изолированной странице: большой Send, reload того же разговора и отсутствие дубля. Полный исходный UI проверен Electron smoke; полный запуск установленного приложения с реальным аккаунтом и native Windows не объявляются проверенными.

Первая фаза событийного runtime завершена; этот заказанный промежуточный выпуск не закрывает фазы 2/3. Workflow Kit 1.5.0 и runtime digest не менялись. Локальная поставка не опубликована как новый GitHub Release.


## Согласованный результат

16.09.2026 пользователь поручил один постоянный адрес приложения для Finder-алиаса и отдельный ZIP. Владелец этой части проекта — Release & Local Installation.

Постоянный macOS app: `<workspace>/Project Web Pilot.app`. На основном Mac это `/Users/oleksandroliinyk/VSCODE/Project Web Pilot/Project Web Pilot.app`. Имя и путь не зависят от версии. Пользователь один раз создаёт Finder-алиас на этот объект.

Отдельный архив: `.harness/runtime/releases/<version>/Project-Web-Pilot-<version>-macOS-arm64.zip`. Для выдачи пользователю архив копируется в `~/Downloads/WebPilot-<version>/`. Версия берётся из package.json. Постоянный app и ZIP — самостоятельные результаты выпуска.

## Facade и границы

- `npm run build:mac`: подготовить runtime, собрать app в staging, опубликовать постоянный app и отдельный ZIP.
- `npm run release:mac`: проверить уже собранный staging и повторить публикацию.
- `scripts/release-mac.mjs`: facade `publishMacRelease({ root })`; узкая операция `installMacBundle({ source, target, backupRoot, version })`.
- Входы: macOS arm64 staging bundle, версия package.json, корень workspace.
- Выходы: постоянный app, версионированный ZIP, checksum и локальный release receipt.
- Сборочный скрипт не меняет настройки, профиль Chromium, проекты или чаты; не останавливает запущенное приложение.
- Windows остаётся отдельной поставкой; macOS app из корня исключается из упаковки обеих платформ.

## Инварианты обновления

1. Перед заменой проверяются Info.plist и версия package.json внутри app.asar; источник копируется в staging и проверяется.
2. Корневая директория существующего постоянного `.app` сохраняет filesystem identity (device/inode). Меняется только Contents; старый Contents остаётся в отдельной резервной копии под `.harness/runtime/release-backups/`.
3. При ошибке установки прежний Contents возвращается. Неизвестные файлы в корне bundle и symlink вместо app не перезаписываются.
4. ZIP формируется из той же проверенной сборки отдельно от постоянного app; архив проверяется через unzip. Релиз считается готовым только при успехе установки и упаковки.
5. App, ZIP, backup и staging не входят в Git. Корневой app явно исключён из обоих packager commands, чтобы повторная сборка не включала предыдущую сборку внутрь новой.
6. В итоговом отчёте подтверждаются версия установленного app, равенство app.asar со staging и путь ZIP. Только наличие ZIP не означает завершённую доставку.
7. Работающий процесс продолжает старую сессию до полного выхода и нового запуска; замена файлов не считается перезапуском.

## Переход с прежнего алиаса

Старый адрес `.harness/runtime/releases/0.6.20/Project Web Pilot-darwin-arm64/Project Web Pilot.app` один раз обновляется до 0.6.23 с сохранением identity. Это совместимость с нынешним алиасом, а не будущий постоянный адрес. После выпуска пользователь создаёт алиас на app в корне проекта. Следующие релизы обновляют именно корневой app.
## Проверка механизма

`node --test tests/release-mac.test.mjs` на macOS проверяет повторный выпуск, неизменный device/inode постоянного app, отсутствие устаревших файлов, backup, распаковку отдельного ZIP и отказ при неверной версии, посторонних файлах или symlink target. На других платформах эти три проверки пропускаются. `mac-release.json` и `<zip>.sha256` сохраняют фактическую доставку и контрольную сумму.

## Выполненный переход — 0.6.23

Постоянный корневой app установлен и повторно обновлён штатным build:mac с неизменным inode. Прежний app в releases/0.6.20 также обновлён до 0.6.23 с сохранением identity. Проверены версии, совпадение app.asar со staging, ZIP integrity и отсутствие вложенного app в обоих platform packages. Подробные контрольные суммы и evidence — `docs/VERIFICATION.md` и `.harness/runtime/releases/0.6.23/release-manifest.json`.

## Последующий выпуск — 0.6.24

Штатная сборка обновила постоянный корневой app с 0.6.23 до 0.6.24, сохранив device/inode. Отдельный ZIP и checksum находятся в .harness/runtime/releases/0.6.24/ и ~/Downloads/WebPilot-0.6.24/. Исторический адрес releases/0.6.20 остаётся однократно обновлённой копией 0.6.23; актуальный запуск — только постоянный корневой app.

## Последующий выпуск — 0.6.25

Постоянный корневой app обновлён с 0.6.24 до 0.6.25 штатным build:mac, identity сохранена. Поставки обеих платформ — .harness/runtime/releases/0.6.25/; копии ZIP — ~/Downloads/WebPilot-0.6.25/. Релиз добавляет фон ввода и исправляет обработку цвета потокового текста. Для применения нужен полный выход и повторный запуск через постоянный алиас.


## Последующий выпуск — 0.6.26

Постоянный корневой app обновлён с 0.6.25 до 0.6.26 штатным `build:mac` с сохранением inode `398344301`. macOS ZIP опубликован штатным publisher; Windows x64 package прошёл verifier и упакован отдельным ZIP. Обе поставки находятся в `.harness/runtime/releases/0.6.26/`, копии ZIP и `SHA256SUMS.txt` — в `~/Downloads/WebPilot-0.6.26/`. Релиз меняет только визуальное выделение активной сессии в дереве. Для применения уже запущенного macOS приложения нужен полный выход и повторный запуск через постоянный алиас.

## Проверка самостоятельной установки — clean-install-lab-027

Пользователь поручил подготовить чистые виртуальные macOS и Windows и проверить на них готовые поставки. После уточнения 17.09 подготовка стенда завершена, проверка первых запусков перенесена в следующий scope; здесь выполнена диагностика задержек Computer Use. Планировочный документ и фактические результаты — `docs/CLEAN_INSTALL.md`. Наличие bundled компонентов не означает успешную установку на чистой ОС; для 0.6.26 выявлены внешняя зависимость Mac от Node/Git, незавершённое подключение Windows Git к Workspace Setup и отсутствие Mac UI настройки туннеля. Успех на компьютере разработчика не заменяет эту проверку. Рабочие runtime/профили основного компьютера сохраняются.


## Наблюдаемая поставка 0.6.27 — 17.09.2026

На 17.09.2026 этот Git-checkout содержит исходники 0.6.26, а установленный корневой macOS app по Info.plist — 0.6.27. Пользователь сообщил о выпуске 0.6.27 другим агентом; ZIP обеих платформ есть в ~/Downloads/WebPilot-0.6.27/. Соответствие этих пакетов данному checkout и их чистая установка пока не подтверждены.

Пакет macOS 0.6.27 скопирован и распакован пользователем в гостевой Test-macOS. Публикация, rebuild, изменение версии исходников и проверка release provenance в clean-install-lab-027 не выполнялись. Перед следующим испытанием сверить выбранные пакеты и SHA-256; сведения об успешно проверенной 0.6.26 выше сохраняются как история.

## Выпуск 0.6.28 — планы сессий / T013

17.09.2026 собраны macOS arm64 и Windows x64 из одного source. Workflow Kit 1.4.0 включён в обе поставки. Постоянный Project Web Pilot.app обновлён штатным build:mac; device 16777232 / inode 398344301 сохранены. app.asar установленного приложения совпадает со staging и ZIP; все 32 файла src и поставляемые resources совпадают с source. Обводка дерева из 0.6.27 сохранена. Windows verifier проверил PE, Node и runtime SHA. Оба ZIP проверены и скопированы в ~/Downloads/WebPilot-0.6.28/ вместе с SHA256SUMS.txt.

- Project-Web-Pilot-0.6.28-macOS-arm64.zip: SHA-256 df7ddb3a155c320ea5b980dadf130316eb1c7896029c7634a4b690136220570b; 145210773 bytes.
- Project-Web-Pilot-0.6.28-Windows-x64.zip: SHA-256 f61492cc74bc2c560412a2a0adb6cfa54469232f0c21fd7bf25f5c9fe0f6c222; 318057661 bytes.

Evidence: .harness/runtime/releases/0.6.28/{mac-release.json,source-verification.json,release-manifest.json,SHA256SUMS.txt}. Реальный ChatGPT, чистая установка в UTM и native Windows этим выпуском не проверялись. Работающее приложение не перезапускалось: для применения нужен полный выход и повторный запуск через постоянный app/алиас.

Для 0.6.28 происхождение исходников уточнено: единственное различие src установленного 0.6.27 относительно исходного 0.6.26 было в index.html. Его обводка/линии сохранены в новом UI; пакет не заменён старой реализацией.

## Выпуск 0.6.29 — быстрое открытие / scope 029

17.09.2026 штатно собраны macOS arm64 и Windows x64 с Workflow Kit 1.4.1. Постоянный корневой app обновлён; device 16777232 / inode 398344301 сохранены, прежний Contents находится в release-backups/mac-K8QmyO. Все 33 файла src и 31 файл resources совпадают с source в обеих поставках и установленном app; app.asar установленного app совпадает со staging и ZIP (`11fdfee96de9ff163e2f80c907e1a4847bc4466d1ff905b7cf7a83dd309f8970`). Вложенного старого app нет.

- macOS ZIP: `bf01bfb8d576d9a63311ec51abbc58aa5b4693817826022aca038852b237169e`, 145219226 bytes.
- Windows ZIP: `f902693319d1c6ec644e96ebadac423f5735a1508cb4c55c028085e59d3a8859`, 315992003 bytes.

Оба ZIP прошли integrity/asar проверку; копии и SHA256SUMS.txt находятся в ~/Downloads/WebPilot-0.6.29/. Evidence: .harness/runtime/releases/0.6.29/{mac-release.json,source-verification.json,release-manifest.json}. Установленный macOS app измерен на отдельном профиле: 30 переключений, p95 обоих локальных endpoints 14.3 мс; пять запусков shell→план 14–19 мс, полный spawn→план 389–1682 мс, включая inspector setup. Подробные границы — docs/VERIFICATION.md. Native Windows и чистые VM не запускались.

Короткая пользовательская проверка: полностью выйти из работающего Web Pilot и открыть постоянный app/алиас; несколько раз переключить сессии и проверить собственный план/NONE; затем создать Chat/Work или явно обновить контекст и проверить доставку после готовности. Рабочий профиль и чаты сохраняются, приложение не перезапускалось автоматически.

Scope 029 / T010: после выпуска все изменения находятся в main, лишние зарегистрированные worktrees и временная ветка удалены. Их уникальные отчёты/черновики и Git refs сохранены в .harness/runtime/cleanup-029/. В основном репозитории остаётся одно рабочее дерево и одна локальная ветка main; выпуск не архивирует план сессии.

## Выпуск 0.6.30 — понятное название плана следующей сессии

17.09.2026 выпущен Project Web Pilot 0.6.30. Изменение пользовательского интерфейса одно: блок будущего подготовленного плана теперь называется «План следующей сессии» вместо «Подготовлено здесь»; механика plan:prepare/plan:bind, выбор Chat/Work и связи между сессиями не менялись. Sidebar regression, полный Node suite и Electron smoke прошли.

`npm run build` успешно собрал macOS arm64 и Windows x64. Постоянный `Project Web Pilot.app` обновлён штатным release facade с сохранением device `16777232` / inode `398344301`; резервная копия прежнего Contents — `.harness/runtime/release-backups/mac-0zA7Wi`. Все 33 файла `src` и 31 файл `resources` побайтово совпали с macOS package, Windows package и установленным app; Windows verifier подтвердил PE, portable Node 22.17.0, runtime SHA и наличие Workflow Kit.

- `Project-Web-Pilot-0.6.30-macOS-arm64.zip`: SHA-256 `1247fec6f7e8ad21040805ce64e5703b318dcdba95771dcc22166be7a6158f4f`, 145219230 bytes.
- `Project-Web-Pilot-0.6.30-Windows-x64.zip`: SHA-256 `8ea8469720524105fe23c55c37125c0d48203b42a2bc8fca561b771e4027a33e`, 315991998 bytes.

Оба ZIP прошли integrity и app.asar verification; копии и `SHA256SUMS.txt` находятся в `~/Downloads/WebPilot-0.6.30/`. Evidence: `.harness/runtime/releases/0.6.30/{mac-release.json,source-verification.json,release-manifest.json,SHA256SUMS.txt}`. Native Windows и чистые VM этим коротким выпуском не запускались. Для применения в уже открытом Web Pilot нужен полный выход и повторный запуск постоянного app/алиаса.

## Выпуск 0.6.31 — сохранение размеров и позиции интерфейса

17.09.2026 выпущен Project Web Pilot 0.6.31. Главное окно теперь сохраняет и восстанавливает position/size штатным Electron `windowStatePersistence`; ширина сайдбара продолжает сохраняться существующим `settings.json`. Оба состояния находятся в userData вне app bundle, поэтому штатная замена релиза их не удаляет. Полноэкранный/максимизированный display mode не сохраняется.

`npm run build` успешно собрал macOS arm64 и Windows x64. Постоянный macOS app обновлён с сохранением device `16777232` / inode `398344301`; backup прежнего Contents — `.harness/runtime/release-backups/mac-LhYcRR`. Все 33 файла `src` и 31 файл `resources` побайтово совпали с macOS staging, Windows staging и установленным app; Windows verifier подтвердил portable Node/runtime и Workflow Kit.

- `Project-Web-Pilot-0.6.31-macOS-arm64.zip`: SHA-256 `14fa8dd2d4f3941b71bfe482997257a4dd028e5a4100279d0f567fa26f432fe9`, 145219263 bytes.
- `Project-Web-Pilot-0.6.31-Windows-x64.zip`: SHA-256 `00b4a80973718d137bc733df2937858fe12b9dbeba7230a302b00213f34ff5b5`, 315992040 bytes.

Оба ZIP прошли integrity/app.asar verification и скопированы в `~/Downloads/WebPilot-0.6.31/`; `SHA256SUMS.txt` лежит рядом. Evidence: `.harness/runtime/releases/0.6.31/`. Native Windows и чистые VM в этом коротком дополнении не запускались. Уже открытое окно не перезапускалось автоматически.

## Выпуск 0.6.32 — первая итерация сопровождения macOS

17.09.2026 штатный `npm run build:mac` собрал macOS arm64. Новый профиль получает мастер входа/создания аккаунта, подготовки компонентов, подключения файлов и первого проекта. Включён официальный Node.js 22.17.0 arm64; Git устанавливается штатным диалогом Apple по кнопке, Python/MCP — существующим bootstrap. Настройка туннеля сопровождается инструкцией и нативным вводом личных данных. Запуск вне Applications на новом профиле предлагает штатное перемещение приложения.

Постоянный app имеет версию 0.6.32 и сохранил device `16777232` / inode `398344301`; backup Contents — `.harness/runtime/release-backups/mac-Wo08g7`. Все 35 файлов src, 32 файла resources и четыре файла mac-tools сверены с готовой поставкой. app.asar установленного app, staging и ZIP совпадает: `d06b59da4f702e0583e2f962c64aac272b1e693aef8010a2ca04dc315b02fac2`. Проверены ZIP integrity, встроенная версия Node и соответствие копии в Downloads.

`Project-Web-Pilot-0.6.32-macOS-arm64.zip`: 181068519 байт, SHA-256 `2e0d816182e60ecba94088cbb7f0bda5415f079a9269045653b58cc229528d8a`. Копия, `SHA256SUMS.txt` и короткий `INSTALL.txt` находятся в `~/Downloads/WebPilot-0.6.32/`. Evidence: `.harness/runtime/releases/0.6.32/{mac-release.json,source-verification.json,SHA256SUMS.txt,startup-account.png,startup-components.png}`.

Это macOS-итерация для повторного ручного испытания на свежем клоне, а не подтверждение чистого полного запуска. Причина пустой веб-панели прежнего запуска пока не установлена. Windows 0.6.32 не собиралась; последний Windows ZIP остаётся 0.6.31. Основное работающее приложение и runtime не перезапускались.

## Выпуск 0.6.33 — ранняя диагностика первой загрузки

Обе платформы собраны штатным npm run build. Постоянный macOS app обновлён с сохранением device 16777232 / inode 398344301; резервная копия Contents — .harness/runtime/release-backups/mac-p6IC2n. Работающий Web Pilot не перезапускался. Ранняя диагностика входит в обе поставки; macOS-мастер получил корректные подсказки и копирование отчёта, Windows-мастер остаётся отдельной задачей.

- macOS arm64: Project-Web-Pilot-0.6.33-macOS-arm64.zip, 181070160 байт, SHA-256 7de3f296b58bb3109ec241344569eae690b67ebbf9585cde7492132232b10e1a.
- Windows x64: Project-Web-Pilot-0.6.33-Windows-x64.zip, 317787260 байт, SHA-256 7349ac662782aada96a420397f6bff34f9b8a82fa041ef6be9de6a598775dded.

ZIP проверены и скопированы в ~/Downloads/WebPilot-0.6.33/ вместе с SHA256SUMS.txt и INSTALL.txt. Все 35 файлов src и 32 файла resources совпали с source в обеих поставках и постоянном app; app.asar установленного Mac, staging и ZIP совпадает. Проверены четыре bundled mac-tools и исполнение Node v22.17.0 arm64. Windows verifier подтвердил PE, portable Node и runtime SHA; нативного Windows-запуска не было.

Evidence — .harness/runtime/releases/0.6.33/{mac-release.json,source-verification.json,release-manifest.json}. Этот выпуск устраняет доказанный диагностический пробел, но причина пустой панели гостя остаётся неизвестной. Проверка в госте и весь чистый путь ещё впереди.

## Выпуск 0.6.34 — ограниченное первое открытие

Обе платформы собраны штатным npm run build. В пустой панели без проекта первый документ получает до 15 секунд; при отсутствии документа соединение восстанавливается один раз, не дольше 5 секунд, затем запрос получает ещё до 15 секунд. Готовый DOM позволяет macOS-мастеру проверить вход, пока дополнительные ресурсы продолжают загружаться. Существующие проекты сохраняют прежние проверки навигации и доставки; cookies и настройки не удаляются.

Постоянный macOS app обновлён до 0.6.34 с сохранением device 16777232 / inode 398344301. Работающий процесс и рабочий runtime не перезапускались.

- macOS arm64: Project-Web-Pilot-0.6.34-macOS-arm64.zip, 181071249 байт, SHA-256 57467253485aafc67165bc8844febabf3280f6b974afbc76d7f39d9a6f846933.
- Windows x64: Project-Web-Pilot-0.6.34-Windows-x64.zip, 317788339 байт, SHA-256 be7688a5a4982f121f8cc231f0a4570a51e0c26096e44efa692f12b6da5199f4.

Все 36 файлов src и 32 файла resources побайтово совпали с source в обеих поставках и установленном app. app.asar установленного Mac, staging и ZIP совпадает; проверены целостность обоих ZIP, четыре mac-tools и запуск встроенного Node v22.17.0 arm64. Windows verifier подтвердил portable Node/runtime и структуру EXE-поставки. Архивы, SHA256SUMS.txt и INSTALL.txt находятся в ~/Downloads/WebPilot-0.6.34/.

Evidence: .harness/runtime/releases/0.6.34/{mac-release.json,source-verification.json,release-manifest.json,browser-recovery-native.log}. Локальный native Electron fixture подтвердил один recovery, чтение DOM при незавершённом изображении и сохранение cookie. Повтор в Test macOS 01 ещё не выполнен; причина сети гостя не установлена, MAC-002 остаётся открытым. Нативный Windows-запуск и Windows-мастер не объявлены проверенными.

## Выпуск 0.6.35 — непрерывный первый запрос / B004

Собраны macOS arm64 и Windows x64. Один автоматический первый запрос ожидает до 120 секунд без отмены на 15-й секунде; повтор во время ожидания заблокирован. Отчёт сохраняет начало сессии и очищенные сетевые этапы. Это диагностическая итерация: причина задержки в Test macOS 01 ещё не установлена.

Постоянный macOS app обновлён штатным release facade с сохранением device 16777232 / inode 398344301. Все 37 файлов src и 32 файлов resources совпадают в source, macOS staging, Windows staging и установленном app; сверены 4 файла mac-tools, Node v22.17.0 arm64 и отсутствие вложенного старого app. Оба ZIP проверены, app.asar совпадают с staging, контрольные суммы копий в Downloads совпадают.

- Project-Web-Pilot-0.6.35-macOS-arm64.zip: 181073878 bytes; SHA-256 5b03ec3b236009d8b010d638098223889f585733fd99ed002e00e67bb4cb1acd.
- Project-Web-Pilot-0.6.35-Windows-x64.zip: 317790975 bytes; SHA-256 75d2d4daadfbda5417268b181e11f64753af27edd49d868e43a76f679ea1136c.

Пакеты, SHA256SUMS.txt и INSTALL.txt: ~/Downloads/WebPilot-0.6.35/. Evidence: .harness/runtime/releases/0.6.35/{mac-release.json,source-verification.json,release-manifest.json,SHA256SUMS.txt}. Рабочий процесс Web Pilot, профили и runtime не перезапускались. Нативная Windows и результат гостевой проверки 0.6.35 не подтверждены. Следующая задача T016 сохраняет полный чистый путь, финальная DOCS остаётся последней.

## Выпуск 0.6.36 — показ установщика Apple / B005

Штатный npm run build собрал macOS arm64 и Windows x64. Постоянный корневой Project Web Pilot.app обновлён с сохранением device 16777232 / inode 398344301; версия Info.plist и app.asar — 0.6.36. Все 37 файлов src и 32 файла resources побайтово совпали с обеими поставками и установленным app; 4 файла mac-tools также совпали. ZIP прошли integrity, app.asar и проверку SHA-256 после копирования в ~/Downloads/WebPilot-0.6.36/. Windows package verifier подтвердил состав runtime; native Windows не запускалась.

- Project-Web-Pilot-0.6.36-macOS-arm64.zip: 181074205 bytes; SHA-256 c5ee9d318961f4954282c801d6bdd3b33bea693fb1859a98581833e288d46558.
- Project-Web-Pilot-0.6.36-Windows-x64.zip: 316322177 bytes; SHA-256 733c28af4853e3bf8b7a2259cd84d3e5ceec31ef9cc511fbb9941f4a0d2c835e.

Изменения: после запроса установки Apple активируется штатное окно через open; ошибки запуска и показа различимы. Ранее подготовленная C009 добавляет прямой /auth/login для открытия без выбранного проекта. Сетевой дефект не объявляется устранённым: новый исходный клон 0.6.35 работал без изменения маршрута, тогда как прежний давал таймауты. Рабочий процесс и профиль основного Mac не перезапускались. Видимость системного окна и полный путь в госте ожидают T017. Evidence: .harness/runtime/installer-focus-{build,verify}-036.log, releases/0.6.36/{mac-release.json,source-verification.json,release-manifest.json,SHA256SUMS.txt}.

## Выпуск 0.6.37 — восстановление подготовки runtime

Выпущены macOS arm64 и Windows x64. Включены C010 (показ установщика Apple), C011 (точный известный комплектный control.py, facade после первой установки и восстановление собственной папки) и C012 (понятные ожидания/ошибки без обещания нескольких минут). Прямой вход C009 сохранён. Windows-мастер и гостевой полный путь этим выпуском не объявляются проверенными.

Постоянный корневой app обновлён с сохранением device 16777232 / inode 398344301. Версия Info.plist/ASAR — 0.6.37; ASAR установленного app равен staging. Все 37 исходных и 32 ресурсных файлов совпали в обеих поставках и установленном app; 4 Mac tools сверены. Вложенного старого app нет; Windows verifier пройден. ZIP integrity, содержимое ASAR и SHA доставки проверены.

- Project-Web-Pilot-0.6.37-macOS-arm64.zip: 181075090 bytes; SHA-256 b8be44db63dce0ee17e8e2f444c94add5a8772ba59c57b47caeb408bbe83d967; ASAR 2b977c2f5073ce9b093ae7ec599a88834b5cd53613914d2d5317e364621635f5.
- Project-Web-Pilot-0.6.37-Windows-x64.zip: 316323066 bytes; SHA-256 37d725c782895af44bde82d86df169231dd43ffe5a341d730b6ad3745cfd781c; ASAR 003c8512e9378819d409a7cdb6bc49e520f03e120369af76e6aa55cf6c4a0a45.

ZIP, INSTALL.txt и SHA256SUMS.txt находятся в ~/Downloads/WebPilot-0.6.37/. Evidence — .harness/runtime/releases/0.6.37/{mac-release.json,source-verification.json,release-manifest.json}. Изолированная установка из реального ZIP прошла за 33.671 с; ранее упавшая установка восстановлена без переустановки и изменения bridge_config. Результат в госте ожидает T017. Рабочий процесс и профиль основного Mac не перезапускались.

## Выпуск 0.6.38 — ввод туннеля и готовность Apple

18.09.2026 обе платформы собраны штатным `npm run build`. Русские тексты
системных окон больше не превращаются в неподдерживаемые AppleScript escapes;
ошибка окна отделена от отмены и ошибки данных. Принятый запрос установки Apple
запускает фоновую проверку Git; повторная установка скрыта, после готовности
остаётся явное «Проверить и продолжить».

Постоянный macOS app обновлён до 0.6.38; inode 398344301 сохранён. Текущий device
16777230 проверен в операции обновления; старый receipt 0.6.37 содержит прежний
номер device 16777232, который не используется как постоянный идентификатор
между монтированиями. Backup Contents: `.harness/runtime/release-backups/mac-5FGCxT`.
Совпали все 37 src, 32 resources и четыре mac-tools; установленный app.asar
совпадает со staging и Mac ZIP. Оба ZIP проверены и скопированы в
`~/Downloads/WebPilot-0.6.38/` вместе с SHA256SUMS.txt и INSTALL.txt.

- macOS arm64: 181076010 байт; SHA-256 `f74b0c7885e8890391bd3e2ee2d2856aabad3e29784040d1d6911b02741e40da`.
- Windows x64: 316323993 байт; SHA-256 `039eac9640a4e862aed236f9d44d61ae870ce8ed337bb6182fbbad18dbf00e05`.

Evidence: `.harness/runtime/releases/0.6.38/`. Оба точных выражения диалогов из
поставки прошли osacompile. Визуальное открытие через Computer Use на хосте не
подтверждено: отдельный osascript не адресуется, редактор остался в Running без
доступного окна; тест остановлен. Личные данные не вводились. Новый чистый клон,
весь путь до файла проекта и native Windows пока не проверены.

## Выпуск 0.6.39 — автоматические шаги и первый проект

18.09.2026 собраны macOS arm64 и Windows x64. Постоянный корневой app обновлён штатным build:mac с сохранением inode 398344301; Info.plist и package.json внутри app.asar подтверждают 0.6.39. Установленный app.asar совпадает со staging и ZIP. Все 38 файлов src и 32 файлов resources побайтово совпадают с source в обеих поставках; 4 файла mac-tools совпадают в staging и установленном app. Вложенного прежнего app нет.

- Project-Web-Pilot-0.6.39-macOS-arm64.zip: SHA-256 08cf81adc2f6981de4cfdd26e9aca0e2c2d4d599dd7252ad9f120f52d03be8ac; 181078830 bytes.
- Project-Web-Pilot-0.6.39-Windows-x64.zip: SHA-256 780b5cdefbbf12145f0cf3d85f79741c756646a73b40c514a85dfdb85e5149f3; 316326784 bytes.

Оба ZIP прошли integrity и проверку app.asar. Копии с SHA256SUMS.txt и INSTALL.txt находятся в ~/Downloads/WebPilot-0.6.39/. Evidence — .harness/runtime/releases/0.6.39/{mac-release.json,source-verification.json,release-manifest.json}. Сборка не перезапускала рабочее приложение и не меняла профиль/ключи.

В 0.6.39 macOS-мастер автоматически распознаёт новый скопированный ID, затем ключ; завершённые шаги скрываются. Plugins — помощь по необходимости. Chat/Work применяют preview сразу, healthy preview не показывает Doctor/Recheck, NONE не дублируется. 0.6.38 принята пользователем на абсолютно чистой macOS; новый реальный проход 0.6.39 и native Windows пока не подтверждены. На Windows общие изменения UI упакованы, но платформенный мастер и его автоматический tunnel flow не заявляются проверенными.

## Выпуск 0.6.40 — сохранённое расположение проектов

После принятой пользователем 0.6.39 изменено только создание нового проекта.
При первом выборе папка не задана: доступно «Выбрать расположение папки для проектов».
После выбора появляется имя. Расположение сохраняется в локальных настройках для
следующих проектов и перезапусков; кнопка «Изменить расположение папки для проектов»
заменяет его. Отмена сохраняет прежний выбор; уже существующие проекты не перемещаются.

Собраны macOS arm64 и Windows x64. Постоянный корневой app обновлён до 0.6.40;
Info.plist и app.asar подтверждают версию. Filesystem identity сохранена:
{'device': 16777230, 'inode': 398344301}. app.asar установленного app, staging и ZIP совпадает.
Все 38 файлов src и 32 файлов resources совпадают с исходниками в обеих поставках и установленном app; сверены 4 файла mac-tools. Вложенного прежнего app нет.

- Project-Web-Pilot-0.6.40-macOS-arm64.zip: 181079130 bytes, SHA-256 `6e2744190ef63bada5705545d60e9cc55f7783c13d9e53d76cfa95b88cf09589`.
- Project-Web-Pilot-0.6.40-Windows-x64.zip: 316327092 bytes, SHA-256 `c2961ca920281188795f10db2c7cb8f134229ffd68bf2885c9040f23816d728e`.

Оба ZIP проверены и скопированы в ~/Downloads/WebPilot-0.6.40/ вместе с SHA256SUMS.txt
и INSTALL.txt. Evidence: .harness/runtime/releases/0.6.40/{mac-release.json,
source-verification.json,release-manifest.json}. Работающее приложение не
перезапускалось; для применения требуется полный выход и новый запуск.
Пользовательская проверка этого изменения и нативный Windows-запуск ещё предстоят.

## Сверка при закрытии плана 031 — 18.09.2026

Повторно вычислены SHA-256 обоих ZIP 0.6.40 в каталоге выпуска и в ~/Downloads/WebPilot-0.6.40/: все четыре файла совпадают с приведёнными выше контрольными суммами и размерами. Info.plist постоянного app подтверждает 0.6.40; SHA-256 его app.asar — 29d4b3a683029090412e16307bcda15d15e2e51c88285341122babb6e34b64b1, совпадает с проверенной поставкой.

С release commit 978e6613e6ff4285083911a6d137cb12d37660cb функциональные src/resources/scripts/tests и package.json/package-lock.json не изменились. Выполняются документальное закрытие и синхронизация исходников с GitHub; новый номер и повторная сборка приложения не требуются. ZIP остаются отдельной локальной поставкой; git push не является публикацией бинарных GitHub Releases.

## Текущая точка выдачи

Историческая сверка поставки 0.6.40; актуальная парная поставка 0.6.41 описана ниже. Более ранние версионные разделы сохраняют состояние на момент соответствующего выпуска; ожидавшиеся тогда проверки не заменяют текущий итог в docs/CLEAN_INSTALL.md.

## Парный выпуск — поручение 18.09.2026 / scope 033

Начиная с 0.6.41 единый npm run build должен последовательно собрать обе платформы, проверить общий номер версии и соответствие исходникам, обновить постоянный macOS app и подготовить оба ZIP с SHA256SUMS.txt и INSTALL.txt в ~/Downloads/WebPilot-<version>/. Если одна платформа не собрана или не прошла проверку, полный комплект не объявляется готовым. Платформенные build:mac/build:win остаются узкими операциями; публичный результат задачи — парный комплект.

Парный publisher реализован: `npm run build` собирает обе платформы 0.6.41;
состав и версия сверяются до общего manifest. Промежуточный macOS ZIP от
build:mac ещё не означает готовность пары. Итог: два ZIP, SHA256SUMS.txt,
INSTALL.txt и release-manifest.json в ~/Downloads/WebPilot-<version>/.

R002 завершён: единый парный выпуск 0.6.41 создан командой `npm run build`.
Оба ZIP доставлены в ~/Downloads/WebPilot-0.6.41/ и сверены. Windows включает
native first-run worker, общий мастер и комплектный Git; macOS app обновлён
по постоянному пути с сохранением identity. Общий manifest фиксирует отсутствие
native Windows/clean VM приёмки; пользователь выполняет её самостоятельно.

## Выпуск 0.6.41 — Windows onboarding и единая сборка

18.09.2026 выпущена **0.6.41** для macOS arm64 и Windows x64 одной командой `npm run build`; ZIP находятся в ~/Downloads/WebPilot-0.6.41/. Windows теперь получает общий мастер первого запуска: комплектные Python/Git/MCP, туннель, инструкция Codex Local Windows MCP в ChatGPT и первый проект. Секреты сохраняются в существующем защищённом хранилище Windows; ручной ввод использует системный диалог. macOS сохраняет прежний путь, номер синхронизирован. Выбор расположения проектов из 0.6.40 сохранён. Исходники и упаковки сверены; реальный запуск, подключение и все проверки в гостевых системах пользователь проводит сам. Computer Use и запуск VM агентом прекращены по его прямому поручению.

- Project-Web-Pilot-0.6.41-macOS-arm64.zip: 181060637 bytes; SHA-256 `3fe1c59871c420eac939b2ca23998f8e5c66842434dbf7fe22c51f8231dedc00`.
- Project-Web-Pilot-0.6.41-Windows-x64.zip: 316332963 bytes; SHA-256 `8830efbfe1fe339f724709a0a1e4c3818fa0df0a2dd794b01d83d31429e597ac`.

Общая команда `npm run build` завершилась успешно. Оба ZIP проверены на целостность; app.asar внутри архивов совпадает со staging; все src/resources сверены с исходниками. Постоянный корневой Mac app имеет версию 0.6.41 и прежнюю filesystem identity: device 16777234, inode 398344301. Копии в Downloads сверены по SHA-256. Evidence: `.harness/runtime/releases/0.6.41/release-manifest.json`; общий журнал `.harness/runtime/033-build.log`.

Запуск новой готовой сборки на пользовательских Mac/Windows и подключение аккаунта не выполнялись агентом по последнему поручению. Packaged source verification не считается приёмкой. Ранее начатый локальный изолированный Electron fixture завершился успешно; это не Windows guest test.

## Парный выпуск 0.6.42 — 19.09.2026

Общий мастер Mac/Windows исправлен: последовательные шаги ID туннеля и API key,
видимая кнопка API keys, инструкция создания/копирования/вставки ключа. ID принимается
отдельно; ручной путь больше не запрашивает оба значения двумя окнами подряд.
C002 suite и Electron TEST FIXTURE smoke прошли. Пакетные версии подняты совместно;
фактические архивы и контрольные суммы после npm run build приведены ниже.

- Project-Web-Pilot-0.6.42-macOS-arm64.zip: 181061334 bytes; SHA-256 `feb5ab274b55c920b2742e6c025254fd00cec85187ba196040f785f8bb9cb2e9`.
- Project-Web-Pilot-0.6.42-Windows-x64.zip: 316333671 bytes; SHA-256 `91308bae3a9f76db1f33cff21df1443db5faaea415362bd01b6b9eea8c645796`.

Каталог выдачи: `~/Downloads/WebPilot-0.6.42/`. Manifest: `.harness/runtime/releases/0.6.42/release-manifest.json`. Лог сборки: `.harness/runtime/033-build-042.log`.

Source commit `e93db24548b824900a7523e192f4e3e8f2dddd79`; 74 файлов зафиксированы, src/resources и runtime manifest совпадают в обеих упаковках. ZIP integrity и asar внутри архивов проверены, SHA копий в Downloads совпадают. Постоянный app версии 0.6.42 совпадает со staging; сохранена identity: device 16777232, inode 398344301. Native Windows и чистые VM не запускались, новый реальный проход выполняет пользователь.

## Парный выпуск 0.6.43 — системный ввод ID

Кнопка «Вставить ID туннеля» открывает отдельное системное поле на Mac и Windows.
Пустой/недоступный буфер не вызывает предварительную ошибку; отмена не меняет
настройки, подтверждение открывает инструкцию API key. Полные suite и Electron
fixture прошли; версия обеих платформ и packager синхронизирована на 0.6.43.

- Project-Web-Pilot-0.6.43-macOS-arm64.zip: 181062445 bytes; SHA-256 `e7eda01af7ca83b72fed55cf9d1dd8f5108cc50ff5d05d2389bbe7c2aaccf368`.
- Project-Web-Pilot-0.6.43-Windows-x64.zip: 316334779 bytes; SHA-256 `7b3c0e12a509ee2cca688e33460ae5768a0eeb0b76410f39f83250cfda08f66c`.

Единая сборка npm run build завершена. Каталог: `~/Downloads/WebPilot-0.6.43/`; manifest: `.harness/runtime/releases/0.6.43/release-manifest.json`; журнал: `.harness/runtime/033-build-043.log`. Source commit `3981d61b1ac3aebfcb50eeb247f8e81c069a6f59`, 74 файлов snapshot; исходники/resources обеих платформ, версии, ZIP integrity, app.asar архивов и хеши копий сверены. Постоянный Mac app 0.6.43 совпадает со staging, identity сохранена: device 16777232, inode 398344301. Native Windows/чистые VM не запускались; новый ручной проход выполняет пользователь.

0.6.44 / E004: подготовлены общие package/lock и app-version для обеих платформ,
персональный author пакета удалён. Следующий шаг — штатный парный npm run build.

0.6.44 / E005: npm run build завершён. macOS arm64 и Windows x64 собраны из
cd9569e50dd6347a8b7047480e781d940ca33a75; все 74 файла snapshot совпали с
обеими упаковками и постоянным Mac app. Архивы прошли integrity/ASAR и проверку
копий в Downloads/WebPilot-0.6.44. Версия постоянного app — 0.6.44, inode
398344301 сохранён. Manifest: .harness/runtime/releases/0.6.44/release-manifest.json.

0.6.44 / E006: подготовлена публикация в существующий origin
https://github.com/OleynikAleksandr/Project-Web-Pilot. Доступ подтверждён через
существующую Git-авторизацию; репозиторий публичный. Тег v0.6.44 свободен.
После финальной DOCS выполняются обычный push main/tag, загрузка обоих ZIP,
INSTALL.txt, SHA256SUMS.txt, release-manifest.json в draft, сверка размеров и
серверных SHA-256, затем публикация релиза. Локальные runtime/key/profile и app
bundle не входят в исходный Git push.

## Парный выпуск 0.6.44 — 19.09.2026

Удалены автор/email из создания проекта и персональный author пакета. Мастер
обеих платформ выделяет подключение MCP в ChatGPT перед первым проектом.

- Project-Web-Pilot-0.6.44-macOS-arm64.zip: 181062714 bytes, SHA-256 `0b186bcecb3138be24cda924463dd62bb43c82a137cf8951d3056ddcfdd05db1`.
- Project-Web-Pilot-0.6.44-Windows-x64.zip: 316335016 bytes, SHA-256 `bdc66bd4c8beb4f366c3450d6a120e0d43b81b6dd6f723a97306c564c7484f14`.

Source build commit: `cd9569e50dd6347a8b7047480e781d940ca33a75`. Все 74 файлов snapshot
совпали с обеими поставками и установленным Mac app; ZIP integrity и ASAR
подтверждены. Постоянный app имеет версию 0.6.44 и сохранил device
16777232 / inode 398344301. Архивы, INSTALL.txt, SHA256SUMS.txt и
release-manifest.json находятся в ~/Downloads/WebPilot-0.6.44/. Локальные evidence:
.harness/runtime/releases/0.6.44/.

Пользователь выполняет Windows-проверку сам. В прежнем тестовом чате был доступен
только Mac-коннектор; отдельное подключение Windows не было создано. Работа
Windows-туннеля и запись файла не объявляются подтверждёнными по упаковке.

GitHub: [v0.6.44](https://github.com/OleynikAleksandr/Project-Web-Pilot/releases/tag/v0.6.44). По прямому поручению пользователя публикуются
обычный push main, тег v0.6.44 и оба ZIP с сопроводительными файлами. Тег указывает
на финальный DOCS commit; отличие от source build commit — только документы и
план. Публикация выполняется после DOCS, затем проверяются main, tag и assets.

## Парный выпуск 0.6.45 — 19.09.2026

В общем мастере Mac/Windows добавлен видимый блок режимов Permissions. Отдельный
шаг создания MCP в ChatGPT присутствует на обеих платформах, включая новый Mac.

- Project-Web-Pilot-0.6.45-macOS-arm64.zip: 181063158 bytes; SHA-256 `445dd534e7f3c57af0d5c8c2f5dd79afe80c671d9b67aa741e644cb479ef1fdd`.
- Project-Web-Pilot-0.6.45-Windows-x64.zip: 316335461 bytes; SHA-256 `2cea4843ecf24e5154ea27c05326ec0eadfd286f995ca66ee6392949117bfb1e`.

Source build commit: `3f77599e5281b60e0e34fbb104785e83bebf52f5`. Все 74 файла snapshot
сверены с обоими пакетами и установленным Mac app. Проверены ZIP integrity, ASAR
и копии в ~/Downloads/WebPilot-0.6.45/. Постоянный Mac app имеет версию 0.6.45;
device 16777232 / inode 398344301 сохранены. Evidence:
.harness/runtime/releases/0.6.45/release-manifest.json.

Пользователь считает план завершённым. Скриншот 09.53.24 показывает Windows MCP
в настройках аккаунта. Проверки сборки не подменяют отдельное испытание записи
файла в Windows; агент VM не запускал и Computer Use не использовал.

Публикация: [v0.6.45](https://github.com/OleynikAleksandr/Project-Web-Pilot/releases/tag/v0.6.45).
По прямому поручению пользователя main, тег и оба ZIP публикуются после DOCS.
Тег указывает на финальный DOCS commit; отличие от source build commit — только
документы и план. После загрузки проверяются серверные SHA-256 и набор assets.

## Парный выпуск 0.6.46 — chat-layout-regression-034 / 19.09.2026

Исправление `e1760c49166cf906eb0cb3db7b6aab39830540e5` адаптирует скрытие tool calls:
tool-only message/turn boundary исключается из layout целиком, а mixed assistant/user
message сохраняет содержательный корень. Версия package/lock и обеих платформ — 0.6.46.

- Project-Web-Pilot-0.6.46-macOS-arm64.zip: 181063171 bytes; SHA-256 `7d511780464ac809adef2e0d6a47a58c78ceeb12e7c445804e615bd3bba3c41a`.
- Project-Web-Pilot-0.6.46-Windows-x64.zip: 316335471 bytes; SHA-256 `a2e5a544b1345a5b178329a11f691f6f905ed7471d646502e9cff47584c00c96`.

Source build commit: `ba9819ab5b241a979afcd543671d2c2fb09252f0`; 74 source files сверены
с обеими упаковками (`packagedSourceMatches=true`). ZIP integrity и ASAR внутри
архивов проверены. Постоянный Mac app обновлён до 0.6.46 и сохранил device
16777232 / inode 398344301. Manifest: `.harness/runtime/releases/0.6.46/release-manifest.json`;
копии для передачи: `~/Downloads/WebPilot-0.6.46/`.

Native Windows и clean VM для 0.6.46 не запускались; изменение проверено автоматическими
fixtures, а реальный текущий DOM ChatGPT остаётся пользовательской приёмкой. GitHub
Release 0.6.46 не создавался: публикация требует отдельного поручения пользователя.


## Парный выпуск 0.6.47 — выбор macOS MCP runtime / 19.09.2026

В macOS Settings действует взаимоисключающий выбор **Codex Local Mac / Codex App Server Local Mac**. Исправленная 0.6.47 оставляет в ChatGPT один стабильный Secure MCP Tunnel/connector: старый `com.oleynik.CodexLocalMac` LaunchAgent disabled в обоих modes, выбранный backend запускается MCP-only, а `com.oleynik.WebPilotCodexExecutor` retarget-ит один private tunnel на фактический loopback MCP endpoint. Mode сохраняется и после переключения приложение relaunch-ится. Если stable private tunnel ещё не создан, его ID/key локально импортируются из существующего Codex Local Mac private state без публикации секрета.

Codex App Server MCP теперь является физическим extra-resource релиза: `Contents/Resources/codex-app-server-mcp` на macOS и `resources/codex-app-server-mcp` на Windows. Release verifier сравнивает четыре файла resource с source SHA-256 в staging, установленном Mac app и непосредственно внутри обоих ZIP. Внутрь ASAR этот каталог не дублируется.

Проверки перед сборкой:
- полный Node suite: **325 tests / 323 passed / 0 failed / 2 Windows-only skipped**;
- Electron isolated fixture: exit 0, полный smoke result получен;
- release regression: 7/7 passed.

`npm run build` завершён успешно; 79 source files сверены с обеими упаковками и постоянным Mac app (`packagedSourceMatches=true`).

- Project-Web-Pilot-0.6.47-macOS-arm64.zip: 181097186 bytes; SHA-256 `c82554c36d553ef92a03649ddcd5ccc82315c34e935dc7d23673f674e7b660e6`.
- Project-Web-Pilot-0.6.47-Windows-x64.zip: 316367350 bytes; SHA-256 `8fcdd36743ef91e3eb89951f4267eebd3d22fb10f6fb4149100f0cf489ffcce4`.

Source build commit в manifest: `acde362fc75645dff20f2e494604d9b2b5289403` (stable-connector T001). Постоянный `Project Web Pilot.app` имеет версию 0.6.47 и сохранил identity: device 16777234 / inode 398344301. macOS ASAR SHA-256: `b72c7adea0aec363d0fd51f152b388bf77a40aeb30bb318a18116e7b9d3f1b32`; Windows ASAR SHA-256: `7435d127206a8e2b54f65c5872e7d9bbee04ccf353027fff51e25064d5d13e3b`. Предварительная 0.6.47 сохранена локально только как backup `.harness/runtime/release-backups/paired-0.6.47-pre-stable`; текущая delivery полностью заменена исправленной сборкой.

Каталог выдачи: `~/Downloads/WebPilot-0.6.47/`. Manifest: `.harness/runtime/releases/0.6.47/release-manifest.json`. GitHub Release 0.6.47 не публикуется без отдельного поручения пользователя. Native Windows и clean VM для 0.6.47 не запускались; Windows package verification выполнен на macOS build host.

## Локальный парный выпуск 0.6.48 — 25.09.2026

Окончательная `npm run build` завершилась успешно после исправления переходного
URL в живой проверке. Source commit: `377d5c42377c590ffa6a3eb7035d80cf32553b2c`.
Сверены 81 исходный файл, обе упаковки и установленный корневой Mac app;
версия app — 0.6.48, filesystem identity сохранена (device 16777234,
inode 406420885). ZIP прошли проверку целостности; ASAR и комплектный executor
соответствуют staging. Предварительная внутренняя сборка до H005 убрана
из поставки в локальный backup и не является финальным релизом.

Поставка: `~/Downloads/WebPilot-0.6.48/` — два ZIP, `INSTALL.txt`,
`SHA256SUMS.txt`, `release-manifest.json`.

| Платформа | Размер, байт | SHA-256 ZIP |
| --- | ---: | --- |
| macOS arm64 | 181155569 | `8dba85eebb9e3ee3de9807a617e0ab341015f7c3711532deb64c57486458d0f3` |
| Windows x64 | 316423743 | `05bee11b5cbf0a9d4d27a9d36ec1620949cdf1f09e08b9ac5eba287e86b6a6d5` |

Изменения: общий адаптер нового ChatGPT DOM, Chat/Work и переходные URL,
структурный фильтр служебных карточек, цвета новых сообщений, стабильная
автопрокрутка, полный номер в sidebar, завершение UI без остановки MCP/tunnel,
постоянный Windows autostart при входе пользователя. Результаты живых проверок
и границы Windows/login описаны в VERIFICATION.md. Публикация на GitHub в этом
поручении не выполнялась. Постоянный путь запуска — корневой
`Project Web Pilot.app`; отдельные физические копии, например на Desktop,
этой сборкой не обновляются.

## Локальный парный выпуск 0.6.49 — 25.09.2026

`npm run build` завершилась успешно. Source commit: `6adbb3c5c02fca46f5f66de42c151f647b67ff8a`.
Сверены 82 исходных файлов, ASAR и executor обеих упаковок;
ZIP проверены на целостность. Постоянный корневой Mac app обновлён до 0.6.49
с сохранением filesystem identity. Поставка: `~/Downloads/WebPilot-0.6.49/`.
Workflow Kit остаётся 1.4.1; изменения относятся к отображению плана и цвету поля.

| Платформа | Размер, байт | SHA-256 ZIP |
| --- | ---: | --- |
| macOS arm64 | 181156165 | `75b7874b3ff2d331e93c4c3e71251fe1ffa4deef91f5af2bd604a348d69a21de` |
| Windows x64 | 316424342 | `f1b129014701b73f103dea6f0749c890b99d85c10b5b07e8da463519520fdde4` |

Проверки и ограничения — VERIFICATION.md. Native Windows и reboot не запускались.
Публикация GitHub не выполнялась. Запускать корневой app после полного выхода
из прежней версии; отдельная физическая Desktop-копия не обновляется.

## Локальный парный выпуск 0.6.50 — 25.09.2026

`npm run build` завершилась успешно. Source commit: `e6a71a6256f7e3936738be793d16122cb3df2b9d`.
Сверены 82 исходных файла, обе упаковки, ZIP integrity и постоянный
корневой Mac app. Поставка: `~/Downloads/WebPilot-0.6.50/`.

| Платформа | Размер, байт | SHA-256 ZIP |
| --- | ---: | --- |
| macOS arm64 | 181156262 | `94bc7485f8ed3af81a3770639d1bc7f2ea999865d3b422f41db83a6a7a2ef050` |
| Windows x64 | 316424444 | `7c8d323c4bf9a64c3cc7d9b418926102e9459962924c8d6bfc8e9420cdbf1281` |

Также штатным installMacBundle обновлена фактически используемая копия
`/Applications/Project Web Pilot.app` до 0.6.50 с сохранением identity
(inode 406538347), сверкой bundle и резервной копией прежнего Contents.
Живые Chat/Work изображения просмотрены до сборки, packaged source совпадает.
Kit 1.4.1. Native Windows не запускалась, GitHub не публиковался.

## Локальный парный выпуск 0.6.51 — 25.09.2026

`npm run build` прошла, source commit `efaae0bfcf49c836b3eac8d289e15ada57057711`.
Оба пакета сверены с исходниками, ZIP integrity и ASAR подтверждены.
Корневой app и /Applications/Project Web Pilot.app обновлены с сохранением
identity; предыдущий Contents установленной копии сохранён в backup.
Поставка: `~/Downloads/WebPilot-0.6.51/`. Kit 1.4.1, GitHub не публиковался.

| Платформа | Размер, байт | SHA-256 ZIP |
| --- | ---: | --- |
| macOS arm64 | 181156393 | `e577a2b0fe333b0c3589038fd081b917d9cf936cecf1a93782e0b67ac4eb2726` |
| Windows x64 | 316424573 | `c6ca825b3e07de3154548e6d07f60e0bb8c57307078f3995e24376e7fa2b9a87` |

## Локальный парный выпуск 0.6.52 — 25.09.2026

Поставляемый Workflow Kit обновлён до **1.4.11** (новые и подключаемые проекты); собственный Kit репозитория — 1.4.1. `npm run build` прошла на Mac, source commit `55b3b5cebe241d577d4c1dd755b1ee4504696c8e`, 94 исходных файла совпали с упакованными. ZIP integrity и ASAR подтверждены. Корневой `Project Web Pilot.app` обновлён с сохранением identity (inode 406600483); штатным installMacBundle обновлена и фактически используемая `/Applications/Project Web Pilot.app` (inode 406571340 сохранён, прежний Contents — в `.harness/runtime/release-backups/mac-HQlclI`). Поставка: `~/Downloads/WebPilot-0.6.52/`, `shasum -c SHA256SUMS.txt` — OK. Native Windows не запускалась, GitHub не публиковался.

| Платформа | Размер, байт | SHA-256 ZIP |
| --- | ---: | --- |
| macOS arm64 | 181201009 | `bbe2bb203044f8d48e9983beb9eb24856bd85f0a9a23d70636c6786bb97555e0` |
| Windows x64 | 316463282 | `cb7586160c020dc2dccd2719afc47861c9024692a745f399db208289172ec839` |

ASAR: macOS `07fa66abf30614d04053cc5b257423a5653f78ff77875f936bc324ddf4ff0212`, Windows `21459b07b0ec3eafbd399687356acd11f47b14e4568ff15669c107fad7be7fb0`.

## Локальный парный выпуск 0.6.53 — 25.09.2026

Поставляемый Workflow Kit — **1.4.12** (1.4.11 из CodeAppServer `badcf20` + исправление планов сессий): план, созданный `plan:create --session` из NONE, хранится в `.harness/plans/by-session/<сессия>.md` и теперь виден `listPlans`, сайдбару, готовности проекта, полному контексту и Доктору. Приложение принимает проекты 1.4.11 как обновляемые: уведомление в сайдбаре предлагает «Обновить Workflow Kit» (preview → резервная копия → upgrade). Статус локальных инструментов в уже доставленном чате берётся из фактического состояния runtime (MCP + туннель), а не только из флага сессии. Собственный Kit репозитория по-прежнему 1.4.1.

`npm run build` прошла на Mac 18:04–18:08 UTC, source commit `f8c11a8`, 94 исходных файла совпали с упакованными. Корневой `Project Web Pilot.app` — 0.6.53 (inode 406600483 сохранён); `/Applications/Project Web Pilot.app` обновлена штатным installMacBundle (inode 406571340 сохранён, прежний Contents — в `.harness/runtime/release-backups/mac-K3LhAA`). Поставка: `~/Downloads/WebPilot-0.6.53/`, `shasum -c SHA256SUMS.txt` — OK. Native Windows не запускалась, GitHub не публиковался.

| Платформа | Размер, байт | SHA-256 ZIP |
| --- | ---: | --- |
| macOS arm64 | 181201503 | `d3629f05b263b498297c76ee179731310957b0ef25a560b40dc1ee036116abaa` |
| Windows x64 | 316463768 | `bb09b89a0a5a6669326dbf176a3fe56df2f77d6c78f6c52bb68576e703e0f7b4` |

ASAR: macOS `2de04d7ce060c6e557de38ad1402fe5946a08f8c9587cec8ed2a31492255c523`, Windows `8681534787590d7516e030ada82b8daaa852fc610db2f61482730246a8deb995`.

## Локальный парный выпуск 0.6.54 — 26.09.2026

Таймер работы агента: справа в заголовке карточки «План этой сессии» — `mm:ss · Σ mm:ss`, время текущего (или последнего) задания и сумма за сессию. Замер идёт, пока ChatGPT показывает кнопку Stop; паузы до 5 с — то же задание. Сумма хранится в session store и переживает перезапуск. Поставляемый Workflow Kit — 1.4.12, собственный Kit репозитория — 1.4.1.

`npm run build` прошла на Mac 07:50–07:55 UTC, source commit `0fa62de`, исходные файлы совпали с упакованными. Корневой `Project Web Pilot.app` — 0.6.54 (inode 406600483 сохранён); `/Applications/Project Web Pilot.app` обновлена штатным installMacBundle (inode 406571340 сохранён, прежний Contents — в `.harness/runtime/release-backups/mac-aZY2Vh`). Поставка: `~/Downloads/WebPilot-0.6.54/`, `shasum -c SHA256SUMS.txt` — OK. Native Windows не запускалась, GitHub не публиковался.

| Платформа | Размер, байт | SHA-256 ZIP |
| --- | ---: | --- |
| macOS arm64 | 181203572 | `f0a522f78743f533ebbde895bc8cf497d8b1465b1037f2fb147508e8e401e3fe` |
| Windows x64 | 316465854 | `1b11f152cf5a68f492c446714402192461ae1d1354db9c153b178eeab5613c9e` |

ASAR: macOS `4ea68c0ac2a16691e07fb97a7ba74c60fbf1ce258086ab482434a75c5122dec6`, Windows `13512313090468dfee7ef63eba8e01a1bf141f0be802f5a47e83c617dcc2560d`.

## Локальный парный выпуск 0.6.55 — 26.09.2026

Цвет поля ввода из настроек закрашивает только скруглённую плашку (радиусные края слева и справа): плашка находится по скруглению ближайшего предка поля ввода, прямоугольные обёртки внутри неё прозрачны. Раньше в чатах `/c/…` закрашивался прямоугольный `data-composer-body`.

`npm run build` прошла на Mac 12:24–12:28 UTC, source commit `ca577f2`, исходные файлы совпали с упакованными. Корневой `Project Web Pilot.app` — 0.6.55 (inode 406600483 сохранён); `/Applications/Project Web Pilot.app` обновлена штатным installMacBundle (inode 406571340 сохранён, прежний Contents — в `.harness/runtime/release-backups/mac-DYMCHn`). Поставка: `~/Downloads/WebPilot-0.6.55/`, `shasum -c SHA256SUMS.txt` — OK. Native Windows не запускалась, GitHub не публиковался.

| Платформа | Размер, байт | SHA-256 ZIP |
| --- | ---: | --- |
| macOS arm64 | 181204557 | `a04b4b62668034a97bc198a15fc8180e0525b1df933e1ce6d7d49814221a1b08` |
| Windows x64 | 316466837 | `08a0af2f396c2fa6067200f4837b6ffe7bb9775ed751c9344aad25e5eecd4c36` |

ASAR: macOS `6206d848870ea871138a40cdc008aac1928154c1541b311de42677abfcdf32a5`, Windows `0772fef3a6c784247d30602b33a9003daa1caa61dec872455c3af1708c5d215e`.

## Локальный парный выпуск 0.6.56 — 26.09.2026

Workflow Kit переведён на canonical `@webpilot/workflow-kit@1.4.12`; tracked duplicate удалён, packaged runtime автоматически stage-ится из package. После managed package commit `a581e250f9baf3e79ff688381fc44fe1c8e4e849` парный `npm run build` повторён из уже зафиксированного HEAD: `sourceCommit` в финальном manifest совпадает с этим commit, `packagedSourceMatches: true`. Runtime Kit в обеих поставках: 35 файлов, SHA-256 `5464b2c1528eef1de740af50558bc8db1d39cfa7838f9c032d23650fb4f5f119`.

Корневой `Project Web Pilot.app` обновлён до 0.6.56 с сохранением inode `406600483`. Поставка: `~/Downloads/WebPilot-0.6.56/`; оба ZIP прошли integrity check.

| Платформа | Размер, байт | SHA-256 ZIP | ASAR SHA-256 |
| --- | ---: | --- | --- |
| macOS arm64 | 181302932 | `5bdda7cb444b19dd581bef122812077fed75585d8b5f533be54994fa24ec36bb` | `b135d03e2833f5802852d1f38813f831392f354090d5cd9880cc4333844d0ee7` |
| Windows x64 | 316565254 | `57b5e226ee3db64db653e78379ddb7b25aac7c749dd2e0229b6888e2e268811e` | `5fda451f7bfc3650883457018a5d5dc5cb0932f48d6bc938a5452a8bc70513fd` |

Windows package verifier подтвердил PE, portable Node, Windows runtime и Workflow Kit 1.4.12 / 35 files / expected digest. Native Windows и clean VM в этом выпуске не запускались; это остаётся пользовательской проверкой.

## Локальный парный выпуск 0.6.57 — 27.09.2026

Project Web Pilot обновлён до canonical `@webpilot/workflow-kit@1.4.13`. Workspace Setup и Project Doctor принимают целостную установку 1.4.12 как штатно обновляемую до 1.4.13; prepared-plan recovery до `plan:bind` поддерживается новым Kit. Адресный regression `1.4.12 → 1.4.13` сохраняет canonical session plans и завершает upgrade с чистым Git-деревом.

Финальный парный `npm run build` выполнен из подтверждённого source commit `c0545f53828291a3b652a590aa35852085f10884`; `packagedSourceMatches: true`. Workflow Kit в обеих поставках: 1.4.13, 35 файлов, SHA-256 `da763a50c32583553b6ca06e29c975766ab092890bbf9787bd2a6aca87be44c4`. Корневой app и `/Applications/Project Web Pilot.app` обновлены до 0.6.57 с сохранением inode. Поставка: `~/Downloads/WebPilot-0.6.57/`.

| Платформа | Размер, байт | SHA-256 ZIP | ASAR SHA-256 |
| --- | ---: | --- | --- |
| macOS arm64 | 181323407 | `22db6f3876bcbb2524a50c80fae41601588a7ce27aea21df6bd39cfb7cdd6f96` | `533e2036be402edd3be20d365d13eee99a9a0db62234ecc7de49536154fb1996` |
| Windows x64 | 316585724 | `edeafce525d30f5c7d92c49206873acc02641e979fa447948b28a1a533cc5989` | `395e696d76e1684101782eddcee4c75255dcf513c812d1bc3935284d8a07e02b` |

Оба ZIP прошли integrity check. Windows package verifier подтвердил PE, portable Node, Windows runtime и Workflow Kit 1.4.13. Native Windows и clean VM не запускались.

## Локальный парный выпуск 0.6.58 — 27.09.2026

Главное изменение — переход на **single active plan**: один Git checkout/worktree = один current `.harness/plans/todo-plan.md`. Web Pilot sessions сохраняют chat URL/title/Chat|Work/history, но больше не владеют и не выбирают Workflow Kit plan. Prepared-plan/bind/adopt UI/lifecycle удалены; Workflow Kit 1.5.0 архивирует legacy `by-id` / `by-session` и сохраняет compatibility `--session` как no-op.

Canonical `@webpilot/workflow-kit@1.5.0`: 35 runtime files, SHA-256 `0db567df6f0c8f68f3119a7322b4c1c6d28cd06bf57b267993b792097bbb2c75`. Финальный `npm run build` выполнен из чистого source commit `c135f1a523bdd5dc1c26a5e8ca72327866a093e0`; release manifest: `sourceFiles=95`, `packagedSourceMatches=true`. Поставка: `~/Downloads/WebPilot-0.6.58/`.

| Платформа | Размер, байт | SHA-256 ZIP | ASAR SHA-256 |
| --- | ---: | --- | --- |
| macOS arm64 | 181471570 | `a80df450f37d92dc682ca8b085eeeae2b6024bbd16a01c67c7fb26fcd02dab4f` | `960269dc66032aafdf51ca2f29f1abcd4de851902265b9a115aafcaf3d70f968` |
| Windows x64 | 316733865 | `bd338add3a7d24520ee1fe5722b932580e78118de15ac7f11b48f72200c96f2a` | `d3db825afed890281eec2515c74e32a6040dfedfc879415ebdc8221215b9bfa7` |

Оба ZIP прошли integrity check. Корневой `Project Web Pilot.app` и `/Applications/Project Web Pilot.app` имеют CFBundleShortVersionString 0.6.58 и одинаковый ASAR; inode постоянного root app сохранён: `406600483`. Windows verifier подтвердил `Project Web Pilot.exe` SHA-256 `7662af0bd92befccd9217ca67ecdbf43bd3c16a46de76c31ece373da3269fe50`, portable Node SHA-256 `721ab118a3aac8584348b132767eadf51379e0616f0db802cc1e66d7f0d98f85` и Windows runtime SHA-256 `1f041488ad97d8abf1984fd3521afb8abe15f50b8df3d3e11f1cc4248e019d98`. Native Windows и clean VM не запускались.


## Локальный парный выпуск 0.6.59 — 28.09.2026

Session title стал chat-owned metadata поверх сохранённой single-active plan модели. Auto-name использует `objective`/`nextTaskTitle`, manual rename имеет приоритет, а exact bound conversation получает то же server-side имя в native ChatGPT. Workflow Kit остаётся 1.5.0.

Финальный `npm run build` повторён из чистого source commit `eabeea2359821a34c380a1904f902f18474adfd6`; release manifest: `sourceFiles=96`, `packagedSourceMatches=true`. Поставка: `~/Downloads/WebPilot-0.6.59/`; `shasum -c SHA256SUMS.txt` — OK. Корневой и `/Applications/Project Web Pilot.app` — 0.6.59, одинаковый macOS ASAR `0b532240fe717f3428eff65a12eeae4a769b1e896850c0f25bb0954aa5b6c5b5`; обе app-directory identity сохранены.

| Платформа | Размер, байт | SHA-256 ZIP | ASAR SHA-256 |
| --- | ---: | --- | --- |
| macOS arm64 | 181473642 | `9dd4f0f5ca8e4983d13066f7b578e255eb215a4dae47ea66f1371924f398e0a2` | `0b532240fe717f3428eff65a12eeae4a769b1e896850c0f25bb0954aa5b6c5b5` |
| Windows x64 | 316735943 | `045247f12bda051c77531d00472a0ad80a2e0c354467ca6109c182c3969428ce` | `937a23b034b2a949d4d4a2847857da2c9d56cf6f31075d68be9623bb2f778522` |

Windows package verifier подтвердил executable, portable Node, bundled Windows runtime и Workflow Kit 1.5.0. Native Windows и clean VM не запускались; это остаётся пользовательской проверкой.


## Локальный парный выпуск 0.6.60 — 28.09.2026

Hotfix restart/reopen title reconciliation. Native ChatGPT title сначала читается; PATCH выполняется только при расхождении с local explicit session title, после чего результат подтверждается GET. Post-load и late-bind triggers не теряются, force-reconcile переживает debounce, transient readiness/auth failures получают bounded retry. Workflow Kit остаётся 1.5.0.

Финальный `npm run build` выполнен из source commit `7cf1299a70633bb620f18e8db857ed1d552eb401`; `sourceFiles=96`, `packagedSourceMatches=true`. Поставка: `~/Downloads/WebPilot-0.6.60/`; `shasum -c SHA256SUMS.txt` — OK. Корневой и `/Applications/Project Web Pilot.app` — 0.6.60, одинаковый macOS ASAR `cc2df5380de32c76461cf0e2e90f2e393ae4895808181c6fa7d339198f54b564`.

| Платформа | Размер, байт | SHA-256 ZIP | ASAR SHA-256 |
| --- | ---: | --- | --- |
| macOS arm64 | 181474464 | `66ae4e3a95b5485396ce333d4d88d89ff39b77ca317be663b714710666fe725b` | `cc2df5380de32c76461cf0e2e90f2e393ae4895808181c6fa7d339198f54b564` |
| Windows x64 | 316736763 | `f7a24c6dca6193c929193887a487d9fb26c2967f1d14f685347d6bdabdcd77e8` | `0b578e6e680330890668ac27c7a25964d26c76ea3a6418bf341627aede173d0a` |

Windows package verifier подтвердил executable, portable Node, bundled Windows runtime и Workflow Kit 1.5.0. Native Windows/clean VM не запускались.


## Локальный парный выпуск 0.6.61 — 28.09.2026

Canonical session auto-title теперь берётся из H1 обязательного planning/spec документа; objective используется только как fallback. Все session titles ограничены 80 Unicode-символами и 200 UTF-8 байтами, чтобы local и native ChatGPT names имели один безопасный контракт. 0.6.60 GET-before-PATCH reconciliation сохранён. Workflow Kit — 1.5.0.

Финальный `npm run build` выполнен из source commit `320e9fd8ae59d477097b09de9d116e34aca1e756`; `sourceFiles=96`, `packagedSourceMatches=true`. Поставка: `~/Downloads/WebPilot-0.6.61/`; `shasum -c SHA256SUMS.txt` — OK. Корневой и `/Applications/Project Web Pilot.app` — 0.6.61, одинаковый macOS ASAR `478d63635904ec13708a53b79ecbfce577937e2b0c48487afacc3d32cf390947`.

| Платформа | Размер, байт | SHA-256 ZIP | ASAR SHA-256 |
| --- | ---: | --- | --- |
| macOS arm64 | 181475006 | `67ed9741e004f6fbdf9029fc310822cd181b06b0ef610fcba86cc636f00b67fc` | `478d63635904ec13708a53b79ecbfce577937e2b0c48487afacc3d32cf390947` |
| Windows x64 | 316737303 | `f53880165665274b0248ed6378e7a129ab98e8918d53083ff21bb661c7828b68` | `bd413c5b79a5aa99ca1d166f57a1feef175b88b854cbca0430d89b4a91bccf03` |


## Локальный парный выпуск 0.6.62 — 28.09.2026

Убран циклический native title retry. Sync выполняется только одноразово на естественных событиях: изменение local scope-title, manual rename, поздний bindChat новой session и reopen/navigation bound conversation. Ошибка 429/5xx не запускает автоматический повтор. Manual rename сохраняет local title и возвращает UI результат до любого сетевого title request.

Финальный `npm run build` выполнен из source commit `a2be84b59ed611040aba3f685719176c68911b07`; `sourceFiles=96`, `packagedSourceMatches=true`. Поставка: `~/Downloads/WebPilot-0.6.62/`; ZIP integrity — OK. macOS ZIP `82a43d6671cdc5f9310f3dd14899d054d83ece6ad3fbca5239292f42d33f155e`; Windows ZIP `60c607631f3916351be93bd2d9d494cdc2cbf3467133184cc5eb24c862845b0f`. macOS ASAR `537fe82b51bbd08d41d53314fc92bba0a9ea653f3b8c2efce150317311f25a06`.


## Локальный парный выпуск 0.6.63 — 28.09.2026

Ручное переименование больше не использует `window.prompt()`. В sidebar есть собственный modal с текущим именем, полем ввода, Enter/«Сохранить» и «Отмена». Один и тот же dialog используется для проекта и session. Native ChatGPT sync остаётся отдельной одноразовой best-effort операцией и не блокирует ввод.

Финальный `npm run build` выполнен из source commit `243e250a0f75d4480e7cdc2b25c58d36bf11a3fb`; `sourceFiles=96`, `packagedSourceMatches=true`. Поставка: `~/Downloads/WebPilot-0.6.63/`; ZIP integrity — OK. macOS ZIP `fdaf6f4ab0a08d462401ac472ad4f7145a8085137db9e3ecb2750a97ad3c3660`; Windows ZIP `cbf6133dae0490689c61702e2334ba5d34e1e4af362fe0273d1bec1e6e979b1e`. macOS ASAR `dce3e5edad72df49b6a394d44378fd7d6743674f14a32f9274afd148d63c48ff`.
