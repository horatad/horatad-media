import {useCurrentFrame,AbsoluteFill} from 'remotion';
import {useRef,useLayoutEffect} from 'react';

// ── Dual-view heliocentric: กลไก (บน) + ท้องฟ้าที่เห็นจากโลก (ล่าง) ──
// บน  : ดวงอาทิตย์กลาง · โลก(เร็ว)+อังคาร(ช้า) · เส้นเล็งโลก→อังคาร→แถบดาว
// ล่าง: ท้องฟ้ายามค่ำ — อังคารลากเส้นในหมู่ดาวฤกษ์ · พอโลกแซง = ห่วงถอยหลัง (retrograde)
const W=1080,H=1080,SPEED=4.5;
const tr=d=>d*Math.PI/180;
const wrapPi=a=>{while(a>Math.PI)a-=2*Math.PI;while(a<-Math.PI)a+=2*Math.PI;return a;};

// --- กลไก (top diagram) ---
const CX=540,CY=360,RING=318;       // วงดาวเล็กลง เว้นที่แถบล่าง
const AU=52,rE=AU,rM=AU*1.524;      // วงโคจรเล็กเทียบ RING → parallax น้อย → retro จริง
const wE=0.28,wM=0.14887,PHASE_M=-160;
const eAng=f=>tr(-90-wE*f),mAng=f=>tr(-90+PHASE_M-wM*f);
const earthPt=f=>({x:CX+rE*Math.cos(eAng(f)),y:CY+rE*Math.sin(eAng(f))});
const marsPt =f=>({x:CX+rM*Math.cos(mAng(f)),y:CY+rM*Math.sin(mAng(f))});
function sightHit(E,M){
  const dx=M.x-E.x,dy=M.y-E.y,fx=E.x-CX,fy=E.y-CY;
  const a=dx*dx+dy*dy,b=2*(fx*dx+fy*dy),c=fx*fx+fy*fy-RING*RING;
  const disc=b*b-4*a*c;if(disc<0)return null;
  const t=(-b+Math.sqrt(disc))/(2*a);return{x:E.x+t*dx,y:E.y+t*dy};
}
// retro เมื่อทิศที่เห็น (จุดเล็งบนวง) สวนทางการเดินจริงของอังคาร
function isRetro(f){
  const h=0.5;const ap=g=>{const H=sightHit(earthPt(g),marsPt(g));return Math.atan2(H.y-CY,H.x-CX);};
  return wrapPi(ap(f+h)-ap(f))*wrapPi(mAng(f+h)-mAng(f))<0;
}

// --- ท้องฟ้าจากโลก (bottom panel) ---
// NOTE: prototype — กล้องตรึงที่ opposition รอบ frame ~272 (LON0) เพื่อโชว์ห่วงเต็มๆ
// ของจริงจะทำกล้อง running-mean ให้ใช้ได้ทุก opposition
const PX0=36,PY0=720,PX1=1044,PY1=1008,PCx=540,PCy=862;
const GAINX=1000,GAINY=300,INC=0.09;     // INC ใกล้จริง — ห่วงอ้วนเองเพราะระยะใกล้ที่ opposition
const LON0=-1.2437, NODE=-7.5436;        // ลองจิจูด & node ที่ opposition → ห่วงไขว้
const appLonLat=f=>{
  const e=earthPt(f),m=marsPt(f);
  const lon=Math.atan2(m.y-e.y,m.x-e.x);
  const dEM=Math.hypot(m.x-e.x,m.y-e.y);
  const lat=Math.atan2(rM*INC*Math.sin(mAng(f)-NODE),dEM);  // ละติจูดเหนือสุริยวิถี
  return{lon,lat};
};
// ตำแหน่งบนแถบ: x = ลองจิจูดสัมบูรณ์เทียบดาวฤกษ์ (ตรึงที่ opposition) → retrograde ถอยจริง
const skyXY=f=>{
  const{lon,lat}=appLonLat(f);
  return{x:PCx+GAINX*wrapPi(lon-LON0),y:PCy-GAINY*lat};
};
const SKYSTARS=Array.from({length:90},(_,i)=>({
  lon:LON0+tr((i*40.7)%360-180),y:PY0+18+((Math.sin(i*51.3)*.5+.5)*(PY1-PY0-36)),
  r:i%7===0?1.5:i%3===0?.9:.5
}));
const TWINK=Array.from({length:160},(_,i)=>({
  x:(Math.sin(i*127.1)*.5+.5),y:(Math.sin(i*311.7)*.5+.5),
  r:i%9===0?1.2:.5,tw:i*0.41
}));

