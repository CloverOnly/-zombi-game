const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),T=require('../three.min.js');
const root=path.resolve(__dirname,'..');
module.exports=async function load(id,textures=false){
  global.ProgressEvent=global.ProgressEvent||class{constructor(type,data){Object.assign(this,data);}};
  const window={THREE:{...T}};
  class LocalTextureLoader extends T.Loader{load(uri,onLoad){const t=new T.Texture();if(textures){const {loadImage,createCanvas}=require('C:/Users/lyj/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@napi-rs/canvas');loadImage(uri).then(im=>{const c=createCanvas(im.width,im.height);c.getContext('2d').drawImage(im,0,0);t.image=c;onLoad(t);});}else queueMicrotask(()=>onLoad(t));return t;}}
  window.THREE.TextureLoader=LocalTextureLoader;
  const context={window,console,fetch,Request,Headers,TextDecoder,ArrayBuffer,Uint8Array,URL,self:{URL},ProgressEvent:class{constructor(type,data){Object.assign(this,data);}}};
  vm.runInNewContext(fs.readFileSync(path.join(root,'assets/vendor/gltf-loader.js'),'utf8'),context);
  vm.runInNewContext(fs.readFileSync(path.join(root,'assets/furniture',id+'.js'),'utf8'),context);
  return new window.PoyuGLTFLoader().parseAsync(JSON.stringify(window.PoyuFurnitureData[id]),'');
};
