/* Street and mart infected: patrol, sight/range alert, pursuit and timed strikes. */
window.createPoyuStreetAI=function createPoyuStreetAI({world,player,onMessage=()=>{},onCue=()=>{},onDamage=()=>{},onHit=()=>{}}){
  const actors=world.streets.infected,car=world.parking,s=car.state;let time=0,notice=0;
  function reset(){time=0;notice=0;for(const a of actors){Object.assign(a,{mode:'patrol',hp:3,patrolIndex:0,idle:1+(a.id%3)*.5,windup:0,strike:0,cooldown:0,stagger:0,lost:0,deadTime:0,path:[],pathTimer:0});a.zombie.root.visible=true;const floor=world.footSurface(a.spawn.x,a.spawn.z,'floor1');a.zombie.root.position.set(a.spawn.x,(floor?.y??world.elevator.groundY)-world.elevator.groundY,a.spawn.z);a.zombie.rig.rotation.set(0,0,0);}}
  const free=(x,z,a)=>world.isWalkable(x,z,.24,'floor1')&&!actors.some(b=>b!==a&&b.hp>0&&Math.hypot(b.zombie.root.position.x-x,b.zombie.root.position.z-z)<.48);
  function clear(a,x,z){const p=a.zombie.root.position,n=Math.ceil(Math.hypot(x-p.x,z-p.z)/.2);for(let i=1;i<=n;i++)if(!free(p.x+(x-p.x)*i/n,p.z+(z-p.z)*i/n,a))return false;return true;}
  function pathTo(a,target){
    const k=(x,z)=>x+','+z,step=.5,p=a.zombie.root.position,ix=Math.round(p.x/step),iz=Math.round(p.z/step),gx=Math.round(target.x/step),gz=Math.round(target.z/step),open=[{x:ix,z:iz,g:0,f:0}],best=new Map([[k(ix,iz),0]]);let end=null;
    for(let count=0;open.length&&count<4500;count++){
      let at=0;for(let i=1;i<open.length;i++)if(open[i].f<open[at].f)at=i;const n=open.splice(at,1)[0];if(n.g>best.get(k(n.x,n.z)))continue;
      if(Math.hypot(n.x-gx,n.z-gz)<1.3){end=n;break;}
      for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){const x=n.x+dx,z=n.z+dz,g=n.g+Math.hypot(dx,dz),id=k(x,z);if(best.has(id)&&best.get(id)<=g||!free(x*step,z*step,a))continue;if(dx&&dz&&(!free(n.x*step,z*step,a)||!free(x*step,n.z*step,a)))continue;best.set(id,g);open.push({x,z,g,f:g+Math.hypot(x-gx,z-gz),parent:n});}
    }
    const out=[];while(end&&end.parent){out.unshift({x:end.x*step,z:end.z*step});end=end.parent;}return out;
  }
  function approachCar(a){
    const p=a.zombie.root.position,c=car.vehicle.root.position,h=world.driving.yaw,co=Math.cos(h),si=Math.sin(h),dx=p.x-c.x,dz=p.z-c.z,L=world.driving.dimensions.length/2,W=world.driving.dimensions.width/2;
    const along=dx*co+dz*si,side=-dx*si+dz*co,clamp=(v,m)=>Math.max(-m,Math.min(m,v)),qa=clamp(along,L),qb=clamp(side,W),da=along-qa,db=side-qb,n=Math.hypot(da,db)||1;
    const x=c.x+co*(qa+da/n*.58)-si*(qb+db/n*.58),z=c.z+si*(qa+da/n*.58)+co*(qb+db/n*.58);return {x,z};
  }
  function move(a,target,speed,dt){
    const p=a.zombie.root.position;let dest=target;
    if(!clear(a,target.x,target.z)){a.pathTimer-=dt;if(a.pathTimer<=0){a.path=pathTo(a,target);a.pathTimer=.8;}while(a.path.length&&Math.hypot(a.path[0].x-p.x,a.path[0].z-p.z)<.2)a.path.shift();if(!a.path.length)return false;dest=a.path[0];}else{a.path=[];a.pathTimer=0;}
    const dx=dest.x-p.x,dz=dest.z-p.z,d=Math.hypot(dx,dz);if(d<.05)return false;const step=Math.min(d,speed*dt),ox=p.x,oz=p.z;
    if(free(p.x+dx/d*step,p.z,a))p.x+=dx/d*step;if(free(p.x,p.z+dz/d*step,a))p.z+=dz/d*step;
    if(Math.hypot(p.x-ox,p.z-oz)>.0001){a.zombie.root.rotation.y=Math.atan2(p.x-ox,p.z-oz);return true;}return false;
  }
  function update(dt){
    time+=dt;notice=Math.max(0,notice-dt);
    for(const a of actors){
      const p=a.zombie.root.position;let moving=false;
      const viewDistance=Math.hypot(player.x-p.x,player.z-p.z);a.zombie.root.visible=viewDistance<90;
      if(viewDistance>90){a.windup=0;a.mode=a.hp>0?'patrol':'dead';continue;}
      a.cooldown=Math.max(0,a.cooldown-dt);a.stagger=Math.max(0,a.stagger-dt);a.strike=Math.max(0,a.strike-dt);
      const same=player.level==='floor1',cx=s.inCar?car.vehicle.root.position.x:player.x,cz=s.inCar?car.vehicle.root.position.z:player.z,d=Math.hypot(cx-p.x,cz-p.z),los=same&&!world.hasWallBetween(p.x,p.z,cx,cz,'floor1');
      if(a.hp>0&&s.inCar&&s.level==='floor1'&&Math.abs(s.speed)>1.8&&world.driving.bodyDistance(p.x,p.z)<.20){a.hp=0;a.mode='dead';a.deadTime=0;s.speed*=.65;s.condition=Math.max(0,s.condition-3);onCue('fall');}
      if(a.hp<=0){a.deadTime+=dt;a.zombie.pose(time,false,0,true,a.deadTime);}
      else{
        if(same&&los&&d<(s.inCar&&s.engine?17:10)){if(a.mode!=='chase'){onCue('growl');if(notice<=0){onMessage(a.worker?'환경미화원 복장의 감염자가 이쪽을 보고 다가온다!':'마트 주변의 감염자가 소리를 듣고 다가온다!',3000);notice=6;}}a.mode='chase';a.lost=0;}
        else if(a.mode==='chase'){a.lost+=dt;if(!same||((d>21||!los)&&a.lost>5)){a.mode='patrol';a.windup=0;a.path=[];}}
        if(a.stagger<=0){
          if(a.mode==='chase'&&same){
            const near=s.inCar?world.driving.bodyDistance(p.x,p.z):d;
            if(a.windup>0){a.windup=Math.max(0,a.windup-dt);if(a.windup===0){a.strike=.28;if(near<(s.inCar?1.2:1.75)&&los){if(s.inCar){s.condition=Math.max(0,s.condition-6);onCue('carDoorClose');if(notice<=0){onMessage('감염자가 차체를 두드리고 있다. 차를 움직여 거리를 벌리자.',3000);notice=5;}}else onDamage(12);}a.cooldown=1.35;}}
            else if(near<(s.inCar ? .85 : 1.4)&&los&&a.cooldown<=0){a.windup=.6;onCue('growl');}
            else if(near>(s.inCar ? .56 : 1.05))moving=move(a,s.inCar?approachCar(a):player,a.chaseSpeed??1.65+a.id*.08,dt);
          }else{
            const target=a.patrol[a.patrolIndex];if(a.idle>0)a.idle-=dt;else if(Math.hypot(target[0]-p.x,target[1]-p.z)<.4){a.patrolIndex=(a.patrolIndex+1)%a.patrol.length;a.idle=1.4+(a.id%3)*.4;}else moving=move(a,{x:target[0],z:target[1]},a.patrolSpeed??.42+a.id*.04,dt);
          }
        }
        a.zombie.pose(time+a.id,moving,a.windup>0?1-a.windup/.6:0,false,0,a.strike>0?Math.sin(a.strike/.28*Math.PI):0);
      }
      const floor=world.footSurface(p.x,p.z,'floor1');p.y=(floor?.y??world.elevator.groundY)-world.elevator.groundY;
    }
  }
  function hit(){
    if(player.level!=='floor1'||s.inCar)return false;
    const candidates=actors.filter(a=>a.hp>0).map(a=>{const p=a.zombie.root.position,dx=p.x-player.x,dz=p.z-player.z,d=Math.hypot(dx,dz);return {a,p,d,aim:(dx*Math.cos(player.yaw)+dz*Math.sin(player.yaw))/Math.max(.01,d)};}).filter(c=>c.d<=1.9&&c.aim>.48&&Math.abs(player.pitch)<.85&&!world.hasWallBetween(player.x,player.z,c.p.x,c.p.z,'floor1')).sort((a,b)=>a.d-b.d);
    const c=candidates[0];if(!c)return false;const a=c.a;a.hp--;a.stagger=.75;a.windup=0;a.mode=a.hp>0?'chase':'dead';if(!a.hp){a.deadTime=0;onCue('fall');}onCue('hit');onHit();return true;
  }
  function blocksPlayer(x,z){return player.level==='floor1'&&actors.some(a=>a.hp>0&&Math.hypot(a.zombie.root.position.x-x,a.zombie.root.position.z-z)<.48);}
  reset();return {actors,reset,update,hit,blocksPlayer};
};
