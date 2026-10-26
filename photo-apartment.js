/* Clean reconstruction of the user's entrance/living photos and annotated room layout.
   The bathroom and small-room doors were confirmed by the user. Dimensions and unseen rooms are estimates. */
window.buildPoyuPhotoApartment=function(T,kit){
  const {scene,mat,texture,interior,floorAreas,collectibles,footprint,blocker}=kit;
  const colliderStart=kit.colliders.length,floorStart=floorAreas.length,lightStart=interior.lights.length;
  const size=1.12,anchorX=15.93,anchorZ=10.80;
  const spreadX=x=>anchorX+(x-anchorX)*size,spreadZ=z=>anchorZ+(z-anchorZ)*size;
  const group=new T.Group();group.name='photo-reference-apartment';scene.add(group);const H=2.55,doorways=[],interiorDoors=[],anchors={};
  const material=(color,roughness=.8,extra={})=>new T.MeshStandardMaterial({color,roughness,...extra});
  const white=material(0xe6e5df,.63),trim=material(0xbcbeb5),black=material(0x252a2c,.7),steel=mat.steel,wood=mat.paleWood;
  const plaster=material(0xe2e1d9,.96),ceramic=material(0xe0e3df,.3),leafMat=material(0x425d45);
  const timber=texture(512,512,(g,w,h)=>{g.fillStyle='#d6d1c5';g.fillRect(0,0,w,h);for(let row=0;row<8;row++){const y=row*64,shade=207+(row*7)%17;g.fillStyle=`rgb(${shade+5},${shade+1},${shade-8})`;g.fillRect(0,y,w,63);for(let j=0;j<22;j++){g.strokeStyle='#796a5011';g.beginPath();g.moveTo(0,y+j*2.8);g.bezierCurveTo(180,y+j*2.8+3,370,y+j*2.8-3,w,y+j*2.8);g.stroke();}g.fillStyle='#8a817a42';g.fillRect((row*173)%512,y,1,64);}});
  const floorMat=material(0xf4f0e7,.8,{map:timber});
  const tileTex=texture(256,256,(g,w,h)=>{g.fillStyle='#b7b7ae';g.fillRect(0,0,w,h);for(let y=0;y<4;y++)for(let x=0;x<4;x++){g.fillStyle=(x+y)%2?'#5c6265':'#626769';g.fillRect(x*64+1,y*64+1,62,62);}}),tile=material(0xc4c7c5,.78,{map:tileTex});
  function mesh(g,m,x,y,z,parent=group,name=''){const o=new T.Mesh(g,m);o.position.set(x,y,z);o.name=name;o.castShadow=o.receiveShadow=true;parent.add(o);return o;}
  function box(w,h,d,x,y,z,m=white,parent=group,name=''){return mesh(new T.BoxGeometry(w,h,d),m,x,y,z,parent,name);}
  function round(w,h,d,x,y,z,m=white,r=.015,parent=group){const o=kit.bevelBox(w,h,d,x,y,z,m,r);parent.add(o);return o;}
  function cyl(rt,rb,h,x,y,z,m=white,parent=group){return mesh(new T.CylinderGeometry(rt,rb,h,24),m,x,y,z,parent);}
  function ball(sx,sy,sz,x,y,z,m=white,parent=group){const o=mesh(new T.SphereGeometry(1,20,14),m,x,y,z,parent);o.scale.set(sx,sy,sz);return o;}
  function rod(a,b,r,m=steel,parent=group){const av=new T.Vector3(...a),bv=new T.Vector3(...b),c=av.clone().add(bv).multiplyScalar(.5),o=cyl(r,r,av.distanceTo(bv),c.x,c.y,c.z,m,parent);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),bv.sub(av).normalize());return o;}
  function plane(w,h,x,y,z,m,ry=0,rx=0,parent=group){const o=mesh(new T.PlaneGeometry(w,h),m,x,y,z,parent);o.rotation.set(rx,ry,0);return o;}
  // Rooms may expand without making furniture wider or separating its soft parts.
  function furnishing(name,x,z,build){
    const existing=new Set([...group.children,...interior.details.children]),firstCollider=kit.colliders.length;
    build();
    const parts=[...group.children,...interior.details.children].filter(o=>!existing.has(o));
    const root=new T.Group();root.name=name;root.position.set(x,0,z);root.scale.set(1/size,1,1/size);group.add(root);
    for(const part of parts){part.position.x-=x;part.position.z-=z;root.add(part);}
    for(const c of kit.colliders.slice(firstCollider)){c.minX=x+(c.minX-x)/size;c.maxX=x+(c.maxX-x)/size;c.minZ=z+(c.minZ-z)/size;c.maxZ=z+(c.maxZ-z)/size;}
    return root;
  }
  function floor(x0,x1,z0,z1,m=floorMat,y=0,period=2.4){floorAreas.push({minX:x0,maxX:x1,minZ:z0,maxZ:z1});const g=new T.PlaneGeometry(x1-x0,z1-z0),p=g.attributes.position,uv=g.attributes.uv;for(let i=0;i<p.count;i++)uv.setXY(i,(p.getX(i)+(x0+x1)/2)/period,(-p.getY(i)+(z0+z1)/2)/period);const o=mesh(g,m,(x0+x1)/2,y,(z0+z1)/2);o.rotation.x=-Math.PI/2;box(x1-x0,.09,z1-z0,(x0+x1)/2,H+.045,(z0+z1)/2,white).castShadow=false;}
  function wallX(x,a,b,id='wall'){if(b-a<.001)return;box(.14,H,b-a,x,H/2,(a+b)/2,plaster);blocker(x,(a+b)/2,.14,b-a,0,'wall',id);box(.18,.085,b-a,x,.05,(a+b)/2,trim);box(.16,.035,b-a,x,H-.025,(a+b)/2,white);}
  function wallZ(z,a,b,id='wall'){if(b-a<.001)return;box(b-a,H,.14,(a+b)/2,H/2,z,plaster);blocker((a+b)/2,z,b-a,.14,0,'wall',id);box(b-a,.085,.18,(a+b)/2,.05,z,trim);box(b-a,.035,.16,(a+b)/2,H-.025,z,white);}
  function opening(axis,fixed,a,b,center,id,width=1.1){
    width=(id==='balcony'?.95:id.includes('bathroom')?.85:.90)/size;
    const height=2.04,wall=axis==='x'?wallX:wallZ;
    wall(fixed,a,center-width/2,id+'-side-a');wall(fixed,center+width/2,b,id+'-side-b');
    const x=axis==='x'?fixed:center,z=axis==='x'?center:fixed;
    box(axis==='x'?.14:width,H-height,axis==='x'?width:.14,x,(H+height)/2,z,plaster);
    for(const s of[-1,1])box(axis==='x'?.18:.05,height,axis==='x'?.05:.18,x+(axis==='z'?s*width/2:0),height/2,z+(axis==='x'?s*width/2:0),trim);
    box(axis==='x'?.18:width+.05,.05,axis==='x'?width+.05:.18,x,height+.025,z,trim);box(axis==='x'?.20:width,.015,axis==='x'?width:.20,x,.012,z,trim);
    const pivot=new T.Group();pivot.name=id+'-hinge';pivot.position.set(axis==='x'?x:center-width/2,0,axis==='x'?center-width/2:z);group.add(pivot);
    const length=width-.045;
    box(axis==='x'?.04:length,2.00,axis==='x'?length:.04,axis==='x'?0:length/2,1.02,axis==='x'?length/2:0,wood,pivot,id+'-leaf');
    for(const side of[-1,1])box(axis==='x'?.018:.11,.028,axis==='x'?.11:.018,axis==='x'?side*.032:length-.13,.98,axis==='x'?length-.13:side*.032,steel,pivot);
    const closed=blocker(x,z,axis==='x'?.11:width-.08,axis==='x'?width-.08:.11,0,'wall',id+'-closed');
    const door={id,x,z,width,axis,pivot,closed,openness:1,target:1,setOpen(value){this.target=value?1:0;},update(dt){this.openness+=(this.target-this.openness)*Math.min(1,dt*8);if(Math.abs(this.target-this.openness)<.002)this.openness=this.target;pivot.rotation.y=(id==='ensuite-bathroom'?1:axis==='x'?-1:1)*1.48*this.openness;closed.enabled=this.openness<.82;},reset(){this.openness=this.target=1;this.update(0);}};
    door.reset();interiorDoors.push(door);doorways.push({id,x,z,width,axis});}
  function pointLight(x,y,z,power=.65,color=0xffe3bd,range=6,shadows=false){const l=new T.PointLight(color,power,range,2);l.position.set(x,y,z);l.layers.set(1);l.castShadow=shadows;if(shadows){l.shadow.mapSize.set(1024,1024);l.shadow.camera.near=.1;l.shadow.camera.far=range;l.shadow.camera.layers.set(1);l.shadow.normalBias=.012;l.shadow.bias=-.0001;}scene.add(l);interior.lights.push(l);return l;}
  function ceilingLight(x,z,roundLight=false){const emit=material(0xf2eee3,.6,{emissive:0xffe4c4,emissiveIntensity:.7});if(roundLight)cyl(.16,.16,.035,x,H-.035,z,emit);else box(.65,.035,.50,x,H-.035,z,emit);pointLight(x,H-.16,z,.65);}
  // User-edited floor plan: three rooms, two bathrooms, sofa backed by a wall.
  // Drawing left/right is world X; drawing front/back is world Z.
  floor(4.1,16,0,7.1);floor(1.8,4.1,0,11.8,tile,.006,1.6);
  floor(5.2,9.1,-4.5,0);floor(9.1,10.4,-4.5,-2.5,tile,.006,1.6);
  floor(9.1,11.2,-2.5,0);floor(11.2,16,-4.3,0);
  floor(8.3,12.4,7.1,8.5);floor(4.1,8.3,7.1,11.8);
  floor(8.3,11.1,8.5,11.8,tile,.006,1.6);floor(12.4,16,7.1,11.8,tile,.006,1.6);
  // Rear master and small room share a short central vestibule.
  // The master bedroom has a long window on its left exterior wall.
  wallX(5.2,-4.5,-3.85);wallX(5.2,-.85,0);
  box(.14,.76,3.0,5.2,.38,-2.35,plaster);box(.14,.28,3.0,5.2,2.41,-2.35,plaster);
  const masterGlass=material(0xa8c4cf,.16,{transparent:true,opacity:.27,depthWrite:false,side:T.DoubleSide});
  box(.035,1.51,2.91,5.2,1.52,-2.35,masterGlass,group,'master-window');
  for(const z of[-3.85,-2.35,-.85])box(.055,1.55,.065,5.23,1.51,z,trim);
  for(const y of[.76,1.52,2.29])box(.055,.055,3.04,5.23,y,-2.35,trim);
  blocker(5.2,-2.35,.14,3.0,0,'wall','master-window');wallZ(-4.5,5.2,10.4);
  opening('x',9.1,-4.5,-2.5,-3.4,'ensuite-bathroom',.90);
  opening('x',9.1,-2.5,0,-1.25,'master-bedroom',1.1);
  wallX(10.4,-4.5,-2.5);wallZ(-2.5,9.1,11.2);
  opening('x',11.2,-4.3,0,-1.25,'rear-small-bedroom',1.1);
  wallZ(-4.3,11.2,16);wallX(16,-4.3,7.1);
  wallZ(0,4.1,9.1,'tv-back-wall');wallZ(0,11.2,16,'kitchen-back-wall');
  // One continuous balcony with two separately framed exterior window assemblies.
  wallZ(0,1.8,4.1);wallZ(11.8,1.8,4.1);opening('x',4.1,0,7.1,3.7,'balcony',1.12);wallX(4.1,7.1,11.8,'small-room-balcony-wall');
  box(.12,.42,11.8,1.8,.21,5.9,white);blocker(1.8,5.9,.12,11.8,0,'wall','balcony-outer');
  const balconyGlass=material(0xb2c7cd,.14,{transparent:true,opacity:.18,depthWrite:false,side:T.DoubleSide});
  anchors.windows=[];
  for(const [id,lo,hi]of[['balcony-window-1',.30,6.65],['balcony-window-2',7.30,11.45]]){
    box(.025,2.03,hi-lo,1.8,1.45,(lo+hi)/2,balconyGlass,group,id);
    for(let i=0;i<4;i++)box(.06,2.12,.045,1.82,1.47,lo+(hi-lo)*i/3,white);
    for(const y of[.44,1.0,2.48])box(.06,.045,hi-lo+.05,1.82,y,(lo+hi)/2,white);
    anchors.windows.push({id,x:1.8,z:(lo+hi)/2,length:hi-lo});
  }
  box(.12,H,.65,1.8,H/2,6.975,plaster);box(.12,H,.30,1.8,H/2,.15,plaster);box(.12,H,.35,1.8,H/2,11.625,plaster);ceilingLight(2.9,9.4,true);
  // The user's thin rectangle is a wall directly behind the sofa.
  wallZ(7.1,4.1,8.3,'sofa-back-wall');wallZ(7.1,12.4,16,'foyer-partition');
  wallZ(11.8,4.1,8.3);
  // No corridor across the front of this room: it opens from its right side into the living space.
  opening('x',8.3,7.1,8.5,7.8,'front-small-bedroom',1.05);
  wallX(8.3,8.5,11.8);wallX(11.1,8.5,11.8);wallZ(11.8,8.3,11.1);
  opening('z',8.5,8.3,11.1,9.7,'bathroom',1.12);
  wallZ(8.5,11.1,12.4);wallX(12.4,8.5,11.8);wallZ(11.8,12.4,16);
  // Entry door in the lower right wall, cabinet below it, storage along the upper wall.
  const entryZ=10.80,hingeZ=entryZ-.53;
  wallX(16,7.1,hingeZ);wallX(16,entryZ+.53,11.8);box(.14,H-2.30,1.06,16,(H+2.30)/2,entryZ,plaster);box(.11,.022,1.35,12.43,.022,7.80,trim);
  const entranceHinge=new T.Group();entranceHinge.position.set(15.93,0,hingeZ);group.add(entranceHinge);const entrance=round(.075,2.29,1.06,0,1.16,.53,black,.012,entranceHinge);box(.02,.31,.11,-.055,1.14,.84,black,entranceHinge);rod([-.095,1.02,.84],[-.095,1.02,.69],.016,steel,entranceHinge);ball(.014,.014,.014,-.052,1.61,.53,steel,entranceHinge);box(.14,.06,.22,-.03,2.21,.19,steel,entranceHinge);
  const closed=blocker(15.93,entryZ,.09,1.06,0,'wall','entrance'),opened=blocker(15.4,hingeZ,1.06,.13,0,'furniture','open-entrance');opened.enabled=false;
  const homeDoor={hinge:entranceHinge,point:{x:15.93,z:entryZ},approach:{x:15.02,z:entryZ},width:1.06,height:2.30,openness:0,target:0,setOpen(v){this.target=v?1:0;},reset(){this.openness=this.target=0;this.update(0);},update(dt){this.openness+=(this.target-this.openness)*Math.min(1,dt*11);if(Math.abs(this.target-this.openness)<.002)this.openness=this.target;const a=-1.48*this.openness;entranceHinge.rotation.y=a;closed.enabled=this.openness<.86;opened.enabled=this.openness>=.86;const ex=spreadX(15.93+Math.sin(a)*1.06),ez=spreadZ(hingeZ+Math.cos(a)*1.06);opened.minX=Math.min(spreadX(15.93),ex)-.05;opened.maxX=Math.max(spreadX(15.93),ex)+.05;opened.minZ=Math.min(spreadZ(hingeZ),ez)-.05;opened.maxZ=Math.max(spreadZ(hingeZ),ez)+.05;}};
  for(const z of[hingeZ-.04,entryZ+.57])box(.18,2.37,.055,15.93,1.185,z,trim);box(.18,.06,1.20,15.93,2.36,entryZ,trim);
  const exitTex=texture(256,80,g=>{g.fillStyle='#31674d';g.fillRect(0,0,256,80);g.fillStyle='#e2efe3';g.font='bold 31px sans-serif';g.textAlign='center';g.fillText('비상구  →',128,53);});plane(.52,.16,15.81,2.43,entryZ,new T.MeshBasicMaterial({map:exitTex}),-Math.PI/2);
  round(2.20,1.95,.45,14.75,1.05,7.40,white,.015);footprint('entry-upper-storage',14.75,7.40,2.20,.45);for(const x of[14.20,15.30]){box(1.08,1.88,.025,x,1.05,7.64,white);rod([x-.10,1.1,7.665],[x+.10,1.1,7.665],.008,black);}
  round(.025,1.80,.54,12.50,.98,9.80,steel,.015).name='entry-full-length-mirror';
  const reflection=texture(256,512,(g,w,h)=>{const a=g.createLinearGradient(0,0,w,h);a.addColorStop(0,'#b9c3c3');a.addColorStop(.46,'#e1e3da');a.addColorStop(.49,'#aab4b3');a.addColorStop(1,'#78858a');g.fillStyle=a;g.fillRect(0,0,w,h);g.fillStyle='#e7e5d838';g.fillRect(28,0,17,h);});const ms=new T.Shape();ms.moveTo(-.23,-.82);ms.bezierCurveTo(-.30,-.3,-.12,.20,-.22,.80);ms.bezierCurveTo(-.03,.90,.25,.49,.23,.20);ms.bezierCurveTo(.18,-.18,.31,-.50,.23,-.82);ms.closePath();const mirror=mesh(new T.ShapeGeometry(ms,32),material(0xffffff,.16,{map:reflection}),12.52,.99,9.80);mirror.rotation.y=Math.PI/2;
  cyl(.10,.10,.42,12.65,.23,10.20,material(0xa52f2d));rod([12.65,.44,10.2],[12.65,.55,10.2],.013,black);round(.72,.06,.32,13.25,.80,7.36,wood);footprint('entry-key-shelf',13.25,7.36,.72,.32);ceilingLight(14.1,9.3,true);ceilingLight(11.5,8.0,true);ceilingLight(9.7,10.1,true);
  anchors.entryDoor=homeDoor.point;anchors.storage={x:14.2,z:11.45};anchors.upperStorage={x:14.75,z:7.4};anchors.mirror={x:12.52,z:9.8};
  function buildEntryStorage(makeBat){
    const g=new T.Group();g.name='photo-entry-full-height-cabinet';group.add(g);
    box(3.20,.065,.55,14.20,.055,11.45,white,g);box(3.20,.06,.55,14.20,2.43,11.45,white,g);box(3.20,2.36,.04,14.20,1.24,11.705,white,g);
    for(const x of[12.62,15.78])box(.04,2.36,.55,x,1.24,11.45,white,g);for(const y of[.37,1.5,1.83,2.16])box(3.10,.025,.50,14.20,y,11.45,white,g);
    round(1.79,2.35,.035,13.52,1.24,11.15,white,.012,g);round(.32,2.35,.035,15.63,1.24,11.15,white,.012,g);rod([13.90,1.0,11.12],[13.90,1.28,11.12],.009,black,g);
    const storageBlock=footprint('foyer-storage',14.20,11.45,3.20,.55);storageBlock.minX=spreadX(storageBlock.minX);storageBlock.maxX=spreadX(storageBlock.maxX);storageBlock.minZ=spreadZ(storageBlock.minZ);storageBlock.maxZ=spreadZ(storageBlock.maxZ);const pivot=new T.Group();pivot.position.set(15.45,0,11.15);g.add(pivot);round(1.02,2.35,.035,-.51,1.24,0,white,.012,pivot);box(.018,.30,.025,-.89,1.15,-.028,black,pivot);
    const leafBlock=blocker(15.4,10.65,.12,1.02,0,'furniture','open-storage-door');leafBlock.enabled=false;const bat=makeBat();bat.position.set(14.95,.39,11.45);bat.visible=false;g.add(bat);
    return {point:{x:spreadX(14.75),z:spreadZ(11.02)},batPoint:{x:spreadX(14.95),z:spreadZ(11.45)},opened:0,target:0,setOpen(v){this.target=v?1:0;},reset(){this.opened=this.target=0;this.update(0,false);},update(dt,hasBat){if(hasBat)this.target=0;this.opened+=(this.target-this.opened)*Math.min(1,dt*7);const a=-this.opened*1.48;pivot.rotation.y=a;bat.visible=this.opened>.60&&!hasBat;leafBlock.enabled=this.opened>.6;const ex=spreadX(15.45-Math.cos(a)*1.02),ez=spreadZ(11.15+Math.sin(a)*1.02);leafBlock.minX=Math.min(spreadX(15.45),ex)-.03;leafBlock.maxX=Math.max(spreadX(15.45),ex)+.03;leafBlock.minZ=Math.min(spreadZ(11.15),ez)-.03;leafBlock.maxZ=Math.max(spreadZ(11.15),ez)+.03;}};
  }

  const curtainGeo=new T.PlaneGeometry(2.86,2.35,128,18),cp=curtainGeo.attributes.position;
  for(let i=0;i<cp.count;i++)cp.setZ(i,.046*Math.cos(cp.getX(i)*Math.PI*13)+.009*Math.sin(cp.getY(i)*4+cp.getX(i)*19));
  curtainGeo.computeVertexNormals();interior.materials.curtainMat.color.setHex(0xfffcf1);
  const curtain=mesh(curtainGeo,interior.materials.curtainMat,4.22,1.24,1.53,group,'living-full-height-curtain');curtain.rotation.y=Math.PI/2;
  rod([4.22,2.45,.08],[4.22,2.45,6.92],.012,white);
  const curtain2=mesh(curtainGeo,interior.materials.curtainMat,4.22,1.24,5.65);curtain2.rotation.y=Math.PI/2;
  furnishing('living-sofa',6.20,6.23,()=>{
  const sofa=interior.sofa();for(const o of sofa.children){o.position.x-=7;o.position.z-=1.65;}sofa.position.set(6.20,0,6.23);sofa.rotation.y=Math.PI/2;
  const sofaFabric=material(0xe1cfb7,.95,{map:interior.materials.curtainMat.map,bumpMap:interior.materials.curtainMat.map,bumpScale:.002});sofa.traverse(o=>{if(o.material===interior.materials.linen)o.material=sofaFabric;});
  footprint('sofa',6.20,6.23,2.62,1.16);
  });anchors.sofa={x:6.20,z:6.23};anchors.curtain={x:4.22,z:1.53};anchors.balcony={x:2.9,z:3.7};
  plane(3.45,4.70,6.65,.012,3.90,material(0xb7b2a4,1,{map:mat.rug.map}),0,-Math.PI/2);
  const tvCanvas=document.createElement('canvas');tvCanvas.width=512;tvCanvas.height=288;const tg=tvCanvas.getContext('2d'),tvMap=new T.CanvasTexture(tvCanvas);tvMap.colorSpace=T.SRGBColorSpace;
  round(1.48,.85,.045,6.5,1.36,.14,black,.013);plane(1.43,.80,6.5,1.36,.167,new T.MeshBasicMaterial({map:tvMap,toneMapped:false}));box(.80,.32,.07,6.5,1.33,.08,black);anchors.tv={x:6.5,z:.167};
  const tvGlow=pointLight(6.5,1.37,.45,.35,0x9eb7ca,3.2);let lastNews=-1;function updateTV(t){if(t-lastNews<.08)return;lastNews=t;const g=tg;g.fillStyle='#536876';g.fillRect(0,0,512,288);for(let i=0;i<17;i++){const h=43+(i*31)%107;g.fillStyle='#263942';g.fillRect(i*32,216-h,27,h);g.fillStyle='#8a999a';for(let row=0;row<7;row++)for(let col=0;col<2;col++)g.fillRect(i*32+6+col*10,222-h+row*15,4,6);}g.fillStyle='#991e2d';g.fillRect(0,0,512,46);g.fillRect(0,214,512,74);g.fillStyle='#fff5e8';g.font='bold 27px Malgun Gothic,sans-serif';g.fillText('긴급 뉴스 속보',16,33);g.font='17px sans-serif';g.fillText('LIVE',454,30);if(Math.floor(t*2)%2===0)g.fillRect(438,18,7,7);g.font='18px Malgun Gothic,sans-serif';const x=(t*55)%640;g.fillText('외출을 삼가고 안전한 실내에서 대기하십시오',16-x,254);g.fillText('외출을 삼가고 안전한 실내에서 대기하십시오',656-x,254);tvMap.needsUpdate=true;tvGlow.intensity=.28+Math.sin(t*6)*.06;}
  const clockTex=texture(256,256,(g,w,h)=>{g.fillStyle='#adc5a9';g.fillRect(0,0,w,h);g.translate(128,128);g.strokeStyle='#597963';g.lineWidth=3;for(let i=0;i<12;i++){const a=i*Math.PI/6;g.beginPath();g.moveTo(Math.sin(a)*93,-Math.cos(a)*93);g.lineTo(Math.sin(a)*106,-Math.cos(a)*106);g.stroke();}g.lineWidth=5;g.beginPath();g.moveTo(0,0);g.lineTo(18,41);g.moveTo(0,0);g.lineTo(-75,-24);g.stroke();});
  const clock=cyl(.16,.16,.025,8.25,2.04,.13,material(0xd4ddd0));clock.rotation.x=Math.PI/2;
  mesh(new T.CircleGeometry(.147,48),material(0xffffff,1,{map:clockTex}),8.25,2.04,.15);
  cyl(.12,.055,.09,8.25,2.30,.23,white);pointLight(8.25,2.25,.26,.38,0xffd6a1,2.5);
  round(.38,.63,.37,8.25,.33,.32,white,.04);footprint('air-purifier',8.25,.32,.38,.37);
  function plant(x,y,z,s=1){cyl(.14*s,.11*s,.25*s,x,y+.125*s,z,white);for(let i=0;i<9;i++){const a=i*2.4,r=.13*s,h=(.36+(i%4)*.07)*s;rod([x,y+.20*s,z],[x+Math.cos(a)*r,y+h,z+Math.sin(a)*r],.006*s,leafMat);const l=ball(.04*s,.105*s,.014*s,x+Math.cos(a)*r,y+h,z+Math.sin(a)*r,leafMat);l.rotation.z=Math.cos(a)*.5;}}plant(5.20,0,.46,.85);
  for(const x of[6.5,7.1,7.7])box(.52,.035,1.04,x,H-.03,3.1,material(0xecebe2,.6,{emissive:0xfbe4c9,emissiveIntensity:.3}));pointLight(7.0,H-.18,3.1,1,0xffe4c2,9,true);
  // Kitchen on the right, refrigerator in the far corner, table near the bathroom.
  round(.95,2.12,.75,13.25,1.08,.56,black,.02);for(const x of[13.02,13.48])for(const [y,h]of[[.57,.94],[1.62,1.06]])round(.444,h,.025,x,y,.953,white,.008);box(.015,2.06,.015,13.25,1.08,.97,black);footprint('fridge',13.25,.56,.95,.75);anchors.fridge={x:13.25,z:.56};
  box(1.90,.32,.78,13.70,2.36,.55,white);box(.90,2.15,.73,14.22,1.10,.56,white);box(.83,.67,.055,14.22,1.02,.96,black);box(.84,.035,.68,14.22,.67,.60,white);box(.84,.035,.68,14.22,1.38,.60,white);round(.34,.25,.28,14.05,.82,.72,white,.04);cyl(.14,.14,.03,14.05,.96,.72,black);footprint('appliance-tower',14.22,.56,.90,.73);
  const backsplash=texture(512,256,(g,w,h)=>{g.fillStyle='#a4a7a5';g.fillRect(0,0,w,h);for(let row=0;row<5;row++)for(let col=-1;col<5;col++){g.fillStyle=(row+col)%2?'#565c5e':'#62686a';g.fillRect(col*128+(row%2)*64+1,row*51+1,126,49);}}),tileWall=material(0xbac3c4,.59,{map:backsplash});plane(3.35,.76,15.918,1.28,2.85,tileWall,-Math.PI/2);
  for(const z of[1.55,2.30,3.05,3.80]){box(.64,.79,.74,15.58,.43,z,white);box(.018,.74,.72,15.249,.43,z,white);rod([15.228,.69,z-.13],[15.228,.69,z+.13],.008,steel);box(.36,.70,.74,15.74,2.11,z,white);rod([15.543,1.83,z-.12],[15.543,1.83,z+.12],.007,steel);}
  round(.72,.06,3.06,15.57,.87,2.675,mat.stone,.01);footprint('kitchen-run',15.57,2.675,.72,3.06);
  round(.47,.012,.65,15.55,.91,2.15,steel,.045);round(.34,.014,.53,15.55,.919,2.15,black,.045);rod([15.82,.92,2.15],[15.82,1.19,2.15],.016,steel);rod([15.82,1.19,2.15],[15.55,1.19,2.15],.016,steel);
  box(.49,.012,.58,15.55,.91,3.45,black);for(const z of[3.30,3.61]){const r=mesh(new T.TorusGeometry(.085,.009,8,24),steel,15.55,.923,z);r.rotation.x=Math.PI/2;}
  const strip=material(0xfff0cd,.6,{emissive:0xffd6a3,emissiveIntensity:.6});box(.03,.015,3.02,15.54,1.74,2.675,strip);pointLight(15.35,1.65,2.675,.45,0xffdfb0,4.1);
  furnishing('dining-set',12.65,5.15,()=>{
  const tablePartStart=group.children.length;
  round(.90,.065,1.60,12.65,.76,5.15,wood,.02);for(const x of[12.30,13.00])for(const z of[4.47,5.83])box(.055,.72,.055,x,.36,z,mat.darkWood);footprint('dining-table',12.65,5.15,.90,1.60);
  for(const o of group.children.slice(tablePartStart))o.name='dining-table-fallback';
  function chair(x,z,turn=0){const g=new T.Group();g.name='dining-chair-fallback';g.position.set(x,0,z);g.rotation.y=turn;group.add(g);round(.45,.07,.44,0,.45,0,white,.03,g);round(.44,.39,.06,0,.72,.19,white,.03,g);for(const dx of[-.17,.17])for(const dz of[-.17,.17])rod([dx,.04,dz],[dx,.43,dz],.021,mat.darkWood,g);footprint('dining-chair',x,z,.48,.48);}chair(11.87,4.73,-Math.PI/2);chair(11.87,5.57,-Math.PI/2);chair(13.43,5.15,Math.PI/2);
  });
  rod([12.65,H,5.15],[12.65,1.97,5.15],.004,white);for(const [r,y]of[[.13,2.14],[.21,2.06],[.29,1.98]])cyl(r,r*.35,.075,12.65,y,5.15,white);cyl(.09,.09,.018,12.65,1.935,5.15,strip);pointLight(12.65,1.91,5.15,.32,0xffdeb0,3.2);anchors.dining={x:12.65,z:5.15};plant(12.65,.795,5.15,.43);
  const bedFrame=wood.clone(),bedFabric=mat.blanket.clone(),chairLeather=material(0x394047,.78);
  bedFrame.name='bed-frame-api-wood';chairLeather.name='game-chair-api-leather';
  function bed(id,x,z,w=1.25){round(w+.10,.25,2.19,x,.25,z,bedFrame,.025);round(w,.20,2.09,x,.47,z,white,.055);round(w+.10,.68,.12,x,.65,z-1.03,bedFrame,.045);interior.soft(w,.12,1.6,x,.62,z+.2,bedFabric,.045);interior.pillow(x,.64,z-.68,w*.82,.42);for(const dx of[-w/2,w/2])for(const dz of[-.91,.91])box(.10,.18,.10,x+dx,.13,z+dz,mat.darkWood);box(w-.10,.018,.025,x,.69,z-.88,trim);footprint(id,x,z,w+.12,2.22);}
  furnishing('master-bed',6.30,-3.18,()=>bed('bed',6.30,-3.18,1.50));
  // The user's revised sketch replaces the wardrobe with a vanity by the rear wall.
  furnishing('master-vanity-set',7.95,-4.10,()=>{
  round(1.25,.075,.46,7.95,.79,-4.10,wood,.018).name='master-vanity';for(const x of[7.39,8.51])for(const z of[-4.28,-3.94])box(.045,.74,.045,x,.38,z,mat.darkWood);footprint('master-vanity',7.95,-4.10,1.25,.46);
  round(.69,.88,.035,7.95,1.51,-4.365,trim,.018);plane(.63,.82,7.95,1.51,-4.342,material(0xb5c9cf,.17),0);
  round(.39,.07,.34,7.95,.45,-3.43,white,.02);for(const x of[7.79,8.11])for(const z of[-3.55,-3.31])box(.025,.42,.025,x,.22,z,mat.darkWood);footprint('master-vanity-stool',7.95,-3.43,.39,.34);
  });
  // Small room 1: a dedicated gaming room, with a clear path from its doorway.
  const gameDark=material(0x263039,.44),screenGlow=new T.MeshBasicMaterial({color:0x6c9ec0}),accent=material(0x627a9c,.55,{emissive:0x40688a,emissiveIntensity:.55});
  furnishing('gaming-desk-set',13.10,-3.82,()=>{
  round(1.80,.075,.65,13.10,.76,-3.82,gameDark,.018);for(const x of[12.30,13.90])for(const z of[-4.08,-3.56])box(.055,.72,.055,x,.38,z,black);footprint('gaming-desk',13.10,-3.82,1.80,.65);
  for(const x of[12.72,13.40]){round(.60,.35,.045,x,1.10,-4.04,black,.012);plane(.56,.31,x,1.10,-4.009,screenGlow);box(.035,.18,.035,x,.87,-4.0,steel);round(.21,.018,.14,x,.807,-4.0,black,.008);}
  box(.46,.022,.16,12.97,.812,-3.64,black);for(let i=0;i<13;i++)box(.024,.005,.027,12.77+i*.033,.826,-3.64,accent);round(.055,.025,.095,13.34,.815,-3.64,black,.012);
  });
  furnishing('gaming-pc-model',14.30,-3.77,()=>{box(.24,.48,.45,14.30,.26,-3.77,gameDark);for(const y of[.15,.27,.39])box(.012,.025,.32,14.174,y,-3.77,accent);footprint('gaming-pc',14.30,-3.77,.24,.45);});
  furnishing('gaming-chair-model',13.05,-2.83,()=>{
  round(.56,.10,.57,13.05,.47,-2.83,chairLeather,.035);round(.53,.74,.11,13.05,.91,-2.55,chairLeather,.045);round(.45,.15,.10,13.05,1.31,-2.55,chairLeather,.025);for(const x of[12.80,13.30]){rod([x,.44,-2.83],[x,.69,-2.79],.018,steel);round(.09,.035,.42,x,.68,-2.79,chairLeather,.012);}rod([13.05,.12,-2.83],[13.05,.42,-2.83],.035,steel);for(let i=0;i<5;i++){const a=i*Math.PI*2/5;rod([13.05,.14,-2.83],[13.05+Math.cos(a)*.30,.10,-2.83+Math.sin(a)*.30],.018,black);ball(.045,.045,.045,13.05+Math.cos(a)*.30,.08,-2.83+Math.sin(a)*.30,black);}footprint('gaming-chair',13.05,-2.83,.59,.62);
  });
  furnishing('gaming-shelf-model',15.55,-1.40,()=>{round(.38,1.70,1.15,15.55,.90,-1.40,gameDark,.018);for(const y of[.40,.85,1.30])box(.35,.035,1.12,15.55,y,-1.40,accent);footprint('gaming-shelf',15.55,-1.40,.38,1.15);});
  // Small room 2: wardrobes, hanging clothes, drawers and a central dressing island.
  for(const z of[8.10,9.55,11.0])furnishing('wardrobe-module-'+z,4.49,z,()=>{round(.57,2.18,1.35,4.49,1.10,z,white,.015);box(.025,1.95,1.27,4.80,1.13,z,trim);rod([4.83,1.04,z-.12],[4.83,1.31,z-.12],.009,steel);footprint('wardrobe-'+z,4.49,z,.57,1.35);});
  furnishing('clothes-rail-set',6.45,11.48,()=>{
  round(1.35,2.08,.51,6.45,1.05,11.48,white,.018);for(const y of[.52,1.02,1.52])box(1.27,.035,.47,6.45,y,11.48,wood);rod([5.91,1.87,11.28],[6.99,1.87,11.28],.013,steel);footprint('clothes-rail',6.45,11.48,1.35,.51);
  for(let i=0;i<5;i++){const x=6.00+i*.22;rod([x,1.86,11.28],[x,1.66,11.28],.006,steel);round(.16,.46,.035,x,1.45,11.28,i%2?mat.cloth:mat.blanket,.012);}
  });
  furnishing('dressing-island-model',6.18,9.26,()=>{round(1.15,.78,.64,6.18,.40,9.26,wood,.025);for(const y of[.26,.48,.69]){box(1.06,.19,.035,6.18,y,8.923,white);rod([6.10,y,8.90],[6.27,y,8.90],.008,steel);}footprint('dressing-island',6.18,9.26,1.15,.64);});
  round(.035,1.38,.55,7.72,1.23,10.40,steel,.014);plane(.51,1.33,7.697,1.23,10.40,material(0xaebec3,.18),-Math.PI/2);
  ceilingLight(7.4,-1.4);ceilingLight(13.3,-2.1);ceilingLight(4.0,9.7);ceilingLight(10.1,-1.2,true);ceilingLight(2.9,3.7,true);ceilingLight(6.5,7.8,true);
  // Upper bathroom is entered from the master; lower bathroom is the photo viewpoint.
  ball(.24,.19,.30,9.75,.37,-4.05,ceramic);cyl(.15,.18,.28,9.75,.17,-4.11,ceramic);round(.40,.60,.17,9.75,.62,-4.30,ceramic,.03);footprint('ensuite-toilet',9.75,-4.05,.60,.74);
  round(.60,.68,.42,9.75,.37,-2.83,white);ball(.22,.05,.16,9.75,.75,-2.83,ceramic);footprint('ensuite-vanity',9.75,-2.83,.60,.42);ceilingLight(9.75,-3.4,true);
  round(.58,.70,.78,10.60,.38,9.33,white);round(.66,.055,.82,10.58,.77,9.33,mat.stone);ball(.22,.06,.30,10.49,.82,9.33,ceramic);footprint('bathroom-vanity',10.60,9.33,.66,.82);
  ball(.29,.19,.38,8.94,.37,11.15,ceramic);cyl(.17,.21,.28,8.94,.17,11.21,ceramic);round(.43,.64,.20,8.94,.64,11.54,ceramic,.035);footprint('bathroom-toilet',8.94,11.15,.65,1.0);
  box(.93,.04,1.18,10.41,.04,11.10,ceramic);const glass=material(0xb7c9cb,.18,{transparent:true,opacity:.21,depthWrite:false});box(.025,1.95,1.20,9.94,1.02,11.10,glass);blocker(9.94,11.10,.025,1.20,0,'furniture','shower-glass');rod([10.76,1.05,11.55],[10.76,2.17,11.55],.014,steel);rod([10.76,2.17,11.55],[10.4,2.17,11.55],.014,steel);cyl(.12,.12,.02,10.4,2.15,11.55,steel);
  function item(id,name,x,y,z,build){const g=new T.Group();g.position.set(x,y,z);group.add(g);build(g);collectibles.push({id,name,group:g,x,y,z,got:false});}
  item('phone','휴대폰',7.95,.86,-4.10,g=>{round(.145,.014,.27,0,0,0,black,.009,g);box(.12,.003,.23,0,.009,0,new T.MeshBasicMaterial({color:0x536d7b}),g);});
  item('weapon','손전등',6.4,.69,6.0,g=>{const o=cyl(.045,.055,.26,0,0,0,black,g);o.rotation.z=Math.PI/2;const lens=cyl(.065,.05,.055,-.15,0,0,steel,g);lens.rotation.z=Math.PI/2;});
  item('food','식량',15.57,1.005,1.55,g=>{cyl(.075,.075,.18,0,0,0,material(0xb8a065),g);cyl(.077,.077,.012,0,.096,0,steel,g);});
  item('rope','밧줄',12.92,.055,7.40,g=>{for(const r of[.14,.10,.06]){const o=mesh(new T.TorusGeometry(r,.022,8,28),material(0xa18c61),0,.01,0,g);o.rotation.x=Math.PI/2;}});
  item('jacket','방어용 외투',12.60,1.45,8.90,g=>{g.rotation.y=Math.PI/2;interior.coat(g);});item('carKey','차키',13.25,.85,7.36,g=>{round(.075,.025,.13,0,0,0,black,.01,g);const r=mesh(new T.TorusGeometry(.04,.007,8,20),steel,0,0,.105,g);r.rotation.x=Math.PI/2;});
  const room=(id,name,kind,minX,maxX,minZ,maxZ,entry)=>({id,name,kind,minX,maxX,minZ,maxZ,labelX:(minX+maxX)/2,labelZ:(minZ+maxZ)/2,...(entry?{entry}:{})});
  const rooms=[
    room('master-bedroom','안방','bedroom',5.2,9.1,-4.5,0,{x:8.65,z:-1.25}),
    room('ensuite-bathroom','안방 옆 화장실','bathroom',9.1,10.4,-4.5,-2.5,{x:9.6,z:-3.4}),
    room('rear-small-bedroom','작은방 1 · 게임방','bedroom',11.2,16,-4.3,0,{x:11.7,z:-1.25}),
    room('rear-hall','안쪽 연결 공간','corridor',9.1,11.2,-2.5,0),
    room('front-small-bedroom','작은방 2 · 옷방','bedroom',4.1,8.3,7.1,11.8,{x:7.85,z:7.8}),
    room('bathroom','화장실','bathroom',8.3,11.1,8.5,11.8,{x:9.7,z:8.95}),
    room('open-plan','거실 · 주방','living',4.1,16,0,7.1),
    room('balcony','베란다','balcony',1.8,4.1,0,11.8,{x:2.9,z:3.7}),
    room('living-entry','거실 · 주방','living',8.3,12.4,7.1,8.5),
    room('foyer','현관','foyer',12.4,16,7.1,11.8)
  ];
  const photoViews={bathroom:{x:9.7,z:8.95,yaw:-Math.PI/2,pitch:0,eye:1.5,fov:75},entry:{x:12.95,z:8.10,yaw:.12,pitch:-.04,eye:1.5,fov:72},hall:{x:11.95,z:7.8,yaw:Math.PI,pitch:0,eye:1.5,fov:72},living:{x:9.7,z:6.9,yaw:-Math.PI/2,pitch:0,eye:1.5,fov:75}};
  const referenceView={x:8.1,z:-.95,yaw:-1.73,pitch:0,eye:1.4,fov:68};
  const plan={source:'user-edited-floor-plan',bedrooms:3,bathrooms:2,sofaBackWall:true,frontSmallRoomCorridor:false,balconyWindows:2,ensuiteEntry:'master-bedroom',bounds:{minX:1.8,maxX:16,minZ:-4.5,maxZ:11.8}};
  // Enlarge the apartment around its fixed entrance. The rooms and the open
  // living area grow together, so the master and dressing room separate too.
  group.scale.set(size,1,size);group.position.set(anchorX*(1-size),0,anchorZ*(1-size));
  for(const c of kit.colliders.slice(colliderStart)){c.minX=spreadX(c.minX);c.maxX=spreadX(c.maxX);c.minZ=spreadZ(c.minZ);c.maxZ=spreadZ(c.maxZ);}
  for(const f of floorAreas.slice(floorStart)){f.minX=spreadX(f.minX);f.maxX=spreadX(f.maxX);f.minZ=spreadZ(f.minZ);f.maxZ=spreadZ(f.maxZ);}
  for(const r of rooms){r.minX=spreadX(r.minX);r.maxX=spreadX(r.maxX);r.minZ=spreadZ(r.minZ);r.maxZ=spreadZ(r.maxZ);r.labelX=spreadX(r.labelX);r.labelZ=spreadZ(r.labelZ);if(r.entry){r.entry.x=spreadX(r.entry.x);r.entry.z=spreadZ(r.entry.z);}}
  for(const d of doorways){d.x=spreadX(d.x);d.z=spreadZ(d.z);d.width*=size;}
  for(const d of interiorDoors){d.x=spreadX(d.x);d.z=spreadZ(d.z);d.width*=size;}
  for(const i of collectibles){i.x=spreadX(i.x);i.z=spreadZ(i.z);}
  for(const l of interior.lights.slice(lightStart)){l.position.x=spreadX(l.position.x);l.position.z=spreadZ(l.position.z);}
  for(const v of [referenceView,...Object.values(photoViews)]){v.x=spreadX(v.x);v.z=spreadZ(v.z);}
  homeDoor.point.x=spreadX(homeDoor.point.x);homeDoor.point.z=spreadZ(homeDoor.point.z);homeDoor.approach.x=spreadX(homeDoor.approach.x);homeDoor.approach.z=spreadZ(homeDoor.approach.z);homeDoor.width*=size;homeDoor.update(0);
  // Models and their PBR maps are bundled locally, including file:// launches.
  const furniture=window.PoyuFurniture&&typeof document.createElementNS==='function'?window.PoyuFurniture.install(T,group):null;
  updateTV(0);return {group,rooms,doorways,interiorDoors,anchors,homeDoor,entrance,referenceView,photoViews,buildEntryStorage,updateTV,plan,furniture};
};
