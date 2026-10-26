// Actual WebGL smoke check, including the user's file:// offline launch path.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const {chromium}=require('C:/Users/lyj/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(__dirname,'..');
(async()=>{
  const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  try{
    const page=await browser.newPage({viewport:{width:1280,height:720}}),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.route(/^https?:/,r=>r.abort());
    // Wrap only in the test document; no debug state is exposed by the game.
    const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
    const scripts=[...index.matchAll(/<script src="([^"]+)"/g)].map(m=>m[1]).filter(s=>!s.startsWith('game.js')).map(s=>'<script src="'+s+'"></script>').join('\n');
    const html='<!doctype html><meta charset="utf-8"><base href="../"><style>body{margin:0;overflow:hidden}</style><canvas id="v"></canvas>'+scripts+`<script>
      const renderer=new THREE.WebGLRenderer({canvas:document.getElementById('v'),antialias:true});renderer.setSize(1280,720);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.9;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
      const world=window.createPoyuWorld(THREE,renderer),camera=new THREE.PerspectiveCamera(70,1280/720,.06,1100);camera.rotation.order='YXZ';camera.layers.enable(1);
      window.show=(x,z,yaw,pitch=-.15)=>{camera.position.set(15.93+(x-15.93)*1.12,1.5,10.8+(z-10.8)*1.12);camera.rotation.set(pitch,-yaw-Math.PI/2,0,'YXZ');renderer.render(world.scene,camera);};
      window.showWorld=(x,z,yaw,pitch=-.04,fov=44)=>{camera.fov=fov;camera.updateProjectionMatrix();camera.position.set(x,1.5,z);camera.rotation.set(pitch,-yaw-Math.PI/2,0,'YXZ');world.updatePresentation({x,z,level:'floor4'},camera,1);renderer.render(world.scene,camera);};
      window.show(8.5,-1.7,-2.52,-.23);window.ready=world.apartment.furniture.ready.then(s=>{window.result={loaded:s.loaded,failed:s.failed,materials:s.materials};window.show(8.5,-1.7,-2.52,-.23);});
    </script>`;
    const filename=path.join(__dirname,'furniture-browser-preview.html');fs.writeFileSync(filename,html);
    await page.goto(pathToFileURL(filename).href);
    await page.waitForFunction(()=>window.result,{},{timeout:45000});
    const result=await page.evaluate(()=>window.result);assert.equal(result.loaded.length,3,JSON.stringify(result));assert.equal(result.failed.length,0);assert.equal(result.materials.length,2);assert.deepEqual(errors,[]);
    const common=process.argv.includes('--common');
    const shots=common?[['entry',[17.1,10.8,0,-.04,90]],['near-right-bay',[18,14.2,Math.PI/2,-.04,90]],['corridor',[27,10.8,0,-.04,85]],['right-bay',[27.5,15.5,Math.PI/2,-.04,85]],['far-right-bay',[34,15.2,Math.PI/2,-.04,95]],['from-605',[34.7,10.5,Math.PI,-.04,90]]]:[['bed',[8.5,-1.7,-2.52,-.23]],['sofa',[8.5,3.8,2.3,-.2]],['dining',[10.5,3.4,.68,-.18]]];
    for(const [name,args]of shots){await page.evaluate(({a,common})=>common?window.showWorld(...a):window.show(...a),{a:args,common});await page.screenshot({path:path.join(__dirname,(common?'webgl-common-':'webgl-furniture-')+name+'.png')});}
    console.log('Offline WebGL: 3 model files and 2 PBR material sets loaded, no page errors, '+shots.length+' screenshots saved.');
  }finally{await browser.close();}
})().catch(e=>{console.error(e.message);process.exitCode=1;});
