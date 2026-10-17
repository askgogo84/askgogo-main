(()=>{
const root=document.documentElement;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
window.AG={$,$$,reduced,root};
Gogo.mountAll();
/* ---------- theme ---------- */
const KEY='askgogo-theme';
function readTheme(){try{return localStorage.getItem(KEY)}catch(e){return null}}
function applyTheme(t){
  root.classList.toggle('mode-dark',t==='dark');
  $$('.theme-btn').forEach(b=>{b.setAttribute('aria-label',t==='dark'?'Switch to light theme':'Switch to dark theme');
    b.querySelector('.i-moon').toggleAttribute('hidden',t==='dark');b.querySelector('.i-sun').toggleAttribute('hidden',t!=='dark')});
  Gogo.mountAll(); (AG.onTheme||[]).forEach(f=>f(t));
}
AG.onTheme=[];
applyTheme(readTheme()==='dark'?'dark':'light');
document.addEventListener('click',e=>{
  if(!e.target.closest('.theme-btn'))return;
  const next=root.classList.contains('mode-dark')?'light':'dark';
  try{localStorage.setItem(KEY,next)}catch(err){}
  applyTheme(next);
});

/* iOS Safari only applies :active (the press state) to links and non-button elements once a touch listener exists on the document. */
document.addEventListener('touchstart',()=>{},{passive:true});
/* ---------- header, drawer ---------- */
const hdr=$('#hdr');
addEventListener('scroll',()=>hdr.classList.toggle('scrolled',scrollY>8),{passive:true});
const drawer=$('#drawer'),mo=$('#menu-open');
/* Show/hide through a class so the transition can turn around mid-flight. Hidden only once the exit transition ends. */
function reveal(el){el.hidden=false;el.offsetHeight;el.classList.add('in')}
function conceal(el,done){if(el.hidden)return;el.classList.remove('in');
  const fin=()=>{if(!el.classList.contains('in')){el.hidden=true;done&&done()}};
  if(reduced.matches){fin();return}
  let ended=false;const h=e=>{if(e.target!==el&&!e.target.matches('.panel'))return;ended=true;el.removeEventListener('transitionend',h);fin()};
  el.addEventListener('transitionend',h);setTimeout(()=>{if(!ended){el.removeEventListener('transitionend',h);fin()}},700)}
function closeDrawer(silent){if(drawer.hidden)return;conceal(drawer);mo.setAttribute('aria-expanded','false');if(!silent)mo.focus()}
mo.onclick=()=>{reveal(drawer);mo.setAttribute('aria-expanded','true');$('nav a',drawer).focus()};
$('#menu-close').onclick=()=>closeDrawer();
const PAGE=document.body.dataset.page||'';
$$('.nav a,.drawer nav a').forEach(a=>{const r=a.dataset.r;const on=r===PAGE||(r==='journal'&&PAGE.startsWith('essay'));on?a.setAttribute('aria-current','page'):a.removeAttribute('aria-current')});

/* ---------- sheets (mock forms) ---------- */
let opener=null;
function openSheet(id,btn){closeDrawer(true);const s=$('#sheet-'+id);$('[data-form]',s).hidden=false;$('[data-done]',s).hidden=true;const p=$('.panel',s);p.style.transform='';reveal(s);opener=btn;s.dataset.source=btn?.dataset.cta||'site';
  if(!matchMedia('(max-width:520px)').matches)setTimeout(()=>$('input',s)?.focus(),60)}
function closeSheet(s){if(s.hidden)return;conceal(s);opener?.focus?.()}
/* Direct manipulation: the sheet follows the finger 1:1, rubber-bands past the top (0.55), and a flick or a long pull dismisses it with the finger's speed. */
$$('.sheet .panel').forEach(panel=>{
  const sheet=panel.closest('.sheet');let y0=0,dy=0,t0=0,vy=0,lastY=0,lastT=0,active=false,dragging=false,pid=null;
  const rubber=d=>{const c=0.55,dim=panel.offsetHeight||400;return (1-(1/((d*c/dim)+1)))*dim};
  panel.addEventListener('pointerdown',e=>{
    if(e.pointerType==='mouse'&&e.button!==0)return;
    if(e.target.closest('input,select,textarea,button,a,label'))return;
    if(panel.scrollTop>0)return;
    active=true;dragging=false;y0=lastY=e.clientY;t0=lastT=e.timeStamp;dy=0;vy=0;pid=e.pointerId;
  });
  panel.addEventListener('pointermove',e=>{
    if(!active)return;const d=e.clientY-y0;
    if(!dragging){if(Math.abs(d)<10)return;dragging=true;panel.classList.add('dragging');panel.setPointerCapture(pid);sheet.classList.add('drag')}
    dy=d;const now=e.timeStamp;if(now>lastT){vy=(e.clientY-lastY)/(now-lastT)}lastY=e.clientY;lastT=now;
    const off=d>=0?d:-rubber(-d);
    panel.style.transform=`translateY(${off}px)`;
    $('.bd',sheet).style.opacity=String(Math.max(0,1-Math.max(0,d)/(panel.offsetHeight||400)*0.9));
  });
  const end=e=>{
    if(!active)return;active=false;if(!dragging)return;dragging=false;
    panel.classList.remove('dragging');sheet.classList.remove('drag');try{panel.releasePointerCapture(pid)}catch(x){}
    $('.bd',sheet).style.opacity='';
    const h=panel.offsetHeight||400;
    if(dy>h*0.35||vy>0.5){
      /* velocity handoff: the remaining travel takes as long as the finger would have taken, clamped */
      const remain=h-dy,ms=Math.min(360,Math.max(140,vy>0?remain/vy:260));
      panel.style.transition=`transform ${ms}ms cubic-bezier(.2,.6,.3,1)`;panel.style.transform=`translateY(${h+24}px)`;
      const fin=()=>{panel.style.transition='';panel.style.transform='';sheet.classList.remove('in');sheet.hidden=true;opener?.focus?.()};
      let done=false;panel.addEventListener('transitionend',()=>{if(!done){done=true;fin()}},{once:true});setTimeout(()=>{if(!done){done=true;fin()}},ms+80);
    } else {panel.style.transform=''}
  };
  panel.addEventListener('pointerup',end);panel.addEventListener('pointercancel',end);
});
document.addEventListener('click',e=>{
  const o=e.target.closest('[data-open]');if(o){e.preventDefault();openSheet(o.dataset.open,o);return}
  const c=e.target.closest('[data-close]');if(c)closeSheet(c.closest('.sheet'));
});
document.addEventListener('keydown',e=>{
  const s=$('.sheet:not([hidden])')||(!drawer.hidden?drawer:null);if(!s)return;
  if(e.key==='Escape'){s===drawer?closeDrawer():closeSheet(s);return}
  if(e.key!=='Tab')return;
  const f=$$('button,a[href],input,select,textarea',s).filter(x=>x.offsetParent!==null);if(!f.length)return;
  const a=f[0],b=f[f.length-1];
  if(e.shiftKey&&document.activeElement===a){e.preventDefault();b.focus()}else if(!e.shiftKey&&document.activeElement===b){e.preventDefault();a.focus()}
});
const EMAIL=/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
/* International numbers (E.164: country code plus 6 to 14 digits). India and the UAE keep their stricter checks.
   The live API currently accepts only +91 and +971; the backend change is tracked separately. */
const phoneOk=(cc,raw)=>{const d=String(raw).replace(/\D/g,'');
  if(cc==='91')return /^[6-9]\d{9}$/.test(d);if(cc==='971')return /^5\d{8}$/.test(d);
  if(cc==='other')return /^\+?[1-9]\d{7,14}$/.test(String(raw).replace(/[\s-]/g,''));
  return d.length>=6&&d.length<=14};
const phoneMsg=cc=>cc==='91'?'Enter a 10-digit Indian mobile number starting with 6, 7, 8 or 9.':cc==='971'?'Enter a 9-digit UAE mobile number starting with 5.':cc==='other'?'Enter the full number with the country code, for example +33 6 12 34 56 78.':'Enter the mobile number without the country code.';
function setErr(id,msg){const el=$('#'+id),inp=$('#'+id.replace(/-err$/,''));el.textContent=msg||'';if(inp)inp.setAttribute('aria-invalid',msg?'true':'false');return !msg}
function wirePhone(inp,sel){const ph={'91':'98765 43210','971':'50 123 4567','1':'415 555 0132','44':'7700 900123',other:'+33 6 12 34 56 78'};
  const fix=()=>{const o=sel.value==='other';inp.value=o?inp.value.replace(/[^\d+\s]/g,''):inp.value.replace(/\D/g,'').slice(0,sel.value==='91'?10:sel.value==='971'?9:14)};
  inp.addEventListener('input',fix);sel.addEventListener('change',()=>{inp.placeholder=ph[sel.value]||'Mobile number';fix()})}
wirePhone($('#wl-phone'),$('#wl-country'));wirePhone($('#ea-phone'),$('#ea-country'));
function finish(form){const s=form.closest('.sheet');$('[data-form]',s).hidden=true;const d=$('[data-done]',s);d.hidden=false;Gogo.mountAll(d);$('button',d).focus()}
const firstInvalid=form=>{const x=$('[aria-invalid=true]',form);x&&x.focus()};
/* Submission. In the preview build (no AG_LIVE) nothing is sent. In the live build the waitlist API receives
   { country, phone, email, whatsapp_opt_in, source, company } where company is the honeypot and must stay empty. */
const LIVE=!!window.AG_LIVE, API='https://app.askgogo.in/api/waitlist';
const ISO={'91':'IN','971':'AE','1':'US','44':'GB','65':'SG','966':'SA','61':'AU','49':'DE'};
function payload(cc,raw,email,optin,source){const d=String(raw).replace(/\D/g,'');
  const intl=cc!=='91'&&cc!=='971';
  return {country:ISO[cc]||'XX',phone:intl?(cc==='other'?'+'+d:'+'+cc+d):d,email,whatsapp_opt_in:!!optin,source:String(source||'site').toLowerCase().replace(/[^a-z0-9-]/g,'-').slice(0,32),company:''}}
async function send(form,body,btnLabel){
  const s=form.closest('.sheet'),status=$('[data-status]',s),btn=$('button[type=submit]',form);
  if(!LIVE){finish(form);return}
  status.textContent='';btn.disabled=true;const t=btn.textContent;btn.textContent='Sending…';
  try{const r=await fetch(API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    const data=await r.json().catch(()=>({}));
    if(!r.ok){const er=data.errors||{};
      if(body.country!=='IN'&&body.country!=='AE'&&(er.phone||er.country)){status.textContent='We can take Indian and UAE numbers on the site today. For other countries, write to support@askgogo.in and we will add you by hand.';return}
      if(er.phone)setErr(form.id.slice(0,2)+'-phone-err',er.phone);if(er.email)setErr(form.id.slice(0,2)+'-email-err',er.email);
      if(!er.phone&&!er.email)status.textContent='Please check your details and try again.';return}
    finish(form)}
  catch(e){status.textContent='We could not send that just now. Please try again.'}
  finally{btn.disabled=false;btn.textContent=t}}
$('#wl-form').addEventListener('submit',e=>{
  e.preventDefault();const v=id=>$('#'+id).value.trim(),cc=v('wl-country');
  const ok=[setErr('wl-email-err',EMAIL.test(v('wl-email'))?'':'Enter a valid email address.'),
            setErr('wl-phone-err',phoneOk(cc,v('wl-phone'))?'':phoneMsg(cc))].every(Boolean);
  if(!ok)return firstInvalid(e.target);
  send(e.target,payload(cc,v('wl-phone'),v('wl-email'),$('#wl-optin').checked,e.target.closest('.sheet').dataset.source));
});
$('#ea-form').addEventListener('submit',e=>{
  e.preventDefault();const v=id=>$('#'+id).value.trim(),cc=v('ea-country');
  const ok=[setErr('ea-name-err',v('ea-name').length>=2?'':'Enter your name.'),
            setErr('ea-company-err',v('ea-company').length>=2?'':'Enter your company name.'),
            setErr('ea-email-err',EMAIL.test(v('ea-email'))?'':'Enter a valid work email.'),
            setErr('ea-phone-err',phoneOk(cc,v('ea-phone'))?'':phoneMsg(cc)),
            setErr('ea-size-err',v('ea-size')?'':'Choose a team size.'),
            setErr('ea-use-err',v('ea-use').length>=10?'':'Tell us in a sentence what you would hand off first.'),
            setErr('ea-consent-err',$('#ea-consent').checked?'':'Please agree so we can contact you.')].every(Boolean);
  if(!ok)return firstInvalid(e.target);
  /* Until POST /api/early-access exists, team requests go to the waitlist API with source early-access-<cta>. Name, company, team size and use case are not stored yet. */
  send(e.target,payload(cc,v('ea-phone'),v('ea-email'),true,'early-access-'+(e.target.closest('.sheet').dataset.source||'site')));
});

/* ---------- motion gates ---------- */
document.addEventListener('visibilitychange',()=>root.classList.toggle('hidden-tab',document.hidden));
const gate=new IntersectionObserver(es=>es.forEach(e=>e.target.classList.toggle('paused',!e.isIntersecting)),{rootMargin:'80px'});
$$('main > section, .hdr').forEach(s=>gate.observe(s));
function onceVisible(el,fn,th=.35){const io=new IntersectionObserver(es=>{if(es[0].isIntersecting){io.disconnect();fn()}},{threshold:th});io.observe(el)}


AG.onceVisible=onceVisible;
/* blink helper for any character with open eyes */
AG.blinkLoop=function(el){if(!el)return;
  const tick=()=>{if(!reduced.matches&&!document.hidden&&!el.closest('.paused')){const svg=$('svg',el);if(svg&&$('.gogo-pupils',svg)){svg.classList.add('blink');setTimeout(()=>svg.classList.remove('blink'),150)}}
    setTimeout(tick,3800+Math.random()*2400)};
  setTimeout(tick,2200)};
$$('[data-blink]').forEach(AG.blinkLoop);
/* v5 reveals: single blocks and staggered children */
{const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{rootMargin:'0px 0px -8% 0px',threshold:.1});
 $$('.rv,[data-stagger]').forEach(el=>io.observe(el))}
/* arrival for below-fold blocks */
if(!reduced.matches&&'IntersectionObserver' in window){
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('go');io.unobserve(e.target)}}),{rootMargin:'0px 0px -8% 0px'});
  $$('.sh,.beats,.story,.trust,.list,.closing,[data-rise]').forEach(el=>{if(el.getBoundingClientRect().top>innerHeight){el.classList.add('rise');io.observe(el)}});
}
})();

