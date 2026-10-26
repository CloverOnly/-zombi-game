const fs=require('fs'),vm=require('vm'),assert=require('assert'),THREE=require('./three.min.js');
const noop=()=>{},gradient=()=>({addColorStop:noop}),ctx=new Proxy({createLinearGradient:gradient,createRadialGradient:gradient},{get:(o,k)=>o[k]??noop});
const document={createElement:()=>({width:0,height:0,getContext:()=>ctx})},window={};
for(const n of ['surfaces','street-details','exterior','interior-polish','rooms','zombie','elevator','parking','mart-route','streets','driving','street-ai','hallway','mart-interior','photo-apartment','world','chapter'])vm.runInNewContext(fs.readFileSync(__dirname+'/'+n+'.js','utf8'),{window,document,Math,console});
const world=window.createPoyuWorld(THREE,{capabilities:{getMaxAnisotropy:()=>8}}),player={x:15.02,z:10.80,yaw:0,pitch:0,stamina:1};
const messages=[],sounds=[];let deaths=0,completions=0;
const chapter=window.createPoyuChapter({world,player,onMessage:m=>messages.push(m),onCue:s=>sounds.push(s),onDeath:()=>deaths++,onComplete:()=>completions++});
function advance(seconds){for(let t=0;t<seconds;t+=.02)chapter.update(.02);}
function ready(armed=false){for(const i of world.collectibles){i.got=true;i.group.visible=false;}player.stamina=1;chapter.reset({prepared:true,armed,spawnDoor:true});}
function enterCombat(){
  ready(true);assert(chapter.interact('homeDoor'));advance(.6);player.x=16.6;player.z=10.80;player.yaw=0;chapter.update(.02);assert.equal(chapter.state.phase,'combat');
}
ready();
assert.equal(chapter.state.phase,'ready');
chapter.interact('homeDoor');advance(.6);
assert.equal(chapter.state.phase,'first-exit');
assert(world.homeDoor.openness>.95,'door opens visibly');
assert(!world.hasWallBetween(15.1,10.80,16.7,10.80),'open entrance no longer blocks the threshold');
player.x=16.65;chapter.update(.02);
assert.equal(chapter.state.phase,'ambush');assert(world.encounter.zombie.root.visible,'first infected is visible');
advance(2.2);
assert.equal(chapter.state.phase,'seek-bat','first charge forces a safe retreat');
assert(player.x<16&&chapter.state.health===82,'standing in the first attack causes damage before the retreat');
assert.equal(world.homeDoor.target,0);
chapter.interact('homeDoor');assert.equal(chapter.state.phase,'seek-bat','unarmed player must find a weapon');
chapter.interact('shoeCabinet');advance(.6);
assert(world.encounter.cabinet.opened>.95,'cabinet doors animate open');
chapter.interact('bat');assert(chapter.state.hasBat);assert.equal(chapter.state.phase,'armed');
assert(!chapter.getTargets().some(t=>t.id==='bat'),'bat cannot be taken twice');

enterCombat();
const enemy=world.encounter.zombie.root;
enemy.position.set(18.3,0,10.80);player.yaw=Math.PI;
assert(chapter.attack());assert(!chapter.attack(),'one click cannot bypass the swing cooldown');advance(.25);
assert.equal(chapter.state.enemyHP,3,'a swing facing away misses');
advance(.5);player.yaw=0;enemy.position.set(18.2,0,10.80);player.x=16.65;
assert(chapter.attack());advance(.22);assert.equal(chapter.state.enemyHP,2,'aimed in-range swing hits once');
advance(.5);
for(let i=0;i<2;i++){
  player.stamina=1;enemy.position.set(18.15,0,10.80);player.x=16.65;player.yaw=0;
  assert(chapter.attack());advance(.25);advance(.45);
}
assert.equal(chapter.state.enemyHP,0);assert.equal(chapter.state.phase,'survey');
assert(!chapter.blocksPlayer(enemy.position.x,enemy.position.z),'fallen infected does not trap the player');
chapter.interact('neighbour402');chapter.interact('neighbour402');assert.equal(chapter.state.visited.size,1,'repeat inspection does not duplicate progress');
chapter.interact('neighbour403');chapter.interact('neighbour404');
assert.equal(chapter.state.phase,'dialogue');assert(chapter.movementLocked);assert.equal(completions,0);
for(let i=0;i<5;i++)chapter.interact('dialogueNext');
chapter.interact('neighbour405');chapter.interact('neighbour406');
assert.equal(chapter.state.visited.size,5);assert.equal(chapter.state.notes.length,5);assert.equal(chapter.state.phase,'go-parking');assert(chapter.state.neighbourRefused);assert.equal(completions,0,'neighbour survey continues into the parking story');
chapter.interact('neighbour404');assert.equal(completions,0,'rechecking a door cannot finish the chapter');

enterCombat();player.x=17.5;enemy.position.set(18.3,0,10.80);const before=chapter.state.health;
advance(.40);assert.equal(chapter.state.health,before,'attack wind-up gives time to react');
advance(.9);assert(chapter.state.health<before,'a close enemy strike causes damage');
chapter.state.health=18;chapter.state.enemyCooldown=0;chapter.state.windup=0;advance(.8);
assert.equal(chapter.state.phase,'dead');assert.equal(deaths,1);
ready(true);assert.equal(chapter.state.health,100);assert(chapter.state.hasBat);assert.equal(chapter.state.phase,'armed','retry keeps the weapon checkpoint');

world.homeDoor.setOpen(true);advance(.6);
const free=(x,z)=>world.containsFloor(x,z)&&!world.colliders.some(c=>c.enabled!==false&&x+.25>c.minX&&x-.25<c.maxX&&z+.25>c.minZ&&z-.25<c.maxZ);
const q=[[150,83]],seen=new Set(['150,83']);
for(let n=0;n<q.length;n++){const [i,j]=q[n];for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1]]){const a=i+di,b=j+dj,k=a+','+b;if(!seen.has(k)&&free(a*.1,b*.1)){seen.add(k);q.push([a,b]);}}}
for(const neighbour of world.encounter.neighbours)assert(q.some(([i,j])=>Math.hypot(i*.1-neighbour.x,j*.1-neighbour.z)<1.25),neighbour.number+' door can be reached through the corridor');
assert(sounds.includes('growl')&&sounds.includes('hit')&&sounds.includes('knock'));
console.log('Chapter passed: ambush/retreat, cabinet/bat, miss/cooldown/hits, damage/death/retry, 5 neighbours, corridor access');
