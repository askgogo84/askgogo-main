/* Inner pages: SecondBrain beats. Everything else on these pages is CSS plus the shared chrome in site.js. */
(()=>{
const {$,$$,reduced,onceVisible}=AG;
function beatSeq(beats,replay){
  const els=$$('[data-beat]',beats);let k=-1,t=null,active=false,offscreen=false;
  const paused=()=>offscreen||document.hidden;
  const show=n=>els.forEach((b,i)=>b.classList.toggle('on',i===n));
  function step(){clearTimeout(t);if(!active||paused())return;k++;
    if(k>=els.length){active=false;beats.classList.remove('playing');show(-1);return}
    show(k);t=setTimeout(step,1600)}
  function play(){clearTimeout(t);if(reduced.matches){beats.classList.remove('playing');show(-1);return}active=true;k=-1;beats.classList.add('playing');t=setTimeout(step,300)}
  new IntersectionObserver(es=>{offscreen=!es[0].isIntersecting;if(offscreen)clearTimeout(t);else if(active)t=setTimeout(step,400)},{threshold:.2}).observe(beats);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)clearTimeout(t);else if(active)t=setTimeout(step,400)});
  onceVisible(beats,play,.4);if(replay)replay.onclick=play;
}
const sb=$('#sb-beats');if(sb)beatSeq(sb,$('#sb-replay'));
})();
