import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import net from 'node:net';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
const execute=promisify(execFile);
const control=fileURLToPath(new URL('../resources/runtime-control/mac-control.py',import.meta.url));
async function fixture(t){const state=await fs.mkdtemp(path.join(os.tmpdir(),'web-pilot-mac-runtime-'));t.after(()=>fs.rm(state,{recursive:true,force:true}));return state;}
async function py(state,args=['status']){return execute('python3',[control,...args],{env:{...process.env,CODEX_LOCAL_MAC_STATE_DIR:state,PYTHONDONTWRITEBYTECODE:'1'},timeout:10000,maxBuffer:1024*1024});}
function listen(port=0){return new Promise((resolve,reject)=>{const s=net.createServer();s.once('error',reject);s.listen(port,'127.0.0.1',()=>resolve(s));});}
function close(server){return new Promise(resolve=>server.close(resolve));}
async function reservePort(){const s=await listen(0);const p=s.address().port;await close(s);return p;}

test('Mac runtime status cleans stale PID record without signalling reused foreign PID',async t=>{
 const state=await fixture(t); await fs.mkdir(state,{recursive:true});
 const pidFile=path.join(state,'mcp.pid.json');
 await fs.writeFile(pidFile,JSON.stringify({pid:process.pid,identity:'stale identity from an older process'},null,2));
 const {stdout}=await py(state); const status=JSON.parse(stdout);
 assert.equal(status.runtime_contract,2); assert.equal(status.mcp.running,false); assert.equal(status.mcp.owned,false); assert.equal(status.mcp.stale_cleaned,true);
 await assert.rejects(fs.stat(pidFile),{code:'ENOENT'});
 assert.equal(process.pid>1,true,'the foreign/current Node process is still alive');
});

test('Mac runtime moves occupied preferred ports and preserves tunnel profile identity',async t=>{
 const state=await fixture(t); const priv=path.join(state,'private'); const profileDir=path.join(priv,'tunnel-profile');
 await fs.mkdir(profileDir,{recursive:true});
 const preferredMcp=await reservePort(), preferredTunnel=await reservePort(); assert.notEqual(preferredMcp,preferredTunnel);
 await fs.writeFile(path.join(priv,'runtime-endpoints.json'),JSON.stringify({schema_version:1,mcp_port:preferredMcp,tunnel_port:preferredTunnel},null,2));
 await fs.writeFile(path.join(priv,'bridge_config.json'),JSON.stringify({repo:'/tmp/project',token:'opaque-token',port:preferredMcp},null,2));
 const original={config_version:1,control_plane:{base_url:'https://api.openai.com',tunnel_id:'tunnel_fixture_1234567890',api_key:'env:CODEX_LOCAL_MAC_TUNNEL_API_KEY'},health:{listen_addr:`127.0.0.1:${preferredTunnel}`},admin_ui:{open_browser:false},log:{level:'info',format:'json'},mcp:{server_urls:[{channel:'main',url:`http://127.0.0.1:${preferredMcp}/mcp`}]}};
 await fs.writeFile(path.join(profileDir,'mac-local.yaml'),JSON.stringify(original,null,2));
 const a=await listen(preferredMcp), b=await listen(preferredTunnel); let aOpen=true,bOpen=true;
 t.after(async()=>{if(aOpen)await close(a).catch(()=>{});if(bOpen)await close(b).catch(()=>{});});
 const code=`import importlib.util,json\nspec=importlib.util.spec_from_file_location('control',${JSON.stringify(control)})\nm=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)\nprint(json.dumps(m.reconcile_endpoints()))`;
 const run=async()=>execute('python3',['-c',code],{env:{...process.env,CODEX_LOCAL_MAC_STATE_DIR:state,PYTHONDONTWRITEBYTECODE:'1'},timeout:10000});
 const first=JSON.parse((await run()).stdout); assert.notEqual(first.mcp_port,preferredMcp); assert.notEqual(first.tunnel_port,preferredTunnel); assert.notEqual(first.mcp_port,first.tunnel_port);
 const cfg=JSON.parse(await fs.readFile(path.join(priv,'bridge_config.json'),'utf8')); assert.equal(cfg.token,'opaque-token'); assert.equal(cfg.port,first.mcp_port);
 const profile=JSON.parse(await fs.readFile(path.join(profileDir,'mac-local.yaml'),'utf8'));
 assert.equal(profile.control_plane.tunnel_id,original.control_plane.tunnel_id); assert.equal(profile.control_plane.api_key,original.control_plane.api_key);
 assert.equal(profile.health.listen_addr,`127.0.0.1:${first.tunnel_port}`); assert.equal(profile.mcp.server_urls[0].url,`http://127.0.0.1:${first.mcp_port}/mcp`);
 await close(a);aOpen=false;await close(b);bOpen=false;
 const second=JSON.parse((await run()).stdout); assert.deepEqual(second,first,'persisted dynamic endpoints are reused on next startup');
 const status=JSON.parse((await py(state)).stdout); assert.equal(status.mcp_url,`http://127.0.0.1:${first.mcp_port}/mcp`); assert.equal(status.endpoints.tunnel_port,first.tunnel_port);
});

