(() => {
  if (!window.matchMedia('(max-width: 759px)').matches) return;

  const boot = () => {
    const root = document.querySelector('[data-screen-label="AskGogo FINAL"]');
    if (!root || root.dataset.mobileStoryReady === '1') return false;

    const sections = Array.from(root.querySelectorAll(':scope > section'));
    if (!sections.length) return false;

    root.dataset.mobileStoryReady = '1';

    const nav = document.createElement('div');
    nav.className = 'gogo-mobile-story-nav';
    nav.setAttribute('aria-label', 'Mobile chapter navigation');
    nav.innerHTML = '<button type="button" aria-label="Previous chapter">←</button><span class="gogo-story-count">01 / ' + String(sections.length).padStart(2,'0') + '</span><button type="button" aria-label="Next chapter">→</button>';
    document.body.appendChild(nav);

    const prev = nav.children[0];
    const count = nav.children[1];
    const next = nav.children[2];
    let active = 0;

    const update = () => {
      const w = Math.max(root.clientWidth, 1);
      active = Math.max(0, Math.min(sections.length - 1, Math.round(root.scrollLeft / w)));
      count.textContent = String(active + 1).padStart(2,'0') + ' / ' + String(sections.length).padStart(2,'0');
      prev.style.opacity = active === 0 ? '.35' : '1';
      next.style.opacity = active === sections.length - 1 ? '.35' : '1';
    };

    const go = (index) => {
      active = Math.max(0, Math.min(sections.length - 1, index));
      sections[active].scrollIntoView({behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block:'nearest', inline:'start'});
      window.setTimeout(update, 320);
    };

    prev.addEventListener('click', () => go(active - 1));
    next.addEventListener('click', () => go(active + 1));
    root.addEventListener('scroll', () => window.requestAnimationFrame(update), {passive:true});
    window.addEventListener('resize', update, {passive:true});

    update();
    return true;
  };

  let attempts = 0;
  const timer = window.setInterval(() => {
    attempts += 1;
    if (boot() || attempts > 80) window.clearInterval(timer);
  }, 100);

  document.addEventListener('DOMContentLoaded', boot, {once:true});
})();
