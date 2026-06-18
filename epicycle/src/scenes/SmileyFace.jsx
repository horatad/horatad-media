import {useCurrentFrame,AbsoluteFill,interpolate} from 'remotion';
import {useRef,useLayoutEffect} from 'react';

// ── ต้นแบบ "จันทร์ยิ้ม" (Shorts 1080×1920) ──
// จังหวะ A (0–7วิ): ภาพท้องฟ้าจริง — ศุกร์+พฤหัส = ตา · จันทร์เสี้ยวหงาย = ปากยิ้ม
// จังหวะ B (7–15วิ): เฉลยแบบเส้นเล็งจากโลก — เรียงทิศเดียวกัน แต่จริงๆ ห่างกันมหาศาล
const W=1080,H=1920;
const A_END=210, B_START=240, DUR=450;     // 30fps
const STARS=Array.from({length:260},(_,i)=>({
  x:Math.sin(i*127.1)*.5+.5, y:(Math.sin(i*311.7)*.5+.5)*0.62,
  r:i%11===0?1.6:i%3===0?.8:.4, tw:i*0.41
}));

// จานจันทร์มีเฟส (จาก MoonPhaseVert) — bright side หันตาม brightAngle
function drawMoonDisk(ctx,x,y,r,cosA,brightAngle){
  ctx.save();ctx.translate(x,y);ctx.rotate(brightAngle);
  const xt=r*cosA;
  ctx.beginPath();
  ctx.arc(0,0,r,-Math.PI/2,Math.PI/2,false);
  ctx.ellipse(0,0,Math.abs(xt),r,0,Math.PI/2,-Math.PI/2,xt>0?false:true);
  ctx.closePath();
  const g=ctx.createLinearGradient(-r,0,r,0);
  g.addColorStop(0,'#cfc9b6');g.addColorStop(1,'#fffef7');
  ctx.fillStyle=g;ctx.fill();ctx.restore();
}
// ดาวสว่าง + ประกาย (spike)
function star(ctx,x,y,r,col,glow){
  const g=ctx.createRadialGradient(x,y,0,x,y,r*glow);
  g.addColorStop(0,col);g.addColorStop(0.25,col);g.addColorStop(1,'transparent');
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r*glow,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#fffdf5';ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='rgba(255,253,240,0.5)';ctx.lineWidth=1.4;
  ctx.beginPath();ctx.moveTo(x-r*glow,y);ctx.lineTo(x+r*glow,y);ctx.moveTo(x,y-r*glow);ctx.lineTo(x,y+r*glow);ctx.stroke();
}
function label(ctx,t,x,y,col,size){
  ctx.fillStyle=col;ctx.font='700 '+size+'px sans-serif';ctx.textAlign='center';ctx.textBaseline='top';
  ctx.fillText(t,x,y);
}

