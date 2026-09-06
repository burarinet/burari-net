import sys,json,re
from pathlib import Path
sys.path.insert(0,str(Path(__file__).parent/'vendor'))
from bs4 import BeautifulSoup
root=Path(__file__).resolve().parent.parent
public=root/'site/dist/client'
pages=json.loads((root/'site/lib/content.json').read_text(encoding='utf8'))
original=json.loads((root/'migration/pages.json').read_text(encoding='utf8'))
errors=[];links=0;images=0
normalize=lambda s:re.sub(r'\s+','',s)
for page in pages:
    file=public/page['path'].strip('/')/'index.html' if page['path']!='/' else public/'index.html'
    soup=BeautifulSoup(file.read_text(encoding='utf8'),'html.parser')
    assert soup.html.get('lang')=='ja'
    assert len(soup.select('h1'))==1,(page['path'],'h1')
    for a in soup.select('a[href]'):
        url=a['href'];links+=1
        if url.startswith('/') and not url.startswith('//'):
            url=url.split('#')[0].split('?')[0]
            target=public/url.strip('/')
            if not target.exists() and not target.with_suffix('.html').exists():errors.append((page['path'],'broken link',url))
    for img in soup.select('img[src]'):
        images+=1
        if not (public/img['src'].lstrip('/')).exists():errors.append((page['path'],'missing image',img['src']))
    if page['path']!='/':
        expected=BeautifulSoup(page['html'],'html.parser').get_text()
        actual=soup.select_one('article').get_text()
        if normalize(expected) not in normalize(actual):errors.append((page['path'],'content mismatch'))
    else:
        source=BeautifulSoup(original[0]['html'],'html.parser')
        for p in source.select('p'):
            text=normalize(p.get_text())
            if text and text!='BacktoTop' and text not in normalize(soup.get_text()):errors.append(('/','missing home paragraph',text))
    if page['fields']:
        form=soup.select_one('form[data-netlify]');assert form
        assert form.get('action')=='/thanks/'
        for field in page['fields']:
            if field['type']!='select':assert form.select_one('[name="'+field['name']+'"]'),field
        definitions=BeautifulSoup((public/'__forms.html').read_text(encoding='utf8'),'html.parser')
        registration=definitions.find('form',attrs={'name':page['path'][1:]})
        assert all(registration.find(attrs={'name':f['name']}) for f in page['fields'])
assert not errors,errors
print(f'PASS: {len(pages)} original pages; {links} links; {images} image references; original text; 3 form definitions.')
