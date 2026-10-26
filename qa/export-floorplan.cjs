const fs=require('fs');
const {createCanvas,GlobalFonts}=require('C:/Users/lyj/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@napi-rs/canvas');
GlobalFonts.registerFromPath('C:/Windows/Fonts/malgun.ttf','Malgun Gothic');
const {world}=require('./runtime.cjs')(),a=world.apartment;
const W=1800,H=1900,S=90,c=createCanvas(W,H),g=c.getContext('2d');
const X=x=>150+(x-1.8)*S,Y=z=>155+(z+4.5)*S;
g.fillStyle='#fff';g.fillRect(0,0,W,H);g.fillStyle='#20252b';g.font='34px "Malgun Gothic"';g.fillText('집 구조 — 방 3개 · 화장실 2개',100,65);
g.font='22px "Malgun Gothic"';g.fillStyle='#68717a';g.fillText('베란다 창문 2개 · 현관 수납함·신발장 위치 반영 · 치수는 추정',100,103);
for(const r of a.rooms){g.fillStyle=r.kind==='bathroom'?'#e9f0f4':r.kind==='bedroom'?'#f4f5f6':r.kind==='balcony'?'#eef2f0':'#fbfbfb';g.fillRect(X(r.minX),Y(r.minZ),(r.maxX-r.minX)*S,(r.maxZ-r.minZ)*S);}
const inside=p=>p.minX>=1.72&&p.maxX<=16.1&&p.minZ>=-4.58&&p.maxZ<=11.88;
for(const p of world.placements.filter(inside)){g.fillStyle='#dfe3e7';g.strokeStyle='#b9c1c8';g.lineWidth=1.5;g.fillRect(X(p.minX),Y(p.minZ),(p.maxX-p.minX)*S,(p.maxZ-p.minZ)*S);g.strokeRect(X(p.minX),Y(p.minZ),(p.maxX-p.minX)*S,(p.maxZ-p.minZ)*S);}
for(const p of world.colliders.filter(p=>p.kind==='wall'&&p.id!=='entrance'&&inside(p))){g.fillStyle=p.id==='balcony-outer'?'#7a8a8d':'#24282e';g.fillRect(X(p.minX),Y(p.minZ),Math.max(2,(p.maxX-p.minX)*S),Math.max(2,(p.maxZ-p.minZ)*S));}
function text(x,z,t,size=24,color='#20252b'){g.font=size+'px "Malgun Gothic"';g.fillStyle=color;g.textAlign='center';g.textBaseline='middle';g.fillText(t,X(x),Y(z));}
for(const d of a.doorways){g.strokeStyle='#68717a';g.lineWidth=2;g.beginPath();if(d.axis==='x'){g.moveTo(X(d.x),Y(d.z-d.width/2));g.lineTo(X(d.x-.65),Y(d.z-d.width/2));}else{g.moveTo(X(d.x-d.width/2),Y(d.z));g.lineTo(X(d.x-d.width/2),Y(d.z-.65));}g.stroke();}
g.strokeStyle='#a2aba7';g.lineWidth=4;g.setLineDash([5,4]);for(const [lo,hi]of[[.12,3.08],[4.3,6.9]]){g.beginPath();g.moveTo(X(4.22),Y(lo));g.lineTo(X(4.22),Y(hi));g.stroke();}g.setLineDash([]);
g.fillStyle='#252a2c';g.fillRect(X(5.76),Y(.09),1.48*S,.07*S);
text(6.8,-.70,'안방',28);text(9.75,-3.42,'화장실 2',21);text(13.55,-.7,'작은방',28);
text(6.2,8.1,'작은방 2',28);text(9.7,10.3,'화장실 1',27);text(14.05,9.1,'현관',27);
text(2.95,2.4,'베란다',27);text(7.2,2.4,'거실',28);text(13.6,2.4,'주방',28);text(10.15,-1.05,'연결 공간',20);
text(9.0,7.8,'거실 연결',20);
text(6.5,.55,'TV',24);text(6.2,6.23,'소파',24);text(6.4,3.8,'낮은 테이블',18);text(12.65,5.15,'식탁',26);text(13.25,.56,'냉장고',19);text(15.57,2.675,'조리대',18);
text(6.2,6.91,'소파 뒤 벽',19);
g.strokeStyle='#2677bc';g.fillStyle='#2677bc';g.lineWidth=3;g.beginPath();g.moveTo(X(9.7),Y(8.95));g.lineTo(X(9.7),Y(.65));g.stroke();g.beginPath();g.moveTo(X(9.55),Y(.9));g.lineTo(X(9.7),Y(.65));g.lineTo(X(9.85),Y(.9));g.stroke();g.beginPath();g.arc(X(9.7),Y(8.95),7,0,Math.PI*2);g.fill();text(10.3,6.6,'사진 방향 ↑',20,'#2677bc');
const ep=world.homeDoor.point;g.strokeStyle='#24282e';g.lineWidth=3;g.beginPath();g.moveTo(X(ep.x),Y(ep.z-.53));g.lineTo(X(ep.x-.73),Y(ep.z-.53));g.stroke();text(17.25,ep.z,'현관문',22);
text(14.75,7.4,'수납함',20);text(14.2,11.45,'신발장',22);
for(const [i,w]of a.anchors.windows.entries()){g.strokeStyle='#2677bc';g.lineWidth=4;for(const dx of[-.07,.07]){g.beginPath();g.moveTo(X(w.x+dx),Y(w.z-w.length/2));g.lineTo(X(w.x+dx),Y(w.z+w.length/2));g.stroke();}g.save();g.translate(X(1.8)-40,Y(w.z));g.rotate(-Math.PI/2);g.font='24px "Malgun Gothic"';g.fillStyle='#2677bc';g.fillText('창문 '+(i+1),0,0);g.restore();}
g.textAlign='left';g.textBaseline='alphabetic';g.font='22px "Malgun Gothic"';g.fillStyle='#20252b';g.fillText('베란다는 하나로 이어지고 창문은 2개 · 작은방 2 옆에도 베란다가 이어집니다.',100,1770);
g.fillStyle='#68717a';g.fillText('위쪽 화장실은 도면의 틈을 따라 안방에서 출입하는 연결로 해석했습니다.',100,1810);g.fillText('시작 위치는 안방입니다. 파란 화살표는 아래쪽 화장실에서 사진을 찍은 방향입니다.',100,1850);
const out=__dirname+'/../confirmed-floor-plan.png';fs.writeFileSync(out,c.toBuffer('image/png'));console.log(out);
