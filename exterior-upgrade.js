/* One street-facing facade study using licensed, locally bundled glTF geometry. */
window.installPoyuExteriorUpgrade=async function(T,world){
  const status={loaded:false,panels:0,pbrMeshes:0,twosomePanels:0,twosomePbrMeshes:0,twosomeReturns:0,streetWallModules:0,streetPbrSurfaces:0,streetUtilityModels:0,error:null};
  window.poyuExteriorStatus=status;
  try{
    if(!world.streets?.group||!window.PoyuGLTFLoader)throw Error('Street scene or GLTFLoader unavailable');
    const gltf=await new window.PoyuGLTFLoader().loadAsync('assets/models/exterior/polyhaven-facade/modular_urban_apartments_facade_1k.gltf');
    const source=gltf.scene.getObjectByName('window_centered_small_01');
    if(!source)throw Error('Narrow facade window module missing');
    const facade=new T.Group();facade.name='poyu-street-facing-gltf-facade-study';
    // The verified street view has narrow individual windows on a white upper wall.
    // Replace just four old window visuals at their original positions.
    for(const z of [73.4,77.2])for(const y of [14.85,17.85]){
      const panel=new T.Group();panel.position.set(52.42,y,z);panel.rotation.y=Math.PI/2;
      const module=source.clone(true);module.position.set(1.05,0,0);module.scale.set(.7,.85,1);
      module.traverse(mesh=>{if(mesh.isMesh){mesh.castShadow=true;mesh.receiveShadow=true;if(mesh.material?.isMeshStandardMaterial&&mesh.material.map)status.pbrMeshes++;}});
      panel.add(module);
      facade.add(panel);status.panels++;
    }
    if(status.pbrMeshes<4)throw Error('PBR facade materials missing');
    world.streets.group.add(facade);
    // The neighbouring A Twosome Place has a dark two-storey glazed podium.
    // Reuse the downloaded, textured glTF architectural modules; no visual boxes are made here.
    const glazed=gltf.scene.getObjectByName('window_centered_large_01');
    const entrance=gltf.scene.getObjectByName('door_centered_large_01');
    const solid=gltf.scene.getObjectByName('wall_standard_standard_01');
    if(!glazed||!entrance||!solid)throw Error('Twosome storefront glTF modules missing');
    const cafe=new T.Group();cafe.name='twosome-street-facing-gltf-storefront';
    function addModule(source,x,z,rotation,width,height,returnWall=false){
      const model=source.clone(true);model.position.set(0,0,0);model.rotation.set(0,0,0);model.scale.setScalar(1);
      const bounds=new T.Box3().setFromObject(model),size=bounds.getSize(new T.Vector3()),center=bounds.getCenter(new T.Vector3());
      if(size.x<.1||size.y<.1)throw Error('Invalid Twosome glTF module bounds');
      model.position.set(-center.x,-bounds.min.y,-center.z);
      const holder=new T.Group();holder.add(model);
      holder.scale.set(width/size.x,height/size.y,.22);
      holder.position.set(x,0,z);holder.rotation.y=rotation;
      model.traverse(mesh=>{if(!mesh.isMesh)return;mesh.castShadow=true;mesh.receiveShadow=true;
        if(mesh.material?.isMeshStandardMaterial){mesh.material=mesh.material.clone();
          if(/glass/i.test(mesh.material.name)){mesh.material.color.set(0x93adbc);mesh.material.roughness=.19;}
          else{mesh.material.map=null;mesh.material.color.set(0x292d31);mesh.material.roughness=.78;}
          if(mesh.material.normalMap||mesh.material.roughnessMap)status.twosomePbrMeshes++;
        }
      });
      cafe.add(holder);status.twosomePanels++;if(returnWall)status.twosomeReturns++;
      if(source!==solid&&source!==entrance)holder.userData.referenceGlazing=true;
      if(source===entrance)holder.userData.referenceStoreDoor=true;
      if(source===solid)holder.userData.referenceStoreBacking=true;
    }
    for(const z of [100.5,107,113.5,120])addModule(solid,52.18,z,Math.PI/2,6.55,6.85);
    for(const x of [35.5,42,48.5])addModule(solid,x,122.56,0,6.55,6.85,true);
    for(const x of [35.5,42,48.5])addModule(solid,x,97.42,Math.PI,6.55,6.85,true);
    for(let i=0;i<6;i++)addModule(i===4?entrance:glazed,52.38,99.7+i*3.72,Math.PI/2,3.65,6.85);
    // Continue the charcoal storefront around the cafe-road corner and the narrow side beside Poyu.
    for(let i=0;i<5;i++)addModule(i===2?entrance:glazed,34.3+i*3.75,122.78,0,3.68,6.85,true);
    if(status.twosomePbrMeshes<16)throw Error('Twosome PBR storefront materials missing');
    world.streets.group.add(cafe);
    // Extend the verified street view along the Twosome pavement and the opposite retaining wall.
    const textureLoader=new T.TextureLoader();
    async function pbrSet(folder){
      const base='assets/materials/exterior/'+folder+'/';
      const [map,normalMap,roughnessMap]=await Promise.all(['Diffuse.jpg','nor_gl.jpg','Rough.jpg'].map(file=>textureLoader.loadAsync(base+file)));
      map.colorSpace=T.SRGBColorSpace;
      for(const image of [map,normalMap,roughnessMap]){image.wrapS=image.wrapT=T.RepeatWrapping;image.anisotropy=4;}
      return new T.MeshStandardMaterial({map,normalMap,roughnessMap,roughness:1,metalness:0});
    }
    const [pavers,blockWall]=await Promise.all([pbrSet('concrete_tiles_02'),pbrSet('concrete_block_wall')]);
    // The wall is sunlit in the reference; preserve texture contrast without turning it into a black silhouette.
    blockWall.emissive.set(0xffffff);blockWall.emissiveMap=blockWall.map;blockWall.emissiveIntensity=.32;
    const surfaces=world.streets.exteriorSurfaces;
    if(!surfaces)throw Error('Street PBR target meshes missing');
    for(const key of ['eastWalkVisual','southWalkVisual','cafeWalkVisual']){surfaces[key].material=pavers;status.streetPbrSurfaces++;}
    surfaces.endWallVisual.material=blockWall;status.streetPbrSurfaces++;
    // The opposite-side wall is outside the existing walkable/collision route.
    const roadWall=new T.Group();roadWall.name='twosome-road-retaining-gltf-wall';
    for(let z=91;z<139;z+=4.5){
      const segment=solid.clone(true);segment.position.set(0,0,0);segment.rotation.set(0,0,0);segment.scale.setScalar(1);
      const bound=new T.Box3().setFromObject(segment),size=bound.getSize(new T.Vector3()),mid=bound.getCenter(new T.Vector3());
      if(size.x<.1||size.y<.1)throw Error('Invalid retaining wall module');
      segment.position.set(-mid.x,-bound.min.y,-mid.z);
      segment.traverse(mesh=>{if(mesh.isMesh){mesh.material=blockWall;mesh.castShadow=true;mesh.receiveShadow=true;}});
      const panel=new T.Group();panel.position.set(74.5,0,z);panel.rotation.y=-Math.PI/2;panel.scale.set(4.55/size.x,3.1/size.y,.3);panel.add(segment);
      roadWall.add(panel);status.streetWallModules++;
    }
    world.streets.group.add(roadWall);
    const utility=await new window.PoyuGLTFLoader().loadAsync('assets/models/corridor/utility_box_02/utility_box_02_1k.gltf');
    for(const z of [90,111]){
      const cabinet=utility.scene.clone(true);cabinet.position.set(0,0,0);
      const bounds=new T.Box3().setFromObject(cabinet),size=bounds.getSize(new T.Vector3()),center=bounds.getCenter(new T.Vector3());
      if(size.x<.05||size.y<.05||size.z<.05)throw Error('Invalid street utility glTF bounds');
      cabinet.position.set(-center.x,-bounds.min.y,-center.z);
      const holder=new T.Group();holder.name='twosome-street-utility-gltf-'+z;holder.position.set(70.4,0,z);holder.rotation.y=-Math.PI/2;holder.scale.set(1.15/size.x,1.4/size.y,.5/size.z);holder.add(cabinet);
      cabinet.traverse(mesh=>{if(mesh.isMesh){mesh.castShadow=true;mesh.receiveShadow=true;}});
      world.streets.group.add(holder);status.streetUtilityModels++;
    }
    status.referenceDetails=await window.installPoyuStreetReference?.(T,world);
    status.rightBuilding=await window.installPoyuRightBuilding?.(T,world);
    status.loaded=true;
  }catch(error){status.error=error.message;console.warn('Exterior glTF study:',error);}
  return status;
};
