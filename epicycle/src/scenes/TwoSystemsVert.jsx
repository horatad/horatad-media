import {useCurrentFrame,AbsoluteFill,interpolate} from 'remotion';
import {useRef,useLayoutEffect} from 'react';
import {PLANETS,gP} from '../physics.js';
import {Caption} from '../Caption.jsx';
import {Narration} from '../Narration.jsx';
import {Music} from '../Music.jsx';
import {Credit} from '../Credit.jsx';
import * as timingTS from '../timing-ts.js';

// ── TwoSystems แนวตั้ง (Shorts) — เทียบ geo(บน) / helio(ล่าง) · พุธ+ศุกร์ ──
// re-layout จาก TwoSystems (ซ้าย-ขวา) → บน-ล่าง สำหรับ 1080×1920
const W=1080,H=1920,SPEED=3.5517;
const SUN=PLANETS.find(p=>p.id==='sun');
const MERC=PLANETS.find(p=>p.id==='mercury');
const VEN=PLANETS.find(p=>p.id==='venus');
const INNER=[MERC,VEN];
const SC=5.0;
const CX=540, CYg=560, CYh=1160;   // geo บน · helio ล่าง (เว้นล่างให้ caption)
const DIVY=900;                     // เส้นแบ่งแนวนอน
const STARS=Array.from({length:200},(_,i)=>({
  x:(Math.sin(i*127.1)*.5+.5),y:(Math.sin(i*311.7)*.5+.5),
  r:i%9===0?1.2:i%3===0?.6:.32,tw:i*0.41
}));
function dot(ctx,x,y,r,c0,c1,glow){
  ctx.shadowColor=glow;ctx.shadowBlur=14;
  const g=ctx.createRadialGradient(x,y,0,x,y,r);
  g.addColorStop(0,c0);g.addColorStop(1,c1);
  ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=g;ctx.fill();ctx.shadowBlur=0;
}
function label(ctx,t,x,y,col,below,off=13){
  ctx.fillStyle=col;ctx.font='600 18px sans-serif';ctx.textAlign='center';
  ctx.textBaseline=below?'top':'bottom';ctx.fillText(t,x,below?y+off:y-off);
}
function nameLabel(ctx,p,dist,x,y,col){
  let t=(p.defR+p.epiR-dist)/(2*p.epiR);t=Math.max(0,Math.min(1,t));
  const op=t*t*(3-2*t);if(op<0.03)return;
  ctx.globalAlpha=op;
  ctx.fillStyle=col||p.col;ctx.font='700 20px sans-serif';ctx.textAlign='center';ctx.textBaseline='bottom';
  ctx.fillText(p.th,x,y-13);ctx.globalAlpha=1;
}
const ICOL=p=>p.id==='venus'?'#e9f0ff':p.col;
const IGLOW=p=>p.id==='venus'?'#cfe2ff':p.glow;

