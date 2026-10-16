(()=>{
document.body.insertAdjacentHTML('beforeend',`<div class="sheet" hidden="" id="sheet-waitlist">
<div class="bd" data-close=""></div>
<div aria-labelledby="wl-title" aria-modal="true" class="panel" role="dialog">
<button aria-label="Close" class="icon-btn x" data-close="" type="button"><svg aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" viewbox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"></path></svg></button>
<div data-form="">
<p class="label">Join Waitlist</p>
<h2 id="wl-title">Be among the first.</h2>
<p class="intro">Leave your email and WhatsApp number. We will tell you when your access is ready.</p>
<form id="wl-form" novalidate="">
<div class="field"><label for="wl-email">Email</label><input aria-describedby="wl-email-err" autocomplete="email" id="wl-email" placeholder="you@example.com" type="email"/><span class="err" id="wl-email-err"></span></div>
<div class="field"><label for="wl-phone">WhatsApp number</label>
<div class="phone-row"><select aria-label="Country code" id="wl-country"><option value="IN">+91 India</option><option value="AE">+971 UAE</option></select><input aria-describedby="wl-phone-err" autocomplete="tel-national" id="wl-phone" inputmode="numeric" placeholder="98765 43210" type="tel"/></div>
<span class="err" id="wl-phone-err"></span></div>
<label class="check"><input id="wl-optin" type="checkbox"/> <span>Send me access updates on WhatsApp.</span></label>
<button class="btn btn-solid" type="submit">Join Waitlist</button>
<p class="fine2">No spam. No WhatsApp messages unless you opt in.</p>
</form>
</div>
<div class="done-state" data-done="" hidden=""><div class="tick">✓</div><h2>You are on the list.</h2><p class="intro">We will write when your access is ready. Preview only: nothing was sent.</p><button class="btn btn-solid" data-close="" style="margin-top:22px" type="button">Done</button></div>
</div>
</div>
<div class="sheet" hidden="" id="sheet-access">
<div class="bd" data-close=""></div>
<div aria-labelledby="ea-title" aria-modal="true" class="panel" role="dialog">
<button aria-label="Close" class="icon-btn x" data-close="" type="button"><svg aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" viewbox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"></path></svg></button>
<div data-form="">
<p class="label">Request Early Access</p>
<h2 id="ea-title">Tell us about your team.</h2>
<p class="intro">For companies interested in SecondBrain for Business. We reply within a few working days.</p>
<form id="ea-form" novalidate="">
<div class="two">
<div class="field"><label for="ea-name">Your name</label><input aria-describedby="ea-name-err" autocomplete="name" id="ea-name"/><span class="err" id="ea-name-err"></span></div>
<div class="field"><label for="ea-company">Company</label><input aria-describedby="ea-company-err" autocomplete="organization" id="ea-company"/><span class="err" id="ea-company-err"></span></div>
</div>
<div class="field"><label for="ea-email">Work email</label><input aria-describedby="ea-email-err" autocomplete="email" id="ea-email" placeholder="you@company.com" type="email"/><span class="err" id="ea-email-err"></span></div>
<div class="field"><label for="ea-phone">WhatsApp number</label>
<div class="phone-row"><select aria-label="Country code" id="ea-country"><option value="IN">+91 India</option><option value="AE">+971 UAE</option></select><input aria-describedby="ea-phone-err" autocomplete="tel-national" id="ea-phone" inputmode="numeric" placeholder="98765 43210" type="tel"/></div>
<span class="err" id="ea-phone-err"></span></div>
<div class="field"><label for="ea-size">Team size</label><select id="ea-size"><option value="">Choose</option><option value="1-10">1–10</option><option value="11-50">11–50</option><option value="51-200">51–200</option><option value="201-1000">201–1,000</option><option value="1000-plus">1,000+</option></select><span class="err" id="ea-size-err"></span></div>
<div class="field"><label for="ea-use">What would you hand off first?</label><textarea aria-describedby="ea-use-err" id="ea-use" maxlength="500" placeholder="For example: chasing vendor invoices every month" rows="3"></textarea><span class="err" id="ea-use-err"></span></div>
<label class="check"><input id="ea-consent" type="checkbox"/> <span>AskGogo may contact me about early access by email or WhatsApp. See the <a href="https://askgogo.in/privacy/" rel="noopener" target="_blank">Privacy Policy</a>.</span></label>
<span class="err" id="ea-consent-err"></span>
<button class="btn btn-solid" type="submit">Request Early Access</button>
</form>
</div>
<div class="done-state" data-done="" hidden=""><div class="tick">✓</div><h2>Request received.</h2><p class="intro">We will be in touch within a few working days. Preview only: nothing was sent.</p><button class="btn btn-solid" data-close="" style="margin-top:22px" type="button">Done</button></div>
</div>
</div>`);
/* ---------- theme: light by default, visitor's choice remembered ---------- */
const KEY='askgogo-theme',root=document.documentElement;
function readTheme(){try{return localStorage.getItem(KEY)}catch(e){return null}}
function applyTheme(t){
  root.classList.toggle('mode-dark',t==='dark');
  document.querySelectorAll('.theme-btn').forEach(b=>{
    b.setAttribute('aria-label',t==='dark'?'Switch to light theme':'Switch to dark theme');
    b.querySelector('.i-moon').toggleAttribute('hidden',t==='dark');b.querySelector('.i-sun').toggleAttribute('hidden',t!=='dark');});
  ambient&&ambient.recolor();
}
let ambient=null;
applyTheme(readTheme()==='dark'?'dark':'light');
document.addEventListener('click',e=>{
  if(!e.target.closest('.theme-btn'))return;
  const next=root.classList.contains('mode-dark')?'light':'dark';
  try{localStorage.setItem(KEY,next)}catch(err){}
  applyTheme(next);
});

const ESSAYS=[
 {slug:'finish-the-work',t:'Why an assistant should finish the work.',d:'Most AI hands back homework. The useful part is the last mile.',date:'14 Oct 2026'},
 {slug:'memory-is-the-product',t:'Memory is the product.',d:'Provenance, correction, scope and expiry: what it takes for an assistant to remember well.',date:'2 Oct 2026'},
 {slug:'autonomy-you-can-check',t:'Autonomy you can check.',d:'Reliable agents come from planning, boundaries and checking the result.',date:'22 Sep 2026'}];
document.querySelectorAll('[data-list]').forEach(el=>{
  const v=el.dataset.list,items=v==='rest'?ESSAYS.slice(1):ESSAYS.slice(0,+v);
  el.innerHTML=items.map(e=>`<a href="/journal/${e.slug}/"><span class="when">${e.date}</span><div><h3>${e.t}</h3><p>${e.d}</p></div><span class="go" aria-hidden="true">→</span></a>`).join('');
});

const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const hdr=document.getElementById('hdr'),PAGE=document.body.dataset.page;
document.querySelectorAll('.nav a').forEach(a=>{const on=a.dataset.r===PAGE||(a.dataset.r==='journal'&&PAGE.startsWith('essay'));on?a.setAttribute('aria-current','page'):a.removeAttribute('aria-current')});
addEventListener('scroll',()=>hdr.classList.toggle('scrolled',scrollY>8),{passive:true});
let io;
function observe(){
  if(reduced.matches||!('IntersectionObserver' in window))return;
  io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('go');io.unobserve(e.target)}}),{rootMargin:'0px 0px -8% 0px'});
  document.querySelectorAll('.rise').forEach(el=>{if(el.getBoundingClientRect().top>innerHeight)io.observe(el)});
}
const drawer=document.getElementById('drawer'),mo=document.getElementById('menu-open');
function closeDrawer(silent){if(drawer.hidden)return;drawer.hidden=true;mo.setAttribute('aria-expanded','false');if(!silent)mo.focus()}
mo.onclick=()=>{drawer.hidden=false;mo.setAttribute('aria-expanded','true');drawer.querySelector('nav a').focus()};
document.getElementById('menu-close').onclick=()=>closeDrawer();

