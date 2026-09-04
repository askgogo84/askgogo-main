
const scenes=[...document.querySelectorAll('.scene')];
const labels=['Inside your head','The fog clears','What Gogo does','Voice · meetings','One Gogo everywhere','Simple pricing','Breathe with Gogo','Your mind, lighter'];
const words=['CLEAR','REMEMBER','SPEAK','EVERYWHERE','CHOOSE','BREATHE','CALM','BEGIN AGAIN'];
const progress=document.getElementById('progress');scenes.forEach((_,i)=>{let d=document.createElement('i');if(!i)d.className='on';progress.appendChild(d)});const dots=[...progress.children];
let current=0,busy=false,wl=0,sy=0,sx=0;
function sync(){dots.forEach((d,i)=>d.classList.toggle('on',i===current));document.getElementById('navLabel').textContent=labels[current]}
function go(to,dir){
  if(busy)return;
  if(dir>0 && current===scenes.length-1) to=0;
  if(dir<0 && current===0) to=scenes.length-1;
  if(to<0||to>=scenes.length||to===current)return;
  busy=true;
  const tr=document.getElementById('transition'),tw=document.getElementById('transitionWord');
  tw.textContent=(dir>0 && current===scenes.length-1)?'BEGIN AGAIN':(dir>0?(words[current]||'CLEAR'):(words[Math.max(0,to)]||'BACK'));
  tr.classList.remove('show');void tr.offsetWidth;tr.classList.add('show');
  setTimeout(()=>{scenes[current].classList.remove('active');scenes[to].classList.add('active');current=to;sync()},470);
  setTimeout(()=>{tr.classList.remove('show');busy=false},1180);
}
addEventListener('wheel',e=>{let n=Date.now();if(n-wl<850||Math.abs(e.deltaY)<8)return;e.preventDefault();wl=n;e.deltaY>0?go(current+1,1):go(current-1,-1)},{passive:false});
addEventListener('touchstart',e=>{sy=e.touches[0].clientY;sx=e.touches[0].clientX},{passive:true});
addEventListener('touchend',e=>{let dy=e.changedTouches[0].clientY-sy,dx=e.changedTouches[0].clientX-sx;if(Math.abs(dy)>48&&Math.abs(dy)>Math.abs(dx)*1.15)dy<0?go(current+1,1):go(current-1,-1)},{passive:true});
document.addEventListener('keydown',e=>{if(['ArrowDown','ArrowRight','PageDown',' '].includes(e.key))go(current+1,1);if(['ArrowUp','ArrowLeft','PageUp'].includes(e.key))go(current-1,-1)});

/* menu */
const panel=document.getElementById('menuPanel'),back=document.getElementById('menuBackdrop');
document.getElementById('menuBtn').onclick=()=>{panel.classList.add('open');back.classList.add('open')};document.getElementById('menuClose').onclick=()=>{panel.classList.remove('open');back.classList.remove('open')};back.onclick=()=>document.getElementById('menuClose').click();

/* subtle parallax only — never clips page */
const thoughts=[...document.querySelectorAll('.thought')],fog=document.getElementById('fogBg');
addEventListener('mousemove',e=>{
  if(current!==0)return;
  let x=e.clientX/innerWidth-.5,y=e.clientY/innerHeight-.5;
  fog.style.transform=`translate(${x*10}px,${y*8}px) scale(1.04)`;
  thoughts.forEach((t,i)=>{if(t.dataset.done)return;let f=.35+(i%4)*.12;t.style.transform=`translate(${x*18*f}px,${y*14*f}px)`})
});
const thoughtPool=[
  ['💳','Pay credit card bill','Task created'],['🧾','Find electricity receipt','Saved to Memory'],
  ['🎂','Birthday next week','Reminder created'],['🛒','Add coffee to grocery list','List updated'],
  ['📞','Call Mathew Friday','Reminder created'],['📎','Where is that proposal?','Saved to Memory'],
  ['🚗','Insurance renewal','Reminder created'],['✉️','Reply to investor email','Task created'],
  ['🏨','Hotel booking Dubai','Travel saved'],['💊','Buy medicine tonight','Reminder created']
];
let thoughtSeq=0,capturedCount=0;

