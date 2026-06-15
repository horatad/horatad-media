import {useCurrentFrame,AbsoluteFill} from 'remotion';
import {useRef,useLayoutEffect} from 'react';
import {PLANETS,gP,isRetro} from '../physics.js';

// ── ดาวเคราะห์ใกล้โลก (Opposition) — เฉลยว่าทำไม "ใกล้สุด=สว่างสุด=ขึ้นเที่ยงคืน=ถอยหลัง" ──
// reuse โมเดล geocentric epicycle (FullEpicycle/AllTrails) · focus ดาวเสาร์ (เหตุการณ์ใกล้โลก ๔ ต.ค. ๒๕๖๙)
// ดาวนอกอยู่บน deferent+epicycle · พอ epicycle เหวี่ยงดาวมาด้าน "ตรงข้ามดวงอาทิตย์" = ใกล้โลกสุด + retrograde
const W=1080,H=1080,SPEED=9;
const CX=540,CY=560,sc=1.0;
const SUN=PLANETS.find(p=>p.id==='sun');
const SAT=PLANETS.find(p=>p.id==='saturn');
const ZS=["เม","พฤ","มถ","กก","สิ","กน","ตล","พจ","ธน","มก","กภ","มน"];
const STARS=Array.from({length:220},(_,i)=>({
  x:(Math.sin(i*127.1)*.5+.5),y:(Math.sin(i*311.7)*.5+.5),
  r:i%9===0?1.3:i%3===0?.7:.35,tw:i*0.41
}));
const wrap=a=>{while(a>Math.PI)a-=2*Math.PI;while(a<-Math.PI)a+=2*Math.PI;return a;};

