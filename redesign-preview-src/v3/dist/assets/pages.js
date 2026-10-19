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

(function(){const {$,$$}=window.AG;
/* a day with Gogo: the stage is pinned; each spacer that scrolls under it switches the scene in and the last one out */
{const story=$('[data-day]');if(story){const scenes=$$('.ds',story),steps=$$('.dstep',story),dots=$$('.dprog i',story);let cur=-1;
 const go=i=>{if(i===cur)return;scenes.forEach((s,k)=>{s.classList.toggle('on',k===i);s.classList.toggle('out',k===cur&&k<i)});dots.forEach((d,k)=>d.classList.toggle('on',k<=i));cur=i};
 const io=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting)go(+e.target.dataset.i)})},{rootMargin:'-45% 0px -45% 0px',threshold:0});
 steps.forEach(s=>io.observe(s));go(0)}}
})();
