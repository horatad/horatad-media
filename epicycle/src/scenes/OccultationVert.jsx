import {useCurrentFrame,AbsoluteFill,interpolate} from 'remotion';
import {useRef,useLayoutEffect} from 'react';
import {PLANETS,gP} from '../physics.js';
import {Caption} from '../Caption.jsx';
import {Narration} from '../Narration.jsx';
import {Music} from '../Music.jsx';
import {Credit} from '../Credit.jsx';
import * as timing from '../timing-occult.js';

// ── ดวงจันทร์บังดาวศุกร์ (Lunar Occultation of Venus) แนวตั้ง Shorts 1080×1920 ──
// บน  = ภาพจากพื้นโลก (close-up): จันทร์เสี้ยวเคลื่อนไปบังดาวศุกร์เสี้ยว → หายวับ → โผล่
// ล่าง = epicycle: ศุกร์เป็นดาววงใน โคจรรอบ(ทิศ)ดวงอาทิตย์ → เกาะติดดวงอาทิตย์เสมอ = เห็นแค่หัวค่ำ/เช้ามืด
const W=1080,H=1920;
const SUN=PLANETS.find(p=>p.id==='sun');
const VENUS=PLANETS.find(p=>p.id==='venus');
const STARS=Array.from({length:300},(_,i)=>({
  x:(Math.sin(i*127.1)*.5+.5),y:(Math.sin(i*311.7)*.5+.5),
  r:i%9===0?1.4:i%3===0?.7:.35,tw:i*0.41
}));

// ── close-up โซนบน ──
const TX=540,TY=610,RM=150;            // จุดศูนย์กลาง + รัศมีดวงจันทร์
const SWEEP=340, P=805;                 // ระยะกวาดของศุกร์ + คาบ (≈2.2 รอบใน 1770f)
const ILLUM_M=0.20, ILLUM_V=0.30;       // เสี้ยว: จันทร์บาง · ศุกร์เสี้ยว
const BRIGHT=0.70;                       // ทิศด้านสว่าง (ชี้ดวงอาทิตย์ที่ลับขอบฟ้า · ขวาล่าง)

// วาดจาน + เฟสเสี้ยว (illum 0=มืดสนิท .5=ครึ่ง 1=เต็ม) · ang=ทิศด้านสว่าง
function drawPhase(ctx,x,y,r,illum,ang,litA,litB){
  const cosA=2*illum-1;                  // มุมเฟส
  ctx.save();ctx.translate(x,y);ctx.rotate(ang);
  ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);
  ctx.fillStyle='rgba(14,18,30,0.95)';ctx.fill();
  const xt=r*cosA;
  ctx.beginPath();
  ctx.arc(0,0,r,-Math.PI/2,Math.PI/2,false);
  ctx.ellipse(0,0,Math.abs(xt),r,0,Math.PI/2,-Math.PI/2,xt>0?false:true);
  ctx.closePath();
  const g=ctx.createLinearGradient(-r,0,r,0);
  g.addColorStop(0,litA);g.addColorStop(1,litB);
  ctx.fillStyle=g;ctx.fill();
  ctx.restore();
}