function bindThought(t){
  const capture=(ev)=>{
    if(ev){ev.preventDefault();ev.stopPropagation();}
    if(t.dataset.done==='1')return;
    t.dataset.done='1';

    const r=t.getBoundingClientRect();
    const sink=document.getElementById('homeGogoSink').getBoundingClientRect();

    /* Animate a visual clone independently of mouse parallax. */
    const clone=document.createElement('div');
    clone.className='thought-capture-clone';
    clone.textContent='✓ '+t.dataset.action;
    clone.style.left=r.left+'px';
    clone.style.top=r.top+'px';
    clone.style.width=r.width+'px';
    clone.style.height=r.height+'px';
    clone.style.display='flex';
    clone.style.alignItems='center';
    clone.style.justifyContent='center';
    document.body.appendChild(clone);

    /* Hide original immediately so there can be no stuck thought. */
    t.style.visibility='hidden';
    t.style.pointerEvents='none';

    const dx=(sink.left+sink.width/2)-(r.left+r.width/2);
    const dy=(sink.top+sink.height*.42)-(r.top+r.height/2);

    clone.animate([
      {transform:'translate(0,0) scale(1)',opacity:1,filter:'blur(0px)'},
      {transform:`translate(${dx*.55}px,${dy*.55}px) scale(.68)`,opacity:1,offset:.42},
      {transform:`translate(${dx}px,${dy}px) scale(.04) rotate(24deg)`,opacity:0,filter:'blur(5px)'}
    ],{
      duration:1050,
      easing:'cubic-bezier(.16,.84,.23,1)',
      fill:'forwards'
    }).onfinish=()=>{
      clone.remove();

      const d=thoughtPool[thoughtSeq++%thoughtPool.length];
      t.dataset.action=d[2];
      t.innerHTML=d[0]+' '+d[1];
      t.style.transform='';
      t.style.background='rgba(255,255,255,.70)';
      t.style.color='#68615b';
      t.style.opacity='0';
      t.style.filter='';
      t.style.visibility='visible';

      const pop=t.animate([
        {opacity:0,transform:'scale(.55) translateY(10px)'},
        {opacity:1,transform:'scale(1.08) translateY(-3px)',offset:.72},
        {opacity:1,transform:'scale(1) translateY(0)'}
      ],{duration:600,easing:'cubic-bezier(.2,.8,.2,1)',fill:'forwards'});

      pop.onfinish=()=>{
        pop.cancel();
        t.style.opacity='1';
        t.style.pointerEvents='auto';
        t.dataset.done='';
      };

      capturedCount++;
      const hc=document.getElementById('hookCounter');
      if(hc)hc.innerHTML=`Gogo has cleared <b>${capturedCount}</b> little thing${capturedCount===1?'':'s'}. Another thought just appeared.`;
    };
  };

  t.addEventListener('click',capture);
  t.addEventListener('touchend',capture,{passive:false});
}
thoughts.forEach(bindThought);

/* languages */
const langs=[...document.querySelectorAll('.lang')],langMap={en:'your second brain',hi:'आपका दूसरा दिमाग',ar:'عقلك الثاني',kn:'ನಿಮ್ಮ ಎರಡನೇ ಮೆದುಳು',es:'tu segundo cerebro',pt:'seu segundo cérebro',fr:'votre second cerveau',id:'otak kedua Anda'};let li=0;
function setLang(c){langs.forEach(x=>x.classList.toggle('on',x.dataset.l===c));document.getElementById('coreLang').textContent=langMap[c]}
langs.forEach((x,i)=>x.onclick=()=>{li=i;setLang(x.dataset.l)});setInterval(()=>{if(current===1){li=(li+1)%langs.length;setLang(langs[li].dataset.l)}},2300);

