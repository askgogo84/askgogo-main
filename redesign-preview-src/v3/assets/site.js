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

/* ---------- header, drawer ---------- */
const hdr=$('#hdr');
addEventListener('scroll',()=>hdr.classList.toggle('scrolled',scrollY>8),{passive:true});
const drawer=$('#drawer'),mo=$('#menu-open');
function closeDrawer(silent){if(drawer.hidden)return;drawer.hidden=true;mo.setAttribute('aria-expanded','false');if(!silent)mo.focus()}
mo.onclick=()=>{drawer.hidden=false;mo.setAttribute('aria-expanded','true');$('nav a',drawer).focus()};
$('#menu-close').onclick=()=>closeDrawer();
const PAGE=document.body.dataset.page||'';
$$('.nav a,.drawer nav a').forEach(a=>{const r=a.dataset.r;const on=r===PAGE||(r==='journal'&&PAGE.startsWith('essay'));on?a.setAttribute('aria-current','page'):a.removeAttribute('aria-current')});

/* ---------- sheets (mock forms) ---------- */
let opener=null;
function openSheet(id,btn){closeDrawer(true);const s=$('#sheet-'+id);$('[data-form]',s).hidden=false;$('[data-done]',s).hidden=true;s.hidden=false;opener=btn;s.dataset.source=btn?.dataset.cta||'site';setTimeout(()=>$('input',s)?.focus(),30)}
function closeSheet(s){s.hidden=true;opener?.focus?.()}
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
/* arrival for below-fold blocks */
if(!reduced.matches&&'IntersectionObserver' in window){
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('go');io.unobserve(e.target)}}),{rootMargin:'0px 0px -8% 0px'});
  $$('.sh,.beats,.story,.trust,.list,.closing,[data-rise]').forEach(el=>{if(el.getBoundingClientRect().top>innerHeight){el.classList.add('rise');io.observe(el)}});
}
})();
