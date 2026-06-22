import {useCurrentFrame,AbsoluteFill,interpolate} from 'remotion';
import {useRef,useLayoutEffect} from 'react';
import {PLANETS,gP,isRetro} from '../physics.js';
import {Caption} from '../Caption.jsx';
import {Narration} from '../Narration.jsx';
import {Music} from '../Music.jsx';
import {Credit} from '../Credit.jsx';
import * as timingOpp from '../timing-opp.js';

// ── Opposition แนวตั้ง (Shorts 1080×1920) — re-layout จาก Opposition จัตุรัส · focus ดาวเสาร์ ──
// SPEED 3.5 + OFFSET 920 → opposition โผล่ตรงช่วงพากย์ (seg1/4/6) · diagram กลางบน
const W=1080,H=1920,SPEED=6,OFF=920;
const CX=540,CY=820,sc=1.25;
const SUN=PLANETS.find(p=>p.id==='sun');
const SAT=PLANETS.find(p=>p.id==='saturn');
const STARS=Array.from({length:300},(_,i)=>({
  x:(Math.sin(i*127.1)*.5+.5),y:(Math.sin(i*311.7)*.5+.5),
  r:i%9===0?1.3:i%3===0?.7:.35,tw:i*0.41
}));
const wrap=a=>{while(a>Math.PI)a-=2*Math.PI;while(a<-Math.PI)a+=2*Math.PI;return a;};

