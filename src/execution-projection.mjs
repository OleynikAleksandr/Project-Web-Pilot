export function executorStatus(assignment,record,integration) {
  if(assignment?.status==='INTEGRATED')return {phase:'done',label:'Завершено · интеграция проверена'};
  if(integration?.assignment_id&&integration.assignment_id===assignment?.id&&integration.status!=='IDLE')
    return ['CONFLICT','CHECKS_FAILED','UNKNOWN'].includes(integration.status)
      ?{phase:'attention',label:integration.status==='UNKNOWN'?'Исход слияния неизвестен':'Нужно исправление в main'}
      :{phase:'merging',label:'Интегрируется'};
  if(record?.error)return {phase:'attention',label:record.error.message};
  if(record?.controller?.state?.error)return {phase:'attention',label:record.controller.state.error.message+' Повторите сверку или откройте чат.'};
  if(assignment?.error)return {phase:'attention',label:assignment.error.message};
  if(assignment?.status==='NEEDS_SETUP')return {phase:'setup',label:'Нужна подготовка worktree'};
  if(assignment?.status==='UNKNOWN')return {phase:'unknown',label:'Состояние требует сверки'};
  if(assignment?.commandActive)return {phase:'command',label:'Команда ещё не подтверждена как завершённая'};
  const page=record?.pageState.current?.state;
  if(!record||record.disposed||!page||record.loading)return {phase:'unknown',label:'Активность сейчас не наблюдается'};
  if(page.connectionError)return {phase:'unknown',label:'Нет подтверждённой связи с чатом'};
  if(page.busy)return {phase:'working',label:assignment?.status==='READY_FOR_INTEGRATION'?'Коммит готов · ответ продолжается':'Работает'};
  if(assignment?.status==='READY_FOR_INTEGRATION')return page.lastMessageRole==='assistant'
    ?{phase:'ready',label:'Готово к слиянию'}:{phase:'waiting',label:'Ждём завершения ответа'};
  if(page.login==='signed-out')return {phase:'waiting',label:'Нужен вход в ChatGPT'};
  if(page.draftPresent)return {phase:'waiting',label:'Черновик · отправка приостановлена'};
  return {phase:'waiting',label:'Пауза · задача не завершена'};
}

export function projectExecutors(projects,workspace,execution,recordFor) {
  return projects.filter(p=>p.parentWorkspace===workspace&&!p.archivedAt).flatMap(project=>project.sessions
    .filter(s=>s.assignmentId&&!s.archivedAt).map(session=>{
      const target={...project,...session},record=recordFor(target);
      const assignment=execution.assignments.find(a=>a.id===session.assignmentId);
      return {workspace:project.workspace,sessionId:session.sessionId,originSessionId:session.executionOriginSessionId,
        assignmentId:session.assignmentId,taskId:session.taskId,title:session.title,experience:session.experience,
        chatUrl:session.chatUrl,worktree:true,...executorStatus(assignment,record,execution.integration),
        sourceCommit:assignment?.source_commit??null,integrationCommit:assignment?.integration_commit??null,
        time:record?.executor?.clock.snapshot()??{...session.executionTime,phase:'unknown'}};
    }));
}
