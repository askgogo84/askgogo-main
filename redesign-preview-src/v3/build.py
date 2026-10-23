#!/usr/bin/env python3
"""Assemble the v3 preview site: dist/ (multi-page) and dist/preview-single-file.html (all pages in one file).
Design preview only. Forms are mocked. Nothing here touches production."""
import os, re, shutil, sys
HERE=os.path.dirname(os.path.abspath(__file__))
SRC=os.path.join(HERE,'src'); OUT=os.path.join(HERE,'dist')
rd=lambda p: open(p,encoding='utf-8').read()
HEAD=rd(f'{SRC}/_head.html'); HEADER=rd(f'{SRC}/_header.html'); FOOTER=rd(f'{SRC}/_footer.html')
PAGES={ # key: (output path, title, description, page script)
 'home':('index.html','AskGogo — Less prompting. More living.','A personal AI on WhatsApp that remembers the details and follows everyday tasks through, with your approval before payments, bookings or messages. Private beta.','home.js'),
 'day':('day/index.html','A day with Gogo · AskGogo','One ordinary Tuesday and a Saturday with a personal AI on WhatsApp: car service, medicines, dinner, bills and a flight, handled with approval and proof.','pages.js'),
 'secondbrain':('secondbrain/index.html','SecondBrain — AskGogo for Business','Your company\'s memory, with agents that act on it. Shared, permissioned memory and a team of Gogos that carry recurring work through end to end, with approval where it matters. Early access for teams.','pages.js'),
 'integrations':('integrations/index.html','Integrations · AskGogo','Every app Gogo connects to: WhatsApp, Gmail, Google Calendar, UPI, Swiggy, Uber, IRCTC and more. Connect only what you use. Approval before anything that costs money.','pages.js'),
 'journal':('journal/index.html','Journal · AskGogo','Essays from the team building AskGogo, on memory, autonomy and what it takes to finish a task.','pages.js'),
 'about':('about/index.html','About · AskGogo','Built in Bengaluru. AskGogo is a personal AI on WhatsApp that remembers, acts with your approval and finishes the task. Private beta.','pages.js'),
 'essay-finish-the-work':('journal/finish-the-work/index.html','Why an assistant should finish the work · AskGogo Journal','Most assistants stop at advice. The useful part is finishing the task.','pages.js'),
 'essay-memory-is-the-product':('journal/memory-is-the-product/index.html','Memory is the product · AskGogo Journal','Where a memory came from, how you correct it, and when it should expire.','pages.js'),
 'essay-why-whatsapp':('journal/why-whatsapp/index.html','Why WhatsApp, not another app · AskGogo Journal','The best place for an assistant is the place you already talk to the people who help you.','pages.js'),
 'essay-in-your-language':('journal/in-your-language/index.html','Say it in your language · AskGogo Journal','People do not think in one language. An assistant built for India has to keep up with how people actually speak.','pages.js'),
 'essay-the-approval-moment':('journal/the-approval-moment/index.html','The approval moment · AskGogo Journal','The single most important screen in an assistant is the one that asks you for a yes. Here is how we design it.','pages.js'),
 'essay-built-in-bengaluru':('journal/built-in-bengaluru/index.html','Built in Bengaluru, for the world · AskGogo Journal','Why we are starting with Indian errands, Indian payments and Indian languages, and what that teaches us about everywhere else.','pages.js'),
 'essay-a-teams-memory':('journal/a-teams-memory/index.html','A team’s memory · AskGogo Journal','Every company runs on knowledge that lives in a few people’s heads. SecondBrain is our attempt to make it shared, permissioned and useful.','pages.js'),
 'essay-your-data-your-rules':('journal/your-data-your-rules/index.html','Your data, your rules · AskGogo Journal','An assistant that remembers your life has to be clear about what it keeps, why, and how you take it back.','pages.js'),
 'essay-autonomy-you-can-check':('journal/autonomy-you-can-check/index.html','Autonomy you can check · AskGogo Journal','Plan the task, set the limits, check the result.','pages.js'),
}
def render(key,root):
    out,title,desc,script=PAGES[key]
    main=rd(f'{SRC}/pages/{key}.html')
    doc=HEAD+HEADER+main+FOOTER
    doc=doc.replace('{{PAGE_SCRIPT}}',f'<script src="{{{{ROOT}}}}assets/{script}" defer></script>')
    return doc.replace('{{ROOT}}',root).replace('{{PAGE}}',key).replace('{{TITLE}}',title).replace('{{DESC}}',desc)
