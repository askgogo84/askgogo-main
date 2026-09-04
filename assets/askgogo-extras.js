(()=>{
  try{ if(typeof lines!=='undefined' && lines.length===7) lines.splice(6,0,'Breathe with Gogo'); }catch(e){}
  const menuToggle=document.getElementById('menuToggle');
  const menuPanel=document.getElementById('menuPanel');
  const menuBackdrop=document.getElementById('menuBackdrop');
  const menuClose=document.getElementById('menuClose');
  let menuOpen=false;
  function setMenu(open){
    menuOpen=open;
    menuToggle?.classList.toggle('open',open);
    menuToggle?.setAttribute('aria-expanded',String(open));
    menuPanel?.classList.toggle('open',open);
    menuPanel?.setAttribute('aria-hidden',String(!open));
    menuBackdrop?.classList.toggle('open',open);
  }
  menuToggle?.addEventListener('click',e=>{e.stopPropagation();setMenu(!menuOpen)});
  menuClose?.addEventListener('click',()=>setMenu(false));
  menuBackdrop?.addEventListener('click',()=>setMenu(false));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menuOpen){e.preventDefault();setMenu(false)}},{capture:true});
  window.addEventListener('wheel',e=>{if(menuOpen){e.preventDefault();e.stopImmediatePropagation()}},{passive:false,capture:true});
  document.addEventListener('touchmove',e=>{if(menuOpen){e.preventDefault();e.stopImmediatePropagation()}},{passive:false,capture:true});
  let ctx=null,master=null,soundOn=false,sources=[];
  function startAmbient(){
    if(soundOn)return;
    const AC=window.AudioContext||window.webkitAudioContext;
    if(!AC)return;
    ctx=ctx||new AC();
    if(ctx.state==='suspended')ctx.resume();
    master=ctx.createGain();master.gain.setValueAtTime(0.0001,ctx.currentTime);master.gain.exponentialRampToValueAtTime(0.032,ctx.currentTime+.9);master.connect(ctx.destination);
    const filter=ctx.createBiquadFilter();filter.type='lowpass';filter.frequency.value=760;filter.Q.value=.5;filter.connect(master);
    [174,261.63,349.23].forEach((freq,i)=>{const o=ctx.createOscillator(),g=ctx.createGain();o.type=i===1?'sine':'triangle';o.frequency.value=freq;g.gain.value=i===0?.42:i===1?.22:.08;o.connect(g);g.connect(filter);o.start();sources.push(o)});
    const lfo=ctx.createOscillator(),lg=ctx.createGain();lfo.frequency.value=.075;lg.gain.value=.006;lfo.connect(lg);lg.connect(master.gain);lfo.start();sources.push(lfo);
    soundOn=true;updateSoundUI();
  }
  function stopAmbient(){
    if(!soundOn)return;
    try{master.gain.cancelScheduledValues(ctx.currentTime);master.gain.setValueAtTime(Math.max(master.gain.value,.0001),ctx.currentTime);master.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+.55)}catch(e){}
    const old=[...sources];sources=[];setTimeout(()=>old.forEach(s=>{try{s.stop()}catch(e){}}),650);soundOn=false;updateSoundUI();
  }
  function toggleSound(){soundOn?stopAmbient():startAmbient()}
  function updateSoundUI(){const top=document.getElementById('soundToggle'),bs=document.getElementById('breatheSound');top?.classList.toggle('on',soundOn);top?.setAttribute('aria-pressed',String(soundOn));if(bs)bs.textContent='Sound: '+(soundOn?'on':'off')}
  document.getElementById('soundToggle')?.addEventListener('click',e=>{e.stopPropagation();toggleSound()});
  document.getElementById('breatheSound')?.addEventListener('click',e=>{e.stopPropagation();toggleSound()});
  const scene=document.getElementById('s6'),start=document.getElementById('breatheStart'),phaseEl=document.getElementById('breathPhase'),countEl=document.getElementById('breathCount'),guide=document.getElementById('breathGuide'),progress=document.getElementById('breathProgress');
  const phases=[['inhale','Breathe in','Inhale slowly through your nose.'],['hold','Hold','Let the breath become still.'],['exhale','Breathe out','Exhale gently. Let your shoulders drop.'],['hold2','Hold','Stay empty for a quiet moment.']];
  let breathing=false,timer=null,elapsed=0,total=64;
  function renderBreath(){const segment=Math.floor(elapsed/4)%4,within=elapsed%4,left=4-within;scene.classList.remove('inhale','hold','exhale','hold2');scene.classList.add(phases[segment][0]);phaseEl.textContent=phases[segment][1];countEl.textContent=left+' sec';guide.textContent=phases[segment][2];progress.style.width=Math.min(100,(elapsed/total)*100)+'%'}
  function stopBreath(done=false){breathing=false;clearInterval(timer);timer=null;scene.classList.remove('inhale','hold','exhale','hold2');start.textContent=done?'Again':'Start breathing';if(done){phaseEl.textContent='Calm';countEl.textContent='64 sec';guide.textContent='That’s enough. Carry a little less into the next moment.';progress.style.width='100%'}}
  function startBreath(){if(breathing){stopBreath(false);return}elapsed=0;breathing=true;start.textContent='Pause';renderBreath();timer=setInterval(()=>{elapsed++;if(elapsed>=total){stopBreath(true);return}renderBreath()},1000)}
  start?.addEventListener('click',e=>{e.stopPropagation();startBreath()});
  if(scene){new MutationObserver(()=>{if(!scene.classList.contains('on')&&breathing)stopBreath(false)}).observe(scene,{attributes:true,attributeFilter:['class']})}
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&soundOn)stopAmbient()});
})();