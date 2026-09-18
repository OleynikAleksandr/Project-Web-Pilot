import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createHash } from 'node:crypto';
import { execFile as execFileCallback } from 'node:child_process';
import { promisify } from 'node:util';
const execFile=promisify(execFileCallback);
const TUNNEL_SETUP_ERRORS = {
 MAC_TUNNEL_PROMPT_FAILED: 'Не удалось открыть окно ввода подключения. Обновите Web Pilot и повторите ввод. Данные подключения не сохранены.',
 MAC_TUNNEL_INVALID_DATA: 'Проверьте формат tunnel_id и ключа и повторите ввод. Данные подключения не сохранены.',
 MAC_TUNNEL_SETUP_FAILED: 'Не удалось завершить настройку подключения. Повторите ввод. Если ошибка повторяется, сообщите разработчику. Действующее подключение автоматически не заменяется.',
};

export const MAC_RUNTIME_CONTRACT=2;
export const MAC_RUNTIME_FOLDER='Codex-Local-Mac';
// control.py shipped in resources/mac-runtime.zip; adapt only this exact known version.
export const MAC_BUNDLED_CONTROL_SHA256='84a68f87448cfc10090752e4e4b15c6e4120ea53ad8ec70038408051b85358f9';
export const MAC_LEGACY_CONTROL_SHA256='6c5c14972774ece2a9820059b3953fe2fe968c186bb6e17af074c7752dc294be';

export class MacRuntimeError extends Error { constructor(code,message){super(message);this.code=code;} }
const exists=async file=>{try{await fs.access(file);return true;}catch{return false;}};
async function sha256(file){const data=await fs.readFile(file);return createHash('sha256').update(data).digest('hex');}
export function macRuntimePaths(dataDir,payloadFile=''){
 const root=path.join(dataDir,'runtime'); const folder=path.join(root,MAC_RUNTIME_FOLDER);
 return {root,folder,payloadFile,marker:path.join(root,'mac-runtime.json'),staging:path.join(root,'.mac-runtime-staging'),control:path.join(folder,'control.py'),python:path.join(folder,'.venv','bin','python3')};
}
export function macRuntimeFolderPaths(folder){return {folder,control:path.join(folder,'control.py'),python:path.join(folder,'.venv','bin','python3')};}

