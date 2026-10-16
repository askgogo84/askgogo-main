/* Gogo character renderer for the marketing site.
   Geometry, palette and states are ported 1:1 from the app's canonical component
   (gogo-memory-os: components/gogo/gogo-character.tsx). Do not redraw by hand. */
(function(){
  const EYES={calm:'closed',listening:'open',thinking:'up',remembering:'closed',acting:'open',watching:'half',
    found:'happy',approval:'open',secure:'closed',done:'happy',breathing:'closed',sleeping:'flat'};
  const ANIM={calm:'gogoBreath 5s ease-in-out infinite',listening:'gogoLean 4.5s ease-in-out infinite',
    thinking:'gogoBreath 4s ease-in-out infinite',remembering:'gogoBreath 4s ease-in-out infinite',
    acting:'gogoBob 1.1s ease-in-out infinite',watching:'none',found:'gogoBob 2.2s ease-in-out infinite',
    approval:'gogoBreath 4s ease-in-out infinite',secure:'gogoBreath 5s ease-in-out infinite',
    done:'gogoBreath 5s ease-in-out infinite',breathing:'gogoBreathDeep 8s ease-in-out infinite',
    sleeping:'gogoSway 7s ease-in-out infinite'};
  let uid=0;
  function svg(state,o){
    o=o||{};state=EYES[state]?state:'calm';
    const id='g'+(++uid),eyes=EYES[state],dark=!!o.dark;
    const bodyStroke=dark?'rgba(255,255,255,.14)':'rgba(70,45,30,.10)';
    const hairStroke=dark?'rgba(255,251,243,.32)':'none';
    const ring=dark?'#17171A':'#FFFFFF';
    const A=(a)=>`style="transform-box:fill-box;transform-origin:center;animation:${a}"`;
    let s=`<svg class="gogo-svg" viewBox="0 0 120 120" width="100%" height="100%" style="overflow:visible;display:block" aria-hidden="true" focusable="false">
<defs><radialGradient id="${id}b" cx="40%" cy="30%" r="80%"><stop offset="0" stop-color="#FFFBF3"/><stop offset=".6" stop-color="#F3E7D3"/><stop offset="1" stop-color="#E4D3B9"/></radialGradient>
<radialGradient id="${id}c" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#FFB06A" stop-opacity=".6"/><stop offset=".55" stop-color="#EF7A27" stop-opacity=".26"/><stop offset="1" stop-color="#EF7A27" stop-opacity="0"/></radialGradient>
<radialGradient id="${id}h" cx="40%" cy="35%" r="75%"><stop offset="0" stop-color="#4A2E20"/><stop offset="1" stop-color="#2C1A13"/></radialGradient></defs>`;
    if(state==='thinking')s+=`<g ${A('gogoOrbit 6s linear infinite')}><circle cx="60" cy="16" r="3.2" fill="#EF7A27"/><circle cx="104" cy="60" r="2.4" fill="#EF7A27" fill-opacity=".7"/><circle cx="18" cy="72" r="1.8" fill="#EF7A27" fill-opacity=".5"/></g>`;
    s+=`<g class="gogo-body" style="transform-box:fill-box;transform-origin:center 90%;animation:${ANIM[state]};${state==='sleeping'?'opacity:.82':''}">
<g fill="url(#${id}h)" stroke="${hairStroke}" stroke-width="1.6"><circle cx="24" cy="52" r="9"/><circle cx="28" cy="40" r="10.5"/><circle cx="38" cy="30" r="11"/><circle cx="51" cy="23" r="11.5"/><circle cx="66" cy="22" r="12"/><circle cx="81" cy="28" r="11"/><circle cx="92" cy="39" r="10.5"/><circle cx="96" cy="52" r="9"/><circle cx="60" cy="32" r="13"/><circle cx="44" cy="40" r="10"/><circle cx="78" cy="38" r="10"/></g>
<path d="M60 34 C84 34 100 52 101 76 C102 100 84 113 60 113 C36 113 18 100 19 76 C20 52 36 34 60 34Z" fill="url(#${id}b)" stroke="${bodyStroke}" stroke-width="1.5"/>
<circle cx="60" cy="92" r="23" fill="url(#${id}c)" style="animation:gogoGlow ${state==='remembering'||state==='found'?'1.6s':state==='sleeping'?'9s':'4s'} ease-in-out infinite"/>
<circle cx="42" cy="72" r="4.5" fill="#EF7A27" fill-opacity=".18"/><circle cx="78" cy="72" r="4.5" fill="#EF7A27" fill-opacity=".18"/>
<g class="gogo-eyes">`;
    if(eyes==='closed')s+=`<path d="M43 63 q5 4 10 0 M67 63 q5 4 10 0" fill="none" stroke="#2C1A13" stroke-width="2.6" stroke-linecap="round"/>`;
    if(eyes==='open'||eyes==='up'){const y=eyes==='up'?60:64,r=state==='listening'?3.8:3.3;
      s+=`<g class="gogo-pupils"><circle cx="48" cy="${y}" r="${r}" fill="#2C1A13"/><circle cx="72" cy="${y}" r="${r}" fill="#2C1A13"/><circle cx="49.2" cy="${y-1.2}" r="1" fill="#FFFBF3"/><circle cx="73.2" cy="${y-1.2}" r="1" fill="#FFFBF3"/></g>`;}
    if(eyes==='happy')s+=`<path d="M43 65 q5 -5 10 0 M67 65 q5 -5 10 0" fill="none" stroke="#2C1A13" stroke-width="2.6" stroke-linecap="round"/><path d="M55 74 q5 3 10 0" fill="none" stroke="#2C1A13" stroke-width="2" stroke-linecap="round" stroke-opacity=".7"/>`;
    if(eyes==='flat')s+=`<path d="M44 64 h8 M68 64 h8" fill="none" stroke="#2C1A13" stroke-width="2.6" stroke-linecap="round"/>`;
    if(eyes==='half')s+=`<circle cx="48" cy="64" r="3.2" fill="#2C1A13"/><circle cx="72" cy="64" r="3.2" fill="#2C1A13"/><path d="M43 61 h10 M67 61 h10" stroke="#F3E7D3" stroke-width="3.2" stroke-linecap="round"/>`;
    s+=`</g>`;
    if(state==='breathing'||(state==='calm'&&o.hands))s+=`<ellipse cx="30" cy="98" rx="7" ry="5" fill="#F3E7D3" stroke="#E4D3B9"/><ellipse cx="90" cy="98" rx="7" ry="5" fill="#F3E7D3" stroke="#E4D3B9"/>`;
    if(state==='acting')s+=`<ellipse cx="96" cy="72" rx="6" ry="7.5" fill="#F3E7D3" stroke="#E4D3B9" style="transform-box:fill-box;transform-origin:bottom center;animation:gogoWave 1.2s ease-in-out infinite"/>`;
    if(state==='approval')s+=`<g ${A('gogoBob 3s ease-in-out infinite')}><rect x="38" y="86" width="44" height="28" rx="6" fill="#fff" stroke="#E4D3B9" stroke-width="1.2"/><rect x="44" y="93" width="22" height="3" rx="1.5" fill="#2C1A13" fill-opacity=".75"/><rect x="44" y="100" width="14" height="3" rx="1.5" fill="#2C1A13" fill-opacity=".35"/><circle cx="73" cy="100" r="5" fill="#EF7A27"/><path d="M70.5 100 l2 2 l3.5 -4" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></g>`;
    s+=`</g>`;
    if(state==='remembering')s+=`<g ${A('gogoMemory 3.2s cubic-bezier(.4,0,.2,1) infinite')}><rect x="48" y="72" width="24" height="14" rx="4" fill="#fff" stroke="#EF7A27" stroke-width="1.2"/><rect x="52" y="77" width="12" height="2.2" rx="1" fill="#EF7A27"/><rect x="52" y="81" width="8" height="2.2" rx="1" fill="#2C1A13" fill-opacity=".3"/></g>`;
    if(state==='found')s+=`<g ${A('gogoSpark 3s ease-in-out infinite')}><path d="M98 18 l2.5 6 l6 2.5 l-6 2.5 l-2.5 6 l-2.5 -6 l-6 -2.5 l6 -2.5Z" fill="#EF7A27"/></g>`;
    if(state==='done')s+=`<circle cx="98" cy="96" r="11" fill="#2FAE6A" stroke="${ring}" stroke-width="3"/><path d="M92.5 96 l4 4 l7.5 -8" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`;
    return s+`</svg>`;
  }
  /* Mount: <span data-gogo="listening" data-size="120" data-hands></span> */
  function mount(el,state){
    el.dataset.gogo=state||el.dataset.gogo||'calm';
    const dark=document.documentElement.classList.contains('mode-dark');
    el.innerHTML=svg(el.dataset.gogo,{dark,hands:el.hasAttribute('data-hands')});
    const sz=el.dataset.size;if(sz){el.style.width=sz+'px';el.style.height=sz+'px'}
  }
  function mountAll(root){(root||document).querySelectorAll('[data-gogo]').forEach(el=>mount(el))}
  window.Gogo={svg,mount,mountAll};
})();
