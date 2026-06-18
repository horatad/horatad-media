import {useCurrentFrame,AbsoluteFill,interpolate} from 'remotion';
import {useRef,useLayoutEffect} from 'react';
import {PLANETS,gP} from '../physics.js';
import {Caption} from '../Caption.jsx';
import {Narration} from '../Narration.jsx';
import {Music} from '../Music.jsx';
import {Credit} from '../Credit.jsx';
import * as T from '../timing-smiley.js';

// ── "จันทร์ยิ้ม" (Shorts 1080×1920) ──
// 1/3 แรก: ภาพท้องฟ้าหน้ายิ้มเต็มจอ → เลื่อนลงครึ่งล่าง · ครึ่งบนขึ้น epicycle เคลื่อนไหว
//   (ดาวโคจรจริง: เริ่มเรียงแนวเดียว = หน้ายิ้ม แล้วแยกออก → เห็นว่าจริงๆ คนละวงโคจร/ระยะ)
const W=1080,H=1920;
const STARS=Array.from({length:90},(_,i)=>({
  x:Math.sin(i*127.1)*.5+.5, y:(Math.sin(i*311.7)*.5+.5), r:i%13===0?1.1:0.6, tw:i*0.41
}));
// ตำแหน่งหน้ายิ้ม (เต็มจอ) + จุดศูนย์กลางกลุ่ม
const VENUS=[442,805], JUP=[652,838], MOON=[548,1095], MR=78;
const BC=[547,913];
const SLIDE_FROM=T.SEG[3].from, SLIDE_TO=T.SEG[4].from;   // เลื่อนลงช่วง seg3→4
const EPI=[540,470];                                     // ศูนย์ epicycle (ครึ่งบน)
const DISP={moon:92,venus:180,jupiter:288};              // รัศมีแสดงผล (เรียงชั้นชัด · ใกล้→ไกล)
const ESPEED=0.06;                                       // ความเร็วโคจร (visible motion)
const lerp=(a,b,t)=>a+(b-a)*t;
const sstep=t=>t*t*(3-2*t);

function planet(ctx,x,y,coreR,col){
  ctx.save();
  ctx.filter='blur(10px)';ctx.globalAlpha=0.45;ctx.fillStyle=col;
  ctx.beginPath();ctx.arc(x,y,coreR*4,0,7);ctx.fill();
  ctx.filter='blur(3px)';ctx.globalAlpha=0.8;ctx.beginPath();ctx.arc(x,y,coreR*1.7,0,7);ctx.fill();
  ctx.filter='none';ctx.globalAlpha=1;
  ctx.fillStyle='#fffdf6';ctx.beginPath();ctx.arc(x,y,coreR,0,7);ctx.fill();
  ctx.restore();
}
function realMoon(ctx,x,y,r,sky){
  const off=r*0.60;
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.filter='blur(12px)';
  ctx.fillStyle='rgba(220,228,245,0.11)';ctx.beginPath();ctx.arc(x,y+r*0.5,r*0.7,0,7);ctx.fill();
  ctx.filter='none';ctx.restore();
  ctx.save();ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.clip();
  const lit=ctx.createLinearGradient(0,y+r,0,y-r*0.2);
  lit.addColorStop(0,'#fefaee');lit.addColorStop(0.7,'#ece4cf');lit.addColorStop(1,'#cfc8b2');
  ctx.fillStyle=lit;ctx.fillRect(x-r,y-r,2*r,2*r);
  ctx.fillStyle=sky;ctx.beginPath();ctx.arc(x,y-off,r,0,7);ctx.fill();
  ctx.restore();
}
function label(ctx,t,x,y,col,size,w,align){
  ctx.fillStyle=col;ctx.font=(w||600)+' '+size+'px sans-serif';
  ctx.textAlign=align||'center';ctx.textBaseline='top';ctx.fillText(t,x,y);
}
const clampI=(f,a,b,c,d)=>interpolate(f,[a,b,c,d],[0,1,1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});

