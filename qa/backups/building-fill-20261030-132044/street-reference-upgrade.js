/* Photo 010108 / 010125 / 010139. Imported CC0 geometry, with unchanged road/collision data. */
window.installPoyuStreetReference=async function(T,world){
  const status={loaded:false,models:[],bollards:0,manholes:0,railingPanels:0,storefrontPanels:0,drawBatches:0,triangles:0,pbrMaterials:[],error:null};
  window.poyuStreetDetailStatus=status;
  try{
    const loader=new window.PoyuGLTFLoader(),base='assets/models/exterior/street-detail/reference-edits/';
    const names=['reference-bollard','reference-manhole','reference-horizontal-railing','reference-storefront'];
    const assets=await Promise.all(names.map(n=>loader.loadAsync(base+n+'.glb')));
    const root=new T.Group();root.name='streetview-reference-details';
    const seen=new Set();
    function instances(gltf,placements,label,shadow=false){
      gltf.scene.updateMatrixWorld(true);
      gltf.scene.traverse(o=>{if(!o.isMesh)return;
        if(label==='reference-storefront'){const wasArray=Array.isArray(o.material);const adapted=[].concat(o.material).map(m=>/glass/i.test(m.name)?new T.MeshPhysicalMaterial({name:m.name,color:0x95b1be,normalMap:m.normalMap,roughnessMap:m.roughnessMap,normalScale:new T.Vector2(.2,.2),metalness:.12,roughness:.12,transparent:true,opacity:.42,depthWrite:false,side:T.DoubleSide,clearcoat:.9,envMapIntensity:1.3}):m);o.material=wasArray?adapted:adapted[0];}
        for(const m of [].concat(o.material)){
          if(!m.isMeshStandardMaterial)throw Error('PBR material missing: '+label);
          if(!seen.has(m.uuid)){seen.add(m.uuid);status.pbrMaterials.push({name:m.name,color:!!m.map,normal:!!m.normalMap,roughness:!!m.roughnessMap});}
          if(m.map)m.map.anisotropy=4;
        }
        const batch=new T.InstancedMesh(o.geometry,o.material,placements.length);batch.name=label+'-'+o.name;batch.castShadow=shadow;batch.receiveShadow=true;
        placements.forEach((p,i)=>{
          const transform=new T.Matrix4().compose(new T.Vector3(p.x,p.y||0,p.z),new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0),p.rotation||0),new T.Vector3(p.sx||1,p.sy||1,p.sz||1));
          batch.setMatrixAt(i,transform.multiply(o.matrixWorld));
        });
        batch.instanceMatrix.needsUpdate=true;batch.computeBoundingSphere();root.add(batch);status.drawBatches++;
        status.triangles+=(o.geometry.index?.count||o.geometry.attributes.position.count)/3*placements.length;
      });
    }
    const bollards=world.streets.referenceDetails?.bollards;
    if(!bollards?.length)throw Error('Reference bollard targets missing');
    instances(assets[0],bollards.map(p=>({...p,y:.12})),'reference-bollard',true);status.bollards=bollards.length;
    const covers=world.streets.referenceDetails.manholes;
    instances(assets[1],covers,'reference-manhole');status.manholes=covers.length;
    const rails=[];
    for(let x=-64.8;x<69;x+=2.4)rails.push({x,y:2.7,z:142.1});
    for(let z=93.4;z<139;z+=2.4)rails.push({x:74.5,y:3.1,z,rotation:Math.PI/2});
    instances(assets[2],rails,'reference-horizontal-railing');status.railingPanels=rails.length;
    const glazing=[];
    for(let i=0;i<6;i++)if(i!==4)glazing.push({x:52.47,y:.28,z:99.58+i*4.14,rotation:Math.PI/2,sx:4.12/3.65});
    for(let i=0;i<5;i++)if(i!==2)glazing.push({x:34+i*4,y:.28,z:122.94,sx:3.98/3.65});
    instances(assets[3],glazing,'reference-storefront');status.storefrontPanels=glazing.length;
    // Flat road paint is a decal, never a substitute building/prop mesh.
    const canvas=document.createElement('canvas');canvas.width=256;canvas.height=512;const paint=canvas.getContext('2d');paint.clearRect(0,0,256,512);paint.fillStyle='#d2d0c6';paint.textAlign='center';paint.textBaseline='middle';paint.font='bold 225px Arial';paint.fillText('30',128,256,240);
    const map=new T.CanvasTexture(canvas);map.colorSpace=T.SRGBColorSpace;
    const marking=new T.MeshStandardMaterial({map,transparent:true,roughness:.98,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2});
    for(const x of [17,-13]){const decal=new T.Mesh(new T.PlaneGeometry(1.7,3.6),marking);decal.name='reference-speed-marking';decal.rotation.set(-Math.PI/2,0,Math.PI/2);decal.position.set(x,.029,132);root.add(decal);}
    world.streets.group.add(root);
    world.streets.group.traverse(o=>{
      if(o.userData.referenceLegacyProp==='bollard'||o.userData.referenceLegacyProp==='manhole'||o.name==='legacy-reference-retaining-fence')o.visible=false;
      if(o.userData.referenceGlazing)o.visible=false;
      if(o.userData.referenceStoreDoor){o.scale.x*=o.rotation.y?4.12/3.65:3.98/3.68;o.scale.y*=5.25/6.85;o.position.y=.28;if(o.rotation.y)o.position.z=99.58+4*4.14;else o.position.x=42;}
      if(o.userData.referenceStoreBacking){if(o.rotation.y===Math.PI/2)o.position.x=48.8;else if(o.rotation.y===0)o.position.z=119;}
    });
    status.models=names;status.loaded=true;
  }catch(error){status.error=error.message;console.warn('Street reference detail:',error);}
  return status;
};
