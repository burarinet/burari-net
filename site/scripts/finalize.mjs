import {readFileSync,writeFileSync,mkdirSync,renameSync,existsSync,rmSync} from 'node:fs';
import path from 'node:path';
const root=path.resolve('dist/client');
const pages=JSON.parse(readFileSync('lib/content.json','utf8'));
// Vinext's current trailingSlash prerender redirects rather than rendering.
// Export normally, then use portable directory indexes for static hosting.
for(const route of [...pages.filter(p=>p.path!=='/').map(p=>p.path),'/thanks']){
 const source=path.join(root,route+'.html');const target=path.join(root,route,'index.html');
 if(!existsSync(source))throw new Error('Missing exported route: '+route);
 mkdirSync(path.dirname(target),{recursive:true});renameSync(source,target);
}
writeFileSync(path.join(root,'sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+pages.map(p=>'<url><loc>https://burari-net.jp'+(p.path==='/'?'/':p.path+'/')+'</loc></url>').join('')+'</urlset>\n');
writeFileSync(path.join(root,'robots.txt'),'User-agent: *\nAllow: /\nSitemap: https://burari-net.jp/sitemap.xml\n');
// Separate, plain HTML registration works even if Netlify changes its JSX detection.
const forms=pages.filter(p=>p.fields.length).map(p=>{
 const name=p.path.slice(1);
 return `<form name="${name}" method="POST" data-netlify="true" data-netlify-honeypot="bot-field" hidden><input name="form-name" value="${name}"><input name="bot-field">`+p.fields.map(f=>`<input name="${f.name}">`).join('')+'</form>';
});
writeFileSync(path.join(root,'__forms.html'),'<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>フォーム定義</title></head><body>'+forms.join('')+'</body></html>');
// These are build-time lookup files only. The browser loads the resolved chunks
// referenced by each HTML page, not these manifests.
for(const name of ['favicon.svg','vinext-client-entry-manifest.json','.vite']){
 const file=path.join(root,name);
 if(existsSync(file))rmSync(file,{recursive:true,force:true});
}
console.log('Static output finalized: 11 original pages, success page, 404, sitemap, 3 form definitions.');
