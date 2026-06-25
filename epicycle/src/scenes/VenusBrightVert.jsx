import {useCurrentFrame,AbsoluteFill,interpolate} from 'remotion';
import {useRef,useLayoutEffect} from 'react';
import {PLANETS,gP,SS} from '../physics.js';
import {Caption} from '../Caption.jsx';
import {Narration} from '../Narration.jsx';
import {Music} from '../Music.jsx';
import {Credit} from '../Credit.jsx';
import * as T from '../timing-vbright.js';

// ── ดาวศุกร์สว่างที่สุด (Greatest Brightness) แนวตั้ง 1080×1920 ──
// มุมใหม่ (ไม่ซ้ำ VenusPhaseVert): ทำไม "เสี้ยว" สว่างกว่า "เต็มดวง"
// = สมดุล ขนาดจาน(ใกล้โลก) × %แสง → ความสว่างพุ่งสุดตอนเสี้ยว ~¼
// verified ephem (22 ก.ย. 69 กทม.): illum 22.6% · ขนาด 42" · mag −4.48 · หัวค่ำ ทิศตะวันตก
const W=1080,H=1920,CX=540,CY=1120;     // diagram ดันลงล่าง (text ขึ้นบนหมด)
const SC=W/178;                          // ย่อ diagram ให้พอดีใต้ HUD
const SUN=PLANETS.find(p=>p.id==='sun');
const VENUS=PLANETS.find(p=>p.id==='venus');

// ── เวลาเดินสม่ำเสมอตามปฏิทินจริง (uniform calendar time) ──
// frame → illum% (เฟส) : เดินสม่ำเสมอช่วงไต่ขึ้น/เข้าใกล้ (มี.ค.→ส.ค.) แล้วช้าลงช่วงสว่างสุด (ส.ค.→ก.ย.28)
//   เพราะ "ช่วงสว่างที่สุด" กินเวลาจริง ~3 สัปดาห์ + เป็นจุดเด่นที่พากย์เล่า → ยืดให้พอดีเนื้อหา
// monotone cubic = ลื่นต่อเนื่อง ไม่กระตุก · ตำแหน่ง/ขนาด/มุมเงย/ทิศ ทั้งหมด map จาก illum นี้ (ค่า ephem จริง)
const ILLUM_KF_X=[120,688,909,1130,1445,1565,1655];   // เฟรม (uniform-day journey + climax ยืด)
const ILLUM_KF_Y=[96,75,61,45,29,22,17];              // illum% ณ วันจริงนั้น (verified ephem)
const F_START=226;
const BRIGHT_FRAME=1545;    // เสี้ยวสว่างสุด (illum ~22%) — สำหรับป้าย mag
function monoCubic(X,Y,x){
  const n=X.length;
  if(x<=X[0])return Y[0];
  if(x>=X[n-1])return Y[n-1];
  const dx=[],m=[];
  for(let i=0;i<n-1;i++){dx[i]=X[i+1]-X[i];m[i]=(Y[i+1]-Y[i])/dx[i];}
  const tg=new Array(n); tg[0]=m[0]; tg[n-1]=m[n-2];
  for(let i=1;i<n-1;i++) tg[i]=(m[i-1]*m[i]<=0)?0:(m[i-1]+m[i])/2;
  for(let i=0;i<n-1;i++){
    if(m[i]===0){tg[i]=0;tg[i+1]=0;continue;}
    const a=tg[i]/m[i],b=tg[i+1]/m[i],hh=Math.hypot(a,b);
    if(hh>3){const tau=3/hh;tg[i]=tau*a*m[i];tg[i+1]=tau*b*m[i];}
  }
  let i=0; while(x>X[i+1])i++;
  const h=dx[i], u=(x-X[i])/h, u2=u*u, u3=u2*u;
  return (2*u3-3*u2+1)*Y[i]+(u3-2*u2+u)*h*tg[i]+(-2*u3+3*u2)*Y[i+1]+(u3-u2)*h*tg[i+1];
}
const illumTarget=frame=>monoCubic(ILLUM_KF_X,ILLUM_KF_Y,frame);

