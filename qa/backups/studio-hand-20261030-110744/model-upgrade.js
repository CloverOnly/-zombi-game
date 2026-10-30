/* Licensed GLB/glTF assets loaded from the local models directory. */
window.installPoyuModels=async function installPoyuModels(T,world){
  const status={zombie:false,bat:false,hands:false,vanity:false,bed:false,errors:[]};
  window.poyuModelStatus=status;
  if(!window.PoyuGLTFLoader){status.errors.push('GLTFLoader unavailable');return status;}
  const loader=new window.PoyuGLTFLoader();
  status.vehicles=await window.installPoyuVehicles?.(T,world);
  try{
    const base='assets/models/zombies/infected-city-man/';
    const [gltf,idle,walk,attack,death]=await Promise.all([
      loader.loadAsync(base+'infected-city-man.glb'),
      loader.loadAsync(base+'idle.glb'),
      loader.loadAsync(base+'walk.glb'),
      loader.loadAsync(base+'attack.glb'),
      loader.loadAsync(base+'death.glb')
    ]);
    const texLoader=new T.TextureLoader();
    const textures={};
    for(const [part,stem] of Object.entries({body:'InfectedCityMan_City_Infected_Man_Body1',outfit:'InfectedCityMan_City_Man_Infected_Outfit1'})){
      const color=await texLoader.loadAsync(base+stem+'_BaseColor.png');color.colorSpace=T.SRGBColorSpace;color.flipY=false;
      const normal=await texLoader.loadAsync(base+stem+'_Normal.png');normal.flipY=false;
      textures[part]={color,normal};
    }
    gltf.scene.traverse(o=>{
      if(!o.isMesh)return;
      const part=o.material?.name?.includes('Outfit')?'outfit':'body';
      const maps=textures[part];
      o.material=new T.MeshStandardMaterial({map:maps.color,normalMap:maps.normal,roughness:.88,metalness:0,side:T.DoubleSide});
    });
    const sourceClips={Idle:idle,Walk:walk,Attack:attack,Death:death};
    gltf.animations=Object.entries(sourceClips).map(([name,source])=>{
      const clip=source.animations[0]?.clone();
      if(!clip)throw new Error(name+' animation file has no clip');
      clip.name=name;
      for(const track of clip.tracks)track.name=track.name.replace(/^mixamorig/,'CityDeadOutfit');
      return clip;
    });
    gltf.userData={...(gltf.userData||{}),poyuFixedScale:.6,poyuFloorOffset:.48};
    world.encounter.zombie.useModel(gltf);status.zombie=true;
  }catch(error){status.errors.push('zombie: '+error.message);console.warn('Zombie model fallback:',error);}
  try{
    const gltf=await loader.loadAsync('assets/models/weapons/baseball-bat/baseball_bat.gltf');
    world.encounter.useBatModel(gltf);status.bat=true;
  }catch(error){status.errors.push('bat: '+error.message);console.warn('Baseball bat model fallback:',error);}
  try{
    if(!status.bat)throw new Error('Real bat asset must load before the FPS arms; primitive substitute disabled');
    const gltf=await loader.loadAsync('assets/models/hands/para-fps/arms.gltf');
    status.handMesh=world.encounter.useHandModel(gltf);status.hands=true;
  }catch(error){status.errors.push('hands: '+error.message);console.warn('Hand model fallback:',error);}
  try{
    const target=world.apartment.group.getObjectByName('master-vanity-set');
    if(!target)throw new Error('Vanity target missing');
    const gltf=await loader.loadAsync('assets/models/environment/wooden-table/wooden_table_02.gltf');
    const model=gltf.scene;model.name='real-vanity-table';
    const bounds=new T.Box3().setFromObject(model),size=bounds.getSize(new T.Vector3());
    if(Math.min(size.x,size.y,size.z)<=0)throw new Error('Vanity model has invalid bounds');
    model.scale.set(1.25/size.x,.76/size.y,.46/size.z);
    model.updateMatrixWorld(true);
    const fitted=new T.Box3().setFromObject(model),center=fitted.getCenter(new T.Vector3());
    model.position.set(-center.x,-fitted.min.y,-center.z);
    model.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
    for(const part of target.children){
      if(part.name==='master-vanity'||part.isMesh&&part.position.y<.78&&Math.abs(part.position.z)<.3)part.visible=false;
    }
    target.add(model);status.vanity=true;
  }catch(error){status.errors.push('vanity: '+error.message);console.warn('Vanity model fallback:',error);}
  try{
    await world.apartment.furniture?.ready;
    const target=world.apartment.group.getObjectByName('master-bed');
    if(!target)throw new Error('Bedroom bed target missing');
    const gltf=await loader.loadAsync('assets/models/environment/vintage-day-bed/vintage_day_bed.gltf');
    const model=gltf.scene;model.name='real-bedroom-bed';model.rotation.y=Math.PI/2;
    model.updateMatrixWorld(true);
    const bounds=new T.Box3().setFromObject(model),size=bounds.getSize(new T.Vector3());
    if(Math.min(size.x,size.y,size.z)<=0)throw new Error('Bedroom bed model has invalid bounds');
    model.scale.set(1.6/size.x,1.05/size.y,2.16/size.z);
    model.updateMatrixWorld(true);
    const fitted=new T.Box3().setFromObject(model),center=fitted.getCenter(new T.Vector3());
    model.position.set(-center.x,-fitted.min.y,-center.z);
    model.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
    for(const part of target.children)part.visible=false;
    target.add(model);status.bed=true;
  }catch(error){status.errors.push('bed: '+error.message);console.warn('Bedroom bed model fallback:',error);}
  status.corridor=await window.installPoyuCorridorUpgrade?.(T,world);
  status.exterior=await window.installPoyuExteriorUpgrade?.(T,world);
  return status;
};

