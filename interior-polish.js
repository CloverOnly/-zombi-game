/* Hand-built contemporary apartment fittings. The CC0 linen maps are bundled locally. */
window.createPoyuInteriorPolish=function(T,kit){
  const {scene,mat,texture,renderer}=kit,details=new T.Group(),lights=[],textured=[];
  details.name='apartment-lived-in-details';scene.add(details);
  const standard=(color,roughness=.8,extra={})=>new T.MeshStandardMaterial({color,roughness,...extra});
  const warmWhite=standard(0xe0d9c9,.84),ceramic=standard(0xd8ddd6,.24),terracotta=standard(0xa5785d),dark=standard(0x292e2f,.48),seam=standard(0x7d8989,.97);
  mat.wall.color.setHex(0xe4e0d6);mat.wall.normalScale.set(.06,.06);
  mat.floor.color.setHex(0xe7dfd1);mat.floor.roughness=.72;
  mat.wood.color.setHex(0xb6a28b);mat.paleWood.color.setHex(0xe0c6a5);mat.darkWood.color.setHex(0x756350);
  mat.cabinet.color.setHex(0xe4e2d9);mat.cabinet.roughness=.59;mat.white.color.setHex(0xe5e3dc);
  mat.steel.roughness=.37;mat.steel.envMapIntensity=.5;mat.black.roughness=.45;
  const linen=mat.cloth;linen.color.setHex(0xa8a394);linen.roughness=.96;
  mat.blanket.color.setHex(0x7e8d93);mat.pillow.color.setHex(0xd5d1c3);
  const linenMaps={};const textileMaterials=[linen,mat.blanket];
  for(const m of textileMaterials)m.userData.photoSource='assets/rough_linen_diff_1k.jpg';
  function upgradeFabric(material){textileMaterials.push(material);material.userData.photoSource='assets/rough_linen_diff_1k.jpg';for(const [key,map]of Object.entries(linenMaps))material[key]=map;material.normalScale=new T.Vector2(.28,.28);material.needsUpdate=true;return material;}
  const curtainMat=standard(0xcbc8b9,.95,{side:T.DoubleSide}),throwMat=upgradeFabric(standard(0x7b8987,1));
  const pillowMat=standard(0xc4bb9e,1),jacketMat=upgradeFabric(standard(0x52615b,1));
  const weave=texture(256,256,(g,w,h)=>{g.fillStyle='#c5c5bf';g.fillRect(0,0,w,h);for(let i=0;i<256;i+=2){g.fillStyle=i%4?'#ffffff20':'#303b4225';g.fillRect(i,0,1,h);g.fillRect(0,i,w,1);}});
  for(const m of[curtainMat,pillowMat,mat.pillow]){m.map=weave;m.bumpMap=weave;m.bumpScale=.002;}
  if(typeof document.createElementNS==='function'){
    const loader=new T.TextureLoader();
    for(const [key,file,isColor]of[['map','rough_linen_diff_1k.jpg',true],['normalMap','rough_linen_nor_gl_1k.jpg',false],['roughnessMap','rough_linen_rough_1k.jpg',false]])loader.load(window.PoyuInteriorPhotos?.[file]||'assets/'+file,t=>{
      t.colorSpace=isColor?T.SRGBColorSpace:T.NoColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());linenMaps[key]=t;
      for(const m of textileMaterials){m[key]=t;m.normalScale=new T.Vector2(.28,.28);m.needsUpdate=true;}if(key==='map')for(const m of textileMaterials)m.userData.photoSource='assets/'+file;
    },undefined,()=>{});
  }
  function mesh(geometry,material,x,y,z,parent=details){const o=new T.Mesh(geometry,material);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;parent.add(o);return o;}
  function box(w,h,d,x,y,z,m=warmWhite,parent){return mesh(new T.BoxGeometry(w,h,d),m,x,y,z,parent);}
  function cyl(rt,rb,h,x,y,z,m=ceramic,parent){return mesh(new T.CylinderGeometry(rt,rb,h,24),m,x,y,z,parent);}
  function rod(a,b,r,m=mat.steel,parent){const av=new T.Vector3(...a),bv=new T.Vector3(...b),mid=av.clone().add(bv).multiplyScalar(.5),o=cyl(r,r,av.distanceTo(bv),mid.x,mid.y,mid.z,m,parent);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),bv.sub(av).normalize());return o;}
  function curve(points,r,material,parent=details,closed=false){const c=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)),closed);return mesh(new T.TubeGeometry(c,Math.max(16,points.length*5),r,6,closed),material,0,0,0,parent);}
  function soft(w,h,d,x,y,z,material,r=.06,parent=details){
    r=Math.min(r,w*.32,h*.42,d*.32);const g=new T.BoxGeometry(w,h,d,14,10,14),p=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv,core=new T.Vector3(w/2-r,h/2-r,d/2-r);
    for(let i=0;i<p.count;i++){const v=new T.Vector3().fromBufferAttribute(p,i),q=new T.Vector3(Math.max(-core.x,Math.min(core.x,v.x)),Math.max(-core.y,Math.min(core.y,v.y)),Math.max(-core.z,Math.min(core.z,v.z))),normal=v.clone().sub(q).normalize();v.copy(q).addScaledVector(normal,r);
      const ripple=.0025*(Math.sin(v.x*31+v.z*23)+Math.sin(v.y*27-v.z*36));v.addScaledVector(normal,ripple);p.setXYZ(i,v.x,v.y,v.z);
      if(Math.abs(n.getY(i))>.5)uv.setXY(i,v.x/.65,v.z/.65);else if(Math.abs(n.getX(i))>.5)uv.setXY(i,v.z/.65,v.y/.65);else uv.setXY(i,v.x/.65,v.y/.65);
    }g.computeVertexNormals();const o=mesh(g,material,x,y,z,parent);o.name='tailored-upholstery';return o;
  }
  function piping(x,y,z,w,d,parent=details){const r=.05;return curve([[x-w/2+r,y,z-d/2],[x+w/2-r,y,z-d/2],[x+w/2,y,z-d/2+r],[x+w/2,y,z+d/2-r],[x+w/2-r,y,z+d/2],[x-w/2+r,y,z+d/2],[x-w/2,y,z+d/2-r],[x-w/2,y,z-d/2+r]],.0035,seam,parent,true);}
  function sofa(){
    const g=new T.Group();g.name='tailored-linen-sofa';details.add(g);
    soft(1.02,.23,2.38,7,.29,1.65,linen,.055,g);soft(.18,.64,2.2,6.52,.70,1.65,linen,.065,g);
    for(const z of[1.10,2.20]){soft(.83,.20,1.035,7.08,.51,z,linen,.065,g);piping(7.08,.585,z,.82,1.02,g);const back=soft(.23,.55,1.03,6.68,.85,z,linen,.075,g);back.rotation.z=-.14;}
    for(const z of[.46,2.84]){soft(1.06,.48,.21,7,.50,z,linen,.07,g);piping(7,.72,z,1.02,.19,g);}
    for(const x of[6.62,7.40])for(const z of[.70,2.60])cyl(.029,.022,.19,x,.10,z,mat.darkWood,g);
    const cushion=soft(.16,.43,.45,6.95,.83,.93,pillowMat,.07,g);cushion.rotation.set(.19,0,-.2);
    const g2=new T.PlaneGeometry(.85,.55,36,20);g2.rotateX(-Math.PI/2);const p=g2.attributes.position;
    for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),drape=Math.max(0,x-.11)*1.45;p.setY(i,.78-drape+.018*Math.sin(z*51+x*12));}g2.computeVertexNormals();mesh(g2,throwMat,7.12,0,2.75,g).name='sofa-draped-throw';
    return g;
  }
  function pillow(x,y,z,w=.98,d=.48){const p=soft(w,.18,d,x,y,z,mat.pillow,.075);piping(x,y+.015,z,w*.97,d*.96);return p;}
  function coat(group){
    const g=new T.Group();g.name='volumetric-hanging-jacket';group.add(g);
    const body=soft(.49,.74,.15,0,-.02,.065,jacketMat,.045,g);body.rotation.z=.035;
    for(const s of[-1,1]){const sleeve=soft(.18,.64,.16,s*.29,.06,.05,jacketMat,.045,g);sleeve.rotation.z=s*.23;box(.10,.13,.012,s*.13,-.17,.15,jacketMat,g);}
    curve([[-.18,.34,.12],[-.08,.43,.12],[0,.30,.18],[.09,.43,.12],[.18,.34,.12]],.022,jacketMat,g);
    rod([0,.28,.15],[0,-.34,.15],.005,mat.steel,g);for(let i=0;i<13;i++)box(.015,.009,.008,0,.25-i*.043,.16,mat.steel,g);
    curve([[-.23,.34,0],[0,.49,0],[.23,.34,0]],.012,mat.darkWood,g);curve([[0,.49,0],[0,.58,0],[.045,.62,0],[.07,.58,0]],.008,mat.steel,g);
    cyl(.027,.027,.025,0,.59,-.1,mat.steel,g).rotation.x=Math.PI/2;
  }
  function curtain(x,z,width,height,bottom,rotation=0){
    const group=new T.Group();group.name='pleated-linen-curtain';group.position.set(x,bottom,z);group.rotation.y=rotation;details.add(group);
    const g=new T.PlaneGeometry(width,height,44,28),p=g.attributes.position;
    for(let i=0;i<p.count;i++){const xx=p.getX(i),yy=p.getY(i);p.setZ(i,.04*Math.cos((xx+width/2)/width*Math.PI*12)+.012*Math.sin(yy*4+xx*17));p.setY(i,yy+height/2+.006*Math.sin(xx*26));}g.computeVertexNormals();mesh(g,curtainMat,0,0,0,group);
    rod([-width/2-.07,height+.07,0],[width/2+.07,height+.07,0],.012,mat.steel,group);
    for(let i=0;i<6;i++){const ring=mesh(new T.TorusGeometry(.023,.004,6,12),mat.steel,-width/2+(i+.5)*width/6,height+.02,0,group);ring.rotation.y=Math.PI/2;}
    return group;
  }
  function mug(x,y,z,color=ceramic){cyl(.045,.04,.092,x,y+.046,z,color);cyl(.036,.036,.004,x,y+.094,z,standard(0x49413a));const handle=mesh(new T.TorusGeometry(.032,.008,8,20),color,x+.054,y+.052,z);handle.scale.y=1.14;}
  function book(x,y,z,w=.22,d=.16,color=0x75867b,turn=0){const g=new T.Group();g.position.set(x,y,z);g.rotation.y=turn;details.add(g);box(w,.027,d,0,.015,0,warmWhite,g);box(w+.008,.004,d+.008,0,.031,0,standard(color),g);box(w+.008,.004,d+.008,0,0,0,standard(color),g);box(.006,.033,d+.008,-w/2,0.016,0,standard(color),g);}
  function plant(x,y,z,scale=.6){const g=new T.Group();g.position.set(x,y,z);g.scale.setScalar(scale);details.add(g);cyl(.12,.09,.24,0,.12,0,ceramic,g);cyl(.105,.105,.01,0,.241,0,standard(0x423d30),g);const leafMat=standard(0x49624e);for(let i=0;i<9;i++){const a=i*2.4,h=.36+(i%4)*.08,r=.12+(i%3)*.035,xx=Math.cos(a)*r,zz=Math.sin(a)*r;rod([0,.22,0],[xx,h,zz],.004,leafMat,g);const leaf=mesh(new T.SphereGeometry(1,10,7),leafMat,xx,h,zz,g);leaf.scale.set(.035,.11,.012);leaf.rotation.set(Math.sin(a)*.6,0,Math.cos(a)*.7);}}
  function frame(x,y,z,w,h,rotation=0){
    const art=texture(256,256,(g,a,b)=>{g.fillStyle='#d7d0bb';g.fillRect(0,0,a,b);g.fillStyle='#818d7d';g.beginPath();g.moveTo(20,b);g.bezierCurveTo(0,60,130,20,182,b);g.fill();g.fillStyle='#a99c7c';g.beginPath();g.arc(155,88,46,0,Math.PI*2);g.fill();g.strokeStyle='#3d5146';g.lineWidth=3;g.beginPath();g.moveTo(150,230);g.bezierCurveTo(125,180,120,100,95,60);g.stroke();});
    const group=new T.Group();group.position.set(x,y,z);group.rotation.y=rotation;details.add(group);
    box(w,.035,.04,0,h/2,0,mat.wood,group);box(w,.035,.04,0,-h/2,0,mat.wood,group);box(.035,h,.04,-w/2,0,0,mat.wood,group);box(.035,h,.04,w/2,0,0,mat.wood,group);
    mesh(new T.PlaneGeometry(w-.035,h-.035),new T.MeshStandardMaterial({map:art,roughness:1}),0,0,.022,group);
  }
  function outlet(x,y,z,rotation=0){const g=new T.Group();g.position.set(x,y,z);g.rotation.y=rotation;details.add(g);box(.13,.09,.014,0,0,0,warmWhite,g);for(const dx of[-.03,.03]){cyl(.023,.023,.005,dx,0,.01,mat.white,g).rotation.x=Math.PI/2;for(const sx of[-.007,.007])box(.004,.009,.003,dx+sx,0,.015,dark,g);}}
  function build(){
    // Curtains gather on the jambs, keeping the view and walking paths clear.
    curtain(15.83,1.33,.42,2.2,.30,-Math.PI/2);curtain(15.83,4.34,.42,2.2,.30,-Math.PI/2);
    curtain(3.43,6.76,.39,.96,1.70,Math.PI);curtain(4.67,6.76,.39,.96,1.70,Math.PI);
    for(const x of[6.10,8.10,10.1,12.1])curtain(x,-4.07,.32,1.75,.75,0);
    // Trim panels, a rug border and small signs of day-to-day use.
    for(const z of[.48,3.52])box(5.02,.003,.024,8.85,.026,z,warmWhite);for(const x of[6.34,11.36])box(.024,.003,3.04,x,.026,2,warmWhite);
    frame(2.45,1.78,.083,1.18,.76);frame(5.10,1.66,5.65,.72,1.05,Math.PI/2);frame(8.65,1.67,6.99,1.25,.85,Math.PI);
    outlet(4.8,.28,6.79,Math.PI);outlet(15.88,.28,3.95,-Math.PI/2);outlet(5.09,.28,1.55,Math.PI/2);outlet(12.72,1.10,6.99,Math.PI);
    // Coffee table items leave the flashlight, the actual collectible, exposed.
    book(8.90,.584,1.75,.27,.20,0x7c8b82,.12);book(8.9,.618,1.75,.24,.18,0xa99e82,-.03);
    cyl(.072,.072,.006,9.42,.586,2.47,mat.wood);mug(9.42,.59,2.47);
    const remote=box(.055,.021,.17,9.42,.594,1.67,dark);remote.rotation.y=.08;
    for(let i=0;i<9;i++)box(.009,.004,.009,9.40+(i%3)*.015,.607,1.63+Math.floor(i/3)*.02,warmWhite);
    // Thin metal bezel, separate rear housing, sensor and realistic television feet.
    box(.018,.94,1.52,11.325,1.13,2.39,dark);box(.035,.50,.89,11.354,1.04,2.39,dark);
    for(const z of[1.83,2.95]){rod([11.32,.70,z],[11.16,.63,z-.10],.012,dark);rod([11.32,.70,z],[11.50,.63,z+.1],.012,dark);}
    for(let i=0;i<18;i++)box(.002,.003,.027,11.376,1.19,2.08+i*.035,mat.black);
    const led=new T.MeshBasicMaterial({color:0xa3b9ba});box(.003,.008,.008,11.259,.699,2.39,led);
    curve([[11.5,.84,2.58],[11.65,.52,2.69],[11.77,.18,2.81],[11.80,.07,2.9]],.008,dark);
    plant(11.65,.635,3.17,.58);book(11.65,.635,1.65,.28,.23,0x9c8d71);
    // A dining place setting, not a table full of uncollectible supplies.
    for(const x of[9.42,10.38]){box(.43,.004,.31,x,.824,5.45,mat.pillow);cyl(.105,.105,.014,x,.836,5.45,ceramic);cyl(.083,.083,.004,x,.845,5.45,warmWhite);rod([x+.15,.838,5.35],[x+.15,.838,5.58],.006,mat.steel);mug(x-.05,.83,5.16,terracotta);}
    // Chopping board, kettle, utensils and a dish rack on existing counter surfaces.
    box(.34,.018,.22,14.56,.931,6.34,mat.wood);box(.15,.012,.025,14.55,.946,6.34,mat.steel);box(.08,.017,.027,14.43,.947,6.34,dark);
    cyl(.10,.125,.17,15.30,1.02,6.69,mat.steel);cyl(.08,.10,.023,15.30,1.12,6.69,mat.black);cyl(.025,.025,.035,15.30,1.15,6.69,dark);curve([[15.20,1.0,6.69],[15.10,1.17,6.69],[15.30,1.29,6.69],[15.40,1.12,6.69]],.018,dark);
    cyl(.055,.05,.13,15.70,.99,5.90,ceramic);for(let i=0;i<4;i++){rod([15.70,1.03,5.90],[15.68+i*.025,1.29+(i%2)*.04,5.88+(i%2)*.04],.008,mat.wood);}
    for(const z of[4.72,4.80,4.88]){const plate=cyl(.09,.09,.01,15.45,1.02,z,ceramic);plate.rotation.x=1.23;}
    rod([15.25,.94,4.65],[15.65,.94,4.65],.007,mat.steel);rod([15.25,.94,4.98],[15.65,.94,4.98],.007,mat.steel);
    box(.10,.14,.055,15.64,1.005,5.50,standard(0x719a91));rod([15.64,1.09,5.5],[15.54,1.09,5.5],.009,dark);
    // Fridge gasket, handle, and a small hand-written note.
    box(.014,1.83,.66,12.404,.98,5.75,dark);box(.018,1.14,.62,12.392,.77,5.75,mat.steel);box(.018,.62,.62,12.392,1.68,5.75,mat.steel);
    const note=texture(128,128,g=>{g.fillStyle='#e9d6a0';g.fillRect(0,0,128,128);g.fillStyle='#69684d';g.font='17px sans-serif';g.fillText('우유 / 물',12,42);g.fillText('건전지',12,70);g.fillRect(10,92,65,1);});const noteMesh=mesh(new T.PlaneGeometry(.14,.15),standard(0xffffff,1,{map:note}),12.378,1.71,5.69);noteMesh.rotation.y=-Math.PI/2;
    // Bedroom and study details use surfaces already covered by furniture colliders.
    book(8.48,.815,-3.61,.22,.15,0x8b7766,.1);mug(7.57,.805,-3.58);
    plant(11.45,.805,-3.69,.5);book(12.38,.815,-3.58,.22,.17,0x9b8c78);
    frame(5.09,1.60,-1.0,.52,.67,Math.PI/2);frame(9.09,1.67,-1.18,.7,.5,Math.PI/2);
    // Towels and toiletries sit next to the basin rather than in the walking aisle.
    for(let i=0;i<3;i++)soft(.30,.055,.40,15.56,.86+i*.058,-.83,mat.pillow,.025);
    cyl(.033,.037,.16,15.72,.92,-1.78,standard(0x75958f));cyl(.02,.02,.025,15.72,1.015,-1.78,dark);rod([15.72,1.03,-1.78],[15.63,1.03,-1.78],.006,dark);
    cyl(.038,.033,.09,15.72,.87,-1.62,ceramic);rod([15.71,.90,-1.62],[15.70,1.08,-1.61],.006,standard(0xb5bca9));
    // An independent indoor light casts furniture shadows only on the upper-floor layer.
    const l=new T.PointLight(0xffe4bc,1.0,10,2);l.name='living-soft-shadow-light';l.position.set(9.1,2.55,3);l.layers.set(1);l.castShadow=true;l.shadow.mapSize.set(1024,1024);l.shadow.camera.near=.10;l.shadow.camera.far=12;l.shadow.camera.layers.set(1);l.shadow.bias=-.00008;l.shadow.normalBias=.012;l.shadow.radius=3;scene.add(l);lights.push(l);
    const fill=new T.HemisphereLight(0xc9d6db,0x807462,.22);fill.layers.set(1);scene.add(fill);lights.push(fill);
    return details;
  }
  function update(upper){for(const l of lights)l.visible=upper;}
  return {sofa,pillow,soft,coat,build,update,details,lights,upgradeFabric,materials:{linen,curtainMat,pillowMat,jacketMat}};
};
