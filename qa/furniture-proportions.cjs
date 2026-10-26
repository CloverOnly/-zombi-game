// Regression coverage for detached bedding and resized usable doorways.
const assert=require('node:assert/strict');
const {world,THREE:T}=require('./runtime.cjs')();
world.scene.updateMatrixWorld(true);
const bed=world.scene.getObjectByName('master-bed');
const bounds=new T.Box3().setFromObject(bed);
const blocker=world.colliders.find(c=>c.id==='bed');
assert(bounds.min.x>=blocker.minX && bounds.max.x<=blocker.maxX);
assert(bounds.min.z>=blocker.minZ && bounds.max.z<=blocker.maxZ);
assert.equal(world.interior.details.children.length,0,'No detached bedding or sofa remains in the unscaled scene');
for(const door of world.interiorDoors){
  const expected=door.id==='balcony'?.95:door.id.includes('bathroom')?.85:.90;
  assert(Math.abs(door.width-expected)<1e-6,door.id+' width');
  for(const offset of[-.35,-.2,0,.2,.35])assert(world.isWalkable(door.x+(door.axis==='x'?offset:0),door.z+(door.axis==='z'?offset:0),.25),door.id+' passage');
  door.setOpen(false);door.update(1);
  assert(!world.isWalkable(door.x,door.z,.25),door.id+' closed collision');
  door.reset();
}
assert(world.interiorDoors.find(d=>d.id==='ensuite-bathroom').pivot.rotation.y>0,'Ensuite opens into bathroom');
for(const room of world.rooms.filter(r=>r.entry))assert(world.isWalkable(room.entry.x,room.entry.z,.25),room.id+' entry');
assert(!world.colliders.some(c=>c.id==='coffee-table'),'Removed table no longer blocks movement');
for(const [id,width,depth] of[['gaming-desk',1.8,.65],['dining-table',.9,1.6]]){
  const c=world.colliders.find(c=>c.id===id);
  assert(Math.abs(c.maxX-c.minX-width)<1e-6,id+' width');
  assert(Math.abs(c.maxZ-c.minZ-depth)<1e-6,id+' depth');
}
console.log('Furniture alignment, door dimensions/open-close passage, and all room entries passed.');
