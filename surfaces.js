/* Metre-scaled local materials, including photographic raster textures. Offline safe. */
window.createPoyuSurfaces=function(T,texture){
  let seed=62719;const rand=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
  const grain=(g,n,light=.10,dark=.13)=>{for(let i=0;i<n;i++){const v=rand()>.5;g.fillStyle=v?`rgba(235,234,224,${rand()*light})`:`rgba(8,12,15,${rand()*dark})`;const s=rand()>.94?2:1;g.fillRect(rand()*512,rand()*512,s,s);}};
  function surface(name,color,size,draw,bump=.015,roughness=.9){
    const map=texture(512,512,(g,w,h)=>{g.fillStyle=color;g.fillRect(0,0,w,h);draw?.(g,w,h);grain(g,16000);});
    const relief=map.clone();relief.colorSpace=T.NoColorSpace;relief.needsUpdate=true;
    const m=new T.MeshStandardMaterial({map,bumpMap:relief,bumpScale:bump,roughness});m.name=name;m.userData.tileSize=size;return m;
  }
  const asphalt=surface('미세 골재 아스팔트','#45494b',3,(g)=>{grain(g,41000,.24,.28);for(let i=0;i<34;i++){g.strokeStyle='#1b242528';g.lineWidth=rand()*3+.4;g.beginPath();let x=rand()*512,y=rand()*512;g.moveTo(x,y);for(let j=0;j<4;j++){x+=rand()*40-20;y+=rand()*45;g.lineTo(x,y);}g.stroke();}},.025,1);
  const concrete=surface('노출 콘크리트','#9b9d98',2.4,(g)=>{for(let i=0;i<160;i++){g.fillStyle='#4d514d12';g.beginPath();g.ellipse(rand()*512,rand()*512,rand()*24,rand()*9,rand()*3,0,Math.PI*2);g.fill();}g.strokeStyle='#3e484b30';g.lineWidth=1;g.strokeRect(1,1,510,510);},.018);
  function tiles(name,base,size,columns,rows,palette,gap=2,bump=.012){return surface(name,base,size,g=>{for(let y=0;y<rows;y++)for(let x=0;x<columns;x++){const xx=x*512/columns,yy=y*512/rows;g.fillStyle=palette[Math.floor(rand()*palette.length)];g.fillRect(xx+gap,yy+gap,512/columns-gap*2,512/rows-gap*2);g.fillStyle='#ffffff0b';g.fillRect(xx+gap,yy+gap,512/columns-gap*2,1);}},bump);}
  const granite=tiles('포유하우스 짙은 화강석 줄눈','#949394',2.4,2,2,['#5b5b64','#62616a','#62616b','#5c5d66'],.8,.009);
  const lightStone=tiles('밝은 석재 외벽 패널','#979c9b',2.4,2,2,['#c4c2b9','#bcbeb8','#c6c7c1'],1,.006);
  const paving=tiles('적갈색 보도블록','#4c4946',1.6,8,4,['#967d6c','#8d7868','#9d8876','#817c71'],2,.018);
  const palePaving=tiles('회색 카페 앞 포장석','#767672',2,4,4,['#afafa8','#bdbcb5','#a8aaa6','#c4c3bd'],1.4,.012);
  const brick=tiles('상가 적벽돌','#b2a399',2,8,12,['#815c4d','#956c59','#875d4f','#a5755b'],2,.017);
  const retaining=surface('옹벽 거친 석재','#72736b',3,g=>{for(let y=0;y<6;y++)for(let x=-1;x<6;x++){const xx=x*103+(y%2)*51,yy=y*86;const shade=98+rand()*28;g.fillStyle=`rgb(${shade+6},${shade+7},${shade})`;g.beginPath();g.moveTo(xx+4,yy+8);g.lineTo(xx+82,yy+3);g.lineTo(xx+100,yy+65);g.lineTo(xx+15,yy+82);g.closePath();g.fill();}grain(g,20000,.2,.3);},.045);
  const plaster=surface('미세 벽지','#d3d2ca',2,null,.004,.95),garage=surface('주차장 에폭시','#6c7b71',4,g=>{grain(g,24000,.18,.16);g.strokeStyle='#1f2f2928';for(let i=0;i<25;i++){g.beginPath();g.moveTo(rand()*512,rand()*512);g.lineTo(rand()*512,rand()*512);g.stroke();}},.008,.57);
  const yellow=surface('닳은 노란 차선','#c1a15b',1,g=>{grain(g,19000,.25,.35);},.002,.86),white=surface('닳은 흰 차선','#d1d0c7',1,g=>{grain(g,22000,.22,.3);},.002,.92);
  const soil=surface('화단 흙','#4c4a3c',1.6,g=>{grain(g,33000,.4,.4);},.035,1);
  const bark=surface('나무 수피','#575247',1,g=>{for(let i=0;i<110;i++){g.strokeStyle=i%3?'#272c2340':'#c3b49c40';g.lineWidth=1+rand()*5;const x=rand()*512;g.beginPath();g.moveTo(x,0);g.lineTo(x+rand()*20,255);g.lineTo(x+rand()*25,512);g.stroke();}},.03);
  const glassMap=texture(256,512,(g,w,h)=>{const a=g.createLinearGradient(0,0,w,h);a.addColorStop(0,'#82989c');a.addColorStop(.34,'#426165');a.addColorStop(.58,'#70898a');a.addColorStop(1,'#344e55');g.fillStyle=a;g.fillRect(0,0,w,h);g.fillStyle='#c5ccbc18';for(let x=0;x<w;x+=40)g.fillRect(x,120+(x%70),24,270);g.fillStyle='#081c271f';g.fillRect(0,0,w,42);for(let y=56;y<h;y+=8){g.fillStyle='#dce0d412';g.fillRect(0,y,w,1);}});
  const glass=new T.MeshStandardMaterial({map:glassMap,color:0xb8cbce,metalness:.30,roughness:.24,envMapIntensity:.7});glass.name='청록색 창유리와 블라인드';
  const shopGlass=new T.MeshPhysicalMaterial({color:0x94b3b8,transparent:true,opacity:.26,metalness:.1,roughness:.15,clearcoat:.8,depthWrite:false,side:T.DoubleSide});
  const metal=new T.MeshStandardMaterial({color:0x929c9d,metalness:.75,roughness:.36}),dark=new T.MeshStandardMaterial({color:0x252c2d,roughness:.64});
  function photograph(material,file,bump){
    material.userData.photoSource='assets/'+file;
    if(typeof document.createElementNS!=='function')return;
    new T.TextureLoader().load(window.PoyuPhotos?.[file]||'assets/'+file,map=>{
      map.colorSpace=T.SRGBColorSpace;map.wrapS=map.wrapT=T.RepeatWrapping;map.anisotropy=8;
      const relief=map.clone();relief.colorSpace=T.NoColorSpace;relief.needsUpdate=true;
      material.map.dispose();material.bumpMap?.dispose();material.map=map;material.bumpMap=relief;material.bumpScale=bump;material.needsUpdate=true;
    },undefined,()=>{});
  }
  photograph(asphalt,'asphalt-photo-v1.png',.012);photograph(granite,'granite-photo-v1.png',.006);
  const vehicleGlass=new T.MeshPhysicalMaterial({color:0x263237,metalness:.18,roughness:.12,clearcoat:1,clearcoatRoughness:.09,envMapIntensity:1.0,side:T.DoubleSide});
  const fallbackLeaf=texture(64,64,(g)=>{g.clearRect(0,0,64,64);g.fillStyle='#67774c';for(let i=0;i<9;i++){g.beginPath();g.ellipse(15+(i*23)%35,10+(i*17)%46,7,3,i,0,Math.PI*2);g.fill();}});
  const foliage=new T.MeshStandardMaterial({map:fallbackLeaf,color:0xb5bc9d,roughness:1,side:T.DoubleSide,alphaTest:.48});
  foliage.userData.photoSource='assets/foliage-photo-v1.png';
  if(typeof document.createElementNS==='function')new T.TextureLoader().load(window.PoyuPhotos?.['foliage-photo-v1.png']||foliage.userData.photoSource,map=>{map.colorSpace=T.SRGBColorSpace;map.anisotropy=4;foliage.map.dispose();foliage.map=map;foliage.needsUpdate=true;},undefined,()=>{});
  return {asphalt,concrete,granite,lightStone,paving,palePaving,brick,retaining,plaster,garage,yellow,white,soil,bark,glass,shopGlass,vehicleGlass,foliage,metal,dark};
};
// Preserve real-world texel scale, including the UVs of geometry merged into draw batches.
window.poyuBoxGeometry=function(T,w,h,d,m){
  const g=new T.BoxGeometry(w,h,d),size=m?.userData?.tileSize;if(!size)return g;
  const p=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv;
  for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i);if(Math.abs(n.getY(i))>.5)uv.setXY(i,x/size,z/size);else if(Math.abs(n.getX(i))>.5)uv.setXY(i,z/size,y/size);else uv.setXY(i,x/size,y/size);}
  return g;
};
