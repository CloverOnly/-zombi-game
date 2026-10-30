/* Original parking deck and a hollow, boardable vehicle with a working driver door. */
window.buildPoyuParking=function buildPoyuParking(T,{scene,mat,texture,y,colliders,floorAreas,rooms,surfaces}){
  const group=new T.Group();group.name='floor2-parking';group.position.y=y;scene.add(group);
  const concreteMap=texture(256,256,(g,w,h)=>{g.fillStyle='#747c79';g.fillRect(0,0,w,h);let seed=17;for(let i=0;i<10000;i++){seed=(seed*1664525+1013904223)>>>0;g.fillStyle=i%2?'#d5dbd618':'#19252120';g.fillRect(seed%256,(seed>>>8)%256,1,1);}},8,8);
  const concrete=surfaces.garage,wallMat=surfaces.concrete;
  const yellow=new T.MeshStandardMaterial({color:0xc7ad66,roughness:.9}),stripe=new T.MeshStandardMaterial({color:0xd4d7ca,roughness:.9}),black=new T.MeshStandardMaterial({color:0x242c2d,roughness:.85});
  function mesh(w,h,d,x,cy,z,m,parent=group){const o=new T.Mesh(window.poyuBoxGeometry(T,w,h,d,m),m);o.position.set(x,cy,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
  function collider(x,z,w,d,id,kind='wall'){const c={minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2,kind,id};colliders.push(c);return c;}
  function wall(w,h,d,x,cy,z,m=wallMat,id='garage-wall'){mesh(w,h,d,x,cy,z,m);return collider(x,z,w,d,id);}
  function label(text,w,h,x,cy,z,rotation=0,parent=group){const map=texture(512,128,(g,cw,ch)=>{g.fillStyle='#284348';g.fillRect(0,0,cw,ch);g.fillStyle='#e0e6cf';g.textAlign='center';g.textBaseline='middle';g.font='bold 43px Malgun Gothic,sans-serif';g.fillText(text,cw/2,ch/2);});const o=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map,toneMapped:false}));o.position.set(x,cy,z);o.rotation.y=rotation;parent.add(o);return o;}
  floorAreas.push({minX:16,maxX:52,minZ:18,maxZ:58});rooms.push({id:'parking-deck',name:'2층 주차장',kind:'parking',minX:16,maxX:52,minZ:18,maxZ:58,labelX:34,labelZ:40});
  mesh(36,.16,40,34,-.075,38,concrete);mesh(36,.16,40,34,3.05,38,wallMat);
  wall(36,3,.18,34,1.5,18);wall(27.5,3,.18,29.75,1.5,58);wall(1.5,3,.18,51.25,1.5,58);
  wall(.18,3,3,16,1.5,19.5);wall(.18,3,29,16,1.5,43.5);
  // Open sides show the moving streets below without exposing an unguarded edge.
  wall(.18,.85,40,52,.425,38);mesh(.22,.32,40,52,2.88,38,wallMat);
  for(const z of [18.2,27,36,45,57.8]){wall(.45,3,.45,51.7,1.5,z);mesh(.47,.26,.47,51.7,.65,z,yellow);}
  for(const z of [20.2,39,55.8])for(const x of [20.2,36.5]){wall(.55,3,.55,x,1.5,z);mesh(.57,.32,.57,x,.70,z,yellow);}
  label('2F · 주차장',1.6,.38,16.11,2.25,25,Math.PI/2);
  label('출구 ←  엘리베이터',2.7,.34,21,2.15,18.11);
  label('1층 출구 ↓',2.6,.45,47,2.25,57.88,Math.PI);
  label('1층 출구 →',3.0,.45,51.88,1.7,34,-Math.PI/2);
  const glow=new T.MeshStandardMaterial({color:0xd6e3dc,emissive:0xc6dfd9,emissiveIntensity:.75});
  for(const x of [22,33,45])for(const z of [23,36,50]){mesh(2.3,.055,.18,x,2.95,z,glow);}
  for(const [x,z] of [[23,26],[34,36],[46,51]]){const l=new T.PointLight(0xd0e0d7,.9,18,2);l.position.set(x,2.65,z);group.add(l);}
  for(const x of [30,40])for(const z of [19.5,25,30.5,36.5,42,47.5,55.5])mesh(5,.012,.09,x,.017,z,stripe);
  for(const x of [32.55,42.55])mesh(.09,.012,36,x,.017,37.5,stripe);
  for(const z of [23,31,40,49,55])mesh(.12,.013,2,47,.019,z,yellow);
  const arrow=new T.Shape();arrow.moveTo(-.7,-.12);arrow.lineTo(.22,-.12);arrow.lineTo(.22,-.38);arrow.lineTo(.8,0);arrow.lineTo(.22,.38);arrow.lineTo(.22,.12);arrow.lineTo(-.7,.12);arrow.closePath();const a=new T.Mesh(new T.ShapeGeometry(arrow),yellow);a.rotation.x=-Math.PI/2;a.position.set(24,.025,25);group.add(a);
  for(const [x,z,turn] of [[39,32,0],[47,44,-Math.PI/2],[47,54,-Math.PI/2]]){const o=a.clone();o.position.set(x,.025,z);o.rotation.set(-Math.PI/2,turn,0,'YXZ');group.add(o);}
  // Beams, services and bay stops keep the enlarged deck at a believable human scale.
  const pipeMat=new T.MeshStandardMaterial({color:0x874b3c,roughness:.65,metalness:.3});
  for(const z of [20,39,56])mesh(35,.22,.42,34,2.88,z,wallMat);
  for(const x of [18.4,35.2,49.9]){const pipe=new T.Mesh(new T.CylinderGeometry(.045,.045,39,12),pipeMat);pipe.rotation.x=Math.PI/2;pipe.position.set(x,2.73,38);group.add(pipe);for(let z=20;z<58;z+=6){mesh(.15,.1,.035,x,2.74,z,mat.steel);mesh(.025,.2,.025,x,2.91,z,mat.steel);}}
  mesh(.55,.09,39,18.8,2.6,38,mat.steel);for(let z=19;z<58;z+=.45)mesh(.49,.018,.025,18.8,2.54,z,black);
  for(const x of [28.1,38.1])for(const z of [22,27.6,44,50.8]){mesh(.19,.10,1.5,x,.065,z,black);for(const dz of [-.42,.42])mesh(.20,.012,.26,x,.122,z+dz,yellow);}
  for(const [i,x,z] of [[1,30,22],[2,30,27.7],[3,40,23],[4,40,34],[5,30,44],[6,40,46],[7,30,51]]){const number=label(String(i).padStart(2,'0'),.5,.3,x+2,.035,z,0);number.rotation.x=-Math.PI/2;}
  for(const z of [20.2,39,55.8])for(const x of [20.2,36.5]){label('2F',.4,.23,x,.99,z+.29);for(let i=0;i<3;i++){const stripe=mesh(.08,.28,.012,x-.18+i*.17,.69,z+.29,black);stripe.rotation.z=-.35;}}
  mesh(.43,.66,.20,16.25,.35,30.5,new T.MeshStandardMaterial({color:0x7d3432,roughness:.8}));label('소화기',.26,.18,16.37,.95,30.5,Math.PI/2);
  function car(x,z,color,owned=false){
    const root=new T.Group();root.position.set(x,0,z);root.rotation.y=Math.PI/2;root.scale.setScalar(.8);root.rotation.order='YXZ';root.name=owned?'player-car':'parked-car';root.userData.dynamic=owned;group.add(root);
    root.userData.dynamic=true;root.userData.vehicleVisual={length:4.44,color,owned};
    const paint=new T.MeshPhysicalMaterial({color,metalness:.45,roughness:.32,clearcoat:.7,clearcoatRoughness:.25});
    const rubber=new T.MeshStandardMaterial({color:0x171b1c,roughness:1}),leather=new T.MeshStandardMaterial({color:0x2b3335,roughness:.85});
    const glass=new T.MeshPhysicalMaterial({color:0xb0c4c8,transparent:true,opacity:.17,roughness:.12,metalness:.05,side:T.DoubleSide,depthWrite:false});
    const lights=[];
    const part=(w,h,d,px,py,pz,m=paint,parent=root)=>{
      const o=mesh(w,h,d,px,py,pz,m,parent);
      if((m===paint||m===leather||m===black)&&Math.min(w,h,d)>.12){
        o.geometry.dispose();const geo=new T.BoxGeometry(w,h,d,4,4,8),p=geo.attributes.position,r=Math.min(.045,h*.15),half=new T.Vector3(w/2-r,h/2-r,d/2-r),v=new T.Vector3(),c=new T.Vector3();
        for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);c.copy(v).clamp(half.clone().negate(),half);v.sub(c).normalize().multiplyScalar(r).add(c);p.setXYZ(i,v.x,v.y,v.z);}geo.computeVertexNormals();o.geometry=geo;o.userData.rounded=true;
      }
      return o;
    };
    part(1.76,.32,4.2,0,.44,0);part(1.70,.21,1.12,0,.69,1.5);part(1.70,.20,.78,0,.69,-1.64);
    part(1.58,.085,1.54,0,1.49,-.14);part(1.76,.18,.13,0,.38,2.14,black);part(1.76,.18,.12,0,.38,-2.14,black);
    part(1.0,.11,.035,0,.60,2.218,black);part(.43,.10,.026,0,.41,2.216,mat.white);
    label(owned?'31가 4012':'82나 6381',.36,.08,0,.41,2.235,0,root);
    label(owned?'31가 4012':'82나 6381',.36,.08,0,.45,-2.235,Math.PI,root);
    for(const side of [-1,1]){
      for(const pz of [-1.34,1.34]){
        const tire=new T.Mesh(new T.CylinderGeometry(.32,.32,.21,28),rubber);tire.rotation.z=Math.PI/2;tire.position.set(side*.90,.32,pz);root.add(tire);
        const rim=new T.Mesh(new T.CylinderGeometry(.21,.21,.222,20),mat.steel);rim.rotation.z=Math.PI/2;rim.position.copy(tire.position);root.add(rim);
        const hub=new T.Mesh(new T.CylinderGeometry(.075,.075,.235,14),black);hub.rotation.z=Math.PI/2;hub.position.copy(tire.position);root.add(hub);
      }
      part(.09,.62,.13,side*.80,1.17,-.91);
      const pillar=part(.075,.75,.075,side*.79,1.15,.78);pillar.rotation.x=-.48;
      part(.09,.54,.12,side*.83,1.12,-.18,black);
      part(.13,.30,.9,side*.87,.69,-1.29);
      part(.21,.13,.26,side*1.0,1.02,.66);
      const lamp=new T.MeshStandardMaterial({color:0xd8dfcc,emissive:0xffdeb0,emissiveIntensity:0});lights.push(lamp);part(.45,.15,.04,side*.56,.67,2.085,lamp);
      part(.39,.14,.04,side*.58,.66,-2.092,new T.MeshStandardMaterial({color:0x943c3c,roughness:.36}));
    }
    function glassQuad(points){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(points.flat(),3));g.setIndex([0,1,2,0,2,3]);g.computeVertexNormals();const o=new T.Mesh(g,glass);root.add(o);return o;}
    glassQuad([[-.77,.88,1.02],[.77,.88,1.02],[.77,1.45,.62],[-.77,1.45,.62]]);
    glassQuad([[-.77,.86,-1.25],[-.77,1.45,-.90],[.77,1.45,-.90],[.77,.86,-1.25]]);
    for(const side of [-1,1])if(side<0||!owned){part(.055,.46,1.54,side*.87,.71,-.13);part(.02,.46,1.40,side*.83,1.17,-.12,glass);part(.025,.028,.15,side*.91,.90,-.61,mat.steel);}
    for(const px of [-.42,.42]){part(.53,.18,.63,px,.64,-.3,leather);const back=part(.53,.57,.14,px,.98,-.64,leather);back.rotation.x=-.12;part(.26,.19,.12,px,1.32,-.69,leather);}
    part(1.38,.23,.47,0,.67,-1.12,leather);part(1.45,.23,.43,0,.85,.64,black);part(.18,.33,.75,0,.73,-.02,leather);
    const dashMat=new T.MeshStandardMaterial({color:0x152a31,emissive:0x7baea1,emissiveIntensity:0});part(.42,.14,.02,.42,.99,.45,dashMat);part(.25,.17,.022,0,.98,.405,black);
    const steeringWheel=new T.Group();steeringWheel.position.set(.42,.96,.25);steeringWheel.rotation.x=.18;root.add(steeringWheel);
    const wheel=new T.Mesh(new T.TorusGeometry(.155,.021,8,30),black);steeringWheel.add(wheel);part(.25,.027,.025,0,0,0,black,steeringWheel);
    for(const angle of [Math.PI*.20,Math.PI*.80,Math.PI*1.5]){const spoke=part(.023,.13,.025,Math.cos(angle)*.065,Math.sin(angle)*.065,0,black,steeringWheel);spoke.rotation.z=angle-Math.PI/2;}
    const hub=new T.Mesh(new T.SphereGeometry(.055,20,12),leather);hub.scale.set(1,.8,.35);hub.position.set(0,0,-.015);steeringWheel.add(hub);
    for(const xx of [-.53,-.1,.65]){part(.18,.085,.025,xx,.96,.40,black);for(let row=0;row<4;row++)part(.15,.005,.03,xx,.934+row*.015,.38,mat.steel);}
    part(.21,.055,.06,0,1.31,.48,black);part(.17,.035,.009,0,1.31,.445,mat.steel);
    let instrument=null;
    if(owned){
      const canvas=document.createElement('canvas');canvas.width=512;canvas.height=192;const map=new T.CanvasTexture(canvas);map.colorSpace=T.SRGBColorSpace;
      const screen=new T.Mesh(new T.PlaneGeometry(.38,.135),new T.MeshBasicMaterial({map,toneMapped:false}));screen.rotation.y=Math.PI;screen.position.set(.42,.99,.435);root.add(screen);
      instrument={canvas,map,last:-1};
    }
    part(.025,.15,.025,.055,.94,.01,mat.steel);part(.06,.035,.06,.055,1.02,.01,black);
    let door=null;
    if(owned){door=new T.Group();door.position.set(.88,0,.65);root.add(door);part(.055,.45,1.54,0,.71,-.77,paint,door);part(.026,.45,1.42,0,1.17,-.77,glass,door);part(.06,.035,1.55,0,.95,-.77,paint,door);part(.05,.025,.15,.045,.89,-1.25,mat.steel,door);part(.06,.42,.055,0,1.17,-1.51,black,door);}
    const bounds=collider(x,z,4.44*.8,1.94*.8,owned?'player-car':'parked-car','furniture');
    const headlights=[];
    if(owned)for(const side of [-1,1]){const light=new T.SpotLight(0xffe4bc,0,22,.48,.65,1.3);light.position.set(side*.56,.67,2.08);const target=new T.Object3D();target.position.set(side*.48,.25,14);root.add(target);light.target=target;root.add(light);headlights.push(light);}
    return {root,door,lights,headlights,dashMat,instrument,steeringWheel,collider:bounds};
  }
  const vehicle=car(27.2,32,0x465864,true);car(29.8,22,0x8b8982);car(30.1,27.7,0x3c454a);
  for(const [x,z,c] of [[40,23,0x777b79],[39.7,34,0xa3aaa4],[30,44,0x445864],[40,46,0x82766b],[30,51,0x9d9b90]])car(x,z,c);
  function point(x,cy,z){vehicle.root.updateWorldMatrix(true,false);return new T.Vector3(x,cy,z).applyMatrix4(vehicle.root.matrixWorld);}
  const doorPoint={},seat={};
  function syncPoints(){const local=vehicle.driverSeatLocal||{x:.42,z:-.47},d=point(1.12,0,vehicle.driverSeatLocal?.z??-.25),s=point(local.x,0,local.z);Object.assign(doorPoint,{x:d.x,z:d.z});Object.assign(seat,{x:s.x,z:s.z});}
  // Root rotation puts the left driver side towards the clear central aisle.
  const state={unlocked:false,opened:0,targetOpen:0,boarding:false,boardTime:0,inCar:false,engine:false,blink:0,level:'floor2',speed:0,condition:100,from:null};
  function reset(player){Object.assign(state,{unlocked:false,opened:0,targetOpen:0,boarding:false,boardTime:0,inCar:false,engine:false,blink:0,level:'floor2',speed:0,condition:100,from:null});vehicle.root.position.set(27.2,0,32);vehicle.root.rotation.set(0,Math.PI/2,0,'YXZ');vehicle.door.rotation.y=0;vehicle.dashMat.emissiveIntensity=0;vehicle.lights.forEach(m=>m.emissiveIntensity=0);syncPoints();if(player){player.inCar=false;player.eyeHeight=1.4;}}
  function getTargets(player){
    syncPoints();if(player.level!==state.level||state.boarding)return [];
    if(state.inCar)return [{id:state.engine||state.condition<=0?'carExit':'carIgnition',x:seat.x+1,z:seat.z,range:1.6,name:state.condition<=0?'차량 고장 · E로 하차':state.engine?'E로 하차 (정차 후)':'차키로 시동 걸기',action:true}];
    return [{id:state.unlocked?'carEnter':'carUnlock',...doorPoint,range:1.85,name:state.unlocked?'운전석에 타기':'내 차 · 차키로 잠금 해제',action:true}];
  }
  function interact(id,player,hasKey,message=()=>{},cue=()=>{}){
    if(!['carUnlock','carEnter','carIgnition'].includes(id))return false;
    if(player.level!==state.level)return false;
    if(!hasKey){message('차키가 필요하다. 집 안 신발장 위를 확인하자.',3000);return true;}
    if(id==='carUnlock'&&!state.unlocked){state.unlocked=true;state.targetOpen=1;state.blink=1.1;cue('carUnlock');message('내 차가 맞다. 잠금이 풀리고 운전석 문이 열린다.',3200);return true;}
    if(id==='carEnter'&&state.unlocked&&!state.inCar){
      if(state.opened<.9){message('차 문이 열리는 중이다.',1000);return true;}
      state.boarding=true;state.boardTime=0;state.from={x:player.x,z:player.z,yaw:player.yaw,pitch:player.pitch};cue('carEnter');return true;
    }
    if(id==='carIgnition'&&state.inCar&&!state.engine){state.engine=true;vehicle.dashMat.emissiveIntensity=.6;cue('engineStart');message('엔진이 걸렸다. 문을 잠그고, 숨을 고른다.',3500);return true;}
    return true;
  }
  function update(dt,player,cue=()=>{}){
    state.blink=Math.max(0,state.blink-dt);state.opened+=(state.targetOpen-state.opened)*Math.min(1,dt*5);vehicle.door.rotation.y=-state.opened*1.05;
    vehicle.lights.forEach(m=>m.emissiveIntensity=state.blink>0?(Math.sin(state.blink*20)>0?1.4:0):state.engine ? .28 : 0);
    vehicle.headlights.forEach(l=>l.intensity=state.engine?1.8:0);
    const dashboard=vehicle.instrument,speed=Math.round(Math.abs(state.speed)*3.6),signature=state.engine?(speed+1)*(state.speed<-.05?-1:1):0;
    if(dashboard.last!==signature){const g=dashboard.canvas.getContext('2d');dashboard.last=signature;g.fillStyle='#11191d';g.fillRect(0,0,512,192);
      if(state.engine){for(const cx of [100,412]){g.strokeStyle='#a2b2ad';g.lineWidth=3;g.beginPath();g.arc(cx,103,65,Math.PI*.72,Math.PI*2.28);g.stroke();for(let k=0;k<9;k++){const a=Math.PI*(.72+k*.195);g.beginPath();g.moveTo(cx+Math.cos(a)*54,103+Math.sin(a)*54);g.lineTo(cx+Math.cos(a)*63,103+Math.sin(a)*63);g.stroke();}const a=Math.PI*(.72+Math.min(1,speed/120)*1.56);g.strokeStyle='#dfb575';g.beginPath();g.moveTo(cx,103);g.lineTo(cx+Math.cos(a)*51,103+Math.sin(a)*51);g.stroke();}g.fillStyle='#d8e4d8';g.textAlign='center';g.font='bold 74px sans-serif';g.fillText(String(speed),256,105);g.font='24px sans-serif';g.fillText('km/h',256,142);g.font='bold 25px sans-serif';g.fillText(state.speed<-.05?'R':state.speed>.05?'D':'P',256,38);}
      dashboard.map.needsUpdate=true;
    }
    if(state.boarding){
      state.boardTime+=dt;const t=Math.min(1,state.boardTime/1.5),u=t*t*(3-2*t),f=state.from;player.x=f.x+(seat.x-f.x)*u;player.z=f.z+(seat.z-f.z)*u;player.eyeHeight=1.4+(.20*Math.sin(t*Math.PI))-.44*u;
      const heading=Math.PI/2-vehicle.root.rotation.y,yaw=((heading-f.yaw+Math.PI)%(Math.PI*2)+Math.PI*2)%(Math.PI*2)-Math.PI;player.yaw=f.yaw+yaw*u;player.pitch=f.pitch*(1-u);
      if(t===1){state.boarding=false;state.inCar=true;player.inCar=true;player.eyeHeight=.96;state.targetOpen=0;cue('carDoorClose');}
    }
  }
  reset();
  return {group,y,vehicle,state,doorPoint,seat,point,syncPoints,getTargets,interact,update,reset,get movementLocked(){return state.boarding||state.inCar;}};
};
