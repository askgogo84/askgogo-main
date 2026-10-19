(()=>{
const {$,$$,reduced,root,blinkLoop}=AG;

/* collage: clone the moments into the mobile rail, drift them at different depths on desktop */
const mm=$('.moments-mobile');
if(mm){$$('[data-moment]').forEach(n=>{const c=n.cloneNode(true);c.removeAttribute('data-moment');c.removeAttribute('data-depth');mm.appendChild(c)});Gogo.mountAll(mm)}
/* stacked scenes: the hero and the feed hold still while the next section slides over them, fading and settling back */
const stacks=$$('[data-stack]');
/* a sticky element's offsetTop reports where it is stuck, so measure from the siblings before it instead */
const docTop=el=>{let y=0;for(let n=el.parentElement;n;n=n.offsetParent)y+=n.offsetTop;for(let s=el.previousElementSibling;s;s=s.previousElementSibling)y+=s.offsetHeight;return y};
let tops=[];const measure=()=>{tops=stacks.map(docTop)};measure();addEventListener('load',measure);
const stackOn=matchMedia('(min-width:1021px)');
function stack(){if(reduced.matches||!stackOn.matches){stacks.forEach(el=>{const inner=el.firstElementChild||el;inner.style.opacity='';inner.style.transform=''});return}measure();const vh=innerHeight;stacks.forEach((el,i)=>{const inner=el.firstElementChild||el;
  const p=Math.min(1,Math.max(0,(scrollY-tops[i])/(vh*.6)));inner.style.opacity=String(1-p);inner.style.transform=`translateY(${(p*-40).toFixed(1)}px) scale(${(1-p*.04).toFixed(3)})`})}
addEventListener('scroll',()=>requestAnimationFrame(stack),{passive:true});addEventListener('resize',()=>{measure();stack()});
const par=$$('[data-depth]');
function drift(){if(reduced.matches)return;const y=Math.min(scrollY,900);par.forEach(el=>{const d=+el.dataset.depth||1;el.style.translate=`0 ${(y*-.12*d).toFixed(1)}px`})}
addEventListener('scroll',()=>requestAnimationFrame(drift),{passive:true});

/* hero Gogo: blink, gaze, a one-time hello */
const heroG=$('[data-hero]');
if(heroG){
  blinkLoop(heroG);let greeted=false;
  const hello=()=>{if(greeted||reduced.matches)return;greeted=true;Gogo.mount(heroG,'acting');setTimeout(()=>Gogo.mount(heroG,'listening'),1600)};
  addEventListener('pointermove',e=>{if(e.pointerType==='touch'||reduced.matches)return;const r=heroG.getBoundingClientRect();if(r.bottom<0)return;
    const cx=r.left+r.width/2,cy=r.top+r.height/2,dx=e.clientX-cx,dy=e.clientY-cy,d=Math.hypot(dx,dy)||1;
    const p=$('.gogo-pupils',heroG);if(p)p.style.transform=`translate(${(dx/d*Math.min(2.2,d/120)).toFixed(2)}px,${(dy/d*Math.min(1.8,d/120)).toFixed(2)}px)`;if(d<300)hello()},{passive:true});
  setTimeout(()=>{if(!greeted&&matchMedia('(hover: none)').matches)hello()},1800);
}

/* working-now feed: items arrive one by one */
const FEED=[
  ['done','Car service booked','Thu 22 Oct, 9:30 am · after you said yes','just now'],
  ['found','Washing machine receipt found','Sent as PDF · from March','2 min ago'],
  ['acting','Checking flights to Goa','Sat 14 Nov · morning, under ₹6,000','4 min ago'],
  ['watching','Reminder set: electricity bill','Wed 4 Nov, 7:00 pm · ₹2,340','11 min ago'],
  ['remembering','Kept: prefers window seats','Corrected by you · source noted','18 min ago'],
  ['acting','Called the dentist, booked Thu 5 pm','Two options offered · you picked one','22 min ago'],
  ['done','Moved your 3 pm to Thursday','Calendar updated · guests notified','26 min ago']
];
const feed=$('#feed');
const fitem=f=>`<div class="fitem"><span data-gogo="${f[0]}"></span><div><b>${f[1]}</b><span>${f[2]}</span></div><span class="when">${f[3]}</span></div>`;
if(feed){let k=0,t=null,run=false;
  const step=()=>{clearTimeout(t);if(!run||document.hidden||k>=FEED.length)return;feed.insertAdjacentHTML('afterbegin',fitem(FEED[k]));const el=feed.firstElementChild;Gogo.mountAll(el);requestAnimationFrame(()=>requestAnimationFrame(()=>el.classList.add('in')));k++;t=setTimeout(step,900)};
  if(true){feed.innerHTML=FEED.map(fitem).join('');Gogo.mountAll(feed);$$('.fitem',feed).forEach(e=>e.classList.add('in'))}
  else{new IntersectionObserver(es=>{run=es[0].isIntersecting;if(run&&!t)t=setTimeout(step,300);if(!run){clearTimeout(t);t=null}},{threshold:.2}).observe(feed);
    document.addEventListener('visibilitychange',()=>{if(!document.hidden&&run&&k<FEED.length)t=setTimeout(step,400)})}
}

/* WhatsApp surface: the car-service conversation, looping while visible */
const ICON_OK='<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M2.5 6.5l2.2 2.2L9.5 3.8"/></svg>';
const STORY=[
  [{me:'Get my car serviced before the Mysuru drive on Saturday.'}],
  [{card:`<p class="kk">Remembered</p><p class="v">Hatchback · usual centre in Rajajinagar · mornings</p><p class="meta">You told Gogo on WhatsApp · 2 Sep</p>`}],
  [{gg:'The drive is on Sat 24 Oct, so the service needs to finish by Fri 23 Oct. I’ll look for a morning slot.'}],
  [{gg:'Found Thu 22 Oct, 9:30 am, with pickup from home.'}],
  [{card:`<p class="kk" style="color:var(--accent-ink)">Needs your approval</p><div class="rows"><div><span>Service</span><span>General service</span></div><div><span>When</span><span>Thu 22 Oct, 9:30 am</span></div><div><span>Pickup</span><span>From home</span></div></div><div class="acts"><span class="fake dark">Approve booking</span><span class="fake">Not now</span></div>`,cls:'approval'}],
  [{card:`<p class="kk" style="color:var(--ok-ink)">Confirmed</p><p class="v">Car service booked</p><div class="rows"><div><span>Confirmation</span><span>SVC-48213</span></div><div><span>Reminder</span><span>Wed 21 Oct, 7:00 pm</span></div></div><span class="ok-badge">${ICON_OK}Confirmed by the service centre</span>`}]
];
const msgHTML=m=>m.me?`<div class="wmsg me">${m.me}</div>`:m.gg?`<div class="wmsg gg">${m.gg}</div>`:`<div class="wmsg card ${m.cls||''}">${m.card}</div>`;
const box=$('#wa-msgs');
if(box){let k=-1,t=null,run=false;
  const step=()=>{clearTimeout(t);if(!run||document.hidden)return;k=(k+1)%STORY.length;if(k===0)box.innerHTML='';const prev=$$('.wmsg',box).length;box.insertAdjacentHTML('beforeend',STORY[k].map(msgHTML).join(''));$$('.wmsg',box).slice(prev).forEach(m=>requestAnimationFrame(()=>requestAnimationFrame(()=>m.classList.add('in'))));while($$('.wmsg',box).length>4)box.firstElementChild.remove();t=setTimeout(step,k===STORY.length-1?4200:2300)};
  if(reduced.matches){box.innerHTML=STORY.flat().map(msgHTML).join('');$$('.wmsg',box).forEach(m=>m.classList.add('in'))}
  else{new IntersectionObserver(es=>{run=es[0].isIntersecting;if(run&&!t)t=setTimeout(step,500);if(!run){clearTimeout(t);t=null}},{threshold:.3}).observe(box);
    document.addEventListener('visibilitychange',()=>{if(!document.hidden&&run)t=setTimeout(step,400)})}
}
})();

