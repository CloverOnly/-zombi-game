// Read-only extraction from the user's current game. No game files are changed.
const fs=require('node:fs'),path=require('node:path');
const sharp=require('C:/Users/lyj/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const actual='C:/Users/lyj/git/-zombi-game';
const {world:w,THREE:T}=require(path.join(actual,'qa/runtime.cjs'))();
const out=path.join(__dirname,'layout-review-20261030');fs.mkdirSync(out,{recursive:true});
w.scene.updateMatrixWorld(true);
const box=o=>{const b=new T.Box3().setFromObject(o);return {minX:b.min.x,maxX:b.max.x,minZ:b.min.z,maxZ:b.max.z,minY:b.min.y,maxY:b.max.y};};
const data={title:'현재 게임 배치 / user correction sheet',source:actual,extractedAt:new Date().toISOString(),units:'game coordinates, not surveyed metres; no geographic north assigned',
 landmarks:w.streets.landmarks.filter(b=>['poyu','hospital','gs25','twosome'].includes(b.id)),roads:w.streets.roads.filter(r=>['front-road','gs25-alley','cafe-road','driveway','boulevard','main-join'].includes(r.id)),
 hall:box(w.encounter.hallway),apartment:box(w.apartment.group),parking:box(w.parking.group),
 pedestrianEntry:{x:16,z:24.8},decorativePoyuPlate:{x:52.2,z:24.85},vehicleEntry:{x:52,z:75},ramp:[{x:47,z:58},{x:47,z:75},{x:56,z:75}],
 pungjeon:{main:{x:18.77,z:12,extent:[8.5,15.5]},return:{x:24,z:8.26,extent:[20,28]},door:{x:18.94,z:13.75}},
 photoView:{x:60,z:75,lookAt:{x:47,z:75},photo:'010024'},
 notes:['This is the current game layout, not a verified real site plan.','The interior hall is a separate render layer; its horizontal projection overlaps the clinic building.','Labels, entrance directions and building dimensions are open for user correction.']};
fs.writeFileSync(path.join(out,'current-layout-data.json'),JSON.stringify(data,null,2));
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');
function sheet(W,H,title,subtitle){let a=[`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs><pattern id="hatch" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M-2,2 L2,-2 M0,10 L10,0 M8,12 L12,8" stroke="#dc5052" stroke-width="2"/></pattern><marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10Z" fill="#34445a"/></marker></defs><rect width="100%" height="100%" fill="#fff"/><g font-family="Malgun Gothic, 맑은 고딕, sans-serif" fill="#243145">`];
 const text=(x,y,t,size=22,extra='')=>a.push(`<text x="${x}" y="${y}" font-size="${size}" ${extra}>${esc(t)}</text>`);
 const rect=(x,y,ww,hh,fill,stroke='#a5afba',extra='')=>a.push(`<rect x="${x}" y="${y}" width="${ww}" height="${hh}" fill="${fill}" stroke="${stroke}" ${extra}/>`);
 const line=(x1,y1,x2,y2,stroke='#34445a',extra='')=>a.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" ${extra.includes('stroke-width')?'':'stroke-width="2"'} ${extra}/>`);
 text(60,64,title,36,'font-weight="700"');text(60,103,subtitle,20);
 return{a,text,rect,line,finish:()=>a.join('')+'</g></svg>'};}
function map(s,px,py,scale,x0,x1,z0,z1){const X=x=>px+(x-x0)*scale,Z=z=>py+(z-z0)*scale;
 const r=(b,fill,stroke,extra='')=>{if(b.maxX>b.minX&&b.maxZ>b.minZ)s.rect(X(b.minX),Z(b.minZ),(b.maxX-b.minX)*scale,(b.maxZ-b.minZ)*scale,fill,stroke,extra);};
 s.rect(px,py,(x1-x0)*scale,(z1-z0)*scale,'#fafbf9','#c9ced4');
 for(let x=Math.ceil(x0/10)*10;x<=x1;x+=10){s.line(X(x),py,X(x),Z(z1),'#e6e9ed','stroke-width="1"');s.text(X(x),py-12,String(x),17,'text-anchor="middle"');}
 for(let z=Math.ceil(z0/10)*10;z<=z1;z+=10){s.line(px,Z(z),X(x1),Z(z),'#e6e9ed','stroke-width="1"');s.text(px-12,Z(z)+6,String(z),17,'text-anchor="end"');}
 s.text(px,py-39,'게임 X → / 좌표 기준',17);s.text(px,Z(z1)+29,'아래쪽: 게임 Z 증가 · 위쪽이 실제 북쪽이라는 뜻이 아님',17);
 for(const b of data.roads)r({minX:Math.max(x0,b.minX),maxX:Math.min(x1,b.maxX),minZ:Math.max(z0,b.minZ),maxZ:Math.min(z1,b.maxZ)},'#e1e4e7','#bdc4cb');
 return{X,Z,r};}
function building(s,m,b,id,color){const r={minX:b.x-b.width/2,maxX:b.x+b.width/2,minZ:b.z-b.depth/2,maxZ:b.z+b.depth/2};m.r(r,color,'#536d88','stroke-width="3"');const name=id==='A'?'포유하우스':id==='B'?'풍전·병원':id==='C'?'현 코드 GS25':'투썸 건물';
 const yy=m.Z(b.z);s.text(m.X(b.x),yy-6,id+'  '+name,id==='B'?18:23,'text-anchor="middle" font-weight="700"');s.text(m.X(b.x),yy+24,`${b.width} × ${b.depth} / 게임 단위`,17,'text-anchor="middle"');}
function entry(s,m,x,z,n,color){s.a.push(`<circle cx="${m.X(x)}" cy="${m.Z(z)}" r="15" fill="${color}" stroke="#fff" stroke-width="2"/>`);s.text(m.X(x),m.Z(z)+6,n,17,'text-anchor="middle" fill="#fff" font-weight="700"');}
const overview=sheet(1700,1510,'현재 게임 배치도 — 상가 배치 반영','2026-10-30 · 건물 배치 유지 · 실내 복도 투영 표시 제거 · 치수는 게임 좌표');
const m=map(overview,140,190,6,-40,110,-35,150);
for(const b of data.landmarks)building(overview,m,b,{poyu:'A',hospital:'B',gs25:'C',twosome:'D'}[b.id],b.id==='poyu'?'#cbdff0':b.id==='hospital'?'#f2d5bc':'#e0e6ee');
m.r({minX:16,maxX:52,minZ:18,maxZ:58},'none','#5d8193','stroke-dasharray="8 5"');
overview.text(m.X(34),m.Z(42),'2층 주차장 투영',19,'text-anchor="middle"');
const rampPoints=data.ramp.map(p=>`${m.X(p.x)},${m.Z(p.z)}`).join(' ');overview.a.push(`<polyline points="${rampPoints}" fill="none" stroke="#34445a" stroke-width="5" marker-end="url(#arrow)"/>`);
overview.text(m.X(43),m.Z(67),'경사로',18,'text-anchor="end"');
entry(overview,m,16,24.8,'1','#2f806e');entry(overview,m,52,75,'2','#2f806e');entry(overview,m,52.2,24.85,'3','#8a6e9b');
overview.a.push(`<path d="M${m.X(18.77)} ${m.Z(8.5)}V${m.Z(15.5)} M${m.X(20)} ${m.Z(8.26)}H${m.X(28)}" stroke="#b14439" stroke-width="7"/>`);
overview.a.push(`<circle cx="${m.X(60)}" cy="${m.Z(75)}" r="10" fill="#47516a"/>`);overview.line(m.X(59),m.Z(75),m.X(54),m.Z(75),'#34445a','marker-end="url(#arrow)"');
overview.text(m.X(73),m.Z(78),'사진 010024 시점',18,'transform="rotate(90 '+m.X(73)+' '+m.Z(78)+')"');
overview.text(m.X(60),m.Z(28),'현 게임: 주차장 앞 도로',21,'text-anchor="middle" transform="rotate(90 '+m.X(60)+' '+m.Z(28)+')"');
overview.text(m.X(91),m.Z(58),'현 게임: 북유성대로',22,'text-anchor="middle" transform="rotate(90 '+m.X(91)+' '+m.Z(58)+')"');
overview.text(m.X(-4),m.Z(1),'현 게임: 상가 골목',19,'text-anchor="middle"');overview.text(m.X(-3),m.Z(134),'현 게임: 투썸 옆길',19,'text-anchor="middle"');
overview.line(m.X(-35),m.Z(145),m.X(-15),m.Z(145));overview.text(m.X(-25),m.Z(145)-12,'20 게임 단위',18,'text-anchor="middle"');
let x=1110,y=206;overview.text(x,y,'현재 건물 배치',26,'font-weight="700"');
for(const [h,t]of[['A · 포유하우스','위치 / 크기 / 길게 놓인 방향'],['B · 풍전·병원으로 만든 건물','건물 위치 / 가로·세로 방향'],['C · 현재 GS25 표기 건물','실제 건물명과 위치 확인'],['D · 투썸 건물','위치와 포유하우스와의 간격']]){y+=54;overview.text(x,y,h,22,'font-weight="700"');y+=30;overview.text(x,y,t,19);}
y+=63;overview.text(x,y,'출입구와 사진 기준',25,'font-weight="700"');
for(const t of ['① 게임의 보행현관','② 차량 출입구 · 차단기','③ 외벽의 포유하우스 표시','   (①과 별도 위치에 있습니다)','● 사진 시점: 왼쪽을 바라봄']){y+=35;overview.text(x,y,t,20);}
y+=60;overview.text(x,y,'거리뷰의 상가 순서',24,'font-weight="700"');y+=34;overview.text(x,y,'풍전 → 보문산 식후경 → 명륜',20);y+=32;overview.text(x,y,'포유하우스 쪽 코너에서부터',20);
y+=60;overview.text(x,y,'메모',22,'font-weight="700"');for(let i=0;i<5;i++){y+=52;overview.line(x,y,1630,y,'#d7dce1');}
overview.text(60,1420,'실내 복도의 보라색 투영 표시와 겹침 빗금을 제거했습니다. 건물 배치는 유지했습니다.',23);
overview.text(60,1460,'치수는 코드의 설정값입니다. 대지 경계·실측 치수·실제 방위는 확인되지 않았습니다.',19);
const detail=sheet(1700,1110,'포유하우스 · 옆 건물 상가 배치도','실내 복도 투영 표시 제거 · 네이버 거리뷰 2025년 3월 화면을 기준으로 상가 순서 반영');
const n=map(detail,140,190,15,5,65,-10,40);
for(const b of data.landmarks.filter(b=>['poyu','hospital'].includes(b.id))){const bb={...b};if(bb.id==='poyu'){n.r({minX:16,maxX:52,minZ:18,maxZ:40},'#cbdff0','#536d88','stroke-width="3"');detail.text(n.X(38),n.Z(35),'A 포유하우스 (아래로 계속)',24,'text-anchor="middle" font-weight="700"');}else building(detail,n,bb,'B','#f2d5bc');}
detail.rect(n.X(19)+2,n.Z(8.5)+2,32*15-4,7*15-4,'#f2d5bc','none');
detail.text(n.X(35),n.Z(13.7),'B 옆 건물 · 상층 요양병원',21,'text-anchor="middle" font-weight="700"');
for(const [cx,width,name,fill] of [[24,8,'풍전돈까스','#e9d8bb'],[33,7.6,'보문산 식후경','#edf0e2'],[44.3,11.2,'명륜진사갈비','#e3d9be']]){n.r({minX:cx-width/2,maxX:cx+width/2,minZ:8.5,maxZ:11.2},fill,'#8b8476');detail.text(n.X(cx),n.Z(10.3),name,16,'text-anchor="middle" font-weight="700"');}
detail.line(n.X(20),n.Z(6.7),n.X(49),n.Z(6.7),'#34445a','marker-end="url(#arrow)"');
detail.text(n.X(35),n.Z(5.5),'포유하우스 쪽 코너에서부터',18,'text-anchor="middle"');
detail.a.push(`<path d="M${n.X(18.77)} ${n.Z(8.5)}V${n.Z(15.5)} M${n.X(20)} ${n.Z(8.26)}H${n.X(28)}" stroke="#b14439" stroke-width="7"/>`);
entry(detail,n,16,24.8,'1','#2f806e');entry(detail,n,52.2,24.85,'3','#8a6e9b');
detail.text(n.X(10.5),n.Z(30),'게임 보행현관 ①',18,'text-anchor="middle"');detail.line(n.X(13),n.Z(29),n.X(16),n.Z(25.5));
detail.text(n.X(54),n.Z(30),'외벽 표시 ③',18,'text-anchor="middle"');detail.line(n.X(54),n.Z(29),n.X(52.2),n.Z(25.7));
detail.text(n.X(43),n.Z(0),'상가 골목',21,'text-anchor="middle"');
detail.text(n.X(60),n.Z(15),'주차장 앞 도로',21,'text-anchor="middle" transform="rotate(90 '+n.X(60)+' '+n.Z(15)+')"');
let dy=205;const dx=1100;
for(const [h,lines]of [['표시 정리',['실내 복도의 투영과 빗금 제거','건물과 도로 배치는 유지']],['확인한 상가 순서',['풍전돈까스 → 보문산 식후경','→ 명륜진사갈비','코너에서 골목 교차로 쪽으로']],['빨간 선',['풍전의 본 간판과 측면 간판']],['게임 출입구',['① 보행현관 기능 위치','③ 포유하우스 외벽 표지 위치']]]){detail.text(dx,dy,h,24,'font-weight="700"');for(const t of lines){dy+=34;detail.text(dx,dy,t,20);}dy+=54;}
detail.text(60,1020,'풍전돈까스·보문산 식후경·명륜진사갈비의 간판과 매장 구간을 나누어 반영했습니다.',22);
detail.text(60,1060,'실제 치수·실제 방위를 측량한 도면은 아닙니다. 기존 게임 좌표의 배치를 보여 줍니다.',20);
(async()=>{for(const[name,s]of[['01-current-overall-plan',overview],['02-current-overlap-detail',detail]]){const svg=s.finish();fs.writeFileSync(path.join(out,name+'.svg'),svg);await sharp(Buffer.from(svg)).png().toFile(path.join(out,name+'.png'));}console.log('Exported current layout PNG/SVG and source coordinates to '+out);})().catch(e=>{console.error(e);process.exitCode=1});

