const assert=require('assert'),runtime=require('./qa/runtime.cjs');const {world,player,chapter,advance}=runtime();
const mart=world.streetAI.actors.filter(a=>a.zone==='mart');assert.equal(mart.length,10);
world.collectibles.forEach(i=>i.got=true);chapter.reset({prepared:true,afterNeighbours:true});
for(const a of mart){assert(world.isWalkable(a.spawn.x,a.spawn.z,.24,'floor1'),'mart spawn has a clear ground surface '+a.id);for(const [x,z] of a.patrol)assert(world.isWalkable(x,z,.24,'floor1'),'patrol point is on accessible ground '+a.id);}
// Nearby observer on another floor keeps every mart patrol active without aggro.
Object.assign(player,{x:210,z:400,level:'floor2'});const starts=mart.map(a=>a.zombie.root.position.clone());advance(12);
for(const [i,a] of mart.entries()){const p=a.zombie.root.position;assert(Math.hypot(p.x-starts[i].x,p.z-starts[i].z)>.12,'mart actor patrols '+a.id);assert.equal(a.mode,'patrol');const floor=world.footSurface(p.x,p.z,'floor1');assert(Math.abs(p.y-(floor.y-world.elevator.groundY))<.00001,'height follows ground without accumulation '+a.id);}
// Entrance pedestrian is seen, pursued, and attacked using the same combat system.
chapter.reset({prepared:true,afterNeighbours:true});const a=mart[0];Object.assign(player,{x:a.spawn.x+5,z:a.spawn.z+2,level:'floor1',floorY:world.elevator.groundY+.13});const start=a.zombie.root.position.distanceTo({x:player.x,y:a.zombie.root.position.y,z:player.z});advance(1);assert.equal(a.mode,'chase');assert(Math.hypot(a.zombie.root.position.x-player.x,a.zombie.root.position.z-player.z)<start);advance(5);assert(chapter.state.health<100,'mart enemies can attack a pedestrian');
const health=chapter.state.health;player.level='floor2';advance(1);assert.equal(chapter.state.health,health,'floor separation also holds at the mart');
// Far actors stop costly path finding and become active again on approach.
Object.assign(player,{x:20,z:25,level:'floor1'});advance(.1);assert(mart.every(a=>!a.zombie.root.visible));Object.assign(player,{x:183,z:454,level:'floor1'});advance(.1);assert(mart.some(a=>a.zombie.root.visible));
chapter.reset({prepared:true,streetCheckpoint:true});for(const a of mart){assert.equal(a.hp,3);assert.equal(a.zombie.root.position.x,a.spawn.x);assert.equal(a.zombie.root.position.z,a.spawn.z);}
console.log('Mart infected passed: ten clear spawns/patrols, stable ground height, approach detection, pursuit/damage, floor separation, distance activation and reset.');
