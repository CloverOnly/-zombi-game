const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),THREE=require('../three.min.js');
const root=path.resolve(__dirname,'..'),noop=()=>{},gradient=()=>({addColorStop:noop}),ctx=new Proxy({createLinearGradient:gradient,createRadialGradient:gradient},{get:(o,k)=>o[k]??noop});
const document={createElement:()=>({width:0,height:0,getContext:()=>ctx})},window={THREE};
const context={window,self:window,document,Math,console,TextDecoder,TextEncoder,URL,Blob,ArrayBuffer,Uint8Array};
for(const n of ['assets/vendor/gltf-loader','surfaces','street-details','exterior','interior-polish','rooms','zombie','elevator','parking','mart-route','streets','driving','street-ai','hallway','mart-interior','photo-apartment','world','vehicle-upgrade'])vm.runInNewContext(fs.readFileSync(path.join(root,n+'.js'),'utf8'),context);
const RealLoader=window.PoyuGLTFLoader;
// Geometry/controller test only. Image decoding is verified separately in Chrome.
window.PoyuGLTFLoader=class extends RealLoader {loadAsync(){this.register(()=>({name:'NodeFixtureTextures',loadTexture:()=>Promise.resolve(new THREE.Texture())}));const b=fs.readFileSync(path.join(root,'assets/models/vehicles/sedan/white-four-door-sedan.glb'));return new Promise((resolve,reject)=>this.parse(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'',resolve,reject));}};
(async()=>{const world=window.createPoyuWorld(THREE,{capabilities:{getMaxAnisotropy:()=>8}}),status=await window.installPoyuVehicles(THREE,world);assert(status.loaded,JSON.stringify(status));assert(status.driverDoor);assert(status.parked>=20);
  const car=world.parking,door=car.vehicle.door,part=door.children.find(c=>c.visible),center=()=>{world.scene.updateMatrixWorld(true);return new THREE.Box3().setFromObject(part).getCenter(new THREE.Vector3());};
  const before=center();car.state.targetOpen=1;const player={};for(let i=0;i<120;i++)car.update(.02,player);assert(before.distanceTo(center())>.2,'downloaded door panel must move with the existing door controller');
  car.state.targetOpen=0;for(let i=0;i<120;i++)car.update(.02,player);assert(Math.abs(door.rotation.y)<.001);
  const eye=car.vehicle.driverSeatLocal;world.scene.updateMatrixWorld(true);const origin=car.point(eye.x,eye.y,eye.z),direction=new THREE.Vector3(0,0,1).transformDirection(car.vehicle.root.matrixWorld),ray=new THREE.Raycaster(origin,direction,0,3);
  const visible=o=>{for(let p=o;p;p=p.parent)if(!p.visible)return false;return true;};const hits=ray.intersectObject(car.vehicle.root,true).filter(h=>visible(h.object));
  assert(hits.length,'driver must see the downloaded windshield');assert(hits[0].distance>.10,'driver eye must clear the seat and nearby shell');
  world.scene.getObjectByName('licensed-player-sedan').traverse(o=>{if(o.isMesh)assert.equal(o.geometry.attributes.uv.count,o.geometry.attributes.position.count,'replacement must preserve UV coordinates');});
  const driver={yaw:Math.PI/2,pitch:0},driving=window.createPoyuDriving({world,player:driver}),position=car.vehicle.root.position;
  Object.assign(car.state,{inCar:true,engine:true,level:'floor2',condition:100,boarding:0});position.set(47,0,54);car.vehicle.root.rotation.set(0,0,0);driving.reset();
  const route=[[47,67],[47,74],[51,75],[55,75],[58,76],[60,80],[60,90]];let waypoint=0;
  for(let t=0;t<100&&waypoint<route.length;t+=.02){const target=route[waypoint];if(Math.hypot(target[0]-position.x,target[1]-position.z)<1.1){waypoint++;continue;}const angle=Math.atan2(Math.sin(Math.atan2(target[1]-position.z,target[0]-position.x)-driving.yaw),Math.cos(Math.atan2(target[1]-position.z,target[0]-position.x)-driving.yaw)),speed=Math.abs(car.state.speed)*3.6,limit=Math.abs(angle)>.35?4:7;world.streets.update(.02,t,car,true);driving.update(.02,{throttle:speed<limit?1:0,steer:Math.abs(angle)>.045?Math.sign(angle):0,brake:speed>limit+1});assert.equal(car.state.lastBlockReason,null);}
  assert.equal(waypoint,route.length);assert.equal(car.state.condition,100);assert.equal(car.state.level,'floor1');
  console.log(JSON.stringify({status,doorMotion:true,forwardHits:hits.slice(0,4).map(h=>({distance:h.distance,material:h.object.material.name})),eye},null,2));
})().catch(error=>{console.error(error);process.exitCode=1;});
