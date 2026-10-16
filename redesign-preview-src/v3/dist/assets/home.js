(()=>{
const {$,$$,reduced,root,onceVisible,blinkLoop}=AG;

/* clone the hero task scenes into the mobile grid */
const sm=$('.scenes-mobile');
if(sm)$$('[data-scene]').forEach(n=>{const c=n.cloneNode(true);c.removeAttribute('data-scene');sm.appendChild(c)});
Gogo.mountAll(sm);
let ambient=null, story=null;
AG.onTheme.push(()=>{ambient&&ambient.recolor();story&&story.refreshGogo()});
/* ---------- hero Gogo: blink, gaze, a one-time hello ---------- */
const heroG=$('[data-hero]');
if(heroG){
  blinkLoop(heroG);
  let greeted=false;
  const hello=()=>{if(greeted||reduced.matches)return;greeted=true;Gogo.mount(heroG,'acting');setTimeout(()=>Gogo.mount(heroG,'listening'),1600)};
  addEventListener('pointermove',e=>{
    if(e.pointerType==='touch'||reduced.matches)return;
    const r=heroG.getBoundingClientRect();if(r.bottom<0)return;
    const cx=r.left+r.width/2,cy=r.top+r.height/2,dx=e.clientX-cx,dy=e.clientY-cy,d=Math.hypot(dx,dy)||1;
    const p=$('.gogo-pupils',heroG);if(p)p.style.transform=`translate(${(dx/d*Math.min(2.2,d/120)).toFixed(2)}px,${(dy/d*Math.min(1.8,d/120)).toFixed(2)}px)`;
    if(d<300)hello();
  },{passive:true});
  $('[data-cta="home-hero"]').addEventListener('focus',hello);
  setTimeout(()=>{if(!greeted&&matchMedia('(hover: none)').matches)hello()},1800);
}

/* ---------- Meet Gogo beats ---------- */
const beats=$('#beats'),beatEls=$$('[data-beat]',beats);
const beatSeq=(function(){
  let k=-1,t=null,active=false,offscreen=false;
  const paused=()=>offscreen||document.hidden;
  function show(n){beatEls.forEach((b,i)=>b.classList.toggle('on',i===n))}
  function step(){clearTimeout(t);if(!active||paused())return;
    k++;if(k>=beatEls.length){active=false;beats.classList.remove('playing');show(-1);return}
    show(k);t=setTimeout(step,1400)}
  function play(){clearTimeout(t);if(reduced.matches){beats.classList.remove('playing');show(-1);return}
    active=true;k=-1;beats.classList.add('playing');t=setTimeout(step,300)}
  new IntersectionObserver(es=>{offscreen=!es[0].isIntersecting;if(offscreen)clearTimeout(t);else if(active)t=setTimeout(step,400)},{threshold:.2}).observe(beats);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)clearTimeout(t);else if(active)t=setTimeout(step,400)});
  return{play};
})();
onceVisible(beats,beatSeq.play,.4);
$('#beats-replay').onclick=beatSeq.play;

