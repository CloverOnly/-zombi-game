const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),T=require('../three.min.js');
global.ProgressEvent=class{};
const {world,window}=require('./runtime.cjs')(),root=path.resolve(__dirname,'..');window.THREE=T;
const ctx={window,self:window,console,TextDecoder,TextEncoder,URL,Blob,ArrayBuffer,Uint8Array};
for(const file of ['assets/vendor/gltf-loader.js','corridor-upgrade.js'])vm.runInNewContext(fs.readFileSync(path.join(root,file),'utf8'),ctx);
const Original=window.PoyuGLTFLoader;window.PoyuGLTFLoader=class extends Original{loadAsync(file){const dir=path.dirname(path.join(root,file)),j=JSON.parse(fs.readFileSync(path.join(root,file)));for(const b of j.buffers)b.uri='data:application/octet-stream;base64,'+fs.readFileSync(path.join(dir,b.uri)).toString('base64');this.register(()=>({name:'FixtureImages',loadTexture:()=>Promise.resolve(new T.Texture())}));return new Promise((ok,no)=>this.parse(JSON.stringify(j),'',ok,no));}};
const FixtureT={...T,TextureLoader:class{async loadAsync(){return new T.Texture()}}};
(async()=>{const result=await window.installPoyuCorridorUpgrade(FixtureT,world);assert.equal(result.errors.length,0);const outside=new T.PerspectiveCamera(),inside=new T.PerspectiveCamera();inside.layers.enable(1);let checked=0;
 for(const name of ['real-bay-fluorescent','real-bay-extinguisher','real-bay-utility-box','real-bay-shoe-cabinet','real-corridor-bay-pbr-floor']){const model=world.encounter.hallway.getObjectByName(name);assert(model,name);model.traverse(o=>{if(o.isMesh){assert(!o.layers.test(outside.layers),'interior prop must not float outside: '+name);assert(o.layers.test(inside.layers),'interior prop must remain visible upstairs: '+name);checked++;}});}
 console.log(JSON.stringify({passed:true,checkedMeshes:checked,renderLayerMask:result.renderLayerMask,outdoorHidden:true,indoorVisible:true}));
})().catch(e=>{console.error(e);process.exitCode=1});
