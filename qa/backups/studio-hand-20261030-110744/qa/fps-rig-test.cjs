global.ProgressEvent=class {constructor(type,init){this.type=type;Object.assign(this,init)}};
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),T=require('../three.min.js');
const root=path.resolve(__dirname,'..'),window={THREE:T},context={window,self:window,console,TextDecoder,TextEncoder,URL,Blob,ArrayBuffer,Uint8Array};
for(const p of ['assets/vendor/gltf-loader.js','fps-viewmodel.js'])vm.runInNewContext(fs.readFileSync(path.join(root,p),'utf8'),context);
(async()=>{
 const dir=path.join(root,'assets/models/hands/para-fps'),json=JSON.parse(fs.readFileSync(path.join(dir,'arms.gltf')));
 const original=json.materials[0];assert(original.pbrMetallicRoughness.baseColorTexture);assert(original.normalTexture);assert(original.pbrMetallicRoughness.metallicRoughnessTexture);
 for(const image of json.images){const b=fs.readFileSync(path.join(dir,image.uri));assert.equal(b.toString('hex',0,8),'89504e470d0a1a0a');assert.equal(b.readUInt32BE(16),1024);}
 json.buffers.forEach(b=>b.uri='data:application/octet-stream;base64,'+fs.readFileSync(path.join(dir,b.uri)).toString('base64'));delete json.images;delete json.textures;json.materials=[{pbrMetallicRoughness:{roughnessFactor:.63}}];
 const gltf=await new Promise((ok,fail)=>new window.PoyuGLTFLoader().parse(JSON.stringify(json),'',ok,fail));gltf.scene.traverse(o=>{if(o.isSkinnedMesh){o.material.map=new T.Texture();o.material.normalMap=new T.Texture();o.material.roughnessMap=new T.Texture();}});
 const held=new T.Group(),weapon=new T.Group();held.add(weapon);const rig=window.createPoyuFPSViewModel(T,held,weapon,gltf);

const gripPosition=weapon.position.clone(),gripParent=weapon.parent,initialWrist=rig.hand.quaternion.clone(),poses=[];
 for(const [swing,time,moving,sprint] of [[-1,0,false,false],[-1,.25,true,false],[-1,.5,true,true],[0,1,false,false],[.24,1.1,false,false],[.381,1.16,false,false],[.57,1.24,false,false],[1,1.42,false,false],[-1,2,false,false]]){
   rig.pose(true,swing,time,0,{moving,sprint});assert.equal(weapon.parent,gripParent);assert(weapon.position.distanceTo(gripPosition)<1e-9);assert(rig.hand.quaternion.angleTo(initialWrist)<1e-5,'wrist stays neutral throughout the swing');
   poses.push({state:rig.info.state,swing,wrist:rig.hand.getWorldPosition(new T.Vector3()).toArray(),axis:new T.Vector3(0,1,0).applyQuaternion(rig.grip.getWorldQuaternion(new T.Quaternion())).toArray()});
 }
 rig.pose(false,-1,3,0);assert(!held.visible);assert.equal(rig.info.fingers,5);
 // An attack begun while running must not snap the arm to the idle pose.
 const running={moving:true,sprint:true};for(let i=0;i<=120;i++)rig.pose(true,-1,i/120,0,running);
 const beforeAttack=rig.hand.getWorldPosition(new T.Vector3());rig.pose(true,0,1,0,running);
 const entryJump=beforeAttack.distanceTo(rig.hand.getWorldPosition(new T.Vector3()));assert(entryJump<1e-5,'running -> attack must remain continuous');
 const rootStart=held.position.clone();rig.pose(true,.001/.42,1.001,0,running);
 const entryRootSpeed=held.position.distanceTo(rootStart)/.001;assert(entryRootSpeed<.05,'attack root motion must accelerate from rest');
 for(let i=1;i<=50;i++)rig.pose(true,i/50,1+.42*i/50,0,running);
 const beforeReturn=rig.hand.getWorldPosition(new T.Vector3());rig.pose(true,-1,1.42,0,running);
 const returnJump=beforeReturn.distanceTo(rig.hand.getWorldPosition(new T.Vector3()));assert(returnJump<1e-5,'attack -> running must remain continuous');
 rig.pose(false,-1,2,0);
 for(const name of ['index','middle','ring','pinky'])for(let i=1;i<=3;i++)assert(gltf.scene.getObjectByName(`f_${name}0${i}R`));for(let i=1;i<=3;i++)assert(gltf.scene.getObjectByName(`thumb0${i}R`));
 console.log(JSON.stringify({info:rig.info,gripRigid:true,wristNeutral:true,skinFilesValid:true,smoothing:{entryJump,returnJump,entryRootSpeed},clipDurations:Object.fromEntries(gltf.animations.map(c=>[c.name,c.duration])),poses},null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});