function draw(canvas,frame){
  const ctx=canvas.getContext('2d');
  const f=frame*SPEED+OFF;

  ctx.fillStyle='#010814';ctx.fillRect(0,0,W,H);
  const vg=ctx.createRadialGradient(CX,CY,W*.18,CX,CY,H*.55);
  vg.addColorStop(0,'transparent');vg.addColorStop(1,'rgba(0,0,10,.55)');
  ctx.fillStyle=vg;ctx.fillRect(0,0,W,H);
  STARS.forEach(s=>{
    ctx.globalAlpha=.07+Math.abs(Math.sin(s.tw+frame*.015))*.28;
    ctx.fillStyle='#aaccff';ctx.beginPath();ctx.arc(s.x*W,s.y*H,s.r,0,Math.PI*2);ctx.fill();
  });ctx.globalAlpha=1;

  const sr=gP(SUN,f), str=gP(SAT,f);
  const sx=CX+sr.x*sc, sy=CY+sr.y*sc;
  const stx=CX+str.x*sc, sty=CY+str.y*sc;
  const dfx=CX+str.dx*sc, dfy=CY+str.dy*sc;

  const aSun=Math.atan2(sr.y,sr.x), aSat=Math.atan2(str.y,str.x);
  const elong=Math.abs(wrap(aSat-aSun))*180/Math.PI;
  const opp=elong>150;
  const retro=isRetro(SAT,f);
  const dist=Math.hypot(str.x,str.y);

  ctx.beginPath();ctx.arc(CX,CY,SAT.defR*sc,0,Math.PI*2);
  ctx.strokeStyle='rgba(204,136,255,.16)';ctx.lineWidth=.6;ctx.setLineDash([2,8]);ctx.stroke();ctx.setLineDash([]);
  ctx.beginPath();ctx.arc(CX,CY,SUN.defR*sc,0,Math.PI*2);
  ctx.strokeStyle='rgba(255,170,70,.14)';ctx.lineWidth=.8;ctx.setLineDash([3,9]);ctx.stroke();ctx.setLineDash([]);

  ctx.beginPath();ctx.moveTo(CX,CY);ctx.lineTo(dfx,dfy);
  ctx.strokeStyle='rgba(255,255,255,.18)';ctx.lineWidth=.7;ctx.setLineDash([4,5]);ctx.stroke();ctx.setLineDash([]);
  ctx.beginPath();ctx.arc(dfx,dfy,SAT.epiR*sc,0,Math.PI*2);
  ctx.strokeStyle='rgba(204,136,255,.5)';ctx.lineWidth=.9;ctx.setLineDash([3,3]);ctx.stroke();ctx.setLineDash([]);
  ctx.beginPath();ctx.moveTo(dfx,dfy);ctx.lineTo(stx,sty);
  ctx.strokeStyle='rgba(255,255,255,.6)';ctx.lineWidth=1.1;ctx.stroke();

  ctx.beginPath();ctx.moveTo(CX,CY);ctx.lineTo(sx,sy);
  ctx.strokeStyle='rgba(255,170,70,.45)';ctx.lineWidth=1.2;ctx.stroke();
  ctx.beginPath();ctx.moveTo(CX,CY);ctx.lineTo(stx,sty);
  ctx.strokeStyle=opp?'rgba(204,136,255,.8)':'rgba(204,136,255,.3)';ctx.lineWidth=1.3;ctx.stroke();

  // โลก
  const eR=13;
  ctx.shadowColor='#aaddff';ctx.shadowBlur=20;
  const eg=ctx.createRadialGradient(CX,CY,0,CX,CY,eR);
  eg.addColorStop(0,'#fff');eg.addColorStop(1,'#8bbfff');
  ctx.beginPath();ctx.arc(CX,CY,eR,0,Math.PI*2);ctx.fillStyle=eg;ctx.fill();ctx.shadowBlur=0;
  ctx.fillStyle='rgba(180,210,255,.8)';ctx.font='600 15px sans-serif';
  ctx.textAlign='center';ctx.textBaseline='top';ctx.fillText('โลก',CX,CY+eR+3);

  // ดวงอาทิตย์ (ใหญ่สุดในภาพ — สมดุลขนาด: อาทิตย์ > เสาร์ > โลก)
  ctx.shadowColor='#FF7733';ctx.shadowBlur=30;
  const sg=ctx.createRadialGradient(sx,sy,0,sx,sy,22);
  sg.addColorStop(0,'#FFE7A0');sg.addColorStop(1,'#FF5522');
  ctx.beginPath();ctx.arc(sx,sy,21,0,Math.PI*2);ctx.fillStyle=sg;ctx.fill();ctx.shadowBlur=0;
  ctx.fillStyle='rgba(255,210,150,.85)';ctx.font='600 14px sans-serif';
  ctx.textAlign='center';ctx.textBaseline='top';ctx.fillText('อาทิตย์',sx,sy+24);

  // ดาวเสาร์ — วาดเป็นดาวจริงมีวงแหวน (มุมมองจากโลก) · ดวงพอง=ใกล้
  const near=(SAT.defR+SAT.epiR-dist)/(2*SAT.epiR);   // 0=ไกลสุด(conjunction) · 1=ใกล้สุด(opposition)
  const bR=10+8*Math.max(0,Math.min(1,near));   // รัศมีดวง 10–18: เล็กกว่าอาทิตย์(21) · opp→โตกว่าโลก(13)
  if(opp){
    const halo=ctx.createRadialGradient(stx,sty,0,stx,sty,bR*3.2);
    halo.addColorStop(0,'rgba(255,228,170,.5)');halo.addColorStop(1,'transparent');
    ctx.fillStyle=halo;ctx.beginPath();ctx.arc(stx,sty,bR*3.2,0,Math.PI*2);ctx.fill();
  }
  const rx=bR*2.15, ry=bR*0.6;
  ctx.save();ctx.translate(stx,sty);ctx.rotate(-0.32);
  // วงแหวน (วงเต็มด้านหลัง)
  ctx.strokeStyle='rgba(214,196,140,.8)';ctx.lineWidth=Math.max(2.4,bR*0.34);
  ctx.beginPath();ctx.ellipse(0,0,rx,ry,0,0,Math.PI*2);ctx.stroke();
  // ดวงเสาร์ (โทนทองซีดแบบเห็นจากโลก)
  ctx.shadowColor='rgba(255,210,120,.85)';ctx.shadowBlur=18;
  const bg=ctx.createRadialGradient(-bR*0.3,-bR*0.3,bR*0.2,0,0,bR);
  bg.addColorStop(0,'#F7E9BE');bg.addColorStop(.6,'#E3C77C');bg.addColorStop(1,'#B8945A');
  ctx.fillStyle=bg;ctx.beginPath();ctx.arc(0,0,bR,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
  // วงแหวนครึ่งหน้า (ทับดวง ให้ดูเป็นวงแหวนรอบดาว)
  ctx.strokeStyle='rgba(238,224,172,.95)';ctx.lineWidth=Math.max(2.4,bR*0.34);
  ctx.beginPath();ctx.ellipse(0,0,rx,ry,0,0,Math.PI);ctx.stroke();
  ctx.restore();
  // ป้าย "เสาร์" + พักร
  ctx.textAlign='center';ctx.textBaseline='top';
  ctx.fillStyle='rgba(232,212,150,.96)';ctx.font='600 18px sans-serif';
  ctx.fillText('เสาร์',stx,sty+ry+10);
  if(retro){
    ctx.textAlign='left';ctx.textBaseline='bottom';
    ctx.fillStyle='#ff7a7a';ctx.font='600 18px sans-serif';
    ctx.fillText('℞ พักร',stx+rx*0.75,sty-bR*0.6);
  }

  // หัวเรื่อง (กึ่งกลางบน)
  ctx.textAlign='center';ctx.textBaseline='alphabetic';
  ctx.fillStyle='#cf9bff';ctx.font='700 54px sans-serif';
  ctx.fillText('ดาวเคราะห์ใกล้โลก',CX,150);
  ctx.fillStyle='rgba(207,155,255,.8)';ctx.font='600 28px Georgia,serif';
  ctx.fillText('Opposition · ดาวเสาร์',CX,194);

  // badge สถานะ (ใต้หัวเรื่อง)
  ctx.font='700 36px sans-serif';
  if(opp){
    ctx.fillStyle='#d6a6ff';
    ctx.fillText('🪐 ตรงข้ามดวงอาทิตย์ — ใกล้+สว่างสุด',CX,300);
  }else{
    ctx.fillStyle='rgba(160,150,200,.9)';
    ctx.fillText('เสาร์อยู่ไกล (ค่อนไปทางดวงอาทิตย์)',CX,300);
  }

  // มุมเสาร์–อาทิตย์ (เล็ก ใต้ badge)
  ctx.fillStyle='rgba(207,155,255,.55)';ctx.font='400 24px sans-serif';
  ctx.fillText('มุมเสาร์–ดวงอาทิตย์ '+elong.toFixed(0)+'°  (180° = ตรงข้าม)',CX,338);

  // ── แผงระยะทาง + ขนาดเปรียบเทียบ (อิงเหตุการณ์ ๔ ต.ค. ๒๕๖๙ · ใต้ไดอะแกรม เหนือ caption) ──
  const py=1200;
  ctx.textAlign='center';ctx.textBaseline='alphabetic';
  ctx.fillStyle='rgba(207,155,255,.82)';ctx.font='600 30px sans-serif';
  ctx.fillText('ดวงอาทิตย์ — เสาร์   ~๑,๔๑๐ ล้านกม.  (๙.๔ AU)',CX,py);
  ctx.fillStyle='#e8d496';ctx.font='700 33px sans-serif';
  ctx.fillText('โลก — เสาร์ (ใกล้สุด ๔ ต.ค.)   ๑,๒๖๑ ล้านกม.  (๘.๔ AU)',CX,py+46);
  ctx.fillStyle='rgba(200,210,255,.7)';ctx.font='400 27px sans-serif';
  ctx.fillText('ขนาดจริง:  เสาร์ ≈ ๙ เท่าโลก   ·   ดวงอาทิตย์ ≈ ๑๒ เท่าเสาร์',CX,py+90);
}

export function OppositionVert(){
  const frame=useCurrentFrame();
  const ref=useRef(null);
  useLayoutEffect(()=>{if(!ref.current)return;const c=ref.current;c.width=W;c.height=H;draw(c,frame);},[frame]);
  const loopFade=interpolate(frame,[0,15,timingOpp.DURATION-15,timingOpp.DURATION],[0,1,1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
  // การ์ดเหตุการณ์ + เวลาสังเกตการณ์ (โผล่ช่วง intro ~5วิ ก่อนพากย์ · NARIT)
  const cardOp=interpolate(frame,[0,18,135,165],[0,1,1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
  return(<AbsoluteFill style={{background:'#010814'}}>
    <AbsoluteFill style={{opacity:loopFade}}>
      <canvas ref={ref} style={{width:W,height:H,position:'absolute'}}/>
      <Caption timing={timingOpp}/>
      <Credit timing={timingOpp} label="based on" source="ALMAGEST" sub="epicycle · Ptolemy ~150 CE"/>
    </AbsoluteFill>
    {cardOp>0.001&&(
      <AbsoluteFill style={{opacity:cardOp,justifyContent:'center',alignItems:'center',pointerEvents:'none'}}>
        <div style={{
          background:'rgba(4,8,20,0.88)',border:'1px solid rgba(204,136,255,0.4)',
          borderRadius:28,padding:'46px 54px',textAlign:'center',maxWidth:940,
          boxShadow:'0 0 70px rgba(160,110,255,0.32)'}}>
          <div style={{color:'#cf9bff',fontSize:36,fontWeight:600,letterSpacing:1}}>🪐 ปรากฏการณ์ท้องฟ้า ปี ๒๕๖๙</div>
          <div style={{color:'#ffffff',fontSize:74,fontWeight:800,margin:'16px 0 6px'}}>ดาวเสาร์ใกล้โลกที่สุด</div>
          <div style={{color:'#d6a6ff',fontSize:52,fontWeight:700}}>๔ ตุลาคม ๒๕๖๙</div>
          <div style={{color:'rgba(214,166,255,0.92)',fontSize:33,marginTop:26,lineHeight:1.5}}>
            👁 ดูได้ <b>ตลอดคืน</b> — ตั้งแต่ดวงอาทิตย์ตก ถึงรุ่งเช้า<br/>
            ขึ้นทางทิศ <b>ตะวันออก</b> · ตาเปล่าเห็นทั่วไทย
          </div>
          <div style={{color:'rgba(255,255,255,0.55)',fontSize:26,marginTop:22,fontStyle:'italic'}}>วงแหวนต้องใช้กล้องโทรทรรศน์ · ทำไม "ใกล้+สว่างสุด"? ↓</div>
        </div>
      </AbsoluteFill>
    )}
    <Narration timing={timingOpp} voDir="vo-opp"/>
    <Music timing={timingOpp} music="audio/shostakovich-waltz2-loop.wav"/>
  </AbsoluteFill>);
}
