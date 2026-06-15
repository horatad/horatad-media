import {useCurrentFrame,AbsoluteFill} from 'remotion';
import {useRef,useLayoutEffect} from 'react';

// ── ฉากชูโรง: Heliocentric — retrograde = ภาพลวงจากมุมมอง ──
// ดวงอาทิตย์เป็นศูนย์กลาง · โลก (วงใน เร็ว) + อังคาร (วงนอก ช้า) โคจรรอบ
// เส้นเล็ง โลก→อังคาร ต่อออกไปชน "แถบดาวฤกษ์" ขอบจอ → จุดที่เห็นบนท้องฟ้า
// พอโลกแซงอังคาร จุดบนแถบดาววิ่งย้อน = retrograde (ไม่มีวงเอพิไซเคิลจริง)
//
// อัตรา/รัศมีดึงจาก physics.js (heliocentric-equivalent):
//   อัตราเชิงมุม โลก ∝ SS=0.28, อังคาร ∝ Mars dS=0.14887  (ratio=คาบจริง 1.881 ปี)
//   รัศมีจริง โลก=1 AU, อังคาร=1.524 AU
const W=1080,H=1080,SPEED=4.5;
const CX=540,CY=540;
const AU=80;                        // 1 AU = 80px — วงโคจรเล็กเทียบรัศมีวงดาว
                                    // เพื่อให้ parallax โลกน้อย จุดเล็งจึงย้อน (retrograde) จริง
const rE=AU, rM=AU*1.524;           // วงโคจร โลก / อังคาร
const RING=478;                     // รัศมีแถบดาวฤกษ์ (celestial sphere)
const wE=0.28, wM=0.14887;          // อัตราเชิงมุม "องศา" ต่อ f-unit (เหมือน physics.js)
const PHASE_M=-160;                 // เฟสเริ่มอังคาร (องศา) → opposition แรก ~frame 271
const TR=120;                       // ความยาว trail (เฟรม)
const tr=d=>d*Math.PI/180;

const ZS=["เม","พฤ","มถ","กก","สิ","กน","ตล","พจ","ธน","มก","กภ","มน"];
const STARS=Array.from({length:220},(_,i)=>({
  x:(Math.sin(i*127.1)*.5+.5),y:(Math.sin(i*311.7)*.5+.5),
  r:i%9===0?1.3:i%3===0?.7:.35,tw:i*0.41
}));

const eAng=f=>tr(-90 - wE*f);
const mAng=f=>tr(-90 + PHASE_M - wM*f);
const earthPt=f=>({x:CX+rE*Math.cos(eAng(f)),y:CY+rE*Math.sin(eAng(f))});
const marsPt =f=>({x:CX+rM*Math.cos(mAng(f)),y:CY+rM*Math.sin(mAng(f))});

// เส้นเล็ง โลก→อังคาร ต่อไปชนวงแถบดาว (เอา intersection ที่ไกลออกไป)
function sightHit(E,M){
  const dx=M.x-E.x,dy=M.y-E.y;
  const fx=E.x-CX,fy=E.y-CY;
  const a=dx*dx+dy*dy,b=2*(fx*dx+fy*dy),c=fx*fx+fy*fy-RING*RING;
  const disc=b*b-4*a*c;if(disc<0)return null;
  const t=(-b+Math.sqrt(disc))/(2*a);          // รากบวกที่ไกล = ทิศอังคาร
  return{x:E.x+t*dx,y:E.y+t*dy};
}
const wrap=a=>{while(a>Math.PI)a-=2*Math.PI;while(a<-Math.PI)a+=2*Math.PI;return a;};
// retro เมื่อทิศที่ "เห็น" (geocentric) สวนทางกับการเดินจริงของอังคาร (heliocentric)
function isRetro(f){
  const h=0.5;
  const app=(g)=>{const H=sightHit(earthPt(g),marsPt(g));return Math.atan2(H.y-CY,H.x-CX);};
  const dApp=wrap(app(f+h)-app(f));
  const dHel=wrap(mAng(f+h)-mAng(f));
  return dApp*dHel<0;
}

