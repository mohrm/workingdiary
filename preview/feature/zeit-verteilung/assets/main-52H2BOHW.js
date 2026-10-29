var T={UNASSIGNED:"nicht zugeordnet",OFFICE:"B\xFCro",MOBILE:"mobil"},tt=Object.values(T).filter(n=>n!==T.UNASSIGNED),R={[T.UNASSIGNED]:"kein",[T.OFFICE]:T.OFFICE,[T.MOBILE]:T.MOBILE};var z=class n{hour;minute;static now(){let t=new Date;return new n(t.getHours(),t.getMinutes())}constructor(t,i){this.hour=t,this.minute=i}inMinutes(){return 60*this.hour+this.minute}industrial(){return this.inMinutes()/60}industrialQuarterPrecision(){return Math.round(4*this.industrial())/4}formattedString(){return this.hour.toString().padStart(2,"0")+":"+this.minute.toString().padStart(2,"0")}toJSON(){return{hour:this.hour,minute:this.minute}}static fromJSON(t){return new n(t.hour,t.minute)}};var P=class n{name;minutes;constructor(t,i){this.name=t,this.minutes=i}toJSON(){return{name:this.name,minutes:this.minutes}}static fromJSON(t){return new n(t.name,t.minutes)}};function Y(n){return Math.round(100*n)}function et(n){return Math.round(n*100/60)}var k=class n{startTime;endTime;location;constructor(t,i,e=T.UNASSIGNED){this.startTime=t,this.endTime=i,this.location=e}formattedString(){return`${`${this.startTime.formattedString()} - ${this.endTime.formattedString()}`} (${this.location})`}durationInMinutes(){return this.endTime.inMinutes()-this.startTime.inMinutes()}toJSON(){return{startTime:this.startTime.toJSON(),endTime:this.endTime.toJSON(),location:this.location}}static fromJSON(t){return new n(z.fromJSON(t.startTime),z.fromJSON(t.endTime),t.location??T.UNASSIGNED)}};var j=class{initPlans(){let t={};return localStorage.setItem("plans",JSON.stringify(t)),t}loadPlans(){let t=localStorage.getItem("plans");return t?JSON.parse(t):this.initPlans()}initDay(t,i){let e={};return t[i]=e,localStorage.setItem("plans",JSON.stringify(t)),e}loadDayPlan(t){let i=this.loadPlans();return i[t]||this.initDay(i,t),i}saveStartTime(t,i){let e=this.loadDayPlan(t);i?e[t].startTime=i:e[t].startTime=void 0,localStorage.setItem("plans",JSON.stringify(e))}loadStartTime(t){let e=this.loadDayPlan(t)[t].startTime;if(e)return new z(e.hour,e.minute)}saveSections(t,i){let e=this.loadDayPlan(t);e[t].sections=i,localStorage.setItem("plans",JSON.stringify(e))}loadSections(t){let e=this.loadDayPlan(t)[t].sections;if(e)return e.map(r=>k.fromJSON(r))}saveActivities(t,i){let e=this.loadDayPlan(t);e[t].activities=i,localStorage.setItem("plans",JSON.stringify(e))}loadActivities(t){return this.loadDayPlan(t)[t].activities}saveTimeDistribution(t,i){let e=this.loadDayPlan(t);e[t].timeDistribution=i.map(r=>r.toJSON()),localStorage.setItem("plans",JSON.stringify(e))}loadTimeDistribution(t){let i=this.loadDayPlan(t)[t].timeDistribution;if(i)return i.map(e=>P.fromJSON(e))}recentActivityNames(t,i){let e=this.loadPlans(),r=this.parseGermanDate(t),o=new Date(r.getFullYear(),r.getMonth()-i,r.getDate()),a=[];for(let l in e){let c=this.parseGermanDate(l);if(c<o||c>r)continue;let p=(e[l].timeDistribution??[]).map(v=>v.name).filter(v=>v.length>0);p.length>0&&a.push({day:c,names:p})}a.sort((l,c)=>c.day.getTime()-l.day.getTime());let u=new Set,d=[];for(let l of a)for(let c of l.names)u.has(c)||(u.add(c),d.push(c));return d}previousDay(t){let i=this.loadPlans(),e=this.parseGermanDate(t),r=[];for(let o in i){let a=this.parseGermanDate(o);a<e&&r.push(a)}if(r.length>0){let o=new Date(Math.max(...r.map(a=>a.getTime())));return this.formatGermanDate(o)}else return t}nextDay(t){let i=this.loadPlans(),e=this.parseGermanDate(t),r=[];for(let o in i){let a=this.parseGermanDate(o);a>e&&r.push(a)}if(r.length>0){let o=new Date(Math.min(...r.map(a=>a.getTime())));return this.formatGermanDate(o)}else return t}parseGermanDate(t){let[i,e,r]=t.split(".").map(Number);return new Date(r,e-1,i)}formatGermanDate(t){return t.toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit",year:"numeric"})}},f=new j;function nt(n){let t=document.createElement("table");t.className="abschnitt-summe";let i=f.loadSections(n)??[];function e(l){return i.filter(c=>!l||c.location===l).map(c=>c.durationInMinutes()).reduce((c,p)=>c+p,0)}function r(l){let c=Math.floor(l/60),p=l-60*c;return new z(c,p)}function o(l){return(typeof l=="number"?l:l.industrial()).toFixed(2)}function a(l,c,p){let v=p?` data-testid="${p}"`:"",L=p?`${p}-industry-combined`:void 0,w=L?` data-testid="${L}"`:"";return`
          <tr>
            <td>${l}</td>
            <td${v}>${c.formattedString()}</td>
            <td${w}>${o(c)} / ${o(c.industrialQuarterPrecision())}</td>
          </tr>`}function u(){let l=r(e()),c=tt.map(p=>a(p,r(e(p)))).join("");t.innerHTML=`
      <thead align="center">
        <tr>
          <th>Arbeitsort</th>
          <th>Gesamtdauer</th>
          <th>Industriezeit (exakt/gerundet)</th>
        </tr>
      </thead>
      <tbody align="center">${c}${a("Gesamt",l,"fullduration")}
      </tbody>`}function d(l){n=l,i=f.loadSections(n)??[],u()}return u(),{element:t,update:d}}function K(){return new URLSearchParams(window.location.search).get("view")==="zeit-verteilung"?"zeit-verteilung":"day-plan"}function U(n,t){return t==="zeit-verteilung"?`/?day=${n}&view=zeit-verteilung`:`/?day=${n}`}var wt={check:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>',close:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/></svg>',edit:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>',info:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>',delete:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>',login:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M11 7L9.6 8.4l2.6 2.6H2v2h10.2l-2.6 2.6L11 17l5-5-5-5zm9 12h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-8v2h8v14z"/></svg>',logout:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg>',chart:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M11 2v20c-5.07-.5-9-4.79-9-10s3.93-9.5 9-10zm2.03 0v8.99H22c-.47 4.74-4.24 8.52-8.97 9v-9H13V2z"/></svg>',"arrow-back":'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>'};function g(n){return wt[n]||""}var it={"end-before-start":"Die Enduhrzeit darf nicht vor der Startuhrzeit liegen.",overlap:"Der Abschnitt \xFCberschneidet sich zeitlich mit einem anderen Abschnitt."};function Et(n,t){return n.startTime.inMinutes()<t.endTime.inMinutes()&&t.startTime.inMinutes()<n.endTime.inMinutes()}function Q(n,t){if(n.endTime.inMinutes()<n.startTime.inMinutes())return{type:"end-before-start",message:it["end-before-start"]};if(t.some(i=>Et(n,i)))return{type:"overlap",message:it.overlap}}function N(n,t){for(let[i,e]of Object.entries(t))n.querySelector(`[data-action="${i}"]`)?.addEventListener("click",e)}function at(n,t,i,e,r,o,a){let u=document.createElement("div");u.className="abschnitt-host";let d=n?.startTime?.hour??0,l=n?.startTime?.minute??0,c=n?.endTime?.hour??0,p=n?.endTime?.minute??0,v=n?.location??T.UNASSIGNED;function L(_,S,m){return i?`<input class="abschnitt-time-cell" type="number" min="0" max="${m}" value="${_}" ${S} />`:`<span class="abschnitt-time-cell" ${S}>${_.toString().padStart(2,"0")}</span>`}function w(){return i?`
        <select class="abschnitt-location-cell" data-location>
          <option value="${T.UNASSIGNED}" ${v===T.UNASSIGNED?"selected":""}>${R[T.UNASSIGNED]}</option>
          <option value="${T.OFFICE}" ${v===T.OFFICE?"selected":""}>${R[T.OFFICE]}</option>
          <option value="${T.MOBILE}" ${v===T.MOBILE?"selected":""}>${R[T.MOBILE]}</option>
        </select>`:`<span class="abschnitt-location-cell" data-location>${R[v]}</span>`}function M(){return i?`
        <div class="abschnitt-icon-zone">
          <span data-action="abort">${g("close")}</span>
          <span data-action="finish">${g("check")}</span>
          <span data-action="delete">${g("delete")}</span>
        </div>`:`
      <div class="abschnitt-icon-zone">
        <span data-action="edit">${g("edit")}</span>
        <span data-action="delete">${g("delete")}</span>
      </div>`}function $(){u.classList.toggle("abschnitt-edit",i);let _=L(d,"data-start-hour",23)+'<span class="abschnitt-time-sep">:</span>'+L(l,"data-start-minute",59)+'<span class="abschnitt-time-sep abschnitt-time-sep--range"> - </span>'+L(c,"data-end-hour",23)+'<span class="abschnitt-time-sep">:</span>'+L(p,"data-end-minute",59);u.innerHTML=`
      <div class="abschnitt-row">
        <div class="abschnitt-time-range">${_}</div>
        ${w()}
        ${M()}
      </div>`,O()}function O(){i?(u.querySelector("[data-start-hour]")?.addEventListener("input",_=>{d=parseInt(_.target.value,10)||0}),u.querySelector("[data-start-minute]")?.addEventListener("input",_=>{l=parseInt(_.target.value,10)||0}),u.querySelector("[data-end-hour]")?.addEventListener("input",_=>{c=parseInt(_.target.value,10)||0}),u.querySelector("[data-end-minute]")?.addEventListener("input",_=>{p=parseInt(_.target.value,10)||0}),u.querySelector("[data-location]")?.addEventListener("change",_=>{v=_.target.value}),N(u,{finish:()=>{let _=new z(d,l),S=new z(c,p),m=new k(_,S,v),h=o?.(m);if(h){a?.(h);return}t&&t(m),e&&e(!1)},abort:()=>{e&&e(!1)},delete:()=>{r&&r()}})):N(u,{edit:()=>{d=n?.startTime?.hour??0,l=n?.startTime?.minute??0,c=n?.endTime?.hour??0,p=n?.endTime?.minute??0,v=n?.location??T.UNASSIGNED,e&&e(!0)},delete:()=>{r&&r()}})}function I(_,S){n=_,i=S,d=n?.startTime?.hour??0,l=n?.startTime?.minute??0,c=n?.endTime?.hour??0,p=n?.endTime?.minute??0,v=n?.location??T.UNASSIGNED,$()}return $(),{element:u,update:I}}function rt(n,t){let i=document.createElement("div");i.className="abschnitt-liste-host abschnitt-liste";let e=f.loadSections(n)??[],r=[],o=-1,a,u;function d(){f.saveSections(n,e),t?.(e)}function l(m){let h=Q(m,e);return h?(u=h,I(),!1):(e=[...e,m],a=void 0,u=void 0,d(),I(),!0)}function c(m){a={section:e[m],index:m},e=e.filter((h,x)=>x!==m),m===o?o=-1:m<o&&(o-=1),d(),I()}function p(){if(!a)return;let{section:m,index:h}=a;a=void 0,e=[...e.slice(0,h),m,...e.slice(h)],h<=o&&(o+=1),d(),I()}function v(m,h){e=e.map((x,F)=>F===m?h:x),a=void 0,u=void 0,d(),o=-1,I()}function L(m){u=m,I()}function w(){u=void 0,I()}function M(){a=void 0,I()}function $(){return u?`
      <div class="abschnitt-liste__undo-toast abschnitt-liste__validation-toast" data-testid="validation-toast" role="alert">
        <span>${u.message}</span>
        <button type="button" class="abschnitt-liste__undo-close" data-action="dismiss-validation" aria-label="Meldung ausblenden">${g("close")}</button>
      </div>`:""}function O(){return a?`
      <div class="abschnitt-liste__undo-toast" data-testid="undo-toast" role="status">
        <span>Abschnitt gel\xF6scht.</span>
        <button type="button" class="abschnitt-liste__undo-button" data-action="undo">R\xFCckg\xE4ngig</button>
        <button type="button" class="abschnitt-liste__undo-close" data-action="dismiss-undo" aria-label="Meldung ausblenden">${g("close")}</button>
      </div>`:""}function I(){r.forEach(m=>{m.element.remove()}),r=[],i.innerHTML=`
      <div class="abschnitt-row abschnitt-liste__header">
        <div class="abschnitt-time-range">
          <span class="abschnitt-time-cell">Start</span>
          <span class="abschnitt-time-sep abschnitt-liste__header-filler" aria-hidden="true">:</span>
          <span class="abschnitt-time-cell abschnitt-liste__header-filler" aria-hidden="true"></span>
          <span class="abschnitt-time-sep abschnitt-time-sep--range" aria-hidden="true"> - </span>
          <span class="abschnitt-time-cell">Ende</span>
          <span class="abschnitt-time-sep abschnitt-liste__header-filler" aria-hidden="true">:</span>
          <span class="abschnitt-time-cell abschnitt-liste__header-filler" aria-hidden="true"></span>
        </div>
        <span class="abschnitt-location-cell abschnitt-liste__header-location">Arbeitsort</span>
      </div>
      <ul class="abschnitt-liste__list mat-list">
        ${e.map((m,h)=>`
          <li class="mat-list-item abschnitt-item" data-index="${h}" data-testid="section-${h}"></li>
        `).join("")}
      </ul>
      ${O()}
      ${$()}`,i.querySelectorAll("[data-index]").forEach(m=>{let h=parseInt(m.dataset.index,10),x=e[h],V=at(x,s=>v(h,s),h===o,s=>{s?o=h:o=-1,I()},()=>c(h),s=>Q(s,e.filter((b,E)=>E!==h)),s=>L(s));V.element.classList.add("abschnitt-cell"),m.appendChild(V.element),r.push(V)}),_()}function _(){i.querySelector('[data-action="undo"]')?.addEventListener("click",p),i.querySelector('[data-action="dismiss-undo"]')?.addEventListener("click",M),i.querySelector('[data-action="dismiss-validation"]')?.addEventListener("click",w)}function S(m){n=m,e=f.loadSections(n)??[],o=-1,a=void 0,u=void 0,I()}return I(),{element:i,update:S,addAbschnitt:l}}function ot(n,t){let i=document.createElement("div");i.className="stempeluhr";let e=f.loadStartTime(n),r=!1,o=e?.hour??0,a=e?.minute??0;function u(){return e?r?`<span class="stempeluhr__time-inputs">
                 <input type="number" min="0" max="23" value="${o}" data-hour />
                 :
                 <input type="number" min="0" max="59" value="${a}" data-minute />
                 <span data-action="finish">${g("check")}</span>
                 <span data-action="abort">${g("close")}</span>
               </span>`:`<span class="stempeluhr__time-display" data-testid="login-time">
               ${e.formattedString()}
               <span data-action="edit">${g("edit")}</span>
             </span>`:'<i class="stempeluhr__placeholder">noch nicht eingestempelt</i>'}function d(){i.innerHTML=`
      <span class="stempeluhr__label">Eingestempelt um:</span>
      <div class="stempeluhr__value">${u()}</div>
      <button class="mat-button stempeluhr__button" data-testid="log-button">
        <span data-action>${e?g("logout"):g("login")}</span>
        <span class="stempeluhr__button-label">${e?"Ausstempeln":"Einstempeln"}</span>
      </button>`,l()}function l(){if(r){let p=i.querySelector("[data-hour]"),v=i.querySelector("[data-minute]");p&&p.addEventListener("input",L=>{o=parseInt(L.target.value,10)||0}),v&&v.addEventListener("input",L=>{a=parseInt(L.target.value,10)||0}),N(i,{finish:()=>{e=new z(o,a),r=!1,f.saveStartTime(n,e),d()},abort:()=>{r=!1,o=e?.hour??0,a=e?.minute??0,d()}})}else N(i,{edit:()=>{o=e?.hour??0,a=e?.minute??0,r=!0,d()}});i.querySelector('[data-testid="log-button"]')?.addEventListener("click",()=>{if(!e)e=z.now(),f.saveStartTime(n,e),d();else{let p=new k(e,z.now());if(t&&t(p)===!1)return;e=void 0,f.saveStartTime(n,e),d()}})}function c(p){n=p,e=f.loadStartTime(n),r=!1,o=e?.hour??0,a=e?.minute??0,d()}return d(),{element:i,update:c}}function st(n,t,i){let e=document.createElement("section");e.className="day-plan";let r,o;function a(){e.innerHTML=`
      <header class="day-plan__header">
        <h1 data-testid="dayplan-title"></h1>
        <a class="day-plan__verteilung-link mat-button" data-testid="open-zeitverteilung" href="${U(n,"zeit-verteilung")}" title="Zeit verteilen" aria-label="Zeitverteilung \xF6ffnen">${g("chart")}</a>
      </header>`,e.querySelector('[data-testid="open-zeitverteilung"]')?.addEventListener("click",d=>{i&&(d.preventDefault(),i())}),e.querySelector('[data-testid="dayplan-title"]').textContent=`Tagesplan f\xFCr den ${n}`,o=rt(n,t),r=ot(n,d=>o.addAbschnitt(d)),r.element.classList.add("day-plan__clock"),o.element.classList.add("day-plan__list"),e.appendChild(r.element),e.appendChild(o.element)}function u(d){n=d,e.querySelector('[data-testid="dayplan-title"]').textContent=`Tagesplan f\xFCr den ${n}`;let l=e.querySelector('[data-testid="open-zeitverteilung"]');l&&(l.href=U(n,"zeit-verteilung")),r?.update(d),o?.update(d)}return a(),{element:e,update:u}}function lt(){let n=document.createElement("a");n.className="download-plans",n.textContent="Daten exportieren";function t(){let i=f.loadPlans(),e=JSON.stringify(i),r=new Blob([e],{type:"application/json"}),o=URL.createObjectURL(r),a=new Date,u=c=>c.toString().padStart(2,"0"),l=`dayplans_${a.getFullYear()+"-"+u(a.getMonth()+1)+"-"+u(a.getDate())+"_"+u(a.getHours())+"-"+u(a.getMinutes())+"-"+u(a.getSeconds())}.json`;n.setAttribute("href",o),n.setAttribute("download",l)}return t(),{element:n}}var ct="2026-10-29 08:32:04 +0000",ut="af75eca",dt="https://github.com/mohrm/workingdiary/commit/af75eca";function mt(){return ct}function pt(){return ut}function ft(){return dt}function ht(){let n=document.createElement("div");n.className="version-info",n.innerHTML=`
    <button type="button" class="version-info__button" data-testid="version-info" aria-label="Informationen anzeigen">
      ${g("info")}
    </button>
    <dialog class="version-info__dialog" data-testid="version-info-dialog" aria-labelledby="version-info-title">
      <h2 class="version-info__title" id="version-info-title">Informationen</h2>
      <p class="version-info__entry">Zuletzt ge\xE4ndert: ${mt()}</p>
      <p class="version-info__entry">Commit: <a href="${ft()}">${pt()}</a></p>
      <p class="version-info__entry">Viewport pr\xFCfen: <a href="https://mohrm.github.io/viewport-checker/" target="_blank" rel="noopener">mohrm.github.io/viewport-checker</a></p>
      <div class="version-info__actions">
        <div class="version-info__export" data-download-plans></div>
        <button type="button" class="version-info__close" data-testid="version-info-close">${g("close")}Schlie\xDFen</button>
      </div>
    </dialog>`;let t=n.querySelector('[data-testid="version-info"]'),i=n.querySelector('[data-testid="version-info-dialog"]'),e=n.querySelector('[data-testid="version-info-close"]');return t.addEventListener("click",()=>i.showModal()),e.addEventListener("click",()=>i.close()),i.addEventListener("click",r=>{r.target===i&&i.close()}),{element:n}}var W="nicht verteilte Zeit",gt="activity-history-months";function zt(n){let i=(f.loadSections(n)??[]).map(e=>e.durationInMinutes()).reduce((e,r)=>e+r,0);return et(i)}function $t(){let n=localStorage.getItem(gt),t=n===null?Number.NaN:parseInt(n,10);return Number.isInteger(t)&&t>0?t:3}function vt(n,t){let i=document.createElement("section");i.className="zeit-verteilung";let e="",r="",o="",a;function u(s){return s.map(b=>b.minutes).reduce((b,E)=>b+E,0)}function d(s){f.saveTimeDistribution(n,s)}function l(){return zt(n)}function c(s){return l()-u(s)}function p(s,b){let E=f.loadTimeDistribution(n)??[],A=s.trim();return A?A===W?(a="Diese T\xE4tigkeit ist reserviert.",S(),!1):E.some(C=>C.name===A)?(a="Diese T\xE4tigkeit gibt es schon.",S(),!1):b>c(E)?(a="So viel Zeit ist nicht mehr frei.",S(),!1):(a=void 0,d([...E,new P(A,b)]),S(),!0):(a="Bitte eine T\xE4tigkeit angeben.",S(),!1)}function v(){let s=e,b=L();e="",r="",o="",p(s,b)}function L(){return o!==""?Math.round(l()*M(o)/100):Y(M(r))}function w(s){if((f.loadTimeDistribution(n)??[]).some(C=>C.name===s)){a="Diese T\xE4tigkeit gibt es schon.",S();return}let E=L();p(s,E)&&(r="",o="",S())}function M(s){return parseFloat(s.replace(",","."))||0}function $(s){return(s/100).toFixed(2).replace(".",",")}function O(s){return $(Math.round(s/25)*25)}function I(s,b){return b===0?"0,0 %":`${(100*s/b).toFixed(1).replace(".",",")} %`}function _(s,b,E,A){let C=$(s.minutes),Z=I(s.minutes,A);return`
      <li class="zeit-verteilung__row mat-list-item" data-index="${b}">
        <span class="zeit-verteilung__name" data-testid="taetigkeit-${b}">${s.name}</span>
        <span class="zeit-verteilung__indizes" data-testid="taetigkeit-indizes-${b}">${C} / ${O(s.minutes)}</span>
        ${E?`<input class="zeit-verteilung__input zeit-verteilung__input--industrial" type="text" inputmode="decimal" value="${C}" data-edit-industriezeit aria-label="Industriezeit f\xFCr ${s.name}" />
               <input class="zeit-verteilung__input zeit-verteilung__input--percent" type="text" inputmode="decimal" value="${Z}" data-edit-prozent aria-label="Prozent f\xFCr ${s.name}" />`:`<span class="zeit-verteilung__value zeit-verteilung__input--industrial" data-testid="taetigkeit-industriezeit-${b}">${C}</span>
               <span class="zeit-verteilung__value zeit-verteilung__input--percent" data-testid="taetigkeit-prozent-${b}">${Z}</span>`}
        <div class="zeit-verteilung__icon-zone">
          ${E?`<span data-action="abort" role="button" aria-label="Abbrechen">${g("close")}</span>
                 <span data-action="finish" role="button" aria-label="\xDCbernehmen">${g("check")}</span>`:`<span data-action="edit" role="button" aria-label="Bearbeiten">${g("edit")}</span>`}
          <span data-action="delete" role="button" aria-label="${s.name} entfernen">${g("delete")}</span>
        </div>
      </li>`}function S(){let s=l(),b=f.loadTimeDistribution(n)??[],E=Math.max(0,c(b)),A=f.recentActivityNames(n,$t()).filter(y=>!b.some(D=>D.name===y));i.innerHTML=`
      <header class="zeit-verteilung__header">
        <h1 data-testid="zeitverteilung-title">Zeitverteilung f\xFCr den ${n}</h1>
        <button type="button" class="zeit-verteilung__back" data-action="back" data-testid="back-to-dayplan" aria-label="Zur\xFCck zum Tagesplan">${g("arrow-back")}</button>
      </header>
      <p class="zeit-verteilung__gesamt">
        Gesamtdauer: <span data-testid="zeitverteilung-gesamt">${$(s)}</span>
        <span class="zeit-verteilung__gesamt-rund">/ ${O(s)}</span>
        Industriezeit
      </p>
      <div class="zeit-verteilung__neu">
        <input class="zeit-verteilung__input" type="text" placeholder="Neue T\xE4tigkeit" value="${e}" data-testid="neue-taetigkeit" data-neue-taetigkeit />
        <input class="zeit-verteilung__input zeit-verteilung__input--industrial" type="text" inputmode="decimal" placeholder="Industriezeit" value="${r}" data-testid="neue-taetigkeit-industriezeit" aria-label="Industriezeit" />
        <input class="zeit-verteilung__input zeit-verteilung__input--percent" type="text" inputmode="decimal" placeholder="%" value="${o}" data-testid="neue-taetigkeit-prozent" aria-label="Prozent" />
        <button type="button" class="zeit-verteilung__add" data-action="add-freitext" data-testid="add-taetigkeit" aria-label="T\xE4tigkeit hinzuf\xFCgen">${g("check")}</button>
      </div>
      ${A.length>0?`<div class="zeit-verteilung__auswahl">
        <select class="zeit-verteilung__select" data-testid="taetigkeit-auswahl" aria-label="T\xE4tigkeit ausw\xE4hlen und mit der vorgegebenen Zeit hinzuf\xFCgen">
          <option value="" selected>T\xE4tigkeit ausw\xE4hlen\u2026</option>
          ${A.map(y=>`<option value="${y}">${y}</option>`).join("")}
        </select>
        <span class="zeit-verteilung__auswahl-hinweis">wird mit der vorgegebenen Zeit hinzugef\xFCgt</span>
      </div>`:""}
      <ul class="zeit-verteilung__liste mat-list">
        ${b.map((y,D)=>_(y,D,D===m,s)).join("")}
        <li class="zeit-verteilung__row zeit-verteilung__row--unverteilt mat-list-item">
          <span class="zeit-verteilung__name" data-testid="unverteilt-name">${W}</span>
          <span class="zeit-verteilung__indizes" data-testid="unverteilt-industriezeit">${$(E)} / ${O(E)}</span>
          <span class="zeit-verteilung__value zeit-verteilung__input--industrial" data-testid="unverteilt-minuten">${$(E)}</span>
          <span class="zeit-verteilung__value zeit-verteilung__input--percent" data-testid="unverteilt-prozent">${I(E,s)}</span>
          <div class="zeit-verteilung__icon-zone zeit-verteilung__icon-zone--leer"></div>
        </li>
      </ul>
      ${a?`<div class="zeit-verteilung__fehler" data-testid="zeitverteilung-fehler" role="alert">${a}</div>`:""}`,i.querySelector("[data-neue-taetigkeit]")?.addEventListener("input",y=>{e=y.target.value}),i.querySelector('[data-testid="neue-taetigkeit-industriezeit"]')?.addEventListener("input",y=>{r=y.target.value}),i.querySelector('[data-testid="neue-taetigkeit-prozent"]')?.addEventListener("input",y=>{o=y.target.value}),i.querySelector("[data-edit-industriezeit]")?.addEventListener("input",y=>{h=y.target.value}),i.querySelector("[data-edit-prozent]")?.addEventListener("input",y=>{x=y.target.value}),i.querySelector('[data-testid="taetigkeit-auswahl"]')?.addEventListener("change",y=>{let D=y.target.value;D&&w(D)}),b.forEach((y,D)=>{let q=i.querySelector(`[data-index="${D}"]`);q&&(q.querySelector('[data-action="edit"]')?.addEventListener("click",()=>{m=D,h=$(y.minutes),x="",a=void 0,S()}),q.querySelector('[data-action="abort"]')?.addEventListener("click",()=>{m=-1,h="",x="",S()}),q.querySelector('[data-action="finish"]')?.addEventListener("click",()=>{let X=f.loadTimeDistribution(n)??[],yt=X.filter((H,J)=>J!==D).map(H=>H.minutes).reduce((H,J)=>H+J,0),G;x!==""?G=Math.round(l()*M(x)/100):G=Y(M(h));let Lt=l()-yt;if(G>Lt){a="So viel Zeit ist nicht mehr frei.",S();return}a=void 0,d(X.map((H,J)=>J===D?new P(H.name,G):H)),m=-1,h="",x="",S()}),q.querySelector('[data-action="delete"]')?.addEventListener("click",()=>F(D)))}),N(i,{"add-freitext":v,back:()=>t?.()})}let m=-1,h="",x="";function F(s){let b=f.loadTimeDistribution(n)??[];d(b.filter((E,A)=>A!==s)),m===s&&(m=-1),S()}function V(s){n=s,e="",r="",o="",a=void 0,m=-1,S()}return S(),{element:i,update:V}}function Mt(){return new Date().toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit",year:"numeric"})}function bt(){return new URLSearchParams(window.location.search).get("day")??Mt()}function B(n,t="day-plan"){history.pushState({day:n},"",U(n,t))}function St(){let n=document.createElement("div");n.className="app-shell";let t=bt(),i=K(),e,r,o,a,u;function d(){n.innerHTML=`
      <main class="app-main" data-view></main>
      <div class="app-bottom">
        <div class="app-summary" data-abschnitt-summe></div>
        <section class="app-navigation">
          <div class="app-navigation__row">
            <a class="app-navigation__link" data-prev-link href="#">Zur\xFCck</a>
            <div class="app-navigation__spacer"></div>
            <a class="app-navigation__link" data-next-link href="#">Vor</a>
          </div>
        </section>
      </div>`,a=lt(),u=ht();let w=n.querySelector("[data-view]");i==="zeit-verteilung"?(r=vt(t,c),w.appendChild(r.element)):(e=st(t,()=>o?.update(t),l),w.appendChild(e.element),e.element.querySelector(".day-plan__header").appendChild(u.element)),o=nt(t),n.querySelector("[data-abschnitt-summe]").appendChild(o.element),n.querySelector("[data-download-plans]").appendChild(a.element),p()}function l(){i="zeit-verteilung",B(t,i),d()}function c(){i="day-plan",B(t,i),d()}function p(){let w=n.querySelector("[data-prev-link]"),M=n.querySelector("[data-next-link]");w?.addEventListener("click",$=>{$.preventDefault(),t=f.previousDay(t),B(t,i),v()}),M?.addEventListener("click",$=>{$.preventDefault(),t=f.nextDay(t),B(t,i),v()})}function v(){i==="zeit-verteilung"?r?.update(t):e?.update(t),o?.update(t),L()}function L(){let w=n.querySelector("[data-prev-link]"),M=n.querySelector("[data-next-link]");w&&(w.href=`/?day=${f.previousDay(t)}`),M&&(M.href=`/?day=${f.nextDay(t)}`)}return d(),{element:n,update(){t=bt();let w=K();w!==i&&(i=w,d()),v()}}}var Tt=document.querySelector("app-root");if(!Tt)throw new Error("Root element <app-root> not found");var _t=St();Tt.appendChild(_t.element);window.addEventListener("popstate",()=>_t.update());
//# sourceMappingURL=main-52H2BOHW.js.map