import { createHash } from 'node:crypto';
import { MacRuntimeBootstrap } from '../src/mac-runtime.mjs';

const sha=value=>createHash('sha256').update(value).digest('hex');

test('Mac bootstrap adopts known external runtime through adapter without modifying source',async t=>{
 const root=await fs.mkdtemp(path.join(os.tmpdir(),'web-pilot-mac-adopt-'));t.after(()=>fs.rm(root,{recursive:true,force:true}));
 const external=path.join(root,'external');await fs.mkdir(path.join(external,'.venv','bin'),{recursive:true});
 const legacy='legacy-known-control\n';await fs.writeFile(path.join(external,'control.py'),legacy);await fs.writeFile(path.join(external,'.venv','bin','python3'),'fixture');
 const calls=[];const execute=async(file,args)=>{calls.push({file,args:[...args]});return {stdout:JSON.stringify({runtime_contract:2,package_root:external,mcp:{running:false,owned:false,ready:false},tunnel:{running:false,owned:false,ready:false,configured:true},mcp_url:'http://127.0.0.1:19001/mcp',tunnel_ui:'http://127.0.0.1:19002/ui',endpoints:{mcp_port:19001,tunnel_port:19002}})};};
 const b=new MacRuntimeBootstrap({payloadFile:path.join(root,'missing.zip'),controlSourceFile:control,dataDir:path.join(root,'data'),preferredFolder:external,defaultFolder:null,execute,platform:'darwin',legacyControlHashes:[sha(legacy)]});
 const result=await b.ensure('/tmp');assert.equal(result.source,'external');assert.equal(result.reused,true);assert.equal(result.service.runtime_contract,2);
 assert.equal(result.control,control);assert.equal(await fs.readFile(path.join(external,'control.py'),'utf8'),legacy,'external source stays untouched');
 await assert.rejects(fs.stat(path.join(external,'.web-pilot-backups')),{code:'ENOENT'});
 const statusCall=calls.find(c=>c.args.at(-1)==='status');assert.equal(statusCall.args[1],control);assert.ok(!calls.some(c=>c.args.includes('setup')));
});

