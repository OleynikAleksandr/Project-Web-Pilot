import { test } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { ChatGPTComposer, pageScript } from '../src/chatgpt-composer.mjs';

function fixture({ draft = '', stop = false, emitMessage = true } = {}) {
  const dom = new JSDOM('<!doctype html><form><textarea id="prompt-textarea"></textarea><button data-testid="send-button" type="submit">Send</button></form>',
    { url:'https://chatgpt.com/', runScripts:'outside-only' });
  dom.window.HTMLElement.prototype.getClientRects=function(){return this.style.display==='none'?[]:[{width:100,height:40}];};
  const document=dom.window.document;
  const editor=document.querySelector('textarea'); editor.value=draft;
  if(stop){const button=document.createElement('button');button.dataset.testid='stop-button';document.body.append(button);}
  let sends=0;
  document.querySelector('form').addEventListener('submit',event=>{
    event.preventDefault();sends++;
    if(emitMessage){const user=document.createElement('div');user.setAttribute('data-message-author-role','user');user.textContent=editor.value;document.body.append(user);editor.value='';}
  });
  let time=0;
  const view={getURL:()=>dom.window.location.href,executeJavaScript:async script=>dom.window.eval(script)};
  const composer=new ChatGPTComposer(view,{settleMs:1,timeoutMs:5,now:()=>time,wait:async ms=>{time+=ms;}});
  return {dom,document,editor,view,composer,sends:()=>sends};
}
const message='Read project context. Request: opaque-request-123';
const request={text:message,requestId:'opaque-request-123'};

test('inserts and sends exactly once, after persisting uncertainty and observing the user message',async()=>{
  const f=fixture();let persisted=false;
  const result=await f.composer.deliver({...request,onBeforeSend:async()=>{assert.equal(f.sends(),0);persisted=true;}});
  assert.equal(result.state,'sent');assert.equal(persisted,true);assert.equal(f.sends(),1);
  assert.equal((await f.composer.deliver(request)).state,'sent');assert.equal(f.sends(),1);
});

test('preserves existing drafts and active generation without clicking',async()=>{
  for(const options of [{draft:'Моя незаконченная мысль'},{stop:true}]){
    const f=fixture(options);const result=await f.composer.deliver(request);
    assert.equal(result.state,'deferred');assert.equal(f.sends(),0);assert.equal(f.editor.value,options.draft??'');
  }
});

test('user edits during insertion/send are preserved; pending send is not clicked',async()=>{
  const f=fixture();const result=await f.composer.deliver({...request,onBeforeSend:async()=>{f.editor.value='Новая мысль пользователя';}});
  assert.equal(result.state,'deferred');assert.equal(result.reason,'DRAFT_CHANGED');assert.equal(f.sends(),0);
  assert.equal(f.editor.value,'Новая мысль пользователя');
});

test('an uncertain send is returned without a second click',async()=>{
  const f=fixture({emitMessage:false});const result=await f.composer.deliver(request);
  assert.equal(result.state,'unknown');assert.equal(f.sends(),1);
});

test('serializes sends and cancels before mutation when the project changes',async()=>{
  const f=fixture();let resolve;const barrier=new Promise(r=>{resolve=r;});
  const first=f.composer.deliver({...request,onBeforeSend:()=>barrier});
  await assert.rejects(f.composer.deliver(request),{code:'SEND_IN_PROGRESS'});resolve();await first;
  const f2=fixture();assert.equal((await f2.composer.deliver({...request,canContinue:()=>false})).state,'cancelled');assert.equal(f2.editor.value,'');
});

test('only a user-role message is evidence; an assistant quote cannot acknowledge delivery',async()=>{
  const f=fixture();const assistant=f.document.createElement('div');assistant.setAttribute('data-message-author-role','assistant');assistant.textContent=message;f.document.body.append(assistant);
  assert.equal((await f.composer.inspect(request)).messageSeen,false);
  const login=fixture();login.view.getURL=()=> 'https://auth.openai.com/log-in';
  assert.equal((await login.composer.deliver(request)).reason,'LOGIN_REQUIRED');
});

test('normal contenteditable receives text through the visible composer input path',async()=>{
  const f=fixture();const editor=f.document.createElement('div');editor.id='prompt-textarea';editor.setAttribute('contenteditable','true');f.editor.replaceWith(editor);
  f.dom.window.document.execCommand=(command,_ui,text)=>{assert.equal(command,'insertText');editor.textContent=text;editor.dispatchEvent(new f.dom.window.InputEvent('input',{bubbles:true}));return true;};
  const result=f.dom.window.eval(pageScript({action:'fill',...request}));
  assert.equal(result.action,'filled');assert.equal(editor.textContent,message);
});

