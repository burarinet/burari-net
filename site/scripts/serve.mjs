import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve('dist/client');
const mime={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'application/javascript','.mjs':'application/javascript','.json':'application/json','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.ico':'image/x-icon','.svg':'image/svg+xml','.woff2':'font/woff2','.xml':'application/xml','.txt':'text/plain','.rsc':'text/x-component'};
http.createServer(async(req,res)=>{
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end('Static preview does not accept forms.');return}
 try{
  const url=new URL(req.url,'http://localhost');const relative=decodeURIComponent(url.pathname).replace(/^\/+/, '');
  let file=path.resolve(root,relative);if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return}
  const info=await stat(file).catch(()=>null);
  if(info?.isDirectory())file=path.join(file,'index.html');
  let status=200;let body;
  try{body=await readFile(file)}catch{status=404;file=path.join(root,'404.html');body=await readFile(file)}
  res.writeHead(status,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(req.method==='HEAD'?undefined:body);
 }catch{res.writeHead(400);res.end('Bad request')}
}).listen(3000,'127.0.0.1',()=>console.log('Static preview: http://localhost:3000/'));
