import {useCurrentFrame,AbsoluteFill,interpolate} from 'remotion';
import {useRef,useLayoutEffect} from 'react';

// ── ต้นแบบ "จันทร์ยิ้ม" (Shorts 1080×1920) — โหมดสมจริง (photoreal) ──
// A (0–7วิ): ภาพท้องฟ้าจริงพลบค่ำ — ศุกร์+พฤหัส = ตา · จันทร์เสี้ยวหงาย = ปาก
// B (7–15วิ): เฉลยเส้นเล็งจากโลก — เรียงทิศเดียวกัน แต่ห่างกันมหาศาล
const W=1080,H=1920;
const A_END=210, B_START=240, DUR=450;
const STARS=Array.from({length:90},(_,i)=>({
  x:Math.sin(i*127.1)*.5+.5, y:(Math.sin(i*311.7)*.5+.5)*0.5,
  r:i%13===0?1.1:0.6, tw:i*0.41
}));

// ดาวเคราะห์สมจริง: จุดสว่างเล็ก + bloom นุ่ม (ไม่มีแฉกการ์ตูน)
function planet(ctx,x,y,coreR,col){
  ctx.save();
  ctx.filter='blur(10px)';ctx.globalAlpha=0.45;ctx.fillStyle=col;
  ctx.beginPath();ctx.arc(x,y,coreR*4,0,7);ctx.fill();
  ctx.filter='blur(3px)';ctx.globalAlpha=0.8;
  ctx.beginPath();ctx.arc(x,y,coreR*1.7,0,7);ctx.fill();
  ctx.filter='none';ctx.globalAlpha=1;
  ctx.fillStyle='#fffdf6';ctx.beginPath();ctx.arc(x,y,coreR,0,7);ctx.fill();
  ctx.restore();
}
// จันทร์เสี้ยวสมจริง: earthshine + ขอบ terminator นุ่ม (blur) · เปิดขึ้น = ยิ้ม
function realMoon(ctx,x,y,r){
  // halo บางๆ เฉพาะรอบเสี้ยวสว่างล่าง (ไม่เรืองเป็นจานเต็ม)
  ctx.save();ctx.filter='blur(16px)';ctx.fillStyle='rgba(225,232,248,0.16)';
  ctx.beginPath();ctx.arc(x,y+r*0.42,r*0.85,0,7);ctx.fill();ctx.filter='none';ctx.restore();
  ctx.save();
  ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.clip();
  // ด้านสว่าง (cream) เต็มจาน — ไล่จากล่าง(สว่าง)→บน
  const lit=ctx.createLinearGradient(0,y+r,0,y-r);
  lit.addColorStop(0,'#fdf8ea');lit.addColorStop(0.55,'#ebe3ce');lit.addColorStop(1,'#cdc6b0');
  ctx.fillStyle=lit;ctx.fillRect(x-r,y-r,2*r,2*r);
  // คว้านด้านบนให้โปร่ง (ด้านมืดกลืนฟ้า ไม่เห็น) → เหลือเสี้ยวสว่างล่าง = ยิ้ม · ขอบนุ่ม
  ctx.globalCompositeOperation='destination-out';
  ctx.filter='blur(8px)';
  ctx.beginPath();ctx.arc(x,y-r*0.52,r*1.02,0,7);ctx.fill();
  ctx.filter='none';ctx.globalCompositeOperation='source-over';
  ctx.restore();
}
function label(ctx,t,x,y,col,size,w){
  ctx.fillStyle=col;ctx.font=(w||600)+' '+size+'px sans-serif';ctx.textAlign='center';ctx.textBaseline='top';
  ctx.fillText(t,x,y);
}

