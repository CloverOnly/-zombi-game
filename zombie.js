/* Original, articulated character. All geometry and surface maps are made locally. */
window.createPoyuZombie=function createPoyuZombie(T,{scene,texture,worker=false,variant=0}){
  const root=new T.Group(),rig=new T.Group();root.name='hallway-infected';root.userData.dynamic=true;root.add(rig);root.visible=false;scene.add(root);
  let seed=981;const rand=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
  const skinMap=texture(512,512,(g,w,h)=>{
    g.fillStyle='#a5a18d';g.fillRect(0,0,w,h);
    for(let i=0;i<210;i++){const x=rand()*w,y=rand()*h,r=4+rand()*27;g.fillStyle=i%3?'#717c6c16':'#775f661a';g.beginPath();g.ellipse(x,y,r,r*.6,rand()*3,0,Math.PI*2);g.fill();}
    for(let i=0;i<14000;i++){g.fillStyle=rand()>.5?'#e0d4bc25':'#3b454827';g.fillRect(rand()*w,rand()*h,1,1);}
    g.lineWidth=.6;g.strokeStyle='#5c6d7838';
    for(let i=0;i<34;i++){const x=rand()*w,y=rand()*h;g.beginPath();g.moveTo(x,y);g.bezierCurveTo(x+10,y+14,x-7,y+25,x+14,y+43);g.stroke();}
  });
  const clothMap=texture(512,512,(g,w,h)=>{
    g.fillStyle=worker?(variant===1?'#cc994b':'#b6c751'):['#777e79','#806b65','#657181','#726b7c','#7c8067'][variant%5];g.fillRect(0,0,w,h);
    for(let i=0;i<512;i+=2){g.fillStyle=i%4?'#c6c9bc1c':'#1b2b2d33';g.fillRect(i,0,1,h);g.fillRect(0,i,w,1);}
    for(let i=0;i<100;i++){g.fillStyle=i%3?'#423c321d':'#25312b22';g.beginPath();g.ellipse(rand()*w,rand()*h,3+rand()*36,2+rand()*18,rand()*3,0,Math.PI*2);g.fill();}
    for(let i=0;i<50;i++){g.strokeStyle='#d1c5a433';g.beginPath();const x=rand()*w,y=rand()*h;g.moveTo(x,y);g.lineTo(x+rand()*20,y+3);g.stroke();}
  });
  const skin=new T.MeshStandardMaterial({map:skinMap,roughness:.88,bumpMap:skinMap,bumpScale:.0015});
  const shirt=new T.MeshStandardMaterial({map:clothMap,color:worker?0xe8e9bf:0x9aa6a2,roughness:.97,bumpMap:clothMap,bumpScale:.002});
  const sleeveMat=worker?new T.MeshStandardMaterial({color:0x394950,roughness:1}):shirt;
  const trousers=new T.MeshStandardMaterial({map:clothMap,color:0x343a42,roughness:1,bumpMap:clothMap,bumpScale:.002});
  const seam=new T.MeshStandardMaterial({color:0x535f5b,roughness:1}),dark=new T.MeshStandardMaterial({color:0x343835,roughness:1});
  const leather=new T.MeshStandardMaterial({color:0x34312c,roughness:.8}),sole=new T.MeshStandardMaterial({color:0x1e211f,roughness:1});
  const shadow=new T.MeshStandardMaterial({color:0x666b60,roughness:1}),lip=new T.MeshStandardMaterial({color:0x716b66,roughness:.94});
  function mesh(geo,material,x,y,z,parent=rig){const m=new T.Mesh(geo,material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
  function ellipsoid(rx,ry,rz,x,y,z,material,parent=rig){const m=mesh(new T.SphereGeometry(1,24,16),material,x,y,z,parent);m.scale.set(rx,ry,rz);return m;}
  function tube(a,b,r1,r2,material,parent=rig){const p=new T.Vector3(...a),q=new T.Vector3(...b),d=q.clone().sub(p);const m=mesh(new T.CylinderGeometry(r2,r1,d.length(),14),material,...p.clone().add(q).multiplyScalar(.5).toArray(),parent);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());return m;}
  function sculpt(rings,material,parent=rig){
    const v=[],uv=[],idx=[],n=32;
    for(let j=0;j<rings.length;j++){const [y,rx,rz,cz=0]=rings[j];for(let i=0;i<=n;i++){const a=i/n*Math.PI*2;v.push(Math.sin(a)*rx,y,Math.cos(a)*rz+cz);uv.push(i/n,j/(rings.length-1));}}
    for(let j=0;j<rings.length-1;j++)for(let i=0;i<n;i++){const a=j*(n+1)+i,b=a+n+1;idx.push(a,a+1,b,b,a+1,b+1);}
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(v,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return mesh(g,material,0,0,0,parent);
  }
  sculpt([[.86,.13,.085],[.94,.158,.103],[1.04,.15,.101],[1.15,.165,.105],[1.32,.18,.108],[1.405,.19,.094],[1.445,.15,.074],[1.475,.06,.055]],shirt);
  ellipsoid(.155,.105,.097,0,.89,0,trousers);
  tube([0,1.43,0],[0,1.55,.012],.05,.046,skin);
  const headPivot=new T.Group();headPivot.position.set(0,1.625,.025);rig.add(headPivot);
  const head=sculpt([[-.12,.038,.041,.02],[-.098,.061,.06,.012],[-.055,.076,.073],[.005,.083,.085],[.06,.08,.083,-.007],[.10,.059,.06,-.013],[.125,.006,.006,-.012]],skin,headPivot);
  // Cheek planes, nose bridge, lids and a recessed mouth keep a human silhouette at close range.
  for(const side of [-1,1]){
    ellipsoid(.014,.027,.012,side*.083,-.006,-.001,skin,headPivot);
    ellipsoid(.027,.013,.010,side*.035,.020,.076,shadow,headPivot);
    ellipsoid(.020,.008,.007,side*.035,.020,.083,new T.MeshStandardMaterial({color:0xb4bbb0,roughness:.5}),headPivot);
    ellipsoid(.006,.006,.004,side*.034,.020,.089,new T.MeshStandardMaterial({color:0x6f7a73,roughness:.45}),headPivot);
    tube([side*.014,.041,.076],[side*.059,.038,.071],.006,.009,shadow,headPivot);
    tube([side*.018,-.026,.077],[side*.052,-.035,.064],.003,.003,shadow,headPivot);
    ellipsoid(.025,.026,.008,side*.052,-.034,.067,skin,headPivot);
  }
  ellipsoid(.013,.034,.014,0,-.001,.085,skin,headPivot);
  ellipsoid(.017,.012,.02,0,-.023,.101,skin,headPivot);
  ellipsoid(.027,.007,.006,0,-.064,.075,dark,headPivot);
  tube([-.025,-.058,.075],[.025,-.06,.075],.004,.003,lip,headPivot);
  tube([-.021,-.072,.073],[.019,-.073,.073],.004,.004,lip,headPivot);
  // Short irregular hair follows the skull rather than forming a round helmet.
  const hair=mesh(new T.SphereGeometry(1,24,12,0,Math.PI*2,0,1.38),dark,0,.026,-.012,headPivot);hair.scale.set(.083,.104,.081);hair.rotation.x=-.23;
  for(let i=0;i<26;i++){const a=rand()*Math.PI*2,x=Math.sin(a)*.07,z=Math.cos(a)*.067-.012;tube([x,.066,z],[x+rand()*.009,.099+rand()*.009,z-.005],.002,.0007,dark,headPivot);}
  // Collar, placket, pocket and creased sleeves are separate geometry.
  for(const side of [-1,1]){const c=mesh(new T.BoxGeometry(.09,.075,.018),seam,side*.053,1.43,.065);c.rotation.z=side*.5;}
  mesh(new T.BoxGeometry(.018,.43,.009),seam,0,1.19,.108);
  mesh(new T.BoxGeometry(.067,.075,.009),seam,-.104,1.30,.11);
  for(const y of [.99,1.09,1.20,1.31,1.40])ellipsoid(.006,.006,.003,.006,y,.119,dark);
  if(worker){
    const reflective=new T.MeshStandardMaterial({color:0xc9d5c8,metalness:.25,roughness:.55,emissive:0x5b695b,emissiveIntensity:.12});
    sculpt([[1.09,.159,.114],[1.135,.165,.116]],reflective);sculpt([[1.29,.185,.117],[1.33,.185,.117]],reflective);
    for(const side of [-1,1])mesh(new T.BoxGeometry(.035,.20,.012),reflective,side*.105,1.38,.101);
    const cap=mesh(new T.SphereGeometry(1,20,10,0,Math.PI*2,0,Math.PI/2),sleeveMat,0,.052,-.009,headPivot);cap.scale.set(.087,.088,.086);
    mesh(new T.BoxGeometry(.15,.012,.088),sleeveMat,0,.052,.073,headPivot);
    const badgeMap=texture(256,96,(g,w,h)=>{g.fillStyle='#3c5148';g.fillRect(0,0,w,h);g.fillStyle='#e2e7d1';g.font='bold 39px Malgun Gothic';g.textAlign='center';g.fillText('환경미화',w/2,62);});
    const badge=mesh(new T.PlaneGeometry(.24,.09),new T.MeshBasicMaterial({map:badgeMap}),0,1.245,-.113);badge.rotation.y=Math.PI;
  }
  const legs=[],knees=[],arms=[],elbows=[],feet=[];
  for(const side of [-1,1]){
    const leg=new T.Group();leg.position.set(side*.095,.89,0);rig.add(leg);legs.push(leg);
    tube([0,0,0],[0,-.39,.012],.09,.066,trousers,leg);
    const knee=new T.Group();knee.position.set(0,-.39,.012);leg.add(knee);knees.push(knee);
    ellipsoid(.066,.065,.064,0,0,.004,trousers,knee);
    tube([0,0,0],[0,-.40,-.014],.065,.044,trousers,knee);
    for(const y of [-.06,-.14,-.33])tube([-.043,y,.035],[.042,y-.012,.035],.004,.002,seam,knee);
    const foot=new T.Group();foot.position.set(0,-.43,.035);knee.add(foot);feet.push(foot);
    ellipsoid(.067,.052,.132,0,0,.025,leather,foot);
    mesh(new T.BoxGeometry(.131,.027,.235),sole,0,-.035,.026,foot);
    for(let i=0;i<4;i++)tube([-.031,.04,.003+i*.016],[.031,.04,.01+i*.016],.002,.002,seam,foot);
    const arm=new T.Group();arm.position.set(side*.177,1.375,0);rig.add(arm);arms.push(arm);
    ellipsoid(.060,.065,.060,side*.01,-.005,0,sleeveMat,arm);
    tube([0,-.02,0],[side*.018,-.285,0],.059,.049,sleeveMat,arm);
    mesh(new T.TorusGeometry(.052,.006,6,16),seam,side*.018,-.265,0,arm).rotation.x=Math.PI/2;
    const elbow=new T.Group();elbow.position.set(side*.018,-.285,0);arm.add(elbow);elbows.push(elbow);
    ellipsoid(.047,.047,.047,0,0,0,skin,elbow);
    tube([0,0,0],[0,-.247,.012],.047,.029,skin,elbow);
    const hand=new T.Group();hand.position.set(0,-.29,.01);elbow.add(hand);
    ellipsoid(.034,.052,.019,0,0,0,skin,hand);
    for(let f=0;f<4;f++){const x=(f-1.5)*.016,l=.047+(1-Math.abs(f-1.4)/2)*.015;tube([x,-.028,.006],[x,-.028-l,.026],.008,.005,skin,hand);ellipsoid(.008,.009,.007,x,-.055,.016,skin,hand);}
    tube([side*.026,.011,0],[side*.046,-.028,.03],.011,.007,skin,hand);
  }
  function pose(time,moving,windup,dead,deathTime,strike=0){
    if(dead){const u=Math.min(1,deathTime/.8);rig.rotation.set(u*1.50,0,0);root.position.y=.13*u;for(let i=0;i<2;i++){legs[i].rotation.x=0;knees[i].rotation.x=0;arms[i].rotation.set(-.1,u===1?0:.03,i===0?.25:-.25);elbows[i].rotation.x=-.15;feet[i].rotation.x=-u*1.50;feet[i].position.z=.035*(1-u);}return;}
    const gait=time*7.2;root.position.y=moving?Math.abs(Math.sin(gait))*.012:0;rig.rotation.set(.075+strike*.13,0,moving?Math.sin(gait)*.022:Math.sin(time)*.009);
    headPivot.rotation.set(-.035-strike*.09,Math.sin(time*.7)*.025,.11+Math.sin(time)*.018);
    for(let i=0;i<2;i++){
      const step=Math.sin(gait+i*Math.PI);legs[i].rotation.x=moving?step*(i?.28:.34):0;knees[i].rotation.x=moving?Math.max(0,-step)*.33:.04;
      feet[i].rotation.x=0;feet[i].position.z=.035;
      arms[i].rotation.set(-.62-windup*.72-strike*.95+Math.sin(time*2+i)*.07,0,i===0?.10:-.13);elbows[i].rotation.x=-.28+windup*.15;
    }
  }
  // Weld meshes sharing a rigid bone/material, preserving the independently animated joints.
  function weld(parent){
    for(const child of [...parent.children])if(child.isGroup)weld(child);
    const buckets=new Map();for(const m of parent.children)if(m.isMesh&&m!==head&&!Array.isArray(m.material)){if(!buckets.has(m.material))buckets.set(m.material,[]);buckets.get(m.material).push(m);}
    for(const [material,list] of buckets){
      if(list.length<2)continue;const vertices=[],normals=[],uv=[],indices=[];
      for(const m of list){m.updateMatrix();const geo=m.geometry,p=geo.attributes.position,n=geo.attributes.normal,t=geo.attributes.uv,base=vertices.length/3,normalMatrix=new T.Matrix3().getNormalMatrix(m.matrix);
        for(let i=0;i<p.count;i++){const v=new T.Vector3().fromBufferAttribute(p,i).applyMatrix4(m.matrix),normal=new T.Vector3().fromBufferAttribute(n,i).applyMatrix3(normalMatrix).normalize();vertices.push(v.x,v.y,v.z);normals.push(normal.x,normal.y,normal.z);uv.push(t?t.getX(i):0,t?t.getY(i):0);}
        for(let i=0;i<(geo.index?geo.index.count:p.count);i++)indices.push(base+(geo.index?geo.index.getX(i):i));parent.remove(m);geo.dispose();
      }
      const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(vertices,3));geo.setAttribute('normal',new T.Float32BufferAttribute(normals,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(indices);const m=new T.Mesh(geo,material);m.castShadow=true;m.receiveShadow=true;parent.add(m);
    }
  }
  weld(rig);
  return {root,rig,head,headPivot,legs,arms,pose};
};
