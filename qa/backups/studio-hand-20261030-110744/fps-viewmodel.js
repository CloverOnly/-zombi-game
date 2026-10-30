/* CC0 MakeHuman/para arms. Original anatomy and weights; no generated limb geometry. */
window.createPoyuFPSViewModel=function(T,held,weapon,gltf){
  const scene=new T.Scene(),camera=new T.PerspectiveCamera(),alignment=new T.Group();
  scene.add(camera);camera.add(held);held.position.set(0,0,0);held.rotation.set(0,0,0);held.add(alignment);
  const model=gltf.scene;alignment.add(model);model.name='fps-human-arm';
  const bone=n=>model.getObjectByName(n.replaceAll('.',''));
  const hand=bone('hand.R');if(!hand)throw new Error('FPS arm has no right wrist');
  const mixer=new T.AnimationMixer(model),actions={};
  for(const name of ['Idle','Walk','Run','Attack']){
    const sourceClip=gltf.animations.find(c=>c.name===name);if(!sourceClip)throw new Error('Missing FPS animation: '+name);
    // Remove Blender's leading frame without modifying the downloaded/exported source clips.
    const clip=sourceClip.clone(),start=Math.min(...clip.tracks.map(t=>t.times[0]));
    if(start>0){for(const track of clip.tracks)for(let i=0;i<track.times.length;i++)track.times[i]-=start;clip.resetDuration();}
    actions[name]=mixer.clipAction(clip).play();actions[name].enabled=true;actions[name].paused=true;actions[name].setEffectiveWeight(name==='Idle'?1:0);
  }
  mixer.update(0);scene.updateMatrixWorld(true);
  const pos=n=>held.worldToLocal(bone(n).getWorldPosition(new T.Vector3()));
  const handFrame=held.getWorldQuaternion(new T.Quaternion()).invert().multiply(hand.getWorldQuaternion(new T.Quaternion()));
  const d=new T.Vector3(0,1,0).applyQuaternion(handFrame),u=new T.Vector3(1,0,0).applyQuaternion(handFrame),normal=new T.Vector3().crossVectors(u,d).normalize();
  const up=new T.Vector3(.20,.97,.13).normalize(),forward=new T.Vector3(-.74,.30,-.60);forward.addScaledVector(up,-forward.dot(up)).normalize();
  const palmNormal=new T.Vector3().crossVectors(up,forward).normalize();
  alignment.quaternion.setFromRotationMatrix(new T.Matrix4().makeBasis(up,forward,palmNormal).multiply(new T.Matrix4().makeBasis(u,d,normal).invert()));
  scene.updateMatrixWorld(true);alignment.position.add(new T.Vector3(.20,-.25,-.58).sub(pos('hand.R')));scene.updateMatrixWorld(true);
  const grip=new T.Bone();grip.name='Grip_R';hand.add(grip);
  const center=pos('f_middle.01.R').addScaledVector(forward,-.008).addScaledVector(palmNormal,.025);
  grip.position.copy(hand.worldToLocal(held.localToWorld(center)));
  const tilt=new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),up);
  grip.quaternion.copy(hand.getWorldQuaternion(new T.Quaternion()).invert().multiply(held.getWorldQuaternion(new T.Quaternion())).multiply(tilt));
  grip.scale.setScalar(1/hand.getWorldScale(new T.Vector3()).x);grip.add(weapon);weapon.position.set(0,-.105,0);weapon.rotation.set(0,0,0);weapon.scale.setScalar(.85);
  let skinMesh;
  model.traverse(o=>{if(o.isSkinnedMesh){skinMesh=o;o.frustumCulled=false;}});
  held.traverse(o=>{if(o.isMesh){for(const m of [].concat(o.material)){m.depthTest=true;m.depthWrite=true;}o.renderOrder=0;o.castShadow=false;}});
  if(!skinMesh?.material.map||!skinMesh.material.normalMap||!skinMesh.material.roughnessMap)throw new Error('FPS skin PBR maps missing');
  const ambient=new T.HemisphereLight(0xe2ecff,0x675447,.95),key=new T.DirectionalLight(0xffe9d5,1.8);key.position.set(-1,2,2);scene.add(ambient,key);
  let previousTime=null,locomotion='Idle',gaitPhase=0,gaitHz=1,recoil=0;const weights={Idle:1,Walk:0,Run:0};
  const ease=x=>{x=T.MathUtils.clamp(x,0,1);return x*x*x*(x*(x*6-15)+10);};
  const info={asset:'para / MakeHuman CC0 FPS arms',triangles:skinMesh.geometry.index.count/3,joints:skinMesh.skeleton.bones.length,fingers:5,gripBone:'Grip_R',skinColor:true,skinNormal:true,skinRoughness:true,textureSizes:[skinMesh.material.map,skinMesh.material.normalMap,skinMesh.material.roughnessMap].map(t=>[t.image?.width||0,t.image?.height||0]),animations:Object.keys(actions),normalSource:'authored procedural microdetail',state:'Idle'};
  function pose(hasBat,swing,time,impact,movement={}){
    held.visible=hasBat;if(!hasBat){previousTime=null;recoil=0;return;}
    if(previousTime===null||time<previousTime){weights.Idle=1;weights.Walk=weights.Run=0;gaitPhase=0;gaitHz=1;recoil=0;previousTime=time;}
    const dt=previousTime===null?0:Math.min(.05,Math.max(0,time-previousTime));previousTime=time;
    locomotion=movement.moving?(movement.sprint?'Run':'Walk'):'Idle';
    const attacking=swing>=0;
    const phase=T.MathUtils.clamp(swing,0,1);
    // Enter and leave the swing continuously; its strike still uses the unchanged combat clock.
    const attackWeight=attacking?ease(phase/.18)*ease((1-phase)/.24):0;
    gaitHz=T.MathUtils.damp(gaitHz,1/actions[movement.sprint?'Run':'Walk'].getClip().duration,8,dt);
    if(movement.moving)gaitPhase=(gaitPhase+gaitHz*dt)%1;
    for(const [name,action] of Object.entries(actions)){
      if(name==='Attack'){action.setEffectiveWeight(attackWeight);action.time=phase*action.getClip().duration;continue;}
      const amount=locomotion==='Run'?.85:.82,target=locomotion==='Idle'?(name==='Idle'?1:0):(name===locomotion?amount:name==='Idle'?1-amount:0);
      weights[name]=T.MathUtils.damp(weights[name],target,10,dt);action.setEffectiveWeight(weights[name]*(1-attackWeight));
      action.time=(name==='Idle'?time%action.getClip().duration:gaitPhase*action.getClip().duration);
    }
    mixer.update(0);
    recoil=T.MathUtils.damp(recoil,Math.min(1,(impact||0)/.16),16,dt);
    const reach=attacking?Math.sin(phase*Math.PI)**2:0;held.position.set(recoil*.008,reach*.18-recoil*.008,-reach*.18+recoil*.014);held.rotation.set(-recoil*.025,0,recoil*.018);
    info.state=attacking?'Attack':locomotion;scene.updateMatrixWorld(true);
  }
  function render(renderer,sourceCamera){
    if(!held.visible)return;camera.projectionMatrix.copy(sourceCamera.projectionMatrix);camera.projectionMatrixInverse.copy(sourceCamera.projectionMatrixInverse);
    const autoClear=renderer.autoClear;renderer.autoClear=false;renderer.clearDepth();renderer.render(scene,camera);renderer.autoClear=autoClear;
  }
  return {pose,render,info,scene,model,grip,weapon,hand,mixer};
};

