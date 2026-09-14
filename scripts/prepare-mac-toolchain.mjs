import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
const execute=promisify(execFile);
export const UV_VERSION='0.9.13';
export const UV_SHA256='11609c939296348c7cc1e1231b3fbf7ca90a603a4c494ec72b59d7ceafa695e1';
const root=path.resolve(fileURLToPath(new URL('..',import.meta.url)));
const out=path.join(root,'.harness/runtime/mac-tools/uv');
const candidates=[process.env.WEB_PILOT_UV,path.join(os.homedir(),'.local/bin/uv'),'/opt/homebrew/bin/uv','/usr/local/bin/uv'].filter(Boolean);
async function sha(file){const data=await fs.readFile(file);return createHash('sha256').update(data).digest('hex');}
let source=null,version=null,digest=null;
for(const candidate of candidates){
 try{
  const stat=await fs.stat(candidate);if(!stat.isFile())continue;
  const result=await execute(candidate,['--version'],{timeout:5000});
  const match=/^uv\s+(\d+\.\d+\.\d+)/.exec(result.stdout.trim());if(match?.[1]!==UV_VERSION)continue;
  const actual=await sha(candidate);if(actual!==UV_SHA256)continue;
  source=candidate;version=match[1];digest=actual;break;
 }catch{}
}
if(!source)throw new Error(`Pinned uv ${UV_VERSION} (${UV_SHA256}) not found. Set WEB_PILOT_UV to the verified arm64 binary.`);
await fs.mkdir(path.dirname(out),{recursive:true});await fs.copyFile(source,out);await fs.chmod(out,0o755);
if(await sha(out)!==UV_SHA256)throw new Error('Copied uv SHA-256 mismatch.');
process.stdout.write(JSON.stringify({source,out,version,sha256:digest,platform:process.platform,arch:process.arch})+'\n');
