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
 assert.equal(status.bollards,8);assert.equal(status.manholes,7);assert.equal(status.storefrontPanels,9);assert(status.closurePanels>150);assert(status.drawBatches<=9);assert(status.triangles<115000);
 const newGroup=after.world.streets.group.getObjectByName('streetview-reference-details');assert(newGroup);
 newGroup.traverse(o=>{if(o.isMesh){assert.notEqual(o.geometry.type,'BoxGeometry');assert.notEqual(o.geometry.type,'CylinderGeometry');if(o.isInstancedMesh){assert(o.boundingSphere);assert(o.geometry.attributes.normal);assert(o.geometry.attributes.uv);}}});
 assert(!after.world.streets.group.getObjectByName('legacy-reference-retaining-fence').visible);
 after.world.scene.updateMatrixWorld(true);
 const opaque=[];newGroup.traverse(o=>{if(o.isMesh&&/^(building-|parking-turn-lining)/.test(o.name))opaque.push(o);});
 const ground=after.world.streets.groundY,blocked=[];
 function ray(origin,direction,max=40){return new T.Raycaster(new T.Vector3(origin[0],origin[1]+ground,origin[2]),new T.Vector3(...direction),0,max).intersectObjects(opaque,false);}
 for(const [name,origin,direction] of [
  ['cafe ceiling',[50,4.8,121],[0,1,0]],['cafe north wall',[50,4.8,120],[0,0,-1]],['cafe west wall',[50,4.8,120],[-1,0,0]],
  ['glazing seam',[51.7,4.5,101.65],[1,0,0]],['corner closure',[52.15,4.5,122.7],[0,0,1]],
  ['parking west wall',[50,1.8,75],[-1,0,0]],['parking ceiling',[50,1.8,75],[0,1,0]]
 ]){assert(ray(origin,direction).length,'missing opaque surface: '+name);blocked.push(name);}
 assert.equal(ray([50,1.1,75],[1,0,0],10).length,0,'parking exit must stay open');
 for(const x of [44,46,48,50,51.5]){const floor=after.world.streets.rampSurface(x,75).y-ground;const hits=ray([x,floor+.1,75],[0,1,0],5);assert(hits.length,'turn ceiling must cover the route');assert(hits[0].distance>2.5,'ceiling must clear the existing vehicle path');}
 for(const o of opaque)if(o.name.startsWith('parking-turn-lining'))assert(new T.Box3().setFromObject(o).max.x<=51.91,'tunnel lining must remain behind the street facade');
 for(const [x,z] of [[60,90],[60,96],[60,119],[50,132],[20,132]])assert.equal(after.world.isWalkable(x,z,.2,'floor1'),before.world.isWalkable(x,z,.2,'floor1'));
 const result={passed:true,blockedSkyRays:blocked,parkingExitOpen:true,unchanged:'road/floor/collision/ramp/gate/landmark/AI spawn and patrol coordinates',status};fs.writeFileSync(path.join(__dirname,'street-reference-test-result.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
})().catch(e=>{console.error(e);process.exitCode=1});