// epicycle ครึ่งบน — Earth center · จันทร์/ศุกร์/พฤหัส โคจร (เรียงชั้น) + เส้นเล็งจากโลก
// ef=0 (เรียงแนวเดียว) ตรงกับ seg6 (พากย์ "ทิศเดียวกัน") แล้วแกว่งเข้า/ออก
function drawEpicycle(ctx,frame,op){
  if(op<=0.01)return;
  const ALIGN=T.SEG[6].from;
  const ef=(frame-ALIGN)*ESPEED;
  const [cx,cy]=EPI;
  const defs={moon:'#dfe7ff',venus:'#9fd2ff',jupiter:'#ffbf6a'};
  const ids=['jupiter','venus','moon'];
  const ang=id=>{const p=PLANETS.find(q=>q.id===id);const r=gP(p,ef);return Math.atan2(r.y,r.x);};
  // วัดการเรียงแนว (spread เล็ก = เรียงตรง) → ไฮไลต์ตอนเรียง
  const A=ids.map(ang); const spread=Math.max(...A)-Math.min(...A);
  const aligned=Math.max(0,1-Math.abs(((spread+Math.PI)%(2*Math.PI))-Math.PI)/0.6);
  ctx.save();ctx.globalAlpha=op;
  // วงโคจร
  ids.forEach(id=>{ctx.beginPath();ctx.arc(cx,cy,DISP[id],0,7);
    ctx.strokeStyle='rgba(160,180,225,0.28)';ctx.lineWidth=1.2;ctx.setLineDash([4,9]);ctx.stroke();ctx.setLineDash([]);});
  // เส้นเล็งจากโลก ยิงออกขอบ
  ids.forEach(id=>{const a=ang(id);const Lx=cx+Math.cos(a)*430,Ly=cy+Math.sin(a)*430;
    ctx.globalAlpha=op*(0.35+0.45*aligned);ctx.strokeStyle=defs[id];ctx.lineWidth=1.6;ctx.setLineDash([5,7]);
    ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(Lx,Ly);ctx.stroke();ctx.setLineDash([]);ctx.globalAlpha=op;});
  // ดาว + ป้าย
  ids.forEach(id=>{const a=ang(id),R=DISP[id],x=cx+Math.cos(a)*R,y=cy+Math.sin(a)*R;
    // epicycle ring เล็ก (แต่งให้เป็นทรง epicycle) สำหรับ venus/jupiter
    if(id!=='moon'){ctx.strokeStyle='rgba(255,255,255,.22)';ctx.lineWidth=.8;
      ctx.beginPath();ctx.arc(x,y,id==='jupiter'?16:13,0,7);ctx.stroke();}
    ctx.fillStyle=defs[id];ctx.shadowColor=defs[id];ctx.shadowBlur=14;
    ctx.beginPath();ctx.arc(x,y,id==='moon'?6:7,0,7);ctx.fill();ctx.shadowBlur=0;
    label(ctx,PLANETS.find(q=>q.id===id).th,x+12,y-9,defs[id],21,700,'left');});
  // โลก
  const eg=ctx.createRadialGradient(cx,cy,0,cx,cy,17);
  eg.addColorStop(0,'#dff0ff');eg.addColorStop(1,'#5b8fd6');
  ctx.beginPath();ctx.arc(cx,cy,17,0,7);ctx.fillStyle=eg;ctx.fill();
  label(ctx,'โลก',cx,cy+22,'rgba(200,220,255,.92)',20,700);
  // ป้ายระยะ (ใกล้→ไกล) ที่ขอบวง
  label(ctx,'ใกล้สุด',cx,cy-DISP.moon-22,'rgba(223,231,255,.6)',16,600);
  label(ctx,'ไกลสุด',cx,cy-DISP.jupiter-22,'rgba(255,191,106,.6)',16,600);
  // ไฮไลต์ตอนเรียงแนว
  if(aligned>0.3){ctx.globalAlpha=op*aligned;
    label(ctx,'เรียงแนวเดียว → เห็นเป็นหน้ายิ้ม',cx,cy+DISP.jupiter+14,'#ffe08a',22,800);ctx.globalAlpha=op;}
  ctx.restore();
}