function draw(canvas,frame){
  const ctx=canvas.getContext('2d');
  const f=frame*SPEED;
  const retro=isRetro(f);

  ctx.fillStyle='#010814';ctx.fillRect(0,0,W,H);
  TWINK.forEach(s=>{
    if(s.y*H>PY0-10)return;
    ctx.globalAlpha=.06+Math.abs(Math.sin(s.tw+frame*.015))*.26;
    ctx.fillStyle='#aaccff';ctx.beginPath();ctx.arc(s.x*W,s.y*H,s.r,0,Math.PI*2);ctx.fill();
  });ctx.globalAlpha=1;

  // ===== แถบดาวฤกษ์ (วงรอบกลไก) =====
  ctx.beginPath();ctx.arc(CX,CY,RING,0,Math.PI*2);
  ctx.strokeStyle='rgba(120,150,220,.18)';ctx.lineWidth=10;ctx.stroke();

  // วงโคจร
  [[rE,'#8bbfff'],[rM,'#ff7799']].forEach(([r,col])=>{
    ctx.beginPath();ctx.arc(CX,CY,r,0,Math.PI*2);
    ctx.strokeStyle=col+'33';ctx.lineWidth=.8;ctx.setLineDash([3,7]);ctx.stroke();ctx.setLineDash([]);
  });

  const E=earthPt(f),M=marsPt(f),hit=sightHit(E,M);

  // trail จุดเล็งบนวง
  for(let k=130;k>=1;k--){
    const g=(frame-k)*SPEED;if(g<0)continue;
    const h0=sightHit(earthPt(g),marsPt(g));if(!h0)continue;
    const rt=isRetro(g),a=(1-k/130)*.85;
    ctx.globalAlpha=a;ctx.fillStyle=rt?'#ff4d4d':'#7fd0ff';
    ctx.beginPath();ctx.arc(h0.x,h0.y,rt?2.8:1.8,0,Math.PI*2);ctx.fill();
  }
  ctx.globalAlpha=1;

  // เส้นเล็ง
  if(hit){
    ctx.beginPath();ctx.moveTo(E.x,E.y);ctx.lineTo(hit.x,hit.y);
    ctx.strokeStyle=retro?'rgba(255,90,90,.9)':'rgba(180,220,255,.75)';
    ctx.lineWidth=1.4;ctx.setLineDash([6,5]);ctx.stroke();ctx.setLineDash([]);
    ctx.shadowColor=retro?'#ff3333':'#66ccff';ctx.shadowBlur=14;
    ctx.fillStyle=retro?'#ff5555':'#aadfff';
    ctx.beginPath();ctx.arc(hit.x,hit.y,6,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
  }

  // รัศมี Sun→Earth, Sun→Mars
  ctx.strokeStyle='rgba(255,255,255,.1)';ctx.lineWidth=.6;
  [E,M].forEach(P=>{ctx.beginPath();ctx.moveTo(CX,CY);ctx.lineTo(P.x,P.y);ctx.stroke();});

  // ดวงอาทิตย์
  ctx.shadowColor='#ffaa33';ctx.shadowBlur=30;
  const sg=ctx.createRadialGradient(CX,CY,0,CX,CY,14);
  sg.addColorStop(0,'#fff7e0');sg.addColorStop(.5,'#ffcc44');sg.addColorStop(1,'#ff7711');
  ctx.beginPath();ctx.arc(CX,CY,13,0,Math.PI*2);ctx.fillStyle=sg;ctx.fill();ctx.shadowBlur=0;
  // โลก
  ctx.shadowColor='#aaddff';ctx.shadowBlur=15;
  const eg=ctx.createRadialGradient(E.x,E.y,0,E.x,E.y,8);
  eg.addColorStop(0,'#fff');eg.addColorStop(1,'#5599ee');
  ctx.beginPath();ctx.arc(E.x,E.y,7,0,Math.PI*2);ctx.fillStyle=eg;ctx.fill();ctx.shadowBlur=0;
  ctx.fillStyle='rgba(190,220,255,.95)';ctx.font='600 13px sans-serif';
  ctx.textAlign='center';ctx.textBaseline='top';ctx.fillText('โลก',E.x,E.y+9);
  // อังคาร
  ctx.shadowColor='#ff3355';ctx.shadowBlur=14;
  const mg=ctx.createRadialGradient(M.x,M.y,0,M.x,M.y,7);
  mg.addColorStop(0,'#ffd9e0');mg.addColorStop(1,'#ee3355');
  ctx.beginPath();ctx.arc(M.x,M.y,6,0,Math.PI*2);ctx.fillStyle=mg;ctx.fill();ctx.shadowBlur=0;
  ctx.fillStyle='rgba(255,180,195,.95)';ctx.font='600 13px sans-serif';
  ctx.textBaseline='bottom';ctx.fillText('อังคาร',M.x,M.y-8);

  // หัวเรื่อง
  ctx.textAlign='left';ctx.textBaseline='alphabetic';
  ctx.fillStyle='#9fd3ff';ctx.font='700 27px Georgia,serif';
  ctx.fillText('Heliocentric',30,46);
  ctx.fillStyle='rgba(159,211,255,.8)';ctx.font='600 19px sans-serif';
  ctx.fillText('ดวงอาทิตย์เป็นศูนย์กลาง',30,76);
  ctx.textAlign='right';ctx.fillStyle='rgba(255,255,255,.5)';ctx.font='400 15px sans-serif';
  ctx.fillText('Horatad · 11 Jun 2026',W-30,44);

  // ป้ายมุมบน
  ctx.textAlign='center';ctx.fillStyle='rgba(170,200,255,.55)';ctx.font='italic 500 15px sans-serif';
  ctx.fillText('① มุมมองจากนอกระบบ (กลไกจริง)',CX,CY-RING-16);

  // ===== แถบล่าง: ท้องฟ้าจากโลก =====
  ctx.save();
  ctx.beginPath();ctx.rect(PX0,PY0,PX1-PX0,PY1-PY0);
  ctx.fillStyle='rgba(4,8,22,.9)';ctx.fill();
  ctx.strokeStyle='rgba(120,150,220,.25)';ctx.lineWidth=1;ctx.stroke();
  ctx.clip();
  // ดาวฤกษ์พื้นหลัง (เลื่อนตามกล้อง)
  SKYSTARS.forEach(s=>{
    const x=PCx+GAINX*wrapPi(s.lon-LON0);
    if(x<PX0-4||x>PX1+4)return;
    ctx.globalAlpha=.5;ctx.fillStyle='#cfe0ff';
    ctx.beginPath();ctx.arc(x,s.y,s.r,0,Math.PI*2);ctx.fill();
  });ctx.globalAlpha=1;
  // เส้นทางอังคารในหมู่ดาว (trail = ห่วง retrograde)
  let prev=null;
  for(let k=210;k>=0;k--){
    const g=(frame-k)*SPEED;if(g<0){prev=null;continue;}
    const p=skyXY(g);if(p.x<PX0+6||p.x>PX1-6){prev=null;continue;}
    if(prev){
      const rt=isRetro(g),a=(1-k/210)*.9;
      ctx.globalAlpha=a;ctx.strokeStyle=rt?'#ff5252':'#86d2ff';ctx.lineWidth=rt?3:2;
      ctx.beginPath();ctx.moveTo(prev.x,prev.y);ctx.lineTo(p.x,p.y);ctx.stroke();
    }
    prev=p;
  }
  ctx.globalAlpha=1;
  // อังคารตอนนี้
  const sp=skyXY(f);
  ctx.shadowColor=retro?'#ff3344':'#ff6688';ctx.shadowBlur=16;
  const mg2=ctx.createRadialGradient(sp.x,sp.y,0,sp.x,sp.y,9);
  mg2.addColorStop(0,'#ffe0e6');mg2.addColorStop(1,retro?'#ff3344':'#ee5577');
  ctx.beginPath();ctx.arc(sp.x,sp.y,8,0,Math.PI*2);ctx.fillStyle=mg2;ctx.fill();ctx.shadowBlur=0;
  ctx.restore();

  // ป้าย/แคปชันแถบล่าง
  ctx.textAlign='left';ctx.fillStyle='rgba(170,200,255,.7)';ctx.font='italic 500 15px sans-serif';
  ctx.fillText('② ท้องฟ้ายามค่ำที่เรามองเห็นจากโลก',PX0+14,PY0+26);
  ctx.textAlign='center';
  if(retro){
    ctx.fillStyle='#ff6a6a';ctx.font='700 28px sans-serif';
    ctx.fillText('อังคารถอยหลัง = ภาพลวงตา',W/2,PY1+34);
    ctx.fillStyle='rgba(255,160,160,.92)';ctx.font='500 17px sans-serif';
    ctx.fillText('โลกวงในกำลังไล่แซง → เราเห็นอังคารวกถอยในหมู่ดาว',W/2,PY1+60);
  }else{
    ctx.fillStyle='rgba(180,210,255,.75)';ctx.font='500 18px sans-serif';
    ctx.fillText('โลกโคจรเร็วกว่า เดี๋ยวจะไล่แซงอังคาร',W/2,PY1+44);
  }
}

export function HelioDual(){
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
