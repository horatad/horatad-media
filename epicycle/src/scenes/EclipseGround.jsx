import {useCurrentFrame,AbsoluteFill,interpolate} from 'remotion';
import {useRef,useLayoutEffect} from 'react';

// ── อุปราคาแบบ B: สิ่งที่คนโบราณ "เห็นจริง" บนฟ้า (มุมเงยจากพื้นโลก) ──
// จานอาทิตย์–จันทร์ "โตเท่ากัน" → จันทร์เลื่อนมาบังอาทิตย์พอดี · กลางวันมืดราวค่ำ ดาวโผล่ = สุริยุปราคา ("ราหูอมตะวัน")
const W=1080,H=1080,SPEED=1;
const SKYY=820;                      // เส้นขอบฟ้า
const CXp=540,CYp=380;               // ตำแหน่งดวงอาทิตย์บนฟ้า
const R=92;                          // รัศมีจาน (อาทิตย์≈จันทร์)
const PERIOD=300;                    // จันทร์คืบผ่าน 1 รอบ
const STARS=Array.from({length:160},(_,i)=>({x:(Math.sin(i*127.1)*.5+.5),y:(Math.sin(i*311.7)*.5+.5)*0.7,r:i%7===0?1.6:.8,b:i*0.3}));
const CORONA=Array.from({length:90},(_,i)=>({a:i/90*Math.PI*2+Math.sin(i*53)*.1,len:1.5+Math.abs(Math.sin(i*31))*1.7}));

