const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),T=require('../three.min.js');
global.ProgressEvent=class{};
const root=path.resolve(__dirname,'..'),actual='C:/Users/lyj/git/-zombi-game';
const noop=()=>{},gradient=()=>({addColorStop:noop}),canvasContext=new Proxy({createLinearGradient:gradient,createRadialGradient:gradient},{get:(o,k)=>o[k]??noop});
const document={createElement:()=>({width:0,height:0,getContext:()=>canvasContext})};
function build(original){
 const window={THREE:T},ctx={window,self:window,document,console,Math,TextDecoder,TextEncoder,URL,Blob,ArrayBuffer,Uint8Array};
 for(const n of ['assets/vendor/gltf-loader','surfaces','street-details','exterior','interior-polish','rooms','zombie','elevator','parking','mart-route','streets','driving','street-ai','hallway','mart-interior','photo-apartment','world','street-reference-upgrade']){
  const dir=original&&['streets','street-details'].includes(n)?actual:root;vm.runInNewContext(fs.readFileSync(path.join(dir,n+'.js'),'utf8'),ctx);
 }
 return {window,world:window.createPoyuWorld(T,{capabilities:{getMaxAnisotropy:()=>8}})};
}
function snapshot(w){const s=w.streets;return JSON.stringify({roads:s.roads,floors:s.floors,colliders:s.colliders,rampFloors:s.rampFloors,rampColliders:s.rampColliders,route:s.route,views:s.referenceViews,landmarks:s.landmarks,infected:s.infected.map(a=>({spawn:a.spawn,patrol:a.patrol})),heights:[[47,62],[47,68],[47,75],[51,75]].map(([x,z])=>s.rampSurface(x,z))});}
(async()=>{
 const before=build(true),after=build(false),baseline=snapshot(before.world);assert.equal(snapshot(after.world),baseline,'all road/floor/collision/ramp/AI coordinates must remain identical');
 const RealLoader=after.window.PoyuGLTFLoader;after.window.PoyuGLTFLoader=class extends RealLoader{
  loadAsync(file){const b=fs.readFileSync(path.join(root,file));assert.equal(b.toString('ascii',0,4),'glTF');this.register(()=>({name:'FixtureImages',loadTexture:()=>Promise.resolve(new T.Texture())}));return new Promise((ok,no)=>this.parse(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'',ok,no));}
 };
 const status=await after.window.installPoyuStreetReference(T,after.world);assert.equal(status.loaded,true,JSON.stringify(status));assert.equal(snapshot(after.world),baseline);
 assert.equal(status.bollards,8);assert.equal(status.manholes,7);assert.equal(status.storefrontPanels,9);assert(status.drawBatches<=8);assert(status.triangles<115000);
 const newGroup=after.world.streets.group.getObjectByName('streetview-reference-details');assert(newGroup);
 newGroup.traverse(o=>{if(o.isMesh){assert.notEqual(o.geometry.type,'BoxGeometry');assert.notEqual(o.geometry.type,'CylinderGeometry');if(o.isInstancedMesh){assert(o.boundingSphere);assert(o.geometry.attributes.normal);assert(o.geometry.attributes.uv);}}});
 assert(!after.world.streets.group.getObjectByName('legacy-reference-retaining-fence').visible);
 for(const [x,z] of [[60,90],[60,96],[60,119],[50,132],[20,132]])assert.equal(after.world.isWalkable(x,z,.2,'floor1'),before.world.isWalkable(x,z,.2,'floor1'));
 const result={passed:true,unchanged:'road/floor/collision/ramp/gate/landmark/AI spawn and patrol coordinates',status};fs.writeFileSync(path.join(__dirname,'street-reference-test-result.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
})().catch(e=>{console.error(e);process.exitCode=1});
