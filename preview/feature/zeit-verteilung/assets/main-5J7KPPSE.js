var T={UNASSIGNED:"nicht zugeordnet",OFFICE:"B\xFCro",MOBILE:"mobil"},ot=Object.values(T).filter(n=>n!==T.UNASSIGNED),F={[T.UNASSIGNED]:"kein",[T.OFFICE]:T.OFFICE,[T.MOBILE]:T.MOBILE};var M=class n{hour;minute;static now(){let t=new Date;return new n(t.getHours(),t.getMinutes())}constructor(t,i){this.hour=t,this.minute=i}inMinutes(){return 60*this.hour+this.minute}industrial(){return this.inMinutes()/60}industrialQuarterPrecision(){return Math.round(4*this.industrial())/4}formattedString(){return this.hour.toString().padStart(2,"0")+":"+this.minute.toString().padStart(2,"0")}toJSON(){return{hour:this.hour,minute:this.minute}}static fromJSON(t){return new n(t.hour,t.minute)}};var V=class n{name;minutes;constructor(t,i){this.name=t,this.minutes=i}toJSON(){return{name:this.name,minutes:this.minutes}}static fromJSON(t){return new n(t.name,t.minutes)}};function X(n){return Math.round(100*n)}function st(n){return Math.round(n*100/60)}var H=class n{startTime;endTime;location;constructor(t,i,e=T.UNASSIGNED){this.startTime=t,this.endTime=i,this.location=e}formattedString(){return`${`${this.startTime.formattedString()} - ${this.endTime.formattedString()}`} (${this.location})`}durationInMinutes(){return this.endTime.inMinutes()-this.startTime.inMinutes()}toJSON(){return{startTime:this.startTime.toJSON(),endTime:this.endTime.toJSON(),location:this.location}}static fromJSON(t){return new n(M.fromJSON(t.startTime),M.fromJSON(t.endTime),t.location??T.UNASSIGNED)}};var tt=class{initPlans(){let t={};return localStorage.setItem("plans",JSON.stringify(t)),t}loadPlans(){let t=localStorage.getItem("plans");return t?JSON.parse(t):this.initPlans()}initDay(t,i){let e={};return t[i]=e,localStorage.setItem("plans",JSON.stringify(t)),e}loadDayPlan(t){let i=this.loadPlans();return i[t]||this.initDay(i,t),i}saveStartTime(t,i){let e=this.loadDayPlan(t);i?e[t].startTime=i:e[t].startTime=void 0,localStorage.setItem("plans",JSON.stringify(e))}loadStartTime(t){let e=this.loadDayPlan(t)[t].startTime;if(e)return new M(e.hour,e.minute)}saveSections(t,i){let e=this.loadDayPlan(t);e[t].sections=i,localStorage.setItem("plans",JSON.stringify(e))}loadSections(t){let e=this.loadDayPlan(t)[t].sections;if(e)return e.map(a=>H.fromJSON(a))}saveActivities(t,i){let e=this.loadDayPlan(t);e[t].activities=i,localStorage.setItem("plans",JSON.stringify(e))}loadActivities(t){return this.loadDayPlan(t)[t].activities}saveTimeDistribution(t,i){let e=this.loadDayPlan(t);e[t].timeDistribution=i.map(a=>a.toJSON()),localStorage.setItem("plans",JSON.stringify(e))}loadTimeDistribution(t){let i=this.loadDayPlan(t)[t].timeDistribution;if(i)return i.map(e=>V.fromJSON(e))}recentActivityNames(t,i){let e=this.loadPlans(),a=this.parseGermanDate(t),o=new Date(a.getFullYear(),a.getMonth()-i,a.getDate()),r=[];for(let l in e){let c=this.parseGermanDate(l);if(c<o||c>a)continue;let p=(e[l].timeDistribution??[]).map(b=>b.name).filter(b=>b.length>0);p.length>0&&r.push({day:c,names:p})}r.sort((l,c)=>c.day.getTime()-l.day.getTime());let u=new Set,d=[];for(let l of r)for(let c of l.names)u.has(c)||(u.add(c),d.push(c));return d}previousDay(t){let i=this.loadPlans(),e=this.parseGermanDate(t),a=[];for(let o in i){let r=this.parseGermanDate(o);r<e&&a.push(r)}if(a.length>0){let o=new Date(Math.max(...a.map(r=>r.getTime())));return this.formatGermanDate(o)}else return t}nextDay(t){let i=this.loadPlans(),e=this.parseGermanDate(t),a=[];for(let o in i){let r=this.parseGermanDate(o);r>e&&a.push(r)}if(a.length>0){let o=new Date(Math.min(...a.map(r=>r.getTime())));return this.formatGermanDate(o)}else return t}parseGermanDate(t){let[i,e,a]=t.split(".").map(Number);return new Date(a,e-1,i)}formatGermanDate(t){return t.toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit",year:"numeric"})}},f=new tt;function lt(n){let t=document.createElement("table");t.className="abschnitt-summe";let i=f.loadSections(n)??[];function e(l){return i.filter(c=>!l||c.location===l).map(c=>c.durationInMinutes()).reduce((c,p)=>c+p,0)}function a(l){let c=Math.floor(l/60),p=l-60*c;return new M(c,p)}function o(l){return(typeof l=="number"?l:l.industrial()).toFixed(2)}function r(l,c,p){let b=p?` data-testid="${p}"`:"",x=p?`${p}-industry-combined`:void 0,L=x?` data-testid="${x}"`:"";return`
          <tr>
            <td>${l}</td>
            <td${b}>${c.formattedString()}</td>
            <td${L}>${o(c)} / ${o(c.industrialQuarterPrecision())}</td>
          </tr>`}function u(){let l=a(e()),c=ot.map(p=>r(p,a(e(p)))).join("");t.innerHTML=`
      <thead align="center">
        <tr>
          <th>Arbeitsort</th>
          <th>Gesamtdauer</th>
          <th>Industriezeit (exakt/gerundet)</th>
        </tr>
      </thead>
      <tbody align="center">${c}${r("Gesamt",l,"fullduration")}
      </tbody>`}function d(l){n=l,i=f.loadSections(n)??[],u()}return u(),{element:t,update:d}}function et(){return new URLSearchParams(window.location.search).get("view")==="zeit-verteilung"?"zeit-verteilung":"day-plan"}function Z(n,t){return`index.html${t==="zeit-verteilung"?`?day=${n}&view=zeit-verteilung`:`?day=${n}`}`}function nt(n){return`index.html?day=${n}`}var $t={check:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>',close:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/></svg>',edit:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>',info:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>',delete:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>',login:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M11 7L9.6 8.4l2.6 2.6H2v2h10.2l-2.6 2.6L11 17l5-5-5-5zm9 12h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-8v2h8v14z"/></svg>',logout:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg>',chart:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M11 2v20c-5.07-.5-9-4.79-9-10s3.93-9.5 9-10zm2.03 0v8.99H22c-.47 4.74-4.24 8.52-8.97 9v-9H13V2z"/></svg>',"arrow-back":'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>'};function v(n){return $t[n]||""}var ut={"end-before-start":"Die Enduhrzeit darf nicht vor der Startuhrzeit liegen.",overlap:"Der Abschnitt \xFCberschneidet sich zeitlich mit einem anderen Abschnitt."};function xt(n,t){return n.startTime.inMinutes()<t.endTime.inMinutes()&&t.startTime.inMinutes()<n.endTime.inMinutes()}function it(n,t){if(n.endTime.inMinutes()<n.startTime.inMinutes())return{type:"end-before-start",message:ut["end-before-start"]};if(t.some(i=>xt(n,i)))return{type:"overlap",message:ut.overlap}}function O(n,t){for(let[i,e]of Object.entries(t))n.querySelector(`[data-action="${i}"]`)?.addEventListener("click",e)}function ct(n,t,i,e,a,o,r){let u=document.createElement("div");u.className="abschnitt-host";let d=n?.startTime?.hour??0,l=n?.startTime?.minute??0,c=n?.endTime?.hour??0,p=n?.endTime?.minute??0,b=n?.location??T.UNASSIGNED;function x(y,w,m){return i?`<input class="abschnitt-time-cell" type="number" min="0" max="${m}" value="${y}" ${w} />`:`<span class="abschnitt-time-cell" ${w}>${y.toString().padStart(2,"0")}</span>`}function L(){return i?`
        <select class="abschnitt-location-cell" data-location>
          <option value="${T.UNASSIGNED}" ${b===T.UNASSIGNED?"selected":""}>${F[T.UNASSIGNED]}</option>
          <option value="${T.OFFICE}" ${b===T.OFFICE?"selected":""}>${F[T.OFFICE]}</option>
          <option value="${T.MOBILE}" ${b===T.MOBILE?"selected":""}>${F[T.MOBILE]}</option>
        </select>`:`<span class="abschnitt-location-cell" data-location>${F[b]}</span>`}function E(){return i?`
        <div class="abschnitt-icon-zone">
          <span data-action="abort">${v("close")}</span>
          <span data-action="finish">${v("check")}</span>
          <span data-action="delete">${v("delete")}</span>
        </div>`:`
      <div class="abschnitt-icon-zone">
        <span data-action="edit">${v("edit")}</span>
        <span data-action="delete">${v("delete")}</span>
      </div>`}function D(){u.classList.toggle("abschnitt-edit",i);let y=x(d,"data-start-hour",23)+'<span class="abschnitt-time-sep">:</span>'+x(l,"data-start-minute",59)+'<span class="abschnitt-time-sep abschnitt-time-sep--range"> - </span>'+x(c,"data-end-hour",23)+'<span class="abschnitt-time-sep">:</span>'+x(p,"data-end-minute",59);u.innerHTML=`
      <div class="abschnitt-row">
        <div class="abschnitt-time-range">${y}</div>
        ${L()}
        ${E()}
      </div>`,q()}function q(){i?(u.querySelector("[data-start-hour]")?.addEventListener("input",y=>{d=parseInt(y.target.value,10)||0}),u.querySelector("[data-start-minute]")?.addEventListener("input",y=>{l=parseInt(y.target.value,10)||0}),u.querySelector("[data-end-hour]")?.addEventListener("input",y=>{c=parseInt(y.target.value,10)||0}),u.querySelector("[data-end-minute]")?.addEventListener("input",y=>{p=parseInt(y.target.value,10)||0}),u.querySelector("[data-location]")?.addEventListener("change",y=>{b=y.target.value}),O(u,{finish:()=>{let y=new M(d,l),w=new M(c,p),m=new H(y,w,b),g=o?.(m);if(g){r?.(g);return}t&&t(m),e&&e(!1)},abort:()=>{e&&e(!1)},delete:()=>{a&&a()}})):O(u,{edit:()=>{d=n?.startTime?.hour??0,l=n?.startTime?.minute??0,c=n?.endTime?.hour??0,p=n?.endTime?.minute??0,b=n?.location??T.UNASSIGNED,e&&e(!0)},delete:()=>{a&&a()}})}function A(y,w){n=y,i=w,d=n?.startTime?.hour??0,l=n?.startTime?.minute??0,c=n?.endTime?.hour??0,p=n?.endTime?.minute??0,b=n?.location??T.UNASSIGNED,D()}return D(),{element:u,update:A}}function dt(n,t){let i=document.createElement("div");i.className="abschnitt-liste-host abschnitt-liste";let e=f.loadSections(n)??[],a=[],o=-1,r,u;function d(){f.saveSections(n,e),t?.(e)}function l(m){let g=it(m,e);return g?(u=g,A(),!1):(e=[...e,m],r=void 0,u=void 0,d(),A(),!0)}function c(m){r={section:e[m],index:m},e=e.filter((g,C)=>C!==m),m===o?o=-1:m<o&&(o-=1),d(),A()}function p(){if(!r)return;let{section:m,index:g}=r;r=void 0,e=[...e.slice(0,g),m,...e.slice(g)],g<=o&&(o+=1),d(),A()}function b(m,g){e=e.map((C,Y)=>Y===m?g:C),r=void 0,u=void 0,d(),o=-1,A()}function x(m){u=m,A()}function L(){u=void 0,A()}function E(){r=void 0,A()}function D(){return u?`
      <div class="abschnitt-liste__undo-toast abschnitt-liste__validation-toast" data-testid="validation-toast" role="alert">
        <span>${u.message}</span>
        <button type="button" class="abschnitt-liste__undo-close" data-action="dismiss-validation" aria-label="Meldung ausblenden">${v("close")}</button>
      </div>`:""}function q(){return r?`
      <div class="abschnitt-liste__undo-toast" data-testid="undo-toast" role="status">
        <span>Abschnitt gel\xF6scht.</span>
        <button type="button" class="abschnitt-liste__undo-button" data-action="undo">R\xFCckg\xE4ngig</button>
        <button type="button" class="abschnitt-liste__undo-close" data-action="dismiss-undo" aria-label="Meldung ausblenden">${v("close")}</button>
      </div>`:""}function A(){a.forEach(m=>{m.element.remove()}),a=[],i.innerHTML=`
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
        ${e.map((m,g)=>`
          <li class="mat-list-item abschnitt-item" data-index="${g}" data-testid="section-${g}"></li>
        `).join("")}
      </ul>
      ${q()}
      ${D()}`,i.querySelectorAll("[data-index]").forEach(m=>{let g=parseInt(m.dataset.index,10),C=e[g],U=ct(C,s=>b(g,s),g===o,s=>{s?o=g:o=-1,A()},()=>c(g),s=>it(s,e.filter((h,z)=>z!==g)),s=>x(s));U.element.classList.add("abschnitt-cell"),m.appendChild(U.element),a.push(U)}),y()}function y(){i.querySelector('[data-action="undo"]')?.addEventListener("click",p),i.querySelector('[data-action="dismiss-undo"]')?.addEventListener("click",E),i.querySelector('[data-action="dismiss-validation"]')?.addEventListener("click",L)}function w(m){n=m,e=f.loadSections(n)??[],o=-1,r=void 0,u=void 0,A()}return A(),{element:i,update:w,addAbschnitt:l}}function mt(n,t){let i=document.createElement("div");i.className="stempeluhr";let e=f.loadStartTime(n),a=!1,o=e?.hour??0,r=e?.minute??0;function u(){return e?a?`<span class="stempeluhr__time-inputs">
                 <input type="number" min="0" max="23" value="${o}" data-hour />
                 :
                 <input type="number" min="0" max="59" value="${r}" data-minute />
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
      </button>`,l()}function l(){if(a){let p=i.querySelector("[data-hour]"),b=i.querySelector("[data-minute]");p&&p.addEventListener("input",x=>{o=parseInt(x.target.value,10)||0}),b&&b.addEventListener("input",x=>{r=parseInt(x.target.value,10)||0}),O(i,{finish:()=>{e=new M(o,r),a=!1,f.saveStartTime(n,e),d()},abort:()=>{a=!1,o=e?.hour??0,r=e?.minute??0,d()}})}else O(i,{edit:()=>{o=e?.hour??0,r=e?.minute??0,a=!0,d()}});i.querySelector('[data-testid="log-button"]')?.addEventListener("click",()=>{if(!e)e=M.now(),f.saveStartTime(n,e),d();else{let p=new H(e,M.now());if(t&&t(p)===!1)return;e=void 0,f.saveStartTime(n,e),d()}})}function c(p){n=p,e=f.loadStartTime(n),a=!1,o=e?.hour??0,r=e?.minute??0,d()}return d(),{element:i,update:c}}function pt(n,t,i){let e=document.createElement("section");e.className="day-plan";let a,o;function r(){e.innerHTML=`
      <header class="day-plan__header">
        <h1 data-testid="dayplan-title"></h1>
        <a class="day-plan__verteilung-link mat-button" data-testid="open-zeitverteilung" href="${Z(n,"zeit-verteilung")}" title="Zeit verteilen" aria-label="Zeitverteilung \xF6ffnen">${v("chart")}</a>
      </header>`,e.querySelector('[data-testid="open-zeitverteilung"]')?.addEventListener("click",d=>{i&&(d.preventDefault(),i())}),e.querySelector('[data-testid="dayplan-title"]').textContent=`Tagesplan f\xFCr den ${n}`,o=dt(n,t),a=mt(n,d=>o.addAbschnitt(d)),a.element.classList.add("day-plan__clock"),o.element.classList.add("day-plan__list"),e.appendChild(a.element),e.appendChild(o.element)}function u(d){n=d,e.querySelector('[data-testid="dayplan-title"]').textContent=`Tagesplan f\xFCr den ${n}`;let l=e.querySelector('[data-testid="open-zeitverteilung"]');l&&(l.href=Z(n,"zeit-verteilung")),a?.update(d),o?.update(d)}return r(),{element:e,update:u}}function ft(){let n=document.createElement("a");n.className="download-plans",n.textContent="Daten exportieren";function t(){let i=f.loadPlans(),e=JSON.stringify(i),a=new Blob([e],{type:"application/json"}),o=URL.createObjectURL(a),r=new Date,u=c=>c.toString().padStart(2,"0"),l=`dayplans_${r.getFullYear()+"-"+u(r.getMonth()+1)+"-"+u(r.getDate())+"_"+u(r.getHours())+"-"+u(r.getMinutes())+"-"+u(r.getSeconds())}.json`;n.setAttribute("href",o),n.setAttribute("download",l)}return t(),{element:n}}var gt="2026-10-29 11:49:02 +0000",ht="d31f5c9",vt="https://github.com/mohrm/workingdiary/commit/d31f5c9";function bt(){return gt}function St(){return ht}function _t(){return vt}function Tt(){let n=document.createElement("div");n.className="version-info",n.innerHTML=`
    <button type="button" class="version-info__button" data-testid="version-info" aria-label="Informationen anzeigen">
      ${v("info")}
    </button>
    <dialog class="version-info__dialog" data-testid="version-info-dialog" aria-labelledby="version-info-title">
      <h2 class="version-info__title" id="version-info-title">Informationen</h2>
      <p class="version-info__entry">Zuletzt ge\xE4ndert: ${bt()}</p>
      <p class="version-info__entry">Commit: <a href="${_t()}">${St()}</a></p>
      <p class="version-info__entry">Viewport pr\xFCfen: <a href="https://mohrm.github.io/viewport-checker/" target="_blank" rel="noopener">mohrm.github.io/viewport-checker</a></p>
      <div class="version-info__actions">
        <div class="version-info__export" data-download-plans></div>
        <button type="button" class="version-info__close" data-testid="version-info-close">${v("close")}Schlie\xDFen</button>
      </div>
    </dialog>`;let t=n.querySelector('[data-testid="version-info"]'),i=n.querySelector('[data-testid="version-info-dialog"]'),e=n.querySelector('[data-testid="version-info-close"]');return t.addEventListener("click",()=>i.showModal()),e.addEventListener("click",()=>i.close()),i.addEventListener("click",a=>{a.target===i&&i.close()}),{element:n}}var rt="nicht verteilte Zeit",yt="activity-history-months";function k(n){return n.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function At(n){let i=(f.loadSections(n)??[]).map(e=>e.durationInMinutes()).reduce((e,a)=>e+a,0);return st(i)}function Dt(){let n=localStorage.getItem(yt),t=n===null?Number.NaN:parseInt(n,10);return Number.isInteger(t)&&t>0?t:3}function Lt(n,t){let i=document.createElement("section");i.className="zeit-verteilung";let e="",a="",o="",r;function u(s){return s.map(h=>h.minutes).reduce((h,z)=>h+z,0)}function d(s){f.saveTimeDistribution(n,s)}function l(){return At(n)}function c(s){return l()-u(s)}function p(s,h){let z=f.loadTimeDistribution(n)??[],S=s.trim();return S?S===rt?(r="Diese T\xE4tigkeit ist reserviert.",w(),!1):z.some(I=>I.name===S)?(r="Diese T\xE4tigkeit gibt es schon.",w(),!1):h>c(z)?(r="So viel Zeit ist nicht mehr frei.",w(),!1):(r=void 0,d([...z,new V(S,h)]),w(),!0):(r="Bitte eine T\xE4tigkeit angeben.",w(),!1)}function b(){let s=e,h=x();e="",a="",o="",p(s,h)}function x(){return o!==""?Math.round(l()*L(o)/100):X(L(a))}function L(s){return parseFloat(s.replace(",","."))||0}function E(s){return(s/100).toFixed(2).replace(".",",")}function D(s){return E(Math.round(s/25)*25)}function q(s,h){return h===0?"0,0 %":`${(100*s/h).toFixed(1).replace(".",",")} %`}function A(s,h){let z=s.reduce((J,W)=>J+Math.round(W.minutes/25)*25,0)+Math.round(Math.max(0,h-u(s))/25)*25,S=Math.round(h/25)*25,I=z-S;return I===0?`<p class="zeit-verteilung__rundung zeit-verteilung__rundung--ok" data-testid="rundungs-check">Rundung passt (${E(z)} = ${E(S)}).</p>`:`<p class="zeit-verteilung__rundung zeit-verteilung__rundung--abweichung" data-testid="rundungs-check" role="status">Rundung weicht um ${E(Math.abs(I))} ab (${E(z)} \u2260 ${E(S)}).</p>`}function y(s,h,z,S){let I=E(s.minutes),J=q(s.minutes,S);return`
      <li class="zeit-verteilung__row mat-list-item" data-index="${h}">
        <div class="zeit-verteilung__taetigkeit">
          <span class="zeit-verteilung__name" data-testid="taetigkeit-${h}">${k(s.name)}</span>
          <span class="zeit-verteilung__indizes" data-testid="taetigkeit-indizes-${h}">${I} / ${D(s.minutes)}</span>
        </div>
        ${z?`<input class="zeit-verteilung__input zeit-verteilung__input--industrial" type="text" inputmode="decimal" value="${I}" data-edit-industriezeit aria-label="Industriezeit f\xFCr ${k(s.name)}" />
               <input class="zeit-verteilung__input zeit-verteilung__input--percent" type="text" inputmode="decimal" value="${J}" data-edit-prozent aria-label="Prozent f\xFCr ${k(s.name)}" />`:`<span class="zeit-verteilung__value zeit-verteilung__input--industrial" data-testid="taetigkeit-industriezeit-${h}">${I}</span>
               <span class="zeit-verteilung__value zeit-verteilung__input--percent" data-testid="taetigkeit-prozent-${h}">${J}</span>`}
        <div class="zeit-verteilung__icon-zone">
          ${z?`<span data-action="abort" role="button" aria-label="Abbrechen">${v("close")}</span>
                 <span data-action="finish" role="button" aria-label="\xDCbernehmen">${v("check")}</span>`:`<span data-action="edit" role="button" aria-label="Bearbeiten">${v("edit")}</span>`}
          <span data-action="delete" role="button" aria-label="${k(s.name)} entfernen">${v("delete")}</span>
        </div>
      </li>`}function w(){let s=l(),h=f.loadTimeDistribution(n)??[],z=Math.max(0,c(h));i.innerHTML=`
      <header class="zeit-verteilung__header">
        <h1 data-testid="zeitverteilung-title">Zeitverteilung f\xFCr den ${k(n)}</h1>
        <button type="button" class="zeit-verteilung__back" data-action="back" data-testid="back-to-dayplan" aria-label="Zur\xFCck zum Tagesplan">${v("arrow-back")}</button>
      </header>
      <p class="zeit-verteilung__gesamt">
        Gesamtdauer: <span data-testid="zeitverteilung-gesamt">${E(s)}</span>
        <span class="zeit-verteilung__gesamt-rund">/ ${D(s)}</span>
        Industriezeit
      </p>
      <div class="zeit-verteilung__neu">
        <div class="zeit-verteilung__name-feld">
          <input class="zeit-verteilung__input" type="text" placeholder="z. B. Regulatorik" value="${k(e)}" data-testid="neue-taetigkeit" data-neue-taetigkeit role="combobox" aria-expanded="false" aria-controls="zeit-verteilung-verlauf" aria-autocomplete="list" />
          <ul class="zeit-verteilung__verlauf" id="zeit-verteilung-verlauf" data-testid="taetigkeit-verlauf" role="listbox" hidden></ul>
        </div>
        <input class="zeit-verteilung__input zeit-verteilung__input--industrial" type="text" inputmode="decimal" placeholder="Industriezeit" value="${k(a)}" data-testid="neue-taetigkeit-industriezeit" aria-label="Industriezeit" />
        <input class="zeit-verteilung__input zeit-verteilung__input--percent" type="text" inputmode="decimal" placeholder="%" value="${k(o)}" data-testid="neue-taetigkeit-prozent" aria-label="Prozent" />
        <button type="button" class="zeit-verteilung__add" data-action="add-freitext" data-testid="add-taetigkeit" aria-label="T\xE4tigkeit hinzuf\xFCgen">${v("check")}</button>
      </div>
      <div class="zeit-verteilung__liste-bereich">
        <ul class="zeit-verteilung__liste mat-list">
          ${h.map((_,$)=>y(_,$,$===m,s)).join("")}
        </ul>
        <div class="zeit-verteilung__row zeit-verteilung__row--unverteilt mat-list-item">
          <div class="zeit-verteilung__taetigkeit">
            <span class="zeit-verteilung__name" data-testid="unverteilt-name">${rt}</span>
            <span class="zeit-verteilung__indizes" data-testid="unverteilt-industriezeit">${E(z)} / ${D(z)}</span>
          </div>
          <span class="zeit-verteilung__value zeit-verteilung__input--industrial" data-testid="unverteilt-minuten">${E(z)}</span>
          <span class="zeit-verteilung__value zeit-verteilung__input--percent" data-testid="unverteilt-prozent">${q(z,s)}</span>
          <div class="zeit-verteilung__icon-zone zeit-verteilung__icon-zone--leer"></div>
        </div>
      </div>
      ${A(h,s)}
      ${r?`<div class="zeit-verteilung__fehler" data-testid="zeitverteilung-fehler" role="alert">${k(r)}</div>`:""}`;let S=i.querySelector("[data-neue-taetigkeit]"),I=i.querySelector('[data-testid="taetigkeit-verlauf"]'),J=()=>{let _=f.loadTimeDistribution(n)??[];return f.recentActivityNames(n,Dt()).filter($=>!_.some(N=>N.name===$))},W=()=>{I&&(I.innerHTML=J().map(_=>`<li class="zeit-verteilung__verlauf-eintrag" role="option" data-verlauf-name="${k(_)}">${k(_)}</li>`).join(""),I.querySelectorAll("[data-verlauf-name]").forEach(_=>{_.addEventListener("mousedown",$=>{$.preventDefault()}),_.addEventListener("click",()=>{let $=_.getAttribute("data-verlauf-name")??"";e=$,S&&(S.value=$),I&&(I.hidden=!0),S?.setAttribute("aria-expanded","false"),S?.focus()})}))},at=()=>{if(!S||!I)return;W();let _=I.querySelectorAll("[data-verlauf-name]"),$=S.value.trim().toLowerCase(),N=0;_.forEach(j=>{let R=j.getAttribute("data-verlauf-name")??"",K=$===""||R.toLowerCase().includes($);j.hidden=!K,K&&N++});let G=N>0;I.hidden=!G,S.setAttribute("aria-expanded",G?"true":"false")};S?.addEventListener("focus",at),S?.addEventListener("input",_=>{e=_.target.value,at()}),S?.addEventListener("blur",()=>{window.setTimeout(()=>{I&&(I.hidden=!0),S?.setAttribute("aria-expanded","false")},150)}),i.querySelector('[data-testid="neue-taetigkeit-industriezeit"]')?.addEventListener("input",_=>{a=_.target.value}),i.querySelector('[data-testid="neue-taetigkeit-prozent"]')?.addEventListener("input",_=>{o=_.target.value}),i.querySelector("[data-edit-industriezeit]")?.addEventListener("input",_=>{g=_.target.value}),i.querySelector("[data-edit-prozent]")?.addEventListener("input",_=>{C=_.target.value}),h.forEach((_,$)=>{let N=i.querySelector(`[data-index="${$}"]`);N&&(N.querySelector('[data-action="edit"]')?.addEventListener("click",()=>{m=$,g=E(_.minutes),C="",r=void 0,w()}),N.querySelector('[data-action="abort"]')?.addEventListener("click",()=>{m=-1,g="",C="",w()}),N.querySelector('[data-action="finish"]')?.addEventListener("click",()=>{let G=f.loadTimeDistribution(n)??[],j=G.filter((P,B)=>B!==$).map(P=>P.minutes).reduce((P,B)=>P+B,0),R;C!==""?R=Math.round(l()*L(C)/100):R=X(L(g));let K=l()-j;if(R>K){r="So viel Zeit ist nicht mehr frei.",w();return}r=void 0,d(G.map((P,B)=>B===$?new V(P.name,R):P)),m=-1,g="",C="",w()}),N.querySelector('[data-action="delete"]')?.addEventListener("click",()=>Y($)))}),O(i,{"add-freitext":b,back:()=>t?.()})}let m=-1,g="",C="";function Y(s){let h=f.loadTimeDistribution(n)??[];d(h.filter((z,S)=>S!==s)),m===s&&(m=-1),w()}function U(s){n=s,e="",a="",o="",r=void 0,m=-1,w()}return w(),{element:i,update:U}}function Ct(){return new Date().toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit",year:"numeric"})}function wt(){return new URLSearchParams(window.location.search).get("day")??Ct()}function Q(n,t="day-plan"){history.pushState({day:n},"",Z(n,t))}function Et(){let n=document.createElement("div");n.className="app-shell";let t=wt(),i=et(),e,a,o,r,u;function d(){n.innerHTML=`
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
      </div>`,r=ft(),u=Tt();let L=n.querySelector("[data-view]");i==="zeit-verteilung"?(a=Lt(t,c),L.appendChild(a.element)):(e=pt(t,()=>o?.update(t),l),L.appendChild(e.element),e.element.querySelector(".day-plan__header").appendChild(u.element)),o=lt(t),n.querySelector("[data-abschnitt-summe]").appendChild(o.element),n.querySelector("[data-download-plans]").appendChild(r.element),p()}function l(){i="zeit-verteilung",Q(t,i),d()}function c(){i="day-plan",Q(t,i),d()}function p(){let L=n.querySelector("[data-prev-link]"),E=n.querySelector("[data-next-link]");L?.addEventListener("click",D=>{D.preventDefault(),t=f.previousDay(t),Q(t,i),b()}),E?.addEventListener("click",D=>{D.preventDefault(),t=f.nextDay(t),Q(t,i),b()})}function b(){i==="zeit-verteilung"?a?.update(t):e?.update(t),o?.update(t),x()}function x(){let L=n.querySelector("[data-prev-link]"),E=n.querySelector("[data-next-link]");L&&(L.href=nt(f.previousDay(t))),E&&(E.href=nt(f.nextDay(t)))}return d(),{element:n,update(){t=wt();let L=et();L!==i&&(i=L,d()),b()}}}var zt=document.querySelector("app-root");if(!zt)throw new Error("Root element <app-root> not found");var It=Et();zt.appendChild(It.element);window.addEventListener("popstate",()=>It.update());
//# sourceMappingURL=main-5J7KPPSE.js.map
