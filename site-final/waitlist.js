(() => {
  const API = 'https://app.askgogo.in/api/waitlist';
  const WA_RE = /(?:api\.whatsapp\.com|wa\.me|whatsapp:\/\/)/i;
  let opener = null;
  let source = 'site';

  function el(tag, attrs = {}, text = '') {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === 'class') node.className = v;
      else if (k === 'html') node.innerHTML = v;
      else node.setAttribute(k, v);
    }
    if (text) node.textContent = text;
    return node;
  }

  function ensureBand() {
    if (document.getElementById('gogo-copy-band')) return;
    const hero = document.getElementById('top');
    if (!hero) return;
    const band = el('section', { id: 'gogo-copy-band', class: 'gogo-copy-band' });
    band.innerHTML = `
      <div class="gogo-copy-band__inner">
        <p class="gogo-copy-band__lead"><strong>AskGogo is a personal assistant that understands what is on your plate and what matters to you. It connects to what you already use: WhatsApp, your calendar and your documents.</strong></p>
        <p>There is nothing new to learn and nothing to install. It lives in WhatsApp, and you talk to it the way you would text a friend.</p>
        <p>It is built for the small, personal details that fill a day: reminding you before a bill is due, briefing you every morning, keeping your tickets and receipts where you can find them, tracking what you spend, and making sure the things you meant to do actually get done.</p>
        <button type="button" class="gogo-band-cta" data-gogo-waitlist data-cta="copy-band">Join Gogo</button>
      </div>`;
    hero.insertAdjacentElement('afterend', band);
  }

  function buildSheet() {
    if (document.getElementById('gogo-waitlist-root')) return;
    const root = el('div', { id: 'gogo-waitlist-root', class: 'gogo-waitlist', 'aria-hidden': 'true' });
    root.innerHTML = `
      <div class="gogo-waitlist__backdrop" data-close></div>
      <section class="gogo-waitlist__sheet" role="dialog" aria-modal="true" aria-labelledby="gogo-waitlist-title">
        <button type="button" class="gogo-waitlist__close" aria-label="Close waitlist" data-close>×</button>
        <div class="gogo-waitlist__eyebrow">Join Gogo</div>
        <h2 id="gogo-waitlist-title">Be among the first.</h2>
        <p class="gogo-waitlist__intro">Leave your WhatsApp number and email. We will let you know when your access is ready.</p>
        <form id="gogo-waitlist-form" novalidate>
          <label>Email
            <input id="gogo-email" name="email" type="email" autocomplete="email" maxlength="254" required placeholder="you@example.com">
            <span class="gogo-error" data-error="email"></span>
          </label>
          <label>WhatsApp number</label>
          <div class="gogo-phone-row">
            <select id="gogo-country" name="country" aria-label="Country code">
              <option value="IN">+91 India</option>
              <option value="AE">+971 UAE</option>
            </select>
            <input id="gogo-phone" name="phone" type="tel" inputmode="numeric" autocomplete="tel" required placeholder="9876543210">
          </div>
          <span class="gogo-error" data-error="phone"></span>
          <label class="gogo-optin"><input id="gogo-optin" name="whatsapp_opt_in" type="checkbox"> <span>Send me access updates on WhatsApp.</span></label>
          <input class="gogo-hp" type="text" name="company" tabindex="-1" autocomplete="off" aria-hidden="true">
          <button class="gogo-submit" type="submit">Join Gogo</button>
          <p class="gogo-form-note">No spam. No WhatsApp messages unless you opt in.</p>
          <div class="gogo-status" role="status" aria-live="polite"></div>
        </form>
        <div class="gogo-success" hidden>
          <div class="gogo-success__mark">✓</div>
          <h3>You're on the list.</h3>
          <p>We will reach out when your AskGogo access is ready.</p>
          <button type="button" class="gogo-submit" data-close>Done</button>
        </div>
        <a class="gogo-existing" href="https://app.askgogo.in/dashboard/home">Already have access? Open dashboard</a>
      </section>`;
    document.body.appendChild(root);

    const form = root.querySelector('#gogo-waitlist-form');
    const status = root.querySelector('.gogo-status');
    const success = root.querySelector('.gogo-success');
    const country = root.querySelector('#gogo-country');
    const phone = root.querySelector('#gogo-phone');

    country.addEventListener('change', () => {
      phone.placeholder = country.value === 'AE' ? '501234567' : '9876543210';
      phone.value = phone.value.replace(/\D/g, '').slice(0, country.value === 'AE' ? 9 : 10);
    });
    phone.addEventListener('input', () => {
      phone.value = phone.value.replace(/\D/g, '').slice(0, country.value === 'AE' ? 9 : 10);
    });

    root.addEventListener('click', e => {
      if (e.target.closest('[data-close]')) closeSheet();
    });

    // Shield the form's own submit control from any page-level click handlers
    // installed by the assembled Claude Design runtime. Stop propagation only;
    // do NOT prevent default, so the browser still fires the form submit event.
    form.addEventListener('click', e => {
      const submitButton = e.target.closest('button[type="submit"]');
      if (submitButton) e.stopPropagation();
    }, true);

    form.addEventListener('submit', async e => {
      e.preventDefault();
      root.querySelectorAll('.gogo-error').forEach(x => x.textContent = '');
      status.textContent = '';
      const submit = form.querySelector('.gogo-submit');
      submit.disabled = true;
      submit.textContent = 'Joining…';
      const body = {
        country: country.value,
        phone: phone.value.trim(),
        email: root.querySelector('#gogo-email').value.trim(),
        whatsapp_opt_in: root.querySelector('#gogo-optin').checked,
        source,
        company: form.elements.company.value || ''
      };
      try {
        const res = await fetch(API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          const errors = data.errors || {};
          if (errors.phone) root.querySelector('[data-error="phone"]').textContent = errors.phone;
          if (errors.email) root.querySelector('[data-error="email"]').textContent = errors.email;
          if (!errors.phone && !errors.email) status.textContent = 'Please check your details and try again.';
          return;
        }
        form.hidden = true;
        success.hidden = false;
        success.querySelector('button').focus();
      } catch {
        status.textContent = 'We could not join the waitlist just now. Please try again.';
      } finally {
        submit.disabled = false;
        submit.textContent = 'Join Gogo';
      }
    });
  }

  function openSheet(trigger) {
    buildSheet();
    const root = document.getElementById('gogo-waitlist-root');
    opener = trigger || document.activeElement;
    source = (trigger && trigger.getAttribute('data-cta')) || 'site';
    root.classList.add('is-open');
    root.setAttribute('aria-hidden', 'false');
    document.documentElement.classList.add('gogo-sheet-open');
    const first = root.querySelector('#gogo-email');
    setTimeout(() => first && first.focus(), 30);
  }

  function closeSheet() {
    const root = document.getElementById('gogo-waitlist-root');
    if (!root) return;
    root.classList.remove('is-open');
    root.setAttribute('aria-hidden', 'true');
    document.documentElement.classList.remove('gogo-sheet-open');
    if (opener && opener.focus) opener.focus();
  }

  function isJoinTrigger(a) {
    if (!a) return false;
    // Never intercept the waitlist form's own submit button. The old label-based
    // fallback matched its text "Join Gogo", called preventDefault(), reopened
    // the already-open sheet, and therefore prevented the form submit event from
    // ever firing. Only explicit waitlist triggers or anchor navigation belong
    // to this global click interceptor.
    if (a.matches('button[type="submit"]')) return false;
    const href = a.getAttribute('href') || '';
    const label = (a.textContent || '').trim();
    return a.hasAttribute('data-gogo-waitlist') ||
      href === '#join-gogo' ||
      WA_RE.test(href) ||
      (a.tagName === 'A' && /^(join gogo|meet gogo|talk to gogo)$/i.test(label));
  }

  document.addEventListener('click', e => {
    const a = e.target.closest('a,button');
    if (!isJoinTrigger(a)) return;
    e.preventDefault();
    openSheet(a);
  });

  document.addEventListener('keydown', e => {
    const root = document.getElementById('gogo-waitlist-root');
    if (!root || !root.classList.contains('is-open')) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      closeSheet();
      return;
    }
    if (e.key !== 'Tab') return;
    const focusables = [...root.querySelectorAll('button:not([disabled]),a[href],input:not([type="hidden"]):not([tabindex="-1"]),select')].filter(x => !x.hidden && x.offsetParent !== null);
    if (!focusables.length) return;
    const first = focusables[0], last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  function boot() {
    ensureBand();
    buildSheet();
    document.querySelectorAll('a').forEach(a => {
      const href = a.getAttribute('href') || '';
      if (WA_RE.test(href)) {
        a.setAttribute('href', '#join-gogo');
        a.removeAttribute('target');
        a.removeAttribute('rel');
        if (!a.getAttribute('data-cta')) a.setAttribute('data-cta', 'legacy-whatsapp');
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(boot, 0));
  else setTimeout(boot, 0);
})();