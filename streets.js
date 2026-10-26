/* Playable reconstruction from the nine supplied street-view photographs.
 * Connections and landmarks follow the references; obscured widths are game estimates. */
window.buildPoyuStreets=function buildPoyuStreets(T,{scene,mat,texture,parkingY,groundY,surfaces}){
  const group=new T.Group();group.name='jijok-street-reference';group.position.y=groundY;scene.add(group);
  const colliders=[],floors=[],rooms=[],roads=[],rampColliders=[],rampFloors=[{minX:44,maxX:50,minZ:58,maxZ:86}];
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
  area('driveway','1층 차량 출입구',43.5,60,86,99,'road',0,true);flat(16.5,13,51.75,92.5,.01,asphalt);
  area('west-walk','건물 앞 보도',52,56,5,126,'sidewalk',.12);flat(4,121,54,65.5,.12,asphalt);
  area('east-walk','가로수 보행로',64,69,-38,126,'sidewalk',.12);flat(5,164,66.5,44,.12,paving);
  area('north-walk','GS25 앞 보도',-70,56,-8.2,-5,'sidewalk',.12);flat(126,3.2,-7,-6.6,.12,paving);
  area('alley-walk','요양병원 앞 보도',-70,56,5,8.2,'sidewalk',.12);flat(126,3.2,-7,6.6,.12,paving);
  area('south-walk','옹벽 앞 보도',-70,72,138,141.2,'sidewalk',.12);flat(142,3.2,1,139.6,.12,paving);
  area('cafe-walk','카페 앞 보행 공간',-70,56,122.5,126,'sidewalk',.12);flat(126,3.5,-7,124.25,.12,paving);
  area('forecourt','포유하우스 1층 보행 통로',22,56,22.5,27.2,'sidewalk',.08);flat(34,4.7,39,24.85,.08,concrete);
  // Low kerbs are walkable on foot, but keep wheels off the pedestrian pavement.
  for(const [x,a,b] of [[56,8,86],[56,99,122],[64,-38,122]]){box(.18,.18,b-a,x,.09,(a+b)/2,curb);block(x,(a+b)/2,.18,b-a,'kerb','curb');}
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
  for(const [z,d] of [[18.6,1.2],[43,30],[70,28]]){box(.28,3.65,d,52,1.825,z,tile);block(52,z,.28,d,'poyu-ground-wall');}
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
  for(let row=0;row<7;row++)for(let off=-30;off<32;off+=3.8)D.facadeWindow(eastFace,off,1.8+row*3,.04,1.5+(Math.round(off)%2===0?.5:0),1.8,(Math.round(off)+row)%3===0);
  for(let row=0;row<7;row++)for(let off=-14;off<16;off+=3.6)D.facadeWindow(upper,off,1.8+row*3,33.05,2.1,1.9,row%3===0);
  // A tiled entrance elevation continues around the ramp; the clearance beam, warning stripes and mirror match photo 010024.
  box(7,7.4,.26,39.5,3.7,86,tile);box(2,7.4,.26,51.2,3.7,86,tile);box(6.4,4.85,.26,47,4.975,86,tile);
  box(6.15,.18,.18,47,2.34,85.8,yellow);for(let x=44.2;x<50;x+=.6)box(.28,.19,.19,x,2.34,85.81,dark);
  D.plate('제한높이 2.3m',2.1,.25,47,2.35,85.94,0,'#deddd2','#343936');
  D.plate('포 유 하 우 스',3.4,.4,45.0,3.15,86.17,0,'#5e5d64','#e1dfd5');
  for(const x of [43.4,50.6]){box(.12,.8,.12,x,.4,86.4,yellow);box(.14,.17,.14,x,.5,86.4,dark);}
  const mirror=new T.Mesh(new T.SphereGeometry(.31,16,12),silver);mirror.scale.z=.12;mirror.position.set(50,1.95,85.85);group.add(mirror);
  const mirrorRim=new T.Mesh(new T.TorusGeometry(.32,.035,8,24),material(0xc3653e));mirrorRim.position.copy(mirror.position);mirrorRim.position.z+=.02;group.add(mirrorRim);
  flat(.1,3.7,44,88.2,.025,white);flat(.1,3.7,50,88.2,.025,white);
  // 4F rooms and the original photo-based apartment stay above the sheltered ground passage.
  building('hospital',35,12,32,7,22,S.lightStone,'north','벤조인 요양병원');
  building('gs25',37,-20,28,22,22,S.lightStone,'south','GS25');

  building('twosome',42,110,20,25,31,S.lightStone,'east','A TWOSOME PLACE');
  // The cafe wraps around the corner with two-storey glazing, red logo bar and deep reveals.
  for(const x of [34.5,38.5,42.5,46.5,50.5]){box(3.5,3.8,.06,x,2.05,122.58,glass);box(.075,4,.12,x-1.75,2.05,122.64,silver);box(3.6,.07,.13,x,1.7,122.64,silver);}
  box(20,.75,.16,42,4.5,122.62,tile);D.plate('A TWOSOME PLACE',14,.48,42,4.5,122.72,0,'#303135','#d6d5d4');box(2.4,.09,.035,34.6,4.5,122.76,material(0xab3543));
  flat(20,3.5,42,124.25,.13,S.palePaving);
  for(const [x,z,w,d,h] of [[-8,-20,18,22,15],[-35,-20,21,22,18],[-59,-20,17,22,13],[-8,20,20,23,17],[-35,20,22,23,15],[-59,20,16,23,16]])building('shop-'+x+'-'+z,x,z,w,d,h+6,S.lightStone,z<0?'south':'north',z<0?'상가 · 카페':'식당 · 생활용품');
  // Retaining wall, mature green strip and the parallel railway seen across the road.
  box(140,2.7,.5,0,1.35,142,S.retaining);block(0,142,140,.5,'retaining-wall');
  D.plate('지족역 →',2.2,.42,67,2.25,125,Math.PI,'#2b635c','#e3e6d9');
  for(const z of [-25,-9,20,43,67,108])D.tree(66.5,z,1.0);
  for(const [x,z] of [[54,10],[54,75],[66,120],[-40,-6.5]])D.lamp(x,z,6);
  for(const [x,z,h,c] of [[57.0,40,Math.PI/2,0xb1b4ae],[57.0,64,Math.PI/2,0x343b48],[63.0,74,-Math.PI/2,0x989a92],[57.0,108,Math.PI/2,0xc3c5bf],[-12,-3,0,0x536473],[-26,3,Math.PI,0xb9beb7],[-45,-3,0,0x555b62],[-24,129,0,0x748086],[57,48,Math.PI/2,0x3b4247],[63,55,-Math.PI/2,0xb7b9b3],[57,27,Math.PI/2,0x989f9e],[63,32,-Math.PI/2,0x56616b],[57,16,Math.PI/2,0xd1cec6],[63,14,-Math.PI/2,0x3e4a54],[63,82,-Math.PI/2,0x4d5662],[57,102,Math.PI/2,0xd0cec5],[63,115,-Math.PI/2,0xa5b0b5],[-34,-3,0,0xb1bab4],[-51,3,Math.PI,0x76818c]])D.car(x,z,h,c);
  D.detailGround();D.context();
  const journey=window.buildPoyuMartRoute(T,{group,S,D,box,flat,block,area,roads,floors,rooms});
  // The descending surface joins 2F and 1F continuously, not by teleporting the car.
  const rampGroup=new T.Group();rampGroup.name='parking-down-ramp';scene.add(rampGroup);
  const vertices=[44,parkingY,58,50,parkingY,58,50,groundY,86,44,groundY,86],geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(vertices,3));geo.setAttribute('uv',new T.Float32BufferAttribute([0,0,1,0,1,7,0,7],2));geo.setIndex([0,2,1,0,3,2]);geo.computeVertexNormals();const ramp=new T.Mesh(geo,concrete);ramp.receiveShadow=true;rampGroup.add(ramp);
  const slope=(groundY-parkingY)/28;
  for(const x of [43.8,50.2]){const o=box(.3,.8,Math.hypot(28,groundY-parkingY),x,(parkingY+groundY)/2-groundY+.4,72,tile);o.rotation.x=-Math.atan(slope);block(x,72,.3,28,'ramp-side','wall',rampColliders);}
  const tunnelY=parkingY-groundY+slope*8.5,roof=box(6.7,.16,17.2,47,tunnelY+2.65,66.5,concrete);roof.rotation.x=-Math.atan(slope);
  for(const x of [43.8,50.2]){const o=box(.25,2.6,17.2,x,tunnelY+1.3,66.5,concrete);o.rotation.x=-Math.atan(slope);}
  for(const z of [62,70]){const h=parkingY-groundY+slope*(z-58);box(1.3,.04,.15,47,h+2.5,z,white);}
  for(let z=59;z<86;z+=2){const height=parkingY+slope*(z-58)-groundY;const stripe=box(5.4,.018,.08,47,height+.012,z,white);stripe.rotation.x=-Math.atan(slope);}
  box(.38,1.05,.38,43.7,.525,85.3,yellow);block(43.7,85.3,.45,.45,'gate-post');
  const armPivot=new T.Group();armPivot.position.set(43.8,.95,85.3);armPivot.userData.dynamic=true;group.add(armPivot);box(6.4,.11,.12,3.2,0,0,white,armPivot);for(let x=.25;x<6.4;x+=.8)box(.34,.12,.135,x,0,0,new T.MeshStandardMaterial({color:0xb74f44}),armPivot);
  const gateCollider=block(47,85.3,6.4,.14,'gate-arm','wall',rampColliders);
  const state={gateOpen:0,gateTarget:0};
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
  function reset(){state.gateOpen=0;state.gateTarget=0;gateCollider.enabled=true;armPivot.rotation.z=0;for(const a of infected){a.zombie.root.visible=true;a.zombie.root.position.set(a.spawn.x,0,a.spawn.z);}}
  function update(dt,time,car,hasKey){
    const p=car.vehicle.root.position,near=car.state.engine&&hasKey&&Math.hypot(p.x-47,p.z-85.3)<12;
    state.gateTarget=near?1:state.gateTarget;if(car.state.level==='floor1'&&p.z>100&&p.x>54)state.gateTarget=0;
    state.gateOpen+=(state.gateTarget-state.gateOpen)*Math.min(1,dt*5);armPivot.rotation.z=state.gateOpen*Math.PI*.48;gateCollider.enabled=state.gateOpen<.94;
    D.update(time);journey.update(time);
  }
  function rampSurface(x,z){if(x>=44&&x<=50&&z>=58&&z<=86)return {level:'ramp',y:parkingY+slope*(z-58),slopeZ:slope,name:'2층 → 1층 경사로'};return null;}
  reset();
  return {group,journey,details:D,landmarks:D.landmarks,colliders,floors,rooms,roads,rampFloors,rampColliders,rampSurface,infected,state,groundY,reset,update,bounds:journey.bounds,route:[{x:27.2,z:32},{x:44,z:32},{x:47,z:40},{x:47,z:54},{x:47,z:78},{x:47,z:93},{x:60,z:93},{x:60,z:117},{x:50,z:132}]};
};

// Share repeated static geometry while animated people, car and barrier keep their own transforms.
window.batchPoyuStatics=function batchPoyuStatics(T,group){
  group.updateWorldMatrix(true,true);const inverse=new T.Matrix4().copy(group.matrixWorld).invert(),buckets=new Map();
  group.traverse(o=>{
    if(!o.isMesh||o.isInstancedMesh||o.userData.rounded||Array.isArray(o.material)||o.material.transparent)return;
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
