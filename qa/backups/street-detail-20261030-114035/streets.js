/* Playable reconstruction from the nine supplied street-view photographs.
 * Connections and landmarks follow the references; obscured widths are game estimates. */
window.buildPoyuStreets=function buildPoyuStreets(T,{scene,mat,texture,parkingY,groundY,surfaces}){
  const group=new T.Group();group.name='jijok-street-reference';group.position.y=groundY;scene.add(group);
  const colliders=[],floors=[],rooms=[],roads=[],rampColliders=[],rampFloors=[{minX:44,maxX:50,minZ:58,maxZ:72},{minX:44,maxX:52,minZ:72,maxZ:78}];
  const S=surfaces||window.createPoyuSurfaces(T,texture),material=(color,roughness=.9)=>new T.MeshStandardMaterial({color,roughness});
  const {asphalt,concrete,paving,yellow,white,dark,glass}=S,curb=S.lightStone,tile=S.granite,green=material(0x59634e),silver=S.metal;
  function box(w,h,d,x,y,z,m,parent=group){const o=new T.Mesh(window.poyuBoxGeometry(T,w,h,d,m),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
  function block(x,z,w,d,id,kind='wall',list=colliders){const c={minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2,id,kind};list.push(c);return c;}
  function flat(w,d,x,z,y,m){return box(w,.07,d,x,y-.035,z,m);}
  function area(id,name,x0,x1,z0,z1,kind='road',height=0,drive=false){const r={id,name,kind,minX:x0,maxX:x1,minZ:z0,maxZ:z1,labelX:(x0+x1)/2,labelZ:(z0+z1)/2,height};floors.push(r);if(drive)roads.push(r);rooms.push(r);return r;}
  function sign(text,w,h,x,y,z,rot=0,color='#263c42'){
    const map=texture(512,128,(g,cw,ch)=>{g.fillStyle=color;g.fillRect(0,0,cw,ch);g.fillStyle='#edf0df';g.font='bold 44px Malgun Gothic,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(text,cw/2,ch/2);});
    const o=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map,toneMapped:false}));o.position.set(x,y,z);o.rotation.y=rot;group.add(o);return o;
  }
  const D=window.createPoyuStreetDetails(T,{group,S,texture,box,block,flat,sign});
  D.landmarks.push({id:'poyu',name:'포유하우스',x:34,z:51,width:36,depth:66,height:33,front:'east'});
  flat(180,220,5,55,-.12,green);
  area('front-road','지족로364번길 · 포유하우스 앞',56,64,-38,138,'road',0,true);flat(8,176,60,50,0,asphalt);
  area('gs25-alley','GS25 교차로 · 상가 골목',-70,56,-5,5,'road',0,true);flat(126,10,-7,0,.006,asphalt);
  area('cafe-road','투썸 옆길 · 옹벽 도로',-70,72,126,138,'road',0,true);flat(142,12,1,132,.008,asphalt);
  area('driveway','1층 차량 출입구',52,60,72,78,'road',0,true);flat(8,6,56,75,.01,asphalt);
  area('west-walk','건물 앞 보도',52,56,5,72,'sidewalk',.12);flat(4,67,54,38.5,.12,asphalt);
  area('west-walk-south','건물 앞 보도',52,56,78,126,'sidewalk',.12);flat(4,48,54,102,.12,asphalt);
  area('east-walk','가로수 보행로',64,69,-38,126,'sidewalk',.12);const eastWalkVisual=flat(5,164,66.5,44,.12,paving);eastWalkVisual.userData.exteriorPbrTarget=true;
  area('north-walk','GS25 앞 보도',-70,56,-8.2,-5,'sidewalk',.12);flat(126,3.2,-7,-6.6,.12,paving);
  area('alley-walk','요양병원 앞 보도',-70,56,5,8.2,'sidewalk',.12);flat(126,3.2,-7,6.6,.12,paving);
  area('south-walk','옹벽 앞 보도',-70,72,138,141.2,'sidewalk',.12);const southWalkVisual=flat(142,3.2,1,139.6,.12,paving);southWalkVisual.userData.exteriorPbrTarget=true;
  area('cafe-walk','카페 앞 보행 공간',-70,56,122.5,126,'sidewalk',.12);const cafeWalkVisual=flat(126,3.5,-7,124.25,.12,paving);cafeWalkVisual.userData.exteriorPbrTarget=true;
  area('forecourt','포유하우스 1층 보행 통로',22,56,22.5,27.2,'sidewalk',.08);flat(34,4.7,39,24.85,.08,concrete);
  // Low kerbs are walkable on foot, but keep wheels off the pedestrian pavement.
  for(const [x,a,b] of [[56,8,72],[56,78,122],[64,-38,122]]){box(.18,.18,b-a,x,.09,(a+b)/2,curb);block(x,(a+b)/2,.18,b-a,'kerb','curb');}
  for(const z of [-5,5,126,138]){box(120,.18,.18,-8,.09,z,curb);block(-8,z,120,.18,'kerb','curb');}
  function crossing(x,z,axis='z'){
    for(let i=-3;i<=3;i++)flat(axis==='z'?6.5:.55,axis==='z'?.55:7.5,x+(axis==='z'?0:i*.95),z+(axis==='z'?i*.95:0),.035,white);
    for(const side of [-1,1]){const dx=axis==='z'?side*5:0,dz=axis==='z'?0:side*5.4;flat(axis==='z'?.8:7,.8,x+dx,z+dz,.14,yellow);}
  }
  crossing(52,0,'x');crossing(60,119);crossing(50,132,'x');
  function bollard(x,z){box(.12,.85,.12,x,.425,z,dark);box(.135,.045,.135,x,.68,z,silver);block(x,z,.2,.2,'bollard');}
  for(const [x,z] of [[53,-6],[53,6],[55,120],[53,124],[65,120],[65,124],[51,124],[51,140]])bollard(x,z);
  const building=(...args)=>D.building(...args);
  // Poyu's narrow horizontal parking apertures, dark stone podium and pale residential tower.
  for(const [z,d] of [[18.6,1.2],[43,30],[65,14],[81,6]]){box(.28,3.65,d,52,1.825,z,tile);block(52,z,.28,d,'poyu-ground-wall');}
  box(.28,3.2,66,52,5.25,51,tile);box(.28,2.0,66,52,9.25,51,tile);
  // Horizontal recesses remain dark; deep reveals give the openings real depth.
  for(const z of [35,50,66,78]){box(.18,1.4,6.5,51.65,7.55,z,dark);box(.45,.11,6.65,51.9,6.83,z,concrete);box(.45,.11,6.65,51.9,8.27,z,concrete);}
  for(const [z,d] of [[24.6,13.2],[42.5,8.5],[58,9.5],[72.5,2.5],[82.7,2.3]])box(.28,1.4,d,52,7.55,z,tile);
  for(const z of [21,29,55,73,83]){box(.045,9.8,.045,52.18,4.9,z,silver);box(.1,.22,.08,52.21,2.8,z,dark);}
  D.plate('포 유 하 우 스',2.5,.35,52.20,2.65,24.85,Math.PI/2,'#5e5d64','#dbd9d1');
  box(1.3,.08,4.5,52.5,2.4,24.85,silver);for(const z of [22.75,26.95])D.bar([52.2,3,z],[53.1,2.4,z],.018,silver);
  for(const z of [22.65,27.05]){box(.16,2.6,.16,52.10,1.3,z,tile);box(.6,.2,.65,53,.1,z,curb);}
  const upper=new T.Group();upper.position.set(34,11,51);group.add(upper);
  box(36,22,66,0,11,0,S.lightStone,upper);box(36.5,.22,66.4,0,22.08,0,white,upper);
  const eastFace=new T.Group();eastFace.rotation.y=Math.PI/2;eastFace.position.x=18.04;upper.add(eastFace);
  for(let row=0;row<7;row++)for(let off=-30;off<32;off+=3.8){
    if((row===1||row===2)&&(Math.abs(off+26.2)<.01||Math.abs(off+22.4)<.01))continue;
    D.facadeWindow(eastFace,off,1.8+row*3,.04,1.5+(Math.round(off)%2===0?.5:0),1.8,(Math.round(off)+row)%3===0);
  }
  for(let row=0;row<7;row++)for(let off=-14;off<16;off+=3.6)D.facadeWindow(upper,off,1.8+row*3,33.05,2.1,1.9,row%3===0);
  // Photo 010024: the ramp mouth is on the road-facing east facade, beside the ground parking bay.
  for(const z of [71.9,78.1])box(.28,3.65,.28,52,1.825,z,tile);
  box(.28,1.25,6.2,52,3.05,75,tile);
  box(.18,.18,6,52.18,2.34,75,yellow);
  D.plate('제한높이 2.3m',2.1,.25,52.22,2.35,75,Math.PI/2,'#deddd2','#343936');
  D.plate('포 유 하 우 스',3.4,.4,52.22,3.25,75,Math.PI/2,'#5e5d64','#e1dfd5');
  for(const z of [71.5,78.5]){box(.12,.8,.12,53,.4,z,yellow);box(.14,.17,.14,53,.5,z,dark);}
  const mirror=new T.Mesh(new T.SphereGeometry(.31,16,12),silver);mirror.scale.x=.12;mirror.position.set(52.25,1.95,78);group.add(mirror);
  const mirrorRim=new T.Mesh(new T.TorusGeometry(.32,.035,8,24),material(0xc3653e));mirrorRim.rotation.y=Math.PI/2;mirrorRim.position.copy(mirror.position);mirrorRim.position.x+=.02;group.add(mirrorRim);
  flat(3.7,.1,54,72,.025,white);flat(3.7,.1,54,78,.025,white);
  // 4F rooms and the original photo-based apartment stay above the sheltered ground passage.
  building('hospital',35,12,32,7,22,S.lightStone,'north','벤조인 요양병원');
  building('gs25',37,-20,28,22,22,S.lightStone,'south','GS25');

  building('twosome',42,110,20,25,31,S.lightStone,'east','A TWOSOME PLACE');
  // The GLTF storefront wraps around this corner; keep the original walkable paving.
  D.plate('A TWOSOME PLACE',10,.43,43,6.48,122.92,0,'#282b2f','#dddeda');
  flat(20,3.5,42,124.25,.13,S.palePaving);
  for(const [x,z,w,d,h] of [[-8,-20,18,22,15],[-35,-20,21,22,18],[-59,-20,17,22,13],[-8,20,20,23,17],[-35,20,22,23,15],[-59,20,16,23,16]])building('shop-'+x+'-'+z,x,z,w,d,h+6,S.lightStone,z<0?'south':'north',z<0?'상가 · 카페':'식당 · 생활용품');
  // Retaining wall, mature green strip and the parallel railway seen across the road.
  const endWallVisual=box(140,2.7,.5,0,1.35,142,S.retaining);endWallVisual.userData.exteriorPbrTarget=true;block(0,142,140,.5,'retaining-wall');
  D.plate('지족역 →',2.2,.42,67,2.25,125,Math.PI,'#2b635c','#e3e6d9');
  for(const z of [-25,-9,20,43,67,108])D.tree(66.5,z,1.0);
  for(const [x,z] of [[54,10],[54,82],[66,120],[-40,-6.5]])D.lamp(x,z,6);
  for(const [x,z,h,c] of [[57.0,40,Math.PI/2,0xb1b4ae],[57.0,64,Math.PI/2,0x343b48],[63.0,74,-Math.PI/2,0x989a92],[57.0,108,Math.PI/2,0xc3c5bf],[-12,-3,0,0x536473],[-26,3,Math.PI,0xb9beb7],[-45,-3,0,0x555b62],[-24,129,0,0x748086],[57,48,Math.PI/2,0x3b4247],[63,55,-Math.PI/2,0xb7b9b3],[57,27,Math.PI/2,0x989f9e],[63,32,-Math.PI/2,0x56616b],[57,16,Math.PI/2,0xd1cec6],[63,14,-Math.PI/2,0x3e4a54],[63,82,-Math.PI/2,0x4d5662],[57,102,Math.PI/2,0xd0cec5],[63,115,-Math.PI/2,0xa5b0b5],[-34,-3,0,0xb1bab4],[-51,3,Math.PI,0x76818c]])D.car(x,z,h,c);
  D.detailGround();D.context();
  const journey=window.buildPoyuMartRoute(T,{group,S,D,box,flat,block,area,roads,floors,rooms});
  // The 2F ramp turns toward the street-facing entrance shown in the reference photo.
  const rampGroup=new T.Group();rampGroup.name='parking-down-ramp';scene.add(rampGroup);
  const rise=groundY-parkingY;
  function rampHeight(x,z){const t=Math.max(0,Math.min(1,(z-58)/14));return z<=72?parkingY+rise*t*(.7+.3*(x-44)/8):parkingY+rise*(.7+.3*(x-44)/8);}
  function rampPanel(x0,x1,z0,z1){const verts=[x0,rampHeight(x0,z0),z0,x1,rampHeight(x1,z0),z0,x1,rampHeight(x1,z1),z1,x0,rampHeight(x0,z1),z1],g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(verts,3));g.setAttribute('uv',new T.Float32BufferAttribute([(x0-44)/6,(z0-58)/4,(x1-44)/6,(z0-58)/4,(x1-44)/6,(z1-58)/4,(x0-44)/6,(z1-58)/4],2));g.setIndex([0,2,1,0,3,2]);g.computeVertexNormals();const mesh=new T.Mesh(g,concrete);mesh.receiveShadow=true;rampGroup.add(mesh);}
  // Subdivide the twisted transition so its visible surface matches rampHeight.
  for(let x=44;x<50;x+=.5)for(let z=58;z<72;z+=.5)rampPanel(x,x+.5,z,z+.5);
  rampPanel(44,52,72,78);
  window.batchPoyuStatics(T,rampGroup);
  for(const x of [43.8,50.2]){const o=box(.3,.8,Math.hypot(14,rise*.8),x,parkingY-groundY+rise*.38+.4,65,tile);o.rotation.x=-Math.atan(rise*.8/14);block(x,65,.3,14,'ramp-side','wall',rampColliders);}
  box(8,.8,.3,48,parkingY-groundY+rise*.86+.4,78.2,tile);block(48,78.2,8,.3,'ramp-turn-side','wall',rampColliders);
  const tunnelY=parkingY-groundY+rise*.42,roof=box(6.7,.16,10.2,47,tunnelY+2.65,63.2,concrete);roof.rotation.x=-Math.atan(rise*.8/14);
  for(const x of [43.8,50.2]){const o=box(.25,2.6,10.2,x,tunnelY+1.3,63.2,concrete);o.rotation.x=-Math.atan(rise*.8/14);}
  for(const z of [62,68]){const h=rampHeight(47,z)-groundY;box(1.3,.04,.15,47,h+2.5,z,white);}
  for(let z=59;z<72;z+=2){const height=rampHeight(47,z)-groundY;const stripe=box(5.4,.018,.08,47,height+.012,z,white);stripe.rotation.x=-Math.atan(rise*.8/14);}
  box(.38,1.05,.38,53,.525,71.5,yellow);block(53,71.5,.45,.45,'gate-post');
  const armPivot=new T.Group();armPivot.position.set(53,.95,71.8);armPivot.userData.dynamic=true;group.add(armPivot);box(.12,.11,6.2,0,0,3.1,white,armPivot);for(let z=.25;z<6.2;z+=.8)box(.135,.12,.34,0,0,z,new T.MeshStandardMaterial({color:0xb74f44}),armPivot);
  const gateCollider=block(53,75,.14,6.2,'gate-arm','wall',rampColliders);colliders.push(gateCollider);
  const state={gateOpen:0,gateTarget:0};
  // User-confirmed photo basis. Axes describe this game layout, not surveyed compass bearings.
  const referenceViews={front:{photo:'010024',name:'포유하우스 정면',x:60,z:75,yaw:Math.PI},right:{photo:'010040',name:'정면 기준 오른쪽 도로',x:60,z:75,yaw:-Math.PI/2},left:{photo:'010050',name:'정면 기준 왼쪽 도로',x:60,z:75,yaw:Math.PI/2}};
  const infected=[];
  for(const [i,x,z,patrol] of [[0,66.5,96,[[66,96],[66,105],[65,89]]],[1,54.0,53,[[54,53],[54,68],[54,43]]],[2,51,0,[[51,0],[48,6.5],[58,7]]]]){
    const zombie=window.createPoyuZombie(T,{scene:group,texture,worker:true,variant:i});zombie.root.name='sanitation-infected-'+i;
    infected.push({id:i,zombie,spawn:{x,z},patrol,worker:true,zone:'poyu'});
  }
  const martInfected=[
    [173,440,[[173,440],[178,440],[172,444]]],
    [192,440,[[192,440],[194,442],[189,444]]],
    [205,453,[[205,453],[210,456],[205,462]]],
    [176,477,[[176,477],[183,477],[177,473]]],
    [218,365,[[218,365],[218.4,370],[217.5,361]]],
    [222,405,[[222,405],[222.6,409],[221.6,401]]],
    [225,438,[[225,438],[225.3,442],[224.6,434]]],
    [199.5,316,[[199.5,316],[200,321],[199.2,313]]],
    [199,473,[[199,473],[204,473],[200,477]]],
    [183,458,[[183,458],[188,458],[183,462]]]
  ];
  martInfected.forEach(([x,z,patrol],i)=>{
    const zombie=window.createPoyuZombie(T,{scene:group,texture,variant:i+3});zombie.root.name='mart-infected-'+i;
    infected.push({id:i+3,zombie,spawn:{x,z},patrol,worker:false,zone:'mart',patrolSpeed:.45+(i%3)*.07,chaseSpeed:1.48+(i%3)*.12});
  });
  function reset(){state.gateOpen=0;state.gateTarget=0;gateCollider.enabled=true;armPivot.rotation.x=0;for(const a of infected){a.zombie.root.visible=true;a.zombie.root.position.set(a.spawn.x,0,a.spawn.z);}}
  function update(dt,time,car,hasKey){
    const p=car.vehicle.root.position,near=car.state.engine&&hasKey&&Math.hypot(p.x-53,p.z-75)<12;
    state.gateTarget=near?1:state.gateTarget;if(car.state.level==='floor1'&&p.x>58)state.gateTarget=0;
    state.gateOpen+=(state.gateTarget-state.gateOpen)*Math.min(1,dt*5);armPivot.rotation.x=-state.gateOpen*Math.PI*.48;gateCollider.enabled=state.gateOpen<.94;
    D.update(time);journey.update(time);
  }
  function rampSurface(x,z){if((x>=44&&x<=50&&z>=58&&z<=72)||(x>=44&&x<=52&&z>=72&&z<=78))return {level:'ramp',y:rampHeight(x,z),slopeX:rise*.3/8*Math.min(1,(z-58)/14),slopeZ:z<72?rise*(.7+.3*(x-44)/8)/14:0,name:'2층 → 1층 경사로'};return null;}
  reset();
  return {group,journey,referenceViews,details:D,landmarks:D.landmarks,colliders,floors,rooms,roads,rampFloors,rampColliders,rampSurface,infected,state,groundY,exteriorSurfaces:{eastWalkVisual,southWalkVisual,cafeWalkVisual,endWallVisual},reset,update,bounds:journey.bounds,route:[{x:27.2,z:32},{x:44,z:32},{x:47,z:40},{x:47,z:54},{x:47,z:68},{x:47,z:75},{x:55,z:75},{x:58,z:76},{x:60,z:80},{x:60,z:117},{x:50,z:132}]};
};

