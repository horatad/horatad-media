import {useCurrentFrame,AbsoluteFill,interpolate} from 'remotion';
import {useRef,useLayoutEffect} from 'react';
import {PLANETS,isRetro,SS,S0} from '../physics.js';
import {Caption} from '../Caption.jsx';
import {Narration} from '../Narration.jsx';
import {Music} from '../Music.jsx';
import {Credit} from '../Credit.jsx';
import * as timingOpp from '../timing-opp.js';

// ── Opposition แนวตั้ง (Shorts 1080×1920) — มุมมอง HELIOCENTRIC ──
// ดวงอาทิตย์กลาง · โลกวงในโคจรเร็ว · เสาร์วงนอกโคจรช้า
// opposition = โลกแซงมาอยู่ฝั่งเดียวกับเสาร์ → ใกล้+สว่างสุด + พักร
// SPEED 3 (โลกโคจรช้าลง 50% ตามคำสั่งพี่) → ปรากฏการณ์วน ~4 รอบในคลิป
const W=1080,H=1920,SPEED=3,OFF=920;
const CX=540,CY=1080;                // ดวงอาทิตย์ต่ำลง → ดาราจักรเต็มจอ (text อยู่บนหมด)
const RE=250, RS=540;                // รัศมีวงโคจรใหญ่ (เต็มจอ): โลก(วงใหญ่เต็มล่าง) · เสาร์(เต็มกว้าง)
const SAT=PLANETS.find(p=>p.id==='saturn');
const STARS=Array.from({length:300},(_,i)=>({
  x:(Math.sin(i*127.1)*.5+.5),y:(Math.sin(i*311.7)*.5+.5),
  r:i%9===0?1.3:i%3===0?.7:.35,tw:i*0.41
}));
const FADE=22;                       // เฟรมที่พื้นที่แรเงาค่อยจางหายหลังจบพักร

// ตำแหน่ง heliocentric ของโลก/เสาร์ ณ เฟรมใดๆ (ใช้คำนวณพื้นที่กวาด)
function posAt(fr){
  const f=fr*SPEED+OFF, dr=Math.PI/180;
  const lamE=(S0-SS*f+180)*dr, lamS=(S0-SAT.dS*f)*dr;
  return {ex:CX+RE*Math.cos(lamE),ey:CY+RE*Math.sin(lamE),sx:CX+RS*Math.cos(lamS),sy:CY+RS*Math.sin(lamS)};
}
// ช่วงพักร (เดินถอยหลัง) ทั้งหมดในคลิป — คำนวณล่วงหน้า [{s,e}]
const RETRO=[];
{let was=false,st=0;for(let fr=0;fr<timingOpp.DURATION;fr++){const r=isRetro(SAT,fr*SPEED+OFF);if(r&&!was)st=fr;if(!r&&was)RETRO.push({s:st,e:fr-1});was=r;}if(was)RETRO.push({s:st,e:timingOpp.DURATION-1});}

