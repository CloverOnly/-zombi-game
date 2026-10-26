const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {world,THREE:T}=require('./runtime.cjs')(),scope={window:{},console};
vm.runInNewContext(fs.readFileSync(__dirname+'/../realistic-furniture.js','utf8'),scope);
module.exports=async function install(textures=false){
  for(const id of scope.window.PoyuFurniture.ids){
    const gltf=await require('./load-furniture.cjs')(id,textures);
    assert(scope.window.PoyuFurniture.apply(T,world.apartment.group,id,gltf.scene),id);
  }
  world.scene.updateMatrixWorld(true);
  const imported=[];world.scene.traverse(o=>{if(o.userData.externalFurniture)imported.push(o);});
  assert.equal(imported.length,5);
  assert(!world.scene.getObjectByName('api-Sofa_01'),'Original sofa stays visible');
  assert(world.scene.getObjectByName('living-sofa').children.every(o=>o.visible),'Original sofa is visible');
  assert(!world.scene.getObjectByName('living-coffee-table'),'Living room table removed');
  for(const object of imported){
    const b=new T.Box3().setFromObject(object);assert(b.min.y>=-.001,object.name+' above floor');
    assert(object.children.length>0);object.traverse(o=>{if(o.isMesh)assert(o.layers.isEnabled(1));});
  }
  const bed=world.scene.getObjectByName('api-GothicBed_01'),box=new T.Box3().setFromObject(bed),collider=world.colliders.find(c=>c.id==='bed');
  assert(box.min.x>=collider.minX&&box.max.x<=collider.maxX);
  assert(box.min.z>=collider.minZ&&box.max.z<=collider.maxZ);
  for(const d of world.interiorDoors)assert(world.isWalkable(d.x,d.z,.25),d.id+' passage');
  for(const item of world.collectibles){const at=world.itemsById[item.id];assert(Number.isFinite(at.x)&&Number.isFinite(at.z));}
  return {world,imported};
};
if(require.main===module)module.exports().then(({imported})=>console.log('API furniture passed: '+imported.length+' fitted models, bedding alignment, interior render layer and all door passages.')).catch(e=>{console.error(e.message);process.exitCode=1;});
