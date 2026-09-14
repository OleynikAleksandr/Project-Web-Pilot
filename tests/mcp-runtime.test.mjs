import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { createHash } from 'node:crypto';
import { McpRuntime, LocalMcpClient, validateEndpoint, validateContextPacket } from '../src/mcp-runtime.mjs';
import { runtimeFolderCandidates, runtimeLayout } from '../src/platform.mjs';

const ready = { mcp: { running: true, owned: true, ready: true },
  tunnel: { running: true, owned: true, ready: true, configured: true }, mcp_url: 'http://127.0.0.1:17842/mcp' };

async function folder(t) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'web-pilot-служба с пробелами-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const layout = runtimeLayout(root);
  await fs.mkdir(path.dirname(layout.python), { recursive: true });
  await fs.writeFile(layout.control, '# fixture');
  await fs.writeFile(layout.python, 'fixture');
  return fs.realpath(root);
}

const clientFactory = () => ({ initialize: async () => ({ serverName: process.platform === 'win32' ? 'Codex Local Windows' : 'Codex Local Mac', toolCount: 47 }) });

test('platform runtime layout preserves macOS and defines Windows paths without runtime access', () => {
  assert.deepEqual(runtimeLayout('/Users/test/Codex Local Mac/mac-codex-local', 'darwin'), {
    control: '/Users/test/Codex Local Mac/mac-codex-local/control.py',
    python: '/Users/test/Codex Local Mac/mac-codex-local/.venv/bin/python3',
  });
  assert.deepEqual(runtimeFolderCandidates('/Users/test/Codex Local Mac', 'darwin'), [
    '/Users/test/Codex Local Mac', '/Users/test/Codex Local Mac/mac-codex-local',
  ]);
  assert.deepEqual(runtimeLayout('C:\\Users\\test\\Codex Local', 'win32'), {
    control: 'C:\\Users\\test\\Codex Local\\control.py',
    python: 'C:\\Users\\test\\Codex Local\\.venv\\Scripts\\python.exe',
  });
  assert.deepEqual(runtimeFolderCandidates('C:\\Users\\test\\Codex Local', 'win32'), [
    'C:\\Users\\test\\Codex Local',
    'C:\\Users\\test\\Codex Local\\windows-codex-local',
    'C:\\Users\\test\\Codex Local\\codex-local',
  ]);
});

test('ready shared services are reused, with explicit arguments and one concurrent initialization', async t => {
  const root = await folder(t); const calls = [];
  const runtime = new McpRuntime(root, { clientFactory,
    execute: async (...args) => { calls.push(args); return { stdout: JSON.stringify(ready) }; } });
  const [a,b] = await Promise.all([runtime.ensure(), runtime.ensure()]);
  assert.deepEqual(a,b); assert.equal(calls.length,1);
  const layout = runtimeLayout(root);
  assert.equal(calls[0][0], layout.python);
  assert.deepEqual(calls[0][1], ['-B',layout.control,'status']);
  assert.equal(calls[0][2].cwd,root); assert.equal(calls[0][2].shell,undefined);
  await assert.rejects(runtime.control('stop'), { code:'RUNTIME_ACTION_DENIED' });
});

test('ensureRuntime can replace a stale runtime path with the actual prepared folder', async t => {
  const root = await folder(t);
  const stale = path.join(path.dirname(root), 'missing-runtime');
  const calls = [];
  const runtime = new McpRuntime(stale, { clientFactory,
    ensureRuntime: async () => ({ folder: root }),
    execute: async (...args) => { calls.push(args); return { stdout: JSON.stringify(ready) }; } });
  const result = await runtime.ensure();
  assert.equal(runtime.folder, root);
  assert.equal(result.mcp.ready, true);
  assert.equal(calls.length, 1);
  assert.equal(calls[0][2].cwd, root);
});

test('start is called once only for unready owned services and readiness is rechecked', async t => {
  const root = await folder(t); const calls = [];
  const runtime = new McpRuntime(root, { clientFactory, execute: async (_bin,args) => {
    calls.push(args.at(-1)); return { stdout:JSON.stringify(args.at(-1)==='start' ? ready : {
      ...ready,mcp:{running:false,owned:false,ready:false} }) };
  } });
  await runtime.ensure(); assert.deepEqual(calls,['status','start']);
});

test('foreign processes and unconfigured tunnel are never changed', async t => {
  const root = await folder(t);
  for (const [data,code] of [[{...ready,mcp:{running:true,owned:false,ready:false}},'RUNTIME_FOREIGN_PROCESS'],
    [{...ready,tunnel:{running:false,owned:false,configured:false}},'TUNNEL_NOT_CONFIGURED']]) {
    let count=0;
    const runtime=new McpRuntime(root,{clientFactory,execute:async()=>{count++;return {stdout:JSON.stringify(data)};}});
    await assert.rejects(runtime.ensure(),{code}); assert.equal(count,1);
  }
});