def build():
    if os.path.isdir(OUT):shutil.rmtree(OUT)
    shutil.copytree(f'{HERE}/assets',f'{OUT}/assets')
    for key,(out,*_) in PAGES.items():
        root='../'*out.count('/')
        p=f'{OUT}/{out}';os.makedirs(os.path.dirname(p),exist_ok=True)
        open(p,'w',encoding='utf-8').write(render(key,root))
    open(f'{OUT}/robots.txt','w').write('User-agent: *\nDisallow: /\n')
    # single file: every page inline, switched by hash. Page scripts run once; ids are unique per page.
    css=rd(f'{HERE}/assets/site.css'); gogo=rd(f'{HERE}/assets/gogo.js'); site=rd(f'{HERE}/assets/site.js')
    home=rd(f'{HERE}/assets/home.js'); pages=rd(f'{HERE}/assets/pages.js')
    esc=lambda s:s.replace('</script','<\\/script')
    mains=''.join(f'<div class="pg" data-pg="{k}" hidden>{rd(f"{SRC}/pages/{k}.html")}</div>' for k in PAGES)
    head=HEAD.replace('{{PAGE_SCRIPT}}','').replace('<link rel="stylesheet" href="{{ROOT}}assets/site.css">',f'<style>\n{css}\n.pg>main{{display:block}}\n</style>')
    head=head.replace('<script src="{{ROOT}}assets/gogo.js"></script>',f'<script>\n{esc(gogo)}\n</script>').replace('<script src="{{ROOT}}assets/site.js" defer></script>','')
    doc=head+HEADER+mains+FOOTER
    doc=doc.replace('{{TITLE}}','AskGogo v3 preview').replace('{{DESC}}','Design preview, all pages in one file.').replace('{{PAGE}}','home')
    # links: {{ROOT}}x/ -> #x ; {{ROOT}} -> #home ; essays -> #essay-slug
    doc=re.sub(r'href="\{\{ROOT\}\}journal/([a-z-]+)/"',r'href="#essay-\1"',doc)
    doc=re.sub(r'href="\{\{ROOT\}\}(day|secondbrain|business|integrations|pricing|journal|about)/"',r'href="#\1"',doc)
    doc=doc.replace('href="{{ROOT}}"','href="#home"').replace('{{ROOT}}','')
    router='''<script>
(function(){const show=()=>{let k=(location.hash||'#home').slice(1);if(!document.querySelector('.pg[data-pg="'+k+'"]'))k='home';
 document.querySelectorAll('.pg').forEach(p=>p.hidden=p.dataset.pg!==k);document.body.dataset.page=k;
 document.querySelectorAll('.nav a,.drawer nav a').forEach(a=>{const r=a.dataset.r;const on=r===k||(r==='journal'&&k.startsWith('essay'));on?a.setAttribute('aria-current','page'):a.removeAttribute('aria-current')});
 const d=document.getElementById('drawer');if(d&&!d.hidden){d.hidden=true;document.getElementById('menu-open').setAttribute('aria-expanded','false')}
 scrollTo(0,0);window.dispatchEvent(new Event('ag:page'))};
 addEventListener('hashchange',show);show();})();
</script>'''
    doc=doc.replace('</body>',router+f'<script>\n{esc(site)}\n</script>\n<script>\n{esc(home)}\n</script>\n<script>\n{esc(pages)}\n</script>\n</body>')
    import base64,glob
    for svg in glob.glob(f'{HERE}/assets/apps/*.svg'):
        name=os.path.basename(svg);b64=base64.b64encode(open(svg,'rb').read()).decode()
        doc=doc.replace(f'src="assets/apps/{name}"',f'src="data:image/svg+xml;base64,{b64}"')
    for img in glob.glob(f'{HERE}/assets/*.jpg'):
        name=os.path.basename(img);b64=base64.b64encode(open(img,'rb').read()).decode()
        doc=doc.replace(f'src="assets/{name}"',f'src="data:image/jpeg;base64,{b64}"')
    open(f'{OUT}/preview-single-file.html','w',encoding='utf-8').write(doc)
    print('built',len(PAGES),'pages ->',OUT)

