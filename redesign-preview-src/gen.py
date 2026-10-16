import re, os, json, shutil, sys
from bs4 import BeautifulSoup
SRC=sys.argv[1]; OUT=sys.argv[2]
raw=open(SRC).read()
css=re.search(r'<style>([\s\S]*?)</style>',raw).group(1)
js=re.search(r'<script>([\s\S]*?)</script>',raw).group(1)
soup=BeautifulSoup(raw,'html.parser')

HREF={'#home':'/','#secondbrain':'/secondbrain/','#business':'/business/','#journal':'/journal/','#about':'/about/',
      '#finish-the-work':'/journal/finish-the-work/','#memory-is-the-product':'/journal/memory-is-the-product/','#autonomy-you-can-check':'/journal/autonomy-you-can-check/'}
LEGAL={'Privacy':'https://askgogo.in/privacy/','Terms':'https://askgogo.in/terms/','Refunds':'https://askgogo.in/refund/','Privacy Policy':'https://askgogo.in/privacy/'}
def fix(el):
    for a in el.find_all('a'):
        h=a.get('href','')
        if a.has_attr('data-legal'):
            del a['data-legal']; a['href']=LEGAL.get(a.get_text(strip=True),'https://askgogo.in/privacy/'); a['target']='_blank'; a['rel']='noopener'
        elif h in HREF: a['href']=HREF[h]
    return el
def html(el): return str(fix(el))

header=html(soup.select_one('#hdr')); drawer=html(soup.select_one('#drawer')); footer=html(soup.select_one('#ftr'))
sheets=html(soup.select_one('#sheet-waitlist'))+'\n'+html(soup.select_one('#sheet-access'))
pages={}
for el in soup.select('[data-page]'):
    k=el['data-page']
    if k=='inventory': continue
    if el.has_attr('hidden'): del el['hidden']
    pages[k]=html(el)

# ---- CSS: drop review/stage chrome, pin header to top ----
css=css.replace('top:calc(env(safe-area-inset-top,0px) + var(--rb,48px))','top:env(safe-area-inset-top,0px)')
css=css.replace('body::before{content:"";position:fixed;inset:0 0 auto;height:env(safe-area-inset-top,0px);z-index:60;background:#1C1C1E}',
                'body::before{content:"";position:fixed;inset:0 0 auto;height:env(safe-area-inset-top,0px);z-index:60;background:var(--bg)}')
css=re.sub(r'/\* ---------- review bar[\s\S]*?(?=\.wrap\{)','',css)
css=re.sub(r'/\* inventory \(review only\) \*/[\s\S]*?(?=/\* arrival)','',css)

# ---- JS: page-based instead of hash routing ----
js=js.replace("el.innerHTML=items.map(e=>`<a href=\"#${e.slug}\">","el.innerHTML=items.map(e=>`<a href=\"/journal/${e.slug}/\">")
start=js.index('const reduced=matchMedia')
end=js.index('const drawer=document.getElementById')
js=js[:start]+r"""const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const hdr=document.getElementById('hdr'),PAGE=document.body.dataset.page;
document.querySelectorAll('.nav a').forEach(a=>{const on=a.dataset.r===PAGE||(a.dataset.r==='journal'&&PAGE.startsWith('essay'));on?a.setAttribute('aria-current','page'):a.removeAttribute('aria-current')});
addEventListener('scroll',()=>hdr.classList.toggle('scrolled',scrollY>8),{passive:true});
let io;
function observe(){
  if(reduced.matches||!('IntersectionObserver' in window))return;
  io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('go');io.unobserve(e.target)}}),{rootMargin:'0px 0px -8% 0px'});
  document.querySelectorAll('.rise').forEach(el=>{if(el.getBoundingClientRect().top>innerHeight)io.observe(el)});
}
"""+js[end:]
js=js.replace("function closeDrawer(silent){","function closeDrawer(silent){")
js=js.replace("  if(e.target.closest('[data-legal]')){e.preventDefault();return}\n","")
js=js.replace("ambient=makeAmbient(document.getElementById('ambient'));\nambient.recolor();\nroute();",
 "const cv=document.getElementById('ambient');\nif(cv){ambient=makeAmbient(cv);ambient.recolor();ambient.start()}\nobserve();")
js=js.replace("  ambient&&ambient.recolor();","  ambient&&ambient.recolor();")
assert 'route()' not in js and 'rv-inv' not in js, 'leftover hash routing'

ESS={'finish-the-work':('Why an assistant should finish the work','Most AI hands back homework. The useful part is the last mile, and that is where an assistant should spend its effort.'),
     'memory-is-the-product':('Memory is the product','Provenance, correction, scope and expiry: what it takes for an assistant to remember well.'),
     'autonomy-you-can-check':('Autonomy you can check','Reliable agents come from planning, boundaries and checking the result.')}