test('HTTP JSON and streamed SSE deliver the full packet with no agent receipt call', async () => {
  const requests=[]; const packet=contextPacket();
  const fetchImpl=async (_url,options) => {
    const body=JSON.parse(options.body);requests.push({body,headers:options.headers});
    if(body.method==='notifications/initialized')return new Response(null,{status:202});
    const results={initialize:{serverInfo:{name:'Codex Local Mac'},protocolVersion:'2025-03-26'},
      'tools/list':{tools:['bridge_status','workflow_context_recover'].map(name=>({name}))},
      'tools/call':{structuredContent:packet}};
    const text=JSON.stringify({jsonrpc:'2.0',id:body.id,result:results[body.method]});
    if(body.method==='tools/call') {
      const bytes=new TextEncoder().encode(': keepalive\r\n\r\nevent: message\r\ndata: '+text+'\r\n\r\n');
      return new Response(new ReadableStream({start(controller){controller.enqueue(bytes.slice(0,28));controller.enqueue(bytes.slice(28));controller.close();}}),{headers:{'content-type':'text/event-stream'}});
    }
    return new Response(text,{headers:{'content-type':'application/json','mcp-session-id':'opaque-session'}});
  };
  const client=new LocalMcpClient(ready.mcp_url,{fetchImpl});
  assert.deepEqual(await client.loadContext('/project'),packet);
  assert.equal(requests[2].headers['Mcp-Session-Id'],'opaque-session');
  assert.equal(requests.at(-1).body.params.name,'workflow_context_recover');
  assert.deepEqual(requests.at(-1).body.params.arguments,{workspace:'/project'});
  await assert.rejects(client.request('tools/call',{name:'workflow_context_ack'}),{code:'MCP_READ_ONLY'});
});

test('non-local addresses and a server without context tools fail closed', async () => {
  for(const url of ['https://evil.test/mcp','http://127.0.0.1:17842/mcp?x=y','file:///tmp/mcp'])assert.throws(()=>validateEndpoint(url),{code:'MCP_URL_INVALID'});
  const client=new LocalMcpClient(ready.mcp_url,{fetchImpl:async(_url,options)=>{
    const body=JSON.parse(options.body);
    if(body.method.startsWith('notifications/'))return new Response(null,{status:202});
    return new Response(JSON.stringify({id:body.id,result:body.method==='initialize'?{serverInfo:{name:'Codex Local Mac'},protocolVersion:'2025-03-26'}:{tools:[]}}),{headers:{'content-type':'application/json'}});
  }});
  await assert.rejects(client.initialize(),{code:'MCP_TOOLS_MISSING'});
});

function contextPacket() {
  const context='Полный контекст\nЗадача и незавершённые изменения';
  return {delivery_protocol:'inline-context-v1',ack_required:false,status:'ready',completeness:'COMPLETE',workspace:'/project',
    context,context_bytes:Buffer.byteLength(context),context_sha256:createHash('sha256').update(context).digest('hex'),
    generated_at_ms:Date.now(),signature:'snapshot',head:'head',objective:'Example',
    facts:{project_id:'id',project_name:'Project',plan_revision:7,scope_id:'scope',execution_scope_status:'ACTIVE',delivery_status:'IN_PROGRESS',task_id:null,task_title:null}};
}

test('legacy diagnostics, another workspace, incomplete or modified context cannot be delivered',()=>{
  assert.equal(validateContextPacket(contextPacket(),'/project').facts.plan_revision,7);
  for(const [mutate,code] of [
    [p=>delete p.delivery_protocol,'MCP_UPDATE_REQUIRED'],
    [p=>p.workspace='/other','MCP_CONTEXT_MISMATCH'],
    [p=>delete p.facts.task_id,'MCP_CONTEXT_INCOMPLETE'],
    [p=>p.context+=' extra','MCP_CONTEXT_DAMAGED'],
    [p=>p.context_bytes=1,'MCP_CONTEXT_DAMAGED'],
    [p=>p.completeness='PARTIAL','MCP_CONTEXT_INCOMPLETE'],
    [p=>p.challenge='old-probe','MCP_CONTEXT_INCOMPLETE'],
    [p=>p.context='я'.repeat(100000),'MCP_CONTEXT_TOO_LARGE'],
  ]) { const packet=contextPacket();mutate(packet);assert.throws(()=>validateContextPacket(packet,'/project'),{code}); }
});

test('external runtime adapter control is executed without replacing the runtime folder control', async t => {
  const root = await folder(t); const adapter = path.join(path.dirname(root), 'adapter-control.py'); await fs.writeFile(adapter, '# adapter');
  const calls=[]; const runtime=new McpRuntime(root,{clientFactory,
    ensureRuntime:async()=>{calls.push(['ensureRuntime']);return {folder:root,control:adapter};},
    execute:async(...args)=>{calls.push(args);return {stdout:JSON.stringify({...ready,runtime_contract:2,mcp_url:'http://127.0.0.1:19111/mcp'})};}});
  await runtime.ensure(); await runtime.control('status'); assert.equal(calls.filter(c=>Array.isArray(c)&&c[0]==='ensureRuntime').length,1); const execCalls=calls.filter(c=>c[0]!=='ensureRuntime'); assert.equal(execCalls.length,2); assert.equal(execCalls[0][1][1],adapter); assert.equal(execCalls[0][2].env.WEB_PILOT_RUNTIME_ROOT,root);
});

test('first-time runtime starts MCP only before reporting missing tunnel configuration', async t => {
  const root=await folder(t); const calls=[];
  const status={...ready,runtime_contract:2,mcp:{running:false,owned:false,ready:false},tunnel:{running:false,owned:false,ready:false,configured:false}};
  const mcpOnly={...status,mcp:{running:true,owned:true,ready:true}};
  const runtime=new McpRuntime(root,{clientFactory,execute:async(_bin,args)=>{calls.push([...args]);return {stdout:JSON.stringify(args.at(-1)==='--mcp-only'?mcpOnly:status)};}});
  await assert.rejects(runtime.ensure(),{code:'TUNNEL_NOT_CONFIGURED'});
  assert.deepEqual(calls.map(args=>args.slice(2)),[['status'],['start','--mcp-only']]);
});
