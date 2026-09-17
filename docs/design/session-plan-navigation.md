# Сайдбар планов сессий — принятый пример

Реализовано в 0.6.28. Этот файл сохраняет принятый пример; фактический sidebar использует существующие стили и карточку выбора, а не отдельное приложение.

Согласовано пользователем 17.09.2026. Канонический контракт: [Планы сессий и подготовка продолжения](../modules/session-owned-plans.md).

Кнопки «+ Задача» и приёмки отсутствуют. Подготовленный план открывает выбор Chat/Work; меню проекта создаёт сессию с пустым scope. Возврат в исходную сессию сохраняет её план и связь с продолжением. Карточка Chat/Work в примере схематична: в приложении переиспользовать существующую.

Ниже сохранён HTML-фрагмент интерактивного примера из обсуждения. Это дизайн-материал, не исходник приложения; исходные данные задач условные. При отдельном просмотре нужен обычный HTML-контейнер и Lucide для пиктограмм. Фрагмент работает локально без модельных API.

```html
<div id="wp-session-plans" lang="ru">
  <style>
    #wp-session-plans { --wp-bg:light-dark(#f6f8f9,#191d22); --wp-surface:light-dark(#ffffff,#242a32); --wp-text:light-dark(#202a32,#e7edf3); --wp-muted:light-dark(#596875,#a7b5c2); --wp-line:light-dark(#d7dfe5,#3b4652); --wp-selected:light-dark(#dfefed,#203a3b); --wp-accent:light-dark(#1c645f,#8bddd5); --wp-hover:light-dark(#edf1f4,#2d3742); color:var(--wp-text); background:var(--wp-bg); border:1px solid var(--wp-line); border-radius:14px; font:14px/1.45 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; width:100%; max-width:420px; margin:0 auto; padding:20px; }
    #wp-session-plans * { box-sizing:border-box; }
    #wp-session-plans { box-sizing:border-box; position:relative; }
    #wp-session-plans [hidden] { display:none!important; }
    #wp-session-plans button { font:inherit; }
    #wp-session-plans button { color:inherit; background:none; border:0; text-align:left; border-radius:7px; }
    #wp-session-plans button:hover { background:var(--wp-hover); }
    #wp-session-plans .wp-brand { font-size:12px; color:var(--wp-muted); margin-bottom:6px; }
    #wp-session-plans .wp-project { display:flex; align-items:center; justify-content:space-between; gap:8px; font-size:18px; font-weight:600; margin-bottom:18px; }
    #wp-session-plans .wp-project-menu { position:relative; font-size:14px; font-weight:400; }
    #wp-session-plans .wp-project-menu summary { display:flex; align-items:center; justify-content:center; padding:8px; list-style:none; border-radius:6px; }
    #wp-session-plans .wp-project-menu summary::-webkit-details-marker { display:none; }
    #wp-session-plans .wp-project-menu summary:hover { background:var(--wp-hover); }
    #wp-session-plans .wp-menu-panel { position:absolute; right:0; top:100%; z-index:3; width:252px; padding:6px; background:var(--wp-surface); border:1px solid var(--wp-line); border-radius:9px; }
    #wp-session-plans .wp-menu-panel button { width:100%; padding:10px; }
    #wp-session-plans .wp-caption { color:var(--wp-muted); font-size:12px; margin-bottom:8px; }
    #wp-session-plans .wp-session { width:100%; display:flex; align-items:center; gap:10px; padding:10px 12px; margin:3px 0; min-height:48px; }
    #wp-session-plans .wp-session[aria-current="page"] { background:var(--wp-selected); color:var(--wp-accent); box-shadow:inset 3px 0 0 var(--wp-accent); }
    #wp-session-plans .wp-session-name { flex:1; min-width:0; overflow-wrap:anywhere; }
    #wp-session-plans .wp-type { font-size:11px; color:var(--wp-muted); }
    #wp-session-plans .wp-block { border-top:1px solid var(--wp-line); padding-top:18px; margin-top:18px; }
    #wp-session-plans .wp-heading { display:flex; align-items:center; justify-content:space-between; gap:10px; margin-bottom:8px; }
    #wp-session-plans h2 { font-size:14px; font-weight:600; margin:0; }
    #wp-session-plans .wp-title { font-size:16px; font-weight:500; margin:0 0 5px; overflow-wrap:anywhere; }
    #wp-session-plans .wp-status { font-size:12px; color:var(--wp-muted); margin:0 0 12px; }
    #wp-session-plans .wp-tasks { padding:0; margin:0; list-style:none; }
    #wp-session-plans .wp-task { display:flex; align-items:flex-start; gap:9px; padding:6px 0; }
    #wp-session-plans .wp-mark { width:16px; flex:0 0 16px; color:var(--wp-accent); }
    #wp-session-plans .wp-mark svg { display:block; width:16px; height:16px; margin-top:2px; }
    #wp-session-plans .wp-task span:last-child { min-width:0; overflow-wrap:anywhere; }
    #wp-session-plans .wp-small-action { padding:6px 8px; font-size:12px; color:var(--wp-accent); }
    #wp-session-plans .wp-action { border:1px solid var(--wp-line); padding:9px 12px; margin-top:10px; min-height:40px; }
    #wp-session-plans .wp-primary { background:var(--wp-selected); border-color:var(--wp-selected); color:var(--wp-accent); width:100%; text-align:center; }
    #wp-session-plans .wp-related { background:var(--wp-surface); padding:14px; border-radius:10px; }
    #wp-session-plans .wp-relation-status { display:flex; align-items:center; gap:6px; margin-bottom:6px; font-size:12px; color:var(--wp-muted); }
    #wp-session-plans .wp-relation-status svg { width:14px; height:14px; }
    #wp-session-plans .wp-docs { margin-top:12px; padding-top:10px; border-top:1px solid var(--wp-line); }
    #wp-session-plans .wp-docs span { display:block; font-size:12px; padding:2px 0; color:var(--wp-muted); overflow-wrap:anywhere; }
    #wp-session-plans .wp-choice { display:flex; flex-wrap:wrap; gap:8px; margin-top:10px; }
    #wp-session-plans .wp-choice .wp-action { flex:1; text-align:center; margin-top:0; }
    #wp-session-plans .wp-origin { font-size:12px; margin:0 0 12px; color:var(--wp-muted); }
    #wp-session-plans .wp-origin button { padding:3px 4px; color:var(--wp-accent); }
    #wp-session-plans dialog { width:calc(100% - 32px); max-width:340px; padding:22px; background:var(--wp-surface); color:var(--wp-text); border:1px solid var(--wp-line); border-radius:12px; }
    #wp-session-plans dialog::backdrop { background:light-dark(#25354466,#02050999); }
    #wp-session-plans dialog .wp-small-action { display:block; margin:12px auto 0; }
    #wp-session-plans .wp-sr { position:absolute; width:1px; height:1px; overflow:hidden; clip-path:inset(50%); }
    @media(max-width:360px) { #wp-session-plans { padding:14px; } }
    @media(pointer:coarse) { #wp-session-plans button,#wp-session-plans summary { min-height:44px; } }
  </style>
  <div class="wp-brand">Web Pilot</div>
  <div class="wp-project"><span>Project Web Pilot</span><details id="wps-project-menu" class="wp-project-menu"><summary class="cursor-interaction" aria-label="Меню проекта"><i data-lucide="ellipsis" aria-hidden="true"></i></summary><div class="wp-menu-panel"><button type="button" class="cursor-interaction" data-blank="Chat">Создать новую сессию Chat</button><button type="button" class="cursor-interaction" data-blank="Work">Создать новую сессию Work</button></div></details></div>
  <div class="wp-caption">Сессии</div>
  <nav id="wps-sessions" aria-label="Сессии проекта"></nav>
  <section class="wp-block" aria-labelledby="wps-own-heading">
    <div class="wp-heading"><h2 id="wps-own-heading">План этой сессии</h2></div>
    <div id="wps-own"></div>
  </section>
  <section class="wp-block" id="wps-prepared" aria-labelledby="wps-prepared-heading">
    <div class="wp-heading"><h2 id="wps-prepared-heading">План следующей сессии</h2></div>
    <div id="wps-related" class="wp-related"></div>
  </section>
  <div id="wps-announcement" class="wp-sr" aria-live="polite"></div>
  <dialog id="wps-kind-dialog" aria-labelledby="wps-kind-title">
    <div class="wp-title" id="wps-kind-title">Новая сессия</div>
    <div class="wp-status">Проверка установки 0.6.27</div>
    <div class="wp-choice"><button type="button" class="wp-action cursor-interaction" data-create="Chat">Chat</button><button type="button" class="wp-action cursor-interaction" data-create="Work">Work</button></div>
    <button type="button" class="wp-small-action cursor-interaction" data-action="cancel">Отмена</button>
  </dialog>
  <script>
    (() => {
      const root = document.getElementById('wp-session-plans');
      const sessions = root.querySelector('#wps-sessions');
      const own = root.querySelector('#wps-own');
      const related = root.querySelector('#wps-related');
      const prepared = root.querySelector('#wps-prepared');
      const dialog = root.querySelector('#wps-kind-dialog');
      const projectMenu = root.querySelector('#wps-project-menu');
      const announcement = root.querySelector('#wps-announcement');
      const plans = {
        lab: { title:'Тестовая среда', tasks:[{text:'Подготовить Windows и macOS',done:true},{text:'Сохранить чистые копии',done:true},{text:'Актуализировать документы',done:true}] },
        install: { title:'Проверка установки 0.6.27', tasks:[{text:'Проверить первый запуск в macOS',done:false},{text:'Проверить установку в Windows',done:false},{text:'Записать результаты и замечания',done:false}] }
      };
      let selected = 'lab';
      let created = false;
      let kind = 'Work';
      let previewOpen = true;
      const sessionItems = [{id:'lab',title:'Тестовая среда',kind:'Work'}];
      let blankCount = 0;
      const esc = value => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
      const icon = name => `<i data-lucide="${name}" aria-hidden="true"></i>`;
      const tasks = plan => `<ul class="wp-tasks">${plan.tasks.map(task => `<li class="wp-task"><span class="wp-mark" aria-label="${task.done?'Выполнено':'Не выполнено'}">${icon(task.done?'circle-check':'circle')}</span><span>${esc(task.text)}</span></li>`).join('')}</ul>`;
      const docs = '<div class="wp-docs"><div class="wp-caption">Документы к плану</div><span>docs/CLEAN_INSTALL.md</span><span>docs/VERIFICATION.md</span></div>';
      const count = plan => { if (plan.empty) return 'Scope: NONE'; const done = plan.tasks.filter(t => t.done).length; return done === plan.tasks.length ? 'Все задачи выполнены' : `${done} из ${plan.tasks.length} выполнено`; };
      const sessionButton = (id,label,type) => `<button type="button" class="wp-session cursor-interaction" data-session="${id}" ${selected===id?'aria-current="page"':''}><span class="wp-session-name">${label}</span><span class="wp-type">${type}</span></button>`;
      function render() {
        sessions.innerHTML = sessionItems.map(s => sessionButton(s.id,esc(s.title),s.kind)).join('');
        const plan = plans[selected];
        own.innerHTML = plan.empty ? '<div class="wp-title">План ещё не создан</div><div class="wp-status">Scope: NONE</div>' : `<div class="wp-title">${esc(plan.title)}</div><div class="wp-status">${count(plan)}</div>` + (selected==='install'?'<div class="wp-origin">Подготовлен в <button type="button" class="cursor-interaction" data-session="lab">«Тестовая среда»</button></div>':'') + tasks(plan) + (selected==='install'?docs:'');
        prepared.hidden = selected !== 'lab';
        related.innerHTML = `<div class="wp-relation-status">${icon(created?'link':'file-pen-line')}<span>${created?'Продолжение · '+kind:'Черновик · без сессии'}</span></div><div class="wp-title">${esc(plans.install.title)}</div>` + (created?`<div class="wp-status">${count(plans.install)}</div><button type="button" class="wp-small-action cursor-interaction" data-action="preview" aria-expanded="${previewOpen}" aria-controls="wps-preview">${previewOpen?'Свернуть план':'Посмотреть план здесь'}</button>`:'') + `<div id="wps-preview" ${previewOpen?'':'hidden'}>${tasks(plans.install)}${docs}</div>` + (created?'<button type="button" class="wp-action wp-primary cursor-interaction" data-session="install">Перейти к сессии</button>':'<button type="button" class="wp-action wp-primary cursor-interaction" data-action="choose">Создать сессию с этим планом</button>');
        if (typeof lucide !== 'undefined') lucide.createIcons();
      }
      root.addEventListener('click', event => {
        const button = event.target.closest('button');
        if (!button || !root.contains(button)) return;
        if (button.dataset.session) {
          selected = button.dataset.session;
          projectMenu.open = false;
          render();
          announcement.textContent = `Сессия ${plans[selected].title}. ${count(plans[selected])}.`;
        } else if (button.dataset.action === 'preview') {
          previewOpen = !previewOpen;
          render();
        } else if (button.dataset.action === 'choose') {
          dialog.showModal();
        } else if (button.dataset.action === 'cancel') {
          dialog.close();
        } else if (button.dataset.create) {
          if (created) return;
          kind = button.dataset.create;
          created = true;
          selected = 'install';
          previewOpen = false;
          sessionItems.unshift({id:'install',title:plans.install.title,kind});
          dialog.close();
          render();
          announcement.textContent = `Создана ${kind}-сессия с подготовленным планом. В исходной сессии сохранена связь с продолжением.`;
        } else if (button.dataset.blank) {
          const type = button.dataset.blank;
          selected = 'blank-' + (++blankCount);
          plans[selected] = {title:'Новая сессия ' + blankCount,tasks:[],empty:true};
          sessionItems.unshift({id:selected,title:plans[selected].title,kind:type});
          projectMenu.open = false;
          render();
          announcement.textContent = `Создана новая ${type}-сессия без плана.`;
        }
      });
      render();
    })();
  </script>
</div>

```
