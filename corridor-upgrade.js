/* One 6F corridor bay: locally bundled CC0 glTF props and PBR finishes. */
window.installPoyuCorridorUpgrade=async function(T,world){
  const state={models:{},materials:{},errors:[]};
  window.poyuCorridorStatus=state;
  const hall=world.encounter.hallway;
  if(!hall||!window.PoyuGLTFLoader){state.errors.push('Corridor or GLTFLoader unavailable');return state;}
  const interiorMask=hall.getObjectByName('common-granite-floor')?.layers.mask??2;
  state.renderLayerMask=interiorMask;
  const modelLoader=new window.PoyuGLTFLoader(),textureLoader=new T.TextureLoader();
  const base='assets/models/corridor/';
  async function surface(id,repeatX,repeatY){
    const root='assets/materials/corridor/'+id+'/';
    const [color,normal,rough]=await Promise.all(['Diffuse.jpg','nor_gl.jpg','Rough.jpg'].map(name=>textureLoader.loadAsync(root+name)));
    color.colorSpace=T.SRGBColorSpace;
    for(const map of [color,normal,rough]){map.wrapS=map.wrapT=T.RepeatWrapping;map.repeat.set(repeatX,repeatY);map.anisotropy=4;}
    state.materials[id]=true;
    return new T.MeshStandardMaterial({map:color,normalMap:normal,roughnessMap:rough,roughness:1,metalness:0,normalScale:new T.Vector2(.32,.32)});
  }
  try{
    const [tile,plaster]=await Promise.all([surface('floor_tiles_02',1,1),surface('painted_plaster_wall',2,1)]);
    const floor=new T.Mesh(new T.PlaneGeometry(4,4.8),tile);
    floor.name='real-corridor-bay-pbr-floor';floor.layers.mask=interiorMask;floor.rotation.x=-Math.PI/2;floor.position.set(18,.008,10.8);floor.receiveShadow=true;hall.add(floor);
    hall.traverse(object=>{
      if(!object.isMesh||object.name!=='common-speckled-wall')return;
      const box=new T.Box3().setFromObject(object),center=box.getCenter(new T.Vector3());
      if(center.x>=15.8&&center.x<=20.2&&center.z>=8.3&&center.z<=13.3)object.material=plaster;
    });
  }catch(error){state.errors.push('PBR finishes: '+error.message);}
  async function prop(id,name,position,size,rotation=0){
    try{
      const gltf=await modelLoader.loadAsync(base+id+'/'+id+'_1k.gltf');
      const model=gltf.scene;model.name=name;model.rotation.y=rotation;
      model.updateMatrixWorld(true);
      const bounds=new T.Box3().setFromObject(model),dimensions=bounds.getSize(new T.Vector3());
      if(!Number.isFinite(dimensions.x+dimensions.y+dimensions.z)||Math.min(dimensions.x,dimensions.y,dimensions.z)<=0)throw Error('Invalid model bounds');
      model.scale.set(size[0]/dimensions.x,size[1]/dimensions.y,size[2]/dimensions.z);
      model.updateMatrixWorld(true);
      const fitted=new T.Box3().setFromObject(model),center=fitted.getCenter(new T.Vector3());
      model.position.set(position[0]-center.x,position[1]-fitted.min.y,position[2]-center.z);
      let meshes=0,pbr=0;
      model.traverse(object=>{if(object.isMesh){object.layers.mask=interiorMask;meshes++;object.castShadow=true;object.receiveShadow=true;if(object.material?.isMeshStandardMaterial&&object.material.map)pbr++;}});
      if(!meshes||!pbr)throw Error('No textured PBR meshes');
      hall.add(model);state.models[id]={meshes,pbr};
      return model;
    }catch(error){state.errors.push(id+': '+error.message);return null;}
  }
  const [light,extinguisher]=await Promise.all([
    prop('mounted_fluorescent_lights','real-bay-fluorescent',[18,2.49,10.8],[1.16,.16,.35]),
    prop('korean_fire_extinguisher_01','real-bay-extinguisher',[19.65,0,12.72],[.27,.51,.27]),
    prop('utility_box_02','real-bay-utility-box',[18.75,1.02,13.04],[.51,.67,.18]),
    prop('modern_wooden_cabinet','real-bay-shoe-cabinet',[19.25,0,12.85],[.8,1.03,.33])
  ]);
  if(light){const old=hall.getObjectByName('round-common-ceiling-light');if(old)old.visible=false;}
  if(extinguisher)for(const old of world.encounter.legacyExtinguisher||[])old.visible=false;
  return state;
};
