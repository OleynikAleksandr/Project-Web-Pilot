import { AutoPlan } from './auto-plan.mjs';
import { AutomationSendState } from './automation-send-state.mjs';
import { PlanMonitor } from './plan-monitor.mjs';
import { ProjectInputWatch } from './project-input-watch.mjs';

export function executorPageState(record) {
  const project=record?.project(),page=record?.pageState.current?.state;
  const stopped=!!project?.chatUrl&&!record.disposed&&!record.loading&&record.ready
    &&page?.url===project.chatUrl&&!page.busy&&!page.connectionError&&page.lastMessageRole==='assistant'
    &&!record.controller.pending&&!record.composer.inFlight;
  return {stopped,canSend:stopped&&page.editorAvailable&&page.writable&&!page.draftPresent};
}

// Each assigned task keeps its own continuation ledger and plan watcher. Neither
// selecting a different page nor opening Settings changes this controller.
export function configureExecutor(record,{store,inspectPlan,enabled,onChange,signal,log=()=>{}}) {
  if(record.executor)return record.executor;
  const saved=record.project(),checkpoint=saved.executionAutomation??{};
  let monitor,lastSafety,lastStopped;
  const selected=()=>{const project=record.project();return project&&{...project,...monitor?.view(project)};};
  const automation=new AutomationSendState({save:automationCheckpoint=>store.saveExecutorAutomation(
    saved.workspace,saved.sessionId,{automationCheckpoint})});
  automation.restore(checkpoint.automationCheckpoint);
  const flow=new AutoPlan({selected,inspectPlan:async project=>{
    const plan=await inspectPlan(project);
    return {...plan,confirmed:plan.confirmed&&plan.scopeId==='assignment-'+saved.assignmentId
      &&plan.planView?.tasks?.length===1&&plan.planView.tasks[0].id===saved.taskId
      &&(!plan.nextTask||plan.nextTask.id===saved.taskId)};
  },
    available:()=>!!record.project()&&!record.disposed&&record.ready&&!record.loading&&!record.composer.inFlight
      &&!record.controller.pending&&['delivered','stale','manual-session'].includes(record.controller.state.phase),
    saveCheckpoint:autoPlanCheckpoint=>store.saveExecutorAutomation(saved.workspace,saved.sessionId,{autoPlanCheckpoint}),
    onChange,log,send:(text,canContinue,onBeforeSend)=>automation.send({selected:selected(),page:flow.page,
      ready:canContinue,perform:()=>record.composer.sendUserMessage({text,canContinue,onBeforeSend,
        waitForAcknowledgement:false,cleanupOnCancel:true})})});
  monitor=new PlanMonitor({selected:record.project,inspect:(workspace,id)=>store.inspect(workspace,id),
    onChange:()=>{void flow.planChanged();signal();onChange();},
    onInputsChanged:()=>{record.controller.projectChanged();signal();},
    onError:error=>{record.error=error;onChange();}});
  const activityWatch=new ProjectInputWatch({workspace:saved.workspace,onSignal:signal,
    onError:error=>{if(error){record.error=error;onChange();}}});
  activityWatch.update(['.harness/runtime/command-activity/']);
  record.executor={flow,monitor,observe:event=>{
    automation.observe(selected(),event);flow.observe(event);
    const safety=JSON.stringify([event.documentId,event.state?.url,event.state?.busy,event.state?.lastMessageRole,event.state?.connectionError]);
    if(safety!==lastSafety){lastSafety=safety;signal();}
  },
    setEnabled:value=>{if(value)void flow.start();else flow.disable();},
    changed:()=>{
      flow.availabilityChanged();const stopped=executorPageState(record).stopped;
      if(stopped!==lastStopped){lastStopped=stopped;signal();}
    }};
  record.controller.onIdle=()=>record.executor.changed();
  flow.restore(enabled,checkpoint.autoPlanCheckpoint);monitor.observeSelection();
  record.cleanups.push(()=>{record.controller.onIdle=null;flow.dispose();monitor.close();activityWatch.close();});
  return record.executor;
}