/* ---------- See how Gogo works ---------- */
const STORIES={
  car:[
    {st:'listening',label:'Listening',what:'Gogo reads the request.',add:[{me:'Get my car serviced before the Mysuru drive on Saturday.'}]},
    {st:'remembering',label:'Remembering',what:'It uses what you told it earlier.',add:[{mem:{k:'Remembered',v:'Your hatchback · usual service centre in Rajajinagar · mornings preferred',src:'You told Gogo on WhatsApp · 2 Sep'}}]},
    {st:'thinking',label:'Planning',what:'It works out the deadline.',add:[{gg:'The drive is on Sat 24 Oct, so the service needs to finish by Fri 23 Oct. I’ll look for a morning slot.'}]},
    {st:'acting',label:'Searching',what:'It checks the centre’s open morning slots.',add:[{gg:'Found Thu 22 Oct, 9:30 am, with pickup from home.'}]},
    {st:'approval',label:'Waiting for approval',what:'Nothing is booked until you say yes.',gate:true,add:[{approval:{k:'Needs your approval',rows:[['Service','General service'],['When','Thu 22 Oct, 9:30 am'],['Pickup','From home'],['Payment','Pay at the centre']],yes:'Approve booking',no:'Not now'}}]},
    {st:'done',label:'Verified result',what:'Done, with the confirmation.',add:[{result:{k:'Confirmed',v:'Car service booked',rows:[['Confirmation','SVC-48213 (example)'],['Reminder','Wed 21 Oct, 7:00 pm']],badge:'Confirmed by the service centre'}}]}
  ],
  receipt:[
    {st:'listening',label:'Listening',what:'Gogo reads the request.',add:[{me:'Find the receipt for the washing machine I bought.'}]},
    {st:'remembering',label:'Remembering',what:'It recalls what you shared earlier.',add:[{mem:{k:'Remembered',v:'Washing machine receipt · PDF',src:'You shared it on WhatsApp · Thu 12 Mar 2026'}}]},
    {st:'thinking',label:'Searching',what:'It checks your saved documents.',add:[{gg:'One match in your saved receipts.'}]},
    {st:'done',label:'Verified result',what:'It sends the file.',add:[{file:'receipt-washing-machine.pdf · 1 page'},{gg:'Here it is. No approval needed: this only reads your own saved files.'}]}
  ],
  travel:[
    {st:'listening',label:'Listening',what:'Gogo reads the request.',add:[{me:'Compare ways to get to Goa on Sat 14 Nov. Morning, under ₹6,000.'}]},
    {st:'remembering',label:'Remembering',what:'It uses your saved preferences.',add:[{mem:{k:'Remembered',v:'Flies from Bengaluru · prefers window seats',src:'Corrected by you · 9 Oct'}}]},
    {st:'acting',label:'Searching',what:'It checks options for that morning.',add:[{gg:'Checking flights and buses for Sat 14 Nov…'}]},
    {st:'found',label:'Comparing',what:'It shows the options side by side.',add:[{cmp:{k:'Options · example fares',rows:[['Flight 06:10 → 07:20','₹4,850',1],['Flight 09:40 → 10:55','₹5,600',0],['Overnight bus, Fri 21:00','₹1,900',0]]}}]},
    {st:'approval',label:'Waiting for approval',what:'Nothing is booked until you say yes.',gate:true,add:[{approval:{k:'Needs your approval',rows:[['Flight','06:10 → 07:20, Sat 14 Nov'],['Fare','₹4,850 (example)'],['Seat','Window'],['Traveller','Your saved details']],yes:'Approve booking',no:'Not now'}}]},
    {st:'done',label:'Verified result',what:'Done, with the confirmation.',add:[{result:{k:'Confirmed',v:'Flight booked',rows:[['Booking ref','GX7Q4M (example)'],['Check-in reminder','Fri 13 Nov, 06:10']],badge:'E-ticket saved to your trip'}}]}
  ]
};
const ICON_OK='<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M2.5 6.5l2.2 2.2L9.5 3.8"/></svg>';
const esc=s=>String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
function msgHTML(m,ctx){
  if(m.me)return `<div class="msg me">${esc(m.me)}</div>`;
  if(m.gg)return `<div class="msg gg">${esc(m.gg)}</div>`;
  if(m.file)return `<div class="msg gg"><div class="file" style="border:0;padding:0"><span class="fi">PDF</span>${esc(m.file)}</div></div>`;
  if(m.mem)return `<div class="msg card"><p class="kk">${esc(m.mem.k)}</p><p style="margin-top:6px;font-weight:500">${esc(m.mem.v)}</p><p class="meta">${esc(m.mem.src)}</p></div>`;
  if(m.cmp)return `<div class="msg card"><p class="kk">${esc(m.cmp.k)}</p><table class="cmp">${m.cmp.rows.map(r=>`<tr class="${r[2]?'pick':''}"><td>${esc(r[0])}${r[2]?' · best fit':''}</td><td>${esc(r[1])}</td></tr>`).join('')}</table></div>`;
  const rows=r=>`<div class="rows">${r.map(x=>`<div><span>${esc(x[0])}</span><span>${esc(x[1])}</span></div>`).join('')}</div>`;
  if(m.approval){
    const dec=ctx.decision;
    const acts=dec?`<p class="meta">${dec==='yes'?'You approved this.':'You chose not now.'}</p>`:
      `<div class="acts"><button class="btn btn-solid btn-sm" type="button" data-decide="yes">${esc(m.approval.yes)}</button><button class="btn btn-ghost btn-sm" type="button" data-decide="no">${esc(m.approval.no)}</button></div><p class="meta">Illustrative: choosing here only moves the preview along.</p>`;
    return `<div class="msg card approval"><p class="kk" style="color:var(--accent-ink)">${esc(m.approval.k)}</p>${rows(m.approval.rows)}${acts}</div>`;
  }
  if(m.result)return `<div class="msg card result"><p class="kk">${esc(m.result.k)}</p><p style="margin-top:6px;font-weight:500">${esc(m.result.v)}</p>${rows(m.result.rows)}<p style="margin-top:10px"><span class="ok-badge">${ICON_OK}${esc(m.result.badge)} (illustrative)</span></p></div>`;
  return '';
}
story=(function(){
  const msgs=$('#msgs'),gEl=$('#story-gogo'),stEl=$('#story-state'),whatEl=$('#story-what'),dots=$('#story-dots'),
    play=$('#st-play'),prev=$('#st-prev'),next=$('#st-next'),hint=$('#st-hint'),panel=$('#story-panel');
  let key='car',i=0,playing=false,userPaused=false,hover=false,timer=null,decision=null,declined=false,started=false;
  const steps=()=>STORIES[key];
  function setPlayIcon(){$('.i-pause',play).toggleAttribute('hidden',!playing);$('.i-play',play).toggleAttribute('hidden',playing);play.setAttribute('aria-label',playing?'Pause':'Play')}
  function render(animateLast){
    const S=steps(),s=S[i];
    Gogo.mount(gEl,declined?'calm':s.st);
    stEl.textContent=`Step ${i+1} of ${S.length} · ${declined?'Stopped':s.label}`;
    whatEl.textContent=declined?'You said not now, so nothing was booked.':s.what;
    let h='';for(let j=0;j<=i;j++)S[j].add.forEach(m=>{h+=msgHTML(m,{decision:S[j].gate?decision:null})});
    if(declined)h+=msgHTML({gg:'Okay, I won’t book it. I’ve kept the slot details in case you change your mind.'},{});
    msgs.innerHTML=h;
    if(!animateLast)$$('.msg',msgs).forEach(m=>m.style.animation='none');
    else{const all=$$('.msg',msgs),n=S[i].add.length+(declined?1:0);all.slice(0,all.length-n).forEach(m=>m.style.animation='none')}
    const gi=S.findIndex(x=>x.gate),locked=j=>gi>=0&&j>gi&&(declined||!decision);
    dots.innerHTML=S.map((x,j)=>`<button type="button" aria-label="Step ${j+1}: ${x.label}${locked(j)?' (needs approval first)':''}" ${j===i?'aria-current="step"':''} ${locked(j)?'disabled':''} class="${j<i?'past':''}" data-step="${j}"></button>`).join('');
    const waiting=s.gate&&!decision;
    next.disabled=i>=S.length-1||waiting||declined; prev.disabled=i===0;
    hint.textContent=waiting?'Waiting for your approval in the chat.':declined||i===S.length-1?'End of example. Replay or pick another.':(playing?'Plays step by step. Pauses while you hover or focus.':'Paused. Use the arrows to step through.');
    setPlayIcon();
  }
  let offscreen=false;
  function schedule(){clearTimeout(timer);if(!playing||hover||offscreen||document.hidden||reduced.matches)return;
    const S=steps();if(i>=S.length-1||declined||(S[i].gate&&!decision)){playing=false;setPlayIcon();render(false);return}
    timer=setTimeout(()=>{i++;render(true);schedule()},2600)}
  function go(j,anim){clearTimeout(timer);const S=steps();
    // Moving back past the approval step clears the decision.
    const g=S.findIndex(x=>x.gate);if(g>=0&&j<=g){decision=null;declined=false}
    if(g>=0&&j>g&&(declined||!decision))j=g; // the verified result is only reachable through approval
    i=Math.max(0,Math.min(S.length-1,j));render(anim);schedule()}
  function setStory(k){key=k;decision=null;declined=false;
    $$('[data-story]').forEach(t=>{const on=t.dataset.story===k;t.setAttribute('aria-selected',on);t.tabIndex=on?0:-1;if(on)panel.setAttribute('aria-labelledby',t.id)});
    playing=!userPaused&&!reduced.matches&&started;go(0,true)}
  play.onclick=()=>{const S=steps();
    if(!playing&&(i>=S.length-1||declined)){userPaused=false;playing=true;go(0,true);return}
    playing=!playing;userPaused=!playing;setPlayIcon();render(false);schedule()};
  prev.onclick=()=>{playing=false;userPaused=true;go(i-1,false)};
  next.onclick=()=>{playing=false;userPaused=true;go(i+1,true)};
  $('#st-replay').onclick=()=>{userPaused=false;playing=!reduced.matches;go(0,true)};
  dots.addEventListener('click',e=>{const b=e.target.closest('[data-step]');if(!b)return;playing=false;userPaused=true;go(+b.dataset.step,false)});
  msgs.addEventListener('click',e=>{const b=e.target.closest('[data-decide]');if(!b)return;
    decision=b.dataset.decide;
    if(decision==='no'){declined=true;playing=false;render(true);return}
    const S=steps();i=Math.min(S.length-1,i+1);render(true);schedule();
    whatEl.focus?.()});
  const tabs=$$('[data-story]');
  tabs.forEach((t,ix)=>{t.onclick=()=>setStory(t.dataset.story);
    t.onkeydown=e=>{let n=null;if(e.key==='ArrowRight')n=(ix+1)%tabs.length;if(e.key==='ArrowLeft')n=(ix-1+tabs.length)%tabs.length;if(e.key==='Home')n=0;if(e.key==='End')n=tabs.length-1;
      if(n!==null){e.preventDefault();tabs[n].focus();setStory(tabs[n].dataset.story)}}});
  panel.addEventListener('pointerenter',()=>{hover=true;clearTimeout(timer)});
  panel.addEventListener('pointerleave',()=>{hover=false;schedule()});
  panel.addEventListener('focusin',()=>{hover=true;clearTimeout(timer)});
  panel.addEventListener('focusout',e=>{if(!panel.contains(e.relatedTarget)){hover=false;schedule()}});
  new IntersectionObserver(es=>{offscreen=!es[0].isIntersecting;offscreen?clearTimeout(timer):schedule()},{threshold:.15}).observe(panel);
  document.addEventListener('visibilitychange',()=>{document.hidden?clearTimeout(timer):schedule()});
  render(false);
  onceVisible(panel,()=>{started=true;if(!reduced.matches&&!userPaused){playing=true;render(false);schedule()}},.45);
  return{refreshGogo:()=>render(false)};
})();
blinkLoop($('#story-gogo'));

