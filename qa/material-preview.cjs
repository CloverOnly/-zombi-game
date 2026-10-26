// Offline CPU material/geometry study only. It does not reproduce WebGL lighting or game screenshots.
const fs=require('fs'),vm=require('vm'),zlib=require('zlib'),T=require('../three.min.js');
const {createCanvas,loadImage}=require('C:/Users/lyj/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@napi-rs/canvas');
(async()=>{
const document={createElement:()=>createCanvas(1,1)},window={};
for(const name of ['surfaces','street-details','exterior','interior-polish','rooms','zombie','elevator','parking','mart-route','streets','driving','street-ai','hallway','mart-interior','photo-apartment','world'])vm.runInNewContext(fs.readFileSync(__dirname+'/../'+name+'.js','utf8'),{window,document,Math,console});
const world=window.createPoyuWorld(T,{capabilities:{getMaxAnisotropy:()=>8}}),W=960,H=540;
if(process.argv.includes('--furniture')){
  vm.runInNewContext(fs.readFileSync(__dirname+'/../realistic-furniture.js','utf8'),{window,console});
  for(const id of window.PoyuFurniture.ids){const gltf=await require('./load-furniture.cjs')(id,true);window.PoyuFurniture.apply(T,world.apartment.group,id,gltf.scene);}
}
const photoMaterials=new Set();world.scene.traverse(o=>{for(const m of (Array.isArray(o.material)?o.material:[o.material]))if(m?.userData.photoSource)photoMaterials.add(m);});
for(const m of photoMaterials){const im=await loadImage(__dirname+'/../'+m.userData.photoSource),c=createCanvas(im.width,im.height);c.getContext('2d').drawImage(im,0,0);m.map=new T.CanvasTexture(c);m.map.wrapS=m.map.wrapT=T.RepeatWrapping;}
const views={start:world.referenceView,living:{x:9.2,z:3.8,eye:1.4,yaw:.45,pitch:0,fov:68},kitchen:{x:13.5,z:4.4,eye:1.4,yaw:.65,pitch:0,fov:68},foyer:{x:13.3,z:8.4,eye:1.4,yaw:0,pitch:0,fov:68},outside:{x:15.5,z:2.6,eye:1.4,yaw:0,pitch:-.18,fov:68},small:{x:7.9,z:-.8,eye:1.4,yaw:-2.0,pitch:-.05,fov:68},study:{x:11.5,z:-.8,eye:1.4,yaw:-1.6,pitch:-.05,fov:68},bathroom:{x:14.55,z:-1.35,eye:1.4,yaw:-1.45,pitch:-.15,fov:68},hallway:{x:16.60,z:8.33,eye:1.4,yaw:0,pitch:0,fov:68},cabinet:{x:13.2,z:8.25,eye:1.4,yaw:Math.PI/2,pitch:-.38,fov:68},combat:{x:16.60,z:8.33,eye:1.4,yaw:0,pitch:0,fov:68}};
Object.assign(views,{lobby:{x:15.3,z:25,eye:1.4,yaw:Math.PI,pitch:0,fov:68},longhall:{x:18.1,z:11.8,eye:1.4,yaw:Math.PI/2,pitch:0,fov:68},lift:{x:9.5,z:24.8,eye:1.4,yaw:Math.PI,pitch:-.07,fov:68},courtyard:{x:17,z:24.8,eye:-6.2,yaw:.4,pitch:0,fov:68},zombie:{x:16.95,z:8.33,eye:1.45,yaw:0,pitch:-.04,fov:50}});
Object.assign(views,{parking:{x:16.8,z:24.8,eye:-2.4,yaw:.36,pitch:0,fov:68},driver:{x:world.parking.seat.x,z:world.parking.seat.z,eye:-2.84,yaw:0,pitch:-.04,fov:68},car:{x:23.5,z:29.8,eye:-2.4,yaw:.48,pitch:-.12,fov:60}});
Object.assign(views,{street:{x:60,z:98,eye:-6.2,yaw:-Math.PI/2,pitch:0,fov:68},front:{x:61,z:48,eye:-6.2,yaw:Math.PI,pitch:.12,fov:68},ramp:{x:47,z:57,eye:-2.60,yaw:Math.PI/2,pitch:-.15,fov:68},worker:{x:61,z:99,eye:-6.2,yaw:-.5,pitch:-.04,fov:54},streetdriver:{x:59.664,z:96.376,eye:-6.64,yaw:-Math.PI/2,pitch:0,fov:68}});
Object.assign(views,{exit:{x:47,z:88,eye:-6.2,yaw:0,pitch:.04,fov:65},cafe:{x:61,z:127,eye:-6.2,yaw:-2.7,pitch:.12,fov:65},gs25:{x:61,z:1,eye:-6.2,yaw:Math.PI,pitch:.12,fov:65},boulevard:{x:63,z:89,eye:-6.2,yaw:.1,pitch:.04,fov:65}});
Object.assign(views,{crash:{x:86,z:217,eye:-6.08,yaw:Math.PI/2,pitch:0,fov:65},mart:{x:211,z:461,eye:-6.08,yaw:-2.25,pitch:.08,fov:65},park:{x:97,z:154,eye:-6.08,yaw:.2,pitch:.02,fov:65},route:{x:86,z:308,eye:-6.08,yaw:.45,pitch:0,fov:65}});
Object.assign(views,{mart1:{x:183,z:432.5,eye:-6.04,yaw:-Math.PI/2,pitch:-.1,fov:68},foodhall:{x:169,z:416,eye:-10.44,yaw:-1.9,pitch:.03,fov:68},deli:{x:137,z:363.3,eye:-10.44,yaw:-2.15,pitch:0,fov:65},grocery:{x:133.7,z:394.4,eye:-10.44,yaw:-Math.PI/2,pitch:.02,fov:65}});
Object.assign(views,world.apartment.photoViews,{cabinet:{x:14.1,z:9.1,eye:1.5,yaw:.15,pitch:0,fov:65}});
const roomView=(x,z,yaw,pitch=-.16)=>({x:15.93+(x-15.93)*1.12,z:10.8+(z-10.8)*1.12,eye:1.5,yaw,pitch,fov:75});
Object.assign(views,{master:roomView(8.6,-.6,-2.12),gaming:roomView(11.9,-.6,-1.17),dressing:roomView(7.7,7.9,2.15)});
Object.assign(views,{sofa:roomView(8.5,3.8,2.3,-.2),dining:roomView(10.5,3.4,.68,-.18),bed:roomView(8.5,-1.7,-2.52,-.23)});
Object.assign(views,{commonEntry:{x:16.75,z:10.8,yaw:0,pitch:-.04,eye:1.5,fov:44},commonCorridor:{x:17.4,z:18,yaw:-Math.PI/2,pitch:-.04,eye:1.5,fov:85}});
const name=process.argv[2]||'start',ref=views[name];if(!ref)throw new Error('Unknown view');
const camera=new T.PerspectiveCamera(ref.fov,W/H,.06,180);camera.rotation.order='YXZ';camera.position.set(ref.x,ref.eye,ref.z);camera.rotation.set(ref.pitch,-ref.yaw-Math.PI/2,0,'YXZ');
if(['hallway','combat','zombie'].includes(name)){world.homeDoor.setOpen(true);world.homeDoor.update(1);const e=world.encounter.zombie;e.root.visible=true;e.root.position.set(18.35,0,8.33);e.root.rotation.y=-Math.PI/2;e.pose(0,false,0,false,0);}
if(name==='cabinet'){world.encounter.cabinet.opened=1;world.encounter.cabinet.setOpen(true);world.encounter.cabinet.update(0,false);}
if(name==='combat'){world.scene.add(camera);world.encounter.attachWeapon(camera);world.encounter.weaponPose(true,-1,0);}
if(['lobby','lift'].includes(name)){world.elevator.state.opened=1;world.elevator.state.targetOpen=1;world.elevator.update(0,{level:'floor4',x:13,z:25});}
if(name==='courtyard'){Object.assign(world.elevator.state,{level:'floor1',target:'floor1',opened:1,targetOpen:1,entryOpen:1,entryTarget:1});world.elevator.cabin.position.y=-7.6;world.elevator.update(0,{level:'floor1',x:17,z:25});}
if(name==='streetdriver'){world.parking.vehicle.root.position.set(60,-3.8,96);world.parking.vehicle.root.rotation.y=Math.PI;}
for(const a of world.streets.infected){a.zombie.pose(1,true,0,false,0);a.zombie.root.position.y=.12;}
if(!['street','front','ramp','worker','streetdriver','exit','cafe','gs25','boulevard','parking','driver','car','courtyard','crash','mart','park','route'].includes(name))camera.layers.enable(1);
if(ref.eye<0)camera.layers.enable(3);
if(['mart1','foodhall','deli','grocery'].includes(name)){camera.layers.disable(1);camera.layers.enable(2);}else camera.layers.disable(2);
camera.updateMatrixWorld();world.scene.updateMatrixWorld(true);
const pixels=Buffer.alloc(W*H*4),depth=new Float32Array(W*H);depth.fill(-Infinity);
for(let i=0;i<W*H;i++){pixels[i*4]=90;pixels[i*4+1]=114;pixels[i*4+2]=137;pixels[i*4+3]=255;}
const light=new T.Vector3(.65,1,.35).normalize();let count=0;
function clip(points){let out=[];for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length],ai=a.z<=-.07,bi=b.z<=-.07;if(ai)out.push(a);if(ai!==bi){const t=(-.07-a.z)/(b.z-a.z);const p=a.clone().lerp(b,t);p.uv=a.uv.clone().lerp(b.uv,t);out.push(p);}}return out;}
const edge=(a,b,x,y)=>(x-a.x)*(b.y-a.y)-(y-a.y)*(b.x-a.x);
const texCache=new Map();
function pixelsOf(map){if(!map?.image?.getContext)return null;if(!texCache.has(map)){const c=map.image;texCache.set(map,{data:c.getContext('2d').getImageData(0,0,c.width,c.height).data,width:c.width,height:c.height,rx:map.repeat.x,ry:map.repeat.y,flipY:map.flipY});}return texCache.get(map);}
function raster(a,b,c,color,material){
  const tex=pixelsOf(material.map),base=[color>>16,(color>>8)&255,color&255],alpha=material.transparent?material.opacity:1;
  const area=edge(a,b,c.x,c.y);if(Math.abs(area)<.1)return;
  const minX=Math.max(0,Math.floor(Math.min(a.x,b.x,c.x))),maxX=Math.min(W-1,Math.ceil(Math.max(a.x,b.x,c.x))),minY=Math.max(0,Math.floor(Math.min(a.y,b.y,c.y))),maxY=Math.min(H-1,Math.ceil(Math.max(a.y,b.y,c.y)));
  for(let y=minY;y<=maxY;y++)for(let x=minX;x<=maxX;x++){
    const u=edge(b,c,x+.5,y+.5)/area,v=edge(c,a,x+.5,y+.5)/area,w=1-u-v;if(u<0||v<0||w<0)continue;
    const d=u*a.d+v*b.d+w*c.d,i=y*W+x;if(d<=depth[i])continue;
    const rgb=base.slice();let al=alpha;
    if(tex){const tu=(u*a.u*a.d+v*b.u*b.d+w*c.u*c.d)/d*tex.rx,tv=(u*a.v*a.d+v*b.v*b.d+w*c.v*c.d)/d*tex.ry,iy=tex.flipY?1-tv:tv;const tx=Math.floor(((tu%1)+1)%1*tex.width),ty=Math.floor(((iy%1)+1)%1*tex.height),q=(ty*tex.width+tx)*4;for(let k=0;k<3;k++)rgb[k]=base[k]*tex.data[q+k]/255;al*=tex.data[q+3]/255;}
    if(al<material.alphaTest)continue;if(!material.transparent)depth[i]=d;
    const fog=1-Math.exp(-Math.pow(1/d*.003,2)),p=i*4;for(let k=0;k<3;k++){const c=rgb[k]*(1-fog)+[133,151,162][k]*fog;pixels[p+k]=pixels[p+k]*(1-al)+c*al;}
  }
}
const meshes=[];world.scene.traverse(m=>{if(m.isMesh)meshes.push(m);});meshes.sort((a,b)=>Number(!!a.material.transparent)-Number(!!b.material.transparent));
meshes.forEach(mesh=>{
  if(!mesh.isMesh||mesh.name==='dawn-sky'||!mesh.layers.test(camera.layers))return;for(let p=mesh;p;p=p.parent)if(!p.visible)return;const geo=mesh.geometry,pos=geo.attributes.position,idx=geo.index;
  const matrices=[];
  if(mesh.isInstancedMesh){for(let i=0;i<mesh.count;i++){const inst=new T.Matrix4();mesh.getMatrixAt(i,inst);matrices.push(new T.Matrix4().multiplyMatrices(camera.matrixWorldInverse,mesh.matrixWorld).multiply(inst));}}
  else matrices.push(new T.Matrix4().multiplyMatrices(camera.matrixWorldInverse,mesh.matrixWorld));
  for(const matrix of matrices){
  for(let n=0;n<(idx?idx.count:pos.count);n+=3){
    const m=Array.isArray(mesh.material)?mesh.material[(geo.groups.find(g=>n>=g.start&&n<g.start+g.count)||{}).materialIndex||0]:mesh.material;

    const a=new T.Vector3().fromBufferAttribute(pos,idx?idx.getX(n):n).applyMatrix4(matrix),b=new T.Vector3().fromBufferAttribute(pos,idx?idx.getX(n+1):n+1).applyMatrix4(matrix),c=new T.Vector3().fromBufferAttribute(pos,idx?idx.getX(n+2):n+2).applyMatrix4(matrix);
    const uv=geo.attributes.uv;for(const [vtx,j] of [[a,0],[b,1],[c,2]]){const ii=idx?idx.getX(n+j):n+j;vtx.uv=uv?new T.Vector2(uv.getX(ii),uv.getY(ii)):new T.Vector2();}
    const normal=b.clone().sub(a).cross(c.clone().sub(a)).normalize(),facing=normal.dot(a.clone().negate());if(m.side===T.FrontSide&&facing<0||m.side===T.BackSide&&facing>0)continue;
    const poly=clip([a,b,c]);if(poly.length<3)continue;
    const worldNormal=normal.clone().transformDirection(camera.matrixWorld),factor=m.isMeshBasicMaterial ? .8 : .55+.45*Math.max(0,worldNormal.dot(light));
    const col=m.color.clone().multiplyScalar(factor);if(mesh.isInstancedMesh&&mesh.instanceColor){const c=new T.Color();mesh.getColorAt(matrices.indexOf(matrix),c);col.multiply(c);}
    const color=col.getHex(T.SRGBColorSpace),points=poly.map(v=>{const p=v.clone().applyMatrix4(camera.projectionMatrix);return {x:(p.x+1)*W/2,y:(1-p.y)*H/2,d:1/-v.z,u:v.uv.x,v:v.uv.y};});
    for(let j=1;j<points.length-1;j++){raster(points[0],points[j],points[j+1],color,m);count++;}
  }}
});
const table=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1;table[n]=c>>>0;}
function chunk(type,data){const t=Buffer.from(type),size=Buffer.alloc(4);size.writeUInt32BE(data.length);const body=Buffer.concat([t,data]);let c=0xffffffff;for(const b of body)c=table[(c^b)&255]^(c>>>8);const crc=Buffer.alloc(4);crc.writeUInt32BE((c^0xffffffff)>>>0);return Buffer.concat([size,body,crc]);}
const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(W,0);ihdr.writeUInt32BE(H,4);ihdr[8]=8;ihdr[9]=6;
const raw=Buffer.alloc((W*4+1)*H);for(let y=0;y<H;y++)pixels.copy(raw,y*(W*4+1)+1,y*W*4,(y+1)*W*4);
fs.writeFileSync(__dirname+'/material-'+name+'.png',Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',ihdr),chunk('IDAT',zlib.deflateSync(raw)),chunk('IEND',Buffer.alloc(0))]));
console.log('Offline material preview:',name,count,'triangles');

})();