// Share repeated static geometry while animated people, car and barrier keep their own transforms.
window.batchPoyuStatics=function batchPoyuStatics(T,group){
  group.updateWorldMatrix(true,true);const inverse=new T.Matrix4().copy(group.matrixWorld).invert(),buckets=new Map();
  group.traverse(o=>{
    if(!o.isMesh||o.isInstancedMesh||o.userData.rounded||o.userData.exteriorPbrTarget||Array.isArray(o.material)||o.material.transparent)return;
    for(let p=o;p&&p!==group;p=p.parent)if(p.userData.dynamic)return;
    const type=o.geometry.type,params=o.geometry.parameters;
    const simple=type==='BoxGeometry'||type==='CylinderGeometry'&&params.radiusTop===params.radiusBottom;
    if(!simple&&!['BufferGeometry','PlaneGeometry','TorusGeometry','SphereGeometry'].includes(type))return;
    const key=o.layers.mask+':'+(simple?type:'merged-shapes')+o.material.uuid+(simple?params.radialSegments||'':'');if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push(o);
  });
  let combined=0,batches=0;
  for(const meshes of buckets.values()){
    if(meshes.length<2)continue;const first=meshes[0],cylinder=first.geometry.type==='CylinderGeometry';
    // Geometry UVs carry dimensions in metres. Instancing a unit cube would stretch
    // every brick and paving block over an entire wall or road, so retain those UVs.
    if(first.material.userData.tileSize||!['BoxGeometry','CylinderGeometry'].includes(first.geometry.type)){
      const positions=[],normals=[],uvs=[],indices=[];let offset=0;
      for(const m of meshes){const g=m.geometry.clone(),matrix=new T.Matrix4().multiplyMatrices(inverse,m.matrixWorld);g.applyMatrix4(matrix);positions.push(...g.attributes.position.array);normals.push(...g.attributes.normal.array);uvs.push(...g.attributes.uv.array);for(const i of g.index.array)indices.push(i+offset);offset+=g.attributes.position.count;g.dispose();m.parent.remove(m);m.geometry.dispose();}
      const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setAttribute('normal',new T.Float32BufferAttribute(normals,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));geo.setIndex(indices);geo.computeBoundingSphere();
      const batch=new T.Mesh(geo,first.material);batch.layers.mask=first.layers.mask;batch.castShadow=true;batch.receiveShadow=true;batch.name='metre-scaled-'+first.material.name;group.add(batch);combined+=meshes.length;batches++;continue;
    }
    const geo=cylinder?new T.CylinderGeometry(1,1,1,first.geometry.parameters.radialSegments):new T.BoxGeometry(1,1,1),batch=new T.InstancedMesh(geo,first.material,meshes.length);batch.castShadow=true;batch.receiveShadow=true;
    meshes.forEach((m,i)=>{const p=m.geometry.parameters,scale=cylinder?new T.Matrix4().makeScale(p.radiusTop,p.height,p.radiusTop):new T.Matrix4().makeScale(p.width,p.height,p.depth);batch.setMatrixAt(i,new T.Matrix4().multiplyMatrices(inverse,m.matrixWorld).multiply(scale));m.parent.remove(m);m.geometry.dispose();});
    batch.layers.mask=first.layers.mask;batch.instanceMatrix.needsUpdate=true;group.add(batch);combined+=meshes.length;batches++;
  }
  return {combined,batches};
};
