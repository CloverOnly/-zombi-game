const fs=require('fs'),vm=require('vm'),assert=require('assert');
const THREE=require('./three.min.js');
const textDrawn=[];
const ctx=new Proxy({createLinearGradient(){return {addColorStop(){}};},createRadialGradient(){return {addColorStop(){}};},fillText(value){textDrawn.push(value);}},{get:(o,k)=>o[k]??(()=>{})});
const document={createElement(){return {width:0,height:0,getContext(){return ctx;}};}};
const window={};
vm.runInNewContext(fs.readFileSync(__dirname+'/exterior.js','utf8'),{window,document,Math,console});
vm.runInNewContext(fs.readFileSync(__dirname+'/interior-polish.js','utf8'),{window,document,Math,console});
vm.runInNewContext(fs.readFileSync(__dirname+'/rooms.js','utf8'),{window,document,Math,console});
for(const n of ['surfaces','street-details','zombie','elevator','parking','mart-route','streets','driving','street-ai'])vm.runInNewContext(fs.readFileSync(__dirname+'/'+n+'.js','utf8'),{window,document,Math,console});
vm.runInNewContext(fs.readFileSync(__dirname+'/hallway.js','utf8'),{window,document,Math,console});
vm.runInNewContext(fs.readFileSync(__dirname+'/mart-interior.js','utf8'),{window,document,Math,console});
vm.runInNewContext(fs.readFileSync(__dirname+'/photo-apartment.js','utf8'),{window,document,Math,console});
vm.runInNewContext(fs.readFileSync(__dirname+'/world.js','utf8'),{window,document,Math,console});
const world=window.createPoyuWorld(THREE,{capabilities:{getMaxAnisotropy(){return 8;}}});
world.updateTV(1);
assert(textDrawn.includes('긴급 뉴스 속보'),'TV must show animated breaking news');
assert.equal(world.collectibles.length,6);
assert(world.colliders.length>10);
assert(world.scene.children.length>90);
for(const x of world.collectibles)assert(world.scene.getObjectById(x.group.id)===x.group);
const overlap=(a,b)=>({x:Math.min(a.maxX,b.maxX)-Math.max(a.minX,b.minX),z:Math.min(a.maxZ,b.maxZ)-Math.max(a.minZ,b.minZ)});
for(let i=0;i<world.placements.length;i++)for(let j=i+1;j<world.placements.length;j++){
  const a=world.placements[i],b=world.placements[j],o=overlap(a,b);
  assert(!(o.x>.01&&o.z>.01),`${a.id} must not intersect ${b.id}`);
}
for(const a of world.placements)for(const b of world.colliders.filter(x=>x.kind==='wall')){
  const o=overlap(a,b);assert(!(o.x>.011&&o.z>.011),`${a.id} must not enter a wall or doorway`);
}
assert(world.hasWallBetween(8.8,-2.5,9.4,-2.5),'master/bathroom partition blocks interaction');
assert(!world.hasWallBetween(8.7,-1.25,9.6,-1.25),'master doorway stays open');
assert(world.hasWallBetween(13.8,6.7,13.8,7.4),'kitchen and foyer have a partition');
assert(!world.hasWallBetween(12.1,8.4,12.8,8.4),'foyer opening stays clear');
assert.equal(world.getRoomName(world.itemsById.jacket.x,world.itemsById.jacket.z),'현관','coat belongs in the foyer');
assert.equal(world.getRoomName(world.itemsById.carKey.x,world.itemsById.carKey.z),'현관','car key belongs in the foyer');
assert.equal(world.getRoomName(world.itemsById.food.x,world.itemsById.food.z),'거실 · 주방','food belongs in the shared living and kitchen area');
assert.equal(world.rooms.filter(r=>r.kind==='bedroom').length,3,'apartment has three rooms');
assert.equal(world.rooms.filter(r=>r.kind==='bathroom').length,2,'user confirmed both bathrooms are real');
assert(world.scene.getObjectByName('entry-full-length-mirror'),'photo mirror exists');
assert(world.scene.getObjectByName('living-full-height-curtain'),'photo curtain exists');
assert(world.scene.getObjectByName('photo-entry-full-height-cabinet'),'full-height storage exists');
assert(world.environment&&world.environment.cars.length===4,'3D outdoor cars are created');
const env=world.environment,carZ=env.cars[0].mesh.position.z,cloudX=env.clouds[0].mesh.position.x;
world.updateEnvironment(10.3);
assert.notEqual(env.cars[0].mesh.position.z,carZ,'traffic moves');
assert.notEqual(env.clouds[0].mesh.position.x,cloudX,'clouds move independently');
assert(Math.abs(env.trees[0].crown.rotation.z)>.00001,'trees sway');
assert(env.stats.staticMeshesCombined>400&&env.stats.batches<12,'static exterior geometry is batched');
const free=(x,z)=>{const r=.25,b=world.bounds;if(x<b.minX+r||x>b.maxX-r||z<b.minZ+r||z>b.maxZ-r||!world.containsFloor(x,z))return false;return !world.colliders.some(c=>c.enabled!==false&&x+r>c.minX&&x-r<c.maxX&&z+r>c.minZ&&z-r<c.maxZ);};
const step=.1,key=(i,j)=>i+','+j,queue=[[81,-10]],seen=new Set([key(81,-10)]);
for(let n=0;n<queue.length;n++){const [i,j]=queue[n];for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1]]){const a=i+di,b=j+dj,k=key(a,b);if(!seen.has(k)&&free(a*step,b*step)){seen.add(k);queue.push([a,b]);}}}
for(const item of world.collectibles){const reached=queue.some(([i,j])=>Math.hypot(i*step-item.x,j*step-item.z)<1.35&&!world.hasWallBetween(i*step,j*step,item.x,item.z));assert(reached,`${item.id} must be reachable`);}
assert(queue.some(([i,j])=>Math.hypot(i*step-15.93,j*step-10.80)<1.6),'front door must be reachable');
assert(seen.has(key(150,84)),'entry approach is reachable through the foyer doorway');
assert(!world.containsFloor(11.7,10),'between separate rooms is not a ghost floor');
for(const room of world.rooms.filter(r=>r.kind==='bedroom'||r.kind==='bathroom'))assert(queue.some(([i,j])=>Math.hypot(i*step-room.entry.x,j*step-room.entry.z)<.22),`${room.name} doorway is reachable`);
for(const [x,z] of [[8.65,-1.25],[9.6,-3.4],[11.7,-1.25],[5.5,9],[9.7,8.95],[2.9,3.7]])assert(seen.has(key(Math.round(x/step),Math.round(z/step))),'new room interior is reachable: '+[x,z]);
console.log('3D world passed: 3 rooms, 2 bathrooms, open living/kitchen, clear furniture, reachable items and animated exterior');

