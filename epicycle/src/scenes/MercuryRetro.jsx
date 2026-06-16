import {useCurrentFrame,AbsoluteFill,interpolate} from 'remotion';
import {useRef,useLayoutEffect} from 'react';
import {Caption} from '../Caption.jsx';
import {Narration} from '../Narration.jsx';
import {Music} from '../Music.jsx';
import {Credit} from '../Credit.jsx';
import * as timingMerc from '../timing-merc.js';

// ── ดาวพุธพักร (Mercury Retrograde) — เฉลยความเชื่อด้วยกลไกจริง ──
// โหราศาสตร์: "ดาวพุธพักร / ดาวพุธเสีย" = ดาวเดินถอยหลัง → ลางการสื่อสาร/สัญญา
// ดาราศาสตร์: พุธเป็น "ดาววงใน" โคจรเร็วกว่าโลก · พอพุธแซงโลก (มาอยู่ระหว่างโลก–ดวงอาทิตย์)
//   เส้นเล็งโลก→พุธ ที่ฉายขึ้นหมู่ดาว "วกถอย" = ภาพลวงตา ดาวไม่ได้เดินถอยจริง
//
// อัตรา/รัศมี heliocentric-equivalent จาก physics.js:
//   โลก ∝ SS=0.28 (1 AU) · พุธ ∝ eS=1.163 (0.387 AU) → พุธเร็วกว่าโลก ~4.15 เท่า (คาบ 0.241 ปี)
const W=1080,H=1920,SPEED=0.45;      // แนวตั้ง 9:16 (YouTube Shorts) · ช้าลงให้ retro window ยาวพอครอบช่วงพากย์อธิบาย
const CX=540,CY=860;                 // diagram กึ่งกลางค่อนบน · เว้นล่างให้ caption
const AU=270;                       // 1 AU = 270px (ขยายสเกลให้เห็นชัดบนมือถือ · เดิม 210)
const rE=AU, rMe=AU*0.469;          // วงโคจร โลก / พุธ — พุธ 0.469 เท่าโลก (ดันออกให้เห็นชัด + max elongation = asin(0.469) ≈ 28° ตรง label · เดิม 0.387)
const RING=478;                     // แถบดาวฤกษ์ (celestial sphere)
const wE=0.28, wMe=1.163;           // อัตราเชิงมุม "องศา" ต่อ f-unit (จาก physics.js)
const PHASE_ME=-357;                // เฟสพุธ → retro window 804–1022 sync กับ seg5–6 (พากย์อธิบายพักร)
const TR=150;                       // ความยาว trail (เฟรม)
const tr=d=>d*Math.PI/180;

const ZS=["เม","พฤ","มถ","กก","สิ","กน","ตล","พจ","ธน","มก","กภ","มน"];
const STARS=Array.from({length:220},(_,i)=>({
  x:(Math.sin(i*127.1)*.5+.5),y:(Math.sin(i*311.7)*.5+.5),
  r:i%9===0?1.3:i%3===0?.7:.35,tw:i*0.41
}));

const eAng=f=>tr(-90 - wE*f);
const meAng=f=>tr(-90 + PHASE_ME - wMe*f);
const earthPt=f=>({x:CX+rE*Math.cos(eAng(f)),y:CY+rE*Math.sin(eAng(f))});
const mercPt =f=>({x:CX+rMe*Math.cos(meAng(f)),y:CY+rMe*Math.sin(meAng(f))});

// เส้นเล็ง โลก→พุธ ต่อไปชนวงแถบดาว (รากบวกที่ไกล = ทิศที่เห็น)
function sightHit(E,M){
  const dx=M.x-E.x,dy=M.y-E.y;
  const fx=E.x-CX,fy=E.y-CY;
  const a=dx*dx+dy*dy,b=2*(fx*dx+fy*dy),c=fx*fx+fy*fy-RING*RING;
  const disc=b*b-4*a*c;if(disc<0)return null;
  const t=(-b+Math.sqrt(disc))/(2*a);
  return{x:E.x+t*dx,y:E.y+t*dy};
}
const wrap=a=>{while(a>Math.PI)a-=2*Math.PI;while(a<-Math.PI)a+=2*Math.PI;return a;};
// retro เมื่อทิศที่ "เห็น" (geocentric) สวนทางกับการเดินจริงของพุธ (heliocentric)
function isRetro(f){
  const h=0.5;
  const app=(g)=>{const P=sightHit(earthPt(g),mercPt(g));return P?Math.atan2(P.y-CY,P.x-CX):0;};
  const dApp=wrap(app(f+h)-app(f));
  const dHel=wrap(meAng(f+h)-meAng(f));
  return dApp*dHel<0;
}
// มุมห่างพุธ–ดวงอาทิตย์ ที่เห็นจากโลก (elongation, องศา)
function elong(f){
  const E=earthPt(f),M=mercPt(f);
  const aM=Math.atan2(M.y-E.y,M.x-E.x);
  const aS=Math.atan2(CY-E.y,CX-E.x);
  return Math.abs(wrap(aM-aS))*180/Math.PI;
}