/* v6.2: the hero moment rail advances by itself on phones; a touch pauses it for a while */
(function(){
  const {$,$$,reduced}=window.AG;const rail=$('.moments-mobile');if(!rail||reduced.matches)return;
  let i=0,t=0,pauseUntil=0,visible=false;
  const cards=()=>$$('.moment',rail);
  function step(){if(!visible||Date.now()<pauseUntil||getComputedStyle(rail).display==='none')return;
    const c=cards();if(c.length<2)return;i=(i+1)%c.length;const target=c[i];
    rail.scrollTo({left:target.offsetLeft-(rail.clientWidth-target.offsetWidth)/2,behavior:'smooth'})}
  function start(){clearInterval(t);t=setInterval(step,3200)}
  ['pointerdown','touchstart','wheel'].forEach(ev=>rail.addEventListener(ev,()=>{pauseUntil=Date.now()+8000},{passive:true}));
  rail.addEventListener('scroll',()=>{if(Date.now()<pauseUntil){const c=cards();let best=0,bd=1e9;c.forEach((el,k)=>{const d=Math.abs(el.offsetLeft-rail.scrollLeft-(rail.clientWidth-el.offsetWidth)/2);if(d<bd){bd=d;best=k}});i=best}},{passive:true});
  new IntersectionObserver(es=>{visible=es[0].isIntersecting},{threshold:.4}).observe(rail);
  start();
})();
