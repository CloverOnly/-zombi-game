const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const {spawn}=require('node:child_process');
const root=__dirname;
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.glb':'model/gltf-binary','.gltf':'model/gltf+json','.bin':'application/octet-stream','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml','.wav':'audio/wav','.mp3':'audio/mpeg','.json':'application/json; charset=utf-8'};
const server=http.createServer((request,response)=>{
  let route;
  try{route=decodeURIComponent(new URL(request.url,'http://localhost').pathname);}catch{response.writeHead(400).end();return;}
  const file=path.resolve(root,'.'+(route==='/'?'/index.html':route));
  if(file!==root&&!file.startsWith(root+path.sep)){response.writeHead(403).end();return;}
  fs.stat(file,(error,stat)=>{
    if(error||!stat.isFile()){response.writeHead(404).end();return;}
    response.writeHead(200,{'Content-Type':mime[path.extname(file).toLowerCase()]||'application/octet-stream','Content-Length':stat.size,'Cache-Control':'no-cache'});
    fs.createReadStream(file).pipe(response);
  });
});
server.listen(0,'127.0.0.1',()=>{
  const url='http://127.0.0.1:'+server.address().port+'/';
  console.log('포유하우스 게임: '+url);
  if(process.platform==='win32'&&!process.env.POYU_NO_BROWSER){
    const browsers=[
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
    ];
    const browser=browsers.find(file=>fs.existsSync(file));
    const child=browser?spawn(browser,[url],{detached:true,stdio:'ignore'}):spawn('rundll32.exe',['url.dll,FileProtocolHandler',url],{detached:true,stdio:'ignore'});
    child.on('error',error=>console.warn('브라우저 자동 열기 실패:',error.message,'주소를 직접 여세요:',url));
    child.unref();
  }
});
