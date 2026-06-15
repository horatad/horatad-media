import {useCurrentFrame,AbsoluteFill} from 'remotion';
import {useRef,useLayoutEffect} from 'react';
import {PLANETS,gP,isRetro} from '../physics.js';

const W=1080,H=1080,SPEED=14*0.3;                       // 0.3 ของความเร็วปกติ
const SUBSET=['sun','mercury','venus'];                 // เฉพาะดาววงใน + ดวงอาทิตย์
const BODIES=PLANETS.filter(p=>SUBSET.includes(p.id));
const SUN=PLANETS.find(p=>p.id==='sun');
const STARS=Array.from({length:220},(_,i)=>({
  x:(Math.sin(i*127.1)*.5+.5),y:(Math.sin(i*311.7)*.5+.5),
  r:i%9===0?1.3:i%3===0?.7:.35,tw:i*0.41
}));

// มุมห่างจากดวงอาทิตย์ (องศา) เมื่อมองจากโลก (จุดศูนย์กลาง)
function elong(p,f){
  const s=gP(SUN,f),r=gP(p,f);
  const d=(s.x*r.x+s.y*r.y)/(Math.hypot(s.x,s.y)*Math.hypot(r.x,r.y));
  return Math.acos(Math.max(-1,Math.min(1,d)))*180/Math.PI;
}

