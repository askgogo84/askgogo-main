import re, os, shutil, subprocess, sys, json
SRC, OUT = sys.argv[1], sys.argv[2]
if os.path.exists(OUT): shutil.rmtree(OUT)
shutil.copytree(SRC, OUT)

def curly(text):
    # straight double quotes in prose -> curly quotes
    out=[];open_=True
    for ch in text:
        if ch=='"': out.append('“' if open_ else '”'); open_=not open_
        else: out.append(ch)
    return ''.join(out)

def sq(html):
    parts=re.split(r'(<[^>]*>)',html)
    res=[]
    for p in parts:
        if p.startswith('<') and p.endswith('>'):
            if p.startswith('<!--') or p.startswith('<!doctype'): res.append(p); continue
            def fix(m):
                v=m.group(1)
                assert "'" not in v, ('single quote in attr', v)
                return "='"+v+"'"
            res.append(re.sub(r'="([^"]*)"',fix,p))
        else:
            res.append(curly(p))
    h=''.join(res)
    h=re.sub(r'>\s*\n\s*<','><',h)
    h=re.sub(r'\s*\n\s*',' ',h)
    return h.strip()

def walk(ext):
    for root,_,fs in os.walk(OUT):
        for f in fs:
            if f.endswith(ext): yield os.path.join(root,f)

# HTML: inline <script> keeps double quotes? it has single quotes only.
for p in walk('.html'):
    s=open(p).read()
    s=sq(s)
    open(p,'w').write(s+'\n')

# CSS
p=OUT+'/assets/site.css'; s=open(p).read()
s=re.sub(r'/\*[\s\S]*?\*/','',s).replace('"',"'")
s=re.sub(r'\s*\n\s*','',s); s=re.sub(r'\s{2,}',' ',s)
open(p,'w').write(s+'\n')

# JS: quote-normalise HTML inside template literals, then terser
for name in ['site.js','chrome.js']:
    p=OUT+'/assets/'+name; s=open(p).read()
    s=s.replace('[aria-invalid="true"]','[aria-invalid=true]')
    s=re.sub(r'`([^`]*)`',lambda m:'`'+(sq(m.group(1)) if '<' in m.group(1) else m.group(1))+'`',s)
    open(p,'w').write(s)
    r=subprocess.run(['npx','--no-install','terser',p,'--format','quote_style=1,comments=false','-o',p],cwd='/home/claude',capture_output=True,text=True)
    assert r.returncode==0, r.stderr
for p in list(walk('.html'))+list(walk('.css'))+list(walk('.js')):
    s=open(p).read()
    print(f"{os.path.relpath(p,OUT):48s} bytes={len(s.encode()):6d} dq={s.count(chr(34))} bs={s.count(chr(92))} nl={s.count(chr(10))}")
