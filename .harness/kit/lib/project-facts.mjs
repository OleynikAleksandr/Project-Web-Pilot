import fs from 'node:fs';
import path from 'node:path';
import {git} from './git.mjs';

const manifests=['package.json','pyproject.toml','requirements.txt','Cargo.toml','go.mod','Package.swift','pubspec.yaml','Gemfile','pom.xml','build.gradle','build.gradle.kts','Makefile','CMakeLists.txt'];
const regular=(root,name)=>fs.lstatSync(path.join(root,name),{throwIfNoEntry:false})?.isFile()===true;
export function projectFactPaths(root) {
 return [...manifests,'.gitignore'].filter(name=>regular(root,name)&&fs.statSync(path.join(root,name)).size<=65536);
}
// Read data only: never run package scripts, import build configuration or inspect credentials.
export function projectFacts(root) {
 const facts={platform:process.platform,architecture:process.arch,workflow_runtime_node:process.versions.node,manifests:manifests.filter(name=>regular(root,name)),gitignore_present:regular(root,'.gitignore')};
 const readable=projectFactPaths(root);
 if(readable.includes('.gitignore'))facts.gitignore=fs.readFileSync(path.join(root,'.gitignore'),'utf8');
 else if(facts.gitignore_present)facts.gitignore_omitted='over_64KiB';
 if(!readable.includes('package.json'))return facts;
 try {
  const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
  facts.package_type=pkg.type??'commonjs';
  facts.entry_point=typeof pkg.main==='string'?pkg.main:null;
  for(const field of ['dependencies','devDependencies']){
   const items=Object.entries(pkg[field]??{}).filter(([,v])=>typeof v==='string');
   facts[field]=Object.fromEntries(items.slice(0,40));
   if(items.length>40)facts[field+'_omitted']=items.length-40;
  }
  const scripts=Object.entries(pkg.scripts??{}).filter(([key,value])=>typeof value==='string');
  facts.scripts=Object.fromEntries(scripts.slice(0,20));
  if(scripts.length>20)facts.scripts_omitted=scripts.length-20;
  const output=pkg.build?.directories?.output;
  if(typeof output==='string'&&output.trim()&&!path.isAbsolute(output)&&!output.split(/[\\/]/).includes('..')&&!/[\r\n]/.test(output)) {
   const relative=output.replaceAll('\\','/').replace(/\/$/,'');
   if(relative&&relative!=='.')facts.configured_build_output={path:relative,ignored:git(root,['--no-literal-pathspecs','check-ignore','--quiet','--',relative+'/'],{allowFailure:true}).status===0};
  }
 }catch{facts.package_json_readable=false;}
 return facts;
}
