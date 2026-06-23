import {useCurrentFrame,AbsoluteFill,interpolate} from 'remotion';
import {useRef,useLayoutEffect} from 'react';
import {Caption} from '../Caption.jsx';
import {Narration} from '../Narration.jsx';
import {Music} from '../Music.jsx';
import {Credit} from '../Credit.jsx';
import * as timing from '../timing-occult.js';

// ── ดวงจันทร์บังดาวศุกร์ — มุมมองเดียว: "ปรากฏการณ์ที่ตาเห็นจากพื้นโลก" ──
// ท้องฟ้าหัวค่ำ ทิศตะวันตก (มีแสงสนธยา+เส้นขอบฟ้า) · จันทร์เสี้ยวใหญ่ + ดาวศุกร์เป็นจุดสว่างจิ๋ว
// (สัดส่วนจริง ~1:50) · จันทร์เคลื่อนไปบังศุกร์ที่ขอบมืด → ศุกร์หายวับ → โผล่ที่ขอบสว่าง
// ดาวศุกร์เสี้ยว = ภาพซูมกล้อง (inset) ช่วงท้าย · ไม่มีไดอะแกรม epicycle (กันคนงง)
const W=1080,H=1920;
const MX=560,MY=700,RM=158;            // ดวงจันทร์
const HZ=1652;                          // เส้นขอบฟ้า
const ILLUM_M=0.22;                     // เสี้ยวจันทร์ (อ่อนๆ ~3 วัน)
const BRIGHT=1.15;                       // ทิศด้านสว่าง (ชี้ดวงอาทิตย์ที่ลับขอบฟ้า ตะวันตก = ล่าง)
const THETA=BRIGHT;                      // ศุกร์เดินเข้าหาขอบสว่าง (จากขอบมืดบน → ขอบสว่างล่าง)
const SWEEP=300, P=815;
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

