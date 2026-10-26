const fs=require('fs'),vm=require('vm'),THREE=require('../three.min.js');
module.exports=function runtime(callbacks={}){
  const noop=()=>{},gradient=()=>({addColorStop:noop}),ctx=new Proxy({createLinearGradient:gradient,createRadialGradient:gradient},{get:(o,k)=>o[k]??noop});
  const document={createElement:()=>({width:0,height:0,getContext:()=>ctx})},window={};
  for(const n of ['surfaces','street-details','exterior','interior-polish','rooms','zombie','elevator','parking','mart-route','streets','driving','street-ai','hallway','mart-interior','photo-apartment','world','chapter'])vm.runInNewContext(fs.readFileSync(__dirname+'/../'+n+'.js','utf8'),{window,document,Math,console});
  const world=window.createPoyuWorld(THREE,{capabilities:{getMaxAnisotropy:()=>8}}),player={...world.referenceView,stamina:1};
  const chapter=window.createPoyuChapter({world,player,...callbacks});
  const advance=(seconds,input={})=>{for(let t=0;t<seconds;t+=.02)chapter.update(.02,input);};
  return {THREE,window,world,player,chapter,advance};
};