/* feature hub */
const D={
remember:['Remember without carrying.','Tell Gogo something once. It becomes searchable memory across WhatsApp and your dashboard.','<div class="bubble user">Remember my passport expires in October 2033.</div><div class="bubble bot"><span style="color:var(--orange);font-weight:700">Saved ✓</span><br>I’ll keep that with your important documents.</div><div class="grid"><div class="mini"><b>Passport</b><small>Expiry · October 2033</small></div><div class="mini"><b>Memory</b><small>Available everywhere</small></div></div>'],
remind:['Your future self gets the message.','One sentence becomes a reminder — simple, recurring or follow-up.','<div class="bubble user">Remind me tomorrow at 10 AM to call Mom.</div><div class="bubble bot"><span style="color:var(--orange);font-weight:700">Reminder set ✓</span><br>Tomorrow · 10:00 AM</div>'],
find:['Find it without remembering where.','Ask for the person, brand or phrase you remember. Gogo brings back the most likely match.','<div class="search">⌕ &nbsp; Show me what I saved about Jopasu</div><div class="grid"><div class="mini"><b>Jopasu Dashboard</b><small>Saved 2 Sept</small></div><div class="mini"><b>Sales estimate</b><small>Saved 2 Sept</small></div><div class="mini"><b>Car care product</b><small>Saved 1 Sept</small></div><div class="mini"><b>Order estimate</b><small>Saved 1 Sept</small></div></div>'],
today:['One calm view of what matters now.','Today pulls reminders, calendar, lists and recent memory into one command centre.','<div class="grid"><div class="mini"><b style="color:var(--orange)">1 Reminder</b><small>Drink water · 6 PM</small></div><div class="mini"><b>Calendar</b><small>Clear today</small></div><div class="mini"><b>23 Memories</b><small>Ready to retrieve</small></div><div class="mini"><b>7 Lists</b><small>Open items</small></div></div>'],
calendar:['Your schedule, without the admin.','Create events naturally and see what’s next without opening another system.','<div class="bubble user">Add dinner Friday at 7 PM.</div><div class="bubble bot"><span style="color:var(--orange);font-weight:700">Calendar event created ✓</span><br>Friday · 7:00 PM</div>'],
scan:['Point. Send. Ask Gogo.','Images, screenshots, receipts and documents become searchable information.','<div class="search">📸 &nbsp; Scan received</div><div class="grid"><div class="mini"><b>Document understood</b><small>Key details extracted</small></div><div class="mini"><b>Saved to Memory</b><small>Ready to find later</small></div></div>']
};
const tabs=[...document.querySelectorAll('.tab')];let fi=0,pause=0;
function feature(k){tabs.forEach(x=>x.classList.toggle('on',x.dataset.k===k));let d=D[k];document.getElementById('fTitle').textContent=d[0];document.getElementById('fDesc').textContent=d[1];document.getElementById('pbody').innerHTML=d[2]}
tabs.forEach((x,i)=>x.onclick=()=>{fi=i;pause=Date.now()+9000;feature(x.dataset.k)});feature('remember');
setInterval(()=>{if(current===2&&Date.now()>pause){fi=(fi+1)%tabs.length;feature(tabs[fi].dataset.k)}},3000);