/* ---------- Trust panels ---------- */
const TRUST=[
  ()=>`<div class="tpanel"><span data-gogo="remembering" aria-hidden="true"></span><div class="mcard edit"><p class="kk">Remembered</p><p class="v">Prefers <s>aisle</s> window seats</p><div class="src"><span data-gogo="calm" aria-hidden="true"></span><span>Corrected by you · 9 Oct<br>First noted from WhatsApp · 2 Sep</span></div><div class="acts" aria-hidden="true"><span class="fake">Correct</span></div></div></div>`,
  ()=>`<div class="tpanel"><span data-gogo="approval" aria-hidden="true"></span><div class="mcard"><p class="kk" style="color:var(--accent-ink)">Needs your approval</p><p class="v">Book car service</p><div class="msg card" style="all:unset;display:block;margin-top:8px"><div class="rows" style="display:grid;gap:6px;font-size:14px"><div style="display:flex;justify-content:space-between"><span style="color:var(--ink-2)">When</span><span>Thu 22 Oct, 9:30 am</span></div><div style="display:flex;justify-content:space-between"><span style="color:var(--ink-2)">Pickup</span><span>From home</span></div></div></div><div class="acts" aria-hidden="true"><span class="fake dark">Approve</span><span class="fake">Not now</span></div></div></div>`,
  ()=>`<div class="tpanel"><span data-gogo="done" aria-hidden="true"></span><div class="mcard"><p class="kk" style="color:var(--ok-ink)">Done</p><p class="v">Car service booked</p><div class="src" style="display:block"><div style="display:flex;justify-content:space-between"><span>Confirmation</span><span style="color:var(--ink)">SVC-48213 (example)</span></div><div style="display:flex;justify-content:space-between;margin-top:4px"><span>Reminder</span><span style="color:var(--ink)">Wed 21 Oct, 7:00 pm</span></div></div><p style="margin-top:12px"><span class="ok-badge">${ICON_OK}Confirmation attached (illustrative)</span></p></div></div>`
];
const tviz=$('#tviz'),titems=$$('[data-trust]');
function showTrust(n){titems.forEach((t,ix)=>{const on=ix===n;t.setAttribute('aria-selected',on);t.tabIndex=on?0:-1});tviz.setAttribute('aria-labelledby',titems[n].id);tviz.innerHTML=TRUST[n]();Gogo.mountAll(tviz)}
titems.forEach((t,ix)=>{t.onclick=()=>showTrust(ix);t.onkeydown=e=>{let n=null;if(e.key==='ArrowDown'||e.key==='ArrowRight')n=(ix+1)%3;if(e.key==='ArrowUp'||e.key==='ArrowLeft')n=(ix+2)%3;if(n!==null){e.preventDefault();titems[n].focus();showTrust(n)}}});
showTrust(0);

