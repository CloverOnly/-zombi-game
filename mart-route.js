/* Naver route checked 2026-10-25: Jijok-ro 364beon-gil -> Bukyuseong-daero
 * -> Chimsindae intersection -> Noeun-ro -> Lotte Mart Noeun (607m).
 * Local axes follow the boulevard. Footprints/widths are visual estimates;
 * wrecks and the emergency use of the opposite carriageway are fictional. */
window.buildPoyuMartRoute=function(T,{group,S,D,box,flat,block,area,roads,floors,rooms}){
  const wrecks=[],hazards=[],smoke=[],signals=[];
  const color=(c,r=.85)=>new T.MeshStandardMaterial({color:c,roughness:r});
  const green=color(0x68725a),trim=color(0x444b4b),sand=new T.MeshStandardMaterial({map:S.lightStone.map,bumpMap:S.lightStone.bumpMap,bumpScale:.006,color:0xc2b18c,roughness:.82}),red=color(0x9b3335);
  sand.userData.tileSize=2.4;
  function polygon(id,name,points,material,height=0,drive=false,kind='road'){
    const xs=points.map(p=>p[0]),zs=points.map(p=>p[1]);
    const r={id,name,points,minX:Math.min(...xs),maxX:Math.max(...xs),minZ:Math.min(...zs),maxZ:Math.max(...zs),height,kind};
    r.labelX=(r.minX+r.maxX)/2;r.labelZ=(r.minZ+r.maxZ)/2;
    floors.push(r);rooms.push(r);if(drive)roads.push(r);
    const shape=new T.Shape();points.forEach(([x,z],i)=>i?shape.lineTo(x,-z):shape.moveTo(x,-z));shape.closePath();
    const g=new T.ShapeGeometry(shape);g.rotateX(-Math.PI/2);
    const uv=g.attributes.uv,p=g.attributes.position,scale=material.userData.tileSize||2;
    for(let i=0;i<p.count;i++)uv.setXY(i,p.getX(i)/scale,p.getZ(i)/scale);
    const mesh=new T.Mesh(g,material);mesh.position.y=height;mesh.receiveShadow=true;group.add(mesh);return r;
  }
  function strip(id,name,a,b,width,mat=S.asphalt,drive=true,height=.012,kind='road'){
    const dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz),nx=-dz/len*width/2,nz=dx/len*width/2;
    return polygon(id,name,[[a[0]+nx,a[1]+nz],[b[0]+nx,b[1]+nz],[b[0]-nx,b[1]-nz],[a[0]-nx,a[1]-nz]],mat,height,drive,kind);
  }
  function line(a,b,width,mat){const dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz),o=flat(width,len,(a[0]+b[0])/2,(a[1]+b[1])/2,.036,mat);o.rotation.y=Math.atan2(dx,dz);}
  function dashes(a,b,offset){const dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz),nx=-dz/len*offset,nz=dx/len*offset;for(let s=5;s<len-5;s+=8)line([a[0]+dx*s/len+nx,a[1]+dz*s/len+nz],[a[0]+dx*(s+3)/len+nx,a[1]+dz*(s+3)/len+nz],.11,S.white);}
  // A connected service-road exit, followed by 209m of the real boulevard.
  // Leave a real opening below the building for its basement; a single terrain
  // slab across the footprint would hide the food hall and travelator shaft.
  flat(251,650,-9.5,230,-.18,green);flat(137,650,266.5,230,-.18,green);
  flat(82,446,157,128,-.18,green);flat(82,120,157,495,-.18,green);
  area('boulevard-walk','북유성대로 보도',76,106,-55,505,'sidewalk',.10);flat(30,560,91,225,.10,S.palePaving);
  area('boulevard','북유성대로',80.5,101.5,-55,505,'road',.115,true);flat(21,560,91,225,.115,S.asphalt);
  // Road floor has precedence over the larger pavement envelope.
  floors.find(r=>r.id==='boulevard-walk').excludeRoads=true;
  area('main-join','북유성대로 진입',60,92,126,138,'road',.13,true);flat(32,12,76,132,.13,S.asphalt);
  for(const x of [84,87.5,94.5,98])for(let z=-49;z<499;z+=8)if(Math.abs(z-132)>12&&Math.abs(z-341)>18)flat(.11,3,x,z,.14,S.white);
  for(const [a,b] of [[-55,116],[149,192],[282,319],[365,505]]){
    box(.75,.22,b-a,91,.22,(a+b)/2,S.lightStone);block(91,(a+b)/2,.75,b-a,'boulevard-median','curb');
    for(const x of [90.35,91.65])flat(.12,b-a,x,(a+b)/2,.15,S.yellow);
  }
  const noeun=[[91,341],[128,319],[203,286]],access=[[203,286],[221,472]];
  for(let i=0;i<2;i++){
    strip('noeun-walk-'+i,'노은로 보도',noeun[i],noeun[i+1],25,S.palePaving,false,.10,'sidewalk');
    strip('noeun-'+i,'노은로 · 송림네거리 방향',noeun[i],noeun[i+1],19,S.asphalt,true,.13);
    dashes(noeun[i],noeun[i+1],4.5);dashes(noeun[i],noeun[i+1],-4.5);line(noeun[i],noeun[i+1],.17,S.yellow);
  }
  strip('mart-access-walk','롯데마트 옆 보도',access[0],[223,485],17,S.palePaving,false,.10,'sidewalk');
  strip('mart-access','롯데마트 진입도로',access[0],[223,485],11,S.asphalt,true,.13);dashes(access[0],access[1],0);
  for(const [i,c] of [[0,noeun[1]],[1,noeun[2]]]){
    const points=Array.from({length:16},(_,k)=>[c[0]+Math.cos(k*Math.PI/8)*9.5,c[1]+Math.sin(k*Math.PI/8)*9.5]);
    polygon('noeun-junction-'+i,'노은로 교차로',points,S.asphalt,.131,true).hideLabel=true;
  }
  area('mart-forecourt','롯데마트 주차 진입',171,224,442,480,'road',.13,true);flat(53,38,197.5,461,.13,S.asphalt);
  area('mart-entry-walk','롯데마트 출입구',170,200,435,445,'sidewalk',.13);flat(30,10,185,440,.16,S.palePaving);
  // Green wedge is across from Poyu, with the apartment estate set back beyond it.
  polygon('songrim-park','송림근린공원',[[108,-40],[194,-40],[198,267],[112,309]],green,.04,false,'outdoor');
  strip('park-path','송림근린공원 산책로',[116,-35],[119,295],2.5,S.paving,false,.08,'sidewalk');
  for(let z=-25;z<290;z+=18){D.tree(111+(z%3),z,1.45,false);D.tree(139+(z%5)*3,z+7,1.35,false);}
  for(const [x,z,w,d,h] of [[179,-15,23,38,40],[192,67,23,38,43],[198,157,24,44,40]]){
    D.building('songrim-estate-'+z,x,z,w,d,h,S.lightStone,'north','');
  }
  D.plate('송림근린공원',3.4,.5,109,1.4,172,Math.PI/2,'#606b54','#deded0');
  // Station entrance is recessed on the west side of Chimsindae intersection.
  box(3.9,.18,8,72,2.5,352,S.metal);box(3.6,.10,7.7,72,2.64,352,S.shopGlass);
  for(const [x,z] of [[70.3,348.3],[73.7,348.3],[70.3,355.7],[73.7,355.7]])D.bar([x,.2,z],[x,2.5,z],.05,S.metal);
  flat(3.5,7.5,72,352,.12,trim);D.plate('① 지족역  JIJOK',4,.58,72,2.4,356.05,0,'#367650','#e3e8dd');
  D.landmarks.push({id:'jijok-station',name:'지족역',x:72,z:352,width:4,depth:8,height:3});
  D.plate('침신대네거리',6,.75,84,5.8,329,Math.PI,'#286258','#e4e7d7');
  D.plate('롯데마트 ↗',4.5,.65,104,2.3,331,Math.PI,'#295e51','#eeeade');
  // Real building mass is broad and low, with warm stone and horizontal dark glazing.
  const mall=new T.Group();mall.name='lotte-mart-noeun';mall.position.set(157,0,393);group.add(mall);
  box(82,12.55,84,0,10.725,0,sand,mall);
  for(const side of [-1,1]){box(.20,4.45,84,side*41,2.225,0,sand,mall);block(157+side*41,393,.2,84,'lotte-mart-side');}
  box(82,4.45,.2,0,2.225,-42,sand,mall);block(157,351,82,.2,'lotte-mart-back');
  for(const [x,w] of [[147.7,63.4],[193.2,9.6]])block(x,435,w,.20,'lotte-mart-front');
  for(const side of [-1,1]){
    const face=new T.Group();face.position.set(side*41,0,0);face.rotation.y=side*Math.PI/2;mall.add(face);
    for(const yy of [5.5,9.3,13.1]){box(75,2.5,.12,0,yy,.10,S.vehicleGlass,face);for(let xx=-37;xx<=37;xx+=2.6)box(.085,2.5,.15,xx,yy,.2,trim,face);}
    for(let xx=-40;xx<=40;xx+=8)box(.17,16,.13,xx,8,.25,sand,face);
    // Ventilated parking levels read as fine horizontal louvers rather than apartment windows.
    for(let yy=4.5;yy<14.4;yy+=.28)box(64,.045,.24,-3,yy,.30,S.metal,face);
  }
  for(let xx=-39.6;xx<41;xx+=2.4)box(.016,16,.025,xx,8,42.075,trim,mall);
  for(let yy=1.2;yy<17;yy+=1.2)box(81.8,.012,.025,0,yy,42.08,trim,mall);
  box(29,4.7,.10,-21,8.8,42.10,S.vehicleGlass,mall);
  for(let xx=-35;xx<-7;xx+=1.35)box(.06,4.8,.20,xx,8.8,42.17,S.metal,mall);
  for(let yy=6.6;yy<11.1;yy+=.28)box(29,.045,.18,-21,yy,42.22,S.metal,mall);
  for(let x=-39;x<40;x+=3){if(157+x>179&&157+x<188)continue;box(2.87,3,.12,x,2,42.06,S.shopGlass,mall);box(.07,3.2,.15,x-1.48,2,42.14,trim,mall);}
  box(82,.35,84,0,17.1,0,S.lightStone,mall);box(34,.2,4.5,21,3.7,43.6,S.metal,mall);
  D.plate('LOTTE Mart',19,2.7,17,14.2,42.15,0,'#b6aa87','#9c343a',mall);
  D.plate('롯데마트 노은점',14,.95,24,3,42.18,0,'#404c49','#e6e2d5',mall);
  D.landmarks.push({id:'lotte-mart',name:'롯데마트 노은점',x:157,z:393,width:82,depth:84,height:17});
  for(let x=172;x<198;x+=2.7){flat(.10,5.2,x,469,.155,S.white);}
  for(const [x,z,h,c] of [[174,468,Math.PI/2,0x727c7c],[179.4,468,Math.PI/2,0xb0b4b1],[190.2,468,Math.PI/2,0x4b5156],[219.6,410,Math.PI/2,0x8f979c]])D.car(x,z,h,c);
  for(let i=0;i<4;i++){D.rail(198,438+i*1.2,3);box(.55,.8,.9,198,.5,438+i*1.2,S.metal);}
  for(const [x,z] of [[111,351],[211,275],[225,320],[225,380],[225,447],[169,442]])D.tree(x,z,1.3);
  for(let z=-28;z<500;z+=32){for(const [x,pz] of [[78,z],[104,z+10]])if(!roads.some(r=>window.poyuAreaContains(r,x,pz)))D.lamp(x,pz,8);}
  for(let z=307;z<480;z+=35)D.lamp(229,z,7,false);
  // Intersection markings and powered but malfunctioning amber signals.
  for(const z of [321,361])for(let x=82;x<102;x+=1.05)flat(.55,4,x,z,.155,S.white);
  for(const [x,z] of [[78,323],[104,361],[202,277]]){
    D.bar([x,0,z],[x,6,z],.07,S.metal);D.bar([x,5.9,z],[x+7,5.9,z],.05,S.metal);box(1.2,.43,.28,x+6,5.9,z,trim);
    const bulb=new T.Mesh(new T.SphereGeometry(.13,10,6),new T.MeshStandardMaterial({color:0xd39e40,emissive:0xb46e14,emissiveIntensity:1}));bulb.position.set(x+6,5.9,z+.17);group.add(bulb);signals.push(bulb);
  }
  // Three damaged vehicles close the southbound carriageway. The clear opposite
  // carriageway is reachable through breaks in the median at 192..266m.
  const crashAt={x:86,z:234};
  for(const [i,x,z,heading,c] of [[0,82.4,233,.12,0x8a9899],[1,86.2,234,-.17,0xbaa9a0],[2,89.1,233.8,.63,0x475964]]){
    const root=D.car(x,z,heading,c,false);root.name='wreck-'+i;root.userData.dynamic=true;root.rotation.z=i===2?.16:-.035;
    root.traverse(o=>{if(o.name==='car-body'){const p=o.geometry.attributes.position;for(let k=0;k<p.count;k++)if(p.getZ(k)>.9){p.setZ(k,p.getZ(k)-.30*(p.getZ(k)-.9));p.setY(k,p.getY(k)+.07*Math.sin(k*9));}p.needsUpdate=true;o.geometry.computeVertexNormals();o.material.color.multiplyScalar(.7);}});
    window.batchPoyuStatics(T,root);
    const cw=Math.abs(Math.cos(heading))*3.8+Math.abs(Math.sin(heading))*1.72,cd=Math.abs(Math.sin(heading))*3.8+Math.abs(Math.cos(heading))*1.72;
    Object.assign(block(x,z,cw+.12,cd+.18,'crash-car-'+i,'wreck'),{heading,length:3.92,width:1.90});wrecks.push({x,z,width:cw,depth:cd});
    for(const side of [-1,1]){const lamp=new T.Mesh(new T.BoxGeometry(.18,.09,.06),new T.MeshBasicMaterial({color:0xe0a04b}));lamp.position.set(side*.62,.55,-1.85);root.add(lamp);hazards.push(lamp);}
    const hood=box(1.25,.045,.65,0,.83,1.35,S.dark,root);hood.rotation.x=.27;
  }
  // Small physical debris stays inside the blocked lane, never in the detour.
  for(let i=0;i<25;i++){const x=81+(i*1.73)%9,z=229+(i*3.1)%9,o=box(.07+(i%3)*.04,.03,.10,x,.16,z,i%3?S.vehicleGlass:S.dark);o.rotation.y=i*2.4;}
  const smokeMap=D.smokeMap?.();
  if(smokeMap){const sm=new T.SpriteMaterial({map:smokeMap,color:0x8d9290,transparent:true,opacity:.14,depthWrite:false});for(let i=0;i<9;i++){const p=new T.Sprite(sm.clone());group.add(p);smoke.push({p,phase:i/9});}}
  D.plate('사고 · 통행 불가',3.5,.5,85,1.4,225,Math.PI,'#443b32','#e2c286');
  for(const x of [83.65,86.35]){D.bar([x,.15,225],[x,1.6,225],.024,S.metal);D.bar([x,.15,224.5],[x,1.25,225],.024,S.metal);box(.45,.10,.7,x,.07,225,S.dark);}
  const destination={x:183,z:438,range:4.5},parkingPoint={x:185,z:454};
  const route=[[60,93],[60,132],[86,132],[86,194],[96,211],[96,258],[86,279],[86,332],[101,336],[128,319],[196,290],[204,300],[219,451],[201,456],[185,454]].map(([x,z])=>({x,z}));
  function update(time){for(const h of hazards)h.visible=Math.sin(time*7)>.1;for(const b of signals)b.material.emissiveIntensity=Math.sin(time*3)>0?1.8:.15;for(const {p,phase} of smoke){const u=(time*.12+phase)%1;p.position.set(85+u*1.3,1.2+u*4.5,233+Math.sin(u*4)*.3);p.scale.setScalar(.5+u*2.5);p.material.opacity=(1-u)*.13;}}
  return {route,wrecks,crashAt,destination,parkingPoint,update,bounds:{minX:-70,maxX:238,minZ:-55,maxZ:505}};
};
window.poyuAreaContains=function(r,x,z){
  if(x<r.minX||x>r.maxX||z<r.minZ||z>r.maxZ)return false;
  if(!r.points)return true;let inside=false;
  for(let i=0,j=r.points.length-1;i<r.points.length;j=i++){const a=r.points[i],b=r.points[j];if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])inside=!inside;}
  return inside;
};
