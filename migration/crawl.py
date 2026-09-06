import sys, json, urllib.request, urllib.parse, concurrent.futures
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent / 'vendor'))
from bs4 import BeautifulSoup
ROOT=Path(__file__).resolve().parent
BASE='https://burari-net.jp'
paths=['/','/businessguide','/businessguide/power_consulting','/businessguide/specialcontents','/businessguide/led','/company','/recruitment','/agency','/privacy','/contact','/sitemap']
def get(url):
    with urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'BurariNet-Migration/1.0'}),timeout=40) as r: return r.read()
def page(path):
    data=get(BASE+path)
    name=path.strip('/').replace('/','_') or 'home'
    (ROOT/(name+'.html')).write_bytes(data)
    soup=BeautifulSoup(data,'html.parser')
    main=soup.select_one('.col-content') or soup.select_one('main')
    return {'path':path,'title':soup.title.get_text(), 'html':str(main),'text':main.get_text('\n',strip=True), 'assets':sorted(set(urllib.parse.urljoin(BASE,t['src']) for t in soup.select('img[src]'))),'links':sorted(set(a['href'] for a in main.select('a[href]')))}
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool: pages=list(pool.map(page,paths))
(ROOT/'pages.json').write_text(json.dumps(pages,ensure_ascii=False,indent=2),encoding='utf-8')
assets=sorted(set(a for p in pages for a in p['assets']))
out=ROOT/'assets';out.mkdir(exist_ok=True)
def asset(url):
    name=urllib.parse.urlparse(url).path.strip('/').replace('/','_')
    (out/name).write_bytes(get(url))
    return url,name
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool: mapping=dict(pool.map(asset,assets))
(ROOT/'assets.json').write_text(json.dumps(mapping,ensure_ascii=False,indent=2),encoding='utf-8')
for p in pages: print(p['path'],p['title'],len(p['html']),p['links'])
print('Downloaded',len(mapping),'assets')
