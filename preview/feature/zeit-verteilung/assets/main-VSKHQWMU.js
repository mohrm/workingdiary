var L={UNASSIGNED:"nicht zugeordnet",OFFICE:"B\xFCro",MOBILE:"mobil"},U=Object.values(L).filter(n=>n!==L.UNASSIGNED),N={[L.UNASSIGNED]:"kein",[L.OFFICE]:L.OFFICE,[L.MOBILE]:L.MOBILE};var w=class n{hour;minute;static now(){let t=new Date;return new n(t.getHours(),t.getMinutes())}constructor(t,i){this.hour=t,this.minute=i}inMinutes(){return 60*this.hour+this.minute}industrial(){return this.inMinutes()/60}industrialQuarterPrecision(){return Math.round(4*this.industrial())/4}formattedString(){return this.hour.toString().padStart(2,"0")+":"+this.minute.toString().padStart(2,"0")}toJSON(){return{hour:this.hour,minute:this.minute}}static fromJSON(t){return new n(t.hour,t.minute)}};var C=class n{name;minutes;constructor(t,i){this.name=t,this.minutes=i}toJSON(){return{name:this.name,minutes:this.minutes}}static fromJSON(t){return new n(t.name,t.minutes)}};function H(n){return Math.round(100*n)}function F(n){return Math.round(n*100/60)}var M=class n{startTime;endTime;location;constructor(t,i,e=L.UNASSIGNED){this.startTime=t,this.endTime=i,this.location=e}formattedString(){return`${`${this.startTime.formattedString()} - ${this.endTime.formattedString()}`} (${this.location})`}durationInMinutes(){return this.endTime.inMinutes()-this.startTime.inMinutes()}toJSON(){return{startTime:this.startTime.toJSON(),endTime:this.endTime.toJSON(),location:this.location}}static fromJSON(t){return new n(w.fromJSON(t.startTime),w.fromJSON(t.endTime),t.location??L.UNASSIGNED)}};var P=class{initPlans(){let t={};return localStorage.setItem("plans",JSON.stringify(t)),t}loadPlans(){let t=localStorage.getItem("plans");return t?JSON.parse(t):this.initPlans()}initDay(t,i){let e={};return t[i]=e,localStorage.setItem("plans",JSON.stringify(t)),e}loadDayPlan(t){let i=this.loadPlans();return i[t]||this.initDay(i,t),i}saveStartTime(t,i){let e=this.loadDayPlan(t);i?e[t].startTime=i:e[t].startTime=void 0,localStorage.setItem("plans",JSON.stringify(e))}loadStartTime(t){let e=this.loadDayPlan(t)[t].startTime;if(e)return new w(e.hour,e.minute)}saveSections(t,i){let e=this.loadDayPlan(t);e[t].sections=i,localStorage.setItem("plans",JSON.stringify(e))}loadSections(t){let e=this.loadDayPlan(t)[t].sections;if(e)return e.map(o=>M.fromJSON(o))}saveActivities(t,i){let e=this.loadDayPlan(t);e[t].activities=i,localStorage.setItem("plans",JSON.stringify(e))}loadActivities(t){return this.loadDayPlan(t)[t].activities}saveTimeDistribution(t,i){let e=this.loadDayPlan(t);e[t].timeDistribution=i.map(o=>o.toJSON()),localStorage.setItem("plans",JSON.stringify(e))}loadTimeDistribution(t){let i=this.loadDayPlan(t)[t].timeDistribution;if(i)return i.map(e=>C.fromJSON(e))}previousDay(t){let i=this.loadPlans(),e=this.parseGermanDate(t),o=[];for(let a in i){let r=this.parseGermanDate(a);r<e&&o.push(r)}if(o.length>0){let a=new Date(Math.max(...o.map(r=>r.getTime())));return this.formatGermanDate(a)}else return t}nextDay(t){let i=this.loadPlans(),e=this.parseGermanDate(t),o=[];for(let a in i){let r=this.parseGermanDate(a);r>e&&o.push(r)}if(o.length>0){let a=new Date(Math.min(...o.map(r=>r.getTime())));return this.formatGermanDate(a)}else return t}parseGermanDate(t){let[i,e,o]=t.split(".").map(Number);return new Date(o,e-1,i)}formatGermanDate(t){return t.toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit",year:"numeric"})}},S=new P;function G(n){let t=document.createElement("table");t.className="abschnitt-summe";let i=S.loadSections(n)??[];function e(d){return i.filter(f=>!d||f.location===d).map(f=>f.durationInMinutes()).reduce((f,h)=>f+h,0)}function o(d){let f=Math.floor(d/60),h=d-60*f;return new w(f,h)}function a(d){return(typeof d=="number"?d:d.industrial()).toFixed(2)}function r(d,f,h){let y=h?` data-testid="${h}"`:"",E=h?`${h}-industry-combined`:void 0,T=E?` data-testid="${E}"`:"";return`
          <tr>
            <td>${d}</td>
            <td${y}>${f.formattedString()}</td>
            <td${T}>${a(f)} / ${a(f.industrialQuarterPrecision())}</td>
          </tr>`}function s(){let d=o(e()),f=U.map(h=>r(h,o(e(h)))).join("");t.innerHTML=`
      <thead align="center">
        <tr>
          <th>Arbeitsort</th>
          <th>Gesamtdauer</th>
          <th>Industriezeit (exakt/gerundet)</th>
        </tr>
      </thead>
      <tbody align="center">${f}${r("Gesamt",d,"fullduration")}
      </tbody>`}function l(d){n=d,i=S.loadSections(n)??[],s()}return s(),{element:t,update:l}}function V(){return new URLSearchParams(window.location.search).get("view")==="zeit-verteilung"?"zeit-verteilung":"day-plan"}function z(n,t){return t==="zeit-verteilung"?`/?day=${n}&view=zeit-verteilung`:`/?day=${n}`}var B={"end-before-start":"Die Enduhrzeit darf nicht vor der Startuhrzeit liegen.",overlap:"Der Abschnitt \xFCberschneidet sich zeitlich mit einem anderen Abschnitt."};function mt(n,t){return n.startTime.inMinutes()<t.endTime.inMinutes()&&t.startTime.inMinutes()<n.endTime.inMinutes()}function J(n,t){if(n.endTime.inMinutes()<n.startTime.inMinutes())return{type:"end-before-start",message:B["end-before-start"]};if(t.some(i=>mt(n,i)))return{type:"overlap",message:B.overlap}}var pt={check:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>',close:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/></svg>',edit:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>',info:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>',delete:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>',login:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M11 7L9.6 8.4l2.6 2.6H2v2h10.2l-2.6 2.6L11 17l5-5-5-5zm9 12h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-8v2h8v14z"/></svg>',logout:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg>'};function _(n){return pt[n]||""}function I(n,t){for(let[i,e]of Object.entries(t))n.querySelector(`[data-action="${i}"]`)?.addEventListener("click",e)}function Z(n,t,i,e,o,a,r){let s=document.createElement("div");s.className="abschnitt-host";let l=n?.startTime?.hour??0,d=n?.startTime?.minute??0,f=n?.endTime?.hour??0,h=n?.endTime?.minute??0,y=n?.location??L.UNASSIGNED;function E(m,x,p){return i?`<input class="abschnitt-time-cell" type="number" min="0" max="${p}" value="${m}" ${x} />`:`<span class="abschnitt-time-cell" ${x}>${m.toString().padStart(2,"0")}</span>`}function T(){return i?`
        <select class="abschnitt-location-cell" data-location>
          <option value="${L.UNASSIGNED}" ${y===L.UNASSIGNED?"selected":""}>${N[L.UNASSIGNED]}</option>
          <option value="${L.OFFICE}" ${y===L.OFFICE?"selected":""}>${N[L.OFFICE]}</option>
          <option value="${L.MOBILE}" ${y===L.MOBILE?"selected":""}>${N[L.MOBILE]}</option>
        </select>`:`<span class="abschnitt-location-cell" data-location>${N[y]}</span>`}function D(){return i?`
        <div class="abschnitt-icon-zone">
          <span data-action="abort">${_("close")}</span>
          <span data-action="finish">${_("check")}</span>
          <span data-action="delete">${_("delete")}</span>
        </div>`:`
      <div class="abschnitt-icon-zone">
        <span data-action="edit">${_("edit")}</span>
        <span data-action="delete">${_("delete")}</span>
      </div>`}function c(){s.classList.toggle("abschnitt-edit",i);let m=E(l,"data-start-hour",23)+'<span class="abschnitt-time-sep">:</span>'+E(d,"data-start-minute",59)+'<span class="abschnitt-time-sep abschnitt-time-sep--range"> - </span>'+E(f,"data-end-hour",23)+'<span class="abschnitt-time-sep">:</span>'+E(h,"data-end-minute",59);s.innerHTML=`
      <div class="abschnitt-row">
        <div class="abschnitt-time-range">${m}</div>
        ${T()}
        ${D()}
      </div>`,b()}function b(){i?(s.querySelector("[data-start-hour]")?.addEventListener("input",m=>{l=parseInt(m.target.value,10)||0}),s.querySelector("[data-start-minute]")?.addEventListener("input",m=>{d=parseInt(m.target.value,10)||0}),s.querySelector("[data-end-hour]")?.addEventListener("input",m=>{f=parseInt(m.target.value,10)||0}),s.querySelector("[data-end-minute]")?.addEventListener("input",m=>{h=parseInt(m.target.value,10)||0}),s.querySelector("[data-location]")?.addEventListener("change",m=>{y=m.target.value}),I(s,{finish:()=>{let m=new w(l,d),x=new w(f,h),p=new M(m,x,y),u=a?.(p);if(u){r?.(u);return}t&&t(p),e&&e(!1)},abort:()=>{e&&e(!1)},delete:()=>{o&&o()}})):I(s,{edit:()=>{l=n?.startTime?.hour??0,d=n?.startTime?.minute??0,f=n?.endTime?.hour??0,h=n?.endTime?.minute??0,y=n?.location??L.UNASSIGNED,e&&e(!0)},delete:()=>{o&&o()}})}function g(m,x){n=m,i=x,l=n?.startTime?.hour??0,d=n?.startTime?.minute??0,f=n?.endTime?.hour??0,h=n?.endTime?.minute??0,y=n?.location??L.UNASSIGNED,c()}return c(),{element:s,update:g}}function j(n,t){let i=document.createElement("div");i.className="abschnitt-liste-host abschnitt-liste";let e=S.loadSections(n)??[],o=[],a=-1,r,s;function l(){S.saveSections(n,e),t?.(e)}function d(p){let u=J(p,e);return u?(s=u,g(),!1):(e=[...e,p],r=void 0,s=void 0,l(),g(),!0)}function f(p){r={section:e[p],index:p},e=e.filter((u,v)=>v!==p),p===a?a=-1:p<a&&(a-=1),l(),g()}function h(){if(!r)return;let{section:p,index:u}=r;r=void 0,e=[...e.slice(0,u),p,...e.slice(u)],u<=a&&(a+=1),l(),g()}function y(p,u){e=e.map((v,A)=>A===p?u:v),r=void 0,s=void 0,l(),a=-1,g()}function E(p){s=p,g()}function T(){s=void 0,g()}function D(){r=void 0,g()}function c(){return s?`
      <div class="abschnitt-liste__undo-toast abschnitt-liste__validation-toast" data-testid="validation-toast" role="alert">
        <span>${s.message}</span>
        <button type="button" class="abschnitt-liste__undo-close" data-action="dismiss-validation" aria-label="Meldung ausblenden">${_("close")}</button>
      </div>`:""}function b(){return r?`
      <div class="abschnitt-liste__undo-toast" data-testid="undo-toast" role="status">
        <span>Abschnitt gel\xF6scht.</span>
        <button type="button" class="abschnitt-liste__undo-button" data-action="undo">R\xFCckg\xE4ngig</button>
        <button type="button" class="abschnitt-liste__undo-close" data-action="dismiss-undo" aria-label="Meldung ausblenden">${_("close")}</button>
      </div>`:""}function g(){o.forEach(p=>{p.element.remove()}),o=[],i.innerHTML=`
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
        ${e.map((p,u)=>`
          <li class="mat-list-item abschnitt-item" data-index="${u}" data-testid="section-${u}"></li>
        `).join("")}
      </ul>
      ${b()}
      ${c()}`,i.querySelectorAll("[data-index]").forEach(p=>{let u=parseInt(p.dataset.index,10),v=e[u],k=Z(v,$=>y(u,$),u===a,$=>{$?a=u:a=-1,g()},()=>f(u),$=>J($,e.filter((ht,dt)=>dt!==u)),$=>E($));k.element.classList.add("abschnitt-cell"),p.appendChild(k.element),o.push(k)}),m()}function m(){i.querySelector('[data-action="undo"]')?.addEventListener("click",h),i.querySelector('[data-action="dismiss-undo"]')?.addEventListener("click",D),i.querySelector('[data-action="dismiss-validation"]')?.addEventListener("click",T)}function x(p){n=p,e=S.loadSections(n)??[],a=-1,r=void 0,s=void 0,g()}return g(),{element:i,update:x,addAbschnitt:d}}function K(n,t){let i=document.createElement("div");i.className="stempeluhr";let e=S.loadStartTime(n),o=!1,a=e?.hour??0,r=e?.minute??0;function s(){return e?o?`<span class="stempeluhr__time-inputs">
                 <input type="number" min="0" max="23" value="${a}" data-hour />
                 :
                 <input type="number" min="0" max="59" value="${r}" data-minute />
                 <span data-action="finish">${_("check")}</span>
                 <span data-action="abort">${_("close")}</span>
               </span>`:`<span class="stempeluhr__time-display" data-testid="login-time">
               ${e.formattedString()}
               <span data-action="edit">${_("edit")}</span>
             </span>`:'<i class="stempeluhr__placeholder">noch nicht eingestempelt</i>'}function l(){i.innerHTML=`
      <span class="stempeluhr__label">Eingestempelt um:</span>
      <div class="stempeluhr__value">${s()}</div>
      <button class="mat-button stempeluhr__button" data-testid="log-button">
        <span data-action>${e?_("logout"):_("login")}</span>
        <span class="stempeluhr__button-label">${e?"Ausstempeln":"Einstempeln"}</span>
      </button>`,d()}function d(){if(o){let h=i.querySelector("[data-hour]"),y=i.querySelector("[data-minute]");h&&h.addEventListener("input",E=>{a=parseInt(E.target.value,10)||0}),y&&y.addEventListener("input",E=>{r=parseInt(E.target.value,10)||0}),I(i,{finish:()=>{e=new w(a,r),o=!1,S.saveStartTime(n,e),l()},abort:()=>{o=!1,a=e?.hour??0,r=e?.minute??0,l()}})}else I(i,{edit:()=>{a=e?.hour??0,r=e?.minute??0,o=!0,l()}});i.querySelector('[data-testid="log-button"]')?.addEventListener("click",()=>{if(!e)e=w.now(),S.saveStartTime(n,e),l();else{let h=new M(e,w.now());if(t&&t(h)===!1)return;e=void 0,S.saveStartTime(n,e),l()}})}function f(h){n=h,e=S.loadStartTime(n),o=!1,a=e?.hour??0,r=e?.minute??0,l()}return l(),{element:i,update:f}}function Q(n,t,i){let e=document.createElement("section");e.className="day-plan";let o,a;function r(){e.innerHTML=`
      <header class="day-plan__header">
        <h1 data-testid="dayplan-title"></h1>
        <a class="day-plan__verteilung-link mat-button" data-testid="open-zeitverteilung" href="${z(n,"zeit-verteilung")}">Zeit verteilen</a>
      </header>`,e.querySelector('[data-testid="open-zeitverteilung"]')?.addEventListener("click",l=>{i&&(l.preventDefault(),i())}),e.querySelector('[data-testid="dayplan-title"]').textContent=`Tagesplan f\xFCr den ${n}`,a=j(n,t),o=K(n,l=>a.addAbschnitt(l)),o.element.classList.add("day-plan__clock"),a.element.classList.add("day-plan__list"),e.appendChild(o.element),e.appendChild(a.element)}function s(l){n=l,e.querySelector('[data-testid="dayplan-title"]').textContent=`Tagesplan f\xFCr den ${n}`;let d=e.querySelector('[data-testid="open-zeitverteilung"]');d&&(d.href=z(n,"zeit-verteilung")),o?.update(l),a?.update(l)}return r(),{element:e,update:s}}function W(){let n=document.createElement("a");n.className="download-plans",n.textContent="Daten exportieren";function t(){let i=S.loadPlans(),e=JSON.stringify(i),o=new Blob([e],{type:"application/json"}),a=URL.createObjectURL(o),r=new Date,s=f=>f.toString().padStart(2,"0"),d=`dayplans_${r.getFullYear()+"-"+s(r.getMonth()+1)+"-"+s(r.getDate())+"_"+s(r.getHours())+"-"+s(r.getMinutes())+"-"+s(r.getSeconds())}.json`;n.setAttribute("href",a),n.setAttribute("download",d)}return t(),{element:n}}var Y="2026-10-28 19:38:09 +0000",X="a95c9d7",tt="https://github.com/mohrm/workingdiary/commit/a95c9d7";function et(){return Y}function nt(){return X}function it(){return tt}function ot(){let n=document.createElement("div");n.className="version-info",n.innerHTML=`
    <button type="button" class="version-info__button" data-testid="version-info" aria-label="Informationen anzeigen">
      ${_("info")}
    </button>
    <dialog class="version-info__dialog" data-testid="version-info-dialog" aria-labelledby="version-info-title">
      <h2 class="version-info__title" id="version-info-title">Informationen</h2>
      <p class="version-info__entry">Zuletzt ge\xE4ndert: ${et()}</p>
      <p class="version-info__entry">Commit: <a href="${it()}">${nt()}</a></p>
      <p class="version-info__entry">Viewport pr\xFCfen: <a href="https://mohrm.github.io/viewport-checker/" target="_blank" rel="noopener">mohrm.github.io/viewport-checker</a></p>
      <div class="version-info__actions">
        <div class="version-info__export" data-download-plans></div>
        <button type="button" class="version-info__close" data-testid="version-info-close">${_("close")}Schlie\xDFen</button>
      </div>
    </dialog>`;let t=n.querySelector('[data-testid="version-info"]'),i=n.querySelector('[data-testid="version-info-dialog"]'),e=n.querySelector('[data-testid="version-info-close"]');return t.addEventListener("click",()=>i.showModal()),e.addEventListener("click",()=>i.close()),i.addEventListener("click",o=>{o.target===i&&i.close()}),{element:n}}var at=["Programmierung","Meetings","Dokumentation","Support"],q="nicht verteilte Zeit";function R(n){let i=(S.loadSections(n)??[]).map(e=>e.durationInMinutes()).reduce((e,o)=>e+o,0);return F(i)}function rt(n,t){let i=document.createElement("section");i.className="zeit-verteilung";let e="",o;function a(c){return c.map(b=>b.minutes).reduce((b,g)=>b+g,0)}function r(c){S.saveTimeDistribution(n,c)}function s(c,b){let g=S.loadTimeDistribution(n)??[],m=c.trim();if(!m)return o="Bitte eine T\xE4tigkeit angeben.",T(),!1;if(m===q)return o="Diese T\xE4tigkeit ist reserviert.",T(),!1;if(g.some(v=>v.name===m))return o="Diese T\xE4tigkeit gibt es schon.",T(),!1;let p=R(n)-a(g),u=Math.max(0,Math.min(b,p));return b>p?(o="So viel Zeit ist nicht mehr frei.",T(),!1):(o=void 0,r([...g,new C(m,u)]),T(),!0)}function l(){let c=i.querySelector('[data-testid="neue-taetigkeit"]'),b=i.querySelector('[data-testid="neue-taetigkeit-minuten"]'),g=c?.value??e,m=y(b?.value??"");e="",s(g,H(m))}function d(c){if((S.loadTimeDistribution(n)??[]).some(g=>g.name===c)){o="Diese T\xE4tigkeit gibt es schon.",T();return}s(c,0)}function f(c){let b=S.loadTimeDistribution(n)??[];r(b.filter((g,m)=>m!==c)),T()}function h(c,b){let g=S.loadTimeDistribution(n)??[],m=R(n),x=g.filter((u,v)=>v!==c).map(u=>u.minutes).reduce((u,v)=>u+v,0),p=Math.max(0,Math.min(b,m-x));r(g.map((u,v)=>v===c?new C(u.name,p):u)),T()}function y(c){return parseFloat(c.replace(",","."))||0}function E(c,b){return`
      <li class="zeit-verteilung__row mat-list-item" data-index="${b}">
        <span class="zeit-verteilung__name" data-testid="taetigkeit-${b}">${c.name}</span>
        <input class="zeit-verteilung__minuten" type="number" min="0" step="0.01" value="${(c.minutes/100).toFixed(2).replace(".",",")}" data-minuten-index="${b}" aria-label="Dauer in Industrieminuten f\xFCr ${c.name}" />
        <button type="button" class="zeit-verteilung__delete" data-action="delete-${b}" data-testid="delete-taetigkeit-${b}" aria-label="${c.name} entfernen">${_("delete")}</button>
      </li>`}function T(){let c=R(n),b=S.loadTimeDistribution(n)??[],g=a(b),m=Math.max(0,c-g),x=at.filter(v=>!b.some(A=>A.name===v));i.innerHTML=`
      <header class="zeit-verteilung__header">
        <h1 data-testid="zeitverteilung-title">Zeitverteilung f\xFCr den ${n}</h1>
      </header>
      <p class="zeit-verteilung__gesamt">
        Gesamtdauer: <span data-testid="zeitverteilung-gesamt">${(c/100).toFixed(2).replace(".",",")}</span> Industrieminuten
      </p>
      <div class="zeit-verteilung__neu">
        <input class="zeit-verteilung__input" type="text" placeholder="Neue T\xE4tigkeit" value="${e}" data-testid="neue-taetigkeit" data-neue-taetigkeit />
        <input class="zeit-verteilung__input zeit-verteilung__input--minuten" type="number" min="0" step="0.01" placeholder="Dauer" data-testid="neue-taetigkeit-minuten" />
        <button type="button" class="mat-button zeit-verteilung__add" data-action="add-freitext" data-testid="add-taetigkeit">${_("check")}Hinzuf\xFCgen</button>
      </div>
      ${x.length>0?`
      <div class="zeit-verteilung__vorschlaege">
        ${x.map(v=>`<button type="button" class="mat-button zeit-verteilung__vorschlag" data-vorschlag="${v}">${v}</button>`).join("")}
      </div>`:""}
      <ul class="zeit-verteilung__liste mat-list">
        ${b.map((v,A)=>E(v,A)).join("")}
        <li class="zeit-verteilung__row zeit-verteilung__row--unverteilt mat-list-item">
          <span class="zeit-verteilung__name" data-testid="unverteilt-name">${q}</span>
          <span class="zeit-verteilung__minuten zeit-verteilung__minuten--fix" data-testid="unverteilt-minuten">${(m/100).toFixed(2).replace(".",",")}</span>
          <span class="zeit-verteilung__delete"></span>
        </li>
      </ul>
      ${o?`<div class="zeit-verteilung__fehler" data-testid="zeitverteilung-fehler" role="alert">${o}</div>`:""}
      <button type="button" class="mat-button zeit-verteilung__back" data-action="back" data-testid="back-to-dayplan">${_("logout")}Zur\xFCck zum Tagesplan</button>`,i.querySelector("[data-neue-taetigkeit]")?.addEventListener("input",v=>{e=v.target.value}),i.querySelectorAll("[data-minuten-index]").forEach(v=>{let A=parseInt(v.dataset.minutenIndex??"",10);v.addEventListener("change",k=>{h(A,H(y(k.target.value)))})}),i.querySelectorAll("[data-vorschlag]").forEach(v=>{v.addEventListener("click",()=>{d(v.getAttribute("data-vorschlag")??"")})});let u={"add-freitext":l,back:()=>t?.()};b.forEach((v,A)=>{u[`delete-${A}`]=()=>f(A)}),I(i,u)}function D(c){n=c,e="",o=void 0,T()}return T(),{element:i,update:D}}function ft(){return new Date().toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit",year:"numeric"})}function st(){return new URLSearchParams(window.location.search).get("day")??ft()}function O(n,t="day-plan"){history.pushState({day:n},"",z(n,t))}function lt(){let n=document.createElement("div");n.className="app-shell";let t=st(),i=V(),e,o,a,r,s;function l(){n.innerHTML=`
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
      </div>`,r=W(),s=ot();let T=n.querySelector("[data-view]");i==="zeit-verteilung"?(o=rt(t,f),T.appendChild(o.element)):(e=Q(t,()=>a?.update(t),d),T.appendChild(e.element),e.element.querySelector(".day-plan__header").appendChild(s.element)),a=G(t),n.querySelector("[data-abschnitt-summe]").appendChild(a.element),n.querySelector("[data-download-plans]").appendChild(r.element),h()}function d(){i="zeit-verteilung",O(t,i),l()}function f(){i="day-plan",O(t,i),l()}function h(){let T=n.querySelector("[data-prev-link]"),D=n.querySelector("[data-next-link]");T?.addEventListener("click",c=>{c.preventDefault(),t=S.previousDay(t),O(t,i),y()}),D?.addEventListener("click",c=>{c.preventDefault(),t=S.nextDay(t),O(t,i),y()})}function y(){i==="zeit-verteilung"?o?.update(t):e?.update(t),a?.update(t),E()}function E(){let T=n.querySelector("[data-prev-link]"),D=n.querySelector("[data-next-link]");T&&(T.href=`/?day=${S.previousDay(t)}`),D&&(D.href=`/?day=${S.nextDay(t)}`)}return l(),{element:n,update(){t=st();let T=V();T!==i&&(i=T,l()),y()}}}var ct=document.querySelector("app-root");if(!ct)throw new Error("Root element <app-root> not found");var ut=lt();ct.appendChild(ut.element);window.addEventListener("popstate",()=>ut.update());
//# sourceMappingURL=main-VSKHQWMU.js.map
