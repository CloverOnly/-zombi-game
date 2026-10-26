(() => {
  'use strict';
  const byId=id=>document.getElementById(id);
  const canvas=byId('view'),hud=byId('hud'),intro=byId('start');
  const inventory=byId('inventory'),mapOverlay=byId('mapOverlay'),pause=byId('pause'),ending=byId('ending');
  const prompt=byId('prompt'),message=byId('message');
  const THREE=window.THREE;
  if (!THREE || !window.createPoyuWorld || !window.createPoyuChapter) { byId('webglError').classList.remove('hidden'); return; }
  let renderer;
  try {
    renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
  } catch (_) { byId('webglError').classList.remove('hidden'); return; }
  const renderScale=()=>Math.max(1,Math.min(Math.max(window.devicePixelRatio||1,1.35),2,Math.sqrt(5000000/(window.innerWidth*window.innerHeight))));
  renderer.setPixelRatio(renderScale());
  renderer.setSize(window.innerWidth,window.innerHeight,false);
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=.90;
  renderer.shadowMap.enabled=true;
  renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  const world=window.createPoyuWorld(THREE,renderer);
  const alertAudio=window.createPoyuAlertAudio?.();
  const soundToggle=byId('soundToggle');
  const startView=world.referenceView;
  const camera=new THREE.PerspectiveCamera(startView.fov,window.innerWidth/window.innerHeight,.06,1100);
  camera.rotation.order='YXZ';
  world.scene.add(camera);world.encounter.attachWeapon(camera);
  const player={x:startView.x,z:startView.z,yaw:startView.yaw,pitch:startView.pitch,stamina:1,level:'floor4',floorY:0};
  const items=[
    {id:'phone',name:'휴대폰',icon:'📱'},
    {id:'food',name:'식량',icon:'🥫'},
    {id:'weapon',name:'손전등',icon:'🔦'},
    {id:'jacket',name:'방어용 외투',icon:'🧥'},
    {id:'rope',name:'밧줄',icon:'🪢'},
    {id:'carKey',name:'차키',icon:'🔑'}
  ];
  const keys=new Set();
  let running=false,finished=false,panel='',focus=null,last=performance.now(),stride=0,messageTimer=0,lastAlarm=0,endKind='',hudSignature='',streetRetry=false;
  let mouseLookActive=false,hadPointerLock=false,previousMouse=null;
  const mouseSensitivity=.00075,verticalSensitivity=.00042;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const chapter=window.createPoyuChapter({world,player,onMessage:showMessage,onCue:type=>alertAudio?.effect?.(type),onDeath:()=>showEnding('dead'),onComplete:()=>showMessage('1층 도로 진입 · W/S 주행 · A/D 조향 · Space 제동 · 정차 후 E 하차',4500)});
  function updateSoundUI(){
    const on=!!alertAudio?.enabled;
    soundToggle.textContent=alertAudio?.available?(on?'🔊 소리 켜짐':'🔇 소리 꺼짐'):'🔇 소리 사용 불가';
    soundToggle.setAttribute('aria-pressed',String(on));
    soundToggle.disabled=!alertAudio?.available;
  }
  function toggleSound(){
    if(!alertAudio?.available)return;
    const on=alertAudio.setEnabled(!alertAudio.enabled);
    updateSoundUI();
    if(on&&running)alertAudio.unlock().then(ok=>{if(ok&&!panel&&!finished)alertAudio.play(.7);});
  }
  updateSoundUI();
  function showMessage(text,duration=3300){
    message.textContent=text;message.classList.remove('hidden');
    clearTimeout(messageTimer);messageTimer=setTimeout(()=>message.classList.add('hidden'),duration);
  }
  function enableMouseLook(){
    if(!running||panel||finished)return;
    mouseLookActive=true;previousMouse=null;canvas.classList.add('mouse-look');
    // Embedded browsers can reject pointer lock. Free mouse movement still controls the view.
    if(document.pointerLockElement===canvas||typeof canvas.requestPointerLock!=='function')return;
    try{
      const request=canvas.requestPointerLock();
      if(request&&typeof request.catch==='function')request.catch(()=>{previousMouse=null;});
    }catch(_){previousMouse=null;}
  }
  function releaseMouseLook(){
    mouseLookActive=false;previousMouse=null;canvas.classList.remove('mouse-look');
    if(document.pointerLockElement===canvas){try{document.exitPointerLock?.();}catch(_){}}
  }
  function updateHUD(){
    const got=world.collectibles.filter(i=>i.got).length;
    const s=chapter.state,signature=[got,s.phase,s.hasBat,s.cabinetOpen,s.health,s.enemyHP,s.visited.size,s.dialogueIndex,s.neighbourRefused,player.level,world.elevator.state.mode,world.parking.state.unlocked,world.parking.state.inCar,world.parking.state.engine,s.crashSeen,s.martReached,s.martVisited,s.routeStep,s.groundReached,world.mart.state.inspected.size,player.z<275].join('|');
    if(signature===hudSignature)return;hudSignature=signature;
    byId('progress').textContent=s.neighbourRefused&&s.visited.size===world.encounter.neighbours.length?(world.parking.state.inCar?'차량 탑승 · 31가 4012':'이웃집 확인 완료 · 2층 주차장으로 이동'):['survey','dialogue'].includes(s.phase)?`이웃집 ${s.visited.size} / ${world.encounter.neighbours.length} 확인`:`${got} / ${items.length} 준비물${s.hasBat?' · 야구방망이 장착':''}`;
    byId('objective').textContent=world.elevator.status||(s.phase==='starting-car'?'시동을 거는 중…':chapter.objective()||(!world.itemsById.phone.got?'화장대 위 휴대폰을 찾으세요':'차키와 생존 물품을 챙기세요'));
    const all=[...items,{id:'bat',name:'야구방망이',icon:'⚾'}],has=i=>i.id==='bat'?s.hasBat:world.itemsById[i.id].got;
    byId('quickSlots').innerHTML=all.map((i,n)=>`<div class="slot ${has(i)?'':'empty'} ${i.id==='bat'&&has(i)?'equipped':''}" title="${i.name}">${has(i)?i.icon:''}<em>${n+1}</em></div>`).join('');
    byId('inventoryItems').innerHTML=all.map(i=>`<div class="inventory-item ${has(i)?'':'missing'}"><span class="icon">${i.icon}</span>${i.name}<br>${has(i)?'습득':'미발견'}</div>`).join('');
    byId('healthBar').style.width=s.health+'%';byId('healthValue').textContent=s.health;
    byId('enemyStatus').classList.toggle('hidden',s.phase!=='combat'||player.level!=='floor4');byId('enemyBar').style.width=(s.enemyHP/3*100)+'%';
    byId('chapterSteps').classList.toggle('hidden',s.phase==='preparation');
    const done=[s.firstRetreated,s.hasBat,s.enemyHP<=0,s.visited.size===world.encounter.neighbours.length&&s.neighbourRefused,s.parkingReached,world.parking.state.inCar,s.groundReached],names=['복도에서 집 안으로 피하기','신발장에서 방망이 찾기','감염자와 싸우기',`이웃집 살피기 ${s.visited.size}/${world.encounter.neighbours.length}`,'엘리베이터로 2층 주차장 가기','내 차의 운전석에 타기','차를 몰고 경사로로 1층 내려가기'];
    byId('chapterSteps').innerHTML=names.map((n,i)=>`<li class="${done[i]?'done':''}">${done[i]?'✓':i+1} ${n}</li>`).join('');
    byId('chapterLabel').textContent=s.groundReached?'CHAPTER 02 · 롯데마트로':player.level==='floor4'?'CHAPTER 01 · 6F 602호 · 05:42':player.level==='floor2'?'CHAPTER 01 · 2F 주차장':'CHAPTER 01 · 1F 주차장/출입구';
    if(s.groundReached){
      byId('progress').textContent=s.martVisited?'챕터 2 완료':s.martReached?'하차 후 마트 출입구 확인':'목적지 · 롯데마트 노은점';
      const steps=[['북유성대로 사고 구간 우회',s.crashSeen&&player.z>275],['롯데마트 앞에 정차',s.martReached],['출입구 살피기',s.martVisited]];
      byId('chapterSteps').innerHTML=steps.map(([n,d],i)=>`<li class="${d?'done':''}">${d?'✓':i+1} ${n}</li>`).join('');
    }
    if(player.level.startsWith('mart')){
      byId('chapterLabel').textContent='롯데마트 노은점 · '+(player.level==='mart1'?'1F':'B1');
      byId('progress').textContent=world.mart.state.inspected.size+' / '+world.mart.departments.length+' 코너 조사';
      byId('chapterSteps').innerHTML='<li class="done">✓ 1층 입구 도착</li><li'+(player.level==='martB1'?' class="done"':'')+'>B1 식품관 내려가기</li><li>식품 진열대 · 냉장고 · 계산대 둘러보기</li>';
    }
    byId('neighbourNotes').innerHTML=s.notes.length?s.notes.map(n=>`<li><b>${n.number}호</b> ${n.text}</li>`).join(''):'<li>복도를 살핀 뒤 발견한 단서가 기록됩니다.</li>';
    const dialogue=chapter.dialogue;byId('dialogue').classList.toggle('hidden',!dialogue);
    if(dialogue){byId('dialogueSpeaker').textContent=dialogue.speaker;byId('dialogueText').textContent=dialogue.text;byId('dialogueCount').textContent=dialogue.index+' / '+dialogue.total;message.classList.add('hidden');}
    byId('vehicleStatus').classList.toggle('hidden',!world.parking.state.inCar);
    byId('controlsHint').textContent=world.parking.state.inCar?'W/S 전진·후진 · A/D 조향 · Space 제동 · E 시동/정차 후 하차 · 마우스 둘러보기 · M 지도':'WASD 이동 · 마우스 시점 · 좌클릭/F 공격 · E 조사 / 대화 · Shift 달리기 · Tab 가방 · M 지도 · Esc 일시정지';
  }
  function isFree(x,z){
    if(!world.isWalkable(x,z,.25,player.level))return false;
    if(chapter.blocksPlayer(x,z))return false;
    return true;
  }
  function gazeTarget(){
    const dx=Math.cos(player.yaw),dz=Math.sin(player.yaw);
    let best=null,bestScore=Infinity;
    for(const item of [...(player.level==='floor4'?world.collectibles:[]),...chapter.getTargets()]){
      if(item.got)continue;
      const x=item.x-player.x,z=item.z-player.z,d=Math.hypot(x,z);
      if(d>(item.range||1.75)||d<.05)continue;
      if(!item.allowWall&&world.hasWallBetween(player.x,player.z,item.x,item.z,player.level))continue;
      const vy=item.precise?(player.floorY||0)+item.y-camera.position.y:0;
      const alignment=item.precise?(x*dx*Math.cos(player.pitch)+z*dz*Math.cos(player.pitch)+vy*Math.sin(player.pitch))/Math.hypot(d,vy):(x*dx+z*dz)/d;
      if(alignment<(item.precise ? .985 : item.action ? .57 : .73))continue;
      const score=item.precise?(1-alignment)*20+d*.05:d+(1-alignment)*2;
      if(score<bestScore){best=item;bestScore=score;}
    }
    return best;
  }
  function interact(){
    if(!running||finished||panel)return;
    if(chapter.dialogue){chapter.interact('dialogueNext');updateHUD();return;}
    if(world.parking.state.inCar){chapter.interact(world.parking.state.engine||world.parking.state.condition<=0?'carExit':'carIgnition');updateHUD();return;}
    const target=gazeTarget();
    if(!target){showMessage('가까이 있는 물건을 바라보고 E를 누르세요.',1700);return;}
    if(target.action){chapter.interact(target.id);updateHUD();return;}
    if(target.id!=='phone'&&!world.itemsById.phone.got){showMessage('먼저 화장대 위 휴대폰부터 찾아보자.',2400);return;}
    target.got=true;target.group.visible=false;updateHUD();
    if(target.id==='phone')showMessage('지인과 통화가 닿았다. “밖이 이상해. 일단 필요한 것부터 챙겨.”',5600);
    else if(target.id==='carKey')showMessage('차키를 챙겼다. 밖에 나가면 차량을 확인할 수 있겠다.',3200);
    else showMessage(`${target.name}을(를) 챙겼다.`,2200);
    if(world.collectibles.every(i=>i.got))showMessage('준비가 끝났다. 현관문을 확인하자.',3400);
  }
  function attack(){if(running&&!finished&&!panel)chapter.attack();}
  function roomName(){
    return world.parking.state.inCar?'내 차 · '+(player.level==='ramp'?'1층으로 내려가는 경사로':player.level==='floor1'?world.getRoomName(player.x,player.z,player.level):'2층 주차장'):world.getRoomName(player.x,player.z,player.level);
  }
  function update(dt){
    if(!running||panel||finished){focus=null;prompt.classList.add('hidden');return;}
    const forward=(keys.has('KeyW')||keys.has('ArrowUp')?1:0)-(keys.has('KeyS')||keys.has('ArrowDown')?1:0);
    const sideways=(keys.has('KeyD')?1:0)-(keys.has('KeyA')?1:0);
    const turning=(keys.has('ArrowRight')?1:0)-(keys.has('ArrowLeft')?1:0);
    if(!chapter.movementLocked)player.yaw+=turning*dt*1.65;
    const moving=!!(forward||sideways)&&!chapter.movementLocked;
    const sprint=moving&&forward>0&&(keys.has('ShiftLeft')||keys.has('ShiftRight'))&&player.stamina>.02;
    const speed=(sprint?3.55:2.20)*dt/Math.max(1,Math.hypot(forward,sideways));
    const dx=(Math.cos(player.yaw)*forward-Math.sin(player.yaw)*sideways)*speed;
    const dz=(Math.sin(player.yaw)*forward+Math.cos(player.yaw)*sideways)*speed;
    if(moving&&isFree(player.x+dx,player.z))player.x+=dx;
    if(moving&&isFree(player.x,player.z+dz))player.z+=dz;
    player.stamina=clamp(player.stamina+(sprint?-.27:.17)*dt,0,1);
    byId('staminaBar').style.width=`${Math.round(player.stamina*100)}%`;
    if(moving)stride+=dt*(sprint?12:8);
    if(!world.parking.state.inCar&&!world.parking.state.boarding&&['floor2','floor1','ramp','mart1','martB1'].includes(player.level)){const floor=world.footSurface(player.x,player.z,player.level);if(floor){player.level=floor.level;player.floorY=floor.y;}}
    chapter.update(dt,{throttle:forward,steer:sideways||turning,brake:keys.has('Space')});
    const car=world.parking.state;
    if(car.inCar)byId('vehicleStatus').textContent=(car.speed<-.05?'R':car.engine?'D':'P')+' · '+world.driving.speedKmh+' km/h · 차체 '+Math.round(car.condition)+'% · '+(car.engine||car.condition<=0?'E 하차':'E 시동');
    const shake=chapter.state.hurtTime>0?Math.sin(chapter.state.time*66)*.018:0;
    camera.position.set(player.x,(player.floorY||0)+(player.eyeHeight??startView.eye)+(moving?Math.sin(stride)*.018:0)+shake,player.z);
    camera.rotation.set(player.pitch,-player.yaw-Math.PI/2,shake*.5,'YXZ');
    byId('roomName').textContent=roomName();
    byId('damageFlash').style.opacity=chapter.state.hurtTime>0?String(chapter.state.hurtTime*1.6):'0';
    byId('crosshair').classList.toggle('hit',chapter.state.hitFlash>0);updateHUD();
    if(finished||chapter.dialogue||world.parking.state.boarding){prompt.classList.add('hidden');return;}
    focus=gazeTarget();
    prompt.classList.toggle('hidden',!focus);
    if(focus)byId('promptText').textContent=focus.action?focus.name:`${focus.name} 줍기`;
  }
  function drawMap(){
    const c=byId('minimap'),q=c.getContext('2d');if(!q)return;
    const level=player.level==='martTravel'?world.mart.state.travel.level:player.level==='ramp'?'floor1':player.level==='riding'?world.elevator.state.level:player.level,rooms=world.getRooms(level);
    const atHome=level==='floor4',inMart=level==='mart1'||level==='martB1';byId('mapTitle').textContent=atHome?'6층 602호 · 공용 복도':inMart?'롯데마트 노은점 · '+(level==='mart1'?'1F 입구':'B1 식품관'):'포유하우스 → 롯데마트 노은점';byId('mapLegend').textContent=atHome?'안방 · 작은방 2개 · 화장실 2개 · 베란다 · 거실과 주방. 표시된 물품에 다가가 E로 조사하세요.':inMart?'초록색 점: 조사할 코너와 무빙워크 · 어두운 부분: 진열대와 벽':'노란 점선: 주행 경로 · 빨강: 사고 차량 · 초록: 마트 출입구';
    const b=world.getBounds(level),s=Math.min((c.width-64)/(b.maxX-b.minX),(c.height-64)/(b.maxZ-b.minZ)),ox=(c.width-(b.maxX-b.minX)*s)/2-b.minX*s,oz=32-b.minZ*s;
    q.fillStyle='#10202a';q.fillRect(0,0,c.width,c.height);
    for(const r of rooms){q.fillStyle=r.kind==='road'?'#454e52':r.kind==='sidewalk'?'#b5a48d':r.kind==='bedroom'?'#9b8975':r.kind==='bathroom'?'#839598':r.kind==='foyer'?'#637579':r.kind==='outdoor'?'#617e69':'#9b9389';if(r.points){q.beginPath();r.points.forEach(([x,z],i)=>i?q.lineTo(ox+x*s,oz+z*s):q.moveTo(ox+x*s,oz+z*s));q.closePath();q.fill();}else q.fillRect(ox+r.minX*s,oz+r.minZ*s,(r.maxX-r.minX)*s,(r.maxZ-r.minZ)*s);}
    q.fillStyle='#172b3570';if(level==='floor4')for(const p of world.placements)q.fillRect(ox+p.minX*s,oz+p.minZ*s,(p.maxX-p.minX)*s,(p.maxZ-p.minZ)*s);
    if(level==='floor2')for(const p of world.getColliders(level).filter(c=>c.kind==='furniture'))q.fillRect(ox+p.minX*s,oz+p.minZ*s,(p.maxX-p.minX)*s,(p.maxZ-p.minZ)*s);
    q.fillStyle='#243740';for(const p of world.getColliders(level).filter(c=>c.kind==='wall'&&c.enabled!==false))q.fillRect(ox+p.minX*s,oz+p.minZ*s,Math.max(3,(p.maxX-p.minX)*s),Math.max(3,(p.maxZ-p.minZ)*s));
    q.fillStyle='#f6f3e9';q.font='bold 12px Malgun Gothic, sans-serif';q.textAlign='center';
    q.font='bold 10px Malgun Gothic, sans-serif';for(const r of rooms){if(r.hideLabel||level==='floor1'&&r.kind==='sidewalk')continue;q.save();if(r.kind==='corridor'){q.translate(ox+r.labelX*s,oz+r.labelZ*s);q.rotate(Math.PI/2);q.fillText(r.name,0,0);}else q.fillText(r.kind==='elevator'?'EV':r.kind==='lobby'?'승강기 홀':r.name,ox+r.labelX*s,oz+r.labelZ*s);q.restore();}
    if(level==='floor4'){
      for(const i of world.collectibles){q.fillStyle=i.got?'#83cbb1':'#edc894';q.beginPath();q.arc(ox+i.x*s,oz+i.z*s,4,0,Math.PI*2);q.fill();}
      for(const n of world.encounter.neighbours){q.fillStyle=chapter.state.visited.has(n.id)?'#85c8a8':'#cfbba0';q.beginPath();q.arc(ox+n.x*s,oz+n.z*s,4,0,Math.PI*2);q.fill();}
      if(world.encounter.zombie.root.visible&&chapter.state.enemyHP>0){const p=world.encounter.zombie.root.position;q.fillStyle='#db6972';q.beginPath();q.arc(ox+p.x*s,oz+p.z*s,6,0,Math.PI*2);q.fill();}
      q.fillStyle='#dd8f80';q.beginPath();q.arc(ox+world.homeDoor.point.x*s,oz+world.homeDoor.point.z*s,5,0,Math.PI*2);q.fill();
    }
    if(level==='floor1'){
      q.font='bold 10px Malgun Gothic,sans-serif';q.fillStyle='#d1d9d5';for(const place of world.streets.landmarks.filter(p=>['poyu','hospital','gs25','twosome','lotte-mart','jijok-station'].includes(p.id)))q.fillText(place.id==='hospital'?'벤조인 요양병원':place.id==='twosome'?'투썸플레이스':place.name,ox+place.x*s,oz+place.z*s);
      q.fillStyle='#778a8e';for(const p of world.getColliders(level).filter(c=>c.id==='street-parked-car'))q.fillRect(ox+p.minX*s,oz+p.minZ*s,(p.maxX-p.minX)*s,(p.maxZ-p.minZ)*s);
    }
    if(level===world.parking.state.level||level==='floor1'&&world.parking.state.level==='ramp'){
      const p=world.parking.vehicle.root.position,dim=world.driving.dimensions;q.save();q.translate(ox+p.x*s,oz+p.z*s);q.rotate(world.driving.yaw);q.fillStyle='#edc894';q.fillRect(-dim.length/2*s,-dim.width/2*s,dim.length*s,dim.width*s);q.restore();q.fillStyle='#edc894';q.fillText('내 차',ox+p.x*s,oz+(p.z-1.4)*s);
    }
    if(level==='floor2'||level==='floor1'){
      const route=level==='floor1'?world.streets.journey.route:world.streets.route;
      q.strokeStyle='#d7ad69';q.lineWidth=2;q.setLineDash([4,4]);q.beginPath();for(const [i,v] of route.entries()){if(i===0)q.moveTo(ox+v.x*s,oz+v.z*s);else q.lineTo(ox+v.x*s,oz+v.z*s);}q.stroke();q.setLineDash([]);
      if(level==='floor1'){q.fillStyle='#e07068';for(const w of world.streets.journey.wrecks)q.fillRect(ox+(w.x-w.width/2)*s,oz+(w.z-w.depth/2)*s,Math.max(3,w.width*s),Math.max(3,w.depth*s));const d=world.streets.journey.destination;q.fillStyle='#79d2aa';q.beginPath();q.arc(ox+d.x*s,oz+d.z*s,5,0,Math.PI*2);q.fill();}
    }
    if(level==='mart1'||level==='martB1'){
      q.fillStyle='#a4c4ac';q.font='bold 10px Malgun Gothic,sans-serif';
      const locations=level==='mart1'?[{x:180.5,z:427.8,name:'B1 ↓'},{x:183,z:433.8,name:'출입구'}]:[...world.mart.departments,{x:186.5,z:408.3,name:'1F ↑'}];
      for(const p of locations){q.beginPath();q.arc(ox+p.x*s,oz+p.z*s,4,0,Math.PI*2);q.fill();q.fillText(p.name.replace(' 살펴보기',''),ox+p.x*s,oz+p.z*s-8);}
    }
    if(level==='floor1')for(const a of world.streetAI.actors)if(a.hp>0){const p=a.zombie.root.position;q.fillStyle=a.mode==='chase'?'#e27063':'#c5bc6c';q.beginPath();q.arc(ox+p.x*s,oz+p.z*s,3,0,Math.PI*2);q.fill();}
    q.fillStyle='#f2f9f7';q.beginPath();q.arc(ox+player.x*s,oz+player.z*s,8,0,Math.PI*2);q.fill();
    q.strokeStyle='#f2f9f7';q.lineWidth=2;q.beginPath();q.moveTo(ox+player.x*s,oz+player.z*s);q.lineTo(ox+(player.x+Math.cos(player.yaw)*.65)*s,oz+(player.z+Math.sin(player.yaw)*.65)*s);q.stroke();
  }
  function openPanel(which){
    panel=which;keys.clear();
    alertAudio?.setPaused(!!which);
    inventory.classList.toggle('hidden',which!=='inventory');
    mapOverlay.classList.toggle('hidden',which!=='map');
    pause.classList.toggle('hidden',which!=='pause');
    if(which==='map')drawMap();
    if(which)releaseMouseLook();
  }
  function showEnding(kind){
    streetRetry=player.level!=='floor4'&&player.level!=='riding';
    endKind=kind;finished=true;running=false;keys.clear();hud.classList.add('hidden');ending.classList.remove('hidden');alertAudio?.setPaused(true);
    byId('endingTitle').textContent=kind==='dead'?'다시 숨을 고르자':'일단 차에 탔다';
    byId('endingText').textContent=kind==='dead'?(streetRetry?'거리에서 감염자의 공격을 막지 못했다. 주차장의 운전석에서 다시 시작할 수 있다.':'감염자의 공격을 막지 못했다. 야구방망이를 챙긴 현관에서 다시 시작할 수 있다.'):'차를 몰고 1층 도로에 나왔다.';
    byId('endingNote').textContent=kind==='dead'?'공격을 본 뒤 거리를 벌리고, 빈틈에 방망이를 휘둘러 보자.':'감염자 처치 → 이웃집 조사와 대화 → 2층 주차장 → 차량 탑승·시동까지 진행했습니다.';
    byId('continueChapterButton').classList.toggle('hidden',kind==='dead');byId('restartButton').textContent=kind==='dead'?(streetRetry?'운전석에서 다시 시도':'현관에서 다시 시도'):'처음부터 다시';
    releaseMouseLook();
  }
  function startGame({photoTour=false,checkpoint=false,armed=false,afterCombat=false,safeEntrance=false,driveCheckpoint=false,streetCheckpoint=false,martCheckpoint=false}={}){
    if(martCheckpoint)streetCheckpoint=true;
    if(streetCheckpoint)driveCheckpoint=true;
    player.x=startView.x;player.z=startView.z;player.yaw=startView.yaw;player.pitch=startView.pitch;player.stamina=1;player.level='floor4';player.floorY=0;player.eyeHeight=startView.eye;player.inCar=false;stride=0;
    for(const item of world.collectibles){item.got=checkpoint||armed||afterCombat||safeEntrance||driveCheckpoint;item.group.visible=!item.got;}
    chapter.reset({prepared:checkpoint||armed||afterCombat||safeEntrance||driveCheckpoint,armed:armed||afterCombat||safeEntrance||driveCheckpoint,spawnDoor:checkpoint||armed,afterCombat,safeEntrance,driveCheckpoint,streetCheckpoint,martCheckpoint});hudSignature='';
    if(photoTour){const v=world.apartment.photoViews.hall;player.x=v.x;player.z=v.z;player.yaw=v.yaw;player.pitch=v.pitch;player.eyeHeight=v.eye;}
    camera.fov=photoTour?world.apartment.photoViews.hall.fov:startView.fov;camera.updateProjectionMatrix();
    running=true;finished=false;openPanel('');updateHUD();
    intro.classList.add('hidden');ending.classList.add('hidden');hud.classList.remove('hidden');
    showMessage(photoTour?'6층 602호입니다. 방 3개, 화장실 2개와 소파 뒤 벽을 반영했습니다.':martCheckpoint?'롯데마트 노은점 1층입니다. 내려가는 무빙워크에 접근해 E로 B1 식품관에 들어가세요.':streetCheckpoint?'1층 포유하우스 앞길입니다. 마우스로 둘러보고, E로 시동을 걸어 골목을 탐색하세요.':driveCheckpoint?'E로 시동을 걸고 W/S·A/D로 운전하세요. 주차장 오른쪽 출구를 따라 경사로로 내려갑니다.':safeEntrance?'준비물과 방망이를 챙긴 현관입니다. 복도의 좀비 없이 이웃집 조사부터 진행할 수 있습니다.':afterCombat?'감염자는 쓰러졌다. 601·603~606호를 살펴보고, 생존자에게 말을 걸어 보자.':checkpoint||armed?'6층 602호에서 준비물은 챙겼다. 현관문을 열고 복도를 확인하자.':'6층 602호. 현관문 손잡이가 천천히 내려갔다. 화장대 위 휴대폰부터 찾아보자.',4800);
    lastAlarm=world.clock.getElapsedTime();
    alertAudio?.unlock().then(ok=>{updateSoundUI();if(ok&&running&&!finished)alertAudio.play(1);});
    enableMouseLook();
  }
  byId('startButton').addEventListener('click',()=>startGame());
  byId('photoTourButton').addEventListener('click',()=>startGame({photoTour:true}));
  byId('safeEntranceButton').addEventListener('click',()=>startGame({safeEntrance:true}));
  byId('checkpointButton').addEventListener('click',()=>startGame({checkpoint:true}));
  byId('parkingCheckpointButton').addEventListener('click',()=>startGame({afterCombat:true}));
  byId('driveCheckpointButton').addEventListener('click',()=>startGame({driveCheckpoint:true}));
  byId('streetCheckpointButton').addEventListener('click',()=>startGame({streetCheckpoint:true}));
  byId('martCheckpointButton').addEventListener('click',()=>startGame({martCheckpoint:true}));
  byId('restartButton').addEventListener('click',()=>startGame(endKind==='dead'?(streetRetry?{driveCheckpoint:true}:{checkpoint:true,armed:true}):{}));
  byId('continueChapterButton').addEventListener('click',()=>{finished=false;running=true;ending.classList.add('hidden');hud.classList.remove('hidden');openPanel('');enableMouseLook();});
  byId('closeInventory').addEventListener('click',()=>{openPanel('');enableMouseLook();});
  byId('closeMap').addEventListener('click',()=>{openPanel('');enableMouseLook();});
  byId('resumeButton').addEventListener('click',()=>{openPanel('');enableMouseLook();});
  soundToggle.addEventListener('click',toggleSound);
  canvas.addEventListener('click',()=>{
    if(!running||panel||finished)return;
    if(!mouseLookActive){enableMouseLook();return;}
    if(chapter.state.hasBat)attack();else interact();
  });
  canvas.addEventListener('mouseleave',()=>{if(document.pointerLockElement!==canvas)previousMouse=null;});
  document.addEventListener('mousemove',e=>{
    if(!running||panel||finished||!mouseLookActive||['retreat','dialogue','boarding'].includes(chapter.state.phase))return;
    const locked=document.pointerLockElement===canvas;
    if(document.pointerLockElement&&!locked)return;
    if(!locked&&e.target&&e.target!==canvas){previousMouse=null;return;}
    const hasPosition=Number.isFinite(e.clientX)&&Number.isFinite(e.clientY);
    const current=hasPosition?{x:e.clientX,y:e.clientY}:null;
    if(!locked&&current&&!previousMouse){previousMouse=current;return;}
    const positionX=current&&previousMouse?current.x-previousMouse.x:0,positionY=current&&previousMouse?current.y-previousMouse.y:0;
    const relativeX=e.movementX??e.webkitMovementX??e.mozMovementX,relativeY=e.movementY??e.webkitMovementY??e.mozMovementY;
    // Unlocked browsers can report accelerated or stale movementX/Y values.
    // Use screen positions there, and relative movement only under pointer lock.
    const dx=locked||!current?relativeX:positionX,dy=locked||!current?relativeY:positionY;
    previousMouse=current;
    if(!Number.isFinite(dx)||!Number.isFinite(dy))return;
    player.yaw+=clamp(dx,-50,50)*mouseSensitivity;
    player.pitch=clamp(player.pitch-clamp(dy,-30,30)*verticalSensitivity,-.95,.95);
  });
  document.addEventListener('pointerlockchange',()=>{
    const locked=document.pointerLockElement===canvas,wasLocked=hadPointerLock;hadPointerLock=locked;previousMouse=null;
    if(locked){mouseLookActive=true;canvas.classList.add('mouse-look');}
    else if(wasLocked&&running&&!panel&&!finished)openPanel('pause');
  });
  document.addEventListener('pointerlockerror',()=>{previousMouse=null;});
  document.addEventListener('keydown',e=>{
    if(['Tab','Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();
    if(!running||finished)return;
    if(e.code==='KeyB'&&!e.repeat){toggleSound();return;}
    if(e.code==='Escape'){if(panel==='pause')return;if(panel){openPanel('');enableMouseLook();}else openPanel('pause');return;}
    if(e.code==='Tab'&&!e.repeat){const closing=panel==='inventory';openPanel(closing?'':'inventory');if(closing)enableMouseLook();return;}
    if(e.code==='KeyM'&&!e.repeat){const closing=panel==='map';openPanel(closing?'':'map');if(closing)enableMouseLook();return;}
    if(panel)return;
    keys.add(e.code);
    if(e.code==='KeyE'&&!e.repeat)interact();
    if(e.code==='KeyF'&&!e.repeat)attack();
  });
  document.addEventListener('keyup',e=>keys.delete(e.code));
  window.addEventListener('blur',()=>{keys.clear();previousMouse=null;if(running&&!panel&&!finished)openPanel('pause');});
  window.addEventListener('resize',()=>{
    camera.aspect=window.innerWidth/window.innerHeight;camera.updateProjectionMatrix();
    renderer.setPixelRatio(renderScale());
    renderer.setSize(window.innerWidth,window.innerHeight,false);
  });
  function frame(now){
    const dt=Math.min((now-last)/1000,.05);last=now;
    update(dt);
    alertAudio?.setEngine?.(running&&!finished&&world.parking.state.engine,world.parking.state.speed);
    const t=world.clock.getElapsedTime();
    world.updateTV(t);
    world.updateEnvironment(t);
    world.updatePresentation(player,camera,dt);
    if(running&&!panel&&t-lastAlarm>38){alertAudio?.play(.55);lastAlarm=t;}
    renderer.render(world.scene,camera);
    requestAnimationFrame(frame);
  }
  camera.position.set(player.x,startView.eye,player.z);
  camera.rotation.set(player.pitch,-player.yaw-Math.PI/2,0,'YXZ');
  requestAnimationFrame(frame);
})();
