# Выпуск и постоянный путь запуска

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
