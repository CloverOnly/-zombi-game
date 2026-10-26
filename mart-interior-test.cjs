const assert=require('assert'),runtime=require('./qa/runtime.cjs');const {world,player,chapter,advance,THREE:T}=runtime(),mart=world.mart;
world.collectibles.forEach(i=>i.got=true);chapter.reset({prepared:true,martCheckpoint:true});
assert.equal(player.level,'mart1');assert(!world.parking.state.inCar);assert(world.isWalkable(player.x,player.z,.25,player.level));assert(mart.products.length>4000,'stock is individual 3D products rather than a wall image');
const cam=new T.PerspectiveCamera();world.updatePresentation(player,cam,.1);assert(cam.layers.isEnabled(2));assert(!cam.layers.isEnabled(1));assert(mart.ambient.visible);
function walkTo(x,z){
  for(let n=0;n<3000;n++){
    const dx=x-player.x,dz=z-player.z,d=Math.hypot(dx,dz);if(d<.05)return;
    const step=Math.min(d,.08),nx=player.x+dx/d*step,nz=player.z+dz/d*step;
    assert(world.isWalkable(nx,nz,.25,player.level),`blocked walking to ${x},${z} at ${nx.toFixed(2)},${nz.toFixed(2)} (${player.level})`);
    player.x=nx;player.z=nz;chapter.update(.04);
  }assert.fail('walk timeout');
}
walkTo(180.5,429);assert(chapter.getTargets().some(t=>t.id==='martDown'));assert(chapter.interact('martDown'));assert(chapter.movementLocked);const top=player.floorY;let last=top,samples=0;
for(let t=0;t<4.4;t+=.04){chapter.update(.04);assert(player.floorY<=last+.00001,'continuous descent');last=player.floorY;samples++;}
assert(samples>100);assert.equal(player.level,'martB1');assert(Math.abs(player.floorY-(top-4.4))<.0001);assert(!chapter.movementLocked);assert(world.isWalkable(player.x,player.z,.25,'martB1'));
world.scene.updateMatrixWorld(true);const ray=new T.Raycaster(new T.Vector3(180.5,mart.levels.mart1.y+1,420),new T.Vector3(0,-1,0));ray.layers.enable(2);const rayMeshes=[];world.scene.traverse(o=>{if(o.isMesh)rayMeshes.push(o);});const hits=ray.intersectObjects(rayMeshes,false);assert(hits.length);assert(hits[0].point.y<mart.levels.mart1.y-.8,'terrain and the upper floor leave an actual opening for the descending belt');
assert(!world.isWalkable(132,391,.25,'martB1'),'shelves have actual collisions');assert(!world.isWalkable(180.5,418,.25,'martB1'),'travelator shaft cannot be walked through at basement height');
// Clear pedestrian routes connect every department, including both sides of racks.
walkTo(169.5,407.8);walkTo(169.5,383);walkTo(133.4,383);walkTo(133.4,391);assert(chapter.interact('mart-water'));
walkTo(133.4,383);walkTo(158.6,383);walkTo(158.6,391);assert(chapter.interact('mart-grocery'));
walkTo(158.6,383);walkTo(169.5,383);walkTo(169.5,395);walkTo(174,395);assert(chapter.interact('mart-fresh'));
walkTo(169.5,395);walkTo(169.5,367.5);walkTo(130,367.5);walkTo(130,361);assert(chapter.interact('mart-deli'));
walkTo(130,367.5);walkTo(169.5,367.5);walkTo(169.5,420);assert(chapter.interact('mart-checkout'));assert.equal(mart.state.inspected.size,5);
walkTo(175.5,420);walkTo(175.5,407);walkTo(186.5,407);walkTo(186.5,408.3);assert(chapter.interact('martUp'));advance(4.4);assert.equal(player.level,'mart1');
walkTo(183,432.5);assert(chapter.interact('martExit'));assert.equal(player.level,'floor1');assert(world.isWalkable(player.x,player.z,.25,'floor1'));assert(chapter.getTargets().some(t=>t.id==='martEntrance'));assert(chapter.interact('martEntrance'));assert.equal(player.level,'mart1','re-entry remains possible');
chapter.reset({prepared:true,martCheckpoint:true});assert.equal(mart.state.inspected.size,0);assert(!mart.state.travel);chapter.reset({prepared:true,streetCheckpoint:true});world.updatePresentation(player,cam,.1);assert(!cam.layers.isEnabled(2),'distant interior is hidden while driving');assert(!mart.ambient.visible);
console.log('Mart interior passed: direct checkpoint, render layers, continuous travelator descent/ascent, collision-safe access to five departments, inspection, exit/re-entry and reset. Products:',mart.products.length);