/* ---------- Business cards settle in ---------- */
const biz=$('#bizstage');
if(reduced.matches)biz.classList.remove('pre');else onceVisible(biz,()=>biz.classList.remove('pre'),.3);

/* ---------- faint hero contours (reduced from v2) ---------- */
function makeAmbient(canvas){
  const ctx=canvas.getContext('2d');let w=0,h=0,raf=0,running=false,last=0,col='28,28,30',alpha=.04;
  const P={x:-1e4,y:-1e4,tx:-1e4,ty:-1e4,amp:0,ta:0},CELL=20,LEVELS=[-1.2,-.4,.4,1.2];
  function recolor(){const cs=getComputedStyle(root);col=cs.getPropertyValue('--field').trim()||col;alpha=parseFloat(cs.getPropertyValue('--field-a'))||alpha;if(!running)draw(performance.now())}
  const field=(x,y,t)=>{const u=x/w*3,v=y/h*2.2;let f=Math.sin(u*1.3+t*.05+Math.sin(v*1.7-t*.04)*1.4)+.8*Math.sin(v*1.9-t*.035+Math.sin(u*1.1+t*.03)*1.2);
    if(P.amp>.001){const dx=x-P.x,dy=y-P.y;f+=P.amp*Math.exp(-(dx*dx+dy*dy)/(2*170*170))}return f};
  function draw(now){const t=now/1000;ctx.clearRect(0,0,w,h);const cols=Math.ceil(w/CELL)+1,rows=Math.ceil(h/CELL)+1,g=new Float32Array(cols*rows);
    for(let j=0;j<rows;j++)for(let i=0;i<cols;i++)g[j*cols+i]=field(i*CELL,j*CELL,t);
    ctx.strokeStyle=`rgba(${col},${alpha})`;ctx.lineWidth=1;ctx.beginPath();
    for(const L of LEVELS)for(let j=0;j<rows-1;j++)for(let i=0;i<cols-1;i++){
      const a=g[j*cols+i],b=g[j*cols+i+1],c=g[(j+1)*cols+i+1],d=g[(j+1)*cols+i],idx=(a>L?8:0)|(b>L?4:0)|(c>L?2:0)|(d>L?1:0);if(idx===0||idx===15)continue;
      const x=i*CELL,y=j*CELL,l=(p,q)=>(L-p)/(q-p),T=[x+CELL*l(a,b),y],R=[x+CELL,y+CELL*l(b,c)],B=[x+CELL*l(d,c),y+CELL],Lf=[x,y+CELL*l(a,d)],sg=(p,q)=>{ctx.moveTo(p[0],p[1]);ctx.lineTo(q[0],q[1])};
      switch(idx){case 1:case 14:sg(Lf,B);break;case 2:case 13:sg(B,R);break;case 3:case 12:sg(Lf,R);break;case 4:case 11:sg(T,R);break;case 5:sg(Lf,T);sg(B,R);break;case 6:case 9:sg(T,B);break;case 7:case 8:sg(Lf,T);break;case 10:sg(T,R);sg(Lf,B);break}}
    ctx.stroke()}
  function loop(now){if(!running)return;if(now-last>=50){P.x+=(P.tx-P.x)*.06;P.y+=(P.ty-P.y)*.06;P.amp+=(P.ta-P.amp)*.04;draw(now);last=now}raf=requestAnimationFrame(loop)}
  function resize(){const r=canvas.getBoundingClientRect();if(!r.width)return;const dpr=Math.min(devicePixelRatio||1,1.5);w=r.width;h=r.height;canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);draw(performance.now())}
  const host=canvas.parentElement;
  host.addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;const r=canvas.getBoundingClientRect();P.tx=e.clientX-r.left;P.ty=e.clientY-r.top;if(P.x<-9e3){P.x=P.tx;P.y=P.ty}P.ta=.7});
  host.addEventListener('pointerleave',()=>{P.ta=0});
  const go=()=>{if(running)return;if(reduced.matches){draw(performance.now());return}running=true;raf=requestAnimationFrame(loop)},halt=()=>{running=false;cancelAnimationFrame(raf)};
  new IntersectionObserver(es=>{es[0].isIntersecting?go():halt()}).observe(canvas);
  document.addEventListener('visibilitychange',()=>{document.hidden?halt():go()});
  new ResizeObserver(()=>resize()).observe(canvas);
  return{recolor};
}
const cv=$('#ambient');if(cv){ambient=makeAmbient(cv);ambient.recolor()}

})();