/* ---------- sheets ---------- */
let opener=null;
function openSheet(id,btn){closeDrawer(true);const s=document.getElementById('sheet-'+id);s.querySelector('[data-form]').hidden=false;s.querySelector('[data-done]').hidden=true;s.hidden=false;opener=btn;s.dataset.source=btn?.dataset.cta||'site';setTimeout(()=>s.querySelector('input')?.focus(),30)}
function closeSheet(s){s.hidden=true;opener?.focus?.()}
document.addEventListener('click',e=>{
  const o=e.target.closest('[data-open]');if(o){e.preventDefault();openSheet(o.dataset.open,o);return}
  const c=e.target.closest('[data-close]');if(c)closeSheet(c.closest('.sheet'));
});
document.addEventListener('keydown',e=>{
  const s=document.querySelector('.sheet:not([hidden])')||(!drawer.hidden?drawer:null);if(!s)return;
  if(e.key==='Escape'){s===drawer?closeDrawer():closeSheet(s);return}
  if(e.key!=='Tab')return;
  const f=[...s.querySelectorAll('button,a[href],input,select,textarea')].filter(x=>x.offsetParent!==null);if(!f.length)return;
  const a=f[0],b=f[f.length-1];
  if(e.shiftKey&&document.activeElement===a){e.preventDefault();b.focus()}else if(!e.shiftKey&&document.activeElement===b){e.preventDefault();a.focus()}
});