function draw(canvas,frame){
  const ctx=canvas.getContext('2d');
  const f=frame*SPEED;
  const cx=W/2,cy=H/2,sc=Math.min(W,H)/180;            // ซูมเข้าระบบวงใน

  // Background
  ctx.fillStyle='#010814';ctx.fillRect(0,0,W,H);
  const vg=ctx.createRadialGradient(cx,cy,W*.12,cx,cy,W*.6);
  vg.addColorStop(0,'transparent');vg.addColorStop(1,'rgba(0,0,10,.55)');
  ctx.fillStyle=vg;ctx.fillRect(0,0,W,H);

  // Stars
  STARS.forEach(s=>{
    ctx.globalAlpha=.07+Math.abs(Math.sin(s.tw+frame*.015))*.28;
    ctx.fillStyle='#aaccff';ctx.beginPath();ctx.arc(s.x*W,s.y*H,s.r,0,Math.PI*2);ctx.fill();
  });ctx.globalAlpha=1;

  // ตำแหน่งดวงอาทิตย์ + ดาว
  const sr=gP(SUN,f);
  const sx=cx+sr.x*sc,sy=cy+sr.y*sc;
  const pos={};
  BODIES.forEach(p=>{const r=gP(p,f);pos[p.id]={x:cx+r.x*sc,y:cy+r.y*sc};});

  // วง deferent ของดวงอาทิตย์ = วงที่พา epicycle ของดาววงในไป
  ctx.beginPath();ctx.arc(cx,cy,SUN.defR*sc,0,Math.PI*2);
  ctx.strokeStyle='rgba(255,170,70,0.20)';ctx.lineWidth=1;ctx.setLineDash([3,8]);ctx.stroke();ctx.setLineDash([]);

  // ดาววงใน: เส้นเล็งจากโลก + วง epicycle (รอบดวงอาทิตย์) + แขน
  BODIES.filter(p=>p.kind==='inner').forEach(p=>{
    const{x,y}=pos[p.id];
    // เส้นเล็ง โลก -> ดาว (แสดง elongation)
    ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(x,y);
    ctx.strokeStyle=p.col+'2e';ctx.lineWidth=1;ctx.setLineDash([2,6]);ctx.stroke();ctx.setLineDash([]);
    // วง epicycle (epiR จริง) จุดศูนย์กลางอยู่ที่ดวงอาทิตย์
    ctx.beginPath();ctx.arc(sx,sy,p.epiR*sc,0,Math.PI*2);
    ctx.strokeStyle=p.col+'66';ctx.lineWidth=1;ctx.setLineDash([3,4]);ctx.stroke();ctx.setLineDash([]);
    // แขน ดวงอาทิตย์ -> ดาว
    ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(x,y);
    ctx.strokeStyle='rgba(255,255,255,.55)';ctx.lineWidth=1.3;ctx.stroke();
  });

  // เส้น โลก -> ดวงอาทิตย์
  ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(sx,sy);
  ctx.strokeStyle='rgba(255,170,70,.4)';ctx.lineWidth=1.2;ctx.stroke();

  // Earth
  const eR=13;
  ctx.shadowColor='#aaddff';ctx.shadowBlur=24;
  const eg=ctx.createRadialGradient(cx,cy,0,cx,cy,eR);
  eg.addColorStop(0,'#fff');eg.addColorStop(1,'#8bbfff');
  ctx.beginPath();ctx.arc(cx,cy,eR,0,Math.PI*2);ctx.fillStyle=eg;ctx.fill();
  ctx.shadowBlur=0;
  ctx.fillStyle='rgba(180,210,255,.8)';ctx.font='600 13px sans-serif';
  ctx.textAlign='center';ctx.textBaseline='top';ctx.fillText('โลก',cx,cy+eR+4);

  // ดวงอาทิตย์ + ดาววงใน
  const eSize=34;
  BODIES.forEach(p=>{
    const{x,y}=pos[p.id];const retro=p.kind!=='simple'&&isRetro(p,f);
    if(retro){
      const pulse=.5+.5*Math.sin(f*.002);
      ctx.beginPath();ctx.arc(x,y,eSize*(.7+pulse*.15),0,Math.PI*2);
      ctx.strokeStyle='rgba(255,80,80,'+(0.3+pulse*0.2)+')';ctx.lineWidth=1.2;
      ctx.setLineDash([3,3]);ctx.stroke();ctx.setLineDash([]);
    }
    ctx.shadowColor=p.glow;ctx.shadowBlur=16;
    ctx.fillStyle=p.col;ctx.font='bold '+(p.id==='sun'?eSize*1.15:eSize)+'px sans-serif';
    ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(p.n,x,y);
    ctx.shadowBlur=0;
    if(retro){ctx.fillStyle='#ff6666';ctx.font='15px serif';ctx.textBaseline='bottom';ctx.fillText('℞',x,y-eSize*.85);}
  });

  // หัวข้อ (ซ้ายบน)
  ctx.textAlign='left';ctx.textBaseline='alphabetic';
  ctx.fillStyle='#e8d08a';ctx.font='700 30px sans-serif';
  ctx.fillText('ดาววงใน',36,58);
  ctx.fillStyle='rgba(230,208,138,0.8)';ctx.font='600 22px Georgia,serif';
  ctx.fillText('Inner Planets',36,88);
  ctx.fillStyle='rgba(255,255,255,0.5)';ctx.font='400 16px sans-serif';
  ctx.fillText('พุธ · ศุกร์ แกว่งใกล้ดวงอาทิตย์เสมอ',36,116);

  // ค่ามุมห่างสด (ซ้ายล่าง)
  const eM=elong(PLANETS.find(p=>p.id==='mercury'),f);
  const eV=elong(PLANETS.find(p=>p.id==='venus'),f);
  ctx.fillStyle='rgba(255,255,255,.35)';ctx.font='400 14px sans-serif';
  ctx.fillText('มุมห่างจากดวงอาทิตย์ (elongation)',36,H-92);
  ctx.fillStyle='#55DD55';ctx.font='600 20px sans-serif';
  ctx.fillText('พุธ  '+eM.toFixed(0)+'°   (สูงสุด ~28°)',36,H-62);
  ctx.fillStyle='#55BBFF';
  ctx.fillText('ศุกร์ '+eV.toFixed(0)+'°   (สูงสุด ~46°)',36,H-36);

  // เครดิต (ขวาบน)
  ctx.textAlign='right';
  ctx.fillStyle='rgba(255,255,255,0.85)';ctx.font='400 20px Georgia,serif';
  ctx.fillText('based on',W-36,58);
  ctx.fillText('Almagest',W-36,82);
  ctx.fillStyle='rgba(255,255,255,0.55)';ctx.font='400 16px sans-serif';
  ctx.fillText('(~150 AD)',W-36,114);
  ctx.fillText('Horatad created',W-36,135);
  ctx.fillText('9 Jun 2026',W-36,156);
}

export function FullEpicycleInner(){
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