function draw(canvas,frame){
  const ctx=canvas.getContext('2d');

  // ── ท้องฟ้าสนธยา (มืดบน → ส้มอ่อนใกล้ขอบฟ้าตะวันตก) ──
  const sky=ctx.createLinearGradient(0,0,0,HZ);
  sky.addColorStop(0,'#03040f');sky.addColorStop(0.55,'#0a1430');
  sky.addColorStop(0.82,'#243a63');sky.addColorStop(0.95,'#7a5a4e');sky.addColorStop(1,'#caa074');
  ctx.fillStyle=sky;ctx.fillRect(0,0,W,HZ);
  // ดาวพื้นหลัง (จางใกล้ขอบฟ้า)
  STARS.forEach(s=>{
    const yy=s.y*HZ; const dim=Math.max(0,Math.min(1,(HZ-yy)/HZ*1.3));
    ctx.globalAlpha=(.05+Math.abs(Math.sin(s.tw+frame*.015))*.26)*dim;
    ctx.fillStyle='#cfe0ff';ctx.beginPath();ctx.arc(s.x*W,yy,s.r,0,Math.PI*2);ctx.fill();
  });ctx.globalAlpha=1;

  // ── ดาวศุกร์: จุดสว่างจิ๋ว (สัดส่วนจริง) เคลื่อนเข้าหาดวงจันทร์ ──
  const u=(frame%P)/P;
  const s=SWEEP*(2*u-1);                 // -SWEEP(ขอบมืดบน) → +SWEEP(ขอบสว่างล่าง)
  const vx=MX+s*Math.cos(THETA), vy=MY+s*Math.sin(THETA);
  const occulted=Math.abs(s)<RM*0.99;    // อยู่หลังจาน = ถูกบัง
  const edge=Math.max(0,Math.min(1,(SWEEP-Math.abs(s))/70));

  // ── ดวงจันทร์เสี้ยว (ใหญ่) ──
  const earth=ctx.createRadialGradient(MX,MY,RM*0.2,MX,MY,RM);   // earthshine จานเต็มจางๆ
  earth.addColorStop(0,'rgba(90,100,120,0.18)');earth.addColorStop(1,'rgba(50,58,78,0.05)');
  ctx.fillStyle=earth;ctx.beginPath();ctx.arc(MX,MY,RM,0,Math.PI*2);ctx.fill();
  const mglow=ctx.createRadialGradient(MX,MY,RM*0.7,MX,MY,RM*1.7);
  mglow.addColorStop(0,'rgba(230,232,210,0.12)');mglow.addColorStop(1,'transparent');
  ctx.fillStyle=mglow;ctx.beginPath();ctx.arc(MX,MY,RM*1.7,0,Math.PI*2);ctx.fill();
  drawPhase(ctx,MX,MY,RM,ILLUM_M,BRIGHT,'#d7d9c6','#fdfdf4','rgba(18,22,34,0.0)');

  // ดาวศุกร์ (จุดจ้า + ประกาย) — วาดหลังจันทร์: ถ้า occulted ไม่วาด
  if(!occulted&&edge>0.01){
    ctx.globalAlpha=edge;
    const halo=ctx.createRadialGradient(vx,vy,0,vx,vy,22);
    halo.addColorStop(0,'rgba(255,255,255,1)');halo.addColorStop(0.18,'rgba(225,240,255,0.9)');
    halo.addColorStop(0.5,'rgba(150,195,255,0.32)');halo.addColorStop(1,'transparent');
    ctx.fillStyle=halo;ctx.beginPath();ctx.arc(vx,vy,22,0,Math.PI*2);ctx.fill();
    // ประกายกากบาท
    ctx.strokeStyle='rgba(220,238,255,'+(0.5*edge).toFixed(2)+')';ctx.lineWidth=1.4;
    ctx.beginPath();ctx.moveTo(vx-17,vy);ctx.lineTo(vx+17,vy);ctx.moveTo(vx,vy-17);ctx.lineTo(vx,vy+17);ctx.stroke();
    ctx.fillStyle='#ffffff';ctx.beginPath();ctx.arc(vx,vy,3.4,0,Math.PI*2);ctx.fill();
    ctx.globalAlpha=1;
    ctx.fillStyle='rgba(210,232,255,.95)';ctx.font='600 27px sans-serif';
    ctx.textAlign='left';ctx.textBaseline='middle';ctx.fillText('ดาวศุกร์',vx+22,vy);
  }
  // ป้ายดวงจันทร์
  ctx.fillStyle='rgba(228,230,210,.9)';ctx.font='600 30px sans-serif';
  ctx.textAlign='center';ctx.textBaseline='top';ctx.fillText('ดวงจันทร์',MX,MY+RM+18);

  // สถานะ บัง/เข้าใกล้ (เหนือดวงจันทร์)
  ctx.textAlign='center';ctx.textBaseline='alphabetic';
  if(occulted){ctx.fillStyle='#ff9a6a';ctx.font='700 42px sans-serif';ctx.fillText('● ดาวศุกร์ถูกบัง',MX,MY-RM-46);}
  else{ctx.fillStyle='rgba(210,232,255,.9)';ctx.font='700 36px sans-serif';ctx.fillText('ดาวศุกร์เคียงดวงจันทร์',MX,MY-RM-46);}

  // ── ภาพซูมกล้อง (inset) ช่วง seg9 "ศุกร์เป็นเสี้ยว" ──
  const insetOp=interpolate(frame,[1200,1225,1320,1345],[0,1,1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
  if(insetOp>0.01){
    const ix=235,iy=1150,ir=128;
    ctx.globalAlpha=insetOp;
    // เส้นโยงจากศุกร์
    if(!occulted){ctx.strokeStyle='rgba(200,225,255,.4)';ctx.lineWidth=1.2;ctx.setLineDash([4,5]);
      ctx.beginPath();ctx.moveTo(vx,vy);ctx.lineTo(ix+ir*0.7,iy-ir*0.7);ctx.stroke();ctx.setLineDash([]);}
    ctx.fillStyle='rgba(3,6,16,0.92)';ctx.beginPath();ctx.arc(ix,iy,ir,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='rgba(150,195,255,.6)';ctx.lineWidth=2;ctx.stroke();
    drawPhase(ctx,ix,iy,ir*0.62,0.30,BRIGHT,'#bfe0ff','#ffffff','rgba(20,26,40,0.95)');  // ศุกร์เสี้ยวซูม
    ctx.fillStyle='rgba(200,225,255,.95)';ctx.font='600 25px sans-serif';
    ctx.textAlign='center';ctx.textBaseline='top';ctx.fillText('🔭 ศุกร์ผ่านกล้อง = เสี้ยว',ix,iy+ir+10);
    ctx.globalAlpha=1;
  }

  // ── เส้นขอบฟ้า + เงาภูเขา (พื้นโลก) ──
  ctx.fillStyle='#05070e';
  ctx.beginPath();ctx.moveTo(0,HZ);
  for(let x=0;x<=W;x+=30){const hh=HZ+22+Math.sin(x*0.013+1.7)*16+Math.sin(x*0.05)*7;ctx.lineTo(x,hh);}
  ctx.lineTo(W,H);ctx.lineTo(0,H);ctx.closePath();ctx.fill();
  // ป้ายทิศ
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
