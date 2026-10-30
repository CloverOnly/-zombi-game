/* Existing neighboring building; shop order rechecked in Naver's March 2025 panorama. */
window.installPoyuRightBuilding=async function(T,world){
  const status={loaded:false,target:'hospital',models:[],officeWindows:0,shopWindows:0,entries:0,wallPanels:0,batches:0,triangles:0,materials:[],facades:{parking:'east',pedestrian:'west',pungjeon:'west',pungjeonReturn:'north-west'},error:null};window.poyuRightBuildingStatus=status;
  try{
    const legacy=world.streets.group.getObjectByName('reference-hospital'),landmark=world.streets.landmarks.find(p=>p.id==='hospital');
    if(!legacy||!landmark)throw Error('Existing clinic target missing');
    const loader=new window.PoyuGLTFLoader(),base='assets/models/exterior/right-building/';
    const modelFiles=['clinic-window.glb','clinic-entry.glb','clinic-cornice.glb','clinic-cladding.glb','shop-awning.glb','shop-metal-profile.glb','shop-patio.glb'];
    const assets=await Promise.all(modelFiles.map(f=>loader.loadAsync(base+f)));
    const root=new T.Group();root.name='right-reference-clinic';const seen=new Set();
    function batch(asset,placements,label,color){
      const scene=asset.scene.clone(true);scene.updateMatrixWorld(true);
      scene.traverse(o=>{if(!o.isMesh)return;
        const materials=[].concat(o.material).map(m=>{const n=m.clone();if(color!==undefined)n.color.setHex(color);n.side=T.DoubleSide;n.transparent=false;n.opacity=1;n.depthWrite=true;if(n.map)n.map.anisotropy=4;return n;});
        const mesh=new T.InstancedMesh(o.geometry,Array.isArray(o.material)?materials:materials[0],placements.length);mesh.name='clinic-'+label;mesh.receiveShadow=true;mesh.castShadow=['shop-canopies','patio-seating','patio-rails'].includes(label);
        placements.forEach((p,i)=>mesh.setMatrixAt(i,new T.Matrix4().compose(new T.Vector3(p.x,p.y||0,p.z),p.quaternion||new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0),p.rotation||0),new T.Vector3(p.sx||1,p.sy||1,p.sz||1)).multiply(o.matrixWorld)));
        mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingSphere();root.add(mesh);status.batches++;status.triangles+=(o.geometry.index?.count||o.geometry.attributes.position.count)/3*placements.length;
        for(const m of materials)if(!seen.has(m.name)){seen.add(m.name);status.materials.push({name:m.name,color:!!m.map,normal:!!m.normalMap,roughness:!!m.roughnessMap});}
      });
    }
    const stone=[],rose=[],dark=[],back=[],office=[],shop=[],doors=[],coping=[],shutters=[],awnings=[],profiles=[],rails=[],treads=[];
    function wall(list,x,y,z,w,h,rotation=0){list.push({x,y,z,sx:w/3,sy:h/3,rotation});}
    // Closed inset backing: no see-through faces or new walkable/collision areas.
    wall(back,35,0,8.62,31.8,22,Math.PI);wall(back,35,0,15.38,31.8,22);
    wall(back,19.10,0,12,6.9,22,-Math.PI/2);wall(back,50.90,0,12,6.9,22,Math.PI/2);
    const horizontal=new T.Quaternion().setFromAxisAngle(new T.Vector3(1,0,0),-Math.PI/2);
    for(const y of [.14,21.98])back.push({x:35,y,z:15.5,sx:32/3,sy:7/3,quaternion:horizontal});
    for(let row=0;row<6;row++){
      const y=3.90+row*3;
      for(let col=0;col<8;col++){
        const x=21+col*4;
        office.push({x,y,z:8.48,rotation:Math.PI,sx:3.64/3.70,sy:1.9/2});
        wall(rose,x,y+1.90,8.45,4.01,1.10,Math.PI);
      }
      for(let col=0;col<=8;col++)wall(stone,19+col*4,y,8.44,.30,1.92,Math.PI);
      for(let col=0;col<2;col++){
        const z=10.25+col*3.5;
        office.push({x:51.04,y,z,rotation:Math.PI/2,sx:3.14/3.70,sy:1.9/2});
        wall(rose,51.03,y+1.90,z,3.51,1.10,Math.PI/2);
      }
      for(const z of [8.5,12,15.5])wall(stone,51.05,y,z,.30,1.92,Math.PI/2);
      // The restaurant faces Poyu's pedestrian-entry side, opposite the parking lane.
      for(let col=0;col<2;col++){
        const z=10.25+col*3.5;
        office.push({x:18.96,y,z,rotation:-Math.PI/2,sx:3.14/3.70,sy:1.9/2});
        wall(rose,18.97,y+1.90,z,3.51,1.10,-Math.PI/2);
      }
      for(const z of [8.5,12,15.5])wall(stone,18.95,y,z,.30,1.92,-Math.PI/2);
    }
    for(let col=0;col<8;col++){
      const x=21+col*4;
      wall(dark,x,2.95,8.40,4.02,.95,Math.PI);wall(dark,x,0,8.43,4.02,.20,Math.PI);
      if(col!==3&&col!==5)shop.push({x,y:.22,z:8.46,rotation:Math.PI,sx:3.64/3.70,sy:2.65/2});
      coping.push({x,y:21.88,z:8.38,rotation:Math.PI,sx:4.02/3,sy:1.3});
    }
    for(let col=0;col<=8;col++)wall(dark,19+col*4,.15,8.40,.28,2.85,Math.PI);
    for(let col=0;col<2;col++){
      const z=10.25+col*3.5;wall(dark,51.08,2.95,z,3.52,.95,Math.PI/2);wall(dark,51.08,0,z,3.52,.20,Math.PI/2);
      wall(dark,51.09,1.12,z,3.18,1.83,Math.PI/2);
      wall(shutters,51.10,.16,z,3.18,.96,Math.PI/2);
      if(col===0)shop.push({x:18.93,y:.22,z,rotation:-Math.PI/2,sx:3.14/3.70,sy:2.65/2});
      coping.push({x:51.12,y:21.88,z,rotation:Math.PI/2,sx:3.52/3,sy:1.3});
    }
    for(const z of [8.5,12,15.5])wall(dark,51.09,.15,z,.28,2.85,Math.PI/2);
    for(const z of [8.5,12,15.5])wall(dark,18.91,.15,z,.28,2.85,-Math.PI/2);
    // Corner stone returns and ground door reveals seal joins between the two visible elevations.
    wall(stone,50.82,3.9,8.39,.38,18.1,Math.PI);wall(stone,51.06,3.9,15.32,.38,18.1,Math.PI/2);
    for(const x of [39.57,42.43])wall(dark,x,.15,8.40,1.18,2.85,Math.PI);
    doors.push({x:41,y:.16,z:8.48,rotation:Math.PI,sx:1.65/1.48,sy:2.70/2.81,sz:.65});
    // The white Bomunsan shop has its own entry between the two black shop fascias.
    doors.push({x:33,y:.16,z:8.48,rotation:Math.PI,sx:1.65/1.48,sy:2.70/2.81,sz:.65});
    for(const x of [31.57,34.43])wall(dark,x,.15,8.40,1.18,2.85,Math.PI);
    doors.push({x:18.94,y:.16,z:13.75,rotation:-Math.PI/2,sx:1.55/1.48,sy:2.70/2.81,sz:.65});
    wall(dark,18.91,.16,12.62,1.02,2.85,-Math.PI/2);wall(dark,18.91,.16,14.87,1.02,2.85,-Math.PI/2);
    // Sloped cloth + valance and supports, adapted from actual downloaded CC0 surfaces/profiles.
    awnings.push({x:18.82,y:2.88,z:13.75,rotation:-Math.PI/2,sx:2.1/3});
    for(const [x,width] of [[24,8.6],[33,7.3],[44.3,11.2]])awnings.push({x,y:2.89,z:8.16,rotation:Math.PI,sx:width/3});
    batch(assets[3],back,'closed-shell',0xddd9cd);
    batch(assets[3],stone,'stone-piers',0xede9e0);batch(assets[3],rose,'floor-bands',0xddd3cb);batch(assets[3],dark,'dark-podium',0x292e30);
    batch(assets[0],office,'office-windows');
    const retail={scene:assets[0].scene.clone(true)};retail.scene.traverse(o=>{if(!o.isMesh)return;const adapted=[].concat(o.material).map(m=>{const n=m.clone();if(/glass/i.test(n.name)){n.map=null;n.color.setHex(0x40565a);n.metalness=.3;n.roughness=.20;}return n;});o.material=Array.isArray(o.material)?adapted:adapted[0];});
    batch(retail,shop,'shop-glazing');batch(assets[1],doors,'entry');batch(assets[2],coping,'coping');
    batch(assets[4],awnings,'shop-canopies');
    // Real capped metal profiles frame signs, split the shop glazing and form the patio railing.
    function beam(list,a,b,r=1){const start=new T.Vector3(...a),dir=new T.Vector3(...b).sub(start);list.push({x:a[0],y:a[1],z:a[2],sx:r,sy:dir.length(),sz:r,quaternion:new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),dir.normalize())});}
    for(const [x,width,height] of [[24,8,.60],[33,7.6,.64],[44.3,11.2,.70]]){
      const y=x===44.3?3.39:3.36;
      for(const yy of [y-height/2,y+height/2])beam(profiles,[x-width/2,yy,8.20],[x+width/2,yy,8.20]);
      for(const xx of [x-width/2,x+width/2])beam(profiles,[xx,y-height/2,8.20],[xx,y+height/2,8.20]);
    }
    for(const x of [21,25,29,37,45,49]){beam(profiles,[x,.24,8.28],[x,2.78,8.28],.7);beam(profiles,[x-1.78,1.1,8.28],[x+1.78,1.1,8.28],.65);}
    for(const [x,width] of [[33,1.85],[41,1.85]])treads.push({x,y:.13,z:8.55,sx:width/3,sy:.50/3,quaternion:horizontal});
    for(const x of [38.7,41.5,44.3,47.1,49.9])beam(rails,[x,.12,6.95],[x,.92,6.95],1.15);
    for(const yy of [.38,.78])beam(rails,[38.7,yy,6.95],[49.9,yy,6.95],.85);
    for(const x of [38.7,49.9])for(const yy of [.38,.78])beam(rails,[x,yy,6.95],[x,yy,8.05],.85);
    batch(assets[5],profiles,'sign-and-glass-profiles');batch(assets[5],rails,'patio-rails');batch(assets[3],treads,'entry-thresholds',0xaaa69b);
    const patioBox=new T.Box3().setFromObject(assets[6].scene),patioSize=patioBox.getSize(new T.Vector3()),patioScale=Math.min(2.35/patioSize.x,1.35/patioSize.z);
    batch(assets[6],[22.4,26.5].map(x=>({x,y:.13,z:7.48,sx:patioScale,sy:patioScale,sz:patioScale})),'patio-seating');
    const service={scene:assets[3].scene.clone(true)},normalBytes=new Uint8Array(64*512*4);
    for(let y=0;y<512;y++)for(let x=0;x<64;x++){const i=(y*64+x)*4,ny=Math.sin(y*Math.PI/6)*.38;normalBytes.set([128,Math.round((ny*.5+.5)*255),Math.round((Math.sqrt(1-ny*ny)*.5+.5)*255),255],i);}
    const shutterNormal=new T.DataTexture(normalBytes,64,512,T.RGBAFormat);shutterNormal.needsUpdate=true;
    service.scene.traverse(o=>{if(!o.isMesh)return;const adapted=[].concat(o.material).map(m=>{const n=m.clone();n.name='Authored corrugated parking-side metal';n.normalMap=shutterNormal;n.metalness=.55;n.roughness=.72;return n;});o.material=Array.isArray(o.material)?adapted:adapted[0];});
    batch(service,shutters,'parking-side-service-panels',0x71828a);
    function sign(text,w,h,x,y,z,rotation,bg,fg,vertical=false,detail){
      const canvas=document.createElement('canvas');canvas.width=vertical?256:1024;canvas.height=vertical?1536:192;const c=canvas.getContext('2d');c.fillStyle=bg;c.fillRect(0,0,canvas.width,canvas.height);c.fillStyle=fg;c.textAlign='center';c.textBaseline='middle';
      if(vertical){c.font='bold 140px Malgun Gothic,sans-serif';const chars=[...text.replaceAll(' ','')];chars.forEach((ch,i)=>c.fillText(ch,128,(i+.5)*canvas.height/chars.length,220));}
      else if(detail){
        if(detail.emblem==='diamond'){c.strokeStyle=fg;c.lineWidth=9;c.beginPath();c.moveTo(86,38);c.lineTo(138,96);c.lineTo(86,154);c.lineTo(34,96);c.closePath();c.stroke();}
        if(detail.emblem==='roof'){c.fillStyle='#6d9459';c.beginPath();c.moveTo(36,48);c.lineTo(80,24);c.lineTo(124,48);c.closePath();c.fill();c.fillStyle=fg;}
        c.font='bold 104px Malgun Gothic,sans-serif';c.fillText(text,detail.emblem?563:512,109,detail.emblem?842:980);
        if(detail.subtitle){c.font='25px Malgun Gothic,sans-serif';c.fillText(detail.subtitle,563,29,810);}
      }else{c.font='bold 128px Malgun Gothic,sans-serif';c.fillText(text,512,96,980);}
      c.strokeStyle=vertical?'#8a8780':'#746d60';c.lineWidth=4;c.strokeRect(3,3,canvas.width-6,canvas.height-6);
      const map=new T.CanvasTexture(canvas);map.colorSpace=T.SRGBColorSpace;const mesh=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshStandardMaterial({map,roughness:.85}));mesh.name='clinic-sign-'+text;mesh.position.set(x,y,z);mesh.rotation.y=rotation;root.add(mesh);
    }
    // Authored window films and notices from the observed treatment, without copying Naver imagery.
    function film(text,w,h,x,y,z,bg='#d9ddd7',fg='#343e3b'){
      const c=document.createElement('canvas');c.width=512;c.height=256;const g=c.getContext('2d');g.fillStyle=bg;g.fillRect(0,0,512,256);g.strokeStyle='#a2a99c';g.lineWidth=7;g.strokeRect(16,16,480,224);g.fillStyle=fg;g.textAlign='center';g.textBaseline='middle';g.font='bold 58px Malgun Gothic,sans-serif';g.fillText(text,256,130,454);
      const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;const o=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshStandardMaterial({map,roughness:.75}));o.name='clinic-window-film-'+text;o.position.set(x,y,z);o.rotation.y=Math.PI;root.add(o);
    }
    film('보문산 식후경',3.35,.72,29.1,1.78,8.20);film('방문을 환영합니다',3.35,.72,36.9,1.78,8.20);
    for(const x of [32.64,40.64])film('출입문',.40,.23,x,1.58,8.17,'#e5e3d8','#565b52');
    // Narrow joint courses make the original stone panels legible at walking distance.
    const jointMaterial=new T.MeshStandardMaterial({color:0x363b3b,roughness:1});
    const joints=new T.InstancedMesh(new T.PlaneGeometry(.28,.012),jointMaterial,36),jointTransform=new T.Object3D();let jointIndex=0;
    joints.name='clinic-stone-joints';
    for(let col=0;col<=8;col++)for(const y of [.64,1.28,1.92,2.56]){jointTransform.position.set(19+col*4,y,8.385);jointTransform.rotation.y=Math.PI;jointTransform.updateMatrix();joints.setMatrixAt(jointIndex++,jointTransform.matrix);}
    joints.computeBoundingSphere();root.add(joints);
    sign('벤조인 요양병원',5.9,.56,51.23,6.35,12,Math.PI/2,'#c3c5bd','#315f70');
    sign('벤조인 요양병원',11.8,.62,43,6.35,8.27,Math.PI,'#c6c9c0','#315f70');
    sign('벤조인 요양병원',5.9,.56,18.77,6.35,12,-Math.PI/2,'#c3c5bd','#315f70');
    sign('풍전돈까스',5.8,.68,18.77,3.36,12,-Math.PI/2,'#d5d2bc','#2c302b');
    sign('풍전돈까스',8,.60,24,3.36,8.26,Math.PI,'#292c2b','#d5c6a2');
    sign('보문산 식후경',7.6,.64,33,3.36,8.25,Math.PI,'#e4e3d9','#30332c',false,{emblem:'roof'});
    sign('명륜진사갈비',11.2,.70,44.3,3.39,8.25,Math.PI,'#20262b','#c5ad72',false,{emblem:'diamond',subtitle:'숯불돼지갈비'});
    sign('명륜진사갈비',.50,3.1,50.58,5.15,8.24,Math.PI,'#20262b','#c5ad72',true);
    sign('GOLFZON',5.5,.38,51.23,15.35,12,Math.PI/2,'#d0d0c7','#777b75');
    sign('벤조인요양병원',.56,9.3,50.70,12.7,8.25,Math.PI,'#725750','#d6d3c5',true);
    // Match the legacy street-only facade layer. The separate upstairs hall stays usable.
    root.traverse(o=>o.layers.set(3));
    world.streets.group.add(root);legacy.visible=false;
    status.officeWindows=office.length;status.shopWindows=shop.length;status.entries=doors.length;status.wallPanels=back.length+stone.length+rose.length+dark.length;
    status.parkingServicePanels=shutters.length;
    status.canopies=awnings.length;status.renderLayerMask=8;
    status.shopsFromPoyuCorner=['풍전돈까스','보문산 식후경','명륜진사갈비'];
    status.detailing={profiles:profiles.length,railingPieces:rails.length,patioSets:2,thresholds:treads.length,windowFilms:4,slopedCanopies:awnings.length};
    status.models=modelFiles.map(f=>f.replace('.glb',''));status.loaded=true;
  }catch(error){status.error=error.message;console.warn('Right building facade:',error);}
  return status;
};
