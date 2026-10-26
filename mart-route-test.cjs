const assert=require('assert'),runtime=require('./qa/runtime.cjs');
const {world,player,chapter,advance}=runtime(),p=world.parking,d=world.driving,j=world.streets.journey;
world.collectibles.forEach(i=>i.got=true);chapter.reset({prepared:true,streetCheckpoint:true});
// The public checkpoint faces the route; all subsequent motion uses ordinary inputs.
chapter.interact('carIgnition');advance(1.8);
assert.equal(world.streets.colliders.filter(c=>c.kind==='wreck').length,3);
for(let x=81.5;x<90.5;x+=.35)assert(!d.canPlace(x,234,Math.PI/2),'pile-up must close the entire southbound carriageway');
assert(d.canPlace(96,234,Math.PI/2),'opposite carriageway is a real usable detour');
assert(!world.driveSurface(155,273,'floor1'),'diagonal road AABB does not create invisible pavement in the park');
const waypoints=j.route.slice(1);let index=0;
let stalled=0;for(let t=0;t<280&&index<waypoints.length;t+=.02){
  const pos=p.vehicle.root.position,target=waypoints[index],distance=Math.hypot(target.x-pos.x,target.z-pos.z);
  if(distance<1.3){index++;continue;}
  const want=Math.atan2(target.z-pos.z,target.x-pos.x),err=Math.atan2(Math.sin(want-d.yaw),Math.cos(want-d.yaw));
  const limit=Math.abs(err)>.22?1.65:4.4;
  stalled=p.state.speed===0?stalled+.02:0;if(stalled>3)break;
  chapter.update(.02,{throttle:p.state.speed<limit?1:0,steer:Math.max(-1,Math.min(1,err*1.8)),brake:p.state.speed>limit+.18});
}
console.log('Mart route driving:',{reached:index,total:waypoints.length,x:p.vehicle.root.position.x,z:p.vehicle.root.position.z,condition:p.state.condition,phase:chapter.state.phase});
if(index<waypoints.length){const pos=p.vehicle.root.position;console.log('Blocked at',waypoints[index],world.getColliders('floor1').filter(c=>Math.hypot((c.minX+c.maxX)/2-pos.x,(c.minZ+c.maxZ)/2-pos.z)<8));}
assert.equal(index,waypoints.length,'the actual steering model must reach the mart without teleportation');
assert(chapter.state.crashSeen);assert(chapter.state.martReached);assert(!chapter.state.martVisited);
advance(.8,{brake:true});assert(chapter.interact('carExit'));assert(!p.state.inCar);
// Verify the final pedestrian approach independently from driving.
for(let z=450;z>=438;z-=.4)assert(world.isWalkable(183,z,.25,'floor1'),'clear pedestrian approach to the door');
player.x=183;player.z=438;assert(chapter.getTargets().some(t=>t.id==='martEntrance'));assert(chapter.interact('martEntrance'));assert(chapter.state.martVisited);
chapter.reset({prepared:true,streetCheckpoint:true});assert(!chapter.state.crashSeen&&!chapter.state.martReached&&!chapter.state.martVisited,'retry clears chapter two progress');
console.log('Chapter 2 passed: road geometry, physical blockade, actual driving detour, arrival, safe exit, pedestrian approach, door interaction and reset.');