function venusPhaseFactor(aDeg){
  const a=Math.min(163.7,aDeg);
  const dm=-1.044e-3*a+3.687e-4*a*a-2.814e-6*a*a*a+8.938e-9*a*a*a*a;
  return Math.pow(10,-0.4*dm);
}
function metrics(f){
  const sm=gP(SUN,f),vm=gP(VENUS,f);
  const d=Math.hypot(vm.x,vm.y);
  const toSun=[sm.x-vm.x,sm.y-vm.y],toEarth=[-vm.x,-vm.y];
  const dS=Math.hypot(toSun[0],toSun[1]);
  const cosA=(toSun[0]*toEarth[0]+toSun[1]*toEarth[1])/(dS*d);
  const a=Math.acos(Math.max(-1,Math.min(1,cosA)));     // phase angle
  const illum=(1+Math.cos(a))/2;
  const flux=venusPhaseFactor(a*180/Math.PI)/(d*d*dS*dS);
  return {sm,vm,d,cosA,a,illum,flux};
}
// คาลิเบรต: max flux (สำหรับ rel ความสว่าง 0..1)
let BMAX=0; for(let f=0;f<2057;f+=0.5){const fl=metrics(f).flux;if(fl>BMAX)BMAX=fl;}
// inverse: illum% → f (ตาราง precompute · illum ลดลงตาม f ฝั่งหัวค่ำ)
const INVF=(()=>{const a=[];for(let f=F_START;f<=1025;f+=1)a.push([metrics(f).illum*100,f]);return a;})();
function fFromIllum(il){
  const A=INVF;
  if(il>=A[0][0])return A[0][1];
  if(il<=A[A.length-1][0])return A[A.length-1][1];
  for(let i=0;i<A.length-1;i++){if(il<=A[i][0]&&il>=A[i+1][0]){const t=(il-A[i][0])/(A[i+1][0]-A[i][0]);return A[i][1]+(A[i+1][1]-A[i][1])*t;}}
  return A[A.length-1][1];
}
function fPhysAt(frame){return fFromIllum(illumTarget(frame));}

const HZ=1620;                              // เส้นขอบฟ้า (พื้นโลก) = มุมเงย 0°
const ALT_TOP=440, ALT_MAX=45;              // y ที่มุมเงย 45° (บนสุดของแกน)
const SUNPT=[W*0.52,H*1.04];                // ดวงอาทิตย์ใต้ขอบฟ้า ทิศตะวันตก = ทิศที่เสี้ยวหันไป
// มุมเงยจริงเหนือขอบฟ้า ที่อาทิตย์ตก (verified ephem 2569 · กรุงเทพ) ตามเฟส %illum
const ALT_ANCHORS=[[96.7,14.3],[93.9,19.2],[86.9,27.8],[79.1,34.3],[71.9,37.5],[63.7,38.4],[57.6,37.6],[50.7,35.8],[42.9,33.0],[33.7,29.2],[28.4,26.7],[22.6,23.5],[19.1,21.3],[15.5,18.8],[12.8,16.7],[10.2,14.3]];
function altAt(p){
  const A=ALT_ANCHORS;
  if(p>=A[0][0])return A[0][1];
  if(p<=A[A.length-1][0])return A[A.length-1][1];
  for(let i=0;i<A.length-1;i++){if(p<=A[i][0]&&p>=A[i+1][0]){const tt=(p-A[i][0])/(A[i+1][0]-A[i][0]);return A[i][1]+(A[i+1][1]-A[i][1])*tt;}}
  return A[A.length-1][1];
}
const altToY=alt=>HZ-(alt/ALT_MAX)*(HZ-ALT_TOP);
// azimuth จริง ที่อาทิตย์ตก (verified ephem) ตามเฟส — แกว่งเยื้องเหนือ(พ.ค.-มิ.ย.)→ใต้(ก.ย.) · 270=ตะวันตกพอดี
const AZ_ANCHORS=[[95.9,270.8],[87.9,288.7],[74.8,286.9],[61.1,269.3],[48.6,254.0],[38.5,246.0],[29.2,242.2],[22.6,241.3],[15.5,240.0],[10.2,239.0]];
function azAt(p){
  const A=AZ_ANCHORS;
  if(p>=A[0][0])return A[0][1];
  if(p<=A[A.length-1][0])return A[A.length-1][1];
  for(let i=0;i<A.length-1;i++){if(p<=A[i][0]&&p>=A[i+1][0]){const tt=(p-A[i][0])/(A[i+1][0]-A[i][0]);return A[i][1]+(A[i+1][1]-A[i][1])*tt;}}
  return A[A.length-1][1];
}
const STARS=Array.from({length:240},(_,i)=>({
  x:(Math.sin(i*127.1)*.5+.5),y:(Math.sin(i*311.7)*.5+.5)*0.84,
  r:i%11===0?1.5:i%3===0?.7:.35,tw:i*0.41
}));
function lerp(a,b,t){return a+(b-a)*t;}
function mix(c1,c2,t){return `rgb(${Math.round(lerp(c1[0],c2[0],t))},${Math.round(lerp(c1[1],c2[1],t))},${Math.round(lerp(c1[2],c2[2],t))})`;}
// วันที่จริง (verified ephem 2569) ตามเฟส % illum → ป้ายไทม์ไลน์ "เป็นระยะ"
function dateLabel(illum){
  if(illum>=85) return 'มีนาคม ๒๕๖๙';
  if(illum>=62) return 'พฤษภาคม–มิถุนายน';
  if(illum>=42) return 'กรกฎาคม–สิงหาคม';
  if(illum>=27) return 'ต้นกันยายน';
  if(illum>=18) return '๑๙–๒๒ กันยายน ๒๕๖๙';
  return 'ปลายกันยายน';
}

