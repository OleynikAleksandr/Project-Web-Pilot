// Authorization belongs to a project and its current scope. Session ledgers
// survive OFF/restart, but never grant permission to another project or plan.
export class ProjectAutoPlan {
  constructor({saved={},onChange=()=>{},identity=null,ownsSession=()=>true}={}) {
    this.book={};this.onChange=onChange;this.identity=identity;this.ownsSession=ownsSession;
    for(const [workspace,value] of Object.entries(saved??{}))if(workspace.startsWith('/')||/^[A-Za-z]:[\\/]/.test(workspace)) {
      if(value&&typeof value.scopeId==='string'&&value.sessions&&typeof value.sessions==='object'&&!Array.isArray(value.sessions))
        this.book[workspace]={projectId:value.projectId??null,scopeId:value.scopeId,enabled:value.enabled===true,sessionId:typeof value.sessionId==='string'?value.sessionId:null,sessions:structuredClone(value.sessions),awaitingPlan:value.scopeId===''&&value.awaitingPlan===true};
    }
  }
  state(workspace){
    const state=this.book[workspace];if(!state||!this.identity)return state;
    const id=this.identity(workspace);if(!id)return undefined;
    if(!state.projectId) {
      // Pre-identity permissions migrate only with the same registered chat.
      if(!state.sessionId||!this.ownsSession(workspace,state.sessionId))return undefined;
      state.projectId=id;
    }
    return state.projectId===id?state:undefined;
  }
  enabled(workspace,scopeId){const state=this.state(workspace);return !!state&&state.scopeId===(scopeId??'')&&state.enabled===true&&(!!scopeId||state.awaitingPlan===true);}
  sync(workspace,scopeId,{complete=false,confirmed=false}={}) {
    if(!workspace||(this.identity&&!this.identity(workspace)))return false;
    const old=this.state(workspace);
    if(!scopeId) {if(old?.enabled&&!old.awaitingPlan){old.enabled=false;this.onChange(workspace);}return this.enabled(workspace,null);}
    if(old?.scopeId!==scopeId){this.book[workspace]={projectId:this.identity?.(workspace)??null,scopeId,enabled:old?.awaitingPlan===true&&old.enabled===true,sessionId:old?.awaitingPlan?old.sessionId:null,sessions:Object.fromEntries(Object.entries(old?.sessions??{}).filter(([,entry])=>entry.automationCheckpoint).map(([id,entry])=>[id,{automationCheckpoint:entry.automationCheckpoint}]))};this.onChange(workspace);}
    const state=this.state(workspace);
    if(complete&&confirmed&&state.enabled){state.enabled=false;this.onChange(workspace);}
    return this.enabled(workspace,scopeId);
  }
  set(workspace,scopeId,choice,sessionId=null){
    if(!workspace||(this.identity&&!this.identity(workspace)))return false;
    if(!scopeId){this.book[workspace]={projectId:this.identity?.(workspace)??null,scopeId:'',enabled:choice===true,awaitingPlan:true,sessionId,sessions:this.state(workspace)?.sessions??{}};this.onChange(workspace);return choice===true;}
    this.sync(workspace,scopeId);const state=this.state(workspace);
    if(state.enabled!==(choice===true)||(choice&&sessionId&&state.sessionId!==sessionId)){state.enabled=choice===true;if(choice&&sessionId)state.sessionId=sessionId;this.onChange(workspace);}return state.enabled;
  }
  checkpoint(workspace,scopeId,sessionId){return this.state(workspace)&&this.state(workspace).scopeId===scopeId?this.state(workspace).sessions[sessionId]??{}:{};}
  saveCheckpoint(workspace,scopeId,sessionId,patch) {
    if(!this.state(workspace)||this.state(workspace).scopeId!==scopeId||!this.ownsSession(workspace,sessionId))return;
    this.state(workspace).sessions[sessionId]={...this.checkpoint(workspace,scopeId,sessionId),...patch};this.onChange(workspace);
  }
  snapshot(){return structuredClone(this.book);}
}
