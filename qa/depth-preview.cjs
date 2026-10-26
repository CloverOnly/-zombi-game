// Geometry and depth preview for checking room clearances without a browser.
const fs=require('fs'),vm=require('vm'),zlib=require('zlib'),T=require('../three.min.js');
const no=()=>{},gradient=()=>({addColorStop:no});
const ctx=new Proxy({createLinearGradient:gradient,createRadialGradient:gradient},{get:(o,k)=>o[k]??no});
const document={createElement:()=>({width:0,height:0,getContext:()=>ctx})},window={};
for(const name of ['surfaces','street-details','exterior','interior-polish','rooms','zombie','elevator','parking','mart-route','streets','driving','street-ai','hallway','mart-interior','world'])vm.runInNewContext(fs.readFileSync(__dirname+'/../'+name+'.js','utf8'),{window,document,Math,console});
const world=window.createPoyuWorld(T,{capabilities:{getMaxAnisotropy:()=>8}}),W=960,H=540;
const views={start:world.referenceView,living:{x:9.2,z:3.8,eye:1.4,yaw:.45,pitch:0,fov:68},kitchen:{x:13.5,z:4.4,eye:1.4,yaw:.65,pitch:0,fov:68},foyer:{x:13.3,z:8.4,eye:1.4,yaw:0,pitch:0,fov:68},outside:{x:15.5,z:2.6,eye:1.4,yaw:0,pitch:-.18,fov:68},small:{x:7.9,z:-.8,eye:1.4,yaw:-2.0,pitch:-.05,fov:68},study:{x:11.5,z:-.8,eye:1.4,yaw:-1.6,pitch:-.05,fov:68},bathroom:{x:14.55,z:-1.35,eye:1.4,yaw:-1.45,pitch:-.15,fov:68},hallway:{x:16.60,z:8.33,eye:1.4,yaw:0,pitch:0,fov:68},cabinet:{x:13.2,z:8.25,eye:1.4,yaw:Math.PI/2,pitch:-.38,fov:68},combat:{x:16.60,z:8.33,eye:1.4,yaw:0,pitch:0,fov:68}};
Object.assign(views,{lobby:{x:15.3,z:25,eye:1.4,yaw:Math.PI,pitch:0,fov:68},longhall:{x:18.1,z:11.8,eye:1.4,yaw:Math.PI/2,pitch:0,fov:68},lift:{x:9.5,z:24.8,eye:1.4,yaw:Math.PI,pitch:-.07,fov:68},courtyard:{x:17,z:24.8,eye:-6.2,yaw:.4,pitch:0,fov:68},zombie:{x:16.95,z:8.33,eye:1.45,yaw:0,pitch:-.04,fov:50}});
Object.assign(views,{parking:{x:16.8,z:24.8,eye:-2.4,yaw:.36,pitch:0,fov:68},driver:{x:world.parking.seat.x,z:world.parking.seat.z,eye:-2.84,yaw:0,pitch:-.04,fov:68},car:{x:23.5,z:29.8,eye:-2.4,yaw:.48,pitch:-.12,fov:60}});
Object.assign(views,{street:{x:60,z:98,eye:-6.2,yaw:-Math.PI/2,pitch:0,fov:68},front:{x:61,z:48,eye:-6.2,yaw:Math.PI,pitch:.12,fov:68},ramp:{x:47,z:57,eye:-2.60,yaw:Math.PI/2,pitch:-.15,fov:68},worker:{x:61,z:99,eye:-6.2,yaw:-.5,pitch:-.04,fov:54},streetdriver:{x:59.664,z:96.376,eye:-6.64,yaw:-Math.PI/2,pitch:0,fov:68}});
const name=process.argv[2]||'start',ref=views[name];if(!ref)throw new Error('Unknown view');
const camera=new T.PerspectiveCamera(ref.fov,W/H,.06,180);camera.rotation.order='YXZ';camera.position.set(ref.x,ref.eye,ref.z);camera.rotation.set(ref.pitch,-ref.yaw-Math.PI/2,0,'YXZ');
if(['hallway','combat','zombie'].includes(name)){world.homeDoor.setOpen(true);world.homeDoor.update(1);const e=world.encounter.zombie;e.root.visible=true;e.root.position.set(18.35,0,8.33);e.root.rotation.y=-Math.PI/2;e.pose(0,false,0,false,0);}
if(name==='cabinet'){world.encounter.cabinet.opened=1;world.encounter.cabinet.setOpen(true);world.encounter.cabinet.update(0,false);}
if(name==='combat'){world.scene.add(camera);world.encounter.attachWeapon(camera);world.encounter.weaponPose(true,-1,0);}
if(['lobby','lift'].includes(name)){world.elevator.state.opened=1;world.elevator.state.targetOpen=1;world.elevator.update(0,{level:'floor4',x:13,z:25});}
if(name==='courtyard'){Object.assign(world.elevator.state,{level:'floor1',target:'floor1',opened:1,targetOpen:1,entryOpen:1,entryTarget:1});world.elevator.cabin.position.y=-7.6;world.elevator.update(0,{level:'floor1',x:17,z:25});}
if(name==='streetdriver'){world.parking.vehicle.root.position.set(60,-3.8,96);world.parking.vehicle.root.rotation.y=Math.PI;}
for(const a of world.streets.infected){a.zombie.pose(1,true,0,false,0);a.zombie.root.position.y=.12;}
if(!['street','front','ramp','worker','streetdriver','exit','cafe','gs25','boulevard','parking','driver','car','courtyard'].includes(name))camera.layers.enable(1);
camera.updateMatrixWorld();world.scene.updateMatrixWorld(true);
const pixels=Buffer.alloc(W*H*4),depth=new Float32Array(W*H);depth.fill(-Infinity);
for(let i=0;i<W*H;i++){pixels[i*4]=90;pixels[i*4+1]=114;pixels[i*4+2]=137;pixels[i*4+3]=255;}
const light=new T.Vector3(.65,1,.35).normalize();let count=0;
function clip(points){let out=[];for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length],ai=a.z<=-.07,bi=b.z<=-.07;if(ai)out.push(a);if(ai!==bi){const t=(-.07-a.z)/(b.z-a.z);out.push(a.clone().lerp(b,t));}}return out;}
const edge=(a,b,x,y)=>(x-a.x)*(b.y-a.y)-(y-a.y)*(b.x-a.x);
function raster(a,b,c,color){
  const area=edge(a,b,c.x,c.y);if(Math.abs(area)<.1)return;
  const minX=Math.max(0,Math.floor(Math.min(a.x,b.x,c.x))),maxX=Math.min(W-1,Math.ceil(Math.max(a.x,b.x,c.x))),minY=Math.max(0,Math.floor(Math.min(a.y,b.y,c.y))),maxY=Math.min(H-1,Math.ceil(Math.max(a.y,b.y,c.y)));
  for(let y=minY;y<=maxY;y++)for(let x=minX;x<=maxX;x++){
    const u=edge(b,c,x+.5,y+.5)/area,v=edge(c,a,x+.5,y+.5)/area,w=1-u-v;if(u<0||v<0||w<0)continue;
    const d=u*a.d+v*b.d+w*c.d,i=y*W+x;if(d<=depth[i])continue;depth[i]=d;
    const p=i*4;pixels[p]=color>>16;pixels[p+1]=(color>>8)&255;pixels[p+2]=color&255;
  }
}
world.scene.traverse(mesh=>{
  if(!mesh.isMesh||mesh.name==='dawn-sky'||!mesh.layers.test(camera.layers))return;for(let p=mesh;p;p=p.parent)if(!p.visible)return;const geo=mesh.geometry,pos=geo.attributes.position,idx=geo.index;
  const matrices=[];
  if(mesh.isInstancedMesh){for(let i=0;i<mesh.count;i++){const inst=new T.Matrix4();mesh.getMatrixAt(i,inst);matrices.push(new T.Matrix4().multiplyMatrices(camera.matrixWorldInverse,mesh.matrixWorld).multiply(inst));}}
  else matrices.push(new T.Matrix4().multiplyMatrices(camera.matrixWorldInverse,mesh.matrixWorld));
  for(const matrix of matrices){
  for(let n=0;n<(idx?idx.count:pos.count);n+=3){
    const m=Array.isArray(mesh.material)?mesh.material[(geo.groups.find(g=>n>=g.start&&n<g.start+g.count)||{}).materialIndex||0]:mesh.material;
    if(m.transparent)continue;
    const a=new T.Vector3().fromBufferAttribute(pos,idx?idx.getX(n):n).applyMatrix4(matrix),b=new T.Vector3().fromBufferAttribute(pos,idx?idx.getX(n+1):n+1).applyMatrix4(matrix),c=new T.Vector3().fromBufferAttribute(pos,idx?idx.getX(n+2):n+2).applyMatrix4(matrix);
    const normal=b.clone().sub(a).cross(c.clone().sub(a)).normalize(),facing=normal.dot(a.clone().negate());if(m.side===T.FrontSide&&facing<0||m.side===T.BackSide&&facing>0)continue;
    const poly=clip([a,b,c]);if(poly.length<3)continue;
    const worldNormal=normal.clone().transformDirection(camera.matrixWorld),factor=m.isMeshBasicMaterial ? .8 : .38+.5*Math.max(0,worldNormal.dot(light));
    const col=m.color.clone().multiplyScalar(factor);if(m.isMeshBasicMaterial&&m.map)col.setHex(0x43526b);
    const color=col.getHex(T.SRGBColorSpace),points=poly.map(v=>{const p=v.clone().applyMatrix4(camera.projectionMatrix);return {x:(p.x+1)*W/2,y:(1-p.y)*H/2,d:1/-v.z};});
    for(let j=1;j<points.length-1;j++){raster(points[0],points[j],points[j+1],color);count++;}
  }}
});
const table=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1;table[n]=c>>>0;}
function chunk(type,data){const t=Buffer.from(type),size=Buffer.alloc(4);size.writeUInt32BE(data.length);const body=Buffer.concat([t,data]);let c=0xffffffff;for(const b of body)c=table[(c^b)&255]^(c>>>8);const crc=Buffer.alloc(4);crc.writeUInt32BE((c^0xffffffff)>>>0);return Buffer.concat([size,body,crc]);}
const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(W,0);ihdr.writeUInt32BE(H,4);ihdr[8]=8;ihdr[9]=6;
const raw=Buffer.alloc((W*4+1)*H);for(let y=0;y<H;y++)pixels.copy(raw,y*(W*4+1)+1,y*W*4,(y+1)*W*4);
fs.writeFileSync(__dirname+'/depth-'+name+'.png',Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',ihdr),chunk('IDAT',zlib.deflateSync(raw)),chunk('IEND',Buffer.alloc(0))]));
console.log('Depth preview:',name,count,'triangles');
