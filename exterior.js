/* A small 3D neighbourhood outside the apartment windows, generated locally. */
window.createPoyuExterior=function createPoyuExterior(THREE,scene,{texture,random}){
  const group=new THREE.Group();group.name='exterior-neighbourhood';scene.add(group);
  const groundY=-7.6,cars=[],clouds=[],trees=[],birds=[],windowLights=[];
  const material=(color,options={})=>new THREE.MeshStandardMaterial({color,roughness:.86,...options});
  const concrete=material(0x8393a1),roof=material(0x626f7c),asphalt=material(0x343f4b),paving=material(0x87949b),roadMark=material(0xc4c8c3);
  function mesh(geometry,mat,x,y,z,parent=group){const m=new THREE.Mesh(geometry,mat);m.position.set(x,y,z);m.receiveShadow=true;parent.add(m);return m;}
  function box(w,h,d,x,y,z,mat,parent=group){return mesh(new THREE.BoxGeometry(w,h,d),mat,x,y,z,parent);}
  function flat(w,d,x,y,z,mat,parent=group){const m=mesh(new THREE.PlaneGeometry(w,d),mat,x,y,z,parent);m.rotation.x=-Math.PI/2;return m;}
  function cyl(r,h,x,y,z,mat,parent=group){return mesh(new THREE.CylinderGeometry(r,r,h,10),mat,x,y,z,parent);}
  const skyTexture=texture(64,512,(g,w,h)=>{
    const a=g.createLinearGradient(0,0,0,h);a.addColorStop(0,'#243c5d');a.addColorStop(.48,'#6489ab');a.addColorStop(.66,'#9eb1bf');a.addColorStop(1,'#a6b2ba');g.fillStyle=a;g.fillRect(0,0,w,h);
  });
  const sky=mesh(new THREE.SphereGeometry(140,32,18),new THREE.MeshBasicMaterial({map:skyTexture,side:THREE.BackSide,depthWrite:false,fog:false}),16,0,5);sky.name='dawn-sky';
  scene.fog=new THREE.FogExp2(0x899fb2,.0085);
  flat(220,180,25,groundY,12,material(0x536657));
  flat(7,140,26,groundY+.02,8,asphalt);flat(86,6,-8,groundY+.025,15,asphalt);
  for(const x of [21.4,30.6])flat(2.1,140,x,groundY+.06,8,paving);
  for(const z of [10.8,19.2])flat(80,1.9,-8,groundY+.07,z,paving);
  for(let z=-55;z<77;z+=5)flat(.10,2.4,26,groundY+.035,z,roadMark);
  for(let x=-46;x<26;x+=5)flat(2.4,.10,x,groundY+.04,15,roadMark);
  for(let i=0;i<7;i++)flat(.7,4.7,22.7+i*1.0,groundY+.045,15,roadMark);
  box(1.12,.16,3.6,16.56,-.12,2.85,concrete);
  box(.045,.045,3.6,17.08,1.06,2.85,roof);
  for(let z=1.1;z<4.65;z+=.44)box(.035,1.04,.035,17.08,.52,z,roof);
  box(1.8,.05,.25,4.05,1.82,7.0,concrete);

  const facade=texture(512,1024,(g,w,h)=>{
    g.fillStyle='#99a5ad';g.fillRect(0,0,w,h);
    for(let row=0;row<11;row++){
      const y=row*93;g.fillStyle='#66788766';g.fillRect(0,y,w,3);g.fillStyle='#c1c7c9';g.fillRect(0,y+4,w,2);
      for(let col=0;col<5;col++){
        const x=col*102+17,ww=65,hh=54;
        g.fillStyle='#465d70';g.fillRect(x-3,y+19,ww+6,hh+6);
        const b=g.createLinearGradient(x,y+20,x+ww,y+73);b.addColorStop(0,'#334a61');b.addColorStop(.5,'#708a9e');b.addColorStop(1,'#465e73');g.fillStyle=b;g.fillRect(x,y+22,ww,hh);
        g.fillStyle='#b6c1c6';g.fillRect(x+31,y+22,3,hh);g.fillStyle='#162d415c';g.fillRect(x,y+22,ww,8);
        if((row*7+col*3)%9===0){g.fillStyle='#c8b79777';g.fillRect(x+3,y+32,25,39);}
        if((row+col)%4===0){g.fillStyle='#c1c4c2';g.fillRect(x+43,y+69,23,14);g.fillStyle='#6d7d87';for(let j=0;j<4;j++)g.fillRect(x+47+j*4,y+71,1,10);}
      }
    }
  });
  const facadeMat=material(0xd4dde3,{map:facade,roughness:.9});
  const rail=material(0x4f606e,{metalness:.2,roughness:.6});
  function building(name,x,z,w,d,h,front,detailed=true){
    const b=new THREE.Group();b.name=name;b.position.set(x,groundY,z);group.add(b);
    box(w,h,d,0,h/2,0,facadeMat,b);box(w+.25,.18,d+.25,0,h+.09,0,roof,b);
    if(detailed){
      const floors=Math.floor(h/2.6);
      for(let f=1;f<floors;f++){
        const y=f*2.6;
        if(front==='west'){
          box(.58,.12,d-.7,-w/2-.21,y,0,concrete,b);
          box(.04,.04,d-.8,-w/2-.48,y+.80,0,rail,b);
          for(let z0=-d/2+.6;z0<d/2;z0+=1.6)box(.035,.76,.035,-w/2-.48,y+.40,z0,rail,b);
        }else{
          const sign=front==='north'?1:-1;
          box(w-.7,.12,.58,0,y,sign*(d/2+.21),concrete,b);
          box(w-.8,.04,.04,0,y+.80,sign*(d/2+.48),rail,b);
          for(let x0=-w/2+.6;x0<w/2;x0+=1.6)box(.035,.76,.035,x0,y+.40,sign*(d/2+.48),rail,b);
        }
      }
      for(let j=0;j<3;j++){
        const m=new THREE.MeshBasicMaterial({color:0xd7c7a9,transparent:true,opacity:.42,depthWrite:false});
        const l=mesh(new THREE.PlaneGeometry(.65,1.05),m,front==='west'?-w/2-.012:-w*.28+j*w*.26,4+j*3.3,front==='west'?-d*.28+j*d*.27:(front==='north'?1:-1)*(d/2+.012),b);
        if(front==='west')l.rotation.y=-Math.PI/2;else if(front!=='north')l.rotation.y=Math.PI;
        windowLights.push({material:m,phase:random()*6});
      }
    }
    return b;
  }
  building('opposite-balcony-a',39,-7,8.0,10.5,25,'west');
  building('opposite-balcony-b',40,8.5,8.5,10,28,'west');
  building('opposite-balcony-c',42,25,9,11,24,'west');
  building('opposite-bedroom-a',-6,45,9,7,23,'south');
  building('opposite-bedroom-b',6,46,9.5,7,26,'south');
  building('opposite-bedroom-c',18,48,9,7,24,'south');
  building('opposite-small-room',5,-26,9.5,7,25,'north');
  building('opposite-study-room',18,-27,10,7,28,'north');
  for(let i=0;i<7;i++)building('distant-tower-'+i,63+(i%2)*12,-36+i*14,8+random()*4,9,25+random()*15,'west',false);
  for(let i=0;i<5;i++)building('distant-north-'+i,-28+i*14,58,9,8,23+random()*13,'south',false);

  const cloudTex=texture(128,64,(g,w,h)=>{
    for(const [x,y,r] of [[28,36,26],[56,27,29],[87,34,29],[106,42,19]]){
      const a=g.createRadialGradient(x,y,0,x,y,r);a.addColorStop(0,'rgba(215,225,235,.7)');a.addColorStop(1,'rgba(215,225,235,0)');g.fillStyle=a;g.fillRect(0,0,w,h);
    }
  });
  for(let i=0;i<13;i++){
    const m=new THREE.SpriteMaterial({map:cloudTex,transparent:true,opacity:.20,depthWrite:false,color:0xc5d2e0});
    const c=new THREE.Sprite(m);c.position.set(-55+random()*150,20+random()*18,-55+random()*120);c.scale.set(18+random()*17,5+random()*4,1);group.add(c);
    clouds.push({mesh:c,x:c.position.x,speed:.13+random()*.08});
  }
  const bark=material(0x4d4b43),foliage=material(0x425f54);
  function tree(x,z){
    const t=new THREE.Group();t.userData.animated=true;t.position.set(x,groundY,z);group.add(t);cyl(.12,2.1,0,1.05,0,bark,t);
    const crown=new THREE.Group();crown.position.y=1.55;t.add(crown);
    if(x===20&&(z===23||z===35))crown.scale.y=.70;
    for(let i=0;i<5;i++){const a=i*2.4,m=mesh(new THREE.SphereGeometry(1,12,8),foliage,Math.sin(a)*.52,.9+(i%2)*.35,Math.cos(a)*.52,crown);m.scale.set(.85,1.2,.85);}
    trees.push({crown,phase:random()*6});
  }
  for(const z of [-7,4,23,35])tree(20.0,z);
  for(const x of [-7,2,11])tree(x,11.0);
  const birdMat=new THREE.MeshBasicMaterial({color:0x253442});
  for(let i=0;i<3;i++){
    const b=new THREE.Group();b.userData.animated=true;group.add(b);
    const body=mesh(new THREE.SphereGeometry(1,8,6),birdMat,0,0,0,b);body.scale.set(.14,.05,.055);
    const left=new THREE.Group(),right=new THREE.Group();b.add(left,right);
    const lw=mesh(new THREE.SphereGeometry(1,8,6),birdMat,0,0,-.15,left);lw.scale.set(.10,.018,.18);
    const rw=mesh(new THREE.SphereGeometry(1,8,6),birdMat,0,0,.15,right);rw.scale.set(.10,.018,.18);
    birds.push({mesh:b,left,right,phase:i*.85,z:18+i*1.3});
  }

  const spillTex=texture(64,128,(g,w,h)=>{
    const a=g.createLinearGradient(0,0,0,h);a.addColorStop(0,'rgba(245,235,194,.5)');a.addColorStop(1,'rgba(245,235,194,0)');g.fillStyle=a;g.beginPath();g.moveTo(w*.37,0);g.lineTo(w*.63,0);g.lineTo(w,h);g.lineTo(0,h);g.closePath();g.fill();
  });
  function car(color,police=false){
    const c=new THREE.Group();c.userData.animated=true;group.add(c);
    const paint=material(color,{metalness:.25,roughness:.42}),dark=material(0x192632,{metalness:.15,roughness:.25});
    box(.86,.30,1.68,0,.40,0,paint,c);box(.70,.31,.88,0,.67,-.12,dark,c);box(.73,.05,.93,0,.85,-.12,paint,c);
    const rubber=material(0x1c242b);
    for(const x of [-.46,.46])for(const z of [-.55,.55]){const w=mesh(new THREE.CylinderGeometry(.19,.19,.12,12),rubber,x,.24,z,c);w.rotation.z=Math.PI/2;}
    for(const x of [-.27,.27]){
      box(.17,.09,.025,x,.45,.85,new THREE.MeshBasicMaterial({color:0xffe8b7}),c);
      box(.17,.07,.025,x,.45,-.85,new THREE.MeshBasicMaterial({color:0xa23c39}),c);
    }
    const spill=flat(1.65,4.5,0,.045,3.05,new THREE.MeshBasicMaterial({map:spillTex,transparent:true,opacity:.28,depthWrite:false}),c);spill.rotation.z=Math.PI;
    let red,blue,redGlow,blueGlow;
    if(police){
      red=new THREE.MeshBasicMaterial({color:0xa32332});blue=new THREE.MeshBasicMaterial({color:0x2857a8});
      box(.31,.11,.16,-.17,.96,-.1,red,c);box(.31,.11,.16,.17,.96,-.1,blue,c);
      redGlow=new THREE.Sprite(new THREE.SpriteMaterial({map:cloudTex,color:0xff4056,transparent:true,opacity:.5,depthWrite:false,blending:THREE.AdditiveBlending}));
      blueGlow=new THREE.Sprite(new THREE.SpriteMaterial({map:cloudTex,color:0x4b88ff,transparent:true,opacity:.5,depthWrite:false,blending:THREE.AdditiveBlending}));
      redGlow.position.set(-.17,1.0,-.1);blueGlow.position.set(.17,1.0,-.1);redGlow.scale.set(1.15,.8,1);blueGlow.scale.copy(redGlow.scale);c.add(redGlow,blueGlow);
    }
    return {mesh:c,red,blue,redGlow,blueGlow};
  }
  for(let i=0;i<3;i++){
    const c=car([0xb4b8b9,0x4b5a6c,0x7d7b70][i]);c.mesh.position.set(i%2?27.35:24.65,groundY,-25+i*29);if(i%2)c.mesh.rotation.y=Math.PI;
    cars.push({...c,axis:'z',start:-38+i*21,speed:i%2?-1.15:1.05,lane:c.mesh.position.x});
  }
  const crossCar=car(0x697a89);crossCar.mesh.rotation.y=Math.PI/2;crossCar.mesh.position.set(-25,groundY,14.0);cars.push({...crossCar,axis:'x',start:-25,speed:.85,lane:14.0});
  const patrol=car(0xd3d8da,true);patrol.mesh.position.set(29.0,groundY,5.8);patrol.mesh.rotation.y=.08;
  for(const z of [-8,7,23]){
    const height=z===23?3.35:4.1;
    cyl(.055,height,21.05,groundY+height/2,z,rail);box(.45,.07,.19,21.25,groundY+height+.02,z,new THREE.MeshBasicMaterial({color:0xf3d4a0}));
  }
  // Share static walls, balcony rails and road markings in a handful of draw calls.
  function batchStatics(){
    group.updateMatrixWorld(true);const buckets=new Map(),inverse=new THREE.Matrix4().copy(group.matrixWorld).invert();
    group.traverse(o=>{
      if(!o.isMesh||o.material.transparent||Array.isArray(o.material)||!['BoxGeometry','PlaneGeometry'].includes(o.geometry.type))return;
      for(let p=o;p&&p!==group;p=p.parent)if(p.userData.animated)return;
      const key=o.geometry.type+o.material.uuid;if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push(o);
    });
    let original=0,batches=0;
    for(const meshes of buckets.values()){
      if(meshes.length<2)continue;
      const isBox=meshes[0].geometry.type==='BoxGeometry',geometry=isBox?new THREE.BoxGeometry(1,1,1):new THREE.PlaneGeometry(1,1);
      const batch=new THREE.InstancedMesh(geometry,meshes[0].material,meshes.length);batch.name=isBox?'batched-buildings-and-rails':'batched-road-markings';batch.receiveShadow=true;
      meshes.forEach((m,i)=>{
        const p=m.geometry.parameters,scale=new THREE.Matrix4().makeScale(p.width,p.height,isBox?p.depth:1);
        const matrix=new THREE.Matrix4().multiplyMatrices(inverse,m.matrixWorld).multiply(scale);batch.setMatrixAt(i,matrix);
        m.parent.remove(m);m.geometry.dispose();
      });
      batch.instanceMatrix.needsUpdate=true;group.add(batch);original+=meshes.length;batches++;
    }
    return {staticMeshesCombined:original,batches};
  }
  const stats=batchStatics();
  function update(time){
    for(const c of clouds)c.mesh.position.x=-65+((c.x+65+time*c.speed)%180);
    for(const t of trees){t.crown.rotation.z=Math.sin(time*.65+t.phase)*.025;t.crown.rotation.x=Math.sin(time*.43+t.phase)*.015;}
    for(const c of cars){const length=c.axis==='z'?110:76,p=-45+(((c.start+45+time*c.speed)%length)+length)%length;if(c.axis==='z')c.mesh.position.z=p;else c.mesh.position.x=p;}
    for(const b of birds){b.mesh.position.set(-15+((time*.95+b.phase*5)%44),3.5+Math.sin(time*.7+b.phase)*.28,b.z);b.left.rotation.x=Math.sin(time*7+b.phase)*.6;b.right.rotation.x=-b.left.rotation.x;}
    const flash=Math.floor(time*5)%2===0;patrol.red.color.setHex(flash?0xff4651:0x5a1f2b);patrol.blue.color.setHex(flash?0x1e315f:0x528fff);
    patrol.redGlow.material.opacity=flash ? .58 : .05;patrol.blueGlow.material.opacity=flash ? .05 : .58;
    for(const w of windowLights)w.material.opacity=.39+.06*Math.sin(time*.055+w.phase);
  }
  update(0);
  return {group,update,cars,clouds,trees,birds,windowLights,patrol,groundY,stats};
};