test('Mac bootstrap installs bundled payload when no external runtime exists',async t=>{
 const root=await fs.mkdtemp(path.join(os.tmpdir(),'web-pilot-mac-install-'));t.after(()=>fs.rm(root,{recursive:true,force:true}));
 const payload=path.join(root,'payload.zip');await fs.writeFile(payload,'fake-zip');const data=path.join(root,'data');const fakeUv=path.join(root,'uv');await fs.writeFile(fakeUv,'fixture');
 const calls=[];const execute=async(file,args,options={})=>{
  calls.push({file,args:[...args]});
  if(file==='/usr/bin/ditto'){
   const dest=args.at(-1),folder=path.join(dest,'Codex-Local-Mac');await fs.mkdir(folder,{recursive:true});await fs.writeFile(path.join(folder,'control.py'),await fs.readFile(control));await fs.writeFile(path.join(folder,'requirements.txt'),'mcp\n');return {stdout:''};
  }
  if(file===fakeUv&&args[0]==='venv'){const venv=args.at(-1);await fs.mkdir(path.join(venv,'bin'),{recursive:true});await fs.writeFile(path.join(venv,'bin','python3'),'fixture');return {stdout:''};}
  if(args.includes('setup'))return {stdout:JSON.stringify({installed:true})};
  if(args.at(-1)==='status'){const folder=path.dirname(args[1]);return {stdout:JSON.stringify({runtime_contract:2,package_root:folder,mcp:{running:false,owned:false,ready:false},tunnel:{running:false,owned:false,ready:false,configured:false},mcp_url:'http://127.0.0.1:17842/mcp',tunnel_ui:'http://127.0.0.1:17843/ui',endpoints:{mcp_port:17842,tunnel_port:17843}})};}
  throw new Error('unexpected '+file+' '+args.join(' '));
 };
 const b=new MacRuntimeBootstrap({payloadFile:payload,controlSourceFile:control,dataDir:data,preferredFolder:null,defaultFolder:null,execute,environment:{WEB_PILOT_UV:fakeUv},platform:'darwin'});
 const result=await b.ensure('/tmp');assert.equal(result.source,'bundled');assert.equal(result.reused,false);assert.equal(result.installed,true);
 assert.ok(calls.some(c=>c.file==='/usr/bin/ditto'));assert.ok(calls.some(c=>c.file===fakeUv&&c.args[0]==='venv'));assert.ok(calls.some(c=>c.args.includes('setup')));
 const marker=JSON.parse(await fs.readFile(path.join(data,'runtime','mac-runtime.json'),'utf8'));assert.equal(marker.schemaVersion,1);
});

test('shipped Mac archive installs through adapter and recovers after restart without reinstall', {skip:process.platform!=='darwin'}, async t=>{
 const root=await fixture(t),data=path.join(root,'app');
 const payload=fileURLToPath(new URL('../resources/mac-runtime.zip',import.meta.url));
 const fakeUv=path.join(root,'uv');await fs.writeFile(fakeUv,'fixture');
 const calls=[];const environment={WEB_PILOT_UV:fakeUv,CODEX_LOCAL_MAC_STATE_DIR:path.join(root,'private-state')};
 const run=async(file,args,options={})=>{
  calls.push({file,args,options});
  if(file==='/usr/bin/ditto')return execute(file,args,options);
  if(file===fakeUv){
   assert.equal(options.env,environment,'managed Python uses the isolated environment');
   await fs.mkdir(path.join(args.at(-1),'bin'),{recursive:true});
   await fs.writeFile(path.join(args.at(-1),'bin','python3'),'fixture');return {stdout:''};
  }
  if(args.includes('setup'))return {stdout:'{}'};
  if(args.at(-1)==='status'){
   assert.equal(args[1],control,'shipped archive uses the current facade');
   assert.equal(options.env.WEB_PILOT_RUNTIME_ROOT,options.cwd);
   return {stdout:JSON.stringify({runtime_contract:2,package_root:options.cwd,mcp_url:'http://127.0.0.1:17842/mcp'})};
  }
  throw new Error('Unexpected command');
 };
 const options={payloadFile:payload,controlSourceFile:control,dataDir:data,execute:run,environment,platform:'darwin'};
 const b=new MacRuntimeBootstrap(options);
 const installed=await b.ensure(root);
 assert.equal(installed.source,'bundled');assert.equal(installed.reused,false);assert.equal(installed.control,control);
 const shipped=await fs.readFile(path.join(installed.folder,'control.py'));
 assert.notDeepEqual(shipped,await fs.readFile(control),'regression uses the actual old archive, not a current facade fixture');
 const marker=await fs.readFile(b.paths.marker);
 calls.length=0;
 const restart=new MacRuntimeBootstrap({...options,preferredFolder:installed.folder});
 assert.equal((await restart.inspect()).source,'bundled','own registered folder is not external');
 const recovered=await restart.ensure(root);
 assert.equal(recovered.reused,true);assert.equal(recovered.control,control);
 assert.equal(calls.length,1);assert.equal(calls[0].args.at(-1),'status','no setup or downloads after restart');
 assert.deepEqual(await fs.readFile(restart.paths.marker),marker);
 assert.deepEqual(await fs.readFile(path.join(installed.folder,'control.py')),shipped,'adapter leaves payload untouched');
 await fs.appendFile(path.join(installed.folder,'control.py'),'# changed');
 calls.length=0;
 await assert.rejects(restart.ensure(root),{code:'MAC_RUNTIME_EXTERNAL_MODIFIED'});
 assert.equal(calls.length,0,'a valid install marker does not authorize changed code');
});