for(const v of [world.referenceView,...Object.values(world.apartment.photoViews)])assert(world.isWalkable(v.x,v.z),'camera spawn is walkable');
world.homeDoor.setOpen(true);world.homeDoor.update(1);
for(let x=14.6;x<=17;x+=.05)assert(world.isWalkable(x,10.80),'open front door is passable');
const cabinet=world.encounter.cabinet;cabinet.setOpen(true);cabinet.update(1,false);
assert(world.isWalkable(14.3,10.6),'cabinet approach stays clear when opened');
assert(!world.hasWallBetween(14.3,10.6,cabinet.batPoint.x,cabinet.batPoint.z),'bat stays in line of sight');
console.log('Photo layout: all viewpoints, every pickup, bedroom/bath entries, open front door and cabinet approach checked');

const door=id=>world.doorways.find(d=>d.id===id);
assert.equal(door('ensuite-bathroom').x,door('master-bedroom').x,'upper bathroom connects on the master-room side');
assert(door('rear-small-bedroom').x>door('master-bedroom').x,'rear small room lies right of master');
assert(world.hasWallBetween(6.2,6.4,6.2,7.4),'confirmed sofa-back wall exists');
const view=world.apartment.photoViews.bathroom;
for(const p of [world.apartment.anchors.tv,world.apartment.anchors.fridge,world.apartment.anchors.dining,{x:10.1,z:-1.2}])assert(!world.hasWallBetween(view.x,view.z,p.x,p.z),'lower bathroom sees the open living/kitchen and rear vestibule');
for(let z=.3;z<9;z+=.1)assert(world.isWalkable(9.7,z),'direct central path out of bathroom stays open');
console.log('User plan passed: 3 bedrooms, 2 distinct bathrooms, upper vestibule, left balcony, sofa wall, all pickups and entrance reachable');

assert.equal(door('front-small-bedroom').axis,'x','lower small room enters directly from its right side');assert.equal(door('front-small-bedroom').x,8.3);assert.equal(world.getRoomName(5.5,7.8),'작은방 2','old added corridor is part of the room');assert.equal(world.getRoomName(9.0,7.8),'거실 · 주방','door opens into living area');assert(!world.hasWallBetween(9.0,7.8,7.85,7.8),'direct small-room door is open');assert(world.hasWallBetween(5.5,6.7,5.5,7.5),'small room shares the sofa wall');console.log('Lower small room: no front corridor, side entry directly from living, original furniture positions retained.');

assert(world.scene.getObjectByName('balcony-window-1'));assert(world.scene.getObjectByName('balcony-window-2'));for(let z=.5;z<11.3;z+=.1)assert(world.isWalkable(2.9,z),'one balcony connects both exterior windows');assert(world.apartment.anchors.upperStorage.z<world.homeDoor.point.z);assert(world.apartment.anchors.storage.z>world.homeDoor.point.z);assert.equal(world.homeDoor.point.z,10.8,'door is above the lower shoe cabinet');
cabinet.update(1,true);world.homeDoor.update(1);for(let x=14.6;x<17;x+=.05)assert(world.isWalkable(x,10.8),'bat pickup closes shoe cabinet and leaves the relocated exit clear');console.log('Two window assemblies, continuous balcony, right-side lower entrance, separate cabinets and exit access passed');
