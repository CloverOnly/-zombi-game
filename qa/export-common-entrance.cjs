// Editable PNG diagrams of the current game layout, oriented from the home door.
const fs=require('node:fs'),path=require('node:path');
const {createCanvas,GlobalFonts}=require('C:/Users/lyj/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@napi-rs/canvas');
GlobalFonts.registerFromPath('C:/Windows/Fonts/malgun.ttf','Malgun Gothic');
const {world:w}=require('./runtime.cjs')();
const C={ink:'#253038',wall:'#586368',floor:'#eef1f2',home:'#f4e9d5',lift:'#e1eaf0',service:'#eeeeea',door:'#9c7952',blue:'#267ba6',red:'#ba5147',muted:'#69767c'};
function setup(W,H){const c=createCanvas(W,H),g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,W,H);return {c,g};}
function text(g,t,x,y,size=30,color=C.ink,align='left',bold=false){g.font=`${bold?'bold ':''}${size}px "Malgun Gothic"`;g.fillStyle=color;g.textAlign=align;g.textBaseline='middle';for(const [i,line]of t.split('\n').entries())g.fillText(line,x,y+i*size*1.45);}
function line(g,x1,y1,x2,y2,color=C.wall,width=7,dash=[]){g.strokeStyle=color;g.lineWidth=width;g.setLineDash(dash);g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke();g.setLineDash([]);}
function arrow(g,x1,y1,x2,y2,color=C.blue,width=5){line(g,x1,y1,x2,y2,color,width);const a=Math.atan2(y2-y1,x2-x1);for(const da of[-.5,.5])line(g,x2,y2,x2-23*Math.cos(a+da),y2-23*Math.sin(a+da),color,width);}
function noteBox(g,x,y,W,H,title){g.strokeStyle='#c9d0d3';g.lineWidth=2;g.strokeRect(x,y,W,H);text(g,title,x+24,y+35,28,C.ink,'left',true);}
{
 const {c,g}=setup(2600,1840),S=125,X=z=>155+(z-6)*S,Y=x=>310+(22.6-x)*S;
 text(g,'공동현관 배치 수정용',130,90,58,C.ink,'left',true);
 text(g,'위에서 내려다본 모습 · 아래가 우리 집, 위가 엘리베이터 방향',134,164,31,C.muted);
 text(g,'현재 게임 배치이며 실측 도면이 아닙니다. 그림판에서 벽·문·통로를 직접 고쳐 주세요.',134,216,27,C.muted);
 function rect(x0,x1,z0,z1,color,stroke=false){g.fillStyle=color;g.fillRect(X(z0),Y(x1),(z1-z0)*S,(x1-x0)*S);if(stroke){g.strokeStyle=C.wall;g.lineWidth=5;g.strokeRect(X(z0),Y(x1),(z1-z0)*S,(x1-x0)*S);}}
 function label(x,z,t,size=27,color=C.ink){text(g,t,X(z),Y(x),size,color,'center');}
 rect(16,20.2,6,18,C.floor);rect(16,19,18,18.7,C.floor);
 // Light one-metre grid helps redraw spacing without obscuring the plan.
 g.save();g.beginPath();g.rect(X(6),Y(20.2),12*S,4.2*S);g.clip();
 for(let z=6;z<=19;z++)line(g,X(z),Y(20.2),X(z),Y(16),'#dde3e6',1);
 for(let x=16;x<=21;x++)line(g,X(6),Y(x),X(18.7),Y(x),'#dde3e6',1);g.restore();
 rect(14.4,16,9.7,11.9,C.home,true);label(15.2,10.8,'우리 집',33);label(14.83,10.8,'현관 안쪽',24,C.muted);
 rect(14.65,16,12.51,13.69,C.service,true);label(15.3,13.1,'404호',25);label(14.96,13.1,'게임 기준',18,C.muted);
 for(const [z,name]of[[9.4,'엘리베이터 1'],[12.2,'엘리베이터 2']]){rect(20.2,22.5,z-.75,z+.75,C.lift,true);label(21.55,z,name,25);label(21.15,z,'내부 크기 임시',19,C.muted);}
 for(const [z,width,name,depth]of[[15,1.02,'계단실',2],[16.4,.68,'설비실',1.4],[17.33,.64,'창고',1.4]]){rect(20.2,20.2+depth,z-width/2,z+width/2,C.service,true);label(20.85,z,name,23);}
 const omit=new Set(['entrance','open-entrance','hall-window','neighbour404','secondary-elevator-closed','lift-floor4','service-계단실','service-설비실','service-창고']);
 g.save();g.beginPath();g.rect(X(5.9),Y(22.65),12.85*S,8.4*S);g.clip();
 for(const a of w.colliders){if(a.kind!=='wall'||omit.has(a.id)||a.minX<15.84||a.maxX>22.6||a.maxZ<6||a.minZ>18.7)continue;rect(a.minX,a.maxX,a.minZ,a.maxZ,C.wall);}
 g.restore();
 // Re-draw primary facade edges so both lift cabins have a clear schematic outline.
 for(const z of[9.4,12.2]){line(g,X(z-.75),Y(22.5),X(z+.75),Y(22.5),C.wall,8);line(g,X(z-.75),Y(22.5),X(z-.75),Y(20.2),C.wall,8);line(g,X(z+.75),Y(22.5),X(z+.75),Y(20.2),C.wall,8);line(g,X(z-.8),Y(20.2),X(z+.8),Y(20.2),C.ink,13);line(g,X(z),Y(20.2)-10,X(z),Y(20.2)+10,'#fff',3);}
 const e=w.homeDoor.point,half=w.homeDoor.width/2;
 line(g,X(e.z-half),Y(16),X(e.z+half),Y(16),'#fff',17);
 line(g,X(e.z-half),Y(16),X(e.z-half),Y(16)+w.homeDoor.width*S,C.door,7);
 g.strokeStyle=C.door;g.lineWidth=2;g.beginPath();g.arc(X(e.z-half),Y(16),w.homeDoor.width*S,0,Math.PI/2);g.stroke();
 label(16.26,10.8,'우리 집 현관문',23,C.door);
 line(g,X(12.51),Y(16),X(13.69),Y(16),C.door,10);
 for(const [z,width]of[[15,1.02],[16.4,.68],[17.33,.64]])line(g,X(z-width/2),Y(20.2),X(z+width/2),Y(20.2),C.door,11);
 for(const dx of[-.045,.045])line(g,X(15.2),Y(16+dx),X(17.5),Y(16+dx),C.blue,5);
 label(15.63,16.35,'옆 복도 창문',26,C.blue);
 for(const z of[9.4,12.2])rect(19.18,19.80,z-.56,z+.56,'#e4d7a0');
 label(18.62,9.4,'점자블록',21,C.muted);label(18.62,12.2,'점자블록',21,C.muted);
 g.fillStyle=C.red;g.beginPath();g.arc(X(10.8),Y(19.94),13,0,Math.PI*2);g.fill();text(g,'소화기',X(10.8),Y(19.94)+44,23,C.red,'center');
 arrow(g,X(10.8),Y(16.65),X(10.8),Y(18.30));
 text(g,'② 현관에서 나온 뒤\n두 번째 사진을 보는 방향',X(10.8)+35,Y(17.1),23,C.blue);
 arrow(g,X(17.8),Y(17.4),X(16.35),Y(17.4));
 text(g,'① 첫 번째 사진 방향',X(16.9),Y(17.4)+43,23,C.blue,'center');
 label(18.0,8.05,'공동현관 홀',30);
 arrow(g,X(17.9),Y(18.55),X(18.63),Y(18.55),C.muted,4);
 text(g,'옆 복도로 계속 →',X(17.25),Y(18.9),24,C.muted);
 // Dimension is deliberately identified as game-only.
 const dz=7.05;line(g,X(dz),Y(16),X(dz),Y(20.2),'#8d999f',2);for(const x of[16,20.2])line(g,X(dz)-12,Y(x),X(dz)+12,Y(x),'#8d999f',2);
 g.save();g.translate(X(dz)-25,Y(18.1));g.rotate(-Math.PI/2);text(g,'게임 기준 약 4.2m',0,0,23,C.muted,'center');g.restore();
 noteBox(g,1875,310,585,600,'수정할 때 표시해 주세요');
 for(const [i,t]of['우리 집 문 위치와 나오는 방향','엘리베이터 두 대의 위치','옆 복도가 이어지는 방향','계단실·설비실·창고 문 위치','창문 위치와 길이'].entries())text(g,`${i+1}. ${t}`,1900,406+i*72,25);
 text(g,'벽은 진한 선, 문은 갈색 선,\n창문과 사진 방향은 파란색입니다.',1900,818,23,C.muted);
 noteBox(g,1875,955,585,570,'전체 연결 참고');
 const ox=1940,oy=1100,scale=14.5;
 g.fillStyle=C.floor;g.fillRect(ox,oy,12*scale,4.2*scale);g.fillRect(ox+12*scale,oy+1.2*scale,16*scale,3*scale);
 g.strokeStyle=C.wall;g.lineWidth=3;g.strokeRect(ox,oy,12*scale,4.2*scale);g.strokeRect(ox+12*scale,oy+1.2*scale,16*scale,3*scale);
 g.fillStyle=C.home;g.fillRect(ox+4*scale,oy+4.2*scale,1.6*scale,1*scale);
 text(g,'우리 집',ox+4.8*scale,oy+6*scale,18,C.muted,'center');
 text(g,'승강기 홀',ox+5.4*scale,oy-35,21,C.ink,'center');
 text(g,'옆 복도 →',ox+20.5*scale,oy-35,21,C.ink,'center');
 text(g,'403호·402호는 현재 게임에서\n옆 복도에 배치되어 있습니다.',1900,1290,23,C.muted);
 text(g,'이 작은 그림은 연결 방향 참고용입니다.\n정확한 위치는 위 도안에 그려 주세요.',1900,1400,22,C.muted);
 noteBox(g,130,1450,1670,225,'추가 수정 메모');
 text(g,'현재 호수·문 폭·벽 길이는 게임에서 정한 임시 값입니다.',134,1740,25,C.muted);
 text(g,'문이 열리는 방향은 아는 곳만 화살표로 추가해 주세요. 원본 사진은 수정하지 않았습니다.',134,1784,24,C.muted);
 fs.writeFileSync(path.join(__dirname,'../common-entrance-plan.png'),c.toBuffer('image/png'));
}
{
 const {c,g}=setup(2400,1550),S=250,X=z=>150+(z-7.5)*S,Y=y=>1110-y*S;
 text(g,'공동현관 정면 수정용',130,85,56,C.ink,'left',true);
 text(g,'두 번째 사진 방향 · 현관문을 나와 엘리베이터 두 대를 바라본 모습',134,157,30,C.muted);
 text(g,'문·표시판·소화기·벽 구획을 그림판에서 직접 수정해 주세요.',134,208,26,C.muted);
 g.fillStyle='#f7f7f5';g.fillRect(X(7.5),Y(2.6),7*S,2.6*S);g.fillStyle='#eeeeeb';g.fillRect(X(7.5),Y(0),7*S,160);
 line(g,X(7.5),Y(0),X(14.5),Y(0),C.wall,12);line(g,X(7.5),Y(2.6),X(14.5),Y(2.6),C.wall,6);
 for(const [z,title]of[[9.4,'엘리베이터 1'],[12.2,'엘리베이터 2']]){
   g.fillStyle='#e3e6e7';g.fillRect(X(z-1.025),Y(2.3),2.05*S,2.3*S);g.strokeStyle=C.wall;g.lineWidth=6;g.strokeRect(X(z-.8),Y(2.22),1.6*S,2.22*S);
   g.fillStyle='#d2d7da';g.fillRect(X(z-.76),Y(2.16),1.52*S,2.16*S);line(g,X(z),Y(0),X(z),Y(2.16),C.wall,3);
   text(g,title,X(z),Y(2.3)-50,31,C.ink,'center',true);
   for(const side of[-1,1]){g.fillStyle='#eee6c9';g.fillRect(X(z+side*.17)-20,Y(1.80),40,29);}
   g.fillStyle='#e4d7a0';g.fillRect(X(z-.56),Y(0)+22,1.12*S,75);
   text(g,'점자블록',X(z),Y(0)+60,23,C.muted,'center');
 }
 g.fillStyle='#d8dddf';g.fillRect(X(10.8)-38,Y(2.02),76,83);text(g,'층수',X(10.8),Y(1.86),25,C.ink,'center');
 g.fillStyle='#c8cfd3';g.fillRect(X(10.7)-24,Y(1.56),48,.48*S);text(g,'호출 버튼',X(10.7)-54,Y(1.33),23,C.muted,'right');
 g.fillStyle='#e2b5b0';g.fillRect(X(10.8)-22,Y(.5),44,.5*S);text(g,'소화기',X(10.8)+42,Y(.25),24,C.red);
 text(g,'현재 정면 배치',X(8.1),Y(.7),24,C.muted,'center');
 arrow(g,2040,1050,2040,710,C.blue,5);text(g,'보는 방향',2040,1120,24,C.blue,'center');
 noteBox(g,130,1330,2135,145,'수정 메모');
 text(g,'게임 기준의 수정용 도안입니다. 실측 크기와 다를 수 있습니다.',134,1510,24,C.muted);
 fs.writeFileSync(path.join(__dirname,'../common-entrance-front.png'),c.toBuffer('image/png'));
}
console.log('Created common-entrance-plan.png and common-entrance-front.png');
