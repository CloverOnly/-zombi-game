// Actual WebGL asset/scene regression test in an isolated headless Chrome profile.
// Inspection cameras change only this test document, never the shipped game.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{spawn}=require('node:child_process');
const {chromium}=require('C:/Users/lyj/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=process.argv.includes('--actual')?'C:/Users/lyj/git/-zombi-game':path.resolve(__dirname,'..'),tag=process.argv.includes('--before')?'before':'after';
const hospital=process.argv.includes('--hospital');
const shopDetail=process.argv.includes('--shop-detail');
const shops=process.argv.includes('--shops')||shopDetail;
const pungjeon=process.argv.includes('--pungjeon')||shops;
const prefix=shopDetail?'shop-detailing':shops?'verified-shops':pungjeon?'pungjeon-location':hospital?'right-building':process.argv.includes('--fill')?'building-fill':'street-detail';
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
const scripts=[...index.matchAll(/<script src="([^"]+)"/g)].map(m=>m[1]).filter(s=>!s.startsWith('game.js')).map(s=>'<script src="'+s+'"></script>').join('\n');
const html=`<!doctype html><meta charset="utf-8"><base href="/"><style>body{margin:0;background:#202b34;overflow:hidden}nav{position:fixed;top:15px;left:15px;color:#fff;background:#19252ddd;padding:10px;font:13px sans-serif}button{padding:6px;margin-right:4px}</style><canvas id="review"></canvas><nav>거리뷰 사진 기준 · 실제 게임 장면 검토<br><button id="corner">투썸 모서리</button><button id="wall">옹벽 방향</button><button id="front">포유하우스 정면</button></nav>${scripts}<script>
const renderer=new THREE.WebGLRenderer({canvas:document.getElementById('review'),antialias:true});renderer.setSize(1280,720);renderer.setPixelRatio(1);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.03;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
const world=createPoyuWorld(THREE,renderer),camera=new THREE.PerspectiveCamera(68,1280/720,.06,1100);camera.rotation.order='YXZ';world.encounter.attachWeapon(camera);world.scene.add(camera);
const views=${shops?JSON.stringify({corner:[6,-2,32,12],wall:[60,16,46,12],front:[35,-7,35,12]}):pungjeon?JSON.stringify({corner:[9,4,23,12],wall:[60,16,46,12],front:[6,-1,22,12]}):hospital?JSON.stringify({corner:[65,-4,36,12],wall:[60,16,46,12],front:[53,-4,35,12]}):JSON.stringify({corner:[63,132,45,113],wall:[49,132,-25,142],front:[62,75,47,75]})};let viewer={level:'floor1',floorY:world.elevator.groundY,x:63,z:132};
${shopDetail?"views.close=[30,2.7,30,8.3];const b=document.createElement('button');b.id='close';b.textContent='차양·입구 근접';document.querySelector('nav').append(b);":''}
const inspectionStatic=${pungjeon};
function show(id){const [x,z,tx,tz]=views[id];viewer.x=x;viewer.z=z;camera.position.set(x,world.elevator.groundY+1.65,z);${shops?"camera.fov=id==='front'?96:id==='close'?68:76;camera.updateProjectionMatrix();":''}camera.lookAt(tx,world.elevator.groundY+${shops?"(id==='wall'?8:id==='close'?2.25:3.2)":pungjeon?"(id==='wall'?8:5.8)":hospital?8:2.8},tz);window.streetReview.view=id;world.updatePresentation(viewer,camera,1);if(!inspectionStatic||streetReview.ready)renderer.render(world.scene,camera);}
${hospital?"document.getElementById('corner').textContent='오른쪽 상가 전체';document.getElementById('wall').textContent='도로 쪽 정면';document.getElementById('front').textContent='상가 골목 측면';":''}
${pungjeon?"document.getElementById('corner').textContent='풍전 · 보행현관 쪽';document.getElementById('wall').textContent='주차장 쪽 · 풍전 없음';document.getElementById('front').textContent='풍전 · 코너 간판';":''}
${shops?"document.getElementById('corner').textContent='풍전 → 식후경 → 명륜';document.getElementById('wall').textContent='주차장 쪽 유지';document.getElementById('front').textContent='상가 출입구';":''}
window.streetReview={ready:false,view:'corner',frames:[]};for(const id of Object.keys(views))document.getElementById(id).onclick=()=>show(id);show('corner');
let previous;function frame(t){if(previous&&streetReview.ready){streetReview.frames.push(t-previous);if(streetReview.frames.length>90)streetReview.frames.shift();}previous=t;world.updatePresentation(viewer,camera,.05);renderer.render(world.scene,camera);requestAnimationFrame(frame);}if(!inspectionStatic)requestAnimationFrame(frame);
installPoyuModels(THREE,world).then(s=>{streetReview.models=s;streetReview.ready=true;if(inspectionStatic)show('corner');}).catch(e=>{streetReview.error=String(e);streetReview.ready=true;});
</script>`;
fs.writeFileSync(path.join(root,'qa/street-review.html'),html);
const server=spawn(process.execPath,['play-local.cjs'],{cwd:root,env:{...process.env,POYU_NO_BROWSER:'1'},stdio:['ignore','pipe','pipe']});
const url=new Promise((resolve,reject)=>{server.stdout.on('data',b=>{const m=b.toString().match(/http:\/\/127\.0\.0\.1:\d+\//);if(m)resolve(m[0]);});server.once('error',reject);});
(async()=>{let browser,page;const errors=[],failed=[];try{
 browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 page=await browser.newPage({viewport:{width:1280,height:720}});page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400&&!r.url().endsWith('favicon.ico'))failed.push({url:r.url(),status:r.status()});});
 await page.goto((await url)+'qa/street-review.html');await page.waitForFunction(()=>window.streetReview?.ready,{},{timeout:120000});
 const shots=[];for(const id of ['corner','wall','front',...(shopDetail?['close']:[])]){await page.locator('#'+id).click();await page.waitForFunction(id=>window.streetReview.view===id,id);await page.screenshot({path:path.join(__dirname,prefix+'-'+tag+'-'+id+'.png')});shots.push(id);}
 if(!pungjeon)await page.waitForFunction(count=>window.streetReview.frames.length>=count,process.argv.includes('--quick')?8:40,{timeout:60000});
 const result=await page.evaluate(()=>{const f=streetReview.frames.slice().sort((a,b)=>a-b);return {models:streetReview.models,error:streetReview.error||null,frameSamples:f.length,medianFps:1000/f[Math.floor(f.length/2)],drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles,detail:window.poyuStreetDetailStatus||null,rightBuilding:window.poyuRightBuildingStatus||null};});
 result.errors=errors;result.failed=failed;result.shots=shots;result.tag=tag;
 if(pungjeon){result.renderMode='on-demand scene inspection; not a frame-rate test';result.medianFps=null;result.frameSamples=0;}
 fs.writeFileSync(path.join(__dirname,prefix+'-'+tag+'-browser.json'),JSON.stringify(result,null,2));
 assert.equal(result.error,null);assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);assert.equal(result.models.exterior.loaded,true);if(tag==='after')assert.equal(result.detail?.loaded,true,JSON.stringify(result.detail));
 if((hospital||pungjeon)&&tag==='after')assert.equal(result.rightBuilding?.loaded,true,JSON.stringify(result.rightBuilding));
 console.log(JSON.stringify(result,null,2));
}catch(e){console.error('Browser diagnostics:',JSON.stringify({errors,failed}));if(page)await page.screenshot({path:path.join(__dirname,prefix+'-failure.png'),timeout:15000}).catch(()=>{});throw e;}finally{await browser?.close();server.kill();}})().catch(e=>{console.error(e);process.exitCode=1;});
