# Краткая архитектура проекта

Project Web Pilot — одно Electron-приложение для macOS и Windows. Слева работает локальный интерфейс проектов и плана, справа — настоящий ChatGPT Web в изолированном Chromium. Локальные файлы и команды доступны агенту через MCP/tunnel; модельные OpenAI API приложением не используются.

Основные границы:
- Workflow Kit владеет проектным plan/Git lifecycle и формирует recovery context.
- Web Pilot доставляет уже сформированный recovery packet в связанную ChatGPT-сессию и не собирает проектный контекст самостоятельно.
- Workspace/session слой хранит связь проекта с чатами, но не меняет semantics Workflow Kit.
- Runtime lifecycle поднимает или переиспользует MCP+tunnel и должен оставаться отделён от plan/recovery semantics.
- macOS и Windows используют один Git source of truth; platform runtime/build state остаётся локальным.

Подробные владельцы функционала перечислены в `docs/MODULES.md`. Полная историческая архитектура остаётся в `docs/architecture/ARCHITECTURE.md` и не является обязательным recovery-контекстом.
