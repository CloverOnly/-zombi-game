const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),T=require('../three.min.js');
global.ProgressEvent=class{};
const root=path.resolve(__dirname,'..'),runtime=require('./runtime.cjs'),{world,window}=runtime(),noop=()=>{},context2d=new Proxy({},{get:(o,k)=>o[k]??noop}),document={createElement:()=>({getContext:()=>context2d})};
const ctx={window,self:window,document,console,TextDecoder,TextEncoder,URL,Blob,ArrayBuffer,Uint8Array};
window.THREE=T;
for(const f of ['assets/vendor/gltf-loader.js','right-building-upgrade.js'])vm.runInNewContext(fs.readFileSync(path.join(root,f),'utf8'),ctx);
const Original=window.PoyuGLTFLoader;window.PoyuGLTFLoader=class extends Original{loadAsync(file){const b=fs.readFileSync(path.join(root,file));this.register(()=>({name:'FixtureImages',loadTexture:()=>Promise.resolve(new T.Texture())}));return new Promise((ok,no)=>this.parse(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'',ok,no));}};
const snapshot=()=>JSON.stringify({roads:world.streets.roads,floors:world.streets.floors,colliders:world.streets.colliders,ramp:world.streets.rampColliders,route:world.streets.route,landmarks:world.streets.landmarks,infected:world.streets.infected.map(a=>({spawn:a.spawn,patrol:a.patrol}))});
(async()=>{
 const cafe=world.streets.group.getObjectByName('reference-twosome'),cafeSnapshot=()=>JSON.stringify({position:cafe.position.toArray(),rotation:cafe.rotation.toArray(),scale:cafe.scale.toArray(),children:cafe.children.map(o=>({uuid:o.uuid,visible:o.visible,geometry:o.geometry?.uuid}))});
 const before=snapshot(),cafeState=cafeSnapshot(),status=await window.installPoyuRightBuilding(T,world);
 assert.equal(status.loaded,true,JSON.stringify(status));assert.equal(snapshot(),before);assert.equal(cafeSnapshot(),cafeState,'DHIIVE/Twosome scene stays untouched');
 assert.equal(status.officeWindows,72);assert.equal(status.shopWindows,7);assert.equal(status.entries,3);assert.equal(status.parkingServicePanels,2);assert.equal(status.canopies,4);assert(status.batches<=14);assert(status.triangles<90000);
 assert(!world.streets.group.getObjectByName('reference-hospital').visible);assert(world.streets.group.getObjectByName('reference-hospital').userData.dynamic,'old hospital must stay removable during batching');
 world.scene.updateMatrixWorld(true);const model=world.streets.group.getObjectByName('right-reference-clinic'),box=new T.Box3().setFromObject(model);assert(box.max.x<51.8,'new facade must stay off the road/pavement');assert(box.min.z>8.0);
 const solids=[];model.traverse(o=>{if(o.isMesh){assert.notEqual(o.geometry.type,'BoxGeometry');if(o.isInstancedMesh){assert(o.geometry.attributes.uv);assert(o.geometry.attributes.normal);assert(o.boundingSphere);if(o.name==='clinic-closed-shell')solids.push(o);}}});
 const base=world.streets.groundY,origin=new T.Vector3(35,base+10,12);
 for(const v of [[1,0,0],[-1,0,0],[0,0,1],[0,0,-1],[0,1,0],[0,-1,0]]){const ray=new T.Raycaster(origin,new T.Vector3(...v),0,40);ray.layers.enable(3);assert(ray.intersectObjects(solids,false).length,'building shell must be closed in all six directions');}
 const pung=[];model.traverse(o=>{if(o.name==='clinic-sign-풍전돈까스')pung.push(o);});assert.equal(pung.length,2);
 assert(pung.some(o=>o.position.x<19&&Math.abs(o.rotation.y+Math.PI/2)<1e-6),'main restaurant sign belongs on the pedestrian-facing west facade');
 assert(pung.every(o=>o.position.x<30),'no restaurant sign may remain on the parking-facing east facade');
 const entry=model.children.find(o=>o.name==='clinic-entry');let westEntry=false,eastEntry=false;
 for(let i=0;i<entry.count;i++){const m=new T.Matrix4();entry.getMatrixAt(i,m);const x=new T.Vector3().setFromMatrixPosition(m).x;westEntry ||= x<20;eastEntry ||= x>50;}
 assert(westEntry&&!eastEntry,'restaurant entry must move with its sign to the pedestrian side');
 const sideSigns=['풍전돈까스','보문산 식후경','명륜진사갈비'].map(name=>model.children.find(o=>o.name==='clinic-sign-'+name&&Math.abs(o.position.z-8.25)<.03&&Math.abs(o.rotation.y-Math.PI)<1e-6&&o.geometry.parameters.width>2));
 assert(sideSigns.every(Boolean),'all three observed storefronts must exist');assert(sideSigns[0].position.x<sideSigns[1].position.x&&sideSigns[1].position.x<sideSigns[2].position.x,'shop order from the Poyu corner must match the panorama');
 const outside=new T.PerspectiveCamera(),inside=new T.PerspectiveCamera();outside.layers.enable(3);inside.layers.enable(1);
 model.traverse(o=>{if(o.isMesh){assert(o.layers.test(outside.layers),'facade must remain visible outdoors');assert(!o.layers.test(inside.layers),'facade must not cut through the separately laid-out upstairs hall');}});
 const result={passed:true,roadsCollisionAIUnchanged:true,twosomeUnchanged:true,closedShell:true,legacyHidden:true,shopOrderVerified:true,streetOnlyLayerVerified:true,bounds:{min:box.min.toArray(),max:box.max.toArray()},status};fs.writeFileSync(path.join(__dirname,'right-building-geometry.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
})().catch(e=>{console.error(e);process.exitCode=1});
