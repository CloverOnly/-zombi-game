const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'..'),THREE=require(path.join(root,'three.min.js'));
const noop=()=>{},gradient=()=>({addColorStop:noop}),ctx=new Proxy({createLinearGradient:gradient,createRadialGradient:gradient},{get:(o,k)=>o[k]??noop});
const document={createElement:()=>({width:0,height:0,getContext:()=>ctx})},window={};
for(const n of ['surfaces','street-details','exterior','interior-polish','rooms','zombie','elevator','parking','mart-route','streets','driving','street-ai','hallway','mart-interior','photo-apartment','world'])vm.runInNewContext(fs.readFileSync(path.join(root,n+'.js'),'utf8'),{window,document,Math,console});
const world=window.createPoyuWorld(THREE,{capabilities:{getMaxAnisotropy:()=>8}}),player={yaw:Math.PI/2,pitch:0};
const car=world.parking,driving=window.createPoyuDriving({world,player}),p=car.vehicle.root.position;
Object.assign(car.state,{inCar:true,engine:true,level:'floor2',condition:100,boarding:0});p.set(47,0,54);car.vehicle.root.rotation.set(0,0,0);driving.reset();
const route=[[47,67],[47,74],[51,75],[55,75],[58,76],[60,80],[60,90]];
let waypoint=0,firstBlock=null,minCondition=100;
for(let t=0;t<100&&waypoint<route.length;t+=.02){
  const target=route[waypoint];if(Math.hypot(target[0]-p.x,target[1]-p.z)<1.1){waypoint++;continue;}
  const want=Math.atan2(target[1]-p.z,target[0]-p.x),angle=Math.atan2(Math.sin(want-driving.yaw),Math.cos(want-driving.yaw));
  const speed=Math.abs(car.state.speed)*3.6,limit=Math.abs(angle)>.35?4:7;
  world.streets.update(.02,t,car,true);driving.update(.02,{throttle:speed<limit?1:0,steer:Math.abs(angle)>.045?Math.sign(angle):0,brake:speed>limit+1});
  minCondition=Math.min(minCondition,car.state.condition);
  if(car.state.lastBlockReason&&!firstBlock)firstBlock={x:p.x,z:p.z,reason:car.state.lastBlockReason,collider:car.state.lastCollider};
}
console.log(JSON.stringify({waypoint,total:route.length,position:{x:p.x,z:p.z},level:car.state.level,minCondition,firstBlock,gate:world.streets.state},null,2));
assert.equal(waypoint,route.length,'car must descend, turn through the front entrance and join the street');
assert.equal(minCondition,100,'corrected route must not damage the car');
assert.equal(firstBlock,null,'corrected route must have tyre support and clear body space');
assert.equal(car.state.level,'floor1');
