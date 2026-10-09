import fs from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { createHash } from 'node:crypto';
import { parsePlan } from '@webpilot/workflow-kit/lib/plan';
import { readReview } from '@webpilot/workflow-kit/lib/plan-review';
import { reviewBlocksExecution } from './auto-plan-state.mjs';

const execute=promisify(execFile),planFile='.harness/plans/todo-plan.md';
const exists=async file=>{try{await fs.access(file);return true;}catch(e){if(e.code==='ENOENT')return false;throw e;}};
const commandActivity=async workspace=>(await fs.readdir(path.join(workspace,'.harness/runtime/command-activity'))
  .catch(e=>{if(e.code==='ENOENT')return [];throw e;})).length>0;
// All potentially long Kit/Git work stays outside Electron's main event loop.
export class ParallelKit {
  constructor({plans,setup}) {Object.assign(this,{plans,setup});}
  async git(workspace,args) {
    await this.setup.node();
    return (await execute(this.setup.environment.WORKFLOW_GIT_BIN||'git',['-C',workspace,...args],
      {env:this.setup.environment,windowsHide:true,encoding:'utf8',timeout:10000,maxBuffer:4*1024*1024})).stdout.trim();
  }
  async read(workspace) {
    const text=await fs.readFile(path.join(workspace,planFile),'utf8'),plan=parsePlan(text);
    const gitDir=await this.git(workspace,['rev-parse','--absolute-git-dir']);
    const integration=await this.plans.call(workspace,'integration:status');
    const proof=await this.plans.call(workspace,'validate');
    const assignments=[];
    const directory=path.join(gitDir,'workflow-kit','assignments');
    for(const file of await fs.readdir(directory).catch(e=>{if(e.code==='ENOENT')return [];throw e;})) {
      if(!/^[A-Za-z0-9][A-Za-z0-9_-]{0,79}\.json$/.test(file))continue;
      const record=JSON.parse(await fs.readFile(path.join(directory,file),'utf8'));
      if(record.parent_scope_id!==plan.scope_id)continue;
      const done=proof.resolved?.[record.parent_task_id];
      if(done?.integration_commit&&done.source_commit===record.source_commit&&done.sha===record.integration_commit) {
        assignments.push({...record,status:'INTEGRATED'});continue;
      }
      if(record.phase==='INTEGRATED') {
        assignments.push({...record,status:'UNKNOWN',error:{code:'INTEGRATION_PROOF_MISSING',message:'Интеграция не подтверждена историей main.'}});continue;
      }
      try {
        const status=await this.plans.call(workspace,'assignment:status',['--id',record.id]);
        const childGit=await this.git(record.worktree,['rev-parse','--absolute-git-dir']);
        assignments.push({...record,...status,commandActive:await commandActivity(record.worktree)||await exists(path.join(childGit,'workflow-kit','operation.lock')),
          dirty:!!await this.git(record.worktree,['status','--porcelain'])});
      }catch(error){assignments.push({...record,status:'UNKNOWN',error:{code:error.code,message:error.message}});}
    }
    const pending=await exists(path.join(gitDir,'workflow-kit','transaction.json'));
    const committed=await this.git(workspace,['show','HEAD:'+planFile]);
    const unchanged=text===(await fs.readFile(path.join(workspace,planFile),'utf8'));
    const head=await this.git(workspace,['rev-parse','HEAD']);
    const integrated=proof.resolved?.[integration.task_id];
    integration.committed=!!integrated?.integration_commit&&integrated.sha===head&&integrated.source_commit===integration.source_commit;
    return {workspace,plan,head,assignments,integration,
      mainClean:!await this.git(workspace,['status','--porcelain']),
      commandActive:await commandActivity(workspace)||await exists(path.join(gitDir,'workflow-kit','operation.lock')),
      confirmed:unchanged&&!pending&&committed===text.trim()&&!reviewBlocksExecution(readReview(workspace),plan.scope_id)};
  }
  async create(workspace,plan,task,id,base) {
    const directory=path.join(path.dirname(workspace),'.web-pilot-worktrees',createHash('sha256').update(workspace).digest('hex').slice(0,16));
    await fs.mkdir(directory,{recursive:true});
    return this.plans.call(workspace,'assignment:create',['--expected-revision',String(plan.plan_revision)],
      {id,task_id:task.id,base_commit:base,worktree:path.join(directory,id)});
  }
  setupAssignment(workspace,id) {return this.plans.call(workspace,'assignment:setup',['--id',id,'--npm-ci'],null,{timeout:600000});}
  continueIntegration(workspace,id) {return this.plans.call(workspace,'integration:continue',['--id',id],null,{timeout:600000});}
  integrate(workspace,assignment) {return this.plans.call(workspace,'integration:start',[],
    {id:assignment.id,source_commit:assignment.source_commit},{timeout:600000});}
}
