const assert=require('assert'),runtime=require('./qa/runtime.cjs');const messages=[];
const {world,player}=runtime({onMessage:m=>messages.push(m)}),p=world.parking,d=world.driving,s=p.state;
const citySurface=world.driveSurface,cityColliders=world.getColliders;
// An unobstructed test road isolates the controls from the city and enemy AI.
let obstacles=[];world.getColliders=()=>obstacles;
world.driveSurface=(x,z)=>Math.abs(x)<2000&&Math.abs(z)<4.5?{level:'floor1',y:-7.6,slopeZ:0}:null;
function reset(x=0,z=0,h=0){p.vehicle.root.position.set(x,-3.8,z);p.vehicle.root.rotation.set(0,Math.PI/2-h,0);Object.assign(s,{level:'floor1',inCar:true,engine:true,condition:100,boarding:false});d.reset();d.syncRider();messages.length=0;}
function run(seconds,input,step=.02){for(let t=0;t<seconds-.00001;t+=step)d.update(step,input);}
reset();run(9,{throttle:1});assert.equal(d.speedKmh,100,'100 is the actual simulated speed, not a rescaled display');assert(Math.abs(s.speed-100/3.6)<1e-8);assert.equal(s.condition,100);assert.equal(messages.length,0);
const x=p.vehicle.root.position.x;run(.5,{});assert(d.speedKmh>97,'lifting the accelerator coasts smoothly');assert(p.vehicle.root.position.x>x+13);
run(.5,{throttle:-1});assert(s.speed>0,'S brakes forward motion before engaging reverse');run(4,{throttle:-1});assert(s.speed<0&&d.speedKmh<=15);run(.5,{brake:true});assert.equal(s.speed,0);
reset();s.speed=4;d.update(.02,{steer:1});assert(s.steering>0&&s.steering<.2,'wheel angle builds gradually');run(.1,{});assert(s.steering<.03,'wheel recentres on release');
reset();s.speed=100/3.6;run(.1,{steer:1});assert(Math.abs(d.yaw)<.06,'full keyboard steering stays stable at 100 km/h');
// Unsupported map edge is not a physical crash and never damages the body.
reset(0,2.8,Math.PI/2);assert(d.canPlace(0,2.8,Math.PI/2),'bumper overhang is supported by tyres');run(3,{throttle:1});assert.equal(s.lastBlockReason,'edge');assert.equal(s.condition,100);assert.equal(messages.length,0);
// A real, thin wall stops a car even at 100. Holding W does not repeat the message.
obstacles=[{minX:29.98,maxX:30.02,minZ:-4.5,maxZ:4.5,id:'thin-wall',kind:'wall'}];reset();s.speed=100/3.6;run(3,{throttle:1},.05);assert(p.vehicle.root.position.x<28.3);assert.equal(s.lastBlockReason,'obstacle');assert(s.condition<100);assert.equal(messages.length,1,'one warning for one continuous contact');
const health=s.condition;run(3,{throttle:1});assert.equal(s.condition,health);assert.equal(messages.length,1);run(2,{throttle:-1});assert(p.vehicle.root.position.x<26,'the car reverses away instead of sticking');
// An angled parked car must not block the empty corners of its enclosing rectangle.
obstacles=[{minX:17.949,minZ:-2.051,maxX:22.051,maxZ:2.051,heading:Math.PI/4,length:4,width:1.8,id:'angled-car',kind:'furniture'}];reset();assert(d.canPlace(16.4,2.7,0),'empty corner of parked-car bounds is passable');assert(!d.canPlace(20,0,0),'the actual angled body still blocks the car');
// Repeat acceleration on the actual boulevard, with all city colliders enabled.
world.driveSurface=citySurface;world.getColliders=cityColliders;reset(86,365,Math.PI/2);run(7,{throttle:1});assert.equal(d.speedKmh,100,'the real map provides enough clear road to reach 100');assert.equal(s.condition,100);assert.equal(messages.length,0,'clear boulevard produces no impact warnings');
console.log('Driving controls passed: true 100 km/h, coasting/brake/reverse, smoothed speed-sensitive steering, tyre support, no false edge impact, swept wall contact, warning debounce and recovery.');