export class MacRuntimeBootstrap {
 constructor({payloadFile,controlSourceFile,dataDir,preferredFolder=null,defaultFolder=null,execute=execFile,environment=process.env,platform=process.platform,onState=null,legacyControlHashes=[MAC_LEGACY_CONTROL_SHA256,MAC_BUNDLED_CONTROL_SHA256]}={}){
  if(!payloadFile||!controlSourceFile||!dataDir)throw new TypeError('MacRuntimeBootstrap requires payload/control/dataDir');
  this.payloadFile=payloadFile;this.controlSourceFile=controlSourceFile;this.paths=macRuntimePaths(dataDir,payloadFile);this.preferredFolder=preferredFolder&&path.isAbsolute(preferredFolder)?preferredFolder:null;this.defaultFolder=defaultFolder&&path.isAbsolute(defaultFolder)?defaultFolder:null;this.execute=execute;this.environment=environment;this.platform=platform;this.onState=typeof onState==='function'?onState:null;this.legacyControlHashes=new Set(legacyControlHashes);this.pending=null;this.state={phase:platform==='darwin'?'embedded':'unavailable',folder:this.paths.folder};
 }
 snapshot(){return {...this.state};}
 #publish(next){this.state={...this.state,...next,folder:next?.folder??this.state.folder??this.paths.folder};try{this.onState?.(this.snapshot());}catch{}}
 async #desired(){const content=await fs.readFile(this.controlSourceFile,'utf8');return {content,sha:createHash('sha256').update(content).digest('hex')};}
 async #marker(){try{return JSON.parse(await fs.readFile(this.paths.marker,'utf8'));}catch{return null;}}
 async #candidate(folder){if(!folder)return null;const layout=macRuntimeFolderPaths(folder);if(!await exists(layout.control)||!await exists(layout.python))return null;const current=await sha256(layout.control);const desired=await this.#desired();return {folder,layout,current,desired,compatible:current===desired.sha,overlayable:this.legacyControlHashes.has(current)};}
 async inspect(){
  if(this.platform!=='darwin')return this.snapshot();
  const seen=new Set();
  for(const folder of [this.preferredFolder,this.defaultFolder]){
   if(!folder)continue;const key=path.resolve(folder);if(key===path.resolve(this.paths.folder)||seen.has(key))continue;seen.add(key);const c=await this.#candidate(folder);if(!c)continue;
   if(c.compatible||c.overlayable){this.#publish({phase:'installed',installed:true,source:'external',folder:c.folder,needsOverlay:!c.compatible,error:null});return this.snapshot();}
   if(this.preferredFolder&&path.resolve(this.preferredFolder)===key){this.#publish({phase:'error',installed:true,source:'external',folder:c.folder,error:'MAC_RUNTIME_EXTERNAL_MODIFIED'});return this.snapshot();}
  }
  const marker=await this.#marker();const bundled=await this.#candidate(this.paths.folder);
  if(bundled&&marker?.payloadSha256===await sha256(this.payloadFile)){
   const trusted=bundled.compatible||bundled.overlayable;
   this.#publish({phase:trusted?'installed':'error',installed:true,source:'bundled',folder:this.paths.folder,needsOverlay:!bundled.compatible,error:trusted?null:'MAC_RUNTIME_EXTERNAL_MODIFIED'});return this.snapshot();
  }
  this.#publish({phase:'embedded',installed:false,source:'embedded',folder:this.paths.folder,error:null});return this.snapshot();
 }
 async #controlFor(folder){
  const c=await this.#candidate(folder);if(!c)throw new MacRuntimeError('MAC_RUNTIME_NOT_FOUND','Mac runtime больше недоступен.');
  if(c.compatible)return c.layout.control;
  if(c.overlayable)return this.controlSourceFile;
  throw new MacRuntimeError('MAC_RUNTIME_EXTERNAL_MODIFIED','Найденный Codex Local Mac изменён и не будет автоматически адаптирован.');
 }
 async #status(folder){
  const layout=macRuntimeFolderPaths(folder);const control=await this.#controlFor(folder);let out;try{out=await this.execute(layout.python,['-B',control,'status'],{cwd:folder,timeout:15000,maxBuffer:1024*1024,env:{...this.environment,PYTHONDONTWRITEBYTECODE:'1',...(control!==layout.control?{WEB_PILOT_RUNTIME_ROOT:folder}:{})}});}catch(error){throw new MacRuntimeError('MAC_RUNTIME_STATUS_FAILED',String(error.stderr||error.message||'Не удалось проверить Mac runtime.').slice(-1200));}
  let s;try{s=JSON.parse(out.stdout);}catch{throw new MacRuntimeError('MAC_RUNTIME_STATUS_INVALID','Mac runtime вернул непонятный status.');}
  if(s?.runtime_contract!==MAC_RUNTIME_CONTRACT||path.resolve(s.package_root??'')!==path.resolve(folder)||!s.mcp_url)throw new MacRuntimeError('MAC_RUNTIME_CONTRACT','Mac runtime не поддерживает self-healing contract v2.');
  return s;
 }
 async #findUv(){for(const f of [this.environment.WEB_PILOT_UV,path.join(os.homedir(),'.local/bin/uv'),'/opt/homebrew/bin/uv','/usr/local/bin/uv'])if(f&&await exists(f))return f;return null;}
 async #findPython(){for(const f of ['/opt/homebrew/bin/python3','/usr/local/bin/python3','/usr/bin/python3']){if(!await exists(f))continue;try{const r=await this.execute(f,['-c','import sys;print(sys.version_info[:2] >= (3,13))'],{timeout:5000});if(String(r.stdout).trim()==='True')return f;}catch{}}return null;}
 async #install(workspace){
  if(!await exists(this.payloadFile))throw new MacRuntimeError('MAC_RUNTIME_PAYLOAD_MISSING','В macOS-сборке отсутствует bundled Codex Local runtime.');
  const payloadSha=await sha256(this.payloadFile);await fs.rm(this.paths.staging,{recursive:true,force:true});await fs.mkdir(this.paths.staging,{recursive:true});
  await this.execute('/usr/bin/ditto',['-x','-k',this.payloadFile,this.paths.staging],{timeout:60000,maxBuffer:4*1024*1024});
  const entries=await fs.readdir(this.paths.staging);if(entries.length!==1||entries[0]!==MAC_RUNTIME_FOLDER)throw new MacRuntimeError('MAC_RUNTIME_ARCHIVE_INVALID','Bundled Mac runtime имеет неожиданную структуру.');
  const extracted=path.join(this.paths.staging,MAC_RUNTIME_FOLDER);await fs.rm(this.paths.folder,{recursive:true,force:true});await fs.rename(extracted,this.paths.folder);await fs.rm(this.paths.staging,{recursive:true,force:true});
  const uv=await this.#findUv();const layout=macRuntimeFolderPaths(this.paths.folder);
  if(uv){await this.execute(uv,['venv','--python','3.13',path.join(this.paths.folder,'.venv')],{cwd:this.paths.folder,timeout:120000,maxBuffer:2*1024*1024,env:this.environment});}
  const bootstrapPython=await exists(layout.python)?layout.python:await this.#findPython();if(!bootstrapPython)throw new MacRuntimeError('MAC_RUNTIME_BOOTSTRAP_TOOL_MISSING','Для первой установки Mac runtime нужен uv или Python 3.13+.');
  const env={...this.environment,PYTHONDONTWRITEBYTECODE:'1',...(uv?{WEB_PILOT_UV:uv}:{})};
  try{await this.execute(bootstrapPython,['-B',layout.control,'setup','--workspace',workspace],{cwd:this.paths.folder,timeout:15*60*1000,maxBuffer:8*1024*1024,env});}catch(error){throw new MacRuntimeError('MAC_RUNTIME_SETUP_FAILED',String(error.stderr||error.stdout||error.message).slice(-1600));}
  await fs.mkdir(this.paths.root,{recursive:true});await fs.writeFile(this.paths.marker+'.tmp',JSON.stringify({schemaVersion:1,payloadSha256:payloadSha,installedAt:new Date().toISOString(),folder:this.paths.folder},null,2)+'\n',{mode:0o600});await fs.rename(this.paths.marker+'.tmp',this.paths.marker);
  return this.paths.folder;
 }
 configureTunnel() {
  if (this.configurePending) return this.configurePending;
  this.configurePending = this.#configureTunnel().finally(() => { this.configurePending = null; });
  return this.configurePending;
 }
 async #configureTunnel() {
  const current = await this.inspect();
  if (!current.installed) throw new MacRuntimeError('MAC_RUNTIME_NOT_FOUND', 'Сначала подготовьте локальные компоненты.');
  await this.#controlFor(current.folder);
  const layout = macRuntimeFolderPaths(current.folder);
  const helper = path.join(path.dirname(this.controlSourceFile), 'mac-first-run.py');
  try {
   const result = await this.execute(layout.python, ['-B', helper], {
    cwd: current.folder, timeout: 16 * 60 * 1000, maxBuffer: 64 * 1024,
    env: { ...this.environment, PYTHONDONTWRITEBYTECODE: '1', WEB_PILOT_RUNTIME_ROOT: current.folder },
   });
   const value = JSON.parse(result.stdout);
   if (value.cancelled === true) return { cancelled: true };
   if (value.configured === true) return { configured: true };
   throw new Error('Unexpected setup result');
  } catch (failure) {
   let code = 'MAC_TUNNEL_SETUP_FAILED';
   try {
    const report = JSON.parse(failure.stderr);
    if (report?.ok === false && Object.hasOwn(TUNNEL_SETUP_ERRORS, report.code)) code = report.code;
   } catch { /* Only the worker's known codes may cross the secret-input boundary. */ }
   const error = new MacRuntimeError(code, TUNNEL_SETUP_ERRORS[code]);
   error.publicMessage = error.message; throw error;
  }
 }
 ensure(workspace){if(this.platform!=='darwin')return Promise.reject(new MacRuntimeError('MAC_ONLY','Mac runtime доступен только на macOS.'));if(this.pending)return this.pending;this.pending=this.#ensure(workspace).finally(()=>{this.pending=null;});return this.pending;}
 async #ensure(workspace){
  if(typeof workspace!=='string'||!path.isAbsolute(workspace))throw new MacRuntimeError('MAC_WORKSPACE_REQUIRED','Для Mac runtime нужен абсолютный workspace.');
  const current=await this.inspect();let folder=current.folder,source=current.source;
  if(current.error==='MAC_RUNTIME_EXTERNAL_MODIFIED')throw new MacRuntimeError(current.error,'Выбранный Codex Local Mac изменён; автоматический overlay остановлен.');
  if(current.installed){const control=await this.#controlFor(folder);const service=await this.#status(folder);this.#publish({phase:'installed',installed:true,source,folder,service,needsOverlay:false,error:null});return {...this.snapshot(),service,control,reused:true};}
  this.#publish({phase:'installing',installed:false,source:'bundled',folder:this.paths.folder,error:null});folder=await this.#install(workspace);const service=await this.#status(folder);this.#publish({phase:'installed',installed:true,source:'bundled',folder,service,error:null});return {...this.snapshot(),service,control:await this.#controlFor(folder),reused:false};
 }
}