function drawSky(ctx,frame){
  // ดวงจันทร์ (เสี้ยว · ใหญ่)
  const mGlow=ctx.createRadialGradient(TX,TY,RM*0.6,TX,TY,RM*1.8);
  mGlow.addColorStop(0,'rgba(220,225,200,0.10)');mGlow.addColorStop(1,'transparent');
  ctx.fillStyle=mGlow;ctx.beginPath();ctx.arc(TX,TY,RM*1.8,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='rgba(150,160,150,0.18)';ctx.lineWidth=1;
  ctx.beginPath();ctx.arc(TX,TY,RM,0,Math.PI*2);ctx.stroke();          // ขอบจานเต็ม (earthshine)
  drawPhase(ctx,TX,TY,RM,ILLUM_M,BRIGHT,'#cfd2c0','#fbfbf2');

  // ── ดาวศุกร์: กวาดผ่านหลังดวงจันทร์ (occultation) ──
  const u=(frame%P)/P;                   // 0→1 ต่อรอบ
  const vxRel=SWEEP*(1-2*u);             // +SWEEP(ขวา) → -SWEEP(ซ้าย)
  const vx=TX+vxRel, vy=TY+vxRel*0.06;
  const dist=Math.hypot(vx-TX,vy-TY);
  const occulted=dist<RM*0.97;           // อยู่ในจานจันทร์ = ถูกบัง (มองไม่เห็น)
  const edge=Math.max(0,Math.min(1,(SWEEP-Math.abs(vxRel))/90));  // จาง 2 ปลาย (ซ่อนการวาร์ป)

  // เส้นทางเดินของศุกร์ (จุดประจาง)
  ctx.strokeStyle='rgba(150,180,230,0.10)';ctx.lineWidth=1;ctx.setLineDash([3,10]);
  ctx.beginPath();ctx.moveTo(TX-SWEEP,TY-SWEEP*0.06);ctx.lineTo(TX+SWEEP,TY+SWEEP*0.06);ctx.stroke();ctx.setLineDash([]);

  if(!occulted&&edge>0.01){
    const rv=14;
    ctx.globalAlpha=edge;
    const halo=ctx.createRadialGradient(vx,vy,0,vx,vy,rv*3.4);
    halo.addColorStop(0,'rgba(230,244,255,0.85)');halo.addColorStop(0.4,'rgba(170,210,255,0.35)');halo.addColorStop(1,'transparent');
    ctx.fillStyle=halo;ctx.beginPath();ctx.arc(vx,vy,rv*3.4,0,Math.PI*2);ctx.fill();
    drawPhase(ctx,vx,vy,rv,ILLUM_V,BRIGHT,'#bfe0ff','#ffffff');
    ctx.globalAlpha=1;
    ctx.fillStyle='rgba(190,224,255,.95)';ctx.font='600 26px sans-serif';
    ctx.textAlign='left';ctx.textBaseline='middle';ctx.fillText('ศุกร์',vx+rv+10,vy);
  }
  // ป้ายดวงจันทร์
  ctx.fillStyle='rgba(225,228,205,.92)';ctx.font='600 30px sans-serif';
  ctx.textAlign='center';ctx.textBaseline='top';ctx.fillText('ดวงจันทร์',TX,TY+RM+16);

  // สถานะ (บัง / ใกล้)
  ctx.textAlign='center';ctx.textBaseline='alphabetic';
  if(occulted){ctx.fillStyle='#ff9a6a';ctx.font='700 40px sans-serif';ctx.fillText('● ดาวศุกร์ถูกบัง',TX,TY-RM-40);}
  else{ctx.fillStyle='rgba(190,224,255,.85)';ctx.font='700 36px sans-serif';ctx.fillText('ดาวศุกร์กำลังเข้าใกล้',TX,TY-RM-40);}
}

// ── โซนล่าง: epicycle ศุกร์ (ดาววงใน เกาะติดดวงอาทิตย์) ──
const EX=540,EY2=1255,SC2=1.9,SPEED2=2.4;
function drawEpicycle(ctx,frame){
  const f=frame*SPEED2, dr=Math.PI/180;
  const defR=VENUS.defR*SC2, epiR=VENUS.epiR*SC2;
  const ecx=EX, ecy=EY2-defR;            // ดวงอาทิตย์ตรึงด้านบน (ชี้ไปท้องฟ้าหัวค่ำ)
  const ea=( -90 - VENUS.eS*f )*dr;
  const vx=ecx+epiR*Math.cos(ea), vy=ecy+epiR*Math.sin(ea);

  // เส้นโยง โลก→อาทิตย์ · วงเอพิไซเคิล
  ctx.strokeStyle='rgba(255,170,70,.30)';ctx.lineWidth=1.4;
  ctx.beginPath();ctx.moveTo(EX,EY2);ctx.lineTo(ecx,ecy);ctx.stroke();
  ctx.strokeStyle='rgba(120,190,255,.30)';ctx.lineWidth=1.2;ctx.setLineDash([4,5]);
  ctx.beginPath();ctx.arc(ecx,ecy,epiR,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
  // เส้นเล็ง โลก→ศุกร์ (ต่อขึ้นไปท้องฟ้า)
  ctx.strokeStyle='rgba(190,224,255,.45)';ctx.lineWidth=1.3;ctx.setLineDash([2,6]);
  ctx.beginPath();ctx.moveTo(EX,EY2);ctx.lineTo(vx+(vx-EX)*0.18,vy+(vy-EY2)*0.18);ctx.stroke();ctx.setLineDash([]);

  // โลก
  const eR=12;
  const eg=ctx.createRadialGradient(EX,EY2,0,EX,EY2,eR);eg.addColorStop(0,'#fff');eg.addColorStop(1,'#7ab0ff');
  ctx.beginPath();ctx.arc(EX,EY2,eR,0,Math.PI*2);ctx.fillStyle=eg;ctx.fill();
  ctx.fillStyle='rgba(190,215,255,.9)';ctx.font='600 22px sans-serif';
  ctx.textAlign='center';ctx.textBaseline='top';ctx.fillText('โลก',EX,EY2+eR+5);
  // ดวงอาทิตย์
  const suR=20;ctx.shadowColor='#FF7733';ctx.shadowBlur=26;
  const sg=ctx.createRadialGradient(ecx,ecy,0,ecx,ecy,suR);sg.addColorStop(0,'#FFE7A0');sg.addColorStop(1,'#FF5522');
  ctx.beginPath();ctx.arc(ecx,ecy,suR,0,Math.PI*2);ctx.fillStyle=sg;ctx.fill();ctx.shadowBlur=0;
  ctx.fillStyle='rgba(255,210,150,.9)';ctx.font='600 22px sans-serif';
  ctx.textBaseline='bottom';ctx.fillText('ดวงอาทิตย์',ecx,ecy-suR-6);
  // ศุกร์
  ctx.beginPath();ctx.arc(vx,vy,7,0,Math.PI*2);ctx.fillStyle='#cfe6ff';ctx.fill();
  ctx.fillStyle='rgba(190,224,255,.95)';ctx.font='600 21px sans-serif';
  ctx.textAlign='left';ctx.textBaseline='middle';ctx.fillText('ศุกร์',vx+11,vy);
  // คำอธิบาย
  ctx.textAlign='center';ctx.textBaseline='top';
  ctx.fillStyle='rgba(120,190,255,.92)';ctx.font='700 27px sans-serif';
  ctx.fillText('ศุกร์ = ดาว "วงใน" โคจรเกาะติดดวงอาทิตย์',EX,EY2+44);
  ctx.fillStyle='rgba(190,210,240,.7)';ctx.font='600 22px sans-serif';
  ctx.fillText('จึงเห็นแค่หัวค่ำ–เช้ามืด · ใกล้ดวงอาทิตย์',EX,EY2+80);
}

function draw(canvas,frame){
  const ctx=canvas.getContext('2d');
  ctx.fillStyle='#020a16';ctx.fillRect(0,0,W,H);
  const vg=ctx.createRadialGradient(TX,TY,W*.1,TX,TY,W*.9);
  vg.addColorStop(0,'transparent');vg.addColorStop(1,'rgba(0,0,12,.6)');
  ctx.fillStyle=vg;ctx.fillRect(0,0,W,H);
  STARS.forEach(s=>{
    ctx.globalAlpha=.06+Math.abs(Math.sin(s.tw+frame*.015))*.28;
    ctx.fillStyle='#aaccff';ctx.beginPath();ctx.arc(s.x*W,s.y*H,s.r,0,Math.PI*2);ctx.fill();
  });ctx.globalAlpha=1;

  drawSky(ctx,frame);
  drawEpicycle(ctx,frame);

  // หัวข้อ (บนสุด)
  ctx.textAlign='center';ctx.textBaseline='alphabetic';
  ctx.fillStyle='#bfe0ff';ctx.font='700 56px sans-serif';
  ctx.fillText('ดวงจันทร์บังดาวศุกร์',540,120);
  ctx.fillStyle='rgba(190,224,255,0.7)';ctx.font='600 28px Georgia,serif';
  ctx.fillText('Lunar Occultation of Venus',540,164);
}

export function OccultationVert(){
  const frame=useCurrentFrame();
  const ref=useRef(null);
  useLayoutEffect(()=>{if(!ref.current)return;const c=ref.current;c.width=W;c.height=H;draw(c,frame);},[frame]);
  const loopFade=interpolate(frame,[0,15,timing.DURATION-15,timing.DURATION],[0,1,1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
  // การ์ดเหตุการณ์ + เวลาสังเกตการณ์ (โผล่ช่วง intro ~5วิ · NARIT)
  const cardOp=interpolate(frame,[0,18,135,165],[0,1,1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
  return(<AbsoluteFill style={{background:'#020a16'}}>
    <AbsoluteFill style={{opacity:loopFade}}>
      <canvas ref={ref} style={{width:W,height:H,position:'absolute'}}/>
      <Caption timing={timing}/>
      <Credit timing={timing} label="based on" source="EPICYCLE" sub="inner planet · Ptolemy"/>
    </AbsoluteFill>
    {cardOp>0.001&&(
      <AbsoluteFill style={{opacity:cardOp,justifyContent:'center',alignItems:'center',pointerEvents:'none'}}>
        <div style={{
          background:'rgba(4,8,20,0.88)',border:'1px solid rgba(120,190,255,0.4)',
          borderRadius:28,padding:'46px 54px',textAlign:'center',maxWidth:940,
          boxShadow:'0 0 70px rgba(110,170,255,0.32)'}}>
          <div style={{color:'#bfe0ff',fontSize:36,fontWeight:600,letterSpacing:1}}>🌙 ปรากฏการณ์ท้องฟ้า ปี ๒๕๖๙</div>
          <div style={{color:'#ffffff',fontSize:70,fontWeight:800,margin:'16px 0 6px'}}>ดวงจันทร์บังดาวศุกร์</div>
          <div style={{color:'#9fd0ff',fontSize:52,fontWeight:700}}>๑๔ กันยายน ๒๕๖๙</div>
          <div style={{color:'rgba(190,224,255,0.92)',fontSize:33,marginTop:26,lineHeight:1.5}}>
            👁 เริ่มบัง <b>๑๙:๒๘ น.</b> — ศุกร์โผล่กลับ <b>๒๐:๓๔ น.</b><br/>
            ทิศ <b>ตะวันตก</b> หัวค่ำ · ตาเปล่าเห็นทั่วไทย
          </div>
          <div style={{color:'rgba(255,255,255,0.55)',fontSize:26,marginTop:22,fontStyle:'italic'}}>ดวงจันทร์ใกล้ "กลืน" ดาวศุกร์ได้อย่างไร? ↓</div>
        </div>
      </AbsoluteFill>
    )}
    <Narration timing={timing} voDir="vo-occult"/>
    <Music timing={timing} music="audio/salut-damour-clip.mp3" outroFade={120}/>
  </AbsoluteFill>);
}
