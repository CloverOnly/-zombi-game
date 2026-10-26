/* Deterministic story and combat rules for the first hallway encounter. */
window.createPoyuChapter=function createPoyuChapter({world,player,onMessage=()=>{},onCue=()=>{},onDamage=()=>{},onHit=()=>{},onDeath=()=>{},onComplete=()=>{}}){
  const view=world.encounter,enemy=view.zombie.root,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const state={phase:'preparation',time:0,phaseTime:0,health:100,hasBat:false,cabinetOpen:false,firstRetreated:false,enemyHP:3,enemyMoving:false,enemyResetPending:false,windup:0,enemyCooldown:0,enemyStrike:0,stagger:0,swing:-1,cooldown:0,hitPending:false,hurtTime:0,hitFlash:0,deathTime:0,doorLock:0,neighbourRefused:false,dialogueIndex:-1,parkingReached:false,completed:false,visited:new Set(),notes:[]};
  const conversation=[
    {speaker:'604호 이웃',text:'거기 서요. 더 가까이 오지 마세요. 밖에 있던 사람은… 어떻게 됐어요?'},
    {speaker:'주인공',text:'쓰러뜨렸어요. 여기 혼자 계시면 위험해요. 같이 내려가실래요?'},
    {speaker:'604호 이웃',text:'안 돼요. 물린 데가 없는지 제가 어떻게 알아요? 지금은 누구도 못 믿겠어요. 문은 안 열 거예요.'},
    {speaker:'주인공',text:'알겠어요. 억지로 열지는 않을게요. 저는 주차장에 있는 차로 가볼게요.'},
    {speaker:'604호 이웃',text:'…주차장은 2층이에요. 엘리베이터는 아직 움직여요. 문 앞에서는 떨어져 주세요.'}
  ];
  const doorPoint=world.homeDoor.point,doorInside=world.homeDoor.approach;
  let retreatFrom=null,retreatReason='first',ambushStartX=doorInside.x,path=[],pathTimer=0;
  world.driving=window.createPoyuDriving({world,player,onMessage,onCue});
  world.streetAI=window.createPoyuStreetAI({world,player,onMessage,onCue,onDamage:amount=>damage(amount),onHit:()=>{state.hitFlash=.16;onHit();}});
  function phase(value){state.phase=value;state.phaseTime=0;}
  function prepared(){return world.collectibles.every(i=>i.got);}
  function canEnemyMove(x,z){
    return world.isWalkable(x,z,.28,'floor4');
  }
  function moveEnemy(dx,dz){const p=enemy.position;if(canEnemyMove(p.x+dx,p.z))p.x+=dx;if(canEnemyMove(p.x,p.z+dz))p.z+=dz;}
  function clearPath(x,z,a,b){const n=Math.ceil(Math.hypot(a-x,b-z)/.16);for(let i=1;i<=n;i++)if(!canEnemyMove(x+(a-x)*i/n,z+(b-z)*i/n))return false;return true;}
  function findPath(){
    const step=.35,start=[Math.round(enemy.position.x/step),Math.round(enemy.position.z/step)],goal=[Math.round(player.x/step),Math.round(player.z/step)],key=(x,z)=>x+','+z;
    const open=[{x:start[0],z:start[1],g:0,f:0,parent:null}],best=new Map([[key(...start),0]]);let end=null;
    for(let count=0;open.length&&count<4500;count++){
      let at=0;for(let i=1;i<open.length;i++)if(open[i].f<open[at].f)at=i;
      const n=open.splice(at,1)[0];if(n.g>best.get(key(n.x,n.z)))continue;
      if(Math.hypot(n.x-goal[0],n.z-goal[1])<1.5){end=n;break;}
      for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){
        const x=n.x+dx,z=n.z+dz,k=key(x,z),g=n.g+Math.hypot(dx,dz);
        if(best.has(k)&&best.get(k)<=g||!canEnemyMove(x*step,z*step))continue;
        if(dx&&dz&&(!canEnemyMove(n.x*step,z*step)||!canEnemyMove(x*step,n.z*step)))continue;
        best.set(k,g);open.push({x,z,g,f:g+Math.hypot(x-goal[0],z-goal[1]),parent:n});
      }
    }
    const result=[];while(end&&end.parent){result.unshift({x:end.x*step,z:end.z*step});end=end.parent;}return result;
  }
  function chase(speed,dt){
    const p=enemy.position;let target=player;
    if(!clearPath(p.x,p.z,player.x,player.z)){
      pathTimer-=dt;if(pathTimer<=0){path=findPath();pathTimer=.65;}
      while(path.length&&Math.hypot(path[0].x-p.x,path[0].z-p.z)<.14)path.shift();
      if(!path.length)return;target=path[0];
    }else{path=[];pathTimer=0;}
    const dx=target.x-p.x,dz=target.z-p.z,d=Math.hypot(dx,dz),beforeX=p.x,beforeZ=p.z;
    if(d>.01)moveEnemy(dx/d*Math.min(speed*dt,d),dz/d*Math.min(speed*dt,d));
    state.enemyMoving=Math.hypot(p.x-beforeX,p.z-beforeZ)>.0001;
  }
  function spawn(){enemy.visible=true;enemy.position.set(18.35,0,doorPoint.z);enemy.rotation.set(0,-Math.PI/2,0);view.zombie.rig.rotation.set(0,0,0);state.enemyResetPending=false;state.windup=0;state.enemyCooldown=.25;state.stagger=0;state.deathTime=0;state.enemyStrike=0;path=[];pathTimer=0;}
  function setDoor(open){world.homeDoor.setOpen(open);state.doorLock=.36;onCue(open?'doorOpen':'doorClose');}
  function retreat(reason='first'){
    retreatFrom={x:player.x,z:player.z};retreatReason=reason;phase('retreat');
    onMessage(reason==='first'?'문을 닫아야 한다!':'집 안으로 물러났다. 호흡을 가다듬자.',2200);
  }
  function reset({prepared:ready=false,armed=false,spawnDoor=false,afterCombat=false,afterNeighbours=false,driveCheckpoint=false,streetCheckpoint=false,martCheckpoint=false}={}){
    if(martCheckpoint)streetCheckpoint=true;
    if(streetCheckpoint)driveCheckpoint=true;
    world.mart.reset();
    Object.assign(state,{crashSeen:false,martReached:false,martVisited:false,routeStep:0});
    Object.assign(state,{phase:armed?'armed':ready?'ready':'preparation',time:0,phaseTime:0,health:100,hasBat:armed,cabinetOpen:armed,firstRetreated:armed,enemyHP:3,enemyMoving:false,enemyResetPending:false,windup:0,enemyCooldown:0,stagger:0,swing:-1,cooldown:0,hitPending:false,hurtTime:0,hitFlash:0,deathTime:0,doorLock:0});
    state.visited.clear();state.notes.length=0;retreatFrom=null;state.enemyStrike=0;state.neighbourRefused=false;state.dialogueIndex=-1;state.parkingReached=false;state.groundReached=false;state.completed=false;path=[];pathTimer=0;view.reset();world.interiorDoors.forEach(door=>door.reset());world.elevator.reset();world.parking.reset(player);world.driving.reset();world.streets.reset();world.streetAI.reset();player.level='floor4';player.floorY=0;
    if(armed){view.cabinet.opened=1;view.cabinet.setOpen(true);view.cabinet.update(0,true);}
    if(spawnDoor||armed){player.x=doorInside.x;player.z=doorPoint.z;player.yaw=0;player.pitch=0;}
    if(afterCombat||afterNeighbours||driveCheckpoint){state.hasBat=true;state.firstRetreated=true;state.enemyHP=0;state.deathTime=2;enemy.visible=true;enemy.position.set(18.35,0,doorPoint.z);phase('survey');player.x=18.1;player.z=9.5;player.yaw=0;player.pitch=0;world.homeDoor.setOpen(true);world.homeDoor.update(1);}
    if(afterNeighbours||driveCheckpoint){state.neighbourRefused=true;for(const n of view.neighbours){state.visited.add(n.id);state.notes.push({number:n.number,text:n.description});view.markInspected(n.id);}phase('go-parking');player.z=15.5;player.yaw=Math.PI/2;}
    if(driveCheckpoint){state.parkingReached=true;Object.assign(world.parking.state,{unlocked:true,inCar:true,opened:0,targetOpen:0});player.yaw=0;player.pitch=0;world.driving.syncRider();phase('vehicle-ready');}
    if(streetCheckpoint){const car=world.parking;car.vehicle.root.position.set(60,world.elevator.groundY-car.y,90);car.vehicle.root.rotation.set(0,0,0,'YXZ');car.state.level='floor1';world.driving.reset();world.driving.syncRider();player.yaw=Math.PI/2;player.pitch=.015;state.groundReached=true;state.completed=true;}
    if(martCheckpoint){const car=world.parking;car.vehicle.root.position.set(185,world.elevator.groundY+.13-car.y,454);car.state.inCar=false;car.state.engine=false;world.driving.reset();player.inCar=false;state.martReached=true;state.martVisited=true;world.mart.enter(player);phase('mart-explore');}
  }
  function objective(){
    if(player.level==='martTravel')return world.mart.status;
    if(player.level==='mart1')return '롯데마트 1층 · B1 내려가는 곳으로 이동 후 E · M 실내 지도';
    if(player.level==='martB1')return 'B1 식품관 둘러보기 · E 진열대 조사 · 출구는 올라가는 무빙워크';
    if(state.groundReached&&player.level==='floor1'&&!['dead','boarding','starting-car'].includes(state.phase)){
      if(state.martVisited)return '롯데마트 출입구에서 E로 다시 들어가기';
      if(state.martReached)return world.parking.state.inCar?'마트 앞에 정차하고 E로 하차하세요':'마트 유리문으로 가서 E로 내부 상황을 살펴보세요';
      if(!world.parking.state.engine&&world.parking.state.inCar)return '챕터 2 · E로 시동을 걸고 롯데마트 노은점으로 출발';
      if(state.crashSeen&&player.z<275)return '다중 추돌 · 중앙분리대가 끊긴 곳으로 반대 차로 우회 · M 지도';
      if(player.z<310&&player.x<110)return '롯데마트 노은점으로 · 북유성대로를 따라 침신대네거리로 이동 · M 지도';
      return '침신대네거리에서 노은로 진입 → 마트 옆 도로로 우회전 · M 지도';
    }
    return ({ready:'현관문을 열고 복도로 나가세요', 'first-exit':'열린 현관문을 지나 복도로 나가세요',ambush:'뒤로! S로 집 안에 돌아가세요',retreat:'현관 안으로 물러나는 중', 'seek-bat':state.cabinetOpen?'신발장 안의 야구방망이를 꺼내세요':'신발장을 열어 무기가 될 물건을 찾으세요',armed:'야구방망이를 들고 다시 현관문을 여세요','second-exit':'복도로 나가 감염자와 싸우세요',combat:'왼쪽 클릭 / F로 공격 · 거리를 유지하세요',survey:`이웃집을 살펴보세요 (${state.visited.size} / ${view.neighbours.length})`,dialogue:'문 너머의 이웃과 대화 · E로 다음 대사','go-parking':'엘리베이터를 타고 2층 주차장으로 내려가세요','find-car':world.parking.state.unlocked?'열린 운전석 문으로 가서 E로 탑승하세요':'내 차 찾기 · 31가 4012 · 차키로 잠금 해제',boarding:'운전석에 타는 중','vehicle-ready':'E로 시동 · W/S 전진·후진 · A/D 조향 · Space 제동','drive-out':'노란 출구 유도를 따라 경사로로 1층에 내려가세요',street:'지족로364번길 탐색 · 환경미화원 복장의 감염자 주의','street-foot':'주변 감염자를 경계하며 길을 살펴보세요 · 차키로 재탑승',complete:'차량 탑승 완료 · 다음 이동을 준비한다',dead:'공격을 피하지 못했다.'})[state.phase]||null;
  }
  function finishSurvey(){if(state.visited.size===view.neighbours.length&&state.neighbourRefused){phase(player.level==='floor2'?'find-car':'go-parking');onMessage('이웃은 문을 열지 않았다. 혼자 이동해야 한다. 엘리베이터로 2층 주차장에 가자.',5200);}}
  function getTargets(){
    if(player.level==='mart1'||player.level==='martB1'||player.level==='martTravel')return world.mart.getTargets(player);
    if(state.phase==='dialogue'||state.phase==='boarding')return [];
    if(world.parking.state.inCar)return world.parking.getTargets(player);
    const targets=[...world.elevator.getTargets(player),...(['find-car','vehicle-ready','drive-out','street','street-foot','complete'].includes(state.phase)?world.parking.getTargets(player):[])];
    if(player.level==='floor1'&&state.groundReached)targets.push({id:'martEntrance',...world.streets.journey.destination,name:'문을 열고 롯데마트 안으로 들어가기',action:true,allowWall:true});
    if((player.level||'floor4')!=='floor4')return targets;
    for(const door of world.interiorDoors)targets.push({id:'interiorDoor:'+door.id,x:door.x,z:door.z,range:1.65,name:(door.target?'문 닫기 · ':'문 열기 · ')+({'ensuite-bathroom':'안방 화장실','master-bedroom':'안방','rear-small-bedroom':'작은방 1 · 게임방','front-small-bedroom':'작은방 2 · 옷방','bathroom':'화장실','balcony':'베란다'}[door.id]||'방'),action:true,allowWall:true});
    if(state.phase!=='preparation'||prepared()){
      let label=player.x>16?'집 안으로 돌아가기':'현관문 열기';
      if(state.phase==='ambush')label='집 안으로 피하기';
      if(state.phase==='seek-bat')label='현관문 · 먼저 무기를 찾자';
      if((state.phase==='first-exit'||state.phase==='second-exit')&&player.x<16)label='현관문 닫기';
      targets.push({id:'homeDoor',x:doorPoint.x,z:doorPoint.z,range:1.9,name:label,action:true,allowWall:true});
    }
    if(state.phase==='seek-bat')targets.push(state.cabinetOpen?{id:'bat',...view.cabinet.batPoint,range:1.65,name:'야구방망이 꺼내기',action:true}:{id:'shoeCabinet',...view.cabinet.point,range:1.7,name:'신발장 열기',action:true});
    if(['survey','go-parking','find-car','complete'].includes(state.phase))for(const n of view.neighbours)targets.push({...n,name:n.number+'호 '+(state.visited.has(n.id)?'다시 확인하기':'살펴보기'),action:true,allowWall:true});
    return targets;
  }
  function interact(id){
    if(state.phase==='retreat'||state.phase==='dead')return false;
    if(id.startsWith('interiorDoor:')&&player.level==='floor4'){
      const door=world.interiorDoors.find(d=>d.id===id.slice(13));if(!door)return false;
      if(door.target&&Math.hypot(player.x-door.x,player.z-door.z)<.48){onMessage('문간에서 조금 떨어져 주세요.',1500);return true;}
      door.setOpen(!door.target);onCue(door.target?'doorOpen':'doorClose');return true;
    }
    if((player.level==='mart1'||player.level==='martB1')&&world.mart.interact(id,player,onMessage,onCue)){phase(player.level==='floor1'?'street-foot':'mart-explore');return true;}
    if(id==='martEntrance'&&player.level==='floor1'&&!world.parking.state.inCar&&state.groundReached){
      const d=world.streets.journey.destination;if(Math.hypot(player.x-d.x,player.z-d.z)>d.range)return false;
      state.martReached=true;state.martVisited=true;world.mart.enter(player);phase('mart-explore');onCue('doorOpen');onMessage('자동문이 열렸다. 식품관은 지하 1층이다. 내려가는 무빙워크를 확인하자.',5800);return true;
    }
    if(state.phase==='dialogue'){
      if(id!=='dialogueNext')return false;
      state.dialogueIndex++;if(state.dialogueIndex>=conversation.length){state.dialogueIndex=-1;state.neighbourRefused=true;const n=view.neighbours.find(n=>n.id==='neighbour404');state.visited.add(n.id);state.notes.push({number:n.number,text:n.description});view.markInspected(n.id);phase('survey');finishSurvey();}return true;
    }
    if(id==='liftFloor2'&&!(state.visited.size===view.neighbours.length&&state.neighbourRefused)){onMessage('먼저 복도의 이웃집을 모두 확인하자.',2500);return true;}
    if(id==='carExit'){if(world.parking.state.inCar&&world.driving.exit())phase(player.level==='floor2'?'find-car':'street-foot');return true;}
    if(['carUnlock','carEnter','carIgnition'].includes(id)){
      if(!['find-car','vehicle-ready','drive-out','street','street-foot','complete'].includes(state.phase))return false;
      if(id==='carIgnition'&&world.parking.state.condition<=0){onMessage('차량이 고장 났다. E로 내려 주변을 살펴보자.',2500);return true;}
      const wasEngine=world.parking.state.engine,done=world.parking.interact(id,player,world.itemsById.carKey.got,onMessage,onCue);
      if(world.parking.state.boarding)phase('boarding');
      if(world.parking.state.engine&&!wasEngine)phase('starting-car');return done;
    }
    if(world.elevator.interact(id,player,liftObstructed(),onMessage,onCue))return true;
    if(id==='homeDoor'){
      if(state.doorLock>0)return true;
      if(state.phase==='preparation'&&!prepared())return false;
      if(state.phase==='preparation')phase('ready');
      if(state.phase==='ready'){spawn();setDoor(true);phase('first-exit');onMessage('맞은편에 누군가 서 있다. 문밖으로 조심스럽게 나가 보자.',3200);return true;}
      if(state.phase==='ambush'){retreat();return true;}
      if(state.phase==='seek-bat'){onMessage('맨손으로는 위험하다. 신발장부터 확인하자.',2800);return true;}
      if(state.phase==='armed'){spawn();setDoor(true);phase('second-exit');onMessage('방망이를 단단히 쥐었다. 왼쪽 클릭 또는 F로 공격할 수 있다.',3800);return true;}
      if(state.phase==='first-exit'||state.phase==='second-exit'){const armed=state.phase==='second-exit';setDoor(false);phase(armed?'armed':'ready');return true;}
      if(state.phase==='combat'){retreat('combat');return true;}
      if(['survey','go-parking','find-car','complete'].includes(state.phase)){
        if(player.x>16){player.x=doorInside.x;player.z=doorPoint.z;player.yaw=0;setDoor(false);}
        else setDoor(!world.homeDoor.target);
        return true;
      }
    }
    if(id==='shoeCabinet'&&state.phase==='seek-bat'){
      state.cabinetOpen=true;view.cabinet.setOpen(true);onCue('cabinet');onMessage('신발장 안에 야구방망이가 놓여 있다.',3000);return true;
    }
    if(id==='bat'&&state.phase==='seek-bat'&&state.cabinetOpen){
      if(view.cabinet.opened<.55){onMessage('신발장 문을 여는 중이다.',900);return true;}
      state.hasBat=true;phase('armed');onCue('pickup');onMessage('야구방망이를 챙겼다. 다시 현관으로 가자. 공격: 왼쪽 클릭 / F',4200);return true;
    }
    const n=view.neighbours.find(n=>n.id===id);
    if(n&&['survey','go-parking','find-car','complete'].includes(state.phase)){
      if(id==='neighbour404'&&!state.neighbourRefused){state.dialogueIndex=0;phase('dialogue');onCue('knock');return true;}
      if(!state.visited.has(id)){state.visited.add(id);state.notes.push({number:n.number,text:n.description});view.markInspected(id);}
      onCue('knock');onMessage(n.number+'호 — '+n.description,6500);
      if(state.phase==='survey')finishSurvey();
      return true;
    }
    return false;
  }
  function attack(){
    if(!state.hasBat||['retreat','dead','dialogue','boarding'].includes(state.phase)||world.parking.state.inCar||state.cooldown>0)return false;
    if(player.stamina<.12){onMessage('호흡을 가다듬고 다시 공격하자.',1300);return false;}
    state.swing=0;state.cooldown=.62;state.hitPending=true;player.stamina=Math.max(0,player.stamina-.12);onCue('swing');return true;
  }
  function resolveHit(){
    if(player.level==='floor1'){world.streetAI.hit();return;}
    if(state.phase!=='combat'||state.enemyHP<=0||!enemy.visible||(player.level||'floor4')!=='floor4')return;
    const dx=enemy.position.x-player.x,dz=enemy.position.z-player.z,d=Math.hypot(dx,dz);
    const aim=(dx*Math.cos(player.yaw)+dz*Math.sin(player.yaw))/Math.max(d,.01);
    if(d>1.9||aim<.48||Math.abs(player.pitch)>.85||world.hasWallBetween(player.x,player.z,enemy.position.x,enemy.position.z))return;
    state.enemyHP--;state.stagger=.70;state.windup=0;state.hitFlash=.16;onCue('hit');onHit();
    moveEnemy(dx/Math.max(d,.01)*.32,dz/Math.max(d,.01)*.32);
    if(state.enemyHP<=0){state.deathTime=0;phase('survey');onCue('fall');onMessage('감염자가 쓰러졌다. 복도의 다른 집들을 확인해 보자.',4200);}
  }
  function damage(amount=18){
    state.health=Math.max(0,state.health-amount);state.hurtTime=.38;onCue('hurt');onDamage();
    if(state.health<=0){phase('dead');onDeath();}
  }
  function liftObstructed(){return enemy.visible&&state.enemyHP>0&&world.elevator.atThreshold({x:enemy.position.x,z:enemy.position.z,level:'floor4'})&&world.elevator.state.level==='floor4';}
  function enemyAttack(dt,first=false){
    const dx=player.x-enemy.position.x,dz=player.z-enemy.position.z,d=Math.hypot(dx,dz);enemy.rotation.y=Math.atan2(dx,dz);state.enemyCooldown=Math.max(0,state.enemyCooldown-dt);
    if(state.stagger>0)return;
    const los=!world.hasWallBetween(enemy.position.x,enemy.position.z,player.x,player.z);
    if(state.windup>0){
      state.windup=Math.max(0,state.windup-dt);
      if(state.windup===0){state.enemyStrike=.3;if(d<1.85&&los){damage();if(first&&state.phase!=='dead')retreat();}state.enemyCooldown=1.1;}
    }else if(d<1.55&&los&&state.enemyCooldown<=0){state.windup=.55;onCue('growl');}
    else if(d>1.12||!los)chase(first?1.85:1.2,dt);
  }
  function update(dt,input={}){
    state.time+=dt;state.phaseTime+=dt;state.doorLock=Math.max(0,state.doorLock-dt);state.cooldown=Math.max(0,state.cooldown-dt);state.hurtTime=Math.max(0,state.hurtTime-dt);state.hitFlash=Math.max(0,state.hitFlash-dt);state.stagger=Math.max(0,state.stagger-dt);state.enemyStrike=Math.max(0,state.enemyStrike-dt);
    world.homeDoor.update(dt);world.interiorDoors.forEach(door=>door.update(dt));view.cabinet.update(dt,state.hasBat);
    world.elevator.update(dt,player,onMessage,onCue,liftObstructed());
    world.parking.update(dt,player,onCue);
    world.driving.update(dt,['dead','boarding','starting-car'].includes(state.phase)?{}:input);
    world.streets.update(dt,state.time,world.parking,world.itemsById.carKey.got);
    world.streetAI.update(dt);
    world.mart.update(dt,state.time,player);
    if(state.groundReached&&player.level==='floor1'){
      const j=world.streets.journey;
      if(!state.crashSeen&&Math.hypot(player.x-j.crashAt.x,player.z-j.crashAt.z)<44){state.crashSeen=true;onMessage('차들이 엉켜 길을 막고 있다. 중앙분리대가 끊긴 구간에서 반대편 차로로 돌아가자. M으로 경로 확인.',6200);}
      if(!state.martReached&&Math.hypot(player.x-j.parkingPoint.x,player.z-j.parkingPoint.z)<24){state.martReached=true;onMessage('롯데마트 노은점이다. 차를 세우고 내려서 출입구를 확인하자.',5000);}
      state.routeStep=player.x>160?3:player.z>308?2:player.z>180?1:0;
    }
    if(player.level==='floor2'&&state.neighbourRefused&&state.visited.size===view.neighbours.length){state.parkingReached=true;if(state.phase==='go-parking')phase('find-car');}
    if(state.phase==='find-car'&&player.level!=='floor2'&&player.level!=='riding')phase('go-parking');
    if(state.phase==='boarding'&&world.parking.state.inCar){phase('vehicle-ready');onMessage('차 문을 닫았다. E를 눌러 시동을 걸자.',3500);}
    if(state.phase==='starting-car'&&state.phaseTime>1.6)phase(player.level==='floor2'?'drive-out':'street');
    if(state.phase!=='dead'&&world.parking.state.inCar&&world.parking.state.level==='floor1'&&world.parking.vehicle.root.position.x>56&&!state.groundReached){state.groundReached=true;state.completed=true;phase('street');onMessage('1층 도로에 나왔다. 작업복을 입은 감염자들이 배회하고 있다.',4300);onComplete();}
    if(state.enemyResetPending&&world.homeDoor.openness<.15){enemy.position.set(18.35,0,doorPoint.z);state.enemyResetPending=false;}
    if(state.phase==='preparation'&&prepared())phase('ready');
    if(state.phase==='first-exit'&&world.homeDoor.openness>.94&&(player.x>16.3||state.phaseTime>1.1)){ambushStartX=player.x;phase('ambush');player.yaw=Math.atan2(enemy.position.z-player.z,enemy.position.x-player.x);onCue('growl');onMessage('사람이 아니다! S로 뒤로 물러나 집 안으로!',2600);}
    if(state.phase==='second-exit'&&world.homeDoor.openness>.94&&(player.x>16.3||state.phaseTime>.65)){phase('combat');onCue('growl');}
    state.enemyMoving=false;
    if(state.phase==='ambush'){
      enemyAttack(dt,true);
      if(state.phase==='ambush'&&(player.x<Math.min(15.72,ambushStartX-.45)||state.phaseTime>4.5))retreat();
    }
    if(state.phase==='retreat'){
      const u=clamp(state.phaseTime/.60,0,1),s=u*u*(3-2*u);player.x=retreatFrom.x+(doorInside.x-retreatFrom.x)*s;player.z=retreatFrom.z+(doorPoint.z-retreatFrom.z)*s;player.pitch=0;
      if(u>=1){player.yaw=0;enemy.position.x=Math.max(16.65,enemy.position.x);state.enemyResetPending=true;setDoor(false);if(retreatReason==='first'){state.firstRetreated=true;phase('seek-bat');onMessage('문을 잠갔다. 무기가 필요하다. 신발장을 확인하자.',4500);}else phase('armed');}
    }
    if(state.swing>=0){state.swing+=dt;if(state.hitPending&&state.swing>=.16){state.hitPending=false;resolveHit();}if(state.swing>=.42)state.swing=-1;}
    if(state.phase==='combat'&&state.enemyHP>0&&(player.level||'floor4')==='floor4')enemyAttack(dt);
    else if((player.level||'floor4')!=='floor4')state.windup=0;
    if(state.enemyHP<=0)state.deathTime+=dt;
    view.zombie.pose(state.time*(state.phase==='ambush'?1.65:1),state.enemyMoving,state.windup>0?1-state.windup/.55:0,state.enemyHP<=0,state.deathTime,state.enemyStrike>0?Math.sin(state.enemyStrike/.3*Math.PI):0);
    view.weaponPose(state.hasBat&&!world.parking.state.inCar&&!world.parking.state.boarding,state.swing<0?-1:state.swing/.42,state.time);
  }
  function blocksPlayer(x,z){return world.streetAI.blocksPlayer(x,z)||((player.level||'floor4')==='floor4'&&enemy.visible&&state.enemyHP>0&&(state.phase==='combat'||state.phase==='ambush')&&Math.hypot(x-enemy.position.x,z-enemy.position.z)<.55);}
  reset();
  return {state,reset,update,interact,attack,getTargets,objective,blocksPlayer,get dialogue(){return state.phase==='dialogue'?{...conversation[state.dialogueIndex],index:state.dialogueIndex+1,total:conversation.length}:null;},get movementLocked(){return ['retreat','dialogue','boarding'].includes(state.phase)||state.doorLock>0||world.elevator.movementLocked||world.parking.movementLocked||world.mart.movementLocked;},get swingProgress(){return state.swing<0?-1:state.swing/.42;}};
};
