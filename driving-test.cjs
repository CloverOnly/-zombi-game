const assert=require('assert'),runtime=require('./qa/runtime.cjs');let milestones=0;
const {world,player,chapter,advance}=runtime({onComplete:()=>milestones++}),p=world.parking,drive=world.driving;
world.collectibles.forEach(i=>i.got=true);
function start(){chapter.reset({prepared:true,driveCheckpoint:true});chapter.interact('carIgnition');advance(1.8);}
start();assert.equal(chapter.state.phase,'drive-out','engine starts without ending play');assert(Math.abs(drive.dimensions.length-3.552)<.001);assert(p.vehicle.root.scale.x===.8);assert.equal(world.getBounds('floor2').maxX,52);
assert(!drive.canPlace(51,32,0),'oriented body cannot cross the garage wall');
advance(9,{throttle:1});assert(p.vehicle.root.position.x<50.3,'holding acceleration stops at the wall');assert(p.state.condition<100,'a fast collision damages the body');assert.equal(p.state.speed,0);
const wallX=p.vehicle.root.position.x;advance(1.5,{throttle:-1});assert(p.vehicle.root.position.x<wallX-1,'reverse backs away from collision');advance(.8,{brake:true});assert.equal(p.state.speed,0);
start();
const waypoints=[[44,32],[47,40],[47,54],[47,74],[47,89],[52,94],[59.3,94],[60.5,113]];
let index=0,minY=0,wasRamp=false,wasGround=false,samples=0,gateOpened=false;
for(let t=0;t<110&&index<waypoints.length;t+=.02){
  const pos=p.vehicle.root.position,target=waypoints[index],d=Math.hypot(target[0]-pos.x,target[1]-pos.z);
  if(d<1.2){index++;continue;}
  const want=Math.atan2(target[1]-pos.z,target[0]-pos.x),error=Math.atan2(Math.sin(want-drive.yaw),Math.cos(want-drive.yaw));
  const limit=Math.abs(error)>.25?1.5:p.state.level==='ramp'?2.6:3.5;
  chapter.update(.02,{throttle:p.state.speed<limit?1:0,steer:Math.max(-1,Math.min(1,error*1.8)),brake:p.state.speed>limit+.2});
  if(p.state.level==='ramp'){wasRamp=true;samples++;const s=world.streets.rampSurface(pos.x,pos.z);assert(s);assert(Math.abs((pos.y+p.y)-s.y)<.001,'car follows the slope height');minY=Math.min(minY,pos.y);if(pos.z>79&&world.streets.state.gateOpen>.94)gateOpened=true;}
  if(p.state.level==='floor1')wasGround=true;
}
console.log('Driven route:',{index,x:p.vehicle.root.position.x.toFixed(2),z:p.vehicle.root.position.z.toFixed(2),level:p.state.level,condition:p.state.condition});
assert.equal(index,waypoints.length,'actual throttle and steering reach the street route');assert(wasRamp&&samples>50&&wasGround);assert(minY<-3,'height changes continuously down the ramp');assert(gateOpened,'barrier opens before the car arrives');assert(chapter.state.groundReached);assert.equal(milestones,1);
advance(.8,{brake:true});assert.equal(p.state.speed,0);const yaw=drive.yaw;advance(.4,{steer:1,brake:true});assert.equal(drive.yaw,yaw,'steering at rest does not spin the whole car');
assert(chapter.interact('carExit'));assert(!p.state.inCar);assert.equal(player.level,'floor1');assert.equal(player.eyeHeight,1.4);assert(world.isWalkable(player.x,player.z,.25,'floor1'),'safe exit is outside the body');
advance(1.0);chapter.interact('carEnter');advance(1.7);assert(p.state.inCar,'car can be re-entered at its new street location');
chapter.reset({prepared:true,driveCheckpoint:true});assert.equal(p.state.condition,100);assert.equal(p.state.level,'floor2');assert.equal(p.vehicle.root.position.z,32);assert.equal(milestones,1);
console.log('Driving passed: smaller car, larger deck, collision/reverse/brake, actual steering down ramp to street, barrier, safe exit/re-entry and reset');
