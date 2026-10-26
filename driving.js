/* Metres/seconds internally. Smoothed steering, swept contacts and a 100 km/h road limit. */
window.createPoyuDriving=function createPoyuDriving({world,player,onMessage=()=>{},onCue=()=>{}}){
  const car=world.parking,v=car.vehicle.root,s=car.state,L=4.44*.8/2,W=1.76*.8/2,wheelbase=1.85;
  const roadLimit=100/3.6,garageLimit=15/3.6,rampLimit=12/3.6,reverseLimit=15/3.6;
  let yaw=0,pitch=0,steering=0,contact=null,clearTravel=0;
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  const toward=(value,target,amount)=>value<target?Math.min(target,value+amount):Math.max(target,value-amount);
  function overlap(x,z,h,c){
    const cx=(c.minX+c.maxX)/2,cz=(c.minZ+c.maxZ)/2,dx=x-cx,dz=z-cz,co=Math.cos(h),si=Math.sin(h);
    const angle=c.heading||0,ca=Math.cos(angle),sa=Math.sin(angle),oriented=Number.isFinite(c.heading);
    const a=oriented?c.length/2:(c.maxX-c.minX)/2,b=oriented?c.width/2:(c.maxZ-c.minZ)/2;
    const axes=[[co,si],[-si,co],[ca,sa],[-sa,ca]];let depth=Infinity,normal=null;
    for(const [nx,nz] of axes){
      const radius=L*Math.abs(co*nx+si*nz)+W*Math.abs(-si*nx+co*nz)+a*Math.abs(ca*nx+sa*nz)+b*Math.abs(-sa*nx+ca*nz);
      const distance=dx*nx+dz*nz,penetration=radius-Math.abs(distance);
      if(penetration<=.015)return null;
      if(penetration<depth){depth=penetration;const sign=distance>=0?1:-1;normal={x:nx*sign,z:nz*sign};}
    }
    return normal;
  }
  function inspectPlacement(x,z,h){
    const surface=world.driveSurface(x,z,s.level);if(!surface)return {reason:'edge'};
    const levels=new Set([surface.level]),co=Math.cos(h),si=Math.sin(h);
    // Tyres need road support. Bumpers can overhang a road seam without inventing an impact.
    for(const [a,b] of [[wheelbase/2,.64],[wheelbase/2,-.64],[-wheelbase/2,.64],[-wheelbase/2,-.64]]){
      const p=world.driveSurface(x+co*a-si*b,z+si*a+co*b,surface.level);if(!p||Math.abs(p.y-surface.y)>.9)return {reason:'edge'};levels.add(p.level);
    }
    for(const level of levels)for(const c of world.getColliders(level)){
      if(c.enabled===false||c===car.vehicle.collider)continue;
      // The old layer's tall garage walls must not extend invisibly down the ramp.
      if(level!==surface.level&&surface.level==='ramp'&&z>60&&level==='floor2')continue;
      const normal=overlap(x,z,h,c);if(normal)return {reason:'obstacle',collider:c,normal};
    }
    return {surface};
  }
  const canPlace=(x,z,h)=>inspectPlacement(x,z,h).surface||null;
  function updateBounds(){const co=Math.abs(Math.cos(yaw)),si=Math.abs(Math.sin(yaw)),ex=L*co+W*si,ez=L*si+W*co,c=car.vehicle.collider;c.minX=v.position.x-ex;c.maxX=v.position.x+ex;c.minZ=v.position.z-ez;c.maxZ=v.position.z+ez;car.syncPoints();}
  function syncRider(){
    const p=car.point(.42,1.20,-.47);player.x=p.x;player.z=p.z;const surface=world.driveSurface(v.position.x,v.position.z,s.level);player.floorY=surface?.y??(s.level==='floor2'?car.y:world.elevator.groundY);player.eyeHeight=p.y-player.floorY;player.level=s.level;player.inCar=true;
  }
  function reset(){yaw=Math.PI/2-v.rotation.y;pitch=0;steering=0;contact=null;clearTravel=0;s.speed=0;s.steering=0;s.lastBlockReason=null;s.lastCollider=null;updateBounds();}
  function update(dt,input={}){
    if(!s.inCar||s.boarding){updateBounds();return;}
    dt=clamp(dt,0,.15);const throttle=clamp(input.throttle||0,-1,1),steer=clamp(input.steer||0,-1,1),oldYaw=yaw,oldPitch=pitch;
    if(s.condition<=0)s.engine=false;
    // Short travel steps prevent a fast car from crossing a thin barrier between frames.
    const steps=Math.max(1,Math.ceil(dt/.012),Math.ceil(Math.abs(s.speed)*dt/.12)),step=dt/steps;
    for(let i=0;i<steps;i++){
      const speed=Math.abs(s.speed),limit=s.level==='ramp'?rampLimit:s.level==='floor2'?garageLimit:roadLimit;
      const steerLimit=Math.min(.53,Math.atan(wheelbase*7.5/Math.max(1,speed*speed)));
      steering+=(steer*steerLimit-steering)*(1-Math.exp(-step*(steer?10:14)));
      if(!s.engine)s.speed=toward(s.speed,0,4*step);
      else if(input.brake)s.speed=toward(s.speed,0,14*step);
      else if(throttle&&s.speed*throttle<-.05)s.speed=toward(s.speed,0,9*step);
      else if(throttle)s.speed+=throttle*(4.8*(1-.12*(speed/roadLimit)**2)-.12-.0006*speed*speed)*step;
      else s.speed=toward(s.speed,0,(.18+.0009*speed*speed)*step);
      s.speed=clamp(s.speed,-Math.min(reverseLimit,limit),limit);if(Math.abs(s.speed)<.025)s.speed=0;
      const nextYaw=yaw+s.speed/wheelbase*Math.tan(steering)*step,nextX=v.position.x+Math.cos(nextYaw)*s.speed*step,nextZ=v.position.z+Math.sin(nextYaw)*s.speed*step;
      const result=inspectPlacement(nextX,nextZ,nextYaw),surface=result.surface;
      if(surface){
        const travel=Math.hypot(nextX-v.position.x,nextZ-v.position.z);v.position.x=nextX;v.position.z=nextZ;yaw=nextYaw;s.level=surface.level;v.position.y=surface.y-car.y;pitch=-Math.atan((surface.slopeZ||0)*Math.sin(yaw));
        clearTravel+=travel;if(clearTravel>.8)contact=null;s.lastBlockReason=null;s.lastCollider=null;
      }else{
        s.lastBlockReason=result.reason;s.lastCollider=result.collider?.id||null;
        if(result.collider){
          const impact=Math.max(0,-s.speed*(Math.cos(nextYaw)*result.normal.x+Math.sin(nextYaw)*result.normal.z));
          if(impact>2&&contact!==result.collider){s.condition=Math.max(0,s.condition-Math.ceil(Math.min(30,impact*1.5)));onCue('carDoorClose');onMessage('차체가 장애물에 부딪혔다. 후진해 공간을 확보하자.',2400);}
          contact=result.collider;clearTravel=0;
        }
        s.speed=0;break;
      }
    }
    s.steering=steering;car.vehicle.steeringWheel&&(car.vehicle.steeringWheel.rotation.z=-steering*2.6);
    v.rotation.set(pitch,Math.PI/2-yaw,0,'YXZ');player.yaw+=yaw-oldYaw;player.pitch=clamp(player.pitch-(pitch-oldPitch),-1.1,1.1);updateBounds();syncRider();
  }
  function exit(){
    if(Math.abs(s.speed)>.2){onMessage('먼저 Space로 완전히 정차하세요.',2000);return false;}
    if(s.level==='ramp'){onMessage('경사로를 벗어난 평평한 곳에서 내리세요.',2300);return false;}
    for(const [x,z] of [[1.6,-.25],[-1.6,-.25],[1.65,-1.2],[-1.65,-1.2]]){
      const p=car.point(x,0,z),floor=world.footSurface(p.x,p.z,s.level);
      if(!floor||!world.isWalkable(p.x,p.z,.25,floor.level)||world.streetAI?.blocksPlayer(p.x,p.z))continue;
      s.inCar=false;s.engine=false;s.targetOpen=1;s.speed=0;car.vehicle.dashMat.emissiveIntensity=0;player.inCar=false;player.x=p.x;player.z=p.z;player.level=floor.level;player.floorY=floor.y;player.eyeHeight=1.4;player.pitch=0;onCue('carEnter');onMessage('차에서 내렸다. 가까이 있는 감염자를 조심하자.',2600);return true;
    }
    onMessage('차 옆이 막혀 있다. 공간이 있는 곳으로 이동해 정차하세요.',2400);return false;
  }
  function bodyDistance(x,z){const dx=x-v.position.x,dz=z-v.position.z,co=Math.cos(yaw),si=Math.sin(yaw);return Math.hypot(Math.max(0,Math.abs(dx*co+dz*si)-L),Math.max(0,Math.abs(-dx*si+dz*co)-W));}
  reset();return {state:s,update,reset,exit,syncRider,canPlace,inspectPlacement,bodyDistance,updateBounds,get yaw(){return yaw;},get speedKmh(){return Math.round(Math.abs(s.speed)*3.6);},maxSpeedKmh:100,dimensions:{length:L*2,width:W*2}};
};