test('Chromium paragraph spacing is normalized without accepting changed text or path spaces',()=>{
  const f=fixture();const editor=f.document.createElement('div');editor.id='prompt-textarea';editor.setAttribute('contenteditable','true');f.editor.replaceWith(editor);
  Object.defineProperty(editor,'innerText',{value:'Workspace: /My  Folder\n\nRequest: r-123',configurable:true});
  assert.equal(f.dom.window.eval(pageScript({action:'inspect',text:'Workspace: /My  Folder\nRequest: r-123'})).draftMatches,true);
  assert.equal(f.dom.window.eval(pageScript({action:'inspect',text:'Workspace: /My Folder\nRequest: r-123'})).draftMatches,false);
  assert.equal(f.dom.window.eval(pageScript({action:'inspect',text:'Workspace: /Another\nRequest: r-123'})).draftMatches,false);
});


test('sends a normal user message without a request marker and confirms a new user message', async()=>{
  const f=fixture(); const text='Принимаю текущий план. Закрой scope и оставь NONE.';
  const result=await f.composer.sendUserMessage({text});
  assert.equal(result.state,'sent'); assert.equal(f.sends(),1);
  assert.equal(f.document.querySelector('[data-message-author-role="user"]').textContent,text);
  assert.equal((await f.composer.inspect()).userMessageCount,1);
});

test('normal user message preserves drafts and active generation', async()=>{
  for(const options of [{draft:'Мой черновик'},{stop:true}]){
    const f=fixture(options); const result=await f.composer.sendUserMessage({text:'Принять план'});
    assert.equal(result.state,'deferred'); assert.equal(f.sends(),0);
    assert.equal(f.editor.value,options.draft??'');
    assert.equal(result.reason, options.stop ? 'GENERATION_ACTIVE' : 'DRAFT_PRESENT');
  }
});

test('normal user message does not retry an unobserved click and respects cancellation', async()=>{
  const f=fixture({emitMessage:false}); const result=await f.composer.sendUserMessage({text:'Принять план'});
  assert.equal(result.state,'unknown'); assert.equal(f.sends(),1);
  const f2=fixture(); assert.equal((await f2.composer.sendUserMessage({text:'Принять план',canContinue:()=>false})).state,'cancelled');
  assert.equal(f2.sends(),0); assert.equal(f2.editor.value,'');
});

function nativeMode(f, initial = 'work', fallback = false) {
  const group = f.document.createElement('div');
  group.setAttribute('aria-label', 'Выберите режим чата');
  for (const [mode, value, label] of [['chat', 'chatgpt', 'Чат'], ['work', 'work', 'Работа']]) {
    const button = f.document.createElement('button');
    button.type = 'button'; button.textContent = label;
    if (!fallback) button.setAttribute('data-tpp-toggle-value', value);
    button.setAttribute('data-state', mode === initial ? 'on' : 'off');
    button.addEventListener('click', () => {
      for (const item of group.children) item.setAttribute('data-state', item === button ? 'on' : 'off');
    });
    group.append(button);
  }
  f.document.body.prepend(group);
  return group;
}
test('native mode selection changes Work to Chat before filling and observes confirmation separately', async () => {
  for (const fallback of [false, true]) {
    const f = fixture(); nativeMode(f, 'work', fallback);
    assert.equal((await f.composer.inspect()).experience, 'work');
    assert.equal((await f.composer.inspect({action:'select-experience',expectedExperience:'chat'})).action, 'experience-selecting');
    assert.equal(f.editor.value, ''); assert.equal(f.sends(), 0);
    assert.equal((await f.composer.inspect({action:'select-experience',expectedExperience:'chat'})).action, 'experience-confirmed');
    assert.equal((await f.composer.deliver({...request,expectedExperience:'chat'})).state, 'sent');
    assert.equal(f.sends(), 1);
  }
});
test('missing, disabled, or conflicting native mode controls fail closed without a send', async () => {
  for (const kind of ['missing', 'disabled', 'conflicting']) {
    const f = fixture();
    if (kind !== 'missing') {
      const group = nativeMode(f);
      if (kind === 'disabled') group.children[0].disabled = true;
      else group.children[0].setAttribute('data-state', 'on');
    }
    const result = await f.composer.deliver({...request,expectedExperience:'chat'});
    assert.equal(result.state, 'deferred'); assert.equal(f.sends(), 0); assert.equal(f.editor.value, '');
  }
  const f = fixture({draft:'Мой черновик'}); nativeMode(f);
  assert.equal((await f.composer.inspect({action:'select-experience',expectedExperience:'chat'})).reason, 'DRAFT_PRESENT');
  assert.equal((await f.composer.inspect()).experience, 'work'); assert.equal(f.editor.value, 'Мой черновик');
});
test('switching mode or opening a foreign conversation immediately before Send blocks the click', async () => {
  for (const change of ['mode', 'url']) {
    const f = fixture(); const group = nativeMode(f, 'chat');
    const result = await f.composer.deliver({...request,expectedExperience:'chat',onBeforeSend:async()=>{
      if (change === 'mode') group.children[1].click();
      else f.dom.reconfigure({url:'https://chatgpt.com/c/foreign-chat'});
    }});
    assert.equal(result.state, 'deferred'); assert.equal(f.sends(), 0); assert.equal(f.editor.value, message);
  }
});
