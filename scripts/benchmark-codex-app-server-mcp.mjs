#!/usr/bin/env node
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { homedir } from 'node:os';
import path from 'node:path';
import fs from 'node:fs/promises';

const execFileAsync = promisify(execFile);

function parseArgs(argv) {
  const result = {
    oldUrl: 'http://127.0.0.1:17842/mcp',
    newUrl: 'http://127.0.0.1:17852/mcp',
    iterations: 10,
    workspace: process.cwd(),
    output: '',
    python: path.join(homedir(), 'Library/Application Support/WebPilotCodexExecutor/runtime/venv/bin/python'),
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const value = argv[i + 1];
    if (arg === '--old-url') { result.oldUrl = value; i += 1; }
    else if (arg === '--new-url') { result.newUrl = value; i += 1; }
    else if (arg === '--iterations') { result.iterations = Math.max(1, Number(value)); i += 1; }
    else if (arg === '--workspace') { result.workspace = path.resolve(value); i += 1; }
    else if (arg === '--output') { result.output = path.resolve(value); i += 1; }
    else if (arg === '--python') { result.python = path.resolve(value); i += 1; }
  }
  return result;
}

const options = parseArgs(process.argv.slice(2));
const python = String.raw`
import asyncio,json,math,statistics,sys,time
from mcp import ClientSession
from mcp.client.streamable_http import streamablehttp_client

old_url,new_url,workspace,iterations=sys.argv[1],sys.argv[2],sys.argv[3],int(sys.argv[4])

def stats(values):
    values=sorted(values)
    if not values: return {}
    p95=values[max(0,math.ceil(.95*len(values))-1)]
    return {
        "n":len(values),
        "median_ms":round(statistics.median(values),3),
        "p95_ms":round(p95,3),
        "min_ms":round(values[0],3),
        "max_ms":round(values[-1],3),
    }

async def endpoint(label,url):
    async with streamablehttp_client(url) as (read,write,_):
        async with ClientSession(read,write) as s:
            t=time.perf_counter(); init=await s.initialize(); init_ms=(time.perf_counter()-t)*1000
            tools=await s.list_tools()
            names=[tool.name for tool in tools.tools]
            cases=[
                ("file_info",{"path":workspace+"/package.json"},iterations),
                ("read_file",{"path":workspace+"/package.json","start_line":1,"end_line":30},iterations),
                ("git_status",{"repository":workspace},iterations),
                ("search_text",{"path":workspace+"/src","query":"WorkspaceSetup","max_results":10},iterations),
                ("run_command_batch",{"commands":["printf a","printf b","printf c"],"working_directory":workspace,"parallel":False},iterations),
            ]
            results={}
            for name,args,count in cases:
                values=[]; response_bytes=[]; errors=[]
                if name not in names:
                    results[name]={"missing":True}
                    continue
                for _ in range(count):
                    started=time.perf_counter()
                    r=await s.call_tool(name,args)
                    elapsed=(time.perf_counter()-started)*1000
                    values.append(elapsed)
                    response_bytes.append(len(r.model_dump_json().encode()))
                    if r.isError:
                        errors.append(r.model_dump_json()[:1000])
                results[name]={
                    **stats(values),
                    "median_response_bytes":int(statistics.median(response_bytes)) if response_bytes else 0,
                    "errors":errors,
                }
            return {
                "label":label,
                "url":url,
                "server":{"name":init.serverInfo.name,"version":init.serverInfo.version},
                "initialize_ms":round(init_ms,3),
                "tool_count":len(names),
                "tools":names,
                "cases":results,
            }

async def main():
    old=await endpoint("codex-local-mac",old_url)
    new=await endpoint("codex-app-server",new_url)
    old_names=set(old["tools"]); new_names=set(new["tools"])
    cloud={"openaiDeveloperDocs","codex_apps","playwright","web_search","web"}
    comparison={
        "missing_from_new":sorted(old_names-new_names),
        "extra_in_new":sorted(new_names-old_names),
        "cloud_duplicates_in_new":sorted(new_names & cloud),
        "local_parity":old_names.issubset(new_names),
    }
    print(json.dumps({"old":old,"new":new,"comparison":comparison},ensure_ascii=False))

asyncio.run(main())
`;

const { stdout, stderr } = await execFileAsync(
  options.python,
  ['-B', '-c', python, options.oldUrl, options.newUrl, options.workspace, String(options.iterations)],
  { maxBuffer: 16 * 1024 * 1024 },
);
if (stderr.trim()) process.stderr.write(stderr);
const report = JSON.parse(stdout.trim());
const text = JSON.stringify(report, null, 2) + '\n';
if (options.output) {
  await fs.mkdir(path.dirname(options.output), { recursive: true });
  await fs.writeFile(options.output, text);
}
process.stdout.write(text);
