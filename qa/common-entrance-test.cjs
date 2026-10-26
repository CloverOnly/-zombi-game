const assert=require('node:assert/strict');
const {world:w,THREE:T}=require('./runtime.cjs')();
w.scene.updateMatrixWorld(true);
const meshes=[];w.scene.traverse(o=>{if(o.isMesh)meshes.push(o);});
for(const [x,expected]of[[26.1,'secondary-elevator-leaf'],[28.7,'active-elevator-leaf']]){
  const ray=new T.Raycaster(new T.Vector3(x+.2,1.4,17),new T.Vector3(0,0,1));ray.layers.enable(1);
  assert.equal(ray.intersectObjects(meshes,false)[0]?.object.name,expected,'Lift is visible after turning right');
}
assert(w.scene.getObjectByName('hall-frosted-window'));
assert.equal(w.scene.getObjectsByProperty('name','common-계단실').length,2);
assert(w.scene.getObjectByName('lobby-extinguisher-base'));
assert(!w.containsFloor(12,25,'floor4'),'Obsolete upper lift lobby removed');
const call=w.elevator.getTargets({level:'floor4',x:27.25,z:19}).find(t=>t.id==='liftCall');
assert(Math.hypot(call.x-27.25,call.z-19)<call.range,'Call button can be reached from the lobby');
const step=.20,start=[Math.round(w.homeDoor.approach.x/step),Math.round(w.homeDoor.approach.z/step)],queue=[start],seen=new Set([start.join(',')]);
w.homeDoor.setOpen(true);w.homeDoor.update(1);w.elevator.interact('liftCall',{level:'floor4',x:27.25,z:19},false);w.elevator.update(1,{level:'floor4',x:27.25,z:19});
for(let i=0;i<queue.length;i++){const [x,z]=queue[i];for(const [dx,dz]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,nz=z+dz,key=nx+','+nz;if(!seen.has(key)&&w.isWalkable(nx*step,nz*step,.25,'floor4')){seen.add(key);queue.push([nx,nz]);}}}
assert.equal(w.encounter.neighbours.map(n=>n.number).join(','),'601,603,604,605,606');
const byUnit=Object.fromEntries(w.encounter.neighbours.map(n=>[n.number,n]));
assert(byUnit['601'].z>w.homeDoor.point.z&&Math.abs(byUnit['601'].x-w.homeDoor.point.x)<.2,'601 shares the end wall with 602');
assert(byUnit['603'].z<w.homeDoor.point.z&&byUnit['604'].z<w.homeDoor.point.z,'603 and 604 line the left side');
assert(byUnit['605'].x>35&&byUnit['606'].x>35,'605 and 606 are at the far end');
assert(byUnit['601'].z-w.homeDoor.point.z<5,'601 is directly beside 602');
assert(call.z>18,'Lifts are reached by turning right into a side alcove');
assert.equal(w.elevator.levels.floor4.number,6,'Starting landing is level 6');
assert.match(w.elevator.levels.floor4.name,/602호/,'Starting apartment is 602');
assert.equal(w.elevator.building.parkingFloors.join(','),'1,2,3');
assert.equal(w.elevator.building.residentialFloors.join(','),'4,5,6,7,8,9,10');
for(const floor of w.elevator.building.residentialFloors)assert.equal(w.elevator.building.units(floor).join(','),Array.from({length:6},(_,i)=>floor*100+i+1).join(','));
for(const [name,x,z]of[['601',17.3,15.4],['stair by 601',18.7,15.4],['603',24,9.6],['604',29,9.6],['605',34.7,10.5],['far right turn',34,14.5],['606',34.7,16.2],['lift turn',27.5,15.5],['call',27.25,19],['cabin',28.7,21.55],['stair opposite 606',33.3,16.2]])assert(queue.some(([a,b])=>Math.hypot(a*step-x,b*step-z)<.3),name+' reachable from 602');
assert(!w.encounter.neighbours.some(n=>n.number==='606'&&n.z<=13.2),'606 is beyond the right turn');
assert(w.hasWallBetween(34.7,10.5,17.3,15.4,'floor4'),'601 is hidden from the 605 end of the corridor');
assert(!w.hasWallBetween(18,14,17.3,15.4,'floor4'),'601 is visible after turning right by 602');
const camera=new T.PerspectiveCamera();w.updatePresentation({level:'floor4',x:17,z:10.8},camera);assert(!camera.layers.isEnabled(3));w.updatePresentation({level:'floor1',x:60,z:20},camera);assert(camera.layers.isEnabled(3));
console.log('Common entrance passed: paired lift sightlines, photo details, all neighbour/corridor/cabin routes and facade separation.');
