const assert=require('assert'),runtime=require('./qa/runtime.cjs');
const {world,player,chapter,advance,THREE:T}=runtime();
world.collectibles.forEach(i=>i.got=true);
chapter.reset({prepared:true,streetCheckpoint:true});
assert.equal(player.level,'floor1');assert(world.parking.state.inCar);assert.equal(chapter.state.phase,'vehicle-ready');
assert(world.driving.canPlace(world.parking.vehicle.root.position.x,world.parking.vehicle.root.position.z,world.driving.yaw),'street checkpoint is clear of walls, kerbs and parked vehicles');
const cam=new T.PerspectiveCamera();world.updatePresentation(player,cam,.1);
assert(!cam.layers.isEnabled(1),'upper room meshes do not float over the ground-level street');
assert.equal(world.itemsById.phone.group.children[0].layers.mask,2,'interior is on the upper-floor render layer');
world.encounter.attachWeapon(cam);world.encounter.held.traverse(m=>{if(m.isMesh)assert(m.layers.test(cam.layers),'held weapon remains visible outside');});
world.updatePresentation({level:'floor4',x:3,z:3,floorY:0},cam,.1);assert(cam.layers.isEnabled(1),'interior comes back when returning upstairs');
const granite=world.streets.group.getObjectByName('metre-scaled-포유하우스 짙은 화강석 줄눈');assert(granite,'textured facade survives batching');
const p=granite.geometry.attributes.position,uv=granite.geometry.attributes.uv,idx=granite.geometry.index;
// The two tangent axes must preserve 1 texture period per 2.4 metres.
let checked=0;for(let n=0;n<idx.count&&checked<100;n+=3){const a=idx.getX(n),b=idx.getX(n+1),c=idx.getX(n+2),pa=new T.Vector3().fromBufferAttribute(p,a),pb=new T.Vector3().fromBufferAttribute(p,b),pc=new T.Vector3().fromBufferAttribute(p,c),normal=pb.clone().sub(pa).cross(pc.clone().sub(pa));if(normal.length()<.001)continue;for(const j of [b,c]){const distance=new T.Vector3().fromBufferAttribute(p,j).distanceTo(pa),texDistance=Math.hypot(uv.getX(j)-uv.getX(a),uv.getY(j)-uv.getY(a));assert(Math.abs(distance-texDistance*2.4)<.001,'facade tiles must not stretch with a whole building');checked++;}}
assert(checked>50);
for(const id of ['poyu','hospital','gs25','twosome'])assert(world.streets.landmarks.some(p=>p.id===id),'reference landmark '+id);
assert(world.streets.colliders.filter(c=>c.id==='street-parked-car').length>=18);
const lights=world.parking.vehicle.headlights;assert.equal(lights.length,2);chapter.interact('carIgnition');advance(1.8);assert(lights.every(l=>l.intensity>0),'ignition powers headlamps');
assert.equal(chapter.state.phase,'street');
const counts={meshes:0,instanced:0,triangles:0};world.scene.traverse(o=>{if(!o.isMesh)return;counts.meshes++;if(o.isInstancedMesh)counts.instanced++;counts.triangles+=(o.geometry.index?.count||o.geometry.attributes.position.count)/3*(o.isInstancedMesh?o.count:1);});
console.log('Reference detail passed: metre-scaled textures after batching, floor visibility, street checkpoint, landmarks, parked cars and working headlights',counts);
