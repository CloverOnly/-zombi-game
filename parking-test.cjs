const fs=require('fs'),vm=require('vm'),assert=require('assert'),THREE=require('./three.min.js');
const noop=()=>{},gradient=()=>({addColorStop:noop}),ctx=new Proxy({createLinearGradient:gradient,createRadialGradient:gradient},{get:(o,k)=>o[k]??noop});
const document={createElement:()=>({width:0,height:0,getContext:()=>ctx})},window={};
for(const n of ['surfaces','street-details','exterior','interior-polish','rooms','zombie','elevator','parking','mart-route','streets','driving','street-ai','hallway','mart-interior','photo-apartment','world','chapter'])vm.runInNewContext(fs.readFileSync(__dirname+'/'+n+'.js','utf8'),{window,document,Math,console});
const world=window.createPoyuWorld(THREE,{capabilities:{getMaxAnisotropy:()=>8}}),player={x:18,z:9,yaw:0,pitch:0,stamina:1};
let endings=0;const messages=[],cues=[],chapter=window.createPoyuChapter({world,player,onMessage:m=>messages.push(m),onCue:c=>cues.push(c),onComplete:()=>endings++});
const advance=s=>{for(let t=0;t<s;t+=.02)chapter.update(.02);};
world.collectibles.forEach(i=>i.got=true);chapter.reset({prepared:true,afterCombat:true});
assert.equal(chapter.state.phase,'survey');assert.equal(chapter.state.enemyHP,0);assert(chapter.state.hasBat);
player.x=8.85;player.z=24.8;chapter.interact('liftFloor2');assert.equal(world.elevator.state.mode,'idle','story cannot skip the neighbour survey');
assert(!chapter.interact('carUnlock'),'car cannot be used before the story reaches it');
// Start with 404, so the other two doors must still be inspected after the refusal.
chapter.interact('neighbour404');assert.equal(chapter.state.phase,'dialogue');assert.equal(chapter.state.visited.size,0);assert(chapter.movementLocked);assert(!chapter.attack());
const lines=[];while(chapter.dialogue){lines.push(chapter.dialogue.text);chapter.interact('dialogueNext');}
assert.equal(lines.length,5);assert(lines.some(s=>s.includes('문은 안 열')));assert(lines.some(s=>s.includes('2층')));
assert.equal(chapter.state.phase,'survey');assert(chapter.state.neighbourRefused);assert.equal(chapter.state.visited.size,1);assert.equal(endings,0);
chapter.interact('neighbour404');assert.equal(chapter.state.phase,'survey');assert.equal(chapter.state.notes.length,1,'repeat inspection does not repeat the conversation or note');
chapter.interact('neighbour403');chapter.interact('neighbour402');assert.equal(chapter.state.phase,'go-parking');assert.equal(chapter.state.notes.length,3);assert.equal(endings,0,'no ending at the neighbour door');
player.x=11.2;player.z=26.3;chapter.interact('liftCall');advance(1.1);player.x=8.85;player.z=24.8;
const buttons=chapter.getTargets().filter(t=>t.id.startsWith('liftFloor'));assert.equal(buttons.length,3);assert.equal(new Set(buttons.map(b=>b.z)).size,3,'each floor has its own aimable button');
chapter.interact('liftFloor2');advance(5.5);assert.equal(player.level,'floor2');assert.equal(player.floorY,world.parking.y);assert.equal(chapter.state.phase,'find-car');assert(chapter.state.parkingReached);
// Reachability checks include the lift, aisle and the actual driver-side approach.
function reachable(goal){const step=.2,q=[[44,124]],seen=new Set(['44,124']);for(let n=0;n<q.length;n++){const [i,j]=q[n];if(Math.hypot(i*step-goal[0],j*step-goal[1])<.3)return true;for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1]]){const x=i+di,z=j+dj,k=x+','+z;if(!seen.has(k)&&world.isWalkable(x*step,z*step,.25,'floor2')){seen.add(k);q.push([x,z]);}}}return false;}
for(const goal of [[14,25],[22,24.8],[26.95,30.15],[34.5,28],[18,36.5]])assert(reachable(goal),'garage route reachable: '+goal);
assert(!world.isWalkable(27.2,32,.25,'floor2'),'parked car is a solid obstacle');
player.x=26.95;player.z=30.15;player.yaw=Math.PI/2;
world.itemsById.carKey.got=false;chapter.interact('carUnlock');assert(!world.parking.state.unlocked,'a missing key blocks unlocking');assert.equal(chapter.state.phase,'find-car');
world.itemsById.carKey.got=true;chapter.interact('carUnlock');assert(world.parking.state.unlocked);chapter.interact('carEnter');assert(!world.parking.state.boarding,'door must finish opening');advance(1.1);
chapter.interact('carEnter');assert.equal(chapter.state.phase,'boarding');assert(chapter.movementLocked);advance(.7);assert(player.z>30.15&&player.z<world.parking.seat.z,'camera physically moves through the open door');assert(!chapter.interact('carIgnition'),'engine cannot start before sitting down');
advance(1.0);assert.equal(chapter.state.phase,'vehicle-ready');assert(world.parking.state.inCar&&player.inCar);assert.equal(player.x,world.parking.seat.x);assert.equal(player.z,world.parking.seat.z);assert(Math.abs(player.eyeHeight-.96)<.001);assert(!chapter.attack());
chapter.interact('carIgnition');assert.equal(chapter.state.phase,'starting-car');assert(world.parking.state.engine);assert.equal(endings,0);advance(1.8);assert.equal(chapter.state.phase,'drive-out');assert.equal(endings,0,'engine start continues into driving');
chapter.interact('carIgnition');advance(3);assert.equal(endings,0,'idling cannot skip the drive to street');assert(world.parking.state.opened<.01,'door closes after boarding');
for(const cue of ['knock','liftDing','carUnlock','carEnter','carDoorClose','engineStart'])assert(cues.includes(cue),'story cue: '+cue);
chapter.reset({prepared:true,afterCombat:true});assert.equal(chapter.state.phase,'survey');assert(!player.inCar);assert.equal(player.eyeHeight,1.4);assert(!world.parking.state.engine&&!world.parking.state.unlocked);assert.equal(chapter.state.visited.size,0);assert(!chapter.state.neighbourRefused);
console.log('Parking story passed: refusal in either inspection order, no early ending, separate floor buttons, garage routes, key and door checks, seat animation, engine, completion once and reset');
