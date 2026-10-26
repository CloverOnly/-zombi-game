const fs=require('node:fs'),path=require('node:path');
const base=path.resolve(__dirname,'..'),vendor=path.join(base,'assets/vendor'),dir=path.join(base,'assets/furniture');
function globalSource(file,exported){
  return '(function(THREE){\n'+fs.readFileSync(path.join(vendor,file),'utf8')
    .replace(/import\s*\{([\s\S]*?)\}\s*from 'three';/,'const {$1}=THREE;')
    .replace("import { toTrianglesDrawMode } from '../utils/BufferGeometryUtils.js';",'const {toTrianglesDrawMode}=window.PoyuGeometryUtils;')
    .replace(/export function /g,'function ')
    .replace(/export\s*\{[\s\S]*?\};?\s*$/,'window.'+exported+';')+'\n})(window.THREE);\n';
}
fs.writeFileSync(path.join(vendor,'gltf-loader.js'),'// Three.js r154, MIT; see ../../THREE-LICENSE.txt. Adapted only to classic script exports.\n'+globalSource('BufferGeometryUtils.module.js','PoyuGeometryUtils={toTrianglesDrawMode}')+globalSource('GLTFLoader.module.js','PoyuGLTFLoader=GLTFLoader'));
const manifest=JSON.parse(fs.readFileSync(path.join(dir,'sources.json'),'utf8').replace(/^\uFEFF/,''));
for(const entry of manifest){
  const folder=path.join(dir,entry.id),gltf=JSON.parse(fs.readFileSync(path.join(folder,'model.gltf'),'utf8'));
  for(const item of [...gltf.buffers,...gltf.images]){
    const extension=path.extname(item.uri).toLowerCase(),mime=extension==='.jpg'?'image/jpeg':extension==='.png'?'image/png':'application/octet-stream';
    item.uri=`data:${mime};base64,${fs.readFileSync(path.join(folder,item.uri)).toString('base64')}`;
  }
  fs.writeFileSync(path.join(dir,entry.id+'.js'),`window.PoyuFurnitureData=window.PoyuFurnitureData||{};window.PoyuFurnitureData[${JSON.stringify(entry.id)}]=${JSON.stringify(gltf)};\n`);
  console.log(entry.id,Math.round(fs.statSync(path.join(dir,entry.id+'.js')).size/1024)+' KiB');
}
