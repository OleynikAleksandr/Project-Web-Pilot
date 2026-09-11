import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { McpRuntime, LocalMcpClient, validateEndpoint } from '../src/mcp-runtime.mjs';

const ready = { mcp: { running: true, owned: true, ready: true },
  tunnel: { running: true, owned: true, ready: true, configured: true }, mcp_url: 'http://127.0.0.1:17842/mcp' };

async function folder(t) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'web-pilot-служба с пробелами-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  await fs.mkdir(path.join(root, '.venv/bin'), { recursive: true });
  await fs.writeFile(path.join(root, 'control.py'), '# fixture');
  await fs.writeFile(path.join(root, '.venv/bin/python3'), 'fixture');
  return fs.realpath(root);
}

const clientFactory = () => ({ initialize: async () => ({ serverName: 'Codex Local Mac', toolCount: 50 }) });

test('ready shared services are reused, with explicit arguments and one concurrent initialization', async t => {
  const root = await folder(t); const calls = [];
  const runtime = new McpRuntime(root, { clientFactory,
    execute: async (...args) => { calls.push(args); return { stdout: JSON.stringify(ready) }; } });
  const [a,b] = await Promise.all([runtime.ensure(), runtime.ensure()]);
  assert.deepEqual(a,b); assert.equal(calls.length,1);
  assert.deepEqual(calls[0][1], ['-B',path.join(root,'control.py'),'status']);
  assert.equal(calls[0][2].cwd,root); assert.equal(calls[0][2].shell,undefined);
  await assert.rejects(runtime.control('stop'), { code:'RUNTIME_ACTION_DENIED' });
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

test('HTTP JSON and streamed SSE response, session headers and read-only context call', async () => {
  const requests=[];
  const fetchImpl=async (_url,options) => {
    const body=JSON.parse(options.body);requests.push({body,headers:options.headers});
    if(body.method==='notifications/initialized')return new Response(null,{status:202});
    const results={initialize:{serverInfo:{name:'Codex Local Mac'},protocolVersion:'2025-03-26'},
      'tools/list':{tools:['bridge_status','workflow_context_recover','workflow_context_ack','workflow_context_status'].map(name=>({name}))},
      'tools/call':{structuredContent:{workspace:'/project',session_id:'session',latest:null}}};
    const text=JSON.stringify({jsonrpc:'2.0',id:body.id,result:results[body.method]});
    if(body.method==='tools/call') {
      const bytes=new TextEncoder().encode(': keepalive\r\n\r\nevent: message\r\ndata: '+text+'\r\n\r\n');
      return new Response(new ReadableStream({start(controller){controller.enqueue(bytes.slice(0,28));controller.enqueue(bytes.slice(28));controller.close();}}),{headers:{'content-type':'text/event-stream'}});
    }
    return new Response(text,{headers:{'content-type':'application/json','mcp-session-id':'opaque-session'}});
  };
  const client=new LocalMcpClient(ready.mcp_url,{fetchImpl});
  assert.deepEqual(await client.contextStatus('/project','session'),{workspace:'/project',session_id:'session',latest:null});
  assert.equal(requests[2].headers['Mcp-Session-Id'],'opaque-session');
  assert.equal(requests.at(-1).body.params.name,'workflow_context_status');
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
