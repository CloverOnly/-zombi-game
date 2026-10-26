/* Noeun reference: B1 food hall, beige acoustic ceiling, linear fluorescent
 * fittings, grey suspended spotlight tracks, glass deli counter and wood floor.
 * Aisle locations/dimensions are a playable approximation, not a surveyed plan. */
window.buildPoyuMartInterior=function(T,{scene,texture,surfaces:S,groundY}){
  const group=new T.Group();group.name='noeun-mart-interior';group.position.y=groundY+.16;scene.add(group);
  const levels={mart1:{y:group.position.y,name:'롯데마트 · 1층 입구'},martB1:{y:group.position.y-4.4,name:'롯데마트 · B1 식품관'}};
  const floors={mart1:[],martB1:[]},rooms={mart1:[],martB1:[]},colliders={mart1:[],martB1:[]},products=[],departments=[],lights=[];
  const state={door:0,doorTarget:0,travel:null,inspected:new Set(),visited:false};let seed=7028;
  const rand=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296),mat=(c,r=.8)=>new T.MeshStandardMaterial({color:c,roughness:r});
  const metal=mat(0x9fa6a5,.42),dark=mat(0x333b3b,.65),paper=mat(0xe6e2d6,.78),red=mat(0xa52937,.65),wood=mat(0x8c6b48,.82),wall=mat(0xd1c9b7,.92);
  const tubeLight=new T.MeshStandardMaterial({color:0xe0eadc,emissive:0xe0eadc,emissiveIntensity:1.45,roughness:.4});
  const tileMap=texture(512,512,(g)=>{g.fillStyle='#d1cdc0';g.fillRect(0,0,512,512);for(let y=0;y<2;y++)for(let x=0;x<2;x++){g.fillStyle=(x+y)%2?'#d4d0c4':'#cecbbf';g.fillRect(x*256+1,y*256+1,254,254);}for(let i=0;i<7000;i++){g.fillStyle=i%2?'#f8f2dd0b':'#5c5a4a09';g.fillRect(rand()*512,rand()*512,1,1);}});
  const tile=new T.MeshStandardMaterial({map:tileMap,roughness:.32,metalness:.04});tile.name='매장 대형 포세린 바닥';tile.userData.tileSize=2.4;
  tile.envMapIntensity=.12;
  const ceilingMap=texture(256,256,(g)=>{g.fillStyle='#bfb39a';g.fillRect(0,0,256,256);g.strokeStyle='#817966';g.lineWidth=.8;g.strokeRect(0,0,256,256);for(let i=0;i<2600;i++){g.fillStyle='#665e4f29';g.fillRect(rand()*256,rand()*256,.6+rand(),.6+rand());}});
  const ceiling=new T.MeshStandardMaterial({map:ceilingMap,roughness:1});ceiling.userData.tileSize=.6;
  const woodMap=texture(512,512,(g)=>{g.fillStyle='#97754e';g.fillRect(0,0,512,512);for(let x=0;x<512;x+=64){g.fillStyle=x%128?'#b18c5e':'#a17b51';g.fillRect(x+1,0,62,512);for(let k=0;k<50;k++){g.strokeStyle=k%2?'#50351e17':'#e9c1851a';g.lineWidth=.5;const px=x+rand()*60;g.beginPath();g.moveTo(px,0);g.bezierCurveTo(px+8,170,px-6,350,px+rand()*3,512);g.stroke();}}});
  const woodFloor=new T.MeshStandardMaterial({map:woodMap,roughness:.38});woodFloor.userData.tileSize=2.4;
  const glass=new T.MeshPhysicalMaterial({color:0xb7cdcb,transparent:true,opacity:.16,roughness:.12,metalness:.1,clearcoat:.8,depthWrite:false,side:T.DoubleSide});
  function box(w,h,d,x,y,z,m,parent=group){const o=new T.Mesh(window.poyuBoxGeometry(T,w,h,d,m),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
  function floorArea(level,id,name,x0,x1,z0,z1){const r={id,name,kind:'mart',minX:x0,maxX:x1,minZ:z0,maxZ:z1,labelX:(x0+x1)/2,labelZ:(z0+z1)/2};floors[level].push(r);rooms[level].push(r);return r;}
  function block(level,x,z,w,d,id){const c={minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2,id,kind:'wall'};colliders[level].push(c);return c;}
  const signCache=new Map();function sign(text,w,h,x,y,z,rot=0,bg='#34413d',fg='#e9e7db',parent=group){
    const key=text+bg+fg;let material=signCache.get(key);if(!material){const map=texture(1024,256,(g,cw,ch)=>{g.fillStyle=bg;g.fillRect(0,0,cw,ch);g.fillStyle=fg;g.font='bold 108px Malgun Gothic,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(text,cw/2,ch/2,cw*.94);});material=new T.MeshStandardMaterial({map,roughness:.75,emissive:0x252b27,emissiveIntensity:.2,side:T.FrontSide});signCache.set(key,material);}
    const o=new T.Mesh(new T.PlaneGeometry(w,h),material);o.position.set(x,y,z);o.rotation.y=rot;parent.add(o);
    const back=new T.Mesh(o.geometry.clone(),material);back.position.copy(o.position);back.rotation.y=rot+Math.PI;parent.add(back);return o;
  }
  function bar(a,b,r,m,parent=group){const av=new T.Vector3(...a),bv=new T.Vector3(...b),o=new T.Mesh(new T.CylinderGeometry(r,r,bv.distanceTo(av),8),m);o.position.copy(av.clone().add(bv).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),bv.sub(av).normalize());parent.add(o);return o;}
  function photo(material,name,repeat=false){material.userData.photoSource='assets/'+name;if(typeof document.createElementNS!=='function')return;
    new T.TextureLoader().load(window.PoyuMartPhotos?.[name]||'assets/'+name,map=>{map.colorSpace=T.SRGBColorSpace;map.anisotropy=8;if(repeat)map.wrapS=map.wrapT=T.RepeatWrapping;material.map?.dispose();material.map=map;material.needsUpdate=true;},undefined,()=>{});
  }
  photo(tile,'mart-floor-v1.png',true);
  // Main entrance / information lobby. Its southern opening aligns with the street model.
  floorArea('mart1','mart-lobby','1F 출입구 · B1 내려가는 곳',171,195,427.2,435.4);
  box(24,.18,8.2,183,-.09,431.3,tile);box(24,.16,8.2,183,4.28,431.3,ceiling);
  for(const x of [171,195]){box(.2,4.3,8.2,x,2.15,431.3,wall);block('mart1',x,431.3,.2,8.2,'mart-lobby-side');}
  box(3.7,1.1,.85,173.9,.55,429,wood);box(3.8,.08,.95,173.9,1.14,429,dark);block('mart1',173.9,429,3.8,.95,'information-desk');
  sign('고객만족센터',3.5,.40,173.9,1.45,429.48,0,'#766747');
  sign('B1 식품관  ↓',5.5,.8,183,3.1,428,Math.PI,'#af3341');
  sign('1F 의류 · 잡화    B1 식품',5,.65,191.7,2.3,429.1,Math.PI,'#615944');
  const doorPanels=[];for(const [side,cx] of [[-1,181.4],[1,184.6]]){
    const panel=new T.Group();panel.userData.dynamic=true;panel.position.set(cx,0,435.1);group.add(panel);box(3.1,3.1,.04,0,1.6,0,glass,panel);
    for(const dx of [-1.55,1.55])box(.05,3.2,.08,dx,1.6,0,metal,panel);for(const y of [.06,1.1,3.18])box(3.15,.05,.08,0,y,0,metal,panel);doorPanels.push({panel,cx,side});
  }
  // Ground-floor carts include wire baskets and small caster wheels.
  function cart(x,y,z,rot=0){const root=new T.Group();root.position.set(x,y,z);root.rotation.y=rot;group.add(root);
    for(const xx of [-.25,.25])for(const zz of [-.37,.3]){const wheel=new T.Mesh(new T.CylinderGeometry(.065,.065,.04,10),dark);wheel.rotation.z=Math.PI/2;wheel.position.set(xx,.075,zz);root.add(wheel);}
    for(const xx of [-.27,.27]){bar([xx,.14,-.4],[xx,.95,-.34],.014,metal,root);bar([xx,.44,.34],[xx,.78,.37],.012,metal,root);for(const yy of [.48,.58,.68,.78])bar([xx,yy,-.32],[xx,yy,.37],.008,metal,root);for(let zz=-.3;zz<.38;zz+=.09)bar([xx,.46,zz],[xx,.8,zz],.006,metal,root);}
    for(const zz of [-.32,.37])for(const yy of [.48,.58,.68,.78])bar([-.27,yy,zz],[.27,yy,zz],.008,metal,root);
    bar([-.29,.95,-.34],[.29,.95,-.34],.025,red,root);box(.54,.03,.7,0,.44,.025,metal,root);return root;
  }
  for(let i=0;i<5;i++)cart(193.8,0,428.3+i*.45,Math.PI);block('mart1',193.8,429.2,.8,3,'cart-queue');
  // B1 floor/ceiling, with a real opening for the two inclined cart travelators.
  floorArea('martB1','food-hall','B1 식품관',119,195,354,426);
  box(76,.18,72,157,-4.49,390,tile);
  box(58.2,.16,72,148.1,-.42,390,ceiling);box(5.8,.16,72,192.1,-.42,390,ceiling);box(12,.16,55.5,183.2,-.42,381.75,ceiling);
  for(const [x,z,w,d] of [[119,390,.2,72],[195,390,.2,72],[157,354,76,.2],[148,426,58,.2],[192.5,426,5,.2]]){box(w,4.05,d,x,-2.38,z,wall);block('martB1',x,z,w,d,'food-hall-wall');}
  // Sloping metal beds, ridged moving belts and handrails. The ride moves the
  // player's actual camera position continuously between the two floor heights.
  const belts=[];for(const [i,x] of [[0,180.5],[1,186.5]]){
    const top=427,bottom=409,dy=4.4,length=Math.hypot(top-bottom,dy),angle=-Math.atan2(dy,top-bottom);
    const bed=box(2.65,.18,length,x,-2.25,418,S.metal);bed.rotation.x=angle;
    const belt=new T.Group();belt.userData.dynamic=true;group.add(belt);
    for(let k=0;k<72;k++){const o=box(2.3,.035,.18,x,0,0,dark,belt);belts.push({o,x,index:k,up:i===1});}
    for(const side of [-1,1]){
      const sx=x+side*1.32,sidePanel=box(.08,.9,length,sx,-1.78,418,glass);sidePanel.rotation.x=angle;
      bar([sx,1.0,427],[sx,-3.4,409],.055,dark);bar([sx,.16,427],[sx,-4.24,409],.035,metal);
    }
    box(2.65,.08,1.2,x,-.02,427.4,metal);box(2.65,.08,1.2,x,-4.42,408.6,metal);
    block('martB1',x,418,2.7,17,'travelator-bed');
  }
  sign('↑ 1F 출입구',3,.48,186.5,-1.6,409.4,0,'#3e6154');
  sign('B1 신선식품 · 가공식품',6,.6,179,-1.1,407.4,0,'#9e713b');
  // The floor near the deli uses the warm wood finish visible in the Noeun photos.
  box(24,.025,12,131,-4.385,360,woodFloor);
  function department(id,name,x,z,text){departments.push({id:'mart-'+id,name,x,z,range:2.8,text,action:true});}
  const bySku=Array.from({length:16},()=>[]),packageColor=[0xad3932,0xc18039,0x66889b,0x4e6a52,0xbdb18c,0xc5d4d4,0xc79446,0x6c7850,0x983d37,0xc9b589,0x6c503f,0x674642,0xa69167,0x6a8ea7,0x8caa86,0x465c7b];
  function packageAt(x,y,z,sku,rotation=0,w=.20,h=.29,d=.13){const record={x,y,z,sku,rotation,w,h,d};products.push(record);bySku[sku].push(record);}
  function price(x,y,z,text='2,980',rot=0){return sign(text,.38,.12,x,y,z,rot,'#eee7ce','#343b32');}
  function gondola(x,z,index){
    box(1.15,.13,9.4,x,-4.335,z,dark);box(.08,1.85,9.4,x,-3.44,z,paper);block('martB1',x,z,1.22,9.5,'grocery-rack');
    for(const y of [-4.13,-3.77,-3.41,-3.05,-2.69])for(const side of [-1,1]){
      box(.55,.035,9.4,x+side*.31,y,z,paper);box(.035,.085,9.4,x+side*.59,y-.015,z,paper);
      for(let k=0;k<25;k++){
        if((index*31+k*7+Math.round(y*100))%17===0)continue;
        const sku=(index*3+Math.floor(k/6))%16,w=.17+rand()*.045,h=.22+rand()*.075,zz=z-4.35+k*.36;
        packageAt(x+side*.33,y+h/2+.02,zz,sku,side*Math.PI/2,w,h,.19);
        if(k%5===0)price(x+side*.615,y-.01,zz,['1,980','2,980','3,990','4,980'][sku%4],side*Math.PI/2);
      }
    }
    sign(String(index+1).padStart(2,'0'),.65,.40,x,-1.72,z+4.74,0,'#a8743d');
  }
  let rackIndex=0;for(const x of [132,137,142,147,152,157,162])for(const z of [375,391,407])gondola(x,z,rackIndex++);
  // End caps, promotion bins and checkout belts have their own collision footprints.
  for(const [x,z] of [[137,381],[147,397],[157,413]]){box(1.3,.75,1.0,x,-4.025,z,wood);block('martB1',x,z,1.3,1,'promotion-endcap');sign('행사상품',1.3,.34,x,-2.9,z+.52,0,'#b0323c');for(let i=0;i<12;i++)packageAt(x+(i%4-.5)*.23-.23,-3.5,z+(Math.floor(i/4)-1)*.23,i%4,0,.20,.28,.18);}
  for(const [i,x] of [126,133,140,147,154,161].entries()){
    box(1.25,.9,3.3,x,-3.95,420,dark);box(1.12,.05,2.3,x,-3.47,419.7,mat(0x252a29));block('martB1',x,420,1.35,3.4,'checkout');
    box(.48,.25,.5,x,-3.34,421.1,red);const screen=box(.40,.30,.05,x+.25,-2.99,421.1,dark);screen.rotation.x=-.15;
    bar([x+.48,-4.4,420.9],[x+.48,-1.6,420.9],.025,metal);sign(String(i+1),.45,.5,x+.48,-1.65,420.93,0,'#a52b38');
    box(.62,.03,.45,x,-3.46,418.25,metal);sign('계산대',.9,.22,x,-2.93,421.18,0,'#454b45');
  }
  sign('계산하는 곳  CHECKOUT',10,.55,145,-1.0,424.2,Math.PI,'#a32d3d');
  // Glass refrigerated cabinets along both walls, including white shelves,
  // product depth, seals, handles, ventilation grilles and small price rails.
  function chilled(x,z,rotation,sku){const root=new T.Group();root.position.set(x,-4.4,z);root.rotation.y=rotation;group.add(root);
    box(2.9,2.1,.80,0,1.05,0,paper,root);box(2.65,1.57,.05,0,1.15,.42,dark,root);
    for(let y=.38;y<1.9;y+=.38){box(2.65,.035,.58,0,y,.18,paper,root);for(let j=0;j<10;j++){
      const local=new T.Vector3(-1.15+j*.25,y+.14,.25).applyAxisAngle(new T.Vector3(0,1,0),rotation);packageAt(x+local.x,-4.4+local.y,z+local.z,sku,rotation,.18,.25,.13);
    }}
    for(const xx of [-1.35,-.45,.45,1.35]){box(.035,1.75,.07,xx,1.12,.46,metal,root);box(.03,.32,.05,xx+.08,1.13,.53,dark,root);}
    box(2.7,1.67,.025,0,1.14,.48,glass,root);box(2.7,.035,.04,0,1.98,.44,tubeLight,root);
    for(let xx=-1.3;xx<1.35;xx+=.12)box(.045,.12,.018,xx,.14,.42,dark,root);
    block('martB1',x,z,Math.abs(Math.sin(rotation))>.5?.95:3,Math.abs(Math.sin(rotation))>.5?3:.95,'refrigerated-case');
  }
  for(let z=372;z<414;z+=3.2){chilled(120,z,Math.PI/2,3);chilled(194,z,-Math.PI/2,Math.round(z)%3?5:6);}
  sign('냉장 · 유제품',7,.6,191.9,-1.52,397,-Math.PI/2,'#5b7a7b');
  sign('냉동식품',6,.6,122.1,-1.52,389,Math.PI/2,'#5b7a7b');
  // Timber produce islands with individually shaped fruit, crate dividers and scales.
  const fruitRecords=[];for(const [i,x,z] of [[0,174,376],[1,181,376],[2,174,391],[3,181,391]]){
    box(3.4,.78,4.2,x,-4.01,z,wood);box(3.5,.07,4.3,x,-3.58,z,dark);block('martB1',x,z,3.5,4.3,'produce-island');
    for(const dx of [-1.12,0,1.12])for(const dz of [-1,1]){box(1.03,.16,1.85,x+dx,-3.47,z+dz,wood);for(let k=0;k<18;k++)fruitRecords.push({x:x+dx+(k%3-1)*.27,y:-3.30+(k%2)*.03,z:z+dz+(Math.floor(k/3)-2.5)*.23,i});}
    sign(['과일','채소','Fresh Fruits','신선식품'][i],3.5,.6,x,-1.15,z,0,'#73724a');price(x,-3.40,z+2.17,['6,990','2,990','9,900','3,990'][i]);
  }
  const fruits=new T.InstancedMesh(new T.SphereGeometry(1,10,7),mat(0xffffff,.7),fruitRecords.length),matrix=new T.Object3D();fruits.castShadow=true;group.add(fruits);
  fruitRecords.forEach((p,i)=>{matrix.position.set(p.x,p.y,p.z);matrix.scale.set(.12,.10+(i%3)*.014,.11);matrix.rotation.set(i*.4,i*.7,0);matrix.updateMatrix();fruits.setMatrixAt(i,matrix.matrix);fruits.setColorAt(i,new T.Color([0x9d4936,0x7c8e45,0xc18a36,0x597444][p.i]));});
  // Deli / bakery counter details reflect the actual photographed Noeun corner.
  function deli(x,z,w,label,bread=false){
    box(w,1.0,1.15,x,-3.9,z,wood);box(w+.1,.08,1.3,x,-3.36,z,metal);block('martB1',x,z,w+.1,1.4,'deli-counter');
    box(w,1.0,.025,x,-2.86,z+.56,glass);box(w,.025,1.15,x,-2.36,z,glass);
    for(const sx of [-1,1])box(.035,1.05,1.17,x+sx*w/2,-2.86,z,metal);
    for(let k=0;k<Math.floor(w/.65);k++){
      const px=x-w/2+.35+k*.65;box(.56,.05,.75,px,-3.30,z,paper);for(let j=0;j<5;j++){
        const o=new T.Mesh(new T.SphereGeometry(1,10,6),mat(bread?0xb18a49:0xa78e47,.78));o.scale.set(.1,.04,.15);o.position.set(px+(j%2-.5)*.19,-3.23,z+(Math.floor(j/2)-1)*.2);group.add(o);
      }
      price(px,-3.18,z+.70,bread?'3,500':'5,900');
    }
    sign(label,w,.68,x,-1.35,z-.12,0,'#997044');
  }
  deli(130,358,14,'즉석조리 · DELI');deli(154,358,14,'베이커리',true);deli(179,358,16,'축산 · 수산');
  for(const x of [125,129,133,137]){box(.7,.05,.65,x,-3.65,363,wood);for(const dx of [-.23,.23])box(.035,.72,.035,x+dx,-4.02,363,metal);box(.45,.055,.4,x,-3.9,364.0,dark);box(.45,.45,.035,x,-3.65,364.18,dark);}
  // Acoustic ceiling, grey tracks with suspended warm spotlights, strip fixtures,
  // vents and support columns: observed material cues, not a generic warehouse roof.
  for(const x of [125,143,161,190])for(const z of [365,389,413]){
    box(.72,3.94,.72,x,-2.43,z,wall);block('martB1',x,z,.76,.76,'mart-column');
    sign(z===365?'즉석식품':'신선식품',.75,.33,x,-1.18,z+.37,0,'#a77842');
  }
  for(const x of [124,130,138,146,154,162,170,178,192])for(let z=360;z<425;z+=4.0){
    if(x>177&&x<190&&z>408)continue;
    box(.36,.065,1.4,x,-.58,z,metal);for(const dx of [-.10,0,.10])box(.04,.025,1.25,x+dx,-.622,z,tubeLight);
  }
  for(const z of [359.4,366]){
    box(62,.18,.24,154,-.95,z,metal);for(let x=124;x<187;x+=4.6){bar([x,-.53,z],[x,-.95,z],.012,metal);const lamp=new T.Mesh(new T.CylinderGeometry(.105,.085,.25,12),paper);lamp.position.set(x,-1.18,z);lamp.rotation.z=.28;group.add(lamp);const bulb=new T.Mesh(new T.CircleGeometry(.082,12),tubeLight);bulb.rotation.x=Math.PI/2;bulb.position.set(x,-1.31,z);group.add(bulb);}
  }
  for(const [x,z] of [[130,374],[153,374],[177,374],[130,404],[153,404],[178,404]]){const l=new T.PointLight(0xfff0d0,1.25,28,1.4);l.position.set(x,-.85,z);group.add(l);lights.push(l);}
  for(const x of [176,189]){const l=new T.PointLight(0xe6eadb,1.1,16,1.3);l.position.set(x,3.5,431);group.add(l);lights.push(l);box(.4,.05,2,x,4.15,431,tubeLight);}
  const ambient=new T.HemisphereLight(0xf0e5cd,0x81796b,.60);ambient.visible=false;group.add(ambient);
  for(const z of [372,399])for(const x of [128,169]){const vent=new T.Mesh(new T.TorusGeometry(.22,.025,5,20),metal);vent.rotation.x=Math.PI/2;vent.position.set(x,-.52,z);group.add(vent);}
  sign('비상구  EXIT →',3,.42,122,-1.6,421,Math.PI/2,'#37694b');
  // Photographic front labels on individually placed 3D packages, batched by SKU.
  const atlasMaterial=new T.MeshStandardMaterial({map:tileMap.clone(),roughness:.65});photo(atlasMaterial,'grocery-atlas-v1.png');
  const bodies=new T.InstancedMesh(new T.BoxGeometry(1,1,1),mat(0xffffff,.76),products.length);bodies.castShadow=true;bodies.receiveShadow=true;group.add(bodies);
  products.forEach((p,i)=>{matrix.position.set(p.x,p.y,p.z);matrix.rotation.set(0,p.rotation,0);matrix.scale.set(p.w,p.h,p.d);matrix.updateMatrix();bodies.setMatrixAt(i,matrix.matrix);bodies.setColorAt(i,new T.Color(packageColor[p.sku]));});
  bySku.forEach((records,sku)=>{if(!records.length)return;const g=new T.PlaneGeometry(1,1),uv=g.attributes.uv,c=sku%4,row=Math.floor(sku/4);
    for(let i=0;i<uv.count;i++)uv.setXY(i,(c+.02+uv.getX(i)*.96)/4,(3-row+.02+uv.getY(i)*.96)/4);
    const labels=new T.InstancedMesh(g,atlasMaterial,records.length);group.add(labels);
    records.forEach((p,i)=>{matrix.position.set(p.x+Math.sin(p.rotation)*(p.d/2+.002),p.y,p.z+Math.cos(p.rotation)*(p.d/2+.002));matrix.rotation.set(0,p.rotation,0);matrix.scale.set(p.w*.96,p.h*.96,1);matrix.updateMatrix();labels.setMatrixAt(i,matrix.matrix);});
  });
  // Restrained disruption suits the existing outbreak story without obscuring the reference interior.
  cart(188,-4.4,418,.3);for(let i=0;i<7;i++){const boxObj=box(.32,.15,.22,167+(i%3)*.35,-4.31,414+Math.floor(i/3)*.3,paper);boxObj.rotation.y=i*.7;}
  const contactMap=texture(64,64,(g)=>{const a=g.createRadialGradient(32,32,8,32,32,32);a.addColorStop(0,'#24211c60');a.addColorStop(.65,'#24211c35');a.addColorStop(1,'#24211c00');g.fillStyle=a;g.fillRect(0,0,64,64);});
  const contactMaterial=new T.MeshBasicMaterial({map:contactMap,transparent:true,opacity:.5,depthWrite:false});
  for(const c of colliders.martB1.filter(c=>['grocery-rack','checkout','produce-island','deli-counter'].includes(c.id))){
    const x=(c.minX+c.maxX)/2,z=(c.minZ+c.maxZ)/2,p=new T.Mesh(new T.PlaneGeometry(c.maxX-c.minX+.7,c.maxZ-c.minZ+.7),contactMaterial);p.rotation.x=-Math.PI/2;p.position.set(x,z<366&&x<143?-4.365:-4.393,z);group.add(p);
  }
  department('deli','델리 진열대 살펴보기',130,361,'유리 진열대에는 식은 도시락과 포장 음식이 남아 있다.');
  department('water','생수 진열대 살펴보기',133.4,391,'몇 묶음의 생수와 음료가 남아 있다.');
  department('grocery','가공식품 통로 살펴보기',158.6,391,'라면, 통조림, 쌀과 간식이 진열되어 있다.');
  department('fresh','신선식품 살펴보기',174,395,'과일 진열대는 아직 정돈되어 있지만 매장에는 인기척이 없다.');
  department('checkout','계산대 살펴보기',169,420,'계산대 화면은 꺼져 있다. 출구는 오른쪽 무빙워크를 올라가면 된다.');
  group.traverse(o=>{if(o.isMesh||o.isLight)o.layers.set(2);});
  const batching=window.batchPoyuStatics(T,group);group.traverse(o=>{if(o.isMesh||o.isLight)o.layers.set(2);});
  function beginRide(player,up){const level=up?'mart1':'martB1';state.travel={time:0,duration:4.2,from:{x:player.x,z:player.z,y:player.floorY},to:{x:up?186.5:180.5,z:up?428.2:407.8,y:levels[level].y},level};player.level='martTravel';}
  function enter(player){if(state.travel)return false;state.visited=true;state.doorTarget=1;Object.assign(player,{x:183,z:432.5,level:'mart1',floorY:levels.mart1.y,eyeHeight:1.4,pitch:0,yaw:-Math.PI/2});return true;}
  function reset(){Object.assign(state,{door:0,doorTarget:0,travel:null,visited:false});state.inspected.clear();for(const d of doorPanels)d.panel.position.x=d.cx;}
  function getTargets(player){
    if(state.travel)return [];
    if(player.level==='mart1')return [{id:'martExit',x:183,z:433.8,range:2.6,name:'문을 열고 밖으로 나가기',action:true,allowWall:true},{id:'martDown',x:180.5,z:427.8,range:2.7,name:'무빙워크 · B1 식품관으로 내려가기',action:true}];
    if(player.level==='martB1')return [{id:'martUp',x:186.5,z:408.3,range:2.7,name:'무빙워크 · 1F 출입구로 올라가기',action:true},...departments];return [];
  }
  function interact(id,player,message=()=>{},cue=()=>{}){
    const t=getTargets(player).find(t=>t.id===id);if(!t||Math.hypot(player.x-t.x,player.z-t.z)>t.range)return false;
    if(id==='martExit'){state.doorTarget=1;Object.assign(player,{x:183,z:438,level:'floor1',floorY:groundY+.13,eyeHeight:1.4,pitch:0,yaw:Math.PI/2});cue('doorOpen');return true;}
    if(id==='martDown'||id==='martUp'){beginRide(player,id==='martUp');message(id==='martUp'?'무빙워크를 타고 1층으로 올라간다.':'무빙워크를 타고 지하 1층 식품관으로 내려간다.',3000);return true;}
    state.inspected.add(id);message(t.text,4400);cue('pickup');return true;
  }
  function update(dt,time,player){
    const near=player&&Math.hypot(player.x-183,player.z-435)<9;state.doorTarget=near?1:0;state.door+=(state.doorTarget-state.door)*Math.min(1,dt*4);for(const d of doorPanels)d.panel.position.x=d.cx+d.side*state.door*2.9;
    for(const b of belts){const t=((b.index+(b.up?-time:time)*3)%72+72)%72/72;b.o.position.set(b.x,-4.4+t*4.4,409+t*18);b.o.rotation.x=-Math.atan2(4.4,18);}
    if(state.travel){const r=state.travel;r.time+=dt;const u=Math.min(1,r.time/r.duration),e=u*u*(3-2*u);player.x=r.from.x+(r.to.x-r.from.x)*e;player.z=r.from.z+(r.to.z-r.from.z)*e;player.floorY=r.from.y+(r.to.y-r.from.y)*e;player.eyeHeight=1.4;if(u===1){player.level=r.level;player.floorY=levels[r.level].y;state.travel=null;}}
  }
  return {group,levels,floors,rooms,colliders,state,products,departments,batching,ambient,enter,reset,getTargets,interact,update,get movementLocked(){return !!state.travel;},get status(){return state.travel?(state.travel.level==='martB1'?'B1 식품관으로 내려가는 중':'1F 출입구로 올라가는 중'):null;},bounds:{minX:118.8,maxX:195.2,minZ:353.8,maxZ:435.5}};
};
