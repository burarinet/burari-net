import sys,json,shutil
from pathlib import Path
sys.path.insert(0,str(Path(__file__).parent/'vendor'))
from bs4 import BeautifulSoup,Comment
root=Path(__file__).resolve().parent
site=root.parent/'site'
pages=json.loads((root/'pages.json').read_text(encoding='utf8'))
mapping=json.loads((root/'assets.json').read_text(encoding='utf8'))
for url,name in mapping.items():
    dest=site/'public'/url.replace('https://burari-net.jp/','')
    dest.parent.mkdir(parents=True,exist_ok=True)
    shutil.copyfile(root/'assets'/name,dest)
result=[]
for page in pages:
    soup=BeautifulSoup(page['html'],'html.parser')
    for el in soup.select('script,h1,.text-right'): el.decompose()
    fields=[]
    for form in soup.select('form'):
        for group in form.select('.field'):
            label=group.select_one('label'); inp=group.select_one('input,textarea,select')
            required=bool(label.select_one('span'))
            for span in label.select('span'): span.decompose()
            field={'label':label.get_text(strip=True),'name':inp['name'],'type':inp.get('type',inp.name),'required':required}
            if inp.name=='select': field['options']=[o.get_text() for o in inp.select('option') if o.get_text() not in ['----','選択してください']]
            fields.append(field)
        form.decompose()
    for el in soup.find_all(string=lambda x:isinstance(x,Comment)): el.extract()
    for el in soup.find_all():
        for attr in list(el.attrs):
            if attr not in ['href','src','alt','colspan','rowspan']: del el[attr]
        if el.name=='a': el['href']=el.get('href','').replace('https://burari-net.jp','')
        if el.name=='h3': el.name='h2'
        if el.name=='table': el.wrap(soup.new_tag('div',attrs={'class':'table-scroll','tabindex':'0','role':'region','aria-label':'製品仕様表'}))
        if el.name=='img':
            el['loading']='lazy'
            el['alt']=el.get('alt') or page['title'].split(' ::')[0]+'の資料'
    result.append({'path':page['path'],'title':page['title'].split(' ::')[0],'html':str(soup),'fields':fields})
(site/'lib/content.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf8')