def build_live():
    """Production build: assets under assets/site/, indexable, canonical and share tags, forms posting to the live API."""
    LIVE=os.path.join(HERE,'live');BASE='https://askgogo.in/'
    if os.path.isdir(LIVE):shutil.rmtree(LIVE)
    shutil.copytree(f'{HERE}/assets',f'{LIVE}/assets/site')
    today=__import__('datetime').date.today().isoformat()
    STAMP=__import__('datetime').datetime.now(__import__('datetime').timezone.utc).strftime('%Y%m%d%H%M')
    urls=[]
    for key,(out,title,desc,script) in PAGES.items():
        root='../'*out.count('/');url=BASE+out.replace('index.html','')
        doc=render(key,root).replace(f'{root}assets/',f'{root}assets/site/')
        # cache-busting: asset URLs carry the build stamp so phones never keep an old stylesheet or script after a deploy
        doc=re.sub(r'(assets/site/[a-z]+\.(?:css|js))"',lambda m:f'{m.group(1)}?v={STAMP}"',doc)
        doc=doc.replace('<meta name="robots" content="noindex,nofollow,noarchive">\n','')
        og=f"""<link rel="canonical" href="{url}">
<meta property="og:type" content="website"><meta property="og:site_name" content="AskGogo"><meta property="og:url" content="{url}">
<meta property="og:title" content="{title}"><meta property="og:description" content="{desc}">
<meta property="og:image" content="{BASE}askgogo-gogo-character-og-20260911.png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="{title}"><meta name="twitter:description" content="{desc}"><meta name="twitter:image" content="{BASE}askgogo-gogo-character-og-20260911.png">
<script>window.AG_LIVE=true</script>
"""
        # insert after the theme-color meta, whatever its colour; fail the build if it is missing so live tags are never silently dropped
        doc,nsub=re.subn(r'(<meta name="theme-color" content="[^"]*">)',lambda m:m.group(1)+'\n'+og,doc,count=1)
        assert nsub==1 and 'window.AG_LIVE=true' in doc,f'live head tags not inserted for {key}'
        doc=doc.replace('<!-- AskGogo marketing redesign v3: DESIGN PREVIEW ONLY. Not production. Forms are simulated and send nothing. -->\n','')
        doc=doc.replace(' Preview only: nothing was sent.','').replace('<!-- Waitlist sheet (mock) -->','<!-- Waitlist sheet -->').replace('<!-- Early access sheet (mock) -->','<!-- Early access sheet -->')
        for legal in ('privacy','terms','refund'):doc=doc.replace(f'href="https://askgogo.in/{legal}/" target="_blank" rel="noopener"',f'href="{root}{legal}/"')
        p=f'{LIVE}/{out}';os.makedirs(os.path.dirname(p),exist_ok=True);open(p,'w',encoding='utf-8').write(doc);urls.append(url)
    open(f'{LIVE}/robots.txt','w').write(f'User-agent: *\nAllow: /\n\nSitemap: {BASE}sitemap.xml\n')
    open(f'{LIVE}/sitemap.xml','w').write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+''.join(f'  <url><loc>{u}</loc><lastmod>{today}</lastmod></url>\n' for u in urls)+'</urlset>\n')
    print('live build ->',LIVE)
if __name__=='__main__':
    build()
    if '--live' in sys.argv:build_live()
