/* Shared header and menu, inserted before first paint. */
document.currentScript.insertAdjacentHTML('afterend',`<header class="hdr" id="hdr">
<div class="wrap">
<a aria-label="AskGogo home" class="mark" href="/">askgogo<b>.</b></a>
<nav aria-label="Primary" class="nav">
<a data-r="secondbrain" href="/secondbrain/">SecondBrain</a>
<a data-r="business" href="/business/">Business</a>
<a data-r="journal" href="/journal/">Journal</a>
<a data-r="about" href="/about/">About</a>
</nav>
<div class="tools">
<button aria-label="Switch to dark theme" class="icon-btn theme-btn" type="button">
<svg aria-hidden="true" class="i-moon" fill="none" stroke="currentColor" stroke-width="1.5" viewbox="0 0 24 24"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z"></path></svg>
<svg aria-hidden="true" class="i-sun" fill="none" hidden="" stroke="currentColor" stroke-width="1.5" viewbox="0 0 24 24"><circle cx="12" cy="12" r="4"></circle><path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4"></path></svg>
</button>
<button class="btn btn-solid btn-sm" data-cta="header" data-open="waitlist" type="button">Join Waitlist</button>
<button aria-controls="drawer" aria-expanded="false" aria-label="Open menu" class="icon-btn menu-btn" id="menu-open" type="button">
<svg aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" viewbox="0 0 24 24"><path d="M4 9h16M4 15h16"></path></svg>
</button>
</div>
</div>
</header>
<div aria-label="Menu" aria-modal="true" class="drawer" hidden="" id="drawer" role="dialog">
<div class="top">
<a class="mark" href="/">askgogo<b>.</b></a>
<div class="tools">
<button aria-label="Switch to dark theme" class="icon-btn theme-btn" type="button">
<svg aria-hidden="true" class="i-moon" fill="none" stroke="currentColor" stroke-width="1.5" viewbox="0 0 24 24"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z"></path></svg>
<svg aria-hidden="true" class="i-sun" fill="none" hidden="" stroke="currentColor" stroke-width="1.5" viewbox="0 0 24 24"><circle cx="12" cy="12" r="4"></circle><path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4"></path></svg>
</button>
<button aria-label="Close menu" class="icon-btn" id="menu-close" type="button"><svg aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" viewbox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"></path></svg></button>
</div>
</div>
<nav aria-label="Mobile">
<a href="/">Home</a><a href="/secondbrain/">SecondBrain</a><a href="/business/">Business</a><a href="/journal/">Journal</a><a href="/about/">About</a>
</nav>
<div class="ctas">
<button class="btn btn-solid" data-cta="menu" data-open="waitlist" type="button">Join Waitlist</button>
<button class="btn btn-ghost" data-cta="menu" data-open="access" type="button">Request Early Access</button>
</div>
</div>`);
