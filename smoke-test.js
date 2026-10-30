// Browser-free check for 3D world creation, continuous movement and first pickup.
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const three=require('./three.min.js');
const ctx=new Proxy({createLinearGradient(){return {addColorStop(){}};},createRadialGradient(){return {addColorStop(){}};}},{get:(o,k)=>o[k]??(()=>{})});
function node(id){
  const listeners={},classes=new Set(['hud','prompt','inventory','mapOverlay','pause','ending','message','webglError'].includes(id)?['hidden']:[]);
  return {id,listeners,classes,style:{width:''},textContent:'',innerHTML:'',width:640,height:400,
    setAttribute(){},
    classList:{add(x){classes.add(x);},remove(x){classes.delete(x);},toggle(x,v){if(v===undefined?!classes.has(x):v)classes.add(x);else classes.delete(x);},contains(x){return classes.has(x);}},
    addEventListener(t,fn){listeners[t]=fn;},click(){listeners.click?.({});},getContext(){return ctx;}};
}
const elements=new Map(),get=id=>{if(!elements.has(id))elements.set(id,node(id));return elements.get(id);};
const listeners={};
const document={pointerLockElement:null,getElementById:get,createElement(){return {width:0,height:0,getContext(){return ctx;}};},addEventListener(t,fn){listeners[t]=fn;},exitPointerLock(){this.pointerLockElement=null;listeners.pointerlockchange?.();}};
get('view').requestPointerLock=()=>{document.pointerLockElement=get('view');listeners.pointerlockchange?.();};
let renderedCamera;
class FakeRenderer{constructor(){this.shadowMap={};this.capabilities={getMaxAnisotropy(){return 8;}};}setPixelRatio(){}setSize(){}render(scene,camera){renderedCamera=camera;}}
const THREE={...three,WebGLRenderer:FakeRenderer};
const audioState={plays:0,enabled:true,paused:false};
const window={THREE,innerWidth:1600,innerHeight:900,devicePixelRatio:1,addEventListener(){},
  createPoyuAlertAudio(){return {
    available:true,get enabled(){return audioState.enabled;},
    unlock(){return {then(fn){fn(true);}};},
    play(){audioState.plays++;return true;},
    setEnabled(value){audioState.enabled=value;return value;},
    setPaused(value){audioState.paused=value;}
  };}
};
vm.runInNewContext(fs.readFileSync(__dirname+'/exterior.js','utf8'),{window,document,Math,console});
vm.runInNewContext(fs.readFileSync(__dirname+'/interior-polish.js','utf8'),{window,document,Math,console});
vm.runInNewContext(fs.readFileSync(__dirname+'/rooms.js','utf8'),{window,document,Math,console});
for(const n of ['surfaces','street-details','zombie','elevator','parking','mart-route','streets','driving','street-ai'])vm.runInNewContext(fs.readFileSync(__dirname+'/'+n+'.js','utf8'),{window,document,Math,console});
vm.runInNewContext(fs.readFileSync(__dirname+'/hallway.js','utf8'),{window,document,Math,console});
vm.runInNewContext(fs.readFileSync(__dirname+'/mart-interior.js','utf8'),{window,document,Math,console});
vm.runInNewContext(fs.readFileSync(__dirname+'/photo-apartment.js','utf8'),{window,document,Math,console});
vm.runInNewContext(fs.readFileSync(__dirname+'/world.js','utf8'),{window,document,Math,console});
vm.runInNewContext(fs.readFileSync(__dirname+'/chapter.js','utf8'),{window,document,Math,console});
let frame;
vm.runInNewContext(fs.readFileSync(__dirname+'/game.js','utf8').replace('const world=window.createPoyuWorld(THREE,renderer);','const world=window.createPoyuWorld(THREE,renderer);window.__testWorld=world;'),{window,document,Math,console,performance:{now(){return 0;}},setTimeout(){return 1;},clearTimeout(){},requestAnimationFrame(fn){frame=fn;}},{filename:'game.js'});
const key=(code,repeat=false)=>listeners.keydown({code,repeat,preventDefault(){}});
const up=code=>listeners.keyup({code});
let now=0;const tick=ms=>{const end=now+ms;while(now<end){now+=16;frame(now);}};
function lookAt(x,z){const p=renderedCamera.position;let yaw=-renderedCamera.rotation.y-Math.PI/2,difference=Math.atan2(z-p.z,x-p.x)-yaw;while(difference>Math.PI)difference-=Math.PI*2;while(difference<-Math.PI)difference+=Math.PI*2;const steps=Math.ceil(Math.max(Math.abs(difference)/.035,Math.abs(renderedCamera.rotation.x)/.012));for(let i=0;i<steps;i++){listeners.mousemove({movementX:difference/steps/.00075,movementY:renderedCamera.rotation.x/Math.max(1,steps-i)/.00042});tick(16);}}
function walkTo(x,z){lookAt(x,z);const d=Math.hypot(x-renderedCamera.position.x,z-renderedCamera.position.z);key('KeyW');tick(d/2.2*1000);up('KeyW');tick(16);assert(Math.hypot(x-renderedCamera.position.x,z-renderedCamera.position.z)<.15,'walking route stays clear: '+[x,z]);}
get('startButton').click();tick(32);
assert(!get('hud').classes.has('hidden'),'game starts');
assert(renderedCamera.parent.getObjectByName('master-window'),'revised master bedroom window is present');
assert(renderedCamera.parent.getObjectByName('master-vanity'),'revised master bedroom vanity is present');
assert(renderedCamera.parent.getObjectByName('ensuite-bathroom-hinge').rotation.y>0,'ensuite door opens toward the bathroom');
assert.match(get('progress').textContent,/0 \/ 6/);
assert.equal(audioState.plays,1,'opening alert plays');
key('KeyB');assert.equal(audioState.enabled,false,'B mutes alert');
key('KeyB');assert.equal(audioState.enabled,true,'B restores alert');
// Walk along the actual bedside aisle in the photo-based floor plan.
walkTo(7.7,-5.1);lookAt(6.99,-5.89);key('KeyE');
assert.match(get('progress').textContent,/1 \/ 6/,'phone can be picked up by looking at it');
key('Tab');assert(!get('inventory').classes.has('hidden'),'inventory opens');key('Tab');
key('KeyM');assert(!get('mapOverlay').classes.has('hidden'),'map opens');key('KeyM');
key('KeyS');tick(400);up('KeyS');
assert.notEqual(get('roomName').textContent,'','room tracking stays active');
get('checkpointButton').click();
assert.match(get('progress').textContent,/6 \/ 6/,'checkpoint includes preparation supplies');
tick(32);
key('KeyE');tick(650);key('KeyW');tick(730);up('KeyW');tick(2300);
assert.match(get('objective').textContent,/신발장/,'leaving the entrance triggers the retreat objective');
walkTo(14.4,10.80);lookAt(14.75,11.02);key('KeyE');tick(650);lookAt(14.95,11.45);key('KeyE');tick(32);
assert.match(get('progress').textContent,/야구방망이 장착/,'cabinet interaction equips the bat in game');
// This renderer-free harness does not load GLTF assets. The rig/browser checks cover the visible model.
assert(!renderedCamera.getObjectByName('equipped-baseball-bat').visible,'unloaded FPS assets must not show a primitive substitute');
key('KeyF');tick(230);
assert(get('ending').classes.has('hidden'),'practice swing does not end the game');
walkTo(14.4,10.80);walkTo(15.02,10.80);lookAt(15.93,10.80);
key('KeyE');tick(650);key('KeyW');tick(730);up('KeyW');
assert.match(get('objective').textContent,/공격/,'re-entering the hallway begins combat');
key('KeyF');tick(720);key('KeyW');tick(150);up('KeyW');key('KeyF');tick(720);key('KeyW');tick(200);up('KeyW');key('KeyF');tick(900);
assert.match(get('objective').textContent,/이웃집/,'keyboard combat advances to neighbour inspection');
assert(get('enemyStatus').classes.has('hidden'),'enemy status closes after the fight');
// Reach the lift with real movement and E prompts, rather than teleporting the player.
walkTo(17.3,15.4);lookAt(16.03,15.4);key('KeyE');tick(32);
walkTo(17.3,11.8);walkTo(24,9.7);lookAt(24,8.43);key('KeyE');tick(32);
walkTo(29,9.7);lookAt(29,8.43);key('KeyE');tick(32);
assert(!get('dialogue').classes.has('hidden'),'neighbour speaks through the closed door');
assert.equal(get('dialogueSpeaker').textContent,'604호 이웃');
const talkX=renderedCamera.position.x,talkZ=renderedCamera.position.z;key('KeyW');tick(400);up('KeyW');assert.equal(renderedCamera.position.x,talkX);assert.equal(renderedCamera.position.z,talkZ);
for(let i=0;i<5;i++){key('KeyE');tick(32);}
walkTo(34.7,10.5);lookAt(35.97,10.5);key('KeyE');tick(32);
walkTo(34.7,16.2);lookAt(35.97,16.2);key('KeyE');tick(32);
assert(get('dialogue').classes.has('hidden'));assert(get('ending').classes.has('hidden'),'survey does not interrupt the story with an ending');assert.match(get('objective').textContent,/2층 주차장/);
walkTo(34,14.7);walkTo(34,10.5);walkTo(27.5,9.7);walkTo(27.25,19);
lookAt(37.05,26.83);key('KeyE');tick(1100);
walkTo(28.7,19.7);walkTo(28.7,21.55);
lookAt(28.88,22.56);assert.match(get('promptText').textContent,/2층/,'aim at the separate parking floor button');key('KeyE');tick(1500);
assert.match(get('objective').textContent,/하강/,'lift communicates travel direction');
const ridingY=renderedCamera.position.y;assert(ridingY<1.4&&ridingY>-2.4,'camera rides the moving cabin');
key('Escape');tick(2000);assert.equal(renderedCamera.position.y,ridingY,'pausing freezes the lift ride');get('resumeButton').click();tick(4500);
assert(Math.abs(renderedCamera.position.y+2.4)<.04,'parking floor uses the correct camera height');
walkTo(14.7,24.8);walkTo(22,24.8);walkTo(24,30.1);walkTo(26.95,30.15);
assert.equal(get('roomName').textContent,'2층 주차장','parking is reachable using actual controls');
key('KeyM');assert(!get('mapOverlay').classes.has('hidden'));key('KeyM');
lookAt(26.95,30.98);assert.match(get('promptText').textContent,/車|차키/);key('KeyE');tick(1100);assert.match(get('promptText').textContent,/운전석/);key('KeyE');tick(1800);
assert.equal(get('roomName').textContent,'내 차 · 2층 주차장');assert(Math.abs(renderedCamera.position.y+2.84)<.02,'camera fits the smaller vehicle interior');
assert(!get('vehicleStatus').classes.has('hidden'));assert(!renderedCamera.getObjectByName('equipped-baseball-bat').visible,'weapon is put away in car');
const seatX=renderedCamera.position.x;key('KeyW');tick(350);up('KeyW');assert.equal(renderedCamera.position.x,seatX,'seated player cannot walk through the car');
key('KeyE');tick(1800);assert(get('ending').classes.has('hidden'),'engine starts without interrupting driving');
get('driveCheckpointButton').click();tick(32);key('KeyE');tick(1800);
const carModel=renderedCamera.parent.getObjectByName('player-car'),route=[[44,32],[47,40],[47,54],[47,67],[47,74],[51,75],[55,75],[58,76],[60,80],[60.5,113]];
let waypoint=0;
const hold=(code,down)=>{if(down)key(code);else up(code);};
for(let t=0;t<150000&&waypoint<route.length;t+=64){
  const p=carModel.position,target=route[waypoint];if(Math.hypot(target[0]-p.x,target[1]-p.z)<1.35){waypoint++;continue;}
  const heading=Math.PI/2-carModel.rotation.y,want=Math.atan2(target[1]-p.z,target[0]-p.x),angle=Math.atan2(Math.sin(want-heading),Math.cos(want-heading));
  const speed=Number((get('vehicleStatus').textContent.match(/([0-9]+) km/)||[])[1]||0),limit=Math.abs(angle)>.35?4:7;
  hold('KeyA',angle<-.045);hold('KeyD',angle>.045);hold('KeyW',speed<limit);hold('Space',speed>limit+1);tick(64);
}
for(const code of ['KeyW','KeyA','KeyD'])up(code);key('Space');tick(900);up('Space');
console.log('Keyboard drive:',{waypoint,x:carModel.position.x,z:carModel.position.z,room:get('roomName').textContent,level:window.__testWorld.parking.state.level,block:window.__testWorld.parking.state.lastBlockReason,collider:window.__testWorld.parking.state.lastCollider,gate:window.__testWorld.streets.state});
assert.equal(waypoint,route.length,'actual keyboard steering descends the ramp and reaches the street');assert.match(get('roomName').textContent,/지족로364번길/);assert(get('ending').classes.has('hidden'),'street remains playable');
const stoppedX=carModel.position.x,stoppedZ=carModel.position.z;key('Escape');key('KeyW');tick(1200);up('KeyW');assert.equal(carModel.position.x,stoppedX);assert.equal(carModel.position.z,stoppedZ);get('resumeButton').click();tick(32);
key('KeyM');assert(!get('mapOverlay').classes.has('hidden'));key('KeyM');key('KeyE');tick(48);assert(get('vehicleStatus').classes.has('hidden'),'E exits a stopped vehicle');assert(!renderedCamera.getObjectByName('equipped-baseball-bat').visible,'missing GLTF assets do not show a primitive substitute outdoors');
document.exitPointerLock();
for(const request of [undefined,()=>{throw new Error('pointer lock unavailable');},()=>({catch(fn){fn(new Error('pointer lock denied'));}})]){
  get('view').requestPointerLock=request;get('checkpointButton').click();listeners.pointerlockerror();tick(32);
  assert(get('pause').classes.has('hidden'),'pointer lock failure does not pause the game');
  const beforeY=renderedCamera.rotation.y,beforeX=renderedCamera.rotation.x;
  listeners.mousemove({target:get('view'),clientX:400,clientY:200,movementX:0,movementY:0,buttons:0});
  listeners.mousemove({target:get('view'),clientX:430,clientY:220,buttons:0});tick(16);
  assert(renderedCamera.rotation.y<beforeY,'free mouse movement turns horizontally without dragging');
  assert(renderedCamera.rotation.x<beforeX,'client coordinates provide vertical movement when relative movement is absent');
  assert(Number.isFinite(renderedCamera.rotation.x)&&Number.isFinite(renderedCamera.rotation.y));
}
key('Escape');const pausedYaw=renderedCamera.rotation.y;
listeners.mousemove({target:get('view'),clientX:600,clientY:300,movementX:200,movementY:100,buttons:0});tick(32);
assert.equal(renderedCamera.rotation.y,pausedYaw,'mouse movement cannot rotate the view through a menu');
get('resumeButton').click();listeners.mousemove({target:get('view'),clientX:900,clientY:600,movementX:0,movementY:0,buttons:0});tick(16);
assert.equal(renderedCamera.rotation.y,pausedYaw,'resuming seeds the mouse position without jumping');
listeners.mousemove({target:get('view'),clientX:910,clientY:600,movementX:0,movementY:0,buttons:0});tick(16);
assert(renderedCamera.rotation.y<pausedYaw,'free mouse look resumes after closing the pause menu');
get('parkingCheckpointButton').click();tick(32);assert.match(get('objective').textContent,/이웃집/,'new checkpoint starts after combat with the next story objective');
get('driveCheckpointButton').click();tick(32);assert(!get('vehicleStatus').classes.has('hidden'));assert.match(get('objective').textContent,/시동/);
get('streetCheckpointButton').click();tick(32);assert.match(get('roomName').textContent,/지족로/);assert(!renderedCamera.layers.isEnabled(1),'street checkpoint hides the upper apartment');key('KeyM');tick(16);assert(!get('mapOverlay').classes.has('hidden'));key('KeyM');key('KeyE');tick(1800);assert.match(get('objective').textContent,/롯데마트/);
get('checkpointButton').click();tick(32);assert(renderedCamera.layers.isEnabled(1),'returning to the home checkpoint restores indoor geometry');
get('martCheckpointButton').click();tick(32);assert.match(get('roomName').textContent,/1층/);assert(renderedCamera.layers.isEnabled(2));assert(get('vehicleStatus').classes.has('hidden'));
walkTo(180.5,429);lookAt(180.5,427.8);assert.match(get('promptText').textContent,/B1/);key('KeyE');tick(4400);assert.match(get('roomName').textContent,/B1/);assert(Math.abs(renderedCamera.position.y+10.44)<.04,'basement eye height follows the travelator');
key('KeyM');assert(!get('mapOverlay').classes.has('hidden'));key('KeyM');walkTo(169.5,407.8);walkTo(186.5,407.8);lookAt(186.5,408.3);key('KeyE');tick(4400);assert.match(get('roomName').textContent,/1층/);
walkTo(183,432.5);lookAt(183,433.8);key('KeyE');tick(32);assert.match(get('roomName').textContent,/롯데마트 출입구/);
console.log('smoke passed: apartment/combat/dialogue/elevator, actual keyboard driving, map/mouse look, mart checkpoint, keyboard travelator ride, B1 exploration, upstairs return and exit');

get('photoTourButton').click();tick(32);assert.equal(get('roomName').textContent,'거실 · 주방');assert.match(get('progress').textContent,/0 \/ 6/);assert.equal(renderedCamera.fov,72);key('KeyM');assert.equal(get('mapTitle').textContent,'6층 602호 · 공용 복도');key('KeyM');get('startButton').click();tick(32);assert.equal(renderedCamera.fov,68);assert.equal(get('roomName').textContent,'안방');assert.match(get('chapterLabel').textContent,/6F 602호/);console.log('Photo tour and normal-start reset passed');