function draw(canvas,frame){
  const ctx=canvas.getContext('2d');
  // ── ท้องฟ้าพลบค่ำสมจริง (ไล่สี navy→ฟ้า→ส้มขอบฟ้า) ──
  const sky=ctx.createLinearGradient(0,0,0,H);
  sky.addColorStop(0.00,'#070c1c');sky.addColorStop(0.30,'#0e1b3a');
  sky.addColorStop(0.58,'#22315c');sky.addColorStop(0.74,'#5b5277');
  sky.addColorStop(0.84,'#b06a3a');sky.addColorStop(0.92,'#d98b48');sky.addColorStop(1,'#3a2418');
  ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
  // หมอกแสงเหนือขอบฟ้า (airglow)
  const haze=ctx.createRadialGradient(W/2,H*0.9,40,W/2,H*0.9,W*0.9);
  haze.addColorStop(0,'rgba(240,170,110,0.30)');haze.addColorStop(1,'transparent');
  ctx.fillStyle=haze;ctx.fillRect(0,0,W,H);
  // ดาวจางๆ น้อยๆ (พลบค่ำเห็นไม่กี่ดวง)
  STARS.forEach(s=>{ctx.globalAlpha=.04+Math.abs(Math.sin(s.tw+frame*.02))*.18;
    ctx.fillStyle='#dce6ff';ctx.beginPath();ctx.arc(s.x*W,s.y*H,s.r,0,7);ctx.fill();});
  ctx.globalAlpha=1;

  const venus=[442,805], jup=[652,838], moon=[548,1095], mR=78;
  const tw=1+0.06*Math.sin(frame*0.10);

  // === จังหวะ B: เฉลยเส้นเล็ง ===
  const bt=interpolate(frame,[B_START,DUR-20],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
  if(frame>=A_END){
    const ex=540,ey=1648;
    const k=interpolate(frame,[A_END,B_START],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
    [[venus,'rgba(255,242,192,'],[jup,'rgba(255,224,160,'],[moon,'rgba(223,231,255,']].forEach(([p,c])=>{
      ctx.strokeStyle=c+(0.55*k)+')';ctx.lineWidth=2;ctx.setLineDash([6,8]);
      ctx.beginPath();ctx.moveTo(ex,ey);ctx.lineTo(p[0],p[1]);ctx.stroke();ctx.setLineDash([]);
    });
    const eg=ctx.createRadialGradient(ex,ey,0,ex,ey,22);
    eg.addColorStop(0,'#dff0ff');eg.addColorStop(1,'#5b8fd6');
    ctx.beginPath();ctx.arc(ex,ey,22,0,7);ctx.fillStyle=eg;ctx.fill();
    label(ctx,'โลก (ตาเรา)',ex,ey+28,'rgba(200,220,255,.9)',24,600);
    if(bt>0.05){ctx.globalAlpha=bt;
      label(ctx,'จันทร์ ~384,000 กม.',moon[0]+165,moon[1]-6,'#dfe7ff',22,700);
      label(ctx,'ศุกร์ ~80 ล้าน กม.',venus[0]-150,venus[1]-44,'#fff2c0',22,700);
      label(ctx,'พฤหัส ~900 ล้าน กม.',jup[0]+40,jup[1]-46,'#ffe0a0',22,700);
      ctx.globalAlpha=1;}
  }

  // === 3 ดวง (สมจริง) ===
  planet(ctx,venus[0],venus[1],4.6*tw,'rgba(255,248,225,1)');   // ศุกร์ สว่างสุด
  planet(ctx,jup[0],jup[1],3.4*tw,'rgba(255,232,185,1)');       // พฤหัส
  realMoon(ctx,moon[0],moon[1],mR);                             // จันทร์เสี้ยวยิ้ม

  // ป้ายชื่อ (เล็ก จาง — A เด่น/B จาง)
  const aLab=interpolate(frame,[20,40,A_END,B_START],[0,1,1,0.3],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
  ctx.globalAlpha=aLab*0.85;
  label(ctx,'ศุกร์',venus[0],venus[1]+16,'rgba(255,245,215,.9)',22,600);
  label(ctx,'พฤหัส',jup[0],jup[1]+14,'rgba(255,230,180,.85)',22,600);
  label(ctx,'จันทร์',moon[0],moon[1]+mR+10,'rgba(223,231,255,.9)',22,600);
  ctx.globalAlpha=1;

  // ── หัวข้อ + วันที่ ──
  ctx.textAlign='center';ctx.textBaseline='alphabetic';
  ctx.shadowColor='rgba(0,0,0,0.5)';ctx.shadowBlur=12;
  ctx.fillStyle='#fff';ctx.font='800 70px sans-serif';ctx.fillText('จันทร์ยิ้ม',W/2,158);
  ctx.fillStyle='rgba(255,242,215,0.92)';ctx.font='600 29px sans-serif';
  ctx.fillText('ศุกร์ + พฤหัส = ตา · จันทร์เสี้ยว = ปาก',W/2,206);
  ctx.shadowBlur=0;
  if(bt>0.05){ctx.globalAlpha=Math.min(1,bt*1.4);
    ctx.fillStyle='#ffe08a';ctx.font='800 40px sans-serif';ctx.fillText('จริงๆ ห่างกันมหาศาล',W/2,1846);
    ctx.fillStyle='rgba(255,255,255,.92)';ctx.font='600 30px sans-serif';
    ctx.fillText('แค่บังเอิญอยู่ "ทิศเดียวกัน" จากโลก',W/2,1892);ctx.globalAlpha=1;
  }else{ctx.fillStyle='rgba(255,245,225,.82)';ctx.font='600 27px sans-serif';
    ctx.fillText('๑๖–๑๗ มิ.ย. ๒๕๖๙ · ทิศตะวันตก หลังตะวันตกดิน',W/2,1886);}
}

export function SmileyFace(){
  const frame=useCurrentFrame();
  const ref=useRef(null);
  useLayoutEffect(()=>{if(!ref.current)return;const c=ref.current;c.width=W;c.height=H;draw(c,frame);},[frame]);
  const fade=interpolate(frame,[0,15,DUR-15,DUR],[0,1,1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
  return(<AbsoluteFill style={{background:'#070c1c'}}>
    <AbsoluteFill style={{opacity:fade}}>
      <canvas ref={ref} style={{width:W,height:H,position:'absolute'}}/>
    </AbsoluteFill>
  </AbsoluteFill>);
}
