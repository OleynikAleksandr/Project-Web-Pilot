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