function draw(canvas,frame){
  const ctx=canvas.getContext('2d');
  // ── ท้องฟ้าพลบค่ำ ──
  const sky=ctx.createLinearGradient(0,0,0,H);
  sky.addColorStop(0,'#0a1230');sky.addColorStop(0.45,'#16264f');
  sky.addColorStop(0.74,'#3a3a6a');sky.addColorStop(0.86,'#9c5a2e');sky.addColorStop(1,'#e0913f');
  ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
  // ดาวพื้นหลัง
  STARS.forEach(s=>{ctx.globalAlpha=.05+Math.abs(Math.sin(s.tw+frame*.02))*.30;
    ctx.fillStyle='#cfe0ff';ctx.beginPath();ctx.arc(s.x*W,s.y*H,s.r,0,Math.PI*2);ctx.fill();});
  ctx.globalAlpha=1;

  // ── ตำแหน่ง "หน้ายิ้ม" ──
  const venus=[430,800], jup=[660,830], moon=[545,1120], mR=92;
  const tw=1+0.12*Math.sin(frame*0.12);

  // === จังหวะ B: เฉลยเส้นเล็ง + ระยะจริง ===
  const bt=interpolate(frame,[B_START,DUR-20],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
  if(frame>=A_END){
    // โลกที่ฐาน
    const ex=540,ey=1660;
    const k=interpolate(frame,[A_END,B_START],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
    // เส้นเล็งจากโลก → 3 ดวง
    [[venus,'#fff2c0'],[jup,'#ffe0a0'],[moon,'#dfe7ff']].forEach(([p,c])=>{
      ctx.strokeStyle=c.replace(')',','+(0.5*k)+')').replace('#','rgba(').length?c:c;
      ctx.globalAlpha=0.5*k;ctx.strokeStyle=c;ctx.lineWidth=2;ctx.setLineDash([6,8]);
      ctx.beginPath();ctx.moveTo(ex,ey);ctx.lineTo(p[0],p[1]);ctx.stroke();ctx.setLineDash([]);
    });
    ctx.globalAlpha=1;
    // โลก
    const eg=ctx.createRadialGradient(ex,ey,0,ex,ey,22);
    eg.addColorStop(0,'#dff0ff');eg.addColorStop(1,'#5b8fd6');
    ctx.beginPath();ctx.arc(ex,ey,22,0,Math.PI*2);ctx.fillStyle=eg;ctx.fill();
    label(ctx,'โลก (ตาเรา)',ex,ey+28,'rgba(200,220,255,.9)',24);
    // ระยะจริง (โผล่ช่วง B)
    if(bt>0.05){
      ctx.globalAlpha=bt;
      label(ctx,'จันทร์ ~384,000 กม.',moon[0]+170,moon[1]-10,'#dfe7ff',22);
      label(ctx,'ศุกร์ ~80 ล้าน กม.',venus[0]-150,venus[1]-44,'#fff2c0',22);
      label(ctx,'พฤหัส ~900 ล้าน กม.',jup[0]+40,jup[1]-46,'#ffe0a0',22);
      ctx.globalAlpha=1;
    }
  }

  // === ดวงดาว 3 ดวง (อยู่ทั้ง A และ B) ===
  // ตา: ศุกร์ (สว่างกว่า) + พฤหัส
  star(ctx,venus[0],venus[1],11*tw,'rgba(255,245,210,0.95)',9);
  star(ctx,jup[0],jup[1],8*tw,'rgba(255,228,170,0.9)',7);
  // ปาก: จันทร์เสี้ยวหงาย (smile) — glow + เสี้ยว
  const halo=ctx.createRadialGradient(moon[0],moon[1],0,moon[0],moon[1],mR*2.0);
  halo.addColorStop(0,'rgba(230,238,255,0.30)');halo.addColorStop(1,'transparent');
  ctx.fillStyle=halo;ctx.beginPath();ctx.arc(moon[0],moon[1],mR*2,0,Math.PI*2);ctx.fill();
  // เสี้ยวบางหงายขึ้น = ยิ้ม (cosA ลบ=เสี้ยว · brightAngle=PI/2 หันสว่างลงล่าง→เปิดขึ้น)
  drawMoonDisk(ctx,moon[0],moon[1],mR,-0.72,Math.PI/2);

  // ป้ายชื่อ (จังหวะ A เด่น · จาง B)
  const aLab=interpolate(frame,[20,40,A_END,B_START],[0,1,1,0.25],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
  ctx.globalAlpha=aLab;
  label(ctx,'ศุกร์',venus[0],venus[1]+22,'rgba(255,245,210,.95)',26);
  label(ctx,'พฤหัส',jup[0],jup[1]+20,'rgba(255,228,170,.9)',26);
  label(ctx,'จันทร์เสี้ยว',moon[0],moon[1]+mR+14,'rgba(223,231,255,.95)',26);
  ctx.globalAlpha=1;

  // ── หัวข้อ + วันที่ ──
  ctx.textAlign='center';ctx.textBaseline='alphabetic';
  ctx.fillStyle='#fff';ctx.font='800 72px sans-serif';
  ctx.fillText('จันทร์ยิ้ม',W/2,160);
  ctx.fillStyle='rgba(255,240,210,0.9)';ctx.font='600 30px sans-serif';
  ctx.fillText('ศุกร์ + พฤหัส = ตา · จันทร์เสี้ยว = ปาก',W/2,210);
  // คำเฉลย (จังหวะ B)
  if(bt>0.05){
    ctx.globalAlpha=Math.min(1,bt*1.4);
    ctx.fillStyle='#ffe08a';ctx.font='800 40px sans-serif';
    ctx.fillText('จริงๆ ห่างกันมหาศาล',W/2,1850);
    ctx.fillStyle='rgba(255,255,255,.92)';ctx.font='600 30px sans-serif';
    ctx.fillText('แค่บังเอิญอยู่ "ทิศเดียวกัน" จากโลก',W/2,1895);
    ctx.globalAlpha=1;
  }else{
    ctx.fillStyle='rgba(255,255,255,.8)';ctx.font='600 28px sans-serif';
    ctx.fillText('๑๖–๑๗ มิ.ย. ๒๕๖๙ · ทิศตะวันตก หลังตะวันตกดิน',W/2,1888);
  }
}

export function SmileyFace(){
  const frame=useCurrentFrame();
  const ref=useRef(null);
  useLayoutEffect(()=>{if(!ref.current)return;const c=ref.current;c.width=W;c.height=H;draw(c,frame);},[frame]);
  const fade=interpolate(frame,[0,15,DUR-15,DUR],[0,1,1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
  return(<AbsoluteFill style={{background:'#0a1230'}}>
    <AbsoluteFill style={{opacity:fade}}>
      <canvas ref={ref} style={{width:W,height:H,position:'absolute'}}/>
    </AbsoluteFill>
  </AbsoluteFill>);
}