META={'home':('AskGogo — Less prompting. More living.','An AI that remembers your world, understands what matters, and gets things done. Private beta in India and the UAE.'),
      'secondbrain':('SecondBrain by AskGogo','The intelligence layer underneath AskGogo: personal and company memory that is put to use without being asked twice.'),
      'business':('AskGogo for Business','Shared company memory, autonomous workflows, approvals and verification. Request early access.'),
      'journal':('Journal — AskGogo','Essays from the team building AskGogo, on memory, autonomy and what it takes to finish a task.'),
      'about':('About — AskGogo','AskGogo is built in Bengaluru for the way people in India and the UAE live.')}
for k,(t,d) in ESS.items(): META[k]=(t+' — AskGogo Journal',d)
PATH={'home':'index.html','secondbrain':'secondbrain/index.html','business':'business/index.html','journal':'journal/index.html','about':'about/index.html'}
for k in ESS: PATH[k]=f'journal/{k}/index.html'

THEME_BOOT="<script>try{if(localStorage.getItem('askgogo-theme')==='dark')document.documentElement.classList.add('mode-dark')}catch(e){}</script>"
def page(k):
    t,d=META[k]; bodypage='essay-'+k if k in ESS else k
    return f"""<!doctype html>
<!-- AskGogo marketing redesign: DESIGN PREVIEW ONLY. Not production. Forms are simulated and send nothing. -->
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="robots" content="noindex,nofollow,noarchive">
<title>{t}</title>
<meta name="description" content="{d}">
<meta property="og:title" content="{t}">
<meta property="og:description" content="{d}">
<meta name="theme-color" content="#FFFFFF">
{THEME_BOOT}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600&family=Instrument+Serif&display=swap">
<link rel="stylesheet" href="/assets/site.css">
<script src="/assets/site.js" defer></script>
</head>
<body data-page="{bodypage}">
<a class="skip" href="#main">Skip to content</a>
<div class="site" id="site">
<script src="/assets/chrome.js"></script>
<main id="main">
{pages[k]}
</main>
</div>
</body>
</html>
"""
if os.path.exists(OUT): shutil.rmtree(OUT)
os.makedirs(OUT+'/assets')
css+="\nhtml,body{margin:0}\n@container (max-width:420px){.hero h1{font-size:38px}}\n.site{container-type:inline-size;margin-inline:auto;background:var(--bg);transition:background .35s ease}\n.skip{position:absolute;left:12px;top:-60px;z-index:100;background:var(--ink);color:var(--on-ink);padding:10px 14px;border-radius:8px;text-decoration:none}\n.skip:focus{top:12px}\n"
open(OUT+'/assets/site.css','w').write(css.strip()+'\n')
js=js.strip()
tl=lambda x:'`'+x.replace('`','').replace('${','')+'`'
js=js.replace('(()=>{','(()=>{\ndocument.getElementById(\'site\').insertAdjacentHTML(\'beforeend\','+tl(footer)+');\ndocument.body.insertAdjacentHTML(\'beforeend\','+tl(sheets)+');',1)
open(OUT+'/assets/chrome.js','w').write('/* Shared header and menu, inserted before first paint. */\ndocument.currentScript.insertAdjacentHTML(\'afterend\','+tl(header+'\n'+drawer)+');\n')
open(OUT+'/assets/site.js','w').write(js+'\n')
for k,p in PATH.items():
    os.makedirs(os.path.dirname(OUT+'/'+p) or OUT,exist_ok=True)
    open(OUT+'/'+p,'w').write(page(k))
open(OUT+'/robots.txt','w').write('User-agent: *\nDisallow: /\n')
open(OUT+'/vercel.json','w').write(json.dumps({"trailingSlash":True,"headers":[{"source":"/(.*)","headers":[{"key":"X-Robots-Tag","value":"noindex, nofollow, noarchive"},{"key":"X-Content-Type-Options","value":"nosniff"},{"key":"Referrer-Policy","value":"strict-origin-when-cross-origin"}]}]},indent=2)+'\n')
open(OUT+'/README.md','w').write("""# AskGogo marketing redesign — design preview v2

Static, mock-only preview for design review. Not production.

- Pages: / , /secondbrain/ , /business/ , /journal/ (+3 essays) , /about/
- No API calls: the Join Waitlist and Request Early Access forms validate locally and send nothing.
- No secrets, keys or user data. Fonts load from Google Fonts; everything else is local.
- noindex via meta robots, X-Robots-Tag header and robots.txt.
- Theme: light by default; the sun/moon button saves the choice in localStorage (key `askgogo-theme`).
""")
print('pages',sorted(PATH.values()))
