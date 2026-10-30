/* Street-scale architecture and props observed in the user's nine photographs. */
window.createPoyuStreetDetails=function(T,{group,S,texture,box,block,flat,sign}){
  const landmarks=[],moving=[],trees=[],referenceManholes=[];let seed=882;const rand=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
  const color=(c,r=.82)=>new T.MeshStandardMaterial({color:c,roughness:r});
  const rubber=color(0x202526),frame=color(0x384145),cream=color(0xc9c6b9),copper=color(0x845e4d),navy=color(0x253a4b),red=color(0x9a3f35);
  function bar(a,b,r,m,parent=group){const v=new T.Vector3(...a),u=new T.Vector3(...b),o=new T.Mesh(new T.CylinderGeometry(r,r,u.distanceTo(v),7),m);o.position.copy(v.clone().add(u).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),u.sub(v).normalize());o.castShadow=true;parent.add(o);return o;}
  function plate(text,w,h,x,y,z,rot=0,bg='#2a2928',fg='#e2ded0',parent=group){
    const c=texture(1024,256,(g,cw,ch)=>{g.fillStyle=bg;g.fillRect(0,0,cw,ch);g.fillStyle=fg;g.textAlign='center';g.textBaseline='middle';g.font='bold 158px Malgun Gothic,sans-serif';g.fillText(text,cw/2,ch/2,cw*.91);});
    const o=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshStandardMaterial({map:c,roughness:.8,emissive:0x202526,emissiveIntensity:.12}));o.position.set(x,y,z);o.rotation.y=rot;parent.add(o);return o;
  }
  function facadeWindow(parent,x,y,z,w=2,h=1.7,rail=false){
    box(w+.13,h+.13,.09,x,y,z,frame,parent);box(w,h,.035,x,y,z+.065,S.glass,parent);
    for(const dx of [-w/2,0,w/2])box(.042,h+.05,.09,x+dx,y,z+.105,cream,parent);
    for(const dy of [-h/2,h/2])box(w+.09,.044,.10,x,y+dy,z+.105,cream,parent);
    if(rail){box(w+.25,.08,.34,x,y-h/2-.09,z+.19,S.lightStone,parent);for(let k=-w/2;k<=w/2;k+=.16)box(.018,.63,.025,x+k,y-h/2+.3,z+.32,S.metal,parent);box(w+.1,.028,.03,x,y-h/2+.62,z+.32,S.metal,parent);}
  }
  function building(id,x,z,w,d,height,body=S.lightStone,front='east',name=''){
    const root=new T.Group();root.name='reference-'+id;root.position.set(x,0,z);root.rotation.y=front==='east'?Math.PI/2:front==='north'?Math.PI:0;group.add(root);
    if(id==='hospital')root.userData.dynamic=true; // Keep its legacy visuals removable after GLB success.
    const fw=front==='east'?d:w,fd=front==='east'?w:d,fz=fd/2;
    block(x,z,w,d,id);landmarks.push({id,name,x,z,width:w,depth:d,height,front});
    // A recessed glazed ground floor, with ceiling, reveal and interior instead of a window pasted onto a box.
    const podiumTop=id==='twosome'?6.85:3.6;
    box(fw,height-podiumTop,fd,0,podiumTop+(height-podiumTop)/2,0,body,root);
    const podium=id==='twosome'?S.dark:body;
    box(fw,.16,fd+.25,0,id==='twosome'?6.72:3.55,0,id==='twosome'?podium:S.granite,root);box(fw,.12,fd,0,.10,0,S.palePaving,root);
    box(fw,3.5,.18,0,1.8,-fd/2,podium,root);for(const side of [-1,1])box(.2,3.5,fd,side*(fw/2-.1),1.8,0,podium,root);
    box(fw-.4,2.9,.18,0,1.55,fz-2.8,id==='twosome'?podium:cream,root);
    for(let xx=-fw/2+.3;xx<fw/2;xx+=2.7){const ww=Math.min(2.55,fw/2-xx-.15);if(ww<=0)continue;const cx=xx+ww/2;
      if(id!=='twosome'){box(ww,2.72,.025,cx,1.53,fz+.03,S.shopGlass,root);box(.065,2.86,.12,xx,1.53,fz+.08,frame,root);box(ww,.065,.12,cx,2.91,fz+.08,S.metal,root);box(ww,.05,.12,cx,.2,fz+.08,frame,root);}
      // Shelves, cafe seating and blinds visible through real glass.
      if(id==='twosome'){box(1.05,.07,.65,cx,.76,fz-1.4,frame,root);for(const dx of [-.37,.37])box(.045,.72,.045,cx+dx,.38,fz-1.4,frame,root);box(.5,.48,.15,cx,1.0,fz-1.85,navy,root);box(.5,.08,.48,cx,.53,fz-1.7,navy,root);}
      else{box(ww-.25,1.15,.38,cx,.7,fz-2.45,frame,root);for(let k=0;k<5;k++)box(.15,.15,.15,cx+(k-2)*.3,1.38,fz-2.4,k%2?cream:copper,root);}
    }
    box(fw,0.72,.28,0,id==='twosome'?6.0:3.12,fz+.10,id==='twosome'?podium:id==='gs25'?color(0x302c2d):S.granite,root);
    if(name)plate(name,id==='twosome'?8.5:Math.min(fw-.7,14),.53,id==='twosome'?-3:0,id==='twosome'?6.48:3.13,fz+(id==='twosome'?.64:.25),0,id==='gs25'?'#303135':'#302e30',id==='gs25'?'#a6e3ec':'#dddcd2',root);
    if(id==='gs25'){
      box(fw-.3,.15,.04,0,3.37,fz+.26,color(0x65c5d7),root);
      plate('Lifestyle Platform  ·  GS25',fw-.5,.34,0,2.68,fz+.12,0,'#67bdcf','#f2f2ec',root);
      for(let xx=-fw/2+.8;xx<fw/2;xx+=1.6)box(1.5,1.2,.025,xx,1.1,fz+.09,color(0xb0b8b3),root);
      plate('CHICKEN & BEER',Math.min(fw-1,15),.65,0,5.9,fz+.12,0,'#262528','#c5ab70',root);
    }
    if(id==='hospital'){plate('벤조인 요양병원',Math.min(fw-.5,14),.7,0,6.4,fz+.1,0,'#bdc1b6','#39755e',root);plate('풍전돈까스',6,.55,fw*.17,2.82,fz+.32,0,'#312b23','#d5b261',root);}
    for(let yy=id==='twosome'?7.7:4.8;yy<height-1;yy+=2.9){
      for(let xx=-fw/2+1.45;xx<fw/2-.7;xx+=2.65)facadeWindow(root,xx,yy,fz+.035,2.16,1.77,false);
      box(fw+.02,.13,.15,0,yy+1.10,fz+.06,body,root);
      if(id==='gs25'&&yy<5){for(let xx=-fw/2+1.45;xx<fw/2-.7;xx+=2.65){for(const dx of [-1.1,1.1])box(.07,1.9,.06,xx+dx,yy,fz+.17,red,root);for(const dy of [-.92,.92])box(2.25,.07,.06,xx,yy+dy,fz+.17,red,root);}}

    }
    // Street corners expose the side facade too, so add depth on both returns.
    for(const side of [-1,1]){const face=new T.Group();face.position.set(side*fw/2,0,0);face.rotation.y=side*Math.PI/2;root.add(face);for(let yy=id==='twosome'?7.7:4.8;yy<height-1;yy+=2.9)for(let xx=-fd/2+1.5;xx<fd/2-.7;xx+=3.2)facadeWindow(face,xx,yy,.03,2,1.7,false);if(id==='hospital')plate('벤조인 요양병원',Math.min(fd-1,12),.65,0,6.35,.15,0,'#bcbeb6','#3b6b56',face);if(id==='gs25'){box(fd,.75,.25,0,3.12,0,S.granite,face);plate('GS25',Math.min(fd-1,8),.56,0,3.12,.14,0,'#303135','#a2dbe4',face);}}
    box(fw+.25,.22,fd+.25,0,height+.10,0,cream,root);
    for(const xx of [-fw*.32,fw*.3]){box(1.7,.9,1.1,xx,height+.64,-fd*.23,S.concrete,root);box(1.5,.06,1,xx,height+1.1,-fd*.23,S.metal,root);}
    return root;
  }
  function car(x,z,heading,paintColor,collision=true){
    const root=new T.Group();root.position.set(x,0,z);root.rotation.y=Math.PI/2-heading;root.userData.dynamic=true;root.userData.vehicleVisual={length:3.8,color:paintColor,owned:false};group.add(root);
    const paint=new T.MeshPhysicalMaterial({color:paintColor,metalness:.48,roughness:.29,clearcoat:.85,clearcoatRoughness:.2,envMapIntensity:.75});
    // Tapered body sections and cabin, instead of two rectangular blocks.
    const rings=[[-1.87,.59,.49],[-1.78,.72,.58],[-1.55,.79,.66],[-1.18,.81,.71],[-.70,.80,.74],[0,.80,.73],[.65,.80,.73],[1.08,.81,.70],[1.4,.78,.65],[1.68,.73,.56],[1.85,.60,.48]],v=[],uv=[],ind=[];
    rings.forEach(([zz,ww,hh],j)=>{const ring=[[-ww*.85,.25],[-ww,.35],[-ww,hh-.09],[-ww*.82,hh],[ww*.82,hh],[ww,hh-.09],[ww,.35],[ww*.85,.25]];for(const [xx,yy] of ring){v.push(xx,yy,zz);uv.push(xx,zz);}if(j)for(let k=0;k<8;k++){const a=(j-1)*8+k,b=(j-1)*8+(k+1)%8,c=j*8+k,d=j*8+(k+1)%8;ind.push(a,b,c,b,d,c);}});for(let k=1;k<7;k++){ind.push(0,k+1,k);const n=(rings.length-1)*8;ind.push(n,n+k,n+k+1);}
    const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(v,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(ind);geo.computeVertexNormals();const body=new T.Mesh(geo,paint);body.name='car-body';body.castShadow=true;root.add(body);
    function quad(points,m){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(points.flat(),3));g.setAttribute('uv',new T.Float32BufferAttribute([0,0,1,0,1,1,0,1],2));g.setIndex([0,1,2,0,2,3]);g.computeVertexNormals();const o=new T.Mesh(g,m);o.material.side=T.DoubleSide;root.add(o);}
    const roof=new T.Mesh(new T.SphereGeometry(1,24,10,0,Math.PI*2,0,Math.PI/2),paint);roof.scale.set(.67,.12,.67);roof.position.set(0,1.25,-.16);roof.castShadow=true;root.add(roof);
    quad([[-.73,.72,.97],[.73,.72,.97],[.65,1.25,.34],[-.65,1.25,.34]],S.vehicleGlass);
    quad([[-.72,.72,-1.11],[-.65,1.25,-.65],[.65,1.25,-.65],[.72,.72,-1.11]],S.vehicleGlass);
    for(const side of [-1,1]){
      quad([[side*.748,.73,-1.07],[side*.748,.73,.91],[side*.66,1.24,.32],[side*.66,1.24,-.62]],S.vehicleGlass);
      bar([side*.74,.72,.96],[side*.65,1.26,.34],.028,paint,root);bar([side*.73,.72,-1.11],[side*.65,1.26,-.65],.035,paint,root);bar([side*.74,.71,-.13],[side*.66,1.25,-.13],.037,frame,root);
      box(.065,.024,.17,side*.79,.66,-.36,S.metal,root);box(.18,.10,.20,side*.84,.87,.66,paint,root);
      for(const zz of [-.93,-.13,.83])bar([side*.806,.38,zz],[side*.806,.70,zz],.0045,frame,root);
      bar([side*.806,.37,-1.1],[side*.806,.37,1.08],.006,frame,root);
      for(const zz of [-1.15,1.13]){const tire=new T.Mesh(new T.CylinderGeometry(.285,.285,.18,20),rubber);tire.rotation.z=Math.PI/2;tire.position.set(side*.77,.285,zz);root.add(tire);const hub=new T.Mesh(new T.CylinderGeometry(.20,.20,.192,16),S.metal);hub.rotation.z=Math.PI/2;hub.position.copy(tire.position);root.add(hub);for(let i=0;i<5;i++){const a=i*Math.PI*2/5;bar([side*.875,.285,zz],[side*.875,.285+Math.sin(a)*.17,zz+Math.cos(a)*.17],.018,frame,root);}}
      box(.40,.11,.045,side*.47,.53,1.83,cream,root);box(.36,.12,.035,side*.48,.54,-1.83,red,root);
    }
    box(.8,.16,.05,0,.40,1.85,frame,root);box(.37,.08,.03,0,.43,1.89,cream,root);box(.37,.08,.03,0,.43,-1.86,cream,root);
    for(const side of [-1,1])bar([side*.16,.75,.94],[side*.57,.85,.80],.009,frame,root);
    if(collision){const cw=Math.abs(Math.cos(heading))*3.8+Math.abs(Math.sin(heading))*1.72,cd=Math.abs(Math.sin(heading))*3.8+Math.abs(Math.cos(heading))*1.72;Object.assign(block(x,z,cw,cd,'street-parked-car','furniture'),{heading,length:3.8,width:1.72});}
    shadow(x,z,2.3,4,root);
    return root;
  }
  const shadowMap=texture(64,64,(g,w,h)=>{const a=g.createRadialGradient(32,32,4,32,32,32);a.addColorStop(0,'#10171fb0');a.addColorStop(.65,'#10171f50');a.addColorStop(1,'#10171f00');g.fillStyle=a;g.fillRect(0,0,w,h);});
  const shadowMat=new T.MeshBasicMaterial({map:shadowMap,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1});
  function shadow(x,z,w,d,parent=group){const p=new T.Mesh(new T.PlaneGeometry(w,d),shadowMat);p.rotation.x=-Math.PI/2;p.position.set(parent===group?x:0,.018,parent===group?z:0);parent.add(p);}
  const leaves=[color(0x526246),color(0x6d7550),color(0x7a7953),color(0x43533b)];
  const leafGeo=new T.PlaneGeometry(1.15,1.15),leafMaterial=S.foliage;
  function tree(x,z,size=1,collision=true){
    const root=new T.Group();root.position.set(x,.12,z);group.add(root);bar([0,0,0],[.11,3.2*size,.06],.095*size,S.bark,root);
    const crown=new T.Group();crown.position.y=2.8*size;crown.userData.dynamic=true;root.add(crown);
    const foliage=new T.InstancedMesh(leafGeo,leafMaterial,42);foliage.castShadow=true;foliage.receiveShadow=true;crown.add(foliage);let leafIndex=0;
    for(let i=0;i<7;i++){const a=i*2.399,reach=(.65+rand()*.55)*size,tip=[Math.cos(a)*reach,(.45+rand()*1.7)*size,Math.sin(a)*reach];bar([0,-.7,0],tip,.025*size,S.bark,crown);for(let k=0;k<6;k++){const m=new T.Object3D();m.position.set(tip[0]+(rand()-.5)*1.1*size,tip[1]+(rand()-.3)*.9*size,tip[2]+(rand()-.5)*1.1*size);m.scale.setScalar((.72+rand()*.4)*size);m.rotation.set((rand()-.5)*1.8,rand()*6.28,rand()*.7);m.updateMatrix();foliage.setMatrixAt(leafIndex,m.matrix);foliage.setColorAt(leafIndex++,new T.Color().setScalar(.8+rand()*.2));}}
    window.batchPoyuStatics(T,crown);
    if(collision)block(x,z,.32,.32,'street-tree');trees.push(crown);flat(1.2,1.2,x,z,.13,S.soil);shadow(x,z,4,4);
    for(const sx of [-.4,.4])bar([sx,0,-.3],[sx*.5,1.2,0],.025,S.bark,root);
  }
  function drain(x,z,rot=0,w=.45,d=.8){const root=new T.Group();root.position.set(x,.025,z);root.rotation.y=rot;group.add(root);box(w,.025,d,0,0,0,S.metal,root);for(let j=-d/2+.04;j<d/2;j+=.06)box(w-.06,.027,.025,0,.005,j,frame,root);}
  function manhole(x,z){referenceManholes.push({x,z});const parts=[];const o=new T.Mesh(new T.CylinderGeometry(.36,.36,.016,32),S.dark);o.position.set(x,.028,z);group.add(o);parts.push(o);const ring=new T.Mesh(new T.TorusGeometry(.33,.012,5,32),S.metal);ring.rotation.x=-Math.PI/2;ring.position.set(x,.04,z);group.add(ring);parts.push(ring);for(let j=-.22;j<.25;j+=.075)parts.push(box(.44,.008,.012,x,.041,z+j,S.metal));for(const p of parts){p.userData.exteriorPbrTarget=true;p.userData.referenceLegacyProp='manhole';}}
  function lamp(x,z,h=6,collision=true){bar([x,.1,z],[x,h,z],.045,S.metal);bar([x,h-.3,z],[x+.9,h+.1,z],.032,S.metal);box(.68,.08,.22,x+.95,h+.1,z,S.dark);box(.50,.025,.15,x+.95,h+.05,z,cream);if(collision)block(x,z,.16,.16,'street-lamp');}
  function rail(x,z,w,rot=0){const r=new T.Group();r.position.set(x,.12,z);r.rotation.y=rot;group.add(r);for(let i=-w/2;i<=w/2;i+=1.5){bar([i,0,0],[i,1.05,0],.035,S.metal,r);}for(const h of [.45,.95])bar([-w/2,h,0],[w/2,h,0],.025,S.metal,r);}
  function ac(x,z,rot){const r=new T.Group();r.position.set(x,.15,z);r.rotation.y=rot;group.add(r);box(.85,.65,.36,0,.325,0,cream,r);const fan=new T.Mesh(new T.TorusGeometry(.23,.018,5,20),S.metal);fan.position.set(-.1,.33,.20);r.add(fan);for(let j=-.2;j<.24;j+=.055)box(.45,.012,.02,-.1,.33+j,.215,frame,r);box(.14,.50,.02,.31,.33,.2,S.metal,r);}
  function detailGround(){
    // Yellow edge lines in the photographs run along the kerbs, not down the middle of this narrow service lane.
    for(const x of [56.35,63.65])for(let z=-34;z<123;z+=4.3)if(!(x<60&&z>70&&z<80))flat(.10,2.4,x,z,.022,S.yellow);
    for(const z of [-4.65,4.65,126.35,137.65])for(let x=-65;x<51;x+=5)flat(3.1,.10,x,z,.025,S.yellow);
    for(const [x,z] of [[60,31],[60,75],[60,108],[49,132],[36,0],[-18,0],[-26,132]])manhole(x,z);
    for(const z of [12,34,62,80,103,115]){drain(56.4,z);drain(63.6,z+3);}
    drain(52.7,75,Math.PI/2,5.9,.38);drain(54.5,75,Math.PI/2,5.9,.25);
    for(let i=0;i<24;i++){const z=-25+i*6.3;for(const x of [56.6,63.4]){const o=flat(.018,1.2,x,z,.031,S.dark);o.rotation.y=Math.sin(i*9)*.7;}}
    // Tactile paving has individual raised dots, set back from the open driving path.
    for(const [x,z] of [[54,6],[54,-6],[54,124.5],[65.5,124.5],[50,139.8]]){flat(1.3,.8,x,z,.145,S.yellow);for(let a=-.5;a<=.5;a+=.15)for(let b=-.3;b<=.3;b+=.15){const dot=new T.Mesh(new T.CylinderGeometry(.025,.03,.012,6),S.yellow);dot.position.set(x+a,.19,z+b);group.add(dot);}}
    for(const [x,z,rot] of [[51.3,11,Math.PI/2],[49,-8.9,0],[34,-8.9,0],[51.4,105,Math.PI/2],[-18,-8.9,0]])ac(x,z,rot);
    for(const z of [31,43,61,82]){flat(1.1,5,52.85,z,.15,S.soil);box(.13,.18,5.1,53.45,.16,z,cream);}
    for(const [x,z] of [[53.2,70],[49,-6.7]]){box(.65,.85,.62,x,.55,z,color(0x405a4e));box(.70,.08,.67,x,1.0,z,frame);block(x,z,.7,.67,'waste-bin','furniture');}
    // The street utility cabinet is installed as a downloaded glTF in exterior-upgrade.js.
    const bike=new T.Group();bike.position.set(68,.16,79);group.add(bike);for(const z of [-.55,.55]){const o=new T.Mesh(new T.TorusGeometry(.31,.023,6,24),rubber);o.rotation.y=Math.PI/2;o.position.set(0,.31,z);bike.add(o);}for(const [a,b] of [[[0,.3,-.55],[0,.65,-.15]],[[0,.65,-.15],[0,.3,.25]],[[0,.3,.25],[0,.3,-.55]],[[0,.65,-.15],[0,.65,.45]],[[0,.65,.45],[0,.3,.25]],[[0,.65,.45],[0,.31,.55]]])bar(a,b,.018,red,bike);box(.15,.05,.22,0,.74,-.15,frame,bike);
  }
  function context(){
    // What the photographs show across the narrow lane is a broad paved/landscaped verge and boulevard.
    flat(7,176,73,44,.06,S.palePaving);
    for(const z of [-25,5,35,65,100]){lamp(76,z,8,false);tree(72,z,1.35,false);}
    // Wooded retaining wall with fence and red-brick broadcast building in photos 010125 / 010139.
    const legacyFence=new T.Group();legacyFence.name='legacy-reference-retaining-fence';legacyFence.userData.dynamic=true;group.add(legacyFence);
    for(let x=-66;x<68;x+=2.5){box(.07,1.45,.07,x,3.4,142.5,S.metal,legacyFence);box(2.5,.035,.035,x+1.25,4.05,142.5,S.metal,legacyFence);for(let j=.2;j<2.4;j+=.3)box(.014,1.1,.014,x+j,3.45,142.5,S.metal,legacyFence);}
    const hill=new T.Mesh(new T.SphereGeometry(1,18,10),color(0x465d45));hill.scale.set(55,11,24);hill.position.set(-12,0,175);group.add(hill);
    for(let i=0;i<20;i++)tree(-64+i*6,151+(i%3)*7,1.2+(i%3)*.4,false);
    building('broadcast',-16,162,22,18,15,S.brick,'north','대전극동방송');
    for(let yy=15;yy<29;yy+=2.2){for(const dx of [-.55,.55])bar([-16+dx,yy,162],[-16+dx,yy+2.2,162],.035,S.metal);bar([-16.55,yy,162],[-15.45,yy+2.2,162],.022,S.metal);}
    for(const [x,z,h] of [[-47,187,38],[18,188,43]]){const r=new T.Group();r.position.set(x,0,z);r.rotation.y=Math.PI;group.add(r);box(23,h,15,0,h/2,0,S.lightStone,r);for(let yy=2;yy<h;yy+=3)for(let xx=-9;xx<10;xx+=3.5)facadeWindow(r,xx,yy,7.6,2.4,1.7);plate('반석마을',8,1.2,0,h-3,7.65,0,'#b8bdb7','#536c70',r);}

  }
  function update(time){trees.forEach((g,i)=>{g.rotation.z=Math.sin(time*.52+i)*.014;});for(const c of moving)c.root.position.z=((c.base+time*c.speed*c.direction+600)%220)-55;}
  function smokeMap(){return texture(64,64,(g,w,h)=>{const a=g.createRadialGradient(32,32,2,32,32,31);a.addColorStop(0,'#cccccc70');a.addColorStop(.5,'#b6b6b644');a.addColorStop(1,'#aaaaaa00');g.fillStyle=a;g.fillRect(0,0,w,h);});}
  return {building,car,tree,lamp,rail,bar,plate,facadeWindow,detailGround,context,update,landmarks,shadow,smokeMap,referenceManholes};
};