/* validation mirrors the API rules (lib/waitlist/validate.ts) */
const EMAIL=/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
function phoneOk(cc,raw){let d=String(raw).replace(/\D/g,'');return cc==='IN'?/^[6-9]\d{9}$/.test(d):/^5\d{8}$/.test(d)}
function phoneMsg(cc){return cc==='IN'?'Enter a 10-digit Indian mobile number starting with 6, 7, 8 or 9.':'Enter a 9-digit UAE mobile number starting with 5.'}
function setErr(id,msg){const el=document.getElementById(id),inp=document.getElementById(id.replace(/-err$/,''));el.textContent=msg||'';if(inp)inp.setAttribute('aria-invalid',msg?'true':'false');return !msg}
function wirePhone(inp,sel){inp.addEventListener('input',()=>{inp.value=inp.value.replace(/\D/g,'').slice(0,sel.value==='AE'?9:10)});sel.addEventListener('change',()=>{inp.placeholder=sel.value==='AE'?'50 123 4567':'98765 43210'})}
wirePhone(document.getElementById('wl-phone'),document.getElementById('wl-country'));
wirePhone(document.getElementById('ea-phone'),document.getElementById('ea-country'));
function finish(form){const s=form.closest('.sheet');s.querySelector('[data-form]').hidden=true;const d=s.querySelector('[data-done]');d.hidden=false;d.querySelector('button').focus()}
function firstInvalid(form){const x=form.querySelector('[aria-invalid="true"]');x&&x.focus()}
document.getElementById('wl-form').addEventListener('submit',e=>{
  e.preventDefault();const v=id=>document.getElementById(id).value.trim();const cc=v('wl-country');
  const ok=[setErr('wl-email-err',EMAIL.test(v('wl-email'))?'':'Enter a valid email address.'),
            setErr('wl-phone-err',phoneOk(cc,v('wl-phone'))?'':phoneMsg(cc))].every(Boolean);
  ok?finish(e.target):firstInvalid(e.target);
});
document.getElementById('ea-form').addEventListener('submit',e=>{
  e.preventDefault();const v=id=>document.getElementById(id).value.trim();const cc=v('ea-country');
  const ok=[setErr('ea-name-err',v('ea-name').length>=2?'':'Enter your name.'),
            setErr('ea-company-err',v('ea-company').length>=2?'':'Enter your company name.'),
            setErr('ea-email-err',EMAIL.test(v('ea-email'))?'':'Enter a valid work email.'),
            setErr('ea-phone-err',phoneOk(cc,v('ea-phone'))?'':phoneMsg(cc)),
            setErr('ea-size-err',v('ea-size')?'':'Choose a team size.'),
            setErr('ea-use-err',v('ea-use').length>=10?'':'Tell us in a sentence what you would hand off first.'),
            setErr('ea-consent-err',document.getElementById('ea-consent').checked?'':'Please agree so we can contact you.')].every(Boolean);
  ok?finish(e.target):firstInvalid(e.target);
});

