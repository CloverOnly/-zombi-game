const fs=require('fs'),vm=require('vm'),assert=require('assert'),THREE=require('./three.min.js');
const noop=()=>{},gradient=()=>({addColorStop:noop}),ctx=new Proxy({createLinearGradient:gradient,createRadialGradient:gradient},{get:(o,k)=>o[k]??noop});
const document={createElement:()=>({width:0,height:0,getContext:()=>ctx})},window={};
for(const n of ['surfaces','street-details','exterior','interior-polish','rooms','zombie','elevator','parking','mart-route','streets','driving','street-ai','hallway','mart-interior','photo-apartment','world','chapter'])vm.runInNewContext(fs.readFileSync(__dirname+'/'+n+'.js','utf8'),{window,document,Math,console});
const world=window.createPoyuWorld(THREE,{capabilities:{getMaxAnisotropy:()=>8}}),player={x:15.02,z:8.33,yaw:0,pitch:0,stamina:1};
const chapter=window.createPoyuChapter({world,player}),lift=world.elevator,enemy=world.encounter.zombie.root;
const advance=s=>{for(let t=0;t<s;t+=.02)chapter.update(.02);};
function armed(){world.collectibles.forEach(i=>i.got=true);player.stamina=1;chapter.reset({prepared:true,armed:true,spawnDoor:true});}
// Regression: opening the door and standing still must provoke an autonomous attack.
armed();chapter.interact('homeDoor');advance(4.0);
assert.equal(chapter.state.phase,'combat');assert(chapter.state.health<100,'enemy reaches and damages a player standing INSIDE the open threshold');
assert(enemy.position.x<16.34,'enemy is no longer imprisoned in the old corridor bounds');
console.log('Autonomous attack:',{health:chapter.state.health,enemyX:enemy.position.x.toFixed(2)});
// No manual placement of the enemy: walk away down the long corridor.
armed();chapter.interact('homeDoor');advance(.8);player.x=34;player.z=10.8;
advance(16);assert(enemy.position.x>29,'enemy follows toward the far end of the corridor');
assert(world.isWalkable(enemy.position.x,enemy.position.z,.27),'enemy path remains on walkable floor');
player.x=18.3;player.z=10.8;advance(9);assert(enemy.position.x<27,'enemy returns through the corridor toward 602');
console.log('Extended pursuit:',{x:enemy.position.x.toFixed(2),z:enemy.position.z.toFixed(2)});
// Returning behind a closed door blocks both path and damage.
armed();chapter.interact('homeDoor');advance(.8);world.homeDoor.setOpen(false);player.x=world.homeDoor.approach.x;player.z=world.homeDoor.approach.z;advance(8);
assert.equal(chapter.state.health,100,'closed entrance stops attacks');
assert(enemy.position.x>16.2,'closed door blocks the pursuer');
// Keep the enemy upstairs: neither collisions nor damage leak to a different level.
world.homeDoor.setOpen(true);advance(.7);player.level='floor1';player.floorY=-7.6;const health=chapter.state.health;advance(5);assert.equal(chapter.state.health,health,'upstairs enemy cannot hit downstairs player');
// Test the lift without a nearby enemy.
armed();enemy.visible=false;player.x=27.25;player.z=19;
assert(chapter.interact('liftCall'));advance(.9);assert(lift.state.opened>.98);assert.equal(lift.landings.floor4.gate.enabled,false);
// Flood fill verifies all new spaces can actually be reached, including corners.
function reachable(start,goal,level){const step=.2,q=[start.map(v=>Math.round(v/step))],seen=new Set([q[0].join(',')]);for(let n=0;n<q.length;n++){const [i,j]=q[n];if(Math.hypot(i*step-goal[0],j*step-goal[1])<.3)return true;for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1]]){const x=i+di,z=j+dj,k=x+','+z;if(!seen.has(k)&&world.isWalkable(x*step,z*step,.25,level)){seen.add(k);q.push([x,z]);}}}return false;}
world.homeDoor.setOpen(true);advance(.7);
for(const goal of [[34.7,10.5],[18.5,11.9],[27.25,19],[28.7,21.55]])assert(reachable([world.homeDoor.approach.x,world.homeDoor.approach.z],goal,'floor4'),'photo upper floor is reachable: '+goal);
player.x=28.7;player.z=21.55;assert(chapter.interact('liftFloor1'));advance(1.4);
assert.equal(player.level,'riding');assert(chapter.movementLocked,'passenger stays in cabin while it moves');assert(player.floorY<0&&player.floorY>-7.6);
advance(4);assert.equal(player.level,'floor1');assert.equal(player.floorY,-7.6);assert.equal(lift.cabin.position.y,-7.6);assert(lift.state.opened>.95);
assert(lift.landings.floor4.gate.enabled,'empty upper shaft remains sealed');assert.equal(lift.landings.floor1.gate.enabled,false);
assert(world.isWalkable(8.85,24.8,.25,'floor1'));assert(reachable([8.85,24.8],[14,25],'floor1'));
player.x=14.7;player.z=24.8;assert(chapter.interact('groundEntry'));advance(.9);
for(const goal of [[18,25],[18,20.2],[18,33.4],[21.5,26],[60,24.8]])assert(reachable([14.7,24.8],goal,'floor1'),'courtyard and street are reachable: '+goal);
// The lift cannot depart with the player or an enemy crossing its doors.
player.x=9.9;player.z=24.8;chapter.interact('liftFloor4');assert.equal(lift.state.mode,'idle','threshold is protected');
player.x=8.85;chapter.interact('liftFloor4');advance(5.5);assert.equal(player.level,'floor4');assert.equal(player.floorY,0);assert(lift.state.opened>.95);
assert(Math.abs(player.x-28.7)<.001&&Math.abs(player.z-21.55)<.001,'returning passenger reaches the relocated upper cabin');
// Call an empty cabin from the other floor, then board it normally.
chapter.interact('liftFloor1');advance(5.5);assert.equal(player.level,'floor1');
player.x=27.25;player.z=19;player.level='floor4';player.floorY=0;chapter.interact('liftCall');advance(5.5);
assert.equal(lift.state.level,'floor4');assert.equal(player.level,'floor4');assert(lift.state.opened>.95,'empty cabin arrives and opens at called floor');
chapter.reset({prepared:true,spawnDoor:true});assert.equal(player.level,'floor4');assert.equal(lift.cabin.position.y,0);assert.equal(lift.state.opened,0);
// Finite articulated model in every animation state, including the falling body.
const z=world.encounter.zombie;for(const pose of [[0,false,0,false,0],[1,true,.7,false,0],[2,false,0,true,.8]]){z.pose(...pose);world.scene.updateMatrixWorld(true);z.root.traverse(o=>{assert(o.matrixWorld.elements.every(Number.isFinite),'model transform stays finite');});}
console.log('Elevator passed: autonomous attacks, long pursuit, wall/floor protection, all new routes, ride/return/call, door obstruction and reset');
