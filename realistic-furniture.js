/* CC0 Poly Haven models, downloaded through the public API and packaged locally.
   Loaded progressively so opening the game never waits for external servers. */
window.PoyuFurniture=(function(){
  const ids=['GothicBed_01','dining_chair_02','dining_table'];
  function bedding(T,scene){
    let source;scene.traverse(o=>{if(o.isMesh)source=o;});
    const g=source.geometry,p=g.attributes.position,idx=g.index;
    const parents=Array.from({length:p.count},(_,i)=>i),find=i=>parents[i]===i?i:(parents[i]=find(parents[i]));
    const join=(a,b)=>{parents[find(a)]=find(b);},weld=new Map();
    for(let i=0;i<p.count;i++){const key=[p.getX(i),p.getY(i),p.getZ(i)].map(n=>Math.round(n*1e5)).join(',');if(weld.has(key))join(i,weld.get(key));else weld.set(key,i);}
    for(let i=0;i<idx.count;i+=3){join(idx.getX(i),idx.getX(i+1));join(idx.getX(i),idx.getX(i+2));}
    const components=new Map(),v=new T.Vector3();
    for(let i=0;i<idx.count;i++){const n=idx.getX(i),key=find(n);if(!components.has(key))components.set(key,{indices:[],box:new T.Box3()});const c=components.get(key);c.indices.push(n);c.box.expandByPoint(v.fromBufferAttribute(p,n));}
    const selected=[...components.values()].filter(c=>{const s=c.box.getSize(new T.Vector3());return c.box.max.y<.70&&((s.x>1.4&&s.z>1.5)||(s.x>.5&&s.z>.2&&c.box.min.y>.35));});
    if(selected.length!==3)throw new Error('Unexpected bedding geometry');
    const indices=selected.flatMap(c=>c.indices),vertices=[...new Set(indices)],remap=new Map(vertices.map((n,i)=>[n,i])),out=new T.BufferGeometry();
    for(const [name,attribute]of Object.entries(g.attributes)){const array=new attribute.array.constructor(vertices.length*attribute.itemSize);vertices.forEach((n,i)=>{for(let j=0;j<attribute.itemSize;j++)array[i*attribute.itemSize+j]=attribute.array[n*attribute.itemSize+j];});out.setAttribute(name,new T.BufferAttribute(array,attribute.itemSize,attribute.normalized));}
    out.setIndex(indices.map(n=>remap.get(n)));out.computeBoundingBox();
    const root=new T.Group();root.add(new T.Mesh(out,source.material));return root;
  }
  function fitted(T,source,{width,height,depth,rotation=0,x=0,y=0,z=0}){
    const model=source.clone(true),holder=new T.Group();holder.add(model);model.rotation.y=rotation;holder.updateMatrixWorld(true);
    const b=new T.Box3().setFromObject(holder),s=b.getSize(new T.Vector3()),center=b.getCenter(new T.Vector3());
    if(Math.min(s.x,s.y,s.z)<=0)throw new Error('Empty furniture model');
    model.position.set(-center.x,-b.min.y,-center.z);holder.scale.set(width/s.x,height/s.y,depth/s.z);holder.position.set(x,y,z);
    holder.traverse(o=>{o.layers.set(1);if(o.isMesh){o.castShadow=o.receiveShadow=true;const materials=Array.isArray(o.material)?o.material:[o.material];for(const m of materials){m.envMapIntensity=.65;if(m.normalScale)m.normalScale.set(.65,.65);}}});
    holder.userData.externalFurniture=true;return holder;
  }
  function replace(T,parent,source,spec,predicate=()=>true){
    if(!parent)return false;
    const original=parent.children.filter(predicate),model=fitted(T,source,spec);model.name='api-'+spec.id;
    parent.add(model);for(const o of original)o.visible=false;return true;
  }
  function apply(T,group,id,scene){
    const get=name=>group.getObjectByName(name),spec={id};
    if(id==='GothicBed_01')return replace(T,get('master-bed'),bedding(T,scene),{...spec,width:1.50,height:.39,depth:2.0,y:.32},o=>o.name==='tailored-upholstery'||o.geometry?.type==='TubeGeometry');
    const dining=get('dining-set');if(!dining)return false;
    if(id==='dining_table')return replace(T,dining,scene,{...spec,width:.9,height:.78,depth:1.6,rotation:Math.PI/2},o=>o.name==='dining-table-fallback');
    if(id==='dining_chair_02'){
      const chairs=dining.children.filter(o=>o.name==='dining-chair-fallback');
      for(const old of chairs)replace(T,dining,scene,{...spec,width:.48,height:.95,depth:.48,x:old.position.x,z:old.position.z,rotation:old.rotation.y+Math.PI},o=>o===old);
      return chairs.length===3;
    }
    return false;
  }
  function script(src){return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=()=>reject(new Error('Furniture asset unavailable'));document.head.appendChild(s);});}
  async function materials(T,group){
    await script('assets/furniture/materials.js?v=furniture-1');
    const loader=new T.TextureLoader(),updated=[];
    for(const [slug,name,repeat]of [['leather_white','game-chair-api-leather',2],['wood_table','bed-frame-api-wood',1]]){
      const targets=new Set();group.traverse(o=>{for(const m of (Array.isArray(o.material)?o.material:[o.material]))if(m?.name===name)targets.add(m);});
      const maps={};
      for(const [channel,key]of [['Diffuse','map'],['nor_gl','normalMap'],['Rough','roughnessMap']]){
        if(slug==='wood_table'&&key==='map')continue;
        const map=await loader.loadAsync(window.PoyuFurnitureMaterials[slug][channel]);map.colorSpace=key==='map'?T.SRGBColorSpace:T.NoColorSpace;map.wrapS=map.wrapT=T.RepeatWrapping;map.repeat.set(repeat,repeat);maps[key]=map;
      }
      for(const m of targets){Object.assign(m,maps);m.normalScale.setScalar(slug==='wood_table'?.10:.35);m.roughness=1;m.needsUpdate=true;}
      updated.push(slug);
    }
    delete window.PoyuFurnitureMaterials;return updated;
  }
  function install(T,group){
    const status={loaded:[],failed:[],materials:[],ready:null};
    status.ready=(async()=>{
      await new Promise(r=>setTimeout(r,800));
      if(!window.PoyuGLTFLoader)await script('assets/vendor/gltf-loader.js?v=furniture-1');
      const loader=new window.PoyuGLTFLoader();
      for(const id of ids){
        try{
          await script('assets/furniture/'+id+'.js?v=furniture-1');
          const gltf=await loader.parseAsync(JSON.stringify(window.PoyuFurnitureData[id]),'');
          delete window.PoyuFurnitureData[id];
          if(!apply(T,group,id,gltf.scene))throw new Error('Furniture target unavailable');
          status.loaded.push(id);
        }catch(e){status.failed.push(id);console.warn('Furniture kept its built-in appearance:',id,e.message);}
        await new Promise(r=>setTimeout(r,90));
      }
      try{status.materials=await materials(T,group);}catch(e){status.failed.push('materials');console.warn('Furniture material fallback:',e.message);}
      return status;
    })().catch(e=>{status.failed.push('loader');console.warn('Furniture loader unavailable:',e.message);return status;});
    return status;
  }
  return {apply,install,bedding,ids};
})();
