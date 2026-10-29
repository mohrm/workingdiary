var T={UNASSIGNED:"nicht zugeordnet",OFFICE:"B\xFCro",MOBILE:"mobil"},tt=Object.values(T).filter(n=>n!==T.UNASSIGNED),J={[T.UNASSIGNED]:"kein",[T.OFFICE]:T.OFFICE,[T.MOBILE]:T.MOBILE};var E=class n{hour;minute;static now(){let t=new Date;return new n(t.getHours(),t.getMinutes())}constructor(t,i){this.hour=t,this.minute=i}inMinutes(){return 60*this.hour+this.minute}industrial(){return this.inMinutes()/60}industrialQuarterPrecision(){return Math.round(4*this.industrial())/4}formattedString(){return this.hour.toString().padStart(2,"0")+":"+this.minute.toString().padStart(2,"0")}toJSON(){return{hour:this.hour,minute:this.minute}}static fromJSON(t){return new n(t.hour,t.minute)}};var O=class n{name;minutes;constructor(t,i){this.name=t,this.minutes=i}toJSON(){return{name:this.name,minutes:this.minutes}}static fromJSON(t){return new n(t.name,t.minutes)}};function Z(n){return Math.round(100*n)}function et(n){return Math.round(n*100/60)}var D=class n{startTime;endTime;location;constructor(t,i,e=T.UNASSIGNED){this.startTime=t,this.endTime=i,this.location=e}formattedString(){return`${`${this.startTime.formattedString()} - ${this.endTime.formattedString()}`} (${this.location})`}durationInMinutes(){return this.endTime.inMinutes()-this.startTime.inMinutes()}toJSON(){return{startTime:this.startTime.toJSON(),endTime:this.endTime.toJSON(),location:this.location}}static fromJSON(t){return new n(E.fromJSON(t.startTime),E.fromJSON(t.endTime),t.location??T.UNASSIGNED)}};var Y=class{initPlans(){let t={};return localStorage.setItem("plans",JSON.stringify(t)),t}loadPlans(){let t=localStorage.getItem("plans");return t?JSON.parse(t):this.initPlans()}initDay(t,i){let e={};return t[i]=e,localStorage.setItem("plans",JSON.stringify(t)),e}loadDayPlan(t){let i=this.loadPlans();return i[t]||this.initDay(i,t),i}saveStartTime(t,i){let e=this.loadDayPlan(t);i?e[t].startTime=i:e[t].startTime=void 0,localStorage.setItem("plans",JSON.stringify(e))}loadStartTime(t){let e=this.loadDayPlan(t)[t].startTime;if(e)return new E(e.hour,e.minute)}saveSections(t,i){let e=this.loadDayPlan(t);e[t].sections=i,localStorage.setItem("plans",JSON.stringify(e))}loadSections(t){let e=this.loadDayPlan(t)[t].sections;if(e)return e.map(r=>D.fromJSON(r))}saveActivities(t,i){let e=this.loadDayPlan(t);e[t].activities=i,localStorage.setItem("plans",JSON.stringify(e))}loadActivities(t){return this.loadDayPlan(t)[t].activities}saveTimeDistribution(t,i){let e=this.loadDayPlan(t);e[t].timeDistribution=i.map(r=>r.toJSON()),localStorage.setItem("plans",JSON.stringify(e))}loadTimeDistribution(t){let i=this.loadDayPlan(t)[t].timeDistribution;if(i)return i.map(e=>O.fromJSON(e))}recentActivityNames(t,i){let e=this.loadPlans(),r=this.parseGermanDate(t),o=new Date(r.getFullYear(),r.getMonth()-i,r.getDate()),a=[];for(let s in e){let l=this.parseGermanDate(s);if(l<o||l>r)continue;let m=(e[s].timeDistribution??[]).map(S=>S.name).filter(S=>S.length>0);m.length>0&&a.push({day:l,names:m})}a.sort((s,l)=>l.day.getTime()-s.day.getTime());let c=new Set,u=[];for(let s of a)for(let l of s.names)c.has(l)||(c.add(l),u.push(l));return u}previousDay(t){let i=this.loadPlans(),e=this.parseGermanDate(t),r=[];for(let o in i){let a=this.parseGermanDate(o);a<e&&r.push(a)}if(r.length>0){let o=new Date(Math.max(...r.map(a=>a.getTime())));return this.formatGermanDate(o)}else return t}nextDay(t){let i=this.loadPlans(),e=this.parseGermanDate(t),r=[];for(let o in i){let a=this.parseGermanDate(o);a>e&&r.push(a)}if(r.length>0){let o=new Date(Math.min(...r.map(a=>a.getTime())));return this.formatGermanDate(o)}else return t}parseGermanDate(t){let[i,e,r]=t.split(".").map(Number);return new Date(r,e-1,i)}formatGermanDate(t){return t.toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit",year:"numeric"})}},v=new Y;function nt(n){let t=document.createElement("table");t.className="abschnitt-summe";let i=v.loadSections(n)??[];function e(s){return i.filter(l=>!s||l.location===s).map(l=>l.durationInMinutes()).reduce((l,m)=>l+m,0)}function r(s){let l=Math.floor(s/60),m=s-60*l;return new E(l,m)}function o(s){return(typeof s=="number"?s:s.industrial()).toFixed(2)}function a(s,l,m){let S=m?` data-testid="${m}"`:"",_=m?`${m}-industry-combined`:void 0,y=_?` data-testid="${_}"`:"";return`
          <tr>
            <td>${s}</td>
            <td${S}>${l.formattedString()}</td>
            <td${y}>${o(l)} / ${o(l.industrialQuarterPrecision())}</td>
          </tr>`}function c(){let s=r(e()),l=tt.map(m=>a(m,r(e(m)))).join("");t.innerHTML=`
      <thead align="center">
        <tr>
          <th>Arbeitsort</th>
          <th>Gesamtdauer</th>
          <th>Industriezeit (exakt/gerundet)</th>
        </tr>
      </thead>
      <tbody align="center">${l}${a("Gesamt",s,"fullduration")}
      </tbody>`}function u(s){n=s,i=v.loadSections(n)??[],c()}return c(),{element:t,update:u}}function j(){return new URLSearchParams(window.location.search).get("view")==="zeit-verteilung"?"zeit-verteilung":"day-plan"}function R(n,t){return`index.html${t==="zeit-verteilung"?`?day=${n}&view=zeit-verteilung`:`?day=${n}`}`}function K(n){return`index.html?day=${n}`}var wt={check:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>',close:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/></svg>',edit:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>',info:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>',delete:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>',login:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M11 7L9.6 8.4l2.6 2.6H2v2h10.2l-2.6 2.6L11 17l5-5-5-5zm9 12h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-8v2h8v14z"/></svg>',logout:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg>',chart:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M11 2v20c-5.07-.5-9-4.79-9-10s3.93-9.5 9-10zm2.03 0v8.99H22c-.47 4.74-4.24 8.52-8.97 9v-9H13V2z"/></svg>',"arrow-back":'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>'};function b(n){return wt[n]||""}var it={"end-before-start":"Die Enduhrzeit darf nicht vor der Startuhrzeit liegen.",overlap:"Der Abschnitt \xFCberschneidet sich zeitlich mit einem anderen Abschnitt."};function Et(n,t){return n.startTime.inMinutes()<t.endTime.inMinutes()&&t.startTime.inMinutes()<n.endTime.inMinutes()}function Q(n,t){if(n.endTime.inMinutes()<n.startTime.inMinutes())return{type:"end-before-start",message:it["end-before-start"]};if(t.some(i=>Et(n,i)))return{type:"overlap",message:it.overlap}}function C(n,t){for(let[i,e]of Object.entries(t))n.querySelector(`[data-action="${i}"]`)?.addEventListener("click",e)}function at(n,t,i,e,r,o,a){let c=document.createElement("div");c.className="abschnitt-host";let u=n?.startTime?.hour??0,s=n?.startTime?.minute??0,l=n?.endTime?.hour??0,m=n?.endTime?.minute??0,S=n?.location??T.UNASSIGNED;function _(p,w,f){return i?`<input class="abschnitt-time-cell" type="number" min="0" max="${f}" value="${p}" ${w} />`:`<span class="abschnitt-time-cell" ${w}>${p.toString().padStart(2,"0")}</span>`}function y(){return i?`
        <select class="abschnitt-location-cell" data-location>
          <option value="${T.UNASSIGNED}" ${S===T.UNASSIGNED?"selected":""}>${J[T.UNASSIGNED]}</option>
          <option value="${T.OFFICE}" ${S===T.OFFICE?"selected":""}>${J[T.OFFICE]}</option>
          <option value="${T.MOBILE}" ${S===T.MOBILE?"selected":""}>${J[T.MOBILE]}</option>
        </select>`:`<span class="abschnitt-location-cell" data-location>${J[S]}</span>`}function I(){return i?`
        <div class="abschnitt-icon-zone">
          <span data-action="abort">${b("close")}</span>
          <span data-action="finish">${b("check")}</span>
          <span data-action="delete">${b("delete")}</span>
        </div>`:`
      <div class="abschnitt-icon-zone">
        <span data-action="edit">${b("edit")}</span>
        <span data-action="delete">${b("delete")}</span>
      </div>`}function x(){c.classList.toggle("abschnitt-edit",i);let p=_(u,"data-start-hour",23)+'<span class="abschnitt-time-sep">:</span>'+_(s,"data-start-minute",59)+'<span class="abschnitt-time-sep abschnitt-time-sep--range"> - </span>'+_(l,"data-end-hour",23)+'<span class="abschnitt-time-sep">:</span>'+_(m,"data-end-minute",59);c.innerHTML=`
      <div class="abschnitt-row">
        <div class="abschnitt-time-range">${p}</div>
        ${y()}
        ${I()}
      </div>`,H()}function H(){i?(c.querySelector("[data-start-hour]")?.addEventListener("input",p=>{u=parseInt(p.target.value,10)||0}),c.querySelector("[data-start-minute]")?.addEventListener("input",p=>{s=parseInt(p.target.value,10)||0}),c.querySelector("[data-end-hour]")?.addEventListener("input",p=>{l=parseInt(p.target.value,10)||0}),c.querySelector("[data-end-minute]")?.addEventListener("input",p=>{m=parseInt(p.target.value,10)||0}),c.querySelector("[data-location]")?.addEventListener("change",p=>{S=p.target.value}),C(c,{finish:()=>{let p=new E(u,s),w=new E(l,m),f=new D(p,w,S),g=o?.(f);if(g){a?.(g);return}t&&t(f),e&&e(!1)},abort:()=>{e&&e(!1)},delete:()=>{r&&r()}})):C(c,{edit:()=>{u=n?.startTime?.hour??0,s=n?.startTime?.minute??0,l=n?.endTime?.hour??0,m=n?.endTime?.minute??0,S=n?.location??T.UNASSIGNED,e&&e(!0)},delete:()=>{r&&r()}})}function z(p,w){n=p,i=w,u=n?.startTime?.hour??0,s=n?.startTime?.minute??0,l=n?.endTime?.hour??0,m=n?.endTime?.minute??0,S=n?.location??T.UNASSIGNED,x()}return x(),{element:c,update:z}}function rt(n,t){let i=document.createElement("div");i.className="abschnitt-liste-host abschnitt-liste";let e=v.loadSections(n)??[],r=[],o=-1,a,c;function u(){v.saveSections(n,e),t?.(e)}function s(f){let g=Q(f,e);return g?(c=g,z(),!1):(e=[...e,f],a=void 0,c=void 0,u(),z(),!0)}function l(f){a={section:e[f],index:f},e=e.filter((g,N)=>N!==f),f===o?o=-1:f<o&&(o-=1),u(),z()}function m(){if(!a)return;let{section:f,index:g}=a;a=void 0,e=[...e.slice(0,g),f,...e.slice(g)],g<=o&&(o+=1),u(),z()}function S(f,g){e=e.map((N,U)=>U===f?g:N),a=void 0,c=void 0,u(),o=-1,z()}function _(f){c=f,z()}function y(){c=void 0,z()}function I(){a=void 0,z()}function x(){return c?`
      <div class="abschnitt-liste__undo-toast abschnitt-liste__validation-toast" data-testid="validation-toast" role="alert">
        <span>${c.message}</span>
        <button type="button" class="abschnitt-liste__undo-close" data-action="dismiss-validation" aria-label="Meldung ausblenden">${b("close")}</button>
      </div>`:""}function H(){return a?`
      <div class="abschnitt-liste__undo-toast" data-testid="undo-toast" role="status">
        <span>Abschnitt gel\xF6scht.</span>
        <button type="button" class="abschnitt-liste__undo-button" data-action="undo">R\xFCckg\xE4ngig</button>
        <button type="button" class="abschnitt-liste__undo-close" data-action="dismiss-undo" aria-label="Meldung ausblenden">${b("close")}</button>
      </div>`:""}function z(){r.forEach(f=>{f.element.remove()}),r=[],i.innerHTML=`
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
        ${e.map((f,g)=>`
          <li class="mat-list-item abschnitt-item" data-index="${g}" data-testid="section-${g}"></li>
        `).join("")}
      </ul>
      ${H()}
      ${x()}`,i.querySelectorAll("[data-index]").forEach(f=>{let g=parseInt(f.dataset.index,10),N=e[g],d=at(N,h=>S(g,h),g===o,h=>{h?o=g:o=-1,z()},()=>l(g),h=>Q(h,e.filter(($,M)=>M!==g)),h=>_(h));d.element.classList.add("abschnitt-cell"),f.appendChild(d.element),r.push(d)}),p()}function p(){i.querySelector('[data-action="undo"]')?.addEventListener("click",m),i.querySelector('[data-action="dismiss-undo"]')?.addEventListener("click",I),i.querySelector('[data-action="dismiss-validation"]')?.addEventListener("click",y)}function w(f){n=f,e=v.loadSections(n)??[],o=-1,a=void 0,c=void 0,z()}return z(),{element:i,update:w,addAbschnitt:s}}function ot(n,t){let i=document.createElement("div");i.className="stempeluhr";let e=v.loadStartTime(n),r=!1,o=e?.hour??0,a=e?.minute??0;function c(){return e?r?`<span class="stempeluhr__time-inputs">
                 <input type="number" min="0" max="23" value="${o}" data-hour />
                 :
                 <input type="number" min="0" max="59" value="${a}" data-minute />
                 <span data-action="finish">${b("check")}</span>
                 <span data-action="abort">${b("close")}</span>
               </span>`:`<span class="stempeluhr__time-display" data-testid="login-time">
               ${e.formattedString()}
               <span data-action="edit">${b("edit")}</span>
             </span>`:'<i class="stempeluhr__placeholder">noch nicht eingestempelt</i>'}function u(){i.innerHTML=`
      <span class="stempeluhr__label">Eingestempelt um:</span>
      <div class="stempeluhr__value">${c()}</div>
      <button class="mat-button stempeluhr__button" data-testid="log-button">
        <span data-action>${e?b("logout"):b("login")}</span>
        <span class="stempeluhr__button-label">${e?"Ausstempeln":"Einstempeln"}</span>
      </button>`,s()}function s(){if(r){let m=i.querySelector("[data-hour]"),S=i.querySelector("[data-minute]");m&&m.addEventListener("input",_=>{o=parseInt(_.target.value,10)||0}),S&&S.addEventListener("input",_=>{a=parseInt(_.target.value,10)||0}),C(i,{finish:()=>{e=new E(o,a),r=!1,v.saveStartTime(n,e),u()},abort:()=>{r=!1,o=e?.hour??0,a=e?.minute??0,u()}})}else C(i,{edit:()=>{o=e?.hour??0,a=e?.minute??0,r=!0,u()}});i.querySelector('[data-testid="log-button"]')?.addEventListener("click",()=>{if(!e)e=E.now(),v.saveStartTime(n,e),u();else{let m=new D(e,E.now());if(t&&t(m)===!1)return;e=void 0,v.saveStartTime(n,e),u()}})}function l(m){n=m,e=v.loadStartTime(n),r=!1,o=e?.hour??0,a=e?.minute??0,u()}return u(),{element:i,update:l}}function st(n,t,i){let e=document.createElement("section");e.className="day-plan";let r,o;function a(){e.innerHTML=`
      <header class="day-plan__header">
        <h1 data-testid="dayplan-title"></h1>
        <a class="day-plan__verteilung-link mat-button" data-testid="open-zeitverteilung" href="${R(n,"zeit-verteilung")}" title="Zeit verteilen" aria-label="Zeitverteilung \xF6ffnen">${b("chart")}</a>
      </header>`,e.querySelector('[data-testid="open-zeitverteilung"]')?.addEventListener("click",u=>{i&&(u.preventDefault(),i())}),e.querySelector('[data-testid="dayplan-title"]').textContent=`Tagesplan f\xFCr den ${n}`,o=rt(n,t),r=ot(n,u=>o.addAbschnitt(u)),r.element.classList.add("day-plan__clock"),o.element.classList.add("day-plan__list"),e.appendChild(r.element),e.appendChild(o.element)}function c(u){n=u,e.querySelector('[data-testid="dayplan-title"]').textContent=`Tagesplan f\xFCr den ${n}`;let s=e.querySelector('[data-testid="open-zeitverteilung"]');s&&(s.href=R(n,"zeit-verteilung")),r?.update(u),o?.update(u)}return a(),{element:e,update:c}}function lt(){let n=document.createElement("a");n.className="download-plans",n.textContent="Daten exportieren";function t(){let i=v.loadPlans(),e=JSON.stringify(i),r=new Blob([e],{type:"application/json"}),o=URL.createObjectURL(r),a=new Date,c=l=>l.toString().padStart(2,"0"),s=`dayplans_${a.getFullYear()+"-"+c(a.getMonth()+1)+"-"+c(a.getDate())+"_"+c(a.getHours())+"-"+c(a.getMinutes())+"-"+c(a.getSeconds())}.json`;n.setAttribute("href",o),n.setAttribute("download",s)}return t(),{element:n}}var ct="2026-10-29 08:58:05 +0000",ut="aab27b1",dt="https://github.com/mohrm/workingdiary/commit/aab27b1";function mt(){return ct}function pt(){return ut}function ft(){return dt}function ht(){let n=document.createElement("div");n.className="version-info",n.innerHTML=`
    <button type="button" class="version-info__button" data-testid="version-info" aria-label="Informationen anzeigen">
      ${b("info")}
    </button>
    <dialog class="version-info__dialog" data-testid="version-info-dialog" aria-labelledby="version-info-title">
      <h2 class="version-info__title" id="version-info-title">Informationen</h2>
      <p class="version-info__entry">Zuletzt ge\xE4ndert: ${mt()}</p>
      <p class="version-info__entry">Commit: <a href="${ft()}">${pt()}</a></p>
      <p class="version-info__entry">Viewport pr\xFCfen: <a href="https://mohrm.github.io/viewport-checker/" target="_blank" rel="noopener">mohrm.github.io/viewport-checker</a></p>
      <div class="version-info__actions">
        <div class="version-info__export" data-download-plans></div>
        <button type="button" class="version-info__close" data-testid="version-info-close">${b("close")}Schlie\xDFen</button>
      </div>
    </dialog>`;let t=n.querySelector('[data-testid="version-info"]'),i=n.querySelector('[data-testid="version-info-dialog"]'),e=n.querySelector('[data-testid="version-info-close"]');return t.addEventListener("click",()=>i.showModal()),e.addEventListener("click",()=>i.close()),i.addEventListener("click",r=>{r.target===i&&i.close()}),{element:n}}var W="nicht verteilte Zeit",gt="activity-history-months";function zt(n){let i=(v.loadSections(n)??[]).map(e=>e.durationInMinutes()).reduce((e,r)=>e+r,0);return et(i)}function $t(){let n=localStorage.getItem(gt),t=n===null?Number.NaN:parseInt(n,10);return Number.isInteger(t)&&t>0?t:3}function vt(n,t){let i=document.createElement("section");i.className="zeit-verteilung";let e="",r="",o="",a;function c(d){return d.map(h=>h.minutes).reduce((h,$)=>h+$,0)}function u(d){v.saveTimeDistribution(n,d)}function s(){return zt(n)}function l(d){return s()-c(d)}function m(d,h){let $=v.loadTimeDistribution(n)??[],M=d.trim();return M?M===W?(a="Diese T\xE4tigkeit ist reserviert.",p(),!1):$.some(P=>P.name===M)?(a="Diese T\xE4tigkeit gibt es schon.",p(),!1):h>l($)?(a="So viel Zeit ist nicht mehr frei.",p(),!1):(a=void 0,u([...$,new O(M,h)]),p(),!0):(a="Bitte eine T\xE4tigkeit angeben.",p(),!1)}function S(){let d=e,h=_();e="",r="",o="",m(d,h)}function _(){return o!==""?Math.round(s()*y(o)/100):Z(y(r))}function y(d){return parseFloat(d.replace(",","."))||0}function I(d){return(d/100).toFixed(2).replace(".",",")}function x(d){return I(Math.round(d/25)*25)}function H(d,h){return h===0?"0,0 %":`${(100*d/h).toFixed(1).replace(".",",")} %`}function z(d,h,$,M){let P=I(d.minutes),G=H(d.minutes,M);return`
      <li class="zeit-verteilung__row mat-list-item" data-index="${h}">
        <span class="zeit-verteilung__name" data-testid="taetigkeit-${h}">${d.name}</span>
        <span class="zeit-verteilung__indizes" data-testid="taetigkeit-indizes-${h}">${P} / ${x(d.minutes)}</span>
        ${$?`<input class="zeit-verteilung__input zeit-verteilung__input--industrial" type="text" inputmode="decimal" value="${P}" data-edit-industriezeit aria-label="Industriezeit f\xFCr ${d.name}" />
               <input class="zeit-verteilung__input zeit-verteilung__input--percent" type="text" inputmode="decimal" value="${G}" data-edit-prozent aria-label="Prozent f\xFCr ${d.name}" />`:`<span class="zeit-verteilung__value zeit-verteilung__input--industrial" data-testid="taetigkeit-industriezeit-${h}">${P}</span>
               <span class="zeit-verteilung__value zeit-verteilung__input--percent" data-testid="taetigkeit-prozent-${h}">${G}</span>`}
        <div class="zeit-verteilung__icon-zone">
          ${$?`<span data-action="abort" role="button" aria-label="Abbrechen">${b("close")}</span>
                 <span data-action="finish" role="button" aria-label="\xDCbernehmen">${b("check")}</span>`:`<span data-action="edit" role="button" aria-label="Bearbeiten">${b("edit")}</span>`}
          <span data-action="delete" role="button" aria-label="${d.name} entfernen">${b("delete")}</span>
        </div>
      </li>`}function p(){let d=s(),h=v.loadTimeDistribution(n)??[],$=Math.max(0,l(h)),M=v.recentActivityNames(n,$t()).filter(L=>!h.some(A=>A.name===L));i.innerHTML=`
      <header class="zeit-verteilung__header">
        <h1 data-testid="zeitverteilung-title">Zeitverteilung f\xFCr den ${n}</h1>
        <button type="button" class="zeit-verteilung__back" data-action="back" data-testid="back-to-dayplan" aria-label="Zur\xFCck zum Tagesplan">${b("arrow-back")}</button>
      </header>
      <p class="zeit-verteilung__gesamt">
        Gesamtdauer: <span data-testid="zeitverteilung-gesamt">${I(d)}</span>
        <span class="zeit-verteilung__gesamt-rund">/ ${x(d)}</span>
        Industriezeit
      </p>
      <div class="zeit-verteilung__neu">
        <input class="zeit-verteilung__input" type="text" placeholder="z. B. Regulatorik" value="${e}" data-testid="neue-taetigkeit" data-neue-taetigkeit list="zeit-verteilung-verlauf" />
        <datalist id="zeit-verteilung-verlauf">
          ${M.map(L=>`<option value="${L}"></option>`).join("")}
        </datalist>
        <input class="zeit-verteilung__input zeit-verteilung__input--industrial" type="text" inputmode="decimal" placeholder="Industriezeit" value="${r}" data-testid="neue-taetigkeit-industriezeit" aria-label="Industriezeit" />
        <input class="zeit-verteilung__input zeit-verteilung__input--percent" type="text" inputmode="decimal" placeholder="%" value="${o}" data-testid="neue-taetigkeit-prozent" aria-label="Prozent" />
        <button type="button" class="zeit-verteilung__add" data-action="add-freitext" data-testid="add-taetigkeit" aria-label="T\xE4tigkeit hinzuf\xFCgen">${b("check")}</button>
      </div>
      <ul class="zeit-verteilung__liste mat-list">
        ${h.map((L,A)=>z(L,A,A===w,d)).join("")}
        <li class="zeit-verteilung__row zeit-verteilung__row--unverteilt mat-list-item">
          <span class="zeit-verteilung__name" data-testid="unverteilt-name">${W}</span>
          <span class="zeit-verteilung__indizes" data-testid="unverteilt-industriezeit">${I($)} / ${x($)}</span>
          <span class="zeit-verteilung__value zeit-verteilung__input--industrial" data-testid="unverteilt-minuten">${I($)}</span>
          <span class="zeit-verteilung__value zeit-verteilung__input--percent" data-testid="unverteilt-prozent">${H($,d)}</span>
          <div class="zeit-verteilung__icon-zone zeit-verteilung__icon-zone--leer"></div>
        </li>
      </ul>
      ${a?`<div class="zeit-verteilung__fehler" data-testid="zeitverteilung-fehler" role="alert">${a}</div>`:""}`,i.querySelector("[data-neue-taetigkeit]")?.addEventListener("input",L=>{e=L.target.value}),i.querySelector('[data-testid="neue-taetigkeit-industriezeit"]')?.addEventListener("input",L=>{r=L.target.value}),i.querySelector('[data-testid="neue-taetigkeit-prozent"]')?.addEventListener("input",L=>{o=L.target.value}),i.querySelector("[data-edit-industriezeit]")?.addEventListener("input",L=>{f=L.target.value}),i.querySelector("[data-edit-prozent]")?.addEventListener("input",L=>{g=L.target.value}),h.forEach((L,A)=>{let V=i.querySelector(`[data-index="${A}"]`);V&&(V.querySelector('[data-action="edit"]')?.addEventListener("click",()=>{w=A,f=I(L.minutes),g="",a=void 0,p()}),V.querySelector('[data-action="abort"]')?.addEventListener("click",()=>{w=-1,f="",g="",p()}),V.querySelector('[data-action="finish"]')?.addEventListener("click",()=>{let X=v.loadTimeDistribution(n)??[],_t=X.filter((k,q)=>q!==A).map(k=>k.minutes).reduce((k,q)=>k+q,0),B;g!==""?B=Math.round(s()*y(g)/100):B=Z(y(f));let Lt=s()-_t;if(B>Lt){a="So viel Zeit ist nicht mehr frei.",p();return}a=void 0,u(X.map((k,q)=>q===A?new O(k.name,B):k)),w=-1,f="",g="",p()}),V.querySelector('[data-action="delete"]')?.addEventListener("click",()=>N(A)))}),C(i,{"add-freitext":S,back:()=>t?.()})}let w=-1,f="",g="";function N(d){let h=v.loadTimeDistribution(n)??[];u(h.filter(($,M)=>M!==d)),w===d&&(w=-1),p()}function U(d){n=d,e="",r="",o="",a=void 0,w=-1,p()}return p(),{element:i,update:U}}function xt(){return new Date().toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit",year:"numeric"})}function bt(){return new URLSearchParams(window.location.search).get("day")??xt()}function F(n,t="day-plan"){history.pushState({day:n},"",R(n,t))}function St(){let n=document.createElement("div");n.className="app-shell";let t=bt(),i=j(),e,r,o,a,c;function u(){n.innerHTML=`
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
      </div>`,a=lt(),c=ht();let y=n.querySelector("[data-view]");i==="zeit-verteilung"?(r=vt(t,l),y.appendChild(r.element)):(e=st(t,()=>o?.update(t),s),y.appendChild(e.element),e.element.querySelector(".day-plan__header").appendChild(c.element)),o=nt(t),n.querySelector("[data-abschnitt-summe]").appendChild(o.element),n.querySelector("[data-download-plans]").appendChild(a.element),m()}function s(){i="zeit-verteilung",F(t,i),u()}function l(){i="day-plan",F(t,i),u()}function m(){let y=n.querySelector("[data-prev-link]"),I=n.querySelector("[data-next-link]");y?.addEventListener("click",x=>{x.preventDefault(),t=v.previousDay(t),F(t,i),S()}),I?.addEventListener("click",x=>{x.preventDefault(),t=v.nextDay(t),F(t,i),S()})}function S(){i==="zeit-verteilung"?r?.update(t):e?.update(t),o?.update(t),_()}function _(){let y=n.querySelector("[data-prev-link]"),I=n.querySelector("[data-next-link]");y&&(y.href=K(v.previousDay(t))),I&&(I.href=K(v.nextDay(t)))}return u(),{element:n,update(){t=bt();let y=j();y!==i&&(i=y,u()),S()}}}var Tt=document.querySelector("app-root");if(!Tt)throw new Error("Root element <app-root> not found");var yt=St();Tt.appendChild(yt.element);window.addEventListener("popstate",()=>yt.update());
//# sourceMappingURL=main-6PFMGCM3.js.map
