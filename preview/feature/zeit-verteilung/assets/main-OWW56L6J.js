var _={UNASSIGNED:"nicht zugeordnet",OFFICE:"B\xFCro",MOBILE:"mobil"},it=Object.values(_).filter(n=>n!==_.UNASSIGNED),U={[_.UNASSIGNED]:"kein",[_.OFFICE]:_.OFFICE,[_.MOBILE]:_.MOBILE};var x=class n{hour;minute;static now(){let t=new Date;return new n(t.getHours(),t.getMinutes())}constructor(t,i){this.hour=t,this.minute=i}inMinutes(){return 60*this.hour+this.minute}industrial(){return this.inMinutes()/60}industrialQuarterPrecision(){return Math.round(4*this.industrial())/4}formattedString(){return this.hour.toString().padStart(2,"0")+":"+this.minute.toString().padStart(2,"0")}toJSON(){return{hour:this.hour,minute:this.minute}}static fromJSON(t){return new n(t.hour,t.minute)}};var P=class n{name;minutes;constructor(t,i){this.name=t,this.minutes=i}toJSON(){return{name:this.name,minutes:this.minutes}}static fromJSON(t){return new n(t.name,t.minutes)}};function K(n){return Math.round(100*n)}function at(n){return Math.round(n*100/60)}var k=class n{startTime;endTime;location;constructor(t,i,e=_.UNASSIGNED){this.startTime=t,this.endTime=i,this.location=e}formattedString(){return`${`${this.startTime.formattedString()} - ${this.endTime.formattedString()}`} (${this.location})`}durationInMinutes(){return this.endTime.inMinutes()-this.startTime.inMinutes()}toJSON(){return{startTime:this.startTime.toJSON(),endTime:this.endTime.toJSON(),location:this.location}}static fromJSON(t){return new n(x.fromJSON(t.startTime),x.fromJSON(t.endTime),t.location??_.UNASSIGNED)}};var Q=class{initPlans(){let t={};return localStorage.setItem("plans",JSON.stringify(t)),t}loadPlans(){let t=localStorage.getItem("plans");return t?JSON.parse(t):this.initPlans()}initDay(t,i){let e={};return t[i]=e,localStorage.setItem("plans",JSON.stringify(t)),e}loadDayPlan(t){let i=this.loadPlans();return i[t]||this.initDay(i,t),i}saveStartTime(t,i){let e=this.loadDayPlan(t);i?e[t].startTime=i:e[t].startTime=void 0,localStorage.setItem("plans",JSON.stringify(e))}loadStartTime(t){let e=this.loadDayPlan(t)[t].startTime;if(e)return new x(e.hour,e.minute)}saveSections(t,i){let e=this.loadDayPlan(t);e[t].sections=i,localStorage.setItem("plans",JSON.stringify(e))}loadSections(t){let e=this.loadDayPlan(t)[t].sections;if(e)return e.map(r=>k.fromJSON(r))}saveActivities(t,i){let e=this.loadDayPlan(t);e[t].activities=i,localStorage.setItem("plans",JSON.stringify(e))}loadActivities(t){return this.loadDayPlan(t)[t].activities}saveTimeDistribution(t,i){let e=this.loadDayPlan(t);e[t].timeDistribution=i.map(r=>r.toJSON()),localStorage.setItem("plans",JSON.stringify(e))}loadTimeDistribution(t){let i=this.loadDayPlan(t)[t].timeDistribution;if(i)return i.map(e=>P.fromJSON(e))}recentActivityNames(t,i){let e=this.loadPlans(),r=this.parseGermanDate(t),o=new Date(r.getFullYear(),r.getMonth()-i,r.getDate()),a=[];for(let s in e){let l=this.parseGermanDate(s);if(l<o||l>r)continue;let m=(e[s].timeDistribution??[]).map(S=>S.name).filter(S=>S.length>0);m.length>0&&a.push({day:l,names:m})}a.sort((s,l)=>l.day.getTime()-s.day.getTime());let u=new Set,c=[];for(let s of a)for(let l of s.names)u.has(l)||(u.add(l),c.push(l));return c}previousDay(t){let i=this.loadPlans(),e=this.parseGermanDate(t),r=[];for(let o in i){let a=this.parseGermanDate(o);a<e&&r.push(a)}if(r.length>0){let o=new Date(Math.max(...r.map(a=>a.getTime())));return this.formatGermanDate(o)}else return t}nextDay(t){let i=this.loadPlans(),e=this.parseGermanDate(t),r=[];for(let o in i){let a=this.parseGermanDate(o);a>e&&r.push(a)}if(r.length>0){let o=new Date(Math.min(...r.map(a=>a.getTime())));return this.formatGermanDate(o)}else return t}parseGermanDate(t){let[i,e,r]=t.split(".").map(Number);return new Date(r,e-1,i)}formatGermanDate(t){return t.toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit",year:"numeric"})}},g=new Q;function rt(n){let t=document.createElement("table");t.className="abschnitt-summe";let i=g.loadSections(n)??[];function e(s){return i.filter(l=>!s||l.location===s).map(l=>l.durationInMinutes()).reduce((l,m)=>l+m,0)}function r(s){let l=Math.floor(s/60),m=s-60*l;return new x(l,m)}function o(s){return(typeof s=="number"?s:s.industrial()).toFixed(2)}function a(s,l,m){let S=m?` data-testid="${m}"`:"",E=m?`${m}-industry-combined`:void 0,L=E?` data-testid="${E}"`:"";return`
          <tr>
            <td>${s}</td>
            <td${S}>${l.formattedString()}</td>
            <td${L}>${o(l)} / ${o(l.industrialQuarterPrecision())}</td>
          </tr>`}function u(){let s=r(e()),l=it.map(m=>a(m,r(e(m)))).join("");t.innerHTML=`
      <thead align="center">
        <tr>
          <th>Arbeitsort</th>
          <th>Gesamtdauer</th>
          <th>Industriezeit (exakt/gerundet)</th>
        </tr>
      </thead>
      <tbody align="center">${l}${a("Gesamt",s,"fullduration")}
      </tbody>`}function c(s){n=s,i=g.loadSections(n)??[],u()}return u(),{element:t,update:c}}function W(){return new URLSearchParams(window.location.search).get("view")==="zeit-verteilung"?"zeit-verteilung":"day-plan"}function B(n,t){return`index.html${t==="zeit-verteilung"?`?day=${n}&view=zeit-verteilung`:`?day=${n}`}`}function X(n){return`index.html?day=${n}`}var zt={check:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>',close:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/></svg>',edit:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>',info:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>',delete:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>',login:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M11 7L9.6 8.4l2.6 2.6H2v2h10.2l-2.6 2.6L11 17l5-5-5-5zm9 12h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-8v2h8v14z"/></svg>',logout:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg>',chart:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M11 2v20c-5.07-.5-9-4.79-9-10s3.93-9.5 9-10zm2.03 0v8.99H22c-.47 4.74-4.24 8.52-8.97 9v-9H13V2z"/></svg>',"arrow-back":'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>'};function b(n){return zt[n]||""}var ot={"end-before-start":"Die Enduhrzeit darf nicht vor der Startuhrzeit liegen.",overlap:"Der Abschnitt \xFCberschneidet sich zeitlich mit einem anderen Abschnitt."};function It(n,t){return n.startTime.inMinutes()<t.endTime.inMinutes()&&t.startTime.inMinutes()<n.endTime.inMinutes()}function tt(n,t){if(n.endTime.inMinutes()<n.startTime.inMinutes())return{type:"end-before-start",message:ot["end-before-start"]};if(t.some(i=>It(n,i)))return{type:"overlap",message:ot.overlap}}function N(n,t){for(let[i,e]of Object.entries(t))n.querySelector(`[data-action="${i}"]`)?.addEventListener("click",e)}function st(n,t,i,e,r,o,a){let u=document.createElement("div");u.className="abschnitt-host";let c=n?.startTime?.hour??0,s=n?.startTime?.minute??0,l=n?.endTime?.hour??0,m=n?.endTime?.minute??0,S=n?.location??_.UNASSIGNED;function E(p,z,f){return i?`<input class="abschnitt-time-cell" type="number" min="0" max="${f}" value="${p}" ${z} />`:`<span class="abschnitt-time-cell" ${z}>${p.toString().padStart(2,"0")}</span>`}function L(){return i?`
        <select class="abschnitt-location-cell" data-location>
          <option value="${_.UNASSIGNED}" ${S===_.UNASSIGNED?"selected":""}>${U[_.UNASSIGNED]}</option>
          <option value="${_.OFFICE}" ${S===_.OFFICE?"selected":""}>${U[_.OFFICE]}</option>
          <option value="${_.MOBILE}" ${S===_.MOBILE?"selected":""}>${U[_.MOBILE]}</option>
        </select>`:`<span class="abschnitt-location-cell" data-location>${U[S]}</span>`}function $(){return i?`
        <div class="abschnitt-icon-zone">
          <span data-action="abort">${b("close")}</span>
          <span data-action="finish">${b("check")}</span>
          <span data-action="delete">${b("delete")}</span>
        </div>`:`
      <div class="abschnitt-icon-zone">
        <span data-action="edit">${b("edit")}</span>
        <span data-action="delete">${b("delete")}</span>
      </div>`}function D(){u.classList.toggle("abschnitt-edit",i);let p=E(c,"data-start-hour",23)+'<span class="abschnitt-time-sep">:</span>'+E(s,"data-start-minute",59)+'<span class="abschnitt-time-sep abschnitt-time-sep--range"> - </span>'+E(l,"data-end-hour",23)+'<span class="abschnitt-time-sep">:</span>'+E(m,"data-end-minute",59);u.innerHTML=`
      <div class="abschnitt-row">
        <div class="abschnitt-time-range">${p}</div>
        ${L()}
        ${$()}
      </div>`,V()}function V(){i?(u.querySelector("[data-start-hour]")?.addEventListener("input",p=>{c=parseInt(p.target.value,10)||0}),u.querySelector("[data-start-minute]")?.addEventListener("input",p=>{s=parseInt(p.target.value,10)||0}),u.querySelector("[data-end-hour]")?.addEventListener("input",p=>{l=parseInt(p.target.value,10)||0}),u.querySelector("[data-end-minute]")?.addEventListener("input",p=>{m=parseInt(p.target.value,10)||0}),u.querySelector("[data-location]")?.addEventListener("change",p=>{S=p.target.value}),N(u,{finish:()=>{let p=new x(c,s),z=new x(l,m),f=new k(p,z,S),h=o?.(f);if(h){a?.(h);return}t&&t(f),e&&e(!1)},abort:()=>{e&&e(!1)},delete:()=>{r&&r()}})):N(u,{edit:()=>{c=n?.startTime?.hour??0,s=n?.startTime?.minute??0,l=n?.endTime?.hour??0,m=n?.endTime?.minute??0,S=n?.location??_.UNASSIGNED,e&&e(!0)},delete:()=>{r&&r()}})}function A(p,z){n=p,i=z,c=n?.startTime?.hour??0,s=n?.startTime?.minute??0,l=n?.endTime?.hour??0,m=n?.endTime?.minute??0,S=n?.location??_.UNASSIGNED,D()}return D(),{element:u,update:A}}function lt(n,t){let i=document.createElement("div");i.className="abschnitt-liste-host abschnitt-liste";let e=g.loadSections(n)??[],r=[],o=-1,a,u;function c(){g.saveSections(n,e),t?.(e)}function s(f){let h=tt(f,e);return h?(u=h,A(),!1):(e=[...e,f],a=void 0,u=void 0,c(),A(),!0)}function l(f){a={section:e[f],index:f},e=e.filter((h,O)=>O!==f),f===o?o=-1:f<o&&(o-=1),c(),A()}function m(){if(!a)return;let{section:f,index:h}=a;a=void 0,e=[...e.slice(0,h),f,...e.slice(h)],h<=o&&(o+=1),c(),A()}function S(f,h){e=e.map((O,F)=>F===f?h:O),a=void 0,u=void 0,c(),o=-1,A()}function E(f){u=f,A()}function L(){u=void 0,A()}function $(){a=void 0,A()}function D(){return u?`
      <div class="abschnitt-liste__undo-toast abschnitt-liste__validation-toast" data-testid="validation-toast" role="alert">
        <span>${u.message}</span>
        <button type="button" class="abschnitt-liste__undo-close" data-action="dismiss-validation" aria-label="Meldung ausblenden">${b("close")}</button>
      </div>`:""}function V(){return a?`
      <div class="abschnitt-liste__undo-toast" data-testid="undo-toast" role="status">
        <span>Abschnitt gel\xF6scht.</span>
        <button type="button" class="abschnitt-liste__undo-button" data-action="undo">R\xFCckg\xE4ngig</button>
        <button type="button" class="abschnitt-liste__undo-close" data-action="dismiss-undo" aria-label="Meldung ausblenden">${b("close")}</button>
      </div>`:""}function A(){r.forEach(f=>{f.element.remove()}),r=[],i.innerHTML=`
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
        ${e.map((f,h)=>`
          <li class="mat-list-item abschnitt-item" data-index="${h}" data-testid="section-${h}"></li>
        `).join("")}
      </ul>
      ${V()}
      ${D()}`,i.querySelectorAll("[data-index]").forEach(f=>{let h=parseInt(f.dataset.index,10),O=e[h],d=st(O,v=>S(h,v),h===o,v=>{v?o=h:o=-1,A()},()=>l(h),v=>tt(v,e.filter((M,y)=>y!==h)),v=>E(v));d.element.classList.add("abschnitt-cell"),f.appendChild(d.element),r.push(d)}),p()}function p(){i.querySelector('[data-action="undo"]')?.addEventListener("click",m),i.querySelector('[data-action="dismiss-undo"]')?.addEventListener("click",$),i.querySelector('[data-action="dismiss-validation"]')?.addEventListener("click",L)}function z(f){n=f,e=g.loadSections(n)??[],o=-1,a=void 0,u=void 0,A()}return A(),{element:i,update:z,addAbschnitt:s}}function ut(n,t){let i=document.createElement("div");i.className="stempeluhr";let e=g.loadStartTime(n),r=!1,o=e?.hour??0,a=e?.minute??0;function u(){return e?r?`<span class="stempeluhr__time-inputs">
                 <input type="number" min="0" max="23" value="${o}" data-hour />
                 :
                 <input type="number" min="0" max="59" value="${a}" data-minute />
                 <span data-action="finish">${b("check")}</span>
                 <span data-action="abort">${b("close")}</span>
               </span>`:`<span class="stempeluhr__time-display" data-testid="login-time">
               ${e.formattedString()}
               <span data-action="edit">${b("edit")}</span>
             </span>`:'<i class="stempeluhr__placeholder">noch nicht eingestempelt</i>'}function c(){i.innerHTML=`
      <span class="stempeluhr__label">Eingestempelt um:</span>
      <div class="stempeluhr__value">${u()}</div>
      <button class="mat-button stempeluhr__button" data-testid="log-button">
        <span data-action>${e?b("logout"):b("login")}</span>
        <span class="stempeluhr__button-label">${e?"Ausstempeln":"Einstempeln"}</span>
      </button>`,s()}function s(){if(r){let m=i.querySelector("[data-hour]"),S=i.querySelector("[data-minute]");m&&m.addEventListener("input",E=>{o=parseInt(E.target.value,10)||0}),S&&S.addEventListener("input",E=>{a=parseInt(E.target.value,10)||0}),N(i,{finish:()=>{e=new x(o,a),r=!1,g.saveStartTime(n,e),c()},abort:()=>{r=!1,o=e?.hour??0,a=e?.minute??0,c()}})}else N(i,{edit:()=>{o=e?.hour??0,a=e?.minute??0,r=!0,c()}});i.querySelector('[data-testid="log-button"]')?.addEventListener("click",()=>{if(!e)e=x.now(),g.saveStartTime(n,e),c();else{let m=new k(e,x.now());if(t&&t(m)===!1)return;e=void 0,g.saveStartTime(n,e),c()}})}function l(m){n=m,e=g.loadStartTime(n),r=!1,o=e?.hour??0,a=e?.minute??0,c()}return c(),{element:i,update:l}}function ct(n,t,i){let e=document.createElement("section");e.className="day-plan";let r,o;function a(){e.innerHTML=`
      <header class="day-plan__header">
        <h1 data-testid="dayplan-title"></h1>
        <a class="day-plan__verteilung-link mat-button" data-testid="open-zeitverteilung" href="${B(n,"zeit-verteilung")}" title="Zeit verteilen" aria-label="Zeitverteilung \xF6ffnen">${b("chart")}</a>
      </header>`,e.querySelector('[data-testid="open-zeitverteilung"]')?.addEventListener("click",c=>{i&&(c.preventDefault(),i())}),e.querySelector('[data-testid="dayplan-title"]').textContent=`Tagesplan f\xFCr den ${n}`,o=lt(n,t),r=ut(n,c=>o.addAbschnitt(c)),r.element.classList.add("day-plan__clock"),o.element.classList.add("day-plan__list"),e.appendChild(r.element),e.appendChild(o.element)}function u(c){n=c,e.querySelector('[data-testid="dayplan-title"]').textContent=`Tagesplan f\xFCr den ${n}`;let s=e.querySelector('[data-testid="open-zeitverteilung"]');s&&(s.href=B(n,"zeit-verteilung")),r?.update(c),o?.update(c)}return a(),{element:e,update:u}}function dt(){let n=document.createElement("a");n.className="download-plans",n.textContent="Daten exportieren";function t(){let i=g.loadPlans(),e=JSON.stringify(i),r=new Blob([e],{type:"application/json"}),o=URL.createObjectURL(r),a=new Date,u=l=>l.toString().padStart(2,"0"),s=`dayplans_${a.getFullYear()+"-"+u(a.getMonth()+1)+"-"+u(a.getDate())+"_"+u(a.getHours())+"-"+u(a.getMinutes())+"-"+u(a.getSeconds())}.json`;n.setAttribute("href",o),n.setAttribute("download",s)}return t(),{element:n}}var mt="2026-10-29 10:34:43 +0000",pt="88cc61b",ft="https://github.com/mohrm/workingdiary/commit/88cc61b";function vt(){return mt}function ht(){return pt}function gt(){return ft}function bt(){let n=document.createElement("div");n.className="version-info",n.innerHTML=`
    <button type="button" class="version-info__button" data-testid="version-info" aria-label="Informationen anzeigen">
      ${b("info")}
    </button>
    <dialog class="version-info__dialog" data-testid="version-info-dialog" aria-labelledby="version-info-title">
      <h2 class="version-info__title" id="version-info-title">Informationen</h2>
      <p class="version-info__entry">Zuletzt ge\xE4ndert: ${vt()}</p>
      <p class="version-info__entry">Commit: <a href="${gt()}">${ht()}</a></p>
      <p class="version-info__entry">Viewport pr\xFCfen: <a href="https://mohrm.github.io/viewport-checker/" target="_blank" rel="noopener">mohrm.github.io/viewport-checker</a></p>
      <div class="version-info__actions">
        <div class="version-info__export" data-download-plans></div>
        <button type="button" class="version-info__close" data-testid="version-info-close">${b("close")}Schlie\xDFen</button>
      </div>
    </dialog>`;let t=n.querySelector('[data-testid="version-info"]'),i=n.querySelector('[data-testid="version-info-dialog"]'),e=n.querySelector('[data-testid="version-info-close"]');return t.addEventListener("click",()=>i.showModal()),e.addEventListener("click",()=>i.close()),i.addEventListener("click",r=>{r.target===i&&i.close()}),{element:n}}var et="nicht verteilte Zeit",St="activity-history-months";function $t(n){let i=(g.loadSections(n)??[]).map(e=>e.durationInMinutes()).reduce((e,r)=>e+r,0);return at(i)}function At(){let n=localStorage.getItem(St),t=n===null?Number.NaN:parseInt(n,10);return Number.isInteger(t)&&t>0?t:3}function Tt(n,t){let i=document.createElement("section");i.className="zeit-verteilung";let e="",r="",o="",a;function u(d){return d.map(v=>v.minutes).reduce((v,M)=>v+M,0)}function c(d){g.saveTimeDistribution(n,d)}function s(){return $t(n)}function l(d){return s()-u(d)}function m(d,v){let M=g.loadTimeDistribution(n)??[],y=d.trim();return y?y===et?(a="Diese T\xE4tigkeit ist reserviert.",p(),!1):M.some(I=>I.name===y)?(a="Diese T\xE4tigkeit gibt es schon.",p(),!1):v>l(M)?(a="So viel Zeit ist nicht mehr frei.",p(),!1):(a=void 0,c([...M,new P(y,v)]),p(),!0):(a="Bitte eine T\xE4tigkeit angeben.",p(),!1)}function S(){let d=e,v=E();e="",r="",o="",m(d,v)}function E(){return o!==""?Math.round(s()*L(o)/100):K(L(r))}function L(d){return parseFloat(d.replace(",","."))||0}function $(d){return(d/100).toFixed(2).replace(".",",")}function D(d){return $(Math.round(d/25)*25)}function V(d,v){return v===0?"0,0 %":`${(100*d/v).toFixed(1).replace(".",",")} %`}function A(d,v,M,y){let I=$(d.minutes),G=V(d.minutes,y);return`
      <li class="zeit-verteilung__row mat-list-item" data-index="${v}">
        <div class="zeit-verteilung__taetigkeit">
          <span class="zeit-verteilung__name" data-testid="taetigkeit-${v}">${d.name}</span>
          <span class="zeit-verteilung__indizes" data-testid="taetigkeit-indizes-${v}">${I} / ${D(d.minutes)}</span>
        </div>
        ${M?`<input class="zeit-verteilung__input zeit-verteilung__input--industrial" type="text" inputmode="decimal" value="${I}" data-edit-industriezeit aria-label="Industriezeit f\xFCr ${d.name}" />
               <input class="zeit-verteilung__input zeit-verteilung__input--percent" type="text" inputmode="decimal" value="${G}" data-edit-prozent aria-label="Prozent f\xFCr ${d.name}" />`:`<span class="zeit-verteilung__value zeit-verteilung__input--industrial" data-testid="taetigkeit-industriezeit-${v}">${I}</span>
               <span class="zeit-verteilung__value zeit-verteilung__input--percent" data-testid="taetigkeit-prozent-${v}">${G}</span>`}
        <div class="zeit-verteilung__icon-zone">
          ${M?`<span data-action="abort" role="button" aria-label="Abbrechen">${b("close")}</span>
                 <span data-action="finish" role="button" aria-label="\xDCbernehmen">${b("check")}</span>`:`<span data-action="edit" role="button" aria-label="Bearbeiten">${b("edit")}</span>`}
          <span data-action="delete" role="button" aria-label="${d.name} entfernen">${b("delete")}</span>
        </div>
      </li>`}function p(){let d=s(),v=g.loadTimeDistribution(n)??[],M=Math.max(0,l(v));i.innerHTML=`
      <header class="zeit-verteilung__header">
        <h1 data-testid="zeitverteilung-title">Zeitverteilung f\xFCr den ${n}</h1>
        <button type="button" class="zeit-verteilung__back" data-action="back" data-testid="back-to-dayplan" aria-label="Zur\xFCck zum Tagesplan">${b("arrow-back")}</button>
      </header>
      <p class="zeit-verteilung__gesamt">
        Gesamtdauer: <span data-testid="zeitverteilung-gesamt">${$(d)}</span>
        <span class="zeit-verteilung__gesamt-rund">/ ${D(d)}</span>
        Industriezeit
      </p>
      <div class="zeit-verteilung__neu">
        <div class="zeit-verteilung__name-feld">
          <input class="zeit-verteilung__input" type="text" placeholder="z. B. Regulatorik" value="${e}" data-testid="neue-taetigkeit" data-neue-taetigkeit role="combobox" aria-expanded="false" aria-controls="zeit-verteilung-verlauf" aria-autocomplete="list" />
          <ul class="zeit-verteilung__verlauf" id="zeit-verteilung-verlauf" data-testid="taetigkeit-verlauf" role="listbox" hidden></ul>
        </div>
        <input class="zeit-verteilung__input zeit-verteilung__input--industrial" type="text" inputmode="decimal" placeholder="Industriezeit" value="${r}" data-testid="neue-taetigkeit-industriezeit" aria-label="Industriezeit" />
        <input class="zeit-verteilung__input zeit-verteilung__input--percent" type="text" inputmode="decimal" placeholder="%" value="${o}" data-testid="neue-taetigkeit-prozent" aria-label="Prozent" />
        <button type="button" class="zeit-verteilung__add" data-action="add-freitext" data-testid="add-taetigkeit" aria-label="T\xE4tigkeit hinzuf\xFCgen">${b("check")}</button>
      </div>
      <ul class="zeit-verteilung__liste mat-list">
        ${v.map((T,w)=>A(T,w,w===z,d)).join("")}
        <li class="zeit-verteilung__row zeit-verteilung__row--unverteilt mat-list-item">
          <div class="zeit-verteilung__taetigkeit">
            <span class="zeit-verteilung__name" data-testid="unverteilt-name">${et}</span>
            <span class="zeit-verteilung__indizes" data-testid="unverteilt-industriezeit">${$(M)} / ${D(M)}</span>
          </div>
          <span class="zeit-verteilung__value zeit-verteilung__input--industrial" data-testid="unverteilt-minuten">${$(M)}</span>
          <span class="zeit-verteilung__value zeit-verteilung__input--percent" data-testid="unverteilt-prozent">${V(M,d)}</span>
          <div class="zeit-verteilung__icon-zone zeit-verteilung__icon-zone--leer"></div>
        </li>
      </ul>
      ${a?`<div class="zeit-verteilung__fehler" data-testid="zeitverteilung-fehler" role="alert">${a}</div>`:""}`;let y=i.querySelector("[data-neue-taetigkeit]"),I=i.querySelector('[data-testid="taetigkeit-verlauf"]'),G=()=>{let T=g.loadTimeDistribution(n)??[];return g.recentActivityNames(n,At()).filter(w=>!T.some(C=>C.name===w))},Et=()=>{I&&(I.innerHTML=G().map(T=>`<li class="zeit-verteilung__verlauf-eintrag" role="option" data-verlauf-name="${T}">${T}</li>`).join(""),I.querySelectorAll("[data-verlauf-name]").forEach(T=>{T.addEventListener("mousedown",w=>{w.preventDefault()}),T.addEventListener("click",()=>{let w=T.getAttribute("data-verlauf-name")??"";e=w,y&&(y.value=w),I&&(I.hidden=!0),y?.setAttribute("aria-expanded","false"),y?.focus()})}))},nt=()=>{if(!y||!I)return;Et();let T=I.querySelectorAll("[data-verlauf-name]"),w=y.value.trim().toLowerCase(),C=0;T.forEach(Z=>{let q=Z.getAttribute("data-verlauf-name")??"",Y=w===""||q.toLowerCase().includes(w);Z.hidden=!Y,Y&&C++});let J=C>0;I.hidden=!J,y.setAttribute("aria-expanded",J?"true":"false")};y?.addEventListener("focus",nt),y?.addEventListener("input",T=>{e=T.target.value,nt()}),y?.addEventListener("blur",()=>{window.setTimeout(()=>{I&&(I.hidden=!0),y?.setAttribute("aria-expanded","false")},150)}),i.querySelector('[data-testid="neue-taetigkeit-industriezeit"]')?.addEventListener("input",T=>{r=T.target.value}),i.querySelector('[data-testid="neue-taetigkeit-prozent"]')?.addEventListener("input",T=>{o=T.target.value}),i.querySelector("[data-edit-industriezeit]")?.addEventListener("input",T=>{f=T.target.value}),i.querySelector("[data-edit-prozent]")?.addEventListener("input",T=>{h=T.target.value}),v.forEach((T,w)=>{let C=i.querySelector(`[data-index="${w}"]`);C&&(C.querySelector('[data-action="edit"]')?.addEventListener("click",()=>{z=w,f=$(T.minutes),h="",a=void 0,p()}),C.querySelector('[data-action="abort"]')?.addEventListener("click",()=>{z=-1,f="",h="",p()}),C.querySelector('[data-action="finish"]')?.addEventListener("click",()=>{let J=g.loadTimeDistribution(n)??[],Z=J.filter((H,R)=>R!==w).map(H=>H.minutes).reduce((H,R)=>H+R,0),q;h!==""?q=Math.round(s()*L(h)/100):q=K(L(f));let Y=s()-Z;if(q>Y){a="So viel Zeit ist nicht mehr frei.",p();return}a=void 0,c(J.map((H,R)=>R===w?new P(H.name,q):H)),z=-1,f="",h="",p()}),C.querySelector('[data-action="delete"]')?.addEventListener("click",()=>O(w)))}),N(i,{"add-freitext":S,back:()=>t?.()})}let z=-1,f="",h="";function O(d){let v=g.loadTimeDistribution(n)??[];c(v.filter((M,y)=>y!==d)),z===d&&(z=-1),p()}function F(d){n=d,e="",r="",o="",a=void 0,z=-1,p()}return p(),{element:i,update:F}}function Mt(){return new Date().toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit",year:"numeric"})}function _t(){return new URLSearchParams(window.location.search).get("day")??Mt()}function j(n,t="day-plan"){history.pushState({day:n},"",B(n,t))}function yt(){let n=document.createElement("div");n.className="app-shell";let t=_t(),i=W(),e,r,o,a,u;function c(){n.innerHTML=`
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
      </div>`,a=dt(),u=bt();let L=n.querySelector("[data-view]");i==="zeit-verteilung"?(r=Tt(t,l),L.appendChild(r.element)):(e=ct(t,()=>o?.update(t),s),L.appendChild(e.element),e.element.querySelector(".day-plan__header").appendChild(u.element)),o=rt(t),n.querySelector("[data-abschnitt-summe]").appendChild(o.element),n.querySelector("[data-download-plans]").appendChild(a.element),m()}function s(){i="zeit-verteilung",j(t,i),c()}function l(){i="day-plan",j(t,i),c()}function m(){let L=n.querySelector("[data-prev-link]"),$=n.querySelector("[data-next-link]");L?.addEventListener("click",D=>{D.preventDefault(),t=g.previousDay(t),j(t,i),S()}),$?.addEventListener("click",D=>{D.preventDefault(),t=g.nextDay(t),j(t,i),S()})}function S(){i==="zeit-verteilung"?r?.update(t):e?.update(t),o?.update(t),E()}function E(){let L=n.querySelector("[data-prev-link]"),$=n.querySelector("[data-next-link]");L&&(L.href=X(g.previousDay(t))),$&&($.href=X(g.nextDay(t)))}return c(),{element:n,update(){t=_t();let L=W();L!==i&&(i=L,c()),S()}}}var Lt=document.querySelector("app-root");if(!Lt)throw new Error("Root element <app-root> not found");var wt=yt();Lt.appendChild(wt.element);window.addEventListener("popstate",()=>wt.update());
//# sourceMappingURL=main-OWW56L6J.js.map
