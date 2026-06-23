import {useCurrentFrame,AbsoluteFill,interpolate} from 'remotion';
import {useRef,useLayoutEffect} from 'react';
import {Caption} from '../Caption.jsx';
import {Narration} from '../Narration.jsx';
import {Music} from '../Music.jsx';
import {Credit} from '../Credit.jsx';
import * as timing from '../timing-occult.js';

// ── ดวงจันทร์บังดาวศุกร์ — มุมมองเดียว "ตาเปล่าจากพื้นโลก" (ท้องฟ้าหัวค่ำ ทิศตะวันตก) ──
// สเกลสมจริง: ฟ้ากว้าง · ดวงจันทร์เสี้ยว "เล็ก" (ไม่ครองจอ) · ดาวศุกร์ = จุดสว่างจิ๋ว (จานเล็กกว่าจันทร์ ~50 เท่า)
// การเคลื่อนที่จริง: "ดวงจันทร์เคลื่อนผ่าน" (เร็วบนฟ้า) ไปบังดาวศุกร์ที่เกือบนิ่ง · ขอบมืดนำเข้าบัง → โผล่ขอบสว่าง
// เสี้ยวศุกร์มองด้วยตาเปล่าไม่เห็น → ใช้ภาพซูมกล้อง (inset) ช่วงท้าย · ไม่มีไดอะแกรม epicycle (กันคนงง)
const W=1080,H=1920;
const VX=540,VY=720,RM=88;             // ดาวศุกร์อยู่กับที่ (จุดจิ๋ว) · รัศมีจานดวงจันทร์ (เล็ก สมจริง)
const HZ=1652;                          // เส้นขอบฟ้า
// ค่าจริงจาก ephem (2026-09-14 19:28 ICT กรุงเทพ): จันทร์สว่าง 12.6% · ด้านสว่างชี้อาทิตย์ 46° ลงขวา
const ILLUM_M=0.126, BRIGHT=0.80;       // เสี้ยวบาง ~3 ค่ำ · ด้านสว่างชี้ดวงอาทิตย์ที่ลับขอบฟ้า
const MOVE=[0.59,0.81];                  // จันทร์เคลื่อนขึ้นบนซ้าย(ตะวันออก) · ศุกร์เข้าขอบมืดบนซ้าย→ออกขอบสว่างล่างขวา
const D0=1650,D1=1150,P=885;             // ระยะก่อน/หลังจุดบัง (เข้า-ออกนอกจอ) · 2 รอบใน 1770f
const STARS=Array.from({length:240},(_,i)=>({
  x:(Math.sin(i*127.1)*.5+.5),y:(Math.sin(i*311.7)*.5+.5)*0.84,
  r:i%11===0?1.5:i%3===0?.7:.35,tw:i*0.41
}));

