var p={UNASSIGNED:"nicht zugeordnet",OFFICE:"B\xFCro",MOBILE:"mobil"},P=Object.values(p).filter(n=>n!==p.UNASSIGNED),D={[p.UNASSIGNED]:"kein",[p.OFFICE]:p.OFFICE,[p.MOBILE]:p.MOBILE};var b=class n{hour;minute;static now(){let e=new Date;return new n(e.getHours(),e.getMinutes())}constructor(e,i){this.hour=e,this.minute=i}inMinutes(){return 60*this.hour+this.minute}industrial(){return this.inMinutes()/60}industrialQuarterPrecision(){return Math.round(4*this.industrial())/4}formattedString(){return this.hour.toString().padStart(2,"0")+":"+this.minute.toString().padStart(2,"0")}toJSON(){return{hour:this.hour,minute:this.minute}}static fromJSON(e){return new n(e.hour,e.minute)}};var E=class n{startTime;endTime;location;constructor(e,i,t=p.UNASSIGNED){this.startTime=e,this.endTime=i,this.location=t}formattedString(){return`${`${this.startTime.formattedString()} - ${this.endTime.formattedString()}`} (${this.location})`}durationInMinutes(){return this.endTime.inMinutes()-this.startTime.inMinutes()}toJSON(){return{startTime:this.startTime.toJSON(),endTime:this.endTime.toJSON(),location:this.location}}static fromJSON(e){return new n(b.fromJSON(e.startTime),b.fromJSON(e.endTime),e.location??p.UNASSIGNED)}};var N=class{initPlans(){let e={};return localStorage.setItem("plans",JSON.stringify(e)),e}loadPlans(){let e=localStorage.getItem("plans");return e?JSON.parse(e):this.initPlans()}initDay(e,i){let t={};return e[i]=t,localStorage.setItem("plans",JSON.stringify(e)),t}loadDayPlan(e){let i=this.loadPlans();return i[e]||this.initDay(i,e),i}saveStartTime(e,i){let t=this.loadDayPlan(e);i?t[e].startTime=i:t[e].startTime=void 0,localStorage.setItem("plans",JSON.stringify(t))}loadStartTime(e){let t=this.loadDayPlan(e)[e].startTime;if(t)return new b(t.hour,t.minute)}saveSections(e,i){let t=this.loadDayPlan(e);t[e].sections=i,localStorage.setItem("plans",JSON.stringify(t))}loadSections(e){let t=this.loadDayPlan(e)[e].sections;if(t)return t.map(o=>E.fromJSON(o))}previousDay(e){let i=this.loadPlans(),t=this.parseGermanDate(e),o=[];for(let s in i){let a=this.parseGermanDate(s);a<t&&o.push(a)}if(o.length>0){let s=new Date(Math.max(...o.map(a=>a.getTime())));return this.formatGermanDate(s)}else return e}nextDay(e){let i=this.loadPlans(),t=this.parseGermanDate(e),o=[];for(let s in i){let a=this.parseGermanDate(s);a>t&&o.push(a)}if(o.length>0){let s=new Date(Math.min(...o.map(a=>a.getTime())));return this.formatGermanDate(s)}else return e}parseGermanDate(e){let[i,t,o]=e.split(".").map(Number);return new Date(o,t-1,i)}formatGermanDate(e){return e.toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit",year:"numeric"})}},v=new N;function k(n){let e=document.createElement("table");e.className="abschnitt-summe";let i=v.loadSections(n)??[];function t(d){return i.filter(l=>!d||l.location===d).map(l=>l.durationInMinutes()).reduce((l,c)=>l+c,0)}function o(d){let l=Math.floor(d/60),c=d-60*l;return new b(l,c)}function s(d){return(typeof d=="number"?d:d.industrial()).toFixed(2)}function a(d,l,c){let f=c?` data-testid="${c}"`:"",y=c?`${c}-industry-combined`:void 0,C=y?` data-testid="${y}"`:"";return`
          <tr>
            <td>${d}</td>
            <td${f}>${l.formattedString()}</td>
            <td${C}>${s(l)} / ${s(l.industrialQuarterPrecision())}</td>
          </tr>`}function r(){let d=o(t()),l=P.map(c=>a(c,o(t(c)))).join("");e.innerHTML=`
      <thead align="center">
        <tr>
          <th>Arbeitsort</th>
          <th>Gesamtdauer</th>
          <th>Industriezeit (exakt/gerundet)</th>
        </tr>
      </thead>
      <tbody align="center">${l}${a("Gesamt",d,"fullduration")}
      </tbody>`}function u(d){n=d,i=v.loadSections(n)??[],r()}return r(),{element:e,update:u}}var J={"end-before-start":"Die Enduhrzeit darf nicht vor der Startuhrzeit liegen.",overlap:"Der Abschnitt \xFCberschneidet sich zeitlich mit einem anderen Abschnitt."};function it(n,e){return n.startTime.inMinutes()<e.endTime.inMinutes()&&e.startTime.inMinutes()<n.endTime.inMinutes()}function O(n,e){if(n.endTime.inMinutes()<n.startTime.inMinutes())return{type:"end-before-start",message:J["end-before-start"]};if(e.some(i=>it(n,i)))return{type:"overlap",message:J.overlap}}var ot={check:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>',close:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/></svg>',edit:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>',info:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>',delete:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>',login:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M11 7L9.6 8.4l2.6 2.6H2v2h10.2l-2.6 2.6L11 17l5-5-5-5zm9 12h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-8v2h8v14z"/></svg>',logout:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg>'};function S(n){return ot[n]||""}function _(n,e){for(let[i,t]of Object.entries(e))n.querySelector(`[data-action="${i}"]`)?.addEventListener("click",t)}function q(n,e,i,t,o,s,a){let r=document.createElement("div");r.className="abschnitt-host";let u=n?.startTime?.hour??0,d=n?.startTime?.minute??0,l=n?.endTime?.hour??0,c=n?.endTime?.minute??0,f=n?.location??p.UNASSIGNED;function y(g,L,m){return i?`<input class="abschnitt-time-cell" type="number" min="0" max="${m}" value="${g}" ${L} />`:`<span class="abschnitt-time-cell" ${L}>${g.toString().padStart(2,"0")}</span>`}function C(){return i?`
        <select class="abschnitt-location-cell" data-location>
          <option value="${p.UNASSIGNED}" ${f===p.UNASSIGNED?"selected":""}>${D[p.UNASSIGNED]}</option>
          <option value="${p.OFFICE}" ${f===p.OFFICE?"selected":""}>${D[p.OFFICE]}</option>
          <option value="${p.MOBILE}" ${f===p.MOBILE?"selected":""}>${D[p.MOBILE]}</option>
        </select>`:`<span class="abschnitt-location-cell" data-location>${D[f]}</span>`}function M(){return i?`
        <div class="abschnitt-icon-zone">
          <span data-action="abort">${S("close")}</span>
          <span data-action="finish">${S("check")}</span>
          <span data-action="delete">${S("delete")}</span>
        </div>`:`
      <div class="abschnitt-icon-zone">
        <span data-action="edit">${S("edit")}</span>
        <span data-action="delete">${S("delete")}</span>
      </div>`}function A(){r.classList.toggle("abschnitt-edit",i);let g=y(u,"data-start-hour",23)+'<span class="abschnitt-time-sep">:</span>'+y(d,"data-start-minute",59)+'<span class="abschnitt-time-sep abschnitt-time-sep--range"> - </span>'+y(l,"data-end-hour",23)+'<span class="abschnitt-time-sep">:</span>'+y(c,"data-end-minute",59);r.innerHTML=`
      <div class="abschnitt-row">
        <div class="abschnitt-time-range">${g}</div>
        ${C()}
        ${M()}
      </div>`,$()}function $(){i?(r.querySelector("[data-start-hour]")?.addEventListener("input",g=>{u=parseInt(g.target.value,10)||0}),r.querySelector("[data-start-minute]")?.addEventListener("input",g=>{d=parseInt(g.target.value,10)||0}),r.querySelector("[data-end-hour]")?.addEventListener("input",g=>{l=parseInt(g.target.value,10)||0}),r.querySelector("[data-end-minute]")?.addEventListener("input",g=>{c=parseInt(g.target.value,10)||0}),r.querySelector("[data-location]")?.addEventListener("change",g=>{f=g.target.value}),_(r,{finish:()=>{let g=new b(u,d),L=new b(l,c),m=new E(g,L,f),h=s?.(m);if(h){a?.(h);return}e&&e(m),t&&t(!1)},abort:()=>{t&&t(!1)},delete:()=>{o&&o()}})):_(r,{edit:()=>{u=n?.startTime?.hour??0,d=n?.startTime?.minute??0,l=n?.endTime?.hour??0,c=n?.endTime?.minute??0,f=n?.location??p.UNASSIGNED,t&&t(!0)},delete:()=>{o&&o()}})}function T(g,L){n=g,i=L,u=n?.startTime?.hour??0,d=n?.startTime?.minute??0,l=n?.endTime?.hour??0,c=n?.endTime?.minute??0,f=n?.location??p.UNASSIGNED,A()}return A(),{element:r,update:T}}function R(n,e){let i=document.createElement("div");i.className="abschnitt-liste-host abschnitt-liste";let t=v.loadSections(n)??[],o=[],s=-1,a,r;function u(){v.saveSections(n,t),e?.(t)}function d(m){let h=O(m,t);return h?(r=h,T(),!1):(t=[...t,m],a=void 0,r=void 0,u(),T(),!0)}function l(m){a={section:t[m],index:m},t=t.filter((h,x)=>x!==m),m===s?s=-1:m<s&&(s-=1),u(),T()}function c(){if(!a)return;let{section:m,index:h}=a;a=void 0,t=[...t.slice(0,h),m,...t.slice(h)],h<=s&&(s+=1),u(),T()}function f(m,h){t=t.map((x,H)=>H===m?h:x),a=void 0,r=void 0,u(),s=-1,T()}function y(m){r=m,T()}function C(){r=void 0,T()}function M(){a=void 0,T()}function A(){return r?`
      <div class="abschnitt-liste__undo-toast abschnitt-liste__validation-toast" data-testid="validation-toast" role="alert">
        <span>${r.message}</span>
        <button type="button" class="abschnitt-liste__undo-close" data-action="dismiss-validation" aria-label="Meldung ausblenden">${S("close")}</button>
      </div>`:""}function $(){return a?`
      <div class="abschnitt-liste__undo-toast" data-testid="undo-toast" role="status">
        <span>Abschnitt gel\xF6scht.</span>
        <button type="button" class="abschnitt-liste__undo-button" data-action="undo">R\xFCckg\xE4ngig</button>
        <button type="button" class="abschnitt-liste__undo-close" data-action="dismiss-undo" aria-label="Meldung ausblenden">${S("close")}</button>
      </div>`:""}function T(){o.forEach(m=>{m.element.remove()}),o=[],i.innerHTML=`
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
        ${t.map((m,h)=>`
          <li class="mat-list-item abschnitt-item" data-index="${h}" data-testid="section-${h}"></li>
        `).join("")}
      </ul>
      ${$()}
      ${A()}`,i.querySelectorAll("[data-index]").forEach(m=>{let h=parseInt(m.dataset.index,10),x=t[h],I=q(x,w=>f(h,w),h===s,w=>{w?s=h:s=-1,T()},()=>l(h),w=>O(w,t.filter((rt,nt)=>nt!==h)),w=>y(w));I.element.classList.add("abschnitt-cell"),m.appendChild(I.element),o.push(I)}),g()}function g(){i.querySelector('[data-action="undo"]')?.addEventListener("click",c),i.querySelector('[data-action="dismiss-undo"]')?.addEventListener("click",M),i.querySelector('[data-action="dismiss-validation"]')?.addEventListener("click",C)}function L(m){n=m,t=v.loadSections(n)??[],s=-1,a=void 0,r=void 0,T()}return T(),{element:i,update:L,addAbschnitt:d}}function V(n,e){let i=document.createElement("div");i.className="stempeluhr";let t=v.loadStartTime(n),o=!1,s=t?.hour??0,a=t?.minute??0;function r(){return t?o?`<span class="stempeluhr__time-inputs">
                 <input type="number" min="0" max="23" value="${s}" data-hour />
                 :
                 <input type="number" min="0" max="59" value="${a}" data-minute />
                 <span data-action="finish">${S("check")}</span>
                 <span data-action="abort">${S("close")}</span>
               </span>`:`<span class="stempeluhr__time-display" data-testid="login-time">
               ${t.formattedString()}
               <span data-action="edit">${S("edit")}</span>
             </span>`:'<i class="stempeluhr__placeholder">noch nicht eingestempelt</i>'}function u(){i.innerHTML=`
      <span class="stempeluhr__label">Eingestempelt um:</span>
      <div class="stempeluhr__value">${r()}</div>
      <button class="mat-button stempeluhr__button" data-testid="log-button">
        <span data-action>${t?S("logout"):S("login")}</span>
        <span class="stempeluhr__button-label">${t?"Ausstempeln":"Einstempeln"}</span>
      </button>`,d()}function d(){if(o){let c=i.querySelector("[data-hour]"),f=i.querySelector("[data-minute]");c&&c.addEventListener("input",y=>{s=parseInt(y.target.value,10)||0}),f&&f.addEventListener("input",y=>{a=parseInt(y.target.value,10)||0}),_(i,{finish:()=>{t=new b(s,a),o=!1,v.saveStartTime(n,t),u()},abort:()=>{o=!1,s=t?.hour??0,a=t?.minute??0,u()}})}else _(i,{edit:()=>{s=t?.hour??0,a=t?.minute??0,o=!0,u()}});i.querySelector('[data-testid="log-button"]')?.addEventListener("click",()=>{if(!t)t=b.now(),v.saveStartTime(n,t),u();else{let c=new E(t,b.now());if(e&&e(c)===!1)return;t=void 0,v.saveStartTime(n,t),u()}})}function l(c){n=c,t=v.loadStartTime(n),o=!1,s=t?.hour??0,a=t?.minute??0,u()}return u(),{element:i,update:l}}function z(n,e){let i=document.createElement("section");i.className="day-plan";let t,o;function s(){i.innerHTML=`
      <header class="day-plan__header">
        <h1 data-testid="dayplan-title"></h1>
      </header>`,i.querySelector('[data-testid="dayplan-title"]').textContent=`Tagesplan f\xFCr den ${n}`,o=R(n,e),t=V(n,r=>o.addAbschnitt(r)),t.element.classList.add("day-plan__clock"),o.element.classList.add("day-plan__list"),i.appendChild(t.element),i.appendChild(o.element)}function a(r){n=r,i.querySelector('[data-testid="dayplan-title"]').textContent=`Tagesplan f\xFCr den ${n}`,t?.update(r),o?.update(r)}return s(),{element:i,update:a}}function G(){let n=document.createElement("a");n.className="download-plans",n.textContent="Daten exportieren";function e(){let i=v.loadPlans(),t=JSON.stringify(i),o=new Blob([t],{type:"application/json"}),s=URL.createObjectURL(o),a=new Date,r=l=>l.toString().padStart(2,"0"),d=`dayplans_${a.getFullYear()+"-"+r(a.getMonth()+1)+"-"+r(a.getDate())+"_"+r(a.getHours())+"-"+r(a.getMinutes())+"-"+r(a.getSeconds())}.json`;n.setAttribute("href",s),n.setAttribute("download",d)}return e(),{element:n}}var U="2026-10-28 12:21:48 +0000",B="f3d0ff0",F="https://github.com/mohrm/workingdiary/commit/f3d0ff0";function j(){return U}function Z(){return B}function K(){return F}function Q(){let n=document.createElement("div");n.className="version-info",n.innerHTML=`
    <button type="button" class="version-info__button" data-testid="version-info" aria-label="Informationen anzeigen">
      ${S("info")}
    </button>
    <dialog class="version-info__dialog" data-testid="version-info-dialog" aria-labelledby="version-info-title">
      <h2 class="version-info__title" id="version-info-title">Informationen</h2>
      <p class="version-info__entry">Zuletzt ge\xE4ndert: ${j()}</p>
      <p class="version-info__entry">Commit: <a href="${K()}">${Z()}</a></p>
      <p class="version-info__entry">Viewport pr\xFCfen: <a href="https://mohrm.github.io/viewport-checker/" target="_blank" rel="noopener">mohrm.github.io/viewport-checker</a></p>
      <div class="version-info__actions">
        <div class="version-info__export" data-download-plans></div>
        <button type="button" class="version-info__close" data-testid="version-info-close">${S("close")}Schlie\xDFen</button>
      </div>
    </dialog>`;let e=n.querySelector('[data-testid="version-info"]'),i=n.querySelector('[data-testid="version-info-dialog"]'),t=n.querySelector('[data-testid="version-info-close"]');return e.addEventListener("click",()=>i.showModal()),t.addEventListener("click",()=>i.close()),i.addEventListener("click",o=>{o.target===i&&i.close()}),{element:n}}function at(){return new Date().toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit",year:"numeric"})}function W(){return new URLSearchParams(window.location.search).get("day")??at()}function Y(n){history.pushState({day:n},"",`/?day=${n}`)}function X(){let n=document.createElement("div");n.className="app-shell";let e=W(),i,t,o,s;function a(){n.innerHTML=`
      <main class="app-main" data-dayplan></main>
      <div class="app-bottom">
        <div class="app-summary" data-abschnitt-summe></div>
        <section class="app-navigation">
          <div class="app-navigation__row">
            <a class="app-navigation__link" data-prev-link href="#">Zur\xFCck</a>
            <div class="app-navigation__spacer"></div>
            <a class="app-navigation__link" data-next-link href="#">Vor</a>
          </div>
        </section>
      </div>`,i=z(e,()=>t?.update(e)),t=k(e),o=G(),s=Q(),n.querySelector("[data-dayplan]").appendChild(i.element),n.querySelector("[data-abschnitt-summe]").appendChild(t.element),i.element.querySelector(".day-plan__header").appendChild(s.element),n.querySelector("[data-download-plans]").appendChild(o.element),r()}function r(){let l=n.querySelector("[data-prev-link]"),c=n.querySelector("[data-next-link]");l?.addEventListener("click",f=>{f.preventDefault(),e=v.previousDay(e),Y(e),u()}),c?.addEventListener("click",f=>{f.preventDefault(),e=v.nextDay(e),Y(e),u()})}function u(){i?.update(e),t?.update(e),d()}function d(){let l=n.querySelector("[data-prev-link]"),c=n.querySelector("[data-next-link]");l&&(l.href=`/?day=${v.previousDay(e)}`),c&&(c.href=`/?day=${v.nextDay(e)}`)}return a(),{element:n,update(){e=W(),u()}}}var tt=document.querySelector("app-root");if(!tt)throw new Error("Root element <app-root> not found");var et=X();tt.appendChild(et.element);window.addEventListener("popstate",()=>et.update());
//# sourceMappingURL=main-B2OPA25L.js.map