/* v6: coloured paper that scatters ahead of the cursor on hero sections ([data-confetti]) */
(function(){
 const {$$,reduced}=window.AG;const fine=matchMedia('(hover:hover) and (pointer:fine)');
 if(!fine.matches||reduced.matches)return;
 const P=['#EF7A27','#F7B98A','#2FAE6A','#6CA7E8','#F2C94C','#C9A3F0','#F3E7D3'];
 $$('[data-confetti]').forEach(host=>{
  const c=document.createElement('canvas');c.className='cfx';c.setAttribute('aria-hidden','true');host.appendChild(c);
  const ctx=c.getContext('2d');let parts=[],w=0,h=0,raf=0,lx=null,ly=null;
  function size(){const r=host.getBoundingClientRect();const dpr=Math.min(2,devicePixelRatio||1);w=r.width;h=r.height;c.width=Math.max(1,w*dpr);c.height=Math.max(1,h*dpr);c.style.width=w+'px';c.style.height=h+'px';ctx.setTransform(dpr,0,0,dpr,0,0)}
  size();addEventListener('resize',size);addEventListener('ag:page',()=>setTimeout(size,0));
  function spawn(x,y,dx,dy){
   const n=2+(Math.random()*3|0),base=Math.atan2(dy,dx),speed=Math.hypot(dx,dy);
   for(let i=0;i<n;i++){const a=base+(Math.random()-.5)*1.3,sp=1.6+Math.random()*3+speed*.12;
    parts.push({x:x+(Math.random()-.5)*10,y:y+(Math.random()-.5)*10,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-1.2,r:Math.random()*Math.PI,vr:(Math.random()-.5)*.28,s:6+Math.random()*8,c:P[Math.random()*P.length|0],l:1,d:.011+Math.random()*.009})}
   if(parts.length>240)parts.splice(0,parts.length-240);
   if(!raf)raf=requestAnimationFrame(tick)}
  host.addEventListener('pointermove',e=>{if(e.pointerType&&e.pointerType!=='mouse')return;const r=host.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;
   if(lx===null){lx=x;ly=y;return}const dx=x-lx,dy=y-ly;if(Math.hypot(dx,dy)>12){spawn(x,y,dx,dy);lx=x;ly=y}});
  host.addEventListener('pointerleave',()=>{lx=ly=null});
  function tick(){ctx.clearRect(0,0,w,h);parts=parts.filter(p=>p.l>0);
   for(const p of parts){p.x+=p.vx;p.y+=p.vy;p.vy+=.11;p.vx*=.97;p.vy*=.985;p.r+=p.vr;p.l-=p.d;
    ctx.save();ctx.globalAlpha=Math.max(0,Math.min(1,p.l*1.5));ctx.translate(p.x,p.y);ctx.rotate(p.r);ctx.fillStyle=p.c;ctx.fillRect(-p.s/2,-p.s*.32,p.s,p.s*.64);ctx.restore()}
   raf=parts.length?requestAnimationFrame(tick):0}
 });
})();
;(function(){var D=document.getElementById('drawer');if(!D||!window.AG)return;window.AG.$$('nav a',D).forEach(function(a){var sx=0,sy=0;a.addEventListener('pointerdown',function(e){sx=e.clientX;sy=e.clientY},{passive:true});a.addEventListener('pointerup',function(e){if(e.pointerType==='mouse')return;if(Math.hypot(e.clientX-sx,e.clientY-sy)>12)return;var h=a.getAttribute('href');if(!h||h.charAt(0)==='#')return;setTimeout(function(){if(!a.dataset.went){a.dataset.went='1';location.href=a.href}},60)});a.addEventListener('click',function(){a.dataset.went='1'})})})();
