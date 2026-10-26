/* Offline 3D apartment scene. The floor plan is a playable approximation of the photo references. */
window.createPoyuWorld = function createPoyuWorld(THREE, renderer) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x182531);
  const colliders = [];
  const collectibles = [];
  const clock = new THREE.Clock();
  const random = (() => { let seed = 18371; return () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296); })();
  const placements=[],floorAreas=[];
  function texture(w, h, draw, repeatX = 1, repeatY = 1) {
    const canvas = document.createElement('canvas'); canvas.width = w; canvas.height = h;
    const g = canvas.getContext('2d'); draw(g, w, h);
    const t = new THREE.CanvasTexture(canvas); t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeatX, repeatY);
    t.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
    return t;
  }
  const surfaces=window.createPoyuSurfaces(THREE,texture);
  const plaster = texture(256,256,(g,w,h)=>{
    g.fillStyle='#dedbd6';g.fillRect(0,0,w,h);
    for(let i=0;i<12000;i++){const n=Math.floor(random()*255);g.fillStyle=`rgba(${n},${n},${n},${random()*.035})`;g.fillRect(random()*w,random()*h,1,1);}
  },3,1);
  const oak = texture(512,512,(g,w,h)=>{
    g.fillStyle='#ad8d6c';g.fillRect(0,0,w,h);
    const widths=[84,84,84,84,84,92];let x=0;
    for(let b=0;b<widths.length;b++){
      const bw=widths[b],shade=Math.floor(random()*24)-12;
      g.fillStyle=`rgb(${172+shade},${143+shade},${109+shade})`;g.fillRect(x,0,bw,h);
      g.fillStyle='rgba(52,34,23,.38)';g.fillRect(x,0,2,h);
      for(let j=0;j<33;j++){g.strokeStyle=`rgba(71,44,22,${.025+random()*.11})`;g.lineWidth=.5+random()*1.8;g.beginPath();const gx=x+random()*bw;g.moveTo(gx,0);g.bezierCurveTo(gx+random()*7-3,h*.3,gx+random()*8-4,h*.65,gx+random()*6-3,h);g.stroke();}
      x+=bw;
    }
    g.fillStyle='rgba(47,35,29,.20)';g.fillRect(0,256,w,2);
  },6,4);
  const tile = texture(512,512,(g,w,h)=>{
    g.fillStyle='#b7b2ad';g.fillRect(0,0,w,h);
    const tw=128,th=51;
    for(let row=0;row<11;row++)for(let col=-1;col<5;col++){
      const shift=row%2?64:0,x=col*tw+shift,y=row*th;
      const n=Math.floor(random()*20)-10;g.fillStyle=`rgb(${92+n},${96+n},${97+n})`;g.fillRect(x+2,y+2,tw-4,th-4);
      g.fillStyle='rgba(230,229,222,.07)';g.fillRect(x+4,y+4,tw-8,2);
      for(let k=0;k<18;k++){g.fillStyle=`rgba(0,0,0,${random()*.035})`;g.fillRect(x+4+random()*(tw-8),y+4+random()*(th-8),2,2);}
    }
  },1,1);
  const floorTile = texture(256,256,(g,w,h)=>{
    g.fillStyle='#b3b0aa';g.fillRect(0,0,w,h);
    for(let y=0;y<4;y++)for(let x=0;x<4;x++){
      const n=Math.floor(random()*13)-6;
      g.fillStyle=`rgb(${132+n},${135+n},${135+n})`;
      g.fillRect(x*64+2,y*64+2,60,60);
    }
  },3,2);
  const stone = texture(256,256,(g,w,h)=>{
    g.fillStyle='#b7b4ae';g.fillRect(0,0,w,h);
    for(let i=0;i<5500;i++){const n=80+Math.floor(random()*125);g.fillStyle=`rgba(${n},${n},${n},${random()*.25})`;g.fillRect(random()*w,random()*h,1+random()*2,1+random()*2);}
  },2,1);
  const fabric = texture(256,256,(g,w,h)=>{
    g.fillStyle='#59636b';g.fillRect(0,0,w,h);
    for(let i=0;i<13000;i++){g.fillStyle=random()>.5?'rgba(232,235,236,.055)':'rgba(5,12,17,.09)';g.fillRect(random()*w,random()*h,1,1);}
  },2,2);
  const rugTex = texture(256,256,(g,w,h)=>{
    g.fillStyle='#766e67';g.fillRect(0,0,w,h);
    for(let i=0;i<20000;i++){g.fillStyle=random()>.5?'rgba(238,225,210,.12)':'rgba(28,21,17,.12)';g.fillRect(random()*w,random()*h,1,2);}
  },2,2);
  const furnitureGrain=texture(512,512,(g,w,h)=>{
    g.fillStyle='#b39a7e';g.fillRect(0,0,w,h);
    for(let i=0;i<260;i++){
      const y=i*2+random()*2;g.strokeStyle=`rgba(48,28,14,${.025+random()*.09})`;g.lineWidth=.4+random()*1.2;
      g.beginPath();g.moveTo(0,y);g.bezierCurveTo(160,y+Math.sin(i*.21)*7,340,y+Math.cos(i*.13)*9,512,y+Math.sin(i*.3)*4);g.stroke();
    }
  });
  const clothDetail=texture(512,512,(g,w,h)=>{
    g.fillStyle='#7c8793';g.fillRect(0,0,w,h);
    for(let i=0;i<512;i+=2){g.fillStyle=i%4?'#a1a8af28':'#273b4b35';g.fillRect(i,0,1,h);g.fillRect(0,i,w,1);}
    for(let i=0;i<18000;i++){g.fillStyle=random()>.5?'#dbe1e418':'#15253218';g.fillRect(random()*w,random()*h,1,1);}
  },3,3);
  const plasterNormal=texture(256,256,(g,w,h)=>{
    g.fillStyle='#8080ff';g.fillRect(0,0,w,h);
    for(let i=0;i<18000;i++){const n=120+Math.floor(random()*16);g.fillStyle=`rgb(${n},${128+Math.floor(random()*12)-6},255)`;g.fillRect(random()*w,random()*h,1,1);}
  },4,3);
  const mat = {
    wall:new THREE.MeshStandardMaterial({map:plaster,normalMap:plasterNormal,normalScale:new THREE.Vector2(.16,.16),roughness:.96,color:0xd5d7d9}),
    floor:new THREE.MeshStandardMaterial({map:oak,color:0xc4c1bb,roughness:.74}),
    floorTile:new THREE.MeshStandardMaterial({map:floorTile,roughness:.83}),
    tile:new THREE.MeshStandardMaterial({map:tile,roughness:.76}),
    backsplash:new THREE.MeshStandardMaterial({map:tile,roughness:.68}),
    stone:new THREE.MeshStandardMaterial({map:stone,roughness:.52,metalness:.03}),
    wood:new THREE.MeshStandardMaterial({map:furnitureGrain,color:0x8e7256,roughness:.66}),
    paleWood:new THREE.MeshStandardMaterial({map:furnitureGrain,color:0xc9b394,roughness:.69}),
    darkWood:new THREE.MeshStandardMaterial({map:furnitureGrain,color:0x5f4535,roughness:.72}),
    white:new THREE.MeshStandardMaterial({color:0xe9e7e2,roughness:.56}),
    cabinet:new THREE.MeshStandardMaterial({color:0xf2f0e9,roughness:.48}),
    steel:new THREE.MeshStandardMaterial({color:0x9aa2a6,metalness:.78,roughness:.28}),
    black:new THREE.MeshStandardMaterial({color:0x151b20,metalness:.24,roughness:.36}),
    glass:new THREE.MeshPhysicalMaterial({color:0xc4d8e8,transparent:true,opacity:.14,metalness:.03,roughness:.10,depthWrite:false}),
    cloth:new THREE.MeshStandardMaterial({map:fabric,color:0x9da3aa,roughness:1}),
    blanket:new THREE.MeshStandardMaterial({map:clothDetail,color:0x798a9e,roughness:1,side:THREE.DoubleSide}),
    pillow:new THREE.MeshStandardMaterial({color:0x9a9ea4,roughness:1}),
    rug:new THREE.MeshStandardMaterial({map:rugTex,roughness:1}),
    red:new THREE.MeshStandardMaterial({color:0x9e2e31,roughness:.65})
  };
  const interior=window.createPoyuInteriorPolish(THREE,{scene,mat,texture,renderer});
  // Generated photo textures replace the procedural fallback when local images load.
  if (typeof document.createElementNS === 'function') {
    const loader = new THREE.TextureLoader();
    const upgrade = (path, material, rx, ry) => loader.load(window.PoyuInteriorPhotos?.[path.split("/").pop()]||path, image => {
      image.colorSpace = THREE.SRGBColorSpace;
      image.wrapS = image.wrapT = THREE.RepeatWrapping;
      image.repeat.set(rx, ry);
      image.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
      material.map = image;material.userData.photoSource=path;
      material.needsUpdate = true;
    }, undefined, () => {});
    upgrade('assets/oak-floor.png', mat.floor, 3, 2);
    upgrade('assets/kitchen-tile.png', mat.backsplash, 3, 1);
  }
  function box(w,h,d,x,y,z,material,cast=true) {
    const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);o.position.set(x,y,z);o.castShadow=cast;o.receiveShadow=true;scene.add(o);return o;
  }
  function bevelBox(w,h,d,x,y,z,material,r=.015){
    if(Math.min(w,h,d)<r*2.1)return box(w,h,d,x,y,z,material);
    const a=w/2-r,b=h/2-r,shape=new THREE.Shape();
    shape.moveTo(-a,-b);shape.lineTo(a,-b);shape.lineTo(a,b);shape.lineTo(-a,b);shape.closePath();
    const geo=new THREE.ExtrudeGeometry(shape,{depth:d-2*r,bevelEnabled:true,bevelThickness:r,bevelSize:r,bevelSegments:3,steps:1});
    geo.translate(0,0,-(d-2*r)/2);
    const mesh=new THREE.Mesh(geo,material);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;scene.add(mesh);return mesh;
  }
  function blocker(x,z,w,d,pad=0,kind='furniture',id='') {const c={minX:x-w/2-pad,maxX:x+w/2+pad,minZ:z-d/2-pad,maxZ:z+d/2+pad,kind,id};colliders.push(c);return c;}
  function footprint(id,x,z,w,d){const c=blocker(x,z,w,d,0,'furniture',id);placements.push(c);return c;}
  function wall(w,h,d,x,y,z,material=mat.wall){box(w,h,d,x,y,z,material);blocker(x,z,w,d,0,'wall');}
  function cylinder(rt,rb,h,x,y,z,material,segments=24){const o=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,segments),material);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;scene.add(o);return o;}
  function sphere(r,x,y,z,material){const o=new THREE.Mesh(new THREE.SphereGeometry(r,16,10),material);o.position.set(x,y,z);o.castShadow=true;scene.add(o);return o;}
  function plane(w,h,x,y,z,material,ry=0,rx=0){const o=new THREE.Mesh(new THREE.PlaneGeometry(w,h),material);o.position.set(x,y,z);o.rotation.set(rx,ry,0);o.receiveShadow=true;scene.add(o);return o;}
  function line(x1,y1,z1,x2,y2,z2,material,r=.012){const a=new THREE.Vector3(x1,y1,z1),b=new THREE.Vector3(x2,y2,z2),d=b.clone().sub(a);const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,d.length(),8),material);o.position.copy(a.add(b).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());o.castShadow=true;scene.add(o);return o;}
  const contactTex=texture(128,128,(g,w,h)=>{
    const shade=g.createRadialGradient(w/2,h/2,8,w/2,h/2,w/2);
    shade.addColorStop(0,'rgba(10,13,20,.38)');shade.addColorStop(.55,'rgba(10,13,20,.16)');shade.addColorStop(1,'rgba(10,13,20,0)');
    g.fillStyle=shade;g.fillRect(0,0,w,h);
  });
  const contactMat=new THREE.MeshBasicMaterial({map:contactTex,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1});
  function contact(x,z,w,d){const p=new THREE.Mesh(new THREE.PlaneGeometry(w,d),contactMat);p.rotation.x=-Math.PI/2;p.position.set(x,.023,z);p.renderOrder=1;scene.add(p);}
  const apartment=window.buildPoyuPhotoApartment(THREE,{scene,mat,texture,interior,colliders,floorAreas,collectibles,footprint,blocker,bevelBox});
  const {homeDoor,entrance,referenceView,updateTV}=apartment;
  const doorMat=mat.wood;
  const hemi=new THREE.HemisphereLight(0xb2c2ce,0x625d53,.65);scene.add(hemi);
  scene.add(new THREE.AmbientLight(0x99a8b1,.10));
  const dawn=new THREE.DirectionalLight(0xf0dfc5,1.12);dawn.castShadow=true;dawn.shadow.mapSize.set(2048,2048);dawn.shadow.camera.left=-30;dawn.shadow.camera.right=30;dawn.shadow.camera.top=30;dawn.shadow.camera.bottom=-30;dawn.shadow.bias=-.00015;dawn.shadow.normalBias=.025;dawn.shadow.radius=2;scene.add(dawn);
  const encounter=window.buildPoyuHallway(THREE,{scene,mat,doorMat,box,bevelBox,wall,plane,line,cylinder,sphere,footprint,blocker,floorAreas,texture,homeDoor,buildEntryStorage:apartment.buildEntryStorage});
  // Interior geometry has its own render layer. The street uses the complete exterior
  // shell, so a separately laid-out upper-floor room cannot float across a public road.
  for(const root of scene.children)if(!root.isLight)root.traverse(o=>{if(o.isMesh)o.layers.set(1);});
  const elevator=window.buildPoyuElevator(THREE,{scene,mat,texture,colliders,floorAreas,finishes:encounter.finishes});
  const parking=window.buildPoyuParking(THREE,{scene,mat,texture,y:elevator.levels.floor2.y,surfaces,colliders:elevator.parkingColliders,floorAreas:elevator.parkingFloors,rooms:elevator.parkingRooms});
  const ownCollider=parking.vehicle.collider;elevator.parkingColliders.splice(elevator.parkingColliders.indexOf(ownCollider),1);
  const streets=window.buildPoyuStreets(THREE,{scene,mat,texture,parkingY:elevator.levels.floor2.y,groundY:elevator.groundY,surfaces});
  // Street facades occupy a separate layout from the upper interior. Keep the
  // nearby hospital's shell from cutting through the photographed lift lobby.
  streets.group.getObjectByName('reference-hospital')?.traverse(o=>o.layers.set(3));
  const mart=window.buildPoyuMartInterior(THREE,{scene,texture,surfaces,groundY:elevator.groundY}),isMart=level=>!!mart.levels[level];
  const geometryStats={parking:window.batchPoyuStatics(THREE,parking.group),streets:window.batchPoyuStatics(THREE,streets.group)};
  dawn.position.set(80,42,55);dawn.target.position.set(25,-7,45);scene.add(dawn.target);dawn.shadow.camera.far=180;dawn.shadow.camera.updateProjectionMatrix();
  elevator.groundColliders.push(...streets.colliders);elevator.groundFloors.push(...streets.floors);elevator.groundRooms.push(...streets.rooms);
  function hasWallBetween(x0,z0,x1,z1,level='floor4'){
    return getColliders(level).some(c=>{
      if(c.kind!=='wall'||c.enabled===false)return false;
      let low=0,high=1;
      for(const [start,delta,min,max] of [[x0,x1-x0,c.minX,c.maxX],[z0,z1-z0,c.minZ,c.maxZ]]){
        if(Math.abs(delta)<1e-8){if(start<min||start>max)return false;continue;}
        const a=(min-start)/delta,b=(max-start)/delta;low=Math.max(low,Math.min(a,b));high=Math.min(high,Math.max(a,b));if(low>high)return false;
      }
      return high>.001&&low<.999;
    });
  }
  const rooms=[...apartment.rooms,encounter.room,...elevator.rooms];
  const bounds={minX:0,maxX:36.6,minZ:-6.4,maxZ:22};
  const getBounds=(level='floor4')=>level==='mart1'?{minX:170,maxX:196,minZ:407,maxZ:436}:isMart(level)||level==='martTravel'?mart.bounds:level==='floor2'?{minX:7.7,maxX:52,minZ:18,maxZ:58}:level==='ramp'?{minX:43.8,maxX:50.2,minZ:58,maxZ:86}:level==='floor1'?streets.bounds:bounds;
  const getColliders=(level='floor4')=>isMart(level)?mart.colliders[level]:level==='ramp'?streets.rampColliders:level==='floor2'?elevator.parkingColliders:level==='floor1'?elevator.groundColliders:colliders;
  const getRooms=(level='floor4')=>isMart(level)?mart.rooms[level]:level==='ramp'?[{id:'ramp',name:'차량 경사로',kind:'ramp',minX:44,maxX:50,minZ:58,maxZ:86,labelX:47,labelZ:72}]:level==='floor2'?elevator.parkingRooms:level==='floor1'?elevator.groundRooms:rooms;
  const containsFloor=(x,z,level='floor4')=>(isMart(level)?mart.floors[level]:level==='ramp'?streets.rampFloors:level==='floor2'?elevator.parkingFloors:level==='floor1'?elevator.groundFloors:floorAreas).some(r=>window.poyuAreaContains(r,x,z));
  function footSurface(x,z,level='floor4'){
    if(isMart(level))return containsFloor(x,z,level)?{level,y:mart.levels[level].y}:null;
    const ramp=streets.rampSurface(x,z);if(ramp&&['floor2','floor1','ramp'].includes(level))return ramp;
    if(level==='ramp'){if(z<58&&containsFloor(x,z,'floor2'))return {level:'floor2',y:parking.y};if(z>86&&containsFloor(x,z,'floor1'))return {level:'floor1',y:elevator.groundY};return null;}
    if(!containsFloor(x,z,level))return null;
    const extra=level==='floor1'?Math.max(0,...streets.floors.filter(r=>window.poyuAreaContains(r,x,z)&&!(r.excludeRoads&&streets.roads.some(a=>window.poyuAreaContains(a,x,z)))).map(r=>r.height||0)):0;
    return {level,y:level==='floor1'?elevator.groundY+extra:level==='floor2'?parking.y:0};
  }
  function isWalkable(x,z,r=.25,level='floor4'){
    const surface=footSurface(x,z,level);if(!surface)return false;
    // Check the body's corners as well as its centre at every un-walled edge.
    for(const dx of [-r,r])for(const dz of [-r,r]){const s=footSurface(x+dx,z+dz,surface.level);if(!s||Math.abs(s.y-surface.y)>.5)return false;}
    if(parking.state.level===surface.level&&x+r>ownCollider.minX&&x-r<ownCollider.maxX&&z+r>ownCollider.minZ&&z-r<ownCollider.maxZ)return false;
    return !getColliders(surface.level).some(c=>c.kind!=='curb'&&c.enabled!==false&&x+r>c.minX&&x-r<c.maxX&&z+r>c.minZ&&z-r<c.maxZ);
  }
  function driveSurface(x,z,level='floor2'){
    const ramp=streets.rampSurface(x,z);if(ramp)return ramp;
    if((level==='floor2'||level==='ramp')&&x>=16&&x<=52&&z>=18&&z<=58)return {level:'floor2',y:parking.y,slopeZ:0};
    if(level!=='floor2'){const road=streets.roads.find(r=>window.poyuAreaContains(r,x,z));if(road)return {level:'floor1',y:elevator.groundY+(road.height||0),slopeZ:0};}
    return null;
  }
  const getRoomName=(x,z,level='floor4')=>isMart(level)?mart.levels[level].name:level==='martTravel'?mart.status:level==='ramp'?'차량 경사로 · 1층 방향':level==='riding'?'엘리베이터':(level==='floor1'?getRooms(level).find(r=>r.kind==='road'&&window.poyuAreaContains(r,x,z))||getRooms(level).find(r=>window.poyuAreaContains(r,x,z)):getRooms(level).find(r=>window.poyuAreaContains(r,x,z)))?.name||'거실 · 주방';
  const environment=window.createPoyuExterior?.(THREE,scene,{texture,random});
  if(environment){
    const sky=environment.group.getObjectByName('dawn-sky');if(sky){scene.attach(sky);sky.position.set(20,0,50);sky.scale.setScalar(6);}
    for(const c of environment.clouds)scene.attach(c.mesh);for(const b of environment.birds)scene.attach(b.mesh);
    environment.group.position.set(-220,0,-140);scene.fog.color.setHex(0xa9b6bc);scene.fog.density=.0015;
    if(sky&&typeof document.createElementNS==='function')new THREE.TextureLoader().load(window.PoyuPhotos?.['dawn-sky-v1.png']||'assets/dawn-sky-v1.png',map=>{
      map.colorSpace=THREE.SRGBColorSpace;sky.material.map.dispose();sky.material.map=map;sky.material.needsUpdate=true;
      if(renderer.isWebGLRenderer&&THREE.PMREMGenerator){const filter=new THREE.PMREMGenerator(renderer),env=filter.fromEquirectangular(map);scene.environment?.dispose();scene.environment=env.texture;filter.dispose();}
      for(const c of environment.clouds)c.mesh.material.opacity=.055;
    },undefined,()=>{});
  }
  // A locally rendered sky cubemap gives glass, brushed metal and vehicle paint a
  // broad reflection highlight even when running entirely from file://.
  if(renderer.isWebGLRenderer&&THREE.PMREMGenerator){
    const faces=[];for(let i=0;i<6;i++){const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d'),a=g.createLinearGradient(0,0,0,128);a.addColorStop(0,'#869da9');a.addColorStop(.55,'#d5d9d3');a.addColorStop(.57,'#888e89');a.addColorStop(1,'#51584e');g.fillStyle=a;g.fillRect(0,0,128,128);if(i!==2&&i!==3){g.fillStyle='#a4ada9';for(let x=0;x<128;x+=19)g.fillRect(x,70-(x%29),12,35+(x%29));}faces.push(c);}
    const cube=new THREE.CubeTexture(faces);cube.colorSpace=THREE.SRGBColorSpace;cube.needsUpdate=true;const pmrem=new THREE.PMREMGenerator(renderer);scene.environment=pmrem.fromCubemap(cube).texture;cube.dispose();pmrem.dispose();
  }
  function updatePresentation(player,camera,dt=.05){
    const upper=player.level==='floor4'||player.level==='riding';interior.update(upper);if(upper)camera.layers.enable(1);else camera.layers.disable(1);
    if(upper)camera.layers.disable(3);else camera.layers.enable(3);
    const insideMart=isMart(player.level)||player.level==='martTravel',atMartDoor=player.level==='floor1'&&Math.hypot(player.x-183,player.z-435)<14;
    if(insideMart||atMartDoor)camera.layers.enable(2);else camera.layers.disable(2);mart.ambient.visible=insideMart;
    const street=player.level==='floor1'&&player.x>51||player.level==='ramp'&&player.z>79;
    const hall=upper&&player.x>=16&&player.x<=36.6&&player.z>=8.2;
    const blend=Math.min(1,dt*2);hemi.intensity+=((street?.88:hall?.42:.53)-hemi.intensity)*blend;dawn.intensity+=((street?1.18:hall?.40:.72)-dawn.intensity)*blend;
    const exposure=renderer.toneMappingExposure??.94;renderer.toneMappingExposure=exposure+((street?1.03:hall?.98:.94)-exposure)*blend;
    // Keep shadow texels useful at human scale instead of spreading them over 220m.
    const x=Math.round(player.x/3)*3,z=Math.round(player.z/3)*3,y=player.floorY||0;
    dawn.position.set(x+36,y+55,z+25);dawn.target.position.set(x,y,z);
  }
  const updateEnvironment=time=>environment?.update(time);
  return {scene,interior,apartment,colliders,placements,collectibles,entrance,homeDoor,interiorDoors:apartment.interiorDoors,encounter,elevator,parking,streets,mart,geometryStats,texture,clock,updateTV,referenceView,environment,updateEnvironment,updatePresentation,rooms,bounds,floorAreas,containsFloor,isWalkable,footSurface,driveSurface,getBounds,getColliders,getRooms,getRoomName,hasWallBetween,doorways:apartment.doorways,itemsById:Object.fromEntries(collectibles.map(i=>[i.id,i]))};
};