function draw(canvas,frame){
  const ctx=canvas.getContext('2d');
  const sky=ctx.createLinearGradient(0,0,0,H);
  sky.addColorStop(0.00,'#040406');sky.addColorStop(0.55,'#0a0b11');sky.addColorStop(1,'#15161e');
  ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
  STARS.forEach(s=>{ctx.globalAlpha=.05+Math.abs(Math.sin(s.tw+frame*.02))*.22;
    ctx.fillStyle='#dce6ff';ctx.beginPath();ctx.arc(s.x*W,s.y*H,s.r,0,7);ctx.fill();});
  ctx.globalAlpha=1;

  // slide: 0 = เต็มจอ · 1 = หน้ายิ้มย่อลงครึ่งล่าง
  const slide=sstep(interpolate(frame,[SLIDE_FROM,SLIDE_TO],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'}));
  const s=lerp(1,0.5,slide);
  const tcx=lerp(BC[0],540,slide), tcy=lerp(BC[1],1150,slide);
  const TP=([x,y])=>[tcx+(x-BC[0])*s, tcy+(y-BC[1])*s];
  const tw=1+0.06*Math.sin(frame*0.10);

  // epicycle ครึ่งบน (โผล่ตามการเลื่อน)
  drawEpicycle(ctx,frame,slide);

  // เส้นแบ่งบาง ๆ ระหว่างแผง (เมื่อเลื่อนแล้ว)
  if(slide>0.05){ctx.globalAlpha=slide*0.25;ctx.strokeStyle='rgba(150,170,220,.5)';ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(120,930);ctx.lineTo(960,930);ctx.stroke();ctx.globalAlpha=1;}

  // หน้ายิ้ม (สเกล/เลื่อนตาม slide)
  const [vx,vy]=TP(VENUS),[jx,jy]=TP(JUP),[mx,my]=TP(MOON), mr=MR*s;
  planet(ctx,vx,vy,4.6*s*tw,'rgba(255,248,225,1)');
  planet(ctx,jx,jy,3.4*s*tw,'rgba(255,232,185,1)');
  realMoon(ctx,mx,my,mr,sky);
  // ป้ายชื่อหน้ายิ้ม (จางช่วง intro)
  const lab=clampI(frame,T.SEG[1].from,T.SEG[1].from+15,SLIDE_FROM-5,SLIDE_FROM)*0.85;
  if(lab>0.02){ctx.globalAlpha=lab;
    label(ctx,'ศุกร์',vx,vy+16,'rgba(255,245,215,.9)',22,600);
    label(ctx,'พฤหัส',jx,jy+14,'rgba(255,230,180,.85)',22,600);
    label(ctx,'จันทร์',mx,my+mr+10,'rgba(223,231,255,.9)',22,600);
    ctx.globalAlpha=1;}

  // หัวข้อ
  ctx.textAlign='center';ctx.textBaseline='alphabetic';
  ctx.shadowColor='rgba(0,0,0,0.5)';ctx.shadowBlur=12;
  ctx.fillStyle='#fff';ctx.font='800 68px sans-serif';ctx.fillText('จันทร์ยิ้ม',W/2,140);
  const subOp=clampI(frame,0,20,T.SEG[1].from,T.SEG[1].from+20);
  if(subOp>0.02){ctx.globalAlpha=subOp;ctx.fillStyle='rgba(255,242,215,0.92)';ctx.font='600 28px sans-serif';
    ctx.fillText('ศุกร์ + พฤหัส = ตา · จันทร์เสี้ยว = ปาก',W/2,186);ctx.globalAlpha=1;}
  ctx.shadowBlur=0;
}

export function SmileyFace(){
  const frame=useCurrentFrame();
  const ref=useRef(null);
  useLayoutEffect(()=>{if(!ref.current)return;const c=ref.current;c.width=W;c.height=H;draw(c,frame);},[frame]);
  const fade=interpolate(frame,[0,15,T.DURATION-15,T.DURATION],[0,1,1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
  return(<AbsoluteFill style={{background:'#040406'}}>
    <AbsoluteFill style={{opacity:fade}}>
      <canvas ref={ref} style={{width:W,height:H,position:'absolute'}}/>
      <Caption timing={T}/>
      <Credit timing={T} label="based on" source="CONJUNCTION" sub="Moon · Venus · Jupiter · มิ.ย. ๒๕๖๙"/>
    </AbsoluteFill>
    <Narration timing={T} voDir="vo-smiley"/>
    <Music timing={T} music="audio/lunar-bgm-clip.mp3"/>
  </AbsoluteFill>);
}
