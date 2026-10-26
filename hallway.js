/* Common hallway, shoe cabinet, baseball bat and one animated infected neighbour. */
window.buildPoyuHallway=function buildPoyuHallway(THREE,kit){
  const {scene,mat,box,bevelBox,wall,plane,line,cylinder,sphere,footprint,blocker,floorAreas,texture,homeDoor}=kit;
  const hallway=new THREE.Group();hallway.name='common-hallway';scene.add(hallway);
  let seed=6401;const random=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
  function flecks(g,w,h,count,base){g.fillStyle=base;g.fillRect(0,0,w,h);for(let i=0;i<count;i++){const v=55+Math.floor(random()*145);g.fillStyle=`rgba(${v},${v},${v},${.2+random()*.35})`;g.fillRect(random()*w,random()*h,.6+random()*2,.6+random()*1.6);}}
  const wallTex=texture(512,512,(g,w,h)=>{g.fillStyle='#e8e6e1';g.fillRect(0,0,w,h);for(let i=0;i<6500;i++){const v=125+Math.floor(random()*85);g.fillStyle=`rgba(${v},${v},${v},${.025+random()*.055})`;g.fillRect(random()*w,random()*h,1,1);}});
  const paint=new THREE.MeshStandardMaterial({color:0xf2f0eb,map:wallTex,bumpMap:wallTex,bumpScale:.003,roughness:.92});
  const doorPaint=new THREE.MeshStandardMaterial({color:0x303738,roughness:.64,metalness:.12});
  const trim=new THREE.MeshStandardMaterial({color:0x252a2b,roughness:.3});
  const floorTex=texture(1024,1024,(g,w,h)=>{
    g.fillStyle='#aeb2af';g.fillRect(0,0,w,h);
    for(let i=0;i<90000;i++){const v=70+Math.floor(random()*150);g.fillStyle=`rgba(${v},${v+2},${v+1},${.035+random()*.12})`;const x=random()*w,y=random()*h,s=.5+random()*2;g.fillRect(x,y,s,s);}
    for(let i=0;i<30;i++){g.strokeStyle=`rgba(68,77,75,${.012+random()*.023})`;g.lineWidth=.4+random()*1.2;const x=random()*w,y=random()*h;g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+random()*70-35,y+random()*35-17,x+random()*130-65,y+random()*80-40);g.stroke();}
    g.strokeStyle='rgba(58,65,62,.24)';g.lineWidth=5;g.strokeRect(2,2,w-4,h-4);
    g.strokeStyle='rgba(242,244,239,.17)';g.lineWidth=2;g.strokeRect(7,7,w-14,h-14);
  });
  const floorMat=new THREE.MeshStandardMaterial({map:floorTex,bumpMap:floorTex,bumpScale:.006,roughness:.67,metalness:0});
  const ceilingTex=texture(512,512,(g,w,h)=>{g.fillStyle='#e5e5e0';g.fillRect(0,0,w,h);for(let i=0;i<2400;i++){g.fillStyle=`rgba(115,121,119,${.018+random()*.045})`;g.fillRect(random()*w,random()*h,1,1);}g.strokeStyle='#a5a79f35';g.lineWidth=1;for(const x of[0,256]){g.beginPath();g.moveTo(x,0);g.lineTo(x,h);g.stroke();}for(const y of[0,256]){g.beginPath();g.moveTo(0,y);g.lineTo(w,y);g.stroke();}});
  const ceilingMat=new THREE.MeshStandardMaterial({map:ceilingTex,roughness:.95});
  function softEdge(axis){const t=texture(64,64,(g,w,h)=>{const grad=axis==='x'?g.createLinearGradient(0,0,w,0):g.createLinearGradient(0,0,0,h);grad.addColorStop(0,'rgba(24,30,29,0)');grad.addColorStop(.5,'rgba(24,30,29,.55)');grad.addColorStop(1,'rgba(24,30,29,0)');g.fillStyle=grad;g.fillRect(0,0,w,h);});return new THREE.MeshBasicMaterial({map:t,transparent:true,opacity:.28,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1});}
  const sideShade=softEdge('x'),edgeShade=softEdge('y');
  function footShade(w,d,x,z,m){const o=new THREE.Mesh(new THREE.PlaneGeometry(w,d),m);o.rotation.x=-Math.PI/2;o.position.set(x,.007,z);o.name='soft-wall-contact-shadow';hallway.add(o);}
  function metric(o,period=1){const p=o.geometry.attributes.position,n=o.geometry.attributes.normal,uv=o.geometry.attributes.uv;if(uv&&n)for(let i=0;i<p.count;i++){const a=Math.abs(n.getX(i)),b=Math.abs(n.getY(i)),c=Math.abs(n.getZ(i));uv.setXY(i,(a>b&&a>c?p.getZ(i):p.getX(i))/period,(b>a&&b>c?p.getZ(i):p.getY(i))/period);}return o;}
  function part(w,h,d,x,y,z,m,name=''){const o=box(w,h,d,x,y,z,m);metric(o,m===paint?.75:m===ceilingMat?1.2:1);o.name=name;hallway.add(o);return o;}
  function barrier(w,h,d,x,y,z,name){const o=part(w,h,d,x,y,z,paint,name);blocker(x,z,w,d,0,'wall',name);return o;}
  function section(x0,x1,z0,z1){floorAreas.push({minX:x0,maxX:x1,minZ:z0,maxZ:z1});part(x1-x0,.06,z1-z0,(x0+x1)/2,-.027,(z0+z1)/2,floorMat,'common-granite-floor');part(x1-x0,.10,z1-z0,(x0+x1)/2,2.65,(z0+z1)/2,ceilingMat,'common-acoustic-ceiling');}
  // 601 and 602 share the near end wall, just as 605 and 606 share the far end.
  // From 602 the passage continues straight; turning right enters 601's bay.
  section(16,36,8.4,13.2);section(16,20,13.2,17.2);section(24,31,13.2,20.4);section(32,36,13.2,19.2);
  function sideWall(x,a,b){if(b<=a)return;barrier(.14,2.6,b-a,x,1.3,(a+b)/2,'common-speckled-wall');part(.035,.095,b-a,x+(x>18?-.086:.086),.05,(a+b)/2,trim,'common-black-skirting');part(.10,.055,b-a,x,2.55,(a+b)/2,ceilingMat,'common-ceiling-cove');footShade(.52,b-a,x,(a+b)/2,sideShade);}
  function edgeWall(z,a,b){if(b<=a)return;barrier(b-a,2.6,.14,(a+b)/2,1.3,z,'common-speckled-wall');part(b-a,.095,.035,(a+b)/2,.05,z+(z>10?-.086:.086),trim,'common-black-skirting');part(b-a,.055,.10,(a+b)/2,2.55,z,ceilingMat,'common-ceiling-cove');footShade(b-a,.52,(a+b)/2,z,edgeShade);}
  sideWall(16,8.4,homeDoor.point.z-homeDoor.width/2-.02);
  sideWall(16,homeDoor.point.z+homeDoor.width/2+.02,14.85);
  sideWall(16,15.95,17.2);
  sideWall(20,13.2,14.82);sideWall(20,15.98,17.2);
  edgeWall(17.2,16,20);
  for(const [a,b] of [[20,24],[31,32]])edgeWall(13.2,a,b);
  for(const [a,b] of [[16,23.45],[24.55,28.45],[29.55,30.8],[32.8,36]])edgeWall(8.4,a,b);
  // The short return hides 601 when looking back from 605 while leaving the
  // straight walking route open along the opposite side of the passage.
  barrier(.14,2.6,2.1,25.5,1.3,12.15,'601-sightline-screen');
  part(.035,.095,2.1,25.40,.05,12.15,trim,'601-sightline-skirting');
  for(const [a,b] of [[8.4,9.95],[11.05,15.65],[16.75,19.2]])sideWall(36,a,b);
  sideWall(24,13.2,20.4);sideWall(31,13.2,20.4);
  sideWall(32,13.2,15.65);sideWall(32,16.75,19.2);
  edgeWall(19.2,32,36);
  for(const [a,b] of [[24,25.3],[26.9,27.9],[29.5,31]])edgeWall(20.4,a,b);
  barrier(2,1.35,.14,31.8,.675,8.4,'hall-window-sill');barrier(2,.30,.14,31.8,2.45,8.4,'hall-window-header');blocker(31.8,8.4,2,.14,0,'wall','hall-window');
  part(1.95,.95,.035,31.8,1.825,8.4,new THREE.MeshStandardMaterial({color:0x354346,roughness:.22,metalness:.1}),'hall-frosted-window');
  for(const x of[30.8,32.8])part(.045,1.02,.09,x,1.825,8.48,mat.white);for(const y of[1.32,2.33])part(2.09,.045,.09,31.8,y,8.48,mat.white);
  const luminaire=new THREE.MeshStandardMaterial({color:0xf3f6ee,emissive:0xe6eee9,emissiveIntensity:.8});
  for(const [x,z] of [[18,10.8],[18,15.3],[23,10.8],[28,10.8],[33,10.8],[27.5,17.5],[34,16.5]]){
    const o=cylinder(.19,.19,.045,x,2.565,z,luminaire,32);o.name='round-common-ceiling-light';hallway.add(o);
    const light=new THREE.PointLight(0xfff4e7,.92,6.8,2);light.position.set(x,2.40,z);light.layers.set(1);scene.add(light);
  }
  for(const x of[19,27,34]){const sensor=cylinder(.065,.075,.035,x,2.57,10.8,mat.white,20);hallway.add(sensor);const lens=sphere(.027,x,2.535,10.8,mat.white);hallway.add(lens);}
  function label(text){return texture(256,128,(g,w,h)=>{g.fillStyle='#273339';g.fillRect(0,0,w,h);g.strokeStyle='#b0b7b0';g.lineWidth=5;g.strokeRect(5,5,w-10,h-10);g.fillStyle='#e1e5df';g.font='bold 48px Malgun Gothic,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(text,w/2,h/2);});}
  const neighbours=[];
  function neighbour(id,number,x,z,side,description){
    const door=bevelBox(.10,2.16,1.10,x,1.10,z,doorPaint,.012);door.name=id;
    blocker(x,z,.12,1.18,0,'wall',id);
    for(const dz of [-.59,.59])box(.18,2.23,.07,x,1.115,z+dz,trim,false);
    box(.18,.06,1.25,x,2.23,z,trim,false);
    part(.14,.32,1.18,x,2.44,z,paint);
    const plaque=new THREE.MeshBasicMaterial({map:label(number),toneMapped:false});
    plane(.29,.145,x+side*.08,1.91,z,plaque,side>0?Math.PI/2:-Math.PI/2);
    box(.03,.27,.12,x+side*.09,1.24,z+.34,mat.black,false);
    line(x+side*.13,1.15,z+.34,x+side*.13,1.15,z+.17,mat.steel,.016);
    const indicator=sphere(.023,x+side*.1,1.83,z-.43,new THREE.MeshBasicMaterial({color:0x6d817b}));
    neighbours.push({id,number,x,z,range:1.65,name:number+'호 살펴보기',description,indicator});
  }
  function sideNeighbour(id,number,x,z,side,description){
    const door=bevelBox(1.10,2.16,.10,x,1.10,z,doorPaint,.012);door.name=id;
    blocker(x,z,1.18,.12,0,'wall',id);
    for(const dx of[-.59,.59])part(.07,2.23,.18,x+dx,1.115,z,trim);
    part(1.25,.06,.18,x,2.23,z,trim);part(1.18,.32,.14,x,2.44,z,paint);
    plane(.29,.145,x,1.91,z+side*.08,new THREE.MeshBasicMaterial({map:label(number),toneMapped:false}),side>0?0:Math.PI);
    part(.12,.27,.03,x+.34,1.24,z+side*.09,mat.black);
    const indicator=sphere(.023,x-.43,1.83,z+side*.10,new THREE.MeshBasicMaterial({color:0x6d817b}));
    neighbours.push({id,number,x,z,range:1.65,name:number+'호 살펴보기',description,indicator});
  }
  neighbour('neighbour402','601',16.03,15.4,1,'문은 잠겨 있다. 몇 번 불러도 대답이 없다. 안쪽에서는 TV 소리만 희미하게 들린다.');
  sideNeighbour('neighbour403','603',24,8.43,1,'문 아래에 구겨진 신문이 끼어 있다. 안쪽에서 무언가 끌리는 소리가 들렸다가 멎는다.');
  sideNeighbour('neighbour404','604',29,8.43,1,'생존자가 있다. 감염과 낯선 사람을 경계해 문을 열지 않는다. 2층에 주차장이 있다고 알려줬다.');
  neighbour('neighbour405','605',35.97,10.5,-1,'문은 닫혀 있다. 안에서는 아무 소리도 들리지 않는다.');
  neighbour('neighbour406','606',35.97,16.2,-1,'문이 잠겨 있다. 초인종을 눌러도 응답이 없다.');
  const ownPlaque=plane(.29,.145,0,0,0,new THREE.MeshBasicMaterial({map:label('602'),toneMapped:false}),Math.PI/2);scene.remove(ownPlaque);ownPlaque.position.set(.085,1.91,homeDoor.width/2);homeDoor.hinge.add(ownPlaque);
  for(const z of [homeDoor.point.z-homeDoor.width/2-.03,homeDoor.point.z+homeDoor.width/2+.03])box(.18,homeDoor.height+.07,.06,15.98,(homeDoor.height+.07)/2,z,mat.steel,false);
  box(.18,.07,homeDoor.width+.12,15.98,homeDoor.height+.035,homeDoor.point.z,mat.steel,false);
  const outerLock=box(.035,.30,.12,.11,1.27,homeDoor.width-.22,mat.black,false);scene.remove(outerLock);homeDoor.hinge.add(outerLock);
  const outerLever=line(.16,1.15,homeDoor.width-.22,.16,1.15,homeDoor.width-.40,mat.steel,.018);scene.remove(outerLever);homeDoor.hinge.add(outerLever);
  function serviceDoor(x,z,side,text){part(1.16,2.14,.09,x,1.08,z,doorPaint,'common-'+text);blocker(x,z,1.16,.13,0,'wall','service-'+text);for(const dx of[-.58,.58])part(.045,2.22,.16,x+dx,1.11,z,trim);part(1.24,.045,.16,x,2.22,z,trim);part(1.24,.38,.14,x,2.41,z,paint);plane(.31,.15,x,1.68,z+side*.09,new THREE.MeshBasicMaterial({map:label(text)}),side>0?0:Math.PI);}
  const nearStair=bevelBox(.10,2.14,1.16,19.97,1.08,15.4,doorPaint,.012);nearStair.name='common-계단실';
  blocker(19.97,15.4,.13,1.16,0,'wall','service-계단실-입구');
  for(const dz of[-.58,.58])part(.16,2.22,.045,19.97,1.11,15.4+dz,trim);
  part(.16,.045,1.24,19.97,2.22,15.4,trim);
  plane(.31,.15,19.88,1.68,15.4,new THREE.MeshBasicMaterial({map:label('계단실')}),-Math.PI/2);
  const farStair=bevelBox(.10,2.14,1.16,32.03,1.08,16.2,doorPaint,.012);farStair.name='common-계단실';
  blocker(32.03,16.2,.13,1.16,0,'wall','service-계단실-끝');
  for(const dz of[-.58,.58])part(.16,2.22,.045,32.03,1.11,16.2+dz,trim);
  part(.16,.045,1.24,32.03,2.22,16.2,trim);
  plane(.31,.15,32.12,1.68,16.2,new THREE.MeshBasicMaterial({map:label('계단실')}),Math.PI/2);
  const exitMap=texture(256,128,(g,w,h)=>{g.fillStyle='#f2fff8';g.fillRect(0,0,w,h);g.strokeStyle='#20ad88';g.fillStyle='#20ad88';g.lineWidth=12;g.beginPath();g.moveTo(40,45);g.lineTo(216,45);g.moveTo(66,20);g.lineTo(40,45);g.lineTo(66,70);g.moveTo(190,20);g.lineTo(216,45);g.lineTo(190,70);g.stroke();g.textAlign='center';g.font='bold 22px Malgun Gothic';g.fillText('비상구',w/2,112);});
  const exitMat=new THREE.MeshBasicMaterial({map:exitMap,toneMapped:false});
  const nearStairExit=plane(.30,.20,19.86,2.36,15.4,exitMat,-Math.PI/2);hallway.add(nearStairExit);
  const farStairExit=plane(.30,.20,32.14,2.36,16.2,exitMat,Math.PI/2);hallway.add(farStairExit);
  const extinguisher=new THREE.MeshStandardMaterial({color:0xb62c27,roughness:.4});
  part(.28,.035,.28,20,.025,8.8,extinguisher,'lobby-extinguisher-base');cylinder(.075,.085,.40,20,.23,8.8,extinguisher,20);line(20,.43,8.8,20,.52,8.8,mat.black,.014);line(19.98,.48,8.8,19.95,.30,8.91,mat.black,.012);
  part(.31,.66,.025,30.5,1.15,13.29,doorPaint,'hall-fire-panel');const led=sphere(.023,30.5,1.38,13.305,new THREE.MeshBasicMaterial({color:0xff3333}));hallway.add(led);
  const finishes={paint,floor:floorMat,ceiling:ceilingMat,door:doorPaint,trim,metric};

  function makeBat(){
    const b=new THREE.Group();
    function part(geo,material,x,y,z){const m=new THREE.Mesh(geo,material);m.position.set(x,y,z);m.castShadow=true;b.add(m);return m;}
    part(new THREE.CylinderGeometry(.022,.018,.32,16),mat.wood,0,.16,0);
    part(new THREE.CylinderGeometry(.055,.022,.64,20),mat.paleWood,0,.64,0);
    const tip=part(new THREE.SphereGeometry(.055,20,12),mat.paleWood,0,.96,0);tip.scale.y=.45;
    part(new THREE.CylinderGeometry(.027,.027,.025,16),mat.darkWood,0,.015,0);
    for(let i=0;i<9;i++){const ring=part(new THREE.TorusGeometry(.022,.004,5,16),mat.black,0,.06+i*.023,0);ring.rotation.x=Math.PI/2;}
    return b;
  }
  const cabinet=kit.buildEntryStorage(makeBat);

  const zombie=window.createPoyuZombie(THREE,{scene,texture});
  const held=new THREE.Group();held.name='equipped-baseball-bat';held.visible=false;const heldBat=makeBat();held.add(heldBat);
  const sleeve=new THREE.MeshStandardMaterial({color:0x34414a,roughness:1}),handSkin=new THREE.MeshStandardMaterial({color:0xb29b86,roughness:.9});
  for(const y of [.11,.22]){const hand=new THREE.Mesh(new THREE.SphereGeometry(.052,14,10),handSkin);hand.position.set(.014,y,.025);hand.scale.set(1,.7,1.2);held.add(hand);}
  const forearm=new THREE.Mesh(new THREE.CapsuleGeometry(.055,.26,4,12),sleeve);forearm.position.set(.07,-.06,.17);forearm.rotation.x=.8;held.add(forearm);
  held.traverse(o=>{if(o.isMesh){o.material=o.material.clone();o.material.depthTest=false;o.material.depthWrite=false;o.castShadow=false;o.renderOrder=1000;}});
  function attachWeapon(camera){camera.add(held);}
  function weaponPose(hasBat,swing,time){
    held.visible=hasBat;const a=swing>=0?Math.sin(swing*Math.PI):0;
    held.position.set(.38-a*.22,-.54+Math.sin(time*2)*.006,-.72-a*.15);held.rotation.set(-.15+a*.45,-.12-a*.35,-.22+a*1.45);
  }
  function reset(){
    cabinet.reset();zombie.root.visible=false;zombie.root.position.set(18.35,0,homeDoor.point.z);zombie.rig.rotation.set(0,0,0);homeDoor.reset();held.visible=false;
    for(const n of neighbours)n.indicator.material.color.setHex(0x6d817b);
  }
  reset();
  return {hallway,finishes,cabinet,zombie,neighbours,held,attachWeapon,weaponPose,reset,markInspected(id){neighbours.find(n=>n.id===id)?.indicator.material.color.setHex(0x8dc8a9);},room:{id:'common-hallway',name:'공용 복도 · 승강기 홀',kind:'corridor',minX:16,maxX:36,minZ:8.4,maxZ:20.4,labelX:26,labelZ:10.8}};
};
