import fs from 'node:fs';
import { safePath } from '@webpilot/workflow-kit/lib/common';
import { readReview, setReviewEnabled } from '@webpilot/workflow-kit/lib/plan-review';

const messages={IDLE:'',PREPARED:'Документы готовы к ревью.',RUNNING:'Claude проверяет документы.',
  AUTHOR_PENDING:'Основной агент рассматривает замечания.',AGREED:'Документы согласованы.',
  NEEDS_USER:'Нужно решение пользователя.',STALE:'Документы изменились; требуется обновить ревью.',
  CANCELLED:'Ревью отменено.',PUBLISHING:'Публикуется согласованный план.',PUBLISHED:'Согласованный план опубликован.'};

// Data comes from the checkout. Never import or execute a module from that checkout in the app.
export class PlanReviewClient {
  constructor({selected,onChange=()=>{},read=readReview,write=setReviewEnabled,
    supports=workspace=>fs.existsSync(safePath(workspace,'.harness/kit/lib/plan-review.mjs'))}) {
    Object.assign(this,{selected,onChange,read,write,supports});
    this.workspace=null;this.state=null;this.error=null;this.supported=false;this.signature='';
  }
  observeSelection() {
    const workspace=this.selected()?.workspace??null;
    if(workspace===this.workspace)return;
    this.workspace=workspace;this.refresh();
  }
  refresh() {
    this.error=null;this.state=null;this.supported=false;
    if(this.workspace)try{
      this.supported=this.supports(this.workspace);
      if(this.supported)this.state=this.read(this.workspace);
      else this.error='Для Review обновите Workflow Kit проекта через Доктор.';
    }catch(e){this.error=e.message;}
    const signature=JSON.stringify([this.workspace,this.state,this.error,this.supported]);
    if(signature!==this.signature){this.signature=signature;this.onChange();}
  }
  setEnabled({workspace,enabled}={}) {
    if(typeof enabled!=='boolean' || !workspace || workspace!==this.selected()?.workspace)
      throw Object.assign(new Error('Выбранный проект изменился. Повторите переключение Review.'),{code:'REVIEW_SELECTION_CHANGED'});
    this.observeSelection();
    if(!this.supported || this.error)throw Object.assign(new Error(this.error??'Review недоступен.'),{code:'REVIEW_UNAVAILABLE'});
    this.write(workspace,enabled);this.refresh();
    return this.view();
  }
  view() {
    const s=this.state,enabled=s?.enabled===true;
    return {enabled,supported:this.supported,error:this.error,stage:s?.stage??'IDLE',round:s?.round??0,
      message:this.error || s?.cleanup_error || (enabled?[s?.round?`Раунд ${s.round} из ${s.max_rounds??4}.`:'',messages[s?.stage]??'',s?.error?.message??''].filter(Boolean).join(' '):'')};
  }
}
