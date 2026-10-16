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
 'secondbrain':('secondbrain/index.html','SecondBrain — memory that works for you · AskGogo','SecondBrain is the memory layer under AskGogo: it keeps what you share, with its source, and brings it back when it matters. In private development.','pages.js'),
 'business':('business/index.html','AskGogo for Business — agents that know how your company works','Shared company memory, work carried through end to end, approval at the steps that matter, and a result you can check. Early access for teams.','pages.js'),
 'journal':('journal/index.html','Journal · AskGogo','Essays from the team building AskGogo, on memory, autonomy and what it takes to finish a task.','pages.js'),
 'about':('about/index.html','About · AskGogo','Built in Bengaluru. AskGogo is a personal AI on WhatsApp that remembers, acts with your approval and finishes the task. Private beta.','pages.js'),
 'essay-finish-the-work':('journal/finish-the-work/index.html','Why an assistant should finish the work · AskGogo Journal','Most assistants stop at advice. The useful part is finishing the task.','pages.js'),
 'essay-memory-is-the-product':('journal/memory-is-the-product/index.html','Memory is the product · AskGogo Journal','Where a memory came from, how you correct it, and when it should expire.','pages.js'),
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
    doc=re.sub(r'href="\{\{ROOT\}\}(secondbrain|business|journal|about)/"',r'href="#\1"',doc)
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
    for img in glob.glob(f'{HERE}/assets/*.jpg'):
        name=os.path.basename(img);b64=base64.b64encode(open(img,'rb').read()).decode()
        doc=doc.replace(f'src="assets/{name}"',f'src="data:image/jpeg;base64,{b64}"')
    open(f'{OUT}/preview-single-file.html','w',encoding='utf-8').write(doc)
    print('built',len(PAGES),'pages ->',OUT)
if __name__=='__main__':build()
