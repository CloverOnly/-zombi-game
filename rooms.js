/* Three-room apartment wing. All rooms use the apartment's shared materials. */
window.buildPoyuRoomWing=function buildPoyuRoomWing(THREE,kit){
  const {scene,mat,doorMat,box,bevelBox,wall,plane,line,cylinder,sphere,footprint,blocker,floorRect,fixture,interior}=kit;
  const frontZ=0,backZ=-4.2,height=2.8,doorways=[];
  const definitions=[
    {id:'small-bedroom',name:'작은방',kind:'bedroom',minX:5,maxX:9,minZ:backZ,maxZ:frontZ,labelX:6.7,labelZ:-1.9,entry:{x:7.9,z:-.65}},
    {id:'study-bedroom',name:'서재',kind:'bedroom',minX:9,maxX:13,minZ:backZ,maxZ:frontZ,labelX:10.8,labelZ:-1.9,entry:{x:11.35,z:-.65}},
    {id:'bathroom',name:'화장실',kind:'bathroom',minX:13,maxX:16,minZ:backZ,maxZ:frontZ,labelX:14.5,labelZ:-1.9,entry:{x:14.55,z:-.6}}
  ];
  function doorway(x0,x1,center,width,id){
    const a=center-width/2,b=center+width/2;
    wall(a-x0,height,.14,(x0+a)/2,height/2,0);wall(x1-b,height,.14,(b+x1)/2,height/2,0);
    box(width,.17,.14,center,2.715,0,mat.wall);
    bevelBox(.11,2.63,.18,a,1.315,0,doorMat);bevelBox(.11,2.63,.18,b,1.315,0,doorMat);bevelBox(width+.11,.12,.18,center,2.67,0,doorMat);
    const hinge=new THREE.Group();hinge.position.set(a+.015,0,-.085);hinge.rotation.y=1.48;scene.add(hinge);
    const leaf=bevelBox(width-.10,2.56,.055,(width-.10)/2,1.30,0,doorMat,.014);scene.remove(leaf);hinge.add(leaf);
    const handle=line(width-.28,1.04,.07,width-.44,1.04,.07,mat.steel,.015);scene.remove(handle);hinge.add(handle);
    blocker(a+.065,-(width-.10)/2-.08,.30,width+.03,0,'furniture',id+'-open-door');
    for(const [l,r] of [[x0+.08,a-.10],[b+.10,x1-.08]])if(r>l){box(r-l,.11,.06,(l+r)/2,.07,-.1,mat.white,false);box(r-l,.065,.06,(l+r)/2,2.77,-.1,mat.white,false);}
    doorways.push({id,x:center,z:0,width});
  }
  function backWindow(x0,x1,center,width,sill=.94,top=2.35,frosted=false){
    const a=center-width/2,b=center+width/2;
    wall(a-x0,height,.14,(x0+a)/2,height/2,backZ);wall(x1-b,height,.14,(b+x1)/2,height/2,backZ);
    wall(width,sill,.14,center,sill/2,backZ);wall(width,height-top,.14,center,(height+top)/2,backZ);
    const glass=frosted?new THREE.MeshPhysicalMaterial({color:0xd3dfe1,roughness:.75,transparent:true,opacity:.68,depthWrite:false}):mat.glass;
    plane(width-.07,top-sill-.04,center,(top+sill)/2,backZ+.05,glass);
    box(width+.12,.05,.17,center,sill,backZ+.08,doorMat);
    for(const x of [a,center,b])box(.04,top-sill+.05,.07,x,(top+sill)/2,backZ+.09,mat.steel);
    blocker(center,backZ,width,.14,0,'wall');
  }
  function skirting(x0,x1){
    box(x1-x0-.15,.11,.06,(x0+x1)/2,.07,backZ+.10,mat.white,false);
    for(const x of [x0+.10,x1-.10]){box(.06,.11,4.0,x,.07,-2.1,mat.white,false);box(.06,.065,4.0,x,2.77,-2.1,mat.white,false);}
  }
  for(const r of definitions){
    floorRect(r.maxX-r.minX,4.2,(r.minX+r.maxX)/2,-2.1);
    box(r.maxX-r.minX,.12,4.2,(r.minX+r.maxX)/2,2.88,-2.1,new THREE.MeshStandardMaterial({color:0xc9c6c3,roughness:1}),false);
    skirting(r.minX,r.maxX);
  }
  for(const x of [5,9,13,16])wall(.14,height,4.2,x,height/2,-2.1);
  doorway(5,9,7.9,1.16,'small-bedroom');doorway(9,13,11.35,1.16,'study-bedroom');doorway(13,16,14.55,1.06,'bathroom');
  backWindow(5,9,7.1,2.25);backWindow(9,13,11.1,2.25);backWindow(13,16,14.55,.92,1.88,2.52,true);
  fixture(7.25,-2.1,.62,.55);fixture(11.25,-2.1,.62,.55);fixture(14.5,-2.1,.62,.65);

  function singleBed(id,x,z,tint){
    const cover=mat.blanket.clone();cover.color.setHex(tint);interior.upgradeFabric(cover);
    bevelBox(1.25,.23,2.25,x,.24,z,mat.wood,.025);bevelBox(1.17,.20,2.12,x,.45,z,mat.white,.05);
    bevelBox(1.20,.46,.12,x,.91,z-1.14,mat.wood,.024);
    interior.soft(1.15,.12,1.63,x,.61,z+.25,cover,.045);
    interior.pillow(x,.66,z-.76,.90,.48);
    footprint(id,x,z,1.30,2.38);
  }
  function writingDesk(id,x,z){
    bevelBox(1.5,.065,.58,x,.76,z,mat.paleWood,.02);
    for(const dx of [-.64,.64])for(const dz of [-.20,.20])bevelBox(.045,.73,.045,x+dx,.37,z+dz,mat.darkWood,.008);
    footprint(id,x,z,1.5,.58);
    bevelBox(.46,.025,.32,x,.813,z,mat.black,.008);
    const screen=bevelBox(.45,.29,.018,x,.96,z-.13,mat.black,.006);screen.rotation.x=-.14;
    const chairZ=z+.93;bevelBox(.46,.06,.46,x,.44,chairZ,mat.wood,.025);bevelBox(.44,.40,.05,x,.74,chairZ+.21,mat.wood,.018);
    for(const dx of [-.18,.18])for(const dz of [-.18,.18])line(x+dx,.03,chairZ+dz,x+dx,.41,chairZ+dz,mat.darkWood,.020);
    footprint(id+'-chair',x,chairZ,.49,.53);
    for(let i=0;i<3;i++)bevelBox(.24,.022,.18,x+.48,.81+i*.022,z+.05,i%2?mat.white:mat.darkWood,.005);
  }
  function bedside(id,x,z){
    bevelBox(.46,.50,.48,x,.27,z,mat.wood,.018);bevelBox(.49,.035,.51,x,.535,z,mat.paleWood,.01);footprint(id,x,z,.49,.51);
    cylinder(.07,.09,.02,x,.57,z,mat.steel,16);line(x,.58,z,x,.77,z,mat.steel,.012);
    cylinder(.09,.125,.17,x,.85,z,new THREE.MeshStandardMaterial({color:0xd6cbbd,roughness:1}),24);
  }
  singleBed('small-room-bed',6.25,-2.55,0x8d999f);bedside('small-room-nightstand',7.25,-3.10);writingDesk('small-room-desk',8.05,-3.65);
  bevelBox(.70,2.12,1.0,5.55,1.08,-.75,mat.cabinet,.022);footprint('small-room-wardrobe',5.55,-.75,.70,1.0);
  line(5.93,.95,-.95,5.93,1.27,-.95,mat.steel,.012);
  singleBed('study-room-bed',10.05,-2.5,0x788c93);bedside('study-room-nightstand',11.1,-3.05);writingDesk('study-room-desk',11.95,-3.65);
  bevelBox(.45,1.9,1.1,12.65,.97,-1.4,mat.wood,.018);footprint('study-room-bookcase',12.65,-1.4,.45,1.1);
  for(const y of [.35,.8,1.25,1.70]){
    box(.025,.33,.98,12.412,y,-1.4,mat.darkWood,false);
    for(let i=0;i<7;i++)bevelBox(.045,.20+(i%3)*.035,.10,12.385,y,-1.82+i*.135,i%2?mat.white:mat.paleWood,.005);
  }

  // Bathroom shares the wall and frame colours; only wet surfaces use grey tile.
  const ceramic=new THREE.MeshStandardMaterial({color:0xe2e5e3,roughness:.26,metalness:.02});
  const bathWall=mat.tile.clone();bathWall.color.setHex(0xd1d5d4);
  const tileFloor=new THREE.Mesh(new THREE.PlaneGeometry(2.82,4.02),mat.floorTile);tileFloor.rotation.x=-Math.PI/2;tileFloor.position.set(14.5,.012,-2.1);tileFloor.receiveShadow=true;scene.add(tileFloor);
  plane(4.02,2.58,13.08,1.37,-2.1,bathWall,Math.PI/2);plane(4.02,2.58,15.92,1.37,-2.1,bathWall,-Math.PI/2);
  box(.94,.025,.18,14.55,.028,0,mat.stone,false);
  bevelBox(.68,.73,1.38,15.53,.39,-1.30,mat.cabinet,.02);bevelBox(.75,.065,1.44,15.51,.79,-1.30,mat.stone,.02);footprint('bathroom-vanity',15.53,-1.30,.75,1.44);
  const basin=sphere(1,15.41,.86,-1.30,ceramic);basin.scale.set(.28,.07,.43);
  const recess=sphere(1,15.40,.905,-1.30,new THREE.MeshStandardMaterial({color:0xb9c5c8,roughness:.30}));recess.scale.set(.20,.018,.30);
  line(15.75,.83,-1.3,15.75,1.08,-1.3,mat.steel,.016);line(15.75,1.08,-1.3,15.49,1.08,-1.3,mat.steel,.016);
  bevelBox(.035,1.0,1.23,15.88,1.65,-1.30,mat.white,.012);
  plane(1.12,.89,15.853,1.65,-1.3,new THREE.MeshStandardMaterial({color:0x9db3be,metalness:.35,roughness:.18,emissive:0x20303a,emissiveIntensity:.12}),-Math.PI/2);
  const bowl=sphere(1,13.75,.39,-3.35,ceramic);bowl.scale.set(.32,.22,.43);
  cylinder(.19,.23,.32,13.75,.18,-3.43,ceramic,28);bevelBox(.46,.65,.23,13.75,.73,-3.89,ceramic,.045);
  const seat=new THREE.Mesh(new THREE.TorusGeometry(.235,.035,12,36),ceramic);seat.rotation.x=Math.PI/2;seat.scale.set(1,1.35,1);seat.position.set(13.75,.57,-3.30);scene.add(seat);
  footprint('bathroom-toilet',13.75,-3.4,.72,1.25);
  bevelBox(1.30,.045,1.45,15.19,.04,-3.35,ceramic,.015);box(.13,.008,.13,15.2,.068,-3.5,mat.black,false);
  const showerGlass=mat.glass.clone();showerGlass.opacity=.20;showerGlass.roughness=.18;
  plane(1.45,1.96,14.50,1.04,-3.35,showerGlass,-Math.PI/2);blocker(14.5,-3.35,.055,1.45,0,'furniture','shower-glass');
  for(const z of [-4.075,-2.625])line(14.5,.06,z,14.5,2.02,z,mat.steel,.012);
  line(15.79,1.18,-3.72,15.79,2.20,-3.72,mat.steel,.016);line(15.79,2.20,-3.72,15.35,2.20,-3.72,mat.steel,.016);
  cylinder(.13,.13,.025,15.35,2.19,-3.72,mat.steel,28);
  line(13.12,1.15,-1.1,13.12,1.15,-1.95,mat.steel,.014);
  const towel=new THREE.Mesh(new THREE.PlaneGeometry(.6,.66),mat.pillow);towel.rotation.y=Math.PI/2;towel.position.set(13.14,.85,-1.50);scene.add(towel);
  return {rooms:definitions,doorways};
};