function draw(canvas,frame){
  const ctx=canvas.getContext('2d');const f=frame*SPEED;
  // ระยะเหลื่อมจาน: จันทร์เลื่อนจากขวาเข้าหาอาทิตย์ แล้วผ่านไป
  const phase=((f%PERIOD)/PERIOD);                  // 0..1
  const dx=(phase*2-1)*(R*3.2);                     // -3.2R .. +3.2R (จันทร์ผ่านซ้าย→ขวา)
  const cover=Math.max(0,1-Math.abs(dx)/(R*2));     // 0..1 (1=บังเต็ม)
  const total=Math.abs(dx)<R*0.32;                  // เต็มดวง
  const dark=Math.pow(cover,2.2);                   // ความมืดของฟ้า

  // ท้องฟ้า — กลางวันสว่าง → มืดลงตอนบัง
  const top=[`rgb(${Math.round(70-50*dark)},${Math.round(130-110*dark)},${Math.round(210-180*dark)})`];
  const bg=ctx.createLinearGradient(0,0,0,SKYY);
  bg.addColorStop(0,`rgb(${Math.round(40-30*dark)},${Math.round(70-58*dark)},${Math.round(140-120*dark)})`);
  bg.addColorStop(1,`rgb(${Math.round(150-120*dark)},${Math.round(170-130*dark)},${Math.round(210-150*dark)})`);
  ctx.fillStyle=bg;ctx.fillRect(0,0,W,SKYY);

  // ดาวโผล่ตอนมืด
  if(dark>0.4){ctx.globalAlpha=(dark-0.4)/0.6;STARS.forEach(s=>{ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(s.x*W,s.y*SKYY,s.r,0,7);ctx.fill();});ctx.globalAlpha=1;}

  // แสง twilight ที่ขอบฟ้า 360° ตอน total
  if(dark>0.5){const tw=ctx.createLinearGradient(0,SKYY-120,0,SKYY);tw.addColorStop(0,'rgba(255,120,40,0)');tw.addColorStop(1,`rgba(255,130,50,${(dark-0.5)*0.7})`);ctx.fillStyle=tw;ctx.fillRect(0,SKYY-120,W,120);}

  // โคโรนา (เห็นตอนใกล้เต็มดวง)
  if(cover>0.75){const k=(cover-0.75)/0.25;ctx.save();ctx.translate(CXp,CYp);
    const cg=ctx.createRadialGradient(0,0,R*0.9,0,0,R*2.4);cg.addColorStop(0,`rgba(255,250,230,${0.5*k})`);cg.addColorStop(1,'rgba(255,250,230,0)');
    ctx.fillStyle=cg;ctx.beginPath();ctx.arc(0,0,R*2.4,0,7);ctx.fill();
    ctx.strokeStyle=`rgba(255,252,235,${0.45*k})`;ctx.lineWidth=1;
    CORONA.forEach(c=>{ctx.beginPath();ctx.moveTo(Math.cos(c.a)*R*1.02,Math.sin(c.a)*R*1.02);ctx.lineTo(Math.cos(c.a)*R*c.len,Math.sin(c.a)*R*c.len);ctx.stroke();});
    ctx.restore();}

  // ดวงอาทิตย์
  ctx.save();ctx.beginPath();ctx.arc(CXp,CYp,R,0,7);ctx.clip();
  ctx.shadowColor='#fff3c0';ctx.shadowBlur=total?0:60;
  const sg=ctx.createRadialGradient(CXp,CYp,0,CXp,CYp,R);sg.addColorStop(0,'#fff8e0');sg.addColorStop(.7,'#ffd23a');sg.addColorStop(1,'#ff9810');
  ctx.fillStyle=sg;ctx.fillRect(CXp-R,CYp-R,R*2,R*2);ctx.restore();ctx.shadowBlur=0;

  // ดวงจันทร์ (จานมืด ขนาดเท่าอาทิตย์) เลื่อนมาบัง
  const mx=CXp+dx;
  ctx.beginPath();ctx.arc(mx,CYp,R,0,7);ctx.fillStyle=dark>0.5?'#0a0a12':'#14141e';ctx.fill();
  // diamond ring ก่อนเต็มดวงนิดเดียว
  if(cover>0.86&&!total){const edge=dx>0?-1:1;const bx=CXp+edge*R*0.96,by=CYp;ctx.shadowColor='#fff';ctx.shadowBlur=30;ctx.fillStyle='#ffffff';ctx.beginPath();ctx.arc(bx,by,7,0,7);ctx.fill();ctx.shadowBlur=0;}

  // พื้นดิน + ขอบฟ้า silhouette
  ctx.fillStyle='#05060a';ctx.fillRect(0,SKYY,W,H-SKYY);
  ctx.beginPath();ctx.moveTo(0,SKYY);
  const hill=[[0,0],[120,-26],[260,-12],[400,-40],[560,-18],[720,-46],[880,-20],[1080,-34]];
  hill.forEach(([x,y])=>ctx.lineTo(x,SKYY+y));ctx.lineTo(W,SKYY);ctx.lineTo(W,H);ctx.lineTo(0,H);ctx.closePath();
  ctx.fillStyle='#04050a';ctx.fill();

  // หัวเรื่อง
  ctx.textAlign='left';ctx.textBaseline='alphabetic';
  ctx.fillStyle='#e8d08a';ctx.font='700 31px Georgia,serif';ctx.fillText('อุปราคา — ที่คนโบราณเห็นบนฟ้า',40,62);
  ctx.fillStyle='rgba(230,208,138,.78)';ctx.font='500 18px sans-serif';ctx.fillText('จานอาทิตย์กับจานจันทร์ "โตเท่ากัน" → บังกันได้พอดี',40,92);
  ctx.textAlign='right';ctx.fillStyle='rgba(255,255,255,.5)';ctx.font='400 15px sans-serif';ctx.fillText('Horatad created · 11 June 2026',W-40,58);

  // แคปชันล่าง
  ctx.textAlign='center';
  if(total){ctx.fillStyle='#ffd24a';ctx.font='700 32px sans-serif';ctx.fillText('🌞 สุริยุปราคาเต็มดวง — "ราหูอมตะวัน"',W/2,H-58);
    ctx.fillStyle='rgba(255,230,170,.92)';ctx.font='500 18px sans-serif';ctx.fillText('กลางวันมืดราวค่ำ · ดาวโผล่ · เห็นแสงโคโรนารอบดวง',W/2,H-28);}
  else{ctx.fillStyle='rgba(210,220,255,.85)';ctx.font='500 19px sans-serif';ctx.fillText('ดวงจันทร์ค่อยๆ เลื่อนมาบังดวงอาทิตย์',W/2,H-40);}
}

export function EclipseGround({offset=0}={}){
  const frame=useCurrentFrame()+offset;const ref=useRef(null);
  useLayoutEffect(()=>{if(!ref.current)return;const c=ref.current;c.width=W;c.height=H;draw(c,frame);},[frame]);
  return(<AbsoluteFill style={{background:'#04050a'}}><canvas ref={ref} style={{width:W,height:H,position:'absolute'}}/></AbsoluteFill>);
}
