/* Three landings and one moving cabin share the same shaft; floor collisions stay separate. */
window.buildPoyuElevator=function buildPoyuElevator(T,{scene,mat,texture,colliders,floorAreas,finishes}){
  const groundY=-7.6,groundColliders=[],groundFloors=[],rooms=[],groundRooms=[];
  const parkingColliders=[],parkingFloors=[],parkingRooms=[];
  const building={parkingFloors:[1,2,3],residentialFloors:[4,5,6,7,8,9,10],unitsPerFloor:6,units(floor){return Array.from({length:6},(_,i)=>floor*100+i+1);}};
  const levels={floor4:{number:6,y:0,name:'6층 · 602호'},floor2:{number:2,y:-3.8,name:'2층 · 주차장'},floor1:{number:1,y:groundY,name:'1층 · 주차장/출입구'}};
  const metal=new T.MeshStandardMaterial({color:0x929d9e,metalness:.72,roughness:.36});
  const paint=new T.MeshStandardMaterial({color:0xbec4c1,roughness:.94});
  const tile=texture(256,256,(g,w,h)=>{g.fillStyle='#828c8b';g.fillRect(0,0,w,h);for(let y=0;y<4;y++)for(let x=0;x<4;x++){g.fillStyle=(x+y)%2?'#b0b5b0':'#a2aaa6';g.fillRect(x*64+1,y*64+1,62,62);}},3,4);
  const floorMat=new T.MeshStandardMaterial({map:tile,roughness:.8});
  const darkDoor=finishes?.door||new T.MeshStandardMaterial({color:0x282d2e,metalness:.25,roughness:.52});
  // Canonical cabin coordinates remain shared with the lower floors. Upstairs,
  // rotate the landing to face the apartment door in the supplied photographs.
  const upperLandingOffsetX=3.9,upperLandingOffsetZ=30.4;
  function toWorld(level,x,z){return level==='floor4'?{x:upperLandingOffsetX+z,z:upperLandingOffsetZ-x}:{x,z};}
  function toCanonical(level,x,z){return level==='floor4'?{x:upperLandingOffsetZ-z,z:x-upperLandingOffsetX}:{x,z};}
  function canonical(p){return toCanonical(p.level==='riding'?state.level:p.level||'floor4',p.x,p.z);}
  function transformRect(r){const a=toWorld('floor4',r.minX,r.minZ),b=toWorld('floor4',r.maxX,r.maxZ);r.minX=Math.min(a.x,b.x);r.maxX=Math.max(a.x,b.x);r.minZ=Math.min(a.z,b.z);r.maxZ=Math.max(a.z,b.z);if(r.labelX!==undefined){const p=toWorld('floor4',r.labelX,r.labelZ);r.labelX=p.x;r.labelZ=p.z;}}
  function mesh(w,h,d,x,y,z,m,parent=scene){const o=new T.Mesh(new T.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
  function collision(list,x,z,w,d,id=''){const c={minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2,kind:'wall',id};list.push(c);return c;}
  function block(list,w,h,d,x,y,z,m=paint,id=''){mesh(w,h,d,x,y,z,m);return collision(list,x,z,w,d,id);}
  function area(list,rs,id,name,x0,x1,z0,z1,kind='lobby'){list.push({minX:x0,maxX:x1,minZ:z0,maxZ:z1});rs.push({id,name,kind,minX:x0,maxX:x1,minZ:z0,maxZ:z1,labelX:(x0+x1)/2,labelZ:(z0+z1)/2});}
  function plaque(text,w,h,x,y,z,rot=0,parent=scene){const map=texture(256,128,(g,cw,ch)=>{g.fillStyle='#223235';g.fillRect(0,0,cw,ch);g.fillStyle='#dce8dc';g.textAlign='center';g.textBaseline='middle';g.font='bold 41px Malgun Gothic,sans-serif';g.fillText(text,cw/2,ch/2);});const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map,toneMapped:false}));m.position.set(x,y,z);m.rotation.y=rot;parent.add(m);return m;}
  const cabin=new T.Group();cabin.name='moving-elevator-cabin';scene.add(cabin);
  mesh(2.3,.12,1.5,8.85,-.055,24.8,metal,cabin);mesh(2.3,.10,1.5,8.85,2.45,24.8,metal,cabin);
  mesh(.10,2.45,1.5,7.72,1.22,24.8,metal,cabin);
  for(const z of [24.05,25.55]){mesh(2.3,2.45,.10,8.85,1.22,z,metal,cabin);mesh(1.75,.035,.055,8.82,.94,z+(z<24.8? .08:-.08),mat.steel,cabin);}
  const warm=new T.MeshStandardMaterial({color:0xe7e2d3,emissive:0xffe4b5,emissiveIntensity:.65});
  mesh(1.85,.035,.48,8.85,2.38,24.8,warm,cabin);
  const cabinLight=new T.PointLight(0xffe4c5,.85,4,2);cabinLight.position.set(8.85,2.15,24.8);cabin.add(cabinLight);
  mesh(.025,.50,1.42,7.79,1.32,24.98,mat.black,cabin);
  const buttons=[{level:'floor1',z:25.48},{level:'floor2',z:24.98},{level:'floor4',z:24.48}];
  for(const b of buttons){plaque(String(levels[b.level].number),.16,.13,7.811,1.47,b.z,Math.PI/2,cabin);mesh(.025,.085,.085,7.817,1.30,b.z,warm,cabin);}
  const landings={};
  for(const level of ['floor4','floor2','floor1']){
    const before=new Set(scene.children);
    const upper=level==='floor4',parking=level==='floor2',y=levels[level].y,list=upper?colliders:parking?parkingColliders:groundColliders,floors=upper?floorAreas:parking?parkingFloors:groundFloors,rs=upper?rooms:parking?parkingRooms:groundRooms;
    const firstCollider=list.length,firstFloor=floors.length,firstRoom=rs.length;
    if(!upper){
    area(floors,rs,level+'-lobby',levels[level].number+'층 엘리베이터 홀',10,16,21,29);
    mesh(6,.10,8,13,y-.047,25,floorMat);mesh(6,.12,8,13,y+2.88,25,paint);
    block(list,6,2.8,.15,13,y+1.4,21);block(list,6,2.8,.15,13,y+1.4,29);
    block(list,.15,2.8,3.0,10,y+1.4,22.5);block(list,.15,2.8,3.4,10,y+1.4,27.3);
    }
    area(floors,rs,level+'-cab','엘리베이터',7.7,10,24.05,25.55,'elevator');
    mesh(.15,upper?.44:.47,1.6,10,y+(upper?2.38:2.565),24.8,upper?(finishes?.paint||paint):paint);
    if(upper){for(const z of[23.8875,25.7125])mesh(.08,2.30,.225,10.075,1.15,z,darkDoor).name='active-elevator-dark-surround';mesh(.08,.10,2.05,10.075,2.25,24.8,darkDoor);}
    for(const z of [24.0,25.6])mesh(.19,2.22,.055,10.04,y+1.11,z,metal);
    mesh(.19,.055,1.65,10.04,y+2.22,24.8,metal);
    // The shaft walls are present at both stops even when the cabin is away.
    collision(list,7.72,24.8,.12,1.5);collision(list,8.85,24.05,2.3,.1);collision(list,8.85,25.55,2.3,.1);
    const gate=collision(list,10,24.8,.16,1.6,'lift-'+level),leaves=[];
    for(const side of [-1,1]){const leaf=mesh(.10,2.16,.76,10.025,y+1.08,24.8+side*.38,darkDoor);leaf.name='active-elevator-leaf';leaves.push({side,mesh:leaf});}
    const indicatorCanvas=document.createElement('canvas');indicatorCanvas.width=256;indicatorCanvas.height=128;
    const indicatorMap=new T.CanvasTexture(indicatorCanvas);indicatorMap.colorSpace=T.SRGBColorSpace;
    const indicator=new T.Mesh(new T.PlaneGeometry(upper?.12:.65,upper?.16:.26),new T.MeshBasicMaterial({map:indicatorMap,toneMapped:false}));indicator.rotation.y=Math.PI/2;indicator.position.set(10.13,y+(upper?1.50:2.54),upper?23.35:24.8);scene.add(indicator);
    mesh(.035,.45,.18,10.10,y+1.30,upper?23.35:26.30,mat.black);
    const lamp=mesh(.046,.05,.05,10.13,y+1.14,upper?23.35:26.30,warm);
    if(!upper){
    const gl=new T.PointLight(0xe2e9df,.8,7,2);gl.position.set(13,y+2.6,25);scene.add(gl);mesh(1.6,.04,.5,13,y+2.79,25,warm);
    plaque(upper?'6F · 601—606':parking?'2F · 주차장 →':'1F · 주차장/출입구',1.35,.30,13.15,y+1.85,28.91,Math.PI);
    // Bench and recessed mailboxes leave more than two metres of clear passage.
    mesh(1.7,.09,.48,13.8,y+.48,28.48,mat.wood);mesh(1.7,.45,.07,13.8,y+.73,28.70,mat.wood);
    for(const x of [13.1,14.5])mesh(.06,.44,.36,x,y+.22,28.48,metal);
    collision(list,13.8,28.5,1.7,.60,'lobby-bench');
    for(let i=0;i<6;i++){mesh(.37,.35,.10,11.1+i*.42,y+1.35,21.13,metal);mesh(.22,.018,.015,11.1+i*.42,y+1.40,21.194,mat.black);}
    }else{
      plaque('6층',.27,.31,10.13,1.91,23.35,Math.PI/2);
      for(const dz of[-.29,.29]){
        const tactile=mesh(.62,.012,.55,10.50,.016,24.8+dz,new T.MeshStandardMaterial({color:0xb79a45,roughness:.75}));tactile.name='active-elevator-tactile-paving';
        for(let i=0;i<6;i++)for(let j=0;j<5;j++)mesh(.025,.015,.025,10.25+i*.09,.030,24.8+dz-.22+j*.10,tactile.material);
      }
      // Tiny warning decals and a centre seam keep the paired black doors legible.
      const warning=texture(128,96,(g,w,h)=>{g.fillStyle='#e3e2d9';g.fillRect(0,0,w,h);g.fillStyle='#d3b343';g.fillRect(5,5,50,72);g.fillStyle='#303637';g.font='bold 50px sans-serif';g.fillText('!',20,60);g.font='14px Malgun Gothic';g.fillText('주의',63,55);});
      for(const d of leaves){const label=new T.Mesh(new T.PlaneGeometry(.16,.13),new T.MeshBasicMaterial({map:warning}));label.rotation.y=Math.PI/2;label.position.set(.057, .65, -d.side*.08);d.mesh.add(label);}
    }
    landings[level]={y,gate,leaves,opened:0,indicatorCanvas,indicatorMap,lamp};
    if(upper){
      const landing=new T.Group();landing.name='photo-elevator-active-landing';
      for(const o of [...scene.children])if(!before.has(o)){landing.add(o);o.traverse(m=>{m.layers.set(1);});}
      landing.rotation.y=Math.PI/2;landing.position.set(upperLandingOffsetX,0,upperLandingOffsetZ);scene.add(landing);
      for(const c of list.slice(firstCollider))transformRect(c);for(const f of floors.slice(firstFloor))transformRect(f);for(const r of rs.slice(firstRoom))transformRect(r);
    }
  }
  // The second lift is part of the reference facade; the right lift is playable.
  const secondary=new T.Group();secondary.name='photo-elevator-secondary';secondary.rotation.y=Math.PI/2;secondary.position.set(7.1,0,40.6);scene.add(secondary);
  for(const z of[18.0875,19.9125])mesh(.08,2.30,.225,20.10,1.15,z,darkDoor,secondary);mesh(.08,.10,2.05,20.10,2.25,19,darkDoor,secondary);
  for(const side of[-1,1])mesh(.10,2.16,.76,20.17,1.08,19+side*.38,darkDoor,secondary).name='secondary-elevator-leaf';
  for(const z of[18.2,19.8])mesh(.19,2.22,.055,20.16,1.11,z,metal,secondary);mesh(.19,.055,1.65,20.16,2.22,19,metal,secondary);
  const secondaryHeader=mesh(.15,.38,1.6,20.2,2.41,19,finishes?.paint||paint,secondary);finishes?.metric(secondaryHeader,.75);
  mesh(.004,2.13,.006,20.112,1.08,19,mat.black,secondary);
  const warningMaterial=landings.floor4.leaves[0].mesh.children[0].material;
  for(const side of[-1,1]){const label=new T.Mesh(new T.PlaneGeometry(.16,.13),warningMaterial);label.rotation.y=-Math.PI/2;label.position.set(20.112,1.73,19+side*.17);secondary.add(label);}
  collision(colliders,26.1,20.4,1.6,.16,'secondary-elevator-closed');
  mesh(.035,.45,.18,20.10,1.30,17.7,mat.black,secondary);plaque('1',.10,.15,20.075,1.50,17.7,-Math.PI/2,secondary);
  const tactileMat=new T.MeshStandardMaterial({color:0xb79a45,roughness:.75});mesh(.62,.012,1.13,19.5,.016,19,tactileMat,secondary);
  for(let i=0;i<6;i++)for(let j=0;j<11;j++)mesh(.025,.015,.025,19.25+i*.09,.030,18.5+j*.10,tactileMat,secondary);
  secondary.traverse(o=>o.layers.set(1));
  // Ground entrance uses sliding glass panels; the open area is completely walkable.
  block(groundColliders,.14,2.8,2.6,16,groundY+1.4,22.3);block(groundColliders,.14,2.8,3,16,groundY+1.4,27.5);
  mesh(.14,.45,2.4,16,groundY+2.58,24.8,paint);
  const glass=new T.MeshStandardMaterial({color:0x9ebfc8,transparent:true,opacity:.27,roughness:.2,metalness:.1,side:T.DoubleSide});
  const entranceLeaves=[];for(const side of [-1,1]){const g=new T.Group();g.position.set(16,groundY,24.8+side*.58);scene.add(g);mesh(.055,2.25,1.12,0,1.125,0,glass,g);for(const z of [-.56,.56])mesh(.07,2.3,.035,0,1.15,z,metal,g);for(const y of [.03,2.27])mesh(.07,.045,1.12,0,y,0,metal,g);entranceLeaves.push({side,mesh:g});}
  const entranceGate=collision(groundColliders,16,24.8,.12,2.4,'ground-entrance');
  area(groundFloors,groundRooms,'courtyard','건물 앞마당',16,22,19.6,34,'outdoor');
  mesh(6,.12,14.4,19,groundY-.045,26.8,new T.MeshStandardMaterial({color:0x89938b,roughness:1}));
  for(const z of [19.6,34])block(groundColliders,6,.48,.18,19,groundY+.24,z,mat.stone);
  // Border the remaining building face rather than allowing a hidden shortcut into its walls.
  block(groundColliders,.15,2.8,1.4,16,groundY+1.4,20.3);block(groundColliders,.15,2.8,5,16,groundY+1.4,31.5);
  for(const z of [20.5,32.8]){block(groundColliders,1.3,.55,.7,20.4,groundY+.275,z,mat.stone);for(const dx of [-.4,0,.4]){const leaf=new T.Mesh(new T.SphereGeometry(.32,12,8),new T.MeshStandardMaterial({color:0x405d48,roughness:1}));leaf.position.set(20.4+dx,groundY+.7,z);scene.add(leaf);}}
  // Existing exterior tree and streetlight now stand in the playable courtyard.
  plaque('포유하우스',1.1,.32,16.11,groundY+2.5,24.8,Math.PI/2);
  const state={level:'floor4',target:'floor4',mode:'idle',opened:0,targetOpen:0,timer:0,fromY:0,toY:0,rider:false,entryOpen:0,entryTarget:0};
  function inside(p,margin=.25){const q=canonical(p);return q.x>7.7+margin&&q.x<10-margin&&q.z>24.05+margin&&q.z<25.55-margin;}
  function atThreshold(p,margin=.42){const q=canonical(p);return Math.abs(q.x-10)<margin&&q.z>23.85&&q.z<25.75;}
  function syncCabin(){const upper=state.level==='floor4';cabin.rotation.y=upper?Math.PI/2:0;cabin.position.x=upper?upperLandingOffsetX:0;cabin.position.z=upper?upperLandingOffsetZ:0;cabin.traverse(o=>o.layers.set(upper?1:0));}
  function setIndicators(){for(const l of Object.values(landings)){const g=l.indicatorCanvas.getContext('2d');g.fillStyle='#17262a';g.fillRect(0,0,256,128);g.fillStyle='#d8e9b4';g.font='bold 72px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(state.mode==='moving'?((levels[state.target].y<state.fromY?'↓ ':'↑ ')+levels[state.target].number):String(levels[state.level].number),128,64);l.indicatorMap.needsUpdate=true;}}
  function reset(){Object.assign(state,{level:'floor4',target:'floor4',mode:'idle',opened:0,targetOpen:0,timer:0,fromY:0,toY:0,rider:false,entryOpen:0,entryTarget:0});cabin.position.y=0;for(const l of Object.values(landings)){l.opened=0;l.gate.enabled=true;}entranceGate.enabled=true;syncCabin();syncDoors();setIndicators();}
  function syncDoors(){for(const [level,l] of Object.entries(landings)){const o=level===state.level&&state.mode!=='moving'?state.opened:0;l.opened=o;l.gate.enabled=o<.94;for(const d of l.leaves)d.mesh.position.z=24.8+d.side*(.38+o*.77);}entranceGate.enabled=state.entryOpen<.94;for(const d of entranceLeaves)d.mesh.position.z=24.8+d.side*(.58+state.entryOpen*1.17);}
  function getTargets(player){if(player.level==='riding')return [];const level=player.level||'floor4',upper=level==='floor4',a=[];
    a.push({id:'liftCall',...toWorld(level,10.17,upper?23.35:26.3),range:1.85,name:state.mode==='idle'?'엘리베이터 호출 ('+levels[level].number+'층)':'엘리베이터 이동 중',action:true,allowWall:true});
    if(inside(player,.05)&&state.level===level&&state.mode==='idle')for(const b of buttons)a.push({id:'liftFloor'+levels[b.level].number,...toWorld(level,7.84,b.z),y:1.30,range:2.3,name:levels[b.level].name+' 버튼',action:true,precise:true});
    if(level==='floor1')a.push({id:'groundEntry',x:16,z:24.8,range:1.9,name:state.entryTarget?'유리 출입문 닫기':'유리 출입문 열기',action:true,allowWall:true});
    return a;
  }
  function interact(id,player,blocked,message=()=>{},cue=()=>{}){
    if(id==='groundEntry'){state.entryTarget=state.entryTarget?0:1;cue('doorOpen');return true;}
    const destination={liftFloor1:'floor1',liftFloor2:'floor2',liftFloor6:'floor4',liftFloor4:'floor4'}[id];
    if(id!=='liftCall'&&!destination)return false;
    if(state.mode!=='idle'){message('엘리베이터가 이동 중입니다.',1600);return true;}
    if(destination&&!inside(player)){message('문에서 떨어져 엘리베이터 안으로 들어가세요.',2200);return true;}
    const desired=destination||(player.level||'floor4');
    if(desired===state.level){state.targetOpen=1;cue('liftDing');message('엘리베이터 문이 열립니다. 안쪽 버튼을 바라보고 E를 누르세요.',3500);return true;}
    const nearGate=atThreshold(player);
    if(nearGate||blocked){message('문 앞에 장애물이 있습니다. 안쪽으로 이동하세요.',2200);return true;}
    state.target=desired;state.mode='closing';state.targetOpen=0;state.rider=!!destination;state.timer=0;state.fromY=cabin.position.y;cue('doorClose');setIndicators();return true;
  }
  function update(dt,player,message=()=>{},cue=()=>{},obstructed=false){
    if(player.level==='floor1'&&Math.abs(player.x-16)<.42&&player.z>23.35&&player.z<26.25)state.entryTarget=1;
    state.entryOpen+=(state.entryTarget-state.entryOpen)*Math.min(1,dt*6);
    const atGate=(player.level||'floor4')===state.level&&atThreshold(player);
    if(state.mode==='closing'&&(atGate||obstructed)){state.mode='idle';state.targetOpen=1;state.rider=false;message('문이 막혀 다시 열립니다.',2000);}
    state.opened+=(state.targetOpen-state.opened)*Math.min(1,dt*6);
    if(state.mode==='closing'&&state.opened<.015){state.opened=0;state.mode='moving';state.timer=0;state.fromY=cabin.position.y;state.toY=levels[state.target].y;if(state.rider)player.level='riding';setIndicators();cue('liftMove');}
    if(state.mode==='moving'){
      state.timer+=dt;const t=Math.min(1,state.timer/3.4),s=t*t*(3-2*t);cabin.position.y=state.fromY+(state.toY-state.fromY)*s;
      if(state.rider)player.floorY=cabin.position.y;
      if(t===1){if(state.rider){const local=toCanonical(state.level,player.x,player.z),destination=toWorld(state.target,local.x,local.z);player.x=destination.x;player.z=destination.z;if(state.level==='floor4'&&state.target!=='floor4')player.yaw=(player.yaw||0)-Math.PI/2;else if(state.level!=='floor4'&&state.target==='floor4')player.yaw=(player.yaw||0)+Math.PI/2;}state.level=state.target;state.mode='idle';state.targetOpen=1;if(state.rider){player.level=state.level;player.floorY=state.toY;}syncCabin();state.rider=false;cue('liftDing');message(state.level==='floor2'?'2층 주차장입니다. 주차된 차량을 확인하세요.':state.level==='floor1'?'1층 주차장과 출입구입니다. 유리문을 통해 건물 앞마당으로 나갈 수 있습니다.':'6층입니다. 공용 복도와 602호로 돌아왔습니다.',4000);setIndicators();}
    }
    syncDoors();
  }
  reset();
  return {state,cabin,landings,levels,building,groundY,rooms,groundRooms,groundColliders,groundFloors,parkingRooms,parkingColliders,parkingFloors,getTargets,interact,update,reset,inside,atThreshold,toWorld,get movementLocked(){return state.rider&&state.mode!=='idle';},get status(){return state.mode==='moving'?'엘리베이터 · '+levels[state.target].number+'층으로 '+(state.toY<state.fromY?'하강 중':'상승 중'):'';}};
};