function drawVenusDisk(ctx,x,y,r,cosA,brightAngle){
  ctx.save();
  ctx.translate(x,y);ctx.rotate(brightAngle);
  ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);
  ctx.fillStyle='rgba(10,16,28,0.40)';ctx.fill();           // ด้านมืด = เงาจางบนฟ้า
  ctx.strokeStyle='rgba(150,185,225,0.30)';ctx.lineWidth=1.2;ctx.stroke();
  const xt=r*cosA;
  ctx.beginPath();
  ctx.arc(0,0,r,-Math.PI/2,Math.PI/2,false);
  ctx.ellipse(0,0,Math.abs(xt),r,0,Math.PI/2,-Math.PI/2,xt>0?false:true);
  ctx.closePath();
  const g=ctx.createLinearGradient(-r,0,r,0);
  g.addColorStop(0,'#bfe0ff');g.addColorStop(1,'#ffffff');
  ctx.fillStyle=g;ctx.fill();
  ctx.restore();
}
function roundRect(ctx,x,y,w,h,r){
  ctx.beginPath();ctx.moveTo(x+r,y);
  ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);
  ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();
}

function draw(canvas,frame){
  const ctx=canvas.getContext('2d');
  const f=fPhysAt(frame);
  const m=metrics(f);
  const cx=CX;
  const p=frame/T.DURATION;
  const tw=Math.min(1,p*1.05);                              // ฟ้ามืดลงตามเวลา

  // ── ท้องฟ้าสนธยาหัวค่ำ → มืดลงตามเวลา (โทนน้ำเงิน-ม่วงเข้ม · ไม่แสดจัด) ──
  const sky=ctx.createLinearGradient(0,0,0,HZ);
  sky.addColorStop(0,'#03040c');
  sky.addColorStop(0.5, mix([12,20,46],[3,6,16],tw));
  sky.addColorStop(0.82,mix([30,40,74],[9,13,28],tw));
  sky.addColorStop(0.94,mix([60,58,86],[18,18,30],tw));
  sky.addColorStop(1,   mix([104,90,96],[26,24,30],tw));   // สนธยานวลเทา-ม่วง (ไม่ส้มแสด)
  ctx.fillStyle=sky;ctx.fillRect(0,0,W,HZ);
  STARS.forEach(s=>{
    const yy=s.y*HZ; const dim=Math.max(0,Math.min(1,(HZ-yy)/HZ*1.3));
    ctx.globalAlpha=(.04+Math.abs(Math.sin(s.tw+frame*.015))*.26)*dim*(0.5+0.5*tw);
    ctx.fillStyle='#cfe0ff';ctx.beginPath();ctx.arc(s.x*W,yy,s.r,0,Math.PI*2);ctx.fill();
  });ctx.globalAlpha=1;

  // ── แสงเรืองดวงอาทิตย์ที่ขอบฟ้า (จาง · ไม่ส้มจัด) จางหายตามเวลา ──
  const glo=Math.max(0,1-tw*0.75);
  const sg=ctx.createRadialGradient(SUNPT[0],HZ,0,SUNPT[0],HZ,W*0.7);
  sg.addColorStop(0,'rgba(240,180,130,'+(0.22*glo).toFixed(3)+')');
  sg.addColorStop(0.4,'rgba(200,140,110,'+(0.07*glo).toFixed(3)+')');
  sg.addColorStop(1,'transparent');
  ctx.fillStyle=sg;ctx.fillRect(0,0,W,HZ);

  // ── แกนมุมเงย (องศาเหนือขอบฟ้า) — เส้นประจาง ──
  ctx.strokeStyle='rgba(150,180,225,0.16)';ctx.lineWidth=1;
  ctx.fillStyle='rgba(170,200,240,0.5)';ctx.font='600 20px sans-serif';ctx.textAlign='left';ctx.textBaseline='middle';
  [10,20,30,40].forEach(deg=>{
    const yy=altToY(deg);
    ctx.setLineDash([2,9]);ctx.beginPath();ctx.moveTo(64,yy);ctx.lineTo(W-64,yy);ctx.stroke();ctx.setLineDash([]);
    ctx.fillText(deg+'°',24,yy);
  });

  // ── ตำแหน่งดาวศุกร์: แนวนอน=ตามเวลา · แนวตั้ง=มุมเงยจริง (ขึ้นถึง ~38° แล้วลดลง · verified) ──
  const alt=altAt(m.illum*100);
  const az=azAt(m.illum*100);
  const vx=Math.max(W*0.34,Math.min(W*0.66, W*(0.50+(az-270)*0.0046)));   // ทิศ azimuth จริง (เยื้องเหนือ→ใต้)
  const vy=altToY(alt);

  // ── ดาวศุกร์ เหนือขอบฟ้า: เฟส(จริง)+ขนาดตามระยะ(จริง) · เสี้ยวหันลงหาดวงอาทิตย์ ──
  const brightAngle=Math.atan2(SUNPT[1]-vy,SUNPT[0]-vx);
  const r=Math.min(185,2450/m.d);
  const rel=Math.min(1,m.flux/BMAX);
  // halo เรืองแสง: ยิ่งสว่างจริง(เสี้ยวใหญ่) ยิ่งเด่น — เด่นกว่าดวงกลมเล็กชัดเจน
  const R=r*(1.3+2.3*rel);
  const halo=ctx.createRadialGradient(vx,vy,0,vx,vy,R);
  halo.addColorStop(0,'rgba(232,246,255,'+Math.min(1,0.55+0.6*rel).toFixed(3)+')');
  halo.addColorStop(0.28,'rgba(190,222,255,'+(0.5*rel+0.08).toFixed(3)+')');
  halo.addColorStop(0.6,'rgba(150,195,255,'+(0.22*rel).toFixed(3)+')');
  halo.addColorStop(1,'transparent');
  ctx.fillStyle=halo;ctx.beginPath();ctx.arc(vx,vy,R,0,Math.PI*2);ctx.fill();
  // แสงวาบเสริมตอนสว่างสุด (เสี้ยวใหญ่)
  if(rel>0.45){
    ctx.globalAlpha=Math.min(1,(rel-0.45)*1.8);
    const fl=ctx.createRadialGradient(vx,vy,0,vx,vy,r*2.0);
    fl.addColorStop(0,'rgba(255,255,255,0.5)');fl.addColorStop(0.5,'rgba(210,235,255,0.18)');fl.addColorStop(1,'transparent');
    ctx.fillStyle=fl;ctx.beginPath();ctx.arc(vx,vy,r*2.0,0,Math.PI*2);ctx.fill();
    ctx.globalAlpha=1;
  }
  drawVenusDisk(ctx,vx,vy,r,m.cosA,brightAngle);

  // ป้ายจุดสูงสุด (มุมเงยสูงสุด ~๓๘° · มิ.ย.–ก.ค.)
  if(alt>37.2){
    ctx.globalAlpha=Math.min(1,(alt-37.2)*2.2);ctx.textAlign='center';ctx.textBaseline='bottom';
    ctx.fillStyle='rgba(200,232,255,0.95)';ctx.font='700 28px sans-serif';
    ctx.fillText('▲ ขึ้นสูงสุด ~๓๘° เหนือขอบฟ้า',vx,vy-r-20);
    ctx.globalAlpha=1;
  }

  // ป้าย "ดาวศุกร์" = โชว์ 10 วิแรก (มาตรฐานทุกคลิป)
  const labelA=interpolate(frame,[255,300],[1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
  if(labelA>0.01){
    ctx.globalAlpha=labelA;ctx.textBaseline='alphabetic';ctx.textAlign='center';
    ctx.fillStyle='rgba(210,232,255,0.95)';ctx.font='600 32px Tahoma,sans-serif';
    ctx.fillText('ดาวศุกร์',Math.max(120,Math.min(W-120,vx)),vy-r-24);
    ctx.globalAlpha=1;
  }

  // ── ไทม์ไลน์ "เป็นระยะ" (ไทม์แลปส์ข้ามเดือน · ด้านบนเหนือคำบรรยาย) ──
  const tlY=250, tlX0=160, tlX1=920;
  ctx.strokeStyle='rgba(170,198,240,0.30)';ctx.lineWidth=3;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(tlX0,tlY);ctx.lineTo(tlX1,tlY);ctx.stroke();
  ctx.fillStyle='rgba(180,205,245,0.55)';ctx.font='600 22px sans-serif';ctx.textBaseline='middle';
  ctx.textAlign='right';ctx.fillText('มี.ค.',tlX0-12,tlY);
  ctx.textAlign='left';ctx.fillText('ต.ค.',tlX1+12,tlY);
  const tProg=(frame-120)/(1655-120);            // ไทม์ไลน์เดินสม่ำเสมอตามเวลา (uniform)
  const dotX=lerp(tlX0,tlX1,Math.max(0,Math.min(1,tProg)));
  ctx.shadowColor='#ffd060';ctx.shadowBlur=14;
  ctx.fillStyle='#ffe9a8';ctx.beginPath();ctx.arc(dotX,tlY,9,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
  ctx.textAlign='center';ctx.textBaseline='top';ctx.fillStyle='rgba(255,242,205,0.96)';ctx.font='700 28px sans-serif';
  ctx.fillText('📅 '+dateLabel(m.illum*100),Math.max(180,Math.min(W-180,dotX)),tlY+14);

  // ── เส้นขอบฟ้า + เงาภูเขา (พื้นโลก) ──
  ctx.fillStyle='#05070e';
  ctx.beginPath();ctx.moveTo(0,HZ);
  for(let x=0;x<=W;x+=30){const hh=HZ+22+Math.sin(x*0.013+1.7)*16+Math.sin(x*0.05)*7;ctx.lineTo(x,hh);}
  ctx.lineTo(W,H);ctx.lineTo(0,H);ctx.closePath();ctx.fill();
  ctx.fillStyle='rgba(235,222,200,'+(0.8*(1-tw*0.4)).toFixed(2)+')';ctx.font='700 30px sans-serif';
  ctx.textAlign='center';ctx.textBaseline='bottom';ctx.fillText('🧭 ทิศตะวันตก · หัวค่ำ (หลังอาทิตย์ตก)',W/2,HZ-14);

  // ── ป้าย "สว่างที่สุด · mag −4.5" ตอนสว่างสุด ──
  const atMax=interpolate(frame,[1390,1480,1620,1665],[0,1,1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
  if(atMax>0.01){
    const pulse=0.6+0.4*Math.sin(frame*0.18);
    ctx.globalAlpha=atMax;ctx.textAlign='center';ctx.textBaseline='alphabetic';
    ctx.fillStyle='rgba(255,240,180,'+pulse.toFixed(2)+')';ctx.font='700 40px Tahoma,sans-serif';
    ctx.fillText('✦ สว่างที่สุด · mag −4.5 · ~๒๓°',Math.max(280,Math.min(W-280,vx)),Math.min(vy+r+46,HZ-90));
    ctx.globalAlpha=1;
  }

  // ── seg10: เฉลย "ดาวประจำเมือง(ค่ำ ตะวันตก)" vs "ดาวประกายพรึก(เช้า ตะวันออก)" = ดวงเดียวกัน ──
  const twA=interpolate(frame,[1505,1560,T.CREDIT_AT-10,T.CREDIT_AT+4],[0,1,1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
  if(twA>0.01){
    ctx.globalAlpha=twA;
    const px=80,pw=W-160,py=556,ph=256;
    roundRect(ctx,px,py,pw,ph,24);ctx.fillStyle='rgba(6,12,28,0.85)';ctx.fill();
    ctx.strokeStyle='rgba(255,220,150,0.42)';ctx.lineWidth=1.5;ctx.stroke();
    ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillStyle='#ffd98a';ctx.font='700 32px Tahoma,sans-serif';
    ctx.fillText('🌆 ยามค่ำ · ทิศตะวันตก = ดาวประจำเมือง',W/2,py+46);
    ctx.fillStyle='rgba(255,255,255,0.6)';ctx.font='600 24px Tahoma,sans-serif';
    ctx.fillText('(คือช่วงที่เห็นในคลิปนี้)',W/2,py+86);
    ctx.fillStyle='#bfe0ff';ctx.font='700 32px Tahoma,sans-serif';
    ctx.fillText('🌅 เช้ามืด · ทิศตะวันออก = ดาวประกายพรึก',W/2,py+140);
    ctx.fillStyle='#ffffff';ctx.font='800 30px Tahoma,sans-serif';
    ctx.fillText('★ ดาวศุกร์ ดวงเดียวกัน',W/2,py+202);
    ctx.globalAlpha=1;
  }

  // ── หัวข้อบน ──
  ctx.textAlign='center';ctx.textBaseline='alphabetic';
  ctx.fillStyle='#ffe9a8';ctx.font='800 58px Tahoma,sans-serif';
  ctx.fillText('ดาวศุกร์สว่างที่สุด',cx,150);
  ctx.fillStyle='rgba(255,224,150,0.72)';ctx.font='600 28px Georgia,serif';
  ctx.fillText('Venus at Greatest Brilliancy',cx,192);
}

export function VenusBrightVert(){
  const frame=useCurrentFrame();
  const ref=useRef(null);
  useLayoutEffect(()=>{if(!ref.current)return;const c=ref.current;c.width=W;c.height=H;draw(c,frame);},[frame]);
  const loopFade=interpolate(frame,[0,15,T.DURATION-15,T.DURATION],[0,1,1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
  // การ์ดเปิด: วันสังเกตการณ์ (โผล่ intro ~5วิ)
  const cardOp=interpolate(frame,[0,18,120,150],[0,1,1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
  return(<AbsoluteFill style={{background:'#020a16'}}>
    <AbsoluteFill style={{opacity:loopFade}}>
      <canvas ref={ref} style={{width:W,height:H,position:'absolute'}}/>
      <Caption timing={T} topY={344}/>
      {cardOp>0.001&&(
        <AbsoluteFill style={{opacity:cardOp,justifyContent:'center',alignItems:'center',pointerEvents:'none'}}>
          <div style={{background:'rgba(4,10,24,0.86)',border:'1px solid rgba(255,220,150,0.4)',
            borderRadius:26,padding:'34px 48px',textAlign:'center',maxWidth:900,
            boxShadow:'0 0 60px rgba(255,210,130,0.28)'}}>
            <div style={{color:'#ffe9a8',fontSize:34,fontWeight:600,letterSpacing:1}}>🌟 ปรากฏการณ์ท้องฟ้า ปี ๒๕๖๙</div>
            <div style={{color:'#ffffff',fontSize:64,fontWeight:800,margin:'14px 0 6px'}}>ดาวศุกร์สว่างที่สุด</div>
            <div style={{color:'#ffd98a',fontSize:46,fontWeight:700}}>๒๒ กันยายน · หัวค่ำ ทิศตะวันตก</div>
          </div>
        </AbsoluteFill>
      )}
      <Credit timing={T} label="based on" source="OBSERVATION" sub="greatest brilliancy · ดาวประกายพรึก" startAt={T.CREDIT_AT}/>
    </AbsoluteFill>
    <Narration timing={T} voDir="vo-vbright"/>
    <Music timing={T} music="audio/mozart-k467-andante-clip.mp3" gain={1.3} duck={0.28} creditAt={T.CREDIT_AT}/>
  </AbsoluteFill>);
}
