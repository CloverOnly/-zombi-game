global.ProgressEvent=class {constructor(type,init){this.type=type;Object.assign(this,init)}};
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),T=require('../three.min.js');
const root=path.resolve(__dirname,'..'),window={THREE:T},context={window,self:window,console,TextDecoder,TextEncoder,URL,Blob,ArrayBuffer,Uint8Array};
for(const p of ['assets/vendor/gltf-loader.js','fps-viewmodel.js'])vm.runInNewContext(fs.readFileSync(path.join(root,p),'utf8'),context);
(async()=>{
 const dir=path.join(root,'assets/models/hands/studio-fps'),json=JSON.parse(fs.readFileSync(path.join(dir,'arms.gltf')));
 const original=json.materials.find(m=>m.name==='Studio_Hand_Skin');assert(original.pbrMetallicRoughness.baseColorTexture);assert(original.normalTexture);assert(original.pbrMetallicRoughness.metallicRoughnessTexture);
 for(const image of json.images){const b=fs.readFileSync(path.join(dir,image.uri));assert.equal(b.toString('hex',0,8),'89504e470d0a1a0a');assert([1024,2048].includes(b.readUInt32BE(16)));assert.equal(b.readUInt32BE(16),b.readUInt32BE(20));}
 json.buffers.forEach(b=>b.uri='data:application/octet-stream;base64,'+fs.readFileSync(path.join(dir,b.uri)).toString('base64'));delete json.images;delete json.textures;json.materials=json.materials.map(()=>({pbrMetallicRoughness:{roughnessFactor:.63}}));
 const gltf=await new Promise((ok,fail)=>new window.PoyuGLTFLoader().parse(JSON.stringify(json),'',ok,fail));gltf.scene.traverse(o=>{if(o.isSkinnedMesh){o.material.map=new T.Texture();o.material.normalMap=new T.Texture();o.material.roughnessMap=new T.Texture();}});
 const held=new T.Group(),weapon=new T.Group();held.add(weapon);const rig=window.createPoyuFPSViewModel(T,held,weapon,gltf);
 const handMesh=rig.model.getObjectByName('Studio_Scan_Right_Hand'),profile=JSON.parse(fs.readFileSync(path.join(dir,'handle-profile.json')));let contactSamples=0,minimumClearance=Infinity;
 function measureContact(){
   rig.scene.updateMatrixWorld(true);handMesh.skeleton.update();const center=rig.grip.getWorldPosition(new T.Vector3()),axis=new T.Vector3(0,1,0).applyQuaternion(rig.grip.getWorldQuaternion(new T.Quaternion())),points=[];
   for(let i=0;i<handMesh.geometry.attributes.position.count;i++){const p=new T.Vector3().fromBufferAttribute(handMesh.geometry.attributes.position,i);handMesh.applyBoneTransform(i,p);points.push(p.applyMatrix4(handMesh.matrixWorld));}
   function sample(p){const v=p.sub(center),h=.105+v.dot(axis);if(h<.025||h>.20)return;let j=profile.findIndex(q=>q.height>=h);j=Math.max(1,j<0?profile.length-1:j);const a=profile[j-1],b=profile[j],r=T.MathUtils.lerp(a.radius,b.radius,T.MathUtils.clamp((h-a.height)/(b.height-a.height),0,1));minimumClearance=Math.min(minimumClearance,v.addScaledVector(axis,-v.dot(axis)).length()-r);contactSamples++;}
   const index=handMesh.geometry.index;for(let i=0;i<index.count;i+=3){const a=points[index.getX(i)],b=points[index.getX(i+1)],c=points[index.getX(i+2)];for(const p of [a.clone(),b.clone(),c.clone(),a.clone().lerp(b,.5),b.clone().lerp(c,.5),c.clone().lerp(a,.5),a.clone().add(b).add(c).multiplyScalar(1/3)])sample(p);}
   assert(minimumClearance>.00005,'sampled skin must remain outside the actual handle radius envelope');
 }

assert(rig.info.authoredGrip,'weapon must use the authored grip bone');const gripPosition=weapon.position.clone(),gripParent=weapon.parent,initialWrist=rig.hand.quaternion.clone(),poses=[];
 for(const [swing,time,moving,sprint] of [[-1,0,false,false],[-1,.25,true,false],[-1,.5,true,true],[0,1,false,false],[.24,1.1,false,false],[.381,1.16,false,false],[.57,1.24,false,false],[1,1.42,false,false],[-1,2,false,false]]){
   rig.pose(true,swing,time,0,{moving,sprint});assert.equal(weapon.parent,gripParent);assert(weapon.position.distanceTo(gripPosition)<1e-9);assert(rig.hand.quaternion.angleTo(initialWrist)<1e-5,'wrist stays neutral throughout the swing');
   measureContact();
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
 console.log(JSON.stringify({info:rig.info,gripRigid:true,wristNeutral:true,skinFilesValid:true,handleContact:{samples:contactSamples,minimumClearanceMm:minimumClearance*1000},smoothing:{entryJump,returnJump,entryRootSpeed},clipDurations:Object.fromEntries(gltf.animations.map(c=>[c.name,c.duration])),poses},null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});