/* ---------- ambient: faint contour lines of a slowly moving field. The pointer adds a soft bump. ---------- */
function makeAmbient(canvas){
  const ctx=canvas.getContext('2d');let w=0,h=0,dpr=1,raf=0,running=false,want=false,last=0,col='28,28,30',alpha=.075;
  const P={x:-1e4,y:-1e4,tx:-1e4,ty:-1e4,amp:0,ta:0};
  const CELL=18,LEVELS=[-1.5,-1.0,-.5,0,.5,1.0,1.5];
  function recolor(){const cs=getComputedStyle(root);col=cs.getPropertyValue('--field').trim()||col;alpha=parseFloat(cs.getPropertyValue('--field-a'))||alpha;if(!running)draw(performance.now())}
  function field(x,y,t){
    const u=x/w*3.2,v=y/h*2.4;
    let f=Math.sin(u*1.3+t*.05+Math.sin(v*1.7-t*.04)*1.4)
         +.8*Math.sin(v*1.9-t*.035+Math.sin(u*1.1+t*.03)*1.2)
         +.45*Math.sin((u+v)*2.3+t*.06);
    if(P.amp>.001){const dx=x-P.x,dy=y-P.y;f+=P.amp*Math.exp(-(dx*dx+dy*dy)/(2*170*170))}
    return f;
  }
  function draw(now){
    const t=now/1000;ctx.clearRect(0,0,w,h);
    const cols=Math.ceil(w/CELL)+1,rows=Math.ceil(h/CELL)+1,g=new Float32Array(cols*rows);
    for(let j=0;j<rows;j++)for(let i=0;i<cols;i++)g[j*cols+i]=field(i*CELL,j*CELL,t);
    ctx.strokeStyle=`rgba(${col},${alpha})`;ctx.lineWidth=1;ctx.beginPath();
    for(const L of LEVELS){
      for(let j=0;j<rows-1;j++)for(let i=0;i<cols-1;i++){
        const a=g[j*cols+i],b=g[j*cols+i+1],c=g[(j+1)*cols+i+1],d=g[(j+1)*cols+i];
        const idx=(a>L?8:0)|(b>L?4:0)|(c>L?2:0)|(d>L?1:0);if(idx===0||idx===15)continue;
        const x=i*CELL,y=j*CELL,lerp=(p,q)=>(L-p)/(q-p);
        const T=[x+CELL*lerp(a,b),y],R=[x+CELL,y+CELL*lerp(b,c)],B=[x+CELL*lerp(d,c),y+CELL],Lf=[x,y+CELL*lerp(a,d)];
        const seg=(p,q)=>{ctx.moveTo(p[0],p[1]);ctx.lineTo(q[0],q[1])};
        switch(idx){case 1:case 14:seg(Lf,B);break;case 2:case 13:seg(B,R);break;case 3:case 12:seg(Lf,R);break;case 4:case 11:seg(T,R);break;
          case 5:seg(Lf,T);seg(B,R);break;case 6:case 9:seg(T,B);break;case 7:case 8:seg(Lf,T);break;case 10:seg(T,R);seg(Lf,B);break}
      }
    }
    ctx.stroke();
  }
  function loop(now){
    if(!running)return;
    if(now-last>=40){ // ~25 fps is plenty for motion this slow
      P.x+=(P.tx-P.x)*.06;P.y+=(P.ty-P.y)*.06;P.amp+=(P.ta-P.amp)*.04;draw(now);last=now}
    raf=requestAnimationFrame(loop);
  }
  function resize(){const r=canvas.getBoundingClientRect();if(!r.width)return;dpr=Math.min(devicePixelRatio||1,1.5);w=r.width;h=r.height;canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);draw(performance.now())}
  const host=canvas.parentElement;
  host.addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;const r=canvas.getBoundingClientRect();P.tx=e.clientX-r.left;P.ty=e.clientY-r.top;if(P.x<-9e3){P.x=P.tx;P.y=P.ty}P.ta=.9});
  host.addEventListener('pointerleave',()=>{P.ta=0});
  function go(){if(running||reduced.matches){if(reduced.matches)draw(performance.now());return}running=true;raf=requestAnimationFrame(loop)}
  function halt(){running=false;cancelAnimationFrame(raf)}
  new IntersectionObserver(es=>{es[0].isIntersecting&&want?go():halt()}).observe(canvas);
  document.addEventListener('visibilitychange',()=>{document.hidden?halt():want&&go()});
  new ResizeObserver(()=>resize()).observe(canvas);
  reduced.addEventListener('change',()=>{halt();want&&go()});
  return{start(){want=true;resize();go()},stop(){want=false;halt()},resize,recolor};
}
const cv=document.getElementById('ambient');
if(cv){ambient=makeAmbient(cv);ambient.recolor();ambient.start()}
observe();
})();