test('unknown preferred external Mac runtime remains untouched and never executes',async t=>{
 const root=await fixture(t),folder=path.join(root,'external');
 await fs.mkdir(path.join(folder,'.venv','bin'),{recursive:true});
 await fs.writeFile(path.join(folder,'.venv','bin','python3'),'fixture');
 await fs.writeFile(path.join(folder,'control.py'),'unknown custom control');
 let calls=0;
 const b=new MacRuntimeBootstrap({payloadFile:path.join(root,'missing.zip'),controlSourceFile:control,dataDir:path.join(root,'app'),
  preferredFolder:folder,platform:'darwin',execute:async()=>{calls++;throw new Error('must not execute');}});
 await assert.rejects(b.ensure(root),{code:'MAC_RUNTIME_EXTERNAL_MODIFIED'});
 assert.equal(calls,0);assert.equal(await fs.readFile(path.join(folder,'control.py'),'utf8'),'unknown custom control');
});

test('tunnel setup distinguishes native prompt failures, invalid input and unknown errors without exposing secrets', async t => {
 const root=await fixture(t),folder=path.join(root,'runtime');
 await fs.mkdir(path.join(folder,'.venv','bin'),{recursive:true});
 await fs.copyFile(control,path.join(folder,'control.py'));
 await fs.writeFile(path.join(folder,'.venv','bin','python3'),'fixture');
 let result, failure;
 const b=new MacRuntimeBootstrap({payloadFile:path.join(root,'unused.zip'),controlSourceFile:control,dataDir:path.join(root,'app'),
  preferredFolder:folder,platform:'darwin',environment:{FIXTURE:'true'},execute:async(file,args,options)=>{
   assert.equal(args.at(-1),fileURLToPath(new URL('../resources/runtime-control/mac-first-run.py',import.meta.url)));
   assert.equal(options.env.WEB_PILOT_RUNTIME_ROOT,folder);
   if(failure)throw failure;
   return {stdout:JSON.stringify(result)};
  }});
 for(const [stderr,code,copy] of [
  [JSON.stringify({ok:false,code:'MAC_TUNNEL_PROMPT_FAILED'}),'MAC_TUNNEL_PROMPT_FAILED',/открыть окно/],
  [JSON.stringify({ok:false,code:'MAC_TUNNEL_INVALID_DATA'}),'MAC_TUNNEL_INVALID_DATA',/формат tunnel_id/],
  ['private-command sk-fixture-secret','MAC_TUNNEL_SETUP_FAILED',/завершить настройку/],
  [JSON.stringify({ok:false,code:'sk-fixture-secret',error:'private-command'}),'MAC_TUNNEL_SETUP_FAILED',/завершить настройку/],
  [JSON.stringify({ok:true,code:'MAC_TUNNEL_PROMPT_FAILED'}),'MAC_TUNNEL_SETUP_FAILED',/завершить настройку/],
 ]){
  failure=Object.assign(new Error('private-command'),{stderr,stdout:'sk-fixture-secret'});
  await assert.rejects(b.configureTunnel(),error=>{
   assert.equal(error.code,code);assert.match(error.publicMessage,copy);
   assert.doesNotMatch(error.publicMessage,/sk-fixture|private-command/);return true;
  });
 }
 failure=null;result={cancelled:true};assert.deepEqual(await b.configureTunnel(),{cancelled:true});
 result={configured:true};assert.deepEqual(await b.configureTunnel(),{configured:true});
});