function draw(canvas,frame){
  const ctx=canvas.getContext('2d');
  const f=frame*SPEED;

  // พื้นหลัง
  ctx.fillStyle='#010814';ctx.fillRect(0,0,W,H);
  const vg=ctx.createRadialGradient(CX,CY,W*.2,CX,CY,W*.62);
  vg.addColorStop(0,'transparent');vg.addColorStop(1,'rgba(0,0,10,.5)');
  ctx.fillStyle=vg;ctx.fillRect(0,0,W,H);
  STARS.forEach(s=>{
    ctx.globalAlpha=.07+Math.abs(Math.sin(s.tw+frame*.015))*.28;
    ctx.fillStyle='#aaccff';ctx.beginPath();ctx.arc(s.x*W,s.y*H,s.r,0,Math.PI*2);ctx.fill();
  });ctx.globalAlpha=1;

  // แถบดาวฤกษ์ (zodiac ring) — ดาวฤกษ์ไกลโพ้น
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

  // วงโคจร
  [[rE,'#8bbfff'],[rM,'#ff7799']].forEach(([r,col])=>{
    ctx.beginPath();ctx.arc(CX,CY,r,0,Math.PI*2);
    ctx.strokeStyle=col+'33';ctx.lineWidth=.8;ctx.setLineDash([3,7]);ctx.stroke();ctx.setLineDash([]);
  });

  const E=earthPt(f),M=marsPt(f),hit=sightHit(E,M);
  const retro=isRetro(f);

  // trail ของจุดที่เห็นบนแถบดาว — แดง=ถอยหลัง, ฟ้า=เดินหน้า
  for(let k=TR;k>=1;k--){
    const g=(frame-k)*SPEED;if(g<0)continue;
    const h0=sightHit(earthPt(g),marsPt(g));
    if(!h0)continue;
    const rt=isRetro(g);const a=(1-k/TR)*.9;
    ctx.globalAlpha=a;ctx.fillStyle=rt?'#ff4d4d':'#7fd0ff';
    ctx.beginPath();ctx.arc(h0.x,h0.y,rt?3.2:2,0,Math.PI*2);ctx.fill();
  }
  ctx.globalAlpha=1;

  // เส้นเล็ง โลก→อังคาร→แถบดาว
  if(hit){
    ctx.beginPath();ctx.moveTo(E.x,E.y);ctx.lineTo(hit.x,hit.y);
    ctx.strokeStyle=retro?'rgba(255,90,90,.85)':'rgba(180,220,255,.7)';
    ctx.lineWidth=1.4;ctx.setLineDash([6,5]);ctx.stroke();ctx.setLineDash([]);
    // จุดที่เห็นบนท้องฟ้า
    ctx.shadowColor=retro?'#ff3333':'#66ccff';ctx.shadowBlur=16;
    ctx.fillStyle=retro?'#ff5555':'#aadfff';
    ctx.beginPath();ctx.arc(hit.x,hit.y,7,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
  }

  // รัศมี Sun→Earth, Sun→Mars (จาง)
  ctx.strokeStyle='rgba(255,255,255,.12)';ctx.lineWidth=.6;
  [E,M].forEach(P=>{ctx.beginPath();ctx.moveTo(CX,CY);ctx.lineTo(P.x,P.y);ctx.stroke();});

  // ดวงอาทิตย์
  ctx.shadowColor='#ffaa33';ctx.shadowBlur=34;
  const sg=ctx.createRadialGradient(CX,CY,0,CX,CY,16);
  sg.addColorStop(0,'#fff7e0');sg.addColorStop(.5,'#ffcc44');sg.addColorStop(1,'#ff7711');
  ctx.beginPath();ctx.arc(CX,CY,15,0,Math.PI*2);ctx.fillStyle=sg;ctx.fill();ctx.shadowBlur=0;

  // โลก
  ctx.shadowColor='#aaddff';ctx.shadowBlur=18;
  const eg=ctx.createRadialGradient(E.x,E.y,0,E.x,E.y,9);
  eg.addColorStop(0,'#fff');eg.addColorStop(1,'#5599ee');
  ctx.beginPath();ctx.arc(E.x,E.y,8,0,Math.PI*2);ctx.fillStyle=eg;ctx.fill();ctx.shadowBlur=0;
  ctx.fillStyle='rgba(190,220,255,.95)';ctx.font='600 15px sans-serif';
  ctx.textAlign='center';ctx.textBaseline='top';ctx.fillText('โลก',E.x,E.y+11);

  // อังคาร
  ctx.shadowColor='#ff3355';ctx.shadowBlur=16;
  const mg=ctx.createRadialGradient(M.x,M.y,0,M.x,M.y,8);
  mg.addColorStop(0,'#ffd9e0');mg.addColorStop(1,'#ee3355');
  ctx.beginPath();ctx.arc(M.x,M.y,7,0,Math.PI*2);ctx.fillStyle=mg;ctx.fill();ctx.shadowBlur=0;
  ctx.fillStyle='rgba(255,180,195,.95)';ctx.font='600 15px sans-serif';
  ctx.textBaseline='bottom';ctx.fillText('อังคาร',M.x,M.y-10);

  // ป้ายจุดที่เห็น
  if(hit){
    const lx=hit.x+(hit.x<CX?-1:1)*0, ly=hit.y+(hit.y<CY?-26:26);
    ctx.fillStyle=retro?'#ff8080':'rgba(170,223,255,.9)';
    ctx.font='600 14px sans-serif';ctx.textAlign='center';
    ctx.textBaseline=hit.y<CY?'bottom':'top';
    ctx.fillText('ที่เห็นบนฟ้า',lx,ly);
  }

  // หัวเรื่อง ซ้ายบน
  ctx.textAlign='left';
  ctx.fillStyle='#9fd3ff';ctx.font='700 30px Georgia,serif';
  ctx.fillText('Heliocentric',36,56);
  ctx.fillStyle='rgba(159,211,255,.8)';ctx.font='600 22px sans-serif';
  ctx.fillText('ดวงอาทิตย์เป็นศูนย์กลาง',36,92);
  ctx.fillStyle='rgba(255,255,255,.55)';ctx.font='400 17px sans-serif';
  ctx.fillText('retrograde = ภาพลวงจากมุมมอง',36,122);

  // ขวาบน
  ctx.textAlign='right';
  ctx.fillStyle='rgba(255,255,255,.55)';ctx.font='400 16px sans-serif';
  ctx.fillText('Horatad',W-36,56);
  ctx.fillText('11 Jun 2026',W-36,78);

  // แคปชันล่าง เมื่อ retrograde
  if(retro){
    ctx.textAlign='center';
    ctx.fillStyle='#ff6a6a';ctx.font='700 30px sans-serif';
    ctx.fillText('อังคารถอยหลัง',W/2,H-70);
    ctx.fillStyle='rgba(255,160,160,.9)';ctx.font='500 19px sans-serif';
    ctx.fillText('โลกวงในกำลังแซง → ภาพลวงตา',W/2,H-38);
  }else{
    ctx.textAlign='center';
    ctx.fillStyle='rgba(180,210,255,.7)';ctx.font='500 18px sans-serif';
    ctx.fillText('โลกโคจรเร็วกว่า เดี๋ยวจะไล่แซงอังคาร',W/2,H-44);
  }
}

export function HelioRetro(){
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
