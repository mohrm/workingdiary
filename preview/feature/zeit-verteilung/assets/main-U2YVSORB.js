var S={UNASSIGNED:"nicht zugeordnet",OFFICE:"B\xFCro",MOBILE:"mobil"},G=Object.values(S).filter(n=>n!==S.UNASSIGNED),O={[S.UNASSIGNED]:"kein",[S.OFFICE]:S.OFFICE,[S.MOBILE]:S.MOBILE};var I=class n{hour;minute;static now(){let t=new Date;return new n(t.getHours(),t.getMinutes())}constructor(t,i){this.hour=t,this.minute=i}inMinutes(){return 60*this.hour+this.minute}industrial(){return this.inMinutes()/60}industrialQuarterPrecision(){return Math.round(4*this.industrial())/4}formattedString(){return this.hour.toString().padStart(2,"0")+":"+this.minute.toString().padStart(2,"0")}toJSON(){return{hour:this.hour,minute:this.minute}}static fromJSON(t){return new n(t.hour,t.minute)}};var k=class n{name;minutes;constructor(t,i){this.name=t,this.minutes=i}toJSON(){return{name:this.name,minutes:this.minutes}}static fromJSON(t){return new n(t.name,t.minutes)}};function q(n){return Math.round(100*n)}function Z(n){return Math.round(n*100/60)}var M=class n{startTime;endTime;location;constructor(t,i,e=S.UNASSIGNED){this.startTime=t,this.endTime=i,this.location=e}formattedString(){return`${`${this.startTime.formattedString()} - ${this.endTime.formattedString()}`} (${this.location})`}durationInMinutes(){return this.endTime.inMinutes()-this.startTime.inMinutes()}toJSON(){return{startTime:this.startTime.toJSON(),endTime:this.endTime.toJSON(),location:this.location}}static fromJSON(t){return new n(I.fromJSON(t.startTime),I.fromJSON(t.endTime),t.location??S.UNASSIGNED)}};var R=class{initPlans(){let t={};return localStorage.setItem("plans",JSON.stringify(t)),t}loadPlans(){let t=localStorage.getItem("plans");return t?JSON.parse(t):this.initPlans()}initDay(t,i){let e={};return t[i]=e,localStorage.setItem("plans",JSON.stringify(t)),e}loadDayPlan(t){let i=this.loadPlans();return i[t]||this.initDay(i,t),i}saveStartTime(t,i){let e=this.loadDayPlan(t);i?e[t].startTime=i:e[t].startTime=void 0,localStorage.setItem("plans",JSON.stringify(e))}loadStartTime(t){let e=this.loadDayPlan(t)[t].startTime;if(e)return new I(e.hour,e.minute)}saveSections(t,i){let e=this.loadDayPlan(t);e[t].sections=i,localStorage.setItem("plans",JSON.stringify(e))}loadSections(t){let e=this.loadDayPlan(t)[t].sections;if(e)return e.map(r=>M.fromJSON(r))}saveActivities(t,i){let e=this.loadDayPlan(t);e[t].activities=i,localStorage.setItem("plans",JSON.stringify(e))}loadActivities(t){return this.loadDayPlan(t)[t].activities}saveTimeDistribution(t,i){let e=this.loadDayPlan(t);e[t].timeDistribution=i.map(r=>r.toJSON()),localStorage.setItem("plans",JSON.stringify(e))}loadTimeDistribution(t){let i=this.loadDayPlan(t)[t].timeDistribution;if(i)return i.map(e=>k.fromJSON(e))}previousDay(t){let i=this.loadPlans(),e=this.parseGermanDate(t),r=[];for(let s in i){let l=this.parseGermanDate(s);l<e&&r.push(l)}if(r.length>0){let s=new Date(Math.max(...r.map(l=>l.getTime())));return this.formatGermanDate(s)}else return t}nextDay(t){let i=this.loadPlans(),e=this.parseGermanDate(t),r=[];for(let s in i){let l=this.parseGermanDate(s);l>e&&r.push(l)}if(r.length>0){let s=new Date(Math.min(...r.map(l=>l.getTime())));return this.formatGermanDate(s)}else return t}parseGermanDate(t){let[i,e,r]=t.split(".").map(Number);return new Date(r,e-1,i)}formatGermanDate(t){return t.toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit",year:"numeric"})}},h=new R;function j(n){let t=document.createElement("table");t.className="abschnitt-summe";let i=h.loadSections(n)??[];function e(m){return i.filter(p=>!m||p.location===m).map(p=>p.durationInMinutes()).reduce((p,f)=>p+f,0)}function r(m){let p=Math.floor(m/60),f=m-60*p;return new I(p,f)}function s(m){return(typeof m=="number"?m:m.industrial()).toFixed(2)}function l(m,p,f){let T=f?` data-testid="${f}"`:"",L=f?`${f}-industry-combined`:void 0,b=L?` data-testid="${L}"`:"";return`
          <tr>
            <td>${m}</td>
            <td${T}>${p.formattedString()}</td>
            <td${b}>${s(p)} / ${s(p.industrialQuarterPrecision())}</td>
          </tr>`}function u(){let m=r(e()),p=G.map(f=>l(f,r(e(f)))).join("");t.innerHTML=`
      <thead align="center">
        <tr>
          <th>Arbeitsort</th>
          <th>Gesamtdauer</th>
          <th>Industriezeit (exakt/gerundet)</th>
        </tr>
      </thead>
      <tbody align="center">${p}${l("Gesamt",m,"fullduration")}
      </tbody>`}function d(m){n=m,i=h.loadSections(n)??[],u()}return u(),{element:t,update:d}}function U(){return new URLSearchParams(window.location.search).get("view")==="zeit-verteilung"?"zeit-verteilung":"day-plan"}function H(n,t){return t==="zeit-verteilung"?`/?day=${n}&view=zeit-verteilung`:`/?day=${n}`}var ft={check:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>',close:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/></svg>',edit:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>',info:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>',delete:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>',login:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M11 7L9.6 8.4l2.6 2.6H2v2h10.2l-2.6 2.6L11 17l5-5-5-5zm9 12h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-8v2h8v14z"/></svg>',logout:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg>',chart:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M11 2v20c-5.07-.5-9-4.79-9-10s3.93-9.5 9-10zm2.03 0v8.99H22c-.47 4.74-4.24 8.52-8.97 9v-9H13V2z"/></svg>',"arrow-back":'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>'};function v(n){return ft[n]||""}var Q={"end-before-start":"Die Enduhrzeit darf nicht vor der Startuhrzeit liegen.",overlap:"Der Abschnitt \xFCberschneidet sich zeitlich mit einem anderen Abschnitt."};function ht(n,t){return n.startTime.inMinutes()<t.endTime.inMinutes()&&t.startTime.inMinutes()<n.endTime.inMinutes()}function B(n,t){if(n.endTime.inMinutes()<n.startTime.inMinutes())return{type:"end-before-start",message:Q["end-before-start"]};if(t.some(i=>ht(n,i)))return{type:"overlap",message:Q.overlap}}function C(n,t){for(let[i,e]of Object.entries(t))n.querySelector(`[data-action="${i}"]`)?.addEventListener("click",e)}function K(n,t,i,e,r,s,l){let u=document.createElement("div");u.className="abschnitt-host";let d=n?.startTime?.hour??0,m=n?.startTime?.minute??0,p=n?.endTime?.hour??0,f=n?.endTime?.minute??0,T=n?.location??S.UNASSIGNED;function L(_,o,a){return i?`<input class="abschnitt-time-cell" type="number" min="0" max="${a}" value="${_}" ${o} />`:`<span class="abschnitt-time-cell" ${o}>${_.toString().padStart(2,"0")}</span>`}function b(){return i?`
        <select class="abschnitt-location-cell" data-location>
          <option value="${S.UNASSIGNED}" ${T===S.UNASSIGNED?"selected":""}>${O[S.UNASSIGNED]}</option>
          <option value="${S.OFFICE}" ${T===S.OFFICE?"selected":""}>${O[S.OFFICE]}</option>
          <option value="${S.MOBILE}" ${T===S.MOBILE?"selected":""}>${O[S.MOBILE]}</option>
        </select>`:`<span class="abschnitt-location-cell" data-location>${O[T]}</span>`}function $(){return i?`
        <div class="abschnitt-icon-zone">
          <span data-action="abort">${v("close")}</span>
          <span data-action="finish">${v("check")}</span>
          <span data-action="delete">${v("delete")}</span>
        </div>`:`
      <div class="abschnitt-icon-zone">
        <span data-action="edit">${v("edit")}</span>
        <span data-action="delete">${v("delete")}</span>
      </div>`}function D(){u.classList.toggle("abschnitt-edit",i);let _=L(d,"data-start-hour",23)+'<span class="abschnitt-time-sep">:</span>'+L(m,"data-start-minute",59)+'<span class="abschnitt-time-sep abschnitt-time-sep--range"> - </span>'+L(p,"data-end-hour",23)+'<span class="abschnitt-time-sep">:</span>'+L(f,"data-end-minute",59);u.innerHTML=`
      <div class="abschnitt-row">
        <div class="abschnitt-time-range">${_}</div>
        ${b()}
        ${$()}
      </div>`,N()}function N(){i?(u.querySelector("[data-start-hour]")?.addEventListener("input",_=>{d=parseInt(_.target.value,10)||0}),u.querySelector("[data-start-minute]")?.addEventListener("input",_=>{m=parseInt(_.target.value,10)||0}),u.querySelector("[data-end-hour]")?.addEventListener("input",_=>{p=parseInt(_.target.value,10)||0}),u.querySelector("[data-end-minute]")?.addEventListener("input",_=>{f=parseInt(_.target.value,10)||0}),u.querySelector("[data-location]")?.addEventListener("change",_=>{T=_.target.value}),C(u,{finish:()=>{let _=new I(d,m),o=new I(p,f),a=new M(_,o,T),c=s?.(a);if(c){l?.(c);return}t&&t(a),e&&e(!1)},abort:()=>{e&&e(!1)},delete:()=>{r&&r()}})):C(u,{edit:()=>{d=n?.startTime?.hour??0,m=n?.startTime?.minute??0,p=n?.endTime?.hour??0,f=n?.endTime?.minute??0,T=n?.location??S.UNASSIGNED,e&&e(!0)},delete:()=>{r&&r()}})}function g(_,o){n=_,i=o,d=n?.startTime?.hour??0,m=n?.startTime?.minute??0,p=n?.endTime?.hour??0,f=n?.endTime?.minute??0,T=n?.location??S.UNASSIGNED,D()}return D(),{element:u,update:g}}function W(n,t){let i=document.createElement("div");i.className="abschnitt-liste-host abschnitt-liste";let e=h.loadSections(n)??[],r=[],s=-1,l,u;function d(){h.saveSections(n,e),t?.(e)}function m(a){let c=B(a,e);return c?(u=c,g(),!1):(e=[...e,a],l=void 0,u=void 0,d(),g(),!0)}function p(a){l={section:e[a],index:a},e=e.filter((c,y)=>y!==a),a===s?s=-1:a<s&&(s-=1),d(),g()}function f(){if(!l)return;let{section:a,index:c}=l;l=void 0,e=[...e.slice(0,c),a,...e.slice(c)],c<=s&&(s+=1),d(),g()}function T(a,c){e=e.map((y,A)=>A===a?c:y),l=void 0,u=void 0,d(),s=-1,g()}function L(a){u=a,g()}function b(){u=void 0,g()}function $(){l=void 0,g()}function D(){return u?`
      <div class="abschnitt-liste__undo-toast abschnitt-liste__validation-toast" data-testid="validation-toast" role="alert">
        <span>${u.message}</span>
        <button type="button" class="abschnitt-liste__undo-close" data-action="dismiss-validation" aria-label="Meldung ausblenden">${v("close")}</button>
      </div>`:""}function N(){return l?`
      <div class="abschnitt-liste__undo-toast" data-testid="undo-toast" role="status">
        <span>Abschnitt gel\xF6scht.</span>
        <button type="button" class="abschnitt-liste__undo-button" data-action="undo">R\xFCckg\xE4ngig</button>
        <button type="button" class="abschnitt-liste__undo-close" data-action="dismiss-undo" aria-label="Meldung ausblenden">${v("close")}</button>
      </div>`:""}function g(){r.forEach(a=>{a.element.remove()}),r=[],i.innerHTML=`
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
        ${e.map((a,c)=>`
          <li class="mat-list-item abschnitt-item" data-index="${c}" data-testid="section-${c}"></li>
        `).join("")}
      </ul>
      ${N()}
      ${D()}`,i.querySelectorAll("[data-index]").forEach(a=>{let c=parseInt(a.dataset.index,10),y=e[c],x=K(y,w=>T(c,w),c===s,w=>{w?s=c:s=-1,g()},()=>p(c),w=>B(w,e.filter((E,z)=>z!==c)),w=>L(w));x.element.classList.add("abschnitt-cell"),a.appendChild(x.element),r.push(x)}),_()}function _(){i.querySelector('[data-action="undo"]')?.addEventListener("click",f),i.querySelector('[data-action="dismiss-undo"]')?.addEventListener("click",$),i.querySelector('[data-action="dismiss-validation"]')?.addEventListener("click",b)}function o(a){n=a,e=h.loadSections(n)??[],s=-1,l=void 0,u=void 0,g()}return g(),{element:i,update:o,addAbschnitt:m}}function Y(n,t){let i=document.createElement("div");i.className="stempeluhr";let e=h.loadStartTime(n),r=!1,s=e?.hour??0,l=e?.minute??0;function u(){return e?r?`<span class="stempeluhr__time-inputs">
                 <input type="number" min="0" max="23" value="${s}" data-hour />
                 :
                 <input type="number" min="0" max="59" value="${l}" data-minute />
                 <span data-action="finish">${v("check")}</span>
                 <span data-action="abort">${v("close")}</span>
               </span>`:`<span class="stempeluhr__time-display" data-testid="login-time">
               ${e.formattedString()}
               <span data-action="edit">${v("edit")}</span>
             </span>`:'<i class="stempeluhr__placeholder">noch nicht eingestempelt</i>'}function d(){i.innerHTML=`
      <span class="stempeluhr__label">Eingestempelt um:</span>
      <div class="stempeluhr__value">${u()}</div>
      <button class="mat-button stempeluhr__button" data-testid="log-button">
        <span data-action>${e?v("logout"):v("login")}</span>
        <span class="stempeluhr__button-label">${e?"Ausstempeln":"Einstempeln"}</span>
      </button>`,m()}function m(){if(r){let f=i.querySelector("[data-hour]"),T=i.querySelector("[data-minute]");f&&f.addEventListener("input",L=>{s=parseInt(L.target.value,10)||0}),T&&T.addEventListener("input",L=>{l=parseInt(L.target.value,10)||0}),C(i,{finish:()=>{e=new I(s,l),r=!1,h.saveStartTime(n,e),d()},abort:()=>{r=!1,s=e?.hour??0,l=e?.minute??0,d()}})}else C(i,{edit:()=>{s=e?.hour??0,l=e?.minute??0,r=!0,d()}});i.querySelector('[data-testid="log-button"]')?.addEventListener("click",()=>{if(!e)e=I.now(),h.saveStartTime(n,e),d();else{let f=new M(e,I.now());if(t&&t(f)===!1)return;e=void 0,h.saveStartTime(n,e),d()}})}function p(f){n=f,e=h.loadStartTime(n),r=!1,s=e?.hour??0,l=e?.minute??0,d()}return d(),{element:i,update:p}}function X(n,t,i){let e=document.createElement("section");e.className="day-plan";let r,s;function l(){e.innerHTML=`
      <header class="day-plan__header">
        <h1 data-testid="dayplan-title"></h1>
        <a class="day-plan__verteilung-link mat-button" data-testid="open-zeitverteilung" href="${H(n,"zeit-verteilung")}" title="Zeit verteilen" aria-label="Zeitverteilung \xF6ffnen">${v("chart")}</a>
      </header>`,e.querySelector('[data-testid="open-zeitverteilung"]')?.addEventListener("click",d=>{i&&(d.preventDefault(),i())}),e.querySelector('[data-testid="dayplan-title"]').textContent=`Tagesplan f\xFCr den ${n}`,s=W(n,t),r=Y(n,d=>s.addAbschnitt(d)),r.element.classList.add("day-plan__clock"),s.element.classList.add("day-plan__list"),e.appendChild(r.element),e.appendChild(s.element)}function u(d){n=d,e.querySelector('[data-testid="dayplan-title"]').textContent=`Tagesplan f\xFCr den ${n}`;let m=e.querySelector('[data-testid="open-zeitverteilung"]');m&&(m.href=H(n,"zeit-verteilung")),r?.update(d),s?.update(d)}return l(),{element:e,update:u}}function tt(){let n=document.createElement("a");n.className="download-plans",n.textContent="Daten exportieren";function t(){let i=h.loadPlans(),e=JSON.stringify(i),r=new Blob([e],{type:"application/json"}),s=URL.createObjectURL(r),l=new Date,u=p=>p.toString().padStart(2,"0"),m=`dayplans_${l.getFullYear()+"-"+u(l.getMonth()+1)+"-"+u(l.getDate())+"_"+u(l.getHours())+"-"+u(l.getMinutes())+"-"+u(l.getSeconds())}.json`;n.setAttribute("href",s),n.setAttribute("download",m)}return t(),{element:n}}var et="2026-10-28 22:38:06 +0000",nt="9a77cfd",it="https://github.com/mohrm/workingdiary/commit/9a77cfd";function at(){return et}function rt(){return nt}function ot(){return it}function st(){let n=document.createElement("div");n.className="version-info",n.innerHTML=`
    <button type="button" class="version-info__button" data-testid="version-info" aria-label="Informationen anzeigen">
      ${v("info")}
    </button>
    <dialog class="version-info__dialog" data-testid="version-info-dialog" aria-labelledby="version-info-title">
      <h2 class="version-info__title" id="version-info-title">Informationen</h2>
      <p class="version-info__entry">Zuletzt ge\xE4ndert: ${at()}</p>
      <p class="version-info__entry">Commit: <a href="${ot()}">${rt()}</a></p>
      <p class="version-info__entry">Viewport pr\xFCfen: <a href="https://mohrm.github.io/viewport-checker/" target="_blank" rel="noopener">mohrm.github.io/viewport-checker</a></p>
      <div class="version-info__actions">
        <div class="version-info__export" data-download-plans></div>
        <button type="button" class="version-info__close" data-testid="version-info-close">${v("close")}Schlie\xDFen</button>
      </div>
    </dialog>`;let t=n.querySelector('[data-testid="version-info"]'),i=n.querySelector('[data-testid="version-info-dialog"]'),e=n.querySelector('[data-testid="version-info-close"]');return t.addEventListener("click",()=>i.showModal()),e.addEventListener("click",()=>i.close()),i.addEventListener("click",r=>{r.target===i&&i.close()}),{element:n}}var lt=["Programmierung","Meetings","Dokumentation","Support"],F="nicht verteilte Zeit";function P(n){let i=(h.loadSections(n)??[]).map(e=>e.durationInMinutes()).reduce((e,r)=>e+r,0);return Z(i)}function ct(n,t){let i=document.createElement("section");i.className="zeit-verteilung";let e="",r;function s(o){return o.map(a=>a.minutes).reduce((a,c)=>a+c,0)}function l(o){h.saveTimeDistribution(n,o)}function u(o,a){let c=h.loadTimeDistribution(n)??[],y=o.trim();if(!y)return r="Bitte eine T\xE4tigkeit angeben.",g(),!1;if(y===F)return r="Diese T\xE4tigkeit ist reserviert.",g(),!1;if(c.some(w=>w.name===y))return r="Diese T\xE4tigkeit gibt es schon.",g(),!1;let x=P(n)-s(c);return a>x?(r="So viel Zeit ist nicht mehr frei.",g(),!1):(r=void 0,l([...c,new k(y,a)]),g(),!0)}function d(){let o=i.querySelector('[data-testid="neue-taetigkeit"]'),a=i.querySelector('[data-testid="neue-taetigkeit-industriezeit"]'),c=i.querySelector('[data-testid="neue-taetigkeit-prozent"]'),y=o?.value??e,A=P(n),x;if((c?.value??"")!==""){let w=L(c?.value??"");x=Math.round(A*w/100)}else x=q(L(a?.value??""));e="",u(y,x)}function m(o){if((h.loadTimeDistribution(n)??[]).some(c=>c.name===o)){r="Diese T\xE4tigkeit gibt es schon.",g();return}u(o,0)}function p(o){let a=h.loadTimeDistribution(n)??[];l(a.filter((c,y)=>y!==o)),g()}function f(o,a){let c=h.loadTimeDistribution(n)??[],y=P(n),A=c.filter((x,w)=>w!==o).map(x=>x.minutes).reduce((x,w)=>x+w,0);a>y-A?(r="So viel Zeit ist nicht mehr frei.",a=Math.max(0,y-A)):r=void 0,l(c.map((x,w)=>w===o?new k(x.name,a):x)),g()}function T(o,a){let c=P(n);f(o,Math.round(c*a/100))}function L(o){return parseFloat(o.replace(",","."))||0}function b(o){return(o/100).toFixed(2).replace(".",",")}function $(o){return b(Math.round(o/25)*25)}function D(o,a){return a===0?"0 %":`${(100*o/a).toFixed(1).replace(".",",")} %`}function N(o,a,c){return`
      <li class="zeit-verteilung__row mat-list-item" data-index="${a}">
        <div class="zeit-verteilung__taetigkeit">
          <span class="zeit-verteilung__name" data-testid="taetigkeit-${a}">${o.name}</span>
          <span class="zeit-verteilung__indizes">${b(o.minutes)} / ${$(o.minutes)}</span>
        </div>
        <input class="zeit-verteilung__input zeit-verteilung__input--industrial" type="text" inputmode="decimal" value="${b(o.minutes)}" data-industriezeit-index="${a}" aria-label="Dauer in Industriezeit f\xFCr ${o.name}" />
        <input class="zeit-verteilung__input zeit-verteilung__input--percent" type="text" inputmode="decimal" value="${D(o.minutes,c)}" data-prozent-index="${a}" aria-label="Dauer in Prozent f\xFCr ${o.name}" />
        <button type="button" class="zeit-verteilung__delete" data-action="delete-${a}" data-testid="delete-taetigkeit-${a}" aria-label="${o.name} entfernen">${v("delete")}</button>
      </li>`}function g(){let o=P(n),a=h.loadTimeDistribution(n)??[],c=s(a),y=Math.max(0,o-c),A=lt.filter(E=>!a.some(z=>z.name===E));i.innerHTML=`
      <header class="zeit-verteilung__header">
        <h1 data-testid="zeitverteilung-title">Zeitverteilung f\xFCr den ${n}</h1>
        <button type="button" class="zeit-verteilung__back" data-action="back" data-testid="back-to-dayplan" aria-label="Zur\xFCck zum Tagesplan">${v("arrow-back")}</button>
      </header>
      <p class="zeit-verteilung__gesamt">
        Gesamtdauer: <span data-testid="zeitverteilung-gesamt">${b(o)}</span>
        <span class="zeit-verteilung__gesamt-rund">/ ${$(o)}</span>
        Industriezeit
      </p>
      <div class="zeit-verteilung__neu">
        <input class="zeit-verteilung__input" type="text" placeholder="Neue T\xE4tigkeit" value="${e}" data-testid="neue-taetigkeit" data-neue-taetigkeit />
        <input class="zeit-verteilung__input zeit-verteilung__input--industrial" type="text" inputmode="decimal" placeholder="Industriezeit" data-testid="neue-taetigkeit-industriezeit" aria-label="Dauer in Industriezeit" />
        <input class="zeit-verteilung__input zeit-verteilung__input--percent" type="text" inputmode="decimal" placeholder="%" data-testid="neue-taetigkeit-prozent" aria-label="Dauer in Prozent" />
        <button type="button" class="zeit-verteilung__add" data-action="add-freitext" data-testid="add-taetigkeit" aria-label="T\xE4tigkeit hinzuf\xFCgen">${v("check")}</button>
      </div>
      ${A.length>0?`
      <div class="zeit-verteilung__vorschlaege">
        ${A.map(E=>`<button type="button" class="mat-button zeit-verteilung__vorschlag" data-vorschlag="${E}">${E}</button>`).join("")}
      </div>`:""}
      <ul class="zeit-verteilung__liste mat-list">
        ${a.map((E,z)=>N(E,z,o)).join("")}
        <li class="zeit-verteilung__row zeit-verteilung__row--unverteilt mat-list-item">
          <div class="zeit-verteilung__taetigkeit">
            <span class="zeit-verteilung__name" data-testid="unverteilt-name">${F}</span>
            <span class="zeit-verteilung__indizes" data-testid="unverteilt-industriezeit">${b(y)} / ${$(y)}</span>
          </div>
          <span class="zeit-verteilung__input zeit-verteilung__input--readonly" data-testid="unverteilt-minuten">${b(y)}</span>
          <span class="zeit-verteilung__input zeit-verteilung__input--readonly zeit-verteilung__input--percent" data-testid="unverteilt-prozent">${D(y,o)}</span>
          <span class="zeit-verteilung__delete"></span>
        </li>
      </ul>
      ${r?`<div class="zeit-verteilung__fehler" data-testid="zeitverteilung-fehler" role="alert">${r}</div>`:""}
      <button type="button" class="mat-button zeit-verteilung__back-label" data-action="back" data-testid="back-to-dayplan-label">Zur\xFCck zum Tagesplan</button>`,i.querySelector("[data-neue-taetigkeit]")?.addEventListener("input",E=>{e=E.target.value}),i.querySelectorAll("[data-industriezeit-index]").forEach(E=>{let z=parseInt(E.dataset.industriezeitIndex??"",10);E.addEventListener("change",J=>{f(z,q(L(J.target.value)))})}),i.querySelectorAll("[data-prozent-index]").forEach(E=>{let z=parseInt(E.dataset.prozentIndex??"",10);E.addEventListener("change",J=>{T(z,L(J.target.value))})}),i.querySelectorAll("[data-vorschlag]").forEach(E=>{E.addEventListener("click",()=>{m(E.getAttribute("data-vorschlag")??"")})});let w={"add-freitext":d,back:()=>t?.()};a.forEach((E,z)=>{w[`delete-${z}`]=()=>p(z)}),C(i,w)}function _(o){n=o,e="",r=void 0,g()}return g(),{element:i,update:_}}function gt(){return new Date().toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit",year:"numeric"})}function ut(){return new URLSearchParams(window.location.search).get("day")??gt()}function V(n,t="day-plan"){history.pushState({day:n},"",H(n,t))}function dt(){let n=document.createElement("div");n.className="app-shell";let t=ut(),i=U(),e,r,s,l,u;function d(){n.innerHTML=`
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
      </div>`,l=tt(),u=st();let b=n.querySelector("[data-view]");i==="zeit-verteilung"?(r=ct(t,p),b.appendChild(r.element)):(e=X(t,()=>s?.update(t),m),b.appendChild(e.element),e.element.querySelector(".day-plan__header").appendChild(u.element)),s=j(t),n.querySelector("[data-abschnitt-summe]").appendChild(s.element),n.querySelector("[data-download-plans]").appendChild(l.element),f()}function m(){i="zeit-verteilung",V(t,i),d()}function p(){i="day-plan",V(t,i),d()}function f(){let b=n.querySelector("[data-prev-link]"),$=n.querySelector("[data-next-link]");b?.addEventListener("click",D=>{D.preventDefault(),t=h.previousDay(t),V(t,i),T()}),$?.addEventListener("click",D=>{D.preventDefault(),t=h.nextDay(t),V(t,i),T()})}function T(){i==="zeit-verteilung"?r?.update(t):e?.update(t),s?.update(t),L()}function L(){let b=n.querySelector("[data-prev-link]"),$=n.querySelector("[data-next-link]");b&&(b.href=`/?day=${h.previousDay(t)}`),$&&($.href=`/?day=${h.nextDay(t)}`)}return d(),{element:n,update(){t=ut();let b=U();b!==i&&(i=b,d()),T()}}}var mt=document.querySelector("app-root");if(!mt)throw new Error("Root element <app-root> not found");var pt=dt();mt.appendChild(pt.element);window.addEventListener("popstate",()=>pt.update());
//# sourceMappingURL=main-U2YVSORB.js.map
