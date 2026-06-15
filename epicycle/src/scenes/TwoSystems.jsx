import {useCurrentFrame,AbsoluteFill,Audio,Sequence,staticFile,interpolate} from 'remotion';
import {useRef,useLayoutEffect} from 'react';
import {PLANETS,gP} from '../physics.js';

// ── เทียบสองระบบ: ซ้าย Geocentric(Epicycle) | ขวา Heliocentric ──
// โลก·อาทิตย์·พุธ·ศุกร์ · ซิงค์เวลาเดียวกัน · มุมห่าง(elongation)ที่เห็นจากโลกเท่ากันทั้งสองแบบ
// แก่น: geo ต้อง "บังคับ" ศูนย์ epicycle ของพุธ/ศุกร์ให้ผูกดวงอาทิตย์ · helio วงในกว่าโลกเลยใกล้ดวงอาทิตย์เอง
const W=1080,H=1080;
const SPEED=3.5517;                  // sync วอลทซ์: ดวงอาทิตย์ 1 รอบ = 10 บาร์ (12.07วิ) = loop/3
const MUSIC=staticFile('audio/shostakovich-waltz2-loop.wav');
const LOOP=1086,END=1590,TAIL=END-LOOP;  // END=1590=53วิ@30fps (มาตรฐาน: คลิปมีเพลง ≤59วิ) · เพลง 36.2วิ/loop · loop2 เล่นถึง END แล้ว fade
const fadeIn=f=>interpolate(f,[0,18],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
const fadeOutTail=f=>interpolate(f,[TAIL-45,TAIL],[1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});  // fade out 1.5วิ ปลายคลิป กลบรอยตัดกลาง loop
const SUN=PLANETS.find(p=>p.id==='sun');
const MERC=PLANETS.find(p=>p.id==='mercury');
const VEN=PLANETS.find(p=>p.id==='venus');
const INNER=[MERC,VEN];
const SC=4.6;                        // สเกลร่วม (Sun-Earth ระยะเท่ากันทั้งสองซีก)
const DIV=648;                       // เส้นแบ่ง — เน้น Geocentric ซ้าย ~60% · Heliocentric ขวา ~40%
const LCx=324,RCx=864,CY=590;        // ศูนย์กลางสองซีก
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
function label(ctx,t,x,y,col,below,off=11){
  ctx.fillStyle=col;ctx.font='600 14px sans-serif';ctx.textAlign='center';
  ctx.textBaseline=below?'top':'bottom';ctx.fillText(t,x,below?y+off:y-off);
}
// label พุธ/ศุกร์ — โผล่เมื่อใกล้โลก จางเมื่อไกล (dist = ระยะโลก-ดาว หน่วยจริง)
function nameLabel(ctx,p,dist,x,y,col){
  let t=(p.defR+p.epiR-dist)/(2*p.epiR);t=Math.max(0,Math.min(1,t));
  const op=t*t*(3-2*t);                 // smoothstep: นุ่มหัวท้าย
  if(op<0.03)return;
  ctx.globalAlpha=op;
  ctx.fillStyle=col||p.col;ctx.font='700 15px sans-serif';ctx.textAlign='center';ctx.textBaseline='bottom';
  ctx.fillText(p.th,x,y-11);
  ctx.globalAlpha=1;
}
// สีดาววงในในฉากนี้ — ศุกร์ใช้ขาวสว่าง (แยกจากโลกง่าย · ตรงกับดาวศุกร์จริงที่สว่างขาว)
const ICOL=p=>p.id==='venus'?'#e9f0ff':p.col;
const IGLOW=p=>p.id==='venus'?'#cfe2ff':p.glow;

function draw(canvas,frame){
  const ctx=canvas.getContext('2d');
  const f=frame*SPEED;

  ctx.fillStyle='#010814';ctx.fillRect(0,0,W,H);
  STARS.forEach(s=>{
    ctx.globalAlpha=.06+Math.abs(Math.sin(s.tw+frame*.015))*.24;
    ctx.fillStyle='#aaccff';ctx.beginPath();ctx.arc(s.x*W,s.y*H,s.r,0,Math.PI*2);ctx.fill();
  });ctx.globalAlpha=1;

  // เส้นแบ่ง
  ctx.strokeStyle='rgba(150,170,220,.22)';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(DIV,150);ctx.lineTo(DIV,H-150);ctx.stroke();

  const s=gP(SUN,f);                          // ดวงอาทิตย์ (geocentric)

  // ===================== ซ้าย: GEOCENTRIC =====================
  // โลกกลาง · ดวงอาทิตย์โคจรรอบ (deferent) · พุธ/ศุกร์ epicycle รอบดวงอาทิตย์
  const Lsx=LCx+s.x*SC,Lsy=CY+s.y*SC;
  // วง deferent ดวงอาทิตย์ (วงโคจร — จาง)
  ctx.beginPath();ctx.arc(LCx,CY,SUN.defR*SC,0,Math.PI*2);
  ctx.strokeStyle='rgba(255,170,70,.10)';ctx.lineWidth=1;ctx.setLineDash([3,8]);ctx.stroke();ctx.setLineDash([]);
  // วง epicycle ของพุธ/ศุกร์ รอบดวงอาทิตย์ (วงโคจร — จาง)
  INNER.forEach(p=>{
    ctx.beginPath();ctx.arc(Lsx,Lsy,p.epiR*SC,0,Math.PI*2);
    ctx.strokeStyle=ICOL(p)+'20';ctx.lineWidth=1;ctx.setLineDash([3,4]);ctx.stroke();ctx.setLineDash([]);
  });
  // ดวงอาทิตย์
  dot(ctx,Lsx,Lsy,19,'#fff3d0','#ff8822','#ffaa33');
  // พุธ/ศุกร์ + label ตามระยะ (ศุกร์ = ขาวสว่าง)
  INNER.forEach(p=>{const r=gP(p,f);const px=LCx+r.x*SC,py=CY+r.y*SC;
    dot(ctx,px,py,9,'#ffffff',ICOL(p),IGLOW(p));
    nameLabel(ctx,p,Math.hypot(r.x,r.y),px,py,ICOL(p));});
  // โลก (กลาง)
  dot(ctx,LCx,CY,9,'#fff','#5599ee','#aaddff');
  label(ctx,'โลก',LCx,CY,'rgba(190,220,255,.95)',true);

  // ===================== ขวา: HELIOCENTRIC =====================
  // ดวงอาทิตย์กลาง · โลก/พุธ/ศุกร์ โคจรรอบ
  // helio: Earth=-Sun_geo ; planet=epicycle vec=(p.x-p.dx)
  const Ehx=-s.x,Ehy=-s.y;
  const Rex=RCx+Ehx*SC,Rey=CY+Ehy*SC;
  // วงโคจร โลก/พุธ/ศุกร์ (จาง)
  [[SUN.defR,'#8bbfff'],[MERC.epiR,MERC.col],[VEN.epiR,'#e9f0ff']].forEach(([rr,col])=>{
    ctx.beginPath();ctx.arc(RCx,CY,rr*SC,0,Math.PI*2);
    ctx.strokeStyle=col+'18';ctx.lineWidth=1;ctx.setLineDash([3,7]);ctx.stroke();ctx.setLineDash([]);
  });
  // ดวงอาทิตย์ (กลาง)
  dot(ctx,RCx,CY,19,'#fff3d0','#ff8822','#ffaa33');
  label(ctx,'อาทิตย์',RCx,CY,'rgba(255,200,120,.9)',true,23);
  // พุธ/ศุกร์ + label ตามระยะ (ศุกร์ = ขาวสว่าง)
  INNER.forEach(p=>{const r=gP(p,f);const phx=RCx+(r.x-r.dx)*SC,phy=CY+(r.y-r.dy)*SC;
    dot(ctx,phx,phy,9,'#ffffff',ICOL(p),IGLOW(p));
    nameLabel(ctx,p,Math.hypot(r.x,r.y),phx,phy,ICOL(p));});
  // โลก
  dot(ctx,Rex,Rey,9,'#fff','#5599ee','#aaddff');
  label(ctx,'โลก',Rex,Rey,'rgba(190,220,255,.95)',Rey<CY);

  // ===================== หัวข้อ + เครดิต =====================
  ctx.textAlign='center';ctx.textBaseline='alphabetic';
  // เครดิตกลางบน
  ctx.fillStyle='rgba(255,255,255,.6)';ctx.font='500 17px sans-serif';
  ctx.fillText('Horatad created · 11 June 2026',W/2,42);
  // ซีกซ้าย
  ctx.fillStyle='#e8d08a';ctx.font='700 24px sans-serif';
  ctx.fillText('แบบโบราณ: โลกเป็นศูนย์กลาง',LCx,82);
  ctx.fillStyle='rgba(230,208,138,.72)';ctx.font='500 17px Georgia,serif';
  ctx.fillText('Geocentric · Epicycle',LCx,108);
  ctx.fillStyle='rgba(230,208,138,.5)';ctx.font='400 14px sans-serif';
  ctx.fillText('อ้างอิง Ptolemy · Almagest (~ค.ศ. 150)',LCx,132);
  // ซีกขวา
  ctx.fillStyle='#9fd3ff';ctx.font='700 24px sans-serif';
  ctx.fillText('แบบจริง: ดวงอาทิตย์เป็นศูนย์กลาง',RCx,82);
  ctx.fillStyle='rgba(159,211,255,.72)';ctx.font='500 17px Georgia,serif';
  ctx.fillText('Heliocentric',RCx,108);
  ctx.fillStyle='rgba(159,211,255,.5)';ctx.font='400 14px sans-serif';
  ctx.fillText('อ้างอิง Copernicus · De revolutionibus (ค.ศ. 1543)',RCx,132);
}

export function TwoSystems(){
  const frame=useCurrentFrame();
  const ref=useRef(null);
  useLayoutEffect(()=>{
    if(!ref.current)return;
    const c=ref.current;c.width=W;c.height=H;draw(c,frame);
  },[frame]);
  return(
    <AbsoluteFill style={{background:'#010814'}}>
      <canvas ref={ref} style={{width:W,height:H,position:'absolute'}}/>
      <Sequence from={0} durationInFrames={LOOP}>
        <Audio src={MUSIC} volume={fadeIn}/>
      </Sequence>
      <Sequence from={LOOP} durationInFrames={TAIL}>
        <Audio src={MUSIC} volume={fadeOutTail}/>
      </Sequence>
    </AbsoluteFill>
  );
}