function draw(canvas,frame){
  const ctx=canvas.getContext('2d');
  const f=frame*SPEED;

  // พื้นหลัง
  ctx.fillStyle='#010814';ctx.fillRect(0,0,W,H);
  const vg=ctx.createRadialGradient(CX,CY,W*.2,CX,CY,H*.5);
  vg.addColorStop(0,'transparent');vg.addColorStop(1,'rgba(0,0,10,.5)');
  ctx.fillStyle=vg;ctx.fillRect(0,0,W,H);
  STARS.forEach(s=>{
    ctx.globalAlpha=.07+Math.abs(Math.sin(s.tw+frame*.015))*.28;
    ctx.fillStyle='#aaccff';ctx.beginPath();ctx.arc(s.x*W,s.y*H,s.r,0,Math.PI*2);ctx.fill();
  });ctx.globalAlpha=1;

  // แถบดาวฤกษ์ (zodiac ring)
  const zO=RING+22,zI=RING-22;
  ctx.beginPath();ctx.arc(CX,CY,zO,0,Math.PI*2);ctx.arc(CX,CY,zI,0,Math.PI*2);
  ctx.fillStyle='rgba(8,12,40,.7)';ctx.fill('evenodd');
  ZS.forEach((s,i)=>{
    const a0=(-i*30-90)*Math.PI/180,am=(-i*30-15-90)*Math.PI/180;
    ctx.beginPath();ctx.moveTo(CX+zI*Math.cos(a0),CY+zI*Math.sin(a0));
    ctx.lineTo(CX+zO*Math.cos(a0),CY+zO*Math.sin(a0));
    ctx.strokeStyle='rgba(255,255,255,.1)';ctx.lineWidth=.4;ctx.stroke();
    ctx.save();ctx.translate(CX+RING*Math.cos(am),CY+RING*Math.sin(am));
    ctx.rotate(am+Math.PI/2);
    ctx.fillStyle='rgba(255,255,255,0.6)';ctx.font='500 13px sans-serif';
    ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(s,0,0);
    ctx.restore();
  });

  // วงโคจร (เข้มขึ้นให้เห็นชัดบนมือถือ)
  [[rE,'#8bbfff'],[rMe,'#55DD55']].forEach(([r,col])=>{
    ctx.beginPath();ctx.arc(CX,CY,r,0,Math.PI*2);
    ctx.strokeStyle=col+'66';ctx.lineWidth=1.4;ctx.setLineDash([5,8]);ctx.stroke();ctx.setLineDash([]);
  });

  const E=earthPt(f),M=mercPt(f),hit=sightHit(E,M);
  const retro=isRetro(f);

  // trail ของจุดที่เห็นบนแถบดาว — แดง=ถอยหลัง(พักร), เขียว=เดินหน้า
  for(let k=TR;k>=1;k--){
    const g=(frame-k)*SPEED;if(g<0)continue;
    const h0=sightHit(earthPt(g),mercPt(g));
    if(!h0)continue;
    const rt=isRetro(g);const a=(1-k/TR)*.9;
    ctx.globalAlpha=a;ctx.fillStyle=rt?'#ff4d4d':'#7be87b';
    ctx.beginPath();ctx.arc(h0.x,h0.y,rt?3.2:2,0,Math.PI*2);ctx.fill();
  }
  ctx.globalAlpha=1;

  // เส้นเล็ง โลก→พุธ→แถบดาว
  if(hit){
    ctx.beginPath();ctx.moveTo(E.x,E.y);ctx.lineTo(hit.x,hit.y);
    ctx.strokeStyle=retro?'rgba(255,90,90,.85)':'rgba(150,235,150,.7)';
    ctx.lineWidth=1.4;ctx.setLineDash([6,5]);ctx.stroke();ctx.setLineDash([]);
    ctx.shadowColor=retro?'#ff3333':'#55dd55';ctx.shadowBlur=22;
    ctx.fillStyle=retro?'#ff5555':'#9af09a';
    ctx.beginPath();ctx.arc(hit.x,hit.y,10,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
  }

  // รัศมี Sun→Earth, Sun→Mercury (จาง)
  ctx.strokeStyle='rgba(255,255,255,.12)';ctx.lineWidth=.6;
  [E,M].forEach(P=>{ctx.beginPath();ctx.moveTo(CX,CY);ctx.lineTo(P.x,P.y);ctx.stroke();});

  // ดวงอาทิตย์ (ขยาย ×1.65 คงสัดส่วน)
  ctx.shadowColor='#ffaa33';ctx.shadowBlur=46;
  const sg=ctx.createRadialGradient(CX,CY,0,CX,CY,26);
  sg.addColorStop(0,'#fff7e0');sg.addColorStop(.5,'#ffcc44');sg.addColorStop(1,'#ff7711');
  ctx.beginPath();ctx.arc(CX,CY,25,0,Math.PI*2);ctx.fillStyle=sg;ctx.fill();ctx.shadowBlur=0;

  // โลก (ขยาย ×1.65 คงสัดส่วน)
  ctx.shadowColor='#aaddff';ctx.shadowBlur=28;
  const eg=ctx.createRadialGradient(E.x,E.y,0,E.x,E.y,15);
  eg.addColorStop(0,'#fff');eg.addColorStop(1,'#5599ee');
  ctx.beginPath();ctx.arc(E.x,E.y,13,0,Math.PI*2);ctx.fillStyle=eg;ctx.fill();ctx.shadowBlur=0;
  ctx.fillStyle='rgba(190,220,255,.95)';ctx.font='600 20px sans-serif';
  ctx.textAlign='center';ctx.textBaseline='top';ctx.fillText('โลก',E.x,E.y+17);

  // ดาวพุธ (ขยาย ×1.65 คงสัดส่วน)
  ctx.shadowColor='#33bb33';ctx.shadowBlur=24;
  const mg=ctx.createRadialGradient(M.x,M.y,0,M.x,M.y,12);
  mg.addColorStop(0,'#e0ffe0');mg.addColorStop(1,'#33bb33');
  ctx.beginPath();ctx.arc(M.x,M.y,10,0,Math.PI*2);ctx.fillStyle=mg;ctx.fill();ctx.shadowBlur=0;
  ctx.fillStyle='rgba(150,235,150,.95)';ctx.font='600 20px sans-serif';
  ctx.textBaseline='bottom';ctx.fillText('พุธ',M.x,M.y-14);

  // ป้ายจุดที่เห็น
  if(hit){
    const lx=hit.x, ly=hit.y+(hit.y<CY?-30:30);
    ctx.fillStyle=retro?'#ff8080':'rgba(150,235,150,.9)';
    ctx.font='600 18px sans-serif';ctx.textAlign='center';
    ctx.textBaseline=hit.y<CY?'bottom':'top';
    ctx.fillText('พุธที่เห็นบนฟ้า',lx,ly);
  }

  // หัวเรื่อง ซ้ายบน (ขยายสำหรับจอแนวตั้ง)
  ctx.textAlign='left';ctx.textBaseline='alphabetic';
  ctx.fillStyle='#8be88b';ctx.font='700 56px Georgia,serif';
  ctx.fillText('ดาวพุธพักร',44,96);
  ctx.fillStyle='rgba(139,232,139,.85)';ctx.font='600 30px sans-serif';
  ctx.fillText('Mercury Retrograde — ดาวเดินถอยหลังจริงหรือ?',44,142);
  ctx.fillStyle='rgba(255,255,255,.55)';ctx.font='400 24px sans-serif';
  ctx.fillText('โหราศาสตร์เรียก "พักร / ดาวพุธเสีย" — ลางการสื่อสาร',44,178);

  // ข้อมูลมุมขวาบน
  ctx.textAlign='right';
  ctx.fillStyle='rgba(255,255,255,.5)';ctx.font='400 22px sans-serif';
  ctx.fillText('Horatad · ดวงอาทิตย์เป็นศูนย์กลาง',W-44,96);
  // มุมห่างจากดวงอาทิตย์ (พุธไม่เคยห่างเกิน ~28°)
  ctx.fillStyle='rgba(150,235,150,.6)';ctx.font='400 21px sans-serif';
  ctx.fillText('พุธห่างดวงอาทิตย์ '+elong(f).toFixed(0)+'° (สูงสุด ~28°)',W-44,126);

  // badge สถานะพักร/ปกติ (กลางบน ใต้ title) — caption เสียงพากย์อยู่ล่างแล้ว (Caption component)
  ctx.textAlign='center';ctx.textBaseline='alphabetic';
  ctx.font='700 40px sans-serif';
  ctx.fillStyle=retro?'#ff6a6a':'#7be87b';
  ctx.fillText(retro?'●  ตอนนี้: ดาวพุธพักร — ดูถอยหลัง':'●  ตอนนี้: พุธเดินหน้าปกติ',CX,300);
}

export function MercuryRetro(){
  const frame=useCurrentFrame();
  const ref=useRef(null);
  useLayoutEffect(()=>{
    if(!ref.current)return;
    const c=ref.current;c.width=W;c.height=H;draw(c,frame);
  },[frame]);
  const loopFade=interpolate(frame,[0,15,timingMerc.DURATION-15,timingMerc.DURATION],[0,1,1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
  return(
    <AbsoluteFill style={{background:'#010814'}}>
      <AbsoluteFill style={{opacity:loopFade}}>
        <canvas ref={ref} style={{width:W,height:H,position:'absolute'}}/>
        <Caption timing={timingMerc}/>
        <Credit timing={timingMerc} label="based on" source="HELIOCENTRIC" sub="Copernicus · 1543"/>
      </AbsoluteFill>
      <Narration timing={timingMerc} voDir="vo-merc"/>
      <Music timing={timingMerc} music="audio/shostakovich-waltz2-loop.wav"/>
    </AbsoluteFill>
  );
}