function draw(canvas,frame){
  const ctx=canvas.getContext('2d');
  const f=frame*SPEED;
  ctx.fillStyle='#010814';ctx.fillRect(0,0,W,H);
  STARS.forEach(s=>{ctx.globalAlpha=.06+Math.abs(Math.sin(s.tw+frame*.015))*.24;
    ctx.fillStyle='#aaccff';ctx.beginPath();ctx.arc(s.x*W,s.y*H,s.r,0,Math.PI*2);ctx.fill();});ctx.globalAlpha=1;

  // เส้นแบ่งแนวนอน
  ctx.strokeStyle='rgba(150,170,220,.22)';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(110,DIVY);ctx.lineTo(W-110,DIVY);ctx.stroke();

  const s=gP(SUN,f);

  // ===== บน: GEOCENTRIC (โลกกลาง · อาทิตย์โคจร · พุธ/ศุกร์ epicycle รอบอาทิตย์) =====
  const Lsx=CX+s.x*SC,Lsy=CYg+s.y*SC;
  ctx.beginPath();ctx.arc(CX,CYg,SUN.defR*SC,0,Math.PI*2);
  ctx.strokeStyle='rgba(255,170,70,.10)';ctx.lineWidth=1;ctx.setLineDash([3,8]);ctx.stroke();ctx.setLineDash([]);
  INNER.forEach(p=>{ctx.beginPath();ctx.arc(Lsx,Lsy,p.epiR*SC,0,Math.PI*2);
    ctx.strokeStyle=ICOL(p)+'20';ctx.lineWidth=1;ctx.setLineDash([3,4]);ctx.stroke();ctx.setLineDash([]);});
  dot(ctx,Lsx,Lsy,25,'#fff3d0','#ff8822','#ffaa33');
  INNER.forEach(p=>{const r=gP(p,f);const px=CX+r.x*SC,py=CYg+r.y*SC;
    dot(ctx,px,py,13,'#ffffff',ICOL(p),IGLOW(p));
    nameLabel(ctx,p,Math.hypot(r.x,r.y),px,py,ICOL(p));});
  dot(ctx,CX,CYg,13,'#fff','#5599ee','#aaddff');
  label(ctx,'โลก',CX,CYg,'rgba(190,220,255,.95)',true);

  // ===== ล่าง: HELIOCENTRIC (อาทิตย์กลาง · โลก/พุธ/ศุกร์ โคจรรอบ) =====
  const Ehx=-s.x,Ehy=-s.y;
  const Rex=CX+Ehx*SC,Rey=CYh+Ehy*SC;
  [[SUN.defR,'#8bbfff'],[MERC.epiR,MERC.col],[VEN.epiR,'#e9f0ff']].forEach(([rr,col])=>{
    ctx.beginPath();ctx.arc(CX,CYh,rr*SC,0,Math.PI*2);
    ctx.strokeStyle=col+'18';ctx.lineWidth=1;ctx.setLineDash([3,7]);ctx.stroke();ctx.setLineDash([]);});
  dot(ctx,CX,CYh,25,'#fff3d0','#ff8822','#ffaa33');
  label(ctx,'อาทิตย์',CX,CYh,'rgba(255,200,120,.9)',true,23);
  INNER.forEach(p=>{const r=gP(p,f);const phx=CX+(r.x-r.dx)*SC,phy=CYh+(r.y-r.dy)*SC;
    dot(ctx,phx,phy,13,'#ffffff',ICOL(p),IGLOW(p));
    nameLabel(ctx,p,Math.hypot(r.x,r.y),phx,phy,ICOL(p));});
  dot(ctx,Rex,Rey,13,'#fff','#5599ee','#aaddff');
  label(ctx,'โลก',Rex,Rey,'rgba(190,220,255,.95)',Rey<CYh);

  // ===== หัวข้อแต่ละระบบ =====
  ctx.textAlign='center';ctx.textBaseline='alphabetic';
  // geo (บนสุด)
  ctx.fillStyle='#e8d08a';ctx.font='700 30px sans-serif';
  ctx.fillText('แบบโบราณ: โลกเป็นศูนย์กลาง',CX,200);
  ctx.fillStyle='rgba(230,208,138,.6)';ctx.font='500 19px Georgia,serif';
  ctx.fillText('Geocentric · Epicycle · Ptolemy',CX,228);
  // helio (ใต้เส้นแบ่ง)
  ctx.fillStyle='#9fd3ff';ctx.font='700 30px sans-serif';
  ctx.fillText('แบบจริง: ดวงอาทิตย์เป็นศูนย์กลาง',CX,DIVY+42);
  ctx.fillStyle='rgba(159,211,255,.6)';ctx.font='500 19px Georgia,serif';
  ctx.fillText('Heliocentric · Copernicus',CX,DIVY+68);
}

export function TwoSystemsVert(){
  const frame=useCurrentFrame();
  const ref=useRef(null);
  useLayoutEffect(()=>{if(!ref.current)return;const c=ref.current;c.width=W;c.height=H;draw(c,frame);},[frame]);
  const loopFade=interpolate(frame,[0,15,timingTS.DURATION-15,timingTS.DURATION],[0,1,1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
  return(<AbsoluteFill style={{background:'#010814'}}>
    <AbsoluteFill style={{opacity:loopFade}}>
      <canvas ref={ref} style={{width:W,height:H,position:'absolute'}}/>
      <Caption timing={timingTS}/>
      <Credit timing={timingTS}/>
    </AbsoluteFill>
    <Narration timing={timingTS} voDir="vo-ts"/>
    <Music timing={timingTS} music="audio/shostakovich-waltz2-loop.wav"/>
  </AbsoluteFill>);
}
