const assert=require('assert'),runtime=require('./qa/runtime.cjs');
const {world,player,chapter,advance}=runtime(),actors=world.streetAI.actors;
world.collectibles.forEach(i=>i.got=true);
function reset(){chapter.reset({prepared:true,afterNeighbours:true});player.level='floor1';player.floorY=world.elevator.groundY;player.x=24;player.z=25;}
reset();assert.equal(actors.filter(a=>a.worker).length,3);assert.equal(actors.filter(a=>a.zone==='mart').length,10);
const starts=actors.map(a=>({x:a.zombie.root.position.x,z:a.zombie.root.position.z}));advance(10);
for(let i=0;i<3;i++){const a=actors[i],p=a.zombie.root.position;assert(Math.hypot(p.x-starts[i].x,p.z-starts[i].z)>.3,'worker '+i+' patrols');assert.equal(a.mode,'patrol');assert(world.isWalkable(p.x,p.z,.2,'floor1'));}
const a=actors[0],pos=a.zombie.root.position;player.x=pos.x-5;player.z=pos.z;const initial=Math.hypot(player.x-pos.x,player.z-pos.z);advance(1);assert.equal(a.mode,'chase');assert(Math.hypot(player.x-pos.x,player.z-pos.z)<initial-1,'approaching the worker triggers real pursuit');
advance(4);assert(chapter.state.health<100,'a worker reaches and attacks a stationary pedestrian');
player.level='floor2';const health=chapter.state.health;advance(2);assert.equal(chapter.state.health,health,'workers do not attack a different floor');assert.equal(a.mode,'patrol');
reset();player.x=50;player.z=53;advance(.8);assert.equal(actors[1].mode,'patrol','opaque facade blocks detection at short range');
reset();const p=world.parking;p.vehicle.root.position.set(60,world.elevator.groundY-p.y,96);Object.assign(p.state,{level:'floor1',inCar:true,engine:true});world.driving.reset();world.driving.syncRider();advance(9);
assert.equal(chapter.state.health,100,'closed car protects the occupant');assert(p.state.condition<100,'nearby worker attacks the body instead of reaching through the car');
reset();player.x=actors[0].spawn.x-1.45;player.z=actors[0].spawn.z;player.yaw=0;player.pitch=0;player.stamina=1;
for(let i=0;i<3;i++){assert(chapter.attack());advance(.72);}
assert.equal(actors[0].hp,0,'street infected can be defeated with the existing bat');assert(!world.streetAI.blocksPlayer(actors[0].zombie.root.position.x,actors[0].zombie.root.position.z),'corpse does not block walking');
console.log('Street AI passed: 3 patrols, proximity chase, pedestrian damage, wall/floor protection, vehicle protection/body damage and bat combat');
