import { AutoPlan } from './auto-plan.mjs';
import { AutomationSendState } from './automation-send-state.mjs';
import { PlanMonitor } from './plan-monitor.mjs';

// The same controller runs for visible and hidden main chats. Its sender,
// watcher, checkpoint and current plan always address its own saved identity.
export function configureProjectAutoPlan(record,{store,authorization,inspectPlan,onChange,log=()=>{}}) {
  if(record.primaryAutomation||!record.identity||record.identity.assignmentId)return record.primaryAutomation;
  let monitor,flow;
  const selected=()=>{const project=record.project(),info=monitor?.view(project);return project&&{...project,...info,scopeId:info?info.scopeId:authorization.state(project.workspace)?.scopeId};};
  const permitted=p=>authorization.enabled(p.workspace,p.scopeId)&&authorization.state(p.workspace)?.sessionId===p.sessionId;
  const save=patch=>{const project=selected();authorization.saveCheckpoint(project.workspace,project.scopeId,project.sessionId,patch);};
  const automation=new AutomationSendState({save:checkpoint=>save({automationCheckpoint:checkpoint})});
  const complete=()=>{const project=selected();authorization.sync(project.workspace,project.scopeId,{complete:true,confirmed:true});};
  flow=new AutoPlan({selected,inspectPlan,log,onChange,onComplete:complete,
    available:()=>{const p=selected();return !!p&&!p.archivedAt&&!p.sessionArchivedAt&&!record.disposed&&record.ready&&!record.loading
      &&!record.composer.inFlight&&!record.controller.pending&&permitted(p)&&!!monitor?.view(record.project())
      &&p.planExecution?.execution_strategy!=='parallel'&&['delivered','stale','manual-session'].includes(record.controller.state.phase);},
    saveCheckpoint:checkpoint=>save({autoPlanCheckpoint:checkpoint}),
    send:(text,canContinue,onBeforeSend)=>automation.send({selected:selected(),page:flow.page,kind:'plan',ready:canContinue,
      perform:()=>record.composer.sendUserMessage({text,canContinue,onBeforeSend,waitForAcknowledgement:false,cleanupOnCancel:true})})});
  let savedScope;
  const update=()=>{
    const p=selected();if(!p)return;
    authorization.sync(p.workspace,p.scopeId);
    const enabled=permitted(p);
    if(savedScope!==p.scopeId) {savedScope=p.scopeId;const saved=authorization.checkpoint(p.workspace,p.scopeId,p.sessionId);
      automation.restore(saved.automationCheckpoint);flow.restore(enabled,saved.autoPlanCheckpoint);}
    else if(enabled!==flow.enabled) {if(enabled)void flow.start();else if(flow.state.phase!=='complete')flow.disable();}
    flow.availabilityChanged();
  };
  let refreshing=null,again=false;
  const changed=()=>{
    update();if(refreshing){again=true;return;}
    refreshing=(async()=>{do {again=false;const p=selected();if(!p)continue;
      try {const checked=await inspectPlan(p);
        if(record.disposed||selected()?.scopeId!==checked.scopeId)continue;
        const done=checked.confirmed&&checked.planView?.tasks?.length>0&&checked.planView.tasks.every(t=>t.status==='done');
        if(done){flow.complete();authorization.sync(p.workspace,checked.scopeId,{complete:true,confirmed:true});}
        else void flow.planChanged();
      }catch{void flow.planChanged();}
    }while(again&&!record.disposed);})().finally(()=>{refreshing=null;});
  };
  monitor=new PlanMonitor({selected:record.project,inspect:(workspace,id)=>store.inspect(workspace,id),onChange:()=>{changed();onChange();},
    onInputsChanged:()=>record.controller.projectChanged(),onError:onChange});
  record.primaryAutomation={flow,automation,monitor,update,changed,observe:event=>{update();automation.observe(selected(),event);flow.observe(event);}};
  const p=selected(),saved=authorization.checkpoint(p.workspace,p.scopeId,p.sessionId);
  automation.restore(saved.automationCheckpoint);flow.restore(permitted(p),saved.autoPlanCheckpoint);
  monitor.observeSelection();
  record.cleanups.push(()=>{flow.dispose();monitor.close();});return record.primaryAutomation;
}
