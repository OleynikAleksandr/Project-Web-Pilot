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
