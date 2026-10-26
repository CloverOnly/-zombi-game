const load=require('./load-furniture.cjs'),T=require('../three.min.js');
(async()=>{
for(const id of ['Sofa_01','modern_coffee_table_01','dining_chair_02','dining_table','GothicBed_01']){
 const {scene}=await load(id);scene.updateMatrixWorld(true);const b=new T.Box3().setFromObject(scene);console.log(id,'bounds',b.min.toArray(),b.max.toArray());
 if(id!=='GothicBed_01')continue;
 const mesh=scene.children[0],g=mesh.geometry,p=g.attributes.position,idx=g.index;
 const parents=Array.from({length:p.count},(_,i)=>i),find=i=>parents[i]===i?i:(parents[i]=find(parents[i]));
 const join=(a,b)=>{parents[find(a)]=find(b);},weld=new Map();
 for(let i=0;i<p.count;i++){const key=[p.getX(i),p.getY(i),p.getZ(i)].map(n=>Math.round(n*100000)).join(',');if(weld.has(key))join(i,weld.get(key));else weld.set(key,i);}
 for(let i=0;i<idx.count;i+=3){join(idx.getX(i),idx.getX(i+1));join(idx.getX(i),idx.getX(i+2));}
 const components=new Map();for(let i=0;i<idx.count;i++){const v=idx.getX(i),root=find(v);if(!components.has(root))components.set(root,{indices:[],box:new T.Box3()});const c=components.get(root);c.indices.push(v);c.box.expandByPoint(new T.Vector3().fromBufferAttribute(p,v));}
 console.log([...components.values()].filter(c=>c.indices.length>150).map(c=>({triangles:c.indices.length/3,min:c.box.min.toArray(),max:c.box.max.toArray()})));
}
})().catch(e=>{console.error(e.message);process.exitCode=1;});
