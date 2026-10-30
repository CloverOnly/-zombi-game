/* Downloaded CC0 Innerscene sedan. Visual replacement only; physics/AI APIs stay on existing roots. */
window.installPoyuVehicles=async function(T,world){
  const status=window.poyuVehicleStatus={loaded:false,parked:0,driverDoor:false,errors:[]};
  try{
    const gltf=await new window.PoyuGLTFLoader().loadAsync('assets/models/vehicles/sedan/white-four-door-sedan.glb');
    gltf.scene.updateMatrixWorld(true);
    // Thin glass must also render correctly from an interior camera in the game's r154 renderer.
    gltf.scene.traverse(o=>{if(o.isMesh&&o.material.name==='glass.001'){o.material.transmission=0;o.material.transparent=true;o.material.opacity=.16;o.material.depthWrite=false;o.material.map=null;o.material.color.set(0xb3cad2);o.material.needsUpdate=true;}});
    const bounds=new T.Box3().setFromObject(gltf.scene),size=bounds.getSize(new T.Vector3()),scale=4.44/size.x;
    if(size.x<4||size.x>6)throw Error('Unexpected sedan model dimensions');
    const canonical=new T.Matrix4().makeRotationY(Math.PI/2).multiply(new T.Matrix4().makeScale(scale,scale,scale)).multiply(new T.Matrix4().makeTranslation(0,-bounds.min.y,0));
    const parts=[];
    gltf.scene.traverse(o=>{if(!o.isMesh)return;const g=o.geometry.clone().applyMatrix4(new T.Matrix4().multiplyMatrices(canonical,o.matrixWorld));g.computeBoundingBox();parts.push({name:o.name.replace(/_/g,' '),geometry:g,material:o.material});});
    // Merge source submeshes by material; all parked vehicles share these geometries via instancing.
    function merge(items){const buckets=new Map();for(const p of items){const key=p.material.uuid;if(!buckets.has(key))buckets.set(key,{material:p.material,items:[]});buckets.get(key).items.push(p.geometry);}return [...buckets.values()].map(b=>{
      const pos=[],nor=[],uv=[];for(const source of b.items){const g=source.index?source.toNonIndexed():source;for(const v of g.attributes.position.array)pos.push(v);for(const v of g.attributes.normal.array)nor.push(v);for(let i=0;i<g.attributes.position.count;i++)uv.push(g.attributes.uv?.getX(i)||0,g.attributes.uv?.getY(i)||0);if(g!==source)g.dispose();}
      const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('normal',new T.Float32BufferAttribute(nor,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.computeBoundingSphere();return {geometry:g,material:b.material};
    });}
    function parkedLOD(source,cell=.08){const p=source.attributes.position,n=source.attributes.normal,vertices=[],normals=[],uv=[],indices=[],cells=new Map(),remap=[];
      for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),key=[x,y,z].map(v=>Math.round(v/cell)).join(',');let id=cells.get(key);if(id===undefined){id=vertices.length/3;cells.set(key,id);vertices.push(x,y,z);normals.push(0,0,0);uv.push(source.attributes.uv?.getX(i)||0,source.attributes.uv?.getY(i)||0);}remap.push(id);for(let k=0;k<3;k++)normals[id*3+k]+=n.array[i*3+k];}
      for(let i=0;i<remap.length;i+=3){const a=remap[i],b=remap[i+1],c=remap[i+2];if(a!==b&&b!==c&&c!==a)indices.push(a,b,c);}
      const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(vertices,3));g.setAttribute('normal',new T.Float32BufferAttribute(normals,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(indices);g.normalizeNormals();g.computeBoundingSphere();return g;}
    const fleet=merge(parts).map(p=>{const geometry=parkedLOD(p.geometry);p.geometry.dispose();return {...p,geometry};}),roots=[];world.scene.updateMatrixWorld(true);world.scene.traverse(o=>{if(o.userData.vehicleVisual)roots.push(o);});
    status.parkedTriangles=fleet.reduce((sum,p)=>sum+p.geometry.index.count/3,0);
    const parked=roots.filter(o=>!o.userData.vehicleVisual.owned);
    const zones=new Map();for(const root of parked){let p=root,garage=false;for(;p;p=p.parent)if(p===world.parking.group)garage=true;const center=new T.Vector3().setFromMatrixPosition(root.matrixWorld),key=garage?'floor2':Math.floor(center.x/40)+':'+Math.floor(center.z/40);if(!zones.has(key))zones.set(key,{level:garage?'floor2':'floor1',cars:[]});zones.get(key).cars.push(root);}
    for(const zone of zones.values())for(const p of fleet){const inst=new T.InstancedMesh(p.geometry,p.material,zone.cars.length);inst.name='licensed-sedan-fleet';inst.userData.vehicleLevel=zone.level;inst.castShadow=true;inst.receiveShadow=true;
      zone.cars.forEach((root,i)=>{const s=root.userData.vehicleVisual.length/4.44;inst.setMatrixAt(i,root.matrixWorld.clone().multiply(new T.Matrix4().makeScale(s,s,s)));if(p.material.name==='paint')inst.setColorAt(i,new T.Color(root.userData.vehicleVisual.color));});inst.instanceMatrix.needsUpdate=true;inst.computeBoundingSphere();world.scene.add(inst);world.vehicleFleets.push(inst);}
    for(const root of parked)root.visible=false;status.parked=parked.length;
    const car=world.parking.vehicle,owned=car.root,door=car.door,wheel=car.steeringWheel;
    // Slice only the downloaded body's front driver panel. No replacement primitive is generated.
    function splitPanel(source){const g=source.index?source.toNonIndexed():source,pos=g.attributes.position,nor=g.attributes.normal,inside=[],outside=[];
      const planes=[v=>v[0]-.72,v=>v[1]-.27,v=>.90-v[1],v=>v[2]+.11,v=>1.17-v[2]];
      const emit=(poly,target)=>{for(let i=1;i<poly.length-1;i++)target.push(poly[0],poly[i],poly[i+1]);};
      for(let i=0;i<pos.count;i+=3){let poly=[0,1,2].map(j=>[...new T.Vector3().fromBufferAttribute(pos,i+j).toArray(),...new T.Vector3().fromBufferAttribute(nor,i+j).toArray(),g.attributes.uv?.getX(i+j)||0,g.attributes.uv?.getY(i+j)||0]);
        for(const distance of planes){const yes=[],no=[];for(let j=0;j<poly.length;j++){const a=poly[j],b=poly[(j+1)%poly.length],da=distance(a),db=distance(b);(da>=0?yes:no).push(a);if((da>=0)!==(db>=0)){const t=da/(da-db),v=a.map((x,k)=>x+(b[k]-x)*t);yes.push(v);no.push(v);}}emit(no,outside);poly=yes;if(!poly.length)break;}emit(poly,inside);}
      const build=vertices=>{const result=new T.BufferGeometry();result.setAttribute('position',new T.Float32BufferAttribute(vertices.flatMap(v=>v.slice(0,3)),3));result.setAttribute('normal',new T.Float32BufferAttribute(vertices.flatMap(v=>v.slice(3,6)),3));result.setAttribute('uv',new T.Float32BufferAttribute(vertices.flatMap(v=>v.slice(6,8)),2));return result;};if(g!==source)g.dispose();return {inside:build(inside),outside:build(outside)};
    }
    const bodyParts=[],doorParts=[],wheelParts=[];
    for(const p of parts){const b=p.geometry.boundingBox,c=b.getCenter(new T.Vector3());
      if(/Watertight.*body shell/i.test(p.name)){const split=splitPanel(p.geometry);bodyParts.push({...p,geometry:split.outside});doorParts.push({...p,geometry:split.inside});}
      else if(/^Steering /i.test(p.name))wheelParts.push(p);
      else if(c.x>.3&&c.z>-.15&&c.z<1.35&&/Front side door|Satin door pull|mirror|Door panel shut/i.test(p.name))doorParts.push(p);
      else bodyParts.push(p);
    }
    // Keep original interaction objects, lights and dashboard state, and replace their visible meshes.
    for(const child of owned.children)child.visible=false;
    const body=new T.Group();body.name='licensed-player-sedan';owned.add(body);
    const add=(target,list,offset=new T.Vector3())=>{for(const p of merge(list)){const geometry=parkedLOD(p.geometry,.012).translate(-offset.x,-offset.y,-offset.z);p.geometry.dispose();const mesh=new T.Mesh(geometry,p.material);mesh.castShadow=true;mesh.receiveShadow=true;target.add(mesh);}};
    add(body,bodyParts);door.visible=true;for(const c of door.children)c.visible=false;door.position.set(.8,0,1.17);add(door,doorParts,door.position);
    wheel.visible=true;for(const c of wheel.children)c.visible=false;wheel.position.set(.37,.90,.80);wheel.rotation.set(0,0,0);add(wheel,wheelParts,wheel.position);
    car.driverSeatLocal={x:.37,y:1.14,z:.57};car.headlights.forEach(l=>{l.visible=true;l.target.visible=true;});
    status.loaded=true;status.driverDoor=doorParts.length>1;status.sourceMeshes=parts.length;status.materials=fleet.length;status.sourceSize=size.toArray();
  }catch(error){status.errors.push(error.message);console.error('Sedan GLB replacement failed',error);}
  return status;
};
