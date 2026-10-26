// Geometry-only preview used to check the reference camera composition without a browser.
const fs=require('fs'),vm=require('vm'),T=require('../three.min.js');
const no=()=>{},gradient=()=>({addColorStop:no});
const ctx=new Proxy({createLinearGradient:gradient,createRadialGradient:gradient},{get:(o,k)=>o[k]??no});
const document={createElement:()=>({width:0,height:0,getContext:()=>ctx})},window={};
vm.runInNewContext(fs.readFileSync(__dirname+'/../world.js','utf8'),{window,document,Math,console});
const world=window.createPoyuWorld(T,{capabilities:{getMaxAnisotropy:()=>8}}),W=1000,H=563;
const ref=world.referenceView,camera=new T.PerspectiveCamera(ref.fov,W/H,.06,60);camera.rotation.order='YXZ';camera.position.set(ref.x,ref.eye,ref.z);camera.rotation.set(ref.pitch,-ref.yaw-Math.PI/2,0,'YXZ');camera.updateMatrixWorld();world.scene.updateMatrixWorld(true);
const triangles=[],light=new T.Vector3(.35,.8,.4).normalize();
function clip(points){let out=[];for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length],ai=a.z<=-.07,bi=b.z<=-.07;if(ai)out.push(a);if(ai!==bi){const t=(-.07-a.z)/(b.z-a.z);out.push(a.clone().lerp(b,t));}}return out;}
world.scene.traverse(mesh=>{
  if(!mesh.isMesh||!mesh.visible)return;const geo=mesh.geometry,pos=geo.attributes.position,idx=geo.index;
  const matrix=new T.Matrix4().multiplyMatrices(camera.matrixWorldInverse,mesh.matrixWorld);
  for(let n=0;n<(idx?idx.count:pos.count);n+=3){
    const m=Array.isArray(mesh.material)?mesh.material[(geo.groups.find(g=>n>=g.start&&n<g.start+g.count)||{}).materialIndex||0]:mesh.material;
    if(m.transparent)continue;
    const a=new T.Vector3().fromBufferAttribute(pos,idx?idx.getX(n):n).applyMatrix4(matrix),b=new T.Vector3().fromBufferAttribute(pos,idx?idx.getX(n+1):n+1).applyMatrix4(matrix),c=new T.Vector3().fromBufferAttribute(pos,idx?idx.getX(n+2):n+2).applyMatrix4(matrix);
    const normal=b.clone().sub(a).cross(c.clone().sub(a)).normalize();if(m.side!==T.DoubleSide&&normal.dot(a.clone().negate())<0)continue;
    const poly=clip([a,b,c]);if(poly.length<3)continue;
    const color=m.color.clone(),factor=m.isMeshBasicMaterial?.75:.39+.52*Math.abs(normal.dot(light));color.multiplyScalar(factor);
    if(m.isMeshBasicMaterial&&m.map)color.setHex(0x35506a);
    const rgb=color.getStyle(),points=poly.map(v=>{const p=v.clone().applyMatrix4(camera.projectionMatrix);return [Math.round((p.x+1)*W/2),Math.round((1-p.y)*H/2)];});
    if(points.every(p=>p[0]<0)||points.every(p=>p[0]>W)||points.every(p=>p[1]<0)||points.every(p=>p[1]>H))continue;
    triangles.push({points,color:rgb,depth:(a.z+b.z+c.z)/3});
  }
});
triangles.sort((a,b)=>a.depth-b.depth);fs.writeFileSync(__dirname+'/layout-preview.json',JSON.stringify({width:W,height:H,triangles}));
console.log('Geometry preview:',triangles.length,'triangles');