/* pricing */
const plans={Free:{p:'₹0',dark:false,f:['Real AskGogo experience','Memory + reminders','Light voice + web search','Calendar basics','Lists + saved items']},Lite:{p:'₹99',dark:false,f:['Everything in Free','More reminders + memory','Voice notes + lists','Calendar basics','Light web search','Cross-device dashboard']},Pro:{p:'₹299',dark:true,f:['Everything in Lite','Calendar + Daily Brief','Documents + image memory','Voice + deeper web search','Meeting notes + actions','Travel + richer workflows']},Power:{p:'₹499',dark:false,f:['Everything in Pro','Highest usage allowances','Heavy document + voice use','Priority new capabilities','Advanced meeting workflows','Power-user support']}};
function plan(n){document.querySelectorAll('.priceSel button').forEach(b=>b.classList.toggle('on',b.dataset.plan===n));let p=plans[n],c=document.getElementById('priceCard');c.className='priceCard'+(p.dark?' dark':'');c.innerHTML=`<div style="font-size:8px;text-transform:uppercase;letter-spacing:.15em">${n}${n==='Pro'?' · most popular':''}</div><div class="amount">${p.p}</div><div style="font-size:8px;color:${p.dark?'#cfc3ba':'#756d66'}">${n==='Free'?'forever':'per month'}</div><ul>${p.f.map(x=>'<li>'+x+'</li>').join('')}</ul><a class="start" href="${n==='Free'?'https://api.whatsapp.com/send?phone=17605483659&text=Hi%20AskGogo':'https://app.askgogo.in/upgrade'}">${n==='Free'?'Start free':'Choose '+n} →</a>`}
document.querySelectorAll('.priceSel button').forEach(b=>b.onclick=()=>plan(b.dataset.plan));plan('Free');


/* pricing advisor */
document.querySelectorAll('.advisor-options button').forEach(btn=>btn.onclick=()=>{
  document.querySelectorAll('.advisor-options button').forEach(x=>x.classList.toggle('on',x===btn));
  const rec=btn.dataset.rec;
  plan(rec);
  document.getElementById('recoText').textContent='Recommended: '+rec;
});

/* breathing */
const bs=document.getElementById('s6'),bStart=document.getElementById('bStart'),bp=document.getElementById('bPhase'),bc=document.getElementById('bCount'),bg=document.getElementById('bProg'),bn=document.getElementById('bNote');let breathing=false,el=0,timer;const phases=[['inhale','Breathe in','Inhale slowly through your nose.'],['hold','Hold','Let the breath become still.'],['exhale','Breathe out','Exhale gently. Let your shoulders drop.'],['hold2','Hold','Stay empty for a quiet moment.']];
function renderBreath(){let i=Math.floor(el/4)%4,left=4-el%4;bs.classList.remove('inhale','hold','exhale','hold2');bs.classList.add(phases[i][0]);bp.textContent=phases[i][1];bc.textContent=left+' sec';bn.textContent=phases[i][2];bg.style.width=Math.min(100,el/64*100)+'%'}
function stopBreath(done=false){breathing=false;clearInterval(timer);bs.classList.remove('inhale','hold','exhale','hold2');bStart.textContent=done?'Again':'Start breathing';if(done){bp.textContent='Calm';bc.textContent='64 sec';bn.textContent='That’s enough. Carry a little less into the next moment.';bg.style.width='100%'}}
bStart.onclick=()=>{if(breathing){stopBreath();return}if(!soundOn)startFocusSound();breathing=true;el=0;bStart.textContent='Pause';renderBreath();timer=setInterval(()=>{el++;el>=64?stopBreath(true):renderBreath()},1000)};

/* Real background music track for the mock — steady calm work/focus music */
const focusMusic=document.getElementById('focusMusic');
let soundOn=false;
focusMusic.volume=.28;
async function startFocusSound(){
  try{
    await focusMusic.play();soundOn=true;
    document.getElementById('soundBtn').classList.add('on');
    document.getElementById('bSound').textContent='Sound: on';
  }catch(e){
    console.warn('Audio needs a user gesture or network access.',e);
  }
}
function stopFocusSound(){
  focusMusic.pause();soundOn=false;
  document.getElementById('soundBtn').classList.remove('on');
  document.getElementById('bSound').textContent='Sound: off';
}
function snd(){soundOn?stopFocusSound():startFocusSound()}
document.getElementById('soundBtn').onclick=snd;
document.getElementById('bSound').onclick=snd;

/* intro */
document.getElementById('introBtn').onclick=()=>{let x=document.getElementById('intro');x.classList.add('hide');setTimeout(()=>x.remove(),420)};
sync();