function drawSaturn(ctx,x,y,bR,opp){
  if(opp){
    const halo=ctx.createRadialGradient(x,y,0,x,y,bR*3.2);
    halo.addColorStop(0,'rgba(255,228,170,.5)');halo.addColorStop(1,'transparent');
    ctx.fillStyle=halo;ctx.beginPath();ctx.arc(x,y,bR*3.2,0,Math.PI*2);ctx.fill();
  }
  const rx=bR*2.15, ry=bR*0.6;
  ctx.save();ctx.translate(x,y);ctx.rotate(-0.32);
  ctx.strokeStyle='rgba(214,196,140,.8)';ctx.lineWidth=Math.max(2.4,bR*0.34);
  ctx.beginPath();ctx.ellipse(0,0,rx,ry,0,0,Math.PI*2);ctx.stroke();
  ctx.shadowColor='rgba(255,210,120,.85)';ctx.shadowBlur=18;
  const bg=ctx.createRadialGradient(-bR*0.3,-bR*0.3,bR*0.2,0,0,bR);
  bg.addColorStop(0,'#F7E9BE');bg.addColorStop(.6,'#E3C77C');bg.addColorStop(1,'#B8945A');
  ctx.fillStyle=bg;ctx.beginPath();ctx.arc(0,0,bR,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
  ctx.strokeStyle='rgba(238,224,172,.95)';ctx.lineWidth=Math.max(2.4,bR*0.34);
  ctx.beginPath();ctx.ellipse(0,0,rx,ry,0,0,Math.PI);ctx.stroke();
  ctx.restore();
  return ry;
}

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

  // ── ตำแหน่ง heliocentric (ดวงอาทิตย์ = ศูนย์กลาง) ──
  const dr=Math.PI/180;
  const lamE=(S0-SS*f+180)*dr;        // โลก: ตรงข้ามทิศดวงอาทิตย์(geo) = longitude รอบอาทิตย์
  const lamS=(S0-SAT.dS*f)*dr;        // เสาร์: longitude รอบอาทิตย์ (ช้า)
  const ex=CX+RE*Math.cos(lamE), ey=CY+RE*Math.sin(lamE);
  const stx=CX+RS*Math.cos(lamS), sty=CY+RS*Math.sin(lamS);

  // มุมเสาร์–อาทิตย์ ที่ตาคนบนโลกเห็น (geocentric elongation)
  const eSunx=CX-ex, eSuny=CY-ey, eSatx=stx-ex, eSaty=sty-ey;
  const dot=eSunx*eSatx+eSuny*eSaty;
  const mag=Math.hypot(eSunx,eSuny)*Math.hypot(eSatx,eSaty)||1;
  const elong=Math.acos(Math.max(-1,Math.min(1,dot/mag)))*180/Math.PI;
  const opp=elong>150;
  const retro=isRetro(SAT,f);
  const dpx=Math.hypot(eSatx,eSaty);
  const near=Math.max(0,Math.min(1,(RS+RE-dpx)/(2*RE)));

  // วงโคจร
  ctx.beginPath();ctx.arc(CX,CY,RS,0,Math.PI*2);
  ctx.strokeStyle='rgba(204,136,255,.18)';ctx.lineWidth=1;ctx.setLineDash([3,9]);ctx.stroke();ctx.setLineDash([]);
  ctx.beginPath();ctx.arc(CX,CY,RE,0,Math.PI*2);
  ctx.strokeStyle='rgba(120,180,255,.30)';ctx.lineWidth=1;ctx.setLineDash([3,7]);ctx.stroke();ctx.setLineDash([]);

  // ช่วงเสาร์พักร: พื้นที่แรเงาแดงจาง = บริเวณที่เส้นเล็งโลก→เสาร์กวาดผ่าน
  // โตจากตำแหน่งเริ่มพักร→ปัจจุบัน · จบพักรแล้วค่อยจางหาย (FADE)
  let shade=null, sa=0;
  for(const w of RETRO){
    if(frame>=w.s&&frame<=w.e){shade=[w.s,frame];sa=1;break;}
    if(frame>w.e&&frame<=w.e+FADE){shade=[w.s,w.e];sa=1-(frame-w.e)/FADE;break;}
  }
  if(shade&&shade[1]>shade[0]){
    const N=20,pts=[];
    for(let i=0;i<=N;i++){const p=posAt(shade[0]+(shade[1]-shade[0])*i/N);pts.push([p.sx,p.sy]);}
    for(let i=N;i>=0;i--){const p=posAt(shade[0]+(shade[1]-shade[0])*i/N);pts.push([p.ex,p.ey]);}
    ctx.save();
    ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);
    for(let i=1;i<pts.length;i++)ctx.lineTo(pts[i][0],pts[i][1]);
    ctx.closePath();
    ctx.fillStyle='rgba(255,70,70,'+(0.13*sa).toFixed(3)+')';ctx.fill();
    ctx.strokeStyle='rgba(255,90,90,'+(0.22*sa).toFixed(3)+')';ctx.lineWidth=1.5;ctx.stroke();
    ctx.restore();
  }

  // ดวงอาทิตย์ (ใหญ่สุด — ศูนย์กลาง)
  ctx.shadowColor='#FF7733';ctx.shadowBlur=44;
  const sg=ctx.createRadialGradient(CX,CY,0,CX,CY,34);
  sg.addColorStop(0,'#FFE7A0');sg.addColorStop(1,'#FF5522');
  ctx.beginPath();ctx.arc(CX,CY,33,0,Math.PI*2);ctx.fillStyle=sg;ctx.fill();ctx.shadowBlur=0;
  ctx.fillStyle='rgba(255,210,150,.92)';ctx.font='600 22px sans-serif';
  ctx.textAlign='center';ctx.textBaseline='top';ctx.fillText('ดวงอาทิตย์',CX,CY+38);

  // โลก (วงใน เคลื่อนเร็ว)
  const eR=18;
  ctx.shadowColor='#aaddff';ctx.shadowBlur=20;
  const eg=ctx.createRadialGradient(ex,ey,0,ex,ey,eR);
  eg.addColorStop(0,'#fff');eg.addColorStop(1,'#6fb0ff');
  ctx.beginPath();ctx.arc(ex,ey,eR,0,Math.PI*2);ctx.fillStyle=eg;ctx.fill();ctx.shadowBlur=0;
  ctx.fillStyle='rgba(190,215,255,.97)';ctx.font='600 22px sans-serif';
  ctx.textBaseline='top';ctx.fillText('โลก',ex,ey+eR+4);

  // ดาวเสาร์ (ดวงจริงมีวงแหวน · ใกล้=ใหญ่)
  const bR=17+13*near;                // 17–30: เล็กกว่าอาทิตย์(33) · opp→โตกว่าโลก(18) ชัดเจน
  const ry=drawSaturn(ctx,stx,sty,bR,opp);
  ctx.textAlign='center';ctx.textBaseline='top';
  ctx.fillStyle='rgba(235,216,154,.97)';ctx.font='600 23px sans-serif';
  ctx.fillText('เสาร์',stx,sty+ry+12);
  if(retro){
    ctx.textAlign='left';ctx.textBaseline='bottom';
    ctx.fillStyle='#ff8585';ctx.font='700 23px sans-serif';
    ctx.fillText('℞ พักร',stx+bR*2.2,sty-bR*0.5);
  }

  // ── ข้อความทั้งหมดอยู่ด้านบน · เก็บเฉพาะสำคัญ · ตัวใหญ่อ่านง่ายบนมือถือ ──
  ctx.textAlign='center';ctx.textBaseline='alphabetic';
  ctx.fillStyle='#cf9bff';ctx.font='700 60px sans-serif';
  ctx.fillText('ดาวเสาร์ใกล้โลก',CX,120);
  ctx.fillStyle='rgba(207,155,255,.72)';ctx.font='600 27px Georgia,serif';
  ctx.fillText('Opposition · มุมมองเฮลิโอเซนทริก',CX,164);

  // badge สถานะ (ใจความหลัก · ตัวใหญ่)
  ctx.font='700 42px sans-serif';
  if(opp){
    ctx.fillStyle='#ffd98a';
    ctx.fillText('🪐 โลกแซงมาอยู่กลาง = เสาร์ใกล้สุด',CX,244);
  }else{
    ctx.fillStyle='rgba(170,160,210,.92)';
    ctx.fillText('โลกยังไม่ถึงจุดตรงข้าม — เสาร์ไกล',CX,244);
  }
  // ใจความ ระยะ+ขนาด — บรรทัดเดียว สำคัญ
  ctx.fillStyle='#e8d496';ctx.font='700 32px sans-serif';
  ctx.fillText('ใกล้สุด ๔ ต.ค. · ๑,๒๖๑ ล้านกม. · เสาร์ใหญ่ ๙ เท่าโลก',CX,300);
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
      <Credit timing={timingOpp} label="based on" source="COPERNICUS" sub="heliocentric · 1543"/>
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
    <Music timing={timingOpp} music="audio/estudio-brillante-clip.mp3"/>
  </AbsoluteFill>);
}