// วาดจาน+เฟสเสี้ยว · ang=ทิศด้านสว่าง
function drawPhase(ctx,x,y,r,illum,ang,litA,litB,darkFill){
  const cosA=2*illum-1;
  ctx.save();ctx.translate(x,y);ctx.rotate(ang);
  ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.fillStyle=darkFill;ctx.fill();
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

function drawVenus(ctx,a){
  ctx.globalAlpha=a;
  const RV=12;                                  // เสี้ยวศุกร์จริง (เฟส 29% · ด้านสว่างชี้ดวงอาทิตย์)
  const halo=ctx.createRadialGradient(VX,VY,RV*0.5,VX,VY,RV*2.8);
  halo.addColorStop(0,'rgba(215,238,255,0.6)');halo.addColorStop(0.5,'rgba(150,195,255,0.18)');halo.addColorStop(1,'transparent');
  ctx.fillStyle=halo;ctx.beginPath();ctx.arc(VX,VY,RV*2.8,0,Math.PI*2);ctx.fill();
  drawPhase(ctx,VX,VY,RV,0.29,BRIGHT,'#bfe0ff','#ffffff','rgba(15,22,38,0.92)');
  ctx.globalAlpha=1;
  ctx.fillStyle='rgba(210,232,255,.95)';ctx.font='600 25px sans-serif';
  ctx.textAlign='left';ctx.textBaseline='middle';ctx.fillText('ดาวศุกร์',VX+RV+14,VY);
}

function draw(canvas,frame){
  const ctx=canvas.getContext('2d');

  // ── ท้องฟ้าสนธยา (มืดบน → ส้มอ่อนใกล้ขอบฟ้าตะวันตก) ──
  const sky=ctx.createLinearGradient(0,0,0,HZ);
  sky.addColorStop(0,'#03040f');sky.addColorStop(0.55,'#0a1430');
  sky.addColorStop(0.82,'#243a63');sky.addColorStop(0.95,'#7a5a4e');sky.addColorStop(1,'#caa074');
  ctx.fillStyle=sky;ctx.fillRect(0,0,W,HZ);
  STARS.forEach(s=>{
    const yy=s.y*HZ; const dim=Math.max(0,Math.min(1,(HZ-yy)/HZ*1.3));
    ctx.globalAlpha=(.05+Math.abs(Math.sin(s.tw+frame*.015))*.26)*dim;
    ctx.fillStyle='#cfe0ff';ctx.beginPath();ctx.arc(s.x*W,yy,s.r,0,Math.PI*2);ctx.fill();
  });ctx.globalAlpha=1;

  // ── ตำแหน่งดวงจันทร์ (เคลื่อนผ่าน) ──
  const frac=(frame%P)/P;
  const d=D0-(D0+D1)*frac;               // +D0(ล่างขวา/เข้า) → -D1(บนซ้าย/ออก)
  const MXc=VX+d*MOVE[0], MYc=VY+d*MOVE[1];
  const dist=Math.hypot(VX-MXc,VY-MYc);
  const occulted=dist<RM*0.98;

  // ดาวศุกร์ (วาดก่อน · ถ้าถูกบังให้จันทร์ทับ = ไม่เห็น)
  if(!occulted) drawVenus(ctx,1);

  // ── ดวงจันทร์เสี้ยว (เล็ก สมจริง) ──
  const earth=ctx.createRadialGradient(MXc,MYc,RM*0.2,MXc,MYc,RM);  // earthshine จานเต็มจางๆ
  earth.addColorStop(0,'rgba(90,100,120,0.16)');earth.addColorStop(1,'rgba(50,58,78,0.04)');
  ctx.fillStyle=earth;ctx.beginPath();ctx.arc(MXc,MYc,RM,0,Math.PI*2);ctx.fill();
  const mglow=ctx.createRadialGradient(MXc,MYc,RM*0.7,MXc,MYc,RM*1.6);
  mglow.addColorStop(0,'rgba(230,232,210,0.10)');mglow.addColorStop(1,'transparent');
  ctx.fillStyle=mglow;ctx.beginPath();ctx.arc(MXc,MYc,RM*1.6,0,Math.PI*2);ctx.fill();
  drawPhase(ctx,MXc,MYc,RM,ILLUM_M,BRIGHT,'#d7d9c6','#fdfdf4','rgba(18,22,34,0.0)');
  if(MYc<HZ-RM&&MYc>RM){          // ป้ายจันทร์ (เฉพาะตอนอยู่ในจอ)
    ctx.fillStyle='rgba(228,230,210,.85)';ctx.font='600 24px sans-serif';
    ctx.textAlign='center';ctx.textBaseline='top';ctx.fillText('ดวงจันทร์',MXc,MYc+RM+10);
  }
  // ── สถานะ (ตำแหน่งคงที่บนสุด) ──
  ctx.textAlign='center';ctx.textBaseline='alphabetic';
  if(occulted){ctx.fillStyle='#ff9a6a';ctx.font='700 40px sans-serif';ctx.fillText('● ดาวศุกร์ถูกบัง',W/2,232);}
  else{ctx.fillStyle='rgba(210,232,255,.85)';ctx.font='700 34px sans-serif';ctx.fillText('ดวงจันทร์เคลื่อนเข้าหาดาวศุกร์',W/2,232);}

  // ── เส้นขอบฟ้า + เงาภูเขา (พื้นโลก) ──
  ctx.fillStyle='#05070e';
  ctx.beginPath();ctx.moveTo(0,HZ);
  for(let x=0;x<=W;x+=30){const hh=HZ+22+Math.sin(x*0.013+1.7)*16+Math.sin(x*0.05)*7;ctx.lineTo(x,hh);}
  ctx.lineTo(W,H);ctx.lineTo(0,H);ctx.closePath();ctx.fill();
  ctx.fillStyle='rgba(255,225,180,.85)';ctx.font='700 30px sans-serif';
  ctx.textAlign='center';ctx.textBaseline='bottom';ctx.fillText('🧭 ทิศตะวันตก · หัวค่ำ (หลังอาทิตย์ตก)',W/2,HZ-12);

  // ── หัวข้อ (บนสุด) ──
  ctx.textAlign='center';ctx.textBaseline='alphabetic';
  ctx.fillStyle='#cfe6ff';ctx.font='700 56px sans-serif';
  ctx.fillText('ดวงจันทร์บังดาวศุกร์',W/2,118);
  ctx.fillStyle='rgba(190,224,255,0.7)';ctx.font='600 28px Georgia,serif';
  ctx.fillText('Lunar Occultation of Venus',W/2,162);
}

export function OccultationVert(){
  const frame=useCurrentFrame();
  const ref=useRef(null);
  useLayoutEffect(()=>{if(!ref.current)return;const c=ref.current;c.width=W;c.height=H;draw(c,frame);},[frame]);
  const loopFade=interpolate(frame,[0,15,timing.DURATION-15,timing.DURATION],[0,1,1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
  const cardOp=interpolate(frame,[0,18,135,165],[0,1,1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
  return(<AbsoluteFill style={{background:'#03040f'}}>
    <AbsoluteFill style={{opacity:loopFade}}>
      <canvas ref={ref} style={{width:W,height:H,position:'absolute'}}/>
      <Caption timing={timing}/>
      <Credit timing={timing} label="based on" source="OBSERVATION" sub="ดวงจันทร์บังดาว · NARIT 2569"/>
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