function draw(canvas,frame){
  const ctx=canvas.getContext('2d');
  const f=frame*SPEED;

  ctx.fillStyle='#010814';ctx.fillRect(0,0,W,H);
  const vg=ctx.createRadialGradient(CX,CY,W*.18,CX,CY,W*.62);
  vg.addColorStop(0,'transparent');vg.addColorStop(1,'rgba(0,0,10,.55)');
  ctx.fillStyle=vg;ctx.fillRect(0,0,W,H);
  STARS.forEach(s=>{
    ctx.globalAlpha=.07+Math.abs(Math.sin(s.tw+frame*.015))*.28;
    ctx.fillStyle='#aaccff';ctx.beginPath();ctx.arc(s.x*W,s.y*H,s.r,0,Math.PI*2);ctx.fill();
  });ctx.globalAlpha=1;

  const sr=gP(SUN,f), str=gP(SAT,f);
  const sx=CX+sr.x*sc, sy=CY+sr.y*sc;
  const stx=CX+str.x*sc, sty=CY+str.y*sc;
  const dfx=CX+str.dx*sc, dfy=CY+str.dy*sc;       // ศูนย์ epicycle เสาร์ (บน deferent)

  // มุม sun–earth–saturn (อีลองเกชัน): 180° = opposition, 0° = conjunction
  const aSun=Math.atan2(sr.y,sr.x), aSat=Math.atan2(str.y,str.x);
  const elong=Math.abs(wrap(aSat-aSun))*180/Math.PI;
  const opp=elong>150;                              // ใกล้ opposition
  const retro=isRetro(SAT,f);
  const dist=Math.hypot(str.x,str.y);               // ระยะ โลก–เสาร์ (model units)

  // deferent เสาร์
  ctx.beginPath();ctx.arc(CX,CY,SAT.defR*sc,0,Math.PI*2);
  ctx.strokeStyle='rgba(204,136,255,.16)';ctx.lineWidth=.6;ctx.setLineDash([2,8]);ctx.stroke();ctx.setLineDash([]);
  // วงโคจรดวงอาทิตย์
  ctx.beginPath();ctx.arc(CX,CY,SUN.defR*sc,0,Math.PI*2);
  ctx.strokeStyle='rgba(255,170,70,.14)';ctx.lineWidth=.8;ctx.setLineDash([3,9]);ctx.stroke();ctx.setLineDash([]);

  // arm โลก→ศูนย์ epicycle + epicycle + arm→เสาร์
  ctx.beginPath();ctx.moveTo(CX,CY);ctx.lineTo(dfx,dfy);
  ctx.strokeStyle='rgba(255,255,255,.18)';ctx.lineWidth=.7;ctx.setLineDash([4,5]);ctx.stroke();ctx.setLineDash([]);
  ctx.beginPath();ctx.arc(dfx,dfy,SAT.epiR*sc,0,Math.PI*2);
  ctx.strokeStyle='rgba(204,136,255,.5)';ctx.lineWidth=.9;ctx.setLineDash([3,3]);ctx.stroke();ctx.setLineDash([]);
  ctx.beginPath();ctx.moveTo(dfx,dfy);ctx.lineTo(stx,sty);
  ctx.strokeStyle='rgba(255,255,255,.6)';ctx.lineWidth=1.1;ctx.stroke();

  // เส้นเล็ง โลก→ดวงอาทิตย์ และ โลก→เสาร์ (โชว์มุมตรงข้าม)
  ctx.beginPath();ctx.moveTo(CX,CY);ctx.lineTo(sx,sy);
  ctx.strokeStyle='rgba(255,170,70,.45)';ctx.lineWidth=1.2;ctx.stroke();
  ctx.beginPath();ctx.moveTo(CX,CY);ctx.lineTo(stx,sty);
  ctx.strokeStyle=opp?'rgba(204,136,255,.8)':'rgba(204,136,255,.3)';ctx.lineWidth=1.3;ctx.stroke();

  // โลก
  const eR=11;
  ctx.shadowColor='#aaddff';ctx.shadowBlur=20;
  const eg=ctx.createRadialGradient(CX,CY,0,CX,CY,eR);
  eg.addColorStop(0,'#fff');eg.addColorStop(1,'#8bbfff');
  ctx.beginPath();ctx.arc(CX,CY,eR,0,Math.PI*2);ctx.fillStyle=eg;ctx.fill();ctx.shadowBlur=0;
  ctx.fillStyle='rgba(180,210,255,.8)';ctx.font='600 13px sans-serif';
  ctx.textAlign='center';ctx.textBaseline='top';ctx.fillText('โลก',CX,CY+eR+3);

  // ดวงอาทิตย์
  ctx.shadowColor='#FF7733';ctx.shadowBlur=30;
  const sg=ctx.createRadialGradient(sx,sy,0,sx,sy,18);
  sg.addColorStop(0,'#FFE7A0');sg.addColorStop(1,'#FF5522');
  ctx.beginPath();ctx.arc(sx,sy,17,0,Math.PI*2);ctx.fillStyle=sg;ctx.fill();ctx.shadowBlur=0;
  ctx.fillStyle='rgba(255,210,150,.85)';ctx.font='600 13px sans-serif';
  ctx.textBaseline='top';ctx.fillText('อาทิตย์ ๑',sx,sy+20);

  // ดาวเสาร์ — ขนาด/แสง ตามระยะ (ใกล้=โต+จ้า)
  const near=(SAT.defR-dist)/(2*SAT.epiR);          // 0..1 (1=ใกล้สุด=opposition)
  const stR=13+9*Math.max(0,Math.min(1,near));
  if(opp){
    const halo=ctx.createRadialGradient(stx,sty,0,stx,sty,stR*3);
    halo.addColorStop(0,'rgba(220,180,255,.55)');halo.addColorStop(1,'transparent');
    ctx.fillStyle=halo;ctx.beginPath();ctx.arc(stx,sty,stR*3,0,Math.PI*2);ctx.fill();
  }
  ctx.shadowColor=SAT.glow;ctx.shadowBlur=16;
  ctx.fillStyle=SAT.col;ctx.font='bold '+stR+'px sans-serif';
  ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(SAT.n,stx,sty);
  ctx.shadowBlur=0;
  ctx.fillStyle='rgba(204,136,255,.95)';ctx.font='600 15px sans-serif';
  ctx.textBaseline='top';ctx.fillText('เสาร์',stx,sty+stR);
  if(retro){
    ctx.fillStyle='#ff6666';ctx.font='14px serif';ctx.textBaseline='bottom';
    ctx.fillText('℞',stx+stR+2,sty);
  }

  // หัวเรื่อง
  ctx.textAlign='left';ctx.textBaseline='alphabetic';
  ctx.fillStyle='#cf9bff';ctx.font='700 31px Georgia,serif';
  ctx.fillText('ดาวเคราะห์ใกล้โลก',36,56);
  ctx.fillStyle='rgba(207,155,255,.8)';ctx.font='600 21px sans-serif';
  ctx.fillText('Opposition — ทำไม "ตรงข้ามดวงอาทิตย์" ถึงเด่นที่สุด',36,90);
  ctx.fillStyle='rgba(255,255,255,.5)';ctx.font='400 16px sans-serif';
  ctx.fillText('โมเดล geocentric: ดาวนอกอยู่บนวงเล็ก (epicycle) รอบเส้นเล็งดวงอาทิตย์',36,120);

  ctx.textAlign='right';
  ctx.fillStyle='rgba(255,255,255,.5)';ctx.font='400 16px sans-serif';
  ctx.fillText('Horatad · เสาร์ใกล้โลก ๔ ต.ค. ๒๕๖๙',W-36,56);
  ctx.fillStyle='rgba(207,155,255,.6)';ctx.font='400 15px sans-serif';
  ctx.fillText('มุมเสาร์–ดวงอาทิตย์ '+elong.toFixed(0)+'°',W-36,80);

  // แคปชันล่าง
  ctx.textAlign='center';
  if(opp){
    ctx.fillStyle='#d6a6ff';ctx.font='700 30px sans-serif';
    ctx.fillText('🪐 OPPOSITION — ดาวเสาร์ใกล้โลกที่สุด',W/2,H-96);
    ctx.fillStyle='rgba(220,190,255,.92)';ctx.font='600 19px sans-serif';
    ctx.fillText('อยู่ "ตรงข้ามดวงอาทิตย์" → ขึ้นหัวค่ำ–ตกรุ่งเช้า เห็นทั้งคืน · สว่างที่สุด',W/2,H-62);
    ctx.fillStyle='rgba(255,170,170,.9)';ctx.font='600 18px sans-serif';
    ctx.fillText('℞ และช่วงนี้เองที่ดาวเดิน "ถอยหลัง" (พักร) — โลกวงในไล่แซงพอดี',W/2,H-32);
  }else{
    ctx.fillStyle='rgba(207,155,255,.8)';ctx.font='600 19px sans-serif';
    ctx.fillText('ดาวเสาร์อยู่ไกล (ค่อนไปทางดวงอาทิตย์) — เล็กและจางกว่า',W/2,H-52);
    ctx.fillStyle='rgba(180,210,255,.7)';ctx.font='500 17px sans-serif';
    ctx.fillText('รอจังหวะมันวกมา "ตรงข้ามดวงอาทิตย์" จะใกล้โลกและสว่างที่สุด',W/2,H-26);
  }
}

export function Opposition(){
  const frame=useCurrentFrame();
  const ref=useRef(null);
  useLayoutEffect(()=>{
    if(!ref.current)return;
    const c=ref.current;c.width=W;c.height=H;draw(c,frame);
  },[frame]);
  return(
    <AbsoluteFill style={{background:'#010814'}}>
      <canvas ref={ref} style={{width:W,height:H,position:'absolute'}}/>
    </AbsoluteFill>
  );
}
